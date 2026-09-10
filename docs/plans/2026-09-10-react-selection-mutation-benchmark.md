# React selection mutation benchmark

Objective:
Compare original, Range, and early-exit selection capture with DOM mutation and GC in Chromium, Firefox, and WebKit. Decide whether an upstream optimization is supported.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-10-react-selection-mutation-benchmark.md

Template:
docs/plans/templates/benchmark.md

Completion threshold:
All 81 normal/large mutation cohorts (3 sizes x 3 selections x 3 mutation types x 3 browsers) have correctness-checked three-arm results; retained-range causal controls and Chromium GC diagnostics resolve or explicitly limit the historical Range concern. Preserve all samples and a supported upstream verdict, even if no candidate wins.

Verification surface:
Existing www Playwright runner with a task-specific three-engine configuration, exact original/candidate bundle code, native offset checks, mutation/content checks, full raw samples, Chromium GC trace, focused TypeScript/lint, Benchmark and Autogoal validators.

Constraints:
Keep original static benchmark artifacts intact. No production patch changes, React checkout edits, commit, push, issue, or PR publication. No other app host/profile or benchmark driver. Natural GC remains enabled. A retained-range positive control is deliberately pathological and cannot replace the exact production algorithm comparison.

Boundaries:
New www browser benchmark source/config and local plan/artifacts only. Same initial DOM and operations for all three arms; each measured arm gets a fresh page to prevent document-scoped Range carryover. Native character offsets are a hard correctness law; replacing the entire offset protocol with live Range objects would not prove restoration after DOM replacement and is not proposed.

Blocked condition:
Unavailable engine, unidentifiable source, or failed correctness would prevent a candidate's acceptance. Missing precise Firefox/WebKit GC attribution is an explicit limit; natural GC remains included in their elapsed work.

## Benchmark Source

- request: ok go, accepting original vs Range vs early-exit plus mutation/GC across three browser engines
- scope: explicitly isolated React selection owner, extended through DOM mutation and GC
- invocation: $benchmark only react-selection-mutation
- candidate-identity: fingerprint: original patch a8a0ce32e62a1cc49f004e521673d9741756d3e4ba5dfe6b01f36cc363e628fb; final loader/body/harness/config hashes in results
- plate-main-identity: N/A: no Plate product comparison
- plite-identity: N/A: no editor engine comparison
- slate-identity: N/A: no Slate comparison
- named-symptom: React PR 9992 removed ranges because live-range bookkeeping can slow subsequent DOM changes
- final-artifacts: artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/

## Frozen comparison contract

Frozen before measuring any candidate in the mutation workload.

