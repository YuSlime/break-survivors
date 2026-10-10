const HUD_KEYS=Object.freeze(['break','threat','event','boss','limit']);
const ELEMENT_IDS=Object.freeze({
  break:'breakHud',
  threat:'threatHud',
  event:'eventHud',
  boss:'bossHud',
  limit:'lbEventHud'
});
const STYLE_ID='premium-hud-focus-style';
const HUD_SELECTOR=':is(#breakHud,#threatHud,#eventHud,#bossHud,#lbEventHud)';
const CSS=`
${HUD_SELECTOR}[data-premium-hud-role]{
  transform-origin:50% 0%;
  transition:opacity .22s ease,filter .22s ease,transform .22s ease;
  will-change:opacity,transform;
}
${HUD_SELECTOR}[data-premium-hud-role="focus"]{
  opacity:1!important;
  filter:none!important;
  transform:translateX(-50%) scale(1)!important;
  z-index:13!important;
}
${HUD_SELECTOR}[data-premium-hud-role="secondary"]{
  opacity:.62!important;
  filter:saturate(.78) brightness(.92)!important;
  transform:translateX(-50%) scale(.92)!important;
  z-index:8!important;
}
${HUD_SELECTOR}[data-premium-hud-role="quiet"]{
  opacity:.14!important;
  filter:saturate(.42) brightness(.72)!important;
  transform:translateX(-50%) scale(.84)!important;
  z-index:3!important;
}
${HUD_SELECTOR}[data-premium-hud-variant="fever"][data-premium-hud-role="focus"]{
  filter:brightness(1.08) saturate(1.10)!important;
}
${HUD_SELECTOR}[data-premium-hud-variant="boss-final"][data-premium-hud-role="focus"]{
  filter:brightness(1.10) saturate(1.16) drop-shadow(0 0 12px #ff4f7866)!important;
  transform:translateX(-50%) scale(1.025)!important;
}
@media(max-width:520px){
  ${HUD_SELECTOR}[data-premium-hud-role="secondary"]{transform:translateX(-50%) scale(.95)!important;opacity:.66!important}
  ${HUD_SELECTOR}[data-premium-hud-role="quiet"]{transform:translateX(-50%) scale(.90)!important;opacity:.12!important}
}
@media(prefers-reduced-motion:reduce){
  ${HUD_SELECTOR}[data-premium-hud-role]{transition:none!important}
}
`;

function ensureStyle(document){
  if(!document?.createElement)return null;
  const existing=document.getElementById?.(STYLE_ID);
  if(existing)return existing;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=CSS;
  document.head?.append?.(style);
  return style;
}

function activeMap(state={}){
  return {
    break:!!(state.breakActive||state.feverActive),
    threat:!!state.threatActive,
    event:!!state.eventActive,
    boss:!!state.bossActive,
    limit:!!state.lbEventActive
  };
}

export function resolveHudFocus(state={}){
  const active=activeMap(state);
  let focus='calm';
  if(active.threat)focus='threat';
  if(active.break)focus='break';
  if(active.event)focus='event';
  if(active.boss)focus='boss';
  if(active.limit)focus='limit';
  if(state.bossFinalPhase&&active.boss)focus='boss';

  const roles={break:'quiet',threat:'quiet',event:'quiet',boss:'quiet',limit:'quiet'};
  if(focus!=='calm')roles[focus]='focus';

  // Major concurrent states stay visible but stop competing with the current focus.
  if(active.limit&&focus!=='limit')roles.limit='secondary';
  if(active.boss&&focus!=='boss')roles.boss='secondary';
  if(active.break&&focus!=='break')roles.break='secondary';

  // BREAK remains a subtle baseline meter during calm play.
  if(focus==='calm')roles.break='secondary';

  return Object.freeze({
    focus,
    variant:state.bossFinalPhase?'boss-final':state.feverActive?'fever':focus,
    roles:Object.freeze({...roles}),
    active:Object.freeze({...active})
  });
}

export function createHudFocusController({document=globalThis.document}={}){
  const style=ensureStyle(document);
  const elements={};
  for(const key of HUD_KEYS)elements[key]=document?.getElementById?.(ELEMENT_IDS[key])||null;

  function update(state={}){
    const view=resolveHudFocus(state);
    for(const key of HUD_KEYS){
      const el=elements[key];
      if(!el?.dataset)continue;
      el.dataset.premiumHudRole=view.roles[key];
      el.dataset.premiumHudFocus=view.focus;
      el.dataset.premiumHudVariant=view.variant;
    }
    return view;
  }

  function reset(){
    for(const key of HUD_KEYS){
      const el=elements[key];
      if(!el?.dataset)continue;
      delete el.dataset.premiumHudRole;
      delete el.dataset.premiumHudFocus;
      delete el.dataset.premiumHudVariant;
    }
  }

  return {update,reset,elements,style};
}
