---
date: 2026-04-08
topic: plite-batch3-core-oracle-public-surface-audit
status: in_progress
source: /Users/zbeyens/git/plate-2/.omx/context/plite-batch3-core-oracle-public-surface-audit-20260408T105447Z.md
---

# Plite Batch 3: Core Oracle And Public-Surface Audit

## Goal

Execute Batch 3 from `docs/plite/master-roadmap.md`.

## Phases

1. Ground current oracle and deletion state
2. Audit deleted source buckets
3. Add supportable oracle rows
4. Sync live docs and ledger
5. Verify and review

## Progress

- created batch context snapshot
- created batch execution plan

## Risks

- source-surface deletion audit may expose more unresolved public seams than
  expected
- added oracle rows must stay inside the current public contract, not drift into
  fantasy parity
