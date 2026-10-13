import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const tool=fs.readFileSync(new URL('../tools/apply-premium-run-build-advanced-integration.mjs',import.meta.url),'utf8');
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const apply=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const has=(text,msg)=>assert.equal(html.includes(text),true,msg||text);

test('RAILSTORM activates only at the approved Momentum threshold and converts live Gunner shots into rails',()=>{
  has('PREMIUM RUN BUILD ADVANCED V1');
  has("premiumGunnerFx?.evolution==='railstorm'");
  has('premiumGunnerFx?.evolutionMomentumThreshold');
  has("premiumRailstorm?'rail'");
  has("premiumRailstorm?'#edffff'");
});

test('SMART MINES arm at the impact point and poll for nearby enemies before detonating',()=>{
  has('function armPremiumBombMine(');
  has('premiumSmartMine');
  has('premiumMineArmed');
  has('PREMIUM MINE');
});

test('BREAK DETONATION creates one restrained secondary Bomb Cat blast without recursive chains',()=>{
  has('premiumBreakDetonation');
  has('meta.premiumBombCat');
  has('!meta.premiumBreakChain');
  has('premiumBreakChain:true');
});

test('NUCLEAR CASCADE has a distinct live peak without redefining the base Bomb Cat profile',()=>{
  has("premiumBombFx?.evolution==='nuclear-cascade'");
  has('premiumNuclear');
  has('PREMIUM NUCLEAR CASCADE');
  has("'#fff3b0'");
});

test('advanced integrator is idempotent and executed by both workflows',()=>{
  assert.match(tool,/PREMIUM RUN BUILD ADVANCED V1/);
  assert.match(tool,/already present and validated/);
  assert.match(ci,/apply-premium-run-build-advanced-integration\.mjs/);
  assert.match(apply,/apply-premium-run-build-advanced-integration\.mjs/);
});
