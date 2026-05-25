---
title: Source-scoped overlay invalidation proof must separate recompute selectivity from subscriber fan-out
date: 2026-04-20
category: performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: testing_framework
symptoms:
  - source-scoped invalidation was still listed as a missing perf owner even though rerender breadth already covered adjacent overlay-locality rows
  - it was easy to blur selective projection-store recompute with selective runtime-id subscriber delivery
  - docs could claim either “no owner exists” or “the lane is solved” without a command that split those two questions
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags:
  - slate-v2
  - slate-react
  - performance
  - benchmarking
  - overlays
  - invalidation
  - rerender
  - projections
---

# Source-scoped overlay invalidation proof must separate recompute selectivity from subscriber fan-out

## Problem

The perf lane kept treating source-scoped invalidation like an abstract future
promise.

That was too fuzzy. We already had a live React locality benchmark, but it did
not explicitly prove whether source dirtiness stayed selective, and it did not
distinguish that from the separate question of whether touched store
subscribers still fan out too broadly.

## Symptoms

- `source-scoped overlay invalidation` stayed marked as “no command-backed live
  proof yet” in the control docs.
- The existing rerender lane proved selection breadth, deep ancestor locality,
  decoration toggle breadth, hidden `Activity`, and annotation-backed widget
  churn, but not the exact dirtiness-class split.
- It was too easy to hand-wave with “overlay locality is green” or “source
  invalidation is still missing” depending on the mood of the doc writer.

## What Didn't Work

- Treating `decorationSourceToggleBreadth` as if it answered the whole
  source-invalidation question. It only proved one external refresh path.
- Treating the absence of a dedicated row as proof that no owner existed.
- Treating rerender breadth and recompute breadth as the same thing. They are
  not.

## Solution

Extend the live
[rerender-breadth.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx)
owner with one explicit `sourceScopedInvalidation` row instead of inventing a
second benchmark family.

The new row creates three projection stores on the same editor:

- a `selection`-dirty store
- a `text`-dirty store
- an `external`-dirty store

Then it drives three operations and records recompute deltas separately:

```tsx
const selectionStore = createSlateProjectionStore(editor, deriveSelectionRanges, {
  dirtiness: 'selection',
  sourceId: 'selection-source',
})

const textStore = createSlateProjectionStore(editor, deriveTextTailRanges, {
  dirtiness: 'text',
  sourceId: 'text-source',
})

const externalStore = createSlateProjectionStore(
  editor,
  () => deriveExternalRanges(externalActiveRef.current),
  {
    dirtiness: 'external',
    sourceId: 'external-source',
  }
)
```

Fresh kept result from `bun run bench:react:rerender-breadth:local`:

- selection change:
  - selection recompute count: `1`
  - text recompute count: `0`
  - external recompute count: `0`
- text edit:
  - selection recompute count: `0`
  - text recompute count: `1`
  - external recompute count: `0`
- external refresh:
  - selection recompute count: `0`
  - text recompute count: `0`
  - external recompute count: `1`

That proves the dirtiness classes are selective.

The same row also exposes the still-open part:

- selection store subscriber rerenders: left `1`, right `1`
- text store subscriber rerenders: left `1`, right `1`
- external store subscriber rerenders: left `1`, right `1`

So the current store layer does decide *which store* needs recompute, but once a
store snapshot changes, both runtime-id subscribers on that store still rerender
together.

## Why This Works

It splits one muddy perf argument into two crisp questions:

1. Does the runtime recompute only the touched source class?
2. Once that store changes, does subscriber delivery stay local inside the
   store?

Before this row, those questions were getting mashed together.

Now the answer is explicit:

- recompute selectivity: yes
- per-store subscriber locality: not yet

That is a much better checkpoint than either fake green or fake missing.

## Prevention

- When adding overlay perf proof, separate recompute metrics from rerender
  metrics. One without the other invites bullshit conclusions.
- Prefer extending the existing owner command when the new question is adjacent
  to the same runtime family.
- Do not mark a perf lane “missing” once a command exists just because the
  result is not fully green.
- Do not mark a perf lane “closed” just because recompute counts are selective;
  subscriber delivery may still be too broad.

## Related Issues

- [Slate React rerender breadth is mostly local and useSlate is the only broad hook left](/Users/zbeyens/git/plate-2/docs/solutions/performance-issues/2026-04-11-slate-react-rerender-breadth-is-mostly-local-and-useSlate-is-the-only-broad-hook-left.md)
- [Overlay perf coverage must include annotation-backed widget churn](/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-15-overlay-perf-coverage-must-include-annotation-widget-churn.md)
- [Slate DOM + React Tranche 5/6 Execution](/Users/zbeyens/git/plate-2/docs/plans/2026-04-19-slate-dom-react-tranche-5-6-execution.md)
