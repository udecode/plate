# Comment on another person's PR instead of rewriting its description

Status: executed: plate-2's synced files wait for the owner's commit on next
Topic: pstack
Playbook: bug-fix

The owner's words, after this session replaced the description of natamox's PR 5168 with its plan page: "hey you did a mistake , you've edited PR desc instead of --comment, repair the skill". This iteration continues [Suggested tasks run at their effort](2026-10-14-chip-effort.md).

## Brief

### What will change?

When an agent pushes fixes to someone else's PR, it now leaves their description alone. It posts one comment about its own commits and keeps that comment up to date. Before, the shared rules told it to keep the PR description true, so on PR 5168 it replaced natamox's description twice.

### What could go wrong?

Codex won't post that comment on its own, because its own instructions want an explicit go for any post. It leaves the comment as a draft under Needs you, and you post it. Claude Code posts it.

## Teach

When the agent pushes to a PR branch someone else owns, two places told it what to do with the PR's text. The Delivery rule in the shared block said to keep the PR description true to the pushed code. The plan-page skill already had a comment mode for someone else's PR, but the copy installed in plate-2 was older than that mode. So the agent followed the Delivery rule and rewrote the description.

Now the Delivery rule tells the two cases apart. On a PR the agent opened, it keeps the description true. On someone else's PR, it keeps its latest comment about its own commits true, the way plan-page's PR section says. The Messages rule treats that comment like a PR body, a report on the agent's own work, so it needs no extra go from you. The Babysit playbook and the redo skill say the same. Any other comment still waits for your word.

## Main changes

- The block's Delivery rule, in a project whose owner commits and whose lead pushes other branches, keeps the description true only on a PR the lead opened. On another person's PR the lead leaves their description alone and keeps its latest comment about its own commits true, as the `plan-page` skill's PR section says. A runtime whose own instructions refuse the post leaves the comment as a draft under Needs you. Other comments still need the user's word.
- The block's Messages rule, in the same projects, says that comment is not a message that needs the active request's authorization.
- plate-2's Babysit playbook writes the description and history with `make-pr-easy-to-review` only on a PR the lead opened, and keeps one comment on another person's PR.
- The redo skill finds the draft plan of another person's PR through the plan the lead's own comment links.
- plate-2 and ellie reinstalled `plan-page` and `redo`, whose installed copies predated the comment mode.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A runtime that refuses to post the comment | It leaves the comment as a draft under Needs you, so Codex drafts and Claude Code posts | Every runtime drafts it for the owner | draft everywhere | small |
| Which projects get the comment rule | Only projects whose lead pushes other people's PR branches, so Ellie's block, where such a repair waits for the owner, is unchanged | Give Ellie the Messages exception too | ellie comment rule | detail |
| Posting that comment without asking | The lead posts its one comment on another person's PR without a separate go, as plan-page's PR section says and your correction asked (look) | Every such comment waits as a draft for your word | comment drafts | small |

## Steps

