---
date: 2026-04-06
topic: slate-v2-phase9-placeholder-matrix
status: complete
---

# Slate v2 Phase 9 Placeholder Matrix

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Widen the placeholder family in the replacement matrix with the legacy
`custom-placeholder` surface.

## Scope

- add one legacy `custom-placeholder` row
- sync the placeholder family docs if it lands cleanly

## Constraints

- do not turn this into a broader placeholder redesign
- keep the row family-level and evidence-driven
- verify through the cross-repo local runner on current port `3010`

## Progress

- added one legacy `custom-placeholder` row to the replacement compatibility
  matrix
- proved the row through the cross-repo local runner
- synced the scoreboard and placeholder-family docs so the landed Phase 9 slice
  is visible in the roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/placeholder ../slate 3210 /examples/custom-placeholder "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
