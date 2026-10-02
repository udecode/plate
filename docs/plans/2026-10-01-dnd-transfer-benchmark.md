# DnD transfer hover benchmark

Status: done for phase 1 and phase 3.
Topic: dnd

Objective:
Prove React DnD hover through the transfer dry pass costs at most current `next` p95 plus max(1 ms, 5%) with a 1,000-block payload.

Flow mode:
one-shot execution

Plan:
docs/plans/2026-10-01-dnd-transfer-benchmark.md

Template:
.agents/rules/benchmark/templates/benchmark.md

## Benchmark Source

- request: phase 1 step 4 of `docs/plans/2026-10-01-dnd-transfer-consolidation.md`, a hover lane measuring React DnD dragover cost with a 1,000-block payload against current `next`; phase 3 extends this plan with the native gesture lanes
- scope: `useDndNode` drop target `canDrop` and `hover`, which run the memoized `editor.api.transfer` dry pass
- invocation: `$benchmark only owner-microbench-and-trace` (the parent plan step names this single lane)
- candidate-identity: fingerprint: working tree on `cf15725603` with sha256 prefixes `transfer.ts` 76b38912082e, `selection.ts` 2d97fbe9ac40, `useDndNode.ts` 4f9a24089051, `DndStorePlugin.ts` 174ad20b869e, benchmark 3ef696f0e5aa
- plate-main-identity: commit: current `next` at `cf15725603` in a detached worktree, running the same benchmark file
- plite-identity: commit: the same two trees; Plite and Plate are measured together through `useDndNode`
- slate-identity: N/A: only - no substrate comparison is requested
- named-symptom: none; this is a budget gate, not a regression report
- final-artifacts: artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-{baseline,candidate}-{1,2,3}.log`
- phase-3-identities: candidate is the working tree on `cf15725603` served from source on port 3297; baseline is the `cf15725603` detached worktree with React DnD on port 3298; both serve the same client-only `apps/www/src/app/dev/dnd-perf/page.tsx` and run `apps/www/scripts/run-dnd-perf.mts` in Chromium, 120 samples per cohort
- phase-3-artifacts: artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/native-bench5-{baseline,candidate}-{1000,5000}-{1,2,3}.json`

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
- requested duration: N/A: no duration requested
- semantics: N/A: no duration requested
- start / deadline: N/A: no duration requested
- final loop closure: N/A: no duration requested

Completion threshold:
- Candidate dragover p95 is at most baseline p95 plus max(1 ms, 5% of baseline p95), for a still pointer and for a pointer that changes edge on every dragover.
- Every applicable lane is complete or N/A with evidence.
- Every kept fix passes its exact benchmark rerun and correctness guard.
- Benchmark plan validation passes with `--complete`, P1 autoreview passes when
  code changed, and `node .agents/pstack/plan-open.mjs` passes.

Verification surface:
- benchmark commands / artifacts: `bun test ./src/dnd/react/useDndNode.hover.benchmark.slow.ts` in `packages/platejs` of each tree; logs under `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/`
- correctness commands: `bun test src/dnd/react/useDndNode.spec.ts` in `packages/platejs`
- Browser / Chrome / device proof: N/A: the lane is a package owner microbench; browser drag proof lives in the parent plan
- source/ref/fingerprint proof: Benchmark Source above

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
- allowed runtime/packages/apps: `packages/plitejs/src/core/transfer.ts`, `packages/platejs/src/dnd/`
- allowed benchmark/tests/fixtures: `packages/platejs/src/dnd/react/useDndNode.hover.benchmark.slow.ts`
- allowed baseline checkouts/hosts: a detached worktree at the baseline commit
- non-goals: product routes, mount cost, the native gesture (phase 3)

Output budget strategy:
- Discover target/runner filenames and counts first. Exclude `node_modules`,
  `.next`, `.turbo`, generated static output, broad historical plans, and old
  artifacts unless named. Save large benchmark/trace output to artifacts and
  inspect summaries plus focused slices.

Blocked condition:
- No baseline worktree can run the same benchmark file, or the candidate misses the budget with no isolated owner.

## Interaction Coverage

- first-interaction: pass: the first sample after 20 warmups is included in every 300-sample distribution
- settled-interaction: pass: the still-pointer cohort repeats one edge 300 times
- route-scope: N/A: package microbench of the drop target spec; no route is under test
- reporter-profile: N/A: no reporter; budget gate only

