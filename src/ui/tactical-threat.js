import {getPremiumEnemyPressureScore} from '../data/enemies-premium.js';

const freeze=value=>Object.freeze(value);
const IDS=['support','assassin','summoner','shielder'];
const MARKERS=freeze({
  support:freeze({code:'SUP',color:'#5ff0b0'}),
  assassin:freeze({code:'ASN',color:'#ff5fa2'}),
  summoner:freeze({code:'SUM',color:'#b078ff'}),
  shielder:freeze({code:'SHD',color:'#62b8ff'})
});
const LEVEL_COLORS=freeze({clear:'#7b879d',alert:'#ffd56a',danger:'#ff965f',critical:'#ff5f6d'});

function cleanCounts(activeCounts={}){
  const result={};
  for(const id of IDS)result[id]=Math.max(0,Math.floor(Number(activeCounts?.[id])||0));
  return result;
}

export function getTacticalEnemyMarker(id){
  return MARKERS[String(id||'').toLowerCase()]||null;
}

export function buildTacticalThreatView({activeCounts={},eliteCount=0,bossActive=false}={}){
  const counts=cleanCounts(activeCounts);
  const elites=Math.max(0,Math.floor(Number(eliteCount)||0));
  const total=Object.values(counts).reduce((sum,value)=>sum+value,0);
  let pressure=elites*getPremiumEnemyPressureScore('elite')+(bossActive?4:0);
  for(const id of IDS)pressure+=counts[id]*getPremiumEnemyPressureScore(id);

  let level='clear';
  if(total>0||elites>0||bossActive){
    if(pressure>=9.5)level='critical';
    else if(pressure>=5)level='danger';
    else level='alert';
  }

  const roles=IDS.filter(id=>counts[id]>0)
    .map(id=>`${MARKERS[id].code} ${counts[id]}`)
    .join(' · ');

  return freeze({
    visible:total>0,
    level,
    color:LEVEL_COLORS[level],
    total,
    eliteCount:elites,
    bossActive:!!bossActive,
    pressure:Number(pressure.toFixed(2)),
    counts:freeze(counts),
    roles
  });
}

export function mountTacticalThreatHud({document,parent}={}){
  if(!document?.createElement||!parent?.appendChild)return null;
  const root=document.createElement('div');
  root.id='premiumTacticalThreatHud';
  root.style.cssText='position:absolute;right:14px;top:14px;z-index:12;display:none;min-width:160px;padding:8px 10px;border:1px solid #ffffff22;border-radius:10px;background:#080d17d9;box-shadow:0 8px 24px #0009;pointer-events:none;font:900 10px/1.25 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;backdrop-filter:blur(8px)';
  const title=document.createElement('div');
  const roles=document.createElement('div');
  title.style.cssText='font-size:10px;letter-spacing:.14em';
  roles.style.cssText='margin-top:4px;color:#dce8ff;font-size:9px;white-space:nowrap';
  root.appendChild(title);root.appendChild(roles);parent.appendChild(root);

  function update(input={}){
    const view=input?.level?input:buildTacticalThreatView(input);
    if(!view.visible){root.style.display='none';return view;}
    root.style.display='block';
    root.style.borderColor=`${view.color}88`;
    root.style.boxShadow=`0 8px 24px #0009,0 0 18px ${view.color}33`;
    title.textContent=`TACTICAL ${view.level.toUpperCase()}`;
    title.style.color=view.color;
    roles.textContent=view.roles||'TACTICAL CONTACT';
    return view;
  }

  function hide(){root.style.display='none'}
  return {root,update,hide};
}
