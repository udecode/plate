---
review_scopes:
  - html
  - conversion-boundary
  - format-mappings
review_basis:
  - 2026-09-29-static-preview-document-review
  - 2026-09-28-conversion-boundary-value-review
  - 2026-09-28-format-mappings-value-review
work_kind: implementation
---

# Static preview document

Status: Complete — adopted on S5 projection-2; React re-rendering of unchanged blocks stays open

Objective:

A read-only preview renders an immutable document through an editor's plugins
without editing that editor. Copied consumers stop reimplementing identity
publication, and streaming previews stay proportional to the change.

Completion threshold:

`EditorStatic` and `EditorPreview` render a `document`; the AI menu and the
demo's static preview use it with no shadow publication; S5 static and AI
cells pass against the baseline and are no worse than the splice; docs,
doctrine, changesets, registry output and the ledger are current.

Verification surface:

Static component specs, AI menu specs, the Markdown and table partitions,
Plite core validation laws, the S5 Chromium matrix and reruns, and the
package, www and doctrine gates.

Constraints:

No hook, view noun or public reconcile primitive. Static rendering keeps
working in React Server Components. No staging or commit; the user owns
commits on `next`.

Boundaries:

Plate static components own the `document` input. Plite owns validation cost.
The Markdown table mapping owns row padding. Copied registry UI owns only
presentation. The editable demo preview keeps its documented splice.

Blocked condition:

None. React re-rendering of unchanged blocks is a separate decision, not a
blocker here.

Work Checklist:

- [x] Add `document` to `EditorStatic` and `EditorPreview` with a cached
  projected view.
- [x] Delete the AI menu's and the demo static preview's shadow publication.
- [x] Make projection validation proportional in Plite.
- [x] Pad short Markdown table rows so a parse equals the committed document.
- [x] Fix the AI preview decoration that read a captured editor.
- [x] Measure S5 static and AI cells against the baseline and the splice.
- [x] Update docs, doctrine, changesets, registry output and the ledger.

## Decision

`EditorStatic` and `EditorPreview` take an optional `document`, the same name
`renderStaticHtml` uses. An internal view per `(editor, document)` object
projects the document through `createProjectedEditorView`, so copy and render
read the same projection.

- The AI menu's `AIChatEditor` renders `previewValue` as its `document`. Its
  shadow publication (a published ref, a layout effect and an identity splice)
  is deleted.
- The Markdown streaming demo's static preview renders each parse as its
  `document`. The editable preview still publishes into its editor from the
  first changed block: showing a stream in a live editable editor is an edit.

Rejected alternatives:

| Alternative | Why not |
| --- | --- |
| Identity-aware `value.replace` in Plite | `fitDocument` copies every node, even canonical parser output (probe: 0 of 3 nodes kept), and fitting may repair using neighbors. Identity cannot prove that fitting a prefix and the tail equals fitting the whole document. |
| A `useEditorDocumentView` hook | Adds a view noun and hook lifetime. `EditorStatic` already receives the editor; the document is its only missing input. |
| A public identity-reconcile primitive | Exposes the implementation trick instead of the job. |
| Keep the consumer splice | Copied UI has to know the parser's identity contract. |

## Evidence

- Projection with a full `assertDocument` costs 4.2 ms at 10 KB (237 blocks)
  and 14.7 ms at 50 KB (1,179 blocks). A full `value.replace` costs 45.8 and
  176 ms. Validation is O(document), but much cheaper than a replacement.
- An empty document is invalid for the root schema (at least one block), so
  consumers pass `document` only when there is content and otherwise render
  the editor's own value.
- `PlateStatic` on `main` had `value`, which overwrote `editor.children`.
  `document` restores the job without the mutation.

Verification evidence:

- `PlateStatic.spec.tsx`: a document renders through the editor's plugins,
  and neither the editor's value nor its last commit changes. It fails when
  `document` is ignored.
- Markdown streaming demo spec 11/11; AI menu specs (menu 1/1, slow 2/2,
  lifecycle 23/23, keyboard 1/1); platejs 141/141 and typecheck; www
  typecheck.
- Regression caught by S5's `ai-session` run: the AI preview lost its end
  marker, and with it the purple streaming dot and the scroll-follow target.
  `PreviewAIPlugin` read `editor.read.children()` from its `.extend` closure,
  which still holds the preview editor's own value. It now reads from its
  `decorate.read` context, the rendering view. `ai-menu.spec` asserts the
  marker lands on the last draft text; it fails with the captured editor.
  The `document` JSDoc and the static guide now state the contract: plugins
  read the rendered document from their render or decorate context.
