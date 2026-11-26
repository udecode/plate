---
extends: perf-issue, hillclimb
when: Use it to benchmark, profile or compare Plate, Plite or Slate speed, to find, explain or repair a performance regression or a lying benchmark, or for `benchmark [scope]` and `benchmark only <lane-or-target>`.
---

# Perf issue

Owns the benchmark run lifecycle (plan, cause gate, durable fix decision, fix-rerun-resume, close). `benchmark` holds lanes, harnesses, cohorts, budgets and pre-acceptance probes (probes run inside architecture plans without this playbook; `benchmark review` reviews without measuring). Autoresearch supplies packet capacity only.

- **Before** "Capture a baseline trace via the matching driver skill": run Intake, then Plan.
- **In** "Capture a baseline trace via the matching driver skill": inventory all 9 `benchmark` lanes up front and run sequentially from named symptom/route or smallest fixture on existing honest targets (`verify` drives browser proof). Command speedups baseline first run + rerun; profile (`node --cpu-prof`) before explaining time.
- **In** "Trace the code to ground hypotheses": read `docs/research/sources/plate-notes/performance.md` and `performance-2.md`. Patch nothing before Cause gate. Rerender claims need route-wide render inventory (all families >5% added work); causal claims need paired runs; unmatched shared-host timing failures stay `inconclusive`.
- **After** "Trace the code to ground hypotheses": once Cause gate facts 1 to 6 hold, assign cause ID, mark prefix `complete`, cause lane `red`, rest `paused`/`pending`, record Durable fix decision, set checkpoint `proven`, validate, stop opening lanes.
- **In** "Plan the fix from the trace": implement only `internal-implementation` here (checkpoint `fixing`, one owner at a time, never downgrade target); route other classes to their owner and return for rerun.
- **In** "Parse and compare the artifacts": run Fix, rerun, resume.
- **Replace** "Cite the measurement in the PR": run Close.
- **Before** "Ground the workload and architecture before choosing the metric": run Intake, then Plan.
- **In** "Ground the workload and architecture before choosing the metric": take cohorts/metric/direction from `benchmark`, freeze budget/noise rules first, run in lane order, pair budget + attempt floor (ending via Close).
- **In** "Build the measurement harness, prove its sensitivity, then freeze it": use an existing honest target; fix lying harnesses via `benchmark` Harness Repair first. Lane correctness guard is the regression gate.
- **Replace** "Open the decision log via the **show-me-your-work** skill": Packet ledger + Cause History replace `decision.tsv` (keep `.decisions.tsv` beside plan only if `trails.md` requires).
- **In** "Ground each hypothesis in the architecture model from step 1": apply "Trace the code to ground hypotheses"; start attempts only after Cause gate + Durable fix decision.
- **In** "Loop, one hypothesis per iteration": one packet per attempt via Fix, rerun, resume (log reverts); `codex-autoresearch` may run packets on one target while this run keeps ownership.
- **In** "Stop when the predicate is met": never overrides Close; report plan path for `decision.tsv`.
- **Replace** "Run **Opening a PR**": run diff panel if required, land via `land.mjs`, end with Close.

## Intake

Correctness-only -> Bug fix; API/runtime boundaries blocking fair measurement -> `best-api` + Plan; Plite autoresearch status -> `benchmark`/`benchmarks/editor`; read-only artifact Q&A -> `benchmark` and stop. Else load `benchmark` + `pstack:benchmark-checklist` first.

## Plan

Copy `.agents/rules/benchmark/templates/benchmark.md` to `docs/plans/<date>-<scope>-benchmark.md` (or resume active plan) for `node .agents/skills/benchmark/scripts/validate-benchmark-plan.mjs <plan>`. Checkpoint 1 fills requirements, identities, targets and all 9 lanes (`$benchmark <scope>` keeps all; only `$benchmark only <lane-or-target>` allows `N/A: only - <reason>`, else `N/A: inapplicable - <reason>`). Validate every checkpoint and `--complete` at Close.

## Cause gate

All 7 required: (1) material delta outside noise, (2) comparable fixtures/actions/builds/browser/machine/source, (3) isolated owner/hot op, (4) causal intervention moves metric, (5) correctness holds (`pass: <evidence>`), (6) fix owner + exact commands, (7) Durable fix decision. Vet via `pstack:benchmark-checklist`.

## Durable fix decision

Classify before editing: `internal-implementation` (`benchmark`), `correctness` (Bug fix -> return), `public-api`/`runtime-architecture` (pivot via `best-api` + Plan; `layer-plan: plite|plate|both`), or unmeasured cleanup (Refactoring). State ideal target independent of cost; default `hard-cut: <value>` (`preserve: <hard law> - <reason>` only for correctness/security/serialized-data/native-behavior/runtime). Carry fields + `fix-owner` into Cause History.

## Pivot

`public-api`, `runtime-architecture`, or conclusive frozen-budget miss (Hillclimb: stopped unmet or Cause gate proves owner/stored-shape change required) pivots immediately (2nd pivot stops per `long-runs.md`). Run `architect` (+ `best-api` for public API); if owner/stored shape changes, write pivot plan whose step reruns the exact benchmark, log `pivoted` + `pivot-plan: <file>.md`, complete lane. `deferred`/`quarantined` need quoted owner approval; `reverted`/`invalidated` stay open until superseded or harness-repaired. Judge `inherited-budget` (`<file>.md <step>`) into `inherited-budget-result`.

## Fix, rerun, resume

Checkpoint `rerun` -> exact red benchmark then exact correctness (`pass:`/`fail:`). Disproved -> unpause, `invalidated` checkpoint/row, keep diagnosing. Pass/pivot -> `kept`/`pivoted` row, mark `complete`, unpause, `green`/`pivoted` with `resume-lane` on next unfinished lane, validate, resume from baseline, reset `none`.

## Close

All applicable lanes `complete`/N/A, Cause History complete (`none` if empty), post-fix benchmark + correctness green, checkpoint `none`, matching identities, validator `--complete` green, zero pending gates, required review green. Report identities/lanes, Cause History, p50/p95/p99 + sample count + delta + `benchmark-checklist` limiter/errors/work count, fix decisions/files/reruns, breadth, packets and claim limits. Never hide latency via debounce, deferred work, degraded DOM or narrower actions.
