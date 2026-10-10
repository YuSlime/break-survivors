// Guarded live-game integration for Premium Boss Chest rewards.
import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
let changed=false;

function replaceOnce(label,from,to,alreadyAppliedMarker=null){
  if(source.includes(to))return;
  if(alreadyAppliedMarker&&source.includes(alreadyAppliedMarker))return;
  const count=source.split(from).length-1;
  if(count!==1)throw new Error(`${label}: expected exactly one target, found ${count}`);
  source=source.replace(from,to);
  changed=true;
}

replaceOnce(
  'boss-reward-player-stats',
  `  const lbBuff=getLbRewardStatMultipliers();\n  damage*=lbBuff.damage;attackRate*=lbBuff.attackRate;move*=lbBuff.move;\n  return {`,
  `  const lbBuff=getLbRewardStatMultipliers();\n  damage*=lbBuff.damage;attackRate*=lbBuff.attackRate;move*=lbBuff.move;\n  const bossReward=window.BreakPremiumRuntime?.bossRewardState;\n  if(bossReward){\n    damage*=bossReward.damageMul||1;\n    attackRate*=bossReward.attackRateMul||1;\n    move*=bossReward.moveMul||1;\n    area*=bossReward.areaMul||1;\n  }\n  return {`
);

replaceOnce(
  'boss-reward-pause-simulation',
  `function update(dt,refreshHud=true){\n  if(!running) return;\n  if(!updateBreakRush(dt)){if(refreshHud)updateHud();return}`,
  `function update(dt,refreshHud=true){\n  if(!running) return;\n  if(window.BreakPremiumRuntime?.bossRewardOpen){if(refreshHud)updateHud();return}\n  if(!updateBreakRush(dt)){if(refreshHud)updateHud();return}`
);

replaceOnce(
  'boss-reward-result-handler',
  `function killEnemy(e,meta={}){`,
  `function applyPremiumBossRewardResult({choice,state}={}){\n  if(!choice||!state)return;\n  if(choice.category==='resource'){\n    save.coins+=choice.coins;runCoins+=choice.coins;\n    save.gems+=choice.gems;runGems+=choice.gems;\n    persistSoon();\n  }else if(choice.category==='recovery'){\n    if(Number.isFinite(state.hp))player.hp=state.hp;\n    if(Number.isFinite(state.ultCharge))ultCharge=state.ultCharge;\n  }\n  ps=playerStats();\n  player.hp=Math.min(player.hp,ps.maxHp);\n  showBreakCallout('BOSS CORE ACQUIRED',choice.label||'REWARD',choice.color||'#ffe16b');\n  updateHud();\n}\n\nfunction killEnemy(e,meta={}){`
);

replaceOnce(
  'boss-reward-open-on-kill',
  `  if(e.type==='boss'){\n    bossTimer=0;bossPending=false;playEventSfx('treasure_kill',.56,.88);\n  }`,
  `  if(e.type==='boss'){\n    bossTimer=0;bossPending=false;playEventSfx('treasure_kill',.56,.88);\n    window.BreakPremiumRuntime?.presentBossChest?.({\n      bossesDefeated:runBosses,\n      threat:threatLevel,\n      hp:player.hp,\n      maxHp:ps.maxHp,\n      ultCharge\n    },applyPremiumBossRewardResult);\n  }`,
  '// PREMIUM BOSS DEATH SEQUENCE V1'
);

if(changed){
  fs.writeFileSync(path,source);
  console.log('Premium boss reward integration applied.');
}else{
  console.log('Premium boss reward integration already present.');
}
