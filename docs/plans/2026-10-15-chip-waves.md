# Suggested tasks run in waves

Status: executed: plate-2's sync waits on your commit
Topic: pstack
Playbook: feature

The owner's words, in order: "so they can all be run in parallel?", then "ok so "chips" skill prevent suggesting non-parallelizable tasks, right? are they designed so i can click on "Start all"? For example one scenario could be "Start all" a first batch, then start all another batch depending on the first one", then "i mean they can work on same files, we just need to avoid hard dependency... OR harsh honnest feedback do we just let the agent send message to ther other sessions to wait for them to finish first? i've seen this many times", then "ok nice , one more thing, like your effort suggestions, would you also recommend to use "poteto fast" for the most explicit tasks ? if task is explicit enough, we dont need another round of subagents because it could have been done already in the one suggesting that task...", then "ok go update chip skill to those new suggestions", and last "fast mode" during the plan panel. An earlier answer from the owner also decides who lands a card session's work: asked whether to apply its patch, the owner told one card session "cant you just edit files in next branch".

## Brief

### What will change?

A task starts once what it depends on is done, even if it shares files with another. Each session puts its finished work into your checkout. It's live in dotai, ellie and PR 5166, and plate-2 needs your commit.

### What could go wrong?

If two sessions edit the same file, the second one has to redo its change on top. If nobody writes down a dependency, a task can start too early. No real session has landed its work this way yet.

## Teach

A suggested task is side work the owner starts from a card. Today a task can start only when no other task writes its files. That holds back most waiting tasks, though each card session works in its own copy of the project. It still missed a real dependency. The table-of-contents task needed the title-slot answer first.

After this change, a task waits only on a merged PR, a finished plan or another task's result. Shared project files become a hint the lead checks before each card. A finished session applies its own patch to the project, and a task that waited on it gets its card once the owner commits that work, because a new session starts from the last commit.

A task that names its exact fix and a check that fails today can carry a fast mark. Its session skips its own review panels. A review task then checks each wave's fast work together, and the ledger keeps that work marked unreviewed until one does.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Shared project files | Never hold a task back; a session whose patch no longer applies redoes its change on top (look) | Keep making a task wait behind another that writes its files | keep the file gate | big |
| Files in another repository | Still one session at a time, because those sessions edit that repository in place | Let them share too | share other repos | small |
| Who lands a card session's work | The session applies its own patch to the project, as you told one session | The session hands the patch back and the lead applies it | lead applies | big |
| When the next wave starts | Once you commit the work it waits on, since a new session starts from the last commit (look) | Each new session first applies the patches it waits on | apply dependency patches | big |
| Next wave cards | The lead watches the ledger in the background and cards the next wave when its waits clear | You run the chips sweep yourself between waves | manual waves | small |
| Fast work review | One review task per wave, and the ledger keeps fast work owed until a review marks it reviewed | No review, as fast does today until someone says full | no wave review | small |
| Which tasks may run fast | A fix at high effort that names its exact change and a check that fails today, and changes no public call | Any task the offering session calls explicit | any explicit task | small |
| Old task notes with no real finding | The sweep flags them as possibly thin, and the lead adds the finding before the next card | Card them as they are | card thin tasks | small |
| Sessions waiting on each other by message | Not built; sessions never message each other to wait | Let a session ask another to finish first | message waits | detail |
| A lock for tasks that own the same failing check | Not built; that is a dependency the lead judges like any other | Make an owned check block a second task | owned-check lock | detail |
| Plan review | One panel round ran with Opus and Astra; the owner's fast stopped Sol and every later review (look) | Run the remaining rounds and the trail review | full | detail |
| Paired trial for fast cards | Skipped: only marked tasks change, and fast is already the owner's word | Run a baseline and revised trial first | fast trial | detail |

## Decisions

The targets this plan compared, with the owner's typed asks as the bar: start a whole batch at once, start the next batch once the first is done, never hold a task back for sharing files, and skip a second round of review on explicit tasks.

