---
review_scopes: [footnote]
verdict: pursue
review_basis: [2026-10-04-footnote-audit]
work_kind: implementation
review_commit: 4f880fc5702db166a0e92e8f8b15d5ab9fa26b0c
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/research/review-records/2026-10-04-footnote-audit.json, packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts, packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts, packages/platejs/src/react/features/footnote/FootnotePlugin.tsx, packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx, packages/platejs/src/features/link/lib/BaseLinkPlugin.ts, packages/platejs/src/lib/plugins/html/HtmlPlugin.ts, packages/platejs/src/html/index.ts, packages/platejs/src/html/htmlConformance.spec.ts, packages/platejs/src/static/renderStaticHtml.tsx, packages/platejs/src/static/components/PlateStatic.reuse-oracle.spec.tsx, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/docx/export/lib/exportDocx.presentation.spec.tsx, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/plitejs/src/react/components/editable.tsx, tooling/entrypoints/entrypoint-dag.mjs, apps/www/src/registry/components/editor/footnote.tsx, apps/www/src/registry/components/editor/footnote-static.tsx, apps/www/src/registry/components/editor/footnote.navigation.spec.tsx, apps/www/src/registry/components/editor/footnote.slow.tsx, apps/www/src/registry/components/editor/docx-export.spec.tsx, apps/www/src/registry/components/editor/toc.tsx, apps/www/src/registry/components/editor/insert-toolbar-button.tsx, apps/www/src/registry/components/editor/slash.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/components/editor/plugins-static.ts, 'content/docs/(plugins)/(elements)/footnote.mdx', 'content/docs/(plugins)/(serializing)/html.mdx', 'content/docs/(plugins)/(serializing)/html.cn.mdx', docs/editor-behavior/markdown-editing-spec.md, packages/plitejs/src/interfaces/schema.ts, packages/plitejs/src/core/schema-compiler.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/get-content-slice.ts, packages/plitejs/src/core/insert-limit.ts, packages/plitejs/src/core/transfer.ts, packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts, packages/plitejs/src/yjs/core/schema-metadata.ts, packages/platejs/src/features/table/lib/BaseTablePlugin.ts, packages/platejs/src/features/table/lib/internal/paste.ts, content/docs/plite/concepts/19-schema.mdx]
review_upstreams: ['../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../micromark@6577c200155e9c6b85a42b26d298f8affc348f2f']
---

# Footnotes: jump in read-only views and keep the link in HTML

Status: building: phase 3
Playbook: plan

**Pursue, and this plan builds it.** The verdict measured four failures. Serializing any document with a footnote to HTML fails by default, GitHub's footnote HTML pastes as plain links, static pages print `[1]` with no anchor, and both jump commands return `false` in a read-only view because Plite refuses every update there. Planning found a fifth: a definition pasted with the caret in a table cell or a quote lands inside it, because paste runs no transfer veto (`docs/plans/artifacts/2026-10-17-footnote-review/cell-paste-a3.log`). The plan keeps the stored shape. It adds one read, `read.anchor({ path })`, which gives each footnote element its fragment id and the id it links to. It also adds one HTML mapping per footnote plugin, anchors in the copied static item, a read-only branch in the jump, Word overrides that keep footnotes as plain text, and a Plite slice field, `endMatter`, that the footnote definition declares so a paste puts its notes at the end of the document. It cuts three reads that only tests call. `architect` picked the target from three runners, and the first plan panel replaced its paste wrapper and its static back links with a correction. The second panel showed the correction could not keep undo, the caret or note order, so a second `architect` run replaced it with the paste landing step. The probes below tested each premise the plan rests on.

## Brief

### What will change?

In a read-only view, clicking a footnote mark takes you to its note, and back. HTML export, GitHub paste, static pages and Word export keep footnotes, and pasted notes always go to the end of the document.

### What could go wrong?

Read-only jumps return true. Three test-only reads go. Static and HTML notes link back only to the first mark. Copying words inside a note copies just the words. Saved collaboration rooms need a migration.

## Teach

A footnote is a small mark in the text that points to a note at the end of the document. Both carry the same label.

Today the jump moves the caret to the target and flashes it. A read-only view refuses any caret move, so the jump does nothing there. HTML has no footnote rule, so export fails and paste from GitHub gives plain links. Static pages print the label with no link. A note pasted into a table cell or a quote stays inside it.

In a read-only view the jump scrolls and flashes instead, like the table of contents. HTML export, static pages and GitHub paste all use GitHub's link pair, from a mark to its note and back to the first mark. A pasted note goes to the end of the document, and the caret stays after the pasted text. A note already saved inside a block stays put. Word keeps showing notes as plain text.

## Public API

The jump call stays the same. In a read-only view it now scrolls to the target, flashes it and returns `true`, and the caret doesn't move.

```tsx before
// packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx
rendered.rerender(tree(true));
expect(api.focusDefinition({ ref: '1' })).toBe(false);
```

```tsx after
// packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx (planned)
rendered.rerender(tree(true));
expect(api.focusDefinition({ ref: '1' })).toBe(true);
expect(editor.read.selection()).toEqual(before);
```

A new read tells the copied static item each footnote's id and the id it links to.

```tsx before
```

```tsx after
// apps/www/src/registry/components/editor/footnote-static.tsx (planned)
const anchor = editor.plugin(BaseFootnotePlugin).read.anchor({ path });
// the second citation of "1": { id: 'fnref-1:2', target: 'fn-1' }
// the definition of "1": { id: 'fn-1', target: 'fnref-1' }
// a later duplicate of "1": { id: 'fn-1:2' }
```

Exporting a document with a footnote to HTML now works. It writes GitHub-style links tagged with Plate's own attributes, and marks the note's back link as presentation, so pasting the HTML back drops it.

```ts before
// content/docs/(plugins)/(serializing)/html.mdx
const result = serializeHtml(document, {
  plugins: EditorKit,
  projection: 'accepted',
});
// { ok: false }: "Plate HTML encode has no encoder for element "footnoteReference"."
```

```ts after
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

Pasting GitHub's rendered footnotes gives footnotes back.

```ts before
// content/docs/(plugins)/(serializing)/html.mdx
const result = editor.api.html.parse(githubReadmeHtml);
// a link "1" to #user-content-fn-1, a "Footnotes" paragraph and a link "↩"
```

```ts after
// content/docs/(plugins)/(serializing)/html.mdx
const result = editor.api.html.parse(githubReadmeHtml);
// a footnoteReference with ref "1" and a root footnoteDefinition with ref "1"
```

On static pages the mark links to its note, and the note links back to its first mark.

```tsx before
// apps/www/src/registry/components/editor/footnote-static.tsx
{props.children}[{element.ref ?? ''}]
```

```tsx after
// apps/www/src/registry/components/editor/footnote-static.tsx (planned)
{props.children}
<a data-editor-footnote-ref={element.ref} href={`#${anchor.target}`} id={anchor.id}>
  [{element.ref}]
