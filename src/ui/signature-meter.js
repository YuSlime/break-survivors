import {PREMIUM_CHARACTERS} from '../data/characters-premium.js';

const SIGNATURE_COLORS=Object.freeze({
  gunner:'#78edff',
  bombcat:'#ffb24a',
  thunderfox:'#a9f5ff',
  blademaster:'#e9efff',
  nova:'#70ffff',
  missilequeen:'#ffd66b'
});

const DEFAULT_CYCLES=Object.freeze({
  bombcat:4,
  thunderfox:4,
  blademaster:3,
  nova:4,
  missilequeen:3
});

const FALLBACK_DEFINITION=Object.freeze({
  id:'unknown',
  label:'CORE',
  identity:'generic',
  evolution:'',
  color:'#9fb0c9'
});

const STYLE_ID='premium-signature-meter-style';
const HUD_CSS=`
.premiumSignatureMeter{--signature-color:#78edff;position:absolute;left:16px;bottom:18px;z-index:8;width:min(230px,34vw);padding:9px 11px 10px;border:1px solid color-mix(in srgb,var(--signature-color) 34%,#334158);border-radius:12px;background:linear-gradient(180deg,#09111dde,#070c15e8);box-shadow:0 10px 30px #0008,inset 0 1px #ffffff0c;backdrop-filter:blur(10px);pointer-events:none;transition:border-color .16s ease,box-shadow .16s ease,transform .16s ease}
.premiumSignatureMeter__top{display:flex;align-items:end;justify-content:space-between;gap:12px}.premiumSignatureMeter__label{font:900 8px/1 ui-monospace,Consolas,monospace;letter-spacing:.15em;color:var(--signature-color)}.premiumSignatureMeter__value{font:900 10px/1 ui-monospace,Consolas,monospace;color:#edf8ff;font-variant-numeric:tabular-nums}.premiumSignatureMeter__track{height:5px;margin-top:7px;overflow:hidden;border-radius:99px;background:#17202c;box-shadow:inset 0 1px 2px #000a}.premiumSignatureMeter__fill{height:100%;width:0;border-radius:inherit;background:var(--signature-color);box-shadow:0 0 12px color-mix(in srgb,var(--signature-color) 70%,transparent);transition:width .09s linear}.premiumSignatureMeter__evolution{margin-top:5px;font:800 6px/1 ui-monospace,Consolas,monospace;letter-spacing:.11em;color:#66758a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.premiumSignatureMeter[data-state="charged"]{border-color:color-mix(in srgb,var(--signature-color) 64%,#ffffff22);box-shadow:0 10px 30px #0008,0 0 18px color-mix(in srgb,var(--signature-color) 20%,transparent)}.premiumSignatureMeter[data-state="full"]{transform:translateY(-1px);border-color:var(--signature-color);box-shadow:0 10px 30px #0008,0 0 24px color-mix(in srgb,var(--signature-color) 42%,transparent)}
@media(max-width:520px){.premiumSignatureMeter{left:132px;bottom:calc(15px + env(safe-area-inset-bottom));width:min(158px,40vw);padding:7px 8px}.premiumSignatureMeter__evolution{display:none}.premiumSignatureMeter__label{font-size:6px}.premiumSignatureMeter__value{font-size:8px}}
@media(prefers-reduced-motion:reduce){.premiumSignatureMeter,.premiumSignatureMeter__fill{transition:none!important}}
`;

const clampPercent=value=>Math.max(0,Math.min(100,Number(value)||0));

export function getSignatureMeterDefinition(characterId){
  const id=String(characterId||'').toLowerCase();
  const character=PREMIUM_CHARACTERS[id];
  if(!character)return FALLBACK_DEFINITION;
  return Object.freeze({
    id,
    label:character.meter,
    identity:character.identity,
    evolution:character.evolution,
    color:SIGNATURE_COLORS[id]||FALLBACK_DEFINITION.color
  });
}

export function getSignatureMeterValue(characterId,{gunnerMomentum=0,attackCounters={},characterLevel=1}={}){
  const id=String(characterId||'').toLowerCase();
  if(id==='gunner')return clampPercent(gunnerMomentum);
  if(!PREMIUM_CHARACTERS[id])return 0;

  let cycle=DEFAULT_CYCLES[id]||4;
  if(id==='blademaster'&&Number(characterLevel)>=50)cycle=5;

  const count=Math.max(0,Math.floor(Number(attackCounters?.[id])||0));
  if(count===0)return 0;
  const step=((count-1)%cycle)+1;
  return clampPercent(Math.round(step/cycle*100));
}

export function createSignatureMeterViewModel({characterId,value=0}={}){
  const definition=getSignatureMeterDefinition(characterId);
  const percent=Math.round(clampPercent(value));
  const state=percent>=100?'full':percent>=80?'charged':'idle';
  return Object.freeze({
    ...definition,
    percent,
    state,
    valueText:`${percent}%`
  });
}

function ensureHudStyle(document){
  if(!document?.createElement)return null;
  const existing=document.getElementById?.(STYLE_ID);
  if(existing)return existing;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=HUD_CSS;
  document.head?.append?.(style);
  return style;
}

export function mountSignatureMeterHud({document=globalThis.document,parent=null}={}){
  if(!document?.createElement||!parent?.append)return null;
  ensureHudStyle(document);

  const host=document.createElement('div');
  host.className='premiumSignatureMeter';
  host.dataset.state='idle';
  host.dataset.character='unknown';

  const top=document.createElement('div');top.className='premiumSignatureMeter__top';
  const label=document.createElement('span');label.className='premiumSignatureMeter__label';label.textContent='CORE';
  const value=document.createElement('b');value.className='premiumSignatureMeter__value';value.textContent='0%';
  top.append(label,value);

  const track=document.createElement('div');track.className='premiumSignatureMeter__track';
  const fill=document.createElement('i');fill.className='premiumSignatureMeter__fill';fill.style.width='0%';
  track.append(fill);

  const evolution=document.createElement('div');evolution.className='premiumSignatureMeter__evolution';evolution.textContent='';
  host.append(top,track,evolution);
  parent.append(host);

  function update(snapshot={}){
    const vm=createSignatureMeterViewModel({characterId:snapshot.characterId,value:snapshot.signatureMeter});
    host.dataset.state=vm.state;
    host.dataset.character=vm.id;
    host.style.setProperty?.('--signature-color',vm.color);
    label.textContent=vm.label;
    value.textContent=vm.valueText;
    fill.style.width=`${vm.percent}%`;
    evolution.textContent=vm.evolution?`EVOLUTION // ${vm.evolution}`:'';
    return vm;
  }

  function destroy(){host.remove?.()}

  return {host,label,value,fill,evolution,update,destroy};
}
