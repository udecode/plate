---
date: 2026-04-18
topic: plite-command-run-perf-gates
status: active
---

# Run Perf Gates

## Current Reality

The kept tranche-5 / tranche-6 north-star perf command set is real.

This command has one job:

1. run the live packaged/runtime gates that protect the kept perf claim

## Existing Runnable Gates

Run from `/Users/zbeyens/git/plate-2`:

```sh
pnpm plite:packages:test
pnpm --filter www test:plite-browser
pnpm bench:targets:run -- react-rerender-breadth
pnpm bench:targets:run -- react-huge-document-overlays
pnpm bench:targets:run -- react-huge-document-virtualized-type-to-paint
pnpm bench:targets:run -- react-huge-document-full
```

The virtualized browser trace proves bounded DOM and interaction latency. The
aggregate suite combines that result with complete-DOM browser behavior, core
operations, and overlay locality.

## Current North-Star Perf Owners

These are now real command-backed owners for the kept tranche-5 / tranche-6
runtime claims:

- React runtime locality under overlay churn
- source-scoped overlay invalidation dirtiness
- huge-document overlay-local cost
- annotation-backed widget churn
- explicit complete and virtualized huge-document rendering

## Remaining Work

The remaining perf work is caveat-specific: repeated vertical Shift+Down and
select-all-delete undo residual p95 / bulk-restore cost. Do not restart a broad
perf architecture pass unless a fresh gate reproduces a broader loss.

## Refresh Afterward

- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/true-slate-rc-proof-ledger.md)
