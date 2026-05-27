---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Compatible heterogeneous sibling unit types can share one wrapper-list seam when the container contract still matches
tags:
  - slate-v2
  - wrapper-unit
  - heterogeneous
  - list-item
  - check-list-item
severity: medium
---

# Compatible heterogeneous sibling unit types can share one wrapper-list seam when the container contract still matches

## What happened

After proving compatible homogeneous unit types, the next sharper question was:

- can one wrapper-list container hold more than one compatible sibling unit type?

The concrete probe was:

- `bulleted-list`
- one `list-item`
- one `check-list-item`

Plain round-trip already worked.
The remaining failure was explicit-`at`, because the seam still assumed one
homogeneous sibling unit type.

## What fixed it

The seam should care about compatibility, not identical names.

If the wrapper-list container contract still matches and every sibling is a
compatible block unit, the same seam can apply even when sibling unit types are
not identical.

## Why this works

This still is not a new geometry problem.

The relevant questions are:

- does the outer wrapper-list contract still hold?
- is each sibling still a compatible block unit?

If yes, heterogeneity alone is not enough reason to invent a new seam.

## Reusable rule

Do not confuse “heterogeneous sibling unit types” with “new geometry” by
default.

If the container contract and per-sibling unit compatibility still hold, try to
generalize the seam before designing a new model.

## Related issues

- [2026-04-05-compatible-wrapper-unit-types-should-share-the-seam-once-container-and-sibling-contracts-match.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-compatible-wrapper-unit-types-should-share-the-seam-once-container-and-sibling-contracts-match.md)
