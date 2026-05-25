---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Compatible list containers should share wrapper-unit transplant semantics not just local insert semantics
tags:
  - slate-v2
  - ordered-list
  - bulleted-list
  - transplant
  - wrapper-unit
severity: medium
---

# Compatible list containers should share wrapper-unit transplant semantics not just local insert semantics

## What happened

After widening the wrapper-unit seam so `ordered-list` could use the same
`list-item` contract as `bulleted-list`, the next useful question was:

- does that only help local ordered-list inserts?
- or can an `ordered-list` fragment transplant into a `bulleted-list` target
  through the same seam?

## What fixed it

The same seam should handle both.

Once the list container types are compatible, the fragment should be allowed to
contribute its `list-item` children to the target wrapper-list seam even when
the source and target container flavors differ.

## Why this works

The important contract is not the source container label.

It is:

- compatible wrapper-list container
- same sibling unit type
- same post-insert selection/range semantics

If those hold, transplant should share the seam.

## Reusable rule

When widening wrapper-unit support from one list container flavor to another:

- do not stop at “same-flavor inserts are green”
- also prove cross-container transplant between the compatible flavors

## Related issues

- [2026-04-05-wrapper-unit-insert-seams-should-generalize-from-bulleted-list-to-compatible-list-containers-before-adding-new-geometry.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-unit-insert-seams-should-generalize-from-bulleted-list-to-compatible-list-containers-before-adding-new-geometry.md)
