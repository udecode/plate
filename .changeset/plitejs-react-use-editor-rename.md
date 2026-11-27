---
'plitejs': patch
---

Rename `plitejs/react`'s editor-creation hook to `useCreateEditor`, make `useEditor()` and `useOptionalEditor()` read the active editor from context, align React read hooks with `useEditor()`, and remove `useCaretEditor` and `UseEditorOptions`.

- Replace `useEditor(options, deps)` with `useCreateEditor(options, deps)` (and `UseEditorOptions` with `CreateEditorOptions`). Zero-argument `useCreateEditor()` returns `Editor<Value, readonly []>` and rejects input-free type parameters.
- `useEditor()` and `useOptionalEditor()` take no arguments (passing any argument, including `undefined`, throws at runtime) and return the editing area's editor inside an `Editable` or the active caret root's editor (falling back to `EditorRoot`'s own root) outside every editing area. Note for apps upgrading from bare `useEditor()` with no arguments: `useEditor()` now reads from context instead of creating an empty editor, so switch creation calls to `useCreateEditor()`.
- Replace `useCaretEditor()` with `useEditor()`.
- `useEditorSelector`, `useEditorState`, `useEditorSelection`, `useEditorFocused`, `useEditorComposing`, `useEditorReadOnly`, `useStateFieldValue`, and `useSetStateField` now follow `useEditor()` so toolbars read and act on the same active root editor.
