---
date: 2026-04-14
topic: slate-v2-decoration-roadmap
status: complete
---

# Slate v2 Decoration Roadmap

## Purpose

Turn the old `decorate` mess into an explicit, high-performance, React-native
overlay architecture that is honest enough to block or unlock `True Slate RC`.

This is not another research note.
This is the final execution authority for this lane until implementation or new
primary evidence proves one of its locked assumptions wrong.

This plan defines the architecture lock, implementation sequence, proof owners,
and RC exit conditions for the overlay system.

2026-04-15 extension:

- Waves 0-8 remain complete for the RC overlay architecture lane.
- Waves 9-11 are now the active next-step “perfect decorations” tranche for the
  stronger field-best perf-architecture claim.
- These waves are driven by:
  - [slate-v2-react-19-2-perf-architecture-vs-field.md](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md)
  - [slate-v2-source-scoped-overlay-invalidation.md](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md)
  - [source-scoped-overlay-invalidation.md](/Users/zbeyens/git/plate-2/docs/research/concepts/source-scoped-overlay-invalidation.md)

## RC blocker status

This lane was a blocker for:

- `True Slate RC`
- any future blanket `slate-react` “no regression vs legacy Slate React” claim

The first overlay architecture lane is complete.

The next active decoration work is no longer architecture naming or examples.
It is source-scoped invalidation.

Remaining broader `True Slate RC` blockers now live outside this plan in:

- exhaustive API/public-surface contract-width audit

Post-RC broader follow-up lives outside this plan in:

- browser/input external-evidence rows

## Authority

Primary rationale:

- [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decorations-annotations-cluster.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [decorations-annotations-overlay-corpus.md](/Users/zbeyens/git/plate-2/docs/research/sources/editor-architecture/decorations-annotations-overlay-corpus.md)
- [editor-architecture-landscape.md](/Users/zbeyens/git/plate-2/docs/research/systems/editor-architecture-landscape.md)
- [slate-v2-overlay-architecture.md](/Users/zbeyens/git/plate-2/docs/research/systems/slate-v2-overlay-architecture.md)
- [slate-v2-overlay-architecture-cuts.md](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-overlay-architecture-cuts.md)
- [slate-v2-react-19-2-perf-architecture-vs-field.md](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md)
- [slate-v2-source-scoped-overlay-invalidation.md](/Users/zbeyens/git/plate-2/docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md)

Primary roadmap / verdict owners:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/replacement-family-ledger.md)

## Plan freeze

Broad research on the decorations / annotations lane is closed.

This plan is the locked starting contract for execution.

Only reopen the architecture if:

- implementation breaks one of the stated stop conditions
- new primary evidence contradicts the current research layer
- browser proof or benchmark proof falsifies the current shape

Current local proof seams:

- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [projections-and-selection-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx)
- [annotation-store-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx)
- [widget-layer-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/widget-layer-contract.tsx)
- [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts)
- [search-highlighting.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/search-highlighting.test.ts)
- [code-highlighting.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/code-highlighting.test.ts)
- [persistent-annotation-anchors.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/persistent-annotation-anchors.test.ts)

## Execution checkpoint

Current execution reality:

- Wave 0: complete
- Wave 1: complete
- Wave 2: complete
  note:
  the shared projection runtime substrate was more landed than the first plan
  draft assumed; the real missing work was proof hardening around nested
  runtime-id projection behavior
- Wave 3: complete
- Wave 4: complete
- Wave 5: complete
- Wave 6: complete
- Wave 7: complete
- Wave 8: complete
- Wave 9: stronger-claim follow-up, pending
- Wave 10: stronger-claim follow-up, pending
- Wave 11: stronger-claim follow-up, pending

The next execution batch for decorations is no longer a tranche-5 / tranche-6
blocker. These waves now belong to the stronger post-closeout perf claim.

Perf truth note:

- benchmark command names referenced later in this roadmap are still target
  owners unless they exist in `../slate-v2/package.json` and
  `../slate-v2/scripts/benchmarks/**`
- do not read those names as current proof ownership
- current repo truth now has the kept overlay/example benchmark owners for
  tranche-5 / tranche-6 closure:
  - `bun run bench:react:rerender-breadth:local`
  - `bun run bench:react:huge-document-overlays:local`
  - broader draft benchmark names below are still target owners unless they
    exist in the repo

Remaining broader program work lives in:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)
- [2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md)

## Problem frame

The old system failed because it used one callback to pretend it could own:

- syntax highlighting
- search hits
- comments
- remote cursors
- diagnostics
- review suggestions
- browser-facing composition decoration
- big-document invalidation

That was bullshit.

The current v2 runtime and docs now settle the overlay lane cleanly.

It proves:

- projection-local decoration slices
- selection-derived annotation projection
- range-ref-backed persistent anchors
- explicit decoration-source registration
- explicit annotation and widget stores/layers

And it settles:

- browser-truth hardening around overlay churn
- huge-doc corridor-first posture
- migration truth for legacy `decorate`
- RC/control-doc reconciliation for this lane

## Decision

The target system must have **three** first-class lanes:

1. **Decorations**
   - transient
   - overlap-friendly
   - derived from snapshot state or explicit external state
2. **Annotations**
   - durable
   - id-bearing
   - bookmark-backed in the public architecture
   - allowed to reuse range-ref machinery internally
   - rebased through transactions
3. **Widgets**
   - anchored UI
   - portals, labels, buttons, balloons, diagnostics popovers, review chrome

They may share projection plumbing.
They may **not** share ownership semantics.

## Non-negotiables

1. Core owns logical range meaning and durable anchor rebasing.
2. React owns subscription breadth, projection indexing, and mounted-slice
   delivery.
