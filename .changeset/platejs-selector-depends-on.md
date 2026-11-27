---
'platejs': minor
---

Replace `shouldUpdate` on `useEditorSelector` and `useEditorState` with declarative `dependsOn`, and re-export `EditorSelectorDependency` and `EditorSelectorDependencies` from `platejs/react`.

- Migrate `UseEditorSelectorOptions` and `UseEditorStateOptions` to `{ dependsOn?, equalityFn? }` and update Plate's built-in hooks, `NodeSelection`, `FieldPlugin`, and `ListPlugin` to declare their dependencies with `dependsOn`.
- Commit normalized `dependsOn` changes in a layout effect rather than mutating selector filters during render, and include `equalityFn` in `useEditorSelector`'s snapshot cache key.
