# Plite Extension Context State/Tx Coverage Ralplan

Date: 2026-05-18
Status: done
Completion id: `019e1fc0-dba0-7de1-9236-b484a144cda6`
Current pass: `ralph-implementation-closeout`
Current pass status: complete
Score: 0.97 implemented

## Verdict

Yes: `extension.queries` should receive `state`.

No: transform middleware should not receive `state` as its primary context. `deleteBackward`, `deleteForward`, `insertBreak`, `insertText`, and the rest of `transforms` are update lifecycle hooks. The target shape is `transforms.*({ tx, next, ...args })`, where `tx` already includes read methods plus write methods.

The catch: current source does not yet guarantee that every transform middleware call runs inside an update transaction. That must be fixed before exposing `tx` in transform middleware. Adding `state` there would make the API easier to implement today and worse forever.

## Intent

Define the context object for every Plite extension callback so users stop guessing whether they should call `editor.read`, `editor.update`, `editor.api`, or a lifecycle object.

## Outcome

- Read lifecycle callbacks get `state`.
- Update lifecycle callbacks get `tx`.
- Post-commit callbacks get `commit` and `snapshot`.
- Registration and long-lived extension APIs get `editor`.
- Operation middleware stays low-level and does not get `tx`.
- No long-lived `editor.state` root shortcut. It looks nice, but it creates stale-read pressure.

## Non-Goals

- No Plite implementation edits in this Ralplan pass.
- No Plate compatibility layer.
- No public compatibility aliases for old `Editor.*`, `DOMEditor.*`, or `HistoryEditor.*` helper namespaces.
- No migration notes in public docs; this plan is implementation guidance.

## Current Source Evidence

- `packages/plite/src/interfaces/editor.ts:466` defines `EditorCoreStateView` read groups.
- `packages/plite/src/interfaces/editor.ts:484` defines `EditorCoreUpdateTransaction` as read groups plus write groups.
- `packages/plite/src/interfaces/editor.ts:505` exposes `editor.api`, `editor.getApi`, `editor.read`, `editor.update`, `editor.extend`.
- `packages/plite/src/interfaces/editor.ts:789` has transform middleware context as `{ editor, next, ...args }`.
- `packages/plite/src/interfaces/editor.ts:928` has query middleware context as `{ editor, next, ...args }`.
- `packages/plite/src/interfaces/editor.ts:1210` already gives normalizers a restricted `tx`.
- `packages/plite/src/interfaces/editor.ts:1252` has extension `state`, `tx`, and `editor` group factories.
- `packages/plite/src/interfaces/editor.ts:1304` has clipboard context as `{ editor, next }`.
- `packages/plite/src/interfaces/editor.ts:1325` has register context as `{ editor, name, options, runtimeState, signal }`.
- `packages/plite/src/interfaces/editor.ts:1338` lists extension slots: `api`, `clipboard`, `commitListeners`, `editor`, `elements`, `normalizers`, `operationMiddlewares`, `queries`, `state`, `transforms`, `tx`.
- `packages/plite/src/core/public-state.ts:971` builds the read `state` view and routes read methods through query middleware.
- `packages/plite/src/core/public-state.ts:1384` builds `tx` by spreading `state` and adding write methods.
- `packages/plite/src/core/public-state.ts:1500` builds the restricted normalizer transaction.
- `packages/plite/src/core/public-state.ts:1531` implements `editor.read((state) => ...)`.
- `packages/plite/src/core/public-state.ts:1553` rejects `editor.update` inside query middleware.
- `packages/plite/src/core/public-state.ts:1757` routes operations through operation middleware with `{ editor, operation }`.
- `packages/plite/src/core/public-state.ts:2594` notifies commit listeners with commit and snapshot.
- `packages/plite/src/core/editor-extension.ts:156` rejects legacy `methods` and `commands` extension slots.
- `packages/plite/src/core/editor-extension.ts:373` registers transform middleware and passes only `{ editor, next, ...args }`.
- `packages/plite/src/core/editor-extension.ts:423` registers clipboard insertData and passes only `{ editor, next }`.
- `packages/plite/src/core/editor-extension.ts:451` passes normalizer contexts through with `tx`.
- `packages/plite/src/core/query-middleware.ts:121` executes query middleware and passes only `{ editor, next, ...args }`.
- `packages/plite/src/core/command-registry.ts:69` only creates an implicit update when called with `implicitUpdate`.
- `packages/plite/src/core/transform-middleware.ts:136` calls `executeCommand` without `implicitUpdate`.
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx:89` shows current transform middleware repeatedly calling `editor.read` and then `editor.update`.
- `apps/www/src/app/(app)/examples/plite/_examples/tables.tsx:115` shows the same repeated read pattern in delete middleware.
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx:96` shows clipboard `insertData(data, { editor, next })` with async `FileReader`.
- `packages/plite/test/query-extension-contract.ts:527` proves query middleware cannot mutate through `editor.update`.
- `packages/plite/test/generic-extension-namespace-contract.ts:254` already has negative type tests for invalid transform and normalizer surfaces.
- `packages/plite/test/extension-methods-contract.ts:742` covers same-name/latest extension and `enabled: false` tombstones.

