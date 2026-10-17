---
review_scopes: [footnote]
verdict: pursue
review_basis: [2026-10-04-footnote-audit]
work_kind: implementation
review_commit: 4f880fc5702db166a0e92e8f8b15d5ab9fa26b0c
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/research/review-records/2026-10-04-footnote-audit.json, packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts, packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts, packages/platejs/src/react/features/footnote/FootnotePlugin.tsx, packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx, packages/platejs/src/features/link/lib/BaseLinkPlugin.ts, packages/platejs/src/lib/plugins/html/HtmlPlugin.ts, packages/platejs/src/html/index.ts, packages/platejs/src/html/htmlConformance.spec.ts, packages/platejs/src/static/renderStaticHtml.tsx, packages/platejs/src/static/components/PlateStatic.reuse-oracle.spec.tsx, packages/platejs/src/docx/export/lib/docxStaticComponents.tsx, packages/platejs/src/docx/export/lib/exportDocx.presentation.spec.tsx, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/plitejs/src/react/components/editable.tsx, tooling/entrypoints/entrypoint-dag.mjs, apps/www/src/registry/components/editor/footnote.tsx, apps/www/src/registry/components/editor/footnote-static.tsx, apps/www/src/registry/components/editor/footnote.navigation.spec.tsx, apps/www/src/registry/components/editor/footnote.slow.tsx, apps/www/src/registry/components/editor/docx-export.spec.tsx, apps/www/src/registry/components/editor/toc.tsx, apps/www/src/registry/components/editor/insert-toolbar-button.tsx, apps/www/src/registry/components/editor/slash.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/components/editor/plugins-static.ts, 'content/docs/(plugins)/(elements)/footnote.mdx', 'content/docs/(plugins)/(serializing)/html.mdx', 'content/docs/(plugins)/(serializing)/html.cn.mdx', docs/editor-behavior/markdown-editing-spec.md]
review_upstreams: ['../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../micromark@6577c200155e9c6b85a42b26d298f8affc348f2f']
---

# Footnotes: jump in read-only views and keep the link in HTML

Status: planning: round 2 found the paste correction unworkable; architect on paste placement is next
Playbook: plan

**Pursue, and this plan builds it.** The verdict measured four failures. Serializing any document with a footnote to HTML fails by default, GitHub's footnote HTML pastes as plain links, static pages print `[1]` with no anchor, and both jump commands return `false` in a read-only view because Plite refuses every update there. Planning found a fifth: a definition pasted with the caret in a table cell or a quote lands inside it, because paste runs no transfer veto (`docs/plans/artifacts/2026-10-17-footnote-review/cell-paste-a3.log`). The plan keeps the stored shape. It adds one read, `read.anchor({ path })`, which gives each footnote element its fragment id and the id it links to. It also adds one HTML mapping per footnote plugin, anchors in the copied static item, a read-only branch in the jump, Word overrides that keep footnotes as plain text, and a correction that moves any definition found inside another block to the end of the document. It cuts three reads that only tests call. `architect` picked the target from three runners, the first plan panel replaced its paste wrapper and its static back links, and the probes below tested each premise the plan rests on.

## Brief

### What will change?

In a read-only view, clicking a footnote mark takes you to its note, and back. HTML export, GitHub paste, static pages and Word export keep footnotes, and pasted notes always go to the end of the document.

### What could go wrong?

Read-only jumps now return true. Three test-only reads are gone. Static and HTML notes link back only to the first mark. A note an old paste nested in a table moves to the end on its next split or join.

## Teach

A footnote is a small mark in the text that points to a note at the end of the document. Both carry the same label, and the editor pairs them by it.

Today the jump moves the caret to the target and flashes it. A read-only view refuses any caret move, so the jump does nothing there. HTML has no footnote rule, so export fails and paste from GitHub gives plain links. Static pages print the label with no link.

The stored shape doesn't change. In a read-only view the jump just scrolls and flashes, like the table of contents. HTML export, static pages and GitHub paste all use a link pair like GitHub's, so you can go from a mark to its note and back to the first mark. A note that lands inside another block, from a paste or anything else, moves to the end, and Word keeps showing notes as plain text.

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
| Definitions at the root | Plate | `platejs/footnote`: a `corrections` entry on `BaseFootnoteDefinitionPlugin` | An invariant every operation must keep is repaired in its smallest correction owner ([plite.md](../vision/plite.md), the transactions paragraph); the transfer veto keeps refusing drops into blocks |

No entrypoint is added. `footnote` keeps its one dependency, `combobox` (`tooling/entrypoints/entrypoint-dag.mjs:89`). `docx/export` (`entrypoint-dag.mjs:284`) adds `footnote` to its dependencies, because its overrides key on the footnote plugins, as they do for Callout, Code block, Column, Equation, Heading and TOC.

## Hard cuts and app migration

Deleted:

- `editor.read.footnote.duplicateDefinitions`, `editor.read.footnote.hasDuplicateDefinitions` and `editor.read.footnote.duplicateRefs`.

Callers that break, from `git grep` over live source, docs and generated output; the build reruns `pstack:blast-radius` before the cut:

