import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSignatureMeterDefinition,
  getSignatureMeterValue,
  createSignatureMeterViewModel
} from '../src/ui/signature-meter.js';

const ids=['gunner','bombcat','thunderfox','blademaster','nova','missilequeen'];

test('all Premium characters expose their approved signature meter names',()=>{
  const expected={
    gunner:'MOMENTUM',bombcat:'CHAIN',thunderfox:'VOLTAGE',
    blademaster:'FLOW',nova:'RESONANCE',missilequeen:'TARGET LOCK'
  };
  for(const id of ids)assert.equal(getSignatureMeterDefinition(id).label,expected[id]);
});

test('Gunner reads its native momentum directly and clamps it',()=>{
  assert.equal(getSignatureMeterValue('gunner',{gunnerMomentum:64,attackCounters:{}}),64);
  assert.equal(getSignatureMeterValue('gunner',{gunnerMomentum:140,attackCounters:{}}),100);
  assert.equal(getSignatureMeterValue('gunner',{gunnerMomentum:-20,attackCounters:{}}),0);
});

test('attack-cycle characters build toward their existing signature cadence',()=>{
  const cases=[
    ['bombcat',4],['thunderfox',4],['blademaster',3],['nova',4],['missilequeen',3]
  ];
  for(const [id,cycle] of cases){
    assert.equal(getSignatureMeterValue(id,{attackCounters:{[id]:0}}),0,id+' empty');
    assert.ok(getSignatureMeterValue(id,{attackCounters:{[id]:1}})>0,id+' first');
    assert.equal(getSignatureMeterValue(id,{attackCounters:{[id]:cycle}}),100,id+' signature beat');
    assert.ok(getSignatureMeterValue(id,{attackCounters:{[id]:cycle+1}})<100,id+' next cycle');
  }
});

test('Blade Master awakened combo can use its five-step cadence',()=>{
  assert.equal(getSignatureMeterValue('blademaster',{attackCounters:{blademaster:5},characterLevel:50}),100);
  assert.equal(getSignatureMeterValue('blademaster',{attackCounters:{blademaster:4},characterLevel:50}),80);
});

test('view model exposes charged and full states for presentation',()=>{
  const charged=createSignatureMeterViewModel({characterId:'nova',value:82});
  assert.equal(charged.label,'RESONANCE');
  assert.equal(charged.percent,82);
  assert.equal(charged.state,'charged');
  assert.match(charged.valueText,/82%/);

  const full=createSignatureMeterViewModel({characterId:'missilequeen',value:100});
  assert.equal(full.state,'full');
  assert.equal(full.percent,100);
});

test('unknown characters degrade safely instead of crashing',()=>{
  const def=getSignatureMeterDefinition('unknown');
  assert.equal(def.label,'CORE');
  assert.equal(getSignatureMeterValue('unknown',{attackCounters:{}}),0);
});
