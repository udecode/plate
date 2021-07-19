---
"@udecode/plate-core": major
---

changes:
- renamed:
  - `useTSlate` to `useEditorState`
  - `useTSlateStatic` to `useEditorRef`
  - `useStoreEditor` to `useStoreEditorRef`
- removed:
  - `useEditorId` in favor of `useEditorRef().id`
  - `useEditorOptions` in favor of `useEditorRef().options`
  - `usePlatePluginOptions` in favor of `getPlatePluginOptions(useEditorRef(), pluginKey)`
  - `usePlatePluginType` in favor of `getPlatePluginType(useEditorRef(), pluginKey)`
  - `pipeOnDOMBeforeInput` in favor of `pipeHandler`
  - `pipeOnKeyDown` in favor of `pipeHandler`
- types:
  - renamed:
    - `PlateState` to `PlateStates`
    - `State` to `PlateState`
  - removed:
    - `OnDOMBeforeInput` in favor of `DOMHandler<'onDOMBeforeInput'>`
    - `OnKeyDown` in favor of `KeyboardHandler`
