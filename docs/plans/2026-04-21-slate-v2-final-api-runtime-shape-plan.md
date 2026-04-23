---
date: 2026-04-21
topic: slate-v2-final-api-runtime-shape
status: active
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/slate
---

# Slate v2 Final API / Runtime Shape Plan

## Goal

Finish the Slate v2 API and runtime as if designed from scratch:

- keep Slate's data model and operation semantics
- keep custom rendering and browser extensibility
- hard-cut legacy runtime/API surfaces that fight the final architecture
- make the default API point at the best v2 runtime

This is not a backward-compat pass.

Compatibility can survive only as thin, explicitly named adapters that do not
shape the core or React runtime.

## Target Shape

The final v2 shape is:

- `slate`: data-model-first core, transaction-first execution, operation truth
- `slate-dom`: browser translation, DOM selection, clipboard, IME, repair
- `slate-browser`: proof harness and browser automation contracts
- `slate-react`: React-perfect runtime over commit records, live reads,
  projection sources, semantic islands, and DOM-owned text capability

## 1. Core State API

### Hard Cut

Cut these as primary documented APIs:

- `editor.children`
- `editor.selection`
- `editor.marks`
- `editor.operations`
- instance `editor.apply(...)`
- instance `editor.onChange(...)`

### Keep / Promote

Primary API:

- `Editor.getChildren(editor)`
- `Editor.getLiveSelection(editor)`
- `Editor.getMarks(editor)`
- `Editor.getOperations(editor, since?)`
- `Editor.apply(editor, op)`
- `Editor.withTransaction(editor, tx => ...)`
- `Editor.subscribe(editor, listener)`

### Rule

Mutable fields may remain only as compatibility mirrors while migration
pressure exists. They must not be used in docs, examples, or new tests as the
primary API.

## 2. Transaction-First Core

Every local write should execute through a transaction boundary.

Requirements:

- transforms run inside transactions
- nested transactions collapse into one commit
- every commit produces `EditorCommit`
- commit metadata includes operation classes, dirty paths, dirty runtime ids,
  top-level ranges, selection flags, and mark flags
- history/collaboration consume operations, not React/runtime state

## 3. Incremental Snapshot Runtime

`Editor.getSnapshot()` remains, but only as observer artifact.

Required work:

- structural sharing for unchanged subtrees
- incremental snapshot index maintenance where dirty metadata permits
- full snapshot rebuild only for broad replace/unknown cases
- no urgent React read path calls `getSnapshot()`

## 4. Live Read API

Official live read surface:

- `Editor.getLiveNode(editor, path)`
- `Editor.getLiveText(editor, path)`
- `Editor.getLiveChildren(editor, path?)`
- `Editor.getLiveSelection(editor)`
- `Editor.getRuntimeId(editor, path)`
- `Editor.getPathByRuntimeId(editor, id)`
- `Editor.getLastCommit(editor)`
- `Editor.getDirtyRuntimeIds(editor, commit)`
- `Editor.getDirtyTopLevelRange(editor, commit)`

Live reads are runtime APIs. Snapshot reads are observer APIs.

## 5. Hard Cut `decorate`

Final API should not teach or expose `Editable.decorate` as primary.

Required final state:

- projection sources are the primary overlay API
- `createSlateDecorationSource` exists only as migration/compat adapter
- examples use projection stores
- docs teach typed projection sources
- `decorate` is removed from final public React API or moved behind an
  explicitly named compatibility adapter

## 6. Overlay Source System

One projection kernel, typed sources:

- decorations
- annotations
- widgets
- review comments
- external stores

Every source declares:

- source id
- dirtiness class
- range provider
- payload type
- refresh policy

Review/comments/widgets must not be forced through text decorations.

## 7. Hard Cut Child-Count Chunking

Already cut from current `slate-react` product runtime.

Final cleanup:

- no docs teach child-count chunking
- no current examples expose chunking controls
- no product package source exposes `getChunkSize`, `renderChunk`, or
  `data-slate-chunk`
- legacy chunking remains only in direct comparison fixtures

