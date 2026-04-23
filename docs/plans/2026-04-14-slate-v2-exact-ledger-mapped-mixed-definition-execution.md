---
topic: slate-v2-exact-ledger-mapped-mixed-definition-execution
date: 2026-04-14
---

# Goal

Fix the stale `mapped-mixed` definition so the exact-ledger framework matches
the live tranche-7 row classifications.

# Scope

- exact-ledger definition only
- nearby tranche-7 plan wording if it repeats the old narrower meaning

# Loaded Skills

- `ralph`
- `major-task`
- `planning-with-files`
- `learnings-researcher`

# Constraints

- Keep the change tight
- Do not widen this into another tranche review
- Make the status key explicit enough that future row classifications stop
  contradicting the legend

# Phases

- [x] Load skills and identify the next honest tranche-7 slice
- [x] Create Ralph context snapshot
- [x] Audit current `mapped-mixed` wording vs live rows
- [x] Implement the wording fix
- [x] Verify, architect-review, deslop, rerun, and clean state

# Findings

- `mapped-mixed` is underdefined in the exact-ledger README
- live tranche-7 rows already use it for mirrored/recovered/explicit-skip
  splits
- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo

# Progress

## 2026-04-14

- Started the next tranche-7 Ralph slice
- Picked the `mapped-mixed` definition drift as the next bounded slice
- Created the Ralph snapshot in `.omx/context/`
- Audited the live rows and found the same broader meaning already in use:
  mirrored/recovered/explicit-skip subclaims inside one legacy file
- Patched:
  - `docs/slate-v2/ledgers/README.md`
  - `2026-04-13-slate-v2-full-no-regression-story-plan.md`
  - `2026-04-13-slate-v2-add-proof-architecture-plan.md`
- Verified:
  - grep sweep confirming the status-key and rules now define `mapped-mixed`
    broadly enough for the live tranche-7 rows
- Architect review: `APPROVED`
- Deslop result:
  - no justified simplifications beyond the landed wording fix
  - reran the consistency sweep after the final edits

# Errors

- `docs/shared/agent-tiers.md` is missing in this repo
- `docs/solutions/patterns/critical-patterns.md` does not exist in this repo
