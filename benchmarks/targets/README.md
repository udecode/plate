# Benchmark Targets

This directory is the migration spine for Slate benchmark work.

The target registry answers one question: what benchmark decision are we measuring, and how does an agent run or optimize it?

## Ownership

- Benchmark implementation lives beside the runtime/package code it measures.
- `benchmarks/targets/slate-v2.json` names active benchmark targets, cohorts, metrics, commands, correctness checks, artifacts, and source links.
- Autoresearch sessions optimize one target id at a time.
- Evidence Kit is a legacy report archive until generated reports move to this registry. Nothing regenerates this registry from it.

## Commands

```bash
pnpm bench:targets:list
pnpm bench:targets:check
pnpm bench:targets:report
pnpm bench:targets:report:check
pnpm bench:targets:dry-run -- react-active-typing-breakdown
pnpm bench:targets:run -- react-active-typing-breakdown
node tooling/scripts/bench-targets.mjs autoresearch-init react-active-typing-breakdown
```

`bench:targets:dry-run` is read-only. It checks the registry, prints the exact benchmark and checks commands, and asks Autoresearch for a setup plan when its script is available. Both commands run in the target's `cwd`, with every variable that either recipe assigns removed from the inherited environment, for `bench:targets:run` and for Autoresearch alike. Use `autoresearch-init` only when you want to create or replace the real `.tmp/slate-autoresearch/autoresearch.*` session files. For operator workflows, invoke the `slate-ar*` skills instead of package scripts.

Edit target definitions in `slate-v2.json` directly.

## Run receipts

`pnpm bench:targets:run -- <target-id>` writes the target's latest receipt to `tmp/bench-targets/receipts/<target-id>.json` for every outcome, including failures. A receipt records the recipe that ran: the cwd, the benchmark and correctness commands with their inline environment assignments, the variables removed from the inherited environment, the artifacts, the metric and the timeouts. It also records each process's exit, each artifact's digest (or read error) and whether the benchmark changed it, and the host. Its result is `passed` with the primary metric, or `failed` with the failing stage (`correctness`, `benchmark`, `artifact` or `metric`) and the error message. A failed run replaces the previous receipt, so the receipt never presents an older pass as the latest result. The target report shows each target's latest run and whether its recipe still matches. The lab catalog in `benchmarks/editor` admits an artifact as current only when a passing receipt with the current recipe produced its bytes and every input the producer recorded still matches. A variable that a producer reads but no recipe names can still come from the caller's shell. If the CLI cannot write the receipt, the run exits nonzero.

## Target Contract

Each target has:

- `id`: stable command-facing id
- `question`: decision the benchmark answers
- `owner`: runtime/package owner
- `family` and `kind`: grouping for reports
- `cwd` and `command`: run location inside the repo, and the command with any inline environment assignments
- `metrics`: primary metric, direction, unit, and whether output prints `METRIC name=value`
- `correctness`: command that prevents speed wins from breaking editor behavior
- `artifacts`: result files produced by the target
- `docs`: supporting evidence links
- `migration`: temporary provenance while Evidence Kit is being retired

Benchmark output should move toward native `METRIC` and `ARTIFACT` lines. Until then, Autoresearch can wrap timing with `metrics.printsMetric: false`.

## Generated Outputs

`pnpm bench:targets:report` writes:

- `benchmarks/targets/history/slate-v2-latest.json`
- `benchmarks/targets/reports/slate-v2.md`

These files summarize recorded artifacts for each target. Report generation does not execute benchmarks or establish source freshness and passing budgets.

An artifact is recorded when it exists locally or appears in the latest known generated history. Historical receipts remain recorded when a local cache is absent. This records past evidence without claiming the file is currently available or the current source passes its budget.

`pnpm bench:targets:dry-run -- <target-id>` checks the registry, builds the report model in memory, and asks Autoresearch for a setup plan for that target. Use it before starting a real optimization loop.
