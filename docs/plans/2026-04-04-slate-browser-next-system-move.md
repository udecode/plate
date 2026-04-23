# Slate Browser Next System Move

## Context

- Continue from the existing Slate v2 / `slate-browser` state across:
  - `/Users/zbeyens/git/plate-2`
  - `/Users/zbeyens/git/slate-v2`
- First requested move: relocate the former internal docs tree into `/Users/zbeyens/git/plate-2/docs`.
- Then re-read the current Slate v2 / `slate-browser` docs, summarize state, and choose the strongest next system-level move.

## Phases

1. Complete: move the former internal docs tree into `docs/` without losing existing `docs/*` content.
2. Complete: update internal doc references to `docs`.
3. Complete: read the requested docs and relevant package/test files.
4. Complete: synthesize the strongest next move for `slate-browser` / `slate-v2`.
5. Complete: make direct doc changes for that move.
6. Complete: run same-turn verification for the doc migration and doc sync.

## Findings

- Existing `docs/` already contains active content under `analysis/`, `plans/`, `solutions/`, `performance/`, and `table/`.
- The former internal docs tree contained additional `plans/`, `slate-browser/`, `slate-v2`, `slate-issues`, and extra `solutions/` subtrees.
- This is a merge, not a rename.
- The current `slate-browser` public tranche is already landed in `../slate-v2`.
- The highest-leverage next move is not cross-browser or perf first.
- The best next move is a stronger `openExample(...)` readiness contract, then a renderer/input-policy gauntlet for zero-width and IME-sensitive behavior.
- The broader system objective is now explicit:
  - `slate-v2` for document truth
  - `slate-browser` for browser proof
  - future `plate-v2` for projections, pipelines, hosted services, layout systems, and productization
- The strongest cross-domain imports remain:
  - TanStack DB for projection stores
  - urql for execution pipelines
  - VS Code + LSP for hosted semantic services
  - Premirror + Pretext for layout and measurement systems
  - rich-textarea / edix for lightweight surfaces
- The next API-candidate ranking for `slate-browser` is now explicit:
  1. `ready` contract
  2. `editor.selection.select(...)`
  3. `editor.get.blockTexts()` / `assert.blockTexts(...)`
  4. `editor.snapshot()`
  5. tolerant selection assertions
  6. HTML normalization options
  7. real clipboard read helpers
  8. later path-oriented locators
- The deeper matrix sharpened the phase split:
  - Phase 1:
    `ready`, `selection.select(...)`, `blockTexts`, `snapshot()`
  - Phase 2:
    tolerant selection assertions, HTML normalization options, maybe
    `get.selectedText()`
  - Phase 3:
    real clipboard reads, alternate-surface scoping, path-oriented locators
- Alternate-surface scoping for iframe/shadow DOM is real future pressure, but
  still later than the core semantic tranche.
- The 4-way deep dive changed one thing materially:
  - `ProseMirror` surfaced a real later API candidate:
    `editor.selection.bookmark()` / `capture()`
  - but only if it is backed by a real Slate-side bookmark/range-ref seam
    rather than Playwright fakery.
- Phase 1 is now landed in code:
  - `ready` contract
  - `editor.selection.select(...)`
  - `editor.selection.collapse(...)`
  - `editor.get.blockTexts()`
  - `editor.assert.blockTexts(...)`
  - `editor.snapshot()`
- Phase 2 is now landed in code:
  - tolerant selection assertions
  - tolerant DOM-selection assertions
  - `editor.get.selectedText()`
  - normalized `editor.assert.htmlEquals(..., options?)`
- Phase 3 is now landed in code:
  - real clipboard reads:
    `editor.clipboard.readText()`
    `editor.clipboard.readHtml()`
  - alternate-surface scoping:
    `surface.frame`
    `surface.scope`
  - path-oriented locators:
    `editor.locator.block(...)`
    `editor.locator.text(...)`
- The later bookmark seam is now also landed in code:
  - `editor.selection.capture(...)`
  - `editor.selection.bookmark(...)`
  - `editor.selection.resolve(...)`
  - `editor.selection.restore(...)`
  - `editor.selection.unref(...)`
- This seam is backed by actual editor `RangeRef` semantics exposed on the root
  surface, not a fake Playwright-only snapshot alias.
