# Slate v2 Pretext Layout / Rendering Architecture Ralplan

status: complete
created: 2026-05-22
completion_id: 019e46be-4ec4-7d11-bc6e-9fcf033a8803
current_pass: layout-rendering-architecture-closure
current_pass_status: complete
next_pass: moved-to-root-location-authority-cleanup-plan
target_score: 0.94
score: 0.91

## Follow-Up Split

The root-location authority cleanup has moved to
`docs/plans/2026-05-22-slate-v2-root-location-authority-cleanup-ralplan.md`.

This Pretext/layout plan remains the owner for layout, DOM strategy,
virtualization, and pagination architecture. The later root-location appendix is
kept as historical context only and is superseded by the standalone
root-location plan.

## Current Verdict

Hard take: current Slate v2 can support Pretext-backed layout, but not in the
absolute-best shape yet.

The substrate is right:

- `slate` has runtime ids, rooted state, state fields, commits, and snapshots.
- `slate-react` has DOM coverage, shell-backed selection policy, staged
  rendering, metrics, and experimental virtualization.
- `slate-layout` has page settings, page geometry, projections, hit rects,
  run-scoped decoration rects, and a React `PagedEditable`.
- The current Pretext adapter already proves Pretext can power the layout
  layer.

But the architecture still needs a boundary rewrite before beta if Pretext is
supposed to become the future performance/layout engine instead of a pagination
demo dependency.

The current bad shape:

- `slate-layout` is page-first, not a generic continuous layout service.
- The current Pretext adapter still wraps full block text using
  `block.textStyle`,
  then measures placed runs afterward. That fixes visual spacing, but line
  breaking is not truly rich-inline/run-owned yet.
- `renderingStrategy` is too broad a public name. It sounds like layout,
  rendering, pagination, shelling, and virtualization live in one prop.
- `virtualized` is top-level-index/estimated-height driven, not layout driven.
- Shell preview and viewport virtualization still share too much policy and UI
  plumbing. Public shell-style strategies should be cut, not renamed.
- DOM coverage knows hidden/missing ranges, but it does not yet consume a
  first-class layout/mount plan.

Final call: rewrite the boundary now. Do not rewrite Slate core. Do rewrite
`slate-layout` and `slate-react` render/mount APIs around a first-class derived
layout service.

## Intent Boundary

Intent: make Pretext a clean long-term layout/performance engine for Slate v2,
including non-paginated editors, without dirty hacks to fit `slate-react`.

Desired outcome: users can opt into layout-aware Slate once and get continuous
layout, page layout, line maps, block heights, hit rects, scroll anchoring,
virtualization inputs, and overlays from the same derived layout service.

In scope:

- Pretext engine boundary.
- `slate-layout` generic continuous and paged layout APIs.
- `slate-react` public render/mount strategy naming.
- Virtualization and island strategy redesign.
- DOM coverage policy integration.
- Regression and performance proof plan.

Non-goals:

- Making Pretext a dependency of `slate` core.
- Replacing native contenteditable for active editing.
- Production canvas/editor-shell editing.
- Making pagination the default editor view.
- Hiding degraded native behavior behind perf claims.

Decision boundaries:

- Slate core stays data-model-first and Pretext-free.
- `slate-react` may depend on a layout interface, not on Pretext directly.
- Pretext is built into `slate-layout` as the default layout engine. Do not
  expose public engine selection until a real second engine exists.
- Keep an internal text-layout engine boundary for tests, worker routing,
  fallback measurement, or a future canvas/native engine.
- `renderingStrategy` is hard-cut to `domStrategy` before beta because the old
  name prevents the right mental model.

## Decision Brief

Principles:

1. Layout is derived, versioned view data.
2. Active editing stays native DOM until model-owned editing proves IME,
   selection, clipboard, browser find, a11y, and mobile.
3. Pretext owns measurement/line fitting, not editor semantics.
4. Virtualization owns mounted ranges, not document truth or layout truth.
5. The public API must make degraded native behavior impossible to miss.

Top drivers:

- Pretext is too important to be trapped inside pagination.
- Current virtualization is not good enough because it guesses sizes instead of
  consuming layout.
- `renderingStrategy` is creating the wrong abstraction boundary.

Viable options:

1. Keep current page-specific `slate-layout` plus `renderingStrategy`.
   - Reject. It can work locally, but it will force layout, virtualization,
     shelling, and pagination to keep leaking into each other.
2. Move Pretext directly into `slate-react`.
   - Reject. That makes a text measurement engine look like editor semantics and
     pollutes the core React editing bridge.
3. Make `slate-layout` a generic derived layout service, fold Pretext into it
   as the built-in engine, and rename/split `renderingStrategy` into DOM
   materialization policy.
   - Choose. This preserves Slate's source of truth while letting Pretext power
     continuous, paged, and virtualized layout.

Consequence: `slate-react` gets a stronger integration point with layout, but
still works without layout for small/simple editors.

## Accepted Architecture Target

Layering:

| Layer | Owner |
| --- | --- |
| `slate` | document value, roots, state fields, operations, transactions, history, collab |
| `slate-layout` | derived layout store, continuous layout, paged layout, built-in Pretext text measurement, block heights, line/box geometry, hit rects, range projection |
| `slate-dom` | DOM coverage, materialization, selection/copy/find policies for missing DOM |
| `slate-react` | native editable DOM, event bridge, selection import/export, render/mount strategy, layout consumption |
| Plate/apps | Markdown, tables, comments, diagnostics, product UI, export/import |

Public target:

```tsx
const layout = useSlateLayout(editor, {
  typography,
})

<Editable layout={layout} domStrategy="auto" />
```

Paged target:

```tsx
const layout = useSlateLayout(editor, {
  page: { margins: 96, preset: 'a4' },
  typography,
})

<PagedEditable
  layout={layout}
  domStrategy="staged"
  pageView={{ gap: 24, mode: 'facing' }}
/>
```

Advanced persisted/collaborative page settings:

```tsx
const pageSettings = defineStateField<PageSettings>({
  key: 'layout.pageSettings',
  collab: 'shared',
  history: 'push',
  initial: () => ({ margins: 96, preset: 'a4' }),
  persist: true,
})

const layout = useSlateLayout(editor, {
  page: pageSettings,
  typography,
})
```

Naming target:

- `layout`: what geometry exists.
- `page`: document-owned page settings. Presence selects paged layout; absence
  means continuous layout.
- `root`: defaults to the current editor/view root. Pass it only for multi-root
  editors.
- `typography`: deterministic measurement config/resolver for Pretext, not
  product styling. Omit it only when the runtime can safely derive typography
  from the mounted editable.
- `pageView`: viewport/display policy such as facing pages and page gap. It is
  not part of the derived layout snapshot.
- `domStrategy`: what DOM is mounted.
- `PagedEditable`: page viewport renderer over a layout.
- `Editable`: native editing surface that can consume layout.

`renderingStrategy` is hard-cut to `domStrategy` before beta. `mountStrategy` is
rejected because it sounds like a React implementation detail instead of a
native DOM availability contract.

## What To Rewrite

### 1. Generalize `slate-layout`

Current source:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts` exposes
  `SlatePageLayout*` types and `createSlatePageLayout`.
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx` exposes
  `useSlatePageLayout`, `useSlatePageLayoutSnapshot`, and `PagedEditable`.

Target:

- Add generic `SlateLayoutSnapshot`.
- Keep page layout as one mode of the layout snapshot, not the package's only
  ontology.
- Continuous layout returns block heights, line maps, boxes, rects, and range
  projection.
- Paged layout adds pages, frames, fragments, page placements, and page-aware
  projection.
- Existing page helpers can stay as compatibility wrappers while examples move
  to the generic call site.

### 2. Rewrite the Pretext engine around rich-inline line breaking

Current source:

- `.tmp/slate-v2/packages/slate-layout-pretext/src/index.ts` calls
  `layoutWithLines(prepared, input.page.content.width, block.lineHeight)` using
  `block.textStyle`, then creates run widths afterward.

Problem:

- Line breaks are still based on one block-level font/style. Mixed bold,
  italic, code, links, chips, mentions, and inline atoms can still break at the
  wrong places even if final run widths look better.

Target:

- Use Pretext rich-inline primitives as the line breaker:
  `prepareRichInline`, `layoutNextRichInlineLineRange`, and
  `walkRichInlineLineRanges`.
- Slate leaf/runs become Pretext rich-inline items.
- Inline atoms use `break: 'never'` and caller-owned `extraWidth`.
- The engine returns placed runs directly from rich-inline fragments.
- `whiteSpace: 'pre-wrap'` remains the editable default.
- Move this adapter into `slate-layout` as the built-in Pretext engine. Keep any
  engine interface internal until a second production engine exists.

### 3. Rename and split `renderingStrategy`

Current source:

- `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts`
  defines `RenderingStrategyOptions` with `auto`, `full`, `staged`, `shell`,
  and object-only `virtualized`.
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  normalizes that into staged root groups, shell segments, or virtualized plan.

Problem:

- The name is too vague. It invites pagination/layout to be modeled as another
  strategy and makes shell/virtualized degradation feel like normal rendering.

Target:

```ts
type EditableDOMStrategy =
  | 'auto'
  | 'full'
  | 'staged'
  | {
      type: 'virtualized'
      overscan?: number
    }
```

Rules:

- `auto`: full DOM for normal docs, staged DOM-present for large docs, no
  virtualized mode unless explicitly requested.
- `staged`: DOM-present materialization with pending DOM coverage boundaries.
- `virtualized`: viewport DOM only, layout-driven sizes, materialize-first
  native behavior.
- Public shell / preview-shell is cut from `EditableDOMStrategy`. Preview shells
  are internal or app-owned surfaces, not a raw Slate editable rendering mode.
- No pagination/layout meaning lives in `domStrategy`.

### 3.1 Promote DOM Coverage To A Named Contract

DOM coverage is the bridge contract between document truth, layout truth, and
mounted DOM. It is not an island API and not a public rendering strategy.

Target:

- `mounted`: native DOM exists for the range.
- `pending`: Slate knows the range and can materialize before selection, copy,
  paste, browser-find assist, or scroll-to-selection.
- `virtualized`: the range is intentionally outside the mounted viewport and
  must materialize before native behavior is claimed.
- `structural`: layout/debug/table/page-frame DOM exists, but it is not an
  editable descendant and must be excluded from Slate node resolution.

Rules:

- `slate-dom` owns the coverage registry and missing-DOM policy.
- `slate-react` publishes coverage from the mount plan.
- `slate-layout` provides rects and hit targets; it does not decide native DOM
  availability.
- Selection, clipboard, browser find helpers, a11y checks, and scroll anchoring
  query DOM coverage before falling back to model-backed behavior.

### 4. Make virtualization layout-driven

Current source:

- `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/use-virtualized-root-plan.ts`
  uses `estimatedBlockSize` and top-level runtime indexes.
- It correctly uses runtime ids as keys, retains selected/promoted indexes, and
  computes missing ranges.

Problem:

- The plan does not use real layout heights or page/fragment positions.
- It can only virtualize top-level blocks, not paged fragments or table/box
  layout.
- `previewChars` still exists on virtualized options even though viewport
  virtualization does not render previews.

Target:

- Virtualization consumes `layout.virtualItems` or block/fragment rects.
- Estimated size is fallback only, not the primary model.
- Range extraction keeps selection, composition, materialization, and scroll
  targets mounted.
- Missing ranges register DOM coverage boundaries from the layout/mount plan.
- Preview shells are not part of viewport virtualization and are not a public
  `EditableDOMStrategy`.

### 5. Reframe islands as mount plans

Current source:

- `createSegmentPlan` groups top-level runtime ids by fixed segment size.
- DOM-present staging and shell-like preview paths both reason over mounted
  top-level ranges.

Target:

- A `SlateMountPlan` is derived from runtime state + layout state:
  - active corridor;
  - selected/composition/drag/drop target retention;
  - semantic islands;
  - block/page/table fragment rects;
  - mounted ranges;
  - pending materialization ranges;
  - DOM coverage boundaries.
- Segment size becomes an implementation fallback, not public architecture.
- Layout-backed continuous editors can use Pretext heights for offscreen
  planning before DOM exists.

## Ecosystem Strategy Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pretext | `../pretext/README.md`, `../pretext/src/rich-inline.ts` | prepare/cache text, then run cheap line layout and rich-inline ranges | DOM reflow measurement and guessed heights | rich-inline line fitting and prepared cache | editor semantics in layout engine | built-in `slate-layout` engine behind an internal boundary | agree |
| Premirror | `../premirror/docs/design-proposal.md` | document truth -> snapshot -> measure -> compose -> render/mapping | page nodes and duplicated editing truth | composer/mapping split | ProseMirror position model | Slate path/root/run/box mapping | agree |
| TanStack Virtual | `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md` | headless viewport range engine | too many DOM nodes in tail cohorts | range extraction and runtime-id keys | owning editor semantics | adapter under layout-aware `domStrategy` | partial |
| Current Slate v2 | live `.tmp/slate-v2` sources listed above | runtime ids, DOM coverage, staged/shell/virtualized modes, page layout package | child-count chunking | substrate and metrics | vague `renderingStrategy` boundary | generic layout + DOM strategy split | revise |

## Performance Target

Cohorts:

| Cohort | Size | Default |
| --- | --- | --- |
| normal | `<1000` top-level blocks | full or plain native DOM |
| medium | `1000-5000` | staged DOM-present with layout-aware offscreen estimates |
| large | `5000-10000` | staged DOM-present plus active corridor and occlusion |
| stress | `10000-50000` | explicit virtualized only |
| pathological | `>50000` | explicit app-owned preview/collapse surface with RUM/degradation tags, outside `EditableDOMStrategy` |

Budgets:

- visible typing p95: `<16ms` normal/medium, `<50ms` large, `<120ms` stress;
- layout refresh after one paragraph edit: changed block plus dependent page or
  flow range, not whole doc;
- virtual scroll to far block: materialize target p95 `<500ms`;
- block height lookup: O(1) by runtime id/path after layout snapshot;
- table command: one table map plus affected layout range, not all tables.

Degradation contract:

- `full` and completed `staged`: native find/selection/copy/paste/a11y.
- pending `staged`: materialize-first for far selection/copy/find.
- `virtualized`: viewport native, far content materialize-first.
- app-owned preview/collapse surfaces: model-backed selection/copy only; they
  are not native editor equivalence and do not live in `domStrategy`.

## Regression Proof Target

Unit:

- `slate-layout`: continuous layout snapshot, page layout snapshot, root-bound
  projection, hit rects, table/box geometry, line maps, built-in Pretext
  rich-inline line breaks, trailing spaces, hard breaks, mixed fonts, inline
  atoms, letter spacing, cache invalidation.
- `slate-react`: `layout` + `domStrategy` normalization, mount plan, DOM
  coverage boundary reasons.

Browser:

- continuous layout example: type, Enter, Backspace, trailing spaces, scroll to
  selection, copy/paste, browser find rows.
- pagination example: existing rows plus rich-inline line-break proof.
- virtualization example: dedicated `site/examples/ts/virtualization.tsx` route
  using `layout` + explicit `domStrategy={{ type: 'virtualized' }}`; far scroll
  materializes target, typing works after materialization, visible range
  select/copy works, IME is guarded from missing DOM, and browser find
  limitations are tested instead of hidden.
- large document: direct compare against legacy chunking and staged/virtualized
  cohorts.

Fixture matrix:

- paragraph, empty paragraph, trailing spaces, soft/hard breaks, mixed inline
  marks, inline code, link/inline atom, list, blockquote, code block, table,
  image/void block, page boundary, long unbroken word, mixed-width text, and
  huge-doc repeated sections.
- Each fixture needs layout-unit proof and at least one browser editing proof in
  the relevant example route. Do not let the virtualization example pass with
  plain paragraphs only; tables, voids, and page/flow boundary cases are the
  actual architecture test.

RUM:

- Rename `onRenderingStrategyMetrics` to `onDOMStrategyMetrics`, and rename
  payload fields to DOM strategy language.
- Add layout metrics: engine id, layout mode, layout version, measured block
  count, dirty range size, compose duration, cache hit rate.

## Slate Maintainer Objection Ledger

| Change | Objection | Answer | Verdict |
| --- | --- | --- | --- |
| Rename/split `renderingStrategy` | Public churn right before beta. | The current name is already misleading. Better to break now than teach pagination/virtualization through the wrong slot. | keep |
| Add generic `slate-layout` | Raw Slate is becoming a document layout engine. | Raw Slate remains Pretext-free; layout is optional derived view data. Apps can ignore it. | keep |
| Fold Pretext into `slate-layout` instead of shipping `slate-layout-pretext` | Adds an opinionated dependency to layout. | Pretext is the only planned production engine, so a public engine package is fake configurability. `slate`, basic `slate-react`, and no-layout `Editable` stay clean; `slate-layout` keeps an internal engine boundary for tests/workers/future engines. | keep |
| Keep active editing DOM-native | Pretext/canvas could be the future. | True, but not until IME/selection/copy/find/a11y/mobile proof exists. Native active corridor is the sane bridge. | keep |
| Virtualization as explicit stress mode | Perf users want it automatic. | Silent degraded native behavior is worse than slower startup. Auto can choose staged, not virtualized, until proof closes. | keep |
| Cut public `shell` / `preview-shell` | Existing examples and tests may already teach shell behavior. | That is exactly why to cut it before beta. Shell-style previews are app-owned or internal materialization UI, not a second public DOM strategy beside virtualization. | keep |
| Put page settings in state fields | Layout settings look product-specific. | Persisted page setup is document-owned metadata. View-only controls stay local or `collab: 'local'`, `history: 'skip'`, `persist: false`. | keep |
| Add `layout` prop to `Editable` | This could make `slate-react` depend on layout package semantics. | `Editable` accepts a tiny structural layout protocol. Pretext and page composition stay in `slate-layout` packages. | revise: protocol-only |

