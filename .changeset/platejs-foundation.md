---
'platejs': major
---

Consolidate the Plate foundation and shared utility contracts into `platejs` with one editor API and an exact `plitejs` runtime dependency during beta.

**Migration:** Replace `@platejs/core`, `@platejs/utils`, `@udecode/utils`, `@udecode/react-utils`, and `@udecode/react-hotkeys` imports with `platejs` or `platejs/react`. Import `useComposedRef` and `useIsomorphicLayoutEffect` from `platejs/react`; keep class-name merging in your app. Replace `createPlateEditor` with `createEditor`, `CreatePlateEditorOptions` with `CreateEditorOptions`, `usePlateEditor` with `useCreateEditor`, and mounted editor reads with `useEditor` or `useOptionalEditor`. `createEditor`, `useCreateEditor` and `CreateEditorOptions` take no value type argument, and every editor's document type is `Value`, so drop `<MyValue>`. Type a helper that takes the editor with your editor factory's return type, such as `ReturnType<typeof createAppEditor>`, or with `Editor` from `platejs/react` when it uses only core APIs. Read an exact node type through its plugin, such as `editor.read.nodes.get(path, { type: TablePlugin })`, and get one exact document type from `plate generate`.

Bind contextual commands to the selected editable mount, including named roots and views of one document. Use `EditorProvider` to scope controls to an existing editor, and retain that editor while a toolbar interaction is open.
