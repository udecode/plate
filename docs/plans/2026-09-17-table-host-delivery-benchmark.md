---
review_scopes: [table]
review_basis: [2026-09-17-table-host-delivery-model-revalidation]
work_kind: implementation
---

# Table host delivery benchmark

Status: Complete — bounded adoption and benchmark closure recorded in the final outcome below.

Objective:
Select and adopt the smallest correct table-selection host owner by comparing
the repaired painter, a table-specific binding and an explicit scalar host
channel under matched long-lived action, mount, heap and native-browser proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-17-table-host-delivery-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

Applied packs:
- none

## Benchmark Source

- request: execute the benchmark recommended by the fresh table host-delivery review
- scope: table selection host projection and mounted DOM delivery
- invocation: `$benchmark table host delivery`
- candidate-identity: fingerprint: `candidate-final-source-sha256.txt` at checkout base `68898220fec48a27b0662862895628094898f066`
- plate-main-identity: ref: `8f65d77f8b4709833436e63661e4d061f709258f`; provenance only
- plite-identity: ref: `68898220fec48a27b0662862895628094898f066`; mounted DOM runtime unchanged across lanes
- slate-identity: N/A: raw Slate has no comparable Plate table-selection projection
- named-symptom: the painter scans tables and misses same-key host replacement; the earlier generic scalar prototype had an uncontrolled stress tail
- final-artifacts: artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json`

First checkpoint:
- Requirements, identities, frozen budgets, comparison lanes, correctness
  guards and default-lane applicability were recorded before candidate
  measurement.

Timed checkpoint:
- requested duration: N/A: no wall-clock duration requested
- semantics: N/A: completion is evidence-based
- start / deadline: 2026-09-17 / no deadline
- final loop closure: every applicable lane completed after exact candidate reruns and native correctness proof

Completion threshold:
- Owner action p95 is no greater than baseline p95 plus `max(2ms, 20%)`,
  capped at 20ms normal and 100ms large/stress/fanout; cold caps are 100ms
  normal and 250ms otherwise. No forced GC runs in the lifecycle.
- Browser selection-to-next-paint p95 is no greater than baseline plus
  `max(4ms, 20%)`; mount packet-p95 is no greater than baseline plus
  `max(10ms, 20%)`.
- Exact sparse/range/mixed membership, directional anchor, same-key `td` to
  `th`, cleanup, view isolation, held drag, contraction/reversal, caret
  restoration and one visible paint layer pass.
- The least general passing owner wins. A generic channel must beat or uniquely
  satisfy the private binder to earn public API.
- Final package, registry, browser, doctrine, ledger and plan checks pass.

Verification surface:
- owner probe: real Plate source under Bun/Happy DOM, 30 long-lived interleaved packets per cohort
- production browser: fresh Chrome processes on `/dev/table-perf`, fixed 1280x720 DPR 1
- correctness: focused package/copied-UI tests and the existing Chromium table matrix
- source identity: exact candidate, repaired-painter, runner, route and lockfile SHA-256 receipts

Constraints:
- Correctness and native editor behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, degraded
  DOM or a narrower action.
- Keep table semantics in Plate and preserve `render.useViewElementAttributes`
  React prop semantics.
- Do not create another public host channel, selection kind, benchmark registry
  or permanent run ledger without an independent job.
- Do not commit, push, open a PR, publish or release without separate authority.

Boundaries:
- In scope: Plate table selection projection, React host delivery, copied table
  UI, the production table benchmark route and native table interactions.
- Out of scope: resize redesign, table mutation/clipboard redesign, physical
  device claims, publication and unrelated editor performance.

Blocked condition:
No blocker remains. Chromium, production builds, owner probes and source-first
checks ran; broad table partition typecheck retains an unrelated authored
TS6307 project-file-list blocker recorded as a proof limit.

## Interaction Coverage

- first-interaction: pass: owner probe records cold first actions and Chromium exercises first native drag
- settled-interaction: pass: 30 long-lived no-GC packets cover grow, reverse, contract and collapse
- route-scope: pass: production table benchmark plus table demo and authored playground browser cases
- reporter-profile: N/A: no external reporter profile, extension state or supplied live tab exists

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | final `TablePlugin` binder and single-layer copied UI hashes | repaired painter hashes in the same checkout | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json` |
| lockfile / package manager | pnpm lock `c6b33e...` | same | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/candidate-final-source-sha256.txt` |
| build mode / host / port | source-first owner probe and fresh production `next start` on 3100 | same build mode and host | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/source-and-host-readiness.json` |
| browser / machine / viewport / DPR | Chrome 137, Apple M5 Max, 1280x720, DPR 1 | same | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/browser-comparison.json` |
| route / fixture / document / plugins | `/dev/table-perf`, same generated table and TableKit | same | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/contract.json` |
| setup / action / DOM strategy | private per-view projection and canonical cell refs | repaired table painter | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json` |
| warmups / samples / interleave order | one warm cycle; 30 owner packets; five browser packets, ten stress mount packets | same matched counts | artifact: `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | three lanes, long-lived no-GC lifecycle, callback preservation and final owner decision recorded |
| Timed checkpoint parsed | N/A | no duration requested |
| Benchmark source and methodology read | yes | benchmark skill and methodology applied before measurement |
| Task plan and Autogoal resolved | yes | this plan is the sole active benchmark coordinator |
| Candidate and baseline identities recorded | yes | final comparison embeds candidate and both repaired-painter source receipts |
| Target and runner discovery completed | yes | artifact owner probe and production www table route selected |
| Host/build/fixture freshness proved | yes | every browser source change triggered a fresh production build and candidate rerun |
| Correctness oracle identified | yes | focused host/UI specs and 14-case Chromium table matrix |
| All default lanes inventoried | yes | Benchmark Lane Table closes every lane |
| `only` narrowing resolved | N/A | ordinary scoped benchmark; no `only` invocation |
| Browser/native proof selected | yes | production Chromium route and native table specs |
| Output budget strategy recorded | yes | raw receipts saved; summaries and bounded slices inspected |
| Commit/PR/release authority recorded | yes | no publication authority |

