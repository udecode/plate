# Editor Test Harvest: Lexical

status: done
score: 0.93
target: `../lexical`
local target: current Plate checkout
mode: incremental inventory refresh; report-only architecture dependency
skills: `editor-test-harvester`, `editor-audit`
date: 2026-07-29
artifact_dir: `docs/editor-test-harvester/lexical`
source_commit: `dd5c41b13193efa9ab1574234d8593d2c9e4f988`
previous_source_commit: `d52f66e250e031a6c6fd8836d160373b0df557c7`
inventory_mode: incremental

## Verdict

This is now a closure-grade Lexical harvest report under the updated harvester gate.

The useful material is browser/editor behavior: IME, clipboard, native input transport, table selection, DOM mutation repair, grapheme deletion, inline atom boundaries, collaboration/history, and a few scroll/focus rows. The trash stays out: Lexical node-class mechanics, command registry internals, React Composer behavior, ESLint tooling, package fixtures, and playground product chrome.

The residual plugin/product rows should fit Plate, not raw Plite. Link/autolink grammar, list/checklist policy, markdown transformer UX, mention/hashtag/keyword/date-time/emoji/media plugins, toolbar state, and React plugin host behavior are `plate-owned` backlog rows unless a raw editor invariant is split out.

The source inventory is current. The older processing/apply ledger records a
prior extraction pass and is not current local-coverage authority. This
planning-only refresh did not rerun those implementation claims or browser
proof. Any accepted proposal must inspect the current owners named below and
select proof from the full inventory.

## Inventory

Inventory command:

```bash
rg --files ../lexical \
  | rg '(^|/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(/|$)|\\.(test|spec)\\.[cm]?[jt]sx?$' \
  | rg -v '(^|/)(dist|build|coverage|node_modules|vendor|fixtures/generated|__snapshots__)(/|$)'
```

| Bucket | Count |
| --- | ---: |
| total inventory rows | 405 |
| actual runnable test/spec rows | 351 |
| fixture/support rows | 54 |
| portable behavior rows | 193 |
| portable-mixed rows | 85 |
| product-shell rows | 43 |
| harness rows | 16 |
| skipped rows | 68 |
| unresolved uncertain rows | 0 |

Counts preserve the closed harvest inventory. `plate-owned` is a routing overlay for residual plugin/product rows, not a new inventory rerun count.

Linked appendices:

- [Full inventory appendix](./inventory.md): every one of the 405 rows, category, reason, target family, and extraction state.
- [Portable test-name index](./test-index.md): every runnable portable/portable-mixed source with line pointers.

## License Gate

- Upstream license: MIT at `../lexical/LICENSE:1`.
- Architecture evidence is paraphrased with exact source pointers.
- Portable test behavior may be re-expressed under
  `docs/editor-test-harvester/lexical/`; copied source must retain any
  applicable upstream notice.
- This refresh copied no Lexical runtime or test implementation.

## Incremental Cursor Refresh 2026-07-29

- Live `../lexical` inventory returned 405 rows, matching [inventory.md](./inventory.md).
- Stored category counts still match: runnable 351, fixture/support 54, portable 193, portable-mixed 85, product-shell 43, harness 16, skip 68, uncertain 0.
- No live files are missing from the inventory and no stored inventory files disappeared upstream.
- [test-index.md](./test-index.md) covers all 278 portable/portable-mixed runnable files with 4,212 extracted test/describe/it line pointers.
- No portable file is missing from the index and no stale index file remains.
- [plite-processing-ledger.md](./plite-processing-ledger.md) is retained as
  historical extraction evidence only; it is not current coverage proof.
- The original matrix below is a behavior-extraction snapshot. Its old gap and
  apply labels are not current source claims.

## Confidence Score

