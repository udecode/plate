---
"@platejs/docx-io": patch
---

- Add `footerHtml` and `pageNumber` to `exportToDocx`, `exportEditorToDocx`, `editor.api.docxExport.exportToBlob` and `editor.tf.docxExport.exportAndDownload` to write a footer with page numbers.
- Fix `htmlToDocxBlob` ignoring `pageNumber` unless `footer: true` was passed, and accept `footerHtml`; pass `footer: false` to write no footer.
