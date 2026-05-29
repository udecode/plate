---
tags: [editor-benchmarks, evidence-kit, rich-text-editors, slate-v2]
verdict: measured
decision: Use one comprehensive Evidence Kit result for Slate v2 vs Slate benchmark coverage.
---

# Rich Text Editor Evidence Matrix

## Goal

Make the benchmark comprehensive enough to show what is measured for Slate v2
vs Slate before claiming rich-text performance results.

## Implemented

- Added `benchmarks/rich-text-editors-benchmark.mjs`.
- Added `benchmarks/results/rich-text-editors-latest.json`.
- Imported the available Slate v2 artifact families:
  - React huge-document legacy compare
  - React rerender breadth
  - React huge-document overlays
  - React huge-document browser trace
  - React active typing breakdown
  - core normalization, query/ref observation, node transforms, text/selection,
    editor store, refs/projection
  - core huge-document, normalization, observation, and history compare rows
  - clipboard large payload, collab readiness, and issue #6038 transaction rows
- Added source-root coverage rows for Slate v2 and Slate.
- Added workload coverage rows that keep Slate v2-only diagnostics separate
  from Slate v2 vs Slate comparison rows.
- Raised the benchmark package dry-run pack budget to 800 KB because the
  comprehensive evidence JSON is intentionally shipped as part of the local
  private Evidence Kit lab.

## Current Result

`benchmarks/results/rich-text-editors-latest.json` is regenerated from the
active Slate-only registry.

The red rows are useful:

- `cutTwoBlocksEditMsP50` and `cutTwoBlocksMsP50` are over budget in the
  clipboard pressure artifact.
- `slate-transaction-benchmark.json` and
  `slate-history-retained-memory-benchmark.json` are optional missing artifacts
  in this checkout.

## Decision

Treat this as the current rich-text benchmark authority. It is comprehensive
for imported Slate v2 evidence and compares only against Slate where a real
legacy baseline exists.

## Deferred

- More Slate v2 vs Slate browser interaction fixtures.
- More Slate v2 vs Slate editing and navigation lanes mined from tests.

## Verification

```sh
npm run bench:rich-text:check
npm run check
```