## Lifecycle Coverage Map

| Surface                             | Current context                                      | Lifecycle                             | Target context                                                     | Decision                                      |
| ----------------------------------- | ---------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| `editor.read`                       | callback gets `state`                                | read                                  | keep `state`                                                       | keep                                          |
| `editor.update`                     | callback gets `transaction` named `tx` in examples   | update                                | keep `tx`                                                          | keep                                          |
| `extension.state` factory           | `(state, editor)`                                    | read group construction               | keep `(state, editor)`                                             | keep                                          |
| `extension.tx` factory              | `(transaction, editor)`                              | update group construction             | rename parameter examples to `tx`                                  | keep                                          |
| `extension.editor` factory          | `(editor)`                                           | long-lived editor helper construction | keep `(editor)`                                                    | keep, but avoid public examples unless needed |
| `extension.api`                     | static API object                                    | long-lived API namespace              | keep under `editor.api` and `editor.getApi(extension)`             | keep                                          |
| `extension.transforms.*`            | `{ editor, next, ...args }`                          | update middleware                     | `{ tx, editor, next, ...args }` after transaction routing is fixed | revise                                        |
| `extension.queries.*`               | `{ editor, next, ...args }`                          | read middleware                       | `{ state, editor, next, ...args }`                                 | revise                                        |
| `extension.normalizers.editor/node` | `{ tx, editor, next, ...args }` with restricted `tx` | update normalization                  | keep restricted `tx`                                               | keep                                          |
| `extension.clipboard.insertData`    | `(data, { editor, next })`                           | DOM/DataTransfer ingress, often async | `(data, { state, editor, next })`; no `tx`                         | revise                                        |
| `extension.operationMiddlewares`    | `({ editor, operation }, next)`                      | operation dispatch pipeline           | keep no `state`/`tx`                                               | keep                                          |
| `extension.commitListeners`         | `(commit, snapshot)`                                 | post-commit                           | keep no `state`/`tx`                                               | keep                                          |
| `extension.register`                | `{ editor, name, options, runtimeState, signal }`    | installation lifecycle                | keep no `state`/`tx`                                               | keep                                          |
| `extension.elements`                | declarative specs                                    | schema/spec registration              | keep no context                                                    | keep                                          |
| `editor.subscribe`                  | listener receives snapshot update path               | post-commit subscription              | keep no `state`/`tx`                                               | keep                                          |
| internal commands registry          | command context with `editor`                        | internal dispatch                     | do not expose as public DX                                         | keep internal                                 |
| internal capabilities registry      | currently backs clipboard and legacy-style lanes     | internal runtime registry             | do not expose public `capabilities`                                | keep internal or shrink later                 |

