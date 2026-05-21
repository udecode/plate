# Slate v2 read access DX ralplan

Date: 2026-05-18
Status: done
Owner: Slate Ralplan planning only
Completion id: `019e1fc0-dba0-7de1-9236-b484a144cda6`
Current pass: closure-final-gates
Score: 0.90, ready for Ralph handoff

## Verdict

Harsh answer: I do not like the current example shape.

This is too much ceremony for a Slate author:

```ts
const selection = editor.read((state) => state.selection.get());
```

But the fix should not be `editor.state.selection.get()`. That is the wrong
steal from ProseMirror. ProseMirror commands receive an immutable `state`
argument; they do not read mutable editor root state. Lexical also does not
teach `editor.state.selection`; it teaches contextual reads and `$getSelection`
inside `read`, `update`, or command listener scope.

Best initial target:

```ts
deleteBackward({ editor, state, next, unit }) {
  const selection = state.selection.get()

  if (selection && RangeApi.isCollapsed(selection)) {
    const cell = state.nodes.find({
      match: (n) => NodeApi.isElement(n) && n.type === 'table-cell',
    })

    if (cell) {
      const start = state.points.start(cell[1])

      if (PointApi.equals(selection.anchor, start)) {
        return
      }
    }
  }

  return next({ unit })
}
```

Keep `editor.read((state) => ...)` as the canonical outer read boundary. Add
`state` to transform middleware context first. Do not widen this to every
lifecycle context in the same slice.

## Intent And Boundary

| Field                | Record                                                                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent               | Reduce Slate v2 example/API ceremony after moving model behavior into transform middleware.                                                                                                                              |
| Desired outcome      | Transform middleware can read common model state without repeating `editor.read((state) => ...)` for every selection/node/point lookup.                                                                                  |
| In scope             | Transform middleware context shape, docs/examples teaching shape, and focused type/surface contracts.                                                                                                                    |
| Non-goals            | Root `editor.state`, query/clipboard/operation/normalizer context expansion in this slice, restoring mutable public editor fields, static `Editor.*` helper revival, Plate-style helpers, or local example helper piles. |
| Decision boundary    | Breaking API change is allowed for transform middleware if it preserves read/update discipline and improves Slate-close DX. Other lifecycle contexts require a separate pass with call-site evidence.                    |
| User decision needed | None for the current verdict; the plan now chooses transform middleware only for the first implementation slice.                                                                                                         |

## Current Live State