</a>
```

A schema element can now mark itself as end matter, content that belongs at the end of the document. The footnote definition does, so every note in a paste lands after the document's last block, before any empty paragraphs that end it.

```ts before
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts
schema: ({ plugins }) => ({
  element: {
    content: plugins.blockContent({ default: BaseParagraphPlugin, min: 1 }),
    properties: {
      ref: property.string({ required: true, validate: isNonBlankRef, validationVersion: 1 }),
    },
  },
}),
```

```ts after
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts (planned)
schema: ({ plugins }) => ({
  element: {
    content: plugins.blockContent({ default: BaseParagraphPlugin, min: 1 }),
    properties: {
      ref: property.string({ required: true, validate: isNonBlankRef, validationVersion: 1 }),
    },
    slice: { endMatter: true },
  },
}),
```

A copy of words inside a note gives the words, not the note. A copy that covers a note whole keeps it.

```ts before
// packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts
slice = editor.read.slice.export({ at: range })
// "efin" selected inside note 1:
// { content: [footnoteDefinition ref "1" > paragraph "efin"], openStart: 2, openEnd: 2 }
```

```ts after
// packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts (planned)
slice = editor.read.slice.export({ at: range })
// "efin" selected inside note 1:
// { content: [paragraph "efin"], openStart: 1, openEnd: 1 }
```

Three duplicate-check reads that only tests use are removed. Each is one line over `definitions({ ref })` and `refs()`.

```ts before
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts
expect(footnote.hasDuplicateDefinitions({ ref: '1' })).toBe(true);
expect(footnote.duplicateRefs()).toEqual(['1']);
expect(footnote.duplicateDefinitions({ ref: '1' })).toHaveLength(1);
```

```ts after
```

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

## Main changes

- One pure function builds a path-keyed id index from a document's children, memoized per children array in a `WeakMap` that holds one index per pair of element types. `read.anchor` calls it with `state.children()` and the HTML encoders with the encode context's `document.children`, so a static page and exported HTML agree on ids and one export indexes the document once. The live editor's copied UI never calls it, so typing does no new work.
- Every id depends only on nodes before it. A citation counts the earlier citations of its ref, and a definition the earlier definitions. A canonical note links back to `fnref-<enc>`, the first citation's id, which no later change can alter. So static reuse, which keeps a block while it and every block before it are unchanged, stays exact without `readsDocument`.
- Plite gains one element slice field, `endMatter`. A copy keeps an end-matter element its selection covers whole and keeps only the children of one it covers in part. Before its length cut, a paste or any other slice write keeps only the children of an end-matter element still open on an edge. After the cut it takes every end-matter element out, in source order, and writes them after the root's last block that is not an empty default block, keeping the selection. Then it writes the rest at the site as today, which places the caret. Drops skip both steps, so a dragged note lands where it is dropped.
- Table's prepared paste takes its selection points from the cells it filled, after the fill, in both of its planners, instead of computing them before the fill. The selection keeps today's shape.
- Each footnote mapping's `prepareDocument` rewrites GitHub's markup and strips Plate's presentation markup in the inert document before decode. The definition mapping runs at priority 70, before Indent (60) and List (50), so GitHub's footnote list items become definitions before List flattens them.
- The DOCX export draws footnotes through its own overrides, the label and the note text with no links, which is what Word shows today.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read-only jump | Returns `false`; Plite refuses the selection write | Scroll to the point the editable jump scrolls to, flash the target, return `true`; no update, no `dom.focus` | `FootnotePlugin` | Readers need the jump; TOC already scrolls and flashes without a write (`toc.tsx:79-105`) | Docs navigation section, changeset | Step 1.1 spec, step 1.2 browser spec | App code that read `false` as read-only | rearchitect |
| Read-only gestures | Plain click does nothing; Mod+mousedown calls a jump that returns `false` | Plain click and Enter jump; the picker takes focus; focus moves to the target's jump control after `true` | Copied `footnote.tsx` | Gestures and focus are copied-UI policy | Registry changelog | Step 1.2 specs | A custom copy keeps the old gestures | rearchitect |
| Fragment ids | None | `read.anchor({ path })` returns `{ id, target? }`, every id counting only earlier nodes, the ref percent-encoded as WTF-8 | `BaseFootnotePlugin` read | One owner for ids that static and HTML share | Copied static item, HTML encoders, docs | Step 2.2 spec | None known | keep (new) |
| HTML mapping | None; export fails, paste gives links | One mapping per plugin with `data-editor-footnote-*` markers and one back link per canonical note marked as presentation | Both footnote plugins | Export must succeed on footnote documents | HTML docs | Step 2.3 spec, `htmlConformance.spec.ts` | Link paste precedence; GitHub variants | keep (new) |
| Preparation | None | Each mapping's `prepareDocument` turns GitHub's markup into Plate's markers, drops GitHub's label heading and back links and Plate's presentation markup, and unwraps the mark's `sup` | Both footnote plugins | One parse path for paste and `parseHtml` | None | `premises-a5.log`, `html-chrome-a1.log`, step 2.3 spec | The drop could count as source cleanup, which Vision gives to `DataTransferFormat` | keep (new) |
| Static anchors | `[ref]` text, no link | Links from `read.anchor`; a canonical note's label and back link marked as presentation | Copied `footnote-static.tsx` | Static pages and Word export draw through the static kit | Registry changelog | Step 2.4 spec | Two documents on one page share ids | rearchitect |
| Static reuse | Every block is reused while it and the blocks before it are unchanged | Unchanged; no footnote element reads later content | None | Earlier-only ids keep reuse exact (`static-anchors-a2.log`) | None | Pre-acceptance `static-anchors-a2.log`; production rerun in step 2.4 | A later change that makes an anchor read later content | gate |
| Word drawing | The static kit's label, no links | DOCX overrides draw the label and note text, no links | `DOCX_STATIC_COMPONENTS` | Word bookmarks exist only for headings, so static links would dangle | None | Step 2.5 spec and its must-fail control | None | keep (new) |
| Pasted notes | A paste puts them inside cells and quotes | Every end-matter element in a pasted slice lands after the root's last block that is not an empty default block; a copy keeps one it covers whole and gives the words of one it covers in part | Plite's slice fitting, with `slice.endMatter` declared by `BaseFootnoteDefinitionPlugin` | Definitions are root end matter. A paste wrapper missed Table's multi-cell path (`correction-a4.log`), and a correction left notes mid-document, flipped the canonical note, broke undo of saved nested notes and moved the caret out of the cell (`correction-r2-a1.log`) | Plite schema docs, footnote docs, Vision | `endmatter-premises-a1.log`, `round3-a1.log`, steps 3.1 and 3.2 specs, step 3.3 work count and timing line | A saved Yjs room or history created with footnote definitions refuses this version until the app migrates it | rearchitect |
| Duplicate reads | `duplicateDefinitions`, `hasDuplicateDefinitions`, `duplicateRefs` | Deleted | `BaseFootnotePlugin` read | Each is one line over `definitions` and `refs`; only tests call them | Docs, mocks, fixtures | Step 2.1 redundancy case, then typecheck | Outside app callers | cut |

## Design

`architect` ran three runners, `gpt-6.1-sol @xhigh`, `claude-opus-5-5 @high` and `gpt-6-astra @xhigh`, and one blind cross-judge, `claude-opus-5-5 @high`. The judge scored Sol 21, Astra 20 and Opus 18 and recommended Astra's candidate as the base, with Opus's `read.anchor` as the replacement if a package static component falls (`docs/plans/artifacts/2026-10-17-footnote-review/architect/judge.md`).

**The base is the Opus candidate, against the judge's pick.** Sol and Astra both add a `platejs/footnote/static` entrypoint, which no feature has, and move the static drawing and its accessibility labels into the package. Vision gives a static registry item its real presentation source, has feature presentation reads take the known path, and keeps accessibility labels out of package defaults. The judge named the Opus read as the fallback, so the base keeps its single read and puts the drawing in copied UI.

Grafts taken:

1. The anchor map keyed by path, from Sol and Astra, instead of a node `WeakMap`, so one node object at two paths cannot collide.
2. `data-editor-footnote-ref` and `data-editor-footnote-definition` markers that carry the raw ref, from Sol, per [plate.md](../vision/plate.md)'s `data-editor-*` law and Mention's precedent (`BaseMentionPlugin.ts:55-94`). Decode reads the ref from the marker, so ids no longer need to round-trip.

The first plan panel dropped two grafts. Astra's `render: { readsDocument: true }` on definitions existed only so a note could link back to every citation. Its frozen lines accepted a redraw cost they could not reject: appending one block after 2,000 notes rendered 4,001 elements instead of 1 (`static-reuse-a1.log`). Astra's root-append paste wrapper missed Table's multi-cell path, which never calls the next handler, and turned words copied from inside a note into a duplicate note (`correction-a4.log`).

The lead's own calls, named for the panel to attack:

- Word draws footnotes as plain text through `DOCX_STATIC_COMPONENTS`, instead of Sol's generic bookmark writer. Word output stays as it is today. Bookmarks for any linked id would need inline and block bookmark writing in `render-document-file.ts`, which today wraps only headings (lines 381-388), so real Word footnotes or bookmarks stay a separate change.
- `<enc>` percent-encodes the ref as WTF-8: `encodeURIComponent` for well-formed text, and each lone surrogate as its three WTF-8 bytes, such as `%ED%A0%80` for U+D800. No well-formed string encodes to those bytes, so distinct refs never share ids and no ref throws.
- Dropping GitHub's label heading and back links, and Plate's own presentation markup, is construct preparation in `prepareDocument`, as List flattens its items, not source cleanup in a `DataTransferFormat`. The judge read it the same way.
- A reference links to `#fn-<enc>` even when no definition exists, and a canonical note links to `#fnref-<enc>` even when nothing cites it, in HTML and on static pages. A dead in-page link does no harm, and neither side needs a resolution read.
- A canonical note links back to its first citation only. GitHub links back to every citation, but that link list depends on content after the note, so either static reuse breaks or every note redraws on each later edit. The editable UI keeps its picker for a note cited several times.
- Pasted notes land at the end through Plite's slice fitting, not through a paste wrapper or a correction. The second plan panel and a second `architect` run replaced the correction, as the Where pasted notes land subsection below says.

Cases a losing candidate handles that the base drops, each made a graft or a named limit:

- Sol's DOCX bookmarks are a named limit. Word shows plain text, as today.
- Sol's `DataTransferFormat` for GitHub's label heading and back links is rejected. It cleans only clipboard paste, so `parseHtml` of GitHub HTML would still keep them.
- Sol's and Astra's package-owned focus with `tabindex` on note content is rejected. The copied item focuses its existing jump controls.
- Astra's flag that Table also wraps `replaceSlice` (`BaseTablePlugin.ts:2527`) is taken as step 3.2's both-orders and multi-cell cases.
- GitHub HTML wrapped in `div.markdown-body` or `article` becomes a step 2.3 fixture.
- Two documents on one page write the same ids. That is a named limit, and copied UI can prefix them.

Premises the base rests on, each run before the pick (`docs/plans/artifacts/2026-10-17-footnote-review/premises-a5.log`), or after the first panel (`correction-a4.log`, `html-chrome-a1.log` and `static-anchors-a2.log` in the same folder):

- A definition matcher with no tag at the reference's priority throws "equal priority and overlapping element candidates"; a `div` matcher at the same priority compiles.
- With the reference mapping at priority 10, Link (priority 0) decodes every anchor the footnote decoder declines.
- A definition prepare at priority 70 keeps a three-block GitHub note with a nested list; at 40, List's prepare runs first and the note loses its second paragraph and its list.
- A `children` correction that moves a non-root definition to the end landed it at the root from a single table cell, from a selection over two cells, from a pasted table that holds a note and from a quote, in either install order (`correction-a4.log`). The second panel found what those cases missed, and `correction-r2-a1.log` reproduced each miss, so the correction is gone.
- GitHub's renderer writes `user-content-fn-<label>` ids, adds a hash suffix to every id and `href` in `gfm` mode, and shows each note's position in the list as its citation's text, `1` for a note labeled `n` (`github-fixtures/`).
- Removing every `data-editor-footnote-chrome` element inside a definition, and unwrapping a `sup` that holds only a footnote anchor, parses static footnote HTML back to the note's content alone and a reference with no `script` mark. Without them the label and back link become paragraphs of the note, and the `sup` puts `script: 'sup'` on the reference's child.

The pre-acceptance probe for the earlier-only anchors froze two lines before any arm ran (`static-anchors-a2.log`): for every operation in every cohort, the candidate renders as many elements as base (M1), and its reused DOM equals a fresh render (M2). Both lines held in all four cohorts. Every operation rendered as many elements as base, such as 1 for a block appended after 2,000 notes, and the reused DOM matched a fresh render. The planted arm missed M1 as it must, rendering 21, 20 and 22 elements where base rendered 1, 2 and 2. The citation added before every block ran on the normal cohort only, as the frozen lines say, because the first attempt took about 150 s per arm on it and was stopped (`static-anchors-a1.log`). Timing moved both ways on a host at load 68 to 219 on 18 cores, so it decides nothing.

This plan reverses three claims from the verdict page. The transfer veto does not keep pasted definitions at the root; phase 3's end-matter landing does. `serializeHtml` writes Plate's `data-editor-footnote-*` markers and a back link marked as presentation, not GitHub's `data-footnote-ref`. The verdict did not mention Word; this plan keeps Word's plain text on purpose.

### Where pasted notes land

The second plan panel attacked the correction, and one isolated probe per finding reproduced four misses (`correction-r2-a1.log`):

