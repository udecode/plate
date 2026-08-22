# Editor Test Harvest: ProseKit

status: done
score: 0.96
license_mode: permissive
license_evidence: `../prosekit/LICENSE`; MIT package metadata in `../prosekit/packages/core/package.json`, `../prosekit/packages/extensions/package.json`, and `../prosekit/packages/web/package.json`
output_mode: durable
versioned_copy_policy: normal

Verdict: keep ProseKit as a Plate API and headless-UI donor, not as an
independent raw-editor oracle. Its one immediate test candidate is the
blurred-selection lifecycle around nested editables. Most remaining value is
already covered by Plite/Plate or belongs to Plate packages. ProseKit's test
harness runs Chromium only; `hasTouch: true` is not WebKit, iOS, or raw-device
proof.

This is the first harvest for the captured checkout. No prior report,
inventory, or test index existed to update.

## Inventory

- target: `../prosekit`
- source revision: `3fbfe7906c3448328e80c1c1333647d08e50907e`
- run date: 2026-08-21
- inventory command:
  `rg --files | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec|bench)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' | sort`
- test files found: 179
- runnable: 155
- classified: 179
- portable: 0
- portable-mixed: 23
- plate-owned: 110
- skipped: 15
- harness: 27
- product-shell: 4
- uncertain: 0
- test-name extraction: 154 of 155 runnable files; the sole unindexed runnable
  file, `registry/test/rtl.test.ts`, was read and is a shared story-consistency
  shell with no direct behavior assertion.
- raw `describe` / `it` / `test` matches: 661
- full inventory: [inventory.md](./inventory.md)
- portable and portable-mixed test-name index:
  [test-index.md](./test-index.md)

The inventory count equals the classified count. No uncertain file remains.
Every portable-mixed file has test-name extraction and was read by test family.

## License Gate

| Field                 | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| License mode          | `permissive`                                           |
| Evidence files        | `../prosekit/LICENSE`; package `license: MIT` metadata |
| Output directory      | `docs/editor-test-harvester/prosekit`                  |
| Output mode           | `durable`                                              |
| Versioned copy policy | `normal`                                               |

## Proof Boundary

- This harvest audits checked-in source and tests at the captured revision. It
  does not claim the upstream suite passed in this turn.
- ProseKit's shared Vitest browser config installs and runs Chromium only.
  `hasTouch: true` adds synthetic touch capability to that Chromium context.
- Safari/WebKit compatibility comments in autocomplete, resizable, block-handle,
  and inline-popover source are leads, not tested WebKit claims.
- Current Plite/Plate coverage below means matching source or tests exist in the
  current checkout. Those tests were not rerun as part of this report-only
  harvest.
- No browser, iPhone, iPad, Appium, or other raw-device proof was run.

## Confidence Score

| Dimension                                  | Weight |    Score | Evidence                                                                                                                                        | Cap hit |
| ------------------------------------------ | -----: | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Inventory completeness                     |   0.20 |     0.99 | Exact command, revision, 179 paths, 179 classifications, 0 uncertain, full linked appendix.                                                     | none    |
| Behavior extraction depth                  |   0.20 |     0.95 | All 23 portable-mixed files were indexed and pressure-read; grouped invariants retain file and test refs.                                       | none    |
| Skip precision and negative controls       |   0.15 |     0.96 | All 15 skips, 27 harness rows, and 4 product shells have reasons; generic type, generic utility, harness, and product-shell controls were read. | none    |
| Plite/Plate coverage mapping accuracy      |   0.20 |     0.95 | Raw and Plate-owner searches map each kept family to current source/tests or an explicit policy gap.                                            | none    |
| Actionability of copy/refactor/create plan |   0.15 |     0.94 | Every non-covered row names a target owner, proof kind, and focused command or defer reason.                                                    | none    |
| Provenance and reproducibility             |   0.10 |     0.99 | Local commit, license, inventory command, index command, harness config, and proof limits are recorded.                                         | none    |
| Weighted total                             |   1.00 | **0.96** | Completion threshold met; every dimension is at least 0.85.                                                                                     | none    |

## Pass-State Ledger

