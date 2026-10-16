# Arrow keys enter a CodeMirror code block from the paragraphs around it

Status: executed, landed as an uncommitted patch on next, waiting on your commit
Page: https://claude.ai/artifact/Hn8xLkmwzKMAjWJo3dLKbP
Playbook: bug-fix

Suggested task `t_a5661f4b` (topic `codemirror-vertical-entry`). Run directory: `docs/plans/artifacts/2026-10-15-codemirror-vertical-entry/`. Intake base: `b1e70bb257`.

## Brief

### What will change?

Up and Down arrows now move the caret into a CodeMirror code block from the paragraph above or below it. Before, the caret stayed put. It lands at the start of the code going down and at the end going up.

### What could go wrong?

The caret doesn't keep its column when it enters CodeMirror, unlike the plain code block. Shift plus arrow still can't stretch a selection into it. Both are follow-ups.

## Teach

A CodeMirror code block is a small editor living inside the main one. Its text belongs to the main editor, but CodeMirror draws it and owns the caret while you type in it. The browser treats that inner editor as a separate box, so its own arrow-key handling never steps into it.

Arrow keys out of CodeMirror already worked, because CodeMirror catches them and hands the move back. Nothing handled going in. Left and Right worked because the main editor moves the caret itself. Up and Down were left to the browser, which stopped at the box's edge.

Now the main editor takes Down when the caret sits on a paragraph's last line and the next block is such an inner editor, and Up the same way from a first line. It puts the caret at that block's edge, and the inner editor takes focus through the same handoff Left and Right already use.

## Demo

1. Open `/blocks/code-block-codemirror-demo`. Click at the end of "10,000 lines of TypeScript." and press Down. The caret sits before `const` on the code's first line; type a letter and it lands there.
2. Click at the start of "End of huge code block." and press Up. The code scrolls to line 10,000 and the caret sits after its last character.
3. Open `/blocks/code-block-demo` and do the same around the Python block. The plain code block still crosses with its column kept, as before.

## Main changes

- Plite's caret engine now owns a plain Up or Down move into text under a `model` selection-policy boundary, which only an external text view registers. `getSelectableOwnerVerticalNavigationTarget` already claimed the move when the adjacent block was a selectable object. Its adjacent-block check now also returns a collapsed text selection at that block's edge, after the same last-visual-line test. The existing `focusSelection` handoff then gives the model selection to the view.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the caret lands | At the start or end of the code (safe) | Keep the caret's column, which needs the inner editor to report where it put the caret | keep column | small |
| Release note | None, since inner code editors are not released yet | A line in the unreleased code block note | add note | detail |

## Verification

- The new browser row fails at the intake base and passes on the fix, and the existing CodeMirror, code-block selection and block-selection specs pass.
- The hand drive covered both demo pages at 1,280 px in light.

## Close

This landed one product change in `packages/plitejs/src/react/editable/caret-engine.ts` and one browser row, `code-block: vertical arrows enter CodeMirror from the paragraphs around it`, in `apps/www/tests/browser/code-block-codemirror.spec.ts`. The CodeMirror adapter needed no change.

Proof:

- Red at the intake base: the new row fails at its ArrowDown leg, `toBeFocused` received `inactive` (`red-head-bash-a1.log`). The ArrowUp leg never ran there because the case stops at its first failure; the hand reproduction before the fix showed it stuck too.
- Green on the fix: the row passes (`green-1.log`), and on the final bytes the whole `code-block-codemirror.spec.ts`, `code-block-selection.spec.ts` and `node-selection-input.spec.ts` pass, 17 of 18 cases (`final-specs.log`). The one failure, `block-void-caret.spec.ts` at line 151, has no arrow key in it and fails the same way at the intake base in a fresh worktree (`head-block-void-a1.log`) and on three candidate runs (`block-void-candidate-reruns.log`).
- Plite contracts: `keyboard-input-strategy-contract`, `caret-engine-contract`, `object-selection`, `content-root-navigation-contract` and `external-text-contract` pass, 156 cases.
- Hand drive: `hand-drive-check.log` covers both pages; screenshots show the typed letter at line 1 and after line 10,000, and the plain code block keeping its column.
- `plitejs` typecheck: the source partitions pass; `typecheck:tests` reports 6 errors in two test files this change does not touch, a check the open task `t_54844d26` owns.
- Lint: `pnpm lint:task` on both files reports no findings.

The proof covers Chromium only. The entry does not keep the caret's column, and Shift plus Up or Down does not extend a selection into the block.

## Open work

- Done in `docs/plans/2026-10-16-external-text-vertical-column.md` (suggested task `t_58c21399`): Up and Down keep the caret's column entering and leaving the CodeMirror code block, through the view's `offsetAt({ edge, x })` query.
- Let Shift plus Up or Down extend a selection into an external text view. Tracked as suggested task `t_3608c4f4`. owner: zbeyens; stop: that task lands or is dropped.
- `block-void-caret.spec.ts` fails at the intake base: the block equation is not selected after Done. Tracked as suggested task `t_42473c32`, which owns that check. owner: zbeyens; stop: that task lands or is dropped.
