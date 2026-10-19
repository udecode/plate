---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove `useIndentButton` and `useOutdentButton`. Toolbar components call the plugin's `increase` and `decrease` updates directly.

Export `IndentPluginState` as the complete mutable state contract for `BaseIndentPlugin`.

Move indent commands to `editor.update.indent` and register validated non-negative-integer indentation properties in compiled schemas under each plugin name.

**Migration:** Replace `indent` and `outdent` with `editor.update.indent.increase` and `editor.update.indent.decrease`. Replace `setIndent` with one of them, or with `editor.update.nodes.set({ indent })` for any other level. Replace its `setNodesProps` and `unsetNodesProps` options with `tx.nodes.set` and `tx.nodes.unset` calls in the same `editor.update((tx) => …)`. Configure indent targets through the plugin's top-level `targetPlugins` field.
