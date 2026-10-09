import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function importSource(path){
  const src=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}

test('major encounters cannot overlap',async()=>{
  const {createEncounterDirector}=await importSource('../src/directors/encounter.js');
  const d=createEncounterDirector({calmSeconds:8});
  assert.equal(d.start('boss'),true);
  assert.equal(d.activeMajor,'boss');
  assert.equal(d.canStart('limitBreak'),false);
  assert.equal(d.canStart('anomaly'),false);
  assert.equal(d.canStart('treasure'),false);
});

test('finishing a major encounter creates a calm recovery window',async()=>{
  const {createEncounterDirector}=await importSource('../src/directors/encounter.js');
  const d=createEncounterDirector({calmSeconds:8});
  d.start('limitBreak');
  assert.equal(d.finish('limitBreak'),true);
  assert.equal(d.activeMajor,null);
  assert.equal(d.canStart('boss'),false);
  d.update(7.9);
  assert.equal(d.canStart('boss'),false);
  d.update(.2);
  assert.equal(d.canStart('boss'),true);
});

test('minor events can coexist selectively but respect external combat state',async()=>{
  const {createEncounterDirector}=await importSource('../src/directors/encounter.js');
  const d=createEncounterDirector();
  assert.equal(d.canStart('treasure',{anomalyActive:true}),true);
  assert.equal(d.canStart('anomaly',{treasureActive:true}),true);
  assert.equal(d.canStart('treasure',{bossActive:true}),false);
  assert.equal(d.canStart('anomaly',{limitBreakActive:true}),false);
  assert.equal(d.canStart('boss',{bossPending:true}),false);
});

test('director can block all new encounters while game is paused or ended',async()=>{
  const {createEncounterDirector}=await importSource('../src/directors/encounter.js');
  const d=createEncounterDirector();
  for(const kind of ['boss','limitBreak','anomaly','treasure']){
    assert.equal(d.canStart(kind,{running:false}),false);
  }
});