# Conversion laws and incremental Markdown

Page: https://claude.ai/artifact/8HDs5foA7f8oJ1GmvcuA4s

The ledger asks which conversion laws share an owner across formats, and what Markdown reuse contract matches a fresh parse of every partial prefix without redoing the whole response. Three plans landed for it. The [conversion-boundary adoption](../2026-09-28-conversion-boundary-adoption.md) gave Markdown `parseSlice({ previous })`, which reuses converted segments and, for the fixtures its continuation suite runs, equals a fresh parse of every prefix, diagnostics included (`packages/platejs/src/markdown/lib/markdownContinuation.spec.ts:87-113`). Each segment runs the remark pipeline as its own root, so a configured remark plugin that reads or rewrites the whole tree can give a different result ([conversion and export](../../research/sources/plite/conversion-and-export.md)). The [static document rendering](../2026-09-29-static-document-rendering.md) plan gave Plite `createEditorView(editor, { document })` for coherent reads of one immutable document, made HTML encoders claim what they write and report `html-unsupported-content` for the rest, and added `render.readsDocument` for static reuse. The [static preview document](../2026-09-29-static-preview-document.md) plan made the preview reuse unchanged blocks. The [list item blocks review](../2026-10-12-conversion-boundary-review.md) made HTML import keep a list item's later blocks one level under the item, and made the List Markdown decoder report each list property the schema cannot place instead of failing the parse. URL role safety, loss severity and emission claims each keep one private owner, and syntax stays with each format. `node tooling/scripts/review-ledger.mjs show conversion-boundary` prints the reviews.

## Public API

An editor parses a whole HTML document through its installed mappings and gets the document with its diagnostics.

```ts
// content/docs/(plugins)/(serializing)/html.mdx
const result = editor.api.html.parse('<p>Hello <strong>world</strong>.</p>');

if (!result.ok) throw new Error(result.diagnostics[0].message);
```

The Markdown streaming demo parses each growing draft as a slice and hands the previous result back, so complete blocks are not converted again.

```ts
// apps/www/src/registry/examples/markdown-streaming-demo.tsx
const result = target.api.markdown.parseSlice(
  draft,
  final ? { previous } : { lossPolicy: 'allow', partial: true, previous }
);
```

Parsing HTML whose list item holds a paragraph and then a code block keeps both blocks, as Markdown does for the same item.

```ts
// list-blocks-kit probe, named in docs/plans/2026-10-12-conversion-boundary-review.md
const result = editor.api.html.parse(
  '<ol><li><p>Install</p><pre><code>npm i</code></pre></li></ol>'
);
// ok, no diagnostic: numbered paragraph "Install", then code block "npm i" at indent 2
```

Parsing the same item as Markdown, in an editor whose Indent plugin targets only paragraphs, keeps the document and warns about the one lost indent.

```ts
// md-diag probe, named in docs/plans/2026-10-12-conversion-boundary-review.md
const result = editor.api.markdown.parse('1. Install\n\n   ```\n   npm i\n   ```');
// ok: numbered paragraph "Install", then code block "npm i" with no indent, and one
// markdown-unsupported-node warning: List Markdown omitted property "indent" on "codeBlock"
```

A format decoder's `schema` view gains the editor schema's existing `property` read, so a decoder can ask whether a property fits a block type before it writes it.