- `packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.spec.ts:121-127, 245-246, 287-290, 345-346`.
- `apps/www/src/registry/components/editor/footnote.slow.tsx`, eleven `hasDuplicateDefinitions` mocks (lines 25 to 803).
- `apps/www/src/lib/search-result-groups.test.ts:31` and `apps/www/src/app/api/search/route.test.ts:57`, which use the names as search fixtures.
- `content/docs/(plugins)/(elements)/footnote.mdx:341-386` and the Plugin surface list in `docs/editor-behavior/markdown-editing-spec.md:3477`.
- Generated: `apps/www/src/generated/api-reference-manifest.json` and `apps/www/public/r/footnote-docs.json`.

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
- A definition pasted into a container lands at the end of the document. A definition already saved inside a container stays there on load and while you type in it, and moves to the end once its own blocks are split, joined, inserted or removed.
- Apps that copied `footnote` and `footnote-static` keep the old static drawing and gestures until they copy the new version; the registry changelog entry says what changed.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Click a footnote mark in a read-only view | The note's start scrolls into view and the note flashes; the caret and history stay; focus moves to the note's back link without a second scroll | step 2.1 jsdom spec; step 2.2 Playwright spec on `/blocks/footnote-demo` in Viewing mode with the note below the fold, Chromium five warm runs, Firefox and WebKit once |
| Click a back link in a read-only view | The citation scrolls into view and flashes; focus moves to the mark | same |
| A back link of a note cited several times, in a read-only view | Opens the picker with focus inside it; arrow keys pick a citation and Enter jumps to it | same |
| Enter on a focused mark or back link in a read-only view | Jumps, or opens the picker, as a click does | step 2.2 Playwright spec |
| Unresolved mark in a read-only view | Nothing happens and no create action shows | step 2.2 jsdom and Playwright specs |
| Jump in an editable view | Unchanged: Mod+click on the mark and a click on the back link move the caret, focus, scroll and flash | existing `FootnotePlugin.spec.tsx:74-111` and `footnote.navigation.spec.tsx`, rerun |
| A read-only view jumps beside an editable view of the same editor | The editable view's caret and focus stay, and focus lands on the target's control in the read-only view | step 2.1 and step 2.2 two-view jsdom specs |
| Paste a note into a table cell, a quote or a list item | The text lands at the caret, the notes land at the end of the document, the caret stays after the pasted text, one undo restores the document | step 4.1 spec through `editor.update.fragment.replace`; step 4.1 Chromium native paste of GitHub-rendered HTML into a table cell on `/blocks/playground-demo` |
| Paste over several table cells | Each cell gets the text, and each cell's copy of the note moves to the end, where the later copies show as duplicates | step 4.1 spec |
| Copy words from inside a note and paste them | The words land at the caret and no new note appears | step 4.1 spec |
| Copy from a static page and paste into the editor | The marks and notes come back as footnotes, without the label or the back link | step 3.3 spec on `renderStaticHtml` output |

## Main changes

- One pure function builds a path-keyed id index from a document's children, memoized per children array in a `WeakMap` that holds one index per pair of element types. `read.anchor` calls it with `state.children()` and the HTML encoders with the encode context's `document.children`, so a static page and exported HTML agree on ids and one export indexes the document once. The live editor's copied UI never calls it, so typing does no new work.
- Every id depends only on nodes before it. A citation counts the earlier citations of its ref, and a definition the earlier definitions. A canonical note links back to `fnref-<enc>`, the first citation's id, which no later change can alter. So static reuse, which keeps a block while it and every block before it are unchanged, stays exact without `readsDocument`.
- A correction on `BaseFootnoteDefinitionPlugin`, on the `children` event, moves a definition that is not a root child to the end of the document. Plite runs it in the same transaction as the change that put the definition there, whatever command made that change, so it does not depend on plugin order.
- Each footnote mapping's `prepareDocument` rewrites GitHub's markup and strips Plate's presentation markup in the inert document before decode. The definition mapping runs at priority 70, before Indent (60) and List (50), so GitHub's footnote list items become definitions before List flattens them.
- The DOCX export draws footnotes through its own overrides, the label and the note text with no links, which is what Word shows today.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read-only jump | Returns `false`; Plite refuses the selection write | Scroll to the point the editable jump scrolls to, flash the target, return `true`; no update, no `dom.focus` | `FootnotePlugin` | Readers need the jump; TOC already scrolls and flashes without a write (`toc.tsx:79-105`) | Docs navigation section, changeset | Step 2.1 spec, step 2.2 browser spec | App code that read `false` as read-only | rearchitect |
| Read-only gestures | Plain click does nothing; Mod+mousedown calls a jump that returns `false` | Plain click and Enter jump; the picker takes focus; focus moves to the target's jump control after `true` | Copied `footnote.tsx` | Gestures and focus are copied-UI policy | Registry changelog | Step 2.2 specs | A custom copy keeps the old gestures | rearchitect |
| Fragment ids | None | `read.anchor({ path })` returns `{ id, target? }`, every id counting only earlier nodes, the ref percent-encoded as WTF-8 | `BaseFootnotePlugin` read | One owner for ids that static and HTML share | Copied static item, HTML encoders, docs | Step 3.1 spec | None known | keep (new) |
| HTML mapping | None; export fails, paste gives links | One mapping per plugin with `data-editor-footnote-*` markers and one back link per canonical note marked as presentation | Both footnote plugins | Export must succeed on footnote documents | HTML docs | Step 3.2 spec, `htmlConformance.spec.ts` | Link paste precedence; GitHub variants | keep (new) |
| Preparation | None | Each mapping's `prepareDocument` turns GitHub's markup into Plate's markers, drops GitHub's label heading and back links and Plate's presentation markup, and unwraps the mark's `sup` | Both footnote plugins | One parse path for paste and `parseHtml` | None | `premises-a5.log`, `html-chrome-a1.log`, step 3.2 spec | The drop could count as source cleanup, which Vision gives to `DataTransferFormat` | keep (new) |
| Static anchors | `[ref]` text, no link | Links from `read.anchor`; a canonical note's label and back link marked as presentation | Copied `footnote-static.tsx` | Static pages and Word export draw through the static kit | Registry changelog | Step 3.3 spec | Two documents on one page share ids | rearchitect |
| Static reuse | Every block is reused while it and the blocks before it are unchanged | Unchanged; no footnote element reads later content | None | Earlier-only ids keep reuse exact (`static-anchors-a2.log`) | None | Pre-acceptance `static-anchors-a2.log`; production rerun in step 3.3 | A later change that makes an anchor read later content | gate |
| Word drawing | The static kit's label, no links | DOCX overrides draw the label and note text, no links | `DOCX_STATIC_COMPONENTS` | Word bookmarks exist only for headings, so static links would dangle | None | Step 3.4 spec and its must-fail control | None | keep (new) |
| Definitions at the root | A paste puts them inside cells and quotes | A correction moves any non-root definition to the end of the document in the same transaction | `BaseFootnoteDefinitionPlugin` corrections | Definitions are root end matter; the veto covers only transfers, and a paste wrapper misses Table's multi-cell path (`correction-a4.log`) | Docs | `correction-a4.log`, step 4.1 spec | A saved nested note moves on its first structural edit | rearchitect |
| Duplicate reads | `duplicateDefinitions`, `hasDuplicateDefinitions`, `duplicateRefs` | Deleted | `BaseFootnotePlugin` read | Each is one line over `definitions` and `refs`; only tests call them | Docs, mocks, fixtures | Step 1.1 redundancy case, then typecheck | Outside app callers | cut |

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
- A correction, not a paste wrapper, keeps definitions at the root. Plite's law repairs an invariant every operation must keep in its smallest correction owner, and a correction sees the result of every command, Table's multi-cell fill included. It runs on the `children` event, so typing inside a saved nested note does not move it; the first split or join inside it does.

