# List and import/export fixes

Status: executed: babysat; waiting on your merge, with CI red only where next is red
Playbook: bug-fix
Page: https://claude.ai/artifact/PpUHyCPF1tbBMYsZSbyhrR

The owner asked to prepare fixes, through the repository's pstack process, for the defects that a browser regression of the list refactor and the import/export work confirmed, then widened the plan to zbeyens's six list defects too. The regression ran `docs/plans/artifacts/2026-10-11-list-regression/specs/final.spec.ts` twice in Chromium at `5fc246c291`, with 24 behaviors passing and 13 defect tests failing. Panel round 1 on this plan found a new defect, D14, and moved D06 and D08 back to zbeyens's plan, so this plan fixes nine. D09 and D10, Tab and Outdent on list items, stay with zbeyens. Scope says why.

## Brief

### What will change?

Word files keep bullets, numbered headings and what's inside table cells. Word files with empty footnotes open, and false warnings stop. The babysit pushed three small cleanups; the PR is ready to merge.

### What could go wrong?

CI stays red until next's own failures are fixed. No warning when a list starts with a bullet that has other level settings. The toolbar's Outdent on a top list item still misbehaves. Big-table save speed is unmeasured.

## Teach

Plate saves a document as HTML, Markdown or Word and reads those files back. Its lists are flat. Each item is an ordinary block that says which list it belongs to.

Some of that breaks today. Saved files draw bullets with styling only, so the list itself is lost, and a numbered heading loses its text in Word. Word export takes a shortcut for table cells, so lists, code, equations and pictures inside a cell vanish. A few checks also warn about losses that never happen.

Each fix moves the rule into the one piece of code in charge of it, and each comes with a test that fails today.

## Demo

1. Open http://localhost:3297/blocks/docx-demo, make a bulleted list with a nested item, then export it to Word. The Word file shows a real bulleted list with two levels, not indented paragraphs. The saved web page draws the same bullets as before, and a bulleted quote or code block now draws its bullet inside the box, like a numbered one. ![before](artifacts/2026-10-12-list-import-export-fixes/shots/before/static.png) ![after](artifacts/2026-10-12-list-import-export-fixes/shots/after/static.png)
2. In the same editor, turn a heading into a numbered list item and export to Word. The heading keeps its text, its heading style and its number, and a list inside a table cell stays in the cell. The frames are the same file opened in LibreOffice before and after. ![before](artifacts/2026-10-12-list-import-export-fixes/lo/before/lists.png) ![after](artifacts/2026-10-12-list-import-export-fixes/lo/after/lists.png)
3. Put a numbered list, a to-do and a code block inside a table cell, then export to Word. Everything inside the cell is still there.
4. Import the repository's Word file `codeblock.docx` from the Word import menu. It opens instead of being refused for its empty footnotes.
5. Import Markdown with a list item that has a second paragraph, then export Markdown. The second paragraph stays inside its item.

## Scope

In scope, ordered by severity: D11, D14, D05, D01 and D02, D03, D07, D12 and D13. D09 and D10 stay with zbeyens; the table below says why. Panel round 1 found D14, a numbered heading that already loses its text in Word export (`proof/d01-heading-a1.log`). D01, D02 and D14 share one design pass, and so do D09 and D10, because each fix crosses function boundaries.

Out of scope:

| Defect | Why it stays out | Owner and stop |
| --- | --- | --- |
| D04 HTML exported with an equation does not import back | The equation plugins have no HTML decoder and the static equation writes no TeX attribute, so the fix adds a plugin format mapping, which the `api-plan` reviews row sends through `architect` and a panel | owner: natamox. stop: the owner's go on an equation HTML plan |
| D06 and D08, Markdown lists sharing one hidden list | Their fix, phase 1 of `docs/plans/2026-10-11-list-first-principles.md`, must also change how AI suggestions keep a user's list (its step 1.6, `AIChatPlugin.parseSuggestion`), and the owner put suggestion mode off limits; without that step an AI rewrite would move the user's items out of their list. D08's false warning comes from the same shared list. A numbered item and a to-do with no list id can be one Markdown list or two, so the export check cannot tell a real split from a false one | owner: natamox. stop: zbeyens finishes the suggestion-mode refactor, or the owner's word to build it here |
| D09 and D10, Tab on several list items and toolbar or block menu Outdent | Their fix needs a list-owned indent rule, which reverses a pick in zbeyens's list plan and touches code his phase 2 rewrites, so it waits for his confirmation | owner: zbeyens. stop: his confirmation, or his list plan's phase 2 |

Suggestion mode stays out on the owner's word.

## Cases

Proof paths are under `docs/plans/artifacts/2026-10-12-list-import-export-fixes/`.

| Case | Symptom in the browser | Root cause (runtime evidence) | Owner layer | Fix |
| --- | --- | --- | --- | --- |
| D11 | Inside a table cell, numbered and to-do items, code blocks, equations, images and nested tables (callouts included) lose their content in Word export, and headings lose their style and bookmark, with no diagnostic | `buildTableCell` dispatches a cell's children with its own shallow branching, while the body uses the recursive `convertVTreeToXML`; the static cell's `min-height` wrapper puts each block element two levels deep, and `buildParagraph` writes an empty run for a block element (`proof/d11-wrapper-a1.log`, `proof/d11-real-census-a2.log`, `how/explainer-reply.md`) | DOCX HTML-to-Word converter | The cell renders its children through the body walker, passed down as a required function argument, with the cell's attributes as scope; see Design |
| D05 | 5 repo fixtures whose footnote and endnote parts hold only Word's separators are refused | `unsupportedPackageDiagnostics` reports a part by its name, not by its content (`proof/diag-a1.log`) | DOCX import | A footnotes or endnotes part counts as dropped content unless every note is typed `separator` or `continuationSeparator`, or is an empty `continuationNotice`, whose paragraphs hold nothing but paragraph properties with no border or shading; a real note typed `normal`, an untyped note and a continuation notice with text still count; headers and footers keep today's rule, so a footer holding only a page number field stays refused |
| D01, D02, D14 | Bullets export to Word as indented paragraphs and lose their list in an HTML round trip; a numbered heading loses its text in Word, and a numbered quote loses its number | the registry list kits draw a bulleted item as the block itself with `display: list-item` and no list data, while numbered and task items get an `ol` or `ul` with `data-list-id` (`proof/d01-bullet-ul-a1.log`); the converter's heading branch hands a heading holding a list wrapper to `buildParagraph`, which drops the list's text (`proof/d01-heading-a1.log`) | registry static list kit and DOCX converter | Bullets get the list wrapper numbered and task items already use; a heading or quote holding a Plate list wrapper converts through its own branch and numbers its first paragraph; HTML import moves such a wrapper out of its block before reading it; export diagnostics count bullets, so a mixed list reports the split; see Design |
| D03 | To-do items come back from Word as plain bullets, unchecked | export writes a bullet level whose text is a checkbox glyph; `readDocxNumbering` maps every bullet level to `bulleted` (`proof/diag-a1.log`) | DOCX import numbering | `readDocxNumbering` reads a bullet level drawn with `☐` as an unchecked task and `☑` or `☒` as a checked task; `applyListMarkers` writes `data-checked`, which the list's HTML decoder already reads |
| D07 | A typed `1. ` list warns on Word export | `listDiagnostics` reports `list-start` for any numeric `listStart`, though a start equal to its level's start shows the same numbers in Word (`proof/diag-a1.log`) | DOCX export list diagnostics | Report `list-start` only when a numbered or task item's `listStart` differs from the start its list's first numbered or task item gives that level, else 1; a bullet that leads its list and sets another start stays unreported, as Open work says |
| D12 | A list item's second paragraph leaves the list on Markdown export | parse stores every non-list child of an item at `indent + 1` with no `listType`, also after a sublist; `convertNodesSerialize` ends the list run at it and reports `markdown-property-omitted` (`proof/d12-md-a1.log`) | Markdown serializer | The list run keeps a block with no `listType` while an open item sits at its `indent - 1`, and `listToMdastTree` appends it to that item through its indent stack and marks the item `spread`, the inverse of the decoder's `parseList` rule |
| D13 | Importing our own exported HTML shows 19 warnings at once | the import menu toasts every warning, and these are lossless `<style>` and `<meta>` removals (`proof/diag-a1.log`) | registry import button | Toast once, "Imported with N warnings", counting only warnings whose `impact` is not `lossless`, as the export button already aggregates |

