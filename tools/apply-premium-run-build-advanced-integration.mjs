import fs from 'node:fs';

const file=new URL('../index.html',import.meta.url);
let html=fs.readFileSync(file,'utf8');
const MARK='// PREMIUM RUN BUILD ADVANCED V1';
const REQUIRED=[
  "premiumGunnerFx?.evolution==='railstorm'",
  'function armPremiumBombMine(',
  'premiumSmartMine',
  'premiumBreakDetonation',
  "premiumBombFx?.evolution==='nuclear-cascade'",
  'PREMIUM NUCLEAR CASCADE'
];
function replaceOnce(from,to,label){
  const count=html.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  html=html.replace(from,to);
}
if(html.includes(MARK)){
  const missing=REQUIRED.filter(x=>!html.includes(x));
  if(missing.length)throw new Error(`Advanced run build marker exists but integration is incomplete: ${missing.join(', ')}`);
  console.log('Premium advanced run build integration already present and validated');
  process.exit(0);
}

replaceOnce(
`function addBullet(v,dmg,pierce=6,opts={}){\n  const core=getCoreEffects(),baseSpeed=(opts.speed||520)*core.projectileSpeedMul;\n  const premiumGunnerFx=opts.gunner&&currentCharacter.id==='gunner'?window.BreakRunBuild?.getEffects?.('gunner'):null;`,
`${MARK}\nfunction addBullet(v,dmg,pierce=6,opts={}){\n  const core=getCoreEffects();\n  const premiumGunnerFx=opts.gunner&&currentCharacter.id==='gunner'?window.BreakRunBuild?.getEffects?.('gunner'):null;\n  const premiumRailstorm=!!(premiumGunnerFx?.evolution==='railstorm'&&gunnerMomentum/100>=(premiumGunnerFx?.evolutionMomentumThreshold||.8));\n  const baseSpeed=(opts.speed||520)*core.projectileSpeedMul*(premiumRailstorm?1.14:1);`,
'RAILSTORM activation'
);

replaceOnce(
`      r:opts.r||5,life:opts.life||1.7,dmg:dmg*core.projectileDamageMul*(premiumGunnerFx?.damageMul||1),pierce:pierce+core.pierceAdd+(premiumGunnerFx?.pierceAdd||0),kind:opts.kind||'pierce',\n      color:opts.color||null,radius:opts.radius||0,clusterCount:opts.clusterCount||0,`,
`      r:(opts.r||5)+(premiumRailstorm?1.8:0),life:opts.life||1.7,dmg:dmg*core.projectileDamageMul*(premiumGunnerFx?.damageMul||1),pierce:pierce+core.pierceAdd+(premiumGunnerFx?.pierceAdd||0),kind:premiumRailstorm?'rail':(opts.kind||'pierce'),\n      color:premiumRailstorm?'#edffff':(opts.color||null),radius:opts.radius||0,clusterCount:opts.clusterCount||0,`,
'RAILSTORM projectile identity'
);

replaceOnce(
`      bombcat:!!opts.bombcat,bombVisual:!!opts.bombVisual,bombAngle:opts.bombAngle||0,bombSpin:opts.bombSpin||0,\n      gunner:!!opts.gunner,ult:!!opts.ult,trail:opts.trail??!!opts.gunner,`,
`      bombcat:!!opts.bombcat,bombVisual:!!opts.bombVisual,bombAngle:opts.bombAngle||0,bombSpin:opts.bombSpin||0,\n      premiumSmartMine:!!opts.premiumSmartMine,premiumBreakDetonation:!!opts.premiumBreakDetonation,premiumNuclear:!!opts.premiumNuclear,premiumMineArmed:!!opts.premiumMineArmed,\n      gunner:!!opts.gunner,ult:!!opts.ult,trail:opts.trail??!!opts.gunner,`,
'Bomb Cat advanced projectile flags'
);

replaceOnce(
`function explode(x,y,r,dmg,color='#ff9f43',opts={}){`,
`function armPremiumBombMine(x,y,r,dmg,nuclear=false){\n  // PREMIUM MINE — proximity arm with a bounded fallback timer.\n  const born=performance.now(),scanRadius=r*1.18;\n  rings.push({x,y,r:4,max:scanRadius*.58,life:.48,total:.48,color:nuclear?'#fff3b0':'#ffbd63'});\n  const scan=()=>{\n    if(!running)return;\n    const elapsed=performance.now()-born;\n    const target=enemies.find(e=>!e.dead&&Math.hypot(e.x-x,e.y-y)<=scanRadius+e.r);\n    if(target||elapsed>=2200){\n      const rr=r*(nuclear?.76:.60),dd=dmg*(nuclear?.72:.52);\n      rings.push({x,y,r:3,max:rr*1.04,life:.24,total:.24,color:nuclear?'#fff3b0':'#ffc66e'});\n      explode(x,y,rr,dd,nuclear?'#fff3b0':'#ffc66e',{secondary:true,bombcat:true,silent:false,premiumBreakChain:true});\n      return;\n    }\n    if(elapsed%540<190)rings.push({x,y,r:3,max:scanRadius*.36,life:.18,total:.18,color:nuclear?'#fff3b0':'#ffbd63'});\n    setTimeout(scan,180);\n  };\n  setTimeout(scan,260);\n}\n\nfunction explode(x,y,r,dmg,color='#ff9f43',opts={}){`,
'SMART MINE helper'
);

