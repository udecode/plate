# Yjs Production Network Soak

## Requirements

- [x] Borrow Potion's production boundary: Hocuspocus server, document-like room identity, auth token support, persistence storage, reconnect lifecycle.
- [x] Borrow Tiptap's production boundary: independent providers/editors joined by the same room, not four peers in one React tree.
- [x] Simulate real online network shape: separate browser contexts, latency/jitter, browser-level offline windows, reload/reconnect.
- [x] Do not change collaboration implementation internals.
- [x] Produce runnable evidence: summary file, event log, scenario counts, issue counts, network profile, room, storage location.

## Implementation

- [x] Add single-peer rendering mode to `site/examples/ts/yjs-hocuspocus.tsx`.
- [x] Add `scripts/proof/yjs-hocuspocus-production-soak.mjs`.
- [x] Add a package script for the production-like soak.

## Verification

- [x] Run the new production soak for a short window against local app/server.
- [x] Confirm it uses isolated browser contexts and the Hocuspocus route.
- [x] Confirm it records network/reload/reconnect evidence.

Evidence:

- `bun typecheck:site`
- `SOAK_HEADLESS=1 PRODUCTION_SOAK_MS=8000 PRODUCTION_SOAK_ACTION_DELAY_MS=50 PRODUCTION_SOAK_JITTER_MS=20 PRODUCTION_SOAK_RUN_ID='production-smoke-20260610-rerun' PRODUCTION_SOAK_START_SERVERS=0 bun ./scripts/proof/yjs-hocuspocus-production-soak.mjs`
- Summary: `test-results/yjs-hocuspocus-production-soak/production-smoke-20260610-rerun/summary.md`