3. DOM bridge owns offset mapping, clipboard truth, and selection fidelity.
4. Invalidation is explicit:
   - node dirtying
   - source refresh
   - annotation mutation
   - optional full refresh
5. The active editing corridor stays urgent and non-suspending.
6. Huge-doc posture is corridor-first and occlusion-first, not chunk-first.
7. Legacy `decorate` does not define the target architecture.
   A clean break is preferred unless real adoption pain later justifies an
   out-of-core shim.
8. `Bookmark` is the preferred public durable-anchor noun.
   `RangeRef` is lower-level runtime machinery, not an equal peer in the target
   API.
9. Overlapping payloads must remain representable. No flatten-to-one-winner leaf
   hack.
10. Comments / cursors / review threads do not get forced through decoration-only
   semantics.
11. Any RC claim must be backed by benchmark and browser proof on the final
    lanes, not just local contract tests.
12. There is no public bookmark registry unless a real external use case proves
    it earns its weight.
13. There is no first-class public compatibility adapter in `slate-react`.
14. Docs and examples do not teach `RangeRef` first once `Bookmark` exists.
15. `WidgetPlacement` may exist internally before it exists publicly.
    Do not export it early just because the runtime needs geometry.
16. Public annotation integration is store/controller based, not render-time
    array replacement.
17. Decoration sources are not forced through one `derive(snapshot)` callback
    shape.
18. Generic widget registration does not need to be an early public API.
    Keep it internal unless real external cases prove it earns the surface.
19. `slate-react` may mirror and index annotation data without owning
    canonical thread/comment metadata.
20. Public widget anchors do not use Slate path addresses.
    For live node-local UI, prefer node runtime identity.
21. A field-best perf claim requires source-scoped invalidation below React.
    Local React subscriptions alone are not enough.
22. Unknown source dirtiness must fall back to full refresh instead of producing
    stale overlays.

## Design lock deliverables

Before broad implementation, land these design artifacts:

1. explicit overlay architecture section in
   [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
2. this execution plan
3. roadmap blocker entry in
   [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
4. blocker entry in
   [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)

## ADR

### Decision

Adopt a three-lane overlay architecture:

- `Decoration`
- `Annotation`
- `Widget`

with one editor-scoped canonical overlay kernel in `slate-react`.

### Drivers

- old `decorate` ambiguity mixed transient overlays, durable anchors, and
  anchored UI into one unstable callback
- the stronger RC claim needs an honest replacement story for comments,
  cursors, diagnostics, review UI, and huge-doc overlay scale
- React 19.2 and the current projection proof both favor explicit external
  stores with narrow subscriptions over context churn and callback identity
  hacks
- the public API should not force users to choose between two nearly identical
  durable-anchor nouns

### Alternatives considered

1. one smarter generalized decoration system
2. core-owned annotations plus thin React rendering
3. hook-first public architecture with stores emerging later
4. public `RangeRef` and `Bookmark` as equal public anchor choices

### Why rejected

1. one smarter generalized decoration system
   - keeps transient and durable semantics blurred
   - likely recreates async/browser drift under better branding
2. core-owned annotations plus thin React rendering
   - puts workflow/UI state in the wrong layer
   - bloats core with author/thread/review concerns
3. hook-first public architecture
   - makes component lifecycle the de facto registry
   - risks duplicated state, SSR/offscreen weirdness, and fake locality
4. equal public `RangeRef` + `Bookmark`
   - makes the durable-anchor story muddy
   - preserves runtime leakage in the public API

### Consequences

- more nouns now
- cleaner boundaries later
- explicit migration work because the clean target no longer hides behind a
  first-class compatibility lane
- stronger proof burden before RC closure

## Program success criteria

This plan is successful only if all of these become true at the same time:

1. the public overlay nouns are stable enough to document without apology
2. the current projection proof grows into a real shared runtime, not another
   local experiment
3. comments / cursors / review anchors stop piggybacking on decoration-only
   semantics
4. the DOM bridge stays honest under split leaves, overlays, copy/paste, and
   IME churn
5. huge-doc overlay behavior is benchmarked on the real current lanes
6. the site examples demonstrate the final architecture on user-facing surfaces
7. the RC blocker docs can replace the old mixed-row wording with the new truth

If even one of those is missing, the architecture is still not RC-grade.

## Execution reality after Waves 0-4

The earlier planning draft overestimated how much greenfield work still
remained in Waves 2 and 4.

What is already true now:

1. [`search-highlighting.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx),
   [`code-highlighting.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx),
   and
   [`highlighted-text.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx)
   are running on the explicit decoration-source model.
2. [`persistent-annotation-anchors.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/persistent-annotation-anchors.tsx),
   [`mentions.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx),
   and
   [`hovering-toolbar.tsx`](/Users/zbeyens/git/slate-v2/site/examples/ts/hovering-toolbar.tsx)
   already have package/browser proof against the explicit annotation/widget
   lane.
3. `slate-react` already ships explicit:
   - decoration sources
   - annotation stores
   - widget stores
   - annotation/widget layers

The architecture direction held up.
The execution reality was simply less blank than the first plan assumed.

## Remaining unfinished surfaces

No remaining unfinished surfaces exist inside this lane.

Cross-program follow-ups after completion:

1. exhaustive API/public-surface contract-width audit
2. post-RC browser/input external-evidence rows

## Strategic decisions to freeze now

These should stop being “open questions” unless implementation proves them
wrong.

### 0. Canonical overlay kernel

Freeze this now:

- there is exactly one editor-scoped headless overlay kernel in `slate-react`
- that kernel is the canonical registry/runtime for:
  - decoration sources
  - annotation mirrors/indexes
  - internal widget placement/runtime
  - projection indexing
  - refresh versioning
- hooks are bindings over that kernel
- mounted React trees are consumers, not the source of truth

Harsh take:

If this is not frozen now, implementation will drift into hook soup and
duplicated state.

### 1. Core vs React ownership

Freeze this split:

- `slate`
  - logical ranges
  - projection math
  - bookmark semantics
  - lower-level range-ref rebasing machinery
- `slate-react`
  - one editor-scoped overlay kernel
  - source registration
  - indexing
  - subscriptions
  - annotation mirrors/indexes
  - widget placement/runtime
- `slate-dom`
  - DOM mapping
  - clipboard
  - selection fidelity

Harsh take:

Putting canonical annotation metadata in core is the wrong abstraction.
Core should not own thread metadata, author data, hover state, or review UI.

### 2. Annotation store location

Freeze the recommendation:

- annotation anchors ride core `Bookmark` handles
- the overlay kernel may keep a normalized mirror/index in `slate-react`
- canonical annotation metadata may stay in app-owned, collab-owned, or
  service-owned stores
- internal range-ref reuse is allowed but not the public story
- no public bookmark registry is planned in the target architecture
  unless a real external use case proves it is worth the cost

Reason:

- durable anchor semantics belong in core
- workflow and UI-facing metadata should not be forcibly re-homed into the
  editor runtime
- users should not have to choose between two near-duplicate anchor APIs
- serious systems split anchors from thread/comment stores instead of treating
  the editor runtime as the only place state may live

### 3. Widget anchoring model

Freeze the recommendation:

- widgets should anchor by annotation id, node runtime id, or current
  selection handle
- public widget anchors should not use Slate path addresses
- if an app has its own durable block ids, adapt them at the edge instead of
  baking Slate path addresses into the shared public API
- widgets should **not** anchor by raw DOM node identity
- widget geometry is its own derived lane:
  - `WidgetAnchor` is logical and stable
  - `WidgetPlacement` is ephemeral, DOM-facing, and viewport-relative
- `WidgetPlacement` does not need to be an early public API if internal
  placement plumbing is enough for the first honest examples
- generic widget registration does not need to be an early public API either
  if annotation/selection-driven React surfaces cover the first real cases

Reason:

- path is a mutable tree address, not a stable overlay anchor contract
- Slate v2 already has runtime identity that survives structural edits better
  than path
- DOM-node anchoring is brittle under rerender, remount, and offscreen work
- logical anchoring without explicit placement is only half a design

### 4. Decoration source shape

Freeze the recommendation:

- do not force every decoration source into one
  `derive(snapshot): readonly Decoration[]` callback contract
- support at least two honest source modes:
  - derived sources that compute from editor snapshots
  - external/indexed sources that already own decoration results and only need
    subscription plus refresh/invalidation
- a pure derive callback may exist as a convenience wrapper
- it is not the only serious source shape

Reason:

- ProseMirror-style decoration systems are persistent mapped data structures,
  not just callbacks
- VS Code-style decoration systems replace sets by channel/type
- real products often already have indexed search/highlight/review data and do
  not benefit from re-wrapping all of it as a derive callback

### 5. Source invalidation API

Freeze the recommendation:

- no implicit “stable callback means maybe recompute”
- source refresh must be explicit
- refresh scope must be expressible

Minimum target:

- source id
- scope
  - `all`
  - `paths`
  - `runtimeIds`
  - `selection`
- mode
  - `sync`
  - `deferred`
- generation / version token

Refresh semantics must also freeze:

- refresh requests with the same source id and generation coalesce
- source versions are monotonic
- a refresh may be refused or deferred during active composition if the lane is
  not composition-safe
- urgent visible-caret lanes fail closed toward stale data rather than breaking
  selection/IME truth
- non-urgent lanes may retry later through deferred work

### 6. Example migration order

Freeze this order:

1. `search-highlighting`
2. `code-highlighting`
3. `highlighted-text`
4. `persistent-annotation-anchors`
5. `hovering-toolbar`
6. `mentions`
7. `huge-document`

Reason:

- start with transient text slices
- then durable anchors
- then selection-driven / anchored chrome
- then scale proof

## Target API lock

These are the locked starting contracts for implementation.

If implementation wants to change them later, it needs:

- proof
- research-layer update
- plan update

```ts
type OverlayKernel = {
  connectDecorationSource(source: DecorationSourceAdapter): () => void;
  connectAnnotationStore(store: AnnotationStoreAdapter): () => void;
  refresh(request: DecorationRefresh): void;
  getProjectionSnapshot(): ProjectionSnapshot;
  getAnnotationSnapshot(): AnnotationSnapshot;
  subscribe(listener: () => void): () => void;
  destroy(): void;
};

type DecorationSourceAdapter =
  | {
      id: string;
      kind: 'derived';
      derive(snapshot: EditorSnapshot): readonly Decoration[];
      invalidate?: DecorationInvalidationPolicy;
    }
  | {
      id: string;
      kind: 'external';
      getSnapshot(): readonly Decoration[];
      subscribe(listener: () => void): () => void;
    };

type DecorationRefresh = {
  sourceId: string;
  generation: number;
  scope: 'all' | 'paths' | 'runtimeIds' | 'selection';
  mode?: 'sync' | 'deferred';
  paths?: Path[];
  runtimeIds?: RuntimeId[];
};

type Annotation = {
  id: string;
  anchor: AnnotationAnchor;
  kind: string;
  data?: unknown;
};

type AnnotationAnchor = { type: 'bookmark'; bookmark: Bookmark };

type AnnotationStoreSnapshot = {
  byId: ReadonlyMap<string, Annotation>;
  allIds: readonly string[];
};

type AnnotationStoreAdapter = {
  getSnapshot(): AnnotationStoreSnapshot;
  subscribe(listener: () => void): () => void;
};

type WidgetAnchor =
  | { type: 'annotation'; annotationId: string }
  | { type: 'node'; runtimeId: RuntimeId }
  | { type: 'selection' };

type WidgetPlacement = {
  widgetId: string;
  anchor: WidgetAnchor;
  rects: readonly DOMRect[];
  strategy: 'inline' | 'floating' | 'block';
};
```

Minimum React bindings:

- `useSlateDerivedDecorations(...)`
- `useSlateDecorationSet(...)`
- `useSlateAnnotationStore(...)`

Public-surface rule:

- do not ship `useSlateWidgetPlacement(...)` or a public `WidgetPlacement`
  export in the first wave unless a real external consumer proves the internal
  placement layer is insufficient
- do not make `useSlateAnnotations([...])` or `useSlateWidgets([...])` the
  flagship API if that only recreates array-replacement churn under nicer names
- do not ship public path-based widget anchors in the flagship API

## Proof matrix

Every wave needs all three proof classes when relevant:

1. package contract tests
2. browser/example proof
3. benchmark or rerender proof

### Wave proof expectations

#### Wave 1

- status:
  - complete
- contract:
  - `range-ref-contract.ts`
  - `bookmark-contract.ts`
- browser:
  - none required yet
- benchmark:
  - none required yet

#### Wave 2

- status:
  - complete
  - landed as proof hardening over an already-stronger-than-expected runtime
    substrate
- contract:
  - `projections-and-selection-contract.tsx`
  - `annotation-store-contract.tsx`
  - `widget-layer-contract.tsx`
- browser:
  - keep `persistent-annotation-anchors.test.ts`
- benchmark:
  - deferred to Wave 6 perf closure

#### Wave 3

- status:
  - complete
- contract:
  - projection/runtime source tests
- browser:
  - `search-highlighting.test.ts`
  - `code-highlighting.test.ts`
  - `highlighted-text.test.ts`
- benchmark:
  - deferred to Wave 6 perf closure

#### Wave 4

- status:
  - complete
  - landed as annotation/widget contract completion over existing package code
- contract:
  - annotation entity / widget anchoring tests
- browser:
  - `persistent-annotation-anchors.test.ts`
  - `mentions.test.ts`
  - `hovering-toolbar.test.ts`
  - comment-thread and review-suggestion browser rows deferred unless the
    program widens beyond the current batch
- benchmark:
  - deferred to Wave 6 perf closure

#### Wave 5

- contract:
  - `packages/slate-dom/test/bridge.ts`
- browser:
  - `mark-placeholder.test.ts`
  - `placeholder-ime.test.ts`
  - any new overlay-specific clipboard / selection proof rows
- benchmark:
  - none primary; this is correctness-owned

#### Wave 6

- contract:
  - none primary
- browser:
  - `huge-document` runtime surface proof
- benchmark:
  - keep:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`

## Performance guardrails

These are not optional.

### Guardrail 1. No global rerender by overlay churn

Changing:

- one search query
- one code-block language
- one annotation entity
- one remote cursor

must not trigger broad unrelated subtree rerenders in the isolated runtime
benchmark.

### Guardrail 2. No regression on current blocker-facing lanes

The rewrite must not reopen already-green blocker-facing lanes in:

- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

That means, at minimum:

- placeholder stays green enough
- richtext stays green enough
- huge-document stays green enough
- huge-document history stays green enough

### Guardrail 3. Overlay benchmarks must compare architecture choices, not vibes

Every new overlay benchmark must compare:

- baseline current proof path
- new architecture path
- worst-case broad invalidation path when relevant

If the lane cannot distinguish those, the benchmark is useless.

### Guardrail 4. Sidebars and hidden panes may lag; the editing corridor may not

Transitions and deferred work may touch:

- thread sidebars
- diagnostics panels
- review lists
- hidden or backgrounded panes

They may **not** own:

- live input
- caret
- DOM selection sync
- visible inline overlay truth at the caret

## Execution posture

This work should be run as an architecture-first execution program, not as a
string of isolated bug fixes.

Rules:

- every wave must land proof before downstream expansion
- every new public noun needs exact source ownership and example ownership
- no perf claim without a named benchmark lane
- no browser-safety claim without a named browser proof lane
- no migration claim without explicit break and migration docs

Preferred execution posture:

1. contract test first when the seam is already clear
2. thin implementation
3. example adoption
4. benchmark / browser proof
5. doc truth sync

Do not do giant blind rewrites and “see what breaks”.

## Site example program

The site example program is part of the architecture, not demo fluff.

Every lane below should end with one example that is canonical for the final
 public story:

### Canonical examples

1. `search-highlighting`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx)
   - proves transient explicit-refresh decoration sources
2. `code-highlighting`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx)
   - proves structural decoration derivation plus local invalidation
3. `highlighted-text`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx)
   - proves overlap-friendly text projection and split-leaf rendering
