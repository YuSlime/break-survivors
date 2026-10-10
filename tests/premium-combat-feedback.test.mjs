import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCombatFeedback} from '../src/presentation/combat-feedback.js';
import {createCameraDirector} from '../src/directors/camera.js';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

test('critical hits resolve to a compact high-priority feedback profile',()=>{
  const view=resolveCombatFeedback({event:'hit',critical:true,enemyType:'normal'});
  assert.equal(view.event,'critical');
  assert.equal(view.cameraSignal,'critical');
  assert.equal(view.audioCue,'critical');
  assert.equal(view.priority,3);
  assert.equal(view.color,'#fff08b');
  assert.equal(view.particleCount,4);
  assert.equal(view.ringScale,1.35);
  assert.equal(view.label,'CRITICAL');
});

test('ordinary non-critical hits and ordinary kills do not add premium feedback noise',()=>{
  assert.equal(resolveCombatFeedback({event:'hit',critical:false,enemyType:'normal'}),null);
  assert.equal(resolveCombatFeedback({event:'kill',enemyType:'normal'}),null);
});

test('each tactical enemy kill keeps its readable role identity',()=>{
  const expected={
    support:['SUP','#5ff0b0'],
    assassin:['ASN','#ff5fa2'],
    summoner:['SUM','#b078ff'],
    shielder:['SHD','#62b8ff']
  };
  for(const [enemyType,[code,color]] of Object.entries(expected)){
    const view=resolveCombatFeedback({event:'kill',enemyType,coinGain:21});
    assert.equal(view.event,'tacticalKill');
    assert.equal(view.cameraSignal,'tacticalKill');
    assert.equal(view.audioCue,`tactical-${enemyType}`);
    assert.equal(view.priority,3);
    assert.equal(view.color,color);
    assert.equal(view.label,`${code} DOWN`);
    assert.equal(view.rewardLabel,'TACTICAL LOOT');
    assert.equal(view.particleCount,10);
    assert.equal(view.ringScale,1.9);
  }
});

test('elite kills sit above tactical kills but below boss-scale spectacle',()=>{
  const view=resolveCombatFeedback({event:'kill',enemyType:'elite',coinGain:80});
  assert.equal(view.event,'eliteKill');
  assert.equal(view.cameraSignal,'eliteKill');
  assert.equal(view.audioCue,'elite-kill');
  assert.equal(view.priority,4);
  assert.equal(view.color,'#ffb75f');
  assert.equal(view.label,'ELITE BREAK');
  assert.equal(view.rewardLabel,'ELITE LOOT BURST');
  assert.equal(view.particleCount,16);
  assert.equal(view.ringScale,2.5);
});

test('tactical kill camera response is stronger than a crit and softer than an elite kill',()=>{
  const tactical=createCameraDirector();
  assert.equal(tactical.impulse('tacticalKill',{x:1,y:0}),true);
  const tacticalState=tactical.update(0);

  const critical=createCameraDirector();
  critical.impulse('critical',{x:1,y:0});
  const criticalState=critical.update(0);

  const elite=createCameraDirector();
  elite.impulse('eliteKill',{x:1,y:0});
  const eliteState=elite.update(0);

  assert.ok(tacticalState.shake>criticalState.shake);
  assert.ok(tacticalState.shake<eliteState.shake);
  assert.ok(tacticalState.hitStopMs>criticalState.hitStopMs);
  assert.ok(tacticalState.hitStopMs<eliteState.hitStopMs);
});

test('Premium runtime exposes combat feedback resolution and tactical camera signaling',()=>{
  const runtime=createPremiumRuntime({flags:{cameraDirector:true,combatV2:true}});
  const view=runtime.resolveCombatFeedback({event:'kill',enemyType:'support',coinGain:14});
  assert.equal(view?.label,'SUP DOWN');
  assert.equal(runtime.signal('tacticalKill',{direction:{x:1,y:0}}),true);
});
