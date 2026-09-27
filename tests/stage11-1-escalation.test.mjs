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
    else if(source[i]===')'&&--pDepth===0){close=i;break}
  }
  const open=source.indexOf('{',close);
  let depth=0;
  for(let i=open;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error('unterminated '+name);
}

function escalationContext(){
  const start=source.indexOf('// Stage 11.1 — LIMIT BREAK: ESCALATION');
  const end=source.indexOf('// END Stage 11.1 — LIMIT BREAK: ESCALATION');
  assert.ok(start>=0&&end>start,'Stage 11.1 block must exist');
  const block=source.slice(start,end);
  const context={Math};
  vm.createContext(context);
  vm.runInContext(block+`
this.getLimitBreakEventMilestone=getLimitBreakEventMilestone;
this.collectLimitBreakEventMilestones=collectLimitBreakEventMilestones;
this.getNextLimitBreakEventMilestone=getNextLimitBreakEventMilestone;
this.scaleLbEventCount=scaleLbEventCount;
this.scaleLbCurrency=scaleLbCurrency;
this.scaleLbComposition=scaleLbComposition;
this.APOCALYPSE_PHASES=APOCALYPSE_PHASES;
this.LB_MEGA_WAVES=LB_MEGA_WAVES;
this.LB_EVENT_PREP_SECONDS=LB_EVENT_PREP_SECONDS;
this.LB_EVENT_INTERMISSION_SECONDS=LB_EVENT_INTERMISSION_SECONDS;
this.LB_EXECUTION_SECONDS=LB_EXECUTION_SECONDS;
this.LB_PHASE_TRANSITION_SECONDS=LB_PHASE_TRANSITION_SECONDS;
`,context);
  return context;
}

test('LIMIT BREAK event milestones and tiers are exact',()=>{
  const {getLimitBreakEventMilestone,collectLimitBreakEventMilestones}=escalationContext();
  const expected=[
    [3,'mega',1],[5,'dominion',1],[10,'apocalypse',1],
    [15,'mega',2],[20,'dominion',2],[25,'apocalypse',2],
    [30,'mega',3],[35,'dominion',3],[40,'apocalypse',3],
    [45,'mega',4],[50,'dominion',4],[55,'apocalypse',4]
  ];
  for(const [lb,type,tier] of expected){
    const m=getLimitBreakEventMilestone(lb);
    assert.equal(m.type,type,'type @ LB'+lb);
    assert.equal(m.tier,tier,'tier @ LB'+lb);
    assert.equal(m.countMul,1+(tier-1)*.35);
    assert.equal(m.rewardMul,1+(tier-1)*.35);
  }
  for(const lb of [0,1,2,4,6,9,11,14,16,19,21,24,26,29])assert.equal(getLimitBreakEventMilestone(lb),null);
  assert.deepEqual(Array.from(collectLimitBreakEventMilestones(2,10),m=>m.lb),[3,5,10]);
  assert.deepEqual(Array.from(collectLimitBreakEventMilestones(9,21),m=>m.lb),[10,15,20]);
});

test('tier scaling uses nearest-integer rounding and exact +35% steps',()=>{
  const {scaleLbEventCount,scaleLbCurrency,scaleLbComposition}=escalationContext();
  assert.equal(scaleLbEventCount(96,1),96);
  assert.equal(scaleLbEventCount(96,2),130);
  assert.equal(scaleLbEventCount(96,3),163);
  assert.equal(scaleLbEventCount(96,4),197);
  assert.equal(scaleLbCurrency(10000,2),13500);
  assert.equal(scaleLbCurrency(10000,3),17000);
  assert.equal(scaleLbCurrency(10000,4),20500);
  const dom=Array.from(scaleLbComposition([4,4,4],2));
  assert.equal(dom.reduce((a,b)=>a+b,0),16);
});

test('preparation, queued intermission, execution, and phase switch timings match decisions',()=>{
  const c=escalationContext();
  assert.equal(c.LB_EVENT_PREP_SECONDS,3);
  assert.equal(c.LB_EVENT_INTERMISSION_SECONDS,3);
  assert.equal(c.LB_EXECUTION_SECONDS,.35);
  assert.equal(c.LB_PHASE_TRANSITION_SECONDS,.7);
  const inter=functionSource('updateLimitBreakEvent');
  assert.match(inter,/startLimitBreakEvent\(next,true\)/,'queued event starts directly without second countdown');
});

