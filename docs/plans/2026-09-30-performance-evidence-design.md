---
review_scopes:
  - performance
review_basis:
  - 2026-09-30-performance-evidence-value-review
  - 2026-09-30-performance-evidence-cuts
work_kind: design
---

# Performance evidence design

Status: Complete, amended by the [cuts review](../research/review-records/2026-09-30-performance-evidence-cuts.json)

Objective:
- Make benchmark consumers distinguish applicable, complete measurements from stored success labels. Design the adoption of one executable target authority, receipts of what ran, validated observations and explicit frozen assessment policies at the existing private owners.
- Governing evidence is [the September 30 audit](../research/probes/2026-09-30-performance-review/REPORT.md) and its [retained counterexamples](../research/probes/2026-09-30-performance-review/RESULTS.json). This plan closes design only; [the execution plan](./2026-09-30-performance-evidence-execution.md) owns adoption.

Completion threshold:
- Every audit unit U1–U6 has a settled target, consumer migration, rejection alternative and executable acceptance below.
- The proposed contracts preserve historical observations and policies, prevent the reproduced false positives and name the limits of source and browser proof.
- Source and link checks, a bounded independent review, plan completion and ledger reconciliation finish. Implementation, native measurement and performance adoption are separate outcomes.

Verification surface:
- Current owners are `tooling/scripts/bench-targets.mjs`, `benchmarks/targets/slate-v2.json`, `benchmarks/editor/src/index.mjs` and the affected measurement runners. Existing tests and the retained real-helper probe establish the starting defects.
- This design's source references and completion/ledger checks prove the planning artifact. The execution proof table names the package, CLI, receipt and native interaction required for each future claim.

Constraints:
- Planning and disposable proof only in this turn. No product/tooling implementation, benchmark campaign, browser/build run, staging, commit or publication.
- Keep existing metric domains, budgets, quantiles, dialect/runtime behavior and original policies. Search remains deferred. Parser, static-preview and content-root architectures remain settled.
- Add no editor API, profiling plugin, package, universal benchmark AST or result framework. Existing private Plite instrumentation stays unchanged.
- Preserve raw receipts, failed observations and historical evaluator scripts. A source mismatch today does not prove an old run was false.

Boundaries:
- Current writes are this plan, the performance decision and immutable design outcome, scoped ledger metadata and generated review summaries.
- Future execution owns the target CLI/registry, lab catalog and loader, aggregate/health/render consumers, S5 measurement evaluator and producer metadata, clock/sample/persistence boundaries, their tests and source teaching. It may repair those owners' executable helpers, not unrelated runtime or shared/global workflows.
- No application registry UI, public Plate/Plite exports, changesets or doctrine version is needed for this private-tooling design. If execution finds a public API change, that is a scope change requiring the owning adoption route.

Blocked condition:
- No missing user decision blocks design. Unavailable Evidence Kit discovery or absent serving-source identity blocks the corresponding execution claim, not source analysis or historical reading.
- A future native proof needs identified builds and an operable Chromium runner. Record an uncovered claim if unavailable; readiness or a source hash alone cannot close it.

Plan:
- Path: docs/plans/2026-09-30-performance-evidence-design.md
- Template: docs/plans/templates/docs.md
- Created: 2026-09-30T15:01:59.932Z
- [The execution plan](./2026-09-30-performance-evidence-execution.md) owns adoption and closure. Benchmark owns measurement laws.

Documentation scope:
- Mode is internal architecture and execution design, using Technical Writing. This is not a public MDX page or installation guide.
- The nearest retained sibling is [the performance decision](../research/decisions/performance-candidate-reuse.md). Future teaching repairs belong to `benchmarks/editor/README.md`, `research/evidence-source-map.md` and target CLI help/package scripts.
- Existing Benchmark doctrine already requires source identity, frozen policies and preserved failures. Repair executable enforcement rather than add another instruction layer.

## User job and selected cuts

A developer needs to answer three different questions. What ran and what was observed? Does that evidence apply to the selected source and operation? Does it satisfy the policy for this particular claim? A report must preserve those answers separately.

Redesign From First Principles selects one recipe owner and validation before assessment. Keep small private functions at the owners that already perform these jobs. The new data below pays for observable false positives; it does not standardize unrelated benchmark payloads.