Use `pass: <proof>` or `N/A: <concrete reason>` for each phase and host.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | working tree on `cf15725603`, fingerprints above | `cf15725603` detached worktree | artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-baseline-1.log` and `hover-bench3-candidate-1.log` |
| lockfile / package manager | `pnpm-lock.yaml` sha256 77c924c65049, pnpm 9.15.0 | same lockfile, `pnpm install --offline --frozen-lockfile` | artifact: `pnpm-lock.yaml` sha256 77c924c65049 in both trees |
| build mode / host / port | source under bun 1.3.12, no build | same | artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log` header `bun test v1.3.12` |
| browser / machine / viewport / DPR | happy-dom under bun on Apple M5 Max | same | artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-*.log`, run after the browser matrix finished |
| route / fixture / document / plugins | 1,100 paragraphs, `DndPlugin`, 1,000-block node-selected payload, target block 1050 | same | artifact: `packages/platejs/src/dnd/react/useDndNode.hover.benchmark.slow.ts` |
| setup / action / DOM strategy | one dragover = backend `canDrop` plus target `hover` (which reads `canDrop`) | same | artifact: `packages/platejs/src/dnd/react/useDndNode.hover.benchmark.slow.ts` |
| warmups / samples / interleave order | 20 warmups, 300 samples, still and moving cohorts | same | artifact: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-{baseline,candidate}-{1,2,3}.log` |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured before work | yes | Objective and Completion threshold copy the parent plan step |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `benchmark` source and methodology read | yes | skill and `methodology.md` read in full this session |
| Existing plan reused | yes | none existed; the parent plan step asked for this one |
| Candidate and baseline identities recorded | yes | Benchmark Source |
| Target/runner discovery completed from current source | yes | `git grep` found no DnD target in `benchmarks/targets`; the runner follows `paste.benchmark.slow.ts` |
| Host/build/fixture freshness proved | yes | both trees run source directly; no build artifact is involved |
| Correctness oracle identified | yes | `useDndNode.spec.ts`, `transfer-contract.test.ts`, Plite partitions |
| All default lanes inventoried | yes | Lane table |
| `only` narrowing explicitly authorized or N/A | yes | the parent plan step names one lane |
| Browser/native proof strategy selected | yes | N/A for this lane; browser drag proof is in the parent plan |
| Output budget strategy recorded | yes | see above |
| Commit/PR/release authority recorded | yes | no mutation authorized by default |

