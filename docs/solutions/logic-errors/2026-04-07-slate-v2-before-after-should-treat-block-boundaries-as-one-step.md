---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 before/after should treat block boundaries as one step
tags:
  - slate-v2
  - before
  - after
  - move
  - locations
severity: medium
---

# Slate v2 before/after should treat block boundaries as one step

## What happened

Once `Editor.before(...)` and `Editor.after(...)` could walk across mixed-inline
text leaves inside one supported top-level block, the next gap was obvious:
they still stopped dead at block boundaries.

That left `Transforms.move(...)` with a fake ceiling too, even though the model
already knew how to represent cursor positions at block ends and block starts.

## What fixed it

The honest follow-on treated the boundary between a supported block end and the
next supported block start as one step:

1. compute the point offset inside the current block
2. when the offset overflows, carry it into the adjacent supported block with a
   `+1` / `-1` boundary adjustment
3. stop only at the document boundary or unsupported blocks

That keeps `before(...)`, `after(...)`, and `move(...)` aligned on the same
cursor-step model.

## Reusable rule

For Slate v2 location walking:

- block-end to next-block-start is one step
- previous-block-end to current-block-start is one step
- do not invent an extra fake cursor slot at block boundaries

If block boundaries cost an extra step, cursor motion stops matching the editor
model.
