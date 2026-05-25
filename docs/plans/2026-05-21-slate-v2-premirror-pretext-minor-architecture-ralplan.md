# Slate v2 Premirror / Pretext Minor-Architecture Ralplan

## Question

Can Slate v2 support future Premirror-style pagination/composition and
Pretext-style text layout work as additive minor-version work, or would those
features still require another major architecture reset?

## Current Verdict

Strong take: Slate v2 is close enough that Premirror/Pretext-style work can be
developed later as additive minor-version work, but only if we keep it as a
derived layout service over the existing runtime, not as page nodes, not as a
new editor core, and not as per-page document roots.

The architecture is not "absolute best" yet. The current core substrate is
right:

- canonical document runtime with roots and state fields;
- root-bound views over one runtime;
- root-explicit operations while paths stay root-local;
- commit/state patch dirtiness;
- runtime-id based DOM coverage, projection, annotation, and virtualized
  rendering infrastructure;
- `SlateRuntime` / `<Slate root>` React provider shape for shared runtime
  views.

The missing piece is a first-class derived-layout service boundary. Without
that boundary, pagination will sprawl through decorations, virtualized rendering,
state fields, DOM coverage, and examples as one-off plumbing. That would still
be technically possible, but it would be dirty enough to force a later major API
cleanup.

Best target: add future layout/pagination as an experimental package/layer that
uses existing minor-safe substrate:

```ts
const pageSettings = defineStateField({
  key: 'document.page',
  initial: () => ({ preset: 'a4', margins: { top: 96, right: 96, bottom: 96, left: 96 } }),
  persist: true,
})

const pageLayout = useSlatePageLayout(editor, {
  engine: pretextPageLayoutEngine(),
  root: 'main',
  settings: pageSettings,
  typography: {
    block: ({ element }) => ({ lineHeight: element.type === 'heading' ? 32 : 24 }),
    text: ({ leaf }) => ({
      font: leaf.bold ? '700 16px Inter' : '400 16px Inter',
      letterSpacing: 0,
    }),
  },
})

<PagedEditable layout={pageLayout} renderingStrategy="staged" />
```

That is directional API only. The important decision is the ownership split,
not these exact names.

Hard rule: page layout output is derived view data. It must not become Slate
document content.

## Decision Criteria

- raw Slate remains unopinionated;
- pagination/layout engines can live outside the core document model;
- extension/state/operation contracts can represent page/layout metadata without
  changing node semantics;
- React DOM rendering can support hidden/virtual/page-composed views without
  breaking selection, IME, and browser editing;
- multi-root/view ownership can be developed incrementally;
- future API additions can be minor-compatible because existing public contracts
  already leave room for them.

## Evidence To Read

- `../premirror`
- `../pretext`
- `.tmp/slate-v2`
- `docs/analysis/editor-architecture-candidates.md`
- prior Slate v2 architecture and virtualization plans/research under
  `docs/research/**` and `docs/plans/**`

## Source Evidence

### Premirror

Premirror's architecture is directly compatible with Slate v2's current
direction:

- ProseMirror remains document/editing truth while the composer derives measured
  pages, frames, line boxes, and placed runs from a snapshot.
- Milestone 1 explicitly uses one `EditorView` / one `contenteditable` root with
  composer-driven visual pagination; true multi-root page edit surfaces are
  deferred.
- The source paragraph stays one logical node while page layout splits it into
  `BlockFragment` records.
- Measurement is upstream of `composeLayout`, so composition remains
  deterministic for stable measured inputs.
- Future hard cases are columns, floats, anchors, tables, headers/footers,
  footnotes, and constrained area allocation.
- Premirror's own fork triggers are exactly the dangerous areas: multiple
  editable roots per document, root DOM structure override, or low-level
  selection/caret painting.

Current source confirms the draft:

- `@premirror/core` defines page specs, layout policy, measured/unmeasured
  snapshots, page/frame/fragment/line/run output, mapping, diagnostics, and
  band obstacles.
- `@premirror/composer` is a pure-ish `composeLayout(snapshot, previous, input)`
  pipeline with page/frame output, widow/orphan policy, obstacle bands, and
  PM-position mapping.
- `@premirror/prosemirror-adapter` extracts blocks/runs, measures runs with
  Pretext, stores invalidation in plugin state, and exposes page-break commands.
- `@premirror/react` computes layout from state/runtime/input, renders page
  chrome, overlays the editable layer, and projects selection to layout rects.

### Pretext

Pretext is the measurement primitive Slate should steal as a boundary, not as a
core dependency:

