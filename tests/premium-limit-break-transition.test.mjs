import test from 'node:test';
import assert from 'node:assert/strict';
import {buildLimitBreakTransition} from '../src/presentation/limit-break-transition.js';

test('LIMIT BREAK entry moves through calm lock and ignite beats',()=>{
  const fx=buildLimitBreakTransition();
  assert.deepEqual(fx.beats.map(beat=>beat.id),['calm','lock','ignite']);
  assert.equal(fx.beats[0].atMs,0);
  assert.ok(fx.beats[1].atMs>=100&&fx.beats[1].atMs<=220);
  assert.ok(fx.beats[2].atMs>fx.beats[1].atMs);
  assert.ok(fx.totalMs>=650&&fx.totalMs<=900);
  assert.equal(fx.cues.calm,'lb-calm');
  assert.equal(fx.cues.lock,'lb-lock');
  assert.equal(fx.cues.ignite,'lb-ignite');
});

test('ignite is the visual peak and owns the strongest ring and particle load',()=>{
  const fx=buildLimitBreakTransition();
  const [calm,lock,ignite]=fx.beats;
  assert.ok(calm.ringScale<lock.ringScale);
  assert.ok(lock.ringScale<ignite.ringScale);
  assert.ok(calm.particleCount<lock.particleCount);
  assert.ok(lock.particleCount<ignite.particleCount);
  assert.equal(ignite.relight,true);
});

test('reduced motion shortens entry while preserving semantic beats',()=>{
  const full=buildLimitBreakTransition();
  const reduced=buildLimitBreakTransition({reducedMotion:true});
  assert.deepEqual(reduced.beats.map(beat=>beat.id),full.beats.map(beat=>beat.id));
  assert.ok(reduced.totalMs<full.totalMs);
  for(let i=0;i<full.beats.length;i++){
    assert.ok(reduced.beats[i].atMs<=full.beats[i].atMs);
    assert.ok(reduced.beats[i].particleCount<=full.beats[i].particleCount);
    assert.ok(reduced.beats[i].ringScale<=full.beats[i].ringScale);
  }
});

test('LIMIT BREAK transition is presentation-only and immutable',()=>{
  const fx=buildLimitBreakTransition();
  for(const key of ['prepSeconds','deadline','target','rewardMul'])assert.equal(key in fx,false,key);
  assert.equal(Object.isFrozen(fx),true);
  assert.equal(Object.isFrozen(fx.beats),true);
  assert.equal(Object.isFrozen(fx.beats[0]),true);
  assert.equal(Object.isFrozen(fx.cues),true);
});
