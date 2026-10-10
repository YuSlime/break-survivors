import test from 'node:test';
import assert from 'node:assert/strict';
import * as premiumEnemyModel from '../src/data/enemies-premium.js';
import {
  PREMIUM_ENEMY_ARCHETYPES,
  PREMIUM_ACTIVE_TACTICAL_ARCHETYPES,
  PREMIUM_TACTICAL_SPAWN_LIMITS,
  getPremiumEnemyArchetype,
  pickPremiumEnemyArchetype,
  getPremiumEnemyPressureScore
} from '../src/data/enemies-premium.js';

const required=['support','assassin','summoner','shielder'];

test('Premium tactical enemies have distinct readable combat roles',()=>{
  for(const id of required){
    const enemy=getPremiumEnemyArchetype(id);
    assert.equal(enemy.id,id);
    assert.ok(enemy.role.length>0);
    assert.match(enemy.color,/^#[0-9a-f]{6}$/i);
    assert.ok(enemy.radius>0);
    assert.ok(enemy.hp>0);
    assert.ok(enemy.reward>0);
    assert.ok(enemy.priority>=2);
  }
  assert.equal(PREMIUM_ENEMY_ARCHETYPES.support.mechanic,'buff-aura');
  assert.equal(PREMIUM_ENEMY_ARCHETYPES.assassin.mechanic,'telegraph-dash');
  assert.equal(PREMIUM_ENEMY_ARCHETYPES.summoner.mechanic,'summon-swarm');
  assert.equal(PREMIUM_ENEMY_ARCHETYPES.shielder.mechanic,'shield-aura');
});

test('combat V2 phase B activates all four reviewed tactical archetypes',()=>{
  assert.deepEqual([...PREMIUM_ACTIVE_TACTICAL_ARCHETYPES],['support','assassin','summoner','shielder']);
  assert.equal(PREMIUM_TACTICAL_SPAWN_LIMITS.total,5);
  assert.equal(PREMIUM_TACTICAL_SPAWN_LIMITS.summoner,1);
  assert.equal(PREMIUM_TACTICAL_SPAWN_LIMITS.shielder,1);
});

test('role tuning exposes the gameplay parameters required by each mechanic',()=>{
  const support=getPremiumEnemyArchetype('support');
  assert.ok(support.auraRadius>=150);
  assert.ok(support.allySpeedMul>1);
  assert.ok(support.allyDamageMul>1);

  const assassin=getPremiumEnemyArchetype('assassin');
  assert.ok(assassin.telegraphSeconds>=.2);
  assert.ok(assassin.dashSpeed>=400);
  assert.ok(assassin.dashCooldown>=2);

  const summoner=getPremiumEnemyArchetype('summoner');
  assert.ok(summoner.summonInterval>=3);
  assert.ok(summoner.summonCount>=2);

  const shielder=getPremiumEnemyArchetype('shielder');
  assert.ok(shielder.auraRadius>=140);
  assert.ok(shielder.damageReduction>=.25&&shielder.damageReduction<=.65);
});

test('tactical enemies do not enter the run before escalation has developed',()=>{
  for(const roll of [0,.2,.5,.9]){
    assert.equal(pickPremiumEnemyArchetype({gameTime:45,threat:1,roll}),null);
  }
});

test('spawn table introduces all four roles progressively with recovery space',()=>{
  assert.equal(pickPremiumEnemyArchetype({gameTime:95,threat:2,roll:.05}),'support');
  assert.equal(pickPremiumEnemyArchetype({gameTime:95,threat:2,roll:.95}),null);
  assert.equal(pickPremiumEnemyArchetype({gameTime:130,threat:3,roll:.15}),'assassin');
  assert.equal(pickPremiumEnemyArchetype({gameTime:160,threat:3,roll:.24}),'summoner');
  assert.equal(pickPremiumEnemyArchetype({gameTime:190,threat:4,roll:.31}),'shielder');

  const later=new Set();
  for(let i=0;i<100;i++)later.add(pickPremiumEnemyArchetype({gameTime:190,threat:4,roll:i/100}));
  for(const id of required)assert.ok(later.has(id),id);
  assert.ok(later.has(null));
});

test('tactical spawn caps stop support-role pileups in dense late runs',()=>{
  const cappedTotal={support:2,assassin:1,summoner:1,shielder:1};
  assert.equal(pickPremiumEnemyArchetype({gameTime:220,threat:5,roll:.05,activeCounts:cappedTotal}),null);

  const cappedSummoner={support:0,assassin:0,summoner:1,shielder:0};
  assert.equal(pickPremiumEnemyArchetype({gameTime:220,threat:5,roll:.25,activeCounts:cappedSummoner}),null);

  const cappedShielder={support:0,assassin:0,summoner:0,shielder:1};
  assert.equal(pickPremiumEnemyArchetype({gameTime:220,threat:5,roll:.33,activeCounts:cappedShielder}),null);
});

test('pressure scores keep Summoner and Shielder as highest-priority tactical targets',()=>{
  const normal=getPremiumEnemyPressureScore('normal');
  const support=getPremiumEnemyPressureScore('support');
  const assassin=getPremiumEnemyPressureScore('assassin');
  const summoner=getPremiumEnemyPressureScore('summoner');
  const shielder=getPremiumEnemyPressureScore('shielder');
  assert.equal(normal,1);
  assert.ok(support>normal);
  assert.ok(assassin>=support);
  assert.ok(summoner>assassin);
  assert.ok(shielder>assassin);
});

test('support and shielder auras only affect nearby allies and preserve counterplay',()=>{
  const resolver=premiumEnemyModel.resolvePremiumEnemyAuras;
  assert.equal(typeof resolver,'function');

  const target={type:'normal',x:20,y:0,dead:false};
  const support={type:'support',x:0,y:0,dead:false};
  const shielder={type:'shielder',x:30,y:0,dead:false};
  const near=resolver(target,[target,support,shielder]);
  assert.equal(near.speedMul,PREMIUM_ENEMY_ARCHETYPES.support.allySpeedMul);
  assert.equal(near.touchMul,PREMIUM_ENEMY_ARCHETYPES.support.allyDamageMul);
  assert.equal(near.damageTakenMul,1-PREMIUM_ENEMY_ARCHETYPES.shielder.damageReduction);

  const ownShield=resolver(shielder,[target,support,shielder]);
  assert.equal(ownShield.damageTakenMul,1,'shielder must remain directly punishable');

  const far=resolver({type:'normal',x:1000,y:1000,dead:false},[support,shielder]);
  assert.deepEqual(far,{speedMul:1,touchMul:1,damageTakenMul:1});
});

test('unknown archetypes fail safely',()=>{
  assert.equal(getPremiumEnemyArchetype('missing'),null);
  assert.equal(getPremiumEnemyPressureScore('missing'),1);
});
