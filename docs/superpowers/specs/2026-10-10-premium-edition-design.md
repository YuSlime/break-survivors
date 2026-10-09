# BREAK SURVIVORS — Premium Edition Design Specification

Date: 2026-10-10  
Status: Approved product/design direction. Implementation has not started.  
Target: incremental rollout on `main` behind feature flags.

## 1. Purpose

BREAK SURVIVORS Premium Edition is a full refinement of the existing browser game, not a replacement project. The goal is to turn the current feature-rich prototype into a coherent, high-end experience where combat feel, VFX, camera, sound, HUD, progression, build crafting, enemies, bosses, stages, rewards, gacha, mobile controls, and technical structure all reinforce one another.

Existing strengths — BREAK, FEVER, Threat, LIMIT BREAK events, Chaos Events, Treasure enemies, bosses, character growth, CORE GRID, ULTs, gacha, and the current audio foundation — are retained and improved rather than discarded.

The intended experience is:

> Every second of combat feels responsive; every 20–30 seconds creates a meaningful shift; every few minutes produces a memorable climax.

The final product should feel like a polished premium indie title while remaining a fast-loading Canvas browser game that works on PC and mobile.

## 2. Product Pillars

### Combat Feel
Every attack, impact, kill, BREAK, and boss event must feel responsive and readable.

### Build Crafting
Runs should create meaningfully different builds through modifiers, synergies, and rare evolutions. Very strong or occasionally “broken” builds are allowed because build completion should feel exciting.

### Long-Term Growth
Character growth, CORE GRID, difficulty, collection, and gacha provide reasons to return without replacing skill, build choice, or moment-to-moment play.

## 3. Success Criteria

Premium Edition is successful when:

- normal combat is satisfying without constant screen-filling effects;
- BREAK, FEVER, LIMIT BREAK, and boss phases feel progressively stronger and visually distinct;
- important information is understandable at a glance;
- character choice meaningfully changes play style;
- in-run upgrades create different builds from run to run;
- enemies create different tactical problems rather than mostly changing HP/speed;
- bosses are multi-phase encounters rather than high-HP normal enemies;
- stages change gameplay as well as appearance;
- in-run, character-specific, and account-wide progression have clearly different roles;
- old save data migrates automatically without losing progression;
- mobile remains practical and readable;
- new systems can be disabled independently if regressions occur;
- future development no longer requires placing every feature directly in one monolithic file.

## 4. Experience Hierarchy

Presentation is designed on three scales.

### MICRO — 0.1–2 seconds
Weapon fire, sword impacts, critical hits, ordinary enemy deaths, pickups, short camera kicks.

### MOMENT — 5–30 seconds
BREAK milestones, Elites, Treasure enemies, level-up choices, completed synergies, local hazards.

### CLIMAX — 1–3 minutes
FEVER, LIMIT BREAK, major anomalies, boss phases, boss kills, major reward sequences.

A central **Intensity Director** represents the current presentation intensity from 0–100.

Recommended ranges:

- calm/normal combat: 15–25
- dense combat: 30–40
- BREAK: 40–55
- major anomaly / Elite peak: 50–65
- FEVER: 65–75
- LIMIT BREAK: 80–90
- boss final phase / major climax: 95–100

The normal game deliberately remains restrained so that maximum intensity still feels exceptional.

## 5. Visual Direction

The Premium Edition art direction is:

- dark science-fantasy / cyber-survivor atmosphere;
- neon energy accents;
- pixel/digital motifs;
- strong silhouettes;
- premium but readable UI;
- dark backgrounds with selective high-energy highlights.

The game must avoid making every element glow equally. Brightness, saturation, motion, flash, and camera shake are treated as limited resources.

### Color language

- blue/cyan: standard energy, technology, ordinary abilities;
- orange: BREAK;
- pink/magenta: FEVER;
- violet/purple: LIMIT BREAK, VOID, reality distortion;
- red: immediate danger, boss threats, lethal telegraphs;
- gold: Legendary, Jackpot, exceptional success.

This meaning remains consistent across VFX, HUD, warning lines, screen treatments, and reward sequences.

## 6. Stages

Stages are gameplay spaces, not palette swaps.

