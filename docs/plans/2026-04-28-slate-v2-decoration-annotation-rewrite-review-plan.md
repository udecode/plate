# Slate v2 Decoration And Annotation Rewrite Review Plan

Date: 2026-04-28
Status: done; Pass 1-7 complete
Scope: review, research, and plan-hardening only. No Slate v2 implementation edits in this lane.
Score: 0.929 after Pass 7

## 1. Current Verdict

Harsh take: keep the rewrite, but hard-cut the public API shape. The plan is
strong enough to execute; the live implementation is not allowed to claim
field-best performance until the dirty-id runtime and metric gates exist.

The good part is real. The rewrite has the right split between transient
decorations, durable annotations, and positioned widgets. It already uses
runtime-id slices, `useSyncExternalStore`, source ids, refresh reasons, and
browser examples. That is a much better substrate than forcing every overlay
through React render state.

The bad part is also real. `ProjectionStore` is still the public-feeling center
of gravity. The API names are engine-shaped: `projectionStore`,
`SlateProjectionSource`, `dirtiness`, `runtimeScope`, `sourceId`, and
`useDecorationSelector`. Those names expose the plumbing before the product
concepts. Worse, once a source is considered dirty, the current projection path
still recomputes the full source result and reprojects every range.

The closure decision is blunt:

- keep `Decoration`, `Annotation`, and `Widget` as first-class public nouns;
- keep classic `decorate` for simple Slate DX;
- add product-noun source/store APIs for scale;
- move `ProjectionStore` out of normal docs and examples;
- require annotation-id and widget-id dirtiness before calling annotation/widget
  performance done;
- require source read, projected range, changed runtime bucket, subscriber wake,
  invalid range, and full fallback metrics before field-best claims;
- keep Plate/slate-yjs support at the migration-backbone level, not current
  adapter compatibility.

This is not a pivot away from decorations/annotations/widgets. The split is
correct. The next serious move is to make the public API smaller and more
Slate-close, then move source-scoped invalidation below React so a single
external decoration or annotation source does not behave like a whole-document
render tax.

## 2. Confidence Scorecard With Evidence References

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.92 | Core publishes dirty paths, touched runtime ids, decoration impact ids, and node impact ids in `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:518` through `:613` and `:1361` through `:1408`. `createSlateProjectionStore` has runtime/source subscribers and runtime-scope skips, but still calls `source(context.snapshot)` and rebuilds a whole projection snapshot in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:295` through `:308`. `createSlateAnnotationStore` still rebuilds all annotation and projection snapshots in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:238` through `:254`. Pass 4 and Pass 7 make dirty-id recompute, metric budgets, and field-best claim gates mandatory before implementation closure. |
| Slate-close unopinionated DX | 0.20 | 0.92 | Pass 3 accepts classic `decorate` for simple transient ranges and product-noun source lanes for scale. Pass 7 accepts the hard cut: normal docs and examples teach `decorate`, `createDecorationSource`, `createAnnotationStore`, and `createWidgetStore`; `ProjectionStore`, `dirtiness`, `runtimeScope`, `sourceId`, and low-level projection selectors move to advanced/internal territory. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.93 | Pass 6 verifies the raw Slate backbone: schema specs and state/tx extension namespaces in `/Users/zbeyens/git/slate-v2/packages/slate/test/migration-backbone-contract.ts:32` through `:133` and `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts:27` through `:209`; deterministic operation replay, commit tags, and local-only runtime targets in `/Users/zbeyens/git/slate-v2/packages/slate/test/migration-backbone-contract.ts:135` through `:195` and `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:28` through `:203`; command/operation middleware and commit metadata in `/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-contract.ts:385` through `:432` and `:560` through `:698`. Current-version Plate and slate-yjs adapters remain explicitly out of scope. |
| Regression-proof testing strategy | 0.20 | 0.95 | `/Users/zbeyens/git/slate-v2/package.json` keeps fast `check` separate from `check:full` and `test:stress`. `slate-browser` first-party contracts enumerate operation families and legacy parity in `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts`. Generated stress/replay exists in `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts` and `replay.test.ts`. Integration rows cover search focus, hover toolbar, tables, images, mentions, review comments, persistent annotations, and external decorations. Pass 5 and Pass 7 make overlay load rows and hard metric budgets required implementation acceptance criteria, not optional follow-up. |
| Research evidence completeness | 0.15 | 0.93 | Existing research covers React 19.2 external stores/background UI, ProseMirror decorations/bookmarks, Lexical mark/comment/decorator split, Tiptap comments/suggestions, Slate v2 overlay decisions, source-scoped invalidation, and state/tx extension namespaces. Pass 2 corrected stale local Slate v2 proof refs; Pass 7 ties closure decisions back to `/Users/zbeyens/git/plate-2/docs/research/systems/slate-v2-overlay-architecture.md:25` through `:127`, `/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md:25` through `:88`, and `/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md:25` through `:180`. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.92 | Pass 3 cuts normal authoring away from projection plumbing and toward small store/controller objects plus product-noun hooks. Pass 7 accepts minimal normal hooks by concept: `useDecorations`, `useAnnotations`, `useAnnotation(id)`, `useWidgets`, and `useWidget(id)`, with projection selectors kept advanced/internal. |

Weighted total: `0.929`.

This passes the review floor. It does not mean the implementation is complete;
it means the plan is now precise enough to execute.

## 2.1 Pass 2 Research And Live-Source Refresh

Status: complete for Pass 2 only. At that pass, completion remained `pending`.

Verdict: Pass 2 confirms the Pass 1 critique. The research layer already had
the right high-level conclusion: the overlay split is correct, and the next
perf move is source-scoped invalidation below React. The live source confirms
that the system is still too projection-store-shaped at the public edge.

The refresh also found stale compiled research references. The local proof page
still pointed at `decoration-sources.ts` and `use-slate-decoration-sources.tsx`,
but current `../slate-v2` has no dedicated decoration-source layer. Decoration
source behavior lives in `projection-store.ts` through `dirtiness`,
`runtimeScope`, `sourceId`, `refresh`, and runtime/source subscribers. I updated
`docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md`
and `docs/research/log.md` to reflect that.

Score after Pass 2: `0.852`.

| Dimension | Weight | Score | Pass 2 evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.85 | `useSlateProjections` and `useDecorationSelector` subscribe by runtime id when possible. `projection-store.ts` has source ids, dirtiness, runtime scopes, targeted refresh, and metrics. But source recompute still calls `source(context.snapshot)` and rebuilds a whole projection snapshot once dirty. |
| Slate-close unopinionated DX | 0.20 | 0.79 | `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md:147` still teaches `projectionStore` as the overlay API. `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md:66` exposes `useDecorationSelector`. `/Users/zbeyens/git/slate-v2/site/examples/ts/review-comments.tsx:379` still casts `annotationStore.projectionStore as any`. |
| Plate and slate-yjs migration-backbone shape | 0.15 | 0.86 | Research still supports external annotation metadata plus editor/runtime anchors. Tiptap and Lexical evidence reinforces keeping comments/suggestions/product metadata outside raw core, while raw Slate owns the anchor/projection substrate. |
| Regression-proof testing strategy | 0.20 | 0.89 | Unit tests prove runtime-id projection subscribers, source refresh, annotation rebase, and widget selection behavior. Browser tests cover search focus, external decoration refresh, review comments, persistent annotation anchors, highlighted text, and large-document projection behavior. Stress has an external decoration row. Benchmarks now record overlay recompute counts. Missing: generated many-source/many-annotation/many-widget budgets and current-vs-legacy overlay parity. |
| Research evidence completeness | 0.15 | 0.91 | React 19.2, ProseMirror, Lexical, Tiptap, local Slate v2 proof, and source-scoped invalidation pages were refreshed or rechecked. The stale local proof source refs were corrected. |
| shadcn-style composability and hook/component minimalism | 0.10 | 0.80 | The store/controller direction is composable, but the normal examples still expose projection store setup, explicit refresh calls, and projection hooks before simpler decoration/annotation/widget concepts. |

