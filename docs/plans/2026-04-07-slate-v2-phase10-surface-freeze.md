---
date: 2026-04-07
topic: slate-v2-phase10-surface-freeze
status: complete
---

# Slate v2 Phase 10 Surface Freeze

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Freeze the package-level public API/readme truth across:

- `slate`
- `slate-dom`
- `slate-react`
- `slate-history`
- `slate-browser`

Then align the repo-level replacement claim to that same surface.

## Scope

- package README alignment only
- repo-level replacement docs alignment
- roadmap/docs sync for the active Phase 10 gate

## Constraints

- no fake API removals
- no hidden package redesign inside docs
- describe what is stably usable now, what is lower-level but still public, and
  what the current replacement claim does **not** promise

## Progress

- aligned package README/API truth across:
  - `slate`
  - `slate-dom`
  - `slate-react`
  - `slate-history`
  - `slate-browser`
- aligned repo-level replacement docs to the same package/family claim
- synced the Phase 10 roadmap stack so this is recorded as the first landed
  release-readiness slice
- verification:
  - `yarn prettier --check /Users/zbeyens/git/slate-v2/packages/slate/README.md /Users/zbeyens/git/slate-v2/packages/slate-dom/README.md /Users/zbeyens/git/slate-v2/packages/slate-react/README.md /Users/zbeyens/git/slate-v2/packages/slate-history/README.md /Users/zbeyens/git/slate-v2/packages/slate-browser/README.md /Users/zbeyens/git/slate-v2/Readme.md /Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
  - `pnpm exec prettier --check docs/slate-v2/package-end-state-roadmap.md docs/slate-v2/cohesive-program-plan.md docs/slate-v2/overview.md docs/slate-v2/final-synthesis.md docs/slate-v2/replacement-gates-scoreboard.md docs/plans/2026-04-07-slate-v2-phase10-surface-freeze.md`
