---
date: 2026-04-12
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Android split join proof can expose a structured DOM enter backspace gap
tags:
  - slate-react
  - slate-browser
  - android
  - split-join
  - enter
  - backspace
severity: high
---

# Android split join proof can expose a structured DOM enter backspace gap

## What happened

The first direct Android split/join proof row was supposed to be a transport
question:

- collapse selection inside the bold `middle` leaf
- press Enter twice
- press Backspace twice
- expect the original paragraph text to come back

It failed on Android Appium.
That alone could have been transport noise.

But the same sequence also failed on desktop Chromium with direct Playwright
keyboard input after the same DOM-owned selection setup.

So the useful read is:

- this is not only an Android transport problem
- it exposes a broader structured DOM commit gap in the current stack

## Failure shape

Instead of returning to the original paragraph:

- `One before two middle three after four`

the row collapses down to:

- `One before two middle`

That means the suffix after the split/join sequence is getting dropped.

## Why this matters

This is exactly the kind of legacy Android/manual row that can reveal a deeper
runtime weakness:

- browser-owned selection
- structured text with marks
- Enter/backspace structural churn
- current DOM commit path not owning structure changes robustly enough

## Reusable rule

When an Android direct proof row goes red:

1. rerun the same semantic sequence on desktop Chromium
2. if desktop also fails, reclassify immediately from transport-only suspicion
   to product-bug candidate
3. only then decide whether Android-specific transport work is still the main
   queue