Weighted total: `0.852`.

Pass 2 findings:

- P1: research and live source agree that the system cannot claim field-best
  perf while dirty sources still rebuild whole projection snapshots.
- P1: no dedicated decoration-source public layer exists yet. The current public
  API leaks the projection transport as the authoring model.
- P1: annotation projection is lower-grade than plain projection stores because
  it lacks runtime/source subscription APIs and still uses whole-store refresh.
- P2: browser coverage is stronger than Pass 1 initially recorded. Search focus
  and review comments have real browser rows. This improves regression score,
  but not enough to close the lane.
- P2: benchmark coverage exists, including annotation/widget breadth and
  source-scoped invalidation probes, but metrics are still too thin: mostly
  recompute count, not source ids, projected ranges, runtime ids, or subscriber
  wakes.
- P2: docs/roadmap still say the next move is source-scoped invalidation. That
  supports keeping the plan focused on API simplification plus lower-level
  invalidation, not another example patch.

Plan delta from Pass 2:

- Corrected stale research source refs for local overlay proof.
- Raised research evidence from `0.88` to `0.91`.
- Raised regression proof from `0.87` to `0.89` because current tests and
  benchmarks are broader than Pass 1 summarized.
- Kept DX below the floor because the public/docs surface still centers
  projection stores and hooks.
- Kept React perf below the floor because edge subscriptions are good but
  source recompute is still too broad.

Next owner:

- Pass 3 API simplification pass. Decide whether normal public API should be
  `decorate`, `decoration sources`, `annotation stores`, and `widget stores`,
  with `ProjectionStore` moved to advanced/internal status.

## 2.2 Pass 3 API Simplification

Status: complete for Pass 3 only. At that pass, completion remained `pending`.

Verdict: the API should hard-cut away from projection-first normal DX.
Projection is useful transport. It is not the authoring model.

Score after Pass 3: `0.877`.

Pass 3 inspected the live React package exports, docs, and examples:

- `EditableTextBlocksProps` accepts `projectionStore` and `renderSegment` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`.
- `<Slate>` accepts `projectionStore` and provides `ProjectionContext` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx`.
- `projection-store.ts` exposes `SlateProjectionSource`,
  `createSlateProjectionStore`, `dirtiness`, `runtimeScope`, `sourceId`,
  `refresh`, source subscribers, and runtime-id subscribers.
- `annotation-store.ts` builds an internal projection store but examples still
  leak it through `annotationStore.projectionStore`, including an `as any` cast
  in `/Users/zbeyens/git/slate-v2/site/examples/ts/review-comments.tsx`.
- Public exports include `useDecorationSelector`, `useSlateProjections`,
  `createSlateProjectionStore`, `SlateProjectionStore`,
  `SlateSourceDirtiness`, `createSlateAnnotationStore`, and
  `createSlateWidgetStore`.
- Docs still teach `projectionStore` in
  `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md` and
  `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md`, plus
  `useDecorationSelector` in
  `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/hooks.md`.

Accepted API decisions:

| Decision | Accepted shape | Rejected shape |
| --- | --- | --- |
| Simple transient ranges | Keep classic `<Editable decorate={decorate} />`. It is the Slate-close path and should lower into the overlay runtime internally. | Making every search/highlight use a store upfront. |
| High-scale decorations | Add a product-noun source API such as `createDecorationSource(...)`, registered through a Slate React overlay lane. | Teaching `createSlateProjectionStore` as normal DX. |
| Registration | Prefer a product-noun provider shape: `<Slate editor={editor} overlays={{ decorations: [search], annotations: [comments], widgets: [commentWidgets] }}>`. Keep direct `decorate` on `<Editable>` for classic Slate compatibility. | One heterogeneous `overlays={[...]}` array with hidden kinds, or many low-level `projectionStore` props. |
| Editor namespace | Do not put React overlay stores on `editor.*` as the normal API. Core `editor.read/update` owns model and transaction work; overlay sources have React/app lifecycle and external-store subscriptions. | `editor.decorations.source(...)` as the default raw Slate React API. |
| ProjectionStore | Move out of normal docs. Keep only as advanced/internal/testing transport, preferably under unstable naming. | Public examples that pass `projectionStore` or call `refresh({ sourceId })`. |
| Annotations | Expose `createAnnotationStore(...)` / `useAnnotations(...)` / `useAnnotation(id)` and let the runtime connect inline projections internally. | App code passing `annotationStore.projectionStore`, especially with casts. |
| Widgets | Keep a separate widget store/source lane with `useWidgets(...)` and `useWidget(id)`. Widget anchors can target selection, runtime ids, or annotation ids. | Treating widgets as decoration ranges or forcing decoration hooks to power positioned UI. |
| Rendering | Normal docs should teach `decorate`, `renderLeaf`/`renderText`, `renderDecoration`, and annotation/widget renderers. Keep `renderSegment` as advanced low-level escape hatch if needed. | Making `EditableTextSegment` and projection slices the first rendering story. |
| Hooks | Product-noun hooks first: `useDecorations(...)`, `useAnnotations(...)`, `useAnnotation(id)`, `useWidgets(...)`, `useWidget(id)`. Projection selectors stay advanced/internal. | `useDecorationSelector` as the main public hook over `SlateProjectionStore`. |

Accepted public target:

```tsx
const search = createDecorationSource({
  id: 'search',
  read({ state, scope }) {
    return searchIndex.rangesFor(scope)
  },
})

const comments = createAnnotationStore({
  id: 'comments',
  read() {
    return commentStore.anchors()
  },
})

const commentWidgets = createWidgetStore({
  id: 'comment-popovers',
  read({ annotations, selection }) {
    return visibleCommentWidgets(annotations, selection)
  },
})

<Slate
  editor={editor}
  overlays={{
    annotations: [comments],
    decorations: [search],
    widgets: [commentWidgets],
  }}
>
  <Editable decorate={decorate} />
</Slate>
```

The exact prop spelling can still change during implementation, but the public
shape cannot: product nouns first, projection plumbing hidden.

Normal public surface:

- `decorate` for simple Slate-style transient ranges;
- `createDecorationSource` for external/high-scale transient ranges;
- `createAnnotationStore`, `useAnnotations`, `useAnnotation`;
- `createWidgetStore`, `useWidgets`, `useWidget`;
- render APIs named by visible concept, not transport segment.

Advanced/internal surface:

- `ProjectionStore`, `ProjectionSnapshot`, `ProjectionSlice`;
- `createSlateProjectionStore` or its unstable replacement;
- `useSlateProjections`;
- source dirtiness hints, runtime scopes, source ids, force refresh reasons;
- `renderSegment` when an author deliberately owns projection-slice rendering.

Hard cuts from normal docs and examples:

- no `projectionStore` prop in introductory docs;
- no `annotationStore.projectionStore` in examples;
- no `as any` for annotation projection registration;
- no direct `refresh({ sourceId })` in common search examples;
- no `useDecorationSelector` as the first hook users learn;
- no generic store terminology before decoration, annotation, or widget nouns.

Plan delta from Pass 3:

- Raised DX from `0.79` after Pass 2 to `0.86` because the plan now commits to
  a Slate-close simple path and product-noun scale path.
- Raised composability from `0.80` to `0.88` because normal rendering and hooks
  are now small and concept-specific instead of projection-selector-driven.
- Raised migration-backbone from `0.86` to `0.88` because sources/stores remain
  attachable by Plate/slate-yjs-style layers without requiring their current
  adapter APIs.
