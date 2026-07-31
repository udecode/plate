---
"platejs": major
---

- Expose the Plite-backed Plate editor and plugin model, including
  `editor.read`, `editor.update`, plugin `name`, top-level serialized `type`, compiled
  `schema.element` and `schema.mark`, plugin `initialState`, an editor-local
  plugin `store`, and
  inferred plugin-owned `editor.api[pluginName]` and `editor.update` groups;
  exact generic code uses `editor.plugin(Plugin)` as the sole imperative plugin
  lookup, while dynamic names resolve through `editor.plugin(name).type`; declare Plite
  capabilities and every prefixless lifecycle/DOM event directly under root
  `on`, without a nested `extension` or separate `handlers` field
- Infer one exact plugin definition from each object factory, use
  `DefinitionOf<typeof Plugin>` for descriptor contracts, and keep undeclared
  fields absent from the inferred plugin type
- Keep object `initialState` beside store-dependent fields; stage factory
  `initialState` before those fields in a following `.extend()`
- Export pure schema and plugin builders from `platejs`, React components and
  hooks from `platejs/react`, and `renderStaticHtml` from `platejs/static`
- Initialize editors synchronously through `initialValue` or
  `({ editor }) => Value`, observe edits through `onCommit`, use strict
  `useEditor`, and use nullable `useActiveEditor`
- Accept a primary-root value or complete `EditorDocumentValue`, emit the
  complete document through Plate `onValueChange`, and render typed interactive
  or static content-root slots
- Defer initialization with `skipInitialization: true`, then publish the loaded
  document with one `editor.update.value.replace({ children })` call; plugin
  document-input transforms run before schema fitting
- Delete `@platejs/autoformat`; declare input rules on the feature plugins that
  own the resulting behavior
- Delete `@platejs/caption`; non-void media elements own direct inline caption
  children, while Plate UI media components render caption and asset-focus
  states
- Compose required plugin capabilities through `dependencies`; include optional
  capabilities and presets directly in consumer plugin arrays
- Remove recursive child mutation, root-plugin callbacks, topology-capable
  foreign-plugin patches, and the parallel global plugin enablement map; keep
  configuration-only weak peers for package plugins that cannot control the
  editor kit
- Declare bidirectional product formats and HTML node, mark, and property
  mappings through a context-bound constructor
  `codecs: ({ defineCodecs }) => defineCodecs(...)` declaration; keep
  whole-input HTML `query`,
  `transformData`, and `transformFragment` hooks directly under `parsers.html`

**Migration:** Replace `value` with synchronous `initialValue`, move async
loading before editor construction, replace `useEditorRef` with `useEditor`,
replace `serializeHtml` with `renderStaticHtml`, and replace autoformat rules
with feature-owned `inputRules`. Replace plugin `key` with `name`, flatten
native Plite fields from `extension`, and move every lifecycle or DOM callback
to prefixless `on` names such as `commit`, `keyDown`, and `paste`. Remove
the `PluginConfig` family (`AnyPluginConfig`, `SlatePluginConfig`, and
`PlatePluginConfig`) and `InferConfig` usage. Remove
`@platejs/caption` imports and caption
plugin registration, then store and render captions as the media element's
direct children. Configure imported plugin descriptors in the ordinary array.
Use `override.plugins[pluginName]` only for package-owned adaptation of an
already-installed foreign peer. Declare HTML node, mark, and property mappings
through `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })`, and
put whole-input HTML hooks directly under `parsers.html`.

For deferred loading:

```tsx
const editor = createPlateEditor({ plugins, skipInitialization: true });
const children = await loadDocument();

editor.update.value.replace({ children });
```