## Design

D11 went through `architect`. Three runners on three models reached the same shape on their own, a blind cross-judge scored them, and the lead picked the base and the grafts. The record is in `docs/plans/artifacts/2026-10-12-list-import-export-fixes/architect/` (`synthesis.md`, `judge/verdict.md`, `runners/`).

The shallow cell handling was never a design choice. It came with the `html-to-docx` library vendored on 2026-01-13 (`9901c74966`), which expects simple cell content such as a paragraph, an image or a list right inside the `td`. On 2026-01-16 (`5dd36db80b`) a one-level `div` unwrap was added for the Word-only table cell component of the time, which put each block directly in the cell. The next day (`721f7de9cb`) that component was deleted and Word export moved to the regular static cell, whose `min-height` wrapper adds a level, so cell lists were already too deep from then on. No test covered content inside a cell, and table export threw until the 2026-10-10 `presentation` fix, so the loss only became visible then (inferred from the history; the export between those dates was not run).

A table cell is a block container like the body, so it uses the body's dispatcher. `buildTableCell` keeps its span bookkeeping and `w:tcPr`, then hands its children to the walker it was given, and adds an empty `w:p` when the cell would otherwise not end in one.

```ts
// packages/platejs/src/docx/export/lib/internal/xml-builder.ts (planned)
export type BlockScope = Readonly<ParagraphAttributes> & {
  readonly backgroundColor?: undefined;
};
export type RenderBlocks = (
  children: ReadonlyArray<VNodeType | VTextType>,
  xmlFragment: XMLBuilder,
  scope: BlockScope
) => Promise<void>;

// buildTable, buildTableRow and buildTableCell take `renderBlocks: RenderBlocks`.
// In buildTableCell, after buildTableCellProperties consumed the cell's own keys:
await renderBlocks(vn.children ?? [], tableCellFragment, {
  ...modifiedAttributes,
  backgroundColor: undefined,
});
// then: if the cell's last child is not w:p, append an empty w:p.
```

```ts
// packages/platejs/src/docx/export/lib/internal/render-document-file.ts (planned)
// findXMLEquivalent and convertVTreeToXML gain `scope: BlockScope`, `{}` for the body.
// Every paragraph gets a fresh object with the block's own keys first:
const paragraph = (node, own = {}) =>
  buildParagraph(node, { ...own, ...scope, ...own }, docxDocumentInstance);
// Images and nested tables read `scope.maximumWidth ?? availableDocumentSpace`.
// Both table branches pass the walker down:
const renderBlocks: RenderBlocks = (children, fragment, cellScope) =>
  findXMLEquivalent(doc, new VNode('div', {}, children), fragment, undefined, cellScope);
```

- The body passes `{}`, so its output stays byte for byte the same; a body-only fixture compared before and after proves it.
- The synthetic `div` gives the cell's inline children the body's grouping without parsing the `td`'s style again, and `undefined` clears the outer indentation host.
- `xml-builder.ts` still imports nothing from `render-document-file.ts`. It receives the walker only as an argument.
- List numbering keeps its one owner, `DocxDocumentInstance`. A cell list opens or continues its list by `data-list-id` in document order, as a body list does.
- List items in a cell do not inherit the cell's text formatting, as today; that is a Defaults row.
- `buildTableRow` divides the width its table was given, `attributes.maximumWidth`, instead of the page width, so a table nested at any depth sizes its cells, images and grid from the cell that holds it. A body table is given the page width, so its bytes stay the same.
- The body's `figure` branch passes the scope's width to `buildImage`, so an image in a cell is bounded by the cell, as the cell's own image branch does today.
- A `figcaption` in a cell starts exporting, as it does in the body.
- A table whose cells hold only paragraphs exports the same bytes before and after; a byte guard checks it, because its paragraphs now pass through the synthetic `div`.

### D01, D02 and D14: lists in static output and Word

This went through its own `architect` pass (`docs/plans/artifacts/2026-10-12-list-import-export-fixes/architect/d01/synthesis.md`). The runners split by model family. Both Codex runners put the list wrapper around the whole block, and the Claude runner kept it inside. The blind judge scored the inside shape highest as the smallest change, and the owner's minimal-fix preference picks it; wrapping the whole block is a `look` Defaults row.

Static output. Bullets get the same wrapper numbered and task items already have, inside the block: `<div style="margin-left:24px"><ul data-list-id="L" style="list-style-type:disc"><li data-list-type="bulleted" data-indent="1" ...>Bullet</li></ul></div>`. `List` draws `disc` for bullets whatever their `listStyle`, as the static page does today, and writes the bullet's `listStyle` as `data-list-style` on its `li`, as the semantic encoder does, so a circle bullet keeps its style through HTML; drawing circle and square bullets stays zbeyens's session. A bullet on a toggle or an image keeps today's root CSS, because those drawings drop wrapped children; one predicate, read by the wrapper and the root injection, decides it. Numbered and task output does not change.

