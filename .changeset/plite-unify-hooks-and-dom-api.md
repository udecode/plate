---
'plitejs': major
---

Unify Plite selector options, read-only hook, and DOM API with Plate:

- Rename `EditorSelectorOptions` to `UseEditorSelectorOptions`, add `= unknown` default on `UseStateFieldValueOptions`, and remove public `deferred` from `UseEditorSelectorOptions`, `UseStateFieldValueOptions`, and `EditorRuntimeSelectorOptions` (wrap selector results with React `useDeferredValue` instead).
- Remove `useOptionalEditorReadOnly` from `plitejs/react`; use `useEditorReadOnly()` directly (returns `false` outside providers).
- Unexport `DOMEditor` (value and type) from `plitejs/dom`; use `editor.api.dom.*` and `editor.api.dom.clipboard.*`.
