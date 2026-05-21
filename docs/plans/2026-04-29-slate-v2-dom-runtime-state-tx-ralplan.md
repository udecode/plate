# Slate v2 DOM Runtime State/Tx Ralplan

Date: 2026-04-29
Status: done
Code repo: `/Users/zbeyens/git/slate-v2`
Plan repo: `/Users/zbeyens/git/plate-2`
Skill: `.agents/skills/slate-ralplan/SKILL.md`

## 1. Current Verdict

The public core hard cut is real, but the architecture is not fully clean yet.

`BaseEditor` now exposes only `read`, `update`, `subscribe`, and `extend`, which
is the right public shape. The remaining smell is that DOM/runtime packages
still preserve legacy editor-extension habits:

- `withDOM` mutates the editor instance with clipboard/data methods.
- `DOMEditor` delegates namespace clipboard/data APIs back to those instance
  methods.
- DOM and React runtime internals still use static `Editor.*` reads for normal
  model access where `editor.read((state) => ...)` should be the default.
- `EditorStateView` has no `state.fragment.get(...)`, so clipboard code falls
  back to `Editor.getFragment(...)`.

The next hard cut should not be "ban every `Editor.*` string everywhere". That
would be dumb. The clean rule is sharper:

1. Public editor object stays tiny.
2. DOM/React runtime code uses state/tx views for normal model reads and writes.
3. Static `Editor.*` stays internal implementation law only when a state/tx
   equivalent does not exist or when a pure data namespace is the right tool.
4. DOM host bridge capabilities live in DOM runtime helpers or a DOM namespace,
   not as methods attached to editor instances.

Current readiness score: `0.93`.

The Ralplan is closed and ready for user review before implementation.

## 2. Intent And Boundaries

Intent:

- Finish the hard cut implied by the public `BaseEditor` cleanup.
- Prevent DOM/React packages from recreating legacy instance-method APIs.
- Make fragment clipboard serialization read through the same state/tx
  lifecycle as every other model access.
- Keep raw Slate unopinionated and close to Slate terminology without copying
  legacy footguns.

Desired outcome:

- `withDOM(editor)` installs DOM capabilities without adding normal public
  methods to the editor instance.
- Clipboard and drag/drop serialization are DOM-owned, but model fragment reads
  are state-owned.
- DOM insertion paths write through `editor.update((tx) => ...)`, except for
  narrow internal runtime/middleware cases with explicit allowlist comments.
- Static `Editor.*` usage in `slate-dom` and `slate-react` is inventoried,
  reduced, and guarded so broad static reads do not creep back.

In scope:

- `packages/slate/src/interfaces/editor.ts`
- `packages/slate/src/core/public-state.ts`
- `packages/slate-dom/src/plugin/with-dom.ts`
- `packages/slate-dom/src/plugin/dom-editor.ts`
- `packages/slate-dom/src/utils/**` where static `Editor.*` reads are normal
  state reads
- `packages/slate-react/src/editable/**` clipboard, drag/drop, repair, kernel,
  browser-handle, and strategy paths that call DOM data APIs or static
  `Editor.*`
- focused clipboard/data tests and public-surface contracts
- generated browser proof rows for copy, cut, drag, void boundaries, HTML
  fallback, and follow-up paste/typing

Non-goals:

- current-version Plate adapter support
- current-version slate-yjs adapter support
- a product command catalog
- chain-style command sugar
- public `editor.refs`
- deleting pure data namespaces like `Node`, `Path`, `Point`, `Range`,
  `Element`, or `Text`
- banning all internal static helpers inside `packages/slate/src`

Decision boundaries:

- Hard cuts are allowed.
- No compatibility aliases before publish.
- If a method exists only because old Slate did, cut or rename it.
- If an internal helper is still needed, expose it from `slate/internal` or keep
  it package-local; do not attach it to the editor instance.
- If a DOM bridge helper is genuinely public integration surface, put it on a
  DOM/React namespace with a name that says what it does to the host object.

Unresolved user-decision points:

- None. The public helper naming can be decided from repo evidence.

Intent-boundary pass result:

- The goal is not to remove clipboard behavior. The goal is to remove editor
  instance method growth while keeping a usable DOM bridge for custom Editable
  integrations.