| Pass                         | Status   | Evidence added                                                                                      | Report delta                                        | Open issues | Next owner            |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------- | --------------------- |
| Intake and boundary          | complete | Local checkout, MIT license, commit, report-only and browser/device limits.                         | Durable output selected.                            | none        | editor-test-harvester |
| Inventory                    | complete | 179 paths; runnable and classification counts.                                                      | Full appendix written.                              | none        | editor-test-harvester |
| Test-name extraction         | complete | 661 matches across 154 runnable files; RTL shell read directly.                                     | Stable index written.                               | none        | editor-test-harvester |
| Classification pressure      | complete | Generic type/utility, harness, registry shell, and feature controls read.                           | RTL corrected from portable-mixed to product-shell. | none        | editor-test-harvester |
| Behavior extraction          | complete | 23 portable-mixed files and grouped Plate-owned families reduced to observable invariants.          | Matrix written.                                     | none        | editor-test-harvester |
| Plite/Plate coverage mapping | complete | Current raw, browser, package, registry, Yjs, table, DnD, read-only, and selection owners searched. | Coverage and explicit gaps recorded.                | none        | editor-test-harvester |
| Action planning              | complete | One refactor candidate; all other rows covered, Plate-owned, rejected, or deferred.                 | Targets and proof commands added.                   | none        | Plate selection owner |
| Ecosystem synthesis          | complete | Steal/reject/diverge decisions and browser strategy recorded.                                       | Donor role made explicit.                           | none        | plite-research        |
| Closure review               | complete | Score, counts, placement, indexes, and proof boundary reviewed.                                     | Status set to done.                                 | none        | user review           |

## Coverage Search Log

Raw Plite and browser-owner searches:

```bash
rg -n "compositionend|isComposing|insertReplacementText|WebKit|Safari|composition" \
  packages/plite packages/plite-dom packages/plite-react apps/plite
rg -n "read.?only|blur|focus|unmount|destroy|pointerType|nested editable" \
  packages/plite-react apps/plite/tests/plite-browser/donor/examples
rg -n "dragstart|dragend|dataTransfer|drop|clipboard|copy|paste" \
  packages/plite-dom packages/plite-react apps/plite/tests/plite-browser/donor/examples
```

Plate-owner searches:

```bash
rg -n "CursorOverlayPlugin|virtual selection|selection.*blur" \
  packages/selection packages/core apps/www
rg -n "cross.?editor|drop target|clipboard|fresh node key" packages/dnd packages/selection
rg -n "table|column|row|selection|move|reorder" packages/table
rg -n "yjs|synchroniz|remote" packages/yjs apps/plite/tests/plite-browser/donor/examples
rg --files packages | rg "/(markdown|media|list|table|link|yjs|selection|combobox|slash-command)/"
```

Key current owners include
`packages/plite/test/extension-configuration.test.ts`,
`packages/plite-react/test/editable-dom-runtime-contract.test.tsx`,
`apps/plite/tests/plite-browser/donor/examples/read-only.test.ts`,
`apps/plite/tests/plite-browser/donor/examples/images.test.ts`,
`packages/selection/src/react/CursorOverlayPlugin.spec.tsx`,
`packages/dnd/src/useDndNode.spec.ts`,
`packages/table/src`, and `packages/yjs/test`.

## Matrix

