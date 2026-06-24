# Plite Multi-root Root Chrome Focus And Padding Carets

## Goal

Fix the multi-root document path where header text click, body text click, then
footer text click leaves focus and native selection in the body until a second
footer click.

Also fix the follow-up path where a stale body caret is restored after clicking
body editor padding from another root instead of moving to the clicked body end.

## Evidence

- One-off Playwright repro against `http://localhost:3100/examples/multi-root-document`:
  after scrolling the footer into view and clicking its text, active element and
  selection stayed in `#multi-root-main`.
- The same footer click works on the second attempt.
- Regression added in
  `apps/www/tests/plite-browser/donor/examples/multi-root-document.test.ts`
  first failed on `expect(footer).toBeFocused()`.
- The focused row now passes after root chrome adds a native-descendant
  mouseup recovery that only fires when browser focus stayed on the previous
  root.
- A second regression first failed with body padding keeping offset `28` from an
  earlier body click instead of moving to the last body paragraph end.
- The padding row now passes after direct editable-root clicks resolve the
  event coordinate range before falling back to selection restore.

## Plan

1. Add a browser regression using real text-surface clicks, not label helpers.
2. Confirm the row fails before changing code.
3. Keep native text clicks browser-owned when they work.
4. Add a fallback for native editable descendant clicks that fail to move DOM
   focus after scroll.
5. Make editable-root padding clicks range-first and restore-only as fallback.
6. Verify focused Playwright, root-chrome unit tests, typecheck, lint, and
   completion-check.

## Changeset

Package code under `plite-react` changes, so keep the existing branch changeset
current.
