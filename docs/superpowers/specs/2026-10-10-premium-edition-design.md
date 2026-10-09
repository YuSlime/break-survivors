# BREAK SURVIVORS — Premium Edition Design Specification

Date: 2026-10-10
Status: Approved design, implementation not started
Target: `main` production line, introduced incrementally behind feature flags

## 1. Purpose

BREAK SURVIVORS Premium Edition is a full refinement of the existing browser game, not a replacement project. The goal is to turn the current feature-rich prototype into a coherent, high-end game experience where combat feel, visual effects, camera, sound, HUD, progression, build crafting, enemies, bosses, stages, rewards, gacha, mobile controls, and technical architecture all reinforce the same experience.

The redesign must preserve the identity and existing investment in BREAK SURVIVORS. Existing systems such as BREAK, FEVER, Threat, LIMIT BREAK events, Chaos Events, Treasure enemies, bosses, character growth, CORE GRID, ULTs, gacha, and audio are retained where useful and refined rather than discarded.

The intended experience is:

> Every second of combat should feel responsive; every 20–30 seconds should create a meaningful shift; every few minutes should produce a memorable climax.

The game should feel like a polished premium indie title while remaining a fast-loading browser game that works on both PC and mobile.

## 2. Success Criteria

Premium Edition is successful when the following are true:

- Normal combat is readable, responsive, and satisfying without relying on constant screen-filling effects.
- BREAK, FEVER, LIMIT BREAK, and boss phases feel progressively more intense and clearly distinct.
- Players can understand important combat information at a glance.
- Character choice meaningfully changes play style.
- Run upgrades can create dramatically different builds from run to run.
- Strong upgrade synergies and rare "broken" builds are possible without making every run identical.
- Enemies create different tactical problems rather than being mostly HP/speed variants.
- Bosses are multi-phase encounters rather than large-health normal enemies.
- Stages change gameplay as well as appearance.
- Long-term progression, character progression, and in-run progression have clearly separated roles.
- Existing save data remains valid and migrates automatically.
- The game remains practical on mobile and lower-performance devices.
- New systems can be disabled independently through feature flags if regressions occur.
- Future development no longer requires adding every feature directly into a single monolithic file.

## 3. Core Experience Model

### 3.1 Three intensity scales

The moment-to-moment experience is designed on three layers.

### MICRO — 0.1 to 2 seconds

Examples:
- weapon fire
- sword impacts
- critical hits
- small enemy deaths
- pickup attraction
- short camera kicks

These effects must be fast and controlled. Ordinary actions should feel good without exhausting the visual hierarchy.

### MOMENT — 5 to 30 seconds

Examples:
- BREAK milestones
- Elite encounters
- Treasure enemies
- level-up choices
- completed synergies
- local hazards

These create short spikes in attention and reward.

### CLIMAX — 1 to 3 minutes

Examples:
- BREAK FEVER
- LIMIT BREAK
- major anomaly events
- boss encounters
- final boss phases
- major reward sequences

These are allowed to transform the entire presentation.

### 3.2 Intensity ladder

A central Intensity Director maintains a conceptual intensity value from 0 to 100. Systems do not need to share an exact numerical curve, but they must follow the same hierarchy.

Suggested targets:

- calm exploration/combat: 15–25
- high-density combat: 30–40
- BREAK: 40–55
- Elite or major anomaly: 50–65
- FEVER: 65–75
- LIMIT BREAK: 80–90
- boss final phase / major climax: 95–100

The purpose is not to make every scene louder. The normal game must remain restrained enough that the highest states still feel exceptional.

## 4. Art Direction

### 4.1 Core visual identity

The visual direction remains rooted in:

- dark science-fantasy / cyber-survivor atmosphere
- neon energy accents
- pixel/digital motifs
- strong silhouettes
- premium but readable UI
- restrained background values with selective high-energy highlights

