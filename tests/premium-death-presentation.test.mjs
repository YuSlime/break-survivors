import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveDeathPresentation} from '../src/presentation/death-presentation.js';

const profile=type=>resolveDeathPresentation({enemyType:type,color:'#7fd8ff'});

test('normal death stays light and compact',()=>{
  const fx=profile('normal');
  assert.equal(fx.style,'pop');
  assert.equal(fx.priority,1);
  assert.ok(fx.particleCount<=9);
  assert.ok(fx.ringScale<1.9);
  assert.equal(fx.secondaryRing,false);
  assert.equal(fx.hitStopMs,0);
  assert.equal(fx.audioCue,null);
});

test('runner death shears forward with higher shard speed but stays lightweight',()=>{
  const normal=profile('normal');
  const fx=profile('runner');
  assert.equal(fx.style,'runner-shear');
  assert.ok(fx.speedMax>normal.speedMax);
  assert.ok(fx.directionalBias>=.65);
  assert.ok(fx.sizeMax<5);
  assert.equal(fx.secondaryRing,false);
  assert.equal(fx.audioCue,'death-runner');
});

test('tank death reads as heavy chunks with a slower secondary shock ring',()=>{
  const runner=profile('runner');
  const fx=profile('tank');
  assert.equal(fx.style,'heavy-crack');
  assert.equal(fx.priority,2);
  assert.equal(fx.secondaryRing,true);
  assert.ok(fx.sizeMin>=3.5);
  assert.ok(fx.speedMax<runner.speedMax);
  assert.ok(fx.ringLife>=.26);
  assert.ok(fx.hitStopMs>=14);
  assert.equal(fx.audioCue,'death-tank');
});

test('elite death exposes and ruptures a core before the widest two-stage shockwave',()=>{
  const tank=profile('tank');
  const fx=profile('elite');
  assert.equal(fx.style,'core-rupture');
  assert.equal(fx.priority,4);
  assert.equal(fx.secondaryRing,true);
  assert.equal(fx.coreBurst,true);
  assert.ok(fx.particleCount>tank.particleCount);
  assert.ok(fx.ringScale>tank.ringScale);
  assert.ok(fx.hitStopMs>=25);
  assert.equal(fx.audioCue,null,'Elite already owns its gated elite-kill cue');
});

test('unhandled enemy roles keep their existing death presentation',()=>{
  for(const type of ['shooter','boss','treasure','support','assassin','summoner','shielder']){
    assert.equal(profile(type),null,type);
  }
});

test('overkill amplifies a known death profile without changing its identity',()=>{
  const base=profile('tank');
  const overkill=resolveDeathPresentation({enemyType:'tank',overkill:true,color:'#7fd8ff'});
  assert.equal(overkill.style,base.style);
  assert.equal(overkill.audioCue,base.audioCue);
  assert.ok(overkill.particleCount>base.particleCount);
  assert.ok(overkill.ringScale>base.ringScale);
  assert.ok(overkill.speedMax>base.speedMax);
});
