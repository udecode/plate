---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 adjacent mixed-inline range delete should share the edge-delete helper
tags:
  - slate-v2
  - delete
  - mixed-inline
  - ranges
  - transforms
severity: medium
---

# Slate v2 mixed-inline range delete should share the edge-delete helper

## What happened

Once collapsed mixed-inline delete across adjacent sibling leaves was real, the
next obvious hole was explicit non-empty `Range` deletion for the same shape,
and then the wider version where the range fully covers interior descendants
between the start/end edges.

The tempting lie was to bolt a second bespoke mixed-inline delete path onto
explicit ranges and leave collapsed delete on its own helper.

That would have created two code paths for the same structural shape.

## What fixed it

The honest follow-on reused the same edge-delete helper as the entry point and
then let it grow to remove fully covered interior descendants too, for both:

1. explicit non-empty `Range`
2. current non-empty selection when `at` is omitted

So mixed-inline range delete now has one structural implementation regardless of
whether the range started collapsed and was expanded through
`before(...)` / `after(...)` or was already explicit, and regardless of whether
the interior span is only adjacent sibling leaves or also contains fully
covered descendants.

## Reusable rule

For Slate v2 delete semantics:

- if two delete shapes collapse to the same structural leaf-boundary case, they
  should share one helper
- do not fork collapsed and explicit range deletion unless the tree shape truly
  differs

If mixed-inline range delete needs two helpers for the same shape, one of
them is probably bullshit.
