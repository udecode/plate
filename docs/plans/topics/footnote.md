# Footnotes

Page: https://claude.ai/artifact/HhVwJDypZYmJwzLH5EhVKQ

A footnote is two nodes that share a stored `ref`: an inline void `footnoteReference` in the text and a root-level `footnoteDefinition` block that holds the note. `platejs/footnote` ships `BaseFootnotePlugin` and `BaseFootnoteDefinitionPlugin`. The reference plugin owns the reads, built once per document revision, ref allocation, insertion, duplicate renumbering, the two selection moves and `read.anchor`, which gives each footnote element its fragment id and the id it links to. Each plugin has an HTML mapping that writes GitHub-style links tagged with Plate's own attributes and reads GitHub's rendered footnotes back. The definition declares `slice: { endMatter: true }`, so Plite lands every pasted note after the document's last block, and its transfer veto keeps a moved or dropped definition at the root. `platejs/footnote/react` adds `focusDefinition` and `focusReference`. In an editable view they select, focus, scroll and flash the target. In a read-only view they scroll and flash it and leave the caret alone. The copied `footnote` registry item adds the reference chip with a hover preview, the definition's back link, the duplicate warning, the `[^` picker and the read-only click and keyboard jumps. `footnote-static` links each mark to its note and each note to its first mark, and Word export draws notes as plain text. Markdown round-trips through `remark-gfm`. The ledger asks how references and content keep their identity and navigation. The 2026-10-17 review said Pursue, and its plan built it. `node tooling/scripts/review-ledger.mjs show footnote` prints the history.

## Public API

Insert a reference at the caret. It creates the matching definition at the end of the document; `focusDefinition: false` keeps the caret in the text.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.update((tx) => tx.footnote.insert({ focusDefinition: false }));
```

Create the missing definition of an unresolved reference.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.update((tx) => tx.footnote.createDefinition({ ref: '3' }));
```

Jump between a reference and its definition from the mounted view `useEditor()` returns.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.api.footnote.focusDefinition({ ref: '3' });
editor.api.footnote.focusReference({ ref: '3', index: 1 });
```

Renumber a later duplicate definition.

```tsx
// content/docs/(plugins)/(elements)/footnote.mdx
editor.update((tx) =>
  tx.footnote.normalizeDuplicateDefinition({
    path: duplicatePath,
  })
);
```

The copied definition renderer asks the reads whether a definition is a later duplicate and lists its references.

```tsx
// apps/www/src/registry/components/editor/footnote.tsx
const isDuplicateDefinition =
  !!path && !!footnoteApi.isDuplicateDefinition?.({ path });
const referenceItems =
  !isDuplicateDefinition && ref
    ? footnoteApi.references({ ref }).map((entry, index) => ({
        index,
        label: getReferenceContextLabel(editor, entry[1], index),
      }))
    : [];
```

In a read-only view the jump scrolls to the target, flashes it and returns `true`, and the caret stays.

```tsx
// packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx
rendered.rerender(tree(true));
const before = views[1].read.selection();
act(() => {
  expect(api.focusDefinition({ ref: '1' })).toBe(true);
});
expect(views[1].read.selection()).toEqual(before);
```

The copied static item asks each footnote element for its fragment id and the id it links to.

```tsx
// apps/www/src/registry/components/editor/footnote-static.tsx
const anchor = props.editor
  .plugin(BaseFootnotePlugin)
  .read.anchor({ path: props.path });
