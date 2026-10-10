import test from 'node:test';
import assert from 'node:assert/strict';
import {mountBossRewardOverlay,describeBossReward} from '../src/ui/boss-reward.js';

class FakeClassList{
  constructor(){this.values=new Set()}
  add(...items){items.forEach(x=>this.values.add(x))}
  remove(...items){items.forEach(x=>this.values.delete(x))}
  contains(item){return this.values.has(item)}
}
class FakeElement{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.className='';this.classList=new FakeClassList();this.textContent='';this.id='';this.parentNode=null;this.onclick=null;this.type='';}
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node)}}
  replaceChildren(...nodes){this.children=[];this.append(...nodes)}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this)}
  click(){this.onclick?.({currentTarget:this})}
}
function fakeDocument(){
  const head=new FakeElement('head');
  const byId=new Map();
  return {
    head,
    createElement(tag){const el=new FakeElement(tag);return el},
    getElementById(id){return byId.get(id)||null},
    register(el){if(el.id)byId.set(el.id,el);return el}
  };
}

const choices=[
  {category:'legendary',id:'boon-annihilation',label:'ANNIHILATION CORE',color:'#ff665e',rarity:'LEGENDARY',effects:{damageMul:1.25}},
  {category:'resource',id:'void-cache',label:'VOID CACHE',color:'#ffd86a',rarity:'BOSS',coins:1000,gems:35},
  {category:'recovery',id:'renewal-protocol',label:'RENEWAL PROTOCOL',color:'#7dffa8',rarity:'BOSS',healRatio:.35,ultGain:50}
];

test('boss reward descriptions explain the actual reward without jargon',()=>{
  assert.match(describeBossReward(choices[0]),/Damage.*25%/i);
  assert.match(describeBossReward(choices[1]),/1,000.*35/);
  assert.match(describeBossReward(choices[2]),/HP.*35%.*ULT.*50/i);
});

test('overlay renders exactly three interactive reward cards and resolves one choice',()=>{
  const document=fakeDocument(),parent=new FakeElement('div');
  const ui=mountBossRewardOverlay({document,parent});
  let selected=null;
  ui.show(choices,choice=>{selected=choice});
  assert.equal(ui.visible,true);
  assert.equal(parent.children.length,1);
  assert.equal(ui.cards.children.length,3);
  assert.ok(ui.host.classList.contains('show'));

  ui.cards.children[1].click();
  assert.equal(selected.id,'void-cache');
  assert.equal(ui.visible,false);
  assert.ok(!ui.host.classList.contains('show'));
});

test('overlay can be safely hidden and destroyed between runs',()=>{
  const document=fakeDocument(),parent=new FakeElement('div');
  const ui=mountBossRewardOverlay({document,parent});
  ui.show(choices,()=>{});
  ui.hide();
  assert.equal(ui.visible,false);
  ui.destroy();
  assert.equal(parent.children.length,0);
});
