import fs from 'node:fs';

const file=new URL('../index.html',import.meta.url);
let html=fs.readFileSync(file,'utf8');
const MARK='// PREMIUM RUN BUILD LIVE V1';

function replaceOnce(from,to,label){
  const count=html.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  html=html.replace(from,to);
}

if(html.includes(MARK)){
  if(!html.includes('./src/game/run-build-controller.js'))throw new Error('Run build marker exists but controller module tag is missing');
  console.log('Premium run build live integration already present');
  process.exit(0);
}

replaceOnce(
`<script type="module" src="./src/game/premium-runtime.js"></script>\n</body>`,
`<script type="module" src="./src/game/premium-runtime.js"></script>\n<script type="module" src="./src/game/run-build-controller.js"></script>\n</body>`,
'controller module tag'
);

replaceOnce(
`function resetRun(){\n  window.BreakPremiumRuntime?.reset?.();`,
`function resetRun(){\n  window.BreakPremiumRuntime?.reset?.();\n  window.BreakRunBuild?.reset?.();\n  window.__premiumRunBossDraftPending=false;`,
'run reset hook'
);

replaceOnce(
`function killEnemy(e,meta={}){`,
`${MARK}\nfunction premiumRunTierColor(tier){\n  return ({stat:'#70d7ff',modify:'#ffbb53',synergy:'#d66cff',evolution:'#ff657e'})[tier]||'#70d7ff';\n}\nfunction premiumRunMaybeDraft(){\n  const controller=window.BreakRunBuild;\n  if(!running||!controller||controller.open||controller.pending<=0)return false;\n  if(window.BreakPremiumRuntime?.bossRewardOpen)return false;\n  if(typeof isLbWorldFrozen==='function'&&isLbWorldFrozen())return false;\n  const bossReward=!!window.__premiumRunBossDraftPending;\n  const opened=controller.presentDraft?.(currentCharacter.id,{\n    breakActive:breakCombo>=10,\n    bossReward\n  },result=>{\n    const choice=result?.choice;\n    if(choice){\n      showBreakCallout(choice.tier==='evolution'?'EVOLUTION':'UPGRADE ACQUIRED',choice.name||choice.id,premiumRunTierColor(choice.tier));\n      updateHud();\n    }\n  });\n  if(opened)window.__premiumRunBossDraftPending=false;\n  return !!opened;\n}\nfunction premiumRunGainKillXp(e){\n  const controller=window.BreakRunBuild;\n  if(!controller)return null;\n  const state=controller.gainXp?.(e);\n  if(e?.type==='boss'){\n    controller.ensureDraft?.();\n    window.__premiumRunBossDraftPending=true;\n  }\n  return state;\n}\nfunction premiumRunEffects(id=currentCharacter.id){\n  return window.BreakRunBuild?.getEffects?.(id)||null;\n}\n\nfunction killEnemy(e,meta={}){`,
'run build helpers'
);

replaceOnce(
`  e.dead=true;\n  const premiumDeathEvent=e.type==='boss'?'bossKill':null;`,
`  e.dead=true;\n  window.BreakRunBuild?.gainXp?.(e);\n  if(e.type==='boss'){window.BreakRunBuild?.ensureDraft?.();window.__premiumRunBossDraftPending=true}\n  const premiumDeathEvent=e.type==='boss'?'bossKill':null;`,
'kill XP hook'
);

replaceOnce(
`  if(window.BreakPremiumRuntime?.bossRewardOpen){if(refreshHud)updateHud();return}\n  if(!updateBreakRush(dt)){if(refreshHud)updateHud();return}`,
`  if(window.BreakPremiumRuntime?.bossRewardOpen){if(refreshHud)updateHud();return}\n  if(window.BreakRunBuild?.open){if(refreshHud)updateHud();return}\n  if(premiumRunMaybeDraft()){if(refreshHud)updateHud();return}\n  if(!updateBreakRush(dt)){if(refreshHud)updateHud();return}`,
'draft pause gate'
);

replaceOnce(
`function addBullet(v,dmg,pierce=6,opts={}){\n  const core=getCoreEffects(),baseSpeed=(opts.speed||520)*core.projectileSpeedMul;`,
`function addBullet(v,dmg,pierce=6,opts={}){\n  const core=getCoreEffects(),baseSpeed=(opts.speed||520)*core.projectileSpeedMul;\n  const premiumGunnerFx=opts.gunner&&currentCharacter.id==='gunner'?window.BreakRunBuild?.getEffects?.('gunner'):null;`,
'Gunner run effects source'
);

replaceOnce(
`      r:opts.r||5,life:opts.life||1.7,dmg:dmg*core.projectileDamageMul,pierce:pierce+core.pierceAdd,kind:opts.kind||'pierce',`,
`      r:opts.r||5,life:opts.life||1.7,dmg:dmg*core.projectileDamageMul*(premiumGunnerFx?.damageMul||1),pierce:pierce+core.pierceAdd+(premiumGunnerFx?.pierceAdd||0),kind:opts.kind||'pierce',`,
'Gunner damage and pierce'
);

