---
"@platejs/basic-styles": major
---

- Move style mutations to plugin-owned `editor.update.*.set` commands
- Register font, alignment, indentation, and line-height properties in compiled schemas

**Migration:** Replace `setAlign(editor, value)` with
`editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with
`editor.update.lineHeight.set(value)`. Configure style targets through the
plugin's top-level `targetPluginKeys` field.