- The right public helper boundary is `DOMEditor.clipboard.*`.
- `ReactEditor.clipboard.*` should mirror it because `ReactEditor` currently
  aliases `DOMEditor` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts:13`.
- Package-private-only helpers are too pure and would push advanced users into
  copied internals.
- No user question is needed before continuing.

## 3. Decision Brief

Principles:

- One public state lifecycle: `editor.read` and `editor.update`.
- DOM code owns DOM transport; core state owns model facts.
- Public editor instances do not grow plugin methods.
- Runtime escape hatches are explicit and ugly enough that app authors do not
  mistake them for normal DX.
- Regression proof must exercise browser behavior, not just grep.

Top drivers:

- The `BaseEditor` hard cut is undermined if plugins add methods back onto the
  editor object.
- Clipboard/drag/drop is browser-sensitive; over-simplifying it will re-break
  voids, fragments, and HTML fallback.
- Plate/slate-yjs migration needs deterministic operations and fragment/model
  reads, not current-version adapters.

Viable options:

| Option                                                                                                                                            | Pros                                                                       | Cons                                                                                     | Verdict        |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| Keep `e.setFragmentData` / `e.insertData` instance methods                                                                                        | Closest to legacy Slate; smallest patch                                    | Reopens editor-object method growth and hides DOM capability ownership                   | reject         |
| Keep flat `DOMEditor.setFragmentData(editor, data)` but remove instance methods                                                                   | Better boundary; smaller API churn                                         | Name still sounds like editor state mutation and carries legacy vocabulary               | revise         |
| Use DOM clipboard namespace/helper: `DOMEditor.clipboard.writeFragment(editor, data, options)` and `DOMEditor.clipboard.insertData(editor, data)` | Names host side-effect, keeps editor instance clean, groups transport APIs | Slightly more API shape than legacy; tests/examples need edits                           | keep           |
| Make clipboard helpers package-private only                                                                                                       | Cleanest raw public API                                                    | Weak for custom `Editable` integrations and tests; likely pushes users to copy internals | reject for now |

Chosen option:

- Add grouped DOM/React clipboard helpers and remove data/clipboard instance
  methods from `DOMEditor`.
- Add `state.fragment.get(...)` and `tx.fragment.get(...)` so fragment reads no
  longer require `Editor.getFragment(...)`.
- Use `tx.fragment.insert(...)` / `tx.text.insert(...)` for insertion paths.
- Lock helper naming to `DOMEditor.clipboard.*` and mirrored
  `ReactEditor.clipboard.*`.

Consequences:

- `withDOM` becomes a DOM capability installer, not an editor-method extender.
- Tests must call namespace/helper APIs instead of instance methods.
- Some `Editor.*` internals will remain until state/tx grows equivalent helpers
  or the code is proven to need the lower-level runtime function.

Follow-ups:

- Inventory every static `Editor.*` call in `slate-dom` and `slate-react` and
  classify it as `state`, `tx`, `internal`, `data namespace`, or `cut`.
- Add a static-read allowlist guard so future PRs do not backslide.

## 4. Confidence Scorecard

| Dimension                                  | Score | Evidence                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | ----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance             |  0.93 | Ledger accepts the staged cleanup: event-scoped writes first, hot observer reads second, temporary ref/bridge allowances last. The high-risk proof names render/hot-path guards instead of broad React rerender assertions.                                                        |
| Slate-close unopinionated DX               |  0.92 | `DOMEditor.clipboard.*` / `ReactEditor.clipboard.*` is locked. App authors keep `read` / `update`; custom bridge authors get one DOM namespace; no `editor.clipboard` and no legacy aliases.                                                                                       |
| Plate/slate-yjs migration backbone         |  0.93 | Plugin layers can wrap clipboard helpers without monkey-patching. Model mutation stays in tx and the proof plan requires deterministic operation replay after paste/cut.                                                                                                           |
| Regression-proof testing strategy          |  0.93 | High-risk proof now names exact package, React, browser, stress, and guard targets: `state-tx-public-api-contract.ts`, `clipboard-contract.ts`, `clipboard-boundary.ts`, React surface contracts, highlighted-text/paste-html/inlines browser rows, and generated stress families. |
| Research evidence completeness             |  0.92 | Existing compiled research covers Lexical read/update, ProseMirror transaction/DOM authority, Tiptap extension DX, and prior clipboard boundary ownership. No fresh raw ingest needed for this narrow pass.                                                                        |
| shadcn-style composability / minimal props |  0.91 | Grouped clipboard helpers are minimal and composable. The plan rejects flat editor command growth, keeps product APIs above raw Slate, and names React helper surfaces without adding render props.                                                                                |

Weighted total: `0.93`.

Gate result:

- Meets the numeric Slate Ralplan threshold.
- Status is `done`.
- Next owner: user review or a later implementation plan.

## 5. Source-Backed Architecture North Star

Accepted north star:

```txt
Slate model + operations
read/update lifecycle
state/tx grouped namespaces
DOM host bridge owned by DOM runtime helpers
React as projection/event wiring, not model engine
generated browser proof for editing behavior
```

Evidence:

- `BaseEditor` currently exposes only `read`, `subscribe`, `update`, and
  `extend` in `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:364`.
- `EditorStateView` has grouped state APIs but no fragment read group in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:336`.
- `EditorUpdateTransaction` has `fragment.insert` but not `fragment.get` in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:840`.
- Existing research accepts `state`/`tx` callback APIs in
  `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`.
- Existing research accepts read/update lifecycle in
  `docs/research/decisions/slate-v2-read-update-runtime-architecture.md`.

Research/live-source refresh result:

- Lexical evidence supports `read` / `update` as the lifecycle boundary,
  update tags for paste/collaboration/DOM-selection policy, dirty
  leaf/element-driven reconciliation, and extension packaging. This supports
  state/tx fragment access and rejects editor-instance method growth.
- ProseMirror evidence supports transaction-owned document/selection/mark
  changes and a single view/input owner for DOM event handling, observer
  flushing, composition, and DOM selection import/export. This supports DOM
  clipboard helpers owning host transport while core owns model fragments.
- Tiptap evidence supports extension ergonomics and React selector discipline,
  but it is product-DX evidence, not a reason to put command/catalog methods on
  raw Slate's editor instance.
- The earlier clipboard boundary plan already found the two-package split:
  core owns selected-fragment meaning and insertion semantics; DOM owns MIME
  keys, `DataTransfer`, HTML scraping, plain-text fallback, and payload
  provenance. Its old `Editor.getFragment` / `Transforms.insertFragment` names
  are superseded by the current state/tx hard cut, but the package ownership
  remains correct.
- No raw-source refresh is required for this pass. Existing compiled research
  already has a full corpus ledger for Lexical, ProseMirror, and Tiptap, plus a
  prior clipboard ownership plan.

Live-source refresh result:

- `slate-dom` / `slate-react` still contain broad static `Editor.*` usage across
  DOM utilities, selection reconciliation, clipboard, mutation, projection,
  root selectors, browser handles, and React components.
- The strongest cut bucket is not only `Editor.getFragment`. Static writes such
  as `Editor.insertText`, `Editor.deleteFragment`, `Editor.deleteBackward`,
  `Editor.deleteForward`, `Editor.insertBreak`, `Editor.insertSoftBreak`, and
  `Editor.replace` also need tx migration or explicit internal runtime
  allowlisting.
- Static observer reads such as `Editor.getSnapshot`, `Editor.getOperations`,
  `Editor.getChildren`, `Editor.getLastCommit`, `Editor.getRuntimeId`, and
  `Editor.getPathByRuntimeId` need source-selector/live-state replacement or a
  named observer allowance.
- Ref helpers such as `Editor.rangeRef`, `Editor.pointRef`, and
  `Editor.pathRef` are not automatically bad; they need an explicit internal
  runtime allowance until a better state/tx/runtime reference API exists.
- Schema/traversal helpers such as `Editor.isVoid`, `Editor.isInline`,
  `Editor.isBlock`, `Editor.range`, `Editor.point`, `Editor.hasPath`,
  `Editor.above`, and `Editor.void` should move to state/tx groups where they
  are normal model reads, but some DOM point/range mapping call sites may need
  temporary runtime allowances.

Pressure pass result:

- Performance pass:
  - first priority is event-scoped static writes and clipboard instance methods,
    because they affect actual editing behavior and can bypass the transaction
    lifecycle.
  - second priority is hot observer reads in React runtime/source paths:
    `Editor.getSnapshot`, `Editor.getOperations`, `Editor.getChildren`,
    `Editor.getLastCommit`, runtime-id reads, projection/root-selector reads,
    and browser-handle snapshots.
  - third priority is schema/traversal reads in DOM bridge code:
    `Editor.isVoid`, `Editor.isInline`, `Editor.isBlock`, `Editor.range`,
    `Editor.point`, `Editor.hasPath`, `Editor.above`, `Editor.void`.
  - refs are not a first-priority cut. `rangeRef`, `pointRef`, and `pathRef`
    remain temporary internal runtime allowances until a better state/tx/runtime
    reference API is designed.
- DX pass:
  - raw app DX stays `editor.read` / `editor.update`.
  - advanced DOM bridge DX is `DOMEditor.clipboard.*` and
    `ReactEditor.clipboard.*`.
  - no `editor.clipboard`, no flat `setFragmentData`, no compatibility alias.
  - `state.fragment.get(...)` and `tx.fragment.insert(...)` are the fragment
    pair; `tx.fragment.get(...)` exists only for tx-local reads.
- Migration pass:
  - Plate/plugin layers can wrap DOM clipboard helpers from extension code
    without mutating the editor instance.
  - slate-yjs/collab proof depends on deterministic operations from
    `tx.fragment.insert(...)`, not DOM payload transport.
  - clipboard origin/format metadata stays DOM-side unless a commit tag is
    explicitly needed for history/collab/runtime behavior.
- Regression pass:
  - start with a red public-surface test that fails while DOM data methods are
    on the editor instance.
  - add state/tx fragment red tests before touching DOM transport.
  - keep existing clipboard boundary behavior but migrate tests off
    `source.setFragmentData(...)`.
  - add React copy/cut/drag handler tests for the new namespace.
  - browser rows must assert model text, model selection, visible DOM, DOM
    selection where observable, payload MIME/HTML/plain text, and follow-up
    typing.
- Simplicity pass:
  - do not migrate every static `Editor.*` call in one batch.
  - do not invent `editor.dom`, `editor.clipboard`, or a product command layer.
  - do not wrap pure data namespaces.
  - keep temporary internal allowances explicit and small.

Pressure-pass priority order:

1. `state.fragment.get` / `tx.fragment.get` plus DOM clipboard namespace cut.
2. Clipboard/mutation static write migration to tx APIs.
3. Hot observer read migration to state/source-selector/live-state APIs.
4. Schema/traversal read migration where call sites are normal model reads.
5. Ref helper classification and possible future runtime refs API.

Temporary internal allowance categories:

- ref helpers: `rangeRef`, `pointRef`, `pathRef`
- pure type/data predicates: `Editor.isEditor` until replaced by top-level
  `isEditor`
- host bridge mapping calls where state/tx cannot yet represent the operation
  without worse indirection
- trace/debug reads of operations/commits until source selectors own the same
  fact

Rejected pressure-pass alternatives:

- all-at-once static `Editor.*` migration: too risky and too noisy
- public `editor.clipboard`: violates the editor-instance hard cut
- package-private-only clipboard helpers: too hostile for custom Editable
  integrations
- grep-only proof: catches strings, not broken copy/cut/drag behavior

## 6. Public API Target

Core editor:

```ts
editor.read((state) => {
  const fragment = state.fragment.get();
});

