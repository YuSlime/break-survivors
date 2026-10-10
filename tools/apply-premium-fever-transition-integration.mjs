import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM FEVER TRANSITION V1';

if(source.includes(marker)){
  console.log('Premium FEVER transition already integrated');
  process.exit(0);
}

function replaceOnce(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
}

replaceOnce(
  'fever-transition-css',
  `  #feverOverlay.show{opacity:1;animation:feverPulse .62s ease-in-out infinite alternate}\n`,
  `  #feverOverlay.show{opacity:1;animation:feverPulse .62s ease-in-out infinite alternate}\n  /* PREMIUM FEVER TRANSITION V1 */\n  #feverOverlay.show.premium-precharge{opacity:.52;animation:premiumFeverCharge var(--fever-precharge,110ms) ease-out both}\n  #feverOverlay.show.premium-burst{opacity:1;animation:premiumFeverBurst var(--fever-burst,360ms) cubic-bezier(.12,.82,.22,1) both}\n  #feverOverlay.premium-release{animation:premiumFeverRelease var(--fever-release,420ms) ease-out both}\n  @keyframes premiumFeverCharge{from{opacity:.18;filter:brightness(.78) saturate(.82)}to{opacity:.62;filter:brightness(1.28) saturate(1.18)}}\n  @keyframes premiumFeverBurst{0%{opacity:.72;filter:brightness(1.9) saturate(1.45)}24%{opacity:1;filter:brightness(1.55) saturate(1.35)}100%{opacity:.88;filter:brightness(1.08) saturate(1.08)}}\n  @keyframes premiumFeverRelease{0%{opacity:.72;filter:brightness(1.15)}100%{opacity:0;filter:brightness(.92)}}\n`
);

replaceOnce(
  'fever-transition-audio-gates',
  `    'boss-fracture':260,'boss-core':320,'boss-rupture':520,\n    'tactical-support':120,`,
  `    'boss-fracture':260,'boss-core':320,'boss-rupture':520,\n    'fever-charge':180,'fever-burst':260,'fever-release':260,\n    'tactical-support':120,`
);

replaceOnce(
  'fever-transition-audio-cues',
  `  }else if(cue==='boss-rupture'){\n    oscTone(68,.28,'sine',.050,38);\n    noiseBurst(.15,.028,'highpass',1900,.025);\n    oscTone(340,.16,'triangle',.018,680,.04);\n  }else if(cue==='elite-kill'){`,
  `  }else if(cue==='boss-rupture'){\n    oscTone(68,.28,'sine',.050,38);\n    noiseBurst(.15,.028,'highpass',1900,.025);\n    oscTone(340,.16,'triangle',.018,680,.04);\n  }else if(cue==='fever-charge'){\n    oscTone(170,.11,'sine',.015,360);\n    noiseBurst(.055,.008,'bandpass',980,.015);\n  }else if(cue==='fever-burst'){\n    oscTone(82,.20,'sine',.038,48);\n    oscTone(520,.14,'triangle',.020,1040,.02);\n    noiseBurst(.10,.018,'highpass',1750,.018);\n  }else if(cue==='fever-release'){\n    oscTone(420,.10,'triangle',.010,220);\n  }else if(cue==='elite-kill'){`
);