- Arms: exact original compiled production body reconstructed from the Next patch and verified against its original Git blob hash; exact installed Range body; original body with only two successful-endpoint early exits inserted (one for text offsets and one for element child offsets). No new Range/caches/public API in the early-exit arm.
- Primary matrix: 100, 1,000, 10,000 div/span/text lines; caret at start/middle/end; in-place insert+delete, text-node replacement, or eight-block subtree replacement. 81 browser/cohort rows, three arms per row. Text remains identical after each cycle so exact offsets and final content are independently knowable.
- Sampling: 32 warmups, 256 measured capture/mutation cycles per arm, six balanced arm-order packets using all permutations. Fresh equivalent page per arm. Record batch total, capture and mutation stage durations, common selection setup overhead, checksums, DOM counts, and native endpoints. Natural GC and allocations during each timed cycle count toward total time. These are programmatic mutation cycles, not React commits or trusted-keyboard latency.
- One extra paced-editing check per engine: 1,000 lines, middle caret, replacement of selected text node, 32 animation-frame-separated cycles per arm, five packets. Record active work and wall/frame intervals separately; frame waiting cannot be called algorithm work or a forced GC.
- Correctness first: all small-fixture element/text endpoint pairs for three arms (including backward selections, UTF-16, hidden/noneditable/empty nodes and external endpoints), plus mutation-state checks for every measured arm. Run actual native Selection readback in all engines. Unsupported native pairs are reported, not silently passed.
- Materiality: same predeclared 20% AND 0.05ms per cycle threshold for improvements/regressions; paired median difference must exceed 3x median absolute deviation and have the same direction in at least five of six packets. Report all raw results; six packets support medians/min/max and noise only, not p95/p99. Paced five-packet rows are supporting evidence with all-five direction needed.
- Retained-range control: hold 0, 128, or 2,048 native ranges anchored like the patch, then perform 256 mutations on a 1,000-line fixture, five packets per engine. Compare pure mutation cost; retained ranges are an intentional stress control, never the production candidate. Release references before page disposal.
- Chromium GC diagnosis: instrument the same 10,000-line subtree-replacement cycle for each arm through an owned Playwright CDP session; preserve GC trace and heap metrics. Include natural GC inside the marked operation interval and separately label forced collection after the workload. Do not use heap snapshots to infer pre-GC retention. Browser GC latency unavailable through the Firefox/WebKit runner is reported as un-attributed, not zero.
- Freeze threshold and samples; do not retry unchanged timings until green. If noise prevents a verdict, retain the result and name the cheapest isolating probe. Keep raw artifacts before any harness repair.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | exact function bodies and SHA-256 fingerprints in each engine identity receipt | original blob 4b0dfb0bf2f9855ad1152f0abbe88907ee51f17a verified by reverse hunk | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/identity-chromium.json |
| lockfile / package manager | same installed pnpm lock and package manager | same dependencies | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/identity-chromium.json |
| build mode / host / port | compiled production function; isolated DOM; no app host | same browser fixture | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/identity-chromium.json |
| browser / machine / viewport / DPR | Chromium 149.0.7827.55, Firefox 151.0, WebKit 26.5; Apple M5 Max; Darwin arm64; 1280x720 DPR1 | same engine and host per comparison | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/README.md |
| route / fixture / document / plugins | 27 deterministic cohorts per engine; no plugins | identical document, shape, and selection | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/summary.json |
| setup / action / DOM strategy | full DOM; capture then mutate, reset selection for next cycle | same operations and final content | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/summary.json |
| warmups / samples / interleave order | 32 warmups, 256 cycles, six balanced orders | same counts and fresh pages | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/identity-chromium.json |

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | original Git blob verified and three-engine native offset tests passed | none |
| 2 | current-vs-main-product-smoke | no | N/A: only - explicit isolated owner benchmark | no product claim | none |
| 3 | plate-vs-plite-decomposition | no | N/A: only - explicit isolated owner benchmark | no editor decomposition claim | none |
| 4 | owner-microbench-and-trace | yes | complete | 81 primary rows, three paced rows, Chromium GC diagnostics, and three-engine native guards recorded | none |
| 5 | product-mount-matrix | no | N/A: only - explicit isolated owner benchmark | no product mount claim | none |
| 6 | trusted-editing-matrix | no | N/A: only - explicit isolated owner benchmark | programmatic mutation is labeled | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - explicit isolated owner benchmark | no Slate timing claim | none |
| 8 | example-breadth | no | N/A: only - explicit isolated owner benchmark | no route breadth claim | none |
| 9 | large-and-stress | yes | complete | all 27 large rows and all nine retained-range controls recorded; raw samples preserved | none |

## Interaction Coverage

- first-interaction: N/A: no cold mount/first input claim
- settled-interaction: N/A: programmatic capture/mutation and paced cycles only
- route-scope: N/A: isolated synthetic DOM
- reporter-profile: N/A: three clean browser engines, no reporter-profile claim

## Current Cause Checkpoint

