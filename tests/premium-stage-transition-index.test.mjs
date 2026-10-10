import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const apply=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');

function functionSource(name){
  const start=index.indexOf('function '+name+'(');
  assert.ok(start>=0,'function '+name+' must exist');
  const paren=index.indexOf('(',start);
  let pDepth=0,close=-1;
  for(let i=paren;i<index.length;i++){
    if(index[i]==='(')pDepth++;
    else if(index[i]===')'){
      pDepth--;
      if(pDepth===0){close=i;break}
    }
  }
  const open=index.indexOf('{',close);
  let depth=0;
  for(let i=open;i<index.length;i++){
    if(index[i]==='{')depth++;
    else if(index[i]==='}'){
      depth--;
      if(depth===0)return index.slice(start,i+1);
    }
  }
  throw new Error('unterminated '+name);
}

test('runtime exposes SECTOR SHIFT cue only when stages V2 is enabled',()=>{
  assert.match(runtime,/getStageTransitionCue as getStageTransitionCueProfile/);
  assert.match(runtime,/function getStageTransitionCue\(context=\{\}\)/);
  assert.match(runtime,/if\(!resolved\.stagesV2\)return null/);
  assert.match(runtime,/getStageTransitionCueProfile\(context\)/);
  assert.match(runtime,/getStageTransitionCue,\n/);
});

test('LIMIT BREAK progression schedules a non-blocking SECTOR SHIFT without replacing the existing LIMIT BREAK callout',()=>{
  const progression=functionSource('updateThreatProgression');
  assert.match(progression,/getStageTransitionCue\?\.\(\{fromLimitBreak:previousLb,toLimitBreak:state\.limitBreak\}\)/);
  assert.match(progression,/premiumStageShift/);
  assert.match(progression,/setTimeout\(/);
  assert.match(progression,/showBreakCallout\('SECTOR SHIFT',premiumStageShift\.stageName,premiumStageShift\.color\)/);
  assert.match(progression,/playLbEventCue\('phase'/);
  assert.match(progression,/showBreakCallout\('LIMIT BREAK '\+limitBreakLevel/,'existing LIMIT BREAK callout must remain');
});

test('SECTOR SHIFT integrator exists and both workflows execute it',()=>{
  assert.equal(fs.existsSync(new URL('../tools/apply-premium-stage-transition-integration.mjs',import.meta.url)),true);
  assert.match(ci,/apply-premium-stage-transition-integration\.mjs/);
  assert.match(apply,/apply-premium-stage-transition-integration\.mjs/);
});
