# Hand drive: count a page only once it rendered after the edit settled

Status: executed
Topic: correct
Playbook: feature

The decision-trail review of `docs/plans/2026-10-13-verify-hand-drive.md` found that a page loaded right after an edit can run the old code while its visit names the new code. This iteration replaces how `check` decides a visit is fresh. It serves the owner's ask: "dont we need to double check with browser yourself ??"

## Brief

### What will change?

To serve your ask that the agent double-checks in a real browser, a page counts only if the server rendered it 5 s after the last edit. Review found that pages rendered sooner ran old code.

### What could go wrong?

The rule checks when the server rendered a page, not which code it ran. Review found a page's render time could be swapped for a later one, so until the stamp plan lands only errors count.

## Teach

The hand drive records each page visit, and the check counts only a visit from after the last edit. Until now the server read the changed files from disk when it rendered a page and tagged the visit with what it read.

That tag can be wrong. The dev server notices an edit up to 150 ms after it, and up to 500 ms on an overloaded machine. A page requested in that gap runs the old code under a tag naming the new code. Review measured that in up to 12 of 20 loads.

Now the server notes the time it rendered each page, and the check compares that with when each file behind the page was last edited. A render 5 s later counts. Probes found that such renders ran the new code, but the check doesn't prove it. A sooner one doesn't count, so the agent reloads.

## Main changes

- `check` counts a visit as fresh for a cell when its page rendered at least 5,000 ms after the last write to every file of the cell. A file's last write is its mtime, read when `check` runs, or, for a deleted file that a `route` record maps, that record's time. `POST /api/dev/drive` refuses a `rendered` later than its own receipt time and records a visit without one. Every time the rule compares comes from the server's clock, which also stamps file mtimes. This is an age guard. Probes measured that a page rendered that late ran the written bytes; `check` does not check it. A visit without `rendered` is never fresh. A visit that reports an error and arrived after the last write counts, fresh or not, so a page whose server render failed shows as `error` and an earlier clean visit cannot hide it. The beacon posts no `rendered` until `docs/plans/2026-10-14-hand-drive-stamp.md` writes it into the page's HTML. Diff round 4 removed the stamp the layout handed the beacon, because in a hidden pane a refresh that arrived before the beacon first mounted replaced that stamp with its own.
- In drive mode the layout runs a `beforeInteractive` script, `driveErrorsScript`, that collects the page's errors for the life of the document: window errors, unhandled rejections and every `console.error` call. It files each under `location.pathname` when it happens, once per path and message, and tells the beacon. The beacon posts its own path's errors at once, adds the error status the server answered the document with on the path it loaded, and starts the collector itself in a document whose server render failed, which never runs the script. A visit carries the first 20 errors, each cut to 300 characters, because `sendBeacon` refuses a body over 64 KiB. Posting errors without a mounted beacon, and counting only directly loaded pages, belong to `docs/plans/2026-10-14-hand-drive-stamp.md`.
- The served-tree record is gone: `recordServedTree`, the `trees` directory, the tree id the layout passed to the beacon and the git calls on the render path. `driveDirectory` moves to `apps/www/src/lib/drive-directory.ts` and runs its one `git rev-parse` once per server process, and the visit writer creates the drive directory before its first append.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When a page counts as checked after an edit | Once the server rendered it at least 5 s after the last edit to its files; that it then ran the new code is measured, not checked (look) | Serve each batch of edits from its own sealed copy of the code on its own dev server, as two reviewers proposed | snapshots | big |
| A page rendered within 5 s of an edit | It doesn't count, so the agent waits and reloads once | Count it, and trust the tag the server wrote | trust tag | small |
| Which console errors count | Every one the page logs, as Next's issue badge counts them, React's warnings included | Only those that pass an error object, which missed a hydration mismatch | error objects only | detail |
| A page error that arrives without a render time | It marks the page as failing when it arrives after the last edit, and a clean one never counts | Refuse such a visit, which let an earlier clean visit hide a failed server render | refuse unstamped | detail |
| A forward jump of the machine's clock right after an edit | Left as a stated limit: the last 11 hours of clock changes held no jump of a second or more (look) | Refuse visits after any detected clock jump until the drive server restarts | clock guard | detail |

