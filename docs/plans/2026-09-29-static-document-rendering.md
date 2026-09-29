---
review_scopes:
  - conversion-boundary
  - html
review_basis:
  - 2026-09-29-conversion-next-static-read-review
  - 2026-09-29-static-preview-document-review
work_kind: implementation
---

# Static document rendering

Status: Complete — all three steps adopted and measured on the final tree (S5 snapshot w)

Objective:

Every read of a rendered document sees one immutable document; HTML reports
every property it cannot emit; static previews re-render only what changed,
including renderers that read beyond their element.

Completion threshold:

1. A document view resolves direct reads, plugin read groups and APIs against
   its document. The partial Plate facade is deleted.
2. HTML serialization and parsing preserve or report every schema property,
   through actual-emission claims shared with Markdown's model and guarded by a
   round-trip conformance harness.
3. Static rendering reuses unchanged elements across documents, while
   document-dependent renderers (the table of contents) update. Preview,
   export and copy stay correct; S5 static and AI cells are re-measured.

Verification surface:

The table of contents rendered through `EditorStatic document`,
`renderStaticHtml` and plugin reads; the HTML conformance harness and image
`title`; static memo specs; S5 static and AI cells; package, www, browser and
doctrine gates.

Constraints:

No mutable stable view, public view hook or universal codec. Registry
customization keeps working. React Server Components keep working. No staging
or commit; the user owns commits on `next`.

Boundaries:

Plite owns the document binding of a view and validation. Plate's static
renderer owns render reuse and its dependency contract. Plate's HTML compiler
and feature mappings own HTML accounting. Registry UI owns presentation only.

Blocked condition:

None. A render-dependency contract that cannot stay correct under React
Server Components stops step 3 and returns to Best API review.

Work Checklist:

- [x] Step 1: `createEditorView(editor, { document })` in Plite; delete the
  Plate facade; table-of-contents coherence tests through `EditorStatic` and
  `renderStaticHtml`.
- [x] Step 2 (lane html-accounting): actual-emission HTML claims, a round-trip
  conformance harness, image `title`.
- [x] Step 3: render reuse with declared document dependencies; S5 static and
  AI re-measure.
- [x] Docs, doctrine, changesets, registry output, ledger.

## Decisions

### Step 1: a document view in Plite

`createEditorView(editor, { document })` returns a read-only view bound to an
immutable document:

- Every read resolves against the document, including direct reads, plugin read
  groups, plugin API factories, `read.value()` and `read.meta()`.
- It has no selection and no last commit, and never notifies subscribers.
- The source's authored projection does not apply, because the document is
  already projected.
- The source schema validates it once. `authored` is refused, and
  `setViewState('readOnly', false)` is ignored.

Plate's `EditorStatic`, `EditorPreview`, `renderStaticHtml`, plain-text
serialization and HTML serialization use it. The partial facade (a base view
spread with an overridden `read`) is deleted.

Plugins read the document through their context editor or `state`. An editor
captured in `.extend(({ editor }) => …)` is still the source editor, and it
stays that way on purpose. A probe shows the captured editor reads 1 block
while the API context and render context read the document's 3. This is the
standing multi-view rule, now written into the static guide and the Plate UI
and Best API doctrine.

### Step 2: HTML claims what it writes

HTML serialization follows the Markdown claim law (html-accounting lane):

- **Claims:** the blanket per-owner coverage set is deleted.
  - Element encoders, including `createsElement`, and encoders that receive
    `values` claim with `preserve(...ownedKeys)`. `preserve` is typed to the
    target's own properties and throws on a foreign key.
  - A single-`value` mark or property mapping claims its value by returning
    output that writes it.
  - Claims from discarded output do not count.
- **Reports:** each unclaimed content property reports
  `html-unsupported-content` (`kind: 'attribute'`, `model.property`) as a
  warning under every policy. A lost element follows `lossPolicy` once.
  Clipboard `text/html` is still written only when nothing is lost.
