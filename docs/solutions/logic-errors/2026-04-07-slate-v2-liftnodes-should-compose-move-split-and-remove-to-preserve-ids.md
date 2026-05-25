---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 liftNodes should compose move, split, and remove to preserve ids
tags:
  - slate-v2
  - liftNodes
  - transforms
  - runtime-id
severity: medium
---

# Slate v2 liftNodes should compose move, split, and remove to preserve ids

## What happened

After exact-path `wrapNodes(...)` and `unwrapNodes(...)`, the next structural
hole was `liftNodes(...)`.

The tempting lie was to rebuild the lifted branch into new wrapper shapes.

That would have made the visible structure look right while quietly replacing
the lifted node with a fresh id.

## What fixed it

The honest exact-path cut lifts by composing the structural ops that already
know how to preserve identity:

1. move the existing node out of its parent
2. split the parent only for the middle-child case
3. remove the emptied parent only for the only-child case

That keeps the lifted node as the same logical node:

- same runtime id
- new sibling path
- surrounding wrappers split or disappear only when structurally necessary

## Reusable rule

For Slate v2 structural lift helpers:

- lift by moving the existing node, not by rebuilding it
- split surrounding wrappers only when the lifted node is in the middle
- remove the wrapper only when it becomes empty
- read the live draft tree inside outer transactions

If `liftNodes(...)` recreates the lifted node, it is not lifting. It is a
costume change with identity theft.