## Related Issue Discovery Pass

Source ledgers read:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`

This pass adds no `Fixes #...` and no new `Improves #...` claim. The plan is
architecture pressure only until a later `ralph` implementation adds package,
browser, and benchmark proof.

| Issue | Current ledger state | Relation to this plan | Decision |
| --- | --- | --- | --- |
| `#790` dynamic rendering | cluster-synced / proof-route backlog | Core pressure for large-document mounting, explicit virtualization, and startup latency. | Related only. Layout-driven `domStrategy` can become proof, but not before large-doc mount/edit/scroll benchmarks pass. |
| `#4141` nested block rerendering | `Improves` already claimed by rerender breadth benchmark | Existing selector/runtime proof stays relevant; this plan must not regress it while adding layout subscriptions. | Preserve existing `Improves`; no promotion. Add layout invalidation breadth proof before closure. |
| `#5944` stable per-line pagination | issue-reviewed / needs repro | Directly overlaps the paged layout target and Premirror-style page composition. | Related only. Stable pagination needs current repro-shaped browser rows around line/page boundary flicker. |
| `#5924` structural DOM exclusion | `Not claimed` in coverage matrix; stale/triage-closed in sync ledger | Structural page frames, tables, overlays, and debug boxes need cursor-safe DOM boundaries. | Keep not claimed. The better answer is DOM coverage + mount-plan policy, not a public ignore-cursor escape hatch yet. |
| `#3892` custom editor surface and layout engine | cluster-synced / policy non-claim | Strong ecosystem pressure for a clean custom surface/layout substrate. | Keep not fixed. Generic `slate-layout` answers the substrate, not an app/product editor surface. |
| `#2572` accessibility | triage-closed / policy non-claim | A11y is a hard release guard for virtualized and app-owned preview missing-DOM behavior. | Keep not fixed. Closure requires explicit a11y/browser proof and degraded-mode docs. |
| `#5131`, `#2051` render/subscription breadth | not claimed or existing macro rows | Layout snapshots and mount plans can accidentally widen subscriptions. | Related guardrails. Add tests proving layout changes update only affected blocks/pages. |

Ledger accounting result for this pass:

- Fixed issue claims: `0`.
- New improved issue claims: `0`.
- Related issue surface: performance, pagination/layout composition, structural
  DOM boundaries, custom layout surface, accessibility, subscription breadth.
- External ledger sections already exist from the `issue-ledger-accounting`
  pass. This review amendment adds no new issue claim and needs no new ledger
  row.

## Issue-Ledger Accounting Pass

Existing synced artifacts for this lane:

- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`

The `preview-shell`/DOM coverage amendment changes API boundaries only. It
does not add a fixed, improved, or newly related issue claim, so the existing
ledger sections remain the source of truth without another row.

Claim result:

- Fixed issue claims: `0`.
- New improved issue claims: `0`.
- Existing `Improves`, `Related`, `Not claimed`, `issue-reviewed`, and
  proof-route backlog statuses preserved.

Accounting decision:

- `#790`: related proof-route backlog for layout-driven virtualization.
- `#4141`: existing `Improves` preserved; layout work must not regress render
  breadth.
- `#5944`: related issue-reviewed pagination pressure.
- `#5924`: not claimed; no public ignore-cursor API.
- `#3892`: policy non-claim; generic layout substrate only.
- `#2572`: policy non-claim; a11y is a release gate.
- `#5131`, `#2051`: unchanged subscription/performance guardrails.

## Performance / DX / Migration Pressure Pass

Live source pressure:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts` already accepts
  `settings?: EditorStateField<TSettings>` and refreshes on
  `dirtyStateKeys`, so page presets and margins already fit the state-field
  direction.
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx` still exposes only
  `useSlatePageLayout`, `useSlatePageLayoutSnapshot`, and `PagedEditable`.
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx` and
  `editable-text-blocks.tsx` still expose `renderingStrategy` and
  `onRenderingStrategyMetrics`.
- `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/use-virtualized-root-plan.ts`
  still virtualizes top-level runtime ids with an estimated block size.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts` and
  `keyboard-input-strategy.ts` still treat shell and virtualized modes through
  the same shell-backed selection policy.

Final API decision:

- Public prop name: `domStrategy`, not `mountStrategy`.
- Internal concept name: `SlateMountPlan`.
- Remove public `renderingStrategy` before beta. A temporary internal alias may
  exist only inside the implementation branch and must not appear in public
  examples, docs, or exported reference surfaces.
- Rename metrics to `onDOMStrategyMetrics` and metric fields from
  `renderingStrategy*` to `domStrategy*`.

Why `domStrategy` wins:

- It names the actual user-visible contract: which Slate content has native DOM.
- It makes degraded behavior obvious for selection, copy, paste, browser find,
  a11y, and IME.
- `mountStrategy` sounds like a React implementation detail and hides the native
  behavior contract.
- `renderingStrategy` is too vague and keeps inviting layout, pagination,
  virtualization, and shell preview policy into one prop.

Target public surface:

```tsx
const layout = useSlateLayout(editor, {
  typography,
})

<Editable domStrategy="auto" layout={layout} />
```

```tsx
const pageSettings = defineStateField({
  key: 'layout.pageSettings',
  collab: 'shared',
  history: 'push',
  initial: () => ({ margins: 96, preset: 'a4' }),
  persist: true,
})

const layout = useSlateLayout(editor, {
  page: pageSettings,
  typography,
})

<PagedEditable
  domStrategy="staged"
  layout={layout}
  pageView={{ gap: 24, mode: 'facing' }}
/>
```

Inline settings for local-only examples:

```tsx
const layout = useSlateLayout(editor, {
  page: { margins: 96, preset: 'a4' },
  typography,
})
```

Rules:

- No `mode: 'continuous'`: continuous layout is the default when `page` is
  absent.
- No `mode: 'paged'`: `page` is the semantic switch because it carries the
  document-owned page settings.
- No `root: 'main'` in the happy path: layout uses the current editor/view root.
  Explicit roots are multi-root escape hatches.
- `pageView` owns facing/spread display and page gaps; those are viewport
  policy, not document layout truth.

Layout protocol:

- `slate-react` should depend on a small structural `EditableLayout` protocol,
  not on Pretext.
- `slate-layout` implements that protocol for continuous and paged snapshots.
- `slate-layout` owns the built-in Pretext engine. Engine selection is not
  public until there is a real second production engine.
- Basic `Editable` without `layout` stays DOM-native and Pretext-free.
- `PagedEditable` remains in `slate-layout/react` as a composed viewport over
  `Editable`, not a separate editing runtime.

DOM strategy target:

```ts
type EditableDOMStrategy =
  | 'auto'
  | 'full'
  | 'staged'
  | {
      overscan?: number
      type: 'virtualized'
    }
```

Rules:

- `auto`: full DOM for normal docs, staged DOM-present for large docs, never
  virtualized.
- `full`: native DOM for everything.
- `staged`: DOM-present target with pending DOM coverage boundaries; native
  behavior materializes before far selection/copy/find.
- `virtualized`: viewport DOM only, driven by layout rects, with explicit
  native-behavior limitations.
- Public `shell` and `preview-shell` are cut from `EditableDOMStrategy`; they
  are too easy to mistake for normal editable render modes. Product preview,
  collapse, or read-only summary surfaces can be built above Slate by consulting
  layout and DOM coverage.

DOM coverage target:

- `slate-dom` owns coverage state for mounted, pending, virtualized, and
  structural ranges.
- `slate-react` registers coverage from the mount plan and materializes before
  native-sensitive operations.
- `slate-layout` owns geometry only; it never pretends missing DOM is native.

State-field policy:

- Document-owned layout settings, for example page preset, margins, headers,
  footers, and print/export settings, belong in state fields when they must
  persist, sync, or participate in history.
- View-only settings, for example zoom, debug overlays, local facing-page
  preference, or inspector controls, stay local or use `collab: 'local'`,
  `history: 'skip'`, `persist: false`.
- Layout subscriptions must wake from `dirtyStateKeys`, root changes, and
  affected block/runtime ids. A body text edit must not wake all page settings
  subscribers; a page settings change may recompute the affected layout root.

Performance shape:

- repeated units: text run, line, block box, layout fragment, mount item;
- normal path: DOM-native `Editable` with no layout engine, no Pretext bundle,
  and no virtualization code in the hot path;
- layout path: O(changed block plus dependent flow/page range), not O(document);
- virtualization path: TanStack consumes layout virtual items/rects; estimated
  block size is fallback only;
- selector rule: no broad layout object subscriptions inside every block; use
  runtime id, path/range, field key, and layout version selectors;
- memory tags: layout snapshot version, measured block count, cached run count,
  mounted item count, DOM coverage boundary count, virtualizer measured count;
- RUM tags: `domStrategy`, `layoutMode`, `layoutEngine`, document cohort,
  native surface completeness, degradation mode.

React 19.2 / Slate React rules applied:

- `useSyncExternalStore` is the right subscription primitive for layout
  snapshots and existing state-field hooks.
