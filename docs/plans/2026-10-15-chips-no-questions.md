# A chips sweep settles started tasks itself

Status: executed; plate-2's sync waits on your commit
Topic: pstack
Playbook: feature

The owner's words: "wtf dont ask quesitons, repair the rule". A `/chips` sweep had ended by asking whether `task_f1475754`'s session still ran, because the chips skill told it to ask and the chips rule logged a stop only on the owner's word.

## Brief

### What will change?

A chips sweep no longer asks you whether a started task's session still runs. It looks the session up, records the task as landed or stopped, or leaves it open and says why.

### What could go wrong?

A task can stay open longer than it should, when its session can't be found or left work behind. Say "drop" and the task's id to close it. No real session has been closed as stopped yet.

## Teach

A started task is a suggested task that some session took up. Until now a sweep could not tell whether that session still ran, so it asked you, and only your word could close the task as stopped.

Now the session that picks up a task records its own id in the task list. A sweep looks that session up in the desktop app and reads what it last said. Once the session is archived, a commit or a message saying it delivered the change marks the task landed. A session that left nothing behind marks it stopped. A session still running, a patch nobody applied, or uncommitted edits, in the project or in the session's own worktree, keep the task open.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| When a sweep may stop a task | Only once its session is archived and left no patch or edits anywhere | Also when the session cannot be found | stop unknown | small |
| A runtime that cannot look sessions up | Leave the task open and name the word that closes it | Ask you | ask me | small |
| Older started rows with no session named | Find the session that opened from the card and record it | Leave them unnamed | skip old | detail |
| Which projects got the change | plate-2 and ellie, the two on the current shared copy | Also the ten older checkout copies | sync all | detail |
| Review | Five read-only test runs in both apps and a review of the log by another model, no panel | A review panel on the script change | panel | small |
| The subject page link | A new page, because the old link no longer opens (Ya1nyC64zWj9qTnS1FKKdd, now 4oADP3X2tDnUYqahRJ2aW7) | Drop the new page and restore the old link | old page | detail |

## Main changes

- A `started` row takes `session:`, naming the session that runs the task, where the runtime's session tool gives that id. The chips skill's Start mode and every card brief ask for it; `.agents/pstack/tasks.mjs` keeps it and shows it on the board's Started line and in `chips stale`.
- `chips --session <id>` adds a check item for each started task another session runs: look that session up, or find the one whose transcript opens with the task's card prompt when no row names one.
- `chips.md` counts a task `landed` when a commit holds the change, its session reports it delivered the change as the Delivery rule says, or the owner says so. It logs `dismissed stopped` only for an archived session with no commit, no delivery report, no patch and no uncommitted edit on the task's paths in this checkout or the session's own worktree, or on the owner's word. The sweep never asks whether a session runs; a task that stays started names the owner's "drop <id>", and Drop logs `dismissed stopped` for a started task.
- The chips skill's sweep handles those check items, logs `landed` when a commit holds a started task's change, and its report asks nothing.

## Steps

- [x] Settle `task_f1475754` without asking. Proof: its `landed` ledger row, from commit `422564e6f6` and its archived session's last report.
- [x] Edit the helper, rule and skill in dotai, with a test that the old helper fails. Proof: dotai `8654ffa`; the `built` and `verify` rows.
- [x] Run the writing passes. Proof: the `writing` rows in `docs/plans/2026-10-15-chips-no-questions.decisions.tsv`.
- [x] Diff the old and new helper over plate-2's and ellie's ledgers before each apply. Proof: `docs/plans/artifacts/2026-10-15-chips-no-questions/corpus.sh` and its `verify` rows.
- [x] Push, sync, verify and smoke, and land each clash a smoke or the trail review names as a new commit. Proof: dotai `6d4ef15`, `eb11dc5`, `51c8229` and `7ac402f`; the `smoke` and `deviation` rows.
- [x] Deliver: ellie committed and pushed, plate-2 left for your commit. Proof: ellie `68e757f6d` and `ec9c59eb8`; the `delivery` rows.
- [x] Run the decision-trail review and reflect. Proof: the `trail` and `reflect` rows.

## Close

