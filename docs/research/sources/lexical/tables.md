# Lexical: tables

## Table paste

- **Table paste rows.** `TablesHTMLCopyAndPaste.spec.mjs` pastes tables copied from:
  - Google Docs, with multi-paragraph cells and 11pt text;
  - Google Docs with custom column widths in `<col>` and `<colgroup>`;
  - Quip, where a `b<br>b` cell keeps its line break;
  - Google Sheets.

  It also merges a pasted grid into an existing table, pastes nested block and inline HTML into cells, and fills merged cells, unequal rows and an empty row. The width, merge, rowspan and colspan rows are table-model decisions, not HTML-parser rules. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:180-186`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row topics only, not rerun.

## Table tests

- **Table tests rest on the table-selection model.** Lexical's table behavior is tested in:
  - `Tables.spec.mjs`: whole-table, range, merge and rowspan selection;
  - playground regressions #4661 (insert a column under a table selection), #4697 (repeat a table selection), #4872 (merge cells across a full row span), #4876 (unmerge a cell), #6870 (left-arrow table selection) and #7266 (merged cells in a column header), each a file named after its issue under `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/regression/`;
  - `lexical-table` unit tests for `TableCellNode`, `TableNode`, `TableRowNode`, `TableSelection` (#2558), `TableUtils`, `TablePlugin`, `TableExtension` and `TableMobileSelection`.

  All of it depends on Lexical's table-cell selection and merge model, so a port goes through a table-selection owner, never a generic selection test, and the mobile file needs touch proof on a device, not a desktop viewport. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:824-833`, `:88-89`, `:877-878`, `:881`; every named file exists at dd5c41b1. Limit: the regression topics come from file names and the ledger's notes, not from their assertions.
