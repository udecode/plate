---
date: 2026-04-07
topic: slate-v2-phase9-structural-comparison-families
status: complete
---

# Slate v2 Phase 9 Structural Comparison Families

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Pull the broad structural/product families out of the vague “later” bucket and
into explicit comparison-only status where the evidence is already cheap.

## Scope

- add legacy-only comparison rows for:
  - `tables`
  - `embeds`
  - `editable-voids`
- sync the replacement family ledger from generic “intentionally later” wording
  to sharper family-by-family comparison-only wording where justified

## Constraints

- no fake current v2 support claims
- no broad implementation batch for these families
- use the matrix to keep the families visible while preserving honest deferral

## Progress

- added legacy-only comparison rows for:
  - `tables`
  - `embeds`
  - `editable-voids`
- proved the expanded matrix through the cross-repo local runner
- sharpened the family ledger so those families are now comparison-only instead
  of generic later-bucket hand-waving
- synced the scoreboard and top-level roadmap stack
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/tables "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
