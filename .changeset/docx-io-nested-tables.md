---
"@platejs/docx-io": patch
---

- Fix tables nested in table cells missing from the exported DOCX.
- Fix invalid DOCX output for a table cell that holds only a skipped image, such as a WebP.
