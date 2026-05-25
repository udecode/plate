---
title: Slate positions must group character navigation by text-block boundaries
date: 2026-04-27
category: docs/solutions/logic-errors
module: slate-v2 core editor positions
problem_type: logic_error
component: testing_framework
symptoms:
  - ArrowRight from the first table cell landed in the next cell at offset 1.
  - Editor.after(..., unit: "character") skipped the start point of nested text blocks.
  - Browser selection and model selection agreed on the wrong offset.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate, positions, selection, tables, keyboard, browser-input, navigation]
---

# Slate positions must group character navigation by text-block boundaries

## Problem

`/examples/tables` moved the caret from an empty first cell to offset `1` in
the second cell after `ArrowRight`. The visible browser bug came from the core
position iterator, not from the table example.

## Symptoms

- Clicking the first table cell and pressing `ArrowRight` produced Slate
  selection `[1, 0, 1, 0]@1`.
- The DOM selection also landed inside `"Human"` at offset `1`.
- Legacy behavior lands at the start of the second cell: `[1, 0, 1, 0]@0`.

## What Didn't Work

- Browser-handle-only setup was misleading. A setup that changed only model
  selection could miss the real native focus and DOM-selection path.
- Patching the table example would have hidden the bug. The same position
  grouping rule affects any nested editable text-block family.
- Existing table browser tests covered Backspace, Delete, and Enter, but not
  horizontal character transfer between cells.

## Solution

Teach `packages/slate/src/editor/positions.ts` to group position segments by
the nearest non-inline element that actually owns inline/text content:

```ts
const getTextBlockPath = (editor: Editor, path: Path): Path => {
  for (let depth = path.length - 1; depth > 0; depth--) {
    const candidatePath = path.slice(0, depth) as Path
    const node = Editor.getLiveNode(editor, candidatePath)

    if (
      node &&
      Node.isElement(node) &&
      !Editor.isInline(editor, node) &&
      Editor.hasInlines(editor, node)
    ) {
      return candidatePath
    }
  }

  return path[0] == null ? [] : ([path[0]] as Path)
}
```

Then have `groupPositionSegmentsByBlock(...)` and
`collectBlockBoundaryPoints(...)` compare `segment.groupPath` instead of
assuming `segment.path[0]` is the text-block boundary.

Guard it in two places:

- core contract: `Editor.after(..., { unit: "character" })` across nested
  table-cell text blocks returns the next cell at offset `0`
- browser contract: `/examples/tables` click first cell, press `ArrowRight`,
  assert the selection is `[1, 0, 1, 0]@0`

## Why This Works

Character iteration intentionally avoids yielding the start of every split text
segment inside one text block. That is correct for inline fragments like links
inside a paragraph.

A table is different. Its top-level node contains many independent text-blocks
inside cells. Grouping by `path[0]` flattened the whole table into one logical
text stream, so moving into the next cell skipped that cell's start point and
landed after the first character.

Grouping by the nearest text-block-owning element preserves inline-fragment
behavior inside paragraphs while restoring block-boundary starts for nested
structures.

## Prevention

- Add core navigation contracts for nested text-block boundaries, not only
  top-level paragraph transitions.
- Browser tests for table keyboard behavior must include horizontal movement
  between cells, not only structural keys inside one cell.
- For browser-visible selection regressions, assert both Slate selection and
  DOM selection after a real click/key sequence.

## Related Issues

- [Slate v2 before/after should reuse mixed-inline offset projection](./2026-04-07-slate-v2-before-after-should-reuse-mixed-inline-offset-projection.md)
- [Decorated multi-leaf text needs cumulative offset mapping](./2026-04-04-decorated-multi-leaf-text-needs-cumulative-offset-mapping.md)
- [Slate React keydown must import DOM selection before model-owned navigation](../ui-bugs/2026-04-22-slate-react-keydown-must-import-dom-selection-before-model-owned-navigation.md)
