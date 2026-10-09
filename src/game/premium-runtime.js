import {resolveFeatureFlags} from '../config/features.js';
import {createIntensityDirector} from '../directors/intensity.js';
import {createCameraDirector} from '../directors/camera.js';
import {createEncounterDirector} from '../directors/encounter.js';
import {createVfxBudget,recommendVfxProfile} from '../presentation/vfx-budget.js';

const FOUNDATION_FLAGS=Object.freeze({
  intensityDirector:true,
  cameraDirector:true,
  vfxDirector:true,
  encounterDirector:true
});

const ZERO_CAMERA=Object.freeze({shake:0,zoom:1,kickX:0,kickY:0,hitStopMs:0});

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
  }catch(_){}
  Object.assign(overrides,parseStoredOverrides(stored));
  return resolveFeatureFlags(overrides);
}

export function createPremiumRuntime({
  flags={},
  reducedMotion=false,
  vfxProfile='high',
  calmSeconds=8
}={}){
  const resolved=resolveFeatureFlags(flags);
  const intensity=createIntensityDirector();
  const camera=createCameraDirector({reducedMotion});
  const encounter=createEncounterDirector({calmSeconds});
  const vfx=createVfxBudget({profile:vfxProfile});
  let cameraState={...ZERO_CAMERA};
  let lastIntensity=20;

  function signal(type,payload={}){
    if(!resolved.cameraDirector)return false;
    const cameraType={
      strongHit:'strongHit',
      critical:'critical',
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
    cameraState=resolved.cameraDirector?camera.update(delta):{...ZERO_CAMERA};
    return {
      intensity:lastIntensity,
      camera:cameraState,
      vfxProfile:vfx.profile,
      recovery:encounter.recovery
    };
  }

  function allowVfx(kind,priority=1){
    if(!resolved.vfxDirector)return true;
    return vfx.trySpawn(kind,priority);
  }

  function reset(){
    intensity.reset();
    camera.reset();
    encounter.reset();
    vfx.beginFrame();
    cameraState={...ZERO_CAMERA};
    lastIntensity=20;
  }

  return {
    flags:resolved,
    intensity,
    camera,
    encounter,
    vfx,
    signal,
    updateFrame,
    allowVfx,
    reset,
    get intensityValue(){return lastIntensity},
    get cameraState(){return cameraState}
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
  const runtime=createPremiumRuntime({flags,reducedMotion,vfxProfile:profile});
  window.BreakPremiumRuntime=runtime;
  const active=['intensityDirector','cameraDirector','vfxDirector','encounterDirector'].some(k=>flags[k]);
  document.documentElement.dataset.premiumFoundation=active?'on':'off';
  return runtime;
}

if(typeof window!=='undefined'&&typeof document!=='undefined')installBrowserRuntime();
