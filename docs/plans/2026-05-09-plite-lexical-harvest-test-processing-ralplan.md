# Plite Lexical Harvest Test Processing Ralplan

status: done
score: 0.92
date: 2026-05-09
skill: `plite-ralplan`
input harvest: `docs/editor-test-harvester/lexical/report.md`
target repo: `/Users/zbeyens/git/plite`

## Current Verdict

The Lexical harvest is done, but the broader Lexical test processing is not.

The harvest report closed at `0.93` with 271 inventory rows, 137 portable or
portable-mixed runnable files, and 1996 indexed test names
(`docs/editor-test-harvester/lexical/report.md:3`,
`docs/editor-test-harvester/lexical/inventory.md:15`,
`docs/editor-test-harvester/lexical/test-index.md:7`). It also says the
selected implementation lane only covered IME/history, clipboard corpus,
browser transport, and table containment; everything else is backlog until a
new apply pass names it (`docs/editor-test-harvester/lexical/report.md:18`).

So the correct next move is not "copy all Lexical tests." That would be noisy
and wrong. The correct move is to process every Lexical source row into a Plite
owner ledger, then let `ralph` implement the rows that survive as portable
Plite behavior.

The first processing ledger now exists at
`docs/editor-test-harvester/lexical/slate-processing-ledger.md`. It accounts
for every portable and portable-mixed source file at file granularity. Related
issue discovery, issue-ledger sync, live-source refresh, pressure pass,
maintainer objection pass, high-risk pass, revision pass, final
issue-accounting review, and closure scoring are now complete. This ralplan is
ready for `ralph` execution.

Ralph execution update on 2026-05-09: the first package-only slice is complete.
Lexical #7163 now has explicit Plite text-unit distances plus real forward and
backward `unit: "character"` deletion proof in
`packages/plite/test/text-units-contract.ts`. The implementation
also removed the stale complex-script reverse-delete restoration in
`packages/plite/src/transforms-text/delete-text.ts`, so deletion now
uses the same text-unit boundary law as `getCharacterDistance`. The Thai
unit-character fixtures were updated to match that law. No browser, raw mobile,
table, collaboration, or issue claim changed.

Ralph execution update on 2026-05-09: clipboard HTML source-drill is complete.
The row-level decisions are recorded in
`docs/editor-test-harvester/lexical/slate-processing-ledger.md` under
`Clipboard HTML Row-Level Source Drill`. The accepted next code slice is
text-format HTML only: Google Docs-style BIU spans plus safe semantic `<b>`
handling if the first red row proves it. Links, lists, and table rows are
mapped but stay out of the next slice. No `Plate repo root` code, browser, raw
mobile, table-model, collaboration, or issue claim changed during source-drill.

Ralph execution update on 2026-05-09: paste-html text-format residual is
complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now
proves Google Docs BIU spans and standard semantic `<b>` paste. The parser fix
in `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` keeps Google Docs
`<b style="font-weight:normal">` wrappers non-bold, maps normal semantic `<b>`
to bold, and converts body-level inline strings into text nodes before wrapping
them in paragraphs. Focused Playwright proof and `Plate repo root` `bun check`
passed. No link, list, table, raw mobile, collaboration, table-model, or issue
claim changed.

Ralph execution update on 2026-05-09: paste-html simple anchor import residual
is complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts`
now proves `<a href="https://facebook.com">Facebook!</a>` imports as one safe
link in the paste-html example. Focused Playwright proof and `Plate repo root`
`bun check` passed. No parser change, list, table, paste-into-existing-link,
raw mobile, collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: paste-html noisy link-in-list residual is
complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now
proves a minimized Lexical #3193-style fixture keeps the leading block, two
list items, and a safe link inside the first list item. Focused Playwright proof
and `Plate repo root` `bun check` passed. No parser change, generic list claim,
table, paste-into-existing-link, raw mobile, collaboration, table-model, or
issue claim changed.

Ralph execution update on 2026-05-09: paste-html basic unordered-list import
residual is complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts`
now proves `<ul><li>Hello</li><li>world!</li></ul>` imports as one list with
two items. Focused Playwright proof and `Plate repo root` `bun check` passed. No
parser change, nested-list claim, table, paste-into-existing-link, raw mobile,
collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: paste-html compact nested-list import
residual is complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts`
now proves the three Lexical nested-list variants keep visible text and nested
list structure. The test resets the example between variants so proof does not
accidentally stack lists inside the previous paste. Focused Playwright proof and
`Plate repo root` `bun check` passed. No parser change, nested-div list claim,
table, paste-into-existing-link, raw mobile, collaboration, table-model, or
issue claim changed.

Ralph execution update on 2026-05-09: paste-html nested `div` list-boundary
residual is complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts`
now proves `<ol><li>1<div>2</div>3</li><li>A<div>B</div>C</li></ol>` keeps one
ordered list, two list items, and Plite paragraph boundaries for the nested
block content. `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` preserves
sibling-bounded `DIV` children inside `LI` as paragraph children. Focused
Playwright proof and `Plate repo root` `bun check` passed. No table,
paste-into-existing-link, raw mobile, collaboration, table-model, or issue
claim changed.

Ralph execution update on 2026-05-09: paste-html Google Docs table residual is
complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now
proves Google Docs-style table HTML imports one 2x3 table, keeps the
multi-paragraph second cell, and preserves `11pt` text styling. Existing
`apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` already handled the parser
shape, so no importer code changed. Focused Playwright proof and `Plate repo root`
`bun check` passed. No column-width, table-layout, table-model,
paste-into-existing-link, raw mobile, collaboration, or issue claim changed.

Ralph execution update on 2026-05-09: paste-html Quip table residual is
complete. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now
proves Quip-style 2x3 table HTML imports rows/cells and preserves `b<br>b` as
newline text content inside the second cell. Existing
`apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` already handled the parser
shape, so no importer code changed. Focused Playwright proof and `Plate repo root`
`bun check` passed. No column-width, table-layout, table-model,
paste-into-existing-link, raw mobile, collaboration, or issue claim changed.

Ralph execution update on 2026-05-09: DOM mutation repair residual is complete
for the accepted Plite owners. Source-read Lexical `Mutations.spec.mjs`: its
portable rows are native text-node mutation with selection clamp, and structural
DOM rollback. Current `richtext.test.ts` already covers browser text mutation,
selection, and repair traces. `packages/plite-react/test/dom-repair-policy-contract.ts`
now adds the missing structural restore-manager policy proof: child-list
mutations are rolled back, while character-data mutations stay available for
text sync. Focused package proof passed; `Plate repo root` `bun check` passed. No
desktop structural repair, raw Android device, raw mobile, collaboration,
table-model, or issue claim changed.

Ralph execution update on 2026-05-09: focus/autoscroll residual is complete for
accepted raw Plite behavior. Source-read Lexical `Focus.spec.mjs` and
`AutoScroll.spec.mjs`. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
now proves Plite keeps model selection when focus moves outside the editor and
keeps the caret visible while typing through line breaks in both a scrollable
editor root and scrollable parent. The first autoscroll proof failed because
Chrome returned a zero rect for an empty-line caret and
`defaultScrollSelectionIntoView` no-oped; `packages/plite-react/src/components/editable.tsx`
now falls back to scrolling the leaf rect. Focused Playwright proof passed. No
Lexical playground tab-out, raw mobile, collaboration, table-model, or issue
claim changed.

Ralph execution update on 2026-05-09: inline paste/mention/link/HR boundary
source-read is complete. `apps/www/tests/plite-browser/donor/examples/inlines.test.ts`
now proves plain-text and rich-HTML paste at inline-link boundaries stays
outside the link, and `packages/plite/test/clipboard-contract.ts`
now proves partial link fragment copy/paste preserves link attributes. Lexical
`Links.spec.mjs`, `Mentions.spec.mjs`, `HorizontalRule.spec.mjs`, and deferred
`LinksHTMLCopyAndPaste.spec.mjs` rows were split by owner: accepted raw link
boundary rows are applied, Plite markable-inline-void mention behavior is
already covered by existing mention/clipboard owners, editable Lexical mention
text and toolbar/autolink/link-image behavior are rejected as product policy,
paste-inside-link splitting is deferred to an explicit link-plugin policy, and
HR rows are deferred because this checkout has generic block-void proof but no
HR owner. Focused package proof, focused Playwright proof, `bun run lint:fix`,
and `Plate repo root` `bun check` passed. No raw mobile, collaboration,
table-model, or issue claim changed.

Ralph execution update on 2026-05-09: delete-character/selection-boundary
source-read is complete for the selected regression files. Lexical #1258 and
#1730 are already covered by Plite's unit-character delete fixtures. Lexical
#6974 is already covered by the existing inline-void reverse point-delete
fixture. Lexical #7246 is now locked by
`packages/plite/test/delete-contract.ts`, proving Backspace at a
following paragraph start merges into the previous list item. Lexical #7319 is
split: HR styling and Lexical NodeSelection classes stay rejected, while the
portable block-void behavior exposed a real gap. `packages/plite/src/transforms-text/delete-text.ts`
now treats a collapsed delete target inside an adjacent void/read-only element
as a path delete and keeps the fallback caret point through operation
transforming, so adjacent block voids delete one at a time. The regression lock
lives in `packages/plite/test/transforms/delete/voids-false/block-after-multiple-reverse.tsx`.
Focused delete contract, text-unit contract, full delete fixture sweep, lint,
and `Plate repo root` `bun check` passed. The reusable rule is captured in
`docs/solutions/logic-errors/2026-05-09-plite-adjacent-block-void-delete-must-path-delete-one-target.md`.
No browser, raw mobile, collaboration, table-model, HR owner, or issue claim
changed.

Ralph execution update on 2026-05-09: Navigation/Selection/LexicalSelection
source-read is complete for the selected files. Lexical `Navigation.spec.mjs`
maps mostly to existing Plite query contracts: offset, character, word, block,
inline-fragmentation, atomic void, non-selectable, and top-level boundary
traversal are already covered in
`packages/plite/test/query-contract.ts`. Lexical
`Selection.spec.mjs` is split: existing Plite browser/package owners already
cover no focus-on-load, triple-click block selection, table containment,
inline-boundary insertion, blurred-editor selection preservation, and package
line/unit delete behavior; whole-table range expansion, RTL decorator movement,
collapsible/date-time product nodes, and mark/style persistence stay deferred
to their own owners. The useful package gap was the selection-rebase invariant
from Lexical's selection helper/unit tests: when a selected leaf disappears,
the selection must land on the nearest surviving inline point. That proof now
lives in `packages/plite/test/selection-rebase-contract.ts`.
Focused package proof, `bun run lint:fix`, and `Plate repo root` `bun check`
passed. No browser, raw mobile, collaboration, table-model, product-decorator,
or issue claim changed.

Ralph execution update on 2026-05-09: LexicalCaret source-read is complete.
Lexical `LexicalCaret.test.ts` splits into five groups: caret object
construction/splice/remove internals, selection-to-caret-range conversion,
destructive range deletion, point ordering/common ancestor helpers, and
split-at-caret helpers. Plite already covers traversal/order behavior through
`packages/plite/test/query-contract.ts`, raw split operation rows in
`packages/plite/test/operations-contract.ts`, transform split rows
in `packages/plite/test/transforms-contract.ts`, and text-unit
movement in `packages/plite/test/text-units-contract.ts`. The useful
portable gap was the destructive caret-range edge matrix, so
`packages/plite/test/delete-contract.ts` now proves expanded range
deletion trims both sibling-leaf edges and cross-block edges before collapsing
at the anchor. Focused package proof, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. The reusable harvesting rule is captured in
`docs/solutions/best-practices/2026-05-09-lexical-caret-harvest-rows-need-range-edge-contracts.md`.

Ralph execution update on 2026-05-09: docs-traversals source-read is complete.
Lexical `docs-traversals.test.ts` splits into sibling iteration, root child
iteration, depth-first caret order, and "wholly included" range traversal.
Lexical caret enter/exit helpers are not Plite API, but the portable behavior
belongs in Plite's query contract. `packages/plite/test/query-contract.ts`
now proves sibling order, reverse child order, descendant depth-first paths,
lowest leaf range traversal, and lowest element range traversal for the same
nested inline document shape. Focused package proof, `bun run lint:fix`, and
`Plate repo root` `bun check` passed. No browser, raw mobile, collaboration,
table-model, or issue claim changed.
Lexical caret class internals, node-key mechanics, decorator payloads,
token/segmented modes, browser, raw mobile, collaboration, table-model, and
issue claims stayed out. The reusable harvesting rule is captured in
`docs/solutions/best-practices/2026-05-09-lexical-docs-traversal-harvest-rows-need-query-shape-contracts.md`.

Ralph execution update on 2026-05-09: LexicalElementNode source-read is
complete. The file splits into Lexical JSON schema, child/text query helpers,
splice/selection behavior, transform scheduling, DOM slot behavior, and DOM
`indexPath` helpers. The portable gap was query/text traversal, not Lexical
node lifecycle. `packages/plite/test/query-contract.ts` now proves
nested text-leaf traversal with `Node.texts`, first/last leaf lookup, and
`Node.string` text content for the same nested element family. Splice/selection
behavior routes to existing operation and selection owners; DOM slot, indexPath,
Lexical JSON schema, node-key, lifecycle, browser, raw mobile, collaboration,
table-model, and issue claims stayed out. Focused package proof, `bun run
lint:fix`, and `Plate repo root` `bun check` passed. The reusable harvesting rule
is captured in
`docs/solutions/best-practices/2026-05-09-lexical-element-node-harvest-rows-need-api-shape-splitting.md`.

