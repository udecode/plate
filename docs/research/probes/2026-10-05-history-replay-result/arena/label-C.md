## Problem

Return `HistoryResult` synchronously from `undo()` and `redo()`. Document undo already finishes inside the call; its Promise adds ceremony and delays mounted presentation. Preserve server-first Comments replay, call-order claims, live editing, `busy`, truthful completion, and the floating-promise lint. Change requirement 5’s literal “one complete update” promise: document replay uses one synchronous update; external replay uses a claim update and a settlement update. Strengthen external-owner authoring so local publication happens inside settlement. Otherwise, changing the return type cannot prevent Comments from publishing before a failed history settlement.

## Usage (caller's view)

Ordinary calls require neither `void` nor `await`. Waiting is explicit when the result says work remains.

```ts
editor.api.history.undo();

const replay = editor.api.history.redo();
const outcome =
  replay.status === "pending" ? await replay.settled : replay;

if (outcome.status === "blocked") {
  showHistoryConflict(outcome);
}
if (outcome.status === "failed") {
  showHistoryError(outcome.error);
}
```

A mounted toolbar retains its existing controller contract:

```tsx
// history-toolbar-button.tsx
const { canUndo, pending, undo } =
  useEditorHistory({ editor: useEditor() });

<ToolbarButton
  aria-busy={pending !== null}
  disabled={!canUndo}
  onClick={undo}
/>;
```

The document portion of the existing Comments ordering test becomes synchronous:

```ts
// BaseCommentsPlugin.spec.ts; existing setup and fixtures
const { editor } = setup(null);

editor.update({ history: "new-batch" }, (tx) => {
  tx.text.insert("A", { at: { path: [0, 0], offset: 0 } });
});

expect(editor.api.history.undo()).toEqual({ status: "applied" });
expect(NodeApi.string(editor.read.children()[0])).toBe("Alpha Beta");
```

Comment replay waits for the specific request, rather than observing a global pending flag:

```ts
const { editor, api } = setup(null);
await api.createThread({
  id: "local-thread",
  body: body(),
  target: { type: "range", range },
});

const replay = editor.api.history.undo();
if (replay.status !== "pending") {
  throw new Error("Expected server-first comment replay");
}

expect(api.getThread("local-thread")).toBeDefined();
expect(await replay.settled).toEqual({ status: "applied" });
expect(api.getThread("local-thread")).toBeUndefined();
```

Cmd+Z continues through the mounted dispatcher:

```ts
// keyboard-input-strategy.ts, after permission/composition checks
if (Hotkeys.isUndo(event.nativeEvent) && runtime) {
  runtime.dispatchHistory("undo");
  event.preventDefault();
}

// Editable receives exactly one terminal result.
onHistoryReplay={({ result }) => {
  if (result.status === "blocked") showHistoryConflict(result);
}}
```

`pending` is availability state. It is not a completion receipt and cannot identify which request finished.

## Shape

```ts
// interfaces/editor.ts: external-owner contract
export type EditorEffectHistoryReplayResult<T> =
  | Readonly<{ status: "blocked"; reason: string }>
  | Readonly<{
      status: "prepared";
      /**
       * Stage local publication using draft state only.
       * No I/O, external-store writes, document edits, or nested updates.
       * Return the exact transition staged, or block without writing.
       */
      stage: (
        tx: Pick<EditorUpdateTransaction, "getField" | "setField">
      ) =>
        | Readonly<{ status: "applied"; value: T }>
        | Readonly<{ status: "blocked"; reason: string }>;
    }>;

type LocalReplayHistory<T> = Readonly<{
  replay: (
    editor: Editor,
    value: T
  ) =>
    | EditorEffectHistoryReplayResult<T>
    | Promise<EditorEffectHistoryReplayResult<T>>;
}>;

// history/history-plugin.ts
export type HistoryOutcome =
  | Readonly<{ status: "applied" }>
  | Readonly<{ status: "empty" | "busy" }>
  | Readonly<{ status: "blocked"; conflicts: readonly string[] }>
  | Readonly<{ status: "blocked"; reason: string }>
  | Readonly<{ status: "failed"; error: unknown }>;

export type HistoryResult =
  | HistoryOutcome
  | Readonly<{
      status: "pending";
      /** Resolves once after local settlement; never rejects. */
      settled: Promise<
        Exclude<HistoryOutcome, { status: "empty" | "busy" }>
      >;
    }>;

export type HistoryApi = Readonly<{
  undo: () => HistoryResult;
  redo: () => HistoryResult;
}>;

function replay(
  editor: Editor,
  direction: "undo" | "redo"
): HistoryResult {
  // TODO Claim before invoking an owner; preserve the settlement table.
  // TODO Stage publication, emit its transition, and settle atomically.
  // TODO Resolve failed preparation/staging after releasing the claim.
  throw new Error("not implemented");
}

// react/editable/editable-dom-runtime.ts
export type EditableHistoryReplayResult =
  | HistoryOutcome
  | Readonly<{
      status: "unavailable";
      reason: "composing" | "not-installed" | "unmounted";
    }>;

class EditableDOMRuntime {
  private replayHistory(
    direction: "undo" | "redo",
    focusPolicy: EditorHistoryFocusPolicy
  ): HistoryResult | EditableHistoryReplayResult {
    // TODO Flush native input and invoke the validated history capability.
    throw new Error("not implemented");
  }

  dispatchHistory(
    direction: "undo" | "redo",
    focusPolicy: EditorHistoryFocusPolicy = "restore-root",
    onFulfilled?: (result: EditableHistoryReplayResult) => void
  ): void {
    // TODO Finish immediately or consume settled with both handlers.
    // TODO Guard presentation, deliver once, and report failures once.
    throw new Error("not implemented");
  }
}
```