```ts
// apps/www/src/registry/components/editor/block-list-static.tsx (planned)
export const drawsBulletOnRoot = (editor: Editor, element: Element) => {
  // a bulleted item on an installed details or image block
};
// BlockListStatic: no wrapper only when there is no listType or drawsBulletOnRoot(editor, element)
// List: markerStyle = bulleted ? 'disc' : listStyle ?? (numbered ? 'decimal' : 'none')
// list-static.tsx: inject.nodeProps.query reads drawsBulletOnRoot
```

Word export. A `div` holding a Plate list wrapper keeps today's path into `buildList`, which already numbers numbered and task paragraphs and code blocks and now numbers bullets the same way. Any other block that holds one Plate wrapper, a heading or a quote, converts through its own branch with the item's number in its scope, so each paragraph it writes takes the number; a heading and a quote each write one:

```ts
// packages/platejs/src/docx/export/lib/internal/render-document-file.ts (planned)
// A non-div block whose only element child, after a heading bookmark span, is
// (ul|ol)[data-list-id] holding one li.
const readPlateListItem = (block: VNodeType) => {}; // { item, list } | undefined
// findXMLEquivalent, after the page-break branch: opens the list as buildList
// does (openList, the item's restart, task numbering for data-checked), takes
// the level from li[data-indent], drops the block's margin-left, and converts the
// block with the wrapper removed through findXMLEquivalent with
// { numbering: { levelId, numberingId }, ...scope }, then advances the instance.

// xml-builder.ts (planned)
// A numbered blockquote takes its indent from its list level instead of the
// quote's 284 twips.
```

Diagnostics. Bullets join the kind check, which compares numbered against unordered items as the writer's `openPlateList` does, so a bullet and a number at one level of one list report `list-structure`, as `docx.mdx:225-227` already promises, and `lossPolicy: 'reject'` fails. Bullets and to-dos share an unordered level; export puts every to-do on one document-wide to-do numbering, a limit Open work already names, so a to-do beside a bullet reports nothing. A bullet joins only when it has a string `listId`, so an id-less bullet beside an id-less number stays unreported, as today. Since `6fa1169c5e` the Markdown decoder gives every list an id, and Open work asks whether bullets without one still need this exemption. Numbered and task items keep today's check, id-less ones included, because a numbered item and a to-do with no id can be one Markdown list or two (D08 stays with zbeyens). The start and level-rule checks stay on numbered and task items, because a bullet shows no number. The writer takes a list's Word definition from its first item of any kind, so a bullet that leads its list gives Word its level rules and starts without a warning; the diff panel's second round showed that mirroring the writer from the document misses id-less bullets and reports images that open no Word list, so that limit is Open work.

HTML import. Before the list decoder's first pass, `prepareDocument` moves a `(ul|ol)[data-list-id]` holding one `li` out of its parent when it is that parent's only child apart from whitespace and the parent is a heading, a `blockquote`, a `pre` or a `code` inside a `pre`. When the parent is a `code` inside a `pre`, it also moves out of that `pre`, and it never moves further. Any other parent, such as a table cell, or any other child beside the list, such as a rule or an image, leaves the HTML as it is. So `<h2><ol><li>Title</li></ol></h2>` reads as `<ol><li><h2>Title</h2></li></ol>`, and the code block's `<pre><code><ol><li>` ends outside `pre`. The decoder already turns both results into a listed heading and a listed code block; one move alone leaves the code block's list behind (`proof/r2-code-hoist-a1.log`). Moving further would take a quote's one numbered heading and number the quote instead (`proof/r3-quote-hoist-a1.log`). The semantic encoder's output and foreign HTML carry no such inner wrapper, so they are untouched.

- Numbered and task paragraphs and code blocks keep today's Word output and static HTML, byte for byte in `word/document.xml`, `word/numbering.xml` and the rendered HTML. Numbered headings and quotes change on purpose.
- After a trip through HTML, Markdown lists that had no id share one list id, because the static output writes `data-list-id=""` for each and import maps that value to one list; a bullet list then a numbered list from such a document now warns on Word export. D06's fix gives Markdown lists their own ids.
- A listed heading or quote now carries its own paragraph properties into Word, such as alignment, and a structure revision on it as `w:pPrChange`.
- Bulleted quotes and code blocks draw their marker inside the box, where numbered ones already sit.
- A table cell gets all of this through D11's shared walker.
- Toggles and images keep losing their list in Word and HTML for every kind, with no diagnostic, as today; that is Open work.
- A list item inside a quote still exports as quote text with no number, because the quote branch flattens its children into one paragraph; that is Open work too.

## What existing behavior changes

Each row says what a user or an app sees change, what stays as it is, and which check proves nothing else changed. No fix changes a public function's signature.

| Case | Changes on purpose | Stays the same | Proof that nothing else changed |
| --- | --- | --- | --- |
| D11 | Word files now contain the lists, code, equations, images, nested tables and heading styles inside cells; a nested table and its images take their width from the cell that holds them | Every byte of a document with no table, and of a table whose cells hold only paragraphs; cell shading on the cell only; list items in a cell keep their own formatting | the body-only and plain-table byte comparisons, the nested-table extent test, the `w:tc` guard on a cell whose only image cannot be embedded, the DOCX specs, browser R16 and R17 |
| D05 | A Word file whose footnote and endnote parts hold only Word's separator notes and an empty continuation notice imports, and their false warnings disappear under `lossPolicy: 'allow'` | A file with a real note, or a continuation notice holding text, a field, a border, shading, a number or a paragraph style, and any header or footer, a page-number footer included, is still refused by default and still reported under `allow` | the real-note and field-only-footer controls, the `importDocx` and `sourceEligibility` specs, the fixture survey |
| D01, D02, D14 | Saved HTML and Word keep bullets as lists; a numbered or bulleted heading keeps its text, style, bookmark and number in Word, and its heading type through HTML; a numbered quote keeps its number in Word; a listed code block keeps its list through HTML; a list mixing bullets with numbers or to-dos at one level of a list with an id now warns on Word export, and `reject` refuses it, which includes Markdown lists after a trip through HTML; a listed heading or quote carries its alignment and structure revisions into Word; bulleted quotes and code blocks draw their marker inside the box; a bullet that leads its list now gives Word its level rules and starts, with no warning | Numbered and task paragraphs and code blocks, in `word/document.xml`, `word/numbering.xml` and static HTML; the live editor; bulleted paragraphs and headings on the static page; warnings on Markdown and AI documents that have not been through HTML; toggles, images and list items inside a quote, which keep losing their list in Word as today | `word/document.xml` and `word/numbering.xml` comparisons for numbered and task paragraphs and code blocks, before and after screenshots of the static page, `list-numbering.spec.tsx`, `list-roundtrip.spec.tsx`, browser R16 and R17 |
| D03 | Bullet levels drawn with ☐, ☑ or ☒ import as to-dos, as our own export writes them, while Word's own checkbox bullets in Wingdings symbols are not covered; all to-dos of a document come back as one checked and one unchecked list, as export writes them | Bullets with any other glyph; numbered levels; Word export | the existing numbering specs, the ordinary-bullet case at `importDocxNumbering.slow.ts:569` |
| D07 | Fewer `list-start` warnings; the Word file is byte for byte the same | The warning for a start Word cannot show, at a default or a custom level start | the controls at level start 1 and 3, a nested level, `list-numbering.spec.tsx` |
| D12 | Markdown export keeps a list item's later paragraphs inside that item, also after a sublist | A block whose `indent - 1` has no open list item still ends the list, and so does one under an item a later block closed; a paragraph whose indent the nesting cannot write still reports it; ordinary lists export the same text | the round-trip and continuation specs, `standardList.spec.ts:286` |
| D13 | The demo's import shows one summary toast and no toast for lossless removals | Error toasts; the export menu; the import result itself | the import button spec |

