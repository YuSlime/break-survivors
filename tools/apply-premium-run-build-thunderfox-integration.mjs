import fs from 'node:fs';

const file=new URL('../index.html',import.meta.url);
let html=fs.readFileSync(file,'utf8');
const MARK='// PREMIUM RUN BUILD THUNDERFOX V1';
const REQUIRED=[
  "window.BreakRunBuild?.getEffects?.('thunderfox')",
  'premiumThunderFx?.chainAdd',
  'premiumVoltage>=.75',
  'criticalStormCharged',
  'function spawnPremiumStormField(',
  'function startPremiumThunderGod(',
  'PREMIUM THUNDER GOD'
];

function replaceOnce(from,to,label){
  const count=html.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  html=html.replace(from,to);
}

if(html.includes(MARK)){
  const missing=REQUIRED.filter(x=>!html.includes(x));
  if(missing.length)throw new Error(`Thunder Fox marker exists but integration is incomplete: ${missing.join(', ')}`);
  console.log('Premium Thunder Fox run build integration already present and validated');
  process.exit(0);
}

replaceOnce(
`function chainLightning(dmg,count=5,opts={}){`,
`${MARK}\nfunction spawnPremiumStormField(target,dmg,fx){\n  if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))return;\n  const x=target.x,y=target.y,radius=74*ps.area*(fx?.radiusMul||1);\n  for(let pulse=0;pulse<3;pulse++)setTimeout(()=>{\n    if(!running||currentCharacter.id!=='thunderfox')return;\n    rings.push({x,y,r:3,max:radius*(.82+pulse*.08),life:.22,total:.22,color:'#9dfcff'});\n    for(const e of enemies){\n      if(e.dead||Math.hypot(e.x-x,e.y-y)>radius+e.r)continue;\n      damageEnemy(e,dmg*(1-pulse*.08),false,{premiumThunderField:true});\n    }\n  },pulse*180);\n}\n\nfunction startPremiumThunderGod(origin,fx,baseDamage){\n  // PREMIUM THUNDER GOD — a short roaming storm that follows nearby targets.\n  let x=Number.isFinite(origin?.x)?origin.x:player.x,y=Number.isFinite(origin?.y)?origin.y:player.y;\n  showBreakCallout('THUNDER GOD','VOLTAGE MAX','#c9fbff');\n  for(let pulse=0;pulse<4;pulse++)setTimeout(()=>{\n    if(!running||currentCharacter.id!=='thunderfox')return;\n    let target=null,best=520;\n    for(const e of enemies){\n      if(e.dead)continue;\n      const d=Math.hypot(e.x-x,e.y-y);\n      if(d<best){best=d;target=e}\n    }\n    if(target){x+=(target.x-x)*.72;y+=(target.y-y)*.72}\n    rings.push({x,y,r:5,max:68*ps.area*(fx?.radiusMul||1),life:.24,total:.24,color:'#d9ffff'});\n    chainLightning(baseDamage*.42*(fx?.damageMul||1),3+(fx?.chainAdd||0),{\n      origin:{x,y},range:185*ps.area*(fx?.radiusMul||1),decay:.80,width:4.6,color:'#d9ffff',silentSfx:true,\n      damageMeta:{premiumThunder:true,premiumCriticalStorm:false,criticalStormCharged:true}\n    });\n  },pulse*220);\n}\n\nfunction chainLightning(dmg,count=5,opts={}){`,
'Thunder Fox helpers'
);

replaceOnce(
`  count+=core.chainLinks;\n  let src=opts.origin||{x:player.x,y:player.y};`,
`  count+=core.chainLinks;\n  const damageMeta=opts.damageMeta||null;\n  let src=opts.origin||{x:player.x,y:player.y};`,
'lightning damage metadata source'
);

replaceOnce(
`    const dealt=dmg*Math.pow(decay,i);\n    damageEnemy(target,dealt);\n    hit.push(target);used.add(target);src=target;`,
`    const dealt=dmg*Math.pow(decay,i);\n    damageEnemy(target,dealt,true,damageMeta||{});\n    hit.push(target);used.add(target);src=target;`,
'lightning primary damage metadata'
);

replaceOnce(
`        damageEnemy(target,dealt*.55);`,
`        damageEnemy(target,dealt*.55,true,damageMeta||{});`,
'lightning echo damage metadata'
);

replaceOnce(
`  if(crit&&meta.premiumGunner&&meta.premiumThunderCrit){\n    chainLightning(actualDmg*.30,3,{range:185*ps.area,decay:.72,width:2.4,origin:{x:e.x,y:e.y},exclude:e});\n  }\n\n  if(impact){`,
`  if(crit&&meta.premiumGunner&&meta.premiumThunderCrit){\n    chainLightning(actualDmg*.30,3,{range:185*ps.area,decay:.72,width:2.4,origin:{x:e.x,y:e.y},exclude:e});\n  }\n  if(crit&&meta.premiumThunder&&meta.premiumCriticalStorm&&!meta.criticalStormCharged){\n    meta.criticalStormCharged=true;\n    attackCounters.thunderfox=(attackCounters.thunderfox||0)+1;\n  }\n\n  if(impact){`,
'CRITICAL STORM recharge'
);

