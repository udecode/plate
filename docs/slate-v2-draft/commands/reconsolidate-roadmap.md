---
date: 2026-04-08
topic: slate-v2-command-reconsolidate-roadmap
---

# Command: Reconsolidate Roadmap

## Role

Command-pack entrypoint.

It carries the ownership reminder:

- roadmap owns sequence
- verdict docs own verdict
- proof docs own proof

## When To Run

- after any Ralph batch that changes roadmap truth
- after any batch that changes vocabulary, ownership, or proof surfaces

If the wording change touches deletion closure:

1. freeze the deleted inventory in the target repo first
2. reconcile parent/child rows in
   [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
3. only then refresh
   [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
   and [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)

Use
[deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md)
for the governing rules.

## Invocation

```sh
$ralplan /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-true-slate-rc-roadmap.md
```

## Refresh Afterward

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [deletion-closure-protocol.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/deletion-closure-protocol.md)
