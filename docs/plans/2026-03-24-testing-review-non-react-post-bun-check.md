---
title: Testing Review Non React Post Bun Check
type: docs
date: 2026-03-24
status: completed
---

# Testing Review Non React Post Bun Check

## Goal

Run a fresh repo testing-review pass with the temporary non-React cut after the latest suite and root-check fixes.

## Status

- [x] Run fresh scoped non-React coverage
- [x] Run suite-health checks
- [x] Regenerate package and file scoring
- [x] Lock the next non-React roadmap
- [x] Summarize whether to continue or stop

## Verification

- scoped non-React `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24p --reporter=dots`
- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- `rg -n 'describe\.skip|it\.skip|test\.skip|xit\(|xdescribe\(' packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`
- `rg -n '^\s*//\s*(describe|it|test)\(' packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`
- `rg -n "from '.*\.spec'|from \".*\.spec\"" packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`

## Outputs

- [2026-03-24-coverage-priority-map-testing-review-non-react-post-bun-check.md](docs/plans/2026-03-24-coverage-priority-map-testing-review-non-react-post-bun-check.md)
- [2026-03-24-coverage-priority-packages-testing-review-non-react-post-bun-check.tsv](docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react-post-bun-check.tsv)
- [2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-bun-check.tsv)
- [2026-03-24-non-react-coverage-roadmap-phase-3.md](docs/plans/2026-03-24-non-react-coverage-roadmap-phase-3.md)

## Notes

- Fresh scoped non-React coverage is clean.
- Fast-suite timing is clean again after the bun-check fix.
- This is the last honest non-React roadmap. After phase 3, stop and move on.
