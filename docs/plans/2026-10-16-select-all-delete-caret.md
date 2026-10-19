# Homepage select-all caret test

Status: waiting on your commit, and on t_2ad25b93 for the WebKit run
Page: https://claude.ai/artifact/M9rGvj1e47GcAMdCe24hgu
Playbook: bug-fix

The www browser case "homepage select-all deletion stays editable" failed in every engine because one assertion expected the caret at `[0,0]` after Ctrl+A and Backspace, and the editor puts it at `[1,0]`. The editor is right. The case was written for a one-line result, and the review-tree change in `422564e6f6` kept Bob's pending deletion as its own struck line above the empty line. That commit updated the tree assertion and the caret after typing to line `[1]`, but left the caret before typing at `[0,0]`. The fix moves that assertion to `[1,0]`, where the case's next check already expects typed text.

## Brief

### What will change?

The homepage select-all test now expects the caret on the empty line under Bob's struck line, where the editor puts it. The task asked for the first line, but the editor was right, so no editor code changed.

### What could go wrong?

WebKit passes every caret check but still fails the strict error check on a known dev-server error that another task owns. If you wanted the caret in the struck line, that needs an editor change.

## Teach

On the homepage, pending suggestions stay in the document as marks, so a pending deletion shows as struck text. In Editing mode, select all and delete removes your text but keeps Bob's pending deletion, now on its own struck line, with one empty line below it.

The editor runs each command on a copy of the document with every pending change accepted, so Bob's struck line is already gone there. There the delete leaves one empty line with the caret at its start. The editor then maps the caret back into the full document, into that same empty line, which is the second line there.

The test still expected the caret on the first line, left over from before struck lines stayed. Its next check already expected typed text on the second line. Now both checks agree.

## Main changes

- `apps/www/tests/browser/suggestion.spec.ts` "homepage select-all deletion stays editable" asserts the caret at `[1,0]` after the deletion. A named `emptyLine` index carries the empty line's place into both caret checks, so neither reads as a bare path.
- The `EDIT-SEL-CUT-ALL-001` proof note in `docs/editor-behavior/markdown-editing-spec.md` cites the case at line 280 and says what it checks now: one empty live block below another author's struck line, caret at its start, block type unchecked.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the caret lands after select all and delete | On the empty line under the struck line, as today (look) | At the start of the struck line | caret on struck line | big |
| The behavior spec's note about this test | Says what the test checks now | Left as it was | keep old note | detail |
| An old line number in a research page | Left, since the test's title still finds it | Fixed to the new line | fix research line | detail |

## Close

Reversals come first. The task asked to keep the caret in the first block. The run found the editor right and the test stale, so no editor code changed, and the caret stays on the empty line under Bob's struck line. Saying "caret on struck line" reverses that call.

What landed, uncommitted in the checkout's working tree on `next`:

- `apps/www/tests/browser/suggestion.spec.ts`: the post-delete caret assertion expects `[1,0]`, through a named `emptyLine` index that the typed-caret check shares.
- `docs/editor-behavior/markdown-editing-spec.md`: the `EDIT-SEL-CUT-ALL-001` proof note cites the case at line 280 and says what it checks now.

Root cause, from the run directory's logs:

- The case dates from `bda11bb012`, when select all and delete left one empty line, so the caret sat at `[0,0]`. Commit `422564e6f6` kept Bob's pending deletion as a struck line above the empty one. The same commit updated the case's tree and its typed-caret path to `[1,0]`, but not the caret check before typing.
- At `422564e6f6` the case fails exactly as at `HEAD`, receiving `[1,0]` (`v2-control-a1.log`), so that line was never green with the two-line tree. Another session's control run found the same failure at `770482edcc`, a 2026-10-13 snapshot of `6fa1169c5e` plus the uncommitted work `422564e6f6` later committed (`docs/plans/artifacts/2026-10-16-agent-pass/770482edcc-www-chromium-a1.log`). So the stale line was written in that work before it was committed, and no bisect can find a regression.
- A Bun probe on package source reproduces the result in under a second (`probe-caret.ts`). Recorder logs show the command's caret `[0,0]` on the accepted frame, mapped through the recorded change to the written draft's new empty block `[3,0]`, then to `[1,0]` once Editing accepts the writer's own struck blocks (`probe-instrumented.out`). Plite's law in `docs/vision/plite.md` says review-tree commands decide on that accepted frame, where Bob's line is hidden, so the empty line is the frame's only line.

Proof and its limits:

- Red before the edit: Chromium expects `[0,0]` and receives `[1,0]` (`red-chromium-a1.log`, screenshot `red-chromium-a1.png`).
- The corrected assertion rejects the defect the old line encoded. A mutant that hands back the frame caret unlifted puts it at `[0,0]` inside Bob's struck line in the model probe, and the case on the final test bytes fails with that message in Chromium (`mutant-unlifted-a2.log`).
- Final bytes, warm, no retries, five repeats each, against this worktree's source on port 3539, whose product files match `HEAD`: Chromium 5 of 5 (`final-chromium-a1.log`) and Firefox 5 of 5 (`final-firefox-a1.log`).
- WebKit is partial. All 5 runs pass every tree and caret check, then fail the strict runtime-error check at line 322 on "Failed to load resource: Could not connect to the server." (`final-webkit-a1.log`). Ledger task `t_2ad25b93` tracks that dev-server error, which fails most WebKit runs of these specs, and says a WebKit dev-server run proves nothing until it lands.
- `pnpm lint:task` on the spec is partial. It reports 3 errors at lines 578, 584 and 620, outside this hunk. The same 3 fail at `HEAD` in a detached worktree (`lint-head-a1.log`), and ledger task `t_ed79a18b` owns `ci:lint`.
- A mutant that flipped the owned-acceptance caret mapping left the case green in Chromium (`mutant-owned-assoc-a1.log`), and the model probe under it still gives `[1,0]` from source (`probe-owned-assoc.out`). That mapping is not what places this caret, because the caret already sits in a block that survives the acceptance.
- No hand drive ran. `hand-drive.mjs scope` maps no page to the spec, and the other two files are Markdown.

Counts: 19 items, 13 done, 2 partial, 4 skipped, 0 blocked and 0 open. The partial items are the WebKit acceptance run and the lint check, both above. The skips are a PR, which nobody asked for, the hand drive, which no changed file needs, a panel, because no reviews-list row covers a test fix with no PR, and the decision-trail review, because this one-session card run had no panel finding and changed no shared script. The comment review's side findings, the case title and two comments outside the hunk, were dropped as out of scope.

## Open work

- This case's WebKit run against a dev server still fails the strict runtime-error check on the "Could not connect to the server" resource error. Tracked in the suggested-task ledger as `t_2ad25b93`. owner: zbeyens. stop: `t_2ad25b93` lands and this case passes 5 of 5 in WebKit, or the owner drops it.
