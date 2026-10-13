import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';
import {createRunBuildController} from '../src/game/run-build-controller.js';

function draftUi(){
  let visible=false,lastChoices=[];
  return {
    show(choices,context,onChoose){visible=true;lastChoices=choices;this.context=context;this.onChoose=onChoose},
    hide(){visible=false},
    get visible(){return visible},
    get choices(){return lastChoices}
  };
}

test('run build bridge stays neutral unless upgrade system V2 is enabled',()=>{
  const runtime=createPremiumRuntime({flags:{upgradeSystemV2:false}});
  const controller=createRunBuildController({runtime});
  assert.equal(controller.gainXp({type:'boss'}),null);
  assert.deepEqual(controller.prepareDraft('gunner'),[]);
  assert.equal(controller.open,false);
});

test('upgrade V2 controller earns run XP and queues draft levels from kills',()=>{
  const runtime=createPremiumRuntime({flags:{upgradeSystemV2:true}});
  const controller=createRunBuildController({runtime});
  let state=controller.getState();
  assert.equal(state.level,0);
  for(let i=0;i<18;i++)controller.gainXp({type:'normal'});
  state=controller.getState();
  assert.equal(state.level,1);
  assert.equal(state.pending,1);
});

test('controller prepares 3 normal 4 BREAK and 5 boss draft choices',()=>{
  const runtime=createPremiumRuntime({flags:{upgradeSystemV2:true}});
  const controller=createRunBuildController({runtime});
  const rng=()=>.31;
  assert.equal(controller.prepareDraft('gunner',{rng}).length,3);
  assert.equal(controller.prepareDraft('gunner',{breakActive:true,rng}).length,4);
  assert.equal(controller.prepareDraft('gunner',{bossReward:true,rng}).length,5);
});

test('presenting and claiming a draft owns the pause lifecycle and updates live effects',()=>{
  const ui=draftUi();
  const runtime=createPremiumRuntime({flags:{upgradeSystemV2:true}});
  const controller=createRunBuildController({runtime,ui});
  for(let i=0;i<18;i++)controller.gainXp({type:'normal'});
  const opened=controller.presentDraft('gunner',{rng:()=>0},()=>{});
  assert.equal(opened,true);
  assert.equal(controller.open,true);
  assert.ok(ui.choices.length>=3);
  const calibration=ui.choices.find(x=>x.id==='gunner-calibration')||ui.choices[0];
  ui.onChoose(calibration);
  assert.equal(controller.open,false);
  assert.equal(controller.getState().pending,0);
  const fx=controller.getEffects('gunner');
  if(calibration.id==='gunner-calibration')assert.ok(fx.damageMul>1);
});

test('run reset clears run-only build state and closes an open draft',()=>{
  const ui=draftUi();
  const runtime=createPremiumRuntime({flags:{upgradeSystemV2:true}});
  const controller=createRunBuildController({runtime,ui});
  for(let i=0;i<18;i++)controller.gainXp({type:'normal'});
  controller.presentDraft('gunner',{rng:()=>0},()=>{});
  controller.reset();
  assert.equal(controller.open,false);
  assert.equal(controller.getState().level,0);
  assert.equal(controller.getState().pending,0);
});
