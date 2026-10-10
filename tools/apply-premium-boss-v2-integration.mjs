// Guarded live-game integration for the Premium VOID TYRANT boss V2.
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
  'boss-v2-spawn-state',
  `  b.phase=1;b.phaseTriggered=false;b.specialCd=3.4;b.telegraph=0;b.novaReady=false;\n  bossPending=false;bossWarningTime=0;`,
  `  b.phase=1;b.phaseTriggered=false;b.specialCd=3.4;b.telegraph=0;b.novaReady=false;\n  b.premiumBossPhase=null;b.premiumBossMove=null;b.premiumBossMoveCd=1.2;b.premiumBossTelegraph=0;b.premiumBossTelegraphTotal=0;\n  b.premiumBossTargetX=b.x;b.premiumBossTargetY=b.y;b.premiumBossColor=null;b.premiumBossLabel=null;b.premiumBossForceCollapse=false;\n  bossPending=false;bossWarningTime=0;`
);

replaceOnce(
  'boss-v2-functions',
  `function updateChaosDirector(dt){`,
  `function executePremiumBossMove(e,move,state){\n  const color=e.premiumBossColor||state?.definition?.color||'#c56cff';\n  const targetX=Number.isFinite(e.premiumBossTargetX)?e.premiumBossTargetX:player.x;\n  const targetY=Number.isFinite(e.premiumBossTargetY)?e.premiumBossTargetY:player.y;\n  if(move==='void-bolt'){\n    // PREMIUM BOSS MOVE — VOID BOLT\n    const aim=Math.atan2(targetY-e.y,targetX-e.x);\n    for(let i=-2;i<=2;i++){\n      const a=aim+i*.125;enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*225,vy:Math.sin(a)*225,r:5,life:3.5,dmg:12});\n    }\n    rings.push({x:e.x,y:e.y,r:10,max:90,life:.25,total:.25,color});\n  }else if(move==='gravity-pulse'){\n    // PREMIUM BOSS MOVE — GRAVITY PULSE\n    for(let i=0;i<14;i++){const a=i*Math.PI*2/14+gameTime*.12;enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*165,vy:Math.sin(a)*165,r:5,life:4.1,dmg:10})}\n    rings.push({x:e.x,y:e.y,r:14,max:150,life:.42,total:.42,color});shake=Math.min(16,shake+5);\n  }else if(move==='void-zone'){\n    // PREMIUM BOSS MOVE — VOID ZONE\n    rings.push({x:targetX,y:targetY,r:12,max:115,life:.65,total:.65,color});\n    for(let i=0;i<12;i++){const a=i*Math.PI*2/12;enemyBullets.push({x:targetX+Math.cos(a)*88,y:targetY+Math.sin(a)*88,vx:-Math.cos(a)*125,vy:-Math.sin(a)*125,r:6,life:2.1,dmg:13})}\n  }else if(move==='summon-rift'){\n    // PREMIUM BOSS MOVE — SUMMON RIFT\n    for(let i=0;i<4;i++){\n      const a=i*Math.PI*.5+gameTime*.25,rr=115;\n      const type=i%2?'runner':'normal';\n      spawnEnemy(type,{position:{x:clamp(e.x+Math.cos(a)*rr,30,WORLD_W-30),y:clamp(e.y+Math.sin(a)*rr,30,WORLD_H-30)}});\n    }\n    rings.push({x:e.x,y:e.y,r:18,max:175,life:.58,total:.58,color});\n  }else if(move==='projectile-ring'){\n    // PREMIUM BOSS MOVE — PROJECTILE RING\n    for(let i=0;i<20;i++){const a=i*Math.PI*2/20+gameTime*.18;enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*205,vy:Math.sin(a)*205,r:5,life:4.2,dmg:12})}\n    rings.push({x:e.x,y:e.y,r:15,max:185,life:.46,total:.46,color});\n  }else if(move==='void-collapse'){\n    // PREMIUM BOSS MOVE — VOID COLLAPSE\n    for(let i=0;i<28;i++){const a=i*Math.PI*2/28+gameTime*.22;enemyBullets.push({x:e.x,y:e.y,vx:Math.cos(a)*225,vy:Math.sin(a)*225,r:6,life:4.6,dmg:14})}\n    for(let i=0;i<8;i++){const a=i*Math.PI*2/8;enemyBullets.push({x:targetX+Math.cos(a)*130,y:targetY+Math.sin(a)*130,vx:-Math.cos(a)*165,vy:-Math.sin(a)*165,r:6,life:2.4,dmg:15})}\n    rings.push({x:e.x,y:e.y,r:18,max:250,life:.72,total:.72,color});\n    rings.push({x:targetX,y:targetY,r:10,max:145,life:.64,total:.64,color});\n    shake=Math.min(16,shake+10);window.BreakPremiumRuntime?.signal?.('limitBreak',{direction:{x:0,y:0}});\n  }\n}\n\nfunction updatePremiumBossV2(e,dt,dx,dy,l,d,premiumSpeed,pursuitBoost){\n  const state=window.BreakPremiumRuntime?.resolveBossState?.(e);\n  if(!state)return false;\n  const previousPhase=e.premiumBossPhase||null;\n  e.premiumBossPhase=state.phase;e.premiumBossLabel=state.definition.label;e.premiumBossColor=state.definition.color;\n  e.phase=state.phase==='phase1'?1:state.phase==='phase2'?2:state.phase==='phase3'?3:4;\n\n  if(previousPhase&&previousPhase!==state.phase){\n    if(state.phase==='phase2')showBreakCallout('VOID DOMAIN','VOID ZONES ONLINE',e.premiumBossColor);\n    else if(state.phase==='phase3')showBreakCallout('RIFT SOVEREIGN','SUMMON RIFTS ONLINE',e.premiumBossColor);\n    else if(state.phase==='final'){showBreakCallout('VOID COLLAPSE','FINAL PROTOCOL',e.premiumBossColor);e.premiumBossForceCollapse=true}\n    e.premiumBossMoveCd=Math.min(e.premiumBossMoveCd||.65,.65);\n    window.BreakPremiumRuntime?.signal?.(state.phase==='final'?'limitBreak':'break',{direction:{x:0,y:0}});\n  }else if(!previousPhase){\n    e.premiumBossMoveCd=Math.max(1,e.premiumBossMoveCd||1.2);\n  }\n\n  const range=d.range||315;\n  const dir=l>range?1:l<range*.68?-1:0;\n  const phaseSpeedScale=state.phase==='final'?1.16:state.phase==='phase3'?1.10:state.phase==='phase2'?1.06:1;\n  const moveScale=e.premiumBossTelegraph>0?.42:1;\n  e.x+=dx/l*premiumSpeed*pursuitBoost*phaseSpeedScale*dir*moveScale*dt;\n  e.y+=dy/l*premiumSpeed*pursuitBoost*phaseSpeedScale*dir*moveScale*dt;\n\n  e.premiumBossMoveCd=Math.max(0,(e.premiumBossMoveCd||0)-dt);\n  if(e.premiumBossTelegraph>0){\n    const before=e.premiumBossTelegraph;\n    e.premiumBossTelegraph=Math.max(0,e.premiumBossTelegraph-dt);\n    e.flash=Math.max(e.flash,.08);\n    if(before>0&&e.premiumBossTelegraph===0&&e.premiumBossMove){\n      executePremiumBossMove(e,e.premiumBossMove,state);\n      e.premiumBossMove=null;e.premiumBossMoveCd=e.premiumBossPendingCooldown||state.definition.moveCooldown;\n    }\n    return true;\n  }\n\n  if(e.premiumBossMoveCd<=0){\n    const forced=e.premiumBossForceCollapse&&state.phase==='final';\n    const plan=window.BreakPremiumRuntime?.nextBossAttack?.({...e,roll:forced?0.999999:Math.random()});\n    if(plan){\n      e.premiumBossForceCollapse=false;e.premiumBossMove=plan.move;\n      e.premiumBossTelegraph=plan.telegraphSeconds;e.premiumBossTelegraphTotal=plan.telegraphSeconds;\n      e.premiumBossPendingCooldown=plan.cooldown;e.premiumBossTargetX=player.x;e.premiumBossTargetY=player.y;\n      if(plan.move==='void-collapse')showBreakCallout('VOID COLLAPSE','MOVE OR BE ERASED',plan.color);\n    }\n  }\n  return true;\n}\n\nfunction updateChaosDirector(dt){`
);