replaceOnce(
`  for(const e of enemies) if(!e.dead && Math.hypot(e.x-x,e.y-y)<=r+e.r) if(damageEnemy(e,dmg))kills++;`,
`  for(const e of enemies) if(!e.dead && Math.hypot(e.x-x,e.y-y)<=r+e.r) if(damageEnemy(e,dmg,true,{premiumBombCat:!!opts.bombcat,premiumBreakChain:!!opts.premiumBreakChain}))kills++;`,
'Bomb Cat damage metadata'
);

replaceOnce(
`    killEnemy(e,{crit,overkill,damage:actualDmg});`,
`    killEnemy(e,{...meta,crit,overkill,damage:actualDmg});`,
'damage metadata propagation'
);

replaceOnce(
`  e.dead=true;\n  window.BreakRunBuild?.gainXp?.(e);`,
`  e.dead=true;\n  if(meta.premiumBombCat&&!meta.premiumBreakChain&&breakCombo>=10){\n    const premiumBombFx=window.BreakRunBuild?.getEffects?.('bombcat');\n    if(premiumBombFx?.breakDetonation&&e.type!=='boss'){\n      const now=performance.now();\n      if(now-(window.__premiumBreakDetonationAt||0)>=90){\n        window.__premiumBreakDetonationAt=now;\n        setTimeout(()=>{if(running)explode(e.x,e.y,52*ps.area,ps.damage*.45*(premiumBombFx.damageMul||1),'#ffb85a',{secondary:true,bombcat:true,silent:true,premiumBreakChain:true})},42);\n      }\n    }\n  }\n  window.BreakRunBuild?.gainXp?.(e);`,
'BREAK DETONATION kill hook'
);

replaceOnce(
`      bombcat:isBombCat,bombVisual:isBombCat,bombSpin:profile.royal?3.2:5.4,\n      color:profile.royal?'#fff0a0':'#ffb24a'`,
`      bombcat:isBombCat,bombVisual:isBombCat,bombSpin:profile.royal?3.2:5.4,\n      premiumSmartMine:!!premiumBombFx?.smartMines,\n      premiumBreakDetonation:!!premiumBombFx?.breakDetonation,\n      premiumNuclear:premiumBombFx?.evolution==='nuclear-cascade',\n      color:premiumBombFx?.evolution==='nuclear-cascade'?'#fff3b0':(profile.royal?'#fff0a0':'#ffb24a')`,
'Bomb Cat advanced fire flags'
);

replaceOnce(
`        if(b.kind==='explosion'){\n          const royal=!!(b.royal||b.nuke);\n          const boomDmg=b.dmg*1.5*(royal?3.0:1);`,
`        if(b.kind==='explosion'){\n          const royal=!!(b.royal||b.nuke);\n          const premiumNuclear=!!b.premiumNuclear;\n          const boomDmg=b.dmg*1.5*(royal?3.0:1)*(premiumNuclear?1.18:1);\n          if(premiumNuclear){\n            // PREMIUM NUCLEAR CASCADE — extra presentation peak, not a separate damage loop.\n            hitStop=Math.max(hitStop,.028);bombCatFlash=Math.max(bombCatFlash,.62);\n            rings.push({x:b.x,y:b.y,r:4,max:b.radius*1.30,life:.40,total:.40,color:'#fff3b0'});\n            for(let ni=0;ni<(performanceMode?6:14);ni++){const na=rnd(0,Math.PI*2),ns=rnd(120,320);particles.push({x:b.x,y:b.y,vx:Math.cos(na)*ns,vy:Math.sin(na)*ns,life:rnd(.22,.52),size:rnd(2,7),color:'#fff3b0'})}\n          }`,
'NUCLEAR CASCADE peak'
);

replaceOnce(
`            const kills=explode(b.x,b.y,b.radius,boomDmg,royal?'#fff1a0':'#ffb24a',{\n              aftershock:b.aftershock,bombcat:b.bombcat,royal\n            });`,
`            const kills=explode(b.x,b.y,b.radius*(premiumNuclear?1.10:1),boomDmg,premiumNuclear?'#fff3b0':(royal?'#fff1a0':'#ffb24a'),{\n              aftershock:b.aftershock,bombcat:b.bombcat,royal\n            });`,
'NUCLEAR CASCADE blast size'
);

replaceOnce(
`            if(b.bombcat&&b.chainChance&&kills>0&&Math.random()<b.chainChance)triggerBombCatChainReaction(b.x,b.y,b.radius,boomDmg);\n          }\n          b.life=0;break`,
`            if(b.bombcat&&b.chainChance&&kills>0&&Math.random()<b.chainChance)triggerBombCatChainReaction(b.x,b.y,b.radius,boomDmg);\n          }\n          if(b.bombcat&&b.premiumSmartMine&&!b.premiumMineArmed)armPremiumBombMine(b.x,b.y,b.radius,boomDmg,premiumNuclear);\n          b.life=0;break`,
'SMART MINE spawn hook'
);

fs.writeFileSync(file,html);
console.log('Applied Premium advanced run build integration');
