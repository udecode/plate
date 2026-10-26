# Review guardrails: count what review misses, close the land race, undo a session

Status: building: phases 1 to 3 in one run
Topic: pstack
Playbook: build

On 2026-10-26 the owner shared Addy Osmani's post on how the Claude Code team does code review and asked "anything we should steal into our potato workflow / babysit , while keeping our fast dev-no PR vision? harsh honest feedback". The reply ranked five steals and one Babysit fix. The owner answered "and which item fixed "Babysit has no carve-out for old code" ?? i agree from 1 to 5, but do plan poteto just to make sure." None of the five covered the Babysit fix, so it joins this plan as item 6. Delivery stays trunk through `land.mjs`, and no pull request is added anywhere. The Build playbook executes this plan.

The owner then said "go all 1 to 6 without break". That is the build's authority. Every phase builds in this session without a pause, phase 3 included, before ten fixes name a commit. The build starts from dotai `df91151` and plate `05eaa4d1c2`. Code delegates work in clones of dotai, because dotai's rules forbid branches and worktrees in its checkout, and the lead applies each reviewed patch to the dotai checkout on `main`.

## Brief

### What will change?

Each fix names the commit that broke things, so you can count bugs that slip through. Raced landings rerun their checks, and you get a seat scorecard, one-command session undo, a reviewer replay, and Babysit skips old code.

### What could go wrong?

Every pstack project gets the stricter fix rule at once, and agents may dodge it by naming no commit. About half of plate's code landings race and run their checks twice. Each replay run costs model time.

## Teach

Landing on next has no pull request. A session's change passes its checks, rebases onto next and pushes, and you review it afterwards. Panels of three models review the risky diffs before they land.

Today nothing links a fix to the landing that caused it, so nobody can say how often a landing ships a bug. Panel logs name who found each critical bug in free words that no script can count. And when next moves during a push, the landing script rebases and pushes without running its checks again. In a test run, two changes that each passed their checks landed together and broke the check.

Each fix will name the commit it repairs. That one line gives a count of bugs that slipped through, a target for an undo, and test cases for replaying the reviewers. The recheck stops the race, and the scorecard shows which reviewer models earn their place.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Projects that get the stricter fix rule | Every pstack project at once (look) | Only projects that turn it on in their settings | opt in | big |
| Where replay cases come from | Fixes that name a traced commit, plus pairs the lead traced by hand; nothing guessed (look) | Guess the causing commit from history now | mine history | big |
| Name of the new line | Introduced-by, naming the commit, or none | Fixes, as Linux writes it | fixes line | small |
| Which commits need it | Only fix commits | Every commit that changes code | every commit | small |
| Checks after a race with another landing | Rerun the lint fix and every check each time; about half of plate's code landings race, so they check twice (look) | Rerun only the check steps that both the landing and the incoming commits reach, which cuts the share that recheck typecheck and tests from 49% to 38% | shared steps | big |
| Who gets credit for a serious finding | Every reviewer that raised it, at any severity, by model name | Only the reviewers that called it serious | critical only | small |
| Where a session revert runs | From any worktree cut from next, through the normal checks | It makes its own worktree and installs dependencies | own worktree | small |
| A session revert and the panel before a push that deletes behavior | The revert helper can stop once the revert is staged and print the land command, so that panel reads the staged diff first (look) | Exempt a session revert from that panel | exempt reverts | small |
| How a revert lands | As one fix commit of the revert kind that names each reverted commit; the scorecard counts it in a reverts column of its own, not as a bug that slipped through | A new revert commit type | revert type | small |
| Babysit and old code | A defect the pull request introduced is fixed wherever it sits; a finding on code it neither changes nor breaks goes to open work, as Build already does | Babysit fixes every finding | fix all | small |
| Review of this plan | No panel on the plan; each tool change gets its one panel review (look) | A three-model panel on this plan first | panel | small |
| A traced commit that never landed | Refused; it must already be on next | Any commit the clone knows | any commit | detail |
| Old panel rows | The scorecard reads them best effort and prints how many it could not place | Count only rows written after the new rule | new rows only | detail |
| Replay size per run | Up to six cases, so a run fits the hour; a bigger run becomes a task | Every case on every run | every case | detail |
| Design pass | This plan's own comparison, without the three-model design contest | Run the design contest on the revert and scorecard | architect | detail |
| When phase 3 starts | Now, because you said to build all six (look) | Wait until ten fixes name a commit | wait for ten | small |
| The replay's first real run | The replay also takes pairs traced by hand, and the first run uses a few traced from recent history | Wait for fixes that carry the new line | no hand cases | small |
| Replay review copies | The commit's files in a new one-commit repository in a temp folder, with no dependency install, so a reviewer can reach neither the fix nor the main checkout | Install dependencies in each copy | install deps | detail |
| The plan page's link | The subject's page on the next branch, https://claude.ai/artifact/2hz8UXsyGd6wYpE6YsUwDj, which another session made after https://claude.ai/artifact/5NABpdSVKTYNJ57igZeY98 stopped opening; this run's own https://claude.ai/artifact/7my4Ucu6WgRJnNaegV4qTo is retired (look) | Publish no page for this subject | no page | detail |

