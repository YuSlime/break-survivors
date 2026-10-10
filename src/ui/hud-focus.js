const HUD_KEYS=Object.freeze(['break','threat','event','boss','limit']);
const ELEMENT_IDS=Object.freeze({
  break:'breakHud',
  threat:'threatHud',
  event:'eventHud',
  boss:'bossHud',
  limit:'lbEventHud'
});

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

  // Major states stay readable even when something stronger takes focus.
  if(active.limit&&focus!=='limit')roles.limit='secondary';
  if(active.boss&&focus!=='boss')roles.boss='secondary';
  if(active.break&&focus!=='break')roles.break='secondary';

  // During calm gameplay the baseline BREAK meter remains unobtrusive rather than suppressed.
  if(focus==='calm')roles.break='secondary';

  return Object.freeze({
    focus,
    variant:state.bossFinalPhase?'boss-final':state.feverActive?'fever':focus,
    roles:Object.freeze({...roles}),
    active:Object.freeze({...active})
  });
}

export function createHudFocusController({document=globalThis.document}={}){
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

  return {update,reset,elements};
}
