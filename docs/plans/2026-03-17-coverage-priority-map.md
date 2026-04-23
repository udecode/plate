---
title: Coverage Priority Map
type: testing
date: 2026-03-17
status: completed
---

# Coverage Priority Map

## Goal

Use fresh repo coverage to rank the next non-React test work by value.

This pass starts from real `lcov`, not stale assumptions.

## Coverage Run

- Command:
  - `bun test --coverage --coverage-reporter=lcov --coverage-dir=.coverage-repo --reporter=dots`
- Result:
  - `2433 pass`
  - `0 fail`
  - `405 files`
  - `3.09s`
- Artifact:
  - [.coverage-repo/lcov.info](.coverage-repo/lcov.info)

## Scoring Rules

- Scope is `packages/*/src/**`.
- `score` is `0-10`.
- `/react` or other React-bound files score `0` and are excluded for this pass.
- `index.*`, type-only files, and barrels score `0`.
- Real runtime files get higher scores when they have:
  - deterministic transforms, parsers, serializers, queries, utils, provider logic, or plugin contracts
  - low runtime coverage
  - bigger behavioral surface
- Package boosts are intentional, not arbitrary:
  - `markdown`, `yjs`, `media` get extra weight because they combine framework value with deterministic non-React seams
- Penalties are intentional too:
  - browser or UI-skewed packages such as `playwright`, `floating`, and similar niches are pushed down

## What I Would Do Next

### 1. `markdown`

Best next slice.

- High-value files:
  - [packages/markdown/src/lib/MarkdownPlugin.ts](packages/markdown/src/lib/MarkdownPlugin.ts)
  - [packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.ts](packages/markdown/src/lib/deserializer/utils/customMdxDeserialize.ts)
  - [packages/markdown/src/lib/rules/defaultRules.ts](packages/markdown/src/lib/rules/defaultRules.ts)
  - [packages/markdown/src/lib/serializer/convertTextsSerialize.ts](packages/markdown/src/lib/serializer/convertTextsSerialize.ts)
  - [packages/markdown/src/lib/serializer/convertNodesSerialize.ts](packages/markdown/src/lib/serializer/convertNodesSerialize.ts)
- Why:
  - pure deterministic behavior
  - user-visible output contracts
  - several files already partly covered, so a focused pass will move real confidence fast

### 2. `yjs`

Best untouched contract lane.

- High-value files:
  - [packages/yjs/src/lib/BaseYjsPlugin.ts](packages/yjs/src/lib/BaseYjsPlugin.ts)
  - [packages/yjs/src/lib/withPlateYjs.ts](packages/yjs/src/lib/withPlateYjs.ts)
  - [packages/yjs/src/utils/slateToDeterministicYjsState.ts](packages/yjs/src/utils/slateToDeterministicYjsState.ts)
  - [packages/yjs/src/lib/providers/registry.ts](packages/yjs/src/lib/providers/registry.ts)
  - [packages/yjs/src/lib/providers/hocuspocus-provider.ts](packages/yjs/src/lib/providers/hocuspocus-provider.ts)
- Why:
  - zero runtime coverage on real contracts
  - framework-critical provider and synchronization logic
  - no React required

### 3. `media`

Cheap, useful, and still visibly under-covered in the exact seams that matter.

- High-value files:
  - [packages/media/src/lib/media/insertMedia.ts](packages/media/src/lib/media/insertMedia.ts)
  - [packages/media/src/lib/media-embed/transforms/insertMediaEmbed.ts](packages/media/src/lib/media-embed/transforms/insertMediaEmbed.ts)
  - [packages/media/src/lib/placeholder/transforms/insertPlaceholder.ts](packages/media/src/lib/placeholder/transforms/insertPlaceholder.ts)
  - [packages/media/src/lib/placeholder/transforms/setMediaNode.ts](packages/media/src/lib/placeholder/transforms/setMediaNode.ts)
  - [packages/media/src/lib/media-embed/parseVideoUrl.ts](packages/media/src/lib/media-embed/parseVideoUrl.ts)
- Why:
  - deterministic URL and transform logic
  - exact kind of coverage that catches real regressions
  - no `/react` drift needed

### 4. `autoformat`

Still worth a pass, but after the three above.

- High-value files:
  - [packages/autoformat/src/lib/transforms/autoformatBlock.ts](packages/autoformat/src/lib/transforms/autoformatBlock.ts)
  - [packages/autoformat/src/lib/transforms/autoformatMark.ts](packages/autoformat/src/lib/transforms/autoformatMark.ts)
  - [packages/autoformat/src/lib/transforms/autoformatText.ts](packages/autoformat/src/lib/transforms/autoformatText.ts)
  - [packages/autoformat/src/lib/utils/getMatchPoints.ts](packages/autoformat/src/lib/utils/getMatchPoints.ts)
  - [packages/autoformat/src/lib/utils/getMatchRange.ts](packages/autoformat/src/lib/utils/getMatchRange.ts)
- Why:
  - big logic gaps
  - deterministic transforms
  - good unit-test seams

## Second Tier

- `docx-io`
  - Still has real debt, especially under `html-to-docx`, but it just got a pass and the next best immediate value is still `markdown`, `yjs`, then `media`.
- `docx`
  - Good deterministic cleanup lane after `docx-io`.
- `suggestion`
  - Real value. Lower leverage than `markdown` and `yjs`, but solid.
- `list-classic`
  - Good transform seams. Lower urgency than the three above.
- `dnd`
  - Pure enough to test, but less strategic than the top group.

## Explicitly Not Next

- `table`
  - There is still real table backlog in coverage, but you said tables were the latest push. I would not keep grinding that package right now.
- `core`
  - There are still isolated non-React files worth testing, but current repo state says the next best whole-package value is elsewhere.
- Anything React-bound
  - excluded on purpose for this pass
- Thin wrappers, barrels, and type-only files
  - scored `0` on purpose

## Ranking Snapshot

| Rank | Package        | Score | Notes                                           |
| ---- | -------------- | ----: | ----------------------------------------------- |
| 1    | `markdown`     |    50 | Best next deterministic parser/serializer slice |
| 2    | `yjs`          |    50 | Biggest untouched non-React contract lane       |
| 3    | `media`        |    49 | Cheap and useful transform/url seams            |
| 4    | `autoformat`   |    48 | Large transform gaps, honest unit seams         |
| 5    | `docx-io`      |    46 | Still valuable, but not the very next move      |
| 6    | `docx`         |    45 | Good second-tier deterministic cleanup          |
| 7    | `table`        |    44 | Real backlog, but not next after table work     |
| 8    | `list-classic` |    44 | Useful transform coverage                       |
| 9    | `dnd`          |    44 | Pure but lower leverage                         |
| 10   | `suggestion`   |    43 | Solid follow-up package                         |

## Full Data

The raw package and file matrices were generated as TSV artifacts during this pass and are intentionally treated as disposable analysis output, not committed source of truth.

The file matrix included every file under `packages/*/src`, with:

- `score`
- `line_cov_pct`
- `uncovered_lines`
- `source_lines`
- `status`
  - `candidate`
  - `excluded-react`
  - `excluded-type`
  - `excluded-barrel`
