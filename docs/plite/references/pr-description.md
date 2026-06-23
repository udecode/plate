---
date: 2026-05-04
topic: plite-pr-description
status: active-reference
---

# Plite PR Description Reference

Use this as the maintainer-facing PR body source. Keep it as a drift register:
what belongs in the PR, why it belongs in v2, what proof exists, and what is
not claimed yet.

## 0. Issue Coverage Accounting

The Plite goal is not just "new architecture." The PR should close or
materially improve the highest-value issue clusters from
`docs/plite-issues`.

Full ledger:

- [Live Gitcrawl Open Ledger](/Users/zbeyens/git/plate-2/docs/plite-issues/gitcrawl-live-open-ledger.md)
- [Gitcrawl Recluster Map](/Users/zbeyens/git/plate-2/docs/plite-issues/gitcrawl-recluster-map.md)
- [Issue Coverage Matrix](/Users/zbeyens/git/plate-2/docs/plite/ledgers/issue-coverage-matrix.md)

Current summary:

- Fixed issue claims: `36`
- Related issue matrix rows: `190`
- Live corpus accounting: `630` open issues, `29` open PRs, `659` open
  threads, and `617` gitcrawl clusters from the 2026-05-04 refresh. This is
  corpus accounting, not an auto-close claim.
- Mobile/IME macro accounting: `149` frozen R7 input-runtime rows reviewed;
  `44` long-form proof-route rows, `59` matrix-only future-proof rows, `20`
  matrix-only non-claim rows, `3` matrix backfills, and `4` drift rows aligned
  down to related.
- New exact Mobile/IME fixed or improved claims from the macro plan: `0`.
- Mobile/IME closure remains gated on matching raw-device or browser proof for
  Samsung Keyboard, Android Firefox, Android voice input, Android/iOS Chinese
  input, Windows IME, and other reported environments.
- Lexical harvest issue-ledger sync added `4` related/non-claim rows from the
  processing backlog: `#5894`, `#4730`, `#3387`, and `#3872`. New exact fixed
  or improved claims from that sync: `0`.
- Yjs/collaboration readiness sync promotes `#5771` from Related to Improves,
  with no new exact fixed issue claim.
- Native beforeinput command-handler sync adds related rows for `#3586` and
  `#4681`, and refreshes `#3568`, `#5181`, and `#4317`. New exact fixed or
  improved claims from that sync: `0`.
- Plate-fit API hard-cut sync reverses the earlier raw Plite renderer/key
  helper target: raw Plite keeps `Editable render*` and browser event props,
  model/runtime behavior stays in extensions, and Plate owns renderer/keymap
  product packaging. New exact fixed or improved claims from that sync: `0`.
- Table transform-boundary sync clarifies that Backspace/Delete/Enter table-cell
  boundary behavior, markdown Enter/Backspace model behavior, and richtext
  exit-on-Enter behavior belong in `transforms.*` middleware rather than raw
  `Editable onKeyDown` key branches. New exact fixed or improved claims from
  that sync: `0`.
- Android markdown shortcut flush sync keeps app-facing markdown behavior in
  `transforms.insertText`, removes example-side Android flush plumbing, and
  routes Android pending-diff timing to the input runtime. Focused unit,
  typecheck, lint, and markdown-shortcuts browser proof passed; raw Android
  device proof is still required before any exact `#4532` claim. New exact
  fixed or improved claims from that sync: `0`.
- Editable-island / multi-root child-root planning sync changes the target
  example architecture only: native/app controls stay inside
  `editable-island`, rich editable island content should use same-runtime child
  roots, scalar document-owned fields should use state fields, and
  `renderVoid` stays content-only. New exact fixed or improved claims from that
  sync: `0`.
- Void roots / content-root API execution keeps ordinary voids atomic, keeps
  `editable-island` for mixed native/app controls with optional child roots,
  and adds the public API/lifecycle baseline for pure editor-flow child content:
  `EditorElementSpec.contentRoot`, `tx.roots.create/replace/delete`, and
  `usePliteContentRoot`. Keyboard projection, root payload remap, browser
  proof, and release-gate verification remain unclaimed. New exact fixed or
  improved claims from that sync: `0`.

Current fixed issue claims:

- Fixes #6013: React providers accept pre-initialized editor instances without
  a provider-level `initialValue`; editor state is seeded during editor creation.
- Fixes #5605: The public React initialization path has no duplicate
  provider-level `initialValue` requirement.
- Fixes #5709: React provider hook consumers receive the replacement editor
  when `<Plite editor>` changes.
- Fixes #5233: Custom fragment format keys isolate both internal MIME payloads
  and embedded HTML fallback fragments.
- Fixes #3486: Custom clipboard format keys isolate internal fragment
  transport.
- Fixes #4569: `insertData` docs state handler ordering, return semantics,
  and fallback behavior.
- Fixes #6034: The tables example keeps the caret in the final table cell when
  the table is the last node and ArrowDown is pressed before typing.
- Fixes #3871: The richtext example imports browser triple-click as the clicked
  block only, without leaking selection into the following block.
- Fixes #5847: Browser triple-click plus Backspace removes the selected block
  instead of emptying its contents.
- Fixes #3991: Backspace from an empty paragraph immediately after a selected
  block void removes the paragraph and selects the void instead of deleting the
  void.
- Fixes #4301: Enter on a clicked selected block void inserts an editable
  paragraph after the void.
- Fixes #4074: The inlines example can type inside an editable inline at the
  inline edge in Chromium.
- Fixes #3148: Inline edge selections keep the inline end and following text
  start distinct before text insertion in Chromium and WebKit.
- Fixes #3429: The caret target before a padded inline stays outside the padded
  inline in Chromium.
- Fixes #4789: A native selection that starts outside the editor and ends inside
  the editor is ignored without a DOM point crash, and the editor remains usable
  after refocus.
- Fixes #5826: In a long editor, clicking the top block, blurring, scrolling to
  the final block, and clicking back into the editor keeps the clicked
  final-block selection visible instead of restoring the stale top selection.
- Fixes #4376: WebKit blur/refocus keeps the Plite model selection and follow-up
  typing lands at the preserved point.
- Fixes #5171: Firefox unfocused editor updates preserve the inactive editor
  selection instead of importing an external input selection.
- Fixes #4984: A parent-editor selection that crosses into a nested editor is
  ignored without a DOM point crash, and input remains owned by the parent or
  nested editor that actually has focus.
- Fixes #3534: Undo after pressing Enter with a selection spanning multiple
  blocks restores the original expanded selection.
- Fixes #3551: Undo after a `moveNodes` commit restores the original tree and
  selection.
- Fixes #4559: Undo after `deleteFragment` reselects the restored fragment.
- Fixes #3499: Marked Enter before a bold word moves the word into the new block
  and undo restores the original marked paragraph and selection.
- Fixes #4121: Core expanded delete over a formatted leaf window removes only
  the selected content and collapses at the selection start.
- Fixes #2500: Core full-document delete over list-heavy content resets to one
  empty editable paragraph instead of preserving an orphan list shell.
- Fixes #3965: Backspace across an empty marked block start merges same-mark text
  without deleting both sides.
- Fixes #3950: Custom normalization rechecks a transformed node until later
  normalizers reach fixpoint.
- Fixes #5972: Backspace from an empty editable inline in the inlines example
  removes the inline without deleting the preceding character.
- Fixes #5977: Custom operation-like records no longer break editor detection
  or DOM path lookup, and unknown operation replay fails before the record
  enters the operation log.
- Fixes #5412: `insertFragment(..., { at })` writes at the supplied target
  instead of ambient selection.
- Fixes #5429: `insertFragment` into an empty text block leaves selection after
  the inserted content.
- Fixes #5089: Rich multi-block fragment paste into the middle of a paragraph
  preserves block separation instead of flattening into the current paragraph.
