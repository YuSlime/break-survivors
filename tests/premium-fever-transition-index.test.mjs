import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const action=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const integratorUrl=new URL('../tools/apply-premium-fever-transition-integration.mjs',import.meta.url);

test('runtime exposes the Premium FEVER transition using the current reduced-motion preference',()=>{
  assert.match(runtime,/fever-transition\.js/);
  assert.match(runtime,/function getFeverTransition\(\)/);
  assert.match(runtime,/buildFeverTransition\(\{reducedMotion\}\)/);
  assert.match(runtime,/\n    getFeverTransition,/);
});

test('FEVER transition integrator exists and both workflows execute it',()=>{
  assert.ok(fs.existsSync(integratorUrl),'FEVER transition integrator missing');
  assert.match(ci,/node tools\/apply-premium-fever-transition-integration\.mjs/);
  assert.match(action,/tools\/apply-premium-fever-transition-integration\.mjs/);
  assert.match(action,/node tools\/apply-premium-fever-transition-integration\.mjs/);
});

test('live FEVER start uses a staged precharge and burst instead of an immediate generic blast',()=>{
  assert.match(source,/PREMIUM FEVER TRANSITION V1/);
  assert.match(source,/function beginPremiumFeverTransition\(\)/);
  assert.match(source,/getFeverTransition\?\.\(\)/);
  assert.match(source,/premium-precharge/);
  assert.match(source,/premium-burst/);
  assert.match(source,/sequence\.prechargeMs/);
  assert.match(source,/signal\?\.\('fever'/);
  assert.match(source,/allowVfxCount\?\.\('particles',sequence\.particleCount,4\)/);
  assert.match(source,/beginPremiumFeverTransition\(\);/);
});

test('FEVER end has a dedicated release phase rather than disappearing abruptly',()=>{
  assert.match(source,/function endPremiumFeverTransition\(\)/);
  assert.match(source,/premium-release/);
  assert.match(source,/sequence\.releaseMs/);
  assert.match(source,/endPremiumFeverTransition\(\);/);
});

test('FEVER transition has dedicated gated audio cues',()=>{
  for(const cue of ['fever-charge','fever-burst','fever-release'])assert.ok(source.includes(`'${cue}'`),cue);
  assert.match(source,/cue==='fever-charge'/);
  assert.match(source,/cue==='fever-burst'/);
  assert.match(source,/cue==='fever-release'/);
});

test('FEVER gameplay balance values remain unchanged',()=>{
  assert.match(source,/const FEVER_DURATION=8\.0;/);
  assert.match(source,/feverActive\(\)\?1\.35:1/);
  assert.match(source,/feverActive\(\)\?1\.20:1/);
  assert.match(source,/name:'FEVER',coin:2\.20/);
});

test('FEVER transition integrator is guarded for idempotent reruns',()=>{
  assert.ok(fs.existsSync(integratorUrl),'FEVER transition integrator missing');
  const integrator=fs.readFileSync(integratorUrl,'utf8');
  assert.match(integrator,/PREMIUM FEVER TRANSITION V1/);
  assert.match(integrator,/already integrated/);
});
