---
tags: [editor-benchmarks, evidence-kit, slate-v2, slate]
verdict: accepted
decision: Use the Slate v2 vs Slate compare artifact as the first real editor comparison lane.
---

# Slate v2 vs Slate Evidence

## Goal

Expose the historical Slate v2 donor checkout vs `../slate` as the active
rich-text benchmark scope.

## Evidence

- Source artifact:
  `tmp/slate-react-huge-document-legacy-compare-benchmark-compare-all-blocks-5000-iters-3-ops-20-combined-selection-no-profile.json`
- Current repo in artifact: historical Slate v2 donor checkout under this repo
- Legacy repo in artifact: `/Users/zbeyens/git/slate`
- Workload: 5,000 blocks, 3 iterations, 20 type ops, combined selection lane.

## Implemented

- Dedicated Slate v2 vs Slate compare parser in `src/index.mjs`.
- Dedicated benchmark result writer:
  `benchmarks/slate-v2-legacy-benchmark.mjs`.
- Evidence Kit result:
  `benchmarks/results/slate-v2-legacy-latest.json`.

## Meaning

This lane is real benchmark evidence, but it is not a blanket editor verdict.
It compares three active Slate surfaces from one huge-document workload:

- `slate`
- `slate-v2:default-render-auto`
- `slate-v2:dom-present`

`slate` means the chunk-on baseline. Chunk-off is historical output only and is
not emitted into active comparison rows. Ready and full-document replacement
rows strongly favor Slate v2. Some selection-heavy rows favor Slate chunking.
That mixed result is the point: the lane is useful because it preserves
uncomfortable rows instead of turning the benchmark into marketing.

## Deferred

- More Slate v2 vs Slate browser interaction fixtures.
- V2-only model-beforeinput and native-surface-complete rows.

## Verification

Use:

```sh
npm run bench:evidence
npm run docs:perf:search -- slate-v2 slate
```
