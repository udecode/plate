# Benchmark Targets

This directory is the migration spine for Slate benchmark work.

The target registry answers one question: what benchmark decision are we
measuring, and how does an agent run or optimize it?

## Ownership

- Benchmark implementation lives beside the runtime/package code it measures.
- `benchmarks/targets/slate-v2.json` names active benchmark targets, cohorts,
  metrics, commands, correctness checks, artifacts, and source links.
- Autoresearch sessions optimize one target id at a time.
- Evidence Kit is a legacy import/report archive until generated reports move
  to this registry.

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

`bench:targets:dry-run` is read-only. It checks the registry and prints the
Autoresearch setup plan for the target. Use `autoresearch-init` only when you
want to create or replace the real `.tmp/slate-v2/autoresearch.*` session files.
For operator workflows, invoke the `slate-ar*` skills instead of package
scripts.

Use `pnpm bench:targets:import-evidence-kit` only while migrating active rows
from `benchmarks/editor/research/benchmark-registry.json`. After the cutover,
edit target definitions here directly.

## Target Contract

Each target has:

- `id`: stable command-facing id
- `question`: decision the benchmark answers
- `owner`: runtime/package owner
- `family` and `kind`: grouping for reports
- `cwd` and `command`: repo-relative run location and command
- `metrics`: primary metric, direction, unit, and whether output prints
  `METRIC name=value`
- `correctness`: command that prevents speed wins from breaking editor behavior
- `artifacts`: result files produced by the target
- `docs`: supporting evidence links
- `migration`: temporary provenance while Evidence Kit is being retired

Benchmark output should move toward native `METRIC` and `ARTIFACT` lines. Until
then, Autoresearch can wrap timing with `metrics.printsMetric: false`.

## Generated Outputs

`pnpm bench:targets:report` writes:

- `benchmarks/targets/history/slate-v2-latest.json`
- `benchmarks/targets/reports/slate-v2.md`

These are the target-registry replacement for Evidence Kit's active
health/report surface. They summarize target status from registered artifacts.
They do not run expensive benchmarks.

Artifact existence is sticky: a target stays present when the artifact exists
locally or in the latest known generated history. This keeps partial local
caches from turning unrelated target rows red during focused benchmark work.

`pnpm bench:targets:dry-run -- <target-id>` checks the registry, builds the
report model in memory, and asks Autoresearch for a setup plan for that target.
Use it before starting a real optimization loop.
