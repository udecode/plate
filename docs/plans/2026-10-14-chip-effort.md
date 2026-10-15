# Suggested tasks run at their effort

Status: executed: plate-2's synced files wait for the owner's commit on next
Topic: pstack
Playbook: feature

The owner's words, after a screenshot of a suggested-task card set to Extra high under a "(high)" title: "nice redesign claude desktop, do you have the tools to suggest a task to a specific effort ?", then "awesome, can you improve our chip pstack rules to include the effort". This iteration continues [Suggested tasks you can trust](2026-10-14-suggested-task-chips.md).

## Brief

### What will change?

A suggested task's card now runs at the effort its title names. Before, every card ran at the agent's own effort, so a "(high)" card started at Extra high.

### What could go wrong?

The app won't let a card run above the agent's own effort. Then the card gets the highest it allows and the title keeps the effort the task needs, so raise it on the card before you start.

## Teach

A suggested task is a card the agent offers in the app. Its title ends with an effort, high for a spelled-out job and xhigh for design work, and one click starts it as a new session.

The title was only a label. The tool that makes the card has its own effort setting, and the agent never filled it in, so every card took the agent's effort.

Now the agent passes the title's effort to that setting. The rule also names the card tool the redesigned app uses, which replaced the old one.

## Main changes

- The Suggested tasks rule in `.agents/pstack/rules/chips.md` says an offer passes the title's effort to the suggest tool's effort setting when the tool has one, such as `start_session`'s `effort` for a task that starts fresh. When the tool refuses that level, the offer passes the nearest level it takes and keeps the title's effort.
- The Suggested tasks rule and the block's Autopilot rule name Claude Code desktop's `start_session` as the suggest tool instead of `spawn_task`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A task that needs more effort than the agent runs at | The card gets the highest effort the app allows, and the title keeps the effort the task needs | Leave the card's effort unset | unset effort | small |
| The tool name in the rules | The app's current card tool, since the old one is gone from this session | Keep the old name | old tool name | detail |
| Which projects sync | plate-2 and ellie now; plate waits for its open sync branch, as the last iteration left it | Also the proof worktrees other runs made | worktrees too | detail |
| Trial before adopting | A read-only smoke in both runtimes, since this changes one setting of an offer, not which playbook a request gets | Paired baseline-versus-revised trials | full trial | detail |
| Ellie's no-xhigh rule and suggested tasks | It covers the cards too, so Ellie cards run at high, as both runtimes read it (look) | It covers only review seats and runners, so design cards keep xhigh | ellie xhigh cards | small |

## Steps

- [x] Shared: the effort sentence and the tool name in `chips.md`, and the tool name in the block's Autopilot rule. Proof: dotai's sync-pstack tests and `scripts/validate-skills` pass. Done: `docs/plans/artifacts/2026-10-14-chip-effort/dotai-tests-a2.log` passes 192 of 192, and `docs/plans/artifacts/2026-10-14-chip-effort/validate-skills-a2.log` passes.
- [x] Writing: `unslop` on the rule and block prose. Proof: a `writing` row. Done: the `writing` row in this plan's decision log.
- [x] Shared: commit and push dotai. Proof: the pushed commit. Done: udecode/dotai `c171043` on `main`.
- [x] Sync plate-2 and ellie from that commit. Proof: `check` passes on both, and `verify` passes. Done: `docs/plans/artifacts/2026-10-14-chip-effort/check-plate-2-a1.log`, `docs/plans/artifacts/2026-10-14-chip-effort/check-ellie-a1.log`, `docs/plans/artifacts/2026-10-14-chip-effort/verify-plate-2-a1.log` and `docs/plans/artifacts/2026-10-14-chip-effort/verify-ellie-a1.log`.
- [x] Smoke both runtimes in plate-2 and ellie with a request that turns up one spelled-out side job and one design question. Proof: Claude Code passes `effort` high for the spelled-out task and xhigh for the design task; Codex lists both under its fallback with the same title efforts. Done: plate-2 matches, `docs/plans/artifacts/2026-10-14-chip-effort/smoke-plate-2-a1.txt`. In ellie both runtimes apply Ellie's rule that no role runs at xhigh, so both tasks are high and Claude Code passes high, `docs/plans/artifacts/2026-10-14-chip-effort/smoke-ellie-a1.txt`.
- [x] Close. Done: [Close](#close).

## Open work

- plate-2's Verdict playbook still names `spawn_task` for its one-click offer of the next ledger item, and says such an offer opens in a worktree, which a `start_session` card offered with `use_worktree: false` does not. Fixing it changes how Verdict hands off, so it stays out of this rule edit (`.agents/playbooks/verdict.md:28` and `:30`). owner: zbeyens. stop: the owner takes or drops it. Tracked in the pstack subject's Open work at the fold.
- plate-2's synced files and this plan wait for the owner's commit on `next`: `AGENTS.md`, `.agents/pstack.json`, `.agents/pstack/plan-page.mjs`, `.agents/pstack/rules/chips.md`, `docs/development/agent-skills.md`, this plan, its log and the subject file. owner: zbeyens. stop: the owner says "commit".

## Close

No pick was reversed. One deviation: the plan named only the effort, and the run also replaced `spawn_task` with `start_session` in the rule and the block, because the redesigned app offers cards through `start_session`.

udecode/dotai `c171043` changes the Suggested tasks rule and the block's Autopilot tool name. plate-2 is synced from it, with dotai `87479ed`, another session's revert that restores the plan page's dark theme, and waits for the owner's commit. Ellie is synced, committed and pushed as `7bdec23a9`, with another session's uncommitted `AGENTS.md` edits left in place. plate still waits for its open sync branch.

dotai's sync-pstack tests pass 192 of 192 and its skill check passes; `check` and `verify` pass on plate-2 and ellie. Both runtimes smoked in both projects, judged against expectations written before the runs. In plate-2, Claude Code passes `effort` high for a spelled-out docs fix and xhigh for a design question. In ellie, both runtimes apply Ellie's rule that no role runs at xhigh, so both cards are high. Codex has no suggest tool and lists both tasks under its fallback with the same efforts. The smoke sessions run headless, without `start_session`, so their calls show what each would pass under the prompt's desktop assumption, not a real card. The re-offered card `task_130e884c` in this session was made with `effort: "high"`, and the tool accepted it; nobody checked the card's Options. The ellie smoke flagged an older ambiguity, whether Ellie's no-xhigh rule covers suggested tasks while its ledger already holds xhigh offers from other runs; the Defaults row "Ellie's no-xhigh rule and suggested tasks" records the pick. The decision-trail review did not run: the run was attended, had no panel, and changed no shared script or check. Reflect did not run, because this run is itself the workflow lesson and nobody corrected it.

6 steps: 6 done, 0 partial, 0 skipped, 0 blocked, 0 open.

Open work above lists the Verdict playbook's old tool name and the owner's commit. No suggested task was offered by this run.
