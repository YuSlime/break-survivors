import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='// PREMIUM BOSS DEATH SEQUENCE V1';

if(source.includes(marker)){
  console.log('Premium boss death sequence already integrated');
  process.exit(0);
}

function replaceOnce(label,from,to){
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
}

replaceOnce(
  'boss-death-audio-gates',
  `    critical:72,'elite-kill':170,\n    'death-runner':105,'death-tank':180,`,
  `    critical:72,'elite-kill':170,\n    'death-runner':105,'death-tank':180,\n    'boss-fracture':260,'boss-core':320,'boss-rupture':520,`
);

replaceOnce(
  'boss-death-audio-cues',
  `  }else if(cue==='death-tank'){\n    oscTone(86,.15,'sine',.030,48);\n    noiseBurst(.10,.014,'lowpass',420,.012);\n  }else if(cue==='elite-kill'){`,
  `  }else if(cue==='death-tank'){\n    oscTone(86,.15,'sine',.030,48);\n    noiseBurst(.10,.014,'lowpass',420,.012);\n  }else if(cue==='boss-fracture'){\n    noiseBurst(.07,.018,'bandpass',1200);\n    oscTone(220,.08,'triangle',.012,420,.01);\n  }else if(cue==='boss-core'){\n    oscTone(105,.18,'sine',.032,62);\n    metallicPing(720,.012,.045);\n  }else if(cue==='boss-rupture'){\n    oscTone(68,.28,'sine',.050,38);\n    noiseBurst(.15,.028,'highpass',1900,.025);\n    oscTone(340,.16,'triangle',.018,680,.04);\n  }else if(cue==='elite-kill'){`
);

const helperAnchor=`function killEnemy(e,meta={}){`;
const helper=`// PREMIUM BOSS DEATH SEQUENCE V1
function playPremiumBossDeathSequence(e,sequence,onComplete){
  if(!sequence?.stages?.length){onComplete?.();return}
  const x=e.x,y=e.y,r=e.r,color=e.color;
  player.hitCd=Math.max(player.hitCd,sequence.playerGuardMs/1000);

  for(const stage of sequence.stages){
    setTimeout(()=>{
      if(!running)return;
      playPremiumCombatFeedbackSfx(stage.cue);

      const ringCount=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,5)??1;
      if(ringCount>0)rings.push({
        x,y,r:Math.max(5,r*.14),max:r*stage.ringScale,
        life:stage.ringLife,total:stage.ringLife,color:stage.color
      });

      const burst=window.BreakPremiumRuntime?.allowVfxCount?.('particles',stage.particleCount,5)??stage.particleCount;
      for(let i=0;i<burst;i++){
        const a=(i/Math.max(1,burst))*Math.PI*2+rnd(-.18,.18);
        const speed=rnd(stage.speedMin,stage.speedMax);
        const stageColor=stage.id==='fracture'?(i%3===0?'#ffffff':color):stage.id==='core'?(i%3===0?'#ffffff':stage.color):(i%4===0?'#ffffff':stage.color);
        particles.push({
          x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,
          life:rnd(stage.ringLife*.55,stage.ringLife*1.22),
          size:rnd(stage.sizeMin,stage.sizeMax),color:stageColor
        });
      }

      if(stage.id==='core'){
        const coreRings=window.BreakPremiumRuntime?.allowVfxCount?.('rings',1,5)??1;
        if(coreRings>0)rings.push({x,y,r:3,max:r*1.18,life:.24,total:.24,color:'#fffbe8'});
      }

      if(stage.lootBurst){
        playEventSfx('treasure_kill',.58,.92);
        showBreakCallout('VOID TYRANT PURGED','CORE RUPTURE // LOOT BURST','#ffe16b');
      }
    },stage.atMs);
  }

  setTimeout(()=>{
    if(!running)return;
    onComplete?.();
  },sequence.chestDelayMs);
}

function killEnemy(e,meta={}){`;
replaceOnce('boss-death-helper',helperAnchor,helper);

const bossFrom=`  if(e.type==='boss'){
    bossTimer=0;bossPending=false;playEventSfx('treasure_kill',.56,.88);
    window.BreakPremiumRuntime?.presentBossChest?.({
      bossesDefeated:runBosses,
      threat:threatLevel,
      hp:player.hp,
      maxHp:ps.maxHp,
      ultCharge
    },applyPremiumBossRewardResult);
  }`;

const bossTo=`  if(e.type==='boss'){
    bossTimer=0;bossPending=false;
    const presentPremiumBossChest=()=>window.BreakPremiumRuntime?.presentBossChest?.({
      bossesDefeated:runBosses,
      threat:threatLevel,
      hp:player.hp,
      maxHp:ps.maxHp,
      ultCharge
    },applyPremiumBossRewardResult);
    const premiumBossDeathSequence=window.BreakPremiumRuntime?.getBossDeathSequence?.();
    if(premiumBossDeathSequence){
      playPremiumBossDeathSequence(e,premiumBossDeathSequence,presentPremiumBossChest);
    }else{
      playEventSfx('treasure_kill',.56,.88);
      presentPremiumBossChest();
    }
  }`;
replaceOnce('boss-death-reward-delay',bossFrom,bossTo);

fs.writeFileSync(path,source);
console.log('Applied Premium boss death sequence integration');
