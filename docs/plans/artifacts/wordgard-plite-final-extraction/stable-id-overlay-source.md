# Stable-ID overlay source gate

Decision: **promote one private mapped-source kernel**. Decoration, annotation,
and widget stay separate public concepts.

## Method

- Source sizes: 10,000 and 100,000 entries over 2,048 text runtimes.
- Change: one existing stable ID per refresh; order and cardinality stay fixed.
- Churn modes: stable object references and fully recreated wrapper objects.
- Control: production full reread, projection/resolution, materialization, and
  diff behavior before the private index.
- Candidate: one semantic source scan, mapping only changed IDs, and
  materializing only affected runtime buckets. Entity snapshots use ordinary
  copied `Map` values; there is no persistent-map trick in the result.
- Gate: at 100,000 entries, every control median exceeds 16.67 ms and every
  indexed row beats it by at least 3x median and 2x p95.

## Results

All values are milliseconds. Each cell is `median / p95`.

| Size | Churn | Concept | Full rebuild | Indexed | Median speedup | p95 speedup |
| ---: | --- | --- | ---: | ---: | ---: | ---: |
| 10,000 | stable reference | decoration | 14.32 / 19.18 | 0.62 / 0.93 | 23.10x | 20.62x |
| 10,000 | stable reference | annotation | 11.26 / 15.77 | 0.43 / 0.47 | 26.19x | 33.55x |
| 10,000 | stable reference | widget | 4.36 / 7.09 | 0.20 / 0.24 | 21.80x | 29.54x |
| 10,000 | recreated | decoration | 14.46 / 14.97 | 0.56 / 0.58 | 25.82x | 25.81x |
| 10,000 | recreated | annotation | 8.06 / 12.94 | 0.40 / 0.41 | 20.15x | 31.56x |
| 10,000 | recreated | widget | 3.95 / 6.50 | 0.21 / 0.22 | 18.81x | 29.55x |
| 100,000 | stable reference | decoration | 141.58 / 160.28 | 4.53 / 5.57 | 31.25x | 28.78x |
| 100,000 | stable reference | annotation | 130.21 / 152.86 | 2.11 / 2.46 | 61.71x | 62.14x |
| 100,000 | stable reference | widget | 69.07 / 76.42 | 1.18 / 1.31 | 58.53x | 58.34x |
| 100,000 | recreated | decoration | 122.10 / 133.45 | 4.29 / 4.59 | 28.46x | 29.07x |
| 100,000 | recreated | annotation | 109.93 / 133.23 | 1.70 / 1.81 | 64.66x | 73.61x |
| 100,000 | recreated | widget | 73.33 / 79.47 | 1.01 / 1.74 | 72.60x | 45.67x |

The expensive work changes from `O(N)` source mapping plus global snapshot
diffing to `O(N)` cheap semantic scanning plus `O(C)` mapping and affected
bucket materialization, where `C` is the changed-ID count. The gate uses
`C = 1`. Widget and annotation entity snapshots still copy a normal `Map`, so
the implementation keeps simple immutable snapshot semantics rather than
introducing a persistent collection dependency.

## Production shape

`packages/plite-react/src/stable-id-mapped-source.ts` is private. It owns stable
ID validation, semantic scans, forced candidate mapping, reverse output-key
indexes, precise changed entity/output keys, order fallback, and atomic mapping
failure. Decoration, annotation, and widget stores own their separate public
types, dirtiness policy, fault boundary, metrics, and subscriptions.

Reproduce:

```bash
bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/stable-id-overlay-source.mjs
```

The post-promotion benchmark forces the production stores through a full
rebuild control and compares it with their production private incremental
kernel. It writes `tmp/plite-stable-id-overlay-source-benchmark.json` and emits
machine-readable `METRIC` lines.
