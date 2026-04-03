---
module: Editor performance
date: 2026-04-01
problem_type: performance_issue
component: documentation
symptoms:
  - "A side-by-side editor demo reports worse per-engine UI timings than the standalone engine page."
  - "Slate metrics inside the Plate docs demo are materially slower than the same lane should be."
  - "The demo is useful visually, but the second mounted editor contaminates the timing numbers."
root_cause: wrong_api
resolution_type: code_fix
severity: medium
tags:
  - performance
  - huge-document
  - slate
  - docs-examples
  - benchmarking
  - comparison
---

# Side-by-side editor demos should support single-engine mount for honest metrics

## Problem

A side-by-side editor demo is fine for eyeballing behavior, but it is a bad
default measurement surface. Mounting both editors at once adds extra DOM,
layout, and page-level work that can make one engine look slower than it is.

The Huge Document docs page was doing exactly that: it rendered Plate and Slate
next to each other, then showed timing stats as if those numbers were clean
per-engine measurements.

## Symptoms

- The docs page looked like a comparison harness, but it mounted two huge
  editors at once.
- Temporary automation against the page showed the Slate column in `Plate +
  Slate` mode reporting a visible slowdown in one run:
  - last keypress: `10 ms`
  - average of last 10 keypresses: `21 ms`
  - last long animation frame: `73 ms`
- The same page in `Slate only` mode dropped back to the near-zero /
  non-reporting class, which is where standalone Slate also tended to land
  under automation.

## What Didn't Work

Treating the side-by-side view as both demo and benchmark surface was the
mistake. The numbers looked comparable, but the page itself was part of the
overhead.

Copying the local `../slate` transform-benchmark controls into the docs page
would have made this worse. That work belongs in a dedicated benchmark harness,
not in a public example page.

## Solution

Add a `Mounted editors` control with:

- `Plate + Slate`
- `Plate only`
- `Slate only`

Keep `Plate + Slate` as the parity/demo view, but make single-engine mount the
obvious truth mode for anyone looking at timing stats.

Also add an explicit note in the stats panel:

> Mount one editor at a time for cleaner engine-specific numbers. The
> two-editor view is useful for eyeballing parity, not for honest perf
> baselines.

## Why This Works

The control separates two jobs that were previously mixed together:

- **demo job**: show both editors on the same page
- **measurement job**: remove cross-engine page overhead

That keeps the docs page useful for both audiences without pretending the
two-editor layout is a neutral measurement surface.

## Prevention

- If a docs page mounts multiple heavy editors, assume it is a contaminated
  timing surface until proven otherwise.
- Use dedicated benchmark routes like `/dev/editor-perf` for transform and
  mount investigations.
- If a comparison page still shows UI metrics, give it a one-engine-at-a-time
  mode.
