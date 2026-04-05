---
title: Docx IO Conversion Seams
type: testing
date: 2026-03-17
status: completed
---

# Docx IO Conversion Seams

## Goal

Complete ordered slice 3 only:

- add deterministic package-local coverage for pure DOCX conversion helpers
- cover comment preprocessing, list style mapping, font/url helpers, and small `DocxDocument` builder contracts
- fix any real conversion bug the new specs expose

## Scope

- `packages/docx-io/src/lib/preprocessMammothHtml.ts`
- `packages/docx-io/src/lib/html-to-docx/utils/list.ts`
- `packages/docx-io/src/lib/html-to-docx/utils/font-family-conversion.ts`
- `packages/docx-io/src/lib/html-to-docx/utils/url.ts`
- `packages/docx-io/src/lib/html-to-docx/docx-document.ts`

## Findings

- `docx-io` already has decent `html-to-docx` integration coverage plus unit coverage for color and unit conversion
- there is still no direct coverage for Mammoth comment preprocessing, list style mapping, font family parsing, URL validation, or `DocxDocument` helper contracts
- `decimal-bracket-end` gets the right list suffix but falls back to the package default numbering type instead of forcing decimal numbering
- Mammoth comment extraction loses word boundaries across sibling block nodes, so multi-paragraph comments collapse into strings like `Second notemore detail`
- `docx-io` is outside the fast test bucket, so targeted iteration for this package needs `bun test <files>` instead of `bun run test`
- `pnpm turbo typecheck --filter=./packages/docx-io` only went green after a full root `pnpm build`; the earlier filtered build was not enough to satisfy workspace-built exports for this package

## Progress

- [x] add helper specs
- [x] fix any real helper bug the new specs expose
- [x] add focused `DocxDocument` coverage
- [x] run targeted verification

## Verification

- `bun test packages/docx-io/src/lib/preprocessMammothHtml.spec.ts packages/docx-io/src/lib/html-to-docx/utils/list.spec.ts packages/docx-io/src/lib/html-to-docx/utils/font-family-conversion.spec.ts packages/docx-io/src/lib/html-to-docx/utils/url.spec.ts packages/docx-io/src/lib/html-to-docx/docx-document.spec.ts`
- `pnpm install`
- `pnpm turbo build --filter=./packages/docx-io`
- `pnpm turbo typecheck --filter=./packages/docx-io`
- `pnpm lint:fix`
- `bun test packages/docx-io/src/lib/preprocessMammothHtml.spec.ts packages/docx-io/src/lib/html-to-docx/utils/list.spec.ts packages/docx-io/src/lib/html-to-docx/utils/font-family-conversion.spec.ts packages/docx-io/src/lib/html-to-docx/utils/url.spec.ts packages/docx-io/src/lib/html-to-docx/docx-document.spec.ts`
- `pnpm build`
- `pnpm turbo typecheck --filter=./packages/docx-io`

## Outcome

- added deterministic coverage for Mammoth comment preprocessing, list style mapping, font family parsing, URL validation, and `DocxDocument` helper contracts
- fixed `decimal-bracket-end` so it always emits decimal numbering instead of inheriting the package default style
- fixed comment extraction so block-separated Mammoth comments keep word boundaries after whitespace normalization
- confirmed package typecheck passes once the workspace is built at the repo root
