import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');

const marker='// PREMIUM TACTICAL ELITE CAP';
if(source.includes(marker)){
  console.log('Premium tactical Elite-aware spawn caps already integrated');
  process.exit(0);
}

const from=`  const premiumTacticalCounts={support:0,assassin:0,summoner:0,shielder:0};\n  for(const enemy of enemies){\n    if(!enemy.dead&&enemy.premiumDef&&premiumTacticalCounts[enemy.type]!==undefined){\n      premiumTacticalCounts[enemy.type]++;\n    }\n  }\n  const premiumTacticalType=window.BreakPremiumRuntime?.pickTacticalEnemy?.({\n    gameTime,\n    threat:threatLevel,\n    roll:Math.random(),\n    activeCounts:premiumTacticalCounts\n  });`;

const to=`  const premiumTacticalCounts={support:0,assassin:0,summoner:0,shielder:0};\n  for(const enemy of enemies){\n    if(!enemy.dead&&enemy.premiumDef&&premiumTacticalCounts[enemy.type]!==undefined){\n      premiumTacticalCounts[enemy.type]++;\n    }\n  }\n  // PREMIUM TACTICAL ELITE CAP\n  const premiumEliteCount=enemies.reduce((count,enemy)=>count+(!enemy.dead&&enemy.type==='elite'?1:0),0);\n  const premiumTacticalType=window.BreakPremiumRuntime?.pickTacticalEnemy?.({\n    gameTime,\n    threat:threatLevel,\n    roll:Math.random(),\n    activeCounts:premiumTacticalCounts,\n    eliteCount:premiumEliteCount\n  });`;

const count=source.split(from).length-1;
if(count!==1)throw new Error(`tactical-spawn-cap: expected exactly one target, found ${count}`);
source=source.replace(from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium Elite-aware tactical spawn cap integration');