Cases a losing candidate handles that the base drops, each made a graft or a named limit:

- Sol's DOCX bookmarks are a named limit. Word shows plain text, as today.
- Sol's `DataTransferFormat` for GitHub's label heading and back links is rejected. It cleans only clipboard paste, so `parseHtml` of GitHub HTML would still keep them.
- Sol's and Astra's package-owned focus with `tabindex` on note content is rejected. The copied item focuses its existing jump controls.
- Astra's flag that Table also wraps `replaceSlice` (`BaseTablePlugin.ts:2527`) is taken as step 4.1's both-orders and multi-cell cases.
- GitHub HTML wrapped in `div.markdown-body` or `article` becomes a step 3.2 fixture.
- Two documents on one page write the same ids. That is a named limit, and copied UI can prefix them.

Premises the base rests on, each run before the pick (`docs/plans/artifacts/2026-10-17-footnote-review/premises-a5.log`), or after the first panel (`correction-a4.log`, `html-chrome-a1.log` and `static-anchors-a2.log` in the same folder):

- A definition matcher with no tag at the reference's priority throws "equal priority and overlapping element candidates"; a `div` matcher at the same priority compiles.
- With the reference mapping at priority 10, Link (priority 0) decodes every anchor the footnote decoder declines.
- A definition prepare at priority 70 keeps a three-block GitHub note with a nested list; at 40, List's prepare runs first and the note loses its second paragraph and its list.
- A `children` correction that moves a non-root definition to the end lands it at the root from a single table cell, from a selection over two cells, from a pasted table that holds a note and from a quote, with the correction installed before or after Table. Words copied from inside a note paste as words. A saved nested note stays put on load and while typing, and moves on a split inside it; a `content` correction would move it on the first keystroke. Under `maxLength`, every cap from 8 to 14 gives the same document as a paste with no footnote owner.
- GitHub's renderer writes `user-content-fn-<label>` ids, adds a hash suffix to every id and `href` in `gfm` mode, and shows each note's position in the list as its citation's text, `1` for a note labeled `n` (`github-fixtures/`).
- Removing every `data-editor-footnote-chrome` element inside a definition, and unwrapping a `sup` that holds only a footnote anchor, parses static footnote HTML back to the note's content alone and a reference with no `script` mark. Without them the label and back link become paragraphs of the note, and the `sup` puts `script: 'sup'` on the reference's child.

The pre-acceptance probe for the earlier-only anchors froze two lines before any arm ran (`static-anchors-a2.log`): for every operation in every cohort, the candidate renders as many elements as base (M1), and its reused DOM equals a fresh render (M2). Both lines held in all four cohorts. Every operation rendered as many elements as base, such as 1 for a block appended after 2,000 notes, and the reused DOM matched a fresh render. The planted arm missed M1 as it must, rendering 21, 20 and 22 elements where base rendered 1, 2 and 2. The citation added before every block ran on the normal cohort only, as the frozen lines say, because the first attempt took about 150 s per arm on it and was stopped (`static-anchors-a1.log`). Timing moved both ways on a host at load 68 to 219 on 18 cores, so it decides nothing.

This plan reverses three claims from the verdict page. The transfer veto does not keep pasted definitions at the root; phase 4's correction does. `serializeHtml` writes Plate's `data-editor-footnote-*` markers and a back link marked as presentation, not GitHub's `data-footnote-ref`. The verdict did not mention Word; this plan keeps Word's plain text on purpose.

## Feature Manifest

Optional packs:

- `performance-observability`, for the static reuse row.

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
| API | yes | best-api lens in the verdict, then architect | `read.anchor` and `FootnoteAnchor`; the read-only jump result; the three cut reads | App authors and copied static UI | steps 1.1, 2.1 and 3.1 specs; the api-plan and api-build panels | planned: steps 1.1, 2.1, 3.1 |
| Package | yes | platejs | `BaseFootnotePlugin.ts` (anchor ids, HTML mappings, the root correction), `PLATE_HTML_ATTRIBUTES`, `docxStaticComponents.tsx` | `platejs/footnote`, `platejs/html`, `platejs/docx/export` callers | steps 1.1, 3.1, 3.2, 3.4 and 4.1 specs; `htmlConformance.spec.ts` | planned: steps 1.1, 3.1, 3.2, 3.4, 4.1 |
| React adapter | yes | platejs/react | `FootnotePlugin.tsx` read-only branch | `FootnoteKit` | step 2.1 spec | planned: step 2.1 |
| Registry UI | yes | plate-ui | `footnote.tsx` read-only gestures, picker focus and focus after a jump; `footnote-static.tsx` anchors and back links | Apps that copy `footnote` | steps 2.2 and 3.3 specs; the Playwright footnote specs; the hand drive | planned: steps 2.2, 3.3 |
| Composition | yes | plate-ui | `FootnoteKit` and `BaseFootnoteKit` keep their shape; `docx-export` picks up the package overrides | `plugins.ts`, `plugins-static.ts`, `docx-export.tsx` | `docx-export.spec.tsx`; step 3.3's reuse oracle cases | planned: steps 3.3, 3.4 |
| Scale proof | yes | benchmark | the static reuse lines M1 and M2, and HTML export time that grows in step with the number of notes | users/maintainers | pre-acceptance `docs/plans/artifacts/2026-10-17-footnote-review/static-anchors-a2.log`; step 3.1's export scaling line; step 3.3's `readsDocument` case and oracle cases | planned: steps 3.1, 3.3 |
| Registry metadata/examples | yes | plate-ui | a registry changelog entry for `footnote`; regenerated `apps/www/public/r/footnote*.json` | shadcn registry installs | step 5.5 changelog check; step 5.6 `build:registry` read-back | planned: steps 5.5, 5.6 |
| Docs | yes | plate-docs | `content/docs/(plugins)/(elements)/footnote.mdx`; `content/docs/(plugins)/(serializing)/html.mdx` and its Chinese twin | Docs readers | steps 5.1 and 5.2 docs checks and preview | planned: steps 5.1, 5.2 |
| Release artifacts | yes | changeset | a `platejs` changeset | Release notes readers | step 5.5 `pnpm changeset status` | planned: step 5.5 |

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: no new host; the footnote entrypoint keeps its core and combobox imports | `tooling/entrypoints/entrypoint-dag.mjs:89` |
| Plite ownership | N/A: no Plite change; the jump uses `editor.api.dom.scrollIntoView` and Plite's existing read-only refusal | `docs/plans/artifacts/2026-10-17-footnote-review/readonly-selection-a1.log` |
| external dependency ownership | N/A: no new dependency | step 4.6 `pnpm test:manifests` |
| entrypoint runtime | `docx/export` adds `footnote` to its dependencies; no new entrypoint | step 3.4 `pnpm check entrypoint-graph` |
| Oxlint coverage | The existing platejs and www lint cover every changed file | step 5.8 `pnpm lint:fix` on the task's paths |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| HTML export of a footnote document fails by default, and allowing loss drops the mark | yes | `docs/plans/artifacts/2026-10-17-footnote-review/footnote-html-a1.log` |
| GitHub's footnote HTML pastes as a link, a heading paragraph and a back-link link | yes | same log |
| Static output prints the label with no anchor | yes | same log |
| A read-only view refuses the jump's selection write and leaves an editable view's caret in place | yes | `docs/plans/artifacts/2026-10-17-footnote-review/readonly-selection-a1.log` |
| A pasted definition lands inside a table cell or a quote | yes | `docs/plans/artifacts/2026-10-17-footnote-review/cell-paste-a3.log` |
| Mapping priorities, Link fall-through and prepare order behave as the design assumes | yes | `docs/plans/artifacts/2026-10-17-footnote-review/premises-a5.log` |
| A `children` correction keeps definitions at the root on every paste path, and presentation stripping round-trips static HTML | yes | `correction-a4.log` and `html-chrome-a1.log` in the same folder |
| Word bookmarks exist only for headings, so in-page links would dangle | yes | inferred from source: `render-document-file.ts:166-181` registers heading bookmarks only, and `docx-bookmarks.spec.ts:47-52` keeps an unmatched anchor link; step 3.4's must-fail control proves it at runtime |
| The footnote paths are unchanged between the review commit and `HEAD` | yes | `git diff --stat 4f880fc570 8f5afd571d` over the footnote, HTML, static and DOCX paths prints nothing |
| Feature Manifest complete before source writes | yes | Feature Manifest above; every row filled, each status closes at its step |
| Flow mode selected | yes | existing package plus React/registry |
| Public API decision owner selected | yes | `best-api` lens in the verdict, then `architect` (decision log `architect` rows) |
| Runtime scale applicability resolved | yes | Scale proof yes: the static anchors read a document-wide index on every footnote render, and static reuse is repeated-unit work; `performance-observability` selected |
| Pre-acceptance Benchmark receipt selected | yes | `static-anchors-a2.log`: base arm with today's plain static components, candidate arm with prototype earlier-only anchors and no `readsDocument`, planted arm with `readsDocument` on definitions; cohorts normal, large, stress and pathological, with the citation added before every block on normal only; lines M1 and M2 frozen and printed before the first arm; element render counts; timing informational under happy-dom on a host at load 68 to 219 on 18 cores; correctness guard M2, reused DOM equals a fresh render. The superseded `readsDocument` receipt is `static-reuse-a1.log` |
| Public feature entrypoint decision recorded | yes | No new entrypoint; the Design section rejects `platejs/footnote/static` |
| Conditional packs selected | yes | `performance-observability` only |
| Performance pack selected | yes | for the static reuse row |
| User-facing operation and runtime owner identified | yes | Rerendering a static document after an edit; `EditorStatic` reuse in `PlateStatic.tsx`. `serializeHtml` and `exportDocx` render once and reuse nothing, and the id index makes each one walk the document once |
| Scale variables and cohorts fixed | yes | Body blocks, notes and citations per note: normal 1000/10/1, large 1000/200/1, stress 4000/2000/1, pathological 2000/1/2000 |
| Budget frozen before target measurement | yes | Lines M1 and M2, printed at the top of `static-anchors-a2.log` before any arm ran |
| Baseline and target probe selected | yes | Base arm with today's static drawing, candidate arm with earlier-only anchors, planted arm with `readsDocument` on definitions, which must miss M1 |
| Correctness guard selected | yes | M2 after six operations, including a citation added before every block and a duplicate note added after the notes |
| Production detector decision recorded | yes | N/A: static rendering has no runtime detector; the reuse oracle spec is the regression guard |

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`). Execution authority: this run's Pursue, which continues into the build under Autopilot. The build edits this checkout on `next` and commits nothing. Each step's proof names its base control, the half that must fail at `HEAD`. Before the build, the plan ran the base controls of steps 1.1, 2.1, 2.2, 3.1, 3.2, 3.3 and 4.1 at `8f5afd571d` in a detached worktree, and each failed for the defect its step names (`docs/plans/artifacts/2026-10-17-footnote-review/base-controls-a1.log`, decision log `plan` rows). That log names the steps by the first panel's numbering: its 1.1 cases are steps 1.1 and 3.1 here, its 1.2 is 2.1, its 1.3 is 2.2, its 2.1 is 3.2, its 2.2 is 3.3 and its 3.1 is 4.1. Step 3.4's control is a mutant and runs in the build.

### Phase 1. Cut the three duplicate reads

Keep it when the redundancy case passes at base and the typechecks pass after the cut. Revert the phase otherwise.

- [ ] 1.1 Before the cut, add one `BaseFootnotePlugin.spec.ts` case that runs each removed read beside its replacement under Hard cuts on the duplicate fixtures and asserts equal results, and run it at base. Then delete `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs` with that case, their spec lines and the `footnote.slow.tsx` mocks, after a `pstack:blast-radius` pass. Proof: the redundancy case's log at base; the platejs and www typechecks after the cut.

### Phase 2. Jump in read-only views

Keep it when steps 2.1 and 2.2 fail at base and pass on the change, and the navigation Playwright spec passes five warm Chromium runs, Firefox and WebKit. Revert the phase otherwise.

- [ ] 2.1 Move the point computation of `selectDefinition` and `selectReference` in `BaseFootnotePlugin.ts` into one internal function over a state view that returns `{ point, targetPath }`: the definition's start point, and the text point beside the reference. Both update methods keep calling it. In `FootnotePlugin.tsx`, when the view is read-only, call that function through `editor.read`, call `editor.api.dom.scrollIntoView(point)` as the editable branch does, flash the target through `NavigationFeedbackPlugin` when installed, and return `true`, with no update and no `dom.focus`. An unmounted view or a missing target still returns `false`. The editable branch is unchanged. Proof: `FootnotePlugin.spec.tsx`'s read-only case (lines 116-124) asserts `true`, one scroll to the same point the editable branch scrolls to, one flash in the calling view, an unchanged selection, no focus call and no history entry, and `false` once unmounted; a two-view case asserts the editable view's caret and focus stay when the read-only view jumps. Both cases red at base through `node tooling/scripts/proof-worktree.mjs <path> 8f5afd571d --with <spec> --dir docs/plans/artifacts/2026-10-17-footnote-review --name <name> --expect-fail "<case title>" -- bun test <spec>` from `packages/platejs`, green on the change, and the file's editable cases (lines 74-111) green.
- [ ] 2.2 In the copied `footnote.tsx`, in a read-only view only, a plain click or Enter on the reference chip calls `focusDefinition`, and on the back link calls `focusReference`, or opens the picker when the note has several citations. In a read-only view the picker takes focus when it opens, so the arrow keys move through its items and Enter jumps; its `onInitialFocus` prevention stays for editable views. After a `true` return, focus the target's jump control with `preventScroll`. The chip's and back link's mousedown handlers return early in a read-only view, so one click jumps once and Mod+mousedown never calls `createDefinition` there. A read-only unresolved chip does nothing and shows no create action, and the renumber button is hidden. Editable gestures are unchanged. Proof: `footnote.navigation.spec.tsx` cases, each firing mousedown, mouseup and click and asserting one scroll, for the chip, the back link and a picker item in a read-only view; a two-view case where the read-only view jumps and focus lands on the target's control in that view while the editable view's caret stays; an unresolved chip that does nothing and throws nothing; and an editable plain click that does nothing; red at base and green on the change. Then a new `apps/www/tests/browser/footnote-navigation.spec.ts` on `/blocks/footnote-demo` with a viewport short enough that the first note starts below the fold. It switches to Viewing through the mode button, checks the note is outside the viewport, clicks the first mark, and sees the note's start in the viewport, the flash attribute on it, the caret unchanged and focus on its back link. Note 1 is cited twice, so Enter on that back link opens the picker with focus inside it, ArrowDown and Enter jump to the second citation, and focus lands on that chip. Run it with `PLAYWRIGHT_BASE_URL` named, Chromium five warm runs without retries, then Firefox and WebKit once, each through `proof.mjs`.

### Phase 3. Links in HTML, static pages and Word

Keep it when steps 3.1 to 3.4 pass, step 3.2's native GitHub copy included. A conclusive miss on step 3.1's export scaling line sends the anchor index back to `architect`. Revert the phase when an HTML or Word case fails.

- [ ] 3.1 Move the registry walk in `BaseFootnotePlugin.ts` into one pure function over a document's children and the two element types, memoized per children array in a `WeakMap` that holds one index per pair of element types, which also computes, on first use, a map from path to `FootnoteAnchor = { id: string; target?: string }`. A reference's id is `fnref-<enc>` for the first citation of its ref and `fnref-<enc>:<n>` for the nth, and its target is `fn-<enc>`. A definition's id is `fn-<enc>` for the canonical one and `fn-<enc>:<n>` for the nth duplicate; the canonical one targets `fnref-<enc>`, and a later duplicate has no target. `<enc>` percent-encodes the ref as WTF-8, as the Design section says. Add `read.anchor({ path })`, which returns `undefined` for a path that holds no footnote, and export `FootnoteAnchor` from `platejs/footnote`. Proof: `BaseFootnotePlugin.spec.ts` anchor cases for refs `1`, `a b`, `#x`, `1-2`, `1:2` and `ü`; refs `"\uD800"`, `"\uD801"` and `"�"` in one document getting three different ids; a note cited three times; a duplicate definition; an uncited definition; an unresolved reference; a path with no footnote; and two editors with different footnote type names reading one children array, each getting its own anchors. Each case red at base through `proof-worktree.mjs --with --expect-fail`, and green on the change. Then, through `benchmark`, a probe in the run directory times `serializeHtml` of a 500-note and a 2,000-note document, each note cited once, five interleaved runs each, against a line frozen here: the 2,000-note median stays under eight times the 500-note median, where an index rebuilt for every footnote node would take about sixteen times. A planted arm that rebuilds the index for every footnote node must miss the line, and `benchmark-checklist` runs before any `verified` row.
- [ ] 3.2 Add the reference mapping to `BaseFootnotePlugin` at priority 10: match `{ tag: 'a', attributes: { 'data-editor-footnote-ref': true } }`. GitHub writes its ids with a `user-content-` prefix, and in comments with a hash suffix that changes on every render, so no ref is read out of an id. Its `prepareDocument` gives a `data-editor-footnote-ref` to each `a[data-footnote-ref]` whose `href` fragment, the part after `#` of a relative or an absolute URL, starts with `fn-` or `user-content-fn-`. The fragment is read from any URL because browsers write absolute URLs into copied HTML: Chromium serializes the clipboard with `ResolveUrls::kNonLocal`, which completes every URL unless the page is a local file (`frame_selection.cc:1355` and `markup_formatter.cc:167-179`, saved in `docs/plans/artifacts/2026-10-17-footnote-review/chromium/`), so a copied citation links to `https://github.com/<owner>/<repo>#user-content-fn-1`. The marker's value is the ref the definition prepare gave the element that `getElementById` finds for the fragment, with or without the `user-content-` prefix. When the paste holds no such note, it is the anchor's own text, the number GitHub shows, and a blank text gives no marker. It looks fragments up as written and, when they decode, percent-decoded. Any other `data-footnote-ref` anchor stays a link. It then replaces a `sup` that holds only a footnote anchor of either vocabulary, apart from whitespace and the void spacer, with the anchor. Decode returns `{ children: [{ text: '' }], ref }` and preserves the marker, or `undefined` for a blank marker, so Link takes the anchor. Encode writes `<sup><a data-editor-footnote-ref href id>` with the ref as its text. Add the definition mapping to `BaseFootnoteDefinitionPlugin` at priority 70: match `{ tag: 'div', attributes: { 'data-editor-footnote-definition': true } }`. Its `prepareDocument` runs before the reference's, because it has the higher priority. It turns each `section[data-footnotes] > ol > li[id]` into such a `div` that keeps the item's `id` and holds its children. The div's ref is the text of the first `a[data-footnote-ref]` whose `href` names the item, or the item's position in the list when none does, which is the number GitHub shows. The prepare keeps one map for the whole paste, keyed by the item element. The first item with a number keeps it, and a later item with the same number, such as the note 1 of a second pasted GitHub comment, gets that number with `-2`, `-3` and so on, so its citations, which find it by id, keep pointing at it. It replaces the section, label heading included, and removes GitHub's `[data-footnote-backref]` links and every `[data-editor-footnote-chrome]` element inside a definition. Decode returns `{ ref }`, or `undefined` for a blank marker, and the children decode as blocks. Encode writes the `div` with its `id`, the content, and for a canonical note one `<a data-editor-footnote-chrome href="#fnref-<enc>">↩</a>` after it. Both encoders take their anchors from step 3.1's index over the encode context's `document.children`. Add `data-editor-footnote-ref`, `data-editor-footnote-definition` and `data-editor-footnote-chrome` to `PLATE_HTML_ATTRIBUTES`, and footnote fixtures to `htmlConformance.spec.ts`. The GitHub fixtures are GitHub's own renders, made by `gh api markdown` in `markdown` mode, as a README renders, and `gfm` mode, as a comment renders, and saved with their Markdown inputs and `make.sh` in `docs/plans/artifacts/2026-10-17-footnote-review/github-fixtures/`. Proof: spec cases, red at base and green on the change, for `serializeHtml` under the default policy of a note cited twice, a duplicate definition and an unresolved reference, with the exact markup; `parseHtml` of that output, with the standard kit and `BaseScriptPlugin` installed, back to the same document; GitHub fixtures in both modes for a single citation, a repeated citation and a three-block note with a nested list whose label is `n`, bare, inside `div.markdown-body` and inside `article`, giving references and root definitions that share GitHub's number as their ref, with no heading, no back-link text and no loss report for the chrome; a citation pasted without its note, giving an unresolved reference with GitHub's number; a `data-footnote-ref` anchor whose `href` starts with neither prefix, decoding as a link; an `href` with a malformed `%` pairing by its raw fragment without throwing; the gfm fixtures with every href made absolute, as Chromium's copy writes them, pairing as the relative ones do; two gfm renders concatenated, each with a note 1, giving refs `1` and `1-2` with each citation on its own note; blank markers and a blank anchor text decoding as links; a plain ordered list staying a list; and `htmlConformance.spec.ts` green. Then a case in a new `apps/www/tests/browser/footnote-paste.spec.ts` on `/blocks/playground-demo`: it serves step 3.2's gfm fixture at `https://github.com/o/r` through Playwright's `page.route`, so the copy resolves its hrefs against a GitHub URL, selects it, copies it with the native clipboard and pastes it into a root paragraph, and sees footnote references, not links, and definitions with GitHub's numbers. It runs in Chromium five warm runs through `proof.mjs`, because only Chromium exposes clipboard permissions to automation.
- [ ] 3.3 In the copied `footnote-static.tsx`, draw the reference as a `sup` holding an anchor with `data-editor-footnote-ref`, `href="#<target>"`, `id` and the text `[ref]`. Draw the definition as a `div` with `data-editor-footnote-definition` and `id`, its label in an element marked `data-editor-footnote-chrome`, its content, and for a canonical note one `data-editor-footnote-chrome` back link to its target with the copied item's accessibility label. Add footnote cases to `PlateStatic.reuse-oracle.spec.tsx` with static components that draw `read.anchor`: a citation added after the notes, a citation added before every block, a note grown at the end and a duplicate added after the notes. Proof: a `renderStaticHtml` spec of the kit's static output with the exact anchors, and its HTML parsed back with the standard kit to the same footnotes, with no label or back-link text, red at base; the oracle cases green, and red with the first plan's drawing planted, which links a note back to every citation; and a case that neither footnote plugin's render config declares `readsDocument`, red with it planted. Static reuse never reads what a component draws, so that declaration alone decides M1, as `static-anchors-a2.log` shows, and the oracle cases keep M2's check that reused output equals a fresh render.
- [ ] 3.4 Add `FootnoteReferenceDocx` and `FootnoteDefinitionDocx` to `DOCX_STATIC_COMPONENTS`, drawing today's label and note text with no links, and add `footnote` to the `docx/export` dependencies in `entrypoint-dag.mjs`. Proof: an `exportDocx.presentation.spec.tsx` case that exports a footnote document through the copied static kit and finds the label and note text and no `w:hyperlink`, green at base and on the change, beside a must-fail control with step 3.3's static item and the overrides removed through `mutate.mjs`, which finds a `w:hyperlink` whose anchor has no bookmark; `docx-export.spec.tsx` green; `pnpm check entrypoint-graph` green.

