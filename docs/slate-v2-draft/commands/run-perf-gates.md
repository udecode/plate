---
date: 2026-04-10
topic: slate-v2-command-run-perf-gates
---

# Command: Run Perf Gates

## When To Run

- after the perf blocker package is reopened
- when validating migration-relevant perf blocker lanes
- before any live `Target A` / `Target B` perf verdict rewrite

## Commands

Run from `/Users/zbeyens/git/slate-v2`:

```sh
pnpm bench:replacement:placeholder:local
pnpm bench:replacement:richtext:local
pnpm bench:replacement:huge-document:local
pnpm bench:normalization:local
pnpm bench:normalization:compare:local
```

## Read

- `placeholder`, `richtext`, and `huge-document` are blocker-facing perf gates
- normalization benches are diagnostic perf evidence unless mapped into a
  user-facing blocker lane
- low-value demos, microbench noise, and slower-but-still-fast cases remain
  non-blockers

## Refresh Afterward

- [perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [proof-lane-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md)
