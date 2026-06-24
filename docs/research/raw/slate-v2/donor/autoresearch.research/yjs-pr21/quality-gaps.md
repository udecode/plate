# Quality Gaps: Perfect @slate/yjs collaboration API, DX, correctness, offline/reconnect, undo/redo, awareness, selection, examples, and test coverage; route each accepted gap to slate-patch, slate-plan, slate-ar-gate, slate-ar-perf, or slate-ar.

- [x] Project essence is accurate and source-backed.
- [x] Sources are logged with dates, claims, and confidence.
- [x] Synthesis separates high-impact changes from small QoL fixes.
- [x] Each high-impact recommendation is routed or rejected with evidence.
- [x] Correctness checks are scoped for this research-only pass.
- [x] Final handoff includes dashboard or state evidence.

## Accepted Routed Gaps

| Gap | Route | Evidence | Validation |
| --- | --- | --- | --- |
| Provider lifecycle and connection semantics are too implicit for public DX. | `slate-plan` | `YjsExtensionOptions` accepts caller-owned `doc` and awareness; `tx.yjs.connect()` / `disconnect()` only flip local state. Lexical's Yjs provider contract names `connect`, `disconnect`, `sync`, `status`, and `reload`. | Plan the public provider/lifecycle shape: ownership, status/sync/reload semantics, cleanup, reconnect, docs, and migration-free example usage. |
| Remote cursor rendering is underpowered. | `slate-plan` | Current `@slate/yjs/react` exposes `useYjsRemoteCursor(s)` and awareness revision. Older `slate-yjs` ships decoration/overlay hooks; `y-prosemirror` ships a cursor plugin with builders, filtering, focus cleanup, and selection decorations. | Plan first-party React cursor decoration/rendering APIs with tests for caret, range, user data, local-user filtering, stale/blur cleanup, custom field names, and virtual moved-node identity. |
| Operation encoder exhaustiveness is not explicit. | `slate-patch` | `Operation` has a closed current union, and `applySlateOperationToYjs` handles current cases but has no visible exhaustive `never` guard. Future Slate operation kinds could silently escape the switch if compiler settings miss them. | Add failing-first contract coverage, then an exhaustive guard that fails when Slate adds an operation without a Yjs decision. |
| Collaboration proof lacks a named release gate. | `slate-ar-gate` | Package contracts and the Yjs browser suite cover reconnect, undo/redo, awareness, selection, stale undo, and operation families, but the route is not captured as one release-quality gate. | Define and run a focused gate bundle: `bun test ./packages/slate-yjs/test`, `bun --filter @slate/yjs typecheck`, and focused Playwright Yjs collaboration greps for reconnect, undo/redo, awareness, selection, and stale undo. |

## Rejected Candidates

| Candidate | Decision | Evidence |
| --- | --- | --- |
| Basic operation/test coverage is missing. | rejected | Current package contracts cover every current operation family plus awareness, selection, reconnect, undo/redo, and fallback traces. |
| Immediate UndoManager private-stack rewrite. | rejected for this round | Private stack usage is isolated in `undo-manager-adapter`, pinned to Yjs 13.6.30, and covered by contract tests. |
| `slate-ar-perf` route. | rejected for this round | A Yjs collaboration benchmark exists, but this pass found no measured perf regression or threshold miss. Route to perf only after a concrete metric gap appears. |
