import test from 'node:test';
import assert from 'node:assert/strict';
import {mountSignatureMeterHud} from '../src/ui/signature-meter.js';
import {createPremiumRuntime,resolveRuntimeFeatureOverrides} from '../src/game/premium-runtime.js';

class FakeStyle{
  constructor(){this.values={};this.width='';this.background=''}
  setProperty(key,value){this.values[key]=value}
}
class FakeElement{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style=new FakeStyle();this.textContent='';this.className='';this.id='';this.parentNode=null;}
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node)}}
  appendChild(node){this.append(node);return node}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this)}
}
function fakeDocument(){
  const head=new FakeElement('head');
  const nodes=new Map();
  return {
    head,
    createElement:tag=>new FakeElement(tag),
    getElementById:id=>nodes.get(id)||null,
    register(el){if(el.id)nodes.set(el.id,el);return el}
  };
}

test('premium query enables the signature HUD but keeps gameplay v2 systems off',()=>{
  const flags=resolveRuntimeFeatureOverrides({search:'?premium=1'});
  assert.equal(flags.premiumHud,true);
  assert.equal(flags.combatV2,false);
  assert.equal(flags.bossV2,false);
});

test('signature HUD renders label, percent and state without touching legacy HUD',()=>{
  const document=fakeDocument();
  const parent=new FakeElement('div');
  const hud=mountSignatureMeterHud({document,parent});
  assert.ok(hud);
  assert.equal(parent.children.length,1);

  hud.update({characterId:'thunderfox',signatureMeter:82});
  assert.equal(hud.host.dataset.state,'charged');
  assert.equal(hud.label.textContent,'VOLTAGE');
  assert.equal(hud.value.textContent,'82%');
  assert.equal(hud.fill.style.width,'82%');

  hud.update({characterId:'thunderfox',signatureMeter:100});
  assert.equal(hud.host.dataset.state,'full');
  hud.destroy();
  assert.equal(parent.children.length,0);
});

test('runtime converts live character combat state into signature meter percentage',()=>{
  const runtime=createPremiumRuntime({flags:{premiumHud:true}});
  const frame=runtime.updateFrame(.016,{
    characterId:'bombcat',characterLevel:50,attackCounters:{bombcat:4},gunnerMomentum:0
  });
  assert.equal(frame.signatureMeter,100);
  assert.equal(frame.signatureLabel,'CHAIN');
});
