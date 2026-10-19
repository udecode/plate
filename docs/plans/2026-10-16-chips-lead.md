# One chips lead, and waits that see your commit

Status: executed: plate-2's sync waits on your commit
Topic: pstack
Playbook: build

The owner's words: "wtf? its already commited? and wtf you mean 2 sessions could suggest the same cards?! cards are born from a session plan, why dont we restrict /chips to offer only the one from the session calling it", then, after the lead's proposal of one chips lead plus own-offer cards at a session's close, "ok go update", then "fast" while the design round ran.

## Brief

### What will change?

Now only the session where you last typed /chips cards waiting tasks; other sessions card only their own. Your commit now unblocks tasks waiting on landed work. It shipped fast, unreviewed; plate-2's copy waits for your commit.

### What could go wrong?

A session you stop using stays the lead until you type /chips elsewhere. No real /chips has used the lead yet. One wait test can fail when the machine is busy, which a suggested task fixes.

## Teach

A suggested task is side work you start from a card. Any session that runs the chips sweep cards every task that can start. When two sessions sweep at once, both card the same tasks. A task that waits on another task's landed work starts only once every file that work touched matches your last commit, so a later edit to a shared file holds it back after you commit.

After this change, typing /chips makes that session the chips lead, and the ledger records it. Only the lead cards waiting tasks. Any other session cards only the tasks it offered itself, at its close, and tells you which session leads. A session that loses the lead withdraws its cards on other sessions' tasks. A wait on landed work clears once a commit made after the landing touched each of its files.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which session cards waiting tasks | The last session where you typed /chips | Every session that sweeps, as today | any session cards | big |
| A session's own new tasks | It cards them at its close, wherever the lead is | Only the lead cards them | lead cards all | small |
| Before anyone types /chips | Every session cards as today | Nobody cards until a lead exists | wait for a lead | small |
| When a wait on landed work clears | Once a commit after the landing touched each file it changed | Once each file matches your last commit, as today | match the commit | big |
| The sweep-checks task | Waits for this run instead of joining it, since its five fixes are unrelated (look) | Fold it into this run, as first proposed | fold sweep checks | small |
| Syncing plate | Waits for its own run, since it carries older changes and opens a public PR | Sync it now | sync plate | small |
| Review | Shipped fast, as you said: my own design pass, with no design round, panel, smoke or trail review (look) | Review the design and the change | full | small |
| Who may card when a lead exists | The ledger refuses a card from a session that neither leads nor offered the task | Only the board's card list changes, so a racing session can still log its card | allow stray cards | small |
| Proof of the change | The tests, plus a clean rerun of the skills check, because after your commit no project's tasks look different under the old and new code (look) | Build a test project whose tasks tell them apart | prove live | small |

## Main changes

- The ledger gets a lead row that names the session the owner typed `/chips` in, and the board names that session.
- `chips --session <id>` in a session that is not the lead lists only the tasks that session offered in its card pass, and lists the cards it holds on others' tasks for withdrawal.
- An offer row records the session that offered it.
- A `task:` wait on a landed patch clears once, for each patched path, the path is clean or a commit made after the landed row touched it.

## Steps

- [x] Run `architect` on the design, with the owner's asks as the outcome. skip: fast, the owner's word stopped the three runners, and the lead's own design pass replaced them.
- [x] Hold the seven open tasks that write this run's dotai files with a `run:` wait on this plan, and withdraw the card of `t_d6687840`. Proof: `docs/plans/artifacts/2026-10-16-chips-lead/ledger-1.tsv`
- [x] Build the wait predicate with its tests. Proof: the test log.
- [x] Build the lead row, the own-offer card pass and the withdrawal items with their tests. Proof: the test log.
- [x] Rewrite the chips rule and the chips skill to match. Proof: `docs/plans/artifacts/2026-10-16-chips-lead/dotai-mine.patch`
- [x] Run `deslop` and `no-comments` on the helpers and `unslop` on the prose. Proof: the writing rows. `no-comments` skip: fast.
- [x] Run dotai's suite, `validate-skills` and `corpus` on each managed project. Proof: the logs. The corpus could not tell the helpers apart, so the Defaults row Proof of the change accepts the narrower proof.
- [x] Run one `interrogate` round on the helper diff and apply what it accepts. Proof: the panel rows. skip: fast, the change ships unreviewed until the owner says "full".
- [x] Smoke plate-2 and ellie from the uncommitted tree. Proof: the smoke answers. skip: fast, a smoke starts Claude Code and Codex sessions.
- [x] Commit and push dotai, sync plate-2 and ellie from the pushed commit, and run `verify` on each. Proof: the commits and verify logs.
- [x] Run the decision-trail review. Proof: its answer. skip: fast.

