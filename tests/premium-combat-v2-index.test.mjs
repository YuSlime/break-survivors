import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const integrator=fs.readFileSync(new URL('../tools/apply-premium-runtime-integration.mjs',import.meta.url),'utf8');

test('live spawn table asks Premium runtime for tactical enemies only through combat V2 bridge',()=>{
  assert.match(source,/pickTacticalEnemy\?\.\(\{\s*gameTime,\s*threat:threatLevel,/s);
  assert.match(source,/const premiumTacticalType=/);
});

test('live spawn table reports active tactical counts and Elite count so overlap caps are enforced',()=>{
  assert.match(source,/const premiumTacticalCounts=\{support:0,assassin:0,summoner:0,shielder:0\};/);
  assert.match(source,/enemy\.premiumDef&&premiumTacticalCounts\[enemy\.type\]!==undefined/);
  assert.match(source,/const premiumEliteCount=enemies\.reduce/);
  assert.match(source,/activeCounts:premiumTacticalCounts/);
  assert.match(source,/eliteCount:premiumEliteCount/);
});

test('frame state exposes tactical counts Elite pressure and boss overlap to the Premium HUD',()=>{
  assert.match(source,/activeTacticalCounts:premiumTacticalCounts/);
  assert.match(source,/eliteCount:premiumEliteCount/);
  assert.match(source,/bossActive:!!boss/);
});

test('live enemy spawn can materialize tactical archetype definitions without duplicating Premium data',()=>{
  assert.match(source,/getTacticalEnemyDefinition\?\.\(type\)/);
  assert.match(source,/premiumDef\.radius/);
});

test('live combat applies tactical aura speed touch and shield multipliers',()=>{
  assert.match(source,/resolveTacticalAuras\?\.\(e,enemies\)/);
  assert.match(source,/premiumAuraState\.damageTakenMul/);
  assert.match(source,/premiumAuraState\.speedMul/);
  assert.match(source,/premiumAuraState\.touchMul/);
});

test('support speed aura also affects ranged and boss distance-keeping movement',()=>{
  assert.match(source,/const bossSpeed=\(e\.type==='boss'&&e\.phase===2\?premiumSpeed\*1\.22:premiumSpeed\)\*pursuitBoost;/);
});

test('live combat contains readable assassin dash and summoner reinforcement behaviors',()=>{
  assert.match(source,/e\.type==='assassin'/);
  assert.match(source,/premiumDashTime/);
  assert.match(source,/e\.type==='summoner'/);
  assert.match(source,/premiumSummonCd/);
  assert.match(source,/spawnEnemy\(d\.summonType\|\|'normal'/);
});

test('tactical enemies have dedicated visual silhouettes aura cues and role markers',()=>{
  for(const marker of ['PREMIUM SUPPORT','PREMIUM ASSASSIN','PREMIUM SUMMONER','PREMIUM SHIELDER','PREMIUM ROLE MARKER']){
    assert.ok(source.includes(marker),marker);
  }
  assert.match(source,/getTacticalEnemyMarker\?\.\(e\.type\)/);
});

test('combat V2 integrator recognizes the reviewed tactical block on rerun',()=>{
  assert.match(integrator,/tactical-update-behavior[\s\S]*Premium tactical behavior already moved this enemy\./);
  assert.match(integrator,/alreadyAppliedMarker/);
});
