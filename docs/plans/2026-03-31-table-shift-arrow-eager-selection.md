# Table Shift Arrow Eager Selection

## Goal

Remove the transient native text-range flash when `Shift+Arrow` expands from one table cell into another.

## Plan

- [completed] Add keydown-level regression coverage for eager single-cell `Shift+Arrow`.
- [completed] Route single-cell `Shift+Arrow` through table-owned selection movement before native selection applies.
- [completed] Remove `withApplyTable` repair behavior and delete `overrideSelectionFromCell`.
- [completed] Update coverage and docs to reflect keydown-only ownership.
- [completed] Run focused tests, package build, typecheck, lint.

## Findings

- Multi-cell `Shift+Arrow` already goes through `onKeyDownTable`.
- Single-cell cross-cell expansion still waits for `set_selection` and `setTimeout`, which causes visible flash.
- The quick fix is to take ownership in `onKeyDownTable` for the one-cell boundary-crossing case too.
- `overrideSelectionFromCell` is now a redundant apply-time fallback unless a real non-keydown caller still depends on it.

## Progress

- Created plan for eager single-cell `Shift+Arrow` interception.
- Added `onKeyDownTable` coverage for eager single-cell `Shift+Down` and `Shift+Right`.
- Extracted the visual-line boundary check into a shared helper so plain arrows and shifted arrows use the same vertical edge rule.
- Routed one-cell cross-cell `Shift+Arrow` through `onKeyDownTable` before native selection applies.
- Removed the apply-time fallback and deleted `overrideSelectionFromCell` plus its dedicated tests.
- Added a package changeset and a solution doc for the timing seam.
- Follow-up refactor: extracted shared single-cell table movement context and adjacent-block checks used by both `moveLine` and `onKeyDownTable`.
- Follow-up tests: added `Shift+Up`, `Shift+Left`, and multi-cell `Shift+Right` keydown coverage.

## Verification

- `bun test packages/table/src/react/onKeyDownTable.spec.tsx`
- `bun test packages/table/src/react/onKeyDownTable.spec.tsx packages/table/src/lib/withApplyTable.spec.ts packages/table/src/lib/withTable.spec.tsx packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx`
- `pnpm install`
- `pnpm turbo build --filter=./packages/table`
- `pnpm turbo typecheck --filter=./packages/table`
- `pnpm lint:fix`
- `bun test packages/table/src/react/onKeyDownTable.spec.tsx`
- `bun test packages/table/src/lib/withTable.spec.tsx packages/table/src/lib/transforms/shouldMoveSelectionFromCell.spec.ts packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx packages/table/src/lib/withApplyTable.spec.ts`
