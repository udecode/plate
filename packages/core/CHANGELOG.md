# @udecode/slate-plugins-core

## 1.0.0-next.29

### Major Changes

- [#687](https://github.com/udecode/slate-plugins/pull/687) [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3) Thanks [@zbeyens](https://github.com/zbeyens)! - changes:
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

### Minor Changes

- [#687](https://github.com/udecode/slate-plugins/pull/687) [`dfbde8bd`](https://github.com/udecode/slate-plugins/commit/dfbde8bd856e1e646e3d8fe2cbf1df8f9b8c67c3) Thanks [@zbeyens](https://github.com/zbeyens)! - changes:
  - `useEditableProps` (used by `SlatePlugins`):
    - new fields returned: all handler props from the plugins (if defined)
    - new core plugins with the following fields:
      - `onFocus: setEventEditorId('focus', id)`
      - `onBlur: setEventEditorId('blur', id)`
      - You can add your own handlers in a plugin
  - `EditorStateEffect`: a new component used by `SlatePlugins` to update the editor state.
  - `setEventEditorId`: a new action. Set an editor id by event key.
  - `eventEditorStore`, `useEventEditorStore`: a new store. Store where the keys are event names and the values are editor ids.
  - `useEventEditorId`: a new selector. Get the editor id by `event` key.
  - `useStoreEditorSelection`: a new selector. Get the editor selection which is updated on editor change.
  - `useStoreEditorState`: a new selector. Get editor state which is updated on editor change. Similar to `useSlate`.
  - `SlatePlugin`: the previous plugin could implement the following handlers: `onChange`, `onDOMBeforeInput` and `onKeyDown`. The plugins now implement all DOM handlers: clipboard, composition, focus, form, image, keyboard, media, mouse, selection, touch, pointer, ui, wheel animation and transition events.
  - `SlatePluginsState` (store interface):
    - a new field `keyChange` incremented by `SlatePlugins` on `useSlate` update.
    - a new field `selection = editor.selection` updated on `useSlate` update.
  - `pipeHandler`: a new function. Generic pipe for handlers.

## 1.0.0-next.26

### Patch Changes

- [#658](https://github.com/udecode/slate-plugins/pull/658) [`201a7993`](https://github.com/udecode/slate-plugins/commit/201a799342ff88405e120182d8554e70b726beea) Thanks [@zbeyens](https://github.com/zbeyens)! - test
