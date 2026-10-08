---
work_kind: workflow
---

# Land the suggestions run's reflect lessons

Status: executed: shared rules pushed in dotai ba81489, bb86e8c, 027ee2b and 7d68fd7; plate-2 waits on your commit
Topic: correct
Playbook: build

The suggestions run's reflect (`docs/plans/artifacts/2026-10-07-suggestions-editor-input/reflect/synthesizer/reply.md`) accepted 16 lessons and put 10 items in the backlog. AGENTS.md's Improve the workflow rule has the lead apply every Accepted lesson without waiting. It also has the lead build a Backlog item in the same run when the item repeats an earlier reflect's item or prevents a mistake the owner corrected. Three qualify. `freeze.mjs` starting from `HEAD` instead of its parent, and `plan-open.mjs` reading a closed box's indented lines differently in its two checks, repeat the pagination reflect's backlog items; the first trail review found the second. A removal hidden in an inline shell string caused the permission stall the owner corrected with "omg repair global claude.md , claude should never need my permission. we bypass all". This run continues the owner's ask "continue poteto mode". Shared rules and helpers change in dotai through `sync-pstack` Lesson mode; rules only this repository needs change here. The intake base is `dc927288b261b6c798bd7c3c43439f68a8a5ee1d`, and dotai's is `9b0a63b09df7cec26d6f61dad019f27929392a3f`. The run directory is `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/`.

## Brief

### What will change?

Agents finish a removal a reviewer calls incomplete instead of restoring the input. They mark the invariants they wrote, test the seats before each round and rerun the benchmark last. A hook refuses common removals hidden in inline shell strings.

### What could go wrong?

The hook runs in every project on this machine and could refuse a safe command. Shared rule changes reach every project at its next sync. The smoke runs prove routing only. Rarer shell forms still ask you.

## Main changes

- `freeze.mjs --parent` refuses a freeze when a path differs between `HEAD` and the parent's tree, holds uncommitted changes and is not named. That catches an earlier round's uncommitted path, and also a path the owner committed after the parent freeze and then changed again.
- The global Bash hook refuses a removal inside a `bash -c`, `sh -c`, `zsh -c` or `eval` string in the forms its tests run, so those commands never reach a permission prompt. Rarer shell forms still reach it, as before.
- `plan-open.mjs` reads a closed box's artifact, owner and stop from the box line and the uncommitted lines indented under it, and a nested box starts its own entry.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Which backlog items the run builds | The two that repeat an earlier reflect's item or prevent a mistake you corrected, plus how plan-open reads a closed box's indented lines, which the trail review showed repeats the pagination reflect's item; the other seven get an owner and a stop | Build every cheap item now | build backlog |
| Where the inline-string hook lives | Your global hook, because your global rules hold the rule it enforces and every project runs it | A hook in this project only | project hook |
| What the hook refuses | Only a removal inside an inline shell string; in-place inline edits stay in the backlog | Also refuse in-place inline edits | refuse inline edits |
| The removal smoke's test criterion | Accept the second smoke, because both runtimes finish the removal at runtime and the test part clashes with the existing ban on removal-assertion tests, an Open work item | Rewrite the prompt and smoke again until both promise a test | smoke the test criterion |
| The paired Eval trial for the changed completion and hard-cut rules | Keep the rules adopted and leave the trial pending in Open work, because reverting the pushed rules undoes every project's sync while the smoke runs show both runtimes take the intended action | Revert the completion and hard-cut lessons until a paired trial passes | run the trial |
| The subject page | A new page at https://claude.ai/artifact/DaRPywazwSiM5gTxbnDMBT, because the old page at https://claude.ai/artifact/1kmVRY8AvwRkf1KwqAuSxM no longer opens | Drop the new page and keep the subject without one | drop the new page |

## Steps

