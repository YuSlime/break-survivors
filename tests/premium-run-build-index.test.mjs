import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function includes(text,msg){assert.equal(html.includes(text),true,msg||text)}

test('run build controller is loaded after the Premium runtime',()=>{
  const runtime=html.indexOf('./src/game/premium-runtime.js');
  const controller=html.indexOf('./src/game/run-build-controller.js');
  assert.ok(runtime>=0);
  assert.ok(controller>runtime);
});

test('live simulation pauses while the run upgrade draft owns the choice lifecycle',()=>{
  includes('// PREMIUM RUN BUILD LIVE V1');
  includes('window.BreakRunBuild?.open');
  includes("if(window.BreakRunBuild?.open){if(refreshHud)updateHud();return}");
  includes('if(premiumRunMaybeDraft()){if(refreshHud)updateHud();return}');
});

test('enemy kills feed run XP and drafts use BREAK context',()=>{
  includes('window.BreakRunBuild?.gainXp?.(e)');
  includes('controller.presentDraft?.(currentCharacter.id');
  includes('breakActive:breakCombo>=10');
});

test('boss kill guarantees a pending five-choice boss draft',()=>{
  includes('window.BreakRunBuild?.ensureDraft?.()');
  includes('window.__premiumRunBossDraftPending=true');
  includes('bossReward=!!window.__premiumRunBossDraftPending');
});

test('reset clears run-only build state',()=>{
  includes('window.BreakRunBuild?.reset?.()');
  includes('window.__premiumRunBossDraftPending=false');
});

test('Gunner run effects are wired into live projectiles and primary attack rate',()=>{
  includes("window.BreakRunBuild?.getEffects?.('gunner')");
  includes('premiumGunnerFx?.damageMul');
  includes('premiumGunnerFx?.pierceAdd');
  includes('premiumGunnerFx?.ricochetChance');
  includes('premiumGunnerFx?.splitChance');
  includes('premiumGunnerFx?.thunderCrit');
  includes('premiumRunRateMul');
  includes('rate=ps.attackRate*premiumRunRateMul');
});

test('Bomb Cat run effects are wired into live payload, area, cluster and chain behavior',()=>{
  includes("window.BreakRunBuild?.getEffects?.('bombcat')");
  includes('premiumBombFx?.damageMul');
  includes('premiumBombFx?.radiusMul');
  includes('premiumBombFx?.clusterAdd');
  includes('premiumBombFx?.chainChanceAdd');
});
