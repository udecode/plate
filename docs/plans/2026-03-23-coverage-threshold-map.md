---
title: Coverage Threshold Map
type: testing
date: 2026-03-23
status: completed
---

# Coverage Threshold Map

## Goal

Run fresh repo coverage, sync it against the March 6, 9, and 17 plans plus the March 22-23 execution passes, then pick a threshold that batches the remaining worthwhile non-React test work instead of dribbling out one tiny package at a time.

## Coverage Run

- Command:
  - `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-23b --reporter=dots`
- Result:
  - `2599 pass`
  - `0 fail`
  - `478 files`
  - `3.35s`
- Artifact:
  - [/Users/zbeyens/git/plate/.coverage-repo-2026-03-23b/lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-23b/lcov.info)

## Scoring Rules

- Scope is `packages/*/src/**`.
- File score is `0-10`.
- `/react`, test files, barrels, and type-only files score `0`.
- High scores go to deterministic transforms, queries, parser/serializer helpers, and real plugin contracts.
- Recent March 17 and March 22-23 passes are penalized on purpose so finished lanes do not keep resurfacing.
- Anti-cosplay penalty: files with only a couple uncovered lines get pushed down even if they sit in a good folder.
- Package score is the sum of the top 8 file scores in that package.

## Threshold Take

- Strict threshold: `score >= 6`
  - Yields `13` files across `1` packages.
  - This is the honest high-value batch.
- Wider threshold: `score >= 5`
  - Yields `18` files across `3` packages.
  - This is the biggest batch I would still defend without calling it coverage cosplay.

Strong take: use `>= 6` if you want the cleanest value bar. Use `>= 5` only if you explicitly want to finish the table program plus the last two borderline deterministic leftovers.

## Above Threshold 6

### `table`

- Package score: `64`
- [packages/table/src/lib/transforms/deleteRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/deleteRow.ts) `10`
- [packages/table/src/lib/transforms/deleteTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/deleteTable.ts) `9`
- [packages/table/src/lib/queries/getTableCellBorders.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getTableCellBorders.ts) `8`
- [packages/table/src/lib/queries/getTableCellSize.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getTableCellSize.ts) `8`
- [packages/table/src/lib/queries/getTableEntries.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getTableEntries.ts) `8`
- [packages/table/src/lib/merge/deleteRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/merge/deleteRow.ts) `7`
- [packages/table/src/lib/queries/getCellInNextTableRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getCellInNextTableRow.ts) `7`
- [packages/table/src/lib/queries/getCellInPreviousTableRow.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getCellInPreviousTableRow.ts) `7`
- [packages/table/src/lib/queries/getPreviousTableCell.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getPreviousTableCell.ts) `7`
- [packages/table/src/lib/queries/getTableColumnIndex.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getTableColumnIndex.ts) `7`
- [packages/table/src/lib/transforms/setTableMarginLeft.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/setTableMarginLeft.ts) `7`
- [packages/table/src/lib/queries/getNextTableCell.ts](/Users/zbeyens/git/plate/packages/table/src/lib/queries/getNextTableCell.ts) `6`
- [packages/table/src/lib/transforms/moveSelectionFromCell.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/moveSelectionFromCell.ts) `6`

## Threshold 5 Extensions

These are the only score-5 files I would still defend after the strict cut:

- [packages/docx-io/src/lib/internal/utils/image-dimensions.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/utils/image-dimensions.ts) `5`
- [packages/list-classic/src/lib/transforms/moveListSiblingsAfterCursor.ts](/Users/zbeyens/git/plate/packages/list-classic/src/lib/transforms/moveListSiblingsAfterCursor.ts) `5`
- [packages/table/src/lib/transforms/deleteColumn.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/deleteColumn.ts) `5`
- [packages/table/src/lib/transforms/overrideSelectionFromCell.ts](/Users/zbeyens/git/plate/packages/table/src/lib/transforms/overrideSelectionFromCell.ts) `5`
- [packages/table/src/lib/withSetFragmentDataTable.ts](/Users/zbeyens/git/plate/packages/table/src/lib/withSetFragmentDataTable.ts) `5`

## Package Ranking Snapshot

| Rank | Package | Score | `>=6` files | `>=5` files |
| --- | --- | ---: | ---: | ---: |
| 1 | `table` | 64 | 13 | 16 |
| 2 | `core` | 17 | 0 | 0 |
| 3 | `list-classic` | 10 | 0 | 1 |
| 4 | `docx` | 9 | 0 | 0 |
| 5 | `docx-io` | 7 | 0 | 1 |
| 6 | `media` | 5 | 0 | 0 |
| 7 | `markdown` | 5 | 0 | 0 |
| 8 | `mention` | 4 | 0 | 0 |
| 9 | `selection` | 4 | 0 | 0 |
| 10 | `diff` | 4 | 0 | 0 |
| 11 | `list` | 3 | 0 | 0 |
| 12 | `code-drawing` | 2 | 0 | 0 |
| 13 | `basic-nodes` | 2 | 0 | 0 |
| 14 | `suggestion` | 2 | 0 | 0 |
| 15 | `dnd` | 1 | 0 | 0 |

## What This Means

- `table` is the only remaining package with a real cluster of above-threshold non-React work.
- Everything else is either already substantially covered, recently swept, or down to a couple borderline seams.
- If you want bigger tasks, stop hopping packages and do the whole above-threshold `table` lane as one program.
- After the strict `table` batch, only two extra files still clear the wider bar: one `docx-io` util and one `list-classic` transform.

## Full Data

- [/Users/zbeyens/git/plate/docs/plans/2026-03-23-coverage-threshold-packages.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-23-coverage-threshold-packages.tsv)
- [/Users/zbeyens/git/plate/docs/plans/2026-03-23-coverage-threshold-files.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-23-coverage-threshold-files.tsv)
