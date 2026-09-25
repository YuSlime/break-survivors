import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function functionSource(name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,'function '+name+' must exist');
  const paren=source.indexOf('(',start);
  let pDepth=0,close=-1;
  for(let i=paren;i<source.length;i++){
    if(source[i]==='(')pDepth++;
    else if(source[i]===')'){
      pDepth--;
      if(pDepth===0){close=i;break}
    }
  }
  const open=source.indexOf('{',close);
  let depth=0;
  for(let i=open;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'){
      depth--;
      if(depth===0)return source.slice(start,i+1);
    }
  }
  throw new Error('unterminated '+name);
}

function threatContext(){
  const start=source.indexOf('// Stage 11.0 — THREAT BREAKPOINT MODEL');
  const end=source.indexOf('// END THREAT BREAKPOINT MODEL');
  assert.ok(start>=0 && end>start,'THREAT model block must exist');
  const block=source.slice(start,end);
  const context={Math};
  vm.createContext(context);
  vm.runInContext(block+'\nthis.THREAT_THRESHOLDS=THREAT_THRESHOLDS;this.THREAT_PROFILES=THREAT_PROFILES;this.getThreatState=getThreatState;this.getThreatSpawnShape=getThreatSpawnShape;this.getThreatEliteChance=getThreatEliteChance;this.buildThreatSurgePlan=buildThreatSurgePlan;this.getThreatFxScale=getThreatFxScale;',context);
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


test('elite pressure and surge plans match Stage 11 values',()=>{
  const {getThreatState,getThreatEliteChance,buildThreatSurgePlan}=threatContext();
  const expectedElite=[.035,.04,.06,.11,.17,.24];
  for(let threat=0;threat<=5;threat++){
    const kills=[0,150,450,900,1600,2600][threat];
    const state=getThreatState(kills);
    assert.equal(getThreatEliteChance(state,121),expectedElite[threat]);
    assert.equal(getThreatEliteChance(state,119),0);
  }
  const counts=[10,14,20,28,38];
  const elites=[0,1,3,6,10];
  for(let level=1;level<=5;level++){
    const p=buildThreatSurgePlan(level);
    assert.equal(p.count,counts[level-1]);
    assert.equal(p.eliteCount,elites[level-1]);
  }
});

test('runtime integrates threat into spawn interval, batches, hp and rewards',()=>{
  assert.match(source,/getThreatSpawnShape\(threatState\.densityMul,Math\.random\(\)\)/);
  assert.match(source,/spawnTimer=base\/\(spawnMul\*\(feverActive\(\)\?1\.45:1\)\*eventSpawnMultiplier\(\)\*spawnShape\.intervalMul\)/);
  assert.match(source,/for\(let spawnIndex=0;spawnIndex<spawnShape\.batchSize;spawnIndex\+\+\)/);
  assert.match(source,/const threatState=getThreatState\(runKills\);[\s\S]{0,240}hpScale=\(1\+gameTime\/70\)\*threatState\.hpMul/);
  assert.match(source,/reward:d\.reward\*threatState\.rewardMul/);
  assert.match(source,/function spawnThreatSurge\(level\)/);
  assert.match(source,/spawnEnemy\(type,\{position:/);
  assert.doesNotMatch(source,/MAX_ENEMIES|enemyCap|enemies\.length\s*[>=]+\s*\d+/);
});


test('THREAT transitions, HUD mode, and run reset are wired',()=>{
  const kill=functionSource('killEnemy');
  const progression=functionSource('updateThreatProgression');
  const trigger=functionSource('triggerThreatUp');
  const reset=functionSource('resetRun');
  const hud=functionSource('updateHud');

  assert.match(kill,/runKills\+\+;[\s\S]{0,100}updateThreatProgression\(\)/);
  assert.match(progression,/state\.threat>threatLevel/);
  assert.match(progression,/state\.limitBreak>limitBreakLevel/);
  assert.match(trigger,/spawnThreatSurge\(newLevel\)/);
  assert.match(trigger,/THREAT MAXIMUM/);
  assert.doesNotMatch(progression,/spawnThreatSurge\([^)]*limitBreak/);

  assert.match(source,/id="threatHud"/);
  assert.match(source,/id="threatLabel"/);
  assert.match(source,/id="threatFill"/);
  assert.match(source,/id="threatSub"/);
  assert.match(hud,/state\.isLimitBreak\?'LIMIT BREAK'/);
  assert.match(hud,/state\.nextKills/);
  assert.match(hud,/617|progressStart/);

  assert.match(reset,/threatLevel=0;limitBreakLevel=0;threatFlash=0/);
  assert.doesNotMatch(source,/save\.(?:threat|limitBreak)/);
});

test('THREAT edge flash is run-local and decays during update',()=>{
  const update=functionSource('update');
  assert.match(source,/let threatLevel=0,limitBreakLevel=0,threatFlash=0/);
  assert.match(update,/threatFlash=Math\.max\(0,threatFlash-dt\*/);
  assert.match(source,/id="threatEdgeFlash"/);
});


test('visual pressure scaling trims only FX and respects floors',()=>{
  const {getThreatState,getThreatFxScale}=threatContext();
  const t0=getThreatState(0);
  const t5=getThreatState(2600);
  const lb20=getThreatState(12600);

  assert.equal(getThreatFxScale(t0,false),1);
  const t5Full=getThreatFxScale(t5,false);
  const t5Low=getThreatFxScale(t5,true);
  assert.ok(t5Full>=.55&&t5Full<=.75);
  assert.ok(t5Low<t5Full);
  assert.ok(getThreatFxScale(lb20,false)>=.45);
  assert.ok(getThreatFxScale(lb20,true)>=.32);

  const trim=functionSource('trimVisualEffects');
  for(const allowed of ['particles','rings','beams','slashFx','lightnings','bombExplosionFx','missileQueenFx','novaUltCores','floatingTexts']){
    assert.match(trim,new RegExp('trim\\('+allowed));
  }
  for(const forbidden of ['enemies','bullets','missiles','enemyBullets','pickups']){
    assert.doesNotMatch(trim,new RegExp('trim\\('+forbidden));
  }
  assert.match(trim,/getThreatFxScale\(getThreatState\(runKills\),performanceMode\)/);
});
