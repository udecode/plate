---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 before/after should start as same-text location helpers
tags:
  - slate-v2
  - before
  - after
  - locations
severity: medium
---

# Slate v2 before/after should start as same-text location helpers

## What happened

The docs already advertised `Editor.before(...)` and `Editor.after(...)`, but
the v2 core had no real location-walking seam behind them.

The tempting lie was to keep the legacy signatures in docs and quietly guess at
cross-node cursor walking later.

That would have created two fake public APIs:

- documented breadth with no proved implementation
- helpers that stop being trustworthy inside active transactions

## What fixed it

The first honest cut keeps `before(...)` and `after(...)` narrow:

1. support `Point` and `Range`
2. for `Range`, resolve the start edge for `before(...)` and the end edge for
   `after(...)`
3. read the live draft tree
4. walk only within the current text node
5. return `undefined` at the current text-node boundary

That creates a real location seam without pretending v2 already owns generic
cursor walking.

## Reusable rule

For Slate v2 location helpers:

- land the smallest honest location seam first
- read the live draft tree, not only committed snapshot state
- add cross-node walking only after the lower-level location APIs are real

If `Editor.before(...)` or `Editor.after(...)` promise full location walking
before the core can prove it, they are documentation-shaped lies.
