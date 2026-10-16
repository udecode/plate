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

Status: planning: waiting on the plan panel
Playbook: plan

**Pursue, and this plan builds it.** The verdict measured four failures. Serializing any document with a footnote to HTML fails by default, GitHub's footnote HTML pastes as plain links, static pages print `[1]` with no anchor, and both jump commands return `false` in a read-only view because Plite refuses every update there. Planning found a fifth: a definition pasted with the caret in a table cell or a quote lands inside it, because paste runs no transfer veto (`docs/plans/artifacts/2026-10-17-footnote-review/cell-paste-a3.log`). The plan keeps the stored shape. It adds one read, `read.anchor({ path })`, which gives each footnote element its fragment id and the ids it links to. It also adds one HTML mapping per footnote plugin, anchors in the copied static item, a read-only branch in the jump, Word overrides that keep footnotes as plain text, and a paste wrapper that moves pasted definitions to the end of the document. It cuts three reads that only tests call. `architect` picked the target from three runners, and the probes below settled every premise it rests on.

## Brief

### What will change?

In a read-only view, clicking a footnote mark takes you to its note, and back. HTML export, GitHub paste, static pages and Word export keep footnotes, and pasted notes always go to the end of the document.

### What could go wrong?

Code expecting the jump to return false in read-only views now gets true, and three test-only reads are gone. Static pages redraw every note when a block at or after them changes, and Word still shows plain-text notes.

## Teach

A footnote is a small mark in the text that points to a note at the end of the document. Both carry the same label, and the editor pairs them by it.

Today the jump moves the caret to the target and flashes it. A read-only view refuses any caret move, so the jump does nothing there. HTML has no footnote rule, so export fails and paste from GitHub gives plain links. Static pages print the label with no link.

Saved documents don't change. In a read-only view the jump just scrolls and flashes, like the table of contents. HTML export, static pages and GitHub paste all use a link pair like GitHub's, so you can go from a mark to its note and back. Pasted notes move to the end, and Word keeps showing notes as plain text.

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

A new read tells the copied static item each footnote's id and the ids it links to.

```tsx before
```

```tsx after
// apps/www/src/registry/components/editor/footnote-static.tsx (planned)
const anchor = editor.plugin(BaseFootnotePlugin).read.anchor({ path });
// the second citation of "1": { id: 'fnref-1:2', targets: ['fn-1'] }
// the definition of "1", cited twice: { id: 'fn-1', targets: ['fnref-1', 'fnref-1:2'] }
```

Exporting a document with a footnote to HTML now works, and writes GitHub-style links tagged with Plate's own attributes.

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
// <div data-editor-footnote-definition="1" id="fn-1"><p>Source text</p></div>
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

On static pages the mark links to its note, and the note links back to every place that cites it.

```tsx before
// apps/www/src/registry/components/editor/footnote-static.tsx
{props.children}[{element.ref ?? ''}]
```

```tsx after
// apps/www/src/registry/components/editor/footnote-static.tsx (planned)
{props.children}
<a data-editor-footnote-ref={element.ref} href={`#${anchor.targets[0]}`} id={anchor.id}>
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
| Fragment ids for a footnote element at a path | Plate | `platejs/footnote`: `BaseFootnotePlugin` `read.anchor`, built in the same walk as the existing registry | A presentation read on the known path, as `read.list.ordinal(path)` is ([plate.md](../vision/plate.md), static renderer paragraph) |
| Jump in a read-only view | Plate | `platejs/footnote/react`: `FootnotePlugin` | The package keeps the jump's ordering law; Plite's read-only refusal is unchanged |
| Read-only click, keyboard jump and focus after it | Plate | copied registry item `footnote` (`footnote.tsx`) | Gestures and focus are copied-UI policy ([VISION.md](../../VISION.md), Plate essentials) |
| Static anchors and back links | Plate | copied registry item `footnote` (`footnote-static.tsx`) | A static registry item owns its real presentation source |
| Static reuse of definitions | Plate | `platejs/footnote`: `render: { readsDocument: true }` on `BaseFootnoteDefinitionPlugin` | A definition's back links read citations that come later in the document |
| HTML encode, decode and GitHub preparation | Plate | `platejs/footnote`: one `formats.html` mapping per plugin | One plugin keeps its HTML in one mapping ([plate.md](../vision/plate.md), HTML mapping paragraphs) |
| Attribute set | Plate | `platejs`: `PLATE_HTML_ATTRIBUTES` (`HtmlPlugin.ts:1781`) | Every emitted `data-*` name is declared and claimed |
| Footnotes in Word | Plate | `platejs/docx/export`: `DOCX_STATIC_COMPONENTS` (`docxStaticComponents.tsx:176`) | Word bookmarks exist only for headings, so in-page links would dangle |
| Pasted definitions at the root | Plate | `platejs/footnote`: `BaseFootnoteDefinitionPlugin` `commands`, around `replaceSlice` | The definition plugin owns where its block lives, as its transfer veto already does for moves |

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
- A definition pasted into a container lands at the end of the document.
- Apps that copied `footnote` and `footnote-static` keep the old static drawing and gestures until they copy the new version; the registry changelog entry says what changed.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Click a footnote mark in a read-only view | The note scrolls into view and flashes; the caret and history stay; focus moves to the note's back link without a second scroll | step 1.2 jsdom spec; step 1.3 Playwright spec on `/blocks/footnote-demo` in Viewing mode, Chromium five warm runs, Firefox and WebKit once |
| Click a back link in a read-only view | The citation scrolls into view and flashes; focus moves to the mark; a note cited several times opens its picker, and each item jumps | same |
| Enter on a focused mark or back link in a read-only view | Jumps as a click does | step 1.3 Playwright spec |
| Unresolved mark in a read-only view | Nothing happens and no create action shows | steps 1.3 jsdom and Playwright specs |
| Jump in an editable view | Unchanged: Mod+click on the mark and a click on the back link move the caret, focus, scroll and flash | existing `FootnotePlugin.spec.tsx:74-111` and `footnote.navigation.spec.tsx`, rerun |
| A read-only view jumps beside an editable view of the same editor | The editable view's caret and focus stay | step 1.2 two-view jsdom spec |
| Paste a note into a table cell, a quote or a list item | The text lands at the caret, the notes land at the end of the document, the caret stays after the pasted text, one undo restores the document | step 3.1 spec through `editor.update.fragment.replace`; one Chromium native paste of GitHub HTML into a table cell in the step 1.3 Playwright spec |
| Copy from a static page and paste into the editor | The marks and notes come back as footnotes | step 2.2 spec on `renderStaticHtml` output |

