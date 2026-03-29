---
title: Markdown stream perf baseline for the live article chunk set
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

We added `/dev/markdown-stream-perf` so we could stop arguing about feel and start looking at real numbers.

The next missing piece was a repeatable baseline for the captured live markdown chunk stream. Without that baseline, it is too easy to mix together:

- raw chunk cadence
- joiner cost
- `streamInsertChunk` cost
- burst-size effects
- paint waits between bursts

# Measurement Setup

We measured the page locally from the browser, not from synthetic unit-test timers.

The measurement route was:

- `/dev/markdown-stream-perf`

The fixed dataset was:

- `liveMarkdownEditorsArticleChunks`

That dataset currently expands to:

- `382` raw chunks
- `172` joined chunks
- `1982` total characters
- `172` delay-bearing joined chunks

The page was exercised through `agent-browser` against the local `www` app on port `3002`.

For the main baseline, we kept the page defaults:

- measured runs: `5`
- warmup runs: `2`
- burst size: `5`

We also captured one quick comparison run with:

- measured runs: `1`
- warmup runs: `2`
- burst size: `1`

# Results

## Default Baseline

Conditions:

- measured runs: `5`
- warmup runs: `2`
- burst size: `5`

Results:

| Metric | Value |
| --- | --- |
| End-to-end mean | `3697.34 ms` |
| End-to-end median | `3649.60 ms` |
| End-to-end p95 | `3833.10 ms` |
| End-to-end min / max | `3605.10 / 3833.10 ms` |
| Burst-step mean | `105.64 ms` |
| Burst-step median | `83.40 ms` |
| Burst-step p95 | `263.90 ms` |
| `streamInsertChunk` mean | `19.48 ms` |
| `streamInsertChunk` median | `15.00 ms` |
| `streamInsertChunk` p95 | `48.50 ms` |
| Joiner mean | `0.18 ms` |
| Joiner median | `0.20 ms` |
| Joiner p95 | `0.20 ms` |

## Burst Size Comparison

Conditions:

- measured runs: `1`
- warmup runs: `2`
- burst size: `1`

Results:

| Metric | Value |
| --- | --- |
| End-to-end mean | `6466.40 ms` |
| Burst-step mean | `37.59 ms` |
| Burst-step p95 | `65.90 ms` |
| `streamInsertChunk` mean | `19.96 ms` |
| `streamInsertChunk` p95 | `49.70 ms` |
| Joiner mean | `0.10 ms` |

# Interpretation

Three things stand out right away.

## 1. The joiner is not the bottleneck

The joiner stayed around `0.1-0.2 ms` per full run of the raw dataset.

That is effectively noise next to multi-second end-to-end totals. If the page feels slow, the answer is not “the joiner is expensive.”

## 2. Total wall-clock is highly sensitive to burst count

Moving from `burst=5` to `burst=1` pushed end-to-end time from about `3.7 s` to about `6.5 s`.

That happened even though the mean `streamInsertChunk` call barely changed:

- `19.48 ms` at `burst=5`
- `19.96 ms` at `burst=1`

So the extra time is not mostly coming from per-call markdown or editor mutation cost getting worse. It is coming from doing many more burst cycles and many more waits for paint.

## 3. The current React profiler section is not yet a trustworthy metric

The page reported:

- render samples: `0`
- render count per run: `0`
- mount samples: `0`

That means the current `Profiler` placement is not capturing the work we actually care about, even though the editor content clearly updates.

So for now, the trustworthy metrics on this page are:

- dataset size
- end-to-end stream time
- burst-step time
- `streamInsertChunk` time
- joiner time

The React render section should be treated as instrumentation debt, not as a real performance signal.

# Working Rule

When comparing streaming performance on this page, keep the chunk set fixed and compare burst size separately from per-chunk cost.

Otherwise it is easy to misread “more burst cycles” as “slower markdown parsing.”

# Verification

The numbers above came from the browser-visible benchmark page itself.

The measurement flow was:

1. Start `www` on port `3002`
2. Open `/dev/markdown-stream-perf`
3. Run the default benchmark
4. Read `document.querySelector('main')?.innerText`
5. Repeat with `burst=1` and `runs=1`

At capture time, the page showed the same dataset summary and metric values recorded above.
