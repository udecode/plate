---
'@udecode/plate-core': major
---

Breaking changes:

### `Plate`

- removed `components` prop:
```tsx
// Before
<Plate plugins={plugins} components={components} />

// After
// option 1: use the plugin factory
let plugins = [
  createParagraphPlugin({
    component: ParagraphElement,
  })
];

// option 2: use createPlugins
plugins = createPlugins(plugins, { 
  components: {
    [ELEMENT_PARAGRAPH]: ParagraphElement
  }
});

<Plate plugins={plugins} />
```

- removed `options` prop:
```tsx
// Before
<Plate plugins={plugins} options={options} />

// After
// option 1: use the plugin factory
let plugins = [
  createParagraphPlugin({
    type: 'paragraph',
  })
];

// option 2: use createPlugins
plugins = createPlugins(plugins, { 
  overrideByKey: {
    [ELEMENT_PARAGRAPH]: {
      type: 'paragraph',
    }
  }
});

<Plate plugins={plugins} />
```

### `PlatePlugin`

- `key`
  - replacing `pluginKey`
  - is now required: each plugin needs a key to be retrieved by key.
- all handlers have `plugin` as a second parameter:
```tsx
// Before
export type X<T = {}> = (
  editor: PlateEditor<T>,
) => Y

// After
export type X<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
) => Y
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
onDrop: handler
  
// After
handlers: {
  onDrop: handler
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
