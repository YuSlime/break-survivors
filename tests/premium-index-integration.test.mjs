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

test('game loop feeds live run state into the Premium runtime',()=>{
  const loop=functionSource('loop');
  const snapshot=functionSource('premiumFrameState');
  assert.match(loop,/BreakPremiumRuntime\?\.updateFrame\?\.\(frameDt,premiumFrameState\(\)\)/);
  for(const token of ['highDensity','breakActive','eliteActive','feverActive','limitBreakActive','bossFinalPhase']){
    assert.match(snapshot,new RegExp(token));
  }
});

test('draw adds Premium camera feedback without removing legacy shake',()=>{
  const draw=functionSource('draw');
  assert.match(draw,/getScreenShakeProfile\(\)/);
  assert.match(draw,/BreakPremiumRuntime\?\.cameraState/);
  assert.match(draw,/premiumCamera\?\.kickX/);
  assert.match(draw,/premiumCamera\?\.shake/);
});

test('combat milestones signal the Premium camera director',()=>{
  const kill=functionSource('killEnemy');
  const fever=functionSource('startFever');
  const progression=functionSource('updateThreatProgression');
  assert.match(kill,/premiumDeathEvent/);
  assert.match(kill,/BreakPremiumRuntime\?\.signal\?\.\(premiumDeathEvent/);
  assert.match(fever,/BreakPremiumRuntime\?\.signal\?\.\('fever'/);
  assert.match(progression,/BreakPremiumRuntime\?\.signal\?\.\('limitBreak'/);
});

test('run reset also resets Premium runtime state',()=>{
  const reset=functionSource('resetRun');
  assert.match(reset,/BreakPremiumRuntime\?\.reset\?\.\(\)/);
});
