---
module: Table
date: 2026-03-30
problem_type: logic_error
component: editor_queries
symptoms:
  - "Toggling the top border below a merged cell updated the wrong cell in the row above"
  - "Adjacent-cell table queries treated visual neighbors like raw sibling indexes after colSpan or rowSpan"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - table
  - borders
  - merge
  - queries
  - adjacent-cells
  - selection
---

# Table adjacent-cell queries must resolve visual neighbors

## Problem

Table border toggles broke once merged cells changed the visual grid.

Selecting a cell below a `colSpan` merge and toggling its top border wrote to the wrong cell in the row above, because the helper treated "cell above" as "same sibling index in the previous row."

## What Didn't Work

- Raw path math like `PathApi.previous(...)` and `[row - 1, cellIndex]`
- Assuming table child order still matched visual column positions after merges

## Solution

Move adjacent-cell ownership into a shared query helper that resolves neighbors by visual table coordinates, not raw sibling position.

`getAdjacentTableCell(...)` now:

- resolves the current cell, row, and table with `getTableEntries(...)`
- reads the current visual row and column with `getCellIndices(...)`
- finds the real adjacent cell with `findCellByIndexes(...)`
- reconstructs the actual Slate path with `getCellPath(...)`

`getTopTableCell(...)` and `getLeftTableCell(...)` both delegate to that helper.

## Why This Works

Merged cells split visual position from tree sibling position.

Once a cell spans extra columns or rows, the neighbor you want is "the cell covering visual row X / col Y," not "the previous sibling" or "the child at the same index in another row."

`findCellByIndexes(...)` already understands spans, so reusing it at the query seam fixes border toggles without teaching every caller how merged layouts work.

## Verification

These checks passed:

```bash
pnpm --filter @platejs/table test packages/table/src/lib/queries/getTopTableCell.spec.tsx packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/table
pnpm turbo typecheck --filter=./packages/table
pnpm lint:fix
```

The new coverage proves both layers:

- `getTopTableCell.spec.tsx` proves merged columns resolve the spanning cell above
- `setSelectedCellsBorder.integration.spec.tsx` proves the top-border toggle updates the spanning neighbor instead of the wrong sibling

## Prevention

- Table neighbor helpers must resolve visual coordinates, not sibling indexes
- When merges are involved, keep one seam-level helper spec and one user-flow integration spec
- If a caller wants "adjacent cell," fix the query helper first instead of patching each transform

## Related Issues

- `#4111`
- `.claude/docs/solutions/logic-errors/2026-03-29-table-border-toggle-must-clear-active-cell-selection-before-adjacent-cell-writes.md`