### NEON RUINS
Visual: ruined city, wet pavement, broken signage, cables, abandoned machinery.  
Gameplay: activatable/destructible power units can stun enemies; supports fast swarm pressure.

### RESEARCH ZERO
Visual: damaged laboratory, cyan lighting, containment systems, warning lights.  
Gameplay: optional experimental devices increase danger in exchange for better rewards.

### ASH WASTELAND
Visual: red-black wasteland, heat shimmer, ashfall, unstable ground.  
Gameplay: periodic environmental strikes can hurt both player and enemies.

### VOID SECTOR
Visual: fragmented space, floating debris, violet-black lighting, reality distortion.  
Gameplay: stable/safe zones shift; intended for later-run and LIMIT BREAK pressure.

Each stage receives its own ambience, enemy emphasis, music treatment, and gameplay gimmick.

## 7. HUD

Rule:

> Important information may become prominent; unimportant information must get out of the way.

### PC

Top-left:
- character portrait;
- HP;
- level;
- temporary buffs;
- ULT readiness.

Top-center:
- time;
- kills;
- Threat;
- stage/run state.

Top-right:
- contextual event/Threat information;
- transforms into boss information during boss encounters.

Bottom-center:
- BREAK / FEVER progress.

Center:
- normally clear;
- reserved for BREAK, FEVER, WARNING, LIMIT BREAK, BOSS, PHASE CHANGE, major reward calls.

### Mobile

Mobile gets a dedicated layout rather than a scaled-down desktop layout:

- essential HP/status at top;
- compact run information;
- movement and combat controls near thumb zones;
- ULT on the opposite side;
- BREAK state along the bottom;
- secondary information collapses or appears contextually.

Boss information replaces lower-priority information instead of stacking another permanent panel.

## 8. Damage Numbers and Readability

Damage presentation has levels:

- normal hit: small, brief;
- critical: brighter and more forceful;
- overkill: larger and optionally labeled;
- weak point: distinct label/treatment;
- boss critical moment: limited special styling.

The renderer aggregates, suppresses, or prioritizes damage numbers under heavy load instead of drawing one label for every hit.

## 9. Combat Feel

A satisfying impact is built from multiple small signals:

- target reaction/flash;
- impact VFX;
- impact sound;
- limited damage text;
- directional debris;
- camera kick where appropriate;
- hit stop only for high-value impacts.

Recommended hit-stop starting points:

- normal hit: 0 ms;
- critical: ~15 ms;
- Elite kill: ~25 ms;
- BREAK activation: ~40 ms;
- boss kill / cinematic climax: ~70–100 ms.

These are tuning values, not permanent constants.

### Death signatures

Normal: small fragmentation and restrained light burst.  
Runner: fragments preserve movement direction.  
Tank: heavier pause and larger pieces.  
Elite: visible core break / signature destruction and stronger shockwave.  
Boss: dedicated multi-step death sequence, brief audio drop, core/crack failure, major shockwave, reward burst, arena recovery.

## 10. Camera Director

Scattered camera effects are consolidated into a Camera Director responsible for:

- shake;
- directional kick;
- zoom;
- focus;
- short slow-motion cues;
- hit-stop coordination.

Starting presentation rules:

- normal attacks: no camera movement;
- strong attack: 1–3 px directional kick;
- Elite death: controlled medium shake;
- BREAK: short 100% → 103% → 100% pulse;
- FEVER: subtle energized framing;
- LIMIT BREAK: pull back to reveal the battlefield, then snap back into combat;
- boss introduction: brief focus without taking control for too long;
- boss death: highest permitted camera response.

Reduced Motion modifies these effects without changing gameplay.

## 11. VFX Director

Gameplay systems should no longer directly manage every particle/ring effect. Presentation moves toward calls such as:

```js
VFX.enemyDeath(enemy)
VFX.critical(hit)
VFX.breakStart()
VFX.eliteDeath(enemy)
VFX.bossDeath(boss)
```

The VFX Director chooses effect strength using:

- event importance;
- Intensity Director state;
- platform;
- graphics/performance profile;
- current VFX budget.

Priority order:

1. ordinary weapon effects;
2. critical effects;
3. Elite effects;
4. BREAK/FEVER effects;
5. LIMIT BREAK/boss-critical effects.

When performance drops, low-priority decorative effects are reduced before gameplay-critical effects.

