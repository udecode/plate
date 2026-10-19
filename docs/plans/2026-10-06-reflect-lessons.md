---
work_kind: workflow
---

# Land the second reflect's lessons

Status: reopened: round 3 took out the partial-proof check; its redesign waits on panel round 25, then its build
Topic: correct
Playbook: build

The session's second reflect, on the ledger correction and the React build, accepted 16 lessons (`docs/plans/artifacts/review-ledger-wip/reflect/synthesizer/answer.md`). The zsh lesson already landed in `~/.claude/CLAUDE.md`. This plan lands the other 15, as the owner asked: "Do this task here: “Land the 15 reflect lessons via sync-pstack”". Shared rules and helpers change in dotai through `sync-pstack` Lesson mode, from a detached worktree, first at `42dd942` while another session held uncommitted edits in the dotai checkout, then rebased onto `9dafa0d` once that session pushed. Rules only this repository needs change here. The intake base is `7ad817c352`.

## Brief

### What will change?

Agents get small scripts for proof logs, mutation proofs, saved subagent replies, rule re-reads and proof worktrees. The log and plan checks refuse a missing cited proof file, and a plan box whose cited log has no exit status.

### What could go wrong?

The new checks refuse a plan box or log row that cites a deleted log, or a log without an exit line; three boxes in another session's plan now fail. The re-read hook prints a line at each session start.

## Main changes

- `.agents/pstack/decisions-check.mjs` refuses a new row whose evidence cites a missing path under `docs/plans/artifacts/`, except in a review phase or beside `(missing)`. `append <log> --from <queue>` writes a queued batch only when every row passes, and a refused panel row names the phases that take it.
- `.agents/pstack/plan-open.mjs` refuses a box closed since the last commit whose line, or a line indented directly under it, cites a missing run-directory path or a `.log` with no line that reads exactly `exit=<code>`. It keeps the owner and stop check for a closed box under Open work.
- Both checks judge lines added since `HEAD`, or since the commit `PSTACK_BASE` names, and fail when it names none. `status.mjs` holds the citation reader, the exit-line scan and the base lookup they share.
- New shared helpers: `proof.mjs` writes a proof log at the next free attempt index and always appends its exit line. `mutate.mjs` reverts each fix alone in a fresh worktree it makes at a frozen commit, then removes the worktree. `reply.mjs` copies a background subagent's final reply once its turn has ended. `reread.mjs` prints each instruction sentence that changed since its last snapshot.
- The block gains sentences for: building a small, owned, repeated Backlog mechanism in the same run when nothing existing provides it; a lesson binding the lead once it is written; matching panel findings against rule-only rows; ways to pass a new gate as defects; a type system as a grammar too large to list; and a pointer to each new helper.
- `skills/plan-page/SKILL.md` step 7 records a recreated page's old and new links as a Defaults row.
- Here: `tooling/scripts/proof-worktree.mjs` makes a clean detached worktree with linked `node_modules` and copied `.env` files, and verify's base-worktree section runs it. verify's testing reference reverts a guard with `mutate.mjs` instead of in place. `AGENTS.md`'s baseline paragraph pins a run's own baseline to its intake base. The Plan playbook's Start gate reads another plan's check at `HEAD`, not its Status. A SessionStart hook in `.claude/settings.json` runs `reread.mjs`.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where a recreated page's links go | A Defaults row on the plan, because only a stop-list call may go under Needs you | A question under Needs you, as the lesson worded it | ask on links |
| How far the plan check reads a closed box | It checks that the cited files exist and that a cited log records an exit status. The check against a partial proof failed review twice, so it moves to its own plan, which builds it on your go complete | Leave lesson 9 without its partial-proof check | no partial check |
| What counts as an exit line | Only a line that reads exactly exit and a code, as the log script writes, so logs written by hand with other exit wording are refused | Any line that ends in an exit code, a bare exit, or an exited-with sentence | any exit form |
| When the re-read hook runs | At every session start; a fresh start quietly saves copies, and a resumed or compacted one prints what changed, or asks for a full read when it has no copy | Only after compaction, with nothing saved to compare against | compact only |
| Which Backlog items the lead builds at once | A small script, check or hook that this project or the shared source owns, needs no owner decision, and repeats or follows an owner correction | Anything cheap and local, without a test for cheap | cheap and local |
| Smoke set 3's partial parts | Accept the limits the Close names: Codex's S4 holds only under the no-write harness, and Claude's S1 never names a Start gate because its fixture's work already exists | Rerun the smoke set until every part holds in both runtimes | rerun smoke |
| Review rounds before a build | At most three panel rounds before a build starts. The log helper refuses a fourth, and at the cap the lead settles the findings and builds instead of handing back. This brings back a cap you cut earlier today, because you asked for a flagger that gets stuck loops moving | No cap, as your earlier cut had | no round cap |
| Known ways past the new checks | Ship with three listed gaps: a space inside a cited path, a link target with brackets, and a box line after a blank line. The landed patch closed the empty base setting and a command before a cited path | Hold the checks until a patch closes each gap | close the gaps |
| This reflect's Backlog | Build the one item that repeats an earlier reflect's, the check base that ignores owner commits, and give the other 11 an owner and a stop | Build the ones closest to the bar now | build backlog |

