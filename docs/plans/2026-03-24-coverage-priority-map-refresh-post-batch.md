# Coverage Priority Refresh Post Batch

## Inputs

- Coverage source: [lcov.info](/Users/zbeyens/git/plate/.coverage-repo-2026-03-24b/lcov.info)
- Constraints: exclude `/react`, skip browser and UI-heavy packages, and score only files worth direct unit or editor-contract tests.
- Sync basis: March 17, March 22, March 23, and earlier March 24 maps, plus the coverage work completed since then.

## Coverage Run

- Command: `bun test --coverage --coverage-reporter=lcov --coverage-dir=/Users/zbeyens/git/plate/.coverage-repo-2026-03-24b --reporter=dots`
- Result: `2687 pass`, `0 fail`, `510 files`, `2.37s`

## Scoring Rules

- Scope is `packages/**/src/**`.
- `/react`, React-import files, browser packages, tests, barrels, `dist`, and type-only files score `0`.
- Higher scores go to deterministic transforms, queries, parser or serializer helpers, plugin overrides, and small pure utilities with low coverage.
- Recent sweeps are penalized on purpose so already-worked packages do not keep crowding out untouched work.
- Data-only constants and thin leftover gaps get pushed down.

## Strong Take

The honest next work is **not** another big package sweep.

Do the untouched score-7+ seam files first:

### tag

- [isEqualTags.ts](/Users/zbeyens/git/plate/packages/tag/src/lib/isEqualTags.ts) `9`
- [BaseTagPlugin.ts](/Users/zbeyens/git/plate/packages/tag/src/lib/BaseTagPlugin.ts) `9`
### toggle

- [BaseTogglePlugin.ts](/Users/zbeyens/git/plate/packages/toggle/src/lib/BaseTogglePlugin.ts) `10`
### slash-command

- [BaseSlashPlugin.ts](/Users/zbeyens/git/plate/packages/slash-command/src/lib/BaseSlashPlugin.ts) `9`
### mention

- [getMentionOnSelectItem.ts](/Users/zbeyens/git/plate/packages/mention/src/lib/getMentionOnSelectItem.ts) `7`
- [BaseMentionPlugin.ts](/Users/zbeyens/git/plate/packages/mention/src/lib/BaseMentionPlugin.ts) `5`
### udecode/cmdk

- [command-score.ts](/Users/zbeyens/git/plate/packages/udecode/cmdk/src/internal/command-score.ts) `8`
### tabbable

- [BaseTabbablePlugin.ts](/Users/zbeyens/git/plate/packages/tabbable/src/lib/BaseTabbablePlugin.ts) `10`
### juice

- [JuicePlugin.ts](/Users/zbeyens/git/plate/packages/juice/src/lib/JuicePlugin.ts) `7`
### docx revisit

- [getDocxIndent.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getDocxIndent.ts) `5`
- [getTextListStyleType.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getTextListStyleType.ts) `5`
- [isDocxContent.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/isDocxContent.ts) `5`
### docx-io revisit

- [document.template.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/document.template.ts) `5`
- [core.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/core.ts) `5`
### emoji utility revisit

- [IndexSearch.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/IndexSearch/IndexSearch.ts) `5`
- [EmojiInlineLibrary.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/EmojiLibrary/EmojiInlineLibrary.ts) `5`

After that, the next reopen-worthy work is a small `docx` / `docx-io` revisit. Those packages still have deterministic leftovers, but they are second-tier because they were just swept and what remains is less leveraged.

## Threshold Counts

- `score >= 10`: `2` files
- `score >= 9`: `5` files
- `score >= 8`: `6` files
- `score >= 7`: `8` files
- `score >= 6`: `8` files
- `score >= 5`: `26` files
- `score >= 4`: `56` files
- `score >= 3`: `89` files
- `score >= 2`: `111` files
- `score >= 1`: `400` files

## Raw Package Totals

