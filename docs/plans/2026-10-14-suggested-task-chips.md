# Suggested tasks you can trust

Status: done: plate-2's synced files wait for the owner's commit on next
Topic: pstack
Playbook: feature

The owner's words: "yes i want to make it part of pstack workflow: well tracked/maintained: should be reviewed / dismiss if conflicting with another one, or already done etc. and i want each chip title to tag "Now: " or "After:" (or pick best 2 words) for those i can run in parallel while current task is running, then those i need to wait the task is done before running those." Then, on the proposed design: "ok go with the new design. also include (high) or (xhigh) effort suggestion: xhigh only for full poteto tasks (like architecture) etc. , high when it's straightforward / the task is explicit enough".

## Brief

### What will change?

Every suggested task says whether you can start it now or after the run, and at what effort. One project list tracks every card, and a check stops two cards you could run together from editing one file.

### What could go wrong?

The agent can only withdraw a card you have not opened, and cannot rename one. A card you started stays listed until you say it finished or you stopped it, so tell the agent when you close one early.

## Teach

A suggested task is a card the agent offers in the app; one click starts it as a new session. Until now the agent offered cards and forgot them, so a card could repeat another, outlive its purpose, or edit the same files as the run.

Now each title starts with Now or After and ends with an effort. Now means you can start it while the run goes on, because no open card or running session writes its files. After names what it waits for. The effort is xhigh for design work and high when the job is spelled out.

Every card lives in one project list, because it outlives the run that offered it. A check refuses a malformed row, a skipped state and a Now card that shares a file with another open card. At each hand-back the agent sweeps the list: it drops cards already done, merges duplicates and moves a blocked Now card to After.

## Main changes

- New shared rule file `.agents/pstack/rules/chips.md` holds the tags, the effort, the ledger, the sweep, the fallback for a runtime without a suggest tool and the Close. The block's Autopilot sentence now says a title tells whether the owner can start the task now or after the run, and a block pointer in the plans section sends the lead to the rule file.
- `decisions-check.mjs append` takes `chip` rows only in `<plans>/suggested-tasks.decisions.tsv`. Each task moves offered, then started, then landed, or is dismissed: `done`, `dup <id>`, `superseded`, `replaced <id>` or `gone` while nobody started it, and `stopped` once the owner did. An offer lists `writes:` paths, and a started row can add more unless another started task writes them. Paths compare by where they point.
- After each batch, `append` refuses a ledger in which a Now task shares a path with an earlier open task or a started one. A replacement keeps the replaced task's place. The whole-log check runs the same test on the ledger's uncommitted rows.
- `decisions-check.mjs chips` prints each open task with its paths, notes started tasks that share a path, and exits 1 naming each blocked Now task.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Tag words | Now and After, short enough for a 60-character title (look) | Parallel and Later | parallel | small |
| Where the record lives | One list for the whole project, beside the plans, since a card outlives its run. The first pick was each run's own log, and the first review round changed it | Each run's own decision log | run log | small |
| Cards on the page | Left off for now: the app already shows them, and the check lists the open ones (look) | A suggested-tasks list on every plan page | cards on page | small |
| Cards made at the close | Tagged Now, since nothing is running then | Tagged After | after at close | detail |
| How a started card ends | Only when it finished or you stopped it, on your word or the session's report, since its session may still be writing | Also as a duplicate or superseded by the agent | close started | small |
| The subject's page | A new page, https://claude.ai/artifact/Ya1nyC64zWj9qTnS1FKKdd, because the old one, https://claude.ai/artifact/Mqb8kAJWvarhH8bTrZSfhd, no longer opens | No published page; read the local one | drop page | detail |
| Which projects sync | The three set-up checkouts: ellie, plate and plate-2 | Also the proof worktrees other runs made | worktrees too | detail |
| Trial before adopting | A read-only smoke in both runtimes, since this adds one rule file and its pointer and does not change which playbook a request gets | Paired baseline-versus-revised trials | full trial | small |

## Steps

