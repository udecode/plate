---
title: Slate v2 huge-document typing needs selector-fanout cuts before islands
date: 2026-04-11
category: docs/solutions/performance-issues
module: Slate v2 React runtime
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - "Huge-document typing stayed badly behind legacy chunking at `5000` and `10000` blocks even after the core fast path landed"
  - "The browser lane looked React-bound while the core-only huge-document lane had already collapsed"
  - "Each `EditableTextBlocks` descendant and bound text node added multiple `Editor.subscribe(...)` listeners and repeated snapshot walks"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - slate
  - slate-v2
  - slate-react
  - performance
  - huge-document
  - typing
  - subscriptions
  - runtime
---

# Slate v2 huge-document typing needs selector-fanout cuts before islands

## Problem

Huge-document typing was still losing hard to legacy chunking even after the
core transaction fast path landed.

That made it tempting to jump straight to semantic islands or active-corridor
work. That would have been premature.

## Symptoms

- core-only huge-document typing had already dropped to near-noise, so the
  browser gap no longer matched the engine bill
- the `5000`-block browser compare still showed v2 typing around `71ms` while
  legacy chunking sat around `18ms`
- `EditableTextBlocks` and `EditableText` were stacking many independent
  selector subscriptions across the same runtime ids and paths

## What Didn't Work

- treating the remaining typing loss as a core problem after the direct text-op
  fast path had already moved the core lane
- jumping to large-document view architecture before cutting obvious runtime
  subscription fanout
- accepting path/id join-split churn in hot rendering paths just because the
  rerender counts looked “local enough”

## Solution

Cut the React runtime tax first in these files:

- [editable-text-blocks.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx)
- [editable-text.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx)

Kept changes:

- collapse multiple selector subscriptions for one descendant into one bound
  selector result
- collapse multiple selector subscriptions for one bound text node into one
  bound selector result
- stop serializing runtime-id arrays and paths into hot string join/split loops
- when a text descendant is already resolved by the parent, pass text and marks
  straight through instead of subscribing again in `EditableText`

Secondary runtime cleanup:

- replace fragile JSX-runtime assumptions in tiny presentational
  `slate-react` source components with explicit `createElement(...)` usage so
  Next dev can run the source package reliably during browser benchmarks

Measured results:

- `5000` blocks, current v2:
  - ready `881.50ms -> 824.89ms`
  - type `71.18ms -> 65.45ms`
  - select-all `19.36ms -> 17.63ms`
  - paste `96.68ms -> 93.44ms`
- `1000`-block huge-document gate lane after the same batch:
  - ready `470.20ms`
  - type `13.78ms`
  - select-all `2.74ms`
  - paste `37.41ms`
  - delta vs legacy: ready `-160.17ms`, type `-6.90ms`, select-all
    `-71.49ms`, paste `-69.31ms`

## Why This Works

The problem was not only “too many rerenders.” It was too many subscriptions
and too much repeated selector work per committed snapshot.

Before the cut:

- one text leaf could subscribe multiple times for text, marks, and runtime id
- one descendant node could subscribe separately for node data, child ids, and
  path data
- hot code rebuilt runtime-id strings and parsed them back into arrays or paths

That meant a single committed edit still fanned out a lot of React-side work
even when the engine was already cheap.

After the cut:

- one runtime node pays one selector read instead of several
- already-known text leaves do not subscribe again just to rediscover the same
  text and marks
- hot selectors compare structured arrays and paths directly instead of wasting
  time on string churn

The runtime still loses to chunking on typing at scale, but it loses by less
and for a cleaner reason.

## Prevention

- once the core lane collapses, stop blaming the core for browser typing loss
- count selector subscriptions, not just rerenders
- if a parent render already owns the current text node, do not resubscribe in
  the child just to rediscover the same data
- avoid join/split string contracts in hot render paths when the real data is
  already arrays and paths
- do not jump to islands or occlusion before obvious runtime subscription tax is
  cut

## Related Issues

- Related plan:
  [2026-04-11-slate-v2-react-perfect-runtime-opti-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-11-slate-v2-react-perfect-runtime-opti-plan.md)
- Related review:
  [chunking-review.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/chunking-review.md)