- Kept React perf at `0.85` because this pass only decides the API boundary.
  Pass 4 owns the real perf model: dirty source ids, dirty annotation ids,
  changed runtime slices, subscriber wake metrics, and full fallback counts.

Next owner:

- Pass 4 perf model pass. Decide whether source-scoped invalidation,
  annotation id dirtiness, widget dirtiness, and metrics are strong enough to
  justify the rewrite, and write the fallback rules.

## 2.3 Pass 4 Perf Model

Status: complete for Pass 4 only. At that pass, completion remained `pending`.

Verdict: the perf architecture is viable, but the live implementation is still
not field-best. It has good edge subscriptions and usable core dirty metadata.
It does not yet have the required dirty-id model for annotation/widget stores,
and the metrics are too thin to prove the claim.

Score after Pass 4: `0.885`.

Pass 4 inspected the live core/runtime files, tests, and benchmarks:

- Core builds commit metadata with dirty paths, touched runtime ids,
  `decorationImpactRuntimeIds`, `nodeImpactRuntimeIds`, selection impact ids,
  dirty scope, and operation classes in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:518`
  through `:613` and `:1361` through `:1408`.
- `EditorCommit` exposes the needed dirty fields in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:645`
  through `:669`.
- Range projection has snapshot-level range projection and a cached text-entry
  index in `/Users/zbeyens/git/slate-v2/packages/slate/src/range-projection.ts:65`
  through `:197`, but cross-block projection still slices over the text-entry
  span in `:304` through `:372`.
- `createSlateProjectionStore` can skip by dirtiness and runtime scope, notify
  runtime/source subscribers, and force mounted runtime subscribers in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:283`
  through `:330` and `:389` through `:411`.
- That same store still calls a full `source(context.snapshot)` and rebuilds a
  whole projection snapshot once dirty in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:295`
  through `:308`.
- Projection metrics are only `recomputeCount` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:77`
  through `:79`.
- `createSlateAnnotationStore` resolves every bookmark and projects every
  annotation in `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:73`
  through `:150`, then refreshes all of it on every editor commit in `:238`
  through `:259`.
- `createSlateWidgetStore` skips some editor changes by anchor class in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/widget-store.ts:92`
  through `:123`, but `buildWidgetSnapshot` still scans all widgets in `:125`
  through `:200`, and widget metrics are also only `recomputeCount` in `:65`
  through `:67`.
- Unit tests prove runtime-id projection subscriptions, source refresh, scoped
  recompute skips, annotation projection, and selection widget isolation in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx:302`
  through `:684`,
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx:171`
  through `:302`, and
  `/Users/zbeyens/git/slate-v2/packages/slate-react/test/widget-layer-contract.tsx:94`
  through `:212`.
- Benchmarks record source-scoped invalidation, annotation/widget breadth, and
  huge-document overlay recompute count in
  `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx:1280`
  through `:1463` and
  `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx:370`
  through `:527`.

Accepted perf model decisions:

| Area | Required model | Current gap |
| --- | --- | --- |
| Decoration source invalidation | Each source has a stable id, declared dirty classes, optional path/runtime scope, and a read API that can consume a dirty scope. Full source reads are fallback only. | Current `SlateProjectionSource` returns all projections for the whole snapshot once dirty. Runtime scope can skip a source, but cannot update only the dirty range of that source. |
| Projection index updates | Projection runtime stores buckets by source id and runtime id. Dirty source updates replace only affected source buckets, diff changed runtime buckets, then notify runtime/source/global listeners. | Current `buildProjectionSnapshot` rebuilds a whole store snapshot for the dirty source. |
| Annotation dirtiness | Annotation store keeps indexes by annotation id, runtime id, and last resolved range. Editor commits produce candidate annotation ids from dirty paths/runtime ids intersecting previous ranges. Metadata updates produce dirty annotation ids directly. | Current store resolves and projects every annotation on each refresh. |
| Annotation metadata-only changes | Notify annotation-id subscribers and dependent widgets. Do not wake text projection subscribers unless inline decoration payload changed. | Current equality compares whole data and projection data, then notifies the whole annotation store. |
| Annotation bookmark rebase | Resolve candidate bookmark ids, project only changed annotation ids, update affected runtime buckets, count full fallback when structural impact is unknown. | Current rebase proof exists, but implementation still rebuilds all annotation projections. |
| Widget dirtiness | Widget store indexes widgets by id and anchor. Selection changes dirty selection widgets; node changes dirty matching runtime-id widgets; annotation changes dirty widgets for changed annotation ids. | Current store can skip unrelated text for selection widgets, but computes all widgets when it does recompute and has no per-widget subscription. |
| Metrics | Runtime must report source read count, scoped source read count, full source read count, projected range count, changed runtime bucket count, runtime subscriber wakes, source subscriber wakes, annotation resolve/project counts, widget resolve count, widget subscriber wakes, invalid range drops, and full fallback count. | Current projection/widget metrics expose only recompute count; annotation store exposes no metrics of its own. |

Complexity targets:

| Operation family | Target complexity |
| --- | --- |
| Selection move | `O(selection sources + previous/next selected runtime buckets + selection widgets)`. No text source recompute, no annotation projection recompute. |
| Text edit in one block | `O(dirty paths/runtime ids + sources whose declared scope intersects + changed projected ranges)`. No unrelated source reads. |
| External search refresh | `O(changed search ranges + changed runtime buckets)`. Other sources stay cold. Search input focus must not be coupled to editor rerender. |
| Annotation metadata update | `O(changed annotation ids + dependent widgets/subscribers)`. Inline text projections update only if the inline payload changes. |
| Annotation bookmark rebase | `O(candidate annotation ids + changed projected ranges + changed runtime buckets)`. Structural unknown may fallback. |
| Widget visibility update | `O(changed widget ids + geometry reads for visible/dirty widgets)`. No full widget-list notification as the normal path. |
| Replace or unknown structural edit | Full fallback allowed and counted. This is the safety valve, not the steady-state path. |

Accepted fallback rules:

- `replace` commits can full-refresh all overlay lanes.
- Unknown structural edits can full-refresh affected source lanes until a better
  mapping exists, but must increment `fullFallbackCount`.
- Explicit `forceInvalidate` can wake mounted runtime subscribers even when
  slices are unchanged; this must be rare, named, and counted.
- Invalid projected ranges can be dropped for resilience, but must increment an
  invalid-range metric and stay observable in tests.
- A source without scope hints may full-read, but normal docs should steer
  high-scale sources toward declared dirtiness and dirty-scope reads.

Hard perf cuts:

- No field-best claim with only `recomputeCount`.
- No annotation store that only exposes broad `subscribe` for inline projection
  consumers.
- No widget store that only exposes whole-store subscription for positioned UI.
- No benchmark that reports only render deltas while hiding source reads,
  projected ranges, runtime bucket diffs, and subscriber wakes.
- No API where advanced authors must hand-roll source ids and refresh reasons
  to get safe scale.

Plan delta from Pass 4:

- Raised React perf from `0.85` to `0.89` because the plan now has a concrete
  dirty-id model backed by live core metadata.
- Raised regression proof from `0.89` to `0.90` because Pass 4 names the exact
  metrics needed for stress/release gates.
- Kept total score below `0.90` because generated stress/parity rows and
  ecosystem substrate answers are still pending.

Next owner:

- Pass 5 regression plan pass. Turn the perf model into generated browser,
  stress, benchmark, and current-vs-legacy parity acceptance rows.

## 2.4 Pass 5 Regression Plan

Status: complete for Pass 5 only. At that pass, completion remained `pending`.

Verdict: the regression architecture is closer than expected. The repo already
has the right split: fast unit contracts, full browser/release proof, and
generated stress with replay artifacts. The remaining problem is that overlay
load and metrics are not first-class generated rows yet. That is a real gap, but
not a reason to pivot away from the rewrite.

Score after Pass 5: `0.893`.