The game must avoid the failure mode of making every element glow equally. Brightness, saturation, animation, and screen shake are treated as scarce resources.

### 4.2 Combat state color language

Colors communicate gameplay state:

- blue/cyan: standard energy, technology, ordinary abilities
- orange: BREAK
- pink/magenta: FEVER
- purple/violet: LIMIT BREAK, VOID, reality distortion
- red: immediate danger, boss threats, lethal telegraphs
- gold: Legendary, Jackpot, rare rewards, exceptional success

The same meaning should remain consistent across VFX, HUD, warning lines, audio-linked pulses, and reward sequences.

## 5. Battlefield and Stage Presentation

Stages must be more than background palettes. Each stage receives a visual identity, gameplay gimmick, enemy emphasis, ambience, and music treatment.

Initial Premium Edition stage set:

### NEON RUINS

Theme:
- ruined urban district
- wet pavement
- broken signage
- power cables and abandoned machinery

Gameplay identity:
- destructible or activatable power units can stun nearby enemies
- supports fast swarm-heavy encounters

### RESEARCH ZERO

Theme:
- damaged laboratory
- pale cyan lighting
- broken containment systems
- emergency warning lights

Gameplay identity:
- optional experimental devices can increase enemy danger in exchange for better rewards

### ASH WASTELAND

Theme:
- red-black wasteland
- heat shimmer
- ashfall
- unstable ground

Gameplay identity:
- periodic environmental strikes can hurt both player and enemies
- positioning matters more strongly

### VOID SECTOR

Theme:
- fragmented space
- floating debris
- violet-black lighting
- reality distortion

Gameplay identity:
- safe or stable zones can shift
- designed for late-run and LIMIT BREAK escalation

## 6. HUD Design

The HUD follows one rule:

> Important information may become prominent; unimportant information must get out of the way.

### 6.1 PC layout

Top-left:
- character portrait
- HP
- level
- temporary buffs
- ULT readiness

Top-center:
- time
- kills
- Threat
- stage/run state

Top-right:
- contextual system area
- normally restrained Threat/event information
- transforms into boss information during boss fights

Bottom-center:
- BREAK / FEVER progress
- becomes visually stronger only near important thresholds

Center screen:
- normally kept clear
- reserved for major calls such as BREAK, FEVER, WARNING, LIMIT BREAK, BOSS, PHASE CHANGE

### 6.2 Mobile layout

Mobile must not simply be a smaller PC interface.

It should prioritize:
- HP and essential status at the top
- minimal run information
- joystick/skill controls near thumbs
- ULT on the opposite side
- BREAK state along the bottom

Secondary information can collapse or appear contextually.

### 6.3 Dynamic hierarchy

When a boss appears, boss information replaces less important status rather than stacking another permanent panel.

When LIMIT BREAK begins, ordinary event panels reduce emphasis.

When no major event exists, the center of the battlefield remains visually open.

## 7. Damage Numbers and Combat Readability

Damage numbers communicate event importance.

Recommended hierarchy:

- normal hit: small, brief, low visual weight
- critical: brighter, stronger animation, exclamation/accent
- overkill: larger and optionally labeled
- weak point: distinct label and color treatment
- boss critical event: limited special styling

Damage text must be budgeted. The renderer should aggregate, suppress, or prioritize numbers when combat density is high rather than drawing one label for every hit.

This improves readability and performance simultaneously.

## 8. Combat Feel

### 8.1 Hit response

A good hit is a combination of several small signals:

- target flash/react
- impact VFX
- impact sound
- limited damage text
- directional debris
- camera kick when appropriate
- optional hit stop for high-value impacts

No single signal should carry the entire impact.

### 8.2 Hit stop

Suggested values:

- normal hit: 0 ms
- critical hit: ~15 ms
- Elite kill: ~25 ms
- BREAK activation: ~40 ms
- boss kill / cinematic climax: ~70–100 ms

Hit stop must remain short enough not to make controls feel sluggish.