## Main changes

- The read that builds the footnote registry once per document revision also builds a path-keyed anchor map, but only on the first `anchor` call for that revision. The live editor's copied UI never calls it, so typing does no new work.
- One pure function computes the ids from a document's children, and both `read.anchor` and the HTML encoder call it, so a static page and exported HTML always agree on ids.
- `BaseFootnoteDefinitionPlugin` declares `render: { readsDocument: true }`, so static reuse redraws definitions whenever a block at or after them changes. References do not, because a reference's id counts only earlier citations.
- `BaseFootnoteDefinitionPlugin` wraps `replaceSlice`. It takes the slice's top-level definitions out, lands the rest at the caret through the next handler, and appends the definitions at the end of the document in the same transaction.
- Each footnote mapping's `prepareDocument` rewrites GitHub's markup in the inert document before decode. The definition mapping runs at priority 70, before Indent (60) and List (50), so GitHub's footnote list items become definitions before List flattens them.
- The DOCX export draws footnotes through its own overrides, the label and the note text with no links, which is what Word shows today.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read-only jump | Returns `false`; Plite refuses the selection write | Scroll the target path, flash it, return `true`; no update, no `dom.focus` | `FootnotePlugin` | Readers need the jump; TOC already scrolls and flashes without a write (`toc.tsx:79-105`) | Docs navigation section, changeset | Step 1.2 spec, step 1.3 browser spec | App code that read `false` as read-only | rearchitect |
| Read-only gestures | Plain click does nothing; Mod+mousedown calls a jump that returns `false` | Plain click and Enter jump; focus moves to the target's jump control after `true` | Copied `footnote.tsx` | Gestures and focus are copied-UI policy | Registry changelog | Step 1.3 specs | A custom copy keeps the old gestures | rearchitect |
| Fragment ids | None | `read.anchor({ path })` returns `{ id, targets }` | `BaseFootnotePlugin` read | One owner for ids that static and HTML share | Copied static item, HTML encoder, docs | Step 1.1 spec | Refs that differ only by a lone surrogate share ids | keep (new) |
| HTML mapping | None; export fails, paste gives links | One mapping per plugin with `data-editor-footnote-*` markers | Both footnote plugins | Export must succeed on footnote documents | HTML docs | Step 2.1 spec, `htmlConformance.spec.ts` | Link paste precedence; GitHub variants | keep (new) |
| GitHub preparation | None | Each mapping's `prepareDocument` turns GitHub's markup into Plate's markers and drops its label heading and back links | Both footnote plugins | One parse path for paste and `parseHtml` | None | `premises-a5.log`, step 2.1 spec | The drop could count as source cleanup, which Vision gives to `DataTransferFormat` | keep (new) |
| Static anchors | `[ref]` text, no link | Links from `read.anchor`, one back link per citation | Copied `footnote-static.tsx` | Static pages and Word export draw through the static kit | Registry changelog | Step 2.2 spec | Two documents on one page share ids | rearchitect |
| Static reuse | Definitions are reused | Definitions declare `readsDocument` | `BaseFootnoteDefinitionPlugin` | Back links read later citations; base reuses stale ones (`static-reuse-a1.log`) | None | Pre-acceptance `static-reuse-a1.log`; production rerun in step 2.2 | Redraw cost after edits at or after the notes | gate |
| Word drawing | The static kit's label, no links | DOCX overrides draw the label and note text, no links | `DOCX_STATIC_COMPONENTS` | Word bookmarks exist only for headings, so static links would dangle | None | Step 2.3 spec and its must-fail control | None | keep (new) |
| Pasted definitions | Land at the caret, inside cells and quotes | Land at the end of the document in the same transaction | `BaseFootnoteDefinitionPlugin` commands | Definitions are root end matter; the veto covers only transfers | Docs | `premises-a5.log`, step 3.1 spec | Table's own `replaceSlice` wrapper order | rearchitect |
| Duplicate reads | `duplicateDefinitions`, `hasDuplicateDefinitions`, `duplicateRefs` | Deleted | `BaseFootnotePlugin` read | Each is one line over `definitions` and `refs`; only tests call them | Docs, mocks, fixtures | Step 1.1 redundancy case, then typecheck | Outside app callers | cut |

