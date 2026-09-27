# Stage 11.1 LIMIT BREAK: ESCALATION Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repeatable LIMIT BREAK milestone trials at LB3/LB5/LB10 families, including dedicated Elite behaviors, APOCALYPSE phases, failure stakes, rewards, HUD/visuals, and dedicated danger-warning SFX without changing Stage 11.0 THREAT/LB math.

**Architecture:** Keep the existing single-file game runtime in `index.html`, but isolate Stage 11.1 behind pure milestone/tier helpers and one run-local event state machine. Event timing, wave scheduling, BREAK EXECUTION, queueing, and phase transitions advance from `update(dt)` rather than loose `setTimeout` chains, so reset safety is deterministic. Dedicated Elite variants remain `type:'elite'` and add `eliteVariant` metadata, preserving current drop/ULT/visual integrations.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Canvas 2D, Web Audio, Node.js built-in test runner, GitHub Actions, Runway SFX generation.

**Spec:** `docs/superpowers/specs/2026-09-28-stage-11-1-limit-break-escalation-design.md`

## Global Constraints

- Do not change Stage 11.0 THREAT thresholds or density/HP/reward formulas.
- Milestones repeat as LB3/5/10, then LB15/20/25, LB30/35/40, LB45/50/55, continuing in 15-LB cycles.
- Event enemy-count and currency-reward tier multiplier is `1 + (tier - 1) * 0.35`.
- Event time limits never scale with tier.
- Event-tier scaling never adds a second HP multiplier.
- Only one LB event may be active; later milestones are queued in ascending LB order.
- Event combat kills still increment normal runKills/LIMIT BREAK.
- Existing enemies never count toward event objectives unless they were tagged to the active event instance/phase.
- Preparation is exactly 3 seconds: player movement allowed; enemy motion/attacks, normal attacks, ULT, normal spawning, CHAOS/boss progression paused.
- Event failure immediately ends the run and displays LIMIT BREAK FAILED.
- MEGA SURGE: 25 seconds, normal spawning x1.0.
- ELITE DOMINION: 30 seconds, normal spawning x0.5.
- APOCALYPSE: normal spawning x0, phases 70/50/90 base kills with 12/12/16 second deadlines.
- BREAK EXECUTION removals grant zero kill/reward/ULT/BREAK/LB credit and never trigger Titan chains.
- Titan real-death explosions can chain through other Titans, damage enemies only, and real explosion kills grant normal credit.
- APOCALYPSE boss remains reserved for Stage 11.4.
- Performance Mode may reduce visuals only, never event enemies/objectives/timers/HP/rewards.
- All Stage 11.1 state is run-local and invalidated on reset/end-run.
- Audio remains low-end, short, non-voice, low-fatigue, with restrained highs and no dedicated APOCALYPSE BGM.

## Review Focus

- A single kill can cross multiple LB values through chained Titan deaths; all crossed milestones must be queued once, in order, without overlap.
- Restarting during preparation/execution/intermission must invalidate all old event work and never spawn or clear enemies in the new run.
- Event-tagged enemies killed by normal attacks or Titan chains must credit exactly one event objective and one normal kill.
- BREAK EXECUTION must not accidentally run `killEnemy()` or generate drops/totalKills/LB progress.
- Temporary reward buffs from consecutive events must not multiply-stack the same stat into runaway values; strongest active modifier wins per stat.

---

### Task 1: Milestone, Tier, Count, and Reward Model

**Files:**
- Modify: `index.html` near the Stage 11.0 pure THREAT model
- Create: `tests/stage11-1-escalation.test.mjs`
- Modify: `.github/workflows/test-stage11-threat.yml`

**Interfaces:**
- Consumes: Stage 11.0 `getThreatState(kills)`
- Produces:
  - `getLimitBreakEventMilestone(lb:number) -> {lb:number,type:'mega'|'dominion'|'apocalypse',tier:number,countMul:number,rewardMul:number}|null`
  - `collectLimitBreakEventMilestones(fromLb:number,toLb:number) -> milestone[]`
  - `getNextLimitBreakEventMilestone(lb:number) -> milestone`
  - `scaleLbEventCount(base:number,tier:number) -> integer`
  - `scaleLbCurrency(base:number,tier:number) -> integer`

- [ ] **Step 1: Write failing pure-model tests**