Ralph execution update on 2026-05-09: LexicalLineBreakNode source-read is
complete. The file only has one portable behavior row: a line break contributes
newline text and renders as a break. Plite has no equivalent LineBreakNode
class, so Lexical type/schema/update/type-guard rows stay out. The accepted
behavior is already covered by the Quip paste-html browser row preserving
`b<br>b` as newline text, `ZeroWidthString` line-break placeholder proof,
structural `insertBreak` contracts, and Android newline-to-soft-break input
handling. No `Plate repo root` code or tests changed, and no browser, raw mobile,
collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalParagraphNode source-read is
complete. The file splits into Lexical node class/schema/DOM helper rows,
paragraph split/insert behavior, and paragraph DOM import alignment. Plite's
existing insert-break, split/merge, and normalization owners already cover the
accepted split/merge behavior, so the useful gap was paste-html import:
`apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now proves
legacy `align`, CSS `text-align` precedence, and invalid align rejection.
`apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` imports valid paragraph
alignment and `apps/www/src/app/(app)/examples/plite/_examples/paste-html.tsx` renders the existing
`align` field. The red browser proof first failed on missing alignment, then
passed after the importer/rendering change. Focused Playwright proof,
`Plate repo root` `bun run lint:fix`, and `Plate repo root` `bun check` passed. No raw
mobile, collaboration, table-model, or issue claim changed. The reusable
harvesting rule is captured in
`docs/solutions/best-practices/2026-05-09-lexical-paragraph-node-harvest-rows-need-dom-import-splitting.md`.

Ralph execution update on 2026-05-09: LexicalRootNode source-read is complete.
The file splits into Lexical root node API/schema/DOM helper rows, cached root
text implementation rows, root normalization/string behavior, and root-child
selection repair. Plite has no root selection point and `Editor.string` is
explicitly block-separator-free, so Lexical cached-text/decorator/root API rows
stay out. Existing root normalization/top-level cleanup and string owners cover
the Plite root behavior. The useful gap was selected top-level child removal:
`packages/plite/test/selection-rebase-contract.ts` now proves
removing the selected first block rebases selection to the next surviving block,
and removing the selected only block clears selection. Focused package proof
passed, followed by `Plate repo root` `bun run lint:fix`, `Plate repo root` `bun
check`, and `plate-2` `pnpm lint:fix`. No browser, raw mobile, collaboration,
table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalTextNode source-read is complete.
The file splits into Lexical text node schema/mode/detail/style internals,
format helper flags, selection helpers, split/merge behavior, DOM
create/update/export rendering policy, and composition-key/node-state internals.
Plite already has owners for text-unit deletion, compatible text normalization,
mark add/remove/toggle, and rich HTML mark import. The useful gap was raw text
operation selection repair: `packages/plite/test/operations-contract.ts`
now proves `split_node` rebases an expanded selection across split text branches,
and `merge_node` rebases selection into the surviving text branch. Focused
package proof passed, followed by `Plate repo root` `bun run lint:fix`,
`Plate repo root` `bun check`, and `plate-2` `pnpm lint:fix`. Lexical JSON schema,
node-key, mode/detail/style, DOM rendering, node-state, and composition-key rows
stay out. No browser, raw mobile, collaboration, table-model, or issue claim
changed.

## Intent And Boundary

Intent: turn the completed Lexical harvest into an execution-grade Plite
test-processing plan that accounts for every harvested source row.

Desired outcome:

- every portable and portable-mixed Lexical source file has a Plite processing
  status;
- every copied/refactored/created row points at a current Plite owner;
- every rejected/deferred row has a concrete reason;
- selected implementation slices are small enough for repeated `ralph` runs;
- issue claims stay honest.

In scope:

- Lexical harvest artifacts under `docs/editor-test-harvester/lexical/`;
- current Plite package, browser, and Playwright proof owners;
- portable editor behavior: IME, clipboard, input transport, DOM selection,
  table containment, code/list/markdown/html units, history, undo, focus,
  scroll, grapheme/delete semantics, inline atoms, and collaboration substrate;
- issue accounting when a planned row touches an existing Plite issue cluster.

Non-goals:

- porting Lexical node classes, command registry, Composer/plugin identity,
  private MIME format, playground product chrome, ESLint tooling, release
  fixtures, or framework shell behavior;
- pretending desktop Playwright mobile viewports prove raw mobile/IME device
  behavior;
- silently turning raw Plite into Lexical's whole-table selection model;
- creating 1996 one-off tests.

Decision boundaries:

- Group upstream tests by invariant family, not by upstream file shape.
- Prefer strengthening existing Plite tests when they already own the behavior.
- Create new tests only when the invariant has no honest Plite proof.
- Defer raw-device, whole-table selection, and yjs browser rows unless a later
  plan explicitly accepts those capabilities.

## Decision Brief

Principles:

1. Preserve portable behavior, not Lexical architecture.
2. Keep Plite raw and unopinionated.
3. Proof has to match the behavior: browser rows for browser transport, unit
   rows for model invariants, raw device rows for raw mobile claims.
4. DRY wins over test-count vanity.
5. Issue claims require exact repro proof, not vibes.

Top drivers:

- The harvest has enough breadth to drown implementation if copied literally.
- Plite already absorbed the highest-value rows in selected apply slices.
- Remaining rows span different owners and need separate proof gates.

Options:

| Option                                           | Verdict | Reason                                                                                                        |
| ------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| Port every Lexical test one-for-one              | reject  | Most rows encode Lexical internals, app shell, or duplicate behavior. It would make Plite harder to maintain. |
| Treat the selected apply lane as complete enough | reject  | The user explicitly asked to process all Lexical tests, and the report still marks broader rows as backlog.   |
| Build a source-row processing ledger first       | choose  | It accounts for all rows, keeps skips honest, and gives `ralph` runnable slices.                              |
| Force raw mobile/table/yjs closure now           | reject  | Current proof owners do not support those claims without device/model/collab lanes.                           |

Chosen shape: create a Lexical-to-Plite processing ledger, then execute by
behavior family.

Consequences:

- This plan stays `pending` until the ledger exists and follow-up passes finish.
- Some Lexical rows will be rejected forever. That is healthy.
- Whole-table selection remains a table-model decision, not a hidden side
  effect of DOM-selection work.

## Current Source Read

Harvest facts:

- `docs/editor-test-harvester/lexical/report.md:3` says the harvest is `done`.
- `docs/editor-test-harvester/lexical/report.md:4` scores it `0.93`.
- `docs/editor-test-harvester/lexical/inventory.md:15` records 271 total rows,
  196 runnable rows, 124 portable rows, 13 portable-mixed rows, 33
  product-shell rows, 12 harness rows, 89 skipped rows, and 0 uncertain rows.
- `docs/editor-test-harvester/lexical/test-index.md:7` records 137 indexed
  portable/portable-mixed runnable files.
- `docs/editor-test-harvester/lexical/test-index.md:8` records 1996 extracted
  test/describe/it names.
- `docs/editor-test-harvester/lexical/report.md:159` starts the selected apply
  ledger; this is not global Lexical closure.

Current Plite proof owners found in live source:

| Behavior                        | Current owner                                                                                                                                                                                                                       | Current status                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| IME through browser runtime     | `apps/www/tests/plite-browser/donor/examples/rendering-strategy-runtime.test.ts:1274`, `apps/www/tests/plite-browser/donor/examples/richtext.test.ts:291`, `apps/www/tests/plite-browser/donor/examples/mentions.test.ts:244` | strong existing/apply coverage                         |
| IME inline-void and undo stress | `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts:1114`, `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts:1169`                                                                                                  | selected apply lane covered                            |
| Composition history             | `packages/plite-history/test/history-contract.ts:286`                                                                                                                                                                 | selected apply lane covered                            |
| Browser insert transport        | `apps/www/tests/plite-browser/donor/examples/plaintext.test.ts:23`                                                                                                                                                                | selected apply lane covered                            |
| Synthetic paste compatibility   | `apps/www/tests/plite-browser/donor/examples/plaintext.test.ts:45`                                                                                                                                                                | selected apply lane covered; Firefox skip is honest    |
| Google Docs font-size paste     | `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts:142`                                                                                                                                                              | selected apply lane covered                            |
| Google Sheets table paste       | `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts:174`                                                                                                                                                              | selected apply lane covered                            |
| Table triple-click containment  | `apps/www/tests/plite-browser/donor/examples/tables.test.ts:129`                                                                                                                                                                  | selected apply lane covered                            |
| Table drag containment          | `apps/www/tests/plite-browser/donor/examples/tables.test.ts:146`                                                                                                                                                                  | selected apply lane covered; not whole-table selection |
| DOM coverage IME                | `apps/www/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts:248`                                                                                                                                                 | useful proof owner                                     |

Live-source refresh added on 2026-05-09:

| Family                 | Live owner read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Current shape                                                                                                                                                                                                     | Processing decision                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text units and delete  | `packages/plite/test/text-units-contract.ts:7`, `packages/plite/test/text-units-contract.ts:14`, `packages/plite/test/text-units-contract.ts:33`; existing `transforms/delete/unit-character` fixtures found in the live test tree; Lexical source `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs:25`                                                                                                                                                            | Plite has basic grapheme, RTL, word, punctuation, and keycap contracts plus many delete fixtures, but not the full Lexical #7163 destructive matrix in one clear owner.                                           | First apply slice. Refactor the existing text-unit owner and add only missing portable matrix rows. Start package-only; add browser proof only if the package matrix exposes a browser-specific gap. |
| Clipboard and paste    | `packages/plite/test/clipboard-contract.ts:117`, `packages/plite/test/clipboard-contract.ts:163`, `packages/plite/test/clipboard-contract.ts:324`, `packages/plite/test/clipboard-contract.ts:411`, `packages/plite-dom/test/clipboard-boundary.ts:623`, `packages/plite-dom/test/clipboard-boundary.ts:796`, `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts:142`, `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts:174` | Current package and DOM tests already cover rich fragments, list fragments, inline void copy/paste, multiline plaintext, and undo batching. Browser paste has Google Docs font-size and Google Sheets table rows. | Second apply slice. Do not duplicate current coverage. Add focused browser HTML residuals only: links, lists, text-format HTML, and Google Docs table if distinct from Sheets.                       |
| DOM mutation repair    | `packages/plite-react/test/dom-repair-policy-contract.ts:9`, `packages/plite-react/test/dom-repair-policy-contract.ts:22`, `apps/www/tests/plite-browser/donor/examples/richtext.test.ts:247`, `apps/www/tests/plite-browser/donor/examples/richtext.test.ts:1876`, `apps/www/tests/plite-browser/donor/examples/richtext.test.ts:3267`; Lexical source `../lexical/packages/lexical-playground/__tests__/e2e/Mutations.spec.mjs:53`                                                                           | Unit policy exists and richtext browser rows already exercise DOM mutation, browser editing state, and selection repair.                                                                                          | Downgrade from `create-new` to `refactor-existing`. Strengthen `richtext` or stress coverage only after pressure pass confirms a missing invariant.                                                  |
| IME and input          | `packages/plite-react/test/model-input-strategy-contract.test.ts:71`, `packages/plite-react/test/model-input-strategy-contract.test.ts:137`, `packages/plite-react/test/model-input-strategy-contract.test.ts:189`, `apps/www/tests/plite-browser/donor/examples/mentions.test.ts:205`, `apps/www/tests/plite-browser/donor/examples/mentions.test.ts:244`, `packages/plite-history/test/history-contract.ts:259`                                                                    | Android replacement, custom Enter, empty/backspace policy, mention IME, and composition history are already covered.                                                                                              | Treat high-value IME rows as already applied or proof-route. Raw WebKit/mobile rows stay deferred.                                                                                                   |
| Focus and scroll       | `apps/www/tests/plite-browser/donor/examples/placeholder.test.ts:44`, `apps/www/tests/plite-browser/donor/examples/placeholder.test.ts:80`, `apps/www/tests/plite-browser/donor/examples/huge-document.test.ts:7`; Lexical sources `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:17`, `../lexical/packages/lexical-playground/__tests__/e2e/Focus.spec.mjs:20`                                                                                                                                                 | Placeholder IME/focus proof exists and huge document renders, but caret autoscroll and tab/outside-selection persistence are not directly proven.                                                                 | Later browser slice. Create focused rows only after the pressure pass separates raw editor behavior from app scroll policy.                                                                          |
| Inline atoms and links | `apps/www/tests/plite-browser/donor/examples/inlines.test.ts:34`, `apps/www/tests/plite-browser/donor/examples/inlines.test.ts:65`, `apps/www/tests/plite-browser/donor/examples/inlines.test.ts:134`, `apps/www/tests/plite-browser/donor/examples/inlines.test.ts:189`, `apps/www/tests/plite-browser/donor/examples/inlines.test.ts:233`, `apps/www/tests/plite-browser/donor/examples/mentions.test.ts:337`, `packages/plite-dom/test/clipboard-boundary.ts:796`                                                   | Inline edit, caret, empty inline removal, read-only inline navigation, inline cut, mention navigation, and inline void clipboard proof are strong.                                                                | Later refactor-existing slice. Paste-over-link/mention residuals need exact raw invariant rows, not product-shell link toolbar behavior.                                                             |
| Tables                 | `apps/www/tests/plite-browser/donor/examples/tables.test.ts:19`, `apps/www/tests/plite-browser/donor/examples/tables.test.ts:79`, `apps/www/tests/plite-browser/donor/examples/tables.test.ts:129`, `apps/www/tests/plite-browser/donor/examples/tables.test.ts:146`, `apps/www/tests/plite-browser/donor/examples/tables.test.ts:181`, `apps/www/tests/plite-browser/donor/examples/tables.test.ts:197`                                                                                                                             | Backspace/delete containment, last-cell navigation, triple-click containment, drag containment, Enter, and empty-cell navigation are already covered.                                                             | Keep table rows as containment proof. Defer whole-table, merged-cell, and multi-cell model rows.                                                                                                     |
| Collaboration          | `packages/plite/test/collab-history-runtime-contract.ts:29`, `packages/plite/test/collab-history-runtime-contract.ts:114`, `packages/plite/test/collab-history-runtime-contract.ts:155`, `packages/plite/test/collab-history-runtime-contract.ts:200`                                                                                                                                                                                                                                    | Collaboration/history substrate proof exists at package level.                                                                                                                                                    | Defer browser/yjs rows until a real browser collaboration owner exists.                                                                                                                              |

Issue ledger facts:

- `docs/plite/ledgers/issue-coverage-matrix.md:229` keeps #2558
  `Not claimed` because whole-table/multi-cell selection needs a table
  selection model.
- `docs/plite/ledgers/fork-issue-dossier.md:6182` has the #2558 dossier
  section, also not claimed.

## Source-Backed North Star

Plite should use Lexical as a test corpus, not as an architecture donor.

The architecture target is a raw editor with small behavior contracts:

- model invariants in package tests;
- browser transport in Playwright examples/stress rows;
- native IME/paste/selection proof where the browser is the bug;
- issue claims only where the original user-facing bug is actually proven.

## Ecosystem Strategy Synthesis

| Source                     | Mechanism observed                                   | Plite target                                                                            | Steal                                                | Reject                                                                         | Verdict |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | ------- |
| Lexical harvest report     | issue-shaped browser rows and explicit skip families | use browser rows for IME, clipboard, input, table containment, DOM repair, focus/scroll | test topology and corpus breadth                     | node classes, Composer identity, command registry, private MIME, product shell | agree   |
| Lexical clipboard corpus   | external-app HTML paste fixtures grouped by source   | expand Plite paste-html and clipboard contracts by external source family               | Google Docs/Sheets/Word/list/link/table corpus shape | Lexical-specific MIME roundtrip as public requirement                          | partial |
| Lexical table tests        | cell/range/whole-table selection model               | keep containment proof; split whole-table model into separate table lane                | triple-click and containment pressure                | hidden whole-table selection semantics in raw Plite                            | tension |
| Lexical mobile table rows  | mouse/touch behavior split                           | defer until raw-device proof exists                                                     | device honesty                                       | Playwright viewport as raw mobile proof                                        | agree   |
| Lexical package unit tests | dense model invariant matrices                       | convert to Plite-owned unit invariants when portable                                    | code/list/html/selection/history invariant breadth   | Lexical node lifecycle APIs                                                    | partial |

## Lexical Inventory Processing Plan

Process the full inventory into `docs/editor-test-harvester/lexical/slate-processing-ledger.md`.

Statuses allowed in that ledger:

- `already-applied`: selected apply lane already added or strengthened Plite
  proof;
- `covered`: current Plite already has a good proof row;
- `refactor-existing`: strengthen, rename, or split an existing Plite row;
- `create-new`: add a new Plite unit/browser row;
- `defer`: valid behavior, but needs raw device, yjs browser, or table-model
  infrastructure;
- `reject`: non-portable, product-shell, harness-only, or Lexical-internal row.

Family accounting from the harvest inventory:

| Family                                     | Rows | Processing lane                                                   |
| ------------------------------------------ | ---: | ----------------------------------------------------------------- |
| `portable editor behavior`                 |   39 | core model, selection, transform, history, and browser split      |
| `serialization-parsing / marks-inline`     |   20 | list/markdown/html/richtext unit and browser rows                 |
| `selection-dom-mapping / void-atom`        |   19 | DOM selection, inline atoms, caret, mention/link/void boundaries  |
| `core package behavior`                    |   16 | Plite package unit contracts; reject Lexical lifecycle-only cases |
| `clipboard-paste / browser-engine`         |   14 | clipboard contracts and paste-html browser corpus                 |
| `tables-grid / selection-dom-mapping`      |   10 | containment now; table-model rows separate                        |
| `mixed portable invariant`                 |    9 | split useful raw invariant from product plugin behavior           |
| `beforeinput-input / browser-engine`       |    7 | model-input strategy and Playwright input transport rows          |
| `ime-composition / history-undo-redo`      |    2 | mostly applied; verify no unprocessed named row remains           |
| `collaboration-remote / history-undo-redo` |    1 | substrate covered; yjs browser deferred                           |
| `harness`                                  |   12 | technique only, no direct Plite behavior row                      |
| `product-shell`                            |   33 | reject unless a raw invariant is split out                        |
| `skip`                                     |   89 | reject with preserved reasons                                     |

## Pressure Pass Results

The pressure pass keeps the plan conservative. It does not add issue claims and
does not edit `Plate repo root`.

| Lane                                 | Pressure verdict              | Reason                                                                                                                                                                                                                                                                                | Ralph readiness                                                                                                                                                                                                                            |
| ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Text-unit/delete package parity      | keep first                    | Lexical #7163 has a dense portable Unicode matrix, current Plite has a clear owner in `text-units-contract.ts`, and package proof avoids browser flake/build cost. Existing delete fixtures are broad but scattered, so a compact contract row adds value without architecture churn. | Ready after objection pass. Owner: `packages/plite/test/text-units-contract.ts`; verification: `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts` plus targeted unit-character fixtures if touched. |
| Clipboard HTML residual              | keep second, narrower         | Current Plite already covers rich fragments, inline void copy/paste, multiline plaintext, Google Docs font-size, Google Sheets table, and generated paste gauntlets. Blindly porting Lexical link/list files would duplicate coverage and import product toolbar policy.              | Not first. Next `ralph` slice must source-drill exact link/list/text-format rows and add only raw parser/browser corpus gaps.                                                                                                              |
| DOM mutation repair                  | refactor existing             | `richtext.test.ts` already syncs browser text mutations inside bold markup and records selectionchange/repair kernel results. A new standalone owner would be duplicate unless Lexical `Mutations.spec.mjs` exposes a missing assertion.                                              | Not create-new. Strengthen `richtext.test.ts`, generated stress, or the slate-react policy contract only after naming the missing invariant.                                                                                               |
| Focus/autoscroll                     | keep later browser slice      | Placeholder focus/IME exists and huge-document only proves visibility. Lexical AutoScroll/Focus rows are valuable, but they mix raw editor behavior with app scroll/focus policy.                                                                                                     | Later create/refactor slice. Needs browser proof and must not claim raw mobile.                                                                                                                                                            |
| Inline atom/link paste               | applied for accepted raw rows | Plite has strong inlines and mentions coverage. Source-read confirmed the portable raw rows are boundary copy/paste and partial-link fragment preservation; paste-inside-link splitting is link-plugin policy, not a generic core law.                                                | Applied against `inlines.test.ts` and `clipboard-contract.ts`. HR remains deferred to a future HR/block-void owner.                                                                                                                        |
| Tables                               | keep deferred                 | Current table tests prove containment, triple-click, drag, Enter, and cell navigation. Whole-table, merged-cell, and multi-cell behavior remain model decisions.                                                                                                                      | Not a `ralph` target for this plan unless the table model is explicitly accepted.                                                                                                                                                          |
| Raw mobile and collaboration browser | keep deferred                 | Desktop/mobile viewport proof cannot satisfy raw device rows, and current collaboration proof is package substrate only.                                                                                                                                                              | Needs separate raw-device or slate-yjs/browser owner.                                                                                                                                                                                      |

Performance-oracle pressure:

- The first text-unit slice is package-only and has no hot browser/render path;
  no benchmark is required before a focused unit `ralph`.
- Clipboard large-paste, autoscroll, huge-document, and many-inline rows need
  measured browser or benchmark proof before any performance claim.
- Browser Playwright rows that build the Plite site must run sequentially;
  do not parallelize site-backed Playwright commands.

DX and migration pressure:

- No public API change is accepted. If implementation finds an API gap, stop and
  update this Ralplan first.
- Keep raw Plite behavior as the target. Plate and slate-yjs benefit from the
  substrate; they do not justify importing Lexical plugin architecture.

Regression pressure:

- Every accepted `create-new` or `refactor-existing` row needs a focused failing
  row first when feasible.
- Browser-only behavior needs browser proof. Unit passing is not enough for
  clipboard transport, focus/autoscroll, DOM mutation import, IME, raw mobile,
  or table selection claims.

## Maintainer Objection Ledger

| Decision                                           | Strongest fair objection                                                                                                                                         | Steelman antithesis                                                                                             | Accepted revision                                                                                                                                                                                                          | Proof required                                                                                                                                  | Verdict |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Start `ralph` with text-unit/delete package parity | This can look like test-count vanity. Plite already has grapheme and delete fixtures, so adding a Unicode matrix could be busywork.                              | Do nothing until a user-facing delete bug appears; broad Unicode matrices can fossilize implementation details. | Keep the slice, but cap it to the missing Lexical #7163 cases and existing `getCharacterDistance` / delete behavior. No browser row unless package proof exposes a browser-only gap.                                       | `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts`; add targeted unit-character fixture commands only if touched.      | keep    |
| Put clipboard HTML residual second                 | The words "links/lists/text-format" are still too broad. One `ralph` could sprawl across parser policy, example app behavior, lists, links, and tables.          | Drop clipboard until exact source rows are drilled, because current Plite paste coverage is already broad.      | Keep as second lane, not next implementation. Before code, require a source-drill slice that names exact Lexical rows, expected Plite value/DOM output, and whether each row is raw parser behavior or example app policy. | Focused `paste-html.test.ts` grep plus `clipboard-boundary.ts` only for parser/DOM contract gaps; sequential Playwright for browser rows.       | revise  |
| Keep DOM mutation repair as `refactor-existing`    | Lexical `Mutations.spec.mjs` could expose a stricter external DOM import invariant than Plite's current richtext row. Calling it refactor-only might hide a gap. | Create a new standalone mutation suite so the invariant is visible and not buried in richtext.                  | Keep refactor-existing, but require the next owner to name the missing assertion before changing code. If it is not missing from `richtext.test.ts` or generated stress, drop the row as covered.                          | Existing owner check against `richtext.test.ts` and `dom-repair-policy-contract.ts`; add Playwright only for a named missing browser invariant. | keep    |
| Defer focus/autoscroll to a later browser slice    | This can become permanent backlog. Lexical has direct AutoScroll and Focus rows, while Plite huge-document only proves visibility.                               | Promote focus/autoscroll immediately because users feel scroll and focus bugs hard.                             | Keep later, but split it from IME/input and from app layout. The accepted row must prove caret visibility or tab/outside focus ownership in a raw Plite example, not product shell behavior.                               | Browser proof in the relevant example/stress owner; no raw mobile claim.                                                                        | revise  |
| Keep inline atom/link paste later                  | Inline paste/delete is user-facing and often fragile. Deferring it risks losing high-value regression coverage.                                                  | Move inline atom/link paste ahead of clipboard or DOM mutation.                                                 | Keep later because current `inlines`, `mentions`, and inline void clipboard coverage is strong. The next pass must split paste-over-link/mention from product toolbar/autolink behavior before implementation.             | Focused rows against `inlines.test.ts`, `mentions.test.ts`, and clipboard owner.                                                                | keep    |
| Defer table model rows                             | This looks like dodging table bugs. Lexical has table selection coverage and Plite has old table issue pressure.                                                 | Accept a table selection model now and port the table rows.                                                     | Keep defer. Current Plite rows prove containment and navigation, not whole-table, merged-cell, or multi-cell model behavior. Any table model work needs a separate plan and issue claim sync.                              | Do not promote #2558-like claims without an explicit table model plus browser proof.                                                            | keep    |
| Defer raw mobile rows                              | The harvest was partly about mobile/IME; deferring raw mobile can look like a loophole.                                                                          | Use Playwright mobile viewports as good enough smoke and move on.                                               | Keep defer. Viewport proof is not raw device proof. Mobile rows need the raw-device/Appium lane named in the plan.                                                                                                         | `PLITE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw` in `Plate repo root` for raw device claims.                                | keep    |
| Defer collaboration browser rows                   | Package substrate proof may not catch real collaborative browser failures.                                                                                       | Create slate-yjs browser rows before any release confidence.                                                    | Keep defer for this Lexical-processing plan. Collaboration browser parity needs a real slate-yjs/browser owner, not opportunistic test copying from Lexical.                                                               | Dedicated collaboration browser owner plus substrate commands before any claim.                                                                 | keep    |

Accepted maintainer revisions:

- Clipboard residual cannot be implemented as one broad grab bag. It needs a
  source-drill slice before code.
- Focus/autoscroll must prove raw editor behavior, not product shell layout.
- DOM mutation repair stays refactor-only, but only if the next owner first
  checks whether `richtext` or generated stress already covers the invariant.
- Table, raw mobile, and collaboration browser deferrals are explicit non-claims.

## High-Risk Gate

High-risk trigger: the plan routes external editor tests into Plite behavior
work across browser transport, destructive delete, clipboard, table selection,
mobile/IME, collaboration, issue claims, and release gates. The main risk is
false confidence: a unit row, ledger row, or planning command could be mistaken
for browser, device, or issue-fix proof.

Blast radius:

| Surface                                          | Blast radius                                                                                                                           | Guard                                                                                                                                                                                                      |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text-unit/delete package parity                  | `packages/plite/test/text-units-contract.ts` and possibly focused delete fixtures; user-facing delete/grapheme behavior. | First `ralph` slice may start from focused package proof. It makes no browser, mobile, table, or issue claim. Broad `Plate repo root` `bun check` is required after implementation before execution closure. |
| Clipboard HTML source-drill and residuals        | `plite-dom` clipboard contracts, `paste-html` browser rows, parser output, external-app paste behavior, and issue-claim pressure.      | Source-drill comes before code. No ClawSweeper sync is needed before source-drill if no claim changes. Later code needs focused package/browser proof and issue sync only for exact promoted claims.       |
| DOM mutation, focus/autoscroll, inline atom rows | Browser-only behavior, DOM authority, native selection/focus ownership, and example/stress test stability.                             | Browser rows cannot be closed by package tests. Add or refactor Playwright rows only after naming the missing invariant.                                                                                   |
| Table, raw mobile, collaboration browser         | User-visible but currently not accepted by this plan as closure targets.                                                               | Keep as explicit non-claims. #2558 is not claimed; raw mobile requires the raw-device/Appium gate; collaboration browser needs a real slate-yjs/browser owner.                                             |
| Planning and verification gates                  | `plate-2` completion files, Plite commands, PR/issue wording, and future `ralph` prompts.                                           | `plate-2` completion-check proves planning state only. Any Plite behavior claim must cite a command run from `Plate repo root`.                                                                           |

Three-scenario pre-mortem:

| Scenario     | Failure mode                                                                                                          | Guard                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| False proof  | A package unit row is used to close browser paste, IME, focus, raw mobile, or table-selection behavior.               | Proof-type ownership is explicit in this plan: browser rows require Playwright, raw mobile requires raw-device proof, and package rows stay model-only.                 |
| Scope sprawl | Clipboard residual turns into a broad paste rewrite across parser policy, example behavior, lists, links, and tables. | Phase 2 is source-drill only. Code is allowed only after exact Lexical rows, expected Plite value/DOM output, and raw-parser versus example-policy ownership are named. |
| Claim drift  | "Lexical tests processed" becomes an implied table/mobile/collaboration or issue-fix claim.                           | Non-claims are repeated in the plan, checkpoint, and continuation prompt. ClawSweeper reruns only when the issue surface changes materially.                            |

Expanded proof plan:

| Lane                                   | Unit/package proof                                                                                                             | Browser/device proof                                                                        | Ledger/claim gate                                                                                                | Closure gate                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Text-unit/delete                       | `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts`; targeted delete fixture commands only if touched. | None unless implementation exposes a browser-only gap.                                      | No issue promotion from the first slice unless exact repro and proof are added.                                  | `cd Plate repo root && bun check` after implementation before execution closure.    |
| Clipboard source-drill                 | No code gate; source-drill is a planning/research slice. Later parser work uses `clipboard-boundary.ts`.                       | Later browser work uses focused `paste-html` greps run sequentially.                        | No sync before source-drill if claims stay unchanged; sync required if later rows claim or improve exact issues. | Focused package/browser proof plus `bun check` before execution closure.          |
| DOM mutation/focus/inline browser rows | Unit contracts can support policy only; they do not close browser behavior.                                                    | Focused Playwright rows in the owning example/stress file.                                  | Promote no DOM/focus/inline issue without exact repro parity.                                                    | Browser proof and `bun check`; `bun check:full` only for release/browser closure. |
| Table model                            | Current containment rows remain useful package/browser evidence.                                                               | Existing table Playwright rows are containment proof only.                                  | #2558 and whole-table/multi-cell selection stay not claimed.                                                     | Separate table-model plan before any table-selection claim.                       |
| Raw mobile                             | None.                                                                                                                          | `cd Plate repo root && PLITE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw`. | No viewport row can satisfy raw device claims.                                                                   | Raw-device artifact required.                                                     |
| Collaboration browser                  | Existing package substrate proof only.                                                                                         | Dedicated slate-yjs/browser owner required.                                                 | No collaboration issue closure from package substrate alone.                                                     | Separate collaboration browser plan and proof.                                    |

High-risk verdicts:

| Question                                                                                      | Verdict                      | Reason                                                                                                                                                             |
| --------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Are browser-only rows split enough to avoid false proof from unit tests?                      | yes, with guard              | The plan now names proof owners by behavior type and rejects unit-only closure for browser/device rows.                                                            |
| Are table, raw mobile, and collaboration non-claims protected in every handoff surface?       | yes after this pass          | The plan, checkpoint, and continuation prompt all restate them.                                                                                                    |
| Does clipboard source-drill need issue-ledger sync before implementation?                     | no, if claims stay unchanged | Source-drill changes understanding, not Plite behavior or issue claims. Sync becomes mandatory when exact claims change.                                           |
| Does the first text-unit slice need broad `Plate repo root` verification before `ralph` starts? | no                           | Focused package proof is enough to start. Broad `bun check` belongs after implementation before execution closure.                                                 |
| Does ClawSweeper need another pass before closure if no issue claims changed?                 | no                           | ClawSweeper reruns when public behavior, issue claims, or the related surface changes materially. Zero claim changes means final accounting can be a no-op review. |

Keep/revise/drop verdict: keep the plan, with proof-type guards. The plan stays
`pending` until closure score and final gates are recorded.

## Revision Pass Results

Revision verdict: the plan is execution-grade for the first `ralph` slice, but
not globally done. The revision pass kept the high-risk guards and moved them
into the implementation-facing parts of the plan so the future handoff is not
just "read the whole essay and infer the contract."

Ralph-ready slices:

| Order | Slice                                | Allowed work                                                                                                    | Forbidden work                                                                                     | Required proof                                                                                                                                                                      |
| ----- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Text-unit/delete package parity      | Add only missing portable Lexical #7163 destructive Unicode rows to the existing Plite text-unit/delete owners. | No browser, raw mobile, table, collaboration, or issue claim. No broad rewrite of delete behavior. | `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts`; targeted delete fixture commands if touched; `cd Plate repo root && bun check` before execution closure. |
| 2     | Clipboard HTML source-drill          | Read exact Lexical link/list/text-format/table rows and map each to expected Plite value/DOM output plus owner. | No `Plate repo root` code change. No ClawSweeper rerun if claims stay unchanged.                     | Planning artifact only; later code needs `clipboard-boundary.ts` and focused sequential `paste-html` browser proof.                                                                 |
| 3     | Clipboard residual implementation    | Add only named parser/browser gaps from the source-drill.                                                       | No product toolbar/autolink behavior and no duplicate rows already covered by current Plite tests. | Focused package/browser proof, then `bun check`; issue sync only if exact claims change.                                                                                            |
| 4     | DOM mutation/focus/inline residuals  | Strengthen existing browser or policy owners after naming a missing invariant.                                  | No unit-only closure of browser behavior. No raw mobile claim.                                     | Focused Playwright owner plus package policy proof where relevant.                                                                                                                  |
| 5     | Table/raw mobile/collaboration lanes | Separate future plans only.                                                                                     | No hidden whole-table selection, raw-device, or slate-yjs/browser claim in this plan.              | Table model, raw-device, or collaboration-browser proof owner must exist first.                                                                                                     |

Stale-wording audit:

| Surface               | Result    | Revision                                                                                   |
| --------------------- | --------- | ------------------------------------------------------------------------------------------ |
| Raw mobile            | Protected | All accepted rows say viewport/mobile simulation is not raw-device proof.                  |
| Whole-table selection | Protected | #2558 and whole-table/multi-cell selection remain not claimed without a table model.       |
| Collaboration browser | Protected | Current package substrate proof is not treated as yjs/browser closure.                     |
| Issue claims          | Protected | The plan still records `0` new exact `Fixes #...` or `Improves #...` claims.               |
| Browser-only behavior | Protected | Package tests are model proof only; browser behavior needs Playwright or raw-device proof. |

