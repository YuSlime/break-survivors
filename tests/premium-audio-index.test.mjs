import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('live audio graph has a lazily created Premium atmosphere layer',()=>{
  assert.match(source,/let premiumAtmosBus = null;/);
  assert.match(source,/function ensurePremiumAtmosphere\(\)/);
  assert.match(source,/premiumSubOsc = audioCtx\.createOscillator\(\)/);
  assert.match(source,/premiumAirOsc = audioCtx\.createOscillator\(\)/);
  assert.match(source,/premiumAtmosBus\.connect\(audioMaster\)/);
});

test('Premium audio mix preserves user attack volume while shaping presence and cutoff',()=>{
  assert.match(source,/function applyPremiumAudioMix\(mix\)/);
  assert.match(source,/attackSfxVolume\*mix\.attackPresence/);
  assert.match(source,/attackFilter\.frequency\.setTargetAtTime\(mix\.cutoffHz/);
});

test('Premium atmosphere follows director frequencies and gain without forcing audio unlock',()=>{
  assert.match(source,/if\(!audioUnlocked\|\|!audioCtx\|\|!audioMaster\)return false;/);
  assert.match(source,/premiumSubOsc\.frequency\.setTargetAtTime\(mix\.subHz/);
  assert.match(source,/premiumAirOsc\.frequency\.setTargetAtTime\(mix\.airHz/);
  assert.match(source,/premiumAtmosBus\.gain\.setTargetAtTime\(targetAtmosphere/);
});

test('main frame forwards the reactive Premium audio mix into the legacy WebAudio graph',()=>{
  assert.match(source,/applyPremiumAudioMix\(premiumFrame\?\.audio\);/);
});
