# Stage 11.1 — LIMIT BREAK: ESCALATION

## Goal
Turn LIMIT BREAK from a pure scaling number into a sequence of high-pressure milestone trials with clear targets, distinct combat identities, failure stakes, rewards, and repeatable higher-tier escalation.

## Relationship to Stage 11.0
Stage 11.0 remains the authoritative source for:
- THREAT 0-5
- LIMIT BREAK progression every 500 kills
- density / HP / reward scaling
- THREAT HUD
- visual-only dynamic FX trimming
- no enemy hard cap

Stage 11.1 adds milestone events on top of that system. It must not change Stage 11.0 threshold math or its core scaling values.

## Milestone schedule
Tier I:
- LB3 — MEGA SURGE
- LB5 — ELITE DOMINION
- LB10 — APOCALYPSE

Tier II:
- LB15 — MEGA SURGE II
- LB20 — ELITE DOMINION II
- LB25 — APOCALYPSE II

Tier III:
- LB30 — MEGA SURGE III
- LB35 — ELITE DOMINION III
- LB40 — APOCALYPSE III

Tier IV:
- LB45 — MEGA SURGE IV
- LB50 — ELITE DOMINION IV
- LB55 — APOCALYPSE IV

The pattern continues indefinitely in 15-LB cycles.

## Tier scaling
Enemy-count multiplier:
- Tier I: +0%
- Tier II: +35%
- Tier III: +70%
- Tier IV: +105%
- continue +35 percentage points per tier

Only event enemy count scales by event tier. Event-specific HP is not additionally multiplied by event tier beyond normal Stage 11.0 LIMIT BREAK HP scaling.

Currency rewards scale by the same +35% per tier:
- Tier I: x1.00
- Tier II: x1.35
- Tier III: x1.70
- Tier IV: x2.05
- continue +0.35 per tier

Combat-buff strength and event time limits do not scale with tier.

## Event queueing
Only one LIMIT BREAK event may be active at a time.

Kills during an active event still count toward normal runKills and LIMIT BREAK progression.

If another event milestone is reached while an event is active:
1. queue that milestone
2. finish the current event
3. grant the current event reward
4. wait through a short transition interval
5. start the oldest queued event

Events never overlap and are never skipped because another event is active.

## Existing system interaction
While any LIMIT BREAK event is in preparation or active combat:
- CHAOS event time progression is paused
- next CHAOS event progression is paused
- VOID TYRANT boss timer is paused
- an already-active boss warning countdown is paused
- paused values resume from their prior values after the LB event ends

Do not reset CHAOS or boss timers.

## Preparation phase
Every LIMIT BREAK event begins with a 3-second preparation phase.

Display:
- LIMIT BREAK EVENT
- event name
- 3 -> 2 -> 1 -> START

During preparation:
- player movement is allowed
- enemies are frozen
- enemy attacks are frozen
- normal spawning is stopped
- player normal attacks are stopped
- ULT is disabled
- CHAOS and boss timers remain paused

At START, combat immediately resumes using the event's spawn rules.

Countdown audio is non-voice:
- 3: light electronic pulse
- 2: slightly lower/heavier pulse
- 1: heavier pressure pulse
- START: short low-end impact / energy release

## Event enemy tagging
Enemies created specifically for an LB event must be tagged with:
- event instance id
- event type
- event tier
- event phase where applicable

Only tagged enemies belonging to the active event count toward that event's completion conditions.

Enemies that existed before event START:
- remain in the battlefield
- resume normal behavior at START
- do not count toward event objectives

## Failure
Any LIMIT BREAK event failure immediately ends the run.

Failure display:
- LIMIT BREAK FAILED

Failure occurs when:
- the player dies, or
- the event-specific time limit expires before its completion condition is met

There is no reward on failure.

## MEGA SURGE

### Trigger
LB3 family: LB3, LB15, LB30, LB45, ...

### Time limit
25 seconds for every tier.

### Normal spawning
Normal Stage 11.0 spawning continues at full rate during MEGA SURGE.

### Structure
Four directional assaults occur in sequence approximately one second apart:

1. North — Runner-heavy
2. East — Tank-heavy
3. South — Normal-heavy
4. West — Shooter-heavy

Then trigger FINAL SURGE:
- enemies attack from all four directions
- add event Elites:
  - Berserker Elite x2
  - Titan Elite x1
  - Gold Elite x1
- scale total event enemy counts by the event tier multiplier

Tier I should total roughly 80-100 event enemies across the full event.

### Completion
MEGA SURGE is cleared when all event-tagged MEGA SURGE enemies have been killed before the 25-second deadline.

BREAK EXECUTION may remove leftover event-tagged enemies only after the objective has already been satisfied.

### Reward
Tier I:
- 2,500 Coins
- ULT charge +50%
- Attack Speed +20% for 10 seconds

