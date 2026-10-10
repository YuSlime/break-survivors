import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM DAMAGE NUMBERS V1';

if(source.includes(marker)){
  console.log('Premium damage numbers already integrated');
  process.exit(0);
}

const from=`    if(crit && floatingTexts.length<42){
      floatingTexts.push({
        x:e.x,y:e.y-12,text:'CRIT '+Math.ceil(actualDmg),
        color:'#fff06c',life:.48,total:.48,vy:-62,size:crit?17:13,weight:1000
      });
    }
`;

const to=`    /* PREMIUM DAMAGE NUMBERS V1 */
    const premiumDamageNumber=window.BreakPremiumRuntime?.resolveDamageNumber?.({
      damage:actualDmg,crit,existingCount:floatingTexts.length,impact
    });
    if(premiumDamageNumber){
      floatingTexts.push({
        x:e.x,y:e.y-12,text:premiumDamageNumber.text,
        color:premiumDamageNumber.color,
        life:premiumDamageNumber.life,total:premiumDamageNumber.life,
        vy:premiumDamageNumber.vy,size:premiumDamageNumber.size,
        weight:premiumDamageNumber.weight,shadow:premiumDamageNumber.shadow
      });
    }else if(!window.BreakPremiumRuntime?.flags?.vfxDirector && crit && floatingTexts.length<42){
      floatingTexts.push({
        x:e.x,y:e.y-12,text:'CRIT '+Math.ceil(actualDmg),
        color:'#fff06c',life:.48,total:.48,vy:-62,size:crit?17:13,weight:1000
      });
    }
`;

const count=source.split(from).length-1;
if(count!==1)throw new Error(`damage-number-hit-path: expected exactly one target, found ${count}`);
source=source.replace(from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium damage number integration');
