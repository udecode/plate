---
title: Preserve Yjs identity through structural wrap, unwrap, and fragment edits
date: 2026-05-28
last_updated: 2026-06-01
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Offline wrap_node drops a remote insert inside the wrapped node after reconnect.
  - Offline unwrap_node drops a remote insert inside the unwrapped node after reconnect.
  - Offline insert fragment drops a remote append at the same text position after reconnect.
  - Offline merge undo can leave the initiating editor split from the shared Yjs value.
  - Splitting inside a wrapped virtual child can throw `Length exceeded!` or hide the right split node.
  - Undoing a split after a prior virtual merge can leave the right split node visible.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, wrap-node, unwrap-node, insert-fragment, undo-redo]
---

# Preserve Yjs identity through structural wrap, unwrap, and fragment edits

## Problem
Some offline structural edits were encoded by cloning visible Yjs nodes and hiding the originals. That made reconnect look locally correct, but concurrent remote text stayed attached to hidden containers and disappeared from the visible Slate value.

## Symptoms
- B goes offline, wraps the first block, A inserts `!` into that block, then B reconnects. Broken result: the wrapped block reads `alpha`; expected `alpha!`.
- B goes offline, unwraps a virtual-wrapped block, A inserts `!` inside the wrapped block, then B reconnects. Broken result: peers can see an empty wrapper or lose the remote insert; expected one unwrapped paragraph reading `alpha!`.
- B goes offline, inserts `Lin fragment` at the end of `alpha`, A appends ` Ada`, then B reconnects. Broken result: `alphaLin fragment`; expected `alpha AdaLin fragment`.
- B goes offline, merges `alpha / beta`, A appends to `beta`, then B reconnects and undoes. Broken result: B can stay at `alphabeta / empty` while other peers read `alpha / beta`.
- A wraps `alpha`, then splits inside the wrapped text. Broken behavior either
  throws `Length exceeded!` while inserting the right split node or reads only
  the left side from Yjs afterward.
- A merges two paragraphs, splits the merged paragraph, then undoes. Broken
  behavior merges the text back into the left paragraph but leaves the right
  split paragraph visible because Undo deleted the hidden merge source instead.

## What Didn't Work
- Treating `wrap_node` as a normal `move_node` clone lost remote edits because the visible clone and hidden original were independent Yjs types.
- Replacing one text child with another for `insert_fragment` hid the original `Y.XmlText`, so remote inserts on the original text were skipped by readers.
- Letting a historic Slate undo commit export without reconciling back from Yjs allowed the local editor to keep a stale Slate replay even when the shared Yjs document had converged.

## Solution
Keep live Yjs identities in the paths that need CRDT conflict resolution.

For wrap-like moves, store a reference from the wrapper to the original moved node and hide the original only at its old root position. Read and path lookup helpers treat that referenced source as the wrapper's virtual child. The current first-party package names that fallback `virtual-move-ref`:

```ts
const SLATE_YJS_ID_ATTRIBUTE = 'slate:yjs-id'
const SLATE_YJS_HIDDEN_ATTRIBUTE = 'slate:yjs-hidden'
const SLATE_YJS_VIRTUAL_CHILD_ID_ATTRIBUTE = 'slate:yjs-virtual-child-id'

target.setAttribute(SLATE_YJS_ID_ATTRIBUTE, nodeId)
target.setAttribute(SLATE_YJS_HIDDEN_ATTRIBUTE, true)
wrapper.setAttribute(SLATE_YJS_VIRTUAL_CHILD_ID_ATTRIBUTE, nodeId)
```

`readSlateValueFromYjs(...)` and `getYjsNode(...)` must both resolve visible children through that virtual reference. If only reads do it, later text operations against wrapped paths will miss the original shared node.

For unwrap, do not apply the wrapper move path to the root. Public `unwrapNodes({ at: [0] })` emits `move_node [0,0] -> [0]` and then `remove_node [1]`. The Yjs encoder should restore the referenced source node, hide the emptied wrapper shell, and let the following remove operation delete that hidden shell:

```ts
target.removeAttribute(SLATE_YJS_HIDDEN_ATTRIBUTE)
wrapper.removeAttribute(SLATE_YJS_VIRTUAL_CHILD_ID_ATTRIBUTE)
wrapper.setAttribute(SLATE_YJS_HIDDEN_ATTRIBUTE, true)
```

That fallback is traceable as `virtual-unwrap-ref` followed by `virtual-unwrap-wrapper-remove`.

For single-text `replace_children` edits, apply a text diff to the existing `Y.XmlText` instead of hiding it and inserting a replacement container:

```ts
sharedText.delete(prefixLength, removedLength)
sharedText.insert(insertOffset, text, getNodeAttributes(leaf))
```

For historic commits, after exporting the Slate history replay to Yjs, read the canonical shared value and replace the local editor value when they differ.

Virtual wrapper children need one extra slot rule: the wrapper's visible child
list is the referenced virtual source followed by any raw visible children that
were inserted later by structural operations such as `split_node`.

```ts
if (virtualChild) {
  return [{ node: virtualChild, rawIndex: -1 }, ...rawSlots]
}
```

Structural encoders should also insert by visible child slot. `insert_node` and
both element/text `split_node` paths route through `insertYjsChild(...)` instead
of calling `parent.insert(index, ...)` directly. A virtual wrapper may have zero
raw children while exposing one visible virtual child, so raw insertion index
`1` is invalid even though visible index `1` is exactly where the right split
node belongs.

The same coordinate split applies to deletions. Custom split undo resolves the
right split element through a visible path, so removing it must call
`removeYjsChild(root, parent, index)`. Calling `parent.delete(index, 1)` uses a
raw Yjs index and can delete an earlier hidden merge source instead of the
visible right split node.

## Why This Works
Yjs can rebase concurrent edits when both peers edit the same shared type. Clone-and-hide is acceptable for some move operations, but not when the hidden source still receives meaningful concurrent text. A virtual wrapper child keeps the original shared node alive for both local wrapped edits and remote updates. Text diffing keeps fragment insertion in the same `Y.XmlText`, so same-offset inserts order by Yjs conflict rules instead of disappearing behind `slate:deleted`.

The history fix handles the remaining mismatch layer: Slate's local undo replay can be structurally stale, while Yjs has already produced the correct collaborative value. Replacing local Slate state from Yjs after a historic export keeps the initiating peer converged.

The virtual slot fix keeps wrapper reads faithful after later structural edits.
The virtual child is still first, preserving the original shared type identity,
and split-created raw siblings remain visible instead of becoming hidden Yjs
children that only exist in the underlying XML tree.

The split-undo deletion fix keeps history replay on the same coordinate system
as path lookup. If a previous merge left hidden raw nodes in the parent, visible
index `1` and raw index `1` can refer to different Yjs children.

## Prevention
- Add package-level tests for each structural encoder that can hide or clone a Yjs container.
- Characterize public composed transforms by their emitted Slate operations before encoding them. In the current v2 API, `wrapNodes` emits `insert_node` then `move_node`; `unwrapNodes` emits `move_node` then `remove_node`.
- Assert the trace entry for wrapper moves: `mode: "traceable-fallback"`, `fallback: "virtual-move-ref"`. A named fallback is fine; a silent clone is data loss wearing a hat.
- For virtual unwrap, assert source identity directly: the raw `Y.XmlElement` that was hidden under the wrapper must be the same object after unwrap.
- For browser examples, assert final peer text only; do not add style or disabled-state assertions to collaboration e2e tests.
- Treat Potion as a parity oracle only after confirming the same operation shape. Move/down clone loss still matches Potion and should stay out of this fix.
- When a fix needs conflict resolution, preserve the original Yjs shared type or add an explicit virtual reference back to it.
- When a Yjs element exposes virtual children, treat raw child indexes and
  visible Slate indexes as separate coordinate systems. Reads, path lookup, and
  insertions/deletions must all use the visible-slot helpers.

## Related Issues
- `docs/solutions/logic-errors/yjs-offline-replace-undo-concurrent-append-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`
- `docs/solutions/logic-errors/yjs-merge-read-virtual-text-leaves-2026-05-27.md`
