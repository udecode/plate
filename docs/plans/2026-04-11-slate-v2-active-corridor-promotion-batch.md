---
date: 2026-04-11
topic: slate-v2-active-corridor-promotion-batch
status: completed
source_repos:
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/plate-2
---

# Slate v2 Active-Corridor Promotion Batch

## Goal

Make shell promotion turn into real editing, not just a visual state change.

That means:

- promote a far island
- move model selection into that island
- focus the real editor root
- prove that typing after promotion works in the promoted island

## Kept Work

- shell mouse-down now promotes and focuses the editor root in
  [island-shell.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/large-document/island-shell.tsx)
- `EditableBlocks` promotion now selects the start of the promoted island in
  [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- runtime proof extended in
  [runtime.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx)
- browser proof extended with `promoteTypeMs` in
  [replacement-huge-document-islands-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-islands.mjs)

## Result

### Runtime proof

`EditableBlocks largeDocument promotes a shelled island on mouse down` now
proves:

- shell disappears
- selection lands at the promoted island start
- mounted text count narrows to the promoted island when `activeRadius=0`

### Browser proof at `10000`

`pnpm bench:replacement:huge-document:islands:local`

- ready `541.03ms`
- top typing `37.95ms`
- promote only `95.38ms`
- promote then type `36.49ms`
- select-all `28.02ms`
- paste `34.63ms`

This is the first proof that deep interaction away from the default live island
can stay cheap enough to keep.

## Default huge-doc lane stayed green

`pnpm bench:replacement:huge-document:local` at `1000` blocks:

- ready `508.19ms`
- type `12.80ms`
- select-all `2.72ms`
- paste `33.22ms`

## Verdict

The large-document layer is no longer top-of-document-only theater.

Promotion now creates a real active corridor entry point for remote editing.

The next batch is corridor widening and policy:

- decide the right default `activeRadius`
- keep neighboring islands live when needed for editing comfort
- avoid paying `~95ms` promotion cost more often than necessary
