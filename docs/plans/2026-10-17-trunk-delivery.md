# Agents land their own work on next

Status: partial: the fresh-session routing smoke of step 2.3 waits on its session card
Topic: pstack
Playbook: plan

The owner asked why worktrees and the uncommitted `next` checkout cost so much, then chose trunk delivery: agents pull, rebase and push their own work, contributors still open PRs, and every override pstack does not need goes back to pstack's default.

## Brief

### What will change?

Agents land each task on next as one commit from their own worktree, and a review script lists them. A clone without the push setting opens a PR instead. plate-2's workflow rules shrank from 145 KB to 67 KB.

### What could go wrong?

No panel has reviewed the landing script or the cuts; say "full" for one. Each commit says what it did beyond the ask, which is where you catch unasked changes. A contributor's fork and a fresh session's routing are untested.

## Teach

Today every agent leaves its changes uncommitted on next, and you commit them later in big batches. A session working in its own copy of the repo can't see that uncommitted work, so it hands back a patch file, and those patches often fail to apply.

After this, each session works in its own copy, commits its task as one commit, catches up with next, runs its checks and pushes. Your copy only pulls. A setting in your copy picks pushing; anyone without it gets a pull request instead.

That removes patch landing, the waits for your commits and most rules built around one shared folder, which brings us close to pstack's defaults. You review intent from a short list of commits, each saying what it did beyond the ask.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the change lives | A new delivery mode in the shared rules, so other projects keep theirs | Plate's own rules only | plate only | big |
| Side task ledger | Cut it; side work becomes session cards or GitHub issues (look) | Keep the ledger | keep chips | big |
| Decision log checks | A plain log like pstack's, plus proof logs | Keep the strict checker | keep checks | small |
| Who finds evidence | The lead's own model, one level lower | Keep it on Codex | codex explorer | small |
| Review of the landing script | Owed until you say "full", because your "continue complete all without pausing" carried on the fast request and no panel ran before the first real push (look) | A panel before the first real push | full | small |
| Topic page link | A new page at https://claude.ai/artifact/Q5TusVfYgEUm4SEStmFRBd, because https://claude.ai/artifact/YTszMh8atAUzyhXUKobq91 and https://claude.ai/artifact/KxphyH719Pz39dqythPSZ8 no longer open (look) | Publish no page for this subject | no page | detail |
| Trunk rules before your Phase 0 commit | They are live in this checkout's AGENTS.md now, uncommitted, while the rules outside the block still say you own commits and win (look) | Keep user delivery here until Phase 0 lands | hold trunk | big |
| What the force-push guard does | Blocks the push and shows you the command to run yourself (look) | Asks you to approve it inside the session | ask | small |
| A push rejected because next moved | Rebases and pushes again, up to three times, without rerunning the checks | Reruns the checks before each retry | recheck | small |
| What else the guard blocks | Deleting or mirroring next or main too | Force-push only | force only | detail |
| Where the worktree and landing rules live | A rule file the Delivery line points to, because the block hit its size limit | Inline in the block | inline | detail |
| Open chips at the cut | All 196 are frozen into a backlog file, and the six started ones land through their own sessions with the landing script (look) | 190 session cards or public issue drafts under Needs you | issue drafts | big |
| Who runs Phase 2 | The trunk-phase-1 session, which built Phase 1, from its own worktree (safe) | This session | here | detail |

## Public API

What to type after this plan.

```text before
```

```text after
git config pstack.delivery push    (once per clone: land.mjs pushes next; unset means a PR)
node .agents/pstack/land.mjs --message <file> [--check <command>]    (rebase, check, squash, push or open a PR)
node .agents/pstack/review.mjs [--mark]    (commits since your last review, grouped by plan)
```

The decision-trail review leaves with the trail checks.

```text before
decision-trail reviewer: a codex:gpt-6.1-sol @xhigh seat
```

```text after
```

## Main changes

