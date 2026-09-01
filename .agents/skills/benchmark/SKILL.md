---
description: Diagnose and iteratively repair Plate/Plite performance with an ordered all-lane benchmark loop. Use for current-vs-main, Plate-vs-Plite, Plite-vs-Slate, mount/editing, example sweeps, stress, or any performance regression. Runs every applicable lane by default, pauses at a proven cause, fixes and reruns it, then resumes breadth.
name: benchmark
metadata:
  skiller:
    source: .agents/rules/benchmark.mdc
---

# Benchmark

Handle $ARGUMENTS.

Read [methodology.md](./references/methodology.md) completely before
creating a goal, running a benchmark, or changing runtime code.

Benchmark is the single Plate/Plite performance diagnosis and execution owner:

```txt
discover all applicable lanes -> order by cost and causal value
-> run the cheapest decisive lane -> prove or reject a cause
-> pause later lanes when the cause is proven -> select the best durable target
-> implement one accepted owner
-> rerun the exact benchmark and correctness guard
-> resume the first pending lane -> repeat until breadth is complete
```

Run all applicable lanes by default. That means comprehensive inventory, not
comprehensive upfront cost. Every applicable lane starts in the plan. Execution
stops opening new lanes as soon as the conclusive-cause gate passes, then
resumes after the fix is green.

## Public Surface

- `$benchmark [scope]`: discover and run all applicable lanes in diagnostic
  order. A scope narrows fixtures and owners, not the default lane inventory.
- `$benchmark only <lane-or-target>`: explicitly narrow the run. Keep every
  default lane in the plan and mark unrelated rows
  `N/A: only - explicitly narrowed`.

Do not add `perf`, `compare`, `audit`, `status`, or engine-specific wrapper
modes. The scope already says what to measure; the ordered loop decides how.
Resume a matching active Benchmark goal instead of adding a public resume mode.

## Use When

- The user asks to benchmark, profile, find a performance regression, compare
  speed, or explain why one editor/ref is slower.
- The comparison is current Plate versus `origin/main`, Plate versus Plite,
  Plite versus pinned Slate, or any combination.
- The target is mount, construction, trusted editing, selection, paste, undo,
  example breadth, large documents, stress, or a benchmark target.
- A perf loop must find the cause quickly, repair it, rerun immediately, and
  keep expanding until the requested breadth is complete.
- A benchmark, metric, host, baseline, artifact, or command may be lying and
  needs repair before product code is touched.

## Do Not Use When

- The user only wants performance/scalability review criteria in a plan: use
  `performance` as the review lens.
- The problem is correctness-only with no timing claim: use `regression` or
  `patch`.
- One public API/runtime boundary must be chosen before measurement can be
  fair: use `best-api`, then `plite-plan` or `plate-plan`.
- The user only asks for existing Autoresearch session status or generic packet
  mechanics: use `slate-ar` or `codex-autoresearch` for that non-benchmark job.

## Ownership

| Owner | Responsibility |
| --- | --- |
| `benchmark` | baseline identity, lane discovery/order, comparison fairness, metric repair, causal gate, durable-fix checkpoint, measured rerun/resume loop, and benchmark handoff |
| benchmark targets/runners | executable workloads, metric output, correctness commands, and durable result artifacts |
| `performance` | cohorts, repeated-unit budgets, interaction percentiles, degradation/native-behavior review, and RUM/trace expectations |
| `regression` / `patch` | missing or failing correctness oracle and behavior repair, not timing diagnosis |
| `best-api` plus `plite-plan` / `plate-plan` | best long-term public API or runtime architecture required by a proven hot owner, including breaking/adoption decisions |
| `codex-autoresearch` | optional packet/log/dashboard machinery after Benchmark selects one metric and correctness guard |
| `auto` | broader quality supervision and ergonomic routing into Benchmark |

Do not delegate benchmark selection or causal ownership back to `auto`,
`performance`, `regression`, or `slate-ar`. They may supply evidence or worker
capacity without becoming a second supervisor.

## Pre-Acceptance Architecture Probe

Architecture and API owners invoke Benchmark before accepting a target when it
adds, retains, or changes a runtime layer, cache, index, projection, store,
subscription, scheduler, geometry owner, repeated-unit fan-out, or other hot
work. This is an embedded worker probe in the active architecture goal, not a
new public mode and not a second full Benchmark goal.

Before the architecture owner may lock that target:

