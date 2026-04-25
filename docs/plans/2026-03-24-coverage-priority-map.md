# Coverage Priority Refresh

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24a/lcov.info)
- Constraints: exclude `/react`, ignore coverage vanity, score only real non-React unit-test seams under `packages/**/src/**`.
- Scoring signals: seam type, uncovered lines, coverage ratio, recent completed passes, package signal penalty.

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24a --reporter=dots`
- Result: `2643 pass`, `0 fail`, `493 files`, `2.45s`

## Take

- Strong take: `score >= 6` is the honest next batch.
- `score >= 5` is the wider batch if you want one more sweep before rerunning coverage again.
- After excluding `/react`, the real remaining value is concentrated in `@udecode/depset` and `table`. Everything after that is smaller leaf work or recently-covered leftovers.

## Threshold Counts

- `score >= 8`: `1` files
- `score >= 7`: `8` files
- `score >= 6`: `9` files
- `score >= 5`: `18` files
- `score >= 4`: `32` files
- `score >= 3`: `50` files
- `score >= 2`: `78` files
- `score >= 1`: `127` files

## Packages By Value

1. `udecode/depset` — priority `444`, top file `10`, files `>=6`: `4`, files `>=5`: `4`
2. `table` — priority `210`, top file `7`, files `>=6`: `1`, files `>=5`: `10`
3. `cursor` — priority `111`, top file `7`, files `>=6`: `1`, files `>=5`: `1`
4. `caption` — priority `111`, top file `7`, files `>=6`: `1`, files `>=5`: `1`
5. `callout` — priority `111`, top file `7`, files `>=6`: `1`, files `>=5`: `1`
6. `excalidraw` — priority `111`, top file `7`, files `>=6`: `1`, files `>=5`: `1`

## Strict Batch (`score >= 6`)

- [get-package-manager.ts](packages/udecode/depset/src/utils/get-package-manager.ts) — `udecode/depset`, score `10`, coverage `0.0%`, uncovered `30`
- [withCaption.ts](packages/caption/src/lib/withCaption.ts) — `caption`, score `7`, coverage `0.0%`, uncovered `67`
- [getSelectionRects.ts](packages/cursor/src/queries/getSelectionRects.ts) — `cursor`, score `7`, coverage `0.0%`, uncovered `60`
- [logger.ts](packages/udecode/depset/src/utils/logger.ts) — `udecode/depset`, score `7`, coverage `0.0%`, uncovered `27`
- [getSelectionWidth.ts](packages/table/src/lib/merge/getSelectionWidth.ts) — `table`, score `7`, coverage `7.4%`, uncovered `25`
- [insertCallout.ts](packages/callout/src/lib/transforms/insertCallout.ts) — `callout`, score `7`, coverage `0.0%`, uncovered `24`
- [insertExcalidraw.ts](packages/excalidraw/src/lib/transforms/insertExcalidraw.ts) — `excalidraw`, score `7`, coverage `0.0%`, uncovered `21`
- [handle-error.ts](packages/udecode/depset/src/utils/handle-error.ts) — `udecode/depset`, score `7`, coverage `0.0%`, uncovered `21`
- [spinner.ts](packages/udecode/depset/src/utils/spinner.ts) — `udecode/depset`, score `6`, coverage `0.0%`, uncovered `12`

## Wider Batch (`score >= 5`)

- [get-package-manager.ts](packages/udecode/depset/src/utils/get-package-manager.ts) — `udecode/depset`, score `10`
- [withCaption.ts](packages/caption/src/lib/withCaption.ts) — `caption`, score `7`
- [getSelectionRects.ts](packages/cursor/src/queries/getSelectionRects.ts) — `cursor`, score `7`
- [logger.ts](packages/udecode/depset/src/utils/logger.ts) — `udecode/depset`, score `7`
- [getSelectionWidth.ts](packages/table/src/lib/merge/getSelectionWidth.ts) — `table`, score `7`
- [insertCallout.ts](packages/callout/src/lib/transforms/insertCallout.ts) — `callout`, score `7`
- [insertExcalidraw.ts](packages/excalidraw/src/lib/transforms/insertExcalidraw.ts) — `excalidraw`, score `7`
- [handle-error.ts](packages/udecode/depset/src/utils/handle-error.ts) — `udecode/depset`, score `7`
- [spinner.ts](packages/udecode/depset/src/utils/spinner.ts) — `udecode/depset`, score `6`
- [withTable.ts](packages/table/src/lib/withTable.ts) — `table`, score `5`
- [deleteRow.ts](packages/table/src/lib/merge/deleteRow.ts) — `table`, score `5`
- [getSelectedCells.ts](packages/table/src/lib/queries/getSelectedCells.ts) — `table`, score `5`
- [getTableGridByRange.ts](packages/table/src/lib/merge/getTableGridByRange.ts) — `table`, score `5`
- [isTableRectangular.ts](packages/table/src/lib/merge/isTableRectangular.ts) — `table`, score `5`
- [splitTableCell.ts](packages/table/src/lib/merge/splitTableCell.ts) — `table`, score `5`
- [moveSelectionFromCell.ts](packages/table/src/lib/transforms/moveSelectionFromCell.ts) — `table`, score `5`
- [getSelectedCellsBorders.ts](packages/table/src/lib/queries/getSelectedCellsBorders.ts) — `table`, score `5`
- [getTableRowIndex.ts](packages/table/src/lib/queries/getTableRowIndex.ts) — `table`, score `5`

## Notes

- Recent March 22-24 passes were explicitly penalized so the ranking does not keep resurfacing already-swept packages.
- `/react` files were excluded, not merely ranked lower.
- The TSV outputs contain the full package matrix and the full file matrix for exact triage.
