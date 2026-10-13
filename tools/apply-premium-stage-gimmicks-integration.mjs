import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM STAGE GIMMICKS LIVE V1';

if(source.includes(marker)){
  console.log('Premium stage gimmicks already integrated');
  process.exit(0);
}

function replaceOnce(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
}

const liveHelpers=`/* PREMIUM STAGE GIMMICKS LIVE V1 */
let premiumStageGimmickFrame=null;
let premiumStageGimmickStageId=null;
let premiumStageGimmickTime=0;
let premiumStageGimmickLastPhase='idle';
let premiumStageGimmickGrace=0;
let premiumStageRewardMul=1;
let premiumStageEnemySpeedMul=1;
let premiumStageEnemyDamageMul=1;

function updatePremiumStageGimmick(dt,lbWorldFrozen){
  const runtime=window.BreakPremiumRuntime;
  const stage=runtime?.resolveStageEnvironment?.({limitBreakLevel});
  const premiumStageId=stage?.id||null;
  if(!premiumStageId){
    premiumStageGimmickFrame=null;
    premiumStageGimmickStageId=null;
    premiumStageRewardMul=1;
    premiumStageEnemySpeedMul=1;
    premiumStageEnemyDamageMul=1;
    return;
  }

  if(premiumStageId!==premiumStageGimmickStageId){
    premiumStageGimmickStageId=premiumStageId;
    const def=runtime?.getStageGimmick?.(premiumStageId);
    premiumStageGimmickTime=def?.kind==='moving-safe-zone'?0:(def?.activeSeconds||0);
    premiumStageGimmickLastPhase='idle';
    premiumStageGimmickGrace=1.05;
  }

  if(!lbWorldFrozen){
    premiumStageGimmickTime+=dt;
    premiumStageGimmickGrace=Math.max(0,premiumStageGimmickGrace-dt);
  }

  premiumStageGimmickFrame=runtime?.resolveStageGimmickFrame?.({stageId:premiumStageId,time:premiumStageGimmickTime,width:WORLD_W,height:WORLD_H})||null;
  premiumStageRewardMul=premiumStageGimmickFrame?.rewardMul??1;
  premiumStageEnemySpeedMul=premiumStageGimmickFrame?.enemySpeedMul??1;
  premiumStageEnemyDamageMul=premiumStageGimmickFrame?.enemyDamageMul??1;
  if(!premiumStageGimmickFrame)return;

  const enteredActive=premiumStageGimmickFrame.phase==='active'&&premiumStageGimmickLastPhase!=='active';

  if(premiumStageGimmickFrame.kind==='power-pulse'&&enteredActive){
    const target=premiumStageGimmickFrame.target;
    for(const e of enemies){
      if(e.dead||!target)continue;
      if(Math.hypot(e.x-target.x,e.y-target.y)<=premiumStageGimmickFrame.radius+e.r){
        e.premiumStageStun=Math.max(e.premiumStageStun||0,premiumStageGimmickFrame.enemyStunSeconds);
      }
    }
    const ringCount=runtime?.allowVfxCount?.('rings',1,3)??1;
    if(ringCount>0&&target)rings.push({x:target.x,y:target.y,r:18,max:premiumStageGimmickFrame.radius,life:.34,total:.34,color:premiumStageGimmickFrame.accent});
    showBreakCallout('POWER PULSE','ENEMIES STUNNED',premiumStageGimmickFrame.accent);
  }

  if(premiumStageGimmickFrame.kind==='experiment-overdrive'&&enteredActive){
    showBreakCallout('RESEARCH OVERDRIVE','ENEMY OUTPUT ↑ // REWARD ×'+premiumStageRewardMul.toFixed(2),premiumStageGimmickFrame.accent);
  }

  if(premiumStageGimmickFrame.kind==='volcanic-strike'&&enteredActive){
    const target=premiumStageGimmickFrame.target;
    if(target){
      for(const e of [...enemies]){
        if(e.dead||Math.hypot(e.x-target.x,e.y-target.y)>premiumStageGimmickFrame.radius+e.r)continue;
        const stageDamage=Math.max(1,e.maxHp*premiumStageGimmickFrame.enemyDamageMaxHpRatio);
        e.hp-=stageDamage;
        e.flash=Math.max(e.flash,.18);
        if(e.hp<=0)killEnemy(e,{stageHazard:true,damage:stageDamage});
      }
      if(premiumStageGimmickGrace<=0&&!god&&dashInvuln<=0&&Math.hypot(player.x-target.x,player.y-target.y)<=premiumStageGimmickFrame.radius+player.r){
        player.hp-=premiumStageGimmickFrame.playerDamage;
        player.hitCd=Math.max(player.hitCd,.35);
        lastDamageSource='ASH WASTELAND';
      }
      const ringCount=runtime?.allowVfxCount?.('rings',1,4)??1;
      if(ringCount>0)rings.push({x:target.x,y:target.y,r:12,max:premiumStageGimmickFrame.radius*1.18,life:.38,total:.38,color:premiumStageGimmickFrame.accent});
      const burst=runtime?.allowVfxCount?.('particles',18,4)??18;
      for(let i=0;i<burst;i++)particles.push({x:target.x,y:target.y,vx:rnd(-210,210),vy:rnd(-250,70),life:rnd(.22,.52),size:rnd(2.5,7),color:i%3===0?'#ffd07a':premiumStageGimmickFrame.accent});
    }
  }

  if(premiumStageGimmickFrame.kind==='moving-safe-zone'&&!lbWorldFrozen&&premiumStageGimmickGrace<=0&&!god&&dashInvuln<=0){
    const target=premiumStageGimmickFrame.target;
    if(target&&Math.hypot(player.x-target.x,player.y-target.y)>premiumStageGimmickFrame.radius-player.r*.35){
      player.hp-=premiumStageGimmickFrame.unsafeDamagePerSecond*dt;
      lastDamageSource='VOID SECTOR';
    }
  }

  premiumStageGimmickLastPhase=premiumStageGimmickFrame.phase;
}

function drawPremiumStageGimmick(frame){
  if(!frame)return;
  ctx.save();
  ctx.lineWidth=2;
  ctx.strokeStyle=frame.accent||'#ffffff';
  ctx.fillStyle=frame.accent||'#ffffff';

  if(frame.kind==='experiment-overdrive'&&frame.phase==='active'){
    ctx.globalAlpha=.16+.06*Math.sin(gameTime*9);
    ctx.lineWidth=7;
    ctx.strokeRect(12,12,WORLD_W-24,WORLD_H-24);
  }else if(frame.kind==='moving-safe-zone'&&frame.target){
    ctx.globalAlpha=.10;
    ctx.beginPath();ctx.arc(frame.target.x,frame.target.y,frame.radius,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.72;
    ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(frame.target.x,frame.target.y,frame.radius,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=.32;
    ctx.beginPath();ctx.arc(frame.target.x,frame.target.y,frame.radius*.78,0,Math.PI*2);ctx.stroke();
  }else if(frame.target&&(frame.kind==='volcanic-strike'||frame.kind==='power-pulse')){
    const pulse=.90+.10*Math.sin(gameTime*16);
    ctx.globalAlpha=frame.phase==='active'?.42:frame.phase==='telegraph'?.75:.12;
    ctx.lineWidth=frame.phase==='active'?6:3;
    ctx.beginPath();ctx.arc(frame.target.x,frame.target.y,frame.radius*pulse,0,Math.PI*2);ctx.stroke();
    if(frame.kind==='volcanic-strike'&&frame.phase==='telegraph'){
      const r=frame.radius*.64;
      ctx.beginPath();ctx.moveTo(frame.target.x-r,frame.target.y);ctx.lineTo(frame.target.x+r,frame.target.y);ctx.stroke();
      ctx.beginPath();ctx.moveTo(frame.target.x,frame.target.y-r);ctx.lineTo(frame.target.x,frame.target.y+r);ctx.stroke();
    }
  }
  ctx.restore();
}

function update(dt,refreshHud=true){`;
replaceOnce('stage-gimmick-helpers','function update(dt,refreshHud=true){',liveHelpers);

