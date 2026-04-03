---
title: Basic Styles And Math Coverage Pass
type: testing
date: 2026-03-23
status: completed
---

# Goal

Do two tiny non-React passes:

- `@platejs/basic-styles`
- `@platejs/math`

# Scope

## `basic-styles`

- `setLineHeight`
- `toUnitLess`
- `BaseLineHeightPlugin`
- `BaseFontColorPlugin`

## `math`

- `insertEquation`
- `insertInlineEquation`
- `BaseEquationPlugin`
- `BaseInlineEquationPlugin`
- `getEquationHtml`

# Explicit Deferrals

- `/react`
- broad font plugin sweep
- extra KaTeX behavior matrices

# Verification Plan

- targeted `bun test` on touched files
- `bun test packages/basic-styles/src/lib packages/math/src/lib`
- `pnpm test:profile -- --top 20 packages/basic-styles/src packages/math/src`
- `pnpm test:slowest -- --top 20 packages/basic-styles/src packages/math/src`
- `pnpm install`
- `pnpm turbo build --filter=./packages/basic-styles --filter=./packages/math`
- `pnpm turbo typecheck --filter=./packages/basic-styles --filter=./packages/math`
- `pnpm lint:fix`

# Result

- added focused `basic-styles` specs for `setLineHeight`, `toUnitLess`, `BaseLineHeightPlugin`, and `BaseFontColorPlugin`
- added focused `math` specs for `insertEquation`, `insertInlineEquation`, `BaseEquationPlugin`, `BaseInlineEquationPlugin`, and `getEquationHtml`
- verification passed:
  - targeted touched-file `bun test`
  - `bun test packages/basic-styles/src/lib packages/math/src/lib`
  - `pnpm test:profile -- --top 20 packages/basic-styles/src packages/math/src`
  - `pnpm test:slowest -- --top 20 packages/basic-styles/src packages/math/src`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/basic-styles --filter=./packages/math`
  - `pnpm turbo typecheck --filter=./packages/basic-styles --filter=./packages/math`
  - `pnpm lint:fix`
