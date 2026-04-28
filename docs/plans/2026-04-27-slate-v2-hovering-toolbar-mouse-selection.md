# Slate v2 Hovering Toolbar Mouse Selection

## Status

Complete.

## Goal

Fix `/examples/hovering-toolbar` so the toolbar appears after real mouse
selection, and use the bug to tighten the browser-proof architecture.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Primary route: `/examples/hovering-toolbar`.
- Keep React 19.2 runtime discipline: subscribe to explicit editor state, do
  not rely on incidental rerenders.

## Findings

- Prior memory says toolbar/selection issues can stay green in Playwright when
  the harness does not match the real browser path. Use `dev-browser` early.
- Existing `playwright/integration/examples/hovering-toolbar.test.ts` contains
  `page.pause()` and uses programmatic `selectText()`, not mouse selection.
- `HoveringToolbar` reads `editor.getSelection()` inside an effect but does not
  subscribe to selection changes. `useSlate()` only rerenders on editor change
  notifications; relying on that for overlay visibility is not an API contract.
- `useSlateSelection()` exists and is the correct low-cost selector for this
  example.
- Focused Playwright proved the reported bug: after real mouse drag,
  `window.getSelection()` had text but the toolbar stayed hidden.
- The demo-level selector fix was necessary but not sufficient. Headless
  Chromium showed the root failure: the DOM selection was expanded while the
  Slate model selection stayed collapsed at drag start.
- Importing the current DOM selection on editor `mouseup` closes the native
  mouse-selection path without reopening internal controls.
- `bun test:stress` failed against reused `3101` server state, but the same
  stress lane passed when pinned to the current dev server at `3100`.

## Plan

1. Reproduce with `dev-browser` on the persistent Chrome route. Done.
2. Add a red browser regression that selects text with real mouse movement.
   Done.
3. Fix the toolbar by subscribing to selection state explicitly. Done.
4. Fix the runtime mouse-selection import gap exposed by the regression. Done.
5. Verify focused Playwright, dev-browser, typecheck, lint, slate-browser
   selection proof, stress proof, and completion check. Done.
6. Give the user the blunt architecture verdict and the next hardening moves.
   Done in final response.

## Verification

- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/hovering-toolbar.test.ts --project=chromium --workers=1 --retries=0`
  - 3 passed.
- `dev-browser --connect http://127.0.0.1:9222`
  - real mouse selection produced expanded model selection and visible toolbar.
- `bun --filter slate-react typecheck`
  - passed.
- `bun typecheck:site`
  - passed.
- `bun typecheck:root`
  - passed.
- `bun lint:fix`
  - passed, no fixes applied.
- `bun test:slate-browser:selection`
  - passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bun test:stress`
  - 5 passed.