test('MEGA SURGE is exactly 20+20+20+20+16 at Tier I',()=>{
  const {LB_MEGA_WAVES,scaleLbEventCount}=escalationContext();
  assert.equal(LB_MEGA_WAVES.length,4);
  for(const w of LB_MEGA_WAVES){
    assert.deepEqual(Array.from(w.base),[9,7,4]);
    assert.equal(w.base.reduce((a,b)=>a+b,0),20);
  }
  assert.equal(4*scaleLbEventCount(20,1)+scaleLbEventCount(16,1),96);
  const mega=functionSource('spawnMegaWave');
  assert.match(mega,/normal',count:2/);
  assert.match(mega,/runner',count:5/);
  assert.match(mega,/tank',count:5/);
  assert.match(mega,/berserker',count:2/);
  assert.match(mega,/titan',count:1/);
  assert.match(mega,/gold',count:1/);
});

test('APOCALYPSE phase goals and deadlines are exact and boss-free',()=>{
  const {APOCALYPSE_PHASES}=escalationContext();
  assert.deepEqual(Array.from(APOCALYPSE_PHASES,p=>[p.name,p.baseTarget,p.deadline]),[
    ['RED FLOOD',70,12],['GOLDEN STORM',50,12],['LAST SURGE',90,16]
  ]);
  assert.deepEqual(Array.from(APOCALYPSE_PHASES,p=>[p.batch,p.cadence]),[[8,.65],[6,.75],[10,.60]]);
  const start=functionSource('startApocalypsePhase');
  const spawn=functionSource('spawnApocalypseBatch');
  assert.doesNotMatch(start,/boss/i);
  assert.doesNotMatch(spawn,/spawnEnemy\(['"]boss/);
});

test('event kills still advance normal runKills while execution gives zero credit',()=>{
  const kill=functionSource('killEnemy');
  const exec=functionSource('executeLbEnemy');
  assert.match(kill,/registerLbEventKill\(e\)/);
  assert.match(kill,/runKills\+\+/);
  assert.match(kill,/updateThreatProgression\(\)/);
  assert.doesNotMatch(exec,/killEnemy\(/);
  assert.doesNotMatch(exec,/runKills|spawnEnemyDrops|spawnPickup|updateThreatProgression|registerBreakKill/);
});

test('Elite variants include Berserker, Titan chain, and Gold reward behavior',()=>{
  const spawn=functionSource('spawnLbEventEnemy');
  const titan=functionSource('triggerTitanEliteExplosion');
  const behavior=functionSource('updateEliteVariantBehavior');
  assert.match(spawn,/berserker/);
  assert.match(spawn,/titan/);
  assert.match(spawn,/gold/);
  assert.match(spawn,/e\.hp\*=2\.20/);
  assert.match(spawn,/e\.reward\*=2\.20/);
  assert.match(titan,/damageEnemyRaw\(other,damage/);
  assert.match(titan,/e\.maxHp\*\.72/);
  assert.doesNotMatch(titan,/player\.hp/);
  assert.match(behavior,/chargeTelegraph=\.35/);
  assert.match(behavior,/dashVx=Math\.cos\(a\)\*480/);
  assert.match(kill=functionSource('killEnemy'),/eliteVariant==='gold'[\s\S]*i<5/);
});

test('spawn and world progression multipliers are wired without changing Stage 11.0 density math',()=>{
  const spawnMul=functionSource('getLbNormalSpawnMultiplier');
  const update=functionSource('update');
  assert.match(spawnMul,/type==='mega'\)return 1/);
  assert.match(spawnMul,/type==='dominion'\)return \.5/);
  assert.match(spawnMul,/return 0/);
  assert.match(update,/if\(isLbEventActive\(\)\)nextEventAt\+=dt/);
  assert.match(update,/spawnTimer-=dt\*lbNormalSpawnMul/);
  assert.match(source,/const lbDensity=1\+limitBreak\*\.12/);
  assert.match(source,/const lbHp=1\+limitBreak\*\.05/);
  assert.match(source,/const lbReward=1\+limitBreak\*\.10/);
});

test('rewards, OVERDRIVE, failure, HUD and dedicated low-end audio are integrated',()=>{
  const reward=functionSource('grantLimitBreakEventReward');
  const fail=functionSource('failLimitBreakEvent');
  assert.match(reward,/scaleLbCurrency\(2500,tier\)/);
  assert.match(reward,/remaining:10,attackRate:1\.20/);
  assert.match(reward,/scaleLbCurrency\(5000,tier\)/);
  assert.match(reward,/gems=scaleLbCurrency\(75,tier\)/);
  assert.match(reward,/remaining:15,damage:1\.25,attackRate:1\.20/);
  assert.match(reward,/scaleLbCurrency\(10000,tier\)/);
  assert.match(reward,/gems=scaleLbCurrency\(150,tier\)/);
  assert.match(reward,/remaining:20,damage:1\.35,attackRate:1\.25,move:1\.20,breakGrace:1/);
  assert.match(fail,/LB_EVENT_FAIL_FREEZE_SECONDS/);
  assert.match(source,/id="lbEventHud"/);
  assert.match(source,/id="lbEventOverlay"/);
  assert.match(source,/function playLbEventCue/);
  assert.match(source,/function startLbEventMusic/);
  assert.match(source,/\.5\)/,'0.5s audio crossfade exists');
});

test('run reset and run end invalidate all Stage 11.1 state',()=>{
  const reset=functionSource('resetRun');
  const end=functionSource('endRun');
  assert.match(reset,/lbRunGeneration\+\+/);
  assert.match(reset,/lbEventState=null;lbEventQueue=\[\];lbRewardBuffs=\[\]/);
  assert.match(end,/lbRunGeneration\+\+/);
  assert.match(end,/lbEventQueue=\[\];lbEventState=null/);
  assert.match(end,/LIMIT BREAK FAILED/);
});
