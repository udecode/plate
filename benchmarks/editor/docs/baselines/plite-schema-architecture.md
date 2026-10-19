# Schema Architecture Baseline

Recorded 2026-07-20 on Apple arm64, macOS 26.3.1, Bun 1.3.12, from live
checkout head `5b8e0e945a9347479950327c1ee590ed17b5e58e` plus the active uncommitted
architecture work.

Command:

```sh
PLITE_SCHEMA_ARCHITECTURE_STRICT=1 bun --expose-gc --preload ./config/plite-source-aliases.ts benchmarks/editor/benchmarks/plite-schema-architecture-benchmark.ts --output=tmp/plite-schema-architecture-benchmark.json
```

Corpus: 100 element specs, 200 exact properties split evenly across element and
text placement, 20 callback-matched dynamic namespaces, 30 groups, the primary
root, and three named roots. Each timing uses 20 compile/reconfiguration
samples, ten 20,000-call query samples, and ten 100-call wrapper samples.
Retained heap uses five stable samples of 128 corpus editors minus 128 minimal
four-root editors after an unrecorded warm-up pair and forced GC.

| Metric | Current baseline | Target consequence |
| --- | ---: | --- |
| Compile p50 / p95 | 1.876 / 3.063 ms | p95 must remain below 16 ms |
| Equivalent reconfiguration p50 / p95 | 2.289 / 3.739 ms | Final no-op path at most 1.05x baseline and zero schema revision |
| Warm type query p50 | 2,970 ns | Final indexed path at most 1,485 ns |
| Warm element-property query p50 | 2,736 ns | Final indexed path at most 1,368 ns |
| Warm group-target query p50 | 3,223 ns | Final indexed path at most 1,612 ns |
| Warm namespace query p50 | 3,600 ns | Final indexed path at most 1,800 ns |
| Repeated wrapper lookup p50 / p95 | 9.921 / 21.083 us | No BFS or factory probe after the first revision-local result |
| Wrapper factory probes per lookup | 100 | Final repeated lookup must report 0 |
| Retained schema heap p50 / p95 | 631,225 / 639,656 bytes/editor | Final p50 at most 473,419 bytes/editor |
| Reconfiguration commits | 20 / 20 | Equivalent configurations must not advance the schema revision |

The retained-heap samples were 617,012, 619,327, 639,656, 631,225, and 632,655
bytes/editor; their spread is below the benchmark's 25% determinism ceiling.

Current-model limitations are intentional baseline facts:

- The public declaration spells the primary root as `"main"`; the target makes
  it implicit.
- Dynamic namespaces are callback matchers; the target uses serializable,
  collision-checked prefixes.
- Heap subtraction includes per-editor registry/runtime overhead and does not
  reproduce Plate Core's global descriptor expansion. It is suitable for
  same-command before/after comparison, not an isolated object-size claim.

The generated target oracle lives in
`packages/plite/test/schema-target-model-oracle.test.ts`. It compares the live
schema result against a pure interpreter for 64 deterministic generated
type/group/all/any/not rules across twelve element types.
