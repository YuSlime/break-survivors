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

test('runtime exposes the Premium damage number resolver',()=>{
  assert.match(runtime,/damage-numbers\.js/);
  assert.match(runtime,/function resolveDamageNumber\(context=\{\}\)/);
  assert.match(runtime,/resolveDamageNumber,\n/);
});

test('live damage path delegates readable number hierarchy to Premium runtime with legacy crit fallback',()=>{
  const damage=functionSource('damageEnemy');
  assert.match(damage,/BreakPremiumRuntime\?\.resolveDamageNumber\?\.\(\{/);
  assert.match(damage,/damage:actualDmg/);
  assert.match(damage,/existingCount:floatingTexts\.length/);
  assert.match(damage,/impact/);
  assert.match(damage,/premiumDamageNumber/);
  assert.match(damage,/premiumDamageNumber\.text/);
  assert.match(damage,/crit && floatingTexts\.length<42/,'legacy crit fallback must remain available');
});

test('damage number integrator exists and both workflows execute it',()=>{
  assert.equal(fs.existsSync(new URL('../tools/apply-premium-damage-numbers-integration.mjs',import.meta.url)),true);
  assert.match(ci,/apply-premium-damage-numbers-integration\.mjs/);
  assert.match(apply,/apply-premium-damage-numbers-integration\.mjs/);
});
