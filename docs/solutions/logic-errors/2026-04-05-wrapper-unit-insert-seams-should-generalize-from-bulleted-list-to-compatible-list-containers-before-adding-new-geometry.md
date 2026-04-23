---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Wrapper-unit insert seams should generalize from bulleted-list to compatible list containers before adding new geometry
tags:
  - slate-v2
  - ordered-list
  - bulleted-list
  - wrapper-unit
severity: medium
---

# Wrapper-unit insert seams should generalize from bulleted-list to compatible list containers before adding new geometry

## What happened

The next sharp stress case was not a new document geometry at all.

It was a container variant:

- `ordered-list`
- with the same `list-item` unit contract already proved for `bulleted-list`

Plain copy/paste round-tripped, but explicit-`at` selection and range-ref
rebasing fell through the wrong path because the seam was still special-cased to
`bulleted-list`.

## What fixed it

The durable fix was to generalize the wrapper-unit insert seam from:

- one hardcoded `bulleted-list`

to:

- compatible list containers that share the same `list-item` unit contract

For the current proved subset, that means:

- `bulleted-list`
- `ordered-list`

## Why this works

This was not new geometry.

The unit contract was unchanged:

- same sibling unit type
- same wrapper-list behavior
- same post-insert selection/range semantics

Only the container type changed.

That should extend the existing seam, not create a new one.

## Reusable rule

Before treating a new container as a new geometry problem, ask:

- does it reuse the same sibling unit contract?

If yes, widen the seam before designing a new model.

## Related issues

- [2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md)