- Fixes #4806: Selected inline void copy, paste, and cut work through the
  native browser clipboard path with model-owned caret repair.
- Fixes #5080: `state.nodes.entries({ reverse: true })` returns the exact reverse
  of the forward matched entry order for nested matching entries.
- Fixes #6053: `useElementSelected()` does not throw when a selected rendered
  element removes itself, and `useElementSelected({ at: path })` returns
  `false` after the watched path is removed.
- Fixes #5400: Public helper value namespaces use `*Api`, so importing Plite
  helpers no longer shadows DOM globals such as `Node`.

Rules:

- Keep the full matrix in the issue coverage ledger.
- Keep issue and cluster sync progress in the live gitcrawl ledger and recluster
  map.
- Keep only exact `Fixes #....: <description>` lines and count summaries in
  this accounting section.
- Do not add issue numbers because they sound related. That is how PR bodies
  become bullshit.

## 1. Root Tooling And Runtime Baseline

Affected:

- `package.json`
- `bun.lock`
- `bunfig.toml`
- `turbo.json`
- `biome.json`
- `eslint.config.mjs`
- `tsconfig*.json`
- `playwright.config.ts`
- `site/**`

Accepted current shape:

- Bun owns install, scripts, package tests, and lockfile state.
- Turbo owns package graph execution.
- Biome and flat ESLint own lint/format checks.
- tsdown owns package builds.
- React 19.2, Next 16, TypeScript 6, and Bun test are the runtime floor.
- The examples app serves on the Plite dev ports, with Playwright running
  against the built Next app for integration proof.

Why it belongs in the PR:

- The runtime target is not legacy Plite with local patches.
- The root toolchain is part of the v2 contract because React 19, TypeScript 6,
  Bun, Playwright, and package source graphs shape the editor API and proof
  lanes.

Proof references:

- `Plate repo root/package.json`
- `Plate repo root/bunfig.toml`
- `Plate repo root/playwright.config.ts`
- `docs/plite/master-roadmap.md`
- `docs/plite/release-readiness-decision.md`

## 2. Package Manifest And Source Graph Reset

Affected:

- `packages/*/package.json`
- `packages/*/tsconfig*.json`
- `packages/*/src/index.ts`

Accepted current shape:

- Packages use ESM-oriented exports and package-local build/test/typecheck
  scripts.
- Workspace dependencies stay local and source-first during development.
- Public barrels expose only the v2-supported surface.
- Dead compatibility exports do not stay public just to reduce diff size.
- Raw Plite does not ship Markdown or table product packages. Markdown syntax
  policy, parsing/serialization, input rules, table maps, table commands, cell
  selection UX, and GFM table hooks belong in Plate or app-level feature
  packages.
- Raw Plite owns the substrate those features need: schema/spec policy,
  transforms, selection primitives, normalization, clipboard/input hooks, and
  layout projection primitives.
- `plite-layout` extracts leaf-level layout runs with block offsets and Plite
  leaf paths while preserving the existing block text fallback. Page projection
  exposes placed runs, visual text rects, native hit rects, decoration ranges,
  and generic block-local box metadata.
- Markdown and table examples, Plate, or app-level packages supply the
  schema-specific adapters and fixtures for code lines, images, thematic
  breaks, tables, and table cells.
- The experimental pagination example composes the layout helpers from
  `plite-layout` directly: geometry, projection, decorations, line hit rects,
  page frames, and mixed Markdown-shaped content stay in the example as proof,
  not as app-owned projection math.
- Open architecture target: `plite-layout` should become the generic derived
  layout service for continuous and paged snapshots, with a built-in Pretext
  engine behind an internal boundary and `plite-react` consuming layout through
  a DOM materialization policy instead of treating pagination or virtualization
  as product rendering modes.
- Pagination planning target: public beta API should stay small: `pageView`
  groups page display settings, virtualized `domStrategy` drives internal
  page/spread mounting in `PagedEditable`, `measurementProfile` is snapshot
  metadata, `pageBreaks` is opt-in strict-fidelity metadata, and table/media
  pagination uses generic provider/split protocols rather than a raw Plite
  product TableKit. This planning target adds no fixed/improved issue claim.

Why it belongs in the PR:

- The package graph is an API boundary. Keeping legacy exports visible makes v2
  look compatible where it intentionally is not.

Proof references:

- `docs/plite/final-api-hard-cuts-status.md`
- `docs/plite/references/live-shape-register.md`
- `docs/plite/replacement-gates-scoreboard.md`
- `packages/plite-layout/test/page-layout-contract.test.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx`
- `apps/www/tests/plite-browser/donor/examples/pagination.test.ts`

## 3. Core Editor API Reset

Affected:

- `packages/plite/src/**`
- `packages/plite/test/**`
- `docs/plite/ledgers/slate-editor-api.md`
- `docs/plans/2026-05-03-plite-core-editor-method-hard-cut-ralplan.md`

Accepted current shape:

- `editor.read` is the read boundary.
- `editor.update` is the write boundary.
- Reads use state accessors and plain helper functions.
- Writes use transaction methods.
- Primitive editor methods live on the editor instance.
- Extensions use named `editor`, `state`, and `tx` groups.
- `EditorCommit` is the post-commit truth object for subscribers and integration
  layers.
- Collaboration/Yjs-style adapters use deterministic operation replay, typed
  commit metadata, bookmarks, and local runtime targets; raw Plite does not grow
  adapter-shaped public namespaces.
- The public `Editor.*` static method namespace is not the v2 teaching or
  extension surface.
- Public data helper values use `*Api` names such as `NodeApi`, `ElementApi`,
  `PathApi`, and `RangeApi`; model type names stay `Node`, `Element`, `Path`,
  and `Range`.
- Editors compose behavior through creation-time `extensions`, not public
  `with*` wrappers, `withEditor`, or author-facing `editor.extend`.
- Built-in packages expose lowercase extension factories such as `history()`,
  `dom()`, and `react()`.
- Custom extension factories use the same lower camel-case singular shape, such
  as `editableVoid()`, `checklist()`, `mention()`, or `table()`. Plural names
  are reserved for naturally plural domains such as `shortcuts()` or
  `normalizers()`. PascalCase `NameExtension` is reserved for static extension
  values. Plate's `NamePlugin` suffix belongs to Plate's product plugin layer,
  not raw Plite extensions.
- Replayable extension reads live under `editor.read((state) => state.<group>)`;
  replayable extension writes/actions live under
  `editor.update((tx) => tx.<group>)`.
- Installed runtime/control APIs live under `editor.api.<capability>`, so
  history controls use `editor.api.history`, DOM/React runtime APIs use
  `editor.api.dom` / `editor.api.react`, clipboard APIs use
  `editor.api.clipboard`, and public editor-bound helper namespaces such as
  `HistoryEditor`, `DOMEditor`, and a runtime `ReactEditor` namespace are not
  app-facing APIs. The app-facing React editor instance type is the generic
  extension-derived `ReactEditor<Value, Extensions>`.
- One extension may install multiple public API handles. `dom()` installs the
  DOM projection/focus handle and may also install the clipboard handle. Public
  API keys are capability names, not package names.
- Generic extension-aware code may use `editor.getApi(extensionToken)` where the
  token is the branded factory or static extension value. String lookup such as
  `editor.getApi('history')` and fresh-instance lookup such as
  `editor.getApi(history())` are not public APIs.
- Type tests must include negative contracts for uninstalled APIs,
  `editor.getApi('history')`, `editor.getApi(history())`,
  `editor.api.history.undo`, and `editor.getApi(history).undo`.
- State node queries expose `state.nodes.entries(...)` for lazy all-match
  traversal, `state.nodes.find(...)` for first-match reads, and
  `state.nodes.some(...)` for boolean active checks. Use
  `state.nodes.toArray(options, map?)` only when a read or update callback needs
  an explicit materialized array.
