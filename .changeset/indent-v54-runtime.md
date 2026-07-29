---
"@platejs/indent": major
---

Export `IndentPluginState` as the complete mutable state contract for
`BaseIndentPlugin`.

Move indent commands to `editor.update.indent` and register validated
indentation properties in compiled schemas under each resolved plugin type.
Keep indentation parsing, blockquote checks, runtime proof, and the indent /
outdent hook family with their owning plugin and hook modules.

**Migration:** Replace `setIndent`, `indent`, and `outdent` with
`editor.update.indent.set`, `editor.update.indent.increase`, and
`editor.update.indent.decrease`. Configure indent targets through the plugin's
top-level `targetPluginKeys` field.
