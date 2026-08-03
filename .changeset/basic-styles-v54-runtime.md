---
"@platejs/basic-styles": major
---

Export `TextIndentPluginState` as the complete mutable state contract for
`BaseTextIndentPlugin`.

- Move style mutations to plugin-owned `editor.update.*.set` commands, with
  typed `clear` updates for foreground and background colors
- Register validated font, alignment, indentation, and line-height properties
  with schema-owned persisted keys
- Decode and encode style properties through schema-inferred
  `codecs: ({ defineCodecs }) =>
  defineCodecs({ 'text/html': ... })` constructor declarations

**Migration:** Replace `setAlign(editor, value)` with
`editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with
`editor.update.lineHeight.set(value)`. Text alignment persists under
`textAlign`; configure style targets through `targetPlugins`.
