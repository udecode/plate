## Findings

### 1. [warning] A non-native owner Promise is treated as a synchronous `applied` result
**Location**: `packages/plitejs/src/history/history-plugin.ts:1026`
**Finding**: `if (!(ownerResult instanceof Promise)) return settle(ownerResult);` decides whether an owner answered synchronously by checking `instanceof` against the global `Promise`. HEAD used `await`, which accepts any thenable. When an owner's Promise comes from another realm, or `globalThis.Promise` has been replaced (core-js forced polyfill, zone.js), a native `async` owner's result is no longer `instanceof Promise`. It then goes to `settle()` as if it were a plain result.
**Evidence**: Here is what happens to Comments, the one production owner, which is an `async` function (`BaseCommentsPlugin.ts:816`):
- `ownerResult.status` is `undefined`, so `settle` skips the `blocked` branch.
- `createEditorEffect(type, undefined)` runs, and so does the applied settlement update.
- `settlePendingHistoryReplay` calls `invertEffect`. Comments' `invert` destructures `{ previous, value }` from `undefined` and throws.
- `fail` then reports a misleading TypeError and settles `failed`.

Meanwhile the real Promise keeps running unobserved: the server-side thread removal finishes, and any rejection becomes an unhandled rejection. The entry stays at the head while the external state has moved, so every later undo is blocked. That breaks TaskHub-22's server-first and never-skip guarantees, and invariant 3 (no unobserved error). If an effect's `invert` tolerates `undefined`, the replay instead silently consumes the entry with an `undefined` value. It is rare, but the outcome is silent state corruption.
**Suggestion**: Detect a thenable with `typeof (ownerResult as { then?: unknown }).then === 'function'`, or branch on `'status' in ownerResult` for the synchronous case. Wrap a thenable with `Promise.resolve(ownerResult).then(settle, fail)`.

### 2. [nit] The new synchronous-owner branches are not pinned by any test
**Location**: `history-plugin.ts:1021-1025`; `packages/plitejs/test/history/history-branch-contract.spec.ts`
**Finding**: Every owner that throws in the tests throws after `await gate.promise`, so they all take the rejection path (`then(settle, fail)`). Deleting the `try/catch` around the synchronous `sessionHistory.replay(...)` call would keep every test green. Yet that mutation lets a synchronous throw escape `undo()` after the claim. `pending()` would then stay set, and every later undo would return `busy` (invariant 2). The headless "synchronous owner settles in the call with the table's placement" default is only checked indirectly, through the mounted focus test at `editable-dom-runtime-contract.test.tsx:215`. Nothing asserts that `undo()` returns `{ status: 'applied' }` synchronously or that redo ends up holding the entry.
**Suggestion**: Add one headless test where a synchronous owner throws. Assert that `undo()` returns `{ status: 'failed' }` in the call, that `pending()` is `null`, and that the sink was called once.

### 3. [nit] `fail` reports before it clears `pending`, and a throwing blocked settlement is reported twice
**Location**: `history-plugin.ts:967-977`, `985-990`, `1014-1016`
**Finding**:
- `report(cause)` runs before `settleBlocked()`. A sink that retries undo, or reads `pending()`, sees the stale claim: the retry gets `busy` and the read sees a direction that is about to clear.
- In the blocked branch, `settleBlocked()` throws E1. The catch calls `fail(E1)`, which reports E1 and calls `settleBlocked()` again. That second call usually throws E2 for the same deterministic reason, and E2 is reported too. One replay produces two sink calls, which strains invariant 3.
**Suggestion**: Clear first, then report. Skip the retry when the update that failed was `settleBlocked` itself.

### 4. [nit] Gaps between the plan and the trail
**Location**: `.changeset/`, `docs/plans/2026-10-05-history-sync-replay-result.{md,decisions.tsv}`, `content/docs/(guides)/history.mdx`
**Finding**:
- **Changesets.** Plan step 7 calls for `plitejs` and `platejs` changesets. Only `plite-history-persistence.md` changed, even though Plate consumers get the new `HistoryPlugin` API type, and no deviation row explains the gap.
- **Risk 4.** It says the first new test "reads `pending()` through a subscriber". `history-branch-contract.spec.ts:498` reads `editor.read.history.pending()` directly.
- **Build trail.** At the frozen commit the plan still reads "planning: waiting on Build now", no step is ticked, and the log has no `build` rows. So step 1's "each fails on HEAD for its named defect, run on its own" has no recorded evidence. Tracing the code supports both tests failing on HEAD: an unhandled rejection, then `busy` after the next edit.
- **Docs.** The docs say failures go "to `reportError` when no sink is set". They leave out the `console.error` fallback that `lifecycle-error.ts` uses when `reportError` is missing (Node).

### What held
- **Invariant 1 (TaskHub-22).** Order and placement still go through the unchanged `settlePendingHistoryReplay`. Every failure after the claim goes through `fail`, which guards on `isCurrent() && pending.request === request`, then settles `blocked` and keeps the entry. Activation retirement, replacement or restore (phase `dropped`), and a detached redo behave the same as HEAD. Comments persistence is untouched.
- **Invariant 2.** `settle` wraps its whole body in `try`, and `fail` cannot throw unless something pathological happens. So `settled` never rejects, finding 1 aside.
- **Invariant 3.** Observer errors are caught by `runEditorObserver` (`public-state.ts:8669`), so a published settlement cannot throw out of `editor.update` and get mislabelled `failed`. A document batch's own throw reaches `dispatchHistory`'s `.catch` once. A session failure reports once in the plugin and arrives as `failed` with no rejection. The mounted test checks a single `reportError` call with no sink set.
- **Invariant 4.** The claim version is recorded in the claim branch of the commit handler (`history-plugin.ts:604-607`) and read before settlement. The test with a claim subscriber that publishes would fail if the version check were removed.
- **Invariant 5.** For document batches, `await Promise.resolve(replayed)` gives the same one-tick timing as HEAD. `run()` now sits inside the `try`, so the `focusin`/`pointerdown` guards are removed even when the call throws. HEAD leaked them in that case.
- **Invariant 6.** `git grep` over packages, apps, benchmarks, content and docs/plite finds no `await` or `void` on a history call except `settled` waiters, and no `.then` chained on a history call. No `.cn.mdx` twins exist for the two guide pages.
- **Invariant 7.** The types match the plan word for word and are exported from the plitejs root. `platejs/core` re-exports them through `export * from 'plitejs'`. Only `plitejs/history` loses `HistoryResult` and `HistoryApi`, which the plan states, and the repository has no remaining subpath imports of them.

Not run because they write: the Bun history and react partitions and `BaseCommentsPlugin.spec.ts`; the mutation run that deletes the synchronous `try/catch` (finding 2); and a probe that forces core-js's replacement `Promise` and replays a native `async` owner (finding 1).