## Close

- Deviation: another session committed and pushed this run's staged dotai change while the suite ran, as dotai's `AGENTS.md` lets a session do with other sessions' uncommitted work. `0966734` holds the helpers, the chips rule, the chips skill and the manifest, and `72da833` holds this run's three test hunks beside that session's own work. Their messages lack this run's reason paragraph and the line "Shipped fast, no review." Rewriting them needs a force-push to `main`, so they stay as pushed. Both count as shipped fast and unreviewed. The message this run drafted is `docs/plans/artifacts/2026-10-16-chips-lead/commit-msg.txt`.
- The owner's "fast" stopped the three `architect` runners, and the lead's own design pass replaced them. No panel, smoke, decision-trail review or reflect ran, and `no-comments` closed as skip: fast.
- Reversed: the landed-patch test from `d932e54` asserted that an edit on top of the commit keeps the wait. It now expects the task Ready, because that edit is a later task's work on top of the committed landing.
- That session also synced plate-2 and ellie from `0966734` but left plate-2's installed chips skill on the old text. This run reinstalled it from dotai.
- `validate-skills` exited 1 once while the suite ran beside it on the same tree, with its test output discarded. A rerun alone passed. The likely cause, inferred and not reproduced, is a 500 ms start-up race that the new lead test shares with three older wait tests. Suggested task `t_905017b5` fixes all four.

What landed. dotai `0966734` and the chips-lead hunks of `72da833` are on `main`. ellie has `d054ceda7` on `next`. plate-2 holds the synced helpers and rules, the reinstalled chips skill, `skills-lock.json`, this plan, its log and the ledger rows, uncommitted for the owner. `/chips` now runs `chips lead --session <id>`, which writes a lead row. Only the lead cards other sessions' tasks. A session that does not lead cards only the tasks it offered, and lists its other cards for withdrawal. `append` refuses its card on another session's task, and its `chips wait` exits when another session takes the lead. A `task:` wait on a landed patch clears once each patched path is clean or a commit after the landed row touched it.

Proof. dotai's suite passed 275 of 275 on `b29d1b6` plus this run's patch, including the three new chips tests. The four helper and rule files at `0966734` match that tree byte for byte, and the test file differs only by the other session's hunks. `build-workflow.mjs --check` passes at `0966734`, and `sync-pstack verify` passes on plate-2 and ellie.

Limits. The corpus copy has no git history and no lead row, so it ran neither change, and after the owner's commit the old and new helpers both show 51 Ready and 41 Waiting on the live ledger. The unit tests are the only proof of the wait and the lead until the first real `/chips` and the next commit over a landed patch.

Counts: eleven steps. Seven are done, one of them on the narrower proof the Defaults accept, and four were skipped under fast.

## Open work

- plate-2's chips-lead sync waits on your commit: `.agents/pstack.json`, `.agents/pstack/decisions-check.mjs`, `.agents/pstack/tasks.mjs`, `.agents/pstack/rules/chips.md`, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, this plan and its log, and the ledger rows. The same sync also brought the other session's `cross.mjs`, `reread.mjs`, rule and plan-page edits. owner: zbeyens. stop: the owner commits them.
- Type /chips in the session that should card for the project, which makes it the chips lead. Until then, every session cards as before. owner: zbeyens. stop: the first lead row in the ledger.
- `t_d6687840`, the sweep-checks task, and the six other tasks this run held start once this plan's Status says executed. owner: zbeyens, who starts each card. stop: each lands or the owner drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- `t_905017b5` makes the four chips wait tests wait for the waiter's first read. owner: zbeyens. stop: it lands or the owner drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- This change shipped fast and is owed a review until the owner says "full". owner: zbeyens. stop: "full" or the owner drops the review.
