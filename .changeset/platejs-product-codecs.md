---
"platejs": major
---

- Expose the Plite-backed Plate editor and plugin model, including
  `editor.read`, `editor.update`, top-level plugin `type`, compiled
  `schema.element` and `schema.mark`, plugin `options`, and
  inferred plugin-owned `editor.api[pluginKey]` and `editor.update` groups;
  exact generic code can use `editor.plugin(Plugin)`
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
with feature-owned `inputRules`. Remove `@platejs/caption` imports and caption
plugin registration, then store and render captions as the media element's
direct children. Configure imported plugin descriptors in the ordinary array.
Use `override.plugins[key]` only for package-owned adaptation of an
already-installed foreign peer. Declare HTML node, mark, and property mappings
through `codecs: ({ defineCodecs }) => defineCodecs({ 'text/html': ... })`, and
put whole-input HTML hooks directly under `parsers.html`.

For deferred loading:

```tsx
const editor = createPlateEditor({ plugins, skipInitialization: true });
const children = await loadDocument();

editor.update.value.replace({ children });
```
