# Slate v2 Annotation / Decoration Example Dedupe Ralplan

Date: 2026-05-18

## Verdict

Yes, dedupe the public example surface.

Do not collapse all four into one monster example. That would make the API story
worse. The right move is:

1. Keep `external-decoration-sources` separate as the decoration-source primitive
   example, after rewriting it to the range-decoration + `deps` shape from
   `docs/plans/2026-05-18-slate-v2-external-decoration-sources-dx-ralplan.md`.
2. Keep `review-comments` as the canonical comment feature example.
3. Merge the public teaching value of `persistent-annotation-anchors` into
   `review-comments`, then hide or delete the public route for
   `persistent-annotation-anchors`.
4. Keep `collaborative-comments`, but rename/reframe it as comment-only
   collaboration because it proves a different thing than `review-comments`.

## Current Live Shape

| Example | Lines | Current unique proof | Review |
| --- | ---: | --- | --- |
| `external-decoration-sources.tsx` | 296 | App-owned external decoration source updates through `<Slate decorationSources>` and `renderSegment`. | Keep separate. It is not comments or annotations. Rewrite DX, do not merge with comments. |
| `review-comments.tsx` | 545 | Single-editor comments: selection -> `Bookmark`, annotation store, inline highlight, sidebar, widgets, metadata update, anchor rebase. | Canonical comment example. It already overlaps most of `persistent-annotation-anchors`. |
| `persistent-annotation-anchors.tsx` | 513 | Minimal anchor persistence: bookmark survives fragment insert, prefix insert, clear; widget follows anchor. | Too much public duplication with `review-comments`. Keep as hidden proof only if the browser row remains valuable. |
| `collaborative-comments.tsx` | 549 | Two editors, read-only reviewer, separate document/comment write counters, shared external comment channel. | Keep as advanced collaboration story. Rename/reframe; do not merge into `review-comments`. |

## Evidence

- `../slate-v2/site/examples/ts/review-comments.tsx:175-191` creates
  annotation-backed widgets from comments.
- `../slate-v2/site/examples/ts/review-comments.tsx:211-249` creates bookmark
  comments from selection and seeded ranges.
- `../slate-v2/site/examples/ts/review-comments.tsx:284-328` already proves
  prefix and paragraph insertion before the first comment.
- `../slate-v2/site/examples/ts/review-comments.tsx:514-529` maps comments into
  `useSlateAnnotationStore`.
- `../slate-v2/playwright/integration/examples/review-comments.test.ts:1-46`
  proves inline comment slices, sidebar cards, widgets, structural inserts, and
  clearing.
- `../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx:457-499`
  does the same annotation-store + widget-store shape with a single bookmark.
- `../slate-v2/playwright/integration/examples/persistent-annotation-anchors.test.ts:1-64`
  proves a stronger minimal fragment/prefix/clear anchor row.
- `../slate-v2/site/examples/ts/collaborative-comments.tsx:452-543` creates two
  editors, two annotation stores, syncs the reviewer value from writer edits, and
  keeps reviewer comment writes outside document writes.
- `../slate-v2/playwright/integration/examples/collaborative-comments.test.ts`
  asserts comment writes do not increment document writes and reviewer document
  writes stay `0`.
- `../slate-v2/site/examples/ts/external-decoration-sources.tsx:166-170` uses
  `useSlateDecorationSource`; `:264-288` wires it to
  `<Slate decorationSources>` and `renderSegment`.
- `../slate-v2/site/constants/examples.ts:5-24` exposes all four in the public
  example list, which makes the annotation/comment story look duplicated.
- `../slate-v2/docs/libraries/slate-react/annotations.md:138-170` documents
  `collaborative-comments` as a separate comment-only collaboration pattern.
- `docs/plans/2026-05-08-slate-v2-react-decorations-slate-issues-ralplan.md:831-839`
  gives separate browser owners for external decorations, review comments, and
  persistent anchors. That is good for proof coverage, not automatically good
  for public examples.

## Recommended Public Example Set

Public:

- `external-decoration-sources` -> rename label to `External Decorations` or
  `External Decoration Source`; keep as the primitive decoration-source example.
