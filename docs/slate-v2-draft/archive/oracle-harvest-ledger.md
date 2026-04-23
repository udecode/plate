---
date: 2026-04-07
topic: slate-v2-oracle-harvest-ledger
---

# Slate v2 Oracle Harvest Ledger

> Historical/supporting oracle note. The live evidence and proof read now lives
> in [../true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
> and [../release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md).

## Purpose

This doc tracks the legacy `slate` oracle rows that matter for the completed
current-core claim.

It does **not** own the whole `True Slate RC` proof backlog.
That broader proof now belongs in:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)

Use this file when you want the narrow core oracle read for the already-proved
surface.

Use it with:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

## Current Read

This is the core-oracle tranche for the completed `POC RC` / historical
`Target A` read:

- `Slate`
- `EditableBlocks`
- `withHistory(createEditor())`

This harvest is not chasing blanket legacy parity.
It is chasing oracle confidence for the already-claimed current `slate` core
surface.

The broader `True Slate RC` proof stack is now complemented by fresh same-turn
runtime/browser/package evidence in:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

Roadmap mapping:

- this file is a completed/core `POC RC` evidence surface
- it stays one input into `True Slate RC` proof
- it does not own the broader proof backlog

Family-level recovery for things like markdown, tables, images, and broader
browser/runtime artifacts is tracked elsewhere.
This file stays on the transform/editor core.

Current source asymmetry:

- legacy `slate` core test files: `1069`
- current v2 `slate` core contract files: `3`
- current mirrored legacy oracle rows in
  [/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts):
  `81`

This asymmetry no longer blocks the broader verdict by itself because the
broader proof depth is now carried by the full runtime/browser/package stack,
not by this narrow core oracle alone.

High-signal legacy buckets inside the current core claim:

- `delete`: `100`
- `move`: `49`
- `wrapNodes`: `25`
- `unwrapNodes`: `26`
- `liftNodes`: `7`
- `Editor` interface: `204`

## Status Legend

- **Harvest now**: directly inside the current v2 claim
- **Triage next**: probably relevant, but needs file-level review before porting
- **Skip for Target A**: outside the current claim

## Skip Reasons

Every skipped legacy row must land in exactly one bucket:

- `unsupported semantics`
- `outside current public contract`
- `not part of the current core release target`

## Target Files

Current oracle targets:

- [/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)

If those files get too large to read, split by family. Do not keep piling
everything into one monster spec out of inertia.

## Batch 1

Families:

- `delete`
- `move`
- `Editor.before`
- `Editor.after`

Seed rows already mirrored in
[/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts):

- `move/anchor/basic.tsx`
- `move/anchor/backward.tsx`
- `move/anchor/collapsed.tsx`
- `move/anchor/distance.tsx`
- `move/anchor/reverse-distance.tsx`
- `move/anchor/reverse-basic.tsx`
- `move/anchor/reverse-backward.tsx`
- `move/both/backward.tsx`
- `move/both/backward-reverse.tsx`
- `move/both/collapsed.tsx`
- `move/both/basic-reverse.tsx`
- `move/both/distance.tsx`
- `move/both/distance-reverse.tsx`
- `move/both/expanded.tsx`
- `move/both/expanded-reverse.tsx`
- `move/end/backward.tsx`
- `move/end/backward-reverse.tsx`
- `move/end/collapsed-reverse.tsx`
- `move/end/to-backward-reverse.tsx`
- `move/end/expanded-reverse.tsx`
- `move/end/from-backward-reverse.tsx`
- `move/focus/backward.tsx`
- `move/focus/collapsed-reverse.tsx`
- `move/focus/distance.tsx`
- `move/focus/distance-reverse.tsx`
- `move/focus/expanded.tsx`
- `move/focus/expanded-reverse.tsx`
- `move/focus/to-backward-reverse.tsx`
- `move/start/distance.tsx`
- `move/start/expanded.tsx`
- `move/start/expanded-reverse.tsx`
- `move/start/backward.tsx`
- `move/anchor/reverse-backward.tsx`
- `move/start/from-backward.tsx`
- `move/start/backward-reverse.tsx`
- `move/start/distance-reverse.tsx`
- `move/start/to-backward.tsx`
- `move/end/distance.tsx`
- `move/end/distance-reverse.tsx`
- `move/end/expanded.tsx`
- `Editor.before/path.tsx`
- `Editor.before/point.tsx`
- `Editor.before/range.tsx`
- `Editor.before/start.tsx`
- `Editor.after/path.tsx`
- `Editor.after/point.tsx`
- `Editor.after/range.tsx`
- `Editor.after/end.tsx`
- `delete/path/block.tsx`
- `delete/point/basic.tsx`
- `delete/point/basic-reverse.tsx`
- `delete/point/inline.tsx`
- `delete/selection/character-start.tsx`
- `delete/selection/character-end.tsx`
- `delete/selection/character-middle.tsx`
- `delete/selection/inline-after.tsx`
- `delete/selection/block-middle.tsx`
- `delete/selection/block-across.tsx`
- `delete/selection/inline-inside.tsx`
- `delete/selection/inline-over.tsx`
- `delete/selection/inline-whole.tsx`

