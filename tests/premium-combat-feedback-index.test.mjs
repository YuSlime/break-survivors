import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const action=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const integratorUrl=new URL('../tools/apply-premium-combat-feedback-integration.mjs',import.meta.url);

test('combat feedback integrator exists and both workflows execute it',()=>{
  assert.ok(fs.existsSync(integratorUrl),'combat feedback integrator missing');
  assert.match(ci,/node tools\/apply-premium-combat-feedback-integration\.mjs/);
  assert.match(action,/tools\/apply-premium-combat-feedback-integration\.mjs/);
  assert.match(action,/node tools\/apply-premium-combat-feedback-integration\.mjs/);
});

test('critical hit path resolves Premium feedback and coordinates camera audio and budgeted VFX',()=>{
  assert.match(source,/resolveCombatFeedback\?\.\(\{event:'hit',critical:crit,enemyType:e\.type\}\)/);
  assert.match(source,/premiumHitFeedback\.cameraSignal/);
  assert.match(source,/playPremiumCombatFeedbackSfx\(premiumHitFeedback\.audioCue\)/);
  assert.match(source,/allowVfxCount\?\.\('rings',1,premiumHitFeedback\.priority\)/);
  assert.match(source,/allowVfxCount\?\.\('particles',premiumHitFeedback\.particleCount,premiumHitFeedback\.priority\)/);
});

test('kill path gives tactical and Elite enemies distinct feedback without double-firing legacy camera impulses',()=>{
  assert.match(source,/const premiumDeathEvent=e\.type==='boss'\?'bossKill':null;/);
  assert.match(source,/resolveCombatFeedback\?\.\(\{event:'kill',enemyType:e\.type,coinGain\}\)/);
  assert.match(source,/premiumKillFeedback\.cameraSignal/);
  assert.match(source,/playPremiumCombatFeedbackSfx\(premiumKillFeedback\.audioCue\)/);
  assert.match(source,/allowVfxCount\?\.\('rings',1,premiumKillFeedback\.priority\)/);
  assert.match(source,/allowVfxCount\?\.\('particles',premiumKillFeedback\.particleCount,premiumKillFeedback\.priority\)/);
  assert.match(source,/premiumKillFeedback\.label\+' \/\/ '\+premiumKillFeedback\.rewardLabel/);
  assert.match(source,/if\(!premiumKillFeedback&&!premiumDeathEvent\)shake=Math\.min\(16,shake\+deathShake\);/);
});

test('live feedback audio keeps separate gated cues for crit Elite and all tactical roles',()=>{
  assert.match(source,/function playPremiumCombatFeedbackSfx\(cue\)/);
  for(const cue of ['critical','elite-kill','tactical-support','tactical-assassin','tactical-summoner','tactical-shielder']){
    assert.ok(source.includes(`'${cue}'`),cue);
  }
});

test('integrator is guarded by a dedicated marker so reruns are idempotent',()=>{
  assert.ok(fs.existsSync(integratorUrl),'combat feedback integrator missing');
  const integrator=fs.readFileSync(integratorUrl,'utf8');
  assert.match(integrator,/PREMIUM COMBAT FEEDBACK V1/);
  assert.match(integrator,/already integrated/);
});
