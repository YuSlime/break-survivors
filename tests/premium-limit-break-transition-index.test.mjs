import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const action=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const integratorUrl=new URL('../tools/apply-premium-limit-break-transition-integration.mjs',import.meta.url);

test('runtime exposes the LIMIT BREAK entry transition with reduced-motion preference',()=>{
  assert.match(runtime,/limit-break-transition\.js/);
  assert.match(runtime,/function getLimitBreakTransition\(\)/);
  assert.match(runtime,/buildLimitBreakTransition\(\{reducedMotion\}\)/);
  assert.match(runtime,/\n    getLimitBreakTransition,/);
});

test('LIMIT BREAK transition integrator exists and both workflows execute it',()=>{
  assert.ok(fs.existsSync(integratorUrl),'LIMIT BREAK transition integrator missing');
  assert.match(ci,/node tools\/apply-premium-limit-break-transition-integration\.mjs/);
  assert.match(action,/tools\/apply-premium-limit-break-transition-integration\.mjs/);
  assert.match(action,/node tools\/apply-premium-limit-break-transition-integration\.mjs/);
});

test('normal LIMIT BREAK event start delegates to a staged calm lock ignite transition',()=>{
  assert.match(source,/PREMIUM LIMIT BREAK TRANSITION V1/);
  assert.match(source,/function beginPremiumLimitBreakTransition\(e\)/);
  assert.match(source,/getLimitBreakTransition\?\.\(\)/);
  assert.match(source,/premium-calm/);
  assert.match(source,/premium-lock/);
  assert.match(source,/premium-ignite/);
  assert.match(source,/for\(const beat of sequence\.beats\)/);
  assert.match(source,/allowVfxCount\?\.\('particles',beat\.particleCount,4\)/);
  assert.match(source,/beginPremiumLimitBreakTransition\(e\);/);
});

test('ignite starts the LIMIT BREAK music while direct starts remain immediate',()=>{
  assert.match(source,/if\(beat\.relight\)startLbEventMusic\(e\.type\)/);
  assert.match(source,/if\(direct\)\{\n    startLbEventMusic\(e\.type\);\n    startLbEventCombat\(e\);/);
});

test('LIMIT BREAK overlay classes are cleaned up when the splash is hidden',()=>{
  assert.match(source,/premiumLbTransitionToken\+\+/);
  assert.match(source,/classList\.remove\('show','premium-calm','premium-lock','premium-ignite'\)/);
});

test('LIMIT BREAK transition owns dedicated calm lock and ignite cues',()=>{
  for(const cue of ['lb-calm','lb-lock','lb-ignite'])assert.ok(source.includes(`'${cue}'`),cue);
  assert.match(source,/key==='lb-calm'/);
  assert.match(source,/key==='lb-lock'/);
  assert.match(source,/key==='lb-ignite'/);
});

test('LIMIT BREAK transition does not redefine event targets deadlines or rewards',()=>{
  const integrator=fs.readFileSync(integratorUrl,'utf8');
  assert.doesNotMatch(integrator,/e\.target\s*=/);
  assert.doesNotMatch(integrator,/e\.timeRemaining\s*=/);
  assert.doesNotMatch(integrator,/rewardMul\s*=/);
  assert.match(integrator,/PREMIUM LIMIT BREAK TRANSITION V1/);
  assert.match(integrator,/already integrated/);
});
