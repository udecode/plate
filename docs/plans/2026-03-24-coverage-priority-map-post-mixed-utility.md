---
title: Coverage Priority Map Post Mixed Utility
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Post Mixed Utility

## Inputs

- Coverage source: [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-24d/lcov.info)
- Constraints:
  - exclude `/react`
  - no coverage vanity
  - score only files worth real unit or editor-contract tests
  - penalize recently swept packages so reopened crumbs do not crowd out untouched seams

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24d --reporter=dots`
- Result: `2750 pass`, `0 fail`, `541 files`, `2.53s`

## Scoring Rules

- Scope is `packages/**/src/**`.
- `/react`, React-import files, test files, barrels, generated files, type-only files, and obvious browser-heavy seams score `0`.
- Higher scores go to deterministic transforms, queries, parser or serializer helpers, plugin overrides, and small pure utilities with meaningful uncovered logic.
- Tiny leftover gaps get zeroed when they are not worth reopening.
- Recent sweeps are penalized on purpose.

## Strong Take

The best next work is **not** another broad package sweep.

Do this in order:

1. `@udecode/react-hotkeys`
2. `docx` revisit, but only the deterministic cleaner and plugin seams
3. one-file surgical seams:
   - `toggle/someToggle.ts`
   - `suggestion/findSuggestionNode.ts`
4. only then reopen recent packages like `autoformat`, `markdown`, `list`, or `list-classic`

Why:

- `@udecode/react-hotkeys` still has untouched pure utility logic and has not had the same coverage sweep treatment.
- `docx` still has real deterministic helper value, but it is a revisit, not a fresh frontier.
- `toggle` and `suggestion` each have one honest seam left.
- most other raw package totals are inflated by already-swept leftovers, DOM-ish dust, or low-signal crumbs.

## Best Remaining Files

- [isHotkeyPressed.ts](/Users/zbeyens/git/plate/packages/udecode/react-hotkeys/src/internal/isHotkeyPressed.ts) — `@udecode/react-hotkeys`, score `7`
- [DocxPlugin.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/DocxPlugin.ts) — `docx`, score `6`
- [someToggle.ts](/Users/zbeyens/git/plate/packages/toggle/src/lib/queries/someToggle.ts) — `toggle`, score `6`
- [isDocxFootnote.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/isDocxFootnote.ts) — `docx`, score `6`
- [findSuggestionNode.ts](/Users/zbeyens/git/plate/packages/suggestion/src/lib/queries/findSuggestionNode.ts) — `suggestion`, score `6`
- [validators.ts](/Users/zbeyens/git/plate/packages/udecode/react-hotkeys/src/internal/validators.ts) — `@udecode/react-hotkeys`, score `6`
- [autoformatSuperscript.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/rules/math/autoformatSuperscript.ts) — `autoformat`, score `5`
- [autoformatSubscript.ts](/Users/zbeyens/git/plate/packages/autoformat/src/lib/rules/math/autoformatSubscript.ts) — `autoformat`, score `5`
- [cleanDocx.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/cleanDocx.ts) — `docx`, score `5`
- [mdast.ts](/Users/zbeyens/git/plate/packages/markdown/src/lib/mdast.ts) — `markdown`, score `5`
- [BasePlaceholderPlugin.ts](/Users/zbeyens/git/plate/packages/media/src/lib/placeholder/BasePlaceholderPlugin.ts) — `media`, score `4`
- [BaseMediaEmbedPlugin.ts](/Users/zbeyens/git/plate/packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts) — `media`, score `4`

## Package Order By Real Value

1. `@udecode/react-hotkeys`
2. `docx`
3. `toggle`
4. `suggestion`
5. `autoformat`
6. `markdown`
7. `media`
8. `list`
9. `list-classic`
10. `code-drawing`

## Raw Package Totals Caveat

Raw package totals still overstate:

- `docx`
- `autoformat`
- `list`
- `slate`
- `list-classic`

That is because what remains there is mostly revisit work, already-swept crumbs, or DOM-ish dust. Use the sorted recommendations above, not raw totals alone.

## Skip For Now

- `resizable`
- `@udecode/cn`
- type-only leftovers in `@udecode/utils`
- DOM-ish `slate/internal/dom-editor`
- reopening just-swept `core`, `docx-io`, `basic-styles`, `selection`, or `emoji` without a real seam

## Full Data

The exhaustive scoring lives here:

- [2026-03-24-coverage-priority-packages-post-mixed-utility.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-packages-post-mixed-utility.tsv)
- [2026-03-24-coverage-priority-files-post-mixed-utility.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-post-mixed-utility.tsv)

Those TSVs contain:

- every package with a scored package rollup
- every file still worth testing with its score, coverage, uncovered lines, and scoring reasons