### `delete`

Legacy bucket counts:

- `emojis`: `7`
- `path`: `4`
- `point`: `12`
- `selection`: `24`
- `unit-character`: `21`
- `unit-line`: `6`
- `unit-word`: `6`
- `voids-false`: `18`
- `voids-true`: `2`

Harvest now:

- `path/block.tsx`
- `point/basic.tsx`
- `point/basic-reverse.tsx`
- `point/inline.tsx`
- `selection/character-start.tsx`
- `selection/character-middle.tsx`
- `selection/character-end.tsx`
- `selection/inline-inside.tsx`
- `selection/inline-over.tsx`
- `selection/inline-whole.tsx`
- `selection/inline-after.tsx`
- `selection/block-middle.tsx`
- `selection/block-across.tsx`

Explicitly not claimed for `Target A`:

- `path/text.tsx`
- `path/inline.tsx`
- `path/selection-inside.tsx`
- `point/inline-before.tsx`
- `point/inline-before-reverse.tsx`
- `point/inline-end.tsx`
- `point/inline-inside-reverse.tsx`
- `selection/block-inline-across.tsx`
- `selection/block-inline-over.tsx`
- `selection/block-join-edges.tsx`
- `selection/block-join-inline.tsx`
- `selection/block-join-nested.tsx`

Deferred with named reason:

- `point/nested.tsx`
  - needs nested block-merge semantics that the current delete claim does not
    yet promise
- `point/nested-reverse.tsx`
  - same nested block-merge gap in reverse direction
- `point/depths-reverse.tsx`
  - needs cross-depth block merge behavior that is still outside the current
    delete sentence
- `selection/block-nested.tsx`
  - needs nested block range deletion semantics beyond the current top-level
    boundary claim
- `selection/block-depths.tsx`
  - needs cross-depth range deletion semantics beyond the current top-level
    boundary claim
- `selection/block-depths-nested.tsx`
  - same nested cross-depth deletion gap
- `selection/block-across-multiple.tsx`
  - needs broader multi-block consolidation than the current adjacent merge
    claim
- `selection/block-across-nested.tsx`
  - needs nested multi-block consolidation, not just adjacent top-level merge
    behavior
- `selection/block-hanging-single.tsx`
  - hanging deletion semantics are not part of the current core release target
- `selection/block-hanging-multiple.tsx`
  - same hanging deletion gap across multiple blocks
- `selection/block-void-end.tsx`
  - void semantics are unsupported in the current core claim
- `selection/block-void-end-hanging.tsx`
  - same unsupported void semantics, plus hanging behavior
- `selection/word.tsx`
  - word-unit semantics are unsupported in the current core claim
- `unit-character/*`
  - character-unit semantics are unsupported in the current core claim
- `unit-line/*`
  - line-unit semantics are unsupported in the current core claim
- `unit-word/*`
  - word-unit semantics are unsupported in the current core claim
- `emojis/*`
  - grapheme/emoji semantics are unsupported in the current core claim
- `voids-false/*`
  - void delete semantics are unsupported in the current core claim
- `voids-true/*`
  - void delete semantics are unsupported in the current core claim

Why:

- the current delete claim now means:
  - exact block `Path` removal
  - same-text selection deletion
  - mixed-inline sibling-leaf deletion inside one supported top-level block
  - adjacent supported top-level block-boundary deletion when the blocks can
    merge
- it does **not** mean generic leaf-path parity, nested block merge parity,
  hanging parity, unit parity, emoji parity, or void parity

### `move`

Legacy bucket counts:

- `anchor`: `7`
- `both`: `10`
- `emojis`: `8`
- `end`: `9`
- `focus`: `7`
- `start`: `8`

Harvest now:

