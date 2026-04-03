---
title: Testing Review Non React Audit Refresh
type: docs
date: 2026-03-24
status: completed
---

# Testing Review Non React Audit Refresh

## Goal

Rerun the whole-repo testing review with the temporary non-React cut, refresh lcov-backed scoring, and publish the next worthwhile batch instead of doing fake package theater.

## Inputs

- `.agents/rules/testing-review.mdc`
- `.agents/rules/testing.mdc`
- prior non-React audit outputs under `docs/plans/`

## Status

- [x] Reload skill and prior audit context
- [x] Run fresh coverage and suite-health commands
- [x] Regenerate package and file scoring artifacts
- [x] Summarize the next ranked non-React batch

## Verification

- `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24i --reporter=dots`
- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- `rg -n "describe\.skip|it\.skip|test\.skip|xit\(|xdescribe\(" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`
- `rg -n "^\s*//\s*(describe|it|test)\(" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`
- `rg -n "from '.*\.spec'" packages apps -g "*.spec.ts" -g "*.spec.tsx"`

## Outputs

- `docs/plans/2026-03-24-coverage-priority-map-testing-review-non-react-refresh.md`
- `docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react-refresh.tsv`
- `docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-refresh.tsv`
