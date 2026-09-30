---
review_scopes:
  - html
  - runtime
  - react
  - annotations
  - list
  - table
review_basis:
  - 2026-09-30-static-preview-next-content-roots
  - 2026-09-11-runtime-document-view-ownership
  - 2026-09-12-react-public-runtime-cut
  - 2026-09-21-annotations-oss-validation
  - 2026-09-24-list-audit
  - 2026-09-17-table-host-delivery-benchmark-closure
work_kind: design
---

# Content-root locations

Status: Complete — design and embedded probes complete; product adoption is unexecuted.

Objective:

Give render callbacks, decoration sources and list/table reads one unambiguous
document-and-root context through the existing editor view. Remove redundant
location recovery and document-wide work from known-path presentation reads.

Completion threshold:

The design compares root-bound views with explicit root-qualified locations,
settles public call shapes and ownership, records reproducible correctness
and scale probes, and specifies concrete adoption slices and final-tree proof.
This threshold is met. Product implementation, staging, commits and publication
are outside this run. The disposable probes are not product adoption.

Verification surface:

Current Plite view/read contracts, live/static decoration and component
callbacks, caption/list/table consumers, a disposable source-built probe, the
Task completion checker and the bound review-ledger design outcome.

Constraints:

Paths stay root-relative. The primary root stays implicit in public API.
Detached conversion remains independent of editing runtime. Immutable projected
views stay read-only and source-isolated. Root identity is not persisted in
paths or a new store. Prior conversion and proportional-preview decisions
remain settled unless current evidence contradicts them.

Boundaries:

Plite owns location/read/view semantics and raw decoration callbacks. Plate
owns plugin callback adaptation and static traversal. List and table own their
feature reads. Registry UI owns presentation. This plan does not redesign
table topology, parsing, streaming, CSS or AI product behavior.

Blocked condition:

None. A failed architecture probe rejects that candidate; an unresolved hot
path remains gated rather than being called execution-ready.

Work Checklist:

- [x] Reconcile the current review and completed proportional-preview work.
- [x] Ground root/read semantics and consume the two read-only source sidecars.
- [x] Compare whole-shape alternatives and freeze the selected call contract.
- [x] Run the frozen design probes and record their limitations.
- [x] Specify adoption, correctness, native/browser and production-cost gates.
- [x] Record the bound design outcome and pass plan/ledger checks.
- [x] Run applicable `lint:fix` as the final implementation checklist item.

## Frozen architecture probe

Frozen before target execution on 2026-09-30. This is Benchmark's embedded
architecture probe in the Task design goal, not a full performance audit.
The `performance-observability` pack applies because the candidates may create
root views or cause repeated document indexing/validation during rendering.

Operation: supply a correct root context and read a known node and feature
information while traversing primary and element-owned roots of an immutable
document. Current owners: Plite runtime views and root reads; Plate traversal;
list/table queries. Scale variables: document size, roots, queried nodes and
repeated reads of the same document. No production implementation is allowed.

| Cohort | Input | Purpose |
| --- | --- | --- |
| Normal | 10 KB, 2 named roots | Duplicate local paths, main/caption correctness |
| Large | 50 KB, 10 named roots | Existing preview size; whole-operation cost |
| Stress | 50 KB, 100 named roots | Root fan-out without changing payload size |
| Pathological | 50 KB, 1,000 named roots | Detect document-size × root fan-out |

Correctness must cover distinct text at the same path across roots, a foreign
document, source isolation, read-only enforcement and plugin reads. A fast
incorrect candidate fails. Detached conversion must not allocate an editor.

Deterministic acceptance: no schema validation or full document-index build
per node/root query; at most one document validation at the document-view
boundary, then root work proportional to roots actually visited. Unchanged
document/root inputs must retain their scoped reader identity.

