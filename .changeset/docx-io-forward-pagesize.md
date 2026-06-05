---
'@platejs/docx-io': minor
---

Add a `pageSize` option to `exportToDocx`. The underlying html-to-docx engine already accepts a page size, but `exportToDocx` only forwarded `margins` and `orientation`, so the exported document was always the default (US Letter). You can now pass e.g. `pageSize: { width: 11906, height: 16838 }` to export A4.
