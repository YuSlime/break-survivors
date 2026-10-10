const freeze=value=>Object.freeze(value);
const CUES=freeze({
  charge:'fever-charge',
  burst:'fever-burst',
  release:'fever-release'
});

export function buildFeverTransition({reducedMotion=false}={}){
  return freeze({
    prechargeMs:reducedMotion?60:110,
    burstHoldMs:reducedMotion?200:360,
    releaseMs:reducedMotion?240:420,
    particleCount:reducedMotion?14:30,
    ringScale:reducedMotion?1.55:2.10,
    ringLife:reducedMotion?.28:.46,
    cues:CUES
  });
}