- S5 projection run 1 (`lanes/s5/projection/`, load 7–18):
  - five cells pass against the baseline, and three are inconclusive because
    of machine load or the baseline hitting the cap;
  - at 10 KB, projection beats the splice on publication (−24 to −53%) and on
    React in three of four cells;
  - at 50 KB, publication is 2.6–3.7× the splice, and `assertDocument` is 93%
    of the projection's cost: every publication validated the whole document.
- Plite validation reuse:
  - `isEditorJsonValue` remembers frozen values once they validate and their
    object members are already remembered.
  - `assertDocument` skips top-level nodes that are deep-frozen, remembered
    and already validated for the same compiled schema object and root; it is
    off for schemas with element-owned roots.
  - The first version keyed the reuse to the schema authority string. The
    existing plugin-configuration test "rolls back an equal-schema validator
    rebind" failed, because a rebound validator keeps the fingerprint.
    Keying to the compiled schema object fixed it.
  - Two new laws in `incremental-schema-validation.test.ts`: a frozen value
    with a mutable member is never remembered, and another schema validates a
    shared node again.
  - Headless streaming projection, 782 previews: 50 KB 12.2 → 1.9 s, and 10 KB
    750 → 194 ms.
  - Plite core 1,700/1,700, platejs 141/141 and typecheck.
- S5 quiet 50 KB repeat (`lanes/s5/projection/repeat/`, candidate q, before
  validation reuse):
  - all 8 cells pass against the baseline (−93 to −94% at 50 KB);
  - against the splice, projection is 5–12% cheaper on React render, busy time
    and final (raw; 14–20% normalized), and publication is 2–2.6×
    (+0.6–1.2 s per stream) until validation reuse;
  - the earlier "React +50% at 50 KB" was machine load.
- Divergence found through saved final texts: the CJK 50 KB fixture ends in a
  short table row. The parse kept it short, and the table correction pads it
  on commit, so projection showed a ragged row that the accepted document
  doesn't have.
  - The Markdown table decoder now pads every row to the widest one with the
    correction's empty cell, as GFM specifies for short rows.
  - `table.spec.ts` asserts that a ragged table parses to exactly the
    committed document; it fails without the padding.
  - Markdown 224/224 and table 204/204 pass.
- The ai-session editor-click dismissal spec clicked a point the floating AI
  menu can cover. The baseline failed it 4 of 6 at low load, while the
  projection candidate passed 6 of 6. It now clicks the heading above the
  invoking block.
- S5 projection-2 (`lanes/s5/projection-2/`, snapshot 17:16:55Z, load 3–6):
  - all 8 cells pass against the baseline, none inconclusive: parse plus
    publication −92 to −95% at 10 KB and −98 to −99% at 50 KB, with every
    strict final and arrival p95 faster;
  - against the splice (verdict-2's candidate), projection is cheaper on every
    metric in every cell: publication −68 to −85%, React −10 to −17%, busy
    −11 to −20%, final −11 to −21% (normalized);
  - `assertDocument` is now 40–130 ms per 50 KB stream (it was 1.9 s),
    0.1–0.3% of busy time;
  - the remaining visible cost is the per-read projection wrapper under
    render, 3.5–4% of React work.
  - Candidate reruns: correctness 6/6, lifetime 14/14, `ai-session` 18/19 (the
    known narrow-view failure), and the dismissal test 5/5.
  - The run's snapshot predates the table padding, so its two CJK 50 KB text
    comparisons still show the ragged row. On the current tree the CJK 50 KB
    parse's last block equals the committed one
    (`projection/diag-cjk-ragged-row/output-after-padding.log`).

Open risks:

Other plugins that repair content only on commit could make a projected preview
differ from the committed document, as tables did; only the table correction
was checked.

React still re-renders every block per publication: each document gets a new
view, so `ElementStatic`'s memo misses (24–51 s at 50 KB). A stable view needs
a dependency mechanism for renderers that read beyond their element (the static
TOC reads headings) and must keep working in React Server Components. That is
the next decision for this scope.

Final handoff prepared:

None for this plan. The open React question is the next decision for the
`html` scope.
