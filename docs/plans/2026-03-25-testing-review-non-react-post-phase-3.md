---
title: Testing Review Non React Post Phase 3
type: docs
date: 2026-03-25
status: completed
---

# Testing Review Non React Post Phase 3

## Goal

Run a fresh testing-review pass for the temporary non-React cut after Phase 3 and the broad Bun suite-health cleanup.

## Status

- [x] Run fresh scoped non-React coverage
- [x] Run suite-health checks
- [x] Regenerate package and file scoring
- [x] Update or lock the next non-React roadmap
- [x] Summarize whether to continue or stop

## Verification

- regenerated `.claude/tmp/non_react_test_files.txt` (`615` files)
- scoped non-React `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-25b --reporter=dots`
- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- `rg -n 'describe\.skip|it\.skip|test\.skip|xit\(|xdescribe\(' packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`
- `rg -n '^\s*//\s*(describe|it|test)\(' packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`
- `rg -n "from '.*\.spec'|from \".*\.spec\"" packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`

## Outputs

- [2026-03-25-coverage-priority-map-testing-review-non-react-post-phase-3.md](/Users/zbeyens/git/plate/docs/plans/2026-03-25-coverage-priority-map-testing-review-non-react-post-phase-3.md)
- [2026-03-25-coverage-priority-packages-testing-review-non-react-post-phase-3.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-25-coverage-priority-packages-testing-review-non-react-post-phase-3.tsv)
- [2026-03-25-coverage-priority-files-testing-review-non-react-post-phase-3.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-25-coverage-priority-files-testing-review-non-react-post-phase-3.tsv)
- [2026-03-25-non-react-coverage-roadmap-phase-4.md](/Users/zbeyens/git/plate/docs/plans/2026-03-25-non-react-coverage-roadmap-phase-4.md)

## Notes

- The previous scoped non-React file list was stale. This pass regenerated it before coverage.
- There are no remaining `score >= 6` non-React files.
- Only five `score >= 5` files remain, so this is the last honest non-React roadmap.