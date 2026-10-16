---
review_scopes: [footnote]
verdict: pursue
review_basis: [2026-10-04-footnote-audit]
review_commit: 4f880fc5702db166a0e92e8f8b15d5ab9fa26b0c
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/vision/plite.md, docs/research/review-records/2026-10-04-footnote-audit.json, packages/platejs/src/react/features/footnote/FootnotePlugin.tsx, packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx, packages/platejs/src/features/link/lib/BaseLinkPlugin.ts, packages/platejs/src/static/renderStaticHtml.tsx, packages/platejs/src/html/index.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/plitejs/src/react/components/editable.tsx, apps/www/src/registry/components/editor/toc.tsx, apps/www/src/registry/components/editor/insert-toolbar-button.tsx, apps/www/src/registry/components/editor/slash.tsx, apps/www/src/registry/components/editor/plugins.ts, apps/www/src/registry/components/editor/plugins-static.ts, 'content/docs/(plugins)/(elements)/footnote.mdx', 'content/docs/(plugins)/(serializing)/html.mdx']
review_upstreams: ['../milkdown@6a4db480b00db8dd0322b517117dfa2154f3e2e2', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../ckeditor5@14e73cc31b869ce483bd8449f40b9102ac7746da', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../micromark@6577c200155e9c6b85a42b26d298f8affc348f2f']
---

# Footnotes: jump in read-only views and keep the link in HTML

Status: planning: writing the plan this Pursue continues into
Playbook: verdict

**Pursue. Keep the footnote data model, make the jump work in read-only views, and give HTML and static output the link GitHub uses.** This run measured what the 2026-10-04 audit only read. Serializing any document that holds a footnote to HTML fails by default with `ok: false`, and the docs' own `serializeHtml(document, { plugins: EditorKit })` call is such a call. Allowing loss drops the reference mark entirely. GitHub's rendered footnote HTML pastes as a `1` link, a `Footnotes` paragraph and a `↩` link. Static output prints `[1]` with no anchor. In a read-only view both jump commands return `false`. Plite refuses any update there, even a selection move, so the copied chip and back link do nothing for readers. TOC already proves the fix: its copied UI scrolls and flashes a heading without writing the selection, in any view. `node tooling/scripts/review-ledger.mjs next` returned this scope, open since the 2026-10-04 Pursue with no adopting plan, and stale because three member paths changed. None of those changes touch navigation or conversion. It depends on `selection`, which is closed.

## Brief

### What will change?

Readers of a read-only document can jump from a footnote mark to its note and back. HTML export, pasting footnotes from GitHub and static pages keep the link instead of failing or dropping it.

### What could go wrong?

The jump commands start returning true in read-only views, so app code that read false as "read-only" changes. New link markup could be read by link paste first, or give two documents on one page the same ids.

## Teach

A footnote is a small mark in the text and a note at the end of the document. Both carry the same label, so the editor pairs them and lets you jump between them.

Today the jump moves the caret, focuses the editor and flashes the target. A read-only view can't move the caret, because Plite refuses every change from a read-only view, so the jump gives up and does nothing. HTML conversion has no rule for footnotes at all. Export refuses the whole document unless told to accept loss, and then it drops the mark. Static pages print the label with no link, and pasting GitHub's footnotes gives plain links.

The fix keeps the stored data. In a read-only view the jump only scrolls to the target and flashes it, the way the table of contents already does. HTML export and static pages write the link markup GitHub writes, and paste reads it back into footnotes.

## Public API

The jump call stays the same. In a read-only view it now scrolls to the target and flashes it instead of returning `false`.

```tsx before
// content/docs/(plugins)/(elements)/footnote.mdx
// A read-only view returns false and nothing moves.
editor.api.footnote.focusDefinition({ ref: '3' });
editor.api.footnote.focusReference({ ref: '3', index: 1 });
```

```tsx after
// content/docs/(plugins)/(elements)/footnote.mdx
// A read-only view scrolls to the target, flashes it and returns true; the caret stays.
editor.api.footnote.focusDefinition({ ref: '3' });
editor.api.footnote.focusReference({ ref: '3', index: 1 });
```

