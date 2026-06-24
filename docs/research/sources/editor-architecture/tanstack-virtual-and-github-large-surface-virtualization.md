---
type: source-summary
status: draft
date: 2026-05-03
source_family: tanstack-virtual github-diff-performance
---

# TanStack Virtual and GitHub Large-Surface Virtualization

## Scope

Evidence for the Slate v2 virtualization planning lane.

Sources:

- GitHub Engineering, "The uphill climb of making diff lines performant",
  pasted by the user on 2026-05-03.
- TanStack Virtual official docs queried through Context7 on 2026-05-03.
- Live `Plate repo root` source read on 2026-05-03.
- TanStack Blog, "TanStack Virtual just got a lot faster, and finally handles
  iOS", published 2026-05-19 and read on 2026-05-23.
- TanStack Virtual latest Virtualizer API docs, read on 2026-05-23.

## 2026-05-23 TanStack Virtual Perf And iOS Update

Latest upstream facts:

- `@tanstack/react-virtual@3.13.25` depends on
  `@tanstack/virtual-core@3.15.0`.
- The 2026-05-19 release keeps the public `VirtualItem[]` shape but moves the
  common single-lane hot path onto flat `Float64Array` storage with lazy
  `VirtualItem` materialization.
- `resizeItem` / dynamic-measurement storms are fixed by internal cache version
  tracking instead of cloning the whole size cache.
- iOS WebKit momentum scroll is now handled inside TanStack Virtual by
  deferring scroll position writes while touch/momentum/elastic overscroll is
  active.
- Backward-scroll jank for dynamic heights is fixed by default: above-viewport
  size adjustments are skipped while scrolling backward unless the consumer
  overrides `shouldAdjustScrollPositionOnItemSizeChange`.
- `takeSnapshot()` plus `initialMeasurementsCache` and `initialOffset` is the
  upstream restoration path for remounting a measured virtual list without
  throwing away known item sizes.

Current live Slate v2 facts on 2026-05-23:

- `slate-react` depends on `@tanstack/react-virtual` with range
  `^3.13.24`.
- The lockfile currently resolves `@tanstack/react-virtual@3.13.24` and
  `@tanstack/virtual-core@3.14.0`, so the latest iOS/backward-scroll/core
  fast-path release is not actually installed yet.
- `useVirtualizedRootPlan` uses the single-lane path, stable runtime-id item
  keys, `rangeExtractor`, `measureElement`, and Slate-owned missing-range /
  DOM coverage policy.
- `useVirtualizedRootPlan.scrollToTopLevelIndex` bypasses TanStack for
  layout-backed targets by calling `rootElement.scrollTo(...)` directly. That
  loses the new iOS scroll-write deferral path for that branch.

Slate decision update:

- Upgrade `@tanstack/react-virtual` in `Plate repo root` so the lockfile reaches
  `3.13.25` / `virtual-core@3.15.0`.
- Do not expose TanStack options in public Slate API. The existing Slate-shaped
  `domStrategy={{ type: 'virtualized', threshold, overscan,
  estimatedBlockSize }}` boundary remains correct.
- Do not override `shouldAdjustScrollPositionOnItemSizeChange` by default. The
  new upstream default is the behavior Slate wants for dynamic-height backward
  scroll.
- Keep `lanes` unused. Slate's top-level block virtualization wants the
  single-lane fast path.
- Route internal programmatic virtualized scroll writes through
  `virtualizer.scrollToOffset` / `virtualizer.scrollToIndex` where practical,
  rather than direct `rootElement.scrollTo`, so Slate inherits upstream iOS
  scroll semantics.
- Consider `takeSnapshot()` only as an internal remount/restoration
  optimization for large docs. Do not add a public Slate API until a real
  remount-jump problem is proven.

## GitHub Diff Lessons

GitHub did not jump straight to virtualization. The sequence matters:

1. reduce repeated-unit cost first;
2. simplify component trees;
3. delegate events through a top-level handler;
4. move rare state into conditional children;
5. convert repeated lookup paths to O(1) maps;
6. use virtualization for the p95+ tail where even cheap rows are too many.

The reported shape:

- v1 diff line: many DOM nodes, React components, and event handlers.
- v2 diff line: fewer wrappers, fewer components, delegated events, less state.
- p95+ pull requests: TanStack Virtual reduced DOM/heap pressure and INP.

Slate implication:

- TanStack Virtual is good evidence for viewport range management at extreme
  scale.
- It is not evidence that editable rich text can make the default DOM
  incomplete without a selection/copy/paste/IME/a11y policy.

## TanStack Virtual API Facts

TanStack Virtual provides a headless viewport range engine:

- required: `count`, `getScrollElement`, `estimateSize`;
- important: `overscan`, `getItemKey`, `rangeExtractor`, `measureElement`,
  `onChange`, `scrollToIndex`;
- dynamic height rows need `data-index` and `virtualizer.measureElement`;
- stable item keys should come from a stable item id instead of raw index when
  rows can reorder;
- custom range extraction can force extra indexes to stay mounted;
- window scrolling needs `scrollMargin` and adjusted transforms.

Slate implication:

- use runtime ids as virtual item keys;
- use `measureElement` for variable block heights;
- use `rangeExtractor` or a Slate-side corridor rule to retain caret,
  composition, selection, and materialization targets;
- do not leak TanStack positioning assumptions into Slate's public editor API.

## Live Slate v2 Current Shape

Current live `Plate repo root` source has:

- `renderingStrategy` public prop with `full`, `staged`, `shell`, and
  `virtualized` effective types;
- `@tanstack/react-virtual` as a `slate-react` runtime dependency;
- a TanStack-backed `useVirtualizedRootPlan` using `useVirtualizer`,
  runtime-id item keys, dynamic measurement, retained selected/promoted
  indexes, and coalesced missing viewport ranges;
- an experimental `type: 'virtualized'` option in
  `packages/slate-react/src/rendering-strategy/create-segment-plan.ts`;
- `DOMCoverageReason = 'viewport-virtualization'` in
  `packages/slate-dom/src/plugin/dom-coverage.ts`;
- hidden viewport-range `DOMCoverageBoundary` registration in
  `packages/slate-react/src/rendering-strategy/virtualized-range-boundary.tsx`;
- virtualized-mode package tests in
  `packages/slate-react/test/rendering-strategy-and-scroll.tsx`;
- a full browser example in
  `site/examples/ts/rendering-strategy-runtime.tsx`;
- docs warning that virtualized native browser find and screen-reader traversal
  do not cover unmounted regions until mounted.

Current gap:

- virtualization works, but its public option types, render branch,
  materialization handler, metrics, shell fallback, and keyboard classification
  are still spread through shared shell/staged rendering files;
- `previewChars` still appears in the virtualized option union even though
  viewport virtualization does not render shell previews;
- `RenderingStrategySegmentShell` can still register
  `viewport-virtualization` boundaries, which keeps shell and virtualized policy
  coupled.

## Planning Decision

Use TanStack Virtual as a viewport range engine for experimental virtualized
mode only. Do not let it own Slate's editor semantics, and keep the
virtualized adapter visibly decoupled from shell/staged rendering internals.

The Slate-owned layers remain:

- `DOMCoverageBoundary`;
- materialization policy;
- model-backed copy/paste policy;
- selection import/export;
- IME and mobile guards;
- metrics and degradation classification.

The TanStack-owned layer is only:

- visible index range;
- measured item sizes;
- overscan and scroll alignment;
- optional custom retained indexes.
