// Guarded follow-up patches found during Premium combat V2 self-review.
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
  'support-aura-ranged-speed',
  `      const bossSpeed=(e.type==='boss'&&e.phase===2?e.speed*1.22:e.speed)*pursuitBoost;`,
  `      const bossSpeed=(e.type==='boss'&&e.phase===2?premiumSpeed*1.22:premiumSpeed)*pursuitBoost;`
);

if(changed){
  fs.writeFileSync(path,source);
  console.log('Premium combat V2 review fixes applied.');
}else{
  console.log('Premium combat V2 review fixes already present.');
}