### 8.3 Enemy death signatures

Normal:
- small fragmentation
- restrained light burst

Runner:
- debris retains directional velocity

Tank:
- heavier pause and larger fragments

Elite:
- visible core break or signature destruction
- larger shockwave

Boss:
- dedicated multi-step death sequence
- momentary audio drop
- cracks/core failure
- large shockwave
- reward burst
- arena recovery/relief

## 9. Camera Director

Replace scattered camera shake logic with a Camera Director responsible for:

- shake
- kick
- zoom
- focus
- slow-motion cues
- hit stop integration

Suggested presentation:

- normal attacks: no camera movement
- strong attack: 1–3 px directional kick
- Elite death: 3–5 px shake equivalent
- BREAK: short 100% → 103% → 100% pulse
- FEVER: subtle wider/energized framing
- LIMIT BREAK: pull back, present the battlefield, then snap back into combat
- boss introduction: brief focus without excessively stealing control
- boss death: highest permitted camera response

Camera must support reduced-motion settings.

## 10. VFX Director

Gameplay systems should stop directly managing low-level effect arrays wherever practical.

Desired API style:

```js
VFX.enemyDeath(enemy)
VFX.critical(hit)
VFX.breakStart()
VFX.eliteDeath(enemy)
VFX.bossDeath(boss)
```

The VFX Director chooses effect strength based on:

- event type
- Intensity Director state
- platform
- graphics/performance profile
- current VFX budget

### 10.1 VFX priority

Priority example:

1. ordinary weapon effects
2. critical effects
3. Elite effects
4. BREAK/FEVER effects
5. LIMIT BREAK/boss critical effects

When performance is under pressure, low-priority effects are reduced first.

### 10.2 VFX budgets

Budgets should be tuned empirically, but the architecture must support explicit caps for:

- particles
- damage text
- rings
- beams
- explosions
- temporary overlays

Separate presets are required for mobile/low, medium, high, and optional ultra settings.

## 11. BREAK and FEVER

BREAK remains one of the game's core identities.

### BREAK progression

As BREAK climbs:
- orange accent becomes more noticeable
- combat audio gains additional energy
- minor VFX intensity rises
- HUD begins signaling proximity to a milestone
- reward multipliers become more legible

The presentation should escalate gradually rather than flip instantly from calm to maximum.

### FEVER

FEVER is a whole-game state change:

- HUD shifts to pink/gold emphasis
- background saturation rises slightly
- character trails intensify
- attack trails improve
- enemy death effects become stronger
- coin/pickup attraction becomes more celebratory
- an additional music layer appears
- combo presentation becomes larger

FEVER must fade back to normal smoothly rather than ending abruptly.

## 12. LIMIT BREAK

LIMIT BREAK becomes a signature BREAK SURVIVORS event rather than only a difficult wave.

Recommended sequence:

1. music energy drops briefly
2. battlefield darkens
3. LIMIT BREAK title appears
4. low-frequency impact / digital distortion cue
5. enemy entry zones telegraph
6. battlefield shifts toward violet/VOID treatment
7. wave spawns
8. dedicated music layer or drop begins

Existing Mega, Dominion, Apocalypse, execution, reward, and escalation concepts should be preserved and refined.

LIMIT BREAK must feel like entering a new chapter of the run.

## 13. Boss Design

Bosses must no longer feel like ordinary enemies with more HP.

Each major boss should have at least three distinct phases when appropriate:

- phase 1: establish core pattern
- phase 2: introduce arena pressure or new mechanic
- phase 3: combine or intensify patterns
- optional final phase: low-health transformation with new presentation and move set

Example: VOID TYRANT

- Phase 1: pursuit and baseline attacks
- Phase 2 (~70% HP): Void Zones
- Phase 3 (~40% HP): summons plus projectile pressure
- Final (~15% HP): VOID COLLAPSE, transformed background/audio/attack pacing

