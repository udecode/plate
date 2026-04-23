---
date: 2026-04-12
problem_type: logic_error
component: slate-react
root_cause: logic_error
title: Structured Enter and Backspace need editor owned keydown paths
tags:
  - slate-react
  - android
  - chromium
  - split-join
  - keydown
  - insertBreak
  - deleteBackward
severity: high
---

# Structured Enter and Backspace need editor owned keydown paths

## What happened

The first Android split/join proof row exposed a nasty failure shape:

- collapse selection inside a structured bold text run
- press Enter twice
- press Backspace twice
- expect the original paragraph text to come back

Instead, both Android Appium and desktop Chromium collapsed to:

- `One before two middle`

That proved the row was not only an Android transport problem.

## Root cause

Current `slate-v2` was barely owning structural keyboard editing there.

Plain text insertion had good browser/input coverage, but plain unmodified:

- `Enter`
- `Backspace`
- `Delete`

were still falling through to browser DOM churn instead of the editor’s own
structural operations.

For this row, browser DOM split/join behavior drifted far enough that commit
from DOM lost the suffix.

## What fixed it

Route the unmodified structural keys through editor operations in `Editable`:

- `Enter` -> `Editor.insertBreak(editor)`
- `Backspace` -> `Editor.deleteFragment(...)` when expanded, otherwise
  `Editor.deleteBackward(editor)`
- `Delete` -> `Editor.deleteFragment(...)` when expanded, otherwise
  `Editor.deleteForward(editor)`

Keep modifier variants out of scope for this narrow fix.

That was enough to turn the same semantic row green on:

- desktop Chromium
- Android Appium Chrome emulator

## Why this matters

This is exactly the kind of gap that looks like “Android weirdness” until you
force the same sequence through desktop and see the same break.

The useful move is:

- classify the row as a product-bug candidate
- fix the shared editor-owned path
- only then go back and judge the device-specific result

## Reusable rule

If a browser/input row depends on structural editing, do not trust browser DOM
default behavior to preserve the model.

Own the structural key path in the editor first, then measure platform quirks
on top of that.
