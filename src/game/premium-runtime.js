import {resolveFeatureFlags} from '../config/features.js';
import {createIntensityDirector} from '../directors/intensity.js';
import {createCameraDirector} from '../directors/camera.js';
import {createEncounterDirector} from '../directors/encounter.js';
import {createAudioDirector} from '../directors/audio.js';
import {createVfxBudget,recommendVfxProfile} from '../presentation/vfx-budget.js';
import {resolveCombatFeedback as resolveCombatFeedbackProfile} from '../presentation/combat-feedback.js';
import {resolveDeathPresentation as resolveDeathPresentationProfile} from '../presentation/death-presentation.js';
import {resolveDamageNumber as resolveDamageNumberProfile} from '../presentation/damage-numbers.js';
import {buildBossDeathSequence} from '../presentation/boss-death-sequence.js';
import {buildFeverTransition} from '../presentation/fever-transition.js';
import {buildLimitBreakTransition} from '../presentation/limit-break-transition.js';
import {getStageEnvironment as getStageEnvironmentProfile} from '../data/stages-premium.js';
import {getSignatureMeterDefinition,getSignatureMeterValue,mountSignatureMeterHud} from '../ui/signature-meter.js';
import {mountIntensityOverlay} from '../ui/intensity-overlay.js';
import {mountBossRewardOverlay} from '../ui/boss-reward.js';
import {createHudFocusController} from '../ui/hud-focus.js';
import {buildTacticalThreatView,getTacticalEnemyMarker as getTacticalEnemyMarkerDefinition,mountTacticalThreatHud} from '../ui/tactical-threat.js';
import {getPremiumEnemyArchetype,pickPremiumEnemyArchetype,resolvePremiumEnemyAuras} from '../data/enemies-premium.js';
import {resolveVoidTyrantPhase,getVoidTyrantPhaseDefinition,buildVoidTyrantAttackPlan} from '../bosses/void-tyrant.js';
import {buildBossChestChoices,createBossRewardState,applyBossRewardChoice} from '../rewards/boss-chest.js';

const FOUNDATION_FLAGS=Object.freeze({
  intensityDirector:true,
  cameraDirector:true,
  vfxDirector:true,
  encounterDirector:true,
  audioDirector:true,
  premiumHud:true
});

const ZERO_CAMERA=Object.freeze({shake:0,zoom:1,kickX:0,kickY:0,hitStopMs:0});
const NEUTRAL_TACTICAL_AURAS=Object.freeze({speedMul:1,touchMul:1,damageTakenMul:1});

function parseStoredOverrides(stored){
  if(!stored)return {};
  try{
    const parsed=typeof stored==='string'?JSON.parse(stored):stored;
    return parsed&&typeof parsed==='object'?parsed:{};
  }catch(_){
    return {};
  }
}

export function resolveRuntimeFeatureOverrides({search='',stored=null}={}){
  const overrides={};
  try{
    const params=new URLSearchParams(String(search||''));
    if(params.get('premium')==='1')Object.assign(overrides,FOUNDATION_FLAGS);
    if(params.get('premiumCombat')==='1')overrides.combatV2=true;
    if(params.get('premiumBoss')==='1')overrides.bossV2=true;
    if(params.get('premiumStage')==='1')overrides.stagesV2=true;
  }catch(_){}
  Object.assign(overrides,parseStoredOverrides(stored));
  return resolveFeatureFlags(overrides);
}

