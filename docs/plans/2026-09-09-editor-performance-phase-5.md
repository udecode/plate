# Editor performance phase 5: native interaction latency

Status: Phase 5 complete locally on `next`; four retained fixes, all twelve candidate dispositions and applicable integration proof complete. No publication. The parent Phase 5 exit is experiment disposition, not a promise to clear every historical absolute budget.

Objective:
Resolve current native full-DOM typing, structural edits and table selection/resize costs; retain only causally proven improvements with matched current-source and native proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-09-editor-performance-phase-5.md

Template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: User go on 2026-09-09 to the proposed Phase 5 pivot after Phase 4 completion.
- scope: Native full-DOM typing/structural first; table selection/resize second; trace-selected Phase 5 interventions, no broad new research audit.
- invocation: $benchmark only Phase 5 native interaction latency
- candidate-identity: fingerprint: a6afd55c30e97c74fe895d1ad005ca75413110f3 plus dirty source SHA256 a0a62ee37796feaf19317938a0372cfd0ad1f699062bcda8a77553298f8ad99e; initial-source-identity.json (2098 inputs)
- plate-main-identity: origin/main 8f65d77f8b4709833436e63661e4d061f709258f; historical release context, no cross-version comparison selected
- plite-identity: fingerprint: same-source Plite inputs in initial-source-identity.json
- slate-identity: N/A: only - current native/table owner experiments; pinned Slate 945a484df2497e4c448b33f417b0de2a49840032 retained as context
- named-symptom: Historical Phase 3 native 10k input 471.3 ms p95 versus 200 ms; source-invalidated table timings; Phase 4 bounded structural renders but document-wide selector checks. Reproduce on current source.
- final-artifacts: artifact: docs/plans/artifacts/2026-09-09-editor-performance-phase-5/results.md

First checkpoint:
- Copy every explicit requirement into checkable rows before measurement or
  code changes.
- Resolve source identities, host/build freshness, fixture/action comparability,
  correctness guards, and every default lane's applicability.
- All applicable lanes are selected by default. Only an explicit `only`
  invocation may mark otherwise relevant lanes
  `N/A: only - <reason>`. Use `N/A: inapplicable - <reason>` only for a lane
  that genuinely cannot apply.

Timed checkpoint:
- requested duration: N/A: no budget requested
- semantics: one selected phase
- start / deadline: 2026-09-09; no deadline
- final loop closure: finish selected Phase 5 proof and stop

Completion threshold:
- Resolve current native typing/structural and table selection/resize cases through diagnosis, justified interventions, exact performance/correctness reruns, and all applicable lanes. No required behavior remains broken.
- Reuse original native input 200 ms p95, mount 204 ms maximum-of-five, syntax settle 600 ms p95 and inspected table budgets only when the original fixture and clock remain valid. Preserve absolute failures. No unchanged timing retries until green.
- Before any target result, freeze matched materiality/noise and normal-cohort preservation gates. A shared-host absolute miss without a matched regression remains inconclusive, not a false performance pass.
- Give all twelve original Phase 5 candidates a trace-backed selection or justified deferred/rejected scope disposition; execute only candidates whose entry gates are met. U31 degradation requires separate product authority; U32 stays rejected.
- Every kept fix passes the exact original benchmark and correctness/native guards. Complete Benchmark --complete and Autogoal validators; Autoreview is N/A on next. Stop after Phase 5; no publication.

Verification surface:
- benchmark commands / artifacts: final-metric-commands.json and results.md under the phase artifact directory; raw final table, 1k/10k native and 1k structural packets.
- correctness commands: pnpm check:plite; pnpm plite:release:packages; pnpm check:plite:browser-matrix; affected www native table/code cases; focused table, context and DOM lifecycle regressions.
- Browser / Chrome / device proof: actual Browser /blocks/table-demo at 1280 and 390 CSS pixels; native code/structural canonical runners and affected www native routes. Physical devices N/A: no device claim or virtual affordance expansion.
- source/ref/fingerprint proof: original final metric packets bind unchanged 2270-input e2d0574e; current matrix binds 4372 inputs and current types/native/table proof binds 4374. final-source-reconciliation.json classifies concurrent app-only differences and proves unchanged effective package and selected-route inputs.

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM, or a narrower action.
- Do not create another benchmark target registry or permanent run ledger.
- A conclusive cause pauses later lanes; it does not complete the goal.
- A proven cause selects the best long-term durable target, not the cheapest
  compatible patch. Before stability, hard-cut API or architecture when that
  buys materially better lasting value; preserve only a named hard correctness,
  security, serialized-data, native-behavior, or runtime law.
- After a fix, rerun the exact red lane and correctness guard before breadth.
- Do not commit, push, open a PR, comment, publish, or release unless separately
  authorized.

Boundaries:
- allowed runtime/packages/apps: /Users/zbeyens/git/plate-2 current checkout, branch next; affected Plate/Plite native and table owners.
- allowed benchmark/tests/fixtures: existing canonical native/structural/table runners plus smallest required instrumentation; phase artifact directory.
- allowed baseline checkouts/hosts: read existing local refs and source-built disposable hosts; no new checkout/worktree.
- non-goals: unrelated feature audits, speculative workers/virtualizers/representation rewrites, silent degradation, publication, scheduling or another phase.

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- Missing exact baseline, effective inputs or required native capability blocks only dependent proof; continue independent selected work. Noisy absolute timing does not prove a cause. Fix a broken correctness oracle before product changes; never manufacture completion.

## Interaction Coverage

