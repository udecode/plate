# Mixed Utility Coverage Batch

## Goal

Cover the remaining high-value non-React seams after the March 24 refresh:

- `core/internal/utils/mergeDeep.ts`
- `emoji` grid and inline-index helpers
- `basic-styles` leaf plugin contracts
- `selection` non-DOM helpers
- `docx-io` narrow XML generator helpers

## Scope

- Test-only unless a direct spec exposes a real bug.
- No `/react` coverage.
- No broad package sweep.

## Targets

- `packages/core/src/internal/utils/mergeDeep.ts`
- `packages/emoji/src/lib/utils/Grid/GridSection.ts`
- `packages/emoji/src/lib/utils/Grid/Grid.ts`
- `packages/emoji/src/lib/utils/IndexSearch/EmojiInlineIndexSearch.ts`
- `packages/emoji/src/lib/utils/EmojiLibrary/EmojiInlineLibrary.ts`
- `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.ts`
- `packages/basic-styles/src/lib/BaseFontFamilyPlugin.ts`
- `packages/basic-styles/src/lib/BaseFontSizePlugin.ts`
- `packages/basic-styles/src/lib/BaseFontWeightPlugin.ts`
- `packages/basic-styles/src/lib/BaseTextIndentPlugin.ts`
- `packages/selection/src/lib/isSelecting.ts`
- `packages/selection/src/lib/extractSelectableIds.ts`
- `packages/selection/src/internal/utils/events.ts`
- `packages/docx-io/src/lib/internal/schemas/theme.ts`
- `packages/docx-io/src/lib/internal/schemas/styles.ts`
- `packages/docx-io/src/lib/internal/helpers/render-document-file.ts`

## Verification

1. targeted `bun test` on touched packages
2. `pnpm install`
3. filtered `pnpm turbo build`
4. filtered `pnpm turbo typecheck`
5. `pnpm lint:fix`
