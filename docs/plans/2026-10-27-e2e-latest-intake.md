# Intake: what to steal from the latest e2e

Status: done: 20 items, 1 chip offered, 0 folded
Page: https://claude.ai/artifact/Dq2f63kv4EJKrgXyxtJXqP
Playbook: verdict

Steal one thing. When a Plate browser spec fails, it should save the editor's state in a file the agent reads before it drives the browser again. e2e's own skill now gives the same advice. Its commit c5e32485 tells the agent to fix a failed test from its trace page instead of running the flow again. Today a failing Plate spec leaves a screenshot and Playwright's accessibility snapshot. The model value, both selections and focus reach that folder only when the spec attaches them itself. The rest of the launch post is either already in Plate or conflicts with how Plate proves editor behavior. e2e stays rejected as Plate's test runner. Its targeted typing still calls `locator.fill`, it reads a collapsed caret as no selection, and its mobile driver refuses URLs. One design task, t_8ec3a26c, decides what the failure file holds.

## Brief

### What will change?

Nothing in Plate changes yet. One design task will decide what a failing browser test saves about the editor, and where the docs tell the agent to read that file first.

### What could go wrong?

If the saved file says too little or too much, agents will still open the browser again to work out a failure, and the task gains nothing. The design has to show one real failure figured out from that file alone.

## Pushback

- **"Run only the affected tests" means a model's guess.** e2e drops a test when a model rates it and its setup under 20% likely affected. A confident wrong guess skips the test that would catch the bug, and nothing flags the skip. Plate picks check steps by path.
- **`--watch` is a local loop.** e2e's own CLI docs refuse it under CI. It makes reruns faster and proves nothing new.
- **The post sells the runner, but the useful change is in the skill.** The docs commit that tells the agent to read the trace page before replaying is the habit worth taking, and Plate can take it without the runner.
- **Telemetry is still on by default.** e2e sends usage counts unless you turn it off, and Plate sends nothing outward without the owner's word.
- **Plate's rejection record is old but still right.** It judged e2e 0.15.2, and the repo now ships 0.21.3. Held keys exist now, replay checks for a real change, and feedback asks for consent first. The reasons that decided the rejection did not change.

## Items