1. Identify the user operation, current owner, proposed owner, independent
   scale variables, repeated units, and applicable normal, large, stress, and
   pathological cohorts.
2. Freeze the absolute/relative budget and noise rule before reading the target
   result. Reuse an honest existing budget when one exists.
3. Capture a comparable current-owner baseline. If the proposed path is not
   executable, build the smallest disposable prototype that can falsify its
   claimed owner and scaling law; do not start production implementation.
4. Run matched baseline/target cohorts and record source identity, fixture,
   action, environment, sampling/noise, deterministic work indicators, timing,
   and the correctness/native guard.
5. Accept the target only when the result meets the frozen contract and the
   evidence isolates the claimed owner. An inconclusive result leaves the
   decision `defer` or `gate` with the next probe named.

An asymptotic table, review score, profiler suspicion, future benchmark plan,
or "measure during implementation" note cannot satisfy this probe. Record N/A
only when live source proves the change is type-only or cannot change repeated
or hot runtime work.

After implementation, rerun the same contract on the final production path and
source identity, then run the correctness guard. A disposable prototype proves
the design decision only; it never proves the shipped implementation.

## Goal Contract

Read-only explanation of existing artifacts does not create a goal. A
pre-acceptance architecture probe records its contract and evidence in the
matching active architecture goal; do not create a competing Benchmark goal.
Any standalone run that measures, repairs a harness, changes code, or iterates
uses `autogoal` with `docs/plans/templates/benchmark.md` in one-shot execution
mode unless the user explicitly asks for collaborative planning:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template benchmark \
  --title "<scope> benchmark"
```

The first checkpoint copies every user requirement, resolves candidate and
baseline authority, discovers every default lane, and fills the lane table.
The plan is run coordination. Benchmark targets and result artifacts remain
metric authority; executable tests remain correctness authority.

Validate plan state at each conclusive-cause and resume checkpoint:

```bash
node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs \
  docs/plans/<benchmark-plan>.md
