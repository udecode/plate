---
review_scopes: [markdown]
review_basis: [2026-10-03-markdown-table-cell-blocks-constraints]
work_kind: implementation
---

# Block content in Markdown table cells on Plate v2

Status: awaiting the owner's answers under Needs you; built, reviewed in three diff rounds and verified otherwise, uncommitted
Playbook: plan
Page: https://claude.ai/artifact/4BAYF21juJqSKAGvyYeGQn

## Outcome

A Plate table cell can hold list paragraphs and several paragraphs. GFM gives a cell one line of phrasing. Today on `next` such a cell refuses, the refusal takes the row and the table with it, and `main`'s released cell HTML reads back as literal tags. After this plan, the writer puts a cell on one line in `main`'s released format, and the reader turns it back into list paragraphs. A cell keeps its column whatever it holds, and the runtime reports anything one line cannot carry.

The [review record](../research/review-records/2026-10-03-markdown-table-cell-blocks-constraints.json) (verdict Pursue) is the brief. The cell line-break fix it offered as a separate question is done in the working tree: `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`, with the test 'keeps line breaks inside a table cell on one row' in `packages/platejs/src/markdown/lib/table.spec.ts`.

The plan runs under the Build playbook (`.agents/playbooks/build.md`).

## Public API

App code calls nothing new. Copy, export and import round-trip cell lists under the default `lossPolicy: 'reject'`.

```ts before
editor.api.markdown.serialize({ document }); // ok: false when a cell holds a list
```

```ts after
editor.api.markdown.serialize({ document }); // ok: true, cell written as one line of HTML lists
```

A mapping for a phrasing-only container, such as the table cell, encodes block children with `encodeLine` instead of refusing or joining them by hand.

```ts before
encode: ({ encode, isPhrasing, node, refuse }) => {
  const blocks = encode(node.children);

  if (blocks.some((block) => block.type !== 'paragraph' && !isPhrasing(block))) {
    return refuse('Markdown table cells can only contain inline content.');
  }

  return { children: joinWithBr(blocks), type: 'tableCell' };
},
```

```ts after
encode: ({ encodeLine, node }) => ({
  children: encodeLine(node.children),
  type: 'tableCell',
}),
```

The table decoder reads a cell's phrasing back into blocks with `decodeLine` instead of grouping inline runs itself.

```ts before
const children = decode(cell.children, marks);
// group inline runs into paragraphs, keep block elements apart
```

```ts after
const children = decodeLine(cell.children, marks);
```

## Main changes

- A new runtime module, `packages/platejs/src/markdown/lib/internal/markdownLine.ts`, converts between block content and one line of phrasing in both directions. The two context helpers call it. It never names `tableCell`.
- On write, `encodeLine` lowers the output of `encode(children)`. Paragraphs become their phrasing, and an mdast list from `listToMdastTree` becomes `main`'s inline `<ul>`, `<ol start>` and `<li>` HTML. A heading or quote keeps its phrasing and a code or math block reduces to its text, each with one lossy warning, as the locked Cell Content Policy asks. The helper drops any other block and reports it under `lossPolicy`. `<br/>` goes only between two non-list segments. The helper never refuses, never writes a raw line ending, and leaves no `|` that would split the row.
- On read, when a list decoder is installed, `decodeLine` turns a closed `<ul>`/`<ol start>`/`<li>` run (with nested lists and, in `<ul>` only, a leading checkbox) into a standard mdast `List`. It dispatches that list as a top-level list would be dispatched, with the previous segment as its sibling, and never places it in a tree. When no list decoder accepts it, or none is installed, the run stays literal under the raw HTML rule, as today. A run deeper than `limits.maxDepth` fails the parse as a top-level list does. (Deviation during the build: depth counts from the cell and applies only to runs whose tags close.)
- The paragraph decoder treats a final `<br>` after a soft line ending as the writer's trailing break. It drops the line ending before the `<br>` and keeps the `<br>`; after an image it drops the `<br>`. Two trailing `<br/>` in a list item, and a trailing newline after bold or link text, now survive.
- A table with merged cells lays each row out through the table grid, compiled without the identity cache and only after a size bound. It writes a merged cell in its first slot and an empty cell in each slot the merge covers, and the cell reports the span as one lossy warning. A collision or an invalid span refuses the table. (Deviation during the build: no such refusal, since schema validation and the grid already prevent the loss, and each span reports `markdown-property-omitted`.) A table without merged cells writes its rows as they are.
- The locked Cell Content Policy in `docs/editor-behavior/markdown-editing-spec.md` changes to match: lists round-trip as inline HTML, text blocks collapse with a warning, other blocks drop under `lossPolicy`, and reading returns list paragraphs, paragraphs and images.
- List does not change. Table loses its cell refusal, its `<br/>` join and its paragraph grouping loop.
- Added during the build: a list item keeps raw HTML phrasing such as a bare URL instead of dropping it, and the Markdown reference and footnote passes filter nodes by type before visiting, which removes a sibling-index lookup that was quadratic in a long container.

## What other editors do

The prior-art pass read each editor at the revision below on 2026-10-03 and ran only the GFM reference libraries. No editor keeps lists or hard breaks in a cell while writing valid GFM; raw inline HTML is the only portable carrier.