Boss telegraphs must remain readable even when the battle is visually intense.

Boss defeat grants a dedicated Boss Chest/reward sequence rather than only ordinary drops.

Possible reward categories:
- Legendary in-run upgrade
- Gems
- character progression material
- skin fragment
- CORE resource

## 14. Run Structure

The run should feel authored even though combat remains dynamic.

Suggested pacing model:

### 0:00–0:30 — BUILD

- simple enemies
- first upgrades
- establish direction

### 0:30–1:00 — ESCALATION

- Runner/Tank mix
- rising density
- first Elite opportunities

### 1:00–1:30 — BREAK

- stronger composition
- meaningful reward opportunity
- BREAK should become realistically achievable

### 1:30–2:00 — CRISIS

- Elite groups
- Treasure chance
- stage gimmicks
- build begins to feel complete

### 2:00+ — LIMIT / ENDLESS ESCALATION

- LIMIT BREAK chapters
- changing compositions
- stage/anomaly pressure
- recurring bosses
- higher risk and rewards

Exact times remain tuning variables, not hard permanent rules.

## 15. In-Run Upgrade System

Run upgrades are divided into four conceptual tiers.

### STAT

Simple numerical improvements, still necessary but not dominant.

Examples:
- damage
- attack speed
- area
- HP

### MODIFY

Changes how an attack behaves.

Examples:
- Ricochet
- Piercing Core
- Split Shot
- Execution

### SYNERGY

Combines mechanics into a more specific build identity.

Examples:
- critical hits trigger chain lightning
- BREAK kills cause secondary explosions
- missiles mark targets that amplify beam damage

### EVOLUTION

Rare build-defining transformations, generally only one or two per run.

Examples:
- Gunner → RAILSTORM
- Bomb Cat → NUCLEAR CASCADE
- Thunder Fox → THUNDER GOD
- Blademaster → VOID BLADE
- Nova → SUPERNOVA
- Missile Queen → TOTAL ANNIHILATION

The game should allow occasional extremely powerful builds. Perfect power equality is not the goal; memorable build completion is.

## 16. Upgrade Choice Quality

Upgrade selection should reflect game state.

Suggested rules:

- normal level-up: 3 choices
- BREAK: 4 choices or improved rarity opportunity
- boss reward: wider/high-rarity selection
- LIMIT BREAK clear: special risk/reward choice

Example LIMIT choice:

- increase enemy danger +25%, rewards +40%
- greatly increase Elite presence, improve rare reward chances
- strengthen next boss, double boss reward class

Players should be able to deliberately make the run more dangerous in exchange for better rewards.

## 17. Character Identity

Changing character should feel close to changing the game.

### Gunner

Identity: speed and precision

Mechanics:
- rapid fire
- criticals
- piercing
- ricochet
- heat/momentum

Signature meter: MOMENTUM

Evolution target: RAILSTORM

### Bomb Cat

Identity: explosion and chain reactions

Mechanics:
- bombs
- mines
- cluster effects
- chain detonations

Signature meter: CHAIN

Evolution target: NUCLEAR CASCADE

### Thunder Fox

Identity: lightning and crowd control

Mechanics:
- chain lightning
- shock
- stun
- storm fields

Signature meter: VOLTAGE

Evolution target: THUNDER GOD

### Blademaster

Identity: high-risk close combat

Mechanics:
- dash
- slash
- parry
- execution

Signature meter: combat-flow / edge meter (final name to be chosen during implementation planning)

Evolution target: VOID BLADE

### Nova

Identity: charged energy and area destruction

Mechanics:
- charge
- orbs
- gravity
- nova explosions

Signature meter: energy/core charge (final name to be chosen during implementation planning)

Evolution target: SUPERNOVA

### Missile Queen

Identity: lock-on and battlefield targeting

Mechanics:
- homing missiles
- multi-lock
- air strike
- cluster missiles

