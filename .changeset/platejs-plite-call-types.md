---
'platejs': patch
---

- Remove `EditableProps`, `LeafNodeProps`, `TextNodeProps`, `RenderElementFn`, `RenderLeafFn` and `RenderTextFn`. Use `EditorContentProps` for `EditorContent` props, and write a plugin's `leafAttributes` and `textAttributes` callbacks inline, where Plate infers their props.
- Type `context.editor` as Plate's `Editor` in every `EditorContent` handler that takes a context, such as `onKeyDown`, `onClick` and `onPaste`, and in the handler types, such as `EditableKeyDownHandler`. `scrollSelectionIntoView` gets Plate's `Editor` too. Export `EditablePointerSelectionEndHandler` from `platejs/react`.
- Accept a plugin in `PluginPortal` and `BasePluginPortal`, as in `PluginPortal<typeof MyPlugin>`, distribute over unions of plugins, and keep an erased `PluginReference` portal's `schema` optional and kind-dependent.
- Export `EditorReference`, type `useRootEditor` to return Plate's `Editor`, and refuse at compile time an `EditorRoot` `editor` typed as a non-editor value or a raw Plite editor or view. A generic component that passes its editor to `EditorRoot` constrains it, as in `<E extends EditorReference>`.
- Remove `name` from `PluginDefinitionInput` and `BasePluginDefinitionInput`.
- Refuse at compile time a `definePlugin` `schema` key other than `contentRoots`, `element`, `mark` and `properties`, including explicit unions containing Plite-only keys.
