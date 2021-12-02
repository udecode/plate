# @udecode/plate-core

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
    /**
     * List of HTML attribute names to store their values in `node.attributes`.
     */
    attributeNames?: string[];

    /**
     * Deserialize an element.
     * Use this instead of plugin.isElement if you don't want the plugin to renderElement.
     * @default plugin.isElement
     */
    isElement?: boolean;

    /**
     * Deserialize a leaf.
     * Use this instead of plugin.isLeaf if you don't want the plugin to renderLeaf.
     * @default plugin.isLeaf
     */
    isLeaf?: boolean;

    /**
     * Deserialize html element to slate node.
     */
    getNode?: (element: HTMLElement) => AnyObject | undefined;

    query?: (element: HTMLElement) => boolean;

    /**
     * Deserialize an element:
     * - if this option (string) is in the element attribute names.
     * - if this option (object) values match the element attributes.
     */
    validAttribute?: string | { [key: string]: string | string[] };

    /**
     * Valid element `className`.
     */
    validClassName?: string;

    /**
     * Valid element `nodeName`.
     * Set '*' to allow any node name.
     */
    validNodeName?: string | string[];

    /**
     * Valid element style values.
     * Can be a list of string (only one match is needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string | string[] | undefined>
    >;

    /**
     * Whether or not to include deserialized children on this node
     */
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
         * Format to get data. Example data types are text/plain and text/uri-list.
         */
        format?: string;

        /**
         * Query to skip this plugin.
         */
        query?: (options: PlatePluginInsertDataOptions) => boolean;

        /**
         * Deserialize data to fragment
         */
        getFragment?: (
          options: PlatePluginInsertDataOptions
        ) => TDescendant[] | undefined;

        // injected

        /**
         * Function called on `editor.insertData` just before `editor.insertFragment`.
         * Default: if the block above the selection is empty and the first fragment node type is not inline,
         * set the selected node type to the first fragment node type.
         * @return if true, the next handlers will be skipped.
         */
        preInsert?: (
          fragment: TDescendant[],
          options: PlatePluginInsertDataOptions
        ) => HandlerReturnType;

        /**
         * Transform the inserted data.
         */
        transformData?: (
          data: string,
          options: { dataTransfer: DataTransfer }
        ) => string;

        /**
         * Transform the fragment to insert.
         */
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
       * Any plugin can use this field to inject code into a stack.
       * For example, if multiple plugins have defined
       * `inject.editor.insertData.transformData` for `key=KEY_DESERIALIZE_HTML`,
       * `insertData` plugin will call all of these `transformData` for `KEY_DESERIALIZE_HTML` plugin.
       * Differs from `overrideByKey` as this is not overriding any plugin.
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
     * Recursive plugin merging.
     * Can be used to derive plugin fields from `editor`, `plugin`.
     * The returned value will be deeply merged to the plugin.
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
