const MODE_TONES=Object.freeze({
  calm:'#6ee7ff',
  pressure:'#65cfff',
  break:'#ff9d42',
  fever:'#ff6bc8',
  limit:'#b66cff',
  'boss-final':'ff4f78'
});

const STYLE_ID='premium-intensity-overlay-style';
const CSS=`
.premiumIntensityOverlay{--premium-strength:.2;--premium-tone:#6ee7ff;position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:1;transition:filter .28s ease}
.premiumIntensityOverlay::before,.premiumIntensityOverlay::after{content:"";position:absolute;inset:0;pointer-events:none;transition:opacity .24s ease,box-shadow .24s ease,background .24s ease}
.premiumIntensityOverlay::before{opacity:calc(.03 + var(--premium-strength)*.22);box-shadow:inset 0 0 calc(28px + 72px*var(--premium-strength)) color-mix(in srgb,var(--premium-tone) calc(24% + 28%*var(--premium-strength)),transparent)}
.premiumIntensityOverlay::after{opacity:calc(var(--premium-strength)*.16);background:radial-gradient(circle at 50% 48%,transparent 34%,color-mix(in srgb,var(--premium-tone) 14%,transparent) 72%,color-mix(in srgb,var(--premium-tone) 26%,transparent) 100%);mix-blend-mode:screen}
.premiumIntensityOverlay[data-mode="calm"]::before{opacity:.02}.premiumIntensityOverlay[data-mode="pressure"]::before{opacity:.07}.premiumIntensityOverlay[data-mode="break"]::before{opacity:calc(.08 + var(--premium-strength)*.18)}.premiumIntensityOverlay[data-mode="fever"]::after{opacity:calc(.05 + var(--premium-strength)*.18)}.premiumIntensityOverlay[data-mode="limit"]::before{box-shadow:inset 0 0 calc(60px + 85px*var(--premium-strength)) color-mix(in srgb,var(--premium-tone) 45%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--premium-tone) 50%,transparent)}.premiumIntensityOverlay[data-mode="boss-final"]::before{box-shadow:inset 0 0 calc(75px + 100px*var(--premium-strength)) color-mix(in srgb,var(--premium-tone) 48%,transparent),inset 0 0 0 2px color-mix(in srgb,var(--premium-tone) 56%,transparent)}
@media(prefers-reduced-motion:reduce){.premiumIntensityOverlay,.premiumIntensityOverlay::before,.premiumIntensityOverlay::after{transition:none!important}}
`;

const clamp01=value=>Math.max(0,Math.min(1,(Number(value)||0)/100));

export function resolveIntensityPresentation(state={},intensity=20){
  let mode='calm';
  if(state.highDensity)mode='pressure';
  if(state.breakActive)mode='break';
  if(state.feverActive)mode='fever';
  if(state.limitBreakActive)mode='limit';
  if(state.bossFinalPhase)mode='boss-final';
  return Object.freeze({mode,tone:MODE_TONES[mode],strength:clamp01(intensity)});
}

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

export function mountIntensityOverlay({document=globalThis.document,parent=null}={}){
  if(!document?.createElement||!parent?.append)return null;
  ensureStyle(document);
  const host=document.createElement('div');
  host.className='premiumIntensityOverlay';
  host.dataset.mode='calm';
  host.style.setProperty?.('--premium-strength','0.2');
  host.style.setProperty?.('--premium-tone',MODE_TONES.calm);
  parent.append(host);

  function update({state={},intensity=20}={}){
    const view=resolveIntensityPresentation(state,intensity);
    host.dataset.mode=view.mode;
    host.style.setProperty?.('--premium-strength',String(view.strength));
    host.style.setProperty?.('--premium-tone',view.tone);
    return view;
  }

  function destroy(){host.remove?.()}
  return {host,update,destroy};
}
