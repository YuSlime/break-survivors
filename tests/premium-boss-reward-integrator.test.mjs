import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const integrator=fs.readFileSync(new URL('../tools/apply-premium-boss-reward-integration.mjs',import.meta.url),'utf8');

test('boss reward integrator treats the later boss-death sequence as an already-integrated reward path',()=>{
  assert.match(integrator,/PREMIUM BOSS DEATH SEQUENCE V1/);
  assert.match(integrator,/boss-reward-open-on-kill/);
  assert.match(integrator,/alreadyAppliedMarker/);
});
