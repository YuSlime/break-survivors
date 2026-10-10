import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveDamageNumber} from '../src/presentation/damage-numbers.js';

test('normal damage numbers stay compact and readable',()=>{
  const view=resolveDamageNumber({damage:286,crit:false,existingCount:4,impact:true});
  assert.equal(view.text,'286');
  assert.equal(view.kind,'normal');
  assert.ok(view.size<=13);
  assert.ok(view.life<=.40);
});

test('critical damage numbers are more prominent than normal hits',()=>{
  const normal=resolveDamageNumber({damage:286,crit:false,existingCount:4,impact:true});
  const crit=resolveDamageNumber({damage:1428,crit:true,existingCount:4,impact:true});
  assert.equal(crit.text,'1,428!');
  assert.equal(crit.kind,'critical');
  assert.ok(crit.size>normal.size);
  assert.ok(crit.life>normal.life);
  assert.ok(crit.weight>=1000);
});

test('screen clutter suppresses normal damage before critical damage',()=>{
  assert.equal(resolveDamageNumber({damage:240,crit:false,existingCount:22,impact:true}),null);
  const crit=resolveDamageNumber({damage:2100,crit:true,existingCount:22,impact:true});
  assert.equal(crit?.kind,'critical');
});

test('non-impact and invalid damage do not create numbers',()=>{
  assert.equal(resolveDamageNumber({damage:200,crit:false,existingCount:0,impact:false}),null);
  assert.equal(resolveDamageNumber({damage:0,crit:true,existingCount:0,impact:true}),null);
});
