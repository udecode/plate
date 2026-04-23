---
title: Slate public-surface closure docs must distinguish current-claim cleanup from broad-lane closure
type: solution
date: 2026-04-09
status: completed
category: documentation-gaps
module: slate-v2
tags:
  - slate
  - slate-v2
  - public-surface
  - docs
  - proof-ledger
  - control-docs
---

# Problem

A narrower public-surface cleanup note said the batch was “closed for the
current claim”, while the live proof ledger still had a stack of `public
surface` rows marked `partial`.

That is enough to mislead maintainers into thinking the broad lane is done when
it is not.

# Root Cause

Two different scopes were collapsed into one phrase:

- narrower current-claim cleanup
- broad package-level public-surface closure

Without naming that distinction, the historical plan started sounding like the
live owner.

# Solution

Keep the scopes separate:

- historical/current-claim cleanup notes should say they were precursor work
- the broad lane closes only when the live proof ledger rows are actually
  closed
- the live roadmap/verdict stack must follow the proof ledger, not the older
  cleanup note

# Why This Works

It keeps the control stack honest.

Readers can still reuse the earlier cleanup note, but they no longer confuse it
with the moment the broad lane actually closed.

# Prevention

- If a plan says “closed for the current claim”, make it explicit whether that
  is the whole live lane or only a narrower precursor.
- Do not let historical cleanup notes outrank live proof rows.
- Broad public-surface closure requires the proof ledger, package matrix, and
  control docs to agree in the same turn.
