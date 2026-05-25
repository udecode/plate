---
title: Benchmark fixture trees need scoped Biome policy
date: 2026-05-08
category: docs/solutions/workflow-issues
module: plate-2 benchmark tooling
problem_type: workflow_issue
component: tooling
symptoms:
  - `pnpm lint:fix` failed on more than 200 diagnostics under `benchmarks/editor/**`.
  - Most failures came from cross-framework templates, static CSS, test fixtures, and benchmark scripts.
  - The actual editor-test-harvester change was green, but the root closeout gate stayed red.
root_cause: config_error
resolution_type: config_change
severity: medium
tags: [biome, benchmarks, lint-fix, fixtures, workflow]
---

# Benchmark fixture trees need scoped Biome policy

## Problem

Root `pnpm lint:fix` was applying the full Plate app lint profile to
`benchmarks/editor/**`, which is a mix of benchmark harness code,
cross-framework templates, generated-style fixture code, and static demo assets.
That made an unrelated docs/rules task look red.

## Symptoms

- `pnpm lint:fix` failed after an editor-test-harvester rules update.
- Biome reported 202 errors, mostly under `benchmarks/editor/**`.
- Diagnostics included CSS specificity ordering, framework-template style
  preferences, unused fixture variables, console usage in test runners, and
  a11y rules on non-product benchmark markup.

## What Didn't Work

- Treating the failures as evidence that the editor-test-harvester change was
  wrong. The changed rule/docs files were not the owner.
- Manually editing every framework fixture. That would churn templates and
  static assets just to satisfy app-oriented rules that do not fit the fixture
  surface.
- Ignoring all of `benchmarks/editor/**`. That would hide real correctness
  issues in benchmark scripts.

## Solution

Add a scoped `biome.jsonc` override for `benchmarks/editor/**` that disables the
rules that are noise for benchmark fixtures and templates, while leaving real
JavaScript correctness rules active.

Then fix the remaining concrete script errors directly. In this case, after the
override only two `Number.parseInt` radix errors remained, so
`benchmarks/editor/scripts/utils.js` now passes an explicit radix:

```js
errors: Number.parseInt(match[2], 10) || 0,
warnings: Number.parseInt(match[3], 10) || 0,
```

Verification:

```bash
pnpm lint:fix
```

## Why This Works

The benchmark tree is not the same kind of source as packages, docs app code, or
registry examples. It intentionally contains many framework styles and fixture
patterns. A scoped override keeps the root closeout gate useful without forcing
every benchmark fixture to mimic the main app style guide.

Keeping correctness rules active unless they are fixture-specific also avoids
turning the override into a blanket lint bypass.

## Prevention

- When root lint fails under a benchmark/template tree, first classify the owner:
  product code, generated fixture, framework template, static asset, or script.
- Prefer a scoped Biome override for fixture/template policy mismatches.
- Still fix concrete correctness bugs in benchmark scripts instead of
  suppressing them.
- Do not use root lint debt under benchmark fixtures to block unrelated
  docs/rules changes once the scoped policy is green.

## Related Issues

- [Slate v2 tooling port should stage package build owners separately from repo-wide source lint](../developer-experience/2026-04-16-slate-v2-tooling-port-should-stage-build-owners-and-source-lint-separately.md)
