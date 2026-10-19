---
review_scopes: [table, clipboard]
review_basis:
  - 2026-09-17-table-host-delivery-benchmark-closure
  - 2026-09-13-clipboard-transfer-convergence
work_kind: implementation
---

# Table edge-paste regression

Status: Complete

Objective: Make rectangular table paste preserve a usable table at right and
bottom edges. Expansion must preserve the complete source slice, update table
width metadata with the canonical column-insertion policy, and select the
complete pasted rectangle.

## Acceptance and scope

- Preserve the accepted table law: a closed table slice pasted at one cell
  starts there and grows the table when `expandOnPaste` is enabled.
- Preserve in-bounds paste, rich cell content, spans, exact target selection,
  atomic rejection when expansion is disabled, and the recent canonical table
  selection host projection.
- Match the standard Google Docs result for a 2x2 paste at the bottom-right
  edge: add the needed row and column, keep every pasted cell usable, and select
  the resulting 2x2 rectangle.
- Publish the complete paste as one history action. One undo restores the exact
  prior visible document and table dimensions; one redo restores the complete
  paste.
- Repair the Plate table mutation/paste owner. Do not add a renderer workaround,
  clipboard format, public API, compatibility path, or feature dependency.
- Verify the actual `/blocks/playground` native copy/paste path and retain a
  screenshot proof because the reported failure is visible geometry.

## Reporter evidence and failed-fix state

Failure kind: `reporter-contradiction`. The earlier table-paste verification is
revoked for edge geometry until the exact route passes.

Base acceptance remains: rectangular copy preserves complete cell content;
in-bounds paste replaces the intended rectangle; the resulting selection and
table highlight match the pasted cells; no runtime errors occur.

Reporter delta: paste works when the destination has room but is broken at the
right/bottom edge. On `/blocks/playground`, copying the first 2x2 cells and
pasting at the former right edge grows the model to four columns while the
rendered `<colgroup>` remains at three content columns. The fourth column
collapses to a few pixels and wraps `Plate (Free & OSS)` vertically.

Second reporter delta: after the geometry repair, Cmd/Ctrl+Z could not undo the
native edge paste. The earlier completion report removed undo from acceptance
as "outside the reported paste behavior." That was incorrect: a paste that
cannot be undone is still a broken paste, and the real authored playground is
the required route.

Frozen-byte comparison: Google Docs with a 4x4 table, source values `A B / C D`,
and the same paste at the bottom-right cell grows to 5x5, renders a usable new
column and row, preserves `A B / C D`, and selects that complete rectangle.

Failed-fix resume state: `exact-route-reproduction: red`; first divergence is
the table-width metadata/render projection after the structural paste commit.
The native/model/view selection itself remains coherent, so the failed-native
selection trace is not applicable.

Second resume state: `authored-history-replay: red`; the undo command reaches
the model-owned history batch, then authored inverse mapping blocks before any
document change. The divergence is below keyboard and focus routing.

## Cases and proof

| Case | Setup and action | Expected | Proof owner | State |
| --- | --- | --- | --- | --- |
| `table-paste-in-bounds` | Copy a 2x2 cell rectangle; paste at a cell with 2x2 room | Replace exactly 2x2, no table growth, select pasted cells | Existing package and browser clipboard cases | Passed |
| `table-paste-right-edge-widths` | Table has explicit column widths; paste a 2x2 rectangle starting in the final column | Add one logical column, resize widths by the same law as explicit column insertion, render one `<col>` per logical column, preserve content and selection | Package RED plus `/blocks/playground` native browser row | Passed |
| `table-paste-bottom-edge` | Paste a 2x2 rectangle starting in the final row with horizontal room | Add one row, preserve existing widths and complete source | Package test | Passed |
| `table-paste-bottom-right` | Paste a 2x2 rectangle at the final cell | Add row and column atomically, preserve complete source, widths and selection | Package test plus native browser row | Passed |
| `table-paste-history` | Perform the bottom-right paste in an authored markup view, undo once, then redo once | Publish one undo batch; undo restores the exact prior visible document and table shape; redo restores the complete paste | Plite authored contract, Plate package test and native browser row | Passed |
| `table-paste-overflow-disabled` | Same overflow with `expandOnPaste: false` | Reject atomically; content, widths and selection unchanged | Existing package test | Passed |

Applicable oracles:

- Model, after action: logical rows/columns, cell content, `columnWidths`, and
  pasted selection all match; partial paste and stale width metadata are
  forbidden.
- DOM/native, after action: one rendered `<col>` per logical content column,
  every new cell has practical width, native paste reaches the semantic table
  command, and exactly the pasted rectangle is highlighted; collapsed/vertical
  text caused by a missing `<col>` is forbidden.
- Geometry/paint, after action: inspect a fresh `/blocks/playground` screenshot
  from the real copy/click/paste interaction.
- Runtime errors: no page errors, console errors, or table mutation diagnostic.
- History and follow-up input: one undo restores the exact prior visible
  document, rows, cells and rendered columns; one redo restores the complete
  paste as one batch; subsequent typing works in an expanded pasted cell.
- Focus, popup, pointer-feedback and subscription lifecycle are N/A: the report
  concerns committed table geometry after native paste, with no disputed focus,
  popup, held-pointer, or subscription behavior.

## Diagnosis and repair boundary