| Surface            | Evidence                                                                                                                                                                                                 | Current shape                                                                                                                                  | Verdict                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Table example      | `/Users/zbeyens/git/slate-v2/site/examples/ts/tables.tsx:115`                                                                                                                                            | Transform handlers repeatedly call `editor.read((state) => ...)` for selection, cell lookup, and point lookup.                                 | Correct owner, mediocre DX.                                                                         |
| State view type    | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:466`                                                                                                                                | `EditorCoreStateView` already owns `selection`, `nodes`, `points`, `ranges`, `schema`, etc.                                                    | Reuse this as contextual `state`; do not invent a second state shape.                               |
| Runtime state view | `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1356`; `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1531`                                                   | `state.selection.get()` already exists inside the read view, and `editor.read` passes that view to a callback.                                 | The missing piece is passing that view into middleware context.                                     |
| Lexical            | `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1375`; `/Users/zbeyens/git/lexical/packages/lexical-website/docs/concepts/selection.md:61`                                             | `editor.read(...)` flushes pending updates and selection is read through `$getSelection()` inside `read`, `update`, or command listener scope. | Steal contextual read legality; reject `$` helper naming.                                           |
| ProseMirror        | `/Users/zbeyens/git/raw/prosemirror/packages/state/src/transaction.ts:18`; `/Users/zbeyens/git/raw/prosemirror/packages/commands/src/commands.ts:9`                                                      | Commands receive `state`; commands inspect `state.selection`; transactions track doc/selection/marks/meta.                                     | Steal command-context `state`; reject root mutable `editor.state`.                                  |
| Tiptap             | `/Users/zbeyens/git/tiptap/packages/core/src/types.ts:615`; `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:112`; `/Users/zbeyens/git/tiptap/packages/core/src/commands/splitBlock.ts:35` | Command props carry `editor`, `tr`, `commands`, `chain`, `state`, and `view`; command examples destructure `state` and `tr`.                   | Supports contextual command bag naming; raw Slate should not copy Tiptap's command catalog as core. |

## Decision Brief

Principles:

1. The read boundary must stay explicit.
2. Transform middleware should feel like old Slate method override DX, not like a React render callback.
3. Do not extend the editor root with live state namespaces.
4. Do not add helper piles just to hide the API.
5. Extension state groups must remain typed and composable.

Top drivers:

1. Examples are public API pedagogy.
2. Model behavior now lives in `transforms.*`, so the transform authoring path must be pleasant.
3. ProseMirror/Lexical both prove contextual state access is normal; neither justifies `editor.state`.

Options:

| Option                                                        | Pros                                                                              | Cons                                                                                                                                                                                       | Verdict                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Keep only `editor.read((state) => ...)`                       | Coherent and already works.                                                       | Repetitive in transform middleware; makes examples look heavier than legacy Slate.                                                                                                         | reject as the only shape |
| Add `editor.state.selection.get()`                            | Shortest call site.                                                               | Looks like a root live-state field; weakens read/update discipline; conflicts with prior root hard cuts.                                                                                   | reject                   |
| Add root helpers like `editor.getSelection()`                 | Short and familiar.                                                               | Reopens root method sprawl and duplicates state groups one helper at a time.                                                                                                               | reject                   |
| Use one scoped `editor.read(...)` block inside each transform | No public API change.                                                             | Still makes transform middleware authors step out to a read callback, encourages object packing just to move values back to the handler, and does not teach the lifecycle context cleanly. | reject as final DX       |
| Add one-shot `editor.read.*` helpers                          | Keeps the word `read`.                                                            | Function-object namespace is odd; encourages many separate reads; extension group typing gets harder.                                                                                      | defer                    |
| Add `state` to middleware context                             | ProseMirror-like command DX; reuses existing `EditorStateView`; keeps root clean. | Middleware context grows; docs must explain `state` is read-only and contextual.                                                                                                           | choose                   |

## API Target

Current:

```ts
deleteBackward({ editor, next, unit }) {
  const selection = editor.read((state) => state.selection.get())
  const cell = editor.read((state) => state.nodes.find({ match }))
  const start = editor.read((state) => state.points.start(cellPath))
}
```

Target:

```ts
deleteBackward({ editor, state, next, unit }) {
  const selection = state.selection.get()
  const cell = state.nodes.find({ match })
  const start = cell ? state.points.start(cell[1]) : null
}
```

Middleware context target:

```ts
export type EditorTransformMiddlewareContext<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
> = TArgs & {
  editor: TEditor;
  state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>;
  next: EditorTransformNext<TArgs>;
};
```

Exact generic spelling needs live-source design in Ralph; the law is that
`state` is the installed read view for that editor and extension set.

## Ecosystem Strategy Synthesis

| System           | Source                                                                                                                                                                                                   | Mechanism                                                                                                                                      | Avoids                                                    | Steal                                                          | Reject                                                             | Slate target                                                                               | Verdict |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------- |
| ProseMirror      | `/Users/zbeyens/git/raw/prosemirror/packages/state/src/transaction.ts:18`; `/Users/zbeyens/git/raw/prosemirror/packages/commands/src/commands.ts:9`                                                      | Commands receive immutable `state`; mutations go through `dispatch(state.tr...)`; transactions track document, selection, marks, and metadata. | App code reaching into live mutable editor root state.    | Middleware handlers receive contextual `state`.                | Integer positions, plugin complexity, root mutable `editor.state`. | `transforms.*({ state, editor, next })`.                                                   | agree   |
| Lexical          | `/Users/zbeyens/git/lexical/packages/lexical/src/LexicalEditor.ts:1375`; `/Users/zbeyens/git/lexical/packages/lexical-website/docs/concepts/selection.md:61`                                             | Reads happen inside `read`/`update`; selection helper is legal only in contextual scopes.                                                      | Stale reads and mutation outside lifecycle.               | Contextual read legality and command-listener read ergonomics. | `$` helper naming and class-node model.                            | `state` view passed to Slate middleware; keep `editor.read` outside middleware.            | partial |
| Tiptap           | `/Users/zbeyens/git/tiptap/packages/core/src/types.ts:615`; `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:112`; `/Users/zbeyens/git/tiptap/packages/core/src/commands/toggleMark.ts:41` | Commands receive a contextual props bag with `state`, `tr`, `editor`, `commands`, `chain`, and `view`.                                         | Repeating root editor lookups at every command call site. | Contextual command props and familiar `state` naming.          | Flat command catalog as raw Slate core, chain-first ceremony.      | Keep Slate transform middleware primitive, but pass `state` as the contextual read handle. | agree   |
| Current Slate v2 | `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:466`; `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1356`                                                    | `EditorStateView` already groups read APIs; transform middleware currently receives `editor` and must call `editor.read`.                      | Rebuilding the read surface from scratch.                 | Reuse existing `EditorStateView`.                              | Duplicating it under `editor.state`.                               | Add `state` to middleware context.                                                         | agree   |

## Research Ecosystem Refresh Pass

Status: complete.

Research-wiki mode: maintain. The existing editor-architecture research lane is
already the right evidence layer for this question, so this pass refreshed the
compiled decision pages and live local sources instead of opening a new full
corpus ingest.

Compiled pages checked:

- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
- `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`
- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
- `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`
- `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`
- `docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md`

Live-source refresh:

- Slate v2 already names the read callback value `state` and types it as
  `EditorStateView`.
- Slate v2 transform middleware currently passes `{ editor, next, ...args }`;
  adding `state` is a small context expansion, not a new root API.
- Slate v2 query middleware also passes `{ editor, next, ...args }`, but the
  intent pass still keeps query middleware out of scope because query recursion
  semantics need separate review.
- ProseMirror commands use `state` as the command-context read object and
  mutation goes through `dispatch(state.tr...)`.
- Tiptap command props use `state` plus `tr`, `editor`, `commands`, `chain`,
  and `view`; this supports `state` as a contextual command name but is too
  product-shaped for raw Slate core.
- Lexical proves active read/update/command context legality, not `state`
  naming. Its `$getSelection()` style remains a reject for Slate.

Naming challenge:

| Candidate     | Decision | Why                                                                                                                             |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `state`       | Keep     | Matches current `editor.read((state) => ...)`, current `EditorStateView`, ProseMirror command naming, and Tiptap command props. |
| `read`        | Reject   | Sounds like an action or namespace, not the object being read from. `read.selection.get()` is cute but awkward.                 |
| `view`        | Reject   | Too vague in an editor stack where "view" often means DOM/view runtime.                                                         |
| `snapshot`    | Reject   | False. Current Slate `EditorStateView` methods read current editor state; this is not an immutable snapshot.                    |
| `editorState` | Reject   | More verbose, and it invites a false ProseMirror-style immutable-object mental model.                                           |

Research verdict:

- `state` is still the best name.
- The docs must call it a contextual read view, not a snapshot.
- Transform middleware only is still the right first scope.
- Do not add `editor.state`, `editor.getSelection()`, or `editor.read.*` in
  this plan.

## Rejected Shortcuts

- `editor.state.selection.get()`: too attractive, too dangerous. It looks like
  ProseMirror but without ProseMirror's immutable `EditorState` object.
- `editor.selection.get()`: worse; it revives root editor field/method sprawl.
- `Editor.getSelection(editor)`: not the teaching path for this rewrite.
- One scoped `editor.read(...)` block per transform: acceptable as a local
  migration fallback, but not the target DX. It still forces object packing and
  callback ceremony in the exact lifecycle that should already own context.
- Local helpers like `isAtStartOfTableCell(editor)`: good only when reused;
  bad as the default example style because they hide the real API.
- `editor.read.selection.get()`: maybe useful later, but not first. It is less
  clearly Slate-ish than passing `state` into the context that already owns the
  transform lifecycle.

## Testing And Proof Target

Ralph implementation should add/update:

- `packages/slate/test/extension-methods-contract.ts`: transform middleware
  context receives typed `state`; `state.selection.get()` and extension state
  groups are available.
- negative type tests: `state` is read-only inside transform middleware.
- `packages/slate-react/test/surface-contract.tsx`: examples teach
  contextual `state` in transform middleware, not root `editor.state`.
- examples:
  - `site/examples/ts/tables.tsx`
  - `site/examples/ts/markdown-shortcuts.tsx`
  - `site/examples/ts/richtext.tsx`
- docs:
  - `docs/concepts/08-plugins.md`
  - `docs/libraries/slate-react/editable.md`
  - `docs/walkthroughs/05-executing-commands.md`

Fast gates from `/Users/zbeyens/git/slate-v2`:

- `bun test ./packages/slate/test/extension-methods-contract.ts`
- `bun --filter slate-react test:vitest -- surface-contract`
- `bun --filter slate typecheck`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun check`