- `prepare()` does normalization, segmentation, glue rules, and width
  measurement once.
- `layout()` is the hot resize path and stays arithmetic-only over cached
  widths.
- `layoutNextLineRange()` supports variable-width row-by-row layout for floats,
  columns, page/frame continuation, and non-materializing page composition.
- The checked-in status reports clean Chrome/Safari/Firefox accuracy sweeps and
  benchmark snapshots where `layout()` is tiny compared with preparation.
- The research log repeatedly rejects moving measurement or string verification
  back into the hot layout path.

Implication: Slate's layout layer needs a prepare/measure cache keyed by
snapshot version, runtime id/text/style signature, and font readiness. It should
not compute layout inside React render and should not use state fields for
ephemeral measurement caches.

### Slate v2 Current Substrate

What is already good:

- `createEditorRuntime` and `createEditorView` split value/runtime ownership
  from root-bound view policy.
- `SlateRuntime`, `useSlateRuntime`, `useSlateRuntimeState`, and root-bound
  `<Slate root>` exist in `slate-react`.
- canonical value supports `{ roots, state? }`; state fields use
  `defineStateField`; commits include `statePatches` and dirty state keys.
- rooted operations keep root identity outside numeric `Path`, and point/range
  transforms are root-aware.
- projection/decoration stores support source ids, dirtiness, runtime scopes,
  runtime-id subscriptions, refresh reasons, and metrics.
- DOM coverage already has virtualized/hidden boundary records with
  materialize/copy/find policies.
- TanStack virtualized rendering uses runtime-id keys, retained selected indexes,
  coalesced missing ranges, and `viewport-virtualization` boundaries.

What is not good enough yet:

- Layout output has no first-class owner. Today it would be forced into a mix of
  decoration sources, projection stores, ad hoc React hooks, and DOM coverage.
- Projection sources project ranges, not rich layout geometry. Premirror needs
  PM-position/LayoutPoint and range-to-rect mapping.
- DOM coverage reasons are editor-internal union literals. Page layout can add
  another reason as a minor, but the policy should be designed before examples
  teach it.
- State fields are correct for persisted page settings, headers/footers config,
  section options, and print metadata; they are wrong for transient layout
  caches.
- Multi-root is correct for header/footer/global editable regions. It is wrong
  for splitting one body paragraph across pages. Page fragments are view data,
  not content roots.
- Current virtualized rendering is top-level-block oriented. Page composition
  needs fragment/line geometry and page/frame indexing.

## Minor-Compatible Architecture Target

To keep future page/layout work minor-safe, the stable core contract should be:

1. Content truth stays Slate value/operations.
2. Durable page settings use state fields.
3. Layout is a derived service fed by committed snapshots and dirty commit
   facts.
4. Measurement caches are local service/runtime caches, not persisted state.
5. Layout output is a versioned snapshot with:
   - pages, frames, fragments, lines, placed runs;
   - source root/runtime ids and path/range spans;
   - geometry rects;
   - mapping functions or indexed mapping tables.
6. React consumes layout through a store/subscription API, not by recomputing in
   component render.
7. DOM coverage handles missing/fragmented DOM with explicit policies:
   materialize, model-backed copy/paste, custom find, and selection projection.
8. `SlateRuntime` owns shared document truth; `<Slate root>` owns editable root
   views. Page viewports are visual projections over a root, not roots
   themselves.
9. Pretext or any future text engine is an optional package-level engine, not a
   dependency of `slate` core.

## Recommended Future Package Shape

Do not build "Premirror inside Slate core." Build a Slate-native layout layer:

| Package | Responsibility |
| --- | --- |
| `slate` | document runtime, roots, state fields, operations, commits, snapshots |
| `slate-dom` | DOM coverage, materialization, selection/DOM bridge policies |
| `slate-react` | provider/view runtime, editable rendering, projection consumption |
| `slate-layout` or `slate-page-layout` | derived layout service contracts and layout store |
| `slate-layout-pretext` | Pretext measurement/layout engine adapter |

The package can be experimental at first. The core APIs it uses should not be
experimental: snapshots, runtime ids, state fields, commit dirtiness, runtime
subscriptions, and DOM coverage policy.

## Direct Answer

Are we absolute best today? No.

Are we on the right architecture to make Premirror/Pretext-style work a minor
later? Yes, if the next architecture cleanup is a small derived-layout service
boundary, not another document-model rewrite.

What would make it a future major:

- storing page fragments as nodes;
- making one document page equal one Slate root;
- exposing Pretext-specific APIs from `slate` core;
- recomputing layout in React render;
- hiding layout in decorations only;
- letting DOM coverage/materialization policy stay implicit;
- shipping page-layout examples before selection/copy/IME/find degradation
  policies are named and tested.

What keeps it minor:

- public APIs stay generic: state fields, runtime views, snapshots, projections,
  DOM coverage, layout service;
- page layout lives in an optional package;
- all initial pagination APIs are additive;
- experimental layout package APIs can churn while core contracts stay stable.

## Pagination / Rendering Strategy Pressure Pass

User question: should we tackle the breaking changes now with an experimental
pagination example, and is `slate-layout` actually a rendering strategy next to
virtualization?

Strong answer: yes, use an experimental pagination example now as the API
pressure test. Do not wait until after beta. But do not model pagination as
`renderingStrategy={{ type: 'paginated' }}`.

`slate-layout` is not inherently breaking. It becomes breaking only if we teach
layout through the wrong public slot and later need to unwind it. The current
break-risk is naming and ownership, not the existence of a layout package.

### Decision

Keep `renderingStrategy` scoped to DOM materialization strategy:

- `auto`
- `staged`
- `full`
- `shell`
- experimental object-only `virtualized`

Add pagination through a separate derived page-layout surface:

```tsx
const pageLayout = useSlatePageLayout(editor, {
  engine: pretextPageLayoutEngine(),
  root: 'main',
  settings: PageSettingsField,
})

<PagedEditable
  layout={pageLayout}
  renderingStrategy={{ type: 'virtualized', threshold: 200 }}
/>
```

That API is directional. The important split is:

- `PageSettingsField`: durable document-owned page config.
- `useSlatePageLayout`: how document snapshots become pages, frames, fragments,
  lines, placed runs, geometry, and mapping tables.
- `PagedEditable`: the optional paginated view over raw Slate editing.
- `renderingStrategy`: how much editable DOM is mounted for the current view.
- `DOMCoverage`: how missing or fragmented editable DOM maps selection, copy,
  paste, find, materialization, and accessibility policy.

Pagination may internally use virtualization for page viewports. That does not
make pagination a rendering strategy. Virtualization answers "which ranges are
mounted?". Pagination answers "what geometry exists?" Those are different
questions. Blurring them would be dirty API.

### Breaking-Change Call

Do not rename `renderingStrategy` just because pagination exists. The current
source and docs already describe it as large-document DOM rendering and native
surface degradation, which is the right scope.

Do break before beta if any public docs or examples start describing
`renderingStrategy` as the general "view layout" API. The fix is to introduce
the separate page-layout surface before users learn the wrong mental model.

### Experimental Example Target

Build one experimental pagination example to prove the boundary:

1. Page settings are document-owned state fields only when they are durable
   document metadata.
2. Measurement/cache data stays outside persisted state.
3. Layout reads committed snapshots and dirty facts, then writes a versioned
   layout snapshot/store.
4. Page fragments are view data, not Slate nodes and not Slate roots.
5. Header/footer can use multi-root views later, but body pagination must not
   split one body paragraph into per-page roots.
6. Selection, copy, browser find, IME/mobile, and screen-reader degradation are
   named in the example even if the first implementation marks some rows
   experimental.

The first example can be visually humble. It should prove the API boundary, not
pretend page layout is production-ready.

### Evidence

- Current `RenderingStrategyOptions` already keeps `virtualized` object-only and
  explicitly calls it "viewport-only rendering" so it does not look like a stable
  peer of `full`, `staged`, or `shell`.
- Current `Editable` docs define rendering strategy as staged/full/shell DOM
  rendering and RUM for mounted/pending DOM counts.
- Current virtualized rendering docs scope it to pathological documents, DOM
  pressure, bounded scroll surface, and native behavior limits.
- Compiled layout research says Premirror splits snapshot, measure, compose, and
  viewport rendering; Pretext splits preparation from hot-path layout.

## Deep API / DX Pass

User request: absolute-best API/DX with an experimental pagination example,
grounded in deep reads of `../pretext`, `../premirror`, and live Slate v2.

### Current Source Read

Live current owners:

- State fields exist in
  `.tmp/slate-v2/packages/slate/src/core/state-field.ts` and expose
  `getField` / `setField` from
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`.
- Runtime/root views exist in
  `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts` and
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`.
- `renderingStrategy` is currently DOM materialization policy in
  `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts`
  and `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`.
