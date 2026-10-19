# Resolved token cursor gate

Verdict: promote the package-private cursor. It preserves every query result and
public structural path API while the worst large/stress cursor-to-legacy ratio
across three runs is `0.0139` median and `0.0151` p95.

Command:

```sh
bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/resolved-token-cursor.mjs
```

Evidence:

- normal: 500 depth-3 blocks, 256 repeated queries per lane
- large: 10,000 depth-3 blocks, 128 repeated queries per lane
- stress: 50,000 depth-3 blocks, 48 repeated queries per lane
- lanes: resolved point walk, node-start walk, small touching-range walk
- sampling: 15 samples per lane across three independently rebuilt runs
- threshold: cursor median and p95 at most `0.8x` legacy for every large/stress
  lane; at most `1.1x` for every normal lane; exact parity required
- result: all gates pass; generated sparse, empty, and irregular nesting query
  equivalence passes 200 runs

### Performance

- applicability: applied
- Vercel rules used: none; this is a headless immutable-tree query kernel
- extra rules used: cohort-segmentation, repeated-unit-budget,
  interaction-inp-matrix, memory-dom-tagging
- repeated unit: one resolved point, node-start lookup, or small touching-range
  lookup
- cohorts: normal 500; large 10,000; stress 50,000 depth-3 blocks;
  pathological timing excluded and covered by generated semantic equivalence
- budgets: position lookup `O(depth * log siblings)`; touching range
  `O(depth * log siblings + answers)`; retained state one cursor plus at most
  document-depth frames; transient allocation `O(depth)` plus answers; no
  second per-node index or document-size-proportional query allocation
- React/runtime primitives: none
- interaction metrics: headless walk median and p95; browser INP/CWV is out of
  scope because no DOM or renderer behavior changes
- trace/CWV proof: not applicable to this core-only query replacement
- memory tags: TreeIndex node count, avoided flat-entry count, retained cursor
  frame bound
- degradation contract: none; answers, association behavior, and structural
  paths are identical
- dashboard/RUM gap: no public interaction metric is claimed; the reproducible
  benchmark is the regression gate
- plan delta: promote privately; do not expose integer positions or the cursor
  from a package barrel