| Source ref                                                                                                       | Test ref                                                                | Tag                    | Behavior invariant                                                                                                                                                                       | Proof kind             | Owner coverage                                                                                                                                                    | Action                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/core/src/commands/expand-mark.spec.ts`                                                                 | L10, L17, L24                                                           | marks-inline           | A mark-range query includes one equal-attribute run and stops at an attribute change.                                                                                                    | model unit             | Plate mark APIs and current inline/mark behavior; integer ProseMirror positions are donor machinery.                                                              | **plate-owned** — owner `packages/core`; use only as API pressure. If adopted, target a current mark-read test and run `pnpm --filter @platejs/core test`.                                                                                                                                                                                                                     |
| `packages/core/src/commands/{insert-default-block,select-block,toggle-wrap,unset-block-type,unset-mark}.spec.ts` | Indexed command cases                                                   | structured-blocks      | Selection-scoped commands preserve the selected content while changing its containing block or marks.                                                                                    | model unit             | Current Plite transaction/command laws plus Plate feature packages own the operation shape.                                                                       | **covered / plate-owned** — no ProseMirror command port. Owners `packages/plite`, `packages/core`, and the matching feature package; verify with package tests plus `pnpm check:plite:dev` after a future change.                                                                                                                                                              |
| `packages/core/src/extensions/events/{dom-event,focus}.spec.ts`; `keymap.spec.ts`                                | Dynamic registration, focus/blur, priority cases                        | focus-blur             | Runtime handler changes are atomic; focus events and key handlers call the active owner once in deterministic order.                                                                     | browser-backed unit    | Plite extension reconfiguration and runtime root lifecycle have direct contracts.                                                                                 | **covered** — `packages/plite/test/extension-configuration.test.ts`, `packages/plite-react/test/runtime-root-lifecycle-contract.test.ts`; focused proof `pnpm --filter @platejs/plite test -- extension-configuration.test.ts && pnpm --filter @platejs/plite-react test -- runtime-root-lifecycle-contract.test.ts`.                                                          |
| `packages/core/src/extensions/keymap-base.spec.ts`                                                               | L12-L69                                                                 | accessibility-keyboard | Repeated select-all may escalate from the current block to the document only when the product explicitly chooses that policy.                                                            | Chromium browser       | Plite proves native select-all and document selection; no accepted law requires ProseKit's staged Mod-A policy.                                                   | **defer/reject** — do not override native select-all in raw Plite. If Plate wants staged block selection, owner is `packages/selection`; proof must be a browser row, not a model unit.                                                                                                                                                                                        |
| `packages/extensions/src/virtual-selection/index.spec.ts`                                                        | L89-L139                                                                | decorations-overlays   | A visible blurred selection tracks model/doc changes and disappears before primary-pointer focus enters a nested editable; secondary pointers and non-editable controls do not clear it. | browser-backed unit    | `CursorOverlayPlugin` already stores blurred selection and refreshes on selection changes, but current tests do not cover nested-editable pointer/focus ordering. | **refactor-existing** — owner `packages/selection`; extend `packages/selection/src/react/CursorOverlayPlugin.spec.tsx` and add browser proof on `/blocks/cursor-overlay-demo`. Unit command: `pnpm --filter @platejs/selection test -- CursorOverlayPlugin.spec.tsx`; browser closeout through Browser on the demo route.                                                      |
| `registry/test/block-handle.test.ts`                                                                             | L143                                                                    | clipboard-paste        | A block drag exposes an editor-native rich fragment and a plain-text fallback, then clears drag state.                                                                                   | Chromium browser       | Plate block selection copy plus Plite model-backed drag serialization and DnD cleanup already cover the invariant with Plate formats.                             | **covered** — owners `packages/selection`, `packages/plite-react`, `packages/dnd`; use `pnpm --filter @platejs/selection test && pnpm --filter @platejs/dnd test`. Never copy the ProseMirror MIME envelope.                                                                                                                                                                   |
| `registry/test/change-tracking.test.ts`                                                                          | L9                                                                      | history-undo-redo      | A saved revision can be restored without conflating product revision history with editor undo.                                                                                           | Chromium browser       | This is product/plugin policy, not raw editor law. Plate suggestion/history packages own it.                                                                      | **plate-owned** — owners `packages/suggestion` and application versioning; verify with `pnpm --filter @platejs/suggestion test` if adopted.                                                                                                                                                                                                                                    |
| `registry/test/{drop-cursor,gap-cursor,image-view}.test.ts`                                                      | Image reorder, gap cursor, image click                                  | void-atom              | Block voids remain selectable and navigable, expose a valid drop target, and reorder without corrupting surrounding text.                                                                | Chromium browser       | Plite images browser rows cover click, adjacent-void navigation, drop cursor, internal move, selection, and deletion.                                             | **covered** — `apps/plite/tests/plite-browser/donor/examples/images.test.ts`; focused proof `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/examples/images.test.ts`.                                                                                                                                                                    |
| `registry/test/hard-break.test.ts`                                                                               | L10                                                                     | structured-blocks      | A hard-break command and its shortcut produce the same visible break policy.                                                                                                             | Chromium browser       | Plite owns soft-break mechanics; Plate feature configuration owns hard-break UI/shortcut policy.                                                                  | **plate-owned** — owner `packages/core` plus the consuming kit; verify with focused package tests and the consuming demo.                                                                                                                                                                                                                                                      |
| `registry/test/readonly.test.ts`                                                                                 | L9                                                                      | focus-blur             | Toggling read-only changes edit authority immediately and typing cannot mutate the document while read-only.                                                                             | Chromium browser       | Direct raw and browser coverage exists, including selection/copy while read-only.                                                                                 | **covered** — `apps/plite/tests/plite-browser/donor/examples/read-only.test.ts` and `packages/plite-react/test/plite-runtime-provider-contract.test.tsx`; command `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/examples/read-only.test.ts`.                                                                                           |
| `registry/test/table.test.ts`                                                                                    | L49-L258                                                                | tables-grid            | Cell selection and row/column commands preserve a valid table grid through insert, delete, clear, and reorder.                                                                           | Chromium browser       | Plate table has dedicated apply, grid, selection, navigation, mutation, paste, and drop tests.                                                                    | **plate-owned/covered** — owner `packages/table`; run `pnpm --filter @platejs/table test`.                                                                                                                                                                                                                                                                                     |
| `registry/test/unmount.test.ts`                                                                                  | L24, L79                                                                | focus-blur             | Destroying one of several mounted editors releases listeners and overlays without harming surviving editors.                                                                             | Chromium browser       | Plite runtime destroy, observer cleanup, failed-view remount, and Plate view-editor unmount contracts cover the lifecycle.                                        | **covered** — `packages/plite-react/test/editable-dom-runtime-contract.test.tsx`, `packages/plite-react/test/dom-integrity-observer-contract.test.ts`, and `packages/core/src/react/editor/usePlateViewEditor.spec.tsx`.                                                                                                                                                       |
| `registry/test/view-adapter.test.ts`; framework node-view specs                                                  | Custom atom and framework adapters                                      | void-atom              | A framework renderer may own presentation while the editor retains node identity, selection, and teardown.                                                                               | framework unit/browser | Plate React and Plite projected/rendered DOM contracts own this. Preact, Solid, Svelte, Vue, and ProseMirror NodeView APIs are not raw Plite requirements.        | **plate-owned/reject framework copies** — owners `packages/core` and `packages/plite-react`; verify current adapters with their package tests.                                                                                                                                                                                                                                 |
| `registry/test/yjs.test.ts`                                                                                      | L8                                                                      | collaboration-remote   | Two editors bound to one collaborative document converge after an edit.                                                                                                                  | Chromium browser       | Plate Yjs has adapter, canonical change, selection, multi-root, and provider contracts; Plite has a browser collaboration example.                                | **covered** — `packages/yjs/test` and `apps/plite/tests/plite-browser/donor/examples/yjs-collaboration.test.ts`; command `pnpm --filter @platejs/yjs test`.                                                                                                                                                                                                                    |
| `packages/core/src/{editor,facets,extensions}/**/*.spec.ts`                                                      | Builder, union, facet, schema, priority cases                           | normalization-schema   | Extension composition exposes stable typed contributions and deterministic ownership.                                                                                                    | model/type unit        | Plite's extension configuration, contribution, facet, schema, and effect contracts are substantially stronger and source-owned.                                   | **covered/reject ProseMirror machinery** — owner `packages/plite`; run `pnpm --filter @platejs/plite test`.                                                                                                                                                                                                                                                                    |
| `packages/extensions/src/**`; feature registry tests                                                             | Marks, links, lists, tables, media, search, page, menus                 | structured-blocks      | Feature-specific commands and UI preserve each feature's document policy.                                                                                                                | unit/Chromium browser  | These are Plate plugin, React UI, registry, docs, or example concerns.                                                                                            | **plate-owned** — route marks to `packages/basic-nodes`, links to `packages/link`, lists to `packages/list`, tables to `packages/table`, media to `packages/media`, autocomplete to `packages/combobox`/`packages/slash-command`, pagination to `packages/layout`, and copied UI to `apps/www/src/registry`. Each owner must use its package tests plus Browser for copied UI. |
| `packages/web/src/**`; framework packages                                                                        | Autocomplete helpers, resize math, anchors, reactive/framework adapters | decorations-overlays   | Headless UI state and geometry remain framework adapters over editor-owned selection and document state.                                                                                 | unit                   | Plate UI and package owners already exist; ProseKit provides API prior art only.                                                                                  | **plate-owned** — owners `packages/combobox`, `packages/resizable`, `packages/floating`, `packages/core`, and `apps/www/src/registry`; no raw Plite row.                                                                                                                                                                                                                       |

## Plate-Owned Family Routing

| Donor family                                                                            | Plate owner                                                                                 |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Core editor builders, actions, facets, schema, paste rules, typed extension composition | `packages/plite` for accepted editor law; `packages/core` for Plate adapters                |
| Marks, blocks, links, lists, tables, media, search, pagination                          | Matching package: `basic-nodes`, `link`, `list`, `table`, `media`, `find-replace`, `layout` |
| Autocomplete, slash/user menus, inline menu, toolbar                                    | `packages/combobox`, `packages/slash-command`, and `apps/www/src/registry`                  |
| React node/view integration                                                             | `packages/core` and `packages/plite-react`                                                  |
| Non-React framework adapters                                                            | Not a current Plate owner; reject until a product requirement exists                        |
| Collaboration                                                                           | `packages/yjs`; Loro remains external/product-specific                                      |
| Save HTML/JSON/Markdown and sample stories                                              | Serialization package owners and registry examples; not raw behavior evidence               |

## Skips

| Source family                     | Count | Reason                                                                                                                | Negative control                                                                                                        |
| --------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Generic TypeScript helpers        |     4 | Type-shape utilities have no observable editing invariant.                                                            | Read `packages/core/src/types/simplify-union.spec.ts`; it only compares compile-time object-union shapes.               |
| Generic runtime utilities         |    11 | Array, class-name, object merge/equality, parsing, regex splitting, and Unicode helpers do not prove editor behavior. | Read `packages/core/src/utils/merge-objects.spec.ts`; it only tests ordinary object merging.                            |
| Test harness and helper contracts |    27 | Fixtures, builders, and consistency helpers prove donor infrastructure rather than editor behavior.                   | Read clipboard/test-editor helpers and `registry/test/rtl.test.ts`; the latter delegates entirely to story consistency. |
| Product shells                    |     4 | Assembled demo smoke tests mix many feature policies and do not isolate a portable invariant.                         | Read `registry/test/full.test.ts`; useful feature rows were routed to Plate owners, not copied as a monolith.           |

## Ecosystem Synthesis

Steal:

- The blurred-selection lifecycle test shape, especially model changes while
  blurred and primary-pointer entry into a nested editable.
- The habit of browser-testing headless UI against actual editor state.
- ProseKit's extension ergonomics only as call-site pressure for Plate APIs.

Reject:

- ProseMirror positions, transactions, plugins, NodeViews, MIME formats, and
  gap-cursor machinery as Plite requirements.
- Staged Mod-A as a raw default without an accepted Plate product requirement.
- Framework-adapter multiplication in raw Plite.

Diverge deliberately:

- Plite keeps editor law in transaction, selection, projection, and browser
  contracts. Plate packages own feature policy and copied UI.
- Plate's browser matrix is Chromium, Firefox, mobile viewport, and WebKit;
  ProseKit's Chromium+`hasTouch` harness cannot replace it.
- Raw mobile claims continue to require direct Appium receipts. ProseKit offers
  no such proof.

## Next Slice

1. Route the virtual-selection row to the Plate selection owner. Add nested
   editable pointer/focus ordering to
   `packages/selection/src/react/CursorOverlayPlugin.spec.tsx`, then prove the
   real overlay on `/blocks/cursor-overlay-demo` with Browser.
2. Do not copy ProseKit command, plugin, NodeView, gap-cursor, or clipboard
   implementations. Their useful behavior is already covered or Plate-owned.
3. Keep ProseKit in `plite-research` and `editor-test-harvester` as a
   headless-extension/UI donor. Do not describe it as WebKit or iOS proof until
   its test matrix actually provides that evidence.

## Local execution

The actionable selection row is complete in the current uncommitted checkout.
`CursorOverlayPlugin` clears its stored selection on a primary press inside a
nested editable. It keeps the selection for non-editable controls and secondary
presses. `CursorOverlayPlugin.spec.tsx` covers both branches and the full
selection package passes 95 tests.

The hidden `/examples/plite/cursor-overlay-ordering` fixture directly mounts the
selection owner without the generated registry loader. Its focused Chromium and
WebKit rows pass, including 5/5 retry-free warm runs in each engine. A fresh
Browser replay changed the observable cursor state from `present` to `cleared`
on a real primary click, moved focus to the nested editable, and produced no
console warnings or errors.

The general `/blocks/cursor-overlay-demo` loader remains unusable because the
committed generated registry index imports the missing `registry/ui/ai-menu.tsx`.
The durable focused fixture and test cover this behavior without editing or
rebuilding generated registry output.

## Full Inventory Appendix

The complete 179-row appendix is [inventory.md](./inventory.md). The 154-file
test-name extraction is [test-index.md](./test-index.md). Both files record the
captured revision and reproducible commands.

## Verification

```bash
cd ../prosekit
rg --files | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec|bench)\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' \
  | sort | wc -l

cd ../plate-2
rg -n "License Gate|Confidence Score|Pass-State Ledger|Matrix|Skips|Next Slice|Full Inventory Appendix" \
  docs/editor-test-harvester/prosekit/report.md
test -f docs/editor-test-harvester/prosekit/inventory.md
test -f docs/editor-test-harvester/prosekit/test-index.md
```