| Target | Start all | Next wave | Shared files | Explicit tasks |
| --- | --- | --- | --- | --- |
| Today: the path gate, waves by hand | Yes, but only one task per set of files | The owner runs the sweep | Blocked | Full review each |
| Control, no new artifact: drop the path gate only | Yes | Starts without the last wave's work | Allowed | Full review each |
| Sessions message each other to wait | Yes | A held message never arrives | Allowed | Full review each |
| The lead applies every patch | Yes | Starts without the last wave's work | Allowed, but the lead's apply refuses a dirty tree | Fast, one review a wave |
| Picked: dependency waits, sessions land their own patch, the next wave after the owner's commit | Yes | Cards once the owner commits the wave | Allowed, outside other repositories | Fast, one review a wave |

This session's own evidence rules out the message target. A request to the suggestions session was held because the two sessions ran in different permission modes, and it expired undelivered.

The plan panel ruled out the lead applying patches. Both seats reproduced that the three-way apply refuses a file with unstaged edits, which is the project's normal state, and that it stages what it applies. Both also showed that a new card session starts from the last commit, so a wave that waits on uncommitted work would start without it.

## Main changes

- `chips` lists a task as Ready once it has a topic and each wait has cleared. A started task or an earlier Ready task that writes the same project path no longer holds it back; a path outside the project's checkout, such as another repository's file, still does, because sessions edit that repository in place. `append` refuses a `started` row's added path only when it lies outside the checkout. The card item names each open task that shares a project path, as the first place to look for a dependency.
- A task that holds a card takes an `updated` row that only adds waits and keeps every wait it has. A full sweep judges each carded task that shares paths the same way it judges a task before its card, because someone may have carded it before anyone judged its dependencies. The withdrawal pass then pulls this session's card; a card another session holds keeps its prompt, whose board check stops its session.
- `chips stale` marks an open task whose every finding is a note an older migration wrote, such as "moved from", "waits for:" or "no open run or task writes its paths", as possibly thin.
- `chips brief` names the project checkout. Its ledger commands run there, while the session's edits and checks stay in its own worktree. Its footer says how a session in its own worktree lands: save the diff under the checkout's plans artifacts, check it with `git apply --check --whitespace=error-all`, apply it with plain `git apply`, which leaves the index alone, redo the change on the live file when the check fails, and log `landed` with `patch:`.
- `landed` takes `patch:`. A `task:` wait on a task whose landed row names a patch clears only once every path the patch touches matches `HEAD` in the project checkout, so the waiting session's worktree starts from that work.
- `chips wait` polls the ledger and the checkout and exits once a task without a card turns Ready or a started task lands, or at its timeout, so a runtime that re-invokes the lead when a background command exits wakes it for the next wave.
- An offer or `updated` row takes `fast: yes` or `fast: no`. A task is fast while it carries `fast: yes`, is not a design question and its title shows no `(xhigh)`, so a fold or dup that raises it drops the mark. `append` refuses `fast: yes` on a design question, a review task or an `(xhigh)` task, and a new title that writes ` (fast)` itself. A fast task's title shows ` (fast)`, and its brief says the owner's start is the word fast for it.
- A task takes `kind: review`, and a landed task takes `reviewed`. A landed fast task with no `reviewed` row is owed a review. The ledger pass prints one item for the fast tasks that hold a card, are started or are owed and that no open review task waits on: add them to an open review task with no card, or offer a new one. A review task's brief lists each task it waits on with its landed `patch:`.

## Panel

Round 1 ran on the first draft with Opus and Astra; the owner stopped the Sol seat with "fast mode". Their criticals, and what this revision does with each:

- The three-way apply refuses a file with unstaged edits and stages what it applies (both): the lead no longer applies patches; a session applies its own with plain `git apply`, which touches only the working tree.
- A dependent wave starts without the last wave's uncommitted work (both): a `task:` wait on a landed patch clears once the owner commits its paths.
- Tasks that write another repository share one live checkout (Opus): the path gate stays for paths outside the project's checkout.
- Two open tasks cover this work, t_591359ab and t_d6687840 (Opus): this plan answers t_591359ab with the owner's quote and closes it at the close; t_d6687840 waits on this plan's run.
- "Run every command from the checkout" would test and package the wrong tree (both): only ledger commands run there.
- Offering a review does not keep the review owed when it is declined (Astra): the obligation sits on each fast task until a `reviewed` row.
- The table-of-contents dependency has no migration step (Astra): the close sweep logs it.
- `handed` was missing from the result list (Astra): `handed` is gone; `reviewed` joins the result list.

Their warnings: the watch's predicate now reads Ready and landed tasks, not Do item text; fast is computed after any fold or dup; the thin flag matches only migration notes and says "possibly"; the rule rewrite covers the run's own path gate in Sweep; a card another session holds is a stated limit. The phase gates' end-to-end Desktop proof, the per-project delivery model and the helper's size are noted in Open work.

## Steps

- [x] Record the intake base and the panel round. Proof: the `plan` rows naming dotai `7ac402f`, plate-2 `d53a881036` and the pre-edit copies, and the round 1 `seats` row with each critical's outcome.
- [x] Ledger rows before the build: wait t_591359ab and t_d6687840 on this plan's run, withdrawing any card this session holds first. Proof: the ledger rows. Done: the 2026-10-15T14:55:43Z `updated` rows in `docs/plans/suggested-tasks.decisions.tsv`.
- [x] Phase 1, readiness by dependency, in dotai `tasks.mjs` and `decisions-check.mjs`. Proof: the dotai suite through `proof.mjs`, with tests that fail at `7ac402f`: two tasks on one project path both Ready, a started one holding nothing back, an outside path still queued and still refused on a `started` row, the card item's hint, a wait-adding `updated` on a carded task accepted and a wait-dropping one refused, and the thin mark on a migration note but not on a real finding that starts "waits for".
- [x] Phase 2, self-landing and the watch. Proof: suite tests that fail at `7ac402f`: `landed` with `patch:`, a `task:` wait held until the patch's paths match `HEAD`, the brief's checkout line and landing footer, and `chips wait` exiting when a waiting task turns Ready and timing out with no change; plus a scratch run of the footer's landing steps on a checkout with unstaged, staged and staged-then-edited files, which must keep every existing edit and the index.
- [x] Phase 3, fast tasks and the wave review. Proof: suite tests that fail at `7ac402f`: `fast: yes` shows ` (fast)`, refused on a design question and an `(xhigh)` task and on a title that writes it, dropped by a fold or dup that raises the task; the review item for a carded fast task, gone once a review task waits on it, back after that review is declined; and `reviewed` clearing the owed mark.
- [x] Rule text: `chips.md`, the `chips` skill, the block's Git, Fast and Suggested tasks bullets, and plate-2's `CODING_STANDARDS.md` row 97. Search dotai and every managed project for "overlapping path", "queued behind", "writes the same paths", "leaves that path", "writes its paths", "writes a path" and "patch file to apply", and fix every live hit. Proof: the search output in the run directory.
- [x] Writing passes: `deslop` on the helper diff, `unslop` on the rule, skill, block and plan prose; `no-comments` skip: fast. Proof: `writing` rows.
- [x] Corpus: old and new helper over each managed ledger, with the boards and whole-log checks diffed, every task that turns Ready listed and the first five thin marks opened. Proof: `verify` rows. Done: `docs/plans/artifacts/2026-10-15-chip-waves/corpus/a1/summary.txt` and `corpus/a2/summary.txt`, with `thin-plate-2.txt`.
- [x] In dotai, run `node scripts/build-workflow.mjs`, the suite and `scripts/validate-skills`, then commit and push with "Shipped fast, no review." Proof: a `delivery` row.
- [x] Apply plate-2, ellie and the plate worktree from the pushed commit, run `verify` on each, and smoke both runtimes on plate-2 with a card pass that meets a shared path and a card session's landing. Proof: `smoke` rows.
- [x] Deliver: commit and push ellie, push the plate worktree's sync, leave plate-2 uncommitted. Proof: `delivery` rows. Done: ellie `aaf0e2338` and plate-5166-sync `ca5efd8c26`, with the PR 5166 body in `docs/plans/artifacts/2026-10-15-chip-waves/pr-5166-body.md`.
- [x] Close, fold, page and the chip sweep with the new board: log the table-of-contents wait, close t_591359ab as done, withdraw and re-card this session's cards so each carries the new prompt. Proof: `plan-open.mjs` passes and the sweep's rows.

