---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 editable blocks need structure-preserving DOM reconciliation for mixed-inline editing
tags:
  - slate-v2
  - slate-react-v2
  - editable-blocks
  - mixed-inline
  - dom-reconciliation
severity: medium
---

# V2 editable blocks need structure-preserving DOM reconciliation for mixed-inline editing

## What happened

`EditableBlocks` started as an honest public surface for narrow text-block
proofs.

The next expansion was mixed-inline editing:

- direct text children
- inline element children
- selection, typing, and clipboard behavior through that shape

The first red showed the root problem fast:

- typing inside an inline child could preserve visible text
- but the old `Editable` DOM commit path flattened the whole root back into one
  text block

That destroyed the structure the selection paths still referred to.

## What fixed it

`Editable` now accepts `snapshotFromDom(...)`.

`EditableTextBlocks` uses that seam to:

- keep the current descendant structure
- read fresh text from each rendered `data-slate-node="text"` owner
- replace only text-leaf content on commit

That keeps mixed-inline edits honest:

- text changes commit from real DOM input
- inline wrappers survive
- selection paths still point at real nodes after commit

## Why this works

For a public editor surface, DOM reconciliation must preserve the editor shape
the surface claims to support.

If the surface says “mixed inline is real” but DOM commits collapse everything
back into one text node, the public API is lying.

The durable seam is not “extract all plain text from the root.”
It is “preserve the current tree shape and refresh the text leaves that DOM
input actually changed.”

## Reusable rule

For `slate-react-v2` public editing surfaces:

- plain-text root extraction is only acceptable for plain-text proof surfaces
- once a surface claims mixed-node support, DOM commit must preserve that node
  structure

If typing or paste makes the structure collapse while the visible text still
looks correct, the reconciliation seam is too shallow.

## Related issues

- [2026-04-04-v2-editable-blocks-can-be-the-first-public-editor-surface.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-can-be-the-first-public-editor-surface.md)
- [2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md)
