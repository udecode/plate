# Slate v2 Pagination Page Flow Fix

## Goal

Fix the experimental pagination example so typing does not grow the first page
surface. Page chrome must be fixed layout-owned geometry; the editable must be a
separate editor layer.

## Constraints

- Work in `.tmp/slate-v2`.
- Keep this experimental; do not claim production fragmented editable DOM.
- Add focused tests for page layout geometry and fixed page pagination behavior.
- Verify the actual route in Browser after typing.

## Plan

1. [complete] Reproduce and pin the broken ownership contract.
2. [complete] Add layout geometry and pagination contract tests.
3. [complete] Rework `PagedEditable` around fixed page surfaces plus one editor overlay.
4. [complete] Update the pagination example to use the shared page geometry.
5. [complete] Run package/site checks and Browser interaction proof.

## Findings

- Current `PagedEditable` renders `<Editable>` as `children` of page index `0`.
- The custom example page uses `minHeight: page.height`, so editor content growth
  can grow page 0 forever.
- Premirror keeps page surfaces and editor overlay as siblings; content placement
  is owned by decorations/projection, not by page wrappers.
- Pretext now exposes `layoutWithLines` and line-range APIs, but the current
  Slate layout engine only stores line counts. True fragmented editing remains a
  later architecture step.
- `PagedEditable` now renders page surfaces and the editor layer as siblings.
  Page renderers receive `children: null`; page chrome no longer owns the
  editable tree.
- `projectRange` now accepts page geometry options so spread/single placement
  and selection projection use the same geometry primitive.

## Progress

- 2026-05-21: Started fix after user reported first page grows while typing.
- 2026-05-21: Reloaded task/debug/testing/TDD/visual proof skills after
  compaction and read the prior paged-editable solution note.
- 2026-05-21: Added `getSlatePageLayoutGeometry` and tests for fixed page
  pagination, single/spread placement, and spread-aware range projection.
- 2026-05-21: Updated `PagedEditable` and the pagination example to use fixed
  absolute page chrome plus one editor overlay.
- 2026-05-21: Browser proof at `http://localhost:3100/examples/pagination`:
  typing 240 chars at the document start changed page count to 2 while page 0
  stayed at fixed scaled height `869.419px`.
- 2026-05-21: Verification passed: `bun --filter slate-layout test`,
  `bun --filter slate-layout typecheck`, `bun typecheck:site`,
  `bun --filter slate-layout build`, and final `bun check`.
- 2026-05-21: Reopened after user reported the route still shows one page and
  asked to copy `../premirror` setup. New target: copy the Premirror model more
  directly by making the editor overlay cover the whole page stack and
  positioning text lines from layout fragments.
- 2026-05-21: Implemented the Premirror-shaped follow-up: Pretext adapter emits
  per-line text ranges, layout fragments carry `lines`, `PagedEditable` uses a
  full-stack editor overlay, and the example projects decorated leaves into
  absolute page coordinates.
- 2026-05-21: Browser proof now shows `pages 5 | blocks 56`, facing pages across
  two rows plus one trailing page, no document-level horizontal scroll, and
  screenshot at
  `.tmp/019e46be-4ec4-7d11-bc6e-9fcf033a8803/pagination-premirror-setup.png`.
- 2026-05-21: Verification passed after follow-up: `bun --filter slate-layout
  test`, `bun --filter slate-layout-pretext test`, `bun --filter slate-layout
  typecheck`, `bun --filter slate-layout-pretext typecheck`, `bun typecheck:site`,
  `bun --filter slate-layout build`, `bun --filter slate-layout-pretext build`,
  `bun lint:fix`, and final `bun check`.
- 2026-05-21: Reopened after user correctly pointed out the debug screenshot
  still visually clips/overflows horizontally. Adjusted example scaling to keep
  a 72px inline visual gutter and switched the measured/rendered text font to
  the same Helvetica stack as Premirror. Static verification passed, but Browser
  became unavailable before fresh screenshot proof.
- 2026-05-21: Reopened after repeated `insertBreak` at the document start made
  leading empty paragraphs invisible and one Backspace removed all of them.
  Added `getSlatePageLayoutProjection`, projected empty blocks into real
  paragraph boxes, switched the example element bridge from object identity to
  Slate path keys, and fixed core Backspace to remove one preceding empty
  paragraph per command.
