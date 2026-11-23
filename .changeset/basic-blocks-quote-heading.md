---
'platejs': patch
---

- Fix Backspace or Delete that empties a heading turning it into a paragraph. The empty heading stays, and the next Backspace turns it into a paragraph.
- Fix Turn into Quote, the blockquote shortcut and `editor.plugin(BlockquotePlugin).update.wrap()` putting each selected block in its own blockquote. Adjacent selected blocks now share one blockquote.
