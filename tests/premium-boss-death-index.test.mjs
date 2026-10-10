import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const action=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const integratorUrl=new URL('../tools/apply-premium-boss-death-integration.mjs',import.meta.url);

test('runtime exposes the boss death sequence and carries reduced-motion preference into it',()=>{
  assert.match(runtime,/boss-death-sequence\.js/);
  assert.match(runtime,/function getBossDeathSequence\(\)/);
  assert.match(runtime,/if\(!resolved\.vfxDirector\)return null;/);
  assert.match(runtime,/buildBossDeathSequence\(\{reducedMotion\}\)/);
  assert.match(runtime,/\n    getBossDeathSequence,/);
});

test('boss death integrator exists and both workflows execute it',()=>{
  assert.ok(fs.existsSync(integratorUrl),'boss death integrator missing');
  assert.match(ci,/node tools\/apply-premium-boss-death-integration\.mjs/);
  assert.match(action,/tools\/apply-premium-boss-death-integration\.mjs/);
  assert.match(action,/node tools\/apply-premium-boss-death-integration\.mjs/);
});

test('live boss kill path stages fracture core and rupture before presenting the chest',()=>{
  assert.match(source,/PREMIUM BOSS DEATH SEQUENCE V1/);
  assert.match(source,/function playPremiumBossDeathSequence\(e,sequence,onComplete\)/);
  assert.match(source,/getBossDeathSequence\?\.\(\)/);
  assert.match(source,/player\.hitCd=Math\.max\(player\.hitCd,sequence\.playerGuardMs\/1000\)/);
  assert.match(source,/for\(const stage of sequence\.stages\)/);
  assert.match(source,/setTimeout\(\(\)=>\{/);
  assert.match(source,/sequence\.chestDelayMs/);
  assert.match(source,/playPremiumBossDeathSequence\(e,premiumBossDeathSequence,presentPremiumBossChest\)/);
});

test('boss death beats use budgeted VFX and distinct sound cues',()=>{
  assert.match(source,/allowVfxCount\?\.\('rings',1,5\)/);
  assert.match(source,/allowVfxCount\?\.\('particles',stage\.particleCount,5\)/);
  assert.match(source,/playPremiumCombatFeedbackSfx\(stage\.cue\)/);
  for(const cue of ['boss-fracture','boss-core','boss-rupture'])assert.ok(source.includes(`'${cue}'`),cue);
  assert.match(source,/stage\.lootBurst/);
  assert.match(source,/VOID TYRANT PURGED/);
});

test('boss chest keeps an immediate fallback when the Premium sequence is unavailable',()=>{
  assert.match(source,/if\(premiumBossDeathSequence\)\{/);
  assert.match(source,/\}else\{\n      playEventSfx\('treasure_kill'/);
  assert.match(source,/presentPremiumBossChest\(\);/);
});

test('boss death integrator is guarded for idempotent reruns',()=>{
  assert.ok(fs.existsSync(integratorUrl),'boss death integrator missing');
  const integrator=fs.readFileSync(integratorUrl,'utf8');
  assert.match(integrator,/PREMIUM BOSS DEATH SEQUENCE V1/);
  assert.match(integrator,/already integrated/);
});
