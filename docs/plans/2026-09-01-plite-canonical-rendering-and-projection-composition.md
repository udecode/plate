# Plite canonical Decoration composition

Objective:
Replace overlapping Plite rendering and projection paths with one
provider-compiled Decoration source contract before Comments begins.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-01-plite-canonical-rendering-and-projection-composition.md

Template:
docs/plans/templates/plite-plan.md

Applied packs:

- package-api
- performance-observability

Mode:

- `deep`: the change breaks Plite React authoring, source/store composition,
  text rendering, static parity, Plate lowering, collaboration, examples,
  docs, and browser proof.

## Decision

Keep `decorate` as a source-owned semantic capability. Delete
`renderSegment`, public generic Projection, per-Editable decoration callbacks,
arbitrary Decoration payloads, and provider props for store families.

One Plite provider compiles ordered Decoration sources. It observes each source
once. Every mounted Editable subscribes to one merged bucket per mounted text
node. Decoration returns keyed, non-empty ranges with data-only attributes.
Widget owns React or DOM at a point. Annotation owns durable logical range
identity.

The prior keyed renderer registry is rejected. It was elaborate machinery for
an invalid public job.

Completion threshold:

This plan is ready for execution when the public contract, owner graph,
deletion cone, consumer adoption, frozen scale receipt, type inference,
execution slices, and production proof gates are unambiguous. Implementation is
complete only when production code passes the same scale receipt, Plite package
proof, browser proof, static/live parity, collaboration proof, stale-string
audit, barrels, changeset, and repository checks.

Verification surface:

- Audit, strict matrices, TypeScript inference, and frozen disposable benchmark
  receipts under `docs/plans/artifacts/rendering-api-editor-audit/`.
- During execution: production manager unit/stress tests, Plite package proof,
  focused Chromium, static/collaboration parity, and the full closure matrix.

Constraints:

- One hard cut with no aliases, fallbacks, advanced bypass, or competing
  renderer.
- Keep raw structural render callbacks only for model-backed React.
- Keep document data, native editing, and serialized values unchanged.

Boundaries:

- This plan owns Plite React Decoration composition and its public cuts.
- The Plate plan owns plugin lowering and Comments adoption.
- This run is planning plus disposable proof; it changes no production API.

Blocked condition:

- Plate and Comments stay blocked until the production Plite manager passes
  the unchanged scale and correctness receipt.

## Scope

In scope:

- `plitejs/react` Decoration declarations, provider manager, text bucket
  subscriptions, attribute wrappers, DOM-sync eligibility, error isolation,
  metrics, public exports, and docs;
- public `Editable.decorate`, dirtiness/scope props, `renderSegment`, projection
  types/hooks/stores, and `Plite.annotationStore`;
- explicit Annotation and Widget store consumers;
- multiple Editables, named roots, virtualization, static rendering, Yjs, and
  Plate lowering;
- all raw Plite examples and tests using the removed paths.

Out of scope:

- implementing Comments UI or choosing a thread backend;
- changing persisted document data;
- adding a Plite plugin framework;
- retaining aliases, shims, deprecations, or a documented advanced bypass.

## Accepted audit input

- Audit report:
  `docs/plans/artifacts/rendering-api-editor-audit/audit-report.md`
- Candidate coverage: 17 references and 85 validator-passing atomic rows at
  `docs/plans/artifacts/rendering-api-editor-audit/matrix-validation-receipt.json`
- Public API receipt:
  `docs/plans/artifacts/rendering-api-editor-audit/api-scorecard.md`
- Inference proof:
  `docs/plans/artifacts/rendering-api-editor-audit/inference-receipt.json`
- Frozen benchmark:
  `docs/plans/artifacts/rendering-api-editor-audit/decoration-manager-benchmark.json`

ProseMirror, Tiptap, and VS Code are the primary Decoration donors. Lexical and
Open UI confirm the component boundary. TanStack DB, urql, and LSP confirm
stable snapshots, cleanup, producer identity, and affected-only updates. Slate
confirms that raw structural render callbacks still belong in a low-level React
substrate.

## Current state

