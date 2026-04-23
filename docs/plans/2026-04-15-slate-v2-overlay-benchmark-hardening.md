---
date: 2026-04-15
topic: slate-v2-overlay-benchmark-hardening
status: completed
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Goal

Harden the huge-document overlay benchmark so the lane stops flaking on page
readiness and can be trusted as perf evidence.

# Scope

- `scripts/benchmarks/browser/replacement/huge-document-overlays.mjs`
- only the readiness / runner contract for this lane
- docs only if the verification read changes

# Loaded Skills

- `major-task`
- `task`
- `planning-with-files`
- `learnings-researcher`
- `performance-oracle`
- `debug`

# Phases

- [x] Load skills and source-of-truth files
- [x] Reproduce and classify the flake
- [x] Fix the benchmark readiness contract
- [x] Verify repeated benchmark runs
- [x] Sync docs if needed

# Findings

- the lane failed once with:
  `expect(locator('#v2-huge-blocks')).toHaveValue("1000")`
  because the control was not found
- the same lane passed immediately on rerun with stable numbers, so this looks
  like readiness noise rather than a broken example
- current `waitForCurrentReady(...)` only does double `page.goto(...)` and then
  waits on controls; it has no explicit retry or fallback when the route
  responds before the example DOM is ready
- root-cause read: the lane was relying on a brittle one-shot readiness check in
  a Next dev server flow where the route could answer while the example DOM was
  still warming or remounting
- hardening that fixed it:
  - explicit `readyTimeoutMs`
  - bounded `readyRetries`
  - one warmup page before timed samples
  - retry via `about:blank` reset instead of failing on first missing control
- verification after the patch:
  - one normal `3`-sample run passed
  - five repeated `1`-sample launches passed back to back

# Progress

## 2026-04-15

- started the benchmark-hardening pass
- re-read the overlay benchmark, huge-document example, and related benchmark
  learnings
- patched
  `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/huge-document-overlays.mjs`
- verified:
  - `pnpm lint:fix`
  - `REPLACEMENT_BENCH_ITERATIONS=1 pnpm bench:replacement:huge-document:overlays:local`
  - repeated `5x` one-sample reruns of the same command
  - `pnpm bench:replacement:huge-document:overlays:local`
- wrote the reusable learning doc:
  `/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-15-next-dev-benchmark-readiness-must-warm-and-retry-before-failing.md`

# Errors

- original flake before the fix:
  `expect(locator('#v2-huge-blocks')).toHaveValue("1000")`
  failed because the control was not found on one run
