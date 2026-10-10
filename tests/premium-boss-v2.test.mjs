import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VOID_TYRANT_PHASES,
  resolveVoidTyrantPhase,
  getVoidTyrantPhaseDefinition,
  buildVoidTyrantAttackPlan
} from '../src/bosses/void-tyrant.js';

test('VOID TYRANT uses four readable phases at the approved HP thresholds',()=>{
  assert.equal(resolveVoidTyrantPhase(1),'phase1');
  assert.equal(resolveVoidTyrantPhase(.71),'phase1');
  assert.equal(resolveVoidTyrantPhase(.70),'phase2');
  assert.equal(resolveVoidTyrantPhase(.41),'phase2');
  assert.equal(resolveVoidTyrantPhase(.40),'phase3');
  assert.equal(resolveVoidTyrantPhase(.16),'phase3');
  assert.equal(resolveVoidTyrantPhase(.15),'final');
  assert.equal(resolveVoidTyrantPhase(0),'final');
});

test('each phase adds pressure rather than only increasing stats',()=>{
  const p1=getVoidTyrantPhaseDefinition('phase1');
  const p2=getVoidTyrantPhaseDefinition('phase2');
  const p3=getVoidTyrantPhaseDefinition('phase3');
  const final=getVoidTyrantPhaseDefinition('final');
  assert.ok(p1.moves.includes('void-bolt'));
  assert.ok(p2.moves.includes('void-zone'));
  assert.ok(p3.moves.includes('summon-rift'));
  assert.ok(final.moves.includes('void-collapse'));
  assert.ok(final.intensity>p3.intensity&&p3.intensity>p2.intensity&&p2.intensity>p1.intensity);
});

test('phase definitions keep telegraph language explicit and readable',()=>{
  for(const id of Object.keys(VOID_TYRANT_PHASES)){
    const phase=getVoidTyrantPhaseDefinition(id);
    assert.match(phase.color,/^#[0-9a-f]{6}$/i);
    assert.ok(phase.telegraphSeconds>=.35);
    assert.ok(phase.moveCooldown>=2.4);
  }
});

test('attack plan is deterministic with supplied roll and respects phase move sets',()=>{
  const p1=buildVoidTyrantAttackPlan({phase:'phase1',roll:0});
  const p2=buildVoidTyrantAttackPlan({phase:'phase2',roll:.99});
  const p3=buildVoidTyrantAttackPlan({phase:'phase3',roll:.99});
  const final=buildVoidTyrantAttackPlan({phase:'final',roll:.99});
  assert.equal(p1.move,'void-bolt');
  assert.ok(getVoidTyrantPhaseDefinition('phase2').moves.includes(p2.move));
  assert.ok(getVoidTyrantPhaseDefinition('phase3').moves.includes(p3.move));
  assert.equal(final.move,'void-collapse');
  assert.ok(final.telegraphSeconds>=.5,'final move must remain readable');
});

test('unknown phases degrade to phase 1 instead of crashing',()=>{
  assert.equal(getVoidTyrantPhaseDefinition('missing').id,'phase1');
  assert.equal(buildVoidTyrantAttackPlan({phase:'missing',roll:.5}).phase,'phase1');
});