Pass 5 inspected the live test scripts, first-party browser contracts,
integration examples, generated stress runner, and replay artifacts:

- `/Users/zbeyens/git/slate-v2/package.json` defines:
  - `check`: lint, typecheck, and fast tests;
  - `check:full`: `check`, release proof, persistent soak, and local
    integration;
  - `test:stress`: generated Playwright stress on Chromium;
  - `test:stress:replay`: replay from a saved stress artifact.
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/package.json` keeps
  `test:core`, `test:dom`, `test:selection`, and `test:proof` split.
- `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/core/first-party-browser-contracts.ts`
  defines first-party operation families for inline void navigation, markable
  inline void formatting, block void navigation, image paste, editable islands,
  large-document void shells, stale target rebase, table boundary navigation,
  external decoration refresh, mouse selection toolbar, paste/undo, and IME.
- That same file defines first-legacy parity families for inline voids, block
  voids, search highlight focus, hovering toolbar mouse selection, and table
  boundary navigation.
- `/Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts`
  turns those families into replayable browser scenarios and writes artifacts.
- `/Users/zbeyens/git/slate-v2/playwright/stress/replay.test.ts` replays saved
  generated artifacts through `STRESS_REPLAY`.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/search-highlighting.test.ts`
  covers the user-reported search input focus loss and asserts no editor/element
  rerender on search typing.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/hovering-toolbar.test.ts`
  covers real mouse selection and toolbar visibility with render budget proof.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/tables.test.ts`
  covers the table ArrowRight offset-0 regression.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/images.test.ts`
  covers image void navigation and the visible spacer gap.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/mentions.test.ts`
  covers inline void navigation from both sides.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/review-comments.test.ts`
  and `persistent-annotation-anchors.test.ts` cover annotation/comment sidebar,
  inline highlights, widget panel sync, text insert, fragment insert, and clear.
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/external-decoration-sources.test.ts`
  covers external decoration source refresh.

Accepted CI/stress split:

| Lane | Belongs here | Must not go here |
| --- | --- | --- |
| Fast `bun check` | Unit contracts for overlay source invalidation, annotation dirty ids, widget dirty ids, runtime/source/widget subscriptions, projection metrics, and first-party contract registry shape. | Full Playwright integration, generated stress, wall-clock perf gates, persistent browser soak. |
| `bun check:full` / release proof | Release-discipline guards, `slate-browser` proof contracts, persistent profile soak, mobile proof where available, and the normal integration examples for search, hover toolbar, tables, images, mentions, annotations, and widgets. | Randomized/generated large stress sweeps that make every local iteration slow. |
| `test:stress` | Generated operation-family scenarios, many-source overlays, many annotations, many widgets, mixed overlays, large documents, artifact writing, replay, current-vs-legacy parity packs, and browser-family filters. | Required default CI work unless explicitly promoted to release proof. |
| Benchmarks | Rerender breadth, huge-document overlays, source-scoped invalidation, annotation/widget breadth, and trend output. | Pass/fail claims based only on noisy wall-clock timings. |

Fast unit contract target:

- `decorate` lowers into the overlay runtime without rerendering unrelated text
  runtime ids.
- Decoration source text edit outside declared scope does not call the source.
- Decoration source refresh wakes only changed runtime ids and matching source
  subscribers.
- Annotation metadata-only update wakes annotation/widget subscribers only.
- Annotation bookmark rebase resolves/projects only candidate annotation ids
  when the dirty region is known.
- Annotation-backed inline projection exposes runtime-id subscription, not broad
  subscription fallback.
- Widget selection change wakes selection widgets only.
- Widget annotation change wakes widgets anchored to changed annotation ids only.
- Mixed overlay update reports source read count, projected range count, changed
  runtime buckets, subscriber wakes, and fallback count.

Generated stress target:

| Family | Routes | Required assertions |
| --- | --- | --- |
| `overlay-many-decoration-sources` | `search-highlighting`, `external-decoration-sources`, `richtext` | N sources, one source refresh, only changed source/runtime buckets wake, editor focus stays correct. |
| `overlay-annotation-metadata-only` | `review-comments`, `persistent-annotation-anchors` | Metadata update changes sidebar/widget state without text projection wake unless inline payload changes. |
| `overlay-annotation-bookmark-rebase` | `review-comments`, `persistent-annotation-anchors` | Text/fragment insert rebases candidate annotation ids only; stale ranges drop with counted invalid-range metric. |
| `overlay-widget-dirty-id` | `review-comments`, `hovering-toolbar` | Selection and annotation widgets wake by widget id, not whole widget store. |
| `overlay-mixed-update` | `review-comments`, `search-highlighting` | Decoration source refresh plus annotation update plus widget visibility update stays inside dirty bucket budgets. |
| `overlay-large-document-budget` | `large-document-runtime`, `huge-document` | Far overlay refresh does not promote unrelated islands or reproject unrelated blocks. |
| `legacy-parity-user-regressions` | `mentions`, `images`, `embeds`, `tables`, `search-highlighting`, `hovering-toolbar` | Current and legacy agree on model selection, DOM selection, focus owner, visible void layout, toolbar visibility, and table cell offset 0. |

Hard budgets versus diagnostics:

- Hard budgets:
  - root/editable rerender count for hot selection and source refresh paths;
  - source read count by source id;
  - projected range count by source id;
  - changed runtime bucket count;
  - runtime/source/annotation/widget subscriber wake counts;
  - full fallback count;
  - invalid range drop count;
  - focus owner and model/DOM selection agreement;
  - hidden spacer/layout gap bounds for void shells.
- Diagnostics:
  - wall-clock milliseconds;
  - browser-specific timing variance;
  - full trace size;
  - optional percentile trends.

Current-vs-legacy parity rows:

| User-reported class | Required row |
| --- | --- |
| Search input loses focus while decorations update | `external-decoration-refresh` on `search-highlighting`: search input remains focused, highlights update, editor root/element/void render count stays zero. |
| Hovering toolbar never appears on mouse selection | `mouse-selection-toolbar` on `hovering-toolbar`: native selection text non-empty, model selection expanded, toolbar visible and positioned. |
| Inline void keyboard navigation before/after mentions | `inline-void-boundary-navigation` and `markable-inline-void-formatting` on `mentions`: model and DOM selection land at expected paths from both sides. |
| Table ArrowRight lands at offset 1 | `table-cell-boundary-navigation` on `tables`: next cell path with offset `0`, DOM offset `0`, editor focus retained. |
| Image/block void keyboard navigation broken | `block-void-navigation` on `images` and `embeds`: enter, exit, and re-enter voids with model/DOM selection agreement. |
| Visible void spacer gap above image | `block-void-navigation` on `images`: visible content offset between `0` and `1px`; hidden anchor stays runtime-owned. |
| Editable void/native island focus | `editable-island-native-focus` on `editable-voids`: native input owns focus while edited; outer editor selection and follow-up typing remain valid. |
| Review/comment overlays drift | `overlay-annotation-bookmark-rebase` and existing review/persistent annotation rows: sidebar, inline highlight, and widget panel stay in sync. |

Plan delta from Pass 5:

- Raised regression proof from `0.90` to `0.94` because the repo already has a
  strong slate-browser/stress/replay structure and concrete integration coverage
  for the reported bugs.
- Kept total score below `0.90` because the stress generator still needs overlay
  load rows and hard metric budgets, and Pass 6/7 still need ecosystem and
  maintainer pressure.

Next owner:

- Pass 6 ecosystem backbone pass. Prove the plan supports Plate and slate-yjs
  migration architecture without requiring current-version adapters.

## 2.5 Pass 6 Ecosystem Backbone

Status: complete for Pass 6 only. At that pass, completion remained `pending`.