- state: none
- cause-id: N/A: measured candidates resolved in Cause History
- lane: N/A: measured candidates resolved in Cause History
- comparable-baseline: N/A: measured candidates resolved in Cause History
- material-delta: N/A: measured candidates resolved in Cause History
- isolated-owner: N/A: measured candidates resolved in Cause History
- causal-intervention: N/A: measured candidates resolved in Cause History
- correctness-guard-result: N/A: measured candidates resolved in Cause History
- fix-class: N/A: measured candidates resolved in Cause History
- long-term-target: N/A: measured candidates resolved in Cause History
- decision-owner: N/A: measured candidates resolved in Cause History
- layer-plan: N/A: measured candidates resolved in Cause History
- compatibility-verdict: N/A: measured candidates resolved in Cause History
- fix-owner: N/A: measured candidates resolved in Cause History
- benchmark-command: N/A: measured candidates resolved in Cause History
- benchmark-rerun: N/A: measured candidates resolved in Cause History
- benchmark-rerun-result: N/A: measured candidates resolved in Cause History
- correctness-command: N/A: measured candidates resolved in Cause History
- correctness-rerun: N/A: measured candidates resolved in Cause History
- correctness-rerun-result: N/A: measured candidates resolved in Cause History
- resume-lane: N/A: measured candidates resolved in Cause History

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| range-dom-mutation | owner-microbench-and-trace | quarantined | internal-implementation | Reject the Range replacement for upstream adoption; preserve character offsets without allocating a live Range | benchmark | N/A: internal React algorithm comparison | N/A: public and serialized contracts unchanged | ReactDOMSelection getModernOffsetsFromPoints | Same-source substitution moves work into subsequent DOM mutation; Range causes 2 Firefox and 8 WebKit material regressions, including 6.50 to 41.65ms per cycle at WebKit 10000-line end-caret subtree replacement | pass: three-engine native offset guard before the full matrix | RUN_REACT_SELECTION_MUTATION_BENCHMARK=1 pnpm --filter www exec playwright test --config playwright.selection-benchmark.config.ts | fail: 10 of 81 primary rows materially regress; candidate rejected for recommendation, installed patch untouched in this measurement-only scope | RUN_REACT_SELECTION_MUTATION_BENCHMARK=1 pnpm --filter www exec playwright test --config playwright.selection-benchmark.config.ts --grep "three-arm native offset correctness" | pass: full run repeats 4678 supported native pairs with zero three-arm mismatches; 365 WebKit pairs unsupported | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/summary.json |
| early-exit-walk | owner-microbench-and-trace | deferred | internal-implementation | Pursue the two-exit walker as an upstream candidate after React-owned commit and restoration proof | benchmark | N/A: internal React algorithm comparison | N/A: public and serialized contracts unchanged | ReactDOMSelection getModernOffsetsFromPoints | Adding only two successful-endpoint exits avoids visiting the remaining tree and creates no native Range | pass: three-engine native offset guard before the full matrix | RUN_REACT_SELECTION_MUTATION_BENCHMARK=1 pnpm --filter www exec playwright test --config playwright.selection-benchmark.config.ts | pass: 20 material improvements, zero material regressions, 59 below threshold, 2 inconclusive; retain benchmark candidate without claiming production adoption | RUN_REACT_SELECTION_MUTATION_BENCHMARK=1 pnpm --filter www exec playwright test --config playwright.selection-benchmark.config.ts --grep "three-arm native offset correctness" | pass: full run repeats native guards and checks all mutation captures and final DOM/selection state | artifact: docs/plans/artifacts/2026-09-10-react-selection-mutation/summary.json |

Work Checklist:
- [x] Poteto principles and applicable Benchmark, Task, Verify Plate, TypeScript, Autogoal and Show Me Your Work methods read in this ongoing task.
- [x] User scope and complete denominator recorded; preserve prior static benchmark evidence and do not publish.
- [x] Throughput checkpoint: one data-driven runner covers all arms/fixtures/engines; execute serially to avoid benchmark contention.
- [x] Original/candidate/early-exit source and every host input fingerprinted; original Git blob verified. Final identity verification matches all recorded inputs across the three engines.
- [x] Three-engine native offset guard and mutation-state guard pass before accepting timing results.
- [x] All 81 primary rows retain six paired packets and honest verdicts, including negative/inconclusive results.
- [x] Paced cycles, retained-range controls, and Chromium GC trace/forced-GC diagnostics collected and interpreted within their limits. Precise Firefox/WebKit GC attribution remains unavailable; natural GC is included in total elapsed work.
- [x] Source-linked Benchmark obligations reconciled: all applicable lanes, frozen noise gate, exact commands, full distributions, causal control, final identities and complete validator. Two early-exit inconclusives remain inconclusive; the report names the smallest follow-up if they become adoption gates.
- [x] TypeScript inference, scoped lint, and same-source final checks passed; no package, registry, doctrine or workflow source changed. Focused final TypeScript and lint check commands exit 0; no barrel, registry or template generation applies.
- [x] Show Me Your Work decision trail reconciled with raw evidence; Technical Writing report inspected for claims, comparisons and limits. Report separates native Range allocation from the retained offset-result object allocation and programmatic mutation from React commits.
- [x] Benchmark complete validator and Autogoal checker pass; native goal completion reflects measured answer. Command results are recorded in verification.log.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Explicit scope, authority, and frozen protocol | yes | user accepted the three-arm mutation/GC comparison; this plan |
| Original code and installed browsers | yes | source loader verifies the original blob; three installed Playwright engines completed the matrix |
| Publication, downstream implementation, other checkout | no | measurement authorization only |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| All measurements and correctness | yes | benchmark-run.log: 97 passed, 2 intentional non-Chromium GC-attribution skips; all 81 primary rows and supporting controls retained |
| Source identity and raw evidence | yes | final-identity-verification.json: no mismatches; summary.json accounts for 1458 primary arm packets and 373248 measured cycles |
| Focused TypeScript and lint | yes | focused tsc and ultracite check each exited 0; typecheck.log and lint.log |
| Benchmark semantic and goal checkers | yes | complete-validator command receipts in verification.log |
| Autoreview | no | next branch; not authorized by this benchmark |
| Product/browser route, release, registry, workflow sync | no | isolated test/diagnostic source only |

