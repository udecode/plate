---
'@platejs/docx-io': minor
---

Add DOCX import/export package:

**Import:**
- `importDocx`: Convert DOCX files to Plate nodes with comment extraction

**Export:**
- `exportToDocx`: Convert Plate content to DOCX blob
- `downloadDocx`: Download DOCX files
- `exportEditorToDocx`: Export and download in one call
- `DocxExportPlugin`: Plugin with `editor.api.docxExport` and `editor.tf.docxExport` methods
- `DOCX_EXPORT_STYLES`: Default CSS styles for Word rendering

**DOCX Static Components** (in existing static files):
- `CalloutElementDocx`
- `CodeBlockElementDocx`, `CodeLineElementDocx`, `CodeSyntaxLeafDocx`
- `ColumnElementDocx`, `ColumnGroupElementDocx`
- `EquationElementDocx`, `InlineEquationElementDocx`
- `TocElementDocx`
