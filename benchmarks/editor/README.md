# Editor Evidence

This directory is an Evidence Kit lab for editor framework benchmark research.

It replaces the old standalone Next/Vite benchmark app. The default owner is
now evidence artifacts, not browser app scaffolding.

## Commands

```sh
npm run evidence:inspect
npm run research:list
npm run research:editor-frameworks:fetch
npm run test:evidence
npm run fuzz
npm run bench:evidence
npm run bench:rich-text:check
npm run bench:startup:check
npm run bench:package:gates
npm run bench:scope
npm run evidence:health
npm run evidence:refresh
npm run docs:perf
npm run docs:perf:search -- editor benchmark
npm run evidence:full
```

## Source Map

Primary target list:

- Slate v2
- Slate

Primary source config:

- `research/editor-frameworks-sources.json`

Primary benchmark registry:

- `research/benchmark-registry.json`

## Active Benchmark Matrix

`benchmarks/results/rich-text-editors-latest.json` is the broad benchmark
matrix. It imports active artifacts from `research/benchmark-registry.json`.
Old one-off benchmark JSON files do not count unless they are registered there.
The active scope is Slate v2 vs Slate only.

Measured Slate v2 families:

- React huge-document legacy compare
- React rerender breadth
- React huge-document overlays
- React huge-document browser trace
- React active typing breakdown
- Core normalization, query/ref observation, node transforms, text/selection,
  editor store, and refs/projection
- Core huge-document, normalization, observation, and history compares against
  Slate
- Clipboard large payload, collab readiness, and issue #6038 transaction
  execution rows

Local source targets:

- Slate v2
- Slate

Slate baseline rule:

- Use Slate chunk-on as the baseline. Do not emit chunk-off rows in active
  comparison output.

The first direct runtime comparison still lives in:

- `benchmarks/results/slate-v2-legacy-latest.json`

The comprehensive result lives in:

- `benchmarks/results/rich-text-editors-latest.json`

The health and next-action report lives in:

- `benchmarks/results/benchmark-health-latest.json`

## Rule

Do not restore the old app/template lab by default. Do not promote random
historical tmp JSON. Add a registry entry, target-owned adapter, fuzzer, corpus
case, benchmark row, or source-pass note when a comparison needs new evidence.