const helperAnchor=`function startFever(){`;
const helper=`let premiumFeverTransitionToken=0;
function beginPremiumFeverTransition(){
  const sequence=window.BreakPremiumRuntime?.getFeverTransition?.();
  const overlay=document.getElementById('feverOverlay');
  if(!sequence){
    window.BreakPremiumRuntime?.signal?.('fever',{direction:{x:0,y:0}});
    shake=Math.max(shake,10);
    rings.push({x:player.x,y:player.y,r:12,max:190,life:.55,total:.55,color:'#ffd85c'});
    for(let i=0;i<34;i++)particles.push({x:player.x,y:player.y,vx:rnd(-260,260),vy:rnd(-260,260),life:rnd(.35,.8),size:rnd(2,7),color:i%3===0?'#ff86cb':i%2?'#ffe260':'#8cf3ff'});
    return;
  }

  const token=++premiumFeverTransitionToken;
  if(overlay){
    overlay.classList.remove('premium-burst','premium-release');
    overlay.classList.add('premium-precharge');
    overlay.style.setProperty('--fever-precharge',sequence.prechargeMs+'ms');
    overlay.style.setProperty('--fever-burst',sequence.burstHoldMs+'ms');
    overlay.style.setProperty('--fever-release',sequence.releaseMs+'ms');
  }
  playPremiumCombatFeedbackSfx(sequence.cues.charge);

  setTimeout(()=>{
    if(token!==premiumFeverTransitionToken||!running||!feverActive())return;
    overlay?.classList.remove('premium-precharge','premium-release');
    overlay?.classList.add('premium-burst');
    window.BreakPremiumRuntime?.signal?.('fever',{direction:{x:0,y:0}});
    playPremiumCombatFeedbackSfx(sequence.cues.burst);

    const ringCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,4)??1;
    if(ringCount>0)rings.push({
      x:player.x,y:player.y,r:12,max:90*sequence.ringScale,
      life:sequence.ringLife,total:sequence.ringLife,color:'#ffd85c'
    });
    const burst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',sequence.particleCount,4)??sequence.particleCount;
    for(let i=0;i<burst;i++)particles.push({
      x:player.x,y:player.y,vx:rnd(-265,265),vy:rnd(-265,265),
      life:rnd(.30,.72),size:rnd(2,7),color:i%3===0?'#ff86cb':i%2?'#ffe260':'#8cf3ff'
    });
  },sequence.prechargeMs);

  setTimeout(()=>{
    if(token!==premiumFeverTransitionToken)return;
    overlay?.classList.remove('premium-burst');
  },sequence.prechargeMs+sequence.burstHoldMs);
}

function endPremiumFeverTransition(){
  const sequence=window.BreakPremiumRuntime?.getFeverTransition?.();
  const overlay=document.getElementById('feverOverlay');
  premiumFeverTransitionToken++;
  overlay?.classList.remove('premium-precharge','premium-burst');
  if(!sequence){overlay?.classList.remove('premium-release');return}
  playPremiumCombatFeedbackSfx(sequence.cues.release);
  overlay?.classList.add('premium-release');
  setTimeout(()=>overlay?.classList.remove('premium-release'),sequence.releaseMs);
}

function startFever(){`;
replaceOnce('fever-transition-helpers',helperAnchor,helper);

replaceOnce(
  'fever-transition-start',
  `function startFever(){\n  feverTime=FEVER_DURATION+getCoreEffects().feverDuration;\n  window.BreakPremiumRuntime?.signal?.('fever',{direction:{x:0,y:0}});\n  breakTimer=Math.max(breakTimer,3.2);\n  showBreakCallout('BREAK FEVER!','ATTACK SPEED +35% / MOVE +20% / COINS ×2.2','#ffe15b');\n  shake=Math.max(shake,10);\n  rings.push({x:player.x,y:player.y,r:12,max:190,life:.55,total:.55,color:'#ffd85c'});\n  for(let i=0;i<34;i++)particles.push({x:player.x,y:player.y,vx:rnd(-260,260),vy:rnd(-260,260),life:rnd(.35,.8),size:rnd(2,7),color:i%3===0?'#ff86cb':i%2?'#ffe260':'#8cf3ff'});\n}`,
  `function startFever(){\n  feverTime=FEVER_DURATION+getCoreEffects().feverDuration;\n  breakTimer=Math.max(breakTimer,3.2);\n  showBreakCallout('BREAK FEVER!','ATTACK SPEED +35% / MOVE +20% / COINS ×2.2','#ffe15b');\n  beginPremiumFeverTransition();\n}`
);

replaceOnce(
  'fever-transition-end',
  `    if(feverTime===0)showBreakCallout('FEVER END','KEEP THE CHAIN','#d8e5ff');`,
  `    if(feverTime===0){\n      endPremiumFeverTransition();\n      showBreakCallout('FEVER END','KEEP THE CHAIN','#d8e5ff');\n    }`
);

fs.writeFileSync(path,source);
console.log('Applied Premium FEVER transition integration');
