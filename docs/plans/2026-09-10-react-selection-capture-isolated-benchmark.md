# React selection capture isolated benchmark

Objective:
Measure the existing React selection patch against its exact original code on identical browser DOM and selections; retain correctness, paired samples, source identities, and an honest verdict.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-10-react-selection-capture-isolated-benchmark.md

Template:
docs/plans/templates/benchmark.md

Completion threshold:
All 32 size/selection cohorts have measurements and a verdict; all 10 bundles have differential native-offset proof; raw samples, source identities, metric limits, and rerun commands are retained. Completion requires a supported answer, not a speedup.

Verification surface:
Existing www Playwright Chromium runner, exact installed production function, focused TypeScript/lint, Benchmark complete validator, and Autogoal checker.

Constraints:
Same DOM objects, selections, iterations, browser, and workstation for each pair. Correctness outranks speed. No production changes, publication, extra checkout, browser driver, or package release. Native Range internals and whole-editor latency remain unmeasured.

Boundaries:
One new test file under apps/www/tests/browser and local benchmark artifacts. Existing Next and Tailwind patches remain unchanged. No user route/profile was modified.

Blocked condition:
Source identity mismatch or unavailable Chromium would prevent measurement. Neither occurred. A correctness failure would reject equivalence; none occurred in the tested cases.

## Benchmark Source

- request: create an isolated benchmark again to confirm that optimization works
- scope: exact original and patched React selection-capture body only
- invocation: $benchmark only react-selection-capture; explicit isolated benchmark requested by user
- candidate-identity: fingerprint: a8a0ce32e62a1cc49f004e521673d9741756d3e4ba5dfe6b01f36cc363e628fb; full installed bundle/body identities in benchmark.json
- plate-main-identity: N/A: isolated React function comparison
- plite-identity: N/A: no editor engine comparison
- slate-identity: N/A: no Slate timing claim
- named-symptom: full DOM traversal during React selection capture
- final-artifacts: artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json

## Interaction Coverage

- first-interaction: N/A: warm owner microbenchmark; no first-keystroke or cold-start claim
- settled-interaction: N/A: no trusted editor interaction; repeated function timing only
- route-scope: N/A: controlled page.setContent fixture, no product route claim
- reporter-profile: N/A: isolated Playwright Chromium, no reporter-profile claim

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | patch a8a0ce32e62a1cc49f004e521673d9741756d3e4ba5dfe6b01f36cc363e628fb | reconstructed original blobs match patch indices | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |
| lockfile / package manager | pnpm@9.15.0; lockfile 1651a37aad57131555ec60f9b4f645529bab43f494f46713f6c4781dcf357ddd | same installed dependency tree | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |
| build mode / host / port | installed compiled production body; no app server | original compiled production body; same page | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |
| browser / machine / viewport / DPR | Chromium 149.0.7827.55; Apple M5 Max; Darwin arm64; 1280x720 DPR1 | same browser/page per pair | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |
| route / fixture / document / plugins | 32 synthetic DOM/selection cohorts; 10–10000 lines; no plugins | identical nodes, native selection, DOM fingerprint, and text | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |
| setup / action / DOM strategy | full DOM; capture supplied native anchor/focus offsets | same action and live DOM | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |
| warmups / samples / interleave order | 32 warmups; 5 pages x 12 AB/BA pairs per cohort | same iterations and alternating order | artifact: docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | pass: all ten original Git blob hashes and installed hunks verified; final fingerprints unchanged | none |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicit isolated React benchmark | excluded by user scope; no corresponding claim | none |
| 3 | plate-vs-plite-decomposition | no | N/A: only - explicit isolated React benchmark | excluded by user scope; no corresponding claim | none |
| 4 | owner-microbench-and-trace | yes | complete | pass: 32 paired cohorts, 11 material improvements, zero material regressions; correctness passed | none |
| 5 | product-mount-matrix | no | N/A: only - explicit isolated React benchmark | excluded by user scope; no corresponding claim | none |
| 6 | trusted-editing-matrix | no | N/A: only - explicit isolated React benchmark | excluded by user scope; no corresponding claim | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicit isolated React benchmark | excluded by user scope; no corresponding claim | none |
| 8 | example-breadth | no | N/A: only - explicit isolated React benchmark | excluded by user scope; no corresponding claim | none |
| 9 | large-and-stress | yes | complete | pass: all eight 10000-line cohorts improved; size and selection-position costs retained | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: completed finding retained in Cause History
- lane: N/A: completed finding retained in Cause History
- comparable-baseline: N/A: completed finding retained in Cause History
- material-delta: N/A: completed finding retained in Cause History
- isolated-owner: N/A: completed finding retained in Cause History
- causal-intervention: N/A: completed finding retained in Cause History
- correctness-guard-result: N/A: completed finding retained in Cause History
- fix-class: N/A: completed finding retained in Cause History
- long-term-target: N/A: completed finding retained in Cause History
- decision-owner: N/A: completed finding retained in Cause History
- layer-plan: N/A: completed finding retained in Cause History
- compatibility-verdict: N/A: completed finding retained in Cause History
- fix-owner: N/A: completed finding retained in Cause History
- benchmark-command: N/A: completed finding retained in Cause History
- benchmark-rerun: N/A: completed finding retained in Cause History
- benchmark-rerun-result: N/A: completed finding retained in Cause History
- correctness-command: N/A: completed finding retained in Cause History
- correctness-rerun: N/A: completed finding retained in Cause History
- correctness-rerun-result: N/A: completed finding retained in Cause History
- resume-lane: N/A: completed finding retained in Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| react-selection-full-walk | owner-microbench-and-trace | kept | internal-implementation | retain measured native Range offset capture; no product edit in this task | benchmark | N/A: existing bounded internal implementation | N/A: internal implementation; preserve tested native anchor/focus offsets | Next compiled React DOM patch | exact original body restores full-walk cost on the same DOM; candidate removes 0.26–0.60ms per 10000-line capture | pass: 16810 original/candidate offset comparisons and existing expected-offset guard | PLAYWRIGHT_BASE_URL=http://127.0.0.1:9 RUN_REACT_SELECTION_BENCHMARK=1 pnpm --filter www test:www-browser:chromium react-selection-capture-benchmark.spec.ts | pass: final run 11 material improvements, zero material regressions; 21 below threshold | PLAYWRIGHT_BASE_URL=http://127.0.0.1:9 pnpm --filter www test:www-browser:chromium react-selection-capture.spec.ts react-selection-capture-benchmark.spec.ts | pass: 11 tests, 16810 native pairs plus 70 explicit expected results | docs/plans/artifacts/2026-09-10-react-selection-capture/benchmark.json and correctness.json |