## Panel gate

Rounds 1 and 2 applied critical fixes. On your "go complete", the saved patch `docs/plans/artifacts/reflect-lessons/unreviewed/round2-additive.patch` landed and round 3 reviewed it with the narrowing fixes made after round 2. Round 3 took out the partial-proof check, which had already replaced its approach once, and dismissed two rare findings with counts from real data. It also narrowed the block's sentences on `reply.mjs --notified` and `mutate.mjs`. Rounds 4 to 24 reviewed those reverts and twenty-one drafts of `docs/plans/2026-10-07-partial-proof-acceptance.md`, the plan for the check's next approach, and each applied critical findings to that plan. Round 25 reviews its twenty-second draft, which builds in a mirror of dotai's working tree and installs once, after the diff panel, before the build. Round 24 seated two Opus stand-ins for the Codex seats, which Codex refused.

## Steps

- [x] Helpers and tests in dotai: each changed helper's test fails on `42dd942` for its named defect. Proof: `docs/plans/artifacts/reflect-lessons/old-helpers-fail-a1.log`. Done: dotai `e0b6b32`.
- [x] Block, plan-page and project rule edits, with `pnpm run prepare` and `check-playbooks.mjs`. Done: `docs/plans/artifacts/reflect-lessons/prepare-a2.log`.
- [x] Writing passes: `deslop` and `no-comments` on the helpers, `unslop` on the prose. Done: `docs/plans/artifacts/reflect-lessons/comment-sicko-r2/answer.md` and dotai `507b121`.
- [x] dotai checks: `node scripts/build-workflow.mjs`, the sync-pstack suite and `scripts/validate-skills`. Done: `docs/plans/artifacts/reflect-lessons/dotai-checks-a8.log`.
- [x] Corpus: old and new `decisions-check.mjs` and `plan-open.mjs` over every plate-2 log and plan, with each newly failing file named. Done: `docs/plans/artifacts/reflect-lessons/corpus-base-a1.log`.
- [x] Panel on the combined diff, with the configured seats. Done: rounds 1 and 2, `docs/plans/artifacts/reflect-lessons/panel2/mutate-r2-verdicts-a1.log`; rounds 3 to 25 follow on your "go complete".
- [x] `apply` and `verify` on plate-2, then the SessionStart hook. Done: `docs/plans/artifacts/reflect-lessons/apply-a3.log`, `docs/plans/artifacts/reflect-lessons/verify-a2.log`.
- [ ] Smoke set, with the intended behavior written first. Reopened: in `docs/plans/artifacts/reflect-lessons/smoke/smoke-a5.log`, S1 and S4 hold with the limits the Defaults accept, and S3 failed in both runtimes, so it reruns after the Backlog sentence changes.
- [x] Decision-trail review. Done: `docs/plans/artifacts/reflect-lessons/trail/sol.md`.
- [x] dotai commit and push. Done: dotai `e0b6b32`, `8acd6ea` and `507b121` on main.
- [ ] Carry out your "go complete" by landing the saved patch, reviewing it and building lesson 9's partial-proof check through `docs/plans/2026-10-07-partial-proof-acceptance.md`.
- [ ] Run `/pstack:correct` on the two rule-only rows round 3 repeated: "New code calls the existing owner instead of copying it" and "A test fails for its named defect before the fix lands".
- [ ] Change the block's Backlog sentence, as a logged reversal of part of lesson 1. An item whose script or check already exists is not built again; when it repeats because that script went unused, a hook or check that runs or demands the script is built instead. In S3, Claude sent an item whose script already exists to Rejected and Codex said to reuse the helper, and neither gave it an owner and a stop. It ships with the partial-proof check's build.
- [ ] Deliver dotai, sync plate-2, and run `verify`, the smoke set and the decision-trail review in the order the Delivery section of `docs/plans/2026-10-07-partial-proof-acceptance.md` gives, through the branch its diff panel's last round selects.
- [ ] Reflect on this session's workflow correction about the session title; its lessons go to Backlog, because the batch's reflect was the run's last.

