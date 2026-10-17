# Card sessions hand Codex the coding, and Claude judges

Status: executed: plate-2's sync and fixes wait on your commit
Topic: pstack
Playbook: plan

The owner's words: "i'd like to extend /chips skill to support running those chips in codex instead to spare tokens, but only for non critical designs. we still want critical ones (xhigh effort ones) to be run in claude, while those explicit enough could be run in codex. either i copy a prompt to codex or you could spawn --bypass one. harsh honest feedback", then "indeed we basically want opus for judgement like poteto does. so codex does the worktree patch. would it save a lot of tokens ? dry run now to test it would work before modifying the workflow", then "ok nah for codex we can use xhigh all time. whats final plan?", then "what about i start all chips here on claude as worktree, and it would use codex to run on those same worktrees, then review the output + patch ?? so we can leverage chips on claude / a thorough review/cleanup on test written by codex is done by claude since we assume codex tests tend to low quality. / for when cause is not found: can't we use open to plan/find it, then it spawns codex to code ? only when its worth it / not straigthforward (otherwise its a loss of token)", then "we'll test on a real card now. and even patch it if its green.", then "oh and UI design (especially screenshot judgement , pixel perfect etc) stays in opus."

## Brief

### What will change?

Chips keep their Claude cards. Each card session still finds the cause and plans, then hands Codex the coding in its own copy of the code when that is worth it. Claude reviews the patch and rewrites weak tests.

### What could go wrong?

The saving is about a third to a half of a session, not most of it, because planning, browser checks and review stay in Claude. A rushed review would let weak Codex code land.

## Teach

A chip is side work you start from a card. Its Claude session finds the cause, plans the fix, writes the code, runs the tests, checks the result in the browser and lands the patch. In one measured session, writing code and running tests took 45 percent of the Claude cost, and command runs alone took 56 percent.

In the dry run, Codex wrote one fix and its test in three and a half minutes for 2.4 million mostly cached tokens. Opus then reviewed the diff, and the patch passed.

After this change, the card session keeps every judgment: the cause, the plan, the review and the landing. When the coding is more than a small edit, it writes a short brief and lets Codex do the coding and its test runs in the same copy of the code. Claude then reviews every line, rewrites weak tests and finishes the proof.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When a session hands Codex the coding | When the change is more than a few lines or needs its own test loop; I write it myself when the brief would be longer than the diff (look) | Hand Codex every change | always codex | big |
| Which checks Claude reruns | The task's own failing check, and I read Codex's logs for the rest | Rerun every check Codex ran | rerun all | small |
| A patch that fails review | I send it back to Codex once with my findings, then finish it myself | I finish it myself straight away | no send-back | small |
| Sessions outside chips | Any Claude session may hand Codex the coding the same way | Only card sessions | chips only | small |
| The trial patch | It lands after the real card's test, with my test review | Drop it and let a card redo the task | drop trial | small |
| The real card test | A plain fix whose cause is known, keeping a slot's fixed values, started now in its own session | The trial's task again | retest trial | detail |
| How long a Codex coding run may take | Up to 6 hours, so a long fix finishes, while a hung run still ends (look) | No limit at all | no cap | small |
| How `/chips codex` keeps its mark on a card | The sweep logs `codex: always` on each `carded` row it writes, and `chips brief` prints the forced handoff for a task whose current card carries it, so the brief the session prints again at its start keeps it (safe) | Put the mark only in the card's prompt, which the session's fresh brief drops | prompt only | small |
| Where ellie turns it on | ellie's `.agents/pstack.json` sets `"chips": { "codex": "always" }`, so every ellie card forces the handoff without the argument, while plate-2 keeps the judged rule (safe) | ellie types `/chips codex` at each sweep | ellie by argument | small |
| How hard Claude reviews a forced card | Claude reads the diff, runs the checks and rewrites only a test that does not fail before the fix or asserts nothing; it skips style cleanup of Codex's tests (look) | The full test review of a judged card | full review | small |
| Review of this plan | No panel on the plan; a decision-trail review runs before the shared rules are pushed | A panel on the plan first | panel | detail |

## Main changes

