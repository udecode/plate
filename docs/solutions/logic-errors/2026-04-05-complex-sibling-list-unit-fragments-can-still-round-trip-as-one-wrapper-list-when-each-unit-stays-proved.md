---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Complex sibling list-unit fragments can still round-trip as one wrapper list when each unit stays proved
tags:
  - slate-v2
  - list-item
  - sibling-units
  - clipboard
  - browser-proof
severity: medium
---

# Complex sibling list-unit fragments can still round-trip as one wrapper list when each unit stays proved

## What happened

After proving one complex `list-item` unit at a time, the next honest step was:

- two sibling `list-item` units
- each unit containing:
  - a paragraph
  - a nested list
  - a quote

The question was whether selection across both sibling units still extracts and
round-trips as one coherent wrapper-list fragment.

## What fixed it

It did not need a new seam.

The current model already held:

- each `list-item` still behaves as one proved wrapper unit
- selection across the sibling units extracts a `bulleted-list` fragment that
  contains those sibling units
- real clipboard paste round-trips that wrapper list through DOM and Chromium

## Why this works

The decisive boundary is still the wrapper unit.

If each sibling unit is already a proved shape, crossing multiple sibling units
does not automatically create a new architecture seam.

The fragment simply lifts one level:

- one proved unit becomes one proved sibling
- multiple proved siblings become one proved wrapper-list fragment

## Reusable rule

Before inventing a new multi-unit transform seam, ask:

- are the sibling units themselves already proved?
- does the fragment simply become a wrapper list of those units?

If yes, prove it through DOM and browser before reaching for new machinery.

## Related issues

- [2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-list-unit-fragment-proofs-should-treat-list-item-fragments-as-sibling-units-and-assert-real-paste-landings.md)
- [2026-04-05-wrapper-units-can-expand-from-paragraph-plus-list-or-quote-to-paragraph-plus-list-plus-quote-without-a-new-insert-seam.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-units-can-expand-from-paragraph-plus-list-or-quote-to-paragraph-plus-list-plus-quote-without-a-new-insert-seam.md)
