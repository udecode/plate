---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Expanded cross-unit explicit-at rebasing still follows the same container-driven rule
tags:
  - slate-v2
  - explicit-at
  - selection
  - range-ref
  - wrapper-list
severity: medium
---

# Expanded cross-unit explicit-at rebasing still follows the same container-driven rule

## What happened

After proving collapsed later-sibling rebasing, the next real stress case was
expanded selections and range refs that span across sibling complex wrapper
units.

The question was whether broad expanded ranges finally break the current model.

## What fixed it

They did not.

The same container-driven rule still held:

- quote-target inserts can move the later sibling unit
- nested-list-target inserts can leave it alone
- range refs still need to follow the same post-insert selection semantics

## Why this works

Expanding the range across units changes how many points are involved.
It does not change the decisive question:

- which container actually moved because of the explicit target?

As long as that answer stays the same, the broader range still follows the same
rebasing rule.

## Reusable rule

Do not assume expanded cross-unit ranges need a new rebasing model.

First check whether the insert-container story changed.

If it did not, the expanded range should still follow the same rule as the
collapsed case.

## Related issues

- [2026-04-05-selection-driven-explicit-at-rebasing-still-holds-for-broader-sibling-units-with-multi-block-child-containers.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-selection-driven-explicit-at-rebasing-still-holds-for-broader-sibling-units-with-multi-block-child-containers.md)