4. `persistent-annotation-anchors`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/persistent-annotation-anchors.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/persistent-annotation-anchors.tsx)
   - proves durable anchors
5. `hovering-toolbar`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/hovering-toolbar.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/hovering-toolbar.tsx)
   - proves selection-driven widget behavior
6. `mentions`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/mentions.tsx)
   - proves anchored widget behavior without text-lane abuse
7. `huge-document`
   - [/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx)
   - proves corridor-first scale behavior

### Example hard rules

- each canonical example must map to one primary architecture lane
- no example should rely on the legacy `decorate` API once its replacement lane
  lands
- `persistent-annotation-anchors` is the canonical durable-anchor example

### Per-example anti-cheat exits

- `search-highlighting`
  - no `ref`-based query smuggling as the primary API story
  - no example-local manual refresh wiring beyond the final public refresh API
- `code-highlighting`
  - no `Editor.replace(...)` cheat for language-change invalidation
  - language and structural changes must drive the final refresh semantics
- `highlighted-text`
  - overlap payloads stay multiplicity-safe
  - no flatten-to-one-style shortcut
- `persistent-annotation-anchors`
  - one durable annotation entity drives the shown inline projection
  - no fake proof-only local array outside the final store shape
- `hovering-toolbar`
  - no raw DOM selection rectangle as the primary anchoring truth
  - geometry must derive from final widget placement semantics
