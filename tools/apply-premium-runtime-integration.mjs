// One-shot guarded integrator for the Premium Edition foundation branch.
// Integration revision 9: wire explicitly opted-in combat V2 tactical enemies into the live game.
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

replaceOnce(
  'module-loader',
  '</script>\n</body>',
  '</script>\n<script type="module" src="./src/game/premium-runtime.js"></script>\n</body>'
);

replaceOnce(
  'frame-state',
  'let last=performance.now(),simAccumulator=0;\nfunction loop(now){',
  `function premiumFrameState(){\n  const activeEnemies=enemies.filter(e=>!e.dead);\n  const boss=activeEnemies.find(e=>e.type==='boss')||null;\n  return {\n    highDensity:activeEnemies.length>=45,\n    breakActive:breakCombo>=10,\n    eliteActive:activeEnemies.some(e=>e.type==='elite'),\n    feverActive:feverActive(),\n    limitBreakActive:limitBreakLevel>0||!!lbEventState,\n    bossFinalPhase:!!(boss&&boss.maxHp>0&&boss.hp/boss.maxHp<=.15)\n  };\n}\n\nlet last=performance.now(),simAccumulator=0;\nfunction loop(now){`
);

replaceOnce(
  'signature-frame-state',
  `    bossFinalPhase:!!(boss&&boss.maxHp>0&&boss.hp/boss.maxHp<=.15)\n  };`,
  `    bossFinalPhase:!!(boss&&boss.maxHp>0&&boss.hp/boss.maxHp<=.15),\n    characterId:currentCharacter.id,\n    characterLevel:charLevel(currentCharacter.id),\n    gunnerMomentum,\n    attackCounters\n  };`
);

replaceOnce(
  'frame-update',
  '  const frameDt=Math.max(0,(now-last)/1000);last=now;\n',
  '  const frameDt=Math.max(0,(now-last)/1000);last=now;\n  window.BreakPremiumRuntime?.updateFrame?.(frameDt,premiumFrameState());\n'
);

replaceOnce(
  'premium-hit-stop',
  `  window.BreakPremiumRuntime?.updateFrame?.(frameDt,premiumFrameState());\n`,
  `  const premiumFrame=window.BreakPremiumRuntime?.updateFrame?.(frameDt,premiumFrameState());\n  const premiumHitStop=Math.max(0,Number(premiumFrame?.camera?.hitStopMs)||0)/1000;\n  if(premiumHitStop>0)hitStop=Math.max(hitStop,premiumHitStop);\n`
);

replaceOnce(
  'camera-draw',
  `  const sx=visibleShake?rnd(-visibleShake,visibleShake):0, sy=visibleShake?rnd(-visibleShake,visibleShake):0;\n  shake*=shakeProfile.decay;\n  if(shake<.025)shake=0;\n  ctx.translate(sx,sy);`,
  `  const sx=visibleShake?rnd(-visibleShake,visibleShake):0, sy=visibleShake?rnd(-visibleShake,visibleShake):0;\n  const premiumCamera=window.BreakPremiumRuntime?.cameraState;\n  const premiumShake=Math.max(0,Number(premiumCamera?.shake)||0);\n  const premiumSx=premiumShake?rnd(-premiumShake,premiumShake):0;\n  const premiumSy=premiumShake?rnd(-premiumShake,premiumShake):0;\n  shake*=shakeProfile.decay;\n  if(shake<.025)shake=0;\n  ctx.translate(sx+premiumSx+(premiumCamera?.kickX||0),sy+premiumSy+(premiumCamera?.kickY||0));`
);

replaceOnce(
  'camera-world-zoom',
  `  const grid=48;\n  const halfViewW=W/(2*CAMERA_ZOOM);\n  const halfViewH=H/(2*CAMERA_ZOOM);`,
  `  const grid=48;\n  const premiumWorldZoom=Math.max(.96,Math.min(1.10,Number(premiumCamera?.zoom)||1));\n  const effectiveCameraZoom=CAMERA_ZOOM*premiumWorldZoom;\n  const halfViewW=W/(2*effectiveCameraZoom);\n  const halfViewH=H/(2*effectiveCameraZoom);`
);