- DOM coverage already models missing DOM policy in
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts`.
- Projection stores project ranges, not page geometry, in
  `.tmp/slate-v2/packages/slate-react/src/projection-store.ts`.

External source read:

- `../pretext/src/layout.ts` keeps `prepare()` and
  `prepareWithSegments()` as width-independent preparation, while `layout()`,
  `walkLineRanges()`, `layoutNextLineRange()`, and `layoutWithLines()` are
  hot-path arithmetic over prepared data.
- `../pretext/src/measurement.ts` owns canvas measurement caches, browser
  profile shims, emoji correction, and font measurement state.
- `../pretext/STATUS.md` reports clean 7680/7680 browser accuracy snapshots and
  separates `prepare()` cost from tiny `layout()` cost.
- `../premirror/docs/design-proposal.md` makes document truth, composer layout,
  renderer, and mapping separate owners.
- `../premirror/packages/core/src/index.ts` models page settings, margins,
  typography, policies, measured snapshots, page/frame/fragment/line output,
  mapping, diagnostics, and obstacles.
- `../premirror/packages/prosemirror-adapter/src/index.ts` extracts snapshots,
  measures runs, tracks invalidation, and exposes page-break commands.
- `../premirror/packages/composer/src/index.ts` composes measured snapshots into
  deterministic pages/fragments/lines with policy and mapping output.
- `../premirror/packages/react/src/index.tsx` runs snapshot -> measure -> compose
  in a hook, renders page chrome, and projects selection rects.

Post-pull Pretext refresh after `18770ad`:

- `@chenglou/pretext` is now `0.0.7` and exports
  `@chenglou/pretext/rich-inline`.
- `PrepareOptions` now includes `letterSpacing`; page layout cache keys must
  include it with font and text.
- `layoutNextLineRange()` and `materializeLineRange()` are the better primitive
  for page composition because they stream line geometry without eagerly building
  strings.
- `measureLineStats()` gives shrinkwrap/stats without allocations.
- `prepareRichInline()` / `layoutNextRichInlineLineRange()` support styled inline
  runs, mentions/chips via `break: 'never'`, caller-owned `extraWidth`, and
  collapsed boundary spaces.

Impact: no architecture reversal. It strengthens the `slate-layout-pretext`
adapter and changes the implementation target from plain paragraph text only to
plain text plus rich-inline flow.

### Corrected Take

The earlier call-site sketch was too coarse:

```tsx
<Editable
  layoutStrategy={{
    engine: pretextLayoutEngine(),
    page: { preset: 'a4', margins: 96 },
    type: 'paginated',
  }}
/>
```

That is acceptable as shorthand in a chat answer, but it is not the absolute
best API. It hides three different ownership layers in one prop.

Best DX:

1. Persisted document page settings are state fields.
2. Layout computation is a runtime service/store.
3. Paged rendering is an optional package component that consumes that store.
4. DOM mounting/windowing remains `renderingStrategy`.

### Accepted Public API Target

Package split:

| Package | Public role |
| --- | --- |
| `slate` | `defineStateField`, snapshots, commits, roots, operations |
| `slate-dom` | DOM coverage/materialization policy |
| `slate-react` | runtime/view/editable substrate and `renderingStrategy` |
| `slate-layout` | page layout contracts, state-field helpers, layout store, React components |
| `slate-layout-pretext` | Pretext-backed text measurement/page engine adapter |

Core field shape:

```ts
import { defineStateField } from 'slate'

type PageSettings = {
  margins: number | { bottom: number; left: number; right: number; top: number }
  preset: 'a4' | 'letter'
}

export const PageSettingsField = defineStateField<PageSettings>({
  key: 'layout.page',
  initial: () => ({ margins: 96, preset: 'a4' }),
  persist: true,
  collab: 'shared',
  history: 'push',
})
```

Reason: page preset and margins are document-owned metadata. They should
serialize with the document, collaborate when the product supports shared page
settings, and be undoable when the user changes them as document formatting.
Apps can choose `collab: 'local'` or `history: 'skip'` only for view-local
preferences.

Experimental page layout hook:

```tsx
import { createEditor } from 'slate'
import { Slate } from 'slate-react'
import { PagedEditable, useSlatePageLayout } from 'slate-layout/react'
import { pretextPageLayoutEngine } from 'slate-layout-pretext'

const editor = createEditor({
  extensions: [PageSettingsField],
})