- A paste at a root paragraph in the middle of the document leaves the note between body blocks, because the note is already a root child and the correction never runs.
- A pasted `quote(quote(definition FIRST), definition SECOND)` makes SECOND canonical, because corrections run shallowest first.
- History replay runs corrections, so undo of a split inside a saved nested note cannot restore it, and undo, redo, undo throws a selection error.
- The caret follows the moved note out of the cell to the end of the document.

The correction was this plan's second paste design to fail the same gate, so the run pivoted and ran `architect` on who places a pasted note. Its three runners were `gpt-6.1-sol @xhigh`, `claude-opus-5-5 @xhigh` and `gpt-6-astra @xhigh`. Their brief named ten outcomes: notes land after every block, keep source order and the canonical note, one undo restores the document and the caret, the caret ends after the pasted text, words copied inside a note paste as words, every paste path holds, `maxLength` admits what it would without notes, saved nested notes stay, peers receive ordinary operations, and Plite stays generic (`architect-r2/runner-brief.md`). One blind cross-judge, `claude-opus-5-5 @xhigh`, scored Sol 18, Astra 17 and Opus 14 and recommended Sol's candidate as the base (`architect-r2/judge.md`).

**The base is the Opus candidate, against the judge's pick.** Every defect the judge found in it has a graft whose premise this run ran. Sol's base changes Table's private placement contract so each placement carries an open slice. It also lets words copied inside a note arrive as a whole note when the target gets only HTML. The Opus candidate removes the open note when the copy is read. The judge called that the only design that keeps copied words as words for an HTML-only paste, and it lets Table keep its closed placements. The Opus candidate also covers raw `tx.slice.replace`, because it lives in schema fitting. It writes the notes before the rest, so a root that refuses them falls back before anything is written.

Grafts taken, each premise run in `endmatter-premises-a1.log`:

1. Drops skip the step, from Sol and Astra and the judge's finding that the Opus hook would reroute block drops (`transfer.ts:899-912`, `public-state.ts:4528-4539`). A block move inside one root never reaches the fitter, because it moves the node itself (`transfer.ts:455-457`, `758-772`), and the moved node keeps its key (`round3-a1.log`). Block copies, drops from another editor or a read-only view, and moves across roots reach the fitter through `replaceSliceAtBlockBoundary`, so step 3.2 tests a block copy.
2. Table's prepared paste takes its caret from the filled cells, from Sol and Astra. The run pasted a one-cell table whose cell ends with a note, and the planned focus was inside the note.
3. The root survival walk also walks appended notes, from Astra and the judge's finding that `fitSlicePlacements` visits only placement parents (`public-state.ts:4439-4472`).
4. Openness is settled before the length cut, from Astra and the judge. The third plan panel showed that the path lookup this graft first named cannot work. The fit never sees the slice from before the cut (`slice-landing.ts:46`, `73`, `122`), and the limiter keeps an empty element after its budget runs out, so a kept node can move to a new path (`insert-limit.ts:111`, `123`; `round3-a1.log`). So every paste entry dissolves the end matter still open on an edge before each of its cuts, and the landing takes out every end-matter element left, with no path lookup.
5. The Opus candidate's own probes P1 to P11 become step 3.2's cases and step 3.3's timing line.

The run also wrote a closed note at the root end through `tx.slice.replace`, and today's fitter moves the caret into the note. So step 3.2's root-end write keeps the selection, and the flow write sets the caret.

Cases a losing candidate handles that the base drops, each a graft above or a named limit:

- Sol's and Astra's copy-only rule leaves raw `tx.slice.replace` alone. The base runs for every fit except drops. A schema policy runs wherever schema fitting runs, as content completion does, while the landing read stays command policy ([plite.md](../vision/plite.md), the paste paragraphs). This is a lead's call for the panel to attack.
- Sol's open placements would let Table see an open note per cell. The base dissolves open notes at copy time instead, so only a hand-built open slice sent over several cells lands one whole note per cell. That is a named limit.
- Astra's copy-drop receipts keep the text-move guard from refusing a split landing. Drops skip the step, so a text drag that carries a whole note lands it where it is dropped, as today. That is a named limit.
- Astra's per-placement order for Table, where each placement's notes and body finish before the next is budgeted, holds by construction, because the step runs inside each placement's fit after its cut. Step 3.2's two-cell `maxLength` case checks it.
- Astra's rule for a replaced canonical note is step 3.2's promise that a canonical note the paste does not replace stays canonical.

Other named limits:

- A saved nested note never moves.
- A programmatic nested insert, a `nodes.set` or wrap, `value.replace`, `initialValue` and an older peer can still nest notes. Every footnote read already handles a nested note.
- A fill of several cells lands one copy of the note per cell, shown as duplicates.
- A container that a paste empties keeps a default child.
- A raw `tx.slice.replace(slice, { at })` writes a slice's end matter at the root end, not at `at`, because the landing is schema policy and runs wherever schema fitting runs. Detached `schema.fitContent` does not run it (`representation.ts:391`). Step 4.8 writes this exception into Vision's paste paragraph.

The third plan panel found that the copy's dissolve also ran on text moves. A move reads its slice through the same `getContentSlice` with `lifecycle: 'move'` (`get-content-slice.ts:73`, `transfer.ts:460-470`), and the transfer guard derives what it expects from that slice, so a move from body text through the end of a note would have lost the note. Today that move keeps the note (`round3-a1.log`). So the copy's dissolve runs for the `copy` lifecycle only. The panel also found that a select-all copy ends inside the last note, so the dissolve would turn it into a body paragraph and leave its citations pointing nowhere. So a copy keeps an end-matter element its selection covers from its start to its end. It closes the slice's edge at that element instead of dissolving it.

The judge's checks found four false claims. The Opus candidate said it leaves node transfers alone (cand-2.md:279), which its own hook does not. Astra said node associations survive copying, root remapping and length limiting (cand-3.md:150), but the limiter builds new nodes. Sol cited `public-state.ts:3959` for the checked spec, a blank line; the boundary is at 3945, 3965 and 4126. Astra cited 4060 for the selected-block branch, which is at 4076. The judge confirmed that a Yjs room with a different schema fingerprint refuses to join (`schema-metadata.ts:207-209`), which is why the contract choice is a Defaults row.

Challenge delta: replaced, the `children` correction by the `slice.endMatter` landing; decisive evidence `correction-r2-a1.log`.

The pre-acceptance timing probe froze its line in `endmatter-timing.config.json` before any arm ran: a 2,000-block paste, with 200 notes and with none, takes at most 1.1 times today's paste. It came back inconclusive (`endmatter-timing-a2.log`). The prototype split measured 0.81 and 0.62 times base, but the host's load reached 66 on 18 cores and the same-code arm's noise reached 0.58 on the plain cohort, more than the candidate's margin to the budget. The planted arm, which repeats the split four times per block, missed at 4.2 and 2.3 times. So step 3.3 reruns the line on the final code as a gate.

## Feature Manifest

Optional packs:

- `performance-observability`, for the static reuse row and the paste landing.

Flow mode:

- existing package plus React/registry

Completion threshold:

- Every applicable Feature Manifest row is complete with evidence.
- Every excluded row has an explicit N/A reason.
- Selected packs, the feature checker and `plan-open` are closed.

Constraints:

- Use one Feature Manifest through every phase.
- Load worker skills only when their phase is active.
- Do not add package-generation tooling.
- Do not copy worker doctrine into this plan.

