# Plite Phase 1 Execution

## Goal

Implement the phase-1 `@platejs/plite` upstream-pull plan with fast, dense Bun tests that cover real Plate wrapper behavior.

## Buckets

- [completed] History and type-contract coverage
- [completed] Path, Range, and Node interface coverage
- [completed] Editor query/navigation coverage
- [completed] Transform and utility gap coverage
- [completed] Verification and coverage check

## Notes

- Mirror `plite-history` behavior where cheap.
- Distill large upstream Slate fixture families into local matrices.
- Keep DOM-only coverage deferred.

## 2026-03-09 Status

- `bun test packages/plite`: pass, `395` tests
- `bun test --coverage --coverage-reporter=lcov --coverage-dir=/tmp/slate-coverage packages/plite`: pass
- Current `packages/plite/src` coverage from `lcov`: `100.00%` funcs, `96.97%` lines

## Landed In This Pass

- Added dense runtime specs for:
  - `deleteText`
  - `moveSelection`
  - `collapseSelection`
  - `insertSoftBreak`
  - `deleteBackward`
  - `deleteForward`
  - `insertNode`
  - `removeEditorMark`
  - `shouldMergeNodes`
- Added direct custom-helper coverage for:
  - `addMarks`
  - `deleteMerge`
  - `location-ref`
  - `prop`
  - `nodesRange`
  - `isEditorEnd`
  - `scrollIntoView`
- Added direct upstream-derived editor contract specs for:
  - `above`
  - `getMarks`
  - `getEditorString`
- Expanded `next`, `previous`, `history`, `with-history`, `isAt`, `match`, `mergeNodes`, and `setNodes` coverage with upstream-derived and Plate-specific cases.
- Added final custom-code cleanup coverage for:
  - `isEmpty`
  - `toggleMark`
  - `deleteMerge` inline-void boundary nudging
  - `mergeNodes` range deletion, void merging, and early returns
  - `nodes` universal and non-selectable traversal semantics
  - `isAt` default-false boundary behavior
  - `getPointBefore` invalid-location and block-start fallback behavior

## Upstream Pull-Ins Added Late In Phase 1

- `packages/plite/test/interfaces/Editor/above/*`
  - landed in `packages/plite/src/internal/editor/above.spec.tsx`
- `packages/plite/test/interfaces/Editor/marks/*`
  - landed in `packages/plite/src/internal/editor/getMarks.spec.tsx`
- `packages/plite/test/interfaces/Editor/string/*`
  - landed in `packages/plite/src/internal/editor/getEditorString.spec.tsx`
- `packages/plite/test/interfaces/Editor/next/{default,text}`
  - folded into `packages/plite/src/internal/editor/next.spec.tsx`
- `packages/plite/test/interfaces/Editor/previous/{default,text}`
  - folded into `packages/plite/src/internal/editor/previous.spec.tsx`
- `packages/plite-history/test/isHistory/*`
  - finished in `packages/plite/src/slate-history/history.spec.tsx` with direct undo/redo delegation coverage
- `packages/plite/test/interfaces/Editor/isEmpty/{block-void,inline-full}`
  - adapted into `packages/plite/src/internal/editor/isEmpty.spec.tsx`
- `packages/plite/test/transforms/mergeNodes/voids-true/block.tsx`
  - adapted into `packages/plite/src/internal/transforms/mergeNodes.spec.tsx`

## Remaining High-Value Phase-1 Gaps

- `packages/plite/src/internal/editor/isEmpty.ts`
  - still at `94.83%` lines
- `packages/plite/src/internal/editor-extension/prop.ts`
  - still at `95.24%` lines
- `packages/plite/src/internal/editor/getFragment.ts`
  - still at `96.55%` lines
- `packages/plite/src/utils/queryNode.ts`
  - still at `96.97%` lines
- DOM-only wrappers under `internal/dom-editor/*`
  - intentionally deferred for phase 1

## Learnings

- `deleteMerge` still had real custom coverage holes even though `deleteText` was already well-covered; testing the exported helper directly was worth it.
- `scrollIntoView` is easy to cover without browser tests by mocking `scroll-into-view-if-needed` and forcing `requestAnimationFrame` / `setTimeout` synchronous in Bun.
- `setNodes({ marks: true })` on a collapsed plain-text selection falls through to regular `setNodes`, so the tested behavior is block-level property application, not a no-op.
- `mergeNodes` only hits the mixed-kind throw when the match narrows the current node to the inline element itself, for example with `mode: 'highest'`.
- Runtime Plite wrapper specs typecheck cleanly only when legacy method calls are explicitly cast in tests; otherwise TypeScript surfaces them as `unknown` even though the runtime bindings are valid.
- Bun's text coverage report is noisy for targeted package runs because it still prints broad workspace totals. `lcov` is the only trustworthy number for `packages/plite/src`.
- Upstream `Editor.string` void-block behavior did not carry over as a stable local contract in this runtime. The safe local contract is direct block-path stringing plus invalid-location fallback, not the upstream void expectation.
- `location-ref`, `toggleMark`, `mergeNodes`, and `deleteMerge` were all worth another pass. They looked “good enough” in the summary table and still had easy, meaningful custom branches left on the floor.
