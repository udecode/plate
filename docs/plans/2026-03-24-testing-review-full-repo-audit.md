---
title: Testing Review Full Repo Audit
type: docs
date: 2026-03-24
status: completed
---

# Testing Review Full Repo Audit

## Goal

Run the next full-repo testing review after the non-React roadmap closed, publish a fresh coverage map, and lock the next phase instead of improvising another package sweep.

## Inputs

- `.agents/rules/testing-review.mdc`
- `.agents/rules/testing.mdc`
- `docs/plans/2026-03-24-non-react-coverage-roadmap.md`
- prior non-React audit outputs under `docs/plans/`

## Status

- [x] Reload skill and prior roadmap context
- [x] Run fresh whole-repo coverage and suite-health commands
- [x] Fix full-suite test pollution that invalidated the first audit run
- [x] Regenerate package and file scoring artifacts
- [x] Lock the next full-repo coverage roadmap

## Verification

- `bun test packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts packages/code-block/src/lib/withCodeBlock.spec.tsx`
- `bun test packages/table/src/lib/withApplyTable.spec.ts packages/table/src/lib/withTableCellSelection.spec.tsx packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts packages/code-block/src/lib/setCodeBlockToDecorations.spec.ts packages/code-block/src/lib/withCodeBlock.spec.tsx`
- `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24l --reporter=dots`
- `pnpm test:profile -- --top 25`
- `pnpm test:slowest -- --top 25`
- `rg -n "(^|[^[:alnum:]_])(describe\\.skip|it\\.skip|test\\.skip|xit\\(|xdescribe\\()" packages apps -g "*.ts" -g "*.tsx"`
- `rg -n "^\\s*//\\s*(describe|it|test)\\(" packages apps -g "*.spec.ts" -g "*.spec.tsx" -g "*.slow.ts" -g "*.slow.tsx"`
- `rg -n "from '.*\\.spec'" packages apps -g "*.spec.ts" -g "*.spec.tsx"`

## Outputs

- `docs/plans/2026-03-24-coverage-priority-map-testing-review-full-repo.md`
- `docs/plans/2026-03-24-coverage-priority-packages-testing-review-full-repo.tsv`
- `docs/plans/2026-03-24-coverage-priority-files-testing-review-full-repo.tsv`
- `docs/plans/2026-03-24-full-repo-coverage-roadmap.md`
