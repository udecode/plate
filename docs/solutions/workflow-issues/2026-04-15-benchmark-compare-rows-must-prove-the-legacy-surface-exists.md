---
title: Benchmark compare rows must prove the legacy surface exists
date: 2026-04-15
category: workflow-issues
module: slate-v2
problem_type: workflow_issue
component: testing_framework
symptoms:
  - a benchmark compare row was tracked as debt even though the legacy surface did not actually support the behavior being measured
  - the lane failed on missing controls because the supposed legacy comparison surface was not a history editor at all
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags:
  - slate-v2
  - benchmarking
  - legacy-compare
  - history
  - huge-document
  - workflow
---

# Benchmark compare rows must prove the legacy surface exists

## Problem

The browser huge-document history compare row looked like ordinary benchmark
debt. It was not. Legacy Slate’s huge-document example was never a
history-backed surface, so the row had no valid comparison target to recover.

## Symptoms

- `pnpm bench:replacement:huge-document:history:local` failed on
  `#huge-document-undo`
- legacy huge-document exposed no undo / redo controls
- deeper inspection showed legacy huge-document was created with `withReact(...)`
  only, not `withHistory(...)`

## What Didn't Work

- Treating the failure like normal harness plumbing.
- Assuming “missing button” meant the compare lane only needed a UI patch.

That was the wrong level. The legacy surface itself did not implement the
behavior.

## Solution

Hard cut the fake row instead of carrying it as future debt.

- removed `bench:replacement:huge-document:history:local` from
  [package.json](/Users/zbeyens/git/slate-v2/package.json)
- deleted
  [huge-document-history.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-history.mjs)
- rewrote live perf docs so
  `pnpm bench:history:compare:local` is the only honest owner for history
  compare truth

Fresh surviving owner rerun:

- typing undo `20.27ms`
- typing redo `17.7ms`
- fragment undo `31.77ms`
- fragment redo `29.11ms`

## Why This Works

It removes a structurally invalid benchmark instead of pretending it has a
repair path.

If the legacy surface never exposed the behavior, there is nothing to compare.
Keeping that row around only pollutes the perf story and invites more bad
benchmark work.

## Prevention

- Before carrying a compare row as debt, verify the legacy target actually
  exposes the behavior being measured.
- Check both UI surface and model shape. Missing controls may be the symptom,
  not the root cause.
- If the legacy target is not the same feature class at all, cut the row.
  Do not invent a new legacy surface just to save a benchmark name.
- Keep one honest owner for each perf claim. For history compare here, that is
  the headless lane, not a fake browser row.

## Related Issues

- [Slate v2 Huge-Document History Lane Cut](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-huge-document-history-lane-cut.md)
- [Slate v2 Release-Readiness Decision](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
