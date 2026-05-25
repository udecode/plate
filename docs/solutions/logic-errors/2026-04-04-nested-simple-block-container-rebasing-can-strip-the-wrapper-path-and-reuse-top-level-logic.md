---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Nested simple block-container rebasing can strip the wrapper path and reuse top-level logic
tags:
  - slate-v2
  - selection
  - range-ref
  - nested-blocks
  - insert-fragment
severity: medium
---

# Nested simple block-container rebasing can strip the wrapper path and reuse top-level logic

## What happened

Once quote-wrapped fragment semantics were green, the next gap was explicit-at
rebasing inside that same nested container.

At first glance that looked like another brand-new transform problem.

It wasn’t.

## What fixed it

For the current nested quote shape, the winning move was:

1. strip the wrapper/container path from the nested points or ranges
2. reuse the already-proved top-level simple text-block rebasing logic
3. prefix the wrapper path back onto the rebased result

That worked for both:

- editor selection rebasing
- range-ref rebasing

as long as the nested container still matched the current simple sibling-block
proof shape.

## Why this works

The quote wrapper changes the path prefix, not the inner block arithmetic.

Inside that wrapper, the current proof shape is still the same simple model:

- sibling blocks
- one text child each
- ordinary collapsed/range insert math

So the transform problem is not new geometry.
It is the old geometry with one extra path prefix.

That means the clean move is to normalize the paths into the already-solved
space instead of writing a second bespoke transform.

## Reusable rule

When a new nested editing case preserves the same inner block geometry:

- normalize into the proved inner space first
- only invent a new transform when the inner geometry actually changes

If the wrapper is the only new thing, strip it off, solve the problem in the
old space, then put it back.

## Related issues

- [2026-04-04-v2-fragment-proofs-should-preserve-a-nested-block-wrapper-before-chasing-arbitrary-tree-support.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-fragment-proofs-should-preserve-a-nested-block-wrapper-before-chasing-arbitrary-tree-support.md)
- [2026-04-04-same-block-mixed-inline-range-refs-can-reuse-the-editor-selection-offset-model-without-op-metadata.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-same-block-mixed-inline-range-refs-can-reuse-the-editor-selection-offset-model-without-op-metadata.md)