Signature meter: lock/arsenal meter (final name to be chosen during implementation planning)

Evolution target: TOTAL ANNIHILATION

## 18. Progression Layers

Progression must be easy to understand.

### Run Upgrade

Temporary. Exists only for the current run.

### Character Growth

Permanent and character-specific.

Current concepts remain valid:
- character level
- Lv20 branch
- Lv30 ULT
- Lv50 awakening
- star rank

### CORE GRID

Permanent account-wide or broad progression.

CORE GRID should contain clear end goals, not only incremental statistics.

Possible branch examples:

Survival:
HP → Shield → Revive → PHOENIX CORE

Attack:
Damage → Critical → Overkill → ANNIHILATION CORE

BREAK:
BREAK duration → FEVER strength → combo protection → ETERNAL BREAK

The exact node graph remains a later balancing/design task, but the branch identity is fixed by this specification.

## 19. Enemy Roles

Enemy design is role-based.

Required categories over time:

- Swarm: fills space and fuels satisfying mass kills
- Runner: fast pressure
- Tank: blocks space
- Shooter: ranged pressure
- Support: buffs enemies
- Assassin: sudden approach / high priority
- Summoner: creates additional enemies
- Shielder: protects nearby units
- Elite: special mechanics

Enemy combinations should create tactical questions such as "what must I kill first?" rather than only increasing total HP.

## 20. Elite Expansion

Existing Berserker, Titan, and Gold concepts remain and are expanded.

Additional candidates:

- Mirror: partial attack reflection or directional counter mechanic
- Void: buffs nearby enemies
- Reaper: persistent player hunter
- Overload: becomes stronger over time

Every Elite must be visually identifiable before its mechanic becomes dangerous.

## 21. Chaos / Anomaly Events

Chaos events become more interactive.

Instead of every anomaly being purely automatic, some events present player choice.

Example:

ANOMALY DETECTED

- BLOOD MOON: enemies +50%, player damage +30%, rewards +50%
- GOLD RUSH: increased Gold enemy activity
- VOID STORM: increased Elite density and Gem rewards

Not every event needs a menu; event pacing must remain fast.

## 22. Treasure Design

Treasure enemies remain short-lived priority targets.

Flow:

1. TREASURE SIGNAL
2. enemy attempts escape
3. defeat creates meaningful jackpot feedback
4. player receives a concise reward choice or treasure reward

Possible reward choice categories:
- Coins
- Gems
- random upgrade / higher-risk reward

## 23. Gacha and Collection

Gacha remains part of long-term progression but must not become the sole determinant of combat power.

Primary purposes:
- unlock new characters/play styles
- collection progression
- star-rank duplicate progression

Duplicate handling:
- duplicates advance star progress
- duplicates beyond useful progression convert into a flexible progression currency rather than becoming worthless

Legendary presentation:
- first acquisition: full reveal sequence
- repeats: shortened sequence
- settings: skip option

The existing Orbital Summon visual identity should be retained and brought into the same Premium Edition presentation language.

## 24. Results and Replay Motivation

Run results should show more than score totals.

Suggested summary:
- character
- final build/evolution
- survival time
- kills
- damage
- highest BREAK
- LIMIT BREAK level
- bosses
- rare drops
- new records

The player's completed build should be shown as a compact visual summary so the player is encouraged to try a different route next run.

## 25. Difficulty and Risk

Long-term challenge modes can include:

- Standard
- Danger
- Nightmare
- Abyss

Higher modes raise risk and rewards rather than only multiplying HP.

Optional run modifiers may include mechanics such as:

- Glass Cannon: lower HP, much higher damage
- Elite Hunt: increased Elite frequency and rewards
- Void Debt: stronger future waves in exchange for immediate rewards

Exact values remain balancing work.

## 26. Reward Hierarchy

Reward intensity follows the same hierarchy as presentation intensity.