## 8. Rename The Primary React Runtime

Final API:

- `Editable` means the current semantic-blocks runtime.
- old legacy `Editable` implementation is deleted or private.
- `EditableBlocks` is removed or left only as a temporary alias during the
  cutover.

Required result:

- docs and examples import `Editable`
- `Editable` props are the new runtime props:
  - semantic blocks
  - projection store
  - large document options
  - render element/text/leaf/segment
  - DOM text sync capability
- no `decorate`
- no `renderChunk`
- no child-count chunking

## 9. DOM-Owned Text Lane

Keep the lane, but keep it strict.

Required public/internal contract:

- capability result
- opt-out reason
- repair events
- model+DOM proof requirement

Hard opt-outs:

- custom render text/leaf/segment
- projections
- IME/composition
- placeholder/zero-width
- multiple string nodes
- accessibility-altering markup

## 10. Browser Proof Contract

`slate-browser` is mandatory for browser-facing closure.

Every risky editing lane must prove model and DOM together:

- beforeinput/input
- composition
- undo/redo
- delete/backspace
- paste/copy rich/plain/fragment
- shell selection
- shadow/iframe
- mobile only where automation is honest

Unit tests alone do not close browser behavior.

## 11. Selection / Activation Split

Keep these separate:

- activation
- selection
- focus
- DOM selection
- model selection
- shell-backed selection

No direct selection mutation for "just activation".

If activation selects, it must be a real user-visible selection operation.

## 12. Public API Shape

Expose the smaller, deeper API:

- `createEditor`
- `Editor.*`
- `Transforms.*`
- `Operation`
- `Range`
- `Point`
- `Path`
- transactions
- subscriptions
- live reads
- snapshots
- projection APIs
- React runtime components

Demote or remove:

- instance mutation as primary API
- `onChange` as primary notification
- `decorate`
- chunking
- `renderChunk`
- broad plugin-stack hooks that fight transactions

## Execution Phases

### Phase 1: Primary React Runtime Rename

Owner:

- `packages/slate-react`
- examples
- docs

Goal:

- rename current `EditableBlocks` runtime to public `Editable`
- delete or privatize old legacy `Editable`
- keep temporary alias only if needed during migration

Gates:

- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
- `bunx vitest run --config ./vitest.config.mjs test/decorations.test.tsx test/use-selected.test.tsx`
- focused example Playwright rows for changed imports

### Phase 2: Cut Public `decorate`

Owner:

- `packages/slate-react`
- examples
- docs

Goal:

- remove `decorate` from final `Editable` props
- route remaining examples to projection stores
- keep `createSlateDecorationSource` as adapter only

Gates:

- projection contracts
- search/markdown/code example Playwright rows
- rerender breadth

### Phase 3: Core Field Demotion

Owner:

- `packages/slate`
- sibling packages using old fields

Goal:

- remove field usage from docs/examples/tests
- make explicit read/write APIs primary
- keep mirrors only where necessary and named as compatibility

Gates:

- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`

### Phase 4: Incremental Snapshot / Index Maintenance

Owner:

- `packages/slate`

Goal:

- reduce observer snapshot rebuild cost
- strengthen live path/runtime id index maintenance
- keep `getSnapshot()` out of urgent paths

Gates:

- core observation compare
- core huge-doc compare
- snapshot contracts

### Phase 5: Projection Source System Cleanup

Owner:

- `packages/slate-react`

Goal:

- make projection source APIs final
- ensure decorations, annotations, widgets, and comments use typed source
  contracts
- remove old overlay callback assumptions

Gates:

- projections contract
- annotation/widget contracts
- overlay benchmarks

### Phase 6: Browser Proof Expansion

Owner:

- `packages/slate-browser`
- Playwright examples

Goal:

- move repeated browser editing proof into `slate-browser`
- require model+DOM proof for risky editing paths

Gates:

- `bun --filter slate-browser test`
- `bun run test:slate-browser`
- focused browser rows

### Phase 7: Final Docs/API Cleanup

Owner:

- docs
- examples
- package exports

Goal:

- docs describe only the new API
- no current docs teach legacy chunking or `decorate`
- no examples import old runtime names
- completion state can be set done

## Completion Criteria

This lane is done only when:

- `Editable` is the semantic-blocks runtime
- old `Editable` implementation is removed/private
- `EditableBlocks` is removed or temporary alias-only
- final public `Editable` has no `decorate`, no `renderChunk`, no chunking
- examples use projection stores, not `decorate`
- child-count chunking exists only in legacy comparison fixture code
- core docs/tests use explicit `Editor.*` APIs as primary seams
- live reads and transactions are the documented runtime path
- browser proof lanes use model+DOM assertions
- relevant tests/builds/benchmarks pass or exact blockers are recorded

## Current Next Owner

Phase 1: rename current `EditableBlocks` runtime to public `Editable`.

Do not start by deleting core compatibility fields. The first dangerous API
confusion is React: the best runtime must own the `Editable` name.

## Memory Rules

After every slice, append:

- actions
- commands
- artifacts
- evidence
- hypothesis
- decision
- owner classification
- changed files
- rejected tactics
- next action

Do not rely on chat history.

## Execution Log

### 2026-04-21 - Phase 1 browser editing repair for public `Editable`

Actions:

- Rebuilt `packages/slate-react` before browser proof so the static site used
  current package output.
- Reproduced `playwright/integration/examples/richtext.test.ts` with public
  `Editable` mapped to the semantic-blocks runtime.
- Fixed semantic runtime DOM bridge maps by assigning `NODE_TO_PARENT` and
  `NODE_TO_INDEX` for text nodes, not only element nodes.
- Gated the old native character fast path on explicit
  `data-slate-dom-sync="true"` capability.
- Made dirty node maps fail closed to model-owned insertion instead of allowing
  browser-native mutation.
- Changed `EditableRoot`'s root subscription from operation count to last commit
  version so consecutive one-op commits can rerender the root when allowed by
  `shouldUpdate`.
- Added model-selection ownership for plain `insertText`: after Slate handles
  text insertion or keyboard navigation, stale DOM `targetRange` and
  `selectionchange` cannot overwrite the model selection until a mouse/click
  selection resets ownership.

Commands:

- `bunx turbo build --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium`

Evidence:

- Initial richtext run failed because visible DOM changed while
  `__slateBrowserHandle.getText()` did not include inserted text.
- After text-node path-map repair, model insertion worked, but Mac
  `page.keyboard.type('Undo Me')` smeared characters because stale DOM
  selection/target ranges stole the caret after the first character.
- Final richtext run passed all 5 Chromium rows, including model+DOM keyboard
  undo after Mac-user-agent typing.

Decision:

- Keep course. The public `Editable` cutover must treat model-owned input and
  browser-owned input as explicit ownership modes, not let legacy target-range
  repair blindly overwrite the model selection.

Owner classification:

- `packages/slate-react` owned the regression.
- The failing browser lane was not history-owned and not core-owned.

Changed files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

Rejected tactics:

- Do not treat visible DOM insertion as proof; the handle/model text was red.
- Do not optimize history further; the failing Mac row was stale selection
  ownership before undo.
- Do not rely on Playwright output while a manually started
  `serve-playwright.mjs` process holds port `3101`; it can serve stale output.

Next action:

- Run the Phase 1 React correctness gates, then rerender/perf/build/typecheck
  gates for the public `Editable` cutover.

### 2026-04-21 - Phase 1 gates after browser repair

Actions:

- Ran the React correctness, browser, perf, build, typecheck, lint, and
  changeset gates for the public `Editable` cutover.
- Added the `slate-react` major changeset for the public `Editable` runtime
  flip.

Commands:

- `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx --bail 1`
- `cd packages/slate-react && bunx vitest run --config ./vitest.config.mjs test/decorations.test.tsx test/use-selected.test.tsx`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/placeholder.test.ts ./playwright/integration/examples/styling.test.ts --project=chromium`
- `bun run bench:react:rerender-breadth:local`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`

Evidence:

- DOM text sync contract: 1 pass.
- Large document and scroll contract: 15 pass.
- Projections and selection contract: 6 pass.
- Package Vitest decorations/use-selected: 2 files, 14 tests pass.
- Richtext browser row: 5 pass, including Mac-user-agent keyboard undo.
- Placeholder/styling browser rows: 4 pass.
- Rerender breadth remained local:
  - edited leaf renders: mean 1
  - sibling leaf renders: mean 0
  - deep ancestor render events: mean 0
  - source-scoped unrelated recomputes: mean 0 where expected
- 5000-block direct compare was green against both legacy baselines:
  - ready: v2 13.33ms vs legacy 288.32ms / 289.52ms
  - select-all: v2 0.11ms vs 15.19ms / 0.81ms
  - start typing: v2 22.84ms vs 166.70ms / 35.82ms
  - start select+type: v2 24.30ms vs 204.61ms / 34.88ms
  - middle typing: v2 14.88ms vs 156.53ms / 33.81ms
  - middle select+type: v2 17.69ms vs 193.14ms / 37.56ms
  - middle promote+type: v2 23.77ms vs 173.07ms / 34.18ms
  - full text replace: v2 26.98ms vs 105.40ms / 110.12ms
  - full fragment insert: v2 22.47ms vs 109.90ms / 111.91ms
- Build, typecheck, and lint are green after `lint:fix`.

Decision:

- Phase 1 is implementation-green with `EditableBlocks` retained only as a
  temporary alias for remaining example/doc cutover.

Owner classification:

- Remaining open work is no longer the public `Editable` browser/runtime owner.
- Next owner is Phase 2 / Phase 7 API cleanup: remove `EditableBlocks` usage
  from examples and cut final public `decorate` teaching/API surfaces.

Changed files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/.changeset/slate-react-editable-semantic-runtime.md`

