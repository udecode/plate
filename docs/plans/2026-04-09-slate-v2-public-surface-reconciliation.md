---
date: 2026-04-09
topic: slate-v2-public-surface-reconciliation
status: completed
---

# Slate v2 Public-Surface Reconciliation

## Goal

Make the current public claim explicit and internally consistent across:

- source exports
- package readmes
- API docs
- replacement envelope docs
- roadmap/control docs

## Outcome

This note captured the narrower current-claim cleanup pass that fed the later
broad lane closure.

Later read:

- this note still stands as narrower current-claim cleanup
- it does not close the live broad lane by itself
- exhaustive per-API/public-surface contract-width audit later reopened the
  live lane under
  [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)

What changed:

- reconciled `docs/api/transforms.md` with the actual supported option shapes
  and removed stale legacy overclaim wording
- corrected `Editor.normalize(...)` API docs to the real no-options signature
- aligned the replacement envelope docs with the current normalization split
- updated the then-live control docs around the narrower current claim
- prepared the replacement-candidate and package docs for the later broad-lane
  closure

## Remaining Read

This still means the current claim was made more explicit:

- every narrowed seam is either proved or intentionally documented as narrow
- remaining risk lives in broader contract decisions, not in silent surface
  drift

The later broad-lane closure is now tracked separately in:

- [2026-04-09-slate-v2-broad-api-public-surface-reconciliation-completion-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-broad-api-public-surface-reconciliation-completion-plan.md)