Verdict: the migration backbone is stronger than the plan previously credited.
Raw Slate does not need current Plate or slate-yjs adapters. It needs stable
substrate that those libraries can target when they migrate: schema specs,
state/tx extension namespaces, command/operation middleware, deterministic
operation replay, commit metadata, bookmarks, local runtime ids, and overlay
sources/stores with dirty-id subscriptions.

Score after Pass 6: `0.902`.

Pass 6 inspected raw Slate extension, transaction, commit, and collaboration
contracts; current Plate package pressure; current slate-yjs pressure; and the
compiled overlay/runtime research.

Raw Slate evidence:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/migration-backbone-contract.ts:32`
  through `:133` proves schema specs and plugin-style extension groups compose
  through `editor.read((state) => ...)` and `editor.update((tx) => ...)`
  without adding `api`, `tf`, `plate`, `yjs`, or plugin names onto the editor
  object.
- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-namespaces-contract.ts:27`
  through `:209` proves state/tx groups install, read transaction-local state,
  clean up, and reject duplicate or reserved group names.
- `/Users/zbeyens/git/slate-v2/packages/slate/test/migration-backbone-contract.ts:135`
  through `:195` proves deterministic operation replay with commit tags and
  local-only runtime ids.
- `/Users/zbeyens/git/slate-v2/packages/slate/test/collab-history-runtime-contract.ts:28`
  through `:203` proves one commit object feeds subscribers, extension
  listeners, and history, while remote remove/move operations null or rebase
  runtime targets locally.
- `/Users/zbeyens/git/slate-v2/packages/slate/test/commit-metadata-contract.ts:11`
  through `:96` proves tags, before/after selection, operation classes, dirty
  paths, top-level ranges, and runtime ids.
- `/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-contract.ts:385`
  through `:432` proves operation middleware is on the transaction path and
  publishes once.
- `/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-contract.ts:560`
  through `:698` proves command middleware preserves command and commit
  metadata for text and structural commands.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:135`
  through `:165` and `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:144`
  through `:184` prove element specs already model void kind, inline,
  selectable, read-only, and markable-void policy.
- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:638`
  through `:670` proves commit metadata already exposes the fields overlay and
  collaboration layers need.

Plate pressure:

- Current Plate packages use plugin specs, node metadata, command-style
  transforms, editor options, and React hooks. Examples include
  `/Users/zbeyens/git/plate-2/packages/media/src/lib/media-embed/BaseMediaEmbedPlugin.ts:13`
  through `:39` for node metadata and parsing, and
  `/Users/zbeyens/git/plate-2/packages/dnd/src/DndPlugin.tsx:43` through
  `:130` for plugin options, handlers, hooks, and render slots.
- Current Plate code frequently uses `editor.api` and `editor.tf`, but raw
  Slate should not copy those names. The compiled decision in
  `/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`
  accepts `state` and `tx` as the raw-core shape and rejects `api` / `tf` for
  core Slate.

slate-yjs pressure:

- Current slate-yjs mutates current Slate-era fields and methods in
  `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:156`
  through `:283`, including `editor.children`, `editor.apply`, and
  `editor.onChange`.
- It translates remote Yjs events to Slate operations in
  `/Users/zbeyens/git/slate-yjs/packages/core/src/applyToSlate/index.ts:32`
  through `:43`, and local Slate operations to Yjs in
  `/Users/zbeyens/git/slate-yjs/packages/core/src/applyToYjs/index.ts:17`
  through `:28`.
- Its stored-position docs in
  `/Users/zbeyens/git/slate-yjs/docs/concepts/stored-positions.md:53`
  through `:68` show why durable local/remote anchor behavior matters for
  `move_node`, `split_node`, and large numbers of stored locations.
- Remote cursors currently use decoration and overlay hooks in
  `/Users/zbeyens/git/slate-yjs/packages/react/src/hooks/useDecorateRemoteCursors.ts:87`
  through `:124` and
  `/Users/zbeyens/git/slate-yjs/packages/react/src/hooks/useRemoteCursorOverlayPositions.tsx:50`
  through `:143`, which maps directly to the decoration/widget backbone this
  rewrite is reviewing.

Accepted substrate for Plate-style libraries:

| Need | Raw Slate substrate | Out of scope |
| --- | --- | --- |
| Plugin specs | `editor.schema.define`, element specs, state/tx extension groups, normalizers, command middleware, operation middleware, commit listeners. | Current Plate `createTSlatePlugin`, `createTPlatePlugin`, `editor.api`, `editor.tf`, plugin option store, or React UI registry. |
| Plugin commands | Extension tx groups and command middleware. Commands may be product sugar above raw Slate, but raw Slate keeps `editor.update((tx) => ...)` as the primitive. | Flat core `editor.commands`, Plate command catalog compatibility, or chain-first raw Slate API. |
| Node behavior | Element specs for inline, void kind, selectable, read-only, markable-void. | App-owned void shell/spacer policy, or current Plate node metadata as raw Slate syntax. |
| Decorations | Classic `decorate` plus `createDecorationSource` lowering into overlay runtime. | Public `ProjectionStore` as the normal authoring API. |
| Annotations | Bookmark-backed `createAnnotationStore`, annotation-id subscriptions, inline projection generated by runtime. | App passing `annotationStore.projectionStore`, current comments adapter shape, or broad annotation refresh as the accepted scale path. |
| Widgets | `createWidgetStore`, widget-id subscriptions, anchors by selection/runtime id/annotation id. | Forcing positioned UI through decoration ranges or current Plate floating UI APIs. |
| React composition | Product-noun hooks and tiny renderer props. | Broad editor subscriptions or hook names centered on projection plumbing. |

Accepted substrate for slate-yjs-style collaboration:

| Need | Raw Slate substrate | Out of scope |
| --- | --- | --- |
| Remote import | `applyOperations(ops, { tag: 'remote-import' })` with deterministic snapshots and one commit. | Current `withYjs` monkeypatching of `editor.apply`, `editor.children`, or `editor.onChange`. |
| Local export | Commit subscribers read operations, tags, before/after selection, dirty regions, and operation classes. | Raw Slate owning a Yjs document or depending on Yjs. |
| Local-only targets | Runtime ids are local, never serialized in operation JSON; remote remove/move nulls or rebases local runtime targets. | Assuming runtime ids are stable cross-client ids. |
| Durable anchors | Bookmarks/range refs and future annotation dirty-id contracts. | Storing every product annotation as editor document nodes. |
| Presence | Remote cursor ranges should feed decoration sources and widgets, not broad `decorate` callbacks over the whole tree. | Current slate-yjs React hook compatibility as a raw Slate test requirement. |
| History/collab ordering | One commit truth for history, subscribers, extension listeners, and remote tags. | Adapter-specific history implementation details in raw Slate. |

Overlay-specific ecosystem decisions:

- Decoration sources, annotation stores, and widget stores should be React-layer
  sources/controllers, not core editor namespaces.
- The stable raw-core contract is model-side: operations, snapshots, commits,
  schema specs, extension groups, bookmarks, runtime ids, and command/operation
  middleware.
- The stable React contract is source-side: runtime-id/source-id/annotation-id
  and widget-id subscriptions, metrics, and generated browser contracts.
- Plate can wrap the product-noun overlay APIs into plugin specs later.
- slate-yjs can map remote awareness/presence into decoration and widget sources
  later.
- Neither migration path requires raw Slate to support current Plate or
  current slate-yjs public APIs before publish.

Raw Slate migration-backbone tests that are enough for this plan:

- state/tx extension namespace contracts;
- schema spec contracts for void/inline/selectable/read-only behavior;
- operation replay contracts with commit tags;
- command and operation middleware contracts;
- local-only runtime id contracts for remove/move/rebase;
- bookmark/range-ref contracts for durable anchors;
- overlay source/store unit contracts for dirty ids and subscriptions;
- first-party browser contracts generated from operation families.

