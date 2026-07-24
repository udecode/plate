---
"@platejs/docx": major
---

- Remove unused DOCX list-conversion utilities
- Avoid repeated RTF image parsing during import
- Normalize DOCX HTML through the flat `parsers.html.transformData` hook before
  schema-owned HTML codecs decode nodes and properties

**Migration:** Remove direct imports of `cleanDocxListElementsToList`, `docxListToList`, `getDocxListNode`, and `isDocxOl`; `DocxPlugin` handles DOCX list import.