- first-interaction: pass: cold full-cell hydration/remount oracle; native first burst, first/middle structural keyboard actions and actual table edit/undo/resize sequence.
- settled-interaction: pass: all measured native bursts complete syntax/text/caret checks; table guards after every sample; resize undo and further typing in five actual Browser runs.
- route-scope: pass: source-first /dev/table-perf and /blocks/table-demo; canonical huge-document and code-block product fixtures; final www code/table route corpus.
- reporter-profile: N/A: no external reporter/profile requirement; the actual available Browser supplies desktop/narrow gesture proof, repository Chromium supplies its owned automated scope.

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | next a6afd55c; final 2270-input e2d0574e; each intermediate target has its own receipt | Same current-source comparisons toggle only their measured owner; original file bytes and all restorations are hashed | artifact: initial-source-identity.json; table-context-abba-restoration.json; final-metric-commands.json |
| lockfile / package manager | same pnpm-lock.yaml; pnpm9.15/Bun1.3.12 | identical lockfile and runners | artifact: initial-source-identity.json; normal source pairs |
| build mode / host / port | Next16.3.2 source-first Turbopack dev, localhost3297; native code uses standalone production React | same build mode, route and host within each comparison | artifact: www-source-host-v2.log; normal packet url fields |
| browser / machine / viewport / DPR | Chromium137 Puppeteer table defaults, Darwinarm64; native huge runner uses its installed Chromium | same executable/configuration per comparison; different runners remain separate | artifact: table runner launch source; native packet config and surface rows |
| route / fixture / document / plugins | /dev/table-perf, identical 10x10 normal and original20/40 fixtures; BasicBlocks/Dnd/Table | same original fixture and plugin graph; no empty-DOM packet accepted | artifact: table-normal target/control raw artifacts; table-candidate-smoke.json |
| setup / action / DOM strategy | full DOM; programmatic coordinate/resize owner-to-two-frame clock; separate native actions | identical setup/action; guards after clock; raw native split/merge model and DOM guards | artifact: table-candidate-smoke.json; native-structural-10-v2.json; native-structural-1k.json |
| warmups / samples / interleave order | table 3 warm/22 measured per packet, ABBA; owner2warm3measured per size; native mounts1warm5measured/20bursts | same per comparison; profile samples excluded; structural1warm3measured per point | artifact: table-normal-abba-restoration.json; table-index-probe.json; native-normal-1k.json |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Intake plan, frozen native/table clocks and parent twelve-entry denominator recorded before intervention |
| Timed checkpoint parsed | no | N/A: one phase requested; no elapsed-time or token budget |
| `benchmark` source and methodology read | yes | Full Benchmark method/performance review, Poteto Principles and Perf Issue, Task workflow and Verify Plate loaded at intake |
| Task plan reused; standing Autogoal request or explicit opt-out resolved | yes | This single dated plan and native Phase 5 goal; standing user Autogoal authority |
| Candidate and baseline identities recorded | yes | initial-source-identity.json and each matched owner control/target snapshot |
| Target/runner discovery completed from current source | yes | Canonical code-block-text-flow-browser, huge-document-browser-trace and run-table-perf runners |
| Host/build/fixture freshness proved | yes | Cold source host at 3297; native build identities; 100-percent model/DOM guards; drift packets quarantined |
| Correctness oracle identified | yes | Exact full text/caret/token/DOM; table cell/selection/width; native resize undo and further typing |
| All default lanes inventoried | yes | All nine rows retained below; seven applicable and two explicit-only scope exclusions |
| `only` narrowing explicitly authorized or N/A | yes | User go to bounded current native/table pivot; no new external/cross-version audit |
| Browser/native proof strategy selected | yes | Actual Browser native gestures on normal/narrow table; canonical keyboard/native route runners |
| Output budget strategy recorded | yes | Artifacts hold raw traces and samples; bounded summaries in the plan |
| Commit/PR/release authority recorded | no | N/A: user authorized local phase work only; no publication |

Work Checklist:
- [x] First task step: read full Poteto Principles, runtime adapter and Perf Issue playbook; user instructions override rebase/publication examples.
- [x] P5-READINESS: resolve source/host/runner/oracle identity, nine default lane applicability and original budgets before measurements.
- [x] P5-NATIVE: measure first/settled full-DOM typing and structural actions; isolate commit, selector and browser cost with normal/stress native guards.
- [x] P5-TABLE: reproduce current selection/resize with unchanged source, then fix any proven cause.
- [x] P5-SELECT: resolve all 12 original Phase 5 candidate entry gates; choose interventions from traces only.
- [x] P5-ADOPTION: test delete/merge/reuse before adding owners; Best API plus owning layer plan precedes architectural adoption; exact rerun before resumed breadth.
- [x] P5-PROOF: affected package, normal/narrow native and required strict/packed/matrix/generation checks; reuse proof by effective inputs.
- [x] P5-CLOSE: reconcile source-linked obligations, audit trail and semantic validators; update parent and stop before any new phase.
- [x] Every explicit scope, comparison, timing, stop condition, deliverable,
      verification surface, and success criterion is recorded.
- [x] Short objective, threshold, verification, constraints, boundaries, and
      blocked condition are concrete.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason.
- [x] Candidate/baseline signatures prove comparable source, fixture, action,
      build, browser, machine, and sampling.
- [x] Primary metrics match the visible user operation; proxies stay labeled.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them,
      plus max, absolute/relative delta, and noise evidence.
- [x] Red lanes are not called causal without the conclusive-cause gate.
- [x] A proven cause pauses later lanes before another expensive benchmark.
- [x] Every proven cause records its fix class, best long-term target, decision
      owner, layer plan, compatibility verdict, and implementation owner.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then
      `plite-plan`, `plate-plan`, or both before implementation. Broad accepted
      execution may use `task autonomous`; target selection may not.
- [x] One isolated owner is fixed, then the exact benchmark and correctness
      guard rerun before breadth resumes.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to
      a different green metric.
- [x] Green reruns resume the first pending applicable lane.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner
      evidence.
- [x] Harness/metric/host defects are repaired before product optimization.
- [x] Final handoff reports candidate/baseline identities, lane status, first
      conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | initial-source-identity.json binds 2098 inputs; Plite rebuilt first and canonical runner rebuilt Plate; native-baseline-source-readback.json confirms unchanged inputs; full DOM/text/caret/token guards pass | Lane 2 native symptom |
