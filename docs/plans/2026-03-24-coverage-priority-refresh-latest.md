---
title: Coverage Priority Refresh Latest
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Refresh Latest

## Goal

Rerun full repo coverage from the latest repo state, then regenerate package and file scoring for remaining non-React test work.

## Inputs

- `.agents/rules/task.mdc`
- `.agents/rules/testing.mdc`
- `docs/plans/2026-03-06-test-suite-cleanup-plan.md`
- `docs/plans/2026-03-09-test-suite-excellence-plan.md`
- `docs/plans/2026-03-17-*`
- latest 2026-03-24 coverage maps and TSVs

## Steps

1. Rerun full repo coverage and capture fresh `lcov`.
2. Regenerate per-package and per-file worth-testing scores.
3. Exclude `/react`, type-only barrels, test files, generated files, and obvious no-value dust.
4. Recommend the next work sorted by value, not by stale package totals.

## Status

- [x] Reloaded task/testing rules and prior plan history
- [x] Fresh coverage run
- [x] Fresh score tables
- [x] Final recommendation
