# Plite Test Speed Optimization Loop

Objective:
Optimize Plite test speed. Stop only when three experiments after the last kept
improvement are non-conclusive or rejected.

Completion threshold:
- Final state passes script syntax, Plite app typecheck, browser package
  typecheck, smoke proof, and full Chromium proof.
- Each experiment has keep/revert/quarantine.
- Stop condition is three rejected or non-conclusive experiments after the last
  kept improvement.

Verification surface:
- Primary: `pnpm --filter plite test:plite-browser:chromium`.
- Smoke: `pnpm --filter plite test:plite-browser:chromium-smoke`.
- Static: `node --check` for changed scripts.
- Package: `pnpm --filter plite typecheck` and
  `pnpm --filter @platejs/browser typecheck`.

Constraints:
- Do not remove coverage.
- Do not accept retries or flakes as speed wins.
- Keep matrix proof more conservative than Chromium proof.
- Do not change editor runtime behavior for this lane.

Boundaries:
- Workspace `/Users/zbeyens/git/plate-2`.
- Owners: `apps/plite` runner/config and `packages/browser` Playwright helper.
- Route surface: `/examples/plite/*`.
- No GitHub, PR, release, docs-site, or public API work.

Blocked condition:
- Not blocked. A blocker would require weakening coverage, changing editor
  runtime behavior, or diagnosing a command that cannot run locally.

Work Checklist:
- [x] Requirements copied before work.
- [x] Baseline and current lane mapped.
- [x] Experiments recorded with metrics.
- [x] Kept changes verified.
- [x] Rejected experiments recorded.
- [x] Stop condition reached.
- [x] Final proof commands recorded.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | complete | Requirements checkpoint recorded. |
| Source map | complete | Runner/package/config owners identified. |
| Experiments | complete | Ledger rows #1-#16. |
| Implementation | complete | Kept runner/config/harness changes applied. |
| Verification | complete | Syntax, typecheck, smoke, and full Chromium proof passed. |
| Closeout | complete | Stop condition reached after three rejected probes. |

Verification evidence:
- Fresh syntax proof passed:
  `node --check apps/plite/scripts/build-browser-if-stale.mjs &&
  node --check apps/plite/scripts/build-app-if-stale.mjs &&
  node --check apps/plite/scripts/run-plite-browser.mjs`.
- Fresh package proof passed:
  `pnpm --filter plite typecheck` and
  `pnpm --filter @platejs/browser typecheck`.
- Fresh smoke proof passed:
  `pnpm --filter plite test:plite-browser:chromium-smoke`, 13 passed,
  `real 3.63s`.
- Fresh full Chromium proof passed:
  `pnpm --filter plite test:plite-browser:chromium`, `real 139.58s`.

Reboot status:
- Current status: complete.
- Resume command if reopened:
  `pnpm --filter plite test:plite-browser:chromium`.

Open risks:
- CI or lower-core machines may prefer worker cap 9 over 10.
- Stale app export dependency tracking is conservative but not a full bundler
  graph.
- Full matrix wall time was not remeasured in this loop.

## Requirement Checkpoint

- Use `autogoal`; this file is the durable plan and ledger.
- Use `plite-research` if local evidence is not enough. Result: not needed;
  local runner/source experiments were sufficient.
- Optimize test speed without weakening proof.
- Continue after wins; reset the stop counter after every kept improvement.
- Stop only after three post-win experiments are non-conclusive/rejected.
- Every packet ends keep/revert/quarantine with metric and proof.
- Final handoff includes changed files, metrics, commands, slowdowns, and items
  needing attention.

## Scope

- Target lane: Plite browser proof in `apps/plite`.
- Primary command: `pnpm --filter plite test:plite-browser:chromium`.
- Smoke command: `pnpm --filter plite test:plite-browser:chromium-smoke`.
- Allowed surfaces: `apps/plite` runner/config, `packages/browser` harness
  safety, Plite proof app build behavior.
- Non-goals: remove coverage, hide slow rows, change editor runtime behavior,
  broaden into product architecture, or use unrelated app/browser tooling.

## Completion Threshold

Complete when:

- the final kept state passes syntax checks, Plite app typecheck,
  `@platejs/browser` typecheck, smoke proof, and full Chromium browser proof;
- all accepted experiments have keep/revert/quarantine decisions;
- the last kept improvement is followed by three rejected or non-conclusive
  experiments;
- no runner process is left active.

## Verification Surface

- Primary speed proof:
  `pnpm --filter plite test:plite-browser:chromium`.
- Fast proof:
  `pnpm --filter plite test:plite-browser:chromium-smoke`.
- Static proof:
  `node --check` for changed scripts.
- Package proof:
  `pnpm --filter plite typecheck` and
  `pnpm --filter @platejs/browser typecheck`.

## Constraints

