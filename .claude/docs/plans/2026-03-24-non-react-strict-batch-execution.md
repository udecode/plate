---
title: Non React Strict Batch Execution
type: testing
date: 2026-03-24
status: completed
---

# Non React Strict Batch Execution

## Goal

Execute the strict next batch from the non-React testing review without turning it into another package sweep.

## Ordered Scope

1. `packages/list-classic/src/lib/BaseTodoListPlugin.ts`
2. `packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.ts`
3. `packages/markdown/src/lib/deserializer/deserializeMd.ts`
4. `packages/suggestion/src/lib/transforms/deleteSuggestion.ts`
5. `packages/table/src/lib/merge/deleteColumn.ts`
6. `packages/suggestion/src/lib/transforms/rejectSuggestion.ts`
7. `packages/table/src/lib/merge/insertTableColumn.ts`
8. `packages/table/src/lib/merge/insertTableRow.ts`
9. `packages/suggestion/src/lib/BaseSuggestionPlugin.ts`
10. `packages/table/src/lib/BaseTablePlugin.ts`
11. `packages/list/src/lib/withList.ts`
12. `packages/core/src/lib/plugins/override/withMergeRules.ts`

## Status

- [x] Read the audit output and existing adjacent specs
- [x] Implement the strict batch coverage
- [x] Run targeted tests
- [x] Run build -> typecheck -> lint for the affected package graph

## Verification

- `bun test packages/list-classic/src/lib/BaseTodoListPlugin.spec.ts packages/core/src/lib/plugins/html/utils/pluginDeserializeHtml.spec.ts packages/markdown/src/lib/deserializer/deserializeMd.spec.ts packages/suggestion/src/lib/BaseSuggestionPlugin.spec.ts packages/suggestion/src/lib/transforms/rejectSuggestion.spec.tsx packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts packages/table/src/lib/BaseTablePlugin.spec.ts packages/table/src/lib/merge/deleteColumn.spec.tsx packages/table/src/lib/merge/insertTableColumn.spec.tsx packages/table/src/lib/merge/insertTableRow.spec.tsx packages/list/src/lib/withList.spec.tsx packages/core/src/lib/plugins/override/withMergeRules.spec.tsx`
- `bun test packages/list-classic/src packages/core/src/lib packages/markdown/src packages/suggestion/src packages/table/src packages/list/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/list-classic --filter=./packages/core --filter=./packages/markdown --filter=./packages/suggestion --filter=./packages/table --filter=./packages/list`
- `pnpm turbo typecheck --concurrency=1 --filter=./packages/list-classic --filter=./packages/core --filter=./packages/markdown --filter=./packages/suggestion --filter=./packages/table --filter=./packages/list`
- `pnpm lint:fix`
- post-lint rerun: the targeted `bun test` slice above
