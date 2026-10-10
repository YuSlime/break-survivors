import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

test('boss chest runtime bridge is disabled with boss V2 off',()=>{
  const runtime=createPremiumRuntime({flags:{bossV2:false}});
  assert.deepEqual(runtime.prepareBossChest({bossesDefeated:1,threat:3,rolls:[0,0,0]}),[]);
  assert.equal(runtime.claimBossReward({category:'legendary',id:'x',effects:{damageMul:1.2}},{}),null);
});

test('boss V2 runtime prepares three deterministic boss chest choices',()=>{
  const runtime=createPremiumRuntime({flags:{bossV2:true}});
  const choices=runtime.prepareBossChest({bossesDefeated:2,threat:4,rolls:[.1,.4,.8]});
  assert.equal(choices.length,3);
  assert.deepEqual(choices.map(x=>x.category),['legendary','resource','recovery']);
});

test('claiming legendary boss rewards updates run-only reward multipliers',()=>{
  const runtime=createPremiumRuntime({flags:{bossV2:true}});
  const [legendary]=runtime.prepareBossChest({bossesDefeated:1,threat:2,rolls:[0,0,0]});
  const next=runtime.claimBossReward(legendary,{hp:80,maxHp:100,ultCharge:20});
  assert.ok(next.damageMul>1);
  assert.equal(runtime.bossRewardState.damageMul,next.damageMul);
  assert.equal(runtime.bossRewardState.resourceDelta.coins,0);
});

test('claiming resource and recovery rewards returns deltas for the live game to apply',()=>{
  const runtime=createPremiumRuntime({flags:{bossV2:true}});
  const [,resource,recovery]=runtime.prepareBossChest({bossesDefeated:3,threat:5,rolls:[0,.5,.5]});
  const resourceState=runtime.claimBossReward(resource,{hp:40,maxHp:100,ultCharge:10});
  assert.ok(resourceState.resourceDelta.coins>0);
  assert.ok(resourceState.resourceDelta.gems>0);

  const recovered=runtime.claimBossReward(recovery,{hp:40,maxHp:100,ultCharge:10});
  assert.ok(recovered.hp>40);
  assert.ok(recovered.ultCharge>10);
});

test('runtime reset clears all run-only boss reward state',()=>{
  const runtime=createPremiumRuntime({flags:{bossV2:true}});
  const [legendary]=runtime.prepareBossChest({bossesDefeated:1,threat:2,rolls:[0,0,0]});
  runtime.claimBossReward(legendary,{hp:80,maxHp:100,ultCharge:20});
  assert.ok(runtime.bossRewardState.damageMul>1);
  runtime.reset();
  assert.equal(runtime.bossRewardState.damageMul,1);
  assert.deepEqual(runtime.bossRewardState.chosen,[]);
});
