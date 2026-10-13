const STYLE_ID='premium-run-upgrade-draft-style';
const CSS=`
.premiumRunDraft{position:absolute;inset:0;z-index:37;display:none;place-items:center;padding:18px;background:radial-gradient(circle at 50% 44%,#182539d9 0,#070b13ef 56%,#020409fa 100%);backdrop-filter:blur(6px);pointer-events:auto;font-family:ui-monospace,"Cascadia Mono",Consolas,monospace}
.premiumRunDraft.show{display:grid;animation:runDraftIn .22s cubic-bezier(.18,.82,.22,1)}
.premiumRunDraftShell{width:min(1080px,97vw);padding:20px;border:1px solid #55d9ff66;background:linear-gradient(180deg,#101727f5,#070b13f7);box-shadow:0 28px 84px #000d,0 0 38px #42c8ff22,inset 0 1px #ffffff10;position:relative;overflow:hidden}
.premiumRunDraftShell::before{content:"";position:absolute;left:8%;right:8%;top:0;height:2px;background:linear-gradient(90deg,transparent,#54dfff,#ffbb53,#d76cff,transparent);box-shadow:0 0 18px #54dfff}
.premiumRunDraftEyebrow{text-align:center;font-size:8px;font-weight:1000;letter-spacing:.22em;color:#76dfff}
.premiumRunDraftTitle{margin:6px 0 3px;text-align:center;font-size:clamp(22px,3.5vw,38px);font-weight:1000;letter-spacing:.035em;color:#f8fbff;text-shadow:0 4px 24px #000,0 0 18px #4bdcff44}
.premiumRunDraftSub{text-align:center;font-size:9px;font-weight:1000;letter-spacing:.14em;color:#9fb9d5}
.premiumRunDraftCards{--choice-count:3;display:grid;grid-template-columns:repeat(var(--choice-count),minmax(0,1fr));gap:10px;margin-top:18px}
.premiumRunDraftCard{--tier:#7adfff;position:relative;min-height:174px;padding:16px 14px;text-align:left;border:1px solid color-mix(in srgb,var(--tier) 58%,#263145);border-radius:3px;background:linear-gradient(180deg,color-mix(in srgb,var(--tier) 8%,#101723),#080c14 70%);color:#fff;box-shadow:inset 0 1px #ffffff0d,0 10px 24px #0008;overflow:hidden;cursor:pointer;transition:transform .13s ease,filter .13s ease,border-color .13s ease}
.premiumRunDraftCard::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--tier);box-shadow:0 0 14px var(--tier)}
.premiumRunDraftCard:hover,.premiumRunDraftCard:focus-visible{transform:translateY(-4px);filter:brightness(1.13);border-color:var(--tier);outline:none}
.premiumRunDraftTier{display:block;font-size:8px;font-weight:1000;letter-spacing:.16em;color:var(--tier)}
.premiumRunDraftName{display:block;margin-top:12px;font-size:15px;line-height:1.08;font-weight:1000;letter-spacing:.02em}
.premiumRunDraftEffect{display:block;margin-top:10px;font-size:9px;line-height:1.55;color:#c9d6e8}
.premiumRunDraftRank{display:block;margin-top:15px;font-size:8px;font-weight:1000;letter-spacing:.11em;color:var(--tier)}
.premiumRunDraftFoot{margin-top:13px;text-align:center;font-size:8px;letter-spacing:.09em;color:#71839b}
@keyframes runDraftIn{0%{opacity:0;transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
@media(max-width:900px){.premiumRunDraftCards{grid-template-columns:repeat(2,minmax(0,1fr))}.premiumRunDraftCard{min-height:132px}}
@media(max-width:620px){.premiumRunDraft{padding:8px}.premiumRunDraftShell{padding:14px 10px;max-height:95dvh;overflow:auto}.premiumRunDraftCards{grid-template-columns:1fr;gap:7px;margin-top:12px}.premiumRunDraftCard{min-height:94px;padding:12px}.premiumRunDraftName{margin-top:7px;font-size:13px}.premiumRunDraftEffect{margin-top:6px}.premiumRunDraftRank{margin-top:7px}}
@media(prefers-reduced-motion:reduce){.premiumRunDraft.show{animation:none}.premiumRunDraftCard{transition:none}.premiumRunDraftCard:hover{transform:none}}
`;

