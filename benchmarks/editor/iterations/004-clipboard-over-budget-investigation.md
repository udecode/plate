---
tags: [editor-benchmarks, evidence-kit, clipboard, over-budget]
verdict: accepted
decision: Treat the clipboard over-budget rows as a stale issue-target artifact and make the registered rerun command reproduce the issue-shaped mode.
---

# Clipboard Over-Budget Investigation

## Trigger

`benchmarks/results/benchmark-health-latest.json` reported:

- `investigate-over-budget`
- `2 benchmark rows are over budget`

Both rows came from:

- artifact: `../../.tmp/slate-v2/tmp/slate-clipboard-large-payload-benchmark.json`
- registry id: `clipboard-large-payload`
- command owner: `.tmp/slate-v2`

Rows:

- `cutTwoBlocksEditMsP50`: `552.21ms` against `150ms`
- `cutTwoBlocksMsP50`: `382.5ms` against `250ms`

## Finding

The registered command was too weak:

```sh
bun run bench:core:clipboard-large-payload:local
```

That default mode runs a 10,000-block cut and does not enable issue target
thresholds. The red rows came from the issue-shaped 50,000-block mode.

The correct reproducible command is:

```sh
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun run bench:core:clipboard-large-payload:local
```

Fresh run from `/Users/zbeyens/git/plate-2/.tmp/slate-v2`:

- `cutTwoBlocksEditMsP50`: `145.74ms` against `150ms`
- `cutTwoBlocksMsP50`: `147.1ms` against `250ms`
- `operationCount`: `1`

## Decision

Update `research/benchmark-registry.json` so the active artifact command matches
the issue-shaped budget claim. The over-budget rows were stale artifact output,
not a current failing threshold.

## Verification

```sh
cd /Users/zbeyens/git/plate-2/.tmp/slate-v2
SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000 SLATE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun run bench:core:clipboard-large-payload:local

cd /Users/zbeyens/git/plate-2/benchmarks/editor
npm run evidence:refresh
```
