---
title: Coverage Priority Map Testing Review Non React Post Roadmap
type: testing
date: 2026-03-24
status: completed
---

# Coverage Priority Map Testing Review Non React Post Roadmap

## Inputs

- Coverage source: [lcov.info](.coverage-repo-2026-03-24n/lcov.info)
- Constraints:
  - temporary exclude `/react`
  - temporarily exclude obvious component and hook shells outside `/react`
  - no browser or e2e coverage work
  - no coverage vanity
  - file-first ranking, not package theater

## Coverage Run

- Command: `xargs -0 bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo-2026-03-24n --reporter=dots < <(tr '\n' '\0' < .claude/tmp/non_react_test_files.txt)`
- Result: Fresh non-React coverage: `2711` pass, `0` fail, `545` files, `2.35s`.

## Suite Health

- `pnpm test:profile -- --top 25`: red, but not because the non-React slice is red. The command still runs the shared fast suite and gets dragged into current React failures in TOC, core React, and autoformat.
- `pnpm test:slowest -- --top 25`: same story.
- skipped-test debt scan: none worth fixing
- commented-out spec scan: none worth fixing
- cross-spec import scan: none

## Scoring Rules

- Scope is `packages/**/src/**`.
- Exclude test files, barrels, declaration files, obvious type-only files, generated junk, temporary `/react` files, and obvious component or hook shells outside `/react`.
- Penalize low-ROI packages and helper bags that would only move coverage, not regression confidence.
- Reward parser and serializer seams, plugin resolution, plugin contracts, static render contracts, transforms, queries, merge helpers, and normalization.
- Missing-from-lcov runtime files are treated as fully uncovered. Pretending they have zero uncovered lines is clown math.
- `package_score` is the sum of the top 5 remaining file scores in that package.

## Strong Take

Do not do another non-React package sweep.

There is one last real non-React cleanup batch, and it is mostly `core` static or parser seams plus one `code-block` deserializer and one tiny `excalidraw` plugin contract. After that, non-React coverage is basically spent and you should stop.

## Threshold Counts

- `score >= 7`: `3` files
- `score >= 6`: `8` files
- `score >= 5`: `19` files
- `score >= 4`: `74` files
- `score >= 3`: `124` files
- `score >= 2`: `198` files
- `score >= 1`: `204` files

## Strict Next Batch

1. `code-block`: [htmlDeserializerCodeBlock.ts](packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.ts) — score `7`
2. `core`: [HtmlPlugin.ts](packages/core/src/lib/plugins/html/HtmlPlugin.ts) — score `7`
3. `core`: [htmlStringToEditorDOM.ts](packages/core/src/static/deserialize/htmlStringToEditorDOM.ts) — score `7`
4. `core`: [pluginRenderTextStatic.tsx](packages/core/src/static/pluginRenderTextStatic.tsx) — score `6`
5. `core`: [ParserPlugin.ts](packages/core/src/lib/plugins/ParserPlugin.ts) — score `6`
6. `core`: [pipeDecorate.ts](packages/core/src/static/utils/pipeDecorate.ts) — score `6`
7. `excalidraw`: [BaseExcalidrawPlugin.ts](packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts) — score `6`
8. `core`: [ViewPlugin.ts](packages/core/src/static/plugins/ViewPlugin.ts) — score `6`

## Wider Batch If You Still Care

1. `core`: [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx) — score `5`
2. `core`: [pluginRenderLeafStatic.tsx](packages/core/src/static/pluginRenderLeafStatic.tsx) — score `5`
3. `core`: [withScrolling.ts](packages/core/src/lib/plugins/dom/withScrolling.ts) — score `5`
4. `core`: [pluginRenderElementStatic.tsx](packages/core/src/static/pluginRenderElementStatic.tsx) — score `5`
5. `dnd`: [onDropNode.ts](packages/dnd/src/transforms/onDropNode.ts) — score `5`
6. `core`: [htmlElementToLeaf.ts](packages/core/src/lib/plugins/html/utils/htmlElementToLeaf.ts) — score `5`
7. `core`: [AstPlugin.ts](packages/core/src/lib/plugins/AstPlugin.ts) — score `5`
8. `link`: [upsertLink.ts](packages/link/src/lib/transforms/upsertLink.ts) — score `5`
9. `markdown`: [convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts) — score `5`

## Packages By Value

1. `core` — package score `32`
2. `markdown` — package score `21`
3. `list-classic` — package score `20`
4. `slate` — package score `20`
5. `table` — package score `20`
6. `docx-io` — package score `19`
7. `suggestion` — package score `19`
8. `code-block` — package score `17`
9. `basic-nodes` — package score `17`
10. `list` — package score `13`

## Best Files By Value

1. `code-block` — [htmlDeserializerCodeBlock.ts](packages/code-block/src/lib/deserializer/htmlDeserializerCodeBlock.ts) — score `7`, coverage `39.5%`, uncovered `23`
2. `core` — [HtmlPlugin.ts](packages/core/src/lib/plugins/html/HtmlPlugin.ts) — score `7`, coverage `75.0%`, uncovered `5`
3. `core` — [htmlStringToEditorDOM.ts](packages/core/src/static/deserialize/htmlStringToEditorDOM.ts) — score `7`, coverage `16.7%`, uncovered `5`
4. `core` — [pluginRenderTextStatic.tsx](packages/core/src/static/pluginRenderTextStatic.tsx) — score `6`, coverage `35.7%`, uncovered `63`
5. `core` — [ParserPlugin.ts](packages/core/src/lib/plugins/ParserPlugin.ts) — score `6`, coverage `47.8%`, uncovered `36`
6. `core` — [pipeDecorate.ts](packages/core/src/static/utils/pipeDecorate.ts) — score `6`, coverage `21.2%`, uncovered `26`
7. `excalidraw` — [BaseExcalidrawPlugin.ts](packages/excalidraw/src/lib/BaseExcalidrawPlugin.ts) — score `6`, coverage `0.0%`, uncovered `13`
8. `core` — [ViewPlugin.ts](packages/core/src/static/plugins/ViewPlugin.ts) — score `6`, coverage `73.1%`, uncovered `7`
9. `core` — [getSelectedDomFragment.tsx](packages/core/src/static/utils/getSelectedDomFragment.tsx) — score `5`, coverage `13.9%`, uncovered `31`
10. `core` — [pluginRenderLeafStatic.tsx](packages/core/src/static/pluginRenderLeafStatic.tsx) — score `5`, coverage `74.4%`, uncovered `23`

## Stop Condition

Stop non-React coverage after the strict batch, or after the wider batch if you still want a little more. After that, the remaining misses are mostly DOM-ish static helpers, partial-coverage crumbs, schema boilerplate, or low-ROI dust.

That is the point where more non-React coverage turns into percentage cosplay. Switch to React or architecture-safety work instead.

## Caveats

- Package totals are noisier than file totals. Trust the file ranking more.
- The temporary non-React cut still leaves a few DOM-heavy static files. That is fine. They rank because they are real seams, not because they are pretty.
- The timing commands are currently polluted by React failures in the shared fast suite, so they are not good ranking input for this temporary cut.

## Full Data

- [2026-03-24-coverage-priority-packages-testing-review-non-react-post-roadmap.tsv](docs/plans/2026-03-24-coverage-priority-packages-testing-review-non-react-post-roadmap.tsv)
- [2026-03-24-coverage-priority-files-testing-review-non-react-post-roadmap.tsv](docs/plans/2026-03-24-coverage-priority-files-testing-review-non-react-post-roadmap.tsv)
