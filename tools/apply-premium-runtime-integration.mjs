// One-shot guarded integrator for the Premium Edition foundation branch.
// Integration revision 7: bridge one-shot Premium hit stop into the legacy simulation freeze gate.
import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
let changed=false;

function replaceOnce(label,from,to){
  if(source.includes(to))return;
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
