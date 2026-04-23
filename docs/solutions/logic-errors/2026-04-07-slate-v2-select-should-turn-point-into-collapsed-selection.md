---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 select should turn Point into a collapsed selection
tags:
  - slate-v2
  - select
  - selection
  - transforms
severity: medium
---

# Slate v2 select should turn Point into a collapsed selection

## What happened

The docs already described `Transforms.select(...)` in terms of `Location`, but
the current helper only handled `Range | null`.

The next honest cut was not full legacy parity. It was just this:

- accept a `Path`
- accept a `Point`
- turn a `Path` into the exact current node range
- turn a `Point` into a collapsed selection

## What fixed it

The helper now accepts:

- `Path`
- `Range`
- `Point`
- `null`

When the target is:

- a `Path`, it creates the exact current node range
- a `Point`, it creates a collapsed selection at that point

## Reusable rule

For Slate v2 selection helpers:

- widen `Location` support in honest cuts
- if a smaller location can be represented exactly as a range, do that first
- do not claim broad path/location parity before the engine actually owns it

If `select(...)` can already express a smaller case exactly, that is the right
next cut. Not a bigger lie.