## Design

`architect` ran three runners, `gpt-6.1-sol @xhigh`, `claude-opus-5-5 @high` and `gpt-6-astra @xhigh`, and one blind cross-judge, `claude-opus-5-5 @high`. The judge scored Sol 21, Astra 20 and Opus 18 and recommended Astra's candidate as the base, with Opus's `read.anchor` as the replacement if a package static component falls (`docs/plans/artifacts/2026-10-17-footnote-review/architect/judge.md`).

**The base is the Opus candidate, against the judge's pick.** Sol and Astra both add a `platejs/footnote/static` entrypoint, which no feature has, and move the static drawing and its accessibility labels into the package. Vision gives a static registry item its real presentation source, has feature presentation reads take the known path, and keeps accessibility labels out of package defaults. The judge named the Opus read as the fallback, so the base keeps its single read and puts the drawing in copied UI.

Grafts taken:

1. `render: { readsDocument: true }`, from Astra, on the definition plugin only. The pre-acceptance probe shows a reference never needs it (`static-reuse-a1.log`).
2. The root-append paste wrapper through `state.transaction.extend`, from Astra, with Sol's equivalent `next.after` noted. The Opus candidate called the fix a follow-up on a premise the judge proved false.
3. The anchor map keyed by path, from Sol and Astra, instead of a node `WeakMap`, so one node object at two paths cannot collide.
4. One back link per citation, from Sol and Astra. A later duplicate gets no back links, as the editable UI shows it none.
5. `data-editor-footnote-ref` and `data-editor-footnote-definition` markers that carry the raw ref, from Sol, per [plate.md](../vision/plate.md)'s `data-editor-*` law and Mention's precedent (`BaseMentionPlugin.ts:55-94`). Decode reads the ref from the marker, so ids no longer need to round-trip.

The lead's own calls, named for the panel to attack:

- Word draws footnotes as plain text through `DOCX_STATIC_COMPONENTS`, instead of Sol's generic bookmark writer. Word output stays as it is today. Real Word footnotes or bookmarks are a separate change.
- Ids encode the well-formed ref, `encodeURIComponent(ref.toWellFormed())`, so a schema-valid ref with a lone surrogate cannot throw. Two refs that differ only by a lone surrogate share ids.
- Dropping GitHub's label heading and back links is construct preparation in `prepareDocument`, as List flattens its items, not source cleanup in a `DataTransferFormat`. The judge read it the same way and asked the panel to settle it against [plate.md](../vision/plate.md)'s preparation paragraph.
- A reference links to `#fn-<enc>` even when no definition exists, in HTML and on static pages. A dead in-page link does no harm, and the static item needs no resolution read.

Cases a losing candidate handles that the base drops, each made a graft or a named limit:

- Sol's DOCX bookmarks are a named limit. Word shows plain text, as today.
- Sol's `DataTransferFormat` for GitHub's label heading and back links is rejected. It cleans only clipboard paste, so `parseHtml` of GitHub HTML would still keep them.
- Sol's and Astra's package-owned focus with `tabindex` on note content is rejected. The copied item focuses its existing jump controls.
- Astra's flag that Table also wraps `replaceSlice` (`BaseTablePlugin.ts:2527`) is taken as step 3.1's both-orders and multi-cell cases.
- GitHub HTML wrapped in `div.markdown-body` or `article` becomes a step 2.1 fixture.
- Two documents on one page write the same ids. That is a named limit, and copied UI can prefix them.

Premises the base and its grafts rest on, each run before the pick (`docs/plans/artifacts/2026-10-17-footnote-review/premises-a5.log`):

- A definition matcher with no tag at the reference's priority throws "equal priority and overlapping element candidates"; a `div` matcher at the same priority compiles.
- With the reference mapping at priority 10, Link (priority 0) decodes every anchor the footnote decoder declines.
- A definition prepare at priority 70 keeps a three-block GitHub note with a nested list; at 40, List's prepare runs first and the note loses its second paragraph and its list.
- The root-append wrapper lands a pasted definition at the root from a table cell, a quote and a root paragraph, keeps the caret after the reference, and one undo restores the document, with the wrapper installed before or after Table.

The pre-acceptance probe for `readsDocument` froze four count lines before any arm ran and passed every line in every cohort (`docs/plans/artifacts/2026-10-17-footnote-review/static-reuse-a1.log`). An edit before the definitions renders what base renders. Appending after them renders base plus every definition element, which is 21 elements in the normal cohort and 4,001 in the stress cohort of 2,000 notes. Growing the last definition renders base plus the other definitions. The reused DOM equals a fresh render after every operation. A planted arm that also marks references misses the first three lines, and base reuses stale back links after a late citation. Timing ran under happy-dom on a loaded host and is informational only.

