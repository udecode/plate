---
description: Measure, review or repair Plate performance with honest cohorts, baseline identity, correctness guards and causal proof. Load before choosing, running or waiving a scale or latency gate.
argument-hint: '[review | only] <scope, lane or plan>'
name: benchmark
metadata:
  skiller:
    source: .agents/rules/benchmark.mdc
---

# Benchmark

Run the Perf issue playbook for measurement and repair. `review` inspects a
design and its proof needs without starting a measurement. `only` explicitly
narrows lanes; mark excluded lanes N/A instead of implying whole-product proof.

Discover runners from the affected package, app and `benchmarks/editor`.
Inspect each runner's imports, fixtures and output schema. Record its source
revision, built artifact identity, actual route, action and environment.

Before accepting a changed cache, index, store, subscription, scheduler,
geometry owner or repeated work, name the user operation and independent
scale variables. Select normal, large and stress cohorts that exercise that
operation. Freeze budgets and the noise rule before reading candidate results.
Run the baseline first and prove one planted slowdown fails the budget.

Compare the same source-built route, fixture, options and real action.
Alternate baseline and candidate samples. Report absolute time and relevant
work counts beside relative changes. A baseline that refuses input or performs
different work is a control, not a performance comparison.

Preserve correctness and native behavior before accepting speed. A transform
benchmark cannot establish trusted keyboard, caret or paint behavior. Mount
and real editing are primary when the user report concerns an editor. Memory,
DOM size, layout reads and subscription fan-out are supporting guards or
primary metrics only when their cost is the question.

Repair measurement identity, stale builds, fixture parity, sample counts,
aggregation and missing guards before product code. A pre-acceptance prototype
proves a design choice only. Rerun the same contract on final production bytes
after the last repair. A rerun that cannot fit the block's one-hour Time budget
goes to a suggested task, as that rule says. Use `pstack:benchmark-checklist` before accepting or
reporting a measured result. Keep inconclusive decisions open with the next
probe; never replace a measured gate with an asymptotic argument.