- Local confidence commands now exist and work:
  - `yarn test:slate-browser:e2e:local`
  - `yarn test:slate-browser:bookmarks:local`

## Progress

- 2026-04-04: loaded `task`, `learnings-researcher`, `planning-with-files`, and `major-task`.
- 2026-04-04: inspected current `docs/` vs the former internal docs tree to map overlap before migration.
- 2026-04-04: moved the former internal docs tree into `docs/` and rewrote stale internal path references.
- 2026-04-04: re-read the requested Slate v2 / `slate-browser` docs, learning docs, package files, and example tests.
- 2026-04-04: added `docs/slate-browser/next-system-move.md` and linked it from the `slate-browser` and `slate-v2` overview docs.
- 2026-04-04: verified the old internal docs tree is gone and no stale old-path references remain in `plate-2` or `slate`.
- 2026-04-04: ran a broader local-repo systems pass across Lexical, edix, rich-textarea, Premirror, Pretext, TanStack DB, urql, VS Code, and LSP.
- 2026-04-04: added `docs/analysis/editor-global-systems-objective.md` and linked it from `docs/slate-v2/overview.md`.
- 2026-04-04: re-ran the candidate-repo API pass focused on next `slate-browser` helper shapes and added `docs/slate-browser/next-api-candidates.md`.
- 2026-04-04: dug deeper into candidate helper shape and current Slate suite pain, then added `docs/slate-browser/next-api-candidates-matrix.md`.
- 2026-04-04: completed the focused 4-way pass across Lexical, ProseMirror, Tiptap, and edix, then added `docs/slate-browser/four-way-api-deep-dive.md`.
- 2026-04-04: implemented the Phase 1 `slate-browser` Playwright tranche in `../slate-v2/packages/slate-browser/src/playwright/index.ts`.
- 2026-04-04: added red/green Playwright coverage for readiness, semantic selection setup, block-text assertions, and snapshots in `../slate-v2/playwright/integration/examples/slate-browser-helpers.test.ts`.
- 2026-04-04: synced the public package README in `../slate-v2/packages/slate-browser/README.md`.
- 2026-04-04: implemented the Phase 2 `slate-browser` Playwright tranche in `../slate-v2/packages/slate-browser/src/playwright/index.ts`.
- 2026-04-04: added red/green Playwright coverage for tolerant selection assertions, selected-text getter, and normalized html equality in `../slate-v2/playwright/integration/examples/slate-browser-helpers.test.ts`.
- 2026-04-04: re-verified:
  - `yarn workspace slate-browser test`
  - `yarn lint:typescript`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:e2e`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:ime`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:clipboard`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:anchors`
- 2026-04-04: implemented the Phase 3 `slate-browser` Playwright tranche in `../slate-v2/packages/slate-browser/src/playwright/index.ts`.
- 2026-04-04: added red/green Playwright coverage for clipboard reads, iframe/shadow surfaces, and block path locators in `../slate-v2/playwright/integration/examples/slate-browser-helpers.test.ts`.
- 2026-04-04: re-verified the same package/lint/browser set after restoring the local Playwright Chromium installation.
- 2026-04-04: exposed a deliberate Slate browser-test handle on legacy `Editable` roots and `slate-dom-v2` mounted roots so `slate-browser` can create real `RangeRef`-backed selection bookmarks.
- 2026-04-04: added red/green Playwright coverage for captured selection bookmarks in `../slate-v2/playwright/integration/examples/slate-browser-helpers.test.ts`.
- 2026-04-04: verified the bookmark seam with a fresh local site server on `http://localhost:3210` because the shared `:3200` server was not a trustworthy target for app-runtime changes.
- 2026-04-04: re-verified:
  - `yarn workspace slate-browser test`
  - `yarn lint:typescript`
  - `ROLLUP_PACKAGES=slate-browser,slate-react,slate-dom-v2 yarn build:rollup`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3210 yarn exec playwright test /Users/zbeyens/git/slate-v2/playwright/integration/examples/slate-browser-helpers.test.ts --project=chromium --grep "captured selection bookmarks" --workers=1`
- 2026-04-04: fixed the broken local Playwright runner path by adding `scripts/run-slate-browser-local.sh` and wiring fresh-server local commands in `../slate-v2/package.json`.
- 2026-04-04: verified the fresh-server full helper suite with `yarn test:slate-browser:e2e:local`.
