const freeze=value=>Object.freeze(value);

const TACTICAL=freeze({
  support:freeze({code:'SUP',color:'#5ff0b0'}),
  assassin:freeze({code:'ASN',color:'#ff5fa2'}),
  summoner:freeze({code:'SUM',color:'#b078ff'}),
  shielder:freeze({code:'SHD',color:'#62b8ff'})
});

export function resolveCombatFeedback({event='hit',enemyType='normal',critical=false}={}){
  const type=String(enemyType||'normal').toLowerCase();

  if(event==='hit'){
    if(!critical)return null;
    return freeze({
      event:'critical',
      cameraSignal:'critical',
      audioCue:'critical',
      priority:3,
      color:'#fff08b',
      label:'CRITICAL',
      rewardLabel:null,
      particleCount:4,
      ringScale:1.35,
      ringLife:.13
    });
  }

  if(event!=='kill')return null;

  if(type==='elite'){
    return freeze({
      event:'eliteKill',
      cameraSignal:'eliteKill',
      audioCue:'elite-kill',
      priority:4,
      color:'#ffb75f',
      label:'ELITE BREAK',
      rewardLabel:'ELITE LOOT BURST',
      particleCount:16,
      ringScale:2.5,
      ringLife:.32
    });
  }

  const tactical=TACTICAL[type];
  if(!tactical)return null;
  return freeze({
    event:'tacticalKill',
    cameraSignal:'tacticalKill',
    audioCue:`tactical-${type}`,
    priority:3,
    color:tactical.color,
    label:`${tactical.code} DOWN`,
    rewardLabel:'TACTICAL LOOT',
    particleCount:10,
    ringScale:1.9,
    ringLife:.24
  });
}
