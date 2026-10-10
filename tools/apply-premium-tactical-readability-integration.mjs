import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');

const markerV2='// PREMIUM ROLE MARKER V2';
if(source.includes(markerV2)){
  console.log('Premium tactical role markers V2 already integrated');
  process.exit(0);
}

const oldBlock=`    if(e.premiumDef){\n      // PREMIUM ROLE MARKER\n      const roleMarker=window.BreakPremiumRuntime?.getTacticalEnemyMarker?.(e.type);\n      if(roleMarker){\n        ctx.save();\n        ctx.font='1000 8px ui-monospace,SFMono-Regular,Menlo,monospace';\n        ctx.textAlign='center';ctx.textBaseline='middle';\n        const markerWidth=Math.max(24,ctx.measureText(roleMarker.code).width+10);\n        const markerY=-e.r-14;\n        ctx.globalAlpha=.92;ctx.fillStyle='#060a12dd';ctx.fillRect(-markerWidth/2,markerY-7,markerWidth,13);\n        ctx.strokeStyle=roleMarker.color;ctx.lineWidth=1.5;ctx.strokeRect(-markerWidth/2,markerY-7,markerWidth,13);\n        ctx.fillStyle=roleMarker.color;ctx.shadowBlur=8;ctx.shadowColor=roleMarker.color;ctx.fillText(roleMarker.code,0,markerY);\n        ctx.restore();\n      }\n    }`;

const newBlock=`    if(e.premiumDef){\n      // PREMIUM ROLE MARKER V2\n      const roleMarker=window.BreakPremiumRuntime?.getTacticalEnemyMarker?.(e.type);\n      if(roleMarker){\n        ctx.save();\n        ctx.font='1000 8px ui-monospace,SFMono-Regular,Menlo,monospace';\n        ctx.textAlign='center';ctx.textBaseline='middle';\n        const markerWidth=Math.max(24,ctx.measureText(roleMarker.code).width+10);\n        const markerY=e.y-e.r-14;\n        ctx.globalAlpha=.92;ctx.fillStyle='#060a12dd';ctx.fillRect(e.x-markerWidth/2,markerY-7,markerWidth,13);\n        ctx.strokeStyle=roleMarker.color;ctx.lineWidth=1.5;ctx.strokeRect(e.x-markerWidth/2,markerY-7,markerWidth,13);\n        ctx.fillStyle=roleMarker.color;ctx.shadowBlur=8;ctx.shadowColor=roleMarker.color;ctx.fillText(roleMarker.code,e.x,markerY);\n        ctx.restore();\n      }\n    }`;

if(source.includes(oldBlock)){
  source=source.replace(oldBlock,newBlock);
  fs.writeFileSync(path,source);
  console.log('Upgraded Premium tactical role markers to V2');
  process.exit(0);
}

const from=`    if(e.type==='elite'||e.type==='boss'){\n      const w=e.r*2.2;ctx.fillStyle='#1b2130';ctx.fillRect(e.x-w/2,e.y-e.r-10,w,5);`;
const to=`${newBlock}\n    if(e.type==='elite'||e.type==='boss'){\n      const w=e.r*2.2;ctx.fillStyle='#1b2130';ctx.fillRect(e.x-w/2,e.y-e.r-10,w,5);`;

const count=source.split(from).length-1;
if(count!==1)throw new Error(`tactical-role-marker: expected exactly one target, found ${count}`);
source=source.replace(from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium tactical role markers V2');
