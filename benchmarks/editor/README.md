# Editor Evidence

This directory holds editor benchmark runners, research inputs, and evidence artifacts.

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

`benchmarks/results/rich-text-editors-latest.json` is the broad benchmark matrix. It imports active artifacts from `research/benchmark-registry.json`. Old one-off benchmark JSON files do not count unless they are registered there. The active scope is Slate v2 vs Slate only.

Measured Slate v2 families:

- React huge-document legacy compare
- React rerender breadth
- React huge-document overlays
- React huge-document browser trace
- React active typing breakdown
- Core normalization, query/ref observation, node transforms, text/selection, editor store, and refs/projection
- Core huge-document, normalization, observation, and history compares against Slate
- Clipboard large payload, collab readiness, and issue #6038 transaction execution rows

Local source targets:

- Slate v2
- Slate

Slate baseline rule:

- Use Slate chunk-on as the baseline. Do not emit chunk-off rows in active comparison output.

The first direct runtime comparison still lives in:

- `benchmarks/results/slate-v2-legacy-latest.json`

The comprehensive result lives in:

- `benchmarks/results/rich-text-editors-latest.json`

The health and next-action report lives in:

- `benchmarks/results/benchmark-health-latest.json`

## Rule

Do not restore the old app/template lab by default. Do not promote random historical tmp JSON. Add a registry entry, target-owned adapter, fuzzer, corpus case, benchmark row, or source-pass note when a comparison needs new evidence.

## Code-block product benchmark

Run the native Plate and CodeMirror demos on the same production host:

```sh
PLATE_CODE_BLOCK_BENCHMARK_URL=http://localhost:3110 pnpm --filter plate-editor-evidence bench:code-block
pnpm --filter plate-editor-evidence test:code-block-oracle
```

`benchmarks/plate-code-block-browser.mjs` checks the exact inserted keyword, canonical text, selection, bounded DOM, undo and redo. Its receipt keeps raw samples, source fingerprints, runtime identity and separate validity and timing results. Strict mode exits unsuccessfully on invalid evidence or exceeded timing budgets. The default comparison uses three warmups and fifteen measured samples per renderer, interleaved in alternating order.

For two frozen production builds, set `PLATE_CODE_BLOCK_BENCHMARK_VARIANTS` to an object with two entries. Each entry supplies `mode` (`native` or `codemirror`), `route`, and an optional `baseURL`. Record the build identities alongside the receipt. These product receipts are separate from the Evidence Kit aggregate described above.

## External-text substrate benchmark

```sh
node benchmarks/editor/benchmarks/plite-external-text-browser.mjs --output=tmp/external-text.json
pnpm --filter plate-editor-evidence test:external-text-measurement
```

Run the benchmark command from the repository root. `--only=<regex>` selects cohorts by their JSON input; the receipt labels that run as a diagnostic subset. `--profile` records a separate mount on a fresh page. Profiled observations never enter the timing distributions.

Each mount mode has 30 samples after three discarded rounds. Every measured warm remount uses a fresh page after a cold mount and one unmeasured remount. Applicable baseline and target pairs alternate order. Receipts retain raw timings, per-mount correctness counters, source and bundle hashes, and host load observations. Runner, measurement helper or lockfile changes invalidate the receipt. For other source changes during measurement, a fresh rebuild must produce the identical bundle and finish on stable source to preserve validity.

The CLI reports correctness/validity, budgets and noise separately. Exit `0` means all checks passed; `1` means a correctness or validity failure; `2` means shared-host timing is inconclusive. A missed latency budget remains recorded and non-passing. Noise requires both a p95/p50 ratio above 1.6 and more than 4ms of absolute jitter, so tiny durations do not fail through division alone. The 150ms mount budget is unchanged. Timing alone does not establish a product regression, and an inconclusive result does not justify retrying until green.
