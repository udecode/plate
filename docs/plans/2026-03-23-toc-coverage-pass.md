---
title: Toc Coverage Pass
type: testing
date: 2026-03-23
status: completed
---

# Goal

Do one tiny non-React `@platejs/toc` pass around the only real seams in the package.

# Scope

- `getHeadingList`
- `insertToc`
- `isHeading`
- `BaseTocPlugin`

# Explicit Deferrals

- `/react`
- scroll observer hooks
- sidebar/controller logic

# Verification Plan

- targeted `bun test` on touched `toc` specs
- `bun test packages/toc/src`
- `pnpm test:profile -- --top 20 packages/toc/src`
- `pnpm test:slowest -- --top 20 packages/toc/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/toc`
- `pnpm turbo typecheck --filter=./packages/toc`
- `pnpm lint:fix`

# Result

- added focused `toc` specs for `getHeadingList`, `insertToc`, `isHeading`, and `BaseTocPlugin`
- verification passed:
  - targeted touched-file `bun test`
  - `bun test packages/toc/src`
  - `pnpm test:profile -- --top 20 packages/toc/src`
  - `pnpm test:slowest -- --top 20 packages/toc/src`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/toc`
  - `pnpm turbo typecheck --filter=./packages/toc`
  - `pnpm lint:fix`
