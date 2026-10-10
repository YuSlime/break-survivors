import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioDirector,resolveAudioProfile} from '../src/directors/audio.js';

test('audio profiles follow the same climax hierarchy as Premium presentation',()=>{
  assert.equal(resolveAudioProfile({},20).mode,'calm');
  assert.equal(resolveAudioProfile({highDensity:true},35).mode,'pressure');
  assert.equal(resolveAudioProfile({breakActive:true},50).mode,'break');
  assert.equal(resolveAudioProfile({feverActive:true,breakActive:true},72).mode,'fever');
  assert.equal(resolveAudioProfile({limitBreakActive:true,feverActive:true},86).mode,'limit');
  assert.equal(resolveAudioProfile({bossFinalPhase:true,limitBreakActive:true},100).mode,'boss-final');
});

test('audio profile values stay inside safe mix bounds',()=>{
  for(const state of [{},{highDensity:true},{breakActive:true},{feverActive:true},{limitBreakActive:true},{bossFinalPhase:true}]){
    const mix=resolveAudioProfile(state,100);
    assert.ok(mix.attackPresence>=0.85&&mix.attackPresence<=1.12);
    assert.ok(mix.cutoffHz>=6500&&mix.cutoffHz<=13000);
    assert.ok(mix.atmosphereGain>=0&&mix.atmosphereGain<=0.08);
    assert.ok(mix.subHz>=36&&mix.subHz<=64);
    assert.ok(mix.airHz>=72&&mix.airHz<=150);
    assert.ok(mix.pulseHz>=0.6&&mix.pulseHz<=3.2);
  }
});

test('limit break deliberately darkens the attack bus while adding more low-end atmosphere',()=>{
  const fever=resolveAudioProfile({feverActive:true},72);
  const limit=resolveAudioProfile({limitBreakActive:true},86);
  assert.ok(limit.cutoffHz<fever.cutoffHz);
  assert.ok(limit.atmosphereGain>fever.atmosphereGain);
  assert.ok(limit.subHz<fever.subHz);
});

test('audio director eases between mixes instead of snapping every frame',()=>{
  const director=createAudioDirector({response:5});
  const calm=director.update(0,{},20);
  const first=director.update(.05,{bossFinalPhase:true},100);
  const later=director.update(.5,{bossFinalPhase:true},100);
  const target=resolveAudioProfile({bossFinalPhase:true},100);
  assert.equal(first.mode,'boss-final');
  assert.ok(first.atmosphereGain>calm.atmosphereGain);
  assert.ok(first.atmosphereGain<target.atmosphereGain);
  assert.ok(later.atmosphereGain>first.atmosphereGain);
  assert.ok(later.attackPresence>first.attackPresence);
});

test('audio director reset returns the mix to calm defaults',()=>{
  const director=createAudioDirector();
  director.update(1,{limitBreakActive:true},86);
  director.reset();
  const mix=director.update(0,{},20);
  const calm=resolveAudioProfile({},20);
  assert.equal(mix.mode,'calm');
  assert.equal(mix.attackPresence,calm.attackPresence);
  assert.equal(mix.atmosphereGain,calm.atmosphereGain);
});
