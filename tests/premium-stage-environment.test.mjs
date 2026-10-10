import test from 'node:test';
import assert from 'node:assert/strict';
import {getStageEnvironment,listStageEnvironments} from '../src/data/stages-premium.js';

test('NEON RUINS has a coherent dark neon environment profile',()=>{
  const stage=getStageEnvironment('neon-ruins');
  assert.equal(stage.id,'neon-ruins');
  assert.equal(stage.name,'NEON RUINS');
  assert.equal(stage.surface,'#07101b');
  assert.equal(stage.grid,'#10273a');
  assert.equal(stage.accent,'#56dfff');
  assert.equal(stage.danger,'#ff5f8e');
  assert.ok(stage.rainDensity>0);
  assert.ok(stage.hazeAlpha>0);
  assert.ok(stage.roadBands.length>=3);
  assert.ok(stage.neonPanels.length>=6);
  assert.ok(stage.puddles.length>=6);
});

test('NEON RUINS decorative anchors are deterministic and normalized to world space',()=>{
  const a=getStageEnvironment('neon-ruins');
  const b=getStageEnvironment('neon-ruins');
  assert.deepEqual(a,b);
  for(const group of [a.roadBands,a.neonPanels,a.puddles]){
    for(const item of group){
      for(const key of ['x','y','w','h'])assert.ok(item[key]>=0&&item[key]<=1,`${key} must be normalized`);
    }
  }
});

test('unknown stage ids fall back to NEON RUINS and stage snapshots are immutable',()=>{
  const stage=getStageEnvironment('missing');
  assert.equal(stage.id,'neon-ruins');
  assert.equal(Object.isFrozen(stage),true);
  assert.deepEqual(listStageEnvironments(),['neon-ruins']);
});