Explicit caps are supported for particles, damage text, rings, beams, explosions, and temporary overlays. Mobile/low, medium, high, and optional ultra profiles use different budgets.

## 12. BREAK and FEVER

BREAK remains a central identity.

As BREAK rises:

- orange accent becomes stronger;
- combat audio gains energy;
- low-level VFX rise slightly;
- HUD increasingly signals the next milestone;
- reward multipliers become more legible.

The transition is gradual.

### FEVER

FEVER changes the whole presentation:

- HUD becomes pink/gold;
- background saturation rises slightly;
- character trails intensify;
- attacks gain stronger trails;
- enemy death VFX increase;
- pickups feel more celebratory;
- an extra music layer appears;
- combo display becomes more prominent.

FEVER fades smoothly back to normal.

## 13. LIMIT BREAK

LIMIT BREAK becomes a signature chapter in the run.

Sequence:

1. music energy briefly drops;
2. battlefield darkens;
3. LIMIT BREAK title appears;
4. low-frequency/digital-distortion cue;
5. enemy entry zones telegraph;
6. battlefield shifts toward VOID/violet treatment;
7. wave spawns;
8. dedicated music layer/drop begins.

Existing Mega, Dominion, Apocalypse, execution, reward, and escalation concepts are retained and refined.

## 14. Boss Design

Bosses are multi-phase encounters.

Typical structure:

- Phase 1: establish core pattern;
- Phase 2: introduce arena pressure or a new mechanic;
- Phase 3: combine/intensify mechanics;
- Final phase: low-health transformation with new presentation and move set.

### VOID TYRANT reference design

- Phase 1: pursuit + baseline attacks;
- Phase 2 (~70% HP): Void Zones;
- Phase 3 (~40% HP): summons + projectile pressure;
- Final (~15% HP): VOID COLLAPSE, transformed background/audio/pacing.

Boss telegraphs remain readable even at maximum intensity.

Boss defeat creates a dedicated Boss Chest/reward sequence. Reward categories can include:

- Legendary in-run upgrade;
- Gems;
- character progression material;
- skin fragment;
- CORE resource.

## 15. Run Structure

The run should feel authored without becoming fully scripted.

### 0:00–0:30 — BUILD
Simple enemies, first upgrades, establish direction.

### 0:30–1:00 — ESCALATION
Runner/Tank mix, rising density, first Elite opportunities.

### 1:00–1:30 — BREAK
Stronger composition, reward opportunity, BREAK becomes realistic.

### 1:30–2:00 — CRISIS
Elite groups, Treasure chance, stage gimmicks, build starts to feel complete.

### 2:00+ — LIMIT / ENDLESS ESCALATION
LIMIT BREAK chapters, changing compositions, anomalies, recurring bosses, higher risk/reward.

Exact timings are balance variables.

## 16. In-Run Upgrades

Run upgrades have four conceptual levels.

### STAT
Numerical growth: damage, attack speed, area, HP.

### MODIFY
Changes behavior: Ricochet, Piercing Core, Split Shot, Execution.

### SYNERGY
Combines mechanics: criticals trigger lightning, BREAK kills cause explosions, marked enemies amplify another weapon type.

### EVOLUTION
Rare build-defining transformations, normally one or two per run.

- Gunner → RAILSTORM
- Bomb Cat → NUCLEAR CASCADE
- Thunder Fox → THUNDER GOD
- Blademaster → VOID BLADE
- Nova → SUPERNOVA
- Missile Queen → TOTAL ANNIHILATION

The game deliberately permits memorable high-power combinations instead of forcing every build toward identical output.

## 17. Upgrade Choice Quality

Recommended starting rules:

- normal level-up: 3 choices;
- BREAK: 4 choices or improved rarity opportunity;
- boss reward: wider/high-rarity selection;
- LIMIT BREAK clear: special risk/reward choice.

Example LIMIT choices:

- enemies +25%, rewards +40%;
- much higher Elite presence, improved rare reward opportunity;
- stronger next boss, doubled boss reward class.

Players can intentionally raise danger to increase reward.

## 18. Character Identity

Changing character should feel close to changing the game.

