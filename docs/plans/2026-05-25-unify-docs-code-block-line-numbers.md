---
title: Unify docs code block line numbers
date: 2026-05-25
status: complete
---

## Goal

Make Plate docs code blocks match the shadcn-style code surface by showing line numbers for multi-line source snippets.

## Findings

- `rehype-pretty-code` already supports `showLineNumbers` metadata and the CSS already styles `[data-line-numbers]`.
- Many MDX fences opt into `showLineNumbers`, but generated/client code blocks still render without line numbers.
- `apps/www/src/components/codeblock.tsx` and `InstallationCode` force `showLineNumbers={false}`.
- Command-style snippets should stay clean; line numbers are useful for multi-line source snippets, not single-line install commands.
- Root cause for MDX blocks: `code` rendered with `data-line-numbers`, but lines were only `class="line"`, while the docs CSS increments counters on `[data-line]`.

## Plan

1. Add `showLineNumbers` metadata to multi-line MDX source blocks before `rehype-pretty-code` runs.
2. Enable line numbers in client-rendered code blocks when the code spans multiple lines.
3. Verify typecheck, lint, and browser screenshots.

## Progress

- 2026-05-25: Located MDX and client code block implementations.
- 2026-05-25: Added automatic `showLineNumbers` metadata for multi-line non-command MDX source blocks.
- 2026-05-25: Enabled line numbers for multi-line client-rendered code blocks and installation source snippets.
- 2026-05-25: Added `data-line` in `rehype-pretty-code` `onVisitLine` so the existing CSS counter renders.
- 2026-05-25: Verified with `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, and `pnpm lint:fix`.
- 2026-05-25: Browser verification on `localhost:3001/docs/installation/react`: React install code block shows line numbers 1-6; HTML contains both `data-line-numbers` and `data-line`.
- 2026-05-26: Regression found on `localhost:3001/docs/plugin-shortcuts`: lines had `data-line`, but generated `code` lacked `data-line-numbers`, so the CSS counter never started.
- 2026-05-26: Fixed the MDX pipeline to preserve a private `__showLineNumbers__` flag across `rehype-pretty-code` and apply `data-line-numbers` to each generated `code` element after dual-theme expansion.
- 2026-05-26: Verified `localhost:3001/docs/plugin-shortcuts` in Browser: the `MyDocumentPlugin` block has `data-line-numbers`, 31 `data-line` rows, and visible line numbers.
- 2026-05-26: Verified with `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and `git diff --check`.

## Compound Evaluation

This produced reusable knowledge: `showLineNumbers` metadata is not sufficient unless line nodes match the local CSS selector. Updated `docs/solutions/ui-bugs/2026-05-25-docs-code-block-light-theme-must-use-light-shiki-tokens.md`.
