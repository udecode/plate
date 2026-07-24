---
"@platejs/docx-io": major
---

- Expose `DocxExportPlugin` services through `editor.api`
- Remove the `DocumentMargins` and `HtmlToDocxOptions` aliases

```tsx
await editor.api.docxExport.exportAndDownload('document');
```

Use `Margins` and `DocumentOptions` for HTML-to-DOCX options.