Final issue-accounting review can be a no-op if the next pass confirms:

- the revision pass changed no fixed/improved issue claim;
- no PR reference count changed after revision;
- no related issue classification changed after revision;
- #2558, raw mobile rows, and collaboration browser rows remain non-claims.

Score dimensions prepared for closure:

| Dimension                      | Score | Reason                                                                                                  |
| ------------------------------ | ----: | ------------------------------------------------------------------------------------------------------- |
| Harvest and ledger accounting  |  0.95 | All portable and portable-mixed source files are routed in the processing ledger.                       |
| Issue honesty                  |  0.94 | Related surfaces are classified and no new fixed/improved claim is made.                                |
| Proof ownership                |  0.93 | Package, browser, raw-device, table-model, collaboration, and planning proof are split.                 |
| Implementation slice readiness |  0.91 | First `ralph` slice is narrow and has exact owner/commands; later slices stay gated.                    |
| Non-claim protection           |  0.94 | Raw mobile, whole-table selection, and collaboration browser are repeated as non-claims.                |
| Maintainability                |  0.90 | DRY/refactor-existing is preferred over copied test sprawl; clipboard source-drill prevents a grab bag. |

Prepared closure score: `0.92`. No dimension is below `0.85`.

## Final Issue-Accounting Review

Verdict: no-op sync. The revision pass changed execution wording and proof
gates only. It did not change issue claims, PR reference counts, or related
classifications.

Evidence checked:

| Check                         | Evidence                                                                                                                                                                                      | Verdict   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Fixed/improved issue claims   | The plan still says `0` new exact `Fixes #...` or `Improves #...` claims; the PR reference still lists fixed issue claims at `31`.                                                            | unchanged |
| PR reference count            | `docs/plite/references/pr-description.md` still records fixed issue claims `31`, related matrix rows `158`, and Lexical harvest exact claims `0`.                                          | unchanged |
| Related issue classifications | `docs/plite/ledgers/issue-coverage-matrix.md` keeps #5894 `Not claimed`, #4730 `Related`, #3387 `Related`, #3872 `Related`, #4716 `Related`, #5355 `Not claimed`, and #2558 `Not claimed`. | unchanged |
| Fork dossier statuses         | `docs/plite/ledgers/fork-issue-dossier.md` keeps #2558 `not-claimed`, #5894 `not-claimed`, #4730 `cluster-synced`, #3387 `cluster-synced`, and #3872 `cluster-synced`.                     | unchanged |
| Live/open ledgers             | `docs/plite-issues/gitcrawl-live-open-ledger.md` remains a generated live-field mirror; no live state changed.                                                                                | no edit   |
| Non-claim surfaces            | Plan, checkpoint, and continuation prompt keep #2558, raw mobile, whole-table selection, and collaboration browser outside exact closure.                                                     | protected |

No matrix, dossier, PR reference, or live/open ledger edit is needed from this
pass.

## Closure Score And Final Gates

Closure verdict: done. This is a completed planning/accounting lane, not a Plite
v2 implementation claim.

Final score: `0.92`.

| Closure gate                                   | Result | Evidence                                                                                    |
| ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Final score at least `0.92`                    | pass   | Prepared score is `0.92`; score dimensions range from `0.90` to `0.95`.                     |
| No dimension below `0.85`                      | pass   | Lowest dimension is maintainability at `0.90`.                                              |
| Scheduled passes complete                      | pass   | Passes 1-10 are complete and pass 11 is this closure.                                       |
| No hidden `Plate repo root` implementation claim | pass   | This lane edited planning/accounting artifacts only and records `0` new exact issue claims. |
| First `ralph` handoff narrow enough            | pass   | First execution slice is text-unit/delete package parity from Lexical #7163 only.           |

Next execution handoff:

- owner: `ralph`;
- target: first Ralph-ready slice, text-unit/delete package parity;
- primary Plite owner:
  `packages/plite/test/text-units-contract.ts`;
- Lexical source:
  `../lexical/packages/lexical-playground/__tests__/regression/7163-graphemes.spec.mjs`;
- first proof:
  `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts`;
- closure proof after implementation:
  `cd Plate repo root && bun check`;
- scope lock: no browser, raw mobile, table, collaboration, or issue claim from
  the first slice unless exact proof is added and the plan is reopened.

## Implementation Phases

Phase 0: processing ledger only.

