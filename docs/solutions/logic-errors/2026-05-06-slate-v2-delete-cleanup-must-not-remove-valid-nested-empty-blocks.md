---
title: Slate v2 delete cleanup must not remove valid nested empty blocks
date: 2026-05-06
category: docs/solutions/logic-errors
module: slate-v2 core delete
problem_type: logic_error
component: tooling
symptoms:
  - Backspace at the start of the paragraph after a table removed the empty top-left table cell.
  - The rendered table became ragged with row cell counts like [3, 4, 4].
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, delete, backspace, tables, nested-blocks, browser-proof]
---

# Slate v2 delete cleanup must not remove valid nested empty blocks

## Problem

Backspace at the start of a block after a table merged the trailing paragraph away, then corrupted the table shape by deleting a valid empty table cell.

## Symptoms

- The first table row lost its empty leading cell.
- Browser output showed a ragged table even though the table model should keep four cells in every row.
- The core model reproduced the bug with row lengths `[3, 4, 4]`.

## What Didn't Work

- Treating this as table rendering would miss the root cause. The bad DOM was a faithful render of a corrupted model.
- Treating the collapsed Backspace range as the only bug was incomplete. The range merge moved the paragraph away, but the cell disappeared in the later cleanup pass.

## Solution

Keep `removeEmptyStructuralArtifacts` from deleting nested block elements.

The bad cleanup scanned the entire document and removed any empty single-child element. That is too broad: empty nested blocks can be valid model structure, especially table cells.

```ts
const isNestedBlock =
  NodeApi.isElement(node) &&
  path.length > 1 &&
  EditorApi.isBlock(editor, node)

if (isNestedBlock) {
  return
}
```

The regression belongs in both layers:

- core delete contract: Backspace after a table keeps row lengths `[4, 4, 4]`;
- browser table example: pressing Backspace from the after-table paragraph keeps the rendered row cell counts `[4, 4, 4]`.

## Why This Works

The cleanup helper is allowed to remove transient empty structural artifacts from a delete operation. It is not allowed to globally decide that every empty nested block is garbage.

Table cells, nested list items, quotes, and similar structures can be empty by design. Skipping nested blocks keeps cleanup focused on safe top-level artifacts while preserving valid nested document structure.

## Prevention

- When delete/merge cleanup touches nested structures, assert shape, not only text.
- For table regressions, assert row cell counts in the browser. Text-only checks miss ragged table corruption.
- Be suspicious of whole-document cleanup passes after transforms. They should prove they only remove artifacts created by the current operation.

## Related Issues

- [Slate v2 cross-block delete should reuse the merge seam](2026-04-07-slate-v2-collapsed-cross-block-delete-should-reuse-merge-seam.md)
- [Table selection helpers must track row transitions and cell-derived table paths](2026-03-24-table-selection-helpers-must-track-row-transitions-and-cell-derived-table-paths.md)
