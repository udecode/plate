# Table Arrow Navigation

## Goal

Make plain `ArrowUp` / `ArrowDown` table navigation stable.

- Remove the transient caret flash when moving across cells.
- Keep caret movement inside the current cell until it reaches the visual first or last line.

## Plan

- [completed] Trace plain table arrow handling through the shared `moveLine` path.
- [completed] Add regression coverage for synchronous cross-cell movement.
- [completed] Add coverage for multi-block, soft-break, and soft-wrap cell cases.
- [completed] Route collapsed table `ArrowUp` / `ArrowDown` through table-owned `moveLine`.
- [completed] Add a visual-line guard before cross-cell movement.
- [completed] Run focused tests, package build, typecheck, and lint.
- [completed] Evaluate reusable knowledge and record it in `solutions/`.

## Findings

- Plain `ArrowUp` / `ArrowDown` goes through the shared `moveLine` seam before browser default caret movement.
- Table navigation needs to take ownership at that seam. Repairing selection later is too late and causes visible caret flash.
- Same-cell adjacent block detection is enough for real multi-block cells.
- Wrapped single-block cells need DOM geometry, not just Slate path checks.
- `editor.api.toDOMRange(...)` plus caret/block rect comparison is enough to detect whether the caret is already on the visual first or last line.
- Missing DOM rects should fail conservatively and preserve previous non-throwing behavior.

## Progress

- Investigated `SlateReactExtensionPlugin -> withApplyTable -> overrideSelectionFromCell -> moveSelectionFromCell`.
- Added a `withTable.moveLine` override so table owns collapsed `ArrowUp` / `ArrowDown` movement before browser default caret motion.
- Refined that override so cross-cell movement only happens once the caret reaches the visual edge of the current cell.
- Added regression coverage for:
  - synchronous plain-arrow cell movement
  - multi-block cells
  - soft-break cells
  - soft-wrapped single-block cells

## Verification

- `bun test packages/table/src/lib/transforms/tableSelectionAndSizing.spec.tsx packages/table/src/lib/withApplyTable.spec.ts packages/table/src/lib/transforms/overrideSelectionFromCell.spec.tsx packages/table/src/lib/transforms/moveSelectionFromCell.spec.tsx`
- `bun test packages/table/src/lib/withTable.spec.tsx`
- `pnpm install` failed in `prepare` because `bun x skiller@latest apply` blocks on legacy Claude plugin migration.
- `pnpm install --ignore-scripts`
- `pnpm turbo build --filter=./packages/table`
- `pnpm turbo typecheck --filter=./packages/table`
- `pnpm lint:fix`