| Decision | Target and reason | Rejected alternative |
| --- | --- | --- |
| D1. Executable authority | `benchmarks/targets/slate-v2.json` owns active commands with their inline environment assignments, working directories, artifacts, metrics, correctness and threshold semantics. Lab workload descriptions reference target IDs. | Two active registries, or deleting independent research taxonomy and adapters. |
| D2. Interpretation authority | Move artifact parser kind/category/library/surface mapping into each canonical artifact descriptor in S2, together with the loader switch, so no second active copy exists. Reuse the existing exported target validator and loader boundary. | A second active artifact list or a new schema/registry package. |
| D3. Receipt of what ran | Each target run writes one latest receipt: the executed contract (cwd, benchmark and correctness recipes, artifact definitions, metric endpoint, timeouts), process outcomes, artifact digests, host/runtime and timestamps. Questions, docs, prose policies and thresholds stay out of the contract. | Attaching today's recipe to yesterday's matching ID/path, or an immutable attempt history that no defect requires. |
| D4. Applicable evidence | One admission result accompanies an artifact through normalization, coverage, health and rendering. Inspect it once per artifact per report. | Rehashing the source graph per row, a cross-run mutable cache, or trusting stored `passed`. |
| D5. Domain validation | Validate required clocks, samples and output before the policy uses them. Keep duration, signed delta, memory, readiness and sampled attribution distinct. | One quantile or metric schema for every producer. |
| D6. Frozen S5 policies | One active evaluator with the named, immutable policies new runs use. Work improvement, no-regression, correctness and attribution are separate checks. | Editing the profile guard until a result passes, implicit clock fallbacks, a hardcoded speedup policy for every task, or executable policies kept only to regrade archived matrices. |
| D7. Failure ownership | Every outcome writes its receipt before the wrapper throws, so a failed run replaces the latest evidence. Strict producers write raw observations before validation with the existing atomic writer. | A run manager, per-attempt paths, or an old successful artifact standing in for a failed newer run. |
| D8. History and availability | Keep original recipes and verdicts, including retired and unavailable evidence. Derive current eligibility separately. | Rewriting historical measurements, reassigning old receipts to replacement IDs or calling inventory health a performance pass. |
| D9. Private measurement | Keep `profiling.ts` and `render-profiler.ts` private. No runtime changes or overhead claim. | A public profiling API without an independent user job. |

## Private contract and receipt boundary

These shapes are proposed implementation contracts. They are not public editor APIs.

The existing target shape remains. S2 adds each artifact's interpretation metadata when the lab loader switches to it:

```ts
type Target = ExistingTarget & {
  artifacts: Array<{
    path: string;
    required: boolean;
    evidence?: {
      kind: 'current' | 'compare' | 'rows' | 'browser-trace' | 'slate-legacy-compare';
      category: string;
      library?: string;
      surfaceLibraries?: Record<string, string>;
    };
  }>;
};
```

Environment controls stay as inline assignments in the recipe, and the receipt records each recipe verbatim. Before each command, the runner removes every variable that either recipe assigns from the inherited environment, so those controls come only from the command's own assignments. The Autoresearch recipes do the same with `unset`. A correctness command may set different controls from its benchmark. `cross-editor-human-operations` smoke-runs its producer with one iteration and no warmups, which one shared environment would force onto the benchmark. A variable that a producer reads but no recipe names can still come from the caller's shell. The target CLI, dry-run and Autoresearch setup run both commands in the target's directory. Target paths resolve against the repo root and may not escape it. The check is textual, so a symlinked directory inside the repo stays valid.

`runBenchmarkTarget(target, options)` keeps its injected process runner and returns `{ primaryMetric, receipt }`. It writes the target's latest receipt for every outcome before returning or throwing. The failure outcomes are a correctness failure, a failed or timed-out benchmark, a missing or unchanged required artifact, and a missing metric. A failed run replaces the latest receipt, so the receipt never presents an older pass as the latest result. Consumers read receipts from S2 on. If the receipt write fails, the run fails with that error and nothing claims a receipt. Read-only report generation writes no receipt.

A receipt contains:
- the executed contract: cwd, benchmark and correctness recipes, the variables removed from the inherited environment, artifact definitions, metric endpoint and resolved timeouts. Questions, docs, prose policies and thresholds stay out, so editing them never invalidates measured work;
- each process's role, exit code, signal, timeout flag and duration;
- each artifact's path, required flag, digest after the run, whether the benchmark changed it, and the read error when it could not be read;
- a result, either passed with the primary metric or failed with its stage and message;
- host/runtime identity and start and finish timestamps.