| Editor | Revision | Break in a cell | List in a cell | Reads `<br>` / `<ul>` in a cell back |
| --- | --- | --- | --- | --- |
| Tiptap (`@tiptap/markdown` 3.21.0) | 91c51be53 | A whitespace pass collapses it to a space (`extension-table/src/table/utilities/markdown.ts:38`); not run | Writes `- a - b` on one line, which reads back as text; not run | Only in a browser, through a DOM HTML parse that puts a list inside an inline paragraph; not run |
| ProseMirror (prosemirror-markdown) | 221ec60 | No table support | No table support | Parser runs with `html: false` |
| Lexical (playground transformer) | dd5c41b13 | Writes a literal `\n` pair that only Lexical reads (`MarkdownTransformers/index.ts:227`); not run | Exports it in full, newline-escaped onto one line; not run | No HTML handling; stays literal |
| Milkdown (preset-gfm 7.20.0) | 6a4db480 | Blocks hard breaks in tables (`hardbreak-filter-plugin.ts:7-10`); not run | Impossible, one paragraph per cell (`schema.ts:11`) | Deletes every `<br>` on parse; `<ul>` stays raw HTML atoms; not run |
| BlockNote (core 0.54.0) | 1e26f1c | Backslash plus newline, which splits the row; its snapshot records it as expected; not run | Impossible, cell content is inline | `<br>` reads as a break; lists flatten into text; not run |
| Slate | 945a484df | No Markdown serializer | No Markdown serializer | No Markdown serializer |
| markdown-it (GFM reference) | 3c51991 | Rows are single lines; only raw `<br>` carries a break | No block parsing in cells | `html_inline` tokens only with `html: true`; not run |
| micromark, mdast-util-gfm-table (GFM reference) | gfm-table 2.0.0 | Run: `break` writes a space, a text newline writes `&#xA;` | Run: a list forced into a cell breaks the table | Run: one flat `html` node per tag, with no structure |
| Plate `main` (v53, PR 5139) | 961c65be4c | `<br/>` | One-line `<ul>`, `<ol start>`, `<li>`, task checkbox | Reads its own format back through a Table-owned decoder |

Tiptap's tag-matching rejoin is the only reusable reading pattern the pass found, and it needs a DOM. The design reads the flat tag tokens itself, DOM-free, as micromark delivers them.

## Document shape

The stored Plate JSON does not change. Parsing changes what the editor, and every app that reads the parsed document, receives for the children of `main`'s released cell `Intro<ul><li><input type="checkbox" checked disabled /> ship<br /></li></ul>`. The before shape was measured on `HEAD` 209bbb7ff3, which also reports five lossless warnings; the after shape is the target.

```json before
[{ "type": "paragraph", "children": [{ "text": "Intro<ul><li><input type=\"checkbox\" checked disabled /> ship\n</li></ul>" }] }]
```

```json after
[
  { "type": "paragraph", "children": [{ "text": "Intro" }] },
  { "type": "paragraph", "indent": 1, "listType": "task", "checked": true, "children": [{ "text": "ship\n" }] }
]
```

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| One-line codec, `encodeLine` and `decodeLine` | Plate | `platejs` Markdown runtime | HTML list spelling in a phrasing-only container is dialect syntax; List keeps list semantics |
| Trailing-break rule | Plate | `platejs` Markdown runtime, paragraph intrinsic | The rule drops content the writer never wrote; the owner of the rule fixes it |
| Row layout through the grid, span flattening, slot budget | Plate | `platejs` Table feature | Column geometry is Table's; the runtime never sees it |
| Cell Content Policy | Plate | `docs/editor-behavior` | Locked editor-behavior law must state what the code does |
| List decode and `listToMdastTree` | Plate | `platejs` List feature and Markdown runtime | Unchanged |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Copy of a table whose cells hold lists | Copy writes `text/markdown` instead of failing the serialize | Package serialize test under `reject`; no browser copy runs, so the clipboard claim stops at the serializer |

## Decisions

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cell writing | Table refuses non-paragraph blocks and joins with `<br/>` | `encodeLine` lowers `encode(children)` to `main`'s format, collapses text blocks, drops the rest, never refuses | Markdown runtime | The record's target; list topology and D18 reports stay in `listToMdastTree` | Table cell encoder calls it | Steps 1.1 to 1.4, 1.7 | A task item next to a bullet opens a second `<ul>` where `main` keeps one | move |
| Cell reading | Table groups inline runs; list HTML stays literal | `decodeLine` reads lists through List's decoder and groups the rest | Markdown runtime | One codec for one syntax; no private tree; List owns semantics | Table decoder calls it; other `node: 'table'` decoders opt in | Steps 2.2 to 2.4 | Restart reading depends on the sibling it passes | rearchitect |
| List semantics | List decoder, `listToMdastTree` | Unchanged | List, Markdown runtime | Both already own restart, start and task logic | None | Existing list tests | None found | keep |
| Trailing break | The decoder drops any final break leaf | A final `<br>` after a soft line ending replaces that line ending; after an image it is dropped | Paragraph intrinsic | The decoder dropped content the writer never wrote, inside and outside cells | All paragraphs | Step 2.1, prototype | Hand-written `a<br/>` now reads `a\n` | rearchitect |
| Cell geometry | A span refuses the cell, the row and the table | Tables with merged cells laid out through an uncached grid after a size bound; one lossy warning per span; collisions and invalid spans refuse | Table | A refused cell can no longer shift columns; covered slots stay | Table encoder | Step 1.5 | Merged-cell tables now export under `reject` | rearchitect |
| Block a line cannot hold | Refusal cascades to the table | Headings and quotes keep their phrasing, code and math blocks reduce to text, all with a warning; others drop under `lossPolicy` | Markdown runtime | The locked policy keeps content order | Through `encodeLine` | Step 1.6 | Resized images drop (Risks) | rearchitect |
| Empty cell | Writes a zero-width space and reads it back as a literal character | Reads back as an empty paragraph | Markdown runtime | Same normalization the paragraph decoder applies | Through `decodeLine` | Step 2.4 | None found | rearchitect |
| Conversion cost | Per-cell encode and grouping | One linear scan per cell on read; one grid layout per table on write | Markdown runtime, Table | Scale-sensitive per AGENTS.md | None | Steps 1.8, 2.6 | Large tables slow down | gate |
| Cell Content Policy | Locked law: blocks collapse to `<br/>` and read back as one paragraph | Lists round-trip as inline HTML; text blocks collapse with a warning; other blocks drop under `lossPolicy` | Editor-behavior law | The code must match locked law | `markdown-editing-spec.md` | Step 3.1 | None found | rearchitect |
| Teaching | Docs say a cell holds inline content and lossy diagnostics follow `lossPolicy` | Docs teach both helpers, the cell reading rule and which losses warn under `reject` | Plate Docs | Public context members and loss behavior change | Markdown and List docs, decision page, changeset, rules | Steps 3.2 to 3.6 | None found | rearchitect |

