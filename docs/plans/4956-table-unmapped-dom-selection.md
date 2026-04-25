# 4956 Table Unmapped DOM Selection

## Goal

Fix table/editor clicks on unmapped contentEditable regions so typing or paste cannot desync DOM from Slate or crash `toSlateRange`.

## Source

- GitHub issue: https://github.com/udecode/plate/issues/4956
- Discussion: https://github.com/udecode/plate/discussions/4952
- Type: bug
- Browser surface: yes, `/docs/table`

## Acceptance

- Clicking editor padding/unmapped regions with table content does not leave a stale invalid interaction path.
- Targeted regression coverage proves the selection recovery contract.
- Browser check proves `/docs/table` no longer throws in the reported flow.

## Plan

- [x] Fetch issue, discussion, comments, and prior local learnings.
- [x] Classify scope and release requirement.
- [x] Add failing regression coverage for unmapped table click handling.
- [x] Implement the highest-leverage fix.
- [x] Run package verification and lint.
- [x] Run browser verification on `/docs/table`.
- [x] Create changeset.
- [x] Run PR gate.
- [ ] Create PR and issue comment.

## Findings

- The issue is real table/browser behavior: root/padding/gap clicks can leave `editor.selection` stale, then typing or rich paste can hit an unmapped DOM point.
- Discussion says suppressing `toSlateRange` alone is insufficient because native text can still render outside the Slate value.
- Prior learning: DOM selection stack traces can hide ownership bugs; here the linked discussion and current table normalizer point to missing mapped targets around tables plus a root-click guard.
- `docs/solutions/patterns/critical-patterns.md` does not exist in this checkout.
- Published package code is likely changing under `packages/`; a changeset is required.
- Forcing paragraphs around tables is too broad: it shifts path-targeted table operations. The fix guards unmapped root clicks by selecting the closest editable child point.

## Progress

- Loaded `task`, `planning-with-files`, `tdd`, `learnings-researcher`, and `dev-browser`.
- Created branch `codex/4956-table-unmapped-dom-selection` from current `main`.
- Red: `bun test packages/table/src/lib/withNormalizeTable.spec.tsx packages/table/src/react/onMouseDownTable.spec.tsx` failed on missing `onMouseDownTable`.
- Full table suite exposed adjacent-table normalization as path-breaking; removed that approach.
- Green: `bun test packages/table/src` passed.
- Package gate passed: `pnpm install`, `pnpm turbo build --filter=./packages/table`, `pnpm turbo typecheck --filter=./packages/table`, `pnpm lint:fix`.
- Browser gate passed on `http://localhost:3000/docs/table`: root click target was `data-slate-node="value"`, selection moved to a Slate text node, typed text stayed in the table, and no console/page errors fired. Screenshot: `/Users/zbeyens/.dev-browser/tmp/plate-4956-table-unmapped-click-fixed.png`.
- PR gate passed: `pnpm check`.
- Compounded the reusable learning in `docs/solutions/ui-bugs/2026-04-25-table-root-clicks-must-recover-selection.md`.
