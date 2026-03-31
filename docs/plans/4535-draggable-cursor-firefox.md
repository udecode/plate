# Issue 4535: Draggable cursor shows text caret

## Goal

Fix issue `#4535` by stopping the drag handle path from creating a Slate caret / DOM point inside the draggable UI, then verify with targeted tests and package checks.

## Tracker Context

- Source: GitHub issue `#4535`
- Title: `Draggable cursor has "input cusor"`
- Task type: bug
- Browser surface: yes
- Reported browser: Firefox
- Reported error: `Cannot resolve a Slate point from DOM point: [object HTMLDivElement],1`

## Relevant Instructions

- Use learnings first for non-trivial bug work.
- Use TDD when the seam is sane.
- Verify in the same turn before closeout.

## Findings

- Existing DnD learning says fix the package seam when the drag layer owns the bug, not each caller.
- Current repro path likely runs through the official `BlockDraggable` registry UI, not a random app caller.
- The failing DOM point is an `HTMLDivElement`, which matches the nested drag-handle wrapper in `apps/www/src/registry/ui/block-draggable.tsx`.
- The durable seam is the registry draggable handle, not `useDraggable`: the package hook owns DnD refs, but the component owns the actual interactive DOM that Firefox can place a caret into.

## Plan

1. Inspect the drag-handle chain and current regression coverage.
2. Reproduce at the smallest seam with a targeted test.
3. Implement the fix at the highest-leverage ownership boundary.
4. Run targeted tests, build/typecheck, lint, and browser verification if feasible.

## Progress

- Fetched issue `#4535` and comments.
- Read repo instructions plus relevant skills.
- Read DnD learning about package-level ownership.
- Inspected `useDraggable`, `useDndNode`, and the `BlockDraggable` registry component.
- Added an app-level regression spec that failed on the old nested button shape.
- Reworked `BlockDraggable` to render a single non-editable button as the tooltip trigger and cancel browser default on `mousedown`.
- Re-ran the new regression test after the fix.

## Verification Target

- Targeted regression test for the drag-handle caret path.
- `pnpm -C apps/www typecheck`
- `pnpm lint:fix`
- Browser verification on the draggable demo if feasible.

## Verification Results

- `bun test apps/www/src/registry/ui/block-draggable.spec.tsx`
- `pnpm -C apps/www typecheck`
- `pnpm lint:fix`
- Browser verification blocked: local `http://localhost:3002/docs/dnd` hit an unrelated docs-app build error in `is-hotkey` before the DnD example rendered.
