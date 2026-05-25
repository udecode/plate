---
date: 2026-04-11
topic: slate-v2-large-document-shell-proof-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Large-Document Shell Proof Batch

## Goal

Run the first honest shell-only large-document proof:

- far islands stop mounting editable descendants
- top-of-document typing still works
- promotion is local
- default runtime stays unchanged when the layer is off

## Kept Work

- added internal large-document planner and shell renderer:
  - [create-island-plan.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/create-island-plan.ts)
  - [classify-island-kind.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/classify-island-kind.ts)
  - [island-shell.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx)
- wired `EditableBlocks` to support opt-in shelling through
  [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- added query-param control in
  [huge-document.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx)
- added the dedicated proof lane:
  [replacement-huge-document-islands-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-islands.mjs)
- restored the kept breadth lane by fixing its JSX-runtime assumption in
  [slate-react-rerender-breadth-benchmark.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx)

## Critical Fix

The shell experiment would have silently corrupted document text if DOM
reconciliation kept assuming every top-level subtree was mounted.

The kept fix was to make structured DOM reconciliation update only mounted
top-level islands and preserve shelled top-level subtrees from the committed
snapshot.

Without that, typing in one live island would blank out far shelled text.

## Result

### Default runtime stayed green

`pnpm bench:replacement:huge-document:local` at `1000` blocks:

- ready `527.95ms` vs legacy `720.87ms`
- type `12.48ms` vs legacy `19.85ms`
- select-all `3.59ms` vs legacy `75ms`
- paste `34.85ms` vs legacy `107.75ms`

### Breadth lane stayed green

`pnpm bench:react:rerender-breadth:local` still reads:

- `#5131`: broad hook still broad by contract
- `#3656`: sibling leaves `0`
- `#4141`: ancestors `0`

### Shell proof moved large-doc cost hard

`pnpm bench:replacement:huge-document:islands:local` at `10000` blocks:

- ready `527.86ms`
- top typing `38.85ms`
- shell promotion `54.10ms`
- shell count `99`

Compared with the last clean non-islands `10000` baseline:

- ready had been `1229.49ms`
- top typing had been `97.47ms`

So the first shell-only proof cut:

- ready by about `701.63ms`
- top typing by about `58.62ms`

That is real enough to keep.

## Verdict

The next large-document strategy is finally better than chunking-shaped
storytelling.

What this batch proved:

- shell-only far islands can remove real runtime work
- the win is large enough to justify continuing
- local promotion is cheap enough to be a viable path

What it did **not** prove:

- broad ops are solved
- shell-backed selection is solved
- far-shell paste is solved

So the next batch is obvious:

- Phase 2 and 3 from the proof-first plan
- promotion into editable DOM on interaction
- model-driven select-all and paste over shell-backed ranges