| Responsibility     | Current owner                                                                                                      | Failure                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Source inputs      | `PliteProps.decorationSources` at `packages/plitejs/src/react/components/plite.tsx:235`                            | Provider source list competes with Editable.decorate                   |
| Local decorate     | `EditableProps.decorate`, dirtiness, scope at `packages/plitejs/src/react/components/editable-text-blocks.tsx:672` | One callback is an easier but slower alternate source path             |
| Projection carrier | `PliteProjection`, slices, store at `packages/plitejs/src/react/projection-store.ts:33`                            | Generic public noun duplicates Decoration and leaks private mechanics  |
| Decoration carrier | aliases Projection and accepts arbitrary `data` at `packages/plitejs/src/react/decoration-source.ts:17`            | Transient data can masquerade as model leaf fields or renderer payload |
| Text rendering     | segment split and callback at `packages/plitejs/src/react/components/editable-text.tsx:231` and `:522`             | One global callback runs for every segment and disables DOM text sync  |
| Composition        | composed source reads/subscriptions at `packages/plitejs/src/react/decoration-source.ts:239`                       | Mounted nodes subscribe and read by node times source                  |
| Annotation context | singular provider store at `packages/plitejs/src/react/components/plite.tsx:243`                                   | Each new store family pressures Plite to add another provider prop     |
| Private kernel     | mapped view, stable ids, fault boundary, metrics under `packages/plitejs/src/react/`                               | Valuable implementation is exposed through the wrong public ontology   |

## Canonical public API

```tsx
<Plite
  editor={editor}
  decorations={[
    {
      id: "comments",
      read: ({ entry: [, path] }) =>
        comments.at(path).map(({ id, range }) => ({
          attributes: {
            className: "comment",
            "data-comment-id": id,
          },
          key: id,
          range,
        })),
      observe: ({ refresh }) =>
        comments.subscribe(({ nodeKeys }) => refresh({ nodeKeys })),
    },
  ]}
>
  <Editable />
</Plite>
```

Proposed public types:

```ts
type PliteDecorationAttributes = Readonly<
  {
    className?: string;
    style?: React.CSSProperties;
  } & React.AriaAttributes & {
      [name: `data-${string}`]: boolean | number | string | undefined;
    }
>;

type PliteDecoration = Readonly<{
  attributes: PliteDecorationAttributes;
  key: string;
  range: Range;
}>;

type PliteDecorationSource<E extends Editor = Editor> = Readonly<{
  id: string;
  observe?: (context: {
    editor: E;
    refresh: (input: { nodeKeys: "all" | readonly NodeKey[] }) => void;
  }) => () => void;
  read: (context: {
    editor: E;
    entry: NodeEntry;
  }) => readonly PliteDecoration[];
}>;
```

Contract laws:

- source `id` and Decoration `key` are required and stable;
- duplicate source ids or duplicate keys inside one source fail in development;
- `read` is pure for one snapshot and entry;
- editor commits automatically refresh affected node keys;
- `observe` exists only for external changes and must return cleanup;
- external full refresh is explicit: `refresh({ nodeKeys: 'all' })`;
- invalid ranges are isolated and reported; collapsed ranges are rejected;
- source declaration order, then source result order, defines wrapper order;
- Decoration attributes cannot contain event handlers, children, tag names,
  arbitrary objects, or React components;
- source failures retain the last good source bucket and cannot disable editing
  or unrelated sources;
- static rendering calls `read` and never calls `observe`;
- interaction uses root event delegation plus stable `data-*` identity, or a
  Widget/sibling component when React lifecycle is required.

## Owner and lifetime graph

```text
application or service stores
  └─ observed by one Decoration source each
       └─ Plite provider manager
            ├─ source-keyed buckets and cleanup
            ├─ merged immutable bucket per node key
            └─ mounted Editable node subscriptions
                 └─ generic attribute wrappers

Annotation store ── durable logical ranges and rebasing
Widget store ─────── positioned React/DOM and cleanup
Editable renderers ─ model-backed React structure only
```

One Plite provider shares upstream source subscriptions across its descendant
Editables. Each Editable owns only downstream subscriptions for nodes it
actually mounts. A named-root Plite provider owns its own root-scoped manager.
Two independent editors share nothing.

Annotation and Widget hooks take an explicit store or a feature-owned context.
Plite does not combine arbitrary stores and does not add one provider prop per
store family.

## Decision ledger