## Related Issue Discovery Pass

Status: complete.

ClawSweeper mode: applied through durable local ledgers only. No broad live
GitHub search was needed because this is an API/example authoring refinement
inside already-reviewed extension/read surfaces.

Search terms and ledgers read:

- `editor.read`, `state.selection`, `state.nodes`, `extension composition`,
  `transform middleware`, `#3802`, `#3557`, `#3177`, `#5961`, `#5080`.
- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/references/pr-description.md`

Issue matrix:

| Issue                                 | Cluster                              | Claim                         | Why                                                                                                                                                                                                         | Proof route                                                                                                 | V2 sync ledger                                                                                          | PR line                                                                                  |
| ------------------------------------- | ------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `#3802`                               | unified-extension-composition-api-dx | Related, unchanged            | Contextual middleware `state` strengthens the creation-time extension/read DX direction, but it does not by itself close the object-reference/documentation quirk or prove stale wrapper surfaces are gone. | Type/runtime proof after implementation: public-surface and extension context contracts in `.tmp/slate-v2`. | Existing row at `docs/slate-issues/gitcrawl-v2-sync-ledger.md:564` already records `planning-reviewed`. | Existing related row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:210`; no change. |
| `#3557`                               | extension-method-overrides           | Related, unchanged            | This plan improves the authoring path for transform middleware reads, but the issue is broader legacy method-override pressure for insert-node/fragment behavior.                                           | Full extension middleware coverage remains the owner.                                                       | Existing sync/coverage rows already classify method-override pressure as related.                       | Existing related row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:268`; no change. |
| `#3177`                               | render-extension-composition         | Related, unchanged            | The plan touches extension authoring ergonomics, not renderer composition closure. It must not resurrect raw renderer registries.                                                                           | Renderer/example cleanup and proof remain separate.                                                         | Existing row at `docs/slate-issues/gitcrawl-v2-sync-ledger.md:594`.                                     | Existing related row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:208`; no change. |
| `#5961`                               | onkeydown-render-warning             | Related, not claimed          | Moving model behavior out of raw keydown examples is adjacent, but this plan keeps `Editable onKeyDown` for UI shortcuts and does not reproduce the stale DevTools warning.                                 | Repro-first browser proof only.                                                                             | Existing row at `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39`.                                      | Existing related row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:209`; no change. |
| `#5080` / `#5684` / `#5028` / `#3885` | editor-nodes-query-dx                | Existing query rows unchanged | `state.nodes.find(...)` uses the already accepted query surface. This plan does not change traversal order, pass filtering, or docs for `Editor.nodes`.                                                     | Existing query-contract proof for `#5080`; no new proof route.                                              | Existing rows cover these query issues.                                                                 | Existing rows at `docs/slate-v2/ledgers/issue-coverage-matrix.md:125-128`; no change.    |