1. `docx` — score `35`, top file `5`
2. `docx-io` — score `34`, top file `5`
3. `core` — score `30`, top file `5`
4. `emoji` — score `29`, top file `5`
5. `basic-styles` — score `27`, top file `5`
6. `slate` — score `24`, top file `4`
7. `tag` — score `18`, top file `9`
8. `dnd` — score `15`, top file `3`
9. `list` — score `15`, top file `3`
10. `list-classic` — score `14`, top file `4`

## Best Remaining Files

- [BaseTabbablePlugin.ts](/Users/zbeyens/git/plate/packages/tabbable/src/lib/BaseTabbablePlugin.ts) — `tabbable`, score `10`, coverage `0.0%`, uncovered `46`
- [BaseTogglePlugin.ts](/Users/zbeyens/git/plate/packages/toggle/src/lib/BaseTogglePlugin.ts) — `toggle`, score `10`, coverage `0.0%`, uncovered `46`
- [isEqualTags.ts](/Users/zbeyens/git/plate/packages/tag/src/lib/isEqualTags.ts) — `tag`, score `9`, coverage `0.0%`, uncovered `42`
- [BaseSlashPlugin.ts](/Users/zbeyens/git/plate/packages/slash-command/src/lib/BaseSlashPlugin.ts) — `slash-command`, score `9`, coverage `0.0%`, uncovered `32`
- [BaseTagPlugin.ts](/Users/zbeyens/git/plate/packages/tag/src/lib/BaseTagPlugin.ts) — `tag`, score `9`, coverage `0.0%`, uncovered `30`
- [command-score.ts](/Users/zbeyens/git/plate/packages/udecode/cmdk/src/internal/command-score.ts) — `udecode/cmdk`, score `8`, coverage `0.0%`, uncovered `129`
- [getMentionOnSelectItem.ts](/Users/zbeyens/git/plate/packages/mention/src/lib/getMentionOnSelectItem.ts) — `mention`, score `7`, coverage `10.7%`, uncovered `25`
- [JuicePlugin.ts](/Users/zbeyens/git/plate/packages/juice/src/lib/JuicePlugin.ts) — `juice`, score `7`, coverage `0.0%`, uncovered `19`
- [IndexSearch.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/IndexSearch/IndexSearch.ts) — `emoji`, score `5`, coverage `0.0%`, uncovered `74`
- [GridSection.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/Grid/GridSection.ts) — `emoji`, score `5`, coverage `0.0%`, uncovered `63`
- [document.template.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/document.template.ts) — `docx-io`, score `5`, coverage `0.0%`, uncovered `47`
- [core.ts](/Users/zbeyens/git/plate/packages/docx-io/src/lib/internal/schemas/core.ts) — `docx-io`, score `5`, coverage `0.0%`, uncovered `46`
- [Grid.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/Grid/Grid.ts) — `emoji`, score `5`, coverage `0.0%`, uncovered `42`
- [EmojiInlineLibrary.ts](/Users/zbeyens/git/plate/packages/emoji/src/lib/utils/EmojiLibrary/EmojiInlineLibrary.ts) — `emoji`, score `5`, coverage `0.0%`, uncovered `40`
- [getDocxIndent.ts](/Users/zbeyens/git/plate/packages/docx/src/lib/docx-cleaner/utils/getDocxIndent.ts) — `docx`, score `5`, coverage `0.0%`, uncovered `34`

## What I Would Skip For Now

- `selection` as a package: still mostly DOM-ish internal machinery, even when a few helpers are technically non-React.
- recently swept low-signal leftovers in `core`, `slate`, `table`, `list`, `list-classic`, `markdown`, `suggestion`, `autoformat`, `dnd`, `basic-styles`
- UI-only packages filtered out by design

## Full Data

- [2026-03-24-coverage-priority-packages-refresh-post-batch.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-packages-refresh-post-batch.tsv)
- [2026-03-24-coverage-priority-files-refresh-post-batch.tsv](/Users/zbeyens/git/plate/docs/plans/2026-03-24-coverage-priority-files-refresh-post-batch.tsv)