- `review-comments` -> keep as `Review Comments`; make it the main annotation +
  widget + anchor persistence example.
- `collaborative-comments` -> rename label to `Comment-Only Collaboration`; keep
  as the two-editor permission/channel example.

Hidden or deleted from public list:

- `persistent-annotation-anchors`.

If kept, make it hidden and test-owned:

- path can stay `persistent-annotation-anchors`
- label can become `Annotation Anchor Proof`
- add it to `HIDDEN_EXAMPLES`
- keep the Playwright test if the fragment-insert row is not moved into
  `review-comments`

## Merge / Dedupe Plan

### 1. `external-decoration-sources`

Keep separate.

Reason:

- It teaches `decorationSources`, not `annotationStore`.
- It proves external render-only overlays that are not durable comments.
- Merging it into comment examples would blur decorations and annotations, which
  the Slate React API intentionally keeps separate.

Cleanup target:

- use `useSlateRangeDecorationSource`
- use React state `deps`
- remove raw `SlateProjection` from the main example
- keep `dirtiness: 'external'`

### 2. `review-comments`

Keep as canonical.

Absorb from `persistent-annotation-anchors`:

- explicit fragment insert before an anchored comment, if that proof is still
  missing from `review-comments`
- clear-anchor / clear-comment row
- assertion that widget visibility follows the rebased annotation

Do not absorb:

- two-editor collaboration
- document/comment write counters

### 3. `persistent-annotation-anchors`

Do not keep it as a public example.

Choose one:

- Preferred: move the stronger browser proof into `review-comments` and delete
  the public example route.
- Conservative: keep the file and Playwright row, but add the route to
  `HIDDEN_EXAMPLES` so it remains proof infrastructure rather than public DX.

### 4. `collaborative-comments`

Keep separate, but rename/reframe.

Reason:

- It proves comment-only collaboration, not basic comments.
- The unique behavior is two editors plus permission/channel separation:
  document writes and comment writes are deliberately different counters.
- Merging it into `review-comments` would produce a 900+ line example that is
  worse for everyone.

Better label:

- `Comment-Only Collaboration`

Optional path rename:

- keep path `collaborative-comments` to avoid churn, or rename to
  `comment-only-collaboration` only if route compatibility does not matter.

## Do Not Do

- Do not create a shared "comment example framework" just to dedupe line count.
  These examples are copied/read by users, so hiding the core call sites behind a
  local helper module is a DX loss.
- Do not merge decorations and annotations into one example. They share rendering
  transport, but the public concepts are different.
- Do not make `review-comments` carry the collaboration proof.
- Do not delete persistent-anchor test coverage unless equivalent browser proof
  exists in `review-comments` or package tests.

## Ralph Target

If the user says go:

1. Rewrite `external-decoration-sources` per the existing external-decoration
   DX plan.
2. Move the strongest `persistent-annotation-anchors` proof into
   `review-comments` or keep it hidden.
3. Add `persistent-annotation-anchors` to `HIDDEN_EXAMPLES` if not deleted.
4. Rename the public label `Collaborative Comments` to
   `Comment-Only Collaboration`.
5. Update annotations docs if the label/path changes.
6. Run focused site typecheck and the three affected Playwright example tests.

## Verification Target For Execution

```bash
cd ../slate-v2/site && bun tsc --project tsconfig.json
cd ../slate-v2 && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/review-comments.test.ts playwright/integration/examples/collaborative-comments.test.ts playwright/integration/examples/external-decoration-sources.test.ts --project=chromium
cd ../slate-v2 && bunx biome check site/examples/ts/review-comments.tsx site/examples/ts/collaborative-comments.tsx site/examples/ts/external-decoration-sources.tsx site/constants/examples.ts && bunx eslint site/examples/ts/review-comments.tsx site/examples/ts/collaborative-comments.tsx site/examples/ts/external-decoration-sources.tsx site/constants/examples.ts
```

If `persistent-annotation-anchors` remains hidden but changed, include its file
and test in the touched-file checks.

## Completion

Review pass complete. No Slate v2 source edited.
