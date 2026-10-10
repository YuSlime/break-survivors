import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('live simulation pauses while Premium boss chest selection is open',()=>{
  assert.match(source,/BreakPremiumRuntime\?\.bossRewardOpen/);
});

test('boss death opens the dedicated Premium boss chest with current run context',()=>{
  assert.match(source,/presentBossChest\?\.\(\{/);
  assert.match(source,/bossesDefeated:runBosses/);
  assert.match(source,/threat:threatLevel/);
  assert.match(source,/ultCharge/);
});

test('live reward resolution applies resource and recovery choices explicitly',()=>{
  assert.match(source,/function applyPremiumBossRewardResult\(/);
  assert.match(source,/save\.coins\+=choice\.coins/);
  assert.match(source,/save\.gems\+=choice\.gems/);
  assert.match(source,/player\.hp=state\.hp/);
  assert.match(source,/ultCharge=state\.ultCharge/);
});

test('legendary boss boons feed directly into player combat stats for the rest of the run',()=>{
  assert.match(source,/const bossReward=window\.BreakPremiumRuntime\?\.bossRewardState/);
  assert.match(source,/damage\*=bossReward\.damageMul/);
  assert.match(source,/attackRate\*=bossReward\.attackRateMul/);
  assert.match(source,/move\*=bossReward\.moveMul/);
  assert.match(source,/area\*=bossReward\.areaMul/);
});

test('boss reward selection recomputes stats and persists resource rewards',()=>{
  assert.match(source,/ps=playerStats\(\)/);
  assert.match(source,/persistSoon\(\)/);
});