Receipts are local run state, one atomically written file per target under untracked `tmp/`, next to the artifacts they describe. Tracked history and reports derive from them in S2.

Inputs are checked against what producers already record, not against a complete loaded-source census:
- Headless producers keep their existing input manifests (paths and hashes). Admission compares each recorded hash with current bytes and reports match, mismatch or none, naming the inputs it compared. A recorded subset proves those bytes only. It never claims complete loaded-source identity.
- Browser producers record the served build's identity outside the timed interaction and prove that both roles serve the identified build. Hashing today's source alone is insufficient.
- A producer that records nothing yields unknown. Do not infer inputs from modification time, a commit name or a `sourceHash` that covers only the input Markdown.

### Admission and assessment

Reuse `bench-targets.mjs` as the private contract/receipt owner, with an import-safe admission helper consumed by `benchmarks/editor/src/index.mjs`. The CLI's existing guarded main stays import-safe. Pass roots explicitly in testable helpers. No reverse dependency from the target owner to the lab catalog.

| Admission | Meaning | What the consumer may claim |
| --- | --- | --- |
| current | Artifact bytes match the latest passing receipt, whose contract matches the current target, and every input the producer recorded matches current bytes. | Eligible for current assessment, labelled with the inputs compared; it may still fail correctness or a budget. |
| stale | The receipt's contract differs from the current target, or a recorded input differs from current bytes. | Show the original observation and difference; no current coverage or pass. |
| unknown | No receipt describes the artifact bytes, the producer recorded no inputs, or policy information is absent. | Show available observations and limits; no inferred current pass. |
| historical | The original target/contract is retired or the referenced artifact is unavailable. | Preserve original identity, original outcome and retained measurements; no reassignment to a live target. |

Malformed or contradictory evidence is an integrity error, not a successful admission state. A failed latest receipt admits no current observation for its target; consumers show its failure stage instead of the older artifact.

Each domain adapter retains its native rows. Normalization must preserve admission and the selected assessment. Current coverage counts admitted observations for the named workload and library, never declarations alone. A candidate receipt does not establish its baseline's coverage. Missing optional artifacts do not crash historical reading.

A threshold assessment recomputes the comparison from finite observations and the original explicit operator/policy. Retain producer `passed` as an original assessment, not authority. A contradictory cached flag is reported as an integrity error. Missing historical operator/policy yields unknown assessment; do not guess `<` versus `<=` from field names.

Assessment produces pass, fail or inconclusive with named checks and reasons. Missing required observations cannot enter arithmetic or become a fast result. Incorrect output fails correctness. Missing/invalid clocks make the corresponding timing claim unestablished. A valid budget miss stays a miss. Optional diagnosis only gates a claim whose policy requires it.

## Canonical registry and consumer migration

The census is 55 executable targets and 22 lab artifact definitions, with 17 shared IDs. This is control-surface coverage, not 60 reviewed workloads.

For the 17 shared IDs, keep the target recipe and artifact paths; transfer only interpretation/taxonomy metadata from the lab. Lexically different command strings are not themselves proof of semantic drift. Validate transferred parser metadata with preserved artifact fixtures. Keep migration source/ID provenance, but cut duplicated active/category fields once canonical descriptors own them.

Retire these five lab-only definitions from active execution. Preserve their historical identities and link to the related live target without assigning old receipts to it:

| Historical ID | Related live target |
| --- | --- |
| core-query-ref-observation | core-query-anchor-observation |
| core-refs-projection | core-anchors-projection |
| issue-6038-transaction-execution | plite-transaction-execution |
| core-transaction-current | plite-transaction-execution |
| history-retained-memory | plite-history-retained-memory |

Keep all other 38 executable targets active. Their lack of a lab adapter/comparator remains explicit. The 11 workload descriptions retain question, labels and research organization, with library-to-target-ID references. Remove declaration-only coverage booleans and the unused empty `runtimeAdapters` branch. Do not fabricate a runtime adapter to retain a row.

Cut the active `import-evidence-kit [--write]` bootstrap/replacement route and `bench:targets:import-evidence-kit` script. A tracked canonical registry must not be regenerated from its downstream presentation catalog. Keep migration provenance and historical registry snapshots in their existing records. Missing canonical registry is an actionable source error.

