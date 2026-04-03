---
title: Coverage Batch Hotkeys Docx Followups
type: testing
date: 2026-03-24
status: completed
---

# Coverage Batch Hotkeys Docx Followups

## Goal

Execute the full next-value non-React coverage batch from the fresh priority map instead of another tiny one-file pass.

## Scope

- `@udecode/react-hotkeys`
- `docx`
- `toggle`
- `suggestion`
- `autoformat`
- `markdown`
- `media`
- `list`
- `list-classic`
- `code-drawing`

## Target Files

- `packages/udecode/react-hotkeys/src/internal/isHotkeyPressed.ts`
- `packages/udecode/react-hotkeys/src/internal/validators.ts`
- `packages/docx/src/lib/DocxPlugin.ts`
- `packages/docx/src/lib/docx-cleaner/cleanDocx.ts`
- `packages/docx/src/lib/docx-cleaner/utils/*` targeted deterministic helpers from the current score map
- `packages/toggle/src/lib/queries/someToggle.ts`
- `packages/suggestion/src/lib/queries/findSuggestionNode.ts`
- `packages/autoformat/src/lib/rules/math/*` targeted rule helpers plus `AutoformatPlugin.ts` only if still worth it
- `packages/markdown/src/lib/mdast.ts`
- `packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts`
- `packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts`
- `packages/list/src/lib/queries/isOrderedList.ts`
- `packages/list-classic/src/lib/normalizers/normalizeNestedList.ts`
- `packages/code-drawing/src/lib/utils/download.ts`
- `packages/markdown/src/lib/mdast.ts` scored as a false positive because it is a type barrel and not worth runtime coverage

## Hard Constraints

- no `/react`
- no browser work
- no vanity reopen of dust files
- keep tests deterministic and fast-lane unless a spec genuinely trips the gate
- prefer direct unit or thin editor-contract tests over smoke coverage

## Verification

1. targeted `bun test` on touched packages
2. `pnpm test:profile -- --top 25 ...` on affected package paths
3. `pnpm test:slowest -- --top 25 ...` on affected package paths
4. `pnpm install`
5. `pnpm turbo build` for the affected package graph
6. `pnpm turbo typecheck` for the affected package graph
7. `pnpm lint:fix`

## Notes

- `docx` is the biggest reopen risk. Keep that slice on deterministic helpers and plugin contracts only.
- `@udecode/react-hotkeys` is the cleanest untouched value.
- if a new direct test exposes a real bug, fix the smallest runtime seam instead of papering it over in the spec.
- Verification result:
  - targeted and affected-package `bun test` runs are green
  - `pnpm test:slowest` is green and under the fast-lane thresholds
  - filtered build is green
  - filtered typecheck is still blocked by existing `list-classic` generic/type drift unrelated to the new seams
  - `pnpm lint:fix` is green
