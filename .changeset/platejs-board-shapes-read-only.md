---
'platejs': patch
---

- Export `setEditorViewing` from `platejs`. Pass it the view `useEditor()` returns inside an `EditorRoot` that shows an `EditorContent`. Under `EditorProvider`, or while no `EditorContent` is mounted, `useEditor()` returns the editor `createEditor` returns. `setEditorViewing` refuses that editor, so lock it with `setEditorReadOnly`.
- A board writes no shape style while its shapes root is read-only, even in a writable page. When two editing areas of one `EditorRoot` show a board, each board follows its own area's lock.
