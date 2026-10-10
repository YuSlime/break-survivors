import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveStageEnvironmentId,getStageEnvironment} from '../src/data/stages-premium.js';

test('run progression advances stage identity at major LIMIT BREAK milestones',()=>{
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:0}),'neon-ruins');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:2}),'neon-ruins');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:3}),'research-zero');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:4}),'research-zero');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:5}),'ash-wasteland');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:9}),'ash-wasteland');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:10}),'void-sector');
  assert.equal(resolveStageEnvironmentId({limitBreakLevel:99}),'void-sector');
});

test('invalid progression values fall back to NEON RUINS',()=>{
  for(const value of [undefined,null,-4,Number.NaN,'bad']){
    assert.equal(resolveStageEnvironmentId({limitBreakLevel:value}),'neon-ruins');
  }
});

test('resolved progression ids point to concrete immutable stage profiles',()=>{
  for(const level of [0,3,5,10]){
    const id=resolveStageEnvironmentId({limitBreakLevel:level});
    const stage=getStageEnvironment(id);
    assert.equal(stage.id,id);
    assert.equal(Object.isFrozen(stage),true);
  }
});
