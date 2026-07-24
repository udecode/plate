---
"@platejs/basic-styles": major
---

- Move style mutations to plugin-owned `editor.update.*.set` commands, with
  typed `clear` updates for foreground and background colors
- Register validated font, alignment, indentation, and line-height properties in compiled schemas, using the resolved plugin type as their storage key
- Decode and encode style properties through schema-inferred
  `.extendHtmlCodec()` contributions

**Migration:** Replace `setAlign(editor, value)` with
`editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with
`editor.update.lineHeight.set(value)`. Configure a custom storage key through
the plugin's top-level `type`, and configure style targets through
`targetPluginKeys`.
