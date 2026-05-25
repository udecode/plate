---
date: 2026-04-07
topic: slate-v2-phase9-ui-layout-families
status: complete
---

# Slate v2 Phase 9 UI / Layout Families

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Sharpen the remaining UI/layout bucket with cheap legacy-only comparison rows.

## Scope

- add legacy-only comparison rows for:
  - `forced-layout`
  - `styling`
  - `hovering-toolbar`
- update the family ledger so these stop living in one vague bucket

## Constraints

- no fake current v2 family claims
- keep `scroll-into-view` out unless a stable row exists
- use the matrix as evidence, not as a promise

## Progress

- added legacy-only comparison rows for:
  - `forced-layout`
  - `styling`
  - `hovering-toolbar`
- proved the expanded matrix through the cross-repo local runner
- split these families out of the vague later bucket in the family ledger
- left `scroll-into-view` intentionally later because there is still no stable
  row for it here
- synced the scoreboard and top-level roadmap/docs
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/forced-layout "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