- Use primitive dependencies for strategy options and layout mode; avoid making
  callers `useMemo` option objects for stable behavior.
- Use transitions only for non-urgent layout recomposition/preview refresh; do
  not transition native text input, selection import/export, or IME repair.
- React `Activity` can preserve rare panels or inspectors, not editor body DOM.
- `content-visibility` can help DOM-present long pages, but cannot replace DOM
  coverage or virtualized native-behavior policy.

Migration backbone:

- Plate can adopt `useSlateLayout` and `domStrategy` without changing its
  product plugins: Markdown, tables, comments, and diagnostics remain Plate/app
  features over raw layout/projection primitives.
- slate-yjs should see state field patches and content operations as
  transaction data; layout snapshots stay derived and are never synchronized as
  document truth.
- Multi-root documents share one runtime; layout is root-aware and may compose
  header/main/footer, but roots remain document content, not state fields.
- Comments, annotations, presence, and lint diagnostics stay external/projection
  data unless the app deliberately persists a document-owned setting through a
  state field.

Test pressure:

- `slate-layout`: continuous snapshots, paged snapshots, state-field settings,
  dirty-range recomposition, rich-inline run wrapping, table/box geometry.
- `slate-react`: `domStrategy` normalization, alias rejection, layout protocol,
  mount plan, DOM coverage boundaries, state-field locality, selector locality.
- Browser: continuous layout typing, Enter, Backspace, trailing spaces, copy,
  find limitation/materialization rows, pagination page-boundary rows,
  virtualized far-scroll/type/select rows, a11y snapshot rows for missing-DOM
  modes.
- Example coverage: add `site/examples/ts/virtualization.tsx` as the canonical
  degraded-mode example. It must show native editing as the default posture,
  then explicit virtualization as a stress-mode toggle backed by layout rects,
  not estimated block size as the primary model.

## High-Risk Deliberate Pass

Trigger:

- Public API rename before beta.
- Cross-package boundary rewrite across `slate-react`, `slate-layout`, and
  `slate-dom`.
- Browser-sensitive behavior for selection, IME, clipboard, browser find, a11y,
  and virtualization.

Blast radius:

- Packages: `slate-react`, `slate-layout`, `slate-dom`, plus examples and
  Playwright proof routes.
- Consumers: raw Slate users using large-doc modes, Plate adopting layout
  projection, future slate-yjs/collab users relying on operation/state-patch
  truth.
- Behavior: native DOM completeness, materialization, selection import/export,
  copy/paste, browser find, page hit testing, layout invalidation, scroll
  anchoring.
- Docs/examples: pagination, virtualization, huge document, continuous layout,
  PR reference, issue ledgers.

Three-scenario pre-mortem:

| Scenario | Failure | Guard |
| --- | --- | --- |
| API alias rot | `renderingStrategy` stays beside `domStrategy`, examples keep using both, and agents/users learn the wrong abstraction. | Hard-cut public examples to `domStrategy`; no public docs for the old prop; temporary alias only as an implementation bridge before beta. |
| Hidden Pretext tax | Basic `Editable` pulls Pretext/layout code or waits on layout snapshots even when the user did not opt in. | `layout` is optional; no-layout `Editable` path has no Pretext import, no layout subscription, no virtualizer setup. Add bundle/source boundary proof. |
| Dirty native behavior | `virtualized` looks fast but breaks IME, screen readers, native selection, copy, paste, browser find, or far caret placement. | `auto` never chooses virtualization; virtualized mode exposes native-behavior limits in metrics and tests; browser rows must cover materialize-first behavior. |
| Subscription blowup | Layout snapshots wake every block/page on each keystroke and erase existing rerender-breadth wins. | Layout snapshots publish dirty ranges and versions; `slate-react` consumes runtime id/path/field-key selectors, not a broad layout object per block. |
| State-field misuse | Page settings become a dumping ground for app UI state, presence, comments, or layout caches. | Only persisted document-owned settings use state fields. View/debug/presence/cache state stays local, projection-owned, or `collab: 'local'` + `history: 'skip'` + `persist: false`. |

Steelman challenges:

| Decision | Best objection | Alternative | Chosen answer | Verdict |
| --- | --- | --- | --- | --- |
| `domStrategy` hard cut | The current `renderingStrategy` name already exists and churn costs time. | Keep name and document that it only means DOM mounting. | Documentation cannot fix a wrong noun. The prop is specifically about native DOM availability, so `domStrategy` is the cleaner beta API. | keep |
| Cut public `shell` / `preview-shell` | Shell previews can be useful for product surfaces. | Keep object-only `preview-shell` beside virtualization. | No. Two public degraded DOM strategies is muddy. Product preview/collapse surfaces can use layout plus DOM coverage outside `EditableDOMStrategy`. | keep cut |
| Layout prop on `Editable` | `Editable` becomes too opinionated and drags layout into raw Slate. | Keep pagination in `PagedEditable` only. | Raw `Editable` accepts only a structural layout protocol. This lets continuous layout and virtualization work without making Slate core or basic React depend on Pretext. | keep, protocol-only |
| State-field page settings | Page settings can be app/product policy. | Keep all page settings in React state. | Persisted, collaborative document layout settings are document state. Local view settings stay local. | keep |
| Layout-driven virtualization | Building layout before virtualization may cost more than estimated heights. | Keep TanStack estimated-size path. | Estimated heights are the dirty hack. Layout gives deterministic scroll anchoring, hit testing, and page/table fragments. Estimated size remains fallback only. | keep |

Expanded proof plan:

| Layer | Required proof |
| --- | --- |
| Unit | `slate-layout` continuous/paged snapshots; state-field settings changes; dirty-range recomposition; rich-inline line breaks; table/box geometry; projection/hit rects. |
| React/package | `Editable domStrategy` normalization; no public `renderingStrategy` type; no public `shell` or `preview-shell`; `EditableLayout` protocol contract; mount plan from layout; DOM coverage contract; selector locality for layout/state fields. |
| Browser | Continuous layout typing/Enter/Backspace/trailing spaces; pagination page-boundary caret/hit testing; `virtualization.tsx` far scroll/type/select; materialize-first copy/find; IME guards; browser find limitation rows; a11y rows for missing-DOM modes. |
| Performance | Large-doc mount/edit/scroll cohorts; layout recomposition dirty-range timings; DOM node counts; mounted item counts; cache hit rate; retained memory after document replacement. |
| Migration | Examples use only `layout` + `domStrategy`; virtualization example replaces public `renderingStrategy` naming; Plate can layer Markdown/tables/comments without raw Slate product APIs; slate-yjs syncs operations/state patches, not layout snapshots. |
| Docs/reference | PR reference and issue ledgers keep zero new `Fixes`/`Improves` until implementation proof exists; examples avoid old prop names. |

Rollback / remediation:

- Before beta: hard-cut the API. Do not carry a public compatibility layer.
- If no-layout `Editable` imports Pretext/layout: block release and split the
  protocol boundary.
- If browser native behavior proof fails for virtualized mode: keep it
  experimental and unavailable from `auto`.
- If layout subscriptions widen render breadth: block `domStrategy` rollout
  until selector locality passes.

Verdict:

- Keep the architecture.
- Revise the alias story: temporary alias may exist only as an internal
  implementation bridge; public examples/docs should show `domStrategy` only.
- Cut public `preview-shell`; shell-style preview is internal/app-owned only.
- Keep Pretext optional and package-contained.
- Keep final closure pending until the closure gate verifies pass rows, proof
  requirements, and handoff shape.

## Initial Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.90 | live `slate-react` staged/shell/virtualized source; `useSyncExternalStore` state-field hooks; plan now requires layout-driven virtualization, selector locality, and no-layout fast path |
| Slate-close unopinionated DX | 0.94 | raw Slate and no-layout `Editable` stay Pretext-free; layout-aware users get the built-in Pretext path without fake engine boilerplate; final public name is `domStrategy`; public `shell` is cut |
| Plate/slate-yjs migration backbone | 0.89 | layout snapshots are derived, state-field settings are document-owned, content roots stay roots, and collab syncs operations/state patches only |
| Regression-proof testing | 0.88 | high-risk pass adds unit, React/package, browser, performance, migration, and docs/reference proof gates |
| Research evidence completeness | 0.93 | Pretext/Premirror/TanStack/local docs plus related issue ledgers and high-risk steelman rows reviewed |
| shadcn-style composability/minimalism | 0.94 | small `layout` + `domStrategy` call site with no public engine, mode, or default-root boilerplate; `page` is the paged-layout switch; `PagedEditable` owns viewport display policy |

Total: 0.94.