Tier II+:
- Coins scale by tier reward multiplier
- ULT and combat buff values remain fixed

## ELITE DOMINION

### Trigger
LB5 family: LB5, LB20, LB35, LB50, ...

### Time limit
30 seconds for every tier.

### Normal spawning
Normal Stage 11.0 spawn density is reduced to 50% while ELITE DOMINION is active.

This 50% modifier applies only to normal spawning during this event; it does not change THREAT/LB density values themselves.

### Tier I composition
12 event Elites:
- Berserker Elite x4
- Titan Elite x4
- Gold Elite x4

Tier II+ scales total Elite count by event tier multiplier while preserving an approximately even split among the three variants.

### Berserker Elite
Identity:
- red aura
- lower HP than Titan
- high movement speed
- aggressively closes distance

Behavior:
- when within charge range, show a short readable telegraph
- perform a fast forward dash toward the player
- return to normal pursuit afterward

### Titan Elite
Identity:
- largest Elite
- slow movement
- highest HP

Behavior:
- advances steadily
- on real combat death, explodes and damages nearby enemies
- Titan explosions can kill other Titans
- Titans killed by a Titan explosion also explode
- the chain has no artificial chain-count cap; it ends naturally when no further Titans die
- Titan death explosions do not damage the player

Kills caused by real Titan death explosions:
- count as real kills
- contribute to BREAK
- contribute to runKills / LIMIT BREAK progression
- award normal enemy rewards

### Gold Elite
Identity:
- gold visual treatment
- easier to kill than Titan
- high currency value

Behavior:
- prefers keeping some distance from the player
- on death, drops a visibly larger Coins/Gems burst

### Completion
Clear when all event-tagged ELITE DOMINION Elites for the event instance have been killed before the 30-second deadline.

### Reward
Tier I:
- 5,000 Coins
- 75 Gems
- Damage +25% for 15 seconds
- Attack Speed +20% for 15 seconds

Tier II+:
- Coins and Gems scale by tier reward multiplier
- combat buff values remain fixed

## APOCALYPSE

### Trigger
LB10 family: LB10, LB25, LB40, LB55, ...

### Boss policy
Do not spawn APOCALYPSE VOID TYRANT in Stage 11.1.

The Apocalypse boss remains reserved for Stage 11.4.

### Total structure
APOCALYPSE is a three-phase event with a maximum combined duration of 40 seconds.

Normal Stage 11.0 spawning is completely stopped while APOCALYPSE is active. Only APOCALYPSE event spawns are created.

A phase advances immediately when its required event-tagged kill count is reached. The player never waits out the remaining phase time after satisfying the objective.

### Phase 1 — RED FLOOD
Composition:
- Normal
- Runner

Objective:
- 70 event-tagged kills

Deadline:
- 12 seconds from phase start

On success:
- BREAK EXECUTION remaining RED FLOOD event enemies
- immediately transition to GOLDEN STORM after the execution transition

### Phase 2 — GOLDEN STORM
Composition:
- Tank
- Shooter
- Gold Elite

Objective:
- 50 event-tagged kills

Deadline:
- 12 seconds from phase start

On success:
- BREAK EXECUTION remaining GOLDEN STORM event enemies
- transition to LAST SURGE

### Phase 3 — LAST SURGE
Composition:
- all standard enemy types
- Berserker Elite
- Titan Elite
- Gold Elite

Objective:
- 90 event-tagged kills

Deadline:
- 16 seconds from phase start

On success:
- BREAK EXECUTION remaining LAST SURGE event enemies
- trigger FINAL BREAK / APOCALYPSE CLEARED presentation

### Tier scaling
Phase objective counts and event spawn population scale by the tier enemy-count multiplier.

Time limits remain:
- 12 seconds
- 12 seconds
- 16 seconds

The event must remain completable by powerful builds; do not add an extra event-tier HP multiplier.

## BREAK EXECUTION
Used when an event objective has already been satisfied and event-tagged enemies remain.

Presentation:
1. affected event enemies freeze briefly
2. flash white
3. disappear in a staggered 0.2-0.4 second execution sequence
4. move to the next phase or event-clear presentation

BREAK EXECUTION removals are not real kills.

Enemies removed by BREAK EXECUTION:
- do not increment runKills
- do not increment totalKills
- do not grant Coins
- do not grant Gems
- do not grant ULT
- do not extend BREAK
- do not advance LIMIT BREAK
- do not trigger Titan death-chain behavior

Only enemies tagged to the completed event/phase are removed. Pre-existing normal enemies remain.

## APOCALYPSE clear presentation
After LAST SURGE success:

1. BREAK EXECUTION remaining LAST SURGE enemies
2. very short screen darkening
3. large APOCALYPSE CLEARED title
4. gold + purple shockwave
5. show Coin/Gem reward
6. set ULT to 100%
7. activate OVERDRIVE for 20 seconds
8. return to normal LIMIT BREAK combat

