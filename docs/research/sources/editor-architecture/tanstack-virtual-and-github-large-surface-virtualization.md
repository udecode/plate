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
- Live `.tmp/slate-v2` source read on 2026-05-03.

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

Current live `.tmp/slate-v2` source has:

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