### Phase 4. Notes stay at the root

Keep it when every step 4.1 case passes in both plugin orders. Revert the phase otherwise.

- [ ] 4.1 In `BaseFootnoteDefinitionPlugin`, add a `corrections` entry on the `children` event whose query is the definition type. When the definition's path has more than one index, it moves the definition to `[root children length]` through `tx.nodes.move`, as `createDefinition` places a new one. Pasted duplicates stay, and the copied duplicate warning flags them. Proof: spec cases, red at base and green on the change, through `editor.update.fragment.replace` and `editor.update.slice.replace`, with the plugin installed before and after Table. A paste with the caret in a table cell, a quote or a list item puts the definition at the root end, keeps the caret after the pasted text, and one undo restores the document. A paste at a root paragraph moves nothing. A selection over two table cells puts each cell's copy at the root end. A pasted table that holds a definition puts the definition at the root end. Words copied from inside a note paste as words into the body and into the same note, and add no note. A pasted duplicate stays. A saved nested definition stays on load and while typing in it, and moves on a split inside it. Under `maxLength`, caps 8 to 14 give the same document as the same paste with the correction removed. GitHub's footnote HTML pasted through the HTML paste path into a table cell lands its note at the root. Then a case in a new `apps/www/tests/browser/footnote-paste.spec.ts` on `/blocks/playground-demo`, whose `EditorKit` holds Table and Footnote: it selects step 3.2's GitHub-rendered fixture on a page and copies it with the native clipboard, pastes it into a table cell, and sees the reference in the cell and the note at the end of the document. It runs in Chromium five warm runs through `proof.mjs`, because only Chromium exposes clipboard permissions to automation.