| 2 | current-vs-main-product-smoke | no | N/A: only - one selected current-owner Phase 5 | User accepted a bounded current native/table measurement-and-fix phase; current-owner controls determine adoption, no new cross-version comparison | No cross-version claim |
| 3 | plate-vs-plite-decomposition | yes | complete | Same-source Plate/Plite 10/1000 full-DOM native typing/split/merge, all 24 measured pairs pass across cohorts; code CPU separates highlighting from native/browser work | Table owner cause |
| 4 | owner-microbench-and-trace | yes | complete | Two causal table reductions pass matched gates; native/structural trace-backed entry decisions recorded | Final integration; retain absolute misses |
| 5 | product-mount-matrix | yes | complete | Final normal code/table mounts pass; 10k code mount remains red; native 1 warm/5 measured and table 3 warm/22 measured, full DOM verified | No mount speedup claim |
| 6 | trusted-editing-matrix | yes | complete | Five actual normal/narrow table replays pass; final 24 structural actions and native code guards pass | Final www integration remains in Completion Gates |
| 7 | plite-vs-pinned-slate | no | N/A: only - selected current native/table owners | No new external-editor or raw substrate comparison selected | No upstream speed claim |
| 8 | example-breadth | yes | complete | Selected full-DOM paragraph/code fixtures and actual table route pass their model/DOM/native guards | Strict/matrix/www integration remains in Completion Gates |
| 9 | large-and-stress | yes | complete | 1k/10k code;10/1k paragraph structural;10x10/40x40 matched resize; all 12 candidate dispositions in results.md | Preserve named native/selection budget failures |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- lane: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- comparable-baseline: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- material-delta: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- isolated-owner: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- causal-intervention: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- fix-class: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- long-term-target: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- decision-owner: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- fix-owner: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- benchmark-command: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- benchmark-rerun: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- correctness-command: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- correctness-rerun: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- resume-lane: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- compatibility-verdict: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- layer-plan: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- benchmark-rerun-result: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- correctness-guard-result: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- correctness-rerun-result: N/A: selected causes resolved in Cause History; final integration remains a Completion Gate
- reason: Two isolated resize costs pass their frozen matched gates and the original resize action ceiling jointly. Two exact correctness cases pass focused/native proof. Later breadth resumed. Remaining absolute native/selection misses have no selected proven intervention; they remain explicit findings, not green performance claims.

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P5-TABLE-REACT-COMMIT | source-and-host-readiness | kept | correctness | Acknowledge existing React layout ownership before text-flow reconciliation | patch | N/A: private lifecycle correction | N/A: no public/runtime architecture change | packages/plitejs/src/react/components/editable-text-flow.tsx | Exact nested-wrapper red test and observer deletion trace | pass: oracle detects the original lost live table | bun apps/www/scripts/run-table-perf.mts --url http://localhost:3297/dev/table-perf --preset smoke | pass: original every-cell readiness case passes final smoke; selection latency remains separately red | bun test packages/plitejs/test/react/editable-text-flow-react-commit-contract.test.tsx | pass: focused regression and 32 lifecycle/integrity/hydration cases; actual table input | text-flow-react-commit-red.log; text-flow-react-commit-layout.log; final-table-smoke.json |
| P5-TABLE-COORDINATES | owner-microbench-and-trace | kept | internal-implementation | Reuse existing immutable geometry for coordinate-only reads | benchmark | N/A: unchanged grid/query owners | N/A: unchanged contract | packages/platejs/src/features/table/lib/BaseTablePlugin.ts | 65.5-percent profile attribution;1600 full compilations to zero; owner sweep5400 ms to 4 ms | pass: every owner coordinate matches; inherited named-root read/view defect isolated in both arms | bun apps/www/scripts/run-table-perf.mts --url http://localhost:3297/dev/table-perf --preset smoke | pass: original 40x40 resize is 148.2 ms p95/148.4 max against 500/750; the selected case required both resize fixes; whole-command selection ceiling remains red | bun test packages/platejs/src/features/table/lib | pass: 236 table cases including deterministic work regression; final full-cell/width oracle | table-index-probe.json; table-normal-abba-restoration.json; final-table-smoke.json |
| P5-NODE-CONTEXT | owner-microbench-and-trace | kept | internal-implementation | Delete unused parent-context dependency for explicit keyed selectors | benchmark | N/A: existing selector and React context owner | N/A: unchanged public selector contract | packages/plitejs/src/react/hooks/use-node-selector.tsx | Same-action text events 5000 to 200; normal ABBA and 40x40 matched materiality beyond IQR | pass: identical text, width and full-cell guards in both arms; inherited/keyed/transition oracles preserved | bun apps/www/scripts/run-table-perf.mts --url http://localhost:3297/dev/table-perf --preset smoke | pass: original 40x40 resize148.2 ms p95; matched 40x40 median 2418.55 to 254.70 ms; whole-command selection ceiling remains red | bun test packages/plitejs/test/react/node-selector-context-contract.test.tsx | pass: explicit/inherited/null/undefined/keyed-update cases and five actual resize-edit-undo replays | table-context-comparison-summary.json; table-context-abba-restoration.json; final-table-smoke.json; table-native-final-stability.json |
| P5-TABLE-RESIZE-CURRENT | trusted-editing-matrix | kept | correctness | Initialize each pointer gesture from the current table snapshot at its stable key | patch | N/A: existing pointer lifecycle owner | N/A: unchanged resize API and cancellation laws | packages/platejs/src/react/features/table/useTableResize.ts | Original control also fails after edit/undo; stale rendered snapshot fails in-flight identity guard | pass: seven existing cases pass and two new owner regressions detect the inherited failure | Browser /blocks/table-demo: type,undo,resize30px,refocus,undo,refocus,type | pass: five actual Browser runs across 1280/390px commit 130/70 and undo to 100/100 and preserve further typing | bun test packages/platejs/src/react/features/table/useTableResize.spec.tsx | pass:9/9 in five fresh processes; existing cancellation and preview/history laws remain green | table-resize-after-edit-stability.json; table-native-final-stability.json |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| native-baseline-10k and native-normal-1k | trusted-editing-matrix | Reproduce native size sensitivity | 10k input591.4ms p95 red;1k118.3pass | All native/full-DOM/token guards pass | keep evidence; no native speed claim | Trace-selected entry gates |
| native-trace-10k and native-structural-profile-1k | owner-microbench-and-trace | Locate browser/selector/index work | Layout67.44/PrePaint42.23/Paint15.92ms in445ms; structural mapping/index not dominant | Correctness passes; profiles excluded from distributions | defer speculative containment/representation/worker interventions | Twelve-entry disposition table in results.md |
| table-smoke-baseline | source-and-host-readiness | Apparent fast table | Zero mounted table cells | Invalid fixture despite stable source | quarantine | Nested React commit repair |
| table-guarded-v2 | source-and-host-readiness | Fresh guarded baseline | HMR schema error with changed effective source | Invalidated by source drift | quarantine | Cold source host |
| original guarded resize and table-resize-profile | owner-microbench-and-trace | Coordinate compilation dominates | Original timeout;65.5-percent attributed interval | Earlier mount/input/selection guards pass; timeout incomplete | keep censored diagnostic only | Coordinate caller correction |
| table-index-probe and table-normal ABBA | owner-microbench-and-trace | Reuse canonical geometry | Work1600 to 0; whole10x10 timing movement inside drift | Coordinate/grid/original-route guards pass | keep deterministic reduction jointly with final exact resize pass | Remaining resize render cause |
| table-context ABBA and40x40 pair | owner-microbench-and-trace | Explicit node selectors observe unused parent context | Text events5000 to 200;40x40 median2418.55 to254.70 ms | All width/text/full-cell checks pass | keep | Native and full proof |
| table-native-after-edit control/red | trusted-editing-matrix | Stale rendered table cancels later gesture | Original and candidate both fail after edit/undo | New exact inherited failure; candidate not blamed | keep diagnosis | Current-snapshot pointer correction |
| final-table-smoke | large-and-stress | Final original absolute ceilings | mount322.3,input17.1,selection393.8,resize148.2 ms p95 | All model/DOM/selection/width guards pass | keep result:selection red,other action budgets pass | Residual table selection owner |
| final-native-1000/10000 and structural1k | large-and-stress | Final native and structural preservation | 1k native passes;10k absolute misses;24 structural actions pass | Full model/DOM/caret/focus/history where selected | keep evidence; separate run drift is not causal regression proof | Final integration and residual native diagnosis |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| Normal10x10 resizeABBA |22 per packet;3warm | A1 median74.45/p95165.4;A2 median116.55/p95265.5 | B1 median16.40/p9517.2;B2 median16.45/p9517.5 | At least58.05ms/78.0-percent median gain | LargerIQR8.0/36.1; targetIQR0.5; no p99 claim | table-context-comparison-summary.json;raw action-clock packets |
| Stress40x40 resize |22 per arm;3warm | median2418.55/p952719.2/max3317.7 | median254.70/p95350/max363.6 |2163.85ms/89.5-percent median gain | IQR555.1/88.3;material above noise | table-context-a40-action-clock.json;table-context-b40-action-clock.json |
| Final current-config original table smoke |22 per action;3warm | Original resize timeout censored | p95 mount322.9/input17.0/selection413.8/resize139.8 | Only matched resize comparison supplies a gain | Selection 100 ms ceiling red; final mount 450/input 75/resize 500 and 750 pass | final-current-table-smoke.json; earlier final-table-smoke.json retained |
| Final1000/10000-line native |20 bursts;5mounts;1warm | Initial1k inputp95118.3;10k591.4 | Final1k115.5;10k938.8 | No matched cross-packet delta claim | Normal passes; stress is red; five-mount tail = maximum;no p99 | final-native-1000.json;final-native-10000.json |
| Final1000-block structural |3 per point/action/surface | Initial shared Plate/Plite64-132ms range | Current-config48.3-86.2ms; earlier final73.4-142.5ms | No structural speedup claimed from separated packets | 24 action guards pass per packet; no tail from 3 samples | final-current-native-structural-summary.json; final-native-structural-summary.json |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Complete all twelve scope decisions, selected causal fixes and exact correctness/native comparisons | results.md; original resize budget passes; native1k passes; remaining native10k/selection absolute failures preserved |
| Benchmark plan structural validation | yes | Validate cause/resume checkpoints | benchmark-checkpoint-validation.log passes |
| Every applicable lane closed | yes | Resolve seven applicable lanes and two explicit-only exclusions | Lane table; native, table, trace, normal/stress and selected route evidence |
| Exact post-fix benchmark reruns | yes | Rerun original selected case and matched control after each correction | final-metric-commands.json; table-context comparison; native-preservation eight-packet ABBA; original resize passes |
| Correctness/native behavior reruns | yes | Exact focused regressions and real affected native routes |32 lifecycle cases, 236 table cases, 9 pointer cases in five fresh processes, five actual Browser normal/narrow runs; all 17 final www cases pass |
| Final source/host identity | yes | Reconcile each effective input set after all gates | final-source-reconciliation.json covers eight proof receipts, current config replay, unchanged package inputs, and the two unrelated AI HTTP routes appearing/disappearing outside selected client imports |
| Benchmark target/metric honesty | yes | Verify original fixture, sampling and artifact provenance | Zero-DOM/source-drift quarantine; complete cell/text/selection/width oracles outside unchanged clocks; no table native-latency claim |
| Durable fix decision | yes | Delete or reuse before adding owners; architectural adoption only if selected | Four private corrections reuse current owners; public API and runtime architecture unchanged |
| Package/type/build proof | yes | Strict source/type/tests, packed artifacts and www typecheck | final-check-plite-v3.log passes 743 Chromium cases/eight declared skips; ordinary packed replay passes four packages/83 subpaths/41 optional-peer closures; final-www-typecheck-v3.log passes with unchanged inputs |
| Browser surface proof | yes | Actual normal/narrow Browser and canonical full browser matrix/native www corpus | Five actual Browser replays; final matrix 2383 passes/623 declared skips/3006 selected rows with exact coverage; all17 current www cases pass in46.1s; receipts in final-browser-matrix-summary.json and final-browser-closure-v3-commands.json |
| Changeset/release artifact | partial | Verify published-owner applicability and current packed artifacts | changeset-applicability.json: affected v2 owners absent from main; no separate changeset; ordinary packed artifact check passes |
| Barrels and registry generation | no | N/A: no export/file moves or registry component source changes | No barrel/registry regeneration required; table benchmark route is not registry source |
| Agent rule/skill sync | no | N/A: no agent-workflow source or public doctrine change | No source-rule/mirror/version mutation selected |
| Benchmark plan complete validation | yes | Run validator with --complete after all named gates | Final command receipt: benchmark-complete-validation.log |
| Final lint | yes | Scoped equivalent of pnpm lint:fix | final-scope-lint-v3.log passes 12 owned files; both modified JavaScript runners pass node --check |
| Timed checkpoint | no | N/A: no duration or token budget requested | Complete this one phase and stop |
| P1 autoreview | no | N/A: forbidden on next and no publication request | Zero structured-review invocations for Phase 5 |
| Goal plan complete | yes | Run Autogoal check-complete after evidence reconciliation | Final command receipt: goal-complete-validation.log |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | Nine lane rows, original native/table clocks, source/build identity and all twelve candidate entry gates | Diagnosed selected current-source cases |
| Ordered diagnosis | complete | Native CPU/timeline and structural traces; two isolated table performance causes; two exact behavior causes | Retained four corrections |
| Fix and exact rerun | complete | Matched table ABBA, original resize budget, focused red/green and five actual native runs | Final integration and native preservation comparison |
| Remaining breadth | complete | Strict Plite, ordinary packed, current www types/native and full matrix pass; current-config table/structural replay and source reconciliation complete | Residual absolute misses remain explicit |
| Review and closeout | complete | No Autoreview on next; final source reconciliation, twelve-entry accounting and semantic completion checks recorded | Parent updated; stop after Phase 5 |