The planner correctly creates the missing cells and selection. The first escape
was that edge growth rebuilt row children directly while canonical
`insertColumn` also updates `columnWidths`. The paste planner now reuses the
canonical column-size law and emits the table metadata mutation in the same
transaction.

The undo failure had a different owner. An accepted edit made through an
authored markup view starts in projected coordinates and maps into accepted
coordinates. Publication mapped every original transaction step, then discarded
those boundaries and captured the composed accepted change as one structural
step. The forward edit remained valid, but its inverse conflicted with its own
retained structural contributions. Accepted publication must preserve the
mapped steps and append only a canonical representation correction when one is
required.

Product scope covers the internal table mutation/paste owner and the Plite
authored publication owner reached by the real playground. Proof scope covers
the authored history contract, table package tests and
`apps/www/tests/browser/table-selection.spec.ts`. No public API, copied UI,
registry schema, generated output, release, commit, or publication work is
required.

## Completion gates

- [x] Add a package RED that fails on stale `columnWidths` during right-edge
      expansion and keeps bottom-only/in-bounds behavior explicit.
- [x] Reuse one canonical column-width function; no paste-specific renderer
      compensation.
- [x] Pass focused table package tests and lint/format checks; run the relevant
      typechecks and record the unrelated dirty-checkout blocker exactly.
- [x] Extend the existing native clipboard browser journey for right/bottom
      edge growth, rendered column count/geometry, complete content, selection
      and follow-up typing.
- [x] Reproduce the blocked undo below Plate, preserve mapped authored step
      boundaries, and prove one exact undo and redo without weakening authored
      conflict protection.
- [x] Run the native case retry-free on a fresh source-built host and inspect a
      final screenshot.
- [x] Replay the existing table selection paint cases affected by the table
      transaction/selection owner.
- [x] Review the final implementation for ownership and complexity; record
      Autoreview as N/A on `next`.
- [x] Update the applicable changeset, reconcile table/clipboard feature history,
      and finish this plan with exact proof and remaining limits.

## Final result and proof

The paste planner now grows `columnWidths` in the same transaction as the row
and cell structure. It reuses `resizeTableColumnSizes`, the internal policy used
by explicit column insertion, and receives the table plugin's configured
`defaultTableWidth` and `minColumnWidth`. There is no renderer compensation or
new public API.

Accepted edits published from an authored markup view now retain the mapped
transaction steps that produced their accepted-coordinate change. History still
stores one batch for the paste, while authored replay can invert each structural
step in order. The failed table-planner and conflict-bypass experiments were
removed.

Implementation review accepted the owner and complexity. The table model owns
its logical column count and width metadata; the paste planner is the first
owner that knows structural expansion is required. Reusing the mutation helper
keeps insertion and paste on one sizing policy. The added loop is required for
arbitrary source widths, has no observer/cache/lifetime cost, and the browser
proof observes the original geometry failure rather than the helper alone.

Proof on the final source:

- The focused package test failed red with `[20, 30]` instead of
  `[20, 30, 30]`, then passed after the repair.
- `bun test ./packages/platejs/src/features/table/lib/BaseTablePlugin.clipboard.slow.tsx`:
  22 passed.
- `bun test ./packages/platejs/src/features/table/lib/internal/paste.spec.ts`:
  22 passed.
- `pnpm --filter plitejs test:partition:authored`: 404 passed, including the
  new generic compound structural edit from a markup view and the existing
  dependent-contribution conflict guards.
- `pnpm --filter platejs test:partition:table`: 204 passed, including exact
  authored edge-paste undo and redo.
- `pnpm --filter platejs lint:partition:table`: passed after formatting the
  affected adapter line.
- `pnpm --filter plitejs typecheck:partition:authored` and
  `pnpm --filter platejs typecheck:partition:table` currently stop on the same
  unrelated dirty-checkout error in `packages/plitejs/src/authored/anchors.ts`:
  an optional `RangeAnchorAssociation` is passed to a required association
  parameter. Direct Oxlint and format checks for every file changed by this
  repair pass.
- The exact native Chromium case passed retry-free on a fresh managed source
  host. It asserted one added history batch, 9 rows, 36 cells, 5 rendered
  `<col>` elements including the control column, complete 2x2 content, four
  selected cells, widths of at least 48px and four model widths. One undo
  restored the exact prior visible document, 8 rows, 24 cells and 4 rendered
  columns; one redo restored the exact post-paste document and history depth.
- The complete Chromium table-selection spec passed all 8 cases retry-free.
  Its fake-green scan found helper returns only, with no skip or project gate.
- The retained screenshot visibly shows the complete bottom-right 2x2 paste,
  four usable content columns and the four selected cells.

The earlier decision to remove the failing undo assertion was wrong. It turned
a reporter contradiction into a fake green by narrowing acceptance after the
failure. The corrected journey waits for mouse-up conversion to the exact four
model paths before copying, then treats paste, undo and redo as one inseparable
behavior. The complete Chromium table-selection spec passes all 8 cases
retry-free on a fresh managed source host.

Google Docs remains the behavioral reference: pasting a 2x2 rectangle at the
bottom-right edge expands both dimensions, retains all four values, keeps the
new column usable and selects the pasted rectangle. Plate now matches that
result. Autoreview is N/A on `next`. No commit or publication was performed.
