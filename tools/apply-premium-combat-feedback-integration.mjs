import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
let changed=false;

const marker='// PREMIUM COMBAT FEEDBACK V1';
const shakeGuardMarker='// PREMIUM COMBAT FEEDBACK SHAKE GUARD';

function replaceOnce(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
  changed=true;
}

if(!source.includes(marker)){
  const audioAnchor=`function playGachaSfx(kind){`;
  const audioBlock=`// PREMIUM COMBAT FEEDBACK V1
const premiumCombatFeedbackSfxAt={};
function playPremiumCombatFeedbackSfx(cue){
  if(!soundEnabled)return;
  const now=performance.now();
  const gaps={
    critical:72,'elite-kill':170,
    'tactical-support':120,'tactical-assassin':110,
    'tactical-summoner':145,'tactical-shielder':145
  };
  if(now-(premiumCombatFeedbackSfxAt[cue]||0)<(gaps[cue]||100))return;
  premiumCombatFeedbackSfxAt[cue]=now;
  if(cue==='critical'){
    oscTone(760,.055,'triangle',.013,1180);
    metallicPing(1480,.010,.045);
  }else if(cue==='elite-kill'){
    oscTone(92,.16,'sine',.035,54);
    oscTone(420,.13,'triangle',.020,780,.025);
    noiseBurst(.08,.018,'bandpass',900,.025);
  }else if(cue==='tactical-support'){
    oscTone(260,.09,'sine',.017,520);
    metallicPing(860,.009,.030);
  }else if(cue==='tactical-assassin'){
    oscTone(390,.065,'triangle',.014,960);
    noiseBurst(.045,.010,'highpass',2100,.012);
  }else if(cue==='tactical-summoner'){
    oscTone(150,.11,'sine',.021,360);
    oscTone(300,.08,'triangle',.012,620,.025);
  }else if(cue==='tactical-shielder'){
    oscTone(110,.12,'sine',.026,72);
    metallicPing(620,.012,.040);
  }
}

function playGachaSfx(kind){`;
  replaceOnce('combat-feedback-audio',audioAnchor,audioBlock);

  const criticalFrom=`    if(crit && floatingTexts.length<42){
      floatingTexts.push({
        x:e.x,y:e.y-12,text:'CRIT '+Math.ceil(actualDmg),
        color:'#fff06c',life:.48,total:.48,vy:-62,size:crit?17:13,weight:1000
      });
      shake=Math.min(14,shake+1.5);
    }`;
  const criticalTo=`    if(crit && floatingTexts.length<42){
      floatingTexts.push({
        x:e.x,y:e.y-12,text:'CRIT '+Math.ceil(actualDmg),
        color:'#fff06c',life:.48,total:.48,vy:-62,size:crit?17:13,weight:1000
      });
    }

    const premiumHitFeedback=window.BreakPremiumRuntime?.resolveCombatFeedback?.({event:'hit',critical:crit,enemyType:e.type});
    if(premiumHitFeedback){
      window.BreakPremiumRuntime?.signal?.(premiumHitFeedback.cameraSignal,{direction:{x:e.x-player.x,y:e.y-player.y}});
      playPremiumCombatFeedbackSfx(premiumHitFeedback.audioCue);
      const premiumHitRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumHitFeedback.priority)??1;
      if(premiumHitRingCount>0)rings.push({
        x:e.x,y:e.y,r:2,max:Math.max(18,e.r*premiumHitFeedback.ringScale),
        life:premiumHitFeedback.ringLife,total:premiumHitFeedback.ringLife,color:premiumHitFeedback.color
      });
      const premiumHitBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',premiumHitFeedback.particleCount,premiumHitFeedback.priority)??premiumHitFeedback.particleCount;
      for(let i=0;i<premiumHitBurst;i++)particles.push({
        x:e.x,y:e.y,vx:rnd(-145,145),vy:rnd(-145,145),
        life:rnd(.10,.22),size:rnd(1.5,4.2),color:premiumHitFeedback.color
      });
    }`;
  replaceOnce('combat-feedback-critical',criticalFrom,criticalTo);

  replaceOnce(
    'combat-feedback-legacy-kill-signal',
    `  const premiumDeathEvent=e.type==='boss'?'bossKill':e.type==='elite'?'eliteKill':meta.critical?'critical':null;`,
    `  const premiumDeathEvent=e.type==='boss'?'bossKill':null;`
  );

  const coinAnchor=`  const coinGain=Math.max(1,Math.floor(e.reward*ps.coinMul*breakCoinMultiplier()*eventCoinMultiplier()));`;
  const coinWithFeedback=`  const coinGain=Math.max(1,Math.floor(e.reward*ps.coinMul*breakCoinMultiplier()*eventCoinMultiplier()));
  const premiumKillFeedback=window.BreakPremiumRuntime?.resolveCombatFeedback?.({event:'kill',enemyType:e.type,coinGain});
  if(premiumKillFeedback){
    window.BreakPremiumRuntime?.signal?.(premiumKillFeedback.cameraSignal,{direction:{x:e.x-player.x,y:e.y-player.y}});
    playPremiumCombatFeedbackSfx(premiumKillFeedback.audioCue);
    const premiumKillRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumKillFeedback.priority)??1;
    if(premiumKillRingCount>0)rings.push({
      x:e.x,y:e.y,r:Math.max(4,e.r*.2),max:e.r*premiumKillFeedback.ringScale,
      life:premiumKillFeedback.ringLife,total:premiumKillFeedback.ringLife,color:premiumKillFeedback.color
    });
    const premiumKillBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',premiumKillFeedback.particleCount,premiumKillFeedback.priority)??premiumKillFeedback.particleCount;
    for(let i=0;i<premiumKillBurst;i++)particles.push({
      x:e.x,y:e.y,vx:rnd(-220,220),vy:rnd(-220,220),
      life:rnd(.18,.46),size:rnd(2,6),color:premiumKillFeedback.color
    });
    if(floatingTexts.length<42)floatingTexts.push({
      x:e.x,y:e.y-22,text:premiumKillFeedback.label+' // '+premiumKillFeedback.rewardLabel,
      color:premiumKillFeedback.color,life:.72,total:.72,vy:-52,size:14,weight:1000
    });
  }`;
  replaceOnce('combat-feedback-kill',coinAnchor,coinWithFeedback);
}else{
  console.log('Premium combat feedback already integrated');
}

if(!source.includes(shakeGuardMarker)){
  replaceOnce(
    'combat-feedback-legacy-shake-guard',
    `  if(meta.overkill)deathShake*=1.35;\n  shake=Math.min(16,shake+deathShake);`,
    `  if(meta.overkill)deathShake*=1.35;\n  ${shakeGuardMarker}\n  if(!premiumKillFeedback&&!premiumDeathEvent)shake=Math.min(16,shake+deathShake);`
  );
}

if(changed){
  fs.writeFileSync(path,source);
  console.log('Applied Premium combat feedback integration');
}else{
  console.log('Premium combat feedback already integrated');
}