- **Agents land their own work.** A session works in its own worktree cut from `origin/next`, and `land.mjs` fetches, rebases, runs `lint:fix` on changed files and the task's checks, squashes to one Conventional Commit and pushes. A rejected push rebases and retries. `land.mjs` refuses a commit body without a `Beyond the ask:` line.
- **One per-clone setting picks push or PR.** `git config pstack.delivery push` lands on `next`. Unset, `land.mjs` pushes a topic branch and opens a PR into `next`, which is pstack's default. The setting is never committed.
- **The owner reviews a digest.** `review.mjs` lists commits since `refs/pstack/reviewed`, grouped by the plan each body links, with subject and `Beyond the ask:`. `--mark` moves the ref.
- **Agents cannot force-push next or main.** A `PreToolUse` hook blocks `--force`, `-f`, `--force-with-lease`, `--mirror`, `--delete` and `+` or `:` refspecs to those branches from an agent's shell, and prints the command for the owner. The owner's terminal is untouched.
- **A hook sets up each worktree.** A `SessionStart` hook installs dependencies offline and copies env files in a new worktree, and fast-forwards the main checkout when no local edit overlaps the incoming paths.
- **The lead delegates code.** The lead runs at xhigh and designs, briefs, reviews the diff and proves the result. Code delegates run at high on the same model, Opus in Claude Code and gpt-6.1-sol in Codex. The lead writes an edit itself only in files it has read, in one pass. One delegate shares the session's worktree; parallel delegates each get their own with `worktree.baseRef: "head"`.
- **A `push` review row replaces `pr`.** A push that changes a public API or Plite core, or deletes behavior, gets a panel on its diff first.

## Decisions

The owner's calls, in their words where they gave them.

| Decision | Reason |
| --- | --- |
| Agents push `next`: "it can auto pull, rebase, push" | Beta releases are off, and one squashed commit per task is a unit the owner can read and revert |
| Contributors open PRs through a config flag | The flag lives in each clone, so a contributor never pushes `next` by default |
| Lead at xhigh, delegates at high on the same model | Delegation keeps the lead's context small and makes the lead review code it did not write |
| No compaction cap, no window change, no delegation trial | The cap loses context, delegation is pstack's own answer, and the owner said to cut both |
| The force-push guard binds agents only | The owner still pushes, force-pushes included |

## What stays different from pstack

| Difference | Why it stays |
| --- | --- |
| Push mode for the owner's clone | One reviewer gains nothing from a PR per task |
| One squashed commit per task with `Beyond the ask:` | It replaces the PR as the thing the owner reviews, and it names changes nobody asked for |
| The reviews list (`api-plan`, `api-build`, `push`, `external-pr`) | pstack panels only contested designs, and agents never call their own design contested |
| `verify` instead of a 10-lane swarm per PR | Plate's browser, editor and registry proofs live in `verify` |
| Plans in `docs/plans` with pages | The owner reads pages, and committed plans are shared across worktrees |
| Opus everywhere, Codex panel seats, effort cap at xhigh | The owner's model choice and panel diversity |
| Calls rule, writing passes once per batch, one-hour budget, Blocked rule | Each saves tokens or stops a loop in a few lines |
| `/pstack:correct` on a second correction, quoted ask todos, one session title | Each stops a repeated failure in a few lines |
| Public actions and credentials wait for the owner, never `git stash` | Plate is public, and every worktree shares one stash list |
| `fast` and `full`, Defaults rows with a reversing word, stop words | The owner's words for running fast and undoing a pick |
| `proof.mjs` logs and the hand-drive Stop hook | Agents once claimed proofs that never ran |
| VISION, routing, best-api, hard cuts, the seven playbooks, cleanup, `dropped` | Plate's product law, not workflow |

## What goes back to pstack's default

| Cut | pstack default it returns to |
| --- | --- |
| The owner commits `next`, in-place sessions, `use_worktree: false`, `switch -C next`, patch landing, copy-before-edit, detached checks at `HEAD` | A worktree per writer that commits and integrates through git |
| Other sessions rule, autostage hook, staged-file attribution, `commit --only`, scoped `lint:fix`, Worktrees troubleshooting, `reread.mjs` | Nothing; each worktree owns its own tree |
| The chips ledger, its rule, skill and `tasks.mjs` | Session cards, and tracked issues for follow-ups that must last |
| Strict decision-log checks, `plan-open.mjs`, `close.md`, the decision-trail review, mandatory reflect | show-me-your-work's plain log |
| Babysit levels, `levels.mjs`, `lead.mjs`, `redo` | Babysit as pstack writes it |
| Panel round bookkeeping, `freeze.mjs`, `mutate.mjs` and their hooks | interrogate as pstack writes it, with our seats |
| The lead writes the code, Codex workers, Codex extraction | Feature's delegation step |
| `long-runs.md`, per-stage titles, the Commit and PR text rule, paired trials for workflow changes | Autonomous run, Opening a PR and a smoke of each changed route |