## Steps

- [x] 1. Measure the gap the rule must cover: rewrite a component file and a docs page on the `www-drive` server, then load the page 0 to 2,000 ms later, with every core busy. Proof: no render at 1,000 ms or later ran older bytes than the server's record named, in `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/trail-race-window-stress-a2.log` and `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/trail-race-mdx-stress-a1.log`.
  With every core busy and a load average of 60 to 93, a component file ran older bytes only at 0 ms, and a docs page at 0, 250 and 500 ms (1 of 20 at 500 ms); none did at 1,000 or 2,000 ms. Plan panel round 1 added a real-browser load of a client component with each delay measured: 0 of 160 hydrated pages showed older bytes at any delay, 0 ms included, in `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/trail-race-client-stress-a1.log`. It never caught an old page, so it cannot show it would have, and it adds no support for the margin. Plan panel round 3 read the server's render time on each stale render: the latest rendered 1,066 ms after the write, under a load average of 93, in `docs/plans/artifacts/2026-10-13-verify-hand-drive/logs/trail-race-render-time-stress-a1.log`.
- [x] 2. Replace freshness: delete `recordServedTree` and the trees reader, move `driveDirectory` to `apps/www/src/lib/drive-directory.ts`, make the layout pass its render time to the beacon and the beacon post it as `rendered`, make `POST /api/dev/drive` create the drive directory and refuse a `rendered` later than its receipt time, and make `check` judge `rendered` against each cell file's last write plus `SETTLE_MS`, taking a mapped deleted file's route record time. The stale detail says how long after the edit the page rendered and to reload. Proof: `node --test tooling/scripts/hand-drive.test.mjs` passes, a route spec posts into a drive directory that did not exist and posts a `rendered` from the future, and each new rule's test fails on its mutant through `mutate.mjs`: a render inside the settle time, a fallback to the receipt time for a visit without `rendered`, a mapped deleted page covered only once its route record plus the settle time has passed, the directory creation, and the refusal of a future `rendered`.
  The node suite's 33 tests and the route and beacon specs pass, in `docs/plans/artifacts/2026-10-14-hand-drive-freshness/logs/build-hand-drive-test-a1.log` and `build-www-specs-a1.log`. All seven mutants fail their test on the frozen build, in `build-mutate-a2.log`. They are the five above, a deleted file never counted as fresh, and the beacon's panel observer rerun on the final spec bytes. Next 16 reports a bare `Date.now()` in a render under Cache Components, so the layout's stamp component awaits `io()` first.
