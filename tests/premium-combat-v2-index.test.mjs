import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('live spawn table asks Premium runtime for tactical enemies only through combat V2 bridge',()=>{
  assert.match(source,/pickTacticalEnemy\?\.\(\{\s*gameTime,\s*threat:threatLevel,/s);
  assert.match(source,/const premiumTacticalType=/);
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

test('live combat contains readable assassin dash and summoner reinforcement behaviors',()=>{
  assert.match(source,/e\.type==='assassin'/);
  assert.match(source,/premiumDashTime/);
  assert.match(source,/e\.type==='summoner'/);
  assert.match(source,/premiumSummonCd/);
  assert.match(source,/spawnEnemy\(d\.summonType\|\|'normal'/);
});

test('tactical enemies have dedicated visual silhouettes and aura cues',()=>{
  for(const marker of ['PREMIUM SUPPORT','PREMIUM ASSASSIN','PREMIUM SUMMONER','PREMIUM SHIELDER']){
    assert.ok(source.includes(marker),marker);
  }
});
