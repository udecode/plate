# Slate v2 Search Highlighting Input Focus

## Status

Done.

## Goal

Fix `/examples/search-highlighting` so typing into the search input decorates
matches without moving focus away from the search input.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Primary route: `/examples/search-highlighting`.
- Primary behavior: typing a letter in the search box should keep
  `document.activeElement` on the input and update highlights.

## Findings

- User reports: typing in the search box decorates, then focus is lost.
- The failure only reproduced after the editor had focus first. Cold typing
  into the search input stayed green.
- The example rebuilt `projectionStore` whenever `search` changed.
- That recreated the projection provider path while the editor still had prior
  focus state, so the first search input change moved focus back to the editor.
- Prior learnings point at two relevant rules:
  - external/internal controls must stay native-owned
  - browser proof is required for focus-sensitive Slate regressions

## Plan

1. Reproduce in `dev-browser` with real typing into the search input.
2. Add focused Playwright regression for search-input focus retention.
3. Fix at the example/runtime layer that owns focus loss.
4. Verify focused Playwright, `dev-browser`, scoped typecheck/lint.
5. Update completion state and capture learning if this teaches a durable rule.

## Verification

- Red proof:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/search-highlighting.test.ts --project=chromium --grep "keeps focus" --workers=1 --retries=0`
  failed before the fix because the search input was no longer focused.
- Fixed `/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx`
  by keeping `projectionStore` stable, reading the search term from a ref, and
  calling `projectionStore.refresh({ reason: 'external' })` on input changes.
- Added
  `/Users/zbeyens/git/slate-v2/playwright/integration/examples/search-highlighting.test.ts`
  coverage for "editor focused first, then type in search input".
- Fresh verification after lint formatting:
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/search-highlighting.test.ts --project=chromium --workers=1 --retries=0`
  - `bun typecheck:site`
  - `bun typecheck:root`
  - `bun lint:fix`
  - `dev-browser --connect http://127.0.0.1:9222` on
    `/examples/search-highlighting`: active element stayed the search input,
    value was `text`, highlight count was `2`.
