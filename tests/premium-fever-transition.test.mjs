import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFeverTransition} from '../src/presentation/fever-transition.js';

test('fever transition has a short charge a decisive burst and a softer release',()=>{
  const fx=buildFeverTransition();
  assert.equal(fx.prechargeMs,110);
  assert.ok(fx.prechargeMs<160);
  assert.ok(fx.burstHoldMs>fx.prechargeMs);
  assert.ok(fx.releaseMs>=300);
  assert.equal(fx.cues.charge,'fever-charge');
  assert.equal(fx.cues.burst,'fever-burst');
  assert.equal(fx.cues.release,'fever-release');
  assert.ok(fx.particleCount>=24);
  assert.ok(fx.ringScale>=2);
});

test('reduced motion preserves the three semantic beats with lower visual load',()=>{
  const full=buildFeverTransition();
  const reduced=buildFeverTransition({reducedMotion:true});
  assert.ok(reduced.prechargeMs<full.prechargeMs);
  assert.ok(reduced.burstHoldMs<full.burstHoldMs);
  assert.ok(reduced.releaseMs<full.releaseMs);
  assert.ok(reduced.particleCount<full.particleCount);
  assert.ok(reduced.ringScale<full.ringScale);
  assert.deepEqual(reduced.cues,full.cues);
});

test('transition is presentation only and does not redefine FEVER balance values',()=>{
  const fx=buildFeverTransition();
  for(const key of ['duration','attackSpeed','moveSpeed','coinMultiplier']){
    assert.equal(key in fx,false,key);
  }
});

test('transition snapshots are immutable',()=>{
  const fx=buildFeverTransition();
  assert.equal(Object.isFrozen(fx),true);
  assert.equal(Object.isFrozen(fx.cues),true);
});