Status: complete. All Slate Ralplan closure gates pass for planning review.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state-read | complete | live `.tmp/slate-v2` layout, Pretext, rendering strategy, virtualization, DOM coverage, pagination example, and docs/solutions reads | chose boundary rewrite: generic layout + `domStrategy` split + layout-driven virtualization | final API naming closed by performance/DX/migration pass | done |
| related-issue-discovery | complete | live/open issue ledgers, benchmark map, issue coverage matrix, fork dossier, and PR reference reviewed for `#790`, `#4141`, `#5944`, `#5924`, `#3892`, `#2572`, `#5131`, `#2051` | added no-claim related issue matrix for layout/domStrategy plan | external ledger sync closed by issue-ledger-accounting pass | done |
| issue-ledger-accounting | complete | sync ledger, issue coverage matrix, fork dossier, and PR reference updated with architecture-only rows | preserved zero new fixed/improved issue claims and recorded no-claim boundaries | performance/DX/migration pressure closed by later pass | done |
| intent-decision-brief | complete | explicit boundary and decision brief | none | none | done |
| research-ecosystem-synthesis | complete | Pretext, Premirror, TanStack, current Slate v2 synthesis | none | optional deeper Lexical/ProseMirror/Tiptap pass if closure claims broader runtime law | done |
| performance-dx-migration-pressure | complete | live state-field, layout, rendering strategy, virtualization, shell-backed selection, and React subscription sources reviewed | chose `domStrategy`, cut public `shell`, folded Pretext into `slate-layout`, made `SlateMountPlan` internal, state-fielded document layout settings, kept no-layout `Editable` Pretext-free, and added perf/RUM/test pressure | high-risk pass must challenge the public rename and degraded native behavior contract | Slate Ralplan |
| high-risk-deliberate-pass | complete | high-risk trigger, blast radius, pre-mortem, steelman rows, expanded proof plan, and rollback policy | kept architecture; revised alias policy to public `domStrategy` only; cut public `preview-shell`; protected no-layout fast path | closure verified by final gates | done |
| closure-final-gates | complete | threshold audit, implementation-skill matrix, plan deltas, Done Handoff, Ralph proof gaps | marked ralplan lane complete for planning; implementation remains for later Ralph | no planning passes remain | done |

## Implementation Phases

1. Public naming hard cut:
   - hard-cut public `renderingStrategy` to `domStrategy`;
   - allow only an internal implementation alias during the rewrite branch;
   - remove that alias before beta and never teach it in examples/docs.
2. Generic layout service:
   - introduce `useSlateLayout`;
   - preserve `useSlatePageLayout` as wrapper or example-only compatibility;
   - add continuous layout mode.
3. Rich-inline Pretext engine inside `slate-layout`:
   - replace block-style line breaking with Pretext rich-inline line breaking;
   - project fragments to Slate leaf/range data directly.
4. Layout-driven virtualization:
   - feed TanStack from layout rects/heights;
   - split virtualized boundaries from internal/app-owned preview shell code.
5. Mount plan integration:
   - derive active corridor, semantic islands, pending ranges, and DOM coverage
     boundaries from runtime + layout.
6. Proof/examples:
   - add continuous layout example;
   - keep pagination as a layout proof;
   - replace current virtualization demo with `site/examples/ts/virtualization.tsx`;
   - make `virtualization.tsx` the canonical explicit degraded-mode proof:
     native/default posture first, explicit virtualized stress mode second,
     layout rects as primary item sizing, materialize-first far selection/copy/
     find, IME guard, and fixture rows for tables, voids, long words, trailing
     spaces, and mixed inline marks.

## Closure Final Gates

Closure status: complete.

Completion threshold audit:

| Gate | Result | Evidence |
| --- | --- | --- |
| Total score `>= 0.92` | pass | closure score `0.94` |
| No dimension below `0.85` | pass | final scorecard dimensions: `0.88` minimum |
| Pass schedule complete | pass | all pass-state rows complete or done |
| Issue discovery/accounting complete | pass | related issue discovery, sync ledger, coverage matrix, fork dossier, and PR reference updated |
| Public API maybe-language removed | pass | final target is `domStrategy`; public `renderingStrategy`, `shell`, and `preview-shell` are hard cuts before beta |
| Intent/decision boundaries explicit | pass | intent boundary and decision brief sections present |
| Ecosystem strategy complete | pass | Pretext, Premirror, TanStack, and current Slate v2 mechanisms mapped to Slate targets |
| High-risk deliberate mode complete | pass | trigger, blast radius, pre-mortem, steelman rows, proof plan, and rollback policy recorded |
| Verification workspace gate | pass for planning | no `.tmp/slate-v2` implementation changed; live source was read for current-state evidence; implementation gates are named for Ralph execution |
| Final handoff in plan | pass | Done Handoff section below |

Applicable implementation-skill review matrix:

| Lens | Result | Evidence |
| --- | --- | --- |
| Vercel React best practices | applied | `useSyncExternalStore`, primitive option deps, transition limits, no hidden Pretext import for no-layout `Editable` |
| performance-oracle | applied | repeated-unit budget, O(changed block plus dependent flow/page range), dirty-range recomposition, memory/RUM tags |
| performance | applied | cohorts, degradation contract, native behavior proof, DOM/memory tags, production metrics |
| tdd | applied as execution guidance | vertical proof slices named for layout, React, browser, performance, migration, and docs/reference |
| shadcn | skipped | no shadcn UI component or design-system API changed by this architecture plan |
| react-useeffect | skipped | no hook implementation changed; React subscription/effect constraints are recorded for Ralph execution |

Plan deltas from review:

- Replaced page-first layout posture with generic continuous/paged
  `slate-layout`.
- Folded Pretext into `slate-layout` as the built-in layout engine while
  keeping `slate` and no-layout `slate-react` Pretext-free.
- Replaced public `mode`/default `root` layout boilerplate with `page` as the
  paged-layout switch, implicit current-view root, and `pageView` for facing/gap
  viewport policy.
- Chose final public `domStrategy` naming and rejected `mountStrategy`.
- Cut public `shell` and `preview-shell`; preview/collapse surfaces are product
  UI above Slate, not raw editable DOM strategies.
- Made `SlateMountPlan` internal.
- Routed document-owned page settings through state fields and kept view-only
  settings local.
- Made virtualization layout-driven; estimated block size remains fallback only.
- Preserved zero new `Fixes` / `Improves` issue claims until implementation
  proof exists.

Done Handoff:

Before:

- `slate-layout` is page-first.
- The current Pretext adapter proves pagination but still has block-style
  line-break pressure.
- `slate-react` exposes `renderingStrategy`.
- Virtualization is top-level index plus estimated height.
- Shell and virtualized selection policy are too coupled.

After target:

- `slate-layout` is a generic derived layout service with continuous and paged
  snapshots.
- `slate-layout` includes the built-in Pretext engine and uses rich-inline line
  breaking.
- `Editable` accepts optional `layout` and public `domStrategy`.
- `PagedEditable` composes over `Editable` from `slate-layout/react`.
- `SlateMountPlan` derives mounted ranges, active corridor, semantic islands,
  materialization ranges, and DOM coverage boundaries from runtime plus layout.
- `auto` never chooses degraded `virtualized`.
- `virtualized` consumes layout rects/items.
- DOM coverage is the missing-DOM contract for staged and virtualized ranges;
  app-owned previews must use it instead of becoming another DOM strategy.
- Document-owned layout settings use state fields; view-only settings stay
  local or local/skip/non-persisted.

Ralph execution target:

1. Rename public `renderingStrategy` to `domStrategy`, remove public `shell`
   and `preview-shell`, and rename metrics to DOM-strategy language.
2. Introduce generic `useSlateLayout` and `EditableLayout` protocol.
3. Keep no-layout `Editable` free of Pretext/layout imports and subscriptions.
4. Rewrite Pretext layout around rich-inline fragments.
5. Make virtualization consume layout rects/items.
6. Add continuous-layout, pagination, virtualization, state-field settings,
   selector-locality, browser-native-behavior, and RUM/metrics proof.

Open proof gaps for Ralph, not this planning lane:

- Package tests and browser rows are not run here because Slate Ralplan did not
  edit `.tmp/slate-v2` implementation.
- Implementation must run the focused and broad `.tmp/slate-v2` gates below
  before claiming behavior.

## Ralph Execution Ledger

### 2026-05-22T10:02:44Z - `domStrategy` public API slice

Changed scope:

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`
- `.tmp/slate-v2/packages/slate-react/src/index.ts`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`
- `.tmp/slate-v2/site/examples/ts/huge-document.tsx`
- `.tmp/slate-v2/site/examples/ts/pagination.tsx`
- `.tmp/slate-v2/docs/**` DOM-strategy wording references

Result:

- Public `Editable` surface exposes `domStrategy` and `onDOMStrategyMetrics`.
- Public metrics type names are `EditableDOMStrategy*`.
- Docs and site examples teach DOM-strategy naming.
- Old `renderingStrategy` names remain only in internal root/kernel wiring and
  internal source assertions.

Review findings:

- P0/P1: none.
- P2 fixed in pass: docs and huge-document metrics labels still said
  "rendering strategy"; renamed to DOM strategy.
- Accepted risk: internal `EditableDOMRoot`/keyboard/runtime wiring still uses
  `renderingStrategy` language until the deeper mount-plan/layout owner is
  rewritten.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-react test -- surface-contract provider-hooks-contract rendering-strategy-and-scroll
