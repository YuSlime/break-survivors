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

test('enemy death VFX uses priority-aware Premium budgets while preserving legacy counts when disabled',()=>{
  const kill=functionSource('killEnemy');
  assert.match(kill,/premiumVfxPriority=e\.type==='boss'\?5:e\.type==='treasure'\?4:e\.type==='elite'\?3:meta\.overkill\?2:1/);
  assert.match(kill,/allowVfxCount\?\.\('rings',1,premiumVfxPriority\)/);
  assert.match(kill,/premiumRingCount>0/);
  assert.match(kill,/allowVfxCount\?\.\('particles',burst,premiumVfxPriority\)/);
  assert.match(kill,/for\(let i=0;i<premiumBurst;i\+\+\)/);
});
