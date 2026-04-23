---
date: 2026-04-11
topic: slate-v2-active-radius-policy-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Active Radius Policy Batch

## Goal

Stop guessing the corridor default.

Measure `activeRadius` variants, choose the best default, and avoid dragging
the runtime into more tuning theater than RC actually needs.

## Measured Sweep at `10000` blocks

### Radius 0

- ready `541.03ms`
- type `37.95ms`
- select-all `28.02ms`
- paste `34.63ms`
- promote `95.38ms`
- promote then type `36.49ms`

### Radius 1

- ready `513.04ms`
- type `39.35ms`
- select-all `25.60ms`
- paste `34.46ms`
- promote `108.72ms`
- promote then type `36.19ms`

### Radius 2

- ready `522.04ms`
- type `36.03ms`
- select-all `26.01ms`
- paste `35.69ms`
- promote `124.77ms`
- promote then type `36.01ms`

## Decision

Set the default `activeRadius` to `1`.

That is the best balance:

- better ready than radius `0`
- better select-all than radius `0`
- slightly better paste than radius `0`
- better shell count posture
- much cheaper promotion than radius `2`

Radius `2` buys tiny steady-state wins while making promotion meaningfully more
expensive. That is not the right RC trade.

## Kept Work

- default `activeRadius` in
  [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
  changed from `0` to `1`
- huge-document example default query fallback in
  [huge-document.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx)
  changed from `0` to `1`
- islands proof lane default in
  [replacement-huge-document-islands-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-islands.mjs)
  changed from `0` to `1`
- narrow shell runtime tests remain explicit with `activeRadius: 0` so they
  still prove the strict shell case

## Verdict

This is the point where perf work becomes optional polishing instead of RC debt.

The large-document runtime is already doing the important things right:

- far descendants do not mount by default
- broad ops stay model-driven
- promotion creates a real editing corridor
- default huge-doc lane stays green

The remaining typing gap versus legacy chunking at scale is no longer large
enough to justify another architecture wave before RC.
