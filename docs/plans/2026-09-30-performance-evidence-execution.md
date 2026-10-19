---
review_scopes:
  - performance
review_basis:
  - 2026-09-30-performance-evidence-value-review
  - 2026-09-30-performance-evidence-cuts
work_kind: implementation
---

# Performance evidence execution

Status: Done. S1 to S5 are implemented and proved on the final code. Each open finding names its owner and destination.

Goal: adopt [the amended performance-evidence design](./2026-09-30-performance-evidence-design.md) one slice at a time. Each slice ends with its acceptance proved on the real CLI or runner and a ledger checkpoint.

Decision log: [2026-09-30-performance-evidence-execution.decisions.tsv](./2026-09-30-performance-evidence-execution.decisions.tsv).

Source: the user said "go" after the [cuts review](../research/review-records/2026-09-30-performance-evidence-cuts.json) (2026-09-30), which authorized amending the design and starting S1. After the S1 report the user said "go the full plan, dont pause on each S", which authorized S2 to S5 back to back. The two S1 scope calls below are the agent's; the user has not ruled on them.

## S1. Canonical recipe and receipts

Owner files: `tooling/scripts/bench-targets.mjs`, its fast and slow tests, `benchmarks/targets/README.md`, the generated target history and report, and the root `bench:targets:import-evidence-kit` script.

Acceptance:
- [x] The reverse import route is gone: `import-evidence-kit`, its helpers and the root script. A missing registry fails with an actionable message. Proved by `node tooling/scripts/bench-targets.mjs check`.
- [x] Autoresearch setup runs the correctness command in the target directory, as it does the benchmark command and as `run` does. Dry-run prints both recipes. Proved by `tooling/scripts/bench-targets.test.mjs`.
- [x] Registry validation rejects a `cwd` or artifact path that escapes the repo, and still reports a missing one instead of throwing. Proved by `tooling/scripts/bench-targets.test.mjs`.
- [x] Every variable that either recipe assigns is removed from the inherited environment before each command, for `run` and in the Autoresearch recipes. Registry validation rejects a recipe that sets a variable after its first word, where the scrub cannot see it. Proved by `tooling/scripts/bench-targets.test.mjs`.
- [x] `runBenchmarkTarget` returns `{ primaryMetric, receipt }` and writes the target's latest receipt for success and for each failure stage (correctness, benchmark, artifact, metric) before throwing, including when an artifact cannot be read. A receipt write failure fails the run.
- [x] Each new test fails for its named defect without the change. Proved by the mutation rows in `docs/plans/2026-09-30-performance-evidence-execution.decisions.tsv`.
- [x] `node --test tooling/scripts/bench-targets.test.mjs`, `bench-targets check`, `report --check` and dry-run pass. One real target runs through the CLI and its receipt reads back.
- [x] Writing passes and lint on the changed code paths. Proved by `pnpm exec ultracite check <files>`.

Removed in S1:

| Removed | Behavior it carried | Replacement | Regression proof |
| --- | --- | --- | --- |
| `import-evidence-kit [--write]` and `bench:targets:import-evidence-kit` | Regenerating the target registry from the lab catalog during migration | Edit the tracked registry directly; the lab catalog is downstream | `bench-targets check` on the tracked registry; the missing-registry error names the file |

Scope calls made after the user's "go", both reversible and both awaiting the user's ruling:
- The approved review said S1 would carry interpretation metadata. It moved to S2 so the metadata never has two active copies before the lab loader switches. Doing it in S1 would add the descriptors to `slate-v2.json` while the lab registry still owns its own.
- The approved design declared an `env` map shared by both commands. S1 keeps inline assignments instead and removes recipe-named variables from the inherited environment. A shared map would force `cross-editor-human-operations`' one-iteration smoke values onto its benchmark. Restoring the map means moving the assignments out of 38 recipes and giving that one target a per-command environment. The comment review raised the same question, because the runner parses inline assignments back out of shell strings.