replaceOnce(
  'boss-v2-update-bridge',
  `    const eliteHandled=premiumTacticalHandled?false:updateEliteVariantBehavior(e,dt,dx,dy,l);\n    if(premiumTacticalHandled){\n      // Premium tactical behavior already moved this enemy.\n    }else if(eliteHandled){\n      // Dedicated Stage 11.1 Elite behavior already moved this enemy.\n    }else if(e.type==='shooter'||e.type==='boss'){`,
  `    const premiumBossHandled=!premiumTacticalHandled&&e.type==='boss'?updatePremiumBossV2(e,dt,dx,dy,l,d,premiumSpeed,pursuitBoost):false;\n    const eliteHandled=premiumTacticalHandled||premiumBossHandled?false:updateEliteVariantBehavior(e,dt,dx,dy,l);\n    if(premiumTacticalHandled){\n      // Premium tactical behavior already moved this enemy.\n    }else if(eliteHandled){\n      // Dedicated Stage 11.1 Elite behavior already moved this enemy.\n    }else if(premiumBossHandled){\n      // Premium Boss V2 owns movement and attacks for this frame.\n    }else if(e.type==='shooter'||e.type==='boss'){`
);

replaceOnce(
  'boss-v2-body-color',
  `    const bodyColor=e.flash?'#fff':e.gold?'#ffd75b':e.type==='boss'&&e.phase===2?'#ff4f93':e.color;`,
  `    const bodyColor=e.flash?'#fff':e.gold?'#ffd75b':e.premiumBossColor||(e.type==='boss'&&e.phase===2?'#ff4f93':e.color);`
);

