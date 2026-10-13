import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRunBuildState,
  gainRunXp,
  buildRunDraft,
  applyRunChoice,
  deriveRunEffects,
  xpForEnemy
} from '../src/systems/run-build.js';

test('run build starts clean and earns draft levels from combat XP',()=>{
  let state=createRunBuildState();
  assert.equal(state.level,0);
  assert.equal(state.pending,0);
  assert.equal(state.nextXp,18);
  state=gainRunXp(state,18);
  assert.equal(state.level,1);
  assert.equal(state.pending,1);
  assert.equal(state.xp,0);
  assert.ok(state.nextXp>18);
});

test('large XP grants preserve overflow while granting multiple pending drafts',()=>{
  const state=gainRunXp(createRunBuildState(),100);
  assert.ok(state.level>=3);
  assert.equal(state.pending,state.level);
  assert.ok(state.xp>=0&&state.xp<state.nextXp);
});

test('enemy roles award more run XP for harder targets',()=>{
  assert.equal(xpForEnemy({type:'normal'}),1);
  assert.ok(xpForEnemy({type:'tank'})>xpForEnemy({type:'normal'}));
  assert.ok(xpForEnemy({type:'elite'})>xpForEnemy({type:'tank'}));
  assert.ok(xpForEnemy({type:'boss'})>xpForEnemy({type:'elite'}));
});

test('draft uses 3 choices normally, 4 during BREAK and 5 after a boss',()=>{
  const state=createRunBuildState();
  const normal=buildRunDraft('gunner',state,{rng:()=>0.31});
  const duringBreak=buildRunDraft('gunner',state,{breakActive:true,rng:()=>0.31});
  const boss=buildRunDraft('gunner',state,{bossReward:true,rng:()=>0.31});
  assert.equal(normal.length,3);
  assert.equal(duringBreak.length,4);
  assert.equal(boss.length,5);
  assert.equal(new Set(boss.map(x=>x.id)).size,5);
});

test('applying a choice consumes one pending draft and preserves exclusive branches',()=>{
  let state={...createRunBuildState(),pending:2};
  const pierce={id:'gunner-piercing',tier:'modify',maxRank:1,exclusiveGroup:'gunner-shot-path'};
  state=applyRunChoice(state,pierce);
  assert.equal(state.pending,1);
  assert.equal(state.ranks['gunner-piercing'],1);
  assert.equal(state.exclusive['gunner-shot-path'],'gunner-piercing');
  const draft=buildRunDraft('gunner',state,{bossReward:true,rng:()=>0});
  assert.equal(draft.some(x=>x.id==='gunner-split'),false);
});

test('Gunner run effects map choices into live projectile behavior',()=>{
  const state={...createRunBuildState(),ranks:{
    'gunner-calibration':2,
    'gunner-tempo':2,
    'gunner-ricochet':1,
    'gunner-thunder-crit':1,
    'gunner-railstorm':1
  }};
  const fx=deriveRunEffects('gunner',state);
  assert.ok(fx.damageMul>1.2);
  assert.ok(fx.attackRateMul>1.1);
  assert.equal(fx.ricochetChance,1);
  assert.ok(fx.ricochetCount>=1);
  assert.equal(fx.thunderCrit,true);
  assert.equal(fx.evolution,'railstorm');
  assert.ok(fx.evolutionMomentumThreshold<=.8);
});

test('Bomb Cat run effects map choices into payload, cluster and chain behavior',()=>{
  const state={...createRunBuildState(),ranks:{
    'bombcat-payload':2,
    'bombcat-fuse':2,
    'bombcat-cluster':1,
    'bombcat-chain-fuse':1,
    'bombcat-break-chain':1,
    'bombcat-nuclear':1
  }};
  const fx=deriveRunEffects('bombcat',state);
  assert.ok(fx.damageMul>1.2);
  assert.ok(fx.attackRateMul>1.1);
  assert.ok(fx.clusterAdd>=3);
  assert.ok(fx.chainChanceAdd>=.3);
  assert.equal(fx.breakDetonation,true);
  assert.equal(fx.evolution,'nuclear-cascade');
  assert.ok(fx.radiusMul>1);
});

test('Thunder Fox run effects support chain control and THUNDER GOD evolution',()=>{
  const state={...createRunBuildState(),ranks:{
    'thunderfox-charge':2,
    'thunderfox-chain':1,
    'thunderfox-stormfield':1,
    'thunderfox-critstorm':1,
    'thunderfox-god':1
  }};
  const fx=deriveRunEffects('thunderfox',state);
  assert.ok(fx.damageMul>1.2);
  assert.ok(fx.chainAdd>=2);
  assert.equal(fx.stormField,true);
  assert.equal(fx.criticalStorm,true);
  assert.equal(fx.evolution,'thunder-god');
});

test('Blademaster run effects support execution, flow and VOID BLADE evolution',()=>{
  const state={...createRunBuildState(),ranks:{
    'blade-edge':2,
    'blade-execution':1,
    'blade-flowkill':1,
    'blade-void':1
  }};
  const fx=deriveRunEffects('blademaster',state);
  assert.ok(fx.damageMul>1.2);
  assert.ok(fx.executeThreshold>=.15);
  assert.equal(fx.flowExecution,true);
  assert.equal(fx.evolution,'void-blade');
});

test('Nova run effects support gravity and SUPERNOVA evolution',()=>{
  const state={...createRunBuildState(),ranks:{
    'nova-core':2,
    'nova-gravity':1,
    'nova-resonant':1,
    'nova-supernova':1
  }};
  const fx=deriveRunEffects('nova',state);
  assert.ok(fx.damageMul>1.2);
  assert.equal(fx.gravityPull,true);
  assert.equal(fx.resonantCollapse,true);
  assert.equal(fx.evolution,'supernova');
  assert.ok(fx.radiusMul>1);
});

test('Missile Queen run effects support multi-lock and TOTAL ANNIHILATION evolution',()=>{
  const state={...createRunBuildState(),ranks:{
    'mq-warhead':2,
    'mq-multilock':1,
    'mq-overpaint':1,
    'mq-annihilation':1
  }};
  const fx=deriveRunEffects('missilequeen',state);
  assert.ok(fx.damageMul>1.2);
  assert.ok(fx.lockAdd>=2);
  assert.equal(fx.targetOverpaint,true);
  assert.equal(fx.evolution,'total-annihilation');
});
