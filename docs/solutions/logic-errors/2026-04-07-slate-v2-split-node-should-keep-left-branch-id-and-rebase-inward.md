---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 split_node should keep the left-branch id and rebase inward
tags:
  - slate-v2
  - split-node
  - transforms
  - runtime-id
  - selection
severity: medium
---

# Slate v2 split_node should keep the left-branch id and rebase inward

## Current Truth

`split_node` and `Transforms.splitNodes(...)` are no longer a narrow helper
story in the live `slate` package.

The current kept contract is:

1. preserve the original runtime id on the surviving left branch
2. allocate a fresh runtime id for the new right branch
3. rebase selection inward
4. keep the legacy leading empty-text spacer when an element split leaves an
   inline-first right branch
5. keep helper behavior aligned with the real upstream owner semantics instead
   of patching downstream fixtures one row at a time

The id rule still matters because the original logical text or element node
survives on the left. The right branch is the new logical node.

## Reusable rule

For Slate v2 split semantics:

- keep the original id on the surviving left branch
- give the new right branch a fresh id
- rebase selection inward at the split point
- keep the legacy leading empty spacer when the right branch starts with an
  inline
- do not reintroduce a fake text-leaf fast path that bypasses the block owner

If both split branches keep the old id, if the spacer contract disappears, or
if helper behavior drifts from the upstream owner semantics, the API is lying.
