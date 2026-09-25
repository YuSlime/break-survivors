# Stage 11.0 THREAT BREAKPOINT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add run-local THREAT 0-5 and endless LIMIT BREAK escalation that increases enemy density, modestly increases HP and rewards, adds THREAT SURGE waves and elite pressure, and preserves performance by trimming visual effects only.

**Architecture:** Keep the existing single-file runtime in `index.html`. Add a small set of pure THREAT helper functions near the current run-state helpers, then route existing spawn, enemy creation, reward, HUD, reset, and visual-FX trimming through those helpers. THREAT state is derived from `runKills`; only transition markers and transient visuals are stored as run-local variables.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Canvas 2D, Web Audio, Node.js built-in test runner for source/helper verification.

**Spec:** `docs/superpowers/specs/2026-09-26-stage-11-threat-breakpoint-design.md`

## Global Constraints

- THREAT is based only on run kills.
- THREAT thresholds are exactly 150 / 450 / 900 / 1600 / 2600 kills.
- THREAT density multipliers are exactly 1.00 / 1.30 / 1.60 / 2.00 / 2.50 / 3.10.
- THREAT HP multipliers are exactly 1.00 / 1.05 / 1.12 / 1.20 / 1.30 / 1.40.
- THREAT reward multipliers are exactly 1.00 / 1.10 / 1.25 / 1.45 / 1.70 / 2.00.
- Density must use both shorter spawn intervals and larger spawn batches.
- THREAT 3 is the point where elite pressure becomes clearly visible.
- Every THREAT increase triggers a SURGE WAVE; LIMIT BREAK increments do not reuse the THREAT surge in Stage 11.0.
- After THREAT 5, LIMIT BREAK increases every additional 500 kills.
- Each LIMIT BREAK level adds +12% density, +5% HP, and +10% reward relative to the THREAT 5 baseline; use linear additive growth from the T5 baseline, not compounding.
- THREAT/LIMIT BREAK are run-local and reset on restart; do not persist them.
- Do not add an enemy hard cap.
- Performance Mode and dynamic pressure trimming may reduce visual FX only; they must not reduce enemy count, HP, damage, or reward.

## Review Focus

- Exact threshold boundaries (149/150, 449/450, 899/900, 1599/1600, 2599/2600, 3099/3100) must map to the correct THREAT/LB state.
- LIMIT BREAK scaling must remain deterministic and linear at high LB values without mutating saved progression.
- Spawn density must hit the requested expected multiplier without integer batch rounding causing large over-spawns.
- SURGE spawning must come from world edges and must not create a hidden enemy cap or depend on Performance Mode.
- Dynamic FX pressure must never touch gameplay arrays such as `enemies`, `enemyBullets`, or reward calculations.

---

### Task 1: THREAT and LIMIT BREAK State Model

**Files:**
- Modify: `index.html` near the current run-state declarations around `gameTime/runKills/spawnTimer`
- Create: `tests/stage11-threat.test.mjs`

**Interfaces:**
- Consumes: `runKills`
- Produces:
  - `const THREAT_THRESHOLDS = [150,450,900,1600,2600]`
  - `const THREAT_PROFILES` with the exact T0-T5 density/HP/reward values
  - `getThreatState(kills:number) -> {threat:number,isLimitBreak:boolean,limitBreak:number,densityMul:number,hpMul:number,rewardMul:number,nextKills:number|null,progressStart:number,progressEnd:number|null}`
  - `getThreatSpawnShape(densityMul:number,rng:number) -> {intervalMul:number,batchSize:number}`

- [ ] **Step 1: Write the failing state-boundary tests**

Use Node's built-in `node:test` and a small balanced-brace extractor that reads `index.html` and evaluates only the pure THREAT constants/functions.

Assert:
- 149 => T0
- 150 => T1
- 449 => T1
- 450 => T2
- 899 => T2
- 900 => T3
- 1599 => T3
- 1600 => T4
- 2599 => T4
- 2600 => T5 + LIMIT BREAK mode with LB0
- 3099 => LB0
- 3100 => LB1
- LB1 multipliers are T5 × 1.12 density, ×1.05 HP, ×1.10 reward
- LB10 multipliers are T5 × 2.20 density, ×1.50 HP, ×2.00 reward