## Main changes

- **A raced landing checks again.** When a push is refused because `next` moved, `land.mjs` rebases, reruns the lint fix and every `--check`, and records the commit only once they pass. Today it records the rebased commit as checked and pushes it. When the recheck would end past 55 minutes into the run, it exits 75 with the commit local, and a rerun checks it. A check run first drops the old record, so a failed check is never skipped.
- **Fix commits name their cause.** `land.mjs` refuses a `fix` commit without an `Introduced-by: <sha>` line for a commit already on the branch, or `Introduced-by: none`. `review.mjs` keeps that line out of the `Beyond the ask:` text it shows.
- **Panel findings name their seats.** `decisions-check.mjs` refuses a new `critical` row that does not list, in brackets, the seats from its round's `seats` row that raised it. A new `scorecard.mjs` counts findings per seat and fixes per introducing commit.
- **A session undoes in one command.** `review.mjs --revert <session>` reverts every first-parent commit a session landed, its plan and decision-log edits included, and lands the revert through `land.mjs`.
- **A seat change can be replayed.** A new `replay.mjs` runs the panel seats on commits that later needed a fix and judges which seat named the bug.
- **Babysit leaves old code alone.** Its code-quality review fixes a defect the pull request introduced wherever it sits, and sends a finding on code the pull request neither changes nor breaks to Open work, as the Build playbook does.

## Scope

In scope: the shared helpers in dotai's `skills/sync-pstack/assets/pstack/` (`land.mjs`, `review.mjs`, `decisions-check.mjs`, a new `scorecard.mjs` and a new `replay.mjs`), their rules (`rules/land.md`, `rules/panel.md`), their tests (`skills/sync-pstack/scripts/trunk.test.mjs`, `skills/sync-pstack/scripts/sync-pstack.test.mjs`), and plate's `.agents/playbooks/babysit.md` and `.agents/playbooks/bug-fix.md`. Every pstack project receives the helper changes through `sync-pstack apply`.

Out of scope: pull requests, approvals, CODEOWNERS, a merge queue service, feature flags, staged rollouts and a blocking security review. pstack's own playbooks stay unedited, as `AGENTS.md` requires.

## Decisions

The trailer names the cause, not the fix. `Introduced-by:` cannot be mistaken for GitHub's `Fixes #123` issue keyword, which plate's triage commits already use. The value is a commit the fetched branch contains, or `none` when the cause is older than the history or outside the repository, such as a dependency or the platform. Code that was broken when it landed names the commit that landed it, because that is the escape this line counts. Blame cannot fill it in. In a sample of 15 recent fixes, 13 touched lines under 14 days old, yet several mixed recent and old origins. So the agent that traced the cause writes the line, and the helper only checks it.

| Recheck after a raced rebase | Cost | What it misses |
| --- | --- | --- |
| Record the rebased commit as checked (today) | none | every semantic clash between two landings |
| Rerun only when incoming commits touch the task's files | one diff per race | clashes across files, such as a renamed export |
| Rerun the lint fix and every check each time (pick) | one more check run per race | nothing the checks cover |

The shortcut came in with the empty-GH006 retries in dotai `b64163d` on 2026-10-24, and that commit states no reason a clean rebase is safe. In the last 30 days, 80 of 536 landings on `next` came within five minutes of another session's.

Plate's real checks make races common. A full `pnpm check --affected` took 13 and 35 minutes in two logged landings. Of the 344 landings in the last 30 days whose paths reach typecheck or tests, 49% had another landing in the 13 minutes before them, and 71% in the 35 minutes before. Rerunning only the steps that both sides reach would help little, because typecheck and tests run whole on any source change. With that narrower recheck, 38% and 63% of those landings would still check twice. So the pick stays, and `land.mjs` exits 75 with the commit local when a recheck would end past 55 minutes into the run.