- small: normal enemy kill
- medium: BREAK milestones / normal upgrades
- large: Elite / Treasure
- very large: boss
- jackpot: LIMIT BREAK milestone / major rare reward

Reward size, sound, camera, VFX, and UI presentation must agree with one another.

## 27. Audio Director

Preserve and expand the current Web Audio foundation.

Logical buses:

- Master
- Music
- Weapon
- Impact
- Enemy
- UI
- Ambience

Music is layered based on game state.

Example:
- normal: base layer
- BREAK: add percussion/energy
- FEVER: add synth/high-energy layer
- LIMIT BREAK: dedicated layer/theme
- Boss: boss theme with phase-aware changes

Audio intensity is controlled by the same event hierarchy as VFX and camera.

## 28. Encounter Director

Threat, Chaos Events, Treasure, Boss, and LIMIT BREAK remain separate gameplay systems but are coordinated by an Encounter Director.

Responsibilities:
- prevent incompatible major events from stacking unintentionally
- create deliberate pacing
- coordinate warning periods
- schedule opportunities for calm after major peaks
- respect run stage and current player pressure

This is not a fully deterministic timeline. It is a pacing coordinator.

## 29. Technical Architecture

The game remains Canvas 2D + browser JavaScript. A full engine migration is explicitly out of scope for Premium Edition.

The project will move away from a single-file architecture incrementally.

Target structure:

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

This is a target architecture, not a mandate to perform a one-shot rewrite.

## 30. Game Logic vs Presentation

Core principle:

> Gameplay decides what happened. Presentation decides how it looks, sounds, and feels.

Example: enemy death

Gameplay responsibilities:
- mark dead
- award kill
- calculate reward
- update BREAK
- update progression

Presentation listeners:
- VFX death signature
- camera response
- audio response
- HUD/combo response

Changing an explosion should not change reward logic.

## 31. Save Compatibility

Existing saves must be preserved.

Introduce:

```js
saveVersion
```

Save loading becomes:

1. read existing data
2. detect version
3. migrate forward
4. validate essential fields
5. persist new format only after successful migration

Migration tests must confirm that at minimum the following remain equivalent:

- Coins
- Gems
- owned characters
- star ranks
- character levels
- branch/awakening progression where applicable
- CORE progression
- settings

No Premium Edition release may intentionally require a save reset unless a future explicit design decision overrides this specification.

## 32. Feature Flags

Major new systems are independently switchable during rollout.

Example:

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

Flags are development/rollout safety tools, not permanent user-facing options.

## 33. Performance Strategy

Premium Edition must look better without assuming unlimited GPU/CPU resources.

Key rules:

- prefer high-value effects over huge quantities
- object-pool frequently created temporary objects where useful
- cap low-value particles and damage text
- degrade low-priority presentation before critical gameplay presentation
- avoid hiding boss telegraphs under decorative effects
- measure mobile separately from desktop

Potential pooling candidates:
- bullets
- particles
- damage numbers
- rings
- pickups
- missiles

Automatic performance adaptation may lower presentation density if sustained FPS falls below configured thresholds. Manual quality override remains desirable.

## 34. Accessibility and Motion

Add a Reduced Motion option.

It may reduce:
- screen shake
- flash intensity
- zoom pulses
- decorative particles

It must not modify game difficulty or hide gameplay-critical telegraphs.

## 35. Testing Strategy

The existing Threat and LIMIT BREAK tests remain useful and should be expanded into system-level coverage.

Required categories over the migration:

- combat
- Threat
- BREAK / FEVER
- LIMIT BREAK
- upgrade selection
- characters
- enemies
- boss phases
- loot/rewards
- save/storage
- migrations
- gacha
- HUD state where practical

### 35.1 Save regression tests

Old fixtures must load and preserve progression.

### 35.2 Balance simulations

Lightweight simulations should compare characters/builds across many runs or deterministic combat scenarios to identify extreme outliers.

