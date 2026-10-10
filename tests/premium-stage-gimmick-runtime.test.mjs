import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime=fs.readFileSync(new URL('../src/game/premium-runtime.js',import.meta.url),'utf8');

test('Premium runtime exposes stage gimmick definition and live frame resolver',()=>{
  assert.match(runtime,/stage-gimmicks\.js/);
  assert.match(runtime,/function getStageGimmick\(/);
  assert.match(runtime,/function resolveStageGimmickFrame\(/);
  assert.match(runtime,/getStageGimmickProfile/);
  assert.match(runtime,/resolveStageGimmickFrameProfile/);
  assert.match(runtime,/\n    getStageGimmick,/);
  assert.match(runtime,/\n    resolveStageGimmickFrame,/);
});

test('stage gimmicks stay behind stagesV2 flag',()=>{
  const start=runtime.indexOf('function getStageGimmick(');
  const end=runtime.indexOf('function pickTacticalEnemy',start);
  const section=runtime.slice(start,end);
  assert.match(section,/if\(!resolved\.stagesV2\)return null/);
});
