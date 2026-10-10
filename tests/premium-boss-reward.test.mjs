import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOSS_REWARD_BOONS,
  buildBossChestChoices,
  createBossRewardState,
  applyBossRewardChoice
} from '../src/rewards/boss-chest.js';

test('boss chest always offers three clearly different reward categories',()=>{
  const choices=buildBossChestChoices({bossesDefeated:1,threat:3,rolls:[.1,.4,.8]});
  assert.equal(choices.length,3);
  assert.deepEqual(choices.map(x=>x.category),['legendary','resource','recovery']);
  assert.equal(new Set(choices.map(x=>x.id)).size,3);
});

test('legendary boss boons are run-defining but bounded multipliers',()=>{
  const ids=Object.keys(BOSS_REWARD_BOONS);
  assert.ok(ids.length>=4);
  for(const id of ids){
    const boon=BOSS_REWARD_BOONS[id];
    assert.match(boon.color,/^#[0-9a-f]{6}$/i);
    assert.ok(boon.label.length>0);
    const values=Object.values(boon.effects);
    assert.ok(values.length>0);
    for(const value of values)assert.ok(value>=1&&value<=1.4);
  }
});

test('resource reward scales with boss count and threat without runaway values',()=>{
  const early=buildBossChestChoices({bossesDefeated:1,threat:1,rolls:[0,0,0]})[1];
  const late=buildBossChestChoices({bossesDefeated:5,threat:5,rolls:[0,0,0]})[1];
  assert.ok(late.gems>early.gems);
  assert.ok(late.coins>early.coins);
  assert.ok(late.gems<=150);
  assert.ok(late.coins<=5000);
});

test('boss reward state stacks legendary boons multiplicatively and clamps recovery',()=>{
  let state=createBossRewardState();
  const first={category:'legendary',id:'annihilation',effects:{damageMul:1.25}};
  state=applyBossRewardChoice(state,first,{hp:40,maxHp:100,ultCharge:20});
  assert.equal(state.damageMul,1.25);

  const second={category:'legendary',id:'annihilation-2',effects:{damageMul:1.2}};
  state=applyBossRewardChoice(state,second,{hp:40,maxHp:100,ultCharge:20});
  assert.equal(Number(state.damageMul.toFixed(2)),1.5);

  const recovered=applyBossRewardChoice(state,{category:'recovery',id:'renewal',healRatio:.45,ultGain:55},{hp:80,maxHp:100,ultCharge:70});
  assert.equal(recovered.hp,100);
  assert.equal(recovered.ultCharge,100);
});

test('resource choice reports deltas without mutating external save objects',()=>{
  const state=createBossRewardState();
  const next=applyBossRewardChoice(state,{category:'resource',id:'cache',coins:900,gems:35},{hp:50,maxHp:100,ultCharge:0});
  assert.deepEqual(next.resourceDelta,{coins:900,gems:35});
  assert.equal(state.resourceDelta.coins,0);
  assert.equal(state.resourceDelta.gems,0);
});