replaceOnce(
  'boss-v2-telegraph-draw',
  `    if(e.type==='boss'&&e.telegraph>0){\n      const pct=1-clamp(e.telegraph/.78,0,1);`,
  `    if(e.type==='boss'&&e.premiumBossTelegraph>0){\n      const total=Math.max(.001,e.premiumBossTelegraphTotal||.5),pct=1-clamp(e.premiumBossTelegraph/total,0,1);\n      const premiumBossColor=e.premiumBossColor||'#c56cff';\n      const premiumBossTargetX=Number.isFinite(e.premiumBossTargetX)?e.premiumBossTargetX:e.x;\n      const premiumBossTargetY=Number.isFinite(e.premiumBossTargetY)?e.premiumBossTargetY:e.y;\n      ctx.save();ctx.strokeStyle=premiumBossColor;ctx.lineWidth=3;ctx.globalAlpha=.30+.62*pct;ctx.setLineDash([10,8]);\n      ctx.beginPath();ctx.arc(e.x,e.y,e.r+22+pct*58,0,Math.PI*2);ctx.stroke();\n      ctx.beginPath();ctx.arc(premiumBossTargetX,premiumBossTargetY,34+pct*48,0,Math.PI*2);ctx.stroke();ctx.restore();\n    }\n    if(e.type==='boss'&&e.telegraph>0){\n      const pct=1-clamp(e.telegraph/.78,0,1);`
);

replaceOnce(
  'boss-v2-hud',
  `    if(boss){\n      bHud.classList.add('show');bHud.classList.remove('warning');bHud.classList.toggle('phase2',boss.phase===2);\n      bName.textContent='VOID TYRANT';bPhase.textContent='PHASE '+(boss.phase||1);\n      bFill.style.width=(clamp(boss.hp/boss.maxHp,0,1)*100)+'%';`,
  `    if(boss){\n      const premiumBossState=window.BreakPremiumRuntime?.resolveBossState?.(boss);\n      const premiumBossLabel=boss.premiumBossLabel||premiumBossState?.definition?.label||null;\n      const premiumBossColor=boss.premiumBossColor||premiumBossState?.definition?.color||null;\n      bHud.classList.add('show');bHud.classList.remove('warning');bHud.classList.toggle('phase2',boss.phase===2);\n      bName.textContent='VOID TYRANT';bPhase.textContent=premiumBossLabel||'PHASE '+(boss.phase||1);\n      if(premiumBossColor){\n        bName.style.color=premiumBossColor;bPhase.style.color=premiumBossColor;\n        bFill.style.background='linear-gradient(90deg,'+premiumBossColor+',#ff8ac2,#ffe16f)';\n      }else{bName.style.color='';bPhase.style.color='';bFill.style.background=''}\n      bFill.style.width=(clamp(boss.hp/boss.maxHp,0,1)*100)+'%';`
);

if(changed){
  fs.writeFileSync(path,source);
  console.log('Premium boss V2 integration applied.');
}else{
  console.log('Premium boss V2 integration already present.');
}
