---
date: 2026-04-04
problem_type: logic_error
component: documentation
root_cause: logic_error
title: V2 editable blocks can be the first public editor surface
tags:
  - slate-v2
  - slate-react-v2
  - editable
  - public-api
severity: medium
---

# V2 editable blocks can be the first public editor surface

## What happened

Once the renderer stack, zero-width policy, decorated leaves, mark placeholders,
and browser semantics were all packaged and proved, the remaining question was:

- what is the first public editor-facing surface that is actually honest?

The answer is not the low-level primitives.
It is the smallest surface that already packages the proved behavior.

## What fixed it

`slate-react-v2` now exposes:

- [EditableBlocks](/Users/zbeyens/git/slate-v2/packages/slate-react-v2/src/components/editable-blocks.tsx)

That surface packages:

- root mounting and DOM reconciliation through `Editable`
- top-level text-block rendering
- zero-width policy
- projection-driven leaf splitting
- placeholder support
- mark-placeholder rendering
- optional projection store wiring

It is intentionally narrow:

- top-level element blocks
- one text child per block

That narrowness is a feature, not a bug.

## Why this works

The first public v2 editor surface should be the smallest thing we have already
proved in a real browser.

Shipping a broader API before the mixed-node and nested-inline story is proved
would just rename uncertainty.

`EditableBlocks` is the first place where the package can honestly say:

- this surface is real
- this surface is tested
- this surface reflects the current proven contract

## Reusable rule

For new public v2 surfaces:

- package only what the browser proofs have already made true
- prefer a narrow, honest surface over a broad speculative one

If a public API includes node shapes or editing cases we are still proving with
ad hoc examples, it is too early.

## Related issues

- [2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-roots-should-own-mount-selection-sync-and-dom-commit.md)
- [2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-text-primitives-should-compose-leaf-text-zero-width-and-placeholder.md)
- [2026-04-04-v2-element-primitives-should-compose-element-and-void-contracts.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-element-primitives-should-compose-element-and-void-contracts.md)
