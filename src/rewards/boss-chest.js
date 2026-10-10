const freeze=value=>Object.freeze(value);
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

export const BOSS_REWARD_BOONS=freeze({
  annihilation:freeze({id:'annihilation',label:'ANNIHILATION CORE',color:'#ff665e',effects:freeze({damageMul:1.25})}),
  overdrive:freeze({id:'overdrive',label:'OVERCLOCK MATRIX',color:'#6ee7ff',effects:freeze({attackRateMul:1.22})}),
  singularity:freeze({id:'singularity',label:'SINGULARITY LENS',color:'#bd75ff',effects:freeze({areaMul:1.24})}),
  velocity:freeze({id:'velocity',label:'PHASE DRIVE',color:'#78f2b0',effects:freeze({moveMul:1.18})})
});

const BOON_IDS=Object.keys(BOSS_REWARD_BOONS);

export function buildBossChestChoices({bossesDefeated=1,threat=0,rolls=[]}={}){
  const bosses=Math.max(1,Math.floor(Number(bossesDefeated)||1));
  const threatLevel=clamp(threat,0,5);
  const boonRoll=clamp(rolls[0],0,.999999);
  const boon=BOSS_REWARD_BOONS[BOON_IDS[Math.floor(boonRoll*BOON_IDS.length)]];
  const resourceRoll=clamp(rolls[1],0,.999999);
  const recoveryRoll=clamp(rolls[2],0,.999999);

  const coins=Math.min(5000,650+bosses*260+threatLevel*120+Math.floor(resourceRoll*220));
  const gems=Math.min(150,18+bosses*6+threatLevel*3+Math.floor(resourceRoll*8));
  const healRatio=.32+recoveryRoll*.08;
  const ultGain=45+Math.floor(recoveryRoll*15);

  return [
    freeze({category:'legendary',id:`boon-${boon.id}`,label:boon.label,color:boon.color,effects:boon.effects,rarity:'LEGENDARY'}),
    freeze({category:'resource',id:'void-cache',label:'VOID CACHE',color:'#ffd86a',coins,gems,rarity:'BOSS'}),
    freeze({category:'recovery',id:'renewal-protocol',label:'RENEWAL PROTOCOL',color:'#7dffa8',healRatio,ultGain,rarity:'BOSS'})
  ];
}

export function createBossRewardState(){
  return {
    damageMul:1,
    attackRateMul:1,
    areaMul:1,
    moveMul:1,
    resourceDelta:{coins:0,gems:0},
    hp:null,
    ultCharge:null,
    chosen:[]
  };
}

export function applyBossRewardChoice(currentState,choice,context={}){
  const state={
    ...createBossRewardState(),
    ...(currentState||{}),
    resourceDelta:{...createBossRewardState().resourceDelta,...(currentState?.resourceDelta||{})},
    chosen:[...(currentState?.chosen||[])]
  };
  const selected=choice||{};

  if(selected.category==='legendary'){
    for(const [key,value] of Object.entries(selected.effects||{})){
      const current=Number(state[key])||1;
      state[key]=current*Math.max(1,Number(value)||1);
    }
  }else if(selected.category==='resource'){
    state.resourceDelta.coins+=Math.max(0,Math.floor(Number(selected.coins)||0));
    state.resourceDelta.gems+=Math.max(0,Math.floor(Number(selected.gems)||0));
  }else if(selected.category==='recovery'){
    const maxHp=Math.max(1,Number(context.maxHp)||1);
    const hp=clamp(context.hp,0,maxHp);
    const ult=clamp(context.ultCharge,0,100);
    state.hp=Math.min(maxHp,hp+maxHp*clamp(selected.healRatio,0,1));
    state.ultCharge=Math.min(100,ult+Math.max(0,Number(selected.ultGain)||0));
  }

  if(selected.id)state.chosen.push(selected.id);
  return state;
}