| Surface                  | Current                                                      | Target                                               | Owner                 | Adoption                                            | Proof                                 | Risk                               | Verdict           |
| ------------------------ | ------------------------------------------------------------ | ---------------------------------------------------- | --------------------- | --------------------------------------------------- | ------------------------------------- | ---------------------------------- | ----------------- |
| Decoration output        | range plus arbitrary data                                    | key, non-empty range, restricted attributes          | Decoration            | migrate all consumers                               | unit, static, browser                 | attribute order and overlap        | rearchitect, P0   |
| Source declaration       | hooks create runtime stores passed as `decorationSources`    | plain `{ id, read, observe? }` list on Plite         | provider manager      | delete both source hooks and runtime source objects | type and lifecycle contracts          | unstable inline declarations       | rearchitect, P0   |
| Editable decorate        | callback plus dirtiness/scope                                | no local source API                                  | provider manager      | migrate examples to Plite sources                   | stale search and package tests        | caller blast radius                | cut, P0           |
| Segment rendering        | arbitrary React per split segment                            | generic nested attribute wrappers                    | text renderer         | move point/range UI to Widget                       | DOM-sync, IME, selection browser rows | consumers hid component state here | cut, P0           |
| Raw structural renderers | element, leaf, text, void, placeholder                       | same callbacks, model-backed only                    | Editable              | remove projection data from props                   | inference and browser proof           | accidental transient activation    | keep, P0 boundary |
| Generic Projection       | public ranges, slices, stores, hooks                         | private mapped Decoration manager                    | Plite React internals | cut exports and callers                             | export audit and package typecheck    | internal names leak back out       | hide, P1          |
| Source invalidation      | dirtiness classes, scopes, revisions, multiple subscriptions | automatic commit keys plus explicit external refresh | provider manager      | delete public policy menu                           | benchmark and affected-only tests     | global refresh abuse               | merge, P0         |
| Annotation provider      | singular `annotationStore` prop                              | explicit store consumers or feature context          | Annotation            | migrate hooks and Plate proxy                       | multi-store type/React tests          | context ergonomics                 | cut prop, P1      |
| Widget provider          | explicit store APIs plus view context                        | keep explicit store identity                         | Widget                | align with Annotation                               | widget lifecycle/browser              | duplicate view mounts              | keep, P1          |
| Private mapped kernel    | generic store and stable-id helpers                          | private engine behind Decoration/Annotation          | Plite React internals | rename only where needed                            | existing stress/fault tests           | over-refactor                      | keep private      |
| Metrics                  | projection/source counters                                   | aggregate Decoration manager counters                | opt-in profiler       | rename and add fan-out counters                     | benchmark receipt                     | data leakage                       | keep private      |

## Deletion and adoption inventory

Delete in the same hard cut:

- `Editable.decorate`, `decorateDirtiness`, `decorateRuntimeScope`, and
  `renderSegment`;
- public `EditableDecoration`, `EditableDecorate`, `EditableTextSegment`,
  projection slice data in `RenderLeafProps`, and segment callback helpers;
- public `PliteProjection*`, compiled Projection store, projection context,
  projection entry hooks, and generic source exports;
- `usePliteDecorationSource` and `usePliteRangeDecorationSource` runtime-store
  authoring;
- `Plite.annotationStore` and `Plite.decorationSources`;
- keyed projection delta as a public protocol; keep any required delta carrier
  private to the manager;
- docs and examples teaching arbitrary range payloads or segment rendering.

Keep or reshape:

- `createMappedViewStoreKernel`, stable-id mapping, view-source fault boundary,
  and metrics as private implementation;
- range splitting and DOM wrapper code as private attribute rendering;
- Annotation and Widget stores with explicit identity;
- built-in inactive/view selection paint as internal Decoration sources;
- raw model-backed structural render callbacks on Editable.

Known adoption owners:

- raw Plite pagination and example surfaces under `apps/www/src/app/(app)/examples/plite/`;
- Plite React projection, Annotation, Widget, and selection tests;
- `apps/plite` focused browser rows for async decorations, persistent anchors,
  native selection, composition, and multiple mounted views;
- Plate plugin lowering, Find, Markdown preview, code highlighting, Yjs,
  static rendering, docs, and facade exports through the Plate plan.

## Scale contract

Frozen command:

```bash
bun docs/plans/artifacts/rendering-api-editor-audit/benchmark-decoration-manager.mjs
```

The production manager passes normal, large, stress, and pathological cohorts.
At 10,000 nodes and 32 sources:

- retained subscriptions: `320,000 → 10,032`;
- full render: `320,000` source reads → `10,000` bucket reads;
- 128-node source update: exactly 128 reads and 128 wakes;
- p95 mount: `58.256 ms → 68.065 ms`;
- p95 full read: `12.604 ms → 2.865 ms`;
- p95 narrow update: `0.524 ms → 0.660 ms`;
- cleanup leaves zero source observers;
- attribute order, wrapper count, unchanged bucket identity, and zero segment
  callback calls match the guard.

The JSON receipt records the unchanged budgets, cohorts, sampling, production
source hashes, environment, counters, and correctness guard.

