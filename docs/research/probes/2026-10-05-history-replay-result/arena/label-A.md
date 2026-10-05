# Candidate: synchronous replay result, History owns failure

## 1. Problem

`undo()` returns a Promise even though the operation is synchronous in every case but one. That costs 366 call sites a `void` or an `await`. The `void` hides the one real rejection, an owner throw (the probe saw 1 of 1 go unhandled). It also teaches `void undo(); readState()`, which assumes the replay already finished; that is wrong in exactly one case, comment-creation undo. The owner is right that this is dangerous. The danger comes from the return type, though, not from async replay existing. History already decides the async case synchronously: it claims the entry and publishes `pending()` before its first `await`.

- **Kept:** requirements 1–4, 6 and 8.
- **Changed:** requirement 5's doc sentence. "One complete editor update" is already false for a session batch.
- **Owner moved:** requirement 7. History, not the mounted runtime, owns failures thrown by a replay owner.
- **Async lifecycle kept.** Optimistic removal in Comments would move the same settlement table into Comments as rollback logic, and it breaks AC7.

## 2. Usage (caller's view)

```ts
const result = editor.api.history.undo();
// A document batch has finished here, like any editor.update.
// A batch whose effect waits on an external owner (comment creation)
// claims its entry now and finishes later.
if (result.status === "pending") {
  const outcome = await result.settled; // applied | blocked; never rejects
}
```

If a replay owner throws, History reports the error once through `reportError` and the replay settles `{ status: "blocked", reason: "history-replay-failed" }`. Controls keep reading `editor.read.history.pending()`.

```ts
// yjs-collaboration.tsx, event handler
const undo = () => {
  editor.api.history.undo();
  syncPeerHistoryDepths(peer, editor);
};
```

```ts
// history-plugin.spec.ts, document undo
editor.update((tx) => tx.text.insert("A"));
expect(editor.api.history.undo()).toEqual({ status: "applied" });
expect(readText(editor)).toBe("");
```

```ts
// BaseCommentsPlugin.spec.ts, C22-ORDER
const result = editor.api.history.undo();
assert(result.status === "pending");
expect(editor.read.history.pending()).toBe("undo");
expect(editor.api.history.undo()).toEqual({ status: "busy" });
mutate.resolveNext({ status: "commit", thread: null });
expect(await result.settled).toEqual({ status: "applied" });
```

```tsx
// discussion-proof route: the app observes mounted outcomes
<EditorContent onHistoryReplay={({ result }) => {
  if (result.status === "blocked") showRefusal(result);
}} />
```

```ts
// keyboard-input-strategy.ts, Cmd+Z: unchanged; useEditorHistory's undo stays void
runtime.dispatchHistory(direction);
```

## 3. Shape

```ts
// packages/plitejs/src/interfaces/editor.ts (root: history, react and Plate all speak it)
export type HistoryDirection = 'redo' | 'undo';

/** A replay that has finished. */
export type HistoryOutcome =
  | Readonly<{ status: 'applied' }>
  | Readonly<{ status: 'empty' }>                                  // no entry
  | Readonly<{ status: 'busy' }>                                   // another replay pending; nothing claimed
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>  // authored conflict, document batch
  | Readonly<{ reason: string; status: 'blocked' }>;               // owner refused; entry stays head

/** A claim already found its entry, so it settles only applied or reason-blocked. */
export type HistorySettlement = Extract<HistoryOutcome, { status: 'applied' } | { reason: string }>;

export type HistoryResult =
  | HistoryOutcome
  | Readonly<{
      /** Never rejects. Owner failure is reported once and settles `history-replay-failed`. */
      settled: Promise<HistorySettlement>;
      status: 'pending';
    }>;

export type HistoryApi = {
  /** Replay the redo head. A document batch applies in this call as one update. A batch held
   * by an async replay owner claims its entry and publishes `pending()` in this call, then
   * settles in a later update. */
  redo: () => HistoryResult;
  undo: () => HistoryResult;
};

/** Effect owner, signature unchanged. Return synchronously when the outcome is known;
 * return a Promise only while an external owner decides; throw only for defects. */
type EditorEffectHistoryReplay<TValue> = (editor: Editor, value: TValue) =>
  | EditorEffectHistoryReplayResult<TValue>
  | Promise<EditorEffectHistoryReplayResult<TValue>>;

// packages/plitejs/src/core/public-state.ts (root internal)
/** History service for this exact editor identity, or null when not installed. */
export const getEditorHistoryApi = (editor: Editor): HistoryApi | null => { throw new Error('not implemented'); };
/** The single report path for uncaught editor failures: reportError, else a microtask rethrow. */
export const reportEditorError = (error: unknown): void => { throw new Error('not implemented'); };

// packages/plitejs/src/history/history-plugin.ts
const replay = (direction: HistoryDirection): HistoryResult => {
  // TODO: throw inside a transaction; busy if claimed; empty if no head.
  // Document batch: applyReplay (unchanged, one update).
  // Session batch: claim commit, then call the owner synchronously:
  //   thenable    -> { status: 'pending', settled: settleClaim(claim, promise) }
  //   sync result -> settle in this call; never pending
  //   sync throw  -> reportEditorError, blocked settlement in this call
  throw new Error('not implemented');
};
/** Total: always clears pending, never rejects. */
const settleClaim = async (claim: HistoryReplayClaim, owner: Promise<EditorEffectHistoryReplayResult>): Promise<HistorySettlement> => {
  // TODO: owner throw -> report, blocked settlement. Retired activation -> owner outcome, no write.
  // Applied -> clone + historic update + applied settlement; if that throws, report, then blocked settlement.
  throw new Error('not implemented');
};

// packages/plitejs/src/react/editable/editable-dom-runtime.ts
export type EditableHistoryReplayResult =
  | HistoryOutcome
  | Readonly<{ reason: 'composing' | 'not-installed' | 'unmounted'; status: 'unavailable' }>;

dispatchHistory(direction: HistoryDirection, focusPolicy?: EditorHistoryFocusPolicy,
  onSettled?: (result: EditableHistoryReplayResult) => void): void {
  // const result = this.replayHistory(direction, focusPolicy);          // sync
  // if (result.status !== 'pending') return this.finishHistory(result);  // repair + notify in this task
  // const claimVersion = this.lastCommitVersion(); const watch = this.watchPresentation(root);
  // result.settled.then((o) => this.finishHistory(o, { claimVersion, watch })).catch(reportEditorError);
}
```

