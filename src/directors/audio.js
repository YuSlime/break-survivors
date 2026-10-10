const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const lerp=(a,b,t)=>a+(b-a)*t;

const AUDIO_PROFILES=Object.freeze({
  calm:Object.freeze({attackPresence:.90,cutoffHz:7600,atmosphereGain:.006,subHz:52,airHz:104,pulseHz:1.0}),
  pressure:Object.freeze({attackPresence:.96,cutoffHz:8800,atmosphereGain:.014,subHz:50,airHz:108,pulseHz:1.4}),
  break:Object.freeze({attackPresence:1.01,cutoffHz:10400,atmosphereGain:.025,subHz:48,airHz:116,pulseHz:1.9}),
  fever:Object.freeze({attackPresence:1.08,cutoffHz:12600,atmosphereGain:.040,subHz:54,airHz:132,pulseHz:2.8}),
  limit:Object.freeze({attackPresence:1.04,cutoffHz:9000,atmosphereGain:.056,subHz:44,airHz:92,pulseHz:1.6}),
  'boss-final':Object.freeze({attackPresence:1.10,cutoffHz:11200,atmosphereGain:.070,subHz:40,airHz:88,pulseHz:2.4})
});

function resolveMode(state={}){
  let mode='calm';
  if(state.highDensity||state.eliteActive)mode='pressure';
  if(state.breakActive)mode='break';
  if(state.feverActive)mode='fever';
  if(state.limitBreakActive)mode='limit';
  if(state.bossFinalPhase)mode='boss-final';
  return mode;
}

export function resolveAudioProfile(state={},intensity=20){
  const mode=resolveMode(state);
  const base=AUDIO_PROFILES[mode];
  const normalizedIntensity=clamp(intensity,0,100)/100;
  const atmosphereScale=.70+normalizedIntensity*.30;
  return Object.freeze({
    mode,
    intensity:normalizedIntensity,
    attackPresence:base.attackPresence,
    cutoffHz:base.cutoffHz,
    atmosphereGain:clamp(base.atmosphereGain*atmosphereScale,0,.08),
    subHz:base.subHz,
    airHz:base.airHz,
    pulseHz:base.pulseHz
  });
}

export function createAudioDirector({response=5}={}){
  const speed=Math.max(.01,Number(response)||5);
  let current={...resolveAudioProfile({},20)};

  function update(dt,state={},intensity=20){
    const target=resolveAudioProfile(state,intensity);
    const delta=Math.max(0,Number(dt)||0);
    const alpha=delta<=0?0:1-Math.exp(-speed*delta);
    current={
      mode:target.mode,
      intensity:target.intensity,
      attackPresence:lerp(current.attackPresence,target.attackPresence,alpha),
      cutoffHz:lerp(current.cutoffHz,target.cutoffHz,alpha),
      atmosphereGain:lerp(current.atmosphereGain,target.atmosphereGain,alpha),
      subHz:lerp(current.subHz,target.subHz,alpha),
      airHz:lerp(current.airHz,target.airHz,alpha),
      pulseHz:lerp(current.pulseHz,target.pulseHz,alpha)
    };
    return Object.freeze({...current});
  }

  function reset(){
    current={...resolveAudioProfile({},20)};
  }

  return {
    update,
    reset,
    get value(){return Object.freeze({...current})}
  };
}
