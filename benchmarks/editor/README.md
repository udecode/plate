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

Benchmark authority:

- `../targets/slate-v2.json` owns every executable target: its recipe, artifacts, metrics and correctness check. A target artifact that declares `evidence` metadata (`kind`, `category`, and optional `library` or `surfaceLibraries`) is active lab evidence.
- `research/benchmark-registry.json` groups those targets into workloads and keeps retired definitions as historical records, each linked to a related live target.

## Active Benchmark Matrix

`benchmarks/results/rich-text-editors-latest.json` is the broad benchmark matrix. It reads every target artifact that declares evidence metadata. One-off benchmark JSON files do not count. The active scope is Slate v2 vs Slate only.

Each artifact is admitted once before its rows count:

| Admission | Meaning |
| --- | --- |
| `current` | A passing receipt from `pnpm bench:targets:run` produced these bytes with the recipe the registry declares now, and every input the producer recorded still matches. |
| `stale` | The latest run failed, the recipe changed, or a recorded input no longer matches. |
| `unknown` | No receipt describes these bytes, or the producer records no inputs. |
| `historical` | A retired definition. Its artifact is never assigned to the live target. |

A row reads `ok` only when its artifact is current. Other rows keep their values, take the admission state as their status and carry the reasons in their note. When the target's latest run failed, the artifact shows a single row with the failure stage and message instead of its older values. Workload coverage counts only current `ok` rows.

The loader judges a threshold row with the comparison operator its producer records (`<`, `<=` or `===`). A violated threshold reads `over-budget`, or `integrity-error` when the producer marked it as passed. A threshold without a recorded operator, and one that holds, stays `unassessed`, because a producer's pass can depend on preconditions the artifact does not record.

Measured Slate v2 families:

- React rerender breadth
- React huge-document overlays
- React huge-document browser trace
- React active typing breakdown
- Core normalization, query and anchor observation, node transforms, text and selection, and editor store
- Core huge-document, normalization, observation, and history compares against Slate
- Clipboard large payload, collab readiness, transaction execution and retained history memory

Local source targets:

- Slate v2
- Slate

Slate baseline rule:

- Use Slate chunk-on as the baseline. Do not emit chunk-off rows in active comparison output.

The direct legacy comparison lives in:

- `benchmarks/results/slate-v2-legacy-latest.json`

No target declares `react-huge-document-legacy-compare`, so `benchmarks/slate-v2-legacy-benchmark.mjs` reads a comparison only from `--artifact <path>` and otherwise reports it unavailable.

The comprehensive result lives in:

- `benchmarks/results/rich-text-editors-latest.json`

The health and next-action report lives in:

- `benchmarks/results/benchmark-health-latest.json`

It lists each active artifact's admission and reasons, and names the targets to rerun through `pnpm bench:targets:run`.

## Rule

Do not restore the old app/template lab by default. Do not promote random historical tmp JSON. Add a target with evidence metadata, a target-owned adapter, fuzzer, corpus case, benchmark row, or source-pass note when a comparison needs new evidence.

## Code-block product benchmark

Run the native Plate and CodeMirror demos on the same production host, built with `NEXT_PUBLIC_PLATE_BROWSER_HANDLE=1` so the page exposes the browser handle the benchmark reads:

```sh
PLATE_CODE_BLOCK_BENCHMARK_URL=http://localhost:3110 pnpm --filter plate-editor-evidence bench:code-block
pnpm --filter plate-editor-evidence test:code-block-oracle
```

`benchmarks/plate-code-block-browser.mjs` checks the exact inserted keyword, canonical text, selection and bounded DOM. The input clock starts at the `beforeinput` event, observed on `window` in the capture phase ahead of the editor's own handlers. A sample without that timestamp is invalid. Its receipt keeps raw samples, source fingerprints, runtime identity and separate validity and timing results. Strict mode exits unsuccessfully on invalid evidence or exceeded timing budgets. The default comparison uses three warmups and fifteen measured samples per renderer, interleaved in alternating order.

For two frozen production builds, set `PLATE_CODE_BLOCK_BENCHMARK_VARIANTS` to an object with two entries. Each entry supplies `mode` (`native` or `codemirror`), `route`, and an optional `baseURL`. Record the build identities alongside the receipt. These product receipts are separate from the Evidence Kit aggregate described above.

## Markdown streaming assessment

`benchmarks/markdown-streaming-measurement.mjs` assesses an S5 streaming matrix under one named policy:

```sh
node benchmarks/editor/benchmarks/markdown-streaming-measurement.mjs <matrix-dir> \
  --policy s5-no-regression-v1 \
  --out <new-assessment-file>
```

`s5-no-regression-v1` checks completeness, final and arrival latency within `max(10%, 5 ms)` of the baseline, correctness and profile attribution. `s5-work-gain-profile120-v1` adds work gain: every pair saves at least 20% and 100 ms of parse plus transaction work, and the smallest gain exceeds both arms' variation. Each check reports `pass`, `fail` or `inconclusive` with reasons. Missing data is inconclusive, and contradicting data fails. The CLI never overwrites a file or writes inside the matrix.

Correctness needs the matrix preflight. Before each cell's streams, `apps/www/tests/browser/markdown-streaming-contract.spec.ts` compares each arm's streamed final with the strict parse of the whole source (static and editable) or a one-chunk response (AI). It records the served build id and the reference text hash. Every measured final must equal its arm's reference, every stream must come from its arm's preflight build, and both arms must share one reference. A candidate that renders different text everywhere passes its own preflight, so the shared reference is what fails it. The spec's header lists the matrix environment variables.

## External-text substrate benchmark

```sh
node benchmarks/editor/benchmarks/plite-external-text-browser.mjs --output=tmp/external-text.json
pnpm --filter plate-editor-evidence test:external-text-measurement
```

Run the benchmark command from the repository root. `--only=<regex>` selects cohorts by their JSON input; the receipt labels that run as a diagnostic subset. `--profile` records a separate mount on a fresh page. Profiled observations never enter the timing distributions.

Each mount mode has 30 samples after three discarded rounds. Every measured warm remount uses a fresh page after a cold mount and one unmeasured remount. Applicable baseline and target pairs alternate order. Receipts retain raw timings, per-mount correctness counters, source and bundle hashes, and host load observations. Runner, measurement helper or lockfile changes invalidate the receipt. For other source changes during measurement, a fresh rebuild must produce the identical bundle and finish on stable source to preserve validity.

The CLI reports correctness/validity, budgets and noise separately. Exit `0` means all checks passed; `1` means a correctness or validity failure; `2` means shared-host timing is inconclusive. A missed latency budget remains recorded and non-passing. Noise requires both a p95/p50 ratio above 1.6 and more than 4ms of absolute jitter, so tiny durations do not fail through division alone. The 150ms mount budget is unchanged. Timing alone does not establish a product regression, and an inconclusive result does not justify retrying until green.
