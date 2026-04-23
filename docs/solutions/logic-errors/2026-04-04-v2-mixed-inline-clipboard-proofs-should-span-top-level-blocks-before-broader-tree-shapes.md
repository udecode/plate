---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 mixed-inline clipboard proofs should span top-level blocks before broader tree shapes
tags:
  - slate-v2
  - slate-dom-v2
  - clipboard
  - mixed-inline
  - multiblock
severity: medium
---

# V2 mixed-inline clipboard proofs should span top-level blocks before broader tree shapes

## What happened

After the one-block mixed-inline proof went green, there was an obvious trap:

- it would be easy to declare mixed-node clipboard “done”
- while the first real document-level case was still unproved

That missing case was:

- partial first block
- partial last block
- real block break in the fragment
- inline children preserved on both sides

## What fixed it

The proof expanded one step, not ten:

- `slate-v2` mixed-inline fragment extraction now spans multiple top-level
  blocks when each touched block still matches the current proved mixed-inline
  shape
- mixed-inline fragment insertion now accepts multi-block fragments into the
  current proved mixed-inline target shape
- `slate-dom-v2` clipboard boundary proof now round-trips that fragment
- the browser suite now proves the same case in Chromium with a dedicated
  two-block route

That keeps the scope honest:

- broader than one block
- still far narrower than arbitrary nested block trees

## Why this works

The first useful generalization is the smallest one that adds real document
pressure.

For clipboard semantics, that means crossing a block boundary while preserving
the inline structure we already proved inside each block.

Jumping straight from one-block mixed-inline to arbitrary nested trees would
blur two different questions:

1. does the fragment model survive a real multi-block document cut?
2. does the model survive arbitrary tree shapes?

Only the first one needed to be solved now.

## Reusable rule

When expanding `slate-v2` proof scope:

- move from one proved shape to the next real document pressure case
- do not skip directly to arbitrary tree support unless the narrower document
  seam is already green

If the next proof can be stated as “same shape, but across a real document
boundary,” do that before inventing a bigger abstraction story.

## Related issues

- [2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
- [2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md)
