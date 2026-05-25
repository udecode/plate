---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 editable text should split leaves from projection slices
tags:
  - slate-v2
  - slate-react-v2
  - projections
  - decorations
  - leaf
severity: medium
---

# V2 editable text should split leaves from projection slices

## What happened

Once the plain-text renderer stack was packaged, the next real rich-text seam
was decoration-style leaf splitting.

`slate-react-v2` already had projection slices.
What it did not have was a renderer primitive that could turn one text node plus
those slices into multiple rendered leaves.

## What fixed it

`EditableText` now owns that split:

- it accepts a `runtimeId`
- reads `useSlateProjections(runtimeId)`
- splits the string into cumulative text segments
- renders one `SlateLeaf` per segment
- lets callers style active segments through `renderSegment(...)`

That was enough to prove a highlighted middle slice in a real browser while
still typing through the same text node.

## Why this works

Projection slices are already the v2 range-segmentation truth.

Adding a second decoration-splitting system on top would have been stupid.
The renderer should consume the slices it already has and turn them directly
into leaves.

That keeps the model simple:

- `slate-v2` projects ranges into runtime-local slices
- `slate-react-v2` renders those slices as leaves

## Reusable rule

For `slate-react-v2` rich-text rendering:

- do not invent a second decoration model when projection slices already exist
- let the compositional text primitive own leaf splitting from those slices

If one text node plus one highlight still needs example-specific leaf logic,
the package surface is not done yet.

## Related issues

- [2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md)
- [2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md)
