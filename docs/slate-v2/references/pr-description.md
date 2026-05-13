---
date: 2026-05-04
topic: slate-v2-pr-description
status: active-reference
---

# Slate v2 PR Description Reference

Use this as the maintainer-facing PR body source. Keep it as a drift register:
what belongs in the PR, why it belongs in v2, what proof exists, and what is
not claimed yet.

## 0. Issue Coverage Accounting

The Slate v2 goal is not just "new architecture." The PR should close or
materially improve the highest-value issue clusters from
`docs/slate-issues`.

Full ledger:

- [Live Gitcrawl Open Ledger](/Users/zbeyens/git/plate-2/docs/slate-issues/gitcrawl-live-open-ledger.md)
- [Gitcrawl Recluster Map](/Users/zbeyens/git/plate-2/docs/slate-issues/gitcrawl-recluster-map.md)
- [Issue Coverage Matrix](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/issue-coverage-matrix.md)

Current summary:

- Fixed issue claims: `32`
- Related issue matrix rows: `189`
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

Current fixed issue claims:

- Fixes #6013: React providers accept pre-initialized editor instances without
  a provider-level `initialValue`; editor state is seeded during editor creation.
- Fixes #5605: The public React initialization path has no duplicate
  provider-level `initialValue` requirement.
- Fixes #5709: React provider hook consumers receive the replacement editor
  when `<Slate editor>` changes.
- Fixes #5233: Custom fragment format keys isolate both internal MIME payloads
  and embedded HTML fallback fragments.
- Fixes #3486: Custom clipboard format keys isolate internal fragment
  transport.
- Fixes #4569: `insertData` docs state capability order, handler return
  semantics, and fallback behavior.
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
- Fixes #5080: `state.nodes.match({ reverse: true })` returns the exact reverse
  of the forward matched entry order for nested matching entries.
- Fixes #6053: `useElementSelected()` does not throw when a selected rendered
  element removes itself, and `useElementSelected({ at: path })` returns
  `false` after the watched path is removed.
- Fixes #5400: Public helper value namespaces use `*Api`, so importing Slate
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
- The examples app serves on the Slate v2 dev ports, with Playwright running
  against the built Next app for integration proof.

Why it belongs in the PR:

- The runtime target is not legacy Slate with local patches.
- The root toolchain is part of the v2 contract because React 19, TypeScript 6,
  Bun, Playwright, and package source graphs shape the editor API and proof
  lanes.

Proof references:

