---
title: Coverage Priority Refresh Current
type: testing
date: 2026-03-24
status: in_progress
---

# Coverage Priority Refresh Current

## Goal

Run fresh repo coverage from the current tree, then regenerate a full non-React package and file ranking based on real value, not stale maps.

## Inputs

- `.agents/rules/task.mdc`
- `.agents/rules/testing.mdc`
- `docs/plans/2026-03-06-test-suite-cleanup-plan.md`
- `docs/plans/2026-03-09-test-suite-excellence-plan.md`
- `docs/plans/2026-03-17-coverage-priority-map.md`
- latest 2026-03-24 coverage maps and TSVs
- coverage artifact to generate in this pass:
  - `/Users/zbeyens/git/plate/.coverage-repo-2026-03-24f/lcov.info`

## Constraints

- No `/react` recommendations.
- No browser or e2e.
- No vanity coverage.
- Score only files still worth real unit or editor-contract tests.

## Steps

1. Sync prior plans and learnings relevant to coverage ranking.
2. Run fresh full-repo coverage and capture `lcov`.
3. Score every package row and every non-React file still worth unit testing.
4. Write a markdown priority map plus package/file TSV artifacts.
5. Summarize the next highest-value batch sorted by value.

## Status

- [x] Synced prior plans and coverage learnings
- [x] Fresh coverage run
- [x] Fresh package and file score tables
- [x] Final recommendation