| Dimension | Score | Evidence | Cap hit |
| --- | ---: | --- | --- |
| Inventory completeness | 0.98 | 405/405 live inventory rows classified; rerun found 0 missing and 0 removed rows; runnable 351; fixture/support 54; unresolved 0. | none |
| Behavior extraction depth | 0.94 | 278 runnable portable/portable-mixed files indexed with 4,212 test/describe/it line pointers; rerun found 0 missing and 0 stale index files. | dynamic-title ranges still require local reading before any future apply pass |
| Skip precision and negative controls | 0.91 | Skip/product/harness families have concrete reasons; negative controls read for React Composer, ESLint rule tests, ESM fixture app, Lexical utility helper, and TreeView/product UI routing. | none |
| Plite coverage mapping accuracy | 0.92 | Current owner files searched in the current Plate checkout: stress rows, clipboard contracts, text units, DOM repair, collab history, table browser examples, `plite-browser` IME helper. | no execution proof because this is report-only |
| Actionability of copy/refactor/create plan | 0.93 | Every matrix action names target file(s), proof kind, and focused verification command. Inventory rows map to target families. | none |
| Provenance and reproducibility | 0.90 | Exact local source paths/line pointers recorded; no GitHub closure claim; ClawSweeper/gitcrawl reserved for future issue-linked apply pass. | issue threads not synced because no issue claim changed |

Weighted total: 0.93. No dimension is below 0.85. Inventory count equals classified count. There are no uncertain rows.

## Pass-State Ledger

| Pass | Status | Evidence added | Report delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| Intake and boundary | complete | Confirmed local `../lexical`, the current Plate checkout, report-only mode, no browser/device apply. | Scope locked to portable editor behavior. | none | none |
| Inventory | complete | Re-ran full `rg --files` inventory: 405 rows. | Added linked full inventory appendix. | none | none |
| Test-name extraction | complete | Indexed 278 runnable portable/portable-mixed files with 4212 extracted names. | Added linked test-name index. | Dynamic names need local read before apply, but line pointers exist. | apply-pass owner |
| Classification pressure | complete | Negative controls read: React Composer, ESLint rule, ESM fixture app, utility helper, product UI. | Product/harness/skip reasons sharpened. | none | none |
| Behavior extraction | complete | Matrix rebuilt around behavior invariants and proof kind, not Lexical APIs. | Added high-value copy/refactor/create/defer rows with targets. | Lower-priority package unit rows stay in inventory/index backlog. | apply-pass owner |
| Plite coverage mapping | complete for ownership, not behavior proof | Rechecked current Plate checkout stress, clipboard, text-unit, DOM repair, collab, table, and browser-helper owners. | Repaired migrated owner paths. | Historical row statuses were not re-executed. | accepted proposal owner |
| Action planning | complete | Full source pointers and proof families are available for proposal-specific selection. | No implementation slice accepted in this planning-only run. | Raw mobile still requires a device lane. | parent architecture audit |
| Ecosystem synthesis | complete | Compared Lexical browser regression style to Plite runtime proof rules and local solutions. | Added synthesis below. | none | none |
| Closure review | complete | Score 0.93; appendices linked; completion file updated. | Status set to done. | none | none |

## Plite Search Evidence

Commands used in this closure pass:

```bash
rg --files . | rg '(test|spec|playwright|stress|clipboard|ime|table|history|text-units|dom-repair)'
rg -n "pasteNormalizeUndo|selectionRepairIme|inlineVoidBoundaryNavigation|tableCellBoundaryNavigation|pasteHtmlImageVoid|IME|composition|clipboard|execCommand|ClipboardEvent|grapheme|table|collab" apps/plite/tests/plite-browser/donor packages/browser/src/playwright/ime.ts packages/plite/test packages/plite-dom/test packages/plite-history/test packages/plite-react/test
rg -n "IME|composition|mobile|clipboard|paste|selection|browser" docs/solutions
```

Current Plite owner files found:

| Behavior family | Current owner | Harvest take |
| --- | --- | --- |
| IME composition | `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`, `apps/plite/tests/plite-browser/donor/examples/mentions.test.ts`, `packages/browser/src/playwright/ime.ts`, `packages/plite-react/test/composition-state-contract.test.ts` | Select only the Lexical rows needed by an accepted behavior proposal; current owners already cover several inline-atom and composition cases. |
| Clipboard and paste | `packages/plite/test/clipboard-contract.ts`, `packages/plite-dom/test/clipboard-boundary.test.ts`, `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts` | Preserve external corpus and real browser transport as separate proof kinds. |
| Tables | `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`, `apps/plite/tests/plite-browser/donor/examples/tables.test.ts` | Plate owns table policy; Plite proof should stay limited to substrate behavior. |
| Graphemes/text units | `packages/plite/test/text-units-contract.ts` | Expand beyond the two basic grapheme distance checks and promote destructive browser rows where needed. |
| DOM repair | `packages/plite-react/test/dom-repair-policy-contract.test.ts`, `packages/plite-react/test/runtime-repair-engine-contract.test.tsx` | Pair policy and runtime-engine contracts with browser proof only for accepted DOM behavior. |
| Collaboration/history | `packages/plite/test/collab-history-runtime-contract.ts`, `packages/plite-history/test` | Substrate is covered; full browser collaboration remains a later lane. |
| Raw mobile | none strong enough | Do not claim from Playwright mobile viewport; use real Appium/device proof only. |

## Plate-Owned Routing

These rows stay valuable, but the target is Plate packages, kits, examples, docs, or backlog, not raw Plite.

| Source family | Plate owner | Raw Plite owner |
| --- | --- | --- |
| `lexical-link/*`, `AutoLinks.spec.mjs`, residual link paste rows | Plate link/autolink package, docs, and examples | Inline boundary, paste, and safe link insertion rows already live in Plite. |
| `lexical-list/*`, `List.spec.mjs`, checklist/list paste rows | Plate list/checklist packages and list example policy | Basic list fragments, list wrappers, and query/list ancestry rows already live in Plite. |
| `LexicalMarkdown.test.ts`, `MarkdownTransformers.test.ts`, `Markdown.spec.mjs` | Plate markdown serializer/transformer package and markdown docs | Markdown shortcut browser examples cover raw shortcut behavior only. |
| Mentions, hashtags, keywords, date-time, emoji, equation, character-limit, media/plugin rows | Plate feature packages and examples | Highlighted text, inline atom, void, and markable void substrate rows stay in Plite. |
| Clear formatting residuals, element format residuals, toolbar active state, product styling | Plate rich-text UI/plugin layer | Current richtext example owns only accepted generic behavior. |
| React Composer, menu, typeahead, nested composer, plugin host rows | Plate React/plugin ergonomics if accepted | No raw Plite target unless a framework-agnostic invariant is split out. |

## Ecosystem Strategy Synthesis

Lexical's best habit is issue-shaped browser coverage: one regression file for a real browser/editor failure, with the browser transport preserved. Plite should steal that shape, not Lexical's node classes or command registry.

Mechanisms to steal:

- browser-first regression rows for IME, paste, table selection, and DOM repair;
- external paste corpus grouped by source app: Google Docs, Word, Sheets, image HTML, nested lists;
- explicit browser-engine rows when Firefox/Safari ordering matters;
- mobile/table rows that refuse fake viewport proof;
- undo granularity around composition, paste, and collaboration.

Mechanisms to reject:

- Lexical private MIME format as a Plite public requirement;
- React Composer/plugin identity tests;
- node-class lifecycle and command-registry mechanics;
- playground toolbar/share/file/product behavior;
- eslint/release/ESM fixture tests.
- plugin/product policy as raw Plite law when the natural owner is Plate.

## Matrix