Production metrics remain opt-in aggregate counters: source count, downstream
node subscriptions, source reads, bucket reads, changed buckets, wakes,
invalid ranges, failures, and durations. They never record document text,
attributes, source ids, keys, or application values.

## Type contract

The disposable inference probe passes with no callback annotations:

```bash
pnpm exec tsc --ignoreConfig --strict --noEmit --skipLibCheck \
  --target ES2022 --module NodeNext --moduleResolution NodeNext \
  docs/plans/artifacts/rendering-api-editor-audit/decoration-api-inference.ts
```

Execution ports the same Plite and Plate cases into package-owned type tests.
Do not add caller generics, casts, `any`, explicit callback parameter types, or
a helper overload that weakens contextual inference.

## Execution slices

### Slice 1: private manager and permanent benchmark

Owner: `packages/plitejs/src/react`.

- Build the provider-scoped source manager over the existing mapped-view
  kernel.
- Reconcile declarations by source id, keep current callbacks, re-observe when
  the observed owner changes, and clean up exactly once under StrictMode.
- Store immutable per-source buckets and immutable merged node buckets.
- Add fault isolation and aggregate metrics.
- Port the frozen benchmark to production manager constructors.

Exit: production benchmark passes unchanged; source failure, duplicate id,
cleanup, affected-only wake, stable unchanged identity, two Editables, and two
editors have focused tests.

### Slice 2: Decoration output and text renderer

Owner: `decoration-source.ts`, `editable-text.tsx`, and DOM-sync helpers.

- Add restricted attribute types and stable keyed output.
- Render deterministic nested wrappers without callbacks.
- Reject collapsed/invalid ranges and route point UI to Widget teaching.
- Remove arbitrary data from public slices and RenderLeaf props.
- Delete `renderSegment`; restore unprojected DOM text-sync eligibility.

Exit: overlap, adjacency, order, attrs, selection, composition, clipboard,
native repair, and static-equivalence tests pass.

### Slice 3: public authoring hard cut

Owner: Plite provider, Editable props, React exports, and hooks.

- Add sole `Plite.decorations` input.
- Delete old provider props, Editable decoration props, source hooks, and
  public Projection exports with no alias.
- Make Annotation/Widget consumers explicit by store identity.
- Update JSDoc to teach the four distinct jobs.

Exit: public import/type smoke passes; stale exported symbols and call shapes
are zero; `pnpm brl` is clean.

### Slice 4: raw Plite adoption

Owner: Plite examples, tests, pagination, selection paint, and browser app.

- Migrate every raw source and Annotation consumer.
- Preserve multiple mounted views, named roots, virtualization, static output,
  collaboration, and internal selection paint.
- Remove branch-only helper artifacts made dead by the new manager.

Exit: focused source-first tests pass, then `pnpm check:plite:dev` and focused
Chromium rows pass.

### Slice 5: Plate handoff

Owner: the accepted Plate plan.

- Expose the exact source descriptor through `platejs/react` only as required
  by the facade.
- Reshape plugin decorate lowering, cut Plate props, and migrate all consumers.
- Do not add a Plite plugin, render registry, segment renderer, store registry,
  or compatibility adapter.

Exit: Plate plan proof completes before Comments starts.

### Slice 6: docs, release, and closure

Owner: docs, package exports, changeset, Vision/skills, and repository checks.

- Update current-state Plite React docs and examples.
- Add the required breaking changeset for `plitejs` and affected Plate package
  entries.
- Run `best-api repair`, update only changed durable Vision doctrine, repair
  stale worker teaching, and regenerate skills with `pnpm install`.
- Run barrels, package proof, full `pnpm check:plite`, browser matrix when the
  execution is release-ready, and repository checks.

Exit: zero stale examples, source/mirror parity, generated artifacts current,
and the production scale receipt still passes.

## Proof matrix

| Claim                   | Focused proof                                    | Closure proof               |
| ----------------------- | ------------------------------------------------ | --------------------------- |
| Source inference        | package type test copied from inference artifact | Plite React typecheck       |
| One source subscription | manager lifecycle test                           | production benchmark        |
| One node subscription   | two-Editable subscription test                   | stress benchmark            |
| Attribute correctness   | range overlap/order/attrs unit tests             | Chromium DOM assertions     |
| Native editing          | focused composition, selection, repair tests     | `pnpm check:plite` Chromium |
| Multi-view              | two Editables and two editors unit/browser rows  | browser matrix              |
| Static parity           | same source read, no observe, exact markup       | Plate static suite          |
| Collaboration           | Yjs affected-client update and cleanup           | collaboration demo Chromium |
| Cleanup/failure         | StrictMode, source throw, retry, unmount tests   | stress stability loop       |
| Public cut              | export/type smoke and bounded stale search       | package pack/build          |
| Performance             | permanent production benchmark                   | unchanged frozen receipt    |

