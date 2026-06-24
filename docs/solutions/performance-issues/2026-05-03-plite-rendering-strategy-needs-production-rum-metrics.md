---
title: Plite DOM strategy needs production RUM metrics
date: 2026-05-03
last_updated: 2026-05-22
category: docs/solutions/performance-issues
module: plite slate-react dom-strategy performance
problem_type: performance_issue
component: frontend_stimulus
symptoms:
  - Local benchmark JSON could prove lab timings but not which real cohort regressed in production
  - Degraded DOM modes had different native-behavior contracts but no app-facing metric seam
  - DOM/coverage/mounted-count evidence lived in benchmark profiles instead of the runtime surface apps can tag
  - Public metrics can keep leaking a removed DOM mode after the prop and examples are cleaned up
root_cause: missing_tooling
resolution_type: tooling_addition
severity: medium
tags: [plite, dom-strategy, rum, metrics, virtualization, dom-coverage]
---

# Plite DOM strategy needs production RUM metrics

## Problem

DOM strategy work can look good in local benchmark artifacts while production
users still hit the wrong cohort, strategy, or native-behavior tradeoff. The
runtime needs a small app-facing metric seam so products can tag RUM or Datadog
rows with the same facts used in lab proof.

## Symptoms

- Benchmarks tracked DOM nodes, editable descendants, heap, and coverage
  boundaries, but apps had no equivalent runtime callback.
- Virtualized and partial-DOM modes could not be compared honestly in
  production dashboards without custom DOM scraping.
- Phase 8 virtualization showed good ready/select-all rows but bad 50000-block edit lanes, which made a production cohort split mandatory.
- After the public shell option was cut, `shellCount`,
  `shellAggressiveBoundaryCount`, and `'shell'` metric enum values still leaked
  the old API vocabulary.

## What Didn't Work

- Treating benchmark artifacts as enough. They are lab evidence, not production observability.
- Mixing partial-DOM and virtualized timings into default staged rows. That
  hides degraded-mode behavior under a better-looking aggregate.
- Adding a fake Datadog integration in raw Plite. Plite should expose metrics; apps own where those metrics are sent.
- Removing the public prop but leaving shell-specific metrics. That makes the
  docs cleaner while dashboards and agents still learn the wrong API.

## Solution

Add an `Editable` callback that reports DOM strategy surface metrics after commit:

```tsx
<Editable
  domStrategy="staged"
  onDOMStrategyMetrics={(metrics) => {
    datadogRum.addAction('slate.dom_strategy.surface', metrics)
  }}
/>
```

The metric payload includes:

- document cohort and size;
- requested and effective DOM strategy;
- mounted and pending group counts;
- mounted and pending top-level counts;
- native surface completion;
- DOM coverage boundary counts by reason;
- visible DOM node count;
- editable descendant count.

In Plite this lands through `onDOMStrategyMetrics` and exported
`EditableDOMStrategyMetrics`. Tests cover staged and virtualized surfaces.

When cutting a public DOM mode, audit the metric payload too:

- remove mode-specific public counters such as `shellCount`;
- rename mode-specific boundary counters to mechanism-level names such as
  `aggressiveDomCoverageBoundaryCount`;
- expose internal incomplete DOM as `partial-dom`, not as the private
  implementation name;
- keep internal coverage tests behind one internal test helper instead of
  widening the public `domStrategy` prop type.

## Why This Works

The callback keeps raw Plite unopinionated while giving products the exact tags
they need for dashboards. Benchmarks still own lab proof; RUM owns production
drift. Keeping the DOM strategy fields separate prevents partial-DOM or
virtualized stress rows from polluting default staged-rendering claims.

## Prevention

- Every DOM strategy that changes DOM coverage needs a production metric seam, not only a benchmark row.
- Dashboard tags should include interaction name, cohort, document size, requested DOM strategy, effective DOM strategy, boundary count, visible DOM count, editable descendant count, custom renderer flag, browser, mobile/desktop, IME, and release.
- Keep degraded strategies separate in dashboards. If a strategy changes browser find, screen-reader traversal, selection, copy, paste, IME, or mobile semantics, aggregate charts must not hide that.
- Do not stabilize an experimental strategy just because ready time is good. Edit interactions and native behavior rows decide release posture.
- Public API hard-cuts must include props, docs, examples, URL params, metrics
  payloads, and surface-contract tests. Otherwise the removed API lives on in
  dashboards and agent-facing examples.

## Related Issues

- [Plite DOM-incomplete work should start with internal coverage boundaries](../developer-experience/2026-05-02-plite-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md)
- [Plite legacy compare benchmark must align Bun workspace source and built React surfaces](./2026-05-01-plite-legacy-compare-benchmark-must-align-bun-workspace-source-and-built-react-surfaces.md)