`createSlateLegacyCompareRows` requests a missing `react-huge-document-legacy-compare` definition. Preserve its unavailable comparison status. Do not alias `react-huge-document-full` without demonstrating the adapter and operation equivalence.

| Consumer | Required adoption |
| --- | --- |
| Target CLI, CI contracts and Autoresearch setup | One recipe per command, run in the target directory by the CLI and by Autoresearch setup. Write the latest receipt for every outcome. Dry-run shows the exact recipes. |
| Lab `readBenchmarkRegistry` and artifact collectors | Read target-owned descriptors plus independent workload metadata. Use one admission boundary before parsing/aggregating observations. |
| `normalizeBenchmarkRow` / result normalization | Preserve provenance/admission/assessment rather than stripping it. Keep existing domain-specific values. |
| Aggregate workload and comparison rows | Count only applicable measured coverage. Show stale/unknown/absent candidate or baseline separately. |
| `buildTargetHistory` and target Markdown report | Display the contract and result of the latest receipt; classify the contract against the current recipe. Preserve unavailable and retired evidence. |
| `benchmark-health.mjs` | Keep inventory, age and next-action reporting. Add source/contract admission; a fresh timestamp does not establish freshness of measured inputs. |
| Rich-text viewer and `render-perf-index.mjs` | Consume admitted facts and explicit assessments. Saved history must not replace current definitions without their binding being visible. |
| S5 matrix summaries and their current callers | Use the private evaluator with an explicit policy and output path. Original scripts/raw matrices stay byte-preserved evidence. |
| Strict artifact producers | Persist observations before validation and never leave an old pass as the apparent latest result. |
| README, source map, package/help routes and Evidence Kit discovery | Teach the canonical recipe and distinct availability/assessment outcomes. Confirm the real external CLI sees the adapted exports. |

## One active S5 assessment

Place the private evaluator and its CLI in proposed `benchmarks/editor/benchmarks/markdown-streaming-measurement.mjs`, with a meaningful boundary test in the same owning directory. Keep policy definitions and arithmetic together. No package or wrapper hierarchy.

The archived scripts, matrices and summaries under `docs/research/probes/**` remain unchanged and keep their original verdicts. Migrate current invocation and summary consumers to the new owner. The evaluator's test replays retained receipts, including the content-root matrix, to prove it reproduces their recorded limits. It writes no new assessment for archived matrices. Reject an output path that overwrites a raw input or an original assessment.

Proposed command shape:

```sh
node benchmarks/editor/benchmarks/markdown-streaming-measurement.mjs \
  <matrix-directory> \
  --policy s5-no-regression-v1 \
  --out <new-assessment-file>
```

No default policy, automatic trace fallback or arbitrary threshold flags. A policy change creates a new named assessment; original policy results remain original.

| Frozen policy | Clock and guards | Acceptance |
| --- | --- | --- |
| `s5-work-gain-profile120-v1` | CPU-profile parse + transaction; sampled/trace ratio in [0.8, 1.20], program share <0.8, aligned samples. | Every pair saves ≥20% and ≥100ms; smallest gain strictly exceeds both arm ranges; final and arrival no-regression checks; correctness. |
| `s5-no-regression-v1` | The no-regression contract first used by the content-root matrix, including its 1.20 profile eligibility guard. | Final/arrival latency and correctness; no work-saving requirement. Preserve inconclusive profile cells. |

