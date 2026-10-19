## Findings

### 1. [critical] Cross-realm promises bypass the replay owner
**Location**: `packages/plitejs/src/history/history-plugin.ts:1026`

**Finding**: `instanceof Promise` misclassifies promises created in another window, iframe or JavaScript realm as synchronous outcomes. History can consume a refused entry before its owner finishes.

**Evidence**: A read-only `node:vm` probe confirmed that a foreign Promise resolving to `{ status: 'blocked', reason: 'refused' }` fails this check. The code passes that Promise to `settle`, where `ownerResult.status` and `.value` are undefined. It therefore bypasses the blocked branch at line 987 and attempts applied settlement with an undefined payload at lines 992–1003. An effect using the default identity inverter can consume the entry and return `applied`. No rejection handler attaches to the foreign Promise, so a later rejection also escapes error reporting. HEAD’s `await sessionHistory.replay(...)` assimilated these promises correctly.

**Suggestion**: Recognize asynchronous results across realms and assimilate them through `Promise.resolve(...)`, while retaining immediate settlement for synchronous outcomes.

### 2. [warning] The moved type violates Plate’s entrypoint graph
**Location**: `packages/platejs/src/history/plite-history.internal.ts:1`

**Finding**: The new `HistoryApi` re-export from `plitejs` introduces a forbidden dependency and fails the entrypoint lint rule.

**Evidence**: `tooling/entrypoints/entrypoint-dag.mjs:363` permits `platejs/history` to import only `plitejs/history`. The rule checks type-only exports too. Invoking the frozen rule in memory against this export produced:

```text
forbiddenEntrypointImport
from: platejs/history
to: plitejs
allowed: plitejs/history
```

The existing `plitejs/history` export passed the same check as a control.

**Suggestion**: Import `HistoryApi` through the core facade in `HistoryPlugin.ts`, and remove it from the history bridge. This avoids widening the history entrypoint’s dependencies.

### 3. [warning] The documentation migration leaves the old contract published
**Location**: `apps/www/public/r/history-docs.json:9`; `docs/plans/topics/history.md:9`

**Finding**: Generated documentation and the required subject page still teach the always-Promise API.

**Evidence**: At the frozen commit, `history-docs.json` still contains `await editor.api.history.undo()`, signatures returning `Promise<HistoryResult>`, and “Other failures reject.” `api-react-hooks-docs.json`, `registry-docs.json` and `registry.json` also retain old history guidance. The subject page explicitly says every batch returns a Promise and that bare calls violate floating-promise lint.

Consumers following these examples receive `pending` before external replay completes, contrary to the documented completion semantics. The approved plan explicitly requires registry regeneration and subject-page migration.

**Suggestion**: Regenerate the registry artifacts and update the subject’s API and dispatcher descriptions.

Not run because they may write: `pnpm --filter plitejs test:partition:history`, `pnpm --filter plitejs test:partition:react`, and `pnpm --filter www build:registry`.
