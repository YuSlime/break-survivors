import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

function draftUi(){
  let visible=false,lastChoices=[];
  return {
    show(choices,context,onChoose){visible=true;lastChoices=choices;this.context=context;this.onChoose=onChoose},
    hide(){visible=false},
    get visible(){return visible},
    get choices(){return lastChoices}
  };
}

test('run build bridge stays neutral unless combat V2 is enabled',()=>{
  const runtime=createPremiumRuntime({flags:{combatV2:false}});
  assert.equal(runtime.gainRunBuildXp({type:'boss'}),null);
  assert.deepEqual(runtime.prepareRunDraft('gunner'),[]);
  assert.equal(runtime.runUpgradeOpen,false);
});

test('combat V2 runtime earns run XP and queues draft levels from kills',()=>{
  const runtime=createPremiumRuntime({flags:{combatV2:true}});
  let state=runtime.getRunBuildState();
  assert.equal(state.level,0);
  for(let i=0;i<18;i++)runtime.gainRunBuildXp({type:'normal'});
  state=runtime.getRunBuildState();
  assert.equal(state.level,1);
  assert.equal(state.pending,1);
});

test('runtime prepares 3 normal 4 BREAK and 5 boss draft choices',()=>{
  const runtime=createPremiumRuntime({flags:{combatV2:true}});
  const rng=()=>.31;
  assert.equal(runtime.prepareRunDraft('gunner',{rng}).length,3);
  assert.equal(runtime.prepareRunDraft('gunner',{breakActive:true,rng}).length,4);
  assert.equal(runtime.prepareRunDraft('gunner',{bossReward:true,rng}).length,5);
});

test('presenting and claiming a draft owns the pause lifecycle and updates live effects',()=>{
  const ui=draftUi();
  const runtime=createPremiumRuntime({flags:{combatV2:true},runUpgradeUi:ui});
  for(let i=0;i<18;i++)runtime.gainRunBuildXp({type:'normal'});
  const opened=runtime.presentRunDraft('gunner',{rng:()=>0},()=>{});
  assert.equal(opened,true);
  assert.equal(runtime.runUpgradeOpen,true);
  assert.ok(ui.choices.length>=3);
  const calibration=ui.choices.find(x=>x.id==='gunner-calibration')||ui.choices[0];
  ui.onChoose(calibration);
  assert.equal(runtime.runUpgradeOpen,false);
  assert.equal(runtime.getRunBuildState().pending,0);
  const fx=runtime.getRunBuildEffects('gunner');
  if(calibration.id==='gunner-calibration')assert.ok(fx.damageMul>1);
});

test('run reset clears run-only build state and closes an open draft',()=>{
  const ui=draftUi();
  const runtime=createPremiumRuntime({flags:{combatV2:true},runUpgradeUi:ui});
  for(let i=0;i<18;i++)runtime.gainRunBuildXp({type:'normal'});
  runtime.presentRunDraft('gunner',{rng:()=>0},()=>{});
  runtime.reset();
  assert.equal(runtime.runUpgradeOpen,false);
  assert.equal(runtime.getRunBuildState().level,0);
  assert.equal(runtime.getRunBuildState().pending,0);
});
