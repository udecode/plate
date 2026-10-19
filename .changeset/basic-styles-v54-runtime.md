---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Export `TextIndentPluginState` as the complete mutable state contract for `BaseTextIndentPlugin`.

- Move line-height, alignment and text-indent mutations to plugin-owned `editor.update.lineHeight`, `editor.update.textAlign` and `editor.update.textIndent` commands. `set(value, options?)` stores the value on the plugin's target blocks, and `clear(options?)` removes it.
- Expose typed `clear` updates for foreground and background colors
- Register validated font, alignment, indentation, and line-height properties with schema-owned persisted keys
- Restrict `textAlign` to `start`, `left`, `center`, `right`, `end`, or `justify`
- Draw every stored style value. Remove `defaultNodeValue` and `validNodeValues` from `inject.nodeProps`, and the defaults that hid line height `1.5`, alignment `start` and font color `black`
- Decode and encode style properties through schema-inferred `formats: ({ defineFormats }) => defineFormats({ html: ... })` constructor declarations

**Migration:** Replace `setAlign(editor, value)` with `editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with `editor.update.lineHeight.set(value)`. Call `clear()` where code set the default value to remove a style, and remove `defaultNodeValue` and `validNodeValues` from kit configuration. Text alignment persists under `textAlign`; configure style targets through `targetPlugins`.