- Create `docs/editor-test-harvester/lexical/slate-processing-ledger.md`.
- Account for every portable and portable-mixed source file.
- Do not touch `Plate repo root`.

Phase 1: text-unit and destructive-delete package parity.

- Start with Lexical #7163 grapheme matrix.
- Refactor `text-units-contract.ts` and existing delete/unit-character fixtures
  instead of creating duplicate rows.
- Keep this first slice package-only unless a browser-specific gap appears.
- Do not claim issue closure from this slice unless an exact issue repro and
  matching Plite proof are added.
- First required command: `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts`.
- Closure command after implementation: `cd Plate repo root && bun check`.

Phase 2: clipboard HTML source-drill.

- Open exact Lexical link/list/text-format/table source rows.
- For each row, name expected Plite value/DOM output and whether it is raw
  parser behavior or example app policy.
- Only after this slice may a later `ralph` add focused browser/package rows.
- Do not edit `Plate repo root` in this phase.
- Do not run ClawSweeper for this phase unless the source-drill changes an
  issue claim or classification.
- Status: complete on 2026-05-09. Exact accepted/rejected/deferred rows are in
  `docs/editor-test-harvester/lexical/slate-processing-ledger.md`.

Phase 3: clipboard HTML corpus residual.

- First slice: text-format HTML only. Complete on 2026-05-09. Google Docs-style
  BIU spans and safe semantic `<b>` handling are covered in
  `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` and
  `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts`.
- Next slice: simple anchor import only. Complete on 2026-05-09. A browser row
  proves `<a href="https://facebook.com">Facebook!</a>` imports as a safe link
  in the paste-html example.
- Next slice: minimized noisy social HTML with link-in-list from Lexical #3193.
  Complete on 2026-05-09. The browser row keeps the leading block, two list
  items, and one safe link inside a list item.
- Next slice: basic unordered list import only. Complete on 2026-05-09.
- Next slice: compact nested-list import corpus only. Complete on 2026-05-09.
- Next slice: nested `div` text boundaries inside list items only. Complete on
  2026-05-09.
- Next slice: Google Docs table import only: rows/cells, multi-paragraph cell,
  and `11pt` text. Complete on 2026-05-09. No column-width, layout, or
  table-model claim.
- Next slice: Quip table import row with `<br>` inside a cell. Complete on
  2026-05-09. No width, layout, or table-model claim.
- Selected clipboard HTML source rows for this phase are now closed. Link
  paste-into-existing rows stay with inline paste; custom table widths,
  merge grids, rowspan/colspan, empty-row synthesis, HR-in-list splitting, raw
  autolink plugin behavior, and table-cell block normalization stay deferred.
- Deferred rows: custom table widths, table grid merge, rowspan/colspan,
  empty-row synthesis, HR-in-list splitting, raw autolink plugin behavior, and
  table-cell block normalization until their owners are accepted.
- Run package and browser proof by owner; do not close browser paste behavior
  from package-only tests.

Phase 4: DOM mutation repair residual.

- Treat Lexical `Mutations.spec.mjs` as `refactor-existing`.
- Strengthen `richtext.test.ts`, generated stress, or the policy unit owner only
  if a missing invariant remains after pressure review.
- Package policy tests can support this phase, but browser mutation behavior
  needs Playwright proof.
- Status: complete on 2026-05-09 for accepted Plite owners. Existing richtext
  browser rows cover text mutation/selection repair; `dom-repair-policy-contract.ts`
  covers structural restore-manager policy. No desktop structural repair or raw
  Android device claim.

Phase 5: focus, scroll, and native browser input.

- TextEntry, Events, Keyboard, Focus, AutoScroll, and remaining Mutations rows.
- Use browser proof where native transport or DOM authority is the behavior.
- Status: Focus and AutoScroll rows are complete on 2026-05-09 for accepted raw
  Plite behavior. Plain-text tab-out and broader TextEntry/Events/Keyboard rows
  remain separate owners unless a later slice accepts them.
- Do not claim raw mobile or raw IME device closure from desktop viewport rows.

Phase 6: selection and inline/void atom residual.

- Mention delete/paste boundaries.
- Link/hashtag/horizontal-rule navigation only when Plite owns the equivalent
  raw invariant.
- Split raw inline behavior from product toolbar, autolink, or app shell policy.

Phase 7: table model decision.

- Keep current containment and triple-click proof.
- Do not claim multi-cell/whole-table selection until Plite accepts a table
  selection model.
- Route raw mobile table rows to raw-device proof only.
- This plan does not accept a table selection model.

Phase 8: collaboration/browser.

- Keep current collaboration/history substrate rows.
- Add yjs/browser rows only when a real collab owner exists.
- This plan does not claim collaboration browser parity.

## Public API Target

No public API change is accepted by this pass.

Any later `ralph` slice that discovers an API gap must update this plan first,
including adoption story, migration pressure, and issue accounting.

## Internal Runtime Target

Use the existing owner split:

- `slate` package tests for model/operation/history-like invariants;
- `plite-dom` for clipboard and DOM conversion;
- `plite-react` unit tests for runtime policy;
- Playwright examples/stress rows for browser transport.

Do not put browser-only correctness into model tests and call it done.

## Hook, Component, And Render DX Target

No React hook/component API change is planned in this pass. If a Lexical row
only tests Composer/plugin identity, reject it as product/framework shell.

## Plate And slate-yjs Migration Backbone

Plate migration pressure: test rows should prove raw behavior that Plate can
compose, not opinionated Plate features.

slate-yjs migration pressure: current substrate/history rows can be used as the
base. Browser yjs behavior is deferred until a real collab browser owner exists.

## Issue-Ledger Accounting

Current issue pass status: related discovery, issue-ledger sync, live-source
refresh, pressure pass, maintainer objection pass, high-risk pass, revision
pass, and final issue-accounting review complete. No issue-ledger files changed
in the final review because no claims, counts, or related classifications
changed.

Discovery inputs:

- `gitcrawl doctor --json` reports local archive readiness with version
  `0.2.1`, `630` live-open issue rows in the committed live ledger, `617`
  local clusters, and no GitHub token. Broad local `gitcrawl search` queries
  for IME, clipboard, DOM selection, and text-unit families returned no hits,
  so this pass used the committed ledgers and candidate maps as the durable
  source.
- `docs/editor-test-harvester/lexical/slate-processing-ledger.md` accounts for
  `137` portable or portable-mixed Lexical source files: `5` already-applied,
  `1` covered, `12` create-new, `83` refactor-existing, `21` defer, and `15`
  reject.
- `docs/plite/ledgers/issue-coverage-matrix.md:28` keeps the proof bar
  explicit: browser, IME, mobile, clipboard, selection, and DOM bridge issues
  need matching browser or device proof.
- `docs/plite-issues/package-impact-matrix.md:77` through
  `docs/plite-issues/package-impact-matrix.md:83` assign Mobile/IME,
  Selection/Focus/DOM bridge, Clipboard, Core, and React runtime to their
  current v2 owners.

Related classifications from the Lexical processing ledger:

| Lexical surface                                                                                                                        | Related Plite issue routes                                                                                                                                                                                                                                  | Classification for this plan                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Table containment, range, rowspan, mobile table selection, and table model rows                                                        | Existing fixed floor: #6034. Related pressure: #4658, #4643, #5355. Not claimed: #2558, #5550, #5551, #5924, #4851.                                                                                                                                         | Keep table containment rows as proof-route only. #2558 stays `not-claimed`; whole-table and multi-cell selection require an explicit table selection model.                                         |
| Clipboard, HTML paste, link/list/text-format paste, inline-void copy, table copy, and large paste rows                                 | Fixed or already claimed elsewhere: #5233, #3486, #4569, #5089, #5412, #5429. Improves elsewhere: #5945, #4056, #5992, #5328, #4857, #1024, #4613, #5151, #3857, #3801, #3469, #4802, #4806. Related/not claimed: #4440, #3557, #4542, #3155, #4716, #2694. | New Lexical residuals are `related/proof-route` only until a later apply slice adds exact browser or package proof. Do not promote existing clipboard claims from this planning pass.               |
| DOM selection, external/native selection import, nested editor ownership, inline/void atoms, mentions, links, HR, and caret boundaries | Existing fixed floor: #4789, #4984, #3871, #5847, #3991, #4301, #4074, #3148, #3429, #5972. Related/not claimed pressure: #5867, #5806, #5690, #4088, #4581, #3918, #3641, #4643, #4337, #3150, #4618.                                                      | Residual Lexical mention/link/HR/inline rows can strengthen browser proof, but no extra issue closure is legal without the exact repro row.                                                         |
| IME, composition, Android/iOS input, native text entry, beforeinput/input parity, placeholder composition, and raw mobile rows         | Macro sync already routes 149 R7 input-runtime rows. Representative related rows: #6051, #6022, #5989, #5984, #5983, #5931, #5883, #5643, #5130, #4348, #4067, #3470, #4400, #5034. Non-claims include #5912, #4223, #5281.                                 | Lexical composition rows stay proof-route or already-applied. Exact Android, iOS, Firefox Android, Samsung Keyboard, voice input, and Windows IME claims require matching browser/device artifacts. |
| Focus, blur, programmatic focus, scroll/autoscroll, selection persistence, and tab focus                                               | Related pressure: #5826, #5538, #5088, #5473, #4376, #5171, #3634, #4961, #1769, #1964, #3893, plus #5867 when selected inline focus is involved.                                                                                                           | Lexical `AutoScroll.spec.mjs` and `Focus.spec.mjs` become create/refactor rows, not claims. Browser proof must distinguish app scroll policy from raw focus/selection ownership.                    |
| Text-unit, grapheme, destructive delete, list delete, select-all delete, and history selection restoration                             | Existing fixed floor: #2500, #4121, #3965, #3499, #3534, #3551, #4559. Related pressure: #3756, #3921, #3705, #5524, #5629, #4648, #5630, #4104, #2355.                                                                                                     | Lexical delete/grapheme rows should strengthen unit and browser contracts. Existing fixed rows stay as-is; new text-unit rows need exact test-name drilling before any issue promotion.             |
| Collaboration, remote-edit browser behavior, operation metadata, update tags, and retained state                                       | Related pressure: #1770, #3741, #5771, #2288.                                                                                                                                                                                                               | Keep as substrate or future slate-yjs/browser work. Lexical collaboration rows are `defer`, not raw Plite closure.                                                                                  |
| Performance-adjacent harvest rows, including GC/retention, many-inline editing, large paste/cut, and dirty-path work                   | Existing performance routes include #3430, #5945, #4056, #5992, #3752, #2195, and #2051.                                                                                                                                                                    | No new performance claim. If a Lexical row becomes an apply slice, it needs baseline and after metrics before claim sync.                                                                           |

No new `Fixes #...` or `Improves #...` claim is made by this planning pass.

Issue sync results from pass 4:

- #5826 and #5806 already had matrix and dossier coverage; no row change.
- #5355 already had a matrix row and dossier section; the dossier status was
  aligned to `not-claimed` to match the actual decision.
- #4716 already had matrix and dossier coverage; the dossier status was aligned
  down from `improves-claimed` to `cluster-synced` because the decision and PR
  text are related-only.
- #5894, #4730, #3387, and #3872 now have conservative matrix rows and
  fork-dossier sections.
- `docs/plite/references/pr-description.md` keeps fixed issue claims at
  `31`, updates related matrix row count to `158`, and records `0` new exact
  fixed/improved claims from the Lexical harvest sync.
- `docs/plite-issues/gitcrawl-live-open-ledger.md` remains unchanged because it
  is a generated live-field mirror and no live issue state changed.

## Legacy Regression Proof Matrix

| Lane                | First proof target                                                                                         | Broad gate before closure                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Package invariants  | `cd Plate repo root && bun test ./packages/plite/test/text-units-contract.ts` plus target unit files         | `cd Plate repo root && bun check`                           |
| Clipboard corpus    | `cd Plate repo root && bun test ./packages/plite-dom/test/clipboard-boundary.ts` and paste-html browser grep | `cd Plate repo root && bun check`                           |
| IME/input transport | focused Chromium/WebKit/Firefox rows by family                                                             | `cd Plate repo root && bun check:full` before release claim |
| Tables              | focused `tables.test.ts` and generated table stress rows                                                   | table-model decision before #2558-like claims             |
| Raw mobile          | `cd Plate repo root && PLITE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw`                 | real device artifacts only                                |
| Collaboration       | substrate unit contracts first                                                                             | yjs browser proof only after owner exists                 |

## Browser Stress Strategy

Browser rows must be sequential when they build or share the Plite site. The
local solution note says not to run multiple site-backed Playwright commands in
parallel unless the server path is explicitly shared
(`docs/solutions/workflow-issues/2026-05-08-plite-playwright-webserver-checks-should-run-sequentially.md:43`).

IME rows must use honest DOM composition boundaries; synthetic or model-only
selection setup is not enough for native browser behavior
(`docs/solutions/developer-experience/2026-05-07-plite-browser-ime-proof-rows-need-honest-dom-composition.md:77`).

DOM selection plans must rank external test sources by owner; Lexical is strong
for browser-regression shape and skip discipline, not for every DOM selection
architecture choice
(`docs/solutions/workflow-issues/2026-05-08-dom-selection-ralplans-should-rank-editor-test-sources-by-owner.md:47`).

## Applicable Implementation-Skill Review Matrix

| Skill lens                    | Status                 | Reason                                                                                                                                                                            |
| ----------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `editor-test-harvester`       | applied                | Harvest report and appendices are the source of truth.                                                                                                                            |
| `clawsweeper`                 | applied                | Related issue discovery and issue-ledger sync are complete for this planning pass.                                                                                                |
| `tdd`                         | planned                | Every accepted create/refactor row should start from a focused failing row when feasible.                                                                                         |
| `performance-oracle`          | applied                | Pressure pass split low-risk package rows from browser/performance-sensitive rows and kept metrics requirements on large paste, autoscroll, huge-document, and many-inline lanes. |
| `steelman-pass`               | applied                | Maintainer objection ledger challenged accepted rows, narrowed clipboard, and made table/mobile/collab non-claims explicit.                                                       |
| `high-risk-deliberate-pass`   | applied                | High-risk gate split proof types, non-claims, ClawSweeper triggers, and Plite verification boundaries.                                                                         |
| `vercel-react-best-practices` | skipped for this pass  | No React public/runtime API change is accepted yet.                                                                                                                               |
| `deslop-pass`                 | planned before closure | The final ledger must be terse and not become a giant unreadable dump.                                                                                                            |

## High-Risk Pre-Mortem

| Risk                                                                    | Guard                                                                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| We copy Lexical internals and call it coverage.                         | Ledger requires `reject` for non-portable rows.                                                                                 |
| We overclaim mobile.                                                    | Raw mobile rows stay `defer` until device proof exists.                                                                         |
| We overclaim table selection.                                           | #2558 stays not claimed without a table selection model.                                                                        |
| We create duplicate tests.                                              | `refactor-existing` beats `create-new` when an owner exists.                                                                    |
| We close browser-only behavior with unit proof.                         | Proof owners are split: package tests for model invariants, Playwright for browser behavior, raw-device gate for mobile claims. |
| Clipboard source-drill sprawls into code before row ownership is clear. | Phase 2 is source-drill only; implementation requires exact expected Plite output and proof owner.                              |
| Table/mobile/collab non-claims drift into release or issue wording.     | The plan, checkpoint, and continuation prompt repeat the non-claims; issue sync reruns only when claims change.                 |
| We hide the real next work in a chat answer.                            | `active goal state` points at the current next runnable slice.                                                                   |

## Pass Schedule

