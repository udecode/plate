---
title: Normalize empty editor roots after full-document deletion
date: 2026-05-27
category: runtime-errors
module: slate-core
problem_type: runtime_error
component: tooling
symptoms:
  - Cmd+A Backspace leaves the initiating editor with an empty root
  - Clicking the editor after deletion throws a missing start text node error
  - Undo after deletion can throw while peers show an empty placeholder paragraph
  - Single-line Cmd+A Backspace can leave a focused editor with no usable DOM selection range
root_cause: missing_validation
resolution_type: code_fix
severity: high
tags: [slate-core, slate-react, normalization, editor-root, selection, yjs, playwright]
---

# Normalize empty editor roots after full-document deletion

## Problem
Deleting the whole document through a real browser selection could leave the
initiating editor with no root children. Connected peers rendered the normalized
empty paragraph, but the initiating editor stayed structurally invalid and threw
when the user clicked or pressed undo.

## Symptoms
- Peer A selects all content and presses Backspace.
- Peer A's editable DOM becomes empty while remote peers show one empty
  paragraph placeholder.
- Clicking Peer A can throw
  `Cannot get the start point in the node at path [] because it has no start text node.`
- Pressing undo can throw `Cannot read properties of undefined (reading 'text')`.

## What Didn't Work
- Repairing only empty non-editor elements missed the root itself. The default
  normalizer inserted an empty text child for empty blocks but allowed
  `Editor.children` to stay empty.
- Relying on operation-triggered normalization missed `Editor.replace`, because
  replace snapshots update children without appending content operations.

## Solution
Treat an empty editor root as invalid and insert the fallback empty block before
normalizing children:

```ts
if (NodeApi.isEditor(node) && getNodeChildren(editor, node).length === 0) {
  const fallback = resolveFallbackElement(fallbackElement)
  const emptyElement = fallback
    ? {
        ...fallback,
        children:
          Array.isArray(fallback.children) && fallback.children.length > 0
            ? fallback.children
            : [{ text: '' }],
      }
    : { children: [{ text: '' }] }

  insertNodes(editor, emptyElement, { at: [0] })
  return
}
```

Also force normalization for replace transactions that changed content but did
not produce operations:

```ts
if (latestContentOperationByRoot.size === 0 && snapshot?.reason === 'replace') {
  latestContentOperationByRoot.set(snapshot.childrenRoot ?? MAIN_ROOT_KEY, undefined)
}
```

Lock the behavior at both layers:

- Core: `Editor.replace(editor, { children: [] })` repairs to one empty block.
- Browser: real `Cmd+A`, `Backspace`, and `Cmd+Z` keep every collaboration peer
  usable with no page errors.

For the single-line focus-loss case, keep the root normalizer as the only owner
of empty-block insertion and repair the selection in `slate-react` after the
full-root delete:

```ts
const shouldResetRoot = deletesWholeRoot(editor, blockPaths)
const rootStart = { path: [0, 0], offset: 0 }

editor.update((tx) => {
  for (const blockPath of [...blockPaths].reverse()) {
    tx.nodes.remove({ at: blockPath })
  }

  if (shouldResetRoot) {
    tx.selection.set({ anchor: rootStart, focus: rootStart })
  }
})
```

Do not insert another paragraph in this path. `tx.nodes.remove` already runs the
root normalizer; inserting here creates a second empty paragraph and turns the
next typed character into `["2", ""]`.

## Why This Works
Slate's editable surface assumes the editor root always has a start text node.
An empty root breaks point resolution before collaboration or history can recover
the view. Root normalization restores the invariant at the lowest layer, and the
replace-transaction pass covers snapshot replacement paths that do not emit
normal Slate content operations.

## Prevention
- Include editor-root invariants in normalization contract tests, not only block
  and inline children.
- Browser collaboration tests should include full-document native selection
  deletion and immediate keyboard undo.
- Cross-browser tests should cover continued typing after single-line
  full-selection deletion. Chromium can keep the page looking fine while
  Firefox/WebKit expose `rangeCount === 0`.
- When adding snapshot mutation APIs, verify they either emit operations or
  explicitly schedule normalization for the changed root.

## Related Issues
- `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`
- `docs/solutions/runtime-errors/yjs-disconnected-undo-history-offset-2026-05-25.md`
- `docs/solutions/ui-bugs/yjs-user-history-button-routing-2026-05-25.md`
