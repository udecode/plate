# Playtest: the agent tests a feature by hand before its build closes

Status: executed: playtest is live in verify and the Build playbook, waiting on your commit
Page: https://claude.ai/artifact/B2WiepzLiFr7g7FYSH5vap
Playbook: authoring-a-skill

## Brief

### What will change?

A feature build now ends with a playtest. The agent tests the feature like a Google Docs user, runs its tests in every browser and fixes what it finds. You can also ask for one any time.

### What could go wrong?

It adds about an hour to a feature build. Its first run showed the review-tree pivot broke five suggestion tests that passed before it. Its Firefox and WebKit failures were never checked against older code, and no trial yet shows it beats today's checks.

## Teach

Today a feature build closes once its own tests pass and the agent opens each changed page once. On 2026-10-16 a deeper pass over suggestions found six editor bugs and two test-setup problems that its build never caught.

The playtest has three parts. A scenario list per feature says what a reference editor such as Google Docs does for each action. The agent works through that list in the built-in browser, then improvises with six set moves, such as repeating an action elsewhere, reading the editor's state after every action. A script runs the feature's tests in Chromium, Firefox and WebKit plus Plite, and reruns each failure at an older commit to tell new breakage from old.

At a build's close, every bug the pass finds on the feature gets fixed in the build, old ones included. A missing feature or a design call becomes a suggested task. Run on its own, the pass files suggested tasks instead.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Adopting it as a build step | Now, on your word, without first trialing it against planted bugs; a suggested task holds that trial (look) | Trial first, then adopt | trial first | big |
| Old bugs the pass finds during a build | Fixed in the build, as you asked | Only bugs the build introduced | new bugs only | big |
| Where it runs on its own | At a feature build's close; you run it any other time | Also during a verdict, to feed the plan | verdict too | big |
| A standalone run | Files suggested tasks and edits no product code | Fixes what it finds | fix standalone | small |
| Time the agent spends improvising | About 45 minutes after the scenario list | No limit | no limit | small |
| WebKit in the test run | Included, though one test-setup problem fails most WebKit tests until its task lands | Chromium and Firefox only until then | skip webkit | small |
| Where the scenario lists live | Next to the editor behavior spec, one file per feature | Inside the verify skill's folder | in verify | small |
| Proof of the runner's commit comparisons | Chromium only, because the loaded host spent the hour before Firefox's could run (look) | Rerun Firefox's comparisons now | firefox controls | small |
| This plan's page | A page of its own, because the sweep plan still holds the proof page open | An iteration of the proof page | proof page | detail |

## Public API

The runner is new tooling, not a package API.

```sh before
```

```sh after
# tooling/scripts/playtest.mjs
node tooling/scripts/playtest.mjs scope packages/plitejs/src/authored/tree/record.ts
node tooling/scripts/playtest.mjs specs suggestions --dir docs/plans/artifacts/2026-10-16-agent-pass --base 770482edcc
```

## Main changes

- `docs/editor-behavior/scenarios/<feature>.md` holds one feature's scenario catalog: the reference editor, its routes, the source paths that trigger the pass and the feature's spec files in front matter, then a Read back section and the scenario table.
- `tooling/scripts/playtest.mjs` reads a catalog. `scope` names the catalogs a file list touches. `specs` serves www from source, runs the catalog's www specs in each engine and its Plite specs under the repository's Node version, then reruns each failure at `HEAD` when the tree has uncommitted work and at `--base`, each in a proof worktree, and writes each run's report to the next free `specs-a<N>.md`.
- `verify` gains a Playtest section and its reference; the Build playbook runs it after the last slice's review fixes and before the close's writing passes and panel.

## Steps