### Gunner
Identity: speed + precision.  
Mechanics: rapid fire, criticals, piercing, ricochet, heat/momentum.  
Signature meter: **MOMENTUM**.  
Evolution: **RAILSTORM**.

### Bomb Cat
Identity: explosions + chain reactions.  
Mechanics: bombs, mines, clusters, chain detonations.  
Signature meter: **CHAIN**.  
Evolution: **NUCLEAR CASCADE**.

### Thunder Fox
Identity: lightning + crowd control.  
Mechanics: chain lightning, shock, stun, storm fields.  
Signature meter: **VOLTAGE**.  
Evolution: **THUNDER GOD**.

### Blademaster
Identity: high-risk close combat.  
Mechanics: dash, slash, parry, execution.  
Signature meter: **FLOW** — maintained by aggressive movement, clean hits, and successful close-range play; drops when combat rhythm is broken.  
Evolution: **VOID BLADE**.

### Nova
Identity: charged energy + area destruction.  
Mechanics: charge, orbs, gravity, nova explosions.  
Signature meter: **RESONANCE** — builds through charged/linked energy events and empowers large releases at high values.  
Evolution: **SUPERNOVA**.

### Missile Queen
Identity: lock-on + battlefield targeting.  
Mechanics: homing missiles, multi-lock, air strike, cluster missiles.  
Signature meter: **TARGET LOCK** — accumulates through maintained target acquisition and is spent on high-value multi-target salvos.  
Evolution: **TOTAL ANNIHILATION**.

## 19. Progression Layers

### Run Upgrade
Temporary and exists only for the current run.

### Character Growth
Permanent and character-specific. Existing concepts remain:

- character level;
- Lv20 branch;
- Lv30 ULT;
- Lv50 awakening;
- star rank.

### CORE GRID
Permanent broad/account progression. It should contain meaningful endpoints, not only incremental statistics.

Example branch identities:

- Survival: HP → Shield → Revive → PHOENIX CORE;
- Attack: Damage → Critical → Overkill → ANNIHILATION CORE;
- BREAK: duration → FEVER strength → combo protection → ETERNAL BREAK.

The exact node graph is a balance/design deliverable for the CORE phase; these branch identities are fixed.

## 20. Enemy Roles

Enemy categories:

- Swarm: fills space and fuels mass kills;
- Runner: fast pressure;
- Tank: blocks space;
- Shooter: ranged pressure;
- Support: buffs enemies;
- Assassin: sudden high-priority pressure;
- Summoner: creates additional enemies;
- Shielder: protects nearby units;
- Elite: special mechanics.

Enemy combinations should create questions such as “what must I kill first?” rather than simply increasing total HP.

## 21. Elite Expansion

Existing Berserker, Titan, and Gold remain.

Additional Elite identities:

- Mirror: directional/partial reflection mechanic;
- Void: strengthens nearby enemies;
- Reaper: persistent player hunter;
- Overload: becomes stronger over time.

Every Elite must be visually identifiable before its mechanic becomes dangerous.

## 22. Chaos / Anomaly Events

Some anomalies become player choices instead of purely automatic events.

Example:

- BLOOD MOON: enemies +50%, player damage +30%, rewards +50%;
- GOLD RUSH: increased Gold enemy activity;
- VOID STORM: increased Elite density and Gem rewards.

Not every event requires a menu; pacing must remain fast.

## 23. Treasure

Flow:

1. TREASURE SIGNAL;
2. target attempts escape;
3. defeat creates jackpot feedback;
4. player receives a concise treasure reward or choice.

Reward categories can include Coins, Gems, or a random/high-rarity upgrade opportunity.

## 24. Gacha and Collection

Gacha unlocks play styles and supports collection/progression; it must not become the sole determinant of combat success.

- new characters are the highest-value outcome;
- duplicates advance star progression;
- excess duplicates convert into a flexible progression currency instead of becoming worthless.

Legendary reveal:

- first acquisition: full sequence;
- repeated acquisition: shortened sequence;
- settings: skip option.

The current Orbital Summon identity remains and is restyled into the same Premium Edition language.

## 25. Results and Replay Motivation

Run results show:

- character;
- final build/evolution;
- survival time;
- kills;
- damage;
- highest BREAK;
- LIMIT BREAK level;
- bosses;
- rare drops;
- new records.

