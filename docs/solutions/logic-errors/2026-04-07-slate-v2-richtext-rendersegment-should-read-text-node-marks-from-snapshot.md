---
date: 2026-04-07
problem_type: logic_error
component: slate-react-v2
root_cause: logic_error
title: Slate v2 richtext renderSegment should read text-node marks from the snapshot
tags:
  - slate-v2
  - slate-react-v2
  - richtext
  - marks
  - rendering
severity: medium
---

# Slate v2 richtext renderSegment should read text-node marks from the snapshot

## What happened

`EditableText` already knew how to split one text node into rendered segments
from projection slices.

That was enough for decoration-style rendering.

It was not enough for current `richtext` rendering, because `renderSegment(...)`
had no access to the text node's mark props like `bold`, `italic`, or `code`.

## What fixed it

The rendered segment now carries the current text node's non-`text` props as
`marks`.

That data is read from the snapshot by path or runtime id before the segments
are rendered.

## Why this works

Marks belong to the text node, not to the projection system.

Projection slices tell the renderer where to split.
The snapshot text node tells the renderer how that leaf should be formatted.

Using both gives one clean render seam:

- slices decide segment boundaries
- text-node props decide mark wrappers

## Reusable rule

For current `slate-react-v2` richtext rendering:

- use projection slices to split leaves
- use snapshot text-node props to expose leaf marks
- do not pretend the projection layer alone can recover text formatting
