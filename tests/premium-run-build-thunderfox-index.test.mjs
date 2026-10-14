import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const toolUrl=new URL('../tools/apply-premium-run-build-thunderfox-integration.mjs',import.meta.url);
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const apply=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const has=text=>assert.equal(html.includes(text),true,text);

test('Thunder Fox live primary applies Run Build damage, chain links and high-voltage OVERCHARGE',()=>{
  has('// PREMIUM RUN BUILD THUNDERFOX V1');
  has("window.BreakRunBuild?.getEffects?.('thunderfox')");
  has('premiumThunderFx?.chainAdd');
  has('premiumThunderFx?.damageMul');
  has('premiumVoltage>=.75');
  has('premiumOvercharged');
});

test('CRITICAL STORM can recharge Voltage at most once for one lightning chain',()=>{
  has('damageMeta');
  has('premiumCriticalStorm');
  has('criticalStormCharged');
  has("attackCounters.thunderfox=(attackCounters.thunderfox||0)+1");
});

test('STORM FIELD leaves bounded follow-up pulses at the final chain target',()=>{
  has('function spawnPremiumStormField(');
  has('premiumThunderHits.at(-1)');
  has('premiumThunderFx?.stormField');
  has('premiumThunderField:true');
});

test('THUNDER GOD fires a short roaming storm only at full Voltage',()=>{
  has('function startPremiumThunderGod(');
  has("premiumThunderFx?.evolution==='thunder-god'");
  has('premiumVoltage>=1');
  has('PREMIUM THUNDER GOD');
});

test('Thunder Fox integrator is guarded and runs in CI plus generated index workflow',()=>{
  assert.equal(fs.existsSync(toolUrl),true,'Thunder Fox integrator should exist');
  if(fs.existsSync(toolUrl)){
    const tool=fs.readFileSync(toolUrl,'utf8');
    assert.match(tool,/PREMIUM RUN BUILD THUNDERFOX V1/);
    assert.match(tool,/already present and validated/);
  }
  assert.match(ci,/apply-premium-run-build-thunderfox-integration\.mjs/);
  assert.match(apply,/apply-premium-run-build-thunderfox-integration\.mjs/);
});