Timing acceptance: compare matched complete root/read work, including view
creation and retirement where applicable. A correct candidate's warm median
must stay within 10% plus 0.5 ms of the cheapest correct existing scoped-read
control at 10/50 KB. The large cohort's added context cost must stay below
2 ms per traversal. Root fan-out must not multiply whole-document validation
or indexing. Six interleaved measured packets after two warmups; retain raw
samples, median, p95 only if sample size supports it, and source hashes.
Differences below 10% or 0.2 ms are timing-inconclusive, not a speedup claim.
A deterministic failure can reject a candidate without more timing packets.

Browser mount/render/native interaction is N/A for this disposable headless
choice probe. The adoption plan must name the final-tree browser rerun;
existing browser measurements cannot certify the proposed root contract.

Feature subprobe, frozen before its target run: list ordinals and static table
cell presentation use already-known paths in primary/named/projected roots.
Compare 20 and 500 unrelated paragraphs plus fixed two-item lists and 1×1
tables. Require exact ordinals and cell size/border parity, zero new full-root
index materializations on the target's path-only reads, and no editor allocated
for detached list conversion. Six packets after two warmups. Warm work must
meet the same 10% + 0.5 ms tolerance against the current correct rooted control.
The probe tests a pure table presentation path; it does not replace keyed
selection, mutation or the view-attribute binder.

## Target and caller shapes

**Use the existing scoped editor as the document-and-root context.** Keep
root-relative `Path` and `NodeEntry` values. Correct view composition at Plite,
then deliver the right reader at callback boundaries. Do not introduce a
`NodeLocation`, an extra `root` option on every feature read, or a view manager.

These are the target examples, not implemented APIs:

```tsx
// Current static consumers recover locations from nodes.
editor.plugin(BaseListPlugin).read.ordinal(element);
editor.plugin(BaseTablePlugin).read.cell({ at: element });

// Target: static props already know the path; editor is scoped to its root.
editor.plugin(BaseListPlugin).read.ordinal(path);
editor.plugin(BaseTablePlugin).read.cell({ at: path });

// Existing callback shape stays. A caption entry at [0] addresses its caption.
decorate: {
  read: ({ editor, entry: [node, path] }) => {
    const entry = editor.read.nodes.get(path);
    // entry[0] is node in this reader's document and root.
    return [];
  },
},
```

`read.ordinal(at: NodeTarget<Element>): number | undefined` is the sole list
call shape. Existing element callers continue to work. Paths avoid identity
recovery; node and key targets resolve only in the invoking reader's root.
Non-numbered, missing or foreign targets return `undefined`. A valid first
numbered item still derives its ordinary start; missing nodes no longer
masquerade as item 1. Reuse the core target types and root authority. Do not
add a parallel list target resolver or an implicit selection fallback.

`read.cell({ at })` keeps its current public signature and result. A known
cell path reads presentation through pure table topology, without consulting
selection or allocating live cell keys. Calls that use selection, nodes or
keys retain their established targeting rules. Selection, mutations and the
private DOM binder continue using the live keyed grid. Presentation and those
operations share the existing grid compiler and one cell-info calculation.

Live `EditorElementProps` continue carrying the element and scoped editor.
Their deliberate omission of `path` remains: components that need reactive
paths use the existing path hook. Static `EditorElementProps` already require
`path`. Adding live paths to every component would expand subscriptions and
rerenders without a demonstrated job.

```ts
// Existing public factory; target composition makes these reads coherent.
const documentView = createEditorView(editor, { document });
const captionView = createEditorView(documentView, { root: captionRoot });
captionView.read.nodes.get([0]);
captionView.read.view.root(); // captionRoot
captionView.read.view.isReadOnly(); // true

// Constructors remain independent, including identical options.
const first = createEditorView(editor, { root: captionRoot });
const second = createEditorView(editor, { root: captionRoot });
// first !== second; they own separate mounted-view policy.
```

The public factory remains a constructor. Reuse is private to the existing
static document-view cache, keyed by source view, document, root and relevant
configuration/policy identity. It must not globally intern mounted views.