Findings:
- Four private fixes passed exact focused/native proof; matched40x40 resize median improves 89.5%. Final original resize/input/mount ceilings pass while selection remains red. Normal native 1k passes; native 10k remains red with noisy separated packets. Full 12-candidate dispositions are in results.md.

Decisions and tradeoffs:
- Reuse existing geometry, context fallback, React commit and pointer owners. No public API/runtime architecture selected, so Best API adoption/doctrine repair is N/A. All12 sealed candidates resolved:11 deferred by unmet entry conditions/policy boundary,1 rejected. Keep U31 separately authorized and U32 rejected.

Harness/methodology repairs:
- Table fixture verifies every model/DOM cell, text, exact selected count and widths outside existing clocks. Native/table runners retain optional timeline/render instrumentation. Structural runner reads the current serialized children and guards native Enter/Backspace. Quarantine zero-DOM and source-drift packets. Strict test type errors use current existing public adapters; no workflow-source change.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| Zero-cell table smoke | 1 | Trace observer/React ownership | Quarantined; exact nested-wrapper correction |
| Guard accessor and serialized-value shape | 1 each | Read actual root/value owner | Harness repaired, original clocks preserved |
| Concurrent source drift/HMR | 1 | Cold source host | Quarantined packet; subsequent timing inputs unchanged |
| Original40x40 resize timeout | 1 plus bounded diagnostic | CPU attribute then isolate coordinate owner | Final original resize case passes after two reductions |
| Strict tests type errors | 1 | Migrate18 stale test adapter calls to current inferred API | Exact tests typecheck passes |
| Strict source-watch interruption | 1 | Freeze runtime and test bytes | Strict v3 passes on unchanged inputs |
| Native post-drag follow-up without refocus | 1 protocol diagnosis | Follow existing table focus contract and explicitly refocus cell | No no-click focus claim |

