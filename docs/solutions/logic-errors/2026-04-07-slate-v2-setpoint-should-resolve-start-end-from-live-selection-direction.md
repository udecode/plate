---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 setPoint should resolve start and end from the live selection direction
tags:
  - slate-v2
  - setPoint
  - selection
  - transforms
  - transactions
severity: medium
---

# Slate v2 setPoint should resolve start and end from the live selection direction

## What happened

Once `setSelection(...)`, `deselect(...)`, and `collapse(...)` were real, the
next obvious helper was `setPoint(...)`.

The trap was subtle:

- `start` and `end` are not fixed field names
- they depend on the current selection direction

So a helper that hard-codes `start -> anchor` and `end -> focus` is wrong for
backward selections.

## What fixed it

The honest helper does two things:

1. reads the live draft selection
2. resolves `start` / `end` from the current selection direction before writing

That keeps `setPoint(...)` correct even after earlier draft-time selection
changes inside the same outer transaction.

## Reusable rule

For Slate v2 point-level selection helpers:

- never resolve `start` / `end` without first checking the live selection
  direction
- never read committed selection when a draft selection may already exist

If `setPoint(...)` gets direction wrong, the helper is small but the bug is
not.
