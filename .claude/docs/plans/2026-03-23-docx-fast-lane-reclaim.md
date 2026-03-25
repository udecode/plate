---
title: Docx Fast Lane Reclaim
type: testing
date: 2026-03-23
status: completed
---

# Goal

Move the cheap deterministic `docx` and `docx-io` helper specs from `*.slow.*`
back to the fast lane.

# Scope

## Move back to fast

- `packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/cleanDocxListElementsToList.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/docxListToList.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getVShapeSpid.slow.ts`
- `packages/docx-io/src/lib/preprocessMammothHtml.slow.ts`
- `packages/docx-io/src/lib/internal/utils/color-conversion.slow.ts`
- `packages/docx-io/src/lib/internal/utils/font-family-conversion.slow.ts`
- `packages/docx-io/src/lib/internal/utils/image-dimensions.slow.ts`
- `packages/docx-io/src/lib/internal/utils/image-to-base64.slow.ts`
- `packages/docx-io/src/lib/internal/utils/list.slow.ts`
- `packages/docx-io/src/lib/internal/utils/unit-conversion.slow.ts`
- `packages/docx-io/src/lib/internal/utils/url.slow.ts`

## Keep slow

- `packages/docx/src/lib/docx-cleaner/cleanDocx.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getVShapes.slow.ts`
- `packages/docx-io/src/lib/internal/docx-document.slow.ts`
- `packages/docx-io/src/lib/internal/html-to-docx.slow.ts`
- package and app fixture-heavy `docx` / `docx-io` integration files

# Constraints

- no new coverage work
- no runtime changes unless a renamed test exposes a real bug
- no fake reclaim of fixture-heavy or zip-heavy suites

# Verification

- targeted `bun test` on the renamed files
- `pnpm test:profile -- --top 25 packages/docx packages/docx-io`
- `pnpm test:slow -- packages/docx packages/docx-io`
- `pnpm install`
- `pnpm turbo build --filter=./packages/docx --filter=./packages/docx-io`
- `pnpm turbo typecheck --filter=./packages/docx --filter=./packages/docx-io`
- `pnpm lint:fix`

# Result

## Moved back to fast

- `packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/cleanDocxListElementsToList.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/docxListToList.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.spec.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getVShapeSpid.spec.ts`
- `packages/docx-io/src/lib/preprocessMammothHtml.spec.ts`
- `packages/docx-io/src/lib/internal/utils/color-conversion.spec.ts`
- `packages/docx-io/src/lib/internal/utils/font-family-conversion.spec.ts`
- `packages/docx-io/src/lib/internal/utils/image-dimensions.spec.ts`
- `packages/docx-io/src/lib/internal/utils/image-to-base64.spec.ts`
- `packages/docx-io/src/lib/internal/utils/list.spec.ts`
- `packages/docx-io/src/lib/internal/utils/unit-conversion.spec.ts`
- `packages/docx-io/src/lib/internal/utils/url.spec.ts`

## Kept slow on purpose

- `packages/docx/src/lib/docx-cleaner/cleanDocx.slow.ts`
- `packages/docx/src/lib/docx-cleaner/utils/getVShapes.slow.ts`
- `packages/docx-io/src/lib/internal/docx-document.slow.ts`
- `packages/docx-io/src/lib/internal/html-to-docx.slow.ts`
- app-owned `docx` / `docx-io` integration fixtures

## Verification

- `bun test packages/docx/src/lib/docx-cleaner/utils/cleanDocxImageElements.spec.ts packages/docx/src/lib/docx-cleaner/utils/cleanDocxListElementsToList.spec.ts packages/docx/src/lib/docx-cleaner/utils/docxListToList.spec.ts packages/docx/src/lib/docx-cleaner/utils/getRtfImageHex.spec.ts packages/docx/src/lib/docx-cleaner/utils/getRtfImageMimeType.spec.ts packages/docx/src/lib/docx-cleaner/utils/getRtfImagesByType.spec.ts packages/docx/src/lib/docx-cleaner/utils/getRtfImagesMap.spec.ts packages/docx/src/lib/docx-cleaner/utils/getVShapeSpid.spec.ts packages/docx-io/src/lib/preprocessMammothHtml.spec.ts packages/docx-io/src/lib/internal/utils/color-conversion.spec.ts packages/docx-io/src/lib/internal/utils/font-family-conversion.spec.ts packages/docx-io/src/lib/internal/utils/image-dimensions.spec.ts packages/docx-io/src/lib/internal/utils/image-to-base64.spec.ts packages/docx-io/src/lib/internal/utils/list.spec.ts packages/docx-io/src/lib/internal/utils/unit-conversion.spec.ts packages/docx-io/src/lib/internal/utils/url.spec.ts`
- `pnpm test:profile -- --top 25 packages/docx packages/docx-io`
- `pnpm test:slowest -- --top 25 packages/docx packages/docx-io`
- `pnpm test:slow -- packages/docx packages/docx-io`
- `pnpm install`
- `pnpm turbo build --filter=./packages/docx --filter=./packages/docx-io`
- `pnpm turbo typecheck --filter=./packages/docx --filter=./packages/docx-io`
- `pnpm lint:fix`
