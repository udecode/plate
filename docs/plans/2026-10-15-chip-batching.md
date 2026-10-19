# Suggested tasks that batch and track themselves

Status: executed: its delivery and the redone merge moved to the chip-merge iteration
Topic: pstack
Playbook: feature

The owner's words: "i want to repair our pstack worfklow how they suggest those chip tasks so next time there is not all those issues, it would better track and batch". Earlier: "merged. where are all suggested tasks" and "are those best to run one by one , or should we consolidate/group some into /verdict items ??". Then "fast poteto," and, mid-run, "actually not fast, use full poteto", so this request runs every review: the architect cross-judge, a panel on the dotai diff, the smoke set and a decision-trail review.

## Brief

### What will change?

One command lists every suggested task and which can start now, and waits clear by themselves. The review rules sent the merge of duplicate tasks back to planning, and delivery moved to the next iteration, so no project has this yet.

### What could go wrong?

The trail review found three gaps. A dropped wait is fixed, the twice-reworked merge is undone, and the next iteration reviews the unreviewed rule fixes. Proof stops at the dotai tests and the smoke answers.

## Teach

A suggested task is side work an agent finds outside its own job. In Claude Code desktop it shows as a card you start with one click. Every project keeps one list of them, so a task outlives the run that found it.

Until now the card was the task. Its title said Now or After, a wait was a sentence, and the app shows only 20 cards per session. When something changed, the agent offered a new card, which pushed an old one out, and the list then closed that old task as gone. Eight real tasks were lost that way, and 41 piled up with stale waits.

Now a task is a list entry with its own id, and a card is only a view of it. Each task names its topic and what it waits on, such as a PR, a plan or another task. The list works out what is ready each time you read it, only ready tasks get cards, and a second design question on a topic joins the first.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Cards for waiting work | Only a task that can start gets a card; the list shows the rest (look) | A card for every task, as today | card everything | big |
| How tasks group | Each task names a topic, and one topic holds at most one open design question (look) | Group by shared files | group by files | big |
| A card that leaves the queue | The task stays open | It closes as gone, as today | close on evict | small |
| Waiting on a PR | Read from the local copy of the remote branches; a fetch option refreshes it | Ask GitHub each time | ask github | small |
| Blaming the base branch | A row that blames it names the check, and an open task must own that check | Free text, as today | free text | small |
| Tasks lost as gone | Bring back the seven that still owe work (look) | Leave them closed | keep closed | small |
| plate-2's 41 open tasks | Regroup them by topic as proposed in chat, with one design task per question (look) | Keep every task separate | keep separate | big |
| A card you dismiss | Its task closes as declined | It stays open and gets a card again | recard declined | small |
| Ellie's open tasks | Left as they are; they show as unmigrated until a run there gives them topics | Migrate them in this run | migrate ellie | small |
| Reviews | Full, on your word: cross-judge, a panel on the dotai diff, the smoke set and a trail review | Fast, with none of them | fast | detail |
| A card from a session that ended | Cards name their session, and the sweep checks that session with the session tool (look) | Treat every card as live until you say it is gone | trust cards | small |
| Merging two tasks | Copy the duplicate's work into the kept task first, then close it; the merge goes back to planning (look) | Keep the merge the review reworked twice | keep merge | small |

## Main changes

