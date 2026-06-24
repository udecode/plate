# Research Synthesis: Perfect @slate/yjs collaboration API, DX, correctness, offline/reconnect, undo/redo, awareness, selection, examples, and test coverage; route each accepted gap to slate-patch, slate-plan, slate-ar-gate, or slate-ar-perf.

## Project Essence

`@slate/yjs` is a first-party Slate v2 extension that binds editor commits to a Y.XmlElement root. It exports local Slate operations into Yjs transactions, imports remote Yjs changes back into Slate with history skipped, publishes awareness selections as Yjs relative positions, and routes undo/redo through a local Y.UndoManager.

The current package is not a scaffold. It has operation-family contract tests and a four-peer browser example with heavy offline/reconnect coverage. The sharp gaps are API/DX and proof policy, not basic collaboration existence.

## High-Impact Findings

### Strong Current Coverage

- Current Slate operation families are represented in `applySlateOperationToYjs(...)`: text insert/remove, node insert/remove/split/merge/move/set, replace children, replace fragment, and selection skip.
- The package test matrix covers operation families plus awareness, selection, package config, and Yjs UndoManager private-stack guard tests.
- The browser example has 40 tests, including keyboard history, toolbar history, stale undo, reconnect, offline structural conflicts, multi-peer convergence, layout synchronization, and selection deletion.
- Previous hard bugs were already converted into proof: split/merge history, same-parent move, no-op replace_fragment, wrapped/fragment stale paths, cursor publishing after keyboard undo, and concurrent text preservation.

### Accepted Gaps

1. Provider lifecycle is too implicit.
   Evidence: `YjsExtensionOptions` accepts `doc` and `awareness`, while `tx.yjs.connect()` / `disconnect()` only flip local state. Lexical exposes a provider-shaped contract with connect/disconnect and sync/status/update/reload events.
   Impact: app authors must hand-wire provider status, reconnect, and awareness ownership outside the package. The demo does that manually, which is fine for a fixture and weak for a public package.
   Route: `slate-plan`.

2. Remote cursor rendering is underpowered.
   Evidence: `@slate/yjs/react` exposes cursor range hooks only. y-prosemirror ships cursor rendering builders and old slate-yjs exposes decoration helpers.
   Impact: every app has to rediscover range-to-decoration rendering, caret direction, field naming, local-user filtering, and blur cleanup. That is bad DX and a good way to ship subtly broken awareness.
   Route: `slate-plan`.

3. Collaboration proof lacks a named release gate.
   Evidence: the browser suite is rich, but the accepted proof shape is encoded as many individual tests, not as a documented release-quality gate that says which package tests, typecheck, and focused browser grep must pass before claims land.
   Impact: future work can pass package tests while skipping keyboard/selection/offline browser proof. That is where most nasty bugs live.
   Route: `slate-ar-gate`.

4. Operation encoder exhaustiveness is not explicit enough.
   Evidence: the encoder covers the current union, but there is no visible compile-time `never` assertion or route table that fails loudly when Slate adds an operation type.
   Impact: future operation additions can become an accidental no-op or unreviewed fallback path. This is a correctness guard gap, not a known user bug.
   Route: `slate-patch`.

## Quality-Gap Translation

The accepted routes are recorded in `quality-gaps.md`: `slate-plan` owns provider lifecycle API and React cursor rendering API; `slate-ar-gate` owns the named release proof bundle; `slate-patch` owns the operation encoder exhaustiveness guard. No `slate-ar-perf` route is accepted in this round because no perf metric or trace implicated Yjs collaboration.

## Confidence And Gaps

Confidence is high for the API/DX and gate findings because live source and local comparative repos back them. Confidence is medium for the exact provider lifecycle API shape; provider ecosystems differ, so that belongs in planning before implementation. Basic operation coverage is rejected as a current gap, UndoManager private-stack use is rejected as an immediate patch by itself, and performance is rejected because this round produced no metric evidence.
