---
'@udecode/plate-core': major
---

- Plugin `normalizeInitialValue` now returns `void` instead of `Value`. Mutating the nodes should keep node references (e.g. use `Object.assign` instead of spread).
- **Editor methods have been moved** to `editor.tf` and `editor.api`. They still exist at the top-level for **slate backward compatibility** but we won't redundantly type them. If you really need to keep the top-level method types, extend your editor type with `LegacyEditorMethods`. Since those methods can be overridden by `extendEditor`, `with...` slate plugins, you should migrate to the following:
- `extendEditorTransforms` and `extendEditorApi` can now override core transform and api methods with inferred types. For example:

```tsx
DeletePlugin.extendEditorTransforms(({ editor, tf: { deleteForward } }) => ({
  deleteForward(options) {
    // ...conditional override

    deleteForward(options);
  },
}));
```

Previously, it was done in `extendEditor` with the top-level methods, which still works but it will throw a type error since we're moving those in `editor.tf` and `editor.api`. A workaround is to extend your editor type with `LegacyEditorMethods`.

**Why?** Having hundreds of methods at the top-level of the editor, next to other states like `children`, `marks`, etc. does not feel right. `slate` has transforms in three different places: `editor`, `Editor` and `Transforms`, which is confusing. So we've decided to split the methods between `tf` and `api` to make it easier to find the right method, but also to support transform-only middlewares in the future. Finally, this allows us to leverage plugin `extendEditorTransforms` and `extendEditorApi` as shown above.