Challenge delta: improved. The arena's three candidates and the cross-judge replaced the record's compiler pass and private list shape inside `tableCell` with one codec module behind two context helpers. That deleted the runtime's knowledge of `tableCell` and every non-standard mdast tree. Paragraph grouping moved from Table into the codec, and span geometry moved from a refusal to Table's grid layout. Panel round 1 then deleted the cell-only report buffer and the `isListElement` export, moved the trailing-break rule from decoded leaves to mdast nodes, and turned dropping into collapsing for text blocks. The synthesis note is in Appendix A.

## Steps

Phase 1 writes cells on one line. It is valuable alone because no table is dropped over cell content, and lists, text blocks and merged cells export under `reject` in a format `main` already reads. Without Phase 2, `next` reads its own cell lists back as literal tags with lossless warnings, as it reads `main`'s today. It ends with a keep or revert decision.

- [x] 1.1 Add `encodeLine` to `MarkdownEncodeContext` in `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`. Its JSDoc says that `encodePhrasing` encodes inline nodes while `encodeLine` encodes block children onto one line, and that its output reads back only through `decodeLine`. Implement it in `markdownLine.ts` and wire it in `createEncodeContext`. It lowers the output of `encode(children)`, so list runs stay grouped by `convertNodesSerialize`. Proof: step 1.7's tests. Closed: `packages/platejs/src/markdown/lib/internal/markdownLine.ts` `encodeMarkdownLine`, wired in `markdownMappings.ts` `createEncodeContext`; `table.spec.ts` "cells holding blocks".
- [x] 1.2 Lower lists to `main`'s format: `<ul>`, `<ol>`, `<ol start="n">` only when n is not 1, `<li>`, nested lists inside `<li>`, and in `<ul>` only a leading `<input type="checkbox" checked disabled /> ` or `<input type="checkbox" disabled /> `. Proof: step 1.7's byte test. Closed: `markdownLine.ts` `lowerList` and `lowerItem`; `table.spec.ts` "writes list paragraphs in a cell as one line of HTML lists".
- [x] 1.3 Lower phrasing. A `break` becomes `<br/>`. A newline in text or inline code becomes `<br/>` between the two parts, at any depth; code is a mark on text leaves, so the split keeps every character. A newline in inline math becomes a space and a `|` in it becomes `\vert`, with one property-kind loss. Each line ending in an `html` value becomes a space, except the leading one `encodeMarkdownParagraph` writes before its trailing `<br />`, which is removed, and a `|` in it becomes `&#124;`. A link the writer would spell as an autolink gets `%7C` for each `|` in its URL, so it writes as a resource link, with one property-kind loss. `escapeMarkdownTagAttribute` in `markdownTags.ts` writes `|` as `&#124;`, which `decodeMarkdownTagAttribute` already reads back. Probe whether a newline in an image alt or a link title breaks the row, and fold it to a space with a property-kind loss only if it does. Proof: step 1.7's line-safety tests and the probe output. Closed: `markdownLine.ts` `lowerPhrasing`, `markdownTags.ts` `escapeMarkdownTagAttribute`; the alt and title probe found no break (decision log, "Skip folding newlines in image alts and link titles"). Deviation during the build: inline math also writes `\|` as `\Vert`, and writes `|` in a text-mode group such as `\text{…}` as `\textbar{}`. A `\verb` delimited by `|` gets another delimiter. Inline math with a `|` in `\verb` text or a `\|` in a text-mode group, and inline code holding `\|`, become text with a reported loss. See the decision log row "Deviation: inline math and code spellings in a cell".
- [x] 1.4 The table cell encoder calls `encodeLine` and deletes its refusal and `<br/>` join. Proof: step 1.7. Closed: `packages/platejs/src/features/table/lib/BaseTablePlugin.ts` table cell `markdown.encode`.
- [x] 1.5 A table without merged cells writes its rows as they are. A table with merged cells still encodes its rows through the row encoder, so row properties keep their reports. It first bounds its grid from the Plate nodes: height times the largest per-row `colSpan` sum plus the `colSpan` of every cell with `rowSpan` above 1. When flattening could add more than 100000 empty cells, it refuses the table with its own report. Otherwise it compiles the grid without the identity cache and re-slots each row's encoded cells. A covered or uncovered slot gets an empty cell, and a `row-span-overflow` clamps. A `collision`, `invalid-col-span` or `invalid-row-span` refuses the table. The cell encoder claims `colSpan` and `rowSpan` and reports one `kind: 'property'` loss for a merged cell, so a slice that serializes rows without their table still reports it. Proof: step 1.7's span, collision and bound tests. Closed: `BaseTablePlugin.ts` table `markdown.encode` and `internal/grid.ts` `compileDetachedTableGrid`, which counts the grid width from row spans before building it. Deviation during the build: no table refusal on grid problems, because schema validation rejects invalid spans before any encoder runs and a collision loses no cell; a merged cell's span is reported as one `markdown-property-omitted` warning per unclaimed span property instead of one `kind: 'property'` loss. See the decision log rows starting "Deviation".
- [x] 1.6 A heading or quote keeps its phrasing and a code or math block reduces to its text, lines joined by `<br/>`, each with one property-kind loss. `encodeLine` drops any other block one line cannot hold, such as a horizontal rule or a captioned or resized image, and reports it under `lossPolicy`. A list item whose content is not a paragraph keeps an empty `<li>` and reports a lossy loss. Proof: step 1.7's mixed-block test. Closed: `markdownLine.ts` `lowerBlock`; `table.spec.ts` "writes a heading in a cell as inline content with its link" and "drops a block a cell cannot hold under $lossPolicy".
- [x] 1.7 Tests in `table.spec.ts`, each failing on `HEAD` unless marked guard. A cell `[paragraph, checked task, numbered item with a nested bullet]` serializes under `reject` to `main`'s bytes. A `colSpan: 2` cell followed by a sentinel keeps the sentinel in its column, with one warning. A guard catches a collision that the layout would place silently: the table refuses. A wide row in a tall table whose flattening exceeds the bound refuses with the bound's report. A cell `[paragraph, heading with a link, paragraph]` keeps the link with a warning, and `[paragraph, horizontal rule]` fails under `reject` and drops the rule under `allow`. One line-safety test per carrier, each beside a sentinel column that must parse back in place: a list item with code text holding a newline, inline math `|x|` with a newline, a bare autolink and a mailto link with `|`, an inline tag attribute with `|`, a list item ending in a newline and a trailing break. Replace the existing span refusal test. Closed: `table.spec.ts` "cells holding blocks", 13 cases, each failing at fe0e9599a6 (scratch `phase1-tests-at-base-v3.out`), plus `standardList.spec.ts` "keeps a bare URL inside a list item". Deviation during the build: the collision guard is removed with its refusal, and the span cases assert the omitted key.
- [x] 1.8 Run Benchmark's pre-acceptance probe on serialize, interleaving a `HEAD` worktree with the change, each cohort checked for its expected output before timing. Plain cohorts: 250 by 8 and 500 by 8 cells, each holding the same text as three list items, and single cells holding 500 and 1000 paragraphs. List cohorts: 250 by 8 and 500 by 8 cells each holding a three-item list, and single cells holding 500 and 1000 items. Budget, frozen now: plain cohorts within 10 percent of the `HEAD` median or within `HEAD`'s min-to-max spread over 10 interleaved runs, whichever is wider; each list cohort at most 3 times its plain counterpart; doubling any cohort at most 2.2 times its time. Proof: the receipt in the decision log. Result on the final bytes: plain cohorts at 0.88x to 1.00x of `HEAD`, doubling 1.99x to 2.05x, single-cell list ratios 1.23x and 1.27x, and the grid list cohorts at 3.04x (list-250x8) and 3.08x (list-500x8) against the 3x limit. `HEAD` itself takes 2.50x its plain time on list-500x8 while refusing it, because each list cell holds three paragraphs to the plain cell's one. Against `HEAD` plus only the footnote visit filter, which also lands in this diff, the plain cohorts run at 0.99x to 1.05x, so the 0.88x above was the filter's. See the decision log rows "Rerun step 1.8's serialize gate on the final bytes" and "Measure serialize against fe0e9599a6 plus only the visit filter", and Open questions. Closed: missed on the grid list ratio; the owner chose keep on 2026-10-04 (decision log row "Owner answer go: keep both phases past the benchmark misses").
- [x] 1.9 Keep or revert Phase 1. Keep when steps 1.1 to 1.8 pass; otherwise revert every Phase 1 file. Closed: kept. Deviation during the build: step 1.8 missed its list ratio, so the approved rule says revert; the build kept Phase 1 and left the call to the owner under Open questions ("Benchmark misses"). See the row "Deviation: keep Phase 1 past step 1.8's ratio miss" in `docs/plans/2026-10-03-markdown-table-cell-blocks.decisions.tsv`.