replaceOnce(
  'camera-world-scale',
  `  ctx.translate(W/2,H/2);\n  ctx.scale(CAMERA_ZOOM,CAMERA_ZOOM);\n  ctx.translate(-cameraX,-cameraY);`,
  `  ctx.translate(W/2,H/2);\n  ctx.scale(effectiveCameraZoom,effectiveCameraZoom);\n  ctx.translate(-cameraX,-cameraY);`
);

replaceOnce(
  'camera-grid-line-width',
  `  ctx.strokeStyle='#151f31';ctx.lineWidth=1/CAMERA_ZOOM;`,
  `  ctx.strokeStyle='#151f31';ctx.lineWidth=1/effectiveCameraZoom;`
);

replaceOnce(
  'camera-border-normalization',
  `  ctx.shadowBlur=fxBlur(28/CAMERA_ZOOM);\n  ctx.shadowColor='#5b8dcb';\n  ctx.strokeStyle='#5579a8';\n  ctx.lineWidth=8/CAMERA_ZOOM;\n  ctx.strokeRect(0,0,WORLD_W,WORLD_H);\n  ctx.shadowBlur=fxBlur(0);\n  ctx.strokeStyle='#a7c9ef';\n  ctx.lineWidth=2/CAMERA_ZOOM;`,
  `  ctx.shadowBlur=fxBlur(28/effectiveCameraZoom);\n  ctx.shadowColor='#5b8dcb';\n  ctx.strokeStyle='#5579a8';\n  ctx.lineWidth=8/effectiveCameraZoom;\n  ctx.strokeRect(0,0,WORLD_W,WORLD_H);\n  ctx.shadowBlur=fxBlur(0);\n  ctx.strokeStyle='#a7c9ef';\n  ctx.lineWidth=2/effectiveCameraZoom;`
);

replaceOnce(
  'tactical-spawn-definition',
  `function spawnEnemy(type='normal',opts={}){\n  const d=enemyDefs[type]; if(!d)return null;`,
  `function spawnEnemy(type='normal',opts={}){\n  const premiumDef=window.BreakPremiumRuntime?.getTacticalEnemyDefinition?.(type)||null;\n  const d=enemyDefs[type]||(premiumDef?{...premiumDef,r:premiumDef.radius}:null); if(!d)return null;`
);

replaceOnce(
  'tactical-spawn-state',
  `    lbEventTier:opts.lbEventTier??null,lbEventPhase:opts.lbEventPhase??null,\n    eliteVariant:opts.eliteVariant??null,lbKillCredited:false\n  };`,
  `    lbEventTier:opts.lbEventTier??null,lbEventPhase:opts.lbEventPhase??null,\n    eliteVariant:opts.eliteVariant??null,lbKillCredited:false,\n    premiumDef:premiumDef?d:null,\n    premiumDashTime:0,premiumDashDx:0,premiumDashDy:0,\n    premiumSpecialCd:type==='assassin'?rnd(1.0,2.0):0,\n    premiumSummonCd:type==='summoner'?rnd(2.8,d.summonInterval||5.4):0\n  };`
);

replaceOnce(
  'tactical-spawn-picker',
  `function pickThreatSpawnType(state){\n  if(eventActive('swarm'))return Math.random()<.58?'runner':'normal';\n  if(gameTime>120&&Math.random()<getThreatEliteChance(state,gameTime))return 'elite';\n  const r=Math.random();`,
  `function pickThreatSpawnType(state){\n  if(eventActive('swarm'))return Math.random()<.58?'runner':'normal';\n  if(gameTime>120&&Math.random()<getThreatEliteChance(state,gameTime))return 'elite';\n  const premiumTacticalType=window.BreakPremiumRuntime?.pickTacticalEnemy?.({\n    gameTime,\n    threat:threatLevel,\n    roll:Math.random()\n  });\n  if(premiumTacticalType)return premiumTacticalType;\n  const r=Math.random();`
);

replaceOnce(
  'tactical-damage-aura',
  `  if(impact&&core.doubleStrikeChance>0&&Math.random()<core.doubleStrikeChance)actualDmg*=2;\n  e.hp-=actualDmg;`,
  `  if(impact&&core.doubleStrikeChance>0&&Math.random()<core.doubleStrikeChance)actualDmg*=2;\n  const premiumAuraState=window.BreakPremiumRuntime?.resolveTacticalAuras?.(e,enemies)||{speedMul:1,touchMul:1,damageTakenMul:1};\n  actualDmg*=premiumAuraState.damageTakenMul;\n  e.hp-=actualDmg;`
);

