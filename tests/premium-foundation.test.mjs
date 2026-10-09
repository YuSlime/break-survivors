import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function importSource(path){
  const src=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}

test('feature flags default to safe-off and allow explicit overrides',async()=>{
  const {DEFAULT_FEATURE_FLAGS,resolveFeatureFlags}=await importSource('../src/config/features.js');
  assert.equal(DEFAULT_FEATURE_FLAGS.intensityDirector,false);
  assert.equal(DEFAULT_FEATURE_FLAGS.cameraDirector,false);
  assert.equal(DEFAULT_FEATURE_FLAGS.vfxDirector,false);
  const flags=resolveFeatureFlags({intensityDirector:true,unknownFlag:true});
  assert.equal(flags.intensityDirector,true);
  assert.equal(flags.cameraDirector,false);
  assert.equal('unknownFlag' in flags,false);
  assert.equal(Object.isFrozen(flags),true);
});

test('intensity director maps gameplay states onto the approved hierarchy',async()=>{
  const {createIntensityDirector}=await importSource('../src/directors/intensity.js');
  const director=createIntensityDirector();
  assert.equal(director.targetFor({}),20);
  assert.equal(director.targetFor({highDensity:true}),35);
  assert.equal(director.targetFor({breakActive:true}),50);
  assert.equal(director.targetFor({eliteActive:true}),60);
  assert.equal(director.targetFor({feverActive:true}),72);
  assert.equal(director.targetFor({limitBreakActive:true}),86);
  assert.equal(director.targetFor({bossFinalPhase:true}),100);
});

test('intensity director uses the strongest simultaneous state and eases toward target',async()=>{
  const {createIntensityDirector}=await importSource('../src/directors/intensity.js');
  const director=createIntensityDirector({response:4,initial:20});
  assert.equal(director.targetFor({breakActive:true,feverActive:true}),72);
  const first=director.update(0.1,{feverActive:true});
  assert.ok(first>20 && first<72);
  const later=director.update(1,{feverActive:true});
  assert.ok(later>first && later<=72);
  assert.ok(director.value>=0 && director.value<=100);
});

test('camera director converts presentation events into bounded camera impulses',async()=>{
  const {createCameraDirector}=await importSource('../src/directors/camera.js');
  const camera=createCameraDirector();
  camera.impulse('strongHit',{x:1,y:0});
  let state=camera.update(1/60);
  assert.ok(state.kickX>0);
  assert.equal(state.kickY,0);
  assert.ok(state.zoom>=1 && state.zoom<=1.08);
  assert.ok(state.shake>=0 && state.shake<=16);

  camera.impulse('break');
  state=camera.update(1/60);
  assert.ok(state.zoom>1);

  camera.impulse('bossKill');
  state=camera.update(1/60);
  assert.ok(state.hitStopMs>=70 && state.hitStopMs<=100);
});

test('camera director reduces motion-heavy feedback without changing event semantics',async()=>{
  const {createCameraDirector}=await importSource('../src/directors/camera.js');
  const normal=createCameraDirector({reducedMotion:false});
  const reduced=createCameraDirector({reducedMotion:true});
  normal.impulse('limitBreak');
  reduced.impulse('limitBreak');
  const a=normal.update(1/60);
  const b=reduced.update(1/60);
  assert.ok(b.shake<a.shake);
  assert.ok(Math.abs(b.zoom-1)<Math.abs(a.zoom-1));
  assert.ok(b.hitStopMs<=a.hitStopMs);
});