- 2026-05-21: Added coverage: `slate-layout` projection test for repeated empty
  blocks, `slate-layout-pretext` empty-line test, `slate` delete regression for
  repeated leading breaks, and Chromium pagination integration coverage for
  eight leading breaks plus one Backspace.
- 2026-05-21: Verification passed: `bun test ./packages/slate/test/delete-contract.ts
  --bail 1`, `bun test ./packages/slate/test --bail 1`,
  `bun --filter slate-layout test`, `bun --filter slate-layout-pretext test`,
  package typechecks/builds for `slate`, `slate-layout`, and
  `slate-layout-pretext`, `bun lint:fix`, `bun check`, and
  `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright
  playwright/integration/examples/pagination.test.ts --project=chromium`.
- 2026-05-21: Fixed the debug-frame caret edge case by painting the debug frame
  as an outline and giving projected editable blocks a 2px inline inset. Added
  regression coverage that the caret stays inside the debug content frame after
  eight leading `insertBreak` operations. Browser proof at
  `http://localhost:3101/examples/pagination`: caret left `93.3387`, frame left
  `93.1210`, so the caret is `0.2177px` inside the frame.
- 2026-05-21: Fixed blank-tail paragraph clicks by separating measured line
  width from line hit width. The projected line leaf now extends through the
  paragraph tail so native clicks resolve to the end of the line instead of the
  paragraph start. Added a Chromium regression that clicks the blank tail of the
  first paragraph and expects selection at `[0,0]` offset `290`.
- 2026-05-21: Fixed vertical blank-gap clicks between paragraphs by extending
  the previous projected last-line hit box through the next small block gap
  while leaving visual line-height unchanged. Added a Chromium regression that
  clicks the gap between paragraphs `0` and `1` and expects selection at `[0,0]`
  offset `290`.
- 2026-05-21: Reopened after the fixture showed a seeded blank paragraph between
  the third and fourth paragraph, and the rich Markdown screenshot showed a
  structured block painted across a facing-page spread. Removed the fixture
  spacer paragraphs and changed `slate-layout` pagination so small root
  `split: 'avoid'` boxes move whole to the next page when they do not fit the
  current page remainder.
- 2026-05-21: Added `slate-layout` coverage for avoid-split page moves, a
  Chromium fixture regression proving the first 42 synthetic paragraphs contain
  no blank spacer, and a rich Markdown regression proving the code block stays
  inside a debug content frame. Browser screenshots:
  `.tmp/019e46be-4ec4-7d11-bc6e-9fcf033a8803/pagination-fixed-top.png` and
  `.tmp/019e46be-4ec4-7d11-bc6e-9fcf033a8803/pagination-rich-fixed.png`.
- 2026-05-21: Fixed the follow-up Enter/Space/Enter/Backspace collapse. Root
  cause: post-delete structural cleanup pruned every empty top-level block in
  the document after merging the space paragraph with the following paragraph.
  The cleanup now prunes only top-level empty blocks inside the active delete
  range, preserving unrelated leading blank paragraphs. Added core and Chromium
  native-keyboard regressions.
- 2026-05-22: Reopened after the rich Markdown paragraph visibly overlapped
  mixed inline leaves. Root cause: `getSlatePageLayoutDecorations` iterated
  per-run but passed line-wide rects to every run, so each leaf painted at the
  same absolute left/top. Changed decoration rects to run-scoped text rects
  while extending only the final run hit rect through the blank line tail.
  Added package and Chromium regressions for mixed inline non-overlap. Browser
  proof at `http://localhost:3100/examples/pagination`: mixed paragraph has 8
  leaves, overlap count 0, screenshot
  `.tmp/019e46be-4ec4-7d11-bc6e-9fcf033a8803/pagination-rich-inline-fixed.png`.
- 2026-05-22: Reopened again after the non-overlap fix still left ugly gaps
  between mixed inline leaves. Root cause: Pretext produced line ranges, but
  `slate-layout` still synthesized line runs with `8px * chars`, ignoring
  Helvetica bold/italic and monospace code widths. `slate-layout-pretext` now
  emits measured runs per line using each run's own font and letter spacing.
  Added package coverage for font-aware run positions and Chromium coverage for
  non-overlap plus no loose non-final run spacing. Visual proof screenshot:
  `.tmp/019e46be-4ec4-7d11-bc6e-9fcf033a8803/pagination-rich-inline-spacing-fixed-playwright.png`.
