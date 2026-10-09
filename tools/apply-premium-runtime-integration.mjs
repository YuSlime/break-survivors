// One-shot guarded integrator for the Premium Edition foundation branch.
// Integration revision 4: expose live character combat state to Premium HUD.
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
  'camera-draw',
  `  const sx=visibleShake?rnd(-visibleShake,visibleShake):0, sy=visibleShake?rnd(-visibleShake,visibleShake):0;\n  shake*=shakeProfile.decay;\n  if(shake<.025)shake=0;\n  ctx.translate(sx,sy);`,
  `  const sx=visibleShake?rnd(-visibleShake,visibleShake):0, sy=visibleShake?rnd(-visibleShake,visibleShake):0;\n  const premiumCamera=window.BreakPremiumRuntime?.cameraState;\n  const premiumShake=Math.max(0,Number(premiumCamera?.shake)||0);\n  const premiumSx=premiumShake?rnd(-premiumShake,premiumShake):0;\n  const premiumSy=premiumShake?rnd(-premiumShake,premiumShake):0;\n  shake*=shakeProfile.decay;\n  if(shake<.025)shake=0;\n  ctx.translate(sx+premiumSx+(premiumCamera?.kickX||0),sy+premiumSy+(premiumCamera?.kickY||0));`
);

replaceOnce(
  'enemy-death-signal',
  `function killEnemy(e,meta={}){\n  if(e.dead) return;\n  e.dead=true;`,
  `function killEnemy(e,meta={}){\n  if(e.dead) return;\n  e.dead=true;\n  const premiumDeathEvent=e.type==='boss'?'bossKill':e.type==='elite'?'eliteKill':meta.critical?'critical':null;\n  if(premiumDeathEvent)window.BreakPremiumRuntime?.signal?.(premiumDeathEvent,{direction:{x:e.x-player.x,y:e.y-player.y}});`
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
