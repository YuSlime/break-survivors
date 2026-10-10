// Canonicalizes Premium frame state and removes accidental duplicate declarations.
import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const signature='function premiumFrameState()';

function findFunctionRanges(text,name){
  const ranges=[];
  let cursor=0;
  while(true){
    const start=text.indexOf(name,cursor);
    if(start<0)break;
    const open=text.indexOf('{',start+name.length);
    if(open<0)throw new Error('premiumFrameState: missing opening brace');
    let depth=0,end=-1;
    for(let i=open;i<text.length;i++){
      const ch=text[i];
      if(ch==='{')depth++;
      else if(ch==='}'){
        depth--;
        if(depth===0){end=i+1;break}
      }
    }
    if(end<0)throw new Error('premiumFrameState: unterminated function');
    ranges.push({start,end});
    cursor=end;
  }
  return ranges;
}

const canonical=`function premiumFrameState(){
  const activeEnemies=enemies.filter(e=>!e.dead);
  const boss=activeEnemies.find(e=>e.type==='boss')||null;
  const premiumTacticalCounts={support:0,assassin:0,summoner:0,shielder:0};
  let premiumEliteCount=0;
  for(const enemy of activeEnemies){
    if(enemy.type==='elite')premiumEliteCount++;
    if(enemy.premiumDef&&premiumTacticalCounts[enemy.type]!==undefined)premiumTacticalCounts[enemy.type]++;
  }
  return {
    highDensity:activeEnemies.length>=45,
    breakActive:breakCombo>=10,
    eliteActive:premiumEliteCount>0,
    feverActive:feverActive(),
    limitBreakActive:limitBreakLevel>0||!!lbEventState,
    bossActive:!!boss,
    lbEventActive:!!lbEventState,
    eventActive:!!activeEvent,
    threatActive:threatLevel>0,
    bossFinalPhase:!!(boss&&boss.maxHp>0&&boss.hp/boss.maxHp<=.15),
    activeTacticalCounts:premiumTacticalCounts,
    eliteCount:premiumEliteCount,
    characterId:currentCharacter.id,
    characterLevel:charLevel(currentCharacter.id),
    gunnerMomentum,
    attackCounters
  };
}`;

const ranges=findFunctionRanges(source,signature);
if(ranges.length===0)throw new Error('premiumFrameState: expected at least one declaration');

let next=source;
for(let i=ranges.length-1;i>=0;i--){
  const range=ranges[i];
  if(i===0)next=next.slice(0,range.start)+canonical+next.slice(range.end);
  else next=next.slice(0,range.start)+next.slice(range.end);
}

if(next!==source){
  fs.writeFileSync(path,next);
  console.log(`Premium frame state canonicalized (${ranges.length} -> 1).`);
}else{
  console.log('Premium frame state already canonical.');
}
