---
title: Slate TanStack virtual items must not be memoized
date: 2026-05-03
category: docs/solutions/performance-issues
module: slate-v2 slate-react rendering-strategy virtualization
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - Virtualized editor initially rendered the first viewport correctly
  - Scrolling the full example did not materialize far blocks
  - Metrics stayed stuck on the initial measured item count
root_cause: async_timing
resolution_type: code_fix
severity: high
tags: [slate-v2, tanstack-virtual, rendering-strategy, virtualization, scroll]
---

# Slate TanStack virtual items must not be memoized

## Problem

TanStack Virtual owns a live scroll/measurement state. Wrapping
`virtualizer.getVirtualItems()` in a `useMemo` can freeze Slate's virtualized
rendering plan at the initial viewport even though the virtualizer receives
scroll events.

## Symptoms

- The full virtualized example rendered blocks 1-16.
- Scrolling the editor root to the bottom never mounted `virtualized block 1000`.
- The metrics panel stayed on the initial `virtualizerMeasuredCount`.

## What Didn't Work

- Treating this as a Playwright scroll-target bug. The test was first scoped too
  tightly for the metrics panel, but the second failure was real: the viewport
  range did not update.
- Dispatching a synthetic scroll event manually. TanStack received scroll state,
  but Slate's memoized plan kept returning the old item list.

## Solution

Compute the Slate virtualized plan from the current virtualizer state on each
render. Keep stable configuration in `useMemo`, but do not memoize the
`getVirtualItems()` snapshot.

```ts
const virtualizer = useVirtualizer({
  count,
  estimateSize: () => estimatedBlockSize,
  getItemKey: index => topLevelRuntimeIds[index] ?? index,
  getScrollElement: () => rootElement,
  overscan,
  rangeExtractor,
})

const virtualItems = virtualizer.getVirtualItems().map(item => ({
  index: item.index,
  key: item.key,
  runtimeId: topLevelRuntimeIds[item.index]!,
  size: item.size,
  start: item.start,
}))
```

Do not hide that snapshot inside:

```ts
React.useMemo(() => virtualizer.getVirtualItems(), [virtualizer])
```

The virtualizer object can stay stable while its internal range changes.

## Why This Works

TanStack Virtual triggers React updates as scroll/measurement state changes.
Slate has to re-read the current virtual range during those renders. Memoizing
the derived Slate plan on the virtualizer instance identity keeps stale viewport
items alive and makes scrolling look broken.

## Prevention

- Treat `virtualizer.getVirtualItems()` like a live external-store snapshot.
  Read it during render; do not memoize it by virtualizer identity.
- Browser proof must scroll to a far block and assert that the far block mounts.
  Initial viewport proof is not enough.
- Metrics tests in DOM-lite environments should not require measured browser
  layout. Let the browser test own measured range movement.
- Keep DOM coverage boundaries derived from the current mounted range, not from
  an initial virtualizer snapshot.

## Related Issues

- [Slate rendering strategy needs production RUM metrics](./2026-05-03-slate-rendering-strategy-needs-production-rum-metrics.md)
- [Slate DOM-incomplete work should start with internal coverage boundaries](../developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
