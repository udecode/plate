# PR 5156 Details and selection fixes: babysit

Status: executed: merged on 2026-10-11 through PR 5158, which GitHub counts as PR 5156's merge
Page: https://claude.ai/artifact/4PvGWMiGGL9x6C3gnZJTSt
Playbook: babysit

Babysit of [PR 5156](https://github.com/udecode/plate/pull/5156) by felixfeng33, head `a924f12144` on `sin6626:codex/fix-details-enter-collapse`, based on `next` at `666f02406e`. Maintainer edits are off, so the repairs landed through [PR 5158](https://github.com/udecode/plate/pull/5158) from `udecode:babysit/pr-5156-details-selection`. The repair worktree is `/Users/zbeyens/git/plate-2-pr5156`.

## Brief

### What will change?

The Details, block selection, context menu and equation fixes landed on `next` through PR 5158, and GitHub marked PR 5156 merged. The text selection scrolling changes move to a follow-up, because review found they break tables, scrolling editors and hidden content.

### What could go wrong?

Long keyboard text selections still stop scrolling past closed Details until the follow-up lands. The merge did not wait for GitHub CI, as you asked, and no browser case reran after the merge of `next`.

## Teach

The PR fixes seven editor problems at once. Details blocks stop collapsing while you edit suggested changes. Pressing Enter on an empty Details adds a body line. Marquee selection picks single body blocks. Arrow keys move a block selection. Context menus keep the selection. Keyboard text selection keeps scrolling. Equation popovers stay shut while you select.

Review found real breakage in two places. The arrow-key handler grabbed every Up, Down and Shift press while blocks were selected, which broke table cell selection and image captions. It now acts only on sibling blocks it can move between. The scrolling changes rewrote how the editor writes and scrolls text selections, and three reviewers found ways that breaks tables, scrolling editors and hidden content.

Details now stops forgetting open blocks when content is deleted. That cleanup caused the collapse bug, and it also made undo bring a deleted Details back closed.

## Main changes

| Change | Before | After |
| --- | --- | --- |
| Details open state | Commit pruning resolved open keys through a map of the view that opened each key | No commit pruning; an open key stays until the block is closed, so undo restores it open |
| Closing from a read-only view | The PR skipped moving the selection, leaving an editable caret in the hidden body | The writable owner editor moves its selection to the Summary end, as on `next` |
| Block arrow keys | A document capture listener consumed Up, Down and Shift for every node selection and scanned every mounted element per key | It acts only when the selected blocks are mounted siblings it can move between, leaves table cells and a single selected object to their owners, steps outward from the focus block, and scrolls the new block into view |
| Marquee hit areas | Each element queried its own subtree for `data-node-selection-target` | One pass per gesture maps each target to its element |
| Editor-behavior law | No rule for block selection arrows or an empty-body Enter | `EDIT-SEL-BLOCK-ARROW-001`, `-SHIFT-001`, `-YIELD-001` and an extended `EDIT-DETAILS-ENTER-001`, each with a tagged test |
| Plite text selection scrolling | Part of this PR | Reverted here; moved to a follow-up with the panel's findings |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Text selection scrolling changes | Move them to a follow-up and land the rest now (look) | Repair them inside this PR | keep scroll fixes | big |
| Block arrow keys | Keep them, but only for moves between sibling blocks (look) | Cut arrow-key block moves from this PR | cut arrow keys | big |
| Details cleanup of deleted blocks | Stop it, so undo brings a deleted Details back open (look) | Keep cleanup, tracked per view | prune per view | big |
| Closing Details from a read-only view | Move the editable caret out of the hidden body, as before | Leave the caret where it was | keep caret | small |
| Where the repairs go | PR 5158 on the main repository, holding PR 5156's commits, the repairs and a merge of `next`, because you asked to merge and the fork blocks maintainer edits. Approved before: a PR into the author's fork branch, so PR 5156 picks them up when merged | A PR into the author's fork branch, merged by the fork's maintainer | revert 5158 | small |

## Open work

- Review the audited allowlist entry for `BaseDetailsPlugin` in `tooling/scripts/check-plate-schema-adoption.mjs`, which landed with PR 5158. owner: zbeyens. stop: you keep or remove it on `next`. Tracked on this page.
- Keyboard text-selection scrolling past closed Details, redone without the round 1 regressions. owner: zbeyens. stop: a PR lands it or the owner drops it. Tracked in `docs/plans/topics/react.md` Open work.
- Per-view Details open state with a bounded key lifetime, which also fixes a read-only authored close hiding another authored caret. owner: zbeyens. stop: Details open state belongs to its view, or the owner drops it. Tracked in `docs/plans/topics/react.md` Open work.
- A Plate keyboard owner for block arrow keys. owner: zbeyens. stop: it lands with the selection ownership plan, or the owner drops it. Tracked in `docs/plans/topics/correct.md` Open work.

## Close

Reversal on 2026-10-11: you asked to fix the conflicts and merge, so the repairs landed through PR 5158 on the main repository instead of the approved PR into the fork branch, which needed the fork's maintainer to merge it. Merging `next` at `c01399d08b` into the repair branch conflicted only in generated output: the registry files, the registry changelog and `packages/platejs/turbo.json`, each regenerated from source. `BaseDetailsPlugin.ts` merged cleanly with `next`'s suggestion-aware summary placement. On the merge commit `9d465e0689`, the details, details-react and react-core partitions (358 tests) and the details typecheck pass (`docs/plans/artifacts/2026-10-11-pr-5156-details-selection/merge/`). No browser case and no GitHub CI ran after the merge; the merge did not wait for CI, as you asked. PR 5158 merged at `62b8d8625e`, and GitHub marked PR 5156 merged at its head `a924f12144`.

Reversals and deviations from the earlier run follow. The PR's Plite text-selection scrolling commit is reverted out of this PR, and Details no longer prunes open keys, which changes the documented cleanup to undo restoring open state. The stacked PR is pushed but not opened, because `pnpm check` fails two steps that fail the same way on `next`. The thermo-nuclear review's two critical findings are answered as dismissals for this PR: the repaired arrow handler yields to every existing owner its tests cover, and editor-global open state predates the PR. Both stay tracked as open work.

What landed is branch `babysit/pr-5156-details-selection` on `udecode/plate` at `2c1553d39f`, five commits on PR head `a924f12144`. The Details commit keeps open keys and moves a read-only close through the owning editor. The selection commit limits arrow keys to sibling candidates, yields table cells and a lone object without Shift, stops before an unmounted sibling and scrolls the new block into view. The Plite commit restores `next`. The registry commit holds generated output, and the plan commit corrects PR 5156's own plan. PR 5156 itself reads CI ✅ for the two changeset checks that ran, Review ✅ and Merge ⛔ blocked, because its CI, Registry and Plite CI workflows wait for approval.

Proof and its limits. Chromium ran 22 cases five times each with no retries, 110 passes, on the final source. Table Shift+ArrowDown and image ArrowDown fail on PR 5156 and pass on `next` and here. Unit cases for the read-only close, undo, the unmounted sibling and per-key DOM work fail on PR 5156 or with their fix removed. The per-key work count is 21 at 10 blocks and 601 at 300 on PR 5156, and the same at both sizes here. `pnpm check` passes 23 of 25 steps, and the two failures match `next`. Not run: Firefox, WebKit, a windowed editor with block selection, and GitHub CI. The four Plite findings closed by revert were checked by reading code, not reproduced at runtime. One probe found no equation popover failure on `next`, so the equation fix has only its unit test.

Review: three panel rounds with Opus, Astra and Sol. Round 1 found four critical classes, all applied. Round 2 found three; two were applied and one dismissed as present on `next`. Round 3 found none. Sol's decision-trail review flagged the deferred thermo criticals, the red-check PR, claim width and tracking homes; each is answered above or under Open work.

Counts: 26 todo items. Done: 20. Skipped: 5. The review-only path does not apply to a babysit. PR 5156 had no review threads and no bot comments, so the feedback audit and bot triage had nothing to read. `/pstack:correct` is skipped because `docs/plans/topics/correct.md` already tracks the selection-owner plan and its lint, and this run added the arrow-key item there. Reflect is skipped because you made no workflow corrections. Partial: 0. Blocked: 1, opening the stacked PR, which PR 5158 replaced. Open: 0.

### Attention

reviewed by gpt-6.1-sol @xhigh

- The thermo-nuclear criticals were first logged as deferred, which the panel rule forbids. They are now logged as dismissals for this PR, with open work.
- The merge did not wait for GitHub CI, and no browser case reran after the merge of `next`.
- Stopping pruning keeps keys of deleted open Details for the editor's life. The impact is now marked big, and the per-view item owns the bound.
- The equation fix kept only its unit test. The scrolling follow-up carries a browser check for it.
