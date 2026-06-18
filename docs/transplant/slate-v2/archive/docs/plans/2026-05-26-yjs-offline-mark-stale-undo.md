# Yjs Offline Mark Stale Undo

## Goal

Fix the stale Slate history batch left after an offline mark edit is deleted by a remote replace, using TDD.

## Scope

- Add a Playwright regression for: B disconnects, marks text bold, A replaces document, B reconnects, B Undo is disabled and keyboard Undo has no page error.
- Repair the remote-import history cleanup in `@slate/yjs`.
- Verify with the focused e2e case, relevant package checks, and dev-browser repro.

## Notes

- Existing text-offset repair only handles text operations and stale merge positions.
- This bug involves non-text history operations from partial mark application.
- Package code changes likely need a changeset.

## Progress

- [x] Loaded task, TDD, testing, planning, learnings, and dev-browser instructions.
- [x] Read prior Slate Yjs history solution docs.
- [x] Add failing regression.
- [x] Fix history repair.
- [x] Verify.

## Green Test

The new regression passes after pruning stale `set_node` history batches whose replay preconditions no longer match the converged document.

Related focused e2e grep also passes:

- stale local undo after remote replace
- offline mark replace/merge coverage
- offline split reconnect undo
- offline Backspace merge reconnect undo

## Verification

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium`
- `bun --filter @slate/yjs test`
- `bun --filter @slate/yjs typecheck`
- `bun lint:fix`
- `dev-browser --connect http://127.0.0.1:9222` exact repro: B offline mark, A replace, B reconnect, Undo disabled, no page errors.

## Red Test

`PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium -g "clears stale local undo after a remote replace deletes an offline mark"`

Failure: after reconnect, `yjs-peer-b-undo` stays enabled.