- [x] 1. Project rules: the Build playbook for lessons 1 and 5, the Bug fix playbook and `best-api` for lesson 2, `verify` for lessons 6 and 16, its command reference for lessons 10, 11 and 12, `best-api` repair for lesson 12, the architecture reference's Hard cut for lesson 7 and `plate-plugins` for lesson 13; then `pnpm run prepare`, `sync-resources.mjs --check` and `check-playbooks.mjs`. Proof: the prepare and check logs. Closed by `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/prepare-a3.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/sync-resources-check-a3.log` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/check-playbooks-a3.log`, after round 3's fixes. Deviation: lesson 6 is reverted, as Open work says.
- [x] 2. Shared lessons in dotai through `sync-pstack` Lesson mode: block text for lessons 1, 3, 4, 8, 9, 14 and 15, `plan-page`'s shape for lessons 7 and 8, and `freeze.mjs --parent` refusing to drop an earlier round's uncommitted path, with a test that fails on the old helper. Proof: the old-helper failure log and dotai's checks. Closed by `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/dotai/freeze-test-old-helper-a4.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/dotai/freeze-test-hash-variant-a1.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-2/quoted-pre-z-a1.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-2/freeze-tests-a1.log` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/dotai/dotai-tests-a5.log`, in dotai ba81489 and bb86e8c.
  Deviation: after the trail review, `plan-open.mjs` also reads a closed box's artifact, owner and stop from the uncommitted lines indented under it, never from a nested box; `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-4/plan-open-tests-a1.log`.
- [x] 3. The hook refuses a removal inside a `bash -c`, `sh -c`, `zsh -c` or `eval` string in the forms its tests run, with tests, replayed over this project's past transcript commands, with a sample of each denial class read and its message checked against every rule that prescribes the command. Proof: the test log, the replay log and the sample. Closed by `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/hook/hook-tests-old-a2.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/hook/hook-tests-new-a5.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/hook/replay-a1.log` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/hook/replay-split-a1.log`.
- [x] 4. Writing passes: `deslop` and `no-comments` on `freeze.mjs` and the hook, `unslop` on the prose. Closed by the writing rows in `docs/plans/2026-10-08-suggestions-reflect-lessons.decisions.tsv`, with comment reviews `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/comments/reply.md` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/comments-2/reply.md`.
- [x] 5. Panel on the combined diff with the configured seats, because lessons 1, 5, 6, 7 and 9, the frozen tree and the hook change a gate's trigger or pass condition. Closed by three rounds, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-1/seat-sol.txt`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-2/seat-sol.txt` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-3/seat-sol.txt` with the other seats beside them; round 1's two criticals and round 3's one were applied, round 2 found none, and a fourth round, after the plan-open build restarted the count, found none; `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/panel/round-4/seat-sol.txt`.
- [x] 6. dotai commit and push once its checks pass; `apply` and `verify` on plate-2; the smoke set in both runtimes, one prompt per changed gate and per reversed lesson. Closed by dotai ba81489, bb86e8c, 027ee2b and 7d68fd7, pushed; `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/apply-a4.log`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/sync-verify-a4.log` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/smoke-a3.log`, with every numbered clash of the three smoke runs sorted in `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/clash-sort-a1.md`, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/clash-sort-a2.md` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/clash-sort-a3.md`.
- [x] 7. Decision-trail review by `codex:gpt-6.1-sol @xhigh`, because `freeze.mjs` and the hook are changed shared scripts. Closed by `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/trail/review-sol.md` and, after the plan-open build, `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/trail-2/review-sol.md`; the Close's Attention lists each item and its outcome.
- [x] 8. Close, fold into `docs/plans/topics/correct.md`, render and publish. Closed by `docs/plans/topics/correct.md` and https://claude.ai/artifact/DaRPywazwSiM5gTxbnDMBT.

## Close

### Reversals and deviations

- Lesson 6 is reverted. Both runtimes declined it in the first smoke, because a checkout run can pass on another session's uncommitted file and still fail in CI. `.agents/rules/verify.mdc` holds its text from before this run, and the question waits in Open work.
- The first smoke fix of lesson 14 reversed the lesson. Round 3 caught it as a critical finding and restored the lesson's two exits, with pass-through spelled out.
- The hook's claim narrowed in round 1 to the forms its tests run, because shell syntax is too large to list.
- Step 2 gained `plan-open.mjs` after the first trail review showed it repeats the pagination reflect's backlog item.
- The `built:` row before round 4 first listed round 3's fixes as a build. A later row narrows it to the `plan-open.mjs` change.
- The Defaults row on the paired Eval trial first called the batch narrow. The second trail review rejected that, so the rules stay adopted with routing proof only and the trial is Open work.

### What landed

- dotai `ba81489`, `bb86e8c`, `027ee2b` and `7d68fd7`, pushed:
  - block lessons 1, 3, 4, 8, 9, 14 and 15, with every panel and smoke fix;
  - plan-page's shape for lessons 7 and 8;
  - `freeze.mjs --parent`'s refusal and `plan-open.mjs`'s reading of indented lines, each with tests.
  plate-2 and the user-scope sync-pstack are synced from `7d68fd7`.
