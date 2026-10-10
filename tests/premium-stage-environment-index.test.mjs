import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const index=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');
const features=fs.readFileSync(new URL('../src/config/features.js',import.meta.url),'utf8');
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

test('stages V2 is an explicit opt-in feature with a preview query switch',()=>{
  assert.match(features,/stagesV2:false/);
  assert.match(runtime,/premiumStage/);
  assert.match(runtime,/overrides\.stagesV2=true/);
});

test('runtime exposes stage environment data only when stages V2 is enabled',()=>{
  assert.match(runtime,/stages-premium\.js/);
  assert.match(runtime,/function getStageEnvironment\(id='neon-ruins'\)/);
  assert.match(runtime,/if\(!resolved\.stagesV2\)return null/);
  assert.match(runtime,/getStageEnvironment,\n/);
});

test('live draw path renders the resolved Premium stage through a dedicated deterministic helper with legacy fallback',()=>{
  const draw=functionSource('draw');
  const stageDraw=functionSource('drawPremiumStageEnvironment');
  assert.match(draw,/BreakPremiumRuntime\?\.resolveStageEnvironment\?\.\(\{limitBreakLevel\}\)/);
  assert.match(draw,/drawPremiumStageEnvironment\(/);
  assert.match(draw,/premiumStageEnvironment/);
  assert.match(draw,/#0b111d/,'legacy surface fallback must remain');
  for(const token of ['roadBands','neonPanels','puddles','rainDensity'])assert.match(stageDraw,new RegExp(token));
  assert.doesNotMatch(stageDraw,/Math\.random\(/,'stage ambience must not flicker from per-frame random placement');
});

test('stage environment integrator exists and both workflows execute it',()=>{
  assert.equal(fs.existsSync(new URL('../tools/apply-premium-stage-environment-integration.mjs',import.meta.url)),true);
  assert.match(ci,/apply-premium-stage-environment-integration\.mjs/);
  assert.match(apply,/apply-premium-stage-environment-integration\.mjs/);
});
