# Editor Test Harvest: Meowdown

status: done
score: 0.97
license_mode: permissive
license_evidence: `../meowdown/LICENSE`; MIT package metadata in `../meowdown/packages/core/package.json`, `../meowdown/packages/react/package.json`, and `../meowdown/packages/markdown/package.json`
output_mode: durable
versioned_copy_policy: normal

Verdict: add Meowdown as the specialist donor for hybrid Markdown selection,
clipboard boundaries, browser substitution, and touch-aware caret policy. The
best immediate Plate work is Markdown fragment/corpus proof and a safer
cross-editor drag contract. Its advanced mobile code is useful source pressure,
but the checked-in tests do not prove raw iOS: touch is synthetic, WebKit is
desktop Playwright, and the image tap tests explicitly skip WebKit.

This is the first harvest for the captured checkout. No prior report,
inventory, or test index existed to update.

## Inventory

- target: `../meowdown`
- source revision: `5b9962982a1cb3d1732355c753ce76d9a5966af3`
- run date: 2026-08-21
- inventory command:
  `rg --files | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec|bench)\.[cm]?[jt]sx?$' | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' | sort`
- test files found: 118
- runnable: 118
- classified: 118
- portable: 0
- portable-mixed: 21
- plate-owned: 90
- skipped: 3
- harness: 4
- product-shell: 0
- uncertain: 0
- test-name extraction: 117 of 118 runnable files; the sole unindexed file,
  `packages/eslint-rules/src/no-type-name-literal.test.ts`, was read directly
  and is a lint-rule contract.
- raw `describe` / `it` / `test` matches: 2,137
- full inventory: [inventory.md](./inventory.md)
- portable and portable-mixed test-name index:
  [test-index.md](./test-index.md)

The inventory count equals the classified count. No uncertain file remains.
Every portable-mixed file has test-name extraction and was read by test family.

## License Gate

| Field                 | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| License mode          | `permissive`                                           |
| Evidence files        | `../meowdown/LICENSE`; package `license: MIT` metadata |
| Output directory      | `docs/editor-test-harvester/meowdown`                  |
| Output mode           | `durable`                                              |
| Versioned copy policy | `normal`                                               |

## Proof Boundary

- This harvest audits checked-in source and tests at the captured revision. It
  does not claim the upstream suite passed in this turn.
- Browser-backed core and React tests use Playwright through Vitest with a
  900x600 viewport and `hasTouch: true`.
- CI covers Linux Chromium, Linux Firefox, macOS Chromium, macOS desktop
  WebKit, and Windows Chromium. That is strong desktop-engine and OS coverage.
- `virtual-caret.test.ts` dispatches a synthetic pointer with
  `pointerType: 'touch'`. `image.test.ts` constructs synthetic
  `PointerEvent`/`Touch` events and skips touch cases on desktop WebKit
  because its `Touch` constructor throws.
- Desktop WebKit, a touch-capable browser context, and source comments about
  iOS software-keyboard behavior are not raw iPhone or iPad proof.
- Current Plite/Plate coverage below means matching source or tests exist in the
  current checkout. Those tests were not rerun as part of this report-only
  harvest.
- No Browser, Appium, iPhone, iPad, or other raw-device proof was run.

## Confidence Score

| Dimension                                  | Weight |    Score | Evidence                                                                                                               | Cap hit |
| ------------------------------------------ | -----: | -------: | ---------------------------------------------------------------------------------------------------------------------- | ------- |
| Inventory completeness                     |   0.20 |     0.99 | Exact command, revision, 118 paths, 118 classifications, 0 uncertain, full linked appendix.                            | none    |
| Behavior extraction depth                  |   0.20 |     0.98 | All 21 portable-mixed files were indexed and pressure-read; 2,137 names expose broad Markdown and browser families.    | none    |
| Skip precision and negative controls       |   0.15 |     0.96 | All 3 skips and 4 harness rows have concrete reasons; implementation, utility, lint, and benchmark controls were read. | none    |
| Plite/Plate coverage mapping accuracy      |   0.20 |     0.96 | Raw selection/input/browser searches and exact Markdown, DnD, media, AI, table, list, and package owners are recorded. | none    |
| Actionability of copy/refactor/create plan |   0.15 |     0.96 | Every non-covered row names a target, proof kind, focused command, or explicit raw-device/product-policy defer reason. | none    |
| Provenance and reproducibility             |   0.10 |     0.99 | Local commit, license, inventory/index commands, CI/browser configs, and proof limits are recorded.                    | none    |
| Weighted total                             |   1.00 | **0.97** | Completion threshold met; every dimension is at least 0.85.                                                            | none    |

