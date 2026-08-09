---
"@platejs/basic-styles": major
---

Export `TextIndentPluginState` as the complete mutable state contract for
`BaseTextIndentPlugin`.

- Move line-height and alignment mutations to plugin-owned
  `editor.update.*.set` commands, use `editor.update.nodes.set` and `unset` for
  text indentation, and expose typed `clear` updates for foreground and
  background colors
- Register validated font, alignment, indentation, and line-height properties
  with schema-owned persisted keys
- Decode and encode style properties through schema-inferred
  `codecs: ({ defineCodecs }) =>
  defineCodecs({ 'text/html': ... })` constructor declarations

**Migration:** Replace `setAlign(editor, value)` with
`editor.update.textAlign.set(value)` and `setLineHeight(editor, value)` with
`editor.update.lineHeight.set(value)`. Text alignment persists under
`textAlign`; configure style targets through `targetPlugins`.
