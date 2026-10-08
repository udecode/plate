# pstack autonomy: cut the stops pstack does not make

Status: executed: shared rules and Ellie pushed; plate-2 changes wait for the owner's commit
Topic: pstack
Playbook: authoring-a-skill

The owner wants pstack's own autonomy: "Just do it", with pauses only for force-pushes to shared branches, deploys, data deletion and customer messages. This plan cuts the stricter stops the shared block, ellie and plate added, except the owner's two keeps and the stops the lead kept as its own picks, each a Defaults row below. Plate keeps `delivery: user`, so the owner reviews and commits plate-2 work, and nothing in plate-2 is committed on `next`. Ellie keeps its pause on any Chrome extension error, with no other browser workaround. The shared changes land in dotai through the `sync-pstack` skill's Lesson mode, together with the four reflect lessons this session saved (`docs/plans/artifacts/2026-10-06-react-review/reflect/lesson/dotai-lesson.patch`). The owner's words: "go all. keep do not commit anything in plate-2 tho on "next" branch. keep pause for any chrome error: we need to be logged in to the chrome extension, dont use other browser workarounds. plate 1) yes i need to review and commit myself. you can still one shot all without committing. 2) ok go go all the rest."

## Brief

### What will change?

Agents now pause only for production, pushes to main, force-pushes, deleting data and Chrome errors. A message outsiders can read waits as a draft. Shared rules and Ellie are pushed; your plate-2 changes wait for your commit.

### What could go wrong?

Codex still refuses team messages under its own rules. The rm guard covers the forms it was tested on. Seven review warnings wait in an unreviewed patch until you say another round.

## Main changes

- Shared block, first batch: the panel cap records a default instead of asking; Autopilot takes every call's pick and stops only for a production deploy or release, a push to `main`, a force-push to a shared branch and deleting data the run did not create; a repair to another branch's PR commits and pushes by the project's delivery; pstack's own panel and design triggers run without the owner's word; reflect lessons apply without approval.
- Shared block, second batch: who can read a message decides whether it waits, so a comment, review, label or close on a public repository waits as a draft the owner sends while the run continues, and a team-only message goes out. It adds the reflect lessons: a claim search before each commit or push, byte-for-byte trail freezes, a rebase-and-push landing when another session holds the files, a hook replay before shipping, one bounded panel per gate-changing lesson batch and one smoke prompt per reversed lesson.
- Shared helpers: `freeze.mjs` freezes review trees without a cleanup command, proof logs carry attempt indexes, `/pstack:correct` covers repeated shell mistakes, and removing a gate counts as additive after the panel cap.
- Plate: the API review's first stop takes its recommended move; Plan and Build stop asking mid-run; an evidence conflict takes the safer option; Linear changes proceed; the reflect override goes. Comments, reviews, labels and closes on public `udecode/plate` issues and PRs keep the owner's word. best-api's repair routes a law conflict to `best-api-review`, and sync-shadcn records its first baseline as a default.
- Ellie: a finding in someone else's reserved scope reaches that owner as a team message or a draft, and the run continues. Any Claude in Chrome error pauses the run. The workflow guide, Linear proof posts and the PRD screenshot post follow the message rule.
- User scope: a PreToolUse hook in `~/.claude/settings.json` denies an `rm` whose target can expand, through `$`, a backtick, `~`, a glob or `..`, before Claude Code prompts; relative literal paths pass.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| pstack's own panel and design triggers | Run them without asking, beside the reviews list | Keep them opt-in | keep opt-in panels |
| Public plate issue and PR actions | Keep your word for comments, reviews, labels and closes, because outsiders read them | Let agents post them | let agents post on public PRs |
| Push to main | Keep it a stop, because main releases in both projects | Let agents push main | let agents push main |
| Merging a PR and approving its CI | Keep your word, because a merge ships the PR | Let agents merge | let agents merge PRs |
| History rewrites on a shared branch | Keep your word; this is pstack's own force-push stop | None | none |
| Access grants and credentials | Keep each grant and credential use with you | Let agents widen grants | let agents widen grants |
| Lint exceptions | Keep human approval; a run that needs one leaves it as open work and continues | Let agents approve | let agents approve exceptions |
| The rm guard | A PreToolUse hook that denies rm targets that can expand | Rule text only | remove the rm hook |
| Relative rm paths | Allow them, because they never expand | Deny them too | deny relative rm |
| Ellie delivery beside another session's edits | Push this run's files from a detached worktree and leave the shared checkout to its next pull | Wait for their commit | wait for ellie's session |
| Round-2 warnings on the second batch | Ship the reviewed text and keep the fixes as an unreviewed patch | Land the patch now | another round |

