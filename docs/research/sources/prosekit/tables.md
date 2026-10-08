# ProseKit: tables

## Table commands

- **Table grid.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/table.test.ts` (L49-L258) pins that selecting cells through the handles, inserting a column before, deleting a column, clearing a row and dragging a row or a column to reorder keep a valid table grid. Plate's table specs under `packages/platejs/src/features/table/lib/` cover insertion, deletion, selection and the grid, and `BaseTablePlugin.transfer.spec.ts` there reorders rows through transfer landing. A search of Plate's table feature found no column reorder on 2026-10-08 (inferred from that search) (`docs/editor-test-harvester/prosekit/report.md:144`).
