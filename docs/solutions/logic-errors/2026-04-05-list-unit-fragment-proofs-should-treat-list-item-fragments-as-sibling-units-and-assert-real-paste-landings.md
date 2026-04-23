---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: List-unit fragment proofs should treat list-item fragments as sibling units and assert real paste landings
tags:
  - slate-v2
  - list-item
  - wrapper-unit
  - clipboard
  - browser-proof
severity: medium
---

# List-unit fragment proofs should treat list-item fragments as sibling units and assert real paste landings

## What happened

The next geometry seam after richer-inline wrapper stacks was not arbitrary
trees.

It was a sharper shape:

- one `list-item`
- one paragraph child
- one nested `bulleted-list` child

The first proofs exposed two lies:

- nested `bulleted-list` targets were unwrapping `list-item` fragments into
  paragraph children instead of inserting them as sibling units
- browser assertions were still guessing the post-paste landing path instead of
  checking where the real clipboard/runtime stack actually placed it

## What fixed it

The durable seam was:

- treat `list-item` fragments as sibling units when the target container is a
  `bulleted-list`
- prove the shape through:
  - `slate-v2` contracts
  - `slate-dom-v2` clipboard-boundary tests
  - real Chromium copy/paste example tests

## Why this works

This shape is not “more mixed inline”.

The fragment being pasted is itself the sibling unit.
If the code unwraps it, the tree lies immediately.

Once the unit stays intact, the remaining browser truth is simple:

- top-level list-unit explicit inserts still rebase into the split sibling unit
- quote-wrapped list-unit nested-list inserts preserve the outer paragraph
  selection
- real clipboard paste lands at the deepest inserted descendant, not at the
  first tempting chip leaf

## Reusable rule

When a proof inserts `list-item` fragments into a `bulleted-list` target:

- treat the fragment as a sibling unit, not inline content
- promote the shape only after core, DOM, and browser all agree
- assert the real post-paste landing point the browser/runtime stack returns

## Related issues

- [2026-04-05-wrapper-block-units-with-inner-paragraphs-can-reuse-the-current-block-geometry-model-at-top-level.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-block-units-with-inner-paragraphs-can-reuse-the-current-block-geometry-model-at-top-level.md)
- [2026-04-05-nested-wrapper-stacks-can-be-promoted-once-browser-proof-matches-the-contract-layer.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-nested-wrapper-stacks-can-be-promoted-once-browser-proof-matches-the-contract-layer.md)
