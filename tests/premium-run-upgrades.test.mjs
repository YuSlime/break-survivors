import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function importSource(path){
  const src=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}

test('run upgrade state starts neutral with a readable first XP target',async()=>{
  const {createRunUpgradeState}=await importSource('../src/systems/run-upgrades.js');
  const state=createRunUpgradeState();
  assert.equal(state.level,1);
  assert.equal(state.xp,0);
  assert.ok(state.xpNext>=8&&state.xpNext<=20);
  assert.deepEqual(state.ranks,{});
  assert.deepEqual(state.exclusive,{});
});

test('granting XP can cross multiple levels without losing overflow XP',async()=>{
  const {createRunUpgradeState,grantRunXp}=await importSource('../src/systems/run-upgrades.js');
  const start=createRunUpgradeState();
  const result=grantRunXp(start,100);
  assert.ok(result.levelsGained>=3);
  assert.equal(result.state.level,1+result.levelsGained);
  assert.ok(result.state.xp>=0&&result.state.xp<result.state.xpNext);
});

test('choice count follows normal BREAK and boss reward contexts',async()=>{
  const {createRunUpgradeState,buildCharacterUpgradeChoices}=await importSource('../src/systems/run-upgrades.js');
  const state=createRunUpgradeState();
  const rng=()=>0;
  assert.equal(buildCharacterUpgradeChoices('gunner',state,{},{rng}).length,3);
  assert.equal(buildCharacterUpgradeChoices('gunner',state,{breakActive:true},{rng}).length,4);
  assert.equal(buildCharacterUpgradeChoices('gunner',state,{bossReward:true},{rng}).length,5);
});

test('applying a Premium upgrade respects prerequisites and exclusive branches',async()=>{
  const {createRunUpgradeState,applyCharacterUpgrade}=await importSource('../src/systems/run-upgrades.js');
  let state=createRunUpgradeState();
  let blocked=applyCharacterUpgrade('gunner',state,'gunner-railstorm');
  assert.equal(blocked.applied,false);
  state=applyCharacterUpgrade('gunner',state,'gunner-ricochet').state;
  state=applyCharacterUpgrade('gunner',state,'gunner-thunder-crit').state;
  const evolved=applyCharacterUpgrade('gunner',state,'gunner-railstorm');
  assert.equal(evolved.applied,true);
  const pierce=applyCharacterUpgrade('gunner',evolved.state,'gunner-piercing');
  assert.equal(pierce.applied,true);
  const split=applyCharacterUpgrade('gunner',pierce.state,'gunner-split');
  assert.equal(split.applied,false);
});

test('STAT ranks resolve into actual primary damage multipliers',async()=>{
  const {createRunUpgradeState,applyCharacterUpgrade,resolveRunStatModifiers}=await importSource('../src/systems/run-upgrades.js');
  let state=createRunUpgradeState();
  state=applyCharacterUpgrade('gunner',state,'gunner-calibration').state;
  state=applyCharacterUpgrade('gunner',state,'gunner-calibration').state;
  const mods=resolveRunStatModifiers('gunner',state);
  assert.equal(mods.primaryDamageMul,1.24);
  assert.equal(mods.attackRateMul,1);
});