Tests that belong later in Plate or slate-yjs:

- current Plate plugin objects compiling unchanged;
- current Plate `editor.api` / `editor.tf` adapter tests;
- current slate-yjs `withYjs` compiling unchanged;
- Yjs provider integration fixtures;
- product comment/suggestion UI parity;
- Plate registry/demo UI proof.

Plan delta from Pass 6:

- Raised migration-backbone from `0.88` to `0.93` because the raw Slate
  extension, operation, commit, and runtime-id contracts are concrete and
  adapter-independent.
- Raised total score from `0.893` to `0.902`.
- Kept completion `pending` because Pass 7 still needs the maintainer objection
  ledger and final keep/cut closure.
- Kept React perf at `0.89` because this pass proves ecosystem fit, not the
  missing dirty-id overlay implementation.

Next owner:

- Pass 7 maintainer objection ledger and final keep/cut decisions. Close or
  escalate remaining objections, then decide whether the plan can move to
  `done` under the `0.92` slate-review gate or must stay `pending` with exact
  blockers.

## 2.6 Pass 7 Maintainer Objection Closure

Status: complete. Completion is `done`.

Verdict: no pivot. The plan should execute as a hard-cut overlay API/runtime
cleanup. The only honest caveat is that "field-best perf" remains an
implementation proof claim, not a plan claim. The plan passes because it makes
the missing proof explicit and blocks that claim behind dirty-id runtime,
metrics, and stress rows.

Score after Pass 7: `0.929`.

Final keep/cut decisions:

| Area | Keep | Cut |
| --- | --- | --- |
| Public concepts | `Decoration`, `Annotation`, `Widget`, `Bookmark`, classic `decorate`, product-noun source/store APIs. | Projection-first public docs, examples that pass `projectionStore`, app code passing `annotationStore.projectionStore`, and `as any` examples. |
| Decoration scale path | `createDecorationSource` with runtime-owned projection and safe default invalidation. | Making authors learn `SlateProjectionSource`, `dirtiness`, `runtimeScope`, `sourceId`, or refresh reasons for normal search/highlight work. |
| Annotation scale path | `createAnnotationStore`, annotation ids, dirty annotation ids, bookmark rebase, runtime-id projection subscriptions. | Full annotation resolve/project on every editor commit as the accepted scale path. |
| Widget scale path | `createWidgetStore`, widget ids, anchors by selection/runtime id/annotation id, widget-id subscriptions. | Whole-widget-store notification as the normal positioned UI path. |
| Metrics | Source reads, scoped/full source reads, projected ranges, changed runtime buckets, subscriber wakes, annotation resolves/projects, widget resolves, invalid ranges, full fallbacks. | `recomputeCount` as the only serious perf metric. |
| React shape | `useSyncExternalStore` over already-sliced runtime/source/annotation/widget facts; non-urgent side UI can use React 19.2 background primitives. | Broad React editor subscriptions as the hot overlay path. |
| Ecosystem scope | Raw Slate owns schema specs, state/tx extension groups, operations, commits, bookmarks, runtime ids, and overlay source/store primitives. | Current Plate adapters, current slate-yjs `withYjs`, `editor.api`, `editor.tf`, or a raw Slate dependency on Yjs. |

Accepted maintainer objection ledger:

| Objection | Decision | Plan response |
| --- | --- | --- |
| "`ProjectionStore` is the common abstraction; why hide it?" | Accepted objection, rejected conclusion. Projection remains internal/advanced because common transport is not good normal DX. | Normal docs teach `decorate`, `createDecorationSource`, `createAnnotationStore`, and `createWidgetStore`. Projection APIs stay behind advanced/internal naming and test helpers. |
| "Full source recompute is simpler and probably fine." | Rejected for scale. Simpler can exist only as fallback. | Pass 4 requires source-scoped invalidation, runtime buckets, full fallback counting, and metrics. Pass 5 requires stress rows that prove source refresh does not wake unrelated runtime ids. |
| "Annotations are external data, so full refresh is acceptable." | Rejected. External ownership does not justify broad range resolution/projection. | Annotation metadata may remain external, but runtime projection must index by annotation id and runtime id. Metadata-only updates must wake annotation/widget subscribers without text projection wake unless inline payload changes. |
| "Advanced authors need `dirtiness` and `runtimeScope`." | Accepted as an escape hatch only. | Advanced hints remain possible, but normal APIs infer safe invalidation and hide transport names. |
| "Tests already cover projection subscriptions." | Accepted but insufficient. | Existing tests prove local slices. Implementation acceptance additionally requires generated overlay load rows, dirty-id stress, mixed overlay rows, large-document budgets, and hard metric budgets. |
| "This drifts too far from Slate DX." | Rejected. The split is closer to what Slate authors actually need. | Classic `decorate` stays. The hard cut is only against forcing durable comments and positioned UI through a transient decoration callback or projection transport. |
| "This should live in Plate, not Slate." | Partly accepted. Product APIs live in Plate; primitive overlay lanes belong in Slate React. | Raw Slate stays unopinionated: ranges, bookmarks, source/store primitives, subscriptions, and browser contracts. Plate can wrap those into plugin specs later. |
| "Collaboration needs current slate-yjs compatibility." | Rejected for raw Slate before publish. | Raw Slate proves deterministic operations, commit metadata, tags, bookmarks, and local runtime targets. slate-yjs can migrate to those primitives without raw Slate supporting today's monkeypatch API. |
| "Metrics and stress rows are overkill for CI." | Accepted for default CI only. | Fast `check` keeps unit contracts. `check:full`, `test:stress`, and release proof own generated browser rows and heavy budgets. |

Final implementation acceptance criteria:

- Normal docs and examples contain no flagship `projectionStore` authoring path.
- Simple search/highlight examples use classic `decorate` or
  `createDecorationSource`.
- Comment/review examples register annotation stores without exposing
  `annotationStore.projectionStore`.
- Widget examples subscribe by widget id or visible widget slice, not the whole
  widget store.
- Annotation projection exposes runtime-id subscriptions equal to decoration
  sources.
- Metadata-only annotation updates do not wake text projection subscribers
  unless inline payload changes.
- Widget selection changes wake selection widgets only.
- Source refresh reports source read count, projected range count, changed
  runtime buckets, subscriber wakes, and full fallback count.
- Generated browser stress includes many-source decorations, annotation
  metadata-only changes, annotation bookmark rebase, widget dirty-id updates,
  mixed overlays, large-document overlay budgets, and legacy parity rows.
- No current-version Plate or slate-yjs adapter is required for raw Slate
  completion.

Final score rationale:

- React perf rises to `0.92` because the plan no longer self-certifies from
  local subscriptions; it blocks field-best claims on source-scoped dirty-id
  runtime and hard metrics.
- DX rises to `0.92` because the public surface is now fully decided:
  Slate-close `decorate` plus product-noun source/store APIs, with projection
  transport demoted.
- Migration remains `0.93`; Pass 6 already proved the substrate and rejected
  current adapter requirements.
- Regression rises to `0.95` because overlay load rows and metric budgets are
  mandatory acceptance criteria in the right lanes.
- Research rises to `0.93` because closure cites the compiled overlay,
  source-scoped invalidation, React 19.2, and state/tx namespace decisions.
- Composability rises to `0.92` because normal hooks/components are now
  concept-specific and minimal.

Completion decision:

- Passes 1 through 7 are complete.
- Weighted score is `0.929`.
- No dimension is below `0.85`.
- Every objection has an accepted plan response.
- Public API keep/cut, runtime perf keep/cut, ecosystem scope, and regression
  acceptance criteria are written.
- The checkpoint may be set to `done`.

## 3. Pass 1 Findings

### P1. Annotation store recomputes too broadly

