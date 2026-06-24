# Embeds Void Arrow Navigation Regression

## Goal

Restore keyboard navigation in `/examples/embeds` so ArrowRight from the end of the first paragraph lands on the selectable void embed before moving to the next paragraph.

## Findings

- The embeds example marks `video` as void and renders the normal Slate children spacer.
- The regression lives in core traversal, not the example renderer.
- Default `Editor.positions` must expose selectable void and read-only elements as one atomic point.
- `voids: true` remains the escape hatch for traversing the actual void children.

## Files

- `packages/slate/src/editor/positions.ts`
- `packages/slate/test/query-contract.ts`
- `playwright/integration/examples/embeds.test.ts`
- `.changeset/selectable-void-navigation.md`

## Verification

- `bun test ./packages/slate/test/query-contract.ts --bail 1`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun run playwright ./playwright/integration/examples/embeds.test.ts --project=chromium --workers=1 --retries=0`
- `bunx turbo build --filter=./packages/slate --force`
- `bunx turbo typecheck --filter=./packages/slate --force`
- `bun run typecheck:root`
- `bun run lint:fix`
- `bun run lint`

## Status

- [x] Reproduce the regression.
- [x] Add core traversal coverage.
- [x] Add embeds browser regression coverage.
- [x] Fix core traversal.
- [x] Add changeset.
- [x] Verify focused unit, browser, build, typecheck, and lint gates.
