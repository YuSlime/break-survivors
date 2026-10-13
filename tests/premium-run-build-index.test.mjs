import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function includes(text,msg){assert.equal(html.includes(text),true,msg||text)}

test('run build browser bootstrap is loaded after the Premium runtime',()=>{
  const runtime=html.indexOf('./src/game/premium-runtime.js');
  const controller=html.indexOf('./src/game/run-build-browser.js');
  assert.ok(runtime>=0);
  assert.ok(controller>runtime);
});

test('live loop pauses cleanly while an upgrade draft is open but keeps drawing',()=>{
  includes('PREMIUM RUN BUILD LIVE V1');
  includes('premiumRunDraftOpen');
  includes('window.BreakRunBuild?.open');
  includes('if(premiumRunDraftOpen){simAccumulator=0;draw();requestAnimationFrame(loop);return}');
});

test('enemy kills feed run XP and drafts use BREAK context',()=>{
  includes('window.BreakRunBuild?.gainXp?.(e)');
  includes('window.BreakRunBuild?.presentDraft?.(currentCharacter.id');
  includes('breakActive:breakCombo>=10||feverActive()');
});

test('boss kill reserves the next draft for five-choice boss mode',()=>{
  includes('premiumRunDraftBossPending=true');
  includes('bossReward:premiumRunDraftBossPending');
});

test('reset clears run-only build state',()=>{
  includes('window.BreakRunBuild?.reset?.()');
});

test('STAT run effects modify live player damage, attack rate and area',()=>{
  includes('window.BreakRunBuild?.getEffects?.(currentCharacter.id)');
  includes('damage*=premiumRunEffects.damageMul||1');
  includes('attackRate*=premiumRunEffects.attackRateMul||1');
  includes('area*=premiumRunEffects.radiusMul||1');
});
