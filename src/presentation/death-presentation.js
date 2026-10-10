const freeze=value=>Object.freeze(value);

const BASE=freeze({
  normal:freeze({
    style:'pop',priority:1,particleCount:8,
    ringScale:1.65,ringLife:.16,
    speedMin:70,speedMax:175,
    sizeMin:1.5,sizeMax:4.2,
    lifeMin:.18,lifeMax:.38,
    directionalBias:0,
    secondaryRing:false,coreBurst:false,hitStopMs:0,
    audioCue:null
  }),
  runner:freeze({
    style:'runner-shear',priority:1,particleCount:10,
    ringScale:1.82,ringLife:.18,
    speedMin:155,speedMax:315,
    sizeMin:1.2,sizeMax:3.8,
    lifeMin:.14,lifeMax:.30,
    directionalBias:.72,
    secondaryRing:false,coreBurst:false,hitStopMs:0,
    audioCue:'death-runner'
  }),
  tank:freeze({
    style:'heavy-crack',priority:2,particleCount:9,
    ringScale:2.32,ringLife:.29,
    speedMin:58,speedMax:158,
    sizeMin:3.8,sizeMax:8.8,
    lifeMin:.30,lifeMax:.70,
    directionalBias:.10,
    secondaryRing:true,coreBurst:false,hitStopMs:16,
    audioCue:'death-tank'
  }),
  elite:freeze({
    style:'core-rupture',priority:4,particleCount:15,
    ringScale:2.82,ringLife:.38,
    speedMin:118,speedMax:335,
    sizeMin:2.4,sizeMax:7.4,
    lifeMin:.26,lifeMax:.68,
    directionalBias:0,
    secondaryRing:true,coreBurst:true,hitStopMs:28,
    audioCue:null
  })
});

export function resolveDeathPresentation({enemyType='normal',overkill=false,color='#ffffff'}={}){
  const type=String(enemyType||'normal').toLowerCase();
  const base=BASE[type];
  if(!base)return null;

  const amp=overkill?1.14:1;
  return freeze({
    ...base,
    enemyType:type,
    color:String(color||'#ffffff'),
    particleCount:base.particleCount+(overkill?3:0),
    ringScale:base.ringScale+(overkill?.22:0),
    speedMax:base.speedMax*amp,
    sizeMax:base.sizeMax*(overkill?1.10:1),
    lifeMax:base.lifeMax*(overkill?1.06:1)
  });
}
