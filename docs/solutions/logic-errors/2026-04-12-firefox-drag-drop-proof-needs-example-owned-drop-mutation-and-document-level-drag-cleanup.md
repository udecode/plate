---
date: 2026-04-12
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Firefox drag drop proof needs example-owned drop mutation and document-level drag cleanup
tags:
  - slate-react
  - slate-browser
  - firefox
  - drag-drop
  - dragend
  - drop
severity: high
---

# Firefox drag drop proof needs example-owned drop mutation and document-level drag cleanup

## What happened

The first Firefox drag/drop row looked green on paper and red in reality.

We added generic drag handlers to `Editable` and a new `drag-drop-cleanup`
example, then tried to reorder void cards with a plain Playwright `dragTo`.

The first attempt crashed during `dragstart`.
After that fix, the crash disappeared, but the order still never changed.

That split the problem into two different truths:

- the generic drag lifecycle inside `Editable` mattered
- the proof row still needed an example that owned an actual drop mutation

Without the second part, the test was poking browser drag events but not
proving the legacy Firefox case we cared about.

## What fixed it

Two changes made the row honest:

1. `Editable` stopped routing `dragstart` back through `findPath(node)` and
   resolved the dragged path from the DOM node directly.
2. The example owned the reorder on drop:
   - `onDragStart` wrote a card id into `dataTransfer`
   - `onDragOver` allowed drop on the explicit zone paragraphs
   - `onDrop` replaced the top-level editor children to reorder the cards and
     called `preventDefault()`

That last detail is the point of the row.
When the example short-circuits the internal drop handler, the document-level
`dragend` / `drop` cleanup in `Editable` still has to clear internal drag
state after the dragged node unmounts.

The proof is the second drag:

1. drag card A after card B
2. let the first drop unmount and remount the dragged structure
3. drag card A back before card B
4. assert both orders succeed in Firefox

## Why this matters

Legacy Slate carried the global Firefox drag cleanup for a reason.
Dragged nodes can disappear before their own local `dragend` path finishes.

If the current proof row only checks one drag, it can miss the dirty internal
drag state that breaks the next interaction.

## Reusable rule

For Firefox drag/drop parity rows:

- do not rely on a vague generic drag gesture alone
- make the example own a deterministic drop mutation
- keep the internal document-level `dragend` / `drop` cleanup active
- prove the row with two drags, not one
