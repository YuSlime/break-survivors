import test from 'node:test';
import assert from 'node:assert/strict';
import {createPremiumRuntime} from '../src/game/premium-runtime.js';

function fakeRewardUi(){
  let shown=null,callback=null,hidden=0;
  return {
    show(choices,onChoose){shown=choices;callback=onChoose},
    hide(){hidden++},
    choose(index){callback?.(shown[index])},
    get shown(){return shown},
    get hidden(){return hidden}
  };
}

test('presentBossChest owns the reward selection lifecycle when boss V2 is enabled',()=>{
  const ui=fakeRewardUi();
  const runtime=createPremiumRuntime({flags:{bossV2:true},bossRewardUi:ui});
  let resolved=null;
  const opened=runtime.presentBossChest({bossesDefeated:2,threat:4,rolls:[0,.5,.5],hp:55,maxHp:100,ultCharge:20},payload=>{resolved=payload});
  assert.equal(opened,true);
  assert.equal(runtime.bossRewardOpen,true);
  assert.equal(ui.shown.length,3);

  ui.choose(1);
  assert.equal(runtime.bossRewardOpen,false);
  assert.equal(resolved.choice.category,'resource');
  assert.ok(resolved.state.resourceDelta.coins>0);
});

test('presentBossChest is a no-op without boss V2 or without a mounted reward UI',()=>{
  const disabled=createPremiumRuntime({flags:{bossV2:false},bossRewardUi:fakeRewardUi()});
  assert.equal(disabled.presentBossChest({},()=>{}),false);
  assert.equal(disabled.bossRewardOpen,false);

  const noUi=createPremiumRuntime({flags:{bossV2:true}});
  assert.equal(noUi.presentBossChest({},()=>{}),false);
});

test('reset closes any open boss chest and clears open state',()=>{
  const ui=fakeRewardUi();
  const runtime=createPremiumRuntime({flags:{bossV2:true},bossRewardUi:ui});
  runtime.presentBossChest({rolls:[0,0,0]},()=>{});
  assert.equal(runtime.bossRewardOpen,true);
  runtime.reset();
  assert.equal(runtime.bossRewardOpen,false);
  assert.ok(ui.hidden>=1);
});
