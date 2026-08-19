---
"@platejs/indent": major
---

Require React and React DOM 19.2 or newer.

Remove `useIndentButton` and `useOutdentButton`. Toolbar components call the
plugin's `increase` and `decrease` updates directly.

Export `IndentPluginState` as the complete mutable state contract for
`BaseIndentPlugin`.

Move indent commands to `editor.update.indent` and register validated
non-negative-integer indentation properties in compiled schemas under each
plugin name.

**Migration:** Replace `setIndent`, `indent`, and `outdent` with
`editor.update.indent.change`, `editor.update.indent.increase`, and
`editor.update.indent.decrease`. Configure indent targets through the plugin's
top-level `targetPlugins` field.