| Session revert runs | Needs | Picked |
| --- | --- | --- |
| In the caller's worktree cut from `origin/next` | a clean worktree, the project's `--check` values | yes |
| In a worktree it makes itself | a dependency install and the setup hook's arguments | no |
| Prints the commands only | a second manual step | no |

The scorecard is a new helper. `levels.mjs` audits model and effort, `plan-page.mjs` counts seat participation for one page, and `status.mjs` reads one file, so none of them owns cross-plan finding counts.

Replay cases come from `Introduced-by:` lines that name a commit, and from pairs the lead traced by hand and passes with `--case`. A bootstrap that guesses each origin from history would need a reproduction at each guessed origin, and only 3 of the 15 sampled origins had a plan with panel rows to compare against.

## Steps

### Phase 1. Close the land race and name each bug's cause

- [x] In dotai's `land.mjs`, move the lint fix, the checks, the dirty-tree refusal and `markChecked` into one function. Call it after the first rebase and after each rebase onto a moved branch, in place of the bare `markChecked()` in the push loop (`land.mjs:252–266`). Update the header comment (`land.mjs:31–35`) and the record sentence in `rules/land.md`. Proof: `trunk.test.mjs` gains the race from `race.sh`, in which B's check passes alone, A lands during it, and B's land then fails on the recheck with its commit local and no record. The test at `trunk.test.mjs:211–232`, which expects one check run across an internal rebase, flips to expect two. A race whose incoming commit leaves the check green lands after a second run, and a GH006 retry still reuses the record. `race.sh` against the new `land.mjs` prints "the combined check passes on next".
- [x] In `validate()` (`land.mjs:141–149`), a `fix` subject, with or without scope and `!`, needs one or more `Introduced-by: <sha>` lines whose commit the fetched branch contains, or one `Introduced-by: none`. Other types need none. The refusal names how to trace the commit (`git log -L`, blame, bisect) and when `none` fits. Proof: the invalid-message fixture at `trunk.test.mjs:419–434` gains a missing line, an empty value, an unknown sha and a sha off the branch, each refused, and a landed sha, `none` and a `feat` with no line, each accepted, plus a rerun that takes HEAD's message. Corpus: the last 30 days of plate's `fix` messages are all refused by the new validator, and no other message changes outcome.
- [x] In `review.mjs`, the `Beyond the ask:` extraction (`review.mjs:129`) stops at `Introduced-by:` as it stops at `Session:` and `Plan:`. Proof: a `trunk.test.mjs` case whose body puts `Introduced-by:` after the Beyond line shows only the Beyond text.
- [x] Dotai's `rules/land.md` states the line, its values and what `none` means. Plate's Bug fix playbook, in its "Binary-search the cause" bullet, carries the traced commit into the commit message. Proof: `check-playbooks.mjs` passes, and one `unslop` pass covers both edits.
- [x] Plate's Babysit playbook, in its code-quality bullet before "Stop at the human's line", fixes a defect the pull request introduced wherever it sits and sends a finding on code it neither changes nor breaks to Open work with its `owner:`, as `.agents/playbooks/build.md:19` does. Proof: `check-playbooks.mjs` passes.
- [x] Deliver phase 1 through `sync-pstack`'s Lesson mode: the writing passes, `node --test skills/sync-pstack/scripts/trunk.test.mjs`, `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` and `scripts/validate-skills` in dotai, one panel round on the helper diff, the smoke, the dotai push, `apply` and `verify` for each pstack project, and plate's sync landed through `land.mjs`. Proof: each project's `verify` passes and plate's land log names the commit.
- [ ] Phase 1 exit. Keep the recheck once its test passes. Keep the trailer while the scorecard's escape table shows most plate fixes naming a commit two weeks after the sync; when most say `none`, quarantine the refusal to a warning and log why. Proof: the escape table in the plan's Close.

### Phase 2. Count the seats and undo a session

