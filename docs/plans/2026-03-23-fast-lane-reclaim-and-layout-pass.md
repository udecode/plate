---
title: Fast Lane Reclaim And Layout Pass
type: testing
date: 2026-03-23
status: completed
---

# Goal

Do two testing slices in order:

1. move the cheap fake-slow package-integration specs back into the fast lane
2. add one narrow non-React `layout` coverage pass

# Scope

## Slice 1: slow -> fast reclaim

Move these files from `*.slow.*` back to `*.spec.*`:

- `apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.slow.tsx`
- `apps/www/src/__tests__/package-integration/ai-utils/findTextRangeInBlock.slow.tsx`
- `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.slow.ts`
- `apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.slow.tsx`
- `apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMdParagraphs.slow.tsx`

Keep the real heavy suites slow by design.

## Slice 2: layout

Stay in `packages/layout/src/lib/**` only.

Best seams:

- `insertColumn.ts`
- `insertColumnGroup.ts`
- `moveMiddleColumn.ts`
- `resizeColumn.ts`
- `withColumn.ts`

# Verification

## Slice 1

- targeted `bun test` on the renamed files
- `pnpm test:profile -- --top ...`
- `pnpm test:slow`

## Slice 2

- targeted `bun test` on touched `layout` specs
- `pnpm test:profile -- --top ...`
- `pnpm test:slowest -- --top ...`
- `pnpm install`
- `pnpm turbo build --filter=./packages/layout`
- `pnpm turbo typecheck --filter=./packages/layout`
- `pnpm lint:fix`

# Notes

- No `/react` work in `layout`.
- No fake smoke tests.
- If direct tests expose a real runtime bug, fix the smallest seam and record it.

# Result

## Slice 1

- Moved these files back to fast:
  - `apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.spec.tsx`
  - `apps/www/src/__tests__/package-integration/ai-utils/findTextRangeInBlock.spec.tsx`
  - `apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts`
  - `apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx`
  - `apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMdParagraphs.spec.tsx`
- Deleted stale slow-name snapshot files left behind by the rename.
- Verified the reclaimed files are nowhere near the fast-lane budget.

## Slice 2

- Added:
  - `packages/layout/src/lib/transforms/insertColumn.spec.ts`
  - `packages/layout/src/lib/transforms/insertColumnGroup.spec.ts`
  - `packages/layout/src/lib/transforms/moveMiddleColumn.spec.ts`
  - `packages/layout/src/lib/transforms/resizeColumn.spec.ts`
  - `packages/layout/src/lib/withColumn.spec.ts`
- Fixed `packages/layout/src/lib/withColumn.ts` so invalid column groups unwrap their content instead of dropping it or crashing during normalization.

## Verification

- `bun test apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.spec.tsx apps/www/src/__tests__/package-integration/ai-utils/findTextRangeInBlock.spec.tsx apps/www/src/__tests__/package-integration/markdown-rich/defaultRule.spec.ts apps/www/src/__tests__/package-integration/markdown-rich/serializeMd.spec.tsx apps/www/src/__tests__/package-integration/markdown-deserializer/deserializeMdParagraphs.spec.tsx`
- `pnpm test:profile -- --top 15 apps/www/src/__tests__/package-integration/ai-utils apps/www/src/__tests__/package-integration/markdown-rich apps/www/src/__tests__/package-integration/markdown-deserializer`
- `pnpm test:slow`
- `bun test packages/layout/src`
- `pnpm test:slowest -- --top 20 apps/www/src/__tests__/package-integration/ai-utils apps/www/src/__tests__/package-integration/markdown-rich apps/www/src/__tests__/package-integration/markdown-deserializer packages/layout/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/layout`
- `pnpm turbo typecheck --filter=./packages/layout`
- `pnpm lint:fix`
