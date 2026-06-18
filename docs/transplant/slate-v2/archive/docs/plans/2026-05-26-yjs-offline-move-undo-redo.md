# Yjs Offline Move Undo/Redo

## Goal

Match Potion for this scenario:

1. B goes offline.
2. B moves `beta` before `alpha`.
3. A appends `!` to `gamma`.
4. B reconnects.
5. B undo/redo converges on every peer.

## Current Reference

Potion converges:

- reconnect: `beta / alpha / gamma!`
- B undo: `alpha / beta / gamma!`
- B redo: `beta / alpha / gamma!`

## Plan

1. Add a failing Playwright row in `playwright/integration/examples/yjs-collaboration.test.ts`. Done.
2. Confirm the red reproduces local split behavior. Done.
3. Fix `packages/slate-yjs` structural move history so undo/redo hides/reveals the right Yjs nodes. Done.
4. Run focused Playwright, package typecheck/test, and lint. Done.

## Notes

- Existing fixes already cover offline replace, split, text metadata, and stale text history offsets.
- This task changes published `packages/slate-yjs`; keep/adjust changeset coverage before closeout.
- Root cause: fallback `move_node` encoding inserted same-parent forward moves at the pre-hide destination index. With clone-and-hide moves, `[0] -> [1]` must insert one visible slot later before hiding the original node.
- Captured reusable learning in `docs/solutions/logic-errors/yjs-forward-move-history-fallback-2026-05-26.md`.
- Verification:
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "keeps offline move undo and redo converged after reconnect"`: pass
  - `bun --filter @slate/yjs test`: pass
  - `bun --filter @slate/yjs typecheck`: pass
  - `bun run lint:fix`: pass