- Element void config is string-only: `void: 'block'`,
  `void: 'inline'`, `void: 'markable-inline'`, or
  `void: 'editable-island'`. Absence means non-void; `void: true` is fixture
  data only when a matcher maps it to an explicit schema spec.
- Mutable editor fields, direct `apply` extension points, direct `onChange`
  extension points, and `Transforms.*` teaching are outside the final public
  posture.

Why it belongs in the PR:

- This is the main architectural cut. v2 is a transaction/snapshot editor, not a
  faster legacy namespace.

Open debt:

- Some tests still use legacy-style fixtures such as `Editor.replace`. Treat that
  as fixture migration debt, not a public API endorsement.
- Some legacy-oracle tests still use node data markers such as `void: true`.
  Treat those as fixture data matched into explicit string specs, not supported
  `EditorElementSpec.void` config.
- Non-node document state fields are an architecture-ready follow-up, not a
  current PR claim. The accepted target is `defineStateField`, canonical
  `Value = { roots, state? }`, `InitialValue` normalization,
  `state.getField`, `tx.setField`, root-explicit operations, root-aware
  `Point`/`Range`, `createEditorRuntime`, `createEditorView`,
  `statePatches`, `dirtyStateKeys`, the `'state'` source,
  `useStateFieldValue`, and `useSetStateField`, with comments external by
  default. Do not add fixed or improved issue counts for this target until the
  core/root/history/collab/react contracts in
  `docs/plans/2026-05-20-plite-non-node-editor-state-architecture-ralplan.md`
  pass in `Plate repo root`. Current execution proof covers the first nine
  vertical slices: `createEditor` accepts legacy children, `{ children, state }`,
  and `{ roots, state }` `initialValue` shapes and exposes canonical rooted
  `state.value.get()` output; committed content operations include
  `root: 'main'`, `Path` stays numeric/root-local, and `Point`/`Range` transforms
  ignore operations from other roots; `createEditorRuntime` owns the shared
  editor value while `createEditorView` creates root-bound read/update facades
  with view-local root, focus, and read-only policy; `defineStateField`
  installs persisted descriptors with initial values and `state.getField`;
  `tx.setField` emits operation-free `statePatches`, `dirtyStateKeys`, and the
  `'state'` commit source, with a guard for large shared/history fields that
  omit patch hooks; `plite-history` stores state patches in history batches and
  undoes/redoes title changes as operation-free historic commits; collaboration
  adapters can import shared state patches through `tx.statePatches.replay` and
  export only `collab: 'shared'` patches through
  `Editor.getCollabStatePatches`; React exposes `useStateFieldValue` and
  `useSetStateField`, with field subscriptions filtered by `dirtyStateKeys`;
  the examples app has a browser-proven `Document State` route that edits
  document title/settings through state fields, keeps body content separate,
  undoes/redoes state patches, and imports a remote title patch. Current
  focused performance/release proof covers editor-store, history-retained
  memory, collab-readiness, React rerender-breadth, and root `bun check`; two
  field/root-specific benchmark script names remain missing harness coverage,
  not passed proof. The multi-root React DX target is one canonical
  `<Plite editor={editor}>` provider with multiple `<Editable root="...">`
  surfaces. `PliteRuntime`, `<Plite root="...">`, `createEditorView`,
  `usePliteRuntimeState`, and `usePliteViewState` remain advanced substrate
  APIs for custom hosts. This is a non-claim API target for multi-root/header-
  footer examples, not an added issue count. A follow-up non-claim API target
  adds package-owned `usePliteHistory` and `usePliteRootChrome` so the canonical
  example does not teach app-owned history shortcut parsing, stack reads,
  selection metadata, active-root command routing, or RAF focus repair.
- Structural delete and normalization now have focused core package proof for
  #4121/#2500/#3965/#3950. #5811 is improved by deterministic normalization
  loop detection. #1654 is improved by wiring existing `isIsolating` schema
  policy into collapsed Backspace and direct `mergeNodes`; split-specific
  closure remains unclaimed. #5972 is fixed by core delete target planning and
  the inlines example browser proof. #5977 is fixed by internal editor
  detection proof, DOM path lookup proof, and fail-closed unknown replay.
  #3964/#3973/#4357/#3499 are fixed by core/history package regression proof.
  #4195/#3841/#5629/#4648 remain
  related/non-claim rows without exact browser or punctuation-policy proof.
  #5412/#5429 are fixed by core `insertFragment` package proof for explicit
  target insertion and empty-block caret placement. #5089 is fixed by package
  and DOM clipboard proof for middle-paragraph multi-block fragment insertion.
  #5080 is fixed by core package proof for exact reverse matched traversal.
  #5684/#5028/#3885 remain related or non-claim rows.
- Improves #5811: Custom normalization oscillation fails deterministically with a
  fixpoint diagnostic instead of an unbounded normalization budget.
- Improves #1654: Existing `isIsolating` policy blocks collapsed Backspace and
  direct `mergeNodes` across protected containers; split-specific closure remains
  unclaimed.
- Improves #5558: `Operation` exposes concrete built-in operation subtype guards
  with runtime and TypeScript narrowing proof.

Proof references:

- `docs/plite/references/architecture-contract.md`
- `docs/plite/absolute-architecture-release-claim.md`
- `docs/plite/final-api-hard-cuts-status.md`
- `docs/plans/2026-05-03-plite-core-editor-method-hard-cut-ralplan.md`
- `docs/plans/2026-05-07-plite-core-structural-delete-normalization-ralplan.md`
- `docs/plans/2026-05-07-plite-inline-delete-boundary-repro-ralplan.md`
- `docs/plans/2026-05-07-plite-operation-extensibility-validation-ralplan.md`
- `docs/plans/2026-05-07-plite-insert-fragment-at-location-ralplan.md`
- `docs/plans/2026-05-13-plite-void-kind-api-ralplan.md`
- `docs/plans/2026-05-20-plite-non-node-editor-state-architecture-ralplan.md`
- `.tmp/completion-checks/plite-insert-fragment-at-location-execution.md`
- `packages/plite/test/public-element-void-kind-contract.ts`
- `packages/plite/test/schema-contract.ts`
- `packages/plite/test/clipboard-contract.ts`
- `packages/plite/test/query-contract.ts`
- `packages/plite/test/collab-history-runtime-contract.ts`
- `packages/plite/test/commit-metadata-contract.ts`
- `packages/plite/test/migration-backbone-contract.ts`
- `packages/plite/src/editor/nodes.ts`
- `.tmp/completion-checks/plite-editor-nodes-reverse-order-ralplan.md`
- `.tmp/completion-checks/plite-core-structural-delete-normalization-execution.md`
- `.tmp/completion-checks/plite-operation-extensibility-validation-execution.md`
- `.tmp/completion-checks/plite-core-caret-movement-word-insert-break-execution.md`
- `packages/plite/test/snapshot-contract.ts`
- `packages/plite/test/transaction-contract.ts`

## 4. Support Package Closure

Affected:

- `packages/plite-history/**`
- `packages/plite-hyperscript/**`

Accepted current shape:

- `plite-history` follows the transaction/commit model instead of patching
  mutable editor internals.
- History integrity is tested through contract and benchmark proof.
- `plite-hyperscript` exists as a v2 fixture/test authoring helper, not a
  compatibility sink for stale core assumptions.

Why it belongs in the PR:

- Support packages prove the core API is usable outside the core package.
- They also catch legacy assumptions that package-local core tests miss.

Proof references:

- `docs/plite/master-roadmap.md`
- `docs/plite/replacement-gates-scoreboard.md`
- `docs/plite/references/normalization-reference.md`

## 5. DOM Runtime Closure

Affected:

- `packages/plite-dom/src/**`
- `packages/plite-dom/test/**`

Accepted current shape:

- `plite-dom` owns DOM selection export/import, clipboard policy, DOM coverage
  lookup, and hotkey matching.
- DOM helpers cannot blindly assume every model point has mounted DOM.
- Strict DOM bridge helpers still throw for direct invariant checks, while
  nullable `resolve*` helpers return `null` for recoverable model/DOM projection
  gaps.
- Runtime recovery in `plite-react` uses resolver helpers instead of
  `suppressThrow`, local catch wrappers, or strict projection calls.
- Clipboard behavior uses the model when DOM coverage says native DOM is missing
  or stale.
- `is-hotkey` is not a dependency. Plite owns `isHotkey(spec, event)` in
  `plite-dom`.

Why it belongs in the PR:

- DOM correctness is the boundary between editor model truth and browser truth.
- v2 cannot ship selection/copy/paste behavior as accidental React behavior.

Proof references:

- `docs/plans/2026-05-03-plite-hotkey-runtime-dependency-ralplan.md`
- `docs/plans/2026-05-02-plite-hidden-subtree-first-class-ralplan.md`
- `docs/plans/2026-05-03-plite-dom-present-large-doc-phase-6-plan.md`
- `docs/plans/2026-05-14-plite-total-runtime-error-policy-ralplan.md`
- `docs/plite/replacement-gates-scoreboard.md`

## 5.1 Clipboard And Serialization Boundary

Affected:

- `packages/plite/src/**`
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/plite-react/src/editable/clipboard-input-strategy.ts`
- `packages/plite-dom/test/clipboard-boundary.ts`
- `packages/plite/test/clipboard-contract.ts`

Accepted current shape:

- `slate` owns fragment extraction and insertion semantics.
- `plite-dom` owns `DataTransfer`, custom fragment MIME keys, keyed embedded
  HTML fragment transport, plain-text fallback, and DOM coverage copy/paste
  policy.
- `plite-react` owns browser event dispatch for copy, cut, paste, drag, and
  drop, then delegates payload work to `editor.api.clipboard`.
- Low-level clipboard APIs stay under top-level `editor.api.clipboard`; raw
  `editor` does not grow a public clipboard namespace.
- App-owned rich HTML/image/custom paste behavior runs through typed clipboard
  ingress handlers; `insertData` stays input-only and does not own output
  serialization or product paste-rule policy.
- Custom fragment format keys isolate both `application/${clipboardFormatKey}`
  payloads and embedded `data-plite-fragment` HTML fallback. Mismatched
  embedded fragments fall back to safe import behavior instead of importing
  schema-private JSON.
- DOM adapter settings are passed to extension factories, not wrappers:
  `dom({ clipboardFormatKey: 'x-product-fragment' })` in the editor
  `extensions` list.
- `DOMClipboardInsertDataHandler` is public from `plite-dom`; app-owned rich
  HTML/image paste behavior runs through typed clipboard ingress authoring.
- Foreign or malformed internal fragment payloads must fail closed and fall
  back to safe import behavior.
- Rich Plite fragment insertion preserves the receiving text-block type when a
  single text-block fragment replaces selected target text, including marked
  text, inline children, and full-document single-block replacement.
- Rich multi-block fragment paste into the middle of a paragraph preserves
  block separation instead of flattening into the current paragraph.
- Whole top-level block replacement keeps structural fragments as sibling units
  and applies them as one model operation when the selection exactly covers the
  target block slice.
- Whole top-level block fragment extraction slices the selected root child
  range directly, so copying or cutting two blocks from a huge document does
  not walk and remove every unselected sibling from a pseudo-root.
- Collaboration import replays `replace_children` through
  `tx.operations.replay(...)`; CRDT/Yjs-style adapters lower it at their own
  boundary if their transport cannot represent child-window replacement
  atomically.
- Selected inline void export must not assume block-void spacer DOM. Browser
  clipboard proof keeps deterministic HTML/text payloads, embeds the Plite
  fragment, avoids FEFF and neighboring text leakage, pastes into an external
  contenteditable target, and repairs the caret after cut.
- Selected block void cut writes clipboard data, removes the void block once,
  and requests model-owned DOM repair.
- Core model fragment extraction keeps whole-list wrappers, and delete across a
  list between text blocks does not leave an orphan `list-item`.
- Focused DOM clipboard proof covers malformed MIME payloads, malformed
  embedded HTML `data-plite-fragment`, invalid JSON, URI-decode failures,
  non-array JSON, no-fallback no-op behavior, and rich fragment target-block
  preservation, custom-key embedded HTML acceptance/rejection, plus selected
  inline void copy/paste/cut ordering and selected block void cut repair.

Performance status:

- Improves #5945: 10,000-line plaintext paste runs through one logical
  `replace_children` operation in the issue-size benchmark. Exact
  `Fixes #5945` closure still needs a 10,000-line browser artifact for the
  plaintext example flow.
- Improves #4056: the issue-size benchmark now covers populated-editor large
  copy and large middle paste. The latest run reports `49.35ms` for copying
  10,000 populated blocks and `235.22ms` for pasting 10,000 plaintext lines
  into a 10,000-block populated editor with one logical operation. Exact
  `Fixes #4056` closure still needs the historical browser repro.
- Improves #5992: the 50,000-block two-node cut benchmark now lowers exact
  whole-child range delete to one `replace_children` operation. The latest
  issue-size run reports warm edit p50 `9.95ms`, warm copy-plus-delete p50
  `8.62ms`, and operation count `1`; the cold snapshot row remains visible at
  p50 `171.91ms`. Browser stress covers a 5,000-block huge-document cut row.
  Exact `Fixes #5992` closure still needs maintainer acceptance that the
  benchmark plus browser stress matches the original repro.

Why it belongs in the PR:

- Clipboard is a trust boundary. A regex hit or foreign custom MIME payload is
  not proof of a valid Plite fragment.
- Missing-DOM copy/paste must use the same explicit DOM coverage policy as
  hidden, staged, and future virtualized regions.

Proof references:

