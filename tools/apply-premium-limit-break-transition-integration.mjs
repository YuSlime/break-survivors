import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM LIMIT BREAK TRANSITION V1';

if(source.includes(marker)){
  console.log('Premium LIMIT BREAK transition already integrated');
  process.exit(0);
}

function replaceOnce(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
}

replaceOnce(
  'limit-break-transition-css',
  `  #lbEventOverlay.show{opacity:1}\n`,
  `  #lbEventOverlay.show{opacity:1}\n  /* PREMIUM LIMIT BREAK TRANSITION V1 */\n  #lbEventOverlay.show.premium-calm{\n    opacity:.94;filter:brightness(.68) saturate(.70);\n    background:radial-gradient(circle at 50% 50%,#06071155 0 18%,#020309e8 70%,#010207f5 100%);\n    transition:opacity .08s linear,filter .12s ease-out;\n  }\n  #lbEventOverlay.show.premium-lock{\n    opacity:1;filter:brightness(.92) saturate(.96);\n    background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--lbColor,#df6cff) 10%,#070812) 0 22%,#03040ce8 72%);\n    box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--lbColor,#df6cff) 42%,transparent),inset 0 0 110px #000d;\n    animation:premiumLbLock .24s steps(3,end) both;\n  }\n  #lbEventOverlay.show.premium-ignite{\n    opacity:1;filter:brightness(1.18) saturate(1.24);\n    background:radial-gradient(circle at 50% 50%,color-mix(in srgb,var(--lbColor,#df6cff) 20%,transparent) 0 25%,#05060bd4 72%);\n    box-shadow:inset 0 0 155px color-mix(in srgb,var(--lbColor,#df6cff) 46%,transparent);\n    animation:premiumLbIgnite .34s cubic-bezier(.14,.78,.2,1) both;\n  }\n  #lbEventOverlay.show.premium-lock b{letter-spacing:.085em;transform:scale(.96)}\n  #lbEventOverlay.show.premium-ignite b{transform:scale(1.035);text-shadow:0 4px 28px #000,0 0 42px var(--lbColor,#df6cff)}\n  @keyframes premiumLbLock{0%{transform:translateX(-2px)}35%{transform:translateX(2px)}70%{transform:translateX(-1px)}100%{transform:translateX(0)}}\n  @keyframes premiumLbIgnite{0%{opacity:.62;filter:brightness(.72) saturate(.8)}24%{opacity:1;filter:brightness(1.55) saturate(1.42)}100%{opacity:1;filter:brightness(1.18) saturate(1.24)}}\n`
);

replaceOnce(
  'limit-break-transition-audio-cues',
  `function playLbEventCue(key,intensity=1){\n  if(!soundEnabled)return;\n  const k=clamp(intensity,0,1.5);\n  if(key==='countdown'){`,
  `function playLbEventCue(key,intensity=1){\n  if(!soundEnabled)return;\n  const k=clamp(intensity,0,1.5);\n  if(key==='lb-calm'){\n    oscTone(48,.18,'sine',.026*k,34,0,.008);\n    noiseBurst(.075,.006*k,'lowpass',260,.01);\n  }else if(key==='lb-lock'){\n    oscTone(124,.075,'square',.012*k,88,0,.003);\n    metallicPing(690,.010*k,.035);\n  }else if(key==='lb-ignite'){\n    oscTone(52,.30,'sine',.072*k,31,0,.006);\n    oscTone(164,.15,'triangle',.026*k,328,.025,.004);\n    noiseBurst(.12,.020*k,'highpass',1650,.025);\n  }else if(key==='countdown'){`
);

