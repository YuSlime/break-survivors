import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBossDeathSequence} from '../src/presentation/boss-death-sequence.js';

test('boss death sequence has ordered fracture core and rupture beats before the reward chest',()=>{
  const seq=buildBossDeathSequence();
  assert.deepEqual(seq.stages.map(stage=>stage.id),['fracture','core','rupture']);
  assert.ok(seq.stages[0].atMs<seq.stages[1].atMs);
  assert.ok(seq.stages[1].atMs<seq.stages[2].atMs);
  assert.ok(seq.chestDelayMs>seq.stages.at(-1).atMs);
  assert.ok(seq.playerGuardMs>=seq.chestDelayMs);
});

test('rupture is the visual climax rather than every beat being equally loud',()=>{
  const seq=buildBossDeathSequence();
  const [fracture,core,rupture]=seq.stages;
  assert.ok(fracture.particleCount<core.particleCount);
  assert.ok(core.particleCount<rupture.particleCount);
  assert.ok(fracture.ringScale<core.ringScale);
  assert.ok(core.ringScale<rupture.ringScale);
  assert.equal(rupture.cue,'boss-rupture');
  assert.equal(rupture.lootBurst,true);
});

test('reduced motion keeps the semantic sequence but lowers particle load and shortens staging',()=>{
  const full=buildBossDeathSequence();
  const reduced=buildBossDeathSequence({reducedMotion:true});
  assert.deepEqual(reduced.stages.map(stage=>stage.id),full.stages.map(stage=>stage.id));
  assert.ok(reduced.chestDelayMs<full.chestDelayMs);
  for(let i=0;i<full.stages.length;i++){
    assert.ok(reduced.stages[i].particleCount<=full.stages[i].particleCount);
    assert.ok(reduced.stages[i].ringScale<=full.stages[i].ringScale);
  }
});

test('sequence values are immutable snapshots',()=>{
  const seq=buildBossDeathSequence();
  assert.equal(Object.isFrozen(seq),true);
  assert.equal(Object.isFrozen(seq.stages),true);
  assert.equal(Object.isFrozen(seq.stages[0]),true);
});
