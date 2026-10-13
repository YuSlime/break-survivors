import {installRunBuildController} from './run-build-controller.js';

let attempts=0;
const MAX_ATTEMPTS=120;

function boot(){
  if(typeof window==='undefined'||typeof document==='undefined')return null;
  if(window.BreakRunBuild)return window.BreakRunBuild;
  const runtime=window.BreakPremiumRuntime;
  if(runtime){
    if(!runtime.flags?.upgradeSystemV2)return null;
    return installRunBuildController({runtime,document,parent:document.getElementById('gameWrap')});
  }
  if(attempts++<MAX_ATTEMPTS){
    const schedule=typeof requestAnimationFrame==='function'?requestAnimationFrame:(fn=>setTimeout(fn,16));
    schedule(boot);
  }
  return null;
}

boot();
export {boot as bootRunBuildBrowser};
