## Problem

Return a synchronous, discriminated result from `undo()` and `redo()`. Keep truthful completion for external work, server-first Comments persistence, call-order claims, live editing, native ownership, and the floating-promise lint. Two promises need correction: requirement 5’s “one complete update” describes document replay only; requirement 3 cannot guarantee no divergence after an external write succeeds and local settlement fails. Expose that uncertainty as `failed`, preserve the entry, and prevent automatic replay of an uncertain effect. Calling that failure `blocked` would lie.

## Usage (caller’s view)

README usage:

```ts
// Ordinary actions need neither void nor await.
editor.api.history.undo();

// Wait only when this call reports unfinished work.
const replay = editor.api.history.redo();
const outcome =
  replay.status === 'pending' ? await replay.settled : replay;

if (outcome.status === 'blocked') showHistoryConflict(outcome);
if (outcome.status === 'failed') showReloadRequired();
```

Mounted toolbar, retaining the existing controller:

```tsx
const history = useEditorHistory({ editor });

<ToolbarButton
  disabled={!history.canUndo}
  aria-busy={history.pending !== null}
  onClick={history.undo}
/>;
```

Document test, adapted from the synchronous usage in the collaboration examples:

```ts
// Fixture contains one recorded insertion.
expect(editor.api.history.undo()).toEqual({ status: 'applied' });
expect(editor.read.value()).toEqual(beforeInsertion);
```

Comments test, after successful local creation with its persistence response deferred:

```ts
const replay = editor.api.history.undo();
if (replay.status !== 'pending') throw new Error('Expected external replay');

expect(editor.read.history.pending()).toBe('undo');
expect(readThread(threadId)).toEqual(createdThread);

releasePersistence();
expect(await replay.settled).toEqual({ status: 'applied' });
expect(readThread(threadId)).toBeNull();
```

Mounted Cmd+Z remains a dispatch:

```ts
runtime.dispatchHistory('undo');
// Consumes the native event.
// Repairs an applied document selection synchronously.
// Delivers onHistoryReplay once, asynchronously, after final completion.
```

Direct model calls do not emit mounted events.

## Shape

```ts
// plitejs/history; Plate re-exports these.
export type HistoryOutcome =
  | Readonly<{ status: 'applied' }>
  | Readonly<{ status: 'blocked'; reason: string }>
  | Readonly<{ status: 'blocked'; conflicts: readonly string[] }>
  | Readonly<{ status: 'failed'; cause: unknown }>;

export type HistoryResult =
  | HistoryOutcome
  | Readonly<{ status: 'empty' | 'busy' }>
  | Readonly<{
      status: 'pending';
      /** Resolves once, after settlement or fault containment. Never rejects. */
      settled: Promise<HistoryOutcome>;
    }>;

export interface HistoryApi {
  /** Applies document history now, or claims one external replay now. */
  undo(): HistoryResult;
  redo(): HistoryResult;
}

// Existing core effect contract: independent of React and history packaging.
export type EditorEffectHistoryReplayResult<T> =
  | Readonly<{ status: 'applied'; value: T }>
  | Readonly<{ status: 'blocked'; reason: string }>;

type EditorEffectHistoryReplay<T> = (
  editor: Editor,
  value: T
) =>
  | EditorEffectHistoryReplayResult<T>
  | Promise<EditorEffectHistoryReplayResult<T>>;

// Existing local/shared union retains:
// - { replay } only on local effects
// - shared effects accept only push or skip
// Throws/rejections are unexpected failures, not authored refusals.

type EditableHistoryReplayResult =
  | Exclude<HistoryResult, { status: 'pending' }>
  | Readonly<{
      status: 'unavailable';
      reason: 'composing' | 'not-installed' | 'unmounted';
    }>;

function replay(direction: 'undo' | 'redo'): HistoryResult {
  // TODO: validate admission; apply document batch or claim external entry.
  throw new Error('not implemented');
}

function dispatchHistory(
  direction: 'undo' | 'redo',
  focusPolicy: EditorHistoryFocusPolicy = 'restore-root',
  onFulfilled?: (result: EditableHistoryReplayResult) => void
): void {
  // TODO: settle native input, invoke replay, repair eligible presentation.
  // TODO: deliver one final event in a microtask; consume callback failures.
  throw new Error('not implemented');
}
```

**Data structures and access patterns.** Keep the existing immutable branches and single per-editor claim: activation, entry identity, direction, redo anchor, edited flag, and mapping journal. A pending handle contains only its completion Promise; it is neither another stack nor a writable claim.

- Ordinary replay checks admission, reduces one batch, commits once, and returns the result.
- External replay publishes the claim, invokes its owner synchronously to reserve Comments’ queue position, and returns `pending`. Settlement always follows asynchronously, including synchronous owner returns.
- Another replay returns `busy`. Document, selection, and remote publications continue.
- Recorded edits retain the existing settlement table: undo success after an edit drops its redo opportunity; redo success is inserted below newer edits.
- Unexpected failure preserves the claimed entry and records an activation-local fault barrier. Subsequent replay returns `blocked: history-reconciliation-required`; ordinary editing continues.

**Load-bearing decisions.**

External replay has one lifecycle regardless of whether its owner returns a value or Promise. This deliberately rejects the first proposal’s synchronous-owner fast path. Owner implementation details must not determine whether an external operation publishes one or two lifecycle commits.

