---
date: 2026-04-06
topic: slate-v2-phase9-richtext-decision
status: complete
---

# Slate v2 Phase 9 Richtext Decision

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Make the `richtext` family less vague in the replacement envelope.

## Scope

- add one legacy `richtext` row to the replacement compatibility matrix
- use that evidence to sharpen the family ledger
- keep the current v2 side honest by not inventing a fake `richtext` surface

## Constraints

- no pretend current richtext parity
- no broad richtext implementation batch hidden inside a matrix slice
- verify through the cross-repo local runner on current port `3010`

## Progress

- added one legacy `richtext` row to the replacement compatibility matrix
- proved the row through the cross-repo local runner
- used that evidence to sharpen the family ledger:
  - `richtext` is now comparison-only
  - not vague not-yet-covered
- synced the scoreboard and top-level v2 docs so the landed Phase 9 slice is
  visible in the roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/richtext "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