| Pass                                                 | Status   | Evidence added                                                                                                                                                                                                                                            | Plan delta                                                                                                                                                                                                                                                                         | Open issues                                                                                     | Next owner      |
| ---------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------- |
| 1. Current-state read and initial score              | complete | Read harvest report, inventory, test index, selected apply ledger, current Plite owners, #2558 ledger rows, and relevant solution notes.                                                                                                                  | Created this plan at score `0.80`.                                                                                                                                                                                                                                                 | No processing ledger yet.                                                                       | `plite-ralplan` |
| 2. Lexical processing ledger pass                    | complete | `docs/editor-test-harvester/lexical/slate-processing-ledger.md`; 137 portable/portable-mixed files routed by status and owner.                                                                                                                            | Raised score to `0.84`; created the durable processing ledger.                                                                                                                                                                                                                     | Issue discovery still pending; file-level rows need source-name drilling before implementation. | `clawsweeper`   |
| 3. Related issue discovery pass                      | complete | `gitcrawl doctor --json`; broad `gitcrawl search` probes; issue coverage matrix; live open ledger; test candidate maps; fork dossier #2558/table non-claim rows.                                                                                          | Raised score to `0.86`; added surface-by-surface related issue classifications without promoting claims.                                                                                                                                                                           | Issue-ledger sync still pending; several backfill candidates need exact matrix/dossier checks.  | `plite-ralplan` |
| 4. Issue-ledger pass                                 | complete | Issue coverage matrix rows for #5894, #4730, #3387, and #3872; fork dossier sections for those rows; dossier status alignment for #5355 and #4716; PR reference count sync.                                                                               | Raised score to `0.88`; issue-ledger sync is complete with `0` new fixed/improved claims.                                                                                                                                                                                          | live-source refresh handled in pass 5.                                                          | `plite-ralplan` |
| 5. Research and live-source refresh                  | complete | Re-read live owners for text units/delete, clipboard/paste, DOM repair, IME/input, focus/scroll, inline atoms, tables, and collaboration; reopened Lexical #7163, LinksHTMLCopyAndPaste, ListsHTMLCopyAndPaste, Mutations, AutoScroll, and Focus sources. | Raised score to `0.90`; reconciled first implementation slice to text-unit/delete package parity, moved clipboard residual second, and downgraded DOM mutation from `create-new` to `refactor-existing`.                                                                           | pressure review handled in pass 6                                                               | `plite-ralplan` |
| 6. Pressure passes                                   | complete | Re-read active plan, processing ledger, text-unit owner, Lexical #7163, paste-html owner, richtext DOM repair owner, huge-document owner, and relevant solution notes for browser verification and performance proof.                                     | Raised score to `0.91`; confirmed text-unit/delete package parity as first slice, kept clipboard residual second, kept DOM mutation repair as `refactor-existing`, and updated the processing ledger priority queue.                                                               | objection handled in pass 7                                                                     | `plite-ralplan` |
| 7. Maintainer objection ledger                       | complete | Re-read active plan, checkpoint, current text-unit owner, Lexical #7163, paste-html owner, tables owner, and steelman-pass instructions.                                                                                                                  | Accepted revisions: clipboard residual now requires a source-drill slice before code; focus/autoscroll must prove raw editor behavior; DOM mutation must name a missing invariant before changing code; table, raw mobile, and collaboration browser rows are explicit non-claims. | high-risk handled in pass 8                                                                     | `plite-ralplan` |
| 8. High-risk pass                                    | complete | Loaded high-risk-deliberate-pass; recorded trigger, blast radius, pre-mortem, proof matrix, non-claim guards, ClawSweeper trigger policy, and text-unit verification scope.                                                                               | Raised score to `0.92`; kept plan pending because revision/final accounting/closure remain runnable.                                                                                                                                                                               | revision handled in pass 9                                                                      | `plite-ralplan` |
| 9. Revision pass                                     | complete | Re-read plan, checkpoint, continuation prompt, high-risk gate, implementation phases, issue accounting, proof matrix, and stale wording search.                                                                                                           | Folded high-risk guards into Ralph-ready slices and implementation phases; prepared score dimensions; kept first `ralph` narrow and protected table/raw-mobile/collab non-claims.                                                                                                  | issue accounting handled in pass 10                                                             | `plite-ralplan` |
| 10. Issue sync accounting                            | complete | Re-read plan claim rows, PR reference summary, issue coverage matrix rows, fork dossier rows, and live/open ledger policy.                                                                                                                                | Recorded no-op sync: no claims, PR counts, or related classifications changed after revision.                                                                                                                                                                                      | closure handled in pass 11                                                                      | `clawsweeper`   |
| 11. Closure score and final gates                    | complete | Re-read prepared score dimensions, pass schedule, completion file, continuation prompt, and final gates.                                                                                                                                                  | Marked the ralplan `done`; prepared `active goal state` for the first `ralph` execution slice.                                                                                                                                                                                      | no open planning pass                                                                           | `ralph`         |
| 12. Ralph execution: text-unit/delete package parity | complete | Added Lexical #7163 Unicode text-unit/delete rows; removed complex-script reverse-delete restoration; updated Thai delete fixtures; ran focused text-unit proof, unit-character fixtures, `bun run lint:fix`, and `bun check` in `Plate repo root`.         | Marked Lexical #7163 `already-applied` in the processing ledger; left issue claims unchanged.                                                                                                                                                                                      | clipboard source-drill remains runnable                                                         | `ralph`         |

## Plan Deltas

- Created a new plan because the existing Lexical API steal plan is about API
  shape, not the test harvest.
- Reopened the harvest report's remaining backlog under a new processing lane.
- Kept the previous selected apply ledger intact; it remains useful but not
  comprehensive.
- Made `plite-processing-ledger.md` the next durable artifact.
- Completed the related issue discovery pass with conservative routing for
  table, clipboard, DOM selection, IME/mobile, focus/scroll, text-unit/delete,
  collaboration, and performance-adjacent Lexical rows.
- Kept all new Lexical issue relationships as `related/proof-route` or
  `not-claimed`; no new fixed or improved claim is added by this pass.
- Completed the issue-ledger sync pass for the named backfill candidates:
  #5826, #5806, #5894, #5355, #4730, #3387, #3872, and #4716.
- Added matrix/dossier coverage for #5894, #4730, #3387, and #3872; corrected
  stale dossier claim levels for #5355 and #4716; updated the PR reference
  related-row count without changing fixed claims.
- Completed live-source refresh against current `Plate repo root` owners.
- Resolved the ordering conflict between the broad implementation phases and
  `plite-processing-ledger.md`: first apply slice is now text-unit/delete
  package parity, clipboard HTML source-drill comes before clipboard code, and
  DOM mutation repair is `refactor-existing`.
- Kept issue claims unchanged after source refresh: `0` new exact fixed or
  improved claims from the Lexical harvest plan.
- Completed the pressure pass. Text-unit/delete package parity survives as the
  first `ralph` slice; clipboard HTML residual stays second; DOM mutation repair
  is still `refactor-existing`; focus/autoscroll and inline atom rows stay later
  browser slices; table, raw mobile, and collaboration browser rows stay
  deferred.
- Updated `docs/editor-test-harvester/lexical/slate-processing-ledger.md` so
  its priority queue matches the plan and `Mutations.spec.mjs` no longer says
  `create-new`.
- Completed the maintainer objection ledger. The pass kept text-unit/delete as
  first implementation slice, inserted a clipboard source-drill phase before
  clipboard code, kept DOM mutation repair as refactor-only, and made table,
  raw mobile, and collaboration browser rows explicit non-claims.
- Completed the high-risk pass. The plan now gates package, browser, raw
  mobile, table-model, collaboration, issue-claim, and planning verification
  proof separately; it also records that clipboard source-drill does not need
  ClawSweeper before code when claims remain unchanged.
- Raised score to `0.92`, but kept completion `pending` because revision, final
  issue-accounting review, and closure remain runnable.
- Completed the revision pass. High-risk guards are now reflected in
  Ralph-ready slices and each implementation phase. Prepared score dimensions
  keep the plan at `0.92` with no dimension below `0.85`.
- Confirmed the next issue-accounting pass can be a no-op if it verifies that
  the revision changed no claims, counts, or related classifications.
- Completed final issue-accounting review as a no-op: fixed/improved claims,
  PR counts, related classifications, fork dossier statuses, and non-claim
  surfaces stayed unchanged.
- Completed closure scoring at `0.92` with no dimension below `0.85`.
- Marked this ralplan done and prepared `active goal state` for the next `ralph`
  execution slice: text-unit/delete package parity only.
- Completed the first `ralph` execution slice. Lexical #7163 is now applied in
  Plite's text-unit contract, reverse complex-script deletion follows the same
  text-unit law as forward deletion, Thai unit-character fixtures are aligned,
  and `Plate repo root` `bun check` passes.
- Completed the lexical-history LexicalHistory source-read slice.
  `packages/plite-history/test/history-contract.ts` now proves
  redo-stack clearing after undo plus a new edit, selected block property
  undo/redo, and node-property history capture while ignoring empty updates.
  Lexical command notification APIs, clear-history command shape, React harness
  details, shared nested-editor history, raw mobile, collaboration,
  table-model, and issue claims stayed out. Focused package proof and
  `Plate repo root` `bun check` passed. The reusable harvest boundary is captured
  in
  `docs/solutions/best-practices/2026-05-09-lexical-history-harvest-rows-need-stack-law-contracts.md`.
- Kept completion `pending` for the broader execution lane because
  lexical-html LexicalHtml source-read is the next runnable slice.
- Completed the lexical-html LexicalHtml source-read slice with no Plite
  code/test change. Selected-fragment export is already covered by
  `packages/plite-dom/test/clipboard-boundary.ts`, and paragraph
  alignment import is already covered by the paste-html browser row and
  importer. Standalone full-editor HTML serialization and custom node
  `DocumentFragment` export stay rejected/deferred until a generic Plite HTML
  serializer owner exists. Focused existing proofs passed:
  `bun test ./packages/plite-dom/test/clipboard-boundary.ts` and
  `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium -g "paragraph alignment"`.
- Kept completion `pending` for the broader execution lane because
  lexical-list utils source-read is the next runnable slice.
- Completed the lexical-list utils source-read slice. The accepted Plite row is
  public path/query behavior, not Lexical helper API shape:
  `packages/plite/test/query-contract.ts` now proves nested list
  depth, non-root top list ancestry, descendant list ancestors, and terminal
  versus non-terminal list-item paths through `Path` and `Node` APIs. Focused
  query proof, `bun run lint:fix`, and `Plate repo root` `bun check` passed. The
  reusable harvest rule is captured in
  `docs/solutions/best-practices/2026-05-09-lexical-list-utils-harvest-rows-need-path-ancestry-contracts.md`.
- Kept completion `pending` for the broader execution lane because Lexical
  regression #231 empty-text-nodes source-read is the next runnable slice.

## Open Questions

No user decision is needed for the next pass.

No open planning questions remain. The next action is execution under `ralph`,
continuing with Lexical regression #231 empty-text-nodes source-read before any
new normalization, delete, rendered-DOM, or browser row changes.

## Fast Driver Gates

Planning repo gates:

```bash
cd /Users/zbeyens/git/plate-2
pnpm lint:fix
bun run completion-check -- --file .tmp/completion-checks/plite-lexical-harvest-test-processing-ralplan.md
```

Plite gates for later implementation slices:

```bash
cd /Users/zbeyens/git/plite
bun test ./packages/plite/test/text-units-contract.ts
bun test ./packages/plite-dom/test/clipboard-boundary.ts
bun test ./packages/plite-history/test/history-contract.ts
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/paste-html.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium -g '<accepted-family>'
bun check
```

Release/browser closure gate:

```bash
cd /Users/zbeyens/git/plite
bun check:full
```

Raw device gate:

```bash
cd /Users/zbeyens/git/plite
PLITE_BROWSER_RAW_MOBILE_REQUIRED=1 bun test:mobile-device-proof:raw
```

## Final Completion Gates

This plan can become `done` only when:

- `docs/editor-test-harvester/lexical/slate-processing-ledger.md` exists;
- every portable and portable-mixed source file has a processing status;
- every create/refactor row has a Plite owner and command;
- every defer/reject row has a concrete reason;
- ClawSweeper issue accounting is complete for every issue-facing row;
- no raw mobile, whole-table selection, or yjs browser claim is made without the
  matching proof owner;
- any implementation slice executed under this plan has passed its relevant
  `Plate repo root` gates;
- final score is at least `0.92` with no dimension below `0.85`.

Closure status: all gates above are satisfied for the planning lane. Executed
implementation slices have passed their focused proof, lint where relevant, and
`Plate repo root` `bun check`. Broader Lexical apply work remains pending because
later runnable slices still exist.

Ralph execution update on 2026-05-09: LexicalTabNode source-read is complete.
`packages/plite-dom/test/clipboard-boundary.ts` now proves
multiline plain-text fallback preserves literal tabs while splitting blocks, and
`apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now proves
Google Docs `Apple-tab-span` HTML preserves two visible `Hello\tworld` lines
from the paragraph plus loose-line source shape. A trial switch from
`tx.nodes.insert` to `tx.fragment.insert` in the paste-html example removed the
empty paragraph but broke existing nested-list import proof, so the importer
path stayed unchanged and the new browser assertion targets the visible
tab/newline invariant. Focused package proof, full paste-html Chromium proof,
post-format focused Playwright proof, lint, and `Plate repo root` `bun check`
passed. The reusable rule is captured in
`docs/solutions/best-practices/2026-05-09-lexical-tab-node-harvest-rows-need-clipboard-browser-proof-boundaries.md`.
Lexical TabNode class/schema/serialization/command API rows stay out; tab-indent
and adjacent literal-tab selection rows are deferred to later owners. No raw
mobile, collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalEditor source-read is complete.
`packages/plite-react/test/rendered-dom-shape-contract.tsx` now
proves that an empty inline element inside a non-empty block does not render a
visual line break placeholder. Source-read classified the rest of
`LexicalEditor.test.tsx` conservatively: Plite's `read-update-contract`,
`transaction-contract`, `commit-metadata-contract`, `normalization-contract`,
`operations-contract`, and `snapshot-contract` already cover the accepted
read/update, batching, command, normalization, move, and state invariants.
Lexical editor API shape, node-key maps, listener/mutation registration,
Lexical update tags, decorator rendering, root mounting, DOM reconciliation,
and product-shell rows stay out or remain separate runtime owners. Focused
React test proof, `bun run lint:fix`, and `Plate repo root` `bun check` passed. No
raw mobile, collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalEditorState source-read is
complete. `packages/plite/test/snapshot-contract.ts` now proves
that removing a node purges the removed block and text runtime IDs from both
current `idToPath` and `pathToId`. Source-read classified the rest of
`LexicalEditorState.test.ts`: snapshot immutability and read/update boundaries
are covered by existing Plite owners; Lexical `EditorState` constructor,
frozen node-map identity, JSON schema, node keys, and parser/editor-context API
rows stay out. The first focused Bun command used a name-filter path and failed
before execution; rerunning with `./packages/plite/test/snapshot-contract.ts`
passed all 196 tests. `bun run lint:fix && bun check` passed from
`Plate repo root`, the focused snapshot test passed again after formatting, and
`pnpm lint:fix` passed in `plate-2`. No browser, raw mobile, collaboration,
table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalElementHelpers source-read is
complete with no Plite code/test change. The file only tests
`addClassNamesToElement` and `removeClassNamesFromElement` for basic, empty,
multiple, space-separated, and whitespace-padded DOM class strings. That is a
Lexical DOM utility helper, not portable editor behavior for Plite, so the
ledger now rejects the row instead of keeping the stale `refactor-existing`
classification. No browser, raw mobile, collaboration, table-model, or issue
claim changed.

Ralph execution update on 2026-05-09: LexicalNode source-read is complete.
`packages/plite/test/query-contract.ts` now proves the portable
node-shape part of LexicalNode: ancestry order, reverse ancestry, sibling path
order, common ancestor resolution, previous/next path helpers, and
parent/ancestor predicates. Source-read classified the rest conservatively:
text content, empty-block normalization, selected removal/rebase, text
split/merge, and structural move/insert/replace rows are already owned by
existing Plite query, normalization, operation, transform, and selection
contracts. Lexical class APIs, node keys, clone/config/JSON, live-node read
throws, DOM rendering, token/segmented/directionless text modes, and
`selectNext` helper shape stay out or route to later keyboard/selection owners.
Focused query proof, `bun run lint:fix`, and `Plate repo root` `bun check` passed.
No browser, raw mobile, collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalNormalization source-read is
complete. The file only tests Lexical `$normalizeSelection`, so the accepted
Plite behavior is query/location edge resolution rather than tree repair.
`packages/plite/test/query-contract.ts` now proves that element
paths, nested element paths, and backward ranges resolve to stable text points
through `Editor.range`, `Editor.edges`, and `Editor.point`. Lexical decorator
endpoint semantics and element-point API shape stay out or route to a future
decorator/void/browser selection owner. Focused query proof, `bun run lint:fix`,
and `Plate repo root` `bun check` passed. The reusable rule is captured in
`docs/solutions/best-practices/2026-05-09-lexical-normalization-harvest-rows-need-selection-query-boundaries.md`.
No browser, raw mobile, collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalSerialization source-read is
complete. The file is one large Lexical editor-state JSON snapshot plus a
parse/stringify round-trip. The accepted Plite behavior is not Lexical's
editor-state schema; it is raw document value JSON portability through the
public state API. `packages/plite/test/state-tx-public-api-contract.ts`
now proves rich raw document values round-trip through JSON, can be rehydrated
as `initialValue`, and do not serialize runtime index metadata such as
`pathToId` or `idToPath`. Lexical node keys, parser API shape, class schema,
and code/list/table metadata stay out. Focused public API proof,
`bun run lint:fix`, and `Plate repo root` `bun check` passed. The reusable rule is
captured in
`docs/solutions/best-practices/2026-05-09-lexical-serialization-harvest-rows-need-public-value-roundtrip-tests.md`.
No browser, raw mobile, collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalUtils source-read is complete.
The useful missing row was generic shortcut matching, not Lexical node utility
internals. `packages/plite-dom/test/hotkeys.ts` now proves direct
`isHotkey` calls match semantic letter keys before physical-code fallback,
handle uppercase keys, reject ASCII remapped-layout physical keys, and still
fallback to `event.code` for non-English single-letter layouts. Existing Plite
owners cover accepted query/runtime-id, state/read/update, commit metadata,
focus/autoscroll, and browser selection behavior. Lexical microtask helpers,
random keys, token/segmented text modes, node-key maps, cached type maps,
node replacement/copy class APIs, listener-order internals, and generic DOM
helpers stay out or route to later dedicated owners. The first focused command
hit Bun's ignored `.test.ts` wrapper filter; rerunning the real source file
`./packages/plite-dom/test/hotkeys.ts` passed. `bun run lint:fix` and
`Plate repo root` `bun check` passed. No browser, raw mobile, collaboration,
table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalUtilsInsertNodeToNearestRoot
source-read is complete. The portable row maps to Plite's existing
`insertNodes` `mode: 'highest'` transform behavior, not to Lexical's helper API.
`packages/plite/test/transforms-contract.ts` now proves highest-mode
block insertion splits the highest selected block and inserts the block at the
root level. Existing insertNodes fixtures already cover paragraph
middle/start/end, empty paragraph, root start/child/end, and default selection
insertion. Lexical command dispatch, node-key maps, decorator class shape,
shadow-root wording, and list HTML specifics stay out or route to later
list/plugin owners. Focused package proof, `bun run lint:fix`, and
`Plate repo root` `bun check` passed. No browser, raw mobile, collaboration,
table-model, or issue claim changed.

Ralph execution update on 2026-05-09: LexicalUtilsSplitNode source-read is
complete. The useful missing row was public root split rejection. Plite already
covered normal split behavior through splitNodes fixtures and operation/snapshot
contracts: paragraph middle/start/end, multi-text element split, nested block
split, highest-mode ancestor split, mark/property preservation, selection
rebase, and raw root operation rejection. `packages/plite/src/transforms-node/split-nodes.ts`
now rejects `Editor.splitNodes(..., { at: [] })` with a direct editor-root error,
and `packages/plite/test/transforms-contract.ts` proves that public
contract. Focused package proof, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. No browser, raw mobile, collaboration, table-model, or issue
claim changed.

Ralph execution update on 2026-05-09: lexical-code-shiki and lexical-code
LexicalCodeNodeTabs source-read is complete. The portable Plite-owned row is
not Lexical's full indent/outdent command matrix; it is the code-highlighting
example's raw Tab behavior. `apps/www/tests/plite-browser/donor/examples/code-highlighting.test.ts`
now proves Tab inside a code line inserts the configured spaces and advances the
caret. Lexical `INDENT_CONTENT_COMMAND`/`OUTDENT_CONTENT_COMMAND`, backward
selection preservation, Shiki tokenizer/theme loading, node class APIs, and
product command dispatch stay out or wait for a future accepted code-block
indent owner. Focused browser proof, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. No raw mobile, collaboration, table-model, or issue claim
changed.

Ralph execution update on 2026-05-09: lexical-code LexicalCodeNode source-read
is complete. The useful missing row was not Lexical's code-node class lifecycle;
it was multi-line code indent/outdent behavior. `apps/www/tests/plite-browser/donor/examples/code-highlighting.test.ts`
now proves Tab and Shift+Tab indent/outdent every selected code line, and
`apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx` routes expanded code-line
selections through line-start edits while keeping collapsed Tab as configured
space insertion at the caret. Lexical constructor/createDOM/updateDOM/exportJSON,
language metadata, tokenizer/highlighter transform policy, command dispatch,
Alt+Arrow line shifting, Home/End visual-caret policy, node keys, raw mobile,
collaboration, table-model, and issue claims stay out or wait for separate
accepted owners. Focused browser proof, full code-highlighting browser proof,
`bun run lint:fix`, and `Plate repo root` `bun check` passed.

Ralph execution update on 2026-05-09: Lexical regression #231 empty-text-nodes
source-read is complete. `packages/plite/test/delete-contract.ts`
now proves repeated Backspace through token-like marked text collapses to a
canonical empty block with selection at `[0, 0]` offset `0`. Existing
normalization, leaf lifecycle, and rendered-DOM owners cover empty block anchors
and invalid empty leaf cleanup. Focused delete proof, `bun run lint:fix`, and
`Plate repo root` `bun check` passed. No hashtag plugin, Playground CSS,
collaboration harness, raw mobile, table-model, or issue claim changed.

The completion checkpoint stays `pending` because Lexical regression #3433
merge-markdown-lists source-read is the next runnable slice. Continue there
before adding markdown/list model or browser rows.

Ralph execution update on 2026-05-09: Lexical regression #3433
merge-markdown-lists source-read is complete. `apps/www/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts`
now proves that a markdown-created list immediately before an existing list
renders as one `ul` with `two` before `one`. The first focused proof failed red
with two adjacent lists. `apps/www/src/app/(app)/examples/plite/_examples/markdown-shortcuts.tsx`
now merges adjacent bulleted-list wrappers after wrapping the current block as a
list item. Focused browser proof, full markdown-shortcuts browser file,
`bun run lint:fix`, and `Plate repo root` `bun check` passed. No generic core
`wrapNodes`/`mergeNodes` behavior, raw mobile, collaboration, table-model, or
issue claim changed.

The completion checkpoint stays `pending` because `LexicalHeadingNode.test.ts`
source-read is the next runnable non-table slice.

Ralph execution update on 2026-05-09: LexicalHeadingNode source-read is
complete. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts` now
proves heading middle split, heading-end paragraph insertion, and empty-heading
paragraph insertion from the browser. The first focused proof failed red with
two `h1` elements at heading end. `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx`
now routes Enter at heading end or in an empty heading to a paragraph after the
heading, while middle Enter stays on the generic core split path. Focused
heading proof, full heading grep in the richtext browser file, `bun run
lint:fix`, and `Plate repo root` `bun check` passed. No generic core
`insertBreak`/`splitNodes` behavior, raw mobile, collaboration, table-model, or
issue claim changed.

