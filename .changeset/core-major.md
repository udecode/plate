---
'@udecode/plate-core': major
---

- **Plugin `normalizeInitialValue`** now returns `void` instead of `Value`. When mutating nodes, keep their references (e.g., use `Object.assign` instead of spread).
- **Editor methods have moved** to `editor.tf` and `editor.api`. They still exist at the top level for **slate backward compatibility**, but are no longer redundantly typed. If you truly need the top-level method types, extend your editor type with `LegacyEditorMethods`. Since these methods can be overridden by `extendEditor`, `with...`, or slate plugins, consider migrating to the following approach:

  ```tsx
  extendEditorTransforms(({ editor, tf: { deleteForward } }) => ({
    deleteForward(options) {
      // ...conditional override

      deleteForward(options);
    },
  }));
  ```

This was previously done in `extendEditor` using top-level methods, which still works but now throws a type error due to the move to `editor.tf/editor.api`. A workaround is to extend your editor with `LegacyEditorMethods`.

**Why?** Having all methods at the top-level (next to `children`, `marks`, etc.) would clutter the editor interface. Slate splits transforms in three places (`editor`, `Editor`, and `Transforms`), which is also confusing. We’ve reorganized them into `tf` and `api` for better DX, but also to support transform-only middlewares in the future. This also lets us leverage `extendEditorTransforms` and `extendEditorApi` to override those methods.

Types:

- Rename `TRenderElementProps` to `RenderElementProps`
- Rename `TRenderLeafProps` to `RenderLeafProps`
- Rename `TEditableProps` to `EditableProps`