## Steps

### Phase 0. Start from a committed tree

- [x] 0.1 You commit the current tree once, so worktrees start from the real state of `next`. Proof: `git status --short` lists no tracked change, and the commit is on `origin/next`. Done by you as `61fa924e8d` on `origin/next`; on 2026-10-18 `git status --porcelain` printed nothing and `next` matched `origin/next`.
- [x] 0.2 Settle every open chip: a started task lands or stops through its session, and an offered one becomes a session card or an issue draft under Needs you. Proof: the chips board lists no open task. A Defaults row narrows it. The board held 196 open tasks, so this step froze all of them into `docs/plans/backlog.md`, 149 product and 47 workflow, and nothing writes the ledger any more. Each of the six started card sessions got a message to land with `land.mjs` instead of a patch. The board as frozen is `docs/plans/artifacts/2026-10-17-trunk-delivery/board-before-freeze.txt`.

### Phase 1. Landing machinery

Edits go to dotai's shared source through sync-pstack's Lesson mode, then sync here.

- [x] 1.1 Write `land.mjs` with tests against a scratch bare remote: push mode, PR mode with `gh` stubbed, a rejected push that rebases and retries, a rebase conflict that stops with the conflicting paths, and a body without `Beyond the ask:` that is refused. Proof: the test run's `proof.mjs` log. Done in dotai `4f61b8d`; `docs/plans/artifacts/2026-10-17-trunk-delivery/trunk-tests-a2.log` passes tests 1 to 5.
- [x] 1.2 Write `review.mjs` with tests: commits since the ref grouped by plan link, and `--mark` moving the ref. Proof: the test run's `proof.mjs` log. Done in dotai `4f61b8d`; `docs/plans/artifacts/2026-10-17-trunk-delivery/trunk-tests-a2.log` passes test 6.
- [x] 1.3 Add the force-push guard and the worktree setup hooks, and test that the guard blocks each force form for agents and passes a plain push. Proof: the hook test log. Done in dotai `4f61b8d` and plate-2's `.claude/settings.json`; `docs/plans/artifacts/2026-10-17-trunk-delivery/trunk-tests-a2.log` passes tests 7 to 9, `docs/plans/artifacts/2026-10-17-trunk-delivery/installed-guard-a1.log` runs the installed copy, and `docs/plans/artifacts/2026-10-17-trunk-delivery/guard-replay-a3.log` replays every past push without a false block.
- [x] 1.4 Add a `trunk` delivery mode to the block whose Delivery and Git rules say to finish with `land.mjs`, and set plate-2's `delivery` to `trunk`. Proof: `validate-skills` and the sync check pass, and the other projects' rendered blocks do not change. Done in dotai `4f61b8d`, synced from `9e3de89`; `docs/plans/artifacts/2026-10-17-trunk-delivery/validate-skills-a2.log`, `docs/plans/artifacts/2026-10-17-trunk-delivery/sync-check-a1.log`, `docs/plans/artifacts/2026-10-17-trunk-delivery/sync-verify-a1.log` and `docs/plans/artifacts/2026-10-17-trunk-delivery/render-compare-a2.log`.
  The Delivery line points to `.agents/pstack/rules/land.md`, which holds the worktree and landing rules, and the Git rule drops the in-place checkout text without naming `land.mjs`.
