---

"@udecode/slate-plugins-core": major
------------------------------------

changes:
- renamed:
  - `useTSlate` to `useEditorState`
  - `useTSlateStatic` to `useEditorRef`
  - `useStoreEditor` to `useStoreEditorRef`
- removed:
  - `useEditorId` in favor of `useEditorRef().id`
  - `useEditorOptions` in favor of `useEditorRef().options`
  - `useSlatePluginOptions` in favor of `getSlatePluginOptions(useEditorRef(), pluginKey)`
  - `useSlatePluginType` in favor of `getSlatePluginType(useEditorRef(), pluginKey)`
  - `pipeOnDOMBeforeInput` in favor of `pipeHandler`
  - `pipeOnKeyDown` in favor of `pipeHandler`
- types:
  - renamed:
    - `SlatePluginsState` to `SlatePluginsStates`
    - `State` to `SlatePluginsState`
  - removed:
    - `OnDOMBeforeInput` in favor of
    - `OnKeyDown` in favor of `KeyboardHandler`