## Jobs, laws and history

The current jobs are rendering independently addressed content, deriving
feature presentation, and painting a range in the document/root where it was
produced. An immutable foreign document is another reader of the model's
schema and features. It is not an editable clone or a second document runtime.

The hard laws are:

1. The supplied editor and entry identify the same document and root. Reading
   the entry's path returns that entry's node. Local paths alone never cross
   a root boundary.
2. A view created from another view must not inherit that view's fixed root
   wrapper as its query/update runtime. The requested root wins. Omitted root
   addresses the primary root, including derivation from a named-root view.
3. Immutable document identity, read-only policy, null selection/last commit,
   inert subscriptions and source-read protection survive view derivation.
   Derivation cannot unlock a read-only source. Explicit document plus authored
   projection remains invalid; use the original model to construct a different
   kind of view.
4. Live derived views preserve the source's current authored policy unless
   explicitly configured otherwise, while focus/composition and mounted
   observation remain independent. Reuse `readAuthoredView` and the existing
   authored owner; do not retain another projection copy.
5. Raw decoration output without endpoint roots is relative to its emitting
   reader. Explicit roots remain authoritative. Mixed-root output and output
   outside the reader's root are dropped through the existing invalid-range
   path before caching, path fast paths or leaf slicing.
6. Canonical external ranges are different inputs: their owner interprets an
   absent root as primary before emitting paint. Yjs/annotation adapters must
   check that ownership; a primary-root cursor must not become caption paint.
7. Detached HTML/Markdown conversion stays editor-free. Native keys, selection,
   history and annotation lifetimes remain with their existing owners.
8. Work scales with visited roots, their nodes and feature topology. Known-path
   presentation does not build a whole-document index. An unchanged render
   retains the existing memoized output where its actual inputs are unchanged.

| Governing history | Retained conclusion | This design's bounded change |
| --- | --- | --- |
| `2026-09-30-static-preview-next-content-roots` and proportional-cost execution | Coherent projected reads and static reuse are adopted; no parser restart | Repair scope delivery/composition and known-path feature reads |
| `2026-09-11-runtime-document-view-ownership` | One private document runtime; independently scoped views | Flatten runtime composition, not lifetime ownership |
| `2026-09-12-react-public-runtime-cut` | `EditorRoot` is the public mounting grammar | Borrow source definitions into automatic owned-root mounts; no new provider |
| `2026-09-21-annotations-oss-validation` and its adoption | Separate anchors, exact-view annotation index and paint; keep the measured mapping kernel | Root-check paint at admission; no new anchors or annotation store |
| `2026-09-24-list-audit` and proportional-cost owner repair | Flat list properties, conditional `listStart`, forced `listRestart`, immutable-content cache | Accept known targets and remove the unresolved-node ordinal fallback |
| `2026-09-17-table-host-delivery-benchmark-closure` | Keep Plate topology and private exact-view DOM binder | Read cell presentation without entering keyed selection compilation |

The stale historical fingerprints do not reopen their whole questions. Current
source and the new probes ground only the changes above. This design does not
claim renewed runtime proof for those earlier implementations.

## Source-grounded defects and boundaries