For every criterion:
- Use the declared full sampling schedule, default three measured AB/BA pairs, and at least three pairs. Exactly one stream per arm/role; no duplicate arms, missing roles or silently discarded failed pairs. Keep warmups separate from measured arithmetic.
- Check completeness, timeouts, recorded errors and required non-null final text hashes. Every measured final-text hash must equal the preflight reference for its cell and role. Equal candidate/baseline hashes prove parity only; both can be wrong.
- Before the matrix, run the existing functional contract in `markdown-streaming-contract.spec.ts` with the matrix fixtures (every size and composition) against both served builds. It already compares streamed finals with a fresh parse for static previews and with a one-chunk response for AI; today it covers 6KB and special fixtures on one build and is skipped in benchmark mode. The preflight records, per cell and role, its pass or failure, the served-build identity and the reference final-text hash, outside any timed stream. The evaluator requires a passing preflight for every cell and role, and every measured final-text hash must equal its reference. A missing, failing or mismatched preflight makes correctness inconclusive, so equal wrong hashes in both arms cannot pass. The fixture's input hash is not an expected rendered-output hash.
- Use one metric/clock kind across both arms and every pair. Sampled parse/transaction, trace publish-task work, strict-final task work and DOM elapsed time are distinct. There is no fallback clock; a matrix without the policy's clock is inconclusive.
- Require every consumed duration to be finite and nonnegative. Zero is retained. Null, undefined, holes, NaN, infinity, negative values and missing profiles required by the selected policy cannot pass. Do not filter missing values out of required sample arrays.
- Final statistic is the maximum of measured final durations. Arrival statistic is the median of per-stream p95 values. Allowed regression is `max(10% of baseline, 5ms)`. Keep these existing definitions; do not rename them into a new quantile algorithm.
- Profile alignment is mandatory when profile attribution is required. Sampled and trace totals must be finite and valid denominators. A zero denominator cannot establish a ratio. A ratio of 1.22 is ineligible under the 1.20 guard.
- If both work operands are zero, the absolute 100ms gain fails and percentage improvement is undefined; no invented division result. No-regression can still be evaluated from its independent complete clocks.
- Report latency, correctness and attribution checks separately even when overall acceptance is inconclusive. Do not turn an optional diagnostic into an unrelated gate or relax a required original profile guard.

Migrating the evaluator makes no CPU or speed claim. The content-root matrix keeps its recorded results: six complete cells with their latency and parity observations, and two AI-rich cells inconclusive on profile attribution. Archived cells have no preflight, so a replay reports their correctness as inconclusive. That is a test expectation, not a new assessment of them.

## Clocks, samples and failed observations

| Owner | Bounded repair and preserved law | Proof required during execution |
| --- | --- | --- |
| `plate-code-block-browser.mjs` | Remove the post-input `performance.now()` fallback. A missing/nonfinite `beforeinput` timestamp invalidates that attempt; zero remains a valid same-page monotonic timestamp. Keep exact text, inserted token, selection, DOM, undo/redo, alternating renderer order, three warmups and ≥15 samples. Keep 600ms highlight, 200ms input and 5000ms navigation budgets. | A boundary case proves absent/nonfinite starts are rejected. A source-matched full native Chromium run proves the clock arrives for both renderers. Readiness alone is insufficient. |
| `external-text-measurement.mjs` | Require dense, finite, nonnegative duration arrays; copy raw samples in original order. Keep nearest-rank quantiles, three warmups/30 samples, noise requiring both ratio >1.6 and jitter >4ms, and exit 0/1/2 meanings. Signed differences and memory keep separate domain validators. | Existing helper tests plus sparse/nonfinite/zero and caller-mutation cases. These are secondary boundary repairs, not a measured production speedup. |
| Plugin graph and other strict producers | Reuse atomic persistence: write raw measured/unpassed facts, assess, rewrite the successful assessment only when accepted. On collection failure retain partial observations where possible. Artifact-write failure remains nonzero. | Start with an old passing artifact, induce a deterministic strict failure, and prove the failed run's raw observations persist. Do not wait for a noisy budget failure. |
| Target wrapper and history | Write the latest receipt for correctness, benchmark, missing-artifact, unchanged-artifact and metric failures before throwing. Old successful bytes cannot count as this run. If the receipt write fails, exit nonzero with that failure and claim no receipt. | Inject process failures through the actual wrapper and read back each receipt; break the receipt path and verify the nonzero failure. |

Keep affected producer policies exactly as they are:
- Plugin graph stress p95 is strictly below 1000ms.
- Fit ratios are at most 1.5.
- Schema construction keeps eight prefix rows, span below 64, at least 20 samples and median paired overhead at most `max(2ms, 25% of plain median)`.
- Structural comparison maxima remain 100/300/1500/1500ms, three-way maxima 500/1500/6000/6000ms and the 100k edge limit.
- Domain-specific producer formulas and historical statistics are not converted to external-text quantiles.

## Execution sequence and acceptance

This is a future execution contract, not an implementation checklist completed by this design.

