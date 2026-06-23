---
date: 2026-05-23
topic: plite-table-selection-arrow-navigation
status: ralph-execution-complete
owner: slate-ralplan
next_owner: ralph-table-selection-arrow-navigation-execution
---

# Plite Table Selection And Arrow Navigation Ralplan

## Verdict

Do not rewrite the Plite runtime for this lane.

The current architecture is the right shape:

- Plite core owns path/point/range semantics and character-position iteration.
- `plite-dom` owns DOM-to-Plite point import, mounted text bounds, and fail-closed
  DOM coverage policy.
- `plite-react` owns browser event import, selection reconciliation, focus, and
  native-selection repair.
- The table example extension owns table-cell authoring policy like
  Backspace/Delete/Enter containment.
- A real multi-cell table selection model is not raw Plite core. It belongs in a
  table feature package or Plate-style extension after an explicit model/API
  decision.

The next Ralph pass should harden exact table boundary proof and clean the table
example DX, not create a broad table engine.

Score: `0.88`.

Confidence: high for the boundary decision, medium for #4658 exact closure until
Ralph proves the repro in-browser.

## Intent

Turn the table selection/arrow-navigation family into a precise execution lane:
prove the exact browser behavior we can honestly claim, keep non-claims honest,
and prevent future table regressions without smuggling product-table behavior
into raw Plite.

## In Scope

- `/examples/tables` browser proof.
- Existing table example extension policy for Backspace/Delete/Enter.
- Character navigation across nested table-cell text blocks.
- DOM point import/export at table boundaries.
- Issue accounting for #6034, #4658, #5355, and adjacent #2558.
- Focused Playwright, unit, and stress coverage in `Plate repo root`.

## Non Goals

- No raw Plite multi-cell selection API.
- No table map/grid package in raw Plite.
- No generic support claim for arbitrary app-rendered `colgroup`, `col`,
  `rowspan`, Web Components, or unregistered structural DOM.
- No `Fixes #4658`, `Fixes #5355`, or `Fixes #2558` without exact matching
  browser proof.

## Evidence Read

- `docs/plite-issues/gitcrawl-live-open-ledger.md`: #6034, #5355, #4658 are
  live open singleton rows.
- `docs/plite-issues/gitcrawl-v2-sync-ledger.md`: #6034 is `fixes-claimed`;
  #4658 is `cluster-synced`; #5355 is `issue-reviewed`; #2558 is
  `cluster-synced`.
- `docs/plite/ledgers/issue-coverage-matrix.md`: #6034 is a current fixed
  issue claim; #4658 and #2558 are related/not-claimed table pressure; #5355 is
  not claimed.
- `docs/plite/ledgers/fork-issue-dossier.md`: #6034 has exact ArrowDown
  proof; #4658 is table boundary / invalid DOM import policy; #5355 depends on
  missing editable descendants in `colgroup` / `col`; #2558 needs a real table
  selection model.
- `apps/www/src/app/(app)/examples/plite/_examples/tables.tsx`: current example has local
  `table()` extension transforms that keep Backspace/Delete/Enter inside cell
  boundaries.
- `apps/www/tests/plite-browser/donor/examples/tables.test.ts`: current proof
  covers Backspace/Delete/Enter containment, #6034 ArrowDown table-last-node,
  triple-click cell selection, drag from table toward trailing text, and
  horizontal cell boundary navigation with render-budget checks.
- `apps/www/tests/plite-browser/donor/stress/generated-editing.test.ts`: stress case
  covers `table-cell-boundary-navigation`.
- Prior solution notes:
  - table helper paths must derive table/cell paths from resolved entries, not
    raw leaf slices.
  - table arrow movement must own keydown before native movement would
    paint the wrong selection first.
  - Firefox table multi-range proof must use native mouse selection, not
    scripted `Selection.addRange`.
  - character navigation must group by nearest text-block owner, not top-level
    table node.

## Issue Accounting

| Issue | Current classification | Plan decision |
| --- | --- | --- |
| #6034 | `Fixes` | Keep as fixed. Do not broaden. Existing exact proof: remove trailing paragraph, make table last node, ArrowDown at final cell, type, text stays in final cell. |
| #4658 | Related / cluster-synced | Target for Ralph repro. Promote only if exact custom-table/outside-table typing repro is proven fixed with browser and DOM selection evidence. Otherwise keep related. |
| #5355 | Not claimed / issue-reviewed | Keep not claimed unless Ralph creates a registered Plite-owned DOM coverage boundary fixture for `colgroup` / `col` and proves arrowing into/out of it does not crash. Raw app omissions stay unsupported. |
| #2558 | Not claimed | Keep not claimed. Multi-cell table selection needs an explicit table selection model and is not part of raw Plite DOM bridge closure. |
| #5551 | Not claimed | Keep not claimed. Firefox `rowspan` / native table range behavior belongs to the future table-selection-model lane. |

## Architecture Decision

### Keep

- Core position iteration as the fix point for horizontal character movement
  between nested table-cell text blocks.
