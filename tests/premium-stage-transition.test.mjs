import test from 'node:test';
import assert from 'node:assert/strict';
import {getStageTransitionCue} from '../src/data/stages-premium.js';

test('SECTOR SHIFT only appears when LIMIT BREAK progression crosses into a new stage',()=>{
  for(const pair of [[0,2],[3,4],[5,9],[10,12]]){
    assert.equal(getStageTransitionCue({fromLimitBreak:pair[0],toLimitBreak:pair[1]}),null);
  }

  assert.equal(getStageTransitionCue({fromLimitBreak:2,toLimitBreak:3})?.stageId,'research-zero');
  assert.equal(getStageTransitionCue({fromLimitBreak:4,toLimitBreak:5})?.stageId,'ash-wasteland');
  assert.equal(getStageTransitionCue({fromLimitBreak:9,toLimitBreak:10})?.stageId,'void-sector');
});

test('SECTOR SHIFT cue carries stage identity without redefining gameplay balance',()=>{
  const cue=getStageTransitionCue({fromLimitBreak:2,toLimitBreak:3});
  assert.equal(cue.title,'SECTOR SHIFT');
  assert.equal(cue.stageName,'RESEARCH ZERO');
  assert.equal(cue.color,'#b8efff');
  assert.ok(cue.delayMs>=220&&cue.delayMs<=420);
  assert.ok(cue.displayMs>=420&&cue.displayMs<=700);
  for(const forbidden of ['damage','reward','enemy','hp','density'])assert.equal(forbidden in cue,false);
});

test('large progression jumps resolve directly to the final destination sector',()=>{
  const cue=getStageTransitionCue({fromLimitBreak:2,toLimitBreak:10});
  assert.equal(cue.stageId,'void-sector');
  assert.equal(cue.stageName,'VOID SECTOR');
  assert.equal(cue.toLimitBreak,10);
});

test('SECTOR SHIFT snapshots are immutable and invalid values do not create false transitions',()=>{
  const cue=getStageTransitionCue({fromLimitBreak:4,toLimitBreak:5});
  assert.equal(Object.isFrozen(cue),true);
  assert.equal(getStageTransitionCue({fromLimitBreak:'bad',toLimitBreak:'bad'}),null);
  assert.equal(getStageTransitionCue({fromLimitBreak:5,toLimitBreak:4}),null);
});