This plan reverses three claims from the verdict page. The transfer veto does not keep pasted definitions at the root; phase 3 does. `serializeHtml` writes Plate's `data-editor-footnote-*` markers and no back link, not GitHub's `data-footnote-ref` and a back link. The verdict did not mention Word; this plan keeps Word's plain text on purpose.

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
| API | yes | best-api lens in the verdict, then architect | `read.anchor` and `FootnoteAnchor`; the read-only jump result; the three cut reads | App authors and copied static UI | steps 1.1 and 1.2 specs; the api-plan and api-build panels | planned: steps 1.1, 1.2 |
| Package | yes | platejs | `BaseFootnotePlugin.ts` (anchor ids, HTML mappings, `readsDocument`, paste wrapper), `PLATE_HTML_ATTRIBUTES`, `docxStaticComponents.tsx` | `platejs/footnote`, `platejs/html`, `platejs/docx/export` callers | steps 1.1, 2.1, 2.3 and 3.1 specs; `htmlConformance.spec.ts` | planned: steps 1.1, 2.1, 2.3, 3.1 |
| React adapter | yes | platejs/react | `FootnotePlugin.tsx` read-only branch | `FootnoteKit` | step 1.2 spec | planned: step 1.2 |
| Registry UI | yes | plate-ui | `footnote.tsx` read-only gestures and focus; `footnote-static.tsx` anchors and back links | Apps that copy `footnote` | steps 1.3 and 2.2 specs; the Playwright footnote spec; the hand drive | planned: steps 1.3, 2.2 |
| Composition | yes | plate-ui | `FootnoteKit` and `BaseFootnoteKit` keep their shape; `docx-export` picks up the package overrides | `plugins.ts`, `plugins-static.ts`, `docx-export.tsx` | `docx-export.spec.tsx`; step 2.2's reuse oracle cases | planned: steps 2.2, 2.3 |
| Scale proof | yes | benchmark | the static reuse count lines L1 to L4 | users/maintainers | pre-acceptance `docs/plans/artifacts/2026-10-17-footnote-review/static-reuse-a1.log`; the production rerun in step 2.2 | planned: step 2.2 rerun |
| Registry metadata/examples | yes | plate-ui | a registry changelog entry for `footnote`; regenerated `apps/www/public/r/footnote*.json` | shadcn registry installs | step 4.5 changelog check; step 4.6 `build:registry` read-back | planned: steps 4.5, 4.6 |
| Docs | yes | plate-docs | `content/docs/(plugins)/(elements)/footnote.mdx`; `content/docs/(plugins)/(serializing)/html.mdx` and its Chinese twin | Docs readers | steps 4.1 and 4.2 docs checks and preview | planned: steps 4.1, 4.2 |
| Release artifacts | yes | changeset | a `platejs` changeset | Release notes readers | step 4.5 `pnpm changeset status` | planned: step 4.5 |