export function createPremiumRuntime({
  flags={},
  reducedMotion=false,
  vfxProfile='high',
  calmSeconds=8,
  signatureHud=null,
  hudFocus=null,
  intensityOverlay=null,
  tacticalThreatHud=null,
  bossRewardUi=null
}={}){
  const resolved=resolveFeatureFlags(flags);
  const intensity=createIntensityDirector();
  const camera=createCameraDirector({reducedMotion});
  const encounter=createEncounterDirector({calmSeconds});
  const audio=createAudioDirector();
  const vfx=createVfxBudget({profile:vfxProfile});
  let cameraState={...ZERO_CAMERA};
  let lastIntensity=20;
  let lastAudioMix=null;
  let lastHudFocus=null;
  let lastSignatureMeter=0;
  let lastSignatureLabel='CORE';
  let lastTacticalThreat=buildTacticalThreatView();
  let bossRewardState=createBossRewardState();
  let bossRewardOpen=false;

  function signal(type,payload={}){
    if(!resolved.cameraDirector)return false;
    const cameraType={
      strongHit:'strongHit',
      critical:'critical',
      tacticalKill:'tacticalKill',
      eliteKill:'eliteKill',
      break:'break',
      fever:'fever',
      limitBreak:'limitBreak',
      bossKill:'bossKill'
    }[type];
    if(!cameraType)return false;
    return camera.impulse(cameraType,payload.direction||{x:0,y:0});
  }

  function updateFrame(dt,state={}){
    const delta=Math.max(0,Number(dt)||0);
    if(resolved.vfxDirector){
      vfx.beginFrame();
      if(Number.isFinite(state.avgFps)){
        const next=recommendVfxProfile(vfx.profile,state.avgFps);
        if(next!==vfx.profile)vfx.setProfile(next);
      }
    }
    if(resolved.encounterDirector)encounter.update(delta);
    lastIntensity=resolved.intensityDirector?intensity.update(delta,state):20;
    if(resolved.intensityDirector&&intensityOverlay){
      intensityOverlay.update({state,intensity:lastIntensity});
    }
    cameraState=resolved.cameraDirector?camera.update(delta):{...ZERO_CAMERA};
    lastAudioMix=resolved.audioDirector?audio.update(delta,state,lastIntensity):null;
    const hudView=resolved.premiumHud&&hudFocus?hudFocus.update(state):null;
    lastHudFocus=hudView?.focus??null;

    lastSignatureMeter=getSignatureMeterValue(state.characterId,state);
    lastSignatureLabel=getSignatureMeterDefinition(state.characterId).label;
    if(resolved.premiumHud&&signatureHud){
      signatureHud.update({characterId:state.characterId,signatureMeter:lastSignatureMeter});
    }

    lastTacticalThreat=resolved.combatV2
      ? buildTacticalThreatView({
          activeCounts:state.activeTacticalCounts,
          eliteCount:state.eliteCount,
          bossActive:state.bossActive
        })
      : buildTacticalThreatView();
    if(resolved.combatV2&&tacticalThreatHud)tacticalThreatHud.update(lastTacticalThreat);
    else tacticalThreatHud?.hide?.();

    return {
      intensity:lastIntensity,
      camera:cameraState,
      audio:lastAudioMix,
      hudFocus:lastHudFocus,
      vfxProfile:vfx.profile,
      recovery:encounter.recovery,
      signatureMeter:lastSignatureMeter,
      signatureLabel:lastSignatureLabel,
      tacticalThreat:lastTacticalThreat
    };
  }

  function allowVfx(kind,priority=1){
    if(!resolved.vfxDirector)return true;
    return vfx.trySpawn(kind,priority);
  }

  function allowVfxCount(kind,requested=1,priority=1){
    const amount=Math.max(0,Math.floor(Number(requested)||0));
    if(amount<=0)return 0;
    if(!resolved.vfxDirector)return amount;
    return vfx.reserve(kind,amount,priority);
  }

  function resolveCombatFeedback(context={}){
    const feedback=resolveCombatFeedbackProfile(context);
    if(!feedback)return null;
    if(feedback.event==='tacticalKill'&&!resolved.combatV2)return null;
    return feedback;
  }

  function resolveDeathPresentation(context={}){
    if(!resolved.vfxDirector)return null;
    return resolveDeathPresentationProfile(context);
  }

  function resolveDamageNumber(context={}){
    if(!resolved.vfxDirector)return null;
    return resolveDamageNumberProfile(context);
  }

  function getBossDeathSequence(){
    if(!resolved.vfxDirector)return null;
    return buildBossDeathSequence({reducedMotion});
  }

  function getFeverTransition(){
    if(!resolved.vfxDirector)return null;
    return buildFeverTransition({reducedMotion});
  }

  function getLimitBreakTransition(){
    if(!resolved.vfxDirector)return null;
    return buildLimitBreakTransition({reducedMotion});
  }

  function getStageEnvironment(id='neon-ruins'){
    if(!resolved.stagesV2)return null;
    return getStageEnvironmentProfile(id);
  }

  function pickTacticalEnemy(context={}){
    if(!resolved.combatV2)return null;
    return pickPremiumEnemyArchetype(context);
  }

  function getTacticalEnemyDefinition(id){
    if(!resolved.combatV2)return null;
    return getPremiumEnemyArchetype(id);
  }

  function getTacticalEnemyMarker(id){
    if(!resolved.combatV2)return null;
    return getTacticalEnemyMarkerDefinition(id);
  }

  function resolveTacticalAuras(target,enemies=[]){
    if(!resolved.combatV2)return {...NEUTRAL_TACTICAL_AURAS};
    return resolvePremiumEnemyAuras(target,enemies);
  }

  function resolveBossState(boss={}){
    if(!resolved.bossV2||boss?.type!=='boss')return null;
    const maxHp=Math.max(1,Number(boss.maxHp)||1);
    const hp=Math.max(0,Number(boss.hp)||0);
    const hpRatio=Math.max(0,Math.min(1,hp/maxHp));
    const phase=resolveVoidTyrantPhase(hpRatio);
    return Object.freeze({phase,hpRatio,definition:getVoidTyrantPhaseDefinition(phase)});
  }

  function nextBossAttack(boss={}){
    const state=resolveBossState(boss);
    if(!state)return null;
    return buildVoidTyrantAttackPlan({phase:state.phase,roll:boss.roll});
  }

  function prepareBossChest(context={}){
    if(!resolved.bossV2)return [];
    const rolls=Array.isArray(context.rolls)?context.rolls:[Math.random(),Math.random(),Math.random()];
    return buildBossChestChoices({...context,rolls});
  }

  function claimBossReward(choice,context={}){
    if(!resolved.bossV2)return null;
    bossRewardState=applyBossRewardChoice(bossRewardState,choice,context);
    return bossRewardState;
  }

  function presentBossChest(context={},onResolved=()=>{}){
    if(!resolved.bossV2||!bossRewardUi?.show)return false;
    const choices=prepareBossChest(context);
    if(!choices.length)return false;
    bossRewardOpen=true;
    bossRewardUi.show(choices,choice=>{
      const state=claimBossReward(choice,context);
      bossRewardOpen=false;
      onResolved({choice,state});
    });
    return true;
  }

  function reset(){
    intensity.reset();
    camera.reset();
    encounter.reset();
    audio.reset();
    vfx.beginFrame();
    cameraState={...ZERO_CAMERA};
    lastIntensity=20;
    lastAudioMix=resolved.audioDirector?audio.update(0,{},20):null;
    lastHudFocus=null;
    lastSignatureMeter=0;
    lastSignatureLabel='CORE';
    lastTacticalThreat=buildTacticalThreatView();
    bossRewardState=createBossRewardState();
    bossRewardOpen=false;
    bossRewardUi?.hide?.();
    tacticalThreatHud?.hide?.();
    if(resolved.premiumHud)hudFocus?.reset?.();
    signatureHud?.update?.({characterId:null,signatureMeter:0});
    if(resolved.intensityDirector&&intensityOverlay){
      intensityOverlay.update({state:{},intensity:20});
    }
  }

  return {
    flags:resolved,
    intensity,
    camera,
    encounter,
    audio,
    vfx,
    signal,
    updateFrame,
    allowVfx,
    allowVfxCount,
    resolveCombatFeedback,
    resolveDeathPresentation,
    resolveDamageNumber,
    getBossDeathSequence,
    getFeverTransition,
    getLimitBreakTransition,
    getStageEnvironment,
    pickTacticalEnemy,
    getTacticalEnemyDefinition,
    getTacticalEnemyMarker,
    resolveTacticalAuras,
    resolveBossState,
    nextBossAttack,
    prepareBossChest,
    claimBossReward,
    presentBossChest,
    reset,
    get intensityValue(){return lastIntensity},
    get cameraState(){return cameraState},
    get audioMix(){return lastAudioMix},
    get hudFocus(){return lastHudFocus},
    get signatureMeter(){return lastSignatureMeter},
    get signatureLabel(){return lastSignatureLabel},
    get tacticalThreat(){return lastTacticalThreat},
    get bossRewardState(){return bossRewardState},
    get bossRewardOpen(){return bossRewardOpen}
  };
}