- [x] Shared: the Delivery and Messages rules in the block and the redo skill's draft lookup. Proof: dotai's sync-pstack tests and `scripts/validate-skills` pass on the committed tree. Done: udecode/dotai `f4622e1`, `364a5cb`, `5569dfd` and `0d68151` on `main`; `docs/plans/artifacts/2026-10-14-chip-effort/pr-comment/dotai-tests-fix2-a1.log` and `docs/plans/artifacts/2026-10-14-chip-effort/pr-comment/validate-skills-fix2-a1.log`.
- [x] plate-2's Babysit playbook. Proof: `check-playbooks.mjs` passes. Done: `docs/plans/artifacts/2026-10-14-pr-comment-delivery/check-playbooks-a1.log`.
- [x] Reinstall `plan-page` and `redo` in plate-2 and ellie. Proof: each installed file equals dotai's at `0d68151`. Done: `docs/plans/artifacts/2026-10-14-pr-comment-delivery/installed-skills-a2.log`; ellie commit `ab8e58582`.
- [x] Sync plate-2 and ellie from `0d68151`. Proof: `check` and `verify` pass. Done: `docs/plans/artifacts/2026-10-14-chip-effort/pr-comment/check4-plate-2-a1.log`, `docs/plans/artifacts/2026-10-14-chip-effort/pr-comment/check4-ellie-a1.log` and `docs/plans/artifacts/2026-10-14-chip-effort/pr-comment/verify2-plate-2-a1.log`.
- [x] Smoke both runtimes in plate-2 with an outside contributor's PR the lead just pushed to. Proof: both leave the description alone and render the comment, Claude Code posts without waiting, and Codex drafts it under the rule's fallback. Done: `docs/plans/artifacts/2026-10-14-chip-effort/pr-comment/smoke-a2-judgment.md`.
- [x] Smoke both runtimes in ellie, the push-mode project, with a teammate's PR to finish. Proof: neither runtime edits the teammate's description or pushes to their branch without the owner, and no clash is named between the reinstalled skills and Ellie's rules. Done: `docs/plans/artifacts/2026-10-14-pr-comment-delivery/ellie-smoke/judgment.md` and `docs/plans/artifacts/2026-10-14-pr-comment-delivery/verify-ellie-a1.log`.
- [x] Close. Done: [Close](#close).

## Open work

- The block's Git rule pushes a repair to another person's PR with `git push origin HEAD:<head branch>`, which misses a head branch that lives on a fork. owner: zbeyens. stop: the owner starts or drops the suggested task. Tracked in the pstack subject's Open work.
- plate-2's synced files and this plan wait for the owner's commit on `next`: `AGENTS.md`, `.agents/pstack.json`, `.agents/playbooks/babysit.md`, `.agents/skills/plan-page`, `.agents/skills/redo`, `skills-lock.json`, this plan, its log and the subject file. owner: zbeyens. stop: the owner says "commit".

## Reflect

One opus reviewer applied the tooling, judgment and divergent lenses to the transcript since this session's previous reflect (`docs/plans/artifacts/2026-10-14-pr-comment-delivery/reflect/reviewer.md`), and the lead synthesized. No lesson fixes a helper that refuses a case its own rule allows, and none is a rewording with no net words, so the lead applied no skill or rule edit. Two findings were gaps in this run's own work, which the lead closed: ellie had no smoke, though the Lesson mode smokes one project per delivery mode, and the Close did not name the other session's dotai commits that plate-2's sync also applied. The comment posted without asking also got its own Defaults row.

### Accepted

None applied. Each accepted lesson is in Backlog.

### Rejected

- Rewriting someone else's text is a bigger act than adding your own. The block's Delivery rule and plan-page's PR section now both say to leave another person's description alone. Reason: already-covered.
- Run the retired-policy search before the first smoke. sync-pstack's Lesson step 3 already requires it for a change that adds an exception, and this run skipped it. Reason: already-covered.
- A message drafted for someone outside the team goes under Needs you, not Open questions. The Messages rule already says so. Reason: already-covered.
- Build, commit and apply dotai from a clean worktree when its checkout is dirty. sync-pstack's Lesson step 2 says to edit the checkout in place and commit another session's dotai edits with the run's own once dotai's checks pass. This run's clean worktree went against that, which is how the manifest picked up hashes of files the commit left out. Reason: contradicts the skill's rule.
- Reinstall a skill only after the push. Lesson step 6 already orders the reinstall after step 5's push. Reason: already-covered; the stale-copy item in Backlog would show the slip.
- Smoke the other session's dotai commits that rode into the sync. The run that wrote them owns their smoke, and this run now names them. Reason: owned elsewhere.
- The lead should watch the PR's merge itself. Nothing in this run waited on the merge except cards the owner starts. Reason: decision-changing.

### Backlog

Each item's owner is zbeyens, and its stop is that the owner takes or drops it.

- plan-page's `--pr` renders for any PR, so nothing stops the lead from writing another person's description at the moment it does. Mechanism: `--pr` refuses a PR whose author is not the current `gh` user and names `--comment`, through sync-pstack.
- An installed dotai skill can fall behind dotai while `status`, `check` and `verify` pass. That is how plate-2 ran a plan-page older than its comment mode, and how both projects kept an old `redo` after the first reinstall. `audit.mjs` already computes a stale copy per skill. Mechanism: `status` and `verify` print the stale installed dotai skills, through sync-pstack.
- When a skill gains a mode that contradicts a block clause, nothing makes the same change fix that clause. plan-page's comment mode shipped while the block still said to keep the description true. Mechanism: Lesson step 3's retired-policy search also runs on a skill change, through sync-pstack.
- `scripts/validate-skills` exited 1 with no output, and the run still committed and pushed, because the commit followed it with `;`. It repeats the opt-in panels run's item for a dotai pre-commit check. Mechanism: that check, which blocks a commit, so it is your call.
- `decisions-check.mjs append` takes only TSV, so this run reused another run's `json2tsv.mjs` again. It repeats the PR 5168 redo reflect's item. Mechanism: a `--json` input, through sync-pstack.
- A pull into a checkout whose dirty files overlap the incoming commits was built as a merge script again. It repeats the PR 5168 redo reflect's item. Mechanism: a shared pull helper that backs up each overlapping file, merges the worktree and index copies three ways and fast-forwards, never stashing.
- The ledger refuses a `started` row for a task the owner started when another lead's `Now` task shares a path, so `task_f529d5ce` still reads as offered. Mechanism: the check accepts a `started` row the owner reports and flags the overlap instead, through sync-pstack.
- A proof log counts by its `exit=` line, so a no-op command writes a log that looks like a passing check. This run wrote one, `installed-skills-a1.log`, and cites only the real `installed-skills-a2.log`. Mechanism: `plan-open.mjs` prints the command of each log a closed box cites.
- The ledger keeps a task's title and paths but not its brief, so offering a card again meant searching the transcript for it. Mechanism: each offer saves its brief in the run directory and its row cites it, through sync-pstack.
- GitHub keeps every version of a PR description in `pullRequest.userContentEdits`, which restored natamox's description byte for byte, and a `gh pr view --json` readback adds one trailing newline. Mechanism: a recovery and readback note in plan-page's PR section.
- The block's Commit and PR text rule says a PR body is the page of its plan without limiting it to a PR the lead opened. Both runtimes in the ellie smoke took plan-page's comment mode as the narrower rule, but the block never states the exception. Mechanism: the rule names a PR the lead opens, through sync-pstack.
- A reviewer that judges actions only against the rules cannot catch a wrong rule, and the first reflect passed the description rewrite. Mechanism: the project's reflect brief asks the reviewer to check each action people outside the team can see against how its author would see it.

The PR 5168 redo reflect's Backlog item "When a run rewrites another person's PR, it drafts a note to the author under Needs you" is dropped, because the Delivery rule now forbids the rewrite.

## Close

No pick was reversed. Three deviations. The first smoke found that the Delivery rule still listed every comment among the actions that need the user's word, and that Codex refused to post, so `0d68151` exempted the delivery comment and added the draft fallback. The run pushed `364a5cb` while `scripts/validate-skills` had exited 1, and its manifest held hashes of another session's uncommitted dotai edits; the run built `5569dfd` from a clean worktree to replace that manifest, and the checks on `0d68151` pass. The installed `redo` copies in plate-2 and ellie were still older than `f4622e1` after the first reinstall; a second reinstall fixed both, and the comparison log shows every copy matches dotai.

udecode/dotai `f4622e1` changes the Delivery rule and the redo skill, `364a5cb` and `5569dfd` limit the Messages exception to projects whose Delivery rule keeps the comment, and `0d68151` lets the comment through every rule that gates comments. Another session's dotai commits `98ddff3`, `45cd074` and `308629e`, which change how suggested tasks pick their effort and mark their titles, are in the `0d68151` tree plate-2 synced from, and this run did not smoke them. plate-2 is synced and waits for the owner's commit. One apply from the dirty dotai checkout copied another session's uncommitted `chips.md` and `decisions-check.mjs` into plate-2 and ellie; the run applied again from the clean worktree with `--force`, and `check` passes on both. Ellie's block did not change, and its reinstalled skills are committed and pushed as `ab8e58582`.

On PR 5168, natamox's description is back as they wrote it, and one comment about the redo's commits is posted at https://github.com/udecode/plate/pull/5168#issuecomment-6176596661. The PR has since merged.

dotai's tests pass 192 of 192 and its skill check passes. `check` and `verify` pass on plate-2 and ellie. Both runtimes smoked in plate-2 and in ellie against expectations written before each run. The smokes are read-only, so they prove what each runtime would do, not a real post. In plate-2, Claude Code named one older conflict, the Git rule's push to a fork, which is now open work. In ellie, neither runtime would push to a teammate's branch without you or touch their description, and both named an older gap in the block's Commit and PR text rule, which is in the reflect Backlog. The decision-trail review did not run: the run was attended, had no panel, and changed no shared script or check.

7 steps: 7 done, 0 partial, 0 skipped, 0 blocked, 0 open.

Open work above lists the fork push and the owner's commit, and the pstack subject's Open work points to this plan's reflect Backlog. This run offered one suggested task, `task_295ff37f` for the fork push, which waits for `task_3c30e34e` and `task_afce9573` because all three write the shared block. The ledger refuses a `started` row for `task_f529d5ce`, which the owner started, because `task_17689079`, a `Now` task the PR 5165 redo session offered, also writes under `apps/www/tests/browser`; only that session or the owner can retag it.
