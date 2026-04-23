---
date: 2026-04-03
topic: slate-v2-range-refs-proof-plan
status: completed
---

# Slate v2 Range Refs Proof Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Implement the first durable range-reference seam in `slate-v2` so persistent
annotation anchors stop depending on ephemeral selection state.

## Why This Slice

The projection proof solved local overlay subscriptions.
It did not solve durable anchors.

Without range refs or bookmarks:

- comment anchors die on edits
- annotation overlays can only follow current selection
- `slate-react-v2` remains good at ephemeral projection and bad at persistence

## Working Hypothesis

The smallest honest first cut is probably:

- `Editor.rangeRef(editor, range)`
- returned ref object exposes current `Range | null`
- ref updates incrementally across the supported operation families
- `unref()` detaches it cleanly

Bookmark serialization may be a later follow-up unless the first proof forces
it.

## Chosen First Cut

Public API:

- `Editor.rangeRef(editor, range, options?)`
- `type RangeRef`
- `type RangeRefAffinity = 'forward' | 'backward' | 'outward' | 'inward' | null`

Semantics:

- default affinity should be `inward`
- this is better for persistent annotation anchors than legacy Slate's default
  `forward`
- ref state is transaction-aware and publishes on commit
- `unref()` returns the latest logical range and detaches the ref

Proof subset:

- ranges only over the current v2 text-proof subset:
  text points at `[block, 0]`
- supported op families in the first proof:
  - `insert_text`
  - `insert_fragment`
  - `move_node`
  - `set_selection` as a no-op for ref transform
  - explicit replacement clears or detaches refs intentionally

## Phases

### Phase 0

Map legacy behavior, current v2 seams, and issue pressure.

### Phase 1

Write a narrow red test for one durable range-ref behavior.

### Phase 2

Implement the smallest core seam that passes the test.

### Phase 3

Expand to the next required operation families only if tests force it.

### Phase 4

Verify, deslop, re-verify, architect review, cleanup.

## Progress Log

### 2026-04-03

- grounded the seam from:
  - v2 docs and issue pressure
  - legacy Slate ref behavior
- chose the first proof cut:
  - `Editor.rangeRef(editor, range, options?)`
  - `RangeRefAffinity`
  - default affinity `inward`
  - transaction-aware draft ref publishing
- landed the proof in `../slate-v2`
- added focused contract coverage for:
  - commit-boundary publication
  - move-node rebasing
  - explicit multi-block fragment rebasing
  - explicit replacement invalidation
  - default inward boundary behavior
  - `unref()` detach semantics
  - invalidation during an active transaction
- deslop pass found and fixed one real bug:
  `unref()` could read stale committed state when the draft ref value was already `null`
- verification evidence:
  - `zsh -lc 'yarn mocha --require ./config/babel/register.cjs ./packages/slate-v2/test/range-ref-contract.ts'`
  - `zsh -lc 'yarn mocha --require ./config/babel/register.cjs ./packages/slate-v2/test/snapshot-contract.ts'`
  - `zsh -lc 'yarn mocha --require ./config/babel/register.cjs ./packages/slate-v2/test/clipboard-contract.ts'`
  - `zsh -lc 'yarn workspace slate-react-v2 test'`
  - LSP diagnostics `0` on changed files
- architect review initially rejected three issues and they were fixed:
  - generic move-node rebasing
  - rollback safety for refs created in aborted transactions
  - runtime-id cursor reuse after `replaceSnapshot()`
- final architect verdict: `APPROVE`
- reusable note captured in:
  [2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md)
