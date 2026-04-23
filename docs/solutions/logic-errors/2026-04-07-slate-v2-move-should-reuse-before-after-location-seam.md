---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 move should reuse the before/after location seam
tags:
  - slate-v2
  - move
  - selection
  - before
  - after
  - transforms
severity: medium
---

# Slate v2 move should reuse the before/after location seam

## What happened

After `setSelection(...)`, `collapse(...)`, and `setPoint(...)`, the next
selection-motion hole was `move(...)`.

The first honest cut kept `move(...)` inside one text node. That was fine as a
starter seam, but it became stale the moment `Editor.before(...)` and
`Editor.after(...)` learned to walk across mixed-inline text leaves inside one
supported top-level block.

Keeping `move(...)` on its private text-node clamp after that point would have
left the public transform behind the public location seam.

## What fixed it

The follow-on cut reuses `Editor.before(...)` and `Editor.after(...)`:

1. read the live draft selection
2. resolve `start` / `end` from the current selection direction
3. move each targeted edge through the location seam

That automatically broadens `move(...)` to the same proved mixed-inline block
surface without duplicating cursor-walking logic.

## Reusable rule

For Slate v2 selection-motion helpers:

- read the live draft selection, not committed `editor.selection`
- reuse `Editor.before(...)` / `Editor.after(...)` once they are the broader
  proved location seam
- do not keep a private cursor-walking path in `move(...)`

If `move(...)` and `before(...)` / `after(...)` drift apart, the editor grows
two truths for cursor motion. That gets stupid fast.
