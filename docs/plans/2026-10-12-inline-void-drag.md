# Dragging an inline void moves it

Status: executed: built and verified, waiting on your commit
Page: https://claude.ai/artifact/MfG27fWc7t2RG9TTvzsAao
Playbook: bug-fix

The owner asked to "fix Plite so dragging an inline void element moves it instead of copying it", with the tags review's evidence. In the select editor, a drop before a chip moved it, a drop after a chip did nothing, and `transfer.move` refused the chip as `lossy` or `source-missing`.

## Brief

### What will change?

Dragging a chip or mention now moves it, either direction, and one undo puts it back; before, dropping left a copy behind. Five clean runs back this up, and your earlier commit already took the browser test.

### What could go wrong?

I only tested in Chromium. Two image drag tests were already failing. When Plite tidies two spots in one paragraph at once, it loses track of positions between them; this fix just steps around that.

## Teach

An inline void is an item inside a line of text that you can't type into, like a mention or a tag chip. Plite always keeps a piece of text on each side of it, even an empty one.

When you drag selected text, Plite starts a move. On drop, it cuts the text and pastes it where you let go, as one undo step. A chip had no selection of its own to move, because its selection sits inside the chip's own empty text. So no move started, and the drop just pasted a copy.

Now dragging a chip moves the stretch between the texts on its two sides, just like a text drag. The drop also counts the chip as moved content, even with no characters, and tidies up the spot the chip left before checking where it landed. Without both, Plite thought the chip was lost and refused the move.

## Demo

1. Run the www dev server with pnpm --filter www dev and open http://localhost:3000/examples/plite/inline-void-drag. This example is hidden from the sidebar. Drag the Alpha chip onto the right edge of Beta. While you drag, a thin caret marks the drop point, as it does for text. Alpha lands between Beta and Gamma, and no copy stays behind. ![after](artifacts/2026-10-12-inline-void-drag/screens/indicator-chip-a1.png) ![after](artifacts/2026-10-12-inline-void-drag/screens/after-drop-alpha-a1.png)
2. Reload, then drag Gamma onto the left edge of Alpha. Gamma lands in front of Alpha. ![after](artifacts/2026-10-12-inline-void-drag/screens/after-drop-gamma-a1.png)
3. Press Cmd+Z, or Ctrl+Z off a Mac. The chips go back to Alpha, Beta, Gamma.

## Main changes

- An inline void's drag session covers the range from the end of the text before it to the start of the text after it. The selection written to the drag data stays the void itself, so a drop into another app still carries the chip.
- The point landing in `transfer.ts` publishes the canonical form of the source's leftovers as their own step, right after the source removal and before the landing. One canonical step over both let `reconcileChildrenStep` diff everything between them as one replace, which mapped every landed position to the replace's ends.
- The internal `measureDraftInsertion` returns `span` instead of `text`. The span counts text characters and each element inserted whole that holds no characters, and the landing reads its edges outward.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Dragging a chip inside a bigger selection | Only the chip moves, as before | The whole selection moves | drag the selection | small |
| Release note | Reword the pending drag note to cover all draggable inline items | Add a separate note | own note | detail |
| Where this page lives | Its own page | The drag and drop page | fold into dnd | detail |
| Before picture in the demo | Described in words | Rebuild the old code to take a screenshot | show before | detail |

## Steps

- [x] Reproduce on a real browser route with a draggable inline void and no duplicate rule. Proof: the hidden example's spec fails with a copy. Done: `docs/plans/artifacts/2026-10-12-inline-void-drag/red/browser-red-a2.log`.
- [x] Find the cause. Proof: transfer probes on chips beside text and beside chips. Done: `docs/plans/artifacts/2026-10-12-inline-void-drag/probes/transfer-inline-void-a2.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/probes/transfer-adjacent-chips-a1.log`.
- [x] Design the fix with `architect`, then measure each candidate in a worktree prototype. Done: `docs/plans/artifacts/2026-10-12-inline-void-drag/architect/synthesis.md`.
- [x] Build the fix with a transfer contract case and a Plite browser spec for forward and backward moves with undo. Proof: the contract case fails before the fix and the spec fails at `HEAD` without it. Done: `docs/plans/artifacts/2026-10-12-inline-void-drag/red/transfer-contract-red-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/red/browser-dragto-red-a1.log`.
- [x] Writing passes and lint. Done: `docs/plans/artifacts/2026-10-12-inline-void-drag/comment-sicko/reply-a1.md`, `docs/plans/artifacts/2026-10-12-inline-void-drag/green/lint-task-a1.log`.
- [x] Prove each part of the transfer fix and the drag in five warm runs. Done: `docs/plans/artifacts/2026-10-12-inline-void-drag/mutate/drop-source-finalize-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/green/accept-run1-a1.log` to `docs/plans/artifacts/2026-10-12-inline-void-drag/green/accept-run5-a1.log`.

## Close

Two deviations come first. The owner's commit `6fa1169c5e` swept the browser spec, the example and its registry entries into `next` before the fix, so the spec sat red on `next` on its own, against the playbook's rule that a test lands with its fix. After review, the spec drives the drag with Playwright's `dragTo` instead of stepped mouse moves, because a probe showed `dragTo` moves a chip, which refuted the comment that excused the hand-written drag. The spec then failed again at `HEAD` without the fix.

This landed uncommitted on `next`. `applyEditableDragStart` in `packages/plitejs/src/react/editable/clipboard-input-strategy.ts` gives an inline void's session the range between its neighbour texts. `runTransfer` in `packages/plitejs/src/core/transfer.ts` finalizes the representation after the source removal and reads the landed span outward. `measureDraftInsertion` in `packages/plitejs/src/core/public-state.ts` counts elements inserted whole with no characters. `packages/plitejs/test/transfer-contract.test.ts` gains "moves an inline void into the empty text between two inline voids". `.changeset/green-mentions-drag-plitejs.md` now says draggable inline voids, such as mentions, move.

