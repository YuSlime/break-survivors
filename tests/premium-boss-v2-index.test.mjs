import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('live boss update is gated through Premium boss V2 runtime and preserves legacy fallback',()=>{
  assert.match(source,/function updatePremiumBossV2\(/);
  assert.match(source,/resolveBossState\?\.\(e\)/);
  assert.match(source,/nextBossAttack\?\.\(/);
  assert.match(source,/else if\(premiumBossHandled\)/);
  assert.match(source,/else if\(e\.type==='shooter'\|\|e\.type==='boss'\)/);
});

test('live boss phase transitions expose all approved VOID TYRANT phase labels',()=>{
  for(const label of ['VOID DOMAIN','RIFT SOVEREIGN','VOID COLLAPSE']){
    assert.ok(source.includes(label),label);
  }
  assert.match(source,/premiumBossPhase/);
  assert.match(source,/premiumBossTelegraph/);
});

test('live boss V2 implements distinct move handlers rather than stat-only scaling',()=>{
  for(const marker of [
    'PREMIUM BOSS MOVE — VOID BOLT',
    'PREMIUM BOSS MOVE — GRAVITY PULSE',
    'PREMIUM BOSS MOVE — VOID ZONE',
    'PREMIUM BOSS MOVE — SUMMON RIFT',
    'PREMIUM BOSS MOVE — PROJECTILE RING',
    'PREMIUM BOSS MOVE — VOID COLLAPSE'
  ])assert.ok(source.includes(marker),marker);
});

test('boss V2 telegraphs are frame-owned and do not schedule delayed boss attacks',()=>{
  const start=source.indexOf('function updatePremiumBossV2(');
  const end=source.indexOf('function updateChaosDirector',start);
  assert.ok(start>=0&&end>start);
  const block=source.slice(start,end);
  assert.ok(!block.includes('setTimeout('));
  assert.match(block,/premiumBossTelegraph=Math\.max\(0/);
});

test('boss HUD and draw layer read Premium phase presentation when boss V2 is active',()=>{
  assert.match(source,/premiumBossColor/);
  assert.match(source,/premiumBossLabel/);
  assert.match(source,/premiumBossTargetX/);
});
