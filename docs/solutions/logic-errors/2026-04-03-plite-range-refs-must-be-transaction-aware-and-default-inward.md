---
date: 2026-04-03
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Plite range refs must be transaction-aware and default inward
tags:
  - plite
  - range-ref
  - bookmarks
  - annotations
  - transactions
severity: medium
---

# Plite range refs must be transaction-aware and default inward

## What happened

The next seam after the projection proof was durable annotation anchors.

The tempting shortcut was obvious:

- port legacy `rangeRef`
- let it update eagerly on every op
- keep the old default affinity

That would have been wrong twice.

## What fixed it

The first honest v2 cut worked only after two decisions:

1. range refs became transaction-aware
2. default affinity became `inward`

Transaction awareness matters because `plite` already treats draft mutation as
private. If ref objects update eagerly while `editor.children` still points at
the previous committed snapshot, refs and document state drift out of alignment.

The fix was:

- keep live refs in editor-side runtime state
- clone draft ref values at transaction start
- transform draft ref values as ops apply
- publish `ref.current` only at commit
- drop invalidated refs cleanly on commit or `unref()`

## Why `inward` won

Legacy Plite defaults `rangeRef()` to `forward`, even though `Range.transform()`
itself defaults to `inward`.

For persistent annotation anchors, `forward` is the wrong default.

`inward` is better because insertions at the range boundary do not casually
expand the anchored span. That matches the actual goal:

- keep pointing at the original content
- do not absorb adjacent edits unless explicitly requested

## Reusable rule

For Plite durable anchors:

- refs live in runtime state, not snapshots
- refs transform in the transaction draft, not directly in committed state
- `inward` is the sane default for annotation-style range refs

If a ref design breaks commit alignment or defaults to boundary expansion for no
good reason, it is carrying legacy baggage instead of solving the v2 problem.
