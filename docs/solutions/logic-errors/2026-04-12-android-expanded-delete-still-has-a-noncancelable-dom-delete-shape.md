---
date: 2026-04-12
problem_type: logic_error
component: slate-react
root_cause: logic_error
title: Android expanded delete still has a noncancelable DOM delete shape
tags:
  - slate-react
  - android
  - deleteFragment
  - appium
  - react
  - dom
severity: high
---

# Android expanded delete still has a noncancelable DOM delete shape

## What happened

The `remove-range` row split into two different truths:

- core expanded multi-block delete was genuinely too narrow and is now fixed
- Chromium browser proof is now green on the same row
- Android Appium still fails

The Android failure shape is not subtle.

After the prepared expanded selection:

- the selected content is gone
- but React crashes during DOM reconciliation with
  `NotFoundError: Failed to execute 'removeChild' on 'Node'`

That means the browser deleted DOM the current runtime thought it still owned.

## Why this matters

This is the strongest current evidence that the remaining Android lane is no
longer about generic parity rows.

It is about Android-specific noncancelable or double-owned delete behavior,
which is exactly the class legacy Slate React used Android-specialist handling
for.

## Reusable rule

When:

- core/headless delete is green
- Chromium browser delete is green
- Android direct delete still crashes in DOM reconciliation

do not keep calling it a generic structural editing bug.

Promote it into an Android-specific delete/input-management tranche.