- [ ] **Step 2: Run the boundary tests and verify RED**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: FAIL because THREAT helpers do not exist.

- [ ] **Step 3: Implement the pure THREAT state helpers in `index.html`**

Keep the values literal and centralized. For `getThreatSpawnShape`, split density as:
- `intervalMul = Math.sqrt(densityMul)`
- expected batch size = `densityMul / intervalMul`
- stochastic-round batch size using the supplied `rng` in [0,1)

This keeps expected total spawn density equal to the requested density multiplier while changing both interval and batch size.

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `Stage 11.0: add THREAT and LIMIT BREAK state model`

---

### Task 2: Integrate THREAT into Spawning, HP, Rewards, Elites, and SURGE

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-threat.test.mjs`

**Interfaces:**
- Consumes: `getThreatState(runKills)`, `getThreatSpawnShape(densityMul,rng)`
- Produces:
  - `getThreatEliteChance(state,gameTime) -> number`
  - `buildThreatSurgePlan(level:number) -> {count:number,eliteCount:number}`
  - `spawnThreatSurge(level:number)`
  - `spawnEnemy(type='normal', opts={})` supporting an optional forced world-edge position

- [ ] **Step 1: Add failing integration tests**

Assert:
- T0 preserves the current late-run elite chance baseline of 3.5%.
- T1=4%, T2=6%, T3=11%, T4=17%, T5=24% elite chance once normal time gating permits elites.
- SURGE counts are 10 / 14 / 20 / 28 / 38 for THREAT 1-5.
- SURGE elite counts are 0 / 1 / 3 / 6 / 10 for THREAT 1-5.
- regular spawn code calls `getThreatSpawnShape` and loops `batchSize` times.
- regular spawn interval divides by the returned `intervalMul`.
- `spawnEnemy` multiplies HP/maxHP by `state.hpMul` and reward by `state.rewardMul`.
- no code path checks `performanceMode` before deciding spawn count, HP, reward, or elite chance.
- no new enemy-count cap is introduced.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: FAIL on missing integration functions/source assertions.

- [ ] **Step 3: Implement elite pressure and spawn density**

Use `getThreatEliteChance` in the existing regular spawn type selection. Preserve SWARM event behavior and existing runner/tank/shooter time unlocks. THREAT elite pressure augments normal spawning rather than replacing CHAOS events.

- [ ] **Step 4: Apply HP and reward scaling in `spawnEnemy`**

Compute the current state from `runKills` at spawn time. Apply HP multiplier to the existing time-based `hpScale`; apply reward multiplier to the stored enemy reward so existing BREAK/event/coin multipliers still compose afterward.

- [ ] **Step 5: Add edge-based SURGE spawning**

`buildThreatSurgePlan` uses the exact counts above. `spawnThreatSurge` distributes enemies across all four world edges, mixes normal/runner/tank/shooter using existing unlock rules, and substitutes the configured number of elites. It must not reduce counts in Performance Mode.

- [ ] **Step 6: Run tests and verify GREEN**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit**

Commit message: `Stage 11.0: scale battlefield pressure with THREAT`

---

### Task 3: THREAT Transitions, HUD, LIMIT BREAK Display, and Run Reset

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-threat.test.mjs`

**Interfaces:**
- Consumes: `getThreatState(runKills)`, `spawnThreatSurge(level)`
- Produces:
  - run-local `threatLevel`, `limitBreakLevel`, `threatFlash`
  - `updateThreatProgression()`
  - `triggerThreatUp(previousLevel,newLevel)`
  - HUD elements `#threatHud`, `#threatLabel`, `#threatFill`, `#threatSub`

- [ ] **Step 1: Add failing transition/reset/HUD tests**

