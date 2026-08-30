---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Remove `useCalloutEmojiPicker`. Callout renderers compose `useEmojiPicker` directly with their local popover and node update.

- Insert callouts through the descriptor's standard `editor.plugin(BaseCalloutPlugin).update.insert(props?, nodeOptions?)` update.
- Register callout appearance properties and the materialized `💡` icon default in the compiled schema.
