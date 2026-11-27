---
'platejs': patch
---

- Fix `editor.plugin(BlockquotePlugin).update.untab()` and Shift+Tab lifting the wrong paragraphs when a blockquote selection spans ten or more children or crosses nested blockquotes.
