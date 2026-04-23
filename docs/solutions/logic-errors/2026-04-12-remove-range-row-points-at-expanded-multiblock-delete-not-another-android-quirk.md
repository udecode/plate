---
date: 2026-04-12
problem_type: logic_error
component: slate
root_cause: logic_error
title: Remove range row points at expanded multiblock delete not another Android quirk
tags:
  - slate
  - slate-react
  - android
  - chromium
  - deleteFragment
  - deleteBackward
  - multi-block
severity: high
---

# Remove range row points at expanded multiblock delete not another Android quirk

## What happened

The Android `remove` row was promoted into a direct proof surface.

Current setup:

- prepare a model-owned expanded selection from block 0 into block 2
- try to delete the range
- then backspace the rest

Useful findings:

- the prepared selection is real in the model
- the DOM selection is also real on Chromium
- printable replacement over that selection works
- Appium backspace deletes the selected content, but leaves three empty blocks
- Playwright desktop delete/backspace is inert on that prepared range

That means this is not just “another Android weirdness” row.

## Hard read

The remaining problem is clustering around one deeper lane:

- expanded multi-block delete semantics
- delete ownership across browser key paths
- convergence/merge after the deletion

This is a core structural editing problem, not a one-off mobile proof hole.

## Reusable rule

When a remaining Android/manual row shows:

- real prepared selection
- inconsistent delete behavior across transports
- leftover empty blocks instead of converged structure

do not keep attacking it as isolated platform parity.

Promote it into a structural deletion tranche:

1. expanded multi-block `deleteFragment`
2. browser delete key ownership (`Backspace` / `Delete`)
3. post-delete block convergence
