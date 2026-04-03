# Issue 4798 Plan

## Goal

Fix GitHub issue `#4798` so toggling the left border for a multi-row table selection updates every selected cell on the left edge of the selection, not only the topmost cell.

## Source of Truth

- Issue: `https://github.com/udecode/plate/issues/4798`
- Title: `Table: Left border toggle affects only topmost cell in multi-row selection`
- Labels: `bug`, `plugin:table`
- Reported version: `52.0.8`
- Browser surface: docs table demo on `https://platejs.org/docs/table`

## Likely Scope

- `packages/table/src/react/components/TableCellElement/getOnSelectTableBorderFactory.ts`
- `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx`
- Browser verification on the table docs/demo surface if the change is code-complete

## Phases

| Phase | Status | Notes |
| --- | --- | --- |
| Fetch issue and prior learnings | complete | Issue fetched; learnings search started |
| Inspect code and existing tests | complete | Root cause is in border writes interacting with active table-cell selection |
| Reproduce and write failing test | complete | Added integration coverage for multi-row left-border toggling |
| Implement fix | complete | `withTableCellSelection` now skips its `setNodes` override for unselected path targets, and the border command no longer clears selection as a workaround |
| Verify tests and browser | complete | Targeted tests, install, build, typecheck, lint passed; browser verification confirmed the real local docs demo and real multi-cell selection state, but border-toggle UI automation remains partial |

## Root Cause

- The bug is not stale cell references.
- `setSelectedCellsBorder` writes left-border changes onto adjacent cells via `setBorderSize(... { at: leftCellPath, border: 'right' })`.
- While a multi-cell selection is active, `withTableCellSelection.tsx` overrides `editor.tf.setNodes` using the broader linear Slate selection as a proxy for selected-cell membership.
- For the lower adjacent cell in a multi-row selection, that proxy returns true even though the cell is not itself selected.
- Result: the path-targeted adjacent-cell write is intercepted by the selection override and effectively turned into a no-op.
- Long-term fix: make `withTableCellSelection` only override targeted writes when `options.at` actually points into one of the selected cells.

## Progress Log

- Loaded `task`, `planning-with-files`, `learnings-researcher`, `reproduce-bug`, and `tdd`.
- Re-fetched issue `#4798`.
- Identified likely implementation file and existing spec file.
- Added `packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx`.
- Confirmed regression shape:
  - first-column multi-row left toggle already works
  - non-first-column multi-row left toggle failed before the fix
- Confirmed direct `setBorderSize` writes to adjacent cells work outside the active multi-cell selection override.
- Replaced the border-command workaround with a plugin-level fix in `withTableCellSelection.tsx`.
- Added a selection-override regression spec for path-targeted writes into non-selected cells that still fall inside the broader Slate range.
- Removed `withoutActiveSelection(...)` from `getOnSelectTableBorderFactory.ts` after the plugin-layer fix made it unnecessary.
- Updated the existing internal solution doc to reflect the new long-term seam fix instead of the old workaround.
- Added a patch changeset for `@platejs/table`.
- Added an internal solution doc for the selection-override root cause.

## Verification

- Passed:
  - `pnpm --filter @platejs/table test packages/table/src/lib/withTableCellSelection.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/table`
  - `pnpm turbo typecheck --filter=./packages/table`
  - `pnpm lint:fix`
- Browser:
  - Connected to the persistent debug Chrome and verified the real local docs page at `http://localhost:3000/docs/table`.
  - Reached the live editor instance through the React tree, set a real multi-cell selection on the table demo, and confirmed the DOM reflected the expected two selected cells.
  - Saved fresh browser proof at `~/.dev-browser/tmp/issue-4798-longterm-selection.png`.
  - The exact border-toggle dropdown path was still not reliably automatable in-browser, so final behavior proof remains strongest in the new selection-override regression plus the border integration regression.
