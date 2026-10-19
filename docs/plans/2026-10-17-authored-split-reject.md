# Keep a title-level suggestion rejectable after Enter splits the title

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/GnEaZTMzrLtZLpk8CMppRs
Playbook: bug-fix

## Brief

### What will change?

Rejecting a suggested title change works again after Enter splits that title, in Details and in any editor whose first block must be a title. The fix sits in your checkout, waiting for your commit.

### What could go wrong?

The browser check could only play one person, and that case already worked. Tests cover the case that broke, where one person rejects another's change. A document saved since October 15 with the broken note still won't take the reject.

## Teach

Plite's review mode keeps each pending change on the block it touched. When Bob changes a title's level from 2 to 3, the title stores level 3 and a note saying Bob changed it from 2. Rejecting Bob's change writes 2 back.

Enter splits a block in two, and the second half copies the first half's notes. Since the Details title fix, Enter in a title makes the second half a paragraph, because only one title fits there. A paragraph has no level, yet it still copied Bob's level note. Rejecting then puts level 2 on a paragraph, the document check refuses it, and nothing changes.

Now the split itself says which properties the second half keeps, and the notes follow that answer. The paragraph gets no level note, so rejecting fixes the title and leaves the paragraph alone.

## Main changes

- `RootRecorder` asks `keepsOnSplit` once for each split tail that holds format tags, passing the source, the tail as the split wrote it and the recorder's draft root. A key's tags stay on the tail together, or all drop when the tail would not hold that key with its current value or with any tag's `before`.
- The editor schema's new internal `elementSplitKeepsAt` answers that question. It applies the source's split lifecycle and the values the tail's slot fixes, and, when placement retyped the tail, the type change rule with the destination's descriptor. Its per-key rules are the ones `elementPropertiesForSplitAt` and `elementForTypeChangeAt` now share, so splitting, retyping and recording read one copy of each rule.
- The `true` stand-in for an absent value is gone, and so is the draft `children` parameter of `elementPropertiesForSplitAt` and `getElementTargetOptionsAt`, which only the recorder passed.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the fix goes | Plite's recorder follows what the split kept | Stop Details from turning the second half into a paragraph | details only | big |
| A property the split drops on a retyped half | The half loses the pending note too, so rejecting leaves it as the split made it | Keep the note, so rejecting gives the half the old value | keep note | small |
| An old value the second half's type refuses | The half keeps its current value when the change is rejected | Refuse the reject, as today | refuse reject | small |
| A value the second half's slot fixes | The slot's value stays when the change is rejected (look) | Count only blocks the reader sees when finding that slot | shown blocks | small |
| Documents already saved with the broken note | Leave them, since only unreleased builds wrote one | Repair the note when such a document loads | repair on load | small |
| Release note | None, since the broken reject never shipped | Add a line to the unreleased title note | add note | detail |
| An editor taking over another author's pending change | Leave it to its own task | Fix it here too | fold in | detail |
| Design runners | Take the shape all three proposed, with no extra judge | Run a judge seat to pick | judge | detail |
| Plan page | A page of its own for this one fix | An iteration on the authored review page | authored page | detail |
| Page link | The old page, https://claude.ai/artifact/HhEtk1Giuc5tuMRREy7KRp, no longer opens, so the close went to a new page, https://claude.ai/artifact/GnEaZTMzrLtZLpk8CMppRs | Drop the new page if the old one was deleted on purpose | drop page | detail |

## Steps

