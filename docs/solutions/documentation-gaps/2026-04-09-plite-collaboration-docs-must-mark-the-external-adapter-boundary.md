---
title: Plite collaboration docs must mark the external adapter boundary
type: solution
date: 2026-04-09
status: completed
category: documentation-gaps
module: plite
tags:
  - slate
  - plite
  - collaboration
  - yjs
  - docs
  - boundaries
---

# Problem

The collaboration walkthrough described a real Yjs setup, but it read too much
like a local `plite` capability claim.

That is dangerous because `plite` proves the operation/history substrate,
but it does **not** ship `plite-yjs`, providers, or cursor overlays.

# Root Cause

The guide mixed two truths without naming the boundary:

- local core/history integrity
- external adapter integration

When that line stays implicit, readers infer a stronger repo-local
collaboration surface than actually exists.

# Solution

Mark the boundary explicitly in the docs:

- local `plite` proves operation/history integrity
- external `plite-yjs` owns CRDT/provider/cursor integration
- the walkthrough is an external-adapter guide, not a local package claim

# Why This Works

It lets the docs stay useful without lying about product surface.

Readers still get the integration path they need, and maintainers stop paying
the cost of a fake local collaboration claim.

# Prevention

- If a guide depends on an external adapter, say so plainly near the top.
- Do not let “example integration” read like “repo-local feature.”
- For collaboration docs specifically, separate:
  - operation/history substrate proved locally
  - CRDT/provider integration owned externally