| Slice | Exclusive mutable owner and work | Acceptance / exit |
| --- | --- | --- |
| S1. Canonical recipe and receipts | Target CLI/registry and root scripts. Cut the reverse import route; run both commands in the target directory for the CLI and Autoresearch; reject paths escaping the repo; write the latest receipt for every outcome. | Registry validation, dry-run and injected process cases prove one recipe per command, path containment, a receipt for success and for each failure stage, and no failed run attributed to an old artifact. |
| S2. Admission and consumers | Lab catalog/loader, normalization, aggregation, target history, health and renderers. Move interpretation metadata into the target descriptors with the loader switch, read canonical controls and propagate admission/assessment once. | Actual helper fixtures prove stale/unknown/absent evidence cannot emit current `ok` or coverage. Cosmetic changes remain render-only. Retired IDs stay historical. Report/index freshness checks pass after generation. |
| S3. Frozen S5 evaluator | New private evaluator/test with two policies, active matrix callers, the functional-contract preflight on the matrix fixtures and served-build identity for both roles. Keep archive bytes intact. | Valid three-pair control passes with a matching preflight. Wrong/missing output, missing clocks, duplicate/drop pairs, mixed clocks, profile eligibility and a missing or mismatched preflight or build cannot pass the affected claim. Archived replays reproduce their recorded limits. |
| S4. Measurement boundaries | Code browser runner, external-text helper and strict artifact producers with their tests. No editor implementation changes. | Dense/copied samples, real clock availability and deterministic write-before-reject cases pass; budgets/exit meanings remain unchanged. |
| S5. Integrated proof and teaching | Source docs/help/discovery routes, generated history/viewers and decision/ledger closure. | Read-back from real CLI consumers, focused native proof and corrected source-bound receipts establish adoption. No falsely green current coverage; historical measurements and policies remain intact. |

S1 and S2 are sequential authority/admission work. S3 and S4 may be delegated after S1 with disjoint writer paths; S5 consumes both results. One lead owns registry/loader integration and final receipts. Existing human-assigned work stays reserved.

### Required execution proof

| Claim | Arrangement that must fail without the repair | Accepted evidence |
| --- | --- | --- |
| Current-source admission | Same ID/path with a changed recipe; a recorded input that no longer matches; a producer that records no inputs; artifact bytes no receipt describes. | Existing `bench-targets.test.mjs` and meaningful loader fixture tests. Matching receipt and inputs are current and labelled with the inputs compared; a changed recipe or input is stale; no inputs or no receipt is unknown. |
| Historical preservation | Deleted artifact/retired target and changed label. | Original recipe/outcome stays visible, label-only changes do not alter the recorded contract, no fabricated current command. |
| Coverage and thresholds | Zero artifacts/adapters; cached `passed: true` above limit; missing comparator. | Actual aggregation output is non-current/unassessed, preserving reasons through normalized rows and health/viewer output. |
| S5 arithmetic and correctness | Retained audit counterexamples; missing/zero clocks; duplicate pair; mixed metric kinds; all equal wrong hashes. | New owning evaluator test calls the real function. The preflight reference hash rejects equal wrong output in both arms. |
| Frozen-policy separation | Sample ratio 1.22; content-root flat work; trace-only historical matrix. | A 1.22 ratio is ineligible under work gain; flat work passes no-regression and fails work gain; a trace-only matrix is inconclusive, with no fallback clock. |
| Failed runs | Old passing artifact followed by correctness failure, benchmark failure, strict rejection, missing or unchanged artifact, or missing metric; separately a receipt-write failure. | The latest receipt reads back the failure and its stage, and strict producers keep raw observations; a receipt-write failure exits nonzero. The old artifact never supplies the new pass. |
| Trusted input clock | Missing timestamp boundary and native input in both code renderers. | Focused test plus full source-matched Chromium runner, not readiness-only proof. |
| Producer build and preflight references | Matrix serves an old or different build, links only the input Markdown hash, or attaches a preflight for a different fixture, composition, size or build. | Served-build identity for both roles and a passing preflight per cell and role. Otherwise eligibility is unknown and correctness inconclusive. |
| Discovery and CLI | Real Evidence Kit dependency/CLI reads adapted exports; direct and Autoresearch execution resolve one recipe. | Actual local CLI read-back after the one permitted install-recovery route if needed; source inspection alone cannot close discovery. |

Use the narrowest existing runners during execution:

