import test from 'node:test';
import assert from 'node:assert/strict';
import {createVfxBudget,VFX_PROFILES} from '../src/presentation/vfx-budget.js';

test('reserve grants the requested amount when budget has room',()=>{
  const budget=createVfxBudget({profile:'low'});
  assert.equal(budget.reserve('particles',12,1),12);
  assert.equal(budget.counts.particles,12);
});

test('reserve partially grants a request at the priority ceiling',()=>{
  const budget=createVfxBudget({profile:'low'});
  const lowPriorityCeiling=Math.floor(VFX_PROFILES.low.particles*.55);
  assert.equal(budget.reserve('particles',lowPriorityCeiling-4,1),lowPriorityCeiling-4);
  assert.equal(budget.reserve('particles',12,1),4);
  assert.equal(budget.counts.particles,lowPriorityCeiling);
});

test('higher priority can use capacity deliberately reserved from ordinary effects',()=>{
  const budget=createVfxBudget({profile:'low'});
  const ordinary=Math.floor(VFX_PROFILES.low.particles*.55);
  assert.equal(budget.reserve('particles',999,1),ordinary);
  const eliteGain=budget.reserve('particles',999,3);
  assert.ok(eliteGain>0);
  assert.equal(budget.counts.particles,Math.floor(VFX_PROFILES.low.particles*.82));
  const bossGain=budget.reserve('particles',999,5);
  assert.ok(bossGain>eliteGain);
  assert.equal(budget.counts.particles,VFX_PROFILES.low.particles);
});

test('reserve rejects invalid requests without consuming budget',()=>{
  const budget=createVfxBudget({profile:'medium'});
  assert.equal(budget.reserve('unknown',10,5),0);
  assert.equal(budget.reserve('particles',0,5),0);
  assert.equal(budget.reserve('particles',-5,5),0);
  assert.equal(budget.counts.particles,0);
});

test('trySpawn remains a one-unit compatibility wrapper around reserve',()=>{
  const budget=createVfxBudget({profile:'high'});
  assert.equal(budget.trySpawn('rings',2),true);
  assert.equal(budget.counts.rings,1);
});