Assert:
- LB3/5/10 => Tier I mega/dominion/apocalypse.
- LB15/20/25 => Tier II.
- LB30/35/40 => Tier III.
- LB45/50/55 => Tier IV.
- non-milestones return null.
- `collectLimitBreakEventMilestones(2,10)` returns 3,5,10 in order.
- `collectLimitBreakEventMilestones(9,21)` returns 10,15,20.
- count/reward multipliers are 1.00/1.35/1.70/2.05 for Tier I-IV.
- `scaleLbEventCount` uses `Math.ceil(base * countMul)`.
- `scaleLbCurrency` uses nearest-integer rounding.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/stage11-threat.test.mjs tests/stage11-1-escalation.test.mjs`

Expected: Stage 11.0 tests pass; Stage 11.1 tests fail because helpers do not exist.

- [ ] **Step 3: Implement the pure helpers**

Tier I is the special first set at 3/5/10. Tier II+ starts at LB15 and repeats every 15 LB with offsets 0/5/10.

- [ ] **Step 4: Update the existing Stage 11 workflow**

Run both Stage 11 test files on changes to `index.html`, either Stage 11 test file, workflow, or Stage 11.1 SFX assets.

- [ ] **Step 5: Run tests and verify GREEN**

Expected: all pure-model tests pass and Stage 11.0 remains green.

- [ ] **Step 6: Commit**

Commit: `Stage 11.1: add LIMIT BREAK event milestone model`

---

### Task 2: Event Queue, Preparation, World Pause, Failure, and Reset Safety

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-1-escalation.test.mjs`

**Interfaces:**
- Consumes: Task 1 milestone helpers, existing `updateThreatProgression()`, `updateChaosDirector(dt)`, `resetRun()`, `endRun()`
- Produces:
  - `let lbEventState=null`
  - `let lbEventQueue=[]`
  - `let lbEventSerial=0`
  - `let lbRunGeneration=0`
  - `queueLimitBreakEvents(fromLb,toLb)`
  - `beginNextLimitBreakEvent()`
  - `updateLimitBreakEvent(dt)`
  - `isLbPreparationActive()`
  - `isLbEventActive()`
  - `getLbNormalSpawnMultiplier() -> 0|0.5|1`
  - `failLimitBreakEvent(reason)`

**State shape:**
- `instanceId`, `runGeneration`, `type`, `tier`, `milestoneLb`
- `mode:'prep'|'combat'|'execution'|'clear'|'intermission'`
- `prepRemaining`, `timeRemaining`, `elapsed`
- event-specific phase/wave/objective fields

- [ ] **Step 1: Add failing queue/state tests**

Assert:
- `updateThreatProgression()` queues every crossed milestone between old/new LB before updating `limitBreakLevel`.
- queue preserves ascending LB order and contains no duplicate milestone.
- only one event state can be active.
- preparation starts at exactly 3.0 seconds.
- `getLbNormalSpawnMultiplier()` returns 0 in prep, 1 for mega combat, .5 for dominion combat, 0 for apocalypse combat, 1 outside events.
- `updateChaosDirector(dt)` does not advance CHAOS, treasure/boss director state, or boss warning while an LB event blocks world progression.
- normal `spawnTimer` does not advance while multiplier is 0.
- `firePrimary()` is skipped during preparation.
- `useUltimate()` exits during preparation.
- enemy movement and enemy bullet movement are skipped during preparation while player movement remains in the update path.
- failure calls `endRun('limit_break_failed')`.
- reset/end increments generation and empties event state/queue.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Implement the generic state machine and queue**

Use `update(dt)` for all Stage 11.1 clocks. Avoid event gameplay `setTimeout` calls.

Use a fixed 1.25-second intermission after a successful event before starting the oldest queued event.

- [ ] **Step 4: Integrate world pause and normal-spawn multiplier**

At x0 spawn multiplier, preserve `spawnTimer` rather than draining it.

At x0.5, apply half-rate by multiplying the existing spawn-rate denominator by .5; do not alter Stage 11.0 density state.

- [ ] **Step 5: Integrate run-end reason display**

Add a dedicated run-end title element/id if needed. `endRun('limit_break_failed')` displays LIMIT BREAK FAILED; ordinary deaths retain RUN OVER.

- [ ] **Step 6: Run tests and verify GREEN**

- [ ] **Step 7: Commit**

Commit: `Stage 11.1: add queued LIMIT BREAK event runtime`

---

