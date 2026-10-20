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
- Remove `FontWeightPlugin`, `BaseFontWeightPlugin`, `toUnitLess` and the `fontWeight` plugin key. `BoldPlugin` owns font weight. Pasted HTML with a `font-weight` of 600 or more stores `bold`, `bolder` and `lighter` count from the parent's weight, a weight below 600 turns bold off only inside text drawn bold, and `<b>` or `<strong>` with a stated weight below 600 pastes plain. On the server, `platejs/html/server` ignores a weight written in a `font` shorthand, under `FONT-WEIGHT` or beside a comment
- Leave out a pasted text value that equals its property's omitted default, such as `bold: false`, when one property owns that key
- Make `migrateV54` refuse a document that would not fit the target schema with every pending v53 suggestion rejected

**Migration:** Replace `setAlign(editor, value)` with `editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with `editor.update.lineHeight.set(value)`. Call `clear()` where code set the default value to remove a style, and remove `defaultNodeValue` and `validNodeValues` from kit configuration. Text alignment persists under `textAlign`; configure style targets through `targetPlugins`.

Remove `FontWeightPlugin` from plugin lists. A saved `fontWeight` text property fails to load in a schema that does not declare one. Declare your own `fontWeight` text property, or convert saved weights to `bold` before `migrateDocument`, as the Document Model guide's Saved font weights section shows.