- Every chip still starts as a Claude card in its own worktree, and xhigh design questions stay in Claude for their design. The only ledger change is the forced mode's `codex: always` mark below.
- UI design stays in Opus. That covers layout, styling and visual polish, and every judgment made from a screenshot, such as a pixel match or a visual review. A session never hands Codex a change whose result is judged by how it looks. Codex may still code the logic inside a UI component, and the Claude session runs the browser proof and judges its screenshots.
- A session that has located the cause and planned the change, at any effort, may hand Codex the coding. It fills the shared brief `.agents/pstack/codex-build.md` with the task, the located cause, the planned change, the files and the checks to run. It saves the filled brief as `docs/plans/artifacts/codex/<task id>/brief.md` inside its own worktree, which git ignores, so it never enters the patch and the edit tools accept it. Then it runs `node .agents/pstack/cross.mjs --to codex --bypass --effort xhigh --timeout 21600 --prompt-file <brief>` in the background from its own working directory, with the output in `codex.log` beside the brief, and waits for it to exit.
- A Codex coding run is exempt from the Time budget rule's hour, because some fixes take hours and stopping one wastes its work. `cross.mjs` accepts a timeout up to 6 hours under `--bypass` without `--stress`. Proofs, seats and measurements keep the hour. The Claude session sits idle while Codex runs, so a long run costs Codex time, not Claude tokens.
- The brief, taken from the dry run, has Codex write the fix and its regression test, see the test fail before the fix and pass after, and run the named checks. Its final message lists the files, the root cause, and each command with its exit status. It forbids plans, decision logs, panels, seats, ledger writes, commits and worktree changes, and says to stop on any design choice the plan does not settle.
- The session reviews the whole diff, runs the task's own check, and reads the callers of each changed symbol. It then runs `deslop` and `no-comments`, the browser proof, any panel the reviews list names, and the landing, as today.
- Claude reviews every test Codex wrote against the Tests rule. Each test must name the defect it catches, fail before the fix, assert public behavior against literal values, and repeat no other test's boundary. Claude rewrites or cuts each one that falls short.
- The block's Codex workers rule changes in two ways. A session may hand Codex the coding of its own planned change without the owner's word. A Codex worker may write the tests of the change it codes, which replaces "A worker never writes or changes a test" for that case, while docs and changesets stay with Claude. Codex runs at `xhigh` every time, as the owner said.
- `/chips codex` forces the handoff for every card that sweep offers, and a project can make it the default with `"chips": { "codex": "always" }` in `.agents/pstack.json`. A forced card hands Codex the code whatever its size, xhigh fixes and design questions included, once Claude has found the cause or settled the design. Claude keeps that judgment, the browser proof and every screenshot judgment. The owner's case is ellie, where code quality matters less and most chips should run in Codex. `chips brief` prints the forced handoff for a task whose current card row carries `codex: always`, or for every task in a project whose config sets it, so the session's fresh brief keeps it.
- The chips lead fixes the friction a card reports. A card session's last report names each piece of workflow friction it hit. When that report arrives, or at the next sweep for a session the lead did not start, the chips lead fixes each item as the Improve the workflow mid-task rule says: project tooling in the checkout, and a shared rule or helper through `sync-pstack`'s Lesson mode. An item it cannot fix in the run becomes a suggested task. The two test cards' reports led to the runner, evidence and brief fixes above.
- A chip's finding cites only evidence that the project checkout holds. The real card could not read its probe log, because the session that offered the task wrote it in its own worktree's ignored run directory. `decisions-check.mjs append` refuses a chip offer or `folded` row whose finding cites a run-directory path the checkout lacks, and says to copy the file into the checkout's run directory first. It does not recheck rows already in the ledger.
- A package's `pnpm test`, `typecheck` and `lint` run every partition even after one fails, through `--continue=always` in `tooling/scripts/run-entrypoint-package-task.mjs`. Before, turbo stopped at the first failure. One run showed 15 of 20 tasks passing, one failing and four never run, so the card session reran the groups one by one. The second card hit a worse case. Every platejs test partition depends on typecheck partitions, so a type error that already fails at HEAD kept all 55 test partitions from running. Typecheck partitions output only `.tsbuildinfo` files, which tests never read, so the tests now run whatever the typecheck says. The summary names each partition that failed.
- The Codex brief forbids copying or exporting the repository, running checks against HEAD, and scratch files outside the brief's folder. The second card's Codex run left a 206 MB `git archive` of HEAD in `.tmp/`, which held up the worktree cleanup.

## Steps

