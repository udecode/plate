---
title: Flattened list rendering must not wrap every item in its own list container
date: 2026-04-04
category: docs/solutions/performance-issues
module: list mount path
problem_type: performance_issue
component: tooling
symptoms:
  - "The standalone `10k` list-heavy lane stayed deeply red even after the mark-bundle cut"
  - "Plate list-heavy mount was much slower than both Slate and Plate's own flattened-list lower bound"
  - "Small wrapper and core fast-path experiments did not produce a clean win"
root_cause: logic_error
resolution_type: documentation
severity: medium
tags:
  - plate
  - performance
  - list
  - benchmark
  - rendering
  - dom
---

# Flattened list rendering must not wrap every item in its own list container

## Problem

The standalone editor benchmark still had a large red list-heavy mount lane
after the mark-bundle fix.

The key question was whether the cost came from:

- the flattened Plate list shape itself
- `ListPlugin`
- or the extra markdown bundle around it

## Symptoms

Dedicated list rows in the standalone lab after the kept fix:

- `49_mount-10k-list-markdown`: Plate `934.20 ms`, Slate `619.50 ms`
- `96_mount-10k-list-core`: Plate `642.80 ms`, Slate `586.30 ms`
- `97_mount-10k-list-only`: Plate `871.90 ms`, Slate `563.70 ms`

That split means the old bill was `ListPlugin`, not the flattened list payload
by itself.

## What Didn't Work

- Treating the flattened list tree as the main villain. The `list-core` lower
  bound is much cheaper.
- Swapping the unordered wrapper to lighter per-item markup without changing
  the container model. That did not buy a clean win.
- Adding a generic core fast path around `belowNodes` wrappers. That also did
  not survive measurement cleanly enough to keep.

## Solution

First, add the two missing benchmark rows that isolate the seam:

- `96_mount-10k-list-core`
- `97_mount-10k-list-only`

Then inspect the rendered DOM, not just timings.

The DOM probe showed the original bad shape:

- Plate `list-core`: `0` `<ul>`, `0` `<li>`, `30,000` paragraph nodes
- Plate `list-only`: `30,000` `<ul>`, `30,000` `<li>`, `30,000` paragraph nodes
- Slate nested list lane: `10,000` `<ul>`, `30,000` `<li>`

So the old Plate list render model was paying one list container per item
instead of one logical list container or a lighter paragraph-level list-item
render.

## Why This Works

The kept fix is:

- unordered list items stop using `belowNodes`
- unordered list metadata is injected directly onto the paragraph element
- `pipeRenderElement(...)` keeps the plain element fast path when inject props
  are pathless and no wrapper is active for the current element

That removes unordered wrapper DOM completely:

- fixed Plate `list-only`: `0` `<ul>`, `0` `<li>`, `30,000`
  `[role="listitem"]` paragraphs

This is why the list-only lane dropped from about `1564 ms` to about `872 ms`,
and the full list-heavy markdown lane dropped from about `1452 ms` to about
`934 ms`.

## Prevention

- When using a flattened list model, benchmark the render strategy separately
  from the node shape.
- Add "core lower bound" and "plugin-only" rows before touching package code.
- If the DOM probe shows one container per item instead of one per logical
  group, either remove the wrapper model or move the styling to the element
  itself.

## Related Issues

- Related analysis: [2026-04-04-standalone-benchmark-gap-analysis.md](/Users/zbeyens/git/plate-2/docs/performance/2026-04-04-standalone-benchmark-gap-analysis.md)
- Related reference: [editor-performance-master-plan.md](/Users/zbeyens/git/plate-2/docs/performance/editor-performance-master-plan.md)