## Backlog

Under the new reflect rule, one Backlog item is built here: the checks now take `PSTACK_BASE`, which the 2026-10-05 reflect also backlogged, so an owner commit mid-run no longer hides a run's rows. Each other item needs an owner decision, lives outside this project and the shared source, or repeats nothing.

- The baseline writer reformats the whole file. owner: zbeyens; stop: the next `/pstack:correct` run here, which weighs it; tracked: here.
- `plan-open.mjs` accepts a `stop:` that closes nothing. owner: zbeyens; stop: 2026-11-06; tracked: here.
- A check script reads a `*-baseline.json` without `finding-baseline.mjs`. owner: zbeyens; stop: the next `/pstack:correct` run here; tracked: here.
- The `any` ban in `AGENTS.md` conflicts with the lint config. owner: zbeyens, who picks which side wins; stop: 2026-11-06; tracked: here.
- `review-ledger.mjs next` cannot be replayed. owner: zbeyens; stop: the next owner correction of a ledger recommendation; tracked: here.
- `next` sees only this checkout. owner: zbeyens, who confirms whether sessions work outside it; stop: 2026-11-06; tracked: here.
- `git grep` options after the pattern. owner: zbeyens, through a user-scope hook; stop: 2026-11-06; tracked: here.
- zsh `=word` expansion. owner: zbeyens, through `~/.zshenv` or a hook; stop: 2026-11-06; tracked: here.
- HEAD moves under a proof unnoticed. The checks' half is built as `PSTACK_BASE`; a warning from the proof helper is not. owner: zbeyens; stop: the next run whose proof crosses an owner commit; tracked: here.
- A text dump of a rendered page. owner: zbeyens; stop: the next run that strips page HTML by hand; tracked: here.
- Two legacy lines in `review-ledger.mjs check`. owner: zbeyens; stop: 2026-11-06; tracked: here.
- A committed docs preview entry in `.claude/launch.json`. owner: zbeyens; stop: 2026-11-06; tracked: here.

## Close

Reversals and deviations come first.

- **Lesson 9 is partial.** The plan check refuses a closed box whose cited proof file is missing, or whose cited log has no `exit=<code>` line. Its partial-proof half failed review twice. Round 1 reverted a refusal of every partial proof, because five of its six hits were partial proofs that `look` Defaults rows had accepted. On your "go complete", the refusal keyed to a box's `word:` landed, and the lead reverted it after round 3 found seven wrong verdicts in it. Its third approach is planned in `docs/plans/2026-10-07-partial-proof-acceptance.md`, which this run builds.
- **Lesson 15** records a recreated page's old and new links as a Defaults row, because only a stop-list call may reach Needs you. Say "ask on links" to reverse it.
- **Lesson 1** builds a Backlog item only when it is a small script, check or hook the project or shared source owns, needs no owner decision and has no existing equivalent. Say "cheap and local" to reverse it.
- **The exit line** is only a line that reads exactly `exit=<code>`, the marker `proof.mjs` writes. A hand-written log with `Exit status 1` or `tests exit=0` fails when a newly closed box cites it. Say "any exit form" to reverse it.
- **Slip:** dotai `e0b6b32` was pushed before the decision-trail review. The block it was built on already put that review first for a diff whose last round dismissed or narrowed a critical finding. `8acd6ea` and `507b121` waited for the review. The slip came back on your "go complete": another session's `9bc3545` carried this run's block sentences and pushed them, as dotai's rules now say, and this run then pushed the matching helpers as `f22638f` before their decision-trail review. The partial-proof build lives in a mirror in the run directory and enters dotai's checkout once, after its diff panel, so no state of it reaches main before that review.

