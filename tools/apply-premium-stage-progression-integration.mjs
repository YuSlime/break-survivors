import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM STAGE PROGRESSION V1';

if(source.includes(marker)){
  console.log('Premium stage progression already integrated');
  process.exit(0);
}

const from="  const premiumStageEnvironment=window.BreakPremiumRuntime?.getStageEnvironment?.('neon-ruins');";
const to="  /* PREMIUM STAGE PROGRESSION V1 */\n  const premiumStageEnvironment=window.BreakPremiumRuntime?.resolveStageEnvironment?.({limitBreakLevel});";
const count=source.split(from).length-1;
if(count!==1)throw new Error(`stage-progression-render: expected exactly one target, found ${count}`);
source=source.replace(from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium stage progression integration');
