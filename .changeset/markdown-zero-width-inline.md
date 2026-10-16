---
"@platejs/markdown": patch
---

- Stop serializing the empty text around inline elements (links, mentions, footnote references) as a zero-width space. Only an empty paragraph is written as `​` now, so Markdown output no longer carries invisible characters at the start or end of a paragraph.
