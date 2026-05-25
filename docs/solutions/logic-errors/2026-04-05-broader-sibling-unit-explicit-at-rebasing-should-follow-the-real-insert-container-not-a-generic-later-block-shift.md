---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Broader sibling-unit explicit-at rebasing should follow the real insert container not a generic later-block shift
tags:
  - slate-v2
  - range-ref
  - explicit-at
  - wrapper-unit
severity: medium
---

# Broader sibling-unit explicit-at rebasing should follow the real insert container not a generic later-block shift

## What happened

Once broader sibling wrapper-list fragments were proved, the next real seam was
explicit-`at` rebasing.

The failure showed up when:

- a later complex sibling unit was selected
- the explicit insertion target sat inside a nested list within an earlier unit

The real editor selection stayed put.
`RangeRef` tried to jump as if the whole later sibling block had shifted.

## What fixed it

The durable rule was:

- for broader block-unit inserts, let `RangeRef` follow the same semantics as
  the real editor selection
- do not apply a generic “later block must shift” story when the actual insert
  happened inside a nested container that did not move the later sibling unit

In practice, the safest move was to simulate the selection result for the
inserted fragment and reuse that as the range-ref truth for the block-unit seam.

## Why this works

The bug was not “range refs need more rebasing.”

It was “range refs were rebasing according to the wrong container.”

For broader sibling units:

- quote-target inserts can split the earlier unit and move later siblings
- nested-list-target inserts can stay inside that nested list and leave later
  sibling units alone

The correct answer depends on the actual insert container, not on a generic
later-block heuristic.

## Reusable rule

For explicit-`at` rebasing across broader wrapper units:

- treat the editor’s real post-insert selection semantics as the source of truth
- only shift later sibling units when the insert actually split the ancestor
  wrapper-list structure
- if a generic rebasing rule and real selection disagree, the generic rule is
  the suspect

## Related issues

- [2026-04-05-multiple-complex-list-units-still-reduce-to-one-wrapper-list-fragment-when-each-unit-stays-proved.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-multiple-complex-list-units-still-reduce-to-one-wrapper-list-fragment-when-each-unit-stays-proved.md)