Claim result:

- New fixed claims: `0`.
- New improved claims: `0`.
- Related classifications changed: `0`.
- Fork issue dossier updates: none; existing `#3802`, `#3557`, `#3177`,
  `#5961`, and query-DX sections already cover this pressure.
- PR description updates: none; accepted API shape should change only after
  later implementation or final API-sync pass.

## Full Issue Ledger Pass

Status: complete.

Full local issue-doc scan:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/test-candidate-map.md`
- `docs/slate-issues/test-candidate-map/`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`

Additional rows surfaced by the full scan:

| Issue / Requirement | Classification           | Decision                                                                                                                                                                                                          |
| ------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#3222`             | Related, unchanged       | Plugin-design pressure is real, but contextual middleware `state` is a substrate DX refinement, not a higher-level plugin registry. Existing sync row keeps this in `v2-input-runtime` / plugin-surface pressure. |
| `#4089`             | Related, unchanged       | Higher-level plugin API pressure supports first-class extension composition, but this plan does not add a plugin registry above `extensions`. Keep existing cluster-sync status.                                  |
| `#4181`             | Not claimed, unchanged   | Higher-level keypress hooks remain likely-invalid / repro-first. This plan keeps UI shortcuts in `Editable onKeyDown` and does not add a keypress API.                                                            |
| `R11`               | Applies                  | Contextual middleware `state` tightens extension/API authoring without adding root editor magic.                                                                                                                  |
| `R12`               | Applies                  | Example readability is a supported surface, but docs/examples debt must not force a root `editor.state` API into core.                                                                                            |
| `R6` / `R7`         | Related but not expanded | Selection and input runtime ownership constrain examples, but this plan only changes the transform middleware read context, not DOM selection or input semantics.                                                 |

