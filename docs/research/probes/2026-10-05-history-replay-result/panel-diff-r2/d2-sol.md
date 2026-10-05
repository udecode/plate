## Findings

### 1. [warning] A non-callable `then` delays a synchronous result
**Location**: `packages/plitejs/src/history/history-plugin.ts:1026` at `59e7c44b`.

**Finding**: Property presence does not establish that an owner result is asynchronous. A valid synchronous result with `then: undefined` now returns `pending` and delays settlement.

**Evidence**: A read-only `node -e` check loaded the frozen editor source and returned `{ status: 'applied', value: transition, then: undefined }` from the owner. `undo()` returned `pending`, with one undo entry and no redo entry. Only after awaiting `settled` did the entry move to redo. The public result type permits this structurally valid object. `Promise.resolve` treats its non-callable `then` as synchronous data, but the branch has already deferred settlement.

**Suggestion**: Detect a callable `then` rather than merely its presence.

### 2. [warning] The failure handler still reports the same settlement error twice
**Location**: `packages/plitejs/src/history/history-plugin.ts:967–975` and `987–988` at `59e7c44b`.

**Finding**: Clearing before reporting fixes the stale-claim observation. It does not remove round 1’s duplicate-report path. When blocked settlement throws, `fail` retries that same settlement and can report the identical error twice. The disposition’s assertion that the second error is distinct does not hold.

**Evidence**: A read-only check used the frozen editor with a supported `maxDepth` getter. After the owner returned `blocked`, the getter threw one retained `Error` object. Settlement failed at line 988; `fail` retried at line 970. The sink received two reports whose `cause` values were reference-identical, and `undo()` returned `failed`.

**Suggestion**: Avoid retrying a blocked settlement that already failed, or otherwise prevent duplicate reporting of that failure.

Not run because they write: history/React test partitions, package verification pipelines, and registry regeneration.