replaceOnce(
`  else if(attackType==='lightning'){\n    const count=own&&currentCharacter.id==='thunderfox'?nextAttackCount('thunderfox'):0;\n    let links=currentCharacter.id==='thunderfox'?6:5, range=190*ps.area, decay=.82;\n    if(own&&currentCharacter.id==='thunderfox'&&lv>=5)links+=2;\n    if(own&&currentCharacter.id==='thunderfox'&&lv>=20&&br==='network'){links+=3;range*=1.25}\n    if(own&&currentCharacter.id==='thunderfox'&&lv>=20&&br==='overcharge')decay=.92;\n    if(own&&currentCharacter.id==='thunderfox'&&lv>=50)links+=4;\n    chainLightning(base,links,{range,decay,width:lv>=50&&own?5.5:4,echo:own&&currentCharacter.id==='thunderfox'&&lv>=40});\n    if(own&&currentCharacter.id==='thunderfox'&&lv>=10&&count%(lv>=50?3:4)===0){\n      chainLightning(base*(lv>=50?.82:.68),Math.max(4,links-1),{range,decay,width:3.5,echo:false});\n    }\n    player.attackCd=0.48/Math.max(1,rate/2.7);\n  }`,
`  else if(attackType==='lightning'){\n    const isThunderFox=own&&currentCharacter.id==='thunderfox';\n    const count=isThunderFox?nextAttackCount('thunderfox'):0;\n    const premiumThunderFx=isThunderFox?window.BreakRunBuild?.getEffects?.('thunderfox'):null;\n    let links=currentCharacter.id==='thunderfox'?6:5, range=190*ps.area, decay=.82;\n    if(isThunderFox&&lv>=5)links+=2;\n    if(isThunderFox&&lv>=20&&br==='network'){links+=3;range*=1.25}\n    if(isThunderFox&&lv>=20&&br==='overcharge')decay=.92;\n    if(isThunderFox&&lv>=50)links+=4;\n    links+=premiumThunderFx?.chainAdd||0;\n    let premiumVoltage=count>0?(((count-1)%4)+1)/4:0;\n    const premiumOvercharged=!!(premiumThunderFx?.overcharge&&premiumVoltage>=.75);\n    const premiumThunderDamage=base*(premiumThunderFx?.damageMul||1)*(premiumOvercharged?1.25:1);\n    const premiumThunderMeta={premiumThunder:isThunderFox,premiumCriticalStorm:!!premiumThunderFx?.criticalStorm,criticalStormCharged:false};\n    const premiumThunderHits=chainLightning(premiumThunderDamage,links,{\n      range,decay,width:lv>=50&&own?5.5:4,echo:isThunderFox&&lv>=40,damageMeta:premiumThunderMeta\n    });\n    if(premiumThunderFx?.stormField&&premiumThunderHits.length)spawnPremiumStormField(premiumThunderHits.at(-1),premiumThunderDamage*.22,premiumThunderFx);\n    premiumVoltage=Math.max(premiumVoltage,(attackCounters.thunderfox||0)>0?((((attackCounters.thunderfox||0)-1)%4)+1)/4:0);\n    if(premiumThunderFx?.evolution==='thunder-god'&&premiumVoltage>=1){\n      startPremiumThunderGod(premiumThunderHits.at(-1)||player,premiumThunderFx,base);\n    }\n    if(isThunderFox&&lv>=10&&count%(lv>=50?3:4)===0){\n      chainLightning(premiumThunderDamage*(lv>=50?.82:.68),Math.max(4,links-1),{range,decay,width:3.5,echo:false,damageMeta:premiumThunderMeta});\n    }\n    player.attackCd=0.48/Math.max(1,rate/2.7);\n  }`,
'Thunder Fox primary run build'
);

replaceOnce(
`  }else if(id==='thunderfox'){\n    playLightningUltimateSurge();\n    for(let w=0;w<4;w++)setTimeout(()=>{if(running)chainLightning(ps.damage*1.35,18,{range:280*ps.area,decay:.94,width:6,color:'#e4ffff',echo:true,silentSfx:true})},w*130);\n  }else if(id==='blademaster'){`,
`  }else if(id==='thunderfox'){\n    playLightningUltimateSurge();\n    const premiumThunderFx=window.BreakRunBuild?.getEffects?.('thunderfox');\n    for(let w=0;w<4;w++)setTimeout(()=>{if(running)chainLightning(ps.damage*1.35*(premiumThunderFx?.damageMul||1),18+(premiumThunderFx?.chainAdd||0),{\n      range:280*ps.area*(premiumThunderFx?.radiusMul||1),decay:.94,width:6,color:'#e4ffff',echo:true,silentSfx:true,\n      damageMeta:{premiumThunder:true,premiumCriticalStorm:!!premiumThunderFx?.criticalStorm,criticalStormCharged:false}\n    })},w*130);\n  }else if(id==='blademaster'){`,
'Thunder Fox ultimate run build'
);

fs.writeFileSync(file,html);
console.log('Applied Premium Thunder Fox run build integration');
