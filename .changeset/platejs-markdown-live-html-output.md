---
'platejs': patch
---

- Fix Markdown export writing document text that a CommonMark or GFM reader runs as HTML or reads as a script link, such as a tag in a details summary, in an equation's TeX or at the start of a footnote. Plate reads the exported file back as the same document.
- Fix copying part of a code block writing its raw text into `text/markdown`. The copied code is now escaped Markdown text.
