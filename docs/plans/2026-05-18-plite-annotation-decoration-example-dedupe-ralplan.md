# Plite Annotation / Decoration Example Dedupe Ralplan

Date: 2026-05-18

## Verdict

Yes, dedupe the public example surface.

Do not collapse all four into one monster example. That would make the API story
worse. The right move is:

1. Keep `external-decoration-sources` separate as the decoration-source primitive
   example, after rewriting it to the range-decoration + `deps` shape from
   `docs/plans/2026-05-18-plite-external-decoration-sources-dx-ralplan.md`.
2. Keep `review-comments` as the canonical comment-mode feature example, with
   two panes: edit mode and read-only comment mode.
3. Merge the public teaching value of `persistent-annotation-anchors` into
   `review-comments`, then hide or delete the public route for
   `persistent-annotation-anchors`.
4. Hide `collaborative-comments` from the public list. Keep it only as proof
   infrastructure if its two-editor channel test remains useful.

## Current Live Shape

| Example                             |                     Lines | Current unique proof                                                                                                                   | Review                                                                                                             |
| ----------------------------------- | ------------------------: | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `external-decoration-sources.tsx`   |                       296 | App-owned external decoration source updates through `<Plite decorationSources>` and `renderSegment`.                                  | Keep separate. It is not comments or annotations. Rewrite DX, do not merge with comments.                          |
| `review-comments.tsx`               | 545 before implementation | Single-editor comments: selection -> `Bookmark`, annotation store, inline highlight, sidebar, widgets, metadata update, anchor rebase. | Must become the public two-pane comment-mode example.                                                              |
| `persistent-annotation-anchors.tsx` |                       513 | Minimal anchor persistence: bookmark survives fragment insert, prefix insert, clear; widget follows anchor.                            | Too much public duplication with `review-comments`. Keep as hidden proof only if the browser row remains valuable. |
| `collaborative-comments.tsx`        |                       549 | Two editors, read-only reviewer, separate document/comment write counters, shared external comment channel.                            | Useful proof, bad public default. Hide it and move the two-pane teaching shape into `review-comments`.             |

## Evidence

- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx:175-191` creates
  annotation-backed widgets from comments.
- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx:211-249` creates bookmark
  comments from selection and seeded ranges.
- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx:284-328` already proves
  prefix and paragraph insertion before the first comment.
- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx:514-529` maps comments into
  `usePliteAnnotationStore`.
- `apps/www/tests/plite-browser/donor/examples/review-comments.test.ts:1-46`
  proves inline comment slices, sidebar cards, widgets, structural inserts, and
  clearing.
- `apps/www/src/app/(app)/examples/plite/_examples/persistent-annotation-anchors.tsx:457-499`
  does the same annotation-store + widget-store shape with a single bookmark.
- `apps/www/tests/plite-browser/donor/examples/persistent-annotation-anchors.test.ts:1-64`
  proves a stronger minimal fragment/prefix/clear anchor row.
- `apps/www/src/app/(app)/examples/plite/_examples/collaborative-comments.tsx:452-543` creates two
  editors, two annotation stores, syncs the reviewer value from writer edits, and
  keeps reviewer comment writes outside document writes.
- `apps/www/tests/plite-browser/donor/examples/collaborative-comments.test.ts`
  asserts comment writes do not increment document writes and reviewer document
  writes stay `0`.
- `apps/www/src/app/(app)/examples/plite/_examples/external-decoration-sources.tsx:166-170` uses
  `usePliteDecorationSource`; `:264-288` wires it to
  `<Plite decorationSources>` and `renderSegment`.
- `apps/www/constants/examples.ts:5-24` exposes all four in the public
  example list, which makes the annotation/comment story look duplicated.
- `content/docs/plite/libraries/slate-react/annotations.md:138-170` documents
  `collaborative-comments` as a separate comment-only collaboration pattern.
- `docs/plans/2026-05-08-plite-react-decorations-slate-issues-ralplan.md:831-839`
  gives separate browser owners for external decorations, review comments, and
  persistent anchors. That is good for proof coverage, not automatically good
  for public examples.

## Recommended Public Example Set

Public:

- `external-decoration-sources` -> rename label to `External Decorations` or
  `External Decoration Source`; keep as the primitive decoration-source example.