replaceOnce(
  'tactical-update-behavior',
  `    const d=enemyDefs[e.type];\n    const dx=player.x-e.x,dy=player.y-e.y,l=Math.hypot(dx,dy)||1;\n    // Global aggro: every enemy always knows the player's current position.\n    // Very distant enemies get catch-up speed only until they reach the active battle.\n    const pursuitBoost=l>2200?2.55:l>1500?2.10:l>900?1.55:1;\n    const eliteHandled=updateEliteVariantBehavior(e,dt,dx,dy,l);\n    if(eliteHandled){`,
  `    const d=e.premiumDef||enemyDefs[e.type];\n    const dx=player.x-e.x,dy=player.y-e.y,l=Math.hypot(dx,dy)||1;\n    // Global aggro: every enemy always knows the player's current position.\n    // Very distant enemies get catch-up speed only until they reach the active battle.\n    const pursuitBoost=l>2200?2.55:l>1500?2.10:l>900?1.55:1;\n    const premiumAuraState=window.BreakPremiumRuntime?.resolveTacticalAuras?.(e,enemies)||{speedMul:1,touchMul:1,damageTakenMul:1};\n    const premiumSpeed=e.speed*premiumAuraState.speedMul;\n    let premiumTacticalHandled=false;\n    if(e.type==='assassin'&&e.premiumDef){\n      premiumTacticalHandled=true;\n      e.premiumSpecialCd=Math.max(0,(e.premiumSpecialCd||0)-dt);\n      if(e.premiumDashTime>0){\n        e.x+=e.premiumDashDx*d.dashSpeed*dt;e.y+=e.premiumDashDy*d.dashSpeed*dt;\n        e.premiumDashTime=Math.max(0,e.premiumDashTime-dt);\n      }else if(e.telegraph>0){\n        const previousTelegraph=e.telegraph;\n        e.telegraph=Math.max(0,e.telegraph-dt);e.flash=Math.max(e.flash,.12);\n        if(previousTelegraph>0&&e.telegraph===0){\n          e.premiumDashDx=dx/l;e.premiumDashDy=dy/l;e.premiumDashTime=d.dashDuration;e.premiumSpecialCd=d.dashCooldown;\n        }\n      }else if(e.premiumSpecialCd<=0&&l<620){\n        e.telegraph=d.telegraphSeconds;\n      }else{\n        e.x+=dx/l*premiumSpeed*pursuitBoost*dt;e.y+=dy/l*premiumSpeed*pursuitBoost*dt;\n      }\n    }else if((e.type==='support'||e.type==='summoner'||e.type==='shielder')&&e.premiumDef){\n      premiumTacticalHandled=true;\n      const preferred=d.preferredRange||220;\n      const tacticalDir=l>preferred?1:l<preferred*.72?-1:0;\n      e.x+=dx/l*premiumSpeed*pursuitBoost*tacticalDir*dt;e.y+=dy/l*premiumSpeed*pursuitBoost*tacticalDir*dt;\n      if(e.type==='summoner'){\n        e.premiumSummonCd=Math.max(0,(e.premiumSummonCd||0)-dt);\n        if(e.premiumSummonCd<=0){\n          const summonCount=Math.max(1,d.summonCount||2);\n          for(let i=0;i<summonCount;i++){\n            const a=Math.PI*2*i/summonCount+rnd(-.25,.25),rr=rnd(42,78);\n            spawnEnemy(d.summonType||'normal',{position:{x:clamp(e.x+Math.cos(a)*rr,24,WORLD_W-24),y:clamp(e.y+Math.sin(a)*rr,24,WORLD_H-24)}});\n          }\n          e.premiumSummonCd=d.summonInterval||5.4;\n          rings.push({x:e.x,y:e.y,r:8,max:72,life:.32,total:.32,color:e.color});\n        }\n      }\n    }\n    const eliteHandled=premiumTacticalHandled?false:updateEliteVariantBehavior(e,dt,dx,dy,l);\n    if(premiumTacticalHandled){\n      // Premium tactical behavior already moved this enemy.\n    }else if(eliteHandled){`,
  '// Premium tactical behavior already moved this enemy.'
);

