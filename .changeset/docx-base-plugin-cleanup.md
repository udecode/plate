---
"@platejs/docx": major
---

- Remove unused DOCX list-conversion utilities
- Keep `DocxPlugin`, `cleanDocx`, and the shared `isDocxContent` query as the
  DOCX package surface; cleaner implementation details stay private to their
  owner
- Remove unused React peer dependencies from the base DOCX package
- Avoid repeated RTF image parsing during import
- Normalize DOCX HTML through the `'text/html'` codec `transformData` hook before
  schema-owned HTML codecs decode nodes and properties
- Normalize presentation fields through the single `tableCell` node type

**Migration:** Remove direct imports of DOCX cleaner internals, including
`cleanDocxBrComments`, `cleanDocxImageElements`, `getDocxIndent`,
`getRtfImagesMap`, and the other former `docx-cleaner/utils` exports. Use
`DocxPlugin` for paste normalization or `cleanDocx` for standalone HTML
cleanup.