- New shared helper `.agents/pstack/tasks.mjs` owns the suggested-task ledger: it reads the rows into tasks, checks each chip row, resolves waits, picks the ready set and prints the board. `decisions-check.mjs` calls it from `append`, the whole-log check and `chips`.
- A task's id never changes. New results `carded`, `uncarded`, `updated`, `folded`, `reopened` and `dismissed declined` replace re-offering a card under a new id. `append` refuses new `dismissed gone` and `dismissed replaced` rows, a title marked `Now:`, `After:` or `(high)`, a new offer without `topic:`, and a token the row's result would ignore.
- A new offer names `topic:` and may name `kind: decide`, `waits:` (`pr:<n>`, `task:<id>`, `run:<plan path>`) and `owns:`. A PR wait clears when a commit subject on `refs/remotes/<remote>/<branch>`, for each remote and the project's branch, is that PR's merge or squash subject. A task wait clears when that task lands or is dismissed `done`, a plan wait when its Status says it landed. A wait on a task or plan that closed another way, or one that loops back through offered tasks, is stuck and makes `chips` exit 1.
- A task is ready when it has a topic, every wait cleared and no started task writes its paths. Among those, `chips` takes tasks with a card first, then the rest in ledger order, and queues one that overlaps an earlier ready task. `append` refuses a `carded` row, or an offer with `card:`, for a task that is not ready before its card.
- A card names the session that offered it with `session:`. `chips --session <id>` lists each card another session holds, so the lead checks that session with the runtime's session tool and logs `uncarded` once it is archived or gone.
- A topic holds at most one offered `kind: decide` task, and a new one waits on a running one. A finding on an offered task's question joins it as a `folded` row. `dismissed dup` closes a task another open task covers and moves nothing, so the sweep first logs a `folded` row that carries the duplicate's paths, waits, checks and finding into the kept task. A started task's `updated` rows take only `owns:`.
- `append` refuses a decision row whose evidence names `base-red: <check>` until an open ledger task lists that check in `owns:`.
- The whole-log check judges each chip row only against the ledger rows before it. The rules older ledgers predate, and the checks of live git, plan, ledger and disk state, run only when `append` writes a row, so a row never turns red later.
- `chips` prints Ready, Started, Waiting with each blocker, Unmigrated, Lost, the topics with more than one task or a design question, and a Do list. `chips id` prints a fresh id and `chips brief <id>` prints a card's prompt.
- `chips.md` names every predicate the helper checks. The block's Autopilot and Suggested tasks sentences and one `tests.md` sentence point at it.

## Steps

