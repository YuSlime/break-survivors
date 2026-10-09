import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime,resolveRuntimeFeatureOverrides} from '../src/game/premium-runtime.js';

test('runtime defaults to safe disabled flags',()=>{
  const runtime=createPremiumRuntime();
  assert.equal(runtime.flags.intensityDirector,false);
  assert.equal(runtime.flags.cameraDirector,false);
  assert.equal(runtime.flags.vfxDirector,false);
  assert.equal(runtime.flags.encounterDirector,false);
});

test('premium query opt-in enables only foundation systems',()=>{
  const flags=resolveRuntimeFeatureOverrides({search:'?premium=1',stored:null});
  assert.equal(flags.intensityDirector,true);
  assert.equal(flags.cameraDirector,true);
  assert.equal(flags.vfxDirector,true);
  assert.equal(flags.encounterDirector,true);
  assert.equal(flags.combatV2,false);
  assert.equal(flags.bossV2,false);
});

test('stored overrides can selectively change premium systems',()=>{
  const flags=resolveRuntimeFeatureOverrides({
    search:'',
    stored:JSON.stringify({cameraDirector:true,premiumHud:true,bossV2:true,unknown:true})
  });
  assert.equal(flags.cameraDirector,true);
  assert.equal(flags.premiumHud,true);
  assert.equal(flags.bossV2,true);
  assert.equal(flags.intensityDirector,false);
  assert.equal('unknown' in flags,false);
});

test('frame update drives intensity, camera decay, encounter recovery and vfx frame reset',()=>{
  const runtime=createPremiumRuntime({
    flags:{intensityDirector:true,cameraDirector:true,vfxDirector:true,encounterDirector:true}
  });
  runtime.signal('break');
  const first=runtime.updateFrame(.016,{breakActive:true,highDensity:true});
  assert.ok(first.intensity>20);
  assert.ok(first.camera.shake>0);
  assert.equal(runtime.allowVfx('particles',5),true);
  runtime.updateFrame(.016,{breakActive:true});
  assert.equal(runtime.vfx.counts.particles,0);
});

test('signals map major combat moments into camera impulses',()=>{
  const runtime=createPremiumRuntime({flags:{cameraDirector:true}});
  for(const type of ['critical','eliteKill','break','fever','limitBreak','bossKill']){
    assert.equal(runtime.signal(type,{direction:{x:1,y:0}}),true,type);
    const frame=runtime.updateFrame(.001,{});
    assert.ok(frame.camera.shake>0,type);
  }
});

test('vfx budget is bypassed when vfx director is disabled',()=>{
  const runtime=createPremiumRuntime({flags:{vfxDirector:false}});
  for(let i=0;i<1000;i++)assert.equal(runtime.allowVfx('particles',1),true);
});

test('runtime reset returns directors to calm state',()=>{
  const runtime=createPremiumRuntime({flags:{intensityDirector:true,cameraDirector:true,encounterDirector:true}});
  runtime.signal('limitBreak');
  runtime.updateFrame(.2,{limitBreakActive:true});
  runtime.reset();
  const frame=runtime.updateFrame(0,{});
  assert.equal(frame.intensity,20);
  assert.equal(frame.camera.shake,0);
  assert.equal(runtime.encounter.activeMajor,null);
});
