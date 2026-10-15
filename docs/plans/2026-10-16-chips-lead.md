# One chips lead, and waits that see your commit

Status: planning: the design round runs
Topic: pstack
Playbook: build

The owner's words: "wtf? its already commited? and wtf you mean 2 sessions could suggest the same cards?! cards are born from a session plan, why dont we restrict /chips to offer only the one from the session calling it", then, after the lead's proposal of one chips lead plus own-offer cards at a session's close, "ok go update".

## Brief

### What will change?

Only one session cards the waiting tasks: the last one where you typed /chips. Other sessions card only tasks they offered. A task that waited on landed work starts once you commit it, even if later work touched the same files.

### What could go wrong?

A session you stop using stays the chips lead until you type /chips elsewhere. A partial commit of a file can clear a wait early.

## Teach

A suggested task is side work you start from a card. Any session that runs the chips sweep cards every task that can start. When two sessions sweep at once, both card the same tasks. A task that waits on another task's landed work starts only once every file that work touched matches your last commit, so a later edit to a shared file holds it back after you commit.

After this change, typing /chips makes that session the chips lead, and the ledger records it. Only the lead cards waiting tasks. Any other session cards only the tasks it offered itself, at its close, and tells you which session leads. A lead that lost the role withdraws its cards. A wait on landed work clears once a commit made after the landing touched each of its files.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which session cards waiting tasks | The last session where you typed /chips | Every session that sweeps, as today | any session cards | big |
| A session's own new tasks | It cards them at its close, wherever the lead is | Only the lead cards them | lead cards all | small |
| Before anyone types /chips | Every session cards as today | Nobody cards until a lead exists | wait for a lead | small |
| When a wait on landed work clears | Once a commit after the landing touched each file it changed | Once each file matches your last commit, as today | match the commit | big |
| The sweep-checks task | Waits for this run instead of joining it, since its five fixes are unrelated (look) | Fold it into this run, as first proposed | fold sweep checks | small |
| Syncing plate | Waits for its own run, since it carries older changes and opens a public PR | Sync it now | sync plate | small |

## Main changes

- The ledger gets a lead row that names the session the owner typed `/chips` in, and the board names that session.
- `chips --session <id>` in a session that is not the lead lists only the tasks that session offered in its card pass, and lists the cards it holds on others' tasks for withdrawal.
- An offer row records the session that offered it.
- A `task:` wait on a landed patch clears once, for each patched path, the path is clean or a commit made after the landed row touched it.

## Steps

- [ ] Run `architect` on the design, with the owner's asks as the outcome. Proof: the synthesis in the run directory.
- [ ] Hold the seven open tasks that write this run's dotai files with a `run:` wait on this plan, and withdraw the card of `t_d6687840`. Proof: the ledger rows.
- [ ] Build the wait predicate with its tests. Proof: the test log.
- [ ] Build the lead row, the own-offer card pass and the withdrawal items with their tests. Proof: the test log.
- [ ] Rewrite the chips rule and the chips skill to match. Proof: the dotai diff.
- [ ] Run `deslop` and `no-comments` on the helpers and `unslop` on the prose. Proof: the writing rows.
- [ ] Run dotai's suite, `validate-skills` and `corpus` on each managed project. Proof: the logs.
- [ ] Run one `interrogate` round on the helper diff and apply what it accepts. Proof: the panel rows.
- [ ] Smoke plate-2 and ellie from the uncommitted tree. Proof: the smoke answers.
- [ ] Commit and push dotai, sync plate-2 and ellie from the pushed commit, and run `verify` on each. Proof: the commits and verify logs.
- [ ] Run the decision-trail review. Proof: its answer.

## Open work

- `t_d6687840`, the sweep-checks task, runs after this plan lands. owner: zbeyens, who starts its card. stop: it lands or the owner drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