Feature Manifest:
| Surface | Applies | Owner | Artifacts | Consumer | Proof | Status |
| --- | --- | --- | --- | --- | --- | --- |
| API | yes | best-api lens in the verdict, then architect | `read.anchor` and `FootnoteAnchor`; the read-only jump result; the three cut reads; Plite's `slice.endMatter` and the copy read inside end matter | App authors, schema authors and copied static UI | steps 2.1, 1.1, 2.2 and 3.1 specs; the api-plan and api-build panels | planned: steps 2.1, 1.1, 2.2, 3.1 |
| Package | yes | platejs, plitejs | `BaseFootnotePlugin.ts` (anchor ids, HTML mappings, `slice.endMatter` on the definition), `PLATE_HTML_ATTRIBUTES`, `docxStaticComponents.tsx`, `BaseTablePlugin.ts` (the prepared caret); in `plitejs`, `interfaces/schema.ts`, `core/schema-compiler.ts`, `core/editor-schema.ts`, the new `core/slice-end-matter.ts`, `core/get-content-slice.ts` and `core/public-state.ts` | `platejs/footnote`, `platejs/html`, `platejs/docx/export`, `platejs/table` and `plitejs` callers | steps 2.1, 2.2, 2.3, 2.5, 3.1 and 3.2 specs; `htmlConformance.spec.ts` | planned: steps 2.1, 2.2, 2.3, 2.5, 3.1, 3.2 |
| React adapter | yes | platejs/react | `FootnotePlugin.tsx` read-only branch | `FootnoteKit` | step 1.1 spec | planned: step 1.1 |
| Registry UI | yes | plate-ui | `footnote.tsx` read-only gestures, picker focus and focus after a jump; `footnote-static.tsx` anchors and back links | Apps that copy `footnote` | steps 1.2 and 2.4 specs; the Playwright footnote specs; the hand drive | planned: steps 1.2, 2.4 |
| Composition | yes | plate-ui | `FootnoteKit` and `BaseFootnoteKit` keep their shape; `docx-export` picks up the package overrides | `plugins.ts`, `plugins-static.ts`, `docx-export.tsx` | `docx-export.spec.tsx`; step 2.4's reuse oracle cases | planned: steps 2.4, 2.5 |
| Scale proof | yes | benchmark | the static reuse lines M1 and M2, HTML export time that grows in step with the number of notes, and paste time with the end-matter split | users/maintainers | pre-acceptance `docs/plans/artifacts/2026-10-17-footnote-review/static-anchors-a2.log` and `endmatter-timing-a2.log`; step 2.2's export scaling line; step 2.4's `readsDocument` case and oracle cases; step 3.3's timing gate | planned: steps 2.2, 2.4, 3.3 |
| Registry metadata/examples | yes | plate-ui | a registry changelog entry for `footnote`; regenerated `apps/www/public/r/footnote*.json`; `plugins.generated.ts` and `plugins.schema.json` with the definition's `endMatter` | shadcn registry installs | step 4.6 changelog check; step 4.7 `build:registry` read-back and `editor:check` | planned: steps 4.6, 4.7 |
| Docs | yes | plate-docs | `content/docs/(plugins)/(elements)/footnote.mdx`; `content/docs/(plugins)/(serializing)/html.mdx` and its Chinese twin; `content/docs/plite/concepts/19-schema.mdx` | Docs readers | steps 4.1, 4.2 and 4.3 docs checks and preview | planned: steps 4.1, 4.2, 4.3 |
| Release artifacts | yes | changeset | a `platejs` and a `plitejs` changeset | Release notes readers | step 4.6 `pnpm changeset status` | planned: step 4.6 |

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: no new host; the footnote entrypoint keeps its core and combobox imports | `tooling/entrypoints/entrypoint-dag.mjs:89` |
| Plite ownership | yes: Plite owns `slice.endMatter`, the landing step and the copy read, and names no footnote type; the jump uses `editor.api.dom.scrollIntoView` and Plite's existing read-only refusal | steps 3.1 and 3.2 over a generic `endnote` schema; `endmatter-premises-a1.log` and `readonly-selection-a1.log` in `docs/plans/artifacts/2026-10-17-footnote-review/` |
| external dependency ownership | N/A: no new dependency | step 4.7 `pnpm test:manifests` |
| entrypoint runtime | `docx/export` adds `footnote` to its dependencies; no new entrypoint | step 2.5 `pnpm check entrypoint-graph` |
| Oxlint coverage | The existing platejs and www lint cover every changed file | step 4.9 `pnpm lint:fix` on the task's paths |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| HTML export of a footnote document fails by default, and allowing loss drops the mark | yes | `docs/plans/artifacts/2026-10-17-footnote-review/footnote-html-a1.log` |
| GitHub's footnote HTML pastes as a link, a heading paragraph and a back-link link | yes | same log |
| Static output prints the label with no anchor | yes | same log |
| A read-only view refuses the jump's selection write and leaves an editable view's caret in place | yes | `docs/plans/artifacts/2026-10-17-footnote-review/readonly-selection-a1.log` |
| A pasted definition lands inside a table cell or a quote | yes | `docs/plans/artifacts/2026-10-17-footnote-review/cell-paste-a3.log` |
| Mapping priorities, Link fall-through and prepare order behave as the design assumes | yes | `docs/plans/artifacts/2026-10-17-footnote-review/premises-a5.log` |
| A `children` correction cannot keep the caret, note order or undo of saved nested notes | yes | `docs/plans/artifacts/2026-10-17-footnote-review/correction-r2-a1.log` |
| The end-matter landing's premises: Table computes its prepared caret before the fill, a copy inside a note exports the note open on both edges, and a closed write at the root end moves the caret into the note. The same log's block move asserted only the move's status; a block move inside one root never reaches the fitter, as the next row shows | yes | `endmatter-premises-a1.log` in the same folder |
| Round 3's premises: the limiter keeps an empty element after its budget and moves a kept node's path, a cut inside a closed note leaves it last with the slice open at its end, a text move from body text through the end of a note keeps the note today, a one-cell prepared paste selects the pasted text, and a block move inside one root keeps the node's key | yes | `round3-a1.log` in the same folder |
| Presentation stripping round-trips static HTML | yes | `html-chrome-a1.log` in the same folder |
| Word bookmarks exist only for headings, so in-page links would dangle | yes | inferred from source: `render-document-file.ts:166-181` registers heading bookmarks only, and `docx-bookmarks.spec.ts:47-52` keeps an unmatched anchor link; step 2.5's must-fail control proves it at runtime |
| The footnote paths are unchanged between the review commit and `HEAD` | yes | `git diff --stat 4f880fc570 8f5afd571d` over the footnote, HTML, static and DOCX paths prints nothing |
| Feature Manifest complete before source writes | yes | Feature Manifest above; every row filled, each status closes at its step |
| Flow mode selected | yes | existing package plus React/registry |
| Public API decision owner selected | yes | `best-api` lens in the verdict, then `architect` (decision log `architect` rows) |
| Runtime scale applicability resolved | yes | Scale proof yes: the static anchors read a document-wide index on every footnote render, and static reuse is repeated-unit work; `performance-observability` selected |
| Pre-acceptance Benchmark receipt selected | yes | `static-anchors-a2.log`: base arm with today's plain static components, candidate arm with prototype earlier-only anchors and no `readsDocument`, planted arm with `readsDocument` on definitions; cohorts normal, large, stress and pathological, with the citation added before every block on normal only; lines M1 and M2 frozen and printed before the first arm; element render counts; timing informational under happy-dom on a host at load 68 to 219 on 18 cores; correctness guard M2, reused DOM equals a fresh render. The superseded `readsDocument` receipt is `static-reuse-a1.log`. For the paste landing, `endmatter-timing-a2.log`: base, candidate, planted and same-code arms over 2,000-block pastes with no notes and with 200, the 1.1 budget frozen in `endmatter-timing.config.json` before any arm, the candidate a prototype split, inconclusive at load 66 on 18 cores, so step 3.3 is a gate |
| Public feature entrypoint decision recorded | yes | No new entrypoint; the Design section rejects `platejs/footnote/static` |
| Conditional packs selected | yes | `performance-observability` only |
| Performance pack selected | yes | for the static reuse row and the paste landing |
| User-facing operation and runtime owner identified | yes | Rerendering a static document after an edit; `EditorStatic` reuse in `PlateStatic.tsx`. `serializeHtml` and `exportDocx` render once and reuse nothing, and the id index makes each one walk the document once. Pasting, through `fitSliceAtSite` and `fitSliceIntoActiveDraft`, where the split walks each pasted slice once |
| Scale variables and cohorts fixed | yes | Body blocks, notes and citations per note: normal 1000/10/1, large 1000/200/1, stress 4000/2000/1, pathological 2000/1/2000. Paste: pasted blocks and notes, 2000/0 and 2000/200 |
| Budget frozen before target measurement | yes | Lines M1 and M2, printed at the top of `static-anchors-a2.log` before any arm ran |
| Baseline and target probe selected | yes | Base arm with today's static drawing, candidate arm with earlier-only anchors, planted arm with `readsDocument` on definitions, which must miss M1 |
| Correctness guard selected | yes | M2 after six operations, including a citation added before every block and a duplicate note added after the notes |
| Production detector decision recorded | yes | N/A: static rendering has no runtime detector; the reuse oracle spec is the regression guard |

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`). Execution authority: this run's Pursue, which continues into the build under Autopilot. The build edits this checkout on `next` and commits nothing. Each step's proof names its base control, the half that must fail at `HEAD`. Before the build, the plan ran the base controls of steps 1.1, 1.2, 2.1, 2.2, 2.3, 2.4 and 3.2 at `8f5afd571d` in a detached worktree (`docs/plans/artifacts/2026-10-17-footnote-review/base-controls-a1.log`, decision log `plan` rows). Each failed for the defect its step names, except step 2.1's redundancy case, a must-pass control, which passed. That log names the steps by the first panel's numbering: its 1.1 cases are steps 2.1 and 2.2 here, its 1.2 is 1.1, its 1.3 is 1.2, its 2.1 is 2.3, its 2.2 is 2.4, and its 3.1, a note pasted into a cell landing inside it, is the defect step 3.2 fixes. Step 2.5's control is a mutant, and step 3.1's copy case and step 3.2's other cases run their base controls in the build.

### Phase 1. Jump in read-only views

Keep it when steps 1.1 and 1.2 fail at base and pass on the change, and the navigation Playwright spec passes five warm Chromium runs, Firefox and WebKit. Revert the phase otherwise.

- [x] 1.1 Move the point computation of `selectDefinition` and `selectReference` in `BaseFootnotePlugin.ts` into one internal function over a state view that returns `{ point, targetPath }`: the definition's start point, and the text point beside the reference. Both update methods keep calling it. In `FootnotePlugin.tsx`, when the view is read-only, call that function through `editor.read`, call `editor.api.dom.scrollIntoView(point)` as the editable branch does, flash the target through `NavigationFeedbackPlugin` when installed, and return `true`, with no update and no `dom.focus`. An unmounted view or a missing target still returns `false`. The editable branch is unchanged. Proof: `FootnotePlugin.spec.tsx`'s read-only case (lines 116-124) asserts `true`, one scroll to the same point the editable branch scrolls to, one flash in the calling view, an unchanged selection, no focus call and no history entry, and `false` once unmounted; a two-view case asserts the editable view's caret and focus stay when the read-only view jumps. Both cases red at base through `node tooling/scripts/proof-worktree.mjs <path> 8f5afd571d --with <spec> --dir docs/plans/artifacts/2026-10-17-footnote-review --name <name> --expect-fail "<case title>" -- bun test <spec>` from `packages/platejs`, green on the change, and the file's editable cases (lines 74-111) green. Done: red at `HEAD` in `docs/plans/artifacts/2026-10-17-footnote-review/p1-red-a2.log`, green in `docs/plans/artifacts/2026-10-17-footnote-review/p1-green-a1-a1.log`, platejs typecheck in `docs/plans/artifacts/2026-10-17-footnote-review/p1-typecheck-a1.log`.
- [x] 1.2 In the copied `footnote.tsx`, in a read-only view only, a plain click or Enter on the reference chip calls `focusDefinition`, and on the back link calls `focusReference`, or opens the picker when the note has several citations. In a read-only view the picker takes focus when it opens, so the arrow keys move through its items and Enter jumps; its `onInitialFocus` prevention stays for editable views. After a `true` return, focus the target's jump control with `preventScroll`. The chip's and back link's mousedown handlers return early in a read-only view, so one click jumps once and Mod+mousedown never calls `createDefinition` there. A read-only unresolved chip does nothing and shows no create action, and the renumber button is hidden. Editable gestures are unchanged. Proof: `footnote.navigation.spec.tsx` cases, each firing mousedown, mouseup and click and asserting one scroll, for the chip, the back link and a picker item in a read-only view; a two-view case where the read-only view jumps and focus lands on the target's control in that view while the editable view's caret stays; an unresolved chip that does nothing and throws nothing; and an editable plain click that does nothing; red at base and green on the change. Then a new `apps/www/tests/browser/footnote-navigation.spec.ts` on `/blocks/footnote-demo` with a viewport short enough that the first note starts below the fold. It switches to Viewing through the mode button, checks the note is outside the viewport, clicks the first mark, and sees the note's start in the viewport, the flash attribute on it, the caret unchanged and focus on its back link. Note 1 is cited twice, so Enter on that back link opens the picker with focus inside it, ArrowDown and Enter jump to the second citation, and focus lands on that chip. Run it with `PLAYWRIGHT_BASE_URL` named, Chromium five warm runs without retries, then Firefox and WebKit once, each through `proof.mjs`. Done: unit cases in the logs step 1.1 cites; the browser spec passed `docs/plans/artifacts/2026-10-17-footnote-review/p1-nav-chromium-a1.log` to `docs/plans/artifacts/2026-10-17-footnote-review/p1-nav-chromium-a5.log`, `docs/plans/artifacts/2026-10-17-footnote-review/p1-nav-firefox-a1.log` and `docs/plans/artifacts/2026-10-17-footnote-review/p1-nav-webkit-a1.log`.
  - The browser spec found a Plite defect that jsdom cannot show. The first read-only chip click after a switch to Viewing focused the chip, and when `focusFootnoteControl` moved focus to the back link, the chip's blur ran Plite's selection export. That export writes the model selection with `setBaseAndExtent`, which focuses the editor root, so the back link lost focus whenever the DOM selection differed from the model's. `handleBlur` in `packages/plitejs/src/react/editable/runtime-focus-mouse-events.ts` now skips the export when focus moves to another control or nested editor inside the editor, and still runs it when focus returns to the editor's text or leaves the page. Proof: the spec failed on the back link's focus before the fix (`docs/plans/artifacts/2026-10-17-footnote-review/p1-nav-try-a1.log`) and passed after it (`p1-nav-try-a2.log`).

### Phase 2. Links in HTML, static pages and Word

Keep it when steps 2.2 to 2.5 pass, step 2.3's native GitHub copy included. A conclusive miss on step 2.2's export scaling line sends the anchor index back to `architect`. Revert steps 2.2 to 2.5 when an HTML or Word case fails. Step 2.1's cut goes first, because step 2.2 rewrites the registry walk the three reads sit on, and it keeps or reverts on its own proof.

- [x] 2.1 Before the cut, add one `BaseFootnotePlugin.spec.ts` case that runs each removed read beside its replacement under Hard cuts on the duplicate fixtures and asserts equal results, and run it at base. Then delete `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs` with that case, their spec lines and the `footnote.slow.tsx` mocks, after a `pstack:blast-radius` pass. Proof: the redundancy case's log at base; the platejs and www typechecks after the cut. Done: the redundancy case passed before the cut in `docs/plans/artifacts/codex/footnote-p2/redundancy-before-cut.log`, the platejs typecheck in `docs/plans/artifacts/2026-10-17-footnote-review/p2-platejs-typecheck-a1.log` and the www typecheck in `docs/plans/artifacts/codex/footnote-p2/www-types-settled.log`.
- [x] 2.2 Move the registry walk in `BaseFootnotePlugin.ts` into one pure function over a document's children and the two element types, memoized per children array in a `WeakMap` that holds one index per pair of element types, which also computes, on first use, a map from path to `FootnoteAnchor = { id: string; target?: string }`. A reference's id is `fnref-<enc>` for the first citation of its ref and `fnref-<enc>:<n>` for the nth, and its target is `fn-<enc>`. A definition's id is `fn-<enc>` for the canonical one and `fn-<enc>:<n>` for the nth duplicate; the canonical one targets `fnref-<enc>`, and a later duplicate has no target. `<enc>` percent-encodes the ref as WTF-8, as the Design section says. Add `read.anchor({ path })`, which returns `undefined` for a path that holds no footnote, and export `FootnoteAnchor` from `platejs/footnote`. Proof: `BaseFootnotePlugin.spec.ts` anchor cases for refs `1`, `a b`, `#x`, `1-2`, `1:2` and `ü`; refs `"\uD800"`, `"\uD801"` and `"�"` in one document getting three different ids; a note cited three times; a duplicate definition; an uncited definition; an unresolved reference; a path with no footnote; and two editors with different footnote type names reading one children array, each getting its own anchors. Each case red at base through `proof-worktree.mjs --with --expect-fail`, and green on the change. Then, through `benchmark`, a probe in the run directory times `serializeHtml` of a 500-note and a 2,000-note document, each note cited once, five interleaved runs each, against a line frozen here: the 2,000-note median stays under eight times the 500-note median, where an index rebuilt for every footnote node would take about sixteen times. A planted arm that rebuilds the index for every footnote node must miss the line, and `benchmark-checklist` runs before any `verified` row. Done: red at `HEAD` in `docs/plans/artifacts/2026-10-17-footnote-review/p2-red-anchors-a1.log`, green in `docs/plans/artifacts/2026-10-17-footnote-review/p2-green-a1.log`; the scaling line held at 4.03 in `docs/plans/artifacts/2026-10-17-footnote-review/mutate/control-1-a2.log`, and the planted arm missed at 13.20 in `docs/plans/artifacts/2026-10-17-footnote-review/mutate/rebuild-index-per-footnote-node-a1.log`.
- [x] 2.3 Add the reference mapping to `BaseFootnotePlugin` at priority 10: match `{ tag: 'a', attributes: { 'data-editor-footnote-ref': true } }`. GitHub writes its ids with a `user-content-` prefix, and in comments with a hash suffix that changes on every render, so no ref is read out of an id. Its `prepareDocument` gives a `data-editor-footnote-ref` to each `a[data-footnote-ref]` whose `href` fragment, the part after `#` of a relative or an absolute URL, starts with `fn-` or `user-content-fn-`. The fragment is read from any URL because browsers write absolute URLs into copied HTML: Chromium serializes the clipboard with `ResolveUrls::kNonLocal`, which completes every URL unless the page is a local file (`frame_selection.cc:1355` and `markup_formatter.cc:167-179`, saved in `docs/plans/artifacts/2026-10-17-footnote-review/chromium/`), so a copied citation links to `https://github.com/<owner>/<repo>#user-content-fn-1`. The marker's value is the ref the definition prepare gave the element that `getElementById` finds for the fragment, with or without the `user-content-` prefix. When the paste holds no such note, it is the anchor's own text, the number GitHub shows, and a blank text gives no marker. It looks fragments up as written and, when they decode, percent-decoded. Any other `data-footnote-ref` anchor stays a link. It then replaces a `sup` that holds only a footnote anchor of either vocabulary, apart from whitespace and the void spacer, with the anchor. Decode returns `{ children: [{ text: '' }], ref }` and preserves the marker, or `undefined` for a blank marker, so Link takes the anchor. Encode writes `<sup><a data-editor-footnote-ref href id>` with the ref as its text. Add the definition mapping to `BaseFootnoteDefinitionPlugin` at priority 70: match `{ tag: 'div', attributes: { 'data-editor-footnote-definition': true } }`. Its `prepareDocument` runs before the reference's, because it has the higher priority. It turns each `section[data-footnotes] > ol > li[id]` into such a `div` that keeps the item's `id` and holds its children. The div's ref is the text of the first `a[data-footnote-ref]` whose `href` names the item, or the item's position in the list when none does, which is the number GitHub shows. The prepare keeps one map for the whole paste, keyed by the item element. The first item with a number keeps it, and a later item with the same number, such as the note 1 of a second pasted GitHub comment, gets that number with `-2`, `-3` and so on, so its citations, which find it by id, keep pointing at it. It replaces the section, label heading included, and removes GitHub's `[data-footnote-backref]` links and every `[data-editor-footnote-chrome]` element inside a definition. Decode returns `{ ref }`, or `undefined` for a blank marker, and the children decode as blocks. Encode writes the `div` with its `id`, the content, and for a canonical note one `<a data-editor-footnote-chrome href="#fnref-<enc>">↩</a>` after it. Both encoders take their anchors from step 2.2's index over the encode context's `document.children`. Add `data-editor-footnote-ref`, `data-editor-footnote-definition` and `data-editor-footnote-chrome` to `PLATE_HTML_ATTRIBUTES`, and footnote fixtures to `htmlConformance.spec.ts`. The GitHub fixtures are GitHub's own renders, made by `gh api markdown` in `markdown` mode, as a README renders, and `gfm` mode, as a comment renders, and saved with their Markdown inputs and `make.sh` in `docs/plans/artifacts/2026-10-17-footnote-review/github-fixtures/`. Proof: spec cases, red at base and green on the change, for `serializeHtml` under the default policy of a note cited twice, a duplicate definition and an unresolved reference, with the exact markup; `parseHtml` of that output, with the standard kit and `BaseScriptPlugin` installed, back to the same document; GitHub fixtures in both modes for a single citation, a repeated citation and a three-block note with a nested list whose label is `n`, bare, inside `div.markdown-body` and inside `article`, giving references and root definitions that share GitHub's number as their ref, with no heading, no back-link text and no loss report for the chrome; a citation pasted without its note, giving an unresolved reference with GitHub's number; a `data-footnote-ref` anchor whose `href` starts with neither prefix, decoding as a link; an `href` with a malformed `%` pairing by its raw fragment without throwing; the gfm fixtures with every href made absolute, as Chromium's copy writes them, pairing as the relative ones do; two gfm renders concatenated, each with a note 1, giving refs `1` and `1-2` with each citation on its own note; blank markers and a blank anchor text decoding as links; a plain ordered list staying a list; and `htmlConformance.spec.ts` green. Then a case in a new `apps/www/tests/browser/footnote-paste.spec.ts` on `/blocks/playground-demo`: it serves step 2.3's gfm fixture at `https://github.com/o/r` through Playwright's `page.route`, so the copy resolves its hrefs against a GitHub URL, selects it, copies it with the native clipboard and pastes it into a root paragraph, and sees footnote references, not links, and definitions with GitHub's numbers. It runs in Chromium five warm runs through `proof.mjs`, because only Chromium exposes clipboard permissions to automation. Done: red at `HEAD` in `docs/plans/artifacts/2026-10-17-footnote-review/p2-red-html-a1.log`, green in `docs/plans/artifacts/2026-10-17-footnote-review/p2-green-a1.log`; the native copy passed five warm Chromium runs, `docs/plans/artifacts/2026-10-17-footnote-review/p2-paste-chromium-a11.log` through `p2-paste-chromium-a15.log`.
- [x] 2.4 In the copied `footnote-static.tsx`, draw the reference as a `sup` holding an anchor with `data-editor-footnote-ref`, `href="#<target>"`, `id` and the text `[ref]`. Draw the definition as a `div` with `data-editor-footnote-definition` and `id`, its label in an element marked `data-editor-footnote-chrome`, its content, and for a canonical note one `data-editor-footnote-chrome` back link to its target with the copied item's accessibility label. Add footnote cases to `PlateStatic.reuse-oracle.spec.tsx` with static components that draw `read.anchor`: a citation added after the notes, a citation added before every block, a note grown at the end and a duplicate added after the notes. Proof: a `renderStaticHtml` spec of the kit's static output with the exact anchors, and its HTML parsed back with the standard kit to the same footnotes, with no label or back-link text, red at base; the oracle cases green, and red with the first plan's drawing planted, which links a note back to every citation; and a case that neither footnote plugin's render config declares `readsDocument`, red with it planted. Static reuse never reads what a component draws, so that declaration alone decides M1, as `static-anchors-a2.log` shows, and the oracle cases keep M2's check that reused output equals a fresh render. Done: red at `HEAD` in `docs/plans/artifacts/2026-10-17-footnote-review/p2-red-static-a1.log`, green in `docs/plans/artifacts/2026-10-17-footnote-review/p2-green-a1.log`; the oracle case's render bound caught a planted `readsDocument` and its fresh-render check caught the first plan's drawing (`mutate/plant-reads-document-a1.log` and `mutate/plant-backlink-to-every-citation-a1.log`), so the bound stands in for a separate `readsDocument` case.
- [x] 2.5 Add `FootnoteReferenceDocx` and `FootnoteDefinitionDocx` to `DOCX_STATIC_COMPONENTS`, drawing today's label and note text with no links, and add `footnote` to the `docx/export` dependencies in `entrypoint-dag.mjs`. Proof: an `exportDocx.presentation.spec.tsx` case that exports a footnote document through the copied static kit and finds the label and note text and no `w:hyperlink`, green at base and on the change, beside a must-fail control with step 2.4's static item and the overrides removed through `mutate.mjs`, which finds a `w:hyperlink` whose anchor has no bookmark; `docx-export.spec.tsx` green; `pnpm check entrypoint-graph` green. Done: green in `docs/plans/artifacts/2026-10-17-footnote-review/p2-green-a1.log`, red with the overrides removed in `docs/plans/artifacts/2026-10-17-footnote-review/mutate/drop-footnote-docx-overrides-a1.log`, and the entrypoint graph in `docs/plans/artifacts/2026-10-17-footnote-review/p2-entrypoint-graph-a1.log`. The case draws step 2.4's links through its own stand-in presentation, because a package spec cannot import the copied kit, so it has no base run.