// the second citation of "1": { id: 'fnref-1:2', target: 'fn-1' }
// the definition of "1": { id: 'fn-1', target: 'fnref-1' }
// a later duplicate of "1": { id: 'fn-1:2' }
```

Exporting a document with footnotes to HTML writes GitHub-style links tagged with Plate's own attributes, and marks the note's back link as presentation, so pasting the HTML back drops it.

```ts
// content/docs/(plugins)/(serializing)/html.mdx
const result = serializeHtml(document, {
  plugins: EditorKit,
  projection: 'accepted',
});
// { ok: true }:
// <sup><a data-editor-footnote-ref="1" href="#fn-1" id="fnref-1">1</a></sup>
// <div data-editor-footnote-definition="1" id="fn-1"><p>Source text</p>
//   <a data-editor-footnote-chrome="" href="#fnref-1">↩</a></div>
```

Pasting GitHub's rendered footnotes gives footnotes.

```ts
// content/docs/(plugins)/(serializing)/html.mdx
const result = editor.api.html.parse(githubReadmeHtml);
// a footnoteReference with ref "1" and a root footnoteDefinition with ref "1"
```

On static pages the mark links to its note, and the note links back to its first mark.

```tsx
// apps/www/src/registry/components/editor/footnote-static.tsx
{props.children}
<a
  data-editor-footnote-ref={element.ref}
  href={anchor?.target ? `#${anchor.target}` : undefined}
  id={anchor?.id}
>
  [{element.ref ?? ''}]