Verification evidence:
- final-metric-commands.json: native1k/structural/build pass; native10k and table whole command retain absolute misses with all semantic guards. final-current-route-commands.json refreshes current-config table and structural proof. table-native-final-stability.json:five actual normal/narrow runs pass. final-scope-lint-v3.log and table pointer/context/lifecycle proofs pass. Strict proof is in final-verification-commands.json, packed proof in final-verification-closeout-commands.json, and current matrix/types/native proof in final-browser-closure-v3-commands.json. final-source-reconciliation.json accounts for every later input difference and all reused proof.

Final handoff contract:
- goal plan / scope: this Phase 5 plan,12 original candidates,current native/table owners,local only
- candidate / baseline identities: initial a6afd55c/source a0a62ee3; final metrics e2d0574e/2270 inputs; per-owner matched arms and restoration receipts
- completed / N/A / pending lanes: seven applicable complete,two explicit-only N/A; zero pending integration gates
- first conclusive cause: nested React text-flow remount invalidated table readiness; first timing cause is repeated keyed geometry compilation
- baseline / latest / best metrics: full raw/distribution table in results.md; matched resize89.5-percent median gain,current-config resize139.8ms p95; preserve native10k/selection413.8ms red
- fix owner / changed files: editable-text-flow,use-node-selector,BaseTablePlugin,useTableResize; colocalized tests and existing benchmark fixtures/runners
- exact benchmark and correctness reruns: original table smoke, native code and structural commands; focusedred/green tests; five actual native table replays
- resumed breadth: normal/stress/native/structural lanes after same-case resize pass; strict/packed/matrix/nativewww final gates
- packet decisions: four kept fixes,12 candidate dispositions; quarantined empty-DOM/source-drift packets; censored original timeout; all shown above
- harness/methodology repairs: full-cell fail-closed table oracle, optionalprofileexports, native structural guards; no workflow change
- residual claim limits / next owner: native 10k and table selection budgets remain red; inherited named-root Plate query/view binding outside selected geometry fix; no native latency claim from programmatic table clocks

Timeline:
- 2026-09-09T10:35:27.676916+00:00 Benchmark goal plan created.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Phase 5 complete locally with four focused fixes, all12 dispositions and final proof |
| Where am I going? | Stop; no additional phase or publication authorized |
| What is the goal? | Complete the accepted native/table Phase 5 experiments and proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Native10k typing/mount/syntax and table40x40 selection remain above absolute budgets. No cross-version/editor or whole-editor speed claim. Named-root Plate public query/view binding is an inherited separate behavior defect. Narrow viewport proof is not physical-device/AX proof. Concurrent app changes are classified by actual package/route reachability in the final reconciliation.

## Intake methods and decisions

Sources: Task workflow; Benchmark entrypoint and full methodology plus performance review; Autogoal checklist retention; Poteto Principles, Codex adapter and Perf Issue; Verify Plate; Show Me Your Work. Required remaining mechanics are loaded when their decision arises.

Throughput checkpoint: one writer, serial timing/browser operations; independent bounded reads together. Every case records action, cohort, source, clock, oracle and disposition using existing benchmark shapes (Model the Domain). Prefer removing unnecessary work in existing owners (Subtract Before You Add). Reuse canonical runners and preserve needed instrumentation (Build the Lever). One bounded intervention then exact benchmark/correctness before proceeding (Sequence Verifiable Units).

Source-linked obligations remain in the template and P5 checklist. Record native first/settled state, normal/narrow route, full model/DOM/focus/history, source fingerprints, complete action clocks, sample distributions/noise, attribution, hard-law guards and cleanup. Technical Writing preserves measured facts and limits. Show Me Your Work uses .audit/editor-performance-phase-5.tsv, append-only, local only.

## Frozen measurement contract

Before the first Phase 5 timing: retain the canonical 10,000-line TypeScript product fixture, five measured mounts after one warmup, four five-character native bursts per mount, production React, Chromium 1280x720. Original input 200 ms p95, mount 204 ms maximum of five and highlight-settle 600 ms p95 remain absolute gates. Historical render-residual reference is diagnostic only until its fixture/host comparability is established. New intervention acceptance requires at least 20 percent and 8 ms action (25 ms mount) improvement beyond the larger arm IQR, unchanged correctness, and no more than 5 percent normal-cohort regression beyond noise. Use matched interleaving for acceptance. CPU-profile packets diagnose owners and do not enter uninstrumented timing distributions. A 20-sample p95 is descriptive; five-mount p95 is reported as max; no p99 claim. Full model text, caret, one text child, syntax tokens and 100 percent DOM coverage are mandatory in the original native runner. Table budgets and fixture are frozen from its current owning runner before that run.

## Native initial symptom checkpoint

Source-stable uninstrumented canonical run: `PLATE_CODE_BLOCK_FIXTURE=product PLATE_CODE_BLOCK_LANGUAGE=typescript PLATE_CODE_BLOCK_STRICT=1 PLATE_CODE_BLOCK_ARTIFACT=docs/plans/artifacts/2026-09-09-editor-performance-phase-5/native-baseline-10k.json bun packages/platejs/scripts/code-block-text-flow-browser.mjs` exits 1 on absolute budgets. Twenty five-character bursts: input p50 473.3 ms, p95 591.4 ms, max 635.5 ms; five mounts max 304.3 ms; syntax settle p95 607 ms. Every model/selection/full-DOM/token guard passes. This is a current symptom, not a cross-source regression or causal proof. Raw samples and unchanged-input receipt are retained.

