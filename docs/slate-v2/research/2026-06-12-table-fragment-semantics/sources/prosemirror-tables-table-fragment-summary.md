---
title: ProseMirror tables table-fragment summary
type: source
status: partial
updated: 2026-06-12
source_refs:
  - ../../../../../docs/research/raw/2026-06-12-table-fragment-semantics/README.md
---

# ProseMirror Tables Table-Fragment Summary

Source checked locally at `/Users/zbeyens/git/prosemirror-tables`.

Useful anchors:

- `src/copypaste.ts:1-11`: states the table copy/paste model.
- `src/copypaste.ts:38-78`: extracts row/cell/header-cell slices into cell areas.
- `src/copypaste.ts:83-107`: makes pasted cell rows rectangular.
- `src/copypaste.ts:122-179`: clips/repeats the pasted area to destination size.
- `src/copypaste.ts:235-383`: grows destination tables, isolates span-crossing
  boundaries, replaces rows, and leaves a cell selection.
- `src/cellselection.ts:104-180`: serializes selected cells as a rectangular row
  slice and clips edge-crossing spans.
- `src/input.ts:129-170`: routes paste differently for cell selections versus
  normal cell insertion.
- `test/copypaste.test.ts:31-262`: executable coverage for rectangular padding,
  clipping, table growth, header preservation, span splitting, and width
  preservation.

Slate translation:

Do not hard-copy ProseMirror APIs. Keep the invariant shape:

- table fragments have an explicit grid/rectangle owner;
- selected cells serialize as a normalized cell-area fragment;
- cell-selection paste is size-aware;
- collapsed-cell paste inserts source cells starting at that cell;
- spans crossing replacement boundaries are split or explicitly rejected by
  policy;
- target selection after paste is part of the contract.