The causes, both measured. A drag that starts on an inline void selects its collapsed range, and `applyEditableDragStart` begins a session only for a block key or an expanded range, so `applyEditableDrop` inserted the drag data as a copy (`docs/plans/artifacts/2026-10-12-inline-void-drag/red/browser-red-a2.log`). Given a range, `transfer.move` still refused the chip as `lossy`. The landing measured only text characters, and the slice fitter canonicalized the source's leftovers and the landing in one window that mapped every interior position to its ends (`docs/plans/artifacts/2026-10-12-inline-void-drag/architect/synthesis.md`). The copy dates from `4e16eada7d` ("dnd", 2026-10-03).

Proof, from each row's `scope:`:

- Before the fix, the contract case returns `refused` with `lossy` (`docs/plans/artifacts/2026-10-12-inline-void-drag/red/transfer-contract-red-a1.log`). At `HEAD` `6fa1169c5e` with only the new spec, both browser cases fail with an extra chip, the copy (`docs/plans/artifacts/2026-10-12-inline-void-drag/red/browser-dragto-red-a1.log`).
- Reverting any one of the four parts of the transfer fix on frozen commit `0d1554e577` fails the contract case with `lossy`, 4 of 4 caught. The parts are the early finalize, the no-character element count, the outward start and the outward end (`docs/plans/artifacts/2026-10-12-inline-void-drag/mutate/drop-source-finalize-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/mutate/skip-empty-element-measure-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/mutate/span-start-reads-inward-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/mutate/span-end-reads-inward-a1.log`).
- In a fresh worktree at `HEAD` plus the task's five files, built and served there, the browser spec passes 2 of 2 in five warm Chromium runs with no retries. Alpha dragged after Beta gives Beta, Alpha, Gamma, Gamma dragged before Alpha gives Gamma, Alpha, Beta, and one undo restores Alpha, Beta, Gamma each time (`docs/plans/artifacts/2026-10-12-inline-void-drag/green/accept-run1-a1.log` to `docs/plans/artifacts/2026-10-12-inline-void-drag/green/accept-run5-a1.log`).
- On the tags field's scale route, `/dev/select-editor-scale?items=20&chips=3` in this checkout, the DOM chip order after each of six chip drags shows the chip moved and three chips left, forward and backward, after and before a chip. The probe's model read came back empty, so this case rests on the DOM order alone (`docs/plans/artifacts/2026-10-12-inline-void-drag/reporter/drag-matrix-3297-a1.log`).
- During a chip drag, the last dragover over the editor reports a move with no block drop line, and the frame shows a text caret at the drop point (`docs/plans/artifacts/2026-10-12-inline-void-drag/probes/indicator-a4.log`). That is the dragover branch every text drag takes in `applyEditableDragOver`.
- The transfer contract passes 45 of 45, the React DnD contract 47 of 47, the plitejs typecheck 13 of 13 uncached, and the platejs transfer specs 232 tests in 9 files (`docs/plans/artifacts/2026-10-12-inline-void-drag/green/transfer-contract-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/green/react-dnd-contract-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/green/plitejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-12-inline-void-drag/green/platejs-transfer-specs-a2.log`). `lint:task` is clean on the eight task files (`docs/plans/artifacts/2026-10-12-inline-void-drag/green/lint-task-a1.log`).
- An audit of the area found two drag session owners. `startDOMDrag` serves the drag handles, and its six callers all pass block elements. `measureDraftInsertion` has one caller.

Limits. Only Chromium ran. The probe could not start a native text-selection drag, so the text side of the drop caret comparison comes from reading the shared dragover branch, not a run, as the drag and drop subject's "Native text drop caret" row already notes. The browser drag and drop set at `HEAD` plus the task's files passes 14 cases, and two image void cases fail with a runtime `ReferenceError` from `getFlatTreeParentElement` and a null DOM selection (`docs/plans/artifacts/2026-10-12-inline-void-drag/green/browser-dnd-candidate-a2.log`). Both fail the same way at bare `HEAD` in a fresh worktree, so they predate this change (`docs/plans/artifacts/2026-10-12-inline-void-drag/green/images-head-a1.log`). The full plitejs unit lane timed out two authored-tree cases under load; one passes alone, and the other also times out at `HEAD` in a worktree (`docs/plans/artifacts/2026-10-12-inline-void-drag/green/authored-timeout-head-a1.log`).

Counts: 6 steps, 6 done, 0 partial, 0 skipped, 0 blocked, 0 open.

## Open work

- When two canonical repairs in one parent run as one step, `reconcileChildrenStep` can diff the window between them as one replace, so any position between them maps to its ends. This fix keeps transfers clear of it; other anchors in such a step are not. Tracked by the suggested session "Keep positions inside Plite's coarse canonical window". owner: zbeyens. stop: the reconcile keeps interior positions, or 2026-11-30.
- Two image void drag cases in `images.test.ts` fail on `next` itself, one with a `getFlatTreeParentElement` `ReferenceError` during mouse move and one with a null DOM selection. Tracked by the suggested session "Fix ReferenceError in Plite image void drags". owner: zbeyens. stop: both cases pass at the head of `next`, or 2026-11-30.
- The tags subject's open item "Plite drops a dragged inline void as a copy" meets its stop once this change is committed, and the tags plan's chip drag Defaults row and Close line still describe the old behavior. owner: zbeyens. stop: the tags subject drops the item after the commit.
- The select editor's browser spec drags only the last chip before the first. A case that drops a chip after another would cover this fix on that route. owner: zbeyens. stop: that case lands in the select editor spec, or 2026-11-30.