## Before / After Shapes

### Query Middleware

Current:

```ts
queries: {
  text: {
    string({ at, next, options }) {
      return `${next({ at, options })}!`
    },
  },
}
```

Target:

```ts
queries: {
  text: {
    string({ at, next, options, state }) {
      const selection = state.selection.get()

      if (!selection) {
        return next({ at, options })
      }

      return `${next({ at, options })}!`
    },
  },
}
```

Rule: use `next` for the query being intercepted. Use `state` for adjacent reads. Do not make `state.text.string(...)` magically bypass the same middleware; that hides recursion instead of teaching the middleware model.

### Transform Middleware

Current checklist example:

```ts
deleteBackward({ editor, next }) {
  const selection = editor.read((state) => state.selection.get())

  if (selection && RangeApi.isCollapsed(selection)) {
    const match = editor.read((state) =>
      state.nodes.find({
        match: (n) => NodeApi.isElement(n) && n.type === 'check-list-item',
      })
    )

    if (match) {
      const [, path] = match
      const start = editor.read((state) => state.points.start(path))

      if (PointApi.equals(selection.anchor, start)) {
        editor.update((tx) => {
          tx.nodes.set({ type: 'paragraph' })
          tx.selection.set(start)
        })
        return
      }
    }
  }

  next()
}
```

Target:

```ts
deleteBackward({ tx, next, unit }) {
  const selection = tx.selection.get()

  if (selection && RangeApi.isCollapsed(selection)) {
    const match = tx.nodes.find({
      match: (n) => NodeApi.isElement(n) && n.type === 'check-list-item',
    })

    if (match) {
      const [, path] = match
      const start = tx.points.start(path)

      if (PointApi.equals(selection.anchor, start)) {
        tx.nodes.set(
          { type: 'paragraph' } satisfies Partial<PliteElement>,
          {
            match: (n) => NodeApi.isElement(n) && n.type === 'check-list-item',
          }
        )
        tx.selection.set(start)
        return
      }
    }
  }

  next({ unit })
}
```

Implementation gate: this target is only valid if transform middleware execution is wrapped in the same transaction as the default transform. Current `executeTransformMiddleware` calls `executeCommand` without `implicitUpdate`, so this is not just a type edit.

### Clipboard Middleware

Current:

```ts
clipboard: {
  insertData(data, { editor, next }) {
    // parse DataTransfer
    editor.update((tx) => {
      tx.fragment.insert(fragment)
    })
    return true
  },
}
```

Target:

```ts
clipboard: {
  insertData(data, { editor, next, state }) {
    const selection = state.selection.get()

    if (!selection) {
      return next()
    }

    editor.update((tx) => {
      tx.fragment.insert(fragment)
    })
    return true
  },
}
```

No `tx` here. Clipboard handlers sit on a DOM/DataTransfer boundary and may cross async `FileReader` or upload boundaries. Holding a transaction open across that is a bug magnet.

### Normalizers

Current and target:

```ts
normalizers: {
  node({ entry, next, tx }) {
    const value = tx.value.get()
    tx.nodes.insert({ type: 'paragraph', children: [{ text: '' }] })
    next()
  },
}
```

Keep the restricted normalizer `tx`. Existing negative type tests already reject `tx.normalize`, `tx.withoutNormalizing`, `tx.operations.replay`, and whole-value replacement.

## Decision Brief

Principles:

- Lifecycle object first. `state` means read. `tx` means update. `editor` means long-lived runtime handle.
- No duplicate readable spellings for the same thing when one is enough.
- Do not add root `editor.state`. It is too easy to treat as always-current mutable state.
- Do not expose `tx` outside synchronous update lifecycle.
- Do not let Plate-shaped plugin sugar leak into raw Plite.

Viable options:

1. `editor` only everywhere.
   - Rejected. It keeps examples verbose and hides lifecycle legality.