- `mentions`
  - mention UI uses the widget lane explicitly
  - no hidden ad hoc special-case pipeline
- `huge-document`
  - uses the final overlay invalidation model
  - does not reintroduce broad whole-doc overlay recompute by accident

## Benchmark program

The benchmark program is not optional. This architecture is partly about
scaling and invalidation, so benchmark truth is part of the contract.

### Existing lanes to keep

- `pnpm bench:react:rerender-breadth:local`
- `pnpm bench:react:huge-document-overlays:local`

### Remaining lanes to add for Wave 6 / RC perf closure

1. `bench:replacement:search-highlighting:local`
   - compare current vs legacy on broad search highlight toggles
   - decision unlocked: explicit-refresh decoration-source churn cost
2. `bench:replacement:code-highlighting:local`
   - compare current vs legacy on syntax-highlight refresh after structure or
     language changes
   - decision unlocked: local invalidation vs full-source refresh cost
3. `bench:replacement:annotations:local`
   - durable anchors plus anchored widget on representative review data
   - decision unlocked: annotation store cost under edit churn
4. `bench:react:overlay-subscriptions:local`
   - isolate runtime-id subscription breadth for decorations, annotations, and
     widgets
   - decision unlocked: whether the store shape is truly local
5. conditional widening lane:
   `bench:replacement:review-suggestions:local`
   - suggestion+thread mixed UX lane
   - only required if review-suggestions becomes an in-scope RC surface

### Benchmark ownership files

- existing:
  - [/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx)
  - [/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx)
  - [/Users/zbeyens/git/slate-v2/scripts/benchmarks/shared/react-benchmark.tsx](/Users/zbeyens/git/slate-v2/scripts/benchmarks/shared/react-benchmark.tsx)
- proposed new:
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/search-highlighting.mjs`
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/code-highlighting.mjs`
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/annotations.mjs`
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/overlay-subscriptions.tsx`
- conditional widening:
  - `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/replacement/review-suggestions.mjs`

### Benchmark hard rules

