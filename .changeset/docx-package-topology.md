---
'platejs': major
---

Require `platejs@>=54.0.0-beta.1` as a peer dependency.

Require React and React DOM 19.2 or newer.

Use `platejs/docx` for DOCX paste, file import, and export. Applications compose the descriptors they need in their own plugin arrays.

Install a focused package when the editor needs only one direction:

- `DocxPastePlugin`, `cleanWordHtml`, and `isWordHtml` own Word clipboard normalization.
- `DocxImportPlugin` owns `.docx` file decoding.
- `DocxExportPlugin`, `exportToDocx`, `downloadDocx`, and the low-level HTML-to-DOCX helpers own DOCX generation.

Replace `DocxPlugin` with `DocxPastePlugin`. Replace `DocxIOPlugin` with the direction-specific `DocxImportPlugin` and `DocxExportPlugin`. Replace `cleanDocx` and `isDocxContent` with `cleanWordHtml` and `isWordHtml`.