S1 evidence, 2026-09-30:
- `node --test tooling/scripts/bench-targets.test.mjs tooling/scripts/bench-targets.slow.test.mjs` passes 25 tests at S1. The receipt assertions cover success, each failure stage, a benchmark timeout, a receipt write failure, an exported recipe-named variable, and paths that escape the repo or are missing.
- On the S1 code, ten temporary mutations each failed exactly the intended tests: no receipt on failure, the benchmark and metric stage labels, a swallowed write error, containment, a null `cwd`, prose in the contract, the `changed` flag, the timeout flag and a leaked recipe variable. The source was restored byte-identical after each.
- An unreadable artifact (mode 000) after a failed benchmark still produced a receipt with `stage: benchmark` and the artifact's EACCES error, and the benchmark failure stayed the thrown error. With the earlier throwing snapshot, the same script threw EACCES and wrote no receipt.
- With a stub Autoresearch script, `autoresearch-setup-plan cross-editor-human-operations` received both commands as `cd '<repo>' && unset CROSS_EDITOR_HUGE_ITERATIONS CROSS_EDITOR_HUGE_WARMUPS && ...`, with the checks command keeping its smoke assignments. In sh, bash and zsh, that prefix hid an exported `CROSS_EDITOR_HUGE_ITERATIONS=7` from the benchmark command.
- `bench-targets check` reports 55 targets, and `import-evidence-kit` exits 1 with usage.
- `bench-targets run plite-correction-worklist` passed twice on an Apple M5 Max, in under 3 s each. The last receipt records `unset: ["PLITE_CORRECTION_WORKLIST_STRICT"]`, both processes, `result: passed` with primary metric 2, and an artifact digest equal to `shasum -a 256` of the artifact. Receipts are untracked local run state.
- `report --check` was red before this change because the tracked history had 53 targets and the committed registry 55; the working tree matched HEAD for both files. `bench-targets report` regenerated them. The regeneration also carries committed command and question edits for four targets, drops the retired `plite-extension-graph` row, and marks `plite-plugin-graph` and `plite-structural-compare` missing because this host's `tmp/` lacks their artifacts.
- `ultracite check` exits 0 on the four changed code files. The no-comments review found no comments in the diff. A same-family trail review (a fresh Opus subagent) found the null-path regression, the unreadable-artifact gap, the environment leak and the overstated smoke-recipe count; this section records their repairs.

S1 limits: the real Autoresearch script is not installed; its arguments were checked through a stub. A variable that a producer reads but no recipe names can still come from the caller's shell.

## S2. Admission and consumers

Owner files: `benchmarks/targets/slate-v2.json`, `benchmarks/editor/research/benchmark-registry.json`, `benchmarks/editor/src/index.mjs` and its declarations, `tooling/scripts/bench-targets.mjs` (admission and history), the lab's health, rich-text, viewer and landing-index scripts, their generated outputs, the clipboard threshold producer, and the contract routing in `tooling/scripts/check-plite.mjs` and `.github/workflows/plite-ci.yml`.

