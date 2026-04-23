---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Deeper wrapper stacks still fit the current model when stripping prefixes exposes proved inner geometry
tags:
  - slate-v2
  - wrapper-stack
  - geometry
  - browser-proof
severity: medium
---

# Deeper wrapper stacks still fit the current model when stripping prefixes exposes proved inner geometry

## What happened

After quote + list wrapper stacks were green, the next honest question was:

- does one more wrapper layer break the model?

The test case was:

- outer quote
- list-item wrapper unit
- inner quote
- richer-inline paragraphs

## What fixed it

It did not need a new transform.

The current model still held because stripping the wrapper prefixes still
exposed the same already-proved inner geometry:

- recursive text-leaf ordering inside each block
- stable wrapper-unit sibling ordering

That meant the existing fragment, selection, and range-ref machinery was still
good enough, and the browser proof confirmed it.

## Why this works

The decisive question is not “how many wrappers exist?”

It is:

- after stripping wrapper prefixes, do we still land in a geometry the system
  already knows how to reason about?

If yes, the stack is deeper, but not conceptually new.

## Reusable rule

For wrapper-stack growth:

- do not count wrappers
- inspect the inner geometry revealed after prefix stripping

If that inner geometry is still one of the already-proved shapes, prove the
stack in the browser and keep the current model.

If not, that is the real next architecture seam.

## Related issues

- [2026-04-05-nested-wrapper-stacks-can-be-promoted-once-browser-proof-matches-the-contract-layer.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-nested-wrapper-stacks-can-be-promoted-once-browser-proof-matches-the-contract-layer.md)
- [2026-04-04-block-geometry-should-flatten-recursive-text-leaves-before-rebasing-richer-inline-shapes.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-block-geometry-should-flatten-recursive-text-leaves-before-rebasing-richer-inline-shapes.md)