const TIER_COLOR=Object.freeze({stat:'#70d7ff',modify:'#ffbb53',synergy:'#d66cff',evolution:'#ff657e'});

export function describeRunUpgrade(choice={}){
  const rank=Math.max(0,Number(choice.rank)||0);
  return `${choice.effect||'Run upgrade'} • Rank ${rank+1}`;
}

function ensureStyle(document){
  if(!document?.createElement)return null;
  const existing=document.getElementById?.(STYLE_ID);
  if(existing)return existing;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=CSS;document.head?.append?.(style);return style;
}

export function mountRunUpgradeDraft({document=globalThis.document,parent=null}={}){
  if(!document?.createElement||!parent?.append)return null;
  ensureStyle(document);
  const host=document.createElement('div');host.className='premiumRunDraft';
  const shell=document.createElement('div');shell.className='premiumRunDraftShell';
  const eyebrow=document.createElement('div');eyebrow.className='premiumRunDraftEyebrow';eyebrow.textContent='RUN EVOLUTION // BUILD FORGE';
  const title=document.createElement('div');title.className='premiumRunDraftTitle';title.textContent='SELECT UPGRADE';
  const sub=document.createElement('div');sub.className='premiumRunDraftSub';
  const cards=document.createElement('div');cards.className='premiumRunDraftCards';
  const foot=document.createElement('div');foot.className='premiumRunDraftFoot';foot.textContent='BATTLE PAUSED // THIS CHOICE LASTS FOR THE CURRENT RUN';
  shell.append(eyebrow,title,sub,cards,foot);host.append(shell);parent.append(host);

  let visible=false,locked=false;
  function hide(){visible=false;locked=false;host.classList?.remove?.('show')}
  function show(choices=[],context={},onChoose=()=>{}){
    if(!Array.isArray(choices)||choices.length===0){hide();return false}
    const list=choices.slice(0,5);
    locked=false;cards.replaceChildren?.();
    cards.style?.setProperty?.('--choice-count',String(Math.min(5,list.length)));
    const mode=context.mode==='boss'?'BOSS':context.mode==='break'?'BREAK':'STANDARD';
    sub.textContent=`${mode} DRAFT // ${list.length} CHOICES`;
    for(const choice of list){
      const tier=String(choice.tier||'stat').toLowerCase();
      const card=document.createElement('button');card.type='button';card.className='premiumRunDraftCard';
      card.style?.setProperty?.('--tier',TIER_COLOR[tier]||TIER_COLOR.stat);
      card.dataset.upgradeId=choice.id||'';card.dataset.tier=tier;
      const tierEl=document.createElement('span');tierEl.className='premiumRunDraftTier';tierEl.textContent=tier.toUpperCase();
      const name=document.createElement('span');name.className='premiumRunDraftName';name.textContent=choice.name||choice.id||'UPGRADE';
      const effect=document.createElement('span');effect.className='premiumRunDraftEffect';effect.textContent=choice.effect||'Run upgrade';
      const rank=document.createElement('span');rank.className='premiumRunDraftRank';rank.textContent=`TAKE // RANK ${Math.max(0,Number(choice.rank)||0)+1}`;
      card.append(tierEl,name,effect,rank);
      card.onclick=()=>{if(locked)return;locked=true;hide();onChoose(choice)};
      cards.append(card);
    }
    visible=true;host.classList?.add?.('show');return true;
  }
  function destroy(){hide();host.remove?.()}
  return {host,cards,sub,show,hide,destroy,get visible(){return visible}};
}