The completion checkpoint stays `pending` because `LexicalQuoteNode.test.ts` is
the next runnable non-table slice.

Ralph execution update on 2026-05-09: LexicalQuoteNode source-read is
complete. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts` now
proves Enter in an empty blockquote keeps one blockquote and creates a paragraph
after it. The first focused proof failed red with two `blockquote` elements.
`apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx` now shares one exit-on-Enter policy
for `heading-one`, `heading-two`, and `block-quote`. Focused quote proof,
combined heading/quote browser grep, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. No generic core `insertBreak`/`splitNodes` behavior, raw
mobile, collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`$sliceSelectedTextNodeContent.test.ts` is the next runnable non-table slice.

Ralph execution update on 2026-05-09: Lexical selection
`$sliceSelectedTextNodeContent` source-read is complete.
`packages/plite/test/clipboard-contract.ts` now proves selected
fragment extraction across unmarked and bold text leaves slices both edges and
does not mutate source text when the returned fragment is changed. Focused
package proof, full clipboard contract, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. No browser, raw mobile, collaboration, table-model,
token/segmented mode, or issue claim changed.

The completion checkpoint stays `pending` because `LexicalListItemNode.test.ts`
is the next runnable non-table slice.

Ralph execution update on 2026-05-09: LexicalListItemNode source-read is
complete. `packages/plite/test/snapshot-contract.ts` now proves
`insertBreak` inside a non-empty list item splits the item while preserving the
`bulleted-list` wrapper and moving selection into the new item. Focused package
proof, full snapshot contract, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. Lexical class/DOM/create/type-guard/export rows stay
rejected. Replace/remove nested-list normalization, indent/style inheritance,
and ordered-list restart policy stay deferred to explicit list-plugin/model
owners. No raw mobile, collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because `LexicalListNode.test.ts` is
the next runnable non-table slice.

Ralph execution update on 2026-05-09: LexicalListNode source-read is complete.
`packages/plite/test/snapshot-contract.ts` now proves selected
top-level blocks can be converted to `list-item` children and wrapped in a
`numbered-list` wrapper, complementing the existing bulleted-list proof.
Focused package proof, full snapshot contract, `bun run lint:fix`, and
`Plate repo root` `bun check` passed. Lexical class/DOM/depth-class/update/create,
subclass transform wiring, checklist role cleanup, and private list-value rows
stay rejected or deferred to explicit list-plugin/model owners. No raw mobile,
collaboration, table-model, or issue claim changed.

Ralph execution update on 2026-05-09: lexical-list `formatList.test.ts`
source-read is complete. No `Plate repo root` code or tests changed. Existing Plite
owners already cover root list formatting, numbered/bulleted wrapper creation,
and non-empty list continuation through the snapshot contract plus markdown and
richtext browser rows. Lexical command/extension setup, table-cell shadow-root
insertion, element-anchored LineBreakNode selection, decorator-node list
continuation, subclass preservation, indent/outdent helper APIs, empty/whitespace
list-item exit, middle-empty-item list splitting, and ordered-list metadata stay
deferred or rejected until explicit list-plugin/model/table/product owners accept
them. No browser, raw mobile, collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`registerListStrictIndentTransform.test.ts` is the next runnable non-table
slice.

Ralph execution update on 2026-05-09: lexical-list
`registerListStrictIndentTransform.test.ts` source-read is complete. No
`Plate repo root` code or tests changed. Current paste-html browser coverage already
proves compact malformed nested-list import variants without flattening visible
list content. Lexical's exact strict indentation rewrite, `$generateHtmlFromNodes`
HTML output, list `value` attributes, and transform registration stay deferred
or rejected until Plite accepts a list-normalization or generic HTML serializer
owner. No browser, raw mobile, collaboration, table-model, or issue claim
changed.

The completion checkpoint stays `pending` because
`LexicalMarkdown.test.ts` is the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-markdown
`LexicalMarkdown.test.ts` source-read is complete. No `Plate repo root` code or
tests changed. Current Plite owns markdown shortcuts and markdown preview
examples, not a markdown import/export package. Existing browser rows already
cover blockquote, list, heading, list continuation, and adjacent markdown-list
merge shortcuts. The broad import/export matrix, markdown normalizer, nested
fence round-trips, whitespace and hard-break import, link/mark escape matrix,
MDX/custom transformer rows, list-marker/checklist metadata, selection-after-import
semantics, and code-fence Enter shortcut stay deferred or rejected until
explicit markdown serialization, markdown transformer, list/checklist, or
code-block shortcut owners accept them. No browser, raw mobile, collaboration,
table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`MarkdownTransformers.test.ts` is the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-markdown
`MarkdownTransformers.test.ts` source-read is complete. No `Plate repo root` code
or tests changed. The Lexical rows are markdown-link transformer behavior:
preserving text or marks before a parsed markdown link, avoiding greedy matches,
and rejecting markdown link creation inside an existing link. Current Plite
already has raw inline-link paste/copy boundary coverage, but no markdown-link
automd or serializer API. These rows stay deferred or rejected until an explicit
markdown-link plugin/serializer owner exists. No browser, raw mobile,
collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`ClearFormatting.spec.mjs` is the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground
`ClearFormatting.spec.mjs` source-read is complete. The portable accepted rows
are selected mark removal, block alignment reset, semantic block preservation,
and partial multi-paragraph clearing. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
now proves clearing a selected range from the middle of one paragraph through
the middle of the next removes marks only from the selected text, clears block
alignment, and preserves blockquote structure. The first focused browser proof
failed red because the richtext toolbar had no clear-formatting control.
`apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx` now exposes a clear-formatting
button that removes the richtext example's text marks and resets selected block
alignment without changing semantic block types. Link, mention, hashtag,
indent/outdent, theme markup, raw mobile, collaboration, table-model, and issue
rows stay out or wait for explicit future owners. Focused browser proof,
`bun run lint:fix`, rerun focused browser proof, and `Plate repo root` `bun check`
passed.

The completion checkpoint stays `pending` because `CodeBlock.spec.mjs` is the
next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground `CodeBlock.spec.mjs`
source-read is complete. `apps/www/tests/plite-browser/donor/examples/code-highlighting.test.ts`
now proves selecting paragraph text and clicking the code-block control creates
a code block with code-line content and keeps the existing code blocks intact.
Existing code-highlighting browser rows cover Enter inside code lines, collapsed
Tab insertion, and selected multi-line Tab/Shift+Tab indentation. Markdown code
fences, language parser matrix, auto-indent-on-newline, line movement, visual
navigation, theme DOM, raw mobile, collaboration, table-model, and issue rows
stay deferred or rejected under explicit future owners. Focused browser proof
passed.

The completion checkpoint stays `pending` because `ElementFormat.spec.mjs` is
the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground
`ElementFormat.spec.mjs` source-read is complete. The accepted portable row is
fresh empty-paragraph center alignment from the toolbar. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
now proves a fresh empty paragraph can be center-aligned while the Plite
selection stays collapsed on that empty block. `apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx`
now explicitly targets the containing block path for collapsed alignment, rather
than relying on implicit selected-block expansion. The first browser attempts
failed because full-document delete hit placeholder text and then retained
centered alignment in the model; the final proof creates a fresh empty paragraph
from an unaligned block. The Lexical caret-within-link plus indent row stays
deferred because this checkout has separate richtext alignment and inline-link
owners, but no combined link/block-format owner and no indent API. Toolbar
shell/theme rows stay rejected. Focused browser proof passed. No raw mobile,
collaboration, table-model, link-plugin policy, indent policy, or issue claim
changed. Follow-up verification passed in `Plate repo root`: `bun run lint:fix`,
the richtext Playwright grep for empty paragraph alignment, existing toolbar
alignment, and clear formatting, then `bun check`.

The completion checkpoint stays `pending` because
`Headings/HeadingsBackspaceAtStart.spec.mjs` is the next runnable non-table
slice.

Ralph execution update on 2026-05-09: lexical-playground
`Headings/HeadingsBackspaceAtStart.spec.mjs` source-read is complete. The
portable row is Backspace at offset `0` of the first heading with no previous
sibling. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts` now
proves that path is a no-op: the `h1` text remains `Welcome to the playground`,
no paragraph is created, and the collapsed selection stays at `[0, 0]` offset
`0`. Runtime already behaved correctly; this pass added the missing proof.
Lexical Playground setup, dropdown/theme DOM, raw mobile, collaboration,
table-model, and issue rows stay out. Focused browser proof passed.
Follow-up verification passed in `Plate repo root`: `bun run lint:fix`, the
richtext Playwright grep for first-heading Backspace and heading Enter behavior,
then `bun check`.

The completion checkpoint stays `pending` because
`Headings/HeadingsEnterAtEnd.spec.mjs` is the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground
`Headings/HeadingsEnterAtEnd.spec.mjs` source-read is complete. No
`Plate repo root` code or test changed. Existing richtext browser proof already
covers the accepted row: Enter at the end of a heading leaves the heading in
place and creates a following paragraph. The example policy lives in
`handleExitBlockEnter`. Lexical Playground setup, dropdown/theme DOM, raw
mobile, collaboration, table-model, and issue rows stay out. Same-turn heading
browser verification already passed while closing the preceding heading slice.

The completion checkpoint stays `pending` because
`Headings/HeadingsEnterInMiddle.spec.mjs` is the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground
`Headings/HeadingsEnterInMiddle.spec.mjs` source-read is complete. No
`Plate repo root` code or test changed. Existing richtext browser proof already
covers the accepted row: Enter in the middle of a heading splits it into two
headings. Lexical movement helpers, Playground setup, dropdown/theme DOM, raw
mobile, collaboration, table-model, and issue rows stay out. Same-turn heading
browser verification already passed while closing the preceding heading slice.

The completion checkpoint stays `pending` because `Indentation.spec.mjs` is the
next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground
`Indentation.spec.mjs` source-read is complete. No `Plate repo root` code or test
changed. The file is a mixed product-owner suite, not one raw Plite invariant:
existing code-highlighting browser rows already cover selected code-line
Tab/Shift+Tab indentation, and `snapshot-contract.ts` already covers a basic
list outdent model flow by lifting selected list items to paragraphs. Paragraph
padding indent, table-cell paragraph indent, max-depth caps, nested list indent
limits, negative indent cleanup after HTML padding import, and exact toolbar DOM
output stay deferred or rejected until Plite accepts explicit paragraph-indent,
list-indent, table-indent, or HTML-indent owners. No raw mobile, collaboration,
table-model, or issue claim changed.

The completion checkpoint stays `pending` because `List.spec.mjs` is the next
runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground `List.spec.mjs`
source-read is complete. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
now proves selected richtext blocks can be turned into a bulleted list, toggled
back to paragraphs, turned into a numbered list, and converted back to a
bulleted list from the toolbar. Existing snapshot/browser owners already cover
basic list wrapper creation, numbered/bulleted list formatting, non-empty list
continuation, and markdown-created adjacent list merge. Lexical checklist
focus/keyboard behavior, indent/outdent depth, empty-list-item exit, collapse at
start, ordered start metadata, paragraph markdown suppression inside lists,
format-menu list splitting, autolink/list interactions, raw mobile,
collaboration, table-model, and exact theme DOM output stay deferred or
rejected until explicit future owners accept them. Focused browser proof passed.

The completion checkpoint stays `pending` because `Markdown.spec.mjs` is the
next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground `Markdown.spec.mjs`
source-read is complete. `apps/www/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts`
now proves a numeric ordered-list markdown shortcut with a non-1 start number:
typing `25. ` creates a numbered list rendered as `ol start="25"` and accepts
item text. `apps/www/src/app/(app)/examples/plite/_examples/markdown-shortcuts.tsx` now parses
ordered-list shortcuts and unwraps both bulleted and numbered lists on markdown
Backspace exit. Existing markdown-shortcuts rows already cover headings,
blockquote, bulleted lists, list continuation, and adjacent markdown-created
bulleted-list merge. Markdown import/export cycles, inline text transformers,
emoji/image/equation decorators, code-formatted text exclusion, selection after
link text-match transforms, list-marker export/copy behavior, HR/code-fence
shortcuts, raw mobile, collaboration, table-model, and exact theme DOM output
stay deferred or rejected until explicit future owners accept them. Focused
browser proof passed.

The completion checkpoint stays `pending` because `TextFormatting.spec.mjs` is
the next runnable non-table slice.

