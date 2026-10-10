import test from 'node:test';
import assert from 'node:assert/strict';
import * as premiumEnemyModel from '../src/data/enemies-premium.js';
import {
  PREMIUM_ENEMY_ARCHETYPES,
  PREMIUM_ACTIVE_TACTICAL_ARCHETYPES,
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

test('current combat V2 rollout activates Support and Assassin only',()=>{
  assert.deepEqual([...PREMIUM_ACTIVE_TACTICAL_ARCHETYPES],['support','assassin']);
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

test('active spawn table introduces Support before Assassin and keeps later archetypes dormant',()=>{
  assert.equal(pickPremiumEnemyArchetype({gameTime:95,threat:2,roll:.05}),'support');
  assert.equal(pickPremiumEnemyArchetype({gameTime:95,threat:2,roll:.95}),null);

  const later=new Set();
  for(let i=0;i<100;i++)later.add(pickPremiumEnemyArchetype({gameTime:190,threat:4,roll:i/100}));
  assert.ok(later.has('support'));
  assert.ok(later.has('assassin'));
  assert.ok(later.has(null));
  assert.equal(later.has('summoner'),false);
  assert.equal(later.has('shielder'),false);
});

test('pressure scores preserve future tactical tuning without forcing dormant roles into live runs',()=>{
  const normal=getPremiumEnemyPressureScore('normal');
  const support=getPremiumEnemyPressureScore('support');
  const summoner=getPremiumEnemyPressureScore('summoner');
  const shielder=getPremiumEnemyPressureScore('shielder');
  assert.equal(normal,1);
  assert.ok(support>normal);
  assert.ok(summoner>=support);
  assert.ok(shielder>=support);
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