- plate-2, uncommitted:
  - lessons 1, 2, 5, 7, 10, 11, 12, 13 and 16, in the Build, Bug fix and Plan playbooks, the architecture reference, `best-api`, `verify` and its command reference, and `plate-plugins`;
  - the Standing stop line in AGENTS.md;
  - the workflow guide;
  - their regenerated skills.
- User scope:
  - `~/.claude/hooks/block-unsafe-rm.mjs` runs `rm-denials.mjs`, which refuses a removal inside a `bash -c`, `sh -c`, `zsh -c` or `eval` string in the forms `rm-denials.test.mjs` runs;
  - `~/.claude/CLAUDE.md` names the scanner and its test.

### Proof and its limits

- **`freeze.mjs`.** The refusal fails on the old helper. It passes its cases:
  - a named path and a named directory;
  - a new chain;
  - an unrelated owner commit;
  - an untracked path only the parent holds;
  - a committed symlink;
  - a name git quotes.
- **`plan-open.mjs`.** Its new tests fail on the old helper, and all 15 plan-open tests pass.
  - With `PSTACK_BASE` at each root commit, it refuses no box the old helper accepted.
  - It newly accepts 1,613 wrapped boxes in plate-2 and 16 in ellie.
  - Some of those boxes cite a code example, not closing evidence, as Open work says.
- **The hook.** All 20 of its cases pass, and 9 of them fail on the old hook.
  - Replayed over this project's 78,602 past commands, it loses no old refusal and adds 9, each a real removal.
  - Rarer forms still reach the prompt, as before.
  - The refusals it shares with the old hook were not reread.
- **Rules.**
  - `pnpm run prepare`, `sync-resources --check` and `check-playbooks` pass.
  - `sync-pstack verify` passes on plate-2.
  - dotai's 133 tests and `validate-skills` pass.
- **Routing.** Smoke a3 matches the intended behavior for all six prompts in both runtimes.
  - The smoke proves routing only, under a read-only harness.
  - No paired Eval trial compared the changed completion and hard-cut rules with their text before.

### Attention

reviewed by codex:gpt-6.1-sol @xhigh, twice: `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/trail/review-sol.md` and `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/trail-2/review-sol.md`

- Warning, accepted: smoke a2 did not show the removal's reproduction landing as a test. That part clashes with the existing ban on removal-assertion tests, and a Defaults row accepts the narrower proof.
- Warning, fixed: two backlog items repeated the pagination reflect's. `plan-open.mjs` was built. The known-failure list stays in the backlog, because it changes how CI's blocking gate judges 25 steps.
- Warning, fixed: the hook's corpus claims now name the 22 commands a search flagged and the 9 refusals the replay added.
- Warning, fixed: the suggestions plan's Reflect summary now describes the refusing freeze, says three items were built and says lesson 6 was reverted.
- Warning, fixed: `no-comments` now runs through its skill.
- Warning, open: no paired Eval trial ran. The rules are adopted with routing proof only, and the trial is Open work.
- Warning, fixed: the corpus claim about sampled boxes is narrowed, and tightening the artifact pattern is Open work.
- Nit, fixed: the corpus rows that claimed every plan are superseded by the full run.

### Counts

8 steps, 16 accepted lessons, 3 backlog builds and the paired Eval trial make 28 items: 26 done, 0 partial, 1 skipped, 0 blocked and 1 open.
- The skipped item is lesson 6, which is reverted.
- The open item is the Eval trial owed by the changed completion and hard-cut rules.
- The other seven backlog items and the gaps above are Open work, each with an owner and a stop.

## Open work

- The seven backlog items this run does not build, each tracked in `docs/plans/topics/correct.md` Open work at the fold. owner: zbeyens. stop: each item's own stop below.
  - A check that refuses a mechanism's replacement, or a new plan iteration, without the `best-api-review` the Build playbook owes. owner: zbeyens, through `/pstack:correct`. stop: the next sync-pstack lesson batch, or 2026-11-08.
  - `decisions-check.mjs` refusals that name their fix, and a single-row refusal that points at `--from`. owner: zbeyens, through sync-pstack. stop: the next sync-pstack lesson batch, or 2026-11-08.
  - A `pnpm check` step that typechecks platejs specs and `.slow.*` files against a shrink-only baseline. owner: zbeyens. stop: the step lands or `check.mjs` lists it as manual.
  - The `cli-test` step builds plitejs before it runs. owner: zbeyens. stop: the step changes.
  - A `--continue` flag for `tooling/scripts/check-core.mjs`. owner: zbeyens. stop: the flag lands.
  - A shrink-only known-failure list that `check.mjs` reads for steps red at base. owner: zbeyens. stop: the list lands.
  - The seat launch form exits with `cross.mjs`'s status, so a completion notice shows a failed seat. owner: zbeyens, through sync-pstack. stop: the next sync-pstack batch, or 2026-11-08.
