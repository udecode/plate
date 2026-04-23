---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 selection helpers must read the live draft selection
tags:
  - slate-v2
  - selection
  - transforms
  - transactions
  - draft-state
severity: medium
---

# Slate v2 selection helpers must read the live draft selection

## What happened

The next narrow selection slice after `select(...)` was:

- `Transforms.setSelection(...)`
- `Transforms.deselect(...)`

The tempting shortcut was to implement both helpers on top of `editor.selection`.

That would have been wrong inside an outer `Editor.withTransaction(...)` block.

During an active transaction, `editor.selection` still reflects the committed
snapshot. The live draft selection may already have changed.

## What fixed it

The honest fix was to read the current selection from the same seam the core
uses:

- draft selection when a transaction is open
- committed snapshot selection otherwise

That lets helper calls compose correctly after earlier draft-time edits in the
same outer transaction.

## Reusable rule

For Slate v2 selection helpers:

- never read `editor.selection` if the helper must work inside an active outer
  transaction
- read the live draft selection first
- fall back to the committed snapshot only when no transaction is open

If a helper silently reasons from committed selection while draft edits are in
flight, it is not a real transaction-aware API.
