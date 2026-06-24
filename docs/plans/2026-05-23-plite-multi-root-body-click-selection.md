# Plite Multi-root Body Click Selection

## Goal

Fix the multi-root document native pointer path where clicking the body editor
after typing in the header leaves DOM focus/selection in the header.

## Current Evidence

- Live repro on `http://localhost:3100/examples/multi-root-document`:
  header click + type, then body text click leaves `document.activeElement.id`
  as `multi-root-header`.
- Prior solutions say text-surface clicks must stay native, while blank-root
  clicks may restore the cached caret.

## Plan

1. Add one browser regression that clicks header text, types, clicks body text,
   and asserts native selection plus follow-up typing land in body.
2. Keep existing blank-root restore behavior covered.
3. Fix the root-chrome pointer handoff without moving selection authority into
   the example app.
4. Run focused Playwright, package tests, typecheck, and lint fix.

## Verification

- RED: focused multi-root Playwright row fails before the fix.
- GREEN: focused multi-root row passes after the fix.
- Regression: `use-slate-root-chrome` tests pass.
- Package checks: scoped Plite React typecheck and lint fix.

## Result

- Added a browser regression in
  `apps/www/tests/plite-browser/donor/examples/multi-root-document.test.ts`
  for header native typing followed by a body text-line click.
- Kept true blank-root restore intact while treating Plite element line boxes as
  native editable descendants in
  `packages/plite-react/src/hooks/use-slate-root-chrome.ts`.
- Added hook-level coverage in
  `packages/plite-react/test/use-slate-root-chrome.test.tsx`.
- Added `Plate repo root/.changeset/native-root-line-clicks.md`.

## Evidence

- RED before fix:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/multi-root-document.test.ts --project=chromium --grep "moves the native caret into body text after typing in header" --workers=1 --retries=0`
  failed with body caret offset `41` instead of `43`.
- GREEN after fix: same command passed.
- `bun --filter plite-react test:vitest -- test/use-slate-root-chrome.test.tsx`
  passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1 --retries=0`
  passed, `9 passed`.
- `bun --filter plite-react typecheck` passed.
- `bun lint:fix` passed with no fixes on the final run.
- `node tooling/scripts/completion-check.mjs` passed.
