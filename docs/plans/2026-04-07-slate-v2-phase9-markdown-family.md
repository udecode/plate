---
date: 2026-04-07
topic: slate-v2-phase9-markdown-family
status: complete
---

# Slate v2 Phase 9 Markdown Family

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Sharpen the markdown family from a vague later-bucket into an explicit
comparison-only family.

## Scope

- add legacy-only comparison rows for:
  - `markdown-preview`
  - `markdown-shortcuts`
- update the family ledger and top-level docs if those rows land cleanly

## Constraints

- no fake current v2 markdown family claim
- no markdown implementation batch hidden inside the matrix
- keep the slice evidence-driven

## Progress

- added legacy-only comparison rows for:
  - `markdown-preview`
  - `markdown-shortcuts`
- proved the expanded matrix through the cross-repo local runner
- split the markdown family out of the vague later bucket in the family ledger
- synced the scoreboard and top-level roadmap/docs
- verification:
  - `bash ./scripts/run-cross-repo-local.sh 3010 /examples/rich-inline ../slate 3210 /examples/markdown-shortcuts "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/replacement-compatibility.test.ts --project=chromium --workers=1"`
