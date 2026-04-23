---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Same-block mixed-inline range refs can reuse the editor selection offset model without op metadata
tags:
  - slate-v2
  - range-ref
  - mixed-inline
  - selection
  - insert-fragment
severity: medium
---

# Same-block mixed-inline range refs can reuse the editor selection offset model without op metadata

## What happened

After the first explicit mixed-inline rebasing pass, it looked like same-block
range refs would need richer `insert_fragment` operation metadata.

That turned out to be only half true.

For arbitrary tree shapes, yes.
For the current proved top-level mixed-inline shape, no.

## What fixed it

The working move was not new op metadata.
It was a core-only transform path for mixed-inline `insert_fragment` range refs.

That path reuses the same model as the editor-selection fix:

- convert points in the target block to block-relative text offsets
- do the insert/replacement math in that flat offset space
- map the result back to mixed-inline child paths

Because the current proved shape still has direct text children and single-text
inline children, that mapping is exact enough without extending the public op.

## Why this works

The hard part was never “range refs need metadata” in the abstract.
The hard part was “can we reconstruct the right path after insert?”

Inside the current top-level mixed-inline proof shape, the answer is yes:

- every direct child has one stable text extent
- block-relative offset math is sufficient
- the current tree before the op plus the fragment payload contains enough
  information

That is enough for same-block refs.

It is not enough for arbitrary nested tree inserts, where the path geometry is
more complex than one block of direct text-ish children.

## Reusable rule

Before adding metadata to an operation:

- ask whether the current proved shape can be rebased from existing tree state
  plus block-relative text offsets

If yes, keep the richer transform internal.
If no, then add metadata for the broader shape.

Do not widen the public operation shape just because the first guess said the
problem “probably” needed it.

## Related issues

- [2026-04-04-v2-explicit-mixed-inline-insert-rebasing-should-use-block-text-offsets-and-admit-range-ref-limits.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-explicit-mixed-inline-insert-rebasing-should-use-block-text-offsets-and-admit-range-ref-limits.md)
- [2026-04-04-v2-mixed-inline-clipboard-proofs-should-span-top-level-blocks-before-broader-tree-shapes.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-mixed-inline-clipboard-proofs-should-span-top-level-blocks-before-broader-tree-shapes.md)
