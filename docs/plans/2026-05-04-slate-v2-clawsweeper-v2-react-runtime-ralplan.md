---
date: 2026-05-04
topic: slate-v2-clawsweeper-v2-react-runtime-ralplan
status: slate-ralplan-done
skill: slate-ralplan
bucket: v2-react-runtime
source_plan: docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan.md
---

# Slate v2 ClawSweeper `v2-react-runtime` Ralplan

## Verdict

The next cluster is `v2-react-runtime`.

Do not go back to `v2-input-runtime`: that execution checkpoint is complete for
the available local proof lane. Do not jump to `v2-core-engine`: it is larger,
but the full issue-ledger execution phasing puts React runtime/projection after
input and DOM bridge proof, and the live React surface already has enough
provider, selector, projection, annotation, and widget contracts to make this a
high-leverage proof batch.

Hard take: this bucket should not become a generic React cleanup. The real
target is narrower and sharper:

```txt
stable editor identity
+ committed snapshot publishing
+ selector-first subscriptions
+ projection/annotation/widget sidecars
+ focus/scroll lifecycle ownership
+ no broad rerender as default behavior
```

Current Slate Ralplan state: **done**. This plan completed current-state read,
ClawSweeper related issue discovery, issue-ledger routing, research/live-source
refresh, performance/DX/migration proof, objection/high-risk review,
issue-sync accounting, and closure scoring for the React runtime/projection
surface.

## Intent And Boundary

Intent:

- turn the `v2-react-runtime` issue bucket into executable proof slices;
- stop React lifecycle, subscription, focus, projection, and renderer pressure
  from leaking into core Slate;
- keep raw Slate unopinionated while making React usage predictable for humans,
  Plate, and agents.

Desired outcome:

- React provider replacement, focus reconciliation, selector subscriptions,
  decoration/projection stores, annotation stores, widgets, and render-time
  state all have explicit owners and focused proof;
- issue claims stay honest: existing exact fixes remain exact, related React
  runtime issues stay related until their reproduction is replayed;
- implementation work can proceed slice by slice with `ralph` after this plan
  reaches closure score.

In scope:

- `../slate-v2/packages/slate-react` provider, hooks, selector runtime,
  projection stores, annotation/widget stores, focus/scroll lifecycle, and
  React-visible render contracts;
- browser/example proof only where focus, selection, scroll, or render behavior
  is user-visible;
- ledger accounting for `v2-react-runtime`, `already-accounted` projection
  rows, and tempting but non-claim React reports.

Non-goals:

- no React-specific core editor model;
- no current-version Plate adapter requirement;
- no product comment/toolbar/annotation UX in raw Slate;
- no legacy controlled `value` prop revival;
- no exact closure for Redux/MobX/HMR/debugger reports without a current repro.

Decision boundaries:

- `slate-react` owns React context, provider replacement, subscription fanout,
  focus state reconciliation, render-time projection, and sidecar UI stores.
- `slate` owns committed snapshots, operations, runtime IDs, and transaction
  facts consumed by selectors.
- `slate-dom` owns DOM point/range and browser selection bridges that React
  lifecycle may call into, but React does not own DOM truth.
- Broad hooks such as `useEditor` can remain broad by contract; narrow hooks and
  selectors must be the recommended hot path.
- Exact issue closure requires current repro proof, not architecture vibes.

Unresolved user-decision points:

- none. The next work is evidence and plan hardening.

## Source-Backed Current State

- The full issue matrix lists `28` `v2-react-runtime` rows, including #5826,
  #5806, #5690, #5689, #5669, #5603, #5473, #5404, #3497, #3478, #3383,
  #4995, #4590, #4366, #4315, #4311, #4298, #4225, #4221, #4025, #3924,
  #3892, #2608, #5509, and #3309.
- The frozen requirements file says React runtime, identity, and subscription
  pressure covers `111` issues and that `slate-react-v2` owns subscriptions,
  lifecycle, focus timing, placeholder/render timing, editor replacement
  semantics, React-facing lifecycle integration, and render-time decoration or
  annotation projection.
- `../slate-v2/packages/slate-react/src/components/slate.tsx:96` creates the
  selector context, `:108` subscribes to editor commits, `:123` batches commit
  fanout, `:162` dispatches selector updates, `:175` composes decoration and
  annotation projection sources, and `:216` publishes the provider stack.
- `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:66`
  exposes `useEditorSelector`, `:135` exposes `useEditorState`, and `:171`
  owns global/runtime/deferred selector fanout.
- `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:53`
  proves `useEditor` updates when `<Slate editor>` changes, `:127` proves
  selector `shouldUpdate` receives commit facts, and `:182` proves
  `useEditorState` reads through `editor.read`.
- `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx:105`
  proves product-noun decoration sources, overlapping projections, and
  cross-node projection behavior.
