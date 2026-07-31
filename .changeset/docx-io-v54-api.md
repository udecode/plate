---
"@platejs/docx-io": major
---

Use `DocxIOPlugin` for editor-aware import and explicit-snapshot export. Keep
download as the standalone `downloadDocx` browser service.

```tsx
const docx = editor.plugin(DocxIOPlugin);
const blob = await docx.api.toBlob(editor.read.children(), {
  editorPlugins: EditorKit,
  editorStaticComponent: EditorStatic,
});

downloadDocx(blob, 'document');

const imported = await docx.api.import(arrayBuffer);
```

Use `Margins` and `DocumentOptions` for HTML-to-DOCX options. Remove the
`DocumentMargins`, `HtmlToDocxOptions`, `DocxExportPlugin`,
`exportEditorToDocx`, and root `docxExport` API.

Keep DOCX comment types with `DocxIOPlugin`. Each imported comment exposes
`references` as points in `result.nodes`; private import markers never appear
in the returned node snapshot.

Use `editor.plugin(DocxIOPlugin).api.import` as the DOCX import surface. Remove
direct imports of `preprocessMammothHtml`, `extractComments`,
`buildCommentToken`, `getCommentTokenPrefix`, `getCommentTokenSuffix`, and
`PreprocessMammothHtmlResult`. Remove the renderer's circular module dependency.
