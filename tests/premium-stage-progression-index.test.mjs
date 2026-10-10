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

test('runtime resolves a stage profile from current LIMIT BREAK progression',()=>{
  assert.match(runtime,/resolveStageEnvironmentId as resolveStageEnvironmentIdProfile/);
  assert.match(runtime,/function resolveStageEnvironment\(context=\{\}\)/);
  assert.match(runtime,/resolveStageEnvironmentIdProfile\(context\)/);
  assert.match(runtime,/getStageEnvironmentProfile\(id\)/);
  assert.match(runtime,/resolveStageEnvironment,\n/);
});

test('live draw uses current limitBreakLevel instead of a hardcoded NEON RUINS profile',()=>{
  const draw=functionSource('draw');
  assert.match(draw,/BreakPremiumRuntime\?\.resolveStageEnvironment\?\.\(\{limitBreakLevel\}\)/);
  assert.doesNotMatch(draw,/getStageEnvironment\?\.\('neon-ruins'\)/);
  assert.match(draw,/premiumStageEnvironment/);
  assert.match(draw,/#0b111d/,'legacy stage fallback must remain when stages V2 is off');
});

test('stage progression integrator exists and both workflows execute it',()=>{
  assert.equal(fs.existsSync(new URL('../tools/apply-premium-stage-progression-integration.mjs',import.meta.url)),true);
  assert.match(ci,/apply-premium-stage-progression-integration\.mjs/);
  assert.match(apply,/apply-premium-stage-progression-integration\.mjs/);
});