- [x] In `decisions-check.mjs`, a new panel `critical` row opens with `critical [<seat>, ...]:`, each seat a model name on its round's `seats` row or `lead`. Committed rows stay exempt. `rules/panel.md`'s critical-row sentence names the form and asks for every seat that raised the issue at any severity. Proof: the accepting case at `sync-pstack.test.mjs:2688–2693` (`critical The seat writes files`) flips to refused, a row naming roster models passes, a name off the roster is refused and `lead` passes. Corpus: `decisions-check.mjs --all` over every project's logs, before and after, finds no newly failing committed row.
- [x] Add `scorecard.mjs` to dotai's assets and to `HELPER_FILES` in `sync-pstack.mjs`. It reads every decision log in the plans directory and places each critical row's reporters through its round's `seats` row, by model name, by the aliases opus, astra and sol, or by letter or number in roster order. Per model it prints the rounds sat, the criticals raised, applied, dismissed, open and other, and the applied ones it alone raised. It also prints the rows it could not place. A second table reads `Introduced-by:` lines on the branch, merged fixes included and `fix(revert)` commits in a column of their own: fixes per week, the share that name a commit, the share of `none`, the median days from landing to fix, and how many introducing commits had panel rows in their plan's log. Proof: a fixture log covers letters, a fallback row such as "opus for gpt-6-astra", which counts as opus, and a severity-qualified row. On plate it places at least the 3,054 of 3,262 rows the explorer's simple parser placed, and a hand check of 20 random rows matches its attribution.
- [x] Add `review.mjs --revert <session> [--check <command>]...`. It refuses the main checkout and a worktree with commits ahead of `origin/<branch>`, finds every first-parent commit whose body holds that exact `Session:` line whatever its review state or tier, refuses a merge commit, and reverts newest first. On a conflict it stops with the paths. Otherwise it writes `fix(revert): undo session <first 8 characters>` with a body listing each commit, `Beyond the ask: none` and one `Introduced-by:` line per commit, then runs `land.mjs` with the `--check` values. With `--stage` it stops once the revert is staged and prints that `land.mjs` command instead. Proof: in `trunk.test.mjs`, two interleaved sessions land, and reverting the first lands one commit that restores its files and keeps the second's. The message passes the new validator. A conflict stops mid-revert with nothing pushed, an unknown session and the main checkout are refused, and a failed check leaves the revert local.
- [x] Deliver phase 2 as in phase 1. Proof: each project's `verify` passes and plate's land log names the commit.
- [x] Phase 2 exit. Run `scorecard.mjs` on plate and write both tables in the Close. A seat whose solely raised and applied criticals are under 5% of the panel's goes to the owner as a models-sheet question, with its numbers. Proof: the tables in the Close.

### Phase 3. Replay the reviewers on traced bugs

This phase was to start once ten fixes named a commit. It starts now on the owner's word, as the Defaults say.

- [ ] Add `replay.mjs` to dotai's assets. It picks up to six cases, each an introducing commit and its fix, builds a review packet from the introducing commit's diff and its plan when it has one, and runs the models sheet's panel seats through `seats.mjs`. One Opus judge per case reads each seat's answer beside the fix's diff and test and records whether the seat named the defect. It also replays two commits that no fix has named after 30 days and has the judge rate each critical finding there real or not. A run fits the hour; a bigger sample becomes a suggested task with `via: time`. Proof: a fixture case with a planted obvious bug is caught, and on the first real run the judge's verdicts match a hand reading of the seat answers. Built and synced. The planted-bug fixture case passes in `p3-push-replay-a1.log`. The first real run waits on the Claude Code login, in Open work.
- [x] Dotai's panel rule says a change to the panel seats in a models sheet runs `replay.mjs` once before the next panel relies on it. Proof: the smoke for that rule loads it on a plain "switch astra to high" request. Codex's smoke did, on an export and again on this worktree after the apply. Claude Code's could not run while its CLI login is expired.
- [x] Deliver phase 3 as in phase 1. Proof: each project's `verify` passes and plate's land log names the commit.
- [ ] Phase 3 exit. Keep the replay when two seats' recall on the same cases differs by at least two of six, or it catches a seat change that loses a case. Otherwise quarantine it as a manual command. Proof: the replay table in the Close. Waits on the first real run, in Open work.

## Proof

Each step's proof is a test or command run in the repository it changes, as the `verify` skill's library-only rule asks. No step changes something a browser shows, so no step has a hand drive.

The base controls ran on plate's installed helpers, which match dotai's sources byte for byte, in scratch bare repositories. Each step's claimed failure reproduced:

| Item | Control | Result at base |
| --- | --- | --- |
| Raced landing | two sessions land, B's check sleeps while A lands | B rebases onto A and lands without rechecking, and `next` fails the combined check |
| Fix trailer | land `fix: repair c` with no line | lands |
| Beyond line | land a body with `Introduced-by:` after the Beyond line | `review.mjs` shows "Beyond the ask: none Introduced-by: 0123456789abcdef" |
| Session revert | `review.mjs --revert <session>` | exits 2 with the usage line |
| Seat names | append a `critical` row that names no seat | appended |

The decision log cites each control's log.

## Completion gates

| Gate | Phase | Evidence |
| --- | --- | --- |
| `deslop` and `no-comments` on the helper diff | 1, 2, 3 | phase 1: the writing rows of 15:47 and 16:47; phase 2: the writing rows of 17:00 and 17:58; phase 3: the writing rows of 19:58 and 20:00 |
| `unslop` on rule and playbook prose | 1, 2, 3 | phase 1: the writing row of 16:47; phase 2: the writing rows of 17:00 and 17:58; phase 3: the writing rows of 19:58 and 20:00 |
| dotai tests, `validate-skills` and `corpus` | 1, 2, 3 | phase 1: p1-trunk-final-a1.log, p1-sync-final-a1.log, corpus-p1.log and corpus-p1-apply.log; phase 2: p2-final-trunk-a1.log, p2-final-sync-a1.log, p2-corpus-a1.log and p2-all-pre-apply-a1.log; phase 3: p3-push-replay-a1.log, p3-push-trunk-a1.log, p3-push-sync-a2.log and p3-push-validate-a1.log, and no corpus, because phase 3 changes no ledger helper |
| One panel round on the helper diff | 1, 2, 3 | phase 1: p1-panel round 1; phase 2: p2-panel round 1; phase 3: p3-panel round 1 |
| Smoke of the changed rules in both runtimes | 1, 2, 3 | phase 1: Codex only, p1-smoke-new.log and p1-smoke-live-a1-a1.log; phase 2: Codex only, p2-smoke-new.log, p2-smoke-live.log and p2-resmoke-a1.log; phase 3: Codex only, p3-smoke-new-a1.log and p3-resmoke-a1.log; Claude Code is a gap while its CLI login is expired |
| dotai push, `apply` and `verify` | 1, 2, 3 | phase 1: dotai 518ec28, p1-verify.log; phase 2: dotai 1fcdb1c and 75c3325, p2-apply-a1.log, p2-verify-a1.log, p2-stage-apply-a1.log and p2-stage-verify-a1.log; phase 3: dotai 7c71268, p3-apply-a1.log and p3-verify-a1.log |
| plate land through `land.mjs` | 1, 2, 3 | phase 1: 3f920c3bfe, p1-land-a1.log; phase 2: 2865bddc03; phase 3: lands with this tick |
| Phase exit | 1, 2, 3 | 1: waits for the escape table on 2026-11-09, in Open work; 2: the scorecard tables in the Close, no seat under 5%; 3: waits for the first real replay, in Open work |
| `pstack:thermos` per slice | all | skip: the Lesson mode's helper panel reviews each diff, which the Build playbook says replaces it |
| `pstack:blast-radius`, `best-api repair`, Hand drive, playtest, `plate-docs`, benchmark | all | skip: no public Plate API, browser surface, docs page or measured path changes |
| Fold into the subject file, page and chips Close | close | pending |
| Decision-trail review | close | pending |

## Close

All three phases are built. Phases 1 and 2 have landed on next, and phase 3 lands with this tick.

- Phase 1 landed as 3f920c3bfe from dotai 518ec28. Phase 2 landed as 2865bddc03 from dotai 1fcdb1c and 75c3325, which adds `--stage` after the live smoke found that plate's push panel clashed with a revert that lands in one command. Phase 3 lands from dotai 7c71268.
- No real replay has run. Its Claude seats and its Opus judge need the claude CLI login, so the replay table and phase 3's exit wait in Open work.
- Codex smoked every changed rule on plate exports before and after each change, and again on this worktree after each apply. Claude Code's smoke could not run, because the claude CLI on this machine is logged out.

### Seats on plate, 2026-10-26

