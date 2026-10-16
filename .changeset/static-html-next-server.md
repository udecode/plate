---
'platejs': patch
---

Fix `renderStaticHtml` and `exportDocx` in Next.js server code, where Next's webpack build replaces the edge renderer's `renderToStaticMarkup` with a function that throws.