replaceOnce(
`      gunner:!!opts.gunner,ult:!!opts.ult,trail:opts.trail??!!opts.gunner,\n      ricochetChance:core.ricochetChance,ricochetLeft:core.ricochetCount,splitChance:core.splitChance,splitChild:false`,
`      gunner:!!opts.gunner,ult:!!opts.ult,trail:opts.trail??!!opts.gunner,\n      premiumThunderCrit:!!premiumGunnerFx?.thunderCrit,\n      ricochetChance:Math.min(1,core.ricochetChance+(premiumGunnerFx?.ricochetChance||0)),ricochetLeft:core.ricochetCount+(premiumGunnerFx?.ricochetCount||0),splitChance:Math.min(1,core.splitChance+(premiumGunnerFx?.splitChance||0)),splitChild:false`,
'Gunner projectile modifiers'
);

replaceOnce(
`function damageEnemy(e,dmg,impact=true){`,
`function damageEnemy(e,dmg,impact=true,meta={}){`,
'damage metadata signature'
);

replaceOnce(
`  actualDmg*=premiumAuraState.damageTakenMul;\n  e.hp-=actualDmg;\n\n  if(impact){`,
`  actualDmg*=premiumAuraState.damageTakenMul;\n  e.hp-=actualDmg;\n\n  if(crit&&meta.premiumGunner&&meta.premiumThunderCrit){\n    chainLightning(actualDmg*.30,3,{range:185*ps.area,decay:.72,width:2.4,origin:{x:e.x,y:e.y},exclude:e});\n  }\n\n  if(impact){`,
'thunder crit trigger'
);

replaceOnce(
`        damageEnemy(e,b.dmg);\n        if(b.gunner)gunnerImpactFx(b,e);`,
`        damageEnemy(e,b.dmg,true,{premiumGunner:!!b.gunner,premiumThunderCrit:!!b.premiumThunderCrit});\n        if(b.gunner)gunnerImpactFx(b,e);`,
'Gunner hit metadata'
);

replaceOnce(
`  let src={x:player.x,y:player.y};\n  const used=new Set(), range=(opts.range||190*ps.area)*core.chainRangeMul, decay=opts.decay??.82, hit=[];`,
`  let src=opts.origin||{x:player.x,y:player.y};\n  const used=new Set(opts.exclude?[opts.exclude]:[]), range=(opts.range||190*ps.area)*core.chainRangeMul, decay=opts.decay??.82, hit=[];`,
'thunder crit chain origin'
);

replaceOnce(
`  const core=getCoreEffects();\n  const gunnerRate=(currentCharacter.id==='gunner'&&attackType==='pierce'&&ownGrowthActive())?gunnerMomentumMul():1;`,
`  const core=getCoreEffects();\n  const premiumRunFx=window.BreakRunBuild?.getEffects?.(currentCharacter.id)||null;\n  const premiumRunRateMul=premiumRunFx?.attackRateMul||1;\n  const gunnerRate=(currentCharacter.id==='gunner'&&attackType==='pierce'&&ownGrowthActive())?gunnerMomentumMul():1;`,
'run attack rate source'
);

replaceOnce(
`  const rate=ps.attackRate*(feverActive()?1.35:1)*(itemBuffs.drink>0?2:1)*gunnerRate*(lowHp?1+core.berserkRate:1)*(breakBoost?1+core.breakAttackRate:1);`,
`  const rate=ps.attackRate*premiumRunRateMul*(feverActive()?1.35:1)*(itemBuffs.drink>0?2:1)*gunnerRate*(lowHp?1+core.berserkRate:1)*(breakBoost?1+core.breakAttackRate:1);`,
'run attack rate multiplier'
);

replaceOnce(
`    let radius=70*ps.area;`,
`    const premiumBombFx=isBombCat?window.BreakRunBuild?.getEffects?.('bombcat'):null;\n    let radius=70*ps.area*(premiumBombFx?.radiusMul||1);`,
'Bomb Cat run effects source'
);

replaceOnce(
`    addBullet(v,base*.7,0,{`,
`    addBullet(v,base*.7*(premiumBombFx?.damageMul||1),0,{`,
'Bomb Cat run damage'
);

replaceOnce(
`      clusterCount:profile.clusterCount,\n      royalClusterCount:profile.royal?profile.royalClusterCount:0,\n      chainChance:profile.chainChance,`,
`      clusterCount:profile.clusterCount+(premiumBombFx?.clusterAdd||0),\n      royalClusterCount:profile.royal?profile.royalClusterCount+(premiumBombFx?.clusterAdd||0):0,\n      chainChance:Math.min(1,profile.chainChance+(premiumBombFx?.chainChanceAdd||0)),`,
'Bomb Cat cluster and chain modifiers'
);

fs.writeFileSync(file,html);
console.log('Applied Premium run build live integration');
