// Guarded integrator for Premium reactive audio and frame-loop cleanup.
import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
let changed=false;

function replaceOnce(label,from,to,alreadyAppliedMarker=null){
  if(source.includes(to))return;
  if(alreadyAppliedMarker&&source.includes(alreadyAppliedMarker))return;
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
  changed=true;
}

const attackVolumeAnchor=`let attackSfxVolume = clamp(Number(localStorage.getItem('break_survivors_attack_sfx_volume') ?? 44) / 100, 0, 1);\n\nfunction getAudio(){`;
const audioBridge=`let attackSfxVolume = clamp(Number(localStorage.getItem('break_survivors_attack_sfx_volume') ?? 44) / 100, 0, 1);\n\nlet premiumAtmosBus = null;\nlet premiumAtmosFilter = null;\nlet premiumSubOsc = null;\nlet premiumAirOsc = null;\nlet premiumSubGain = null;\nlet premiumAirGain = null;\n\nfunction ensurePremiumAtmosphere(){\n  if(!audioUnlocked||!audioCtx||!audioMaster)return false;\n  if(premiumAtmosBus)return true;\n\n  premiumAtmosBus=audioCtx.createGain();\n  premiumAtmosBus.gain.value=0;\n  premiumAtmosFilter=audioCtx.createBiquadFilter();\n  premiumAtmosFilter.type='lowpass';\n  premiumAtmosFilter.frequency.value=620;\n  premiumAtmosFilter.Q.value=.45;\n\n  premiumSubOsc = audioCtx.createOscillator();\n  premiumSubOsc.type='sine';\n  premiumSubOsc.frequency.value=52;\n  premiumSubGain=audioCtx.createGain();\n  premiumSubGain.gain.value=.42;\n\n  premiumAirOsc = audioCtx.createOscillator();\n  premiumAirOsc.type='triangle';\n  premiumAirOsc.frequency.value=104;\n  premiumAirGain=audioCtx.createGain();\n  premiumAirGain.gain.value=.08;\n\n  premiumSubOsc.connect(premiumSubGain).connect(premiumAtmosFilter);\n  premiumAirOsc.connect(premiumAirGain).connect(premiumAtmosFilter);\n  premiumAtmosFilter.connect(premiumAtmosBus);\n  premiumAtmosBus.connect(audioMaster);\n  premiumSubOsc.start();\n  premiumAirOsc.start();\n  return true;\n}\n\nfunction applyPremiumAudioMix(mix){\n  if(!audioCtx||!attackFilter||!attackBus)return;\n  const now=audioCtx.currentTime;\n  if(!mix||!soundEnabled){\n    attackFilter.frequency.setTargetAtTime(8500,now,.08);\n    attackBus.gain.setTargetAtTime(soundEnabled?attackSfxVolume:0,now,.08);\n    if(premiumAtmosBus)premiumAtmosBus.gain.setTargetAtTime(0,now,.06);\n    return;\n  }\n  if(!ensurePremiumAtmosphere())return;\n\n  attackFilter.frequency.setTargetAtTime(mix.cutoffHz,now,.06);\n  attackBus.gain.setTargetAtTime(clamp(attackSfxVolume*mix.attackPresence,0,1.25),now,.06);\n  premiumSubOsc.frequency.setTargetAtTime(mix.subHz,now,.08);\n  premiumAirOsc.frequency.setTargetAtTime(mix.airHz,now,.08);\n  premiumAtmosFilter.frequency.setTargetAtTime(clamp(mix.cutoffHz*.075,480,980),now,.10);\n  const pulse=.82+.18*Math.sin((performance.now()/1000)*Math.PI*2*mix.pulseHz);\n  const targetAtmosphere=clamp(mix.atmosphereGain*pulse,0,.08);\n  premiumAtmosBus.gain.setTargetAtTime(targetAtmosphere,now,.08);\n}\n\nfunction getAudio(){`;
replaceOnce('premium-audio-bridge',attackVolumeAnchor,audioBridge,'function applyPremiumAudioMix(mix)');

const duplicateFrameUpdate=`  window.BreakPremiumRuntime?.updateFrame?.(frameDt,premiumFrameState());\n  const premiumFrame=window.BreakPremiumRuntime?.updateFrame?.(frameDt,premiumFrameState());\n  const premiumHitStop=Math.max(0,Number(premiumFrame?.camera?.hitStopMs)||0)/1000;`;
const singleFrameUpdate=`  const premiumFrame=window.BreakPremiumRuntime?.updateFrame?.(frameDt,premiumFrameState());\n  applyPremiumAudioMix(premiumFrame?.audio);\n  const premiumHitStop=Math.max(0,Number(premiumFrame?.camera?.hitStopMs)||0)/1000;`;
replaceOnce('premium-frame-audio',duplicateFrameUpdate,singleFrameUpdate,'applyPremiumAudioMix(premiumFrame?.audio);');

if(changed){
  fs.writeFileSync(path,source);
  console.log('Premium audio integration applied.');
}else{
  console.log('Premium audio integration already present.');
}