Ralph execution update on 2026-05-09: lexical-playground
`TextFormatting.spec.mjs` source-read is complete.
`packages/plite/test/snapshot-contract.ts` now proves
`Editor.toggleMark` and `tx.marks.toggle` clear inherited collapsed marks before
the next inserted text. `packages/plite/src/core/public-state.ts`
now defaults `tx.marks.toggle` to `true` instead of a fresh object, and
`apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx` now prevents default browser
handling for editor-owned mark hotkeys. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
now proves bold, italic, underline, and code hotkeys create formatted inserted
text and clear active marks before later plain text. The first browser proof
failed red because inserted text stayed plain; after default prevention, it
failed again because `Plain` stayed bold, exposing the transaction toggle
default/inherited-mark bug. Capitalization, font-size/family, strikethrough,
date-time/decorator formatting, toolbar active-state CSS, multiline toolbar
state, raw mobile, collaboration, table-model, and exact theme DOM output stay
deferred or rejected until explicit future owners accept them. Focused package
and browser proofs passed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical/src/__tests__/unit/CodeBlock.test.ts` is the next
runnable non-table slice.

Ralph execution update on 2026-05-09: lexical core `CodeBlock.test.ts`
source-read is complete. The portable row is code-source HTML import through a
DataTransfer-style rich HTML insertion path, not Lexical node class behavior.
`apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now proves
Quip-style `<pre>`, VS Code-style `white-space: pre` line `<div>`s, and
GitHub-style code tables import as one `<pre><code>` block without source
gutters. `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` now extracts
code-source text before generic table/paragraph import, preserves line breaks,
normalizes non-breaking spaces, and strips trailing source newlines. A first
browser-native clipboard version failed red because Chromium flattened `<pre>`
before the app importer saw it; the final proof uses the same app DataTransfer
insertion boundary as Lexical's unit test so the existing kernel-trace gauntlet
stays intact. Source-token colors/bold keyword styling, broad Google Docs title
inference, sub/sup typography, native clipboard transport, raw mobile,
collaboration, table-model, and issue rows stay deferred or rejected. Focused
and full paste-html browser proofs passed, and `Plate repo root` `bun run lint:fix
&& bun check` passed. Added
`docs/solutions/best-practices/2026-05-09-lexical-codeblock-harvest-rows-need-data-transfer-boundaries.md`
to preserve the DataTransfer-vs-native-clipboard boundary lesson.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical/src/__tests__/unit/LexicalEditorListener.test.ts`
is the next runnable source-read slice.

Ralph execution update on 2026-05-09: lexical core
`LexicalEditorListener.test.ts` source-read is complete. Current Plite already
owns the portable subscriber lifecycle through `Editor.subscribe` /
`editor.subscribe` unsubscribe, `Editor.subscribeSource` source routing,
`Editor.registerCommitListener` cleanup, and the public commit/subscriber
contract tests in `snapshot-contract.ts`, `transaction-contract.ts`,
`collab-history-runtime-contract.ts`, and `apply-onchange-hard-cut-contract.ts`.
Lexical `registerRootListener`, `registerEditableListener`, private
`_listeners`, `setRootElement`, and `setEditable` callback cleanup rows are
editor/root-shell API policy, not raw Plite behavior. No `Plate repo root` code or
test changed, and no browser, raw mobile, collaboration, table-model, or issue
claim changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical/src/__tests__/unit/LexicalListPlugin.test.tsx` is
the next runnable source-read slice.

Ralph execution update on 2026-05-09: lexical core
`LexicalListPlugin.test.tsx` source-read is complete. The accepted portable row
is empty paragraph toolbar list toggle, not Lexical React plugin wiring.
`apps/www/tests/plite-browser/donor/examples/richtext.test.ts` now proves a
fresh empty paragraph toggles into one bulleted-list item and back to one empty
paragraph while preserving collapsed selection. Current Plite already covers
selected block list toggle/conversion, list wrapper creation, and basic list
outdent. Empty-list indent/outdent and regression #7036 block-type-after-nested
list behavior stay deferred or rejected until Plite accepts explicit
list-indent, list-normalization, or list-plugin policy owners. The first focused
proof failed because the empty paragraph DOM includes rendered placeholder text;
the final proof asserts model text and selection instead. Focused list browser
proof, `bun run lint:fix`, and `bun check` passed. No runtime code changed, and
no raw mobile, collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/HTMLCopyAndPaste.spec.mjs`
is the next runnable source-read slice.

Ralph execution update on 2026-05-09: lexical-playground
`HTMLCopyAndPaste.spec.mjs` source-read is complete. The accepted rows were
multiline paragraph HTML with extra raw newlines and code-source HTML in a
`<code>` element with `<br>` line breaks. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts`
now proves multiline pasted HTML normalizes to four paragraphs, preserves the
intended spaces and inline `<b>` / `<i>` formatting, and imports `<code>` with
`<br>` as a code block through the existing source-code HTML corpus.
`apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` now strips raw newlines
from normal HTML text nodes, drops whitespace-only inter-block text, preserves
explicit code/pre whitespace, and removes the empty paste target created by
native block-fragment paste. Existing source-code rows still cover `<pre>`,
white-space-preserving editor divs, and GitHub code tables. HR insertion between
two rules and top-level HR paste into the middle of a paragraph stay deferred to
a future HR/block-void plus block-fragment owner. Focused paste-html browser
proof, the full paste-html browser corpus, `bun run lint:fix`, and `bun check`
passed. Added
`docs/solutions/best-practices/2026-05-09-lexical-htmlcopy-harvest-rows-need-whitespace-and-empty-target-boundaries.md`
to preserve the whitespace/empty-target boundary lesson.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/html/ListsHTMLCopyAndPaste.spec.mjs`
is the next unresolved clipboard/list source-read candidate unless the prior
row-level drill proves it is exhausted.

Ralph execution update on 2026-05-09: lexical-playground
`ListsHTMLCopyAndPaste.spec.mjs` source-read is complete. Exact source-read
confirmed the earlier row-level drill exhausted the accepted HTML list parser
rows: basic unordered-list import, compact nested `ul` variants, and nested
`<div>` boundaries inside list items are already applied in
`apps/www/tests/plite-browser/donor/examples/paste-html.test.ts`. The
structural post-fragment selection behavior is covered by
`packages/plite/test/clipboard-contract.ts`, not duplicated in the
HTML browser row. Lexical checklist private attributes stay rejected as
app/list-plugin policy. Top-level HR paste into the middle of a list stays
deferred to a future HR/block-void plus list-split owner. Toolbar
indent/outdent assertions stay deferred or rejected under explicit list-indent
policy. No `Plate repo root` code or test file changed, so no new Plite command
was required for this classification-only slice.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/ListsCopyAndPaste.spec.mjs`
is the next unresolved clipboard/list source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground
`ListsCopyAndPaste.spec.mjs` source-read is complete. Exact source-read split
the seven native list copy/paste rows from Lexical playground shell and DOM
theme assertions. `packages/plite/test/clipboard-contract.ts` adds
package proof for the accepted portable rows: a partial list item plus following
paragraph copied into an empty editor; the same fragment inserted into an empty
list item by splitting the surrounding list; a copied list inserted into
selected paragraph text while preserving surrounding text; two copied paragraphs
inserted inside a list item with the first paragraph kept in the list and the
tail paragraph promoted after the list; and two copied paragraphs inserted at
the end of a list as one list item plus a following block.
`packages/plite/src/transforms-text/insert-fragment.ts` handles
those rows with explicit structural fragment replacement before the generic
inline/block unwrapping path. Exact Lexical DOM classes, list `value`
attributes, browser/OS flake tags, native clipboard transport, raw mobile,
collaboration, table-model, and issue claims stay out of this package row.
Focused list-fragment proof and the full clipboard contract passed after
`bun run lint:fix`, and `bun check` passed after fixing a TypeScript narrowing
bug in the compatibility helper. Added
`docs/solutions/logic-errors/2026-05-09-native-list-fragment-paste-must-run-before-generic-fragment-unwrapping.md`
to preserve the structural-fragment-before-generic-unwrapping lesson.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/unit/ImageHTML.test.ts`
is the next unresolved clipboard/image source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground
`ImageHTML.test.ts` source-read is complete. The portable rows are image HTML
import from Lexical's exported shapes: no-caption `<p><img></p>` and
plain-text caption `<figure><img><figcaption>caption text</figcaption></figure>`.
`apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now proves
both shapes through browser paste/import. The first focused proof failed red
because Plite rendered the no-caption image as a block void nested under a
paragraph. `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts` now unwraps
paragraph wrappers that only contain block elements, so block images stay block
images. Caption text imports as a following paragraph. Focused ImageHTML
browser proof, the full paste-html browser corpus, `bun run lint:fix`, and
`bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-block-only-html-paragraphs-must-not-wrap-block-voids.md`
to preserve the block-only paragraph wrapper rule. Exact Lexical `alt`,
`height`, `width`, serializer API, caption editor internals, native clipboard
transport, raw mobile, collaboration, table-model, and export claims stay out.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical/src/__tests__/unit/HTMLCopyAndPaste.test.ts`
is the next unresolved core clipboard source-read candidate.

Ralph execution update on 2026-05-09: lexical core
`HTMLCopyAndPaste.test.ts` source-read is complete. The accepted portable rows
are core HTML block-shape paste behavior: plain DOM text, malformed paragraph
pair, single `div`, nested spans/divs, nested span in `div`, and nested `div`
in span. `apps/www/tests/plite-browser/donor/examples/paste-html.test.ts` now
proves those shapes through the browser paste/import path, and the existing
rich HTML paste row now asserts typed text after a strong paste remains inside
`<strong>`. The first focused proof failed red because Plite flattened generic
`div` block boundaries into one paragraph; `apps/www/src/app/(app)/examples/plite/_examples/paste-html-import.ts`
now imports generic `div` nodes as block-boundary fragments while preserving
list-item `div` boundary handling. Google Docs, GitHub, and Joplin checklist
rows stay deferred/rejected until a checklist/list-plugin owner accepts
checklist schema, ARIA/theme output, and checkbox normalization. The focused
core proof passed after the importer fix. Full paste-html browser proof,
`bun run lint:fix`, and `bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-html-div-boundaries-must-survive-inline-wrappers.md`
to preserve the generic `div` boundary import rule.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs`
is the next unresolved native copy/paste residual audit.

