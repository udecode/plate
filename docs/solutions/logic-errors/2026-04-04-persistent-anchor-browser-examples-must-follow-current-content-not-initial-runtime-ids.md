---
date: 2026-04-04
problem_type: logic_error
component: testing_framework
root_cause: logic_error
title: Persistent anchor browser examples must follow current content not initial runtime ids
tags:
  - slate-browser
  - slate-react-v2
  - range-ref
  - projections
  - playwright
severity: medium
---

# Persistent anchor browser examples must follow current content not initial runtime ids

## What happened

The first browser example for persistent annotation anchors tried to pin the UI
to the original text runtime ids from the initial snapshot.

That worked until a fragment insert landed before the anchored text.

At that point the example either:

- pointed at stale ids
- crashed when a previously saved id no longer mapped the way the example
  assumed
- or asserted the wrong document shape entirely

## Why this was wrong

The browser example was testing the wrong thing.

For this seam, the contract is:

- the anchor stays attached to the same logical content
- the rendered projection follows that content through document changes

It is **not**:

- the original runtime id must remain the browser example’s stable handle

In practice, a multi-block fragment insert at a text point also produced a more
interesting real shape than the naive expectation:

- `alpha|beta`
- becomes `intro-a|intro-balpha|beta`

The anchor rebased correctly inside the merged `intro-balpha` text.

## What fixed it

The browser example switched from “remember the first runtime ids forever” to
“follow the current content in the latest snapshot”:

- derive current rows from the latest top-level text snapshot
- locate the current anchored row by text/content semantics
- let `useSlateProjections(...)` speak for the current runtime id
- target edits using the current path for the logical row, not a stale path or
  stale id

That keeps the example honest about what the user cares about.

## Reusable rule

For browser examples around persistent Slate anchors:

- follow current logical content from the latest snapshot
- do not pin the example UI to initial runtime ids across structural edits
- assert the real fragment semantics you observe, not the cleaner shape you
  hoped would happen

If a browser regression is supposed to prove anchor persistence, content
ownership beats initial id ownership.
