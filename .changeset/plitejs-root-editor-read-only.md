---
'plitejs': patch
---

- Fix `useRootEditor`, `useCommand` and `useEditorHistory` ignoring the read-only state and authored view of the view that shows their root. Inside a read-only `EditorRoot`, or beside a read-only `Editable` of their root, a root editor and a command throw on a write, and undo and redo do nothing. In suggesting mode, a root editor records its edits as proposals
- Fix an `EditorRoot` staying read-only after its read-only `Editable` unmounts. An `EditorRoot` is read-only while it has `readOnly`, or while every `Editable` that shows its root is read-only and at least one does
- Fix a view made from another view with `createEditorView` keeping the read-only state and authored view its source had at creation. It follows its source while both exist
