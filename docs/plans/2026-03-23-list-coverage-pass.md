---
title: List Coverage Pass
type: testing
date: 2026-03-23
status: in_progress
---

# Goal

Do one narrow non-React pass on `@platejs/list`.

# Target Seams

- `packages/list/src/lib/queries/getSiblingListStyleType.ts`
- `packages/list/src/lib/transforms/toggleListByPath.ts`
- `packages/list/src/lib/queries/someList.ts`
- `packages/list/src/lib/queries/someTodoList.ts`
- `packages/list/src/lib/transforms/setListNode.ts`

# Constraints

- no `/react`
- no package sweep
- no fake smoke tests
- keep everything in fast `*.spec.*`

# Verification

- targeted `bun test` on touched `packages/list/src/lib/**` specs
- `pnpm test:profile -- --top 15 packages/list/src`
- `pnpm test:slowest -- --top 15 packages/list/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/list`
- `pnpm turbo typecheck --filter=./packages/list`
- `pnpm lint:fix`