function Example() {
  const pageLayout = useSlatePageLayout(editor, {
    engine: pretextPageLayoutEngine(),
    root: 'main',
    settings: PageSettingsField,
    typography: {
      block: ({ element }) => ({
        lineHeight: element.type === 'heading' ? 32 : 24,
      }),
      text: ({ leaf }) => ({
        font: leaf.bold ? '700 16px Inter' : '400 16px Inter',
        letterSpacing: 0,
      }),
    },
  })

  return (
    <Slate editor={editor}>
      <PagedEditable
        layout={pageLayout}
        renderingStrategy="staged"
        renderPage={({ attributes, children, page }) => (
          <div
            {...attributes}
            className="page"
            style={{
              height: page.height,
              width: page.width,
            }}
          >
            {children}
          </div>
        )}
      />
    </Slate>
  )
}
```

Important naming decision:

- Use `useSlatePageLayout`, not `useSlateLayout`, for the first package API.
  "Layout" alone is too broad and will turn into a junk drawer for columns,
  cards, masonry, virtualization, page chrome, and product positioning.
- Use `PagedEditable`, not `<Editable layoutStrategy={...}>`, for the
  experimental rendering component. It keeps raw `Editable` unopinionated while
  still showing a first-class call site.
- Use `layout={pageLayout}`, not `layoutStrategy={...}`. By render time this is
  not a strategy object; it is a live layout store with snapshots, metrics,
  mapping, and invalidation.
- Keep `renderingStrategy` as a separate prop on `PagedEditable`, forwarded to
  the underlying editable surface. Pagination can be paged and still choose
  staged/full/virtualized DOM mounting.

Advanced service shape:

```ts
type SlatePageLayout = {
  getSnapshot: () => SlatePageLayoutSnapshot
  getMetrics: () => SlatePageLayoutMetrics
  projectRange: (range: Range) => readonly Rect[]
  refresh: (reason?: 'editor' | 'font' | 'settings' | 'viewport') => void
  subscribe: (listener: () => void) => () => void
}
```

The store is the critical API, not the React hook. The hook is convenience.
This keeps non-React, test, print/export, minimap, and toolbar consumers from
depending on React component render.

### Experimental Example Contract

Example name: `Pagination`.

Purpose: prove the architecture boundary, not ship a production word processor.

Required controls:

- page preset selector: A4 / Letter;
- margin input;
- rendering strategy selector: staged / full / experimental virtualized;
- page count and timing metrics;
- toggle for debug frames/fragments.

Required code shape:

- define `PageSettingsField` at module scope;
- create the editor with the field extension;
- create `pageLayout` with `useSlatePageLayout`;
- render `PagedEditable`;
- update page settings with `useSetStateField(PageSettingsField)`;
- no page nodes;
- no per-page roots for body content;
- no measured layout output stored in state fields;
- no Pretext import from `slate` or `slate-react`.

Required behavior disclaimers in docs/example:

- experimental;
- native find is not full-document when DOM is virtualized;
- IME/mobile near page boundaries is release-gated;
- screen-reader strategy is not claimed;
- copy/selection across page fragments must be model-backed before production.

### Internal Runtime Target

`slate-layout` owns a derived layout store:

1. Subscribe to editor commits.
2. Read committed snapshot and `dirtyTopLevelRuntimeIds` /
   `dirtyTopLevelRanges`.
3. Read durable page settings through `state.getField(PageSettingsField)`.
4. Extract block/run snapshots keyed by root, runtime id, path, text, marks, and
   typography signature.
5. Prepare/measure text outside React render.
6. Compose measured snapshots into pages, frames, fragments, lines, and mapping.
7. Publish a versioned immutable layout snapshot.

`slate-layout-pretext` owns:

- `prepareWithSegments()` for plain text;
- `layoutNextLineRange()` / `materializeLineRange()` for non-materializing page
  composition;
- `prepareRichInline()` / `layoutNextRichInlineLineRange()` for Slate leaves,
  styled runs, and atomic inline boxes;
- `letterSpacing` in typography signatures and cache keys;
- font readiness and named-font accuracy policy;
- measurement caches;
- engine profiling;
- `system-ui` warning/fallback.

`slate-react` owns:

- actual editable DOM rendering;
- `renderingStrategy`;
- selection/input/clipboard bridge;
- DOM coverage policy for missing or fragmented DOM.

### Rejected Alternatives

| Alternative | Verdict | Reason |
| --- | --- | --- |
| `renderingStrategy={{ type: 'paginated' }}` | reject | Pagination is geometry/mapping; rendering strategy is DOM mounting. |
| `<Editable layoutStrategy={{ page, engine }}>` | reject as public target | Too much hidden ownership in one prop; acceptable only as shorthand. |
| Store layout output in state fields | reject | Layout output is transient derived data and would poison history/collab. |
| Store page fragments as Slate nodes | reject | Breaks document truth and makes page layout a model mutation. |
| Use one Slate root per body page | reject | Splitting one paragraph across pages must be view data, not root data. |
| Put Pretext in `slate` core | reject | Measurement engine is optional package-level infrastructure. |
| Decorations-only pagination | reject | Range projections cannot express page/frame/line geometry and mapping. |
| Recompute layout in React render | reject | Pretext and Premirror both prove prepare/measure/compose must be explicit. |

### Ecosystem Synthesis

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pretext | `../pretext/src/layout.ts`, `../pretext/src/measurement.ts`, `../pretext/src/rich-inline.ts`, `../pretext/STATUS.md` | prepare once, layout cheaply, cache measurement by font/text/browser profile, stream range geometry, and support rich inline runs | DOM reflow, resize-time measurement, eager line-string allocation, and userland rich-inline hacks | prepare/measure/cache outside render, named-font test fixtures, hot layout path, `layoutNextLineRange()`, `prepareRichInline()` | treating it as editor/runtime core | optional `slate-layout-pretext` engine with plain-text and rich-inline paths | agree |
| Premirror | `../premirror/docs/design-proposal.md`, `../premirror/packages/*/src` | extract snapshot, measure snapshot, compose deterministic layout, render page viewport, map positions | document/layout ownership collapse | measured snapshot boundary, layout output model, mapping index, timing metrics | ProseMirror-specific positions/plugins/schema assumptions | `slate-layout` derived store over Slate snapshots/runtime ids | agree |
| Slate v2 | live `.tmp/slate-v2` state/runtime/rendering/DOM coverage source | state fields, roots/views, runtime ids, DOM coverage, rendering strategy | forcing page layout into nodes or decorations | state field for settings, runtime-id keyed extraction, DOM coverage policy | adding pagination to raw `Editable` core | optional `PagedEditable` over core substrate | agree |

### Issue Accounting

No new fixed issue claim.

| Issue | Cluster | Claim | Why | Proof route | Ledger status |
| --- | --- | --- | --- | --- | --- |
| #5944 | pagination-and-layout-composition | Related | The API directly targets stable pagination as a future capability, but the issue lacks a current repro and this pass changes no implementation. | future experimental pagination example and browser proof | keep `issue-reviewed` |
| #5924 | pagination-and-layout-composition | Related / Not claimed | Structural DOM exclusion pressure overlaps page chrome and fragmented DOM, but the row is stale and no public ignore-cursor API is claimed. | DOM coverage policy, future page chrome browser proof | keep `triage-closed` |
| #790 | large-document-virtualization-and-windowing | Related | Pagination may use viewport virtualization internally, but this pass does not change virtualization proof or default strategy. | existing rendering-strategy benchmarks plus future paged viewport stress | keep `cluster-synced` |

`docs/slate-v2/references/pr-description.md` unchanged: this is planning-only,
adds no `Fixes` / `Improves` line, and does not represent a current PR
implementation slice.

### Proof Matrix For Ralph Execution

| Proof | Cwd | Command / route | Required result |
| --- | --- | --- | --- |
| State field contract | `.tmp/slate-v2` | focused `slate` state-field tests | page settings persist, patch, history, and collab as configured |
| Layout deterministic unit | `.tmp/slate-v2` | `slate-layout` package tests | same snapshot/input yields identical layout output and mappings |
| Pretext engine unit | `.tmp/slate-v2` | `slate-layout-pretext` package tests | prepare cache, named font policy, `letterSpacing`, line-range mapping, and rich-inline flow stay deterministic |
| React component contract | `.tmp/slate-v2` | `slate-layout/react` tests | `PagedEditable` renders page chrome and preserves editor input ownership |
| Browser page-boundary proof | `.tmp/slate-v2` | focused Playwright route for pagination example | type at page boundary without oscillating page breaks |
| Selection/copy proof | `.tmp/slate-v2` | browser route crossing page fragments | model-backed selection and copy across fragments |
| IME/mobile gate | `.tmp/slate-v2` | device/browser lane when available | no production claim until green |
| Performance stress | `.tmp/slate-v2` | 50-page and 500-paragraph layout benchmark | extraction/measurement/compose timings separated; local edit p50/p95 recorded |

### Scorecard

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.92 | Layout service/store keeps prepare/measure/compose outside React render; `PagedEditable` consumes a store; existing `renderingStrategy` remains DOM policy. |
| Slate-close unopinionated DX | 0.94 | API uses state fields, editor/runtime, optional package, and render props; raw `Editable` stays unopinionated and does not learn page-specific props. |
| Plate and slate-yjs migration backbone | 0.90 | Page settings can be shared/patched state fields; layout output stays local derived data; no current adapter claim. |
| Regression-proof testing strategy | 0.90 | Proof matrix names unit, browser, selection/copy, IME/mobile, and performance gates with `.tmp/slate-v2` ownership. |
| Research evidence completeness | 0.95 | Deep local source reads from Pretext and Premirror plus live Slate v2 source, with ecosystem synthesis tied to specific mechanisms. |
| shadcn-style composability/minimalism | 0.92 | `PagedEditable`, `renderPage`, and state-field controls keep the call site small while avoiding hidden monolith props. |

Total: `0.92`.

This passes the API/DX planning threshold. It does not claim production
pagination readiness; executable `.tmp/slate-v2` package and browser proof is
the next `ralph` implementation lane.

### Deep Pass Decision

Absolute-best API target:

- `PageSettingsField`: persisted document page config.
- `useSlatePageLayout`: hook that creates/subscribes to a page layout store.
- `SlatePageLayout`: non-React store interface for snapshots, metrics, refresh,
  mapping, and subscriptions.
- `PagedEditable`: optional experimental component from `slate-layout/react`.
- `renderingStrategy`: still separate DOM mounting policy, forwarded into the
  underlying editable.
- `slate-layout-pretext`: optional Pretext engine adapter.

Do not ship `layoutStrategy` as the public API. It sounds clean, but it hides
the store. The best API says what the thing is: page layout.

## Confidence Score

`0.92`.

High confidence on the API direction. Production readiness still depends on the
proof matrix under `.tmp/slate-v2`.

## Pass-State Ledger

| Pass | Status | Evidence | Decision impact |
| --- | --- | --- | --- |
| intake and prior learning scan | complete | skills, memory, docs/solutions prefilter | treat as cross-editor architecture lane |
| Premirror architecture read | complete | local repo source/docs | page layout is derived over document truth |
| Pretext architecture read | complete | local repo source/docs | measurement needs prepare/hot-layout split |
| Slate v2 substrate read | complete | runtime/view/state/rendering files/tests | current core is mostly minor-safe |
| verdict and gap list | complete | comparison matrix | one missing boundary: derived layout service |
| pagination/layout API pressure pass | complete | live `.tmp/slate-v2` rendering strategy source/docs plus compiled Premirror/Pretext research | start an experimental pagination example now; keep layout separate from `renderingStrategy`; `slate-layout` can stay additive |
| deep pagination API/DX pass | complete | deep local `../pretext` and `../premirror` source/docs plus live `.tmp/slate-v2` state/runtime/rendering/DOM coverage source | replace `layoutStrategy` target with `PageSettingsField` + `useSlatePageLayout` + `SlatePageLayout` store + `PagedEditable` |
| closure and final gates | complete | scorecard at `0.92`, no implementation claim, no PR issue claim, completion gates below | close the Ralplan planning lane; next owner is `ralph` implementation, not more API review |

## Plan Deltas

- Strengthened the earlier `layoutStrategy` sketch into the final
  `PageSettingsField` + `useSlatePageLayout` + `SlatePageLayout` +
  `PagedEditable` API.
- Kept `renderingStrategy` scoped to DOM mounting/windowing.
- Moved `preset: 'a4'` and `margins: 96` into a persisted document state field.
- Kept layout output, measurement caches, and Pretext preparation outside state
  fields.
- Classified pagination-related issues as related only; no fixed or improved
  issue claim.

## Fast Driver Gates

| Gate | Cwd | Status |
| --- | --- | --- |
| Plan artifact state | `plate-2` | complete in this file |
| Completion hook | `plate-2` | `node tooling/scripts/completion-check.mjs` passed |
| Slate v2 behavior proof | `.tmp/slate-v2` | initial Ralph implementation slice complete |
| Future implementation proof | `.tmp/slate-v2` | deeper selection/copy, IME/mobile, and stress gates remain future production-readiness work |

## Ralph Execution Log

### 2026-05-21 Experimental Pagination Slice

Status: complete for the first experimental API/example slice. This is not a
production pagination claim.

Implemented in `.tmp/slate-v2`:

- `packages/slate-layout`: page settings types, page preset/margin normalization,
  page layout store, shared block paginator, estimated engine, React hook, and
  `PagedEditable`.
- `packages/slate-layout-pretext`: optional Pretext-backed layout engine using
  `@chenglou/pretext@0.0.7` and the shared block paginator.
- `site/examples/ts/pagination.tsx`: `Pagination` example with page settings
  state field, preset/margin controls, rendering-strategy forwarding, metrics,
  and debug page frame toggle.
- Source-first typecheck repair: `slate-dom` and `slate-react` source
  entrypoints reference their ambient declarations so package consumers can
  typecheck through monorepo path aliases.

Important implementation decisions:

- Settings are read from `EditorStateField<SlatePageSettings>`; layout output is
  only in the derived layout store.
- `useSlatePageLayout` keeps options behind a ref and refreshes only when the
  meaningful option identities change.
- The example reads current settings from `useSlatePageLayoutSnapshot(layout)`
  instead of separately subscribing to the same object state field.
- `PagedEditable` forces the underlying editable back to `zIndex: 0` by default;
  without that, the page wrapper intercepts pointer events because raw
  `Editable` defaults to `zIndex: -1`.
- `pretextPageLayoutEngine` keeps a bounded prepared-text cache in the engine
  closure so refreshes reuse Pretext's expensive `prepare()` output when block
  text/style did not change.
- Pretext tests install a deterministic fake `OffscreenCanvas`; Pretext itself
  still requires a browser canvas or `OffscreenCanvas` for real measurement.
- `native-input-strategy-contract.test.ts` fake editor state was updated with
  `view.root()` after the broad check exposed a stale test mock.

Verification from `.tmp/slate-v2`:

- `bun --filter slate-layout test`: passed, 2 tests.
- `bun --filter slate-layout-pretext test`: passed, 1 test.
- `bun --filter slate-layout typecheck`: passed.
- `bun --filter slate-layout-pretext typecheck`: passed.
- `bun typecheck:site`: passed.
- `bun --filter slate-layout build`: passed.
- `bun --filter slate-layout-pretext build`: passed.
- `bun lint:fix`: passed.
- `bun check`: passed; package typecheck, site/root typecheck, Bun tests
  `1157 pass / 95 skip / 0 fail`, Slate React Vitest `37 files / 321 tests`
  passed.
- Browser fallback proof on `http://localhost:3100/examples/pagination`:
  rendered with no Next error dialog, one editable, page metrics visible,
  initial metrics `pages:1 / blocks:4`, margin edit updated metrics to
  `pages:2`, and normal click/type into the editor worked.
- Reusable learning captured in
  `docs/solutions/developer-experience/2026-05-21-slate-layout-source-entry-and-paged-editable-dx.md`.

Follow-up Browser overlap fix:

- User reported overlapping pages from the real in-app Browser.
- Reproduced in `@Browser` on `http://localhost:3100/examples/pagination` with
  margins `144`: first editable bottom `1539.5`, second page top `1418.8`.
- Root cause: the example's custom `renderPage` used fixed `height:
  page.height`; with today's continuous editable DOM, overflowing content can
  paint into the next page.
- Fix: custom page chrome now uses `minHeight: page.height`, matching the
  default `PagedEditable` page behavior.
- Browser verification after fix: first page grows to contain the continuous
  editable, second page starts after a `24px` gap, `editableOverlapsSecondPage:
  false`, `pageRectsOverlap: false`, no Next error dialog.
- Screenshot:
  `.tmp/019e46be-4ec4-7d11-bc6e-9fcf033a8803/pagination-overlap-fixed.png`.

Known non-claims:

- No true fragmented editable DOM across page bodies yet.
- No production selection/copy proof across page fragments yet.
- No IME/mobile pagination claim yet.
- No performance stress numbers yet.

## Final User-Review Handoff Outline

- Best API: `PageSettingsField` + `useSlatePageLayout` + `SlatePageLayout` store
  + `PagedEditable`.
- Do not ship `layoutStrategy` as the public API.
- `preset: 'a4'` and `margins: 96` belong in editor state fields when they are
  document-owned page settings.
- Layout output is transient derived view data, not Slate content and not
  persisted state.
- Pretext belongs in `slate-layout-pretext`, not `slate` or `slate-react`.
- Pagination is separate from `renderingStrategy`; it may use virtualization, but
  it is not virtualization.
- Example name: `Pagination`; it should expose preset, margins, rendering
  strategy, metrics, and debug fragments.
- Next build owner: `ralph`, with the proof matrix above as acceptance criteria.

## Completion Gates

- verdict answers yes/no directly;
- Premirror and Pretext evidence is source-backed;
- Slate v2 gaps are concrete and mapped to minor-safe vs major-risk categories;
- pagination/rendering strategy ownership is decided before beta;
- absolute-best experimental example call site is recorded;
- no implementation code is changed in this pass.