### Phase 3. Pasted notes land at the end

Keep it when steps 3.1 and 3.2 pass with Footnote installed before and after Table, step 3.3's work count passes, and its timing line does not conclusively miss. An inconclusive timing run keeps the phase on the work count alone, and the Close claims no timing result. A conclusive miss on the timing line sends the end-matter landing back to `architect`. Revert the phase when a step 3.1 or 3.2 case fails. Phases 1 and 2 do not depend on it.

- [ ] 3.1 In Plite, add `endMatter?: boolean` to `SchemaElementSlicePolicy` (`packages/plitejs/src/interfaces/schema.ts:384`), and `endMatter: boolean`, default `false`, to `EditorElementSlicePolicy` and the compiled element's `slice`. The schema compiler accepts the key beside `preserveContext` (`schema-compiler.ts:1089`), refuses it on an inline or void element and beside `preserveContext`, and writes it into the schema contract only where an element declares it, as it does for a property's `landing`. A new internal module, `packages/plitejs/src/core/slice-end-matter.ts`, holds two pure functions over a `ContentSlice` and the compiled policy. Both return their input when no installed element declares `endMatter`. `dissolveOpenEndMatter` replaces each end-matter element on an open edge with its children and lowers that edge's open depth by one for each wrapper it drops. An element at spine depth `d` is on an open edge when it lies on the first-child chain with `openStart >= d`, or on the last-child chain with `openEnd >= d`. `splitEndMatter` takes every end-matter element out of one slice in source pre-order, a nested one right after the one that holds it, and returns `{ endMatter, flow }`. It reads no openness. Every paste entry dissolves open end matter before each of its length cuts, as step 3.2 says, so every end-matter element the split meets was closed in its source, even one the cut truncated and left at an open end. When it removes an element on an open edge, that edge's open depth drops to the element's depth minus one, as the dissolve repairs depth. A container that a removal empties stays in the flow, and content completion gives it its default child. For the `copy` lifecycle only, `getContentSlice` first closes each edge at an end-matter element on it that the range covers from the element's start point to its end point, and lowers that edge's open depth to the element's depth minus one. Then it calls `dissolveOpenEndMatter` after `omitOpenBoundaryRoots`. So `read.slice.get` and `read.slice.export` of words inside a note give the words without the note, a select-all copy keeps its last note, and a text move keeps the slice it removes, which the transfer guard compares against (`transfer.ts:460-470`). `BaseFootnoteDefinitionPlugin`'s schema declares `slice: { endMatter: true }`. Proof: a `slice-end-matter.spec.ts` beside the module, over a generic `endnote` schema that names no footnote, with cases for a closed and an open edge at each depth, mixed edges, nested end matter, pre-order output, an emptied container, depth repair for both functions, a truncated closed endnote left at an open end that the split takes out and whose removal closes that edge, the input returned unchanged when nothing declares end matter, and the compiler's refusals. A schema with no `endMatter` compiles to the same contract and fingerprint as at base, which `proof-worktree.mjs` checks against `HEAD`, because a `false` written into the contract would change every editor's fingerprint (`schema-compiler.ts:4869`, `5462`). Then `BaseFootnotePlugin.spec.ts` cases: an export of words selected inside a note gives the words with no definition, red at base, where the export keeps the definition open on both edges (`docs/plans/artifacts/2026-10-17-footnote-review/endmatter-premises-a1.log`); an export of a selection from body text through the end of a note keeps the whole note, closed; and a select-all, cut and paste of a document that ends with a note, without `TrailingBlockPlugin`, keeps the note and its citations.
- [ ] 3.2 In `public-state.ts`, add one internal landing step, `landSlice`. `fitSliceAtSite` (`public-state.ts:4117`) and `fitSliceIntoActiveDraft` (`4211`) call it on the slice they write, after its roots are remapped and it is cut to the site's budget. Before each length cut, the paste entries dissolve the end matter still open on an edge: `planPaste` before both of its cuts (`slice-landing.ts:46`, `73`), so a landing read's output is dissolved too, and `fitSliceIntoActiveDraft` before its one (`public-state.ts:4234`). When the split finds no end matter, it writes the flow as today. Otherwise it first writes the end matter as one closed slice at the boundary after the root's last child that is not an empty default block. A document in EditorKit ends with the empty paragraph `TrailingBlockPlugin` keeps (`TrailingBlockPlugin.ts:28-58`), so a note appended after it would leave an empty paragraph between every two pasted notes. That write goes through `writeSliceAtRange` with a new internal `selection: 'keep'` option, which maps the selection through the insert instead of moving it to the fitter's caret; today that caret lands in the inserted note (`endmatter-premises-a1.log`). Then it writes the flow at the site, which sets the caret. Both writes share one root preparation, and the second passes `rootsPrepared`, so the second write does not prune the first write's content roots (`public-state.ts:3941-3955`). When the root's content does not accept each end-matter element as a direct child, it writes the whole slice at the site with its open end matter dissolved, which is today's landing. It checks that before any write, because the fitter can succeed by wrapping an element the root does not take directly (`compiled-slice-fitter.ts:838-855`). A collapsed site with an empty flow writes only the end matter and keeps the caret, and an expanded one deletes its selection as an empty paste does. A site that selects whole blocks deletes them, so a lone note pasted over a selected note leaves no empty note behind (`public-state.ts:4084-4093`). The step never cuts the slice again. Drops skip both the entry dissolve and the landing, through one new internal flag that only the drop paths set, because `landing` already means "report the landed range" (`public-state.ts:4140-4146`). Text drops reach `planPaste` and `fitSliceAtSite` through `writePaste` (`transfer.ts:816-826`), and block drops reach `fitSliceIntoActiveDraft` through `replaceSliceAtBlockBoundary` (`transfer.ts:899`). A block move inside one root reaches neither, because it moves the node itself (`transfer.ts:455-457`). So a dragged note lands where it is dropped, the footnote veto keeps judging block drops, and both drop guards keep reading one landed range. `fitSlicePlacements`' root survival walk (`public-state.ts:4438-4462`) also walks the end matter its placements landed, so a content root owned by an object inside a pasted note is kept. In Table's prepared paste (`BaseTablePlugin.ts:2635-2667`), both planners, the fitted one and the expanding one, name their anchor and focus cells, and after the fill Table takes their first and last text points from the cells' children. Today `paste.ts:405-434` and `pointForPlacement` (`paste.ts:763-790`) compute those points before fitting, so a last cell that ends with a note puts the focus inside the note (`endmatter-premises-a1.log`). The selection keeps today's shape. A fill of several cells gets the node selection, and a fill of one cell selects its text from start to end, as today (`round3-a1.log`). Suggested task `t_c0e884d9` asks whether a one-cell fill should leave a caret instead. The promise that a note already canonical stays canonical covers the notes the paste does not replace. Proof: generic Plite cases in one test file over the `endnote` schema, through `fragment.replace`, `slice.replace`, `tx.slice.replace`, a paste over a selected block and a paste into an empty block, plus a lone endnote pasted over a selected endnote, a root that accepts the endnote only inside a container, which falls back to the site, and a document ending with empty default blocks, where the endnote lands before them. Then `BaseFootnotePlugin.spec.ts` cases, red at base through `proof-worktree.mjs --with --expect-fail` and green on the change, with Footnote installed before and after Table:
  - A paste with the caret in a table cell, a quote, a list item and a root paragraph in the middle of the document puts each pasted definition after every block that was there, before the empty paragraph `TrailingBlockPlugin` keeps when it is installed, and keeps the caret after the pasted text. One undo restores the document and the caret, redo reapplies the paste, and a second undo restores it again without throwing.
  - A selection over two table cells puts each cell's copy of the note at the root end, and Table's cell selection stands.
  - A pasted table that holds a definition, beside text in a cell and alone at the end of its last cell, puts the definition at the root end, and the selection's focus lands at the end of the last cell's text, outside the note, through the fitted planner and through a pasted table larger than the target, which runs the expanding one.
  - A pasted `quote(quote(definition FIRST), definition SECOND)` of one ref keeps FIRST canonical, and a root definition of that ref already in the document stays canonical.
  - Words copied from inside a note paste as words into the body, into a table cell, over two table cells and into the same note, and add no note. A copy from body text into a note, pasted at `ab|cd` in a cell, leaves `cd` in the cell.
  - A saved nested definition stays where it is on load, while typing in it, on a split and a join inside it, and on undo and redo.
  - A block copy of a root definition dropped between root blocks lands it where it is dropped, red with the drop flag removed. A text drop that carries a whole note lands it at the drop point. A text move from body text through the end of a note keeps the note's type and ref, as today (`round3-a1.log`). A text drag of words from inside a note into the body and into the same note lands the words.
  - Under `maxLength`, caps 8 to 14 give the same admitted text and the same result as the same paste with `endMatter` removed, for a paste into a cell and for a fill of two cells. An open slice pasted through `fragment.replace` whose cut ends inside a whole note lands that note at the root end with the flow's edge closed, so the site's trailing text stays at the site.
  - GitHub's footnote HTML pasted through the HTML paste path into a table cell lands its note at the root.
  - Two editors joined through Yjs: the author's paste into a cell reaches the peer as ordinary operations, and the peer's document equals the author's.

  Then step 2.3's `footnote-paste.spec.ts` gets a native paste of the same fixture into a table cell. It shows the reference in the cell, the note after every block that was there apart from the trailing empty paragraph, and the caret after the pasted text. One undo removes the paste and restores the caret, redo reapplies it, and a typed character then lands at the caret; history merges only text into text (`history-merge-policy.ts:376-384`), so undo comes before typing. It runs in Chromium five warm runs through `proof.mjs`.