function installBrowserRuntime(){
  let stored=null;
  try{stored=localStorage.getItem('break_survivors_premium_flags')}catch(_){}
  const flags=resolveRuntimeFeatureOverrides({search:location.search,stored});
  const reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  let profile='high';
  try{profile=localStorage.getItem('break_survivors_vfx_profile')||profile}catch(_){}
  if(innerWidth<=640 && profile==='high')profile='medium';

  const gameWrap=document.getElementById('gameWrap');
  const signatureHud=flags.premiumHud
    ? mountSignatureMeterHud({document,parent:gameWrap})
    : null;
  const hudFocus=flags.premiumHud
    ? createHudFocusController({document})
    : null;
  const intensityOverlay=flags.intensityDirector
    ? mountIntensityOverlay({document,parent:gameWrap})
    : null;
  const tacticalThreatHud=flags.combatV2
    ? mountTacticalThreatHud({document,parent:gameWrap})
    : null;
  const bossRewardUi=flags.bossV2
    ? mountBossRewardOverlay({document,parent:gameWrap})
    : null;
  const runtime=createPremiumRuntime({flags,reducedMotion,vfxProfile:profile,signatureHud,hudFocus,intensityOverlay,tacticalThreatHud,bossRewardUi});
  window.BreakPremiumRuntime=runtime;
  const active=['intensityDirector','cameraDirector','vfxDirector','encounterDirector','audioDirector','premiumHud','combatV2','bossV2','stagesV2'].some(k=>flags[k]);
  document.documentElement.dataset.premiumFoundation=active?'on':'off';
  return runtime;
}

if(typeof window!=='undefined'&&typeof document!=='undefined')installBrowserRuntime();
