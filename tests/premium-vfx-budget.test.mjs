import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

async function importSource(path){
  const src=fs.readFileSync(new URL(path,import.meta.url),'utf8');
  return import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
}

test('VFX profiles expose explicit caps for low, medium, high and ultra',async()=>{
  const {VFX_PROFILES}=await importSource('../src/presentation/vfx-budget.js');
  for(const name of ['low','medium','high','ultra']){
    assert.ok(VFX_PROFILES[name]);
    assert.ok(VFX_PROFILES[name].particles>0);
    assert.ok(VFX_PROFILES[name].damageText>0);
    assert.ok(VFX_PROFILES[name].explosions>0);
  }
  assert.ok(VFX_PROFILES.low.particles<VFX_PROFILES.high.particles);
  assert.ok(VFX_PROFILES.high.particles<VFX_PROFILES.ultra.particles);
});

test('low-priority effects stop before hard cap and reserve room for important effects',async()=>{
  const {createVfxBudget}=await importSource('../src/presentation/vfx-budget.js');
  const budget=createVfxBudget({profile:'low'});
  let lowCount=0;
  while(budget.trySpawn('particles',1))lowCount++;
  const hard=budget.limits.particles;
  assert.ok(lowCount<hard);
  assert.equal(budget.trySpawn('particles',5),true);
  assert.ok(budget.counts.particles<=hard);
});

test('budget resets per frame and rejects unknown effect kinds',async()=>{
  const {createVfxBudget}=await importSource('../src/presentation/vfx-budget.js');
  const budget=createVfxBudget({profile:'medium'});
  assert.equal(budget.trySpawn('unknown',5),false);
  assert.equal(budget.trySpawn('rings',2),true);
  assert.equal(budget.counts.rings,1);
  budget.beginFrame();
  assert.equal(budget.counts.rings,0);
});

test('adaptive profile recommendation degrades quickly and upgrades conservatively',async()=>{
  const {recommendVfxProfile}=await importSource('../src/presentation/vfx-budget.js');
  assert.equal(recommendVfxProfile('high',32),'low');
  assert.equal(recommendVfxProfile('high',42),'medium');
  assert.equal(recommendVfxProfile('medium',50),'medium');
  assert.equal(recommendVfxProfile('medium',59),'high');
  assert.equal(recommendVfxProfile('high',60),'high');
});