The diagnostic CPU packet uses one measured burst after one warmup, with instrumentation enabled, and stays outside the baseline distribution. It attributes 127.65 ms to syntax refresh, 75.06 ms to native input repair and 398.72 ms to the browser program frame; inclusive values overlap and are not additive. The next discriminating probe is browser timeline tracing, before choosing a parser, allocation or containment intervention. The existing runner gains only an optional trace export; uninstrumented timing boundaries and workload stay unchanged.

## Table current-source smoke contract

Before table measurement: retain existing `run-table-perf.mts --preset smoke` and `/dev/table-perf` fixture. Mount/input 20x20, selection 40x40 with 10x10 selected cells, resize 40x40 alternating first column 100/104 px. Three warmups and 22 measured actions; original ceilings mount 450 ms, input 75 ms, selection 100 ms, resize p95 500/max 750 ms. These are explicitly local dev regression ceilings, not native responsiveness budgets. The current source host is Turbopack; historical budget comment names webpack. Preserve absolute misses but make no cross-builder speed claim. Programmatic insert/selection/resize timings are owner-to-paint probes; actual native gestures are a separate later gate. Require exactly 100 selected cells and zero row drag handles. Bind `table-source-before.json` and unchanged post-run input readback.

## Table readiness interruption

`table-smoke-baseline.json` is quarantined despite unchanged 2269-input source. It renders zero table cells in every measured cohort and zero of the required 100 selected cells. The apparent resize improvement is invalid. Browser tab 6 confirms `/dev/table-perf` is empty at the visible, focused editor, while tab 7 confirms `/blocks/table-demo` renders normally on the same source host. Source comparison against Phase 4 final compiler proof finds zero changed inputs among its 5257 effective inputs, so no new source regression has been established.

The existing table runner has a temporary `--trace-mount` diagnosis path. `table-empty-mount-trace.json` shows React deleting the table child during hydration; `table-empty-owner-trace-serializable.json` identifies `EditableDescendantNodeInner` with key `r0:n2` above the deleted TableElement. The removed HTML is the initial static render (no live path/node-key attributes or control column). This narrows the next probe to SSR-to-client node binding, not a timing optimization. No product fix has been accepted. The first richer owner trace was unserializable; its failed log is retained, and the repaired trace stringifies owner names. Browser raw CDP init-script support was unavailable; the existing repository runner supplied the same diagnostic. Remove temporary owner introspection after retaining its proof and add a durable fail-closed mounted-table oracle before resuming timing.

### P5-TABLE-REACT-COMMIT: nested text mount loses its React parent

- Case: open `/dev/table-perf` on the source host, wait for hydration, require all 100 initial cells, matching model text and a usable native caret. The initial SSR deletion is legitimate replacement. `table-empty-inner-writes.json` proves the later live table is removed by `DOMIntegrityObserver.repairNow`, called from `EditableTextFlow`'s layout reconciliation before its ancestor's React claim runs.
- Class/owner: Plite rendering/projection, `packages/plitejs/src/react/components/editable-text-flow.tsx`. React can remount a text flow when a nested component changes its wrapper without re-rendering the root commit fence or element renderer boundary. Its layout effect must acknowledge that React commit before starting observer-owned imperative reconciliation.
- Red proof: `editable-text-flow-react-commit-contract.test.tsx` changes only a nested component's external-store wrapper. Its new section disappears; `text-flow-react-commit-red.log` fails at the preserved-text assertion. The same test must keep later external attribute repair active.
- Target: reuse the existing layout-phase React claim at the text-flow owner, before its imperative reconciliation. The insertion-phase probe remained red because React may attach a parent after its child's insertion effect; all host mutations precede layout effects. No observer disablement, provider workaround, delayed rendering, new public API, or new runtime abstraction. This is a private lifecycle correction; broader architecture adoption is not selected. Exact fixture replay and native table input follow the focused regression and lifecycle tests.

## Table correctness checkpoint

The layout-phase claim fixes the nested-wrapper reproduction. The focused regression plus mutation-observer lifecycle, DOM integrity and hydration suites pass 32/32. Source-first Plite React and www TypeScript checks pass. The actual Browser fixture renders all 100 initial cells and accepts native first-cell typing. Temporary React owner introspection has been removed from the canonical runner.

The benchmark fixture now binds its mounted editor view, verifies every model cell against its live DOM after remount and every sample, and requires exact inserted text, selected-cell count and model/DOM column width. These guards run outside each existing measured action boundary. The first guarded invocation exposed an owning harness root accessor error; that error was repaired and the TypeScript check passed. The second run was invalidated by concurrent source changes in Find and the DOM editor, followed by a schema-family mismatch during HMR. Its source pair and log are quarantined. The third invocation uses a cold host from current source.

Changeset applicability: the corrected Plite package is absent from origin/main and remains new on next; this private lifecycle correction needs no separate published-package changeset. No public API, source rules or registry component changed in this case.

## Normal and structural native checkpoint

The 1,000-line TypeScript product cohort passes the original absolute limits: twenty five-character bursts p50 99.0 ms/p95 118.3 ms/max 122.6 ms, five mounts max 89.0 ms and syntax-settle p95 180.9 ms. All original native/model/full-DOM guards pass; the source receipt is unchanged. This is a size comparison, not a Phase 5 improvement claim.

The canonical huge-document runner gains optional native Enter/Backspace probes with full model/DOM text, untouched block identity, model/native caret, focus and follow-up typing guards. It retains raw lane samples. The first probe used the wrong serialized-value container and failed before any structural action; the corrected probe reads the current value children. Ten-block Plate and Plite cases pass. At 1,000 full-DOM blocks, all 12 measured split/merge pairs (24 structural actions) pass under unchanged source. Plate first-paragraph split samples are 99.3/99.6/90.3 ms and merge 131.9/121.5/110.0 ms; Plite is comparable. Three samples per point support raw/max reporting, not a robust tail estimate. Ordinary five-character bursts stay at 31.5–56.3 ms. The structural cost therefore remains in the shared substrate/browser path, not a broad Plate plugin effect.

The guarded table run reaches completed mount/input/selection loops but times out during 40x40 resize after 120 seconds. Its only post-run source changes are three unimported test files, so runtime drift does not explain that timeout. No completed timing JSON is emitted by the existing failure path; preserve the log as incomplete evidence. A separate CPU diagnostic extends the timeout without changing the 25 resize actions; it does not relax the original acceptance budget.

