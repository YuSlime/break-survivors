import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function importSource(path){
  const src=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}

const pool=[
  {id:'damage',tier:'stat',maxRank:3},
  {id:'speed',tier:'stat',maxRank:3},
  {id:'ricochet',tier:'modify',maxRank:1},
  {id:'pierce',tier:'modify',maxRank:1,exclusiveGroup:'shot-path'},
  {id:'split',tier:'modify',maxRank:1,exclusiveGroup:'shot-path'},
  {id:'crit-lightning',tier:'synergy',maxRank:1,requires:['ricochet']},
  {id:'railstorm',tier:'evolution',maxRank:1,requires:['ricochet','crit-lightning']}
];

test('choice count follows normal, BREAK and boss reward contexts',async()=>{
  const {choiceCountFor}=await importSource('../src/systems/upgrades.js');
  assert.equal(choiceCountFor({}),3);
  assert.equal(choiceCountFor({breakActive:true}),4);
  assert.equal(choiceCountFor({bossReward:true}),5);
});

test('eligible upgrades reject unmet requirements, max ranks and conflicting branches',async()=>{
  const {eligibleUpgrades}=await importSource('../src/systems/upgrades.js');
  const state={ranks:{damage:3,pierce:1,ricochet:0},exclusive:{'shot-path':'pierce'}};
  const ids=eligibleUpgrades(pool,state).map(x=>x.id);
  assert.equal(ids.includes('damage'),false);
  assert.equal(ids.includes('split'),false);
  assert.equal(ids.includes('crit-lightning'),false);
  assert.equal(ids.includes('speed'),true);
});

test('applying an upgrade increments rank and locks its exclusive branch',async()=>{
  const {applyUpgrade}=await importSource('../src/systems/upgrades.js');
  const state={ranks:{},exclusive:{}};
  const next=applyUpgrade(state,pool.find(x=>x.id==='pierce'));
  assert.equal(next.ranks.pierce,1);
  assert.equal(next.exclusive['shot-path'],'pierce');
  assert.notEqual(next,state);
});

test('evolution becomes eligible only after all prerequisites are owned',async()=>{
  const {eligibleUpgrades}=await importSource('../src/systems/upgrades.js');
  let state={ranks:{ricochet:1,'crit-lightning':0},exclusive:{}};
  assert.equal(eligibleUpgrades(pool,state).some(x=>x.id==='railstorm'),false);
  state={ranks:{ricochet:1,'crit-lightning':1},exclusive:{}};
  assert.equal(eligibleUpgrades(pool,state).some(x=>x.id==='railstorm'),true);
});

test('building choices is deterministic with supplied RNG and never duplicates options',async()=>{
  const {buildUpgradeChoices}=await importSource('../src/systems/upgrades.js');
  const rng=()=>0;
  const choices=buildUpgradeChoices(pool,{ranks:{},exclusive:{}},{rng,count:4});
  assert.equal(choices.length,4);
  assert.equal(new Set(choices.map(x=>x.id)).size,4);
});