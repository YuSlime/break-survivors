import test from 'node:test';
import assert from 'node:assert/strict';
import {mountRunUpgradeDraft,describeRunUpgrade} from '../src/ui/run-upgrade-draft.js';

class FakeClassList{
  constructor(){this.values=new Set()}
  add(...items){items.forEach(x=>this.values.add(x))}
  remove(...items){items.forEach(x=>this.values.delete(x))}
  contains(item){return this.values.has(item)}
}
class FakeElement{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={setProperty(k,v){this[k]=v}};this.className='';this.classList=new FakeClassList();this.textContent='';this.id='';this.parentNode=null;this.onclick=null;this.type='';}
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node)}}
  replaceChildren(...nodes){this.children=[];this.append(...nodes)}
  remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this)}
  click(){this.onclick?.({currentTarget:this})}
}
function fakeDocument(){
  const head=new FakeElement('head');
  return {head,createElement(tag){return new FakeElement(tag)},getElementById(){return null}};
}

const choices=[
  {id:'gunner-calibration',tier:'stat',name:'CALIBRATION',effect:'Damage +12%',rank:0},
  {id:'gunner-ricochet',tier:'modify',name:'RICOCHET',effect:'Shots bounce to another enemy',rank:0},
  {id:'gunner-thunder-crit',tier:'synergy',name:'THUNDER CRIT',effect:'Critical hits discharge chain lightning',rank:0},
  {id:'gunner-railstorm',tier:'evolution',name:'RAILSTORM',effect:'Momentum converts fire into piercing rail bursts',rank:0},
  {id:'gunner-tempo',tier:'stat',name:'TRIGGER TEMPO',effect:'Attack Speed +8%',rank:1}
];

test('run upgrade descriptions expose effect and next rank plainly',()=>{
  assert.match(describeRunUpgrade(choices[0]),/Damage \+12%/);
  assert.match(describeRunUpgrade(choices[4]),/Rank 2/i);
});

test('draft renders every supplied choice up to the approved five-card boss limit',()=>{
  const document=fakeDocument(),parent=new FakeElement('div');
  const ui=mountRunUpgradeDraft({document,parent});
  let selected=null;
  ui.show(choices,{mode:'boss'},choice=>{selected=choice});
  assert.equal(ui.visible,true);
  assert.equal(ui.cards.children.length,5);
  assert.match(ui.sub.textContent,/5 CHOICES/i);
  ui.cards.children[3].click();
  assert.equal(selected.id,'gunner-railstorm');
  assert.equal(ui.visible,false);
});

test('normal and BREAK drafts preserve their supplied 3 or 4 choice count',()=>{
  const document=fakeDocument(),parent=new FakeElement('div');
  const ui=mountRunUpgradeDraft({document,parent});
  ui.show(choices.slice(0,3),{mode:'normal'},()=>{});
  assert.equal(ui.cards.children.length,3);
  ui.hide();
  ui.show(choices.slice(0,4),{mode:'break'},()=>{});
  assert.equal(ui.cards.children.length,4);
});

test('draft overlay can be hidden and destroyed safely between runs',()=>{
  const document=fakeDocument(),parent=new FakeElement('div');
  const ui=mountRunUpgradeDraft({document,parent});
  ui.show(choices.slice(0,3),{},()=>{});
  ui.hide();
  assert.equal(ui.visible,false);
  ui.destroy();
  assert.equal(parent.children.length,0);
});