Open risks:
Natural Range lifetime and GC differ by engine and task cadence. Artificial retention supports a mechanism without measuring the number of uncollected ranges in the primary run. Constant DOM shape/contents and collapsed timing carets cannot prove arbitrary editor integrations. The one traced Chromium early-exit diagnostic was slower and is retained as an unpaired observation, not a primary verdict. Real React commit/restoration behavior, trusted typing, physical devices and installed browser profiles remain outside this measurement. The existing Next Range patch remains installed and unchanged despite the rejected upstream recommendation.

Commands (repo root):
- Benchmark: `RUN_REACT_SELECTION_MUTATION_BENCHMARK=1 pnpm --filter www exec playwright test --config playwright.selection-benchmark.config.ts`
- Correctness: `RUN_REACT_SELECTION_MUTATION_BENCHMARK=1 pnpm --filter www exec playwright test --config playwright.selection-benchmark.config.ts --grep "three-arm native offset correctness"`
- TypeScript: `pnpm exec tsc --ignoreConfig --noEmit --target es2023 --module preserve --moduleResolution bundler --skipLibCheck --types node apps/www/playwright.selection-benchmark.config.ts apps/www/tests/browser/react-selection-mutation.fixture.ts apps/www/tests/browser/react-selection-mutation.spec.ts`
- Lint: `pnpm exec ultracite check apps/www/playwright.selection-benchmark.config.ts apps/www/tests/browser/react-selection-mutation.fixture.ts apps/www/tests/browser/react-selection-mutation.spec.ts`
- Benchmark validator: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-09-10-react-selection-mutation-benchmark.md --complete`
- Goal checker: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-10-react-selection-mutation-benchmark.md`

Findings:
Range: 25 of 81 primary rows improve materially, 10 regress, 40 fall below the frozen threshold, and 6 are inconclusive. Early exit: 20 improve, zero regress materially, 59 fall below threshold, and 2 are inconclusive. Range's worst absolute regression is WebKit 10000-line end-caret subtree replacement: median total 6.5039 to 41.6465ms/cycle, with mutation 0.6387 to 35.2695ms/cycle. Early exit is 6.7266ms/cycle in that row. All three engines show retained-range mutation overhead. The Chromium trace does not establish a permanent leak; post-GC heaps converge.

Verification evidence:
[Complete report](artifacts/2026-09-10-react-selection-mutation/README.md), [raw summary](artifacts/2026-09-10-react-selection-mutation/summary.json), [run log](artifacts/2026-09-10-react-selection-mutation/benchmark-run.log), and [source verification](artifacts/2026-09-10-react-selection-mutation/final-identity-verification.json). Three-engine native guards compare 4678 supported endpoint pairs with zero mismatches and report 365 unsupported WebKit pairs. Every primary packet checks native endpoints, all captures, final text and DOM shape; 419904 captures are checked including warmups. Three paced rows, nine retention controls, three Chromium traced arms and separate forced-GC windows are retained. The exact full command repeats correctness after the initial native guard; no unchanged timing row was retried for a better result.

Final handoff contract:
- Scope: local three-arm measurement and recommendation, with no production or upstream edits.
- Decision: reject Range for upstream adoption; early exit earns React-owned implementation/proof work before proposing a PR.
- Hard-cut counterfactual: retain character offsets because they survive node replacement; add no cache, live-Range protocol, public API, or extra owning layer. Early exit changes only when the existing walk terminates.
- Coverage: three applicable Benchmark lanes complete; six N/A by explicit isolated scope; zero unfinished measurement rows.
- Evidence: all raw packets, source identities, initial smoke receipts, diagnostic traces, negative results and inconclusives remain available.
- Checks: focused source-first TypeScript, scoped lint, Benchmark complete validator and Autogoal checker. Autoreview is N/A on next; package, registry, doctrine and release gates are N/A because their owning source did not change.
- Limit: the existing Next patch is unchanged. This task neither adopts early exit in React/Next nor publishes a PR or a whole-editor latency claim.