- one lane = one decision
- benchmark artifacts must live in `tmp/` with stable names
- benchmark docs must update:
  - [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)
  - [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- no lane gets added unless its pass/fail result can actually change the RC
  blocker story

### Benchmark artifact schema

Every new overlay lane should write at least:

- `lane`
- `iterations`
- `current`
- `legacy` or `baseline`
- `meanMs`
- `medianMs`
- `maxMs`
- `minMs`
- `samples`
- any lane-specific counters:
  - rerender counts
  - annotation churn counts
  - widget placement counts
  - affected runtime ids

### Benchmark verdict thresholds

These are default thresholds unless a lane owner justifies stricter ones.

- `bench:react:overlay-subscriptions:local`
  - pass if unrelated runtime-id rerender breadth is unchanged or lower than
    the current proof path
- `bench:replacement:search-highlighting:local`
  - pass if visible input / toggle latency stays within current blocker-facing
    richtext expectations and unrelated subtree churn stays local
- `bench:replacement:code-highlighting:local`
  - pass if language / structure refresh does not exceed current richtext lane
    expectations by a material amount and local invalidation beats worst-case
    broad refresh
- `bench:replacement:annotations:local`
  - pass if annotation churn stays local and does not reopen huge-document or
    rerender-breadth blocker lanes
- `bench:replacement:review-suggestions:local`
  - pass if combined annotation+widget review UI does not reopen current
    blocker-facing richtext or huge-document lanes

If a lane cannot be judged against one of:

- current proof path
- legacy path
- worst-case broad invalidation path

then the lane is underspecified and should not be used in verdict language.

## Implementation waves

## Wave 0. Architecture lock and public nouns

Status:

- complete

Goal:

- stop hand-waving and freeze the public vocabulary before code spreads

Files:

- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
- [decorations-annotations-cluster.md](/Users/zbeyens/git/plate-2/docs/slate-v2/decorations-annotations-cluster.md)
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts`

Required decisions:

- final meanings of:
  - `decoration`
  - `annotation`
  - `widget`
  - `projection store`
  - `source`
  - `refresh`
- how aggressively public docs and examples demote `RangeRef` once `Bookmark`
  owns durable anchors
- whether annotation storage is editor-owned core runtime state or a dedicated
  `slate-react` store with core anchor handles

Exit:

- the architecture contract says who owns what without ambiguity
- `Bookmark` is frozen as the durable public anchor noun
- `RangeRef` is frozen as lower-level runtime machinery, not the preferred
  public story
- exported names in `slate-react/src/index.ts` match the chosen nouns
- the canonical example matrix and benchmark matrix are frozen

## Wave 1. Core durable-anchor substrate

Status:

- complete

Goal:

- make `Bookmark` the first-class public durable-anchor noun instead of
  exposing raw live-ref semantics as the public answer

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/range-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/range-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/range-ref-transform.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/range-projection.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range-ref.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/range-refs.ts`
- landed files:
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/bookmark.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/bookmark.ts`

Tests:

- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- `/Users/zbeyens/git/slate-v2/packages/slate/test/bookmark-contract.ts`

Required scenarios:

- durable anchor survives text ops, node ops, and normalization
- bookmark maps without mounted DOM
- bookmark resolves back to a sane range or explicit null/fallback
- inward default remains correct for annotation-style anchors
- detached or deleted anchors fail closed instead of drifting silently
- public durable-anchor semantics are `Bookmark`-first, not `RangeRef`-first

Exit:

- annotation durability no longer depends on live mounted React state
- `Bookmark` contract is explicit and browser-independent
- `RangeRef` remains lower-level runtime machinery instead of becoming the main
  public annotation anchor story

## Wave 2. Projection runtime generalization

Status:

- complete
- the codebase already held more of this substrate than the earliest planning
  pass assumed
- the real delivered delta was projection-runtime proof hardening, especially
  around nested rich-inline runtime-id behavior

Goal:

- evolve the existing projection proof into the actual shared overlay runtime

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-context.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-projections.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-range-ref-projection-store.tsx`
- related files that were already stronger than initially assumed:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/widget-store.ts`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-widgets.tsx`

Tests:

- [projections-and-selection-contract.tsx](/Users/zbeyens/git/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx)
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/widget-layer-contract.tsx`

Required scenarios:

- `useSyncExternalStore` snapshots are cached and immutable
- unchanged runtime ids do not rerender
- explicit refresh can invalidate chosen scopes without global churn
- selection-derived projections and durable-anchor projections can coexist
- widget entries do not force text-leaf rerenders

Exit:

- one shared runtime can serve decorations, annotations, and widgets
- mounted consumers subscribe by runtime id or explicit higher-level key
- the runtime supports the site example program without example-local store
  hacks
- completed via proof hardening instead of a greenfield kernel rewrite

## Wave 3. Decoration source API

Status:

- complete

Goal:

- replace callback ambiguity with explicit decoration-source registration and
  refresh semantics

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/decoration-sources.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-decoration-sources.tsx`

Example owners:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/search-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/code-highlighting.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/highlighted-text.tsx`

Tests:

- [search-highlighting.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/search-highlighting.test.ts)
- [code-highlighting.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/code-highlighting.test.ts)
- [highlighted-text.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/highlighted-text.test.ts)
- existing local logic tests already tied to redecorate semantics:
  - [2026-03-26-code-block-language-change-must-trigger-redecorate.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-03-26-code-block-language-change-must-trigger-redecorate.md)
  - [2026-03-27-code-block-format-must-rebuild-code-lines.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-03-27-code-block-format-must-rebuild-code-lines.md)

Required scenarios:

- overlapping decoration payloads preserve multiplicity
- cross-node highlight sources do not require manual leaf fan-out
- explicit external-state refresh works without callback-identity hacks
- code-block language / formatting changes hit the right refresh seam
- source-level invalidation can stay local

Exit:

- decoration derivation is explicit and overlap-safe
- legacy `decorate` is no longer the preferred mental model
- `search-highlighting`, `code-highlighting`, and `highlighted-text` are all
  running on the final source model

## Wave 4. Annotation store and widget layer

Status:

- complete
- the implementation existed in-package before this execution pass
- the real delivered delta was contract/browser proof completion

Goal:

- make comment anchors, remote cursors, review threads, and anchored chrome
  first-class instead of piggybacking on decoration slices

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/widget-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-widget-layer.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-annotation-layer.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/widget-layer-contract.tsx`

Browser/example proof:

- [persistent-annotation-anchors.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/persistent-annotation-anchors.test.ts)
- [mentions.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/mentions.test.ts)
- [hovering-toolbar.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/hovering-toolbar.test.ts)
- remaining optional follow-up browser lanes if the program widens beyond the
  current batch:
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/comment-thread-anchors.test.ts`
  - `/Users/zbeyens/git/slate-v2/playwright/integration/examples/review-suggestions.test.ts`

Required scenarios:

- annotation ids survive edits and remap correctly
- widget UI can anchor to annotations without text rerender churn
- overlapping comments remain representable
- review suggestions can render as annotations or mixed annotation+widget UX
  without relying on ProseMirror-style non-overlap limits
- remote cursor labels do not live inside the text-leaf rendering lane

Exit:

- comments, cursors, and review UI have an explicit home
- text decorations are no longer expected to carry workflow identity
- `persistent-annotation-anchors`, `mentions`, and `hovering-toolbar` are all
  reconciled against the final architecture
- one annotation entity can drive:
  - inline overlay state
  - floating widget UI
  - sidebar/panel state
  from one canonical store with no duplicated registration state
- completed as a proof-and-example hardening wave, not a first implementation wave

## Wave 5. DOM bridge and clipboard hardening

Status:

- next batch

Goal:

- guarantee that the new overlay system does not corrupt browser truth

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/bridge.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/clipboard.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts`

Tests:

- [bridge.ts](/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts)
- [mark-placeholder.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/mark-placeholder.test.ts)
- [placeholder-ime.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/placeholder-ime.test.ts)

Required scenarios:

- cumulative offset mapping across split leaves
- clipboard payload strips render-only wrappers
- selected-text helpers strip FEFF / zero-width sentinels
- urgent selection sync stays correct around overlay updates
- IME composition around overlay churn remains stable

Exit:

- overlay rendering no longer threatens bridge truth

## Wave 6. Huge-doc and React 19.2 scheduling posture

Goal:

- make the overlay architecture scale before any virtualization fantasy

Primary files:

- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/shared/react-benchmark.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`

React runtime rules to enforce:

- active editor lane stays urgent
- no transitions around live text input, caret, selection, or immediate
  visible overlay truth
- transitions allowed for sidebars, offscreen reindexing, non-visible page
  recomposition, diagnostics panes
- `Activity` only for hidden panes/page surfaces, never as a substitute for
  the live editing corridor

Required scenarios:

- toggling large search/decor sources does not melt whole-doc rerender breadth
- annotation sidebars can lag safely without affecting input
- hidden panels preserve UI state without keeping expensive subscriptions alive
- large-doc overlay recompute is corridor/region scoped

Exit:

- benchmark lanes are frozen and believable
- React 19.2 posture is explicit in code and docs
- the huge-document example uses the final overlay invalidation model instead of
  hidden old assumptions

## Wave 7. Breaking migration truth

Goal:

- preserve a clean target architecture while making the break explicit and
  survivable

Primary files:

- likely touched:
  - `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/editable.md`
  - `/Users/zbeyens/git/slate-v2/docs/libraries/slate-react/slate.md`
  - `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md`

Required scenarios:

- docs state the break plainly
- docs show how old `decorate` use cases map onto:
  - decoration sources
  - annotations
  - widgets
- docs show that durable public anchors are `Bookmark`-first
- docs demote `RangeRef` to lower-level runtime machinery unless callers
  explicitly need that seam
- docs and examples do not teach `RangeRef` first once `Bookmark` exists
- docs show both honest decoration-source lanes:
  - derived
  - externally-owned/indexed
- docs do not teach array-registration hooks as the main annotation model
- explicit refresh exists for external-state callers in the new API
- exact old chunking-era redecorate semantics remain cut unless directly chosen
  and proved

Exit:

- migration story is honest
- architecture docs do not keep teaching the old callback as the primary model
- there is no first-class public compatibility adapter in the main target
  architecture
- there is no equal-peer public `RangeRef` story fighting `Bookmark`
- there is no public bookmark registry unless a real use case later forces it
- there is no early public `WidgetPlacement` API without proof it earns its keep
- there is no early public array-registration annotation API without proof it
  earns its keep
- there is no single-callback decoration-source monopoly in the public API

## Wave 8. RC reconciliation

Goal:

- sync the blocker docs only after architecture, proof, and benchmark truth are
  real

Files:

- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/replacement-family-ledger.md)
- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

Exit:

- the mixed `decorations.spec.tsx` row is gone or explicitly reclassified under
  the final architecture
- the RC blocker docs say the same thing about overlays
- no release doc still hides behind “projection-local is mirrored; broader
  decorate is explicit skip” if the final system chose a different contract

## Wave 9. Core change metadata and touched runtime-id publication

Status:

- pending
- active next step
- field-best decoration perf tranche

Goal:

- make overlay invalidation start from committed operation metadata instead of
  forcing overlay stores to infer every dirty region from a whole snapshot

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/apply.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/transaction-helpers.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/get-dirty-paths.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/range-projection.ts`

Required model:

- editor snapshot listeners can optionally receive a lightweight change record
- that change record names:
  - operations
  - dirty paths
  - touched runtime ids when known
  - replace epoch
  - operation class:
    - text
    - selection
    - mark
    - structural
    - replace
- collapsed `insert_text` / `remove_text` fast paths publish the touched text
  runtime id without rebuilding the snapshot index
- structural operations may publish broader dirty regions first, then narrow as
  proof justifies it

Required tests:

- fast text insert publishes one touched runtime id
- remove text publishes one touched runtime id
- selection-only operations publish selection dirtiness without text dirtiness
- `Editor.replace(...)` publishes a replace-level broad invalidation
- subscribers that ignore change metadata keep working

Exit:

- overlay stores can decide whether a committed change is relevant without
  re-deriving source data blindly
- old `Editor.subscribe(editor, listener)` behavior remains source-compatible
- no public API leaks draft internals

## Wave 10. Source dirtiness declarations

Status:

- pending
- active next step after Wave 9
- field-best decoration perf tranche

Goal:

- let decoration, annotation, and widget sources declare what can dirty them
  instead of treating every editor commit as equally relevant

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/decoration-sources.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/annotation-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/widget-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-decoration-sources.tsx`

Required source classes:

- `always`
  - safest fallback
- `selection`
  - selection-derived overlays and selection widgets
- `text`
  - text-path-derived decorations such as search and syntax highlights
- `node`
  - node or element metadata overlays
- `annotation`
  - bookmark-backed durable anchors
- `external`
  - app-owned stores that refresh through `subscribe(...)`,
    `refreshSource(...)`, or `refreshAll()`
- `custom`
  - predicate over the change record for advanced callers

API posture:

- dirtiness declarations can remain optional at first
- absence of a declaration means full refresh
- declarations must be stable enough that a wrong declaration cannot silently
  stale visible overlays in common cases
- external sources still own explicit refresh

Required tests:

- search-highlight source ignores selection-only changes
- selection widget ignores unrelated text changes
- annotation store updates when bookmark range rebases
- external source updates on its subscription without editor changes
- wrong or missing dirtiness declaration falls back to full refresh

Exit:

- source-level invalidation is explicit and test-backed
- public docs can teach source dirtiness without making it mandatory for simple
  examples
- examples stay simple unless they are specifically demonstrating advanced
  invalidation

## Wave 11. Indexed / child-scoped projection recompute

Status:

- pending
- active next step after Wave 10
- field-best decoration perf tranche

Goal:

- stop projection recompute from walking every text entry for every projection
  when a narrower source region is known

Primary files:

- `/Users/zbeyens/git/slate-v2/packages/slate/src/range-projection.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/projection-store.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/decoration-sources.ts`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`

Research pressure:

- ProseMirror:
  child-scoped mapped decoration propagation
- Lexical:
  dirty leaf / dirty element reconcile before render
- VS Code:
  view-model and typed decoration/comment/widget channels
- React 19.2:
  excellent consumer-side subscriptions, but not a replacement for this layer

Required implementation direction:

- maintain projection buckets by source id and runtime id
- preserve previous runtime-id slices when neither the source nor the runtime id
  is dirty
- add a path/range index that lets `Editor.projectRange(...)` avoid collecting
  every text entry when the projected range is local
- keep full traversal as fallback for cross-document, unknown, or broad ranges
- count recomputed source ids and runtime ids in benchmark artifacts

Required tests:

- one text edit only recomputes the relevant local projection source
- unrelated runtime ids preserve slice identity
- cross-node projections still split correctly
- broad/unknown source invalidation still refreshes safely
- deleted anchors fail closed

Required benchmark additions:

- extend `pnpm bench:react:rerender-breadth:local` with recompute counters:
  - source ids recomputed
  - runtime ids touched
  - runtime ids with changed slice identity
- extend `pnpm bench:react:huge-document-overlays:local` with:
  - overlay-source recompute count
  - annotation-source recompute count
  - widget recompute count
  - type-after-local-overlay-edit
- optional:
  add a focused source-scoped benchmark if the reused lanes cannot expose the
  result cleanly

Exit:

- local overlay changes have local recompute cost, not just local React render
  cost
- field-best perf claim is at least theoretically defensible against the direct
  candidate set
- docs distinguish:
  - subscription locality
  - source invalidation locality
  - projection recompute locality

## Sequencing

Strict order:

1. Wave 0 architecture lock
2. Wave 1 durable-anchor substrate
3. Wave 2 projection runtime generalization
4. Wave 3 decoration source API
5. Wave 4 annotation + widget layers
6. Wave 5 bridge hardening
7. Wave 6 huge-doc + React scheduling proof
8. Wave 7 breaking migration truth
9. Wave 8 RC reconciliation
10. Wave 9 core change metadata and touched runtime-id publication
11. Wave 10 source dirtiness declarations
12. Wave 11 indexed / child-scoped projection recompute

Reason:

- without Wave 0, later code will invent conflicting nouns
- without Wave 1, annotations remain fake
- without Wave 2, later APIs have no stable substrate
- without Wave 5, perf wins can still rot browser truth
- without Wave 6, the architecture is not RC-worthy for scale claims
- without Wave 9, React stores cannot know what changed cheaply
- without Wave 10, all sources look equally dirty
- without Wave 11, local subscriptions can hide broad projection recompute cost

## Inter-wave stop gates

Do not proceed past these gates:

1. do not start Wave 3 until Wave 2 proves:
   - one canonical overlay kernel exists
   - snapshots are cached and immutable
   - local subscriptions are real
2. do not start Wave 4 until Wave 3 proves:
   - decoration multiplicity survives overlap
   - explicit refresh semantics replace callback ambiguity
3. do not start Wave 6 until Wave 5 proves:
   - browser truth survives overlay churn
   - selection / clipboard / IME seams stay honest
4. do not start Wave 7 until Wave 6 freezes:
   - benchmark baselines
   - pass/fail thresholds
   - artifact schema
5. do not start Wave 8 until Waves 1 through 7 have matching:
   - docs
   - examples
   - proof lanes
   - benchmark lanes

## Explicit non-goals

- do not port all of ProseMirror's decoration engine
- do not imitate Lexical node ontology
- do not drag page-layout composition into the normal editing hot path
- do not reopen chunking as a foundational runtime answer
- do not make React the core engine ontology

## Research closure

Broad research is closed.

Design and prototype now.

Reopen research only if one of these fails:

- bookmark/range-ref durability model contradicts needed annotation UX
- projection store cannot support widget and text lanes without churn
- huge-doc benchmarks expose a different dominant bottleneck than expected
- bridge/IME proof shows the split still destabilizes browser truth

If none of those happen, this plan stands and more repo archaeology is
wheel-spinning.

## Risk register

### 1. Durable-anchor abstraction drifts into core bloat

Risk:

- bookmarks / range refs become a second semi-public runtime world with unclear
  ownership

Mitigation:

- keep the durable-anchor substrate minimal
- expose only the nouns the final API truly needs
- push caching and subscription breadth up into `slate-react`

### 2. Projection runtime becomes a junk drawer

Risk:

- one store starts owning range semantics, widget semantics, and product-level
  workflow state all at once

Mitigation:

- split semantics from indexing
- split text slices from widget entries
- keep workflow metadata in annotation stores, not in generic projection
  slices

### 3. Perf work cheats with stale browser truth

Risk:

- rerender breadth improves but selection, IME, or clipboard semantics rot

Mitigation:

- Wave 5 stays mandatory before any RC close-out
- browser proof remains a hard gate

### 4. Huge-doc strategy regresses into chunking cosplay

Risk:

- implementation quietly falls back to child bucketing or broad hidden rerender

Mitigation:

- benchmark the corridor/islands lanes directly
- reject any “fix” that wins only by reviving the old chunk story

### 5. Compatibility lane poisons the final docs

Risk:

- the repo lands a good new architecture but still teaches `decorate` first

Mitigation:

- docs must describe the break and the migration path plainly instead of
  smuggling compatibility promises into the target architecture

## Rollback rules

If a wave lands and later proves wrong:

1. revert the public nouns first
2. keep the benchmark lane and failing proof
3. reopen only the contradicted design seam
4. do not keep half-landed architecture language in docs

Specific rollback triggers:

- annotation durability fails under normalization or multi-op transactions
- widget lane introduces unavoidable bridge churn
- overlay store snapshots cannot remain cached/immutable
- huge-doc benchmark lanes show global invalidation remains dominant

## Completion state

This plan is complete.

The lane now satisfies the intended acceptance bar:

- the canonical examples run on the final architecture
- the benchmark program owns the blocker-facing overlay lanes
- the browser proof stack stays honest under the final overlay model
- the RC blocker docs no longer describe the overlay system through the old
  mixed-row hedge
- a maintainer can explain decorations, annotations, and widgets without
  hedging
