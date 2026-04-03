# Remaining Basic-Nodes Benchmark Plan

## Goal

Benchmark the remaining `@platejs/basic-nodes` plugins versus Slate using the existing editor perf harness.

## Steps

1. Identify which basic-nodes plugins are not already covered by the current core plugin census.
2. Reuse existing harness/plugin-census machinery when possible.
3. Run the smallest honest batch on the live dev server.
4. Save raw outputs in `tmp/` and summarize deltas versus Slate.
5. Stop if the harness cannot represent the plugin cleanly without speculative benchmark code.