Keep the persistent history branches, identities, mapping journals, and four-case settlement table. Add one completion resolver to the private replay operation; it never enters annotations, snapshots, or persistence.

Dominant access patterns stay short:

- Document replay reads the mapped head and commits synchronously.
- External replay claims that identity, prepares durable work, then stages local publication and branch movement together.
- Availability reads inspect the head and pending direction without materializing stacks.
- Completion consumers hold their returned Promise, so a later replay cannot overwrite their result.

Comments replaces its mutable thread-record Map with one private, nonpersisted state field using `history: "skip"` and local collaboration policy. All creation, mutation, and remote replacement paths publish records through that field. Existing keyed subscriptions and indexes become projections. Anchors retain their existing owner and lifetime.

`replayCreation` retains the per-thread queue and server-first `mutate`. Its prepared result stages the canonical thread only after checking current generation, exact previous thread, message identity, and owner lifetime. History emits the creation transition and settles the branch in that same update. Skip-policy field effects do not become additional history entries.

The queue slot must remain held through staging or refusal. Releasing it when preparation finishes would allow another mutation between authorization and publication.

Types distinguish prepared work from applied work, restrict staging to state fields, and exclude `busy`, `empty`, and another `pending` from completion. JavaScript boundaries still validate owner results and reject asynchronous staging. Types cannot prevent a callback from secretly mutating a closure; that violates the owner contract.

The interface remains deep: callers request undo once. History owns claims, completion, cleanup, mapping, and settlement.

## Deleted and added

| Change | Behavior and destination |
|---|---|
| Delete always-Promise replay returns and `Promise.resolve` wrappers | Completed document results return directly. |
| Add `HistoryOutcome`; extend `HistoryResult` with `pending` | Terminal consumers receive outcomes; request callers can observe completion. |
| Add `failed` | Unexpected preparation or staging errors remain observable without rejecting an ignored completion Promise. |
| Replace owner `applied` publication with `prepared.stage` | Durable preparation stays external; local publication joins settlement. |
| Replace Comments’ writable thread Map | One transactional field owns records; indexes and subscriptions derive from it. |
| Extend the per-thread queue reservation | Serialization covers preparation through publication, preventing two local writers. |
| Delete `ModelHistoryResult` and its hand-maintained service shape | React imports canonical types and validates optional capability lookup at one erased boundary. |
| Delete forced document-path `await`, pending reread, and inferred commit count | Return discrimination identifies the actual timing. |
| Retain async presentation listeners only for pending replay | One cleanup scope covers invocation, settlement, and retirement. |
| Add a request-scoped lifecycle finalizer | Clear pending even when settlement preparation throws; preserve current branches and notify existing subscribers. |

The graph currently forbids `plitejs/react → plitejs/history`. Add that explicit dependency; `history → root` creates no cycle. Plate continues re-exporting the history types.

Keep claim annotations, activation identity, receipt metadata, pending reads, `busy`, native grouping, and the settlement table. Their correctness jobs remain.

## Tradeoffs accepted

- We accept explicit pending-result narrowing in exchange for synchronous ordinary calls.
- We accept migrating Comments records into transactional state in exchange for atomic local settlement.
- We accept two synchronous updates for external replay in exchange for visible pending state and uninterrupted editing.
- We accept refusing repeated undo while pending in exchange for stable call-order ownership.
- We accept a terminal `failed` result in exchange for completion Promises that cannot produce unhandled rejections.

## Alternatives considered

- **Return `HistoryResult | Promise<HistoryResult>`:** thenable detection exposes execution machinery and retains floating-Promise friction.
- **Optimistically remove Comments and roll back:** simpler local timing, but breaks AC7 and exposes local states prohibited by AC5.
- **Keep the first-cut return proposal alone:** fixes caller ceremony but leaves Comments publication ahead of potentially failing settlement.
- **Remove comment creation from history:** deletes async replay, but breaks the required Cmd+Z behavior and A/B/C order.

## Requirement check

| Requirement | Disposition | Reason |
|---|---|---|
| 1 | Kept | One creation entry preserves order and canonical thread/message identities. |
| 2 | Kept | Remote updates use skip policy; divergence blocks without advancing past B. |
| 3 | Kept locally | Preparation publishes nothing locally; failed staging discards the draft; concurrent replay returns `busy`. |
| 4 | Kept | `mutate` authorizes and persists before staging local publication. |
| 5 | Changed | Every update stays synchronous and non-nesting; external replay explicitly spans claim and settlement updates. |
| 6 | Kept | Pending publishes before return; completion follows settlement; other updates continue. |
| 7 | Kept | The mounted dispatcher alone consumes completion, delivers outcomes, and reports replay failures. Lint remains unchanged. |
| 8 | Kept | Existing mapping, selection, roots, composition, and retirement protections remain load-bearing. |

Post-publication observer errors must retain an `applied` outcome. They are reported through their existing observer error owner, never mistaken for a refused replay.

## Open questions and risks

- Can the lifecycle finalizer notify existing subscribers without depending on the same vetoable update that failed?
- What server revision check guarantees safe persistence when another client changes the thread during authorization?
- Does cloning a transactional thread field impose unacceptable cost at realistic thread counts?
- Can attachment restoration and release remain correct across failed staging and owner retirement?
- Which existing Chromium cases catch synchronous focus repair reentrancy?

This is a source-grounded candidate, not an executed prototype or browser proof.

## Next implementation step

Prototype the return types and transactional Comments staging, then prove that a forced settlement failure preserves both the thread and its history entry while clearing pending.
