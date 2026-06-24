# Yjs Hocuspocus Persistent Room Soak

## Goal

Run a one-hour Hocuspocus soak where four independent browser users edit the
same room continuously. The page is not reloaded between scenarios, the room is
not changed, and the document is expected to grow over time.

## Command

```sh
SOAK_HEADLESS=1 \
PERSISTENT_SOAK_MS=3600000 \
PERSISTENT_SOAK_ACTION_DELAY_MS=1000 \
PERSISTENT_SOAK_REPORT_EVERY_MS=60000 \
PERSISTENT_SOAK_RUN_ID=persistent-room-1h-20260611 \
bun ./scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs
```

## Scenario

- Four independent browser contexts join the same Hocuspocus room.
- Each peer opens only its own editor instance with `?peer=a|b|c|d`.
- The runner repeats these scenario groups without changing room:
  - `growth-burst`: all peers append text and insert text.
  - `block-growth`: peers split nodes and insert fragments.
  - `structure-churn`: peers wrap, unwrap, move, and set/unset attributes.
  - `offline-catchup`: one peer disconnects, edits locally, then reconnects.
  - `history-interleave`: undo/redo is interleaved with remote edits.
- After each group, all peers are checked for convergence and DOM shape.

## Bug Recording

The runner records:

- `pageerror`
- console errors
- non-convergence after reconnect/checkpoint
- nested paragraph or `div` inside paragraph DOM shape
- editor-count mismatch
- scenario exceptions

## Results

Run id: `persistent-room-1h-20260611-010423`

- Summary: `test-results/yjs-hocuspocus-persistent-room-soak/persistent-room-1h-20260611-010423/summary.md`
- Event log: `test-results/yjs-hocuspocus-persistent-room-soak/persistent-room-1h-20260611-010423/events.jsonl`
- Status: complete
- Elapsed: 3,635,409 ms
- Actions: 3,232
- Convergence checkpoints: 506
- Offline catchup windows: 101
- Final document size: 405 blocks / 7,385 chars on every peer
- Console errors: 0
- Page errors: 0
- Issues: 0

No bugs were recorded in this run.
