import {PREMIUM_UPGRADES} from '../data/upgrades.js';
import {buildUpgradeChoices,eligibleUpgrades,applyUpgrade} from './upgrades.js';

const clampInt=(n,min=0)=>Math.max(min,Math.floor(Number(n)||0));

export function xpNeededForLevel(level=1){
  const lv=Math.max(1,clampInt(level,1));
  return Math.max(12,Math.round(12*Math.pow(1.22,lv-1)));
}

export function createRunUpgradeState(seed={}){
  const level=Math.max(1,clampInt(seed.level||1,1));
  return {
    level,
    xp:Math.max(0,Number(seed.xp)||0),
    xpNext:xpNeededForLevel(level),
    ranks:{...(seed.ranks||{})},
    exclusive:{...(seed.exclusive||{})},
    pendingChoices:Math.max(0,clampInt(seed.pendingChoices||0)),
    totalChoices:Math.max(0,clampInt(seed.totalChoices||0))
  };
}

export function grantRunXp(input,amount){
  const state=createRunUpgradeState(input);
  state.xp+=Math.max(0,Number(amount)||0);
  let levelsGained=0;
  while(state.xp>=state.xpNext&&levelsGained<100){
    state.xp-=state.xpNext;
    state.level++;
    levelsGained++;
    state.pendingChoices++;
    state.xpNext=xpNeededForLevel(state.level);
  }
  return {state,levelsGained};
}

function catalogueFor(characterId){return PREMIUM_UPGRADES[characterId]||[]}

export function buildCharacterUpgradeChoices(characterId,inputState,context={},options={}){
  const state=createRunUpgradeState(inputState);
  return buildUpgradeChoices(catalogueFor(characterId),state,{
    rng:typeof options.rng==='function'?options.rng:Math.random,
    context
  }).map(item=>Object.freeze({...item,rank:Math.max(0,Number(state.ranks?.[item.id])||0)}));
}

export function applyCharacterUpgrade(characterId,inputState,upgradeId){
  const state=createRunUpgradeState(inputState);
  const pool=catalogueFor(characterId);
  const upgrade=pool.find(item=>item.id===upgradeId);
  if(!upgrade||!eligibleUpgrades(pool,state).some(item=>item.id===upgradeId)){
    return {state,applied:false,upgrade:upgrade||null};
  }
  const next=applyUpgrade(state,upgrade);
  return {
    state:{...next,pendingChoices:Math.max(0,state.pendingChoices-1),totalChoices:state.totalChoices+1},
    applied:true,
    upgrade:Object.freeze({...upgrade,rank:Math.max(0,Number(next.ranks?.[upgradeId])||0)})
  };
}

function rankOf(state,id){return Math.max(0,Number(state?.ranks?.[id])||0)}

export function resolveRunStatModifiers(characterId,inputState){
  const state=createRunUpgradeState(inputState);
  let primaryDamage=0;
  let attackRate=0;
  if(characterId==='gunner'){
    primaryDamage+=rankOf(state,'gunner-calibration')*.12;
    attackRate+=rankOf(state,'gunner-tempo')*.08;
  }else if(characterId==='bombcat'){
    primaryDamage+=rankOf(state,'bombcat-payload')*.12;
    attackRate+=rankOf(state,'bombcat-fuse')*.08;
  }else if(characterId==='thunderfox')primaryDamage+=rankOf(state,'thunderfox-charge')*.12;
  else if(characterId==='blademaster')primaryDamage+=rankOf(state,'blade-edge')*.12;
  else if(characterId==='nova')primaryDamage+=rankOf(state,'nova-core')*.12;
  else if(characterId==='missilequeen')primaryDamage+=rankOf(state,'mq-warhead')*.12;
  return Object.freeze({
    primaryDamageMul:Number((1+primaryDamage).toFixed(6)),
    attackRateMul:Number((1+attackRate).toFixed(6)),
    areaMul:1,
    moveMul:1
  });
}

export function getRunUpgradeCatalogue(characterId){
  return catalogueFor(characterId).map(item=>Object.freeze({...item}));
}
