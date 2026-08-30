---
'platejs': major
---

Consolidate the Plate foundation and shared utility contracts into `platejs` with one editor API and an exact `plitejs` runtime dependency during beta.

**Migration:** Replace `@platejs/core`, `@platejs/utils`, `@udecode/utils`, `@udecode/react-utils`, and `@udecode/react-hotkeys` imports with `platejs` or `platejs/react`. Import `useComposedRef` and `useIsomorphicLayoutEffect` from `platejs/react`; keep class-name merging in your app. Replace `createPlateEditor` with `createEditor`, `usePlateEditor` with `useCreateEditor`, and mounted editor reads with `useEditor` or `useOptionalEditor`.
