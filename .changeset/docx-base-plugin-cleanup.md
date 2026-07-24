---
"@platejs/docx": major
---

Remove unused DOCX list-conversion utilities and avoid repeated RTF image parsing during import

Project DOCX parser customizations through the parser-only `inject.parsers`
contract.

**Migration:** Remove direct imports of `cleanDocxListElementsToList`, `docxListToList`, `getDocxListNode`, and `isDocxOl`; `DocxPlugin` handles DOCX list import.