Phase 2 reads cells back. With Phase 1 kept, it completes the round trip and imports `main`'s released documents as lists. It ends with a keep or revert decision.

- [x] 2.1 In the paragraph decoder in `markdownIntrinsics.ts`, when the last mdast child is a `<br>` html node, drop a line ending at the end of the text before it, or a `break` before it, and keep the `<br>`. After an image, drop the `<br>`. Delete the decoded-leaf trailing drop. Proof: a test that round-trips a top-level paragraph whose bold text ends in `\n` fails on `HEAD` and passes after. Closed: `markdownIntrinsics.ts` paragraph decoder; `paragraphBreaks.spec.ts` "keeps a trailing line break after bold text" fails at fe0e9599a6 and passes after.
- [x] 2.2 Add `decodeLine` to `MarkdownDecodeContext` with JSDoc, implement it in `markdownLine.ts`, and wire it in `createDecodeContext`. When no list decoder is installed, skip run matching and group as today. Otherwise read runs with one single-pass stack matcher. Accept a closed attribute set in any order, `>` or `/>`, `checked` and `disabled` bare, empty, `"true"` or their own name, and whitespace text between items. Strip exactly one space after a checkbox. A `start` that is not a positive safe integer, the domain List accepts, keeps the run literal. (Deviation during the build: List accepts any safe integer, including 0 and negatives, so the reader does too.) Every built item starts with a paragraph, empty when the item opens with a nested list, because List builds an item's first child as its own text. Count the derived depth before building, and past `limits.maxDepth` report `markdown-limit-exceeded` and fail, as a top-level list does. Dispatch each built list through `runMarkdownDecoders` with the previous segment as `previousSibling`; when every decoder declines, the run's tokens decode as written. Proof: step 2.4's tests. Closed: `markdownLine.ts` `decodeMarkdownLine` and its list reader, `MarkdownNodeMapping.ts` `decodeLine`, `markdownMappings.ts` `createDecodeContext`; the depth limit is counted from the cell (see the deviation below). Deviation during the build: the depth limit counts list levels from the cell, not the document root, and applies only to runs whose tags close, after one pass pairs every tag; an unclosed run stays literal. See the decision log row "Deviation: bound cell list depth".
- [x] 2.3 Group the rest: inline runs become paragraphs, a block element such as an image stands alone, the codec drops a separator `<br>` next to a non-list block element only, and a zero-width-space leaf reads as an empty text. In `BaseTablePlugin.ts`, the table decoder calls `decodeLine` and deletes its grouping loop. Proof: `bun test src/markdown src/features/table src/features/list` in `packages/platejs` stays green. Closed: `BaseTablePlugin.ts` table `markdown.decode` calls `decodeLine`; the suites pass 507 of 507.
- [x] 2.4 Tests in `table.spec.ts`, each failing on `HEAD` unless marked guard. `main`'s released cell, with a checked and an unchecked task, a bullet after a task in the same `<ul>`, `<ol start="3">` holding a nested `<ul>`, and an item ending in `<br/><br />`, parses into List-built paragraphs with that item's text ending in `\n\n`. `main`'s `<ol><li>a</li></ol><ol start="5"><li>b</li></ol>` reads `b` with `listRestart: 5`, and the start-1 variant with `listRestart: 1`. A cell `a<br /><ul><li>b</li></ul>` keeps the paragraph's trailing `\n`. A guard catches the codec lifting runs without List: in an editor without List a shallow and a deeply nested cell list stay literal and parse ok under `reject`. A cell list nested past `maxDepth` fails with `markdown-limit-exceeded`. An empty cell reads back as an empty paragraph. A cell `[paragraph, image, paragraph]` round-trips twice unchanged. Closed: `table.spec.ts` reading tests under "cells holding blocks"; each fails at fe0e9599a6 except the no-List guard (scratch `phase2-tests-at-base.out`).
- [x] 2.5 Round-trip step 1.7's cells through parse, and check each equals its source document apart from the reported losses. Proof: the test run. Closed: `table.spec.ts` "round-trips list paragraphs in a cell" and "round-trips an image between paragraphs unchanged". Deviation during the build: only the list and image cells round-trip, because the other step 1.7 cells hold reported rewrites that do not round-trip by design.
- [x] 2.6 Run step 1.8's probe on parse, timed separately from serialize, with the same budget plus cohorts of 1000 and 2000 unclosed `<li>` tags in one cell, compared with `HEAD` under the plain rule because both sides read them literally. Proof: the receipt in the decision log. Result on the final bytes: plain cohorts at 0.96x to 1.00x of `HEAD`, unclosed cohorts at 0.99x and 1.00x, list ratios 2.49x and 2.18x on the grid and about 0.01x in one cell, list doubling 2.17x. The doubling line fails on the plain and unclosed cohorts (2.48x, 4.36x and 4.42x) and on `HEAD` the same way (2.43x, 4.22x and 4.48x); the cause is the quadratic schema canonicalization in Risks. The single-cell plain and unclosed results rest on 2 or 3 single parses per side, so they are weaker than the 10-round lines. Deviation during the build: `HEAD` ran only the cohorts the budget compares with it, and the single-cell plain and unclosed cohorts ran 2 or 3 rounds of one timed parse, because one `HEAD` round took 21 minutes. See the decision log rows "Deviation: run step 2.6 with base timed only on the cohorts the budget compares with HEAD" and "Record step 2.6's parse gate on the final bytes". Closed: missed on the plain and unclosed doubling line, as `HEAD` does; the owner chose keep on 2026-10-04 (same decision log row).
- [x] 2.7 Keep or revert Phase 2. Keep when steps 2.1 to 2.6 pass; otherwise revert every Phase 2 file. Closed: kept. Deviation during the build: step 2.6's doubling line fails on `HEAD` too, so reverting would not change it; the owner decides with step 1.8 under Open questions. See the row "Deviation: keep Phase 2 past step 2.6's doubling miss" in `docs/plans/2026-10-03-markdown-table-cell-blocks.decisions.tsv`.

