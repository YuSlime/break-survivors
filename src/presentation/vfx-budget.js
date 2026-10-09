const freeze=(o)=>Object.freeze(o);

export const VFX_PROFILES=freeze({
  low:freeze({particles:180,damageText:20,rings:12,beams:10,explosions:14}),
  medium:freeze({particles:320,damageText:32,rings:20,beams:16,explosions:24}),
  high:freeze({particles:500,damageText:45,rings:30,beams:24,explosions:35}),
  ultra:freeze({particles:760,damageText:64,rings:42,beams:34,explosions:52})
});

const PRIORITY_FRACTION=freeze({1:.55,2:.70,3:.82,4:.93,5:1});

function normalizeProfile(name){
  return VFX_PROFILES[name]?name:'high';
}

function normalizePriority(priority){
  return Math.max(1,Math.min(5,Math.floor(Number(priority)||1)));
}

export function createVfxBudget({profile='high'}={}){
  let profileName=normalizeProfile(profile);
  let limits=VFX_PROFILES[profileName];
  const counts={};

  function beginFrame(){
    for(const key of Object.keys(limits))counts[key]=0;
    return counts;
  }

  function setProfile(next){
    profileName=normalizeProfile(next);
    limits=VFX_PROFILES[profileName];
    beginFrame();
    return profileName;
  }

  function reserve(kind,requested=1,priority=1){
    const hard=limits[kind];
    const amount=Math.max(0,Math.floor(Number(requested)||0));
    if(!Number.isFinite(hard)||amount<=0)return 0;
    const p=normalizePriority(priority);
    const ceiling=Math.max(1,Math.floor(hard*PRIORITY_FRACTION[p]));
    const current=counts[kind]||0;
    const available=Math.max(0,ceiling-current);
    const granted=Math.min(amount,available);
    counts[kind]=current+granted;
    return granted;
  }

  function trySpawn(kind,priority=1){
    return reserve(kind,1,priority)===1;
  }

  beginFrame();
  return {
    get profile(){return profileName},
    get limits(){return limits},
    counts,
    beginFrame,
    setProfile,
    reserve,
    trySpawn
  };
}

export function recommendVfxProfile(current='high',avgFps=60){
  const fps=Number(avgFps)||0;
  if(fps<35)return 'low';
  if(fps<45)return 'medium';
  if(fps>=58 && current==='medium')return 'high';
  return normalizeProfile(current);
}
