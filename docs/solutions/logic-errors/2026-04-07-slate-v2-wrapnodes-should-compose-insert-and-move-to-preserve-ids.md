---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 wrapNodes should compose insert and move to preserve ids
tags:
  - slate-v2
  - wrapNodes
  - transforms
  - runtime-id
severity: medium
---

# Slate v2 wrapNodes should compose insert and move to preserve ids

## What happened

The next broader node-structure slice after the narrow split/merge work was
`wrapNodes(...)`.

The tempting lie was to implement wrapping by cloning the wrapped node into a
new wrapper tree.

That would have thrown away the original node id and quietly broken the same
runtime-id guarantees the earlier slices had just proved.

## What fixed it

The honest exact-path cut composes existing structural seams:

1. insert an empty wrapper at the target path
2. move the original node into that wrapper

That keeps the wrapped node as the same logical node:

- same runtime id
- new path
- wrapper gets the fresh id

## Reusable rule

For Slate v2 structural wrapper helpers:

- prefer composing existing structural ops when that preserves node identity
- do not clone-and-reinsert if the node is supposed to remain the same logical node

If `wrapNodes(...)` breaks the wrapped node id, it is not wrapping. It is
replacing.