- **Features:** heading, code block, link, mention, table, list, image,
  audio, video and media embed claim what they write.
  - Image `title` and video and embed `provider` and `sourceUrl` are now
    written and read back.
  - Pixel media widths read back as numbers.

Remaining limits:

- An image list item reports `listType`, because the HTML list encoder builds
  only paragraphs.
- Partial table borders read back with their rendered defaults.
- HTML attributes that no decoder reads are not accounted on parse.
- Custom element encoders with properties must call `preserve`, or their
  properties warn and clipboard HTML is withheld.

### Step 3: block reuse, with a declaration for later content

Static rendering reuses a top-level block's subtree across documents of the
same editor while that block and every block before it keep their identity.

Renderers that read their own block are safe under this rule (table cell
borders read their table). So are renderers that read earlier blocks: list
ordinals read previous siblings. The registry audit of static renderers found
four that read through `editor`:

- `toc-static`: reads every heading, including later ones.
- `block-list-static`: reads the ordinal, which depends on earlier blocks.
- `table-static`: reads the cell's own table.
- `link-static`: reads only the element.

Only the table of contents reads content after itself. It declares
`render: { readsDocument: true }` on `BaseTocPlugin` and renders again
whenever the document changes.

The same rule fixes a stale case that predates this plan. A live editor
re-rendered through `EditorStatic` after a commit used to reuse an unchanged
TOC element while its headings changed.

Decorations are value inputs. The S5 lane found that a reused block kept
its nested decorations: they are computed inside the memoized subtree. The
AI preview's end marker reads the last text of the whole document, so a block
that stopped being last kept its marker. The baseline arm ended with 3–4
markers where a fresh render has 1; the candidate passed only because the
parser happened to replace that block. The same gap already existed for a
live editor re-rendered after a store-driven decoration change.

`EditorStatic` now reads every decoration source over each top-level block's
subtree, and every element in the block compares that array by value.
Decoration sources can therefore read anything: decorate work is O(nodes) per
render, as it was before reuse, while React work stays proportional to the
change.

Auditing decoration sources found the code highlighter reading its parent
block and key through the editor captured in `.extend`. That is the source
editor, so previews and exports highlighted from the wrong document. It now
reads through its decorate context.

A read-only audit of plugin reads, decorations, APIs and format mappings
found two more wrong-document reads, both fixed:

- **Find:** match ranges were computed from the source document and painted,
  path for path, onto any document a view rendered. Find now paints only on
  the document it searched. Its search session stays the source editor's.
- **Markdown:** `serialize()` without a `document` serialized the captured
  source editor's value. It now serializes the value of the editor it is
  called on, so a document view serializes its document.

The registry static components read through `props.editor`.

S5 then found a fifth defect: table cells lost their borders in document
views. This one was in Plite. `nodes.path(node)` looked a node's key up once,
and a projected document registers its nodes' keys only when its index
materializes. `state.key(node)` already materialized and retried; node
targets now do the same, but only under a read projection, so a failed lookup
on a live editor never forces a full index build.

That made four captured-editor bugs and one Plite resolution bug, so under the
Pokayoke rule the mechanism gets a guard rather than another patch:

- Plite marks document views.
- `withDocumentViewRead(view, fn)` scopes code running on a view's behalf:
  - Plite enters it for every read through a document view.
  - Plate enters it for decoration reads and for the synchronous static
    element render pipeline.
- Inside the scope, the source editor's public `read` and `key` entries
  throw an error that names the fix. A view's own reads use the runtime
  read, not these entries, so they pass.
- With the guard, the code-highlight bug fails with that error instead of
  rendering no highlighting.
- The first full run caught a false positive in the AI menu and the streaming
  demo: Plate's inject matcher calls `view.read.schema.isBlock`, and views
  share the source's schema group, which ran through the guarded `read`.
  Schema queries read the shared model, not the document, so the source's
  `read.schema` group is now built from the unguarded reader. The Plite
  guard law asserts that a schema query passes.