| model | rounds sat | criticals | applied | dismissed | open | other | applied, raised alone |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| gpt-6-astra | 987 | 2371 | 2141 | 98 | 132 | 0 | 378 |
| gpt-6.1-sol | 986 | 2253 | 2017 | 103 | 133 | 0 | 288 |
| opus | 1013 | 1834 | 1674 | 42 | 102 | 16 | 403 |
| fable | 3 | 3 | 3 | 0 | 0 | 0 | 0 |
| sonnet | 3 | 2 | 2 | 0 | 0 | 0 | 0 |
| lead | - | 9 | 6 | 0 | 3 | 0 | 2 |

The scorecard places 3,345 of 3,362 critical rows. The 17 it leaves out cite a stand-in by the seat it replaced, or name no seat at all. A hand check of 20 random rows matched every placement. Of the 1,069 applied criticals that one seat raised alone, Opus raised 403, Astra 378 and Sol 288. Each seat holds more than a quarter, far above the 5% bar, so no seat goes to the owner as a models-sheet question. Fable and Sonnet sat three rounds each as stand-ins.

### Escapes on next since 2026-09-07

| week | fixes | naming a commit | none | no line | median days to fix | introducing commit's plan log had a panel round | reverts |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-W37 | 7 | 0 (0%) | 0 (0%) | 7 | - | 0 of 0 | 0 |
| 2026-W38 | 17 | 0 (0%) | 0 (0%) | 17 | - | 0 of 0 | 0 |
| 2026-W39 | 10 | 0 (0%) | 0 (0%) | 10 | - | 0 of 0 | 0 |
| 2026-W40 | 2 | 0 (0%) | 0 (0%) | 2 | - | 0 of 0 | 0 |
| 2026-W41 | 19 | 0 (0%) | 0 (0%) | 19 | - | 0 of 0 | 0 |
| 2026-W42 | 51 | 0 (0%) | 0 (0%) | 51 | - | 0 of 0 | 0 |
| 2026-W43 | 105 | 0 (0%) | 0 (0%) | 105 | - | 0 of 0 | 0 |
| 2026-W44 | 8 | 0 (0%) | 0 (0%) | 8 | - | 0 of 0 | 0 |

No fix names its cause yet, because the `Introduced-by:` refusal started with phase 1 today. The table also counts fix commits that reached next through a merge. The phase 1 exit reads this table again on 2026-11-09.

## Open work

- Phase 1 exit. On 2026-11-09, two weeks after the sync, run `scorecard.mjs` on plate and read its escape table. Keep the `Introduced-by:` refusal while most fixes name a commit, and turn it into a warning, with the reason logged, when most say `none`. owner: zbeyens. stop: the escape table and the keep or warn decision written in this plan's Close.
- `refs/pstack/reviewed` is unset in this clone, so `review.mjs` shows only the last 20 commits and records no post-landing review. owner: zbeyens. stop: the owner says whether that review happens elsewhere, or starts marking sessions with `--done`.
- `review.mjs --revert` also reverts the session's own plan and decision-log edits, so the record of why the work existed leaves the tree, though history keeps it. owner: zbeyens. stop: the owner keeps that, or asks the revert to leave the plans directory alone.
- First real replay. The claude CLI on this machine has an expired login, so no Claude seat or Opus judge can run, and the Claude Code half of every smoke in this run failed. owner: zbeyens, who logs in with `claude` in a terminal. stop: the lead runs `replay.mjs` on plate with the current seats over six traced cases, checks the judge's verdicts against a hand reading, writes the table in this plan's Close, decides the phase 3 exit and reruns the Claude Code smokes of phases 1 to 3.
- Replay starts every seat at once, with no provider cap and no rerun of a failed seat (phase 3 panel warning 4). owner: zbeyens. stop: the first real replay shows a rate refusal, or the owner asks for a cap.
- A stop during replay's copy setup takes effect only after replay builds every copy, up to about 6 minutes (warning 14). owner: zbeyens. stop: a stop during setup needs to end sooner.
- A failed opus seat's error file shows only the untrusted-folder warning (warning 15). owner: zbeyens. stop: the Claude login works again and a seat failure needs its cause.
- `cross.mjs` passes each prompt as one argument, over Linux's 131,072-byte limit (warning 17). owner: zbeyens. stop: a pstack project runs panels on Linux.
- Three helpers copy `land.mjs`'s choice of remote, and `replay.mjs` and `scorecard.mjs` copy its `Introduced-by:` parser, scorecard's without the space after the colon. owner: zbeyens. stop: a copy disagrees with `land.mjs` on a real commit.