| Boundary | Current evidence | Adoption owner |
| --- | --- | --- |
| View derivation | `editor-runtime-view.ts:1254` validates each explicit document; a derived view uses its parent's fixed runtime. `composition-current.json` reads primary text when a named root was requested and reports read-only false for immutable/read-only parents | Plite view runtime |
| Live main/named-root decorations | `react/decoration-source.ts:770` supplies the exact mounted view; manager remains per view | Preserve |
| Live owned-root decorations | `editable-text-blocks.tsx:434` mounts a child `EditorRoot` without supplying its parent's sources | Plite automatic content-root slot |
| Static owned-root callbacks | `PlateStatic.tsx:275` changes root children/path/stack but retains the outer editor for descendants; dependency traversal has the same defect | Plate traversal/cache |
| Attributes | `getPlateDecorationSources.ts:78` guards `read`, then evaluates attributes outside that guard | Plate adapter |
| Range admission | Plite's input-path fast path precedes root agreement; static slices ignore target identity and discard multi-path ranges | Existing decoration compiler and static leaf projection |
| Lists | `getListOrdinal` falls back to start/restart/1 when `nodes.path(element)` cannot resolve. The root-bound control gives 1,2 | List read adapter |
| Table presentation | `read.cell` enters `readTableSelection`; even a path target builds native cell keys through `compileTableGrid(state, ...)` | Table read adapter |
| Detached lists | `deriveListOrdinal` is already shared by live and `getDocumentListOrdinal` via a small immutable adapter | Keep; no new runtime |
| Captions | Ordinary image captions are normal children; image schema does not declare an owned root. The figure fixture has an explicit owned caption | Preserve both shapes; no media-schema migration |

Both read-only sidecars were consumed. The decoration census added the missing
live source propagation, attribute guard and output-range boundaries. The
feature census corrected two overly broad cuts: detached numbering already
shares its algorithm, and table paths alone do not eliminate key indexing.

## Whole-shape alternatives

| Candidate | Caller shape | Decision and reason |
| --- | --- | --- |
| Patch each feature independently | Nodes plus root-recovery helpers in lists, tables and decorations | Cut. Traversal already knows scope; repeated recovery retains ambiguity |
| Root-qualified location carrier everywhere | `read.ordinal({ at: path, root })`, additional callback location fields | Reject. It duplicates existing view authority and changes every read; `children()`, selection and plugin APIs still need a coherent scoped reader. No independent current job pays for a new carrier |
| Ambient root wrapper over an existing editor | Enter root, call original editor methods, restore | Reject as callback contract. Source `read` clears projection and existing view methods re-enter their fixed root; the wrapper cannot make all reads coherent. Keep the primitive inside the runtime |
| Full explicit document view per root | `createEditorView(source, { document, root })` repeatedly | Reject as repeated-unit implementation. Correct control, but validation scales as roots × document work |
| Compose existing views and cache static readers | Existing editor/entry callbacks; ordinary path targets | Select. One captured immutable document, exact root readers, independent public constructors; probes falsify composition and scale risks |
| Generic location/index/store owner | Extra manager, mirrored state or registry protocol | Cut. Existing roots, views and static cache pay for every required job |

## Decision ledger

| ID | Decision | Target, hard cut or retained law | Proof / adoption |
| --- | --- | --- | --- |
| D1 | Keep | One document runtime, root-relative paths and implicit public primary root | Existing doctrine plus S1 |
| D2 | Rearchitect existing owner | Construct views over the canonical runtime; retain source facade capabilities and capture document/policy explicitly | Composition probe; S1 |
| D3 | Keep with correction | Inherit immutable/read-only binding; do not nest root wrappers or expose a writable child | Composition/scale guards; S1 |
| D4 | Reuse | Extend `staticDocumentView.ts` for root readers; public constructors stay independent | Scale prototype; S2 |
| D5 | Keep authority | Validate once per document/schema binding. Use existing `schemaRevision`; revalidation after schema replacement is required once, never once per child root | S1 schema-reconfiguration contract; prototype uses a fixed schema |
| D6 | Rearchitect delivery | Supply scoped editor to static reads, component/leaf/text adapters and dependency collection | S2 correctness oracle |
| D7 | Keep callback shape | `{ editor, entry }` and existing component props; no generic location carrier, no live path prop | S2 type/adoption contracts |
| D8 | Cut ambiguity | Normalize/check output root before decoration caches, fast paths and target slicing; reuse `internal/root-location` authority | S3 range matrix |
| D9 | Move guard to full evaluation | Decoration read and attribute callbacks share the exact reader and document-read guard | S3 adapter test |
| D10 | Adopt existing sources | Automatic owned-root mounts borrow source definitions and create their own exact-view manager/observers | S3 lifecycle/native proof |
| D11 | Widen existing target input | List `ordinal(at)` accepts core node targets; known paths skip recovery. Unresolved targets return undefined | Feature probe; S4 |
| D12 | Cut redundant work | Table path presentation bypasses selection/key compilation; share pure topology and cell-info calculation | Feature probe; S4 |
| D13 | Keep | Keyed grids, table commands/selection and DOM binder remain unchanged | Existing table contracts; S4 regression proof |
| D14 | Keep | Pure detached list adapter and algorithm; no editor allocation in format conversion | Source and detached probe; S4 parity |
| D15 | Correct dependency identity | Static memo inputs include owned-root key and children identity; root reassociation invalidates even when arrays are shared | S2 seeded oracle |
| D16 | Keep | Presence is exact-session/view data; find/Yjs decline unsupported foreign/root inputs before emitting paint | S3 source adoption checks |
| D17 | Defer | Per-block decoration cache/chunking, generic key indexing, CSS restyles and AI product redesign | Existing 32 ms cadence/product trigger; independent jobs |
| D18 | Gate adoption | Final source-built package/browser/type/doctrine proof and frozen cost rerun | S5; no production claim from prototype |

