import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function functionSource(name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,'function '+name+' must exist');
  const paren=source.indexOf('(',start);
  let pDepth=0,close=-1;
  for(let i=paren;i<source.length;i++){
    if(source[i]==='(')pDepth++;
    else if(source[i]===')'){
      pDepth--;
      if(pDepth===0){close=i;break}
    }
  }
  const open=source.indexOf('{',close);
  let depth=0;
  for(let i=open;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'){
      depth--;
      if(depth===0)return source.slice(start,i+1);
    }
  }
  throw new Error('unterminated '+name);
}

test('index loads the Premium runtime module without replacing the legacy game',()=>{
  assert.match(source,/<script type="module" src="\.\/src\/game\/premium-runtime\.js"><\/script>/);
  assert.match(source,/requestAnimationFrame\(loop\)/);
});

test('game has exactly one canonical Premium frame snapshot',()=>{
  const declarations=source.match(/function premiumFrameState\(\)/g)||[];
  assert.equal(declarations.length,1,'premiumFrameState must not be redefined later in index.html');
  const snapshot=functionSource('premiumFrameState');
  for(const token of [
    'highDensity','breakActive','eliteActive','feverActive','limitBreakActive',
    'bossActive','lbEventActive','eventActive','threatActive','bossFinalPhase',
    'characterId','characterLevel','gunnerMomentum','attackCounters'
  ]){
    assert.match(snapshot,new RegExp(token),token);
  }
});

test('game loop feeds live run state into the Premium runtime exactly once per animation frame',()=>{
  const loop=functionSource('loop');
  const updates=loop.match(/BreakPremiumRuntime\?\.updateFrame\?\.\(frameDt,premiumFrameState\(\)\)/g)||[];
  assert.equal(updates.length,1,'Premium runtime must update exactly once per animation frame');
});

test('draw adds Premium camera feedback without removing legacy shake',()=>{
  const draw=functionSource('draw');
  assert.match(draw,/getScreenShakeProfile\(\)/);
  assert.match(draw,/BreakPremiumRuntime\?\.cameraState/);
  assert.match(draw,/premiumCamera\?\.kickX/);
  assert.match(draw,/premiumCamera\?\.shake/);
});

test('combat milestones signal the Premium camera director through their presentation owners',()=>{
  const kill=functionSource('killEnemy');
  const fever=functionSource('startFever');
  const feverTransition=functionSource('beginPremiumFeverTransition');
  const progression=functionSource('updateThreatProgression');
  assert.match(kill,/premiumDeathEvent/);
  assert.match(kill,/BreakPremiumRuntime\?\.signal\?\.\(premiumDeathEvent/);
  assert.match(fever,/beginPremiumFeverTransition\(\)/,'startFever delegates staged presentation');
  assert.match(feverTransition,/BreakPremiumRuntime\?\.signal\?\.\('fever'/,'FEVER camera impulse belongs to staged burst');
  assert.match(progression,/BreakPremiumRuntime\?\.signal\?\.\('limitBreak'/);
});

test('run reset also resets Premium runtime state',()=>{
  const reset=functionSource('resetRun');
  assert.match(reset,/BreakPremiumRuntime\?\.reset\?\.\(\)/);
});
