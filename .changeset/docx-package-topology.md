---
"@platejs/docx": major
---

Require React and React DOM 19.2 or newer.

Use `@platejs/docx` as the convenience facade for DOCX paste, file import, and
export. It reexports the public APIs from `@platejs/docx-paste`,
`@platejs/docx-import`, and `@platejs/docx-export`. Applications compose the
descriptors they need in their own plugin arrays.

Install a focused package when the editor needs only one direction:

- `@platejs/docx-paste` owns Word clipboard normalization and exports
  `DocxPastePlugin`, `cleanWordHtml`, and `isWordHtml`.
- `@platejs/docx-import` owns `.docx` file decoding and exports
  `DocxImportPlugin`.
- `@platejs/docx-export` owns DOCX generation and exports `DocxExportPlugin`,
  `exportToDocx`, `downloadDocx`, and the low-level HTML-to-DOCX helpers.

Replace `DocxPlugin` with `DocxPastePlugin`. Replace `DocxIOPlugin` with the
direction-specific `DocxImportPlugin` and `DocxExportPlugin`. Replace
`cleanDocx` and `isDocxContent` with `cleanWordHtml` and `isWordHtml`.
