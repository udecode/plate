---
'platejs': patch
---

- Open Markdown links containing images, such as linked badges, by lifting images out of links and headings with a warning instead of failing the parse.
- Preserve saved carets, comment ranges, and node selections across `migrateV54` profile and AST restructures including legacy media captions, subscript/superscript text, toggles, and degraded dates or mentions.
