import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');

const marker='activeCounts:premiumTacticalCounts';
if(source.includes(marker)){
  console.log('Premium tactical spawn caps already integrated');
  process.exit(0);
}

const from=`  const premiumTacticalType=window.BreakPremiumRuntime?.pickTacticalEnemy?.({\n    gameTime,\n    threat:threatLevel,\n    roll:Math.random()\n  });`;

const to=`  const premiumTacticalCounts={support:0,assassin:0,summoner:0,shielder:0};\n  for(const enemy of enemies){\n    if(!enemy.dead&&enemy.premiumDef&&premiumTacticalCounts[enemy.type]!==undefined){\n      premiumTacticalCounts[enemy.type]++;\n    }\n  }\n  const premiumTacticalType=window.BreakPremiumRuntime?.pickTacticalEnemy?.({\n    gameTime,\n    threat:threatLevel,\n    roll:Math.random(),\n    activeCounts:premiumTacticalCounts\n  });`;

const count=source.split(from).length-1;
if(count!==1)throw new Error(`tactical-spawn-cap: expected exactly one target, found ${count}`);
source=source.replace(from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium tactical spawn cap integration');