Acceptance:
- [x] Interpretation metadata lives on target artifacts as `evidence` (`kind`, `category`, optional `library` and `surfaceLibraries`), validated by `bench-targets check`, on at most one artifact per target. 20 targets carry it: the 17 shared IDs plus `core-query-anchor-observation`, `plite-transaction-execution` and `plite-history-retained-memory`.
- [x] The lab registry keeps workloads, which reference target IDs, and five retired definitions, each linked to a related live target. A workload counts a live target only when that target measures the retired operation. `core-query-anchor-observation` is the renamed `core-query-ref-observation`. Commit 266ba029a1 rewrote `plite-transaction-execution` with different operations, so the issue #6038 workload has no target. `core-anchors-projection` exposes no metrics, so it stays without an adapter.
- [x] `admitArtifact` in `bench-targets.mjs` admits each artifact once. It is `current` when a passing receipt with the current recipe produced its bytes and every input the producer recorded in `sourceIdentity.measuredInputs` still matches. It is `stale` when the latest run failed, the recipe changed or a recorded input changed. Otherwise it is `unknown`, which covers an unreadable receipt, bytes no receipt describes and a producer that records no inputs. Retired definitions read `historical`.
- [x] The lab loader applies admission to every row. A row from a non-current artifact takes the admission state as its status, keeps its values and carries the reasons. A failed latest run shows one row with its failure stage and message instead of the older values. Workload coverage counts only `ok` rows, and parser semantics decide which editors a workload can cover. Proved by `tooling/scripts/bench-targets.test.mjs`.
- [x] The loader judges each threshold row with the comparison operator its producer records (`<`, `<=` or `===`). A violated threshold reads `over-budget`, or `integrity-error` when the producer marked it as passed. A threshold without a recorded operator, and one that holds, reads `unassessed`.
- [x] An unreadable artifact becomes an `integrity-error` row and an `artifact-unreadable` admission in health, and the missing legacy comparison reads `unavailable` instead of crashing.
- [x] Target history (version 3) and the target report show each target's latest run from its receipt, sticky from earlier history, and whether that run's recipe is still `current` or `changed`.
- [x] Health reports each artifact's admission and reasons, scans every target path for unregistered files and groups rerun actions. The landing index takes definitions from the registry and only runs from history. The viewer shows values next to their admission state. Proved by `benchmarks/editor/benchmarks/results/benchmark-health-latest.json`.
- [x] Report, rich-text, health, viewer and landing-index checks pass after regeneration. Proved by `node tooling/scripts/bench-targets.mjs report --check` and `npm run docs:perf:check`.

Removed or moved in S2:

| Removed or moved | Behavior it carried | Replacement | Regression proof |
| --- | --- | --- | --- |
| Lab `artifacts` list with duplicated commands and paths | Active lab evidence | Target artifacts with `evidence` metadata | The admission loader tests; `bench-targets check` |
| Workload `slateV2` and `legacy` booleans | Declared coverage | Coverage from admitted `ok` rows and parser semantics | The admission loader test (`uncovered` without current rows) |
| `runtimeAdapters` branch | Coverage for other editors | None; only Slate v2 and Slate are in scope | Unreachable with the two editor targets |
| `migration.evidenceKitCategory` and `evidenceKitActive` | Duplicated lab taxonomy | `evidence.category` | `bench-targets check` |
| Trusting a stored `passed` flag | Threshold verdicts | Recomputation with the producer's recorded operator | The threshold test |
| Reading `sourceBefore` and `sourceAfter` as recorded inputs | Input identity for `collab-readiness` | `sourceIdentity.measuredInputs`, which `collab-readiness` now writes; producers assert their own before and after fingerprints | The admission tests; a real `collab-readiness` rerun admits `current` |

S2 evidence:
- `node --test tooling/scripts/bench-targets.test.mjs` passes 31 tests, including the loader tests. They run a fixture target through the real CLI and prove these outcomes:
  - `unknown` without a receipt, `current` after a passing run and after a prose-only edit, and `stale` after a command edit or a changed recorded input.
  - One failure row after a failed newer run.
  - `unknown` for an unreadable receipt, for bytes no receipt describes and for a producer without recorded inputs, and an `integrity-error` row for an unreadable artifact.
  - Coverage that follows admission, operator-based thresholds, `historical` retired rows and the `unavailable` legacy comparison.
  - One evidence artifact per target, and recipe variables that lead their command.
- On the final code, single-rule mutations fail the intended test: the failed-run branch, `receipt-unreadable`, `artifact-not-from-receipt`, `no-recorded-inputs`, `input-changed`, `contract-changed`, the unreadable-artifact row, a ceiling guess in place of the operator, the one-evidence-artifact rule and the recipe-assignment rule. An earlier mutation showed that coverage re-checked admission after the loader had folded it into the status, so that duplicate check was removed, as was the rich-text check's unreachable `ok`-without-current assertion.
- Every moved parser definition parsed its local artifact through the real loader, except `react-huge-document-browser-trace`, whose local artifact already lacked its `surfaces` entry at HEAD.
- On this host, the audit's three flagged artifacts first read `stale` on changed recorded inputs: `collab-readiness`, `core-node-transforms` and `core-query-anchor-observation`.
- The rich-text check was red at HEAD on ProseMirror paste-source labels and two wrong lab paths. The existing out-of-scope sanitizer now covers ProseMirror, and the check counts parsed rows. It passes with 1002 rows.
- The admission tests route through `check-plite.mjs`, `plite-ci.yml` and the pinned routing test when the loader or lab registry changes. The clipboard benchmark test pins its target's artifacts and now includes their evidence metadata; S2 had broken that pin.

