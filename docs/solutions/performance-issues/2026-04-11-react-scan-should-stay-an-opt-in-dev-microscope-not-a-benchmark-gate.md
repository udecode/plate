---
title: React Scan should stay an opt-in dev microscope, not a benchmark gate
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Huge-document typing still lagged legacy chunking at `5000` and `10000` blocks, but the kept rerender-breadth lane already showed mostly local invalidation"
  - "It was tempting to bolt on a visual profiler and treat its overlays as the new source of truth"
  - "The team needed a fast way to inspect runtime behavior during large-document experiments without polluting the benchmark program"
root_cause: inadequate_documentation
resolution_type: process_improvement
severity: medium
tags:
  - slate-v2
  - slate-react
  - performance
  - huge-document
  - profiling
  - react-scan
  - runtime
---

# React Scan should stay an opt-in dev microscope, not a benchmark gate

## Problem

The large-document roadmap still needed more experimentation, but adding
another profiler without a clear role was a good way to create fake certainty.

`react-scan` is useful for showing what React is touching. It is not useful as
the thing that decides whether the architecture is right.

## Symptoms

- kept browser lanes already existed for huge-document typing, select-all, and
  paste
- kept breadth lanes already showed that sibling-leaf and ancestor breadth were
  mostly green
- a visual profiler could easily duplicate existing knowledge while still
  perturbing the runtime enough to make timing numbers lie

## What Didn't Work

- treating profiler overlays as if they were benchmark artifacts
- adding a permanent dependency just to support a temporary local experiment
- wiring a profiler into normal runs instead of making it explicit and opt-in

## Solution

Use `react-scan` only as an opt-in local profiler in the `site` app.

Kept integration:

- [site/pages/_app.tsx](/Users/zbeyens/git/slate-v2/site/pages/_app.tsx)
  checks for `?reactScan=1`
- when present in development, it injects the official loader:
  `https://unpkg.com/react-scan/dist/auto.global.js`
- without that query param, the app behaves exactly as before

This keeps the tool available for experimentation while leaving the benchmark
lanes clean.

## Why This Works

The repo already has the real truth sources:

- huge-document benchmark lanes
- chunking compare lanes
- rerender-breadth lane

Those tell us whether a change is worth keeping.

`react-scan` answers a different question:

- what is React touching during this local experiment?

That makes it a microscope, not the judge.

## Prevention

- keep visual profilers opt-in
- never promote profiler overlays to gate truth
- if profiler output and kept benchmarks disagree, trust the kept benchmarks
- use `react-scan` for:
  - huge-document typing investigation
  - shell-promotion experiments
  - broad-op regression diagnosis
- stop using it once it stops changing design decisions

## Related Issues

- [2026-04-11-slate-v2-proof-first-large-document-layer-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-proof-first-large-document-layer-plan.md)
- [2026-04-11-slate-v2-rerender-breadth-batch.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-rerender-breadth-batch.md)
- [2026-04-11-slate-react-rerender-breadth-is-mostly-local-and-useSlate-is-the-only-broad-hook-left.md](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-slate-react-rerender-breadth-is-mostly-local-and-useSlate-is-the-only-broad-hook-left.md)
