import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

test('runtime forwards live state and computed intensity into battlefield overlay',()=>{
  let payload=null;
  const overlay={update(next){payload=next},destroy(){}};
  const runtime=createPremiumRuntime({
    flags:{intensityDirector:true},
    intensityOverlay:overlay
  });
  const state={breakActive:true,highDensity:true};
  const frame=runtime.updateFrame(.25,state);
  assert.ok(payload);
  assert.equal(payload.state,state);
  assert.equal(payload.intensity,frame.intensity);
  assert.ok(payload.intensity>20);
});

test('runtime does not drive overlay when intensity director is disabled',()=>{
  let calls=0;
  const overlay={update(){calls++}};
  const runtime=createPremiumRuntime({
    flags:{intensityDirector:false},
    intensityOverlay:overlay
  });
  runtime.updateFrame(.25,{limitBreakActive:true});
  assert.equal(calls,0);
});

test('runtime reset returns mounted battlefield overlay to calm presentation',()=>{
  const payloads=[];
  const overlay={update(next){payloads.push(next)}};
  const runtime=createPremiumRuntime({
    flags:{intensityDirector:true},
    intensityOverlay:overlay
  });
  runtime.updateFrame(.25,{bossFinalPhase:true});
  runtime.reset();
  const last=payloads.at(-1);
  assert.deepEqual(last.state,{});
  assert.equal(last.intensity,20);
});
