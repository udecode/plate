---
date: 2026-04-06
topic: slate-v2-react-surface-split-phase8
status: complete
---

# Slate v2 `slate-react` Surface Split Phase 8

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Finish the Phase 8 docs slice that makes the `slate-react` stable-vs-advanced
surface explicit.

## Scope

- `packages/slate-react/README.md`
- supporting replacement-candidate docs that describe the current public surface
- roadmap/docs sync in `plate-2`

## Constraints

- no API churn
- no fake “stable forever” claim
- keep advanced exports public when they still serve real runtime work
- make the stable editor-facing surface obvious for migration and package users

## Progress

- updated `packages/slate-react/README.md` to split:
  - stable editor-facing surface
  - advanced runtime surface
- updated public replacement docs in `slate-v2` so the same split is visible at
  the repo level
- synced the `plate-2` roadmap stack so Phase 8 now records the docs split as a
  landed slice
- verification:
  - `yarn prettier --check packages/slate-react/README.md docs/general/replacement-candidate.md Readme.md`
  - `pnpm exec prettier --check docs/slate-v2/package-end-state-roadmap.md docs/slate-v2/overview.md docs/slate-v2/final-synthesis.md docs/slate-v2/cohesive-program-plan.md docs/plans/2026-04-06-slate-v2-react-surface-split-phase8.md`