| # | Item | Outcome | Scope | Strongest reason | Evidence | Next |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Run only the tests a change affects, picked by a model (`--changed-since`) | Stop | proof | A confident wrong guess skips the test that would catch the bug, and nothing flags it. Plate selects by path, so a test its rules reach always runs | e2e `docs/filters.mdx:72`, `packages/decision/src/filter.ts:140`. Plate `tooling/scripts/check.mjs:46`, `tooling/scripts/check-plite.mjs:191` and `:287` | none |
| 2 | Rerun tests on save (`--watch`) | Stop | proof | Plate's runner already reuses each batch whose proof fingerprint still matches, so a rerun redoes only what changed. A watcher adds a loop and no proof | e2e `docs/reference/cli.mdx:773-777`. Plate `apps/plite/scripts/plite-browser-runner.mjs:888-905`, `.agents/rules/verify/references/commands.md:85` | none |
| 3 | Order tests or balance shards by the last run's timings | Stop | proof | The four Chromium shards it would balance skip PRs into `next` since 92f78d803f, and no timing shows an imbalance | Plate `.github/workflows/plite-ci.yml:157-159`, `apps/plite/scripts/plite-browser-runner.mjs:800-812`. `gh run list` shows the last green Plite CI run on 2026-10-08 and skips after it | none |
| 4 | Stop the whole run at a time budget (`--max-duration`) | Settled | proof | Plate already bounds setup and each batch, and its Time budget rule caps every command at an hour | `apps/plite/scripts/run-plite-browser.mjs:105-112`, the Time budget rule in `AGENTS.md` | none |
| 5 | Save the app's state when a test fails | Open question | proof | The model value, both selections and focus reach a failure folder only when a spec attaches them. The getters exist, and no shared desktop fixture calls them | e2e `packages/e2e/src/run/failure-evidence.ts:54`. Plate `apps/www/playwright.config.ts:54-60`, `apps/plite/playwright.config.ts:112-121`, `packages/test/src/playwright/artifacts.ts:63`, `packages/test/src/playwright/harness.ts:151` and `:422`, and the device lane's fixture at `packages/test/src/device/lane.ts:984` | t_8ec3a26c |
| 6 | Read the failure evidence before driving the browser again | Open question | proof | The habit is worth taking, but the rule needs item 5's file to point at. Today verify names the owner before patching and leaves the reading order open | e2e `skills/e2e/SKILL.md:117`, from c5e32485. Plate `.agents/rules/verify/references/editor-proof.md:100` | t_8ec3a26c |
| 7 | Test-writing habits: start at the tested screen, wait for state instead of time, rerun one test, turn what a drive finds into a test | Settled | proof | verify already asks for each one | `packages/test/src/playwright/index.ts:230`, `.agents/rules/verify/references/editor-proof.md:20`, `.agents/rules/verify/references/commands.md:75-77`, the Drift section of `.agents/rules/verify/references/hand-drive.md` | none |
| 8 | Adopt e2e as Plate's browser test runner | Stop | proof | Its targeted typing still calls `locator.fill`, which Plate bans as editor proof. It reads a collapsed caret as no selection, and its mobile driver refuses URLs | e2e `packages/e2e/src/agent/action-dispatcher.ts:374`, `packages/web/src/actions.ts:125`, `packages/web/src/in-page/read-semantics.ts:1032`, `packages/mobile/src/engine.ts:101`. Plate `packages/test/README.md:162`, `.agents/rules/verify/references/editor-proof.md:72` | none |
| 9 | Refresh Plate's e2e rejection record for 0.21.3 | Settled | proof | The record names the version it judged, and the reasons that decided it still hold. This page lists the side reasons that changed | The comparison row in `docs/plans/topics/proof.md`, `docs/plans/2026-10-02-proof-device-lane.md:718`. e2e `packages/web/src/browser.ts:268-277`, `packages/e2e/src/cache/anchors.ts:282` | none |
| 10 | Try e2e's explore or bug-bash mode on Plate's demos | Stop | proof | A clean explore run closes no editor gate, and telemetry is on by default. Plate's playtest and sweep rounds already look for bugs on the demos | e2e `docs/telemetry.mdx:10`, `skills/e2e/references/explore.md:77`. Plate `.agents/rules/verify/references/playtest.md`, `.agents/rules/verify/references/sweep.md` | none |
| 11 | Before and after action observers, and measured keyboard state | Stop | proof | Plate's editor proof already asks for the event chain and limits keyboard proof to the recorded emulator and Gboard version. A visible keyboard proves no composition behavior | e2e `docs/reference/agent.mdx:83`, `packages/e2e/src/agent/executor.ts:139`. Plate `.agents/rules/verify/references/editor-proof.md:25` and `:95-98` | none |
| 12 | Lint chained type assertions | Settled | none | Plate already runs the same upstream rule, and allows only an explicit `unknown` or `any` bridge | `tooling/oxlint/anti-slop-plugin.mjs:6` loads the upstream rule, and `:29-43` and `:158-162` refine it | none |
| 13 | Lint parsed JSON so it enters as `unknown` | Stop | none | Plate adds a lint rule only after it fails on a real past mistake, and this run's search found no Plate bug that came from unchecked JSON | `docs/development/enforcement.md:7`. Runtime validation stays with the boundary that owns the input, per `oxlint.config.ts:989-990` | none |
| 14 | Docs checks for anchors, synced snippets and logos | Settled | none | Plate already checks rendered anchors, docs code contracts and stale teaching | `apps/www/scripts/check-docs-source-parity.mts:367` and `:703`, `tooling/scripts/check-plate-doc-code-contracts.mjs:874` | none |
| 15 | A nightly job that installs packed packages into example apps | Stop | none | Every registry PR already builds both templates against the local workspace packages, and every source change type-checks a consumer against the built declarations. A nightly run adds a schedule, not a check | `.github/workflows/registry.yml:72-84`, `tooling/scripts/check.mjs:183`, `package.json:109` | none |
| 16 | Compare behavior before timing in A/B benchmarks | Settled | performance | Plate's benchmark rules make every arm show it did the work its name claims, and keep no perf fix without a correctness oracle | `.agents/rules/benchmark.mdc:93-96` and `:153-163` | none |
| 17 | A bot that checks community PRs and closes stale ones | Stop | none | Plate lets a contributor open a fix without an issue, and its PR body check already asks for Why and Verification. An issue requirement or auto-close would change that policy | `CONTRIBUTING.md:22`, `.github/workflows/pr-body-check.yml:3` and `:48` | none |
| 18 | Keep agent docs honest about what CI runs | Settled | none | Plate's CI file says PRs into `next` skip CI, CONTRIBUTING names `pnpm check` as the local gate, and every landing runs `pnpm check --affected` | `.github/workflows/ci.yml:28-30`, `CONTRIBUTING.md:71-72`, the Proof and tooling section of `AGENTS.md` | none |
| 19 | Report how many tests ran from cache, replay or a live model | Stop | proof | Plate has no replay cache, and verify never counts a cached result as proof | e2e `packages/e2e/src/telemetry/events.ts:284`. Plate `.agents/rules/verify.mdc:36-37` | none |
| 20 | A verification skill and feature map for agents | Settled | proof | Plate's verify rule and its hand-drive reference already do this job | `.agents/rules/verify.mdc`, `.agents/rules/verify/references/hand-drive.md`, `docs/plans/2026-10-13-verify-hand-drive.md:13` | none |

## Order

1. Start t_8ec3a26c. It is the one place where e2e has something Plate lacks. It decides what a shared fixture saves when a browser spec fails, and where verify tells the agent to read that file first. Item 6 waits on it because the reading rule needs the file to exist.
2. Nothing else. Each other item is either already in Plate or a Stop.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where the failure-file work happens | A separate design task you start from its card | Build it in this session now | build it here | detail |

## Close

This run landed this page and its decision log, and nothing else. It offered one task, t_8ec3a26c, for items 5 and 6.

This page reverses three claims from my first chat answer. That answer said the hand-drive rule pushes agents to run flows again. `hand-drive.md` shows the hand drive is one page check before a change closes, not a debugging loop. It suggested longest-first scheduling, which item 3 now stops, because the shards it would speed up skip PRs into `next`. It also called trace-on-failure for www settled, and that is now the design task's call.

The proof is source reads. e2e was read at 1a7a331b and Plate at 3312dc03d0. Four Codex seats on gpt-6.1-sol at medium read the runner, failure evidence, the rejection record and repository hygiene, and each covered every source in its brief. I rechecked the spans each outcome rests on. Nothing ran except `gh run list` and `gh run view` on Plite CI. This run installed nothing and ran no tests or browsers. The owner's "research into e2e repo" widened intake's usual reads to the e2e source. Both owner asks are answered. The chat reply, as corrected above, answers the first, and this page answers the second.
