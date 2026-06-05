---
'@platejs/docx-io': minor
---

Forward two dropped options in `exportToDocx`:

- **`pageSize`** — the html-to-docx engine accepts a page size, but `exportToDocx` only forwarded `margins` and `orientation`, so the document was always the default (US Letter). You can now pass e.g. `pageSize: { width: 11906, height: 16838 }` to export A4.
- **`fontFamily`** — it was only applied to the serialized HTML (and only when an `EditorStaticComponent` was provided), so the document default font was never set and Word fell back to Times New Roman. It now also sets the document default font (`documentOptions.font`).
