# Yjs Potion differential fixes

## Goal

Fix Potion-differential Slate Yjs collaboration bugs with TDD. Work in vertical
slices: one failing e2e, one fix, then expand.

## Confirmed Bugs

1. Split-at-end + type + remote insert: one undo leaves `alpha! / b` locally,
   while Potion restores a single `alpha!` paragraph.
2. Merge + remote insert: local reconnect gives `alpha!beta` and undo no-ops,
   while Potion can undo back to `alpha! / beta`.
3. Remove second-block text + remote edit: local drops the remote `!`, while
   Potion preserves it as `alpha / !` and undo restores `alpha / beta!`.
4. Replace selected first word + remote append: local undo leaves `A beta!`,
   while Potion restores `alpha beta!`.

## Slices

1. [x] Add failing Playwright coverage for the four confirmed browser
   behaviors.
2. [x] Fix Yjs structural merge/remove/replace import behavior and Slate
   history repair at the shared controller boundary.
3. [x] Run focused browser test, package test, package typecheck, lint.

## Outcome

- Offline split-at-end + type undo restores the single `alpha!` paragraph.
- Offline Backspace merge + concurrent text insert reconnects to `alpha!beta`
  and one undo restores `alpha! / beta`.
- Offline text removal preserves concurrent remote text inside the removed block
  and one undo restores `alpha / beta!`.
- Offline selected word replacement preserves concurrent remote text and one
  undo restores `alpha beta!`.
- Continued typing after selected text replacement is a single Slate history
  undo unit.

## Verification

- `bun test ./packages/slate-history/test/history-contract.ts`
- `bun test ./packages/slate-yjs/test`
- `bun --filter ./packages/slate-yjs typecheck`
- `bun --filter ./packages/slate-history typecheck`
- `bun lint:fix`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium`
- `dev-browser --connect http://127.0.0.1:9222` against
  `http://127.0.0.1:3100/examples/yjs-collaboration` for merge undo and
  selected replacement undo paths.

## Notes

- Package changesets are present for `@slate/yjs` and `slate-history`.
- `pnpm turbo typecheck --filter=...` is blocked in this repo by
  `Unsupported package manager specification (bun@1.3.12)`, so package
  typechecks used Bun workspace filters.
