---
title: Non React Coverage Roadmap Phase 4 Execution
type: testing
date: 2026-03-25
status: completed
---

# Non React Coverage Roadmap Phase 4 Execution

## Scope

Closed the last locked non-React coverage batch from [2026-03-25-non-react-coverage-roadmap-phase-4.md](docs/plans/2026-03-25-non-react-coverage-roadmap-phase-4.md).

## Work

- Expanded [docxListToList.spec.ts](packages/docx/src/lib/docx-cleaner/utils/docxListToList.spec.ts) for bookmark skipping and nested list recursion.
- Added [BaseMarkPlugins.spec.ts](packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts) to cover bold, italic, underline, strikethrough, and code plugin parser veto + toggle wiring.
- Expanded [getSelectedCellsBorders.spec.tsx](packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx) for left-adjacent border checks and right-edge boundary fallthrough.
- Expanded [AutoformatPlugin.spec.tsx](packages/autoformat/src/lib/AutoformatPlugin.spec.tsx) for mixed rule undo-on-delete and successful text autoformat without `insertTrigger`.
- Expanded [DebugPlugin.spec.ts](packages/core/src/lib/plugins/debug/DebugPlugin.spec.ts) for the default console logger surface.
- Expanded [get-package-manager.spec.ts](packages/udecode/depset/src/utils/get-package-manager.spec.ts) for yarn fallback and empty user-agent defaulting.
- Added [getCellIndices.spec.ts](packages/table/src/lib/utils/getCellIndices.spec.ts) for cache-hit and warn/fallback behavior.
- Expanded [deleteText.spec.tsx](packages/slate/src/internal/transforms/deleteText.spec.tsx) for point-inside-void deletion and forward delete no-op at document end.

## Verification

- `bun test packages/docx/src/lib/docx-cleaner/utils/docxListToList.spec.ts packages/basic-nodes/src/lib/BaseMarkPlugins.spec.ts packages/table/src/lib/queries/getSelectedCellsBorders.spec.tsx packages/table/src/lib/utils/getCellIndices.spec.ts packages/autoformat/src/lib/AutoformatPlugin.spec.tsx packages/core/src/lib/plugins/debug/DebugPlugin.spec.ts packages/udecode/depset/src/utils/get-package-manager.spec.ts packages/slate/src/internal/transforms/deleteText.spec.tsx`
- `bun test packages/docx/src/lib/docx-cleaner/utils packages/basic-nodes/src/lib packages/table/src/lib packages/autoformat/src/lib packages/core/src/lib packages/udecode/depset/src/utils packages/slate/src/internal/transforms`
- `pnpm install`
- `pnpm turbo build --filter=./packages/docx --filter=./packages/basic-nodes --filter=./packages/table --filter=./packages/autoformat --filter=./packages/core --filter=./packages/udecode/depset --filter=./packages/slate`
- `pnpm turbo typecheck --concurrency=1 --filter=./packages/docx --filter=./packages/basic-nodes --filter=./packages/table --filter=./packages/autoformat --filter=./packages/core --filter=./packages/udecode/depset --filter=./packages/slate`
- `pnpm turbo build --filter=./packages/udecode/depset`
- `pnpm turbo typecheck --concurrency=1 --filter=./packages/udecode/depset`
- `pnpm lint:fix`

## Outcome

Phase 4 is complete. Non-React coverage work is spent enough that more passes would mostly be crumbs, wrappers, DOM-only Slate dust, or sludge.