- [x] Run the handoff on one real card, `t_527d5edc`, in its own session, and land its patch if every check is green. Proof: the session's report, its ledger rows and its token totals.
- [x] Make the plitejs and platejs package runner run every partition whatever fails before it. Proof: `docs/plans/artifacts/2026-10-16-chips-codex/plitejs-test-continue.log` and `docs/plans/artifacts/2026-10-16-chips-codex/platejs-test-always.log`.
- [x] Copy the Details title slot run directory from the worktree that wrote it into the checkout, so the 7 open chips that cite its probes can read them. Proof: `docs/plans/artifacts/2026-10-16-chips-codex/missing-evidence.tsv`.
- [x] Make `decisions-check.mjs append` refuse a chip offer or `folded` row whose finding cites a run-directory path the checkout lacks, with a must-refuse and a must-pass test. Proof: `docs/plans/artifacts/2026-10-16-chips-codex/dotai-suite.log`.
- [x] Add the forced mode: `chips brief` prints the handoff when the task's card row carries `codex: always` or the project config sets it, `append` takes `codex: always` on a `carded` row, the chips skill's Sweep accepts `codex`, and ellie's `.agents/pstack.json` sets it. Each gets a must-pass and a must-refuse test. Proof: `docs/plans/artifacts/2026-10-16-chips-codex/dotai-suite.log` and an ellie `chips brief t_4e64ce13` that prints the handoff while plate-2's briefs do not.
- [x] Let `cross.mjs` take a timeout up to 21600 seconds under `--bypass` without `--stress`, with a test that it refuses 21601 and refuses over 3600 without `--bypass`, and exempt Codex coding runs in the Time budget rule. Proof: `docs/plans/artifacts/2026-10-16-chips-codex/dotai-suite.log`.
- [x] Write `codex-build.md` in dotai's shared helpers from the dry run's brief, with slots for the task, cause, plan, files and checks. Proof: dotai `8cef786`.
- [x] Rewrite the block's Codex workers rule, with UI design and screenshot judgment kept in Opus, and the Tests rule's review of Codex tests, and add one line to the chips rule that card sessions use it. Proof: dotai `8cef786`.
- [x] Run `unslop` on the rule text. Proof: the writing row.
- [x] Run dotai's suite and `validate-skills`. Proof: `docs/plans/artifacts/2026-10-16-chips-codex/dotai-suite.log` and `docs/plans/artifacts/2026-10-16-chips-codex/dotai-validate.log`.
- [ ] skip: fast. Run the decision-trail review on this plan's log and the rule diff. Proof: its answer.
- [x] Commit and push dotai, sync plate-2 and ellie from the pushed commit, and run `verify` on each. Proof: dotai `8cef786` and `48a5eb4`, ellie `40ee73c3b` and `42af95084`, `docs/plans/artifacts/2026-10-16-chips-codex/verify-plate-2.log` and `docs/plans/artifacts/2026-10-16-chips-codex/verify-ellie.log`.
- [x] Land `t_cf6a9e03`'s trial patch after a test review, then measure the next two card sessions that hand Codex the coding, each with its Claude and Codex tokens beside the 5.7 million weighted baseline. Proof: the plan log's two prototype rows for `t_527d5edc` and `t_a7303114`, and `docs/plans/artifacts/chips/t_cf6a9e03.patch`.

## Close

- Deviation: `start <id> codex` was not built. A task started without a card has no ledger row that carries the mark into the brief its session prints again, and `/chips codex` and the project setting cover the owner's case.
- Deviation: plate-2's first sync rendered from the dotai checkout while another session held an uncommitted edit to the block's Autopilot rule, so that edit reached plate-2's `AGENTS.md`. The lead synced plate-2 and ellie again from a clean worktree at `48a5eb4`, which wrote the committed text.
- Under "fast", no panel, smoke, decision-trail review or reflect ran, and `no-comments` closed as skip: fast.
- ellie's `maxEffort` is `high`, so `cross.mjs` caps its Codex runs at high, not xhigh.

What landed. dotai `8cef786` and `48a5eb4` are on `main`. A Claude session that has found a fix's cause or settled a design hands Codex the code and its tests at xhigh through the shared `codex-build.md` brief, reviews the diff and the tests, and keeps UI design and screenshot judgment. `cross.mjs --bypass` takes a timeout up to six hours. `/chips codex` marks each card it offers with `codex: always`, and `chips.codex: always` in `.agents/pstack.json` forces the handoff on every task. `append` refuses a new chip finding whose cited evidence the checkout lacks. A card session reports its friction, and the chips lead fixes each item. ellie has the sync, `chips.codex: always` and the reinstalled chips skill pushed. plate-2 holds the sync, the reinstalled chips skill, the package runner fix, both landed card patches, the trial patch for `t_cf6a9e03` with its changeset, and the restored Details evidence, uncommitted for the owner.

Proof. dotai's suite passed 286 of 286 and `validate-skills` passed. The corpus showed no ledger difference in plate-2 or ellie. `sync-pstack verify` passed on both. plate-2's runtime contract tests passed 902 of 902 with all three Codex patches applied. The two real cards cost about 1.14 and 2.44 million weighted Claude tokens against the 5.72 million baseline, on different tasks from it.

Limits. The forced mode and the friction loop have run only in tests and in this run, never from a real `/chips codex` sweep. Each token figure is one task, so the saving is a range, not a rate.

Counts: thirteen steps. Twelve are done, and one was skipped under fast.

## Open work

- plate-2's changes wait on your commit: the synced `AGENTS.md` block, `.agents/pstack` helpers and rules, the chips skill and `skills-lock.json`, `tooling/scripts/run-entrypoint-package-task.mjs`, the three plitejs patches with their changesets, this plan and its log, and the ledger rows. owner: zbeyens. stop: the owner commits them.
- This change shipped fast and is owed a review until the owner says "full". owner: zbeyens. stop: "full" or the owner drops the review.
- `t_1d26d1f4` cites `docs/plans/artifacts/2026-10-16-time-budget/smoke/new-p2-export-a5.log`, which no checkout or worktree holds; only a1 to a4 exist. owner: zbeyens. stop: the task is corrected or dropped. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
