# Coverage Batch: depset + table + leaves

## Goal

Cover the next user-approved non-React batch from the 2026-03-24 coverage map:

- `@udecode/depset`
- `table`
- `caption`
- `callout`
- `excalidraw`
- `cursor`

Keep it in the fast lane. Add only honest unit or editor-contract specs.

## Scope

### `@udecode/depset`

- `get-package-manager.ts`
- `logger.ts`
- `handle-error.ts`
- `spinner.ts`

### `table`

- `merge/getSelectionWidth.ts`
- `withTable.ts`
- `merge/deleteRow.ts`
- `queries/getSelectedCells.ts`
- `merge/getTableGridByRange.ts`
- `merge/isTableRectangular.ts`
- `merge/splitTableCell.ts`
- `transforms/moveSelectionFromCell.ts`
- `queries/getSelectedCellsBorders.ts`
- `queries/getTableRowIndex.ts`

### leaf packages

- `caption/withCaption.ts`
- `callout/transforms/insertCallout.ts`
- `excalidraw/transforms/insertExcalidraw.ts`
- `cursor/queries/getSelectionRects.ts`
- if cheap and still honest, also `cursor/queries/getCaretPosition.ts` and `cursor/queries/getCursorOverlayState.ts`

## Constraints

- no `/react`
- no smoke-only wrapper tests
- fix runtime bugs only if new direct tests prove them

## Verification

1. targeted `bun test` on all touched specs
2. `bun test` for touched packages
3. `pnpm install`
4. `pnpm turbo build --filter=./packages/table --filter=./packages/caption --filter=./packages/callout --filter=./packages/excalidraw --filter=./packages/cursor --filter=./packages/udecode/depset`
5. `pnpm turbo typecheck --filter=./packages/table --filter=./packages/caption --filter=./packages/callout --filter=./packages/excalidraw --filter=./packages/cursor --filter=./packages/udecode/depset`
6. `pnpm lint:fix`

## Findings

- Existing direct helper coverage already fixed one table ancestor-guard bug on 2026-03-23. New table specs should prefer direct deterministic helpers again instead of only high-level transforms.
- Cursor is DOM-ish but the user explicitly asked for it. Keep it to the query helper seam only.
