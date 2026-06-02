---
tags: [editor-benchmarks, evidence-kit, hard-cut]
verdict: accepted
decision: Replace the old benchmark app lab with an Evidence Kit evidence package.
---

# Evidence Harness Bootstrap

## Goal

Replace `benchmarks/editor` with a smaller evidence-first lab for editor
framework benchmark research.

## Implemented

- Evidence Kit scaffold: fuzzer, corpus, benchmark, source fetchers,
  package-boundary check, startup check, scope hash, and perf docs.
- Target-owned benchmark-row normalization contract in `src/index.mjs`.
- Editor framework source config in `research/editor-frameworks-sources.json`.
- Hard-cut benchmark row that fails if old app/template paths return.

## Current Result

The lab can prove its own evidence shape before anyone starts claiming Slate v2
vs Slate numbers.

## Decision

Future editor comparisons should add source-backed Slate v2 vs Slate benchmark
rows inside this evidence lab. They should not restore the deleted app/template
zoo unless a benchmark row proves that a browser target app is the right owner.

## Deferred

- Additional Slate v2 vs Slate browser interaction proof.
- Normalizing more existing Slate v2 benchmark artifacts into this lab.

## Verification

Use:

```sh
npm run check
npm run evidence:full
npm run docs:perf:search -- editor benchmark
```
