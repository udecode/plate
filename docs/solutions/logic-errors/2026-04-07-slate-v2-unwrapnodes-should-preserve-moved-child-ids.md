---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 unwrapNodes should preserve moved child ids
tags:
  - slate-v2
  - unwrapNodes
  - transforms
  - runtime-id
severity: medium
---

# Slate v2 unwrapNodes should preserve moved child ids

## What happened

Once exact-path `wrapNodes(...)` was real, the structural counterpart was
`unwrapNodes(...)`.

The tempting lie was to rebuild the unwrapped children as new nodes.

That would have destroyed the ids of the children that were merely moving up one
level in the tree.

## What fixed it

The honest exact-path cut unwraps by composition:

1. move each direct child out of the wrapper
2. remove the now-empty wrapper

That keeps the moved children as the same logical nodes:

- same runtime ids
- new sibling paths
- wrapper disappears

## Reusable rule

For Slate v2 structural unwrap helpers:

- moved children keep their ids
- only the removed wrapper disappears
- do not rebuild descendants that are only moving structurally

If `unwrapNodes(...)` recreates the children, it is not unwrapping. It is
replacement wearing a fake moustache.
