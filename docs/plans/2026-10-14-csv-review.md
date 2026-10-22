---
review_scopes: [csv, table]
review_basis: [2026-10-04-csv-audit]
work_kind: implementation
review_commit: 79de4822376e3aa676911ca5e54d34cd112f94af
review_inputs: [packages/platejs/src/csv/lib/CsvPlugin.spec.ts, packages/platejs/src/features/table/lib/BaseTablePlugin.paste.spec.tsx, packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.spec.tsx, packages/platejs/src/markdown/lib/MarkdownPlugin.ts, packages/plitejs/src/dom/plugin/data-transfer-format.ts, packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts, packages/platejs/src/internal/plugin/compilePlateFormats.ts, tooling/entrypoints/entrypoint-dag.mjs, tooling/e2e/table-demo.test.ts]
review_upstreams: ['../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../prosemirror-tables@eb522f25959a1e4515a4ff5ce7e3a939f19c55e9', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../quill@539cbffd0a13b18e9c65eb84dd35e6596e403158', '../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2']
---

# CSV: delete the CSV plugin and let Table read tab-separated paste

Status: executed: built and folded; the owner commits
Topic: csv
Playbook: plan

This plan adopts the Pursue verdict of the [2026-10-04 csv audit](../research/review-records/2026-10-04-csv-audit.json), which no plan had taken up. `node tooling/scripts/review-ledger.mjs next` returned csv as `pursue-not-adopted`, with its freshness unknown because `VISION.md` and `docs/vision/common.md` moved since. Those moves relocated the format and conversion law into `docs/vision/plate.md` (lines 1053 to 1069 and 1239 to 1243) without changing it, and `docs/vision/common.md` added "one way per operation" and "no payload as a parallel authority", which only tighten the verdict. The CSV source has not changed since the audit, and its five paste failures still reproduce. So the verdict's questions stand and this run plans and builds it. The architect bakeoff and the plan panel replaced the audit's proposed call shape. `platejs/csv` goes away, and Table reads one job back: tab-separated text pasted onto selected cells, the same dialect its copy already writes.

## Brief

### What will change?

Pasting ordinary text, web text or a Markdown table no longer turns into a surprise table. Tab-separated text pasted onto selected table cells fills them one field per cell, and spreadsheet copies still paste as tables.

### What could go wrong?

Apps that call the CSV plugin break, because it is deleted. Comma text pasted onto selected cells no longer splits into columns, and CSV pasted outside a table stays text.

It's built, with one fix rolled back. If you pick table cells in an odd shape, like two diagonal cells, the table treats them as the whole box around them. Our fix for that broke Shift+arrow selection, so we took it out. Dragging and the keyboard always pick a box, so you won't hit this in normal use. A proper fix is on the follow-up list, with a few smaller leftovers.

## Teach

When you paste, the editor asks each format in turn whether it wants the clipboard. Today the CSV plugin asks first and takes any text that looks like two columns. So "Hello, world" on two lines becomes a table. Spreadsheet copies never needed it, because Sheets and Excel also put an HTML table on the clipboard.

After this change the CSV plugin is gone. One job stays, and Table owns it. You select some table cells and paste plain text with tabs in it, from a terminal, a text editor or a spreadsheet pasted as plain text. Table puts one field in each cell, like a spreadsheet does, and never splits on commas. Quotes come off a field only when Table's own copy would have added them.

When the pasted grid is bigger than your selection, Table keeps what fits and says how many fields it left out.

## Public API

The editor kit installs the CSV plugin today; after the cut, Table's own kit covers tab-separated paste and the line goes.

```ts before
// apps/www/src/registry/components/editor/plugins.ts
import { CsvPlugin } from 'platejs/csv';

export const EditorKit = [
  // Parsers
  CsvPlugin,
  WordPastePlugin,
  ...MarkdownKit,
] as const;
```

```ts after
// apps/www/src/registry/components/editor/plugins.ts
export const EditorKit = [
  // Parsers
  WordPastePlugin,
  ...MarkdownKit,
] as const;
```

The plugin's configuration exposed an error tolerance and PapaParse's whole option object; both are deleted with no replacement, because the reader is strict and has no options.

```tsx before
// content/docs/(plugins)/(serializing)/csv.mdx
CsvPlugin.configure({
  initialState: {
    errorTolerance: 0.1,
    parseOptions: {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
    },
  },
}),
```

```tsx after
```

Direct conversion through the plugin API is deleted; no caller outside the docs, a type contract, a changeset and generated JSON uses it.

```tsx before
// content/docs/(plugins)/(serializing)/csv.mdx
const nodes = editor.api.csv.deserialize({
  data: csvData,
  delimiter: ';',
  skipEmptyLines: true,
});
```

```tsx after
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Tab-separated text grammar, read and write | Plate | `platejs/table` (`features/table/lib/internal/tabularText.ts`, private) | Table writes TSV on copy, so its reader and writer share one dialect |
| Selected-cell `text/plain` paste format | Plate | `platejs/table` (declared in `features/table/lib/internal/tabularText.ts`, registered on `BaseTablePlugin`) | Table owns the cell selection, the node factories, ragged-row repair and the fitter |
| Selected-cell copy writes TSV `text/plain` through the shared serializer, and `text/csv`, `text/tab-separated-values` and `text/tsv` go | Plate | `platejs/table/react` (`TablePlugin.tsx`) | What Table writes on copy is what it reads on paste; no reader exists for the other three types |
| `platejs/csv`, `CsvPlugin`, papaparse | Plate | deleted | No job that Table and the HTML format do not already own |

## Hard cuts and app migration

The whole `platejs/csv` entrypoint goes in one wave, with no alias, and comma splitting on selected cells goes with it.

- Source and package: `packages/platejs/src/csv/` (`CsvPlugin`, `CsvPluginState`, `CsvParseOptions`, `DeserializeCsvOptions`, `CsvDefinition`, `editor.api.csv.deserialize`), `src/csv/index.ts` in `packages/platejs/tsdown.config.mts`, the `./csv` export, the `papaparse` and `@types/papaparse` peer, dev and `peerDependenciesMeta` entries in `packages/platejs/package.json`, and `pnpm-lock.yaml`. `PLUGINS.csv` in `packages/platejs/src/utils/plate-keys.ts`.
- Entrypoint graph: the `csv` node and its task-partition entry in `tooling/entrypoints/entrypoint-dag.mjs`, then the owning generator (`pnpm generate`) for the `platejs/csv` paths in the root `tsconfig.json`, `packages/platejs/tsconfig.json`, `packages/plitejs/tsconfig.json`, `packages/test/tsconfig.json`, `packages/cli/tsconfig.json`, `apps/www/tsconfig.json`, `tooling/config/tsconfig.test.json`, `tooling/config/tsconfig.type-tests.json` and the `*:partition:csv` scripts.
- Checks: the `CsvPlugin.ts` allowance in `tooling/scripts/check-plate-schema-adoption.mjs` and its fixture in `check-plate-schema-adoption.test.mjs`, and the `CsvPlugin.ts` entry in `tooling/oxlint/plate-baseline.json`.
- Review ledger: the `CsvPlugin` paths in `docs/research/review-scopes/table.json` (members and evidence inputs), `exports.json` and `imports.json` (evidence inputs), and `csv.json` (members and proof).
- Kit: the `CsvPlugin` import and entry in `apps/www/src/registry/components/editor/plugins.ts`.
- Docs and examples: `content/docs/(plugins)/(serializing)/csv.mdx` and its `.cn.mdx` twin, the `csv` entry in `content/docs/meta.json` and `apps/www/src/config/docs-icons.tsx`, the `csv-demo` registry example in `apps/www/src/registry/registry-examples.ts`, both `deserialize-csv-value.tsx` values with their `demo-values.tsx` and `apps/www/src/i18n/getI18nValues.ts` wiring, and both `csv` sites of `apps/www/src/__tests__/package-integration/core-runtime/editor-api-inference.contract.ts`.
- Browser proof: `tooling/e2e/table-demo.test.ts` pastes `Alpha,Beta\nOne,Two` onto selected cells and expects four values; it becomes the tab-separated case, with a comma case asserting the text stays whole. Its copy case stops expecting `text/csv` and `text/tsv`.
- Agent files and research: the CSV rows of `.agents/rules/plate-plugins/references/plugin-authoring-audit.md` (regenerated into its skill mirror), the CSV line of `2e865a0bc4:docs/research/decisions/clipboard-content-fitting.md` and of `docs/research/sources/plite/conversion-and-export.md`, both through `research`'s maintain mode.
- Release note: `.changeset/csv-v54-runtime.md` is unreleased in pre mode; it becomes the removal note.
- Generated: registry output (`pnpm --filter www build:registry`), barrels (`pnpm brl`) and the API reference manifest, regenerated in a proof worktree per `verify`'s command recipes.
- App migration: remove `CsvPlugin` from the plugin list. Spreadsheet copies keep pasting as tables through HTML. An app that converts CSV strings parses them and inserts table nodes with its own code.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Paste with `text/html` or `text/markdown` present | HTML or Markdown always wins; nothing tabular takes the plain-text part | jsdom paste specs; Chromium www clipboard spec |
| Paste of plain prose, CSV or a Markdown table at a caret | Goes to Markdown or plain text, never a table | jsdom paste spec with the kit's Markdown configuration |
| Paste of tab-separated text onto a rectangular cell selection, a node selection read as the range between its endpoints | One field per cell instead of the whole text repeated in every cell | jsdom paste spec; Chromium e2e case in `tooling/e2e/table-demo.test.ts` |
| Paste of comma text onto selected cells | Stays whole text in each cell, as Sheets and Excel do | jsdom paste spec; Chromium e2e case |
| Paste of a grid larger than the selection | Same placement, now with a lossy report naming the fields left out, and work bounded by the selection | jsdom paste spec reading the paste result; ragged-source timing probe |
| Copy of several cells | TSV `text/plain` quotes fields holding a tab, CR or LF or starting with a quote; no `text/csv`, `text/tab-separated-values` or `text/tsv` | jsdom clipboard spec; Chromium e2e copy case |
| Paste of a spreadsheet as plain text onto selected cells | A quoted multi-line cell lands as one field | jsdom paste spec with a Sheets-shaped `text/plain`-only payload |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The CSV plugin and its import | Deleted outright (look) | Keep it behind a strict paste gate | keep csv | big |
| Comma text pasted onto selected cells | Stays whole, like Sheets and Excel (look) | Split it into columns | commas | big |
| Plain CSV pasted outside a table | Stays text | Guess a table from the text | guess | big |
| A way for app code to convert CSV | None for now (look) | A parse call on Table | parse | small |
| Lines without tabs pasted onto selected cells | Same as today, the text fills each cell | One line per row | lines | small |
| Tab-separated text with the caret in one cell | Stays text in that cell | Spread it from that cell | spread | small |
| A grid bigger than the selection | Keep what fits and report the rest | Refuse the paste | refuse | small |
| Silent crops from HTML or Markdown tables | Left for a later Table plan | Report them in this plan | crops | small |
| CSV and TSV types written when copying cells | Only plain tab-separated text, beside the editor's own copy (look) | Keep writing them for unknown readers | csv copy | small |
| A pasted field with line breaks | One paragraph per line in its cell | One paragraph keeping the breaks | one paragraph | detail |
| Quotes in tab-separated text | Kept, unless a quoted field holds a tab, a line break or a leading quote | Always strip them | quotes | detail |
| One demo page we didn't touch crashes when it loads | Finish anyway and put it on the follow-up list (look) | Wait until that page is fixed | redrive | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Caret `text/plain` CSV claim | `CsvPlugin` priority 20, no `accept` | none | Markdown and the core plain-text format | Probes 1, 2 and 7 hijack prose and Markdown; no reference editor parses CSV at a caret | kit line removed | `base-controls-a1.log`; Table and Markdown paste specs | users who pasted terminal CSV at a caret get text | cut |
| CSV programmatic API | `editor.api.csv.deserialize` with PapaParse options | none | app code | no caller; no Vision-named job | docs page deleted | typecheck and teaching sweep | an app using it breaks at upgrade | cut |
| Comma split on selected cells | through the CSV claim, tested in `table-demo.test.ts` | none | none | spreadsheets do not split commas on paste; prose with commas would split | e2e case rewritten | Chromium e2e comma case | users pasting comma rows onto cells get whole text | cut |
| Selected-cell tab-separated text | through the CSV claim | Table `text/plain` format: rectangular multi-cell selection, with a node selection read as the range between its endpoints, a tab in the text, no HTML, Markdown or files | Table | without it the fitter repeats the text in every cell (`base-controls-a1.log`) | none needed | Table paste spec; Chromium e2e | prose with tabs splits | rearchitect |
| Typed `text/csv` and TSV readers | none | none | none | no producer reaches them: Plate's copy carries its fragment and HTML, read first (`dom-clipboard-runtime.ts` lines 699 to 711) | none | none | none | cut |
| TSV copy writer | unescaped `text/plain`, plus `text/csv`, `text/tab-separated-values` and `text/tsv` | `text/plain` through the shared serializer only | Table React | a cell holding a tab or newline breaks its row on re-entry; no reader exists for the three typed writes | e2e copy case updated | clipboard spec; Chromium e2e copy case | an unknown reader of a typed write loses it | rearchitect |
| Crop of a larger tabular paste | silent | the decoder keeps min(rows, selection height) rows and min(widest row, selection width) fields, pads kept rows to that width and reports the dropped non-empty fields | Table | a whole-payload format reports what it leaves out; trimming also bounds the work (`probe-ragged-blowup-a1.log`) | none needed | paste spec reading the report; timing probe | none | rearchitect |
| Crop of HTML, Markdown and fragment pastes | silent, unbounded repair | unchanged here | Table | placement happens after the report channel closes (`data-transfer-format.ts` lines 999 to 1043) | none | none | slow or silent big pastes | defer: Open work |

## Steps

Each step runs on the build playbook, `.agents/playbooks/build.md`.

### Phase 1: Table reads and writes tab-separated text

- [x] Add `features/table/lib/internal/tabularText.ts` with `parseTabSeparated(text)` and `serializeTabSeparated(rows)`. A line break is CR, LF or CRLF in both. The reader splits records on line breaks and fields on tabs and drops one trailing line break. A field that starts with a quote is read as quoted when a closing quote sits right before a tab, a line break or the end, with doubled quotes inside, and the decoded value holds a tab, a line break or a leading quote. The scan stops at the first quote that is neither doubled nor at a field boundary, and the field is then literal up to the next tab or line break, so the reader stays linear. The writer quotes exactly the fields that hold a tab or a line break or start with a quote, doubles their inner quotes and ends every row with LF, so every grid it writes reads back to itself. Proof: `tabularText.spec.ts` with a round trip over every 1x1, 1x2 and 2x1 grid whose fields are up to three characters from quote, tab, LF, CR and `a` (48,828 grids); the colliding rows `["\"a", "b\"", "c"]` and `["a\tb", "c"]`; a ditto row `["\"", "6\""]`; the grid `[["a"], [""]]`; the strict-quote text `"a<tab>b"c"<tab>d` reading as three fields; a literal `"quoted"` field; an unclosed quote; a trailing line ending; empty fields; and ragged rows. It fails against an empty implementation first.
- [x] Switch the copy writer in `TablePlugin.tsx` to write only the TSV `text/plain` through `serializeTabSeparated`, beside the slice and HTML, joining a cell's blocks with LF, and drop `text/csv`, `text/tab-separated-values`, `text/tsv` and `escapeCsvField`. Proof: `BaseTablePlugin.clipboard.spec.tsx` gains a copy of cells holding a tab, a two-paragraph cell, a leading quote and a plain quote, asserting the exact `text/plain` bytes and the absent types; it fails before the change.
  The proof landed in `packages/platejs/src/react/features/table/TablePlugin.clipboard.spec.tsx`, because the writer lives in the React plugin. The diff panel added one copy case: a merged cell writes an empty field for every slot it spans, so a pasted copy keeps each field in its column.
- [x] Share one private check for a complete rectangular cell selection between Table's `replaceSlice`, the copy writer and the new format. Proof: the existing paste and clipboard specs pass unchanged. Closed by `isRectangularTableSelection` in `packages/platejs/src/features/table/lib/internal/selection.ts` and `docs/plans/artifacts/2026-10-14-csv-review/acceptance-final-a1.log`.
- [x] Add Table's `text/plain` format, declared inline in `BaseTablePlugin`'s last `.extend` stage, which also owns the paste command it feeds, at a priority above `CsvPlugin`'s 20, so it runs first while `CsvPlugin` still exists. `accept` holds only when the payload has no `text/html`, `text/markdown` or files, the selection passes the shared rectangle check with two or more cells, and the text holds a tab. `decode` parses the text, keeps min(rows, height) rows and min(widest source row, width) fields of `view.bounds`, pads kept rows to that width, reports the dropped non-empty fields as one lossy diagnostic, and returns a closed table slice whose cells hold one paragraph per line of their field. Proof: `BaseTablePlugin.paste.spec.tsx`, building editors without `CsvPlugin`, with cases for a 2x2 TSV onto a 2x2 selection (filled field by field; the repeat before the format is the failing control), comma text onto cells (whole text in each cell), text with `text/markdown` (Markdown wins), text with HTML (HTML wins), a 3x3 grid onto a 2x2 selection (four fields land and one lossy report names five), `a\nb\nc\td` onto a 2x2 selection (lands `[["a", ""], ["b", ""]]`, matching the untrimmed planner), a 2x2 selection whose top row is one cell with `colSpan=2` (four fields land, no report), a Sheets-shaped plain-only payload with a quoted multi-line cell (one field), a nonrectangular selection (no claim) and a caret in one cell (stays text).
  The build narrowed "a nonrectangular selection (no claim)" after the diff panel. The format reads a node selection as the range between its endpoints, as Table's copy, cut, structural paste and commands do, so a node selection of cells whose endpoint range is a full rectangle is claimed. The decision log's round-3 rows hold the reason, and Open work holds the follow-up.
- [x] Rewrite two e2e cases in `tooling/e2e/table-demo.test.ts`: the paste case pastes `Alpha\tBeta\nOne\tTwo`, and the copy case stops expecting `text/csv` and `text/tsv`. Proof: the Chromium run of that file against a doctored www server, its log naming both cases. Closed by `docs/plans/artifacts/2026-10-14-csv-review/e2e-clipboard-chromium-a2.log` (6 of 6) and `docs/plans/artifacts/2026-10-14-csv-review/e2e-table-demo-chromium-final-a1.log` (10 of 10 on the final bytes).
- [x] Rerun the ragged timing probe through the new format: a 400-field first row and 399 one-field rows onto a 2x2 selection, and 100,000 `"a<tab>` fields in one row. Proof: `probe-ragged-trim-a<N>.log` with each paste under 50 ms, against 3,585 ms in `probe-ragged-blowup-a1.log`.

### Phase 2: cut `platejs/csv`

- [x] Run `pstack:blast-radius` on the deleted code and add any consumer it finds to the Hard cuts list. Proof: `docs/plans/artifacts/2026-10-14-csv-review/blast-radius.md`.
- [x] Delete every path listed under Hard cuts and app migration, then run `pnpm generate` and `pnpm brl`. Proof: `git grep -n -E "CsvPlugin|api\.csv|platejs/csv|papaparse|PLUGINS\.csv"` over live source, docs, skills, tooling and open plans lists only history and this plan, saved as `cut-grep-a<N>.log`.
- [x] Rerun the base-control probe without CSV. Proof: `probe-cut-a<N>.log` shows prose with or without HTML land as paragraphs, a TSV paste onto selected cells fills them field by field, and the spreadsheet HTML probe still builds a table.
- [x] Add the comma case to `tooling/e2e/table-demo.test.ts`: `Alpha,Beta\nOne,Two` pasted onto selected cells keeps each cell's text whole. Proof: the Chromium run of that file, its log naming the case. Closed by `docs/plans/artifacts/2026-10-14-csv-review/e2e-clipboard-chromium-a2.log`, which names "keeps comma text whole in each selected table cell".
- [x] Run `pnpm check entrypoint-graph`, `pnpm check barrels` and `pnpm --filter platejs typecheck`. Proof: each log exits 0.

### Phase 3: teach and release

- [x] Through `plate-docs`, add a "Paste tab-separated text" section to `content/docs/(plugins)/(elements)/table.mdx` and its `.cn.mdx` twin, with the docs checks and a preview read. Proof: the docs check log and the rendered page read. Closed by `docs/plans/artifacts/2026-10-14-csv-review/docs-check-a1.log`; the rendered-page read of `/docs/table` and `/cn/docs/table` is the hand drive's row in the decision log.
- [x] Through `changeset`, rewrite `.changeset/csv-v54-runtime.md` as the removal note and add the Table entry. Proof: the changeset files.
- [x] Through `best-api repair`, run `node tooling/scripts/teaching-sweep.mjs CsvPlugin deserialize papaparse` and fix every live hit. Proof: the sweep log with no live hit.
- [x] Update `docs/research/review-scopes/csv.json` to own Table's tab-separated files and drop the deleted members. Proof: `node tooling/scripts/review-ledger.mjs check` and `lookup csv`.

## Proof

Tests alone are not sufficient verification. The phases close on the jsdom paste and clipboard specs above, the probes rerun on the final bytes, the `pnpm check` steps the edits reach, the Chromium e2e cases in `tooling/e2e/table-demo.test.ts`, and a hand drive of pasting tab-separated text onto selected cells on the table demo. The only scale gate is the ragged timing probe: the new format trims to the selection before Table builds the grid, so its work is bounded by the selection size.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Hard cut sweep and `best-api repair` | `docs/plans/artifacts/2026-10-14-csv-review/cut-grep-a1.log`; `docs/plans/artifacts/2026-10-14-csv-review/teaching-sweep-a1.log` |
| `pstack:blast-radius` before code moved | `docs/plans/artifacts/2026-10-14-csv-review/blast-radius.md` |
| `plate-docs` on the Table page and its twin | `docs/plans/artifacts/2026-10-14-csv-review/docs-check-a1.log` |
| `pnpm check` steps the edits reach | `docs/plans/artifacts/2026-10-14-csv-review/entrypoint-graph-slice-a1.log`; `docs/plans/artifacts/2026-10-14-csv-review/p2-barrels.log`; `docs/plans/artifacts/2026-10-14-csv-review/spec-tsc-final-a1.log` |
| `pstack:thermos` per slice | skip: the `api-build` row owed a panel on the diff from the first slice, and every panel seat applies both lenses |
| Panel on the diff (`api-build`) | three rounds, logged under phase `panel` in the decision log; answers in `docs/plans/artifacts/2026-10-14-csv-review/panel-build-1/`, `panel-build-2/` and `panel-build-3/` |
| Scale rerun on the final path | `docs/plans/artifacts/2026-10-14-csv-review/timing-final-a1.log` |
| Mutation proof on the final bytes | `docs/plans/artifacts/2026-10-14-csv-review/mutate-final.json`; `docs/plans/artifacts/2026-10-14-csv-review/mutate-final-writer.json` |
| Hand drive | accepted under the "redrive" Defaults row: `docs/plans/artifacts/2026-10-14-csv-review/hand-drive-check-a3.log`, 22 cells covered and `/blocks/installation-next-demo` erroring from a file this run never edited |
| Last lint fix | `docs/plans/artifacts/2026-10-14-csv-review/lint-task-final-a1.log` |
| Repeated acceptance proof | `docs/plans/artifacts/2026-10-14-csv-review/acceptance-final-a1.log`; `docs/plans/artifacts/2026-10-14-csv-review/e2e-table-demo-chromium-final-a1.log` |
| Full platejs suite | `docs/plans/artifacts/2026-10-14-csv-review/final-platejs-all-a1.log`; its 17 failures fail the same way at `HEAD` (`docs/plans/artifacts/2026-10-14-csv-review/attrib-head-a1.log`) |
| Changesets and registry changelog | `.changeset/csv-v54-runtime.md`; `.changeset/table-tab-separated-paste.md`; `apps/www/src/registry/changelog/entries/2026-10-14-remove-csv-plugin.mdx` |
| Decision-trail review | `docs/plans/artifacts/2026-10-14-csv-review/trail-review/seat-sol.md` |

## Close

The reversal comes first. The diff panel's round-1 and round-2 fixes for node selections were reverted, and the claim narrowed. Table's tab-separated format reads a node selection as the range between its endpoints, as Table's copy, cut, structural paste and commands already do. So a node selection of three cells of a 2x2 table, or of diagonal cells, can still be claimed and filled off the selected cells. Round 2 moved node-selection reading into `readTableSelection`, which fixed those cases. Round 3 found that the move dropped the selection's direction, so a second Shift+Up collapsed a cell selection to a caret. It also let `removeRow` and `removeColumn` delete whole tables for sparse selections. The mechanism had used its one replacement, so the panel rule took it out of the loop. Every place in product code that makes a node selection of table cells builds a rectangle, so ordinary use is unaffected. The node-selection rework is Open work.

What landed. `platejs/csv` is gone: `CsvPlugin`, `editor.api.csv`, `PLUGINS.csv`, the papaparse peer, its docs, demo, kit line and generated registry entries. Table reads tab-separated `text/plain` pasted onto a rectangular selection of two or more cells, one field per cell, when the clipboard has no HTML, Markdown or files. It keeps the rows and columns that fit and reports the fields it leaves out. Copying cells writes only tab-separated `text/plain` beside the editor's own copy and HTML. A merged cell writes an empty field for each slot it spans. Comma text stays whole in each cell.

Proof and its limits.

- **Mutation proof.** Eleven mutants each fail their named spec case on the final product bytes. Eight cover the format's accept and decode and the rectangle check, one the lossy report, and two the writer's padding checks.
- **Round-3 settlement.** Sol's round-3 probe, rerun unmodified on the final tree, shows a backward selection keeping its direction and Shift+Left growing it to six cells. `removeRow` and `removeColumn` refuse the L-shaped selection, and every cut clears exactly the cells it copied.
- **Scale gate.** The timing probe's medians run from 8.4 to 15.3 ms against a 50 ms budget, and 3,585 ms at `HEAD` for the ragged source. It ran under happy-dom from source.
- **Specs.** The Table specs pass 277 of 277.
- **Chromium e2e.** The table-demo e2e passes 10 of 10, with the tab-separated paste, the whole comma text and tab-separated copy among them.
- **Hand drive.** It pasted tab-separated text onto two by two selected cells of the `/docs/table` demo. 22 cells are covered. `/blocks/installation-next-demo` throws from a file this run never edited, and Open work tracks it.
- **Full platejs suite.** 17 tests fail, the same 17 that fail at `HEAD`.
- **Spec typecheck.** It reports 299 errors, the same count as the current `HEAD`, the four Details spec errors included. None is in a table or csv file.
- **Not proven.** Excel and Sheets quoting and comma behavior come from their documentation, not a capture. Safari and native mobile paste were not driven.

Counts. The plan has 15 steps: 15 done, 0 partial, 0 skipped, 0 blocked, 0 open. The Completion Gates hold 14 rows: 12 done, 1 partial (the hand drive) and 1 skipped (thermos, with its reason).

The run commits nothing, per the Delivery rule; the owner commits.

### Attention

Reviewed by gpt-6.1-sol at xhigh, the decision-trail review. It read the log against the whole transcript.

- **Round-3 settlement.** It found that no run of the seats' exact round-3 cases followed the revert. That run now exists and passes, as the Round-3 settlement line above says.
- **Narrowed claim.** It found the narrowed claim missing from three plan lines and the subject file, now fixed.
- **Attribution.** It found two attributions resting on a tree that held this run's own changes. Both now rest on `HEAD`.
- **Slips.** It counted slips the log had missed. `sed -i` ran three times, twice as a no-op on `/dev/null`. Inline Python rewrote run-directory files. `build:registry` regenerated two generated files that held other sessions' edits before they were copied. Those files regenerate from their sources, so no loss is shown.
- **Upheld.** It upheld the revert under the one-replacement rule, the Markdown and quoting dismissals, the registry-only generation and the unattributed demo error.

### Review inputs

The files this plan's `review_inputs` names, which its review and proof read:

- `packages/platejs/src/csv/lib/CsvPlugin.spec.ts`
- `packages/platejs/src/features/table/lib/BaseTablePlugin.paste.spec.tsx`
- `packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.spec.tsx`
- `packages/platejs/src/markdown/lib/MarkdownPlugin.ts`
- `packages/plitejs/src/dom/plugin/data-transfer-format.ts`
- `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts`
- `packages/platejs/src/internal/plugin/compilePlateFormats.ts`
- `tooling/entrypoints/entrypoint-dag.mjs`
- `tooling/e2e/table-demo.test.ts`

## Open work

- Table crops HTML, Markdown and fragment pastes onto a smaller selection silently, and a ragged pasted table pads its whole rectangle before cropping (`probe-ragged-blowup-a1.log`). Reporting needs the paste outcome to carry the fitter's loss, a Plite change. owner: zbeyens. stop: a Table clipboard fitting plan, or 2026-11-30.
- Table's structural plain-text mapping (`BaseTablePlugin.ts` line 680), which copies a table inside a larger selection, joins cells with tabs and turns line breaks into spaces without quoting, so a cell holding a tab or starting with a quote can misread on re-entry. This plan's shared serializer covers only the selected-cell copy. owner: zbeyens. stop: a Table plain-text review, or 2026-11-30.
- Several selected cells and pasted HTML or multi-line text without tabs still repeat the whole content in every cell. owner: zbeyens. stop: the same Table clipboard fitting plan, or 2026-11-30.
- Table reads a node selection as the range between its endpoints. So a node selection of three cells of a 2x2 table, or of diagonal cells, can be claimed by the tab-separated format and filled off the selected cells. Cut can clear cells that were not selected. Removing non-adjacent rows deletes the whole table. A whole-table selection over a row-spanned column reads only its first columns. The diff panel's round-2 fix moved node-selection reading into `readTableSelection`, and round 3 showed that it lost the selection's direction, which broke Shift+Arrow. It also made `removeRow` and `removeColumn` delete sparse selections, so the build reverted it. The fix keeps the anchor and focus paths, checks `view.complete` in `removeRow` and `removeColumn`, deletes on cut the cells the writer copied, and caches the derived view per state. Tracked as a suggested task. owner: zbeyens. stop: a Table node-selection plan lands, or 2026-11-30.
- A node selection that mixes table cells and an outside paragraph pastes into empty table rows. The tree from before this run's round-2 fix does the same (`docs/plans/artifacts/2026-10-14-csv-review/probe-round2-frozen-a1.log`). owner: zbeyens. stop: the same Table node-selection plan, or 2026-11-30.
- `apps/www/src/generated/api-reference-manifest.json` still lists `readonly csv: 'csv'` in the `PLUGINS` signature. `api-reference` needs a package build, and the plitejs build fails at `HEAD` on stale authored declarations (`docs/plans/artifacts/2026-10-14-csv-review/api-reference-a1.log`). owner: zbeyens. stop: the next `pnpm --filter www api-reference` run after the plitejs build passes.
- `/blocks/installation-next-demo` throws "localStorage is not defined" during server render, from `apps/www/src/registry/examples/installation-next-04-value-demo.tsx` line 53, which this run never edited (`docs/plans/artifacts/2026-10-14-csv-review/hand-drive-check-a3.log`). owner: zbeyens. stop: that demo reads storage only after mount.

## Evidence

Model: claude-opus-5-5 at high effort, read from this session's metadata.

This plan retains the [2026-10-04 csv audit](../research/review-records/2026-10-04-csv-audit.json) as its governing Pursue and replaces its proposed call shape with the bakeoff's winner as the plan panel revised it. It reads the [2026-07-10 package review plan](2026-07-10-plate-next-csv-cursor-date-package-reviews.md) and the [2026-03-23 coverage pass](2026-03-23-csv-coverage-pass.md) as history only, because neither judged paste semantics.

### Requirements

- Spreadsheet copies paste as tables. Google Sheets and Excel put an HTML table on the clipboard, and the HTML format builds it without CSV (`probe-spreadsheet-html-a1.log`; issue udecode/plate#2365 is this job).
- A tabular claim never takes a payload another format owns, such as HTML, Markdown or prose ([plate.md](../vision/plate.md) lines 1053 to 1054).
- A whole-payload format reports what a paste leaves out ([plate.md](../vision/plate.md) lines 1065 to 1067).
- Tab-separated fields pasted onto cells land verbatim, quoted line breaks and tabs included.
- Every API, owner and package earns its place, with hard cuts over aliases ([VISION.md](../../VISION.md), Next beta and Invariant 1).
- One way per operation, and a payload never becomes a parallel authority ([common.md](../vision/common.md), Taste).

### Lanes

- Keep `CsvPlugin` as it is. Loses: the five probe failures reproduce at HEAD (`base-controls-a1.log`).
- The audit's lane: keep `platejs/csv` with an `accept` gate, verbatim cells and `parse` with diagnostics. Loses: "Hello, world" on two lines is valid two-column CSV in any grammar, so a caret claim stays a guess, and it needs a new csv-to-table entrypoint edge and public Table factories.
- Pure deletion, the candidate that adds no artifact. Loses narrowly: it turns tab-separated paste onto selected cells into the whole text repeated in every cell (`base-controls-a1.log`) and keeps the unescaped TSV writer.
- Table owns the reader and a public `parse(source, { format })` (two Codex runners). Loses on the parse call: no caller and no Vision-named job.
- Typed `text/csv` and TSV readers (the bakeoff's first pick). Cut by the plan panel: no producer reaches them.
- Chosen: Table owns one private tab-separated grammar that reads back every grid its copy writes, reads `text/plain` only on a rectangular multi-cell selection, reading a node selection as the range between its endpoints as Table does everywhere, when the text holds a tab and the clipboard has no HTML, Markdown or files, trims to the selection without changing what lands, and reports what it trims. Its copy writes only that tab-separated text beside the editor's own fragment and HTML. The synthesis is `docs/plans/artifacts/2026-10-14-csv-review/synthesis.md`.

Proof limits: every paste probe ran headless under happy-dom from source; the other-editor census read source without running any editor; how Excel and Sheets quote tab-separated `text/plain`, and that they keep comma text whole on paste, come from their documentation, not a capture; a spreadsheet cell that starts with a bare quote can still merge with later fields on paste, as it does in spreadsheets.

### Dependents

- distribution: `packages/platejs/src/internal/plugin/markdownParagraph.ts` and `packages/platejs/src/utils/index.ts` import `plate-keys.ts`, which loses only its `csv` key; unaffected.
- editing: `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `SingleBlockPlugin.ts` and `SingleLinePlugin.ts` import `plate-keys.ts` for other keys; unaffected.
- ui: `apps/www/src/registry/components/editor/plugins.ts` loses its `CsvPlugin` line, and `apps/www/src/registry/examples/values/demo-values.tsx` loses its csv value; both change in Phase 2.

## Appendix A. Probe evidence

All logs sit in `docs/plans/artifacts/2026-10-14-csv-review/`: `base-controls-a1.log` (HEAD in a clean detached worktree, with and without CSV), `probe-paste-a2.log` (the five failures), `probe-ragged-a1.log` (Table pads a ragged table slice), `probe-spreadsheet-html-a1.log` (Sheets and Excel HTML paste as tables without CSV), `probe-cell-selection-a1.log` (`accept` sees a multi-cell selection) and `probe-ragged-blowup-a1.log` (an 800-cell ragged source onto a 2x2 selection takes 3.6 s).

## Appendix B. Architect bakeoff

Three runners: Opus at high, gpt-6-astra at xhigh and gpt-6.1-sol at xhigh. A cross-judge on Opus at high read anonymized copies. All three runners deleted `platejs/csv`, moved the reader beside Table's writer and dropped header inference. The judge scored the candidates 18, 21 and 20 and picked the Opus candidate as base, because the higher scorer's gaps were an API with no caller and a dropped job with evidence.

## Appendix C. Plan panel

Round 1 (claude-opus-5-5 at high, gpt-6-astra at xhigh, gpt-6.1-sol at xhigh) changed the target. Challenge delta: improved. Deleted: the typed `text/csv` and TSV readers and their Chromium capture, the CSV dialect, comma splitting on cells, newline-only admission and the Markdown-table special case. Moved: the crop report from a planner copy into the decoder's own trim, which also bounds the ragged work. Added: the `text/markdown` refusal, the rectangular-selection gate, the missing hard-cut consumers and the e2e rewrite. The seats' answers are in `docs/plans/artifacts/2026-10-14-csv-review/panel-plan-1/`.

Round 2 (same seats) found two more critical defects and the plan fixed both. All three seats showed the quote rule could not read back its own writer's output, so the writer now also quotes fields that start with a quote. Two seats showed the trim changed Table's tiling, so the decoder now keeps the narrower of the widest source row and the selection. Challenge delta: improved. Also deleted: the `text/csv` and `text/tab-separated-values` copy writes and `escapeCsvField`. Moved: Table's reader and writer now land before the cut, so no phase regresses. The answers are in `docs/plans/artifacts/2026-10-14-csv-review/panel-plan-2/`.

Round 3 (same seats) found no critical defect. The seats' own models passed the dialect on 98,833 and 127,505 round trips, and matched trimmed and untrimmed placement in 1,200 and 6,912 comparisons. Its warnings moved the comma browser case after the cut, bounded the exhaustive spec, required a final line break on copy, and joined a cell's paragraphs with line breaks. Challenge delta: unchanged. The answers are in `docs/plans/artifacts/2026-10-14-csv-review/panel-plan-3/`. That was the last plan round, so the build follows.
