---
date: 2026-04-06
topic: slate-v2-phase9-anchor-matrix
status: complete
---

# Slate v2 Phase 9 Anchor Matrix

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Continue Phase 9 replacement-envelope expansion by widening the matrix for the
anchor / projection family.

## Scope

- add one current `persistent-annotation-anchors` row to the replacement
  compatibility matrix
- sync the scoreboard/docs if the row lands cleanly

## Constraints

- no fake legacy twin
- use the matrix to record current replacement-candidate truth, not symmetry for
  symmetry’s sake
- verify through the cross-repo local runner on current port `3010`

## Progress

- added one current `persistent-annotation-anchors` row to the replacement
  compatibility matrix
- proved the expanded matrix through the cross-repo local runner
- synced the scoreboard and top-level v2 docs so the landed Phase 9 slice is
  visible in the roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/search-highlighting "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