## Design receipts

The reproducible files live in
`docs/research/probes/2026-09-30-content-root-locations/`; they are durable repo
inputs rather than ignored task artifacts. `report.mjs` checks measured source
hashes, work counters, correctness and frozen timing tolerances, then writes
`summary.json`.

The view prototype transforms the current module only in Bun memory. It
flattens runtime binding while retaining source facade capabilities, inherits
document/read-only policy, and skips repeated assertion for the captured
document. Reader caching is separate and local to the static control. It checks
live named-root writes, independent constructor identity, plugin/API reads,
read-only metadata/refusal, document source isolation and the source-read guard.
It deliberately does not implement schema reconfiguration or authored/native
interaction adoption.

| Text payload / named roots | Current validation calls | Prototype validation calls | Prototype cold capture + root reads |
| --- | ---: | ---: | ---: |
| 10 KB / 2 | 3 | 1 | 0.18 ms |
| 50 KB / 10 | 11 | 1 | 0.28 ms |
| 50 KB / 100 | 101 | 1 | 1.48 ms |
| 50 KB / 1,000 | 1,001 | 1 | 15.86 ms |

The first two cohorts meet the frozen tolerance and 2 ms context budget. The
stress cohorts eliminate document-validation fan-out; they still create one
reader per visited root. All path-query cohorts materialize zero indexes.
The pathological fixture's 50 KB is text payload; serialized root structure
adds bytes. It is not a 50 KB serialized document.

The feature prototype changes only target recovery and the path-only table
presentation branch, using the real Plate schema and feature implementations.
It preserves 1,2 numbering and width 300, height 72, bottom border 4 in primary
and owned roots. A detached list read returns 2 without an editor allocation.

| Unrelated paragraphs | Current complete feature reads | Prototype reads | Index builds, current → prototype |
| --- | ---: | ---: | ---: |
| 20 | 0.54 ms | 0.31 ms | 2 → 0 |
| 500 | 1.53 ms | 0.32 ms | 2 → 0 |

These are six-sample medians after two warmups. Baseline and prototype ran in
separate processes, with interleaved control/cold order within the root probe.
That is a sampling limit relative to the frozen interleaving intent. Deterministic
counter elimination and matched correctness decide ownership; these numbers
are not a production speedup or a p95 claim. The root probe has one feature
plugin, and the feature probe has List/Table/Figure, not the full registry kit.
Final cost proof must use the real kit and production paths.

Reproduce from the repo root:

```sh
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-30-content-root-locations/probe.ts > docs/research/probes/2026-09-30-content-root-locations/composition-current.json
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-30-content-root-locations/scale.ts current > docs/research/probes/2026-09-30-content-root-locations/current.json
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-30-content-root-locations/scale.ts scoped-prototype > docs/research/probes/2026-09-30-content-root-locations/scoped-prototype.json
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-30-content-root-locations/features.ts current > docs/research/probes/2026-09-30-content-root-locations/feature-current.json
bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-30-content-root-locations/features.ts path-prototype > docs/research/probes/2026-09-30-content-root-locations/feature-prototype.json
node docs/research/probes/2026-09-30-content-root-locations/report.mjs
```

## Execution slices and stop conditions

Execution is unexecuted. The slices describe the handoff, not authorization to
change product code in this planning run. S1 is the next step.

| Slice | Owner and edits | Required proof before advancing | Failure rule |
| --- | --- | --- | --- |
| S1 — view composition | Plite `editor-runtime-view.ts` and existing private runtime metadata. Reuse canonical runtime, current authored policy and schema revision; preserve layered APIs, capture immutable binding, sticky read-only policy and independent constructors | Existing runtime contracts extended for main↔named, nested live/document views, authored accepted/proposed/markup, cross-root writes, keys, guards, null selection/commit, inert document subscriptions and schema replacement. Re-run scale contract against real code | Stop S2 if scope/policy is wrong or per-root validation returns; repair this owner, not caller facades |
| S2 — static delivery | Plate `staticDocumentView.ts`, `PlateStatic.tsx`, static pipe adapters. Borrow/cache readers by exact source/document/root/configuration. Thread them through source reads, component context and root dependency traversal. Retain cycle protection | Static owned-root spec and reuse oracle: two numbered items, distinct text at identical paths, nested/shared roots, reassociation to a different root with shared arrays, foreign documents and ordinary-child image captions. Verify all callback kinds, DOM root markers and exact semantic output, not fresh/reused equality alone | Do not invalidate every block merely because reader identity changed; no React render-time mutation of a stable reader |
| S3 — decoration admission and ownership | Plite compiler/automatic owned-root mount, Plate adapter. Admit root before cached/input-path branches, slice ranges onto their actual text targets, guard attributes, borrow source definitions into child mounts. Audit Find/Yjs/Code/Comments/Suggestion/AI outputs | Extend existing decoration-manager and adapter tests for implicit/explicit same root, other/mixed root rejection, equal paths across roots, block-emitted text ranges, multi-leaf ranges, scalar-state refresh, observe disposal and two mounts of a shared root. Exercise native root transitions | Never share a manager or mapped paint between views. Canonical presence ranges must be root-checked by their owner before becoming relative output |
| S4 — known-target presentation | List input adapter and registry static list; table path presentation and registry table-static. Keep current pure numbering adapter/compiler and keyed selection/binder | Primary/named/projected ordinal and table presentation parity, starts/restarts, custom sibling callbacks, missing/foreign target refusal, spans/neighbors/borders. Existing table grid/selection/native tests remain green. Feature counter guard stays zero for path-only reads | No table-marker API, no new copied-UI resolver, no synthetic operation keys escaping presentation |
| S5 — adoption/proof closure | Package types, copied UI, docs/rules, changesets, generated output and the bound execution receipt | Complete proof matrix below on final source identity; real-kit root/feature budgets and existing S5 Chromium static/AI parity/cadence cells. Resolve any failing changed interaction. Record honest remaining independent risks | No completed/verified runtime adoption from headless prototypes or an unchanged historical receipt |

The public list widening has no compatibility alias. Update its callers and
JSDoc together. The missing-node behavior and view-composition policy correction
need package changesets; package owners classify them under the beta breaking
policy. Registry source changes require the registry changelog and regeneration
on `next`. Generated schemas/contracts and docs mirrors come from their owners.

## Proof matrix and verification commands

