# Clipboard performance verdict

Verdict: keep the core/DOM clipboard split and the fitted-slice architecture.

The authoritative issue-sized run passes every correctness and performance
gate:

- 10,000-line plain-text paste: 51.63 ms p50, below the 60 ms budget
- full-selection copy across 10,000 blocks: 14.48 ms p50, below the 20 ms budget
- 10,000-line paste into a populated 10,000-block document: 82.61 ms p50
- 50,000-block two-node cut: 99.996% existing-block identity retention
- correctness failures: 0
- issue-budget failures: 0

The earlier plain-text paste run measured 68.25 ms p50. The durable improvement
comes from three owning changes:

1. Complete-root slice export reuses immutable document nodes and skips content
   root traversal when the compiled schema has no content roots.
2. Canonical root indexing skips element-owned root rebasing for schemas with no
   content roots.
3. The compiled fitter caches type-level content permission and directly tries
   the canonical open-block local candidate before generating variant families.

The focused profiler contract proves that the successful canonical open-block
path does not generate `slice-fit-variants`. The full JSON evidence is in
`benchmark.json`.
