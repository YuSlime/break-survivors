import {mountRunUpgradeDraft} from '../ui/run-upgrade-draft.js';

function cloneState(state={}){
  return {...state,ranks:{...(state.ranks||{})},exclusive:{...(state.exclusive||{})}};
}

export function createRunBuildController({runtime=null,ui=null}={}){
  let state=runtime?.createRunBuild?.()||{level:0,xp:0,nextXp:18,pending:0,ranks:{},exclusive:{}};
  let open=false;

  function enabled(){return !!runtime?.flags?.upgradeSystemV2}
  function getState(){return cloneState(state)}
  function gainXp(source){
    if(!enabled())return null;
    state=runtime.gainRunBuildXp(state,source);
    return getState();
  }
  function getEffects(characterId){
    return runtime?.getRunEffects?.(characterId,state)||null;
  }
  function prepareDraft(characterId,context={}){
    if(!enabled())return [];
    return runtime.buildRunDraft(characterId,state,context);
  }
  function claim(characterId,choice){
    if(!enabled()||!choice||Math.max(0,Number(state.pending)||0)<=0)return null;
    state=runtime.applyRunChoice(state,choice);
    return {state:getState(),effects:getEffects(characterId),choice};
  }
  function presentDraft(characterId,context={},onResolved=()=>{}){
    if(!enabled()||!ui?.show||open||Math.max(0,Number(state.pending)||0)<=0)return false;
    const choices=prepareDraft(characterId,context);
    if(!choices.length)return false;
    const mode=context.bossReward?'boss':context.breakActive?'break':'normal';
    open=true;
    ui.show(choices,{mode},choice=>{
      const result=claim(characterId,choice);
      open=false;
      onResolved(result);
    });
    return true;
  }
  function reset(){
    state=runtime?.createRunBuild?.()||{level:0,xp:0,nextXp:18,pending:0,ranks:{},exclusive:{}};
    open=false;
    ui?.hide?.();
    return getState();
  }
  return {
    gainXp,getState,getEffects,prepareDraft,claim,presentDraft,reset,
    get open(){return open},
    get pending(){return Math.max(0,Number(state.pending)||0)}
  };
}

export function installRunBuildController({window=globalThis.window,document=globalThis.document}={}){
  const runtime=window?.BreakPremiumRuntime;
  if(!runtime?.flags?.upgradeSystemV2)return null;
  if(window.BreakRunBuild)return window.BreakRunBuild;
  const parent=document?.getElementById?.('gameWrap');
  const ui=parent?mountRunUpgradeDraft({document,parent}):null;
  const controller=createRunBuildController({runtime,ui});
  window.BreakRunBuild=controller;
  return controller;
}

if(typeof window!=='undefined'&&typeof document!=='undefined')installRunBuildController({window,document});
