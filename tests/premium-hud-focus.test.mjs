import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveHudFocus,createHudFocusController} from '../src/ui/hud-focus.js';

test('HUD focus follows the approved gameplay information hierarchy',()=>{
  assert.equal(resolveHudFocus({}).focus,'calm');
  assert.equal(resolveHudFocus({threatActive:true}).focus,'threat');
  assert.equal(resolveHudFocus({breakActive:true,threatActive:true}).focus,'break');
  assert.equal(resolveHudFocus({feverActive:true,breakActive:true}).focus,'break');
  assert.equal(resolveHudFocus({eventActive:true,feverActive:true}).focus,'event');
  assert.equal(resolveHudFocus({bossActive:true,eventActive:true}).focus,'boss');
  assert.equal(resolveHudFocus({lbEventActive:true,bossActive:true}).focus,'limit');
  assert.equal(resolveHudFocus({bossFinalPhase:true,lbEventActive:true,bossActive:true}).focus,'boss');
});

test('major concurrent states remain secondary instead of disappearing',()=>{
  const view=resolveHudFocus({bossFinalPhase:true,bossActive:true,lbEventActive:true,feverActive:true,breakActive:true,threatActive:true});
  assert.equal(view.roles.boss,'focus');
  assert.equal(view.roles.limit,'secondary');
  assert.equal(view.roles.break,'secondary');
  assert.equal(view.roles.threat,'quiet');
});

test('limit event takes focus over a normal boss while keeping boss health secondary',()=>{
  const view=resolveHudFocus({lbEventActive:true,bossActive:true,breakActive:true});
  assert.equal(view.focus,'limit');
  assert.equal(view.roles.limit,'focus');
  assert.equal(view.roles.boss,'secondary');
  assert.equal(view.roles.break,'secondary');
});

test('controller writes semantic roles to existing HUD elements without replacing them',()=>{
  const elements={
    breakHud:{dataset:{}},
    threatHud:{dataset:{}},
    eventHud:{dataset:{}},
    bossHud:{dataset:{}},
    lbEventHud:{dataset:{}}
  };
  const document={getElementById:id=>elements[id]||null};
  const controller=createHudFocusController({document});
  const view=controller.update({bossActive:true,breakActive:true,threatActive:true});
  assert.equal(view.focus,'boss');
  assert.equal(elements.bossHud.dataset.premiumHudRole,'focus');
  assert.equal(elements.breakHud.dataset.premiumHudRole,'secondary');
  assert.equal(elements.threatHud.dataset.premiumHudRole,'quiet');
});

test('controller injects Premium HUD emphasis styling once when a DOM head is available',()=>{
  const elements={breakHud:{dataset:{}},threatHud:{dataset:{}},eventHud:{dataset:{}},bossHud:{dataset:{}},lbEventHud:{dataset:{}}};
  const styles=[];
  const document={
    head:{append:node=>styles.push(node)},
    createElement:tag=>({tagName:tag.toUpperCase(),id:'',textContent:''}),
    getElementById:id=>elements[id]||styles.find(node=>node.id===id)||null
  };
  createHudFocusController({document});
  createHudFocusController({document});
  assert.equal(styles.length,1);
  assert.equal(styles[0].id,'premium-hud-focus-style');
  assert.match(styles[0].textContent,/data-premium-hud-role="focus"/);
  assert.match(styles[0].textContent,/data-premium-hud-role="secondary"/);
  assert.match(styles[0].textContent,/data-premium-hud-role="quiet"/);
  assert.match(styles[0].textContent,/opacity:\.14/);
});

test('controller reset returns legacy HUD elements to unmanaged state',()=>{
  const elements={breakHud:{dataset:{}},threatHud:{dataset:{}},eventHud:{dataset:{}},bossHud:{dataset:{}},lbEventHud:{dataset:{}}};
  const document={getElementById:id=>elements[id]||null};
  const controller=createHudFocusController({document});
  controller.update({eventActive:true});
  controller.reset();
  for(const el of Object.values(elements))assert.equal('premiumHudRole' in el.dataset,false);
});