replaceOnce(
  'tactical-normal-speed',
  `    } else {e.x+=dx/l*e.speed*pursuitBoost*dt;e.y+=dy/l*e.speed*pursuitBoost*dt}\n    e.x=clamp(e.x,e.r+WORLD_EDGE_PAD,WORLD_W-e.r-WORLD_EDGE_PAD);`,
  `    } else {e.x+=dx/l*premiumSpeed*pursuitBoost*dt;e.y+=dy/l*premiumSpeed*pursuitBoost*dt}\n    e.x=clamp(e.x,e.r+WORLD_EDGE_PAD,WORLD_W-e.r-WORLD_EDGE_PAD);`
);

replaceOnce(
  'tactical-touch-damage',
  `      lastDamageSource=e.type==='boss'?'VOID TYRANT':e.type==='elite'?(e.eliteVariant?e.eliteVariant.toUpperCase()+' ELITE':'ELITE ENEMY'):e.type.toUpperCase()+' ENEMY';\n      player.hp-=e.touch;player.hitCd=.4;shake=6;`,
  `      lastDamageSource=e.type==='boss'?'VOID TYRANT':e.type==='elite'?(e.eliteVariant?e.eliteVariant.toUpperCase()+' ELITE':'ELITE ENEMY'):e.type.toUpperCase()+' ENEMY';\n      player.hp-=e.touch*premiumAuraState.touchMul;player.hitCd=.4;shake=6;`
);

replaceOnce(
  'tactical-draw-silhouettes',
  `    const bodyColor=e.flash?'#fff':e.gold?'#ffd75b':e.type==='boss'&&e.phase===2?'#ff4f93':e.color;\n    ctx.fillStyle=bodyColor;ctx.shadowBlur=fxBlur(e.type==='treasure'?28:e.type==='boss'?22:e.gold?13:0);ctx.shadowColor=bodyColor;\n    if(e.type==='treasure'){`,
  `    const bodyColor=e.flash?'#fff':e.gold?'#ffd75b':e.type==='boss'&&e.phase===2?'#ff4f93':e.color;\n    ctx.fillStyle=bodyColor;ctx.shadowBlur=fxBlur(e.type==='treasure'?28:e.type==='boss'?22:e.gold?13:0);ctx.shadowColor=bodyColor;\n    if(e.type==='support'){\n      // PREMIUM SUPPORT\n      ctx.save();ctx.globalAlpha=.18;ctx.strokeStyle=e.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.premiumDef?.auraRadius||190,0,Math.PI*2);ctx.stroke();ctx.restore();\n      ctx.fillRect(-e.r*.78,-e.r*.22,e.r*1.56,e.r*.44);ctx.fillRect(-e.r*.22,-e.r*.78,e.r*.44,e.r*1.56);\n      ctx.beginPath();ctx.arc(0,0,e.r*.62,0,Math.PI*2);ctx.strokeStyle='#d8fff0';ctx.lineWidth=2;ctx.stroke();\n    }else if(e.type==='assassin'){\n      // PREMIUM ASSASSIN\n      ctx.rotate(Math.PI/4);ctx.fillRect(-e.r*.72,-e.r*.72,e.r*1.44,e.r*1.44);ctx.rotate(-Math.PI/4);\n      if(e.telegraph>0){ctx.save();ctx.strokeStyle='#ff9cc8';ctx.globalAlpha=.72;ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(player.x-e.x,player.y-e.y);ctx.stroke();ctx.restore()}\n    }else if(e.type==='summoner'){\n      // PREMIUM SUMMONER\n      ctx.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,x=Math.cos(a)*e.r,y=Math.sin(a)*e.r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath();ctx.fill();\n      ctx.strokeStyle='#e6d6ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.r*.55,0,Math.PI*2);ctx.stroke();\n      for(let i=0;i<3;i++){const a=gameTime*1.7+i*Math.PI*2/3;ctx.fillRect(Math.cos(a)*e.r*1.35-2,Math.sin(a)*e.r*1.35-2,4,4)}\n    }else if(e.type==='shielder'){\n      // PREMIUM SHIELDER\n      ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();\n      ctx.save();ctx.globalAlpha=.22;ctx.strokeStyle=e.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,e.premiumDef?.auraRadius||175,0,Math.PI*2);ctx.stroke();ctx.restore();\n      ctx.strokeStyle='#d9efff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r*1.16,-Math.PI*.72,Math.PI*.72);ctx.stroke();\n    }else if(e.type==='treasure'){`
);