No additional fixed or improved issue claims are justified. The full ledger scan
reinforces the earlier boundary: contextual middleware `state` is API-DX
substrate work under the already-classified extension/plugin pressure, not a
closure claim for plugin registries, keypress hooks, DOM selection, or input
runtime issues.

Issue sync result:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`: unchanged; candidate rows
  already classify `#3222`, `#4089`, and `#4181`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`: unchanged; matrix-only
  non-claim row already includes `#3222` and `#4089`, while `#4181` stays
  triage-closed in the sync ledger.
- `docs/slate-v2/ledgers/fork-issue-dossier.md`: unchanged; Plate-fit broader
  pass already reviewed `#3222`, `#3802`, `#3557`, and `#4089`.
- `docs/slate-v2/references/pr-description.md`: unchanged; no accepted API
  shape or proof status changes until implementation.

## Intent Boundary And Decision Brief Pass

Status: complete.

Evidence refreshed:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/tables.tsx:112`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:789`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:928`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts:390`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/query-middleware.ts:146`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1531`

Pressure-test result:

The weak assumption was that `state` means an immutable ProseMirror-style
`EditorState`. That is not true in current Slate v2. `EditorStateView` is a
contextual read-view API whose methods read current editor state. That is fine
for middleware DX, but the docs and tests must not call it a frozen snapshot.

Important implementation boundary:

- Do not wrap transform middleware handlers in `editor.read(...)`. Transform
  handlers must still be allowed to call `next()` and therefore enter writes.
- Implementation needs an internal contextual state-view provider for transform
  middleware, likely the same view shape used by `editor.read`, without turning
  transform middleware execution into a read-only scope.
- The read contract becomes: app/outer code uses `editor.read((state) => ...)`;
  transform middleware uses `context.state` as the sanctioned contextual read
  handle.

Viable options after pressure:

| Option                                                                                        | Decision                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add `state` to transform middleware only                                                      | Chosen. It fixes the example pain with the smallest public API expansion.                                                                                                  |
| Add `state` to transforms, queries, clipboard, operation middleware, and normalizers together | Rejected for this slice. That is too broad and would need separate semantics for pre-operation state, query recursion, clipboard DOM ingress, and normalizer transactions. |
| Add root `editor.state`                                                                       | Rejected. It makes live root state look app-facing and undermines the hard cut away from mutable editor fields.                                                            |
| Add `editor.read.*` one-shot helpers                                                          | Deferred. It may still be useful after call-site audit, but it does not solve transform middleware authoring as directly as contextual `state`.                            |

Resolved boundary:

- Contextual `state` applies to transform middleware first.
- Query middleware, clipboard middleware, operation middleware, commit listeners,
  and normalizers stay unchanged in this plan.
- If a later pass finds repeated read ceremony in another lifecycle context, it
  gets its own evidence row and context-specific rules.

Consequences:

- Examples become shorter without local helper piles.
- `state` in middleware must be documented as a read view, not as an immutable
  snapshot.
- Tests must cover typing and runtime context shape for transforms.
- Implementation must avoid stale-state confusion around `next()`: examples
  should read before deciding whether to delegate; code that needs post-`next`
  state should call a fresh read after delegation in a separately reviewed
  pattern.

Remaining ambiguity:

