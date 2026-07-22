---
"@platejs/indent": major
---

Move indent commands to `editor.update.indent` and register indentation
properties in compiled schemas.

**Migration:** Replace `setIndent`, `indent`, and `outdent` with
`editor.update.indent.set`, `editor.update.indent.increase`, and
`editor.update.indent.decrease`. Configure indent targets through the plugin's
top-level `targetPluginKeys` field.