- The Plite test typecheck then failed in `object-selection.test.tsx`:
  `getEditorLiveSelection(schemaEditor)` stopped relating to `AnyEditor`.
  - Additive bisection showed that unrelated additions each flip the result,
    even just exporting the guard from `plitejs/internal`.
  - `Editor<any>` is not a structural top type for a schema-typed editor, so
    the call passes only when TypeScript's `any`-variance shortcut applies,
    and whether it applies depends on check order.
  - The internal helper needs only the runtime owner, so it is now typed that
    way, as are the guard's functions. Plite typecheck is 13/13.

Coverage limits:

- Deferred React component bodies and plugin API calls run outside the scope.
- Plugins whose state is derived from the source (find) are not detectable
  this way.

S5 on snapshot u, with code highlighting working in previews, exposed one
more issue. The AI end marker decorated the whole last text, so when
highlighting split a code line, every segment got a marker: 6 purple dots on
the CJK 10 KB stream. The marker is now its own decoration on the last code
point, so the dot, the CSS and `scrollAIPreviewEnd` see one element.
`ai-menu.spec` asserts a single marker whose text is the last character. The
registry changelog row for `ai-menu` says so.

S5 on snapshot u put the cost of reading every block's decorations at 13–27
ms per publication at 50 KB. That is about half of what block reuse saved,
although React time stayed 58–82% below projection-2. A headless per-source
measurement narrowed it down:

- `codeSyntax` was the only decoration source in the AI kit.
- 20 of its 32 ms per full pass went to resolving
  `editor.plugin(BaseCodeBlockPlugin)` for every text node. On an existing
  portal, `.schema.type` is nearly free.

The highlighter now reuses its live portal, so a full pass is about 1.7× one
node read instead of 6.7×.

S5 on snapshot v broke the decoration read down by source from browser
profiles:

- The highlighter's `decorate.read` is 62–76% of the decoration read.
- Its own work (lowlight, `NodeApi.string`, `isText`) is about 1%. The rest
  is per-node reads and plugin lookups.
- Plate's per-node source wrapper is 24–29%.

The profiles also exposed a Plite owner defect. `createEditorViewPluginApis`
refresh built and sorted the whole compiled configuration on every
`view.plugin()` lookup just to read its revision, about 8% of React time at
static rich 50 KB. It now reads the registry's revision directly. Caching the portal's schema identity per published
model was tried and dropped: the cost is in portal resolution, not in the
identity.

Rejected alternatives:

| Alternative | Why not |
| --- | --- |
| Make a captured editor read the rendering view (dynamic scoping) | Fixes captured reads silently. A read that means the source would return the document, and the doctrine already names the context editor. |
| Lint plugin closures | Cannot tell a schema read from a document read. |
| Declare document-reading decoration sources | A second declaration, and store-driven decorations (comments, find) would still go stale. |
| Re-check only the old and new last block | Special-cases one source. |
| Memoize by element identity with a stable source view | Reuses list items after an inserted block and a TOC after a new heading. A mutable stable view also breaks concurrent rendering. |
| Automatic read tracking during render | Element components run after `BaseElementStatic` returns, so reads cannot be attributed to an element without a per-element editor identity. |
| Explicit render inputs compared by value (like ProseMirror decorations) | A second input channel for four renderers. Prefix reuse already covers the backward readers. |
| A per-component marker | Lost through wrappers and overrides. The plugin owns what its element means. |
| No reuse | The streaming preview stays O(document) React work per publication. |

Limits:

- A change reuses only the unchanged prefix. After an edit in the middle of a
  revision, every later block renders again. Streaming changes the tail, so the
  suffix is small there.
- Inside a changed block, every element renders again.
- A renderer that reads later content without declaring it shows stale output;
  the docs, the plugin reference and the Plate UI rule state the declaration.

Verification evidence:

- Step 1:
  - The reviewer probe passes all 5 checks through the delegating facade
    (`probes/2026-09-29-static-document-rendering/reviewer-projected-reads-delegating-facade.json`).
  - The same checks pass through the public API
    (`probes/2026-09-29-static-document-rendering/projected-reads.{ts,json}`).
  - Plite `editor-runtime-view-contract.ts`, "document views": 3 tests. Reads,
    plugin reads, plugin APIs, value, selection, last commit and read-only;
    named roots; refused updates and schema-invalid documents. Two of the three
    fail with the binding disabled.
  - `PlateStatic.spec.tsx` TOC test renders through `EditorStatic` and
    `renderStaticHtml`, and fails with the old facade.
  - The first full run failed `authored HTML > renders accepted and proposed
    semantic projections`: the source's authored read replaced the document
    projection. Document views now skip it.
  - Plite 2,946/2,946 and typecheck 13/13.
- Step 3:
  - `PlateStatic.spec.tsx` asserts:
    - a tail append renders only the new block;
    - an in-place change to the first block renders it and every later block,
      and updates the previous-block text a later block shows;
    - a TOC shows a later heading.
  - Mutations:
    - the old identity memo fails the reuse test;
    - dropping the prefix rule fails it;
    - removing `readsDocument` fails the TOC test.
  - "Marks only the last text when a reused block stops being last" failed
    before block decorations became a memo input (`b` kept its marker) and
    passes now. Static 55/55.
  - Code block spec "highlights the code block of the document a view
    renders" failed with the captured editor and passes now. Code block
    59/59.
  - Find "paints matches only on the document it searched" and Markdown
    "serializes the document a view reads by default" failed before their
    fixes. find 6/6, markdown 225/225, registry `find.spec` 20/20 (the
    editable still renders `data-find-match`).
  - Plite "resolves document nodes as targets" failed before the resolver fix
    (`nodes.path(node)` was undefined). The table probe now returns cell
    info by element on a document view.
  - Plite "refuses a source read made while the view reads" fails without the
    assertion. Plite 2,947/2,947.
  - Restoring the captured read in the code highlighter fails its spec with
    the guard's message.
  - Every platejs partition passes with the guard, and typecheck is 90/90.
- Step 2 (lane receipts in
  `probes/2026-09-28-conversion-boundary/lanes/html-accounting/`):
  - The reviewer's `html-property-loss.ts` probe exits 0 (`probe-after.json`).
  - `html/htmlConformance.spec.ts` covers 30 fixtures plus a false-claim
    self-test: a property lost without a report fails, and so does a reported
    property that survives.
  - Mutations:
    - `preserve('title')` without writing `title` fails.
    - Dropping `preserve('level')` fails both heading fixtures.
  - Partitions: html 46, html-server 1, docx-export 128, docx-import 34 + 13
    and docx-paste 15.
  - The lane's slow run is back to `HtmlPlugin.mapping.slow` 1/4, the
    html-safety baseline, whose benchmark fixture leaves `<img>` unclaimed.
- The facade is deleted. Its entry is removed from the raw-Plite import
  allowlist, in `oxlint.config.ts` and its test. The same test found
  `internal/utils/trustedContentSlice.ts` missing from that allowlist; it is
  added. Test: 21/21.
- platejs: every partition passes, and typecheck is 90/90.
- www:
  - `ai-menu.spec` 1/1, `toc.spec` 7/7, markdown streaming demo 11/11 and
    `plugins-static.spec` 2/2, each in its own process. `toc.spec` mocks
    `platejs/react` for the whole process, so running the files together fails
    `ai-menu.spec`; that is pre-existing.
  - www `tsc` clean for both projects. The registry freshness check waits for
    the final docs.
- Root `pnpm test`:
  - Gate 5 had 53 failures. Two were outside HEAD's list: the AI menu draft
    test and the streaming demo's static preview test. Both were the guard's
    schema false positive, now fixed.
  - Gate 6, after the fix, has 27 failures. 26 are in HEAD's list of 151.
  - The other one is the load-sensitive
    `plite-schema-construction-benchmark` p95 budget. It failed in gate 4
    before this plan's guard too. Alternating runs at load 9–12, from other
    sessions: the current tree failed 2 of 2, and the tree with this plan's
    Plite changes reverted failed 1 of 2.
  - platejs typecheck 90/90.