- [x] 3. Update `references/hand-drive.md`, verify's Hand drive section and the `CODING_STANDARDS.md` row to the age rule and what it does not prove. Its limits name the paths no probe measured (package source, CSS, JSON demo values, a new route file, a burst of writes), a copy that keeps an old mtime, a forward or backward jump of the machine's clock, and a deleted file recreated and deleted again after its route record. Any write to a cell file, one that restores its earlier bytes included, reopens the cell. They also state that a load cell takes a frame or webdriver visit. Proof: `pnpm run prepare` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` pass.
  Both pass, in `docs/plans/artifacts/2026-10-14-hand-drive-freshness/logs/docs-prepare-a9.log` and `docs-sync-check-a9.log`, rerun on the final reference, and the generated `.agents/skills/verify/references/hand-drive.md` matches its source. The reference also says a page keeps its render time across a link to another page, so the agent reloads it.
- [x] 4. Drive it live in the built-in browser on the `www-drive` server restarted on the new bytes, with a demo edited while the server was down: that page shows the edited demo in a screenshot, a page loaded within 5 s of an edit to its demo is stale in `check`, the same page reloaded after 5 s is covered, and the hand drive gate on this iteration's www files passes with each screenshot read. Then rerun the component and docs race probes, reading the layout's `rendered` stamp, with every core busy. Proof: `check` logs for each case and both probe logs under `docs/plans/artifacts/2026-10-14-hand-drive-freshness/logs/`, the probes showing no stale render stamped 5,000 ms or more after its write.
  The page edited while the server was down was covered after the restart (`live-check-after-restart-a1.log`). A load 188 ms after an edit was stale (`live-check-within-5s-a2.log`), and the reload after 5 s was covered (`live-check-after-reload-a1.log`). With a load average of 54 to 90, the latest old render was stamped 231 ms after its write on the component file and 400 ms on the docs page (`stamp-probe-component-stress-a1.log`, `-a2.log`, `stamp-probe-docs-stress-a1.log`). The gate drove 25 cells after the lint fix and printed hand drive done (`hand-drive-gate-a1.log`). Its first `/docs/lint` load threw a Next error that the visit log missed, which step 6 fixes. Diff round 4 then showed that a refresh before the beacon's first mount in a hidden pane gave a page loaded 359 ms after its write a fresh stamp and a covered cell (`diff-panel/round-4/logs/stamp-race-before-a1.log`), so this gate's covered cells no longer count. The Hand drive completion gate runs again after the stamp plan lands.
- [x] 5. Attribute the www typecheck error: run `tsc --noEmit` for `apps/www` in one `proof-worktree.mjs` worktree at unchanged `HEAD` and in another at `HEAD` with this run's www files copied in. Proof: both logs under `docs/plans/artifacts/2026-10-14-hand-drive-freshness/logs/` list the same diagnostics.
  Both list the same diagnostics, in `tsc-www-head-a1.log` and `tsc-www-candidate-a1.log`.
- [x] 6. Keep the errors a page throws before its beacon mounts. The gate's first `/docs/lint` load threw "Router action dispatched before initialization" from Next's HMR client before hydration; the Next badge showed it and the visit posted no error. In drive mode the layout adds a `beforeInteractive` script that keeps window errors, unhandled rejections and errors logged through `console.error` from the moment Next's client starts. The script records the path the document loaded, and the beacon takes the kept errors only while the page is still on it, so a Strict Mode remount takes them again and a move to another path drops them. An error now posts at once, so a link within 300 ms no longer cancels it. Proof: beacon specs fail on their mutants through `mutate.mjs`: an error before mount under Strict Mode, an error just before unmount, the early errors dropped after a move to another path, and a move before the beacon mounts. A live load of a page that throws before hydration then shows that error in its visit and in `check`.
  The beacon spec's 10 tests pass, and 9 mutants each fail their own test on frozen `0594f96`, in `docs/plans/artifacts/2026-10-14-hand-drive-freshness/logs/early-mutate-a2.log`. A scratch page whose client module reported an error while it hydrated gave an `error` cell with that error, and `/docs/lint` on the same bytes posted none (`early-error-check-a4.log`). Opus's architect runner found that a path claimed at the beacon's first mount would hand the old page's errors to a page moved to first, so the script records the loaded path instead. Diff round 4 found that the loaded path dropped the errors of a page reached by a client move, and that keeping only `console.error` calls with an error object missed React's string warnings. The script now files each error under the path current when it happens, keeps every `console.error`, and is the one collector the beacon reads. The beacon spec's 14 tests pass, and 9 mutants across the beacon, route and `check` tests each fail their own test on frozen `b084c8e` (`diff-panel/round-4/mutate/mutate/`). Diff round 5 found that a very long error or many errors made a visit too large for `sendBeacon`, so a visit now carries at most 20 errors of 300 characters, and that an error stored for a page whose render throws never posts, which moved to the stamp plan. Diff round 6, the last under the cap, found that `sendBeacon`'s limit counts every body still in flight, so a page's error visit can be refused while another page's posts are in flight and is never sent again. The stamp plan, which now owns posting, sent a refused body again until its diff round 2 reverted the resend, so a refused visit is now lost, as the reference's Limits say.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Plan panel | yes | A panel on this plan, since the pick is one no runner proposed | three rounds, `docs/plans/artifacts/2026-10-14-hand-drive-freshness/plan-panel`, `plan-panel-2` and `plan-panel-3`, the last at the cap |
| Writing passes | yes | `deslop` and `no-comments` on code; `unslop` on docs and this plan | the `writing` rows in `docs/plans/2026-10-14-hand-drive-freshness.decisions.tsv`, one set per round of fixes; the comment passes in `docs/plans/artifacts/2026-10-14-hand-drive-freshness/diff-panel/round-4/verdict.md` and `round-5/comment-sicko.md` |
| Diff panel | yes | A panel on the diff, since it changes a shared check | six rounds, the last three in `docs/plans/artifacts/2026-10-14-hand-drive-freshness/diff-panel/round-4` to `round-6`, at the cap; round 6's critical moved to the stamp plan's step 1 |
| Hand drive | yes | `node tooling/scripts/hand-drive.mjs check` on this iteration's www files, through `proof.mjs`, after the stamp plan's render time lands | 18 cells covered, `docs/plans/artifacts/2026-10-14-hand-drive-stamp/close/hand-drive-check-a1.log`, run on the files of both iterations and the lint run, each screenshot read |
| Last lint fix | yes | `pnpm lint:task` on the task's code files | run with the stamp plan's, `docs/plans/artifacts/2026-10-14-hand-drive-stamp/close/last-lint-fix-a1.log` |
| Decision-trail review | yes | A codex seat reads the log against the transcript | same-family fallback, `docs/plans/artifacts/2026-10-14-hand-drive-stamp/trail/answer-opus.md`; the codex seat stopped twice on HTTP 429 |

## Close

Paths below are relative to `docs/plans/artifacts/2026-10-14-hand-drive-freshness/`.

Reversals and deviations first.

- Diff round 4 removed step 2's stamp, the render time the layout handed the beacon. In a hidden pane, a refresh that arrived before the beacon first mounted replaced it with its own later time (`diff-panel/round-4/verdict.md`). That overturned round 3's dismissal of the same critical as rare, which had rested on an inferred reading of the two loads that matched. `docs/plans/2026-10-14-hand-drive-stamp.md` now writes the time into the page's HTML.
- Step 6's `beforeInteractive` collector came out in the stamp plan. Round 5 found that its errors reached the log only through a mounted beacon, and round 6 found that Next's error page drops the layout's head scripts. The collector had already had its one replacement, so round 6's critical moved to the stamp plan as a new iteration rather than another patch. A module Next runs first on every page now reports, and errors belong to the page load instead of the address.
- Main changes still describe this iteration's own state. The stamp plan's Main changes say what replaced each part.

What landed is the age rule in `check`: a page counts once the server rendered it at least 5 s after the last write to every file of the cell. The served-tree record and its git calls on the render path are gone. The route refuses a render time later than its own clock.

Proof, each from its row's scope.

- Step 1 measured the gap with every core busy: no component render ran old bytes at 1,000 ms or later, and the docs page did once in 20 at 500 ms.
- Steps 2, 4 and 6 cite their test, mutant and live logs under `logs/`. Step 5 found the same www typecheck diagnostics at `HEAD` and with this run's files.
- The hand drive covered all 18 cells for the files of both iterations and the lint run, after the stamp plan's render time landed (`docs/plans/artifacts/2026-10-14-hand-drive-stamp/close/hand-drive-check-a1.log`).
- Three plan panel rounds and six diff panel rounds, each at its cap. Round 6's critical moved to the stamp plan.

Limits. `check` judges when a page rendered, not which code it ran. The reference's Limits name the paths no probe measured, a copy that keeps an old modification time, and a jump of the machine's clock.

The close counts 12 items, the 6 steps and the 6 gates. 12 are done, 0 partial, 0 skipped, 0 blocked and 0 open. The drift the gate found, an error thrown before the beacon mounted, closed through step 6's tests failing with each fix reverted, not a red run at the code before step 6.

## Attention

reviewed by claude-opus-5-5 @high, a same-family fallback after the codex seat hit rate limits twice.

1. Step 6's note and row 84 claimed a resend the stamp plan later reverted. Both now say a refused visit is lost.
2. Round 3's rare dismissal rested on an inferred count. The hand drive gate overturned it, and the stamp plan carried the fix.
