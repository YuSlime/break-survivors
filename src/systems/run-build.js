import {PREMIUM_UPGRADES} from '../data/upgrades.js';
import {buildUpgradeChoices,applyUpgrade} from './upgrades.js';

const freeze=value=>Object.freeze(value);
const emptyRanks=()=>({});
const emptyExclusive=()=>({});

export function nextRunXp(level=0){
  const lv=Math.max(0,Math.floor(Number(level)||0));
  return 18+lv*12;
}

export function createRunBuildState(){
  return {
    level:0,
    xp:0,
    nextXp:nextRunXp(0),
    pending:0,
    ranks:emptyRanks(),
    exclusive:emptyExclusive()
  };
}

export function gainRunXp(state=createRunBuildState(),amount=0){
  let xp=Math.max(0,Number(state.xp)||0)+Math.max(0,Number(amount)||0);
  let level=Math.max(0,Math.floor(Number(state.level)||0));
  let pending=Math.max(0,Math.floor(Number(state.pending)||0));
  let needed=Math.max(1,Number(state.nextXp)||nextRunXp(level));

  while(xp>=needed){
    xp-=needed;
    level++;
    pending++;
    needed=nextRunXp(level);
  }

  return {...state,xp,level,pending,nextXp:needed};
}

export function xpForEnemy(enemy={}){
  if(enemy?.type==='boss'||enemy?.boss)return 18;
  if(enemy?.type==='elite'||enemy?.elite)return 7;
  if(enemy?.treasure||enemy?.type==='treasure')return 5;
  if(['support','assassin','summoner','shielder'].includes(enemy?.type))return 3;
  if(enemy?.type==='tank')return 2;
  return 1;
}

export function buildRunDraft(characterId,state=createRunBuildState(),context={}){
  const pool=PREMIUM_UPGRADES[characterId]||[];
  if(!pool.length)return [];
  const options={
    rng:typeof context.rng==='function'?context.rng:Math.random,
    context:{breakActive:!!context.breakActive,bossReward:!!context.bossReward}
  };
  return buildUpgradeChoices(pool,state,options);
}

export function applyRunChoice(state=createRunBuildState(),choice){
  if(!choice||Math.max(0,Number(state.pending)||0)<=0)return state;
  if(choice.exclusiveGroup){
    const locked=state?.exclusive?.[choice.exclusiveGroup];
    if(locked&&locked!==choice.id)return state;
  }
  const requires=Array.isArray(choice.requires)?choice.requires:[];
  if(requires.some(id=>rank(state,id)<=0))return state;
  const maxRank=Math.max(1,Number(choice.maxRank)||1);
  if(rank(state,choice.id)>=maxRank)return state;
  const next=applyUpgrade(state,choice);
  return {...next,pending:Math.max(0,(Number(state.pending)||0)-1)};
}

function rank(state,id){return Math.max(0,Number(state?.ranks?.[id])||0)}