replaceOnce(
  'stage-gimmick-update-call',
  `  gameTime+=dt; player.attackCd-=dt; player.hitCd-=dt;`,
  `  gameTime+=dt; player.attackCd-=dt; player.hitCd-=dt;\n  updatePremiumStageGimmick(dt,lbWorldFrozen);`
);

replaceOnce(
  'stage-gimmick-stun',
  `    if(lbWorldFrozen)continue;\n    const d=e.premiumDef||enemyDefs[e.type];`,
  `    if(lbWorldFrozen)continue;\n    if(e.premiumStageStun>0){\n      e.premiumStageStun=Math.max(0,e.premiumStageStun-dt);\n      e.flash=Math.max(e.flash,.12);\n      continue;\n    }\n    const d=e.premiumDef||enemyDefs[e.type];`
);

replaceOnce(
  'stage-gimmick-speed',
  `    const premiumSpeed=e.speed*premiumAuraState.speedMul;`,
  `    const premiumSpeed=e.speed*premiumAuraState.speedMul*premiumStageEnemySpeedMul;`
);

replaceOnce(
  'stage-gimmick-contact-damage',
  `      player.hp-=e.touch*premiumAuraState.touchMul;player.hitCd=.4;shake=6;`,
  `      player.hp-=e.touch*premiumAuraState.touchMul*premiumStageEnemyDamageMul;player.hitCd=.4;shake=6;`
);

replaceOnce(
  'stage-gimmick-projectile-damage',
  `      b.life=0;if(!god&&dashInvuln<=0){lastDamageSource='ENEMY PROJECTILE';player.hp-=b.dmg;shake=5}`,
  `      b.life=0;if(!god&&dashInvuln<=0){lastDamageSource='ENEMY PROJECTILE';player.hp-=b.dmg*premiumStageEnemyDamageMul;shake=5}`
);

replaceOnce(
  'stage-gimmick-reward',
  `  const coinGain=Math.max(1,Math.floor(e.reward*ps.coinMul*breakCoinMultiplier()*eventCoinMultiplier()));`,
  `  const coinGain=Math.max(1,Math.floor(e.reward*ps.coinMul*breakCoinMultiplier()*eventCoinMultiplier()*premiumStageRewardMul));`
);

replaceOnce(
  'stage-gimmick-draw-call',
  `  // Stage 10.4 EXP — irregular fireball bloom replaces Bomb Cat ring spam.`,
  `  if(premiumStageGimmickFrame)drawPremiumStageGimmick(premiumStageGimmickFrame);\n\n  // Stage 10.4 EXP — irregular fireball bloom replaces Bomb Cat ring spam.`
);

fs.writeFileSync(path,source);
console.log('Applied Premium stage gimmick live integration');