2. `state` everywhere plus explicit `editor.update`.
   - Rejected. It is wrong for transform middleware because transforms are write hooks.
3. `tx` everywhere.
   - Rejected. It is wrong for query and clipboard lifecycle.
4. Lifecycle-specific context.
   - Accepted. It matches the existing `state`/`tx` split and keeps async boundaries honest.

## Ecosystem Evidence

Lexical:

- Source summary: `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`.
- Mechanism: commands and transforms run inside update context; reads and writes have synchronous legality boundaries.
- Plite target: `editor.read`, `editor.update`, `state` in read callbacks, `tx` in update callbacks.
- Reject: Lexical class nodes, `$` helpers, and command-first app API.
- Verdict: agree on lifecycle discipline, diverge on public style.

Tiptap:

- Source summary: `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`.
- Mechanism: extension packaging and command catalog make features discoverable.
- Plite target: keep extension packaging and `editor.api`, but make `editor.update` the write lifecycle.
- Reject: making commands the default mutation API.
- Verdict: partial.

Issue corpus:

- `docs/plite-issues/issue-intelligence-master-plan.md` says the corpus justifies replacing the execution/runtime model, not the JSON model.
- Older batches keep reinforcing plugin/render composition, paste, focus, history, delete, and input-runtime pressure.
- This plan does not claim any issue fixed.

ProseMirror:

- Source summary: `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`.
- Mechanism: commands receive current `state`; transactions own document, selection, marks, metadata, and mapping.
- Plite target: query middleware receives `state`; transform middleware receives update-local `tx`; operation middleware stays closer to operation dispatch than app command DX.
- Reject: ProseMirror plugin complexity, integer positions, and command-first public mutation style.
- Verdict: agree on transaction ownership and command-state context, diverge on public extension shape.

## Issue Accounting

No global issue ledger changes are required. The related rows are already classified in `docs/plite-issues/gitcrawl-v2-sync-ledger.md`, `docs/plite/ledgers/issue-coverage-matrix.md`, and `docs/plite/ledgers/fork-issue-dossier.md`. This plan changes API target shape; it does not prove an issue reproduction.

| Issue | Cluster                      | Claim                   | Why                                                                                                                                      | Proof route                   | V2 sync ledger                        | PR line             |
| ----- | ---------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------- | ------------------- |
| #3222 | plugin/API design            | Related                 | Extension context cleanup answers plugin-author pressure, but it does not close the historical plugin design discussion.                 | plan/API proof only           | existing `cluster-synced` row         | related matrix only |
| #4089 | higher-level plugins API     | Related                 | The plan keeps raw Plite unopinionated and gives extension lifecycle objects; it does not add product-level plugin bundles.              | plan/API proof only           | existing `cluster-synced` row         | related matrix only |
| #4181 | custom key behavior          | Not claimed             | The row is already triaged as likely invalid; transform middleware covers Plite commands, not component-level keypress feature requests. | no-claim                      | existing `triage-closed` row          | none                |
| #3177 | render composition           | Related                 | Extension-owned rendering direction reduces prop-level composition pressure, but this plan does not implement renderer composition.      | plan/API proof only           | existing cluster row in frozen ledger | related matrix only |
| #4721 | async Editable events        | Not claimed             | Clipboard/transform/query context does not define async event handler return semantics.                                                  | no-claim                      | existing `cluster-synced` row         | none                |
| #5233 | clipboard fragment format    | Already fixed elsewhere | This plan preserves clipboard boundary direction but adds no new transport proof.                                                        | existing clipboard proof      | existing `fixes-claimed` row          | no change           |
| #4569 | insertData docs              | Already fixed elsewhere | This plan changes future callback context, not the already-claimed docs fix.                                                             | existing docs proof           | existing `fixes-claimed` row          | no change           |
| #1024 | clipboard schema boundary    | Related                 | `state` in clipboard context supports read checks; MIME/document typing remains a DOM/model transport issue.                             | plan/API proof only           | existing `cluster-synced` row         | related matrix only |
| #2405 | command-scoped normalization | Related                 | Restricted normalizer `tx` is preserved; command-specific rule evaluation/perf remains benchmark work.                                   | plan/API proof only           | existing `cluster-synced` row         | related matrix only |
| #2288 | range operations             | Related                 | Transaction context direction aligns with range-capable ops, but this plan adds no operation exposure.                                   | existing core proof plus plan | existing `cluster-synced` row         | no change           |
| #1770 | operation composition        | Related                 | Keeping operation middleware low-level avoids pretending transform context solves operation merging.                                     | existing core proof plus plan | existing `cluster-synced` row         | no change           |
| #3874 | history atomic groups        | Related                 | `tx` transform context is compatible with transaction-aware history, but no history API closure is claimed.                              | plan/API proof only           | existing `cluster-synced` row         | related matrix only |
| #5080 | query traversal              | Already fixed elsewhere | Query middleware `state` does not change traversal order.                                                                                | existing query proof          | existing `fixes-claimed` row          | no change           |
| #5684 | query traversal ambiguity    | Not claimed             | The issue still needs a concrete reproduction; adding `state` to query middleware is not a traversal fix.                                | no-claim                      | existing `issue-reviewed` row         | none                |

