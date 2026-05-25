---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Nested mixed-inline containers can strip the wrapper path and reuse top-level mixed-inline transforms
tags:
  - slate-v2
  - range-ref
  - selection
  - nested-mixed-inline
  - insert-fragment
severity: medium
---

# Nested mixed-inline containers can strip the wrapper path and reuse top-level mixed-inline transforms

## What happened

After nested simple block containers were green, the next real geometry seam was
quote wrappers whose paragraph children were themselves mixed-inline blocks.

At first glance that looked like a new transform family.

It wasn’t.

## What fixed it

The working move was the same pattern that worked for nested simple block
containers, but applied to the mixed-inline model:

1. detect the wrapper/container path
2. strip that path from nested points and ranges
3. reuse the already-proved top-level mixed-inline fragment, selection, and
   range-ref transforms in the normalized local space
4. prefix the wrapper path back onto the result

That made the current nested mixed-inline quote shape work for:

- fragment extraction
- fragment insertion
- explicit-at editor selection rebasing
- explicit-at range-ref rebasing

## Why this works

The wrapper changes the path prefix, not the inner mixed-inline geometry.

Inside the current quote container, the child blocks still satisfy the same
proved mixed-inline shape:

- direct sibling blocks
- direct text children
- direct single-text inline children

So the real problem is not new geometry.
It is old geometry wearing one extra wrapper.

## Reusable rule

When a nested editing case preserves the already-proved inner mixed-inline
geometry:

- normalize into the proved inner space first
- only invent a new transform when the inner geometry truly changes

If stripping the wrapper path makes the problem look exactly like an existing
green proof, use that. Do not write a second algorithm for the same math.

## Related issues

- [2026-04-04-nested-simple-block-container-rebasing-can-strip-the-wrapper-path-and-reuse-top-level-logic.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-nested-simple-block-container-rebasing-can-strip-the-wrapper-path-and-reuse-top-level-logic.md)
- [2026-04-04-v2-fragment-proofs-should-preserve-a-nested-block-wrapper-before-chasing-arbitrary-tree-support.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-fragment-proofs-should-preserve-a-nested-block-wrapper-before-chasing-arbitrary-tree-support.md)
