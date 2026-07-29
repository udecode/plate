# Retained renderer verdict

Verdict: **reject and delete**.

The Wordgard-inspired prototype retained one keyed DOM block per model block
and patched visible text imperatively outside React. The production Plite
baseline used the existing virtualized React renderer. Both ran in local
headless Chromium at a 1280 × 720 viewport.

## Selected metric and budgets

The selected decision metric was 10,000-block visible-block
update-to-paint p95.

| Gate | Budget | Result | Pass |
| --- | ---: | ---: | --- |
| Update-to-paint p95 improvement | at least 20% | 0.57% | no |
| Added DOM nodes | at most 5% | 3,135.11% | no |
| Correctness failures | 0 | 6 owner gaps | no |

At 1,000 blocks, p95 moved from 18.0 ms to 16.8 ms while DOM nodes grew from
318 to 1,319. At 10,000 blocks, p95 moved from 17.6 ms to 17.5 ms while DOM
nodes grew from 319 to 10,320. The 10,000-block retained tree also took
108.2 ms to build.

The machine-readable artifact is
[`benchmark.json`](./benchmark.json).

## Correctness gate

The prototype deliberately exposed the architecture it would still need to
own. It had no:

- editable event ownership;
- model-to-DOM selection mapping;
- IME or composition preservation;
- clipboard fitting or exact-slice transport;
- history or collaboration integration;
- schema, decoration, void, or custom-renderer parity.

These are product invariants, not polish work. A retained renderer must beat
the selected metric after implementing them, not before.

## Cohorts and interactions

| Cohort | Size | Result |
| --- | ---: | --- |
| Normal | at most 500 blocks | Existing renderer retained; no renderer rewrite justified |
| Large | 1,000 blocks | 6.67% p95 improvement with 314.78% DOM growth |
| Stress | 10,000 blocks | 0.57% p95 improvement with 3,135.11% DOM growth |
| Pathological | marks, decorations, voids, custom renderers, IME | Rejected at correctness gate before a misleading speed comparison |

The tested interaction was a visible first-block text update after initial
render. Selection movement, composition, paste, undo/redo, collaboration,
decorations, voids, custom block renderers, and multi-root editing remain
mandatory interactions for any future renderer proposal.

## Memory, degradation, and field evidence

DOM-node count is the authoritative retained-resource signal for this
prototype. Chromium reported no useful heap delta in this run, so heap is
recorded as unavailable rather than treated as zero allocation. The required
degradation contract remains virtualized rendering: large documents keep DOM
ownership proportional to the visible window instead of total model size.

This is a local lab decision, not Core Web Vitals or RUM evidence. No field
trace exists for the prototype. That evidence gap cannot reverse a three-gate
failure; it only limits claims about production user latency.

## Performance-rule applicability

- Applied: repeated-unit analysis with the document block as the repeated
  unit, explicit cohorts, p50/p95/p99, DOM retention, interaction coverage,
  degradation behavior, and a falsifiable adoption gate.
- Skipped: Vercel React micro-optimization rules. The experiment tested a
  renderer ownership rewrite, not a component-level optimization, and no
  micro-tactic was adopted.
- Extra rules used: retained DOM growth and missing native editing ownership
  were hard gates because editor correctness and memory scale dominate a
  frame-floor microbenchmark.

## Recommendation

Keep Plite's virtualized React renderer. Do not transplant Wordgard's retained
tile tree. Revisit only with an editable, selection-correct, IME-correct
prototype that preserves virtualization and clears the same budgets.