## Type Test Requirements

Add or revise negative type tests in the execution plan:

- Query middleware context exposes `state` and does not expose `tx`.
- Query middleware can call `next` once and cannot mutate with `editor.update`.
- Query generator cleanup still cannot mutate.
- Transform middleware context exposes `tx`; examples should not call `editor.read` for routine reads.
- Transform middleware `tx` includes read groups and write groups.
- Transform middleware does not expose a separate `state` duplicate.
- Clipboard context exposes `state` and does not expose `tx`.
- Normalizer context keeps restricted `tx`; no whole-value replace, no recursive normalize, no replay.
- Operation middleware context does not expose `tx`.
- Disabled extensions are erased from installed extension types.
- Latest same-name extension wins; no `replaces` field.
- `editor.getApi(extension)` returns the typed API for installed extensions and rejects non-installed extensions.

Exact files:

- `packages/plite/test/extension-methods-contract.ts`: transform middleware `tx` context, transaction routing, no double `next`, same-name/latest and `enabled: false`.
- `packages/plite/test/query-extension-contract.ts`: query middleware `state` context, recursion policy, mutation rejection, generator cleanup rejection.
- `packages/plite/test/generic-extension-namespace-contract.ts`: declaration merging, disabled extension type erasure, `getApi(extension)` typing, negative context assertions.
- `packages/plite/test/generic-extension-install-contract.ts`: installed extension inference and tombstone behavior.
- `packages/plite/test/normalization-contract.ts`: restricted normalizer `tx` stays restricted.
- `packages/plite-dom/test/clipboard-boundary.ts` and `packages/plite/test/clipboard-contract.ts`: clipboard `state` read plus fresh update writes, no async `tx`.

## Example Update Requirements

Update examples after implementation:

- `site/examples/ts/check-lists.tsx`: inline transform logic should use `tx.selection.get`, `tx.nodes.find`, `tx.points.start`, `tx.nodes.set`, `tx.selection.set`.
- `site/examples/ts/tables.tsx`: delete/backspace/enter boundary logic should live in `deleteBackward`, `deleteForward`, and `insertBreak` transform middleware, not keydown event branches.
- `site/examples/ts/images.tsx`: clipboard should use `state.selection.get` for read checks and `editor.update` for sync writes; async `FileReader` writes must start a fresh `editor.update`.
- Public examples should prefer extension callbacks over `renderElement` / `renderLeaf` props when the extension owns rendering. Raw `<Editable renderElement>` remains acceptable only as a low-level escape hatch example.

## Open Risks

