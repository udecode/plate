# @udecode/plate-core

## 37.0.8

### Patch Changes

- [#3512](https://github.com/udecode/plate/pull/3512) by [@zbeyens](https://github.com/zbeyens) –
  - Add `editor.tf.setValue` to replace the editor value
  - Fix: move `editor.api.reset` to `editor.tf.reset`

## 37.0.7

### Patch Changes

- [`e9f1bbaeaf6e4c38372f7dd8427c20e1d8eec6e6`](https://github.com/udecode/plate/commit/e9f1bbaeaf6e4c38372f7dd8427c20e1d8eec6e6) by [@zbeyens](https://github.com/zbeyens) – Add `id?: string` in `useEditorPlugin` params

## 37.0.5

### Patch Changes

- [`fd8ba6260022cfdc3ac370ad9e49cbeb2896fb71`](https://github.com/udecode/plate/commit/fd8ba6260022cfdc3ac370ad9e49cbeb2896fb71) by [@zbeyens](https://github.com/zbeyens) – Add id?: string in useEditorPlugin param

## 37.0.4

### Patch Changes

- [#3495](https://github.com/udecode/plate/pull/3495) by [@zbeyens](https://github.com/zbeyens) – Add string value support for `createSlateEditor`, `createPlateEditor`, `usePlateEditor`

## 37.0.3

### Patch Changes

- [#3493](https://github.com/udecode/plate/pull/3493) by [@zbeyens](https://github.com/zbeyens) – Fix plugin.node.component should work like plugin.render.node

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) – **Plugin System**:

  Decoupling React in all packages:

  - Split build into `@udecode/plate-core` and `@udecode/plate-core/react`
  - NEW `SlatePlugin` as the foundation for all plugins
  - `PlatePlugin` extends `SlatePlugin` with React-specific plugin features

  **Plugin Creation**:

  - Remove `createPluginFactory`
  - NEW `createSlatePlugin`: vanilla
  - NEW `createTSlatePlugin`: vanilla explicitly typed
  - NEW `createPlatePlugin`: React
  - NEW `createTPlatePlugin`: React explicitly typed
  - NEW `toPlatePlugin`: extend a vanilla plugin into a React plugin
  - NEW `toTPlatePlugin`: extend a vanilla plugin into a React plugin explicitly typed
  - Rename all plugins starting with `createNamePlugin()` to `NamePlugin`

  Before:

  ```typescript
  const MyPluginFactory = createPluginFactory({
    key: 'myPlugin',
    isElement: true,
    component: MyComponent,
  });
  const plugin = MyPluginFactory();
  ```

  After:

  ```typescript
  const plugin = createSlatePlugin({
    key: 'myPlugin',
    node: {
      isElement: true,
      component: MyComponent,
    },
  });
  const reactPlugin = toPlatePlugin(plugin);
  ```

  **Plugin Configuration**:

  - Remove all `NamePlugin` option types, use `NameConfig` instead.
  - `NameConfig` as the new naming convention for plugin configurations.

  Before:

  ```typescript
  createPluginFactory<HotkeyPlugin>({
    handlers: {
      onKeyDown: onKeyDownToggleElement,
    },
    options: {
      hotkey: ['mod+opt+0', 'mod+shift+0'],
    },
  });
  ```

  After:

  ```typescript
  export const ParagraphPlugin = createPlatePlugin({
    key: 'p',
    node: { isElement: true },
  }).extend({ editor, type }) => ({
    shortcuts: {
      toggleParagraph: {
        handler: () => {
          editor.tf.toggle.block({ type });
        },
        keys: [
          [Key.Mod, Key.Alt, '0'],
          [Key.Mod, Key.Shift, '0'],
        ],
        preventDefault: true,
      },
    },
  })
  ```

  - `toggleParagraph` is now a shortcut for `editor.tf.toggle.block({ type: 'p' })` for the given keys
  - Multiple shortcuts can be defined per plugin, and any shortcut can be disabled by setting `shortcuts.toggleParagraph = null`
  - Note the typing support using `Key`

  **Plugin Properties**:

  Rename `SlatePlugin` / `PlatePlugin` properties:

  - `type` -> `node.type`
  - `isElement` -> `node.isElement`
  - `isLeaf` -> `node.isLeaf`
  - `isInline` -> `node.isInline`
  - `isMarkableVoid` -> `node.isMarkableVoid`
  - `isVoid` -> `node.isVoid`
  - `component` -> `node.component` or `render.node`
  - `props` -> `node.props`
  - `overrideByKey` -> `override.plugins`
  - `renderAboveEditable` -> `render.aboveEditable`
  - `renderAboveSlate` -> `render.aboveSlate`
  - `renderAfterEditable` -> `render.afterEditable`
  - `renderBeforeEditable` -> `render.beforeEditable`
  - `inject.props` -> `inject.nodeProps`
  - `inject.props.validTypes` -> `inject.targetPlugins`
  - `inject.aboveComponent` -> `render.aboveNodes`
  - `inject.belowComponent` -> `render.belowNodes`
  - `inject.pluginsByKey` -> `inject.plugins`
  - `editor.insertData` -> `parser`
    - NEW `parser.format` now supports `string[]`
    - NEW `parser.mimeTypes: string[]`
  - `deserializeHtml` -> `parsers.html.deserializer`
  - `deserializeHtml.getNode` -> `parsers.html.deserializer.parse`
  - `serializeHtml` -> `parsers.htmlReact.serializer`
  - `withOverride` -> `extendEditor`
  - All methods now have a single parameter: `SlatePluginContext<C>` or `PlatePluginContext<C>`, in addition to the method specific options. Some of the affected methods are:
    - `decorate`
    - `handlers`, including `onChange`. Returns `({ event, ...ctx }) => void` instead of `(editor, plugin) => (event) => void`
    - `handlers.onChange`: `({ value, ...ctx }) => void` instead of `(editor, plugin) => (value) => void`
    - `normalizeInitialValue`
    - `editor.insertData.preInsert`
    - `editor.insertData.transformData`
    - `editor.insertData.transformFragment`
    - `deserializeHtml.getNode`
    - `deserializeHtml.query`
    - `inject.props.query`
    - `inject.props.transformProps`
    - `useHooks`
    - `withOverrides`

  NEW `SlatePlugin` properties:

  - `api`: API methods provided by this plugin
  - `dependencies`: An array of plugin keys that this plugin depends on
  - `node`: Node-specific configuration for this plugin
  - `parsers`: Now accept `string` keys to add custom parsers
  - `priority`: Plugin priority for registration and execution order
  - `shortcuts`: Plugin-specific hotkeys
  - `inject.targetPluginToInject`: Function to inject plugin config into other plugins specified by `inject.targetPlugins`

  Before:

  ```typescript
  export const createAlignPlugin = createPluginFactory({
    key: KEY_ALIGN,
    inject: {
      props: {
        defaultNodeValue: 'start',
        nodeKey: KEY_ALIGN,
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
        validTypes: ['p'],
      },
    },
    then: (_, plugin) =>
      mapInjectPropsToPlugin(editor, plugin, {
        deserializeHtml: {
          getNode: (el, node) => {
            if (el.style.textAlign) {
              node[plugin.key] = el.style.textAlign;
            }
          },
        },
      }),
  });
  ```

  After:

  ```typescript
  export const AlignPlugin = createSlatePlugin({
    inject: {
      nodeProps: {
        defaultNodeValue: 'start',
        nodeKey: 'align',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      },
      targetPluginToInject: ({ editor, plugin }) => ({
        parsers: {
          html: {
            deserializer: {
              parse: ({ element, node }) => {
                if (element.style.textAlign) {
                  node[editor.getType(plugin)] = element.style.textAlign;
                }
              },
            },
          },
        },
      }),
      targetPlugins: [ParagraphPlugin.key],
    },
    key: 'align',
  });
  ```

  **Plugin Shortcuts**:

  - NEW `shortcuts` to add custom hotkeys to a plugin.
  - Remove `hotkey` option from all plugins

  Before:

  ```typescript
  type LinkPlugin = {
    hotkey?: string;
  };
  ```

  After:

  ```typescript
  type LinkConfig = PluginConfig<
    // key
    'p',
    // options
    { defaultLinkAttributes?: any },
    // api
    { link: { getAttributes: (editor: PlateEditor) => LinkAttributes } },
    // transforms
    { floatingLink: { hide: () => void } }
  >;
  ```

  Shortcuts API:

  - `handler` is called with the editor, event, and event details.
  - `keys` is an array of keys to trigger the shortcut.
  - `priority` is the priority of the shortcut over other shortcuts.
  - `...HotkeysOptions` from `@udecode/react-hotkeys`

  **Plugin Types**:

  - Update `SlatePlugin`, `PlatePlugin` generics. `P, V, E` -> `C extends AnyPluginConfig = PluginConfig`
  - Remove `PluginOptions`
  - Remove `PlatePluginKey`
  - Remove `HotkeyPlugin`, `ToggleMarkPlugin` in favor of `plugin.shortcuts`
  - `WithPlatePlugin` -> `EditorPlugin`, `EditorPlatePlugin`
  - `PlatePluginComponent` -> `NodeComponent`
  - `InjectComponent*` -> `NodeWrapperComponent*`
  - `PlatePluginInsertData` -> `Parser`
  - `PlatePluginProps` -> `NodeProps`
  - `RenderAfterEditable` -> `EditableSiblingComponent`
  - `WithOverride` -> `ExtendEditor`
  - `SerializeHtml` -> `HtmlReactSerializer`

  **Plugin Store**:

  - NEW each plugin has its own store, accessible via `plugin.optionsStore` and `plugin.useOptionsStore`
  - `editor` has many methods to get, set and subscribe to plugin options

  **Plugin Methods**:

  - All plugin methods return a new plugin instance with the extended types.
  - Remove `then`, use `extend` instead
  - NEW `extend` method to deep merge a plugin configuration
    - If you pass an object, it will be directly merged with the plugin config.
    - If you pass a function, it will be called with the plugin config once the editor is resolved and should return the new plugin config.
    - Object extensions always have the priority over function extensions.
    - Extend multiple times to derive from the result of the previous extension.
  - NEW `configure` method to configure the properties of existing plugins. The difference with `extend` is that `configure` with not add new properties to the plugin, it will only modify existing ones.
  - NEW `extendPlugin` method to extend a nested plugin configuration.
  - NEW `configurePlugin` method to configure the properties of a nested plugin.
  - NEW `extendApi` method to extend the plugin API. The API is then merged into `editor.api[plugin.key]`.
  - NEW `extendTransforms` method to extend the plugin transforms. The transforms is then merged into `editor.transforms[plugin.key]`.
  - NEW `extendEditorApi` method to extend the editor API. The API is then merged into `editor.api`. Use this to add or override top-level methods to the editor.
  - NEW `extendEditorTransforms` method to extend the editor transforms. The transforms is then merged into `editor.transforms`.
  - NEW `extendOptions` method to extend the plugin options with selectors. Use `editor.useOption(plugin, 'optionKey')` to subscribe to an (extended) option.
  - NEW `withComponent` to replace `plugin.node.component`

  **Plugin Context**

  Each plugin method now receive the plugin context created with `getEditorPlugin(editor, plugin)` as parameter:

  - `api`
  - `editor`
  - `getOption`
  - `getOptions`
  - `plugin`
  - `setOption`
  - `setOptions`
  - `tf`
  - `type`
  - `useOption`

  **Core Plugins**:

  - NEW `ParagraphPlugin` is now part of `core`
  - NEW `DebugPlugin` is now part of `core`
    - NEW `api.debug.log`, `api.debug.info`, `api.debug.warn`, `api.debug.error` methods
    - `options.isProduction` to control logging in production environments
    - `options.logLevel` to set the minimum log level
    - `options.logger` to customize logging behavior
    - `options.throwErrors` to control error throwing behavior, by default a `PlateError` will be thrown on `api.debug.error`
  - NEW - You can now override a core plugin by adding it to `editor.plugins`. Last plugin wins.
  - `createDeserializeHtmlPlugin` -> `HtmlPlugin`
    - NEW `api.html.deserialize`
  - `createEventEditorPlugin` -> `EventEditorPlugin`
    - `eventEditorStore` -> `EventEditorStore`
  - `createDeserializeAstPlugin` -> `AstPlugin`
  - `createEditorProtocolPlugin` -> `SlateNextPlugin`
    - NEW `editor.tf.toggle.block`
    - NEW `editor.tf.toggle.mark`
    - Remove `createNodeFactoryPlugin`, included in `SlateNextPlugin`.
    - Remove `createPrevSelectionPlugin`, included in `SlateNextPlugin`.
  - `createHistoryPlugin` -> `HistoryPlugin`
  - `createInlineVoidPlugin` -> `InlineVoidPlugin`
  - `createInsertDataPlugin` -> `ParserPlugin`
  - `createLengthPlugin` -> `LengthPlugin`
  - `createReactPlugin` -> `ReactPlugin`

  **Editor Creation**:

  NEW `withSlate`:

  - Extends an editor into a vanilla Plate editor
  - NEW `rootPlugin` option for configuring the root plugin

  NEW `withPlate`:

  - Extends an editor into a React Plate editor
  - Now extends `withSlate` with React-specific enhancements
  - NEW `useOptions` and `useOption` methods to the editor

  NEW `createSlateEditor`:

  - Create a vanilla Plate editor with server-side support

  `createPlateEditor`:

  - Plugin replacement mechanism: using `plugins`, any plugin with the same key that a previous plugin will **replace** it. That means you can now override core plugins that way, like `ReactPlugin`
  - `root` plugin is now created from `createPlateEditor` option as a quicker way to configure the editor than passing `plugins`. Since plugins can have nested plugins (think as a recursive tree), `plugins` option will be passed to `root` plugin `plugins` option.
  - Centralized editor resolution. Before, both `createPlateEditor` and `Plate` component were resolving the editor. Now, only `createPlateEditor` takes care of that. That means `id`, `value`, and other options are now controlled by `createPlateEditor`.
  - Remove `createPlugins`, pass plugins directly:

    - `components` -> `override.components`
    - `overrideByKey` -> `override.plugins`

  `createPlateEditor` options:

  - Rename `normalizeInitialValue` option to `shouldNormalizeEditor`
  - Move `components` to `override.components` to override components by key
  - Move `overrideByKey` to `override.plugins` to override plugins by key
  - Remove `disableCorePlugins`, use `override.enabled` instead
  - NEW `value` to set the initial value of the editor.
  - NEW `autoSelect?: 'end' | 'start' | boolean` to auto select the start of end of the editor. This is decoupled from `autoFocus`.
  - NEW `selection` to control the initial selection.
  - NEW `override.enabled` to disable plugins by key
  - NEW `rootPlugin?: (plugin: AnyPlatePlugin) => AnyPlatePlugin` to configure the root plugin. From here, you can for example call `configurePlugin` to configure any plugin.
  - NEW `api`, `decorate`, `extendEditor`, `handlers`, `inject`, `normalizeInitialValue`, `options`, `override`, `priority`, `render`, `shortcuts`, `transforms`, `useHooks`. These options will be passed to the very first `rootPlugin`.

  NEW `usePlateEditor()` hook to create a `PlateEditor` in a React component:

  - Uses `createPlateEditor` and `useMemo` to avoid re-creating the editor on every render.
  - Dependencies can be added to the hook to re-create the editor on demand. `id` option is always used as dependency.

  **Editor Methods**:

  `editor: PlateEditor`:

  - Move `redecorate` to `editor.api.redecorate`
  - Move `reset` to `editor.tf.reset`
  - Move `plate.set` to `editor.setPlateState`
  - Move `blockFactory` to `editor.api.create.block`
  - Move `childrenFactory` to `editor.api.create.value`
  - Rename `plugins` to `pluginList`
  - Rename `pluginsByKey` to `plugins`
  - NEW `getApi()` to get the editor API
  - NEW `getTransforms()` to get the editor transforms
  - Remove `getPlugin(editor, key)`, use `editor.getPlugin(plugin) or editor.getPlugin({ key })`
  - Remove `getPluginType`, use `editor.getType(plugin)` to get node type
  - Remove `getPluginInjectProps(editor, key)`, use `editor.getPlugin(plugin).inject.props`
  - NEW `getOptionsStore()` to get a plugin options store
  - Remove `getPluginOptions`, use `getOptions()`
  - NEW `getOption()` to get a plugin option
  - NEW `setOption()` to set a plugin option
  - NEW `setOptions()` to set multiple plugin options. Pass a function to use Immer. Pass an object to merge the options.
  - NEW `useOption` to subscribe to a plugin option in a React component
  - NEW `useOptions` to subscribe to a plugin options store in a React component
  - Remove `getPlugins`, use `editor.pluginList`
  - Remove `getPluginsByKey`, use `editor.plugins`
  - Remove `mapInjectPropsToPlugin`

  **Editor Types**:

  The new generic types are:

  - `V extends Value = Value`, `P extends AnyPluginConfig = PlateCorePlugin`
  - That means this function will **infer all plugin configurations** from the options passed to it:
    - `key`
    - `options`
    - `api`
    - `transforms`
  - Can't infer for some reason? Use `createTPlateEditor` for explicit typing.

  ```ts
  const editor = createPlateEditor({ plugins: [TablePlugin] });
  editor.api.htmlReact.serialize(); // core plugin is automatically inferred
  editor.tf.insert.tableRow(); // table plugin is automatically inferred
  ```

  **Plate Component**

  `PlateProps`:

  - `editor` is now required. If `null`, `Plate` will not render anything. As before, `Plate` remounts on `id` change.
  - Remove `id`, `plugins`, `maxLength`, pass these to `createPlateEditor` instead
  - Remove `initialValue`, `value`, pass `value` to `createPlateEditor` instead
  - Remove `editorRef`
  - Remove `disableCorePlugins`, override `plugins` in `createPlateEditor` instead

  Utils:

  - Remove `useReplaceEditor` since `editor` is now always controlled
  - NEW `useEditorPlugin` to get the editor and the plugin context.

  Types:

  - `PlateRenderElementProps`, `PlateRenderLeafProps` generics: `V, N` -> `N, C`

  **Plate Store**:

  - Remove `plugins` and `rawPlugins`, use `useEditorRef().plugins` instead, or listen to plugin changes with `editor.useOption(plugin, <optionKey>)`
  - Remove `value`, use `useEditorValue()` instead
  - Remove `editorRef`, use `useEditorRef()` instead

  **Miscellaneous Changes**

  - `slate >=0.103.0` peer dependency
  - `slate-react >=0.108.0` peer dependency
  - New dependency `@udecode/react-hotkeys`
  - Remove `ELEMENT_`, `MARK_` and `KEY_` constants. Use `NamePlugin.key` instead.
  - Replace `ELEMENT_DEFAULT` with `ParagraphPlugin.key`.
  - Remove `getTEditor`
  - Rename `withTReact` to `withPlateReact`
  - Rename `withTHistory` to `withPlateHistory`
  - Rename `usePlateId` to `useEditorId`
  - Remove `usePlateSelectors().id()`, `usePlateSelectors().value()`, `usePlateSelectors().plugins()`, use instead `useEditorRef().<key>`
  - Rename `toggleNodeType` to `toggleBlock`
  - `toggleBlock` options:
    - Rename `activeType` to `type`
    - Rename `inactiveType` to `defaultType`
  - Remove `react-hotkeys-hook` re-exports. Use `@udecode/react-hotkeys` instead.

  Types:

  - Move `TEditableProps`, `TRenderElementProps` to `@udecode/slate-react`
  - Remove `<V extends Value>` generic in all functions where not used
  - Remove `PlatePluginKey`
  - Remove `OverrideByKey`
  - Remove `PlateId`

## 36.3.9

## 36.3.7

### Patch Changes

- [#3418](https://github.com/udecode/plate/pull/3418) by [@beeant0512](https://github.com/beeant0512) – fix cannot copy a row/column format from table

## 36.3.4

## 36.2.1

### Patch Changes

- [`b74fc734be04266af0e147b7f7e78cc39ccbc98e`](https://github.com/udecode/plate/commit/b74fc734be04266af0e147b7f7e78cc39ccbc98e) by [@zbeyens](https://github.com/zbeyens) – Fix rsc: remove useFocusEditorEvents from server bundle

## 36.0.6

## 36.0.3

### Patch Changes

- [#3346](https://github.com/udecode/plate/pull/3346) by [@yf-yang](https://github.com/yf-yang) – feat: expose onValueChange and onSelectionChange from Slate component, following https://github.com/ianstormtaylor/slate/pull/5526

## 34.0.4

## 34.0.1

### Patch Changes

- [#3220](https://github.com/udecode/plate/pull/3220) by [@dimaanj](https://github.com/dimaanj) – [event-editor] expose focus event callbacks

## 34.0.0

### Patch Changes

- [#3241](https://github.com/udecode/plate/pull/3241) by [@felixfeng33](https://github.com/felixfeng33) – Fix: `toggleNodeType` not working using `at`.

## 33.0.3

### Patch Changes

- [#3194](https://github.com/udecode/plate/pull/3194) by [@KorovinQuantori](https://github.com/KorovinQuantori) – Export plugin keys for easier access plugin options by key

## 33.0.0

### Minor Changes

- [#3125](https://github.com/udecode/plate/pull/3125) by [@zbeyens](https://github.com/zbeyens) –
  - Use `editor.reset` instead of `resetEditor` to focus the editor after reset so it's decoupled from `slate-react`.
  - Add a server bundle including `createPlateEditor`. It can be imported using `import { createPlateEditor } from '@udecode/plate-core/server'`.

## 32.0.1

## 32.0.0

### Patch Changes

- [#3155](https://github.com/udecode/plate/pull/3155) by [@felixfeng33](https://github.com/felixfeng33) – Export `KeyboardEventHandler` type

## 31.3.2

## 31.0.0

### Minor Changes

- [#3040](https://github.com/udecode/plate/pull/3040) by [@zbeyens](https://github.com/zbeyens) – Updated minor dependencies

## 30.4.5

### Patch Changes

- [#2948](https://github.com/udecode/plate/pull/2948) by [@zbeyens](https://github.com/zbeyens) – Fix SSR imports in `jotai-x`

## 30.1.2

### Patch Changes

- [#2881](https://github.com/udecode/plate/pull/2881) by [@johnrazeur](https://github.com/johnrazeur) – fix plate store id when plate use the editor prop.

## 30.0.0

### Minor Changes

- [#2867](https://github.com/udecode/plate/pull/2867) by [@12joan](https://github.com/12joan) – Export `atom` from `jotai`

- [#2859](https://github.com/udecode/plate/pull/2859) by [@12joan](https://github.com/12joan) –
  - Introduce `PlateController` as a way of accessing the active editor from an ancestor or sibling of `Plate` (see [Accessing the Editor](https://platejs.org/docs/accessing-editor#from-a-sibling-or-ancestor-of-plate)).
  - Add `primary` prop to `Plate` (default true)
  - Add `isFallback` to `editor` instance (default false)
  - The following hooks now throw a runtime error when used outside of either a `Plate` or `PlateController`, and accept a `debugHookName` option to customize this error message:
    - `useIncrementVersion`
    - `useRedecorate`
    - `useReplaceEditor`
    - `useEditorMounted` (new)
    - `useEditorReadOnly`
    - `useEditorRef`
    - `useEdtiorSelection`
    - `useEditorSelector`
    - `useEditorState`
    - `useEditorVersion`
    - `useSelectionVersion`
  - Change the default `id` of a `Plate` editor from `'plate'` to a random value generated with `nanoid/non-secure`

## 29.1.0

### Patch Changes

- [#2854](https://github.com/udecode/plate/pull/2854) by [@MarcosPereira1](https://github.com/MarcosPereira1) – Ensure that beforeinput event is handled as a React.SyntheticEvent rather than a native DOM event

## 29.0.1

## 29.0.0

## 28.0.0

### Major Changes

- [`822f6f56b`](https://github.com/udecode/plate/commit/822f6f56be526a6e26f904b9e767c0bc09f1e28b) by [@12joan](https://github.com/12joan) –
  - Upgrade to `jotai-x@1.1.0`
  - Add `useEditorSelector` hook to only re-render when a specific property of `editor` changes
  - Remove `{ fn: ... }` workaround for jotai stores that contain functions
  - Breaking change: `usePlateSelectors`, `usePlateActions` and `usePlateStates` no longer accept generic type arguments. If custom types are required, cast the resulting values at the point of use, or use hooks like `useEditorRef` that still provide generics.
  - Fix: `readOnly` on Plate store defaults to false and overrides `readOnly` on PlateContent
  - Fix: Plate ignores plugins passed via `editor`

## 27.0.3

### Patch Changes

- [#2814](https://github.com/udecode/plate/pull/2814) by [@12joan](https://github.com/12joan) –
  - Fix `renderBeforeEditable` and `renderAfterEditable`
    - Like `renderAboveEditable` and `renderAboveSlate`, the given component is now rendered using JSX syntax, separately from the parent component.

## 27.0.0

### Major Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store from `jotai@1` to `jotai@2`
    - New dependency: `jotai-x`. See https://github.com/udecode/jotai-x
    - Accessing a store without an explicit provider component is no longer supported. Attempting to do so will result in a warning in the console: `Tried to access jotai store '${storeName}' outside of a matching provider.`
  - Upgraded from `zustand@3` to `zustand@4`
    - See https://github.com/udecode/zustand-x
  - Rename `zustand-x` exports
    - `StateActions` -> `ZustandStateActions`
    - `StoreApi` -> `ZustandStoreApi`
    - `createStore` -> `createZustandStore`
    - Note that these exports are deprecated and should not be used in new code. They may be removed in a future version of Plate.
  - `renderAboveEditable` and `renderAboveSlate`
    - The given component is now rendered using JSX syntax, separately from the parent component. Previously, the component was called as a function, which affected how hooks were handled by React.
  - `withHOC`
    - Add support for `ref` prop, which is forwarded to the inner component
    - Add `hocRef` argument, which is forwarded to the `HOC`
    - Strengthen the type of `hocProps`

## 25.0.1

### Patch Changes

- [#2729](https://github.com/udecode/plate/pull/2729) by [@12joan](https://github.com/12joan) – **This is a breaking change meant to be part of v25, hence the patch.**
  On `deserializeHtml`, replace `stripWhitespace` with `collapseWhiteSpace`, defaulting to true. The `collapseWhiteSpace` option aims to parse white space in HTML according to the HTML specification, ensuring greater accuracy when pasting HTML from browsers.

## 25.0.0

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.0.2

### Patch Changes

- [#2639](https://github.com/udecode/plate/pull/2639) by [@zbeyens](https://github.com/zbeyens) – missing id in a hook call

## 24.0.1

### Patch Changes

- [#2635](https://github.com/udecode/plate/pull/2635) by [@zbeyens](https://github.com/zbeyens) –
  - Fix: set Plate `id` prop type to `string` to satisfy [HTML specs](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id).

## 24.0.0

### Major Changes

- [#2629](https://github.com/udecode/plate/pull/2629) by [@zbeyens](https://github.com/zbeyens) –

  - [**Breaking**] Rename `Plate` to `PlateContent`.
  - [**Breaking**] Rename `PlateProvider` to `Plate`.
  - [**Breaking**] Rendering `PlateContent` is now required in `Plate`. This allows you to choose where to render the editor next to other components like toolbar. Example:

  ```tsx
  // Before
  <Plate />
  // or
  <PlateProvider>
    <Plate />
  </PlateProvider>

  // After
  <Plate>
    <PlateContent />
  </Plate>
  ```

  - [**Breaking**] Remove provider props such as `plugins` from `PlateContent`. These props should be passed to `Plate`.
  - [**Breaking**] Remove `editableProps` prop from `PlateContent`. Move these as`PlateContent` props.
  - [**Breaking**] Remove `children` prop from `PlateContent`. Render instead these components after `PlateContent`.
  - [**Breaking**] Remove `firstChildren` prop from `PlateContent`. Render instead these components before `PlateContent`.
  - [**Breaking**] Remove `editableRef` prop from `PlateContent`. Use `ref` instead.
  - [**Breaking**] Remove `withPlateProvider`.
  - [**Breaking**] Rename `usePlateEditorRef` to `useEditorRef`.
  - [**Breaking**] Rename `usePlateEditorState` to `useEditorState`.
  - [**Breaking**] Rename `usePlateReadOnly` to `useEditorReadOnly`. This hook can be used below `Plate` while `useReadOnly` can only be used in node components.
  - [**Breaking**] Rename `usePlateSelection` to `useEditorSelection`.
  - [**Breaking**] Rename store attributes `keyDecorate`, `keyEditor` and `keySelection` to `versionDecorate`, `versionEditor` and `versionSelection`. These are now numbers incremented on each change.
  - [**Breaking**] Rename store attribute `isRendered` to `isMounted`.
  - Add `maxLength` prop to `Plate`. Specifies the maximum number of characters allowed in the editor. This is a new core plugin (`createLengthPlugin`).
  - Add `useEditorVersion` hook. Version incremented on each editor change.
  - Add `useSelectionVersion` hook. Version incremented on each selection change.
  - Fix `editor.reset` should now reset the editor without mutating the ref so it does not remount `PlateContent`. Default is using `resetEditor`. If you need to replace the editor ref, use `useReplaceEditor`.
  - [Type] Remove generic from `TEditableProps`, `RenderElementFn`, `RenderAfterEditable`

## 23.7.4

## 23.6.0

### Minor Changes

- [#2588](https://github.com/udecode/plate/pull/2588) by [@zbeyens](https://github.com/zbeyens) – `PlatePlugin`
  - `inject.props.query` (new): Whether to inject the props. If true, overrides all other checks.
  - `inject.props.transformProps` (new): Transform the injected props.

## 23.3.1

### Patch Changes

- [#2571](https://github.com/udecode/plate/pull/2571) by [@zbeyens](https://github.com/zbeyens) – fix: markable void were set on all void nodes

## 23.3.0

### Minor Changes

- [#2568](https://github.com/udecode/plate/pull/2568) by [@zbeyens](https://github.com/zbeyens) – New `PlatePlugin` attribute: `isMarkableVoid: boolean`.

## 22.0.2

## 22.0.1

## 22.0.0

### Minor Changes

- [#2471](https://github.com/udecode/plate/pull/2471) by [@zbeyens](https://github.com/zbeyens) – New plugin option:
  - `enabled`: boolean to enable/disable the plugin

## 21.5.0

### Minor Changes

- [#2464](https://github.com/udecode/plate/pull/2464) by [@12joan](https://github.com/12joan) –
  - Add `editorRef` prop to Plate/PlateProvider
    - Works with `useRef<PlateEditor | null>` or `useState<PlateEditor | null>`
    - The editor instance is passed to the ref on mount and whenever the editor is reset
    - The ref is set to `null` when the editor unmounts
  - Add various new methods to `editor`:
    - `editor.reset()` - Equivalent to `useResetPlateEditor()()`
    - `editor.redecorate()` - Equivalent to `useRedecorate()()`
    - `editor.plate.<key>.set(value)` - Sets the value of `<key>` in the Plate store. The following keys are currently supported:
      - readOnly
      - plugins
      - onChange
      - decorate
      - renderElement
      - renderLeaf

## 21.4.2

### Patch Changes

- [#2454](https://github.com/udecode/plate/pull/2454) by [@dimaanj](https://github.com/dimaanj) – HTML deserializer: fix pasting tables with empty cells

## 21.4.1

## 21.3.2

### Patch Changes

- [#2415](https://github.com/udecode/plate/pull/2415) by [@santialbo](https://github.com/santialbo) – support new prop name initialValue on Slate after 0.94.1

## 21.3.0

## 21.1.5

### Patch Changes

- [#2400](https://github.com/udecode/plate/pull/2400) by [@joephela](https://github.com/joephela) – Fix/2399 deserialize validAttribute nullcheck

## 21.0.0

## 20.7.2

### Patch Changes

- [#2368](https://github.com/udecode/plate/pull/2368) by [@zbeyens](https://github.com/zbeyens) –
  - error handling when pasting (`x-slate-fragment`)

## 20.7.0

### Patch Changes

- [#2358](https://github.com/udecode/plate/pull/2358) by [@etienne-dldc](https://github.com/etienne-dldc) – fix readOnly not being properly updated on Editable

## 20.4.0

### Patch Changes

- [#2289](https://github.com/udecode/plate/pull/2289) by [@zbeyens](https://github.com/zbeyens) –
  - fix `nodeProps`: `undefined` attributes values are ignored

## 20.0.0

### Major Changes

- [`0077402`](https://github.com/udecode/plate/commit/00774029236d37737abdadf49b074e613e290792) by [@zbeyens](https://github.com/zbeyens) –
  - This package has been split into multiple packages for separation of concerns and decoupled versioning:
    - `@udecode/utils` is a collection of miscellaneous utilities. Can be used by any project.
    - `@udecode/slate` is a collection of `slate` experimental features and bug fixes that may be moved into `slate` one day. It's essentially composed of the generic types. Can be used by vanilla `slate` consumers without plate.
    - `@udecode/slate-react` is a collection of `slate-react` experimental features and bug fixes that that may be moved into `slate-react` one day. It's essentially composed of the generic types. Can be used by vanilla `slate-react` consumers without plate.
    - `@udecode/plate-core` is the minimalistic core of plate. It essentially includes `Plate`, `PlateProvider` and their dependencies. Note this package is not dependent on the `*-utils` packages.
    - `@udecode/slate-utils` is a collection of utils depending on `@udecode/slate`. Can be used by vanilla `slate` consumers without plate.
    - `@udecode/plate-utils` is a collection of utils depending on `@udecode/slate-react` and `@udecode/plate-core`
    - `@udecode/plate-common` re-exports the 6 previous packages and is a dependency of all the other packages. It's basically replacing `@udecore/plate-core` as a bundle.
  - Removed `getPreventDefaultHandler` since it is no longer needed.
    **Migration**:
    - If using `@udecode/plate` or `@udecode/plate-headless`: none
    - Else: find & replace `@udecode/plate-core` by `@udecode/plate-common`

### Minor Changes

- [#2240](https://github.com/udecode/plate/pull/2240) by [@OliverWales](https://github.com/OliverWales) –
  - Add `sanitizeUrl` util to check if URL has an allowed scheme

### Patch Changes

- [#2237](https://github.com/udecode/plate/pull/2237) by [@TomMorane](https://github.com/TomMorane) – `createHOC`: deep merge props

## 19.7.0

### Minor Changes

- [#2225](https://github.com/udecode/plate/pull/2225) by [@TomMorane](https://github.com/TomMorane) – vendor: upgrade react-hotkeys-hook to v4

### Patch Changes

- [#2233](https://github.com/udecode/plate/pull/2233) by [@fimion](https://github.com/fimion) – Fixes #2230: infinite recursion when using plugin field `then`

## 19.5.0

### Patch Changes

- [#2211](https://github.com/udecode/plate/pull/2211) by [@zbeyens](https://github.com/zbeyens) –
  - support `slate/slate-react@0.90.0`
  - add `isElement(n)` to `isBlock` as it has been removed by slate
  - Fixes #2203
  - Fixes #2197

## 19.4.4

### Patch Changes

- [#2194](https://github.com/udecode/plate/pull/2194) by [@zbeyens](https://github.com/zbeyens) – fix: `useElement` should not throw an error if the element is not found. It can happen when the document is not yet normalized. This patch replaces the `throw` by a `console.warn`.

## 19.4.2

### Patch Changes

- [#2185](https://github.com/udecode/plate/pull/2185) by [@zbeyens](https://github.com/zbeyens) – fix: `getEditorString` should not throw an error when a node is not found. Returns an empty string in that case.

## 19.2.0

### Minor Changes

- [#2156](https://github.com/udecode/plate/pull/2156) by [@12joan](https://github.com/12joan) – Trim \n characters from start and end of text nodes when deserializing HTML

## 19.1.1

### Patch Changes

- [#2151](https://github.com/udecode/plate/pull/2151) by [@zbeyens](https://github.com/zbeyens) – fix: use `removeEditorMark` in editorProtocol plugin

## 19.1.0

### Minor Changes

- [#2142](https://github.com/udecode/plate/pull/2142) by [@zbeyens](https://github.com/zbeyens) –
  - New core plugin: `editorProtocol` following https://github.com/udecode/editor-protocol core specs
    - Fixes https://github.com/udecode/editor-protocol/issues/81
  - Slate types: replaced editor mark types by `string`. Derived types from `EMarks<V>` are often unusable.

## 19.0.3

### Patch Changes

- [#2108](https://github.com/udecode/plate/pull/2108) by [@zbeyens](https://github.com/zbeyens) – Fixes #2107

## 19.0.1

### Patch Changes

- [`8957172`](https://github.com/udecode/plate/commit/89571722d3e0e275af302cb4553e85f0edd0b912) by [@zbeyens](https://github.com/zbeyens) – fix: `editor.id` of type `Symbol`

## 19.0.0

### Major Changes

- [#2097](https://github.com/udecode/plate/pull/2097) by [@zbeyens](https://github.com/zbeyens) –
  - upgrade deps, including typescript support for the new editor methods:
  ```json
  // from
  "slate": "0.78.0",
  "slate-history": "0.66.0",
  "slate-react": "0.79.0"
  // to
  "slate": "0.87.0",
  "slate-history": "0.86.0",
  "slate-react": "0.88.0"
  ```

## 18.15.0

### Minor Changes

- [`2a72716`](https://github.com/udecode/plate/commit/2a7271665eeedc35b8b8f08f793d550503c7b85a) by [@zbeyens](https://github.com/zbeyens) –

  - new `Plate` / `PlateProvider` prop: `readOnly`
  - it's also stored in plate store, useful when `readOnly` is needed between `PlateProvider` and `Plate`.
  - new selector: `usePlateReadOnly`
  - (not mandatory) migration:

  ```tsx
  // from
  <Plate editableProps={{readOnly: true}} />

  // to
  <Plate readOnly />
  ```

## 18.13.0

### Minor Changes

- [#1829](https://github.com/udecode/plate/pull/1829) by [@osamatanveer](https://github.com/osamatanveer) –
  - new queries:
    - `getPreviousSiblingNode`
    - `isDocumentEnd`
  - new utils:
    - `getJotaiProviderInitialValues`: get jotai provider initial values from props
    - exports `nanoid`
  - new dependency: `nanoid`

## 18.9.0

### Minor Changes

- [#1978](https://github.com/udecode/plate/pull/1978) by [@zbeyens](https://github.com/zbeyens) – Plugin fields `renderBeforeEditable` and `renderAfterEditable` now have `TEditableProps` passed as the first parameter.

## 18.7.0

### Minor Changes

- [#1960](https://github.com/udecode/plate/pull/1960) by [@zbeyens](https://github.com/zbeyens) –
  - Default editor value is now overridable with `editor.childrenFactory()`
  - New core plugin `nodeFactory`, extends the editor with:
    - `blockFactory: (node) => TElement`, can be used to create the default editor block
    - `childrenFactory: () => Value`
  - New transform `resetEditorChildren`: Replace editor children by `editor.childrenFactory()`.

## 18.6.0

### Minor Changes

- [#1959](https://github.com/udecode/plate/pull/1959) by [@zbeyens](https://github.com/zbeyens) –
  - Default editor value is now overridable with `editor.childrenFactory()`
  - New core plugin `nodeFactory`, extends the editor with:
    - `blockFactory: (node) => TElement`, can be used to create the default editor block
    - `childrenFactory: () => Value`
  - New transform `resetEditorChildren`: Replace editor children by `editor.childrenFactory()`.

### Patch Changes

- [#1957](https://github.com/udecode/plate/pull/1957) by [@tmilewski](https://github.com/tmilewski) – fix: update `@radix-ui/react-slot` to eliminate conflicting peer dependencies

- [#1953](https://github.com/udecode/plate/pull/1953) by [@zbeyens](https://github.com/zbeyens) – `applyDeepToNodes`: new option `path`

## 18.2.0

### Minor Changes

- [#1888](https://github.com/udecode/plate/pull/1888) by [@zbeyens](https://github.com/zbeyens) –
  - new `PlatePlugin` property:
    - `renderAboveSlate` – Render a component above `Slate`
  - `id` is no longer required in plate hooks:
    - `usePlateId()` is getting the closest editor id
    - it's used in all store hooks if no store is found with the omitted id
    - note that `id` is not needed if you don't have nested `Plate` / `PlateProvider`
  - `id` prop change should remount `Plate`

## 18.1.1

### Patch Changes

- [#1896](https://github.com/udecode/plate/pull/1896) by [@charrondev](https://github.com/charrondev) – Fix `PrevSelectionPlugin` event persistence on React 16.x

## 17.0.3

### Patch Changes

- [#1885](https://github.com/udecode/plate/pull/1885) by [@zbeyens](https://github.com/zbeyens) – fix: Plate without `initialValue` or `value` prop should use `editor.children` as value. If `editor.children` is empty, use default value (empty paragraph).

## 17.0.2

### Patch Changes

- [#1882](https://github.com/udecode/plate/pull/1882) by [@zbeyens](https://github.com/zbeyens) – Fix: dynamic plugins

## 17.0.1

### Patch Changes

- [#1878](https://github.com/udecode/plate/pull/1878) by [@zbeyens](https://github.com/zbeyens) –
  - Fix: `Maximum call stack size exceeded` after many changes
  - Fix: Plate props that are functions are now working (e.g. `onChange`)

## 17.0.0

### Major Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –

  - `usePlateStore`:
    - Plate no longer has a global store containing all the editor states (zustand). Each editor store is now defined in a React context tree ([jotai](https://github.com/pmndrs/jotai)). If you need to access all the editor states at once (as you could do before), you'll need to build that layer yourself.
    - Plate store is now accessible only below `PlateProvider` or `Plate` (provider-less mode). It means it's no longer accessible outside of a Plate React tree. If you have such use-case, you'll need to build your own layer to share the state between your components.
    - You can nest many `PlateProvider` with different scopes (`id` prop). Default scope is `PLATE_SCOPE`
    - Hook usage:
      - `const value = usePlateSelectors(id).value()`
      - `const setValue = usePlateActions(id).value()`
      - `const [value, setValue] = usePlateStates(id).value()`
    - removed from the store:
      - `editableProps`, use the props instead
      - `enabled`, use conditional rendering instead
      - `isReady`, no point anymore as it's now directly ready
    - `useEventPlateId` is still used to get the last focused editor id.
    - Functions are stored in an object `{ fn: <here> }` - `const setOnChange = usePlateActions(id).onChange()` - `setOnChange({ fn: newOnChange })`
  - `Plate`
    - if rendered below `PlateProvider`, it will render `PlateSlate > PlateEditable`
    - if rendered without `PlateProvider`, it will render `PlateProvider > PlateSlate > PlateEditable`
    - default `id` is no longer `main`, it's now `PLATE_SCOPE`
  - `PlateProvider`
    - Each provider has an optional `scope`, so you can have multiple providers in the same React tree and use the plate hooks with the corresponding `scope`.
    - Plate effects are now run in `PlateProvider`
      - `initialValue, value, editor, normalizeInitialValue, normalizeEditor` are no longer defined in an effect (SSR support)
    - Props:
      - now extends the previous `Plate` props
      - if using `PlateProvider`, set the provider props on it instead of `Plate`. `Plate` would only need `editableProps` and `PlateEditableExtendedProps`
      - if not using it, set the provider props on `Plate`

  ```tsx
  // Before
  <PlateProvider>
    <Toolbar>
      <AlignToolbarButtons />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} <MyValue> initialValue={alignValue} plugins={plugins} />
  </PlateProvider>

  // After
  <PlateProvider<MyValue> initialValue={alignValue} plugins={plugins}>
    <Toolbar>
      <AlignToolbarButtons />
    </Toolbar>

    <Plate<MyValue> editableProps={editableProps} />
  </PlateProvider>

  // After (provider-less mode)
  <Plate<MyValue> editableProps={editableProps} initialValue={alignValue} plugins={plugins} />
  ```

  - types:
    - store `editor` is no longer nullable
    - store `value` is no longer nullable
    - `id` type is now `PlateId`
  - renamed:
    - `SCOPE_PLATE` to `PLATE_SCOPE`
    - `getEventEditorId` to `getEventPlateId`
    - `getPlateActions().resetEditor` to `useResetPlateEditor()`
  - removed:
    - `plateIdAtom`
    - `usePlateId` for `usePlateSelectors().id()`
    - `EditablePlugins` for `PlateEditable`
    - `SlateChildren`
    - `PlateEventProvider` for `PlateProvider`
    - `withPlateEventProvider` for `withPlateProvider`
    - `usePlate`
    - `usePlatesStoreEffect`
    - `useEventEditorId` for `useEventPlateId`
    - `platesStore, platesActions, platesSelectors, usePlatesSelectors`
    - `getPlateActions` for `usePlateActions`
    - `getPlateSelectors` for `usePlateSelectors`
    - `getPlateEditorRef` for `usePlateEditorRef`
    - `getPlateStore, usePlateStore`
    - `EditorId` for `PlateId`

### Minor Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –

  - **SSR support**
  - `useEventPlateId` returns:
    - `id` if defined
    - focused editor id if defined
    - blurred editor id if defined
    - last editor id if defined
    - provider id if defined
    - `PLATE_SCOPE` otherwise
  - new dep: `nanoid`
  - `PlateProvider`

  ```tsx
  export interface PlateProviderProps<
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>,
  > extends PlateProviderEffectsProps<V, E>,
      Partial<Pick<PlateStoreState<V, E>, 'id' | 'editor'>> {
    /**
     * Initial value of the editor.
     *
     * @default [{ children: [{ text: '' }] }]
     */
    initialValue?: PlateStoreState<V>['value'];

    /**
     * When `true`, it will normalize the initial value passed to the `editor`
     * once it gets created. This is useful when adding normalization rules on
     * already existing content.
     *
     * @default false
     */
    normalizeInitialValue?: boolean;

    scope?: Scope;
  }
  ```

  - `PlateProviderEffects`
  - `PlateSlate`
  - `PlateEditable`

  ```tsx
  export interface PlateEditableExtendedProps {
    id?: PlateId;

    /** The children rendered inside `Slate`, after `Editable`. */
    children?: ReactNode;

    /** Ref to the `Editable` component. */
    editableRef?: Ref<HTMLDivElement>;

    /**
     * The first children rendered inside `Slate`, before `Editable`. Slate DOM is
     * not yet resolvable on first render, for that case use `children` instead.
     */
    firstChildren?: ReactNode;

    /** Custom `Editable` node. */
    renderEditable?: (editable: ReactNode) => ReactNode;
  }

  export interface PlateEditableProps<V extends Value = Value>
    extends Omit<TEditableProps<V>, 'id'>,
      PlateEditableExtendedProps {}
  ```

### Patch Changes

- [#1871](https://github.com/udecode/plate/pull/1871) by [@zbeyens](https://github.com/zbeyens) –
  - Fixes #1508
  - Fixes #1343

## 16.8.0

### Minor Changes

- [#1856](https://github.com/udecode/plate/pull/1856) by [@zbeyens](https://github.com/zbeyens) –
  - core plugin `createSelectionPlugin` renamed to `createPrevSelectionPlugin`
  - `queryNode` - new options:
    - `level`: Valid path levels
    - `maxLevel`: Paths above that value are invalid

## 16.5.0

### Minor Changes

- [#1832](https://github.com/udecode/plate/pull/1832) by [@zbeyens](https://github.com/zbeyens) – New editor prop:
  - `currentKeyboardEvent`: is set in `onKeyDown` and unset after applying `set_selection` operation. Useful to override the selection depending on the keyboard event.

## 16.3.0

### Patch Changes

- [#1796](https://github.com/udecode/plate/pull/1796) by [@zbeyens](https://github.com/zbeyens) – New `PlateEditor` prop to store the last key down:
  - `lastKeyDown: string | null`

## 16.2.0

### Minor Changes

- [#1778](https://github.com/udecode/plate/pull/1778) by [@zbeyens](https://github.com/zbeyens) –
  - `isRangeAcrossBlocks`: Now returns true if one of the block above is found but not the other and returns undefined if no block is found.
  - `isRangeInSameBlock`: Whether the range is in the same block.
  - `removeNodeChildren`: Remove node children.
  - `replaceNodeChildren`: Replace node children: remove then insert.

### Patch Changes

- [#1776](https://github.com/udecode/plate/pull/1776) by [@davisg123](https://github.com/davisg123) – Autoformatter will incorrectly match on text that contains one additional character of text

## 16.1.0

### Minor Changes

- [#1768](https://github.com/udecode/plate/pull/1768) by [@zbeyens](https://github.com/zbeyens) – new utils:
  - `wrapNodeChildren`: Wrap node children into a single element

## 16.0.2

### Patch Changes

- [#1766](https://github.com/udecode/plate/pull/1766) by [@zbeyens](https://github.com/zbeyens) – Fix: Plate `firstChildren` is now working

- [#1755](https://github.com/udecode/plate/pull/1755) by [@mouradmourafiq](https://github.com/mouradmourafiq) – Add `options` parameter to `isSelectionAtBlockEnd`

## 16.0.0

### Minor Changes

- [#1721](https://github.com/udecode/plate/pull/1721) by [@zbeyens](https://github.com/zbeyens) –
  - `ElementProvider` now has `SCOPE_ELEMENT='element'` scope in addition to the plugin key, so `useElement()` can be called without parameter (default = `SCOPE_ELEMENT`). You'll need to use the plugin key scope only to get an ancestor element.
  - upgrade peerDeps:
    - `"slate": ">=0.78.0"`
    - `"slate-react": ">=0.79.0"`

## 15.0.3

### Patch Changes

- [#1707](https://github.com/udecode/plate/pull/1707) by [@dylans](https://github.com/dylans) – improve performance of list normalizations

## 15.0.0

### Minor Changes

- [#1677](https://github.com/udecode/plate/pull/1677) by [@zbeyens](https://github.com/zbeyens) –
  - new dep + re-exports `"react-hotkeys-hook": "^3.4.6"`
  - new core plugin `createSelectionPlugin`
    - stores the previous selection in `editor.prevSelection` (default is `null`)
    - enabled by default, can be disabled using `selection` key
  - new `PlatePlugin` props:
    - `renderAboveEditable`: Render a component above `Editable`.
    - `renderAfterEditable`: Render a component after `Editable`.
    - `renderBeforeEditable`: Render a component before `Editable`.
  - `Plate`:
    - pipes plugins `renderAboveEditable` and render the result above `Editable`
    - pipes plugins `renderAfterEditable` and render the result after `Editable`, before `children`
    - pipes plugins `renderBeforeEditable` and render the result before `Editable`, after `firstChildren`
  - new queries
    - `getNextNodeStartPoint`
    - `getPreviousNodeEndPoint`
  - new hooks
    - `useOnClickOutside`
  - `PlateEditor` new prop:
    - `prevSelection: TRange | null;`

## 14.4.2

### Patch Changes

- [#1689](https://github.com/udecode/plate/pull/1689) by [@zbeyens](https://github.com/zbeyens) – fix: wait for editor value being ready before calling `normalizeNodes`

## 14.0.2

### Patch Changes

- [#1669](https://github.com/udecode/plate/pull/1669) by [@zbeyens](https://github.com/zbeyens) – fix: use jotai scope to Plate provider

## 14.0.0

### Major Changes

- [#1633](https://github.com/udecode/plate/pull/1633) by [@tjramage](https://github.com/tjramage) – Moved `serializeHtml` and its utils to `@udecode/plate-serializer-html` as it has a new dependency: [html-entities](https://www.npmjs.com/package/html-entities).
  - If you're using `@udecode/plate`, no migration is needed
  - Otherwise, import it from `@udecode/plate-serializer-html`

## 13.8.0

### Minor Changes

- [#1650](https://github.com/udecode/plate/pull/1650) by [@zbeyens](https://github.com/zbeyens) – `PlatePlugin` has a new option:
  - `normalizeInitialValue`: filter the value before it's passed into the editor

## 13.7.0

### Minor Changes

- [#1648](https://github.com/udecode/plate/pull/1648) by [@zbeyens](https://github.com/zbeyens) –
  - new plate action:
    - `redecorate` - triggers a redecoration of the editor.

## 13.6.0

### Minor Changes

- [`bed47ae`](https://github.com/udecode/plate/commit/bed47ae4380971a829c8f0fff72d1610cf321e73) by [@zbeyens](https://github.com/zbeyens) –
  - `focusEditor` new option to set selection before focusing the editor
    - `target`: if defined:
      - deselect the editor (otherwise it will focus the start of the editor)
      - select the editor
      - focus the editor
  - re-exports `createStore` from `@udecode/zustood`, so the other packages don't have to install it

### Patch Changes

- [`bed47ae`](https://github.com/udecode/plate/commit/bed47ae4380971a829c8f0fff72d1610cf321e73) by [@zbeyens](https://github.com/zbeyens) –
  - fix returned type: `getNextSiblingNodes`

## 13.5.0

### Minor Changes

- [#1616](https://github.com/udecode/plate/pull/1616) by [@zbeyens](https://github.com/zbeyens) –
  - `useElement`: Plate is now storing `element` in a context provided in each rendered element. Required parameter: the plugin key is used as a scope as it's needed for nested elements.

## 13.1.0

### Major Changes

- `Plate` children are now rendered as last children of `Slate` (previously first children). To reproduce the previous behavior, move `children` to `firstChildren`

### Minor Changes

- [#1592](https://github.com/udecode/plate/pull/1592) by [@zbeyens](https://github.com/zbeyens) –
  - fix: `Plate` children were rendered before `Editable`, making slate DOM not resolvable on first render. Fixed by moving `Editable` as the first child of `Slate` and `children` as the last children of `Slate`.
  - `Plate` new props:
    - `firstChildren`: replaces the previous behavior of `children`, rendered as the first children of `Slate`
    - `editableRef`: Ref to the `Editable` component.
  - Plate store - new field:
    - `isRendered`: Whether `Editable` is rendered so slate DOM is resolvable. Subscribe to this value when you query the slate DOM outside `Plate`.

## 11.2.1

### Patch Changes

- [#1566](https://github.com/udecode/plate/pull/1566) by [@armedi](https://github.com/armedi) – Fix runtime error when deserialized html contains svg element

## 11.2.0

### Minor Changes

- [#1560](https://github.com/udecode/plate/pull/1560) by [@zbeyens](https://github.com/zbeyens) –
  - exports `isComposing` from `ReactEditor`
  - exports `Hotkeys` from slate
  - types:
    - use [slate type options](https://github.com/ianstormtaylor/slate/commit/3b7a1bf72d0c3951416c771f7f149bfbda411111) when defined

## 11.1.0

### Minor Changes

- [#1546](https://github.com/udecode/plate/pull/1546) by [@zbeyens](https://github.com/zbeyens) –
  - `getEdgeBlocksAbove`: Get the edge blocks above a location (default: selection).
  - `getPluginTypes`: Get plugin types option by plugin keys.

## 11.0.6

### Patch Changes

- [#1534](https://github.com/udecode/plate/pull/1534) by [@zbeyens](https://github.com/zbeyens) – types:
  - `createPluginFactory`: use generic `P` type in first parameter
  - add `Value` default type in place it can't be inferred
  - replace `EditorNodesOptions` by `GetNodeEntriesOptions`

## 11.0.5

### Patch Changes

- [#1530](https://github.com/udecode/plate/pull/1530) by [@zbeyens](https://github.com/zbeyens) – `TEditor`: add default generic `Value`

## 11.0.4

### Patch Changes

- [#1528](https://github.com/udecode/plate/pull/1528) by [@zbeyens](https://github.com/zbeyens) – fix: propagate editor generic to `PlatePlugin` handlers

## 11.0.3

### Patch Changes

- [#1526](https://github.com/udecode/plate/pull/1526) by [@zbeyens](https://github.com/zbeyens) –
  - `unhangRange`: return the range instead of void
  - add default generic types to many places
  - add generic types to:
    - `WithOverride` functions
    - `Decorate` functions
    - `OnChange` functions
    - `KeyboardHandler` functions

## 11.0.2

### Patch Changes

- [#1523](https://github.com/udecode/plate/pull/1523) by [@zbeyens](https://github.com/zbeyens) –
  - `createPluginFactory` type: default plugin has types (e.g. `Value`) which can be overriden using generics (e.g. `MyValue`).
  - Plugin types are now using `Value` generic type when it's using the editor.
  - replace plugin options generic type `P = {}` by `P = PluginOptions` where `PluginOptions = AnyObject`. That fixes a type error happening when a list of plugins has custom `P`, which don't match `{}`.

## 11.0.1

### Patch Changes

- [#1521](https://github.com/udecode/plate/pull/1521) by [@zbeyens](https://github.com/zbeyens) – Fix: nested element types in `Value` type

## 11.0.0

### Major Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – Thanks @ianstormtaylor for the initial work on https://github.com/ianstormtaylor/slate/pull/4177.

  This release includes major changes to plate and slate types:

  - Changing the `TEditor` type to be `TEditor<V>` where `V` represents the "value" being edited by Slate. In the most generic editor, `V` would be equivalent to `TElement[]` (since that is what is accepted as children of the editor). But in a custom editor, you might have `TEditor<Array<Paragraph | Quote>>`.
  - Other `TEditor`-and-`TNode`-related methods have been also made generic, so for example if you use `getLeafNode(editor, path)` it knows that the return value is a `TText` node. But more specifically, it knows that it is the text node of the type you've defined in your custom elements (with any marks you've defined).
  - This replaces the declaration merging approach, and provides some benefits. One of the drawbacks to declaration merging was that it was impossible to know whether you were dealing with an "unknown" or "known" element, since the underlying type was changed. Similarly, having two editors on the page with different schemas wasn't possible to represent. Hopefully this approach with generics will be able to smoothly replace the declaration merging approach. (While being easy to migrate to, since you can pass those same custom element definitions into `TEditor` still.)

**Define your custom types**

- Follow https://platejs.org/docs/typescript example.

**Slate types**

Those Slate types should be replaced by the new types:

- `Editor` -> `TEditor<V extends Value>`
  - Note that `TEditor` methods are not typed based on `Value` as it would introduce a circular dependency. You can use `getTEditor(editor)` to get the editor with typed methods.
- `ReactEditor` -> `TReactEditor<V extends Value>`
- `HistoryEditor` -> `THistoryEditor<V extends Value>`
- `EditableProps` -> `TEditableProps<V extends Value>`
- `Node` -> `TNode`
- `Element` -> `TElement`
- `Text` -> `TText`

**Slate functions**

Those Slate functions should be replaced by the new typed ones:

- As the new editor type is not matching the slate ones, all `Transforms`, `Editor`, `Node`, `Element`, `Text`, `HistoryEditor`, `ReactEditor` functions should be replaced: The whole API has been typed into Plate core. See https://github.com/udecode/plate/packages/core/src/slate
- `createEditor` -> `createTEditor`
- `withReact` -> `withTReact`
- `withHistory` -> `withTHistory`

**Generic types**

- `<T = {}>` could be used to extend the editor type. It is now replaced by `<E extends PlateEditor<V> = PlateEditor<V>>` to customize the whole editor type.
- When the plugin type is customizable, these generics are used: `<P = PluginOptions, V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>`, where `P` is the plugin options type.
- `Editor` functions are using `<V extends Value>` generic, where `V` can be a custom editor value type used in `PlateEditor<V>`.
- `Editor` functions returning a node are using `<N extends ENode<V>, V extends Value = Value>` generics, where `N` can be a custom returned node type.
- `Editor` callbacks (e.g. a plugin option) are using `<V extends Value, E extends PlateEditor<V> = PlateEditor<V>>` generics, where `E` can be a custom editor type.
- `Node` functions returning a node are using `<N extends Node, R extends TNode = TNode>` generics.
- These generics are used by `<V extends Value, K extends keyof EMarks<V>>`: `getMarks`, `isMarkActive`, `removeMark`, `setMarks`, `ToggleMarkPlugin`, `addMark`, `removeEditorMark`
- `WithOverride` is a special type case as it can return a new editor type:

  ```tsx
  // before
  export type WithOverride<T = {}, P = {}> = (
    editor: PlateEditor<T>,
    plugin: WithPlatePlugin<T, P>
  ) => PlateEditor<T>;

  // after - where E is the Editor type (input), and EE is the Extended Editor type (output)
  export type WithOverride<
    P = PluginOptions,
    V extends Value = Value,
    E extends PlateEditor<V> = PlateEditor<V>,
    EE extends E = E,
  > = (editor: E, plugin: WithPlatePlugin<P, V, E>) => EE;
  ```

- `type TEditor<V extends Value>`
- `type PlateEditor<V extends Value>`

**Renamed functions**

- `getAbove` -> `getAboveNode`
- `getParent` -> `getParentNode`
- `getText` -> `getEditorString`
- `getLastNode` -> `getLastNodeByLevel`
- `getPointBefore` -> `getPointBeforeLocation`
- `getNodes` -> `getNodeEntries`
- `getNodes` -> `getNodeEntries`
- `isStart` -> `isStartPoint`
- `isEnd` -> `isEndPoint`

**Replaced types**

Removing node props types in favor of element types (same props + extends `TElement`). You can use `TNodeProps` to get the node data (props).

- `LinkNodeData` -> `TLinkElement`
- `ImageNodeData` -> `TImageElement`
- `TableNodeData` -> `TTableElement`
- `MentionNodeData` -> `TMentionElement`
- `MentionNode` -> `TMentionElement`
- `MentionInputNodeData` -> `TMentionInputElement`
- `MentionInputNode` -> `TMentionInputElement`
- `CodeBlockNodeData` -> `TCodeBlockElement`
- `MediaEmbedNodeData` -> `TMediaEmbedElement`
- `TodoListItemNodeData` -> `TTodoListItemElement`
- `ExcalidrawNodeData` -> `TExcalidrawElement`

**Utils**

- `match` signature change:

```
<T extends TNode>(
  obj: T,
  path: TPath,
  predicate?: Predicate<T>
)
```

### Minor Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – Transforms:

  - `insertElements`: `insertNodes` where node type is `TElement`
  - `setElements`: `setNodes` where node type is `TElement`

  Types:

  - General type improvements to all plate packages.
  - `Value = TElement[]`: Default value of an editor.
  - `TNode = TEditor<Value> | TElement | TText`
  - `TElement`: Note that `type: string` is included as it's the standard in Plate.
  - `TText`: it now accepts unknown props.
  - `TDescendant = TElement | TText`
  - `TAncestor = TEditor<Value> | TElement`
  - `ENode<V extends Value>`: Node of an editor value
  - `EElement<V extends Value>`: Element of an editor value
  - `EText<V extends Value>`: Text of an editor value
  - `EDescendant<V extends Value>`: Descendant of an editor value
  - `EAncestor<V extends Value>`: Ancestor of an editor value
  - `NodeOf<N extends TNode>`: A utility type to get all the node types from a root node type.
  - `ElementOf<N extends TNode>`: A utility type to get all the element nodes type from a root node.
  - `TextOf<N extends TNode>`: A utility type to get all the text node types from a root node type.
  - `DescendantOf<N extends TNode>`: A utility type to get all the descendant node types from a root node type.
  - `ChildOf<N extends TNode, I extends number = number>`: A utility type to get the child node types from a root node type.
  - `AncestorOf<N extends TNode>`: A utility type to get all the ancestor node types from a root node type.
  - `ValueOf<E extends TEditor<Value>>`: A helper type for getting the value of an editor.
  - `MarksOf<N extends TNode>`: A utility type to get all the mark types from a root node type.
  - `EMarks<V extends Value>`
  - `TNodeProps<N extends TNode>`: Convenience type for returning the props of a node.
  - `TNodeEntry<N extends TNode = TNode>`
  - `ENodeEntry<V extends Value>`: Node entry from an editor.
  - `TElementEntry<N extends TNode = TNode>`: Element entry from a node.
  - `TTextEntry<N extends TNode = TNode>`: Text node entry from a node.
  - `ETextEntry<V extends Value>`: Text node entry of a value.
  - `TAncestorEntry<N extends TNode = TNode>`: Ancestor entry from a node.
  - `EAncestorEntry<V extends Value>`: Ancestor entry from an editor.
  - `TDescendantEntry<N extends TNode = TNode>`: Descendant entry from a node.
  - `TOperation<N extends TDescendant = TDescendant>`: operation types now accept unknown props.

  Updated deps:

  ```bash
  "@udecode/zustood": "^1.1.1",
  "jotai": "^1.6.6",
  "lodash": "^4.17.21",
  "zustand": "^3.7.2"
  ```

### Patch Changes

- [#1500](https://github.com/udecode/plate/pull/1500) by [@zbeyens](https://github.com/zbeyens) – fix: Type alias 'TDescendant' circularly references itself

## 10.5.3

### Patch Changes

- [#1476](https://github.com/udecode/plate/pull/1476) by [@chrishyle](https://github.com/chrishyle) – Fixed an error in toggleMark that caused removeMark to be called when there is no mark to remove

## 10.5.2

### Patch Changes

- [#1472](https://github.com/udecode/plate/pull/1472) by [@m9rc1n](https://github.com/m9rc1n) – Fix Url encoded HTML nodes on adding an image #1189.
  Updated function `serializeHtml` to use `decodeURIComponent` per node, instead of complete text.
  This is fixing problem when combination of image and i.e. paragraph nodes would result in paragraph node not decoded.

## 10.5.0

### Minor Changes

- [#1465](https://github.com/udecode/plate/pull/1465) by [@zbeyens](https://github.com/zbeyens) –
  - `withoutNormalizing`: `Editor.withoutNormalizing` which returns true if normalized
  - `createPlateEditor`: add `normalizeInitialValue` option
  - `createPlateTestEditor`

## 10.4.2

### Patch Changes

- [#1447](https://github.com/udecode/plate/pull/1447) by [@ryanbarr](https://github.com/ryanbarr) – Update isType to correctly return the expected boolean value.

## 10.4.1

### Patch Changes

- [#1440](https://github.com/udecode/plate/pull/1440) by [@zbeyens](https://github.com/zbeyens) – Critical fix: plate hooks without id. `usePlateId` (used to get plate store) is now working below `PlateProvider` and outside `Plate`.

## 10.4.0

### Minor Changes

- [#1435](https://github.com/udecode/plate/pull/1435) by [@zbeyens](https://github.com/zbeyens) – Fix a critical issue when using multiple editors #1352
  - `withHOC`: 3rd parameter can be used to add props to HOC.
  - `usePlateId` now just gets plate id atom value and no longer gets event editor id as fallback.
  - `useEventEditorId`: Get last event editor id: focus, blur or last.
  - `useEventPlateId`: Get provider plate id or event editor id.
  - `PlateEventProvider`: `PlateProvider` where id is the event editor id (used for toolbar buttons).
  - `withPlateEventProvider`

## 10.2.2

### Patch Changes

- [`15e64184`](https://github.com/udecode/plate/commit/15e6418473aa3f2c6e7c7e5395fa005f028591c4) by [@zbeyens](https://github.com/zbeyens) – Revert plugins memoization fix https://github.com/udecode/plate/pull/1415#issuecomment-1061794845

## 10.2.1

### Patch Changes

- [#1415](https://github.com/udecode/plate/pull/1415) by [@chaseadamsio](https://github.com/chaseadamsio) – fix useEditableProps plugins memoization

## 10.1.2

### Patch Changes

- [#1393](https://github.com/udecode/plate/pull/1393) by [@dylans](https://github.com/dylans) – Check for leaf was too strict with checking for text

## 10.1.1

### Patch Changes

- [#1388](https://github.com/udecode/plate/pull/1388) by [@zbeyens](https://github.com/zbeyens) – fix for docs only: use `Array.from` instead of destructuring generators

- [#1392](https://github.com/udecode/plate/pull/1392) by [@zbeyens](https://github.com/zbeyens) – fix: using `PlateProvider` was not setting the initial value

## 10.1.0

### Minor Changes

- [#1381](https://github.com/udecode/plate/pull/1381) by [@zbeyens](https://github.com/zbeyens) –

  - vendor:
    - upgrade slate to "0.72.8"
    - upgrade slate-react to "0.72.9"
    - upgrade zustand to "3.7.0"
  - new component for testing: `PlateTest`

- [#1387](https://github.com/udecode/plate/pull/1387) by [@zbeyens](https://github.com/zbeyens) –
  - `Plate` props are merged into the initial store state to override the default values.
    - the initial value will be `editor.children` if `editor` prop is defined.
  - `PlateProvider` accepts `PlateProps` so set the initial store state

## 10.0.0

### Minor Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) –
  - new dep: jotai
  - `Plate`:
    - set the store only if it's not already set (e.g. controlled use-case)
    - there is now a jotai provider with plate id so it can be used by plate selectors if no id is given as parameter.
  - `PlateProvider`: Create plate store and mount/unmount if `id` prop updates. `id` can be `string[]`. Use this component on top of components using plate hook selectors, otherwise your components would not rerender on change. Not needed for plate non-hook selectors (getters).
  - `useCreatePlateStore`: hook that creates a plate store into the plates store, if not defined.
  - `usePlateId`: returns the provider plate id (if any).
  - `usePlateStore`: if the hook is used before the plate store is created, it will console warn "The plate hooks must be used inside the `<PlateProvider id={id}>` component's context."
  -

### Patch Changes

- [#1377](https://github.com/udecode/plate/pull/1377) by [@zbeyens](https://github.com/zbeyens) –
  - `eventEditorSelectors.focus()` should now return the currently focused editor id, and `null` if no editor is focused.

## 9.3.1

### Patch Changes

- [#1367](https://github.com/udecode/plate/pull/1367) by [@zbeyens](https://github.com/zbeyens) – Fix: "Adding new Editor instances after render of another instance causes a bad setState error". We were setting the plate store anytime `getPlateStore` was called, so it could be called outside a `useEffect`. `Plate` now returns `null` until the plate store is set in the plates store, so `getPlateStore` always returns a defined store. Note that you'd need the same check on your end above any component using plate selectors.

## 9.3.0

### Patch Changes

- [#1362](https://github.com/udecode/plate/pull/1362) by [@zbeyens](https://github.com/zbeyens) – Upgrade zustood 0.4.4

## 9.2.1

### Patch Changes

- [#1341](https://github.com/udecode/plate/pull/1341) by [@zbeyens](https://github.com/zbeyens) – Fix components using `usePlateEditorState` by introducing `withEditor` / `EditorProvider` hoc

## 9.2.0

### Patch Changes

- [#1338](https://github.com/udecode/plate/pull/1338) by [@zbeyens](https://github.com/zbeyens) – Swap ast and html plugin order

## 9.0.0

### Major Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - `Plate`
    - `editor` prop can now be fully controlled: Plate is not applying `withPlate` on it anymore
  - `PlatePlugin.deserializeHtml`
    - can't be an array anymore
    - moved `validAttribute`, `validClassName`, `validNodeName`, `validStyle` to `deserializeHtml.rules` property
  - renamed `plateStore` to `platesStore`
  - `platesStore` is now a zustood store
  - `eventEditorStore` is now a zustood store
  - `getPlateId` now gets the last editor id if not focused or blurred
    - used by `usePlateEditorRef` and `usePlateEditorState`
  - removed:
    - `usePlateEnabled` for `usePlateSelectors(id).enabled()`
    - `usePlateValue` for `usePlateSelectors(id).value()`
    - `usePlateActions`:
      - `resetEditor` for `getPlateActions(id).resetEditor()`
      - `clearState` for `platesActions.unset()`
      - `setInitialState` for `platesActions.set(id)`
      - `setEditor` for `getPlateActions(id).editor(value)`
      - `setEnabled` for `getPlateActions(id).enabled(value)`
      - `setValue` for `getPlateActions(id).value(value)`
    - `getPlateState`
    - `usePlateState`
    - `usePlateKey`

### Minor Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - new packages
    - `@udecode/zustood`
    - `use-deep-compare`
  - `Plate`
    - renders a new component: `EditorRefEffect`
      - it renders `plugin.useHooks(editor, plugin)` for all `editor.plugins`
      - note that it will unmount and remount the hooks on `plugins` change
    - `useEditableProps`
      - subscribes to the store `editableProps`, `decorate`, `renderLeaf`, `renderElement`
      - `decorate`, `renderLeaf`, `renderElement` are now separately memoized
      - `useDeepCompareMemo` instead of `useMemo` for performance
    - `useSlateProps`
      - subscribes to the store `onChange`, `value`
    - `usePlateEffects`
      - update the plate store on props change:
        - `editableProps`
        - `onChange`
        - `value`
        - `enabled`
        - `plugins`
        - `decorate`
        - `renderElement`
        - `renderLeaf`
  - `PlatePlugin`
    - `useHooks`: new property to use hooks once the editor is initialized.
    - `deserializeHtml`
      - `getNode` has a new parameter `node`
      - `getNode` can be injected by other plugins
  - `createPlateStore`: create a plate zustood store
    - actions: `resetEditor`, `incrementKey`
    - new properties:
      - `plugins`
      - `decorate`
      - `renderElement`
      - `renderLeaf`
      - `editableProps`
      - `onChange`
  - `platesStore`:
    - actions: `set`, `unset`
    - selectors: `get`
  - `usePlateId`: hook version of `getPlateId`
  - `platesActions`
  - `getPlateActions`
  - `getPlateSelectors`
  - `usePlateSelectors`
  - `getPlateStore`
  - `usePlateStore`
  - `eventEditorActions`
  - `eventEditorSelectors`
  - `useEventEditorSelectors`
  - `mapInjectPropsToPlugin`: Map plugin inject props to injected plugin

### Patch Changes

- [#1303](https://github.com/udecode/plate/pull/1303) by [@zbeyens](https://github.com/zbeyens) –
  - fix performance issue with hundreds of Plate editors
  - fix a bug where `editor.plugins` was reversed
  - `Plate`
    - `editor.plugins` were missing plugins on `plugins` prop change
  - `withInlineVoid`:
    - use `plugin.type` instead of `plugin.key`

## 8.3.0

### Patch Changes

- [#1266](https://github.com/udecode/plate/pull/1266) by [@zbeyens](https://github.com/zbeyens) –

  - HTML deserializer:
    - parent attributes does not override child leaf attributes anymore. For example, if a span has fontSize style = 16px, and its child span has fontSize style = 18px, it's now deserializing to 18px instead of 16px.
  - Inject props:
    - does not inject props when node value = `inject.props.defaultNodeValue` anymore.

- [#1257](https://github.com/udecode/plate/pull/1257) by [@tjramage](https://github.com/tjramage) –
  - fix link upsert on space
  - `getPointBefore`: will return early if the point before is in another block. Removed `multiPaths` option as it's not used anymore.

## 8.1.0

### Minor Changes

- [#1249](https://github.com/udecode/plate/pull/1249) by [@zbeyens](https://github.com/zbeyens) – new utils:
  - `parseHtmlDocument`
  - `parseHtmlElement`

## 8.0.0

### Major Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – Breaking changes:

  ### `Plate`

  - removed `components` prop:

  ```tsx
  // Before
  <Plate plugins={plugins} components={components} />;

  // After
  // option 1: use the plugin factory
  let plugins = [
    createParagraphPlugin({
      component: ParagraphElement,
    }),
  ];

  // option 2: use createPlugins
  plugins = createPlugins(plugins, {
    components: {
      [ELEMENT_PARAGRAPH]: ParagraphElement,
    },
  });

  <Plate plugins={plugins} />;
  ```

  - removed `options` prop:

  ```tsx
  // Before
  <Plate plugins={plugins} options={options} />;

  // After
  // option 1: use the plugin factory
  let plugins = [
    createParagraphPlugin({
      type: 'paragraph',
    }),
  ];

  // option 2: use createPlugins
  plugins = createPlugins(plugins, {
    overrideByKey: {
      [ELEMENT_PARAGRAPH]: {
        type: 'paragraph',
      },
    },
  });

  <Plate plugins={plugins} />;
  ```

  ### `PlatePlugin`

  - `key`
    - replacing `pluginKey`
    - is now required: each plugin needs a key to be retrieved by key.
  - all handlers have `plugin` as a second parameter:

  ```tsx
  // Before
  export type X<T = {}> = (editor: PlateEditor<T>) => Y;

  // After
  export type X<T = {}, P = {}> = (
    editor: PlateEditor<T>,
    plugin: WithPlatePlugin<T, P>
  ) => Y;
  ```

  - `serialize` no longer has `element` and `leaf` properties:

  ```ts
  type SerializeHtml = RenderFunction<
    PlateRenderElementProps | PlateRenderLeafProps
  >;
  ```

  Renamed:

  - `injectParentComponent` to `inject.aboveComponent`
  - `injectChildComponent` to `inject.belowComponent`
  - `overrideProps` to `inject.props`
    - `transformClassName`, `transformNodeValue`, `transformStyle` first parameter is no longer `editor` as it's provided by `then` if needed.
    - the previously `getOverrideProps` is now the core behavior if `inject.props` is defined.
  - `serialize` to `serializeHtml`
  - `deserialize` to `deserializeHtml`
    - can be an array
    - the old deserializer options are merged to `deserializeHtml`

  ```tsx
  type DeserializeHtml = {
    /** List of HTML attribute names to store their values in `node.attributes`. */
    attributeNames?: string[];

    /**
     * Deserialize an element. Use this instead of plugin.isElement if you don't
     * want the plugin to renderElement.
     *
     * @default plugin.isElement
     */
    isElement?: boolean;

    /**
     * Deserialize a leaf. Use this instead of plugin.isLeaf if you don't want the
     * plugin to renderLeaf.
     *
     * @default plugin.isLeaf
     */
    isLeaf?: boolean;

    /** Deserialize html element to slate node. */
    getNode?: (element: HTMLElement) => AnyObject | undefined;

    query?: (element: HTMLElement) => boolean;

    /**
     * Deserialize an element:
     *
     * - If this option (string) is in the element attribute names.
     * - If this option (object) values match the element attributes.
     */
    validAttribute?: string | { [key: string]: string | string[] };

    /** Valid element `className`. */
    validClassName?: string;

    /** Valid element `nodeName`. Set '*' to allow any node name. */
    validNodeName?: string | string[];

    /**
     * Valid element style values. Can be a list of string (only one match is
     * needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string | string[] | undefined>
    >;

    /** Whether or not to include deserialized children on this node */
    withoutChildren?: boolean;
  };
  ```

  - handlers starting by `on...` are moved to `handlers` field.

  ```ts
  // Before
  onDrop: handler;

  // After
  handlers: {
    onDrop: handler;
  }
  ```

  Removed:

  - `renderElement` is favor of:
    - `isElement` is a boolean that enables element rendering.
    - the previously `getRenderElement` is now the core behavior.
  - `renderLeaf` is favor of:
    - `isLeaf` is a boolean that enables leaf rendering.
    - the previously `getRenderLeaf` is now the core behavior.
  - `inlineTypes` and `voidTypes` for:
    - `isInline` is a boolean that enables inline rendering.
    - `isVoid` is a boolean that enables void rendering.

  ### General

  - `plugins` is not a parameter anymore as it can be retrieved in `editor.plugins`
  - `withInlineVoid` is now using plugins `isInline` and `isVoid` plugin fields.

  Renamed:

  - `getPlatePluginType` to `getPluginType`
  - `getEditorOptions` to `getPlugins`
  - `getPlatePluginOptions` to `getPlugin`
  - `pipeOverrideProps` to `pipeInjectProps`
  - `getOverrideProps` to `pluginInjectProps`
  - `serializeHTMLFromNodes` to `serializeHtml`
    - `getLeaf` to `leafToHtml`
    - `getNode` to `elementToHtml`
  - `xDeserializerId` to `KEY_DESERIALIZE_X`
  - `deserializeHTMLToText` to `htmlTextNodeToString`
  - `deserializeHTMLToMarks` to `htmlElementToLeaf` and `pipeDeserializeHtmlLeaf`
  - `deserializeHTMLToElement` to `htmlElementToElement` and `pipeDeserializeHtmlElement`
  - `deserializeHTMLToFragment` to `htmlBodyToFragment`
  - `deserializeHTMLToDocumentFragment` to `deserializeHtml`
  - `deserializeHTMLToBreak` to `htmlBrToNewLine`
  - `deserializeHTMLNode` to `deserializeHtmlNode`
  - `deserializeHTMLElement` to `deserializeHtmlElement`

  Removed:

  - `usePlateKeys`, `getPlateKeys`
  - `usePlateOptions` for `getPlugin`
  - `getPlateSelection` for `getPlateEditorRef().selection`
  - `flatMapByKey`
  - `getEditableRenderElement` and `getRenderElement` for `pipeRenderElement` and `pluginRenderElement`
  - `getEditableRenderLeaf` and `getRenderLeaf` for `pipeRenderLeaf` and `pluginRenderLeaf`
  - `getInlineTypes`
  - `getVoidTypes`
  - `getPlatePluginTypes`
  - `getPlatePluginWithOverrides`
  - `mapPlatePluginKeysToOptions`
  - `withDeserializeX` for `PlatePlugin.editor.insertData`

  Changed types:

  - `PlateEditor`:
    - removed `options` for `pluginsByKey`
  - `WithOverride` is not returning an extended editor anymore (input and output editors are assumed to be the same types for simplicity).
  - `PlateState`
    - renamed `keyChange` to `keyEditor`
    - removed `plugins` for `editor.plugins`
    - removed `pluginKeys`
    - removed `selection` for `editor.selection`
    - actions:
      - removed `setSelection`, `setPlugins`, `setPluginKeys`
      - removed `incrementKeyChange` for

  Renamed types:

  - `XHTMLY` to `XHtmlY`
  - `Deserialize` to `DeseralizeHtml`

  Removed types:

  - `PlatePluginOptions`:
    - `type` to `PlatePlugin.type`
    - `component` to `PlatePlugin.component`
    - `deserialize` to `PlatePlugin.deserializeHtml`
    - `getNodeProps` to `PlatePlugin.props.nodeProps`
    - `hotkey` to `HotkeyPlugin`
    - `clear` to `ToggleMarkPlugin`
    - `defaultType` is hardcoded to `p.type`
  - `OverrideProps` for `PlatePlugin.inject.props`
  - `Serialize` for `PlatePlugin.serializeHtml`
  - `NodeProps` for `AnyObject`
  - `OnKeyDownElementOptions` for `HotkeyPlugin`
  - `OnKeyDownMarkOptions` for `ToggleMarkPlugin`
  - `WithInlineVoidOptions`
  - `GetNodeProps` for `PlatePluginProps`
  - `DeserializeOptions`, `GetLeafDeserializerOptions`, `GetElementDeserializerOptions`, `GetNodeDeserializerOptions`, `GetNodeDeserializerRule`, `DeserializeNode` for `PlatePlugin.deserializeHtml`
  - `PlateOptions`
  - `RenderNodeOptions`
  - `DeserializedHTMLElement`

### Minor Changes

- [#1234](https://github.com/udecode/plate/pull/1234) by [@zbeyens](https://github.com/zbeyens) – `PlatePlugin` extended:

  - These fields are used by `withInsertData` plugin.

  ```tsx
  interface PlatePlugin {
    editor?: Nullable<{
      insertData?: {
        /**
         * Format to get data. Example data types are text/plain and
         * text/uri-list.
         */
        format?: string;

        /** Query to skip this plugin. */
        query?: (options: PlatePluginInsertDataOptions) => boolean;

        /** Deserialize data to fragment */
        getFragment?: (
          options: PlatePluginInsertDataOptions
        ) => TDescendant[] | undefined;

        // injected

        /**
         * Function called on `editor.insertData` just before
         * `editor.insertFragment`. Default: if the block above the selection is
         * empty and the first fragment node type is not inline, set the selected
         * node type to the first fragment node type.
         *
         * @returns If true, the next handlers will be skipped.
         */
        preInsert?: (
          fragment: TDescendant[],
          options: PlatePluginInsertDataOptions
        ) => HandlerReturnType;

        /** Transform the inserted data. */
        transformData?: (
          data: string,
          options: { dataTransfer: DataTransfer }
        ) => string;

        /** Transform the fragment to insert. */
        transformFragment?: (
          fragment: TDescendant[],
          options: PlatePluginInsertDataOptions
        ) => TDescendant[];
      };
    }>;
  }
  ```

  - `inject.pluginsByKey`:

  ```tsx
  interface PlatePlugin {
    inject?: {
      /**
       * Any plugin can use this field to inject code into a stack. For example,
       * if multiple plugins have defined `inject.editor.insertData.transformData`
       * for `key=KEY_DESERIALIZE_HTML`, `insertData` plugin will call all of
       * these `transformData` for `KEY_DESERIALIZE_HTML` plugin. Differs from
       * `overrideByKey` as this is not overriding any plugin.
       */
      pluginsByKey?: Record<PluginKey, Partial<PlatePlugin<T>>>;
    };
  }
  ```

  - `options`: any plugin can use the second generic type to type this field. It means that each plugin can be extended using this field.
  - `type` is now optional
  - `component`: no longer need of `options` to customize the component.
  - `overrideByKey`: a plugin can override other plugins by key (deep merge).
  - `plugins`:
    - Can be used to pack multiple plugins, like the heading plugin.
    - Plate eventually flats all the plugins into `editor.plugins`.
    - nesting support (recursive)
  - `props`: Override node `component` props. Props object or function with props parameters returning the new props. Previously done by `overrideProps` and `getNodeProps` options.
  - `then`: a function that is called after the plugin is loaded.
    - this is very powerful as it allows you to have plugin fields derived from the editor and/or the loaded plugin.
    - nesting support (recursive)

  ```ts
  interface PlatePlugin {
    /**
     * Recursive plugin merging. Can be used to derive plugin fields from
     * `editor`, `plugin`. The returned value will be deeply merged to the
     * plugin.
     */
    then?: (
      editor: PlateEditor<T>,
      plugin: WithPlatePlugin<T, P>
    ) => Partial<PlatePlugin<T, P>>;
  }
  ```

  New plugins:

  - `createEventEditorPlugin` (core)
  - `createInsertDataPlugin`
    - `withInsertData`
      - all plugins using `editor.insertData` field will be used here
      - it first gets the data with `format`
      - then it pipes `query`
      - then it pipes `transformData`
      - then it calls `getFragment`
      - then it pipes `transformFragment`
      - then it pipes `insertFragment`

  New utils:

  - `@udecode/plate-common` has been merged into this package as both packages were dependencies of the exact same packages.
  - `@udecode/plate-html-serializer` has been merged into this package.
  - `@udecode/plate-ast-serializer` has been merged into this package.
  - `@udecode/plate-serializer` has been merged into this package.
  - `createPlateEditor`: Create a plate editor with:
    - `createEditor` or custom `editor`
    - `withPlate`
    - custom `components`
  - `createPluginFactory`: Create plugin factory with a default plugin.
    - The plugin factory:
      - param 1 `override` can be used to (deeply) override the default plugin.
      - param 2 `overrideByKey` can be used to (deeply) override a nested plugin (in plugin.plugins) by key.
  - `createPlugins`: Creates a new array of plugins by overriding the plugins in the original array.
    - Components can be overridden by key using `components` in the second param.
    - Any other properties can be overridden by key using `overrideByKey` in the second param.
  - `findHtmlParentElement`
  - `flattenDeepPlugins`: Recursively merge `plugin.plugins` into `editor.plugins` and `editor.pluginsByKey`
  - `mergeDeepPlugins`: Recursively merge nested plugins into the root plugins.
  - `getInjectedPlugins`:
    - Get all plugins having a defined `inject.pluginsByKey[plugin.key]`.
    - It includes `plugin` itself.
  - `getPluginInjectProps`
  - `getPluginOptions`
  - `getPluginsByKey`
  - `mockPlugin`
  - `overridePluginsByKey`: Recursive deep merge of each plugin from `overrideByKey` into plugin with same key (`plugin` > `plugin.plugins`).
  - `pipeInsertDataQuery`
  - `pipeInsertFragment`
  - `pipeTransformData`
  - `pipeTransformFragment`
  - `setDefaultPlugin`
  - `setPlatePlugins`: Flatten deep plugins then set editor.plugins and editor.pluginsByKey
  - `deserializeHtmlNodeChildren`
  - `isHtmlComment`
  - `isHtmlElement`
  - `isHtmlText`
  - `pluginDeserializeHtml`

  New selectors:

  - `usePlateKey`

  New types:

  - `HotkeyPlugin` – `hotkey`
  - `ToggleMarkPlugin` – `hotkey`, `mark`
  - `OverrideByKey`
  - `WithPlatePlugin`:
    - `PlatePlugin` with required `type`, `options`, `inject` and `editor`.
    - `Plate` will create default values if not defined.

  Extended types:

  - `PlateEditor`:
    - `plugins`: list of the editor plugins
    - `pluginsByKey`: map of the editor plugins
  - `PlateState`:
    - `keyPlugins`: A key that is incremented on each `editor.plugins` change.
    - `keySelection`: A key that is incremented on each `editor.selection` change.
  - `WithPlateOptions`:
    - `disableCorePlugins`
      - disable core plugins if you'd prefer to have more control over the plugins order.

## 7.0.2

### Patch Changes

- [#1205](https://github.com/udecode/plate/pull/1205) by [@zbeyens](https://github.com/zbeyens) – fix: removed editor and plugins from DefaultLeaf span attributes

## 7.0.1

### Patch Changes

- [#1201](https://github.com/udecode/plate/pull/1201) by [@zbeyens](https://github.com/zbeyens) – fix: plugin `options.type` default value was not set

## 7.0.0

### Major Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –
  - renamed:
    - `SPEditor` to `PEditor` (note that `PlateEditor` is the new default)
    - `SPRenderNodeProps` to `PlateRenderNodeProps`
    - `SPRenderElementProps` to `PlateRenderElementProps`
    - `SPRenderLeafProps` to `PlateRenderLeafProps`
    - `useEventEditorId` to `usePlateEventId`
    - `useStoreEditorOptions` to `usePlateOptions`
    - `useStoreEditorRef` to `usePlateEditorRef`
    - `useStoreEditorSelection` to `usePlateSelection`
    - `useStoreEditorState` to `usePlateEditorState`
    - `useStoreEditorValue` to `usePlateValue`
    - `useStoreEnabled` to `usePlateEnabled`
    - `useStorePlate` to `usePlatePlugins`
    - `useStorePlatePluginKeys` to `usePlateKeys`
    - `useStoreState` to `usePlateState`
  - `getPlateId`: Get the last focused editor id, else get the last blurred editor id, else get the first editor id, else `null`
  - `getPlateState`:
    - removed first parameter `state`
    - previously when giving no parameter, it was returning the first editor. Now it's returning the editor with id = `getPlateId()`. It means `useEventEditorId('focus')` is no longer needed for
      - `usePlateEditorRef`
      - `usePlateEditorState`
      - `usePlateX`...

### Minor Changes

- [#1190](https://github.com/udecode/plate/pull/1190) by [@zbeyens](https://github.com/zbeyens) –

  - `getEditableRenderElement`: now uses plugins `injectChildComponent` to wrap `children` (lowest)
  - `getEditableRenderElement`: now uses plugins `injectParentComponent` to wrap `component` (highest)
  - new store selectors:
    - `getPlateEditorRef`
    - `getPlateEnabled`
    - `getPlateKeys`
    - `getPlatePlugins`
    - `getPlateSelection`
    - `getPlateValue`
    - `getPlateEventId`

  Types:

  - `PlatePlugin`, `PlatePluginEditor` new fields:
    - `injectChildComponent`: Inject child component around any node children.
    - `injectParentComponent`: Inject parent component around any node `component`.
    - `overrideProps` supports arrays.
  - `SPRenderNodeProps` new fields:
    - `editor: PlateEditor`
    - `plugins: PlatePlugin`
  - new types:
    - `PlateEditor<T = {}>`: default editor type used in Plate, assuming we all use history and react editors.
    - `InjectComponent`

  ```ts
  type InjectComponent = <T = AnyObject>(
    props: PlateRenderElementProps & T
  ) => RenderFunction<PlateRenderElementProps> | undefined;
  ```

## 6.4.1

### Patch Changes

- [`87b133ce`](https://github.com/udecode/plate/commit/87b133cee230c79eaca7e6afb6e237bbc57f98c2) by [@zbeyens](https://github.com/zbeyens) –
  - slate `DefaultLeaf` does not spread the props to the rendered span so we're using our own `DefaultLeaf` component which does it. It enables us to override the props leaves without having to register a component (e.g. fontColor)

## 6.2.0

### Patch Changes

- [#1173](https://github.com/udecode/plate/pull/1173) by [@zbeyens](https://github.com/zbeyens) – Replace `import * as React` by `import React`

## 6.0.0

### Patch Changes

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – fix: `PlatePluginComponent` type

- [#1154](https://github.com/udecode/plate/pull/1154) by [@zbeyens](https://github.com/zbeyens) – generic type support:

  - `getEditorOptions`
  - `getPlatePluginOptions`
  - `PlatePluginOptions`
  - `PlateOptions`

- [#1150](https://github.com/udecode/plate/pull/1150) by [@jeffsee55](https://github.com/jeffsee55) –
  - Fixes dependencie issue for React<17 users by using the classic `React.createElement` function rather than the newer `jsx-runtime` transform.
  - Per babel docs: https://babeljs.io/docs/en/babel-preset-react#with-a-configuration-file-recommended

## 5.3.1

### Patch Changes

- [#1136](https://github.com/udecode/plate/pull/1136) [`8aec270f`](https://github.com/udecode/plate/commit/8aec270f8b06a3b25b8d7144c2e23b0dc12de118) Thanks [@dylans](https://github.com/dylans)! - allow disabling deserializer by paste target

## 5.3.0

### Minor Changes

- [#1126](https://github.com/udecode/plate/pull/1126) [`7ee21356`](https://github.com/udecode/plate/commit/7ee21356f0a4e67e367232b3dbc9957254a0c11e) Thanks [@zbeyens](https://github.com/zbeyens)! - feat:
  - `PlatePlugin`
    - new field: `overrideProps`
      - Overrides rendered node props (shallow merge).
      - This enables controlling the props of any node component (use cases: indent, align,...).
      - used by `pipeRenderElement` and `pipeRenderLeaf`
  - `getRenderElement` and `getRenderLeaf`:
    - pass the rest of the props to the component
    - `getRenderNodeProps`:
      - computes slate class and `nodeProps`
  - new dependency: `clsx`
  - new types:
    - `OverrideProps`
    - `PlatePluginEditor`
    - `PlatePluginSerialize`
    - `PlatePluginNode`
    - `PlatePluginElement`
    - `PlatePluginLeaf`

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
  - `usePlateEventId`: a new selector. Get the editor id by `event` key.
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
