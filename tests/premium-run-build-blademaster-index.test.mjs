import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const toolUrl=new URL('../tools/apply-premium-run-build-blademaster-integration.mjs',import.meta.url);
const ci=fs.readFileSync(new URL('../.github/workflows/premium-foundation-ci.yml',import.meta.url),'utf8');
const apply=fs.readFileSync(new URL('../.github/workflows/apply-premium-runtime-integration.yml',import.meta.url),'utf8');
const has=text=>assert.equal(html.includes(text),true,text);

test('Blademaster live slashes apply Run Build damage and execution metadata',()=>{
  has('// PREMIUM RUN BUILD BLADEMASTER V1');
  has("window.BreakRunBuild?.getEffects?.('blademaster')");
  has('premiumBladeFx?.damageMul');
  has('premiumBladeFx?.executeThreshold');
  has('premiumBladeExecuted');
  has('e.type!==\'boss\'');
});

test('FLOW EXECUTION advances combo Flow and restores dash tempo on execution kills',()=>{
  has('meta.premiumBladeExecuted');
  has('meta.premiumBladeFx?.flowExecution');
  has("attackCounters.blademaster=(attackCounters.blademaster||0)+1");
  has('dashCooldown=Math.max(0,dashCooldown-.75)');
});

test('CYCLONE STEP emits a restrained circular slash after a Blademaster dash',()=>{
  has('premiumBladeFx?.cyclone');
  has('PREMIUM CYCLONE STEP');
  has("doSlash(ps.damage*.58");
});

test('PERFECT PARRY uses a brief dash timing window and counters contact instead of taking damage',()=>{
  has('premiumBladeParryWindow');
  has('function triggerPremiumBladeParry(');
  has('premiumBladeFx?.parry');
  has('PREMIUM PERFECT PARRY');
});

test('VOID BLADE releases a long line slash only when the combo reaches full Flow',()=>{
  has("premiumBladeFx?.evolution==='void-blade'");
  has('stage===comboLen');
  has('PREMIUM VOID BLADE');
  has("color:'#a978ff'");
});

test('Blademaster integrator is guarded and runs in CI plus generated index workflow',()=>{
  assert.equal(fs.existsSync(toolUrl),true,'Blademaster integrator should exist');
  if(fs.existsSync(toolUrl)){
    const tool=fs.readFileSync(toolUrl,'utf8');
    assert.match(tool,/PREMIUM RUN BUILD BLADEMASTER V1/);
    assert.match(tool,/already present and validated/);
  }
  assert.match(ci,/apply-premium-run-build-blademaster-integration\.mjs/);
  assert.match(apply,/apply-premium-run-build-blademaster-integration\.mjs/);
});