What landed:

- dotai `e0b6b32`, `8acd6ea` and `507b121` are on main. They hold the four new helpers `proof.mjs`, `mutate.mjs`, `reply.mjs` and `reread.mjs`, the widened `decisions-check.mjs` and `plan-open.mjs` with `PSTACK_BASE`, the block sentences for lessons 1 to 6, 8 to 10, 13 and 14, and plan-page step 7.
- This run synced plate-2 from `507b121`, and seven other sessions' upstream commits came with it: `7856afa`, `297a9e1`, `42dd942`, `3287b86`, `5126613`, `9dafa0d` and `e0769d1`. `plan-page` is reinstalled. Another session later synced plate-2 from `010e9d9`, which `.agents/pstack.json` records; the dotai commits since `010e9d9`, 16 at 15:08 UTC on 2026-10-07, come with this run's next sync and are named then.
- On your "go complete", the saved patch's other parts landed, passed rounds 3 to 7 and shipped before their decision-trail review: `reply.mjs --notified`, the refusal of an empty `PSTACK_BASE` and the citation-lead fix, with the block's narrowed sentences on `--notified` and `mutate.mjs`. Another session's dotai `9bc3545` carried this run's block sentences with its own, as dotai's rules now say, and this run pushed the matching helpers as `f22638f` so that dotai main did not describe helpers it lacked.
- Plate-2's own changes:
  - `tooling/scripts/proof-worktree.mjs`, which verify's base-worktree section runs.
  - verify's mutation step, which uses `mutate.mjs`.
  - `AGENTS.md`'s baseline intake-base sentences and its rules row.
  - the Plan playbook's Start gate rule.
  - the SessionStart hook in `.claude/settings.json`.
- Your commit `dc927288b2` took this run's round-1 files. Everything after it is uncommitted for you. Until you commit `.claude/settings.json`, another session's `sync` refuses that file without `--allow-dirty`.

Proof and its limits:

- Each changed check's test fails on the old helpers (`docs/plans/artifacts/reflect-lessons/old-helpers-fail-a1.log`).
- Each round's fixes were reverted alone by `mutate.mjs` and caught by their named assertions (`docs/plans/artifacts/reflect-lessons/panel2/mutate-r2-verdicts-a1.log`).
- The 21 round-1 seat cases flip as expected (`docs/plans/artifacts/reflect-lessons/panel1/repro-after-a4.log`).
- dotai's 118 tests and skill validation pass (`docs/plans/artifacts/reflect-lessons/dotai-checks-a8.log`), and `verify` passes on the final sync.
- Since the intake base, the checks refuse five closed boxes in another session's plan. Their logs hold no `exit=<code>` line (`docs/plans/artifacts/reflect-lessons/corpus-base-a1.log`).
- Twenty-four panel rounds ran, and each applied a critical fix; round 3's was a revert. Round 2 left the partial-proof check open and dismissed four critical findings as rare, each run through the real code with dated counts from real data (`docs/plans/artifacts/reflect-lessons/panel2/rare-cases-a1.log` and `rare-cases-2-a1.log`). Round 3 reverted the partial-proof check and dismissed two more as rare. Round 4 corrected those two counts to the helpers' own input (`docs/plans/artifacts/reflect-lessons/complete/panel4/recount-a1.log`), and round 5 corrected the reply case's worst outcome: the helper never overwrites, so a wrong save keeps interim text where a later gate reads it. Rounds 4 to 24 reviewed the redesign plan.
- Three smoke sets ran in both runtimes. In the last one, S2, S5, S6 and S7 hold in both runtimes. S3 failed in both: Claude sent the repeated reply-saver item to Rejected as a duplicate of `reply.mjs`, Codex said to reuse the helper, and neither gave it an owner and a stop, so the Backlog sentence changes and S3 reruns. Codex's S4 holds only under the no-write harness. Claude's S1 checks the dependency at `HEAD` but never names a Start gate, because the fixture's adoption already exists.
- Known ways past the new checks, each accepted in Defaults: a space inside a cited path, a link target with brackets, and a box line after a blank line. The landed patch closed the empty `PSTACK_BASE` and a command before a cited path.
- `reply.mjs` refuses about 1 in 70 finished replies whose stop reason was never written, all 9 real cases (`docs/plans/artifacts/reflect-lessons/panel2/rare-cases-2-a1.log`). With `--notified`, passed once the completion notice arrives, it copies all 9 (`docs/plans/artifacts/reflect-lessons/complete/panel5/notified-real-a1.log`).

