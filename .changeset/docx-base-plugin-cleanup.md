---
"@platejs/docx": major
---

Remove unused DOCX list-conversion utilities and avoid repeated RTF image parsing during import

**Migration:** Remove direct imports of `cleanDocxListElementsToList`, `docxListToList`, `getDocxListNode`, and `isDocxOl`; `DocxPlugin` handles DOCX list import.
