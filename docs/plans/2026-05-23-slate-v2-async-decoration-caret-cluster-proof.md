# Slate v2 async decoration caret cluster proof

## Goal

Process Cluster 10 from the Slate issue ledger:

- issue: `#5987` caret jumps when `decorate` changes from an async state update
- upstream PR: `#6033` fixes the same failure by keeping decoration restructuring and `Editable` selection restoration in sync

## Evidence

- The issue recording shows a caret at the end of `This is some text here about. there`, then typing ` there`, then a delayed highlight appears and the caret jumps backward between `about.` and `there`.
- Existing ledger state only claims `Improves #5987` because current proof covers projection-source stability but not the exact async `Editable.decorate` repro.
- The relevant Slate v2 surface still supports `Editable.decorate`; exact proof should target that adapter, not only first-class `decorationSources`.

## Claim Bar

Promote to `Fixes #5987` only if a browser integration test proves all of:

1. `Editable` receives a `decorate` prop whose function identity changes after an async state update.
2. The user types matching text at the end of the editor before the async decoration applies.
3. The delayed decoration visibly restructures the rendered text.
4. Browser selection and Slate selection remain at the typed document end after the delayed decoration applies.

If any part is missing, keep the issue as `Improves #5987`.

## Plan

1. [done] Add a focused `decorations-async` example that mirrors the upstream issue path.
2. [done] Add a Playwright regression around typing at the end, waiting for delayed highlight, and asserting caret stability.
3. [done] Fix `slate-react` only if the new row fails.
4. [done] Run focused browser verification for the new row.
5. [done] Update Cluster 10 ledgers with the exact proof and final claim.

## Changeset

No changeset is required if this pass only adds a site example, tests, and ledger updates. If package runtime code changes under `Plate repo root/packages`, decide changeset necessity before closeout.

Package runtime code changed under `packages/slate-react`, so the
Slate v2 checkout includes `.changeset/async-decorate-caret.md`. No Plate
changeset is required.

## Result

Claim: `Fixes #5987`.

The new browser row reproduced the exact failure before the runtime fix:

- Slate model selection stayed at offset `41`.
- Browser DOM caret stayed at offset `35`, where the old decorated text ended.

The fix asks the editable repair runtime to force a repair render after external
`Editable.decorate` refreshes. Decoration-only DOM changes do not create an
editor commit, so this gives selection export a render pass after the projected
text DOM has been restructured.

## Verification

- `bun lint:fix`
- `bun --filter slate-react typecheck`
- `PLAYWRIGHT_RETRIES=0 bun playwright playwright/integration/examples/decorations-async.test.ts --project=chromium`
