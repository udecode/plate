---
title: Core Coverage Pass
type: testing
date: 2026-03-23
status: completed
---

# Goal

Do one narrow non-React `@platejs/core` pass around the remaining HTML and static helper seams.

# Scope

- `pluginDeserializeHtml`
- `deserializeHtmlNode`
- `getDataNodeProps`
- `normalizeDescendantsToDocumentFragment`
- `getRenderNodeStaticProps`

# Explicit Deferrals

- `/react`
- broader plugin resolution or store work
- DOM/editor interface sweeps

# Verification Plan

- targeted `bun test` on touched core specs
- `bun test packages/core/src/lib packages/core/src/static`
- `pnpm test:profile -- --top 20 packages/core/src/lib packages/core/src/static`
- `pnpm test:slowest -- --top 20 packages/core/src/lib packages/core/src/static`
- `pnpm install`
- `pnpm turbo build --filter=./packages/core`
- `pnpm turbo typecheck --filter=./packages/core`
- `pnpm lint:fix`

# Result

- added focused core specs for `pluginDeserializeHtml` and `getRenderNodeStaticProps`
- expanded direct helper coverage for `deserializeHtmlNode`, `getDataNodeProps`, and `normalizeDescendantsToDocumentFragment`
- verification passed:
  - targeted touched-file `bun test`
  - `bun test packages/core/src/lib packages/core/src/static`
  - `pnpm test:profile -- --top 20 packages/core/src/lib packages/core/src/static`
  - `pnpm test:slowest -- --top 20 packages/core/src/lib packages/core/src/static`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/core`
  - `pnpm turbo typecheck --filter=./packages/core`
  - `pnpm lint:fix`
