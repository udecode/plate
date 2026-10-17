# Playtest: the agent tests a feature by hand before its build closes

Status: executed: builds keep only the playtest's test runner, waiting on your commit
Page: https://claude.ai/artifact/B2WiepzLiFr7g7FYSH5vap
Playbook: verdict

## Brief

### What will change?

A feature build still ends by running the feature's tests in every browser and fixing what fails, but no longer has the agent click through it for an hour. Ask for that with a playtest anytime.

### What could go wrong?

The trial was small, with only two old bugs to put back. A bug no test covers now waits until someone asks for a playtest. The clicking caught one of these two bugs, and the tests caught both.

## Teach

A feature build closes once its tests pass and the agent opens each changed page once. The playtest added two things on top: a script that runs all the feature's tests in Chromium, Firefox and WebKit and checks each failure against older code, and an hour of the agent clicking through a scenario list and improvising.

On 2026-10-16 the script found everything new in suggestions: two editor bugs, three tests a build left stale and two broken test setups. The clicking found one of those bugs again, plus two things Google Docs does that we don't.

On 2026-10-17 a trial put those two fixed bugs back. The usual unit tests caught one, and the script caught both, one of them only in Firefox. So builds now run just the script. Proving the clicking pays off would take about ten hour-long sessions per side, and only two old bugs exist to plant. So the clicking stays something you ask for.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What a feature build runs at its close | Only the test runner, in every browser, after a trial on two old bugs; the clicking runs when you ask (look) | The whole playtest at every build, as you approved on 2026-10-16 | drive too | big |
| A full trial of the clicking | Skipped, since it needs about ten hour-long sessions per side and only two old bugs exist to plant | Run it as a suggested task | trial the clicking | small |
| Adopting it as a build step (2026-10-16) | Now, on your word, without first trialing it against planted bugs; a suggested task holds that trial (look) | Trial first, then adopt | trial first | big |
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
- `verify` gains a Playtest section and its reference. The Build playbook runs only its spec runner, after the last slice's review fixes and before the close's writing passes and panel; the drive and improvisation run on `verify playtest <feature>`. The 2026-10-16 build ran the whole pass there, and the 2026-10-17 trial below narrowed it.

## Trial

The question: does the playtest earn its place in every feature build's close? The playtest has two halves with different costs, so the trial measured each on its own. It planted the two suggestion product bugs whose landed fixes reverse cleanly at `c5921381cf`, t_e22bf6be in `packages/plitejs/src/authored/tree/record.ts` and t_672ec6ca in `packages/plitejs/src/react/editable/mutation-controller.ts`. It reversed each fix's product hunks in a proof worktree and kept its tests, as a later regression would leave them. Three more "bugs" the 2026-10-16 pass found (t_1b1fc9ef, t_3489f812, t_3c71d2f0) turned out to be stale specs, so they had no product fix to reverse.

| Arm | t_e22bf6be | t_672ec6ca | Time | Evidence |
| --- | --- | --- | --- | --- |
| A build's usual checks: the plitejs package tests `pnpm check` runs | caught: four record tests fail planted, pass clean | missed: the React partition passes planted | 1.4 min | `baseline-plitejs-test-a2.log`, `control-plitejs-test-a1.log`, `planted-plitejs-react-a1.log` |
| The runner, Chromium | caught: `suggestion.spec.ts:757`, passes at the clean `HEAD` control | missed | 15 min for both engines and their controls | `specs-a1.md` |
| The runner, Firefox | caught | caught: both IME-in-struck-text cases at `authored-review.spec.ts:347`, passing at `HEAD` | as above | `specs-a1.md` |
| The drive, 2026-10-16 pass on the live bugs | caught: scenario S17b | out of reach: Firefox and WebKit only, and the built-in browser is Chromium | about an hour | `docs/plans/artifacts/2026-10-16-suggestions-test/results.md` |

Evidence paths without a folder are in `docs/plans/artifacts/2026-10-17-playtest-trial/`. The runner adds one planted bug over the usual checks, and the drive adds none over the runner. On the 2026-10-16 pass every new finding the drive made was a bug already filed or a gap against Google Docs (S14, S16, S19 and the Editing delete across a join), while the runner found the two product bugs, the three stale specs and two broken test setups.

A trial of the drive that `tooling/scripts/trial-power.mjs` accepts needs an incumbent that catches something in its pilot, then 10 planted cases for a claimed 50-point gain or 21 for a 30-point gain, each a separate session per arm (`power-sweep-a2.log`). At an hour per drive, that is 10 to 21 hours for the drive's arm alone, from a pool of two plantable fixes. So the drive leaves the build's close untrialed, and the Defaults row "drive too" puts it back.

## Steps

