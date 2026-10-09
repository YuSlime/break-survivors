export function choiceCountFor(context={}){
  if(context.bossReward)return 5;
  if(context.breakActive)return 4;
  return 3;
}

function rankOf(state,id){
  return Math.max(0,Number(state?.ranks?.[id])||0);
}

export function eligibleUpgrades(pool=[],state={}){
  const exclusive=state?.exclusive||{};
  return pool.filter(upgrade=>{
    if(!upgrade?.id)return false;
    const maxRank=Math.max(1,Number(upgrade.maxRank)||1);
    if(rankOf(state,upgrade.id)>=maxRank)return false;
    if(upgrade.exclusiveGroup){
      const locked=exclusive[upgrade.exclusiveGroup];
      if(locked && locked!==upgrade.id)return false;
    }
    const requirements=Array.isArray(upgrade.requires)?upgrade.requires:[];
    if(requirements.some(id=>rankOf(state,id)<=0))return false;
    return true;
  });
}

export function applyUpgrade(state={},upgrade){
  if(!upgrade?.id)return state;
  const ranks={...(state.ranks||{})};
  const exclusive={...(state.exclusive||{})};
  const maxRank=Math.max(1,Number(upgrade.maxRank)||1);
  ranks[upgrade.id]=Math.min(maxRank,(Number(ranks[upgrade.id])||0)+1);
  if(upgrade.exclusiveGroup)exclusive[upgrade.exclusiveGroup]=upgrade.id;
  return {...state,ranks,exclusive};
}

export function buildUpgradeChoices(pool,state,options={}){
  const rng=typeof options.rng==='function'?options.rng:Math.random;
  const requested=Math.max(0,Math.floor(Number(options.count) || choiceCountFor(options.context||{})));
  const choices=eligibleUpgrades(pool,state).slice();
  for(let i=choices.length-1;i>0;i--){
    const raw=Number(rng());
    const unit=Number.isFinite(raw)?Math.max(0,Math.min(.999999999,raw)):0;
    const j=Math.floor(unit*(i+1));
    [choices[i],choices[j]]=[choices[j],choices[i]];
  }
  return choices.slice(0,requested);
}
