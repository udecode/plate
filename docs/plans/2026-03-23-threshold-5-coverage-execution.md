# Threshold 5 Coverage Execution

## Goal

Execute every current non-React file with coverage score `>= 5` from the refreshed threshold map, without turning this into another package hop program.

## Scope

### Table query lane

- `getTableCellBorders.ts`
- `getTableCellSize.ts`
- `getTableEntries.ts`
- `getCellInNextTableRow.ts`
- `getCellInPreviousTableRow.ts`
- `getPreviousTableCell.ts`
- `getNextTableCell.ts`
- `getTableColumnIndex.ts`

### Table transform lane

- `deleteRow.ts`
- `deleteTable.ts`
- `deleteColumn.ts` deeper branch coverage
- `setTableMarginLeft.ts`
- `moveSelectionFromCell.ts`
- `overrideSelectionFromCell.ts`

### Table helper lane

- `merge/deleteRow.ts`
- `withSetFragmentDataTable.ts`

### Threshold leftovers outside table

- `packages/docx-io/src/lib/internal/utils/image-dimensions.ts`
- `packages/list-classic/src/lib/transforms/moveListSiblingsAfterCursor.ts`

## Test Shape

- Pure helper tests for deterministic table queries and `image-dimensions`
- Thin editor contract tests for table transforms and list-classic movement
- No `/react`
- No browser
- No broad smoke tests

## Implementation Notes

- Group table navigation queries into one adjacent spec file if that keeps fixtures smaller.
- Reuse existing table hyperscript + `getTestTablePlugins(...)` patterns.
- Prefer focused branch tests over exhaustive table matrices.
- If a direct spec exposes a real runtime bug, fix the smallest seam and keep going.

## Verification

1. Run targeted `bun test` on touched specs.
2. Run `bun test packages/table/src packages/docx-io/src/lib/internal/utils packages/list-classic/src/lib/transforms`.
3. Run `pnpm test:profile -- --top 25 packages/table/src packages/docx-io/src packages/list-classic/src`.
4. Run `pnpm test:slowest -- --top 25 packages/table/src packages/docx-io/src packages/list-classic/src`.
5. Run `pnpm install`.
6. Run `pnpm turbo build --filter=./packages/table --filter=./packages/docx-io --filter=./packages/list-classic`.
7. Run `pnpm turbo typecheck --filter=./packages/table --filter=./packages/docx-io --filter=./packages/list-classic`.
8. Run `pnpm lint:fix`.

## Done Means

- Every current threshold-5 file has direct, honest coverage.
- Fast-lane budget stays green.
- Remaining uncovered files are below the chosen threshold or explicitly deferred on value grounds.