Ralph execution update on 2026-05-09: lexical-playground native
`CopyAndPaste.spec.mjs` residual audit is complete. The accepted missing row was
paragraph fragment paste into an empty quote: the first pasted text block should
fill the target quote and the tail paragraph should promote after it.
`packages/plite-dom/test/clipboard-boundary.ts` now proves that
through model-backed DOM clipboard payloads. The first focused proof failed red
because Plite replaced the empty quote with two paragraphs.
`packages/plite/src/transforms-text/insert-fragment.ts` now keeps
the target empty text block wrapper for the first pasted text block and keeps
later text blocks source-shaped. Current owners already cover multi-block
copy/paste, full-document replacement, inline link fragments, multiline
plain-text splitting, font-size HTML paste, and collapsed-copy/cut clipboard
preservation. Copied-heading source-wrapper preservation into an empty paragraph
stays deferred to future block-format paste policy because Plite deliberately
keeps target wrappers for single text-block fragments. Lexical hashtag/theme
output, YouTube decorator embeds, exact plaintext rendering, native transport
flake tags, raw mobile, collaboration, table-model, and issue claims stay out.
Focused DOM clipboard proof, full DOM clipboard boundary, core clipboard
contract, `bun run lint:fix`, and `Plate repo root` `bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-empty-target-fragment-paste-keeps-first-block-wrapper.md`
to preserve the target-first-block paste rule.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/Events.spec.mjs` is the
next unresolved input-runtime source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground `Events.spec.mjs`
input-runtime source-read is complete. The accepted rows were Mac-style
beforeinput substitutions: autocapitalization via native `insertText` followed
by `insertReplacementText`, and double-space period replacement after emoji via
an expanded `insertText` target range. `apps/www/tests/plite-browser/donor/examples/plaintext.test.ts`
now proves both through browser-dispatched `beforeinput`/`input` events. The
first focused proof failed red with only `I`, then with `iSI`, then with
`🙂 . `, exposing three owners. `packages/plite-react/src/editable/runtime-before-input-events.ts`
now flushes queued native text repair before the next model-owned beforeinput.
`packages/plite-react/src/editable/mutation-controller.ts` now
applies provided replacement target ranges even after native repair moves the
current selection. `packages/plite-react/src/editable/selection-reconciler.ts`
now honors expanded `insertText` target ranges even when model selection is
preferred. Product shell, theme spans, `page.pause`, OS labels, raw mobile,
collaboration, table-model, and issue claims stay out. The focused plaintext
browser proof passed after the runtime fixes.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/Keyboard.spec.mjs` is the
next unresolved keyboard/input-runtime source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground `Keyboard.spec.mjs`
input-runtime source-read is complete. The file contains one portable row:
Mac-style `insertTranspose` from Control+T swaps adjacent characters. Plite
already exposed the hotkey matcher but dropped the beforeinput command. The
first focused package proof failed red with `abc` still unchanged. Plite React
now has a first-class `transpose-character` command parsed from
`insertTranspose`, applied through `model-input-strategy.ts` and
`mutation-controller.ts`, and covered by both package and plaintext browser
proof. Repeated transpose from `abc` at offset `1` now produces `bca` with the
selection after the swapped pair. Lexical Playground setup, OS/browser flake
tags, raw mobile, collaboration, table-model, and issue claims stay out.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/KeyboardShortcuts.spec.mjs`
is the next unresolved keyboard-shortcut source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground
`KeyboardShortcuts.spec.mjs` source-read is complete. The accepted portable
rows were shortcut access to editor commands already owned by Plite examples:
paragraph/heading block conversion, block alignment, clear formatting, and
code-block conversion. `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
first failed red because heading block shortcuts did nothing, then passed after
`apps/www/src/app/(app)/examples/plite/_examples/richtext.tsx` routed block/alignment/clear
shortcuts through the same owners as the toolbar commands. `apps/www/tests/plite-browser/donor/examples/code-highlighting.test.ts`
first failed red because the code-block shortcut did nothing, then passed after
`apps/www/src/app/(app)/examples/plite/_examples/code-highlighting.tsx` reused the existing
selected-paragraph code-block conversion command for `mod+shift+c` and
`mod+alt+c`. Existing mark-hotkey rows from the TextFormatting slice cover
bold/italic/underline/code marks. Heading three, checklist, product typography,
font-size controls, strikethrough/subscript/superscript, paragraph/list/table
indent shortcuts, active-state DOM, browser/OS labels, raw mobile,
collaboration, table-model, and issue claims stay out. Focused richtext and
code-highlighting browser rows passed after the implementation, `bun run
lint:fix` had no fixes, and `Plate repo root` `bun check` passed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/TextEntry.spec.mjs` is the
next unresolved text-entry/input-runtime source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground
`TextEntry.spec.mjs` source-read is complete. The accepted missing rows were
heading-start Enter after markdown heading creation and native Enter at the
boundary between plain and marked text. `apps/www/tests/plite-browser/donor/examples/markdown-shortcuts.test.ts`
now proves a heading created by `# ` gets an empty paragraph before it when
Enter is pressed at the heading start, with selection staying at the heading
start. `apps/www/src/app/(app)/examples/plite/_examples/markdown-shortcuts.tsx` handles that
heading-start split by turning the split empty heading into a paragraph.
`apps/www/tests/plite-browser/donor/examples/richtext.test.ts` now proves
native Enter between plain text and bold text creates a plain paragraph followed
by a bold paragraph, with selection at the start of the bold text. Existing
plaintext/richtext input and generated stress owners cover basic typing,
select-all replacement, partial replacement, character delete, word delete, and
selection synchronization. Lexical emoji/theme output, trimmable-space
whitespace policy, soft-break/newline-node navigation, browser/OS labels, raw
mobile, collaboration, table-model, and issue claims stay rejected or deferred.
The first markdown-shortcuts focused proof failed red with no paragraph before
the heading; after the example keydown fix it passed. The richtext marked-boundary
proof passed without runtime changes. `bun run lint:fix`, the focused richtext
proof, the focused markdown-shortcuts proof, and `bun check` passed. One
parallel focused-proof rerun hit a Next build lock; the same markdown proof
passed when rerun sequentially. Added
`docs/solutions/logic-errors/2026-05-09-heading-start-enter-must-normalize-split-block-type.md`
and validated its YAML frontmatter.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/SpecialTexts.spec.mjs` is
the next unresolved product-adjacent source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground
`SpecialTexts.spec.mjs` source-read is complete. The bracket-triggered
highlighting rows are product transform/theme policy: typing `[MLH Fellowship]`
creates themed special-text spans, strips brackets, and inserts Lexical
Playground DOM output. Plite should not copy that plugin behavior into core
coverage. The disabled-option row keeps `[MLH Fellowship]` as literal text,
which is ordinary text insertion already covered by existing Plite input
owners. No `Plate repo root` code/test edit was needed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/Placeholder.spec.mjs` is
the next unresolved placeholder/browser source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground
`Placeholder.spec.mjs` source-read is complete. The accepted portable row is
empty-editor placeholder behavior: a placeholder is visible, the model remains
empty, and focus lands selection at the start. `apps/www/tests/plite-browser/donor/examples/placeholder.test.ts`
now proves the Plite equivalent on the custom-placeholder example: placeholder
visible, `modelText === ""`, and selection at `[0, 0]` offset `0`. Existing
`packages/plite-react/test/rendered-dom-shape-contract.tsx` owns the
empty-block line-break placeholder DOM shape. Lexical's rich/plain/collab
placeholder strings are product shell text and stay rejected. The focused
placeholder browser proof passed, `bun run lint:fix` had no fixes, and
`Plate repo root` `bun check` passed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/Images.spec.mjs` is the
next unresolved image void/paste source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground `Images.spec.mjs`
source-read is complete. The accepted missing row was keyboard deletion of a
clicked selected image void. `apps/www/tests/plite-browser/donor/examples/images.test.ts`
now proves a clicked image selects `[1, 0]`, Backspace removes that image, and
the editor keeps the remaining image. Existing image browser rows already cover
horizontal movement into/out of image voids, vertical movement, shifted
selection into images, selected-image Enter, and void spacer rendering. Existing
paste-html rows cover Lexical image HTML with optional captions. URL/upload
dialogs, image dimensions, drag/drop product policy, caption editor UI,
multi-node NodeSelection replacement, raw mobile, collaboration, table-model,
and issue claims stay rejected or deferred. The focused image browser proof
passed, `bun run lint:fix` had no fixes, and `Plate repo root` `bun check` passed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/e2e/Tab.spec.mjs` is the next
unresolved tab/code/list/clipboard source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground `Tab.spec.mjs`
source-read is complete. The accepted portable rows are already owned: code
block Tab behavior is covered by the current code-highlighting browser proof,
and literal tab preservation is covered by the earlier plain-text fallback and
Google Docs `Apple-tab-span` paste proofs. Lexical's paragraph Tab plus Chromium
CDP IME row mixes product paragraph-indent policy, TabNode DOM output, and IME
runtime behavior, so it stays deferred to explicit keyboard/IME/paragraph-indent
owners. Ctrl/Meta+ArrowLeft after a typed Tab stays deferred to a future
text-boundary/keyboard owner if Plite accepts literal-tab keyboard insertion as
editor-owned behavior. No `Plate repo root` code/test edit was needed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/1055-fast-typing-undo.spec.mjs`
is the next unresolved history/input source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`1055-fast-typing-undo.spec.mjs` source-read is complete. The portable row is
history stack law: after undo, the next user edit must create a fresh undoable
batch and clear redo. `packages/plite-history/test/history-contract.ts`
already owned redo invalidation after a new edit follows undo; that row is now
strengthened to undo the follow-up edit back to the pre-edit state as well.
Lexical Playground HTML output and helper setup stay rejected as harness details.
The focused history-contract grep passed, and the full `history-contract.ts`
file passed. `bun run lint:fix` had no fixes, and `Plate repo root` `bun check`
passed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/1083-backspace-with-element-at-front.spec.mjs`
is the next unresolved delete/selection source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`1083-backspace-with-element-at-front.spec.mjs` source-read is complete. The
portable row is expanded delete over inline content at the front of the selected
range. Plite normalizes a spacer before leading inline content, so the full
selection proof selects from that spacer through the trailing text. A second
proof selects from an inline link after preceding text through the trailing
text. `packages/plite/src/transforms-text/delete-text.ts` now
collects fully-selected inline ancestors and removes them as nodes, so expanded
delete no longer leaves empty inline shells or invalid inline child points.
`packages/plite/test/delete-contract.ts` covers both rows. The
focused inline-element delete grep passed, and the full `delete-contract.ts`
file passed. The first full `bun check` exposed an over-broad version of the
fix that removed inline shells for selections wholly inside an inline; the final
fix removes a fully-selected inline ancestor only when the expanded selection
crosses outside that inline. The delete fixture suite, `bun run lint:fix`, and
`Plate repo root` `bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-expanded-delete-across-inline-boundaries-must-remove-crossed-inline-ancestors.md`
and validated its YAML frontmatter.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/1113-link-newline-at-end.spec.mjs`
is the next unresolved link/end-boundary source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`1113-link-newline-at-end.spec.mjs` source-read is complete. The portable row
is link end-boundary selection after inserting a new line. A new browser proof
in `apps/www/tests/plite-browser/donor/examples/inlines.test.ts` failed red
because Enter after a typed URL inline link produced a second empty link at the
start of the next paragraph. `apps/www/src/app/(app)/examples/plite/_examples/inlines.tsx` now
moves one offset out of a collapsed inserted link, matching the inline boundary
policy used by the mentions example. The proof now locks exactly one typed URL
link, selection in the next block, and follow-up text outside the link. Focused
proof, full inlines browser proof, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-collapsed-inline-link-insertion-must-move-selection-outside.md`
and validated its YAML frontmatter. No generic autolink API, raw mobile,
collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/1384-insert-nodes.spec.mjs`
is the next unresolved insert-nodes source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`1384-insert-nodes.spec.mjs` source-read is complete. The filename is
misleading: the portable row is code-block clipboard insertion, where copying a
nested code-line fragment and pasting inside an active code line must merge into
that line instead of inserting a sibling or top-level code block. A new package
contract in `packages/plite/test/clipboard-contract.ts` failed red,
then `packages/plite/src/transforms-text/insert-fragment.ts` was
updated to fit a single nested text-block child from the same structural
container into the active nested text block. A new browser proof in
`apps/www/tests/plite-browser/donor/examples/code-highlighting.test.ts` locks
the native copy/paste behavior. Focused package proof, full clipboard contract,
focused browser proof, full code-highlighting browser proof, `bun run lint:fix`,
and `Plate repo root` `bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-nested-clipboard-fragments-must-merge-into-active-text-block.md`
and validated its YAML frontmatter.
No Lexical Playground setup, exact gutter/theme output, raw mobile,
collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/221-editing-hashtags.spec.mjs`
is the next unresolved inline-token editing source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`221-editing-hashtags.spec.mjs` source-read is complete. The portable row is
dynamic decorated text-token editing, not mention, mark, inline-void, hashtag
plugin, or Lexical theme behavior. `apps/www/src/app/(app)/examples/plite/_examples/highlighted-text.tsx`
now adds hashtag-style projections over normal text, and
`apps/www/tests/plite-browser/donor/examples/highlighted-text.test.ts` proves
Space splitting `#yolo` to decorated `#yo`, Delete removing the plain trailing
space at the boundary, and Backspace from the plain tail preserving decorated
`#yol`. The first focused proof failed red because no hashtag projection
rendered. A full-document Backspace setup also exposed a separate
projected-document replacement edge, so the final proof uses model-owned token
setup and browser keyboard behavior for the accepted invariant. Focused hashtag
proof, full highlighted-text browser proof, `bun run lint:fix`, and
`Plate repo root` `bun check` passed. Added
`docs/solutions/best-practices/2026-05-09-hashtag-like-text-tokens-should-use-dynamic-decorations.md`
and validated its YAML frontmatter. No raw mobile, collaboration, table-model,
or issue claim changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/230-navigation-around-hashtags.spec.mjs`
is the next unresolved inline-token navigation source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`230-navigation-around-hashtags.spec.mjs` source-read is complete. The portable
row is dynamic decorated text-token navigation after transient prefix insertion
and deletion, not a Lexical hashtag plugin or DOM theme contract.
`apps/www/tests/plite-browser/donor/examples/highlighted-text.test.ts` now
proves that after replacing the document with `#foo`, inserting `a` before it,
deleting that prefix, then pressing ArrowRight moves the collapsed selection
into the decorated hashtag-style token at offset `1` through the model-owned
movement path. Focused browser proof, full highlighted-text browser proof,
`bun run lint:fix`, and `Plate repo root` `bun check` passed. No runtime code,
raw mobile, collaboration, table-model, or issue claim changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/3136-insert-nodes-adjacent-to-inline.spec.mjs`
is the next unresolved inline-adjacent rich paste/replacement source-read
candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`3136-insert-nodes-adjacent-to-inline.spec.mjs` source-read is complete. The
portable rows are rich paste/replacement of selected plain text immediately
before and immediately after an inline link. `packages/plite/test/clipboard-contract.ts`
now proves both core fragment replacement directions, and
`apps/www/tests/plite-browser/donor/examples/inlines.test.ts` proves rich HTML
paste replaces adjacent selected text without expanding or swallowing the link.
Focused package proof, full clipboard contract, focused browser proof, full
inlines browser proof, `bun run lint:fix`, and `Plate repo root` `bun check`
passed. No runtime code, raw mobile, collaboration, table-model, or issue claim
changed.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/379-backspace-with-mentions.spec.mjs`
is the next unresolved mention/text-token Backspace source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`379-backspace-with-mentions.spec.mjs` source-read is complete. The portable row
is Backspace at a line boundary before a mention/text token, not Lexical
Playground typeahead setup, mention styling, exact DOM/theme output, raw mobile,
collaboration, table-model, or issue behavior.
`apps/www/tests/plite-browser/donor/examples/mentions.test.ts` now proves that
splitting immediately before a leading inline mention and pressing Backspace at
that new line boundary preserves both mention atoms and restores the boundary
selection. Focused browser proof, full mentions Chromium proof,
`bun run lint:fix`, and `Plate repo root` `bun check` passed. No runtime code, raw
mobile, collaboration, table-model, or issue claim changed.

`../lexical/packages/lexical-playground/__tests__/regression/399-open-line.spec.mjs`
is source-read/applied. The portable row is Mac `Ctrl+O` open-line behavior:
open an empty line before the current line without moving selection past the
following text. Plite now has a dedicated `open-line` insert-break variant wired
through `plite-dom` hotkeys and the `plite-react` keyboard/mutation runtime. The
runtime inserts an empty paragraph before the current block directly, instead of
reusing normal split-block and repairing selection afterward. Browser proof
asserts `foo`, empty line, `bar`, selection on the empty line, and open-line
kernel command metadata.

Verification for the 399 slice:

- `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium -g "opens a line with Mac Ctrl\\+O"` passed.
- `cd Plate repo root && bun test ./packages/plite-dom/test/hotkeys.ts` passed.
- `cd Plate repo root && bun test ./packages/plite-react/test/editing-kernel-contract.ts` passed.
- `cd Plate repo root && bun run lint:fix && bun check` passed.

The full richtext Chromium owner sweep was attempted and showed one
deterministic unrelated IME mark expectation mismatch in `commits IME composition
through an active mark before a formatted sibling`: the rendered DOM has sibling
`em`, `code`, and `em strong` nodes, while the test expects `em code`. That is
not part of the 399 open-line owner and stays out of this slice.

The completion checkpoint stays `pending` because
`../lexical/packages/lexical-playground/__tests__/regression/429-swapping-emoji.spec.mjs`
is the next unresolved emoji-line Enter/Backspace source-read candidate.

Ralph execution update on 2026-05-09: lexical-playground regression
`429-swapping-emoji.spec.mjs` source-read is complete. The portable row is
emoji-line Enter/Backspace behavior: Enter at the start of an emoji line opens
an empty block before it, keeps selection at the emoji-line start, and
Backspace rejoins without corrupting emoji text or selection. Lexical
Playground emoji substitution UI, exact emoji span/theme DOM, flaky tagging,
raw mobile, collaboration, table-model, and issue behavior stay out.
`apps/www/tests/plite-browser/donor/examples/richtext.test.ts` now owns the
plain Unicode emoji browser proof. Focused browser proof and
`bun run lint:fix && bun check` passed from `Plate repo root`.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/regression/5251-paste-into-inline-element.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground regression
`5251-paste-into-inline-element.spec.mjs` source-read is complete. The portable
row is selected inline-link text replacement by a rich clipboard payload:
pasted content must stay outside the surviving link tail. Plite now has package
proof for rich fragment insertion, DOM clipboard fallback proof for
HTML-with-plain-text payloads, and an inlines browser proof for user-visible
paste behavior. `insertFragment` now handles selected one-level inline text with
a single replacement operation, and DOM plain-text fallback routes expanded
same-inline selections through fragment insertion instead of inheriting the
inline. Focused red browser proof initially failed with `replaced` inside the
link; the final focused browser proof, full inlines Chromium file,
clipboard-contract, clipboard-boundary, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. Added
`docs/solutions/logic-errors/2026-05-09-html-clipboard-fallback-must-not-inherit-selected-inline-text.md`
and validated its YAML frontmatter. Lexical Playground link toolbar setup,
exact DOM/theme output, raw mobile, collaboration, table-model, and issue
behavior stay out.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/regression/5583-select-list-followed-by-element-node.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground regression
`5583-select-list-followed-by-element-node.spec.mjs` source-read is complete.
The portable row is native selection import over list content followed by a
non-text/boundary element without crashing. Plite already had adjacent
block-void delete proof and a generic native drag-selection boundary row, but
not the list + boundary combination, so
`apps/www/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts`
now proves a native drag from a materialized list item to a boundary placeholder
imports into a valid Plite range with no page errors. Focused browser proof,
full dom-coverage Chromium proof, `bun run lint:fix`, and `Plate repo root`
`bun check` passed. Lexical Playground drag helpers, horizontal-rule product
shell, exact DOM/theme output, raw mobile/device, collaboration, table-model,
and issue behavior stay out.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/regression/7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground regression
`7635-SELECTION_INSERT_CLIPBOARD_NODES_COMMAND.spec.mjs` source-read is
complete. The portable row is rich HTML clipboard insertion inside a nested
editable island plus restoring parent-editor use afterward. Plite now proves
that rich HTML paste inside the nested rich-text editor preserves bold text,
does not leak into the parent value, preserves the parent selection, and still
allows parent-editor typing after nested editing. `site/examples/ts/richtext.tsx`
now owns a narrow HTML paste capability that reuses the shared deserializer but
normalizes imported content to the rich-text example's supported blocks and
marks. The selection runtime now rejects DOM selections and beforeinput target
ranges whose endpoints cross from a parent editor into a nested editor before
they can replace parent content.

Verification for the 7635 slice:

- `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium -g "rich HTML inside nested editor"` first failed red because the nested editor inserted plain text and dropped `<strong>`.
- `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium -g "parent selection that crosses|rich HTML inside nested editor"` passed after tightening parent/nested selection import.
- `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium` passed: 12 tests.
- `cd Plate repo root && bun run lint:fix && bun check` passed: Biome formatted touched files, package/site/root typecheck passed, Bun tests passed, and slate-react Vitest passed.
- `ruby -e 'require "yaml"; YAML.load_file("docs/solutions/logic-errors/2026-05-09-parent-nested-dom-selections-must-not-import-as-parent-ranges.md")'` passed for the solution note.

Lexical image caption UI, `SELECTION_INSERT_CLIPBOARD_NODES_COMMAND` API,
Playground command harness, exact DOM/theme output, raw mobile/device,
collaboration, table-model, and issue behavior stay out.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/e2e/AutoLinks.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground e2e
`AutoLinks.spec.mjs` source-read is complete. The portable Plite-owned row is
not Lexical's full autolink plugin. Plite now proves the narrow accepted
behavior in `apps/www/tests/plite-browser/donor/examples/inlines.test.ts`:
pasting a single URL at a collapsed selection creates one safe inline link,
places the caret outside the link, and keeps follow-up typing outside the link.
Focused pasted-URL browser proof, full inlines Chromium proof, `bun run
lint:fix`, and `Plate repo root` `bun check` passed. Lexical's broad URL/email
parser matrix, delimiter tokenization, invalid URL grammar, unlink/relink UI,
unlinked-autolink preservation, emoji shortcode destruction, styling/font rows,
toolbar/product shell, exact DOM/theme output, raw mobile, collaboration,
table-model, and issue behavior stay deferred or rejected under future
link/autolink plugin owners.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/e2e/Hashtags.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground e2e
`Hashtags.spec.mjs` source-read is complete. The portable Plite-owned rows are
dynamic decorated text-token editing, not Lexical's hashtag plugin grammar.
Existing highlighted-text rows already covered hashtag-style decoration, Space
splitting, Delete/Backspace boundaries, transient-prefix navigation,
decorated-range copy/cut, and decorated-text IME/editing. The new proof in
`apps/www/tests/plite-browser/donor/examples/highlighted-text.test.ts` covers
the missing delimiter/marker update: deleting the delimiter between `#hello`
and `world` expands the decorated token, restoring the delimiter shrinks it
back, and deleting the leading `#` drops the decoration with stable caret
placement. Focused delimiter proof, full highlighted-text Chromium proof, `bun
run lint:fix`, and `Plate repo root` `bun check` passed. Lexical's hashtag plugin
grammar, invalid-match matrix, markdown import/export shell, format inheritance
styling, exact DOM/theme output, raw mobile, collaboration, table-model, and
issue behavior stay deferred or rejected.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/e2e/Keywords.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground e2e
`Keywords.spec.mjs` source-read is complete with no Plite code change. The raw
portable rows are already covered by the highlighted-text owner: projected text
selection/movement/editing, mark-click typing through projections, decorated
IME, copy/cut semantics, hashtag-style delimiter merge/split, and deleting a
decorated selected range. Lexical's exact `congrats` grammar, bracket/team token
policy, keyword styling, product plugin setup, exact DOM/theme output, raw
mobile, collaboration, table-model, and issue behavior stay deferred or
rejected. No new `Plate repo root` verification was needed for this slice because
no code or test file changed.

The completion checkpoint stays `pending` because the next runnable non-table
row is
`../lexical/packages/lexical-playground/__tests__/e2e/SelectionAlwaysOnDisplay.spec.mjs`.

Ralph execution update on 2026-05-09: lexical-playground e2e
`SelectionAlwaysOnDisplay.spec.mjs` source-read is complete with no Plite code
change. The only raw Plite-owned invariant is blurred-editor model-selection
persistence, and current `apps/www/tests/plite-browser/donor/examples/richtext.test.ts`
already proves it in `keeps model selection when focus moves outside the editor`.
Lexical's always-on fake-selection overlay, highlight alignment tolerance,
plain-text skip policy, exact DOM/theme output, raw mobile/device,
collaboration, table-model, and issue behavior stay deferred or rejected as
product visualization or future dedicated owners. The remaining raw mobile and
collaboration buckets are explicit future-owner deferrals, so the selected
Lexical non-table execution lane is closed.