Work Checklist:
- [x] Every explicit scope, comparison, timing, stop condition, deliverable, verification surface, and success criterion is recorded. Closed: Benchmark Source and Completion threshold. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
- [x] Short objective, threshold, verification, constraints, boundaries, and blocked condition are concrete. Closed: header sections. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
- [x] Default lanes remain in diagnostic order; every N/A row has a reason. Closed: Lane table. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
- [x] Candidate/baseline signatures prove comparable source, fixture, action, build, browser, machine, and sampling. Closed: Comparison Signature. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
- [x] Primary metrics match the visible user operation; proxies stay labeled. Closed: the metric is the drop target's per-dragover callback cost, labeled a package proxy for the browser hover. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] Samples expose p50/p75/p95/p99 only when sample count supports them, plus max, absolute/relative delta, and noise evidence. Closed: Metric table; p99 omitted at 300 samples per packet. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] Red lanes are not called causal without the conclusive-cause gate. Closed: Cause History row `hover-dry-pass-resolve`. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] A proven cause pauses later lanes before another expensive benchmark. Closed: no later lane applies under `only`. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
- [x] Every proven cause records its fix class, best long-term target, decision owner, layer plan, compatibility verdict, and implementation owner. Closed: Cause History. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.
- [x] `public-api` and `runtime-architecture` causes run `best-api`, then `architecture` before implementation. skip: the cause is `internal-implementation`.
- [x] One isolated owner is fixed, then the exact benchmark and correctness guard rerun before breadth resumes. Closed: `hover-bench3-*` logs and the partition reruns in Verification evidence. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] Failed reruns invalidate or continue the same cause; they do not skip to a different green metric. Closed: the `hover-bench2` packets stayed red and kept the same cause open until `hover-bench3`.
- [x] Green reruns resume the first pending applicable lane. Closed: no pending applicable lane remains. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] Every packet has keep/revert/invalidate/quarantine/defer and next-owner evidence. Closed: Packet ledger. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] Harness/metric/host defects are repaired before product optimization. Closed: the bun path filter and the 5 s test timeout were fixed before reading candidate numbers. Proof: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench3-candidate-1.log`.
- [x] Final handoff reports candidate/baseline identities, lane status, first conclusive cause, metrics, fix/reruns, resumed breadth, and residual risk. Closed: Final handoff contract. Proof: `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs --complete docs/plans/2026-10-01-dnd-transfer-benchmark.md`.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | Benchmark Source and Comparison Signature | none |
| 2 | current-vs-main-product-smoke | no | N/A: only - the parent plan step measures one owner lane | none | phase 3 adds browser lanes |
| 3 | plate-vs-plite-decomposition | no | N/A: only - the parent plan step measures one owner lane | none | none |
| 4 | owner-microbench-and-trace | yes | complete | `hover-bench3-*` logs | none |
| 5 | product-mount-matrix | yes | complete | phase 3 drag listener counts at rest and on activation in `native-bench5-*` | none |
| 6 | trusted-editing-matrix | no | N/A: only - the parent plan step measures one owner lane | none | none |
| 7 | plite-vs-pinned-slate | no | N/A: only - the parent plan step measures one owner lane | none | none |
| 8 | example-breadth | no | N/A: only - the parent plan step measures one owner lane | none | none |
| 9 | large-and-stress | yes | complete | phase 3 browser lanes at 1,000 and 5,000 blocks in `native-bench5-*` | none |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: no cause proven
- lane: N/A: no cause proven
- comparable-baseline: N/A: no cause proven
- material-delta: N/A: no cause proven
- isolated-owner: N/A: no cause proven
- causal-intervention: N/A: no cause proven
- correctness-guard-result: N/A: no cause open; results are in Cause History
- fix-class: N/A: no cause proven
- long-term-target: N/A: no cause proven
- decision-owner: N/A: no cause proven
- layer-plan: N/A: no cause proven
- compatibility-verdict: N/A: no cause proven
- fix-owner: N/A: no cause proven
- benchmark-command: N/A: no cause proven
- benchmark-rerun: N/A: no cause proven
- benchmark-rerun-result: N/A: no cause open; results are in Cause History
- correctness-command: N/A: no cause proven
- correctness-rerun: N/A: no cause proven
- correctness-rerun-result: N/A: no cause open; results are in Cause History
- resume-lane: N/A: no cause proven

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| native-dragover-point | large-and-stress | kept | internal-implementation | drop targeting resolves a caret point only when no block host or rect answers the hit test | benchmark | N/A: an internal implementation fix needs no layer plan | N/A: no API or behavior changes, only cost | `packages/plitejs/src/dom/plugin/dom-drag.ts` | a Chrome CPU profile of 200 dragovers at 1,000 blocks put 405 of 426 ms inclusive in `resolveEventRange`, which every dragover ran before the host walk; resolving the point lazily cut the average dragover from 2.43 to 0.20 ms at 1,000 blocks and from over 20 ms to 0.51 ms at 5,000 | pass: `dom-coverage-native-bridge-contract.test.ts` 42 pass | `pnpm exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/run-dnd-perf.mts --url <host> --blocks <n> --out <file>` in `apps/www` | pass: dragover p95 within budget in every `native-bench5-*` candidate packet | `pnpm exec vitest run --config ./vitest.config.mjs test/react/dom-coverage-native-bridge-contract.test.ts` in `packages/plitejs`, and the parent plan's five-run browser matrix | pass: 42 pass; browser matrix in `p3final2-summary.txt` | `native-bench3-*`, `native-bench4-*`, `native-bench5-*` |
| native-indicator-paint | large-and-stress | kept | internal-implementation | the copied indicator moves with `transform`, so repainting it on every edge change runs no layout | benchmark | N/A: copied UI paint only | N/A: no API change | `apps/www/src/registry/components/editor/dnd.tsx` | moving-pointer p95 at 5,000 blocks was 4.5-5.3 ms in three of six packets while synchronous dragover stayed under 1.5 ms; with the indicator render disabled the lane read 0.5-0.6 ms in 3 of 3 packets, and positioning it with `transform` read 0.7-0.8 ms in 4 of 4 | pass: same contract | same command | pass: moving p95 0.8 ms at 5,000 blocks in 3 of 3 `native-bench5-*` packets | `pnpm exec vitest run --config ./vitest.config.mjs test/react/dom-coverage-native-bridge-contract.test.ts` in `packages/plitejs`, and the parent plan's five-run browser matrix | pass: 42 pass; browser matrix in `p3final2-summary.txt` | `native-bench4-*`, `native-bench5-*` |
| hover-dry-pass-resolve | owner-microbench-and-trace | kept | internal-implementation | node selection canonicalization is linear, and the transfer resolves its source once per source-view state instead of once per edge | benchmark | N/A: an internal implementation fix needs no layer plan | N/A: no API or behavior changes, only cost | `packages/plitejs/src/interfaces/selection.ts`, `packages/plitejs/src/core/transfer.ts` | a headless split put 11.4 of 15.7 ms per edge change in `SelectionApi.nodes` for 1,000 paths, whose canonicalization compared each path with every earlier one; linear canonicalization cut a miss to 4.7 ms, and caching the payload across edges cut the moving-pointer p95 from 25.7-31.2 ms to 1.4-1.5 ms | pass: `useDndNode.spec.ts` 53 pass and `transfer-contract.test.ts` 8 pass before the fix | `bun test ./src/dnd/react/useDndNode.hover.benchmark.slow.ts` | pass: moving p95 1.43-1.49 ms vs baseline 4.02-4.21 ms; still p95 0.80-0.82 ms vs 4.83-5.04 ms | `pnpm --filter plitejs test:partition:{core,react,dom,history,authored,yjs}` and `pnpm --filter platejs test:partition:dnd-react` | pass: core 1720, react 1375, dom 10, history 151, authored 422, yjs 274, dnd-react 62, all 0 fail | `hover-bench-*`, `hover-bench2-*`, `hover-bench3-*` logs |

Packet ledger:
| Packet | Lane | Hypothesis / cause | Candidate / baseline metric | Correctness | Decision | Next |
|---|---|---|---|---|---|---|
| hover-bench 1-3 | owner-microbench-and-trace | first measurement | moving p95 25.7-31.2 ms vs 4.17-4.30; still p95 4.92-5.20 vs 5.01-5.11 | pass | red; isolate | headless split |
| hover-bench2 1-3 | owner-microbench-and-trace | linear `SelectionApi.nodes` | moving p95 6.81-7.02 vs 4.19-4.26; still p95 0.86-0.91 vs 4.98-5.06 | pass | keep; still red | cache the payload across edges |
| hover-bench3 1-3 | owner-microbench-and-trace | payload cached per source-view state | moving p95 1.43-1.49 vs 4.02-4.21; still p95 0.80-0.82 vs 4.83-5.04 | pass | keep | none |
| native-bench3 | large-and-stress | first native measurement | 1,000 blocks: still p95 2.7-4.1 vs 0.2 ms, moving 3.3-3.9 vs 0.2 ms; drag start 1.6 s | pass | invalidate: the perf page had been split into a server page, so the editor hydrated inside the measured drag; baseline packets 2-3 and the 5,000 baselines also failed to move | restore the client-only page and profile |
| native-bench4 | large-and-stress | lazy caret point | 1,000: still 0.3, moving 0.4-0.5 vs 0.2 ms; 5,000: still 0.6 vs 0.3-0.9, moving 0.8-5.3 vs 0.2 ms | pass | keep; moving tail red at 5,000 | isolate the tail |
| native-bench5 | large-and-stress | indicator moved by `transform` | 1,000: still 0.3 vs 0.2, moving 0.4 vs 0.1-0.2 ms; 5,000: still 0.6 vs 0.3-0.4, moving 0.8 vs 0.2 ms | pass | keep | none |

Metric table:
| Lane / action | Samples | Baseline p50/p75/p95/p99/max | Candidate p50/p75/p95/p99/max | Absolute / relative delta | Noise / confidence | Artifact |
|---|---|---|---|---|---|---|
| hover, pointer changing edge every dragover | 3 x 300 | 0.13-0.16 / 2.96-3.13 / 4.02-4.21 / omitted / 4.85-5.26 ms | 1.16-1.17 / 1.24-1.25 / 1.43-1.49 / omitted / 2.59-3.09 ms | p95 -2.6 ms, -65% | packet p95 spread under 0.2 ms on both sides | `hover-bench3-*-{1,2,3}.log` |
| native dragover, still pointer, 1,000 blocks | 3 x 120 | p95 0.2 ms | p95 0.3 ms | +0.1 ms | within budget 1.2 ms | `native-bench5-*-1000-*.json` |
| native dragover, moving pointer, 1,000 blocks | 3 x 120 | p95 0.1-0.2 ms | p95 0.4 ms | +0.2-0.3 ms | within budget 1.1-1.2 ms | `native-bench5-*-1000-*.json` |
| native dragover, still pointer, 5,000 blocks | 3 x 120 | p95 0.3-0.4 ms | p95 0.6 ms | +0.2-0.3 ms | within budget 1.3-1.4 ms | `native-bench5-*-5000-*.json` |
| native dragover, moving pointer, 5,000 blocks | 3 x 120 | p95 0.2 ms | p95 0.8 ms | +0.6 ms | within budget 1.2 ms | `native-bench5-*-5000-*.json` |
| drag start / drop / teardown, 1,000 blocks | 3 x 1 | 36-40 / 260-266 / 60-62 ms | 19-24 / 58-62 / 0.8 ms | faster on all three | single samples per packet | `native-bench5-*-1000-*.json` |
| drag start / drop / teardown, 5,000 blocks | 3 x 1 | 70-77 / 755-776 / 26-30 ms | 62-67 / 168-180 / 1.3-1.5 ms | faster on all three | single samples per packet | `native-bench5-*-5000-*.json` |
| drag listeners at rest / after activation | 3 per size | 62 / 4,072 (1,000) and 20,072 (5,000) | 58 / 72 at both sizes | at rest -4; activation no longer grows with blocks | exact counts | `native-bench5-*.json` |
| hover, still pointer | 3 x 300 | 2.99-3.19 / 3.08-3.26 / 4.83-5.04 / omitted / 5.38-5.53 ms | 0.64-0.65 / 0.68-0.70 / 0.80-0.82 / omitted / 2.71-2.80 ms | p95 -4.1 ms, -83% | packet p95 spread under 0.25 ms on both sides | `hover-bench3-*-{1,2,3}.log` |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Run the exact metrics, comparisons, and correctness proof named above | Metric table: both cohorts under baseline p95 plus 1 ms |
| Benchmark plan structural validation | yes | Run `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs docs/plans/2026-10-01-dnd-transfer-benchmark.md` at cause/resume checkpoints | Verification evidence |
| Every applicable lane closed | yes | Complete or mark N/A with concrete reason | Lane table |
| Exact post-fix benchmark reruns | yes | Rerun every kept fix against its original lane/baseline | `hover-bench3-*` logs |
| Correctness/native behavior reruns | yes | Run named tests and Browser/Chrome/device proof required by the claim | Cause History post-fix correctness |
| Final source/host identity | yes | Prove final artifacts still match candidate and baseline identities | Benchmark Source fingerprints |
| Benchmark target/metric honesty | yes | Repair or verify source identity, fixture parity, sample math, aggregation, and artifact provenance | Harness/methodology repairs |
| Durable fix decision | yes | For every proven cause, validate the long-term target, Best API/layer-plan route when architectural, hard-cut or hard-law verdict, and concrete implementation owner | Cause History |
| Package/type/build proof | yes | Run affected package checks/typecheck/build only where owned | Plite core, react, authored and yjs typechecks; Plate dnd-react, core, table, layout, upload and standard-list typechecks, in the parent plan's decision log |
| Browser surface proof | no | Run Browser for product routes; Chrome/device for native state when applicable, or N/A with reason | N/A: package lane; the parent plan owns browser proof |
| Changeset/release artifact | no | Add only for published package behavior/API changes, otherwise N/A | N/A: the parent plan owns release notes |
| Agent rule/skill sync | no | Run `pnpm install` and mirror/resource checks when agent sources changed, otherwise N/A | N/A: this plan changes no agent source |
| Benchmark plan complete validation | yes | Run validator with `--complete` | Verification evidence |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | the parent plan's final scoped lint covers the benchmark file |
| Timed checkpoint | no | Satisfy requested duration and close current packet, otherwise N/A | N/A: no duration requested |
| P1 autoreview | no | Apply the pstack block's Review rule (autoreview before any PR, otherwise only when asked) and record the result, or N/A with reason | N/A: no PR and no review request |
| Plan complete | yes | Run `node .agents/pstack/plan-open.mjs docs/plans/2026-10-01-dnd-transfer-benchmark.md` | Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | Benchmark Source | none |
| Ordered diagnosis | complete | Packet ledger | none |
| Fix and exact rerun | complete | Cause History | none |
| Remaining breadth | complete | Lane table | phase 3 extends this plan |
| Review and closeout | complete | Verification evidence | none |

Findings:
- Native drop targeting resolved a DOM caret point on every dragover, an O(n) walk the block-host path never used.
- Repainting the copied indicator through `left` and `top` on every edge change produced p95 tail spikes at 5,000 blocks; `transform` removes them.
- `SelectionApi.nodes` and `SelectionApi.isNode` were quadratic in the number of selected paths, a cost every large node selection paid, including `prepareDrag` and hover's selection reads on `next`.

Decisions and tradeoffs:
- The source cache keys on the source view's snapshot, selection, payload and plugin revision, so a remote edit or a selection change re-resolves the payload; the edge memo keeps its own full key.

Harness/methodology repairs:
- Making the phase 3 perf page a server page put hydration inside the measured drag and broke the baseline drops; the page stays client-only on both sides, which its lint suppression records.
- `bun test` treats a `.slow.ts` path as a filter unless it starts with `./`, and its default 5 s timeout killed the red candidate packet; both were fixed before the candidate numbers were read.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---|---|---|
| bun filter matched no file | 1 | pass `./` paths | fixed |
| candidate test timed out at 5 s | 1 | raise the test timeout to 120 s | fixed |

Verification evidence:
- Benchmark packets: `docs/plans/artifacts/2026-10-01-dnd-transfer-consolidation/hover-bench{,2,3}-{baseline,candidate}-{1,2,3}.log`.
- Correctness: Cause History post-fix correctness.

Final handoff contract:
- plan / scope: this file; the `useDndNode` drop target hover with a 1,000-block payload
- candidate / baseline identities: Benchmark Source
- completed / N/A / pending lanes: lanes 1, 4, 5 and 9 complete; lanes 2, 3 and 6-8 N/A under `only`; none pending
- first conclusive cause: `hover-dry-pass-resolve` (phase 1), `native-dragover-point` and `native-indicator-paint` (phase 3)
- baseline / latest / best metrics: Metric table
- fix owner / changed files: `packages/plitejs/src/interfaces/selection.ts`, `packages/plitejs/src/core/transfer.ts`, `packages/plitejs/src/dom/plugin/dom-drag.ts`, `apps/www/src/registry/components/editor/dnd.tsx`
- exact benchmark and correctness reruns: Cause History
- resumed breadth: none pending
- packet decisions: Packet ledger
- harness/methodology repairs: see above
- residual claim limits / next owner: phase 1 is a package proxy under happy-dom; phase 3 measures Chromium dragover, drag start, drop, teardown and listeners at 1,000 and 5,000 blocks on development builds

Timeline:
- 2026-10-01 Benchmark plan created, measured, fixed and closed for phase 1.
- 2026-10-02 Phase 3 browser lanes measured at 1,000 and 5,000 blocks, two causes fixed, closed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Closed for phases 1 and 3 |
| Where am I going? | None |
| What is the goal? | See Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Both sides run React development builds behind source-mode dev servers, so absolute numbers are higher than production; the comparison is matched. The HEAD drop and teardown split into two modes at 1,000 blocks (about 102 and 6 ms in `native-bench-baseline-*` and `native-bench4` packet 1, about 258 and 60 ms in later packets) for an unexplained reason, and the candidate is faster than both. The candidate has no source fingerprint beyond the working tree at the `native-bench5` timestamps. owner: review scope `dnd`, tracked in open finding 8 of `docs/plans/2026-10-01-dnd-transfer-consolidation.md`.
