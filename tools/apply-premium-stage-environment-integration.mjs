import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM STAGE ENVIRONMENT V1';

if(source.includes(marker)){
  console.log('Premium stage environment already integrated');
  process.exit(0);
}

function replaceExactly(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
}

const helper=`
/* PREMIUM STAGE ENVIRONMENT V1 */
function drawPremiumStageEnvironment(stage,cameraX,cameraY,halfViewW,halfViewH,effectiveCameraZoom){
  const left=Math.max(0,cameraX-halfViewW);
  const right=Math.min(WORLD_W,cameraX+halfViewW);
  const top=Math.max(0,cameraY-halfViewH);
  const bottom=Math.min(WORLD_H,cameraY+halfViewH);
  const visible=(x,y,w,h)=>x+w>=left&&x<=right&&y+h>=top&&y<=bottom;

  ctx.fillStyle=stage.surface;
  ctx.fillRect(0,0,WORLD_W,WORLD_H);

  for(const band of stage.roadBands){
    const x=band.x*WORLD_W,y=band.y*WORLD_H,w=band.w*WORLD_W,h=band.h*WORLD_H;
    if(!visible(x,y,w,h))continue;
    ctx.save();
    ctx.fillStyle='#040a12';
    ctx.fillRect(x,y,w,h);
    ctx.globalAlpha=.22;
    ctx.strokeStyle=stage.gridAccent;
    ctx.lineWidth=2/effectiveCameraZoom;
    if(band.axis==='x'){
      ctx.beginPath();ctx.moveTo(x,y+h*.18);ctx.lineTo(x+w,y+h*.18);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x,y+h*.82);ctx.lineTo(x+w,y+h*.82);ctx.stroke();
    }else{
      ctx.beginPath();ctx.moveTo(x+w*.18,y);ctx.lineTo(x+w*.18,y+h);ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+w*.82,y);ctx.lineTo(x+w*.82,y+h);ctx.stroke();
    }
    ctx.restore();
  }

  const grid=48;
  const gridStartX=Math.max(0,Math.floor((left-grid*2)/grid)*grid);
  const gridEndX=Math.min(WORLD_W,Math.ceil((right+grid*2)/grid)*grid);
  const gridStartY=Math.max(0,Math.floor((top-grid*2)/grid)*grid);
  const gridEndY=Math.min(WORLD_H,Math.ceil((bottom+grid*2)/grid)*grid);
  ctx.save();
  ctx.lineWidth=1/effectiveCameraZoom;
  for(let x=gridStartX;x<=gridEndX;x+=grid){
    ctx.strokeStyle=(Math.round(x/grid)%4===0)?stage.gridAccent:stage.grid;
    ctx.globalAlpha=(Math.round(x/grid)%4===0)?.55:.32;
    ctx.beginPath();ctx.moveTo(x,gridStartY);ctx.lineTo(x,gridEndY);ctx.stroke();
  }
  for(let y=gridStartY;y<=gridEndY;y+=grid){
    ctx.strokeStyle=(Math.round(y/grid)%4===0)?stage.gridAccent:stage.grid;
    ctx.globalAlpha=(Math.round(y/grid)%4===0)?.55:.32;
    ctx.beginPath();ctx.moveTo(gridStartX,y);ctx.lineTo(gridEndX,y);ctx.stroke();
  }
  ctx.restore();

  for(const puddle of stage.puddles){
    const x=puddle.x*WORLD_W,y=puddle.y*WORLD_H,w=puddle.w*WORLD_W,h=puddle.h*WORLD_H;
    if(!visible(x,y,w,h))continue;
    ctx.save();
    ctx.globalAlpha=.13;
    ctx.fillStyle=puddle.color;
    ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.5,w*.5,h*.5,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.28;
    ctx.strokeStyle=puddle.color;
    ctx.lineWidth=1/effectiveCameraZoom;
    ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.5,w*.43,h*.32,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  for(const panel of stage.neonPanels){
    const x=panel.x*WORLD_W,y=panel.y*WORLD_H,w=panel.w*WORLD_W,h=panel.h*WORLD_H;
    if(!visible(x,y,w,h*3))continue;
    ctx.save();
    ctx.shadowBlur=fxBlur(18/effectiveCameraZoom);
    ctx.shadowColor=panel.color;
    ctx.fillStyle=panel.color;
    ctx.globalAlpha=.52;
    ctx.fillRect(x,y,w,h);
    ctx.shadowBlur=fxBlur(0);
    ctx.globalAlpha=.10;
    ctx.fillRect(x+w*.08,y+h+7/effectiveCameraZoom,w*.84,h*.78);
    ctx.restore();
  }

  ctx.save();
  const hazeRadius=Math.max(halfViewW,halfViewH)*.92;
  const haze=ctx.createRadialGradient(cameraX,cameraY,Math.min(150,hazeRadius*.15),cameraX,cameraY,hazeRadius);
  haze.addColorStop(0,stage.haze+'00');
  haze.addColorStop(1,stage.haze);
  ctx.globalAlpha=stage.hazeAlpha;
  ctx.fillStyle=haze;
  ctx.fillRect(left,top,right-left,bottom-top);
  ctx.restore();

  const rainCount=Math.max(8,Math.round(22*stage.rainDensity));
  const viewW=Math.max(1,right-left),viewH=Math.max(1,bottom-top);
  ctx.save();
  ctx.strokeStyle=stage.accent;
  ctx.lineWidth=1/effectiveCameraZoom;
  ctx.globalAlpha=.13;
  for(let i=0;i<rainCount;i++){
    const seedX=((i*977)%1000)/1000;
    const seedY=((i*613)%1000)/1000;
    const x=left+((seedX*viewW+gameTime*92)%viewW);
    const y=top+((seedY*viewH+gameTime*236)%viewH);
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-13/effectiveCameraZoom,y+36/effectiveCameraZoom);ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.shadowBlur=fxBlur(24/effectiveCameraZoom);
  ctx.shadowColor=stage.accent;
  ctx.strokeStyle=stage.border;
  ctx.lineWidth=8/effectiveCameraZoom;
  ctx.strokeRect(0,0,WORLD_W,WORLD_H);
  ctx.shadowBlur=fxBlur(0);
  ctx.strokeStyle=stage.borderHot;
  ctx.lineWidth=2/effectiveCameraZoom;
  ctx.strokeRect(0,0,WORLD_W,WORLD_H);
  ctx.restore();
}

`;