## S3. Frozen S5 evaluator and preflight

Owner files: `benchmarks/editor/benchmarks/markdown-streaming-measurement.mjs` and its test, the lab script `test:markdown-streaming-measurement`, `tooling/config/test-suites.mjs`, and `apps/www/tests/browser/markdown-streaming-contract.spec.ts`.

Acceptance:
- [x] One evaluator with two frozen policies, `s5-no-regression-v1` and `s5-work-gain-profile120-v1`. Completeness, latency, correctness, attribution and work are separate checks. Missing data is inconclusive, contradicting data fails, and there is no fallback clock.
- [x] Correctness requires the matrix preflight: a passing reference per arm for the same cell and source, every stream from its arm's preflight build, distinct builds, every measured final equal to its arm's reference, and one reference shared by both arms. Proved by `benchmarks/editor/benchmarks/markdown-streaming-measurement.test.mjs`.
- [x] The CLI takes no default policy and refuses to overwrite a file or write inside the matrix. Proved by `benchmarks/editor/benchmarks/markdown-streaming-measurement.test.mjs`.
- [x] The spec records every stream's served build id and runs an untimed preflight per cell and arm before the streams. The static functional test reuses the same strict-parse helper. Proved by `apps/www/tests/browser/markdown-streaming-contract.spec.ts` on snapshot d96ecb4f55bd82a0.
- [x] The preflight passes on every acceptance cell (static, editable and AI; rich and CJK; 10 KB and 50 KB) for both builds. Proved by `S5_BENCH=1 S5_PAIRS=0 pnpm test:www-browser:chromium tests/browser/markdown-streaming-contract.spec.ts` on snapshot d96ecb4f55bd82a0.
- [x] A candidate that renders different text and a slower candidate each fail at the check that owns the defect. Proved by `node benchmarks/editor/benchmarks/markdown-streaming-measurement.mjs <matrix> --policy s5-no-regression-v1` on snapshot d96ecb4f55bd82a0.
- [x] Archived replays reproduce their recorded limits, and the evaluator and external-text tests run in the fast suite. Proved by `benchmarks/editor/benchmarks/markdown-streaming-measurement.test.mjs` and `tooling/config/test-suites.mjs`.

S3 evidence:
- `node --test benchmarks/editor/benchmarks/markdown-streaming-measurement.test.mjs` passes 10 tests. Eleven single-rule mutations failed their tests at S3. On the final code, removing the shared-reference, same-build or work-gain spread rule fails its test; the spread rule had no test before the repair pass. `tooling/config/test-suites.mjs` puts this test and the external-text test in the fast suite that `bun check` runs; HEAD's configuration discovered neither. The code-block oracle test needs Chromium, which that job installs later, so it stays a lab script.
- The content-root matrix replays with latency passing, correctness inconclusive for lack of a preflight, ai-rich attribution inconclusive and work gain failing, matching its archived limits.
- Final-code proof on three production builds of one snapshot (fingerprint `d96ecb4f55bd82a0`). The baseline built as `06hpuTKF9hjJLXCgV6u3s`, a candidate that drops the last parsed block as `VPOkh2DNqQUWscbKr6f07`, and a candidate with 25 ms of extra work per publish as `DafY1qrgJhF02ih4JLZQa`. Each server's page carried its own `BUILD_ID`.
- The 8 functional tests pass on the baseline build of the final spec.
- A preflight sweep (`S5_PAIRS=0`) over all 12 acceptance cells passed both preflights on the baseline and the slower candidate, with one shared reference per cell.
- The candidate that drops the last block passed its own preflight and every per-arm check, and the evaluator failed it only on `arms disagree on the reference text`. The evaluator without that rule passed the same matrix.
- The slower candidate failed latency: arrival p95 rose from 40.7 to 55.1 ms and final work from 6.9 to 33.8 ms. Its attribution reached 1.18 against the 1.20 guard.
- An earlier run on two identical builds is a null control only. It passed no-regression and failed work gain, as identical builds should. Its ai-rich attribution reached 1.1991 against the 1.20 guard, so that guard sits within the noise of identical builds.
- `tsc` over `apps/www` exits 0.