Every row below is an unexecuted **production adoption gate**. Tests are the
smallest extensions to existing contracts that exercise the named defects.
They are not deletion assertions or one test per prose decision.

| Claim | Existing proof owner / exact selection | Required additional case |
| --- | --- | --- |
| Root/read/view composition | `packages/plitejs/test/runtime-contracts.test.ts` imports `editor-runtime-view-contract`; `read-view-lifecycle-contract.test.ts`, `node-key-view-contract.test.ts` | Requested root beats parent wrapper; immutable/authored/read-only binding and type capabilities survive derivation/reconfiguration |
| Live root ownership | Plite React root graph/view tests; `editable-text-blocks.tsx` and `use-content-root` contracts | Borrowed sources have one observer per exact mount, proper refresh and last-owner cleanup; unrelated mounts remain independent |
| Decoration target/root | `packages/plitejs/test/react/decoration-manager-contract.test.ts`; Plate `getPlateDecorationSources.spec.ts` | Root admission precedes both cached and input-path fast paths; attributes read the same node under the same guard |
| Static correctness and reuse | `PlateStatic.spec.tsx` and `PlateStatic.reuse-oracle.spec.tsx` | Expected content/presentation across primary, owned, nested, shared and projected roots; moving root key with identical content changes output correctly |
| List semantics | `BaseListPlugin.spec.tsx`, existing slow traversal contract and public type contracts | Known-path parity and undefined missing/foreign targets; starts/restarts/sibling invalidation preserved |
| Table presentation | `BaseTablePlugin.presentation.spec.tsx`, `grid.spec.tsx`, `internal/grid.spec.ts`, `type-tests/table-plugin-contracts.ts` | Path/node/key parity in valid scope, zero index builds for path presentation, spanning cells and borders; keyed commands/binder retain their identity |
| Session paint | Existing Find/Yjs/Comments/Suggestion/Code source tests and static foreign-document tests | Primary presence cannot alias a caption; foreign documents keep only identity-valid semantic paint; no extra AI end marker in another root |
| Native/browser | Managed `multi-root-document.test.ts`, `synced-blocks.test.ts`, `editable-voids.test.ts`, `tables.test.ts`, `decorations-async.test.ts` | Type/select/edit in caption and owner, shared-root mount/retirement, root switch, undo, composition and decoration refresh without focus/selection contamination |
| Cost | This frozen headless contract + existing S5 proportional static/AI runner | Final production path with real `BaseEditorKit`; capture/roots/reads/retirement counted, no repeated assertion/indexing, no skipped publication, parity and 32 ms cadence preserved |
| Teaching/exports | Source-first Plite/Plate/www typechecks, doctrine, API-reference and entrypoint/registry checks | Callback inference with installed descriptors and generated editor; current examples compile without callback annotations or consumer casts |

Use Verify Plate's command recipes and existing entrypoint scripts. Focused
forms for iteration are:

```sh
pnpm check:plite:dev
bun test --preload ./config/plite-source-test-setup.ts ./packages/plitejs/test/runtime-contracts.test.ts ./packages/plitejs/test/read-view-lifecycle-contract.test.ts ./packages/plitejs/test/node-key-view-contract.test.ts
pnpm --filter platejs test -- PlateStatic BaseListPlugin BaseTablePlugin getPlateDecorationSources
pnpm --filter plitejs typecheck
pnpm --filter platejs typecheck
pnpm --filter www build:registry
pnpm --filter www typecheck
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/multi-root-document.test.ts tests/plite-browser/donor/examples/synced-blocks.test.ts tests/plite-browser/donor/examples/editable-voids.test.ts tests/plite-browser/donor/examples/tables.test.ts tests/plite-browser/donor/examples/decorations-async.test.ts
```

