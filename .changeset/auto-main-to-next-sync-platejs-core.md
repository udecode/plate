---
"@platejs/core": patch
---

- Delete selected block voids without merging following content into them
- Expose plugin-owned one-shot command groups through `editor.plugin(Plugin).update`
- Preserve editor extension state types through `toPlatePlugin`
- Declare plugin element behavior, marks, properties, and targeted content roots through plugin `schema` contributions compiled by Plite
- Publish Plate schema installation and an empty primary-root default as one atomic extension migration
- Register parser plugins as pure schema-bound Plite DOM host codecs that return immutable slices
- Project trusted DOM properties explicitly through `render.nodeProps`; remove plugin host attribute allowlists and automatic model-property mirroring
- Initialize Plate from a primary-root value or complete `EditorDocumentValue`, emit the complete document from `onValueChange`, and render typed interactive or static content-root slots
- Publish bundled declaration entrypoints with complete type dependencies that
  resolve under NodeNext
- Resolve navigation, normalization, and input-rule targets against the active transaction draft
