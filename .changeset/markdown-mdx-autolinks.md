---
"@platejs/markdown": patch
---

Fix email autolinks losing later Markdown content when MDX is configured on Plate's default Markdown parser. Keep ordinary link and image URLs and existing JSX formatting when parsing autolinks.
