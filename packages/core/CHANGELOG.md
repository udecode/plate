# @udecode/plate-core

## 4.3.7

### Patch Changes

- [#1089](https://github.com/udecode/plate/pull/1089) [`58f6fb53`](https://github.com/udecode/plate/commit/58f6fb53bf45a2e0509f4aca617aa21356952fca) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: performance issue when passing `value` prop to `Plate`

## 4.3.0

### Minor Changes

- [#1063](https://github.com/udecode/plate/pull/1063) [`6af469cd`](https://github.com/udecode/plate/commit/6af469cd5ac310e831eb8a99a71eba73bde62fc6) Thanks [@ghingis](https://github.com/ghingis)! - add `normalizeInitialValue` prop to `Plate`. When `true`, it will normalize the initial value passed to the `editor` once it's created. This is useful when adding normalization rules on already existing content. Default is `false`.

## 3.4.0

### Minor Changes

- [#1022](https://github.com/udecode/plate/pull/1022) [`35caf35d`](https://github.com/udecode/plate/commit/35caf35d48fff851518648ff66e64a4268dcc97c) Thanks [@zbeyens](https://github.com/zbeyens)! - `overrideProps`: new plate option used by `getRenderElement` and `getRenderLeaf`
  - If it's a function, its return value will override the component props.
  - If it's an object, it will override the component props.

## 3.2.0

### Minor Changes

- [#995](https://github.com/udecode/plate/pull/995) [`58387c6d`](https://github.com/udecode/plate/commit/58387c6d34e86be7880999b40a9105b6178f4ce4) Thanks [@dylans](https://github.com/dylans)! - update slate dependencies and peerDependencies to 0.66.\*

## 1.0.0

### Major Changes

🎉 The **Slate Plugins** project has evolved to **Plate** 🎉

To migrate, find and replace all occurrences of:

- `slate-plugins` to `plate`
- `SlatePlugins` to `Plate`
- `SlatePlugin` to `PlatePlugin`

## 1.0.0-next.61

> This is the last version of `@udecode/slate-plugins[-x]`, please install
> `@udecode/plate[-x]`.

### Minor Changes

- [#869](https://github.com/udecode/slate-plugins/pull/869) [`7c26cf32`](https://github.com/udecode/slate-plugins/commit/7c26cf32e8b501d531c6d823ab55bf361e228bc3) Thanks [@zbeyens](https://github.com/zbeyens)! - - New plugin option `deserialize.getFragment`: Function called on `editor.insertData` to filter the fragment to insert.
  - New plugin option `deserialize.preInsert`: Function called on `editor.insertData` just before `editor.insertFragment`. Default: if the block above the selection is empty and the first fragment node type is not inline, set the selected node type to the first fragment node type. If returns true, the next handlers will be skipped.

## 1.0.0-next.56

### Patch Changes

- [#855](https://github.com/udecode/slate-plugins/pull/855) [`75b39f18`](https://github.com/udecode/slate-plugins/commit/75b39f18901d38f80847573cd3431ece1d1d4b3d) Thanks [@zbeyens](https://github.com/zbeyens)! - Sometimes we want to preventDefault without stopping the handler pipeline, so we remove this check.
  In summary, to stop the pipeline, a handler has to return `true` or run `event.stopPropagation()`

## 1.0.0-next.55

### Major Changes

- [#853](https://github.com/udecode/slate-plugins/pull/853) [`abaf4a11`](https://github.com/udecode/slate-plugins/commit/abaf4a11d3b69157983b6cf77b023a6008478a79) Thanks [@zbeyens](https://github.com/zbeyens)! - Before, the handlers had to return `false` to prevent the next handlers to be called.
  Now, we reuse `isEventHandled` internally used by `slate@0.65.0` which has the opposite behavior: a handler has to return `true` to stop the pipeline.
  Additionally, the pipeline stops if at any moment `event.isDefaultPrevented()` or `event.isPropagationStopped()` returns `true`, except if the handler returns `false`.
  See the updated docs in "Creating Plugins".

## 1.0.0-next.53

### Patch Changes

- [#840](https://github.com/udecode/slate-plugins/pull/840) [`42360b44`](https://github.com/udecode/slate-plugins/commit/42360b444d6a2959847d5619eda32319e360e3af) Thanks [@zbeyens](https://github.com/zbeyens)! - fix:
  - Plugin handlers are now run when a handler is passed to `editableProps`
  - If one handler returns `true`, slate internal corresponding handler is not called anymore

## 1.0.0-next.40

### Patch Changes

- [#773](https://github.com/udecode/slate-plugins/pull/773) [`15048e6f`](https://github.com/udecode/slate-plugins/commit/15048e6facbefc5fe21b0b9bd9a586f269cada89) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: before, store setValue was called at the start of `onChange` pipeline. Now, it's called at the end of the pipeline so we can make use of this value as the "previous value" in plugins `onChange`.

## 1.0.0-next.39

### Patch Changes

- [#756](https://github.com/udecode/slate-plugins/pull/756) [`b444071e`](https://github.com/udecode/slate-plugins/commit/b444071e2673803dba05c770c5dfbbde14f7a631) Thanks [@zbeyens](https://github.com/zbeyens)! - fix: `TNode`, `TElement`, `TLeaf` types extended

## 1.0.0-next.36

### Minor Changes

- [#723](https://github.com/udecode/slate-plugins/pull/723) [`806e1632`](https://github.com/udecode/slate-plugins/commit/806e16322e655802822079d8540a6983a9dfb06e) Thanks [@Aedron](https://github.com/Aedron)! - feat: new `SlatePlugins` option - `renderEditable`: Custom `Editable` node

## 1.0.0-next.30

### Patch Changes

- [#697](https://github.com/udecode/slate-plugins/pull/697) [`33605a49`](https://github.com/udecode/slate-plugins/commit/33605a495ccc3fd9b4f6cfdaf2eb0e6e59bd7a67) Thanks [@zbeyens](https://github.com/zbeyens)! - add back onDOMBeforeInput

- [#678](https://github.com/udecode/slate-plugins/pull/678) [`75e6d25d`](https://github.com/udecode/slate-plugins/commit/75e6d25de0f9cf2487adecff54c2993ebc795aa0) Thanks [@horacioh](https://github.com/horacioh)! - fix: `getSlatePluginWithOverrides` options types

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
      - `OnDOMBeforeInput` in favor of `DOMHandler<'onDOMBeforeInput'>`
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
