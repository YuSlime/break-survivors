const CATALOGUE=Object.freeze({
  gunner:Object.freeze([
    {id:'gunner-calibration',tier:'stat',name:'CALIBRATION',effect:'Damage +12%',maxRank:3,primaryDamagePerRank:.12},
    {id:'gunner-ricochet',tier:'modify',name:'RICOCHET',effect:'Shots bounce to another enemy',maxRank:1},
    {id:'gunner-piercing',tier:'modify',name:'PIERCING CORE',effect:'Shots pierce additional targets',maxRank:1,exclusiveGroup:'gunner-shot-path'},
    {id:'gunner-split',tier:'modify',name:'SPLIT SHOT',effect:'Hits split into two secondary rounds',maxRank:1,exclusiveGroup:'gunner-shot-path'},
    {id:'gunner-thunder-crit',tier:'synergy',name:'THUNDER CRIT',effect:'Critical hits discharge chain lightning',maxRank:1,requires:['gunner-ricochet']},
    {id:'gunner-railstorm',tier:'evolution',name:'RAILSTORM',effect:'Momentum converts fire into piercing rail bursts',maxRank:1,requires:['gunner-ricochet','gunner-thunder-crit']}
  ]),
  bombcat:Object.freeze([
    {id:'bombcat-payload',tier:'stat',name:'HEAVY PAYLOAD',effect:'Explosion damage +12%',maxRank:3,primaryDamagePerRank:.12},
    {id:'bombcat-cluster',tier:'modify',name:'CLUSTER BOMB',effect:'Bombs split into submunitions',maxRank:1},
    {id:'bombcat-mines',tier:'modify',name:'SMART MINES',effect:'Bombs leave armed proximity mines',maxRank:1,exclusiveGroup:'bombcat-payload-path'},
    {id:'bombcat-chain-fuse',tier:'modify',name:'CHAIN FUSE',effect:'Explosions prime nearby enemies',maxRank:1,exclusiveGroup:'bombcat-payload-path'},
    {id:'bombcat-break-chain',tier:'synergy',name:'BREAK DETONATION',effect:'BREAK kills trigger secondary blasts',maxRank:1,requires:['bombcat-cluster']},
    {id:'bombcat-nuclear',tier:'evolution',name:'NUCLEAR CASCADE',effect:'Chain detonations escalate into cascading nuclear bursts',maxRank:1,requires:['bombcat-cluster','bombcat-break-chain']}
  ]),
  thunderfox:Object.freeze([
    {id:'thunderfox-charge',tier:'stat',name:'CAPACITOR',effect:'Lightning damage +12%',maxRank:3,primaryDamagePerRank:.12},
    {id:'thunderfox-chain',tier:'modify',name:'CHAIN SURGE',effect:'Lightning jumps to more enemies',maxRank:1},
    {id:'thunderfox-stormfield',tier:'modify',name:'STORM FIELD',effect:'Final jump leaves a damaging field',maxRank:1,exclusiveGroup:'thunderfox-field-path'},
    {id:'thunderfox-overcharge',tier:'modify',name:'OVERCHARGE',effect:'High voltage increases shock damage',maxRank:1,exclusiveGroup:'thunderfox-field-path'},
    {id:'thunderfox-critstorm',tier:'synergy',name:'CRITICAL STORM',effect:'Critical chains recharge Voltage',maxRank:1,requires:['thunderfox-chain']},
    {id:'thunderfox-god',tier:'evolution',name:'THUNDER GOD',effect:'Max Voltage sustains a roaming storm',maxRank:1,requires:['thunderfox-chain','thunderfox-critstorm']}
  ]),
  blademaster:Object.freeze([
    {id:'blade-edge',tier:'stat',name:'SHARPENED EDGE',effect:'Slash damage +12%',maxRank:3,primaryDamagePerRank:.12},
    {id:'blade-execution',tier:'modify',name:'EXECUTION',effect:'Low-health enemies are executed',maxRank:1},
    {id:'blade-parry',tier:'modify',name:'PERFECT PARRY',effect:'Well-timed contact grants a counter window',maxRank:1,exclusiveGroup:'blade-technique'},
    {id:'blade-cyclone',tier:'modify',name:'CYCLONE STEP',effect:'Dash emits a circular slash',maxRank:1,exclusiveGroup:'blade-technique'},
    {id:'blade-flowkill',tier:'synergy',name:'FLOW EXECUTION',effect:'Executions restore Flow and dash tempo',maxRank:1,requires:['blade-execution']},
    {id:'blade-void',tier:'evolution',name:'VOID BLADE',effect:'Full Flow opens void slashes through enemy lines',maxRank:1,requires:['blade-execution','blade-flowkill']}
  ]),
  nova:Object.freeze([
    {id:'nova-core',tier:'stat',name:'CORE DENSITY',effect:'Nova damage +12%',maxRank:3,primaryDamagePerRank:.12},
    {id:'nova-gravity',tier:'modify',name:'GRAVITY WELL',effect:'Orbs pull nearby enemies inward',maxRank:1},
    {id:'nova-orbit',tier:'modify',name:'ORBITAL CORE',effect:'Charged orbs orbit before release',maxRank:1,exclusiveGroup:'nova-core-path'},
    {id:'nova-collapse',tier:'modify',name:'COLLAPSE CORE',effect:'Charged hits implode then burst',maxRank:1,exclusiveGroup:'nova-core-path'},
    {id:'nova-resonant',tier:'synergy',name:'RESONANT COLLAPSE',effect:'Grouped enemies amplify Resonance',maxRank:1,requires:['nova-gravity']},
    {id:'nova-supernova',tier:'evolution',name:'SUPERNOVA',effect:'Maximum Resonance detonates a battlefield-scale nova',maxRank:1,requires:['nova-gravity','nova-resonant']}
  ]),
  missilequeen:Object.freeze([
    {id:'mq-warhead',tier:'stat',name:'WARHEAD TUNING',effect:'Missile damage +12%',maxRank:3,primaryDamagePerRank:.12},
    {id:'mq-multilock',tier:'modify',name:'MULTI-LOCK',effect:'Acquire additional simultaneous targets',maxRank:1},
    {id:'mq-cluster',tier:'modify',name:'CLUSTER SALVO',effect:'Missiles split near locked targets',maxRank:1,exclusiveGroup:'mq-arsenal-path'},
    {id:'mq-airstrike',tier:'modify',name:'AIR STRIKE',effect:'High lock count calls a delayed strike',maxRank:1,exclusiveGroup:'mq-arsenal-path'},
    {id:'mq-overpaint',tier:'synergy',name:'TARGET OVERPAINT',effect:'Repeated locks increase impact damage',maxRank:1,requires:['mq-multilock']},
    {id:'mq-annihilation',tier:'evolution',name:'TOTAL ANNIHILATION',effect:'Full Target Lock launches an arena-wide missile protocol',maxRank:1,requires:['mq-multilock','mq-overpaint']}
  ])
});