- [x] 1.5 Run a panel on `land.mjs` and the new Delivery and Git text before the first real push. Proof: the panel rows in this plan's log. skip: fast, the owner said "ok go! fast mode" and then "continue complete all without pausing", so the panel is owed until "full".
- [x] 1.6 Sync plate-2, set `pstack.delivery push` in this clone, land one real task with `land.mjs`, open one PR from a scratch clone without the setting, and see the guard block an agent's force-push. Proof: the three `proof.mjs` logs.
  Done. The first real land failed because `ultracite fix` exits 2 when lint ignores every file it gets, which a docs-only commit always hits (`docs/plans/artifacts/2026-10-17-trunk-delivery/land-push-a1.log`). `lintFix` became `pnpm lint:task --allow-ignored` in `714b241607` (`docs/plans/artifacts/2026-10-17-trunk-delivery/land-lint-a1.log`), and the backlog then landed as `2225378463` (`docs/plans/artifacts/2026-10-17-trunk-delivery/land-push-a2.log`). A clone without the setting opened https://github.com/udecode/plate/pull/5191 (`docs/plans/artifacts/2026-10-17-trunk-delivery/land-pr-a1.log`). The guard denied an agent's `git push --force origin HEAD:next` before it ran (`docs/plans/artifacts/2026-10-17-trunk-delivery/guard-live-a1.log`); the hook denies the tool call itself, so that proof is the saved denial, not a `proof.mjs` log.

### Phase 2. Cut back to pstack

- [x] 2.1 Remove the cut rules from the block's `trunk` mode and the cut rule files and helpers from dotai, and set the code roles to `@high` in both models sheets with the Helper effort exemption. Proof: the block's byte count before and after, and `validate-skills`.
  Done in dotai `bc337c5`. plate-2's block went from 28,114 to 20,649 bytes and its rule files from 116,752 to 45,971, while ellie's and plate's renders did not change (`block-bytes-before-a1.log`, `block-bytes-after-a2.log`, `render-compare-p2-a2.log`), and `validate-skills` passes (`validate-skills-p2-a2.log`), all in `docs/plans/artifacts/2026-10-17-trunk-delivery/`. `lead.mjs` stays, because `cross.mjs` imports its effort helpers.
- [x] 2.2 In plate-2, drop the autostage and freeze hooks, the Worktrees troubleshooting section, the autostage paragraph and the cut parts of the seven playbooks, swap the `pr` review row for `push`, and update `docs/development/agent-skills.md`. Proof: `check-playbooks.mjs`, `pnpm run prepare` and the sync check.
  Done in the commit that ticks this box. `check-playbooks-p2-a1.log`, `prepare-p2-a1.log`, `sync-resources-check-p2-a1.log` and `sync-check-p2-a1.log` in the run directory all exit 0. The `chips` and `redo` skills are uninstalled and listed in `dropped`, `.claude/settings.json` sets `worktree.baseRef` to `head`, and `VISION.md`, `enforcement.md` and the rule references no longer name the cut helpers. Tooling and dotai lines the cut left behind are under Open work.
- [ ] 2.3 Smoke one plain request per playbook in a fresh session and check it routes and lands through `land.mjs`. Proof: each smoke answer saved in the run directory.
  Partly done. A scan of the 81 agent files on the seven routes found no live cut rule, and 28 stale paths that predate this plan (`docs/plans/artifacts/2026-10-17-trunk-delivery/route-scan-a1.log`). The fresh-session run waits on a session card: this turn came from another session's report, so the app refused to start a session, and fast drops subagents.
- [x] 2.4 Run the writing passes, then land this plan's plate-2 changes with `land.mjs`. Proof: the landed commit on `origin/next`.
  Done. The plate-2 changes landed through `land.mjs` as `714b241607`, `2225378463` and `dc06078008`, and this Close lands in the commit that carries it. `unslop` ran over the lead's plan and backlog prose before each land.

## Evidence

Measured from plate-2 session transcripts over three days, with the scripts in `docs/plans/artifacts/2026-10-17-trunk-delivery/measure/`. Worktree mechanics took 0.7% of input tokens and chips bookkeeping 1.1%. The top ten sessions took about half of all input, and one in-place verdict run took 7.8B tokens over 95 compactions. A worktree started now lacks 12 uncommitted rule files, and patch landing failed 58 times in those three days.

## Open work

