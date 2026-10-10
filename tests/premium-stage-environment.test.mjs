import test from 'node:test';
import assert from 'node:assert/strict';
import {getStageEnvironment,listStageEnvironments} from '../src/data/stages-premium.js';

const EXPECTED_STAGES=['neon-ruins','research-zero','ash-wasteland','void-sector'];

function assertNormalizedAnchors(stage){
  for(const group of [stage.roadBands,stage.neonPanels,stage.puddles]){
    assert.ok(Array.isArray(group)&&group.length>0,`${stage.id} needs environment anchors`);
    for(const item of group){
      for(const key of ['x','y','w','h'])assert.ok(item[key]>=0&&item[key]<=1,`${stage.id} ${key} must be normalized`);
    }
  }
}

test('Premium Edition exposes the four approved stage identities in progression order',()=>{
  assert.deepEqual(listStageEnvironments(),EXPECTED_STAGES);
  assert.equal(getStageEnvironment('neon-ruins').name,'NEON RUINS');
  assert.equal(getStageEnvironment('research-zero').name,'RESEARCH ZERO');
  assert.equal(getStageEnvironment('ash-wasteland').name,'ASH WASTELAND');
  assert.equal(getStageEnvironment('void-sector').name,'VOID SECTOR');
});

test('NEON RUINS keeps its coherent dark neon environment profile',()=>{
  const stage=getStageEnvironment('neon-ruins');
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

test('RESEARCH ZERO reads as a cold lab with warning-light contrast',()=>{
  const stage=getStageEnvironment('research-zero');
  assert.equal(stage.motif,'laboratory');
  assert.match(stage.surface,/^#/);
  assert.notEqual(stage.accent,getStageEnvironment('neon-ruins').accent);
  assert.equal(stage.danger,'#ff5b67');
  assert.ok(stage.rainDensity<=.15,'indoor lab should not read as rainy');
  assert.ok(stage.neonPanels.length>=6);
});

test('ASH WASTELAND reads as a hot scorched field rather than a recolored city',()=>{
  const stage=getStageEnvironment('ash-wasteland');
  assert.equal(stage.motif,'wasteland');
  assert.equal(stage.accent,'#ff784d');
  assert.equal(stage.warm,'#ffcf63');
  assert.ok(stage.hazeAlpha>=.18);
  assert.ok(stage.rainDensity<=.1);
  assert.ok(stage.puddles.every(item=>item.color!==getStageEnvironment('neon-ruins').accent));
});

test('VOID SECTOR uses a distinct purple-black spatial identity',()=>{
  const stage=getStageEnvironment('void-sector');
  assert.equal(stage.motif,'void');
  assert.equal(stage.accent,'#c768ff');
  assert.equal(stage.danger,'#ff4fd8');
  assert.ok(stage.hazeAlpha>=.20);
  assert.ok(stage.neonPanels.length>=6);
});

test('all stage decorative anchors are deterministic, normalized, and immutable',()=>{
  for(const id of EXPECTED_STAGES){
    const a=getStageEnvironment(id);
    const b=getStageEnvironment(id);
    assert.deepEqual(a,b);
    assert.equal(Object.isFrozen(a),true);
    assertNormalizedAnchors(a);
  }
});

test('the four stage palettes remain visually distinct and unknown ids fall back to NEON RUINS',()=>{
  const palettes=EXPECTED_STAGES.map(id=>{
    const s=getStageEnvironment(id);
    return `${s.surface}|${s.accent}|${s.danger}|${s.haze}`;
  });
  assert.equal(new Set(palettes).size,EXPECTED_STAGES.length);
  assert.equal(getStageEnvironment('missing').id,'neon-ruins');
});
