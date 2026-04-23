---
date: 2026-04-03
topic: slate-browser-first-tranche-plan
status: completed
---

# Slate Browser First Tranche Plan

## Goal

Build the first working `slate-browser` package tranche in `../slate-v2`:

- Bun for core fast tests
- Vitest browser for small DOM/browser contract tests
- Playwright helpers for example/e2e tests

## First Tranche Shape

1. self-contained package under `packages/slate-browser`
2. one Bun unit test with global `describe` / `it`
3. one Vitest browser contract test
4. one Playwright helper module plus one tiny example integration test
5. one Chromium-only CDP IME helper plus one placeholder-example IME test

## Success Criteria

- all three lanes run in this same turn
- the API shape matches the docs enough to validate direction
- the setup reveals whether any early tool/runtime issue should force a pivot

## Progress Log

### 2026-04-03

- created the first package tranche at:
  `/Users/zbeyens/git/slate-v2/packages/slate-browser`
- implemented:
  - Bun fast lane with global test API
  - Vitest browser lane with Playwright provider
  - shared Playwright helper module in Slate proper
  - one tiny example integration test using the shared helper API
  - one Chromium CDP IME helper and one placeholder-example IME test
- added root scripts:
  - `test:slate-browser`
  - `test:slate-browser:core`
  - `test:slate-browser:dom`
  - `test:slate-browser:e2e`
  - `test:slate-browser:ime`
  - local fixed-port variants for the two Playwright lanes
- early issues found and fixed:
  - Bun runtime globals needed TypeScript support via `bun-types/test-globals`
  - the helper API had to respect `PLAYWRIGHT_BASE_URL`
  - repo Playwright needed `yarn exec playwright install chromium`, not ad hoc `npx playwright install`
  - root Yarn PnP polluted the nested npm/Vitest package, so root scripts now unset `NODE_OPTIONS`
  - local Playwright smoke needs a fixed-port server helper to avoid port roulette
- verification evidence:
  - `bun test src/core`
  - `yarn workspace slate-browser test`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:e2e`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:ime`
  - `yarn build:rollup`
  - `yarn lint:typescript`
  - LSP diagnostics `0` on new TS files
- architect verdict: `APPROVE`

### 2026-04-04

- continuing from the first tranche into the next real backlog slice:
  - empty-block IME composition on the placeholder path
  - DOM selection assertion fixture
  - clipboard contract fixture
  - persistent annotation anchor regression
  - zero-width shape fixtures
  - shared Playwright helper assertions
- loaded the current `slate-browser` docs plus the narrow solution docs first
- current evidence before edits:
  - IME must stay real-browser only
  - zero-width selection must normalize both directions
  - clipboard semantics and clipboard DOM transport are different seams
- current failures to resolve honestly:
  - Playwright helper smoke asserts the wrong initial caret position on the
    placeholder example
  - synthetic HTML paste through the current Playwright helper does not prove
    real paste behavior and currently does not update the editor
- landed the first real follow-up tranche in `../slate-v2`:
  - `assertSelection` now normalizes FEFF zero-width DOM offsets back to Slate
    offset `0`
  - `assertDomSelection` stays raw and proves the browser is really at native
    offset `1` on the placeholder path
  - Vitest browser fixtures now pin both FEFF-backed and `<br>`-only
    zero-width shapes
  - Playwright IME proof on the empty-block placeholder path is green
  - clipboard contract fixture moved off flaky OS clipboard reads and onto
    browser DOM transport with a synthetic `copy` event plus captured payload
  - helper `selectAllInEditor(...)` now waits for selection sync before
    selection-sensitive helper assertions
  - Playwright helper DX is now fronted by an editor-first harness:
    - `const editor = await openExample(page, name)`
    - `editor.focus()`
    - `editor.type(...)`
    - `editor.press(...)`
    - `editor.selectAll()`
    - `editor.assert.text/html/selection/domSelection/placeholderVisible`
    - `editor.clipboard.copy/copyPayload`
    - `editor.ime.enableKeyEvents/compose`
  - existing standalone helper functions remain as thin wrappers for now
- explicit current state:
  - persistent annotation anchor coverage is now split across:
    - mounted-runtime assertions in `slate-react-v2`
    - a dedicated hidden site example plus Playwright browser regression
- verification evidence:
  - `yarn workspace slate-browser test`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:e2e`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:ime`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:clipboard`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3200 yarn test:slate-browser:anchors`
  - `yarn workspace slate-react-v2 test`
  - `yarn build:rollup`
  - `yarn lint:typescript`