- Step 3 first read "The hook refuses a removal inside a `bash -c`, `sh -c`, `zsh -c` or `eval` string". The panel's first round showed shell syntax is too large to list, so the claim covers the forms the tests run. The hook misses rarer forms, such as an option with a value before `-c`, `command eval`, `if rm`, `xargs -n 1 rm`, an absolute `find` or `git` path, nesting past four levels and a quoted `<<`, and they still reach the permission prompt. A pattern search of the 78,602 past commands flagged 22, each read in full, and none of them uses a missed form; that search cannot see every form, such as `r""m`. owner: zbeyens. stop: a run hits a removal prompt in one of those forms, or 2026-11-08.
- The hook refuses some commands that remove nothing, such as `echo bash -c 'rm a.txt'`. Replayed over the 78,602 past commands, the new hook adds 9 refusals, each a real removal; refusals it shares with the old hook were not reread. owner: zbeyens. stop: a false refusal in real use, or 2026-11-08.
- `freeze.mjs --parent` compares `HEAD` with the parent, so a path the owner committed after the parent freeze and then changed again also triggers the refusal. Recording each freeze's base in its commit would compare the base with the parent instead. owner: zbeyens, through sync-pstack. stop: the next sync-pstack lesson batch, or 2026-11-08.
- The freeze test groups several cases in one test. owner: zbeyens. stop: the next change to the freeze test, or 2026-11-08.
- Lesson 6 is reverted. It said that when a task's files depend on uncommitted work the task did not write, the acceptance check runs in the checkout and each failing step reruns at `HEAD`. In the first smoke both runtimes kept the base-plus-patch worktree instead, because a checkout run can pass on another session's uncommitted file and still fail in CI. How to attribute the steps that fail only because the task shares files with other sessions' uncommitted work needs a plan. owner: zbeyens. stop: that plan's Close, or 2026-11-08.
- The first smoke named 27 rule clashes that predate this change, each sorted in `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/clash-sort-a1.md`, such as the ban on removal-assertion tests against a panel reproduction, and whether a gate-owed rebuild iteration's rounds count in its parent's log. owner: zbeyens. stop: the next sync-pstack lesson batch, or 2026-11-08.
- The second smoke left two wording items in the changed rules, sorted in `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/clash-sort-a2.md`: whether a Pursue from a review a gate owes counts as a review the owner asked for, and AGENTS.md's Standing stop saying the Plan playbook raises the question without naming its two exemptions. The third smoke added two, sorted in `docs/plans/artifacts/2026-10-08-suggestions-reflect-lessons/smoke/clash-sort-a3.md`: plan.md exempting any cut a Pursue plan continues where AGENTS.md exempts only the cuts it names, and whether a measured run after the lint fix rewrites a file the formatter touches, which is inferred. owner: zbeyens. stop: the next sync-pstack lesson batch, or 2026-11-08.
- `plan-open.mjs` and the other pstack helpers end with `console.error` and `process.exit`, so a long report written to a pipe on macOS is cut off and hides later refusals; the first full corpus run lost findings this way. owner: zbeyens, through sync-pstack. stop: the next sync-pstack lesson batch, or 2026-11-08.
- No paired Eval trial compared the changed completion and hard-cut rules with their text before, so they are adopted with routing proof only (Defaults: run the trial). owner: zbeyens. stop: the trial runs, or 2026-11-08.
- `plan-open.mjs` now reads a wrapped box's indented lines, and its artifact pattern accepts any backticked text with a slash, dot or space. A full corpus run found newly accepted boxes whose backticked text is a code example, not closing evidence, such as `editor.update((tx) => tx.*)`. Its commit branch also accepts any run of 7 or more hex characters, such as a date written 20261108, a closed finding box takes owner and stop from an indented line where a plain finding item does not, and a comment-only line ends a box's block. owner: zbeyens, through sync-pstack. stop: the next sync-pstack lesson batch, or 2026-11-08.
- The hook does not refuse in-place inline edits such as `perl -pi -e` or `sed -i`, which the global rules ban (Defaults: refuse inline edits). owner: zbeyens. stop: the owner says "refuse inline edits", or 2026-11-08.