```ts
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

## Main changes

- `withPlite.ts` (`packages/platejs/src/lib/editor/withPlite.ts`) projects the document each format operation reads, and `pluginFormatOperation.ts` runs format operations against installed mappings.
- `HtmlPlugin.ts` owns HTML parse and serialize, its mapping compiler and the `html-unsupported-content` accounting; `htmlConversion.ts` holds the detached HTML entry points.
- `markdownConversion.ts` owns Markdown parse, `parseSlice` reuse and schema fitting; `reportOmittedProperties.ts` reports properties Markdown cannot write.
- Plite's `editor-schema.ts` admits, fits and validates every converted document.
- Each feature plugin owns its own format mappings. The List plugin's HTML mapping prepares list markup with `prepareDocument` before decoding. It keeps an item's leading text or first block and moves the item's later blocks after it one level deeper, through the helpers in `listHtml.internal.ts`. Its Markdown mapping decodes MDAST lists and checks each list property with the format context's `schema.property` read. Indent's HTML mapping turns a list item's margin into a level in its own `prepareDocument`, which runs first.
- `htmlDom.ts` decides block or inline by tag for every HTML mapping, and reads custom and namespaced tags and ruby markup as inline, as browsers lay them out.

## Document shape

Paste inserts and import stores the nodes that `html.parse` and `html.parseSlice` return for that list item. Markdown parse returns the same nodes for the matching Markdown when the Indent plugin targets code blocks.

```json
[
  { "type": "paragraph", "listType": "numbered", "indent": 1, "children": [{ "text": "Install" }] },
  { "type": "codeBlock", "indent": 2, "children": [{ "text": "npm i" }] }
]
```

A Markdown item whose first block is a heading keeps the heading, and with the registry kit's targets it stays a list item.

```json
[
  { "type": "heading", "level": 1, "listType": "bulleted", "indent": 1, "children": [{ "text": "Title" }] },
  { "type": "paragraph", "indent": 2, "children": [{ "text": "body" }] }
]
```

## Layer and owner

The shared conversion laws:

- **Loss.** Property loss warns under every policy; content loss follows `lossPolicy` in Markdown, HTML and DOCX export. Removing a URL that could run script, while keeping its label, alt text or caption, is lossless.
- **Safety.** One private URL role policy backs the feature validators and every format boundary. Link navigation keeps a script-capable floor with `allowedSchemes` above it. HTML and DOCX run a whole-tree safety pass before any mapping reads the tree, output and retained DOCX bytes are checked, and the v54 migration neutralizes legacy unsafe values instead of rejecting the document.
- **Emission.** An encoder claims what its kept output writes, `preserve` for element encoders and by output for single-value mappings; every other content property reports `html-unsupported-content`, guarded by a 30-fixture round-trip harness.
- **Streaming.** Reuse equals a fresh partial parse of every prefix, diagnostics included. Converted segments are reused at closed-container blank-line boundaries, a source with a link reference or footnote definition parses whole, and completion strictly reparses.
- **Static reads.** `createEditorView(editor, { document })` resolves reads, plugin reads and plugin APIs against one immutable document; a Plite guard refuses source-editor reads made on its behalf. Static rendering reuses a block while it and every earlier block keep identity and its decorations are value-equal; an element that reads later content declares `render.readsDocument`.
- **Paste feedback.** `Editable.onPasteResult` delivers decoder diagnostics once to the initiating view, opt-in; the registry renders no toast.

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| A universal pipeline, public codec or intermediate AST | Format owners keep syntax, representations, resource admission, diagnostic coordinates and artifact lifetimes. |
| Syntax-only streaming checkpoints | Could save at most the ~20% of parsing that is tokenizing; converted-segment reuse took the rich 50 KB parse from 24.6 s to 0.72 s. |
| URL-role metadata on mappings | Existing feature-owned validators carry it, with v54 migration proof. |
| Fidelity inferred from reading or owning a property | Reading suppressed Markdown's omission diagnostic, and HTML assumed preservation from ownership; actual emission decides. |
| Plate's partial static-document facade | Mixed document identities, so a source-derived TOC rendered beside a projected body. |
| A mutable stable view for static reuse | Identity and value-equal decorations stay correct under concurrent and server rendering. |
| Detached public HTML slice helpers | No repository caller; editor slice and standalone document operations remain. |
| A default paste toast | Ordinary paste keeps fitting, fallback and sanitizer correctness; apps opt into diagnostics. |

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| An HTML list item's later blocks become blocks one level deeper | Plate | `platejs` root, `BaseListPlugin`'s HTML mapping | `ListPlugin` owns its format mappings ([plate.md](../../vision/plate.md) line 1379) |
| The Markdown list decoder keeps each block's type and reports each list property the schema cannot place | Plate | `platejs` root, `BaseListPlugin`'s Markdown mapping | A lost property warns under every policy, and only the producer can tell that loss from a decoder bug, which throws ([plate.md](../../vision/plate.md) lines 733 to 749) |
| A format decoder can ask the schema whether a property fits a block type | Plate | `platejs` root, `PluginFormatSchemaView` in `PluginFormatContext.ts`, built in `pluginFormatOperation.ts` | The editor schema already answers `property({ key, placement, type })`; the view passes that read through with its existing type |
| A list item's margin becomes its level before List moves the item's blocks | Plate | `platejs` root, `BaseIndentPlugin`'s HTML mapping | Indent owns turning a margin into a level, with its configured offset and unit |
| A custom or namespaced tag, and ruby markup, reads as inline | Plate | `platejs` root, `htmlDom.ts` | The HTML runtime owns block detection for every mapping |

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Clipboard paste of HTML lists | A pasted item keeps its paragraphs, code blocks and the images between them as separate blocks under it | `html.parseSlice` in the List spec under happy-dom; native browser paste unproven |

## What other editors do

The lead read ProseMirror's `prosemirror-schema-list` at `d5515fe`, `prosemirror-flat-list` at `4f88ff9` and BlockNote at `1e26f1c` on 2026-10-12 for how a list item keeps blocks after its first one; none was run. The 2026-09-28 [prior-art pass](../../research/probes/2026-09-28-conversion-boundary/prior-art/findings.md) covers incremental Markdown parsing.

| Editor | Blocks after an item's first paragraph | Incremental Markdown |
| --- | --- | --- |
| ProseMirror | The item node holds them: `addListNodes` documents list item content as `"paragraph block*"` (`prosemirror/prosemirror-schema-list@d5515fe14169373c3f4ae73d2a82c13b50c6486e:src/schema-list.ts`) | Not part of the core |
| prosemirror-flat-list | One flat `list` node holds `block+`, so later blocks stay in the item (`ocavue/prosemirror-flat-list@4f88ff964d595d1910548b074f65c9431171a9a9:packages/core/src/schema/node-spec.ts`) | Not part of the library |
| BlockNote | Its HTML import lifts nested lists out of the `<li>` and wraps later loose content in new items (`TypeCellOS/BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163:packages/core/src/api/parsers/html/util/nestedLists.ts`) | Not read |
| Lexical | Not read for this question | Not read |
| Lezer Markdown | Not a rich-text editor | Reuses tree fragments whose block context hash matches |
| Streamdown | Not a rich-text editor | Reuses a prefix only when input grows and the boundary is stable |

## Open work

The logs named below are in `docs/plans/artifacts/2026-10-12-conversion-boundary-review/`.

- Static preview still reads decorations over every node on each render, 21 to 58 percent of React time at 50 KB, and authored editors load their whole value per preview; caching and chunking wait under the [proportional-cost plan](../2026-09-30-static-preview-proportional-cost.md)'s revisit trigger. owner: zbeyens. stop: that trigger.
- HTML still leaves table list properties unreported and lets a decoder claim a whole subtree. owner: zbeyens. stop: the next `html` scope review.

- Timing: no `bench-run.mjs` run passed cleanly on the final tree. The first run missed seven lines while candidate packets swung up to 48 percent, and the rerun was loaded. A focused warm probe put HTML with 10 single-paragraph items at 0.935 of base, Markdown continuation items at 1.011 and a 300-item list streamed in 30 chunks at 1.088, inside the frozen line (`micro-a2.log`). owner: zbeyens. stop: a `bench-run.mjs` pass on the final tree with every packet under 0.75 load per core.
- Open critical finding from diff review round 3 (astra, sol): a newline or run of spaces that an item's or a wrapper's `white-space` kept collapses when List moves its block out, and the parse reports it only as a `kind: 'style'` warning, so `lossPolicy: 'reject'` accepts changed text (`diff-r2-fixed-a2.log`, case A2a). patch: report a whitespace-preserving `white-space` that moved content loses as a content loss that follows the loss policy, or carry `white-space` onto the moved block in a new plan iteration. proof: none. owner: zbeyens. stop: a new plan iteration started with "plan whitespace carry".
- Open critical finding from diff review round 1 (astra, sol), reopened by the decision-trail review: a line break alone between or after an item's blocks drops with no diagnostic, so `<ul><li><p>a</p><br><p>b</p></li></ul>` gives "a" and then "b" with no empty line under `parse`, `parseSlice` and both loss policies. Outside a list, the HTML runtime keeps the same break between two blocks as an empty paragraph (`trail-br-a2.log`). patch: keep each break-only run between an item's blocks as an empty paragraph one level under the item. proof: none. owner: zbeyens. stop: the owner's "keep empty blocks".
- GitHub wraps each code block in `<div class="highlight" data-snippet-clipboard-copy-content>`, and the `data-` guard keeps that wrapper, so a code block in a pasted GitHub list item lands unindented, as at HEAD, with a warning about the `data-indent` List wrote on the `div` (`diff-r3-fixed-a1.log`, case O2). Guarding only on the attributes the runtime reports, `PLATE_HTML_ATTRIBUTES`, would unwrap it. owner: zbeyens. stop: a new plan iteration started with "unwrap data wrappers".
- An image inside a list item's paragraph lands after the item's text and outside the list, and the text after it becomes another item, as at HEAD, while Markdown keeps both under the item (`diff-r2-fixed-a2.log`, case A3). owner: zbeyens. stop: a new plan iteration started with "plan image moves".
- Formatting that a list item or a wrapper sets is reported, not kept, on the blocks List moves out. The report names styles no mapping reads, such as `width`, and leaves out a `margin-left` on a wrapper. The item's own paragraph loses its formatting silently, as at HEAD, which could keep it as the item's block when it holds only text. The HTML runtime keeps one List loss per parse, so a second item's italic goes unreported after a first item's bold (`sicko-r2-checkout-a1.log`). Keeping the formatting or reporting exactly the styles mappings read needs the HTML runtime to say which styles its mappings read and to keep distinct prepare losses. owner: zbeyens. stop: the next `html` scope review.
- A `div` or `section` with a `data-` attribute around several blocks of a list item drops the item's list properties without a diagnostic, as at HEAD (`sicko-r2-base-a1.log`, `sicko-r2-checkout-a1.log`). The comment review saw the same for a heading that holds an image; that case was not rerun at HEAD. The runtime puts an item's properties on its single block only when that block decodes to one node. owner: zbeyens. stop: the next `conversion-boundary` review.
- A `<video>` in an item's text splits the item around it, unindented, as at HEAD (`diff-r2-media-base-a1.log`), and an `<audio>` that no plugin maps splits the item's line while the parse reports it (`diff-r2-media-fixed-a1.log`). List could count each media element the editor maps as an item block, as it counts images, and `AUDIO` could then rejoin the inline tags. The Markdown text-block test in `BaseListPlugin.ts` repeats `HtmlPlugin`'s and already differs from it on inline descendants. A first item whose block leaves the Markdown list takes the list's `listStart` with it, in both formats. owner: zbeyens. stop: the next `conversion-boundary` review.
- An app mapping that claims a `div`, `section` or custom element without `data-` attributes holding blocks loses it inside a list item, because List unwraps it first and the prepare context cannot ask which mapping claims an element. owner: zbeyens. stop: a report of such a mapping.
- This task's `listHtml.internal.ts` imports `toIndentLevel` from `indentLevel.internal.ts`, which the uncommitted fractional-margin change added, and that change also rewrote this task's level read; the two land in one commit or the build breaks. owner: zbeyens. stop: the commit that lands this task.
- HTML in an editor whose List plugin cannot target a heading or code block turns a heading-only or code-only item into a list paragraph without a warning, as at HEAD, while Markdown now warns. A quote that opens an HTML item flattens into the item's text, and an image-only item in an editor whose list cannot hold images loses its list, both silently and as at HEAD, while Markdown reports both. owner: zbeyens. stop: the next `conversion-boundary` review.
- Indent's `priority: 60` orders its `prepareDocument` before List's and also raises its decode precedence, because the HTML runtime orders `prepareDocument` only by mapping priority. No other mapping claims `margin-left`, `aria-level` or `data-indent` today. owner: zbeyens. stop: the next `html` scope review.
- A margin that is not a whole number of indent offsets, such as `36px` with the default `24px`, makes Indent's HTML decode throw at HEAD (`fraction-margin-base-a1.log`). The spawned fractional-margin session's uncommitted change rounds it to the nearest level, so the checkout reads `36px` as level 2 and the item's next block as 3 (`fraction-margin-checkout-a2.log`). owner: zbeyens. stop: that change is committed.
- Indent's `prepareDocument` makes the HTML runtime run its sanitize walk a second time on every parse in an editor that has Indent and no List. owner: zbeyens. stop: the next `html` scope review.
- Word HTML cleanup keeps its own block test in `cleanWordHtml.internal.ts`, which still reads custom and namespaced tags, such as `<o:p>`, as blocks. owner: zbeyens. stop: the next `documents` scope review.
- The HTML runtime's `html-unsupported-content` warning carries no `impact`, which the loss law requires of every diagnostic; it predates this change, and the clipboard path fills it in (`html-impact-a1.log`). owner: zbeyens. stop: the next `html` scope review.
- Markdown parse reports a lost list property as `markdown-unsupported-node` with the key only in its message, while List's serializer reports the same loss as `markdown-property-omitted` with a `key`. owner: zbeyens. stop: the next `markdown` scope review.
- `BaseListPlugin.ts` holds list transforms, reads and both format mappings in about 1,650 lines; the HTML preparation helpers moved to `listHtml.internal.ts`, and the mappings could follow. owner: zbeyens. stop: the next `plate-next` review of the list package.
- No native browser paste ran for this change; the paste path ran as `html.parseSlice` under happy-dom. owner: zbeyens. stop: the next run of `apps/www/tests/browser/clipboard.spec.ts`.