# @platejs/docx-io

## 52.3.10

### Patch Changes

- [#4897](https://github.com/udecode/plate/pull/4897) by [@zbeyens](https://github.com/zbeyens) – Fix declaration bundling by restoring the workspace `platejs` build edge during package builds

## 52.3.8

### Patch Changes

- [#4891](https://github.com/udecode/plate/pull/4891) by [@zbeyens](https://github.com/zbeyens) –
  - Fix `htmlToDocxBlob` failing TypeScript 6 `BlobPart` checks when wrapping generated `Uint8Array` output.

## 52.3.6

### Patch Changes

- [#4876](https://github.com/udecode/plate/pull/4876) by [@zbeyens](https://github.com/zbeyens) –

  - Fixed Mammoth comment preprocessing so block-level comment text keeps spacing instead of collapsing words together during DOCX import.

- [#4876](https://github.com/udecode/plate/pull/4876) by [@zbeyens](https://github.com/zbeyens) –

  - Fixed `decimal-bracket-end` ordered lists to keep decimal DOCX numbering instead of falling back to the package default ordered style.

- [#4876](https://github.com/udecode/plate/pull/4876) by [@zbeyens](https://github.com/zbeyens) –
  - Fixed HTML-to-DOCX list rendering so whitespace-only nodes around list items no longer drop visible list item text in generated documents.

## 52.2.0

### Minor Changes

- [#4814](https://github.com/udecode/plate/pull/4814) by [@felixfeng33](https://github.com/felixfeng33) – Add DOCX import/export package:

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
