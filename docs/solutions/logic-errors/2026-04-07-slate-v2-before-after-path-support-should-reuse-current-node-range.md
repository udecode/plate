---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 before/after path support should reuse the current node range
tags:
  - slate-v2
  - before
  - after
  - path
  - locations
severity: medium
---

# Slate v2 before/after path support should reuse the current node range

## What happened

Once `Editor.before(...)` and `Editor.after(...)` had honest `Point | Range`
support, the next hole was `Path`.

The tempting lie was to bolt on a second path-walking branch that guessed at
the relevant edge directly.

That would have duplicated logic the core already exposes through
`getCurrentRangeForPath(...)`.

## What fixed it

The honest cut is tiny:

1. resolve `Path` to the current node range
2. reuse the existing `Range` edge logic
3. step through the same location seam as `Point` / `Range`

That keeps `Path` support as a thin adapter instead of a separate walking
implementation.

## Reusable rule

For Slate v2 location helpers:

- if `Path` means “the current node range”, resolve it once and reuse the
  existing `Range` path
- do not add a second path-specific stepping algorithm

If `Path` support and `Range` support walk differently, one of them is wrong.