Table coordinate-query hypothesis: getCellIndices/getCellIndicesByKey create a table context that recompiles keyed geometry for every read. A 40x40 table has 1600 such consumers after a table property edit. The returned row/column does not need stable node keys. Test deletion of that keyed projection by reusing the existing immutable table geometry compiler; keep keyed contexts for actual identity/selection jobs. No new cache, public noun or editor policy is proposed. The frozen 20 percent/8 ms/noise contract still governs adoption, together with merged-cell, moved-cell, named-root and history/replay correctness.

## P5-TABLE-COORDINATES conclusive cause and target

The 182.5-second CPU diagnostic attributes 119.6 seconds to getCellIndices, including 119.3 seconds in compileTableGrid. Inclusive durations overlap; this is approximately 65.5 percent of the recorded interval, not additive attribution. Served source confirms per-cell full geometry compilation plus state.key lookup for every table cell.

A same-process alternating current/target owner probe uses unchanged 4x4, 10x10 and 40x40 immutable tables after width updates, five packets per arm. At 40x40, the last three current sweeps take 5375.6/5402.0/5404.7 ms and target 4.21/3.72/3.51 ms. Every row/column matches. Current performs 1600 grid compilations per sweep; target reuses the existing geometry compiler cache and performs zero new compilations. At 4x4 and 10x10 the target also improves; no normal-cohort loss appears. This is an owner probe, not accepted native/route latency.

Classification: internal-implementation; decision owner Benchmark. The public coordinate result, immutable state model, existing geometry owner and keyed selection context remain unchanged. Delete unnecessary stable-key projection from coordinate-only reads. Reuse the current unkeyed grid compiler; do not add a cache, index, plugin, subscription or public API. Keyed contexts retain their independent stable-identity/selection job. No public-shape or runtime-architecture adoption is proposed, so Best API/layer-plan architecture migration is inapplicable to this local algorithm correction.

Pause later experiments. Capture an uninstrumented 10x10 original-route control, prove the new deterministic work regression red, implement only the two coordinate reads, and rerun merged/moved/named-root/history query proof. Then run original guarded smoke plus a normal-route ABBA comparison with 3 warmups/22 samples per packet. Retain all original ceilings and frozen materiality/noise rules. The original 40x40 timeout stays censored; do not invent missing baseline percentiles.

### Coordinate preservation diagnostic

The new named-root public-query assertion fails identically in the untouched original control and the proposed implementation: getCellIndices returns fallback 0/0 and the key form returns undefined. The frozen-byte diagnostic shows the direct root-scoped state has the correct path/table, while the Plate plugin read closure remains bound elsewhere. This is an inherited Plate read/view-binding defect, not an introduced coordinate-algorithm regression. Existing named-root keyed-context tests remain green. The newly added positive assertion is retained in the diagnostic artifacts and excluded from this performance candidate's suite; no original test was weakened. No named-root public-query correctness claim is made. Owner: Plate plugin read/view binding; reopening requires its own Best API/Plate Plan scope rather than compensating inside table geometry.

The optimization has not been kept or declared complete. This pre-acceptance preservation check therefore does not constitute a failed claimed fix; the Regression frozen-byte/control diagnostic distinguished inherited breakage before any additional product attempt. Product bytes stayed unchanged throughout that diagnosis. Resume the original route comparison and retain this limitation at handoff.

### Exact first coordinate target replay

The source-stable original smoke completes all correctness checks after the coordinate change. Input p95 is 24.5 ms. Absolute dev ceilings still fail: 20x20 mount p95 788.9 ms, 40x40 selection p95 1041.9 ms, and resize p95 3458.9 ms/max 4765.9 ms. The original resize timeout is resolved, but the table is still slow. Preserve these failures; do not call the owner microbenchmark a whole-table success. Normal ABBA packets and remaining-cost attribution decide retention and the next owner.

### Scope and normal-control reconciliation

The initial template overselected cross-version and upstream comparisons. The accepted task is one bounded current native/table measurement-and-fix phase, following the parent one-phase-at-a-time rule and the preceding Phase 4 explicit-only execution. The inventory now records that scope as Benchmark only. Keep all nine lane rows and all twelve original candidate dispositions; no main/Slate speed claim or new external comparison is added.

Normal resize ABBA uses four fresh browsers, the same 10x10 fixture and 3+22 actions per packet, with source receipts. Original packet medians drift from 151.1 to 295.7 ms; target medians are 210.9/215.6 ms. Pooled original/target medians are 234.8/210.5 ms, p95 503.4/427.4 ms, IQR 156.8/103.9 ms (44 measured actions per arm). The apparent gain is inside noise; no normal whole-route speedup is established and no beyond-noise normal regression appears. The temporary original control was restored atomically to the candidate bytes, with a direct SHA256 readback. Continue same-case remaining-cost attribution before a keep decision.

## Remaining table render probe

The current 10x10 original resize runner, with optional canonical render counters, records 5000 text renders for 25 actions (all 100 cells, twice per action). The explicit node-selector preservation test fails because a parent element context change rerenders a memoized selector whose explicit node key and selected node are unchanged. Context-inherited selection still follows the new parent. This is a candidate cause, not yet a kept route improvement.

Test the smallest deletion: use React's existing conditional context read only when no explicit node key was supplied. Preserve null/undefined fallback, keyed updates, inherited updates and hook-order transitions. No added runtime owner, cache or public API. The exact 10x10 resize run and 40x40 smoke must show unchanged model/DOM/width guards and materiality beyond noise before adoption. Initial control source 0f8cbf63 is unchanged across the run; median73.5ms/p95165.7ms. Canonical text-event counts are the measured family denominator, not all React component executions.

## Native preservation: resize after editing

The native final-route preservation probe discovered a new inherited behavior failure before native completion: on `/blocks/table-demo`, type p5 into Heading, undo, then drag the first column boundary by 30 px. The original 100/100 widths remain. A freshly mounted table resizes correctly. Frozen candidate and original use-node-selector control fail the same native sequence; the original control was restored to the candidate with a SHA256 receipt. The performance improvement did not cause this defect. No prior native resize-after-edit repair or completion is invalidated. Regression's frozen-byte/control diagnostic classifies this as an inherited pre-acceptance preservation finding; ordinary Patch owns the one new repair. No reusable methodology change is selected because the required native guard caught it before acceptance.

