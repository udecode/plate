---
title: Force text render fanout for structural text edits
date: 2026-05-28
last_updated: 2026-05-29
category: ui-bugs
module: slate-react
problem_type: ui_bug
component: tooling
symptoms:
  - Public split button changed the Slate model but left the local DOM text stale
  - Keyboard Enter did not reproduce the stale DOM
  - Yjs peers could appear divergent after reconnect and undo
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-react, slate-yjs, dom-sync, split-node, selector-fanout]
---

# Force text render fanout for structural text edits

## Problem
Programmatic structural text edits such as `tx.nodes.split({ at })` can change a
text node without changing selection. In the Yjs collaboration example, clicking
Split Node while disconnected left the local DOM showing `alphabeta / abeta`
even though the model and shared Yjs value were `alph / abeta`.

## Symptoms
- B disconnects, clicks Split Node on `alphabeta`, and the local DOM shows
  `alphabeta / abeta`.
- The same split through keyboard Enter renders correctly.
- After reconnect and Undo, peers can look divergent because the initiator DOM
  is stale while the model has already changed.
- Collaboration controls that replay public structural operations can preserve
  selection and runtime identity in ways keyboard paths do not, so they need
  their own browser proof.

## What Didn't Work
- Fixing Yjs split encoding did not address this case. The core `@slate/yjs`
  value and shared document already held the correct split.
- Treating the button as the only problem missed that public transaction APIs
  can be called from custom controls and may not change selection.
- Extending direct DOM text sync alone was not enough when custom render props
  opt out of text-node DOM sync.

## Solution
Treat text-affecting structural operations as DOM text sync candidates:
`split_node` syncs the split text path and `merge_node` syncs the previous text
path. The commit classification should mark text-path `split_node` operations
as both structural and text changes, and include the split text runtime id in
`dirtyTextRuntimeIds`, `textDirtyRuntimeIds`, and
`affectedTextRuntimeIds`. If direct DOM sync cannot run, pass
`operations: undefined` into selector dispatch to force mounted text selectors
to re-read the model.

Do not let the top-level structural fanout optimization skip that forced path:

```ts
const shouldSkipRuntimeFanout = Boolean(
  change &&
    operations !== undefined &&
    affectedRuntimeIds == null &&
    !change.selectionChanged &&
    !change.fullDocumentChanged &&
    (change.rootRuntimeIdsChanged || change.topLevelOrderChanged)
)
```

When a rendered example still keeps a stale Slate React DOM node after the core
commit metadata is correct, remount only the affected editor surface with a
local render epoch. Keep that scoped to example/tooling controls; it is a
fallback for a public control path, not the collaboration protocol.

## Why This Works
Keyboard Enter changes selection, so the selector fanout optimization does not
skip mounted runtime listeners. A direct `tx.nodes.split({ at })` can produce
the same structural text change without selection movement, which made the
optimization skip the old left text runtime. Marking the structural text op as
unsynced and honoring the forced selector path makes custom leaf renderers
refresh from model truth.

## Prevention
- Add browser coverage for public command buttons, not only keyboard paths.
- Assert commit metadata for structural text operations in core tests before
  debugging Yjs encoding or example UI.
- When the model and Yjs value are correct but DOM text is stale, inspect
  selector fanout before changing collaboration encoding.
- Treat structural operations that rewrite text content as text-render
  invalidation sources, especially `split_node` and `merge_node`.

## Related Issues
- `docs/solutions/ui-bugs/yjs-button-undo-dom-sync-2026-05-24.md`
- `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`