Package boundary contract:
| Contract | Decision | Evidence |
| --- | --- | --- |
| shared Plate host | N/A: no new host; the footnote entrypoint keeps its core and combobox imports | `tooling/entrypoints/entrypoint-dag.mjs:89` |
| Plite ownership | N/A: no Plite change; the jump uses `editor.api.dom.scrollIntoView` and Plite's existing read-only refusal | `docs/plans/artifacts/2026-10-17-footnote-review/readonly-selection-a1.log` |
| external dependency ownership | N/A: no new dependency | step 4.6 `pnpm test:manifests` |
| entrypoint runtime | `docx/export` adds `footnote` to its dependencies; no new entrypoint | step 2.3 `pnpm check entrypoint-graph` |
| Oxlint coverage | The existing platejs and www lint cover every changed file | step 4.8 `pnpm lint:fix` on the task's paths |

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| HTML export of a footnote document fails by default, and allowing loss drops the mark | yes | `docs/plans/artifacts/2026-10-17-footnote-review/footnote-html-a1.log` |
| GitHub's footnote HTML pastes as a link, a heading paragraph and a back-link link | yes | same log |
| Static output prints the label with no anchor | yes | same log |
| A read-only view refuses the jump's selection write and leaves an editable view's caret in place | yes | `docs/plans/artifacts/2026-10-17-footnote-review/readonly-selection-a1.log` |
| A pasted definition lands inside a table cell or a quote | yes | `docs/plans/artifacts/2026-10-17-footnote-review/cell-paste-a3.log` |
| Mapping priorities, Link fall-through, prepare order and the paste wrapper behave as the design assumes | yes | `docs/plans/artifacts/2026-10-17-footnote-review/premises-a5.log` |
| Word bookmarks exist only for headings, so in-page links would dangle | yes | inferred from source: `render-document-file.ts:166-181` registers heading bookmarks only, and `docx-bookmarks.spec.ts:47-52` keeps an unmatched anchor link; step 2.3's must-fail control proves it at runtime |
| The footnote paths are unchanged between the review commit and `HEAD` | yes | `git diff --stat 4f880fc570 8f5afd571d` over the footnote, HTML, static and DOCX paths prints nothing |
| Feature Manifest complete before source writes | yes | Feature Manifest above; every row filled, each status closes at its step |
| Flow mode selected | yes | existing package plus React/registry |
| Public API decision owner selected | yes | `best-api` lens in the verdict, then `architect` (decision log `architect` rows) |
| Runtime scale applicability resolved | yes | Scale proof yes: `readsDocument` changes static reuse, which is repeated-unit work; `performance-observability` selected |
| Pre-acceptance Benchmark receipt selected | yes | `static-reuse-a1.log`: base arm at `4f880fc570`, candidate and planted arms with prototype static components that call the anchor read; cohorts normal, large, stress and pathological; lines L1 to L4 frozen and printed before the first arm; element render counts; timing informational under happy-dom at host load 11.25 on 18 cores; correctness guard L4, reused DOM equals a fresh render |
| Public feature entrypoint decision recorded | yes | No new entrypoint; the Design section rejects `platejs/footnote/static` |
| Conditional packs selected | yes | `performance-observability` only |
| Performance pack selected | yes | for the static reuse row |
| User-facing operation and runtime owner identified | yes | Rerendering a static document after an edit; `EditorStatic` reuse in `PlateStatic.tsx`. `serializeHtml` and `exportDocx` render once and reuse nothing |
| Scale variables and cohorts fixed | yes | Body blocks, notes and citations per note: normal 1000/10/1, large 1000/200/1, stress 4000/2000/1, pathological 2000/1/2000 |
| Budget frozen before target measurement | yes | Lines L1 to L4, printed at the top of `static-reuse-a1.log` before any arm ran |
| Baseline and target probe selected | yes | Base arm without `readsDocument`, candidate arm with it on definitions, planted arm with it on references too |
| Correctness guard selected | yes | L4, plus base's stale back links after a late citation |
| Production detector decision recorded | yes | N/A: static rendering has no runtime detector; the reuse oracle spec is the regression guard |

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`). Execution authority: this run's Pursue, which continues into the build under Autopilot. The build edits this checkout on `next` and commits nothing. Each step's proof names its base control, the half that must fail at `HEAD`. Before the build, the plan ran the base controls of steps 1.1, 1.2, 1.3, 2.1, 2.2 and 3.1 at `8f5afd571d` in a detached worktree, and each failed for the defect its step names (`docs/plans/artifacts/2026-10-17-footnote-review/base-controls-a1.log`, decision log `plan` rows). Step 2.3's control is a mutant and runs in the build.

### Phase 1. Jump in read-only views

Keep it when steps 1.1 to 1.3 fail at base and pass on the change, and the Playwright spec passes five warm Chromium runs, Firefox and WebKit. Revert the phase otherwise.

- [ ] 1.1 Move the registry walk in `BaseFootnotePlugin.ts` into one pure function over a document's children and the two element types, which also computes, on first use, a map from path to `FootnoteAnchor = { id: string; targets: readonly string[] }`. A reference's id is `fnref-<enc>`, then `fnref-<enc>:<n>` for its nth citation; its targets are `['fn-<enc>']`. A definition's id is `fn-<enc>`, then `fn-<enc>:<n>` for its nth duplicate; the canonical one targets every citation, and a later duplicate targets none. `<enc>` is `encodeURIComponent` of the well-formed ref. Add `read.anchor({ path })`, which returns `undefined` for a path that holds no footnote, and export `FootnoteAnchor` from `platejs/footnote`. Before the cut, add one spec case that runs each removed read beside its replacement under Hard cuts on the duplicate fixtures and asserts equal results, run it at base, then delete the reads with that case, their spec lines and the `footnote.slow.tsx` mocks. Proof: `BaseFootnotePlugin.spec.ts` anchor cases for refs `1`, `a b`, `#x`, `1-2`, `1:2`, `ü` and a lone surrogate, a note cited three times, a duplicate definition, an uncited definition, an unresolved reference and a path with no footnote, red at base through `node tooling/scripts/proof-worktree.mjs <path> 8f5afd571d --with <spec> --dir docs/plans/artifacts/2026-10-17-footnote-review --name p1-1-red --expect-fail "<case title>" -- bun test <spec>` from `packages/platejs`, and green on the change; the redundancy case's log at base; the platejs and www typechecks after the cut.
- [ ] 1.2 In `FootnotePlugin.tsx`, when the view is read-only, resolve the target path through `read`, call `editor.api.dom.scrollIntoView(path)`, flash it through `NavigationFeedbackPlugin` when installed, and return `true`, with no update and no `dom.focus`. An unmounted view or a missing target still returns `false`. The editable branch is unchanged. Proof: `FootnotePlugin.spec.tsx`'s read-only case (lines 116-124) asserts `true`, one scroll to the target path, one flash in the calling view, an unchanged selection, no focus call and no history entry, and `false` once unmounted; a two-view case asserts the editable view's caret and focus stay when the read-only view jumps. Both cases red at base through `proof-worktree.mjs --with --expect-fail`, green on the change, and the file's editable cases (lines 74-111) green.
- [ ] 1.3 In the copied `footnote.tsx`, in a read-only view only, a plain click or Enter on the reference chip calls `focusDefinition`, and on the back link calls `focusReference`, or opens the picker when the note has several citations, each item jumping. After a `true` return, focus the target's jump control with `preventScroll`. The chip's and back link's mousedown handlers return early in a read-only view, so one click jumps once and Mod+mousedown never calls `createDefinition` there. A read-only unresolved chip does nothing and shows no create action, and the renumber button is hidden. Editable gestures are unchanged. Proof: `footnote.navigation.spec.tsx` cases for a read-only click and Enter on the chip, the back link and a picker item, each scrolling once, an unresolved chip that does nothing and throws nothing, and an editable plain click that does nothing, red at base and green on the change; then a new `apps/www/tests/browser/footnote-navigation.spec.ts` on `/blocks/footnote-demo` that switches to Viewing through the mode button, clicks the first mark, sees the note in the viewport, the flash attribute on it, the caret unchanged and focus on its back link, then presses Enter to jump back, and pastes GitHub's footnote HTML into a table cell with the native clipboard and sees the note at the end of the document. Run it with `PLAYWRIGHT_BASE_URL` named, Chromium five warm runs without retries, then Firefox and WebKit once, each through `proof.mjs`; the paste case runs in Chromium only, because only Chromium exposes clipboard permissions to automation.

