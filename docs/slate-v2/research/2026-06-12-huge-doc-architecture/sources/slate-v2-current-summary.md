# Slate v2 Current Summary

Slate v2 already has the right architecture direction for rich text:

- The huge-document example exposes `auto`, `full`, `staged`, and
  `virtualized` strategies with estimated block size, overscan, threshold, and
  bounded editor height
  (`.tmp/slate-v2/site/examples/ts/huge-document.tsx:47-58`,
  `.tmp/slate-v2/site/examples/ts/huge-document.tsx:177-190`).
- `useVirtualizedRootPlan()` owns scroll root detection, native-scrollbar drag
  overscan, selected endpoint retention, layout/page item size maps,
  missing-range extraction, and scroll-to-path behavior
  (`.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:37-62`,
  `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:340-455`,
  `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:620-706`).
- Missing ranges register DOM coverage boundaries with model copy and
  materialized selection policy
  (`.tmp/slate-v2/packages/slate-react/src/dom-strategy/virtualized-range-boundary.tsx:23-63`).
- Existing browser tests cover virtualized dynamic-height backward scroll,
  internal scrollbar row stacking, and native-scrollbar drag buffering
  (`.tmp/slate-v2/playwright/integration/examples/huge-document.test.ts:2506-2689`).

Promoted change:

Add `huge-document-virtualized-scroll-stability` to `slate-browser` first-party
operation families so the proof is discoverable by the supervisor instead of
being buried as route-local Playwright logic.

