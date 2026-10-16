---
'platejs': patch
---

Release a `useCreateEditor` editor's outside resources, such as its Yjs document, when the component unmounts, the editor is replaced or `enabled` turns off, so a remount or a new `id` binds the same `Y.Doc` again. Plugins take such resources with `acquire(take)` in `activate`, and `editor.destroy()` ends an editor from `createEditor`.