### Task 3: Event Enemy Tags and Dedicated Elite Variants

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-1-escalation.test.mjs`

**Interfaces:**
- Consumes: existing `spawnEnemy()`, `damageEnemy()`, `killEnemy()`, enemy update loop
- Produces:
  - `spawnLbEventEnemy(type,tag,opts={}) -> enemy`
  - enemy metadata: `lbEventInstanceId`, `lbEventType`, `lbEventTier`, `lbEventPhase`, `eliteVariant`
  - `isActiveLbObjectiveEnemy(e)`
  - `registerLbEventKill(e)`
  - `updateEliteVariantBehavior(e,dt,dx,dy,distance) -> boolean`
  - `damageEnemyRaw(e,dmg,meta={})`
  - `triggerTitanEliteExplosion(e)`

**Elite tuning:**
- Berserker: base elite HP x0.80, speed x1.45, radius x0.90; charge range 300; telegraph .35s; dash duration .28s; dash speed 480; cooldown 2.2s.
- Titan: base elite HP x2.20, speed x0.62, radius x1.45; death explosion radius 220; raw enemy damage = 72% of the dead Titan's max HP; never damages player.
- Gold: base elite HP x0.72, speed x0.88, radius x0.92; tries to stay roughly 180-285 units from player; reward x2.20; real death adds a visible 5-Gem burst in addition to normal elite drops.

- [ ] **Step 1: Add failing tagging/Elite tests**

Assert:
- pre-existing untagged enemies never satisfy event objectives.
- tagged event enemies credit only their matching instance/phase.
- one real death can only credit an event objective once.
- Berserker values/state constants are exact and reset removes charge state.
- Titan explosion uses `damageEnemyRaw`, does not touch player HP, and can invoke real `killEnemy` through raw damage.
- Titan death triggered by BREAK EXECUTION does not call explosion logic.
- Gold variant has exact HP/speed/reward multipliers and explicit 5-Gem bonus.
- all variants retain `type:'elite'`.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Implement tag helpers and kill registration**

Call `registerLbEventKill(e)` from real `killEnemy` only.

- [ ] **Step 4: Implement variant spawn tuning and movement behavior**

Variant logic runs before generic elite pursuit and returns whether movement was handled.

- [ ] **Step 5: Implement Titan raw-damage chain**

`damageEnemyRaw` bypasses player crit, sword buff, weapon hit SFX, and player knockback calculations but routes real deaths through `killEnemy()`, preserving drops/BREAK/runKills/LB/event credit.

- [ ] **Step 6: Run tests and verify GREEN**

- [ ] **Step 7: Commit**

Commit: `Stage 11.1: add LIMIT BREAK Elite variants`

---

### Task 4: MEGA SURGE and ELITE DOMINION

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-1-escalation.test.mjs`

**Interfaces:**
- Consumes: Task 2 state machine, Task 3 event enemy helpers
- Produces:
  - `startMegaSurgeCombat(event)`
  - `updateMegaSurge(event,dt)`
  - `startEliteDominionCombat(event)`
  - `updateEliteDominion(event,dt)`

**MEGA SURGE Tier I base schedule:**
- at combat start: North Runner-heavy wave, 20 enemies
- +1s: East Tank-heavy wave, 20
- +2s: South Normal-heavy wave, 24
- +3s: West Shooter-heavy wave, 20
- +4s: FINAL SURGE, 12 standard enemies + Berserker x2 + Titan x1 + Gold x1
- exact Tier I total: 100 event-tagged enemies
- each composition bucket scales with `scaleLbEventCount(base,tier)`
- event clears only after FINAL SURGE has spawned and no tagged MEGA enemies remain
- deadline: 25 seconds

**ELITE DOMINION Tier I:**
- Berserker x4 / Titan x4 / Gold x4
- each bucket scales with `scaleLbEventCount(4,tier)`
- deadline: 30 seconds
- clear when no tagged DOMINION Elites remain

- [ ] **Step 1: Add failing event-structure tests**

Assert exact Tier I wave timings/counts/compositions, 100 base MEGA enemies, 4/4/4 DOMINION, deadlines, and spawn multipliers.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Implement MEGA SURGE scheduling in the state machine**

No gameplay `setTimeout`; spawn waves from elapsed-combat thresholds.

- [ ] **Step 4: Implement ELITE DOMINION spawning/completion**

Spawn all dedicated Elites at START and use tagged-alive count for completion.

- [ ] **Step 5: Run tests and verify GREEN**

- [ ] **Step 6: Commit**

Commit: `Stage 11.1: add MEGA SURGE and ELITE DOMINION`