Assert:
- `killEnemy` calls `updateThreatProgression()` after incrementing `runKills`.
- THREAT increases call `triggerThreatUp` exactly once per crossed level and call `spawnThreatSurge(newLevel)`.
- crossing 2600 displays `THREAT MAXIMUM` and then HUD mode is LIMIT BREAK.
- crossing 3100 updates LB0 -> LB1 without calling `spawnThreatSurge`.
- HUD at T2/617 kills shows T2 and progress 617/900.
- HUD at 2600+ shows LIMIT BREAK and the current LB level/next 500-kill target.
- `resetRun` resets THREAT/LB transient state to zero.
- no THREAT/LB field is added to the persistent `save` object.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Add THREAT HUD HTML/CSS**

Place it below the top metrics without colliding with BREAK/event/boss HUD. Add it to the ADMIN-hide selector and mobile rules. Use a compact bar with current mode/level and kill target.

- [ ] **Step 4: Implement transition handling**

`updateThreatProgression` derives the current state from `runKills`, detects THREAT and LB transitions, and updates run-local markers. THREAT transitions trigger the warning/callout, edge flash, and SURGE. LB transitions only update HUD/callout in Stage 11.0; milestone events remain Stage 11.1.

- [ ] **Step 5: Implement edge-flash feedback**

Use a transient `threatFlash` value decayed in `update(dt)` and drawn as a screen-edge overlay. Do not increase camera shake beyond the current low-shake direction.

- [ ] **Step 6: Reset run-local state**

Add THREAT/LB/transient reset to `resetRun` only. Do not touch `localStorage` schema.

- [ ] **Step 7: Run tests and verify GREEN**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: PASS.

- [ ] **Step 8: Commit**

Commit message: `Stage 11.0: add THREAT HUD and run transitions`

---

### Task 4: Dynamic Visual-Only Pressure Trimming and Final Verification

**Files:**
- Modify: `index.html`
- Modify: `tests/stage11-threat.test.mjs`

**Interfaces:**
- Consumes: `getThreatState(runKills)`, existing `getPerformanceFxCaps()`
- Produces:
  - `getThreatFxScale(state,lowFx=performanceMode) -> number`
  - updated `trimVisualEffects()` that scales visual caps only

- [ ] **Step 1: Add failing visual-pressure tests**

Assert:
- T0 full-FX scale = 1.0.
- T5 full-FX scale is between 0.55 and 0.75.
- T5 Performance Mode scale is lower than T5 full-FX scale.
- LB levels continue to reduce the visual scale but never below 0.32 in Performance Mode or 0.45 in full-FX mode.
- `trimVisualEffects` only trims `particles`, `rings`, `beams`, `slashFx`, `lightnings`, `bombExplosionFx`, `missileQueenFx`, `novaUltCores`, and `floatingTexts`.
- `trimVisualEffects` never trims `enemies`, `bullets`, `missiles`, `enemyBullets`, `pickups`, or reward state.

- [ ] **Step 2: Run tests and verify RED**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement dynamic FX scaling**

Use a smooth density-driven scale with explicit floors:
- full FX floor: 0.45
- Performance Mode floor: 0.32

Apply the scale to the existing visual caps before trimming. Keep gameplay arrays untouched.

- [ ] **Step 4: Run Stage 11 tests**

Run: `node --test tests/stage11-threat.test.mjs`

Expected: PASS, 0 failures.

- [ ] **Step 5: Run JavaScript syntax verification**

Extract the main `<script>` from `index.html` and compile it with `new Function(script)`.

Expected: no syntax error.

- [ ] **Step 6: Run source-level requirement verification**

Check exact thresholds, profiles, LB linear scaling, SURGE hooks, elite chances, reset behavior, no persistent THREAT state, and no enemy hard cap.

Expected: all checks true.

- [ ] **Step 7: Commit**

Commit message: `Stage 11.0: finish THREAT BREAKPOINT performance scaling`

- [ ] **Step 8: Fresh-main and deployment verification**

Fetch `main:index.html` after the final commit, confirm the Stage 11.0 title and helper checks, then verify the final main commit has Vercel status `success` / `Deployment has completed`.
