---
title: Overlay perf coverage must include annotation-backed widget churn
date: 2026-04-15
category: workflow-issues
module: slate-v2
problem_type: workflow_issue
component: testing_framework
symptoms:
  - overlay perf proof looked complete even though annotation-backed widget churn had no benchmark owner
  - decoration toggle and hidden-pane rows were green while widget rebasing lived only in correctness tests
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags:
  - slate-v2
  - performance
  - benchmarking
  - overlays
  - annotations
  - widgets
  - rerender-breadth
---

# Overlay perf coverage must include annotation-backed widget churn

## Problem

The decoration / annotation perf story looked more complete than it really was.
We had browser timing for huge-document overlays and locality proof for overlay
toggles plus hidden panes, but annotation-backed widget rebasing still had no
perf-lane owner.

## Symptoms

- `pnpm bench:react:rerender-breadth:local` proved overlay-source toggle
  locality and hidden-pane `Activity` behavior, but nothing about
  annotation-driven widget churn.
- Widget behavior was covered in correctness tests, which is not the same thing
  as a perf or locality benchmark.
- It was too easy to say “overlay perf is covered” and miss the widget hole.

## What Didn't Work

- Treating correctness coverage as if it were perf coverage. The
  `annotation-store-contract.tsx` and `widget-layer-contract.tsx` tests proved
  semantics, not benchmark ownership.
- Pretending the existing huge-document overlay lane covered everything. It
  measures browser wall time after overlay and sidebar churn, not mounted
  rerender breadth for annotation-backed widgets.

## Solution

Extend the existing rerender-breadth lane with one annotation-backed widget row
instead of inventing a new benchmark family.

The added row:

- creates one annotation bookmark on the left block
- derives one widget from that annotation
- performs a local text insert that rebases the anchor
- measures rerender breadth across:
  - edited left text
  - annotation projection slice
  - annotation sidebar slice
  - annotation-backed widget slice
  - unrelated right text

Fresh result:

- left text rerenders: `1`
- annotation projection rerenders: `1`
- annotation sidebar rerenders: `1`
- annotation widget rerenders: `1`
- unrelated right text rerenders: `0`
- mean edit cost: `0.29ms`

Relevant files:

- [rerender-breadth.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx)
- [annotation-store-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx)
- [widget-layer-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/widget-layer-contract.tsx)

## Why This Works

It closes the real gap instead of broadening the benchmark matrix for no reason.

- Overlay toggle locality still proves projection-source churn.
- Hidden-pane `Activity` still proves offscreen ownership and resume behavior.
- The new row proves annotation store updates and annotation-backed widget
  visibility stay local too.

Together, those rows finally cover the overlay family as a family instead of as
two isolated tricks.

## Prevention

- When auditing overlay perf, explicitly check three churn classes:
  projection-source toggles, hidden-pane resume, and annotation-backed widget
  rebasing.
- Do not treat correctness tests as perf ownership.
- Prefer extending an existing locality lane before creating a brand-new
  benchmark family.
- If a rerender benchmark writes artifacts under a filtered package cwd, record
  the real artifact path in docs instead of guessing a repo-root `tmp/` path.

## Related Issues

- [Slate React v2 projection proof must split range semantics from the React overlay store](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-react-v2-projection-proof-must-split-range-semantics-from-react-overlay-store.md)
- [Slate v2 Rerender Breadth Batch](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-rerender-breadth-batch.md)
- [Slate v2 Decoration Perf Coverage Audit](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-decoration-perf-coverage-audit.md)
