export const DEFAULT_FEATURE_FLAGS=Object.freeze({
  intensityDirector:false,
  cameraDirector:false,
  vfxDirector:false,
  premiumHud:false,
  encounterDirector:false,
  audioDirector:false,
  combatV2:false,
  bossV2:false,
  limitBreakV2:false,
  saveV2:false
});

export function resolveFeatureFlags(overrides={}){
  const resolved={...DEFAULT_FEATURE_FLAGS};
  for(const key of Object.keys(resolved)){
    if(typeof overrides[key]==='boolean')resolved[key]=overrides[key];
  }
  return Object.freeze(resolved);
}