- `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx:126`
  proves one annotation entity drives inline projection and sidebar state.
- `../slate-v2/packages/slate-react/test/widget-layer-contract.tsx:88` proves
  selection widgets toggle without rerendering text slices.
- `../slate-v2/packages/slate-react/test/surface-contract.tsx:152` fences
  generic selector ownership to named surfaces.

Current-state read result:

- already done in live source: provider replacement proof for #5709 exists.
- already done in live source: editor initialization proof for #6013/#5605
  exists outside this bucket and must not be re-litigated here.
- already represented but not exact-closed: rerender breadth (#3656/#4141),
  projection pressure (#4483/#4392/#3382/#3352), Redux/MobX/external-store
  pressure (#3478/#5509), and focus loss (#3497).
- complete: ClawSweeper has run against all current `v2-react-runtime` rows,
  adjacent projection rows, and the generated reroute candidates.
- gap: no closure score exists for this bucket, and no implementation phase
  should start until research/live-source, objection, and proof-gate passes
  finish.

## Decision Brief

Principles:

- React is an adapter over committed Slate snapshots, not the source of editor
  truth.
- Hot paths prefer named selectors and runtime-id fanout over broad context
  invalidation.
- Projection, annotation, and widget UI live in sidecar lanes.
- Exact issue claims require replayable proof.
- Raw Slate exposes substrate primitives; product UI stays outside.

Drivers:

- React runtime/identity/subscription pressure is `111` issues in the corpus.
- `v2-react-runtime` has `28` explicit action-bucket rows plus adjacent
  `already-accounted` projection and rerender rows.
- Current source already has the right backbone; the risk is loose proof and
  overclaiming, not missing direction.
- GitHub-scale performance lessons apply here: cheap rendered units,
  selector/local fanout, no per-node complex state, and no broad handlers in
  hot repeated components.

Options:

| Option | Verdict | Why |
| --- | --- | --- |
| Make core Slate React-shaped | reject | Solves adapter pressure by polluting the data model. |
| Keep broad provider invalidation as normal | reject | Recreates render-breadth and focus churn issues. |
| Add product-specific annotation/comment APIs | reject | Plate/product lane, not raw Slate. |
| Selector-first React runtime with sidecar stores | choose | Matches live source, issue pressure, and performance constraints. |
| Focus only on projection rows | reject for cluster | Projection is important, but the bucket also covers provider replacement, focus, scroll, readonly/static rendering, hook typing, and placeholder rendering. |

Chosen shape:

```txt
editor commit -> committed snapshot
  -> provider publishes editor/context
  -> selector runtime fans out by global/runtime/deferred owner
  -> projection/annotation/widget stores update by affected ids
  -> DOM/selection/focus bridges repair only their owned browser surface
```

Consequences:

- `v2-react-runtime` should execute through proof slices, not one giant hook
  rewrite.
- Broad hooks remain allowed but documented as broad; hot usage should use
  selectors or sidecar stores.
- External reactive integration reports stay `Related` until a current Redux,
  MobX, or parent-rerender repro proves exact closure.

Follow-ups:

- pressure-test focus/scroll/browser claims separately from pure hook tests;
- update ledger/dossier/PR references only when claim status changes.

## Public API Target

Keep the public direction:

```tsx
<Slate editor={editor} decorationSources={[source]} annotationStore={store}>
  <Editable />
</Slate>
```

Recommended hot-path hooks:

```ts
useEditorState(selector, options)
useEditorSelector(selector, equalityFn, options)
useNodeSelector(selector, equalityFn, options)
useTextSelector(selector, equalityFn, options)
useSlateProjections(runtimeId)
useSlateAnnotation(id)
useSlateWidget(store, id)
```

Hard cut:

- no provider-level `initialValue`;
- no controlled React `value` prop as the main state model;
- no public `projectionStore` prop when product-noun `decorationSources` and
  `annotationStore` cover the shape;
- no app-level comment/widget UX in raw Slate.

## Internal Runtime Target

- Keep `Slate` as a commit subscriber and context publisher.
- Keep selector fanout centralized in `useEditorSelectorContext`.
- Keep root selector sources named and fenced.
- Keep projection/annotation/widget stores as sidecar stores keyed by runtime
  facts.
- Add proof where focus/scroll/readOnly/static rendering is still only
  cluster-synced, not exact-claimed.

## Issue-Ledger Accounting

ClawSweeper related issue pass:

- status: `complete`
- trigger: this plan touches public React hooks/provider behavior, render-time
  projection, focus/scroll lifecycle, examples, issue claims, and PR narrative.
- search surface: `v2-react-runtime`, `already-accounted` projection
  rows, gitcrawl clusters `3`, `10`, `19`, and singleton React runtime rows.
- gitcrawl evidence:
  - `gitcrawl doctor --json` returned `659` open threads and `617` clusters,
    last synced on 2026-05-04.
  - cluster `3`: #3478, #4001, #3497, #3777. This is mixed and must stay
    manually split.
  - cluster `10`: #5987 and PR #6033. Strong async-decoration caret family.
  - cluster `19`: #5088 and #5473. Strong scrollSelectionIntoView family.
  - singleton thread batch covered the remaining React runtime/projection rows.
- reviewed refs: #5826, #5806, #5690, #5689, #5669, #5603, #5473,
  #5404, #3497, #3478, #3383, #4995, #4590, #4366, #4315, #4311, #4298,
  #4225, #4221, #4025, #3924, #3892, #2608, #5987, #4483, #4477, #4392,
  #3382, #3352, #5509, #3309.

Classification result:

| Family | Issues | Classification | Reason |
| --- | --- | --- | --- |
| provider identity / external React stores | #3478, #3497, #5509 | Related | architecture owner is React runtime/focus/subscription; exact Redux/MobX/parent-state repros are not replayed |
| projection / decoration / annotation sidecars | #5987, #4483, #4477, #4392, #3382, #3352 | Improves | existing projection, annotation, widget, and render-breadth proof materially addresses pressure without claiming legacy API closure |
| decoration/mark semantics candidate | #3383, #3309 | Related | v2 projection model is the owner, but exact overlapping-mark and Firefox decorated-selection repros are not proven |
| inline and gesture selection | #5806, #5690, #5689 | Related | require browser gesture proof around inline/custom boundaries |
| scroll and focus lifecycle | #5826, #5473, #4995, #4590 | Related | require exact refocus/delete/arrow/custom-boundary browser proof |
| native input event pass-through | #5603, #5669 | Related | already covered by input-runtime dossier; no React-runtime claim change |
| hook and component typing | #5404, #4366 | Related | v2 hook/component typing surface is cleaner, but legacy exact API closure is not claimed |
| placeholder rendering | #4315, #4221, #2608 | Related | placeholder owner is React runtime; exact symbol/select-all/alignment proof missing |
| readonly/static/custom surface | #4311, #4025, #3924, #3892 | Related / Not claimed | static/readOnly pressure is valid; custom layout engine is ecosystem/product territory |
| mark query/rendered editor state | #4298, #4225 | Related | needs focused mark-query/hook proof |

Fixed issues:

- none from this plan.
- keep existing fixed claims unchanged: #6013, #5605, #5709.

Related or improved candidates:

- `Improves`: projection/rerender rows that already have proof, if ClawSweeper
  confirms the existing issue coverage matrix remains accurate.
- `Related`: external-store/focus/browser-scroll rows without current exact
  repro proof.
- `Not claimed`: stale HMR/debugger/readonly API shape rows unless current
  proof makes them actionable.

Live-ledger sync status:

- unchanged. `docs/slate-issues/gitcrawl-live-open-ledger.md` is a live corpus
  list, not an action-bucket matrix, so no row changed there for this pass.

Issue-ledger pass:

- status: `complete`
- reviewed sources:
  `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan-issue-matrix.md`,
  `docs/slate-issues/open-issues-ledger.md`,
  `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- decision: #5509 and #3309 move from `v2-input-runtime` to
  `v2-react-runtime`. Both are React-runtime owner rows in category,
  package, cluster, and dossier evidence. Leaving them in input runtime was
  generated-accounting drift, not a real policy split.
- resulting bucket counts:
  - `v2-input-runtime`: `149` -> `147`;
  - `v2-react-runtime`: `26` -> `28`.
- exact claims:
  - `Fixed`: unchanged, keep only #6013, #5605, and #5709.
  - `Improves`: unchanged, keep existing projection/rerender improvement rows.
  - `Related`: #5509 and #3309 stay related, not fixed.
  - `Not claimed`: unchanged.
- PR reference sync: no PR-body issue count or exact claim changed, so no
  `docs/slate-v2/references/pr-description.md` edit is needed for this pass.

Fork dossier sync status:

- complete for this pass. Added fork-local sections for #5806, #5690, #5689,
  #5404, #3383, #4995, #4590, #4366, #4315, #4311, #4298, #4225, #4221, #4025,
  #3924, #3892, #2608, #4483, #4477, #4392, #3382, and #3352. Existing sections
  already covered #5987, #5826, #3478, #3497, #5473, #5603, #5669, #5509, and
  #3309.

PR reference sync status:

- skipped for this pass. Accepted API shape, proof status, exact fixed claims,
  and PR-visible issue claim counts did not change.

Research/live-source refresh:

- status: `complete`
- React:
  `../react/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js:18`
  exposes the selector/equality external-store shape; `:91`-`:99` bails out
  when selected values are equal; `:117`-`:121` delegates to
  `useSyncExternalStore`. This supports Slate v2's selector-first React
  adapter. It does not replace Slate's own commit dirtiness or runtime-id
  indexing.
- Lexical:
  `../lexical/packages/lexical/src/LexicalEditor.ts:862`-`:888` partitions
  update and decorator listeners; `:1375`-`:1387` makes `read` and `update`
  the explicit coherence boundaries; `../lexical/packages/lexical/src/LexicalUpdateTags.ts:10`-`:74`
  names history, paste, collaboration, scroll, DOM-selection, focus, and
  composition tags; `../lexical/packages/lexical/src/LexicalUpdates.ts:257`-`:348`
  processes dirty leaves before dirty elements; and
  `../lexical/packages/lexical/src/LexicalReconciler.ts:792`-`:815` feeds
  dirty sets into reconciliation. This is still the stronger dirty-reconcile
  benchmark Slate v2 must answer with operation-derived commit dirtiness.
- ProseMirror:
  `../prosemirror/view/src/selection.ts:9`-`:47` centralizes DOM selection
  import and `:55`-`:101` centralizes DOM selection export;
  `../prosemirror/view/src/domobserver.ts:39`-`:85` owns mutation observation
  and `:224`-`:248` coordinates dirty marking, DOM change handling, view state
  update, and DOM selection repair. `../prosemirror/view/src/viewdesc.ts:31`-`:80`
  defines NodeView obligations, and `:666`-`:724` shows `contentDOM` as the
  child-rendering boundary. `../prosemirror/view/src/decoration.ts:665`-`:735`
  keeps decorations as mapped view data. This reinforces Slate v2's centralized
  DOM bridge and projection-store direction.
- Tiptap:
  `../tiptap/packages/react/src/useEditor.ts:351`-`:379` uses external-store
  subscription and opts out of transaction rerender by default;
  `../tiptap/packages/react/src/useEditorState.ts:157`-`:164` uses
  `useSyncExternalStoreWithSelector`; and
  `../tiptap/packages/core/src/CommandManager.ts:59`-`:92` builds chained
  commands around one transaction. Tiptap remains a DX benchmark, not an engine
  model to copy wholesale.
- Legacy Slate:
  `../slate/packages/slate-react/src/hooks/use-decorations.ts:28`-`:44`
  recomputes decoration selectors through `ReactEditor.findPath`;
  `../slate/packages/slate-react/src/hooks/use-children.tsx:62`-`:70`
  refreshes `NODE_TO_INDEX` / `NODE_TO_PARENT` during render; and
  `../slate/packages/slate-react/src/hooks/use-slate-selector.tsx:87`-`:89`
  fans broad selector listeners on every editor change. This is the residual
  shape v2 is cutting away.
- Current Slate v2:
  `../slate-v2/packages/slate-react/src/components/slate.tsx:96`-`:172`
  publishes commit-aware selector dispatch; `../slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:171`-`:236`
  has global, runtime-id, and deferred selector fanout; `../slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx:27`-`:57`
  uses runtime-id projection subscriptions; and
  `../slate-v2/packages/slate-react/src/hooks/use-decoration-selector.tsx:42`-`:79`
  scopes decoration reads to the runtime-id store. Existing tests at
  `../slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:53`-`:125`,
  `../slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx:404`-`:443`,
  and `../slate-v2/packages/slate-react/test/annotation-store-contract.tsx:486`-`:545`
  already prove the first layer of provider replacement, selector equality,
  runtime projection wakeup, and annotation/projection split.

Research verdict:

- no pivot. The chosen React-runtime direction is still correct.
- strengthen the execution plan against Lexical's dirty-set/reconcile bar and
  ProseMirror's DOM view/selection bridge bar.
- do not copy Lexical class nodes, ProseMirror NodeViews, or Tiptap
  command-first authoring as the raw Slate public model.
- keep exact issue claims unchanged.

## Confidence Score

| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React 19.2 runtime performance | 0.20 | 0.93 | selector/runtime fanout has cohort budgets, repeated-unit budgets, benchmark commands, maintainer objection rows, and no ledger drift |
| Slate-close unopinionated DX | 0.20 | 0.92 | provider/hooks stay Slate-close; broad hooks remain allowed while selector-first is the hot-path contract |
| Plate and slate-yjs migration backbone | 0.15 | 0.88 | migration is substrate-level with explicit runtime-id, bookmark, extension namespace, transaction fact, and commit metadata expectations |
| Regression-proof testing strategy | 0.20 | 0.93 | unit, browser, benchmark, native-behavior, TDD, and high-risk pre-mortem gates are selected and scoped |
| Research evidence completeness | 0.15 | 0.92 | compiled research, live source, issue matrix, fork dossier, coverage matrix, PR reference, and benchmark surfaces were checked |
| shadcn-style composability and minimal hooks | 0.10 | 0.91 | hook/store families stay small; product-shaped APIs, hook sprawl, and command-first authoring remain rejected |

Total: `0.92`.

Gate result: **done**. The plan is ready for `ralph` execution. No new fixed
issue claims were added.

## Pass Schedule And State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state-read-and-initial-score | complete | full issue matrix, requirements, issue coverage, live `slate-react` source/tests | selected `v2-react-runtime` and scored `0.78` | ClawSweeper not run for this bucket | related-issue-discovery-pass |
| related-issue-discovery-pass | complete | gitcrawl doctor, clusters `3`, `10`, `19`, singleton thread batch, live ledger rows, current dossier | classified React runtime/projection families; added missing dossier sections; score moved to `0.81` | issue matrix reroute candidates #5509/#3309; no exact claim changes | issue-ledger-pass |
| issue-ledger-pass | complete | issue matrix, open issue ledger, live gitcrawl ledger, fork dossier, issue coverage matrix | rerouted #5509/#3309 from `v2-input-runtime` to `v2-react-runtime`; score moved to `0.84` | no exact claim changes; PR reference unchanged | research-and-live-source-refresh |
| research-and-live-source-refresh | complete | live React, Lexical, ProseMirror, Tiptap, Slate legacy, Slate v2 source; compiled research pages | kept direction; added dirty-set, DOM bridge, NodeView/contentDOM, mapped-decoration, and Tiptap selector/DX evidence; score moved to `0.86` | proof gates still need prioritization | performance-dx-migration-proof-pass |
| performance-dx-migration-proof-pass | complete | performance rules, live benchmark command surface, render-profiler contracts, stress browser budget tests, native-behavior policy rows | added cohort, repeated-unit, unit/browser/bench, React 19, TDD, and migration-substrate gates; score moved to `0.88` | objection/high-risk pass still needs to challenge the gate set before closure | objection-and-high-risk-pass |
| objection-and-high-risk-pass | complete | steelman rows, high-risk trigger, blast radius, pre-mortem, expanded proof plan | kept the architecture; revised proof policy around broad hooks, benchmark scope, React `Activity`, shell/stress degradation, issue claims, and migration non-claims; score moved to `0.89` | issue-sync pass must decide whether any ledger/PR reference needs a no-op note | issue-sync-accounting-pass |
| issue-sync-accounting-pass | complete | issue coverage matrix, fork dossier, PR reference, live gitcrawl ledger, issue matrix claim rows | confirmed no new fixed/improves/related claim changes after performance and objection passes; no PR reference edit needed; score moved to `0.90` | closure score and handoff still pending | closure-score-and-handoff |
| closure-score-and-handoff | complete | final score, accepted decisions, hard cuts, execution handoff | marked plan ready for `ralph`; score moved to `0.92`; no new issue claims | none for this ralplan | ralph |

## Implementation Phases Draft

Do not execute these until this Ralplan reaches closure score.

1. React provider/hook identity and selector fanout proof:
   - protect editor replacement, hook return types, broad-vs-narrow hook
     semantics, and provider callback facts.
   - prove runtime-id selectors ignore unrelated commits and broad selectors
     stay intentionally broad.
2. Projection/annotation/widget proof:
   - prove projection rebasing, overlapping payloads, stable annotation/widget
     updates, and no repeated text slice rerenders.
3. Focus/scroll/readOnly/static rendering proof:
   - map #5826, #5473, #4995, #4590, #4311, #4025, #3924 to exact proof or
     keep them related.
4. Performance artifact proof:
   - run current React benchmark commands for rerender breadth, huge document
     overlays, and huge document legacy comparison before any performance
     claim.
5. Migration substrate proof:
   - keep Plate/slate-yjs proof at the substrate level: provider replacement,
     selector facts, annotation/widget sidecars, runtime ids/bookmarks,
     extension namespaces, transaction facts, and commit metadata.
6. Ledger and PR sync:
   - only add `Fixes`, `Improves`, or `Related` rows that the proof actually
     justifies.

## Fast Driver Gates

Performance/DX/migration proof pass result:

- status: `complete`
- lenses applied: `performance`, `performance-oracle`, `tdd`
- performance rule files applied:
  - `cohort-segmentation`
  - `repeated-unit-budget`
  - `effect-subscription-budget`
  - `interaction-inp-matrix`
  - `memory-dom-tagging`
  - `editor-native-behavior-proof`
  - `react-19-runtime-proof`
  - `degradation-contract`
- Vercel React micro-rule families used as constraints:
  - selector/rerender rules;
  - event-listener rules;
  - `js-*` map/index/cache rules;
  - `rendering-activity` only for hidden/background UI, not editable body
    virtualization.

Workload cohorts:

| Cohort | Size / shape | Default contract |
| --- | --- | --- |
| normal | `0`-`500` blocks | DOM-present, no degraded native behavior |
| medium | `500`-`2000` blocks | DOM-present, strict repeated-unit budget |
| large | `2000`-`10000` blocks | DOM-present grouping or staged readiness only when native behavior remains classified and measured |
| stress | `10000`-`50000` blocks | explicit opt-in degradation candidate; no native-equivalence claim |
| pathological | custom renderers, many decoration sources, annotations, widgets, voids, hidden boundaries, tables, IME/mobile | must carry separate browser/native proof rows |

Repeated-unit budgets:

- default paragraph/text render path:
  - `0` Slate-owned event handlers per repeated unit;
  - `0` `useEffect` calls per repeated unit unless synchronizing an actual
    external system;
  - no O(document) lookup during block, text, or leaf render;
  - selector subscriptions scoped by runtime id, root source, or explicitly
    broad owner;
  - no comment/widget/menu/annotation state mounted in every repeated text
    unit.
- projection/annotation/widget lanes:
  - runtime-id or source-id scoped wakeups;
  - changed bucket count must match the affected runtime/source ids;
  - metadata-only updates must not repaint stable projection text slices;
  - product UI stays sidecar/portal, not body-render state.
- browser-visible repeated surfaces:
  - render-profiler rows must keep unrelated editables, text slices, voids,
    overlays, and widgets asleep;
  - event listener count, mounted group count, DOM node count, heap, cached
    index sizes, and dirty-id set sizes must be tagged with the benchmark
    artifact or paired trace.

Required unit gates:

```bash
cd ../slate-v2
bun --filter slate-react test:vitest -- provider-hooks-contract projections-and-selection-contract annotation-store-contract widget-layer-contract surface-contract render-profiler-contract rendering-strategy-and-scroll
bun --filter slate-react typecheck
```

Required benchmark gates:

```bash
cd ../slate-v2
bun run bench:react:rerender-breadth:local
bun run bench:react:huge-document-overlays:local
bun run bench:react:huge-document:legacy-compare:local
bun run bench:core:refs-projection:local
```

Benchmark artifacts must use the existing command surface in
`../slate-v2/scripts/benchmarks/README.md`, including the current JSON outputs
under `packages/slate-react/tmp/` and `tmp/`. Do not add parallel benchmark
files unless a new metric changes a release decision.

Required browser/stress gates:

- keep generated stress rows green for:
  - search highlight render budget;
  - external decoration sources;
  - annotation metadata-only updates;
  - annotation bookmark rebase;
  - widget dirty id updates;
  - mixed overlay updates;
  - rendering strategy runtime budget.
- if an implementation touches focus, scroll, static rendering, readOnly,
  voids, placeholders, inline custom boundaries, or browser-visible selection,
  add/run the focused Playwright route grep that owns that route before
  changing any issue claim.

Native behavior classification:

| Surface | Normal/medium/large DOM-present | Shell/virtualized/stress |
| --- | --- | --- |
| browser find | native or explicitly `nativeSurfaceComplete`-gated | `not-native-until-mounted` |
| native selection | DOM bridge owns import/export | `model-backed` or materialize-first |
| copy/select-all | native/model payload must match current policy | model-backed payload with explicit policy |
| paste | never into stale/missing DOM | materialize or reject by policy |
| IME/mobile touch | urgent target must already be mounted | materialize before target interaction |
| undo/history/collab | commit facts and runtime ids drive selectors | no mount-state pollution in history |

React 19 rule:

- `useSyncExternalStore` with selector/equality is the approved external-store
  shape for committed editor/runtime state.
- `Activity` is allowed for hidden panels, debug UI, and background examples.
  It is not a hidden editable subtree primitive.
- `startTransition` and deferred values are allowed for non-urgent overlays,
  search sidebars, and inspector work. Typing, selection, composition, and
  caret repair stay urgent.

Migration proof:

- Plate/slate-yjs proof stays substrate-level for this bucket:
  - provider replacement;
  - selector facts;
  - runtime id and bookmark stability;
  - decoration/annotation/widget sidecars;
  - extension `state` / `tx` namespaces;
  - deterministic transaction facts and commit metadata.
- Do not require a current Plate adapter or current slate-yjs public API
  compatibility fixture from raw Slate in this Ralplan.

TDD gate:

- add one behavior-first red/green proof per implementation slice;
- test public contract and browser behavior, not private store internals;
- do not write dead-code-removal tests for APIs this rewrite intentionally
  cuts.

## Objection And High-Risk Pass

Status: `complete`.

Skills/lenses applied:

- `steelman-pass`
- `high-risk-deliberate-pass`
- `intent-boundary-pass` skipped after read: the plan already has explicit
  intent, scope, non-goals, and decision boundaries.

High-risk trigger:

- public React hook/provider behavior;
- runtime subscription fanout;
- browser-visible focus, scroll, selection, readOnly, static-rendering, and
  placeholder behavior;
- performance release gates;
- Plate/slate-yjs migration substrate;
- issue-claim and PR narrative accuracy.

Blast radius:

- packages: primarily `../slate-v2/packages/slate-react`, with DOM bridge
  pressure in `../slate-v2/packages/slate-dom` when browser behavior is touched;
- consumers: raw Slate React users, Plate, slate-yjs-style collaboration
  consumers, examples, and docs;
- behavior: editor identity, render breadth, selection/focus repair,
  projections, annotations, widgets, void/static/readOnly rendering, and
  browser-native behavior;
- artifacts: unit tests, generated stress browser tests, benchmark JSON,
  issue matrix, fork dossier, issue coverage matrix, PR reference.

Maintainer objection rows:

| Decision | Strongest fair objection | Verdict | Accepted revision |
| --- | --- | --- | --- |
| Selector-first React runtime | "This can become a custom mini React store that is harder to reason about than context." | keep | selectors must stay commit-fact based, runtime/source scoped, and measured with render-profiler and benchmark rows |
| Broad hooks remain available | "`useEditor` and broad selectors will let users recreate render-breadth bugs." | revise | broad hooks are allowed by contract, but hot-path docs/proof must point to narrow selectors and sidecars |
| Projection/annotation/widget sidecars | "This splits behavior across stores and can hide stale projection or copy/selection bugs." | keep | sidecar updates need runtime-id/source-id wakeup proof plus browser/native behavior proof when they affect visible text |
| Focus/scroll/readOnly/static proof | "This bucket can balloon into every old browser bug." | revise | exact issue claims require exact browser repro proof; otherwise rows stay `Related` |
| Performance benchmark gates | "Running all benchmarks for every slice is too slow and will rot." | revise | unit gates are per-slice; benchmark gates are bucket/release proof before performance claims |
| React 19 `Activity` | "People will use Activity as virtualized editable-body support and call it done." | hard cut | `Activity` is only for hidden/background UI; editable missing-DOM uses DOM coverage policy, not React hiding |
| Shell/stress degradation | "Classifying degraded native behavior normalizes a worse editor." | hard cut | shell/virtualized/stress remain explicit opt-in/non-default and cannot claim native equivalence |
| Plate/slate-yjs migration substrate | "Substrate proof is too vague to help real migrations." | revise | require runtime ids/bookmarks, extension namespaces, transaction facts, and commit metadata when implementation touches migration surfaces |
| Issue claims | "The plan can sound like it fixes #3478/#3497/#5509 without replaying them." | keep hard boundary | exact fixed claims remain only #6013, #5605, #5709 until current repro proof lands |
| Hook/store surface area | "Too many hooks can become API sprawl." | revise | keep one canonical selector path and treat convenience hooks as proven wrappers, not independent concepts |

Three-scenario pre-mortem:

1. Render breadth returns under a nicer API:
   - cause: broad hooks or sidecar stores subscribe too widely;
   - symptom: typing outside projection/comment/widget regions wakes text,
     voids, overlays, or widgets;
   - prevention: render-profiler, generated stress budgets, and rerender
     breadth benchmarks are required before performance claims.
2. Browser behavior passes unit tests and fails in real editing:
   - cause: focus/scroll/static/readOnly/placeholder rows are proven through
     hooks only;
   - symptom: selection jumps, focus is lost, browser find/copy diverges, or
     mobile/IME breaks near custom boundaries;
   - prevention: browser/stress rows are mandatory before changing exact issue
     claims for browser-visible behavior.
3. Migration and PR story overclaim:
   - cause: current architecture is directionally better, so related issue rows
     get promoted without current repro proof;
   - symptom: PR says fixed when the fork only has substrate or improvement;
   - prevention: no claim changes in this pass; issue-sync pass must preserve
     `Related` unless proof is exact.

Expanded proof plan:

- unit:
  - provider replacement and hook typing;
  - selector equality and broad/narrow semantics;
  - runtime projection, annotation, widget, surface ownership, and rendering
    strategy contracts.
- browser:
  - generated stress rows for search, decoration sources, annotations, widgets,
    and rendering strategy;
  - focused route proofs for focus, scroll, readOnly, static rendering,
    placeholders, voids, and inline/custom boundaries when touched.
- performance:
  - rerender breadth;
  - huge document overlays;
  - huge document legacy compare;
  - refs/projection benchmark;
  - heap/DOM/listener/cache/mounted-group tags when a mode claims performance.
- migration/adoption:
  - raw Slate keeps provider/hooks/sidecars unopinionated;
  - Plate/slate-yjs proof stays substrate-level until adapter work is actually
    in scope.
- docs/examples:
  - broad hooks documented as broad;
  - selector-first hot path shown as the default recommendation;
  - shell/virtualized/stress modes documented as opt-in with degraded native
    behavior classification.

Verdict:

- keep the architecture;
- revise proof policy around benchmark scope, broad-hook language, Activity,
  shell/stress degradation, migration substrate, and exact issue claims;
- do not start implementation until issue-sync and closure passes complete.

## Issue Sync Accounting Pass

Status: `complete`.

Reviewed artifacts:

- `docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan-issue-matrix.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`

Decision:

- no issue matrix edit is needed;
- no fork dossier edit is needed;
- no issue coverage matrix edit is needed;
- no PR reference edit is needed;
- no live gitcrawl ledger edit is needed.

Reason:

- exact fixed issue claims remain #6013, #5605, and #5709 only;
- #5509 and #3309 are already `Related` in the issue coverage matrix and fork
  dossier;
- the objection/high-risk pass changed proof policy, not issue status;
- no accepted public API, proof, release-gate, or fixed issue count changed in
  a way that belongs in `docs/slate-v2/references/pr-description.md`.

Ledger result:

- `Fixes`: unchanged.
- `Improves`: unchanged.
- `Related`: unchanged.
- `Not claimed`: unchanged.
- PR-visible claim count: unchanged.

## Closure Score And Ralph Handoff

Status: `complete`.

Closure verdict:

- score: `0.92`;
- no dimension below `0.85`;
- all scheduled Slate Ralplan passes are complete;
- the plan is ready for `ralph` execution;
- no new `Fixes`, `Improves`, or `Related` issue claim was added during
  closure.

Accepted decisions:

- execute the `v2-react-runtime` bucket next;
- keep raw Slate's React runtime selector-first and sidecar-driven;
- keep broad hooks available but not recommended for hot repeated units;
- keep product-shaped comment/widget APIs out of raw Slate;
- use existing `../slate-v2` unit, stress, and benchmark surfaces as the proof
  backbone;
- treat React `Activity` as hidden/background UI only, never as editable
  missing-DOM support;
- keep shell/virtualized/stress behavior opt-in and explicitly degraded when
  native browser behavior changes;
- keep Plate/slate-yjs migration proof substrate-level unless adapter work is
  explicitly in scope;
- keep exact fixed issue claims to #6013, #5605, and #5709 only.

Ralph execution order:

1. Provider/hook identity and selector fanout:
   - protect editor replacement, hook return types, selector equality,
     broad-vs-narrow hook semantics, and runtime-id fanout.
2. Projection/annotation/widget sidecars:
   - prove projection rebasing, overlapping payloads, annotation metadata
     updates, widget dirty ids, and no repeated text-slice rerenders.
3. Browser-visible lifecycle:
   - only exact-claim focus/scroll/readOnly/static/placeholder/inline rows after
     focused browser proof.
4. Performance artifacts:
   - run the selected React/unit/stress/benchmark gates before any performance
     claim.
5. Migration and ledger sync:
   - preserve substrate-level Plate/slate-yjs evidence and update ledgers only
     when proof changes a concrete claim.

First `ralph` target:

- start with provider/hook identity and selector fanout.
- do not patch issue claims during the first execution slice unless the slice
  adds exact repro proof for a named issue.

## Hard Cuts

- Do not resurrect provider `initialValue`.
- Do not add controlled React `value`.
- Do not make core Slate own React subscriptions.
- Do not collapse projection, annotations, widgets, and product comments into
  one product-shaped public API.
- Do not claim Redux/MobX/focus/HMR/debugger fixes without current repro proof.

## Final Completion Gates

- ClawSweeper and issue-ledger passes complete for the React
  runtime/projection surface.
- Issue matrix and fork dossier synced for every reviewed issue section.
- PR reference updated if and only if claim/API/proof status changes.
- Every accepted implementation phase has focused unit and, where needed,
  browser proof.
- Score `>= 0.92`, no dimension below `0.85`.
- Pass-state ledger shows all earlier passes complete before closure.

Current closure result:

- complete.

## Ralph Execution Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| provider-hook-identity-selector-fanout | complete | `EditorSelectorOptions<TEditor>` red/green type contract; focused provider/surface tests; package typecheck now includes the generic selector contract | exported typed selector options and kept internal selector fanout raw; PR reference synced for public hook typing | no issue claim changes | projection-annotation-widget-sidecars |
| projection-annotation-widget-sidecars | complete | projection, annotation, widget, render-profiler, and rendering-strategy unit gate green | no code delta; existing sidecar proof remains current | no issue claim changes | browser-visible-lifecycle |
| browser-visible-lifecycle | skipped | current code slice changed selector type surface only; no focus, scroll, selection, static rendering, placeholder, void, or browser route behavior changed | browser gate remains required for future browser-visible deltas | no issue claim changes | performance-artifacts |
| performance-artifacts | skipped | no performance claim changed | benchmark gates remain release/performance-claim gates | no issue claim changes | migration-and-ledger-sync |
| migration-and-ledger-sync | complete | issue coverage unchanged; PR reference synced for public API shape | execution checkpoint updated; `tmp/continue.md` remains the next-pass handoff | no issue claim changes | complete-or-next-cluster |
