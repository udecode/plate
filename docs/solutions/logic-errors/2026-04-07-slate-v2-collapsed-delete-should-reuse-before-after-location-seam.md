---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 collapsed delete should reuse the before/after location seam
tags:
  - slate-v2
  - delete
  - before
  - after
  - transforms
severity: medium
---

# Slate v2 collapsed delete should reuse the before/after location seam

## What happened

Once narrow `Editor.before(...)` and `Editor.after(...)` were real, the next
delete hole was collapsed point/selection deletion with `reverse` and
`distance`.

The tempting lie was to keep special-casing cursor math inside `delete(...)`.

That would have duplicated location logic in two places and drifted the moment
`before(...)` / `after(...)` evolved.

## What fixed it

The honest follow-on reuses the location seam:

1. resolve the other edge with `Editor.before(...)` or `Editor.after(...)`
2. if the result stays in one text leaf, feed that range back through the
   existing narrow range-delete path
3. if the result crosses into the adjacent mixed-inline sibling leaf, delete the
   edge text from each side and collapse back to the computed start boundary

That keeps `delete(...)` small while letting collapsed deletion inherit the
same live-draft location rules.

## Reusable rule

For Slate v2 text transforms:

- do not duplicate location-walking logic inside `delete(...)`
- turn collapsed deletion into a range through `before(...)` / `after(...)`
- let collapsed mixed-inline delete broaden only as the location seam broadens

If collapsed delete implements its own cursor math, it will rot separately.
