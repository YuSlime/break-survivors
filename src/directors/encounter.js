const MAJOR=new Set(['boss','limitBreak']);
const KNOWN=new Set(['boss','limitBreak','anomaly','treasure']);

export function createEncounterDirector({calmSeconds=8}={}){
  let activeMajor=null;
  let recovery=0;

  function canStart(kind,context={}){
    if(!KNOWN.has(kind))return false;
    if(context.running===false)return false;
    if(activeMajor)return false;
    if(context.bossActive||context.limitBreakActive)return false;
    if(kind==='boss'&&context.bossPending)return false;
    if(recovery>0)return false;
    return true;
  }

  function start(kind,context={}){
    if(!canStart(kind,context))return false;
    if(MAJOR.has(kind))activeMajor=kind;
    return true;
  }

  function finish(kind){
    if(!MAJOR.has(kind) || activeMajor!==kind)return false;
    activeMajor=null;
    recovery=Math.max(0,Number(calmSeconds)||0);
    return true;
  }

  function update(dt){
    recovery=Math.max(0,recovery-Math.max(0,Number(dt)||0));
    return recovery;
  }

  function reset(){activeMajor=null;recovery=0}

  return {
    get activeMajor(){return activeMajor},
    get recovery(){return recovery},
    canStart,
    start,
    finish,
    update,
    reset
  };
}