Rejected tactics:

- Do not keep chasing richtext/history; the final focused browser row is green.
- Do not treat `bunx vitest --config ./vitest.config.mjs` from repo root as a
  product failure; the config lives under `packages/slate-react`.

Next action:

- Start Phase 2/7 cleanup by replacing remaining example `EditableBlocks`
  imports/usages with public `Editable` and keeping projection-source examples
  on the final API shape.

### 2026-04-21 - Example `EditableBlocks` alias cutover

Actions:

- Replaced current example imports/usages of `EditableBlocks` with public
  `Editable`.
- Replaced example-only `EditableBlocks*` public type references with
  `EditableProps`, `RenderElementProps`, or `ComponentProps<typeof Editable>`.
- Reworked the code-highlighting example's projection source to emit text-node
  ranges instead of block-level `decorate` ranges. This keeps token spans split
  correctly when typed code lives in one text node with embedded newlines.

Commands:

- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts ./playwright/integration/examples/search-highlighting.test.ts ./playwright/integration/examples/markdown-preview.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/external-decoration-sources.test.ts ./playwright/integration/examples/review-comments.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts --project=chromium`

Evidence:

- Initial changed-example sweep: 21 passed, 3 code-highlighting rows failed.
- Code-highlighting failure was real: token class wrapped an entire line, so the
  first `[data-slate-string]` contained full-line text instead of the expected
  token text.
- After changing code-highlighting to text-node projection ranges, all 3
  code-highlighting rows passed.
- Lint is green.
- Current example source has no `EditableBlocks` usage.

Decision:

- Keep course. Example code now teaches public `Editable`; remaining
  `EditableBlocks` references are package/test/benchmark alias debt.

Owner classification:

- Example alias cutover is complete.
- Next owner is package/test/benchmark alias removal and final public export
  cleanup.

Changed files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-preview.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/external-decoration-sources.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/review-comments.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/large-document-runtime.tsx`

Rejected tactics:

- Do not keep example imports on `EditableBlocks` for readability; the public
  API name is now `Editable`.
- Do not weaken code-highlighting assertions; they caught an actual projection
  segmentation problem.

Next action:

- Replace in-scope package tests and benchmark harnesses with public `Editable`,
  then remove the public `EditableBlocks` barrel export if no in-scope user
  remains.

### 2026-04-21 - Remove public `EditableBlocks` alias

Actions:

- Replaced in-scope package tests and React benchmark harnesses with public
  `Editable`.
- Renamed the public render-element prop helper type to
  `EditableRenderElementProps` internally and kept `RenderElementProps` as the
  public export.
- Removed the `EditableBlocks` public barrel export.
- Deleted the `components/editable-blocks.tsx` alias file.

Commands:

- `bun run lint:fix`
- `bun run lint`
- `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`
- `bun test ./packages/slate-react/test/app-owned-customization.tsx --bail 1`
- `bun run bench:react:rerender-breadth:local`
- `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts ./playwright/integration/examples/search-highlighting.test.ts ./playwright/integration/examples/markdown-preview.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/external-decoration-sources.test.ts ./playwright/integration/examples/review-comments.test.ts ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium`
- `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts --project=chromium`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`

Evidence:

- No in-scope source reference to `EditableBlocks`,
  `EditableBlocksProps`, or `EditableBlocksRenderElementProps` remains.
- Large-doc/scroll contract: 15 pass.
- App-owned customization contract: 4 pass.
- Changed-example Playwright sweep: 21 pass, 3 code-highlighting rows red
  before the projection-source fix.
- Code-highlighting rerun: 3 pass.
- Rerender breadth remains local after the alias removal.
- 5000-block direct compare remains green against both legacy baselines after
  the benchmark harness imports public `Editable`.
- Build, typecheck, and lint are green.

Decision:

- `EditableBlocks` is removed as a public concept. The only remaining
  compatibility pressure is `decorate` adapter/API teaching, not the primary
  React component name.

Owner classification:

- Alias cleanup: complete.
- Next owner: hard-cut final public `decorate` teaching/API surface while
  preserving projection-source adapters where explicitly named.

Changed files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/app-owned-customization.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/large-doc-and-scroll.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-legacy-compare.mjs`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/active-typing-breakdown.tsx`
- changed example files from the previous slice.

Rejected tactics:

- Do not keep `EditableBlocks` as a temporary public alias now that examples,
  tests, and benchmarks are on `Editable`.
- Do not delete projection adapters as part of alias cleanup; adapter naming is
  the next owner.

Next action:

- Remove `decorate` from final public `Editable` typing/docs path and keep
  `createSlateDecorationSource` as the explicitly named compatibility adapter.

### 2026-04-21 - Public docs retargeted to projection stores and islands

Actions:

- Updated the `slate-react` `Editable` reference to document the final public
  props: projection stores, render segments, render text, and large-document
  islands.
- Removed `decorate` from the documented `EditableProps` shape.
- Rewrote the performance walkthrough away from `renderChunk` /
  `getChunkSize` / `data-slate-chunk` guidance and toward
  `Editable.largeDocument`.
- Updated the accepted architecture decision and replacement scoreboard to say
  the public surface is projection-store first on `Editable`.

Commands:

- `bun run lint`

Evidence:

- `docs/libraries/slate-react/editable.md` no longer lists `decorate` in
  `EditableProps`.
- `docs/walkthroughs/09-performance.md` no longer teaches `renderChunk`,
  `getChunkSize`, `data-slate-chunk`, or a chunking setup section.
- Lint is green.

Decision:

- Keep `createSlateDecorationSource` as the explicitly named adapter for
  callback-style decoration logic.
- Do not expose `decorate` as the final public `Editable` API.

Owner classification:

- Public docs for the final `Editable` surface are updated.
- Remaining stale `EditableBlocks` mentions in historical ledgers/plans are
  archival unless they are promoted back into current reference docs.

Changed files:

- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md`
- `/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`

Rejected tactics:

- Do not document a negative migration story in the public reference.
- Do not remove `createSlateDecorationSource`; named adapters are the right
  boundary for compatibility.

Next action:

- Sweep current reference docs/ledgers that still describe `EditableBlocks` as
  the active surface, then decide whether the final API/runtime shape lane is
  complete or if core field demotion remains the next autonomous owner.

