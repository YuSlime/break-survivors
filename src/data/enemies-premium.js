const freeze=value=>Object.freeze(value);

export const PREMIUM_ENEMY_ARCHETYPES=freeze({
  support:freeze({
    id:'support',role:'enemy amplifier',mechanic:'buff-aura',
    hp:52,speed:46,reward:14,touch:7,radius:15,color:'#5ff0b0',priority:3,
    auraRadius:190,allySpeedMul:1.15,allyDamageMul:1.20,preferredRange:220
  }),
  assassin:freeze({
    id:'assassin',role:'burst hunter',mechanic:'telegraph-dash',
    hp:38,speed:82,reward:16,touch:18,radius:11,color:'#ff5fa2',priority:3,
    telegraphSeconds:.28,dashSpeed:520,dashDuration:.24,dashCooldown:3.1
  }),
  summoner:freeze({
    id:'summoner',role:'swarm generator',mechanic:'summon-swarm',
    hp:78,speed:34,reward:21,touch:9,radius:17,color:'#b078ff',priority:4,
    summonInterval:5.4,summonCount:3,summonType:'normal',preferredRange:275
  }),
  shielder:freeze({
    id:'shielder',role:'formation protector',mechanic:'shield-aura',
    hp:96,speed:32,reward:22,touch:11,radius:19,color:'#62b8ff',priority:4,
    auraRadius:175,damageReduction:.42,preferredRange:205
  })
});

const PRESSURE=freeze({normal:1,runner:1.15,tank:1.35,shooter:1.4,elite:2.2,support:2.45,assassin:2.7,summoner:3.4,shielder:3.1});

export function getPremiumEnemyArchetype(id){
  return PREMIUM_ENEMY_ARCHETYPES[String(id||'').toLowerCase()]||null;
}

export function getPremiumEnemyPressureScore(id){
  return PRESSURE[String(id||'').toLowerCase()]||1;
}

export function pickPremiumEnemyArchetype({gameTime=0,threat=0,roll=Math.random()}={}){
  const time=Math.max(0,Number(gameTime)||0);
  const level=Math.max(0,Math.floor(Number(threat)||0));
  const r=Math.max(0,Math.min(.999999,Number(roll)||0));
  if(time<75||level<2)return null;

  const table=[];
  table.push(['support',Math.min(.14,.08+level*.01)]);
  if(time>=120&&level>=3)table.push(['assassin',.10]);
  if(time>=150&&level>=3)table.push(['summoner',.10]);
  if(time>=175&&level>=4)table.push(['shielder',.08]);

  let edge=0;
  for(const [id,weight] of table){
    edge+=weight;
    if(r<edge)return id;
  }
  return null;
}

export function resolvePremiumEnemyAuras(target,enemies=[]){
  const result={speedMul:1,touchMul:1,damageTakenMul:1};
  if(!target||target.dead)return result;

  for(const source of enemies||[]){
    if(!source||source.dead||source===target)continue;
    const def=getPremiumEnemyArchetype(source.type);
    if(!def)continue;
    const dx=(Number(target.x)||0)-(Number(source.x)||0);
    const dy=(Number(target.y)||0)-(Number(source.y)||0);
    const distance=Math.hypot(dx,dy);

    if(source.type==='support'&&distance<=def.auraRadius){
      result.speedMul=Math.max(result.speedMul,def.allySpeedMul);
      result.touchMul=Math.max(result.touchMul,def.allyDamageMul);
    }
    if(source.type==='shielder'&&distance<=def.auraRadius){
      result.damageTakenMul=Math.min(result.damageTakenMul,1-def.damageReduction);
    }
  }
  return result;
}
