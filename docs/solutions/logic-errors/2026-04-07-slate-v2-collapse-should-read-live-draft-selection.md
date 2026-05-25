---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 collapse should read the live draft selection
tags:
  - slate-v2
  - collapse
  - selection
  - transforms
  - transactions
severity: medium
---

# Slate v2 collapse should read the live draft selection

## What happened

After `setSelection(...)` and `deselect(...)`, the next obvious helper was
`collapse(...)`.

The trap was the same as before:

- read `editor.selection`
- collapse that value
- call it done

That would have been wrong inside an outer transaction, because
`editor.selection` still points at committed state while the draft selection may
already have changed.

## What fixed it

The honest helper reads the same seam as the other narrow selection helpers:

- draft selection when a transaction is open
- committed snapshot selection otherwise

Then it collapses to one of four edges:

- `anchor`
- `focus`
- `start`
- `end`

## Reusable rule

For Slate v2 selection helpers:

- edge semantics are easy
- draft-state correctness is the real problem

If `collapse(...)` reasons from committed selection while draft edits are still
in flight, the helper is not transaction-aware no matter how nice the API
looks.
