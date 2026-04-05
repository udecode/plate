---
title: Testing Review Non React Audit Post Roadmap
type: docs
date: 2026-03-24
status: completed
---

# Testing Review Non React Audit Post Roadmap

## Goal

Rerun the repo testing review after the completed non-React roadmap, keep the temporary `/react` cut, and publish the next honest non-React batch instead of pretending package sweeps are still useful.

## Inputs

- `.agents/rules/testing-review.mdc`
- `.agents/rules/testing.mdc`
- prior non-React roadmap and audit outputs under `docs/plans/`

## Status

- [x] Reload prior non-React audit and roadmap context
- [x] Run fresh non-React coverage
- [x] Run suite-health checks and debt scans
- [x] Regenerate exhaustive package and file scoring TSVs
- [x] Lock the next non-React cleanup roadmap

## Verification

- `xargs -0 bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24n --reporter=dots < <(tr '\n' '\0' < .claude/tmp/non_react_test_files.txt)`
- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- `rg -n "describe\\.skip|it\\.skip|test\\.skip|xit\\(|xdescribe\\(" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`
- `rg -n "^\\s*//\\s*(describe|it|test)\\(" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`
- `rg -n "from '.*\\.spec'|from \\\".*\\.spec\\\"" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`

## Outputs

- `docs/plans/2026-03-24-coverage-priority-map-testing-review-non-react-post-roadmap.md`
- `docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react-post-roadmap.tsv`
- `docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-roadmap.tsv`
- `docs/plans/2026-03-24-non-react-coverage-roadmap-phase-2.md`

## Notes

- Fresh non-React coverage is clean.
- The default `pnpm test:profile` and `pnpm test:slowest` runs are currently polluted by React-side failures in the shared fast suite, so they are useful as suite-health findings, not as ranking input for this temporary non-React pass.