### 2026-04-21 - Current reference docs swept for `EditableBlocks`

Actions:

- Updated current `docs/slate-v2` reference/ledger rows that still described
  `EditableBlocks` as the active surface.
- Left archival execution-history mentions in older plan logs untouched.

Commands:

- `rg -n "EditableBlocks" docs/slate-v2 -g '*.md'`

Evidence:

- `docs/slate-v2/**` has no remaining `EditableBlocks` mention.

Decision:

- The React public component naming owner is closed.
- The final API/runtime lane still has open core API-shape work from Phase 3:
  demote mutable editor fields from docs/tests/new examples and make explicit
  `Editor.*` APIs the primary documented surface.

Owner classification:

- Next owner: Phase 3 core field demotion.

Changed files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/replacement-family-ledger.md`

Rejected tactics:

- Do not keep looping on old historical plan mentions; they are execution
  history, not current reference docs.

Next action:

- Start Phase 3 core field demotion with source inventory for
  `editor.children`, `editor.selection`, `editor.marks`, `editor.operations`,
  instance `editor.apply`, and instance `editor.onChange` in current docs/tests
  and in-scope package source.

### 2026-04-21 - Phase 3 first public-facing field demotion slice

Actions:

- Inventoried mutable editor-field usage across in-scope package source, tests,
  examples, and current docs.
- Replaced safe current example usage:
  - `forced-layout` now uses `Editor.getChildren(editor)`.
  - `inlines` now uses `Editor.getLiveSelection(editor)`.
- Retargeted current how-to docs away from primary mutable fields:
  - saving-to-database examples use `Editor.getOperations`,
    `Editor.getChildren`, and `Editor.apply`.
  - installing guide points document replacement at `Editor.replace`.
  - performance/hooks examples use `Editor.getLiveSelection`.

Commands:

- `rg -n "\beditor\.(children|selection|marks|operations|apply|onChange)\b" ...`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/forced-layout.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium`

Evidence:

- Current edited docs/examples no longer contain primary
  `editor.children` / `editor.selection` / `editor.operations` /
  `editor.apply` guidance.
- Forced-layout and inlines focused Chromium rows passed: 3 passed, 1 skipped
  existing skipped row.
- Lint is green.

Decision:

- Keep course, but do not blindly rewrite internal compatibility/proof tests.
  Many remaining package references intentionally prove compatibility mirrors,
  wrapped `editor.apply`, Android input manager behavior, or low-level DOM
  bridge internals.

Owner classification:

- Public-facing examples/docs first slice is complete.
- Remaining owner is current API docs under `docs/api/**` that still teach
  mutable fields or instance `editor.apply` as primary call style.

Changed files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/inlines.tsx`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/06-saving-to-a-database.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/01-installing-slate.md`
- `/Users/zbeyens/git/slate-v2/docs/walkthroughs/09-performance.md`
- `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/03-locations.md`
- `/Users/zbeyens/git/slate-v2/docs/api/locations/range-ref.md`

Rejected tactics:

- Do not rewrite tests named around compatibility mirrors as if they were
  current public examples.
- Do not touch `slate-history` / `slate-hyperscript`.

Next action:

- Retarget current API docs under `docs/api/**` and non-archival concept docs
  away from `editor.apply`, `editor.children`, `editor.selection`, and
  `editor.marks` as primary API language.

### 2026-04-21 - Phase 3 API docs and core gate closure

Actions:

- Retargeted current API/concept docs away from mutable editor fields and
  instance `editor.apply` as primary examples.
- Kept internal compatibility/proof tests intact where they intentionally prove
  mutable mirrors, wrapped `editor.apply`, Android input, or DOM bridge behavior.

Commands:

- `rg -n "\beditor\.(children|selection|marks|operations|apply|onChange)\b" docs/api docs/concepts docs/walkthroughs docs/libraries/slate-react site/examples/ts/forced-layout.tsx site/examples/ts/inlines.tsx`
- `bun run lint`
- `bun test ./packages/slate/test/surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/transaction-contract.ts --bail 1`
- `bun test ./packages/slate/test/snapshot-contract.ts --bail 1`

