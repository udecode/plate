---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Block geometry should flatten recursive text leaves before rebasing richer-inline shapes
tags:
  - slate-v2
  - selection
  - range-ref
  - rich-inline
  - geometry
severity: medium
---

# Block geometry should flatten recursive text leaves before rebasing richer-inline shapes

## What happened

The earlier mixed-inline work still leaned on a hidden shortcut:

- direct text children
- direct inline children with one text child

That was good enough until richer inline descendants showed up:

- inline wrapper
- nested inline wrapper inside it
- multiple text leaves under the same inline subtree

At that point the old geometry model was bullshit.

## What fixed it

The durable fix was to flatten each block into recursive text-leaf entries:

- text leaf path inside the block
- text length

Then reuse that one geometry source for:

- point -> block-relative text offset
- block-relative text offset -> point
- fragment extraction
- explicit-at selection rebasing
- explicit-at range-ref rebasing

That let the existing transform stack survive richer inline descendant trees
without a new algorithm for every wrapper shape.

## Why this works

The hard part is not “how many inline wrappers exist.”
The hard part is “what is the linear text geometry of this block?”

Once that geometry is represented as ordered text leaves, deeper wrappers stop
being special.

They become:

- another path prefix inside the block
- another text span in the flattened leaf list

That is the right abstraction level for the current v2 proof shape.

## Reusable rule

When a block starts supporting richer inline descendants:

- stop doing geometry off direct children
- flatten to recursive text leaves first

If the geometry helper still talks like the block has only one level of inline
children, it is already lying.

## Related issues

- [2026-04-04-nested-mixed-inline-containers-can-strip-the-wrapper-path-and-reuse-top-level-mixed-inline-transforms.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-nested-mixed-inline-containers-can-strip-the-wrapper-path-and-reuse-top-level-mixed-inline-transforms.md)
- [2026-04-04-same-block-mixed-inline-range-refs-can-reuse-the-editor-selection-offset-model-without-op-metadata.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-same-block-mixed-inline-range-refs-can-reuse-the-editor-selection-offset-model-without-op-metadata.md)