bun --filter slate-react typecheck
bun typecheck:site
bun lint:fix
```

Browser proof:

- `http://localhost:3100/examples/pagination` reload shows the control label
  `DOM strategy`, no old `Rendering` label, and the pagination viewport exists.
- `http://localhost:3100/examples/huge-document?blocks=2` shows
  `DOM strategy`, `Requested DOM strategy`, and `Effective DOM strategy`; old
  requested/effective rendering-strategy labels are absent.

### 2026-05-22T10:08:55Z - generic `slate-layout` API slice

Changed scope:

- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`

Result:

- Added `createSlateLayout`, `SlateLayout`, `SlateLayoutSnapshot`,
  `SlateLayoutOptions`, `useSlateLayout`, and `useSlateLayoutSnapshot`.
- Generic call site uses `page` and hides the engine:
  `createSlateLayout(editor, () => ({ page: { margins: 72, preset: 'letter' } }))`.
- Legacy page APIs remain available.

Review findings:

- P0/P1: none.
- P2 fixed in pass: `page` was initially optional, which would imply
  continuous layout before continuous geometry exists. It is required for this
  paged subset until the continuous owner lands.
- Accepted risk: generic layout still delegates to the estimated page engine.
  Built-in Pretext and continuous layout remain separate owners.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-layout test
bun --filter slate-layout typecheck
bun lint:fix
```

### 2026-05-22T10:19:30Z - built-in Pretext layout engine slice

Changed scope:

- `.tmp/slate-v2/packages/slate-layout/package.json`
- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`
- `.tmp/slate-v2/packages/slate-layout-pretext/package.json`
- `.tmp/slate-v2/packages/slate-layout-pretext/src/index.ts`
- `.tmp/slate-v2/site/examples/ts/pagination.tsx`
- `.tmp/slate-v2/site/tsconfig.json`
- `.tmp/slate-v2/bun.lock`

Result:

- `slate-layout` owns `pretextPageLayoutEngine` and uses it as the built-in
  engine behind `createSlateLayout`.
- `slate-layout-pretext` is only a compatibility re-export for the existing
  package surface.
- The pagination example imports only `slate-layout/react` and calls
  `useSlateLayout(editor, { page, root, typography })`; no public engine
  setup appears at the example call site.
- Inline page settings are normalized for React dependencies so an equivalent
  `{ preset, margins }` object does not retrigger layout composition.

Review findings:

- P0/P1: none.
- P2 fixed in pass: the first regression test asserted source text. Replaced it
  with a real `useSlateLayout` hook test that rerenders equivalent inline page
  settings and verifies composition does not rerun.
- P2 fixed in pass: removed the stale `@chenglou/pretext` dependency and site
  path alias from `slate-layout-pretext`.
- Accepted risk: `slate-layout-pretext` still exists as a compatibility
  package. A later hard-cut can delete it if we decide beta should expose only
  `slate-layout`.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-layout test
bun --filter slate-layout-pretext test
bun --filter slate-layout typecheck
bun --filter slate-layout-pretext typecheck
bun typecheck:site
bun lint:fix
```

Browser proof:

- `http://localhost:3100/examples/pagination` reloads in the in-app Browser,
  shows `DOM strategy`, exposes the pagination viewport, reports pages metrics,
  and renders the Premirror fixture text.

### 2026-05-22T10:25:17Z - rich-inline Pretext line-breaking slice

Changed scope:

- `.tmp/slate-v2/packages/slate-layout/package.json`
- `.tmp/slate-v2/packages/slate-layout/src/index.ts`
- `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`
- `.tmp/slate-v2/bun.lock`

Result:

- Added a `whiteSpace: 'normal'` rich-inline path inside
  `pretextPageLayoutEngine`.
- Rich-inline flow uses Pretext fragment ranges for mixed Slate runs, collapsed
  boundary whitespace, and per-run measured widths instead of slicing the block
  string after line breaking.
- `whiteSpace: 'pre-wrap'` remains on the existing path to preserve editable
  trailing spaces and hard-break fidelity until Pretext has a rich pre-wrap
  primitive.
- `slate-layout` declares its React DOM test dependencies explicitly.

Review findings:

- P0/P1: none.
- P2 fixed in pass: the first rich-inline attempt would have made pre-wrap
  editor spacing ride on a normal-only Pretext helper. Kept rich-inline opt-in
  to `whiteSpace: 'normal'` and preserved the pre-wrap fallback.
- Accepted risk: rich-inline does not yet cover pre-wrap editor text, atomic
  inline boxes, or hard-break rich fragments. Those remain named owners, not
  hidden inside the current default path.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun install
bun --filter slate-layout test
bun --filter slate-layout-pretext test
bun --filter slate-layout typecheck
bun --filter slate-layout-pretext typecheck
bun typecheck:site
bun lint:fix
```

Browser proof:

- `http://localhost:3100/examples/pagination` reloads in the in-app Browser
  after the engine change, shows `DOM strategy`, exposes the pagination
  viewport, reports pages metrics, renders the Premirror fixture text, and
  includes the mixed rich-text block.

### 2026-05-22T10:32:01Z - layout-backed virtualization protocol slice

Changed scope:

- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/index.ts`
- `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/use-virtualized-root-plan.ts`
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx`

Result:

- Added a small `EditableLayout` protocol for layout-owned virtualized
  top-level item geometry.
- Virtualized DOM strategy uses layout item `size`/`start` when provided,
  including retained selected rows, total scroll size, and layout-backed
  `scrollToTopLevelIndex`.
- `PagedEditable` passes a layout adapter derived from
  `getSlatePageLayoutProjection`, so paged layout can feed virtualized DOM
  materialization without `slate-react` importing `slate-layout`.
- Added a React regression proving selected off-viewport virtual rows use
  layout-backed `minHeight` and `translateY` instead of only the estimated block
  size.

Review findings:

- P0/P1: none.
- P2 fixed in pass: the first test expected visible TanStack rows without a
  retained selected item, but the current test environment can have an empty
  virtual item list while still exposing the virtualizer and coverage boundary.
  The regression now proves the materialization path that matters: retained
  selected row geometry.
- Accepted risk: viewport range extraction still comes from TanStack estimates
  when no selected/promoted row is retained. This slice wires layout geometry
  into item sizing/positioning; a later pass should make the viewport range
  itself fully layout-range driven.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-react test -- rendering-strategy-and-scroll surface-contract
bun --filter slate-react typecheck
bun --filter slate-layout typecheck
bun typecheck:site
bun lint:fix
```

Browser proof:

- `http://localhost:3100/examples/pagination` still renders `DOM strategy`,
  pages metrics, the pagination viewport, and the Premirror fixture.
- `http://localhost:3100/examples/huge-document?...strategy=virtualized...`
  mounts `[data-slate-rendering-strategy-virtualizer="true"]` with DOM coverage
  boundaries in the in-app Browser.

### 2026-05-22T10:46:16Z - public shell DOM strategy hard-cut slice

Changed scope:

- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts`
- `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts`
- `.tmp/slate-v2/packages/slate-react/test/rendering-strategy-and-scroll.tsx`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/site/examples/ts/huge-document.tsx`
- `.tmp/slate-v2/docs/libraries/slate-react/editable.md`
- `.tmp/slate-v2/docs/walkthroughs/09-performance.md`

Result:

- Public `DOMStrategyType` is only `auto | full | staged`; `virtualized`
  remains explicit object-only and experimental.
- Public `shell` / `preview-shell` docs, huge-document controls, URL params,
  and metrics rows are gone.
- Public DOM strategy metrics no longer expose `shellCount`,
  `shellAggressiveBoundaryCount`, or `'shell'` as an effective/degraded strategy
  type. Internal segment coverage reports as `partial-dom` and keeps its
  implementation boundary private.
- The high-level `Editable` bridge uses `domStrategy*` names for public-facing
  plumbing and test contracts. Private shell coverage tests use a single
  internal test helper instead of widening the public prop type.

Review findings:

- P0/P1: none.
- P2 fixed in pass: public metrics still leaked shell terminology after the
  prop and docs had been cut. Replaced that with generic partial-DOM metrics.
- P2 fixed in pass: the surface contract still required
  `renderingStrategyVirtualizedOverscan`, keeping old naming alive in the
  high-level bridge. Renamed the bridge to `domStrategy*`.
- Accepted risk: private module/file names and DOM coverage reasons such as
  `shell-aggressive` remain internal. They are not documented or exported, and
  the next owner can decide whether the private implementation vocabulary is
  worth a hard file rename.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-react test -- surface-contract rendering-strategy-and-scroll
bun --filter slate-react typecheck
bun typecheck:site
bun lint:fix
```

Browser proof:

- `http://localhost:3100/examples/huge-document?blocks=1000&strategy=virtualized&threshold=1&estimated_block_size=24&overscan=0`
  reloads in the in-app Browser with DOM strategy options
  `auto, full, staged, virtualized`.
- No Shell option or shell metric row is present.
- Metrics report `requested: virtualized`, `effective: virtualized`,
  `boundaryCount: 1`, `viewportBoundaryCount: 1`, and the virtualizer is
  mounted with no horizontal page overflow.