- `review-comments` -> label as `Comment Mode`; make it the main annotation +
  widget + anchor persistence example with two visible panes.

Hidden or deleted from public list:

- `persistent-annotation-anchors`.
- `collaborative-comments`.

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
  the Plite React API intentionally keeps separate.

Cleanup target:

- use `usePliteRangeDecorationSource`
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

Absorb from `collaborative-comments`:

- two visible panes
- edit mode owns document writes
- comment mode is read-only for the document
- comment writes do not mutate the document

### 3. `persistent-annotation-anchors`

Do not keep it as a public example.

Choose one:

- Preferred: move the stronger browser proof into `review-comments` and delete
  the public example route.
- Conservative: keep the file and Playwright row, but add the route to
  `HIDDEN_EXAMPLES` so it remains proof infrastructure rather than public DX.

### 4. `collaborative-comments`

Keep as hidden proof only.

Reason:

- It proves a useful channel separation row.
- As a public example, it teaches a bad default: users will copy two-editor
  mirroring as collaboration architecture.
- The public example should be `review-comments` / `Comment Mode`, where the
  second editor is visibly read-only and writes only comments.

Implementation target:

- keep path `collaborative-comments` to avoid churn
- add it to `HIDDEN_EXAMPLES`
- keep the existing browser test unless equivalent proof is fully covered by
  `review-comments`

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
2. Move the useful two-pane/comment-write proof into `review-comments`.
3. Add `persistent-annotation-anchors` and `collaborative-comments` to
   `HIDDEN_EXAMPLES` if not deleted.
4. Rename public `Review Comments` label to `Comment Mode`.
5. Update annotations docs for the new public example.
6. Run focused site typecheck and affected Playwright example tests.

## Verification Target For Execution

```bash
cd apps/www && bun tsc --project tsconfig.json
cd Plate repo root && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/review-comments.test.ts playwright/integration/examples/collaborative-comments.test.ts playwright/integration/examples/external-decoration-sources.test.ts --project=chromium
cd Plate repo root && bunx biome check site/examples/ts/review-comments.tsx site/examples/ts/collaborative-comments.tsx site/examples/ts/external-decoration-sources.tsx site/constants/examples.ts && bunx eslint site/examples/ts/review-comments.tsx site/examples/ts/collaborative-comments.tsx site/examples/ts/external-decoration-sources.tsx site/constants/examples.ts
```

If `persistent-annotation-anchors` remains hidden but changed, include its file
and test in the touched-file checks.

## Completion

Implementation update:

- `apps/www/src/app/(app)/examples/plite/_examples/review-comments.tsx` is now the public two-pane
  comment-mode example.
- `apps/www/constants/examples.ts` hides `collaborative-comments` and
  `persistent-annotation-anchors`, and labels `review-comments` as
  `Comment Mode`.
- `content/docs/plite/libraries/slate-react/annotations.md` points comment-only
  collaboration docs at `review-comments`.
- `apps/www/tests/plite-browser/donor/examples/review-comments.test.ts` and
  `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts` now expect two
  inline comment slices.
- `apps/www/tests/plite-browser/donor/examples/review-comments.test.ts` selects
  the read-only comment pane through `#review-comments` instead of the shared
  editable harness root.
- `docs/solutions/test-failures/2026-05-18-slate-read-only-selection-tests-need-selector-owned-dom-selection.md`
  records the reusable test lesson.

Verification:

- `cd Plate repo root && bunx biome check site/examples/ts/review-comments.tsx site/constants/examples.ts playwright/integration/examples/review-comments.test.ts playwright/stress/generated-editing.test.ts docs/libraries/slate-react/annotations.md --fix`
- `cd Plate repo root && bun lint:fix`
- `cd Plate repo root && bun typecheck:site`
- `cd Plate repo root && bun typecheck:root`
- `cd Plate repo root && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/review-comments.test.ts --project=chromium`
- `cd Plate repo root && PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/collaborative-comments.test.ts playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium`
- `cd Plate repo root && STRESS_ROUTES=review-comments STRESS_FAMILIES=overlay-annotation-metadata-only,overlay-annotation-bookmark-rebase,overlay-widget-dirty-id,overlay-mixed-update PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium`