```

Before goal completion, also pass `--complete`, then run the normal Autogoal
completion checker.

## Ordered Execution

The methodology reference owns the exact default lane order and comparison
contract. Keep all lanes in the plan even when a scope makes one N/A.

Within that order:

1. Start with the named symptom/route when one exists; otherwise use the
   smallest normal product fixture.
2. Prefer an existing honest target or runner over a new harness.
3. Run only enough samples to separate signal from noise. Large stable deltas
   need fewer packets than threshold-adjacent results.
4. When a lane is red but the cause is not conclusive, run the cheapest next
   isolating lane or diagnostic. Do not patch from correlation.
5. When the conclusive-cause gate passes, pause later lanes immediately.

For a reporter-visible rerender or render-storm claim, record an exact-route,
phase-specific repeated-component inventory before owner isolation. Count
render or commit work by component family and repeated visible unit before and
during the named action. A wrapper-local Profiler, one improved component, or
pointer latency can prove only that local result; none can close the route-wide
claim. Account for every family above 5% of added work and at least 90%
overall, or keep the benchmark open with the remainder named.

## Conclusive Cause Gate

A cause is proven only when every row is present:

- the exact symptom has a material absolute and relative delta outside the
  observed noise band;
- candidate and baseline use comparable fixtures, actions, builds, browser,
  machine, and source identities;
- a package, layer, plugin family, repeated unit, or hot operation is isolated;
- a causal intervention changes the metric in the predicted direction;
- the relevant correctness test or native editor behavior remains valid and is
  recorded as `pass: <evidence>` before the cause is called proven;
- the fix owner and original benchmark/correctness commands are known; reruns
  must use those exact command identities.

A profiler hotspot, slow mean, one noisy p95, code suspicion, or current/main
diff alone is not conclusive.

## Durable Fix Decision

Once the cause is conclusive, keep later lanes paused and resolve the fix
contract before changing product code:

1. Classify the fix as `internal-implementation`, `correctness`, `public-api`,
   or `runtime-architecture`.
2. Record the best long-term target independently of compatibility, migration
   convenience, compiler difficulty, current machinery, or implementation
   cost. A cheaper patch does not win by being cheaper.
3. Keep straightforward internal implementation work in Benchmark and route
   correctness work to `patch`, `regression`, or `tdd`.
4. Run `best-api` for every `public-api` or `runtime-architecture` cause, then
   route adoption to `plite-plan`, `plate-plan`, or both. A bounded package
   owner may implement directly; broad cross-owner execution may use `auto`.
5. Before stability, default to `hard-cut: <material lasting value>` when the
   best target breaks current API or architecture. Preserve compatibility only
   as `preserve: <hard law> - <reason>`, where the hard law is correctness,
   security, serialized data, native behavior, or runtime behavior. Old
   callers, migration effort, deadlines, and compiler limits are not hard laws.
6. Record one concrete implementation owner. Best API and the layer plan choose
   the target and adoption; they do not replace that owner.

The validated cause checkpoint and terminal Cause History row must preserve
the fix class, long-term target, decision owner, layer plan, compatibility
verdict, and implementation owner.

## Fix, Rerun, Resume

After a proven cause:

1. Stop opening new benchmark lanes.
2. Implement the accepted best long-term target at the recorded owner. Do not
   downgrade it to a compatible local patch during implementation.
3. Rerun the exact red benchmark first, with the same baseline and sampling
   contract.
4. Rerun the named correctness guard. Reject a faster broken editor.
5. Record both outcomes as `pass: <evidence>` or `fail: <evidence>` in the
   cause checkpoint. Commands without successful results cannot resume breadth.
6. If either rerun is red, keep diagnosing the same lane and invalidate any
   causal claim the evidence disproved.
7. If both are green, append a durable `kept` Cause History row, mark the lane
   complete, and resume the first unfinished applicable lane across the full
   inventory. Reset the current checkpoint only after history is recorded. Do
   not restart the whole suite after every small fix.

The full run completes only after every applicable lane is complete or N/A
with a concrete reason. Early stop accelerates the next fix; it is never a
completion claim.

## Comparison Law

- Current Plate versus main Plate is product truth. Use isolated source-built
  hosts, exact refs or dirty fingerprints, and the same route/fixture/action.
- Plate versus Plite is layer attribution. Use the same current source,
  document, renderer intent, DOM strategy, and action; report wrapper/plugin
  tax without calling Plite a Slate baseline.
- Plite versus Slate is substrate evidence. Pin and record the exact local
  Slate commit; a mutable `../slate` path is not a baseline identity.
- Product and engine comparisons answer different questions. Run both when
  both are applicable; never substitute a minimal engine win for a real app
  route.
- Mount and trusted editing are primary. Heap/DOM are supporting guards unless
  memory, DOM growth, or a degraded mode is a plausible cause.

## Correctness And Native Behavior

Before keeping a fix, load only the relevant `performance` rule files for
cohorts, interaction metrics, repeated units, staged readiness, degradation,
and native behavior. Use real keyboard/browser input for user-facing editing
claims. Programmatic transforms may isolate runtime cost but stay labeled as
proxies.

If no correctness oracle exists, pause the perf claim and create the smallest
one through `patch`, `regression`, or `tdd`. Do not bury missing behavior proof
inside a benchmark artifact.

## Harness Repair

Repair the benchmark before product code when source identity, host freshness,
fixture parity, sample count, percentile math, metric aggregation, browser
action, correctness guard, or artifact provenance is wrong.

Do not create a second target registry. Discover current targets from
`benchmarks/targets/slate-v2.json`, package scripts, app runners, and live test
source. Add or repair a target only when the measured decision has no honest
owner.

## Verification

For Benchmark skill or methodology changes:

```bash
node --test \
  .agents/rules/benchmark/scripts/benchmark-contract.test.mjs \
  .agents/skills/benchmark/scripts/benchmark-contract.test.mjs
node .agents/rules/plate-next/scripts/sync-resources.mjs --check
```

For a runtime benchmark run, verification is the exact lane command,
correctness guard, comparable baseline artifact, post-fix rerun, and any
browser/native proof required by the claim. End non-trivial implementation
packets with P1 `autoreview`.

## Handoff

Report:

- plan path, scope, candidate/baseline identities, and completed/pending lanes;
- Cause History, first conclusive cause, and why it passed the causal gate;
- baseline/latest/best p50/p95/p99, sample count, absolute and relative delta;
- fix class, long-term target, decision/layer/implementation owners, breaking
  verdict, changed files, and exact benchmark/correctness reruns;
- resumed lanes and final breadth status;
- kept, reverted, invalidated, quarantined, or deferred packets;
- harness/methodology repairs and remaining claim limits.

Never call a cause proven from correlation, a fix green from a different lane,
or a comprehensive benchmark complete while applicable rows remain pending.