Resolve the source-first wrapper before extending React test bodies; the
Plite React folder is Vitest-owned, not root Bun. Managed browser runs are
serial. S5 closure uses `pnpm check:plite` and
`pnpm check:plite:browser-matrix` for the applicable browser/native claims,
alongside the affected Plate/www gates. If exports or public files change,
run `pnpm brl` before final verification. Run the owning/root `pnpm lint:fix`
last, then re-run checks invalidated by its changes. Do not reuse a stale
external server as final proof.

Best API doctrine repair belongs to S5: update the smallest affected source
rules for scoped callbacks, view derivation and list targets; retain the
existing root/path, mapping and lifetime taste in Vision; append the required
Plate Next doctrine version and regenerate mirrors. Public reference teaches
the final API, not before/after migration prose. No doctrine or product change
was made during this design run.

## Limits and explicit non-goals

- The disposable probes choose the owner/scaling shape. They do not compile
  the proposed generic signatures or prove React/browser adoption, schema
  reconfiguration, authored input, arbitrary table spans or all source outputs.
  Those are explicit slice gates, not missing design decisions.
- The actual schema-revision owner exists in `PluginRegistry.schemaRevision`.
  A production validation certificate must be invalidated by that revision;
  the fixed-schema prototype does not claim this invariant is implemented.
- Static reader reuse must track configuration and policy where those alter
  callback results. Existing source state/version invalidation remains intact;
  no new generic state store is justified.
- Source-read guards cover synchronous reads/decoration adapters. Arbitrary
  component bodies that close over the source editor are not automatically
  sandboxed. Supplied-context component reads must be correct; keep the guard's
  actual reach explicit rather than promising universal capture prevention.
- Keep full-document decoration caching/chunking deferred under the prior
  trigger. The remaining static pass, table spans, CSS restyles and unrelated
  historical suite failures are not silently certified by this plan.
- No media-schema migration, universal location/AST, table topology redesign,
  annotation kernel change, additional selection state, parser redesign,
  AI product change, commit or publication is included.

## Design completion gates

| Gate | Result |
| --- | --- |
| User acceptance and scope | Design the recommended content-root contract; planning only |
| Ownership and alternatives | Settled above; two whole-shape candidates plus ambient/per-feature deletion controls |
| Scale-sensitive acceptance | Embedded source-built probes pass their bounded contract; production rerun belongs to S5 |
| Adoption readiness | S1–S5 have owners, target shapes, decisive checks and failure rules; no missing user decision |
| Native/browser proof for this run | N/A: no product implementation or browser performance claim |
| External research | N/A: existing root/view, annotation and table comparisons retained; no unfamiliar dependency or engine replacement selected |
| Autoreview/publication | N/A on `next`; no staging, commit, PR or external message authorized |
| Design recording and plan checker | Closure checks recorded below |

Verification evidence:

`summary.json` reports pass with matching measured source hashes. Root counters
are one validation and zero index builds; feature counters are zero index builds
with exact output parity. The original composition probe records the defects,
and the transformed runtime checks corrected live/document binding and independent
constructor identity. Package suites and browsers were not run in this design
session. The plan checker and ledger closure are part of this design outcome.
Affected-path root `pnpm lint:fix` was attempted: the repository excludes these
docs/probes from Ultracite, which returned no target files (exit 2). Lint is N/A
for the affected surface; this is not a clean lint claim. Final whitespace,
local-reference, plan-completion and ledger checks verify the design artifact.

Open risks:

Product adoption remains unexecuted. Authored/read-only composition,
schema-revision invalidation, root admission before decoration fast paths and
memo dependencies on root identity need their named production gates.
The prototype has a smaller plugin set than the real registry kit and provides
no native/browser or public-type compilation proof.

Final handoff prepared:

Start execution with S1 at Plite's existing view owner, then S2 scope delivery,
S3 paint admission/lifetime, S4 presentation and S5 final-tree proof. Product
adoption is unexecuted. The highest execution risks are authored/read-only
composition, schema-revision invalidation, cross-root paint fast paths and
static memo dependencies when root identity changes without node changes.
