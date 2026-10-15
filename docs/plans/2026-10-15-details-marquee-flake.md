# Fix the flaky playground Details marquee

Status: executed, applied to your checkout, waiting on your commit
Page: https://claude.ai/artifact/CU8PZrEAJNwczcgZFyBU5f
Playbook: bug-fix

## Brief

### What will change?

The editor no longer jumps the page back when you scroll right after typing. That jump is the likely reason the playground Details test grabbed the wrong row about once in ten busy runs. The fix is applied to your checkout, not committed.

### What could go wrong?

Firefox wasn't tested, because it wouldn't start here. If Firefox scrolls to the cursor a moment after the editor moves it, nothing undoes that now. In a small test, Chrome and WebKit didn't scroll at all.

## Teach

When Plite redraws text, it puts the browser's selection back where Plite thinks it is. Moving the selection must not move the page. So Plite saves the scroll position first, moves the selection, then puts the scroll back.

It used to put the scroll back three times: right away, a moment later, and on the next frame. Any scroll in between got thrown away. On a busy machine the next frame can come almost half a second later. The Details test scrolls a row to the middle and measures it. In the failing run the page sat about 92 px back, right where it was before that scroll. So the drag hit the title row.

Now Plite puts the scroll back once, right after it moves the selection. Nothing else can run in between, so it only undoes its own jump.

## Main changes

- `syncEditableDOMSelectionToEditor` restores scroll offsets once, right around its selection write, through `preserveScrollAround(element, write)`. The microtask and animation-frame restores are gone, so a scroll made after the write stays.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix goes | Fix the editor so it stops undoing scrolls | Make the test wait two frames before it measures | fix test only | big |
| Saving scroll around the selection move | Keep saving it and putting it back right away | Stop saving scroll at all | drop restore | small |
| The flaky test | Leave it unchanged | Add waits to it | spec waits | detail |
| Firefox | Trust a hand-started Firefox CI run (look) | Test Firefox on another machine first | firefox first | small |
| Guard tests before the fix | Run them only with the fix | Also run them without the fix | guard base | detail |

## Steps

- [x] Reproduce the snap-back on the playground. Proof: `zzprobe-base-a2.log`, a 92 px scroll made after a text commit reads 2495 again three frames later, 3 of 3 runs.
- [x] Find what scrolls the page. Proof: `zzprobe-spec-timeline-a1.log`, every keystroke saves offset 2495 and the test's centering moves 2495 to 2587, so a late restore lands where the failing screenshot sits, about 92 px back. A code search found no other writer of an earlier scroll value. No instrumented run caught a real failure, so this link is inferred.
- [x] Write the regression test first and see it fail at base. Proof: `unit-base-red-a1.log`, `expected 100 to be 192` in a fresh base worktree.
- [x] Fix the restore and pass the test. Proof: `unit-green-a2.log`, 40 of 40.
- [x] Writing passes and lint. Proof: deslop twice, no-comments in `comment-sicko/reply.md`, and `lint-task-a1.log` with no bytes changed.
- [x] Five warm runs of the Details selection spec, a 20-run repeat of its playground case, and the scroll guard specs, on the final bytes. Proof: `final-spec-run1-a1.log` to `final-spec-run6-a1.log`, `final-playground-x20-a1.log`, the four `final-guard-*-a1.log` www logs and `final-guard-richtext-scroll-a2.log`; the huge-document drag case is red without the fix too, per `huge-reverse-base-a3.log`.
- [x] Hand drive the playground and the Details demo. Proof: `hand-drive-check-a1.log`.
- [x] Land the patch in the checkout. Proof: `docs/plans/artifacts/chips/task_6e5aaf23.patch`, applied after a clean `git apply --check`.
- [x] Decision-trail review. Proof: `trail/review.md`.

## Verification

- The Details selection spec passed both cases in 6 of 6 warm runs, and its playground case passed 20 of 20, on the worktree's dev server serving source. The machine load read 230 to 330 earlier in the run; nobody measured it during these runs. The flake ran about 1 in 10 before, so 26 clean playground runs make a return unlikely but do not rule it out.
- The new contract case fails at base with `expected 100 to be 192` and passes with the fix, with all 40 cases of its file green.
- Scroll guards pass on the fix: selection edge scroll 13 of 13, arrow-key node scrolling, Find scrolling, footnote navigation and 4 richtext scroll cases. The huge-document downward drag autoscroll case fails the same way with and without the fix, and at next itself 2 runs in 3.
- The hand drive ran at desktop width in light on the playground and the Details demo. The marquee picked exactly the dragged body row, and a wheel scroll right after typing held.
- The plitejs react typecheck passes, and the React test config reports no error in the contract file. Two other test files fail to typecheck, a Yjs one and `create-editor-options.test.tsx`, with the same errors without the fix.
- Every spec and app run used Chromium. A probe of two collapsed selection writes in a plain contenteditable showed neither Chromium nor WebKit scrolls. Firefox never launched on this machine.

## Close

Deviations first:

- The scroll guard specs got no run before the fix. The one guard that failed, the huge-document downward drag case, then got its own base control and fails the same way there, so the missing baseline changes no guard result.
- The first fix restored scroll through a returned function with a comment warning against deferring it. The no-comments review asked for a shape that cannot defer, so `preserveScrollAround` takes the write instead, and every proof above ran on that final shape.
- The in-app browser pane ran hidden at 2 frames a second, so the hand drive shows the pages and the marquee but cannot prove anything about frames. The Playwright runs prove the frame timing.
- Three writes came before the ledger listed their paths: the contract test, and two throwaway probe specs under `apps/www/tests/browser` that the run deleted before the patch. All three stayed in this session's own worktree. A hand-over note also went to the shared side-session notes folder, outside the repository.

The patch holds the fix in `selection-controller.ts`, its contract case, a `plitejs` patch changeset, this plan and its decision log. It is applied to the plate-2 checkout's working tree for the owner to commit.

All 8 steps are done.

### Attention

reviewed by gpt-6.1-sol @xhigh, no critical findings.

- warning: the plan called the restore the proven cause of the original flake. It is the demonstrated defect, and the link to the flake is inferred from the 92 px match. Corrected in the brief, Teach and steps.
- warning: "no other code writes an earlier scroll value back" went past a bounded code search. Corrected to what the search found.
- warning: "Chromium and WebKit never scroll on that write" went past a two-case probe. Corrected to the probe's scope.
- warning: the Firefox risk is a scroll after the editor's same-moment restore, not any scroll. Corrected in the brief and Open work.
- warning: "the task files typecheck" was unproven for the contract test. The React test config then ran and reports no error in it.
- warning: the late ledger row missed the two probe specs, and "changed no one else's plan" had no check behind it. Corrected in the deviation above.
- nits: the load during the final runs was never measured, "every browser run used Chromium" skipped the WebKit probe, and the status and landing box lagged. All three corrected.

## Open work

- Check that Firefox does not scroll to the caret a moment after the editor rewrites its selection. owner: the owner, who dispatches plite-ci by hand, the only way its Firefox browser shards run. stop: a dispatched plite-ci run passes its Firefox shards on a commit that holds this fix. Tracked here and in this task's ledger rows.
