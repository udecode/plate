# Yjs collaboration soak

## Goal

Use the formal Yjs collaboration soak runner against the local
`yjs-collaboration` example to simulate normal multi-user collaborative
editing. Record runtime errors, convergence failures, stale presence, and
suspicious user-visible state.

## Scope

- Browser: Playwright-launched Chromium by default, or persistent debug Chrome
  when `SOAK_LAUNCH=0`.
- Target: `http://127.0.0.1:3100/examples/yjs-collaboration`.
- Duration: defaults to 3 hours; override with `SOAK_MS`.
- Frequency: low-frequency edits so this resembles human collaboration rather
  than a stress fuzzer.
- No code fixes in this pass.

## Scenario Mix

- Connected typing in different peers.
- Short selections and mark toggles.
- Paragraph insertions and deletions.
- Occasional undo/redo.
- Brief single-peer disconnect/reconnect windows with local edits.
- Periodic snapshot checks across all peers.

## Recording

- Command: `bun test:yjs-collaboration-soak`
- Harness script: `scripts/proof/yjs-collaboration-soak.mjs`
- Log: `test-results/yjs-collaboration-soak/<run_id>/events.jsonl`
- Summary: `test-results/yjs-collaboration-soak/<run_id>/summary.md`

## Status

- [x] Prepare harness.
- [x] Start local demo / confirm existing server.
- [x] Run soak.
- [x] Summarize findings.

## Notes

- 60s dry run completed with 8 iterations and no collaboration anomalies.
- The harness records peer debug lines from each peer card, not only editor text.
- The page currently emits one `403 Forbidden` resource console error on load; keep it in the log but classify separately from collaboration behavior unless it correlates with editor failure.
- First long run reached iteration 80 with no collaboration anomalies, then hit a harness-only selection race at iteration 81 (`Peer a paragraph 1 not found`). The runner now retries selection and clamps the paragraph index against the current DOM before restarting the soak.
- Accelerated 3m dry run with a low reset threshold completed 32 iterations with no anomalies, covering repeated reset/undo/redo/disconnect cycles.
- Formal 2h run completed from `2026-05-26T17:30:07.686Z` to `2026-05-26T19:30:12.845Z`.
- Formal run covered 151 iterations, 30 snapshots, repeated connected edits, selection/mark toggles, undo/redo, and brief peer disconnect/reconnect windows.
- Formal run result: 0 collaboration anomalies, 0 browser page errors, 6 console resource errors. All 6 console errors were the same `Failed to load resource: the server responded with a status of 403 (Forbidden)` message and did not correlate with editor divergence or runtime failures.
- Final peer state: all peers connected and converged on `Hello world!`.