- [ ] 3.3 Through `benchmark`, gate the landing on counted work, then rerun the timing line. The work count is a case in step 3.2's Plite test file, so `pnpm check` runs it. It spies on `getEditorSchema(editor).fit`, which every slice write calls once (`public-state.ts:3916`). It pastes the same 2,000 blocks with 200 notes and with none, and fills two cells with and without a note. The paste with notes must call `fit` exactly once more for each placement that carries end matter than the same paste without notes. The paste without notes must call it as often as the same paste on a schema that declares no `endMatter`. A planted second end-matter write must fail the case. The pre-acceptance probe put one split walk at about 1/2,400 of a paste, so the second write is the cost that could breach the budget, and this count bounds it. Then rerun the timing line frozen in `docs/plans/artifacts/2026-10-17-footnote-review/endmatter-timing.config.json` on the final code. A 2,000-block paste, once with 200 notes and once with none, takes at most 1.1 times the same paste at the plan's base commit, judged by `paired-timing.mjs` with a planted arm that repeats the split four times per block and a same-code arm. The arms paste through `editor.update.fragment.replace`, the base arm in a `proof-worktree.mjs` worktree at the base commit and the others in this checkout. The pre-acceptance run on a prototype split was inconclusive, because the host's load reached 66 on 18 cores and the same-code noise reached 0.58, while the planted arm missed at 4.2 and 2.3 times (`endmatter-timing-a2.log`), so the line is a gate. Its planted arm shows only that a slowdown of about two times is visible on this host. An inconclusive rerun, exit 3, leaves the line open. The Close then claims no timing result, and a rerun on a quieter host goes to a suggested task, as the Time budget rule says. A conclusive miss sends the end-matter landing back to `architect`, and `benchmark-checklist` runs before any `verified` row.

