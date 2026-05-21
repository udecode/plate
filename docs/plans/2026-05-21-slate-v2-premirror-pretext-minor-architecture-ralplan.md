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

const layout = useSlateLayout({
  engine: pretextLayoutEngine(),
  read: ({ snapshot, state }) => ({
    page: state.getField(pageSettings),
    roots: ['main'],
    typography: resolveTypography(snapshot),
  }),
})
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
- `layoutNextLine()` supports variable-width row-by-row layout for floats,
  columns, and page/frame continuation.
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

## Confidence Score

`0.86`.

High confidence on the direction. Lower than `0.9` because the derived-layout
service boundary is not implemented or proven yet, and page-layout selection /
IME / copy / find behavior needs browser proof before release claims.

## Pass-State Ledger

| Pass | Status | Evidence | Decision impact |
| --- | --- | --- | --- |
| intake and prior learning scan | complete | skills, memory, docs/solutions prefilter | treat as cross-editor architecture lane |
| Premirror architecture read | complete | local repo source/docs | page layout is derived over document truth |
| Pretext architecture read | complete | local repo source/docs | measurement needs prepare/hot-layout split |
| Slate v2 substrate read | complete | runtime/view/state/rendering files/tests | current core is mostly minor-safe |
| verdict and gap list | complete | comparison matrix | one missing boundary: derived layout service |

## Completion Gates

- verdict answers yes/no directly;
- Premirror and Pretext evidence is source-backed;
- Slate v2 gaps are concrete and mapped to minor-safe vs major-risk categories;
- no implementation code is changed in this pass.
