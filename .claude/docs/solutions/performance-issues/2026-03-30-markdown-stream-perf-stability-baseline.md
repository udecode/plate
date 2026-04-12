---
title: Markdown stream perf stability baseline for the live article chunk set
type: solution
date: 2026-03-30
status: completed
category: performance-issues
module: ai
tags:
  - markdown
  - streaming
  - performance
  - benchmark
  - apps-www
  - ai
---

# Problem

Use `/dev/markdown-stream-perf` as a browser-visible benchmark for the captured markdown article stream, then record a baseline that is stable enough to compare future changes.

Single-run numbers are easy to overread on this page. The useful baseline is the spread across several fresh runs with the same dataset and the same controls.

# Measurement Setup

We measured the page locally from the browser, not from synthetic unit-test timers.

The measurement route was:

- `/dev/markdown-stream-perf`

The local app was:

- `http://localhost:3001`

The fixed dataset was:

- `liveMarkdownEditorsArticleChunks`

That dataset expanded to:

- `382` raw chunks
- `172` joined chunks
- `1982` total characters
- `172` delay-bearing joined chunks

Each benchmark round used the same controls:

- measured runs: `5`
- warmup runs: `2`
- burst size: `5`

Each round started from a fresh page load before clicking `Run Benchmark (5 iter)`.

# Results

## Round-by-round results

| Round | End-to-end mean | End-to-end p95 | Burst-step mean | `streamInsertChunk` mean | Joiner mean |
| --- | --- | --- | --- | --- | --- |
| `1` | `4828.96 ms` | `5058.50 ms` | `137.97 ms` | `23.35 ms` | `0.18 ms` |
| `2` | `5194.56 ms` | `6344.00 ms` | `148.42 ms` | `25.24 ms` | `0.16 ms` |
| `3` | `5095.28 ms` | `5243.40 ms` | `145.58 ms` | `24.55 ms` | `0.20 ms` |

## Stability summary

The main baseline is the spread across those three fresh runs:

| Metric | Mean of round means | Min | Max | Span | Span % of mean |
| --- | --- | --- | --- | --- | --- |
| End-to-end mean | `5039.60 ms` | `4828.96 ms` | `5194.56 ms` | `365.60 ms` | `7.25%` |
| Burst-step mean | `143.99 ms` | `137.97 ms` | `148.42 ms` | `10.45 ms` | `7.26%` |
| `streamInsertChunk` mean | `24.38 ms` | `23.35 ms` | `25.24 ms` | `1.89 ms` | `7.75%` |
| Joiner mean | `0.18 ms` | `0.16 ms` | `0.20 ms` | `0.04 ms` | `22.22%` |

The joiner percentage looks large only because the absolute numbers are tiny. In real terms, `0.16-0.20 ms` is still noise next to multi-second wall-clock totals.

# Interpretation

## 1. The page is stable enough for a practical baseline

The three primary means stayed in a fairly tight band:

- end-to-end mean: about `4.83-5.19 s`
- burst-step mean: about `138-148 ms`
- `streamInsertChunk` mean: about `23.35-25.24 ms`

That puts the round-to-round spread for the main means at roughly `7-8%`. That is good enough for routine before/after comparisons on this route.

## 2. The joiner is still not the bottleneck

The joiner stayed at `0.16-0.20 ms` across all three rounds.

If this page feels slow, the useful places to look are still:

- the number of burst cycles
- paint waits between bursts
- the editor work inside `streamInsertChunk`

## 3. Tail latency is noisier than the means

Round 2 hit an end-to-end p95 of `6344.00 ms`, while the other two rounds stayed near `5.1-5.2 s`.

That means the route has a usable mean baseline, but p95 should be treated as a noisy signal unless you collect more rounds.

# Working Rule

When comparing streaming changes on this page:

- keep the dataset fixed
- keep `measured runs=5`, `warmup runs=2`, and `burst size=5`
- compare against the three-run baseline band, not a single run

For quick checks, use these practical baseline ranges:

- end-to-end mean: `4.83-5.19 s`
- burst-step mean: `137.97-148.42 ms`
- `streamInsertChunk` mean: `23.35-25.24 ms`
- joiner mean: `0.16-0.20 ms`

# Verification

The numbers above came from the browser-visible benchmark page itself.

The measurement flow was:

1. Start the local app on port `3001`.
2. Open `/dev/markdown-stream-perf`.
3. Set measured runs to `5`.
4. Set burst size to `5`.
5. Run the benchmark three times from a fresh page load.
6. Read the metrics from the page output.