const helperAnchor=`function startLimitBreakEvent(milestone,direct=false){`;
const helper=`let premiumLbTransitionToken=0;
function beginPremiumLimitBreakTransition(e){
  const sequence=window.BreakPremiumRuntime?.getLimitBreakTransition?.();
  if(!sequence){
    startLbEventMusic(e.type);
    playLbEventCue(e.type==='apocalypse'?'apocalypse':'warning',e.type==='apocalypse'?1.15:1);
    playLbEventCue('countdown',.9);
    showLbSplash('LIMIT BREAK EVENT',lbEventName(e.type)+'  •  TIER '+e.tier,lbEventColor(e.type),720);
    return;
  }

  const token=++premiumLbTransitionToken;
  const box=document.getElementById('lbEventOverlay');
  const intensity=e.type==='apocalypse'?1.15:1;
  const color=lbEventColor(e.type);
  showLbSplash('LIMIT BREAK',lbEventName(e.type)+'  •  TIER '+e.tier,color,sequence.totalMs);

  for(const beat of sequence.beats){
    setTimeout(()=>{
      if(token!==premiumLbTransitionToken||e.runGeneration!==lbRunGeneration||lbEventState!==e)return;
      box?.classList.remove('premium-calm','premium-lock','premium-ignite');
      box?.classList.add('premium-'+beat.id);
      playLbEventCue(sequence.cues[beat.id],intensity);

      const ringCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,4)??1;
      if(ringCount>0)rings.push({
        x:player.x,y:player.y,r:Math.max(5,player.r*.45),max:105*beat.ringScale,
        life:beat.ringLife,total:beat.ringLife,color:beat.id==='calm'?'#78699b':beat.id==='lock'?'#d9b6ff':color
      });

      const burst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',beat.particleCount,4)??beat.particleCount;
      for(let i=0;i<burst;i++){
        const a=(i/Math.max(1,burst))*Math.PI*2+rnd(-.20,.20);
        const speed=beat.id==='calm'?rnd(24,62):beat.id==='lock'?rnd(48,110):rnd(110,245);
        particles.push({
          x:player.x,y:player.y,
          vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
          life:rnd(beat.ringLife*.75,beat.ringLife*1.35),
          size:rnd(1.5,beat.id==='ignite'?6.5:4.2),
          color:beat.id==='calm'?'#8a7aa8':beat.id==='lock'?'#eadcff':i%3===0?'#ffffff':color
        });
      }

      if(beat.relight)startLbEventMusic(e.type);
    },beat.atMs);
  }

  setTimeout(()=>{
    if(token!==premiumLbTransitionToken)return;
    box?.classList.remove('premium-calm','premium-lock','premium-ignite');
  },sequence.totalMs);
}

function startLimitBreakEvent(milestone,direct=false){`;
replaceOnce('limit-break-transition-helper',helperAnchor,helper);

replaceOnce(
  'limit-break-transition-start',
  `function startLimitBreakEvent(milestone,direct=false){\n  const e=createLbEventState(milestone);\n  lbEventState=e;\n  startLbEventMusic(e.type);\n  if(direct){\n    startLbEventCombat(e);\n  }else{\n    playLbEventCue(e.type==='apocalypse'?'apocalypse':'warning',e.type==='apocalypse'?1.15:1);\n    playLbEventCue('countdown',.9);\n    showLbSplash('LIMIT BREAK EVENT',lbEventName(e.type)+'  •  TIER '+e.tier,lbEventColor(e.type),720);\n  }\n}`,
  `function startLimitBreakEvent(milestone,direct=false){\n  const e=createLbEventState(milestone);\n  lbEventState=e;\n  if(direct){\n    startLbEventMusic(e.type);\n    startLbEventCombat(e);\n  }else{\n    beginPremiumLimitBreakTransition(e);\n  }\n}`
);

replaceOnce(
  'limit-break-transition-hide-cleanup',
  `function hideLbSplash(){\n  clearTimeout(lbOverlayTimer);\n  document.getElementById('lbEventOverlay')?.classList.remove('show');\n}`,
  `function hideLbSplash(){\n  clearTimeout(lbOverlayTimer);\n  premiumLbTransitionToken++;\n  document.getElementById('lbEventOverlay')?.classList.remove('show','premium-calm','premium-lock','premium-ignite');\n}`
);

fs.writeFileSync(path,source);
console.log('Applied Premium LIMIT BREAK transition integration');