export function deriveRunEffects(characterId,state=createRunBuildState()){
  const fx={
    damageMul:1,
    attackRateMul:1,
    pierceAdd:0,
    ricochetChance:0,
    ricochetCount:0,
    splitChance:0,
    clusterAdd:0,
    chainChanceAdd:0,
    radiusMul:1,
    chainAdd:0,
    lockAdd:0,
    thunderCrit:false,
    smartMines:false,
    breakDetonation:false,
    stormField:false,
    overcharge:false,
    criticalStorm:false,
    executeThreshold:0,
    parry:false,
    cyclone:false,
    flowExecution:false,
    gravityPull:false,
    orbitalCore:false,
    collapseCore:false,
    resonantCollapse:false,
    missileCluster:false,
    airStrike:false,
    targetOverpaint:false,
    evolution:null,
    evolutionMomentumThreshold:1
  };

  if(characterId==='gunner'){
    fx.damageMul*=1+rank(state,'gunner-calibration')*.12;
    fx.attackRateMul*=1+rank(state,'gunner-tempo')*.08;
    if(rank(state,'gunner-ricochet')){fx.ricochetChance=1;fx.ricochetCount=1}
    if(rank(state,'gunner-piercing'))fx.pierceAdd+=3;
    if(rank(state,'gunner-split'))fx.splitChance=.38;
    if(rank(state,'gunner-thunder-crit'))fx.thunderCrit=true;
    if(rank(state,'gunner-railstorm')){
      fx.evolution='railstorm';
      fx.evolutionMomentumThreshold=.80;
      fx.damageMul*=1.32;
      fx.pierceAdd+=4;
    }
  }else if(characterId==='bombcat'){
    fx.damageMul*=1+rank(state,'bombcat-payload')*.12;
    fx.attackRateMul*=1+rank(state,'bombcat-fuse')*.08;
    if(rank(state,'bombcat-cluster'))fx.clusterAdd+=3;
    if(rank(state,'bombcat-mines'))fx.smartMines=true;
    if(rank(state,'bombcat-chain-fuse'))fx.chainChanceAdd+=.34;
    if(rank(state,'bombcat-break-chain'))fx.breakDetonation=true;
    if(rank(state,'bombcat-nuclear')){
      fx.evolution='nuclear-cascade';
      fx.clusterAdd+=4;
      fx.chainChanceAdd+=.22;
      fx.radiusMul*=1.32;
      fx.damageMul*=1.22;
    }
  }else if(characterId==='thunderfox'){
    fx.damageMul*=1+rank(state,'thunderfox-charge')*.12;
    if(rank(state,'thunderfox-chain'))fx.chainAdd+=2;
    if(rank(state,'thunderfox-stormfield'))fx.stormField=true;
    if(rank(state,'thunderfox-overcharge'))fx.overcharge=true;
    if(rank(state,'thunderfox-critstorm'))fx.criticalStorm=true;
    if(rank(state,'thunderfox-god')){
      fx.evolution='thunder-god';
      fx.damageMul*=1.25;
      fx.chainAdd+=3;
      fx.radiusMul*=1.18;
    }
  }else if(characterId==='blademaster'){
    fx.damageMul*=1+rank(state,'blade-edge')*.12;
    if(rank(state,'blade-execution'))fx.executeThreshold=.15;
    if(rank(state,'blade-parry'))fx.parry=true;
    if(rank(state,'blade-cyclone'))fx.cyclone=true;
    if(rank(state,'blade-flowkill'))fx.flowExecution=true;
    if(rank(state,'blade-void')){
      fx.evolution='void-blade';
      fx.damageMul*=1.30;
      fx.radiusMul*=1.18;
      fx.executeThreshold=Math.max(fx.executeThreshold,.20);
    }
  }else if(characterId==='nova'){
    fx.damageMul*=1+rank(state,'nova-core')*.12;
    if(rank(state,'nova-gravity'))fx.gravityPull=true;
    if(rank(state,'nova-orbit'))fx.orbitalCore=true;
    if(rank(state,'nova-collapse'))fx.collapseCore=true;
    if(rank(state,'nova-resonant'))fx.resonantCollapse=true;
    if(rank(state,'nova-supernova')){
      fx.evolution='supernova';
      fx.damageMul*=1.28;
      fx.radiusMul*=1.35;
    }
  }else if(characterId==='missilequeen'){
    fx.damageMul*=1+rank(state,'mq-warhead')*.12;
    if(rank(state,'mq-multilock'))fx.lockAdd+=2;
    if(rank(state,'mq-cluster'))fx.missileCluster=true;
    if(rank(state,'mq-airstrike'))fx.airStrike=true;
    if(rank(state,'mq-overpaint'))fx.targetOverpaint=true;
    if(rank(state,'mq-annihilation')){
      fx.evolution='total-annihilation';
      fx.damageMul*=1.25;
      fx.lockAdd+=4;
      fx.radiusMul*=1.20;
    }
  }

  return freeze(fx);
}
