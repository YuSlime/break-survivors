const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

const IMPULSES=Object.freeze({
  strongHit:{shake:1.4,zoom:.008,kick:2,hitStopMs:0},
  critical:{shake:2.2,zoom:.012,kick:2.8,hitStopMs:15},
  eliteKill:{shake:4.8,zoom:.018,kick:0,hitStopMs:25},
  break:{shake:5.5,zoom:.03,kick:0,hitStopMs:40},
  fever:{shake:6.5,zoom:.045,kick:0,hitStopMs:30},
  limitBreak:{shake:9,zoom:.06,kick:0,hitStopMs:45},
  bossKill:{shake:14,zoom:.075,kick:0,hitStopMs:85}
});

export function createCameraDirector({reducedMotion=false}={}){
  let shake=0,zoomOffset=0,kickX=0,kickY=0,hitStopMs=0;

  function impulse(type,direction={x:0,y:0}){
    const def=IMPULSES[type];
    if(!def)return false;
    const motionScale=reducedMotion?.28:1;
    const stopScale=reducedMotion?.45:1;
    shake=Math.max(shake,def.shake*motionScale);
    zoomOffset=Math.max(zoomOffset,def.zoom*motionScale);
    const len=Math.hypot(direction.x||0,direction.y||0)||1;
    kickX+=(direction.x||0)/len*def.kick*motionScale;
    kickY+=(direction.y||0)/len*def.kick*motionScale;
    hitStopMs=Math.max(hitStopMs,def.hitStopMs*stopScale);
    return true;
  }

  function update(dt){
    const delta=Math.max(0,Number(dt)||0);
    const state={
      shake:clamp(shake,0,16),
      zoom:clamp(1+zoomOffset,1,1.08),
      kickX,
      kickY,
      hitStopMs:clamp(hitStopMs,0,100)
    };
    const decay=Math.exp(-10*delta);
    shake*=decay;
    zoomOffset*=Math.exp(-8*delta);
    kickX*=Math.exp(-14*delta);
    kickY*=Math.exp(-14*delta);
    hitStopMs=0;
    return state;
  }

  function reset(){shake=0;zoomOffset=0;kickX=0;kickY=0;hitStopMs=0}

  return {impulse,update,reset};
}