---

### Task 5: APOCALYPSE Phases and BREAK EXECUTION

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-1-escalation.test.mjs`

**Interfaces:**
- Consumes: Tasks 2-3 state/tag helpers
- Produces:
  - `const APOCALYPSE_PHASES`
  - `startApocalypseCombat(event)`
  - `startApocalypsePhase(event,index)`
  - `updateApocalypse(event,dt)`
  - `startBreakExecution(event,scope)`
  - `updateBreakExecution(event,dt)`

**Phase definitions:**
- RED FLOOD: base objective 70, deadline 12s, Normal+Runner, base spawn batch 8 every .65s.
- GOLDEN STORM: base objective 50, deadline 12s, Tank+Shooter+Gold Elite, base batch 6 every .75s.
- LAST SURGE: base objective 90, deadline 16s, all normal enemy types + all three Elite variants, base batch 10 every .60s.
- objective and spawn batch counts scale with `scaleLbEventCount(base,tier)`.
- phase advances immediately when objective is reached.

**BREAK EXECUTION:**
- target only matching instance/phase enemies that remain alive after objective completion.
- freeze/white-flash, then mark dead over a staggered .32-second sequence.
- do not call `killEnemy()`, `damageEnemy()`, drop functions, BREAK functions, or Titan explosion functions.
- after execution finishes, start next phase or event-clear flow.

- [ ] **Step 1: Add failing APOCALYPSE/execution tests**

Assert phase values 70/50/90, 12/12/16, cadence/batches, immediate transition on objective, normal spawn x0, and zero-credit execution.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Implement continuous APOCALYPSE phase spawners**

Phase composition is deterministic by weighted cycle, not dependent on current CHAOS state.

- [ ] **Step 4: Implement BREAK EXECUTION state**

Execution state belongs to the active event and uses the same instance/generation guards.

- [ ] **Step 5: Implement failure deadlines**

A phase timeout before the objective calls `failLimitBreakEvent('timeout')`.

- [ ] **Step 6: Run tests and verify GREEN**

- [ ] **Step 7: Commit**

Commit: `Stage 11.1: add APOCALYPSE and BREAK EXECUTION`

---

### Task 6: Rewards, Temporary Buffs, HUD, and Readable Visual Presentation

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-1-escalation.test.mjs`

**Interfaces:**
- Consumes: successful event completion from Tasks 4-5
- Produces:
  - `let lbRewardBuffs`
  - `grantLimitBreakEventReward(event)`
  - `updateLbRewardBuffs(dt)`
  - `getLbRewardStatMultipliers()`
  - dedicated `#lbEventHud`
  - dedicated `#nextLbEventHud`
  - event splash/edge-flash overlay

**Buff rule:** multiple active event buffs do not multiplicatively stack the same stat. Use the strongest active modifier for Damage/Attack Speed/Move/Break Grace; a newer reward may refresh/extend its own source duration.

**Tier I rewards:**
- MEGA: 2,500 Coins, ULT +50, AS +20% for 10s.
- DOMINION: 5,000 Coins, 75 Gems, Damage +25%, AS +20% for 15s.
- APOCALYPSE: 10,000 Coins, 150 Gems, ULT=100, OVERDRIVE 20s: Damage +35%, AS +25%, Move +20%, BREAK maintenance +1s.
- Tier II+ currency uses `scaleLbCurrency`; buff values do not scale.
- Coin event rewards add to both `save.coins` and `runCoins`.

- [ ] **Step 1: Add failing reward/buff/HUD tests**

Assert exact values, non-multiplicative strongest-stat rule, durations, run-local reset, Break timeout +1 only while OVERDRIVE is active, and exact next-event labels/kill target calculations.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Integrate temporary multipliers**

Apply Damage/AS/Move through current player-stat/combat calculations and refresh `ps` when buff strength changes/expires. Apply BREAK grace to the normal non-FEVER BREAK timeout only.

- [ ] **Step 4: Add event HUD and next-event HUD**

During prep show event name + 3/2/1/START. During combat show event/phase, objective progress, and event/phase timer. Keep Stage 11.0 THREAT HUD visible.

- [ ] **Step 5: Add readable visual presentation**

Use short dimming, event title, screen-edge light, restrained shockwave and small shake. APOCALYPSE clear sequence: execution -> short dim -> APOCALYPSE CLEARED -> gold/purple shockwave -> reward display -> OVERDRIVE.

