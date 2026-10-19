# A chips skill you and pstack both call

Status: executed
Topic: pstack
Playbook: feature

The owner's words: "do we have a skill that sync chips ?? should we name /chips sync -, /chips review etc. 100% algined with pstack. some could be stale etc. suggest a complete chips skill, integrated into pstack but also invokable by me", then "go fast", then "i just want one command to review/sync/suggest me all prev tasks to latest". No skill ran chips. The rule file said when, the helper printed the board, and nothing looked for stale tasks or for one question split across topics.

## Brief

### What will change?

Typing chips brings old tasks up to date. It drops fixed or overtaken ones, fixes wrong paths, merges tasks that ask the same thing, suggests what can start and says what changed. pstack runs a quick version at each hand-back.

### What could go wrong?

It ships fast, with no review. A sweep could drop a task you still want. You can ask for it back, and the ledger checks still refuse a bad batch.

## Teach

Chips are the side tasks agents suggest, kept in one ledger per project. Until now an agent read a long rule file at the right moments and ran a helper by hand. The chips skill is now the one entry point. Its sweep runs the same rule, and a new helper command gives it facts. A stale report prints, for each open task, the paths it writes that were deleted or never existed, the commits that touched them since the offer, its PR waits and its age. The sweep judges which tasks answer one question from their briefs, because paths alone do not show it.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| The one command's name | Plain chips, whose mode is Sweep, the word the rule and log rows use | A chips sync mode, a name sync-pstack already uses | chips sync | small |
| Where the rule text lives | The chips rule file stays the law and the skill runs its modes, as plan-page runs the pages rule | Move the rule into the skill | rule in skill | small |
| Card prompts | Unchanged, so a card works without the skill installed | Shrink each prompt to the start mode | short cards | detail |
| Review | Fast, on the owner's word | Full poteto | full | big |

## Main changes

- dotai `skills/chips/SKILL.md` holds four modes. Plain `/chips` sweeps, and `offer`, `start` and `drop` act on one task. Each runs the existing rule in `chips.md` and the existing helper.
- `decisions-check.mjs chips stale` prints facts per open task for the sweep: write paths deleted since its offer or missing, commits touching its paths since its offer, its PR waits' states, its age and the session holding its card.
- The block's Suggested tasks bullet loads the skill, runs Offer and Drop, and runs a quick sweep at each hand-back.

## Steps

- [x] Build the skill and `chips stale` in dotai, each helper behavior with a test that fails at `c1e95b4`. Proof: the dotai suite through `proof.mjs` and a `built:` row.
- [x] Run `deslop` and `unslop`. Proof: a `writing` row.
- [x] Push dotai, apply plate-2, ellie and the plate worktree, install the skill in each, and smoke a typed `/chips` and a plain request on both runtimes. Proof: `verify` and `smoke` rows.
- [x] Run `/chips` on plate-2 and report what it logged. Proof: the ledger rows it appended.
- [x] Commit and push ellie's sync, push the plate worktree to PR 5166's branch and update its body, and leave plate-2 uncommitted. Proof: `delivery` rows. Done: ellie 41889a279 and the PR 5166 branch 101c1658ca.
- [x] Close and page. Proof: `plan-open.mjs` passes.

## Close

Shipped fast with no review, on the owner's "go fast". Typing `/chips` now brings every old suggested task up to date in one command. The owner first asked for separate board, review and sweep modes, then said "i just want one command to review/sync/suggest me all prev tasks to latest". So dotai `9b9f816` merged them into one sweep. That matches `chips.md`, whose Sweep already logs dismissals and dups without asking.

- Landed in dotai `b8a733a` and `9b9f816`. The skill has four modes: plain `/chips` sweeps, and `offer`, `start` and `drop` act on one task. `chips stale` reports per task the paths deleted since its offer, the paths it names that never existed, the commits on its paths, its closed PR waits and its card. The block's Suggested tasks bullet runs Offer, Drop and a quick sweep at each hand-back.
- Proof. The dotai suite passes 256 tests, and the new `chips stale` test fails at `c1e95b4`. `sync-pstack verify` passed on plate-2, ellie and plate-5166-sync at `b8a733a`, and `check` reports all three in sync at `9b9f816`. The smoke loaded the skill on both runtimes for a typed `/chips` and a plain stale question. The merged sweep ran live on plate-2's ledger and logged an `uncarded` row for the archived browser drift session and three `updated` rows for paths the offers named wrongly. It also re-carded `task_afce9573`.
- Limits. The smoke judged `b8a733a`, before the merge. The merge's proof is the live sweep, not a smoke. Commit counts in `chips stale` are noisy for tasks that write whole directories, so the sweep judges each flagged task from its brief.
- Deviations. The Overlaps board section was dropped because path overlap paired 299 plate-2 tasks. Board, Review and Sweep merged on the owner's word.
- Delivery. ellie's sync is pushed on `next` as `41889a279`, the PR 5166 branch as `101c1658ca`, and the PR is retitled to `9b9f816`. plate-2 stays uncommitted for the owner.
- Counts. Six steps, all done.

## Open work

- `task_f1475754`, Fix End on an empty line moving the caret down, is the one started task, and seven tasks wait on it. owner: zbeyens. stop: you say whether its session still runs, and the next sweep logs `dismissed stopped` or leaves it.
- Review the fast commits. owner: zbeyens. stop: you say "full" to review dotai `b8a733a` and `9b9f816`, or drop it.