</a>
```

The definition declares itself end matter, so every note in a paste lands after the document's last block, before any empty paragraphs that end it.

```ts
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts
schema: ({ plugins }) => ({
  element: {
    slice: { endMatter: true },
    content: plugins.blockContent({
      default: BaseParagraphPlugin,
      min: 1,
    }),
```

A copy of words inside a note gives the words, not the note. A copy that covers a note whole keeps it.

```ts
// packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts
slice = editor.read.slice.export({ at: range })
// "efin" selected inside note 1:
// { content: [paragraph "efin"], openStart: 1, openEnd: 1 }
```

## Main changes

- One registry per document revision answers every read. `read` memoizes the definitions and references by ref against `state.children()`, so a render that asks many questions walks the document once.
- The first definition of a ref is canonical. Later duplicates stay in the document, are flagged by `isDuplicateDefinition` and renumber only on `normalizeDuplicateDefinition`, so pasted content never loses a note.
- A `transferVeto` contribution keeps a definition at the root during a move or drop: one that would land a definition inside another block, or inside a side wrap, is refused. A paste never reaches that veto, and Plite's end-matter landing puts its notes at the root end instead.
- `insert`, `createDefinition` and `normalizeDuplicateDefinition` declare where they edit through `txLocate`, and `selectDefinition` and `selectReference` through `txSelection`, so a selection move never changes content.
- The React adapter runs its jumps in the calling view: it commits the selection, focuses, scrolls and then flashes through `NavigationFeedbackPlugin`. Plite refuses any update from a read-only view, so there the adapter reads the target point, scrolls to it and flashes it with no update, and returns `true`.
- One pure function builds a path-keyed id index from a document's children, memoized per children array in a `WeakMap` that holds one index per pair of element types. `read.anchor` calls it with `state.children()` and the HTML encoders with the encode context's `document.children`, so a static page and exported HTML agree on ids and one export indexes the document once. The live editor's copied UI never calls it, so typing does no new work.
- Every id depends only on nodes before it. A citation counts the earlier citations of its ref, and a definition the earlier definitions. A canonical note links back to `fnref-<enc>`, the first citation's id, which no later change can alter. So static reuse, which keeps a block while it and every block before it are unchanged, stays exact without `readsDocument`.
- Plite gains one element slice field, `endMatter`. A copy keeps an end-matter element its selection covers whole and keeps only the children of one it covers in part. Before its length cut, a paste or any other slice write keeps only the children of an end-matter element still open on an edge. After the cut it takes every end-matter element out and writes them, in source order, after the root's last block that is not an empty default block, keeping the selection. They never land above the block that receives the rest or above a block the root's schema requires. Then it writes the rest at the site as today, which places the caret. Drops skip both steps, so a dragged note lands where it is dropped.
- Table's prepared paste takes its selection points from the cells it filled, after the fill, in both of its planners, instead of computing them before the fill. The selection keeps today's shape.
- Each footnote mapping's `prepareDocument` rewrites GitHub's markup and strips Plate's presentation markup in the inert document before decode. The definition mapping runs at priority 70, before Indent (60) and List (50), so GitHub's footnote list items become definitions before List flattens them.
- The DOCX export draws footnotes through its own overrides, the label and the note text with no links, which is what Word shows today.

## What other editors do

Read from source, not run: Milkdown `6a4db480b0`, Lexical `dd5c41b131`, ProseMirror website `a16b4ece45`, CKEditor 5 `14e73cc31b`, Tiptap `91c51be53c`, BlockNote `1e26f1c5e1`, Slate `945a484df2` and micromark `6577c20015` for GitHub's rendered footnote HTML. Only Milkdown and a Lexical example keep a reference and a separate definition linked by a label, as Plate does. No editor read here writes linked footnote HTML on export or reads GitHub's footnote HTML on paste.

| Editor | Model and link key | Jump in an editable view | Jump in a read-only or rendered view | HTML export | HTML paste |
| --- | --- | --- | --- | --- | --- |
| Milkdown | Inline atom and a separate `block+` definition, linked by `label` (`zbeyens/milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2:packages/plugins/preset-gfm/src/node/footnote/definition.ts:10`) | None | None | `<sup data-type="footnote_reference">` and `<dl><dt><dd>`, no `id` or `href` (`reference.ts:33`, `definition.ts:35`) | Only its own markup, not GitHub's (`reference.ts:21`, `definition.ts:22`) |
| Lexical (dev example, not a package) | Inline node and definitions in a root slot, linked by the lowercased label (`dev-examples/mdast-editor/src/extensions/MdastFootnoteExtension.ts:362`, `:452`) | Native `#fn-a` anchors, then a caret move and focus (`:151`, `:203`) | Same path; a browser test expects the jump after `setEditable(false)` (`src/__tests__/browser/MdastEditorChrome.test.ts:449`) | `sup[data-footnote-ref]` and `div[data-footnote-def]`; the live anchors are not exported (`:427`, `:550`) | Only its own markup; GitHub's `data-footnote-ref` sits on a different element (`:908`) |
| ProseMirror (website example) | The note's text lives inside the inline node; no key (`example/footnote/index.js:5`) | Selecting the node opens a nested editor (`:63`) | No separate path | `<footnote>text</footnote>` | Only `<footnote>` |
| CKEditor 5 | The footnote feature's source is not in the open checkout; Word paste normalizes to `sup > a` and `ol > li` with ids (`ckeditor/ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da:packages/ckeditor5-paste-from-office/src/filters/replacemsfootnotes.ts:57`) | Not readable | Not readable | Not readable | Word only, not GitHub |
| Tiptap, BlockNote, Slate | No footnote support found by `git grep -i footnote` | None | None | None | None |
| GitHub (micromark readme) | Rendered GFM: `<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>`, then `section[data-footnotes] > ol > li#user-content-fn-1` with a `data-footnote-backref` link (`readme.md:1084`) | Not an editor | Native anchors | The shape a reader's paste brings | Not an editor |

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Fragment ids for a footnote element at a path | Plate | `platejs/footnote`: `BaseFootnotePlugin` `read.anchor`, from one id index per document's children that the HTML encoders also use | A presentation read on the known path, as `read.list.ordinal(path)` is ([plate.md](../vision/plate.md), static renderer paragraph) |
| Jump in a read-only view | Plate | `platejs/footnote/react`: `FootnotePlugin`, with the target point from the same internal function `selectDefinition` and `selectReference` use | The package keeps the jump's ordering law; Plite's read-only refusal is unchanged |
| Read-only click, keyboard jump, picker focus and focus after a jump | Plate | copied registry item `footnote` (`footnote.tsx`) | Gestures and focus are copied-UI policy ([VISION.md](../../VISION.md), Plate essentials) |
| Static anchors and back links | Plate | copied registry item `footnote` (`footnote-static.tsx`) | A static registry item owns its real presentation source |
| HTML encode, decode and GitHub preparation | Plate | `platejs/footnote`: one `formats.html` mapping per plugin | One plugin keeps its HTML in one mapping ([plate.md](../vision/plate.md), HTML mapping paragraphs) |
| Attribute set | Plate | `platejs`: `PLATE_HTML_ATTRIBUTES` (`HtmlPlugin.ts:1781`) | Every emitted `data-*` name is declared and claimed |
| Footnotes in Word | Plate | `platejs/docx/export`: `DOCX_STATIC_COMPONENTS` (`docxStaticComponents.tsx:176`) | Word bookmarks exist only for headings, so in-page links would dangle |
| Pasted notes at the end | Plite, declared by Plate | `plitejs`: `slice.endMatter` in the element schema, one landing step in `public-state.ts` and the copy read in `get-content-slice.ts`; `platejs/footnote`: `BaseFootnoteDefinitionPlugin` declares it | Where a pasted block lands is schema fitting, which Plite already drives from an element's `slice` policy (`preserveContext`, `schema.ts:384-387`); a footnote names its own policy, as a property names its `landing` ([plite.md](../vision/plite.md), the paste paragraphs); the transfer veto keeps refusing drops into blocks |
| Caret after a prepared table paste | Plate | `platejs/table`: `BaseTablePlugin`'s prepared paste | Table owns its prepared plan, and the caret must come from the cells it filled, not from the plan before the fill |

No entrypoint is added. `footnote` keeps its one dependency, `combobox` (`tooling/entrypoints/entrypoint-dag.mjs:89`). `docx/export` (`entrypoint-dag.mjs:284`) adds `footnote` to its dependencies, because its overrides key on the footnote plugins, as they do for Callout, Code block, Column, Equation, Heading and TOC.

## Hard cuts and app migration

Deleted:

- `editor.read.footnote.duplicateDefinitions`, `editor.read.footnote.hasDuplicateDefinitions` and `editor.read.footnote.duplicateRefs`.

Callers that break, from `git grep` over live source, docs and generated output; the build reruns `pstack:blast-radius` before the cut:

- `packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts:121-127, 245-246, 287-290, 345-346, 694-696, 726, 754, 788`.
- `apps/www/src/registry/components/editor/footnote.slow.tsx`, eleven `hasDuplicateDefinitions` mocks (lines 25 to 803).
- `apps/www/src/lib/search-result-groups.test.ts:31` and `apps/www/src/app/api/search/route.test.ts:57`, which use the names as search fixtures.
- `content/docs/(plugins)/(elements)/footnote.mdx:341-386` and the Plugin surface list in `docs/editor-behavior/markdown-editing-spec.md:3482`.
- Generated: `apps/www/src/generated/api-reference-manifest.json`, `apps/www/public/r/footnote-docs.json`, `apps/www/public/r/registry.json` and `apps/www/public/r/registry-docs.json`.

App code that called a removed read uses its replacement:

```ts
// before
footnote.duplicateDefinitions({ ref });
footnote.hasDuplicateDefinitions({ ref });
footnote.duplicateRefs();

// after
footnote.definitions({ ref }).slice(1);
footnote.definitions({ ref }).length > 1;
footnote.refs().filter((ref) => footnote.definitions({ ref }).length > 1);
```

Changed, not deleted:

- `focusDefinition` and `focusReference` return `true` in a read-only view when they scroll to a target. App code that read `false` as "read-only" asks `editor.read.view.isReadOnly()` instead. Unmounted views and missing targets still return `false`.
- A definition pasted anywhere lands after the document's last block, before any empty paragraphs that end it, and the caret stays after the pasted text. A table pasted into one table cell still selects its text, as today; suggested task `t_c0e884d9`, owned by the owner, decides whether it should leave a caret. A definition already saved inside another block stays there. A dragged note still lands where it is dropped.
- `read.slice.get()` and `read.slice.export()` of words inside a note give the words without the note, so a copy pastes as words in any editor. A selection that covers a note whole, select-all included, copies the note.
- Editors that install `BaseFootnoteDefinitionPlugin` get a new schema fingerprint. A populated Yjs room keeps the identity it was created with (`controller.ts:1366-1372`), and `History.fromJSON` checks it too, so a room or saved history created before this version refuses this version until the app runs the versioned document migration the Yjs docs describe (`content/docs/(plugins)/(collaboration)/yjs.mdx:80`, `content/docs/plite/libraries/plite-yjs.mdx:173-183`). Updating every client does not reopen it.
- Apps that copied `footnote` and `footnote-static` keep the old static drawing and gestures until they copy the new version; the registry changelog entry says what changed.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Click a footnote mark in a read-only view | The note's start scrolls into view and the note flashes; the caret and history stay; focus moves to the note's back link without a second scroll | step 1.1 jsdom spec; step 1.2 Playwright spec on `/blocks/footnote-demo` in Viewing mode with the note below the fold, Chromium five warm runs, Firefox and WebKit once |
| Click a back link in a read-only view | The citation scrolls into view and flashes; focus moves to the mark | same |
| A back link of a note cited several times, in a read-only view | Opens the picker with focus inside it; arrow keys pick a citation and Enter jumps to it | same |
| Enter on a focused mark or back link in a read-only view | Jumps, or opens the picker, as a click does | step 1.2 Playwright spec |
| Unresolved mark in a read-only view | Nothing happens and no create action shows | step 1.2 jsdom and Playwright specs |
| Jump in an editable view | Unchanged: Mod+click on the mark and a click on the back link move the caret, focus, scroll and flash | existing `FootnotePlugin.spec.tsx:74-111` and `footnote.navigation.spec.tsx`, rerun |
| A read-only view jumps beside an editable view of the same editor | The editable view's caret and focus stay, and focus lands on the target's control in the read-only view | step 1.1 and step 1.2 two-view jsdom specs |
| Paste a note into a table cell, a quote, a list item or the middle of the document | The text lands at the caret, the notes land after the document's last block and before its trailing empty paragraph, the caret stays after the pasted text, one undo restores the document and the caret; a table pasted into one cell selects its text, as today (`t_c0e884d9`) | step 3.2 spec through `editor.update.fragment.replace`; step 3.2 Chromium native paste of GitHub-rendered HTML into a table cell on `/blocks/playground-demo` |
| Paste over several table cells | Each cell gets the text, and each cell's copy of the note lands at the end, where the later copies show as duplicates | step 3.2 spec |
| Copy words from inside a note and paste them | The clipboard holds only the words; they land at the caret and no new note appears | step 3.1 export case; step 3.2 spec |
| Drag a note to another place | Unchanged: it lands where it is dropped | step 3.2 spec |
| Copy from a static page and paste into the editor | The marks and notes come back as footnotes, without the label or the back link | step 2.4 spec on `renderStaticHtml` output |

## Open work

- Pasted notes whose ref matches a note already in the document cite the existing note, and the pasted note shows as a duplicate. Markdown and Plate paste do the same today, and GitHub numbers its notes from 1, so GitHub paste meets it often. Giving them fresh refs needs a paste stage that sees the slice and the document before Table fills cells, which Plite does not have (`editor-commands.ts:542` lists no command above `replaceSlice`). A GitHub paste whose citation has no definition in the payload can also take the ref of another definition in that payload. Owner: the owner. Tracked: suggested task `t_379f939a` in the ledger. Stop: that task lands or is dropped.
- A static partial copy that starts in body text and ends inside a note keeps the note's definition marker in its HTML. An editor that reads that HTML instead of Plate's own clipboard format rebuilds a whole note at the document's end. Owner: the owner. Tracked: suggested task `t_8b1856dc` in the ledger. Stop: that task lands or is dropped.
- Step 3.3's timing line has no result. Its last rerun, on the round 2 code before round 3's landing fix, was inconclusive, because the one-minute load reached 79.86 against the limit 18 (`docs/plans/artifacts/2026-10-17-footnote-review/r2-timing-final-a1.log`). The work count bounds the second write, so the step closed on it. Step 2.2's planted export arm missed its line twice, both times with the load above 18, so its verdict waits on the same quiet rerun (`docs/plans/artifacts/2026-10-17-footnote-review/mutate/rebuild-index-per-footnote-node-a3.log`). Owner: the owner. Tracked: suggested task `t_3e553d13` in the ledger. Stop: that task lands or is dropped.
- Footnote anchors cover the main root only. Exporting HTML for a note inside a named root throws, and a caption root rendered beside the main root reuses its `fn-1` and `fnref-1` ids. Owner: the owner. Tracked: suggested task `t_ad6feb38` in the ledger. Stop: that task lands or is dropped.