Work Checklist:
- [x] Capture explicit scope, thresholds, constraints, boundaries and blocked condition.
- [x] Prove comparable candidate/baseline source, fixture, browser and sampling.
- [x] Measure visible selection and mount operations with honest aggregation.
- [x] Preserve red and superseded packets without calling packet noise causal.
- [x] Isolate the painter's per-table projection/query owner and implement one private view projection.
- [x] Rerun the exact owner benchmark and correctness guard.
- [x] Resume production mount, native editing, route breadth and stress lanes.
- [x] Delete the public painter and copied row/table overlay owner.
- [x] Preserve the public React attribute callback and reject the generic channel.
- [x] Repair docs, doctrine v206, generated mirrors, review ledger and final plan evidence.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | exact refs, lockfile, runner and fixture fingerprints recorded; repaired painter guard passed | complete |
| 2 | current-vs-main-product-smoke | no | N/A: inapplicable - this is a same-revision owner comparison, not a current-vs-main regression | origin/main retained only for provenance | complete |
| 3 | plate-vs-plite-decomposition | no | N/A: inapplicable - Plite and Slate expose no competing table projection | source trace keeps table semantics in Plate and mounted host identity in the view runtime | complete |
| 4 | owner-microbench-and-trace | yes | complete | 30 packets and 360 actions per lane/cohort; binder passes all budgets with zero renders/scans | complete |
| 5 | product-mount-matrix | yes | complete | normal/large five-packet and stress ten-packet mount distributions pass | complete |
| 6 | trusted-editing-matrix | yes | complete | final Chromium table selection/subscription/resize matrix passes 14/14 | complete |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - raw Plite/Slate have no comparable Plate table host projection | substrate comparison cannot select among Plate delivery owners | complete |
| 8 | example-breadth | yes | complete | table demo and authored playground cases pass in the final Chromium matrix | complete |
| 9 | large-and-stress | yes | complete | owner large/stress/fanout and production 500/2000-cell cohorts pass without forced GC | complete |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: closed in Cause History
- lane: N/A: no active cause
- comparable-baseline: N/A: no active cause
- material-delta: N/A: no active cause
- isolated-owner: N/A: no active cause
- causal-intervention: N/A: no active cause
- correctness-guard-result: N/A: closed in Cause History
- fix-class: N/A: closed in Cause History
- long-term-target: N/A: closed in Cause History
- decision-owner: N/A: closed in Cause History
- layer-plan: N/A: closed in Cause History
- compatibility-verdict: N/A: closed in Cause History
- fix-owner: N/A: closed in Cause History
- benchmark-command: N/A: closed in Cause History
- benchmark-rerun: N/A: closed in Cause History
- benchmark-rerun-result: N/A: closed in Cause History
- correctness-command: N/A: closed in Cause History
- correctness-rerun: N/A: closed in Cause History
- correctness-rerun-result: N/A: closed in Cause History
- resume-lane: N/A: all lanes complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| table-painter-fanout | owner-microbench-and-trace | kept | internal-implementation | one private TablePlugin view projection and canonical cell-host binding | Benchmark | N/A: target remains inside the Plate table implementation | N/A: public React attribute semantics are preserved and painter callers are hard-cut | Task | per-table projection/query work amplified fanout and replacement depended on observation; binder removed scans/renders and won fanout | pass: repaired painter specs established selection behavior and cleanup baseline | `TABLE_HOST_BENCHMARK_PACKETS=30 bun test docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/probe.test.tsx` | pass: binder passed all four frozen cohorts; fanout 2.18ms vs painter 8.89ms | `bun test packages/platejs/src/react/features/table/TablePlugin.hostBinding.spec.tsx && Chromium table matrix` | pass: focused lifecycle proof and final Chromium 14/14 | `final-comparison.json` and `browser-comparison.json` |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| readiness-1 | source-and-host-readiness | exact comparison owners and runners exist | source/host receipt | repaired painter spec passes | keep | owner probe |
| owner-30 | owner-microbench-and-trace | one view projection removes painter fanout without generic API | binder p95 0.94/11.48/61.04/2.18ms | zero cell renders and table scans | keep | production matrix |
| browser-selection-5 | product-mount-matrix | binder preserves visible paint latency | final p95 17.9/210.6/1819.6ms vs 18.4/218.8/2537.5ms | exact DOM membership | keep | mount expansion |
| browser-mount-10 | product-mount-matrix | final single-layer UI stays inside mount budget | stress 1817.0ms vs 1871.3ms; 10/10 pairs pass | DOM counts and canonical hosts pass | keep | native matrix |
| chromium-14 | trusted-editing-matrix | native behavior survives painter/overlay deletion | 14/14 pass | held drag, contraction, clipboard, resize, undo/redo | keep | closure |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| owner normal | 360/lane | 0.66/0.78/1.22/2.15/3.84ms | 0.65/0.74/0.94/1.26/3.51ms | -0.28ms / -23% p95 | 30 interleaved packets | `owner-probe-results.json` |
| owner large | 360/lane | 7.54/8.31/9.78/14.71/19.33ms | 6.31/9.75/11.48/15.13/19.88ms | +1.69ms / +17% p95, within 11.78ms limit | 30 interleaved packets | `owner-probe-results.json` |
| owner stress | 360/lane | 47.53/53.18/91.02/139.92/199.97ms | 35.94/50.89/61.04/84.77/111.75ms | -29.98ms / -33% p95 | 30 interleaved packets | `owner-probe-results.json` |
| owner fanout | 360/lane | 5.30/7.47/8.89/12.50/61.13ms | 1.68/1.90/2.18/2.37/2.64ms | -6.71ms / -76% p95 | binder fastest; deterministic zero scans/renders | `owner-probe-results.json` |
| browser selection normal/large/stress | 110/cohort | p95 18.4/218.8/2537.5ms | p95 17.9/210.6/1819.6ms | -0.5/-8.2/-717.9ms | combined raw paint samples | `browser-comparison.json` |
| browser mount normal/large/stress | 5/5/10 packet p95s | p95 25.3/392.6/1871.3ms | p95 28.4/459.2/1817.0ms | +3.1/+66.6/-54.3ms | packet-p95 distribution; raw mount samples unavailable | `browser-comparison.json` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | pass all frozen owner/browser budgets and correctness contracts | `final-comparison.json` records all passes |
| Benchmark plan structural validation | yes | run the benchmark validator | final command recorded at closure |
| Every applicable lane closed | yes | complete or justify N/A | lane table has no open row |
| Exact post-fix benchmark reruns | yes | rerun owner probe and all invalidated candidate browser packets | exact final-source hashes and packets recorded |
| Correctness/native behavior reruns | yes | rerun focused tests and Chromium matrix | focused tests pass; Chromium 14/14 |
| Final source/host identity | yes | compare final hashes with measured candidate | `candidate-final-source-sha256.txt` matches product files |
| Benchmark target/metric honesty | yes | preserve raw receipts, aggregation limits and harness repairs | final artifact labels mount packet-p95 limitation |
| Durable fix decision | yes | choose least-general passing owner and hard-cut duplicates | private binder selected; scalar channel rejected |
| Package/type/build proof | yes | run table partitions, lint and production build; record blocker | affected checks/build pass; unrelated TS6307 blocker retained |
| Browser surface proof | yes | run production Chromium table matrix | 14/14 pass |
| Changeset/release artifact | N/A | no publication or release requested | no changeset or release claim |
| Agent rule/skill sync | yes | repair doctrine, run install and validate mirrors | Plate Next v206 and generated-skill validation |
| Benchmark plan complete validation | yes | run validator with `--complete` | final command recorded at closure |
| Final lint | yes | run scoped table lint | table and table-react partitions pass |
| Timed checkpoint | N/A | no requested duration | evidence-based closure used |
| P1 autoreview | N/A | Autoreview is prohibited on `next` without explicit review or PR | no Autoreview invocation |
| Goal plan complete | yes | run Autogoal checker | final command recorded at closure |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | requirements, budgets and identities frozen | complete |
| Ordered diagnosis | complete | painter fanout/replacement owner isolated | complete |
| Fix and exact rerun | complete | private binder and single-layer copied UI pass exact reruns | complete |
| Remaining breadth | complete | production mount, routes, native and stress lanes pass | complete |
| Review and closeout | complete | docs, doctrine, ledger, artifacts and validators reconciled | complete |