editor.update((tx) => {
  tx.fragment.insert(fragment);
});
```

State fragment API:

```ts
state.fragment.get();
state.fragment.get({ at: range });
```

Transaction fragment API:

```ts
tx.fragment.get()
tx.fragment.get({ at: range })
tx.fragment.insert(fragment, options?)
```

DOM clipboard API:

```ts
DOMEditor.clipboard.writeFragment(editor, data, {
  formatKey,
  origin: "copy",
});

DOMEditor.clipboard.insertData(editor, data);
DOMEditor.clipboard.insertFragmentData(editor, data);
DOMEditor.clipboard.insertTextData(editor, data);
```

React bridge API:

```ts
ReactEditor.clipboard.writeFragment(editor, data, { origin: "copy" });
ReactEditor.clipboard.insertData(editor, data);
```

Cut:

```ts
editor.setFragmentData(data);
editor.insertData(data);
editor.insertFragmentData(data);
editor.insertTextData(data);
```

Avoid:

```ts
Editor.getFragment(editor);
```

in package runtime code when the equivalent is:

```ts
editor.read((state) => state.fragment.get());
```

## 7. Internal Runtime Target

`withDOM` should install capability state, not instance methods:

```ts
export const withDOM = (editor, options) => {
  installDOMRuntime(editor, { clipboardFormatKey });
  return editor as T & DOMEditorBrand;
};
```

The runtime owns:

- clipboard format key
- DOM element/key weak maps
- pending diffs
- pending selection/action state
- DOM serialization helpers
- plain-text and HTML fallback conversion

The state/tx runtime owns:

- current selection
- selected model fragment
- fragment insertion
- text insertion
- selection transforms
- path/range traversal

Allowed internal escape hatches:

- operation middleware can use lower-level runtime helpers when `state`/`tx`
  cannot represent an in-flight operation yet
- path refs can remain internal until a dedicated state/tx or runtime helper is
  designed
- `slate/internal` can export narrow helpers for other first-party packages

Not allowed:

- first-party package code adding normal methods to editor instances
- using static `Editor.*` reads in DOM/React runtime code just because the
  state/tx API is missing a method
- using `getEditorTransformRegistry` as the normal write path outside explicit
  runtime/middleware code

## 8. Hook / Component / Render DX Target

No direct React render API change is needed in this lane.

React clipboard handlers should call the DOM/React clipboard namespace, not
editor instance methods:

```ts
ReactEditor.clipboard.writeFragment(editor, clipboardData, {
  origin: "copy",
});
```

The key DX rule:

- app authors see `onCopy`, `onCut`, `onPaste`, and normal Slate editor
  `read/update`
- custom bridge authors see a DOM clipboard helper
- nobody sees `e.setFragmentData`

## 9. Plate Migration-Backbone Target

Plate does not need current-version adapters in raw Slate.

The required backbone is:

- plugin-defined state/tx namespaces can wrap DOM clipboard helpers
- core fragment reads are deterministic state reads
- clipboard writes carry explicit `origin`, `formatKey`, and payload semantics
- no plugin has to monkey-patch editor instances to add clipboard behavior

Plate can build product APIs over:

```ts
editor.update((tx) => {
  tx.fragment.insert(fragment);
});
```

and optional product commands without polluting raw Slate core.

## 10. slate-yjs Migration-Backbone Target

slate-yjs needs deterministic model operations, not DOM clipboard shims.

This lane preserves that by:

- keeping fragment reads in core state
- keeping fragment insertion in tx
- keeping DOM transport payload handling outside the shared model runtime
- avoiding editor-instance method patches that collaboration layers might
  accidentally treat as stable editor capabilities

Proof required before closure:

- fragment insertion from clipboard still emits deterministic Slate operations
- replayed operations produce the same model snapshot
- DOM payload metadata does not leak into shared model data

## 11. Legacy Regression Proof Matrix

| Regression family           | Required proof                                                |
| --------------------------- | ------------------------------------------------------------- |
| copy selected text          | model fragment, MIME payload, HTML attribute, plain text      |
| cut selected text           | write clipboard, delete expanded selection, follow-up typing  |
| drag selected void          | select void, write fragment, drop inserts deterministic model |
| custom clipboard format key | custom MIME used, default MIME absent                         |
| HTML-only fallback          | `data-slate-fragment` from HTML still inserts                 |
| plain text fallback         | multiline text splits and inserts correctly                   |
| void boundary copy          | start/end void spacer does not create visible spacer layout   |
| decorated leaves            | render-only wrappers stripped from copied HTML                |
| IME/composition adjacency   | clipboard helpers do not import repair-induced selection      |

## 12. Browser Stress / Parity Strategy

Fast CI rows:

- package clipboard boundary tests
- public surface contract for no DOM data instance methods
- static-read guard over `slate-dom` and hot `slate-react` runtime paths
- focused React clipboard/cut/drag tests

Stress rows:

- generated browser copy/cut/paste/drag sequences across paragraphs, inline
  voids, block voids, editable voids, decorations, and tables
- model text, model selection, visible DOM, DOM selection, payload MIME, and
  follow-up typing assertions

Do not put full stress in `bun check`.

`bun check` must stay fast. Full generated browser sweep belongs to
`bun check:full` / sparse `test:stress`.

## 13. Applicable Implementation-Skill Review Matrix

| Lens                        | Applicability | Finding                                                                                                                                                                 | Plan delta                                                                  |
| --------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Vercel React best practices | applied       | Avoid broad React rerenders; clipboard helpers should run in event handlers and keep transient DataTransfer out of render state.                                        | React event paths call namespace helpers; no React state added.             |
| performance-oracle          | applied       | Repeated full static reads and clone/serialization must stay event-scoped; static snapshot reads in render/projection paths need separate review.                       | Add static-read classification and keep clipboard serialization event-only. |
| tdd                         | applied       | This is public API + behavior. Tests should prove behavior through DOMEditor/ReactEditor public helpers and browser contracts, not grep-only implementation assertions. | Red tests: no instance methods; clipboard behavior still works.             |
| shadcn                      | skipped       | No UI chrome/component styling in this lane.                                                                                                                            | No change.                                                                  |
| react-useeffect             | skipped       | No effect lifecycle change in this lane.                                                                                                                                | No change.                                                                  |

## 14. High-Risk Deliberate Mode

Trigger:

- public/first-party DOM API shape
- browser clipboard behavior
- drag/drop behavior
- model fragment read/write semantics
- package boundary cleanup

Blast radius:

- `packages/slate`
- `packages/slate-dom`
- `packages/slate-react`
- clipboard boundary tests
- React editable clipboard strategy tests
- browser integration rows
- docs/examples that mention clipboard helpers

Pre-mortem:

1. Clipboard regression: method rename succeeds but copied fragment no longer
   carries Slate MIME or HTML attribute.
2. Void regression: moving off legacy spacer-specific code makes copying/dragging
   block or inline voids include hidden anchors or miss the node.
3. Collaboration regression: insertion path bypasses transaction metadata and
   produces operations that replay differently.

Expanded proof plan:

| Risk                                                               | Proof owner          | Exact target                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state.fragment.get` reads the wrong range or stale selection      | core unit            | Extend `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts` with `state.fragment.get()` and `state.fragment.get({ at })`; migrate selected-fragment assertions in `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts` away from `Editor.getFragment(editor)`. |
| tx fragment reads drift from write-time draft state                | core unit            | Extend `/Users/zbeyens/git/slate-v2/packages/slate/test/state-tx-public-api-contract.ts` with `tx.fragment.get()` before and after `tx.fragment.insert(...)` inside one `editor.update`.                                                                                                                       |
| copied payload loses Slate MIME, HTML, or plain text               | DOM unit             | Extend `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts` and `.test.ts` with `DOMEditor.clipboard.writeFragment writes Slate MIME, HTML data-slate-fragment, and plain text`.                                                                                                        |
| HTML-only and plain-text fallback regress                          | DOM unit             | Keep and migrate `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts`; add `DOMEditor.clipboard.insertData handles Slate MIME, HTML-only fallback, and plain text fallback`.                                                                                                            |
| editor instance methods sneak back                                 | public surface guard | Extend `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts` or add a `slate-dom` surface contract proving `setFragmentData`, `insertData`, `insertFragmentData`, and `insertTextData` are absent from editor instances and `DOMEditor` instance types.                                 |
| React bridge diverges from DOM bridge                              | React unit           | Extend `/Users/zbeyens/git/slate-v2/packages/slate-react/test/react-editor-contract.tsx` with `ReactEditor.clipboard mirrors DOMEditor.clipboard`.                                                                                                                                                             |
| React copy/cut/drag handlers bypass namespace or mutate outside tx | React integration    | Add or extend `/Users/zbeyens/git/slate-v2/packages/slate-react/test/clipboard-input-strategy-contract.test.tsx`; assert copy writes payload, cut deletes through tx, drag writes fragment, and follow-up typing preserves selection.                                                                          |
| static `Editor.*` creeps back into hot runtime paths               | guard                | Extend `/Users/zbeyens/git/slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts` and `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`; encode allowed categories for refs, host bridge mapping, trace/debug reads, and package-local runtime facades only.              |
| decorated leaves copy render wrappers instead of model fragment    | browser              | Keep `/Users/zbeyens/git/slate-v2/playwright/integration/examples/highlighted-text.test.ts` rows `copies decorated text as fragment semantics instead of leaking highlight wrappers` and `cuts decorated text as fragment semantics and deletes the selection`.                                                |
| paste/drop transport regresses                                     | browser              | Keep `/Users/zbeyens/git/slate-v2/playwright/integration/examples/paste-html.test.ts` rows `paste-html-generated-clipboard-gauntlet` and `paste-html-generated-drop-data-gauntlet`.                                                                                                                            |
| inline boundary cut/paste typing regresses                         | browser              | Keep `/Users/zbeyens/git/slate-v2/playwright/integration/examples/inlines.test.ts` row `inlines-generated-cut-typing-gauntlet`.                                                                                                                                                                                |
| generated stress misses clipboard/void classes                     | stress               | Extend `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts` with families `clipboard-fragment-round-trip`, `cut-follow-up-typing`, `void-copy-drag-drop`, and keep existing `paste-normalize-undo` / `paste-html-image-void`.                                                             |
| collaboration replay differs after clipboard mutation              | core/collab unit     | Extend `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts` or `/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-contract.ts` with operation replay after paste/cut insertion.                                                                                      |

