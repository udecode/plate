# Yjs history and split fix plan

## Goal

Fix:

1. Offline `split_node` plus online concurrent insert rebases insert to document start.
2. Offline split-at-end plus typed paragraph leaves stale empty paragraph after one undo.
3. Rapid example Undo/Redo buttons leave remote editor DOM heights inconsistent and FEFF artifacts visible in text.

## Constraints

- TDD first: add failing behavior tests before code changes.
- Prefer package/core tests for collaboration semantics and Playwright only for DOM/example regressions.
- Touched published package likely needs a changeset.

## Phases

1. Add red tests. Done.
2. Fix operation/Yjs encoding or history bridging at the owning seam. Done.
3. Fix example/history button DOM repair path if needed. Done.
4. Run targeted package tests, targeted Playwright, typecheck, lint. Done.
5. Add changeset and final browser proof. Done.

## Findings

- Prior solution says button history must route through user history, but current button path misses keyboard DOM repair behavior.
- Prior solution says remote import/history repair must run before React history availability subscribers read stale state.
- Current repro shows local model convergence can be right while remote DOM keeps FEFF/line-break artifacts.
- `splitYjsTextAtLeafIndex` must delete only the tail from the original `Y.XmlText`; full delete/reinsert breaks Yjs item identity and repositions concurrent inserts.
- `slate-history` needs to merge word typing that starts in the paragraph created by the immediately previous `insertBreak` batch; otherwise one undo leaves the split-created paragraph behind.
- Cross-`Y.XmlText` merge cleanup must delete empty merged leaves; otherwise remote peers accumulate empty leaves that inflate paragraph height after redo.

## Verification

- `bun test ./packages/slate-yjs/test`
- `bun test ./packages/slate-history/test --path-ignore-patterns ""`
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/yjs-collaboration.test.ts --project=chromium --grep "offline split|rapid history button replay|offline Backspace merge|offline move|offline block removal" --reporter=list`
- `bun --filter slate-history typecheck`
- `bun --filter @slate/yjs typecheck`
- `bun typecheck:site`
- `bun typecheck:root`
- `bun lint:fix`
- `dev-browser --connect http://127.0.0.1:9222` manual replay of the rapid button scenario: all peers height 117, paragraph heights 22/22/22/22.
- Captured learning in `docs/solutions/logic-errors/yjs-split-history-empty-leaf-reconnect-2026-05-26.md`.
