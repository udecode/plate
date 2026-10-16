# Suggested tasks run at the effort they need

Status: executed: shipped to dotai, Ellie and PR 5166; plate-2 waits on your commit
Topic: pstack
Playbook: build

The owner's words: "harsh honnest feedback do we really need xhigh for suggested tasks, except verdict ones ? we have like 20 suggested tasks lol all in xhigh would kill the usage ? in general we want the plan to be xhigh (already done mostly in the sgugestion?) and high in execution", then "ok go" after the proposal, then "fast mode".

## Brief

### What will change?

Only design questions and bugs nobody has traced get xhigh now, so eleven tasks tagged too high run at high. It shipped to dotai, Ellie and PR 5166, and plate-2 waits on your commit.

### What could go wrong?

My first claim was wrong, because cards already started at their tagged effort. A hard fix now tagged high may need more, and nothing raises it. Lowering a running card session hasn't happened for real yet.

## Teach

Each suggested task says how hard to think, high or xhigh, and its card starts the session at that level. So the tag sets the cost. 9 of 19 ready tasks had xhigh, and only 2 were design questions.

Now xhigh is only for a design question, or a bug or slowness nobody has traced yet. A task whose finding already names the cause runs at high, since that thinking is done. A ledger row can lower a task tagged too high, and the lead checks the tag before each card and in each full sweep.

A card session can still start too high, if the tool can't set effort or the task was lowered after its card went up. The lead lowers a card session that still runs at its card's level, and a level you set stays. A session can't lower itself, so one running too high tells you.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which tasks get xhigh | Design questions, and bugs or slowness nobody has traced (look) | Any task that needs design judgment, as before | judgment tasks | big |
| Sessions already running | Ten running card sessions with a known cause run at high, five of them lowered by me; the other 11 stay at xhigh | Leave every running session as it started | restore efforts | big |
| A design question's build | Stays at xhigh through its build | Drop to high once its plan is written | high after plan | small |
| Retagging the backlog | Open tasks nobody started, now; the rest at their next card | Retag only at the next card | retag later | small |
| Effort on a carded task | A task with a card can still get a new effort, since that changes no work | Pull the card first, as for other changes | withdraw first | detail |
| Raising effort | The lead only lowers a session still at its card's level; a level you set stays | Also raise a session to xhigh | raise too | small |
| Where the build runs | In a copy of dotai, merged in once the other session landed, since it held the shared test file | Edit dotai right away | edit now | detail |
| Smoke scope | Only plate-2, in both runtimes, since every project gets the same rules and the other two ledgers read the same | Every project | smoke all | small |
| Paired trial | Skipped, since the change moves effort tags, not how a task gets done | Run a before and after trial | effort trial | detail |

## Main changes

- `chips` reads a task's effort from its `effort:` token first, then its title and covered titles; a design question is always xhigh. `updated` takes `effort: high` or `effort: xhigh`, and a fold still only raises it. A dup that brings in an xhigh task raises the kept task instead of copying a lower effort.
- The brief, the board and a card's title drop a stored ` (xhigh)` when the task's effort is high.
- `append` takes an `updated` row that changes only `effort:` on a carded task.
- A task records its effort when its card lands. `chips wait --session <id>` also exits when a task this session carded logs `started`, and names that session with its card's effort and its brief's.
- chips.md's Title rule names the two cases that get xhigh, and its Cards rule checks each task's effort before its card and again in each full sweep while it holds one. The chips skill's step 7 lowers a started session to its brief's level while it still runs at its card's effort, and a card session above its brief tells the owner, since no session can lower its own effort.

## Steps

- [x] Record the intake base, the wrong premise and the five lowered sessions. Proof: the `plan` and `build` rows.
- [x] Build in the export: `tasks.mjs`, `decisions-check.mjs`, `rules/chips.md` and `skills/chips/SKILL.md`, with tests that fail at dotai `eb75824`. Proof: the export suite through `proof.mjs` and an old-helper run of the new tests.
- [x] Writing passes: `deslop` on the helper diff, `unslop` on the rule, skill and plan prose; `no-comments` skip: fast. Proof: `writing` rows.
- [x] Once t_07a09b83 lands, merge the five files into dotai and fix every text that still teaches the wider rule. Run `node scripts/build-workflow.mjs`, the suite, `scripts/validate-skills` and `corpus`, then smoke both runtimes on plate-2, rendered from the uncommitted tree, against a baseline on the old rules. Commit and push with "Shipped fast, no review." Proof: `verify`, `smoke` and `delivery` rows. Done: dotai 104506e; docs/plans/artifacts/2026-10-15-chip-effort/proof/suite-e-a1.log; docs/plans/artifacts/2026-10-15-chip-effort/smoke/new-e.log.
- [x] Sync: apply plate-2, ellie and plate-5166-sync from the pushed commit, rerun `corpus --installed` on each right before its apply, verify each and reinstall the chips skill. Proof: `verify` rows. Done: docs/plans/artifacts/2026-10-15-chip-effort/proof/corpus-sync-plate-2-a1.log; docs/plans/artifacts/2026-10-15-chip-effort/proof/corpus-sync-ellie-a1.log; docs/plans/artifacts/2026-10-15-chip-effort/proof/corpus-sync-plate-5166-sync-a1.log.
- [x] Retag the open tasks nobody started, update `CODING_STANDARDS.md` row 97, deliver ellie and plate-5166-sync, and leave plate-2 uncommitted. Proof: the ledger rows and `delivery` rows. Done: docs/plans/artifacts/2026-10-15-chip-effort/rows-retag.tsv; ellie 76e210ef6; plate-5166-sync a10d78d3ff.
- [x] Close, fold, page and a chips sweep. Proof: `plan-open.mjs` passes. Done: https://claude.ai/artifact/4oADP3X2tDnUYqahRJ2aW7; `node .agents/pstack/plan-open.mjs docs/plans/2026-10-15-chip-effort.md`.

