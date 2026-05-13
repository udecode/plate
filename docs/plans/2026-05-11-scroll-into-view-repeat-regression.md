---
date: 2026-05-11
topic: scroll-into-view-repeat-regression
status: done
source: user report
---

# Scroll Into View Repeat Regression

## Report

Route: `http://localhost:3100/examples/scroll-into-view`

Steps:

1. Type at the end of the editor while scrolled away from the caret.
2. The editor autoscrolls to the caret.
3. Scroll up again.
4. Type again.

Expected: the editor autoscrolls again.

Actual: the second typed update does not autoscroll.

## Investigation

- Relevant source owner: `../slate-v2/packages/slate-react/src/components/editable.tsx`.
- `defaultScrollSelectionIntoView` temporarily assigns
  `leafEl.getBoundingClientRect` so `scroll-into-view-if-needed` measures the
  focus point.
- Current cleanup sets `leafEl.getBoundingClientRect = undefined`, which
  shadows the prototype method on the same DOM node. A later scroll attempt
  sees `typeof leafEl.getBoundingClientRect !== 'function'` and returns early.
- Related learning:
  `docs/solutions/logic-errors/2026-04-20-editable-blocks-app-owned-surfaces-must-not-churn-runtime-ids-or-miss-plain-editor-updates.md`
  says selection-to-DOM scroll forwarding needs focused contracts.

## Plan

- [x] Add a focused regression test proving the default scroll helper preserves the
  leaf element measurement function across repeated calls.
- [x] Fix cleanup to restore the previous element measurement behavior instead of
  poisoning the element.
- [x] Verify with focused slate-react tests, typecheck, lint, and Browser route
  coverage on the reported route.

## Result

- `defaultScrollSelectionIntoView` now restores the original leaf measurement
  behavior after temporary focus-point measurement.
- Added a regression test covering the poisoned leaf-element case.
- Added a `slate-react` patch changeset.

## Verification

- `bun test ./packages/slate-react/test/editable-behavior.tsx -t "default scroll restores leaf measurement"` passed after fix.
- `bunx biome check packages/slate-react/src/components/editable.tsx packages/slate-react/test/editable-behavior.tsx --fix` passed.
- `bun test ./packages/slate-react/test/editable-behavior.tsx` passed.
- `bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx ./packages/slate-react/test/editable-behavior.tsx` passed:
  37 tests, 153 expects.
- `bun --filter slate-react typecheck` passed.
- `pnpm lint:fix` in `plate-2` passed.
- `bun run completion-check` in `plate-2` passed with no session state.
- Browser was used on `http://localhost:3100/examples/scroll-into-view` to load
  the reported surface and exercise the scrollable editor. Browser coordinate
  control was not reliable enough to place the caret at the lower text endpoint;
  the exact repeated-scroll failure is covered by the focused DOM-range
  regression test.