replaceExactly('stage-helper-anchor','function draw(){',helper+'function draw(){');

const legacy=`  // Battlefield surface; outside this rectangle remains dark.
  ctx.fillStyle='#0b111d';
  ctx.fillRect(0,0,WORLD_W,WORLD_H);

  ctx.strokeStyle='#151f31';ctx.lineWidth=1/effectiveCameraZoom;
  const gridStartX=Math.max(0,Math.floor((cameraX-halfViewW-grid*2)/grid)*grid);
  const gridEndX=Math.min(WORLD_W,Math.ceil((cameraX+halfViewW+grid*2)/grid)*grid);
  const gridStartY=Math.max(0,Math.floor((cameraY-halfViewH-grid*2)/grid)*grid);
  const gridEndY=Math.min(WORLD_H,Math.ceil((cameraY+halfViewH+grid*2)/grid)*grid);
  for(let x=gridStartX;x<=gridEndX;x+=grid){ctx.beginPath();ctx.moveTo(x,gridStartY);ctx.lineTo(x,gridEndY);ctx.stroke()}
  for(let y=gridStartY;y<=gridEndY;y+=grid){ctx.beginPath();ctx.moveTo(gridStartX,y);ctx.lineTo(gridEndX,y);ctx.stroke()}

  // Strong visible world limit.
  ctx.save();
  ctx.shadowBlur=fxBlur(28/effectiveCameraZoom);
  ctx.shadowColor='#5b8dcb';
  ctx.strokeStyle='#5579a8';
  ctx.lineWidth=8/effectiveCameraZoom;
  ctx.strokeRect(0,0,WORLD_W,WORLD_H);
  ctx.shadowBlur=fxBlur(0);
  ctx.strokeStyle='#a7c9ef';
  ctx.lineWidth=2/effectiveCameraZoom;
  ctx.strokeRect(0,0,WORLD_W,WORLD_H);
  ctx.restore();`;

const staged=`  const premiumStageEnvironment=window.BreakPremiumRuntime?.getStageEnvironment?.('neon-ruins');
  if(premiumStageEnvironment){
    drawPremiumStageEnvironment(premiumStageEnvironment,cameraX,cameraY,halfViewW,halfViewH,effectiveCameraZoom);
  }else{
    // Battlefield surface; outside this rectangle remains dark.
    ctx.fillStyle='#0b111d';
    ctx.fillRect(0,0,WORLD_W,WORLD_H);

    ctx.strokeStyle='#151f31';ctx.lineWidth=1/effectiveCameraZoom;
    const gridStartX=Math.max(0,Math.floor((cameraX-halfViewW-grid*2)/grid)*grid);
    const gridEndX=Math.min(WORLD_W,Math.ceil((cameraX+halfViewW+grid*2)/grid)*grid);
    const gridStartY=Math.max(0,Math.floor((cameraY-halfViewH-grid*2)/grid)*grid);
    const gridEndY=Math.min(WORLD_H,Math.ceil((cameraY+halfViewH+grid*2)/grid)*grid);
    for(let x=gridStartX;x<=gridEndX;x+=grid){ctx.beginPath();ctx.moveTo(x,gridStartY);ctx.lineTo(x,gridEndY);ctx.stroke()}
    for(let y=gridStartY;y<=gridEndY;y+=grid){ctx.beginPath();ctx.moveTo(gridStartX,y);ctx.lineTo(gridEndX,y);ctx.stroke()}

    // Strong visible world limit.
    ctx.save();
    ctx.shadowBlur=fxBlur(28/effectiveCameraZoom);
    ctx.shadowColor='#5b8dcb';
    ctx.strokeStyle='#5579a8';
    ctx.lineWidth=8/effectiveCameraZoom;
    ctx.strokeRect(0,0,WORLD_W,WORLD_H);
    ctx.shadowBlur=fxBlur(0);
    ctx.strokeStyle='#a7c9ef';
    ctx.lineWidth=2/effectiveCameraZoom;
    ctx.strokeRect(0,0,WORLD_W,WORLD_H);
    ctx.restore();
  }`;

replaceExactly('stage-live-render',legacy,staged);
fs.writeFileSync(path,source);
console.log('Applied Premium stage environment integration');
