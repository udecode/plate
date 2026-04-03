---
module: Editor performance
date: 2026-04-01
problem_type: performance_issue
component: tooling
symptoms:
  - "Layer 0 runs produce useful raw JSON but still need hand-written summaries."
  - "The smoke baseline exists, but rerunning it is annoying enough that people will stop doing it."
  - "The benchmark harness has presets, but the baseline-freeze workflow is still half manual."
root_cause: missing_tooling
resolution_type: code_fix
severity: medium
tags:
  - performance
  - tooling
  - layer-0
  - benchmarking
  - summary
  - workflow
---

# Layer 0 runner should write summary JSON in the same pass

## Problem

Raw benchmark JSON is necessary, but it is miserable as the day-to-day artifact.
If every Layer 0 rerun requires a second manual summarization step, people stop
rerunning it and the baseline quietly rots.

## Solution

Teach the `apps/www/scripts/run-editor-perf.mts` runner to emit a compact
summary JSON during the same preset run.

Then expose package scripts that people will actually use:

- `pnpm --filter ./apps/www perf:editor:layer0-smoke`
- `pnpm --filter ./apps/www perf:editor:layer0`

Both should target `http://localhost:3000/dev/editor-perf` and write:

- a raw artifact under `.claude/docs/plans/`
- a compact summary artifact beside it

## Why This Works

This turns Layer 0 from “a harness you technically could use” into “one command
you actually run.”

That matters because the smoke baseline is supposed to become normal engineering
hygiene, not a ceremony people skip when they are busy.

## Current Command

The smoke freeze command is:

`pnpm --filter ./apps/www perf:editor:layer0-smoke`

It writes:

- `tmp/editor-perf-layer0-smoke.json`
- `.claude/docs/plans/editor-perf-layer0-smoke-summary.json`

The full Layer 0 command is:

`pnpm --filter ./apps/www perf:editor:layer0`

## Prevention

- Every runner preset that matters in normal development should have a compact
  summary artifact, not just raw JSON.
- If a benchmark workflow needs a follow-up script to become readable, fold that
  script into the main run unless there is a strong reason not to.
- The right default is one command, one raw file, one summary file.