### Docs, release and proof

These ship with whichever phases are kept.

- [ ] 4.1 Through `plate-docs`, update `content/docs/(plugins)/(elements)/footnote.mdx`: the navigation section's read-only behavior and return values, a `read.anchor` API entry, the removal of the three reads, HTML export and GitHub paste, static and Word output, that a pasted definition lands at the end of the document while one already saved inside another block stays there, and that words copied from inside a note copy as words. The page has no Chinese twin, so `/cn/docs/footnote` serves the English page. Proof: the docs source and parity checks, and a hand drive of the page.
- [ ] 4.2 Through `plate-docs`, update `content/docs/(plugins)/(serializing)/html.mdx` and `html.cn.mdx` where they list what encodes and what paste reads. Proof: the docs checks, and a hand drive of both locales.
- [ ] 4.3 Through `plate-docs`, add `slice.endMatter` beside `preserveContext` in `content/docs/plite/concepts/19-schema.mdx`: what a paste does with a closed copy, what a copy does with words inside one and with one it covers whole, that drops skip the landing, that the field enters the schema fingerprint, and that nodes already in the document never move. The page has no Chinese twin. Proof: the docs checks, and a hand drive of the page.
- [ ] 4.4 Reconcile `docs/editor-behavior/markdown-editing-spec.md`'s footnote Plugin surface list (line 3482) with the final reads, the read-only jump and pasted notes landing at the end. Proof: `teaching-sweep.mjs` in step 4.8 shows no live hit there.
- [ ] 4.5 Point the search fixtures in `apps/www/src/lib/search-result-groups.test.ts:31` and `apps/www/src/app/api/search/route.test.ts:57` at a surviving footnote read. Proof: both tests green.
- [ ] 4.6 Through `changeset`, add a `platejs` changeset for `read.anchor`, the read-only jump's `true`, the three removed reads, HTML export and GitHub paste, Word output, pasted notes landing at the end, a pasted table's selection ending outside a note, and the schema fingerprint change, naming the versioned document migration a saved Yjs room or history needs; a `plitejs` changeset for `slice.endMatter`, for words copied from inside an end-matter element copying as words, and for a copy that covers one whole keeping it; a separate `plitejs` changeset for focus that moves between two controls inside the editor staying on the second one; and a registry changelog entry for the copied `footnote` gestures, picker focus and static anchors. Proof: `pnpm changeset status` and the registry changelog check.
- [ ] 4.7 Run `pnpm --filter www build:registry` and `pnpm --filter www editor:generate`, which rewrites `plugins.schema.json` with the definition's `endMatter`, and regenerate `apps/www/src/generated/api-reference-manifest.json` in a `proof-worktree.mjs --install` worktree that builds `plitejs` and `platejs` first. Proof: the regenerated `footnote` registry files read back with the new static source, `pnpm --filter www editor:check`, `pnpm --filter www api-reference --check`, and `pnpm test:manifests`.
- [ ] 4.8 Through `best-api repair`, add `slice.endMatter` to `docs/vision/plite.md`'s paste paragraph (lines 619-628). The paragraph names it as an exception to "raw transaction replacement does not run command policy" and to "a block lands wherever the compiled schema places it". End matter is schema policy, so every slice write except a drop and detached `fitContent` lands a declared end-matter element at the root end, a raw `tx.slice.replace` included. Then run `node tooling/scripts/teaching-sweep.mjs duplicateDefinitions hasDuplicateDefinitions duplicateRefs`, and search the plans and agent instructions for the read-only `false` promise; fix each live hit this task owns and flag the rest on the page. Proof: the sweep log with no live hit.
- [ ] 4.9 Through `verify`, run `node tooling/scripts/hand-drive.mjs scope` on the changed files, drive every cell it lists, and run its `check`; then `pnpm lint:fix` on the task's paths only, as the last check that edits code. Proof: the `check` log and the lint log.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-10-17-footnote-review.md` | pending |
| Selected pack closure | yes | Close `performance-observability` with step 2.4's production rerun, step 2.2's export scaling line, and step 3.3's work count and timing line | pending |
| Package proof | yes | Steps 2.1, 1.1, 2.2, 2.3, 2.5, 3.1 and 3.2 specs, the platejs and plitejs typechecks and `htmlConformance.spec.ts` | pending |
| Package boundary proof | yes | `pnpm test:manifests`, `pnpm check entrypoint-graph` and scoped lint | pending |
| Scale proof | yes | Step 2.2's export scaling line, step 3.3's work count and its timing line on the final bytes, step 2.4's `readsDocument` case and the oracle cases | pending |
| Registry/browser proof | yes | The Playwright specs of steps 1.2 and 3.2, and step 4.9's hand drive | pending |
| Docs/release proof | yes | Steps 4.1, 4.2, 4.3, 4.6 and 4.7 | pending |
| Writing passes | yes | `deslop` and `no-comments` on product code, `unslop` on prose | pending |
| Diff panel (reviews: api-build) | yes | A panel on the build's diff | pending |
| Blast radius | yes | `pstack:blast-radius` on the public API change before code moves | `docs/plans/artifacts/2026-10-17-footnote-review/blast-radius.md` |
| Slice review (`thermos`) | no | skip: the `api-build` panel already reviews the build's diff with both lenses | skip: api-build panel owed |
| Slice freezes | yes | `freeze.mjs` after each phase's fixes, each with `--parent` of the one before | pending |
| `pnpm check` steps | yes | The typechecks, entrypoint graph and audits the edits reach, before each browser matrix and the timing rerun | pending |
| Oxlint before the panel | yes | `pnpm exec oxlint --type-aware --format=default` on the task's lintable files, without fixing, file count matched | pending |
| Public API repair | yes | Step 4.8's `best-api repair` and teaching sweep | pending |
| Docs coverage | yes | `plate-docs` with its example coverage audit on the footnote and Plite schema pages | pending |
| Hand drive | yes | `node tooling/scripts/hand-drive.mjs check <the plan's files>` after the last edit and `pnpm lint:task` | pending |
| Playtest | no | skip: `playtest.mjs scope` names no scenario catalog for the footnote files, and the build adds no new editor feature | skip: no catalog |

## Proof

