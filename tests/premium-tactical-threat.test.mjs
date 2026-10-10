import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTacticalThreatView,getTacticalEnemyMarker} from '../src/ui/tactical-threat.js';

test('tactical HUD stays hidden when no tactical pressure exists',()=>{
  const view=buildTacticalThreatView();
  assert.equal(view.visible,false);
  assert.equal(view.level,'clear');
  assert.equal(view.total,0);
});

test('one Support creates an alert without over-warning the player',()=>{
  const view=buildTacticalThreatView({activeCounts:{support:1}});
  assert.equal(view.visible,true);
  assert.equal(view.level,'alert');
  assert.equal(view.total,1);
  assert.match(view.roles,/SUP 1/);
});

test('mixed tactical roles escalate the warning level',()=>{
  const danger=buildTacticalThreatView({activeCounts:{support:1,assassin:1}});
  assert.equal(danger.level,'danger');
  assert.match(danger.roles,/SUP 1/);
  assert.match(danger.roles,/ASN 1/);

  const critical=buildTacticalThreatView({
    activeCounts:{support:1,assassin:1,summoner:1},
    eliteCount:2
  });
  assert.equal(critical.level,'critical');
  assert.ok(critical.pressure>danger.pressure);
});

test('boss overlap is reflected in tactical danger without inventing tactical counts',()=>{
  const view=buildTacticalThreatView({activeCounts:{shielder:1},bossActive:true});
  assert.equal(view.total,1);
  assert.ok(['danger','critical'].includes(view.level));
  assert.match(view.roles,/SHD 1/);
});

test('every tactical enemy has a compact readable battlefield marker',()=>{
  assert.deepEqual(getTacticalEnemyMarker('support'),{code:'SUP',color:'#5ff0b0'});
  assert.deepEqual(getTacticalEnemyMarker('assassin'),{code:'ASN',color:'#ff5fa2'});
  assert.deepEqual(getTacticalEnemyMarker('summoner'),{code:'SUM',color:'#b078ff'});
  assert.deepEqual(getTacticalEnemyMarker('shielder'),{code:'SHD',color:'#62b8ff'});
  assert.equal(getTacticalEnemyMarker('normal'),null);
});
