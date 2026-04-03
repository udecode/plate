---
module: Editor performance
date: 2026-04-01
problem_type: performance_issue
component: documentation
symptoms:
  - "The Huge Document docs page and /dev/editor-perf can drift even when they look similar."
  - "A manual comparison uses one set of knobs, but the real benchmark surface silently uses another."
  - "There is no direct way to move from the parity page into the benchmark harness with the same scenario."
root_cause: inadequate_documentation
resolution_type: code_fix
severity: medium
tags:
  - performance
  - huge-document
  - docs-examples
  - benchmarking
  - query-params
  - workload-drift
---

# Huge Document demo and benchmark should share a query-param config contract

## Problem

The Huge Document docs page and `/dev/editor-perf` were acting like related
surfaces, but they did not share a config contract. That meant the manual demo
could be set up one way while the benchmark harness quietly ran something else.

That is how perf work turns into folklore.

## Solution

Create one shared Huge Document config module for the common knobs:

- `blocks`
- `chunking`
- `chunk_size`
- `content_visibility`

Use that shared module to:

- parse and write Huge Document query params
- parse and write benchmark-page query params
- build a direct `Open in benchmark mode` link from the docs page into
  `/dev/editor-perf`

Also make the benchmark page reuse the real mixed huge-document workload
generator instead of maintaining a separate fake copy.

## Why This Works

The docs page and the benchmark page now agree on the scenario before any
measurement happens.

That gives you a clean workflow:

1. eyeball the scenario on the public docs page
2. jump straight into the benchmark surface with the same knobs
3. measure the real thing instead of recreating the setup by hand

## Prevention

- If a docs example is also a benchmark reference, give it a query-param bridge
  into the actual harness.
- If two surfaces claim to represent the same workload, make them share the
  config parser and the workload generator.
- Never maintain two “almost the same” huge-document builders unless you enjoy
  debugging ghosts.
