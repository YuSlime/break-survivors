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

test('live loop pauses cleanly while an upgrade draft is open',()=>{
  includes('window.BreakRunBuild?.open');
  includes('PREMIUM RUN BUILD LIVE V1');
});

test('enemy kills feed run XP and drafts use BREAK context',()=>{
  includes('window.BreakRunBuild?.gainXp?.(e)');
  includes('window.BreakRunBuild?.presentDraft?.(currentCharacter.id');
  includes('breakActive:breakCombo>=10');
});

test('reset clears run-only build state',()=>{
  includes('window.BreakRunBuild?.reset?.()');
});

test('Gunner bullets consume live run effects',()=>{
  includes("window.BreakRunBuild?.getEffects?.('gunner')");
  includes('premiumGunnerFx?.pierceAdd');
  includes('premiumGunnerFx?.ricochetChance');
  includes('premiumGunnerFx?.splitChance');
  includes('premiumGunnerFx?.damageMul');
});

test('Bomb Cat payload consumes live run effects',()=>{
  includes("window.BreakRunBuild?.getEffects?.('bombcat')");
  includes('premiumBombFx?.clusterAdd');
  includes('premiumBombFx?.chainChanceAdd');
  includes('premiumBombFx?.radiusMul');
  includes('premiumBombFx?.damageMul');
});

test('run attack-rate modifiers feed the primary cooldown calculation',()=>{
  includes('premiumRunRateMul');
  includes('rate=ps.attackRate');
});
