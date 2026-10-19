## Findings

### 1. [critical] Foreign Promises bypass pending replay

**Location**: `packages/plitejs/src/history/history-plugin.ts:1026`

**Finding**: `instanceof Promise` misclassifies a Promise returned from another realm, such as an iframe, as a synchronous owner result. This can consume a refused entry and leave an owner rejection unobserved.

**Evidence**: The public effect contract accepts `Promise<EditorEffectHistoryReplayResult>` without restricting its realm. A read-only VM check confirmed that a foreign native Promise fails this check.

That Promise then enters `settle` with both `status` and `value` undefined. The blocked check at line 987 fails, and lines 992–1003 emit an undefined effect value and request an applied settlement. With the permitted default identity inverter, settlement consumes the claimed entry and creates a redo entry containing undefined, before the external owner finishes. Its eventual blocked result is ignored. Its rejection has no attached handler and never reaches the lifecycle sink. HEAD’s `await sessionHistory.replay(...)` assimilates this Promise correctly.

**Suggestion**: Identify synchronous outcomes through their discriminant. Normalize the asynchronous branch with `Promise.resolve(ownerResult)` before attaching settlement handlers.

### 2. [warning] Registry docs and the history subject retain the old contract

**Location**: `apps/www/public/r/history-docs.json:9`; `apps/www/public/r/api-react-hooks-docs.json:9`; `docs/plans/topics/history.md:9`

**Finding**: The planned documentation migration remains incomplete in the frozen commit. These owners still teach always-Promise undo and rejection-based error handling.

**Evidence**: The generated history guide still declares `undo(): Promise<HistoryResult>`, demonstrates `await editor.api.history.undo()`, and says other failures reject. The generated React hooks page repeats the awaited-completion example and rejected-Promise reporting. Both old examples also remain in `registry-docs.json` and `registry.json`.

The subject states that every batch returns a Promise, retains the old awaited example at line 15, and describes dispatcher rejection reporting at line 74. Following these instructions now returns `pending` without waiting for comment persistence.

**Suggestion**: Regenerate the registry docs and update the subject’s API and runtime descriptions before closing the migration.

Checks not run because they write: `pnpm --filter plitejs test:partition:history`, `pnpm --filter plitejs test:partition:react`, and `pnpm --filter www build:registry`.
