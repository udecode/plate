---
"@platejs/docx-io": major
---

Use `DocxIOPlugin` for editor-aware import and explicit-snapshot export. Keep
download as the standalone `downloadDocx` browser service.

```tsx
const docx = editor.plugin(DocxIOPlugin);
const blob = await docx.api.toBlob(editor.read.children());

downloadDocx(blob, 'document');

const imported = await docx.api.import(arrayBuffer);
```

Use `Margins` and `DocumentOptions` for HTML-to-DOCX options. Remove the
`DocumentMargins`, `HtmlToDocxOptions`, `DocxExportPlugin`,
`exportEditorToDocx`, and root `docxExport` API.