### Docs, release and proof

These ship with whichever phases are kept.

- [ ] 5.1 Through `plate-docs`, update `content/docs/(plugins)/(elements)/footnote.mdx`: the navigation section's read-only behavior and return values, a `read.anchor` API entry, the removal of the three reads, HTML export and GitHub paste, static and Word output, and that a definition inside another block moves to the end. The page has no Chinese twin, so `/cn/docs/footnote` serves the English page. Proof: the docs source and parity checks, and a hand drive of the page.
- [ ] 5.2 Through `plate-docs`, update `content/docs/(plugins)/(serializing)/html.mdx` and `html.cn.mdx` where they list what encodes and what paste reads. Proof: the docs checks, and a hand drive of both locales.
- [ ] 5.3 Reconcile `docs/editor-behavior/markdown-editing-spec.md`'s footnote Plugin surface list (line 3477) with the final reads, the read-only jump and the root correction. Proof: `teaching-sweep.mjs` in step 5.7 shows no live hit there.
- [ ] 5.4 Point the search fixtures in `apps/www/src/lib/search-result-groups.test.ts:31` and `apps/www/src/app/api/search/route.test.ts:57` at a surviving footnote read. Proof: both tests green.
- [ ] 5.5 Through `changeset`, add a `platejs` changeset for `read.anchor`, the read-only jump's `true`, the three removed reads, HTML export and GitHub paste, Word output and the root correction, and a registry changelog entry for the copied `footnote` gestures, picker focus and static anchors. Proof: `pnpm changeset status` and the registry changelog check.
- [ ] 5.6 Run `pnpm --filter www build:registry`, and regenerate `apps/www/src/generated/api-reference-manifest.json` in a `proof-worktree.mjs --install` worktree that builds `plitejs` and `platejs` first. Proof: the regenerated `footnote` registry files read back with the new static source, `pnpm --filter www api-reference --check`, and `pnpm test:manifests`.
- [ ] 5.7 Through `best-api repair`, run `node tooling/scripts/teaching-sweep.mjs duplicateDefinitions hasDuplicateDefinitions duplicateRefs` and search the plans and agent instructions for the read-only `false` promise; fix each live hit this task owns and flag the rest on the page. Proof: the sweep log with no live hit.
- [ ] 5.8 Through `verify`, run `node tooling/scripts/hand-drive.mjs scope` on the changed files, drive every cell it lists, and run its `check`; then `pnpm lint:fix` on the task's paths only, as the last check that edits code. Proof: the `check` log and the lint log.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-10-17-footnote-review.md` | pending |
| Selected pack closure | yes | Close `performance-observability` with step 3.3's production rerun | pending |
| Package proof | yes | Steps 1.1, 2.1, 3.1, 3.2, 3.4 and 4.1 specs, the platejs typecheck and `htmlConformance.spec.ts` | pending |
| Package boundary proof | yes | `pnpm test:manifests`, `pnpm check entrypoint-graph` and scoped lint | pending |
| Scale proof | yes | Step 3.1's export scaling line on the final bytes, step 3.3's `readsDocument` case and the oracle cases | pending |
| Registry/browser proof | yes | The Playwright specs of steps 2.2 and 4.1, and step 5.8's hand drive | pending |
| Docs/release proof | yes | Steps 5.1, 5.2, 5.5 and 5.6 | pending |
| Writing passes | yes | `deslop` and `no-comments` on product code, `unslop` on prose | pending |
| Diff panel (reviews: api-build) | yes | A panel on the build's diff | pending |