- None that requires a user decision before the next pass. Maintainer/steelman
  can still challenge the public context expansion and teaching cost.

## Maintainer Steelman Pass

Status: complete.

| Decision                                    | Strongest fair objection                                                                                                         | Best no-change case                                                                                          | Cost / risk                                                                                                           | Answer                                                                                                                                                                                                                                                                                                                     | Verdict         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Add `state` to transform middleware context | "You're adding public API to save a few characters. A Slate maintainer will ask why a single `editor.read` block is not enough." | Authors can write `const data = editor.read((state) => ...)` once per handler today, with no context change. | More context fields increase typing/docs surface and create another thing to teach.                                   | A scoped read block is serviceable but still wrong as the target teaching shape: transform middleware is already a lifecycle context, and forcing a nested read callback inside it makes old Slate override DX feel worse than it needs to. Keep `state`, but document the no-change alternative as rejected, not ignored. | keep, revised   |
| Keep the name `state`                       | "`state` sounds like immutable ProseMirror `EditorState`, but Slate's `EditorStateView` is a live read view."                    | Rename to `read`, `view`, or `snapshot` to avoid false immutability.                                         | Bad naming would leak into every example and type contract.                                                           | `state` still wins because it matches current `editor.read((state) => ...)`, ProseMirror commands, and Tiptap command props. The mitigation is JSDoc/docs: "contextual read view", never "snapshot".                                                                                                                       | keep            |
| Transform-only scope                        | "If query middleware and normalizers also get `editor`, why do only transforms get `state`?"                                     | Add `state` everywhere now for consistency.                                                                  | Broader rollout risks query recursion confusion, normalizer transaction confusion, and clipboard/DOM policy creep.    | Transform middleware is the only proven painful call site in this plan. Query/normalizer/clipboard contexts need their own semantics before expansion.                                                                                                                                                                     | keep            |
| Allow reads before `next()`                 | "A live read view plus `next()` can produce stale derived values if users hold paths across delegation."                         | Keep explicit `editor.read` so the read boundary is visually obvious.                                        | Bad examples could teach stale path usage around delegation.                                                          | Examples must read, decide, then either return or delegate. Any post-`next()` read pattern needs a fresh read and separate docs/tests.                                                                                                                                                                                     | keep with proof |
| Reject root `editor.state`                  | "Root state is the shortest and feels familiar to ProseMirror users."                                                            | Expose `editor.state.selection.get()` and rely on docs to say it is read-only.                               | It reintroduces live root state after the editor-root hard cut and invites app code to poll mutable editor internals. | Hard no. Root state is attractive for the wrong reason. Contextual `state` gives the ergonomic win without widening the editor root.                                                                                                                                                                                       | keep            |

Accepted revisions from this pass:

- Add the one-scoped-read-block alternative to the decision matrix and reject it
  explicitly as the final DX.
- Strengthen proof requirements around stale reads after `next()`.
- Keep `state` as the name, but require docs/JSDoc to call it a contextual read
  view.

## Closure Final Gates

Status: complete.

| Gate                    | Result | Evidence                                                                                                                                      |
| ----------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Required pass ledger    | Passed | Current-state, related-issue discovery, full issue-ledger, intent-boundary, research/ecosystem, and maintainer/steelman rows are complete.    |
| User decision blockers  | Passed | No user decision is required before Ralph. `state` naming is decided; `editor.read.*` remains deferred.                                       |
| Issue/PR claim sync     | Passed | New fixed claims: `0`; new improved claims: `0`; related classifications changed: `0`; PR reference unchanged until implementation.           |
| Implementation boundary | Passed | This Ralplan edited only the plan and scoped `.tmp` state; no `/Users/zbeyens/git/slate-v2` source/test/example files were edited.            |
| Verification scope      | Passed | This is a planning artifact. No TypeScript/package/browser gate is required until Ralph implementation touches `/Users/zbeyens/git/slate-v2`. |
| Completion state        | Passed | `COMPLETION_CHECK_ID=019e1fc0-dba0-7de1-9236-b484a144cda6 node tooling/scripts/completion-check.mjs` completed successfully.                  |

## Pass-State Ledger

