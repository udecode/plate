---
title: Inserted table column resize jumps on first move
category: performance-issues
date: 2026-03-17
tags:
  - table
  - resize
  - playground
  - ui-bug
---

## Problem

On the homepage playground, a newly inserted empty table could jump on the first horizontal resize move. Existing demo tables did not show the issue.

## Root Cause

The resize controller read raw `useTableColSizes({ disableOverrides: true })` values. For newly inserted tables without persisted `colSizes`, that hook returns a zero-filled array. The resize math then used `0` as the drag baseline, so the first `pointermove` immediately clamped the active column to `minColumnWidth`.

## Solution

Use effective visual widths in the resize controller instead of raw persisted widths:

- map zero / unset column widths to `TABLE_DEFAULT_COLUMN_WIDTH`
- use those effective widths for:
  - drag start `initialSize`
  - boundary offset math
  - live resize width calculations

This keeps resize behavior aligned with what the user sees, even before a table has explicit `colSizes`.

## Key Change

In [`/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/ui/table-node.tsx`](/Users/felixfeng/Desktop/udecode/plate/apps/www/src/registry/ui/table-node.tsx), `useTableResizeController` now derives `effectiveColSizes` with:

```ts
useTableColSizes({
  disableOverrides: true,
  transformColSizes: (colSizes) =>
    colSizes.map((colSize) => colSize || TABLE_DEFAULT_COLUMN_WIDTH),
});
```

The controller then uses `effectiveColSizesRef` everywhere it previously depended on raw `colSizesRef`.

## Prevention

When table UI depends on geometry, do not drive interaction math from persisted node state alone. New nodes often exist briefly in a partially initialized state. Use the same resolved visual widths for both rendering and interaction math.
