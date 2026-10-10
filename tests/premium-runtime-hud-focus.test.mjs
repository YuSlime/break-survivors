import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

test('runtime forwards live frame state to HUD focus controller only when Premium HUD is enabled',()=>{
  const calls=[];
  const hudFocus={update:state=>{calls.push(state);return {focus:'boss'}},reset:()=>{}};
  const runtime=createPremiumRuntime({flags:{premiumHud:true},hudFocus});
  const state={bossActive:true,breakActive:true,threatActive:true};
  const frame=runtime.updateFrame(.016,state);
  assert.equal(calls.length,1);
  assert.equal(calls[0],state);
  assert.equal(frame.hudFocus,'boss');
});

test('runtime leaves legacy HUD unmanaged when Premium HUD is disabled',()=>{
  let updates=0;
  const hudFocus={update:()=>{updates++;return {focus:'boss'}},reset:()=>{}};
  const runtime=createPremiumRuntime({flags:{premiumHud:false},hudFocus});
  const frame=runtime.updateFrame(.016,{bossActive:true});
  assert.equal(updates,0);
  assert.equal(frame.hudFocus,null);
});

test('runtime reset clears HUD focus roles',()=>{
  let resets=0;
  const hudFocus={update:()=>({focus:'break'}),reset:()=>{resets++}};
  const runtime=createPremiumRuntime({flags:{premiumHud:true},hudFocus});
  runtime.updateFrame(.016,{breakActive:true});
  runtime.reset();
  assert.equal(resets,1);
});