| Pass                           | Status   | Evidence added                                                                                                              | Plan delta                                                                                                       | Open issues                                                | Next owner                     |
| ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------ |
| current-state-read             | complete | Live Slate table example, Slate state view, Lexical read docs/source, ProseMirror command/transaction source.               | Chose contextual `state` in middleware; rejected `editor.state`.                                                 | None.                                                      | related-issue-discovery        |
| related-issue-discovery        | complete | Local ledgers for `#3802`, `#3557`, `#3177`, `#5961`, and query-DX rows.                                                    | Added no-claim issue matrix; confirmed no new fixed/improved claims.                                             | Full issue-ledger pressure scan still pending at the time. | issue-ledger-pass              |
| issue-ledger-pass              | complete | Full issue docs scan; additional `#3222`, `#4089`, `#4181`, `R11`, `R12`, `R6`, and `R7` rows reviewed.                     | Added full issue-ledger section; no ledgers changed because rows were already classified.                        | None from issue accounting.                                | intent-boundary/decision-brief |
| intent-boundary/decision-brief | complete | Live context types and execution sites; transform, query, operation, normalizer, and read-state boundaries checked.         | Narrowed scope to transform middleware only; documented `state` as contextual read view, not immutable snapshot. | None requiring user input.                                 | research/ecosystem             |
| research/ecosystem             | complete | Compiled Lexical/ProseMirror/Tiptap research pages refreshed; live Slate, ProseMirror, Lexical, and Tiptap sources checked. | Kept `state`; rejected `read`, `view`, `snapshot`, and `editorState`; confirmed transform-only scope.            | None requiring user input.                                 | maintainer/steelman            |
| maintainer/steelman            | complete | Public API objection rows; one-scoped-read-block alternative; stale read after `next()` risk.                               | Kept contextual `state`; added explicit no-change alternative rejection and proof requirements.                  | None requiring user input.                                 | closure-final-gates            |
| closure-final-gates            | complete | Final gate table, no-user-blocker decision, no-new-claim accounting, implementation boundary, scoped completion state.      | Marked the Ralplan plan ready for Ralph handoff.                                                                 | None.                                                      | none                           |

## Scorecard

| Dimension                             | Score | Evidence                                                                                                                                                                                                      |
| ------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance        |  0.80 | No React render hot path touched; intent pass narrowed scope to transform middleware, reducing expansion risk.                                                                                                |
| Slate-close unopinionated DX          |  0.95 | ProseMirror command `state`, Tiptap command props, current Slate `EditorStateView`, full issue-ledger pressure, and maintainer pass support contextual transform `state`; root `editor.state` stays rejected. |
| Plate/slate-yjs migration-backbone    |  0.86 | Extension context improves plugin authoring; related `#3802`/`#3557`/`#3222`/`#4089` pressure is classified, but collab/read snapshot semantics still need a pass.                                            |
| Regression-proof testing strategy     |  0.84 | Test targets named; intent/research/steelman passes added runtime contracts for contextual read view typing and stale reads around `next()`.                                                                  |
| Research evidence completeness        |  0.94 | ProseMirror, Lexical, Tiptap, current Slate v2 source, and compiled research decisions now agree on contextual lifecycle reads and reject root live state.                                                    |
| shadcn-style composability/minimalism |  0.85 | Transform-only scope avoids helper piles, rejects one-off local wrappers, and avoids spreading `state` across unrelated context objects.                                                                      |

Total: 0.90. Status is `done`.

## Open Questions

- No user decision is needed before Ralph.
- Deferred follow-up: only consider `editor.read.*` one-shot helpers after a
  broader call-site audit proves repeated ceremony outside transform
  middleware.

## Ralph Implementation Phases

1. Add typed `state` to transform middleware context.
2. Update table/markdown/richtext examples to use contextual `state`.
3. Update docs to teach contextual `state` in middleware and `editor.read` for
   general outer reads.
4. Add type/runtime contracts.
5. Run the fast gates from `/Users/zbeyens/git/slate-v2`.

## Final Handoff Draft

- Cut: `editor.state.selection.get()` as root API.
- Add: `state` on transform middleware context.
- Keep: `editor.read((state) => ...)` as the canonical general read boundary.
- Defer: one-shot `editor.read.*` helpers until after call-site audit.
- Keep: inline example logic unless reused; no local helper pile.
