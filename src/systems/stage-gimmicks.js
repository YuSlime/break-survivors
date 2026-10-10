const freeze=value=>Object.freeze(value);

const GIMMICKS=freeze({
  'neon-ruins':freeze({
    stageId:'neon-ruins',
    kind:'power-pulse',
    cycleSeconds:24,
    telegraphSeconds:1.2,
    activeSeconds:.35,
    radius:270,
    enemyStunSeconds:1.65,
    playerDamage:0,
    affectsEnemies:true,
    accent:'#56dfff'
  }),
  'research-zero':freeze({
    stageId:'research-zero',
    kind:'experiment-overdrive',
    cycleSeconds:34,
    telegraphSeconds:1.4,
    activeSeconds:11,
    enemySpeedMul:1.16,
    enemyDamageMul:1.24,
    rewardMul:1.42,
    affectsEnemies:true,
    accent:'#b8efff'
  }),
  'ash-wasteland':freeze({
    stageId:'ash-wasteland',
    kind:'volcanic-strike',
    cycleSeconds:21,
    telegraphSeconds:1.15,
    activeSeconds:.28,
    radius:118,
    affectsEnemies:true,
    enemyDamageMaxHpRatio:.16,
    playerDamage:13,
    accent:'#ff784d'
  }),
  'void-sector':freeze({
    stageId:'void-sector',
    kind:'moving-safe-zone',
    orbitSeconds:18,
    radius:150,
    unsafeDamagePerSecond:7,
    rewardMul:1.12,
    affectsEnemies:false,
    accent:'#c768ff'
  })
});

function finite(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
}

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

function cyclePhase(time,cycle){
  const t=Math.max(0,finite(time));
  return ((t%cycle)+cycle)%cycle;
}

function strikeTarget(stageId,time,width,height,radius){
  const w=Math.max(radius*2+1,finite(width,960));
  const h=Math.max(radius*2+1,finite(height,540));
  const cycle=GIMMICKS[stageId]?.cycleSeconds||20;
  const index=Math.floor(Math.max(0,finite(time))/cycle);
  const sx=(Math.sin(index*2.3999632297+1.17)+1)*.5;
  const sy=(Math.sin(index*1.6180339887+2.41)+1)*.5;
  return freeze({
    x:radius+(w-radius*2)*sx,
    y:radius+(h-radius*2)*sy
  });
}

export function getStageGimmick(stageId='neon-ruins'){
  return GIMMICKS[stageId]||GIMMICKS['neon-ruins'];
}

export function resolveStageGimmickFrame({stageId='neon-ruins',time=0,width=960,height=540}={}){
  const def=getStageGimmick(stageId);
  const t=Math.max(0,finite(time));

  if(def.kind==='moving-safe-zone'){
    const w=Math.max(def.radius*2+1,finite(width,960));
    const h=Math.max(def.radius*2+1,finite(height,540));
    const phase=(t/def.orbitSeconds)*Math.PI*2;
    const spanX=Math.max(0,w/2-def.radius);
    const spanY=Math.max(0,h/2-def.radius);
    return freeze({
      stageId:def.stageId,
      kind:def.kind,
      phase:'active',
      target:freeze({
        x:clamp(w/2+Math.cos(phase)*spanX*.72,def.radius,w-def.radius),
        y:clamp(h/2+Math.sin(phase)*spanY*.58,def.radius,h-def.radius)
      }),
      radius:def.radius,
      unsafeDamagePerSecond:def.unsafeDamagePerSecond,
      rewardMul:def.rewardMul,
      affectsEnemies:false,
      accent:def.accent
    });
  }

  const phaseInCycle=cyclePhase(t,def.cycleSeconds);
  const telegraphStart=def.cycleSeconds-def.telegraphSeconds;
  const active=phaseInCycle<def.activeSeconds;
  const telegraph=phaseInCycle>=telegraphStart;
  const common={stageId:def.stageId,kind:def.kind,accent:def.accent,affectsEnemies:!!def.affectsEnemies};

  if(def.kind==='experiment-overdrive'){
    return freeze({
      ...common,
      phase:active||phaseInCycle<def.activeSeconds?'active':telegraph?'telegraph':'idle',
      enemySpeedMul:phaseInCycle<def.activeSeconds?def.enemySpeedMul:1,
      enemyDamageMul:phaseInCycle<def.activeSeconds?def.enemyDamageMul:1,
      rewardMul:phaseInCycle<def.activeSeconds?def.rewardMul:1
    });
  }

  const target=def.kind==='volcanic-strike'
    ?strikeTarget(def.stageId,t,width,height,def.radius)
    :freeze({x:finite(width,960)/2,y:finite(height,540)/2});

  return freeze({
    ...common,
    phase:active?'active':telegraph?'telegraph':'idle',
    target,
    radius:def.radius,
    enemyStunSeconds:def.enemyStunSeconds||0,
    enemyDamageMaxHpRatio:def.enemyDamageMaxHpRatio||0,
    playerDamage:def.playerDamage||0
  });
}