- Reversed: the chips skill's step that asked the owner whether a started task's session still ran (added in dotai `9b9f816`, a fast commit, not a reflect lesson), and `chips.md`'s `stopped` that only the owner's word could log (from `0486a47`, a panel fix).
- The repair took five dotai commits instead of one. Each smoke round, then the trail review, found a hole in the new text: an unknown session id read as gone (`6d4ef15`), two tests for landed that disagreed (`eb11dc5`), a finished patch or leftover edits stopped anyway (`51c8229`), and edits in the worker's own worktree unseen, a Start step that needed a session tool, a search that found the wrong session and no word to close a stuck task (`7ac402f`). No panel ran on the helper change; t_07a09b83 proposes one in Lesson mode.
- ellie was pushed at `68e757f6d` before the decision-trail review, and reflect ran before it, both against the close order. The run began as a Lesson-mode fix without a log; this plan and its log were written at the close.

What landed. dotai `8654ffa` to `7ac402f` changed `skills/chips/SKILL.md`, the shared `rules/chips.md`, `tasks.mjs` and its test. plate-2 holds the sync, the reinstalled chips skill and its ledger rows uncommitted. ellie has `68e757f6d` and `ec9c59eb8` on `next`. `task_f1475754` is `landed`, which clears `task_4505cc97`'s wait. This session withdrew five of its own cards at a peer session's request, carded `t_bffdfc1c` and offered four tasks.

Proof. The dotai suite passed 259 of 259 at each commit, and the new started-session test fails on the helper from before this run (`old-helper-a1.log`, `exit=1`). The old and new helpers differ over both live ledgers only by the new check items. `sync-pstack verify` passed on both projects at `7ac402f`. In round 5 no runtime asked, each stuck task named "drop <id>", and the CLI start logged `started` without `session:`.

Limits. The smokes ran the Claude Code CLI, which has no desktop session tool, so they prove routing and that nothing asks, not the lookup. The desktop lookup ran live only for `task_f1475754` (landed) and for `t_dcc41973` and `task_7deb6a75` (sessions not archived). No archived session that left nothing behind existed, so the stop path has no live run. Codex and the CLI cannot look sessions up, so a task they start stays open until "drop <id>". In ellie's shared checkout, another session's edit on the same paths also keeps a task open.

Older conflicts the smokes named, untouched here: the chips-skill plan's Open work still asks about `task_f1475754`, now settled; `append` lets `started` and `landed` rows carry untracked tokens such as `proof:` and `commit:`; Start checks readiness before its `started` row while `chips.md` checks after; and the Git rule's copy before a first edit precedes the `started` row.

Decision-trail review, reviewed by gpt-6.1-sol at xhigh: four warnings, no critical.

- The automatic stop was unproved on the desktop and blind to a worker's worktree. `7ac402f` adds the worktree, and the stop claim is narrowed in Limits.
- ellie was pushed before the review, and the plan ticked review and reflect before their rows existed. Both are logged as deviations, and the rows are written.
- Start mode required `session:` with no session tool. `7ac402f` makes it conditional, and the round-5 CLI start shows it.
- Ten managed checkouts stayed unsynced. `t_20f7cd58` syncs or retires them.

Reflect, one Opus reviewer over the three lenses. No lesson applied as a reflect lesson. Its Tooling 2 and Divergent 2 named defects in this run's new text, which landed in `7ac402f`. Backlog went to the ledger as `t_d6687840` (the sweep's check items and landed evidence) and `t_07a09b83` (Lesson-mode gates). Rejected: Judgment 1, which the Improve the workflow rule already covers; Judgment 3, which needs no change; Judgment 4, which `51c8229` covers; and Divergent 6, because `append` cannot tell whether the appending runtime has a session tool.

Counts: seven steps, all done.

## Open work

- plate-2's sync waits on your commit: `.agents/pstack.json`, `.agents/pstack/rules/chips.md`, `.agents/pstack/tasks.mjs`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, this plan and its log, and the ledger rows. owner: zbeyens. stop: the owner commits them. Tracked in the pstack subject file.
- Four suggested tasks from this run: `t_d6687840` Tighten the chips sweep's check items and landed evidence, `t_07a09b83` Add the chips lesson run's process lessons to sync-pstack's Lesson mode, `t_591359ab` Decide who applies a card session's patch and when its waits clear, and `t_20f7cd58` Sync or retire the managed checkouts that lag the shared source. owner: zbeyens. stop: the owner starts or drops each. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