**Data flow:**
- **Cmd+Z on text (the dominant path):** keydown → `dispatchHistory` → `settleInput` → `undo()` → one update → `applied` plus receipt → view selection and focus → `onHistoryReplay`. All of it runs in the keydown task, with no listener, no microtask and no version arithmetic.
- **Cmd+Z on comment B:**
  1. `undo()` makes the claim commit and calls the owner. Comments takes its queue slot synchronously. The owner returns a Promise, so `undo()` returns `pending`.
  2. The runtime arms its focusin/pointerdown listeners and records `claimVersion`. Typing and remote imports keep publishing in the meantime.
  3. When `mutate` finishes, the settlement commit lands and `settled` resolves.
  4. The runtime repairs focus only if `receipt.version === claimVersion + 1 === lastCommit` and nothing invalidated it. `onHistoryReplay` then fires once.
- **Cmd+Z while a replay is pending:** `busy` comes back synchronously.
- **Comments owner unavailable:** the owner returns a synchronous `blocked`, so `undo()` returns `blocked` without publishing `pending` at all.

**Load-bearing decisions:**
1. The `status` field carries the timing, not the return type. Callers already narrow on `busy` and `blocked`.
2. Only an owner that actually returns a Promise produces `pending`.
3. History is the one owner of replay-owner failure, and `settled` always resolves. This also fixes a real bug: today, a throw while cloning or settling leaves `pending` stuck, so every later replay returns `busy`.
4. The contract types move to root, next to `EditorEffectHistoryReplayResult`. Root, history and react all need them, and the entrypoint graph forbids `plitejs/react` importing `plitejs/history`. `getEditorHistoryApi` replaces the runtime's `as unknown as` casts.
5. These stay as they are: the claim, single-flight `busy`, the four-case table, activation retirement and the receipt.

**What the types enforce:**
- `settled` exists only on `pending`.
- A settlement can never be `busy`, `empty` or a `conflicts` block.
- `onHistoryReplay` never sees `pending`.
- "Never rejects" can't be expressed in a type. History's catch-everything settlement enforces it.

**Interface depth:** `undo()` still takes no arguments. The claim, the table, retirement and error reporting stay inside History. The dispatcher takes on focus repair. Every initiator stays a one-line call.

**Concurrent writers while a replay is pending:** user edits mark the claim as edited, and the table decides where S lands. Whether retirement or settlement wins is decided by the activation check. The Comments queue slot is taken synchronously, before anything else can run.

## 4. Deleted and added

