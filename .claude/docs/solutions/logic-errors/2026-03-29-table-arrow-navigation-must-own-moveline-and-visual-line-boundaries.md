---
title: Table arrow navigation must own moveLine and visual line boundaries
type: solution
date: 2026-03-29
status: completed
category: logic-errors
module: table
tags:
  - table
  - selection
  - keyboard
  - caret
  - timing
  - soft-break
  - soft-wrap
  - dom
  - tests
---

# Problem

Plain `ArrowUp` and `ArrowDown` table navigation had two related failures.

- Cross-cell movement could briefly render the native caret in the old cell before the final selection landed in the target cell.
- Wrapped cell content could jump across cells too early, before the caret had exhausted vertical movement inside the current visual line stack.

This showed up both in structural multi-block cells and in single-block cells with soft breaks or browser wrapping.

# Root Cause

The table plugin was not fully owning plain vertical arrow movement at the `moveLine` seam.

That left two gaps:

- Browser default caret motion could paint an intermediate frame before table code repaired the final selection.
- Slate block structure alone could not tell whether a single paragraph was already on its visual first or last line.

So the transform knew too little about timing and too little about visual layout.

# Solution

Handle collapsed table-cell `ArrowUp` and `ArrowDown` directly in `withTable.moveLine(...)`, and only move across cells when the caret is truly at the visual edge of the current cell.

- Override `withTable.moveLine(...)` for collapsed selections inside table cells.
- Keep the fast path that stays native while there is another block in the same cell.
- For wrapped single-block content, build a collapsed DOM range for the caret and a DOM range for the current block.
- Compare caret rects against the first or last block rect to detect the visual boundary.
- Call `moveSelectionFromCell(...)` only after the caret reaches the visual first line for `ArrowUp` or the visual last line for `ArrowDown`.
- Return `true` when table code handles the movement so the shared React keydown handler prevents browser default motion.

The implementation lives in [withTable.ts](/Users/hyeongjin/Workspace/plate/packages/table/src/lib/withTable.ts).

# Why This Works

The browser already knows how to move a caret between visual lines inside one DOM block. The table plugin only needs to take over once that native move is exhausted.

Owning the `moveLine` seam removes the transient flash because the browser default move never gets a chance to paint first. Checking DOM rects removes the early cross-cell jump because the transform can finally see visual line boundaries that Slate paths cannot represent.

# Prevention

- If a plugin owns keyboard navigation semantics, intercept the ownership seam first. Do not rely on later selection repair for plain arrow movement.
- If movement depends on visual line layout, Slate path checks are not enough. Use DOM range geometry at the transform seam.
- Keep regression coverage at both levels:
  - synchronous plain-arrow cross-cell movement
  - multi-block cells that should stay native until the next or previous block boundary
  - soft-break cells that should stay native until the last visual line
  - soft-wrapped single-block cells that should stay native until the first or last visual line
- Preserve a conservative fallback when DOM range data is unavailable so non-DOM execution does not throw.
