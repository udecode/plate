---
title: Rebase Slate history offsets after Yjs reconnect merges
date: 2026-05-25
last_updated: 2026-05-26
category: runtime-errors
module: slate-yjs
problem_type: runtime_error
component: tooling
symptoms:
  - Disconnected peer edits merged correctly after reconnect
  - The disconnected peer's Undo button stayed enabled
  - Clicking Undo threw a Slate remove_text offset mismatch error
  - Remote snapshot replacement left an enabled local Undo for deleted text
  - Remote snapshot replacement left an enabled local Undo for deleted marks
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-yjs, slate-history, yjs, reconnect, playwright, marks]
---

# Rebase Slate history offsets after Yjs reconnect merges

## Problem
A peer can edit while disconnected, reconnect, converge with the remote peer, and
still hold a Slate history item whose text offset points at the pre-merge
document. The same class of bug appears when a remote replacement deletes the
local edit entirely: the local undo item is no longer meaningful and must be
removed before UI subscribers read history availability.

## Symptoms
- Peer B disconnects and appends `Lin`.
- Peer A appends `Ada`.
- Peer B reconnects and both peers converge to text containing `Ada Lin`.
- Peer B Undo is enabled.
- Clicking Peer B Undo throws `Cannot apply a "remove_text" operation ... because the text at offset ... does not match the operation text`.
- Peer A appends `Ada`, Peer B replaces the document with
  `Lin canonical snapshot.`, and Peer A's Undo remains enabled even though the
  `Ada` insertion no longer exists.
- Peer B disconnects, marks the first word bold, Peer A replaces the document,
  and Peer B reconnects with Undo still enabled. Clicking Undo can throw
  `Cannot read properties of undefined (reading 'text')`.

## What Didn't Work
- Routing the Undo button through Slate history fixed the button/API mismatch,
  but it exposed stale history offsets after Yjs reordered concurrent inserts.
- Snapshot replacement alone converged the document, but it did not rebase the
  queued Slate history operation that still pointed at the old local offset.
- Repairing history after `editor.update(...)` made the core history stack
  correct, but React had already read stale `canUndo` from the commit snapshot.

## Solution
Prefer operation-level text replay when importing a remote Yjs snapshot, then
repair queued Slate `insert_text` history offsets against the converged Slate
value.

The import path first turns a single changed text leaf into replayable Slate ops:

```ts
const remoteOperations = createRemoteTextReplayOperations(
  snapshot.children,
  nextValue
)

if (remoteOperations && remoteOperations.length > 0) {
  this.editor.update((tx) => {
    tx.operations.replay(remoteOperations)
    tx.selection.set(nextSelection)
  }, REMOTE_IMPORT_OPTIONS)
  return
}
```

During the remote import commit, after Slate history rebases skipped remote
operations and before React subscribers receive the snapshot, scan undo and redo
history batches. If a text-removal replay still has a matching target at another
offset, move it to the nearest matching occurrence:

```ts
const nextOffset = findNearestTextOffset(
  text,
  operation.text,
  operation.offset
)

if (nextOffset !== null) {
  operation.offset = nextOffset
}
```

If the path or text no longer exists, remove the batch from that history stack:

```ts
if (text == null || nextOffset === null) {
  stack.splice(index, 1)
}
```

The same repair pass must validate non-text operations that replay against text
leaves. A partial mark creates `set_node` history, often surrounded by split
operations. When a remote replace deletes that marked leaf, the path can still
transform to some node, but the inverse `set_node` no longer has its expected
precondition. Drop the batch when the replay operation's `properties` do not
match the current node:

```ts
const replayOperation =
  mode === 'undo' ? OperationApi.inverse(operation) : operation

if (!node || !propertiesMatch(node, replayOperation.properties)) {
  stack.splice(index, 1)
}
```

Do not drop a whole batch just because a text-level `split_node` inverse merge
target is missing. Paragraph splits can contain text splits whose undo remains
valid through the element-level merge.

## Why This Works
Yjs resolves concurrent disconnected appends by producing a converged document,
but Slate history stores concrete path/offset operations. When remote text is
inserted before the local insertion, the local history item remains valid in
intent but invalid in coordinates. Replaying the remote text import keeps the
editor closer to operation semantics, and repairing text insertion offsets keeps
the user's pending undo pointed at the text that user inserted.

When a remote replacement deletes the user's local insertion, there is no valid
coordinate to repair. Keeping that batch enabled can only produce a no-op or a
Slate operation error. Removing the stale batch is the correct user-history
semantics.

For mark history, Slate `set_node` operations do not validate old properties
during apply. That makes path validity insufficient: replaying an inverse mark
operation against a replacement leaf can either no-op or mutate the wrong text.
Checking the replay operation's expected `properties` against the converged node
turns stale mark history into a disabled Undo state before the user can trigger
the bad replay.

The repair must run in the `onCommit` window, after history has rebased the
remote skipped commit and before runtime subscribers read history state. Running
it after `editor.update(...)` is too late for `useSlateHistory`.

Remote imports still use collaboration metadata that skips user history, so the
remote peer's append does not become undoable by the reconnecting peer.

## Prevention
- Add Playwright coverage for disconnect -> local append -> remote append ->
  reconnect -> local Undo.
- Add Playwright coverage for local append -> remote replace -> local Undo
  disabled with no `pageerror`.
- Add Playwright coverage for offline mark -> remote replace -> reconnect ->
  local Undo disabled with no `pageerror`.
- Treat enabled-but-no-op Undo after reconnect as stale history state, not a
  button state bug.
- Preserve operation-level replay before falling back to full snapshot
  replacement when text changes can be expressed as Slate ops.
- Validate replay preconditions for non-text history operations before pruning
  structural history broadly; text-level split operations can be part of a valid
  paragraph undo batch.

## Related Issues
- `docs/solutions/ui-bugs/yjs-user-history-button-routing-2026-05-25.md`
  covers the related control-layer rule: user-facing Undo must use Slate
  history, not the Yjs UndoManager.