const clampInt=(n,min=0)=>Math.max(min,Math.floor(Number(n)||0));

export function xpNeededForLevel(level=1){
  const lv=Math.max(1,clampInt(level,1));
  return Math.max(12,Math.round(12*Math.pow(1.22,lv-1)));
}

export function createRunUpgradeState(seed={}){
  const level=Math.max(1,clampInt(seed.level||1,1));
  const state={
    level,
    xp:Math.max(0,Number(seed.xp)||0),
    xpNext:xpNeededForLevel(level),
    ranks:{...(seed.ranks||{})},
    exclusive:{...(seed.exclusive||{})},
    pendingChoices:Math.max(0,clampInt(seed.pendingChoices||0)),
    totalChoices:Math.max(0,clampInt(seed.totalChoices||0))
  };
  return state;
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

function rankOf(state,id){return Math.max(0,Number(state?.ranks?.[id])||0)}
function catalogueFor(characterId){return CATALOGUE[characterId]||[]}

function eligible(pool,state){
  return pool.filter(upgrade=>{
    if(!upgrade?.id)return false;
    const maxRank=Math.max(1,Number(upgrade.maxRank)||1);
    if(rankOf(state,upgrade.id)>=maxRank)return false;
    if(upgrade.exclusiveGroup){
      const locked=state?.exclusive?.[upgrade.exclusiveGroup];
      if(locked&&locked!==upgrade.id)return false;
    }
    const reqs=Array.isArray(upgrade.requires)?upgrade.requires:[];
    return !reqs.some(id=>rankOf(state,id)<=0);
  });
}

function choiceCountFor(context={}){
  if(context.bossReward)return 5;
  if(context.breakActive)return 4;
  return 3;
}

export function buildCharacterUpgradeChoices(characterId,inputState,context={},options={}){
  const state=createRunUpgradeState(inputState);
  const rng=typeof options.rng==='function'?options.rng:Math.random;
  const list=eligible(catalogueFor(characterId),state).slice();
  for(let i=list.length-1;i>0;i--){
    const raw=Number(rng());
    const unit=Number.isFinite(raw)?Math.max(0,Math.min(.999999999,raw)):0;
    const j=Math.floor(unit*(i+1));
    [list[i],list[j]]=[list[j],list[i]];
  }
  return list.slice(0,choiceCountFor(context)).map(item=>Object.freeze({...item,rank:rankOf(state,item.id)}));
}

export function applyCharacterUpgrade(characterId,inputState,upgradeId){
  const state=createRunUpgradeState(inputState);
  const pool=catalogueFor(characterId);
  const upgrade=pool.find(item=>item.id===upgradeId);
  if(!upgrade||!eligible(pool,state).some(item=>item.id===upgradeId))return {state,applied:false,upgrade:null};
  const ranks={...state.ranks,[upgradeId]:rankOf(state,upgradeId)+1};
  const exclusive={...state.exclusive};
  if(upgrade.exclusiveGroup)exclusive[upgrade.exclusiveGroup]=upgradeId;
  return {
    state:{...state,ranks,exclusive,pendingChoices:Math.max(0,state.pendingChoices-1),totalChoices:state.totalChoices+1},
    applied:true,
    upgrade:Object.freeze({...upgrade,rank:ranks[upgradeId]})
  };
}

export function resolveRunStatModifiers(characterId,inputState){
  const state=createRunUpgradeState(inputState);
  let primaryDamage=0,attackRate=0,area=0,move=0;
  for(const upgrade of catalogueFor(characterId)){
    const rank=rankOf(state,upgrade.id);
    if(!rank)continue;
    primaryDamage+=(Number(upgrade.primaryDamagePerRank)||0)*rank;
    attackRate+=(Number(upgrade.attackRatePerRank)||0)*rank;
    area+=(Number(upgrade.areaPerRank)||0)*rank;
    move+=(Number(upgrade.movePerRank)||0)*rank;
  }
  return Object.freeze({
    primaryDamageMul:Number((1+primaryDamage).toFixed(6)),
    attackRateMul:Number((1+attackRate).toFixed(6)),
    areaMul:Number((1+area).toFixed(6)),
    moveMul:Number((1+move).toFixed(6))
  });
}

export function getRunUpgradeCatalogue(characterId){
  return catalogueFor(characterId).map(item=>Object.freeze({...item}));
}
