const STYLE_ID='premium-boss-reward-style';
const CSS=`
.premiumBossRewardOverlay{position:absolute;inset:0;z-index:38;display:none;place-items:center;padding:22px;background:radial-gradient(circle at 50% 42%,#28183bd9 0,#070a12ee 52%,#020409fa 100%);backdrop-filter:blur(7px);pointer-events:auto;font-family:ui-monospace,"Cascadia Mono",Consolas,monospace}
.premiumBossRewardOverlay.show{display:grid;animation:bossRewardIn .28s cubic-bezier(.18,.82,.22,1)}
.premiumBossRewardShell{width:min(920px,96vw);padding:22px;border:1px solid #a76cff88;background:linear-gradient(180deg,#111528f2,#080b14f5);box-shadow:0 28px 80px #000d,0 0 42px #8b54ff33,inset 0 1px #ffffff12;position:relative;overflow:hidden}
.premiumBossRewardShell::before{content:"";position:absolute;left:8%;right:8%;top:0;height:2px;background:linear-gradient(90deg,transparent,#ffe17b,#c76cff,#ffe17b,transparent);box-shadow:0 0 18px #c76cff}
.premiumBossRewardEyebrow{text-align:center;font-size:9px;font-weight:1000;letter-spacing:.24em;color:#d6a8ff}
.premiumBossRewardTitle{margin:7px 0 3px;text-align:center;font-size:clamp(24px,4.2vw,45px);line-height:.92;letter-spacing:.04em;color:#fff;text-shadow:0 4px 26px #000,0 0 22px #a95cff66}
.premiumBossRewardSub{text-align:center;font-size:10px;font-weight:1000;letter-spacing:.16em;color:#ffd976}
.premiumBossRewardCards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}
.premiumBossRewardCard{--reward:#d8e7ff;position:relative;min-height:192px;padding:18px 15px 16px;text-align:left;border:1px solid color-mix(in srgb,var(--reward) 58%,#27324a);border-radius:4px;background:linear-gradient(180deg,color-mix(in srgb,var(--reward) 9%,#101624),#080d16 68%);color:#fff;box-shadow:inset 0 1px #ffffff10,0 12px 28px #0008;overflow:hidden;cursor:pointer;transition:transform .14s ease,filter .14s ease,border-color .14s ease}
.premiumBossRewardCard::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--reward);box-shadow:0 0 16px var(--reward)}
.premiumBossRewardCard::after{content:"";position:absolute;right:-28px;top:-28px;width:92px;height:92px;border:1px solid color-mix(in srgb,var(--reward) 28%,transparent);transform:rotate(45deg);opacity:.42}
.premiumBossRewardCard:hover,.premiumBossRewardCard:focus-visible{transform:translateY(-5px);filter:brightness(1.14);border-color:var(--reward);outline:none}
.premiumBossRewardRarity{display:block;font-size:8px;font-weight:1000;letter-spacing:.18em;color:var(--reward)}
.premiumBossRewardLabel{display:block;margin-top:14px;min-height:44px;font-size:17px;line-height:1.12;font-weight:1000;letter-spacing:.02em}
.premiumBossRewardDesc{display:block;margin-top:12px;font-size:10px;line-height:1.65;color:#c9d6e9}
.premiumBossRewardTake{display:block;margin-top:18px;font-size:8px;font-weight:1000;letter-spacing:.14em;color:var(--reward)}
.premiumBossRewardFoot{margin-top:14px;text-align:center;font-size:8px;letter-spacing:.08em;color:#7f91ac}
@keyframes bossRewardIn{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:scale(1)}}
@media(max-width:720px){.premiumBossRewardOverlay{padding:10px}.premiumBossRewardShell{padding:16px 12px;max-height:94dvh;overflow:auto}.premiumBossRewardCards{grid-template-columns:1fr;gap:8px;margin-top:14px}.premiumBossRewardCard{min-height:112px;padding:13px}.premiumBossRewardLabel{min-height:0;margin-top:8px;font-size:14px}.premiumBossRewardDesc{margin-top:7px}.premiumBossRewardTake{margin-top:9px}}
@media(prefers-reduced-motion:reduce){.premiumBossRewardOverlay.show{animation:none}.premiumBossRewardCard{transition:none}.premiumBossRewardCard:hover{transform:none}}
`;

