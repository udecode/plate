---
title: Slate built-in normalization cannot be ported naively onto v2
type: solution
date: 2026-04-09
status: completed
category: logic-errors
module: slate-v2
tags:
  - slate
  - slate-v2
  - normalization
  - fallbackElement
  - clipboard
  - range-ref
  - regression
---

# Problem

The obvious next step after recovering `normalizeNode` and `shouldNormalize`
looked like restoring more of legacy Slate's built-in normalization rules,
including `fallbackElement`.

The naive port was wrong.

As soon as it was wired in, current clipboard and range-ref proof blew up across
mixed-inline, wrapper-list, and complex fragment lanes.

# Root Cause

Legacy built-in normalization assumed legacy tree-shape and transform semantics.

`slate-v2` already has a narrower but heavily proved fragment/range-ref model.
Blindly reusing the old child-family rules changes tree shape underneath:

- mixed-inline insertion lanes
- wrapper-list fragment lanes
- selection rebasing
- range-ref rebasing

So the port was not “recovering a missing helper”.
It was changing a foundational contract family.

# Solution

Do not land the naive port.

Revert it, keep the current proof stack green, and treat built-in normalization
parity as a dedicated future recovery lane.

# Why This Works

It keeps the current proved stack honest instead of trading one missing feature
for dozens of regressions.

This is exactly the kind of family where “looks close enough” is bullshit.

# Prevention

- Treat built-in normalization as a contract family, not a tiny helper port.
- If a normalization change moves tree shape, re-run clipboard and range-ref
  proof immediately.
- `fallbackElement` is not a safe quick win in v2 until the fragment and
  rebasing seams are explicitly designed around it.
