# Coverage Priority Refresh

## Goal

Re-run full repo coverage from the fresh 2026-03-24 `lcov`, then regenerate package and file scoring for the remaining non-React test work.

## Inputs

- `task.mdc`
- `testing.mdc`
- `2026-03-06-test-suite-cleanup-plan.md`
- `2026-03-09-test-suite-excellence-plan.md`
- `2026-03-23-coverage-priority-map-post-package-sweep.md`
- `2026-03-23-coverage-threshold-map.md`
- fresh coverage artifact:
  - `/Users/zbeyens/git/plate/.coverage-repo-2026-03-24a/lcov.info`

## Constraints

- No `/react` coverage recommendations in this pass.
- No coverage cosplay.
- Score every package and every in-scope source file.
- Rank by value, not raw uncovered lines alone.

## Output

- refreshed markdown map
- package TSV
- file TSV
- concise next-step recommendation with a practical threshold