- DOM point clamping/fail-closed behavior in `plite-dom`.
- React event/selection repair in `plite-react`.
- Example-local `table()` extension transforms for table-cell authoring policy.

### Cut

- A raw Plite table selection model in this lane.
- App-local “just render a table and hope DOM import works” as a supported
  closure target.
- Ledger promotion based on similar behavior. Table issues require exact
  reproduction because table DOM quirks lie easily.

### Clean Up

- The table example copy currently says it does not add arrow-key functionality,
  while current tests prove arrow-boundary behavior. Ralph should rewrite the
  example text so the example teaches the current contract instead of stale
  caveats.
- If the same cell-boundary lookup is duplicated across transforms/tests, Ralph
  may extract a tiny internal example helper. Do not add a public table API.

## Ralph Execution Plan

1. Inspect current `Plate repo root` table source/tests first:
   - `site/examples/ts/tables.tsx`
   - `playwright/integration/examples/tables.test.ts`
   - `playwright/stress/generated-editing.test.ts`
   - `packages/plite/src/editor/positions.ts`
   - `packages/plite-dom/test/bridge.ts`
2. Run the current focused table proof before editing:
   - `cd Plate repo root && PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium --workers=1`
3. Add missing exact rows only if they fail before fix or cover a real gap:
   - #4658: attempt to place/type text outside a table boundary and prove Plite
     either ignores/fails closed or lands in a valid model point.
   - #5355: only add a fixture if using a supported Plite-owned boundary for
     `colgroup` / `col`; otherwise document not-claimed and skip source churn.
   - Firefox table multi-range: use native drag/mouse path if #2558/#5551 is
     explored. Scripted `addRange` is not valid proof.
4. Keep the current #6034 fixed claim unchanged unless the proof breaks.
5. Sync ledgers only for exact changes:
   - `docs/plite-issues/gitcrawl-v2-sync-ledger.md`
   - `docs/plite/ledgers/fork-issue-dossier.md`
   - `docs/plite/ledgers/issue-coverage-matrix.md`
   - `docs/plite/references/pr-description.md`
   - `docs/plite-issues/gitcrawl-recluster-map.md`
6. Do not touch broad table API docs unless an implementation change creates a
   new accepted public contract.

## Required Coverage

Minimum same-slice proof for Ralph:

- Focused current table Playwright proof:
  `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium --workers=1`
- Existing table stress row remains green or is updated with stronger exact
  behavior:
  `bunx playwright test playwright/stress/generated-editing.test.ts --project=chromium --grep "table-cell-boundary-navigation"`
- Unit coverage if touching core positions or DOM bridge:
  `bun test packages/plite/test packages/plite-dom/test`
- Browser engines:
  - Chromium is required for #6034/#4658 desktop proof.
  - Firefox is required before any Firefox multi-range/table-selection claim.
  - WebKit is required only if the changed browser behavior is not Chromium-only.
- Final local gates in `Plate repo root`:
  - `bun lint:fix`
  - `bun typecheck:root`

## Claim Bar

A table issue can be promoted only when all are true:

1. The repro matches the upstream issue shape.
2. The browser action is native enough to exercise real selection behavior.
3. Plite model selection and DOM selection are both asserted.
4. Follow-up typing or deletion proves the editor remains usable.
5. The issue row, coverage matrix, fork dossier, and PR reference use the same
   claim wording.

Anything less stays related or not claimed.

## Pass State

| Pass | Status | Notes |
| --- | --- | --- |
| Skill boundary | complete | Planning-only. No `Plate repo root` implementation edits from this pass. |
| Cache-first issue accounting | complete | Read live ledger, sync ledger, coverage matrix, fork dossier, recluster map, PR reference. |
| Prior solution review | complete | Table helper, keydown ownership, Firefox multi-range, and position-boundary notes applied. |
| Current source/test inspection | complete | Read table example, focused tests, stress row, DOM bridge evidence. |
| Architecture verdict | complete | Keep architecture; harden exact table proof; no raw table selection model. |
| Ralph handoff | complete | Execution plan and proof commands listed above. |
| Ralph execution | complete | Updated the table example copy to match the actual contract and made the ArrowDown test derive the trailing paragraph length from the rendered example. |
| Focused table proof | complete | Fresh static server on `http://localhost:3111`: Chromium table suite `10 passed`; stress table-cell-boundary-navigation `1 passed`. |
| Final gates | complete | `bun build:next`, `bun lint:fix`, and `bun typecheck:root` passed in `Plate repo root`. |
| Lane status | complete | #6034 stays fixed; #4658 stays related; #5355 and #2558 stay not claimed. No ledger claim changes were made. |

## Closeout Result

Ralph closed this lane without broad architecture changes.

The exact current evidence keeps #4658 related/not-claimed because the upstream
custom-table outside-table repro is stronger than the generic table boundary
proof. #5355 remains not claimed because raw app-rendered `colgroup` / `col`
nodes with omitted editable descendants are still outside the supported DOM
coverage boundary. #2558 remains not claimed because multi-cell table selection
needs an explicit table-selection model.