- `docs/plans/2026-05-04-plite-clawsweeper-v2-clipboard-serialization-ralplan.md`
- `tmp/slate-clipboard-large-payload-benchmark.json`
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/plite/src/transforms-text/insert-fragment.ts`
- `packages/plite-dom/test/clipboard-boundary.ts`
- `packages/plite/test/clipboard-contract.ts`
- `.tmp/completion-checks/plite-multiblock-fragment-middle-insert-execution.md`
- `packages/plite-react/src/editable/clipboard-input-strategy.ts`
- `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-serialization-execution.md`
- `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-fragment-insertion-shape-execution.md`
- `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-inline-void-execution.md`
- `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-structural-cut-delete-execution.md`
- `.tmp/completion-checks/plite-clawsweeper-v2-clipboard-api-extension-surface-execution.md`

## 6. React Runtime Closure

Affected:

- `packages/plite-react/src/**`
- `apps/www/examples/**`
- `Plate repo root/tests/integration/**`

Accepted current shape:

- React owns provider/hooks/primitives/editable behavior, not core editor truth.
- React reads from editor snapshots and commit-local dirty data.
- Selector hooks expose editor-typed operations and commit facts, including
  `EditorSelectorOptions<TEditor>` for `useEditorSelector`.
- `decorate` stays the simple transient range API.
- `decorationSources` and `createDecorationSource` are the scalable path for
  external or high-churn overlays.
- Annotation stores and widget stores are durable overlay substrates, not
  product comment workflows.
- Projection stores, projection selectors, and projection metrics are advanced
  runtime surfaces, not the first public docs path.
- Default editing remains DOM-present unless an explicit rendering strategy says
  otherwise.
- Public examples teach stable Plite React capabilities before React
  memoization ceremony: renderer registration, input rules, key commands,
  semantic commands, and projector options.
- Generated browser gauntlets and v2-only examples are part of the proof surface.

Why it belongs in the PR:

- The React package is where old Plite API habits usually leak back in.
- The PR needs to explain that React is an adapter over a transaction editor, not
  the source of editor state truth.

Proof references:

- `docs/plite/master-roadmap.md`
- `docs/plite/replacement-gates-scoreboard.md`
- `docs/plite/final-api-hard-cuts-status.md`
- `docs/plite/absolute-architecture-release-claim.md`
- `docs/plans/2026-05-08-plite-react-decorations-slate-issues-ralplan.md`
- `packages/plite-react/test/generic-react-editor-contract.tsx`
- `packages/plite-react/test/provider-hooks-contract.tsx`
- `packages/plite-react/test/projections-and-selection-contract.tsx`
- `packages/plite-react/test/app-owned-customization.tsx`
- `packages/plite-react/test/surface-contract.tsx`
- `packages/plite-react/test/keyboard-input-strategy-contract.test.ts`
- `packages/plite-react/test/annotation-store-contract.test.tsx`
- `packages/plite-react/test/widget-layer-contract.test.tsx`
- `content/docs/plite/libraries/plite-react/editable.md`
- `content/docs/plite/libraries/plite-react/hooks.md`
- `content/docs/plite/libraries/plite-react/slate.md`
- `packages/plite-react/test/editing-kernel-contract.ts`
- `packages/plite-react/test/editing-epoch-kernel-contract.ts`
- `packages/plite-react/test/selection-runtime-contract.test.ts`
- `packages/plite-react/test/model-input-strategy-contract.test.ts`
- `packages/plite-react/test/rendering-strategy-and-scroll.test.tsx`
- `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
- `apps/www/tests/plite-browser/donor/examples/placeholder.test.ts`
- `apps/www/tests/plite-browser/donor/examples/inlines.test.ts`
- `apps/www/tests/plite-browser/donor/examples/mentions.test.ts`
- `apps/www/tests/plite-browser/donor/examples/highlighted-text.test.ts`
- `apps/www/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts`
- `benchmarks/plite/donor/browser/react/rerender-breadth.tsx`
- `benchmarks/plite/donor/browser/react/huge-document-overlays.tsx`

## 6.1 React Editor Initialization And Value API

Affected:

- `packages/plite/src/create-editor.ts`
- `packages/plite/src/core/public-state.ts`
- `packages/plite-react/src/hooks/use-slate-editor.ts`
- `packages/plite-react/src/components/slate.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/**`
- `docs/plans/2026-05-04-plite-react-editor-initialization-value-ralplan.md`

Accepted current shape:

- `createEditor({ initialValue, initialSelection })` seeds public editor state
  synchronously before React provider render.
- `usePliteEditor({ initialValue, extensions })` is the React helper for
  creation-time extension composition.
- A direct `createReactEditor({ initialValue, extensions })` constructor can
  support tests and non-hook React setup without introducing a second
  composition model.
- `<Plite editor={editor}>` provides context, subscriptions, decoration sources,
  one annotation store, and callbacks. It does not initialize document content.
- Mounted document replacement is explicit through
  `editor.update((tx) => tx.value.replace({ children, selection }))`.
- Invalid empty `initialValue: []` fails with a clear core error instead of
  booting a broken editor.

Why it belongs in the PR:

- Initialization belongs to editor creation, not provider render mutation.
- Projection, annotation, and external-store code can read initialized snapshots
  before provider render.
- The React provider is a runtime adapter over an initialized editor, not the
  owner of editor value truth.

Issue coverage:

- Fixed in Section 0: #6013, #5605, and #5709.
- Improved in the matrix: #5710, #4564, #5488, and #5351.
- Does not claim #3465; full-document normalization/default-root policy remains
  separate from initialization ergonomics.

Proof references:

- `docs/plans/2026-05-04-plite-react-editor-initialization-value-ralplan.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `packages/plite/test/state-tx-public-api-contract.ts`
- `packages/plite-react/test/provider-hooks-contract.tsx`
- `packages/plite-react/test/surface-contract.tsx`
- `packages/plite-react/test/generic-react-editor-contract.tsx`

## 6.2 React Editable Input Rule Ownership

Affected:

- `packages/plite/src/core/editor-extension.ts`
- `packages/plite/src/core/transform-middleware.ts`
- `packages/plite/src/create-editor.ts`
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/test/extension-methods-contract.ts`
- `packages/plite/test/generic-extension-namespace-contract.ts`
- `packages/plite-react/src/editable/editable-input-rules.ts`
- `packages/plite-react/src/editable/runtime-root-engine.ts`
- `packages/plite-react/src/index.ts`
- `packages/plite-react/src/components/editable.tsx`
- `packages/plite-react/src/components/editable-text-blocks.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/markdown-shortcuts.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx`
- `docs/plans/2026-05-04-plite-legacy-example-dx-ralplan.md`
- `docs/plans/2026-05-13-plite-editable-input-rule-ownership-ralplan.md`

Current implemented shape:

- `slate` extension registration accepts transform middleware for every public
  mutating editor transform in `EditorTransformApi` except engine controls.
- Covered transform families: marks, text/delete/fragment/break insertion,
  node transforms, and selection transforms.
- Explicitly excluded from transform middleware: `bookmark`, `normalize`,
  `setNormalizing`, and `withoutNormalizing`.
- Transform middleware runs through keyed internal command registration and
  defaults through the transform registry without exposing public command slots.
- `next()` forwards current args unchanged, and `next(overrides)` shallow-merges
  explicit overrides such as `next({ text: normalizedText })`.
- Handling is expressed by not calling `next()`, matching Plite's old
  `withX(editor)` override feel without monkeypatching editor methods.
- Internal default forwarding skips nested public transform middleware so aliases
  like `deleteBackward -> delete` do not double-fire extension hooks.
- Plite React does not expose `EditableInputRule*`, `editableInputRules(...)`,
  `EDITABLE_INPUT_RULE_CAPABILITY`, or an `Editable inputRules` prop.
- Keep `onDOMBeforeInput` as the public raw native escape hatch. Public
  `onCommand` / `EditableCommand*` is cut; native-format behavior that Plite
  owns stays internal/runtime-owned and covered by focused contracts.
- Checklist Backspace uses `transforms.deleteBackward(...)`.
- Markdown typed shortcuts and inline URL typed insertion use
  `transforms.insertText(...)` where the behavior is model-owned.
- Direct command registry helpers stay out of the primary public package; command
  middleware is substrate, while public examples teach transform middleware.
- Keep rich semantic input-rule families in Plate, not raw Plite.
- Public extension `commands` fields remain rejected; direct
  `Editor.registerCommand(...)` stays the low-level substrate and advanced
  escape hatch, while normal examples teach transform middleware.

Accepted current source shape:

- Transform middleware covers writes only. It is not the full no-regression
  answer for old overrideable editor methods.
- Grouped `extension.queries` covers accepted pure read methods across
  `fragment`, `marks`, `nodes`, `points`, `ranges`, and `text`, including
  static/read parity for the pure read keys that do not naturally fit the
  previous grouped state view: `nodes.path`, `nodes.elementReadOnly`,
  `nodes.shouldMergeNodesRemovePrevNode`, and `points.positions`.
- Query middleware is keyed by group/method, supports `next(overrides)`,
  preserves generator reads during default delegation, rejects double `next()`,
  and prevents `editor.update` from starting inside query middleware.
- `normalizers.editor` is the typed ordered middleware lane for editor-root and
  value-level normalization.
- `normalizers.node` is the typed ordered middleware lane for non-root node
  normalization, with `next(overrides)`, built-in fallback delegation, cleanup,
  extension-local registration ids, scoped normalizer `tx`, and double-next
  proof.
- Scoped normalizer `tx` exposes model repair APIs and `value.get()`, but not
  recursive normalization controls, operation replay, or whole-value
  replacement.
- Operation and commit extension slots answer old `apply` and `onChange`
  pressure. The accepted author-facing naming target is `operations.apply` for
  operation-level hooks, `onCommit` for post-transaction observers, and `setup`
  for extension-local runtime installation.
- Refs, raw snapshots, runtime ids, lifecycle controls, and engine controls stay
  out of extension override middleware.
- Proof source:
  `docs/plans/2026-05-13-plite-editable-input-rule-ownership-ralplan.md`
  Section `Full Editor Method Override Coverage Ralplan - 2026-05-16`.

Why it belongs in the PR:

- The examples should teach first-class editor behavior composition instead of
  copying per-component keydown branches.
- Model behavior should not be authored through browser `inputType` strings.
- The core command registry already routes delete and insert-text commands
  through deterministic middleware, which covers DOM, keyboard fallback, and
  programmatic command paths better than a React beforeinput rule registry.
- Transform middleware gives that same one-path runtime proof while preserving
  the Plite-close `withX(editor)` override feel for public examples.
- The `next()` contract keeps the common case tiny while still allowing
  middleware to normalize args before delegating.

Not claimed:

- A full extension keyboard shortcut system.
- A replacement for every app-owned `onKeyDown` escape hatch.
- Legacy command-slot compatibility.
- Legacy method-slot monkeypatch compatibility. The claim is v2 capability
  parity through first-class extension surfaces, not restoring mutable editor
  method fields.
- A new fixed or improved issue claim for the adjacent input-runtime issues or
  `#3557`; the insert-node/fragment extension pressure is related proof, not an
  exact upstream repro closure.

Proof references:

- `packages/plite/src/core/editor-extension.ts`
- `packages/plite/src/core/transform-middleware.ts`
- `packages/plite/src/core/query-middleware.ts`
- `packages/plite/src/core/normalize-node.ts`
- `packages/plite/src/create-editor.ts`
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/core/command-registry.ts`
- `packages/plite/src/editor/delete-backward.ts`
- `packages/plite/test/query-extension-contract.ts`
- `packages/plite/test/normalization-contract.ts`
- `packages/plite/test/apply-onchange-hard-cut-contract.ts`
- `packages/plite/test/extension-methods-contract.ts`
- `packages/plite/test/generic-extension-namespace-contract.ts`
- `packages/plite/test/transaction-contract.ts`
- `packages/plite/test/transforms-contract.ts`
- `packages/plite/test/public-surface-contract.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/forced-layout.tsx`
- `benchmarks/plite/donor/core/compare/normalization.mjs`
- `packages/plite-react/src/components/editable.tsx`
- `packages/plite-react/src/editable/runtime-root-engine.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/markdown-shortcuts.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx`
- `bun check` in `Plate repo root`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/forced-layout.test.ts --project=chromium`
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/check-lists.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/inlines.test.ts --project=chromium`
- `docs/plans/2026-05-13-plite-editable-input-rule-ownership-ralplan.md`

## 6.2.1 React Editable Native Input Boundary

Affected:

- `packages/plite-react/src/components/editable.tsx`
- `packages/plite-react/src/editable/editable-key-commands.ts`
- `packages/plite-react/src/editable/keyboard-input-strategy.ts`
- `packages/plite-react/src/editable/runtime-before-input-events.ts`
- `packages/plite-react/src/editable/input-router.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/markdown-shortcuts.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/tables.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx`
- `content/docs/plite/libraries/plite-react/editable.md`
- `docs/plans/2026-05-14-plite-callback-memoization-dx-ralplan.md`

Accepted current shape:

- `onDOMBeforeInput` is the raw native `InputEvent` escape hatch and receives
  Plite context.
- Public `onCommand` and `EditableCommand*` are no longer accepted raw Plite
  app DX. They crossed into product command language.
- Native-format behavior that Plite owns remains internal runtime behavior
  after the public prop/types removal.
- Raw Plite examples use `Editable onKeyDown` for UI hotkeys and
  `transforms.*` middleware for reusable model behavior.
- Table Backspace/Delete/Enter, markdown Enter/Backspace, and richtext
  exit-on-Enter are model transform behavior, not UI shortcut behavior.
- Plate owns product shortcut/keymap composition.
- Native input listeners attach to the root once and read the latest handler
  props without requiring user `useMemo` or `useCallback`.
- Plite reports format commands but does not hard-code a mark schema.

Why it belongs in the PR:

- Formatting examples should not teach browser `inputType` parsing as normal
  editor behavior, but raw Plite also should not expose product command unions
  as public app API.
- The React runtime already owns native input classification and DOM repair, so
  native-format handling can stay internal while public apps use raw
  `onDOMBeforeInput` only when they need a low-level escape hatch.

Not claimed:

- A general plugin command registry.
- A replacement for app-owned overlay/cursor key handlers.
- Exact closure for legacy `onDOMBeforeInput` paste behavior.
- Exact closure for the historical DOMPoint crash reports without their
  original repro proof.

Proof references:

- `packages/plite-react/test/editing-kernel-contract.ts`
- `packages/plite-react/test/editable-behavior.tsx`
- `packages/plite-react/test/input-router-contract.test.tsx`
- `packages/plite-react/test/keyboard-input-strategy-contract.test.ts`
- `packages/plite-react/test/surface-contract.tsx`
- `apps/www/tests/plite-browser/donor/examples/hovering-toolbar.test.ts`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plans/2026-05-18-plite-table-transform-boundary-ralplan.md`

## 6.2.2 Core Boolean Mark Key Type Helper

Affected:

- `packages/plite/src/interfaces/text.ts`
- `packages/plite/src/index.ts`
- `packages/plite/test/generic-value-contract.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/custom-types.d.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/mark-utils.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/hovering-toolbar.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx`
- `docs/plans/2026-05-16-plite-boolean-mark-key-type-helper-ralplan.md`

Accepted shape:

- `slate` should export type-only `BooleanMarkKeysOf<N>` and
  `BooleanMarksOf<N>` helpers derived from existing `MarksOf<N>`.
- Examples should replace local mapped conditional types such as
  `BooleanTextKey<T>` with `BooleanMarkKeysOf<CustomText>`.
- Boolean mark helpers should exclude non-boolean mark attributes like
  `fontSize?: string`.
- `MarkKeysOf<N>` keeps its existing optional-mark fallback behavior; this is an
  additive helper, not a semantic rewrite.

Why it belongs in the PR:

- Public examples should teach Plite mark typing, not copied TypeScript
  conditional/mapped-type machinery.
- The helper names a raw Plite concept and stays type-only, so it does not turn
  core into a toolbar, hotkey, or Plate plugin API.

Not claimed:

- No runtime mark behavior change.
- No browser-formatting behavior change.
- No fixed issue claim for #5075 until exact TypeScript repro proof exists.
  The current claim is `Improves #5075`.

Proof references:

- `packages/plite/src/interfaces/text.ts`
- `packages/plite/test/generic-value-contract.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/custom-types.d.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/mark-utils.ts`
- `docs/plans/2026-05-16-plite-boolean-mark-key-type-helper-ralplan.md`

## 6.3 React Decoration Source Hook

Affected:

- `packages/plite/src/interfaces/node.ts`
- `packages/plite-react/src/hooks/use-slate-decoration-source.ts`
- `packages/plite-react/src/decoration-source.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/search-highlighting.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/markdown-preview.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/highlighted-text.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/external-decoration-sources.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/rendering-strategy-runtime.tsx`
- `docs/plans/2026-05-04-plite-legacy-example-dx-ralplan.md`
- `docs/plans/2026-05-18-plite-search-highlighting-dx-ralplan.md`

Accepted current shape:

- `createDecorationSource(editor, options)` remains the low-level projection
  source API.
- `usePliteDecorationSource(editor, options)` owns React lifecycle cleanup for
  common example and app code.
- The hook keeps the source stable for an editor while reading the latest
  `read` and `runtimeScope` callbacks.
- The hook accepts `deps?: readonly unknown[]` so external query/state changes
  refresh the source without recreating it or teaching memoized option objects
  in examples.
- `dirtiness` and `runtimeScope` remain visible in the call site because they
  are the performance contract.
- Structurally identical dirtiness class lists keep the same hook source
  identity, so multi-class sources can inline `dirtiness: ['text', 'node']`
  without caller-side tuple constants.
- `NodeApi.findTextRanges(root, query, options)` is the accepted raw Plite
  helper for turning text matches into `Range[]`. It is not a search feature:
  first-tranche options stay thin with `caseSensitive` plus `RegExp` or matcher
  callbacks, no `wholeWord`, no locale policy, and no public
  `across: 'text-siblings'` option.
- `createRangeDecorationSource(editor, options)` is the accepted helper over
  `createDecorationSource` for callers that already have ranges or range
  entries and do not need to hand-build projection objects, keys, or refresh
  defaults.
- `usePliteRangeDecorationSource(editor, options)` is the React helper for
  range-based decorations. It shares the low-level hook's lifecycle cleanup and
  `deps` refresh contract without recreating the source object.
- `createDecorationSource` and `usePliteDecorationSource` remain the power APIs
  for external stores, custom invalidation, manual `runtimeScope`, and metrics.
- The huge-overlay benchmark uses `useEditorSelector` plus
  `decorationSources`; no `usePliteSelector` alias or direct
  `<Plite projectionStore={...}>` prop is required.

Why it belongs in the PR:

- Decoration examples should teach the projection model, not repeated
  `useMemo` plus cleanup `useEffect` ceremony.
- Search, hashtag, markdown-preview, code-token, lint, and diagnostics examples
  should use generic range/source helpers when the repeated work is
  range-to-projection plumbing.
- Source lifecycle belongs behind a hook when the source is created inside a
  React component.
- Raw Plite should not grow `editor.api.search`, `SearchApi`, or product search
  options to satisfy a search-highlighting example.

Current proof:

- `bun run bench:react:huge-document-overlays:local` passes in `Plate repo root`.
- Benchmark green does not claim browser/native closure; selection, IME, copy,
  paste, find, and mobile rows remain separate gates.
- Range-source helper proof still requires parity against the manual source
  path: `sourceReadCount`, `recomputeCount`, `fullFallbackCount`,
  `changedRuntimeBucketCount`, `runtimeSubscriberWakeCount`, and
  `globalSubscriberWakeCount` must not regress.
- `#4076` stays a docs/example non-claim. It supports simplifying the example
  and rejecting product-shaped search API in raw Plite; it is not a fixed or
  improved issue claim.

Proof references:

- `packages/plite-react/test/app-owned-customization.tsx`
- `packages/plite-react/test/projections-and-selection-contract.tsx`
- `benchmarks/plite/donor/browser/react/huge-document-overlays.tsx`
- `benchmarks/plite/donor/browser/react/rerender-breadth.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/search-highlighting.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/markdown-preview.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/highlighted-text.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/external-decoration-sources.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/rendering-strategy-runtime.tsx`
- `docs/plans/2026-05-04-plite-legacy-example-dx-ralplan.md`
- `docs/plans/2026-05-18-plite-search-highlighting-dx-ralplan.md`

## 6.4 React Annotation Store Context

Affected:

- `packages/plite-react/src/components/slate.tsx`
- `packages/plite-react/src/hooks/use-slate-annotations.tsx`
- `packages/plite-react/src/hooks/use-slate-annotation-store.tsx`
- `packages/plite-react/src/hooks/use-slate-widget-store.tsx`
- `packages/plite-react/test/annotation-store-contract.tsx`
- `packages/plite-react/test/widget-layer-contract.tsx`
- `packages/plite-react/test/surface-contract.tsx`
- `content/docs/plite/libraries/plite-react/annotations.md`
- `content/docs/plite/libraries/plite-react/hooks.md`
- `apps/www/src/app/(app)/examples/plite/_examples/collaborative-comments.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/persistent-annotation-anchors.tsx`
- `docs/plans/2026-05-04-plite-legacy-example-dx-ralplan.md`

Accepted current shape:

- `<Plite annotationStore={store}>` is singular because one annotation store
  already owns many annotations.
- `usePliteAnnotations()` and `usePliteAnnotation(id)` read the provider store
  by default.
- Both hooks still accept an explicit store for cross-editor or out-of-tree
  annotation UI.
- Annotation projection remains provider-owned so inline segments, widgets, and
  sidebars read the same committed annotation state.
- Raw Plite owns the anchor/projection substrate only. Review comments,
  suggestions, permissions, and collaboration services stay product-layer work.
- `usePliteAnnotationStore` and `usePliteWidgetStore` accept projector options
  with explicit deps so examples can map product data without caller-side
  `useMemo` arrays.

Why it belongs in the PR:

- Examples should not pass the same store through `<Plite>` and component props
  just to list annotations.
- Singular naming matches the actual data model and avoids teaching users that
  multiple stores are the common case.

Proof references:

- `packages/plite-react/test/annotation-store-contract.tsx`
- `packages/plite-react/test/widget-layer-contract.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/collaborative-comments.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/persistent-annotation-anchors.tsx`
- `docs/plans/2026-05-04-plite-legacy-example-dx-ralplan.md`

## 6.4.1 React Editable Renderer Registration

Affected:

- `packages/plite-react/src/editable/editable-renderers.ts`
- `packages/plite-react/src/components/editable-text-blocks.tsx`
- `packages/plite-react/src/index.ts`
- `content/docs/plite/concepts/09-rendering.md`
- `content/docs/plite/libraries/plite-react/editable.md`
- `content/docs/plite/walkthroughs/03-defining-custom-elements.md`
- `content/docs/plite/walkthroughs/04-applying-custom-formatting.md`
- `content/docs/plite/walkthroughs/05-executing-commands.md`
- `content/docs/plite/walkthroughs/09-performance.md`

Accepted current shape:

- Raw Plite should not own a renderer registry. Public `editableRenderers(...)`
  and any planned `editable.renderers` facet are hard cuts.
- Raw `Editable` render props are the Plite React rendering API.
- Beginner docs teach module-level or editor-creation-stable render callbacks,
  not `useCallback` cargo cult and not raw Plite renderer registries.
- Core `slate` stays non-React; renderer registration belongs to `plite-react`.

Not claimed:

- A raw Plite renderer registry.
- A core `EditorElementSpec` React renderer field.
- Exact closure for selection-event callback churn reports without their
  original browser repro.

Proof references:

- `packages/plite-react/test/surface-contract.test.tsx`
- `packages/plite-react/src/editable/editable-renderers.ts`
- `packages/plite-react/src/components/editable-text-blocks.tsx`
- `docs/plans/2026-05-14-plite-example-memoization-hard-cut-ralplan.md`

## 6.5 Render Path Props

Affected:

- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-dom/src/utils/weak-maps.ts`
- `packages/plite-react/src/components/editable-text-blocks.tsx`
- `packages/plite-react/src/hooks/use-element-path.ts`
- `packages/plite-react/src/hooks/use-element-selected.ts`
- `packages/plite-react/src/hooks/use-plite-node-ref.tsx`
- `packages/plite-react/test/surface-contract.tsx`
- `packages/plite-react/test/provider-hooks-contract.tsx`
- `packages/plite-dom/test/bridge.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/embeds.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/paste-html.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx`
- `content/docs/plite/libraries/plite-react/editable.md`
- `content/docs/plite/libraries/plite-react/hooks.md`
- `docs/plans/2026-05-12-plite-render-path-prop-performance-ralplan.md`

Accepted current shape:

- `RenderElementProps` receives `attributes`, `children`, `element`,
  `isInline`, and `slots`; it does not expose eager `path` or `index`.
- `RenderVoidProps` receives `{ element }`; it does not expose eager `path`.
- Event handlers resolve the current location with
  `editor.api.dom.findPath(element)`.
- The installed DOM extension handle resolves by runtime id before stale
  weak-map indexes.
- `useElementPath()` is the opt-in render-time path subscription.
- `useElementSelected()` keeps intersection semantics; block voids that only
  want selected UI for a collapsed caret use
  `useElementSelected({ mode: 'collapsed' })`.
- Explicit watched paths use `useElementSelected({ at: path })`; there is no
  positional path overload.
- No temporary `target`, `path`, or `index` compat alias is kept for v2 render
  props.

Why it belongs in the PR:

- Public render props must not force sibling-wide rerenders after leading
  inserts just to keep tree-address props fresh.
- Path is current location metadata, not mounted-node identity.
- The default renderer surface stays small while path-dependent UI can opt into
  a targeted subscription.

Proof references:

- `packages/plite-react/test/surface-contract.tsx`
- `packages/plite-react/test/use-element-selected.test.tsx`
- `packages/plite-react/test/provider-hooks-contract.tsx`
- `packages/plite-dom/test/bridge.ts`
- `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/embeds.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/check-lists.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/paste-html.tsx`
- `docs/plans/2026-05-12-plite-render-path-prop-performance-ralplan.md`

## 7. DOM Coverage Boundaries

Affected:

- `packages/plite-dom/src/plugin/dom-coverage.ts`
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/plite-react/src/dom-coverage-boundary.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/dom-coverage-boundaries.tsx`
- `docs/plans/2026-05-02-plite-hidden-subtree-first-class-ralplan.md`

Accepted current shape:

- The primitive is DOM coverage for model-present content, not product-level
  "hidden subtree" UI.
- Raw renderers cannot omit editable descendants and expect Plite to guess.
- Omitted DOM must be represented by a Plite-owned coverage boundary.
- Selection, copy, paste, and materialization consult the shared boundary
  registry.
- The public authoring API is still unstable. `HiddenRange` and `HiddenSelf`
  naming are rejected.

Why it belongs in the PR:

- This is the missing-DOM substrate needed for collapse, staged mounting,
  app-owned preview surfaces, and virtualization.
- It prevents the old `Cannot resolve a Plite node from DOM node` failure class
  from becoming a permanent v2 footgun.

Not claimed:

- Stable `slots.Boundary`.
- Stable self-boundary API.
- Native browser find over unmounted content.
- Production-ready virtualization semantics.

Proof references:

- `docs/plans/2026-05-02-plite-hidden-subtree-first-class-ralplan.md`
- `docs/plans/2026-05-03-plite-dom-present-large-doc-phase-6-plan.md`
- `docs/plite/references/chunking-review.md`

## 8. Large Document Rendering Strategy

Affected:

- `packages/plite-react/src/rendering-strategy/**`
- `apps/www/src/app/(app)/examples/plite/_examples/huge-document.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/rendering-strategy-runtime.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/rendering-strategy-virtualized.tsx`
- `docs/plans/2026-05-03-plite-dom-present-large-doc-phase-6-plan.md`
- `docs/plans/2026-05-03-plite-experimental-virtualized-rendering-boundary.md`

Accepted current shape:

- Child-count chunking is dead as the default architecture.
- The safe baseline is cheap DOM-present rendering with selector-first updates,
  semantic islands, and commit-scoped invalidation.
- Staged large-document mounting uses DOM coverage for pending regions.
- `interactiveReady` and `nativeSurfaceComplete` are separate concepts.
- Full-document replacement must not leave stale far DOM exposed.
- Virtualized rendering is explicit and experimental. The API exposes it only
  through object form, `{ type: 'virtualized' }`; stable string strategies stay
  `auto`, `full`, and `staged`. Public `shell` / `preview-shell` is cut before
  beta; preview or collapse UI belongs above Plite and must use DOM coverage.
- DOM strategy option objects normalize by primitive fields inside
  `Editable`, so examples do not need caller-side `useMemo` just to stabilize
  option identity.

Why it belongs in the PR:

- Large-doc behavior is one of the main reasons to rewrite the runtime.
- GitHub-scale lessons apply: make hot render units cheap first, then use
  virtualization only for the extreme tail with honest browser-behavior tradeoffs.

Open gates:

- The 5000-block huge-document DOM-present/default gate is scoped as current
  release proof.
- The 10000-block immediate far-selection stress row is not claimed as fixed.
- Virtualized editing needs stricter caret, IME, mobile, copy, and find proof
  before production positioning.
- The Pretext layout target hard-cuts public `renderingStrategy` to
  `domStrategy` before beta because the current name conflates layout,
  pagination, preview surfaces, and viewport virtualization. Any temporary
  alias is implementation-only and must not appear in public examples or docs.

Proof references:

- `docs/plite/references/chunking-review.md`
- `docs/plans/2026-05-03-plite-dom-present-large-doc-phase-6-plan.md`
- `docs/plans/2026-05-03-plite-experimental-virtualized-rendering-boundary.md`
- `docs/plans/2026-05-23-plite-large-document-performance-virtualization-ralplan.md`
- `docs/plite/replacement-gates-scoreboard.md`
- `packages/plite-react/test/surface-contract.test.tsx`
- `apps/www/src/app/(app)/examples/plite/_examples/rendering-strategy-runtime.tsx`

## 9. Browser Regression And Example Proof

Affected:

- `apps/www/constants/examples.ts`
- `apps/www/src/app/(app)/examples/plite/[example].tsx`
- `apps/www/examples/**`
- `Plate repo root/tests/integration/**`

Accepted current shape:

- Examples are proof surfaces, not demos bolted on after the runtime.
- v2-only examples cover projected decorations, external decoration sources,
  persistent annotations, review comments, runtime rendering strategy, large docs,
  DOM coverage boundaries, and experimental virtualization.
- Regression examples cover iframe DOM fallback and inline void mention
  navigation.
- The virtualized example is visible as `Experimental Virtualized Rendering`.

Why it belongs in the PR:

- Maintainers need a reviewable browser surface for architecture claims.
- The PR body should point reviewers to examples that prove exact runtime
  behavior, especially around browser selection and DOM mapping.

Proof references:

- `docs/plans/2026-05-03-plite-mentions-void-arrow-selection-regression.md`
- `docs/plans/2026-05-03-plite-experimental-virtualized-rendering-boundary.md`
- `docs/plite/replacement-gates-scoreboard.md`

## 10. Release Gates Not Yet Claimed

Do not write the PR as release-ready until these are closed or explicitly scoped
out:

- Final same-turn integration/build/type/lint/perf closure.
- Full `bun test:integration-local` closure.
- RC ledger closure.
- Completion-check status.
- Huge-doc performance scope declaration: 5000-block default proof is in scope;
  10000-block immediate far-selection stress is not claimed unless a later
  artifact closes it.
- Raw-device mobile proof, unless the PR explicitly scopes mobile to semantic or
  Playwright-device proof.
- Stable public DOM coverage slot API.
- Production-ready virtualization.
- Public docs/JSDoc pass for the React editor initialization API.
- Remaining test fixture migration away from legacy static editor helpers.

Review rule:

- Keep only drift with a concrete owner, a proof file, or a release gate.
- Architecture rows outrank local compatibility when they conflict.
- Same-path/source-close pressure is strongest for examples, docs, and public
  package surfaces.
- If a row is not engine-forced and has no current value, keep it out of the PR.
