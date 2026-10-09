const MODE_TONES=Object.freeze({
  calm:'#6ee7ff',
  pressure:'#65cfff',
  break:'#ff9d42',
  fever:'#ff6bc8',
  limit:'#b66cff',
  'boss-final':'#ff4f78'
});

const STYLE_ID='premium-intensity-overlay-style';
const CSS=`
.premiumIntensityOverlay{--premium-strength:.2;--premium-tone:#6ee7ff;--premium-edge-opacity:.074;--premium-vignette-opacity:.032;--premium-glow-size:42px;position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;opacity:1;transition:filter .28s ease}
.premiumIntensityOverlay::before,.premiumIntensityOverlay::after{content:"";position:absolute;inset:0;pointer-events:none;transition:opacity .24s ease,box-shadow .24s ease,background .24s ease}
.premiumIntensityOverlay::before{opacity:var(--premium-edge-opacity);box-shadow:inset 0 0 var(--premium-glow-size) color-mix(in srgb,var(--premium-tone) 40%,transparent)}
.premiumIntensityOverlay::after{opacity:var(--premium-vignette-opacity);background:radial-gradient(circle at 50% 48%,transparent 34%,color-mix(in srgb,var(--premium-tone) 14%,transparent) 72%,color-mix(in srgb,var(--premium-tone) 26%,transparent) 100%);mix-blend-mode:screen}
.premiumIntensityOverlay[data-mode="calm"]::before{opacity:.02}.premiumIntensityOverlay[data-mode="pressure"]::before{opacity:.07}.premiumIntensityOverlay[data-mode="break"]::before{box-shadow:inset 0 0 var(--premium-glow-size) color-mix(in srgb,var(--premium-tone) 44%,transparent)}.premiumIntensityOverlay[data-mode="fever"]::after{background:radial-gradient(circle at 50% 48%,transparent 30%,color-mix(in srgb,var(--premium-tone) 17%,transparent) 70%,color-mix(in srgb,var(--premium-tone) 30%,transparent) 100%)}.premiumIntensityOverlay[data-mode="limit"]::before{box-shadow:inset 0 0 var(--premium-glow-size) color-mix(in srgb,var(--premium-tone) 45%,transparent),inset 0 0 0 1px color-mix(in srgb,var(--premium-tone) 50%,transparent)}.premiumIntensityOverlay[data-mode="boss-final"]::before{box-shadow:inset 0 0 var(--premium-glow-size) color-mix(in srgb,var(--premium-tone) 48%,transparent),inset 0 0 0 2px color-mix(in srgb,var(--premium-tone) 56%,transparent)}
@media(prefers-reduced-motion:reduce){.premiumIntensityOverlay,.premiumIntensityOverlay::before,.premiumIntensityOverlay::after{transition:none!important}}
`;

const clamp01=value=>Math.max(0,Math.min(1,(Number(value)||0)/100));
const round3=value=>Math.round(value*1000)/1000;

export function resolveIntensityPresentation(state={},intensity=20){
  let mode='calm';
  if(state.highDensity)mode='pressure';
  if(state.breakActive)mode='break';
  if(state.feverActive)mode='fever';
  if(state.limitBreakActive)mode='limit';
  if(state.bossFinalPhase)mode='boss-final';
  const strength=clamp01(intensity);
  return Object.freeze({
    mode,
    tone:MODE_TONES[mode],
    strength,
    edgeOpacity:round3(.03+strength*.22),
    vignetteOpacity:round3(strength*.16),
    glowPx:Math.round(28+72*strength)
  });
}

function applyView(host,view){
  host.dataset.mode=view.mode;
  host.style.setProperty?.('--premium-strength',String(view.strength));
  host.style.setProperty?.('--premium-tone',view.tone);
  host.style.setProperty?.('--premium-edge-opacity',String(view.edgeOpacity));
  host.style.setProperty?.('--premium-vignette-opacity',String(view.vignetteOpacity));
  host.style.setProperty?.('--premium-glow-size',view.glowPx+'px');
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
  applyView(host,resolveIntensityPresentation({},20));
  parent.append(host);

  function update({state={},intensity=20}={}){
    const view=resolveIntensityPresentation(state,intensity);
    applyView(host,view);
    return view;
  }

  function destroy(){host.remove?.()}
  return {host,update,destroy};
}