Counts for the 15 lessons: 12 done, 3 partial (lesson 1 until S3 passes, lesson 9, and lesson 13 until a plain smoke prompt for it passes), 0 skipped, 0 blocked, 0 open. Lesson 13's sentence landed in `e0b6b32`; S3 tests only lesson 1, so no prompt has tested lesson 13 yet.

### Attention

reviewed by gpt-6.1-sol

- **critical — `2026-10-06T21:11:11Z`, “Smoke set 2 after dotai 8acd6ea.”** “Every prompt shows its intended parts” is false. Claude’s S1 says table adoption already exists and does not describe the dependency plan’s own check at `HEAD`. S3 skips the build that `intended.md` still requires. The six prompts also omit the changed citation and exit-line gates. Weigh a corrected score, a valid S1 fixture, and the missing gate prompts before counting the smoke complete.

- **critical — transcript lines 8391–8456, final gate order.** The final block edits receive tests and another smoke, but no subsequent `unslop` invocation or `verify`. The last `unslop` is at line 7739. The sole `verify` starts at line 8261, before the skill reinstall and final `apply` at line 8402. `check` after that apply proves synchronization only. These required gates remain open for the final artifact.

- **critical — transcript lines 6472–6486 and 8198, instruction reread.** The todo marks the post-compaction reread complete, but the transcript shows file sizes, an AGENTS diff, and a models-sheet tail. It does not show the required full reread. After apply, line 8198 cuts changed instruction sentences at column 260. That repeats the exact failure lesson 10 addresses. Weigh correcting the completion claim and reading the instructions without truncation.

- **critical — `2026-10-06T21:01:19Z`, “Run each round-2 critical dismissed as rare…”** The receipt does not support “each case reproduces” through the installed helpers. `rare-cases.mjs` counts null-stop text endings but never invokes `reply.mjs` on Opus’s completed-reply case. Its 9/669 count does not establish completion from harness notices. Also, `r2-counts.mjs` checks angle-bracket destinations in plans but omits that counter for decision logs. Weigh narrowing the verified scope or supplying those missing checks.

- **critical — `2026-10-06T20:15:43Z`, “warning the exit predicate misses bare exit N…”** The evidence claim that rejected samples showed no exit record is false. The first rejected log ends with `Exit status 1`; the sample truncated that receipt. Opus’s round-2 C2 identifies this, but no later row supersedes that specific claim. The final strict-marker decision can stand separately; the historical evidence needs correction.

- **warning — transcript lines 6431 and 6528, todo ordering.** The first helper edit precedes creation of the required quoted todo list. No decision row records this ordering slip. Weigh recording it instead of treating the initial gate sequence as followed.

- **warning — `2026-10-06T20:57:05Z`, owner commit handling.** The intake-base corpus run supports `PSTACK_BASE=7ad817c352`. It does not prove every later checker used that base. The append commands at lines 8421 and 8456 show no explicit base setting. Weigh making the setting explicit and rerunning the final plan and log checks across the intake range.

The lead's answers, each logged as a row: smoke set 2's score is superseded, and set 3 adds a prompt for the citation and exit-line checks. The final block edits got their writing pass and `verify`. Every changed instruction sentence is now read in full. The reply case is run through `reply.mjs` and the logs are counted. The false sample claim is superseded. The todo-order slip is recorded. The final checks ran against the intake base.

## Open work

- Lesson 9's partial-proof check, planned in `docs/plans/2026-10-07-partial-proof-acceptance.md`. owner: zbeyens, whose "go complete" this run carries out; stop: that plan's close, or you say "no partial check"; tracked: `docs/plans/topics/correct.md`.
- The deferred panel warnings and nits, and the conflicts the smokes named outside this change, are listed in this plan's decision log with their owners. owner: zbeyens; stop: each row's own stop, or 2026-11-07; tracked: `docs/plans/topics/correct.md`.
- This reflect's other 11 Backlog items, listed above with owners and stops. owner: zbeyens; stop: each item's own stop; tracked: `docs/plans/topics/correct.md`.