## Steps

- [x] Shared: edit `skills/sync-pstack/assets/block.md`, its `# overrides` notes, the sync-pstack skill's Reviews text and every retired-policy hit, with the four reflect lessons, in a detached dotai worktree at `origin/main`. Proof: `node --test skills/sync-pstack/scripts/sync-pstack.test.mjs`, `node scripts/build-workflow.mjs`, `scripts/validate-skills`, and `apply --dry-run` on ellie and plate-2. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai/tests-final.log` (108 of 108 at 04b2cb7), `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai/validate-skills-final.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai/build-workflow-2.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai/apply-dry-run-ellie.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai/apply-dry-run-plate-2.log`.
- [x] Shared: paired baseline and revised smokes on plate-2 and ellie in both runtimes, judged against intended behavior written first. Proof: the smoke answers in the run directory. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/smoke/` against `docs/plans/artifacts/2026-10-06-pstack-autonomy/smoke/intended.md`, with reruns on the fixed text in `plate-rev-2.log` and `plate-rev-3.log`; the runtime-difference criterion holds only through the team message Defaults row.
- [x] Shared: commit and push dotai. Proof: the pushed commit. Done: udecode/dotai `04b2cb7` on `main`.
- [x] Plate: apply the block and edit the playbooks, `AGENTS.md` outside the block and the workflow guide; commit nothing. Proof: `apply` output, `check-playbooks.mjs`, `verify` for plate-2. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/plate-apply-1.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/plate-check-playbooks-final.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/plate-verify-1.log`; uncommitted on `next`.
- [x] Ellie: apply the block and the Product authority edit, commit this run's hunks only and push `next`. Proof: the pushed commit and an unchanged diff of the other session's lines. Done: InformedMedical/ellie `bb66071b0` on `next` (`docs/plans/artifacts/2026-10-06-pstack-autonomy/ellie-push-1.log`); `docs/plans/artifacts/2026-10-06-pstack-autonomy/ellie-main/move-next-1.log` with identical before and after status, staged set and other-session hunks.
- [x] User scope: the rm hook. Proof: a blocked variable-path rm and an allowed literal one. Done: `~/.claude/hooks/block-unsafe-rm.mjs` and its entry in `~/.claude/settings.json`; nine piped payloads and a live denied probe, logged in the decision log.
- [x] Decision-trail review. Proof: its answer in the run directory. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/trail/sol-answer.md`; every finding has a `trail` row.
- [x] Second reflect and lesson batch: apply the accepted lessons and the readership message rule in dotai, with one panel on the batch. Proof: the reflect answers, two panel rounds, the render check, tests and validate-skills. Done: udecode/dotai `1a7d21f`; `docs/plans/artifacts/2026-10-06-pstack-autonomy/reflect/synthesizer/answer.md`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/panel2/`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/panel2/round2/render-check-1.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai2/final-gates.log`.
- [x] Plate: sync `1a7d21f`, restore the owner's word on public issue and PR actions, fix the workflow guide; commit nothing. Proof: `apply` and `check`. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai2/plate-apply-2.log`.
- [x] Ellie: sync `1a7d21f`, align its handoff line and guide, push `next`. Proof: the pushed commit after its smoke. Done: InformedMedical/ellie `d0790b97f`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/ellie-push-2.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/ellie-verify-2.log`.
- [x] Reversal and message smokes in both runtimes, judged against intended behavior written first. Proof: the answers. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/smoke/intended-2.md`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/smoke/ellie-rev-2.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/smoke/plate-rev-4.log`; Codex's unstated draft stays open work.
- [x] User scope: narrow the rm hook to targets that can expand. Proof: payloads against old and new hooks and a replay of past rm commands. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/rm-hook-proof-4.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/rm-hook-replay-3.json`.
- [x] Second decision-trail review, over everything after the first. Proof: its answer in the run directory. Done: `docs/plans/artifacts/2026-10-06-pstack-autonomy/trail2/sol-answer.md`; every flag has a `trail` row.
- [x] Narrow the reviews-row sentence that four smoke answers read against the Panel rule, and sync both projects. Proof: tests, the ellie R1 smoke and the pushes. Done: udecode/dotai `08ae10d`, InformedMedical/ellie `d44c68868`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/smoke/ellie-rev-4.log`, `docs/plans/artifacts/2026-10-06-pstack-autonomy/dotai3/plate-apply.log`.

## Close

### Reversals and deviations

- The approved claim "cut every stricter stop except the owner's two keeps" narrowed. The lead kept six stops as its own picks, each a Defaults row: public plate issue and PR actions, push to `main`, merging and CI approval, history rewrites, access grants and credentials, and lint exception approval.
- The first cut filed comments on public `udecode/plate` PRs under team chat. A reflect reviewer showed outsiders read them, so plate-2 restored your word for comments, reviews, labels and closes there, and the shared rule now decides by who can read a message.
- The Defaults row that accepted Codex's refusal to message a teammate is gone; a failed check is not a default. The rule now sends a refused message to a draft the owner sends, so the runtime difference is one the rule prescribes.
- The rm rule written at the start of this session ("a literal absolute path") was too strict: a replay of 1,325 past `rm` commands denied 979, 558 of them plain relative paths. The hook and `~/.claude/CLAUDE.md` now deny only targets that can expand.
- Ellie delivery left its cherry-pick step twice: `bb66071b0` moved the shared checkout with a guarded ref move after a three-way merge, and `d0790b97f` and `d44c68868` pushed from detached worktrees and left the shared checkout to its next pull. The `d44c68868` push needed a recovery: its guard failed when origin moved, removing the worktree dropped the commit's only ref, and `git fsck` found it.
- `bb66071b0`'s body says both runtimes send team messages; only Claude Code does. `d0790b97f`'s body corrects it, and pushed history stays.
- The panel replaced a landing recipe that could rewind a shared branch (`8eadad2`) and caught a template note that deleted two rules from every project (`aaee30b`); neither shipped.

### What landed

- udecode/dotai `04b2cb7`, `1a7d21f` and `08ae10d` on `main`.
- InformedMedical/ellie `bb66071b0`, `d0790b97f` and `d44c68868` on `next`.
- plate-2, uncommitted on `next`: `AGENTS.md`, `.agents/pstack.json`, `.agents/pstack/freeze.mjs`, the API review, Plan, Build and Babysit playbooks, `.agents/rules/best-api.mdc`, sync-shadcn's planning reference, their generated skills, `docs/development/agent-skills.md`, this plan, its log and `docs/plans/topics/pstack.md`. Your commit `7ad817c352` already holds part of the earlier work.
- User scope: `~/.claude/CLAUDE.md`, `~/.claude/hooks/block-unsafe-rm.mjs` and its entry in `~/.claude/settings.json`.

### Proof and its limits

- dotai: 108 of 108 sync-pstack tests and `validate-skills` at each pushed commit; `apply --dry-run`, `check` and `verify` on both projects.
- Two panel rounds on the second batch, three seats each, all answered; the render check proves the fixed template keeps both rules the buggy one dropped.
- Smokes in both runtimes against intended behavior written first: `smoke/intended.md` and `smoke/intended-2.md`. Every prompt's action matches in both runtimes. Smokes are read-only routing answers, not proof of the actions themselves, and Codex never states that it leaves the M1 draft.
- rm hook: 24 payloads, with the earlier hooks as controls, and a replay of every past `rm` command in the plate-2 and ellie transcripts. Whether a relative literal path never prompts is inferred from the Claude Code binary, not probed.
- The `08ae10d` sentence change had no panel or trail review; it narrows one claim and its smoke reran.
- Lint: skipped, because every changed repository file sits in a path Ultracite ignores (`.agents/**`, `AGENTS.md`, `docs/**`) and the hook is outside any repository.

### Counts

25 items: 21 done, 2 partial (the first paired smokes and the reversal smokes, both for Codex's unstated draft), 1 skipped (lint), 0 blocked, 1 open (the unreviewed round-2 patch).

### Attention, first decision-trail review

reviewed by gpt-6.1-sol

- The "every stricter stop" claim overreached (critical). It narrowed, and each kept stop is a Defaults row.
- Retired stops survived in other files (critical). A search without a cutoff found them, and plate's Build, Babysit, best-api and sync-shadcn files and Ellie's guide, proof and authoring rules were fixed.
- The paired smokes passed despite a runtime difference (warning). The row is `partial`, and the rule gained its draft path.
- The wording fixes had no rerun (warning). The fixed text was smoked three more times.
- The rm guard claim was wider than its proof (warning). It narrowed to the tested forms.
- Ellie's Chrome pause covered only a lost connection (warning). It now covers any Claude in Chrome error.
- The lead edited files during the review (warning). The slip is logged.
- The Ellie ref move risked other sessions' work (warning). It ran guarded, with before and after comparisons.

### Attention, second decision-trail review

reviewed by gpt-6.1-sol

- The rm narrowing rests on a reading of the Claude Code binary (warning). The claim stays limited to the tested forms, and the gap stays open.
- The reversal-smoke row overstated its result (warning). A superseding row names the exact matches.
- Ellie's instructions changed after its smoke (warning). R1 and R2 reran on the pushed text and passed.
- A proof file was overwritten (warning). A correction row names the preserved copy and its hash.
- Merging, CI approval and history rewrites stayed unnamed picks (warning). Each now has a Defaults row.

### Reflect record

The second reflect accepted 17 lessons, rejected 3 and filed 12 to Backlog: `docs/plans/artifacts/2026-10-06-pstack-autonomy/reflect/synthesizer/answer.md`. Every accepted lesson landed in `1a7d21f` except the Babysit row, which the public-repository restore made moot.

## Open work

Each item is tracked in `docs/plans/topics/pstack.md` under Open work.

- The round-2 warning fixes for the second batch wait as an unreviewed patch, `docs/plans/artifacts/2026-10-06-pstack-autonomy/panel2/unreviewed-round2.patch`: drafts go to Open work, the PR and commit carve-out, unconfirmed readers count as outsiders, the rebase-onto landing, the batch panel's cap and trail review, the user-scope hook replay and a template-note parser check. owner: Ziad. stop: "another round" lands it after one more panel round, or it is dropped on 2026-11-06.
- Codex declines team messages under its own instructions and, in the M1 smoke, never says it leaves a draft. owner: Ziad. stop: the patch above lands and a Codex smoke shows the draft.
- Ellie's uncommitted `.agents/rules/verify.mdc` line pauses only "when it cannot connect"; another session holds that file. owner: Ziad. stop: that session commits it, then the line widens to any Claude in Chrome error.
- The session building `docs/plans/2026-10-06-react-review.md` loaded the block from before this run and may still stop at the old cap. owner: Ziad. stop: that plan closes.
- `tooling/scripts/check-hook-generics.mjs` exempts names through a hardcoded list with no reason, expiry or approver, so a new entry passes the gate without a code fix; a smoke found it in another session's work. owner: Ziad. stop: the react plan's build closes.
- The smokes named older rule conflicts this run did not touch: "first drafts start in Claude Code" against Codex autonomy, whether a "go" run counts as unattended for the trail review and reflect, Git at intake against recording the base commit, `lint:fix` after a panel, main-line standing authority against reserved work, and the cap rule's "hold" word. owner: Ziad. stop: the next sync-pstack Lesson run settles or drops each.
- The second reflect's 12 Backlog items, in `docs/plans/artifacts/2026-10-06-pstack-autonomy/reflect/synthesizer/answer.md`, such as a `reply.mjs` helper, a `land.mjs` helper, smoke `--prompts` and `--at` flags and a zsh `setopt` for agent shells. owner: Ziad. stop: each lands or is dropped at the next pstack sync.
- sync-pstack's Audit mode still hands its cut table to the owner, because a cut removes commands the owner types. owner: Ziad. stop: the owner says audit picks are the lead's.
- The rm hook covers the 24 forms its proof runs; `find -exec rm`, `eval` and `sudo -u <user> rm` go unchecked. owner: Ziad. stop: a run hits an rm prompt the hook missed.