- Coverage must stay equivalent.
- Retries/flakes disqualify a speed improvement from becoming default.
- Keep matrix proof more conservative than Chromium daily proof.
- Do not replace real browser proof with internal state checks.
- Do not introduce a second source of Plite examples.

## Boundaries

- Workspace: `/Users/zbeyens/git/plate-2`.
- Changed code owners: `apps/plite` proof harness and
  `packages/browser/src/playwright/clipboard.ts`.
- Browser route owner: `/examples/plite/*` served by `apps/plite`.
- No GitHub, branch, PR, docs-site, or public API work is in scope.

## Blocked Condition

Not blocked. A blocker would have been: the Plite browser command cannot run
locally after focused diagnosis, or the next plausible speedup requires reducing
coverage or changing editor runtime behavior.

## Facts

- Old full browser matrix from the prior deletion/parity lane: `real 1181.37s`.
- Previous clean Chromium lane before this loop: `real 200.04s`.
- Final clean Chromium lane in this loop: `real 139.58s`.
- Previous smoke after warning cleanup: about `real 10.78s`.
- Final smoke: `real 3.63s`.
- `@platejs/browser` full build was about `real 1.17s`; stale check is
  `real 0.04s`.
- High worker counts fail by test retries/timeouts, especially
  code-highlighting teardown at 11/12 workers.

## Inference

- The test bottleneck was mostly harness overhead: repeated builds, too much
  terminal output, conservative worker cap, and serial isolated tail suites.
- 10 workers is the fastest default that has clean confirmation in the current
  checkout.
- 11 workers can be faster on a lucky run but is too flaky for a proof lane.
- Running synced-blocks and pagination concurrently is safe enough when
  check-lists remains isolated first.
- Running all three tail suites concurrently is not safe; it introduced a
  synced-blocks retry.

## Recommendation

Keep the current runner shape:

- stale-aware `@platejs/browser` build;
- stale-aware `apps/plite` static export;
- default dot reporter unless caller requests another reporter;
- local worker cap `10`;
- broad phase, then check-lists serial, then synced-blocks and pagination in
  parallel for Chromium only;
- matrix mode keeps the serial tail to avoid overloading closure proof.

## Experiment Ledger

| # | Experiment | Metric / result | Decision |
|---|------------|-----------------|----------|
| 1 | Worker sweep on focused plaintext | 2 workers `26.65s`; 4 `17.88s`; 6 `15.34s`; 8 `14.05s`; 10 `13.21s`; 12 `13.04s`; 14 `12.58s`; 16 `12.46s`; 18 `12.47s`; 20 `13.07s` | Keep learning: more workers help focused rows until ~16, but full lane needs separate flake proof. |
| 2 | Stale-aware `@platejs/browser` build | build `1.17s`; stale check `0.04s`; smoke/full lanes pass | Keep. |
| 3 | Clipboard lock timeout/stale cleanup | 16-worker failures changed from indefinite lock risk to bounded diagnostics | Keep as harness safety. |
| 4 | Split flaky heavyweight suites out of broad phase | 8-worker full clean `200.04s`; high-worker split runs exit clean where unsplit had flakes | Keep. |
| 5 | Managed static server in runner | Server is started once per command; focused smoke and full lane pass | Keep. |
| 6 | Isolate check-lists from broad phase | Avoided prior checklist retry; clean full lane `200.04s` | Keep. |
| 7 | 10 workers before dot reporter | `229.78s`, pagination retry | Reject. |
| 8 | 9 workers before dot reporter | `243.84s`, synced-blocks retry | Reject. |
| 9 | Stale-aware `apps/plite` export | stale check `0.03s`; smoke `4.86s`; full run noisy `206.45s` | Keep for startup/smoke; full-lane gain not claimed. |
| 10 | Default dot reporter | smoke `4.14s`; full Chromium `189.90s` clean | Keep. |
| 11 | 9 workers with dot reporter | full Chromium `181.19s` clean | Keep, then superseded by 10. |
| 12 | 10 workers with dot reporter | full Chromium `175.58s` clean | Keep. |
| 13 | Concurrent synced-blocks and pagination tail | full Chromium `139.17s` clean; confirmed again `139.58s` | Keep. |
| 14 | 11 workers after concurrent tail | one clean `135.25s`, then code-highlighting teardown retry `139.15s` | Reject / non-conclusive #1 after last keep. |
| 15 | Add check-lists to concurrent tail | `142.09s` with synced-blocks retry | Revert / non-conclusive #2 after last keep. |
| 16 | 12 workers after concurrent tail | `139.10s` with two code-highlighting retries | Reject / non-conclusive #3 after last keep. |