- [ ] **Step 6: Run tests and verify GREEN**

- [ ] **Step 7: Commit**

Commit: `Stage 11.1: add event rewards HUD and OVERDRIVE`

---

### Task 7: Dedicated LIMIT BREAK Event SFX with Runway

**Files:**
- Create:
  - `assets/sfx/lbevents/lb_warning.mp3`
  - `assets/sfx/lbevents/lb_countdown.mp3`
  - `assets/sfx/lbevents/lb_start.mp3`
  - `assets/sfx/lbevents/lb_mega_start.mp3`
  - `assets/sfx/lbevents/lb_dominion_start.mp3`
  - `assets/sfx/lbevents/lb_apocalypse_start.mp3`
  - `assets/sfx/lbevents/lb_phase_change.mp3`
  - `assets/sfx/lbevents/lb_execution.mp3`
  - `assets/sfx/lbevents/lb_cleared.mp3`
  - `assets/sfx/lbevents/lb_failed.mp3`
- Modify: `index.html`
- Modify: `tests/stage11-1-escalation.test.mjs`

**Interfaces:**
- Produces:
  - `const lbEventSfxFiles`
  - `playLbEventSfx(key,volume,rate,opts={})`
  - dedicated `activeLbEventVoices` with a 4-voice cap independent of ordinary CHAOS event voices

- [ ] **Step 1: Add failing audio-integration tests**

Assert all 10 assets/mappings are referenced, countdown uses the same non-voice pulse with rate variation for 3/2/1, APOCALYPSE has its own heavier start asset, and LB audio has a dedicated voice counter.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Generate 10 short non-voice SFX through Runway**

Direction:
- heavy danger-warning
- low-end pressure
- short transients
- controlled highs
- no harsh metal/hiss
- no long reverb
- APOCALYPSE substantially heavier than MEGA/DOMINION

Use the connected Runway workflow. Check available account/credit state before generation.

- [ ] **Step 4: Persist Runway outputs in GitHub**

If Runway returns expiring signed URLs, use the known one-time GitHub Actions importer pattern: encode URLs in the temporary workflow, download on runner, commit binaries under `assets/sfx/lbevents/`, and self-delete the importer. Never place signed URLs in production code.

- [ ] **Step 5: Integrate the dedicated LB audio bus**

Use low-pass/body shaping suitable for dense combat. Event-warning/start/clear/fail cues must not be suppressed by normal weapon or CHAOS-event voice caps.

- [ ] **Step 6: Run tests and verify GREEN**

- [ ] **Step 7: Commit**

Commit: `Stage 11.1: add dedicated LIMIT BREAK event audio`

---

### Task 8: Full Regression, Safety Review, and Deployment Verification

**Files:**
- Modify only if verification exposes a defect
- Test: both Stage 11 test files

**Interfaces:**
- Consumes all prior tasks
- Produces a verified Stage 11.1 main deployment

- [ ] **Step 1: Run the full Stage 11 regression suite**

Run: `node --test tests/stage11-threat.test.mjs tests/stage11-1-escalation.test.mjs`

Expected: 0 failures.

- [ ] **Step 2: Compile the full game script**

Extract the main `<script>` and run `new Function(script)`.

Expected: no syntax error.

- [ ] **Step 3: Verify source requirements**

Check:
- Stage 11.0 thresholds/scaling unchanged.
- milestone mapping and tier math exact.
- one active event + ordered queue.
- preparation/world pause exact.
- tagged objectives only.
- Titan chains are real kills; execution is zero-credit.
- MEGA/DOMINION/APOCALYPSE spawn multipliers 1/.5/0.
- exact event deadlines/objectives/rewards/buffs.
- APOCALYPSE has no boss spawn.
- Performance Mode never alters event gameplay values.
- reset/end invalidates event state/generation.
- all dedicated SFX assets exist and load.

- [ ] **Step 4: Final code review**

Review the whole Stage 11.1 range against the spec and Review Focus. Any Critical/Important finding gets one RED->GREEN fix pass; Minor findings are reported rather than silently expanding scope.

- [ ] **Step 5: Fresh-main verification**

Fetch `main:index.html` after the final fix commit. Confirm Stage 11.1 title/source and the current main SHA.

- [ ] **Step 6: Verify Vercel**

Confirm final main commit status is `success` with `Deployment has completed`.

- [ ] **Step 7: Final commit if verification required fixes**

Use a focused message describing the verified defect fixed.
