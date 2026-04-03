---
module: Table
date: 2026-03-29
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Toggling the left border for a multi-row selection only updated the topmost selected row"
  - "Selections that needed adjacent-cell border writes skipped lower rows even though the selection itself was correct"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - table
  - borders
  - selection
  - transforms
  - adjacent-cells
  - slate
---

# Table cell selection override must skip unselected path-targeted writes

## Problem

Multi-row table selections could toggle the left border for the first selected row but leave the lower selected rows unchanged.

The bug showed up when the selected cells were not in the first column, because the left-border toggle writes to the adjacent cell on the left by updating that cell's right border.

## Root cause

The bug was not stale cell references and not the border command itself.

`setSelectedCellsBorder` correctly resolved the adjacent left-cell paths. The failure came from `withTableCellSelection`.

While a multi-cell selection was active, its `setNodes` override used the broader linear Slate selection as a proxy for selected-cell membership. That proxy was too wide. In a right-column selection that spanned multiple rows, the lower left-adjacent cell still fell inside the linear Slate range even though it was not one of the selected cells.

The override intercepted that path-targeted write, combined it with a match predicate scoped to selected cells, matched nothing, and still returned `true`. That turned the intended adjacent-cell write into an effective no-op, so only the first row changed.

## Fix

Fix the ownership boundary in `withTableCellSelection` instead of working around it in every caller.

When `options.at` is present, only apply the selection-wide `setNodes` override if that target actually points into one of the selected cells.

```ts
if (options?.at) {
  const cellPaths = matchesCell.map(([, cellPath]) => cellPath);

  if (!isTargetingSelectedCell(editor, options.at, cellPaths)) {
    return;
  }
}
```

That keeps selection-wide transforms working for writes that actually target selected cells, while letting structural neighbor writes fall through to the normal path-targeted transform behavior.

With that fixed at the selection layer, the border command no longer needs to clear and restore `editor.selection` around its mutation batch.

## Verification

These checks passed:

```bash
pnpm --filter @platejs/table test packages/table/src/lib/withTableCellSelection.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.integration.spec.tsx packages/table/src/react/components/TableCellElement/setSelectedCellsBorder.spec.tsx packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/table
pnpm turbo typecheck --filter=./packages/table
pnpm lint:fix
```

The new regression coverage proves both layers:

- `withTableCellSelection.spec.tsx` proves path-targeted writes to unselected cells inside the broader Slate range are no longer hijacked.
- `setSelectedCellsBorder.integration.spec.tsx` proves a multi-row, non-first-column left-border toggle now updates the left-adjacent cells on every selected row.

## Prevention

Do not use the linear Slate selection as a substitute for semantic multi-cell membership.

If a selection plugin overrides `setNodes` or similar transforms, its `options.at` guard must answer the actual ownership question: does this target belong to the selected cells, or is it merely inside the broader linear range?

For future regressions, keep:

- one seam-level test that proves unselected path targets fall through the override
- one integration test that proves the user-facing table border flow still works
