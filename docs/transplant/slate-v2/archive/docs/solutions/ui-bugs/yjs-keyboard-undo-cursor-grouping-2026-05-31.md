---
title: Yjs demo keyboard undo needs user-intent groups
date: 2026-05-31
category: docs/solutions/ui-bugs
module: slate-yjs demo
problem_type: ui_bug
component: tooling
symptoms:
  - Keyboard Undo removed more edits than the toolbar Undo button.
  - Button Undo and keyboard Undo disagreed after repeated command controls.
  - The local and remote cursor could stay at the pre-undo offset.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-yjs, undo-redo, keyboard, cursor, playwright]
---

# Yjs demo keyboard undo needs user-intent groups

## Problem

The collaboration demo used a flat local undo counter for keyboard history.
That made `Cmd+Z` / `Ctrl+Z` drain every pending local edit while the toolbar
button only replayed one Yjs undo item. After undo, the Slate selection and
remote cursor display could still point at the old document offset.

## Symptoms

- Two Append button clicks followed by one keyboard Undo removed both appends.
- Offline keyboard edits needed multiple low-level Yjs undos to revert one user
  intent, such as `Enter` followed by typing a word.
- Remote cursor status stayed at the old selection after history replay.

## What Didn't Work

- Replacing the keyboard path with a single Yjs undo made command buttons match,
  but native typing only reverted one low-level Yjs item.
- Replacing the keyboard path with Slate history respected typing groups, but
  command buttons could merge into one Slate history batch and undo too much.
- Convergence-only Playwright assertions missed the cursor regression.

## Solution

Track demo history as user-intent groups instead of a flat count:

```ts
type ExampleUndoGroup = {
  kind: 'command' | 'keyboard'
  size: number
}
```

Command controls create their own groups. Consecutive keyboard text edits merge
into one group, while each Enter key starts a new group so repeated empty
paragraph splits remain independently undoable. Undo and redo pop one group and
replay exactly that many Yjs history items.

After history replay, normalize the local Slate selection against the current
document and send it through Yjs awareness:

```ts
tx.selection.set(selection)
yjsTx(tx).sendSelection(selection, { name: peer.name })
```

Test setup edits use a dedicated tag so fixture creation does not pollute the
demo's user undo stack:

```ts
handle.applyOperations(operations, { tag: 'yjs-example-test-setup' })
```

## Why This Works

Yjs history stores low-level document transactions, but the demo UI exposes
user-facing undo. A keyboard word, a split plus typed text, and a toolbar command
are user intents even when they produce different numbers of Yjs stack items.
Grouping gives keyboard and button controls the same unit of work without
falling back to snapshots.

Selection repair is separate from document replay. History changes the document,
then the demo clamps the local cursor to a valid text point and publishes that
selection as awareness so remote cursor UI follows the reverted state.

## Prevention

- Do not model collaboration undo UI with a flat integer when low-level history
  can split one user intent into several Yjs items.
- Browser tests for history controls should assert one keyboard shortcut,
  document convergence, local Slate selection, and remote cursor awareness.
- Test setup operations should be traceable and excluded from user history.

## Related Issues

- `docs/solutions/developer-experience/yjs-awareness-react-hooks-2026-05-29.md`
- `docs/solutions/logic-errors/yjs-offline-merge-stale-undo-2026-05-26.md`
- `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`

