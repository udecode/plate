---
title: Next-dev benchmark readiness must warm and retry before failing
date: 2026-04-15
category: workflow-issues
module: slate-v2
problem_type: workflow_issue
component: testing_framework
symptoms:
  - a Playwright benchmark lane failed intermittently with missing controls even though the page route returned 200
  - the same benchmark passed immediately on rerun with stable numbers
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: medium
tags:
  - slate-v2
  - benchmarking
  - playwright
  - next-dev
  - readiness
  - huge-document
---

# Next-dev benchmark readiness must warm and retry before failing

## Problem

The huge-document overlay benchmark had a flaky readiness contract. One run
failed with a missing `#v2-huge-blocks` control even though the route was
serving `200` responses and the exact same lane passed immediately on rerun.

## Symptoms

- `pnpm bench:replacement:huge-document:overlays:local` could fail with:
  `expect(locator('#v2-huge-blocks')).toHaveValue("1000")`
- server logs still showed successful `GET /examples/huge-document?... 200`
  responses
- rerunning the benchmark without code changes usually passed

## What Didn't Work

- Treating a double `page.goto(...)` plus one-shot control checks as a real
  readiness contract.
- Assuming a successful route response meant the example DOM was fully ready for
  timing.

## Solution

Harden the benchmark runner instead of touching the example:

- add an explicit ready timeout
- add bounded readiness retries
- warm the route once before starting timed samples
- on a failed readiness attempt, reset the page to `about:blank` and retry

Relevant file:

- [huge-document-overlays.mjs](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-overlays.mjs)

Verification after the patch:

- one normal `3`-sample run passed
- five repeated `1`-sample launches passed back to back

## Why This Works

The failure was benchmark-runner brittleness, not overlay runtime instability.

Next dev can answer the route while the example surface is still settling. A
one-shot readiness assertion turns that harmless warmup lag into a fake perf
failure. Warming once and retrying boundedly keeps the lane strict without
being stupid.

## Prevention

- For Next-dev Playwright benchmarks, treat route success and DOM readiness as
  separate checks.
- Warm heavy example routes once before timed samples.
- If the lane depends on several controls, retry readiness as a unit instead of
  failing forever on the first missing locator.
- Reset the page between readiness retries so a half-mounted attempt does not
  poison the next one.

## Related Issues

- [Editor benchmark viewers must keep live and snapshot rows separate](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-editor-benchmark-viewers-must-keep-live-and-snapshot-rows-separate.md)
- [Slate v2 Overlay Benchmark Hardening](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-overlay-benchmark-hardening.md)