- [x] Shared: the rule file, the block pointer, the Autopilot sentence, the ledger check and `chips`, with tests. Proof: each new test fails on the old checker and the whole suite passes. Done: `docs/plans/artifacts/2026-10-14-suggested-task-chips/tests-old-a1.log` fails both, `docs/plans/artifacts/2026-10-14-suggested-task-chips/suite-a4.log` passes 181 of 181.
- [x] Writing: `deslop` and `no-comments` on the checker, `unslop` on the rule and block prose, for the build and for each panel round's fixes. Done: the `writing` rows in this plan's decision log.
- [x] Shared: commit and push dotai. Done: udecode/dotai `5f73481` through `e09d58a` on `main`.
- [x] Sync: apply to ellie and plate-2 and update plate-2's workflow guide sentence on suggested tasks. Proof: `check` reports both in sync. Done: both synced from udecode/dotai `e09d58a`, `docs/plans/artifacts/2026-10-14-suggested-task-chips/apply-r4-plate.log` and `docs/plans/artifacts/2026-10-14-suggested-task-chips/apply-r4-ellie.log`; plate waits under Open work.
- [x] First sweep: retag the suggested tasks this session offered before the rule, and move them to the project ledger. Done: `docs/plans/artifacts/2026-10-14-suggested-task-chips/first-sweep.md` and `docs/plans/suggested-tasks.decisions.tsv`. Its check for tasks already done searched commit subjects only, so it is logged `partial`, and each re-offered brief rechecks its facts against the tree.
- [x] Panel round 1 on udecode/dotai `83b5a48..24ff4f7`: two critical findings applied, the project ledger and the Now overlap on the live ledger. Done: fixes in `ed8b602`.
- [x] Panel round 2 on `24ff4f7..ed8b602`: one critical finding applied, a started task that could never close. Done: fixes in `0486a47`.
- [x] Panel round 3, the last the cap allows, on `ed8b602..0486a47`: one critical finding applied, a started task dismissed while its session still writes. Proof: each new test fails on `0486a47` and the suite passes. Done: `docs/plans/artifacts/2026-10-14-suggested-task-chips/tests-r3-old-a1.log` fails 6, `docs/plans/artifacts/2026-10-14-suggested-task-chips/suite-r3-a1.log` passes 192 of 192.
- [x] Smoke: both runtimes on side findings in plate-2 and ellie, the pivot case, and a started card closed early. Done: `docs/plans/artifacts/2026-10-14-suggested-task-chips/smoke-intended-r2.md`, `docs/plans/artifacts/2026-10-14-suggested-task-chips/smoke-r2-plate-2-a1.txt` and `docs/plans/artifacts/2026-10-14-suggested-task-chips/smoke-r2-ellie-a1.txt`.
- [x] Decision-trail review on the frozen plan, log and shared diff, then ellie's commit and push. Done: `docs/plans/artifacts/2026-10-14-suggested-task-chips/trail-r2/seat-sol.md`, its Attention section below, and ellie's commit on `next`.

## Open work

- Sync plate with udecode/dotai `e09d58a` once its `chore/sync-pstack-v0.9.84` branch lands on `main`, then open its sync PR as plate's delivery answer says. owner: zbeyens. stop: that branch lands, or the next pstack sync covers plate. Tracked in the pstack subject's Open work.
- plate-2's synced files and this plan wait for the owner's commit on `next`. owner: zbeyens. stop: the owner says "commit".

## Proof

- Proof logs sit under `docs/plans/artifacts/2026-10-14-suggested-task-chips/`. The early runs went through `node .agents/pstack/proof.mjs`, which stamps the command line and exit status; the panel rounds' test runs wrote their output straight to the log, and the transcript holds their commands and exit codes.

## Close

Two picks were reversed. The record moved from each run's own log to one project ledger after panel round 1. Round 2 let a started task close as a duplicate or superseded, and round 3 took that back: a started task now ends only as landed or stopped. One slip: the dotai commit `0486a47` went out before its body got its prose pass.

The rule file, the block pointer and sentence, and the checker landed in udecode/dotai `d26751c`, and `e09d58a` fixed the Autopilot sentence the last smoke flagged. Both are synced into plate-2 and ellie. The new tests fail on each earlier checker and pass on `d26751c`, with the whole suite at 192 of 192. Both runtimes smoked the tags, the ledger and the sweep in plate-2 and ellie, read-only.

The smokes prove routing and wording, not a real offer through `spawn_task`, and the last one ran on `d26751c` for the started-task case only. Its one clash, the Autopilot sentence saying an After task waits only for the run, is fixed in `e09d58a`, which ran fast, with no panel. A stopped task's half-written edits stay in the tree, and its re-offer links to it only through its text. The checker cannot see what a session actually writes, only what the ledger says it writes. Two first offers appended at the same moment into a project with no ledger yet can lose one row. Two runs can each free an After task on one path at their close, and the checker then only notes the two started tasks. The three cards started before this rule carry briefs without the tagged title, so their sessions cannot find their own rows by title. A card can be withdrawn only by the session that offered it, so another session's merge logged `task_4e4a90c3` as a duplicate while its card stayed in the queue, until this session withdrew it.

Of the suggested tasks this run owns, `task_afce9573` (After: Fix markdownLines hiding text after code) is free to start once this plan closes. `task_3c30e34e` (After: Clarify when a hillclimb miss is a pivot) writes inside the same dotai folder, so it waits for `task_afce9573`. `task_79cf7afd` (Now) landed as plate commit `5d81ff4ed6`.

### Attention

reviewed by gpt-6.1-sol, on frozen tree `e0b5585`; the full answer is `docs/plans/artifacts/2026-10-14-suggested-task-chips/trail-r2/seat-sol.md`.

- Concurrent appends: two first offers into a project with no ledger can lose one row, which `chips` cannot see. Kept as a limit above.
- `task_4e4a90c3`: another session logged it as a duplicate without withdrawing its card. This session withdrew it.
- Freed After tasks: two runs can free After tasks on one path, and readiness is not recorded. Kept as a limit above.
- Exact-title lookup: the three cards started before this rule have untagged briefs. Kept as a limit above.
- Smokes: the round 2 smokes ran on `0486a47`. S4 ran again on `d26751c` and matched in both runtimes, `docs/plans/artifacts/2026-10-14-suggested-task-chips/smoke-r3-plate-2-a1.txt`, and the Defaults trial row no longer says routing is unchanged.
- First sweep: its check for tasks already done stays `partial`, and its step now says so.
- Proof provenance: the Proof section no longer claims every command ran through `proof.mjs`.

