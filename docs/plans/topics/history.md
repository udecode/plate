# Undo, redo and grouping

Page: https://claude.ai/artifact/J52MrJR8szy1DAhcShcxqZ

Plite History owns one undo order per editor: document batches, native grouping, mapped selection and one kind of fallible external effect, comment-thread creation. `node tooling/scripts/review-ledger.mjs show history` prints the scope's full review and plan history. The 2026-10-04 audit kept the replay lifecycle (call-order claims, per-editor pending state, `busy` overlap, one mounted dispatcher) and the Plate configuration adapter. Undo and redo return their result in the call; only comment-creation replay returns `pending`. The TaskHub-22 order, safety and focus cases pass in Bun and Chromium.

## Public API

Application code replays history through the model service. A document batch has applied when the call returns; code that needs the final outcome waits only when the replay is pending.

```ts
// content/docs/(guides)/history.mdx
const result = editor.api.history.undo();
const outcome = result.status === "pending" ? await result.settled : result;
```

Event code that does not need the outcome calls it bare, and the type-aware lint stays quiet.

```ts
// apps/www/src/app/(app)/examples/plite/_examples/yjs-collaboration.tsx
editor.api.history.undo();
syncPeerHistoryDepths(peer, editor);
```

Mounted controls dispatch through the view and return `void`.

```tsx
// apps/www/src/registry/components/editor/history-toolbar-button.tsx
const { canUndo, pending, undo } = useEditorHistory({ editor: useEditor() });
<ToolbarButton aria-busy={pending !== null} disabled={!canUndo} onClick={undo} />
```

A test waiting on a comment-style replay asserts the `pending` variant through a small `settled` helper.

```ts
// packages/plitejs/test/history/history-branch-contract.spec.ts
const pending = editor.api.history.undo();
gate.resolve();
assert.deepEqual(await settled(pending), { reason: 'external-diverged', status: 'blocked' });
assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
```

The result types live in the root entrypoint, beside the effect replay types.

```ts
// packages/plitejs/src/interfaces/editor.ts
/** Final outcome of a replay that waited on its effect owner. */
export type HistorySettlement =
  | Readonly<{ status: 'applied' }>
  | Readonly<{ reason: string; status: 'blocked' }>
  | Readonly<{ status: 'failed' }>;

/** Outcome of an undo or redo that has finished. */
export type HistoryOutcome =
  | HistorySettlement
  | Readonly<{ status: 'busy' | 'empty' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>;

export type HistoryResult =
  | HistoryOutcome
  | Readonly<{
      /** Resolves once the effect owner finishes. Never rejects. */
      settled: Promise<HistorySettlement>;
      status: 'pending';
    }>;

export type HistoryApi = {
  /** Replay the current redo batch as one complete editor update. */
  redo: () => HistoryResult;
  /** Replay the current undo batch as one complete editor update. */
  undo: () => HistoryResult;
};
```

History's preconditions, such as a replay inside a transaction, and a document replay's own update throw, like any `editor.update`. Once a session batch is claimed, an owner or settle failure settles `failed`, keeps the entry at the head and reports to the editor's lifecycle error sink. With no sink set, the report goes to `globalThis.reportError` when the platform has it, and to `console.error` otherwise.

```ts
// packages/plitejs/src/history/history-plugin.ts
const report = (cause: unknown) =>
  reportEditorLifecycleError({
    cause,
    direction,
    editor,
    phase: 'replay',
    source: 'history',
  });
```

A local effect joins the undo order by owning its replay callback.

```ts
// content/docs/(guides)/history.mdx
const externalValueEffect = defineEffect<Transition>({
  history: {
    replay: (_editor, transition) => {
      externalValue.current = transition.value;
      return { status: "applied", value: transition };
    },
  },
  invert: ({ previous, value }) => ({ previous: value, value: previous }),
  key: "external-value.set",
});
```

## What other editors do

The 2026-10-05 review read eleven editors and VS Code in local source at the revisions below, without running them. Ordinary editor undo is synchronous in all eleven. VS Code's undo service and Monaco's `ITextModel.undo()` return `Promise<void> | void`, used for file, notebook and confirmation-dialog undo. No editor makes undo wait on a server, and BlockNote, the Lexical playground and Liveblocks keep comment threads out of document history.

