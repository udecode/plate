# Yjs History Undo Redo Bugs

Goal: TDD-fix two confirmed Slate/Yjs history bugs.

## Bugs

1. Merge -> Split -> Undo throws `Cannot undo split_node with a non-text right-side element yet.` and does not revert.
2. Multi-paragraph keyboard input Undo/Redo loses content and can leave stale enabled history controls.

## Constraints

- Red Playwright coverage first, then implementation.
- Prefer fixing the history/Yjs ownership layer over disabling UI buttons around failures.
- Preserve Yjs identity; no snapshot fallback.
- Browser verification matters because selection/history state is user-visible.

## Progress

- [x] Loaded task/debug/tdd/testing/learnings/planning context.
- [x] Read prior split/merge/history solution docs.
- [x] Inspected current split history and demo history grouping code.
- [x] Added Playwright regressions for Merge -> Split -> Undo and empty-doc multi-paragraph redo.
- [x] Added package split history regressions for right-side redo identity and merge-followed-by-split undo.
- [x] Fixed split history replay so custom merge undo only runs when redo stack has no dependent later item.
- [x] Stopped demo history from recording empty commits as undoable groups.
- [x] Ran focused package split/adapter tests and focused Playwright regressions.
- [x] Run package typecheck and lint.
- [x] Captured reusable learning in `docs/solutions/logic-errors/yjs-split-history-dependent-redo-2026-06-01.md`.
- [ ] Reopened keyboard Redo empty-doc regression after finding button-only coverage missed the browser shortcut path.
- [x] Reproduced keyboard Redo failure in Playwright: document-level keydown sees `Ctrl+Shift+Z`, but the demo history handler is not reached after empty-doc undo.
- [x] Added package regression proving no-op `replace_fragment` must not touch Yjs redo history.
- [x] Fixed Yjs controller filtering so no-op structural replacements do not create Yjs transactions or traces.
- [x] Fixed keyboard Redo shortcut interception at the editor-surface capture boundary.
- [x] Fixed history selection normalization so a cursor at document end moves to the new document end after redo.
- [x] Verified the reopened keyboard Redo test with text, local selection, remote cursor, and disabled Redo assertions.
- [x] Ran `bun test packages/slate-yjs/test` with 104 passing tests.
- [x] Ran focused Playwright history tests with 4 passing tests.
- [x] Ran `bun --filter @slate/yjs typecheck`, `bun typecheck:site`, and `bun lint`.
- [x] Updated the existing split-history solution doc with the no-op `replace_fragment` and cursor-end findings.

## Findings

- Browser text input emits granular `insert_text`, `split_node`, and `insert_text` only when the caret is placed through the real editor surface. The earlier empty `replace_fragment` trace was a bad test setup path.
- The custom split undo path deleted the split-created right paragraph. If a later local text edit in that right paragraph had already been undone, redo still referenced the original Yjs node and became a no-op.
- Native Yjs replay preserves that right-side redo identity, but the custom split undo is still needed for the existing concurrent remote append contract. The fix gates custom undo/redo to the single split item case.
- Keyboard Redo still failed because after undoing to the empty paragraph, Slate React could consume the history shortcut before the demo's `Editable onKeyDown` ran. Collaboration history needs to intercept history hotkeys at the editor-surface capture boundary.
- Keyboard Undo can also trigger no-op `replace_fragment` repairs where `children` and `newChildren` are identical. Those operations must not reach Yjs, because even a no-op structural replace can clear redo history.
- Selection repair must distinguish text-leaf end from document end. Redo from `['a']` to `['a', 'b']` should move the cursor to `[1, 0]@1`, not keep it at `[0, 0]@1`.