- Transform middleware cannot get `tx` until the dispatch path is guaranteed to run inside an update transaction. Current `executeTransformMiddleware` does not force `implicitUpdate`.
- Query middleware with full `state` can recursively call the same query through `state`. The model should be documented and tested: `next` is the continuation for the current query.
- Clipboard `state` is a snapshot-time read. Async callbacks must use a fresh `editor.read` or `editor.update`.
- Keeping `editor` in every context is useful for `editor.api`, but examples must not teach root editor mutation as the normal path.

## Maintainer Objection Ledger

| Change                            | Strong objection                                                         | Best no-change alternative                                     | Tradeoff                                                       | Answer                                                                                                                    | Verdict |
| --------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------- |
| Query middleware gets `state`     | "This makes recursive query calls easier to write by accident."          | Keep `editor.read` inside query middleware.                    | The target adds context but needs a same-query recursion rule. | Keep `next` as the only continuation for the intercepted query; use `state` for adjacent reads. Add tests.                | keep    |
| Transform middleware gets `tx`    | "This is not true until transform middleware runs in an update."         | Keep `{ editor, next }` and let examples call `editor.update`. | Requires command/transform dispatch refactor.                  | Do the dispatch refactor. `state` in transforms would teach the wrong lifecycle.                                          | keep    |
| Clipboard gets `state`, not `tx`  | "Paste handlers often write immediately, so `tx` would be convenient."   | Give clipboard `tx` and ban async use by docs.                 | Convenient sync paste, dangerous async paste.                  | Clipboard is host ingress. Reads can use `state`; writes start `editor.update`.                                           | keep    |
| Operation middleware gets no `tx` | "Advanced plugins may want to inspect state while rewriting operations." | Add `state` or `tx` to operation context.                      | More power, higher recursion/corruption risk.                  | Keep operation middleware about operation dispatch. Add a later dedicated low-level hook only if a real package needs it. | keep    |
| No root `editor.state`            | "It would be shorter than `editor.read`."                                | Add `editor.state.selection.get()`.                            | Shorter reads, stale-read ambiguity.                           | Keep `editor.read` as the coherent read boundary. Middleware context is the ergonomic shortcut.                           | keep    |

## High-Risk Deliberate Mode

Trigger: public API and extension substrate change.

Pre-mortem:

- Transform middleware exposes `tx` but is not actually update-local, causing nested updates or stale reads.
- Query middleware `state` causes accidental same-query recursion and confusing stack overflows.
- Clipboard examples accidentally hold transaction objects across async file reads.

Proof matrix:

| Risk                     | Required proof                                                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transform lifecycle      | Unit tests prove `deleteBackward`, `deleteForward`, `insertBreak`, `insertText`, `insertFragment`, and node transforms receive update-local `tx`; default `next` shares the same transaction. |
| Query recursion          | Unit tests prove `next` continues current query, `state` adjacent reads work, and mutation from query/generator cleanup still throws.                                                         |
| Clipboard async boundary | Clipboard tests prove sync writes use fresh `editor.update`; async examples do not capture `tx`.                                                                                              |
| Type erasure             | Negative type tests prove disabled extensions are excluded and non-installed `getApi` fails.                                                                                                  |
| Examples                 | Checklists, tables, images, forced-layout, and markdown examples use inline lifecycle objects without helper bloat.                                                                           |
| Public surface           | Public-surface tests reject legacy extension `methods`, extension `commands`, public `capabilities`, and helper namespaces that compete with `editor.api` / `state` / `tx`.                   |

Rollback/hard-cut answer:

- No compatibility aliases. If implementation proves `tx` transform middleware cannot be made coherent, drop `tx` from transforms and keep `{ editor, next }` temporarily; do not ship a fake `state` compromise.

## Implementation Phases

