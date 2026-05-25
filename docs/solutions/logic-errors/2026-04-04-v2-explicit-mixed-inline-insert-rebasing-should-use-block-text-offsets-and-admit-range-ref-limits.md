---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 explicit mixed-inline insert rebasing should use block text offsets and admit range-ref limits
tags:
  - slate-v2
  - selection
  - range-ref
  - mixed-inline
  - insert-fragment
severity: medium
---

# V2 explicit mixed-inline insert rebasing should use block text offsets and admit range-ref limits

## What happened

Once mixed-inline fragment insert itself was green, the next lie was explicit
`insertFragment(..., { at })` rebasing.

The old logic still only understood the flat text-block proof subset.

That meant mixed-inline inserts could preserve the document shape while leaving:

- editor selections stale
- range refs only partially correct

## What fixed it

For editor selection rebasing, the durable fix was:

- convert mixed-inline points in the target block to block-relative text offsets
- perform the insert/replacement math in that flat offset space
- map the result back to the current mixed-inline child paths

That is enough for the current proved shape because each direct child still has
one clear text extent.

For range refs, the honest fix was narrower:

- later-block mixed-inline refs now rebase correctly through top-level block
  shifts after explicit multi-block inserts

## Why this works

Within the current mixed-inline proof shape, child paths are not stable enough
to do arithmetic on directly.

Text offsets are.

Once the insert math is done in block-relative text space, the renderer shape
can change and the final caret can still be mapped back to the correct child.

Range refs are harder.

For same-block mixed-inline refs, the current `insert_fragment` operation does
not carry enough metadata about the target child split to rebase every ref
perfectly after the fact.

Pretending otherwise would be fake precision.

## Reusable rule

For explicit mixed-inline inserts:

- rebase editor selections through block-relative text offsets, not raw child
  indices
- only claim the range-ref rebasing you can actually derive from the current
  operation payload

If same-block mixed-inline range refs need exact rebasing, the next step is
richer insert metadata, not more guesswork.

## Related issues

- [2026-04-04-v2-mixed-inline-clipboard-proofs-should-span-top-level-blocks-before-broader-tree-shapes.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-mixed-inline-clipboard-proofs-should-span-top-level-blocks-before-broader-tree-shapes.md)
- [2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md)
