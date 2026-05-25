---
date: 2026-04-06
topic: slate-v2-phase9-code-highlighting-matrix
status: complete
---

# Slate v2 Phase 9 Code Highlighting Matrix

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Widen the decoration/highlight family in the replacement matrix with a legacy
`code-highlighting` row.

## Scope

- add one legacy `code-highlighting` row
- sync the decoration/highlight family docs if it lands cleanly

## Constraints

- no fake direct parity claim with current `highlighted-text`
- keep the row family-level and evidence-driven
- verify through the cross-repo local runner on current port `3010`

## Progress

- added one legacy `code-highlighting` row to the replacement compatibility
  matrix
- proved the row through the cross-repo local runner
- synced the scoreboard and decoration-family docs so the landed Phase 9 slice
  is visible in the roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/highlighted-text ../slate 3210 /examples/code-highlighting "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
