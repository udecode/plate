---
date: 2026-04-12
problem_type: logic_error
component: testing_framework
root_cause: async_timing
title: Structural break proof rows need selection sync before follow up typing
tags:
  - slate-react
  - slate-browser
  - android
  - chromium
  - insertBreak
  - selection
severity: medium
---

# Structural break proof rows need selection sync before follow up typing

## What happened

The Android `empty` / delete-rebuild row first looked like a serious product
bug.

Fast automation produced:

- `["hello world", "byei", "h"]`

after:

1. `hello world`
2. `Enter`
3. `hi`
4. `Enter`
5. `bye`

That looked like repeated `insertBreak` was still broken.

It wasn’t, at least not in the user-facing way the row was meant to prove.

The real issue was proof pacing.

## What fixed it

Add a short wait after structural `Enter` before typing into the new block.

With a small delay for selection sync:

- Chromium lands on `["hello world", "hi", "bye"]`
- Android Appium also lands on the correct final empty state after full delete

## Why this matters

Structural editor operations can be correct while the test still lies if it
types into the next block before the DOM selection has caught up to the model.

That is different from the real split/join bug that needed editor-owned
keydown handling.

## Reusable rule

For proof rows that chain:

- `insertBreak`
- immediate follow-up typing into the new block

wait briefly for selection sync before typing the next text segment.
