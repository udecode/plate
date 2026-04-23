---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 range wrapNodes should move from a stable source index
tags:
  - slate-v2
  - wrapNodes
  - transforms
  - range
severity: medium
---

# Slate v2 range wrapNodes should move from a stable source index

## What happened

Once exact-path `wrapNodes(...)` was real, the next structural follow-on was
top-level block range/current-selection wrapping.

The tempting lie was to compute a fresh source path for every moved block.

That is how you end up wrapping the wrong siblings after the first move shifts
the tree.

## What fixed it

The honest block-span cut does one simple thing:

1. insert one wrapper at the start block index
2. move repeatedly from the same post-insert source index
3. append each moved block into the wrapper in order

Because every move shrinks the source side, the next block to wrap is still at
the same source index after the previous move.

## Reusable rule

For Slate v2 range-based wrapping:

- after inserting the wrapper, move from a stable source index
- do not recalculate the source path as if the tree were still unchanged

If the source index keeps changing in your code, the wrapped span will drift.
