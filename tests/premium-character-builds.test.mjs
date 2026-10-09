import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function importSource(path){
  const src=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}

test('all six Premium Edition characters expose signature identities',async()=>{
  const {PREMIUM_CHARACTERS}=await importSource('../src/data/characters-premium.js');
  const expected={
    gunner:'MOMENTUM',bombcat:'CHAIN',thunderfox:'VOLTAGE',
    blademaster:'FLOW',nova:'RESONANCE',missilequeen:'TARGET LOCK'
  };
  assert.deepEqual(Object.fromEntries(Object.entries(PREMIUM_CHARACTERS).map(([id,c])=>[id,c.meter])),expected);
});

test('every character upgrade catalog contains modify, synergy and one evolution path',async()=>{
  const {PREMIUM_UPGRADES}=await importSource('../src/data/upgrades.js');
  const ids=['gunner','bombcat','thunderfox','blademaster','nova','missilequeen'];
  for(const id of ids){
    const list=PREMIUM_UPGRADES[id];
    assert.ok(Array.isArray(list)&&list.length>=5,id+' catalog');
    assert.ok(list.filter(x=>x.tier==='modify').length>=2,id+' modify');
    assert.ok(list.filter(x=>x.tier==='synergy').length>=1,id+' synergy');
    assert.equal(list.filter(x=>x.tier==='evolution').length,1,id+' evolution');
  }
});

test('every evolution requires at least one non-stat build-defining prerequisite',async()=>{
  const {PREMIUM_UPGRADES}=await importSource('../src/data/upgrades.js');
  for(const [id,list] of Object.entries(PREMIUM_UPGRADES)){
    const evo=list.find(x=>x.tier==='evolution');
    assert.ok(evo.requires?.length>=2,id+' evolution requirements');
    const prereqs=evo.requires.map(req=>list.find(x=>x.id===req)).filter(Boolean);
    assert.ok(prereqs.some(x=>x.tier==='synergy'||x.tier==='modify'),id+' defining prerequisite');
  }
});