`blocked` means an expected refusal with no applied transition. `failed` means completion could not be established. History catches owner rejection, validation, cloning, mapping, and settlement failures—not merely the owner’s `await`.

History reports unexpected replay failures once through the existing lifecycle-error sink, extended with a history-replay phase. `settled` resolves to `failed`; the mounted dispatcher does not report that same cause again. Dispatcher-owned presentation and callback exceptions remain its responsibility.

Fault containment must clear active pending state without retrying the failed settlement transaction. The private history-state owner retains the entry and fault barrier; publication failure cannot leave a rejected completion Promise. Recovery requires authoritative reload into a fresh editor. No speculative rollback or automatic retry is added.

**Mounted ownership.** Merge private `replayHistory` into `dispatchHistory`. Keep synchronous native-input settlement and immediate document selection repair. Keep focus/pointer invalidation coverage from before invocation through asynchronous completion, with cleanup installed before invoking potentially throwing code. Retain receipt, commit-version, root, connection, and activation checks. Final callbacks always run asynchronously, preserving one callback timing contract.

**Module map.** History types and orchestration stay in `history-plugin.ts`; branch transitions and fault containment stay in `history-state.ts`. Effect authoring remains in `interfaces/editor.ts` and `transaction-values.ts`. Comments retains its queue, canonical-thread checks, anchors, generation checks, and server-first mutation boundary.

The DAG currently **forbids** React importing history: React lists only root, DOM, and annotations. Add the intentional `react → history` edge and import canonical types. Delete `ModelHistoryResult`; narrow the installed service once at the erased plugin boundary using `HistoryApi`, without another handwritten method shape.

Types prevent pending completion from yielding `busy`, `empty`, or another pending handle. Effect types prevent shared replay owners. Promise non-rejection and external side-effect discipline require implementation proof; TypeScript cannot establish them.

## Deleted and added

- **Delete `Promise<HistoryResult>` returns:** document completion moves into the direct return; external completion moves into `pending.settled`.
- **Add `HistoryOutcome`, `pending`, and `failed`:** distinguish completed work, unfinished work, and uncertain failure.
- **Delete private `replayHistory`:** its native preparation, completion, and presentation responsibilities move into the existing dispatcher.
- **Delete `ModelHistoryResult` and copied service signatures:** canonical history types replace them through the explicit DAG edge.
- **Add a private activation-local fault barrier:** prevents duplicate external writes after uncertain completion. Fresh editor construction clears it.
- **Add a history-replay lifecycle-error phase:** reuses the existing sink; no new reporter or subscription API.
- **Retain claim maps, receipts, pending read, mapping journal, and presentation listeners:** their identity, concurrency, and focus jobs remain.
- **Retain Comments’ replay registry and per-thread queue:** they bind session effects to the live owner and serialize competing local mutations.
- **Remove Comments’ blanket conversion of unexpected exceptions to `comments-mutation-failed`:** expected refusals remain blocked; unexpected exceptions reach History’s failure owner.
- **Keep `useEditorHistory`, `onHistoryReplay`, and their signatures:** the event union gains `failed`.

## Tradeoffs accepted

- We accept an explicit pending branch in completion-sensitive callers in exchange for ceremony-free ordinary undo.
- We accept two synchronous lifecycle commits around external work in exchange for live editing and server-first persistence.
- We accept asynchronous settlement for synchronous external owners in exchange for one external lifecycle.
- We accept a reload requirement after uncertain failure in exchange for avoiding duplicate persistence or falsely reporting refusal.
- We accept a React dependency on canonical history contracts in exchange for deleting a hand-maintained union.

## Alternatives considered

- **Always return a Promise:** misrepresents document timing and taxes ordinary callers.
- **Optimistic Comments removal with rollback:** consumes or exposes state before authorization, breaking requirements 3 and 4.
- **Exclude Comments from document history:** deletes substantial machinery but breaks the requested A/B/C order.
- **Synchronously settle synchronous external owners:** makes lifecycle publication depend on an owner’s incidental implementation.
- **Convert every exception to blocked:** conceals potentially completed external writes.

## Requirement check

| Requirement | Verdict | Reason |
|---|---|---|
| 1 | Kept | One ordered history; successful replay preserves comment identity. |
| 2 | Kept | Local creation only; divergence blocks without skipping. |
| 3 | Changed | Refusals preserve state and entries; uncertain post-write failures are explicit and stop further replay. Universal distributed rollback is not promised. |
| 4 | Kept | Comments awaits authorization and persistence before local publication. |
| 5 | Changed | Every update stays synchronous and atomic; external replay is explicitly a multi-update service operation. |
| 6 | Kept | Truthful completion, observable pending, uniform external lifecycle, unrestricted ordinary publication. |
| 7 | Kept | Dispatcher owns mounted results; History owns replay diagnostics; no unobserved rejection or lint exemption. |
| 8 | Kept | Existing mapping, selection receipts, root checks, composition grouping, and retirement guards remain. |

## Open questions and risks

- Can the persistence adapter distinguish rejection from an unknown outcome after a network failure?
- Can history fault publication bypass a failed transaction without violating snapshot and subscription invariants?
- Does immediate document focus repair preserve all native composition and browser-handle behavior?
- Will the owner accept authoritative reload as exceptional recovery rather than a new reconciliation API?

These are source-derived design conclusions; no prototype or tests were run.

## Next implementation step

Prototype the return types and one deferred Comments replay, including a post-persistence settlement failure, before migrating callers.
