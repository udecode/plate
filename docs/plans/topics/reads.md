# Reads, snapshots and subscriptions

Page: https://claude.ai/artifact/488sqQGdGBVvhgnubqfSmv

Plite's read and observe surface: how app code reads one coherent document at its committed or draft lifetime, and how it observes each published commit. The ledger asks which canonical read and snapshot owner can replace repeated traversals or duplicate subscriptions without changing observable state. Two earlier targets have landed in source: commit-owned per-key path membership with demand-gated selector dispatch (2026-09-11), and copy-on-branch snapshot-index provenance with a regression test (2026-09-16). Their plan's whole-checkout gates and the www native burst-timing budget never passed. The 2026-10-04 audit found one gap left, two public subscriptions that delivered the same per-commit payload. The 2026-10-05 build cut `editor.subscribe`, so `editor.subscribeCommit` is the one public way to observe a commit. A read observes one coherent document or root at the active draft or committed lifetime; retained snapshots keep their old values and node-key locations; subscriptions publish synchronously and tell model changes from mounted DOM needs. A single-key membership query never derives unrelated changes, and complete change sets are enumerated only for consumers that need them ([invalidation plan](../2026-09-11-demand-driven-commit-invalidation.md)). `node tooling/scripts/review-ledger.mjs show reads` prints the full history.

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

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Observed-read handles, automatic tracking or signals | Node identity and commit queries already express the dependency; a dependency graph adds lifetime rules without fixing the owner defect. |
| Merging snapshots with live read views | Historical values and live transaction reads have distinct jobs. |
| Folding the snapshot index into the token index | Token changes and retained key locations differ; moving key mapping does not remove it. |
| Moving all subscription logic into core | React keeps DOM-sync suppression and view retirement. |
| Replacing the generic selector store | The 2026-09-09 E06 Defer holds; the probe isolated commit queries only. |
| An uncached single-key reader | Lost repeated dense reads, 1.31 ms against 0.17 ms at 8,192 watchers, so memoization stays on the commit. |

## Main changes

- `packages/plitejs/src/core/commit.ts` answers per-key path membership from presence plus old-path identity, memoized per commit, so one unchanged-key query does not derive the whole shifted path set.
- `packages/plitejs/src/react/hooks/use-editor-selector.tsx` requests aggregate change sets only when a matching listener map exists.
- `advancePathStableSnapshotIndex` in `packages/plitejs/src/core/snapshot-index.ts` keeps in-place provenance on the linear path-stable path and rebuilds from the exact source snapshot when an older shared index branches.
- `STATE_VIEW_CACHE` in `packages/plitejs/src/core/public-state.ts` caches read views per configuration.
- `notifyListeners` in `packages/plitejs/src/core/public-state.ts` takes a required commit and runs plugin commit listeners, then `subscribeCommit` listeners, then the internal snapshot listeners and source-phase listeners from `packages/plitejs/src/core/listener-state.ts`, for the same commit and snapshot.
- The Plite provider registers through `getEditorRuntime(editor).subscribe(...)`, so it runs after every public commit listener, after the decoration manager and before the DOM commit fences on root and named-root views. A test in `packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx` pins app listeners ahead of the provider. On an authored-fragment view the authored runtime delivers to the provider inside its own `subscribeCommit` listener (`packages/plitejs/src/authored/authored.ts:1412-1423`), so later app listeners run after the provider.
- The internal snapshot listener always receives a commit, and the view runtime, the provider, the DOM fence and the decoration manager have no commit-absent branch.
- `packages/plitejs/src/core/clone.ts` owns the registry of document root arrays. `rememberImmutableArray` registers one, and `isImmutable` answers from the registry before it asks `Object.isFrozen`. `ownJsonValue` registers an immutable value as owned JSON without freezing it again. `change/tokens.ts` no longer has `FROZEN_ARRAYS`, `rememberFrozenArray` or `isFrozenArray`.
- The builders in `packages/plitejs/src/core/change/document-index.ts` return unfrozen arrays. `freezeElementWithChildren` freezes a nested result once, when it becomes an element's `children`, and `DocumentIndex.remember` registers the root. Every update reads the root through `checkedIndexedValue`, which throws when the root's length no longer matches its token index. The top-level array that `editor.read.children()` returns after an edit is therefore not frozen (`docs/plans/2026-10-11-plite-wide-children.md`).
- `replaceTreeIndexChild` in `packages/plitejs/src/core/resolved-token-cursor.ts` copies one index row and shifts only the offsets after the replaced child, and shares the offsets when the child keeps its length.
- Every trust check that can see a root asks `isImmutable`: `getSnapshot` and the root snapshots in `public-state.ts`, `rememberValidatedDocumentRoots` in `editor-schema.ts`, the JSON ownership memo in `value-codec.ts` and `createDetachedContentSlice` in `content-slice.ts`.

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
- Each text op still copies the top-level list and its index row, about 0.1 ms per op at 10,000 blocks and 1 ms at 100,000 in Bun (`docs/plans/artifacts/2026-10-11-plite-wide-children/probe-stress-final-a1.log`). Removing that copy needs a persistent private root with one flat array built per published version, which changes how `editor.read.children()` is produced, so it runs through `best-api` and the Plan playbook. owner: zbeyens, tracked here. stop: the owner opens that plan or drops it.
- A root-level splice, as in `tx.slice.replace` or a node insert or removal, copies the root array and rebuilds the whole root index with `createTreeIndexChildren` on every op, about 256 us more per op at 10,000 blocks than at 100 under the profiler (`docs/plans/artifacts/2026-10-11-plite-change-width-benchmark/cpu/`). A splice counterpart of `replaceTreeIndexChild` would shift the offsets instead. owner: zbeyens, tracked here. stop: a structural-op width probe lands that helper, or the owner drops it.
- A wide element's `children` array, such as a table with thousands of rows, is still frozen on every edit inside it. owner: zbeyens, tracked here. stop: a probe of edits inside a wide element shows the cost material, or the owner drops it.
- Authored `finishContent` snapshots the document root with `snapshotEditorJsonValue`, which copies and freezes it once per content insert. owner: zbeyens, tracked here. stop: a content-insert width probe lands a fix, or the owner drops it.
- `rememberValidatedDocumentRoots` walks every node on each `tx.changes.apply` and `tx.slice.replace`, and `DocumentChange.apply` looks up every top-level node; the change-width session took both on 2026-10-11. owner: zbeyens, tracked here. stop: that session's plan lands them, or the owner drops them.
