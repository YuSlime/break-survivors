import fs from 'node:fs';

const path=new URL('../index.html',import.meta.url);
let source=fs.readFileSync(path,'utf8');
const marker='PREMIUM STAGE TRANSITION V1';

if(source.includes(marker)){
  console.log('Premium stage transition already integrated');
  process.exit(0);
}

const from=`    const previousLb=limitBreakLevel;
    queueLimitBreakEvents(previousLb,state.limitBreak);
    limitBreakLevel=state.limitBreak;
    threatFlash=Math.max(threatFlash,.62);
    showBreakCallout('LIMIT BREAK '+limitBreakLevel,'DENSITY ×'+state.densityMul.toFixed(2)+'  •  REWARD ×'+state.rewardMul.toFixed(2),'#e86cff');`;

const to=`    const previousLb=limitBreakLevel;
    /* PREMIUM STAGE TRANSITION V1 */
    const premiumStageShift=window.BreakPremiumRuntime?.getStageTransitionCue?.({fromLimitBreak:previousLb,toLimitBreak:state.limitBreak});
    queueLimitBreakEvents(previousLb,state.limitBreak);
    limitBreakLevel=state.limitBreak;
    threatFlash=Math.max(threatFlash,.62);
    showBreakCallout('LIMIT BREAK '+limitBreakLevel,'DENSITY ×'+state.densityMul.toFixed(2)+'  •  REWARD ×'+state.rewardMul.toFixed(2),'#e86cff');
    if(premiumStageShift){
      const expectedLb=limitBreakLevel;
      setTimeout(()=>{
        if(!running||limitBreakLevel<expectedLb)return;
        playLbEventCue('phase',.72);
        showBreakCallout('SECTOR SHIFT',premiumStageShift.stageName,premiumStageShift.color);
      },premiumStageShift.delayMs);
    }`;

const count=source.split(from).length-1;
if(count!==1)throw new Error(`stage-transition-progression: expected exactly one target, found ${count}`);
source=source.replace(from,to);
fs.writeFileSync(path,source);
console.log('Applied Premium SECTOR SHIFT integration');