- `anchor/*` basic, backward, distance, reverse rows
- `focus/*` basic, backward, distance, reverse rows
- `start/*` basic, backward, distance, reverse rows
- `end/*` basic, backward, distance, reverse rows
- `both/*` basic, backward, distance, expanded, reverse rows

Triage next:

- backward-direction edge rows that depend on exact legacy anchor/focus
  direction behavior

Skip for `Target A`:

- `both/unit-word*`
- `emojis/*`

Why:

- word-unit and emoji grapheme rows are `unsupported semantics`

### `Editor.before` / `Editor.after`

Legacy bucket counts:

- `before`: `11`
- `after`: `12`

Harvest now:

- `before/path.tsx`
- `before/point.tsx`
- `before/range.tsx`
- `before/start.tsx`
- `after/path.tsx`
- `after/point.tsx`
- `after/range.tsx`
- `after/end.tsx`

Triage next:

- rows that prove current mixed-inline and adjacent supported block-boundary
  stepping without depending on legacy non-selectable / void behavior

Skip for `Target A`:

- `before/path-void.tsx`
- `before/point-void.tsx`
- `before/range-void.tsx`
- `before/non-selectable-*`
- `after/path-void.tsx`
- `after/point-void.tsx`
- `after/range-void.tsx`
- `after/non-selectable-*`

Why:

- `void` and non-selectable rows are `unsupported semantics`

## Batch 2

Families:

- `select`
- `setPoint`
- `collapse`
- `setSelection`
- `deselect`

Seed rows already mirrored in
[/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts):

- `select/path.tsx`
- `select/point.tsx`
- `select/range.tsx`
- `setPoint/offset.tsx`
- `deselect/basic.tsx`

Harvest now:

- rows that prove:
  - `Path | Point | Range | null` selection replacement
  - live-draft selection reads
  - directional `start` / `end` behavior in `setPoint(...)`
  - collapse-to-edge semantics

Current oracle ceiling:

- legacy `select/*` rows exist and are mirrored
- legacy `setPoint/*` only exposes `offset.tsx`, and it is mirrored
- legacy `deselect/*` only exposes `basic.tsx`, and it is mirrored
- there is no legacy `collapse/*` transform oracle directory to harvest
- legacy `setSelection` evidence is operation-level only:
  - `/Users/zbeyens/git/slate/packages/slate/test/operations/set_selection/*`
  - those rows focus on custom selection props, which the current helper does
    not claim

Skip for `Target A`:

- rows that depend on broader legacy `Location` / `unit` / `voids` parity
- operation-only `setSelection` rows that rely on custom selection props
- missing legacy `collapse` transform rows do not create fake harvest debt

Why:

- those are `unsupported semantics`

## Batch 3

Families:

- `wrapNodes`
- `unwrapNodes`
- `liftNodes`

Seed rows already mirrored in
[/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts):

- `wrapNodes/block/block.tsx`
- `wrapNodes/block/block-end.tsx`
- `wrapNodes/block/block-across.tsx`
- `wrapNodes/path/block.tsx`
- `unwrapNodes/match-block/block.tsx`
- `unwrapNodes/match-block/block-end.tsx`
- `unwrapNodes/match-block/block-middle.tsx`
- `unwrapNodes/match-block/block-start.tsx`
- `unwrapNodes/match-block/block-across.tsx`
- `unwrapNodes/path/block.tsx`
- `unwrapNodes/path/block-multiple.tsx`
- `liftNodes/selection/block-full.tsx`
- `liftNodes/path/first-block.tsx`
- `liftNodes/path/last-block.tsx`
- `liftNodes/path/middle-block.tsx`
- `liftNodes/path/block.tsx`

### `wrapNodes`

Legacy bucket counts:

- `block`: `9`
- `inline`: `4`
- `path`: `1`
- `selection`: `1`
- `split-block`: `7`
- `split-inline`: `2`
- `voids-true`: `1`

Harvest now:

- `path/block.tsx`
- top-level `block/*` rows that match the current exact-path and top-level
  range/current-selection claim

Skip for `Target A`:

- `block/block-across-nested.tsx`
- `block/block-across-uneven.tsx`
- `block/block-nested.tsx`
- `block/inline-across.tsx`
- `block/omit-all.tsx`
- `block/omit-nodes.tsx`
- `inline/*`
- `selection/depth-text.tsx`
- `split-block/*`
- `split-inline/*`
- `voids-true/*`