1. Transform dispatch: make transform middleware execute inside the active update transaction and pass `tx`.
2. Query context: pass `state` to query middleware and test recursion/mutation rules.
3. Clipboard context: pass `state`, keep writes through `editor.update`, and update async examples.
4. Type surface: add negative type tests for context availability, disabled extensions, latest-name wins, and `getApi`.
5. Examples: rewrite checklists, tables, images, and forced-layout with inline lifecycle logic.
6. Hard-cut guard: keep old `methods`, `commands`, public `capabilities`, and `Editor`/`DOMEditor`/`HistoryEditor` helper alternatives out of public docs/examples.

## Verification Gates

Planning artifact:

```txt
node tooling/scripts/completion-check.mjs
```

Implementation gates for a later `ralph` run:

```txt
cd Plate repo root && bun test ./packages/plite/test/extension-methods-contract.ts ./packages/plite/test/query-extension-contract.ts ./packages/plite/test/generic-extension-namespace-contract.ts ./packages/plite/test/generic-extension-install-contract.ts ./packages/plite/test/normalization-contract.ts
cd Plate repo root && bun test ./packages/plite/test/clipboard-contract.ts ./packages/plite-dom/test/clipboard-boundary.ts
cd Plate repo root && bun --filter plite typecheck
cd Plate repo root && bun --filter plite-dom typecheck
```

## Pass State Ledger

| Pass                            | Status   | Evidence                                                                                                                                         | Next |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| Activation reset                | complete | `active goal state` rewritten to this plan                                                           | none |
| Current-state read              | complete | live `Plate repo root` source, examples, tests, compiled research                                                                                  | none |
| Related issue discovery         | complete | live, sync, coverage, and dossier rows read for #3222, #4089, #4181, #3177, #4721, #5233, #4569, #1024, #2405, #2288, #1770, #3874, #5080, #5684 | none |
| Issue ledger sync               | complete | no global ledger edit required; all rows are related, not claimed, or already claimed elsewhere                                                  | none |
| Decision brief pressure pass    | complete | lifecycle-specific context accepted; universal `state`, universal `tx`, root `editor.state`, and editor-only contexts rejected                   | none |
| Ecosystem pass                  | complete | Lexical, Tiptap, and ProseMirror compiled evidence mapped to decisions                                                                           | none |
| Plite maintainer objection pass | complete | objection ledger added                                                                                                                           | none |
| High-risk deliberate mode       | complete | pre-mortem and proof matrix added                                                                                                                | none |
| Type/API proof pass             | complete | exact test files mapped                                                                                                                          | none |
| Example/DX pass                 | complete | exact example update targets listed                                                                                                              | none |
| Closure gate                    | complete | score raised to 0.93; remaining risks converted to implementation gates                                                                          | none |

## Final Score

| Dimension              | Score | Why                                                                                                                            |
| ---------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------ |
| Plite-close DX         |  0.92 | Lifecycle context removes repeated `editor.read` without adding root shortcuts or Plate-shaped product APIs.                   |
| Architecture coherence |  0.94 | Read callbacks get `state`, update callbacks get `tx`, post-commit callbacks get commit data, registration gets `editor`.      |
| Regression safety      |  0.89 | Transform routing remains the main risk, but it is an explicit first implementation gate with exact tests.                     |
| Migration backbone     |  0.92 | Extension APIs, typed groups, latest-name-wins, `enabled: false`, clipboard, history, and operation boundaries are classified. |
| Research support       |  0.94 | Lexical, ProseMirror, Tiptap, live Plite source, and issue corpus all point to lifecycle-specific context.                  |
| Example quality        |  0.91 | Checklists, tables, images, and normalizers have direct target snippets and proof files.                                       |

Overall: 0.93 ready.

## Final Handoff

Ready for `ralph` execution when the user asks to build.