- [x] 1. Seed `docs/editor-behavior/scenarios/suggestions.md` from the 2026-10-16 suggestions test pass, with its findings added as rows. Proof: `playtest.mjs scope` names it for an authored tree file and names nothing for a docs page. Done: `docs/plans/artifacts/2026-10-16-agent-pass/scope-a1.log`.
- [x] 2. Write `tooling/scripts/playtest.mjs` and its test. Proof: the test passes, and a catalog that names a missing spec file is refused. Done: `docs/plans/artifacts/2026-10-16-agent-pass/tests-a1.log`, `docs/plans/artifacts/2026-10-16-agent-pass/mutants-a1.log`.
- [x] 3. Add verify's Playtest section and `references/playtest.md`, then `pnpm run prepare`. Proof: `sync-resources.mjs --check` passes. Done: `docs/plans/artifacts/2026-10-16-agent-pass/prepare-a5.log`.
- [x] 4. Add the Build playbook step and the workflow guide line. Proof: `check-playbooks.mjs` passes. Done: `check-playbooks.mjs` reported every project playbook matches pstack v0.9.84.
- [x] 5. Run `playtest.mjs specs suggestions` end to end with `--base 770482edcc`. Proof: its failure list matches the 2026-10-16 matrix for Chromium and Firefox, and its control columns attribute each failure. Done for Chromium: `docs/plans/artifacts/2026-10-16-agent-pass/specs-a1.md`; Firefox's comparison is accepted as skipped under the Defaults row "firefox controls".
- [x] 6. Smoke the route with a plain build-close request in both runtimes. Proof: each names the playtest unprompted. Done: `docs/plans/artifacts/2026-10-16-agent-pass/smoke-a1.out`.
- [x] 7. Writing passes and `pnpm lint:fix` on the task's files. Done: `docs/plans/artifacts/2026-10-16-agent-pass/lint-task-a3.log`.

## Close

Landed, uncommitted on `next`: the suggestions scenario catalog at `docs/editor-behavior/scenarios/suggestions.md` (24 rows); `tooling/scripts/playtest.mjs` with four tests; verify's Playtest section and `references/playtest.md`; the Build playbook's Playtest step; and two lines in the workflow guide. The owner renamed "agent pass" to "playtest" mid-run; the plan file and its run directory keep the old slug, because logged proofs cite those paths.

Proof, from the decision log's `scope:` cells:

- `scope` names the suggestions catalog for an authored-tree file and none for a docs page or a sibling path (`docs/plans/artifacts/2026-10-16-agent-pass/scope-a1.log`).
- The four tests pass on the final bytes, and each of four planted defects fails at least one (`docs/plans/artifacts/2026-10-16-agent-pass/tests-a2.log`, `docs/plans/artifacts/2026-10-16-agent-pass/mutants-a1.log`).
- `parseRun` reproduces the morning matrix's counts from its raw logs (`docs/plans/artifacts/2026-10-16-agent-pass/parse-logs-a2.log`).
- A plain build-close request routed to the playtest in Claude Code and Codex without naming it (`docs/plans/artifacts/2026-10-16-agent-pass/smoke-a1.out`).
- End to end on the final bytes, Chromium: 106 passed and 6 failed, Plite 39 passed. At `HEAD` all six fail the same way. At `770482edcc`, before the review-tree pivot, five pass and the homepage select-all spec fails the same way (`docs/plans/artifacts/2026-10-16-agent-pass/specs-a1.md`).
- Attempt 3 ran every engine at load averages near 190: Chromium and WebKit matched the morning; Firefox matched plus one new failure at `suggestion.spec.ts:519` (`docs/plans/artifacts/2026-10-16-agent-pass/specs-run-a3.md`).

Limits. Firefox and WebKit failures have no commit comparison, accepted under "firefox controls". The agent-drive half of the method ran in the morning pass, before its reference existed, and was not driven again against the written text. WebKit against a dev server still fails 80 specs on a resource error (t_2ad25b93). No paired trial shows the playtest finds more than today's checks.

Deviations. The checkout could not serve www, because another session added `mermaid`, `flowchart.js` and `viz.js` to `apps/www/package.json` without installing them, so every run went from a proof worktree at `HEAD` plus this run's files. The runner gained a dev-server restart after a Turbopack panic, refuses empty or relative routes, names a skipped build by its exit, and writes each report to a new `specs-a<N>.md`. The five started chip sessions were told which failures the pivot introduced.

Counts. Of 7 steps, 7 are done, step 5 on the accepted narrower proof, and 0 are partial, skipped, blocked or open. No panel ran, because no reviews-list row applies, and the decision-trail review's triggers do not hold.

## Open work

- The trial of the playtest against planted bugs. owner: zbeyens; stop: t_e64cb095 lands or is dropped; tracked in the chips ledger.
- Five suggestion tests the pivot broke, four bugs. owner: zbeyens; stop: t_e22bf6be, t_672ec6ca, t_1b1fc9ef and t_3c71d2f0 land; tracked in the chips ledger.
- The new Firefox failure at `suggestion.spec.ts:519`. owner: zbeyens; stop: t_8986c16e lands or is dropped; tracked in the chips ledger.

