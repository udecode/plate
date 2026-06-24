# Yjs offline merge undo no-op

## Target

Match Potion reference for this case:

1. A writes `alpha` / `beta`.
2. B disconnects.
3. B presses Backspace at the start of `beta`, locally merging to `alphabeta`.
4. A inserts `!` after `alpha`.
5. B reconnects; all peers converge to `alpha!beta`.
6. B undo should not split at the wrong point. Until semantic undo is proven safe, it should no-op and keep `alpha!beta`.

## Plan

1. Add failing Playwright coverage.
2. Fix historic Yjs undo fallback so mismatched structural history does not export the wrong Slate replay.
3. Verify with focused Playwright, package tests, typecheck, lint, and dev-browser if needed.

## Notes

- Potion reference result: reconnect `alpha!beta`; B undo no-op, still `alpha!beta`.
- Current local result: B undo converges every peer to `alpha` / `!beta`.
- Prior solution docs show stale reconnect history must be repaired or discarded before unsafe replay.

## Verification

- Red: focused Playwright failed with `["alpha", "!beta"]`.
- Green: focused Playwright passed.
- Regression: full `yjs-collaboration.test.ts` passed.
- Package: `bun --filter @slate/yjs test` passed.
- Typecheck: `bun typecheck:root` and `bun typecheck:site` passed.
- Lint: `bun lint:fix` passed with no fixes.
- Browser: `dev-browser --connect http://127.0.0.1:9222` reproduced the user steps and kept all peers at `alpha!beta` after `Meta+Z`.
