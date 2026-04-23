---
date: 2026-04-06
topic: slate-v2-phase9-highlight-matrix
status: complete
---

# Slate v2 Phase 9 Highlight Matrix

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Continue Phase 9 replacement-envelope expansion by widening the compatibility
matrix for the highlight / decoration family.

## Scope

- keep the existing legacy `search-highlighting` row
- add a current `highlighted-text` row
- sync the scoreboard/docs if the row lands cleanly

## Constraints

- no fake direct parity claim between the old search UI and the current
  projection-driven highlight surface
- use the matrix to show the current family-level truth, not identical product
  shape
- verify through the cross-repo local runner on current port `3010`

## Progress

- added one current `highlighted-text` row to the replacement compatibility
  matrix
- proved the expanded matrix through the cross-repo local runner
- synced the scoreboard and top-level v2 docs so the landed Phase 9 slice is
  visible in the roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/search-highlighting "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