`createSlateAnnotationStore` calls `buildAnnotationSnapshot(getAnnotations())`
and `buildProjectionSnapshot(editor, nextAnnotationSnapshot)` in every refresh.
It subscribes to every editor commit and calls `refresh()` unconditionally.

Evidence:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:73`
  resolves every annotation bookmark.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:97`
  projects every resolved annotation range.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:238`
  rebuilds the whole annotation and projection snapshots.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:257`
  subscribes to every editor commit.

Verdict: not field-best. Durable annotations need dirty annotation ids,
affected runtime ids, and full recompute only as a fallback.

### P1. Projection source API exposes the engine and still recomputes whole sources

`SlateProjectionSource<T> = (snapshot) => projections[]` is simple, but it makes
the source return all ranges. `runtimeScope` can skip a recompute when impact
does not overlap, but once dirty, the source is called with the full snapshot and
every projection is reprojected.

Evidence:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:26`
  defines array-returning full snapshot sources.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:60`
  exposes `dirtiness`, `runtimeScope`, and `sourceId`.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:222`
  projects every projection.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts:330`
  calls the source and rebuilds the projection snapshot when dirty.

Verdict: the public concept should be decorations, annotations, and widgets.
Projection is an internal transport, not the normal API.

### P1. Annotation projection store is a partial store

The annotation store returns a `projectionStore` with only `getSnapshot` and
`subscribe`. `useSlateProjections` can subscribe by runtime id only when
`subscribeRuntimeId` exists, so annotation projections risk broad React wakeups.

Evidence:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts:269`
  returns a partial projection store.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx:33`
  uses `subscribeRuntimeId` when available.
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx:37`
  falls back to broad `subscribe`.

Verdict: annotation-backed highlights must expose the same runtime/source
subscription guarantees as plain decoration sources.

### P2. Widget API has the right anchor split but underproves scale

`annotationId`, node runtime id, and selection anchors are the right conceptual
split. The open question is whether widget visibility, placement, and annotation
coupling can stay source-scoped under many widgets and mixed overlay updates.

Verdict: keep the anchor split, but require stress metrics before calling the
widget layer done.

### P2. Docs and examples teach the substrate before the user concept

The docs and examples currently teach authors to create projection stores and
refresh source ids. That is useful for internals and advanced integrations, but
it is not the normal Slate-close DX.

Verdict: docs should teach:

- decorations for transient render ranges;
- annotations for durable anchored data;
- widgets for positioned UI;
- projection stores only as advanced/internal plumbing.

### P2. Tests are good but not the right closure gate yet

The current contracts prove key pieces. They do not yet prove that the whole
rewrite avoids broad recompute under realistic overlay load.

Missing stress rows:

- many decoration sources;
- many annotations with sparse edits;
- annotation metadata-only changes;
- search source refresh while typing in the search input;
- mixed decoration plus annotation plus widget updates;
- large document text edits outside overlay scope;
- current-vs-legacy browser parity for search highlighting, comments, and
  hover/floating UI.

## 4. Architecture North Star

Public API:

- Keep the Slate mental model: document, selection, operations, ranges, marks,
  elements, editor state, and editor transactions.
- Expose product nouns first: decoration, annotation, widget.
- Keep `Projection` as an internal transport unless an advanced escape hatch is
  explicitly needed.
- Normal authors should not pass `dirtiness`, `runtimeScope`, or `sourceId` for
  common cases.
- Advanced authors can provide invalidation hints, but the runtime should own
  safe defaults.

Runtime:

- One overlay runtime owns projection, source registration, source invalidation,
  range slicing, runtime-id subscriptions, and metrics.
- Decorations, annotations, and widgets are separate public lanes over that
  runtime.
- Source invalidation must run below React.
- React components subscribe to already-sliced facts by runtime id, source id, or
  widget id.
- A single source update must not rerender the editor tree or reproject unrelated
  sources.

Perf target:

- selection move: dirty selected runtime ids and visible widgets only;
- text edit inside one block: dirty affected text runtime ids and sources whose
  scopes intersect;
- external search refresh: recompute the search source, notify changed runtime
  ids only;
- annotation metadata-only update: notify annotation/widget subscribers, not text
  projection subscribers unless visible inline data changed;
- annotation bookmark rebase: resolve affected annotation ids first, then project
  only changed ranges;
- large document: O(changed sources + changed ranges + changed runtime slices),
  not O(all sources x all text).

## 5. Public API Review Target

Pass 1 target, to be pressure-tested in later passes:

```tsx
<Editable
  decorate={decorate}
  annotations={comments}
  widgets={commentWidgets}
