## Findings

### 1. [critical] The Comments fix guards only `publish`, but `setThread` runs three unguarded listener fan-outs before it
**Location**: Layer table, Comments row; Steps 1 (third test) and 4.
**Finding**: This round-1 critical finding is not removed for its class. If anything throws after `threads.delete(id)` in `setThread`, the error still lands in `replayCreation`'s catch (`BaseCommentsPlugin.ts:902-910`). The replay reports `blocked comments-mutation-failed` even though the thread is gone, B stays at the head, and every retry returns `comments-thread-changed` (`829-841`).
**Evidence**: `setThread` (`666-724`) runs these calls before `publish` at 720:
- `annotations.refresh` → `changeListeners.forEach` with no try/catch (`annotations/store.ts:307`) → Comments' `observeView` subscriber → `refreshers` and `listeners`.
- `setActive` (718) → `store.set` → Comments' own active-id subscriber (`582-588`) → `refreshIds` → `refreshers` (`489-499`).

`setActive` runs whenever the undone thread is active, which is the usual state right after creating it. The planned test throws only from a `subscribeThreads` listener, so it passes with this hole still open.
**Suggestion**: Put the boundary where the whole fan-out starts. Once `setThread` has written `threads` and `anchors`, report any later throw and return `applied`. Add a case where an annotation-change listener or an active-id subscriber throws.

### 2. [warning] The error rule for synchronous owners contradicts the Replay failure default
**Location**: Public API ("An error found inside the call still throws"); Defaults rows Replay failure and Synchronous owner result; Layer row "One error owner".
**Finding**: When an owner is synchronous, its throw and a settle failure both happen inside the call. The plan says such errors throw, and also that a throwing owner "settles failed". If they throw:
- the claim has to be cleared, and the entry dropped, on a throw path;
- the mounted dispatcher's catch sends them to `reportError` (`editable-dom-runtime.ts:1129-1147`), which bypasses `lifecycleErrorSink`, so there are two error owners;
- a caller has to know whether the owner is synchronous to choose between try/catch and the sink (invariant 2).

No step or test covers a synchronous owner that throws; every harness owner runs `await gate.promise`.
**Suggestion**: Make owner and settle failures always produce `failed` plus one `history` report, whether the owner is sync or async. Keep throwing only for History's own preconditions, such as a replay inside a transaction. Add a synchronous-owner case to test 2.

### 3. [warning] `failed` hides whether the effect happened, the drop narrows AC5 without saying so, and no test pins the drop
**Location**: Defaults row Replay failure; Steps 1 and 3.
**Evidence**:
- "Owner threw, keep the entry" and "owner applied, settle failed, drop the entry" both return `{status:'failed'}`. In the second case Comments has already deleted the thread on the server (`setThread` at 809), yet the caller can't tell this apart from a failure that changed nothing. That breaks invariant 2.
- Dropping the entry means a thrown replay consumes its entry. AC5 forbids this word for word ("rejected, stale, thrown, or concurrent replay does not consume the history entry"). The plan still claims it keeps the TaskHub-22 laws and logs no deviation.
- Test 1's after-fix form also passes if Build keeps the entry. Only `history-branch-contract.spec.ts:455-466` pins the keep half.

**Suggestion**: Put the distinction in the result, for example `failed` with `applied: true`. Log the AC5 narrowing as a deviation. Make test 1 assert that the next undo reaches A without calling B's owner again.

### 4. [warning] The plan doesn't say where the claim version is recorded, and the planned test misses the observer case
**Location**: Layer row for the receipt; Steps 3 and 5.
**Evidence**: Observers run after the transaction depth is decremented (`public-state.ts:9488` → `9574`), and nothing stops an observer from calling `editor.update` (`scheduleAfterCommitNotification` only queues, `959-972`). Suppose History reads `lastCommit()` after the claim's `editor.update` returns. Then a commit published by a claim observer is recorded as the claim, which is round-1 sol finding 3. The planned test publishes "between the claim and the return". An update published by the owner satisfies that wording without catching this case.
**Suggestion**: Record `commit.version` in the claim branch of the commit handler (`history-plugin.ts:604-611`), the same way the settlement branch already does (`623-628`). Have the test publish from a `pending()` subscriber during the claim commit.

### 5. [warning] Comments' lifecycle report has no error variant, and its fallback is console-only
**Location**: Layer table, Comments row; Step 2, which adds only a `history` variant.
**Evidence**:
- `EditorLifecycleError` (`interfaces/editor.ts:2561-2596`) has no Comments member. The plugin variant's `phase` is a closed list with no subscriber phase.
- So Build has to add a public member the plan doesn't list, plus its docs. The `lifecycleErrorSink` JSDoc at 1900 also needs updating, since it talks only about observers that run after state is published.
- Today a subscriber that throws during any Comments mutation rejects the caller's promise (enqueue, `726-747`). With this change and no sink, it becomes a `console.error` line, which is the visibility drop round-1 opus finding 1 objected to.

**Suggestion**: Name the variant in Step 2. Make the `reportError` fallback apply to every variant in `reportEditorLifecycleError` instead of a branch for `history` only.

### 6. [nit] Step 6's grep gate runs before Step 8 migrates the files it scans
These files match the pattern:
- `content/docs/(guides)/history.mdx` (`await editor.api.history.undo()`);
- the `docs/plite` pages;
- the generated `apps/www/public/r/{history-docs,api-react-hooks-docs,registry-docs,registry}.json`.

The gate can't pass until Step 8 runs, and Step 8 doesn't run `pnpm --filter www build:registry`, so the JSON files keep matching even after it. Move the grep after the docs step and add `build:registry` to that step.

### 7. [nit] The 2026-09-23 record's second requirement goes unanswered
`2026-09-23-history-async-replay-api.json:14` also asks to "avoid conditional timing". The new contract finishes document and synchronous-owner replays inside the call and session replays later. The Evidence section answers only the "statically honest" requirement. It should say that the `pending` discriminant puts the timing in the type and that mounted callbacks stay uniform.

### 8. [nit] Nothing proves the `reportError` fallback
Step 2's proof is a typecheck, and the new test sets a sink. Migrate `editable-dom-runtime-contract.test.tsx:215-245` instead of deleting it, and keep it with no sink set so it proves the fallback fires once. Its `onHistoryReplay`-not-called assertion has to flip, because `failed` now reaches that callback.

Not run because they write: a Bun Comments creation undo with a throwing annotation listener or active-id subscriber; `tsc` on a new lifecycle variant; a mounted run where a claim subscriber publishes.