### Phase 2. Links in HTML, static pages and Word

Keep it when steps 2.1 to 2.3 pass and step 2.2's production rerun meets every frozen line. A conclusive miss on a frozen line sends static reuse back to `architect`; the HTML and Word parts stay, and the static item keeps today's label with no link until the redesign lands. Revert the phase when an HTML or Word case fails.

- [ ] 2.1 Add the reference mapping to `BaseFootnotePlugin` at priority 10: match `{ tag: 'a', attributes: { 'data-editor-footnote-ref': true } }`. Its `prepareDocument` gives each `a[data-footnote-ref]` whose `href` is `#user-content-fn-<ref>` or `#fn-<ref>` a `data-editor-footnote-ref` of the decoded ref, and replaces a `sup` that holds only such an anchor, apart from whitespace and the void spacer, with the anchor. Decode returns `{ children: [{ text: '' }], ref }` and preserves the marker, or `undefined` so Link takes the anchor. Encode writes `<sup><a data-editor-footnote-ref href id>` with the ref as its text. Add the definition mapping to `BaseFootnoteDefinitionPlugin` at priority 70: match `{ tag: 'div', attributes: { 'data-editor-footnote-definition': true } }`. Its `prepareDocument` turns each `section[data-footnotes] > ol > li[id]` into such a `div` holding the item's children, removes `[data-footnote-backref]` and `[data-editor-footnote-backref]` links inside it, and replaces the section, label heading included. Decode returns `{ ref }`, and the children decode as blocks. Encode writes the `div` with its `id` and no back link. Both encoders take ids from step 1.1's function over the encode context's `document`, `root` and `path`. Add both names to `PLATE_HTML_ATTRIBUTES` and footnote fixtures to `htmlConformance.spec.ts`. Before writing the GitHub fixtures, read the repeated-citation markup from GitHub's renderer source at `../cmark-gfm`, cloned if missing. Proof: spec cases, red at base and green on the change, for `serializeHtml` under the default policy of a note cited twice, a duplicate definition and an unresolved reference, with the exact markup; `parseHtml` of that output back to the same document; GitHub fixtures for a single citation, a repeated citation and a three-block note with a nested list, bare, inside `div.markdown-body` and inside `article`, giving references and root definitions with no heading, no back-link text and no loss report for the chrome; a `data-footnote-ref` anchor whose `href` names no footnote decoding as a link; a plain ordered list staying a list; and `htmlConformance.spec.ts` green.
- [ ] 2.2 In the copied `footnote-static.tsx`, draw the reference as a `sup` holding an anchor with `data-editor-footnote-ref`, `href="#<targets[0]>"`, `id` and the text `[ref]`, and the definition as a `div` with `data-editor-footnote-definition` and `id`, its label, one `data-editor-footnote-backref` link per target with the copied item's accessibility label, then its content. Declare `render: { readsDocument: true }` on `BaseFootnoteDefinitionPlugin`. Add footnote cases to `PlateStatic.reuse-oracle.spec.tsx` with static components that draw `read.anchor`: a citation added after the definitions and a note grown at the end. Proof: a `renderStaticHtml` spec of the kit's static output with the exact anchors, and its HTML parsed back to the same footnotes, red at base; the oracle cases green, and red with `readsDocument` removed through `mutate.mjs`; then, through `benchmark`, a rerun of the static-reuse probe with the copied static components in place of the prototype, on the final bytes, against the same frozen lines L1 to L4 and the planted arm, and a `benchmark-checklist` pass before any `verified` row. A conclusive miss sends static reuse back to `architect`, as Phase 2's rule says.
- [ ] 2.3 Add `FootnoteReferenceDocx` and `FootnoteDefinitionDocx` to `DOCX_STATIC_COMPONENTS`, drawing today's label and note text with no links, and add `footnote` to the `docx/export` dependencies in `entrypoint-dag.mjs`. Proof: an `exportDocx.presentation.spec.tsx` case that exports a footnote document through the copied static kit and finds the label and note text and no `w:hyperlink`, green at base and on the change, beside a must-fail control with step 2.2's static item and the overrides removed through `mutate.mjs`, which finds a `w:hyperlink` whose anchor has no bookmark; `docx-export.spec.tsx` green; `pnpm check entrypoint-graph` green.

### Phase 3. Pasted notes land at the end

Keep it when every step 3.1 case passes in both plugin orders. Revert the phase otherwise.

- [ ] 3.1 In `BaseFootnoteDefinitionPlugin`, add `commands: ({ around }) => [around(editorCommands.replaceSlice, …)]`. It takes the slice's top-level definitions out, sends the rest through `next` with a slice from `ContentSlice.withContent`, closing an edge only where a definition was removed from it, and appends the definitions at `[children.length]` in the same transaction through `state.transaction.extend`, as `createDefinition` places a new one. A paste of only definitions removes an expanded selection as any paste does and leaves a collapsed caret in place. A refused `next` refuses the paste and appends nothing. Pasted duplicates stay, and the copied duplicate warning flags them. Proof: spec cases, red at base and green on the change, through `editor.update.fragment.replace` with the caret in a table cell, a quote, a list item and a root paragraph: the definition lands at the root end, the caret stays after the pasted text, and one undo restores the document, with the plugin installed before and after Table; a multi-cell table selection; a definitions-only paste, collapsed and expanded; a pasted duplicate that stays; a `maxLength` refusal that leaves the document unchanged; and GitHub's footnote HTML pasted through the HTML paste path into a table cell. The native paste case in step 1.3's Playwright spec covers the browser path.