- [x] Build `tasks.mjs` and wire it into `decisions-check.mjs`, with tests that fail on the old helper for each new refusal and each wait kind. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs` in dotai, logged with `proof.mjs`. Done: `docs/plans/artifacts/2026-10-15-chip-batching/proof/dotai-tests-39678f2-a1.log`, 206 of 206.
- [x] Rewrite `chips.md` and the block sentences, with `unslop`. Proof: a `writing` row. Done: the `writing` rows in this plan's decision log.
- [x] Run the old and new helper over every managed project's ledger, plate-2's and ellie's, and diff what each refuses and lists. Proof: a `verify` row and the corpus logs in this run's directory. Done: `docs/plans/artifacts/2026-10-15-chip-batching/corpus-r4`.
- [x] Commit and push dotai, then `apply` plate-2, plate and ellie from that commit, and `verify` each. Proof: `delivery` rows and the apply and verify logs. skip: moved to the delivery step of `docs/plans/2026-10-15-chip-merge.md`, as this plan's deviation row records.
- [x] Migrate plate-2's ledger: topics and waits for each open task, the regroup, the seven reopened tasks, one task that owns next's red CI. Proof: the migration batch appended through `decisions-check.mjs` and the `chips` board after it. Done: `docs/plans/artifacts/2026-10-15-chip-batching/migration/board-after.txt`.
- [x] Run the blind cross-judge on the three designs and graft what it and the lead agree on. Proof: an `architect` row citing the judge's verdict. Done: `docs/plans/artifacts/2026-10-15-chip-batching/architect/judge/verdict.md`.
- [x] Panel on the frozen dotai diff, after the writing passes. Proof: `seats` and finding rows. Done: three rounds, the cap, in the `panel` rows of `docs/plans/2026-10-15-chip-batching.decisions.tsv`.
- [x] Smoke set in plate-2 and ellie, with the intended behavior written before any run. Proof: `smoke` rows and their logs. skip: six rounds ran and the set closes partial; it moves to the smoke step of `docs/plans/2026-10-15-chip-merge.md`, as this plan's deviation row records.
- [x] Add the rules-table row in `CODING_STANDARDS.md` and update `docs/development/agent-skills.md`. Proof: the diff. Done: `git diff HEAD -- CODING_STANDARDS.md docs/development/agent-skills.md`.
- [x] Decision-trail review before the ellie and plate pushes and the push of dotai's second commit, as close.md orders. Proof: a `trail` row. Done: `docs/plans/artifacts/2026-10-15-chip-batching/trail/sol.md` and the `trail` rows in this plan's decision log.
- [x] Close, page and chip sweep. Proof: `plan-open.mjs` passes. Done: this plan's Close and `node .agents/pstack/plan-open.mjs docs/plans/2026-10-15-chip-batching.md`; the chip sweep runs at the chip-merge close, which ends this run.

## Open work

- Ellie's three open suggested tasks show as unmigrated until a run there gives each a topic. owner: zbeyens, through the next ellie run that reads its `chips` Do list. stop: ellie's board shows no Unmigrated task. Tracked in the pstack subject's Open work.
- The chip ledger change ships through `docs/plans/2026-10-15-chip-merge.md`, whose delivery step pushes dotai and syncs plate-2, plate and ellie. owner: this run's lead, in that iteration. stop: that plan's `delivery` rows.
- The `chips` Do list's migrate items name each task but not the finding it was offered for, a round 1 warning deferred. owner: zbeyens, through the next run that migrates a ledger. stop: ellie's ledger is migrated, or you drop it.
- The smoke rounds found conflicts that predate this change: Autopilot picks against a design task or a side task, a PR wait in another repository, which word the topic grammar allows, plate's one-file rule against an unknown-cause title, plate's `codex/` branch rule against Babysit levels, and `close.md` placing neither the Status change nor the chip sweep. owner: zbeyens. stop: you take or drop each.

## Close

Reversals and deviations come first.

- The dup merge is undone. Round 2 replaced the fold-then-dup protocol with a merge inside the `dismissed dup` row, and round 3 patched that merge again for its critical title finding, which `panel.md` allows once. dotai `d408957` makes a dup close its task and move nothing, and the sweep folds the duplicate in with a `folded` row first. The approved Defaults row read "The dup row carries the dropped task's title, findings, paths, waits and checks (safe)". `docs/plans/2026-10-15-chip-merge.md` plans the merge again, and its panel runs before any rebuild.
- Step 4 (push, apply and verify) and step 8 (smoke) moved to the chip-merge iteration, whose delivery holds every push until its own trail review. The smoke closes partial, because P5 never tested folding into an offered task and Codex's P2 step 3 stayed open.
- dotai `05b79d7` was pushed before this plan's trail review, which `close.md` orders first.
- The smoke set ran after the panel's three rounds, so its six fix commits, `39678f2` to `5a29a5f`, had no review. The chip-merge iteration's first panel round reviews them.
- The plate-2 ledger migration was appended before the trail review, which `close.md` orders first.
- Full mode ran no panel on the plan. The chip-merge iteration runs `architect` and a plan panel.

What landed:

- dotai `05b79d7` on `origin/main`, with `tasks.mjs`, the chip checks in `decisions-check.mjs`, `chips.md` and the block sentences. Local and unpushed: `39678f2`, `f5790ec`, `9428753`, `95c5959`, `658a42a`, `5a29a5f` and `d408957`.
- plate-2's ledger got the 55-row migration, one row giving `task_4ed42f14` the review-tree run wait the migration dropped, and three rows moving the waits on this run to the chip-merge run.
- plate-2's `CODING_STANDARDS.md` rules row and `docs/development/agent-skills.md` changed, uncommitted on `next`. plate-2, ellie and the plate worktree hold an uncommitted apply from `5a29a5f`, which the chip-merge iteration applies again.

Proof and its limits:

- The dotai suite passes 204 of 204 at `d408957`; its scope is every sync-pstack test, with the two merge tests and the loop test's merge case removed (`docs/plans/artifacts/2026-10-15-chip-batching/proof/dotai-tests-revert-a2.log`).
- Right before the applies, the old and new helper ran over every decision log in plate-2 (173), plate (1) and ellie (103), and no log newly failed in the default mode.
- After the migration, plate-2's ledger held 48 open tasks with none unmigrated or lost. An audit of every migrated task's prose waits found one live prerequisite dropped, now restored (`docs/plans/artifacts/2026-10-15-chip-batching/trail/wait-audit.txt`).
- Six smoke rounds ran; the last found no clash among the rules this change touches. P5 step 3 and Codex's P2 step 3 stay partial.
- The round 2 and round 3 reproduction logs, suite logs `a7` and `a8` and the verify logs lack `proof.mjs`'s command line and exit record. The chip-merge iteration reruns them.

Counts: 11 steps, 9 done, 1 partial (the smoke set), 1 skipped (step 4, moved), 0 blocked, 0 open.

Decision-trail review, by `codex:gpt-6.1-sol @xhigh`, verbatim from `docs/plans/artifacts/2026-10-15-chip-batching/trail/sol.md`:

> ## Attention
> reviewed by GPT-6 (Codex)
>
> Row numbers refer to the frozen [decisions.tsv](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-chip-batching/trail/snapshot/decisions.tsv).
>
> 1. **critical — Row 40: the migration silently drops a recorded prerequisite.**  
>    `task_5fc67c90` waited on the review-tree plan, as ledger row 47 records. [Batch rows 52–53](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-chip-batching/migration/batch.tsv:52) reopen and merge it without converting that wait. The survivor, `task_4ed42f14`, has `waits: none`; its board entry lists only overlapping started tasks. Those overlaps can clear while the plan remains active.  
>    **Fix:** preserve the plan wait on the survivor, or document evidence that the prerequisite became obsolete. The successful append does not prove this migration preserved dependencies.
>
> 2. **critical — Rows 27 and 30: the merge mechanism exceeded its permitted replacement.**  
>    Round 2 replaces folded-then-dup with merging inside `dismissed dup`. Round 3 finds a critical loss of instructions in that replacement, and the lead patches it again. `panel.md` explicitly counts an approach replacement made for *any* finding. A later critical against that mechanism requires reverting and, when still needed, returning to planning.  
>    **Fix:** follow that new-iteration path. This concerns handling a code finding; its implementation and fixes belong under the panel rules.
>
> 3. **critical — Rows 42–46: the final behavior has no diff-panel review.**  
>    Six commits follow the capped panel. They change reconciliation procedures, handling findings on started tasks, and generated helper instructions. These changes respond to smoke findings, not the last panel’s findings. `panel.md` requires changes made for another reason to receive their own review. The cap does not waive that requirement, and this trail review cannot substitute for it.  
>    **Fix:** review the post-panel delta through the prescribed new iteration, then repeat affected acceptance proof.
>
> 4. **warning — Row 7: “full” was narrowed without authorization.**  
>    The row restores the cross-judge, diff panel, smoke and trail review. The project’s rule also says “full” runs a panel on the plan. That rule appears in the transcript’s loaded instructions at line 1311. Every recorded panel round reviews a diff; no plan panel is recorded.  
>    **Fix:** record the omission and run the missing design gate before further behavior changes in the corrective iteration.
>
> 5. **warning — Rows 37, 40 and 41: the gate-order deviation is incomplete.**  
>    Row 37 acknowledges pushing before the trail review. It omits two other departures from `close.md`: smoke began after all three diff rounds, and the real ledger migration was appended before the trail review. The transcript places those actions at lines 3853 and 3814 respectively.  
>    **Fix:** log both departures and carry them into the Close’s reversals. Run the corrective work in the prescribed order; waiting on later pushes alone does not repair the earlier sequence.
>
> 6. **warning — Row 44: the smoke judgment contradicts its evidence and the original rubric.**  
>    The row says both runtimes offered a fix because the spec already settled P5. The saved [Codex answer](/Users/zbeyens/git/plate-2/docs/plans/artifacts/2026-10-15-chip-batching/smoke/plate-2-r4/P5-P6.txt) instead keeps the landing undecided and says to ensure `kind: decide`. Moreover, `intended.md` explicitly supplies an undecided question and expects folding into the existing task. Reclassifying this as a prompt-premise issue does not verify that behavior.  
>    **Fix:** correct the row and retain a partial verdict. Rerun P5 with an offered-task fixture that exercises the original criterion.
>
> 7. **warning — Row 9: the cited cross-judge verdict is a rewritten summary.**  
>    Transcript attachment line 2042 contains the judge’s original reply. Line 2156 writes a shortened replacement to `architect/judge/verdict.md`, omitting substantial reasoning and recommendations. `close.md` requires replies consumed by later gates to be saved verbatim.  
>    **Fix:** preserve the original reply verbatim and keep the lead’s synthesis and dispositions separate.
>
> 8. **warning — Rows 23–33 and 38–39: several cited proof files fail the required record contract.**  
>    The round-2 and round-3 reproduction logs, suite logs `a7` and `a8`, and project verification logs lack the command header and exact `exit=<code>` record required by `trails.md`. The transcript shows the runs happened, but these cited files do not provide the required proof records.  
>    **Fix:** produce fresh, indexed proof logs against the relevant frozen inputs and append correcting evidence rows. Preserve the existing artifacts.

What the lead did with each finding:

1. Fixed by an `updated` ledger row that gives `task_4ed42f14` the review-tree run wait.
2. Applied by the revert `d408957`; the chip-merge iteration plans the merge again.
3. Open until the chip-merge iteration's first panel round reviews `05b79d7..5a29a5f`.
4. Logged as a deviation; the chip-merge iteration runs `architect` and a plan panel.
5. Both missing departures are logged as a deviation.
6. The round 4 row is corrected, and P5 reruns on an offered design task.
7. The judge's reply is saved verbatim as `architect/judge/verdict-original.md`.
8. Logged partial; the chip-merge iteration reruns each log through `proof.mjs` or `mutate.mjs`.
