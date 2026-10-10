import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const action=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const integratorUrl=new URL('../tools/apply-premium-death-presentation-integration.mjs',import.meta.url);

test('runtime exposes Premium death presentation behind the VFX director',()=>{
  assert.match(runtime,/death-presentation\.js/);
  assert.match(runtime,/function resolveDeathPresentation\(context=\{\}\)/);
  assert.match(runtime,/if\(!resolved\.vfxDirector\)return null;/);
  assert.match(runtime,/resolveDeathPresentationProfile\(context\)/);
  assert.match(runtime,/\n    resolveDeathPresentation,/);
});

test('death presentation integrator exists and both workflows execute it',()=>{
  assert.ok(fs.existsSync(integratorUrl),'death presentation integrator missing');
  assert.match(ci,/node tools\/apply-premium-death-presentation-integration\.mjs/);
  assert.match(action,/tools\/apply-premium-death-presentation-integration\.mjs/);
  assert.match(action,/node tools\/apply-premium-death-presentation-integration\.mjs/);
});

test('live kill path resolves enemy-specific death presentation and respects VFX budgets',()=>{
  assert.match(source,/PREMIUM DEATH PRESENTATION V1/);
  assert.match(source,/resolveDeathPresentation\?\.\(\{enemyType:e\.type,overkill:meta\.overkill,color:e\.color\}\)/);
  assert.match(source,/allowVfxCount\?\.\('rings',1,premiumDeathFx\.priority\)/);
  assert.match(source,/allowVfxCount\?\.\('particles',premiumDeathFx\.particleCount,premiumDeathFx\.priority\)/);
  assert.match(source,/premiumDeathFx\.hitStopMs\/1000/);
});

test('runner tank and elite deaths have distinct live motion branches',()=>{
  assert.match(source,/premiumDeathFx\.style==='runner-shear'/);
  assert.match(source,/premiumDeathFx\.style==='heavy-crack'/);
  assert.match(source,/premiumDeathFx\.style==='core-rupture'/);
  assert.match(source,/premiumDeathFx\.secondaryRing/);
  assert.match(source,/premiumDeathFx\.coreBurst/);
});

test('Runner and Tank get restrained dedicated death cues without duplicating Elite audio',()=>{
  assert.match(source,/PREMIUM DEATH AUDIO V1/);
  assert.match(source,/if\(premiumDeathFx\.audioCue\)playPremiumCombatFeedbackSfx\(premiumDeathFx\.audioCue\)/);
  assert.ok(source.includes("'death-runner'"));
  assert.ok(source.includes("'death-tank'"));
  assert.match(source,/cue==='death-runner'/);
  assert.match(source,/cue==='death-tank'/);
});

test('legacy death VFX remains as fallback for enemy roles outside the new four profiles',()=>{
  assert.match(source,/if\(premiumDeathFx\)\{/);
  assert.match(source,/\}else\{\n    const premiumVfxPriority=/);
});

test('integrator is guarded by dedicated presentation and audio markers for idempotent reruns',()=>{
  assert.ok(fs.existsSync(integratorUrl),'death presentation integrator missing');
  const integrator=fs.readFileSync(integratorUrl,'utf8');
  assert.match(integrator,/PREMIUM DEATH PRESENTATION V1/);
  assert.match(integrator,/PREMIUM DEATH AUDIO V1/);
  assert.match(integrator,/already integrated/);
});