## Close

- Reversed: the first draft had the lead apply every card session's patch with a three-way apply. The plan panel reproduced that a three-way apply refuses a file with unstaged edits and stages what it applies, and that a dependent wave would start without the last wave's uncommitted work. So the design changed before the build. Each session applies its own patch with a plain `git apply`, and a `task:` wait on that patch clears once the checkout commits its paths.
- Reversed: the reply before this plan said `owns:` "stays a hard lock". It never was one, and the plan builds none.
- The owner's "fast mode" stopped the Sol seat in plan round 1 and every later review. No second round, decision-trail review or reflect ran, and each commit ends "Shipped fast, no review."
- The change took three pushed dotai commits. The plate-2 smoke ran after `d932e54` was pushed and found two gaps in the new skill text, which `7cddeb3` fixed: a thin task whose card another session holds, and a task carded before anyone judged its dependencies. The second smoke found that the skill now judged carded tasks while `chips.md` held no such rule, which `bd330d8` fixed. No project delivered before the last fix, and suggested task t_07a09b83 now carries this lesson.
- The corpus ran again after the first apply rather than right before it, and it matched the first run.
- The close sweep ran at the same time as the "list paste" session's own sweep. The ledger refused six of this session's cards as duplicates of that session's, and this session withdrew them.

What landed. dotai `d932e54`, `7cddeb3` and `bd330d8` on `main` change `tasks.mjs`, `decisions-check.mjs`, `status.mjs`, `rules/chips.md`, the `chips` skill and the block's Git and Fast rules. ellie has `aaf0e2338` on `next`. PR 5166's branch has `ca5efd8c26`, and the PR's title and body name `bd330d8`. plate-2 holds the sync, the reinstalled chips skill, `CODING_STANDARDS.md` row 97, this plan, its log and the ledger rows, uncommitted for the owner. The close sweep closed t_591359ab as done, folded the real finding into eight thin tasks, and carded 14 Ready tasks again with the new prompt.

Proof. The dotai suite passed 266 of 266 at each commit, and each of the 11 new or rewritten tests fails on the `7ac402f` helpers. On a scratch checkout, the landing steps kept every unstaged, staged and staged-then-edited file and the index, and a three-way apply there refused as the panel found. Over the plate-2 and ellie ledgers, both helpers' whole-log checks pass. plate-2's Ready count went from 18 to 43, and ellie's from 9 to 12. `sync-pstack verify` passed on all three projects at `bd330d8`. In the read-only smokes, both runtimes kept tasks on shared paths open to start, added the title-slot wait to a carded Details task, and landed a card session's work with a plain apply and no commit.

Limits. The smokes ran headless CLIs with no desktop session or suggest tool, so they prove routing, not the actions. No real card session has landed a patch through the new footer yet, and `chips wait` has not yet woken a desktop lead for a second wave. The first real wave proves both.

Counts: twelve steps, all done.

## Open work

- plate-2's sync waits on your commit: `AGENTS.md`, `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/status.mjs`, `.agents/pstack/tasks.mjs`, `.agents/pstack/rules/chips.md`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `CODING_STANDARDS.md`, this plan and its log, and the ledger rows. A task that waits on a landed patch gets its card only after that commit. owner: zbeyens. stop: the owner commits them.
- The first real wave: a card session lands its patch through the brief's footer, and `chips wait` wakes the lead to card the next wave. owner: the lead of the next chips sweep. stop: the first card session that logs `landed` with `patch:`.