These are diagnostic tools, not an attempt to make every character numerically identical.

### 35.3 Performance regression checks

Key scenarios:
- normal wave
- high Threat
- FEVER
- LIMIT BREAK dense wave
- boss plus projectiles
- mobile viewport

## 36. Implementation Sequence

Implementation is intentionally incremental.

### Phase 0 — FREEZE / BASELINE

- record current behavior
- preserve current build
- validate existing saves
- establish baseline FPS and major screen states

### Phase 1 — FOUNDATION

- modular boundaries
- save layer and migrations
- feature flags
- game state/event foundation

Minimal presentation changes.

### Phase 2 — FEEL

- Camera Director
- hit stop
- VFX Director
- Audio Director integration
- damage number improvements
- enemy death signatures

### Phase 3 — HUD

- Premium HUD
- dynamic information hierarchy
- BREAK/FEVER/Threat/Boss integration
- dedicated mobile layout

### Phase 4 — COMBAT 2.0

- character meters
- MODIFY upgrades
- SYNERGY upgrades
- EVOLUTION upgrades
- upgraded level-up selection

### Phase 5 — ENEMIES 2.0

- additional enemy roles
- Elite expansion
- encounter composition improvements

### Phase 6 — STAGES

- Neon Ruins
- Research Zero
- Ash Wasteland
- Void Sector
- gameplay gimmicks and presentation

### Phase 7 — BOSS 2.0

- multi-phase bosses
- new boss UI/audio/presentation
- dedicated boss reward sequence

### Phase 8 — LIMIT BREAK 2.0

- premium presentation
- pacing integration
- refined milestone/reward experience

### Phase 9 — META

- Character Growth refinement
- CORE GRID refinement
- difficulty/risk modes
- economy tuning

### Phase 10 — GACHA / COLLECTION

- Orbital Summon integration with final art direction
- duplicate conversion improvements
- reveal variants

### Phase 11 — OPTIMIZATION

- FPS
- memory pressure
- mobile
- loading
- audio voice budgets
- VFX budgets

### Phase 12 — FINAL POLISH

Review each major screen/state as a finished product:

- boot
- menu
- normal combat
- BREAK
- FEVER
- LIMIT BREAK
- boss
- death
- results
- characters
- CORE GRID
- gacha

## 37. Definition of Done for a New Major Feature

A feature is not considered complete because its gameplay logic works.

Every major feature must be reviewed across:

1. Gameplay
2. Visuals
3. Audio
4. Camera
5. UI/UX
6. Performance
7. Mobile behavior
8. Tests where applicable

Example: a new boss is not complete until attacks, telegraphs, HUD, music/audio, phase transitions, defeat sequence, rewards, mobile readability, performance, and regression behavior are acceptable.

## 38. Explicit Non-Goals

Premium Edition does not require:

- migration to Phaser, PixiJS, Unity, Godot, or another engine
- rewriting every current system before visible improvements begin
- deleting existing progression
- turning the game into a photorealistic title
- maximizing effect count
- perfectly equalizing all character builds
- making every encounter deterministic

## 39. Product Pillars

All implementation decisions should be checked against three pillars:

### Combat Feel

Every attack and kill should feel responsive and satisfying.

### Build Crafting

Each run should create meaningful choices and potentially surprising synergies.

### Long-Term Growth

Character growth, CORE GRID, collection, challenges, and difficulty progression should give players a reason to return without invalidating skill and build choice.

## 40. Final Experience Statement

BREAK SURVIVORS Premium Edition should feel like a game whose world progressively awakens as the player succeeds:

Normal Combat → BREAK → FEVER → LIMIT BREAK → BOSS / CLIMAX

The increase is not only visual. Enemy behavior, rewards, audio, camera, HUD, build power, and player decision-making should all rise together.

The final product should preserve what already makes BREAK SURVIVORS recognizable while making the experience feel deliberate, premium, readable, replayable, and technically sustainable.
