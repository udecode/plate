# Research Synthesis: Perfect @slate/yjs collaboration API, DX, correctness, offline/reconnect, undo/redo, awareness, selection, examples, and test coverage; route each accepted gap to slate-patch, slate-plan, slate-ar-gate, slate-ar-perf, or slate-ar.

## Project Essence
`@slate/yjs` is the first-party Slate v2 Yjs binding. The current package is no longer a stub: it has core/internal/react entrypoints, a real controller, operation-family contract tests, browser proof, and a collaboration benchmark. The right next work is not "add basic coverage." That claim is stale.

The best target is a release-quality collaboration surface: provider lifecycle that is obvious, cursor rendering that an app can ship without reverse-engineering awareness ranges, operation encoding that fails loudly when Slate grows, and proof gates that make offline/reconnect/undo/redo/awareness/selection regressions hard to sneak through.

## High-Impact Findings
- Provider lifecycle is too implicit for public DX. `createYjsExtension` accepts a `Y.Doc` and awareness-like object, while `tx.yjs.connect()` and `disconnect()` only flip local package state. Lexical's provider type names `connect`, `disconnect`, `sync`, `status`, and `reload`; `@slate/yjs` needs an intentional public shape before users build their own half-correct lifecycle wrappers. Route: `slate-plan`.
- Remote cursor rendering is underpowered. Current React exports are useful state hooks, but apps still need to build decoration, caret, range rendering, overlay positioning, local-user filtering, and blur cleanup. Older `slate-yjs` and `y-prosemirror` both provide first-party cursor rendering/decorator surfaces. Route: `slate-plan`.
- Operation encoding should be future-proofed. `applySlateOperationToYjs` covers the current Slate operation union, but there is no explicit exhaustive guard. If Slate adds an operation, TypeScript can let this function fall off the switch unless compiler settings catch it. Route: `slate-patch`.
- Proof exists but is scattered. Package tests and the Yjs browser suite cover the important behavior families, yet there is no single named release gate for "Yjs collaboration is safe." Route: `slate-ar-gate`.
- A collaboration benchmark exists, but this quality pass did not find a current perf failure, threshold miss, or measured regression. Route: reject `slate-ar-perf` for this round.

## Quality-Gap Translation
- Accepted gaps should become downstream lane inputs, not direct edits from this research pass.
- Reject generic "missing operation coverage" claims because the package tests already cover each current operation family.
- Reject immediate UndoManager-private-stack churn because the private access is isolated, version-pinned, and contract-tested.
- Reject perf routing until a measured Yjs collaboration regression is named.

## Confidence And Gaps
- Confidence is high for the current package/test/example shape because it comes from live local source inspection.
- Confidence is medium for comparison repos because they are local snapshots and may not represent latest upstream, but they are enough to show common collaboration DX surfaces.
- Known unknown: the exact provider API should be designed in `slate-plan`, not guessed inside this quality-gap pass.
- Known unknown: the release gate command should be tuned in `slate-ar-gate` after measuring runtime and flake risk.
