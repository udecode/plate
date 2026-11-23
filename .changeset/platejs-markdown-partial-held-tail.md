---
'platejs': patch
---

- Show a bold, italic or strikethrough run that has not closed yet in a `partial` `parse`, `parseSlice` or `parseInline` preview styled as it will read once it closes, and hide up to three trailing `*`, `_`, `~` or `\` characters in all until the next characters decide them, so a streamed preview no longer shows them as text. A later chunk can take back styling a preview showed