## Pass-State Ledger

| Pass                         | Status   | Evidence added                                                                                            | Report delta                                       | Open issues | Next owner            |
| ---------------------------- | -------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------- | --------------------- |
| Intake and boundary          | complete | Local checkout, MIT license, commit, report-only and device limits.                                       | Durable output selected.                           | none        | editor-test-harvester |
| Inventory                    | complete | 118 paths; runnable and classification counts.                                                            | Full appendix written.                             | none        | editor-test-harvester |
| Test-name extraction         | complete | 2,137 matches across 117 files; lint-rule file read directly.                                             | Stable index written.                              | none        | editor-test-harvester |
| Classification pressure      | complete | PM Step, generic utility, ESLint rule, and benchmark controls read.                                       | Skip and harness decisions retained with evidence. | none        | editor-test-harvester |
| Behavior extraction          | complete | 21 portable-mixed files plus source-only browser leads and grouped Plate families reduced to invariants.  | Matrix written.                                    | none        | editor-test-harvester |
| Plite/Plate coverage mapping | complete | Current input, selection, browser, Markdown, DnD, media, AI, table, list, and raw-mobile owners searched. | Coverage and gaps recorded.                        | none        | editor-test-harvester |
| Action planning              | complete | Markdown, DnD, checklist-browser, and raw-mobile routes named.                                            | Targets and commands added.                        | none        | Plate package owners  |
| Ecosystem synthesis          | complete | Steal/reject/diverge decisions and proof hierarchy recorded.                                              | Meowdown specialist role made explicit.            | none        | plite-research        |
| Closure review               | complete | Score, counts, placement, indexes, and proof boundary reviewed.                                           | Status set to done.                                | none        | user review           |

## Coverage Search Log

Raw Plite and browser-owner searches:

```bash
rg -n "compositionend|isComposing|insertReplacementText|beforeinput|WebKit|Safari" \
  packages/plite packages/plite-dom packages/plite-react apps/plite
rg -n "pointerType|touchstart|touchend|visualViewport|caret|contenteditable.?false" \
  packages/plite-dom packages/plite-react apps/plite/tests/plite-browser/donor/examples
rg -n "dragstart|dragend|dataTransfer|cross.?editor|drop|clipboard|copy|paste" \
  packages/plite-dom packages/plite-react apps/plite/tests/plite-browser/donor/examples
rg -n "raw-mobile|Appium|inline-void-boundary|selection-handle|composition-ime" \
  packages/browser tooling/plite/donor/proof
```

Plate-owner searches:

```bash
rg -n "round.?trip|fuzz|serialize|deserialize|text/markdown|clipboard" packages/markdown
rg -n "cross.?editor|source.*changed|same.?editor|copy modifier|fresh node key" packages/dnd
rg -n "insertReplacementText|substitution|target range" \
  packages/plite-react/test apps/plite/tests packages/markdown
rg -n "touch|pointer|keyboard|focus|select" packages/media apps/plite/tests/plite-browser/donor/examples/images.test.ts
rg --files packages | rg "/(markdown|dnd|media|ai|list|table|link|tag|selection)/"
```

Key current owners include
`packages/plite-react/test/composition-state-contract.test.ts`,
`packages/plite-react/test/model-input-strategy-contract.test.ts`,
`apps/plite/tests/plite-browser/donor/examples/inlines.test.ts`,
`apps/plite/tests/plite-browser/donor/examples/images.test.ts`,
`packages/browser/src/core/raw-mobile-proof.ts`,
`packages/markdown/src/lib/MarkdownPlugin.spec.ts`,
`packages/dnd/src/useDndNode.spec.ts`, and the feature packages named below.

