const freeze=value=>Object.freeze(value);

export const VOID_TYRANT_PHASES=freeze({
  phase1:freeze({
    id:'phase1',label:'VOID TYRANT',minHpRatio:.70,intensity:72,color:'#c56cff',
    telegraphSeconds:.38,moveCooldown:3.4,moves:freeze(['void-bolt','gravity-pulse'])
  }),
  phase2:freeze({
    id:'phase2',label:'VOID DOMAIN',minHpRatio:.40,intensity:82,color:'#a65cff',
    telegraphSeconds:.42,moveCooldown:3.1,moves:freeze(['void-bolt','gravity-pulse','void-zone'])
  }),
  phase3:freeze({
    id:'phase3',label:'RIFT SOVEREIGN',minHpRatio:.15,intensity:91,color:'#8f57ff',
    telegraphSeconds:.46,moveCooldown:2.8,moves:freeze(['void-bolt','void-zone','summon-rift','projectile-ring'])
  }),
  final:freeze({
    id:'final',label:'VOID COLLAPSE',minHpRatio:0,intensity:100,color:'#ff4f78',
    telegraphSeconds:.58,moveCooldown:2.45,moves:freeze(['void-bolt','void-zone','summon-rift','projectile-ring','void-collapse'])
  })
});

export function resolveVoidTyrantPhase(hpRatio=1){
  const hp=Math.max(0,Math.min(1,Number(hpRatio)||0));
  if(hp<=.15)return 'final';
  if(hp<=.40)return 'phase3';
  if(hp<=.70)return 'phase2';
  return 'phase1';
}

export function getVoidTyrantPhaseDefinition(id){
  return VOID_TYRANT_PHASES[id]||VOID_TYRANT_PHASES.phase1;
}

export function buildVoidTyrantAttackPlan({phase='phase1',roll=Math.random()}={}){
  const def=getVoidTyrantPhaseDefinition(phase);
  const r=Math.max(0,Math.min(.999999,Number(roll)||0));
  const index=Math.min(def.moves.length-1,Math.floor(r*def.moves.length));
  return freeze({
    phase:def.id,
    move:def.moves[index],
    telegraphSeconds:def.telegraphSeconds,
    cooldown:def.moveCooldown,
    color:def.color,
    intensity:def.intensity
  });
}