/>
```

Plain Slate-style decoration should stay familiar:

```ts
const decorate = ({ entry, range, text }) => {
  return findSearchMatches(text, query).map((match) => ({
    anchor: { path: entry.path, offset: match.start },
    focus: { path: entry.path, offset: match.end },
    type: 'search',
  }))
}
```

External or high-scale decoration sources need a source object, but it should be
named after the user problem:

```ts
const searchDecorations = createDecorationSource(editor, {
  id: 'search',
  read({ state, scope }) {
    return searchIndex.rangesFor(scope)
  },
  invalidates(change) {
    return change.textChanged || queryChanged
  },
})
```

Durable annotations should not look like projection plumbing:

```ts
const comments = createAnnotationStore(editor, {
  id: 'comments',
  read() {
    return commentStore.anchors()
  },
  renderInline(annotation) {
    return { className: 'commented', data: { id: annotation.id } }
  },
})
```

Widgets should be positioned UI, not decoration ranges:

```ts
const commentWidgets = createWidgetStore(editor, {
  id: 'comment-popovers',
  read({ annotations, selection }) {
    return visibleCommentWidgets(annotations, selection)
  },
})
```

Open questions for Pass 3:

- Should raw Slate expose `createDecorationSource`, or should it be
  `editor.decorations.source(...)` inside `editor.update/read` namespaces?
- Should `decorate` remain a direct `<Editable>` prop for classic Slate DX while
  source objects cover external/high-scale cases?
- Should annotations be a store creator, an editor namespace, or both?
- Should `ProjectionStore` leave normal docs entirely?
- Should `useDecorationSelector` be renamed to a source-level hook, or hidden
  behind `useDecorations(runtimeId)` / `useAnnotation(id)` / `useWidget(id)`?

## 6. Internal Runtime Review Target

Candidate internal split:

- `OverlayRuntime`: registry, source scheduling, metrics, source invalidation.
- `DecorationSourceRuntime`: transient source reads and range projection.
- `AnnotationRuntime`: bookmark resolution, annotation id dirtiness, projection
  slices, metadata subscriptions.
- `WidgetRuntime`: anchor resolution, visibility, placement subscriptions.
- `ProjectionIndex`: runtime-id slice map, source-id slice map, changed runtime
  ids, changed source ids.

Candidate invalidation primitives:

```ts
type OverlayInvalidation = {
  annotationIds?: readonly string[]
  force?: boolean
  paths?: readonly Path[]
  runtimeIds?: readonly RuntimeId[]
  sourceIds?: readonly string[]
}
```

Rules:

- Unknown invalidation can still force a full source refresh.
- Known invalidation must stay source-scoped.
- Annotation stores need id-level diffing before range projection.
- Projection metrics must expose source recompute count, range project count,
  runtime subscriber wake count, and full fallback count.

## 7. Testing And Regression Plan

Fast unit contracts:

- classic `decorate` does not rerender unrelated text runtime ids;
- external decoration source refresh wakes only changed runtime ids;
- annotation metadata-only update wakes annotation subscribers only;
- annotation bookmark rebase projects only affected annotation ids when possible;
- annotation-backed inline projection has `subscribeRuntimeId`;
- widgets anchored to annotations ignore unrelated annotation changes;
- mixed overlay updates report metrics for recompute/project/wake counts.

Browser stress contracts:

- search input typing keeps focus and updates decorations;
- hover toolbar selection stays stable with decoration sources installed;
- annotation sidebar and inline highlight stay in sync through text edits;
- comments/widgets do not shift layout during selection moves;
- large document overlay source refresh stays under an accepted recompute budget;
- current-vs-legacy parity rows cover search, hover/floating UI, and persistent
  annotations.

Default CI should keep a fast subset. Heavy rows belong in `test:stress` and
release proof.

## 8. Pass Schedule

| Pass | Status | Goal |
| --- | --- | --- |
| Pass 1 | complete | Initial live-source review, score, and findings. |
| Pass 2 | complete | Refresh research and live implementation evidence against current overlay files, docs, examples, and tests. |
| Pass 3 | complete | API simplification pass: decide normal public names, advanced escape hatches, and what leaves docs. |
| Pass 4 | complete | Perf model pass: source-scoped invalidation, annotation id dirtiness, metrics, and fallbacks. |
| Pass 5 | complete | Regression plan pass: generated browser/stress matrix and fast CI subset. |
| Pass 6 | complete | Ecosystem backbone pass: Plate and slate-yjs migration substrate without current adapters. |
| Pass 7 | complete | Maintainer objection ledger and final keep/cut decisions. |

## 9. Maintainer Objection Ledger

Status: accepted.

| Objection | Final answer | Status |
| --- | --- | --- |
| "`ProjectionStore` is the common abstraction; why hide it?" | Hide it from normal DX because the user-facing concepts are decorations, annotations, and widgets. Keep projection transport advanced/internal. | accepted |
| "Full source recompute is simpler and probably fine." | Keep full recompute only as fallback and count it. Normal path must be source-scoped and runtime-bucketed. | accepted |
| "Annotations are external data, so full refresh is acceptable." | Keep metadata external, but resolve/project by annotation id and runtime id. Broad refresh is not the accepted scale path. | accepted |
| "Advanced authors need `dirtiness` and `runtimeScope`." | Keep advanced hints, but not as normal authoring vocabulary. Normal APIs infer safe invalidation. | accepted |
| "Tests already cover projection subscriptions." | Current tests are necessary, not sufficient. Add generated overlay load stress and hard metric budgets. | accepted |
| "This drifts too far from Slate DX." | Classic `decorate` stays. Durable anchors and widgets get better APIs because legacy decoration callbacks were doing too much. | accepted |
| "This should live in Plate, not Slate." | Plate owns product plugin APIs. Slate React owns unopinionated overlay primitives and browser contracts. | accepted |
| "Collaboration needs current slate-yjs compatibility." | Raw Slate proves operations, commits, tags, bookmarks, and local runtime ids. Current `withYjs` adapter compatibility is out of scope. | accepted |
| "Metrics and stress rows are overkill for CI." | Agree for default CI. Keep them in `check:full`, `test:stress`, replay, and release proof. | accepted |

## 10. Completion Target

This review plan is done only when:

- Passes 1 through 7 are complete: yes.
- The score is at least `0.92`, or the plan explicitly pivots with evidence:
  yes, `0.929`.
- Public API keep/cut decisions are written: yes.
- Runtime perf model keep/cut decisions are written: yes.
- Generated stress/parity acceptance criteria are written: yes.
- `tmp/completion-check.md` says `done`: yes.

The review lane is complete. The next move is implementation via
`complete-plan`, not another review pass.

## 11. Execution Activation

Status: complete as of 2026-04-28. Slices 1-4 complete.

`complete-plan` activated implementation after review closure. The first
execution owner is the smallest durable tracer in `../slate-v2/packages/slate-react`:

- add product-noun overlay API scaffolding over the existing projection
  transport;
- prove normal decoration-source DX does not require authors to touch
  `ProjectionStore`;
- keep dirty-id annotation/widget runtime and hard metrics as later owners, not
  implied completed work.

Slice 1 completion summary:

- added `createDecorationSource` and `composeDecorationSources` in
  `packages/slate-react/src/decoration-source.ts`;
- added `decorationSources` to `Slate` and `EditableTextBlocksProps`, with
  explicit `projectionStore` still taking precedence for low-level callers;
- exported the decoration-source API from `packages/slate-react/src/index.ts`;
- added a focused slate-react projection test proving normal decoration-source
  DX does not require authors to pass a `ProjectionStore`;
- fixed composed-source snapshot caching so React 19.2 does not see a fresh
  external-store snapshot every render.

Verification:

- `bun --filter slate-react test:vitest -- projections-and-selection-contract`
- `bunx biome check packages/slate-react/src/decoration-source.ts packages/slate-react/src/components/slate.tsx packages/slate-react/src/components/editable-text-blocks.tsx packages/slate-react/src/index.ts packages/slate-react/test/projections-and-selection-contract.tsx --fix`
- `bun --filter slate-react typecheck`
- `bun --filter slate-react test:vitest -- projections-and-selection-contract`

Slice 2 completion summary:

- added `annotationStores` registration to `Slate` and standalone `Editable`;
- composed decoration sources and annotation projection stores inside
  `slate-react` so app code does not pass `annotationStore.projectionStore`;
- added `useSlateAnnotation(store, id)` and `useSlateWidget(store, id)`;
- added id-scoped annotation/widget store subscriptions as the React hook path;
- cut normal annotation examples and slate-react docs away from
  `annotationStore.projectionStore`;
- kept low-level `projectionStore` documented as transport for advanced
  integrations.

Verification:

- `bun --filter slate-react test:vitest -- annotation-store-contract widget-layer-contract projections-and-selection-contract`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bunx biome check ... --fix` on touched slate-react, site example, and docs
  files

Slice 3 completion summary:

- expanded projection metrics beyond `recomputeCount` to source reads,
  projected ranges, changed runtime buckets, subscriber wakes, invalid drops,
  and full fallback counts;
- added annotation store metrics for resolves, projects, changed annotation ids,
  changed runtime buckets, subscriber wakes, and full fallbacks;
- added widget store metrics for resolves, changed widget ids, subscriber wakes,
  and full fallbacks;
- made annotation editor commits skip selection-only changes and unrelated
  dirty runtime ids instead of resolving every annotation;
- wired benchmark output to the new hard metrics.

Verification:

- `bun --filter slate-react test:vitest -- annotation-store-contract widget-layer-contract projections-and-selection-contract`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bunx biome check ... --fix` on touched slate-react and benchmark files

Slice 4 completion summary:

- added replayable browser scenario steps for selector clicks and locator text
  assertions;
- added first-party operation-family rows for many decoration sources,
  annotation metadata-only changes, annotation bookmark rebase, widget dirty-id
  updates, mixed overlays, and large-document overlay budgets;
- added generated stress rows for that accepted overlay matrix without putting
  the slow pack in default `bun check`;
- used `review-comments` for generated bookmark-rebase stress because generated
  stress needs a real `Editable` harness; `persistent-annotation-anchors`
  remains a selector/demo contract route;
- removed stale normal-demo wording that still said the projection store paints
  comment slices.

Verification:

- `bunx biome check packages/slate-browser/src/playwright/index.ts packages/slate-browser/test/core/scenario.test.ts packages/slate-browser/src/core/first-party-browser-contracts.ts playwright/stress/generated-editing.test.ts site/examples/ts/review-comments.tsx --fix`
- `bun --filter slate-browser test:proof`
- `bun --filter slate-browser typecheck`
- `bun --filter slate-react typecheck`
- `bun typecheck:site`
- `bun typecheck:root`
- `STRESS_FAMILIES=overlay-many-decoration-sources,overlay-annotation-metadata-only,overlay-annotation-bookmark-rebase,overlay-widget-dirty-id,overlay-mixed-update,overlay-large-document-budget PLAYWRIGHT_RETRIES=0 bun test:stress`
- `bun check`

Current next owner:

- None for this plan. The implementation target is complete.