- Run step 2.3's seven routing requests in a fresh session. owner: the session card "Smoke plate-2 routing after the trunk cut". stop: you start it. Tracked here.
- Merge or close https://github.com/udecode/plate/pull/5191, the PR-mode proof, which drops 11 chips-only tasks from the backlog. owner: you. stop: none, because step 2.2 landed in `dc06078008`. Tracked here.
- Five started card sessions still land through `land.mjs`: `t_fd284610`, `t_6e339e60`, `t_80279835`, `t_dd0dd0bd` and `t_a7c71be6`. `t_e126f178` landed as `249c28301c`. owner: each task's own session. stop: its own run. Tracked in `docs/plans/backlog.md`.
- Land once from a contributor's fork clone, where `origin` is the fork, and check that `gh pr create` targets `udecode/plate`. owner: you, or the first contributor PR. stop: none. Tracked here.
- The panel on `land.mjs`, `guard.mjs`, `setup.mjs`, `rules/land.md` and the Delivery line, owed because this build ran fast. owner: the session that runs your "full". stop: you say "full". Tracked here, in step 1.5.
- Rerun `docs/plans/artifacts/2026-10-17-trunk-delivery/probe/ask-bypass.sh` to learn whether a hook's ask prompts in bypass mode; the 2026-10-17 run hit the weekly usage limit in every arm. owner: the session that resumes this plan. stop: the limit resets on 2026-10-22, and an ask that prompts flips the guard to ask. Tracked here.
- ellie and plate still render from their last sync. This change renders nothing new there, but dotai `9e3de89`, another session's plan-page and `cross.mjs` edits pushed with it, does. owner: the session that started this one. stop: their next sync. Tracked here.

## Close

Reversals and deviations first.

- Step 0.2 froze the 196 open chips into `docs/plans/backlog.md` instead of turning them into session cards or issue drafts. "issue drafts" reverses it.
- Step 1.4 moved the worktree and landing rules into `rules/land.md`, because the block was over its size limit with them inline.
- The guard blocks instead of asking, because the ask probe hit the weekly usage limit in every arm. "ask" reverses it.
- The whole run went fast, so no panel has read `land.mjs`, `guard.mjs`, `setup.mjs`, `rules/land.md`, the Phase 2 cuts or the `lint-task.mjs` change. "full" reviews them.
- The first real land failed, because `ultracite fix` exits 2 when lint ignores every file it gets. `lintFix` now runs `pnpm lint:task --allow-ignored`, which also adds lint:task's check and type-aware oxlint to every land.
- Step 2.3 ran as a static scan instead of a fresh session, and its session card holds the rest.
- `deslop` did not run on the six-line `lint-task.mjs` change.

What landed. dotai `4f61b8d` adds trunk delivery with `land.mjs`, `review.mjs`, `guard.mjs`, `setup.mjs`, `rules/land.md` and 9 tests. `9e3de89` carries other sessions' edits, and `bc337c5` cuts the trunk renders back to pstack's defaults. On plate-2's `origin/next`, your `61fa924e8d` holds the Phase 1 sync. `714b241607` fixes the docs-only lint failure, `2225378463` adds the backlog and `dc06078008` cuts the workflow back to pstack. This Close lands in its own commit. A card session that this run did not start landed `t_e126f178` through `land.mjs` as `249c28301c`.

Proof. Phase 1's 9 trunk tests and 306 sync-pstack tests pass, and a replay of 1,560 past push commands blocks none. Step 1.6 has `land-lint-a1.log`, `land-push-a2.log`, `land-pr-a1.log` and `guard-live-a1.log`. In Phase 2, plate-2's block went from 28,114 to 20,649 bytes and its rule files from 116,752 to 45,971, while ellie's and plate's renders stayed the same. `validate-skills`, `check-playbooks`, `pnpm run prepare` and the sync checks pass. Step 2.3's `route-scan-a1.log` covers 81 agent files. All of these logs are in `docs/plans/artifacts/2026-10-17-trunk-delivery/`.

Limits. PR mode is proven only from a clone whose `origin` is `udecode/plate`, not from a fork. It cannot update a topic branch that already exists, because it never forces. A retry after a rejected push does not rerun the checks. The hooks are wired for Claude Code only, and the guard does not see a push run from inside a script file. No fresh session has routed a request under the cut rules yet. `pnpm check knowledge` fails on citation hits in topic files this change does not touch, as the Phase 2 session logged.

Counts: 12 steps, with 10 done, 1 skipped and 1 partly done.
