# Yjs Offline Mixed Edits Reconnect

## Goal

Fix the four-peer Yjs demo path where disconnected peers make independent mark,
text replacement, and paragraph insertion edits, then reconnect in sequence.
The merged document should preserve the text replacement and insertion instead
of dropping `Hi` or duplicating `Hello world!`.

## Scope

- Add Playwright coverage for the browser-visible regression.
- Fix the collaboration/Yjs import or encoding path that causes destructive
  snapshot-style reconnect behavior.
- Verify with the focused Yjs example test and package checks.

## Progress

- Reproduced manually in `dev-browser`.
- Reviewed existing Yjs solution notes for reconnect history and hidden
  replacement containers.
- Added a failing Playwright regression for offline mark, text replacement, and
  paragraph insertion edits.
- Fixed `split_node` Yjs encoding so Enter does not fall back to a full-document
  snapshot write.
- Verified package build/typecheck, focused core tests, full Yjs example
  Playwright, lint, and dev-browser manual repro.
- Codex review found Yjs text leaf metadata/delta drift cases after reconnect.
- Added regressions for concurrent marks, mark removal, same-text split/merge
  formatting, collapsed relative selections, and legacy metadata-only documents.
- Updated text reads/writes so delta attributes preserve concurrent edits while
  metadata boundaries still load older same-text split/merge documents.
- Threaded version-aware text read options through internal split/merge/move
  paths so versionless legacy metadata-only documents keep marks after edits.
- Backfilled Y.Text delta attributes when converting versionless legacy roots
  and made versioned exact-boundary delta attr changes win over stale metadata.
- Restored `site/next-env.d.ts` to stable refs-only content after Playwright
  rewrote a `.next` import, then verified `bun typecheck:site` with `site/.next`
  temporarily absent.
- Fixed the final Codex review formatting finding with `bun lint:fix`.
- Renamed the Slate Yjs core regression file to `core-contract.test.ts` so
  `bun --filter @slate/yjs test` discovers the coverage.
- Added legacy metadata regressions for full-range mark additions and partial
  same-key delta formatting; package test discovery now runs 43 Yjs core tests.
- Added null text-attribute round-trip coverage and kept null metadata fallback
  for delta-preferred reads, since Yjs deltas omit null-valued attributes.
- Added versioned metadata-only split mark-removal coverage so old same-text
  split/merge documents do not reload removed marks from uniform Yjs deltas.
- Narrowed metadata control to cases where present metadata values agree with
  the uniform delta value, so stale metadata cannot override real delta changes.
- Captured the metadata/delta reconciliation learning in
  `docs/solutions/logic-errors/yjs-text-leaf-metadata-delta-sync-2026-05-26.md`.
