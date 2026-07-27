---
"@platejs/core": patch
---

- Delete selected block voids without merging following content into them
- Expose plugin-owned one-shot command groups through `editor.plugin(Plugin).update`
- Check optional descriptor installation through `editor.plugin(Plugin).installed`
- Infer plugin transaction groups in `createRuleFactory(plugin)`
- Preserve editor extension state types through `toPlatePlugin`
- Declare plugin element behavior, marks, properties, and targeted content roots through plugin `schema` contributions compiled by Plite
- Publish Plate schema installation and an empty primary-root default as one atomic extension migration
- Author MIME-keyed product codecs through context-bound
  constructor `codecs: ({ defineCodecs }) => defineCodecs(...)`
  declarations; infer same-plugin APIs in that callback and compile them to
  schema-bound exact-slice Plite DOM codecs
- Author schema-inferred bidirectional HTML codecs through
  `codecs: ({ defineCodecs }) =>
  defineCodecs({ 'text/html': ... })` for elements, marks, and targeted
  properties
- Project trusted DOM properties explicitly through `render.nodeProps`; remove plugin host attribute allowlists and automatic model-property mirroring
- Initialize Plate from a primary-root value or complete `EditorDocumentValue`, emit the complete document from `onValueChange`, and render typed interactive or static content-root slots
- Publish bundled declaration entrypoints with complete type dependencies that
  resolve under NodeNext
- Resolve navigation, normalization, and input-rule targets against the active transaction draft
- Own the default Plate placeholder presentation above Plite's structural DOM