Why:

- nested-block matcher rows are `unsupported semantics`
- omit/match-filter rows are `intentionally out of scope`
- inline, text-match, split, and void rows are `unsupported semantics`

### `unwrapNodes`

Legacy bucket counts:

- `match-block`: `7`
- `match-inline`: `4`
- `mode-all`: `6`
- `path`: `2`
- `split-block`: `7`

Harvest now:

- `path/*`
- `match-block/*` rows that stay inside top-level wrapper-block range/current
  selection support

Skip for `Target A`:

- `match-block/block-inline.tsx`
- `match-block/block-nested.tsx`
- `match-inline/*`
- `mode-all/*`
- `split-block/*`

Why:

- inline, broad mode, split, and nested matcher rows are `unsupported semantics`

### `liftNodes`

Legacy bucket counts:

- `path`: `4`
- `selection`: `2`
- `voids-true`: `1`

Harvest now:

- `path/*`
- `selection/*`

Skip for `Target A`:

- `selection/block-nested.tsx`
- `voids-true/*`

Why:

- nested match-driven lift rows are `unsupported semantics`
- void rows are `unsupported semantics`

## Exit Rule For Workstream 2

Workstream 2 is done when:

- every claimed family has harvested oracle coverage
- every skipped legacy row has a written reason
- the claimed surface is defended mostly by imported oracle semantics, not only
  local happy-path proof

Raw file-count parity is still not the goal.
Honest claim coverage is the goal.

## Public-Surface Deletion Audit Snapshot

### `packages/slate/src/**`

- `editor/**`
  - retained by stronger seam:
    - [editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts)
    - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- `interfaces/**`
  - retained by stronger seam:
    - [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts)
    - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- `transforms-node/**`
  - retained by stronger seam:
    - [transforms-node.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts)
    - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- `transforms-selection/**`
  - retained by stronger seam:
    - [transforms-selection.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection.ts)
    - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- `transforms-text/**`
  - retained by stronger seam:
    - [transforms-text.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text.ts)
    - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- `types/**`
  - retained by stronger seam through the current interfaces/type export surface
- `core/**`
  - intentionally dropped from public API and kept internalized behind:
    - [core.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts)
    - [create-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts)
- `utils/**`
  - intentionally dropped as a separate public bucket and internalized into the
    stronger seams above

### `packages/slate-dom/src/**`

- `plugin/**`
  - retained by stronger seam:
    - [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/bridge.ts)
    - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/index.ts)
- `utils/**`
  - retained by stronger seam:
    - [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/bridge.ts)
    - [clipboard.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/clipboard.ts)
    - [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/src/interfaces.ts)

### `packages/slate-history/src/history.ts`

- retained by stronger seam:
  - [history-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/history-editor.ts)
  - [history-state.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/history-state.ts)
  - [interfaces.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/interfaces.ts)
  - [with-history.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/with-history.ts)
  - [index.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/index.ts)

### `packages/slate-react/src/**`

- `chunking/**`
  - retained by stronger seam:
    - [components/editable-text.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx)
    - [components/editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
    - [projection-store.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts)
- legacy render primitives (`element.tsx`, `leaf.tsx`, `text.tsx`, `string.tsx`)
  - retained by stronger seam:
    - [components/slate-element.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-element.tsx)
    - [components/slate-leaf.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-leaf.tsx)
    - [components/slate-text.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-text.tsx)
    - [components/text-string.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/text-string.tsx)
    - [components/editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
- legacy hook/plugin seam (`useSelected`, `useFocused`, `useEditor`,
  `useSlateWithV`, `with-react`, `react-editor`)
  - retained by stronger seam:
    - [context.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/context.tsx)
    - [components/slate.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx)
    - [components/editable.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx)
    - [components/editable-text.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx)
    - [components/editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
    - [plugin/react-editor.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts)
    - [plugin/with-react.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/with-react.ts)
    - [hooks/use-slate.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate.tsx)
    - [hooks/use-element.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-element.tsx)
    - [hooks/use-selected.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-selected.tsx)
    - [hooks/use-slate-root-ref.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-root-ref.tsx)
    - [hooks/use-slate-node-ref.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx)
    - [hooks/use-slate-projections.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx)
- narrower remaining depth:
  - the direct `slate-dom` bridge and clipboard package lanes are now green
  - Android-only helper internals and the broader legacy DOMEditor matrix are
    still not part of this oracle ledger
