# Slate v2 Table Horizontal Navigation Offset

## Status

Done.

## Goal

Fix `/examples/tables` so moving right from the end of the first table cell
lands at offset `0` in the second cell, not offset `1`.

## Scope

- Code repo: `/Users/zbeyens/git/slate-v2`.
- Plan repo: `/Users/zbeyens/git/plate-2`.
- Primary route: `/examples/tables`.
- Primary behavior: horizontal keyboard navigation across table cell boundaries
  must preserve cell-boundary affinity.

## Findings

- User report: focus first cell, press ArrowRight, caret moves to the second
  cell at offset `1` instead of offset `0`.
- Existing table browser coverage only guards Backspace, Delete, and Enter
  inside table cells.
- Existing relevant memory: browser-visible Slate regressions need
  `dev-browser --connect http://127.0.0.1:9222` proof because Playwright alone
  can miss real browser selection behavior.
- Existing solution docs indicate selection regressions often require checking
  both model selection and DOM selection, especially at rendered text/cell
  boundaries.
- Confirmed real-browser repro: click first `td`, press `ArrowRight`, model
  and DOM selection both moved to `[1, 0, 1, 0]@1`.
- Root cause: `Editor.positions(..., { unit: "character" })` grouped text
  segments by top-level path. A table therefore became one flattened text
  stream, so the iterator skipped the start of the next cell.
- Fix: group position segments by the nearest non-inline element with inline
  text content, matching text-block boundaries inside nested structures.
- Added core coverage for `Editor.after(..., { unit: "character" })` across
  nested table-cell text blocks.
- Added Playwright coverage for the `/examples/tables` ArrowRight path.

## Plan

1. Reproduce in `dev-browser` on `/examples/tables`.
2. Add a focused Playwright regression for ArrowRight cell-boundary movement.
3. Trace whether the bad offset comes from browser DOM selection import,
   model-owned movement, or table example rendering.
4. Fix the shared owner, not the example, if the bug lives in core/react.
5. Verify focused Playwright, `dev-browser`, typecheck, lint, and completion.

## Verification

- `bun test ./packages/slate/test/query-contract.ts -t "nested text-block boundaries"` passed before/after the focused fix cycle.
- `bun test ./packages/slate/test/query-contract.ts` passed: 72 tests.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/tables.test.ts --project=chromium --workers=1 --retries=0` passed: 5 tests.
- `bun --filter slate typecheck` passed.
- `bun typecheck:root` passed.
- `bun lint:fix` passed.
- `dev-browser --connect http://127.0.0.1:9222` real-browser proof passed:
  after clicking the first cell and pressing `ArrowRight`, model selection and
  DOM selection were both at `[1, 0, 1, 0]@0`.
