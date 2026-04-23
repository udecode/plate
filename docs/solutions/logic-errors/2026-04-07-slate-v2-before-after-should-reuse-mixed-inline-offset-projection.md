---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 before/after should reuse mixed-inline offset projection
tags:
  - slate-v2
  - before
  - after
  - mixed-inline
  - locations
severity: medium
---

# Slate v2 before/after should reuse mixed-inline offset projection

## What happened

The first `Editor.before(...)` / `Editor.after(...)` slice only walked inside
one text node.

The next honest follow-on was walking across sibling text leaves inside one
supported top-level text block, including inline descendants.

The tempting lie was to bolt more branchy cursor math straight into
`editor.ts`.

That would have duplicated logic the core already had for mixed-inline text
offset projection.

## What fixed it

The honest follow-on moved point stepping into the core and reused the existing
mixed-inline helpers:

1. project the current point to a block-text offset
2. add or subtract the distance
3. project back into a concrete point path/offset

That makes `before(...)` / `after(...)` agree with the same block-text model
already used elsewhere in the core.

## Reusable rule

For Slate v2 location walking:

- reuse the core's mixed-inline offset projection when the block model already
  exists
- do not duplicate tree-walking math in `editor.ts`
- broaden block-local walking before attempting cross-block walking

If `before(...)` and `after(...)` compute mixed-inline steps with their own
handmade tree crawl, they will drift from the rest of the engine.