const pct=value=>Math.round(Math.max(0,(Number(value)||1)-1)*100);

export function describeBossReward(choice={}){
  if(choice.category==='legendary'){
    const names={damageMul:'Damage',attackRateMul:'Attack Speed',areaMul:'Area',moveMul:'Move Speed'};
    return Object.entries(choice.effects||{}).map(([key,value])=>`${names[key]||key} +${pct(value)}%`).join(' • ')||'Permanent for this run';
  }
  if(choice.category==='resource')return `${Number(choice.coins||0).toLocaleString('en-US')} Coins • ${Number(choice.gems||0).toLocaleString('en-US')} Gems`;
  if(choice.category==='recovery')return `HP +${Math.round((Number(choice.healRatio)||0)*100)}% • ULT +${Math.round(Number(choice.ultGain)||0)}`;
  return 'Boss reward';
}

function ensureStyle(document){
  if(!document?.createElement)return null;
  const existing=document.getElementById?.(STYLE_ID);
  if(existing)return existing;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head?.append?.(style);return style;
}

export function mountBossRewardOverlay({document=globalThis.document,parent=null}={}){
  if(!document?.createElement||!parent?.append)return null;
  ensureStyle(document);

  const host=document.createElement('div');host.className='premiumBossRewardOverlay';
  const shell=document.createElement('div');shell.className='premiumBossRewardShell';
  const eyebrow=document.createElement('div');eyebrow.className='premiumBossRewardEyebrow';eyebrow.textContent='VOID TYRANT // CORE BREACH';
  const title=document.createElement('div');title.className='premiumBossRewardTitle';title.textContent='BOSS CORE SECURED';
  const sub=document.createElement('div');sub.className='premiumBossRewardSub';sub.textContent='CHOOSE ONE REWARD';
  const cards=document.createElement('div');cards.className='premiumBossRewardCards';
  const foot=document.createElement('div');foot.className='premiumBossRewardFoot';foot.textContent='BATTLE PAUSED // SELECT A CORE TO CONTINUE';
  shell.append(eyebrow,title,sub,cards,foot);host.append(shell);parent.append(host);

  let visible=false,locked=false;
  function hide(){visible=false;locked=false;host.classList?.remove?.('show')}
  function show(choices=[],onChoose=()=>{}){
    if(!Array.isArray(choices)||choices.length===0){hide();return}
    locked=false;cards.replaceChildren?.();
    for(const choice of choices.slice(0,3)){
      const card=document.createElement('button');card.type='button';card.className='premiumBossRewardCard';
      card.style?.setProperty?.('--reward',choice.color||'#d8e7ff');
      if(card.style&&!card.style.setProperty)card.style['--reward']=choice.color||'#d8e7ff';
      card.dataset.category=choice.category||'';card.dataset.rewardId=choice.id||'';
      const rarity=document.createElement('span');rarity.className='premiumBossRewardRarity';rarity.textContent=choice.rarity||'BOSS';
      const label=document.createElement('span');label.className='premiumBossRewardLabel';label.textContent=choice.label||choice.id||'REWARD';
      const desc=document.createElement('span');desc.className='premiumBossRewardDesc';desc.textContent=describeBossReward(choice);
      const take=document.createElement('span');take.className='premiumBossRewardTake';take.textContent='TAKE CORE  ›';
      card.append(rarity,label,desc,take);
      card.onclick=()=>{if(locked)return;locked=true;hide();onChoose(choice)};
      cards.append(card);
    }
    visible=true;host.classList?.add?.('show');
  }
  function destroy(){hide();host.remove?.()}
  return {host,cards,show,hide,destroy,get visible(){return visible}};
}