### Docs, release and proof

These ship with whichever phases are kept.

- [ ] 4.1 Through `plate-docs`, update `content/docs/(plugins)/(elements)/footnote.mdx`: the navigation section's read-only behavior and return values, a `read.anchor` API entry, the removal of the three reads, HTML export and GitHub paste, static and Word output, and where pasted notes land. The page has no Chinese twin, so `/cn/docs/footnote` serves the English page. Proof: the docs source and parity checks, and a hand drive of the page.
- [ ] 4.2 Through `plate-docs`, update `content/docs/(plugins)/(serializing)/html.mdx` and `html.cn.mdx` where they list what encodes and what paste reads. Proof: the docs checks, and a hand drive of both locales.
- [ ] 4.3 Reconcile `docs/editor-behavior/markdown-editing-spec.md`'s footnote Plugin surface list (line 3477) with the final reads and the read-only jump. Proof: `teaching-sweep.mjs` in step 4.7 shows no live hit there.
- [ ] 4.4 Point the search fixtures in `apps/www/src/lib/search-result-groups.test.ts:31` and `apps/www/src/app/api/search/route.test.ts:57` at a surviving footnote read. Proof: both tests green.
- [ ] 4.5 Through `changeset`, add a `platejs` changeset for `read.anchor`, the read-only jump's `true`, the three removed reads, HTML export and GitHub paste, Word output and pasted-note placement, and a registry changelog entry for the copied `footnote` gestures and static anchors. Proof: `pnpm changeset status` and the registry changelog check.
- [ ] 4.6 Run `pnpm --filter www build:registry`, and regenerate `apps/www/src/generated/api-reference-manifest.json` in a `proof-worktree.mjs --install` worktree that builds `plitejs` and `platejs` first. Proof: the regenerated `footnote` registry files read back with the new static source, `pnpm --filter www api-reference --check`, and `pnpm test:manifests`.
- [ ] 4.7 Through `best-api repair`, run `node tooling/scripts/teaching-sweep.mjs duplicateDefinitions hasDuplicateDefinitions duplicateRefs` and search the plans and agent instructions for the read-only `false` promise; fix each live hit this task owns and flag the rest on the page. Proof: the sweep log with no live hit.
- [ ] 4.8 Through `verify`, run `node tooling/scripts/hand-drive.mjs scope` on the changed files, drive every cell it lists, and run its `check`; then `pnpm lint:fix` on the task's paths only, as the last check that edits code. Proof: the `check` log and the lint log.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Manifest coverage | yes | Run `node tooling/scripts/check-plate-feature.mjs docs/plans/2026-10-17-footnote-review.md` | pending |
| Selected pack closure | yes | Close `performance-observability` with step 2.2's production rerun | pending |
| Package proof | yes | Steps 1.1, 1.2, 2.1, 2.3 and 3.1 specs, the platejs typecheck and `htmlConformance.spec.ts` | pending |
| Package boundary proof | yes | `pnpm test:manifests`, `pnpm check entrypoint-graph` and scoped lint | pending |
| Scale proof | yes | Step 2.2's rerun of the frozen lines on the final bytes, plus the oracle cases | pending |
| Registry/browser proof | yes | Step 1.3's Playwright spec and step 4.8's hand drive | pending |
| Docs/release proof | yes | Steps 4.1, 4.2, 4.5 and 4.6 | pending |
| Writing passes | yes | `deslop` and `no-comments` on product code, `unslop` on prose | pending |
| Diff panel (reviews: api-build) | yes | A panel on the build's diff | pending |

## Proof

