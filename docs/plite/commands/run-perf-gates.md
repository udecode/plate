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
pnpm bench:targets:run -- react-huge-document-legacy-compare
```

The strict product gate and broad direct legacy diagnostic are green for the
current private-alpha claim. Use the legacy-compare gate as the direct
diagnostic for claim drift, not as proof that the lane is broadly red.

## Current North-Star Perf Owners

These are now real command-backed owners for the kept tranche-5 / tranche-6
runtime claims:

- React runtime locality under overlay churn
- source-scoped overlay invalidation dirtiness
- huge-document overlay-local cost
- annotation-backed widget churn
- direct huge-document comparison against legacy chunking-on and chunking-off

## Remaining Work

The remaining perf work is caveat-specific: repeated vertical Shift+Down and
select-all-delete undo residual p95 / bulk-restore cost. Do not restart a broad
perf architecture pass unless a fresh gate reproduces a broader loss.

## Refresh Afterward

- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/plite/replacement-gates-scoreboard.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/plite/true-slate-rc-proof-ledger.md)
