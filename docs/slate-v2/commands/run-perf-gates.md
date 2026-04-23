---
date: 2026-04-18
topic: slate-v2-command-run-perf-gates
status: active
---

# Run Perf Gates

## Current Reality

The kept tranche-5 / tranche-6 north-star perf command set is now real.

This command now has one job:

1. run the live packaged/runtime gates that protect the kept perf claim

## Existing Runnable Gates

Run from `../slate-v2`:

```sh
bun run test
bun run test:integration-local
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
bun run bench:react:huge-document:legacy-compare:local
```

The legacy compare owner is currently red for the stronger v2 perf-superiority
claim.

## Current North-Star Perf Owners

These are now real command-backed owners for the kept tranche-5 / tranche-6
runtime claims:

- React runtime locality under overlay churn
- source-scoped overlay invalidation dirtiness
- huge-document overlay-local cost
- annotation-backed widget churn
- direct huge-document comparison against legacy chunking-on and chunking-off

## Remaining Work

The remaining perf work is not command naming. It is making the direct
legacy-compare result acceptable or explicitly deferring the losing lanes.

## Refresh Afterward

- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
