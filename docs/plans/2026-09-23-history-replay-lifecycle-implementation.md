---
review_scopes: [history]
review_basis: [2026-09-23-history-async-replay-api]
work_kind: implementation
---

# History replay lifecycle implementation

Status: Completed.

Objective: Adopt the accepted replay lifecycle in
`2026-09-23-history-replay-lifecycle-revised.md` across Plite History, mounted
React callers, Plate Comments, browser proof, docs and release artifacts.

Source authority:

- [Accepted design](2026-09-23-history-replay-lifecycle-revised.md), especially
  decision rows 1-15, execution slices 1-5 and its proof matrix.
- [History ownership](../research/decisions/history-ownership.md).
- TaskHub-22 keeps a blocked entry as the next target; this work does not add a
  skip or discard API.

Completion threshold:

- [x] Slice 1: per-editor claim, pending read, single-flight result, live edits,
      settlement table, mapping journals and retirement semantics pass History
      tests and typechecks.
- [x] Slice 2: a Yjs remote update publishes during pending replay and the
      branch settles correctly.
- [x] Slice 3: one mounted dispatcher owns completion and errors;
      `useEditorHistory` is void-returning, pending-aware and exact-runtime.
- [x] Slice 4: Comments replay uses its thread queue; Plate callers, types and
      generated registry adopt the API.
- [x] Slice 5: deterministic Chromium proof, docs, behavior law, doctrine,
      changesets and registry changelog are complete.
- [x] Final source-to-plan reconciliation finds no omitted accepted row; all
      applicable checks pass and the ledger records the implementation outcome.

Verification surface:

- `pnpm --filter plitejs test:partition:history`
- `pnpm --filter plitejs typecheck:partition:history`
- Focused Plite React, Yjs, Plate Comments and combobox tests from the accepted
  plan.
- `pnpm --filter www build:registry`
- Chromium `tests/browser/comment.spec.ts` on `/blocks/discussion-proof`.
- Docs build, Plate Next version validation, ledger render/check and
  `node .agents/skills/autogoal/scripts/check-complete.mjs` on this plan.

Constraints:

- `editor.api.history.undo()` and `redo()` remain
  `Promise<HistoryResult>`; mounted controller methods return `void`.
- Local input, selection commits and remote imports publish while a session
  replay is pending. Only overlapping replay is refused with `busy`.
- Pending is per-editor runtime state and is absent from History JSON,
  snapshots and collaboration.
- Product refusal presentation remains deferred. The exact initiating
  `Editable` receives the fulfilled result.
- No compatibility aliases, queue, publication fence or synthetic
  `history-retired` result.

Verification evidence:

- `pnpm --filter plitejs test:partition:history`: 150 passed.
- `pnpm --filter plitejs test:partition:react`: 1,308 passed.
- `pnpm --filter plitejs test:partition:yjs`: 274 passed.
- `pnpm --filter plitejs typecheck`: 13 tasks passed.
- Focused Plate Comments and combobox partitions: 54 and 52 passed;
  `pnpm --filter platejs typecheck`: 88 tasks passed.
- `pnpm --filter www typecheck`: API reference, docs source, generated
  registry, registry source, route types and both TypeScript projects passed.
- Chromium `tests/browser/comment.spec.ts`: 35 passed, 2 intentional visual
  baselines skipped. The fully deleted comment history cycle also passed five
  consecutive isolated repetitions.
- Registry generation, Plate Next v234 validation, changelog generation and
  the stale-source audit passed.

Rows 1-15 of the accepted design reconcile to source, tests, docs and release
artifacts. The execution retains the accepted limits: product refusal copy and
a public blocked-head recovery action remain separate decisions, and no
physical IME claim is added.

Next action: none. The implementation outcome is recorded in
`../research/review-records/2026-09-23-history-replay-lifecycle-implementation.json`.