## Main changes

- DOCX export: a table cell's children go through the same block dispatch as the document body, and nested tables and images take their width from their cell, so wrappers at any depth, lists, code blocks, equations, images and heading styles export in a cell as they do outside one (D11, shape per Design).
- DOCX import: a footnotes or endnotes part counts as dropped content only when one of its notes is not one of Word's typed separator or notice notes (D05).
- Registry static list kit: bullets render through the same inner list wrapper as numbered and task items, except on toggles and images (D01, D02).
- DOCX export: a heading or quote holding a Plate list wrapper converts through its own branch and its first paragraph takes the item's number; diagnostics count bullets (D01, D14).
- HTML import: a Plate list wrapper that is the only child of a heading, a blockquote, a `pre` or a `code` inside a `pre` moves outside it before the list decoder reads it (D02, D14).
- DOCX import: a bullet numbering level drawn with a checkbox glyph becomes a task item with its checked state (D03).
- DOCX export: `list-start` is reported only when a numbered or task item's `listStart` differs from the start its list's first numbered or task item gives that level (D07).
- Markdown serialize: a block with no `listType` stays in the open list item at its `indent - 1` as a continuation block (D12).
- Registry import button: one aggregate warning toast that leaves out lossless diagnostics (D13).

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The two Markdown list bugs (D06, D08) | Wait until zbeyens finishes his AI suggestion work, then you fix them, since the fix changes it (look) | Fix them here, AI change included | build markdown lists here | big |
| Who fixes the other items this plan leaves open | You fix the Word header and footer item; the two Tab items stay with zbeyens, because his next list phase rewrites that code (look) | You fix those two Tab items too | I fix the tab items | small |
| Equations in HTML files | A separate plan, with a design review first (look) | Do it in this plan | equations in this plan | big |
| Word files with real headers or footers | Still refused, as the strict setting says (look) | Open them and warn about what gets dropped | import Word with headers | big |
| Which empty parts of a Word file stop blocking import | Only footnotes and endnotes that hold nothing but Word's separator lines | Also headers and footers with no text | open empty headers | small |
| Word files that keep their main text under another name | Still refused, since they look rare (look) | Find the main text where the file points | follow the main text pointer | small |
| Bullets in saved HTML and Word | A real list, like numbered and to-do items (look) | Keep drawing them with styling only | style-only bullets | small |
| How saved HTML marks a list item | Inside each block, as numbered items already do; the smaller change, and numbered and to-do output stays the same (look) | Around the whole block; cleaner HTML, and toggles and images keep their lists too, but numbered and to-do items get drawn differently | wrap the whole block | big |
| Circle and square bullets on the saved page | Stay plain dots, as today, since zbeyens owns that case | Draw the chosen circle or square | draw bullet styles | detail |
| Checkbox bullets in Word files | Turn into to-dos, checked or not | Stay plain bullets | keep checkbox bullets | small |
| Start number warning on Word export | Only when the start differs from the one the list's first numbered or to-do item sets | Stop typed lists from saving a start of 1 | stop storing start one | small |
| To-dos after a trip through Word | All to-dos come back as two lists, one checked and one unchecked, because that is how export saves them (look) | Save each to-do list as its own Word list | separate to-do lists | detail |
| List items inside a table cell in Word | Keep their own formatting, like today | Take the cell's color and alignment too | cell lists take cell formatting | detail |
| Warnings when importing in the demo | One summary, skipping harmless cleanups | One message per warning, like today | toast every warning | detail |
| Checking that a numbered heading opens in Word | Opened in LibreOffice once you installed it: bullets, numbered headings in their heading style, a numbered quote and a table cell's list, to-do and code all show; Word itself was not tried | Also open the file in Word | open in word | small |
| The generated API reference file | Leave it as it was: 68 older out-of-date entries stay for their owner, 21 about migrations and the rest about lists and the editor | Regenerate the whole file | regenerate the whole manifest | detail |
| Speed of saving big tables to Word | Measured on a busy machine: the content comes out right, but the timings are too noisy to trust (look) | Measure again on a quiet machine before release | measure table export again | small |
| Where this plan's page lives | Its own page | On the Word documents page | documents page | detail |
| Committing | Left uncommitted for you to review | Commit each fix | commit fixes | detail |
| Merging while CI is red | Call it ready, since every red check fails on next too, and rerun nothing (look) | Hold the PR until next is green | wait for green next | small |
| This plan's page link | A new page, https://claude.ai/artifact/PpUHyCPF1tbBMYsZSbyhrR, since another account owns the old one | Keep linking the old page, https://claude.ai/artifact/Y7htsf8d4tGAqrG1T24mWJ | old page link | detail |
| Where the start number warning gets a level's start | From the same code the Word writer uses, so the two cannot disagree | Keep the warning's own reader | own start reader | detail |

## Steps

Each case writes its test first, runs it on the current bytes to see it fail for the named defect, then fixes and reruns it, per `.agents/pstack/rules/tests.md`. Every proof log comes from `node .agents/pstack/proof.mjs --dir docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof`.

Execution authority: the owner's go on 2026-10-12 to move to implementation, with every change left uncommitted for the owner. Packet: build base `5fc246c291` on `next`; the task's files are those the steps below name, plus their generated registry output.

