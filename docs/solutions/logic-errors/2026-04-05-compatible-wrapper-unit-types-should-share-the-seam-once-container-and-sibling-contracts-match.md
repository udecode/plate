---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Compatible wrapper-unit types should share the seam once container and sibling contracts match
tags:
  - slate-v2
  - list-item
  - check-list-item
  - wrapper-unit
severity: medium
---

# Compatible wrapper-unit types should share the seam once container and sibling contracts match

## What happened

After proving container flavors like:

- `bulleted-list`
- `ordered-list`

the next candidate seam was unit type:

- `check-list`
- `check-list-item`

Plain round-trip already worked.
Explicit-`at` failed only because the wrapper-unit seam still hardcoded
`list-item`.

## What fixed it

The seam should care about the sibling-unit contract, not one literal type name.

Once the container is a supported wrapper-list container and every child shares
one compatible unit type, that unit type should reuse the same seam.

The concrete proof here was `check-list` / `check-list-item`.

## Why this works

This still is not new geometry.

The important properties are:

- one compatible wrapper-list container
- one homogeneous sibling unit type
- one stable insert/rebase story

If those match, the seam should generalize.

## Reusable rule

Do not treat a new unit type as a new geometry problem when:

- the container contract matches
- the sibling-unit contract matches
- the structure and rebasing behavior stay the same

Generalize the seam first.

## Related issues

- [2026-04-05-wrapper-unit-insert-seams-should-generalize-from-bulleted-list-to-compatible-list-containers-before-adding-new-geometry.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-unit-insert-seams-should-generalize-from-bulleted-list-to-compatible-list-containers-before-adding-new-geometry.md)
