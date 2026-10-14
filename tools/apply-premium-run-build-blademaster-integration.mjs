import fs from 'node:fs';

const file=new URL('../index.html',import.meta.url);
let html=fs.readFileSync(file,'utf8');
const MARK='// PREMIUM RUN BUILD BLADEMASTER V1';
const REQUIRED=[
  "window.BreakRunBuild?.getEffects?.('blademaster')",
  'premiumBladeFx?.damageMul',
  'premiumBladeExecuted',
  'meta.premiumBladeFx?.flowExecution',
  'PREMIUM CYCLONE STEP',
  'PREMIUM PERFECT PARRY',
  'PREMIUM VOID BLADE'
];

function replaceOnce(from,to,label){
  const count=html.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  html=html.replace(from,to);
}

if(html.includes(MARK)){
  const missing=REQUIRED.filter(x=>!html.includes(x));
  if(missing.length)throw new Error(`Blademaster marker exists but integration is incomplete: ${missing.join(', ')}`);
  console.log('Premium Blademaster run build integration already present and validated');
  process.exit(0);
}

replaceOnce(
`let dashCooldown=0,dashInvuln=0,specialCooldown=0;`,
`${MARK}\nlet dashCooldown=0,dashInvuln=0,specialCooldown=0;\nlet premiumBladeParryWindow=0;`,
'Blademaster parry state'
);

replaceOnce(
`  mobileMoveX=0;mobileMoveY=0;dashCooldown=0;dashInvuln=0;specialCooldown=0;`,
`  mobileMoveX=0;mobileMoveY=0;dashCooldown=0;dashInvuln=0;specialCooldown=0;premiumBladeParryWindow=0;`,
'Blademaster reset'
);

replaceOnce(
`function useDash(){`,
`function triggerPremiumBladeParry(e,premiumBladeFx){\n  // PREMIUM PERFECT PARRY — a narrow dash-timing counter, not passive invulnerability.\n  premiumBladeParryWindow=0;\n  player.hitCd=Math.max(player.hitCd,.22);\n  dashInvuln=Math.max(dashInvuln,.12);\n  dashCooldown=Math.max(0,dashCooldown-.35);\n  rings.push({x:player.x,y:player.y,r:5,max:82*ps.area,life:.20,total:.20,color:'#efe4ff'});\n  playBladeTechniqueSfx('heavy',{gate:'premium_blade_parry',gap:180,volume:.64,rate:1.08});\n  if(e&&!e.dead)damageEnemy(e,ps.damage*.82,true,{premiumBlade:true,premiumBladeFx,premiumBladeCounter:true});\n}\n\nfunction useDash(){`,
'PERFECT PARRY helper'
);

replaceOnce(
`  dashCooldown=2.5*core.dashCooldownMul;dashInvuln=.15+core.dashInvulnAdd;\n  if(core.dashStrike>0)explode(player.x,player.y,86*ps.area,ps.damage*core.dashStrike,'#9f8cff',{silent:true,noShake:true});`,
`  dashCooldown=2.5*core.dashCooldownMul;dashInvuln=.15+core.dashInvulnAdd;\n  const premiumBladeFx=currentCharacter.id==='blademaster'?window.BreakRunBuild?.getEffects?.('blademaster'):null;\n  if(premiumBladeFx?.parry)premiumBladeParryWindow=.18;\n  if(core.dashStrike>0)explode(player.x,player.y,86*ps.area,ps.damage*core.dashStrike,'#9f8cff',{silent:true,noShake:true});\n  if(premiumBladeFx?.cyclone){\n    // PREMIUM CYCLONE STEP — one restrained circular slash per dash.\n    doSlash(ps.damage*.58,{radiusMul:.94,color:'#b98aff',quiet:true,life:.16,silentSfx:true});\n  }`,
'Blademaster dash upgrades'
);

replaceOnce(
`  dashCooldown=Math.max(0,dashCooldown-dt);dashInvuln=Math.max(0,dashInvuln-dt);specialCooldown=Math.max(0,specialCooldown-dt);`,
`  dashCooldown=Math.max(0,dashCooldown-dt);dashInvuln=Math.max(0,dashInvuln-dt);specialCooldown=Math.max(0,specialCooldown-dt);premiumBladeParryWindow=Math.max(0,premiumBladeParryWindow-dt);`,
'Blademaster parry timer'
);

replaceOnce(
`  actualDmg*=premiumAuraState.damageTakenMul;\n  e.hp-=actualDmg;`,
`  actualDmg*=premiumAuraState.damageTakenMul;\n  let premiumBladeExecuted=false;\n  if(meta.premiumBlade&&meta.premiumBladeFx?.executeThreshold>0&&e.type!=='boss'){\n    const threshold=Math.max(0,Math.min(.5,meta.premiumBladeFx.executeThreshold));\n    const projected=e.hp-actualDmg;\n    if(projected>0&&projected<=e.maxHp*threshold){\n      actualDmg=e.hp;premiumBladeExecuted=true;meta.premiumBladeExecuted=true;\n    }\n  }\n  e.hp-=actualDmg;`,
'EXECUTION threshold'
);

