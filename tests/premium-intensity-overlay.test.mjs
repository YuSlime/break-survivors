import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveIntensityPresentation,mountIntensityOverlay} from '../src/ui/intensity-overlay.js';

class FakeStyle{
  constructor(){this.values={}}
  setProperty(key,value){this.values[key]=value}
}
class FakeElement{
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style=new FakeStyle();this.textContent='';this.className='';this.id='';this.parentNode=null;}
  append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node)}}
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

test('presentation state follows the approved intensity hierarchy',()=>{
  assert.equal(resolveIntensityPresentation({},20).mode,'calm');
  assert.equal(resolveIntensityPresentation({highDensity:true},35).mode,'pressure');
  assert.equal(resolveIntensityPresentation({breakActive:true},50).mode,'break');
  assert.equal(resolveIntensityPresentation({feverActive:true,breakActive:true},72).mode,'fever');
  assert.equal(resolveIntensityPresentation({limitBreakActive:true,feverActive:true},86).mode,'limit');
  assert.equal(resolveIntensityPresentation({bossFinalPhase:true,limitBreakActive:true},100).mode,'boss-final');
});

test('presentation intensity is normalized and clamped',()=>{
  assert.equal(resolveIntensityPresentation({},-20).strength,0);
  assert.equal(resolveIntensityPresentation({},50).strength,.5);
  assert.equal(resolveIntensityPresentation({},200).strength,1);
});

test('presentation precomputes cross-browser opacity and glow values',()=>{
  const view=resolveIntensityPresentation({limitBreakActive:true},50);
  assert.equal(view.edgeOpacity,0.14);
  assert.equal(view.vignetteOpacity,0.08);
  assert.equal(view.glowPx,64);
});

test('each climax mode uses a distinct semantic tone',()=>{
  const breakView=resolveIntensityPresentation({breakActive:true},50);
  const feverView=resolveIntensityPresentation({feverActive:true},72);
  const limitView=resolveIntensityPresentation({limitBreakActive:true},86);
  const bossView=resolveIntensityPresentation({bossFinalPhase:true},100);
  assert.notEqual(breakView.tone,feverView.tone);
  assert.notEqual(feverView.tone,limitView.tone);
  assert.notEqual(limitView.tone,bossView.tone);
});

test('all battlefield tone tokens are valid six-digit hex colors',()=>{
  const states=[
    {},{highDensity:true},{breakActive:true},{feverActive:true},
    {limitBreakActive:true},{bossFinalPhase:true}
  ];
  for(const state of states){
    const tone=resolveIntensityPresentation(state,80).tone;
    assert.match(tone,/^#[0-9a-f]{6}$/i);
  }
});

test('mounted overlay updates browser-safe CSS variables without calc multiplication',()=>{
  const document=fakeDocument();
  const parent=new FakeElement('div');
  const overlay=mountIntensityOverlay({document,parent});
  assert.ok(overlay);
  assert.equal(parent.children.length,1);
  assert.equal(overlay.host.dataset.mode,'calm');

  const view=overlay.update({state:{limitBreakActive:true},intensity:86});
  assert.equal(view.mode,'limit');
  assert.equal(overlay.host.dataset.mode,'limit');
  assert.equal(overlay.host.style.values['--premium-strength'],'0.86');
  assert.equal(overlay.host.style.values['--premium-tone'],view.tone);
  assert.equal(overlay.host.style.values['--premium-edge-opacity'],String(view.edgeOpacity));
  assert.equal(overlay.host.style.values['--premium-vignette-opacity'],String(view.vignetteOpacity));
  assert.equal(overlay.host.style.values['--premium-glow-size'],view.glowPx+'px');
  const css=document.head.children[0]?.textContent||'';
  assert.doesNotMatch(css,/var\(--premium-strength\)\s*\*/);

  overlay.destroy();
  assert.equal(parent.children.length,0);
});
