A should be the base, with B's error sink and callback timing grafted on. C's two-phase owner contract is a separate follow-up and not needed to answer your ask. All three candidates converge on the plan's first cut, a synchronous `HistoryResult` with a `pending` variant carrying `settled`. They differ on three things: where the types live, who owns a failure, and how much Comments has to change.

| Criterion | A | B | C |
|---|---|---|---|
| 1. Laws | 3 | 3 | 3 |
| 2. Caller cost and timing honesty | 4 | 3 | 3 |
| 3. Interface depth and deletion | 3 | 3 | 2 |
| 4. Failure semantics | 3 | 4 | 2 |
| 5. Adoption and proof | 3 | 2 | 2 |
| **Total** | **16** | **15** | **12** |

**Why each score:**

- **1. Laws.**
  - A keeps the C/B/A order, `busy`, server-first comments and the lint. It marks requirement 3 as "kept, strengthened", which the source refutes (see answer 3, first bullet).
  - B states two changes openly: requirement 3 ("cannot guarantee no divergence after an external write succeeds and local settlement fails") and requirement 5. Both are confirmed in source.
  - C makes local settlement atomic. But `mutate` still persists to the server during preparation (`BaseCommentsPlugin.ts:760`), so a failed stage leaves the server and the local state different. Its "Kept locally" qualifier is honest about that.
- **2. Caller cost and timing honesty.**
  - All three let a handler call `undo()` bare and let a test assert `toEqual({status:'applied'})`. That works because the receipt is stored in a WeakMap (`public-state.ts:763`), not on the result object.
  - A returns a final result when the owner answers synchronously, so "owner unavailable" comes back `blocked` at once instead of `pending`. That makes the return value the most truthful of the three.
  - B and C add a `failed` status that callers must handle; B's README turns it into `showReloadRequired()`.
- **3. Interface depth and deletion.**
  - A moves the types to root, beside `EditorEffectHistoryReplayResult` (`interfaces/editor.ts:392`) and `EditorHistoryReplayReceipt` (`public-state.ts:722`). That deletes `ModelHistoryResult` and both `as unknown as` casts without a new dependency edge.
  - A also deletes the `version + 1|2` inference, the sync-path listeners and the dead branches in `replayNow`.
  - A loses a point for adding a second error reporter (answer 3, second bullet).
  - B and C both need a new `plitejs/react` → `plitejs/history` edge. Today react may depend only on `['root','dom','annotations']` (`entrypoint-dag.mjs`).
  - C adds the most surface: a `prepared/stage` protocol, a transactional field, a queue extension and a finalizer.
- **4. Failure semantics.**
  - B has one failure owner, History, which reports through the existing lifecycle sink. It contains a throw during settlement and labels uncertainty as `failed` instead of `blocked`.
  - A defines all five failure cases, but if settlement throws it reports `blocked` after Comments has already published the removal.
  - C reports replay failures only from the mounted dispatcher. A headless caller who ignores `settled` loses the error. C also leaves unspecified whether a document-path error throws or returns `failed`.
- **5. Adoption and proof.**
  - A names real call sites (`yjs-collaboration`, C22-ORDER, `discussion-proof`, the keyboard strategy). It notes that the existing `await undo()` tests on comment flows (`BaseCommentsPlugin.spec.ts:921-934`) will fail loudly, and its next step turns the four probe observations into tests that fail first on Bun.
  - B names no tests or docs and proposes a prototype first.
  - C ties the return-type change to the Comments storage migration, so it can't ship as an independently useful phase.

**1. Base: A.** It answers the ask with the smallest change.
- History keeps the claim, the four-case settlement table, `busy`, activation retirement and the receipt.
- The contract types live in root, the layer that already owns the effect replay types and the receipt. A future maintainer adds a status in one place, and react, history and Plate all see it with no new edge and no hand-copied union.
- The document path loses every piece of mounted machinery that existed only because of the `await`.

**2. Grafts and rejections.**