replaceOnce(
`  e.dead=true;\n  if(meta.premiumBombCat&&!meta.premiumBreakChain&&breakCombo>=10){`,
`  e.dead=true;\n  if(meta.premiumBladeExecuted&&meta.premiumBladeFx?.flowExecution){\n    attackCounters.blademaster=(attackCounters.blademaster||0)+1;\n    dashCooldown=Math.max(0,dashCooldown-.75);\n    rings.push({x:e.x,y:e.y,r:3,max:42,life:.16,total:.16,color:'#c9a7ff'});\n  }\n  if(meta.premiumBombCat&&!meta.premiumBreakChain&&breakCombo>=10){`,
'FLOW EXECUTION reward'
);

replaceOnce(
`function doSlash(dmg,opts={}){\n  const r=96*ps.area*(opts.radiusMul||1);`,
`function doSlash(dmg,opts={}){\n  const premiumBladeFx=currentCharacter.id==='blademaster'?window.BreakRunBuild?.getEffects?.('blademaster'):null;\n  const premiumBladeDamage=dmg*(premiumBladeFx?.damageMul||1);\n  const r=96*ps.area*(opts.radiusMul||1)*(premiumBladeFx?.radiusMul||1);`,
'Blademaster radial damage source'
);

replaceOnce(
`      damageEnemy(e,dmg);hitCount++;`,
`      damageEnemy(e,premiumBladeDamage,true,{premiumBlade:!!premiumBladeFx,premiumBladeFx});hitCount++;`,
'Blademaster radial hit metadata'
);

replaceOnce(
`function doSlashLine(dmg,angle,len,width,color='#eaf8ff',opts={}){\n  const centered=!!opts.centered;`,
`function doSlashLine(dmg,angle,len,width,color='#eaf8ff',opts={}){\n  const premiumBladeFx=currentCharacter.id==='blademaster'?window.BreakRunBuild?.getEffects?.('blademaster'):null;\n  const premiumBladeDamage=dmg*(premiumBladeFx?.damageMul||1);\n  len*=premiumBladeFx?.radiusMul||1;width*=premiumBladeFx?.radiusMul||1;\n  const centered=!!opts.centered;`,
'Blademaster line damage source'
);

replaceOnce(
`      let dealt=dmg;\n      if(opts.edgeBossBonus&&(e.type==='boss'||e.type==='elite')){\n        dealt+=Math.min(dmg*.55,e.maxHp*.012);\n      }\n      damageEnemy(e,dealt);hitCount++;`,
`      let dealt=premiumBladeDamage;\n      if(opts.edgeBossBonus&&(e.type==='boss'||e.type==='elite')){\n        dealt+=Math.min(premiumBladeDamage*.55,e.maxHp*.012);\n      }\n      damageEnemy(e,dealt,true,{premiumBlade:!!premiumBladeFx,premiumBladeFx});hitCount++;`,
'Blademaster line hit metadata'
);

replaceOnce(
`      const waveRange=(lv>=5?1.15:1);\n      const awakened=lv>=50;`,
`      const waveRange=(lv>=5?1.15:1);\n      const awakened=lv>=50;\n      const premiumBladeFx=window.BreakRunBuild?.getEffects?.('blademaster');\n      if(premiumBladeFx?.evolution==='void-blade'&&stage===comboLen){\n        // PREMIUM VOID BLADE — full Flow opens one long piercing line, once per combo.\n        setTimeout(()=>{if(running&&currentCharacter.id==='blademaster')doBladeWave(base*.78,{len:780,width:46,color:'#a978ff',heavy:true,life:.24,finisher:true,silentSfx:true})},36);\n      }`,
'VOID BLADE full Flow'
);

replaceOnce(
`    if(Math.hypot(player.x-e.x,player.y-e.y)<player.r+e.r && player.hitCd<=0 && !god && dashInvuln<=0){\n      lastDamageSource=e.type==='boss'?'VOID TYRANT':e.type==='elite'?(e.eliteVariant?e.eliteVariant.toUpperCase()+' ELITE':'ELITE ENEMY'):e.type.toUpperCase()+' ENEMY';\n      player.hp-=e.touch*premiumAuraState.touchMul*premiumStageEnemyDamageMul;player.hitCd=.4;shake=6;\n    }`,
`    if(Math.hypot(player.x-e.x,player.y-e.y)<player.r+e.r && player.hitCd<=0 && !god){\n      const premiumBladeFx=currentCharacter.id==='blademaster'?window.BreakRunBuild?.getEffects?.('blademaster'):null;\n      if(premiumBladeFx?.parry&&premiumBladeParryWindow>0){\n        triggerPremiumBladeParry(e,premiumBladeFx);\n      }else if(dashInvuln<=0){\n        lastDamageSource=e.type==='boss'?'VOID TYRANT':e.type==='elite'?(e.eliteVariant?e.eliteVariant.toUpperCase()+' ELITE':'ELITE ENEMY'):e.type.toUpperCase()+' ENEMY';\n        player.hp-=e.touch*premiumAuraState.touchMul*premiumStageEnemyDamageMul;player.hitCd=.4;shake=6;\n      }\n    }`,
'PERFECT PARRY contact hook'
);

fs.writeFileSync(file,html);
console.log('Applied Premium Blademaster run build integration');
