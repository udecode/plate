---
date: 2026-04-05
topic: slate-v2-phase6-hardening
---

# Slate v2 Phase 6 Hardening

> Archive only. Historical/reference doc. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Purpose

This file captures the Phase 6 evidence:

- frozen benchmark lanes
- frozen compatibility harness
- current baseline numbers
- what the current numbers actually say

## Frozen Commands

### Benchmarks

- `yarn bench:phase6:decorations:local`
- `yarn bench:phase6:placeholders:local`
- `yarn bench:phase6:huge-document:local`

### Compatibility

- `yarn test:phase6:compat:local`

CI owner:

- [phase6-proof.yml](/Users/zbeyens/git/slate-v2/.github/workflows/phase6-proof.yml)

## Benchmark Lanes

### Decorations Highlight Latency

Source:

- [phase6-decoration-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/phase6-decoration-benchmark.mjs)
- [slate-phase6-decoration-benchmark.json](/Users/zbeyens/git/slate-v2/tmp/slate-phase6-decoration-benchmark.json)

Current baseline at `5` iterations:

- legacy `search-highlighting` mean: `89.8ms`
- v2 `slate-v2-highlighted-text` mean: `3.84ms`
- delta mean: `-85.96ms`

Read:

- the current v2 decoration path is materially faster than the legacy
  highlight path on this frozen lane

### Placeholder Type Latency

Source:

- [phase6-placeholder-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/phase6-placeholder-benchmark.mjs)
- [slate-phase6-placeholder-benchmark.json](/Users/zbeyens/git/slate-v2/tmp/slate-phase6-placeholder-benchmark.json)

Current baseline at `5` iterations:

- legacy `custom-placeholder` mean: `12.86ms`
- v2 `slate-v2-placeholder` mean: `7.94ms`
- delta mean: `-4.92ms`

Read:

- the v2 empty-placeholder path is currently faster than the legacy
  `custom-placeholder` path on this frozen lane
- this lane is intentionally narrower than the huge-document lane
- it keeps placeholder/input-family hardening tied to a real before/after
  surface pair

### Huge-Document Latency

Source:

- [phase6-huge-document-benchmark.mjs](/Users/zbeyens/git/slate-v2/scripts/phase6-huge-document-benchmark.mjs)
- [slate-phase6-huge-document-benchmark.json](/Users/zbeyens/git/slate-v2/tmp/slate-phase6-huge-document-benchmark.json)

Stable workload:

- `1000` blocks
- `5` iterations

Current baseline:

- legacy ready mean: `696.6ms`
- v2 ready mean: `437.03ms`
- legacy type mean: `16.91ms`
- v2 type mean: `9.66ms`
- legacy select-all mean: `65.86ms`
- v2 select-all mean: `3.03ms`
- legacy paste mean: `44.77ms`
- v2 paste mean: `31.48ms`

Delta mean:

- ready: `-259.57ms`
- type: `-7.25ms`
- select-all: `-62.83ms`
- paste: `-13.29ms`

Read:

- v2 is better on ready, type, selection lag, and large paste on this frozen
  lane
- the lane is still useful specifically because it is a measured workload, not
  a vibes-only hero number

## Compatibility Matrix

Source:

- [phase6-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/phase6-compatibility.test.ts)

Current green rows:

- legacy `search-highlighting`
- legacy `shadow-dom`
- legacy `iframe`
- v2 `slate-v2-rich-inline` anchor lifecycle

Important boundary:

- huge-document is treated as a benchmark lane, not a simple green/red
  compatibility row
- that is deliberate
- it is a stress surface first, not a normal “basic editor surface” proof

Additional still-green adjacent proof:

- persistent annotation anchors:
  [persistent-annotation-anchors.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/persistent-annotation-anchors.test.ts)
- IME matrix via:
  `yarn test:slate-browser:ime:local`

## What Phase 6 Proves

1. the benchmark lanes are real and frozen
2. the compatibility harness is real and frozen
3. v2 now has baseline-vs-baseline evidence instead of vibes
4. the endgame docs can describe the compatibility envelope from measured behavior

## What Phase 6 Does Not Prove

1. that v2 is uniformly faster everywhere
2. that every legacy surface should migrate unchanged
3. that this one paragraph-heavy `1000`-block lane automatically generalizes to
   every large-document workload

## Next Move

Historical next move from Phase 6:

- Phase 7 public-surface cashout
  - compatibility envelope
  - migration story
  - browser-lane ownership docs

Current read after that:

- the later Phase 8/9/10 roadmap work is already landed historical follow-on
- default next work is implementation or shipping, not another roadmap pass
