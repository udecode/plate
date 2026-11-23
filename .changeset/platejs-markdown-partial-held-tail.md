---
'platejs': patch
---

- Style an unclosed bold, italic or strikethrough run in a `partial` `parse`, `parseSlice` or `parseInline` preview as it will read once it closes, and hide up to three trailing `*`, `_`, `~` or `\` characters until the next chunk decides them. A later chunk can take back styling a preview showed