**Deleted:**
- The `Promise` return of `undo`/`redo`. They now return a synchronous `HistoryResult`.
- `replayNow` and its two dead branches. One synchronous `replay` plus a private `settleClaim` replace them.
- `ModelHistoryResult`, plus the `editor.api` and `state.history.pending` casts in the runtime. Root types and `getEditorHistoryApi` replace them.
- The `version + (pending === direction ? 2 : 1)` inference. The runtime records `claimVersion` after a `pending` return instead.
- The focusin/pointerdown listeners on the synchronous path, and the listener leak with them. The listeners are armed only after `pending`.
- `dispatchHistory`'s `.catch`, its `reportError` call and its scheduler rethrow for replay rejections. History reports owner failure now. The runtime catches only errors from its own callbacks, through `reportEditorError`.
- Comments' catch-all `comments-mutation-failed` block. Comments still returns a typed `blocked` for reject, stale, diverged and attachment-unavailable. Defects such as an invalid decision or an identity replacement propagate to History, which reports them and blocks.

**Added:**
- The `pending` variant with `settled`.
- The types `HistoryOutcome` and `HistorySettlement`.
- The blocked reason `history-replay-failed`.
- Root `getEditorHistoryApi`.
- Root `reportEditorError`, moved from the runtime.

**Moved:** `HistoryResult`, `HistoryApi` and `HistoryDirection`, into root `interfaces/editor.ts`.

**Kept:** the claim, `pending()`, `busy`, the table, the receipt WeakMap, activation, the effect-owner signature, `useEditorHistory`'s void dispatch and `onHistoryReplay`.

## 5. Tradeoffs accepted

- We accept one Promise-valued field on one variant. In exchange, every other call needs no `void` or `await`, and the lint stays as is.
- We accept that code ignoring `pending` still reads state from before the replay settled. In exchange, no caller is forced to narrow. The returned value now tells them, which `void` never did.
- We accept a headless package calling `reportError` (a microtask rethrow in Node) in exchange for a single owner of failures. Comments now surfaces app defects it used to swallow.
- We accept migrating about 366 call sites mechanically. A leftover test `await` on a comment flow fails loudly, because it gets `pending` instead of `applied`.
- We accept `busy` refusing to undo text typed while a replay is pending. In exchange, the table's check over 1,684,893 sequences stays valid. VS Code drops a repeat press the same way.
- We accept two commits for an owner that returns synchronously. In exchange, History claims the entry before any owner code runs.

## 6. Alternatives considered

- **Keep the Promise and allowlist `undo`/`redo` in the lint:** hides the unhandled rejection the probe reproduced.
- **`HistoryResult | Promise<HistoryResult>` (the VS Code shape):** every caller has to check whether the result is a Promise.
- **Settlement visible only through published state:** the blocked reason is lost unless History keeps a last-outcome value around, and tests need a subscription helper.
- **`undo({ onSettled })`:** the callback either fires sometimes synchronously and sometimes asynchronously, or callers handle two result paths.
- **Optimistic removal in Comments with rollback:** breaks AC7. Rolling back after interleaved edits needs the same four-case table, now inside Comments, and collaborators see a flicker.
- **Threads leave history and undo removes only the anchor (BlockNote's approach):** breaks AC4's blocking, and Plite anchors aren't document content.

## 7. Requirement check

| # | Verdict | Reason |
| --- | --- | --- |
| 1 | kept | Entry, claim and table unchanged; C22-ORDER awaits `settled` |
| 2 | kept | Remote journals and blocking on divergence unchanged |
| 3 | kept, strengthened | Settlement always clears `pending`; it can no longer get stuck |
| 4 | kept | `mutate` still runs before `setThread` |
| 5 | changed (doc) | `undo()` is now synchronous, and each update stays synchronous. The docs describe a session batch as a claim update followed later by a settlement update |
| 6 | kept | `settled` reports completion truthfully; every replay claims within the call; no editor lock |
| 7 | kept, owner moved | The runtime owns the mounted result and History owns owner failure; nothing rejects; the lint is unchanged |
| 8 | kept | `applyReplay`, tags, receipt, `settleInput` and retirement unchanged |

## 8. Open questions and risks

- Should `hasUndo()` take `pending` into account? Raw readers like `document-state.tsx` currently enable a button that would return `busy`.
- If the blocked settlement commit itself throws, may History clear `pending` without publishing a commit?
- Should Plite get an editor-level `onError` instead of `globalThis.reportError`, now that a headless package reports async failures?
- Is a network failure in `mutate` expected (block without reporting) or a defect (report it)? Should `mutate` be required to return `reject` for expected failures?
- Does any app depend on `onHistoryReplay` firing asynchronously? It now fires inside the keydown task.
- Should the dispatcher emit a claim event so UI can show something like "Removing comment…", or is `pending()` enough?

## 9. Next implementation step

Move the result types to root and make `replay` synchronous, with a `settleClaim` that always clears `pending`. Then turn the probe's four observations into tests that fail first: text reverted when `undo()` returns, `pending` published before return, `busy` while pending, and an owner throw that produces zero unhandled rejections.

(A copy of this package is also saved at `/Users/zbeyens/.claude/plans/architect-runner-plite-merry-piglet.md`.)