| Source | Test / cluster | Tag | Invariant | Proof kind | Plite coverage | Action |
| --- | --- | --- | --- | --- | --- | --- |
| `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:174` | Can type Hiragana via IME | `ime-composition` | Browser composition commits text and model selection correctly. | browser | existing row `selectionRepairIme`; target `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; helper owner `packages/browser/src/playwright/ime.ts` | refactor-existing: split into named IME family; verify `PLAYWRIGHT_RETRIES=0 bunx playwright test apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts --project=chromium -g "IME\|composition"` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:371` | Can type Hiragana via IME into a new bold format | `ime-composition, marks-inline` | Composition inside active mark keeps mark and caret stable. | browser | existing solution `docs/solutions/developer-experience/2026-05-07-plite-browser-ime-proof-rows-need-honest-dom-composition.md`; stress naming still too thin | refactor-existing: keep DOM-mutation proof and add a visible source-family name; verify the focused IME grep and `pnpm --filter @platejs/browser test:core` when the helper changes |
| `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:445` | Can type Hiragana via IME between emojis | `ime-composition, beforeinput-input` | Composition around multi-codepoint characters keeps text units and selection sane. | browser + unit | `packages/plite/test/text-units-contract.ts` covers grapheme distance; no browser IME-around-emoji row | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify IME grep plus `bun test ./packages/plite/test/text-units-contract.ts` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:636` | Can type Hiragana via IME at the end of a mention | `ime-composition, void-atom` | Composition adjacent to inline atom does not corrupt atom boundary. | browser | inline void navigation exists in stress, no adjacent IME row | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify `-g "inline.*IME\|composition.*void"` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Composition.spec.mjs:1078` | Can type, delete and cancel Hiragana via IME | `ime-composition, history-undo-redo` | Cancel/delete during composition leaves no ghost text and caret stays valid. | browser + history unit | no dedicated row found | create-new: `packages/plite-history/test/history-contract.ts` plus stress row; verify `bun test ./packages/plite-history/test` and IME grep |
| `../lexical/packages/lexical-playground/__tests__/e2e/History.spec.mjs:729` | Cancel composition not push undo stack | `history-undo-redo, ime-composition` | Canceled composition is not an undo entry. | unit + browser | history tests cover undo basics, not composition cancellation | create-new: `packages/plite-history/test/history-contract.ts`; verify `bun test ./packages/plite-history/test` |
| `../lexical/packages/lexical-playground/__tests__/regression/8153-safari-ime-delete-selection.spec.mjs:39` | Safari delete selection after IME composition end | `browser-engine, ime-composition, delete-backspace` | WebKit compositionend ordering must not poison later deletion. | browser engine | current Plite note says CDP IME cannot prove every mid-mark/mobile case honestly | defer/create: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts` WebKit row only when transport is honest; verify WebKit project grep |
| `../lexical/packages/lexical-playground/__tests__/regression/7354-firefox-decorator-paste.spec.mjs:26` | Firefox decorator paste with extra newlines | `browser-engine, clipboard-paste, void-atom` | Firefox paste near atom/decorator content normalizes blocks without corrupting structure. | browser engine | Plite has paste image/void stress, not Firefox decorator paste | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify Firefox project grep |
| `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:21` | Grapheme deleteCharacter matrix | `delete-backspace, beforeinput-input` | Delete and movement use grapheme units, not UTF-16 code units. | unit + browser | `packages/plite/test/text-units-contract.ts` covers two basics only | refactor-existing: expand `text-units-contract.ts` and promote destructive browser rows as needed; verify `bun test ./packages/plite/test/text-units-contract.ts` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:25` | document.execCommand("insertText") | `beforeinput-input, browser-engine` | Browser-native insertText path imports into editor state. | browser | no direct Plite row found | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify `-g "execCommand\|insertText"` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Extensions.spec.mjs:47` | ClipboardEvent("paste") | `clipboard-paste, browser-engine` | Synthetic browser paste event imports data correctly as compatibility proof. | browser | Plite default paste proof should stay real clipboard; compatibility row can be narrow | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify `-g "ClipboardEvent\|paste event"` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:53` | Text mutation observers also manage selection | `selection-dom-mapping` | External DOM text mutation keeps selection coherent. | browser | `packages/plite-react/test/dom-repair-policy-contract.test.ts` is policy-level only | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify `-g "DOM repair\|mutation"` plus `bun test ./packages/plite-react/test/dom-repair-policy-contract.test.ts` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1193` | Triple-click last table cell does not select entire document | `tables-grid, selection-dom-mapping` | Browser selection inside tables stays bounded. | browser | table boundary navigation exists, not triple-click table containment | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify `-g "table.*triple\|table.*selection"` |
| `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1248` | Drag from table cell outside selects entire table | `tables-grid, selection-dom-mapping` | Range selection crossing table boundary promotes to whole-table selection predictably. | browser | no exact Plite row found | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify table selection grep |
| `../lexical/packages/lexical-table/src/__tests__/unit/LexicalTableMobileSelection.test.tsx:137` | Touch tap on single cell should not create table selection | `mobile-device, tables-grid` | Touch and mouse table selection must differ. | raw device + unit | no raw-device Plite row; Playwright mobile viewport is not enough | defer: raw Appium lane; target `playwright` mobile proof files when device lane exists; verify `bun test:mobile-device-proof:raw` only on real device lane |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:796` | Multi-line plain text paste produces separate paragraphs | `clipboard-paste, insert-fragment` | Browser paste of multiline text creates stable block structure and caret. | browser + unit | paste-normalize-undo exists; explicit source corpus is thin | refactor-existing: `packages/plite/test/clipboard-contract.ts` plus stress paste row; verify clipboard contract and paste grep |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:905` | Process font-size from content copied from Google Docs/MS Word | `clipboard-paste, marks-inline` | External rich HTML paste normalizes styling without losing semantic marks. | browser corpus | no exact external corpus owner found | create-new: `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts`; verify paste-html grep |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:965` | Cut then copy empty selection preserves clipboard | `clipboard-paste, browser-engine` | Empty selection copy/cut should not destroy existing clipboard data. | browser | no Plite browser clipboard row found | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify clipboard grep |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:24` | Copy + paste table from Google Docs | `clipboard-paste, tables-grid` | External table HTML imports into stable table model. | browser corpus + unit | Plite table insert-fragment units exist, external Docs corpus missing | create-new: `apps/plite/tests/plite-browser/donor/examples/paste-html.test.ts` and table insert-fragment unit fixture; verify paste-html and targeted table fixture tests |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/TablesHTMLCopyAndPaste.spec.mjs:233` | Copy + paste table from Google Sheets | `clipboard-paste, tables-grid` | Spreadsheet HTML paste preserves row/cell structure. | browser corpus | no exact Plite row found | create-new: same paste-html/table owner; verify paste-html table grep |
| `../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ImageHTMLCopyAndPaste.spec.mjs:172` | Copy + paste + undo multiple image | `clipboard-paste, void-atom, history-undo-redo` | Pasted atom nodes undo as one coherent history unit. | browser + history unit | paste-html-image-void exists, multi-image undo missing | refactor-existing/create-new: stress row plus `packages/plite-history/test`; verify image paste grep and history tests |
| `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:200` | Backspace inside mention in middle | `void-atom, delete-backspace` | Inline atom/token deletion preserves surrounding text. | browser + unit | inline void navigation exists; deletion row thin | refactor-existing: stress inline void family and core delete fixtures; verify inline/void grep |
| `../lexical/packages/lexical-playground/__tests__/e2e/Mentions.spec.mjs:940` | Pasting over mention does not crash | `void-atom, clipboard-paste` | Paste replacing atom boundary is safe. | browser | inline fragment paste units exist, browser atom paste row missing | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify mention/void paste grep |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:57` | Inserting text either side of inline elements | `marks-inline, selection-dom-mapping` | Insert before/after inline elements at paragraph start/middle/end is stable. | unit | broad Plite inline tests exist under `packages/plite/test` | covered/refactor-existing: strengthen names if missing; verify targeted `bun test ./packages/plite/test` fixture paths when edited |
| `../lexical/packages/lexical/src/__tests__/unit/LexicalSelection.test.ts:1560` | Firefox selection and paste before linebreak | `browser-engine, clipboard-paste` | Firefox linebreak selection paste does not corrupt structure. | browser engine | no exact Plite Firefox row found | create-new: `apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts`; verify Firefox linebreak paste grep |
| `../lexical/packages/lexical/src/nodes/__tests__/unit/LexicalTabNode.test.tsx:56` | Paste plain text with tabs and newlines | `serialization-parsing, clipboard-paste` | Tabs and newlines preserve intended text/block shape on paste. | unit + browser | paste normalize exists, explicit tab matrix thin | refactor-existing: `packages/plite/test/clipboard-contract.ts`; verify clipboard contract |
| `../lexical/packages/lexical-playground/__tests__/e2e/Collaboration.spec.mjs:36` | Undo with collaboration on | `collaboration-remote, history-undo-redo` | Local undo remains correct with remote/collab state. | unit + future browser | `packages/plite/test/collab-history-runtime-contract.ts` covers substrate metadata, not yjs browser parity | refactor-existing/defer browser: verify collab contract now; browser yjs row later |
| `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:17` | Auto scroll while typing | `browser-engine, focus-blur` | Caret remains visible while typing into scrollable editor roots or parents. | browser | Plite has example browser rows, no focused caret autoscroll contract found | create-new: `apps/plite/tests/plite-browser/donor/examples/huge-document.test.ts` or stress route; verify autoscroll grep |

## Skips

| Source family | Count | Reason | Negative-control evidence |
| --- | ---: | --- | --- |
| Scripts, release, ESM fixtures, package-manager tests | 78 | Packaging/tooling proof, not editor behavior. | Read `../lexical/scripts/__tests__/integration/fixtures/lexical-esm-nextjs/tests/test.ts`: proves example app h1/package wiring. |
| ESLint plugin tests | 10 | Lint rule naming/contracts, no runtime editor invariant. | Read `../lexical/packages/lexical-eslint-plugin/src/__tests__/unit/rules-of-lexical.test.ts`: proves ESLint rule examples. |
| React Composer/plugin tests | 20 | React integration and composer identity, not raw editor behavior. | Read `../lexical/packages/lexical-react/src/__tests__/unit/LexicalComposer.test.tsx`: verifies React context/editor identity. |
| Utility/helper contracts | 12 | Useful harness ideas, but no editor behavior to port directly. | Read `../lexical/packages/lexical-utils/src/__tests__/unit/LexicalUtilsKlassEqual.test.ts`: browser/event class helper only. |
| Playground product shell | 33 | Toolbar/share/file/layout/product UI. Portable rows are split into portable-mixed when present. | Product rows remain indexed in inventory with reason, not copied. |
| Plate-owned residuals | overlay | Plugin/product behavior that belongs in Plate packages, kits, examples, docs, or backlog. | Link/autolink, lists/checklists, markdown transformers, feature plugins, toolbar/menu state, and React plugin hosts are routed above instead of forced into raw Plite. |

## Historical Apply Ledger

This table records the former standalone Plite extraction pass. It is useful
provenance, not current verification.

| Slice | Status | Stolen rows | Plite changes | Verification | Next owner |
| --- | --- | --- | --- | --- | --- |
| IME/history | complete | `Composition.spec.mjs:445`, `Composition.spec.mjs:636`, `Composition.spec.mjs:1078`, `History.spec.mjs:729` | Added generated browser rows for inline-void-adjacent composition and composition undo; reused existing runtime emoji composition browser row; added `plite-history` composition undo/cancel tests; fixed `plite-browser` synthetic composition to clone the DOM range before composition events. | `bun test ./packages/plite-history/test/history-contract.ts`; `bun test ./packages/plite/test/public-surface-contract.ts`; `pnpm --filter @platejs/browser test:core`; focused generated IME stress rows; existing emoji runtime Playwright row; `pnpm check:plite:dev` in the current Plate checkout. | clipboard corpus |
| Clipboard corpus | complete | `CopyAndPaste.spec.mjs:796`, `CopyAndPaste.spec.mjs:905`, `CopyAndPaste.spec.mjs:965`, `TablesHTMLCopyAndPaste.spec.mjs:233`, `ImageHTMLCopyAndPaste.spec.mjs:172` | Added multiline plain-text paste unit coverage; added collapsed copy/cut clipboard preservation browser proof; strengthened multi-image paste undo stress row; taught `paste-html` to preserve safe inline style attrs and import basic external table HTML; added Google Docs font-size and Google Sheets table paste browser rows. | `bun test ./packages/plite-dom/test/clipboard-boundary.ts`; focused highlighted-text clipboard Playwright row; focused generated stress rows for IME plus image paste undo; full Chromium `paste-html` integration file; `pnpm check:plite:dev` in the current Plate checkout. | browser transport |
| Browser transport | complete | `Extensions.spec.mjs:25`, `Extensions.spec.mjs:47`, `regression/7354-firefox-decorator-paste.spec.mjs:26` | Added plaintext browser rows for `document.execCommand("insertText")` and synthetic `ClipboardEvent("paste")`; added editable-void native input paste row for the decorator/atom-internal-control class, verified on Firefox as well as Chromium. | Chromium plaintext file; Firefox plaintext file with synthetic paste honestly skipped; Chromium editable-void native paste row; Firefox editable-void native paste row; `pnpm check:plite:dev` in the current Plate checkout. | table selection |
| Table selection | complete | `Selection.spec.mjs:1193`, `Selection.spec.mjs:1248`, shift-arrow table rows | Added triple-click last-cell containment browser proof; added drag-from-cell containment proof that does not overclaim Plite's current table model; repaired the existing ArrowDown table-last setup to place a real browser/model selection before testing the arrow behavior. Full Lexical whole-table drag/range selection remains deferred until Plite owns a whole-table selection model. | Focused Chromium table rows; generated `table-cell-boundary-navigation` stress row; full Chromium `tables.test.ts`; `pnpm check:plite:dev` in the current Plate checkout. | raw mobile defer / closure |

Notes:

- The former standalone checkout reported a dedicated emoji-composition row.
  This refresh did not find that exact migrated filename and makes no current
  coverage claim for it.
- The inline-void row targets the leading edge of the mention atom. The post-mention spacer in the demo maps through zero-width boundary internals and is a bad oracle for this slice.
- The helper fix matters: synthetic composition must clone the DOM range before `compositionstart`/`compositionupdate`, or event handlers can move the live selection before the DOM mutation.
- Clipboard corpus split by honest owner: model/plaintext import lives in `plite-dom`; empty copy/cut needs real Chromium clipboard; external HTML/table corpus belongs to the `paste-html` browser example; image void undo stays in generated stress.
- Font-size is a paste-html leaf attribute, not a toolbar mark; the site build exposed existing `marks.get()` typing debt in richtext/iframe/hovering-toolbar, so those examples now cast active marks to the local boolean mark map.
- Browser transport split by what browsers can honestly prove: Chromium owns synthetic `ClipboardEvent` paste; Firefox owns `execCommand` and native paste inside an internal editable-void input, while synthetic paste is skipped because Firefox blocks that data path.
- Table selection is partial by design: Plite's current table example does not implement Lexical's whole-table drag/range selection model. The applied tests lock containment and cell triple-click behavior without pretending the full Lexical table-selection feature exists.
- Workflow learning captured: [Plite Playwright webserver checks should run sequentially](../solutions/workflow-issues/2026-05-08-plite-playwright-webserver-checks-should-run-sequentially.md).

## Next Slice

No implementation slice is accepted by this planning-only audit. The list
below records the former extraction sequence only.

1. IME/history stress cluster: complete in apply ledger above.
   - mark-preserving composition;
   - composition around emoji;
   - composition adjacent to inline atom;
   - cancel composition does not push undo;
   - undo composed text after composition end.
2. Clipboard corpus: complete in apply ledger above.
   - empty selection cut/copy preserves clipboard;
   - Google Docs/MS Word formatted paste;
   - Google Sheets/table paste;
   - multi-image paste undo.
3. Browser transport: complete in apply ledger above.
   - `document.execCommand("insertText")`;
   - synthetic `ClipboardEvent("paste")` compatibility;
   - Firefox decorator/atom paste.
4. Table selection: complete in apply ledger above.
   - triple-click last cell does not select document;
   - drag from table cell outside promotes to whole table;
   - Shift+arrow into table has no transient native selection flash;
   - nested table range selection.
5. Raw mobile table selection: deferred until real device/Appium proof is available.

Fast apply-pass gates:

```bash
cd /Users/zbeyens/git/plate-2
bun test ./packages/plite-history/test ./packages/plite/test/clipboard-contract.ts ./packages/plite/test/text-units-contract.ts
PLAYWRIGHT_RETRIES=0 bunx playwright test apps/plite/tests/plite-browser/donor/stress/generated-editing.test.ts --project=chromium -g '<new-family>'
pnpm check:plite:dev
```

Use `pnpm check:plite` only before release-quality browser closure.

## Full Inventory Appendix

The full appendix is too large for the main report and lives at [inventory.md](./inventory.md).

The runnable portable/mixed test-name index lives at [test-index.md](./test-index.md).