## Close

Reversals and deviations.

- My first answer to the owner was wrong. I said a card always runs at the lead's effort. The session tool showed the five high-labeled sessions running at high, so a suggest tool that takes an effort already passes the brief's level. The plan kept the lowering step only for a card session that starts above its brief.
- Steps 4 and 5 changed mid-run. They were approved as "Once t_07a09b83 lands, copy the four files into dotai, add the tests to the shared test file, run `node scripts/build-workflow.mjs`, the suite and `scripts/validate-skills`, then commit and push" and "Sync: apply plate-2, ellie and plate-5166-sync from the pushed commit, verify each, run the old and new helper over each ledger, and smoke both runtimes on plate-2 with a card pass that meets an inflated tag". t_07a09b83 landed dotai 587c117, which gates Lesson mode before its one push. So the smoke moved before the push, rendered from the uncommitted tree against a baseline, together with the helper's `corpus` and a retired-policy search.
- The change grew past the approved three parts. Five smoke rounds found four clashes inside the changed rules. A task now records its effort when its card lands and `chips wait` prints it, so the lead lowers only a session still at its card's effort. That changed the Raising effort default from "the lead only lowers". chips.md's Cards rule holds the effort check before each card and in each full sweep. The `(xhigh)` mark follows the level before the `maxEffort` cap. A card session above its brief tells the owner.
- The retired-policy search fixed five texts that still gave xhigh to any task needing design judgment, among them plate-2's `docs/development/agent-skills.md`.
- Two process slips. The ellie commit body went out before its `unslop` pass, which then changed nothing. After the compaction I changed two wait tests before rereading the tests rule, then checked them against it.
- Fast mode skipped the helper panel, the decision-trail review this shared-script change would otherwise run, `no-comments` and reflect.

What landed.

- dotai 104506e on `main` holds `tasks.mjs`, `decisions-check.mjs`, `rules/chips.md`, the chips skill, five new tests, two changed ones and the manifest.
- ellie 76e210ef6 on `next`. plate-5166-sync a10d78d3ff on PR 5166's head, which also brings dotai 2b88f9c. The PR's title and body name 104506e.
- plate-2 keeps its share uncommitted for the owner, as Open work lists.
- In plate-2's ledger, 11 open fix tasks nobody started now run at high, because each finding names its cause or its exact fix. Six whose cause nobody has located stay at xhigh. `t_074200fe` was offered for the piped-output cut below.

Proof and its limits.

- dotai's sync-pstack suite passes 272 of 272 on the pushed tree, and the four effort tests failed on the eb75824 helpers.
- The helper's `corpus` showed no difference in plate-2, ellie and plate-5166-sync before the push and right before each apply. Round three's one ellie difference came from `decisions-check --all` printing about 139 KB to a pipe and exiting before the pipe drained. The shorter side is an exact prefix cut at 65,573 bytes, and the same data read whole in rounds four and five.
- The round-five smoke on plate-2 matched the intended behavior in Claude Code and Codex. It ran read-only, so it shows what each runtime would do, not a real lowering. ellie and plate-5166-sync were not smoked, per the Defaults row.
- `check` and `verify` pass in all three projects, and each installed chips skill matches dotai.
- No live card session has started from a lowered card yet, so lowering through `chips wait` is unproven on a real session. Only the lead that offered a card lowers its session. A session that lead does not watch only tells the owner.

Counts: 7 steps, 7 done.

## Open work

- plate-2's chip effort sync waits on your commit: `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/tasks.mjs`, `.agents/pstack/rules/chips.md`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, `CODING_STANDARDS.md`, `docs/development/agent-skills.md`, this plan and its log, and the ledger rows. owner: zbeyens. stop: the owner commits them.
- The first live lowering: `chips wait` names a session started from a card whose task was lowered after its card, and its lead lowers it. owner: the lead of the next chips sweep. stop: the first `chips wait` exit that names a card session above its brief.
- `t_074200fe` keeps `decisions-check` output whole when piped, in the helper and in `corpus`. owner: zbeyens. stop: the owner starts or drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