- `queries`: revise to `{ state, editor, next, ...args }`; `next` remains the current-query continuation.
- `transforms`: revise to `{ tx, editor, next, ...args }`; first implementation step must make transform middleware transaction-local.
- `normalizers`: keep restricted `tx`.
- `clipboard`: revise to `{ state, editor, next }`; no `tx`.
- `operationMiddlewares`: keep `{ editor, operation }, next`.
- `commitListeners`: keep `(commit, snapshot)`.
- `register`: keep `{ editor, name, options, runtimeState, signal }`.
- `api`: keep `editor.api` and `editor.getApi(extension)`.
- `state` root shortcut: cut.
- `Editor` / `DOMEditor` / `HistoryEditor` public alternatives: cut from the target public path.
- Issue accounting: no new fixed issue claims; all related rows are classified.

## Ralph Execution Grounding

Task statement: implement the accepted extension lifecycle context API in `Plate repo root`.

Desired outcome:

- Query middleware receives `state`.
- Transform middleware receives transaction-local `tx`.
- Clipboard middleware receives `state` and never receives `tx`.
- Normalizer restricted `tx` stays intact.
- Public alternatives remain cut.
- Examples and typed tests prove the new shape.

Known facts:

- `tx` is built from `state` plus write groups in `packages/plite/src/core/public-state.ts`.
- Current transform middleware is registered in `packages/plite/src/core/editor-extension.ts` and dispatched through `packages/plite/src/core/transform-middleware.ts`.
- Current command execution only starts an implicit update when `executeCommand(..., { implicitUpdate: true })` is used.
- Current query middleware already rejects `editor.update` from query execution.
- Current clipboard examples may cross async `FileReader` boundaries.

Constraints:

- Use vertical TDD slices.
- Keep example logic inline when used once.
- Prefer TypeScript inference, `satisfies`, and type guards over casts.
- Do not add compatibility aliases.
- Do not rerun related-issue discovery unless the issue surface or claim set changes.

Likely touchpoints:

- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/core/editor-extension.ts`
- `packages/plite/src/core/transform-middleware.ts`
- `packages/plite/src/core/query-middleware.ts`
- `packages/plite/src/core/command-registry.ts`
- `packages/plite/test/extension-methods-contract.ts`
- `packages/plite/test/query-extension-contract.ts`
- `packages/plite/test/generic-extension-namespace-contract.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/tables.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`

## Ralph Execution Ledger

| Time                 | Pass                 | Status   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Next                   |
| -------------------- | -------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 2026-05-18T03:07:10Z | ralph activation     | complete | `active goal state` set to `pending`; continuation prompt written.                                                                                                                                                                                                                                                                                                                                                                                 | `tdd-pass`             |
| 2026-05-18T03:07:10Z | tdd-pass             | complete | RED: `bun test ./packages/plite/test/extension-methods-contract.ts` failed because `tx` was undefined in transform middleware. GREEN: active update view threaded into transform middleware and the focused test passed.                                                                                                                                                                                                                                                                       | implementation slice   |
| 2026-05-18T03:13:00Z | implementation-slice | complete | Query middleware now receives `state`; transform middleware receives transaction-local `tx`; clipboard middleware receives read-only `state` without `tx`; negative type tests cover all three contexts.                                                                                                                                                                                                                                                                                       | Example and docs sync. |
| 2026-05-18T03:23:18Z | example-doc-sync     | complete | `check-lists`, `tables`, `markdown-shortcuts`, `inlines`, and `richtext` extension transforms use `tx`; Editable docs show transform middleware with `tx`; surface contract updated to enforce that shape.                                                                                                                                                                                                                                                                                     | Final gates.           |
| 2026-05-18T03:23:18Z | final-gates          | complete | `bun lint:fix`; `bun test ./packages/plite/test/extension-methods-contract.ts`; `bun test ./packages/plite/test/query-extension-contract.ts`; `bun --filter plite typecheck`; `bun --filter plite-dom typecheck`; `bun --filter plite-react typecheck`; `bun typecheck:site`; `bun test ./packages/plite/test/clipboard-contract.ts`; `bun test ./packages/plite-dom/test/clipboard-boundary.ts`; `cd packages/plite-react && bun test:vitest -- test/surface-contract.test.tsx`; `bun check`. | Mark completion done.  |