- [x] Run `architect` for D01, D02 and D14: bullets as real lists in static output, composed with every block type the list kit targets (heading, quote, code block, toggle, image), a heading or quote holding a list keeping its text, style, bookmark and numbering in Word, and a list mixing bullets and numbers keeping one identity or reporting the split under `lossPolicy: 'reject'`. Its design lands in Design. Proof: `architect/d01/synthesis.md`, `architect/d01/judge/verdict.md`.
- [x] Run panel review round 2 on this plan. Proof: its `seats` row. Closed by `docs/plans/artifacts/2026-10-12-list-import-export-fixes/panel/round2/opus.md`, `astra.md` and `sol.md`.
- [x] Write the D11 tests first in `apps/www/src/registry/components/editor/docx-export.spec.tsx`, which already exports through `BaseEditorKit` and `EditorStatic`. They export one cell each for a numbered item, a task, a code block, an equation, an image, a heading and a callout, and assert inside that `w:tc` the text and Word form (numbering, Word math, drawing, `Heading2` first in `w:pPr` with its bookmark, the callout's inner table). One more test numbers a list before, inside and after a cell. A two-column table holding a one-column table holding an oversized image must give that image an extent no wider than the outer cell. A guard checks that a cell whose only image cannot be embedded still ends in `w:p`; the planned shading guard was dropped, see the decision log. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d11-red-a2.log` fails for the lost cell content and the image width.
- [x] Fix D11 per Design in `xml-builder.ts` and `render-document-file.ts`, then run the new tests, `html-to-docx.slow.ts`, `render-document-file.spec.ts`, `exportDocx.spec.ts` and the integration DOCX specs. A probe exports a body-only document and a table of plain paragraphs from a detached worktree at the build base and from the working tree, and compares the `document.xml` bytes, which must match; it is a proof, not a committed snapshot. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d11-green-a2.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d11-docx-fast-a3.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d11-docx-slow-a2.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d11-bytes-compare-a2.log`.
- [x] Measure the D11 cost. Load `benchmark`. A probe exports, through the registry presentation, tables whose cells hold only paragraphs, at two sizes, from a detached worktree at the build base and from the working tree, asserts the same exported text from both, and compares the export times. Nested tables and lists in cells, which the base drops, get a correctness check and a scaling check across two cell counts on the working tree only. `pnpm bench:docx` runs as an unrelated regression control, since it has no tables. Proof: `proof/d11-cost-a<N>.log`, with the comparison checked against Benchmark's checklist.
- [x] Write the D05 tests first in `packages/platejs/src/docx/import/lib/importDocx.spec.ts`. A package whose footnotes and endnotes parts hold only notes typed `separator` or `continuationSeparator` and an empty `continuationNotice` imports under the default policy. These controls must still report the part as dropped, refused by default and reported under `allow`: a footnotes part with one untyped note among separators, a footnotes part with one note typed `normal` among separators, a footnotes part whose `continuationNotice` holds text, and a footer holding only `<w:fldSimple w:instr="PAGE">`, as in `sourceEligibility.spec.ts:153`. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d05-red-a1.log`.
- [x] Fix D05 in `unsupportedPackageDiagnostics`. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d05-green-a1.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d05-survey-a1.log`.
- [x] Write the D01, D02 and D14 tests first, one per failure mode, through the registry static kit. In `apps/www/src/__tests__/package-integration/docx/list-numbering.spec.tsx`: bullets at indent 1 and 2 export with `w:numPr` at levels 0 and 1 on a bullet format; a numbered heading keeps its text, `Heading2` first in `w:pPr`, its bookmark and `w:numPr` on one paragraph; a numbered quote keeps its text and gets `w:numPr`. In `apps/www/src/registry/components/editor/list.spec.tsx`, the static round-trip fixture gains a bulleted paragraph, a circle bullet, a bulleted heading, a numbered heading, a task heading, a numbered code block rendered through the registry code block, and a quote holding one numbered heading, and the check compares `type`, `listType`, `listStyle`, `indent`, `checked`, shared membership, the code text, and that the quote's heading, not the quote, holds the list. In `list-roundtrip.spec.tsx`, the bullet-first test becomes both kind orders plus a bullet beside a task, each reporting `list-structure` at the second kind's item, with `reject` failing; a bullet that carries `listStart` reports no `list-start`; and the parsed Markdown `- a` then `1. b` exports under `reject` with no `list-structure`, while `1. a` then `2. [ ] t`, one Markdown list, still reports its split. The two `list.spec.tsx` assertions that pin the bullet bypass (`:90-109`, `:112-161`) change on purpose, to a disc `ul` wrapper and to root injection only for toggle and image bullets. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d01-red-a2.log`.
- [x] Fix D01, D02 and D14 per Design: `block-list-static.tsx` and `list-static.tsx` with `plate-ui`, `readPlateListItem` and the listed-block branch of `findXMLEquivalent` in the DOCX converter, `listDiagnostics` in `exportDocx.tsx`, and the hoist in `BaseListPlugin.ts`'s HTML preparation. Then run the list, DOCX list and HTML list specs. A probe renders and exports documents of numbered and task paragraphs and of a numbered code block from a detached worktree at the build base and from the working tree, and compares the static HTML, `word/document.xml` and `word/numbering.xml`, which must match. Open the numbered heading's `.docx` in LibreOffice to check it loads with its style and number. Capture the bulleted paragraph, heading, quote and code block before and after on the static page and on the server-side docs example, which draws through the same kit, and inspect the screenshots. Run `pnpm --filter www build:registry` and add a registry changelog entry. Proof: `proof/d01-green-a<N>.log`, `proof/d01-bytes-a<N>.log`, `proof/d01-lo-a<N>.log` and the screenshots.
- [x] Write the D03 test first in `packages/platejs/src/docx/export/lib/exportDocx.lists.spec.tsx`. A checked and an unchecked task go out through `exportDocx`, come back through `importDocx`, and must still be tasks with their checked states. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d03-red-a1.log`.
- [x] Fix D03 in `readDocxNumbering` and `applyListMarkers`. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d03-green-a2.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d03-docx-suites-a1.log`.
- [x] Write the D07 tests first in `apps/www/src/__tests__/package-integration/docx/list-roundtrip.spec.tsx`, beside the existing start test, since the lists spec's export helper throws on any warning. With level start 1, `listStart: 1` reports no `list-start` and `listStart: 3` reports it. With level start 3 on the list's first item, `listStart: 3` reports nothing and `listStart: 1` reports it, also at a nested level, and also for a nested item whose own `listLevels` differ from the first item's. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d07-red-a2.log`.
- [x] Fix D07 in `listDiagnostics`. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d07-green-a2.log`.
- [x] Write the D12 tests first in `packages/platejs/src/markdown/lib/serializer/standardList.spec.ts`. Each of these parses and serializes back to the same Markdown with no `markdown-property-omitted` and no empty sublist: an item with a second paragraph, a parent's paragraph after its sublist, a child's second paragraph, two continuation paragraphs, and a continuation, then a sublist, then a sibling. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d12-red-a1.log`.
- [x] Fix D12 in `convertNodesSerialize` and `listToMdastTree`, then run the Markdown serializer and continuation specs. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d12-green-a1.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d12-suite-a1.log`.
- [x] Write the D13 test first in `apps/www/src/registry/components/editor/import-toolbar-button.spec.tsx`, through the Word import path, which shares the toast with HTML and Markdown and is the one the spec's file picker captures. An HTML import whose parse reports 19 lossless warnings and one lossy warning shows one toast, "Imported with 1 warning." Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/d13-red-a1.log`.
- [x] Fix D13 in the import button with `plate-ui`, then run `pnpm --filter www build:registry` and add a registry changelog entry. Proof: `proof/d13-green-a<N>.log` and the regenerated registry output.
- [x] Update `content/docs/(plugins)/(serializing)/docx.mdx`, `content/docs/(plugins)/(styles)/list.mdx` and their Chinese twins with `plate-docs`, for the `list-start` sentence, checkbox bullets importing as to-dos, bullets exporting as Word lists, the `list-structure` warning now covering bullets. Proof: the `plate-docs` checks.
- [x] Write the `platejs` changeset for the package fixes with the `changeset` skill. Proof: the changeset file and its check.
- [x] Replay `docs/plans/artifacts/2026-10-11-list-regression/specs/final.spec.ts` in the browser, with D05's expected refusals narrowed to the two footer files, `legal.docx` and `alternate_document_path.docx`. R01 to R20 and D01, D02, D03, D05, D07, D11, D12 and D13 pass, and only D04, D06 and D08, out of scope, and D09 and D10, left to zbeyens, still fail. Proof: `proof/final-after-a<N>.log`, run twice.
- [x] Run `deslop`, then `no-comments`, on the product code, and one `unslop` pass on the docs, the changeset and this plan. Proof: the skill runs and a `writing` row.
- [x] Run `pnpm --filter platejs typecheck`, `pnpm --filter www typecheck` (registry, docs parity and the API reference check), the test typecheck of each touched spec against `HEAD`, and `pnpm lint:task` on the task's files. Proof: their logs.
- [x] Run the panel on the build's diff (reviews: api-build), then rerun every proof its fixes touch. Proof: its `seats` row and finding rows. Closed by `docs/plans/artifacts/2026-10-12-list-import-export-fixes/panel/diff3/opus.md` after rounds `diff1` and `diff2`, and `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/final-after-a7.log`.
- [x] Run the decision-trail review, because this run spans a session restart. Proof: its Attention section in the Close. Closed by `docs/plans/artifacts/2026-10-12-list-import-export-fixes/trail/sol.md`.
- [x] Hand back uncommitted with the page; the owner commits. Closed by https://claude.ai/artifact/Y7htsf8d4tGAqrG1T24mWJ.
- [x] For the babysit, compare every red CI check on the PR with the same check on next at `6fa1169c5e`, test by test. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/ci/next-ci.sum`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/ci/pr-ci.sum`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/ci/next-plite.fails`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/ci/pr-plite.fails` and `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/migrate-list-identity-pr-a1.log`.
- [x] For the babysit, run `pstack:thermo-nuclear-code-quality-review` on the PR diff and repair what it finds at its owner, with behavior unchanged. Proof: `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/focused-specs-base-a1.log` and `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/focused-specs-repair-a3.log` (463 package and 57 www tests on both), `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/typecheck-platejs-repair-a3.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/entrypoint-check-repair-a3.log`, `docs/plans/artifacts/2026-10-12-list-import-export-fixes/proof/lint-task-repair-a1.log` and `docs/plans/artifacts/2026-10-12-list-import-export-fixes/comment-sicko/babysit-reply.md`.

## Completion Gates

| Gate | Artifact |
| --- | --- |
| `pstack:blast-radius` before code moves | `docs/plans/artifacts/2026-10-12-list-import-export-fixes/blast-radius.md` |
| `verify` loaded before the first proof gate | this build's `verify` invocation, before the D11 tests |
| Browser replay of the regression spec on the final bytes | `proof/final-after-a6.log`, `proof/final-after-a7.log` |
| `plate-docs` on every docs page the steps name, with its example coverage audit | `proof/www-build-source-a2.log`, `proof/www-docs-parity-a2.log`, `proof/build-registry-check-a3.log` |
| `pnpm check` steps the edits reach, before the browser replay and the cost runs | each link run on its own, since `editor:check` and `api-reference:check` are red at the base: `proof/build-registry-check-a3.log`, `proof/changelog-check-a1.log`, `proof/www-build-source-a2.log`, `proof/www-docs-parity-a2.log`, `proof/www-registry-source-a1.log`, `proof/www-tsc-a4.log`, `proof/www-tsc-integration-a3.log` (the base's errors only) |
| `pstack:thermo-nuclear-code-quality-review` per shared slice | skip: the `api-build` panel on the diff is owed from the first slice |
| Slice freezes with `freeze.mjs` | slices 6897a371d4, a1249e163e, 8f60eed10a, 376bf2ec03, da55fb55fe; panel trees a793065c2d, e1d632e90a, f3ec3d8841 |
| `oxlint --type-aware` on the task's files before the panel freeze | `proof/oxlint-task-a3.log` before the first panel freeze, `proof/oxlint-task-a7.log` on its last fixes |
| Benchmark rerun of the D11 cost check on the final bytes | accepted on its loaded-host run, the Defaults row `measure table export again` |
| `changeset` for `platejs` | the five amended `.changeset` files and the registry entry `2026-10-12-fix-list-import-export.mdx`, `proof/changelog-check-a1.log` |
| Writing passes: `deslop`, `no-comments`, `unslop` | the `writing` rows; `comment-sicko/reply.md`, `round1-reply.md`, `round2-reply.md` |
| Diff panel (reviews: api-build) | three rounds, `panel/diff1`, `panel/diff2`, `panel/diff3`, and their `panel` rows |
| `pnpm lint:task` as the last check that edits code | `proof/lint-task-a1.log` on the task's files, `proof/lint-task-a2.log` on the last spec edit |
| Decision-trail review | `trail/sol.md`, the Attention section of the Close and the `trail` rows |

## Open work

- D08: Word export of an imported Markdown document with to-dos warns although Word shows the same content. On the latest next, which gives each Markdown list its own id and fixes D06, it reports three warnings: `list-start` for a Markdown list that starts at 3, which Word still numbers 3, and `list-structure` for two bullets that follow to-dos in one Markdown list, since export puts to-dos on their own Word numbering. Whether these warnings stay is a call on D07's rule and zbeyens's Markdown list ids. owner: natamox. stop: zbeyens finishes the suggestion-mode refactor, or the owner's word to settle it here.
- Equations in HTML export and import (D04). owner: natamox. stop: the owner's go on an equation HTML plan. Tracked here until the close moves it to the html subject's Open work.
- Word files whose main text is not `word/document.xml` (`alternate_document_path.docx`). owner: natamox. stop: a real Word-written file with another main part name, or 2026-12-31. The close moves it to the documents subject's Open work.
- Import refuses a Word file with a real header or footer before source retention can keep it, while the DOCX docs say retention carries headers and footers. owner: natamox. stop: a documents subject plan that sets the import policy for retained parts, or 2026-12-31. The close moves it to the documents subject's Open work.
- Every to-do of a document goes to Word as one checked and one unchecked list, so separate to-do lists merge on import. owner: natamox. stop: a request to keep to-do lists apart in Word, or 2026-12-31.
- Lists on toggles and images are lost in Word and static HTML for every kind, with no diagnostic, because their drawings drop wrapped children; wrapping the whole block (the `wrap the whole block` Defaults row) would fix them. owner: natamox. stop: a report of a listed toggle or image, or 2026-12-31.
- A list item inside a quote exports to Word as quote text with no number or bullet, because the quote branch flattens its children into one paragraph (`render-document-file.ts:396-405`). owner: natamox. stop: a report of a quoted list in Word, or 2026-12-31.
- Blockquote's own Shift+Tab lifts a block out of any quote ancestor, so a paragraph in a table cell inside a quote can leave its cell when no list item is selected (`BaseBlockPlugins.ts:203-212`). owner: zbeyens. stop: his list plan's phase 2, or 2026-12-31.
- Generated files already out of date at the base: `apps/www/src/generated/api-reference-manifest.json` (68 differences at the base, 21 in migrations and 47 in list and editor entries; regenerate it in a `proof-worktree.mjs --install` worktree with `pnpm --filter plitejs build && pnpm --filter platejs build && pnpm --filter www api-reference`) and `plugins.generated.ts` with `plugins.schema.json` (`listId` and `listLevels` from the list refactor; `pnpm --filter www editor:generate`). Until then `pnpm --filter www typecheck` stops at its first link. owner: zbeyens, whose list refactor and migrations changed them. stop: his next list commit, or the owner's word to regenerate them here.
- Word export does not report a bullet that leads its list and gives Word its level rules and starts, which a later numbered item at another level then follows. The durable fix reports the loss where the writer picks each list's definition. owner: natamox. stop: a report of a wrong Word level start, or the next DOCX list change.
- A check that fails when new code copies logic an existing function owns, such as a duplicate-code gate with a baseline, for the rules table's rule-only row on calling the existing owner. This run's repeat, the listed DOCX branch copying `buildList`'s to-do numbering, is fixed by one owner, `itemNumberingId`. owner: natamox. stop: the owner takes or drops a repo-wide duplicate-code gate.
- D10: toolbar or block menu Outdent on a top-level list item moves it left of its list. D09, Tab and Shift+Tab with several list items selected, passes on the latest next after zbeyens's own list commit. owner: zbeyens. stop: his confirmation, or his list plan's phase 2.
- Tab and Shift+Tab with several paragraphs selected and no list item still do nothing, because Indent's handlers read one block. owner: zbeyens. stop: his list plan's phase 2, which moves those handlers.
- The DOCX writer emits a paragraph's properties in the order its attribute keys were added (`buildParagraphProperties` in `xml-builder.ts`), so the DOCX converter's `paragraph` helper spreads a block's own keys first to keep `w:pStyle` ahead of `w:numPr`. A writer that emits `w:pPr` children in the schema's order would drop that trick for every caller, but it can change the bytes of existing exports, so it needs its own byte comparison. owner: natamox. stop: the next change to Word paragraph properties, or 2026-12-31.
- `canShareListWithOtherKind` in `exportDocx.tsx` keeps bullets with no list id out of the kind check, for the reason that Markdown and AI bullets carry no id. Since `6fa1169c5e` the Markdown decoder gives every list an id, so the babysit deleted that comment. Whether bullets with no id still need the exemption, or the guard can go, needs a test naming what still makes them. owner: natamox. stop: the next change to Word list warnings, or 2026-12-31.
- The Markdown serializer copies the decoder's rule that an item's later blocks sit at its indent plus one in two places, `isListContinuation` in `convertNodesSerialize.ts` and the `indentWritten` check in `listToMdastTree.ts`. One helper owned by the list decoder would let both read it. owner: natamox. stop: the next change to Markdown list encoding, or 2026-12-31.

## Babysit

zbeyens asked to babysit PR 5160 to merge-ready. The pass ran in a detached worktree at the PR head, `/Users/zbeyens/git/plate-2-pr5160`, and pushed its repair to `fix/list-import-export`.

The change should exist. Word export dropped table cell content with no warning, and Word files with empty footnotes would not open. The strongest cut on the table was wrapping the whole block in the saved HTML, which would delete the HTML hoist and the converter's listed-block branch. It stays a Defaults row, because the live editor's `BlockList` draws the same inner wrapper for numbered and to-do items, so the whole-block shape would split saved output from the editor.

On both pushed heads, `3811e90470` and `6f40b8f7ca`, every red check step is also red on next at `6fa1169c5e`, with the same failing tests, lint lines, template lint errors and browser cases. Each run also timed out one heavy test that neither commit touches. The first run timed out `migrateListIdentity` at 15 s, and its file passes locally in 1.8 s. The second timed out a list index property test at 30 s, and it passes locally in 9 s. No rerun, since CI cannot go green while next is red.

Review findings from `pstack:thermo-nuclear-code-quality-review`:

| Finding | Outcome |
| --- | --- |
| The start warning in `listDiagnostics` read `listLevels` through its own `unknown` guard, a second copy of how the Word writer reads a level's start | Fixed. The writer's `readLevelRules` now parses through `toWordLevelRules`, and the warning calls it too, so both read a start the same way. The first try used the list feature's `isListLevels`, and the `docx-export` partition's typecheck refuses that import |
| `listToMdastTree` opened a nested list with the same 20 lines in two places | Fixed with one `openNestedList` helper |
| `convertNodesSerialize` added `indentOf`, a copy of the list feature's `getListIndent`, which the Markdown partition already imports | Fixed. It calls `getListIndent` |
| The converter's `paragraph` helper spreads a block's own keys twice to keep `w:pStyle` first | Kept. The writer orders `w:pPr` by key order, an older limit, and Open work tracks a writer that follows the schema order |
| `drawsBulletOnRoot` names toggles and images inside the list kit | Kept. The wrapper and the root marker share this one predicate, and the whole-block Defaults row and Open work cover the cause |
| The HTML hoist and the converter's listed-block branch exist only for the inner wrapper | Kept. It is the cost of matching the live editor's markup, as the verdict above says |

No file crosses 1,000 lines because of this PR, and the files already over it shrank or grew by under 80 lines.

## Close

Reversals and deviations come first.

- The diff panel's round 1 had Word export's list warnings follow the writer, which takes a list's Word numbering from its first item of any kind. Round 2 showed that copy of the writer's rule still missed bullets with no list id and wrongly warned about bulleted images, so round 2 reverted it. The claim narrows: the level-rule and start warnings compare with the list's first numbered or task item, and a bullet that leads its list gives Word its rules with no warning. `docx.mdx`, its Chinese twin, the `list-scoped-api` changeset and Open work say so.
- The planned `convertListedBlock` and `numberFirstParagraph` were not built. A listed heading or quote converts through `findXMLEquivalent` with the item's number in its scope, and both it and `buildList` take a to-do's numbering from one helper, `itemNumberingId`.
- HTML import keeps an item's own `data-list-style`, so a circle bullet keeps its style through HTML. The HTML hoist runs only for a heading, a blockquote or a code block whose only child is the list, which the panel narrowed from any block but a `div`.
- A continuation notice counts as empty only when its paragraphs hold nothing but spacing-like properties; a field, a drawing, a border, shading, a number or a paragraph style makes it content. A Markdown paragraph under an item that a later block closed, or under an item that skipped a level, reports its lost indent.
- The table export timing ran on a busy machine, and a `look` Defaults row accepts it (`measure table export again`). The numbered heading check first ran as a stand-in, reading the Word parts and importing them back; once LibreOffice was installed, the same kind of file opened there with bullets, numbered headings, a numbered quote and a cell's list, to-do and code, where the base file shows none of them (`lo/before/lists.png`, `lo/after/lists.png`).
- The generated API reference and the editor's generated plugin types were already out of date at the base. This change leaves both as they were, so `pnpm --filter www typecheck` still stops at its first link.

What landed, uncommitted on `next` for the owner:

- D11: Word export renders a table cell's blocks as the body does, so lists, to-dos, code, equations, images, headings and nested tables inside cells keep their content and a nested table fits its cell.
- D14, D01, D02: bullets are real lists in saved HTML and Word, and a numbered or bulleted heading or quote keeps its text, style and number in Word.
- D05: Word files whose note parts hold only Word's separators and an empty continuation notice import.
- D03: checkbox bullet levels import as to-dos with their checked state.
- D07: `list-start` warns only when a numbered or to-do item's start differs from the one its list's first numbered or to-do item sets.
- D12: Markdown export keeps an item's later paragraphs inside it.
- D13: the import button shows one warning summary that leaves out lossless cleanups.

Proof. Every case has a test that failed before its fix (the `*-red-*` logs), and mutation runs revert each fix and condition alone. The final tree passes 63 package spec files one per process (`proof/revert-pkg-a1.log`), the www specs the changes reach (`proof/revert-www-a1.log`), the slow DOCX specs (`proof/final-docx-slow-a1.log`), the platejs typecheck (`proof/typecheck-platejs-a11.log`), the www typecheck (`proof/www-tsc-a5.log`), the integration typecheck with only the base's errors, the spec typecheck with the same 262 errors as the base (`proof/test-typecheck-a4.log`), and `pnpm lint:task`. Numbered, to-do and code block output stays byte-identical to the base in static HTML and in Word's `document.xml` and `numbering.xml` (`proof/d01-bytes-compare-a2.log`). The browser regression suite passes R01 to R20 and D01, D02, D03, D05, D07, D11, D12 and D13 in Chromium, twice (`proof/final-after-a6.log`, `proof/final-after-a7.log`); D04, D06 and D08 fail as Scope keeps them out, and so do D09 and D10, left to zbeyens. The docx benchmarks' correctness and work-count tests also ran: the retained-source one passes, and the revision-import one fails on its XML parse count exactly as it does at the base (`proof/bench-docx-counts-a1.log`, `proof/bench-docx-counts-base-a1.log`).

Limits: Chromium only; LibreOffice, not Word, rendered the Word file; no timing on the final tree or on a quiet machine, so table export speed and its scaling are unmeasured; the static page screenshots come from a rendered page with the app's Tailwind build, not from a download through the export menu.

Counts: 25 steps, all done; one, the table export cost, rests on narrower proof that a `look` Defaults row accepts. One result stays partial: the class-level `/pstack:correct` work, whose sweep and enforcement check did not run; it has an owner in Open work.

Panel: the plan had three review rounds and the build's diff three, the cap. The diff rounds raised 5 critical findings. Three are fixed, each with a test: the Markdown continuation under a closed item, the HTML hoist dropping siblings and tables, and the continuation notice with non-text content. The fourth, the Word list warnings' rule source, was fixed in round 1, and round 2's critical finding on that fix led to the revert and the narrowed claim above. Their warnings and nits were applied, deferred with owners or dismissed with reasons in the `panel` rows.

Rebased onto the latest next. The branch now sits on zbeyens's commit `6fa1169c5e`, which gives each parsed Markdown list its own `listId`, audits Markdown list membership, draws a bullet's own style and reworks the import button spec. The merge keeps both sides: the Markdown serializer runs his membership audit and this change's continuation blocks together, the static bullet wrapper draws a bullet's own `listStyle` instead of a fixed disc, his static bullet style test reads the wrapper's style, the warning summary test uses his spy setup, and the list docs and changeset keep his Markdown text with this change's sentences added. Regenerating the registry also refreshes the `link` and `select-editor` outputs his commit left stale. On the rebased commit, 57 package spec files and the www specs pass, platejs typechecks, the www typecheck shows only next's own errors in the import button spec, and the browser suite passes everything this plan fixes; D06 and D09 now pass too, from his commit, while D04, D08 and D10 fail as before. R04 failed once in two full runs and once in five repeats, and fails the same way, once in five, on the latest next without this change, so it comes from next.

After the rebase, Markdown bullets carry list ids, so the kind check began to compare to-dos with bullets and refused, under the default `reject`, a Markdown list that holds both, which the latest next exports without a warning. The kind check now compares numbered against unordered items, as the writer splits a level only between `ol` and `ul`; a to-do inside a numbered list still reports its split. Five Markdown cases now export exactly as they do on the latest next, and the browser suite, run twice on the final tree, passes everything this plan fixes; D08 now shows one warning, for the list that starts at 3.

### Attention

reviewed by gpt-6.1-sol @xhigh (Codex), on the frozen plan and log and the session transcript.

1. The API reference backlog was miscounted as all migrations. It is 21 migration fields and 47 list and editor fields. Defaults and Open work now give these counts.
2. Three log rows had their citations edited in place; a `trail` row now records each original and its replacement.
3. Checks named in the D11 step had not run after the fixes; they ran after the review, with the results above.
4. The page claimed table export scales in step with size from inconclusive timings; it now claims content only.
5. `/pstack:correct` was closed with its enforcement deferred; it is now recorded as partial.
6. Two proof descriptions kept superseded wording, the dropped shading guard and three footer refusals; both are corrected.
7. D07's wording still described the start Word uses; it now says the check compares with the list's first numbered or to-do item.
