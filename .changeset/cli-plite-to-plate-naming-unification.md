---
'@platejs/cli': minor
---

Update `plate codemod plite-to-plate` for unified Plite and Plate naming: remove obsolete `EditorStateSelectorOptions` and `useEditorEditableElement` rules, diagnose removed `useOptionalEditorReadOnly` and multi-root `useEditorContext` differences, support legacy `PagedEditablePage*` type renames, and resolve aliased `*EditorContent*` bindings for `root` lifting, render props, spread props, `<EditorRoot readOnly>` override conflicts, and 3-arg `useEditorSelector` / `useStateFieldValue` `deferred` checks.
