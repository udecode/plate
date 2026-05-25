---
date: 2026-04-11
topic: slate-v2-large-document-broad-ops-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Large-Document Broad Ops Batch

## Goal

Make shell-backed large-document mode survive the first real broad operations:

- `Ctrl+A`
- paste over a full-document selection

without expanding all far islands into editable DOM.

## Kept Work

- added large-document selection helpers in
  [large-document-commands.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/large-document-commands.ts)
- wired the runtime path in
  [editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
- passed shell-mounted island state down from
  [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- expanded runtime proofs in
  [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- expanded the browser proof lane in
  [replacement-huge-document-islands-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-islands.mjs)

## Runtime Rules That Landed

- `Ctrl+A` in large-document mode maps straight to the full document model range
- shell-backed selections stop trying to resolve a DOM range through unmounted
  islands
- paste on a shell-backed selection stays model-driven through
  `ReactEditor.insertData(...)`
- shell-backed paste fails closed on browser default fallback instead of letting
  the browser paste into the wrong mounted subset

## Result

### Runtime proofs

New runtime tests are green:

- `EditableBlocks largeDocument maps Ctrl+A to a full-document model selection
  without expanding shells`
- `EditableBlocks largeDocument pastes over full-document shell-backed
  selection through the model`

### Breadth lane

`pnpm bench:react:rerender-breadth:local` stayed green:

- `#3656`: sibling leaves `0`
- `#4141`: ancestors `0`

### Default huge-document lane

`pnpm bench:replacement:huge-document:local` at `1000` blocks stayed green:

- ready `514.31ms`
- type `13.27ms`
- select-all `3.27ms`
- paste `34.21ms`

### Islands lane at `10000`

`pnpm bench:replacement:huge-document:islands:local`:

- ready `557.22ms`
- type `40.32ms`
- select-all `26.60ms`
- paste `35.71ms`
- promote `51.40ms`

Compared with the last clean non-islands `10000` baseline:

- ready `1229.49ms -> 557.22ms`
- type `97.47ms -> 40.32ms`
- select-all `34.36ms -> 26.60ms`
- paste `190.48ms -> 35.71ms`

That is a real broad-op win, not benchmark theater.

## Remaining Gap

This still does **not** close the huge-doc typing gap fully.

The big remaining runtime job is active-corridor expansion beyond the default
live island so deep interaction away from the top does not pay unnecessary
promotion cost or fall back into awkward shell edges.
