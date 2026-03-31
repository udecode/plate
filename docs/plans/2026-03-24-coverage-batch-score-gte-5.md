---
title: Coverage Batch Score GTE 5
type: testing
date: 2026-03-24
status: completed
---

# Coverage Batch Score GTE 5

## Goal

Implement the full non-React `score >= 5` batch from [2026-03-24-coverage-priority-map-post-threshold-5b.md](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-map-post-threshold-5b.md) with narrow, real tests and only minimal runtime fixes if new red tests prove them.

## Scope

- `dnd`
  - `DndPlugin.tsx`
  - `onHoverNode.ts`
- `docx`
  - `getVShapes.ts`
- `list`
  - `BaseListPlugin.tsx`
  - `getSiblingList.ts`
  - `areEqListStyleType.ts`
- `code-drawing`
  - `renderers.ts`
- `markdown`
  - `listToMdastTree.ts`
- `autoformat`
  - `AutoformatPlugin.ts`
- `layout`
  - `withColumn.ts`
- `core`
  - `getPlainText.tsx`
  - `cleanHtmlTextNodes.ts`
  - `deserializeHtmlNodeChildren.ts`
  - `createStaticString.ts`
- `link`
  - `unwrapLink.ts`
- `slate`
  - `isTargetInsideNonReadonlyVoid.ts`
- `@udecode/depset`
  - `get-package-manager.ts`
- `suggestion`
  - `getActiveSuggestionDescriptions.ts`
- `table`
  - `getSelectedCells.ts`
- `docx-io`
  - `vnode.ts`

## Constraints

- No `/react` coverage.
- No browser work.
- No vanity smoke tests.
- Keep specs beside implementations where possible.
- Prefer deterministic unit tests, thin editor/plugin contract tests, and golden serializer/parser tests.

## Progress

- [x] Sync task/testing rules and fresh ranking
- [x] Read target files and nearby specs
- [x] Land package-grouped specs
- [x] Fix any real red-test runtime seams
- [x] Verify touched graph with tests, build, typecheck, lint

## Verification

Passed in this batch:

- `bun test` on the 20 touched specs
- `bun test` on the affected package graph
- `pnpm test:profile -- --top 25` on the affected package graph
- `pnpm test:slowest -- --top 25` on the affected package graph
- `pnpm install`
- `pnpm turbo build --filter=./packages/dnd --filter=./packages/docx --filter=./packages/list --filter=./packages/code-drawing --filter=./packages/markdown --filter=./packages/autoformat --filter=./packages/layout --filter=./packages/core --filter=./packages/link --filter=./packages/slate --filter=./packages/udecode/depset --filter=./packages/suggestion --filter=./packages/table --filter=./packages/docx-io`
- `pnpm turbo typecheck --concurrency=1 --filter=./packages/dnd --filter=./packages/docx --filter=./packages/list --filter=./packages/code-drawing --filter=./packages/markdown --filter=./packages/autoformat --filter=./packages/layout --filter=./packages/core --filter=./packages/link --filter=./packages/slate --filter=./packages/udecode/depset --filter=./packages/suggestion --filter=./packages/table --filter=./packages/docx-io`
- `pnpm lint:fix`