replaceOnce(
  'enemy-death-signal',
  `function killEnemy(e,meta={}){\n  if(e.dead) return;\n  e.dead=true;`,
  `function killEnemy(e,meta={}){\n  if(e.dead) return;\n  e.dead=true;\n  const premiumDeathEvent=e.type==='boss'?'bossKill':e.type==='elite'?'eliteKill':meta.critical?'critical':null;\n  if(premiumDeathEvent)window.BreakPremiumRuntime?.signal?.(premiumDeathEvent,{direction:{x:e.x-player.x,y:e.y-player.y}});`
);

replaceOnce(
  'enemy-death-vfx-ring',
  `  rings.push({\n    x:e.x,y:e.y,r:Math.max(3,e.r*.25),\n    max:e.r*(e.type==='boss'?3.1:e.type==='treasure'?2.8:e.type==='elite'?2.2:meta.overkill?2.15:1.75),\n    life:e.type==='boss'?.42:e.type==='elite'?.28:.18,\n    total:e.type==='boss'?.42:e.type==='elite'?.28:.18,\n    color:meta.overkill?'#ffd95e':e.type==='boss'?'#ffd86f':e.color\n  });`,
  `  const premiumVfxPriority=e.type==='boss'?5:e.type==='treasure'?4:e.type==='elite'?3:meta.overkill?2:1;\n  const premiumRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumVfxPriority)??1;\n  if(premiumRingCount>0)rings.push({\n    x:e.x,y:e.y,r:Math.max(3,e.r*.25),\n    max:e.r*(e.type==='boss'?3.1:e.type==='treasure'?2.8:e.type==='elite'?2.2:meta.overkill?2.15:1.75),\n    life:e.type==='boss'?.42:e.type==='elite'?.28:.18,\n    total:e.type==='boss'?.42:e.type==='elite'?.28:.18,\n    color:meta.overkill?'#ffd95e':e.type==='boss'?'#ffd86f':e.color\n  });`
);

replaceOnce(
  'enemy-death-vfx-particles',
  `  const burst=e.type==='boss'?42:e.type==='treasure'?34:e.type==='elite'?26:meta.overkill?20:12;\n  for(let i=0;i<burst;i++) particles.push({`,
  `  const burst=e.type==='boss'?42:e.type==='treasure'?34:e.type==='elite'?26:meta.overkill?20:12;\n  const premiumBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',burst,premiumVfxPriority)??burst;\n  for(let i=0;i<premiumBurst;i++) particles.push({`
);

replaceOnce(
  'fever-signal',
  `function startFever(){\n  feverTime=FEVER_DURATION+getCoreEffects().feverDuration;`,
  `function startFever(){\n  feverTime=FEVER_DURATION+getCoreEffects().feverDuration;\n  window.BreakPremiumRuntime?.signal?.('fever',{direction:{x:0,y:0}});`
);

replaceOnce(
  'limit-break-signal',
  `  if(state.limitBreak>limitBreakLevel){\n    const previousLb=limitBreakLevel;`,
  `  if(state.limitBreak>limitBreakLevel){\n    window.BreakPremiumRuntime?.signal?.('limitBreak',{direction:{x:0,y:0}});\n    const previousLb=limitBreakLevel;`
);

replaceOnce(
  'break-signal',
  `  if(breakCombo===10)showBreakCallout('BREAK ×1.2','KEEP KILLING','#73e8ff');`,
  `  if(breakCombo===10){window.BreakPremiumRuntime?.signal?.('break',{direction:{x:0,y:0}});showBreakCallout('BREAK ×1.2','KEEP KILLING','#73e8ff')}`
);

replaceOnce(
  'run-reset',
  `function resetRun(){\n  attackType=currentCharacter.attack;`,
  `function resetRun(){\n  window.BreakPremiumRuntime?.reset?.();\n  attackType=currentCharacter.attack;`
);

if(changed){
  fs.writeFileSync(path,source);
  console.log('Premium runtime integration applied.');
}else{
  console.log('Premium runtime integration already present.');
}