Primary commands during execution:

```bash
pnpm --filter plitejs test:react -- <focused files>
pnpm --filter plitejs typecheck:entrypoint:react
pnpm check:plite:dev
pnpm --filter plite test:plite-browser:chromium <file-or-grep>
pnpm check:plite
pnpm check:plite:browser-matrix
```

The full browser matrix is a closure gate, not the inner development loop.

## Failure analysis

1. Source churn repeatedly tears down an external store. Prevent by reconciling
   source identity by `id`, retaining current callbacks, and testing changed
   observed-owner cleanup.
2. Overlapping attributes change DOM or selection behavior. Prevent with fixed
   source/result order, nested wrappers, no events/components, and native
   selection/composition browser rows.
3. A broad refresh causes document-wide work. Make `'all'` explicit, instrument
   it, migrate every external owner to exact old/new node keys, and keep the
   pathological update budget fail-closed.
4. Two Editables duplicate upstream store subscriptions. Provider owns upstream
   observation; mounted Editables own only downstream node buckets.
5. Static and Yjs take a private shortcut. Require same read output and stable
   keys; only observation differs by host.

This is a hard cut. Rollback means reverting the complete change before release,
not shipping both APIs.

Work Checklist:

- [x] Current public owners and live consumers are sourced.
- [x] Every candidate in the architecture list is compared in a strict matrix.
- [x] `best-api` maximum-value deletion is applied.
- [x] One canonical Plite call shape and owner graph are selected.
- [x] External-store and multiple-store binding is explicit.
- [x] Type inference passes without callback annotations.
- [x] Frozen scale and correctness budgets pass on an executable target.
- [x] Public cuts, retained concepts, and private mechanics are explicit.
- [x] Plate, collaboration, static, examples, docs, exports, release, and proof
      adoption owners are named.
- [x] Three or more realistic failures have focused proof owners.
- [x] Execution slices have entry/exit conditions and no unresolved alternative.
- [x] Comments is blocked until Plite and Plate production proof pass.

Completion Gates:

| Gate                               | Applies | Evidence                                                                           |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| Candidate and current-source audit | yes     | 17 references, 85 validated rows, and the accepted current-owner map               |
| Public API target                  | yes     | one `decorations` descriptor list and restricted Decoration output                 |
| Scale acceptance                   | yes     | all frozen cohorts pass on the final production manager                            |
| Type inference                     | yes     | strict probe passes without callback annotations                                   |
| Adoption and deletion              | yes     | six slices name every public cut, consumer, export, doc, and proof owner           |
| Implementation                     | no      | N/A: planning-only run; production work begins after user acceptance               |

Phase / pass table:

| Phase                             | Status                | Evidence                                                      |
| --------------------------------- | --------------------- | ------------------------------------------------------------- |
| Current-state and candidate audit | complete              | accepted audit report and matrices                            |
| API selection                     | complete              | 10/10 target-design receipt                                   |
| Scale and inference pressure      | complete              | benchmark and strict TypeScript receipts                      |
| Adoption planning                 | complete              | owner graph, deletion inventory, six slices, and proof matrix |
| Production implementation         | not_started_by_design | outside this planning run and blocked on acceptance           |

Verification evidence:

- `node docs/plans/artifacts/rendering-api-editor-audit/generate-matrices.mjs`
  reports 17 references, 17 matrices, and 85 rows.
- `bun docs/plans/artifacts/rendering-api-editor-audit/benchmark-decoration-manager.mjs`
  reports `production-scales` across all frozen cohorts.
- The strict TypeScript command in the Type contract exits zero.
- Production package/browser evidence remains an explicit execution gate, not
  an unearned planning claim.

Reboot status:

- Decision is final for planning: keep semantic Decoration sources, cut
  `renderSegment` and public Projection, compile once per provider, then hand
  Plate the exact descriptor contract.

Open risks:

- Production integration may expose native editing or source-replacement bugs
  absent from the disposable manager. The proof matrix blocks adoption on
  those failures; no alternate public path is allowed.

## Handoff

Status: ready for user acceptance; planning only.

First execution owner: `plite-plan --deep` on this plan. Do not start Comments,
Plate consumer migration, public docs, or a compatibility layer before the
provider manager, attribute renderer, inference proof, and production benchmark
pass.
