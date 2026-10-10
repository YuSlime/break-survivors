import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='// PREMIUM DEATH PRESENTATION V1';

if(source.includes(marker)){
  console.log('Premium death presentation already integrated');
  process.exit(0);
}

function replaceOnce(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
}

const from=`  const premiumVfxPriority=e.type==='boss'?5:e.type==='treasure'?4:e.type==='elite'?3:meta.overkill?2:1;
  const premiumRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumVfxPriority)??1;
  if(premiumRingCount>0)rings.push({
    x:e.x,y:e.y,r:Math.max(3,e.r*.25),
    max:e.r*(e.type==='boss'?3.1:e.type==='treasure'?2.8:e.type==='elite'?2.2:meta.overkill?2.15:1.75),
    life:e.type==='boss'?.42:e.type==='elite'?.28:.18,
    total:e.type==='boss'?.42:e.type==='elite'?.28:.18,
    color:meta.overkill?'#ffd95e':e.type==='boss'?'#ffd86f':e.color
  });

  const burst=e.type==='boss'?42:e.type==='treasure'?34:e.type==='elite'?26:meta.overkill?20:12;
  const premiumBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',burst,premiumVfxPriority)??burst;
  for(let i=0;i<premiumBurst;i++) particles.push({
    x:e.x,y:e.y,
    vx:rnd(-190,190)*(e.type==='boss'?1.5:e.type==='elite'?1.2:meta.overkill?1.15:1),
    vy:rnd(-190,190)*(e.type==='boss'?1.5:e.type==='elite'?1.2:meta.overkill?1.15:1),
    life:rnd(.25,e.type==='boss'?.85:e.type==='elite'?.65:.55),
    size:rnd(2,e.type==='boss'?9:e.type==='elite'?7:meta.overkill?7:6),
    color:meta.overkill?(i%2?'#ffd35c':e.color):e.color
  });`;

const to=`  // PREMIUM DEATH PRESENTATION V1
  const premiumDeathFx=window.BreakPremiumRuntime?.resolveDeathPresentation?.({enemyType:e.type,overkill:meta.overkill,color:e.color});
  if(premiumDeathFx){
    if(premiumDeathFx.hitStopMs>0)hitStop=Math.max(hitStop,premiumDeathFx.hitStopMs/1000);

    const premiumDeathRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumDeathFx.priority)??1;
    if(premiumDeathRingCount>0)rings.push({
      x:e.x,y:e.y,r:Math.max(3,e.r*.20),max:e.r*premiumDeathFx.ringScale,
      life:premiumDeathFx.ringLife,total:premiumDeathFx.ringLife,
      color:premiumDeathFx.coreBurst?'#fff1ae':meta.overkill?'#ffd95e':premiumDeathFx.color
    });

    if(premiumDeathFx.secondaryRing){
      const premiumSecondaryRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumDeathFx.priority)??1;
      if(premiumSecondaryRingCount>0)rings.push({
        x:e.x,y:e.y,r:Math.max(2,e.r*.10),max:e.r*premiumDeathFx.ringScale*.76,
        life:premiumDeathFx.ringLife*1.32,total:premiumDeathFx.ringLife*1.32,
        color:premiumDeathFx.coreBurst?premiumDeathFx.color:'#d8e5f2'
      });
    }

    const premiumDeathBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',premiumDeathFx.particleCount,premiumDeathFx.priority)??premiumDeathFx.particleCount;
    const deathAngle=Math.atan2(e.y-player.y,e.x-player.x);
    for(let i=0;i<premiumDeathBurst;i++){
      let angle=rnd(0,Math.PI*2);
      if(premiumDeathFx.style==='runner-shear')angle=deathAngle+rnd(-.52,.52);
      else if(premiumDeathFx.style==='heavy-crack')angle=rnd(0,Math.PI*2);
      else if(premiumDeathFx.style==='core-rupture')angle=(i/Math.max(1,premiumDeathBurst))*Math.PI*2+rnd(-.16,.16);

      const speed=rnd(premiumDeathFx.speedMin,premiumDeathFx.speedMax);
      let vx=Math.cos(angle)*speed,vy=Math.sin(angle)*speed;
      if(premiumDeathFx.style==='heavy-crack')vy+=rnd(48,112);
      if(premiumDeathFx.style==='runner-shear'){
        vx*=1.18;vy*=.82;
      }

      const deathColor=premiumDeathFx.coreBurst&&i%4===0
        ?'#fff7cf'
        :meta.overkill&&i%3===0?'#ffd35c':premiumDeathFx.color;
      particles.push({
        x:e.x,y:e.y,vx,vy,
        life:rnd(premiumDeathFx.lifeMin,premiumDeathFx.lifeMax),
        size:rnd(premiumDeathFx.sizeMin,premiumDeathFx.sizeMax),
        color:deathColor
      });
    }

    if(premiumDeathFx.coreBurst){
      const premiumCoreBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',4,premiumDeathFx.priority)??4;
      for(let i=0;i<premiumCoreBurst;i++){
        const a=i*Math.PI*.5+rnd(-.12,.12),spd=rnd(55,115);
        particles.push({x:e.x,y:e.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:rnd(.12,.22),size:rnd(5,9),color:'#fff9df'});
      }
    }
  }else{
    const premiumVfxPriority=e.type==='boss'?5:e.type==='treasure'?4:e.type==='elite'?3:meta.overkill?2:1;
    const premiumRingCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,premiumVfxPriority)??1;
    if(premiumRingCount>0)rings.push({
      x:e.x,y:e.y,r:Math.max(3,e.r*.25),
      max:e.r*(e.type==='boss'?3.1:e.type==='treasure'?2.8:e.type==='elite'?2.2:meta.overkill?2.15:1.75),
      life:e.type==='boss'?.42:e.type==='elite'?.28:.18,
      total:e.type==='boss'?.42:e.type==='elite'?.28:.18,
      color:meta.overkill?'#ffd95e':e.type==='boss'?'#ffd86f':e.color
    });

    const burst=e.type==='boss'?42:e.type==='treasure'?34:e.type==='elite'?26:meta.overkill?20:12;
    const premiumBurst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',burst,premiumVfxPriority)??burst;
    for(let i=0;i<premiumBurst;i++) particles.push({
      x:e.x,y:e.y,
      vx:rnd(-190,190)*(e.type==='boss'?1.5:e.type==='elite'?1.2:meta.overkill?1.15:1),
      vy:rnd(-190,190)*(e.type==='boss'?1.5:e.type==='elite'?1.2:meta.overkill?1.15:1),
      life:rnd(.25,e.type==='boss'?.85:e.type==='elite'?.65:.55),
      size:rnd(2,e.type==='boss'?9:e.type==='elite'?7:meta.overkill?7:6),
      color:meta.overkill?(i%2?'#ffd35c':e.color):e.color
    });
  }`;

replaceOnce('premium-death-presentation',from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium death presentation integration');
