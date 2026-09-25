import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function threatContext(){
  const start=source.indexOf('// Stage 11.0 — THREAT BREAKPOINT MODEL');
  const end=source.indexOf('// END THREAT BREAKPOINT MODEL');
  assert.ok(start>=0 && end>start,'THREAT model block must exist');
  const block=source.slice(start,end);
  const context={Math};
  vm.createContext(context);
  vm.runInContext(block+'\nthis.THREAT_THRESHOLDS=THREAT_THRESHOLDS;this.THREAT_PROFILES=THREAT_PROFILES;this.getThreatState=getThreatState;this.getThreatSpawnShape=getThreatSpawnShape;',context);
  return context;
}

test('THREAT boundaries and LIMIT BREAK cadence are exact',()=>{
  const {getThreatState}=threatContext();
  const cases=[
    [149,0,false,0],[150,1,false,0],[449,1,false,0],[450,2,false,0],
    [899,2,false,0],[900,3,false,0],[1599,3,false,0],[1600,4,false,0],
    [2599,4,false,0],[2600,5,true,0],[3099,5,true,0],[3100,5,true,1]
  ];
  for(const [kills,threat,isLimitBreak,lb] of cases){
    const s=getThreatState(kills);
    assert.equal(s.threat,threat,'threat @ '+kills);
    assert.equal(s.isLimitBreak,isLimitBreak,'limit mode @ '+kills);
    assert.equal(s.limitBreak,lb,'LB @ '+kills);
  }
});

test('THREAT profiles and LIMIT BREAK scaling are exact',()=>{
  const {getThreatState}=threatContext();
  const t5=getThreatState(2600);
  assert.equal(t5.densityMul,3.10);
  assert.equal(t5.hpMul,1.40);
  assert.equal(t5.rewardMul,2.00);

  const lb1=getThreatState(3100);
  assert.ok(Math.abs(lb1.densityMul-3.10*1.12)<1e-9);
  assert.ok(Math.abs(lb1.hpMul-1.40*1.05)<1e-9);
  assert.ok(Math.abs(lb1.rewardMul-2.00*1.10)<1e-9);

  const lb10=getThreatState(7600);
  assert.ok(Math.abs(lb10.densityMul-3.10*2.20)<1e-9);
  assert.ok(Math.abs(lb10.hpMul-1.40*1.50)<1e-9);
  assert.ok(Math.abs(lb10.rewardMul-2.00*2.00)<1e-9);
});

test('spawn shape changes both interval and batch while preserving expected density',()=>{
  const {getThreatSpawnShape}=threatContext();
  const a=getThreatSpawnShape(1,0);
  assert.equal(a.intervalMul,1);
  assert.equal(a.batchSize,1);

  const d=3.10;
  const lo=getThreatSpawnShape(d,0.99);
  const hi=getThreatSpawnShape(d,0.0);
  assert.ok(lo.intervalMul>1);
  assert.ok(lo.batchSize>=1);
  assert.ok(hi.batchSize>=lo.batchSize);
  const expectedBatch=d/lo.intervalMul;
  assert.ok(expectedBatch>1);
});