## Proof

Each step's proof is named on its box. The close adds the hand drive across every page `hand-drive.mjs scope` lists, step 3.3's production rerun, the diff panel and the decision-trail review.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What happens next | Build this plan | Stop at this plan | hold | big |
| A jump in a read-only view | Scroll to the target and flash it, and leave the caret alone | Keep doing nothing in read-only views | keep refusal | big |
| The three test-only duplicate reads | Remove them in this plan (look) | Keep them | keep reads | small |
| Focus after a read-only jump | The target's own jump button, so Enter jumps back | Focus stays on the mark you clicked | focus stays | small |
| HTML footnote markup | GitHub-style links tagged with Plate's own attributes, and GitHub's own markup still pastes | Copy GitHub's exact attributes | github markers | small |
| Notes pasted into a cell or a quote | Moved to the end of the document | Left where the caret is | leave nested | small |
| A note an old paste left inside a table or a quote | Moves to the end the first time its own blocks are split or joined | Moves as soon as you type in it | move on typing | small |
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
- An invariant every operation must keep is repaired in the smallest transform or correction owner, and transactions run the installed corrections over their changed roots ([plite.md](../vision/plite.md), the transactions paragraph).
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
6. **A named end-matter root for definitions. Loses**, as in 2026-10-04. The transfer veto refuses drops into blocks, and phase 4's correction moves any other definition that lands inside one to the root. A second root adds mounting, cross-root jumps and conversion work.
7. **Strongest deletion inside the scope: cut `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs`. Wins, as a small part of lane 2.** No production code calls them. Only docs, the plugin spec and mocks in `footnote.slow.tsx` name them, and each is one line over `definitions({ ref })`. Vision names no job for them, and `isDuplicateDefinition` serves the copied duplicate warning. The predicted benefit is three fewer public reads to learn and document, with no runtime change. The plan's Close marks that prediction held or falsified.