```sh
node --test tooling/scripts/bench-targets.test.mjs
node --test benchmarks/editor/benchmarks/external-text-measurement.test.mjs
node --test benchmarks/editor/benchmarks/code-block-highlight-oracle.test.mjs
bun test --preload ./config/plite-source-test-setup.ts \
  benchmarks/editor/benchmarks/benchmark-artifact.test.ts \
  benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.test.ts \
  --test-name-pattern 'atomically creates|leaves raw measurements|rewrites a successful strict artifact'
node tooling/scripts/bench-targets.mjs check
node tooling/scripts/bench-targets.mjs report --check
node benchmarks/editor/benchmarks/render-perf-index.mjs --check
```

Add the new evaluator/loader boundary tests to their actual package/root runner; proposed file names are not existing proof. Check all changed JS with `node --check` and run the appropriate owning TypeScript configuration for changed typed producer code. Complete owning lint after the settled implementation. Do not run the lab's broad `evidence:full` merely to validate helpers; it launches unrelated benchmark work.

Native proof uses the identified production route/build and `node benchmarks/editor/benchmarks/plate-code-block-browser.mjs`. Existing `pnpm --filter www test:www-browser:chromium tests/browser/markdown-streaming-contract.spec.ts` proves its declared 6KB/special-fixture functional scope, not exact matrix correctness. After extending the preflight, run it on the matrix fixtures against both identified builds and read back its reference hashes. Tests must reject a preflight for a mismatched fixture, composition or build and common wrong hashes. A new full 10KB/50KB speed campaign is not needed for evaluator migration; the preflight run is required. Any fresh timing/adoption claim needs its own frozen paired Benchmark acceptance.

This design establishes no complete loaded-source census. Admission compares only what producers record. A missing adapter or build binding remains unknown and uncovered; do not turn a test fixture manifest into general production coverage.

## Challenge delta

Improved by the [cuts review](../research/review-records/2026-09-30-performance-evidence-cuts.json) and the S1 registry census. Each removal names the behavior it carried, its replacement and the proof that keeps it honest.

| Removed or moved | Behavior it carried | Replacement or redundancy | Regression proof |
| --- | --- | --- | --- |
| Immutable attempt history: contract digests, per-attempt paths, writer-overlap rejection | Failed runs stay visible; results bind to what ran | One latest receipt per target, written for every outcome | S1 injected-process cases read back a receipt for each failure stage |
| Executable `s5-work-gain-profile125-v1` and `s5-work-gain-trace-v1` | Regrading archived matrices | Archived scripts and summaries stay authoritative; no current consumer needs a regrade | S3 replay tests reproduce the recorded limits |
| Complete loaded-source protocol and the target `inputs` field | Current-source eligibility | Admission against producer-recorded inputs, labelled, plus served-build identity | S2 loader fixtures show a mismatched recorded input as stale and a producer without inputs as unknown |
| In-producer exact-cell reference production | Independent correctness reference | Functional-contract preflight on the matrix fixtures against both builds | S3 tests reject equal wrong hashes and mismatched preflights |
| Declared target `env` map | An explicit, recorded environment for both commands | Inline assignments recorded verbatim, plus removal of every recipe-named variable from the inherited environment. One correctness recipe smoke-runs its producer with values its benchmark must not inherit, so one shared environment would break it | S1 test: an exported recipe-named variable never reaches the benchmark |
| Symlink resolution in path containment | Rejecting target paths that escape a declared root, including sibling-checkout roles | Textual containment against the repo root. Role roots left with the target `inputs` field, and a symlinked directory such as `tmp/` inside the repo stays valid | S1 containment test |
| Interpretation metadata in S1 | Parser semantics next to the recipe | Moves to S2 with the loader switch, so no second active copy exists | S2 transferred-metadata fixtures |

## Reconciliation and rejected expansion

- Reuse both historical performance iterations and September 10 execution/follow-through with their original binding limits. Their rejected runtime candidates and open absolute budgets stay settled.
- Static-preview and content-root execution records remain in their original scopes. They are source evidence for policy separation, not current adoption of this plan.
- Preserve original S5 scripts, matrices and summaries, including the 1.25 analysis and first-pass/rerun profile limits. They keep their original verdicts; the new evaluator assesses new runs.
- Reject a universal benchmark platform, shared AST, public profiler, all-workload rerun or runtime rewrite. The smallest target is repaired private boundaries and consumer adoption.
- Reject instruction-only repair. Existing doctrine is already correct; actual false-positive paths need executable enforcement.
- Runtime scale/throughput checkpoints are not applicable to this plan-only tooling design. Hashing/admission is off the measured hot path and once per artifact/report; no speed or scalability gain is asserted.

