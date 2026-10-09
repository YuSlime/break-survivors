const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

const LEVELS=Object.freeze({
  calm:20,
  highDensity:35,
  breakActive:50,
  eliteActive:60,
  feverActive:72,
  limitBreakActive:86,
  bossFinalPhase:100
});

export function createIntensityDirector({response=5,initial=20}={}){
  let value=clamp(Number(initial)||0,0,100);

  function targetFor(state={}){
    let target=LEVELS.calm;
    for(const key of ['highDensity','breakActive','eliteActive','feverActive','limitBreakActive','bossFinalPhase']){
      if(state[key])target=Math.max(target,LEVELS[key]);
    }
    return target;
  }

  function update(dt,state={}){
    const delta=Math.max(0,Number(dt)||0);
    const target=targetFor(state);
    const alpha=1-Math.exp(-Math.max(.01,response)*delta);
    value=clamp(value+(target-value)*alpha,0,100);
    return value;
  }

  return {
    get value(){return value},
    targetFor,
    update,
    reset(next=20){value=clamp(Number(next)||0,0,100);return value}
  };
}
