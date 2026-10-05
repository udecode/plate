# Reads, snapshots and subscriptions

Page: https://claude.ai/artifact/488sqQGdGBVvhgnubqfSmv

Plite's read and observe surface: how app code reads one coherent document at its committed or draft lifetime, and how it observes each published commit. The ledger asks which canonical read and snapshot owner can replace repeated traversals or duplicate subscriptions without changing observable state. Two earlier targets have landed in source: commit-owned per-key path membership with demand-gated selector dispatch (2026-09-11), and copy-on-branch snapshot-index provenance with a regression test (2026-09-16). Their plan's whole-checkout gates and the www native burst-timing budget never passed. The 2026-10-04 audit found one gap left, two public subscriptions that deliver the same per-commit payload. That audit read source only and ran no tests. Its law lives in `docs/research/decisions/reads-demand-driven-invalidation.md`.

## Public API

Observe each commit with its snapshot.

```ts
// content/docs/api/editor-api.mdx
const unsubscribe = editor.subscribe((_snapshot, commit) => {
  if (commit?.changed.has("document") || commit?.dirtyStateKeys.length) {
    const documentValue = editor.read.value();

    save(documentValue);
  }
});
```

Observe each commit's change summary.

```ts
// content/docs/api/editor-api.mdx
const unsubscribe = editor.subscribeCommit((commit) => {
  if (commit.selectionChanged) {
    syncSelection(commit.selectionAfter);
  }
});
```

## What other editors do

Read from source at Lexical `dd5c41b13`, prosemirror-view `ca4c78e` and prosemirror-state `ffad5d9`, Tiptap `91c51be53`, Slate `945a484df`, the slate-v2 fork `f0e5ad1ae`, and codemirror-view `fbff59b` and codemirror-state `9c80127`. None was run. Only slate-v2, which Plite descends from, has two public listeners that receive the same commit and snapshot on every commit, and its own React layer uses only `subscribeCommit`. The others give each listener its own payload or its own filter.

| Editor | Observe a commit | Receives | Distinct per-commit subscriptions | Runs when |
| --- | --- | --- | --- | --- |
| Lexical | `registerUpdateListener` | `editorState`, `prevEditorState`, dirty sets, mutated nodes, tags | Split by payload: mutation listeners per node class, a text-content string, a decorator map | After the state swap, DOM reconcile and DOM selection |
| ProseMirror | `dispatchTransaction`, plugin view `update(view, prevState)` | The transaction before it applies; the view and previous state | One owner hook, plus plugin views as the extension surface | Plugin views after the state, DOM and selection sync |
| Tiptap | `editor.on('transaction' \| 'update' \| 'selectionUpdate')` | `{ editor, transaction, appendedTransactions }` | Same payload type, split by filter: `update` skips `preventUpdate` and unchanged documents | After `view.updateState` |
| Slate | `editor.onChange`, `<Slate onChange onValueChange onSelectionChange>` | The operation; then `children` or `selection` | Split by filter: value ops or selection ops | In a microtask after the ops apply |
| slate-v2 fork | `editor.subscribe`, `editor.subscribeCommit`, `subscribeSource`, extension `registerCommitListener` | `(snapshot, change?)`, `(commit)`, `(commit, snapshot)` | Duplicated: `subscribe` and `subscribeCommit` both fire on every commit and differ in argument order and phase | Synchronously after the version bump: extension, commit, snapshot, source |
| CodeMirror 6 | `EditorView.updateListener` facet, `ViewPlugin.update` | `ViewUpdate` with `state`, `startState`, `transactions`, `changes` and change flags | One app listener that filters on flags; `ViewPlugin` is a stateful extension tier | `ViewPlugin.update` before the DOM update, `updateListener` after it |

Where an editor needs code to run earlier than app listeners, it gives that code an extension tier, as CodeMirror's `ViewPlugin` and slate-v2's `registerCommitListener` do, not a second app listener. Plite already has that tier in plugin commit listeners, which `notifyListeners` runs before both public subscriptions.

## Main changes

- `packages/plitejs/src/core/commit.ts` answers per-key path membership from presence plus old-path identity, memoized per commit, so one unchanged-key query does not derive the whole shifted path set.
- `packages/plitejs/src/react/hooks/use-editor-selector.tsx` requests aggregate change sets only when a matching listener map exists.
- `advancePathStableSnapshotIndex` in `packages/plitejs/src/core/snapshot-index.ts` keeps in-place provenance on the linear path-stable path and rebuilds from the exact source snapshot when an older shared index branches.
- `STATE_VIEW_CACHE` in `packages/plitejs/src/core/public-state.ts` caches read views per configuration.
- `notifyListeners` in `packages/plitejs/src/core/public-state.ts` runs plugin commit listeners, then `subscribeCommit` listeners, then `subscribe` listeners and source-phase listeners from `packages/plitejs/src/core/listener-state.ts`, for the same commit and snapshot.

## Open work

- `docs/plans/2026-09-11-demand-driven-commit-invalidation.md` still has open gates: the strict whole-checkout checks, and the www native burst-timing budget (405.7 to 455.1 ms against 373.4 ms), which the plan attributes to paced paint waits without resolving it. owner: zbeyens.
