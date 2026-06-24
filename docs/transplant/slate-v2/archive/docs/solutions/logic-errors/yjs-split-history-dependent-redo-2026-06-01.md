---
title: Gate custom Yjs split history replay when dependent redo items exist
date: 2026-06-01
last_updated: 2026-06-01
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Merge then split then undo throws a split history error and does not revert
  - Keyboard Redo after undoing multi-paragraph input to an empty document no-ops
  - Undo remains enabled after the visible document returns to an empty paragraph
  - Cursor stays at the old paragraph after Redo restores a later paragraph
  - No-op command buttons can enable Undo and later create unexpected blocks
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, undo-redo, split-node, history, keyboard, command, no-op]
---

# Gate custom Yjs split history replay when dependent redo items exist

## Problem
Split history had two valid requirements that conflicted. Custom split replay is needed for existing concurrent-edit behavior, but it must not run when later undone edits still point at the split-created right-side Yjs node.

## Symptoms
- Merge, split, then undo could throw `Cannot undo split_node with a non-text right-side element yet.` and leave the document split.
- Typing `a`, pressing Enter, typing `b`, undoing to an empty paragraph, then redoing could lose `b`.
- The example history controls could stay enabled after the visible document had no local undoable text left.
- Keyboard Redo could consume the redo groups without restoring text, while toolbar Redo appeared healthier.
- After Redo restored `a / b`, the local and remote cursor could remain at the end of `a`.
- Command buttons like Remove, Merge, Unwrap, Lift, and Unset could be visually no-op on a plain single paragraph while still enabling Undo. Undo could then create `block 2` or a `blockquote`.

## What Didn't Work
- Replaying inverse Slate operations for every split looked direct but deleted the right-side Yjs node and recreated a different one on redo.
- Falling back to native Yjs replay for every split preserved local redo identity but regressed the existing offline split plus concurrent remote append contract.
- Convergence-only checks missed the bug because the failure was in later redo stack behavior, not the immediate merged document text.
- Filtering only the demo `undoGroups`/`redoGroups` was too shallow. Browser keyboard Undo can emit no-op `replace_fragment` repairs where `children` and `newChildren` are identical; if those operations reach Yjs, they can still clear the underlying redo stack.
- Repairing selection to the same text path was wrong when the previous cursor was at document end and Redo added a later paragraph.
- Making demo controls always exercise an operation by inserting a temporary second paragraph or wrapping a normal paragraph was wrong. The final document could look unchanged, but the intermediate insert/wrap became real Yjs and UI history.

## Solution
Keep the custom split replay path, but only use it when the split item is isolated on the redo side. If another local edit was undone first, native Yjs replay keeps dependent item identities valid.

```ts
private undoSplit() {
  const undo = this.peekSplit(this.undoManagerAdapter.peekUndo())

  if (!undo || this.undoManagerAdapter.redoDepth() > 0) {
    return false
  }

  // custom split merge replay
}

private redoSplit() {
  const redo = this.peekSplit(this.undoManagerAdapter.peekRedo())

  if (!redo || this.undoManagerAdapter.redoDepth() > 1) {
    return false
  }

  // custom split replay
}
```

Also make the custom merge path read all visible text under the right-side element instead of assuming a single direct text child, and keep the demo history stack from recording empty commits as undoable groups.

No-op structural replacements are filtered before the Yjs transaction starts:

```ts
const operations = commit.operations.filter(
  (operation) =>
    operation.type !== 'set_selection' &&
    !isNoopSlateOperationForYjs(operation)
)
```

The same guard lives in `applySlateOperationToYjs` so direct operation replay does not trace or write an identity-risk replacement for unchanged children.

The demo catches collaboration history shortcuts at the editor-surface capture boundary. That keeps `Cmd/Ctrl+Z` and `Cmd/Ctrl+Shift+Z` on the Yjs history path even when Slate React would otherwise consume the event before the example's `Editable onKeyDown` handler.

Selection repair treats document-end separately from text-leaf-end. If Redo grows `['a']` into `['a', 'b']`, the cursor moves to `[1, 0]@1`, not `[0, 0]@1`.

No-op command helpers return before editing when their preconditions are missing. Remove and Merge require a second paragraph. Unwrap and Lift require an existing quote wrapper. Unset requires the target property to exist.

## Why This Works
Yjs redo items can target concrete shared types created by an earlier split. Deleting that right-side element during custom split undo invalidates later redo items that still reference it. Native Yjs undo/redo preserves the internal references for that dependent case, while the isolated custom path keeps the concurrent remote append behavior already covered by package tests.

Ignoring empty commits keeps the demo's `undoGroups` and `redoGroups` aligned with real Yjs undo items, so the buttons cannot spend fake history entries.

Ignoring no-op structural replacements before Yjs transaction creation keeps the underlying `Y.UndoManager` redo stack intact. This is stricter than UI-stack filtering: a no-op Slate replacement can still be a tracked Yjs transaction if it reaches the encoder.

Capturing keyboard history at the surface makes keyboard and toolbar history use the same collaboration protocol. Selection normalization then publishes the repaired cursor through awareness, so remote cursor UI tracks undo and redo, not just document text.

Command helpers must not synthesize setup content inside an undoable command. Even if the command restores the same visible text before the network sync, the intermediate Yjs transactions remain undoable and can be replayed later.

## Prevention
- Test split history with a later edit inside the split-created right paragraph, then undo and redo the whole sequence.
- Test merge followed by split followed by undo, because virtual merge children make the right side more complex than one direct text node.
- Assert history button disabled state after undoing to an empty paragraph; stale enabled controls usually mean the UI stack drifted from the Yjs stack.
- Add package tests for no-op structural replacements between Undo and Redo. They should leave Yjs trace empty and preserve redo.
- Browser tests for history bugs should assert text, local selection, remote cursor awareness, and disabled button state for keyboard and toolbar paths separately.
- Browser tests for command no-ops should assert the command leaves Undo disabled, not merely that visible text is unchanged.
- Treat custom Yjs replay as unsafe whenever redo items can still reference nodes the custom path would delete.

## Related Issues
- `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`
- `docs/solutions/logic-errors/yjs-merge-read-virtual-text-leaves-2026-05-27.md`
- `docs/solutions/ui-bugs/yjs-keyboard-undo-cursor-grouping-2026-05-31.md`
