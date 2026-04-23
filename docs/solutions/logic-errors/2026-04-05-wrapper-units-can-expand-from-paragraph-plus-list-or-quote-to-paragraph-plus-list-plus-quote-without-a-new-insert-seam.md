---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Wrapper units can expand from paragraph plus list or quote to paragraph plus list plus quote without a new insert seam
tags:
  - slate-v2
  - list-item
  - wrapper-unit
  - quote
  - bulleted-list
severity: medium
---

# Wrapper units can expand from paragraph plus list or quote to paragraph plus list plus quote without a new insert seam

## What happened

After proving `list-item` units with:

- `paragraph + nested-list`
- `paragraph + quote`

the next honest widening step was:

- `paragraph + nested-list + quote`

## What fixed it

It did not need a new insertion model.

The same sibling-unit seam held:

- if the target container is a `bulleted-list`
- and the fragment being inserted is a `list-item`
- keep treating it as a sibling unit

That was enough for:

- `slate-v2` contracts
- `slate-dom-v2` clipboard round-trip
- real Chromium copy/paste routes

## Why this works

The important question is still not the exact child-block mix.

It is:

- does the fragment still behave as one wrapper unit at insert time?

For `paragraph + nested-list + quote`, yes.

The browser/runtime stack still decides the final landing point, but the
underlying unit-insert seam does not need to change.

## Reusable rule

When widening wrapper-unit geometry:

- expand the child-block mix one step at a time
- keep the existing sibling-unit seam if the inserted fragment is still one
  real wrapper unit
- only look for a new architecture seam when the fragment stops behaving like a
  sibling unit at insert time

## Related issues

- [2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md)
- [2026-04-05-wrapper-unit-geometry-can-expand-from-paragraph-plus-nested-list-to-paragraph-plus-quote-with-the-same-sibling-unit-seam.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-unit-geometry-can-expand-from-paragraph-plus-nested-list-to-paragraph-plus-quote-with-the-same-sibling-unit-seam.md)
