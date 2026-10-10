const freeze=value=>Object.freeze(value);

const CUES=freeze({
  calm:'lb-calm',
  lock:'lb-lock',
  ignite:'lb-ignite'
});

const FULL_BEATS=freeze([
  freeze({id:'calm',atMs:0,ringScale:.72,ringLife:.18,particleCount:4,relight:false}),
  freeze({id:'lock',atMs:150,ringScale:1.22,ringLife:.24,particleCount:10,relight:false}),
  freeze({id:'ignite',atMs:500,ringScale:2.45,ringLife:.46,particleCount:26,relight:true})
]);

function reducedBeat(beat,index){
  const atMs=[0,90,290][index];
  return freeze({
    ...beat,
    atMs,
    ringScale:beat.ringScale*(index===2?.78:.86),
    ringLife:beat.ringLife*.76,
    particleCount:Math.max(2,Math.round(beat.particleCount*.48))
  });
}

export function buildLimitBreakTransition({reducedMotion=false}={}){
  const beats=freeze(reducedMotion
    ?FULL_BEATS.map(reducedBeat)
    :FULL_BEATS.map(beat=>beat));
  return freeze({
    beats,
    totalMs:reducedMotion?430:760,
    cues:CUES
  });
}
