---
'plitejs': minor
---

Replace the `shouldUpdate` callback option and internal options (`runtimeEventSource`, `profileId`, `includeRootOrderChanges`, `nodeKey`, `nodeKeys`) on public React selector hooks (`useEditorSelector`, `useEditorState`, `useEditorRuntimeState`, `useRuntimeState`, `useRootState`) with declarative `dependsOn`.

- Export `EditorSelectorDependency` and `EditorSelectorDependencies` from `plitejs/react`. Pass commit change kinds (such as `'selection'`, `'document'`, or `['properties', 'structure']`), `defineStateField` descriptors, or `{ nodeKey, kind? }` / `{ nodeKeys, kind? }` objects to `dependsOn`.
- Remove `shouldUpdate` and `runtimeEventSource` from public selector option types, and drop the unused second `TEditor` type parameter on `EditorRuntimeStateSelectorOptions<T = unknown>` (callers passing two type arguments drop the second one); internal mounted-render subscriptions stay private inside `plitejs/react`.
- Keep `useNodeSelector` and `useTextSelector` from accepting internal render-skip policies through forwarded option objects, and remove `useRootState`'s unconditional root prefilter so record-only writes and version reads stay fresh.
