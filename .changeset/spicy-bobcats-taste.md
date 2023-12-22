---
'@udecode/plate-core': major
---

- Upgrade to `jotai-x@1.1.0`
- Add `useEditorSelector` hook to only re-render when a specific property of `editor` changes
- Remove `{ fn: ... }` workaround for jotai stores that contain functions
- Breaking change: `usePlateSelectors`, `usePlateActions` and `usePlateStates` no longer accept generic type arguments. If custom types are required, cast the resulting values at the point of use, or use hooks like `useEditorRef` that still provide generics.
