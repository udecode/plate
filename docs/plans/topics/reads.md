# Reads, snapshots and subscriptions

Page: https://claude.ai/artifact/488sqQGdGBVvhgnubqfSmv

Plite's read and observe surface: how app code reads one coherent document at its committed or draft lifetime, and how it observes each published commit. The ledger asks which canonical read and snapshot owner can replace repeated traversals or duplicate subscriptions without changing observable state. Two earlier targets have landed in source: commit-owned per-key path membership with demand-gated selector dispatch (2026-09-11), and copy-on-branch snapshot-index provenance with a regression test (2026-09-16). Their plan's whole-checkout gates and the www native burst-timing budget never passed. The 2026-10-04 audit found one gap left, two public subscriptions that delivered the same per-commit payload. The 2026-10-05 build cut `editor.subscribe`, so `editor.subscribeCommit` is the one public way to observe a commit. Its law lives in `docs/research/decisions/reads-demand-driven-invalidation.md`.

## Public API

Observe each commit, and read the document or the selection it published.

```ts
// content/docs/api/editor-api.mdx
const unsubscribe = editor.subscribeCommit((commit) => {
  if (commit.changed.has("document") || commit.dirtyStateKeys.length) {
    save(editor.read.value());
  }

  if (commit.selectionChanged) {
    syncSelection(commit.selectionAfter);
  }
});
```

Read the snapshot published with the commit from the second argument.

```ts
// packages/plitejs/test/snapshot-contract.ts
editor.subscribeCommit((_commit, snapshot) => {
  snapshots.push(snapshot);
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

Where an editor needs code to run earlier than app listeners, it gives that code an extension tier, as CodeMirror's `ViewPlugin` and slate-v2's `registerCommitListener` do, not a second app listener. Plite already has that tier in plugin commit listeners, which `notifyListeners` runs before the public commit subscription.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The provider calls the runtime subscription directly instead of a public method that forwarded to it | Plite | `plitejs/react`, importing `getEditorRuntime` through `packages/plitejs/src/react/editable/runtime-editor-api.ts` | The React partition may import the root partition under `tooling/entrypoints/entrypoint-dag.mjs`, and `getEditorRuntime` is reachable there |
| The snapshot listener and commit source types are internal | Plite | `plitejs` root partition, not exported from `packages/plitejs/src/index.ts` | Only internal listener plumbing takes them |

## Main changes

- `packages/plitejs/src/core/commit.ts` answers per-key path membership from presence plus old-path identity, memoized per commit, so one unchanged-key query does not derive the whole shifted path set.
- `packages/plitejs/src/react/hooks/use-editor-selector.tsx` requests aggregate change sets only when a matching listener map exists.
- `advancePathStableSnapshotIndex` in `packages/plitejs/src/core/snapshot-index.ts` keeps in-place provenance on the linear path-stable path and rebuilds from the exact source snapshot when an older shared index branches.
- `STATE_VIEW_CACHE` in `packages/plitejs/src/core/public-state.ts` caches read views per configuration.
- `notifyListeners` in `packages/plitejs/src/core/public-state.ts` takes a required commit and runs plugin commit listeners, then `subscribeCommit` listeners, then the internal snapshot listeners and source-phase listeners from `packages/plitejs/src/core/listener-state.ts`, for the same commit and snapshot.
- The Plite provider registers through `getEditorRuntime(editor).subscribe(...)`, so it runs after every public commit listener, after the decoration manager and before the DOM commit fences on root and named-root views. A test in `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx` pins app listeners ahead of the provider. On an authored-fragment view the authored runtime delivers to the provider inside its own `subscribeCommit` listener (`packages/plitejs/src/authored/authored.ts:1412-1423`), so later app listeners run after the provider.
- The internal snapshot listener always receives a commit, and the view runtime, the provider, the DOM fence and the decoration manager have no commit-absent branch.

## Open work

- `docs/plans/2026-09-11-demand-driven-commit-invalidation.md` still has open gates: the strict whole-checkout checks, and the www native burst-timing budget (405.7 to 455.1 ms against 373.4 ms), which the plan attributes to paced paint waits without resolving it. owner: zbeyens.
- Fragment-view order and per-view fence ordering stay deferred with their next probes, owner: zbeyens, tracked here.
- Base-editor source buckets, `EditorCommitSource`'s never-emitted members (`annotation`, `focus`, `composition`, `external`) and the dead `hasListeners` and `hasSnapshotListeners` exports (`packages/plitejs/src/core/public-state.ts:306-307`) wait for one subtractive follow-up, owner: zbeyens, tracked here. On `plitejs/internal`, `subscribeSource(editor, 'commit', listener)` still reaches every commit, because every commit carries the `'commit'` source, so that follow-up also decides whether the internal entry point keeps it.
- After the commit-absent branches go, the view runtime's `subscribe` and `subscribeSource` (`packages/plitejs/src/editor-runtime-view.ts:1160-1246`) differ by one source filter and could share one projection, owner: zbeyens, tracked here. The build merged them and the diff panel reverted the merge, because the shared path projected the snapshot before the source filter, adding work for every filtered listener on commits it rejects. A merge must keep the filter before the projection. The same file also repeats the commit-to-view projection in `afterCommit` and `subscribeCommit`.
- The internal snapshot listener now always receives a commit, so it is `EditorCommitListener` with its arguments reversed. Typing the runtime's `subscribe` and `subscribeSource` listeners as `(commit, snapshot)` would delete the internal `SnapshotListener` type, owner: zbeyens, tracked here.
- `pnpm --filter www api-reference` and `api-reference:check` fail at `HEAD` because `apps/www/api-reference.config.json` never classified the `HistoryApi` export, so `apps/www/src/generated/api-reference-manifest.json` still lists `SnapshotListener` and `EditorCommitSource` until the history owner classifies it and the manifest regenerates, owner: zbeyens, tracked here.
- `pnpm check` fails at `HEAD` on the root `package.json` format and on `publishes a remote update while a session replay is pending` in `packages/plitejs/test/yjs/collaborative-history-contract.slow.ts`, which still awaits the history result as a promise, owner: zbeyens, tracked here with the history subject.
- The TableGrid compiler benchmark in `packages/platejs/src/features/table/lib/internal/mutation.benchmark.slow.ts` keeps wall-clock budgets in a blocking test and failed once in four runs on two different cases, owner: zbeyens, tracked here.
- `notifyListeners` still branches on two-argument plugin commit listeners, which the only writer never registers (`packages/plitejs/src/core/plugin.ts:1421-1440`), owner: zbeyens, tracked with the listener cleanup above.
- `benchmarks/slate-v2/donor/core/current/editor-store.mjs` fails at `HEAD` on `Editor document field "marks" is not supported`, owner: zbeyens, tracked here.
- The surviving `BaseEditor.subscribeCommit` takes `EditorCommitListener<any>` (`packages/plitejs/src/interfaces/editor.ts:1859`), and `packages/platejs/src/react/components/Plate.tsx:163-165` derives its listener type from it. Whether it should take `EditorCommitListener<V>` is a separate public-type decision, owner: zbeyens, tracked here.
