import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

test('bulk VFX allowance bypasses limits when director is disabled',()=>{
  const runtime=createPremiumRuntime({flags:{vfxDirector:false}});
  assert.equal(runtime.allowVfxCount('particles',500,1),500);
  assert.equal(runtime.allowVfxCount('unknown',12,5),12);
});

test('bulk VFX allowance respects active profile and priority when enabled',()=>{
  const runtime=createPremiumRuntime({flags:{vfxDirector:true},vfxProfile:'low'});
  runtime.updateFrame(0,{});
  assert.equal(runtime.allowVfxCount('particles',999,1),99);
  assert.equal(runtime.allowVfxCount('particles',999,3),48);
  assert.equal(runtime.allowVfxCount('particles',999,5),33);
});

test('bulk VFX allowance sanitizes invalid requested counts',()=>{
  const runtime=createPremiumRuntime({flags:{vfxDirector:true}});
  assert.equal(runtime.allowVfxCount('particles',0,5),0);
  assert.equal(runtime.allowVfxCount('particles',-4,5),0);
});
