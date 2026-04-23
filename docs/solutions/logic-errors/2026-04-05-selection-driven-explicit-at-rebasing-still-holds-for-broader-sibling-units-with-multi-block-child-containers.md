---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Selection-driven explicit-at rebasing still holds for broader sibling units with multi-block child containers
tags:
  - slate-v2
  - explicit-at
  - range-ref
  - wrapper-unit
severity: medium
---

# Selection-driven explicit-at rebasing still holds for broader sibling units with multi-block child containers

## What happened

After proving sibling complex wrapper-list fragments where each unit had:

- a paragraph
- a nested list
- a quote

and then widening those child containers to multiple blocks, the next honest
question was explicit-`at` rebasing for later sibling units.

## What fixed it

The current model still held.

The same selection-driven rule survived:

- quote-target inserts can move later sibling units
- nested-list-target inserts can leave later sibling units alone
- range refs should follow the real post-insert selection semantics for that
  container

No new rebasing abstraction was needed.

## Why this works

The child containers got internally broader, but the outer sibling unit and the
real insert container story did not change.

So the same question still decides the result:

- did the explicit target actually move the outer wrapper-list structure?

If yes, later sibling units rebase.
If not, they do not.

## Reusable rule

Do not invent a new explicit-`at` model just because inner child containers got
multi-block.

First check whether the real insert-container semantics are unchanged.

If they are, keep following selection truth.

## Related issues

- [2026-04-05-broader-sibling-unit-explicit-at-rebasing-should-follow-the-real-insert-container-not-a-generic-later-block-shift.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-broader-sibling-unit-explicit-at-rebasing-should-follow-the-real-insert-container-not-a-generic-later-block-shift.md)
- [2026-04-05-multi-block-child-containers-inside-proved-sibling-units-still-reduce-to-one-wrapper-list-fragment.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-multi-block-child-containers-inside-proved-sibling-units-still-reduce-to-one-wrapper-list-fragment.md)