- `../slate-v2/package.json`
- `../slate-v2/bunfig.toml`
- `../slate-v2/playwright.config.ts`
- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/release-readiness-decision.md`

## 2. Package Manifest And Source Graph Reset

Affected:

- `../slate-v2/packages/*/package.json`
- `../slate-v2/packages/*/tsconfig*.json`
- `../slate-v2/packages/*/src/index.ts`

Accepted current shape:

- Packages use ESM-oriented exports and package-local build/test/typecheck
  scripts.
- Workspace dependencies stay local and source-first during development.
- Public barrels expose only the v2-supported surface.
- Dead compatibility exports do not stay public just to reduce diff size.

Why it belongs in the PR:

- The package graph is an API boundary. Keeping legacy exports visible makes v2
  look compatible where it intentionally is not.

Proof references:

- `docs/slate-v2/final-api-hard-cuts-status.md`
- `docs/slate-v2/references/live-shape-register.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`

## 3. Core Editor API Reset

Affected:

- `../slate-v2/packages/slate/src/**`
- `../slate-v2/packages/slate/test/**`
- `docs/slate-v2/ledgers/slate-editor-api.md`
- `docs/plans/2026-05-03-slate-v2-core-editor-method-hard-cut-ralplan.md`

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
  commit metadata, bookmarks, and local runtime targets; raw Slate does not grow
  adapter-shaped public namespaces.
- The public `Editor.*` static method namespace is not the v2 teaching or
  extension surface.
- Public data helper values use `*Api` names such as `NodeApi`, `ElementApi`,
  `PathApi`, and `RangeApi`; model type names stay `Node`, `Element`, `Path`,
  and `Range`.
- Mutable editor fields, direct `apply` extension points, direct `onChange`
  extension points, and `Transforms.*` teaching are outside the final public
  posture.

Why it belongs in the PR:

- This is the main architectural cut. v2 is a transaction/snapshot editor, not a
  faster legacy namespace.

Open debt:

- Some tests still use legacy-style fixtures such as `Editor.replace`. Treat that
  as fixture migration debt, not a public API endorsement.
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

- `docs/slate-v2/references/architecture-contract.md`
- `docs/slate-v2/absolute-architecture-release-claim.md`
- `docs/slate-v2/final-api-hard-cuts-status.md`
- `docs/plans/2026-05-03-slate-v2-core-editor-method-hard-cut-ralplan.md`
- `docs/plans/2026-05-07-slate-v2-core-structural-delete-normalization-ralplan.md`
- `docs/plans/2026-05-07-slate-v2-inline-delete-boundary-repro-ralplan.md`
- `docs/plans/2026-05-07-slate-v2-operation-extensibility-validation-ralplan.md`
- `docs/plans/2026-05-07-slate-v2-insert-fragment-at-location-ralplan.md`
- `.tmp/completion-checks/slate-v2-insert-fragment-at-location-execution.md`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate/test/query-contract.ts`
- `../slate-v2/packages/slate/test/collab-history-runtime-contract.ts`
- `../slate-v2/packages/slate/test/commit-metadata-contract.ts`
- `../slate-v2/packages/slate/test/migration-backbone-contract.ts`
- `../slate-v2/packages/slate/src/editor/nodes.ts`
- `.tmp/completion-checks/slate-v2-editor-nodes-reverse-order-ralplan.md`
- `.tmp/completion-checks/slate-v2-core-structural-delete-normalization-execution.md`
- `.tmp/completion-checks/slate-v2-operation-extensibility-validation-execution.md`
- `.tmp/completion-checks/slate-v2-core-caret-movement-word-insert-break-execution.md`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`

## 4. Support Package Closure

Affected:

- `../slate-v2/packages/slate-history/**`
- `../slate-v2/packages/slate-hyperscript/**`

Accepted current shape:

- `slate-history` follows the transaction/commit model instead of patching
  mutable editor internals.
- History integrity is tested through contract and benchmark proof.
- `slate-hyperscript` exists as a v2 fixture/test authoring helper, not a
  compatibility sink for stale core assumptions.

Why it belongs in the PR:

- Support packages prove the core API is usable outside the core package.
- They also catch legacy assumptions that package-local core tests miss.

Proof references:

- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/references/normalization-reference.md`

## 5. DOM Runtime Closure

Affected:

- `../slate-v2/packages/slate-dom/src/**`
- `../slate-v2/packages/slate-dom/test/**`

Accepted current shape:

- `slate-dom` owns DOM selection export/import, clipboard policy, DOM coverage
  lookup, and hotkey matching.
- DOM helpers cannot blindly assume every model point has mounted DOM.
- Clipboard behavior uses the model when DOM coverage says native DOM is missing
  or stale.
- `is-hotkey` is not a dependency. Slate owns `isHotkey(spec, event)` in
  `slate-dom`.

Why it belongs in the PR:

- DOM correctness is the boundary between editor model truth and browser truth.
- v2 cannot ship selection/copy/paste behavior as accidental React behavior.

Proof references:

- `docs/plans/2026-05-03-slate-v2-hotkey-runtime-dependency-ralplan.md`
- `docs/plans/2026-05-02-slate-v2-hidden-subtree-first-class-ralplan.md`
- `docs/plans/2026-05-03-slate-v2-dom-present-large-doc-phase-6-plan.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`

## 5.1 Clipboard And Serialization Boundary

Affected:

- `../slate-v2/packages/slate/src/**`
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`

Accepted current shape:

- `slate` owns fragment extraction and insertion semantics.
- `slate-dom` owns `DataTransfer`, custom fragment MIME keys, keyed embedded
  HTML fragment transport, plain-text fallback, and DOM coverage copy/paste
  policy.
- `slate-react` owns browser event dispatch for copy, cut, paste, drag, and
  drop, then delegates payload work to `editor.dom.clipboard`.
- Low-level clipboard APIs stay under `editor.dom.clipboard`; raw `editor`
  does not grow a public clipboard namespace.
- App-owned rich HTML/image/custom paste behavior runs through
  `dom.clipboard.insertData` capabilities.
- Custom fragment format keys isolate both `application/${clipboardFormatKey}`
  payloads and embedded `data-slate-fragment` HTML fallback. Mismatched
  embedded fragments fall back to safe import behavior instead of importing
  schema-private JSON.
- `withReact` and `withDOM` take options objects for DOM adapter settings:
  `withReact(createEditor(), { clipboardFormatKey: 'x-product-fragment' })`.
- `DOMClipboardInsertDataHandler` is public from `slate-dom`; app-owned rich
  HTML/image paste behavior runs through typed `dom.clipboard.insertData`
  capabilities.
- Foreign or malformed internal fragment payloads must fail closed and fall
  back to safe import behavior.
- Rich Slate fragment insertion preserves the receiving text-block type when a
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
- Selected inline void export must not assume block-void spacer DOM; copy,
  paste round-trip, and cut ordering keep the model fragment at the DOM
  clipboard boundary.
- Selected block void cut writes clipboard data, removes the void block once,
  and requests model-owned DOM repair.
- Core model fragment extraction keeps whole-list wrappers, and delete across a
  list between text blocks does not leave an orphan `list-item`.
- Focused DOM clipboard proof covers malformed MIME payloads, malformed
  embedded HTML `data-slate-fragment`, invalid JSON, URI-decode failures,
  non-array JSON, no-fallback no-op behavior, and rich fragment target-block
  preservation, custom-key embedded HTML acceptance/rejection, plus selected
  inline void copy/paste/cut ordering and selected block void cut repair.

Performance status:

- Improves #5945: 10,000-line plaintext paste runs through one logical
  `replace_children` operation in the issue-size benchmark. Exact
  `Fixes #5945` closure still needs a 10,000-line browser artifact for the
  plaintext example flow.
- Improves #4056: the issue-size benchmark now covers populated-editor large
  copy and large middle paste. The latest run reports `12.16ms` for copying
  10,000 populated blocks and `185.49ms` for pasting 10,000 plaintext lines
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
  not proof of a valid Slate fragment.
- Missing-DOM copy/paste must use the same explicit DOM coverage policy as
  hidden, staged, and future virtualized regions.

Proof references:

- `docs/plans/2026-05-04-slate-v2-clawsweeper-v2-clipboard-serialization-ralplan.md`
- `../slate-v2/tmp/slate-clipboard-large-payload-benchmark.json`
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `.tmp/completion-checks/slate-v2-multiblock-fragment-middle-insert-execution.md`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-serialization-execution.md`
- `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-fragment-insertion-shape-execution.md`
- `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-inline-void-execution.md`
- `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-structural-cut-delete-execution.md`
- `.tmp/completion-checks/slate-v2-clawsweeper-v2-clipboard-api-extension-surface-execution.md`

## 6. React Runtime Closure

Affected:

- `../slate-v2/packages/slate-react/src/**`
- `../slate-v2/site/examples/**`
- `../slate-v2/tests/integration/**`

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
- Generated browser gauntlets and v2-only examples are part of the proof surface.

Why it belongs in the PR:

- The React package is where old Slate API habits usually leak back in.
- The PR needs to explain that React is an adapter over a transaction editor, not
  the source of editor state truth.

Proof references:

- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/final-api-hard-cuts-status.md`
- `docs/slate-v2/absolute-architecture-release-claim.md`
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md`
- `../slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `../slate-v2/packages/slate-react/test/app-owned-customization.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/docs/libraries/slate-react/editable.md`
- `../slate-v2/docs/libraries/slate-react/hooks.md`
- `../slate-v2/docs/libraries/slate-react/slate.md`
- `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts`
- `../slate-v2/packages/slate-react/test/editing-epoch-kernel-contract.ts`
- `../slate-v2/packages/slate-react/test/selection-runtime-contract.test.ts`
- `../slate-v2/packages/slate-react/test/model-input-strategy-contract.test.ts`
- `../slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.test.tsx`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/playwright/integration/examples/placeholder.test.ts`
- `../slate-v2/playwright/integration/examples/inlines.test.ts`
- `../slate-v2/playwright/integration/examples/mentions.test.ts`
- `../slate-v2/playwright/integration/examples/highlighted-text.test.ts`
- `../slate-v2/playwright/integration/examples/markdown-shortcuts.test.ts`
- `../slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- `../slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`

## 6.1 React Editor Initialization And Value API

Affected:

- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-editor.ts`
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/site/examples/ts/**`
- `docs/plans/2026-05-04-slate-v2-react-editor-initialization-value-ralplan.md`

Accepted current shape:

- `createEditor({ initialValue, initialSelection })` seeds public editor state
  synchronously before React provider render.
- `useSlateEditor({ initialValue, withEditor })` is the React helper for the common
  `withReact(createEditor(...))` construction path.
- `withEditor` is singular because it mirrors Slate's existing `withReact` /
  `withHistory` composition instead of inventing a plugin array DSL.
- `<Slate editor={editor}>` provides context, subscriptions, decoration sources,
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

- `docs/plans/2026-05-04-slate-v2-react-editor-initialization-value-ralplan.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `../slate-v2/packages/slate/test/state-tx-public-api-contract.ts`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`

## 6.2 React Editable Extension Input Rules

Affected:

- `../slate-v2/packages/slate-react/src/editable/editable-input-rules.ts`
- `../slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `../slate-v2/packages/slate-react/src/index.ts`
- `../slate-v2/site/examples/ts/check-lists.tsx`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`

Accepted current shape:

- `Editable` can read input rules from editor extension capabilities.
- `editableInputRules(...)` is the Slate React helper for registering model
  input behavior from an editor extension.
- Example model behavior such as checklist Backspace belongs to the editor
  behavior layer, not example-level `Editable onKeyDown` glue.
- Public extension `commands` remain rejected; input rules are a narrow React
  editing capability, not a command registry revival.

Why it belongs in the PR:

- The examples should teach first-class editor behavior composition instead of
  copying per-component keydown branches.
- The React runtime already owns beforeinput, composition, repair, and DOM
  selection policy, so model input rules need to enter through that runtime.

Not claimed:

- A full extension keyboard shortcut system.
- A replacement for every app-owned `onKeyDown` escape hatch.
- Legacy command-slot compatibility.

Proof references:

- `../slate-v2/packages/slate-react/test/editable-behavior.tsx`
- `../slate-v2/site/examples/ts/check-lists.tsx`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`

## 6.3 React Decoration Source Hook

Affected:

- `../slate-v2/packages/slate-react/src/hooks/use-slate-decoration-source.ts`
- `../slate-v2/packages/slate-react/src/decoration-source.ts`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`
- `../slate-v2/site/examples/ts/search-highlighting.tsx`
- `../slate-v2/site/examples/ts/markdown-preview.tsx`
- `../slate-v2/site/examples/ts/highlighted-text.tsx`
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx`
- `../slate-v2/site/examples/ts/rendering-strategy-runtime.tsx`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`

Accepted current shape:

- `createDecorationSource(editor, options)` remains the low-level projection
  source API.
- `useSlateDecorationSource(editor, options)` owns React lifecycle cleanup for
  common example and app code.
- The hook keeps the source stable for an editor while reading the latest
  `read` and `runtimeScope` callbacks.
- `dirtiness` and `runtimeScope` remain visible in the call site because they
  are the performance contract.
- The huge-overlay benchmark uses `useEditorSelector` plus
  `decorationSources`; no `useSlateSelector` alias or direct
  `<Slate projectionStore={...}>` prop is required.

Why it belongs in the PR:

- Decoration examples should teach the projection model, not repeated
  `useMemo` plus cleanup `useEffect` ceremony.
- Source lifecycle belongs behind a hook when the source is created inside a
  React component.

Current proof:

- `bun run bench:react:huge-document-overlays:local` passes in `../slate-v2`.
- Benchmark green does not claim browser/native closure; selection, IME, copy,
  paste, find, and mobile rows remain separate gates.

Proof references:

- `../slate-v2/packages/slate-react/test/app-owned-customization.tsx`
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`
- `../slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`
- `../slate-v2/site/examples/ts/search-highlighting.tsx`
- `../slate-v2/site/examples/ts/markdown-preview.tsx`
- `../slate-v2/site/examples/ts/highlighted-text.tsx`
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx`
- `../slate-v2/site/examples/ts/rendering-strategy-runtime.tsx`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`

## 6.4 React Annotation Store Context

Affected:

- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`
- `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/docs/libraries/slate-react/annotations.md`
- `../slate-v2/docs/libraries/slate-react/hooks.md`
- `../slate-v2/site/examples/ts/collaborative-comments.tsx`
- `../slate-v2/site/examples/ts/review-comments.tsx`
- `../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`

Accepted current shape:

- `<Slate annotationStore={store}>` is singular because one annotation store
  already owns many annotations.
- `useSlateAnnotations()` and `useSlateAnnotation(id)` read the provider store
  by default.
- Both hooks still accept an explicit store for cross-editor or out-of-tree
  annotation UI.
- Annotation projection remains provider-owned so inline segments, widgets, and
  sidebars read the same committed annotation state.
- Raw Slate owns the anchor/projection substrate only. Review comments,
  suggestions, permissions, and collaboration services stay product-layer work.

Why it belongs in the PR:

- Examples should not pass the same store through `<Slate>` and component props
  just to list annotations.
- Singular naming matches the actual data model and avoids teaching users that
  multiple stores are the common case.

Proof references:

- `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `../slate-v2/site/examples/ts/collaborative-comments.tsx`
- `../slate-v2/site/examples/ts/review-comments.tsx`
- `../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`

## 6.5 Render Path Props

Affected:

- `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- `../slate-v2/packages/slate-dom/src/utils/weak-maps.ts`
- `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `../slate-v2/packages/slate-react/src/hooks/use-element-path.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-element-selected.ts`
- `../slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx`
- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-dom/test/bridge.ts`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/ts/check-lists.tsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `../slate-v2/site/examples/ts/mentions.tsx`
- `../slate-v2/docs/libraries/slate-react/editable.md`
- `../slate-v2/docs/libraries/slate-react/hooks.md`
- `docs/plans/2026-05-12-slate-v2-render-path-prop-performance-ralplan.md`

Accepted current shape:

- `RenderElementProps` receives `attributes`, `children`, `element`,
  `isInline`, and `slots`; it does not expose eager `path` or `index`.
- `RenderVoidProps` receives `{ element }`; it does not expose eager `path`.
- Event handlers resolve the current location with `editor.dom.findPath(element)`.
- `DOMEditor.findPath` resolves by runtime id before stale weak-map indexes.
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

- `../slate-v2/packages/slate-react/test/surface-contract.tsx`
- `../slate-v2/packages/slate-react/test/use-element-selected.test.tsx`
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `../slate-v2/packages/slate-dom/test/bridge.ts`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/ts/check-lists.tsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `docs/plans/2026-05-12-slate-v2-render-path-prop-performance-ralplan.md`

## 7. DOM Coverage Boundaries

Affected:

- `../slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts`
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- `../slate-v2/packages/slate-react/src/dom-coverage-boundary.tsx`
- `../slate-v2/site/examples/ts/dom-coverage-boundaries.tsx`
- `docs/plans/2026-05-02-slate-v2-hidden-subtree-first-class-ralplan.md`

Accepted current shape:

- The primitive is DOM coverage for model-present content, not product-level
  "hidden subtree" UI.
- Raw renderers cannot omit editable descendants and expect Slate to guess.
- Omitted DOM must be represented by a Slate-owned coverage boundary.
- Selection, copy, paste, and materialization consult the shared boundary
  registry.
- The public authoring API is still unstable. `HiddenRange` and `HiddenSelf`
  naming are rejected.

Why it belongs in the PR:

- This is the missing-DOM substrate needed for collapse, staged mounting, shell
  modes, and virtualization.
- It prevents the old `Cannot resolve a Slate node from DOM node` failure class
  from becoming a permanent v2 footgun.

Not claimed:

- Stable `slots.Boundary`.
- Stable self-boundary API.
- Native browser find over unmounted content.
- Production-ready virtualization semantics.

Proof references:

- `docs/plans/2026-05-02-slate-v2-hidden-subtree-first-class-ralplan.md`
- `docs/plans/2026-05-03-slate-v2-dom-present-large-doc-phase-6-plan.md`
- `docs/slate-v2/references/chunking-review.md`

## 8. Large Document Rendering Strategy

Affected:

- `../slate-v2/packages/slate-react/src/rendering-strategy/**`
- `../slate-v2/site/examples/ts/huge-document.tsx`
- `../slate-v2/site/examples/ts/rendering-strategy-runtime.tsx`
- `../slate-v2/site/examples/ts/rendering-strategy-virtualized.tsx`
- `docs/plans/2026-05-03-slate-v2-dom-present-large-doc-phase-6-plan.md`
- `docs/plans/2026-05-03-slate-v2-experimental-virtualized-rendering-boundary.md`

Accepted current shape:

- Child-count chunking is dead as the default architecture.
- The safe baseline is cheap DOM-present rendering with selector-first updates,
  semantic islands, and commit-scoped invalidation.
- Staged large-document mounting uses DOM coverage for pending regions.
- `interactiveReady` and `nativeSurfaceComplete` are separate concepts.
- Full-document replacement must not leave stale far DOM exposed.
- Virtualized rendering is explicit and experimental. The API exposes it only
  through object form, `{ type: 'virtualized' }`; stable string strategies stay
  `auto`, `full`, `staged`, and `shell`.

Why it belongs in the PR:

- Large-doc behavior is one of the main reasons to rewrite the runtime.
- GitHub-scale lessons apply: make hot render units cheap first, then use
  virtualization only for the extreme tail with honest browser-behavior tradeoffs.

Open gates:

- The 5000-block huge-document typing/select superiority gate is not a final
  release claim yet.
- Virtualized editing needs stricter caret, IME, mobile, copy, and find proof
  before production positioning.

Proof references:

- `docs/slate-v2/references/chunking-review.md`
- `docs/plans/2026-05-03-slate-v2-dom-present-large-doc-phase-6-plan.md`
- `docs/plans/2026-05-03-slate-v2-experimental-virtualized-rendering-boundary.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`

## 9. Browser Regression And Example Proof

Affected:

- `../slate-v2/site/constants/examples.ts`
- `../slate-v2/site/pages/examples/[example].tsx`
- `../slate-v2/site/examples/**`
- `../slate-v2/tests/integration/**`

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

- `docs/plans/2026-05-03-slate-v2-mentions-void-arrow-selection-regression.md`
- `docs/plans/2026-05-03-slate-v2-experimental-virtualized-rendering-boundary.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`

## 10. Release Gates Not Yet Claimed

Do not write the PR as release-ready until these are closed or explicitly scoped
out:

- Final same-turn integration/build/type/lint/perf closure.
- Full `bun test:integration-local` closure.
- RC ledger closure.
- Completion-check status.
- Huge-doc typing/select superiority against the current comparator.
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
