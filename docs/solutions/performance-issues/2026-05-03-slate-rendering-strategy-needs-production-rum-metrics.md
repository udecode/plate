---
title: Slate rendering strategy needs production RUM metrics
date: 2026-05-03
category: docs/solutions/performance-issues
module: slate-v2 slate-react rendering-strategy performance
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - Local benchmark JSON could prove lab timings but not which real cohort regressed in production
  - Shell and virtualized modes had different native-behavior contracts but no app-facing metric seam
  - DOM/coverage/mounted-count evidence lived in benchmark profiles instead of the runtime surface apps can tag
root_cause: missing_tooling
resolution_type: tooling_addition
severity: medium
tags: [slate-v2, rendering-strategy, rum, metrics, virtualization, dom-coverage]
---

# Slate rendering strategy needs production RUM metrics

## Problem

Rendering strategy work can look good in local benchmark artifacts while production users still hit the wrong cohort, strategy, or native-behavior tradeoff. The runtime needs a small app-facing metric seam so products can tag RUM or Datadog rows with the same facts used in lab proof.

## Symptoms

- Benchmarks tracked DOM nodes, editable descendants, shell count, heap, and coverage boundaries, but apps had no equivalent runtime callback.
- `shell` and `virtualized` modes could not be compared honestly in production dashboards without custom DOM scraping.
- Phase 8 virtualization showed good ready/select-all rows but bad 50000-block edit lanes, which made a production cohort split mandatory.

## What Didn't Work

- Treating benchmark artifacts as enough. They are lab evidence, not production observability.
- Mixing shell and virtualized timings into default staged rows. That hides degraded-mode behavior under a better-looking aggregate.
- Adding a fake Datadog integration in raw Slate. Slate should expose metrics; apps own where those metrics are sent.

## Solution

Add an `Editable` callback that reports rendering strategy surface metrics after commit:

```tsx
<Editable
  renderingStrategy="staged"
  onRenderingStrategyMetrics={(metrics) => {
    datadogRum.addAction('slate.rendering_strategy.surface', metrics)
  }}
/>
```

The metric payload includes:

- document cohort and size;
- requested and effective rendering strategy;
- mounted and pending group counts;
- mounted and pending top-level counts;
- native surface completion;
- DOM coverage boundary counts by reason;
- visible DOM node count;
- editable descendant count.

In Slate v2 this landed through `onRenderingStrategyMetrics` and exported `EditableRenderingStrategyMetrics`. Tests cover staged and virtualized surfaces.

## Why This Works

The callback keeps raw Slate unopinionated while giving products the exact tags they need for dashboards. Benchmarks still own lab proof; RUM owns production drift. Keeping the strategy fields separate prevents shell or virtualized stress rows from polluting default staged-rendering claims.

## Prevention

- Every rendering strategy that changes DOM coverage needs a production metric seam, not only a benchmark row.
- Dashboard tags should include interaction name, cohort, document size, requested strategy, effective strategy, boundary count, visible DOM count, editable descendant count, custom renderer flag, browser, mobile/desktop, IME, and release.
- Keep degraded strategies separate in dashboards. If a strategy changes browser find, screen-reader traversal, selection, copy, paste, IME, or mobile semantics, aggregate charts must not hide that.
- Do not stabilize an experimental strategy just because ready time is good. Edit interactions and native behavior rows decide release posture.

## Related Issues

- [Slate DOM-incomplete work should start with internal coverage boundaries](../developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
- [Slate v2 legacy compare benchmark must align Bun workspace source and built React surfaces](./2026-05-01-slate-v2-legacy-compare-benchmark-must-align-bun-workspace-source-and-built-react-surfaces.md)
