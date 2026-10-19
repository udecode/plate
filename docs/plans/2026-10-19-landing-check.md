# Land each task with only the checks it needs

Status: building, waiting on the landing check
Page: https://claude.ai/artifact/LgCVnj4DFGNgPNuufjNNch
Playbook: build

## Brief

### What will change?

This builds steps 1 to 5. A landing runs only the checks its changed files reach, so a docs change skips test suites. Load flakes are fixed, property tests replay one seed, and a daily run checks everything.

### What could go wrong?

A change can break a test that its paths do not pick, and only the daily run catches it. The docs checks no longer block a landing. A bad seed the daily run finds needs a task to fix.

## Teach

The full check is the list of lint, audit, type and test steps that CI used to run. CI on next is off, so every task runs the check itself before it lands.

Until now every landing ran every step. Under the load other sessions put on this Mac, that took over twenty minutes, heavy tests timed out at random, and the core audits ran the package tests a second time. Property tests drew a new random seed each run, so a red run could be bad luck.

Now a landing always runs the cheap steps and picks the test, Plite, CLI and www steps from the files it changed. A change to shared config still runs everything. A test gets 30 seconds before it counts as hung. Property tests replay one seed, and a daily job runs the whole check with fresh seeds.

## Main changes

- `pnpm check --affected` reads the files changed since the merge base with `origin/next`, untracked files included, and `planAffected` in `tooling/scripts/check.mjs` maps them to steps. A step with no `affected` rule always runs. `test`, `plite-test`, `cli-test` and `www` run when a path they depend on changed, so `cli-test` also runs for `packages/platejs/` and `packages/plitejs/`, whose source its tests compile against, `test-slow` runs only the changed slow files, and `review-ledger`, `knowledge` and `www-build` never run. A change under the global paths, such as `turbo.json`, `tooling/config/` or the lockfile, runs every step but those three. With no merge base the command fails instead of guessing.
- `core-audits` no longer runs the package test suites, which `plite-test` and `cli-test` already run. It still collects each package's test files, so an ambient value declaration with no generic type config still fails it.
- `tooling/config/bunTestSetup.ts` sets fast-check's global seed from `FAST_CHECK_SEED`, `20261019` by default, and `random` keeps a fresh seed. The generated test-partition tasks list the variable in their `env` beside `CI`, so turbo's strict env mode passes it to them. A root `globalEnv` would hash it into every task, which `entrypoint-turbo.test.mjs` forbids.
- Both Bun test runners, `test-suite.mjs` and `run-entrypoint-task.mjs`, pass `--timeout` from `BUN_TEST_TIMEOUT_MS`, 30 seconds, in `tooling/config/test-suites.mjs`. The fast suite's own case and suite budgets still judge speed. Bun's 5 second default only bounded hangs, and it failed Plite scale cases that build 10,000 records whenever turbo ran every partition at a load near 40. `bunfig.toml` cannot set it, because Bun ignores a `timeout` key there.
- The link toolbar's iframe-blur test waits for the input to leave with `waitForElementToBeRemoved`. A failed `toBeNull` inside `waitFor` made Bun format the whole DOM element on each poll, about a second each, which blew the five-second limit under load.
- The CLI watch tests wait up to 30 seconds for a regenerate. A passing case still returns as soon as its condition holds.
- `AGENTS.md`'s Proof and tooling section tells every `land.mjs` run to pass `--check 'pnpm check --affected'` and names the daily full run. `CODING_STANDARDS.md`, `docs/development/enforcement.md` and `docs/development/agent-skills.md` describe the new mode.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Slow tests at landing | Only the slow test files the task changed (look) | Every slow test of each package the task touched; no slow tests at landing | slow by package | big |
| Docs checks at landing | Never, the daily run checks them (look) | Every landing runs them | docs checks back | big |
| Where the full run lives | A daily task on this Mac at 4am (look) | Turn CI on next back on | ci back | big |
| Production build at landing | Never, the daily run builds it (look) | Build when the site, its registry or the docs change | build on www | big |
| How a landing picks test steps | By folder, with each package's own dependencies named by hand | Read the package graph to pick every dependent | package graph | small |
| CLI suite at landing | When the CLI, Plate or Plite package changed | Whenever any package changed | cli on packages | small |
| Finding the commit that broke a step | The daily run names the commit it checked | Search back for the first bad commit | find first bad | small |
| Property test seed | One fixed seed at landing, fresh seeds daily | A fresh seed every run | random seeds | small |
| Slow CLI watch tests | Wait up to 30 seconds | Make the watch tests faster now | cli speedup now | small |
| How long one test may run | 30 seconds before it counts as hung (look) | Keep 5 seconds and fix each slow case | five second tests | small |
| Workflow trial run | Skipped, the owner said fast | Run the workflow trial | full | detail |

## Steps

- [x] Step 1. Land with the affected check. `AGENTS.md` names the command, and `land.mjs` takes it as `--check`.
- [x] Step 2. Fix the link iframe flake and give the CLI watch tests a 30 second wait.
- [x] Step 3. Stop `core-audits` from rerunning package tests, and keep `review-ledger` and `knowledge` out of the landing check.
- [x] Step 4. Add `pnpm check --affected`.
- [x] Step 5. Replay one fast-check seed in every Bun run, with `FAST_CHECK_SEED=random` for the daily run.
- [x] Schedule the daily full check as the `plate-daily-full-check` task, 4am each day.
- [ ] Land through `land.mjs --check 'pnpm check --affected'`.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| Planner test and mutants | `ci-workflow.test.mjs`; `planner-mutants-a1.log`; `cli-rule-mutant-a1.log` |
| Planner replay on recent commits and the six v2 squashes | `affected-replay-a2.log`; `squash-replay-a2.log` |
| Link iframe test, five runs and a mutant | `link-five-a1.log`; `link-iframe-mutant-a1.log` |
| CLI suite under load | `cli-test-rebudget-a1.log` |
| Fixed seed reaches the laws | `law-seed-198320648-a1.log`; `law-seed-default-a1.log` |
| Tooling tests | `tooling-tests-a2.log` |
| Landing check on the squashed commit | pending |
| Thermos review | skip: fast |
| Hand drive | skip: no browser-visible change |
| Workflow trial | skip: fast |

## Open work

- Make the CLI watch tests fast instead of patient, by sharing one TypeScript session across cases. owner: t_7c8c949f. stop: none.
- About 49 other `waitFor` presence checks in www specs may pay the same DOM-format cost on each failed poll. owner: t_18a7003e. stop: none.
- One CLI watch case waited 30 seconds for a regenerate that never came, which points at a missed watch event rather than a slow host. owner: t_568bb940. stop: none.
- Steps 6 to 8 of the testing plan: cut tests that cannot fail, update test-audit, then run the full audit. owner: t_fb191618 and t_8ea0d74e. stop: none.