## Frozen measurement contract

- Timing is an owner microbenchmark, not keystroke or React commit latency. Existing www Playwright Chromium runner, one worker, no retries; use page.setContent without contacting an app host.
- Exact before/after code from all 10 Next patch hunks. Reconstruct complete original files and verify original Git blob hashes from each patch index. Candidate code comes from installed bundles.
- Correctness before timing: text and element boundaries, UTF-16 emoji, empty nodes, noneditable text, forward/backward selection, foreign endpoints; all bundle variants. Compare both exact algorithms and native selection direction.
- Timed production bundle: 10, 100, 1,000, 10,000 lines; three descendants per line plus text split where applicable; caret start/middle/end, local range, long forward/backward range, root child boundaries, foreign selection (8 cases per size). All full DOM.
- Five fresh browser pages (packets), 12 paired batches per cohort per packet, alternating AB/BA and rotating cohort order. Warm 32 calls each; baseline-only calibration targets >=4ms per batch, maximum 4096 iterations; same iteration count for both arms. Record every raw batch and checksum.
- Report per-call batch means: median/p75/p95/max, not individual-call percentiles. Omit p99 because only 60 paired batches per cohort. No cold-start inference.
- Material improvement/regression requires both >=20% and >=0.05ms median paired difference, paired bootstrap 95% CI excluding zero, and matching direction in all five packet medians. Smaller differences remain below the material threshold. Freeze before reading candidate timing; never rerun unchanged measurements to get a green result.
- Deterministic work: original full-DOM visited node count; native Range count and requested prefix UTF-16 length. Native Range internals are opaque, so do not claim O(1).
- Exact commands (repo root): `PLAYWRIGHT_BASE_URL=http://127.0.0.1:9 RUN_REACT_SELECTION_BENCHMARK=1 pnpm --filter www test:www-browser:chromium react-selection-capture-benchmark.spec.ts`; guard: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:9 pnpm --filter www test:www-browser:chromium react-selection-capture.spec.ts react-selection-capture-benchmark.spec.ts`.

The timing contract and code bodies were unchanged after the first run. The final reporting pass adds measured clock resolution, explicit null speedups for zero-duration medians, and stronger inferred packet typing. Initial raw samples remain in `initial-report/`.

Work Checklist:

- [x] Read applicable Poteto principles and runtime adapter; use data-shaped scenario records (Model the Domain), a rerunnable test (Build the Lever), inferred packet types (Type System Discipline), and exact source/browser execution (Prove It Works).
- [x] User: create and run isolated benchmark; record all 32 cohorts and 10 bundle variants, including below-threshold cases.
- [x] Benchmark source and methodology: full lane inventory, source identities, same-input causal intervention, frozen absolute/relative/noise rule, warmups, raw packets, finite/censored metrics, and correctness before performance claims.
- [x] Benchmark cohorts/native leaves: four document sizes and eight selection types; native direction readback. Pathological renderer depth, other engines, find/accessibility, clipboard, IME/touch, history/collaboration, and trusted typing are N/A for this explicitly isolated function task; no such result is claimed.
- [x] Perf issue playbook: compare exact original/candidate executable paths and parse retained artifacts. Additional trace and new fix design are N/A because the requested operation is already isolated by direct substitution; no public API or runtime ownership change is proposed.
- [x] Task/AGENTS: branch next confirmed before edits; current checkout; no publication or separate checkout. Autoreview is N/A on next and was not requested.
- [x] Verify Plate: use the existing www Playwright runner; pair runtime measurement with actual native-offset checks; no unauthorized driver or synthetic editor UX claim.
- [x] TypeScript and lint: focused test-source typecheck and scoped ultracite fix pass. No package source, barrels, registry, templates, workflow rules, or public APIs changed; their generation/build/doctrine gates are N/A.
- [x] Show Me Your Work: `.audit/react-selection-capture-benchmark.tsv` records contract, clock-report correction, and final verified finding. Entries reconciled with commands and artifacts; independent review not requested.
- [x] Technical Writing: report includes repeat commands, all results, source identity, raw artifacts, and material claim limits; figures checked against JSON.
- [x] Autogoal: one goal/plan, source-linked obligations, full result verification, semantic and completion validators.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Requirements and narrowing | yes | explicit isolated benchmark; frozen contract recorded before measurement |
| Source identity and runner | yes | exact original Git blobs verified for all 10 installed patched files; existing www runner |
| Correctness oracle | yes | differential native pairs plus existing explicit expected offsets |
| Timing and publication authority | no | no duration or publication requested |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named measurement and correctness threshold | yes | benchmark-run.log: 2 passed; correctness-run.log: 11 passed, timing intentionally skipped |
| Complete lanes and source identity | yes | 3 applicable lanes complete, 6 excluded by explicit only scope; final source fingerprints and all packet DOM fingerprints matched |
| Exact benchmark and correctness rerun | yes | commands in Cause History; same algorithms, fixtures, sampling, and materiality; final run retained |
| Typecheck | yes | pnpm exec tsc --ignoreConfig --noEmit --target es2023 --module preserve --moduleResolution bundler --skipLibCheck --types node apps/www/tests/browser/react-selection-capture-benchmark.spec.ts exited 0 |
| Lint | yes | pnpm exec ultracite fix apps/www/tests/browser/react-selection-capture-benchmark.spec.ts exited 0 |
| Browser route / devices | no | isolated Chromium function/native-offset proof only |
| Package, registry, workflow, release, publication | no | no owning source changed and publication not requested |
| Autoreview | no | next branch; Task prohibits Autoreview here |
| Benchmark complete validation | yes | run validator with --complete; command receipt verification.log |
| Autogoal complete checker | yes | run check-complete; command receipt verification.log |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and source readiness | complete | frozen scope and all original Git blobs verified | none |
| Correctness and measurement | complete | initial-report and final benchmark/correctness JSON | none |
| Reporting repair and exact rerun | complete | clock resolution and inferred packet types corrected; exact commands rerun | none |
| Remaining breadth and handoff | complete | full 32-row report, final fingerprints, source-scoped checks | none |

Findings:
The 10000-line original capture median is about 0.60–0.63ms; Range is about 0.10ms at the middle and 0.36ms at the end. All eight 10000-line cases materially improve. Across all sizes, 11/32 improve materially and 21/32 stay below threshold; no material regression.

Decisions and tradeoffs:
Retain the existing patch based on this isolated Chromium result. The function still has prefix-length-dependent native work and string allocation. No whole-editor, raw-device, other-browser, or 40ms improvement claim follows.

Harness/methodology repairs:
Explicitly report zero-duration batches as clock-censored instead of allowing an infinite ratio to serialize silently as null. Record actual clock resolution. Derive packet array types from the async packet result. These changes preserve the original workload and thresholds.

Error attempts:
The first scoped lint pass found routine naming/counter/module-style issues; fixed. The focused TypeScript command required --ignoreConfig and revealed packet-array inference loss; fixed with inferred async return data. First plan validation required N/A reasons in Status rather than Applies; corrected. An initial console-only summary formatter could not round a null ratio; report generation now handles clock-censored values. No production fix failed.

Verification evidence:
[Full report](artifacts/2026-09-10-react-selection-capture/README.md), raw JSON, command logs, and verification.log in the same artifact directory.

Final handoff contract:
- plan / scope: this plan; isolated existing React patch only
- candidate / baseline: installed candidate and verified original blob identities in benchmark.json
- lane status: 3 complete, 6 N/A by explicit only scope, zero unfinished lanes
- cause / decision: full DOM traversal isolated; retain existing Range candidate for this measured job
- baseline / latest / best: report all paired results; no best-of-run selection
- files: benchmark spec, plan, local evidence; production patches untouched
- exact reruns: Cause History commands; both successful
- resumed breadth: all sizes and all eight selection scenarios accounted for
- packet decisions: initial measurements retained; final report carries clock bounds; no discarded slow samples
- limits: warm synthetic DOM owner timing in Chromium only; no full editor latency or 40ms-saving claim

Open risks:
Whole-editor behavior and performance, other browsers/devices, and editing-driven allocation/GC remain outside the requested isolated benchmark. The source-bound evidence does not automatically apply to another React version or changed DOM shape.