Each step's proof is named on its box. The close adds the hand drive across every page `hand-drive.mjs scope` lists, step 2.2's production rerun, the diff panel and the decision-trail review.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What happens next | Build this plan | Stop at this plan | hold | big |
| A jump in a read-only view | Scroll to the target and flash it, and leave the caret alone | Keep doing nothing in read-only views | keep refusal | big |
| The three test-only duplicate reads | Remove them in this plan (look) | Keep them | keep reads | small |
| Focus after a read-only jump | The target's own jump button, so Enter jumps back | Focus stays on the mark you clicked | focus stays | small |
| HTML footnote markup | GitHub-style links tagged with Plate's own attributes, and GitHub's own markup still pastes | Copy GitHub's exact attributes | github markers | small |
| Notes pasted into a cell or a quote | Moved to the end of the document | Left where the caret is | leave nested | small |
| Footnotes in Word | Plain text, as today, with no jump links | Jump links through Word bookmarks, a bigger Word change | word links | small |
| Static back links | One per citation | One to the first citation only | first only | detail |
| A mark with no note on a static page | Links to where the note would be | No link | no link | detail |
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
2. **Change the jump and add HTML and static anchors. Wins.** `focusDefinition` and `focusReference` keep their names and their editable behavior. In a read-only view they resolve the target through `read`, scroll the calling view and flash it, as copied TOC does (`apps/www/src/registry/components/editor/toc.tsx:79-105`), with no update. Both plugins get one HTML mapping each, and the static item draws the same ids through one new read. Design above holds the architect's final shape.
3. **Select the target in every view, read-only included. Loses.** It would be one code path, and Lexical's example does it. Plite refuses the update, and the 2026-10-17 probe confirms it. Writing from a read-only view would also move the caret of an editable view of the same document, which Details already works around (`packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts:225-229`).
4. **Delete the package jump and let copied UI compose it, as TOC does. Loses.** It deletes two methods. But the editable jump has a real ordering law: commit the selection, focus, scroll last, then flash, in the calling view. Its spec pins that law (`packages/platejs/src/react/features/footnote/FootnotePlugin.spec.tsx:74-111`), and every custom footnote UI would have to rebuild it. TOC has no selection, so its copy is two calls.
5. **A shared reveal helper on `NavigationFeedbackPlugin` for TOC, footnotes and Find. Loses.** It adds a public noun for a two-call composition, and Vision gives each requesting feature its own navigation policy.
6. **A named end-matter root for definitions. Loses**, as in 2026-10-04. The transfer veto keeps moved definitions at the root, and phase 3's paste wrapper keeps pasted ones there. A second root adds mounting, cross-root jumps and conversion work.
7. **Strongest deletion inside the scope: cut `duplicateDefinitions`, `hasDuplicateDefinitions` and `duplicateRefs`. Wins, as a small part of lane 2.** No production code calls them. Only docs, the plugin spec and mocks in `footnote.slow.tsx` name them, and each is one line over `definitions({ ref })`. Vision names no job for them, and `isDuplicateDefinition` serves the copied duplicate warning. The predicted benefit is three fewer public reads to learn and document, with no runtime change. The plan's Close marks that prediction held or falsified.

**Proof limits.** The HTML, paste and static claims come from probes on source at `4f880fc570`, whose footnote, HTML, static and DOCX paths `8f5afd571d` does not change: `footnote-html-a1.log`, `cell-paste-a3.log`, `premises-a5.log` and `static-reuse-a1.log` in `docs/plans/artifacts/2026-10-17-footnote-review/`. The read-only claim comes from one two-view jsdom probe, `readonly-selection-a1.log` in the same folder. The base controls ran at `8f5afd571d` under happy-dom (`base-controls-a1.log`). No browser ran. The editor comparison is a source read by a Codex seat, `editors-answer.md` in that folder, which ran nothing. GitHub's ids for a note cited twice were not read; step 2.1 reads them from GitHub's renderer before writing its fixtures. DOCX footnote import stays out of this target.

### Dependents

- `react`: affected. `packages/platejs/src/react/features/footnote/FootnotePlugin.tsx` holds both jump commands that change.
- `ui`: affected. `apps/www/src/registry/components/editor/plugins-static.ts` composes `BaseFootnoteKit`, whose static renderers change, and `apps/www/src/registry/components/editor/plugins.ts` composes `FootnoteKit`, whose chip learns a plain-click jump in read-only views.
- `basic`, `callout`, `canvas`, `code`, `date`, `link`, `math`, `media`, `slash`, `table` and `toc`: unaffected. They reach this scope through `apps/www/src/registry/components/editor/insert-toolbar-button.tsx` and `apps/www/src/registry/components/editor/slash.tsx`, which only check `installed` and call `insert`, and neither changes. `link` also meets the reference mapping on paste, which falls through to Link for any anchor that names no footnote. `table` also wraps `replaceSlice`, and step 3.1 runs both install orders.
- `distribution` and `editing`: unaffected. They reach this scope only through `packages/platejs/src/utils/plate-keys.ts`, a member that holds the shared `PLUGINS` names, which do not change.

### History

- This review retains [2026-10-04-footnote-audit](../research/review-records/2026-10-04-footnote-audit.json), because its Pursue, its rejected end-matter root and its rejected schema-level uniqueness still hold; it adds the measured HTML, read-only and paste evidence, and the cut of the three unused reads.
- This review retains 2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit, because its removal of duplicate target subscriptions from the copied footnote UI still holds.
- [2026-04-04-footnote-support](2026-04-04-footnote-support.md), [2026-04-04-footnote-sync-architecture](2026-04-04-footnote-sync-architecture.md) and [2026-07-12-plate-next-footnote-indent-juice-package-reviews](2026-07-12-plate-next-footnote-indent-juice-package-reviews.md): historical. The registry and first-definition-canonical design they built is the current one.
- Member changes since 2026-10-04, read with `git log`: `0dfa19ab11` and `209e00b948` touch the copied chip's combobox return and selection mode, `002891202b` extends the veto to side wraps, and `422564e6f6` adds `txLocate` and `txSelection` markers and the Markdown paragraph type. None changes navigation or conversion.
- External checkouts read: `../milkdown` at `6a4db480b00db8dd0322b517117dfa2154f3e2e2`, `../lexical` at `dd5c41b13193efa9ab1574234d8593d2c9e4f988`, `../prosemirror-website` at `a16b4ece45f135e5f001ab59d25f2d43c25974e1`, `../ckeditor5` at `14e73cc31b869ce483bd8449f40b9102ac7746da`, `../tiptap` at `91c51be53c4655ef07e29ec489471524debfa0ca`, `../BlockNote` at `1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163`, `../slate` at `945a484df2497e4c448b33f417b0de2a49840032` and `../micromark` at `6577c200155e9c6b85a42b26d298f8affc348f2f`.