Stop condition:
Reached. After the last kept improvement (#13), three experiments were rejected
or non-conclusive (#14, #15, #16).

## Changed Files

- `apps/plite/playwright.config.ts`
  - Raises local worker cap to 10.
- `apps/plite/package.json`
  - Uses stale-aware browser package pretest commands.
- `apps/plite/scripts/build-browser-if-stale.mjs`
  - Adds stale-aware `@platejs/browser` dist build check.
- `apps/plite/scripts/build-app-if-stale.mjs`
  - Adds stale-aware `apps/plite` static export check.
- `apps/plite/scripts/run-plite-browser.mjs`
  - Starts the proof server once.
  - Uses compact dot reporter by default.
  - Keeps caller-provided reporter overrides.
  - Runs check-lists serially, then synced-blocks and pagination concurrently
    for Chromium.
  - Keeps matrix tail serial.
- `packages/browser/src/playwright/clipboard.ts`
  - Adds bounded clipboard lock waiting and stale lock cleanup.
- `docs/plans/2026-06-19-slate-test-speed-optimization-loop.md`
  - Records this autogoal loop.

## Verification Commands

- `node --check apps/plite/scripts/build-browser-if-stale.mjs`
- `node --check apps/plite/scripts/build-app-if-stale.mjs`
- `node --check apps/plite/scripts/run-plite-browser.mjs`
- `pnpm --filter plite typecheck`
- `pnpm --filter @platejs/browser typecheck`
- `pnpm --filter plite test:plite-browser:chromium-smoke`
  - Final result: 13 passed, `real 3.63s`.
- `pnpm --filter plite test:plite-browser:chromium`
  - Final confirmed result: broad 587 passed / 7 skipped, check-lists 3
    passed, synced-blocks 45 passed, pagination 46 passed / 1 skipped,
    `real 139.58s`.

## Verification Evidence

- Fresh final syntax proof passed:
  `node --check apps/plite/scripts/build-browser-if-stale.mjs &&
  node --check apps/plite/scripts/build-app-if-stale.mjs &&
  node --check apps/plite/scripts/run-plite-browser.mjs`.
- Fresh final package proof passed:
  `pnpm --filter plite typecheck`.
- Fresh final browser-harness package proof passed:
  `pnpm --filter @platejs/browser typecheck`.
- Fresh final smoke proof passed:
  `pnpm --filter plite test:plite-browser:chromium-smoke`,
  13 passed, `real 3.63s`.
- Fresh final full Chromium proof passed:
  `pnpm --filter plite test:plite-browser:chromium`,
  broad 587 passed / 7 skipped, check-lists 3 passed, synced-blocks 45 passed,
  pagination 46 passed / 1 skipped, `real 139.58s`.

## Output Discipline

- Kept final runner output compact with dot reporter.
- One workflow miss happened earlier: an overly broad source scan streamed
  generated `apps/plite/out` output. Recovery: later reads used scoped files and
  ignored generated output.

## Review / Pressure

- No second-model review was needed; the decisions are measured harness changes
  with direct proof.
- Browser/Chrome/Computer manual proof is N/A: this loop optimizes Playwright
  runner speed, and the runner itself exercises `/examples/plite/*`.
- `plite-research` web/GitHub research is N/A: local measurements found and
  validated enough improvements before the stop condition.

## Residual Risk

- 10 workers has clean confirmation, but high-concurrency browser tests can
  still be machine-sensitive. If CI flakes, lower the cap to 9 before weakening
  tests.
- The stale app export helper is conservative, not perfect dependency tracing.
  Use `PLITE_PROOF_FORCE_BUILD=1` if a stale export is suspected.
- Full matrix speed was not remeasured after the Chromium runner improvements;
  matrix tail intentionally remains more conservative.

## Open Risks

- CI or lower-core machines may prefer worker cap 9 over 10.
- Stale app export dependency tracking is conservative but not a full bundler
  graph.
- Full matrix wall time still needs a separate measurement if matrix speed
  becomes the target.

## Work Checklist

- [x] Requirements copied before work.
- [x] Baseline and current lane mapped.
- [x] Experiments recorded with metrics.
- [x] Kept changes verified.
- [x] Rejected experiments recorded.
- [x] Stop condition reached.
- [x] Final proof commands recorded.

## Phase / Pass Table

| Phase | Status | Evidence |
|-------|--------|----------|
| Intake | complete | Requirements checkpoint recorded. |
| Source map | complete | Runner/package/config owners identified. |
| Experiments | complete | Ledger rows #1-#16. |
| Implementation | complete | Kept runner/config/harness changes applied. |
| Verification | complete | Syntax, typecheck, smoke, and full Chromium proof passed. |
| Closeout | complete | Stop condition reached after three rejected probes. |

## Reboot Status

- Current: complete.
- Resume command if reopened:
  `pnpm --filter plite test:plite-browser:chromium`.
- Baseline to compare against if reopened: final clean `real 139.58s`.

## Closeout

- Status: complete.
- Final recommendation: keep all accepted changes above.
- Stop reason: three post-win rejected/non-conclusive experiments reached.
- Next owner: none required for this lane; only revisit if CI shows machine
  sensitivity at 10 workers.