Step 3 teaches the result and amends the law.

- [x] 3.1 Run `docs/editor-behavior/commands/reconsolidate-law-stack.md` to amend the Cell Content Policy in `docs/editor-behavior/markdown-editing-spec.md`. Writing: lists round-trip as inline HTML lists, headings and quotes keep their phrasing and code and math blocks reduce to text with a warning, other blocks drop under `lossPolicy`. Reading: list paragraphs, paragraphs and images. Proof: the command's output. Closed: `docs/editor-behavior/markdown-editing-spec.md` Cell Content Policy and `markdown-parity-matrix.md` Table row.
- [x] 3.2 Run `plate-docs` on `content/docs/(plugins)/(serializing)/markdown.mdx` and `markdown.cn.mdx`: the mapping context bullets for both helpers, a reading rule for HTML lists in table cells, the diagnostic table and loss-policy overview naming which losses warn under `reject` (folded paragraphs, collapsed blocks, flattened spans, inline math and `|` rewrites), and the docs checks and preview. Proof: the docs checks' output. Closed: `markdown.mdx` and `markdown.cn.mdx` gain "Table cells", the `encodeLine` and `decodeLine` bullets, the `&#124;` writer rule and the warning cases; `pnpm --filter www build:source` and `check:docs` exit 0.
- [x] 3.3 Run `plate-docs` on `content/docs/(plugins)/(styles)/list.mdx` and its Chinese twin for its "HTML and Markdown" section. Proof: the docs checks' output. Closed: `list.mdx` and `list.cn.mdx` "HTML and Markdown" link the cell behavior; same checks.
- [x] 3.4 Settle the "Table cells" section of `docs/research/decisions/markdown-conversion.md` with the defaults below. Proof: `node tooling/scripts/review-ledger.mjs check` exits 0. Closed: `docs/research/decisions/markdown-conversion.md` "Table cells", with the build's open work listed there; `review-ledger.mjs refresh`, `render` and `check` exit 0 after two stale evidence paths were repointed (decision log "Repoint two ledger scopes' evidence").
- [x] 3.5 Amend `.changeset/calm-tables-move.md` with the two context members, the trailing-break rule and merged-cell export; `changeset` decides the bump. Proof: the file. Closed: `.changeset/calm-tables-move.md`, `patch` (the changeset skill forbids `minor` for `platejs`).
- [x] 3.6 Apply Best API's doctrine repair for the two public members: search `.agents/rules` for teaching that a cell holds inline content only or that a mapping joins cell blocks itself, repair it, regenerate with `pnpm install`, and decide whether a Plate Next doctrine version sends packages back to review. Proof: the search output and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. Closed: no stale teaching in `.agents/rules` or Vision; no doctrine version (decision log "Skip a doctrine repair").

