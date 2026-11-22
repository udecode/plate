---
'platejs': patch
---

- Fix Backspace on a heading's last character turning the heading into a paragraph. The empty heading now stays, and the next Backspace turns it into a paragraph. A forward delete that empties a heading keeps it too.
- Fix Turn into Quote, the blockquote shortcut and `editor.plugin(BlockquotePlugin).update.wrap()` putting each selected block in its own blockquote. Adjacent selected blocks now share one blockquote.
