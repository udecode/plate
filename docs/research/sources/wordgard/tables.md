# Wordgard: tables

## Row, column, merge and split

- **Table commands.** `test/test-table-commands.ts` lines 43-212 at b5ad0d0 pin that row and column insert and delete, plus merge and split, keep span geometry, content order and a valid selection afterwards. Plate's `BaseTablePlugin.insert.spec.tsx`, `.remove.spec.tsx`, `.merge.spec.tsx` and `.delete.spec.tsx`, with `BaseTablePlugin.insert.slow.tsx` and `.merge.slow.tsx`, all under `packages/platejs/src/features/table/lib/`, prove it (report.md:104). Limit: the report cites 'the matching slow suites'; no remove or delete slow suite exists now.

## Malformed table repair

- **Rectangular repair.** `test/test-table-correction.ts` lines 21-45 at b5ad0d0 pin deterministic repair of malformed tables into rectangles, covering short rows, protruding row spans and span collisions. Plate's `packages/platejs/src/features/table/lib/BaseTablePlugin.normalize.spec.tsx` proves missing-cell fill, row-span clamping and collision repair, and `internal/grid.spec.ts` adds generated grid laws (report.md:105). Limit: the report cites lines 313-454, but the spec file now has 401 lines; its 'rectangular table repair' tests start at line 221.

- **Uncovered slots.** `test/test-table-correction.ts` lines 29-45 and `test/test-table-commands.ts` lines 83-145 at b5ad0d0 pin two rules: repair detects an uncovered interior slot under a row span, and row or column deletion leaves the selection inside the surviving table. Plate's grid scan reports every uncovered logical slot (`packages/platejs/src/features/table/lib/internal/grid.ts`), `internal/mutation.ts` repairs those problems, and `BaseTablePlugin.merge.slow.tsx` asserts the surviving selection after row and column deletion (report.md:126, 170). Wordgard issue #60 reported the unreported-gap case (issues.md:68, title only).

## Grid paste

- **Grid paste.** `test/test-table-paste.ts` lines 34-124 at b5ad0d0 pin grid paste: scalar content repeats, matrices expand or clip, the table grows, and merged cells that cross the destination border are split. Plate's `BaseTablePlugin.clipboard.slow.tsx` and `internal/paste.spec.ts` cover these cases. Browser-quality claims still need a Chromium paste run (report.md:106).

- **Merged cells in paste.** Of Wordgard's 13 grid-paste cases (`test/test-table-paste.ts` lines 35-124), Plate maps 9 directly (`BaseTablePlugin.paste.spec.tsx`, `.clipboard.slow.tsx`, `internal/paste.spec.ts`) and adapts 4 cases where a scalar is pasted into a selection that touches a merged cell. Plate never selects part of a merged cell: it selects whole merged cells, expands the selected logical grid, and splits borders in its table-fragment path (report.md:194).
