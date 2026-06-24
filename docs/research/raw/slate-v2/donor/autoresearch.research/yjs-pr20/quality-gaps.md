# Quality Gaps: Perfect @slate/yjs collaboration API, DX, correctness, offline/reconnect, undo/redo, awareness, selection, examples, and test coverage; route each accepted gap to slate-patch, slate-plan, slate-ar-gate, or slate-ar-perf.

- [x] Project essence is accurate and source-backed.
- [x] Sources are logged with dates, claims, and confidence.
- [x] Synthesis separates high-impact changes from small QoL fixes.
- [x] Each high-impact recommendation is routed or rejected with evidence.
- [x] Correctness checks are scoped for this research-only pass.
- [x] Final handoff includes state evidence.

## Accepted Routed Gaps

| Gap | Route | Evidence | Validation |
| --- | --- | --- | --- |
| Provider lifecycle is too implicit. | `slate-plan` | `YjsExtensionOptions` takes `doc`/`awareness`; `connect`/`disconnect` are local flags; Lexical has provider lifecycle events. | Public API plan covering provider shape, status/sync/reload semantics, cleanup, and migration-free docs. |
| Remote cursor rendering is underpowered. | `slate-plan` | React package exposes range hooks only; y-prosemirror and old slate-yjs ship render/decorate helpers. | Plan a first-party React cursor decoration/rendering API with tests for caret, range, data, local-user filtering, blur cleanup, and field names. |
| Collaboration proof lacks a named release gate. | `slate-ar-gate` | Browser suite has the needed oracles but no single release gate definition. | Gate command bundle: `bun test ./packages/slate-yjs/test`, `bun --filter @slate/yjs typecheck`, and focused Playwright Yjs collaboration greps for reconnect, undo/redo, awareness, and selection. |
| Operation encoder exhaustiveness is not explicit enough. | `slate-patch` | `applySlateOperationToYjs` covers the current union but has no visible `never` assertion or operation coverage table. | Add failing-first contract, then an exhaustive guard that fails when Slate adds an operation without a Yjs decision. |

## Rejected Candidates

| Candidate | Decision | Evidence |
| --- | --- | --- |
| Basic operation coverage is missing. | rejected | Current package tests cover each current operation family. |
| UndoManager private-stack use needs an immediate patch. | rejected for this round | The dependency is isolated, version-pinned, and covered by contract tests. |
| Performance route. | rejected for this round | No Yjs collaboration perf metric was measured or implicated. |
