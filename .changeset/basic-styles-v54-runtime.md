---
"@platejs/basic-styles": major
---

- Move style mutations to plugin-owned `editor.update.*.set` commands
- Register validated font, alignment, indentation, and line-height properties in compiled schemas, using the resolved plugin type as their storage key
- Project dynamic parser configuration through `targetParserToInject`

**Migration:** Replace `setAlign(editor, value)` with
`editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with
`editor.update.lineHeight.set(value)`. Move persisted alignment from
`attributes.align` to the direct `align` element property. Configure a custom
storage key through the plugin's top-level `type`, and configure style targets
through `targetPluginKeys`.
