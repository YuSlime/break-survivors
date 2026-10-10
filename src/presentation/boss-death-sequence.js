const freeze=value=>Object.freeze(value);

const FULL_STAGES=freeze([
  freeze({
    id:'fracture',atMs:70,cue:'boss-fracture',
    ringScale:1.35,ringLife:.22,particleCount:9,
    speedMin:70,speedMax:155,sizeMin:1.8,sizeMax:4.8,
    color:'#ff7eb2',lootBurst:false
  }),
  freeze({
    id:'core',atMs:225,cue:'boss-core',
    ringScale:2.15,ringLife:.34,particleCount:18,
    speedMin:90,speedMax:220,sizeMin:2.4,sizeMax:6.2,
    color:'#fff0ad',lootBurst:false
  }),
  freeze({
    id:'rupture',atMs:445,cue:'boss-rupture',
    ringScale:3.55,ringLife:.58,particleCount:38,
    speedMin:145,speedMax:380,sizeMin:2.8,sizeMax:9.2,
    color:'#ffe16b',lootBurst:true
  })
]);

function reducedStage(stage,index){
  const atMs=[45,145,285][index];
  return freeze({
    ...stage,
    atMs,
    ringScale:stage.ringScale*(index===2?.82:.88),
    ringLife:stage.ringLife*.78,
    particleCount:Math.max(5,Math.round(stage.particleCount*.52)),
    speedMax:stage.speedMax*.78,
    sizeMax:stage.sizeMax*.86
  });
}

export function buildBossDeathSequence({reducedMotion=false}={}){
  const stages=freeze(reducedMotion
    ?FULL_STAGES.map(reducedStage)
    :FULL_STAGES.map(stage=>stage));
  const chestDelayMs=reducedMotion?380:620;
  return freeze({
    stages,
    chestDelayMs,
    playerGuardMs:chestDelayMs+140
  });
}
