import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const action=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const integratorUrl=new URL('../tools/apply-premium-stage-gimmicks-integration.mjs',import.meta.url);

test('stage gimmick integrator exists and both workflows execute it',()=>{
  assert.ok(fs.existsSync(integratorUrl),'stage gimmick integrator missing');
  assert.match(ci,/node tools\/apply-premium-stage-gimmicks-integration\.mjs/);
  assert.match(action,/tools\/apply-premium-stage-gimmicks-integration\.mjs/);
  assert.match(action,/node tools\/apply-premium-stage-gimmicks-integration\.mjs/);
});

test('live stage gimmicks stay behind the stages V2 runtime bridge',()=>{
  assert.match(source,/PREMIUM STAGE GIMMICKS LIVE V1/);
  assert.match(source,/resolveStageGimmickFrame\?\.\(\{stageId:premiumStageId,time:premiumStageGimmickTime,width:WORLD_W,height:WORLD_H\}\)/);
  assert.match(source,/premiumStageRewardMul=premiumStageGimmickFrame\?\.rewardMul\?\?1/);
  assert.match(source,/premiumStageEnemySpeedMul=premiumStageGimmickFrame\?\.enemySpeedMul\?\?1/);
  assert.match(source,/premiumStageEnemyDamageMul=premiumStageGimmickFrame\?\.enemyDamageMul\?\?1/);
});

test('NEON pulse stuns live enemies without damaging the player',()=>{
  assert.match(source,/premiumStageGimmickFrame\.kind==='power-pulse'/);
  assert.match(source,/e\.premiumStageStun=Math\.max\(e\.premiumStageStun\|\|0,premiumStageGimmickFrame\.enemyStunSeconds\)/);
  assert.match(source,/if\(e\.premiumStageStun>0\)\{/);
});

test('RESEARCH ZERO overdrive affects live enemy speed touch damage bullets and rewards',()=>{
  assert.match(source,/const premiumSpeed=e\.speed\*premiumAuraState\.speedMul\*premiumStageEnemySpeedMul/);
  assert.match(source,/e\.touch\*premiumAuraState\.touchMul\*premiumStageEnemyDamageMul/);
  assert.match(source,/b\.dmg\*premiumStageEnemyDamageMul/);
  assert.match(source,/eventCoinMultiplier\(\)\*premiumStageRewardMul/);
});

test('ASH WASTELAND strike resolves one telegraphed impact against enemies and player',()=>{
  assert.match(source,/premiumStageGimmickFrame\.kind==='volcanic-strike'/);
  assert.match(source,/e\.maxHp\*premiumStageGimmickFrame\.enemyDamageMaxHpRatio/);
  assert.match(source,/lastDamageSource='ASH WASTELAND'/);
});

test('VOID SECTOR damages the player only outside the moving safe zone',()=>{
  assert.match(source,/premiumStageGimmickFrame\.kind==='moving-safe-zone'/);
  assert.match(source,/premiumStageGimmickFrame\.unsafeDamagePerSecond\*dt/);
  assert.match(source,/lastDamageSource='VOID SECTOR'/);
});

test('live draw renders readable gimmick telegraphs using the resolved frame',()=>{
  assert.match(source,/function drawPremiumStageGimmick\(frame\)/);
  assert.match(source,/drawPremiumStageGimmick\(premiumStageGimmickFrame\)/);
  assert.match(source,/frame\.kind==='moving-safe-zone'/);
  assert.match(source,/frame\.kind==='volcanic-strike'/);
});

test('stage gimmick integrator is guarded for idempotent reruns',()=>{
  const integrator=fs.readFileSync(integratorUrl,'utf8');
  assert.match(integrator,/PREMIUM STAGE GIMMICKS LIVE V1/);
  assert.match(integrator,/already integrated/);
});