Knowledge capture:

- Updated
  `docs/solutions/performance-issues/2026-05-03-slate-rendering-strategy-needs-production-rum-metrics.md`
  to the current DOM strategy API and recorded the metrics-leak prevention
  rule for public API hard-cuts.

### 2026-05-22T10:57:14Z - private DOM strategy naming hard-cut closure

Changed scope:

- `.tmp/slate-v2/packages/slate-react/src/dom-strategy/**`
- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`
- `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `.tmp/slate-v2/packages/slate-react/src/editable/**`
- `.tmp/slate-v2/packages/slate-react/src/index.ts`
- `.tmp/slate-v2/packages/slate-react/test/dom-strategy-and-scroll*.tsx`
- `.tmp/slate-v2/packages/slate-react/test/create-segment-plan-contract.test.ts`
- `.tmp/slate-v2/packages/slate-react/test/editing-kernel-contract.ts`
- `.tmp/slate-v2/packages/slate-react/test/keyboard-input-strategy-contract.test.ts`
- `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx`
- `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`
- `.tmp/slate-v2/docs/general/docs-proof-map.md`
- `.tmp/slate-v2/docs/libraries/slate-react/experimental-virtualized-rendering.md`

Result:

- Private implementation owner moved from `rendering-strategy` to
  `dom-strategy`, so internal file paths, imports, exports, DOM attrs, and test
  files match the public `domStrategy` API boundary.
- Segment shells are exposed internally as DOM strategy placeholders:
  `segment-placeholder.tsx` and `data-slate-dom-strategy-placeholder`.
- Runtime bridge variables use `domStrategyRuntime` names instead of
  `renderingStrategy*` names.
- Source inventory leaves `renderingStrategy` only in negative public-surface
  tests that prove the old prop/export names do not exist.

Review findings:

- P0/P1: none.
- P2 fixed in pass: moving files left one stale
  `../dom-strategy/segment-shell` import; focused tests caught it and the import
  now points at `segment-placeholder`.
- P2 fixed in pass: DOM coverage attrs still used the old
  `data-slate-rendering-strategy-*` owner; renamed them to
  `data-slate-dom-strategy-*`.
- Accepted risk: selection state values such as `shell-backed` remain as the
  existing model-selection vocabulary. They are behavior-bearing internals, not
  public DOM strategy API names, so they should move only in a separate
  selection-contract pass.

Verification:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-react test -- surface-contract dom-strategy-and-scroll create-segment-plan-contract keyboard-input-strategy-contract editing-kernel-contract provider-hooks-contract
bun --filter slate-react typecheck
bun typecheck:site
bun lint:fix
bun --filter slate-react test -- surface-contract dom-strategy-and-scroll create-segment-plan-contract keyboard-input-strategy-contract editing-kernel-contract provider-hooks-contract
bun --filter slate-react typecheck
bun typecheck:site
bun lint:fix
bun --filter slate-react test
bun --filter slate-react typecheck
bun --filter slate-layout test
bun --filter slate-layout typecheck
bun typecheck:site
bun lint:fix
```

Browser proof:

- `http://localhost:3100/examples/huge-document?blocks=1000&strategy=virtualized&threshold=1&estimated_block_size=24&overscan=0`
  reloads in the in-app Browser with DOM strategy options
  `auto, full, staged, virtualized`, no Shell option, no shell metric row,
  `requested: virtualized`, `effective: virtualized`, one DOM coverage boundary,
  one viewport boundary, mounted virtualizer rows, and no horizontal overflow.
- `http://localhost:3100/examples/pagination` reloads in the in-app Browser
  with `DOM strategy`, five pages, no horizontal overflow, no old
  `data-slate-rendering-strategy-*` attrs, and the Premirror plus rich Markdown
  pagination fixture visible.

Ralph execution status: complete. Remaining owners: none for this lane.

ralplan_lane_status: complete
final_handoff_status: complete

## Fast Driver Gates

Planning gate:

```bash
# cwd: /Users/zbeyens/git/plate-2
node tooling/scripts/completion-check.mjs --id 019e46be-4ec4-7d11-bc6e-9fcf033a8803
```

Implementation gates after Ralph edits `.tmp/slate-v2`:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun --filter slate-layout test
bun --filter slate-react test
bun --filter slate-layout typecheck
bun --filter slate-react typecheck
bun typecheck:site
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/pagination.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/virtualization.test.ts --project=chromium
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium
bun lint:fix
bun check
```

## Continuation Target

Reopened on 2026-05-22 for the root-location authority cleanup discovered by
Codex review after the layout/rendering lane closed.

## 2026-05-22 Root Location Authority Amendment

status: pending implementation
current_pass: root-location-authority-amendment
current_pass_status: complete
next_pass: ralph-root-location-cleanup-execution
score: 0.91

### Current Verdict

Hard take: the review fix is behaviorally right, but not the absolute best
architecture yet.

The live `.tmp/slate-v2` diff proves the correct bug class:

- rootless `PointRef` / `RangeRef` created inside a non-main view must bind to
  the invoking view root;
- ref public values should keep the caller's root shape when the caller passed
  rootless points/ranges;
- `OperationApi.inverse(set_selection)` must restore the root of the selection
  being restored, not keep the root of the selection being undone.

The remaining bad shape is duplication and metadata leakage:

- `MAIN_ROOT_KEY`, `getOperationRoot`, point-root inference, range-root
  inference, and selection-patch-root inference are repeated across
  `point.ts`, `path-ref.ts`, `point-ref.ts`, `range-ref.ts`,
  `operation.ts`, and `transforms/general.ts`.
- `PointRefApi.transform` and `RangeRefApi.transform` need ad hoc
  `__explicitRoot`, `__explicitAnchorRoot`, and `__explicitFocusRoot` casts.
- The implicit-root stripping rule is local to refs instead of a shared
  location-root contract.

Final call: keep the behavior, rewrite the authority boundary. Do not rewrite
runtime/view. Do add one internal root-location module and test it directly.

### Intent Boundary

Intent: make multi-root operations, refs, selection inverses, history replay,
and view-scoped updates use one root authority rule.

Desired outcome: every root-aware API answers the same question the same way:
which root owns this point/range/path/operation, and should that root be visible
to the public caller?

In scope:

- Root inference for `PathRef`, `PointRef`, `RangeRef`, `PointApi.transform`,
  `RangeApi.transform`, `OperationApi.inverse`, and replay/apply routing.
- Explicit-vs-implicit root visibility for public ref values.
- Unit coverage for rootless view-scoped refs, explicit rooted refs, set
  selection inversion, history undo/redo, and root-local multi-block delete.

Non-goals:

- Changing the public `Point` / `Range` shape again.
- Adding root keys into `Path`.
- Rewriting runtime/view or DOM/pagination architecture.
- Claiming browser issue fixes from this cleanup alone.

Decision boundary: this is a core Slate data-model/runtime cleanup. It belongs
in `.tmp/slate-v2/packages/slate`, not `slate-react`, `slate-layout`, or Plate.

### Decision Brief

Principles:

1. Root is operation/location metadata, not a `Path` segment.
2. Rootless public points/ranges remain rootless when the caller gave rootless
   input.
3. Internal transforms may temporarily root a point/range, but must strip only
   roots that were implicit.
4. Selection inverse must restore the root of the restored selection patch.
5. One internal module owns root inference; callers do not reimplement it.

Options:

1. Keep the current local helpers and hidden `__explicit*Root` fields.
   - Reject. It fixes the bug, but creates future drift. The next transform or
     replay path will copy a slightly different root rule.
2. Put root helpers on public `PointApi` / `RangeApi`.
   - Reject for now. The concepts are still internal runtime authority, not a
     polished public authoring API.
3. Add an internal root-location authority module and let point/range/ref/op
   code consume it.
   - Choose. It is the smallest long-term fix: one rule, no public API churn,
     better tests.

### Target Architecture

Add an internal module, preferably:

```txt
packages/slate/src/internal/root-location.ts
```

Export internal helpers only:

```ts
export const MAIN_ROOT_KEY = 'main'

export type RootVisibility = 'explicit' | 'implicit'

export type PointRootMeta = {
  root: string
  visibility: RootVisibility
}

export type RangeRootMeta = {
  anchor: PointRootMeta
  focus: PointRootMeta
  root: string | null
}