- [x] Reproduce on Plate Details and on a plain Plite editor. Proof: `probe/repro-base-a1.log` and `probe/repro-variants-base-a1.log` show reject returning invalid on the Details title in both modes; `probe/plite-base-a4.log` shows the same on a Plite root that requires a title first, plus the wrong value written when the property drops on a type change.
- [x] Find the cause. Proof: `explore/answer.md` traces the split's retype through `getElementSplitProperties` and the recorder's inheritance through `keepsOnSplit`; `probe/plite-base-a4.log` shows a same-type split, a kept property and a direct type change all decide correctly.
- [x] Pick the design with `architect`. Proof: `architect/synthesis.md`, beside each runner's answer.
- [x] Write the regression tests and see them fail at base. Proof: `red-base-a2.log`, four of the five cases fail on a base worktree and the removal case passes there as its guard; `mutant-before-a1.log` and `mutant-fixed-a1.log` each fail only the case written for that line.
- [x] Fix the recorder and pass the tests. Proof: `fix-control-a1.log` on base plus the fix, and `plite-typecheck-a2.log`.
- [x] Replay the Details and Plite probes on the fix. Proof: `probe/repro-variants-fix-a1.log` and `probe/plite-fix-a1.log`, every reject applied with the decided values the cases expect.
- [x] Writing passes and lint. Proof: the `writing` row in the decision log, `comment-sicko/diff.patch` and `lint-task-a1.log`.
- [x] Rerun the record tests, the plitejs authored and core partitions, the typecheck and the Plate details, authored and suggestion partitions on the final bytes. Proof: `green-a3.log`, `plite-authored-a6.log`, `plite-typecheck-a3.log`, `plite-typecheck-tests-a2.log`, `plite-core-a2.log`, `plate-details-a2.log`, `plate-authored-a2.log`, `plate-suggestion-a2.log`, and the controls `red-base-a3.log`, `fix-control-a2.log`, `mutant-before-a2.log` and `mutant-fixed-a3.log`.
- [x] Hand drive a Details title reject in the browser. Proof: `hand-drive-check-a1.log` and `drive/after-reject.jpg`.
- [x] Land the patch in the plate-2 checkout. Proof: `docs/plans/artifacts/chips/t_2ecdc940.patch` applied after a clean `git apply --check`.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Hand drive | `hand-drive-check-a1.log`: `/blocks/editor-ai` covered at desktop width on the final bytes. The drive inserted a Details block, made its title Heading 3, switched to Suggestion, suggested Heading 2, expanded the block, pressed Enter after "Ti" and rejected the card. Read back: the tail paragraph carried only the split suggestion (`drive/split-card.jpg`), and after the reject the title read "Title" at Heading 3 with no suggestion marks and no console errors (`drive/after-reject.jpg`). |

## Verification

- Four of the five new record tests fail at the base commit, and the fifth guards a removal that must keep working. All five pass on the fix, and removing either new check fails only the test written for it.
- On the final code, the plitejs typecheck, its authored and core test partitions and the Plate details, authored and suggestion partitions pass, and Plate and Plite probes apply every reject with the expected document.
- A hand drive on the playground split a Details title in Suggestion mode and rejected the card. The playground has one user, so the case that broke, where one person rejects another's change, rests on the tests and probes instead.

## Close

Deviations come first.

- The hand drive could only run the one-author flow. The playground has one fixed user, so its card rejects Alice's level change and her split together. That flow already worked at the base commit (`probe/group-reject-base-a1.log`), so the drive shows the page works on the new code but does not tell base from fix. The two-author reject that broke rests on the five record tests and `probe/repro-variants-fix-a1.log`.
- The comment review renamed three names, reworded three doc comments and merged the two type-change helpers into `typeChangeKeep`. It also flagged the branch that asks about a key alone when its value is absent; that branch stays, because without it a key the split drops would keep its notes when both values are absent. The controls reran on the final code. `mutant-fixed-a2.log` ran after lint moved its target line, matched nothing and does not count; `mutant-fixed-a3.log` replaces it.
- The plitejs authored partition timed out in three runs on tests with a five-second limit, a different set each time, while other sessions held the load average between 64 and 108. `plite-authored-a6.log` passed every test on the final code. The base commit timed out the same storage test at a load of 60 (`plite-authored-base-a1.log`), and the work tests that timed out first passed 26 of 26 at base and on the fix at a load of 5 to 9.

What landed: `docs/plans/artifacts/chips/t_2ecdc940.patch`, applied to the plate-2 checkout and left uncommitted for the owner. Plite's review recorder now asks the editor schema, once per split, which properties the second half keeps, and drops the pending notes of every property it does not keep. The record test file holds the five new cases.

Proof, from each log row's scope:

- Red at base: `red-base-a3.log`, on a detached worktree at 51f3a53b66 with the new test file.
- The fix on base: `fix-control-a2.log`; each mutant fails only its own case: `mutant-before-a2.log` and `mutant-fixed-a3.log`.
- Final code: `green-a3.log`, `plite-authored-a6.log`, `plite-core-a2.log`, `plite-typecheck-a3.log`, `plite-typecheck-tests-a2.log`, `plate-details-a2.log`, `plate-authored-a2.log`, `plate-suggestion-a2.log` and `lint-task-a1.log`.
- Probes: `probe/repro-variants-fix-a1.log` and `probe/plite-fix-a1.log` apply every reject in both modes with the expected values.
- Browser: `hand-drive-check-a1.log`, `drive/split-card.jpg` and `drive/after-reject.jpg`, with the limit above.

Counts: all 10 steps are done.

Skipped gates: no decision-trail review, because the owner was in this one session, no panel ran and no shared script changed. No panel, because the change touches no public API. No reflect, because the bug-fix playbook ran and nobody corrected the workflow. No changeset, because the broken reject came from an unreleased change.

Open work:

- Whether Editing takes over another author's pending format stays with its own task, t_80279835, owner: its card session, decide-whether-editing-t, stop: that task lands or is dropped.