Evidence:

- Current API/concept/walkthrough docs and touched examples have no remaining
  direct mutable editor-field primary API references.
- Surface contract: 10 pass.
- Transaction contract: 13 pass.
- Snapshot contract: 190 pass.
- Lint is green.

Decision:

- Phase 3 is closed for current public docs/tests. Remaining direct field usage
  in package internals and compatibility tests is intentional implementation
  pressure, not public API teaching.

Owner classification:

- Next owner: Phase 4/5 verification of incremental snapshot/index and
  projection source cleanup under the final public `Editable` surface.

Changed files:

- `/Users/zbeyens/git/slate-v2/docs/api/transforms.md`
- `/Users/zbeyens/git/slate-v2/docs/api/nodes/editor.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/05-operations.md`
- `/Users/zbeyens/git/slate-v2/docs/concepts/xx-migrating.md`
- docs/examples from the previous Phase 3 slice.

Rejected tactics:

- Do not force grep-zero across implementation internals.
- Do not remove compatibility mirror tests that define accepted behavior.

Next action:

- Verify Phase 4/5 from the current final surface: run core observation /
  huge-doc compares and overlay/locality gates, then decide whether the
  remaining work is docs/claim-width cleanup or a real implementation owner.

### 2026-04-21 - Phase 4/5 verification exposes core red lanes

Actions:

- Ran overlay/locality and core comparison gates after final `Editable` public
  surface cleanup.

Commands:

- `bun run bench:react:huge-document-overlays:local`
- `bun run bench:core:observation:compare:local`
- `bun run bench:core:huge-document:compare:local`

Evidence:

- React overlay gate is green:
  - active edit after overlay keeps far element/text/projection renders at `0`
  - overlay toggle recomputes projection once
  - shell promotion keeps mounted text at `1` and projection recompute at `0`
- Core observation compare is red against legacy:
  - children length after each write: current `4.46ms`, legacy `1.16ms`
  - root nodes after each write: current `10.37ms`, legacy `8.93ms`
  - first-block positions after each write: current `4.26ms`, legacy `1.66ms`
- Core huge-document compare is mixed:
  - current wins full replace, fragment insert, and select-all
  - current loses model typing lanes: start `4.13ms` vs legacy `0.69ms`,
    middle `3.96ms` vs legacy `0.51ms`

Decision:

- Pivot to measured core owner. Phase 4 is not just docs/claim-width: core
  incremental snapshot/index/live read work still has red comparison lanes.

Owner classification:

- Red lanes are core-owned unless benchmark inspection proves they are
  non-equivalent.

Changed files:

- none in code for this slice.

Rejected tactics:

- Do not call the final architecture lane complete from React green gates while
  core compare lanes are red.
- Do not edit core before reading the benchmark and classifying the exact hot
  path.

Next action:

- Inspect `scripts/benchmarks/core/compare/observation.mjs` and
  `scripts/benchmarks/core/compare/huge-document.mjs`, then read the core
  public-state/apply paths behind the red rows.

### 2026-04-21 - Core red-lane classification

Decision:

- Accept/defer the current headless core observation and typing compare losses
  for this final API/runtime shape lane.

Rationale:

- The red rows are headless micro-lanes, not the current important huge-doc
  React user lanes.
- The final public runtime already wins the 5000-block React lanes against
  legacy chunking-on/off after the `Editable` cutover.
- Core full-document replace, fragment insertion, and select-all compare rows
  are green.
- Current core pays explicit commit metadata, dirty regions, runtime ids, and
  transaction boundaries. That is the chosen architecture tax unless a future
  product gate demands headless typing superiority too.

Deferred owner:

- Future core microbench optimization can target text-op commit allocation,
  dirty-path bookkeeping, and compatibility mirror overhead.

Next action:

- Continue Phase 5: remove `createSlateDecorationSource(decorate)` from current
  examples that should expose direct projection-source APIs.