The final build is displayed as a compact summary/card so players can immediately compare runs and want to try another route.

## 26. Difficulty and Risk

Challenge modes:

- Standard;
- Danger;
- Nightmare;
- Abyss.

Higher modes raise risk and rewards rather than only multiplying HP.

Optional run modifiers can include:

- Glass Cannon: lower HP, much higher damage;
- Elite Hunt: more Elites and better Elite rewards;
- Void Debt: stronger future waves in exchange for immediate rewards.

Exact numerical values are balancing parameters.

## 27. Reward Hierarchy

Reward presentation follows intensity:

- small: ordinary kill;
- medium: BREAK milestone / ordinary upgrade;
- large: Elite / Treasure;
- very large: boss;
- jackpot: LIMIT BREAK milestone / major rare reward.

Reward value, sound, camera, VFX, and UI must agree.

## 28. Audio Director

Preserve and expand the Web Audio foundation.

Logical buses:

- Master;
- Music;
- Weapon;
- Impact;
- Enemy;
- UI;
- Ambience.

Music layers react to game state:

- normal: base layer;
- BREAK: percussion/energy layer;
- FEVER: higher-energy synth layer;
- LIMIT BREAK: dedicated layer/theme;
- Boss: phase-aware boss theme.

Audio follows the same event hierarchy as VFX and camera.

## 29. Encounter Director

Threat, Chaos Events, Treasure, Boss, and LIMIT BREAK remain separate gameplay systems but are coordinated by an Encounter Director.

Responsibilities:

- prevent incompatible major events from stacking unintentionally;
- create deliberate pacing;
- coordinate warnings;
- create short recovery periods after major peaks;
- account for run stage and current player pressure.

It is a pacing coordinator, not a fully deterministic timeline.

## 30. Technical Architecture

Canvas 2D + browser JavaScript remains the engine. Phaser/Pixi/Unity/Godot migration is out of scope.

The single-file architecture is dismantled incrementally toward:

```text
index.html
src/
  bootstrap.js
  game/
    runtime.js
    state.js
    loop.js
  directors/
    intensity.js
    camera.js
    encounter.js
    audio.js
  systems/
    combat.js
    enemies.js
    break.js
    threat.js
    limit-break.js
    upgrades.js
    loot.js
    boss.js
  characters/
    gunner.js
    bombcat.js
    thunderfox.js
    blademaster.js
    nova.js
    missilequeen.js
  presentation/
    vfx.js
    damage-numbers.js
    screen-effects.js
    transitions.js
  ui/
    hud.js
    upgrades.js
    results.js
    characters.js
    gacha.js
  data/
    enemies.js
    upgrades.js
    characters.js
    stages.js
    balance.js
  save/
    storage.js
    migrations.js
styles/
  game.css
  hud.css
  menus.css
  gacha.css
  effects.css
assets/
tests/
```

This is a target architecture, not a one-shot rewrite requirement.

## 31. Game Logic vs Presentation

Principle:

> Gameplay decides what happened. Presentation decides how it looks, sounds, and feels.

Enemy death example:

Gameplay:
- mark dead;
- register kill;
- calculate reward;
- update BREAK;
- update progression.

Presentation:
- VFX death signature;
- camera response;
- audio response;
- HUD/combo response.

Changing an explosion must not change reward logic.

## 32. Save Compatibility

Existing saves must be preserved.

Introduce `saveVersion` and a migration flow:

1. read data;
2. detect version;
3. migrate forward;
4. validate essential fields;
5. persist the new format only after a successful migration.

Migration tests must preserve at minimum:

- Coins;
- Gems;
- owned characters;
- star ranks;
- character levels;
- branch/awakening progression where applicable;
- CORE progression;
- settings.

Premium Edition must not require a save reset.

## 33. Feature Flags

Major systems roll out independently.

```js
PREMIUM_FEATURES = {
  intensityDirector: true,
  newHud: false,
  newCamera: false,
  newVfx: false,
  upgradeSystemV2: false,
  enemiesV2: false,
  bossV2: false,
  stagesV2: false
}
```

These are rollout/development safety controls, not permanent player settings.

## 34. Performance Strategy

Rules:

- prefer high-value effects over huge quantities;
- pool frequently created temporary objects where measurements justify it;
- cap low-value particles and damage text;
- reduce low-priority presentation before critical presentation;
- never hide boss telegraphs under decorative effects;
- profile mobile separately from desktop.

Primary pooling candidates:

- bullets;
- particles;
- damage numbers;
- rings;
- pickups;
- missiles.

Automatic quality adaptation may reduce presentation density after sustained low FPS; manual quality override should remain available.

## 35. Reduced Motion

Add Reduced Motion.

It can lower:

- screen shake;
- flash intensity;
- zoom pulses;
- decorative particles.

It must never change difficulty or hide critical telegraphs.

## 36. Testing

Expand the current Threat/LIMIT BREAK test base into coverage for:

- combat;
- Threat;
- BREAK/FEVER;
- LIMIT BREAK;
- upgrade selection;
- characters;
- enemies;
- boss phases;
- loot/rewards;
- save/storage;
- migrations;
- gacha;
- HUD state where practical.

### Save regression
Old save fixtures load and retain equivalent progression.

### Balance simulations
Deterministic or lightweight multi-run simulations compare characters/builds and detect extreme outliers. These are diagnostic tools, not a requirement for equal DPS.

### Performance scenarios
Measure at least normal wave, high Threat, FEVER, dense LIMIT BREAK, projectile-heavy boss, and mobile viewport.

## 37. Implementation Sequence

### Phase 0 — FREEZE / BASELINE
Record current behavior, preserve current build, validate saves, establish FPS and key-screen baselines.

### Phase 1 — FOUNDATION
Create modular boundaries, save/migration layer, feature flags, game-state/event foundation. Keep visible changes minimal.

### Phase 2 — FEEL
Camera Director, hit stop, VFX Director, Audio Director integration, damage-number improvements, enemy death signatures.

### Phase 3 — HUD
Premium HUD, dynamic hierarchy, BREAK/FEVER/Threat/Boss integration, dedicated mobile layout.

### Phase 4 — COMBAT 2.0
Character meters, MODIFY, SYNERGY, EVOLUTION, improved level-up selection.

### Phase 5 — ENEMIES 2.0
Additional roles, Elite expansion, encounter composition improvements.

### Phase 6 — STAGES
Neon Ruins, Research Zero, Ash Wasteland, Void Sector and their gameplay gimmicks.

### Phase 7 — BOSS 2.0
Multi-phase bosses, boss UI/audio/presentation, dedicated boss rewards.

### Phase 8 — LIMIT BREAK 2.0
Premium presentation, pacing integration, milestone/reward refinement.

### Phase 9 — META
Character Growth refinement, CORE GRID refinement, difficulty/risk, economy tuning.

### Phase 10 — GACHA / COLLECTION
Final Orbital Summon integration, duplicate conversion, reveal variants.

### Phase 11 — OPTIMIZATION
FPS, memory, mobile, loading, audio voices, VFX budgets.

### Phase 12 — FINAL POLISH
Review boot, menu, combat, BREAK, FEVER, LIMIT BREAK, boss, death, results, characters, CORE GRID, and gacha as finished product states.

## 38. Definition of Done for a Major Feature

A major feature is complete only after review of:

1. Gameplay;
2. Visuals;
3. Audio;
4. Camera;
5. UI/UX;
6. Performance;
7. Mobile behavior;
8. Tests where applicable.

A new boss, for example, is not complete when its attacks merely function. Telegraphs, HUD, audio/music, phase transitions, defeat sequence, rewards, mobile readability, performance, and regression behavior are part of the same feature.

## 39. Explicit Non-Goals

Premium Edition does not require:

- migration to another game engine;
- rewriting every current system before visible improvements begin;
- deleting or resetting current progression;
- photorealistic rendering;
- maximum possible particle count;
- perfectly equal character builds;
- a fully deterministic encounter timeline.

## 40. Final Experience Statement

BREAK SURVIVORS Premium Edition should feel like a world that progressively awakens as the player succeeds:

**Normal Combat → BREAK → FEVER → LIMIT BREAK → BOSS / CLIMAX**

This escalation is not only visual. Enemy behavior, rewards, audio, camera, HUD, build power, and player decision-making rise together.

The final game must preserve what already makes BREAK SURVIVORS recognizable while making it deliberate, premium, readable, replayable, and technically sustainable.