Each step's proof is named on its box. The close adds the hand drive across every page `hand-drive.mjs scope` lists, step 2.4's production rerun, step 3.3's timing gate, the diff panel and the decision-trail review.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What happens next | Build this plan | Stop at this plan | hold | big |
| A jump in a read-only view | Scroll to the target and flash it, and leave the caret alone | Keep doing nothing in read-only views | keep refusal | big |
| The three test-only duplicate reads | Remove them in this plan (look) | Keep them | keep reads | small |
| Focus after a read-only jump | The target's own jump button, so Enter jumps back | Focus stays on the mark you clicked | focus stays | small |
| HTML footnote markup | GitHub-style links tagged with Plate's own attributes, and GitHub's own markup still pastes | Copy GitHub's exact attributes | github markers | small |
| Notes pasted into a cell, a quote or mid-document | Land after the document's last block | Land where the caret is | leave nested | small |
| A note an old paste left inside a table or a quote | Stays where it is | Moves to the end on its next edit, which breaks undo of that edit | move saved | small |
| Copying words from inside a note | Copies only the words | Copies the whole note with its back link, as today | copy note | small |
| Whether the end-of-document rule counts as a schema change (look) | It does, as a property's drop landing and a block's own exit do, so every saved collaboration room and history made with footnote notes refuses this version until the app migrates it | It doesn't, so saved rooms keep working; old and new clients place a pasted note differently, which is harmless because peers receive ordinary edits | no contract | big |
| Dragging a note | Lands where it is dropped, as today | Moves to the end like a paste | drag to end | detail |
| A table pasted into one cell (look) | Selects the pasted text, as today, and a suggested task decides | Leave the caret after it, a few lines in Table's prepared paste that step 3.2 already edits | caret after table | small |
| Footnotes in Word | Plain text, as today, with no jump links | Jump links through Word bookmarks, a bigger Word change | word links | small |
| Back links on static pages and in HTML | One, to the first mark | One per mark, which redraws every note on each later edit | every mark | small |
| A mark with no note on a static page | Links to where the note would be | No link | no link | detail |
| Labels of notes pasted from GitHub | The number GitHub shows, so a note labeled with a word there pastes as a number | The label from GitHub's ids, which in a comment end with a hash that changes on every render | github labels | detail |
| Where the review lives | One footnote subject page | A one-off page | one-off | detail |

## Open work

- Pasted notes whose ref matches a note already in the document cite the existing note, and the pasted note shows as a duplicate. Markdown and Plate paste do the same today, and GitHub numbers its notes from 1, so GitHub paste meets it often. Giving them fresh refs needs a paste stage that sees the slice and the document before Table fills cells, which Plite does not have (`editor-commands.ts:542` lists no command above `replaceSlice`). Owner: the owner. Tracked: a suggested task offered at this run's close. Stop: that task lands or is dropped.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- The user job is to cite a source in the text and keep the note at the end of the document, then let anyone reading move between the mark and the note, in an editable view, a read-only view, a static page and exported HTML.
- References and definitions pair through the stored `ref`. Runtime node keys never persist ([plate.md](../vision/plate.md), the persisted identity paragraph).
- Definitions stay root-level end matter. Duplicate refs are kept and flagged, and the first definition is canonical (the 2026-10-04 audit's requirements, unchanged).
- A paste's landing is command policy that raw transaction replacement does not run, and fitting a slice to the schema runs on every write ([plite.md](../vision/plite.md), the paste paragraphs). The schema contract carries a paste policy only where an element or property declares one, as it does for `landing`.
- History replay runs corrections, so a correction that moves nodes cannot be undone exactly (`correction-r2-a1.log`).
- Arrival feedback uses one target and timer per mounted view and never changes the model, the selection or history. The requesting feature owns the styling and the navigation policy ([plate.md](../vision/plate.md), temporary arrival feedback).
- Explicit navigation scrolls are the last DOM write, and a feature scrolls a known target through `editor.api.dom.scrollIntoView` ([plite.md](../vision/plite.md), the DOM phase scheduler paragraph).
- Plite refuses every update from a read-only view, a selection move included. This run's probe threw `Cannot update a read-only editor view.` and left the editable view's caret in place.
- One plugin keeps all of its HTML matches in one mapping, and a whole-payload format reports what a paste leaves out ([plate.md](../vision/plate.md), the HTML mapping paragraphs).
- Exporting a live editor draws through the app's static kit ([plate.md](../vision/plate.md), the static presentation paragraph), so static anchors are the export's anchors.
- A projection survives only with a distinct current job ([common.md](../vision/common.md), Taste).
- Packages ship neutral defaults; the chip, the hover preview and when a click jumps are copied-UI policy ([VISION.md](../../VISION.md), Plate Essentials).

### Lanes

1. **Keep the current design. Loses.** Identity is sound, and it stays. But the probe shows HTML export failing on every footnote document, GitHub paste losing the pairing, static output without links, and readers in read-only views unable to jump.
2. **Change the jump and add HTML and static anchors. Wins.** `focusDefinition` and `focusReference` keep their names and their editable behavior. In a read-only view they resolve the target through `read`, scroll the calling view and flash it, as copied TOC does (`apps/www/src/registry/components/editor/toc.tsx:79-105`), with no update. Both plugins get one HTML mapping each, and the static item draws the same ids through one new read. Design above holds the architect's final shape.
3. **Select the target in every view, read-only included. Loses.** It would be one code path, and Lexical's example does it. Plite refuses the update, and the 2026-10-17 probe confirms it. Writing from a read-only view would also move the caret of an editable view of the same document, which Details already works around (`packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts:225-229`).
4. **Delete the package jump and let copied UI compose it, as TOC does. Loses.** It deletes two methods. But the editable jump has a real ordering law: commit the selection, focus, scroll last, then flash, in the calling view. Its spec pins that law (`packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx:74-111`), and every custom footnote UI would have to rebuild it. TOC has no selection, so its copy is two calls.
5. **A shared reveal helper on `NavigationFeedbackPlugin` for TOC, footnotes and Find. Loses.** It adds a public noun for a two-call composition, and Vision gives each requesting feature its own navigation policy.
6. **A named end-matter root for definitions. Loses**, as in 2026-10-04. The transfer veto refuses drops into blocks, and phase 3's end-matter landing puts every pasted definition at the root. A second root adds mounting, cross-root jumps and conversion work.
7. **Strongest deletion inside the scope: cut `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs`. Wins, as a small part of lane 2.** No production code calls them. Only docs, the plugin spec and mocks in `footnote.slow.tsx` name them, and each is one line over `definitions({ ref })`. Vision names no job for them, and `isDuplicateDefinition` serves the copied duplicate warning. The predicted benefit is three fewer public reads to learn and document, with no runtime change. The plan's Close marks that prediction held or falsified.

**Proof limits.** The HTML, paste and static claims come from probes on source at `4f880fc570`, whose footnote, HTML, static and DOCX paths `8f5afd571d` does not change: `footnote-html-a1.log`, `cell-paste-a3.log`, `premises-a5.log` and `static-reuse-a1.log` in `docs/plans/artifacts/2026-10-17-footnote-review/`. After the first panel, `correction-a4.log`, `html-chrome-a1.log` and `static-anchors-a2.log` in the same folder ran on source at `4bff0981dc`, whose footnote, HTML, static and table paths match `8f5afd571d`; they test prototypes in probe files, not the planned build. The read-only claim comes from one two-view jsdom probe, `readonly-selection-a1.log` in the same folder. The base controls ran at `8f5afd571d` under happy-dom (`base-controls-a1.log`). No browser ran. The editor comparison is a source read by a Codex seat, `editors-answer.md` in that folder, which ran nothing. GitHub's markup comes from `gh api markdown` in both modes (`github-fixtures/` in the same folder); a browser's copy of a rendered GitHub page is tested only by step 2.3's Chromium case, and Firefox's copy is inferred to resolve URLs the same way, not run. After the second panel, `correction-r2-a1.log` ran on `packages/platejs` source at `db38b40203`, and `endmatter-premises-a1.log` and `endmatter-timing-a2.log` ran on this checkout at `c5921381cf` while other sessions held uncommitted edits to `BaseTablePlugin.ts` and `table/lib/internal/selection.ts`. The prepared-caret premise reads `paste.ts`, which those edits do not touch, and step 3.2's red-at-base cases rerun it at the build's base. The timing probe tested a prototype split in a probe file, not the planned build. The judge's source checks ran at `c5921381cf` too. DOCX footnote import stays out of this target.

### Dependents

- `react`: affected. `packages/platejs/src/react/features/footnote/FootnotePlugin.tsx` holds both jump commands that change.
- `ui`: affected. `apps/www/src/registry/components/editor/plugins-static.ts` composes `BaseFootnoteKit`, whose static renderers change, and `apps/www/src/registry/components/editor/plugins.ts` composes `FootnoteKit`, whose chip learns a plain-click jump in read-only views.
- `table`: affected. `packages/platejs/src/features/table/lib/BaseTablePlugin.ts`'s prepared paste takes its caret from the cells it filled, and step 3.2 runs both install orders and a multi-cell paste, because Table also wraps `replaceSlice`.
- `basic`, `callout`, `canvas`, `code`, `date`, `link`, `math`, `media`, `slash` and `toc`: unaffected. They reach this scope through `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` and `apps/www/src/registry/components/editor/slash.tsx`, which only check `installed` and call `insert`, and neither changes. `link` also meets the reference mapping on paste, which falls through to Link for any anchor that names no footnote.
- `distribution` and `editing`: unaffected. They reach this scope only through `packages/platejs/src/utils/plate-keys.ts`, a member that holds the shared `PLUGINS` names, which do not change.

### History

- This review retains [2026-10-04-footnote-audit](../research/review-records/2026-10-04-footnote-audit.json), because its Pursue, its rejected end-matter root and its rejected schema-level uniqueness still hold; it adds the measured HTML, read-only and paste evidence, and the cut of the three unused reads.
- This review retains 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit, because its removal of duplicate target subscriptions from the copied footnote UI still holds.
- [2026-04-04-footnote-support](2026-04-04-footnote-support.md), [2026-04-04-footnote-sync-architecture](2026-04-04-footnote-sync-architecture.md) and [2026-07-12-plate-next-footnote-indent-juice-package-reviews](2026-07-12-plate-next-footnote-indent-juice-package-reviews.md): historical. The registry and first-definition-canonical design they built is the current one.
- Member changes since 2026-10-04, read with `git log`: `0dfa19ab11` and `209e00b948` touch the copied chip's combobox return and selection mode, `002891202b` extends the veto to side wraps, and `422564e6f6` adds `txLocate` and `txSelection` markers and the Markdown paragraph type. None changes navigation or conversion.
- External checkouts read: `../milkdown` at `6a4db480b00db8dd0322b517117dfa2154f3e2e2`, `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../prosemirror-website` at `a16b4ece45f135e5f001ab59d25f2d43c25974e1`, `../ckeditor5` at `14e73cc31b869ce483bd8449f40b9102ac7746da`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../BlockNote` at `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163`, `../slate` at `945a484df2497e4c448b33f417b0de2a49840032` and `../micromark` at `6577c200155e9c6b85a42b26d298f8affc348f2f`.
