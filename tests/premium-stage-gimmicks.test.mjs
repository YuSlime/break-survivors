import test from 'node:test';
import assert from 'node:assert/strict';
import {getStageGimmick,resolveStageGimmickFrame} from '../src/systems/stage-gimmicks.js';

const ids=['neon-ruins','research-zero','ash-wasteland','void-sector'];

test('every Premium stage owns a distinct gameplay gimmick',()=>{
  const kinds=ids.map(id=>getStageGimmick(id).kind);
  assert.deepEqual(kinds,['power-pulse','experiment-overdrive','volcanic-strike','moving-safe-zone']);
  assert.equal(new Set(kinds).size,4);
});

test('NEON RUINS power pulse periodically exposes a non-damaging enemy stun window',()=>{
  const def=getStageGimmick('neon-ruins');
  assert.equal(def.enemyStunSeconds>0,true);
  assert.equal(def.playerDamage,0);
  const frame=resolveStageGimmickFrame({stageId:'neon-ruins',time:def.cycleSeconds-def.telegraphSeconds/2,width:1000,height:700});
  assert.equal(frame.phase,'telegraph');
  assert.equal(frame.affectsEnemies,true);
});

test('RESEARCH ZERO overdrive trades stronger enemies for a meaningful reward bonus',()=>{
  const def=getStageGimmick('research-zero');
  assert.ok(def.enemySpeedMul>1);
  assert.ok(def.enemyDamageMul>1);
  assert.ok(def.rewardMul>1);
  const frame=resolveStageGimmickFrame({stageId:'research-zero',time:def.cycleSeconds+1,width:1000,height:700});
  assert.equal(frame.phase,'active');
  assert.equal(frame.rewardMul,def.rewardMul);
});

test('ASH WASTELAND volcanic strike can damage enemies and has a telegraph before impact',()=>{
  const def=getStageGimmick('ash-wasteland');
  assert.equal(def.affectsEnemies,true);
  assert.ok(def.enemyDamageMaxHpRatio>0);
  const frame=resolveStageGimmickFrame({stageId:'ash-wasteland',time:def.cycleSeconds-def.telegraphSeconds/2,width:1000,height:700});
  assert.equal(frame.phase,'telegraph');
  assert.ok(frame.target.x>0&&frame.target.x<1000);
  assert.ok(frame.target.y>0&&frame.target.y<700);
});

test('VOID SECTOR safe zone moves deterministically and remains inside the arena',()=>{
  const def=getStageGimmick('void-sector');
  const a=resolveStageGimmickFrame({stageId:'void-sector',time:0,width:1000,height:700});
  const b=resolveStageGimmickFrame({stageId:'void-sector',time:def.orbitSeconds*.25,width:1000,height:700});
  assert.equal(a.phase,'active');
  assert.equal(b.phase,'active');
  assert.notDeepEqual(a.target,b.target);
  for(const frame of [a,b]){
    assert.ok(frame.target.x>=def.radius&&frame.target.x<=1000-def.radius);
    assert.ok(frame.target.y>=def.radius&&frame.target.y<=700-def.radius);
  }
});

test('stage gimmick definitions and frames stay presentation/gameplay data only',()=>{
  for(const id of ids){
    const def=getStageGimmick(id);
    assert.equal(Object.isFrozen(def),true,id);
  }
  const frame=resolveStageGimmickFrame({stageId:'neon-ruins',time:0,width:1000,height:700});
  assert.equal(Object.isFrozen(frame),true);
});