Case P5-TABLE-RESIZE-CURRENT: current source useTableResize captures the rendered immutable table and later compares it with the current table by object identity. Child edits replace that snapshot without requiring a parent render. Read the current table by the existing stable key at pointerdown; build the resize and its in-flight cancellation guard from that same snapshot. Keep replacement/removal, external resize, read-only, blur, pointer identity and unmount cancellation. Classification: private Plate pointer lifecycle correctness; no new identity, cache, subscription, public API or substrate compensation. Existing useTableResize contracts supply positive authority.

Baseline: all 7 existing pointer-lifecycle tests pass. Two added owner cases, edit-only and edit-then-undo against retained props, fail exactly at missing preview (zero instead of one); all 7 preservation cases remain passing. Red-test escalation: unit-red in the existing useTableResize.spec.tsx. No new E2E test; existing native table suites and actual Browser replay supply final route proof. Proof includes model widths, preview-before-commit, single gesture undo, current cell text, no stale preview after release, existing runtime errors and follow-up typing. Five fresh owner repetitions plus normal/narrow native route replay are required.

Started gate closure: strict v1 exposed 18 existing test calls to invariant internal Editor adapters; migrated only those calls to current public editor.key, read.nodes.path and update.break.insert. Its exact tests typecheck passes. Strict v2 passed type/package/contracts, then correctly stopped its browser proof when the new resize regression test was added; retain this invalidated run and rerun strict on final bytes.

## Final native preservation comparison

The final 10k native packet is slower than the initial packet while the 1k cohort remains green. The unpaired difference cannot identify a regression. After integration finishes, run one bounded ABBA preservation comparison of the two changed shared Plite React owners at 1k and 10k, using the original five mounts/twenty bursts and strict ceilings. The control files must match their initial Phase 5 hashes; all other runtime inputs stay fixed. No additional optimization or retry-until-green is selected. Retain every packet, all semantic guards and an atomic candidate restoration receipt. Normal preservation uses the frozen five-percent threshold beyond the larger IQR; materially worse matched stress results require diagnosis. Reuse final integration proof only after the restored candidate and all its effective inputs match exactly.

The matched native preservation comparison is complete. Eight packets pass all semantic guards with unchanged inputs; all four 1k absolute gates pass. Pooled normal input medians are 81.20/83.55 ms, a 2.35 ms difference within the larger 17.7 ms IQR. The 10k difference of 137.4 ms is within the larger 262.0 ms IQR; every 10k arm remains absolutely red. No beyond-noise regression or native speedup is established. The atomic restoration receipt matches both final source files; all 4357 strict inputs still match the passed strict run.

Packed verification passes NodeNext, Bundler, Node import, SSR and dead-code elimination consumers, then rejects exact byte snapshots. Review covers 29/29 entries: 28 change by 2–90 bytes, at most 0.0063 percent, no export changes. The owned size-generation command and ordinary packed rerun remain required. During that first packed run, two unrelated www AI route files temporarily changed and returned to the exact strict-source hashes; they are not package artifact inputs. Preserve the receipt, do not edit those files, and bind the fresh remaining gates to a union of 4357 integration and 2270 metric inputs.

Final proof freshness note: the native control restoration initially matched all 4357 strict inputs. A later unrelated edit changed `apps/www/src/registry/components/editor/comment.spec.tsx`. That copied-UI test is not part of the package/Chromium or packed runtime import graph; it does affect the broad www typecheck input set. Preserve both snapshots, classify the narrow effective-input impact after current commands finish, and refresh the www typecheck if this edit remains. Do not modify the concurrent file or invalidate unrelated package proof merely because the broad manifest includes it.

The second matrix run also invalidates on a concurrent `comment.spec.tsx` write, after Chromium reaches batch 21/120. No matrix test failure is reported. All 17 targeted www native cases passed in 45.1 seconds with identical 4372-input before/after hashes. Subsequent concurrent Find source/test edits mean final app proof must be refreshed on settled current inputs. A cache-only wait script reads the canonical browserRunEntries and requires 180 seconds without an input change before the next full matrix invocation; the canonical integrity monitor remains enabled. The additional www typecheck exits 0, but final source-bound types remain required after these concurrent edits settle. No concurrent product file is edited by this phase.

Final attribution readback: the native CPU profile records a637.68ms root interval,57.9ms in highlight/measureHighlight and127.65ms in the complete refreshInputs call. The results table uses those exact values; a prior shorthand of13percent for syntax refresh conflated a different profiling frame. This correction does not change the U21 disposition: dominant worker-eligible computation and net transfer/startup benefit were not demonstrated. Timeline Layout/PrePaint/Paint durations are reported separately without an additive cross-scope percentage claim.

## Final integration and current-config closeout

The third canonical matrix completes after the 180-second source-stability gate: 2383 passes, 623 declared skips, 3006 selected rows and exact coverage, with 4372 unchanged inputs. Chromium, Firefox, WebKit, mobile viewport and the two mobile WebKit proxy cases each retain their canonical summary. Current www types and all 17 native table/code cases pass on 4374 unchanged inputs per command. The two additional files are concurrent AI HTTP routes outside the canonical matrix and selected client import graph. Earlier invalidated attempts remain intact.

A later Next configuration edit restarted the source host. One replay of the original smoke on that configuration confirms mount at 322.9 ms, input at 17.0 ms and resize at 139.8 ms p95 passing their original ceilings; selection at 413.8 ms remains red. All model/DOM/width/selection guards pass. The current structural replay passes all 24 actions at 48.3–86.2 ms; no speedup is inferred from separated packets. Its command exits 0 while the outer manifest records two unrelated AI HTTP routes disappearing; import reachability shows neither in any selected fixture. Preserve that wrapper exit 1 and classify the effective inputs instead of repeating unchanged timing until green.

`final-source-reconciliation.json` reconciles eight proof receipts, all recorded app-only differences, the reviewed generated-size change, and additional manifest coverage. Package/dependency/runner inputs remain unchanged; standalone native code does not consume copied app UI or Next configuration. The final table and structural replays resolve the configuration-specific freshness gap. All twelve candidate decisions, seven applicable benchmark lanes and two explicit-only exclusions are closed. The parent five-phase plan is updated. Remaining absolute native 10k and table-selection latency failures, and the inherited named-root query/view-binding issue, remain explicit; no additional phase or publication is authorized.

Final handoff receipts: `benchmark-complete-validation.log` and `goal-complete-validation.log` pass; `final-report-preservation-check.json` verifies all twelve decisions, eleven artifact links and zero open required checkboxes. `results-prose-audit-final.json` reports no findings. `final-host-cleanup.json` confirms the owned source host on port3297 stopped after proof; no other server was touched.