No boss silhouette or fake boss warning is used in Stage 11.1.

## APOCALYPSE reward
Tier I:
- 10,000 Coins
- 150 Gems
- ULT immediately set to 100%
- OVERDRIVE for 20 seconds

OVERDRIVE:
- Damage +35%
- Attack Speed +25%
- Move Speed +20%
- BREAK maintenance duration +1 second

Tier II+:
- Coins and Gems scale by tier reward multiplier
- OVERDRIVE strength and duration remain fixed

## Reward buffs
MEGA SURGE Attack Speed buff, ELITE DOMINION Damage/Attack Speed buff, and APOCALYPSE OVERDRIVE are run-local temporary buffs.

They are not persisted.

If an LB event ends the run in failure, active temporary LB reward buffs end with the run.

## Dedicated event HUD
Add a dedicated LIMIT BREAK EVENT HUD separate from the Stage 11.0 THREAT/LIMIT BREAK HUD.

Examples:

MEGA SURGE:
- MEGA SURGE
- 43 / 96 ENEMIES
- TIME 17.4s

ELITE DOMINION:
- ELITE DOMINION
- 7 / 12 ELITES
- TIME 21.8s

APOCALYPSE:
- PHASE 2 — GOLDEN STORM
- 31 / 50 KILLS
- TIME 8.2s

Preparation phase:
- LIMIT BREAK EVENT
- event name
- 3 / 2 / 1 / START

The Stage 11.0 THREAT/LIMIT BREAK HUD remains visible.

## Next-event HUD
Outside an active event, show the next LIMIT BREAK event target.

Examples:
- NEXT: MEGA SURGE — LB3
- 412 KILLS REMAINING
- NEXT: ELITE DOMINION — LB5

This is informational only and must not alter LIMIT BREAK progression.

## Visual direction
Event starts should be flashy but readable.

Use:
- short screen darkening
- large event title
- screen-edge lighting
- colored shockwave
- restrained camera shake

Do not return to the earlier heavy-shake style.

Performance Mode must retain event logic, enemy counts, objectives, timers, HP, and rewards. It may reduce event particles, glows, secondary shockwaves, trails, and text effects only.

## Audio direction
Create dedicated Stage 11.1 event SFX.

Required families:
- LIMIT BREAK EVENT warning
- countdown pulse
- START
- MEGA SURGE start
- ELITE DOMINION start
- APOCALYPSE start
- PHASE CHANGE
- BREAK EXECUTION
- CLEARED
- FAILED

Audio identity:
- heavy danger-warning style
- low-end pressure
- short pulses
- short impactful transients
- controlled high frequencies
- no harsh metallic clang
- no piercing hiss
- no long reverb tails
- readable during dense combat
- low listener fatigue

APOCALYPSE start must feel substantially heavier than ordinary event starts.

Do not add a dedicated APOCALYPSE BGM in Stage 11.1.

## State model
Stage 11.1 state is run-local only.

Expected concepts:
- current event
- current event instance id
- current event tier
- preparation countdown
- event remaining time
- current APOCALYPSE phase
- current phase objective count
- queued milestone events
- temporary reward buffs

None of this is persisted to localStorage.

## Restart / stale-timer safety
A reset or run end must invalidate all pending LB-event delayed callbacks and queued actions.

No countdown, spawn wave, BREAK EXECUTION callback, phase transition, or queued event from a prior run may fire in a new run.

Use a run/event token or equivalent generation guard for delayed callbacks.

## Testing requirements
Automated regression coverage must prove at minimum:

- exact milestone mapping for LB3/5/10 and repeating 15-LB cycles
- exact tier scaling (+35% enemy count / currency reward per tier)
- event queue order and no overlap
- event kills still advance runKills/LIMIT BREAK
- pre-existing enemies do not count toward objectives
- preparation allows movement but freezes combat/spawning
- CHAOS and boss timers pause and resume without reset
- MEGA SURGE 25-second timeout and sequential directional structure
- ELITE DOMINION 30-second timeout and Tier I 4/4/4 composition
- Berserker dash state does not persist across reset
- Titan chain explosions produce real kills/rewards and cannot hurt player
- BREAK EXECUTION produces zero kill/reward/progression credit
- APOCALYPSE phase objectives 70/50/90 and deadlines 12/12/16
- APOCALYPSE phases advance immediately on objective completion
- normal spawning is full / half / zero for MEGA / DOMINION / APOCALYPSE
- event failure ends the run
- reward values and temporary buff values are exact
- Tier II+ scales only currency rewards and event enemy counts
- dedicated event HUD and next-event HUD report correct targets
- Performance Mode never changes event gameplay values
- stale callbacks from a previous run cannot affect the next run
- JavaScript remains syntactically valid