Graft from B:
- Report through `reportEditorLifecycleError` with a new `history-replay` phase, instead of A's new `reportEditorError`.
- Never label a settlement failure that happens after the owner already published as `blocked`. Use an honest status or reason, and clear `pending` outside the failed transaction.
- Deliver `onHistoryReplay` and `onFulfilled` asynchronously, as today, while still repairing selection synchronously. A fires them synchronously for document undo and asynchronously for pending, which is the sometimes-sync, sometimes-async callback A itself rejects for `undo({ onSettled })`.

Graft from C:
- One request-scoped finalizer that clears `pending` on any throw, including a throw while preparing the settlement.
- The usage rule that `pending()` is availability state, not a completion receipt, so tests await the specific `settled`.

Reject:
- **B's editor-wide fault barrier that requires a reload.** B also removes Comments' catch-all, so a network throw from `mutate` would block every later undo, including plain document undo, until reload. That is a common path with a severe outcome, and B's own open question admits the classification is unresolved.
- **B's and C's react → history edge.** Root already owns these types.
- **B's always-async settlement for an owner that answers synchronously.** It reports `pending` for an outcome already known when the call returns.
- **C's dispatcher-only error reporting.** It leaves headless callers with no error owner.
- **C's transactional Comments field inside this change.** See answer 4.

**3. Claims the source contradicts.**
- **A, requirement 3 "kept, strengthened".** Comments' `setThread` runs inside `commitMutation` (`BaseCommentsPlugin.ts:808`) before History's applied settlement (`history-plugin.ts:1015-1027`). If settlement throws, A writes `blocked` even though the thread is already removed locally and on the server. The entry stays at the head and every later undo blocks with `comments-thread-changed`. The state has forked and is mislabelled.
- **A, open question "Should Plite get an editor-level `onError`?"** One already exists: `createEditor({ lifecycleErrorSink })` (`create-editor.ts:703`) feeding `reportEditorLifecycleError` (`core/lifecycle-error.ts`). A's `reportEditorError`, which calls `globalThis.reportError` or rethrows in a microtask, would be a second way to do one task.
- **A, "owner unavailable … returns blocked without publishing pending at all".** A's own flow commits the claim before calling the owner, as `replayNow` does today (`history-plugin.ts` ~963-983, claim commit then owner call), and its tradeoff list admits "two commits for an owner that returns synchronously". So `pending` is published and then cleared within the call.
- **A, "no listener" on the synchronous path (a gap, not a contradiction).** Today the focusin and pointerdown listeners are armed during the synchronous call (`editable-dom-runtime.ts:1057-1062`). A `focus()` from a commit subscriber during the undo update is caught now and would no longer be. Nobody has proved this case is absent; it needs one Chromium case before the listeners are deleted.
- **B's and C's other load-bearing claims check out.** They are right that the graph forbids react → history today, and the probe log confirms synchronous document apply, `pending` published before return, `busy`, and 1 unhandled rejection. C's `getField`/`setField` exist on the transaction (`interfaces/editor.ts:1551`, `1620`).

**4. C's two-phase owner contract is a separate follow-up.** Your ask is about the `void`/`await` cost and whether an async return endangers synchronous expectations. Only the return channel and the failure owner answer that.

The defect C targets, Comments publishing before History settles, exists today whatever the return type is. Real use rarely reaches it:
- Commit-listener errors go to the lifecycle sink and are not thrown out of `editor.update`. So the settlement commit throws only on a clone, guard or validation defect after `mutate` has already succeeded.
- The outcome is recoverable. Comments re-checks `sameThread` before calling `mutate` (`BaseCommentsPlugin.ts` ~829-833), so a retry can't persist twice. It blocks instead.

C's fix is also expensive and incomplete:
- It rewrites Comments' storage into a state field.
- It makes Comments' per-thread queue wait on History's commit, which couples the two owners' locking and is unproven when History retires mid-replay.
- It still leaves the server and local state different when staging fails.

The honest label from answer 2 plus clearing `pending` is enough for this change. The two-phase staging belongs to Comments as follow-up work with its own owner.

I wrote no files.