## S4. Measurement boundaries

Owner files: `benchmarks/editor/benchmarks/plate-code-block-browser.mjs` and `code-block-highlight-oracle.mjs` with its test, `external-text-measurement.mjs` with its test, `benchmark-artifact.ts` with its test, and eight strict producers.

Acceptance:
- [x] The code-block input clock starts at `beforeinput` observed on `window` in the capture phase, a sample without it is invalid, and the artifact records the clock. A source-matched native Chromium run shows the clock arrives for both renderers.
- [x] External-text samples are dense, finite, nonnegative and copied; zero stays valid. Proved by `benchmarks/editor/benchmarks/external-text-measurement.test.mjs`.
- [x] `writeBenchmarkResult` sets `strictValidation`. Plugin graph, history depth, read-view lifecycle, fit-content locality, content-slice value, schema construction, structural compare and schema architecture write their measured facts before strict validation, so a strict failure replaces an older passing artifact with this run's unpassed measurements.
- [x] Budgets, sample counts and exit meanings are unchanged. Proved by `git diff HEAD -- benchmarks/editor/benchmarks`.

S4 evidence:
- A Chromium probe showed that `insertText` fires `beforeinput`, but a listener added after a handler that stops immediate propagation never runs, while a window capture listener does. The clock starts in `startInputClockBeforeEditorHandlers`, and an oracle test reproduces that handler; switching the helper to the bubble phase fails the test.
- The final runner ran inside the served snapshot, so all 2789 source hashes in its artifact match the served files. It reported `VALIDITY PASS`, so the runner timed every attempt from `beforeinput`. Native budgets failed again, with input-to-paint p95 at 374 ms against 200 and navigation p95 at 8679 ms against 5000, at a load average of 3.9 to 7.5. An earlier run on older runner bytes read 339.9 ms and 8038 ms. CodeMirror stayed within every budget in both runs.
- The oracle, external-text and artifact tests pass (6, 6 and 21 Bun producer and artifact tests). On the final code, removing the strict writer's measured write or the external-text finite check fails its test.
- A real `plite-schema-construction` run with `PLITE_SCHEMA_CONSTRUCTION_STRICT=1` and `--iterations=1` failed validation, exited 1 and replaced a hand-written passing stub with all 13 measured fields and `strictValidation: { requested: true, status: measured }`. A non-strict run wrote `requested: false`. The other seven producers rely on the helper's tests.

## S5. Integrated proof and teaching

Acceptance:
- [x] `benchmarks/editor/README.md`, `research/evidence-source-map.md` and `benchmarks/targets/README.md` teach target-owned evidence, admission, operator-based thresholds, failed-run rows, receipts, the code-block clock and the streaming assessment with its shared reference. The false undo and redo claim is gone.
- [x] The pinned Evidence Kit CLI reads the adapted rows. Proved by `npx evidence-kit inspect --json`.
- [x] Real reruns through the CLI move admission as receipts dictate. Proved by `node tooling/scripts/bench-targets.mjs run collab-readiness`.
- [x] Generated history, reports and viewers are regenerated and their checks pass. Proved by `node tooling/scripts/bench-targets.mjs report --check` and `npm run docs:perf:check`.

S5 evidence:
- `npm ci` in `benchmarks/editor` installed Evidence Kit 0.1.2 from the lab lockfile. `npm run docs:perf` and `docs:perf:check` exit 0, and the wiki counts the admission states.
- `core-node-transforms` first failed its producer guard (`wrapNodesMs did not wrap the target blocks`). A minimal repro traced it to a Plite regression. The public `tx.nodes.wrap` binding treated any Path as a single-node wrap, so a root path with `match` or `type` returned false and changed nothing. The binding now runs that precheck only without a selector, a transforms contract test covers the root-path wrap, and the producer's unwrap lane asserts that its setup wrapped. The target reran through the CLI and admits `current`.
- `collab-readiness` turned `stale` when the wrap fix changed one of its recorded inputs, then reran `current` after moving to `sourceIdentity.measuredInputs`.
- After regeneration the landing index reads two current, one stale (`core-query-anchor-observation`, changed inputs) and 17 unknown lab artifacts. All 17 unknown artifacts come from producers that record no inputs.

