---
"@platejs/docx-io": major
---

Move `DocxExportPlugin` transactions to `editor.update` and remove the `DocumentMargins` and `HtmlToDocxOptions` aliases

```tsx
// Before
editor.tf.docxExport.exportAndDownload('document');

// After
editor.update.docxExport.exportAndDownload('document');
```

Use `Margins` and `DocumentOptions` for HTML-to-DOCX options.
