# Slate v2 Editor Namespace Runtime API Shape Ralplan

Date: 2026-04-30
Status: pending
Code repo: `/Users/zbeyens/git/slate-v2`
Plan repo: `/Users/zbeyens/git/plate-2`
Skill: `.agents/skills/slate-ralplan/SKILL.md`

## 1. Current Verdict

The target API shape is now coherent enough for closure scoring. The live
implementation is not ready.

The public `BaseEditor` is small:

- `editor.read`
- `editor.update`
- `editor.subscribe`
- `editor.extend`

That is the correct public spine. The remaining problem is that first-party
runtime code still has three competing state/write languages:

1. `editor.read((state) => ...)` and `editor.update((tx) => ...)`
2. stateful static `Editor.*`
3. `getEditorTransformRegistry(editor).*`

That is not the cleanest architecture. It keeps old Slate vocabulary alive as a
runtime escape hatch and makes it unclear which path owns invariants.

Current readiness score: `0.92`.

Gate result: planning done; implementation active. The current-state read, intent/boundary pass,
research/live-source refresh, pressure passes, Slate maintainer objection
ledger, high-risk deliberate pass, revision pass, and closure score/gates are
complete. The extension namespace DX pass is complete and supersedes the
earlier static host namespace target. The post-extension closure pass verified
the score, pass ledger, final decisions, and stale-decision checks. Ralph
execution has started with Phase 1 API law contracts.

## 2. Intent And Boundaries

Intent:

- Make the editor API shape boring, obvious, and hard to misuse.
- Keep raw Slate unopinionated and Slate-close where that helps.
- Cut legacy namespace habits when they fight `read` / `update`.
- Preserve a migration backbone for Plate and slate-yjs without supporting
  their current public APIs.

Desired outcome:

- Normal reads use `editor.read((state) => ...)`.
- Normal writes use `editor.update((tx) => ...)`.
- `Editor.*` is not a public stateful namespace.
- Internal transform implementations are package-local pure functions or private
  runtime modules wrapped by `tx`, not caller-facing registry getters.
- DOM and React host operations stay out of core editor methods.
- Range preservation examples use bookmarks or tx/state range APIs, not public
  `Editor.rangeRef`.

In scope:

- `packages/slate/src/create-editor.ts`
- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate/src/core/transform-registry.ts`
- `packages/slate/src/editor/**`
- `packages/slate-dom/src/plugin/dom-editor.ts`
- `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/slate-react/src/editable/**`
- `packages/slate-react/src/plugin/**`
- public API docs and current behavior contracts

Non-goals:

- current-version Plate adapter support
- current-version slate-yjs adapter support
- product command catalogs
- chain API work
- public `editor.refs`
- browser regression implementation in this planning pass
- manually editing Slate v2 implementation code in this skill activation

Decision boundaries:

- Breaking changes are allowed.
- Internal compatibility is not required before publish.
- Pure data namespaces like `Node`, `Path`, `Point`, `Range`, `Element`, and
  `Text` can stay.
- Runtime object growth is not allowed just because legacy Slate did it.
- If an API is normal app code, it must be reachable through `state` or `tx`.
- If an API is host bridge code, it belongs to an installed host capability
  such as `editor.dom.*`, not the headless editor core.
- If an API is implementation plumbing, keep it package-local or
  `slate/internal`, not public docs.
- The plan may decide public API names without asking again when live source and
  research evidence agree.
- The plan may choose the less legacy-compatible option when the legacy option
  keeps two normal read/write paths alive.

Unresolved user-decision points:

- None. The user already authorized hard cuts and does not require internal
  compatibility.

## 3. Decision Brief

### Principles

- One public lifecycle: `read` for committed reads, `update` for writes.
- A write inside `update` must go through `tx`.
- Public `Editor.*` should not be the back door to editor state.
- DOM and React adapters own DOM concerns.
- Tests should prove behavior through current public or intentional internal
  contracts, not legacy convenience calls.

### Top Drivers

- Developer clarity: there must be one obvious answer for "how do I read/write".
- React 19.2 performance: hot paths should subscribe to narrow runtime facts,
  not broad editor snapshots or namespace reads.
- Collaboration and replay: operations, commits, and snapshots need deterministic
  ownership.
- Ecosystem migration: Plate and slate-yjs need a stable state/tx substrate,
  not current-version adapters.

### Viable Options

| Option | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Keep public `Editor.*` for reads/writes/transforms | Closest to legacy Slate | Conflicts with `read` / `update`, preserves multiple write paths, invites docs drift | reject |
| Keep public `Editor.*` but only pure utilities like `Editor.isEditor` | Familiar namespace, small surface | A public `Editor` value with one safe method still invites future stateful methods | reject |
| Cut public `Editor` value; export `Editor` type and top-level `isEditor(value)` | Clearest public shape, no namespace confusion | More breaking than legacy Slate | keep as target |
| Keep transform registry as first-party caller API | Enables dynamic dispatch | Ugly DX, hard to know when invariants run, leaks implementation | reject |
| Keep transform registry private behind tx | Preserves override/dispatch implementation if needed | Requires tx to cover all normal transforms | keep |
| Replace registry callers with package-local pure functions wrapped by tx | Simple implementation ownership, no public namespace smell | Needs careful extension hook point | keep |
| Put DOM clipboard/data methods on editor instances | Familiar legacy style | Reopens editor method growth | reject |
| Keep `DOMEditor.*` / `ReactEditor.*` host namespaces | Correct adapter boundary | Still creates a second public authoring style beside installed extensions | reject |
| Expose installed host and plugin capabilities as `editor.<extension>` with matching `state.<extension>` and `tx.<extension>` where deterministic | One extension installation story for DOM, React, and plugins; keeps headless core small | Needs typed extension namespace composition | keep |

### Chosen Target

- Public `Editor` becomes a type-only concept.
- Public predicate becomes top-level `isEditor(value)`.
- Normal read/write examples never use `Editor.*`.
- `state.runtime.snapshot()` becomes the advanced full-snapshot read. The
  snapshot belongs to runtime/observer tooling, not ordinary document value.
- `tx` grows every missing normal transform so React/DOM runtime never calls
  `getEditorTransformRegistry(editor)` directly.
- Transform implementation functions are package-local and wrapped by `tx`.
- DOM and React host APIs become installed capabilities such as `editor.dom.*`,
  available only after the matching host extension is installed.
- `editor.dom.clipboard.writeFragment` becomes
  `editor.dom.clipboard.writeSelection` because the operation writes the
  current selection payload into a host `DataTransfer`.
- Plugin/controller extensions expose one grouped namespace on `editor`, with
  deterministic selectors under `state` and document mutations under `tx`.

### Rejected Alternatives

- Public `InternalEditor`.
- Public `EditorInterface`.
- Public transform registry exports.
- `editor.api` / `editor.tf`.
- Plate-style command catalog in raw Slate.
- Keeping aliases before publish.
- Public static `DOMEditor.*` / `ReactEditor.*` as the normal app-authoring API.

### Consequences

- Many tests that assert through `Editor.getSnapshot` need a testing/runtime
  policy: either use `editor.read`, a test-only helper, or explicit
  `slate/internal`.
- Runtime files need tx completeness before registry callers can disappear.
- Docs need one clean authoring story, not repeated warnings.
- Plugin/collab answers must be substrate-level: state/tx extension groups,
  deterministic operations, commits, snapshots, bookmarks, and local-only
  targets.

### Follow-ups

- Ready for a later `ralph` implementation lane when the user asks to execute.

### Intent/Boundary Pass Result

Result: complete.

Evidence used:

- Live `BaseEditor` is already only `read`, `update`, `subscribe`, and
  `extend`.
- Live `EditorStaticApi` still exposes stateful reads/writes and therefore
  conflicts with the accepted state/tx research decision.
- Live `tx.value.replace` already exists, so whole-document replacement does not
  need public `Editor.replace`.
- Live bookmark contracts already give a stronger replacement direction than
  public `rangeRef` examples.
- Compiled research already accepts state/tx extension namespaces and rejects
  `api` / `tf` as raw Slate naming.

Pressure test:

- Weakest answer: keeping `Editor.isEditor` because it is harmless.
- Counterexample: the confusion in this review exists because `Editor.*` is a
  mixed namespace. Keeping a public `Editor` value for one pure guard keeps the
  namespace alive and makes the next stateful addition look less like a breach.

Decision from this pass:

- Cut the public `Editor` value completely.
- Keep `Editor` as a type.
- Add top-level `isEditor(value)`.
- Use `state.runtime.snapshot()` for full snapshots.
- Rename clipboard writer to `writeSelection`.
- Keep `rangeRef` internal/advanced; docs use bookmarks for durable range
  preservation.

Asked question:

- none.

Remaining ambiguity after this pass:

- none; later pressure pass locked tx method names and test-helper policy.

### Research/Live-Source Refresh Result

Result: complete.

Compiled research used:

- `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`
  supports `editor.read` / `editor.update` as the lifecycle boundary, update
  tags as commit metadata, and dirty-node discipline below render.
- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`
  supports transaction-owned document/selection/mark metadata, bookmark-style
  durable anchors, and one DOM bridge owner.
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
  supports extension discoverability and selector-based React UI state, but
  keeps command catalogs as product DX rather than raw Slate core.
- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
  already records raw corpus closure for Lexical, ProseMirror, and Tiptap. No
  fresh raw refresh is needed for this scoped API-shape pass.

Live source refreshed:

- `BaseEditor` remains small at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:374`.
- `state` / `tx` groups, extension groups, and schema groups exist at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:340`.
- `tx.value.replace` exists at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:921`.
- `tx.text.insert` / `tx.text.delete` exist at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:915`.
- `EditorStateRuntimeApi` currently exposes only runtime id mapping, so the
  `state.runtime.snapshot()` target requires an implementation addition.
- `EditorStaticApi` still exposes stateful reads and writes at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1074`
  and `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1110`.
- `createEditor` still builds a broad `runtime: any` mirror at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:263`.
- React runtime still uses transform-registry writes inside `editor.update` at
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/composition-state.ts:105`
  and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/mutation-controller.ts:78`.
- `DOMEditor` still extends `Editor` with helper-looking instance methods at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:51`.
- `DOMEditor.clipboard.writeFragment` still accepts `origin` at the type level
  but the namespace implementation does not use it at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:603`.
- Plate block selection shows the migration pressure clearly:
  `packages/selection/src/react/BlockSelectionPlugin.tsx` mixes UI/local
  actions, selectors, and document transforms across `api` and `tf`; raw Slate
  needs a cleaner substrate shape, not Plate's current public names.
- Bookmarks exist as operation-rebased durable range handles at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/bookmark.ts:42`.

Decision impact:

- Keep the public `Editor` value cut.
- Keep top-level `isEditor(value)`.
- Keep `writeSelection` as the clipboard writer target.
- Keep bookmarks as the public durable range-preservation story.
- Keep `state.runtime.snapshot()` as the advanced snapshot target, but mark it
  as an implementation addition because runtime state currently lacks
  `snapshot()`.
- Do not run a fresh `research-wiki` ingest in this pass; the compiled layer is
  current and cites raw corpus closure for this question.
- Supersede public `DOMEditor.*` / `ReactEditor.*` as the normal authoring
  surface with installed capabilities such as `editor.dom.*`.

### Pressure Pass Result

Result: complete.

Performance pass:

- Keep React as projection/subscription code.
- Remove transform-registry imports from React/DOM runtime callers once tx
  methods exist.
- Keep full snapshots out of urgent render paths.
- Move full snapshot reads to `state.runtime.snapshot()` so ordinary value reads
  stay narrow.
- `createEditor` runtime split is required because `runtime: any` keeps broad
  legacy-shaped access cheap to reintroduce.

DX pass:

- Keep Slate verbs where they are already known and not misleading.
- Final tx naming target:

```ts
editor.update((tx) => {
  tx.text.insert(text, options)
  tx.text.delete(options)
  tx.text.deleteBackward({ unit: 'character' })
  tx.text.deleteForward({ unit: 'word' })
  tx.fragment.insert(fragment, options)
  tx.fragment.delete({ direction: 'backward' })
  tx.break.insert()
  tx.break.insertSoft()
  tx.selection.set(target)
  tx.nodes.set(props, options)
})
```

- Rationale: text and fragment transforms are grouped by edited material;
  break transforms are grouped by editing intent so root `tx` does not become a
  flat method catalog.
- Do not add `tx.transforms.*`. That just renames the registry leak.

Migration pass:

- Plate/plugin migration backbone is state/tx extension groups, not
  `editor.commands`.
- slate-yjs/collab backbone is deterministic operation replay:
  `editor.update((tx) => tx.operations.replay(ops, options))`.
- Bookmarks are local anchors and must not become shared document truth.
- DOM clipboard helpers are adapter helpers, not collaboration operations.
- Block Selection is an installed controller extension, not raw Slate core
  document model. It exposes UI/local actions through `editor.blockSelection.*`,
  read facts through `state.blockSelection.*`, and document-changing commands
  through `tx.blockSelection.*`.

Regression pass:

- Public surface proof:
  `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts`
  should assert the current public runtime export shape: type-only `Editor`,
  top-level `isEditor`, no public transform registry, no public stateful
  `Editor` value.
- State/tx proof:
  `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
  should cover tx-local reads plus `tx.value.replace`.
- New tx completeness proof:
  `/Users/zbeyens/git/slate-v2/packages/slate/test/tx-transform-completeness-contract.ts`
  should cover `text.insert`, `text.delete`, `text.deleteBackward`,
  `text.deleteForward`, `fragment.insert`, `fragment.delete`, `break.insert`,
  and `break.insertSoft`.
- Bookmark proof:
  `/Users/zbeyens/git/slate-v2/packages/slate/test/bookmark-contract.ts`
  remains the durable range-preservation proof.
- Clipboard proof:
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
  should cover `writeSelection`, `insertData`, and `origin` behavior if
  `origin` survives.
- Runtime authority proof:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
  should ban `getEditorTransformRegistry` imports outside core tx/runtime
  modules.
- Test-helper proof:
  `/Users/zbeyens/git/slate-v2/packages/slate/test/test-helper-boundary-contract.ts`
  should prove assertion-heavy suites use a test-only snapshot helper, not the
  public package API.

Test-helper policy:

- Normal app/docs/tests use `editor.read((state) => ...)`.
- Assertion-heavy package suites may use a local test helper:

```ts
const snapshot = getTestEditorSnapshot(editor)
```

- That helper lives under package test support or `slate/internal/testing`.
- It must not be exported from public `slate`.
- It may call `editor.read((state) => state.runtime.snapshot())` after the
  runtime snapshot target exists.

Simplicity pass:

- Cut public `Editor` value rather than preserving a pure-only namespace.
- Do not add `editor.api`, `editor.tf`, `editor.commands`, `editor.clipboard`,
  or `tx.transforms`.
- Keep DOM/React host helpers grouped under installed host capabilities such as
  `editor.dom.*`.
- Keep product command sugar out of raw Slate.

## 4. Confidence Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.91 | Public editor is small at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:374`, Lexical/Tiptap evidence supports dirty/selector discipline, and the accepted ledger requires registry removal from React/DOM runtime callers plus full snapshots outside urgent render paths. The high-risk pass adds a runtime-authority proof lane for `packages/slate-react/test/kernel-authority-audit-contract.ts`; still below `0.93` because live code reaches for registry writes in React hot paths at `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/composition-state.ts:105` and `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/mutation-controller.ts:78`. |
| Slate-close unopinionated DX | 0.92 | `state` / `tx` groups exist at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:340`; compiled research rejects `api` / `tf` for raw Slate; pressure pass locks type-only `Editor`, top-level `isEditor`, exact tx names, and the revision pass folds those choices into implementation phases and final gates. |
| Plate and slate-yjs migration-backbone shape | 0.92 | Extension groups exist for state/tx at `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:331`; Tiptap supports extension DX; ProseMirror supports transaction/bookmark/collab substrate; the extension namespace pass maps Plate block selection pressure into `editor.<extension>` / `state.<extension>` / `tx.<extension>` without requiring current-version adapters. |
| Regression-proof testing strategy | 0.93 | Pressure pass names exact proof families; the high-risk pass expands them into unit, DOM, type, focused browser, stress, docs, and migration-backbone lanes with package owners. Required proof now includes public surface, tx transform completeness, bookmark, clipboard boundary, runtime authority audit, test-helper boundary, and browser replay rows. |
| Research evidence completeness | 0.92 | Compiled research covers Lexical read/update, ProseMirror transaction/bookmark discipline, and Tiptap extension DX, and `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md` records raw corpus closure. No fresh raw refresh is needed for this scoped pass. |
| shadcn-style composability and hook/component minimalism | 0.92 | The extension namespace pass replaces static host namespaces with installed capabilities such as `editor.dom.*`, rejects root `editor.clipboard`, and keeps UI/controller plugins grouped by extension key. Still below `0.94` because live `DOMEditor` extends `Editor` with helper-looking instance methods at `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:51`. |

Weighted total: `0.92`.

Why not higher:

- Public static `Editor.*` is still too broad.
- `getEditorTransformRegistry` is still visible in React/DOM runtime paths.
- `createEditor` still builds a broad `runtime: any` mirror.
- Live implementation still needs the planned hard cuts.

## 5. Source-Backed Architecture North Star

Source facts:

- `BaseEditor` has the right public shape:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:374`.
- `state` and `tx` groups are already real:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:340`.
- `tx.text.insert` and `tx.text.delete` already exist:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:915`.
- `createEditor` still mirrors static editor methods through `runtime: any`:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:263`.
- `EditorStaticApi` still includes stateful reads and writes:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1074`
  and `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1110`.
- `runInternalEditorWrite` still auto-opens an update for static writes:
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1499`.
- `DOMEditor` still presents helper methods on the DOM editor interface:
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:51`.
- `DOMEditor.clipboard.writeFragment` ignores the `origin` option at the current
  call site:
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:603`.

Research facts:

- Lexical supports strict read/update lifecycle discipline.
- ProseMirror supports transaction authority, selection mapping, and bookmarks.
- Tiptap supports extension discoverability, but raw Slate should not copy its
  product-command catalog as core API.

North star:

```txt
type-only Editor
top-level isEditor(value)
editor.read((state) => ...)
editor.update((tx) => ...)
state groups for committed reads
tx groups for transaction-local reads and writes
installed host capabilities such as editor.dom.* for host bridge APIs
package-local pure implementation functions behind tx
slate/internal only for intentional runtime/test escape hatches
```

## 6. Public API Target

Keep:

```ts
const editor = createEditor()

editor.read((state) => {
  return state.selection.get()
})

editor.update((tx) => {
  tx.text.insert('x')
})
```

Cut from normal public API:

```ts
Editor.getSnapshot(editor)
Editor.getSelection(editor)
Editor.insertText(editor, 'x')
Editor.deleteBackward(editor)
Editor.rangeRef(editor, range)
getEditorTransformRegistry(editor).insertText('x')
```

Public predicate target:

```ts
import { isEditor } from 'slate'

if (isEditor(value)) {
  // value is an editor
}
```

Type target:

```ts
import type { Editor } from 'slate'
```

No public `export const Editor`.

Snapshot target:

```ts
editor.read((state) => state.value.get())
editor.read((state) => state.selection.get())
editor.read((state) => state.runtime.snapshot())
```

`state.runtime.snapshot()` is the final target for full snapshot reads because
snapshots are observer/runtime facts, not ordinary document value.

## 7. Internal Runtime Target

Current shape:

```ts
editor.update(() => {
  getEditorTransformRegistry(editor).insertText(text)
})
```

Target shape:

```ts
editor.update((tx) => {
  tx.text.insert(text)
})
```

For missing transforms, extend tx instead of exposing the registry:

```ts
editor.update((tx) => {
  tx.text.deleteBackward({ unit: 'character' })
  tx.text.deleteForward({ unit: 'word' })
  tx.fragment.delete({ direction: 'backward' })
  tx.break.insert()
  tx.break.insertSoft()
})
```

Implementation target:

```ts
// package-local
insertText(context, text, options)

// tx wrapper
tx.text.insert = (text, options) => {
  insertText(context, text, options)
}
```

Registry target:

- Allowed as private dispatch/override plumbing if extensions need it.
- Not imported by React/DOM runtime callers.
- Not exported from public `slate`.
- Not documented as an authoring API.

`createEditor` target:

- Replace `runtime: any` with typed internal modules:
  - `queryRuntime`
  - `transformRuntime`
  - `refRuntime`
  - `snapshotRuntime`
  - `extensionRuntime`
- Keep module boundaries private to `packages/slate`.
- Public editor still exposes only `read`, `update`, `subscribe`, and `extend`.

## 8. Hook Component Render DX Target

No React render API change is required in this specific plan, but the API cut
protects React runtime performance:

- React runtime event handlers call tx methods.
- React render code subscribes to named source selectors.
- DOM selection and clipboard helpers stay in installed host capabilities such
  as `editor.dom.*`.
- No component should call `Editor.getSnapshot(editor)` for urgent render data.

Applicable Vercel React finding:

- `rerender-defer-reads`: callbacks should not subscribe to broad state they
  only need at event time.
- `client-event-listeners`: central runtime event bindings should not produce
  duplicate global listeners.
- `rerender-derived-state`: selection/focus UI should subscribe to narrow
  derived booleans, not whole snapshots.

## 9. Plate Migration-Backbone Target

Plate should be able to build product APIs above this without wrapping every
core call.

Required substrate:

- `state.<extension>` groups
- `tx.<extension>` groups
- deterministic operation replay through `tx.operations.replay(...)`
- element/spec policy through `state.schema` / `tx.schema`
- local-only target/bookmark semantics for UI actions
- DOM host helpers under installed capabilities such as `editor.dom.*` for
  custom Editable integration

Non-requirement:

- current-version Plate API adapters.

## 10. slate-yjs Migration-Backbone Target

slate-yjs needs deterministic state and operations, not current adapter support.

Required substrate:

- operations are the shared mutation record
- commits carry metadata needed for local/remote decisions
- snapshots are observer/replay artifacts, not normal app reads
- remote apply uses `editor.update((tx) => tx.operations.replay(...))`
- bookmarks or targets are local-only and never serialized as shared document
  truth

Non-requirement:

- current-version slate-yjs fixture compatibility.

## 11. Legacy Regression Proof Matrix

| Surface | Risk | Required proof |
| --- | --- | --- |
| Public namespace cut | accidental stateful `Editor.*` app path remains | `packages/slate/test/public-surface-contract.ts` records current public runtime exports: type-only `Editor`, top-level `isEditor`, no public transform registry |
| tx transform completeness | React runtime cannot express normal edits without registry | `packages/slate/test/tx-transform-completeness-contract.ts` covers `text.insert`, `text.delete`, `text.deleteBackward`, `text.deleteForward`, `fragment.insert`, `fragment.delete`, `break.insert`, `break.insertSoft` |
| snapshot policy | apps/tests keep broad snapshot reads as normal API | docs and tests use `editor.read`; `packages/slate/test/test-helper-boundary-contract.ts` isolates test-only snapshot helper |
| bookmarks/range preservation | rangeRef docs disappear without alternative | `packages/slate/test/bookmark-contract.ts` plus docs example replacing selection preservation |
| DOM clipboard naming | custom handlers copy legacy `setFragmentData` habits | `packages/slate-dom/test/clipboard-boundary.ts` covers `editor.dom.clipboard.writeSelection` / `insertData` |
| DOM host capability cleanup | helper signatures look like instance methods or static namespace calls | type contract for installed `editor.dom.*` capability with no headless-core availability |
| React hot paths | registry or snapshot reads return through event handlers | `packages/slate-react/test/kernel-authority-audit-contract.ts` bans `getEditorTransformRegistry` outside approved core tx/runtime modules |

## 12. Browser Stress And Parity Strategy

Fast CI:

- public surface contract
- state/tx public API contract
- bookmark contract
- clipboard boundary contract
- kernel authority audit
- focused React runtime tests for copy/cut/paste/delete/composition rows

Stress lane:

- generated edit replay by operation family
- human-like copy/cut/paste around voids/inlines/text marks
- IME composition insert/delete rows
- selection preservation through unwrap/split/merge
- drag/drop DataTransfer rows
- snapshot/replay parity after remote operation batches

Do not put the slow full browser sweep in the fast iteration gate.

## 13. Applicable Implementation Skill Review Matrix

| Lens | Applicability | Result |
| --- | --- | --- |
| Vercel React best practices | applied | React should stay projection/subscriber. Event runtime writes through tx; no broad snapshot reads in render. |
| performance-oracle | applied | Main perf risk is `getSnapshot` and broad runtime mirrors. Plan requires narrow state/tx reads and private implementation functions. |
| tdd | applied | Implementation should start with contracts: public namespace cut, tx transform completeness, bookmark replacement, DOM clipboard rename. |
| shadcn | skipped | No UI chrome or component styling in this API-shape pass. |
| react-useeffect | skipped | No effect design changes in this pass. |

## 14. High-Risk Deliberate-Mode Pre-Mortem

Result: complete.

High-risk trigger:

- public API hard cut
- runtime write authority change
- DOM/React host API rename
- snapshot and bookmark policy changes
- package-boundary refactor across `slate`, `slate-dom`, and `slate-react`

Blast radius:

| Area | Files/packages | Consumers affected | Behavior affected |
| --- | --- | --- | --- |
| Core public API | `packages/slate/src/interfaces/editor.ts`, public barrels, package tests | raw Slate users, test authors, plugin authors | `Editor` value removal, top-level `isEditor`, read/update-only authoring |
| Core runtime | `packages/slate/src/create-editor.ts`, `packages/slate/src/core/public-state.ts`, `packages/slate/src/core/transform-registry.ts`, `packages/slate/src/editor/**` | core maintainers, extension authors | tx transform completeness, private transform dispatch, typed runtime modules |
| DOM host adapter | `packages/slate-dom/src/plugin/dom-editor.ts`, `packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` | custom Editable authors, copy/cut/drag integrations | branded DOM editor type, `writeSelection`, `insertData`, `DataTransfer` payloads |
| React runtime | `packages/slate-react/src/editable/**`, `packages/slate-react/src/plugin/**` | React editor users, browser-sensitive examples | composition, mutation repair, caret movement, clipboard, drag/drop, selection export/import |
| Docs/examples/tests | concepts, walkthroughs, examples, unit contracts, browser rows | app authors and future agents | one public lifecycle, no public registry, bookmark examples, test helper policy |
| Ecosystem backbone | state/tx extension groups, operation replay, commits, bookmarks | future Plate and slate-yjs migration work | substrate stability, local-only anchors, deterministic replay |

Pre-mortem scenario 1: API cleanup creates a new escape hatch.

- Failure: public `Editor.*` disappears, but test pressure recreates
  `InternalEditor`, public snapshot helpers, or public registry access.
- Consequence: the package lands with a cleaner headline but still has two
  normal read/write languages.
- Prevention: public-surface contract must fail on any public `Editor` value,
  public transform registry, public stateful namespace, or public snapshot
  helper.
- Remediation: if tests need convenience, add or tighten package test support
  only. Do not export the helper from public `slate`.

Pre-mortem scenario 2: tx becomes a wrapper name but not runtime authority.

- Failure: React/DOM runtime still calls registry functions inside
  `editor.update`, or missing tx operations make composition/delete/paste paths
  fall back to private imports.
- Consequence: DX looks better in docs, but browser-sensitive code keeps the old
  write path and regressions hide in IME, mutation repair, and clipboard flows.
- Prevention: tx-transform completeness contract plus kernel authority audit.
- Remediation: stop the phase until tx covers the missing operation. Do not
  whitelist registry imports in React/DOM runtime files.

Pre-mortem scenario 3: host and model boundaries get blurred again.

- Failure: `editor.dom.*` lands but helper methods remain typed as editor
  instance methods or static public namespace calls, or `writeSelection`
  becomes a model-shaped transform name with unused `origin`.
- Consequence: custom Editable authors copy the wrong pattern, and clipboard /
  drag data regressions keep showing up as one-off example bugs.
- Prevention: installed DOM capability type contract and clipboard boundary
  contract.
- Remediation: either make `origin` observable and tested, or cut it. Keep
  copy/cut/drag examples on `editor.dom.clipboard.writeSelection`.

Pre-mortem scenario 4: snapshot and bookmark policy hurts performance or
collaboration.

- Failure: `state.runtime.snapshot()` becomes a render-path convenience, or
  bookmarks are treated as shared collaboration truth.
- Consequence: React hot paths get broad reads again, and slate-yjs-style
  integration inherits local anchor state as if it were document data.
- Prevention: no urgent render code may call runtime snapshot; bookmark tests
  must state local-only semantics.
- Remediation: move render code to narrow selectors/state reads. Keep shared
  state as operations, commits, and document values only.

Expanded proof plan:

| Proof lane | Required proof | Why it matters |
| --- | --- | --- |
| Unit: public surface | `packages/slate/test/public-surface-contract.ts` | Proves type-only `Editor`, top-level `isEditor`, no public registry, no public stateful namespace |
| Unit: state/tx | `packages/slate/test/state-tx-public-api-contract.ts` and `packages/slate/test/tx-transform-completeness-contract.ts` | Proves normal reads/writes are expressible through `state` and `tx` |
| Unit: bookmarks | `packages/slate/test/bookmark-contract.ts` plus selection-preservation docs contract | Proves range preservation has a supported replacement story |
| Unit: test helper boundary | `packages/slate/test/test-helper-boundary-contract.ts` | Proves assertion helpers do not become public app APIs |
| Unit: runtime authority | `packages/slate-react/test/kernel-authority-audit-contract.ts` | Proves React/DOM runtime callers do not import transform registry for normal writes |
| DOM integration | `packages/slate-dom/test/clipboard-boundary.ts` | Proves `editor.dom.clipboard.writeSelection`, `insertData`, and any surviving `origin` behavior |
| Type contracts | package type tests for `slate`, `slate-dom`, and `slate-react` | Proves installed host capability types and public exports match the plan |
| Browser focused | copy/cut/paste/drag, IME composition, delete/backspace, void/inline navigation rows | Proves the areas that previously regressed in examples |
| Browser stress | generated operation-family replay in `test:stress` | Proves this is not whack-a-mole example patching |
| Docs/examples | docs grep plus current examples using `read`, `update`, bookmarks, and installed host capabilities | Proves docs teach the final API only |
| Migration backbone | extension namespace and operation replay tests | Proves Plate/slate-yjs get a migration substrate without current-version adapters |

Performance proof:

- Runtime snapshots are advanced observer reads only.
- React render and event code must use narrow state/tx/runtime facts.
- Registry access must stay below tx/private runtime modules.

Security proof:

- No security-sensitive data boundary is introduced.
- Clipboard behavior is host-mutating and browser-sensitive, so the proof is DOM
  payload correctness, not auth/security.

Rollback and remediation answer:

- No compatibility aliases before publish.
- If a public cut is wrong, revise the target before implementation, not after
  shipping.
- If tx cannot express a runtime write, expand tx or revise the phase; do not
  reintroduce caller-facing registry access.
- If extension composition requires dispatch, keep dispatch private behind tx.
- If `origin` has no tested semantics, cut it.
- If bookmarks are not ready for public docs, keep `rangeRef` internal and delay
  the public range-preservation docs until bookmark contracts are green.

Verdict:

- Keep the plan.
- Split implementation exactly as phases 1-6 describe.
- Do not start implementation from this Ralplan until the closure pass verifies
  every proof lane has an owner and no provisional public API remains.

## 15. Hard Cuts And Rejected Alternatives

Hard cut:

- public `export const Editor`
- public `EditorInterface`
- public stateful `Editor.*` reads/writes
- public transform registry exports
- React/DOM runtime calls to `getEditorTransformRegistry` for normal writes
- `DOMEditor` helper methods typed as editor instance methods
- public static `DOMEditor.*` / `ReactEditor.*` as the normal app-authoring API
- `writeFragment` if it remains model-shaped and ignores `origin`
- `state.value.snapshot()` as the public full-snapshot home once
  `state.runtime.snapshot()` exists

Keep:

- `Editor` type
- top-level `isEditor(value)`
- pure data namespaces
- `editor.read`
- `editor.update`
- `editor.subscribe`
- `editor.extend`
- installed host capabilities such as `editor.dom.*`
- installed plugin/controller namespaces such as `editor.blockSelection.*`,
  `state.blockSelection.*`, and `tx.blockSelection.*`
- private internal functions and private runtime modules
- `state.value.get()` for ordinary value reads

Reject:

- `editor.api` / `editor.tf`
- public `InternalEditor`
- public `editor.commands`
- public `editor.clipboard`
- public static host namespaces as the normal authoring API
- `state.dom.*` or `tx.dom.*` for host `DataTransfer` I/O
- keeping aliases because the package is unpublished

## 16. Slate Maintainer Objection Ledger

### Row 1: Cut public stateful `Editor.*`

Change:

- `Editor.getSnapshot(editor)` / `Editor.insertText(editor, text)` ->
  `editor.read((state) => ...)` / `editor.update((tx) => ...)`

Who feels pain:

- raw Slate users
- test authors
- maintainers familiar with legacy Slate

Likely objection:

- "This is not Slate anymore. Static `Editor.*` is familiar and easy to grep."

Steelman antithesis:

- Static helpers are simple, composable, and avoid method clutter on the editor
  instance.

Tradeoff tension:

- The new API is more ceremony for one-off reads in tests.

Why this is not change for change's sake:

- Static stateful helpers create multiple legal write/read paths and undermine
  the transaction lifecycle.

Evidence:

- Public state/tx exists, but `EditorStaticApi` still exposes stateful reads and
  writes.
- Research accepts `read` / `update` lifecycle discipline.

Rejected alternative:

- Keep `Editor.*` for "advanced" app usage. That preserves ambiguity.

Migration answer:

- App code moves to `editor.read` and `editor.update`.
- Tests use public state/tx or explicit internal test helpers.

Docs/example answer:

- Concepts docs teach one lifecycle first, with internal/test appendix only.

Regression proof:

- public-surface contract plus docs grep.

Ecosystem answers:

- Plate/plugin: extension namespaces attach to state/tx, not `Editor`.
- slate-yjs/collab: operations replay through tx.

Verdict: keep.

### Row 2: Use pure implementation functions instead of caller-facing registry

Change:

- `getEditorTransformRegistry(editor).insertText(text)` in React/DOM callers ->
  exact tx methods:
  `tx.text.insert`, `tx.text.delete`, `tx.text.deleteBackward`,
  `tx.text.deleteForward`, `tx.fragment.insert`, `tx.fragment.delete`,
  `tx.break.insert`, and `tx.break.insertSoft`.

Who feels pain:

- runtime maintainers

Likely objection:

- "The registry already centralizes transforms. Why add wrappers?"

Steelman antithesis:

- A registry is useful for extension ordering and avoids direct imports between
  transform modules.

Tradeoff tension:

- tx must become complete enough to cover every normal runtime edit.

Why this is not change for change's sake:

- Registry calls inside `editor.update(() => ...)` hide tx semantics and make
  caller code ask whether it is safe, current, or internal.

Evidence:

- React composition and mutation runtime call the registry inside update.
- `tx.text.insert` already exists, proving the intended shape.

Rejected alternative:

- Keep registry imports in runtime files with comments. Comments are not API
  architecture.

Migration answer:

- Add missing tx methods first, then migrate callers. Keep the transform
  registry private behind tx only if extension ordering still needs it.

Docs/example answer:

- No docs for registry. Contributor docs say tx is the runtime caller API.

Regression proof:

- `packages/slate/test/tx-transform-completeness-contract.ts` proves the tx
  methods.
- `packages/slate-react/test/kernel-authority-audit-contract.ts` bans registry
  imports outside core tx/runtime modules.

Ecosystem answers:

- Plate/plugin: extension transform groups remain possible through tx extension
  namespaces.
- slate-yjs/collab: replay remains tx-owned.

Verdict: keep.

### Row 3: Cut public `Editor.isEditor` in favor of top-level `isEditor`

Change:

- `Editor.isEditor(value)` -> `isEditor(value)`

Who feels pain:

- legacy Slate users

Likely objection:

- "Keeping a pure guard is harmless."

Steelman antithesis:

- A tiny `Editor.isEditor` namespace is familiar and mirrors `Element.isElement`.

Tradeoff tension:

- Top-level predicate is less Slate-legacy-shaped.

Why this is not change for change's sake:

- A public `Editor` value with one safe method keeps the namespace alive and
  makes future stateful additions easier to justify.

Evidence:

- The current confusion is specifically about `Editor.*` as a mixed namespace.

Rejected alternative:

- Keep pure-only `Editor.isEditor` with a guard. Rejected because it preserves
  the public `Editor` value after the plan cuts the mixed namespace.

Migration answer:

- Direct import: `import { isEditor } from 'slate'`.

Docs/example answer:

- Type guard docs show `isEditor(value)` beside `Element.isElement` and
  `Text.isText`.

Regression proof:

- public surface contract checks no public `Editor` value.

Ecosystem answers:

- No plugin/collab impact.

Verdict: keep.

### Row 4: Move clipboard writer under installed DOM capability

Change:

- `ReactEditor.clipboard.writeFragment(editor, data, { origin })` /
  `DOMEditor.clipboard.writeFragment(editor, data, { origin })` ->
  `editor.dom.clipboard.writeSelection(data, { origin })`

Who feels pain:

- custom Editable authors

Likely objection:

- "`writeSelection` hides that Slate fragment data is being written."

Steelman antithesis:

- `writeFragment` is closer to legacy `setFragmentData`.

Tradeoff tension:

- New name needs docs clarity.

Why this is not change for change's sake:

- The helper mutates `DataTransfer`; it is host transport, not a model transform
  or a static raw-Slate namespace.

Evidence:

- Current implementation ignores `origin` at the namespace implementation point.
- Installed extension capabilities give custom Editable code the same shape as
  plugin/controller APIs: `editor.<extension>.*`.

Rejected alternative:

- Keep `writeFragment` and improve docs. That keeps the model-shaped name.

Migration answer:

- Copy/cut/drag handlers call `editor.dom.clipboard.writeSelection`.

Docs/example answer:

- Clipboard guide shows one copy handler and says it writes Slate fragment,
  text, and HTML payloads for the current selection.

Regression proof:

- clipboard boundary tests and generated copy/cut/drag browser rows.

Ecosystem answers:

- Plate/plugin: can wrap or require the DOM capability without patching the
  headless editor core.
- slate-yjs/collab: no shared operation impact.

Verdict: keep.

### Row 5: Replace static DOM/React namespaces with installed host capability

Change:

- `interface DOMEditor extends Editor` with helper-looking methods ->
  DOM host extension that installs `editor.dom.*`.

Who feels pain:

- DOM/React adapter maintainers
- custom Editable authors who inspect types

Likely objection:

- "`DOMEditor.*` already keeps DOM helpers out of core. Why move it again?"

Steelman antithesis:

- Static host namespaces are familiar and easy to tree-shake.

Tradeoff tension:

- Installed host capability typing is more work than a single exported
  namespace.

Why this is not change for change's sake:

- Static namespaces create another normal authoring style beside
  `editor.extend(...)`. Installed capabilities make DOM, React, and plugins use
  one extension story.

Evidence:

- Live `DOMEditor` extends `Editor` and lists helper signatures at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:51`.

Rejected alternative:

- Keep public `DOMEditor.*` / `ReactEditor.*` and brand the editor type. That
  fixes the type smell but not the authoring split.

Migration answer:

- Custom DOM integrations install the DOM host extension and use
  `editor.dom.*`.
- The headless editor type has no `dom` property until the extension is
  installed.

Docs/example answer:

- Custom DOM integration docs show capability calls only:
  `editor.dom.hasTarget(target)` and
  `editor.dom.clipboard.writeSelection(data, options)`.

Regression proof:

- DOM type contract for installed capability availability and headless absence.
- Clipboard boundary contract for actual host behavior.

Ecosystem answers:

- Plate/plugin: can migrate plugin-shaped host helpers to installed capability
  groups without monkey-patching editor instances.
- slate-yjs/collab: no shared model impact; DOM host state remains local.

Verdict: keep.

### Row 6: Move full snapshots to runtime and isolate test snapshots

Change:

- `Editor.getSnapshot(editor)` / normal `state.value.snapshot()` ->
  `editor.read((state) => state.runtime.snapshot())` for advanced runtime reads,
  plus test-only `getTestEditorSnapshot(editor)` for assertion-heavy suites.

Who feels pain:

- test authors
- runtime/debug tooling authors

Likely objection:

- "Tests will get noisier just to inspect final children or selection."

Steelman antithesis:

- A public `Editor.getSnapshot` is extremely convenient and stable for tests.

Tradeoff tension:

- Test setup needs an explicit helper instead of grabbing a public namespace
  method.

Why this is not change for change's sake:

- Full snapshots are broad observer facts. Keeping them as normal public value
  reads trains app code to bypass narrow state reads and selector-friendly
  runtime data.

Evidence:

- Live state has `state.value.snapshot()` at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:820`.
- Live runtime state currently lacks `snapshot()`, so this plan records an
  implementation addition.

Rejected alternative:

- Keep `Editor.getSnapshot` for tests and call it "advanced". That keeps the
  public namespace alive and makes examples/docs drift likely.

Migration answer:

- App code uses narrow `state.value.get()`, `state.selection.get()`,
  `state.runtime.idAt(...)`, or `state.runtime.pathOf(...)`.
- Tests use `getTestEditorSnapshot(editor)` from package test support or
  `slate/internal/testing`.

Docs/example answer:

- Public docs do not teach snapshots as normal app reads.
- Internal/testing docs show the test helper and explain that snapshots are
  runtime observer artifacts.

Regression proof:

- `packages/slate/test/test-helper-boundary-contract.ts`.
- public surface contract rejects public snapshot namespace access.

Ecosystem answers:

- Plate/plugin: selector hooks and extension state use narrow reads.
- slate-yjs/collab: replay/debug tooling can use internal/runtime snapshots,
  while shared truth remains operations/commits.

Verdict: keep.

### Row 7: Use bookmarks as the durable range-preservation public story

Change:

- public examples using `Editor.rangeRef(editor, range)` ->
  bookmark/range-preservation examples.

Who feels pain:

- legacy Slate users who know `rangeRef`
- annotation/comment authors

Likely objection:

- "`rangeRef` is a direct Slate concept; hiding it makes advanced work harder."

Steelman antithesis:

- Range refs are already implemented and precise. They are useful low-level
  tools for runtime code.

Tradeoff tension:

- Docs need to explain bookmark lifetime and local-only semantics.

Why this is not change for change's sake:

- Public `rangeRef` examples pull users back into the old static `Editor.*`
  namespace. Bookmarks express the actual durable-anchor concept better and
  line up with ProseMirror's selection bookmark evidence.

Evidence:

- Live bookmarks are operation-rebased durable range handles at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/bookmark.ts:42`.
- ProseMirror research supports bookmarks as document-independent durable
  anchors.

Rejected alternative:

- Keep `rangeRef` docs and warn that it is advanced. That repeats the same
  footgun pattern as public `Editor.*`.

Migration answer:

- Selection preservation examples create a bookmark, run `editor.update`, then
  resolve/unref and set selection through `tx.selection.set(...)`.

Docs/example answer:

```ts
const bookmark = editor.read((state) =>
  state.ranges.bookmark(state.selection.get(), { affinity: 'inward' })
)

editor.update((tx) => {
  tx.nodes.unwrap()
  const selection = bookmark.unref()
  if (selection) tx.selection.set(selection)
})
```

Regression proof:

- `packages/slate/test/bookmark-contract.ts`.
- docs example contract for selection preservation through unwrap/split/merge.

Ecosystem answers:

- Plate/plugin: comments/review can use local bookmarks without serializing
  them as document truth.
- slate-yjs/collab: bookmarks are local anchors; shared state stays operations.

Verdict: keep.

### Row 8: Split `createEditor` runtime mirror into typed private modules

Change:

- broad `runtime: any` mirror ->
  typed private `queryRuntime`, `transformRuntime`, `refRuntime`,
  `snapshotRuntime`, and `extensionRuntime` modules.

Who feels pain:

- core maintainers

Likely objection:

- "This is internal. Why spend effort if public `BaseEditor` is already clean?"

Steelman antithesis:

- The current mirror keeps implementation wiring in one place and makes it easy
  to share old query code.

Tradeoff tension:

- The split adds module boundaries and some internal ceremony.

Why this is not change for change's sake:

- A broad `runtime: any` mirror makes legacy-shaped access cheap to reintroduce
  and undermines the public hard cut. Private typed modules keep the same power
  while forcing ownership categories.

Evidence:

- Live `createEditor` builds `runtime: any` with snapshot, traversal, refs, and
  query helpers at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:263`.

Rejected alternative:

- Keep `runtime: any` and rely on audits. That leaves the easiest path for
  drift in the core runtime.

Migration answer:

- No app migration. This is an internal refactor with public-surface contracts.

Docs/example answer:

- Contributor docs describe runtime modules as private implementation law.
  Public docs remain `read` / `update`.

Regression proof:

- public surface contract
- runtime authority audit
- package typecheck for `slate`, `slate-dom`, and `slate-react`

Ecosystem answers:

- Plate/plugin: sees state/tx extension points only.
- slate-yjs/collab: deterministic operations/commits are unaffected.

Verdict: keep.

### Ledger Pass Result

Result: complete.

Accepted rows:

- cut public stateful `Editor.*`
- tx-only writes and private transform implementation functions
- top-level `isEditor`
- `editor.dom.clipboard.writeSelection`
- installed `editor.dom.*` host capability
- `state.runtime.snapshot()` plus test-only snapshot helper
- bookmarks as durable range-preservation public story
- typed private runtime modules replacing `runtime: any`

No rows remain `revise`, `drop`, or `unresolved`.

## 17. Pass Schedule And Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read and initial score | complete | live source reads for `BaseEditor`, `createEditor`, `EditorStaticApi`, tx groups, transform registry, `DOMEditor`, React runtime registry callers, research state/tx pages | new plan created, score `0.78`, preliminary target recorded | pure guard namespace, clipboard writer name, snapshot placement, tx transform names | intent/boundary and decision-brief hardening |
| intent/boundary and decision brief | complete | live `BaseEditor`, `EditorStaticApi`, `tx.value.replace`, bookmark contracts, state/tx research decision | locked public `Editor` value cut, top-level `isEditor`, `state.runtime.snapshot`, `writeSelection`, bookmark replacement direction; score raised to `0.84` | exact tx transform names; test helper policy | research/live-source refresh |
| research and live-source refresh | complete | Lexical, ProseMirror, Tiptap compiled pages; read/update corpus ledger; live `BaseEditor`, state/tx groups, `tx.value.replace`, runtime state gap, `EditorStaticApi`, `createEditor`, React registry callers, DOMEditor clipboard/type shape, bookmark source | no raw refresh needed; confirmed locked decisions; marked `state.runtime.snapshot()` as implementation addition; score raised to `0.86` | exact tx transform names; test helper policy | pressure passes |
| performance/DX/migration/regression/simplicity pressure passes | complete | Vercel React/performance/tdd lenses, state/tx source, research ledger, live registry and DOMEditor evidence | locked exact tx method names, test-helper boundary policy, exact proof families, score raised to `0.90` | none; objection ledger accepted tradeoffs | Slate maintainer objection ledger |
| Slate maintainer objection ledger | complete | accepted rows for public `Editor` cut, tx-only writes, top-level `isEditor`, `writeSelection`, installed DOM capability, runtime snapshots/test helper, bookmarks, and typed private runtime modules | tightened row 2 with exact tx names; added rows 5-8; score raised to `0.91` | none | high-risk deliberate pass |
| high-risk deliberate pass | complete | package/user/behavior blast-radius table, four-scenario pre-mortem, proof-lane matrix, remediation policy | high-risk proof expanded; score held at `0.91` pending revision/closure | none | revision pass |
| revision pass | complete | coherence/scope review, high-risk proof lanes folded into implementation phases, final gates, and handoff outline | score raised to `0.92`; phases now name package owners, acceptance files, and slow/fast gate split | closure gate must validate final score and no stale state | closure score and gates |
| closure score and gates | complete | closure gate script verified score, dimensions, pass-state ledger, public API finality, proof lanes, objection ledger, final handoff, and continuation state | status moved to `done`; completion-check passed | reopened by extension namespace question | extension namespace DX pass |
| extension namespace DX pass | complete | live Plate block selection plugin, live DOMEditor interface/clipboard shape, live insert-break command/registry evidence | superseded public static host namespaces with installed capabilities; grouped plugin/controller APIs as `editor.<extension>` / `state.<extension>` / `tx.<extension>`; renamed break methods to `tx.break.insert` / `tx.break.insertSoft`; score restored to `0.92` | post-extension closure script must verify no stale namespace decisions remain | post-extension closure score and gates |
| post-extension closure score and gates | complete | closure gate script verified score, dimensions, extension namespace decision, stale static namespace rejection, tx break naming, Block Selection classification, completion state, and continuation state | status moved to `done`; completion-check passed | none | none |

## 18. Plan Deltas From Review

Added:

- stricter target to cut public `Editor` value, not only stateful methods
- top-level `isEditor(value)` target
- tx completeness target for delete/backspace/forward/fragment/break operations
- exact tx method naming for the missing normal transforms
- package-local pure implementation function target
- installed `editor.dom.*` host capability target
- clipboard writer rename row
- snapshot placement target
- bookmark/range preservation replacement lane
- test-helper boundary policy for assertion-heavy suites
- high-risk blast-radius table
- high-risk pre-mortem scenarios and remediation policy
- proof-lane matrix for unit, DOM, type, browser, docs, and migration-backbone checks
- revision pass tying proof lanes to implementation phases, package owners, and
  closure gates

Dropped:

- treating current `DOMEditor.clipboard.writeFragment` as locked
- public static `DOMEditor.*` / `ReactEditor.*` as the normal authoring API
- treating stateful `Editor.*` as acceptable internal caller API everywhere

Strengthened:

- registry imports are no longer acceptable in React/DOM runtime callers once tx
  methods exist
- test strategy must include public namespace and registry-import guards
- regression matrix now names exact proof files/families
- high-risk pass now ties each hard cut to a package surface, consumer group,
  failure mode, proof lane, and remediation answer
- final gates now require package-owner proof lanes, public API finality, and
  stale-state checks before marking the Ralplan done
- extension namespace pass now makes installed capabilities the common shape for
  DOM/React and plugin/controller APIs

No-change decisions:

- keep `read` / `update`
- keep state/tx extension namespaces
- keep host bridge APIs grouped and outside headless core
- keep pure data namespaces

Revision pass result:

- complete
- no scope expansion beyond raw Slate substrate
- no current-version Plate or slate-yjs adapter requirement added
- no product command catalog added
- high-risk proof lanes are represented in implementation phases and fast/slow
  driver gates
- score restored to `0.92`; post-extension closure score/gate pass is complete

## 19. Open Questions And What Would Change The Decision

Open:

- none

Would change the decision:

- Evidence that package-local pure transform functions break extension
  composition.

## 20. Implementation Phases With Owners

| Phase | Owner surface | Implementation work | Required acceptance |
| --- | --- | --- | --- |
| 1. API law contracts | `packages/slate` public surface | cut public `Editor` value, add top-level `isEditor`, keep `Editor` type-only, fence test/internal helpers, forbid public transform registry | `packages/slate/test/public-surface-contract.ts`, `packages/slate/test/state-tx-public-api-contract.ts`, `packages/slate/test/test-helper-boundary-contract.ts` |
| 2. tx transform authority | `packages/slate` core tx, `packages/slate-react` runtime callers | add missing tx methods, migrate composition/mutation/caret/repair/selection paths away from registry imports, keep dispatch private behind tx if needed, use grouped `tx.break.insert` / `tx.break.insertSoft` | `packages/slate/test/tx-transform-completeness-contract.ts`, `packages/slate-react/test/kernel-authority-audit-contract.ts` |
| 3. internal runtime split | `packages/slate/src/create-editor.ts` and private core runtime modules | replace broad `runtime: any` with typed query, transform, ref, snapshot, and extension runtime modules | `bun typecheck:packages`, public-surface contract, runtime-authority audit |
| 4. DOM/React host capability cleanup | `packages/slate-dom`, `packages/slate-react` host bridge APIs | replace public static host namespaces with installed `editor.dom.*` capability, rename clipboard writer to `writeSelection`, either prove or cut `origin`, keep `insertData` as paste entrypoint | `packages/slate-dom/test/clipboard-boundary.ts`, DOM capability type contract, focused copy/cut/drag browser rows |
| 4b. plugin/controller namespace proof | extension runtime and representative plugins | prove installed controller extensions expose local actions on `editor.<extension>`, deterministic reads on `state.<extension>`, and document writes on `tx.<extension>`; keep Block Selection out of raw Slate core model | extension namespace type/behavior contract using Block Selection-shaped fixture |
| 5. range preservation and snapshot policy | `packages/slate` bookmark/runtime state, docs/tests | replace public `rangeRef` docs with bookmark examples, move full snapshots to runtime/test policy, keep bookmarks local-only | `packages/slate/test/bookmark-contract.ts`, docs grep, docs selection-preservation contract |
| 6. browser/regression proof | `packages/slate-react`, `slate-browser`, Playwright rows | prove copy/cut/paste/drag, IME composition, delete/backspace, void/inline navigation, and operation-family replay | focused browser rows during implementation; `bun test:stress` before release-quality closure |

## 21. Fast Driver Gates

Fast implementation gates:

- `bun test ./packages/slate/test/state-tx-public-api-contract.ts`
- `bun test ./packages/slate/test/bookmark-contract.ts`
- `bun test ./packages/slate/test/public-surface-contract.ts`
- `bun test ./packages/slate/test/tx-transform-completeness-contract.ts`
- `bun test ./packages/slate/test/test-helper-boundary-contract.ts`
- `bun test ./packages/slate-dom/test/clipboard-boundary.ts`
- extension namespace type/behavior contract for `editor.dom.*` and a
  Block-Selection-shaped controller extension
- focused slate-react runtime tests for composition/mutation/caret/selection
- `bun check` before any implementation lane is called done

Slow gates:

- targeted browser rows for copy/cut/paste/drag/void/inline/composition
- generated stress families in `test:stress`, not fast CI

## 22. Final User-Review Handoff Outline

When ready, the final handoff must list:

- public API cuts
- public API keeps
- tx additions
- internal runtime split
- installed DOM/React capability decisions
- plugin/controller namespace decisions
- snapshot policy
- bookmark/range replacement
- Plate migration-backbone answer
- slate-yjs migration-backbone answer
- proof contracts
- high-risk proof lanes and remediation rules
- rejected alternatives
- implementation phases

## 23. Final Completion Gates

This Ralplan can be marked `done` only when:

- total score is at least `0.92`
- no dimension is below `0.85`
- every objection-ledger row has a final `keep` or `drop` verdict
- public `Editor` value decision is final
- clipboard writer name is final
- snapshot policy is final
- tx transform naming is final
- extension namespace shape is final
- no stale static `DOMEditor.*` / `ReactEditor.*` public-authoring decision
  remains
- test helper policy is final
- implementation phases have exact acceptance files
- high-risk deliberate pass is complete
- revision pass is complete
- no objection ledger row is unresolved
- `.tmp/continue.md` points at closure or completion
- no stale completion-check state points at an already completed pass

Closure result before extension-namespace reopen:

- score `0.92`
- minimum dimension score `0.91`
- all scheduled passes complete
- no unresolved objection-ledger rows
- all public API decisions final
- implementation phases have owner surfaces and acceptance files
- high-risk proof lanes are folded into fast/slow gates
- `.tmp/completion-check.md` was set to `done`

Current completion state: pending while the Ralph implementation lane runs.

## 24. Extension Namespace DX Reopen Pass

Status: complete.

Trigger:

- Follow-up API review raised a better DX possibility: every installed
  extension exposes one grouped namespace on `editor`, with matching `state` and
  `tx` namespaces where appropriate.
- This supersedes the earlier `DOMEditor.*` / `ReactEditor.*` public namespace
  decision.

Question to resolve:

- Should host and plugin APIs remain static namespaces, or should installed
  extensions expose grouped editor capabilities?

Accepted public shape:

```ts
const editor = createEditor()
  .extend(DOMExtension)
  .extend(ReactExtension)
  .extend(BlockSelectionExtension)

editor.dom.toDOMRange(range)
editor.dom.clipboard.insertData(dataTransfer)
editor.dom.clipboard.writeSelection(dataTransfer)

editor.blockSelection.add(id)
editor.blockSelection.getNodes()

editor.read((state) => {
  return state.blockSelection.isSelected(id)
})

editor.update((tx) => {
  tx.blockSelection.removeNodes()
})
```

Decision:

- Replace public `DOMEditor.*` / `ReactEditor.*` host namespaces with
  installed grouped capabilities like `editor.dom.*` and
  `editor.dom.clipboard.*`.
- Keep headless core editor small by making those groups available only after
  the matching extension is installed.
- Keep DOM/browser behavior out of `state` and `tx` because host I/O is not
  deterministic model state.
- Let plugin UI/controller features expose one grouped namespace:
  `editor.<plugin>.*` for actions and read helpers, `state.<plugin>.*` for
  selectors, and `tx.<plugin>.*` for document mutations.
- Replace tx root methods such as `tx.insertBreak()` and
  `tx.insertSoftBreak()` with grouped names: `tx.break.insert()` and
  `tx.break.insertSoft()`.

Why this wins:

- One installation story is better than a static host namespace plus plugin
  namespaces plus state/tx namespaces.
- It keeps headless raw Slate small: no DOM capability appears unless the DOM
  host extension is installed.
- It gives Plate a migration backbone without importing Plate naming into raw
  Slate. Plate's current `api` / `tf` split becomes raw Slate's
  `editor.<extension>` / `state.<extension>` / `tx.<extension>` substrate.
- It keeps browser `DataTransfer` I/O out of `tx`; host transport is not a
  deterministic model mutation.
- It keeps document mutations deterministic: if it changes document state, it
  belongs under `tx`.

Minimal extension authoring contract:

```ts
const BlockSelectionExtension = defineEditorExtension({
  key: 'blockSelection',
  state: () => ({
    anchorId: null,
    isSelecting: false,
    selectedIds: new Set<string>(),
  }),
  selectors: {
    isSelected(state, id: string) {
      return state.selectedIds.has(id)
    },
  },
  editor({ editor, state, setState }) {
    return {
      add(id: string) {
        setState((draft) => draft.selectedIds.add(id))
      },
      clear() {
        setState((draft) => draft.selectedIds.clear())
      },
      getNodes() {
        return editor.read((s) => s.nodes.matchByIds(state.selectedIds))
      },
    }
  },
  tx() {
    return {
      removeNodes(tx) {
        tx.nodes.remove({ at: tx.blockSelection.selectedTargets() })
      },
    }
  },
})
```

Installed capability rules:

- `editor.<extension>.*`: extension actions and read helpers. Local/UI state is
  allowed here.
- `state.<extension>.*`: deterministic read facts and selectors.
- `tx.<extension>.*`: document mutations and transaction-local reads.
- `editor.dom.*`: host bridge capability. It may touch DOM, selection, focus,
  and `DataTransfer`.
- no `state.dom.*` or `tx.dom.*` for host I/O.
- no root `editor.clipboard`, `editor.commands`, `editor.api`, or `editor.tf`.

Evidence:

- Plate block selection currently mixes local UI state, selectors, and document
  transforms across `api` and `tf` in
  `packages/selection/src/react/BlockSelectionPlugin.tsx`; raw Slate should
  provide the cleaner substrate rather than copying those names.
- Live Slate DOM still exposes `interface DOMEditor extends Editor` with
  helper-looking methods at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:51`.
- Live clipboard namespace still exposes `writeFragment` and ignores the
  `origin` option at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:603`.
- Live React editing kernel already represents paragraph and soft breaks as one
  command family, `{ kind: 'insert-break', variant: 'paragraph' | 'soft' }`,
  which supports grouped `tx.break.*`.

Non-goals:

- current-version Plate adapter compatibility
- adding Plate product command catalogs to raw Slate
- making DOM APIs available on headless editors without a DOM extension
- moving browser `DataTransfer` APIs into `tx`

Pass acceptance:

- static host namespaces vs grouped extension capabilities decided
- public API target, DOM/React target, implementation phases, proof matrix, and
  closure gates updated
- minimal extension authoring API recorded
- Block Selection classified as an installed controller extension, not Slate
  core model
- state/tx determinism and React 19.2 hot-path constraints preserved
- Plate/slate-yjs migration-backbone answer kept adapter-free

Next owner:

- none after post-extension closure.

## 25. Post-Extension Closure Score And Gates

Status: complete.

Closure checks:

- total score is `0.92`
- no scorecard dimension is below `0.85`
- every pass-state ledger row is complete
- public `Editor` value decision is final
- installed `editor.dom.*` host capability decision is final
- public static `DOMEditor.*` / `ReactEditor.*` are rejected as the normal
  authoring API
- `tx.break.insert` and `tx.break.insertSoft` are the final break transform
  names
- plugin/controller extension shape is final:
  `editor.<extension>` / `state.<extension>` / `tx.<extension>`
- Block Selection is classified as an installed controller extension, not raw
  Slate core model
- no stale completion state points back at the completed extension namespace
  pass

Result:

- Plan is user-review-ready.
- Implementation remains a later `ralph` lane.

## 26. Ralph Execution Lane

Status: pending.

Started: 2026-04-30T07:43:50Z.

Current owner:

- Phase 4 DOM/React host capability cleanup: `packages/slate-dom` and
  `packages/slate-react` host bridge APIs.

Completed slice:

- Inspect the live public `slate` exports and existing package tests.
- Add or update focused contracts for:
  - type-only `Editor`
  - top-level `isEditor(value)`
  - no public transform registry
  - no public stateful `Editor` value
- Keep tests focused on current intended API, not dead legacy assertions for
  their own sake.
- Phase 1 result: the contract already existed; the focused gate found stale
  React hook names in historical docs, which were removed.
- Phase 1 evidence:
  `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/public-field-hard-cut-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts`
  passed.

Phase 2 progress:

- Added transaction methods:
  - `tx.break.insert()`
  - `tx.break.insertSoft()`
  - `tx.fragment.delete(...)`
  - `tx.text.deleteBackward(...)`
  - `tx.text.deleteForward(...)`
- Migrated these React runtime callers away from direct
  `getEditorTransformRegistry(editor)` writes:
  - `packages/slate-react/src/editable/mutation-controller.ts`
  - `packages/slate-react/src/editable/composition-state.ts`
  - `packages/slate-react/src/editable/dom-repair-queue.ts`
  - `packages/slate-react/src/editable/caret-engine.ts`
  - `packages/slate-react/src/editable/selection-controller.ts`
  - `packages/slate-react/src/editable/selection-reconciler.ts`
  - `packages/slate-react/src/editable/clipboard-input-strategy.ts`
  - `packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
- Added tx namespace coverage to
  `packages/slate/test/state-tx-public-api-contract.ts`.
- Added a React authority contract that fences transform registry access to:
  - `packages/slate-react/src/editable/runtime-editor-api.ts`
  - `packages/slate-react/src/plugin/with-react.ts`
- Classified `with-react.ts` as extension override plumbing for Android
  insert-text behavior, not a normal runtime write path.

Phase 2 evidence:

- `bun test ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/public-field-hard-cut-contract.ts`
  passed.
- `bun --filter slate typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts`
  passed.
- `bun lint:fix` passed with no fixes.

Phase 2 result:

- complete.

Phase 3 progress:

- Replaced `packages/slate/src/create-editor.ts` broad `runtime: any` mirror
  with typed private runtime owner groups:
  - extension runtime
  - query runtime
  - ref runtime
  - snapshot runtime
  - transaction runtime
  - transform runtime
- Added `InternalEditorRuntime` owner-group types in
  `packages/slate/src/core/editor-runtime.ts`.
- Added a public-surface contract that forbids reintroducing
  `const runtime: any` or `Record<string, any>` for the private runtime.

Phase 3 evidence:

- `bun test ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/public-field-hard-cut-contract.ts`
  passed with 175 tests.
- `bun --filter slate typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts`
  passed.
- `bun lint:fix` passed.

Phase 3 result:

- complete.

Phase 4 initial target:

- Rename `DOMEditor.clipboard.writeFragment` /
  `ReactEditor.clipboard.writeFragment` to `writeSelection`.
- Cut the unused clipboard `origin` option.
- Replace public static host namespace authoring with installed
  `editor.dom.*` capabilities.
- Keep `insertData` as the paste entrypoint.

Phase 4 progress:

- Renamed `DOMEditor.clipboard.writeFragment` /
  `ReactEditor.clipboard.writeFragment` to `writeSelection`.
- Cut the unused clipboard `origin` option.
- Confirmed no `writeFragment`, `writeDOMFragmentData`, or clipboard
  `origin` call sites remain in Slate DOM/React source and focused tests.
- Installed `editor.dom.*` capabilities as the public host-authoring surface.
- Cut public static host value exports from `slate-dom` and `slate-react`
  package indexes; `DOMEditor` / `ReactEditor` remain public types only.
- Moved the private static DOM bridge used by `slate-react` to
  `slate-dom/internal`.
- Updated public docs, examples, and tests to use `editor.dom.*` for host
  authoring.
- Added a `slate-react` public-host-authoring contract that rejects
  `ReactEditor.*` / `DOMEditor.*` in public docs/examples.

Phase 4 evidence so far:

- `bun --filter slate-dom typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun test ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/clipboard-boundary.ts`
  passed with 12 tests.
- `bun test ./packages/slate-react/test/react-editor-contract.tsx ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/use-element-selected.test.tsx ./packages/slate-react/test/projections-and-selection-contract.tsx ./packages/slate-react/test/generic-react-editor-contract.tsx ./packages/slate-react/test/kernel-authority-audit-contract.ts`
  passed with 33 tests.
- `bun lint:fix` passed; it fixed formatting in five files, and the focused
  typechecks/tests passed again after lint.
- Stale-call grep confirms no public docs/examples/test authoring calls to
  `ReactEditor.*` / `DOMEditor.*`; only type-only `ReactEditor` references
  remain.

Phase 4 result:

- complete.

Phase 4b initial target:

- Add a representative extension namespace contract proving installed
  controller/plugin capabilities can expose local actions on
  `editor.<extension>`, deterministic reads on `state.<extension>`, and
  document writes on `tx.<extension>`.
- Keep Block Selection out of raw Slate core model.
- Do not add `editor.api`, `editor.tf`, `editor.commands`, or a product command
  catalog.

Phase 4b progress:

- Added generic installed editor extension groups through `extension.editor`.
- Added a Block Selection-shaped contract proving local actions on
  `editor.blockSelection`, deterministic reads on `state.blockSelection`, and
  document writes on `tx.blockSelection`.
- Kept product command catalogs out of raw Slate: no `editor.api`,
  `editor.tf`, or `editor.commands`.

Phase 4b evidence:

- `bun --filter slate typecheck` passed.
- `bun --filter slate-dom typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun test ./packages/slate/test/extension-namespace-contract.ts ./packages/slate/test/generic-extension-namespace-contract.ts ./packages/slate/test/migration-backbone-contract.ts ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate-dom/test/bridge.ts ./packages/slate-dom/test/clipboard-boundary.ts ./packages/slate-react/test/react-editor-contract.tsx ./packages/slate-react/test/surface-contract.tsx ./packages/slate-react/test/generic-react-editor-contract.tsx ./packages/slate-react/test/kernel-authority-audit-contract.ts`
  passed with 204 tests.
- `bun lint:fix` passed; it fixed one file, and the focused typechecks/tests
  passed again after lint.

Phase 4b result:

- complete.

Phase 5 initial target:

- Replace public `rangeRef` docs/examples with bookmark examples for durable
  range preservation.
- Move full-snapshot teaching to runtime/test policy.
- Keep normal app reads on narrow state groups such as `state.value`,
  `state.selection`, and extension state groups.
- Do not expose public `Editor.getSnapshot` as normal app authoring API.

Phase 5 changes:

- Added `state.runtime.snapshot()` and removed `state.value.snapshot()` from the
  normal public state surface.
- Added `state.ranges.bookmark(...)` so public examples can create durable local
  bookmarks without importing the internal `Editor` namespace.
- Updated `docs/concepts/07-editor.md` to teach narrow reads, runtime snapshots
  for debug/replay/test tooling, and bookmark-based local range preservation.
- Updated `site/examples/ts/review-comments.tsx` and
  `site/examples/ts/persistent-annotation-anchors.tsx` to use
  `state.ranges.bookmark(...)`; the persistent annotation example uses
  `state.value.get()` for document rows instead of full snapshots.
- Updated `packages/slate-react/src/editable/root-selector-sources.ts` to derive
  root runtime ids from `state.value.get()` and `state.runtime.idAt(...)`
  instead of a full snapshot.
- Added `packages/slate/test/support/snapshot.ts` and
  `packages/slate/test/test-helper-boundary-contract.ts` to keep assertion
  snapshots in test support and out of public Slate exports.
- Tightened `packages/slate/test/public-surface-contract.ts` so public
  docs/examples cannot teach `state.value.snapshot()` or internal `Editor`
  snapshot/ref/bookmark calls.

Phase 5 evidence:

- `bun --filter slate typecheck` passed.
- `bun --filter slate-react typecheck` passed.
- `bun test ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/bookmark-contract.ts ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/test-helper-boundary-contract.ts ./packages/slate-react/test/surface-contract.tsx`
  passed with 279 tests.
- `bun lint:fix` passed and fixed one file.
- After lint, `bun --filter slate typecheck`, `bun --filter slate-react
  typecheck`, and the focused 279-test contract command passed again.

Phase 5 result:

- complete.

Driver gates:

- focused `bun test` rows for the changed `packages/slate` contracts
- `bun check` before any implementation lane is marked done

Next owner after this slice:

- Start Phase 6 browser/regression proof.

Phase 6 changes:

- Added `slate-dom/internal` to `site/tsconfig.json` so Next/site typecheck uses
  the live source entry instead of stale package declarations.
- Added `slate-dom/internal` to `packages/slate-react/vitest.config.mjs` before
  the broader `slate-dom` alias so Vite resolves the internal host bridge
  source entry.

Phase 6 evidence:

- `bun --filter slate-browser typecheck` passed.
- `bun --filter slate-browser test:core` passed with 33 tests.
- Focused stress:
  `STRESS_FAMILIES=inline-void-boundary-navigation,block-void-navigation,table-cell-boundary-navigation,external-decoration-refresh,overlay-annotation-bookmark-rebase,mouse-selection-toolbar,paste-normalize-undo,selection-repair-ime PLAYWRIGHT_RETRIES=0 bun test:stress`
  passed with 11 Chromium tests.
- Focused integration:
  `PLAYWRIGHT_RETRIES=0 bun run playwright -- playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/inlines.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/richtext.test.ts --project=chromium -g "copies decorated|cuts decorated|inline cut typing|drop data|records core command metadata for text input and delete|Backspace deletes selected range|Delete deletes selected range"`
  passed with 7 Chromium tests.
- `bun lint:fix` passed with no fixes.
- `bun check` passed.

Phase 6 result:

- complete.

Implementation lane result:

- complete.