- Gate 7, on the tree with the highlighter portal reuse and the end-marker
  decoration:
  - `pnpm --filter www build:registry` passes, and `templates/` is untouched.
  - `pnpm test` has 27 failures. The only one outside HEAD's list is the
    load-sensitive schema benchmark.
  - `pnpm test:slow` has 26 failures. The only one outside HEAD's 26 was the
    `plitejs/internal` exact-export list, which now includes
    `withDocumentViewRead` (27/27 in that file).
  - The www typecheck passes the editor, API-reference, registry-freshness,
    docs-parity and registry-source checks. Its `tsc` failed only in the S5
    harness, at a Playwright `addInitScript` config literal the lane had
    added; the lane owns that fix.

- S5 on snapshot w, the final tree (`lanes/s5/reuse/`, `summary-w.json`,
  load 4–13, no cell confounded):
  - all 8 cells pass against the baseline, and final text and HTML are
    identical between arms;
  - 0 page or console errors in 64 streams, and no guard throws;
  - streamed output equals a fresh render: TOC, list numbers, code tokens and
    table borders;
  - one end marker per final;
  - React is 62–82% below projection-2 in every cell (static rich 50 KB:
    22.6 → 6.4 s per stream; AI CJK 50 KB: 43.9 → 8.1 s);
  - static finals take 8–39 ms;
  - candidate reruns: correctness 8/8, lifetime 14/14, ai-session 18/19 (the
    known narrow-view test) and dismissal 5/5.
- The decoration read fell only 1.0–1.3× from u to w, not the 4–5× the
  headless per-source benchmark suggested. In the browser the portal lookup
  was about 18% of the decoration time, not two thirds.
- Static rich 50 KB, v → w: the decoration read fell from 4,147 to 3,466 ms
  per stream.
  - `view.plugin()`, with its refresh and configuration sort, went from 748 to
    0.
  - Everything else held within noise.
- The remaining split on w, per 50 KB stream: 70% is the highlighter body,
  30% Plate's per-node source wrapper.
  - Within the body, `nodes.parent` reads take 51%, store and schema reads
    20%, and `view.key` 15%.
  - Lowlight takes under 2%.
  - Every index read also clones the selection.
- `withDocumentViewRead` costs about 72 ms of self time per 50 KB stream.
- Gate 8, on the final tree:
  - the full `pnpm --filter www typecheck` passes, including registry
    freshness and the S5 harness;
  - the schema benchmark passed 2 of 3 runs at load 8–9.

Open risks:

- Decorations are read over every node of every block on each render: 21–58%
  of React time on w, 1.5–5.5 s per 50 KB stream. The next lever is caching
  them per block for sources that read only their own block, with a
  declaration for sources that read the document (the AI end marker). That is
  a new plugin-facing declaration and needs its own Best API decision.
  Smaller levers from the w profile:
  - decorate code once per code block rather than per text;
  - resolve highlighter config once per pass;
  - stop cloning the selection on every Plite index read;
  - reuse the per-view plugin context in Plate's source wrapper.
- The `plite-schema-construction-benchmark` p95 budget fails under machine
  load. It fails with and without this plan's Plite changes, and passes when
  load is low.

- Comment highlights resolve source anchors in any view with the same owner
  and root, so rendering a different document with the editor's comments
  places them by path. Yjs remote cursors behave the same way. Neither source
  is in the static previews shipped here.

- The guard covers view reads, decoration reads and the synchronous element
  render pipeline. It does not cover deferred component bodies or plugin API
  calls.

Final handoff prepared:

- A document view reads one immutable document, everywhere.
- HTML reports every property it drops.
- Static previews re-render only from the first changed block, and elements
  that read later content declare it.
- The guard turns captured-editor reads into errors.
- Execution record: `2026-09-29-static-document-rendering-execution`.
- Nothing is staged or committed; the user owns commits on `next`.