- [x] 1. Seed `docs/editor-behavior/scenarios/suggestions.md` from the 2026-10-16 suggestions test pass, with its findings added as rows. Proof: `playtest.mjs scope` names it for an authored tree file and names nothing for a docs page. Done: `docs/plans/artifacts/2026-10-16-agent-pass/scope-a1.log`.
- [x] 2. Write `tooling/scripts/playtest.mjs` and its test. Proof: the test passes, and a catalog that names a missing spec file is refused. Done: `docs/plans/artifacts/2026-10-16-agent-pass/tests-a1.log`, `docs/plans/artifacts/2026-10-16-agent-pass/mutants-a1.log`.
- [x] 3. Add verify's Playtest section and `references/playtest.md`, then `pnpm run prepare`. Proof: `sync-resources.mjs --check` passes. Done: `docs/plans/artifacts/2026-10-16-agent-pass/prepare-a5.log`.
- [x] 4. Add the Build playbook step and the workflow guide line. Proof: `check-playbooks.mjs` passes. Done: `check-playbooks.mjs` reported every project playbook matches pstack v0.9.84.
- [x] 5. Run `playtest.mjs specs suggestions` end to end with `--base 770482edcc`. Proof: its failure list matches the 2026-10-16 matrix for Chromium and Firefox, and its control columns attribute each failure. Done for Chromium: `docs/plans/artifacts/2026-10-16-agent-pass/specs-a1.md`; Firefox's comparison is accepted as skipped under the Defaults row "firefox controls".
- [x] 6. Smoke the route with a plain build-close request in both runtimes. Proof: each names the playtest unprompted. Done: `docs/plans/artifacts/2026-10-16-agent-pass/smoke-a1.out`.
- [x] 7. Writing passes and `pnpm lint:fix` on the task's files. Done: `docs/plans/artifacts/2026-10-16-agent-pass/lint-task-a3.log`.
- [x] 8. Plant t_e22bf6be and t_672ec6ca back in a proof worktree at `c5921381cf`. Proof: both product patches reverse cleanly at `c5921381cf`, and the planted tree differs from it only in those two files. Done: `docs/plans/artifacts/2026-10-17-playtest-trial/plant-check-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/t_e22bf6be-product.patch`, `docs/plans/artifacts/2026-10-17-playtest-trial/t_672ec6ca-product.patch`.
- [x] 9. Run a build's usual checks on the planted tree and on a clean control. Proof: each plant's result differs between the two trees, or the arm misses it. Done: `docs/plans/artifacts/2026-10-17-playtest-trial/baseline-plitejs-test-a2.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/control-plitejs-test-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/planted-plitejs-react-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/clean-plitejs-react-a1.log`.
- [x] 10. Run `playtest.mjs specs suggestions --engines chromium,firefox` on the planted tree. Proof: its `HEAD` control column says each plant's failure passes at `HEAD`. Done: `docs/plans/artifacts/2026-10-17-playtest-trial/specs-a1.md`, `docs/plans/artifacts/2026-10-17-playtest-trial/www-chromium-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/www-firefox-a1.log`.
- [x] 11. Size a powered trial of the drive with `trial-power.mjs`. Proof: the smallest spec it accepts at each claimed gain. Done: `docs/plans/artifacts/2026-10-17-playtest-trial/power-sweep-a2.log`.
- [x] 12. Narrow the Build step to the runner in `build.md`, the playtest reference, verify's Playtest section and the workflow guide, then `pnpm run prepare`. Proof: `check-playbooks.mjs` and `sync-resources.mjs --check` pass. Done: `docs/plans/artifacts/2026-10-17-playtest-trial/check-playbooks-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/sync-check-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/prepare-a1.log`.
- [x] 13. Writing passes on the changed prose and `pnpm lint:fix` on the task's files. Done: `unslop` and `bro` on the plan and the playtest reference; `pnpm lint:fix` skipped, because lint ignores all seven changed paths (`docs/plans/artifacts/2026-10-17-playtest-trial/lint-task-a1.log`).

## Close

Reversal. On 2026-10-16 the whole playtest became part of every feature build's close, on the owner's word, before any trial. The 2026-10-17 trial in the Trial section kept the spec runner there and moved the drive and improvisation to `verify playtest <feature>`. Changed: `.agents/playbooks/build.md`'s Playtest bullet, the playtest reference's When, Build close, Run step 3 and Findings, verify's Playtest section and the generated skill copies, and the workflow guide's Execute row. `tooling/scripts/playtest.mjs` is unchanged.

Proof, from the decision log's `scope:` cells:

- The usual checks caught the t_e22bf6be plant through four record tests and missed the t_672ec6ca plant; the clean control fails neither way (`docs/plans/artifacts/2026-10-17-playtest-trial/baseline-plitejs-test-a2.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/control-plitejs-test-a1.log`, `docs/plans/artifacts/2026-10-17-playtest-trial/planted-plitejs-react-a1.log`).
- The runner caught both plants in 15 minutes: Chromium 111 passed and 1 failed, Firefox 104 passed and 8 failed. Its `HEAD` control says each plant's failure passes at `HEAD`, and the five Firefox harness failures fail the same there (`docs/plans/artifacts/2026-10-17-playtest-trial/specs-a1.md`). This is also the first run of the runner's Firefox comparisons, which the "firefox controls" row had left unproven.
- A trial of the drive that the helper accepts needs 10 to 21 planted cases per arm (`docs/plans/artifacts/2026-10-17-playtest-trial/power-sweep-a2.log`).

Limits. Two planted bugs is a small sample, and the lead chose them, as the only two suggestion fixes that reverse cleanly; no agent arm ran, so the key never needed sealing. The drive's result comes from the 2026-10-16 pass on the live bugs, not from a drive on the planted tree. The Plite lane ran no spec, because another session's Plite server held port 3102 (t_925670a7). WebKit was left out of the run, as its dev-server resource error still fails most specs (t_2ad25b93). On this host the clean `HEAD` fails the plitejs React partition's kernel authority contract, from t_672ec6ca's landed fix; t_eeed716f owns it.

Earlier close, 2026-10-16.

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

Counts. Of 13 steps, 13 are done, step 5 on the accepted narrower proof, and 0 are partial, skipped, blocked or open. No panel ran, because no reviews-list row applies, and the decision-trail review's triggers do not hold.

## Open work

- The runner's Plite lane runs nothing while another session holds port 3102. owner: zbeyens; stop: t_925670a7 lands or is dropped; tracked in the chips ledger.