Static `Editor.*` implementation buckets:

| Bucket                        | Rule                                                                                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cut first                     | `Editor.getFragment` in DOM clipboard serialization; DOM instance clipboard methods; static write calls in clipboard/cut paths when a tx method exists.            |
| Migrate next                  | `Editor.insertText`, `deleteFragment`, `deleteBackward`, `deleteForward`, `insertBreak`, `insertSoftBreak`, and `replace` in React mutation/input paths.           |
| Source-selector/live-state    | `Editor.getSnapshot`, `getOperations`, `getChildren`, `getLastCommit`, runtime-id reads, projection-store, widget-store, root-selector, and browser-handle reads.  |
| State query groups            | `Editor.range`, `point`, `before`, `after`, `above`, `void`, `hasPath`, `levels`, `isVoid`, `isInline`, and `isBlock` when the caller is doing normal model reads. |
| Temporary internal allowances | `rangeRef`, `pointRef`, `pathRef`, pure `Editor.isEditor`, trace/debug reads, and host bridge mapping calls until dedicated runtime facades exist.                 |

Commands:

```sh
cd /Users/zbeyens/git/slate-v2
bun test packages/slate/test/state-tx-public-api-contract.ts packages/slate/test/clipboard-contract.ts packages/slate-dom/test/clipboard-boundary.ts packages/slate/test/public-surface-contract.ts
(cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/react-editor-contract.test.tsx test/surface-contract.test.tsx test/clipboard-input-strategy-contract.test.tsx)
bunx playwright test playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/inlines.test.ts --project=chromium
bun --filter slate-browser build
PLAYWRIGHT_RETRIES=0 playwright test playwright/stress/generated-editing.test.ts --project=chromium --grep "clipboard-fragment-round-trip|cut-follow-up-typing|void-copy-drag-drop|paste-normalize-undo|paste-html-image-void"
```

