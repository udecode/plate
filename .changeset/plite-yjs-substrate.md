---
'plitejs': major
---

- Connect raw editors to Yjs with `plitejs/yjs`, including provider lifecycle, shared effects, named roots, schema identity and collaborative undo.
- Read provider state and typed remote cursors from `plitejs/yjs/react`.
- Observe resolved remote cursor changes with `state.yjs.subscribeRemoteCursors(listener)` without subscribing to unrelated awareness updates.
- Compile detached schema facts with `compileEditorSchemaContract(editor, extensions)` on an empty, unchanged raw editor; keep compiled maps and collaboration bookkeeping private.
