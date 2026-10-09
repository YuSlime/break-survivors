import {PREMIUM_CHARACTERS} from '../data/characters-premium.js';

const SIGNATURE_COLORS=Object.freeze({
  gunner:'#78edff',
  bombcat:'#ffb24a',
  thunderfox:'#a9f5ff',
  blademaster:'#e9efff',
  nova:'#70ffff',
  missilequeen:'#ffd66b'
});

const DEFAULT_CYCLES=Object.freeze({
  bombcat:4,
  thunderfox:4,
  blademaster:3,
  nova:4,
  missilequeen:3
});

const FALLBACK_DEFINITION=Object.freeze({
  id:'unknown',
  label:'CORE',
  identity:'generic',
  evolution:'',
  color:'#9fb0c9'
});

const clampPercent=value=>Math.max(0,Math.min(100,Number(value)||0));

export function getSignatureMeterDefinition(characterId){
  const id=String(characterId||'').toLowerCase();
  const character=PREMIUM_CHARACTERS[id];
  if(!character)return FALLBACK_DEFINITION;
  return Object.freeze({
    id,
    label:character.meter,
    identity:character.identity,
    evolution:character.evolution,
    color:SIGNATURE_COLORS[id]||FALLBACK_DEFINITION.color
  });
}

export function getSignatureMeterValue(characterId,{gunnerMomentum=0,attackCounters={},characterLevel=1}={}){
  const id=String(characterId||'').toLowerCase();
  if(id==='gunner')return clampPercent(gunnerMomentum);
  if(!PREMIUM_CHARACTERS[id])return 0;

  let cycle=DEFAULT_CYCLES[id]||4;
  if(id==='blademaster'&&Number(characterLevel)>=50)cycle=5;

  const count=Math.max(0,Math.floor(Number(attackCounters?.[id])||0));
  if(count===0)return 0;
  const step=((count-1)%cycle)+1;
  return clampPercent(Math.round(step/cycle*100));
}

export function createSignatureMeterViewModel({characterId,value=0}={}){
  const definition=getSignatureMeterDefinition(characterId);
  const percent=Math.round(clampPercent(value));
  const state=percent>=100?'full':percent>=80?'charged':'idle';
  return Object.freeze({
    ...definition,
    percent,
    state,
    valueText:`${percent}%`
  });
}