Hard-cut answer:

- No aliases for old instance methods.
- Tests and docs migrate to the new namespace/helper shape in the same tranche.
- If a hidden dependency needs the old instance method shape, the answer is not
  a shim. Move that dependency to `DOMEditor.clipboard.*` or keep it
  package-local behind the DOM runtime helper.

Rollback/remediation answer:

- Revert the implementation tranche, not the API decision.
- Keep the red public-surface tests in place if implementation backs out; they
  are the contract.
- If a browser row fails, add the failing operation family to
  `playwright/stress/replay.test.ts` before retrying a smaller patch.

High-risk verdict:

- keep the plan
- do not split the DOM clipboard namespace from the state/tx fragment work
- do split implementation into the five phases below

## 15. Revision Pass Result

Coherence sweep:

- no scope contradiction remains between the public `DOMEditor.clipboard.*` /
  `ReactEditor.clipboard.*` decision and the rejected package-private helper
  option
- no terminology drift remains between "state fragment API" and
  `state.fragment.get(...)`
- closure is a separate final pass, not bundled into revision
- high-risk proof targets are exact enough for implementation to start without
  inventing missing test ownership
- no user-decision question remains

Revisions made:

- removed "would change the decision" alternatives that contradicted the locked
  public DOM/React clipboard namespace
- replaced the open-questions section with closure-only checks
- raised score to `0.93` because every scored dimension now has evidence and
  no dimension is below threshold
- kept status `pending` during the revision pass because the final closure
  score/gates pass still had to run

Revision verdict:

- keep the plan
- no replan needed
- next owner: closure score and gates

## 16. Closure Score And Gates Result

Closure checks:

- total score is `0.93`, above the `0.92` threshold
- no dimension is below `0.85`
- all major decisions have a decision brief, rejected alternatives, and
  accepted objection-ledger rows
- row 3 in the objection ledger is `keep`
- public DOM/React clipboard helper naming is locked to
  `DOMEditor.clipboard.*` / `ReactEditor.clipboard.*`
- implementation phases name acceptance tests
- high-risk proof plan names exact unit, React, browser, stress, guard, and
  collab targets
- pass-state ledger shows every pass before closure as complete
- no user-decision questions remain
- `.tmp/<session-id>/completion-check.md` is set to `done`

Closure verdict:

- done
- no implementation code was changed in this Ralplan lane
- next owner: user review, then a later implementation plan if accepted

## 17. Hard Cuts And Rejected Alternatives

Cut:

- `DOMEditor` instance methods: `setFragmentData`, `insertData`,
  `insertFragmentData`, `insertTextData`
- `withDOM` assigning those methods to `e`
- tests calling `source.setFragmentData(...)`
- public docs/examples teaching `ReactEditor.setFragmentData(...)` if a renamed
  clipboard namespace is accepted

Revise:

- flat `DOMEditor.setFragmentData(editor, data, origin)` to grouped clipboard
  helper naming