Claims and proof:

| Changed claim or route | Source / owner | Applicable planning proof | Result / evidence |
| --- | --- | --- | --- |
| Cached success can produce false positives | Current S5 evaluator and lab loader | Retained real-helper reproduction with passing control | [Audit report](../research/probes/2026-09-30-performance-review/REPORT.md) and [RESULTS](../research/probes/2026-09-30-performance-review/RESULTS.json); no workload timing. |
| Canonical authority/migration is bounded | Target/lab registries and current consumers | Read-only source traversal and independent partitions | 55 targets, 22 definitions, 17 shared, five retained historical links; interpretations keep their existing domains. |
| Policies and correctness precede acceptance | Archived S5 scripts, content-root receipts, browser correctness spec | Source/policy review and bounded draft review | Design contracts and future proof arrangements above; runtime proof not executed. |
| The cuts keep every reproduced defect covered | Cuts review, target registry census | Source recheck of the audit rows and the 55-target registry | [Cuts review](../research/review-records/2026-09-30-performance-evidence-cuts.json); no runtime proof. |
| Plan complete and progress truthful | This plan, decision page and ledger | Completion checker, scoped link/source checks, ledger render/check | Recorded in Verification evidence at close. |

Work Checklist:
- [x] Reconcile the original review requirements and later execution without reopening settled runtime owners.
- [x] Settle one target/receipt authority, preserved history, admission and domain-specific policy contracts.
- [x] Map every affected consumer and all six audit units to a bounded execution slice and executable proof.
- [x] Consume one bounded independent draft review and repair material design gaps.
- [x] Verify source/link facts and final prose; prepare the source-bound design outcome and required completion/ledger closure.

Verification evidence:
- Source-only planning used the governing audit, retained helper probe and current target/loader/runner/policy consumers. No native/browser/build/benchmark run is claimed.
- [Design checks](../research/probes/2026-09-30-performance-review/DESIGN-CHECKS.md) retain the source census, link/owner checks, import-safe helper observation and bounded independent review. The material correctness-reference gap is assigned to S3, through the functional-contract preflight since the cuts review. No second review or model-diversity claim is made.
- Closure runs the completion checker, final local-link check, scoped whitespace/lint selection and ledger record/render/check against this finalized plan. The design outcome uses partial proof to preserve unexecuted adoption and native claims. Docs are excluded by Oxfmt/Oxlint; a no-target result is not a lint pass.
- The cuts amendment reran the ledger record, render and check against the amended plan. Its env decision rests on the registry census. 36 targets carry inline assignments, and four correctness recipes carry their own. Only `cross-editor-human-operations` smoke-runs its producer; the other three set Playwright retry and worker controls for a test suite. The design-cuts and design-wording records say all four smoke-run their producer, which is wrong; the S1 trail review caught it.
- A rejected record attempt exposed concurrent edits to shared doctrine. The current first-principles and claim-width requirements were reread and retain this target. The original audit keeps its original fingerprints and stale freshness marker; the design outcome binds current source without rewriting the audit or historical measurements.

Open risks:
- Admission compares only the inputs each producer records. A producer that records a subset can be current while an unrecorded dependency changed; its label names the compared inputs. Producers that record nothing stay unknown until they record inputs.
- The functional contract runs only 6KB and special fixtures on one build today. S3 must run it on the matrix fixtures against a served build and prove its reference hash matches the matrix's final-text hash; old arm parity does not close it.
- Evidence Kit is unavailable locally. Its discovery/API compatibility needs actual execution proof; a source-only adapter review is insufficient.
- Historical policy descriptions and original producer `passed` may disagree. Keep original bytes and outcomes, and report contradictions rather than modify history.
- A full native clock run may miss valid budgets on a loaded host. Preserve that miss and its context; source/clock correctness and performance acceptance are separate.
- No runtime performance, profile calibration, all-workload completeness or physical-device claim is part of design completion.

Next action:
- [The execution plan](./2026-09-30-performance-evidence-execution.md) runs S1 first. This completed design does not establish runtime adoption.

Primary template:
docs/plans/templates/docs.md

Applied packs:
- none; plan-only internal prose needs source/link/metadata proof, not public API/MDX/browser artifacts.
