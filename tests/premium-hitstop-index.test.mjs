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

test('main loop bridges one-shot Premium camera hit stop into existing simulation freeze',()=>{
  const loop=functionSource('loop');
  assert.match(loop,/const premiumFrame=window\.BreakPremiumRuntime\?\.updateFrame\?\.\(frameDt,premiumFrameState\(\)\)/);
  assert.match(loop,/const premiumHitStop=Math\.max\(0,Number\(premiumFrame\?\.camera\?\.hitStopMs\)\|\|0\)\/1000/);
  assert.match(loop,/if\(premiumHitStop>0\)hitStop=Math\.max\(hitStop,premiumHitStop\)/);
  assert.doesNotMatch(loop,/hitStop\s*\+=\s*premiumHitStop/);
});

test('existing updateBreakRush remains the single simulation freeze gate',()=>{
  const updateBreakRush=functionSource('updateBreakRush');
  const update=functionSource('update');
  assert.match(updateBreakRush,/if\(hitStop>0\)\{hitStop=Math\.max\(0,hitStop-dt\);return false\}/);
  assert.match(update,/if\(!updateBreakRush\(dt\)\)\{if\(refreshHud\)updateHud\(\);return\}/);
});
