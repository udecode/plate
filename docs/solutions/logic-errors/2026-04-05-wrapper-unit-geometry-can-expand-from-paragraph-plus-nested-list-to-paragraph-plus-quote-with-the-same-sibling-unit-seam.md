---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Wrapper-unit geometry can expand from paragraph plus nested list to paragraph plus quote with the same sibling-unit seam
tags:
  - slate-v2
  - list-item
  - quote
  - wrapper-unit
  - browser-proof
severity: medium
---

# Wrapper-unit geometry can expand from paragraph plus nested list to paragraph plus quote with the same sibling-unit seam

## What happened

After proving `list-item` units with:

- one paragraph child
- one nested list child

the next honest question was whether the same sibling-unit seam also survives a
different child-block mix:

- one paragraph child
- one quote child

## What fixed it

It did not need a new architecture seam.

The same sibling-unit rule held:

- when the target container is a `bulleted-list`
- and the inserted fragment is a `list-item`
- treat the fragment as a sibling unit

That was enough to prove the shape through:

- `slate-v2` contracts
- `slate-dom-v2` clipboard-boundary
- real Chromium copy/paste routes

## Why this works

The decisive question was not the exact child block type.

It was:

- does the wrapper unit still behave like one sibling unit at insert time?

For `paragraph + quote`, the answer is still yes.

The browser proof also sharpened one useful distinction:

- top-level inserts into the quote descendant rebase into the inserted sibling
  unit
- quote-wrapped nested-list descendant inserts can preserve the outer paragraph
  selection/range when that is what the real stack does

## Reusable rule

When widening wrapper-unit geometry:

- change the child-block mix one sharp step at a time
- keep the sibling-unit insert seam if the fragment is still a real wrapper unit
- assert the browser/runtime landing point you actually get, not the one that
  feels tidier

## Related issues

- [2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md)
