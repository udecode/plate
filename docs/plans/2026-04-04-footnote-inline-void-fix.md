# Footnote Inline Void Fix

## Goal

Make footnote references behave like real inline atoms instead of editable text.

## Phases

- [x] Load prior learnings and inspect the current footnote runtime/tests
- [x] Add red tests for inline-void ref behavior and backlink navigation
- [x] Implement the footnote reference inline-void model and renderer/nav fixes
- [x] Verify with targeted tests, package checks, registry build, lint, and
  `dev-browser`

## Notes

- The current spec now says footnote refs should be inline void atoms.
- Runtime is still wrong: `footnoteReference` is inline but not void.
- Browser symptom to kill:
  - Backspace after the ref edits the visible identifier.
  - Backlink navigation triggers generic chrome instead of clean navigation.
- Result:
  - `footnoteReference` is now an inline void atom with an empty child sentinel
  - backlink focus lands on the nearest stable sibling text point instead of a
    node-range selection
  - browser proof on `/docs/footnote` showed backlink jump landing on the `.` after
    `[1]`, only one toolbar on screen, and one `Backspace` removing the whole
    ref instead of the digit
