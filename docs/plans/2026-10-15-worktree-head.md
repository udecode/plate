# Worktree sessions start from next

Status: executed: plate-2 waits on your commit
Page: https://claude.ai/artifact/KPqxfo5LGBEQYFXxTTSFx9
Playbook: bug-fix

The owner's words: "omg ive started all from worktrees, what will happen", then "ok fix all fast", then, after two probes, "ok we need a pinned rule in AGENTS.md to set head to next. and troubleshoot section for any skill using worktrees in v2", and "yes go cut" for the shared fix.

## Brief

### What will change?

New sessions that get their own copy of the repository, suggested-task cards included, now start from next instead of main. The shared rules and a helper keep plate-2 and ellie pointed there.

### What could go wrong?

A card you start follows the probed path by inference only. A fresh clone starts on main until its first session runs the helper. Worktrees still miss landed work you have not committed. plate is not synced yet.

## Teach

The desktop app gives each new session its own copy of the repository, called a worktree. It cuts that copy from the branch this clone names as the remote's default, not from the default GitHub shows.

Until today this clone named main, the v1 branch, so every card session started on old code. Each had to notice that and move to next, and some read older rules before they did.

Now this clone names next. A small helper runs when a session starts and puts next back if anything changed it. The shared rules say where a worktree comes from and tell agents never to reset it to the remote's default.

## Main changes

- dotai's shared block says an app-made worktree is cut from the clone's `origin/HEAD`, and, in projects with a protected branch, keeps `origin/HEAD` on the working branch and forbids `git remote set-head origin --auto`.
- dotai ships `head.mjs`, which points `origin/HEAD` at `origin/<branch>` when the config names a protected branch, origin has that branch, and the pointer has moved.
- plate-2's `AGENTS.md` has a Worktrees section with the pin and a troubleshooting list for every skill or session that works in a worktree.
- plate-2's Claude Code SessionStart hook runs `head.mjs` when the file exists.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| GitHub's default branch | Stays main for v1 users | Switch it to next | public next | big |
| Where the pin rule lives | The shared rules, for every project with a protected branch | A plate-2 rule only | pin local | small |
| Session-start hook | Only plate-2 runs the helper when a session starts | Ellie runs it too | hook ellie | detail |
| The brief's own switch step | Waits until another session finishes its edit of the same brief | Edit the brief now | brief now | detail |
| Review | Shipped fast, with no panel | A panel on the dotai diff | full | detail |
| Syncing plate | Waits for its own run, since it carries older changes and opens a public PR | Sync it now | sync plate | small |

## Steps

- [x] Prove where the app cuts a new worktree. Proof: `docs/plans/artifacts/2026-10-15-worktree-head/worktree-base-probes.md`
- [x] Pin plate-2's clone to next and add the Worktrees section to `AGENTS.md`. Proof: `docs/plans/artifacts/2026-10-15-worktree-head/origin-head-a1.txt`
- [x] Add `head.mjs`, its test and the block fix in dotai as `11d9965`. Proof: `docs/plans/artifacts/2026-10-15-worktree-head/head-test-a1.log`
- [x] Run `head.mjs` from plate-2's Claude Code SessionStart hook. Proof: `.claude/settings.json`
- [x] Rebuild dotai's manifest, run its suite and `validate-skills` at the commit, then push. Proof: `docs/plans/artifacts/2026-10-15-worktree-head/dotai-suite-a1.log`, `docs/plans/artifacts/2026-10-15-worktree-head/validate-skills-a1.log`, dotai `6a364fc`
- [x] Sync plate-2 and ellie from the pushed commit and run `verify` on each; plate waits, as Defaults says. Proof: `docs/plans/artifacts/2026-10-15-worktree-head/verify-plate-2-a1.log`, `docs/plans/artifacts/2026-10-15-worktree-head/verify-ellie-a1.log`, ellie `509451140`
- [x] Shorten plate-2's pin bullet to point at the block's Git rule once the sync renders it. Proof: `AGENTS.md`

## Open work

- The brief that `chips brief` prints should tell a card session to switch to the project's branch before its first edit, as a fallback for a clone with no pin. owner: zbeyens, who starts its card. stop: suggested task t_8575b01b lands, or the owner drops it. Tracked in `docs/plans/suggested-tasks.decisions.tsv`.
- plate is the one managed project not synced from dotai `6a364fc`. owner: zbeyens. stop: plate's next sync, which opens its PR into main. Tracked in this plan's Defaults and the decision log.

## Close

dotai `6a364fc` adds `head.mjs`, its test, and a Git rule that says an app-made worktree comes from the clone's `origin/HEAD` and keeps that pointer on the working branch in projects with a protected branch. plate-2 and ellie render it; ellie pushed it as `509451140`. plate-2 has the Worktrees section in `AGENTS.md`, the SessionStart hook and the pin, all uncommitted for the owner.

Two probe sessions showed a new worktree starts from `origin/HEAD` whatever GitHub's default is. Both probes used `start_session`, so a card the owner starts follows the same path by inference, not by probe. dotai's suite passed 273 of 273 and `validate-skills` passed at the pushed tree. `verify` passed in plate-2 and ellie. `head.mjs` changed nothing in either clone, because both already pointed at next; only its unit test exercised a move. The hook has not fired in a new session yet.

The first fix tried, `source_branch` on a card, does not work, because the tool drops it for a card. The brief's switch step moved to suggested task t_8575b01b, because another session holds uncommitted edits in the file that prints the brief. plate stays unsynced. The run shipped fast, with no panel and no decision-trail review.

The owner's asks were the worktree fix, the pinned rule in `AGENTS.md`, the troubleshooting section and the shared fix; all four landed. Open work holds two items.
