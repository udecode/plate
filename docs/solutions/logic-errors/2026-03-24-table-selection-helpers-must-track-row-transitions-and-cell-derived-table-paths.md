---
module: Table
date: 2026-03-24
problem_type: logic_error
component: editor_queries
symptoms:
  - "Selection-width math undercounted cells after crossing into a new table row"
  - "Grid-by-range helpers could derive the wrong table path from a text-leaf selection path"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - table
  - selection
  - queries
  - merge
  - testing
  - coverage
---

# Table selection helpers must track row transitions and cell-derived table paths

## Problem

Direct table helper coverage exposed two quiet bugs in the selection layer.

`getSelectionWidth(...)` dropped the first cell when the selected area crossed into a new row.

`getTableGridByRange(...)` could derive the table path from the raw selection anchor path, which is too deep when the range lives on text leaves.

Both bugs were easy to miss because common single-row and simple range cases still looked fine.

## Root cause

`getSelectionWidth(...)` reset `total` to `0` on row change before continuing, so the first cell in the new row never got counted.

`getTableGridByRange(...)` used `at.anchor.path.slice(0, -2)` to find the table entry. That assumes the incoming range path shape already points at the cell layer. For real text selections, it often points deeper.

## Fix

For width counting:

- compute the current cell span once
- when the row changes, set `total` to that span instead of `0`

For grid lookup:

- derive the table path from the resolved start-cell entry path
- then slice that cell path up to the table, instead of slicing the raw range path blindly

## Verification

These checks passed:

```bash
bun test packages/table/src
pnpm test:profile -- --top 20 packages/table/src
pnpm test:slowest -- --top 20 packages/table/src
pnpm turbo build --filter=./packages/table
pnpm turbo typecheck --filter=./packages/table
```

## Prevention

For table helpers, keep direct deterministic specs alongside transform coverage.

When selection code climbs through table structure, resolve from real node entries first. Raw Slate paths are shape-dependent and will happily lie to you.