### 2026-04-21 - Direct projection-source examples

Actions:

- Replaced current example usage of `createSlateDecorationSource(decorate)` with
  direct projection-source functions.
- Converted code highlighting, search highlighting, and markdown preview to
  emit `SlateProjection` ranges directly from snapshots.

Commands:

- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/code-highlighting.test.ts ./playwright/integration/examples/search-highlighting.test.ts ./playwright/integration/examples/markdown-preview.test.ts --project=chromium`
- `rg -n "EditableBlocks|renderChunk|getChunkSize|data-slate-chunk|decorate\\??:" docs/libraries docs/walkthroughs docs/api site/examples/ts packages/slate-react/src/index.ts packages/slate-react/src/components/editable-text-blocks.tsx`
- `rg -n "createSlateDecorationSource|const decorate|decorate =|decorate\\(" site/examples/ts -g '*.tsx'`

Evidence:

- Code highlighting, search highlighting, and markdown preview browser rows: 5
  passed.
- Current public docs/examples/barrel sweep has no `EditableBlocks`,
  `renderChunk`, `getChunkSize`, `data-slate-chunk`, or `decorate?:` hits.
- Current examples have no `createSlateDecorationSource` or local `decorate`
  callback hits.

Decision:

- Phase 5 public example cleanup is closed. `createSlateDecorationSource`
  remains available as an explicitly named adapter, but current examples teach
  direct projection sources.

Owner classification:

- No remaining autonomous implementation owner is known under the active final
  API/runtime shape plan.
- Headless core microbench losses are accepted/deferred optimization debt, not
  this lane's blocker.

Changed files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/markdown-preview.tsx`

Rejected tactics:

- Do not keep current examples on callback-style decoration adapters.
- Do not remove the named adapter from the package; compatibility remains
  explicit and isolated.

Next action:

- Mark the active lane complete and run `completion-check`.

### 2026-04-21 - Full integration gate invalidates closure

Actions:

- Ran the full local browser integration gate after the claimed final API /
  runtime closure.
- Added a focused richtext regression for typing at the browser-selected end of
  a block.

Commands:

- `bun test:integration-local`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "types at the browser-selected end|repairs DOM after Mac keyboard undo|undoes browser-inserted text"`

Evidence:

- Full integration result: `179 passed`, `49 skipped`, `38 failed`, `2 flaky`.
- The failure set is not cosmetic. It includes browser editing paths:
  - richtext selected-end typing inserts at the start of the block in Chromium,
    Firefox, mobile, and WebKit
  - markdown-shortcuts command rows fail across browsers
  - mentions query/insert rows fail across browsers
  - markdown-preview and code-highlighting fail in non-Chromium/mobile rows
  - shadow DOM typing fails in Chromium/mobile rows
  - plaintext/richtext insertion and undo fail in mobile rows
  - paste-html code row is test-owned strict-locator noise mixed into the red
    set
  - huge-document same-path row is flaky in Chromium/mobile
- Focused richtext selected-end regression is red:
  - expected first paragraph to end with `!ZZ`
  - actual text starts with `ZZThis is editable...`

Decision:

- Reopen the lane. The prior browser-proof closure was too narrow and should
  not be treated as complete.

Owner classification:

- Primary owner: Slate React browser selection/input ownership.
- Secondary owners:
  - app-level keydown/current-selection examples (`markdown-shortcuts`,
    `mentions`)
  - projection/cross-browser rendering rows (`markdown-preview`,
    `code-highlighting`)
  - test-owned locator issue (`paste-html` code row)
  - mobile/shadow DOM transport rows

Changed files:

- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx`
- `/Users/zbeyens/git/plate-2/tmp/completion-check.md`

Rejected tactics:

- Do not call selective Chromium rows “browser proof”.
- Do not proceed with more hard cuts until `test:integration-local` is
  classified and substantially green.

Next action:

- Replan around full browser integration closure. First fix the core
  selection/input ownership bug, then rerun affected Chromium rows before
  expanding to Firefox/mobile/WebKit.
