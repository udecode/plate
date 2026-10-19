---
review_scopes: [conversion-boundary]
review_basis: [2026-10-04-conversion-boundary-audit-2]
verdict: pursue
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/research/decisions/conversion-boundary.md, docs/research/review-records/2026-10-04-conversion-boundary-audit-2.json, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx, packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts, packages/platejs/src/lib/plugins/html/htmlDom.ts, packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts, packages/platejs/src/lib/plugin/PluginFormatContext.ts, packages/platejs/src/internal/plugin/pluginFormatOperation.ts, packages/platejs/src/markdown/lib/types.ts, packages/platejs/src/markdown/lib/internal/markdownMappings.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/interfaces/schema.ts, apps/www/src/registry/components/editor/list.tsx, apps/www/src/registry/components/editor/indent.tsx, 'content/docs/(plugins)/(serializing)/html.mdx', 'content/docs/(plugins)/(styles)/list.mdx', docs/plans/2026-10-03-markdown-table-cell-blocks.md]
review_upstreams: ['../prosemirror-schema-list@d5515fe14169373c3f4ae73d2a82c13b50c6486e', '../prosemirror-flat-list@4f88ff964d595d1910548b074f65c9431171a9a9', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163']
---

# Conversion boundary: list items keep their later blocks

Status: executed, waiting on your commit
Playbook: plan

Pursue, superseding `2026-10-04-conversion-boundary-audit-2` with the same direction, a corrected claim and runtime proof. HTML import and paste glue every block of a list item into one line of text. `editor.api.html.parse('<ol><li><p>a</p><p>b</p></li></ol>')` returns one numbered paragraph reading "ab", and a paragraph followed by a code block becomes "Installnpm i", with no diagnostic even under `lossPolicy: 'reject'` (probe log `artifacts/2026-10-12-conversion-boundary-review/list-blocks-kit-probe-a2.log`). Plate can hold that structure. Its own HTML writes an item's later blocks after the list at one more indent level and reads them back, and Markdown decodes the same item into continuation blocks. The head review said Markdown "already gives" that shape. That holds only when the Indent plugin targets the later block's type. With the default List and Indent plugins, which target paragraphs only, Markdown parse of a list item holding a code block fails the whole document with `markdown-schema-invalid` (`md-diag-probe-a1.log`), where the loss law says a lost property warns. A Markdown item whose first block is a heading or a quote fails the same way in every editor (`first-block-probe-a1.log`). The fix belongs to the List plugin's two mappings, one law in each format, and adds one read to the schema view that format decoders already get. `conversion-boundary` is the scope `review-ledger.mjs next` returned. The in-flight `markdown` scope's open plan, [Markdown table cell blocks](2026-10-03-markdown-table-cell-blocks.md), does not edit the List plugin or the Markdown schema fit.

## Brief

### What will change?

Pasted or imported list items keep their extra paragraphs, code samples and images as separate blocks under the item. Markdown lists with code or headings no longer break the whole import in basic editors.

### What could go wrong?

Pasted lists gain indented blocks. Imports warn when a block can't indent or loses an item style like bold. Images in an item's paragraph still leave the list, and some line breaks vanish, even in strict imports.

## Teach

Plate stores a list as flat blocks. Each item is a block with a list kind and an indent level. Extra blocks that belong to an item, like a second paragraph or a code sample, sit right after it one level deeper, with no list kind. Plate's own HTML and Markdown write and read that shape.

HTML from other apps nests those blocks inside the item. Today Plate's HTML import pulls the text out of every block and glues it into one line, and nothing reports it. Markdown keeps the blocks, but when the editor cannot indent one, the whole import fails.

The fix rewrites foreign list HTML into Plate's own shape before reading it, and warns when an item style no longer reaches a block it moved. The Markdown list reader asks the editor which list settings each block can hold, and reports each one it drops.

## Public API

Parsing HTML whose list item holds a paragraph and then a code block keeps both blocks, as Markdown does for the same item.

```ts before
// docs/plans/artifacts/2026-10-12-conversion-boundary-review/list-blocks-kit.probe.test.ts
const result = editor.api.html.parse(
  '<ol><li><p>Install</p><pre><code>npm i</code></pre></li></ol>'
);
// ok, no diagnostic: one numbered paragraph "Installnpm i"
```

```ts after
// docs/plans/artifacts/2026-10-12-conversion-boundary-review/list-blocks-kit.probe.test.ts
const result = editor.api.html.parse(
  '<ol><li><p>Install</p><pre><code>npm i</code></pre></li></ol>'
);
// ok, no diagnostic: numbered paragraph "Install", then code block "npm i" at indent 2
```

Parsing the same item as Markdown, in an editor whose Indent plugin targets only paragraphs, keeps the document and warns about the one lost indent.

```ts before
// docs/plans/artifacts/2026-10-12-conversion-boundary-review/md-diag.probe.test.ts
const result = editor.api.markdown.parse('1. Install\n\n   ```\n   npm i\n   ```');
// not ok: markdown-schema-invalid, "indent" cannot target element "codeBlock"
```

```ts after
// docs/plans/artifacts/2026-10-12-conversion-boundary-review/md-diag.probe.test.ts
const result = editor.api.markdown.parse('1. Install\n\n   ```\n   npm i\n   ```');
// ok: numbered paragraph "Install", then code block "npm i" with no indent, and one
// markdown-unsupported-node warning: List Markdown omitted property "indent" on "codeBlock"
```

A format decoder's `schema` view gains the editor schema's existing `property` read, so a decoder can ask whether a property fits a block type before it writes it.

```ts before
// packages/platejs/src/lib/plugin/PluginFormatContext.ts
export type PluginFormatSchemaView = Pick<
  EditorCoreStateView['schema'],
  | 'allowsElementType'
  | 'element'
  | 'getElementBehavior'
  | 'getProperty'
  | 'getVocabulary'
>;
```

```ts after
// packages/platejs/src/lib/plugin/PluginFormatContext.ts
export type PluginFormatSchemaView = Pick<
  EditorCoreStateView['schema'],
  | 'allowsElementType'
  | 'element'
  | 'getElementBehavior'
  | 'getProperty'
  | 'getVocabulary'
  | 'property'
>;
```

## Document shape

Paste inserts and import stores the nodes that `html.parse` and `html.parseSlice` return for that list item. The before shape comes from the probe. The after shape is what Markdown parse returns for the matching Markdown when the Indent plugin targets code blocks.

```json before
[
  { "type": "paragraph", "listType": "numbered", "indent": 1, "children": [{ "text": "Installnpm i" }] }
]
```

```json after
[
  { "type": "paragraph", "listType": "numbered", "indent": 1, "children": [{ "text": "Install" }] },
  { "type": "codeBlock", "indent": 2, "children": [{ "text": "npm i" }] }
]
```

A Markdown item whose first block is a heading keeps the heading. With the registry kit's targets it stays a list item; the before shape is a failed parse with no nodes.

```json before
[]
```

```json after
[
  { "type": "heading", "level": 1, "listType": "bulleted", "indent": 1, "children": [{ "text": "Title" }] },
  { "type": "paragraph", "indent": 2, "children": [{ "text": "body" }] }
]
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| An HTML list item's later blocks become blocks one level deeper | Plate | `platejs` root, `BaseListPlugin`'s HTML mapping | `ListPlugin` owns its format mappings ([plate.md](../vision/plate.md) line 1379) |
| The Markdown list decoder keeps each block's type and reports each list property the schema cannot place | Plate | `platejs` root, `BaseListPlugin`'s Markdown mapping | A lost property warns under every policy, and only the producer can tell that loss from a decoder bug, which throws ([plate.md](../vision/plate.md) lines 733 to 749) |
| A format decoder can ask the schema whether a property fits a block type | Plate | `platejs` root, `PluginFormatSchemaView` in `PluginFormatContext.ts`, built in `pluginFormatOperation.ts` | The editor schema already answers `property({ key, placement, type })`; the view passes that read through with its existing type |
| A list item's margin becomes its level before List moves the item's blocks | Plate | `platejs` root, `BaseIndentPlugin`'s HTML mapping | Indent owns turning a margin into a level, with its configured offset and unit |
| A custom or namespaced tag, and ruby markup, reads as inline | Plate | `platejs` root, `htmlDom.ts` | The HTML runtime owns block detection for every mapping |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Clipboard paste of HTML lists | A pasted item keeps its paragraphs, code blocks and the images between them as separate blocks under it | `html.parseSlice` in the List spec under happy-dom; native browser paste unproven |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| After this verdict | Design, plan, build and review the fix in this run (look) | Stop here with the verdict written | hold | big |
| A block in an item that the editor cannot indent | Keep the block in place, not indented, and warn | Turn it into a plain paragraph | make it a paragraph | small |
| A Markdown item that starts with a heading or code sample the list can't hold | Make it a list paragraph and warn, as HTML reads it. A strict import fails | Keep the heading outside the list and warn about each list setting it loses | keep the heading | small |
| An item that is only a heading or code sample, pasted into a basic editor | HTML still makes it a list paragraph with no warning, as today | Make HTML warn too, now | warn in HTML now | small |
| Item depth set only by a margin | Indent turns a list item's margin into a level before List moves the item's blocks | Turn every margin into a level, headings included | read all margins | detail |
| A custom tag, like GitHub's relative-time tag, anywhere in pasted HTML | Read it as inline text, as browsers show it | Treat it as inline only inside list items | custom tags only in lists | small |
| Speed check while the machine is busy | Count the extra work and compare it with the parse cost, then time it again before finishing (look) | Wait for a quiet machine before building | wait for timing | small |
| Text before a block inside one item | The text stays the item, and the block goes one level deeper | Glue them into one line, as today | glue item text | detail |
| An image inside an item's paragraph | It lands where HTML import puts it today, after the item's text and outside the list, with the text after it as another item (look) | The image and the text after it sit under the item, which two review rounds could not do without losing other inline content | plan image moves | detail |
| An item that opens with a nested list | An empty item, then the nested list under it, as HTML already does | Merge the nested items into the outer list, as Markdown does today | merge nested items | detail |
| A div, section or custom tag around an item's blocks | Unwrap it when it has no data attribute, so the import still warns about one it can't read | Unwrap it whatever its attributes | unwrap data wrappers | detail |
| A Markdown item whose first block is not a line of text and the list can't hold it, such as a rule or a quote | The block keeps its type and leaves the list, with one report that a strict import refuses; a nested one stays among its parent item's blocks | Keep the item as an empty list paragraph with the block under it | keep an empty item | small |
| A style the item or a wrapper sets, like bold | Warn once per paste, naming the first style that no longer reaches a block that moved out, and copy none (look) | Copy text styles onto what moved, as the first two builds did | copy styles | detail |
| Empty paragraphs and line breaks between an item's blocks | Drop them with no warning, though outside a list a line break between two blocks stays as an empty paragraph (look) | Keep each as an empty block under the item | keep empty blocks | detail |
| An audio tag in an item's text | Read it as a block. With an audio plugin, it and the text after it go under the item, and without one the parse reports it | Read it as inline, as browsers lay it out, which split the item into two numbered items when an audio plugin was installed | audio inline | detail |
| The ledger check fails on seven other plans | Close the decision page step on the narrower proof: no line names this plan or its page, and six of the seven fail the same way at HEAD (look) | Keep the step open until those plans are fixed | wait for ledger | small |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| HTML list item blocks | `prepareDocument` unwraps every block of an `li` into its text | The `li` keeps its leading text or first block; later blocks, images and inline runs move after it at its level plus one, in source order with nested lists; a `div`, `section` or custom element with no `data-` attribute that holds a block unwraps; a style the `li` or a wrapper set that no longer reaches what moved is reported, once per parse; an image inside the item's paragraph lands where the HTML runtime puts it, as at HEAD; and empty runs, empty paragraphs and formatting whitespace drop | List HTML mapping | Loss law; Plate's own HTML already writes and reads this shape | None; no caller changes | Steps 1 and 4, diff rounds 1 and 2 | An app mapping that claims a `div`, `section` or custom element without `data-` attributes holding blocks loses it inside a list item, and moved blocks lose the item's formatting with a warning | rearchitect |
| Margin-only item depth | List took a continuation's depth from DOM nesting while Indent took the item's from its margin | Indent's HTML `prepareDocument`, at priority 60, writes `data-indent` from `margin-left` on each `li` that has neither `data-indent` nor `aria-level`, so List reads one depth, and List writes the DOM depth on an `li` whose margin Indent cannot read | Indent and List HTML mappings | One owner turns a margin into a level, with the same offset and unit | None | Steps 1 and 4 | Only list items; a heading with a margin keeps today's silent drop | rearchitect |
| HTML custom elements | `isHtmlBlockElement` calls any tag missing from the inline list a block, so List's move would split "Ship it `<g-emoji>`" into blocks | A tag name with `-` or `:` is inline, as browsers lay out custom and namespaced elements, and `RUBY`, `RT`, `RP`, `DATALIST`, `NOSCRIPT` and `SLOT` join the inline tags | `htmlDom.ts` | The move acts on block detection; HTML has no custom block tag | Changeset | Step 1's `HtmlPlugin` case | A custom element an app styles as a block reads as inline unless a mapping claims it | rearchitect |
| Markdown list property placement | Every list property is stamped, and schema fitting fails the whole parse when one cannot be placed | Each property is checked with `schema.property` and dropped with a `kind: 'property'` warning when it cannot be placed | List Markdown decoder | Only the producer can tell a representational loss from a decoder bug | Changeset names the behavior change | Steps 1 and 3 | None found by the probes | rearchitect |
| Markdown item blocks | The first child's blocks become list items forced to paragraph unless an image; later text leaves are dropped | The first block keeps its type when the list can hold it, and a text block the list cannot hold becomes the item's paragraph with a `replaced` element report, while any other first block it cannot hold keeps its type and leaves the list with an `unwrapped` element report; later blocks from any child are continuations; text and inline runs wrap in a paragraph; an item opening with a list gets an empty first block | List Markdown decoder | Parity with HTML for every probed shape | Changeset | Steps 1 and 3 | Under `lossPolicy: 'reject'`, a basic editor now refuses a Markdown item that is only a heading or code sample, which HEAD read silently as a list paragraph | rearchitect |
| Format schema view | Five schema reads | Adds `property`, the editor schema's existing read with its existing type | `platejs` plugin format context | A decoder asks the schema the question the schema answers, instead of copying target rules | API reference manifest entry; `best-api repair` | Step 2 typecheck and step 1's runtime cases | One more public member to keep stable | rearchitect |
| Added repeated work | None | Three schema reads per Markdown item, one per later block, none for reused streaming blocks; a constant number of passes over each HTML item's children | List mappings | Benchmark pre-acceptance probe | None | `work-count-a1.log`, `property-cost-a1.log`; timing gate in Completion Gates | Timing on this busy host is inconclusive | gate |

## Design

`architect` ran three runners on one outcome-only brief, with a rubric written before reading any candidate, and an Opus cross-judge read them anonymized (`artifacts/2026-10-12-conversion-boundary-review/design/architect/`). The judge and the lead both ranked Sol's design first. The synthesis takes Sol's Markdown design, keeps the lead's HTML draft and grafts what every runner asked for. It is written up in `design/architect/synthesis.md`.

- **Markdown.** The List decoder writes each list property through a local check. `schema.property({ key, placement: 'element', type })` returns `null` when the schema cannot place the property on that block type, and the decoder then reports `{ action: 'dropped', kind: 'property', nodeType }`, which the Markdown runtime turns into a `markdown-unsupported-node` warning under every loss policy. Each lost property and block type is reported once per decode, because every report carries the whole list's source. The first block keeps the type it decoded to when the list can hold it. A text block the list cannot hold, such as a heading in a basic editor, becomes the item's paragraph with a `replaced` element report, which follows the loss policy, so the item keeps its place and number as HTML gives it. A text block is one the schema calls neither void nor object and that holds only text and inline nodes, the test `HtmlPlugin` uses. Any other first block the list cannot hold, such as a rule, an image or a quote, keeps its type, leaves the list and gets one `unwrapped` element report; a nested one keeps its item's indent, so it stays among its parent item's blocks. Only the first block gets the item's properties, and every later block from any child gets `indent + 1`. Text and inline runs wrap in a paragraph instead of being dropped. An item that opens with a list gets an empty first block, the shape HTML already gives.
- **HTML.** Indent's own `prepareDocument`, at priority 60, runs first and writes `data-indent` from a `margin-left` it can read on each `li` that has no depth marker. List's `prepareDocument` then gives each `li` in a list its level from `data-indent`, `aria-level` or its DOM depth and writes it back, so an item and its moved blocks read one depth. It unwraps each `div`, `section` or custom element in the `li` that holds a block and has no `data-` attribute, so a `div` that is a line of text stays a block and the runtime still reports a data attribute no mapping reads. With an image plugin installed, an image directly in the `li` counts as a block. An image inside the item's paragraph stays there, and the HTML runtime lifts it out of the list, as at HEAD. The `li` keeps its leading text or first block and moves everything after it out, in source order. A nested list keeps the depth its nesting gives it, and a list inside a moved quote or table cell starts its own depth. Every other block, an image included, gets `data-indent` one past the item's level, and a run of inline content becomes a `p`. A run with no text or media, an empty paragraph and whitespace beside a block drop. The item's own paragraph unwraps into the `li`, as at HEAD, so a paragraph that holds an image or another block does not split away from the item's list properties. A paragraph of text loses its formatting the same way, as at HEAD. Decoding reads formatting from an ancestor's style, so a style that the `li` or an unwrapped wrapper sets does not reach what leaves that element. List reports each such style, except list style, margin and padding, and copies none. The HTML runtime keeps one of List's losses per parse, so a parse warns once, with an `html-unsupported-content` diagnostic that names the first such style, and DOCX import keeps every loss. `DATALIST`, `NOSCRIPT` and `SLOT` join the inline tags, so they no longer split an item's line. `AUDIO` stays a block, so with an audio plugin an audio and the text after it go under the item. The second pass only sets `listStyle`. Indent's decoder and the HTML runtime's `html-unsupported-content` warning then handle a block the editor cannot indent. `assignHtmlListIds` walks back past an item's moved blocks to find a nested list's owner. `htmlDom.ts` reads a tag name with `-` or `:` as inline, so a custom element such as `<g-emoji>` stays in its line, and it lists `RUBY`, `RT`, `RP`, `DATALIST`, `NOSCRIPT` and `SLOT` as inline. The HTML helpers live in `listHtml.internal.ts`.
- **Rejected.** Opus's runtime filter in `runMarkdownDecoders` turns a decoder bug into a warning, against [plate.md](../vision/plate.md) line 733. Sol's and Astra's Indent `prepareDocument` over every element would add a warning to each heading with a margin that today drops it silently (`margin-warning-probe-a1.log`), so the adopted rewrite covers list items only. Sol's full projection of list attributes onto the first block adds nothing, because the HTML runtime already lists an `li` that holds one block. Checking a property with its parent and root, which the panel asked for, is not needed while the shipped List and Indent targets are type-only. A parent-scoped Indent target fails the type-only check (`parent-target-mutant-a1.log`), and the shipped targets pass it (`parent-target-shipped-a1.log`).
- **Agreement by model family.** Keeping the first block's type, the `div` unwrap and the whitespace skip came from both families. The producer check with the added public read came only from the Codex family's runners. The plan review panel moved two calls to the Codex side: Indent now reads list-item margins, and the conversion-local dedup came back as the per-decode `reportOnce`.
- **Prototype.** The prototype in a detached worktree passes the list, Markdown, Indent, HTML, media and DOCX specs (910 tests) and gives the same nodes in both formats for every probed shape (`panel-r1-all-cand-a2.log`, `prototype-cases-cand-a2.log`).
- **Challenge delta.** `improved`. The plan review panel confirmed five critical defects in the first prototype, each by a probe at HEAD and on the prototype: a `div` per line glued its lines again, a custom element split an item's text, moved blocks lost the item's formatting, an image inside the item's paragraph escaped the move, and a margin-only depth put a continuation at the item's own level (`panel-r1-all-base-a1.log`, `panel-r1-all-cand-a2.log`). It also moved the Markdown heading fallback from keep-and-warn to the HTML reading. The diff review's first round confirmed four more critical defects, each by a test that fails on the reviewed bytes (`r1-fix-spec-reviewed-a1.log`): an image wrapped in an inline element or in a later paragraph escaped the move, the Markdown fallback turned a rule or an image into an empty paragraph, the style copy put an item's width on its image and lost a mark under `inherit`, and ruby split an item's line. Its second round confirmed three more on the round-1 fixes (`diff-r2-checkout-a1.log`, `r2-fix-spec-reviewed-a1.log`): hoisting an image out of an inline element dropped that element, such as a mention around its avatar or a figure around its caption; the text-style list dropped `white-space` and `vertical-align`; and unwrapping a wrapper with a `data-` attribute silenced the runtime's report of it. Round 1 had already replaced the image split and the style copy once, so the build removed both instead of replacing them again. List no longer moves an image out of the item's paragraph, which the runtime places as at HEAD, and it reports a style it cannot carry instead of copying it. The `data-` guard came back (`diff-r2-fixed-a2.log`). A warning from the same round found that `<audio>`, `<noscript>`, `<slot>` and `<datalist>` split an item's line, and `<audio>` failed the parse under `reject` (`diff-r2-phrasing-checkout-a1.log`); they joined the inline tags. The third and last round confirmed two more critical defects. With an audio plugin, an inline `<audio>` split one item into two numbered items (all three seats, `diff-r3-checkout-a1.log`), so `AUDIO` went back to a block (`diff-r3-fixed-a1.log`). A newline that an item's `white-space: pre-wrap` kept becomes a space when its block moves out, and the parse reports it only as a style warning, which `reject` accepts (the Codex seats, `diff-r2-fixed-a2.log` case A2a). Round 2 had already taken the style copy out, so the build did not change the style report again, and that finding stays open with its patch. The round also removed the report on the item's own paragraph, which warned on every Google Docs item, and List's own dedupe, which the HTML runtime's makes redundant.

## Steps

Execution authority: the owner's request, "Under Autopilot, a Pursue verdict continues into the Plan and Build playbooks", with no commit or push on `next`. The packet is one slice, steps 1 to 9, built from the prototype that plan review round 1 checked.

- [x] 1. Write the failing tests, each asserting literal nodes and diagnostics. In `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`: HTML and Markdown give the same nodes for an ordered item with a code block before a second item, a paragraph after a nested list, a paragraph before a nested list, a heading-first item with kit targets, an image inside the item's paragraph and an item that opens with a list; a plain `div`, pretty-printed markup and one `div` per line keep an item's blocks; a bold `li` keeps bold on the block it moves; a `48px` margin puts the item at indent 2 and its next block at 3; a numbered Markdown item that opens with a heading in a basic editor reads as the list paragraph HTML gives, with one `replaced` warning; a later block the editor cannot indent stays unindented and warns in both formats under `lossPolicy: 'reject'`; and `parseSlice({ previous })` after an `Intro\n\n` prefix equals a fresh parse at every prefix, with the warning at its shifted source coordinates. In `packages/platejs/src/lib/plugins/html/HtmlPlugin.spec.ts`: a custom element reads as inline text. Proof: `proof-worktree.mjs` at `6fa1169c5e` with `--with` both specs and `--expect-fail` on each new case's `(fail)` line exits 0 and writes its log to the run directory. Done 2026-10-13: `base-control-a1-a1.log` fails all 15 new cases at `6fa1169c5e` source for their defects. A sixteenth case, an image the editor cannot hold, passes at HEAD by design and fails on the ungated prototype (`no-image-test-prototype-a1.log`). Deviation, diff round 2: the bold `li` case now expects the moved block without bold and one `html-unsupported-content` warning naming the dropped style, and the image case puts the image after the item's paragraph instead of inside it, because the build removed the style copy and the image split after round 2.
- [x] 2. Add `'property'` to `PluginFormatSchemaView` and `property: state.schema.property` to the frozen view in `createPluginFormatOperationContext`. Proof: `pnpm --filter platejs typecheck` passes, and step 1's Markdown cases call the read at runtime. Done 2026-10-13: `typecheck-a3.log` exits 0.
- [x] 3. Rewrite the List Markdown decoder as the Design's Markdown bullet says. Proof: step 1's Markdown and streaming cases pass, and `bun test ./packages/platejs/src/markdown` and `./packages/platejs/src/features/list` pass. Done 2026-10-13: `build-focused-a2.log`, 917 pass across the list, indent, html, markdown, docx and media specs.
- [x] 4. Apply the prototype's HTML changes, which are the Design's HTML bullet: List's `prepareDocument` first pass, its trimmed second pass and `assignHtmlListIds` in `BaseListPlugin.ts`, Indent's `prepareDocument` and shared margin read in `BaseIndentPlugin.ts`, and the inline test in `htmlDom.ts`. `BaseListPlugin.ts` holds another session's uncommitted edits, copied to `BaseListPlugin.other-session-copy.ts` in the run directory, so this run's hunks apply onto it and are measured against that copy. Proof: step 1's HTML cases pass, and `bun test ./packages/platejs/src/html ./packages/platejs/src/lib/plugins/html ./packages/platejs/src/docx ./packages/platejs/src/features/indent` passes. Done 2026-10-13: same log as step 3.
- [x] 5. Run `plate-docs` on the "HTML and Markdown" section of `content/docs/(plugins)/(styles)/list.mdx` and its Chinese twin `list.cn.mdx`: say that an item's later blocks import as blocks one level deeper and that a property the editor cannot place is dropped with a warning. Proof: `pnpm --filter www build:registry`, then `pnpm --filter www build:registry --check`, logged. Done 2026-10-13: `build-registry-a1.log`, both commands exit 0.
- [x] 6. Update the `PluginFormatSchemaView` signature in `apps/www/src/generated/api-reference-manifest.json`, which holds other sessions' staged work: copy it to the run directory, regenerate in a `proof-worktree.mjs --install` worktree with this task's source files, and apply only that entry. Proof: a JSON compare of that entry between the regenerated manifest and the checkout's, logged. Done 2026-10-13: `manifest-apply-a1.log`; the checkout manifest differs from its copy by that one signature line.
- [x] 7. Run `best-api repair` for the added read. Proof: its verdict, logged as a decision row. Done 2026-10-13: the decision row "best-api repair"; the Vision owner, `docs/vision/plate.md`, gained the producer-check sentence in its loss-law bullet.
- [x] 8. Add `.changeset/list-item-blocks.md` for `platejs`, naming the HTML split with its kept formatting and margin depth, the custom elements read as inline, the Markdown warnings, the first block's type and its paragraph fallback with the refusal under `reject`, the image and list-opening shapes and the added `PluginFormatSchemaView.property`. Proof: the file read back. Done 2026-10-13: `.changeset/list-item-blocks.md`, a `patch`, as the changeset rule requires for `platejs`. Deviation, diff round 2: the changeset names the dropped-style warning instead of kept formatting.
- [x] 9. Update the decision page (`2e865a0bc4:docs/research/decisions/conversion-boundary.md`) with this verdict and what landed. Proof: `node tooling/scripts/review-ledger.mjs check` passes. Done 2026-10-13: the audit paragraph names the reported style loss and the two open limits. The check stays red for seven other plans, and none of its lines names this plan or the page (`artifacts/2026-10-12-conversion-boundary-review/review-ledger-check-a1.log`), so the step closes on that narrower proof, the Defaults word "wait for ledger".

## Proof

Step 1's base control proves each new test fails for its defect at `6fa1169c5e`, and steps 3 and 4 make them pass in this checkout. The prototype probes already ran both formats across 25 shapes, then the plan review's 30 shapes, with default and kit targets and both loss policies, against a HEAD worktree (`prototype-cases-base-a2.log`, `prototype-cases-cand-a2.log`, `panel-r1-all-base-a1.log`, `panel-r1-all-cand-a2.log`). The premise that a property-loss warning survives `lossPolicy: 'reject'` and streams like a fresh parse ran on the Link decoder (`premise-probe-a1.log`). The final gates rerun the whole `platejs` suite on the final bytes, attribute each failure against `HEAD` in a detached worktree, and rerun the timing comparison when the host is quiet.

## Completion Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| `pstack:blast-radius` on the public type change before code moves | yes | `artifacts/2026-10-12-conversion-boundary-review/blast-radius.md`, with `custom-tag-base-a1.log` and `custom-tag-cand-a1.log` |
| `pstack:thermo-nuclear-code-quality-review` per slice | no | skip: the `api-build` panel is owed on this diff, and every seat applies a code-quality lens |
| `pnpm check` steps the edits reach, typecheck and entrypoints, before the timing run | yes | `artifacts/2026-10-12-conversion-boundary-review/accept-final-a2.log`: on HEAD plus this task's patch the turbo config is current and the `platejs` typecheck passes 88 of 88 tasks; `artifacts/2026-10-12-conversion-boundary-review/entrypoint-imports-check-a1.log`: the import check that `entrypoint:turbo:check` runs after the turbo check passes on the checkout; `artifacts/2026-10-12-conversion-boundary-review/check-barrels-a1.log` passes; in the checkout `artifacts/2026-10-12-conversion-boundary-review/check-entrypoint-graph-a1.log` named `platejs` stale, which this task's spec imports caused and `pnpm entrypoint:turbo:generate` fixed, and other sessions' `plitejs` and `test` configs stay stale |
| `oxlint --type-aware` on the task's lintable files before the panel freeze | yes | `artifacts/2026-10-12-conversion-boundary-review/oxlint-a6.log` before the round-3 freeze and `artifacts/2026-10-12-conversion-boundary-review/oxlint-a7.log` after its fixes, 0 findings on 4 files each |
| Slice freeze with `freeze.mjs` before the panel | yes | `artifacts/2026-10-12-conversion-boundary-review/freeze.txt`, `artifacts/2026-10-12-conversion-boundary-review/freeze2.txt` and `artifacts/2026-10-12-conversion-boundary-review/freeze3.txt`: `bb076075`, `ca83d026` and `57325a4c` |
| `plate-docs` on `list.mdx` and `list.cn.mdx`, with its example coverage audit | yes | step 5; after the final prose, `artifacts/2026-10-12-conversion-boundary-review/build-registry-a2.log` and `artifacts/2026-10-12-conversion-boundary-review/build-registry-check-a1.log` exit 0 |
| `check-plate-feature.mjs` | no | skip: not a `plate-plugins` feature delivery plan |
| Writing passes: `deslop`, then `no-comments`, then `unslop` on docs and the changeset | yes | the decision log's `writing` rows for the build and each diff round's fixes |
| `api-build` panel on the diff | yes | three rounds, the cap, with an Opus, an Astra and a Sol seat each; the log's `panel` rows settle every finding, and one critical finding stays open in Open work |
| Whole `platejs` suite on the final bytes, failures attributed at `HEAD` | yes | `artifacts/2026-10-12-conversion-boundary-review/accept-final-a2.log`: 133 of 133 test tasks pass on HEAD plus this task's patch, so no failure needs attributing; on the checkout with every session's uncommitted work, 133 of 133 pass too (`artifacts/2026-10-12-conversion-boundary-review/platejs-suite-checkout-close-a2.log`) |
| `pnpm exec tsc -p packages/platejs/tsconfig.test.json --noEmit` errors in this task's files compared with `HEAD` | yes | `artifacts/2026-10-12-conversion-boundary-review/tsc-task-head.norm.txt` and `artifacts/2026-10-12-conversion-boundary-review/tsc-task-checkout.norm.txt` list the same 11 errors |
| Timing: `bench-run.mjs` on the final tree with load under 0.75 per core, or the gate moves to Open work with its stop | yes | moved to Open work: no clean run on this host (`artifacts/2026-10-12-conversion-boundary-review/bench-final-a1.log`, `artifacts/2026-10-12-conversion-boundary-review/bench-final-a2.log`); the planted control fails as it should, and the A/A control keeps every ratio inside its line but exits 2 on two spreads (`artifacts/2026-10-12-conversion-boundary-review/bench-planted-a1.log`, `artifacts/2026-10-12-conversion-boundary-review/bench-aa-final-a1.log`), and a focused warm probe with no planted control of its own keeps the three lines that missed twice inside the frozen line (`artifacts/2026-10-12-conversion-boundary-review/micro-a2.log`) |
| `pnpm lint:task` on this task's files, last | yes | `artifacts/2026-10-12-conversion-boundary-review/lint-task-a1.log`, 0 findings on 8 files; it reflowed one line |
| Fold into the subject, render `--folded`, `review-ledger.mjs check`, publish | yes | folded into `topics/conversion-boundary.md` by `artifacts/2026-10-12-conversion-boundary-review/fold.mjs`; `plan-page.mjs --folded` renders; the `list` scope gains `listHtml.internal.ts` as a member, so coverage lists no unowned file; `artifacts/2026-10-12-conversion-boundary-review/review-ledger-check-a4.log` refuses seven other plans and names nothing from this one; published to the subject's `Page:` link |

## Close

Reversals and deviations come first. The diff review changed two approved steps. Step 1's bold-item case and its image-in-paragraph case, and step 8's changeset, now describe a style warning and an image that stays where HTML import puts it. Round 1 had already replaced the style copy and the image split once each, so after round 2 the build removed both instead of replacing them again (round 2's critical rows and its deviation row). `AUDIO` joined the inline tags as a round-2 warning fix and left them in round 3, after it split one numbered item into two. The Defaults words "copy styles", "plan image moves", "unwrap data wrappers" and "audio inline" reopen each one.

What landed, all in `platejs`:

- HTML import and paste keep each later block of a list item, such as a second paragraph, a code block or an image directly in the item, as its own block one level under the item, in source order with nested lists. An item's level comes from `data-indent`, `aria-level`, its margin through Indent, or its DOM depth.
- A `div`, `section` or custom element without `data-` attributes around an item's blocks unwraps. A style that the `li` or such a wrapper sets no longer reaches the blocks that move out, and the parse warns once per parse with `html-unsupported-content`.
- Custom and namespaced tags, `ruby`, `rt`, `rp`, `datalist`, `noscript` and `slot` read as inline in every HTML parse.
- The List Markdown decoder checks each list property with `schema.property` and reports one it drops as a warning under every loss policy. The first block keeps its type when the list can hold it. A text block it cannot hold becomes the item's paragraph with a `replaced` report, and any other block leaves the list with an `unwrapped` report, both of which `reject` refuses. Later blocks become continuations, and an item that opens with a list gets an empty first block.
- `PluginFormatSchemaView` gains `property`, the editor schema's existing read.
- The list docs and their Chinese twin, the changeset, the loss-law sentence in `docs/vision/plate.md`, the API reference manifest entry, the decision page and the regenerated `packages/platejs/turbo.json`.

Proof and its limits, from the decision log's `scope:` cells:

- Step 1's 15 new cases fail at `6fa1169c5e` for their defects (`base-control-a1-a1.log`).
- Each panel fix's test fails when that fix alone is reverted, 11 mutations after round 1, 7 after round 2 and 2 after round 3 (`mutate-r1-run-a2.log`, `mutate-r2-run-a1.log`, `mutate-r3-run-a1.log`). Round 2's two removals give HEAD's nodes in their probe (`diff-r2-fixed-a2.log`).
- On HEAD plus only this task's patch, the turbo config is current, the `platejs` typecheck passes 88 of 88 tasks and its tests pass 133 of 133 (`accept-final-a2.log`). On the checkout with every session's uncommitted work, the tests pass 133 of 133 (`platejs-suite-checkout-close-a2.log`), and the import check that `entrypoint:turbo:check` runs after the turbo check passes (`entrypoint-imports-check-a1.log`).
- The task files hold the same 11 test-config type errors as HEAD (`tsc-task-head.norm.txt`, `tsc-task-checkout.norm.txt`).
- Markdown asks the schema three times per item and once per later block, never for a reused streaming block, and HTML visits each item child once (`work-count-a1.log`). Four schema reads cost 0.79 percent of parsing one item (`property-cost-a1.log`).
- Timing never got a clean `bench-run.mjs` pass on this shared host. One run missed seven lines while candidate packets swung up to 48 percent, and the rerun was loaded. At low load the A/A control kept every ratio inside its line but exited 2, because two cohorts spread more than 15 percent. A focused warm probe, which has no planted control of its own, put the three lines that missed twice at 0.935, 1.011 and 1.088 of base, inside the frozen line. The 9 percent on a 30-chunk stream comes from re-decoding the growing list on each chunk (inferred, not profiled). The gate is in Open work.
- No native browser paste ran; the paste path ran as `html.parseSlice` under happy-dom. A newline that an item's `white-space` kept collapses with only a warning, which `reject` accepts, and a line break alone between an item's blocks drops with no warning (`trail-br-a2.log`). Both critical findings are open. The ledger check stays red for seven other plans.

The predicted benefit in Evidence held in part. Each block directly in an item keeps its own block one level deeper, and Markdown no longer fails the parse; it warns once for each kind of property it cannot place. HTML now warns when an item style no longer reaches a moved block, a diagnostic HEAD never gave. The claim that both formats return the same nodes whenever the editor can hold the item failed for an image inside the item's paragraph, a code block in GitHub's `data-` wrapper, a `<video>` in the item's text, a `white-space` that kept newlines and a line break between blocks, each in Open work.

Of the 23 items, the 9 steps and 14 Completion Gates, 19 are done, 1 is partial (step 9, accepted on a narrower proof), 2 are skipped (the code-quality review and the feature check), 0 are blocked and 1 is open (the timing gate, in Open work).

Review inputs at close, checked with `git diff --numstat 6fa1169c5e` on each and against the task-only commit `e3c55f26`:

- Changed by this run: `packages/platejs/src/features/list/lib/BaseListPlugin.ts`, `packages/platejs/src/features/list/lib/BaseListPlugin.spec.tsx`, `packages/platejs/src/lib/plugins/html/htmlDom.ts`, `packages/platejs/src/lib/plugin/PluginFormatContext.ts`, `packages/platejs/src/internal/plugin/pluginFormatOperation.ts`, `content/docs/(plugins)/(styles)/list.mdx` and `2e865a0bc4:docs/research/decisions/conversion-boundary.md`. `packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts` also holds the fractional-margin session's rounding, and `docs/vision/plate.md` holds this run's four lines beside another session's edits.
- Changed only by other sessions: `packages/platejs/src/markdown/lib/types.ts`, `packages/platejs/src/markdown/lib/internal/markdownMappings.ts`, `packages/plitejs/src/interfaces/editor.ts` and `content/docs/(plugins)/(serializing)/html.mdx`.
- Unchanged: `VISION.md`, `docs/vision/common.md`, `docs/research/review-records/2026-10-04-conversion-boundary-audit-2.json`, `packages/platejs/src/lib/plugin/MarkdownNodeMapping.ts`, `packages/plitejs/src/interfaces/schema.ts`, `apps/www/src/registry/components/editor/list.tsx`, `apps/www/src/registry/components/editor/indent.tsx` and `docs/plans/2026-10-03-markdown-table-cell-blocks.md`.

In review, `architect` ran three runners and an Opus cross-judge, the plan panel ran one round, and the diff panel ran three rounds, the cap, each with an Opus, an Astra and a Sol seat. The plan round confirmed five critical defects. Diff round 1 confirmed six, applied four and dismissed two with traces and mutations. The decision-trail review reopened one of those two, the dropped line break, and limited the other, the parent-scoped Indent target, to the shipped target and targets set through `targetPlugins`. Round 2 confirmed eight in three mechanisms and applied all of them. Round 3 confirmed two, applied one and left one open with its patch.

Attention, reviewed by gpt-6.1-sol @xhigh. The reviewer raised 8 flags, listed here in its order with how the lead settled each.

- Round 1 dismissed the dropped line break because the break carries no text, but the HTML runtime keeps the same break between two top-level blocks as an empty paragraph, under `parse`, `parseSlice` and both loss policies (`trail-br-a2.log`). It is now an open critical finding in Open work with its patch, and its Defaults row now says look.
- The lead blamed the early test failure on another session without a run on the combined checkout. The whole `platejs` suite now passes 133 of 133 there (`platejs-suite-checkout-close-a2.log`).
- No run reached `migrate-platejs-entrypoint-imports.mjs`, which `entrypoint:turbo:check` runs after the turbo check. It now passes on the checkout (`entrypoint-imports-check-a1.log`).
- The predicted benefit promised parity that the open image, wrapper and whitespace cases contradict, and the Close never marked it. The paragraph above now marks it.
- The copy-before-edit slips for `docs/vision/plate.md` and `packages/test/turbo.json` have no independent pre-edit snapshot. The first copy comes from removing this run's four lines, and the other session's staged edit to the second is intact in the index. No loss is visible, and nothing more can rule one out.
- The lead dismissed one flag. The edits in `wt-bench-cand` at transcript lines 1949 to 2016 were the Benchmark skill's pre-acceptance prototype, which its step 3 builds in a `proof-worktree.mjs` copy, and the lead wrote the shipped code in this checkout.
- The Close said the A/A control passed, while its row logs exit 2 for two spreads. The timing bullet and gate now say so, and timing stays in Open work.
- The parent-scoped Indent target dismissal traced only the shipped target and targets set through `targetPlugins`. A plugin an app writes with its own parent-scoped `indent` target was not traced, and there the Markdown decoder would drop an indent that fits. The Review paragraph limits the dismissal.

Open work is the next section, each item with owner zbeyens and its stop, and the subject's Open work now holds it. The owner commits this task together with the fractional-margin session's `indentLevel.internal.ts`, which `listHtml.internal.ts` imports.

## Open work

- Timing: no `bench-run.mjs` run passed cleanly on the final tree. The first run missed seven lines while candidate packets swung up to 48 percent, and the rerun was loaded. A focused warm probe put HTML with 10 single-paragraph items at 0.935 of base, Markdown continuation items at 1.011 and a 300-item list streamed in 30 chunks at 1.088, inside the frozen line (`artifacts/2026-10-12-conversion-boundary-review/micro-a2.log`). owner: zbeyens. stop: a `bench-run.mjs` pass on the final tree with every packet under 0.75 load per core. Tracked in the subject's Open work.
- Open critical finding from diff review round 3 (astra, sol): a newline or run of spaces that an item's or a wrapper's `white-space` kept collapses when List moves its block out, and the parse reports it only as a `kind: 'style'` warning, so `lossPolicy: 'reject'` accepts changed text (`diff-r2-fixed-a2.log`, case A2a). patch: report a whitespace-preserving `white-space` that moved content loses as a content loss that follows the loss policy, or carry `white-space` onto the moved block in a new plan iteration. proof: none. owner: zbeyens. stop: a new plan iteration started with "plan whitespace carry". Tracked in the subject's Open work.
- Open critical finding from diff review round 1 (astra, sol), reopened by the decision-trail review: a line break alone between or after an item's blocks drops with no diagnostic, so `<ul><li><p>a</p><br><p>b</p></li></ul>` gives "a" and then "b" with no empty line under `parse`, `parseSlice` and both loss policies. Outside a list, the HTML runtime keeps the same break between two blocks as an empty paragraph (`trail-br-a2.log`). patch: keep each break-only run between an item's blocks as an empty paragraph one level under the item. proof: none. owner: zbeyens. stop: the owner's "keep empty blocks". Tracked in the subject's Open work.
- GitHub wraps each code block in `<div class="highlight" data-snippet-clipboard-copy-content>`, and the `data-` guard keeps that wrapper, so a code block in a pasted GitHub list item lands unindented, as at HEAD, with a warning about the `data-indent` List wrote on the `div` (`diff-r3-fixed-a1.log`, case O2). Guarding only on the attributes the runtime reports, `PLATE_HTML_ATTRIBUTES`, would unwrap it. owner: zbeyens. stop: a new plan iteration started with "unwrap data wrappers". Tracked in the subject's Open work.
- An image inside a list item's paragraph lands after the item's text and outside the list, and the text after it becomes another item, as at HEAD, while Markdown keeps both under the item (`diff-r2-fixed-a2.log`, case A3). owner: zbeyens. stop: a new plan iteration started with "plan image moves". Tracked in the subject's Open work.
- Formatting that a list item or a wrapper sets is reported, not kept, on the blocks List moves out. The report names styles no mapping reads, such as `width`, and leaves out a `margin-left` on a wrapper. The item's own paragraph loses its formatting silently, as at HEAD, which could keep it as the item's block when it holds only text. The HTML runtime keeps one List loss per parse, so a second item's italic goes unreported after a first item's bold (`sicko-r2-checkout-a1.log`). Keeping the formatting or reporting exactly the styles mappings read needs the HTML runtime to say which styles its mappings read and to keep distinct prepare losses. owner: zbeyens. stop: the next `html` scope review. Tracked in the subject's Open work.
- A `div` or `section` with a `data-` attribute around several blocks of a list item drops the item's list properties without a diagnostic, as at HEAD (`sicko-r2-base-a1.log`, `sicko-r2-checkout-a1.log`). The comment review saw the same for a heading that holds an image; that case was not rerun at HEAD. The runtime puts an item's properties on its single block only when that block decodes to one node. owner: zbeyens. stop: the next `conversion-boundary` review. Tracked in the subject's Open work.
- A `<video>` in an item's text splits the item around it, unindented, as at HEAD (`diff-r2-media-base-a1.log`), and an `<audio>` that no plugin maps splits the item's line while the parse reports it (`diff-r2-media-fixed-a1.log`). List could count each media element the editor maps as an item block, as it counts images, and `AUDIO` could then rejoin the inline tags. The Markdown text-block test in `BaseListPlugin.ts` repeats `HtmlPlugin`'s and already differs from it on inline descendants. A first item whose block leaves the Markdown list takes the list's `listStart` with it, in both formats. owner: zbeyens. stop: the next `conversion-boundary` review. Tracked in the subject's Open work.
- An app mapping that claims a `div`, `section` or custom element without `data-` attributes holding blocks loses it inside a list item, because List unwraps it first and the prepare context cannot ask which mapping claims an element. owner: zbeyens. stop: a report of such a mapping. Tracked in the subject's Open work.
- This task's `listHtml.internal.ts` imports `toIndentLevel` from `indentLevel.internal.ts`, which the uncommitted fractional-margin change added, and that change also rewrote this task's level read; the two land in one commit or the build breaks. owner: zbeyens. stop: the commit that lands this task. Tracked in the subject's Open work.
- HTML in an editor whose List plugin cannot target a heading or code block turns a heading-only or code-only item into a list paragraph without a warning, as at HEAD, while Markdown now warns. A quote that opens an HTML item flattens into the item's text, and an image-only item in an editor whose list cannot hold images loses its list, both silently and as at HEAD, while Markdown reports both. owner: zbeyens. stop: the next `conversion-boundary` review. Tracked in the subject's Open work.
- Indent's `priority: 60` orders its `prepareDocument` before List's and also raises its decode precedence, because the HTML runtime orders `prepareDocument` only by mapping priority. No other mapping claims `margin-left`, `aria-level` or `data-indent` today. owner: zbeyens. stop: the next `html` scope review. Tracked in the subject's Open work.
- A margin that is not a whole number of indent offsets, such as `36px` with the default `24px`, makes Indent's HTML decode throw at HEAD (`fraction-margin-base-a1.log`). The spawned fractional-margin session's uncommitted change rounds it to the nearest level, so the checkout reads `36px` as level 2 and the item's next block as 3 (`fraction-margin-checkout-a2.log`). owner: zbeyens. stop: that change is committed. Tracked in the subject's Open work.
- Indent's `prepareDocument` makes the HTML runtime run its sanitize walk a second time on every parse in an editor that has Indent and no List. owner: zbeyens. stop: the next `html` scope review. Tracked in the subject's Open work.
- Word HTML cleanup keeps its own block test in `cleanWordHtml.internal.ts`, which still reads custom and namespaced tags, such as `<o:p>`, as blocks. owner: zbeyens. stop: the next `documents` scope review. Tracked in the subject's Open work.
- The HTML runtime's `html-unsupported-content` warning carries no `impact`, which the loss law requires of every diagnostic; it predates this change, and the clipboard path fills it in (`html-impact-a1.log`). owner: zbeyens. stop: the next `html` scope review. Tracked in the subject's Open work.
- Markdown parse reports a lost list property as `markdown-unsupported-node` with the key only in its message, while List's serializer reports the same loss as `markdown-property-omitted` with a `key`. owner: zbeyens. stop: the next `markdown` scope review. Tracked in the subject's Open work.
- `BaseListPlugin.ts` holds list transforms, reads and both format mappings in about 1,650 lines; the HTML preparation helpers moved to `listHtml.internal.ts`, and the mappings could follow. owner: zbeyens. stop: the next `plate-next` review of the list package. Tracked in the subject's Open work.
- No native browser paste ran for this change; the paste path ran as `html.parseSlice` under happy-dom. owner: zbeyens. stop: the next run of `apps/www/tests/browser/clipboard.spec.ts`. Tracked in the subject's Open work.

## Evidence

Model: Claude Opus 5.5 (`claude-opus-5-5`), xhigh effort.

This review supersedes `2026-10-04-conversion-boundary-audit-2`. Its direction holds on current source. The adopted laws stand, and the open gap is HTML list import. This page replaces its evidence with runtime probes, corrects its claim that Markdown already gives the target shape, and adds the Markdown failures that the claim hid. It also keeps that record's reopening of `2026-09-29-static-document-rendering-execution`, whose completed outcome does not adopt this gap. It retains the three landed plans, [conversion-boundary adoption](2026-09-28-conversion-boundary-adoption.md), [static document rendering](2026-09-29-static-document-rendering.md) and [static preview document](2026-09-29-static-preview-document.md), because live source still holds `parseSlice({ previous })`, Plite `createEditorView` (`packages/plitejs/src/editor-runtime-view.ts` line 1427), `html-unsupported-content` accounting and `render.readsDocument` (`packages/platejs/src/features/toc/lib/BaseTocPlugin.ts` line 28). The law files moved since that review. The newer [plate.md](../vision/plate.md) lines 740 to 749 add that a lost property warns under every policy and that dropped nodes and text follow the loss policy, which both defects break, so the review's questions stand and sharpen. The decision page (`2e865a0bc4:docs/research/decisions/conversion-boundary.md`) states the 2026-10-04 Pursue and stays true until the build lands.

### Requirements

- Input a mapping cannot represent is a diagnosed refusal under the loss policy, and programmer and configuration faults throw ([plate.md](../vision/plate.md) lines 730 to 739).
- Every parse or import diagnostic declares `impact`; a lost property warns under every policy, and dropped nodes, text, media and captions follow the loss policy ([plate.md](../vision/plate.md) lines 740 to 749).
- Root `ListPlugin` owns list schema, transforms and format mappings, with no parallel persisted list model ([plate.md](../vision/plate.md) lines 1379 to 1381).
- When a matched capability exists, the same source structure maps to the same Plate representation across formats, and losses are judged against matched capabilities (decision page (`2e865a0bc4:docs/research/decisions/conversion-boundary.md`) line 115).
- Shared conversion laws keep one private owner each, and syntax stays with each format owner; streaming Markdown keeps `parseSlice({ previous })` equal to a fresh parse of every prefix (same page, Initial review and design).
- The user asked to build on the uncommitted exports build and other sessions' work and never revert it, to work in this checkout, and never to commit or push `next`.

### Current source

- The List HTML mapping's `prepareDocument` (`packages/platejs/src/features/list/lib/BaseListPlugin.ts` lines 615 to 737) first moves nested `ul` and `ol` out of each `li`, then replaces every block child of an `li` with its child nodes unless the `li` holds exactly one block that is not a `p`. The pass adds no separator and no diagnostic. That code is unchanged since the head review; the file's later edits touched list identity, not this pass.
- The Paragraph target's `markdown` mapping in the same file (lines 841 to 929) stamps list properties on every block the item's first child builds, forces its type to paragraph unless it is an image, and decodes every later child through `build(child)` with `indent: indent + 1`, dropping any text leaf.
- `BaseIndentPlugin` targets only paragraphs by default (`packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts` line 65), and `BaseListPlugin` targets paragraphs and images (`BaseListPlugin.ts` lines 137 to 140). The registry kits widen both to headings, paragraphs, blockquotes, code blocks, toggles and images (`apps/www/src/registry/components/editor/indent.tsx`, `list.tsx`).
- Indent's HTML decoder reads `data-indent`, `aria-level` or `margin-left` (`BaseIndentPlugin.ts` lines 108 to 147). On a type Indent does not target, the HTML runtime drops a `data-indent` attribute and reports `html-unsupported-content` as a warning, even under `lossPolicy: 'reject'` (`indent-target-probe-a1.log`), while it drops `margin-left` with no diagnostic (`margin-warning-probe-a1.log`).
- Plate's HTML serializer writes an item's later blocks after the list, as `<pre data-indent="2">`, and parses them back to the same nodes (`html-roundtrip-probe-a1.log`). So the target shape already round-trips through Plate's own HTML, and only foreign nesting inside `<li>` loses blocks.
- `html.parseSlice`, the paste path, flattens the same way (`html-roundtrip-probe-a1.log`, `pasteSlice`).
- A Markdown mapping's decode context offers `schema` with `element`, `getProperty` and three other reads (`packages/platejs/src/lib/plugin/PluginFormatContext.ts` lines 22 to 29), and `report` with `kind: 'property'`, which warns under every policy (lines 56 to 66). The editor schema's `property(query)` returns the compiled declaration or `null` (`packages/plitejs/src/interfaces/editor.ts` lines 1463 to 1468). The Markdown runtime fits the decoded document and turns a schema validation error into one `markdown-schema-invalid` error for the whole parse (`packages/platejs/src/markdown/lib/internal/markdownConversion.ts` lines 735 to 754).

The plan's Close marks this predicted benefit held or falsified. HTML import and paste of a list item holding several blocks keep each block as its own block one level deeper, with no joined words and no new diagnostic in an editor that can indent that block. Markdown parse of a list item with a later block, or a first block that is not a paragraph, no longer fails the whole document; it warns once for each kind of property it cannot place in that list. HTML and Markdown then return the same nodes for the same list item whenever the editor can hold it.

### Lanes

- Keeping the current design loses. The probes show HTML joining "a" and "b" into "ab" and turning a code sample into item text with no diagnostic, against the loss law, while Plate holds the structure natively.
- The strongest deletion drops `prepareDocument`'s block unwrap and lets each block decode alone, reporting what the list cannot carry. It loses on its own, because a block left inside the `li` gets no indent and the item's own text is no longer one paragraph. The winning lane still deletes the unwrap; it replaces it with a move.
- Warning about the merge and keeping it loses. It ends the silence but still throws away structure that Plate's own HTML writes and reads.
- Rewriting a foreign `li`'s later blocks into Plate's own list HTML wins. Each block moves after its item with `data-indent` one deeper, in source order with nested lists, inside `prepareDocument`. Indent's decoder and the runtime's existing `html-unsupported-content` warning then handle every case, including a type that cannot carry indent.
- A format-neutral list topology helper shared by HTML and Markdown loses for now. HTML rewrites DOM before decoding and Markdown builds nodes from MDAST, so the shared part is the law, which the List plugin owns in both mappings.
- Routing HTML lists through MDAST or a universal codec is rejected again: HTML and Markdown syntax stay with their owners, and the defect is one preparation pass.
- For Markdown, three owners competed for the lost property: the List decoder asks the schema before it writes, the Markdown runtime filters every decoder's output, or nothing changes. `architect` picked the List decoder, as the Design section says.
- Reopening `parseSlice({ previous })`, the parser engine or static document views loses again. Live source matches the adopted contract, and no evidence contradicts it.

### Dependents

`lookup conversion-boundary` lists eleven dependent scopes. This target changes `BaseListPlugin.ts` and `BaseIndentPlugin.ts`, changes the inline test in `htmlDom.ts`, and adds one member to the exported `PluginFormatSchemaView` type and one field to the object `pluginFormatOperation.ts` builds for it. The only code that builds that view is `pluginFormatOperation.ts`, and adding a member to a read view breaks no reader (`git grep PluginFormatSchemaView`). `HtmlPlugin.ts` reads `isHtmlBlockElement` for whitespace collapsing, mark application and block lifting, so a custom or namespaced tag now stays in its line there too.

- `basic`: unaffected; `MarkdownPlugin.ts`, `markdownMappings.ts` and `convertNodesSerialize.ts` import Markdown owner files whose exports this target does not change.
- `compiler`: unaffected; `compileEditor.ts` compiles formats and no compiled format shape changes.
- `distribution`: unaffected; `core.tsx` re-exports `PluginFormatSchemaView`, which gains a member without changing its export, and `compilePlainTextMappings.ts` and `compilePlateFormats.ts` do not build the view.
- `documents`: unaffected; `importDocx.ts` and `WordPastePlugin.ts` route Word HTML through Word's own list cleanup, which keeps Word's list identity and has its own block test in `cleanWordHtml.internal.ts`. Word's namespaced `<o:p>` now reads as inline in the HTML runtime, and the DOCX specs pass on the prototype.
- `html`: affected only through `htmlDom.ts`; `html/index.ts`, `withStatic.tsx` and `renderStaticHtmlWithOverrides.tsx` serialize or render, which does not change, and the `HtmlPlugin` and `lib/plugins/html` specs pass on the prototype with a new case for a custom element.
- `markdown`: unaffected; same files as `basic`.
- `media`: unaffected; `convertNodesSerialize.ts` serializes, which does not change.
- `persistence`: unaffected; `documentMigrations.ts` does not parse HTML or Markdown.
- `plate-api`: unaffected; `lib/editor/index.ts`, `htmlConversion.ts` and `html/index.ts` keep their signatures.
- `react`: unaffected; `useCreateEditor.ts`, `useStaticEditor.ts` and `withPlate.ts` build editors and parse nothing.
- `table`: unaffected; `WordPastePlugin.ts`, as for `documents`.

### Performance

The change adds repeated work per list item, so Benchmark's pre-acceptance probe ran before the pick. Wall-clock and CPU timing could not decide on this host: other sessions loaded it to 10 to 35 on 18 cores, and base-against-base packets spread 30 to 200 percent (`bench-aa-a4.log`). So the claim uses work counts and a cost ratio. Markdown asks the schema three times per item and once per later block, and never for a block a streaming parse reuses (`work-count-a1.log`). One schema read costs 0.58 µs of CPU against 292 µs to parse one Markdown item with a continuation, so four reads cost 0.79 percent, under the 2 percent line frozen in the probe, and a planted read 25 times slower fails that line (`property-cost-a1.log`, `property-cost-planted-a1.log`). A list with up to 4,000 code continuations the editor cannot indent parses at 175 to 227 µs per block, so the repeated warning is not quadratic in practice, and `reportOnce` now reports each loss once per decode (`report-cost-cand-a1.log`). HTML preparation makes a constant number of passes over each item's children and walks back once per nested list over the blocks before it. The timing comparison reruns on the final tree as a Completion Gate.

### Proof limits

The lead read the source and ran source-mode Bun probes from the repository root or a detached worktree with its test preloads, which register a happy-dom DOM. Their tests and logs are in `artifacts/2026-10-12-conversion-boundary-review/`. No browser paste ran. The editor comparison read ProseMirror, prosemirror-flat-list and BlockNote source without running them; Lexical was not read for this question. A list item holding a paragraph and a table, in an editor without the table plugin, keeps the item's paragraph and flattens the table's cells into paragraphs with one warning about the lost indent (`prototype-cases-cand-a2.log`). The probe did not run that shape with the table plugin. When a moved block cannot take an indent, the HTML warning names `data-indent`, an attribute List wrote, not one from the source. The Markdown property check reads only a block's type, which is exact for the shipped List and Indent targets; a custom Indent target that also checks the block's parent would read as a lost indent (`parent-target-mutant-a1.log`).