## Review and closure

- The same-family trail review (a fresh Opus subagent) and three reflect reviewers checked the S2 to S5 trail. Their findings led to the shared-reference rule, the failed-run rows, the admission tests, operator-based thresholds, the stand-in correction, the canonical inputs field, the Plite wrap fix, the final-code browser proofs and the corrections in the decision log.
- The `deslop` and `no-comments` skills ran on the code diff through two read-only reviewers. The accepted findings replaced the mutating strict writer and its casts, made admission compute states from reason codes, gave health an explicit admission for missing and unreadable artifacts, removed unreachable fallbacks and one unreachable check, and trimmed one comment.
- Across the changed code, lint exits 0. The affected suites pass: 79 Node tests (target CLI, routing, evaluator, external text), 6 oracle tests, 21 Bun producer and artifact tests, and the plitejs transforms and schema-fit contracts (886).
- `check:plite:contracts` fails on three `test-suite-routing` cases and the clipboard live-encode test. All four fail identically at HEAD in a detached worktree. The two timeout tests pass when they run alone.

## Open findings

| Finding | Owner | Destination |
| --- | --- | --- |
| The native code-block renderer exceeds its absolute input-to-paint and navigation budgets in two shared-host runs. Without a matched baseline that is inconclusive, not a regression. The navigation metric does not depend on the input clock, and the 2026-09-04 plan recorded 510.2 ms input and 1682 ms navigation p95 on another build. | Code-block benchmark | [Code-block demo variants plan](./2026-09-04-code-block-demo-variants-benchmark.md); needs a matched baseline run |
| 17 of 20 lab artifacts come from producers that record no inputs, so they stay `unknown` even after a rerun. | Benchmark producers | A user decision on a follow-up plan that adds `sourceIdentity.measuredInputs` to those producers |
| Tracked history, health, rich-text and perf-page outputs are generated from this host's gitignored artifacts and receipts, so another checkout regenerates different files. | Benchmark lab | A user decision to keep them as dated snapshots or to track only outputs that depend on tracked inputs |
| The lab's root export imports `tooling/scripts/bench-targets.mjs`, outside its package, and the target CLI's tests import the lab loader. The boundary gate does not flag relative imports that leave the package. | Benchmark lab | A user decision to move admission behind a data boundary or to accept the in-repo coupling |
| The lab's npm-pack gate was over budget at HEAD (1.84 MB, 108 files) and now reads 2.08 MB and 110 files against 1.25 MB and 96; this plan's regenerated outputs add about 0.24 MB. | Benchmark lab | A user decision, taken with the tracked-output question |
| The S5 attribution guard (1.20) sits within the noise of identical builds (1.1991), so real matrices can read inconclusive for no cause. | Benchmark | A user decision to recalibrate the guard before the next S5 matrix |
| The spec reads the build id with a regex over Next's private flight payload, and the demo's columns have no accessible names, so the spec finds them by XPath. | apps/www | A user decision to render a build-id meta tag and name the demo columns |
| Plugin graph and schema architecture carry pre-existing type errors on lines this plan did not change; CI runs them under Bun without type checking. | Benchmark producers | A user decision on a benchmark typecheck lane |
| The review ledger's inventory is stale in `plitejs/core/public-state`, `plitejs/proof-and-packaging`, `tooling/distribution` and `tooling/performance`, which mix this plan's edits with other sessions'. | User | `node tooling/scripts/review-ledger.mjs refresh` when the user accepts the working-tree inventory |
| The design still promises undo and redo checks that the code-block runner never had. | This plan's design | A user decision to amend the design with a linked record |

## Next action

None for this plan. Each open finding waits on the owner or user decision named in its row.
