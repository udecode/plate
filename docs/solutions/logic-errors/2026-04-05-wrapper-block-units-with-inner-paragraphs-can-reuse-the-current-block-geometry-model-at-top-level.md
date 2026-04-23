---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Wrapper block units with inner paragraphs can reuse the current block geometry model at top level
tags:
  - slate-v2
  - geometry
  - wrapper-block
  - list-item
  - browser-proof
severity: medium
---

# Wrapper block units with inner paragraphs can reuse the current block geometry model at top level

## What happened

After richer-inline descendants were green, the next reasonable question was:

- do wrapper block units already fit the same geometry model?

The first useful case was a top-level list whose children are `list-item`
wrappers around paragraph descendants.

## What fixed it

The current geometry model was already enough.

Top-level wrapper block units worked without a new transform family because:

- each wrapper block still reduces to recursive text-leaf ordering internally
- the container still behaves like sibling block units
- the browser clipboard proof matched the contract-layer behavior

So the top-level list wrapper slice could be promoted without widening the core
abstraction again.

## Why this works

The key question is not whether a block is wrapped.
It is whether the wrapped block still reduces to:

- an ordered list of text leaves
- plus a stable container path

At top level, list-item wrappers still satisfy that.

That means the current block-geometry model survives intact.

## Reusable rule

Before inventing a new block-unit abstraction:

- check whether the wrapper shape already reduces to recursive text leaves plus
  stable sibling-block ordering

If it does, prove it in the browser and keep the current model.

## Related issues

- [2026-04-04-block-geometry-should-flatten-recursive-text-leaves-before-rebasing-richer-inline-shapes.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-block-geometry-should-flatten-recursive-text-leaves-before-rebasing-richer-inline-shapes.md)
- [2026-04-04-nested-mixed-inline-containers-can-strip-the-wrapper-path-and-reuse-top-level-mixed-inline-transforms.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-nested-mixed-inline-containers-can-strip-the-wrapper-path-and-reuse-top-level-mixed-inline-transforms.md)
