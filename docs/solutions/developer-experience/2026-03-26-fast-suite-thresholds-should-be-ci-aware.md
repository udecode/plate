---
module: Testing
date: 2026-03-26
problem_type: developer_experience
component: testing_framework
symptoms:
  - "`pnpm check` fails in CI because `pnpm test:slowest` trips the fast-suite hard-fail bucket while the same branch stays green locally"
  - "single tests land in the `75ms/test` range on GitHub runners even though local runs stay well below that"
  - "the failure message tells you to move specs to `*.slow.ts[x]` even when the spec is just paying CI scheduler noise"
root_cause: config_error
resolution_type: config_change
severity: medium
tags:
  - ci
  - bun
  - test-slowest
  - fast-suite
  - thresholds
  - tooling
---

# Fast-suite thresholds should be CI-aware

## Problem

`pnpm test:slowest` was enforcing the same hard-fail thresholds everywhere:

- `75ms/test`
- `150ms/file total`

That is fine on a fast local machine. It is too tight for noisy CI runners.

The result was dumb: a branch could be locally clean, then fail `pnpm check` in CI because one otherwise normal fast-suite spec wandered into the mid-70ms range.

## What Didn't Work

### Treating the CI number as proof the spec belongs in `*.slow.ts[x]`

That would have moved healthy specs out of the fast lane just because GitHub runners are slower and noisier than a local dev machine.

### Loosening the thresholds everywhere

That would have thrown away the useful local signal. The local fast loop is where you actually want the stricter guardrail.

## Fix

Make the thresholds environment-aware in [`tooling/config/test-suites.mjs`](tooling/config/test-suites.mjs):

- local hard-fail bucket stays at `75ms/test` and `150ms/file`
- CI hard-fail bucket widens to `90ms/test` and `180ms/file`
- CI warning bucket keeps the old local hard limits at `75ms/test` and `150ms/file`

That keeps local enforcement sharp while still surfacing slow drift in CI logs before it becomes a hard failure.

## Why This Works

The repo has two different jobs here:

1. protect the local fast loop from slowly bloating
2. avoid false-red CI from normal runner variance

One shared threshold was trying to do both jobs and doing neither well.

The split fixes that:

- local stays strict, so genuinely slow specs still get pushed into `*.slow.ts[x]`
- CI gets enough slack to absorb runner noise
- the old limits still show up as warnings in CI, so timing drift is visible instead of silently ignored

## Rule

If a timing gate is meant to protect developer workflow, do not assume CI and local hardware deserve the same hard-fail bucket.

Keep the local bar honest. Give CI enough headroom to avoid random red builds. Surface the tighter local bar in CI as a warning if you still want eyes on drift.

## Verification

These commands passed after the change:

```bash
pnpm lint:fix
CI=1 pnpm test:slowest -- --top 5
pnpm check
```
