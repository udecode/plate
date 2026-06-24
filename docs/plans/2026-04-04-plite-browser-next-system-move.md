# Plite Browser Next System Move

## Context

- Continue from the existing Plite / `plite-browser` state across:
  - `/Users/zbeyens/git/plate-2`
  - `/Users/zbeyens/git/plite`
- First requested move: relocate the former internal docs tree into `/Users/zbeyens/git/plate-2/docs`.
- Then re-read the current Plite / `plite-browser` docs, summarize state, and choose the strongest next system-level move.

## Phases

1. Complete: move the former internal docs tree into `docs/` without losing existing `docs/*` content.
2. Complete: update internal doc references to `docs`.
3. Complete: read the requested docs and relevant package/test files.
4. Complete: synthesize the strongest next move for `plite-browser` / `plite`.
5. Complete: make direct doc changes for that move.
6. Complete: run same-turn verification for the doc migration and doc sync.

## Findings

- Existing `docs/` already contains active content under `analysis/`, `plans/`, `solutions/`, `performance/`, and `table/`.
- The former internal docs tree contained additional `plans/`, `plite-browser/`, `plite`, `plite-issues`, and extra `solutions/` subtrees.
- This is a merge, not a rename.
- The current `plite-browser` public tranche is already landed in `Plate repo root`.
- The highest-leverage next move is not cross-browser or perf first.
- The best next move is a stronger `openExample(...)` readiness contract, then a renderer/input-policy gauntlet for zero-width and IME-sensitive behavior.
- The broader system objective is now explicit:
  - `plite` for document truth
  - `plite-browser` for browser proof
  - future `plate-v2` for projections, pipelines, hosted services, layout systems, and productization
- The strongest cross-domain imports remain:
  - TanStack DB for projection stores
  - urql for execution pipelines
  - VS Code + LSP for hosted semantic services
  - Premirror + Pretext for layout and measurement systems
  - rich-textarea / edix for lightweight surfaces
- The next API-candidate ranking for `plite-browser` is now explicit:
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
  - but only if it is backed by a real Plite-side bookmark/range-ref seam
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
  - `yarn test:plite-browser:e2e:local`
  - `yarn test:plite-browser:bookmarks:local`

## Progress

- 2026-04-04: loaded `task`, `learnings-researcher`, `goal workflow`, and `major-task`.
- 2026-04-04: inspected current `docs/` vs the former internal docs tree to map overlap before migration.
- 2026-04-04: moved the former internal docs tree into `docs/` and rewrote stale internal path references.
- 2026-04-04: re-read the requested Plite / `plite-browser` docs, learning docs, package files, and example tests.
- 2026-04-04: added `docs/plite-browser/next-system-move.md` and linked it from the `plite-browser` and `plite` overview docs.
- 2026-04-04: verified the old internal docs tree is gone and no stale old-path references remain in `plate-2` or `slate`.
- 2026-04-04: ran a broader local-repo systems pass across Lexical, edix, rich-textarea, Premirror, Pretext, TanStack DB, urql, VS Code, and LSP.
- 2026-04-04: added `docs/analysis/editor-global-systems-objective.md` and linked it from `docs/plite/overview.md`.
- 2026-04-04: re-ran the candidate-repo API pass focused on next `plite-browser` helper shapes and added `docs/plite-browser/next-api-candidates.md`.
- 2026-04-04: dug deeper into candidate helper shape and current Plite suite pain, then added `docs/plite-browser/next-api-candidates-matrix.md`.
- 2026-04-04: completed the focused 4-way pass across Lexical, ProseMirror, Tiptap, and edix, then added `docs/plite-browser/four-way-api-deep-dive.md`.
- 2026-04-04: implemented the Phase 1 `plite-browser` Playwright tranche in `packages/browser/src/playwright/index.ts`.
- 2026-04-04: added red/green Playwright coverage for readiness, semantic selection setup, block-text assertions, and snapshots in `apps/www/tests/plite-browser/donor/examples/plite-browser-helpers.test.ts`.
- 2026-04-04: synced the public package README in `packages/browser/README.md`.
- 2026-04-04: implemented the Phase 2 `plite-browser` Playwright tranche in `packages/browser/src/playwright/index.ts`.
- 2026-04-04: added red/green Playwright coverage for tolerant selection assertions, selected-text getter, and normalized html equality in `apps/www/tests/plite-browser/donor/examples/plite-browser-helpers.test.ts`.
- 2026-04-04: re-verified:
  - `yarn workspace plite-browser test`
  - `yarn lint:typescript`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:plite-browser:e2e`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:plite-browser:ime`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:plite-browser:clipboard`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:plite-browser:anchors`
- 2026-04-04: implemented the Phase 3 `plite-browser` Playwright tranche in `packages/browser/src/playwright/index.ts`.
- 2026-04-04: added red/green Playwright coverage for clipboard reads, iframe/shadow surfaces, and block path locators in `apps/www/tests/plite-browser/donor/examples/plite-browser-helpers.test.ts`.
- 2026-04-04: re-verified the same package/lint/browser set after restoring the local Playwright Chromium installation.
- 2026-04-04: exposed a deliberate Plite browser-test handle on legacy `Editable` roots and `plite-dom-v2` mounted roots so `plite-browser` can create real `RangeRef`-backed selection bookmarks.
- 2026-04-04: added red/green Playwright coverage for captured selection bookmarks in `apps/www/tests/plite-browser/donor/examples/plite-browser-helpers.test.ts`.
- 2026-04-04: verified the bookmark seam with a fresh local site server on `http://localhost:3210` because the shared `:3200` server was not a trustworthy target for app-runtime changes.
- 2026-04-04: re-verified:
  - `yarn workspace plite-browser test`
  - `yarn lint:typescript`
  - `ROLLUP_PACKAGES=plite-browser,slate-react,plite-dom-v2 yarn build:rollup`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3210 yarn exec playwright test /Users/zbeyens/git/plite/playwright/integration/examples/plite-browser-helpers.test.ts --project=chromium --grep "captured selection bookmarks" --workers=1`
- 2026-04-04: fixed the broken local Playwright runner path by adding `scripts/run-plite-browser-local.sh` and wiring fresh-server local commands in `Plate repo root/package.json`.
- 2026-04-04: verified the fresh-server full helper suite with `yarn test:plite-browser:e2e:local`.
