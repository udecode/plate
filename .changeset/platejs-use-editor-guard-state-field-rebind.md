---
'platejs': patch
---

Enforce zero-argument runtime guards on `useEditor()` and `useOptionalEditor()`, tighten `useCreateEditor()` typing, and rebind `useStateFieldValue` and `useSetStateField` to Plate's `useEditor()`.

- `useEditor()` and `useOptionalEditor()` in `platejs/react` now throw when passed any argument (including `undefined`), matching `plitejs/react`.
- Zero-argument `useCreateEditor()` now returns a non-null default editor and refuses caller-supplied generics without an options object.
- `useStateFieldValue` and `useSetStateField` now resolve through Plate's `useEditor()`, so components under a passive `EditorProvider` read and update the provider's editor. Plate's `UseStateFieldValueOptions` omits `deferred` to match `useEditorState` and `useEditorSelector`.
- Inside `<EditorContent readOnly>`, Plate's per-node render `readOnly` now reports `true`.
