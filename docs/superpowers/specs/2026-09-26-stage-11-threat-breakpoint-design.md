# Stage 11.0 — THREAT BREAKPOINT

## Goal
Strong runs must automatically escalate into denser, more rewarding combat without turning enemies into damage sponges. Preserve the core loop: stronger character -> more enemies -> more kills -> more spectacle.

## Scope
Stage 11.0 combines:
- THREAT 0-5
- kill-count-only automatic progression
- spawn interval reduction + larger spawn batches
- THREAT UP SURGE WAVE
- ELITE escalation from THREAT 3
- THREAT HUD
- THREAT MAXIMUM -> LIMIT BREAK
- LIMIT BREAK scaling every 500 kills
- dynamic visual-FX trimming only; no enemy hard cap

## THREAT thresholds
- T1: 150 kills
- T2: 450 kills
- T3: 900 kills
- T4: 1600 kills
- T5: 2600 kills

## THREAT scaling
| Level | Density | HP | Reward |
|---|---:|---:|---:|
| 0 | 1.00x | 1.00x | 1.00x |
| 1 | 1.30x | 1.05x | 1.10x |
| 2 | 1.60x | 1.12x | 1.25x |
| 3 | 2.00x | 1.20x | 1.45x |
| 4 | 2.50x | 1.30x | 1.70x |
| 5 | 3.10x | 1.40x | 2.00x |

Density is implemented through both shorter spawn intervals and multiple enemies per spawn cycle.

## ELITE pressure
- T0-T1: near current behavior
- T2: occasional extra elites
- T3: clearly visible elite presence
- T4: multiple elites can coexist regularly
- T5: elite groups are part of normal pressure

## THREAT UP
On each level increase:
1. short warning
2. THREAT UP callout
3. edge-flash cue
4. SURGE WAVE from multiple sides
5. continue at the new baseline density

Avoid large camera shake; use enemy volume and screen-edge cues for impact.

## LIMIT BREAK
After T5:
- UI changes from THREAT to LIMIT BREAK
- LB increases every additional 500 kills
- each LB level adds:
  - density +12%
  - HP +5%
  - reward +10%
- Stage 11.0 implements endless LB scaling only
- LB milestone events are Stage 11.1

## Performance
- Do not add an enemy hard cap.
- Performance Mode must not change enemy count, damage, HP, or rewards.
- Add dynamic visual-only trimming as battlefield density rises.
- Prefer trimming particles, floating text, trails, glows, and redundant secondary effects.

## Reset
THREAT and LIMIT BREAK are run-local only.
Death/restart resets THREAT to 0 and LB to 0.
No persistence in localStorage.

## Validation
- exact THREAT thresholds
- exact THREAT density/HP/reward values
- spawn interval and batch size both scale
- T3+ elite escalation
- SURGE WAVE on each THREAT increase
- T5 transitions to LIMIT BREAK
- LB increments every 500 kills
- LB adds +12% density / +5% HP / +10% reward
- no enemy hard cap
- Performance Mode preserves gameplay values
- restart resets run-local THREAT/LB
- JS syntax remains valid
