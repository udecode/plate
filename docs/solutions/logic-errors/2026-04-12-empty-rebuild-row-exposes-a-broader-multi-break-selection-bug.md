---
date: 2026-04-12
problem_type: logic_error
component: slate-react
root_cause: logic_error
title: Empty rebuild row exposes a broader multi-break selection bug
tags:
  - slate-react
  - android
  - chromium
  - insertBreak
  - selection
  - deleteBackward
severity: high
---

# Empty rebuild row exposes a broader multi-break selection bug

## What happened

The next Android legacy row after split/join was the empty/delete-rebuild case:

1. type `hello world`
2. press Enter
3. type `hi`
4. press Enter
5. type `bye`
6. backspace everything

The first useful surprise:

- the row is already wrong before the delete phase

On desktop Chromium, the debug state after step 5 was:

- `["hello world", "byei", "h"]`

instead of:

- `["hello world", "hi", "bye"]`

So the row is not just “delete is wrong.”
The selection/break path between consecutive `insertBreak` calls is already
drifting.

## Why this matters

This changes the execution strategy.

Treating each remaining Android manual row as a separate mobile quirk is now
too slow and probably wrong.

The current evidence says the remaining Android/manual rows are clustering
around a broader structural editing lane:

- repeated `insertBreak`
- post-break selection placement
- subsequent typing into the newly created blocks
- delete/merge after that

## Reusable rule

When a later Android/manual row fails, inspect the state before the final user
action.

If the document is already wrong before the “main” operation, pivot the queue
upward:

- from row-by-row platform chasing
- to a shared structural editing bug tranche
