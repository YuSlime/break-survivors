const u=(id,tier,name,effect,extra={})=>Object.freeze({id,tier,name,effect,maxRank:1,...extra});

export const PREMIUM_UPGRADES=Object.freeze({
  gunner:Object.freeze([
    u('gunner-calibration','stat','CALIBRATION','Damage +12%',{maxRank:3}),
    u('gunner-ricochet','modify','RICOCHET','Shots bounce to another enemy'),
    u('gunner-piercing','modify','PIERCING CORE','Shots pierce additional targets',{exclusiveGroup:'gunner-shot-path'}),
    u('gunner-split','modify','SPLIT SHOT','Hits split into two secondary rounds',{exclusiveGroup:'gunner-shot-path'}),
    u('gunner-thunder-crit','synergy','THUNDER CRIT','Critical hits discharge chain lightning',{requires:['gunner-ricochet']}),
    u('gunner-railstorm','evolution','RAILSTORM','Momentum converts fire into piercing rail bursts',{requires:['gunner-ricochet','gunner-thunder-crit']})
  ]),
  bombcat:Object.freeze([
    u('bombcat-payload','stat','HEAVY PAYLOAD','Explosion damage +12%',{maxRank:3}),
    u('bombcat-cluster','modify','CLUSTER BOMB','Bombs split into submunitions'),
    u('bombcat-mines','modify','SMART MINES','Bombs leave armed proximity mines',{exclusiveGroup:'bombcat-payload-path'}),
    u('bombcat-chain-fuse','modify','CHAIN FUSE','Explosions prime nearby enemies',{exclusiveGroup:'bombcat-payload-path'}),
    u('bombcat-break-chain','synergy','BREAK DETONATION','BREAK kills trigger secondary blasts',{requires:['bombcat-cluster']}),
    u('bombcat-nuclear','evolution','NUCLEAR CASCADE','Chain detonations escalate into cascading nuclear bursts',{requires:['bombcat-cluster','bombcat-break-chain']})
  ]),
  thunderfox:Object.freeze([
    u('thunderfox-charge','stat','CAPACITOR','Lightning damage +12%',{maxRank:3}),
    u('thunderfox-chain','modify','CHAIN SURGE','Lightning jumps to more enemies'),
    u('thunderfox-stormfield','modify','STORM FIELD','Final jump leaves a damaging field',{exclusiveGroup:'thunderfox-field-path'}),
    u('thunderfox-overcharge','modify','OVERCHARGE','High voltage increases shock damage',{exclusiveGroup:'thunderfox-field-path'}),
    u('thunderfox-critstorm','synergy','CRITICAL STORM','Critical chains recharge Voltage',{requires:['thunderfox-chain']}),
    u('thunderfox-god','evolution','THUNDER GOD','Max Voltage sustains a roaming storm',{requires:['thunderfox-chain','thunderfox-critstorm']})
  ]),
  blademaster:Object.freeze([
    u('blade-edge','stat','SHARPENED EDGE','Slash damage +12%',{maxRank:3}),
    u('blade-execution','modify','EXECUTION','Low-health enemies are executed'),
    u('blade-parry','modify','PERFECT PARRY','Well-timed contact grants a counter window',{exclusiveGroup:'blade-technique'}),
    u('blade-cyclone','modify','CYCLONE STEP','Dash emits a circular slash',{exclusiveGroup:'blade-technique'}),
    u('blade-flowkill','synergy','FLOW EXECUTION','Executions restore Flow and dash tempo',{requires:['blade-execution']}),
    u('blade-void','evolution','VOID BLADE','Full Flow opens void slashes through enemy lines',{requires:['blade-execution','blade-flowkill']})
  ]),
  nova:Object.freeze([
    u('nova-core','stat','CORE DENSITY','Nova damage +12%',{maxRank:3}),
    u('nova-gravity','modify','GRAVITY WELL','Orbs pull nearby enemies inward'),
    u('nova-orbit','modify','ORBITAL CORE','Charged orbs orbit before release',{exclusiveGroup:'nova-core-path'}),
    u('nova-collapse','modify','COLLAPSE CORE','Charged hits implode then burst',{exclusiveGroup:'nova-core-path'}),
    u('nova-resonant','synergy','RESONANT COLLAPSE','Grouped enemies amplify Resonance',{requires:['nova-gravity']}),
    u('nova-supernova','evolution','SUPERNOVA','Maximum Resonance detonates a battlefield-scale nova',{requires:['nova-gravity','nova-resonant']})
  ]),
  missilequeen:Object.freeze([
    u('mq-warhead','stat','WARHEAD TUNING','Missile damage +12%',{maxRank:3}),
    u('mq-multilock','modify','MULTI-LOCK','Acquire additional simultaneous targets'),
    u('mq-cluster','modify','CLUSTER SALVO','Missiles split near locked targets',{exclusiveGroup:'mq-arsenal-path'}),
    u('mq-airstrike','modify','AIR STRIKE','High lock count calls a delayed strike',{exclusiveGroup:'mq-arsenal-path'}),
    u('mq-overpaint','synergy','TARGET OVERPAINT','Repeated locks increase impact damage',{requires:['mq-multilock']}),
    u('mq-annihilation','evolution','TOTAL ANNIHILATION','Full Target Lock launches an arena-wide missile protocol',{requires:['mq-multilock','mq-overpaint']})
  ])
});
