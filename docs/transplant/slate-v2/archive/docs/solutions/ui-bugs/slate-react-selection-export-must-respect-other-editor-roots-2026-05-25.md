---
title: Slate React selection export must respect other editor roots
date: 2026-05-25
category: docs/solutions/ui-bugs
module: slate-react selection runtime
problem_type: ui_bug
component: tooling
symptoms:
  - Clicking the third editor in a multi-editor page moved focus back to the first editor.
  - Clicking the fourth editor moved focus back to the second editor.
  - Offline Yjs peers looked unselectable even though the mousedown target was correct.
root_cause: scope_issue
resolution_type: code_fix
severity: high
tags: [slate-react, selection-export, focus, multi-editor, yjs]
---

# Slate React selection export must respect other editor roots

## Problem

A page with several independent Slate editors could move DOM focus back to an
earlier editor while the user clicked a later editor. The Yjs collaboration demo
made this visible after three peers went offline: C and D received mousedown, but
focus landed in A and B.

## Symptoms

- Browser event logs showed `mousedown` targeting `yjs-peer-c-editor-surface`.
- Before `mouseup`, `focusin` fired for `yjs-peer-a-editor-surface`.
- Patching `HTMLElement.prototype.focus` showed no calls.
- Patching `Selection.prototype.setBaseAndExtent` showed a Slate React layout
  effect writing A's model selection back into the DOM.

## What Didn't Work

- Guarding only `syncEditableDOMSelectionToEditor`. `useEditableSelectionReconciler`
  has its own layout-effect export path and still called `setBaseAndExtent`.
- Treating the Yjs offline state as the cause. Offline made the issue obvious,
  but the bug was editor-root ownership during DOM selection export.

## Solution

Teach Slate React selection export to detect when the browser selection already
belongs to another Slate editor root.

Both export paths use the same owner check:

```ts
isDOMSelectionInsideAnotherSlateEditor({
  domSelection,
  editorElement,
})
```

If the current browser selection is inside another `[data-slate-editor]`, the
current editor skips model-to-DOM selection export. The clicked editor can then
own the native focus and import its own selection normally.

The regression row clicks A, B, C, and D after B/C/D are offline and asserts
that `document.activeElement` remains inside the clicked peer surface.

## Why This Works

Independent editors can have identical runtime ids and paths, so document-level
DOM selection writes must be scoped by the owning editable root. A stale model
selection in editor A is still valid for A, but it must not overwrite a browser
selection that is already inside editor C.

## Prevention

- Browser selection export paths need root ownership checks before calling
  `setBaseAndExtent`, `addRange`, or `removeAllRanges`.
- Multi-editor browser tests should assert the active editable root, not just
  visible text or model state.
- When a focus bug has no `.focus()` call, patch `Selection.prototype` methods
  to catch implicit focus movement from DOM selection writes.

## Related Issues

- [Yjs user history button routing](./yjs-user-history-button-routing-2026-05-25.md)