**Proof limits.** The HTML, paste and static claims come from probes on source at `4f880fc570`, whose footnote, HTML, static and DOCX paths `8f5afd571d` does not change: `footnote-html-a1.log`, `cell-paste-a3.log`, `premises-a5.log` and `static-reuse-a1.log` in `docs/plans/artifacts/2026-10-17-footnote-review/`. After the first panel, `correction-a4.log`, `html-chrome-a1.log` and `static-anchors-a2.log` in the same folder ran on source at `4bff0981dc`, whose footnote, HTML, static and table paths match `8f5afd571d`; they test prototypes in probe files, not the planned build. The read-only claim comes from one two-view jsdom probe, `readonly-selection-a1.log` in the same folder. The base controls ran at `8f5afd571d` under happy-dom (`base-controls-a1.log`). No browser ran. The editor comparison is a source read by a Codex seat, `editors-answer.md` in that folder, which ran nothing. GitHub's markup comes from `gh api markdown` in both modes (`github-fixtures/` in the same folder); a browser's copy of a rendered GitHub page is tested only by step 3.2's Chromium case, and Firefox's copy is inferred to resolve URLs the same way, not run. Copying words from inside a note writes the whole note and its back link into the clipboard HTML, because HTML export treats the copied slice as its own document (`HtmlPlugin.ts:2923`). A paste back into the same editor uses the embedded fragment, while another Plate editor creates a new note and other apps show a dead back link. DOCX footnote import stays out of this target.

### Dependents

- `react`: affected. `packages/platejs/src/react/features/footnote/FootnotePlugin.tsx` holds both jump commands that change.
- `ui`: affected. `apps/www/src/registry/components/editor/plugins-static.ts` composes `BaseFootnoteKit`, whose static renderers change, and `apps/www/src/registry/components/editor/plugins.ts` composes `FootnoteKit`, whose chip learns a plain-click jump in read-only views.
- `basic`, `callout`, `canvas`, `code`, `date`, `link`, `math`, `media`, `slash`, `table` and `toc`: unaffected. They reach this scope through `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` and `apps/www/src/registry/components/editor/slash.tsx`, which only check `installed` and call `insert`, and neither changes. `link` also meets the reference mapping on paste, which falls through to Link for any anchor that names no footnote. `table` also wraps `replaceSlice`, and step 4.1 runs both install orders and a multi-cell paste.
- `distribution` and `editing`: unaffected. They reach this scope only through `packages/platejs/src/utils/plate-keys.ts`, a member that holds the shared `PLUGINS` names, which do not change.

### History

- This review retains [2026-10-04-footnote-audit](../research/review-records/2026-10-04-footnote-audit.json), because its Pursue, its rejected end-matter root and its rejected schema-level uniqueness still hold; it adds the measured HTML, read-only and paste evidence, and the cut of the three unused reads.
- This review retains 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit, because its removal of duplicate target subscriptions from the copied footnote UI still holds.
- [2026-04-04-footnote-support](2026-04-04-footnote-support.md), [2026-04-04-footnote-sync-architecture](2026-04-04-footnote-sync-architecture.md) and [2026-07-12-plate-next-footnote-indent-juice-package-reviews](2026-07-12-plate-next-footnote-indent-juice-package-reviews.md): historical. The registry and first-definition-canonical design they built is the current one.
- Member changes since 2026-10-04, read with `git log`: `0dfa19ab11` and `209e00b948` touch the copied chip's combobox return and selection mode, `002891202b` extends the veto to side wraps, and `422564e6f6` adds `txLocate` and `txSelection` markers and the Markdown paragraph type. None changes navigation or conversion.
- External checkouts read: `../milkdown` at `6a4db480b00db8dd0322b517117dfa2154f3e2e2`, `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../prosemirror-website` at `a16b4ece45f135e5f001ab59d25f2d43c25974e1`, `../ckeditor5` at `14e73cc31b869ce483bd8449f40b9102ac7746da`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../BlockNote` at `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163`, `../slate` at `945a484df2497e4c448b33f417b0de2a49840032` and `../micromark` at `6577c200155e9c6b85a42b26d298f8affc348f2f`.