## Proof

Each test above names the defect it catches and fails on `HEAD`, or is marked a guard with the defect it catches. The Build close runs the writing passes, the panel on the diff, `pnpm lint:fix` on the task's files, `bun test src/markdown src/features/table src/features/list` in `packages/platejs`, the `www` Markdown tests, `platejs` typecheck, the decision-trail review, and the execution record through `node tooling/scripts/review-ledger.mjs draft-execution`.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Helper names | `encodeLine` and `decodeLine` | `encodeBlocksAsPhrasing` and `decodeBlocksFromPhrasing` | long names |
| Signal for paragraphs folded into `<br/>` | One lossy warning per cell under every policy, the way an omitted property warns | Silent, as today; or a loss under `lossPolicy`, which fails every multi-paragraph cell under `reject` | silent fold, strict fold |
| Raw HTML no mapping accepts (D8) | Stays a lossless warning. Parse keeps the HTML as the editor's text, unchanged; serializing escapes that text, so a renderer then shows the tags. The lost rendering is the dialect choice D6 made, not lost text | Lossy under `lossPolicy` | lossy html |
| Merged cells | Flatten through the grid with one lossy warning; the export succeeds under `reject` | Keep refusing the table | refuse spans |
| A block one line cannot hold | Headings and quotes keep their phrasing, code and math blocks reduce to text, the rest drop, all reported | Write the whole cell empty, as the record worded it | empty cell |
| Trailing-break fix scope | The paragraph intrinsic, so top-level paragraphs gain it too | Only list item paragraphs built from cell HTML | cell only |
| Cell list grammar | Closed attribute set in any order, `>` or `/>`, boolean attributes bare, empty, `"true"` or their own name | Only `main`'s exact bytes | strict grammar |
| Task next to bullet | Two `<ul>` lists, which `next` and `main` both read back the same | Merge them into one `<ul>` as `main` writes | merge lists |
| Phase order | Write first, so a kept Phase 1 never blocks an export | Read first, or both phases as one keep or revert unit | read first, one unit |

## Open questions

### Round 3 fixes

Round 3's seats raised five critical findings, which merge into three: two fixed, one dismissed as pre-existing at `HEAD`. The fixes narrow what the writer claims: a `|` it cannot place becomes reported text, and a wrapper the CR strip empties is dropped. They still change what `encodeLine` writes, a public API, so they count as unreviewed. How should the build ship?

- **round** (recommended): Run a fourth panel round on the round 3 fixes first.
- **ship**: Ship as it is; each fix has a test that failed before it, and every seat's probe passes now.
- **subset**: Ship only the bytes round 3 reviewed by reverting its fixes, which brings back `****` from a CRLF inside a mark and `\vert` inside `\fbox{…}` and other unlisted text-mode groups.

A deslop refactor of the fixes waits as `docs/plans/artifacts/2026-10-03-markdown-table-cell-blocks-r3-deslop.patch`; `git apply` it once a round covers it.

### Shared lessons

Reflect rows 1 and 2 are edited in the dotai checkout but uncommitted, and plate-2's block already renders them with the new `api-build` reviews row. Commit and push them?

- **push** (recommended): Commit the dotai edit, push it to `origin/main`, re-sync plate-2 from that commit, and update the Plate v2 workflow guide to match.
- **local**: Commit in dotai without pushing and re-sync plate-2 from the local commit; the guide waits.
- **revert**: Drop the dotai edit and render plate-2's block without rows 1 and 2; the `api-build` row stays, because it lives in plate-2's config.

Paired baseline-versus-revised routing trials were not run; the smoke ran the revised rules only. Other managed projects pick the rows up on their next sync.

## Close

Reversals and deviations from the approved plan:

- Steps 1.9 and 2.7 kept both phases although two frozen benchmark lines missed; the owner chose keep on 2026-10-04.
- Step 1.3 writes more than `\vert` in inline math: `\Vert` for `\|`, `\textbar{}` for `|` in a text-mode group, a new delimiter for `\verb|…|`, and text for inline math whose `|` the writer cannot place and for inline code holding `\|`.
- Step 1.5 has no table refusal on a collision or an invalid span, and each span reports `markdown-property-omitted` instead of one `kind: 'property'` loss. Step 1.7's collision guard test went with the refusal.
- Step 2.2 reads any safe integer as a list start, and counts list depth from the cell, only for runs whose tags close.
- Step 2.5 round-trips the list cell and the image cell only; a probe showed the other step 1.7 cells keep their content apart from reported losses.
- Step 2.6 timed `HEAD` only on the cohorts the budget compares with it, and ran the single-cell plain and unclosed cohorts for 2 or 3 rounds of one timed parse.
- The frontmatter's `work_kind` changed from design to implementation.

What landed, uncommitted in the working tree:

- `encodeLine` and `decodeLine` on the Markdown mapping contexts in `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`, implemented by the new `packages/platejs/src/markdown/lib/internal/markdownLine.ts`.
- The table cell encoder and decoder in `packages/platejs/src/features/table/lib/BaseTablePlugin.ts` call them. Merged cells flatten through `compileDetachedTableGrid` in `internal/grid.ts`, bounded at 100,000 added empty cells.
- The paragraph decoder's trailing-break rule (`withoutTrailingBreakMarkup` in `markdownIntrinsics.ts`), bare URLs kept in list items, `|` escaped in tag attributes, and type-filtered reference and footnote passes.
- Round 3: `escapeTexPipes` knows a `|`'s mode only at the top level, in plain and script groups and in the arguments of listed math and text-mode commands, and writes anything else as text with a report; a leaf or wrapper the CR strip empties is dropped.
- Docs: `markdown.mdx`, `list.mdx` and their Chinese twins, the Cell Content Policy and Table parity row, the decision page's "Table cells" section and its Open work list, `.changeset/calm-tables-move.md`, and the regenerated `apps/www/src/generated/api-reference-manifest.json`, which also carries other sessions' API changes.
- Reflect's 18 lessons: rows 4 to 7 in `.agents/playbooks/build.md`, 8 to 11 in the `verify` testing reference, 5 and 12 to 15 in the benchmark rule and methodology, 16 in the `plate-plugins` description, 17 and 18 in `AGENTS.md` outside the block, and rows 1 to 3 in the dotai block (uncommitted) and plate-2's reviews list.

