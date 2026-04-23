---
date: 2026-04-04
problem_type: logic_error
component: tooling
root_cause: logic_error
title: Editor benchmark viewers must keep live and snapshot rows separate
tags:
  - benchmarking
  - playwright
  - results-viewer
  - artifacts
  - editor-benchmarks
severity: medium
---

# Editor benchmark viewers must keep live and snapshot rows separate

## What happened

The standalone editor benchmark app tried to "prefer live rows" by mapping live
results onto the frozen snapshot table with row-id replacement.

That was wrong.

The frozen snapshot rows used ids like `mixed-core-mount`.
The live contract rows used ids like `01_ready-empty` and `10_type-middle`.

Those are different benchmark registries, not two copies of the same row set.

The result was predictable garbage:

- the viewer filtered live rows through snapshot-only row ids
- the table could go blank even though live results existed
- fixture counts and active-lane chips drifted from the visible table

At the same time, the first Playwright runner used `Promise.race(...)` timeouts
around `page.evaluate(...)` without isolating lanes.
When one benchmark timed out, the underlying page evaluation kept running and
poisoned the rest of that target run.

## What fixed it

1. Treat live and snapshot rows as separate row universes.
   - keep live contract lanes as their own rows
   - keep frozen snapshot rows as their own rows
   - union them in the viewer instead of pretending their ids are compatible
2. Compute active row ids as a union of:
   - snapshot rows allowed by the selected profile/environment
   - live rows only when the live artifact matches the selected profile/environment
3. Derive active fixtures from those active row ids instead of from one assumed
   row registry.
4. Isolate timed Playwright lanes in separate pages.
   - open a fresh page per benchmark
   - close that page after the lane finishes or times out
   - do not assume `Promise.race` cancels `page.evaluate`
5. Register render waiters before firing benchmark state changes.
   - if the shell records `waitForRender()` after `setState(...)`, a fast render
     can beat the waiter registration and hang the benchmark forever
6. Use per-lane sample counts and timeout budgets.
   - small lanes can afford multiple samples
   - heavy `10k` rich-markdown lanes may need one honest sample instead of five
     fake timeouts

## Reusable rule

For benchmark tooling:

- a live artifact is not a drop-in replacement for a frozen snapshot unless the
  row ids are literally the same contract
- if two result sources use different benchmark ids, render them as separate
  rows or explicitly normalize them first
- Playwright timeout races must isolate or kill the page doing the work, or one
  timed-out lane will contaminate the next one

If the viewer "prefers live rows" by id-mapping two different registries, or
the runner times out a `page.evaluate` without closing that page, the benchmark
tooling is lying.