Findings:
- The painter's per-table projection/query model amplifies fanout and needs
  replacement observation for host identity changes.
- One private view projection plus canonical cell refs removes scans and cell
  rerenders while preserving all table semantics in Plate.
- The explicit scalar channel is fast but earns no independent public job.
- The copied row/table context was a second paint owner and was removed during
  final source audit before all candidate browser packets were rerun.

Decisions and tradeoffs:
- Keep `render.useViewElementAttributes` complete and React-delivered.
- Adopt the private `TablePlugin` binder and delete `useTableSelectionDOM`.
- Require custom table cells to forward `props.attributes.ref` exactly once.
- Reject generic Plite markers and a generic scalar host channel.
- Accept one canonical host per node key per mounted view as the component
  contract; duplicate simultaneous hosts remain unsupported.

Harness/methodology repairs:
- Replaced empty production Profiler mount data with wall-clock remount to
  second-paint timing before comparison.
- Parameterized the owner probe sample assertion from 180 to `packetCount * 12`.
- Expanded stress mount from five to ten packets under the frozen noise rule.
- Invalidated and reran candidate browser packets after deleting the copied
  overlay owner.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---:|---|---|
| Production Profiler emitted zero mount samples | 1 | measure the visible remount operation directly | wall-clock remount-to-second-paint harness used for both lanes |
| Expanded owner probe retained a 180-sample assertion | 1 | parameterize by packet count | exact 30-packet rerun passes with 360 samples/lane/cohort |
| Initial five-packet stress mount landed near the budget | 1 | expand both lanes to ten matched packets | final source passes aggregate and all 10 pairs |
| Copied row/table overlay owner survived first implementation pass | 1 | hard-cut context/overlay and invalidate candidate packets | final UI has one cell layer; all candidate packets and native tests rerun |