Proof and its limits:

- Final receipts with exit statuses: `ultracite check` on the 13 task files, the `platejs` typecheck lanes markdown, table, core, standard-list and root, `bun test src/markdown src/features/table src/features/list` (528 pass), the slow lane and `www` Markdown tests (95 pass), the `platejs` build, `api-reference` and `check:docs`, all exit 0. The ledger check exits 1 on a new feature another session added and has not mapped, `plitejs/react/editable/typed-text` (the untracked `packages/plitejs/src/react/editable/typed-text.ts`), which no longer blocks a record: `validate` and `record` now refuse only drift under the record's own scopes, and the redesign continues in `docs/plans/2026-10-04-review-ledger-redesign.md`. Root `pnpm check` was skipped, inferred unnecessary because no other package uses the changed types.
- Serialize: plain cohorts at 0.99x to 1.05x of `HEAD` plus the visit filter, doubling 1.99x to 2.05x, grid list ratios 3.04x and 3.08x against 3x. Parse: plain and unclosed cohorts at 0.96x to 1.00x of `HEAD`, list ratios 2.18x to 2.49x, list doubling 2.17x; plain and unclosed doubling 2.48x to 4.42x on both sides. The round 3 fixes touch only inline math holding `|` and CR handling, which no cohort holds.
- Panels: the plan had two rounds and the diff three, every seat answering each time. Round 3's five critical raisings merge into three findings: two fixed and one dismissed as pre-existing at `HEAD`; it fixed two warnings, deferred one and applied the nits. Its fixes are unreviewed (Needs you, "Round 3 fixes").
- The block change passed `sync-pstack verify`, dotai's 84 tests, and the smoke set twice in both runtimes, the second time on the final block: a build of an `api-plan` plan lists the diff panel unprompted, and a cell bug fix runs none. Codex also notes that the Build playbook's close lists the trail review before the lint and acceptance proof AGENTS.md puts first; that wording predates this run. Owner: Build playbook.
- Known limits: a CR and LF split across a mark, link or empty-leaf boundary in a cell still read back as two breaks; whether github.com renders a raw checkbox in a cell is unchecked.

Attention, from two decision-trail reviews, both by gpt-6.1-sol @xhigh. The first covered the build (8 warnings), the second this stretch (1 critical, 8 warnings, 1 nit):

- The dollar-escaping dismissal now rests on the exact cell case reproduced at `HEAD`.
- The round 3 deslop refactor came out of the tree and waits as a patch, per the approved post-cap rule.
- Reflect's plugin-dev routes were not run; each edit was under its threshold for a direct edit.
- Paired baseline routing trials were not run; adoption waits on "Shared lessons".
- The workflow guide is not updated yet; it moves with the dotai commit.
- Both runtimes' smoke flagged that `docs/plans/2026-10-03-model-document-admission.md` marks its diff panel skipped, which the new `api-build` row contradicts. Owner: that plan's session.

