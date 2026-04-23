---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Multiple complex list units still reduce to one wrapper-list fragment when each unit is already proved
tags:
  - slate-v2
  - list-item
  - wrapper-list
  - sibling-units
  - browser-proof
severity: medium
---

# Multiple complex list units still reduce to one wrapper-list fragment when each unit is already proved

## What happened

After proving one `list-item` unit with:

- paragraph
- nested list
- quote

the next step was selection across multiple sibling units with that same complex
shape.

## What fixed it

It did not need a new seam.

The fragment simply lifts one level:

- each complex `list-item` remains one proved wrapper unit
- selection across sibling units becomes one `bulleted-list` fragment of those
  sibling units
- DOM and Chromium round-trip that wrapper-list fragment cleanly

## Why this works

The wrapper-unit boundary is still doing the real work.

If each sibling unit is already a proved unit shape, then selecting across
multiple siblings does not automatically create a new transform problem.

The fragment is just:

- one proved wrapper list
- containing already-proved wrapper units

## Reusable rule

When widening from one proved wrapper unit to many sibling wrapper units:

- first ask whether the fragment simply becomes one wrapper list of those units
- if yes, prove the round-trip through DOM and browser before inventing a new
  transform abstraction

## Related issues

- [2026-04-05-wrapper-units-can-expand-from-paragraph-plus-list-or-quote-to-paragraph-plus-list-plus-quote-without-a-new-insert-seam.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-units-can-expand-from-paragraph-plus-list-or-quote-to-paragraph-plus-list-plus-quote-without-a-new-insert-seam.md)