| Editor | Undo call | Returns | Effects outside the document | Source |
| --- | --- | --- | --- | --- |
| ProseMirror `c7f2f1d` | `undo(state, dispatch)` | `boolean` | Not recorded; `addToHistory: false` skips a transaction | `history/src/history.ts:391-447` |
| Lexical `dd5c41b` | `dispatchCommand(UNDO_COMMAND)` | `boolean` | Playground comments live in a `CommentStore` outside history; undo only unwraps the mark | `lexical-history/src/index.ts:415-449`; `CommentPlugin/index.tsx:752-805` |
| Tiptap `91c51be` | `commands.undo()` | `boolean` | ProseMirror history; collaboration switches to Yjs undo | `extensions/src/undo-redo/undo-redo.ts:56-68` |
| Slate `945a484` | `editor.undo()` | `void` | Operations only; `withoutSaving` excludes | `slate-history/src/history-editor.ts:17-21` |
| CodeMirror 6 `5b9bac9` | `undo({ state, dispatch })` | `boolean` | `invertedEffects` undoes non-document state, still as pure state | `codemirror-commands/src/history.ts:117-134` |
| Yjs `da05230` | `undoManager.undo()` | `StackItem \| null` | `trackedOrigins` filters; stack events carry a `meta` map | `src/utils/UndoManager.js:342-366` |
| Quill `539cbff` | `history.undo()` | `void` | `userOnly` skips API changes | `modules/history.ts:85-150` |
| BlockNote `1e26f1c` | `editor.undo()` | `boolean` | Thread creation awaits the server, then sets a mark; undo removes only the mark and orphaned marks reconcile | `comments/extension.ts:120-160,366-382` |
| Liveblocks `ee1b008` | `room.history.undo()` | `void` | Threads are not in history; creation is optimistic and rolls back on server failure | `liveblocks-react/src/room.tsx:1974-2058` |
| tldraw `e8f61ac`, Loro | `editor.undo()`, `undo()` | `this`, `LoroResult<bool>` | Loro attaches entry metadata through `on_push`/`on_pop` | `Editor.ts:1551`; `undo.rs:194-199` |
| VS Code and Monaco `df2411c` | `undoRedoService.undo(resource)`, `model.undo()` | `Promise<void> \| void` | Async for file and notebook elements and confirmation dialogs; text edits are synchronous. The pointer moves first, the stack locks until settlement, a repeat press is dropped with a warning, and a failure clears the affected stacks and notifies; the call never rejects | `platform/undoRedo/common/undoRedo.ts:17-72`; `undoRedoService.ts:710-772,1012-1028` |

Products: whether Google Docs, Notion, Figma, Linear or Confluence undo a comment with Cmd+Z is unverified; their help pages do not say. Survey data: `docs/research/probes/2026-10-05-history-replay-result/survey.tsv`.

## Main changes

- `packages/plitejs/src/history/history-plugin.ts` owns replay. A document batch applies in one synchronous update and returns its outcome. A batch carrying a `history: { replay }` effect claims the branch head, publishes `pending` and calls its owner. A result without a callable `then` settles in the call; a thenable returns `pending` with a `settled` that never rejects. An owner or settle failure after the claim settles `failed`, keeps the entry, clears `pending` and reports once through `reportEditorLifecycleError`.
- `packages/plitejs/src/history/history-state.ts` owns the branches, the claim record with its claim version and the four-case settlement table.
- `packages/plitejs/src/core/lifecycle-error.ts` sends a history replay failure to `globalThis.reportError` when no sink is set and the platform has it.
- `packages/plitejs/src/react/editable/editable-dom-runtime.ts` `dispatchHistory` is the one mounted owner. It waits on `settled` only for a pending replay, delivers `onHistoryReplay`, and repairs selection and focus one microtask after the call unless a commit followed the claim, checked against the claim version in History's receipt. Its `focusin`/`pointerdown` guards come off even when the replay throws.
- `packages/platejs/src/lib/plugins/HistoryPlugin.ts` forwards live store getters into one Plite recorder; `HistoryApi` reaches Plate through `packages/platejs/src/facade.ts`.
- `packages/platejs/src/features/comments/BaseCommentsPlugin.ts` is the only production `history: { replay }` author; its replay runs the app's `mutate` inside the per-thread queue.

## Open work

- Stage Comments' local publication inside History's settlement update, so a settle-step failure cannot leave the thread removed while the entry stays at the head. The 2026-10-05 arena's gpt-6.1-sol candidate sketches a two-phase owner contract (`docs/research/probes/2026-10-05-history-replay-result/arena/label-C.md`). owner: zbeyens, tracked here.
- Report a throwing Comments listener through the lifecycle sink instead of letting it reach the mutation. Every listener loop Comments runs during a mutation needs it: thread, attachment, decoration refresher and active-id subscribers. Today such a throw turns an applied creation replay into `blocked comments-mutation-failed` and leaves the entry stuck. Found by the 2026-10-05 plan panel, both rounds. owner: zbeyens, tracked here.
- Report the cause when Comments' `mutate` throws during a creation replay; today `replayCreation` returns `blocked` and drops the error. owner: zbeyens, tracked here.
- Decide whether `reportEditorLifecycleError` should fall back to `globalThis.reportError` for every variant, not only `history`. owner: zbeyens, tracked here.
- Decide whether the private replay receipt should be discriminated by replay kind, which would remove the optional `claimVersion` and the runtime's `claimVersion ?? version` fallback. owner: zbeyens, tracked here.