## Matrix

| Source ref                                                                                                                         | Test ref                                                                  | Tag                         | Behavior invariant                                                                                                                                                                    | Proof kind                             | Owner coverage                                                                                                                                                                                              | Action                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/core/src/extensions/atom-mark-navigation.test.ts`                                                                        | L65-L717                                                                  | void-atom                   | Arrow, Shift+Arrow, delete, typing, and pointer selection treat a rendered inline atom as one unit and never leave a model caret inside its hidden source.                            | browser-backed unit                    | Plite has direct read-only-inline, void, adjacent-image, mention, selection, delete, and boundary browser rows. Hidden Markdown source is Meowdown policy.                                                  | **covered / plate-owned split** — raw owner `packages/plite-react` and browser examples are covered; hidden-source policy stays with a future Markdown-source editor. Verify raw behavior with `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/examples/inlines.test.ts`.                                                                                              |
| `packages/core/src/extensions/{hidden-run-caret,hidden-run}.test.ts`                                                               | Caret snap, range growth, delete, word-delete cases                       | selection-dom-mapping       | A caret or pointer endpoint cannot bisect a hidden syntax run; destructive keys either preserve the unit or remove it atomically according to direction.                              | browser-backed unit                    | Plite's atomic inline/void contracts cover rendered atoms, but Plate has no hybrid hidden-syntax projection.                                                                                                | **defer** — no raw Plite port. Owner is a future `packages/markdown` source-editing surface; require a product requirement and browser proof before adding hidden-syntax machinery.                                                                                                                                                                                                                          |
| `packages/core/src/extensions/clipboard/{clipboard,plain-text,semantic-inline}.test.ts`                                            | Partial heading/code/list and semantic HTML cases                         | clipboard-paste             | Copying an open fragment must not invent unselected block markers or fences; rich HTML stays semantic while Markdown/plain text follows the selected boundaries.                      | browser-backed unit                    | `MarkdownPlugin` registers `text/markdown` and tests closed slices, images, and primary content, but current tests do not exercise open fragment edges.                                                     | **create-new** — owner `packages/markdown`; add fresh open-start/open-end cases to `packages/markdown/src/lib/MarkdownPlugin.spec.ts`. Proof: package unit plus host-codec boundary; command `pnpm --filter @platejs/markdown test -- MarkdownPlugin.spec.ts`.                                                                                                                                               |
| `packages/core/src/extensions/clipboard/plain-paste.test.ts`                                                                       | L24-L271                                                                  | clipboard-paste             | Plain paste preserves meaningful line breaks and indentation, normalizes CRLF, and only promotes block Markdown where the insertion context permits blocks.                           | browser-backed unit                    | Plate Markdown already tests URL pass-through, file+text, HTML precedence, Markdown parsing, lists, code, and paragraph breaks.                                                                             | **covered / plate-owned** — owner `packages/markdown`; extend only when an uncovered context is reproduced. Command `pnpm --filter @platejs/markdown test`.                                                                                                                                                                                                                                                  |
| `packages/core/src/extensions/cross-editor-drag.test.ts`                                                                           | L31-L136                                                                  | drag-drop                   | A cross-editor move deletes the captured source only after a valid landing, never deletes a changed source, never touches a third editor, and becomes a copy under the copy modifier. | browser-backed unit                    | Plate DnD covers same-editor move, cross-editor multi-block move, fresh target keys, drop guards, and stale target cleanup. It lacks a captured-source revision guard and third-editor/copy-modifier cases. | **refactor-existing** — owner `packages/dnd`; extend `packages/dnd/src/useDndNode.spec.ts` and the drag item contract. Proof: package unit, then a real two-editor browser demo. Command `pnpm --filter @platejs/dnd test -- useDndNode.spec.ts`; API-shape changes route through `best-api repair` before implementation closeout.                                                                          |
| `packages/core/src/extensions/escape-collapse.test.ts`                                                                             | Forward/backward text and node selections                                 | accessibility-keyboard      | Escape may collapse an expanded product selection to its visible head without changing document content.                                                                              | browser-backed unit                    | Plite exposes deterministic selection collapse; assigning Escape is product UI policy.                                                                                                                      | **plate-owned/defer** — owners are menus, AI, or selection UI that claim Escape. Do not make it a raw default. Verify in the claiming package and its Browser route.                                                                                                                                                                                                                                         |
| `packages/core/src/extensions/exit-boundary.test.ts`                                                                               | Visual-line and selection guards                                          | accessibility-keyboard      | An editor-exit callback fires only when a collapsed caret is on the first or last visual line, not merely at a text offset.                                                           | browser-backed unit                    | Plite DOM geometry and Plate table navigation already distinguish visual lines; no generic exit callback is accepted raw law.                                                                               | **covered mechanism / defer policy** — raw owner `packages/plite-dom/test/dom-geometry.test.ts`; a future UI owner must add a browser case. Unit command `pnpm --filter @platejs/plite-dom test -- dom-geometry.test.ts`.                                                                                                                                                                                    |
| `packages/core/src/extensions/image.test.ts`                                                                                       | Pointer and touch image selection cases                                   | mobile-device               | A touch on an image preview selects the media unit without leaving the surrounding editable focused in a state that summons the software keyboard.                                    | synthetic touch; Chromium/Firefox only | Plite images cover desktop selection/navigation; raw-mobile matrix includes `inline-void-boundary` but not image-preview software-keyboard state. Donor WebKit touch cases are skipped.                     | **defer raw-device** — owners `packages/media`, `packages/browser/src/core/raw-mobile-proof.ts`, and the mobile lab. No implementation claim until a direct iOS Appium receipt exists. Closure command: `bun test:mobile-device-proof:raw`.                                                                                                                                                                  |
| `packages/core/src/extensions/{mark-mode,virtual-caret,virtual-caret-line-break}.test.ts`                                          | Hidden syntax, geometry, reflow, synthetic touch cases                    | selection-dom-mapping       | A custom caret must match native line geometry, disappear for native range/atom selection, reflow with layout, and yield to a trustworthy native caret after touch.                   | browser-backed unit; synthetic touch   | Plite deliberately uses native caret/selection wherever possible and has browser geometry/void/selection proof. Hybrid Markdown's custom caret is product architecture.                                     | **reject raw port / defer mobile claim** — future Markdown-source owner only. Native Plite coverage stays in `packages/plite-react` and `apps/plite`; any exact touch claim needs `bun test:mobile-device-proof:raw`.                                                                                                                                                                                        |
| `packages/core/src/extensions/pending-replacement.test.ts`                                                                         | L19-L204                                                                  | history-undo-redo           | A staged replacement remaps through unrelated edits, invalidates when its source disappears, and commits or discards as one explicit product action.                                  | model unit                             | Plate AI suggestion/streaming code owns staged replacements and has dedicated tests.                                                                                                                        | **plate-owned** — owner `packages/ai`; compare only against current AI invariants and run `pnpm --filter @platejs/ai test`.                                                                                                                                                                                                                                                                                  |
| `packages/core/src/extensions/scroll-to-selection.test.ts`                                                                         | L49-L121                                                                  | selection-dom-mapping       | Selection scrolling uses the visible caret geometry, honors margin, and avoids scrolling when already visible, including zero-width atom boundaries.                                  | browser-backed unit                    | Plite DOM exposes scheduled scroll-to-view and browser suites cover visible refocus and virtualized selection; no current source uses Meowdown's `visualViewport` policy.                                   | **covered mechanism / defer mobile viewport delta** — owner `packages/plite-dom`; run `pnpm --filter @platejs/plite-dom test -- scroll-into-view.test.ts`. Require raw-device evidence before changing viewport policy.                                                                                                                                                                                      |
| `packages/core/src/extensions/select-doc-boundary.test.ts`                                                                         | L13-L113                                                                  | accessibility-keyboard      | Document-start/end shortcuts must cross a leading or trailing non-editable marker and preserve Shift extension direction.                                                             | macOS desktop browser                  | Plite images prove document-edge shortcuts around voids, but the checklist browser route lacks the leading non-editable-marker case.                                                                        | **create-new** — owner `apps/plite/tests/plite-browser/donor/examples/check-lists.test.ts`; add a fresh WebKit/Chromium browser row. Focused commands: `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/examples/check-lists.test.ts` and `pnpm --filter plite test:plite-browser:project -- webkit apps/plite/tests/plite-browser/donor/examples/check-lists.test.ts`. |
| `packages/core/src/extensions/soft-break.test.ts`                                                                                  | L22-L326                                                                  | structured-blocks           | Soft break replaces an active selection, remains one undo unit, preserves surrounding block policy, and leaves a measurable caret.                                                    | browser-backed unit                    | Plite owns soft-break insertion/history and has real browser caret geometry; Plate list/table packages own product guards.                                                                                  | **covered / plate-owned split** — raw owner `packages/plite` and `packages/plite-history`; browser owner `apps/plite/.../richtext.test.ts`; list/table guards stay in those packages.                                                                                                                                                                                                                        |
| `packages/core/src/extensions/substitution.test.ts`                                                                                | L28-L186                                                                  | beforeinput-input           | Text substitutions replace the intended span and undo only the latest replacement.                                                                                                    | browser-backed unit                    | Plite directly tests `insertReplacementText`, target ranges, and browser substitutions. Exact ASCII-to-symbol rules are product policy.                                                                     | **covered raw / plate-owned rules** — owners `packages/plite-react` and the consuming input-rule package; focused browser proof `pnpm --filter plite test:plite-browser:chromium apps/plite/tests/plite-browser/donor/examples/plaintext.test.ts`.                                                                                                                                                           |
| `packages/core/src/utils/{selected-text,top-level-block-boundary}.test.ts`                                                         | L8-L35; L8-L35                                                            | clipboard-paste             | Selection export must distinguish partial and whole blocks so Markdown markers reflect only selected structure.                                                                       | model unit                             | Plite has structural selection/range APIs; Markdown fragment encoding is Plate-owned and currently lacks open-edge coverage.                                                                                | **covered primitive / create-new codec proof** — target the same `packages/markdown/src/lib/MarkdownPlugin.spec.ts` open-fragment cases; no new raw API.                                                                                                                                                                                                                                                     |
| `packages/core/src/converters/{check-roundtrip-fuzz,check-roundtrip-spec,roundtrip}.test.ts`; `packages/markdown/src/**/*.test.ts` | Seeded fuzz, CommonMark corpus, parser/serializer families                | markdown-richtext-roundtrip | Markdown parsing and serialization must preserve the application document across canonicalization, including structural punctuation and Unicode stress.                               | node unit/property                     | Plate has broad deterministic GFM/MDX/media/table/list round trips but no Markdown-package fuzz or CommonMark corpus found.                                                                                 | **create-new** — owner `packages/markdown`; add a bounded deterministic property/corpus test such as `packages/markdown/src/lib/roundtripCorpus.spec.ts`. Prove AST stability, not byte identity. Command `pnpm --filter @platejs/markdown test -- roundtripCorpus.spec.ts`; keep high-run fuzz out of the default fast lane if timing proves material.                                                      |
| `packages/core/src/utils/composition.ts`                                                                                           | No distinct matching test file                                            | ime-composition             | WebKit's early `compositionend` must not let the following commit key escape composition ownership.                                                                                   | source-only lead                       | Plite has explicit Safari composition order quirks and extensive composition contracts/browser cases.                                                                                                       | **covered; no donor promotion** — owners `packages/plite-react/src/editable/composition-state.ts` and its contracts. ProseKit/Meowdown's 50ms timer is not an independent proof.                                                                                                                                                                                                                             |
| `packages/core/src/extensions/system-substitution-guard.ts`                                                                        | No matching test file found                                               | beforeinput-input           | A Markdown-source editor may cancel a browser smart-dash replacement that would corrupt literal syntax, then restore selection.                                                       | source-only lead                       | Plite correctly applies native replacement target ranges; cancelling one replacement class is product policy and Plate has no hybrid source editor.                                                         | **defer** — future Markdown-source owner. Do not add the guard to raw Plite. A future proof must run desktop WebKit and raw iOS if the claim includes iOS.                                                                                                                                                                                                                                                   |
| `packages/core/src/extensions/**` feature tests                                                                                    | Links, lists, tables, embeds, files, math, tags, wiki links, HTML, search | structured-blocks           | Feature extensions preserve their own Markdown grammar, rendering, commands, and selection policy.                                                                                    | unit/browser                           | These are Plate package or app policy, not raw law.                                                                                                                                                         | **plate-owned** — links `packages/link`; lists `packages/list`; tables `packages/table`; media/embeds/files `packages/media`; math `packages/math`; tags `packages/tag`; search `packages/find-replace`; Markdown grammar `packages/markdown`; wiki features remain application backlog until Plate accepts them.                                                                                            |
| `packages/react/src/components/**`                                                                                                 | Editor, menus, handles, previews, drag, rendering                         | decorations-overlays        | React components coordinate editor-owned state without redefining raw editing law.                                                                                                    | React unit/browser                     | Plate React packages and copied registry UI own these surfaces.                                                                                                                                             | **plate-owned** — owners `packages/core`, matching feature packages, and `apps/www/src/registry`; verify package logic with tests and visible behavior with Browser.                                                                                                                                                                                                                                         |
| `packages/vitest/src/config.ts`; `.github/workflows/ci.yml`                                                                        | Browser/OS matrix                                                         | browser-engine              | Browser-sensitive editor tests should run Chromium, Firefox, and desktop WebKit with engine-specific skips stated narrowly.                                                           | CI configuration                       | Plite already has Chromium, Firefox, mobile viewport, and WebKit matrix plus a separate raw-mobile receipt gate.                                                                                            | **covered strategy** — keep `pnpm check:plite:browser-matrix` and `bun test:mobile-device-proof:raw` distinct. Do not infer raw mobile from either donor's touch context.                                                                                                                                                                                                                                    |

## Plate-Owned Family Routing

| Donor family                                                        | Plate owner                                                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Markdown parser, serializer, roundtrip, clipboard, HTML-to-Markdown | `packages/markdown`                                                                    |
| Links, autolinks, reference links, hover/follow UI                  | `packages/link`; grammar shared only through `packages/markdown`                       |
| Lists, task markers, list clipboard/collapse/move                   | `packages/list` and `packages/markdown`                                                |
| Tables and alignment                                                | `packages/table` and `packages/markdown`                                               |
| Images, files, embeds, tweets, YouTube                              | `packages/media`; application registry for provider UI                                 |
| Math, tags, search                                                  | `packages/math`, `packages/tag`, `packages/find-replace`                               |
| Pending replacement and preview                                     | `packages/ai`                                                                          |
| Block handles and cross-editor drag                                 | `packages/dnd`, `packages/selection`, and copied registry UI                           |
| Wiki links/embeds and hybrid source display modes                   | No accepted generic Plate owner; application backlog or future Markdown-source product |
| React menus, handles, views, previews                               | Matching package plus `apps/www/src/registry`                                          |

## Skips

| Source                                                     | Category | Reason                                                                                                                                                              | Negative control                                                                                                                              |
| ---------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/extensions/batch-set-mark-step.test.ts` | skip     | It proves a ProseMirror `Step` implementation, JSON registration, chunk threshold, and node-identity optimization rather than an observable cross-editor invariant. | Read the full file, including invert/map/merge and 32/33-chunk paths; the user-visible mark behavior is covered elsewhere.                    |
| `packages/core/src/utils/format-file-size.test.ts`         | skip     | Generic decimal file-size formatting has no editor behavior.                                                                                                        | Read all rounding and unit-boundary cases.                                                                                                    |
| `packages/eslint-rules/src/no-type-name-literal.test.ts`   | skip     | Static lint-rule policy does not prove runtime editing behavior.                                                                                                    | Read its valid/invalid RuleTester corpus directly because generic test-name extraction did not match it.                                      |
| Converter and inline-mark benchmark files                  | harness  | Bench inputs measure donor implementation throughput; they are not behavior proof.                                                                                  | Read `check-roundtrip.bench.ts`; retained the separate idea of bounded roundtrip stress without treating benchmark throughput as correctness. |

## Ecosystem Synthesis

Steal:

- Open-fragment Markdown clipboard tests that distinguish partial from whole
  blocks.
- Seeded structural/Unicode roundtrip stress, adapted to Plate AST stability.
- Cross-editor drag source-version and third-editor isolation guards.
- Visual-line and document-edge browser cases where non-editable DOM can defeat
  native navigation.
- Narrow browser-matrix skips that state exactly what desktop WebKit cannot
  synthesize.

Reject:

- ProseMirror steps, integer positions, plugin views, and hidden-source
  decorations as raw Plite machinery.
- A custom virtual caret in Plite. Native caret/selection remains the default
  authority.
- Smart-dash cancellation as raw behavior; it is valid only for a product that
  exposes literal Markdown source.
- Any statement that the current Meowdown suite proves iPhone or iPad behavior.

Diverge deliberately:

- Plite separates semantic mobile handles, desktop browser matrix, and direct
  Appium raw-device receipts. Keep that stronger proof hierarchy.
- Plate's Markdown codec works from a rich document model. Import the fragment
  boundary and fuzz invariants, not Meowdown's hidden-syntax architecture.
- Plate DnD should use editor identity plus captured source authority rather
  than importing Meowdown's ProseMirror transport.

## Next Slice

1. Add open-fragment Markdown clipboard cases to
   `packages/markdown/src/lib/MarkdownPlugin.spec.ts`.
2. Design the cross-editor drag source-authority guard in `packages/dnd`;
   route any reusable item/API change through `best-api repair` before
   implementation closeout.
3. Add a bounded CommonMark/property roundtrip corpus to
   `packages/markdown`, proving AST stability rather than byte equality.
4. Add the leading-checklist document-edge browser case to the Plite browser
   matrix.
5. Defer image-touch/software-keyboard claims until a real iOS Appium receipt
   exists. Synthetic touch and desktop WebKit are not enough.

## Local execution

The four actionable rows are complete in the current uncommitted checkout:

- Open Markdown clipboard fragments keep inline marks but do not add heading,
  code-fence, or list markers outside the selected content.
- Cross-editor DnD inserts the drag-start document content and keeps an edited
  source document intact. Selection-only source changes still allow the move.
  The drag authority stays private to `useDndNode`; no public item field or
  export was added.
- A 12-case deterministic CommonMark corpus proves parse, canonical serialize,
  and replay AST stability without requiring byte equality.
- The leading-checklist document-start row passes the full four-test checklist
  file in Chromium and WebKit, plus 5/5 retry-free warm runs in each engine. A
  fresh Browser replay moved the collapsed caret from `[2,0]:12` to `[0,0]:0`
  with no console warnings or errors.

The raw iOS image-touch and software-keyboard row remains deferred. Desktop
WebKit and synthetic touch do not satisfy it.

## Full Inventory Appendix

The complete 118-row appendix is [inventory.md](./inventory.md). The 117-file
test-name extraction is [test-index.md](./test-index.md). Both files record the
captured revision and reproducible commands.

## Verification

```bash
cd ../meowdown
rg --files | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\.(test|spec|bench)\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)' \
  | sort | wc -l

cd ../plate-2
rg -n "License Gate|Confidence Score|Pass-State Ledger|Matrix|Skips|Next Slice|Full Inventory Appendix" \
  docs/editor-test-harvester/meowdown/report.md
test -f docs/editor-test-harvester/meowdown/inventory.md
test -f docs/editor-test-harvester/meowdown/test-index.md
```