Verification evidence:
- `docs/plans/artifacts/2026-09-17-table-host-delivery-benchmark/final-comparison.json`
- owner probe: 2 tests pass, 360 action samples per lane/cohort
- focused host/base table: 32 tests, 85 expectations pass
- copied UI node selection: 2 tests, 7 expectations pass with existing act warnings
- table-react partition: 37 tests, 132 expectations pass
- final Chromium table matrix: 14/14 pass in 23.4s
- final production build: pass
- broad table partition typecheck: unrelated authored TS6307 blocker; no changed-file diagnostic

Final handoff contract:
- goal plan / scope: complete private table selection host delivery and hard cut duplicate paint owners
- candidate / baseline identities: exact final and repaired-painter hashes in final artifact
- completed / N/A / pending lanes: six complete, three concretely inapplicable, zero pending
- first conclusive cause: painter per-table projection/query and replacement lifetime
- baseline / latest / best metrics: owner and browser tables above
- fix owner / changed files: Task; `TablePlugin`, private binder, copied table UI, tests, docs and doctrine
- exact benchmark and correctness reruns: complete on final source
- resumed breadth: production mount, native routes and stress complete
- packet decisions: all final packets kept; superseded source packets retained as historical artifacts
- harness/methodology repairs: four repairs recorded above
- residual claim limits / next owner: one canonical host per key, mount packet-p95 aggregation, TS6307 blocker and no physical-device claim

Timeline:
- 2026-09-17: froze identities, requirements, budgets and three-lane contract.
- 2026-09-17: ran 30-packet owner comparison and selected the private binder.
- 2026-09-17: adopted package/copy/docs changes and passed focused checks.
- 2026-09-17: repaired browser mount measurement and ran production packets.
- 2026-09-17: deleted the missed copied overlay owner and reran all candidate packets.
- 2026-09-17: passed final Chromium native matrix and reconciled doctrine/ledger.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Closeout complete |
| Where am I going? | No remaining table host-delivery work |
| What is the goal? | Select and prove the smallest correct table-selection host owner |
| What have I learned? | One private view projection wins; generic host API and duplicate overlay ownership are unnecessary |
| What have I done? | Implemented, benchmarked, hard-cut, documented and verified the final owner |

Open risks:
- One view supports one canonical host per node key; custom cells must forward
  the supplied attributes/ref exactly once.
- Mount evidence compares packet-p95 distributions because raw remount samples
  were not serialized.
- Broad package typecheck retains an unrelated authored TS6307 blocker.
- Chromium evidence makes no physical-device, publication or release claim.
