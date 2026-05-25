---
date: 2026-04-07
topic: slate-v2-phase9-images-decision
status: complete
---

# Slate v2 Phase 9 Images Decision

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Sharpen the `images` family from vague later-bucket language into an explicit
comparison-only family if the legacy evidence is cheap and stable.

## Scope

- add one legacy `images` row to the replacement compatibility matrix
- sync the family ledger and top-level docs if the row lands cleanly

## Constraints

- no fake current v2 images family claim
- no image-upload or media implementation batch hidden inside a matrix slice
- use the matrix to preserve honest deferral, not to imply current support

## Progress

- added one legacy `images` row to the replacement compatibility matrix
- proved the row through the cross-repo local runner
- used that evidence to sharpen the family ledger:
  - `images` is now comparison-only
  - not generic intentionally-later hand-waving
- synced the scoreboard and top-level v2 docs so the landed Phase 9 slice is
  visible in the roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/images "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