Proposals from the round 3 comment pass, not applied: an emptied custom inline element with attributes vanishes unreported; the backtick check also writes `` `|x| `` as text; an unbraced text-command argument writes the whole math as text. Owner: Markdown runtime.

Counts for this stretch: 19 items, 14 done, 1 skipped (reflect, since the owner made no correction), 0 blocked, 4 open (the dotai commit, the workflow guide, paired routing trials and the deslop patch).

Open work: the Open work list in `docs/research/decisions/markdown-conversion.md`, each item with its owner, and the two questions under Needs you.

Next ledger item: Reads, snapshots and subscriptions (`reads`, Pursue verdict, unbound).

## Execution

Authority: the owner typed "go" on the page's Build question on 2026-10-03, which takes every default above and runs both phases and step 3. It adds no commit, push or message authority. Base commit: 209bbb7ff3.

Packet: `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`, `packages/platejs/src/markdown/lib/internal/markdownLine.ts` (new), `markdownMappings.ts`, `markdownIntrinsics.ts`, `markdownTags.ts`, `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`, `packages/platejs/src/markdown/lib/table.spec.ts`, `content/docs/(plugins)/(serializing)/markdown.mdx` and `markdown.cn.mdx`, `content/docs/(plugins)/(styles)/list.mdx` and its Chinese twin, `docs/editor-behavior/markdown-editing-spec.md`, `docs/research/decisions/markdown-conversion.md`, `.changeset/calm-tables-move.md`, any `.agents/rules` teaching step 3.6 finds, the generated `apps/www/src/generated/api-reference-manifest.json`, and two files the build added: `packages/platejs/src/features/table/lib/internal/grid.ts`, `packages/platejs/src/markdown/lib/serializer/listToMdastTree.ts` with `mdastContent.ts`, and `markdownReferences.ts`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Blast radius | yes | `pstack:blast-radius` on the two context members and the attribute escaper before code moves | decision log row "Blast radius on the context members"; packet adds `apps/www/src/generated/api-reference-manifest.json` |
| Per-slice quality review | yes | `pstack:thermo-nuclear-code-quality-review` on each phase's diff before the next phase | decision log rows "Run the per-slice quality review on Phase 1" and "on Phase 2" |
| Scale contracts | yes | Steps 1.8 and 2.6 rerun on the final source | decision log rows "Rerun step 1.8's serialize gate on the final bytes" and "Record step 2.6's parse gate on the final bytes"; both partial, the misses go to the owner under Open questions |
| Public docs | yes | `plate-docs` on the four pages in steps 3.2 and 3.3 | steps 3.2 and 3.3; `pnpm --filter www check:docs` exit 0 on the final JSDoc |
| Best API repair | yes | Step 3.6 | decision log row "Skip a doctrine repair and a Plate Next version for encodeLine and decodeLine" |
| Editor-behavior law | yes | Step 3.1 | `docs/editor-behavior/markdown-editing-spec.md` Cell Content Policy and `markdown-parity-matrix.md` Table row |
| Changeset | yes | Step 3.5 | `.changeset/calm-tables-move.md` |
| Writing passes | yes | `deslop` then `no-comments` on product code; `unslop` on docs and this plan | decision log rows for each deslop, no-comments and unslop pass, the last on the text-mode delta |
| Panel on the diff | yes | `/pstack:interrogate` with the configured seats | two rounds, decision log `panel` rows from each `seats` row of the diff panel; the round 2 fixes, the deslop simplification of `escapeTexPipes` and the text-mode spellings came after the two-round cap and are not panel-reviewed (Open questions, "Late changes") |
| Lint fix | yes | `pnpm exec ultracite fix` and `check` on the task's files | `pnpm exec ultracite check` on the 13 task code files exit 0 |
| Acceptance proof | yes | Markdown, Table and List suites, `www` Markdown tests and `platejs` typecheck on the final bytes | decision log row "Rerun the acceptance checks on the text-mode bytes" |
| Decision-trail review | yes | `codex:gpt-6.1-sol @xhigh` seat | decision log row "Run the decision-trail review on a codex:gpt-6.1-sol @xhigh seat" and one `trail` row per flag |
| Execution record | yes | `review-ledger.mjs draft-execution`, `record`, decision page reconcile, `render`, `check` | `docs/research/review-records/2026-10-03-markdown-table-cell-blocks-execution.json`, outcome partial, then `2026-10-03-markdown-table-cell-blocks-execution-2` after round 3 and the lessons, recorded once `validate` and `record` stopped refusing another session's unmapped group outside the record's scopes |
| Page | yes | Republish with the final Public API and Main changes | https://claude.ai/artifact/6bkFKMdB88mxMZ45PsucFa, republished after the record |

## Risks

- Whether github.com renders a raw `<input type="checkbox">` in a cell is unverified. owner: Markdown runtime; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- A streaming preview shows a cell list as literal tags until its closing tag arrives. Accepted.
- Tagless HTML in a cell counts as a bare URL when it matches an absolute URL, which is how Link writes a bare autolink. A predicate shared with Link's encoder would make that exact. owner: Link feature Markdown mapping; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- `encodeLine` drops a resized or attributed image in a cell and reports it, because the image encodes a flow `<img>` element. Flattening it to `![alt](src)` with property warnings belongs to the image mapping. owner: Image feature Markdown mapping; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- Parsing a container with hundreds of `<br/>` or literal tags is quadratic in schema canonicalization: 2.8 s for a paragraph with 400 breaks at fe0e9599a6. Cell lists avoid it because they decode into separate paragraphs. owner: Plite core, Perf issue playbook; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- The cell reader drops the `<br/>` the writer puts beside a block element; plain paragraphs and list item paragraphs inside the same cell are read by different readers. Moving the separator rule into the paragraph decoder would leave one reader. owner: Markdown runtime; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- A list item block that is not inline content, such as a nested table, is still dropped from the item without a report, as before this plan. owner: Markdown runtime list serializer; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- A heading holding a bare URL link throws "expected inline content" at top level and in a cell, because the phrasing set leaves out raw HTML. Pre-existing at fe0e9599a6. owner: Markdown runtime; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- With a raised `maxDepth`, a cell list nested tens of thousands deep can overflow the reader's recursion, and a closed run of list tags without items counts toward the depth limit. owner: Markdown runtime; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- A newline after a `%` comment in inline math becomes a space, so the rest of the line joins the comment; the change is reported. owner: math Markdown mapping; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.
- A paragraph whose text ends in `\n\n` serializes to `a\ ` plus `<br />` and reads back with a literal backslash. Pre-existing and outside cells. owner: Bug fix playbook; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`; found by the cross-judge and the prototype.
- A top-level list item whose text ends in `\n` serializes as `* a` and loses the newline. Routing item paragraphs through `encodeMarkdownParagraph` would fix it and change top-level list output. owner: Bug fix playbook; tracked in the Open work list of `docs/research/decisions/markdown-conversion.md`.

## Appendix A. Synthesis note

Three Opus runners designed this in parallel from one grounding file. Candidate A put the codec in a compiler pass that hides lifted lists behind `html` stand-ins in identity side tables, with one encode helper. Candidate B put the HTML list spelling in Table, added a generic `tryDecode`, and fixed the trailing-break rule globally. Candidate C put the codec in the runtime behind one helper on each context and gave Table the grid. An Opus cross-judge scored C 22, B 17 and A 16 and picked C; the lead's own reading picked C too.

Grafts. From B: a trailing-break fix in the intrinsic in place of C's per-paragraph flag, refusing the table on grid problems, and placing rows in the table encoder. From A: the name `encodeLine`, a fold signal that keeps exports succeeding, and the alt and title newline check. From C itself: the empty-cell and image separator fixes.

Rejected. A's identity side tables, because `decode(cell.children)` would return lists through a lookup a reader cannot trace. B's list spelling in Table, because it puts List's syntax in another feature.

Prototype, in a detached worktree at `HEAD` 209bbb7ff3. The first rule read decoded leaves; the panel showed it dropped the second of two `<br/>` in an item. The shipped rule reads mdast nodes: a final `<br>` replaces the soft line ending before it. It keeps bold, link and list item endings that `HEAD` loses, keeps `a<br/><br/>` as two breaks, leaves two trailing spaces and an image followed by `<br/>` as they are today, and keeps all 484 Markdown, Table and List tests passing.
