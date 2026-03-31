---
title: Coverage Priority Refresh Post GTE 5
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Refresh Post GTE 5

## Goal

Rerun fresh repo coverage after the completed `score >= 5` batch, then regenerate exhaustive non-React package and file scoring from current repo state.

## Inputs

- `.agents/rules/task.mdc`
- `.agents/rules/testing.mdc`
- `docs/plans/2026-03-06-test-suite-cleanup-plan.md`
- `docs/plans/2026-03-09-test-suite-excellence-plan.md`
- `docs/plans/2026-03-17-*`
- latest 2026-03-24 coverage maps and TSVs

## Steps

1. Rerun full repo coverage and capture fresh `lcov`.
2. Recompute per-package and per-file worth-testing scores.
3. Exclude `/react`, type-only files, barrels, tests, generated sludge, and no-value dust.
4. Publish fresh markdown + TSV artifacts with recommendations sorted by value.

## Status

- [x] Reloaded task/testing rules and prior plan history
- [x] Fresh coverage run
- [x] Fresh score tables
- [x] Final recommendation