- static `Editor.getFragment` use to `state.fragment.get`
- static `Editor.void`, `Editor.range`, `Editor.point`, `Editor.before`,
  `Editor.after`, `Editor.hasPath`, `Editor.levels` in DOM/React runtime code
  to state/tx equivalents when practical

Keep:

- pure data namespaces
- internal low-level runtime helpers inside `packages/slate/src`
- `DOMEditor.toDOMRange`, `DOMEditor.toSlateRange`, `DOMEditor.toDOMNode`, and
  similar host bridge functions

Rejected:

- keeping old names as aliases
- adding `editor.clipboard`
- putting DOM clipboard transport on core `tx`
- making Plate-style command sugar part of raw Slate

## 18. Slate Maintainer Objection Ledger

### Row 1: Remove DOM data methods from editor instances

Change:

- `editor.setFragmentData(data)` -> `DOMEditor.clipboard.writeFragment(editor, data, options)`
- `editor.insertData(data)` -> `DOMEditor.clipboard.insertData(editor, data)`

Who feels pain:

- raw Slate custom Editable authors
- test authors
- plugin authors who copied legacy Slate patterns

Likely objection:

- "This is churn. Slate has always let DOM plugins add editor methods."

Steelman antithesis:

- Keeping methods on the editor is familiar and avoids another namespace.

Tradeoff tension:

- Custom integrations type a longer call and need to learn the clipboard
  namespace.

Why not change for change's sake:

- The editor instance was just hard-cut to four public methods. Letting DOM
  plugins add instance methods immediately reopens the exact API surface we cut.

Evidence:

- `withDOM` assigns instance methods in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts:258`
  and `:346`.
- `DOMEditor` delegates namespace calls back to instance methods in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:591`
  and `:615`.

Rejected alternative:

- Keep `DOMEditor.setFragmentData` flat and remove only instance methods. This
  is acceptable fallback, but grouped clipboard helpers are clearer.

Migration answer:

- Replace instance calls with DOM/React clipboard namespace calls.

Docs/example answer:

- Clipboard docs show one custom copy handler and one custom paste handler.

Regression proof:

- Clipboard boundary unit tests and generated browser copy/cut/drag rows.

Ecosystem answers:

- Plate/plugin: extension namespaces can call DOM helpers without monkey
  patching editor instances.
- slate-yjs/collab: model mutation stays in tx; DOM payload metadata stays out
  of shared operations.

Verdict: keep.

### Row 2: Add `state.fragment.get(...)`

Change:

- `Editor.getFragment(editor)` -> `editor.read((state) => state.fragment.get())`

Who feels pain:

- core implementers and test authors

Likely objection:

- "Fragment is just another query; why add another group?"

Steelman antithesis:

- `state.value` and `state.nodes` could already express this with
  `state.selection.get()` plus `Node.fragment`.

Tradeoff tension:

- Adds one more state group.

Why not change for change's sake:

- Clipboard needs selected-fragment reads as a first-class model fact. Without
  it, code reaches for static `Editor.getFragment`, which contradicts the
  state/tx public lifecycle.

Evidence:

- `EditorStateView` lacks a fragment group at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:336`.
- `tx.fragment.insert` exists at
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:840`.
- `withDOM` currently calls `Editor.getFragment` at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts:329`.

Rejected alternative:

- Keep `Editor.getFragment` as the recommended internal helper. That keeps the
  old namespace alive because state is missing a normal read.

Migration answer:

- Reads become `state.fragment.get()`; writes remain `tx.fragment.insert(...)`.

Docs/example answer:

- Fragment docs show copy/paste model flow through state/tx.

Regression proof:

- state/tx fragment contract plus clipboard boundary round-trip tests.

Ecosystem answers:

- Plate/plugin: product commands can wrap `state.fragment.get`.
- slate-yjs/collab: fragment read stays deterministic snapshot/transaction
  state, not DOM state.

Verdict: keep.

### Row 3: Static `Editor.*` in first-party runtime packages

Change:

- classify and reduce static `Editor.*` calls in `slate-dom` / `slate-react`
  by priority instead of attempting one giant migration

Who feels pain:

- runtime maintainers

Likely objection:

- "These imports are internal. Why are we spending time on them?"

Steelman antithesis:

- Static internal helpers are sometimes the simplest way to share core logic
  across packages.

Tradeoff tension:

- Overzealous migration may wrap every low-level helper in noisy state calls.

Why not change for change's sake:

- Some calls are normal model reads and writes leaking through old habits.
  Others are legitimate low-level DOM bridge utilities. The architecture needs
  a classification, not a blind ban.
- The pressure pass now splits the cleanup into executable tranches: writes,
  hot observer reads, schema/traversal reads, then refs.

Evidence:

- `withDOM` uses static reads for block/range/path-ref work at
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts:113`,
  `:120`, `:217`, `:394`, and `:416`.
- `DOMEditor` uses static reads for drop targeting, focus initialization, and
  range validation in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts:333`,
  `:459`, and `:580`.
- React clipboard strategy calls static reads during cut/drag in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts:193`
  and `:369`.
- Live inventory found static writes (`Editor.insertText`,
  `Editor.deleteFragment`, `Editor.deleteBackward`, `Editor.deleteForward`,
  `Editor.insertBreak`, `Editor.insertSoftBreak`, `Editor.replace`), observer
  reads (`Editor.getSnapshot`, `Editor.getOperations`, `Editor.getChildren`,
  `Editor.getLastCommit`, runtime-id reads), refs, and traversal/schema reads.

Rejected alternative:

- Ban all static `Editor.*` outside `packages/slate`. That would force bad
  wrappers for legitimate DOM bridge operations.
- Leave all static `Editor.*` calls alone because they are "internal". That
  would keep the old namespace as the de facto first-party runtime API.

Migration answer:

- Migrate in this order:
  1. clipboard/data instance methods plus `state.fragment.get` /
     `tx.fragment.get`
  2. clipboard/mutation static writes to tx APIs
  3. hot observer reads to state/source-selector/live-state APIs
  4. schema/traversal reads to state/tx groups where they are normal model
     reads
  5. ref helpers after a dedicated runtime refs answer exists
- Keep only temporary internal allowances with explicit categories and tests.

Docs/example answer:

- Internal contributor docs list the allowed categories and priority order.

Regression proof:

- static-read guard plus focused behavior tests.

Ecosystem answers:

- Plate/plugin: sees state/tx extension surface, not static runtime internals.
- slate-yjs/collab: write paths stay transaction-owned.

Verdict: keep.

### Row 4: Temporary internal allowances for refs and host bridge mapping

Change:

- allow a small, explicit internal bucket for `rangeRef`, `pointRef`,
  `pathRef`, pure `isEditor` checks, trace/debug reads, and host bridge mapping
  calls until better state/tx/runtime helpers exist

Who feels pain:

- maintainers who want a perfectly clean grep result
- implementers who need to distinguish real debt from acceptable runtime
  plumbing

Likely objection:

- "Allowance buckets become the new junk drawer."

Steelman antithesis:

- A hard grep ban is easier to understand and enforce.

Tradeoff tension:

- The plan accepts some remaining static internal calls, so the implementation
  has to maintain a clear allowlist.

Why not change for change's sake:

- Ref and host bridge mapping helpers are not the same problem as
  `e.setFragmentData` or `Editor.insertText`. Forcing them through state/tx now
  would create wrapper noise without improving app DX or browser behavior.

Evidence:

- `withDOM` uses path refs around operation middleware in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/plugin/with-dom.ts:217`
  and `:416`.
- React runtime files use `rangeRef` in browser-handle, event-engine,
  root-engine, and selection-reconciler paths.
- DOM bridge files use point/range helpers around host point conversion and
  selection mapping.

Rejected alternative:

- No allowances. This would optimize for grep aesthetics over runtime clarity.

Migration answer:

- Allowances are temporary categories, not public API.
- Each allowed category needs a comment or facade explaining why state/tx is
  not the right surface yet.
- Once a dedicated runtime refs API exists, ref helpers move out of the static
  `Editor.*` allowance bucket.

Docs/example answer:

- Contributor docs and guard comments say "allowed runtime bridge/ref helper",
  not "use this in apps".

Regression proof:

- allowlist guard checks categories, not raw `Editor.*` string absence.
- behavior tests remain responsible for clipboard, selection, drag/drop, and
  follow-up typing.

Ecosystem answers:

- Plate/plugin: no public dependence on these helpers.
- slate-yjs/collab: no model mutation occurs through the allowance bucket.

Verdict: keep.

## 19. Pass Schedule And Pass-State Ledger

| Pass                                                           | Status   | Evidence added                                                                                                                                      | Plan delta                                                                                                                                                              | Open issues                                                                       | Next owner                                                   |
| -------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| current-state read and initial score                           | complete | live source lines for `withDOM`, `DOMEditor`, `EditorStateView`, clipboard tests, research pages                                                    | new plan created, score `0.78`                                                                                                                                          | static `Editor.*` inventory incomplete                                            | intent-boundary pass                                         |
| intent/boundary and decision brief                             | complete | `ReactEditor` aliases `DOMEditor`; current `setFragmentData`/`insertData` calls are first-party clipboard integration points                        | locked `DOMEditor.clipboard.*` + mirrored `ReactEditor.clipboard.*`; no user question needed; score raised to `0.82`                                                    | exact static `Editor.*` allowlist still open                                      | research/live-source refresh                                 |
| research and live-source refresh                               | complete | Lexical/ProseMirror/Tiptap compiled research, prior clipboard ownership plan, live static `Editor.*` inventory across `slate-dom` and `slate-react` | added research/live-source result, static usage buckets, score raised to `0.85`                                                                                         | exact allowlist still open; pressure pass must decide priority and split          | performance/DX/migration/regression/simplicity pressure pass |
| performance/DX/migration/regression/simplicity pressure passes | complete | React hot-path priority, DX boundary, migration/collab split, red-first proof order, simplicity cuts                                                | added priority order, temporary allowance categories, rejected alternatives, score raised to `0.88`                                                                     | maintainer ledger had to decide whether static `Editor.*` cleanup was keep/revise | Slate maintainer objection ledger                            |
| Slate maintainer objection ledger                              | complete | accepted rows for editor-instance clipboard cut, `state.fragment.get`, prioritized static `Editor.*` cleanup, and temporary runtime allowances      | row 3 moved to `keep`; row 4 added so refs/host bridge mapping are explicit allowances, not hidden debt; score raised to `0.90`                                         | closed by high-risk pass                                                          | high-risk-deliberate-pass                                    |
| high-risk deliberate pass                                      | complete | exact proof targets for core state/tx, DOM clipboard, React bridge, static guard, browser rows, generated stress families, and collab replay        | expanded high-risk section from generic proof categories to named files, test rows, static buckets, commands, rollback answer, and keep verdict; score raised to `0.92` | closed by revision pass                                                           | revision pass                                                |
| revision pass                                                  | complete | contradiction sweep over scorecard, public namespace decision, open questions, final gates, and continuation state                                  | removed stale "would change decision" alternatives, added revision result, clarified closure as separate pass, score raised to `0.93`                                   | final closure pass still pending                                                  | closure score and gates                                      |
| closure score and gates                                        | complete | final score/gate sweep over threshold, pass ledger, locked API, high-risk proof, open questions, and checkpoint state                               | plan status set to `done`; completion state can pass; implementation remains a later lane                                                                               | none                                                                              | user review                                                  |

## 20. Plan Deltas From Review

Added:

- new DOM runtime state/tx hard-cut lane
- state fragment read target
- DOM clipboard namespace/helper target
- explicit rejection of editor instance clipboard/data methods
- static `Editor.*` classification rule instead of blind ban
- clipboard/drag/drop proof matrix
- research/live-source result with static write/read/ref/schema bucket split
- pressure-pass priority order and temporary internal allowance categories
- maintainer objection ledger row 3 accepted as a staged cleanup, not a blind
  static-helper ban
- temporary refs/host-bridge allowance row so implementation can prove what is
  intentionally internal
- high-risk proof plan with exact core, DOM, React, browser, stress, guard, and
  collab targets
- static `Editor.*` implementation buckets for cut/migrate/source-selector/
  state-query/temporary-allowance work
- revision-pass coherence result that resolves stale alternatives and
  confirms no user-decision questions remain
- closure score/gates result confirming the Ralplan is ready for user review

Revised:

- public core hard-cut completion is not global architecture completion
- `Editor.getFragment` is acceptable as internal implementation only until
  `state.fragment.get` lands, not a normal runtime package pattern
- DOM helper naming is locked to grouped `DOMEditor.clipboard.*` /
  `ReactEditor.clipboard.*`
- old clipboard-boundary plan's package ownership is kept, but its
  `Editor.getFragment` / `Transforms.insertFragment` names are superseded by
  state/tx API law
- static `Editor.*` cleanup is split into prioritized tranches instead of one
  risky all-at-once migration
- browser proof is no longer a vague "run generated rows" claim; it names
  highlighted-text, paste-html, inlines, and generated stress families
- closure is no longer described as part of the revision pass; it is the final
  scheduled pass
- plan status is `done`; implementation remains a later lane

Dropped:

- no adapter support requirement for current Plate or slate-yjs versions
- no public `editor.refs`
- no full stress gate inside `bun check`
- package-private clipboard helper as a live alternative
- `state.value.fragment(at?)` as a live alternative

No-change defense:

- `DOMEditor.toDOMRange`, `toSlateRange`, `toDOMNode`, focus, blur, and target
  helpers can stay namespace bridge APIs. They are host bridge operations, not
  model state reads.

## 21. Closure Checks

No user-decision questions remain.

Closure pass verified:

- scorecard still matches the evidence after revision
- pass-state ledger has no pending pass before closure
- final gates are non-circular and actionable
- `.tmp/<session-id>/completion-check.md` and `.tmp/continue.md` point at closure
- completion state is set to `done` after this closure check is recorded

## 22. Implementation Phases With Owners

Implementation activation:

- 2026-04-29T20:48:32Z: `ralph` started implementation in sibling
  `.tmp/slate-v2`.
- Phase 1 complete: added `state.fragment.get(...)` and
  `tx.fragment.get(...)`, migrated selected-fragment clipboard contract reads,
  and verified with focused package tests plus `bun --filter slate typecheck`.
- Phase 2 complete: moved clipboard/data bodies behind DOM-owned runtime
  helpers and verified the `slate-dom` clipboard boundary suite plus
  `bun --filter slate-dom typecheck`.
- Phase 3 complete: added grouped `DOMEditor.clipboard.*` /
  `ReactEditor.clipboard.*`, removed normal instance clipboard/data paths, and
  verified focused DOM clipboard behavior plus `slate-dom` / `slate-react`
  typechecks.
- Phase 4 complete: migrated high-value normal static reads/writes in root
  sources, clipboard shell paste, model input, DOM range-list, repair,
  composition, and mutation controller paths; remaining static calls are
  runtime allowances in proof handles, traces, refs, selection reconciliation,
  and DOM host mapping.
- Phase 5 complete: `bun check`, targeted browser rows, `slate-browser` build,
  and generated stress grep are green.
- Current execution owner: user review.

Phase 1: State fragment API

- Add `EditorStateFragmentApi`.
- Add `state.fragment.get(options?)`.
- Add `tx.fragment.get(options?)`.
- Keep `tx.fragment.insert(...)`.
- Prove current-selection and explicit-range reads.

Phase 2: DOM clipboard runtime helper

- Create package-local DOM clipboard runtime functions.
- Store `clipboardFormatKey` in DOM runtime state/WeakMap.
- Move serialization/insertion bodies out of editor instance methods.
- Preserve origin/options shape.

Phase 3: Public DOM/React namespace cut

- Add accepted `DOMEditor.clipboard.*` / `ReactEditor.clipboard.*` shape.
- Remove `setFragmentData`, `insertData`, `insertFragmentData`, and
  `insertTextData` from `DOMEditor` instance type.
- Update React clipboard strategy and tests.

Phase 4: Static read/write inventory

- Classify static `Editor.*` calls in `slate-dom` and hot `slate-react`.
- Migrate normal reads to `editor.read`.
- Migrate normal writes to `editor.update`.
- Leave allowlisted internal runtime helper calls with comments.

Phase 5: Regression proof

- Run focused unit/package tests.
- Run focused React clipboard tests.
- Run generated browser rows for copy/cut/paste/drag/void/decorated cases.
- Run `bun check` before completion.

## 23. Fast Driver Gates

Iteration gates:

```sh
cd /Users/zbeyens/git/slate-v2
bun test packages/slate/test/*fragment* packages/slate-dom/test/clipboard-boundary.ts
bun test:vitest test/surface-contract.test.tsx
bun typecheck:packages
bun lint:fix
```

Completion gates:

```sh
cd /Users/zbeyens/git/slate-v2
bun check
```

Browser gate when implementation touches React/DOM behavior:

```sh
cd /Users/zbeyens/git/slate-v2
bunx playwright test playwright/integration/examples/highlighted-text.test.ts playwright/integration/examples/paste-html.test.ts playwright/integration/examples/inlines.test.ts --project=chromium
bun --filter slate-browser build
PLAYWRIGHT_RETRIES=0 playwright test playwright/stress/generated-editing.test.ts --project=chromium --grep "clipboard-fragment-round-trip|cut-follow-up-typing|void-copy-drag-drop|paste-normalize-undo|paste-html-image-void"
```

Do not run `bun test:integration-local` during normal iteration unless this
lane becomes a release-quality browser claim.

## 24. Final User-Review Handoff Outline

When this Ralplan closes, the handoff must list every accepted decision:

- Public API: `state.fragment.get` / `tx.fragment.get` / `tx.fragment.insert`.
- DOM API: no editor instance clipboard/data methods.
- Clipboard helper naming: `DOMEditor.clipboard.*` / `ReactEditor.clipboard.*`.
- Static `Editor.*`: exact allowlist and cut list.
- React event handlers: new helper call shape.
- Tests: exact unit, React, browser, and grep guards.
- Migration backbone: Plate/plugin and slate-yjs answers.
- Hard cuts: no aliases, no deprecated names.

## 25. Final Completion Gates

This plan is `done` because:

- total score is `>= 0.92`
- no dimension is below `0.85`
- row 3 in the objection ledger is no longer `revise`
- DOM namespace naming is locked
- static `Editor.*` inventory is complete
- every implementation phase has acceptance tests
- high-risk proof plan names exact tests
- `.tmp/continue.md` points at the closed Ralplan state
- after status is set to `done`, `bun run completion-check` passes from
  `/Users/zbeyens/git/plate-2`
