---
date: 2026-04-08
topic: slate-v2-command-refresh-file-review-ledger
---

# Command: Refresh File Review Ledger

## When To Run

- after any tranche closes or opens new proof rows
- after major diff reshaping
- before any renewed `True Slate RC` verdict push

If the refresh touches deleted-family status:

1. freeze the deleted inventory in the target repo first
2. update package parent/child rows in
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
3. keep package parents open until every child row is `closed` or
   `explicit skip`

Use
[deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md)
for the governing rules.

## Invocation

```sh
$ralph /Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-true-slate-rc-roadmap-consensus-plan.md
```

## Refresh Afterward

- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)
- [deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md)