HTML export of a document with a footnote succeeds and writes GitHub's link pair.

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
// { ok: true }: <sup><a href="#fn-1" id="fnref-1" data-footnote-ref>1</a></sup>
// and the note as an element with id="fn-1" and a back link to #fnref-1.
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

The static renderer links the mark to its note.

```tsx before
// apps/www/src/registry/components/editor/footnote-static.tsx
{props.children}[{element.ref ?? ''}]
```

```tsx after
// apps/www/src/registry/components/editor/footnote-static.tsx
{props.children}
<a href={`#fn-${element.ref}`} id={`fnref-${element.ref}`}>{element.ref}</a>
```

Three duplicate reads that nothing calls go. `definitions({ ref })` and `isDuplicateDefinition` already answer them.

```ts before
// content/docs/(plugins)/(elements)/footnote.mdx
editor.read.footnote.duplicateDefinitions({ ref: '1' });
editor.read.footnote.hasDuplicateDefinitions({ ref: '1' });
editor.read.footnote.duplicateRefs();
```

```ts after
```

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What happens next | Plan and build this target | Stop at this verdict | hold | big |
| A jump in a read-only view | Scroll to the target and flash it; the caret stays | Keep refusing in read-only views | keep refusal | big |
| HTML and static footnote markup | The link pair GitHub writes, read back on paste | Plate's own markup | own markup | small |
| The three unused duplicate reads | Remove them in this plan (look) | Keep them | keep reads | small |
| Where the review lives | One footnote subject page | A one-off page | one-off | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- The user job is to cite a source in the text and keep the note at the end of the document, then let anyone reading move between the mark and the note, in an editable view, a read-only view, a static page and exported HTML.
- References and definitions pair through the stored `ref`. Runtime node keys never persist ([plate.md](../vision/plate.md), the persisted identity paragraph).
- Definitions stay root-level end matter. Duplicate refs are kept and flagged, and the first definition is canonical (the 2026-10-04 audit's requirements, unchanged).
- Arrival feedback uses one target and timer per mounted view and never changes the model, the selection or history. The requesting feature owns the styling and the navigation policy ([plate.md](../vision/plate.md), temporary arrival feedback).
- Explicit navigation scrolls are the last DOM write, and a feature scrolls a known target through `editor.api.dom.scrollIntoView` ([plite.md](../vision/plite.md), the DOM phase scheduler paragraph).
- Plite refuses every update from a read-only view, a selection move included. This run's probe threw `Cannot update a read-only editor view.` and left the editable view's caret in place.
- One plugin keeps all of its HTML matches in one mapping, and a whole-payload format reports what a paste leaves out ([plate.md](../vision/plate.md), the HTML mapping paragraphs).
- Exporting a live editor draws through the app's static kit ([plate.md](../vision/plate.md), the static presentation paragraph), so static anchors are the export's anchors.
- A projection survives only with a distinct current job ([common.md](../vision/common.md), Taste).
- Packages ship neutral defaults; the chip, the hover preview and when a click jumps are copied-UI policy ([VISION.md](../../VISION.md), Plate Essentials).

### Lanes

1. **Keep the current design. Loses.** Identity is sound, and it stays. But the probe shows HTML export failing on every footnote document, GitHub paste losing the pairing, static output without links, and readers in read-only views unable to jump.
2. **Change the jump and add HTML and static anchors. Wins.** `focusDefinition` and `focusReference` keep their names and their editable behavior. In a read-only view they resolve the target through `read`, scroll the calling view and flash it, as copied TOC does (`apps/www/src/registry/components/editor/toc.tsx:79-105`), with no update. Both plugins get one HTML mapping each. Export writes GitHub's `sup > a[href][id][data-footnote-ref]` and a note element with an `id` and a back link. Paste reads that shape, `user-content-` prefix included, back into a ref, ahead of link paste. The static renderers write the same anchors. No new noun.
3. **Select the target in every view, read-only included. Loses.** It would be one code path, and Lexical's example does it. Plite refuses the update, and the 2026-10-17 probe confirms it. Writing from a read-only view would also move the caret of an editable view of the same document, which Details already works around (`packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts:225-229`).
4. **Delete the package jump and let copied UI compose it, as TOC does. Loses.** It deletes two methods. But the editable jump has a real ordering law: commit the selection, focus, scroll last, then flash, in the calling view. Its spec pins that law (`packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx:74-111`), and every custom footnote UI would have to rebuild it. TOC has no selection, so its copy is two calls.
5. **A shared reveal helper on `NavigationFeedbackPlugin` for TOC, footnotes and Find. Loses.** It adds a public noun for a two-call composition, and Vision gives each requesting feature its own navigation policy.
6. **A named end-matter root for definitions. Loses**, as in 2026-10-04. The veto already keeps definitions at the root. A second root adds mounting, cross-root jumps and conversion work.
7. **Strongest deletion inside the scope: cut `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs`. Wins, as a small part of lane 2.** No production code calls them. Only docs, the plugin spec and mocks in `footnote.slow.tsx` name them, and each is one line over `definitions({ ref })`. Vision names no job for them, and `isDuplicateDefinition` serves the copied duplicate warning. Predicted benefit: three fewer public reads to learn and document, with no runtime change. The plan's Close marks that prediction held or falsified.

**Proof limits.** The HTML, paste and static claims come from one probe on source at `4f880fc570`, `docs/plans/artifacts/2026-10-17-footnote-review/footnote-html-a1.log`, with the footnote, definition and link plugins installed. The read-only claim comes from one two-view jsdom probe, `readonly-selection-a1.log` in the same folder. No browser ran. The editor comparison is a source read by a Codex seat, `editors-answer.md` in that folder, which ran nothing. GitHub's ids for a ref cited twice were not read, because `mdast-util-to-hast` is not checked out. DOCX footnote import stays out of this target.

### Dependents

- `react`: affected. `packages/platejs/src/react/features/footnote/FootnotePlugin.tsx` holds both jump commands that change.
- `ui`: affected. `apps/www/src/registry/components/editor/plugins-static.ts` composes `BaseFootnoteKit`, whose static renderers change, and `apps/www/src/registry/components/editor/plugins.ts` composes `FootnoteKit`, whose chip learns a plain-click jump in read-only views.
- `basic`, `callout`, `canvas`, `code`, `date`, `link`, `math`, `media`, `slash`, `table` and `toc`: unaffected. They reach this scope through `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` and `apps/www/src/registry/components/editor/slash.tsx`, which only check `installed` and call `insert`, and neither changes. `link` is also touched by paste order, which the plan owns as a footnote mapping concern.
- `distribution` and `editing`: unaffected. They reach this scope only through `packages/platejs/src/utils/plate-keys.ts`, a member that holds the shared `PLUGINS` names, which do not change.

### History

- This review retains [2026-10-04-footnote-audit](../research/review-records/2026-10-04-footnote-audit.json), because its Pursue, its rejected end-matter root and its rejected schema-level uniqueness still hold; it adds the measured HTML and read-only evidence, and the cut of the three unused reads.
- This review retains 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit, because its removal of duplicate target subscriptions from the copied footnote UI still holds.
- [2026-04-04-footnote-support](2026-04-04-footnote-support.md), [2026-04-04-footnote-sync-architecture](2026-04-04-footnote-sync-architecture.md) and [2026-07-12-plate-next-footnote-indent-juice-package-reviews](2026-07-12-plate-next-footnote-indent-juice-package-reviews.md): historical. The registry and first-definition-canonical design they built is the current one.
- Member changes since 2026-10-04, read with `git log`: `0dfa19ab11` and `209e00b948` touch the copied chip's combobox return and selection mode, `002891202b` extends the veto to side wraps, and `422564e6f6` adds `txLocate` and `txSelection` markers and the Markdown paragraph type. None changes navigation or conversion.
- External checkouts read: `../milkdown` at `6a4db480b00db8dd0322b517117dfa2154f3e2e2`, `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../prosemirror-website` at `a16b4ece45f135e5f001ab59d25f2d43c25974e1`, `../ckeditor5` at `14e73cc31b869ce483bd8449f40b9102ac7746da`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../BlockNote` at `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163`, `../slate` at `945a484df2497e4c448b33f417b0de2a49840032` and `../micromark` at `6577c200155e9c6b85a42b26d298f8affc348f2f`.
