# Phase 4 Table Execution

## Goal

Complete the phase-4 `table` slice only. Add high-ROI non-React logic coverage for merge-heavy table behavior plus the remaining small sizing and selection helpers in `packages/table/src/lib`.

## Checklist

- [completed] Audit table merge and transform seams plus current test helpers
- [completed] Add merge-focused table lib specs
- [completed] Add size and selection helper specs
- [completed] Fix any real runtime bug exposed by the new specs
- [completed] Run table package verification
- [completed] Record learnings and final results

## Findings

- Existing `table` coverage is decent on insert/basic-query seams but still light on the merge cluster that carries the real branchy behavior.
- The highest-value uncovered behaviors are:
  - `mergeTableCells`
  - `splitTableCell`
  - `deleteRowWhenExpanded`
  - `deleteColumnWhenExpanded`
  - `setTableColSize`
  - `setTableRowSize`
  - `moveSelectionFromCell`
- `deleteRowWhenExpanded` only removes rows when the expanded selection spans the full row width of the first selected row.
- `deleteColumnWhenExpanded` only removes a column when the expanded selection spans both the first and last table rows.

## Progress

- Re-read the phase-4 plan, `task.mdc`, `testing.mdc`, and `tdd`.
- Audited current table lib specs, helper placement, and merge-path wrappers.
- Probed live merge/delete/selection behavior with temporary Bun scripts to pin the actual public contracts before adding specs.
- Added a merge-focused lib spec cluster that covers:
  - `mergeTableCells`
  - `splitTableCell`
  - `deleteRowWhenExpanded`
  - `deleteColumnWhenExpanded`
- Added a size/selection helper cluster that covers:
  - `setTableColSize`
  - `setTableRowSize`
  - `moveSelectionFromCell`
- Tightened the collapsed-selection fixture in `moveSelectionFromCell` so it proves real movement from `21` to `22` instead of accidentally passing with the selection already at the destination.

## Verification

- `bun test packages/table/src/lib/merge/tableMergeBehavior.spec.tsx packages/table/src/lib/transforms/tableSelectionAndSizing.spec.tsx`
- `bun test packages/table/src/lib`
- `bun run test:slowest -- --top 15 packages/table/src/lib`
- `pnpm install`
- `pnpm turbo build --filter=./packages/table`
  - failed outside table scope when turbo pulled `@platejs/resizable`
  - error: `rolldown` on Node `20.12.1` calling `node:util.styleText` with `['underline', 'gray']`
- `pnpm turbo typecheck --filter=./packages/table`
- `pnpm lint:fix`

## Learnings

- `package reality`: `deleteRowWhenExpanded` is narrower than its name sounds. It only deletes rows when the expanded selection covers the full width of the first selected row.
- `package reality`: `deleteColumnWhenExpanded` only deletes a column when the expanded selection spans the first and last rows of the table.
- `package reality`: `splitTableCell` owns missing-row creation, so the honest split test is the row-creation branch, not only the easy “fill an existing row” path.
- `verification blocker`: package build is still blocked outside the slice by the same external `rolldown` + Node `20.12.1` `styleText` failure, here reached through `@platejs/resizable`.
