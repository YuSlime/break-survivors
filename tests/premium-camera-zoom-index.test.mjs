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

test('draw applies Premium camera zoom as a temporary multiplier without mutating saved base zoom',()=>{
  const draw=functionSource('draw');
  assert.match(draw,/const premiumWorldZoom=Math\.max\(\.96,Math\.min\(1\.10,Number\(premiumCamera\?\.zoom\)\|\|1\)\)/);
  assert.match(draw,/const effectiveCameraZoom=CAMERA_ZOOM\*premiumWorldZoom/);
  assert.match(draw,/const halfViewW=W\/\(2\*effectiveCameraZoom\)/);
  assert.match(draw,/const halfViewH=H\/\(2\*effectiveCameraZoom\)/);
  assert.match(draw,/ctx\.scale\(effectiveCameraZoom,effectiveCameraZoom\)/);
  assert.doesNotMatch(draw,/CAMERA_ZOOM\s*=\s*CAMERA_ZOOM\*premiumWorldZoom/);
});

test('draw normalizes local world-border widths against effective zoom during pulse',()=>{
  const draw=functionSource('draw');
  assert.match(draw,/ctx\.lineWidth=1\/effectiveCameraZoom/);
  assert.match(draw,/fxBlur\(28\/effectiveCameraZoom\)/);
  assert.match(draw,/ctx\.lineWidth=8\/effectiveCameraZoom/);
  assert.match(draw,/ctx\.lineWidth=2\/effectiveCameraZoom/);
});