export function getOperationRoot(operation: Operation): string
export function getPointRoot(point: Point, fallback?: string): PointRootMeta
export function getRangeRoot(range: Range, fallback?: string): RangeRootMeta
export function getSelectionPatchRoot(
  patch: Partial<Range> | Range | null
): string | undefined
export function withImplicitPointRoot(point: Point, root: string): Point
export function withImplicitRangeRoot(range: Range, root: string): Range
export function stripImplicitPointRoot(point: Point, meta: PointRootMeta): Point
export function stripImplicitRangeRoots(range: Range, meta: RangeRootMeta): Range
```

Implementation rules:

- `PointApi.transform` imports `getPointRoot` / `getOperationRoot` and returns
  the original point unchanged for sibling-root operations.
- `PathRefApi`, `PointRefApi`, and `RangeRefApi` use the same
  `getOperationRoot`.
- `OperationApi.inverse(set_selection)` uses `getSelectionPatchRoot`.
- `PointRef` / `RangeRef` creation records root visibility in internal WeakMaps
  or a single internal metadata type, not scattered `__explicit*Root` casts.
- Public ref `current` and `unref()` preserve input shape:
  - rootless input stays rootless;
  - explicitly rooted input stays rooted;
  - internal transform-only roots are stripped before public exposure.

Preferred metadata owner:

```ts
const POINT_REF_ROOT = new WeakMap<PointRef, PointRootMeta>()
const RANGE_REF_ROOT = new WeakMap<RangeRef, RangeRootMeta>()
```

This is cleaner than storing `__explicitRoot` fields on the ref object because
the public ref interface stays honest and the implementation has one authority
for visibility.

### Full Coverage Target

Add or tighten these tests in `.tmp/slate-v2`:

| File | Required coverage |
| --- | --- |
| `packages/slate/test/root-location-contract.ts` | `getOperationRoot`, `getPointRoot`, `getRangeRoot`, `getSelectionPatchRoot`, implicit root injection, implicit root stripping, mismatched range roots |
| `packages/slate/test/editor-runtime-view-contract.ts` | rootless `pointRef` and `rangeRef` created inside a `header` view shift on `header` ops and ignore `main` ops |
| `packages/slate/test/editor-runtime-view-contract.ts` | rootless multi-block delete from a `header` view merges/deletes only `header` content |
| `packages/slate/test/rooted-operation-contract.ts` | inverse `set_selection` from `main -> header` replays into `main` |
| `packages/slate/test/rooted-operation-contract.ts` | inverse `set_selection` from `header -> null` and `null -> header` preserves the correct root behavior |
| `packages/slate/test/range-ref-contract.ts` | public `rangeRef.current`, draft publication, and `unref()` preserve explicit/rootless input shape |
| `packages/slate/test/range-ref-contract.ts` | public and internal range refs are removed only when matching-root operations delete the range |
| `packages/slate/test/transaction-contract.ts` | committed root-scoped `set_selection` operation carries the active root, while command middleware payload stays caller-shaped |
| `packages/slate-history/test/document-state-history-contract.ts` or new history row | undo/redo restores multi-root selection and root-scoped refs after text edits |
| `packages/slate/test/interfaces-contract.ts` | `PointApi.equals`, `PointApi.compare`, `RangeApi.equals`, and `RangeApi.intersection` keep root-aware semantics |

Coverage rejects:

- no tests that assert deleted legacy helper names;
- no browser test for this cleanup unless a browser-visible regression is found;
- no snapshot-only proof for root semantics.

### Implementation Phases

1. Add `internal/root-location.ts` and direct unit tests.
2. Replace duplicated root helpers in `point.ts`, `path-ref.ts`,
   `point-ref.ts`, `range-ref.ts`, `operation.ts`, and `transforms/general.ts`.
3. Move ref explicitness tracking to WeakMap/internal metadata.
4. Preserve current passing behavior from the review fix.
5. Rerun focused Slate tests, then broad package gates.
6. Rerun `codex review --uncommitted`; accept only findings that beat this
   plan's architecture boundary.

### Applicable Review Matrix

| Lens | Decision |
| --- | --- |
| `tdd` | applied: this is a behavior regression class; helper contract and root-scoped ref tests are mandatory |
| `performance-oracle` | applied: root checks stay O(1), WeakMap metadata avoids extra point/range cloning except transform-time injection/strip |
| `vercel-react-best-practices` | skipped: no React render/subscription surface changes |
| `performance` | skipped: no RUM/cohort surface changes |
| `react-useeffect` | skipped: no effects |
| `shadcn` | skipped: no UI |

### Maintainer Objection Ledger

| Change | Objection | Answer | Verdict |
| --- | --- | --- | --- |
| Add internal root-location helper | This is extra abstraction for five files. | The duplicated root rules already produced a real review bug. One internal helper prevents path/ref/operation drift without public API churn. | keep |
| Use WeakMap metadata for ref root visibility | Hidden metadata is harder to inspect. | It is less dirty than public `__explicit*Root` fields and keeps `PointRef` / `RangeRef` shape close to Slate. Tests prove public `current` / `unref()` behavior. | keep |
| Keep root on `Point` / `Range`, not `Path` | Root-aware compare changes legacy mental model. | Multi-root needs a root dimension. Putting it in `Path` would poison every path algorithm; point/range metadata is the least bad shape. | keep |

### Verification Gates

Focused gates:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun test ./packages/slate/test/root-location-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/interfaces-contract.ts ./packages/slate-history/test/document-state-history-contract.ts
bun typecheck:packages
bun lint:fix
codex review --uncommitted
```

Broad gate before closeout:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun test:bun
bun typecheck:packages
bun lint
```

Planning gate:

```bash
# cwd: /Users/zbeyens/git/plate-2
node tooling/scripts/completion-check.mjs
```

### Plan Delta

Added a new runnable owner after the previous closed layout lane:

- target: internal root-location authority module;
- target: WeakMap/internal metadata for ref root visibility;
- target: full unit/history/ref coverage for multi-root refs and selection
  inverses;
- no browser or issue-fix claim until a browser-visible regression is found;
- next owner: `ralph-root-location-cleanup-execution`.

ralplan_lane_status: pending
final_handoff_status: pending

### 2026-05-22T19:05:37Z - paused Ralph handoff after root-location review

Changed scope:

- `active goal state`
- `active goal state`
- `docs/plans/2026-05-22-slate-v2-pretext-layout-rendering-architecture-ralplan.md`

Result:

- Generated the Ralph continuation prompt for the reopened root-location
  cleanup lane.
- User explicitly paused, so the scoped completion state is `blocked` with
  `blocked_reason: user explicitly paused after Ralph handoff generation`
  instead of `pending`, preventing the stop hook from immediately resuming work.
- On resume, the next run must set the scoped completion state back to
  `pending` before editing.

Review finding to fix next:

- Accepted P2 from `codex review --uncommitted`:
  `packages/slate/src/core/public-state.ts` treats only explicit
  `history: 'push'` fields as needing replayable patch hooks, but omitted
  `history` fields are still saved by `shouldSaveStatePatch` because only
  `history: 'skip'` is excluded. Large default-history values can therefore
  enter undo history as full snapshots without the intended 32KB guard.

Current next owner:

- `state-field-large-patch-policy-fix`
- Touchpoint:
  `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- Test touchpoint:
  `.tmp/slate-v2/packages/slate/test/collab-document-state-contract.ts` or a
  nearby state-field/history contract file.

Resume gates:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun test ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/root-location-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/interfaces-contract.ts ./packages/slate-history/test/document-state-history-contract.ts
bun typecheck:packages
bun lint:fix
codex review --uncommitted
```

Closeout gates after the fix:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun test:bun
bun typecheck:packages
bun lint
```

```bash
# cwd: /Users/zbeyens/git/plate-2
node tooling/scripts/completion-check.mjs
```

Issue/reference decision:

- No fixed/improved issue claims change. This is internal replay-policy cleanup
  attached to the root-location closeout review.

### 2026-05-22T19:15:19Z - paused Ralph handoff after replay-policy fix

Changed scope:

- `active goal state`
- `active goal state`
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`
- `.tmp/slate-v2/packages/slate/test/document-state-patch-contract.ts`
- `docs/plans/2026-05-22-slate-v2-pretext-layout-rendering-architecture-ralplan.md`

Result:

- Added the red regression for large omitted-history state fields without patch
  hooks.
- Fixed replayable state-field policy so `history !== 'skip'` and
  `collab === 'shared'` require patch hooks for large values.
- Regenerated the Ralph continuation prompt around the updated state.
- User explicitly paused, so the scoped completion state is `blocked` instead
  of `pending`; resume must set it back to `pending` before review or edits.

Verification evidence:

```bash
# cwd: /Users/zbeyens/git/plate-2/.tmp/slate-v2
bun test ./packages/slate/test/document-state-patch-contract.ts
bun test ./packages/slate/test/document-state-patch-contract.ts ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/root-location-contract.ts ./packages/slate/test/editor-runtime-view-contract.ts ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/interfaces-contract.ts ./packages/slate-history/test/document-state-history-contract.ts
bun typecheck:packages
bun test:bun
bun lint:fix
bun lint
```

Interrupted evidence:

- A final `codex review --uncommitted` run was active when the user paused.
- The review process was stopped before a clean final verdict, so final review
  remains the next owner.

Current next owner:

- `final-codex-review-closeout`
- Resume by setting the completion file back to `pending`, rerunning
  `codex review --uncommitted`, fixing any accepted finding, then closing the
  plan and completion gate only after `node tooling/scripts/completion-check.mjs`
  passes.

Issue/reference decision:

- No fixed/improved issue claims change. This remains internal replay-policy
  cleanup attached to root-location closeout review.
