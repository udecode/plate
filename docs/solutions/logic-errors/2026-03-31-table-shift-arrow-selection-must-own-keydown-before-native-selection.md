---
module: Table
date: 2026-03-31
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Shift+Arrow from one table cell into another briefly showed a native text range before cell selection took over"
  - "Cross-cell Shift+Down and Shift+Right felt delayed even though the final cell selection was correct"
root_cause: async_timing
resolution_type: code_fix
severity: medium
tags:
  - table
  - selection
  - keyboard
  - shift-arrow
  - timing
  - keydown
  - slate
---

# Table Shift+Arrow selection must own keydown before native selection

## Problem

Single-cell `Shift+Arrow` expansion across table cell boundaries produced the correct final cell selection, but only after a visible intermediate native range.

The flash was most obvious on `Shift+Down` and `Shift+Right`, where the browser first painted a normal text selection and table code repaired it one tick later.

## Root cause

Table selection only owned multi-cell `Shift+Arrow` at keydown time.

The one-cell case relied on apply-time repair after native selection had already moved once, which produced a visible intermediate text range.

## Fix

Take ownership of the one-cell boundary-crossing case in `onKeyDownTable` before native selection applies, and remove the apply-time repair path.

- Keep the existing eager multi-cell `Shift+Arrow` path.
- Add a one-cell path that checks whether the moving focus edge is about to leave the current cell.
- For `Shift+Up` and `Shift+Down`, reuse the same visual-line boundary logic as plain `moveLine`.
- For `Shift+Left` and `Shift+Right`, only intercept when the focus is already at the cell start or end.
- When the boundary test passes, call `moveSelectionFromCell(..., { fromOneCell: true })` immediately and prevent the native event.
- Delete `overrideSelectionFromCell` and stop calling it from `withApplyTable`.

That moves the ownership seam fully to keydown-time interception.

## Verification

These checks passed:

```bash
bun test packages/table/src/react/onKeyDownTable.spec.tsx packages/table/src/lib/withApplyTable.spec.ts packages/table/src/lib/withTable.spec.tsx packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/table
pnpm turbo typecheck --filter=./packages/table
pnpm lint:fix
```

The new coverage proves:

- `onKeyDownTable.spec.tsx` eagerly expands `Shift+Down` and `Shift+Right` from one cell into the adjacent cell
- `onKeyDownTable.spec.tsx` keeps `Shift+Down` native while the focus can still move within the current multi-block cell

## Prevention

If a keyboard interaction should never show an intermediate native selection state, do not repair it later in `apply`.

Own it at the keydown seam instead of carrying a second repair path that can drift from the real behavior.

When plain-arrow and shifted-arrow movement share the same visual boundary rule, put that boundary check in one helper so the two seams cannot drift.

## Related Issues

- Related learning: [2026-03-29-table-arrow-navigation-must-own-moveline-and-visual-line-boundaries.md](/Users/hyeongjin/Workspace/plate/docs/solutions/logic-errors/2026-03-29-table-arrow-navigation-must-own-moveline-and-visual-line-boundaries.md)
