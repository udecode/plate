---
title: Non React Coverage Roadmap Phase 3 Execution
type: testing
date: 2026-03-25
status: completed
---

# Non React Coverage Roadmap Phase 3 Execution

## Scope

- Execute Tier 1 and Tier 2 from [2026-03-24-non-react-coverage-roadmap-phase-3.md](docs/plans/2026-03-24-non-react-coverage-roadmap-phase-3.md).
- Keep the batch file-first.
- Expand existing honest specs before inventing wrapper smoke junk.

## Phase Plan

- [completed] Phase 1: inspect current seams and harnesses
- [completed] Phase 2: Tier 1 (`link`, `markdown`)
- [completed] Phase 3: `core` and `autoformat`
- [completed] Phase 4: `basic-nodes`, `table`, `list-classic`, `suggestion`
- [completed] Phase 5: verification and roadmap status update

## Learnings Applied

- Restore Bun spies in the same spec file or full-suite order lies. See [2026-03-24-spec-spies-must-be-restored-or-full-suite-order-breaks.md](docs/solutions/test-failures/2026-03-24-spec-spies-must-be-restored-or-full-suite-order-breaks.md).
- Keep Bun module mock surfaces consistent across related specs. See [2026-03-24-bun-module-mocks-must-export-a-consistent-surface-across-related-specs.md](docs/solutions/test-failures/2026-03-24-bun-module-mocks-must-export-a-consistent-surface-across-related-specs.md).
- Filtered Turbo typecheck can lie. Use the normal build-first flow, then serialize Turbo if it gets weird. See [2026-03-24-turbo-filtered-typecheck-can-lie-when-package-typecheck-passes.md](docs/solutions/test-failures/2026-03-24-turbo-filtered-typecheck-can-lie-when-package-typecheck-passes.md).
- Markdown fallback tests should cover incomplete tails and void-block preservation. See [2026-03-14-markdown-incomplete-mdx-fallback-drops-void-blocks.md](docs/solutions/logic-errors/2026-03-14-markdown-incomplete-mdx-fallback-drops-void-blocks.md).

## Notes

- `core` has the biggest cluster. Expand the existing HTML and static specs instead of making more tiny one-off files than necessary.
- `markdown` already has nearby serializer and deserializer specs. Reuse them.
- `basic-nodes` should stay honest: one plugin contract expansion, not a new wrapper sweep.

## Outcome

- Tier 1 and Tier 2 are complete.
- `upsertLink.ts` and `markdownToSlateNodesSafely.ts` each had dead branches removed instead of receiving fake tests.
- New direct specs landed for the remaining honest helper seams in `core`, `markdown`, `table`, `list-classic`, and `suggestion`.
- This pass exposed and fixed two real product bugs:
  - `splitIncompleteMdx.ts` treated a closing `>` at end-of-string as incomplete.
  - `getTableCellBorders.ts` accepted any parent node as a table ancestor instead of requiring the real table type.

## Verification

- Targeted roadmap slice:
  - `bun test ...` on 19 touched specs -> `105 pass`, `0 fail`
- Build-first gate:
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/link --filter=./packages/markdown --filter=./packages/core --filter=./packages/autoformat --filter=./packages/basic-nodes --filter=./packages/table --filter=./packages/list-classic --filter=./packages/suggestion`
  - `pnpm turbo typecheck --concurrency=1 --filter=./packages/link --filter=./packages/markdown --filter=./packages/core --filter=./packages/autoformat --filter=./packages/basic-nodes --filter=./packages/table --filter=./packages/list-classic --filter=./packages/suggestion`
  - `pnpm lint:fix`
- Post-lint confirmation:
  - targeted roadmap slice rerun -> `105 pass`, `0 fail`

## Verification Notes

- A broad `bun test packages/link/src packages/markdown/src packages/core/src packages/autoformat/src packages/basic-nodes/src packages/table/src packages/list-classic/src packages/suggestion/src` sweep is still dirty outside this roadmap slice. The failures are shared suite-order or mock-surface debt in unrelated areas, not regressions in the touched Phase 3 seams.
