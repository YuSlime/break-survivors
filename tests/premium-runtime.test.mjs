import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime,resolveRuntimeFeatureOverrides} from '../src/game/premium-runtime.js';

test('runtime defaults to safe disabled flags',()=>{
  const runtime=createPremiumRuntime();
  assert.equal(runtime.flags.intensityDirector,false);
  assert.equal(runtime.flags.cameraDirector,false);
  assert.equal(runtime.flags.vfxDirector,false);
  assert.equal(runtime.flags.encounterDirector,false);
  assert.equal(runtime.flags.audioDirector,false);
});

test('premium query opt-in enables only foundation systems',()=>{
  const flags=resolveRuntimeFeatureOverrides({search:'?premium=1',stored:null});
  assert.equal(flags.intensityDirector,true);
  assert.equal(flags.cameraDirector,true);
  assert.equal(flags.vfxDirector,true);
  assert.equal(flags.encounterDirector,true);
  assert.equal(flags.audioDirector,true);
  assert.equal(flags.combatV2,false);
  assert.equal(flags.bossV2,false);
});

test('combat V2 requires a second explicit query opt-in during development',()=>{
  const flags=resolveRuntimeFeatureOverrides({search:'?premium=1&premiumCombat=1',stored:null});
  assert.equal(flags.intensityDirector,true);
  assert.equal(flags.combatV2,true);
  assert.equal(flags.bossV2,false);
});

test('boss V2 requires its own explicit query opt-in during development',()=>{
  const flags=resolveRuntimeFeatureOverrides({search:'?premium=1&premiumBoss=1',stored:null});
  assert.equal(flags.intensityDirector,true);
  assert.equal(flags.bossV2,true);
  assert.equal(flags.combatV2,false);
});

test('stored overrides can selectively change premium systems',()=>{
  const flags=resolveRuntimeFeatureOverrides({
    search:'',
    stored:JSON.stringify({cameraDirector:true,premiumHud:true,bossV2:true,unknown:true})
  });
  assert.equal(flags.cameraDirector,true);
  assert.equal(flags.premiumHud,true);
  assert.equal(flags.bossV2,true);
  assert.equal(flags.intensityDirector,false);
  assert.equal('unknown' in flags,false);
});

test('frame update drives intensity camera audio encounter recovery and vfx frame reset',()=>{
  const runtime=createPremiumRuntime({
    flags:{intensityDirector:true,cameraDirector:true,vfxDirector:true,encounterDirector:true,audioDirector:true}
  });
  runtime.signal('break');
  const first=runtime.updateFrame(.016,{breakActive:true,highDensity:true});
  assert.ok(first.intensity>20);
  assert.ok(first.camera.shake>0);
  assert.equal(first.audio.mode,'break');
  assert.ok(first.audio.attackPresence>0);
  assert.equal(runtime.allowVfx('particles',5),true);
  runtime.updateFrame(.016,{breakActive:true});
  assert.equal(runtime.vfx.counts.particles,0);
});

test('signals map major combat moments into camera impulses',()=>{
  const runtime=createPremiumRuntime({flags:{cameraDirector:true}});
  for(const type of ['critical','eliteKill','break','fever','limitBreak','bossKill']){
    assert.equal(runtime.signal(type,{direction:{x:1,y:0}}),true,type);
    const frame=runtime.updateFrame(.001,{});
    assert.ok(frame.camera.shake>0,type);
  }
});

test('vfx budget is bypassed when vfx director is disabled',()=>{
  const runtime=createPremiumRuntime({flags:{vfxDirector:false}});
  for(let i=0;i<1000;i++)assert.equal(runtime.allowVfx('particles',1),true);
});

test('tactical enemy picker is completely disabled unless combat V2 is enabled',()=>{
  const safe=createPremiumRuntime({flags:{combatV2:false}});
  assert.equal(safe.pickTacticalEnemy({gameTime:200,threat:5,roll:.01}),null);

  const combat=createPremiumRuntime({flags:{combatV2:true}});
  assert.equal(combat.pickTacticalEnemy({gameTime:95,threat:2,roll:.05}),'support');
});

test('tactical enemy definitions stay unavailable unless combat V2 is explicitly enabled',()=>{
  const safe=createPremiumRuntime({flags:{combatV2:false}});
  assert.equal(safe.getTacticalEnemyDefinition('support'),null);

  const combat=createPremiumRuntime({flags:{combatV2:true}});
  const support=combat.getTacticalEnemyDefinition('support');
  assert.equal(support.id,'support');
  assert.equal(support.mechanic,'buff-aura');
  assert.equal(combat.getTacticalEnemyDefinition('missing'),null);
});

test('tactical aura bridge is neutral unless combat V2 is explicitly enabled',()=>{
  const target={type:'normal',x:20,y:0,dead:false};
  const support={type:'support',x:0,y:0,dead:false};
  const shielder={type:'shielder',x:30,y:0,dead:false};

  const safe=createPremiumRuntime({flags:{combatV2:false}});
  assert.deepEqual(safe.resolveTacticalAuras(target,[target,support,shielder]),{
    speedMul:1,touchMul:1,damageTakenMul:1
  });

  const combat=createPremiumRuntime({flags:{combatV2:true}});
  const active=combat.resolveTacticalAuras(target,[target,support,shielder]);
  assert.ok(active.speedMul>1);
  assert.ok(active.touchMul>1);
  assert.ok(active.damageTakenMul<1);
});

test('boss V2 phase and move bridges are completely disabled unless explicitly enabled',()=>{
  const safe=createPremiumRuntime({flags:{bossV2:false}});
  assert.equal(safe.resolveBossState({type:'boss',hp:39,maxHp:100}),null);
  assert.equal(safe.nextBossAttack({type:'boss',hp:10,maxHp:100,roll:.99}),null);

  const boss=createPremiumRuntime({flags:{bossV2:true}});
  const state=boss.resolveBossState({type:'boss',hp:39,maxHp:100});
  assert.equal(state.phase,'phase3');
  assert.equal(state.definition.id,'phase3');
  const attack=boss.nextBossAttack({type:'boss',hp:10,maxHp:100,roll:.99});
  assert.equal(attack.phase,'final');
  assert.equal(attack.move,'void-collapse');
});

test('runtime reset returns directors to calm state',()=>{
  const runtime=createPremiumRuntime({flags:{intensityDirector:true,cameraDirector:true,encounterDirector:true,audioDirector:true}});
  runtime.signal('limitBreak');
  runtime.updateFrame(.2,{limitBreakActive:true});
  runtime.reset();
  const frame=runtime.updateFrame(0,{});
  assert.equal(frame.intensity,20);
  assert.equal(frame.camera.shake,0);
  assert.equal(frame.audio.mode,'calm');
  assert.equal(runtime.encounter.activeMajor,null);
});
