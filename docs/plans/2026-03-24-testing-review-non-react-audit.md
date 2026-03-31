---
title: Testing Review Non-React Audit
type: docs
date: 2026-03-24
status: completed
---

# Testing Review Non-React Audit

## Goal

Run the repo-wide testing review skill with a temporary non-React constraint, using fresh `lcov` and current suite-health commands to rank the next worthwhile coverage batch.

## Inputs

- `.agents/rules/testing-review.mdc`
- `.agents/rules/testing.mdc`
- latest prior maps under `docs/plans/`

## Status

- [x] Read the review and testing skill rules
- [x] Run fresh coverage and suite-health commands
- [x] Score remaining non-React files and write artifacts
- [x] Summarize the next batch and stop condition

## Verification

- `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24h --reporter=dots`
- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- `rg -n "(describe|it|test)\\.skip|\\bxit\\(|\\bxdescribe\\(" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`
- `rg -n '^\\s*//\\s*(describe|it|test)\\(' packages apps -g '*.spec.ts' -g '*.spec.tsx' -g '*.slow.ts' -g '*.slow.tsx'`
- `rg -n "from '.*\\.spec'" packages apps -g "*.spec.ts" -g "*.spec.tsx"`

## Outputs

- `docs/plans/2026-03-24-coverage-priority-map-testing-review-non-react.md`
- `docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react.tsv`
- `docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react.tsv`
