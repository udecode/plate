# Pagination: view-owned layout and truthful fragmentation

Status: Implemented on 2026-09-16. S0-S6 adopted the view-owned runtime,
truthful fragmentation, exact Plate facade, public docs, package proof and
versioned doctrine. Focused pagination proof is complete. The root strict gate
also exposed one unrelated concurrent history README assertion and a later
browser proof run was invalidated by a concurrent slash-test write; both are
recorded below without absorbing those owners.

Objective:
Complete the user's pagination design and adoption plan: own live layout in the
paged view, remove false page-break authority, and make fragmentation explicit.
The source acceptance is the [pagination audit](../research/decisions/pagination-ownership.md).

Completion threshold:
Resolve public call sites and ownership, challenge the larger deletion, record
executable design evidence, and provide concrete adoption and production proof.
Do not confuse a disposable design probe with shipped browser behavior.

Verification surface:
Live pagination source, sole raw example, public guide, package/facade/export
contracts, existing package/browser tests, a paired disposable cost prototype,
inferred public type sketch, and plan/link/ledger checks.

Constraints:
Use the current next checkout. No compatibility aliases, document pagination
nodes, second editor/history, pagination plugin/provider, or generic
virtualization backend. Canonical content and view-local presentation retain
their respective owners. No publication.

Boundaries:
Plite owns neutral measurement and mounted paged mechanics. Plate remains the
exact facade; application source owns typography, page appearance, and
schema-specific row/media renderers. Headless measurement remains an independent
job. PDF/DOCX authority, manual page-break authoring, columns, footnotes and new
semantic table grammar are outside this request.

Blocked condition:
A decision-changing failed or incomparable design probe prevents accepting its
runtime target. Continue the smallest isolating probe while one is runnable.

Template:
Adapted from docs/plans/templates/plite-plan.md and its performance-observability
pack; Task owns this single plan and native goal.

Work Checklist:
- [x] Ground the three requested outcomes in the seven-unit audit.
- [x] Settle normal, customized and headless calls and the complete deletion set.
- [x] Resolve exact view lifetime, fragment capabilities and truthful measurement.
- [x] Run executable comparative design probes and consume independent challenges.
- [x] Specify adoption, native/type/package gates and doctrine repair.
- [x] Review the final plan, reconcile ledger and verify links/completion.

Frozen design probe contract:
Recorded before candidate measurement on 2026-09-15. This is Benchmark's embedded
architecture probe, not a comprehensive performance investigation.

- Operation: derive pages, project canonical text runs and produce paint ranges
  for every leaf consumed by the paged renderer. Include both initial creation
  and repeated synchronous recomposition. Separately test relocating the existing
  React reader inside the component without changing its subscription law.
- Baseline: current `createLayout`, `getPageLayoutFragments`, projection and
  decoration functions, with the example's per-leaf projection/read-cache shape.
  Candidate: disposable direct snapshot derivation from the same extractor and
  engine, followed by one projection/decorations pass with keyed leaf reads.
  No new measurement algorithm, incrementality, eviction cache or scheduler.
- Cohorts: normal 20 blocks x 4 leaves; large 200 x 8; stress 1,000 x 8;
  pathological one block x 200 leaves, and one table with 1,000 direct children.
  deterministic synthetic content; engine is the explicit estimated engine.
  These are supported owner inputs, not an end-to-end 1,000-page claim.
- Sampling: two warmups, nine interleaved baseline/candidate pairs per cohort;
  reverse order on alternating pairs. Report raw samples, p50/p95 and cold
  observation separately; omit p99 because the sample is too small.
- Acceptance: identical geometry, ordered text ranges and subtree ownership;
  zero editor mutations; candidate visits each projected run/child once per
  snapshot and keyed reads perform no recomposition. Candidate p95 must not
  regress beyond both 25% and 5ms compared with baseline. Cold candidate must
  not regress beyond both 50% and 10ms. These paired non-regression allowances
  are proxy noise/materiality limits, not browser responsiveness budgets.
- View lifetime: compare external versus internal ownership for one and four
  mounts, independent page settings, committed reconfiguration and unmount;
  at most one layout commit subscription per active view and zero afterward.
  Existing native editable/input/canvas algorithms are retained; DOM emulation
  proves lifecycle only, not trusted input or glyph precision.
- Production: rerun the same cohorts and inequalities against the actual owner,
  plus source-built native pagination tests and input-to-settled-layout checks.
  No passing proxy permits dropping that execution gate.

Verification evidence:
Final planning rerun: six disposable probes passed, 298 assertions; current
pagination partition passed 58 tests, 213 assertions, four files. TypeScript 7.0.2
compiled the proposed declarations and import-only baseline in one program with
zero diagnostics and a stable Plite source fingerprint. These are planning and
current-source results, not implemented-target or native-browser proof.
Raw evidence, scope limits and final ledger/link checks are recorded below.

Open risks:
Native input during reflow, late browser fonts, custom renderer dimensions, occupied
overflow extents and exact-ref rebinding still require production proof. The
selected source-only and emulated-DOM probes do not certify them. Concurrent
React work briefly broke the import/type graph during this run; final reruns
passed, and S0 requires a fresh source identity before adoption.

Next action:
Execution and local proof are complete. No publication was requested or
performed.

Additional frozen fragmentation probe:
Before running its candidate, compare current packing with a disposable
single-pass packer over the same premeasured line/child heights: 20, 200, 1,000
blocks with four lines each and one 1,000-child block. Use the same 2 warmups,
9 interleaved pairs and 25%/5ms warm allowance above. Uniform-height geometry
must match; independent variable-height and overflow cases must have explicit
expected placements. Exactly one consumption per line/child, zero model writes.
This probes the packing law, not custom renderer correctness.

Additional frozen surface-paint probe:
Recorded before the corrected candidate run in the final audit. The operation is
publishing one changed pagination bucket in one of two paged surfaces while an
ordinary Editable shares the same inherited semantic-decoration manager.

- Baseline: the rejected immutable-map React context from the first plan. It
  preserves per-key slice references but changes the context value.
- Candidate: one stable private surface-scoped composite
  `PliteDecorationStore`. It merges the inherited semantic store with
  pagination buckets, retains the existing compiler, and publishes by
  `NodeKey`. `DecorationRegistrationContext` remains inherited.
- Cohorts: 20, 200 and 1,000 text keys across left paged, right paged and
  ordinary surfaces in happy-dom.
- Acceptance: changing one left bucket wakes/renders exactly that key; right
  and ordinary surfaces render zero times; publishing the same map wakes zero;
  an untouched merged snapshot retains identity; inherited and local
  subscriptions are zero after unmount. Record React renders and subscriptions,
  not memoized merge calls. This is a deterministic work-count gate; no browser
  paint or latency claim follows from it.
- Production: repeat through `EditableText`, `EditableTextFlow` and the DOM
  repair bridge, then run native input/selection proof. The disposable store
  cannot close those execution gates.

Additional frozen font-owner probe:
Recorded before the corrected candidate run in the final audit. Compare
per-view FontFaceSet observation with one private ref-counted owner per
`Document`.

- Cohorts: one and four views on one document, then views split across two
  documents; publish two font epochs and retire views in different orders.
- Acceptance: one listener set per live document, one shared Pretext-cache
  invalidation per document epoch, one invalidation per distinct engine per
  epoch, no notification to another document, and zero listeners/subscribers
  after the last view retires.
- Scope limit: a mock FontFaceSet proves lifecycle and fan-out only. Browser font
  readiness, actual glyph changes and settled page geometry remain production
  proof.

## Target and public calls

**Delete the public live layout controller and all page-break persistence.
`PagedEditable` owns its live derived layout. Headless callers receive a value
from `measurePages`.** The engine, projection data and page canvas remain private
mechanics of that job, except for the existing custom-engine boundary and the
data needed by independent previews and custom node renderers.

The normal Plate call is proposed, not implemented:

```tsx
import { useRef } from 'react';
import { EditorRoot } from 'platejs/react';
import { PagedEditable, usePageLayout } from 'platejs/pagination/react';

function DocumentPages() {
  const editableRef = useRef<HTMLDivElement>(null);
  const layout = usePageLayout(editableRef);

  return (
    <>
      <output>{layout ? `${layout.pages.length} pages` : 'Measuring…'}</output>
      <PagedEditable
        ref={editableRef}
        page={{ preset: 'letter', margins: 72 }}
      />
    </>
  );
}

<EditorRoot editor={editor}><DocumentPages /></EditorRoot>;
```

`ref` continues to identify the actual editable host, not its outer page canvas.
The hook is optional: a normal editor does not need it. The existing EditorRoot
owns commands, permission, canonical selection and view retirement. Pagination
does not create another provider around the ordinary call.

Customization remains on the same component:

```tsx
<PagedEditable
  page={pageSettingsField}
  typography={typography}
  fragmentation={fragmentation}
  renderElement={renderElement}
  pageView={{ mode: 'spread', gap: 24 }}
  renderPage={({ attributes, page }) => (
    <div {...attributes} className="paper">
      <footer contentEditable={false}>{page.index + 1}</footer>
    </div>
  )}
  virtualize
/>
```

`renderPage` renders page chrome only. It receives no `children`: document
content has one editable owner. Exact page data attributes and required sizing
are supplied in a typed `attributes` object and must be forwarded; canvas
placement remains private to the paged view. Default typography is applied by
the layout owner so the ordinary call's CSS and measurement agree. Custom
typography and node renderers must use matching fonts, line heights, wrapping
and dimensions.

Keep `virtualize?: boolean`, default false, on this explicitly paged component.
It permits both page and direct-child omission. Do not add an automatic threshold,
strategy enum, another paged component or a generic virtualizer integration.
Changing it preserves the exact host and active editable descendants. Ordinary
`Editable` remains complete and has no pagination policy.

The independent headless job is explicit:

```ts
import {
  createEstimatedPageLayoutEngine,
  measurePages,
} from 'platejs/pagination';

const preview = measurePages(editor, {
  page: { preset: 'a4', margins: 72 },
  engine: createEstimatedPageLayoutEngine(),
  fragmentation,
});
```

`measurePages` requires an engine, reads one coherent editor snapshot, returns
detached immutable layout data, and creates no subscription or disposal duty.
It throws measurement/validation failures to its caller. A caller may reuse a
measurement engine for its bounded caches; this does not create an editor
lifetime. The browser component selects the existing Pretext engine by default.
Neither path claims identical pagination across machines, browser glyph geometry,
or PDF/DOCX fidelity merely because it produced rectangles.

### Inference and exact surviving data

The [executable type sketch](artifacts/2026-09-15-pagination-design/api-sketch.tsx)
defines the proposed component, standalone call, provider, engine, snapshot and
fragment discriminants using live Plite editor/element/root types. The same
contracts cross the Plate facade by identity. Its `declare` bodies prove call
typing only; they are not product exports.

React context cannot infer a child component's TypeScript schema from its JSX
parent. Thread `TElement` through `EditableProps`, typography and
`fragmentation`.
A reused provider can be declared as
`NodeFragmentationProvider<ElementOf<typeof editor>>`; its callback parameters remain
inferred, and JSX infers the matching renderer element from that provider.
Inline `measurePages(editor, { fragmentation: (...) => ... })` infers directly from
the editor argument. Do not solve this with callback annotations or casts.

`PageLayoutSnapshot` contains `settings`, `pages`, `fragments`, `version` and an
optional named `root`. Omission addresses the primary root. It has no editor,
methods, raw document blocks, metrics, fingerprint, authority status or stored
page breaks. `version` is provenance, not a validity test by itself.

Fragment data is a discriminated union:

```ts
type PageLayoutFragment = {
  path: Path;
  pageIndex: number;
  rect: PageRect;
} & (
  | {
      type: 'text';
      lines: readonly {
        source: Range;
        rect: PageRect;
        runs: readonly { source: Range; rect: PageRect }[];
      }[];
    }
  | { type: 'atomic' }
  | {
      type: 'direct-children';
      children: readonly { path: Path; rect: PageRect }[];
    }
);
```

Snapshot rectangles are page-local CSS pixels. Pagination derives every atomic
owner and direct-child path from the coherent source snapshot; callers never
supply fragment identity. Text runs stay within one
canonical leaf; line ranges include consumed whitespace and hard breaks. Empty
lines retain valid insertion positions. Named-root ranges agree with the
snapshot root. The rendered-fragment hook translates rectangles into unscaled
canvas coordinates; DOM/client coordinates remain the exact mounted DOM owner's
job. `usePageLayoutFragments()` binds to the current rendered element and
returns only its mounted `{ pageIndex, rect }` placements. It accepts no path,
controller or snapshot and does not expose exact character geometry inside
atomic content.

Keep `PageLayoutEngine.compose` as the explicit advanced implementation boundary
for caller-owned page measurement/composition. Both built-in engines continue
to share the existing packer. Its input becomes the neutral
text/atomic/direct-children union in
the sketch; schema-specific elements, boxes, authority profiles and duplicate
line-count truth leave that boundary. The output uses the same fragment union.
Validate finite geometry, source ownership and content conservation once before
publication. Custom engines may not skip or duplicate source content.

An engine retaining environmental measurements supplies `invalidate()`; engines
without such caches may omit it. Pagination calls it on font/environment changes.
The built-in engine clears its own prepared/measured caches and Pretext's shared
measurement caches. This is a measurement implementation contract, not another
public refresh/scheduler handle. Current explicit Pretext white-space, word-break
and estimate customization remains advanced measurement policy; estimates never
become an authority or native-precision claim. Keep cache sizing private unless
execution finds an independent caller need.

## Fragmentation laws

The provider's output has exactly three forms. Atomic ownership and direct-child
partitioning are different laws, so the type says which one applies and never
accepts caller-authored paths:

```ts
type PageLayoutSize = Readonly<{ width: number; height: number }>;

type NodeFragmentationPlan =
  | { type: 'text'; keepTogether?: boolean }
  | { type: 'atomic'; size: PageLayoutSize }
  | { type: 'direct-children'; sizes: readonly PageLayoutSize[] };
```

The `fragmentation` provider receives the inferred element, its root-relative
path and page content dimensions. It does not receive synthetic boxes, a
measurement profile, the editor, guessed table dimensions, source identities or
placement coordinates. Returning `undefined` delegates to the default text
classifier, which still rejects a structure that is not a supported inline
flow. A table supplies one size for every direct row; an image supplies its
whole-owner size:

```ts
const fragmentation: NodeFragmentationProvider<ElementOf<typeof editor>> = ({
  element, content,
}) => {
  if (element.type === 'table') {
    return {
      type: 'direct-children',
      sizes: element.children.map((row) => ({
        width: content.width,
        height: measureRow(row, content.width),
      })),
    };
  }
  if (element.type === 'image') {
    return {
      type: 'atomic',
      size: { width: content.width, height: element.height },
    };
  }
  return element.type === 'code-block'
    ? { type: 'text', keepTogether: true }
    : undefined;
};
```

This is a schema-specific example. `measureRow` belongs with the schema
renderer and must compute the same deterministic visual size from the current
element and content width. A fixed row height supports only content that
actually fits it. The initial contract does not observe arbitrary renderer DOM
or infer a height from CSS after commit; that different job requires a custom
engine with an explicit invalidation source and corresponding native proof.

1. Text means one inline flow. Break between measured lines; consume each line's
   actual height. Do not flatten nested block containers into a fake paragraph.
   Default text layout is eligible only for an actual supported text flow.
2. `keepTogether` is soft: move a fitting block intact when the remaining page
   cannot fit it; a taller-than-page text block falls back to line breaks.
   Preserve the existing trailing-spacing rule and test it independently.
3. Atomic means the owner element is one indivisible semantic subtree.
   Pagination derives its source path and live key from the coherent snapshot.
   An empty semantic object uses this form; it cannot disappear through an
   empty array.
4. Direct children means every direct child is an element and the `sizes`
   array has exactly the same length and order. Pagination derives each child
   path by index. This makes duplicate, missing, overlapping, reordered and
   foreign path partitions unrepresentable. Reject text siblings, a length
   mismatch, and nonfinite or negative dimensions.
5. Supplied sizes describe actual rendered dimensions. Pagination owns
   placement. There are no caller `top`, `left`, `path`, `key`, `kind` or
   `split` fields.
6. Move oversized atomic content or a direct child to an empty page, place it
   once at its true size, and advance subsequent content to a new page. Never
   loop, crop it into invented fragments, or silently scale it.
7. The live view must leave overflow content reachable. Extend occupied width
   and height before positioning the next page/row; retain nominal paper size
   for chrome. In spreads place the second page after the first's occupied width
   and use the larger occupied height of the pair. This is local screen
   geometry, not a promise that oversized content prints on paper.
8. Row fragmentation requires independent direct children. A table with
   spanning cells that cannot satisfy that law uses `atomic`. Repeated headers,
   sliced images and within-row continuation have no current supported renderer;
   exclude them rather than advertise inert flags. Future support must account
   for occupied height and avoid duplicate editable identities.

`usePageLayoutFragments()` is the custom renderer read. It binds to the current
rendered element and returns exact mounted placements without a public path
lookup helper. Pagination owns text projection, block placement, native-flow
transitions, direct-child placement data and the permission to omit. The schema
renderer owns valid HTML/table structure, subtree contents and matching visual
measurement. Apply omission through existing `contentBoundary`/children slots
and canonical model clipboard coverage; no private `rowCount` control may
truncate the semantic partition.

## View lifetime and publication

The owning flow is:

```text
canonical editor snapshot + page settings + supplied measurement policy
    -> private paged-view derivation
    -> one page canvas and one mounted-fragment projection
    -> surface-local paint input + existing text compiler/DOM coverage
    -> committed layout value for exact-ref readers
```

- Resolve an explicit named root around the entire paged implementation before
  reading selection, settings, layout or paint. Reuse the existing named-root
  view mechanism once; do not independently select roots in the layout reader
  and the underlying windowed editable.
- Allocate one private layout lifetime per paged surface. Reuse committed
  configuration semantics and the existing editor commit subscription; abandoned
  React renders register no listener or environmental work. StrictMode replay
  must leave one connection per active view and zero after retirement.
- Derivation never calls `editor.update`. Subscribe only to document changes
  and the supplied page field's changes. Selection changes update active native
  flow and retention without recomposing all pages; scroll/zoom changes update
  the canvas/window without remeasuring text. Compare equivalent page values
  semantically so an inline object literal does not invalidate on every render.
- The canonical document, page configuration and provider callbacks are read
  coherently. If a callback reenters with a newer document/configuration, discard
  the older candidate before publishing it. Never label stale source paths live.
- Move the example's reusable text/block projection into pagination. Compute
  one projection for the mounted/required fragment set and produce keyed paint
  slices once. Per-leaf reads do not repeat `getFragments -> project -> decorate`.
  Retain existing bounded measurement caches and source-path remapping. This
  plan does not accept a new incremental cache, worker or scheduling subsystem.
- Add one private stable surface-scoped composite `PliteDecorationStore` at
  `EditableViewportSurface`. It wraps the inherited semantic store and the
  pagination bucket owner, merges both through the existing compiler, and
  publishes only changed `NodeKey` buckets with stable untouched snapshots.
  Keep `DecorationRegistrationContext` inherited so pagination cannot register
  another public source family. Do not register page positions in the ancestor
  EditorRoot manager: two Editables can share that manager. Do not create a
  second public manager, provider API, source list or compiler. A raw map-valued
  React context is rejected because every publication rerenders all consumers.
  The private keyed subscription adapter is required implementation plumbing;
  retire every inherited and local subscription with the surface.
- Normal structural font/spacing/position attributes belong to pagination;
  copied color, borders and other appearance remain in renderers/page chrome.
  Resolve attribute precedence explicitly: semantic mark/annotation paint must
  survive while callers cannot silently erase the required source association.
- Keep existing native-flow handling and stable input DOM when adopting the
  owner. Public timing knobs disappear. The target uses the current view work
  queue to coalesce publication without extending a text-input debounce deadline.
  Do not substitute the example's 120/360ms timer for measured responsiveness.
  Input-to-settled-layout proof is an execution gate; this plan makes no claim
  that the existing text-to-first-frame probe closes it.
- Retain selected, composing and explicitly requested content through page-window
  changes. Release it when that reason ends. Never accumulate every visited page.
  Native range mapping, caret hit testing and glyph geometry use the DOM owner;
  delete the public proportional-width `projectRange` method.

`usePageLayout(editableRef)` publishes `null` during SSR, before a matching layout
and text projection commit, while invalidated, after failure, and for a detached
or nonpaged host. A non-null value means current for the supplied measurements
and this exact mounted surface, not exact browser/export fidelity. Pending DOM
may retain the last safe projection for input continuity, but it is not exposed
as current geometry. Do not add a second public status object or old-layout cache
solely to keep a toolbar number visible.

Ref assignment is not reactive. Reuse the existing mount registration and
exact-ref geometry binding pattern so a toolbar mounted first, surface-only
unmount, ref replacement and StrictMode replay all notify correctly. Verify the
resolved runtime's host is exactly `editableRef.current`; an ancestor match must
not select a sibling or replacement. Hook consumers add layout-read listeners,
not one document subscription per toolbar.

Font observation belongs to the actual host document. Renderer callbacks do not
reliably expose which font faces they use, so one private owner per
`ownerDocument.fonts` observes readiness plus `loadingdone` and
`loadingerror` and publishes a coalesced font epoch to its paged views. Retire
that document listener when its last view leaves. Each distinct engine instance
invalidates once per epoch; the built-in Pretext path clears its prepared/block
caches and deduplicates Pretext 0.0.7's module-global `clearCache` once per
epoch. Clearing only the outer layout is insufficient because shared segment
metrics otherwise remain stale. Built-in initial rendering may use its
deterministic estimate internally for SSR and hydration, but the public live
read stays null until the matching browser layout commits. Complete mode still
mounts all canonical content; omitted mode retains the established deterministic
initial window and coverage contract.

Synchronous headless errors throw. Mounted asynchronous failures invalidate the
read and report through the existing `lifecycleErrorSink`, with an explicit
`source: 'pagination'` variant and `phase: 'measure' | 'publish' | 'cleanup'`.
Do not overload Editable's DOM `onError`, add a second sink prop or invent a
plugin identity. Keep the last safe native DOM while reporting a failure; a
subsequent valid configuration can recover, and failure never writes state.

## Maximum-cut comparison and owner ledger

| Concept | Decision and surviving owner | Rejected alternative / reason | Adoption and proof |
| --- | --- | --- | --- |
| Derived page-break authority | **Cut.** Canonical editor content and explicit page settings remain authoritative | Fixing hashes cannot make ignored stored breaks control composition; semantic page nodes would change document grammar | Remove reader/writer/codec/fingerprints and write filtering; verify zero derivation commits, undo and shared settings |
| Public live controller and hook assembly | **Cut/move.** Paged surface privately owns lifetime; `measurePages` owns one-shot derivation | Another pagination provider/plugin/session relocates the same assembly. Deleting headless measurement loses an independent job | Adopt example/guide/types/facades; connection and native retirement proof |
| Measurement implementation boundary | **Keep, narrow data.** Existing engine compose contract covers independent custom measurements and headless consumers | A second normal/advanced factory, text-only service or replacement engine would broaden this redesign without removing required measurement work | Keep one implementation path per engine, explicit invalidation and validated fragment output |
| Projection and native-flow assembly | **Move/consolidate.** Pagination plus the existing text compiler and one private surface-composite decoration store | Global registration leaks coordinates across shared-provider surfaces; raw map context rerenders every text; another public manager/compiler duplicates semantic paint | Single-pass receipt, keyed render/wake isolation and real native input gate |
| Boxes, split names and supplied unit positions | **Cut.** Text, atomic owner or exact direct children with caller-supplied sizes | Generic paths/continuations permit invalid partitions and advertise renderer capabilities that do not exist | Typed union, derived source paths, actual-height packing, conservation, table/media renderer proof |
| Canvas geometry and omission | **Keep at pagination.** Reuse page mount plan and DOM coverage | Generic measured-flow virtualization has the wrong coordinates; clipping overflow violates content reachability | Stable host, direct-child boundaries, scaled navigation, selected/composing retention and overflow extent |
| Geometry/read helpers | **Cut generic helpers.** PagedEditable privately arranges pages; snapshot data is already the headless read; renderers and controls use exact mounted hooks | No production caller independently uses public fragment lookup or page arrangement; decoration/projection/metrics/refresh helpers repair incomplete composition | Export/caller census; renderers use the current-element fragment hook and controls use the exact-ref read |
| New cache/scheduler/worker/DOM text engine | **Do not select.** Reuse current measurement and DOM/input owners | Neither the audit nor probes establishes a replacement algorithm; CSS-only removes the headless/custom-fragmentation job | Any later proposal needs a new frozen owner comparison; no performance promise from this plan |
| Plate package and feature ownership | **Keep exact facade.** Plite owns neutral mechanics | A Plate pagination plugin, kit or separate runtime has no independent job | Runtime identity, inferred declarations, root/subpath and copied-UI adoption |

CSS columns/print fragmentation may serve a separate print-only document, but do
not cover this live canvas plus headless/custom-fragmentation job. DOM measurement is a
valid future engine candidate; historical assertions that it cannot scale are
not evidence. Keep the existing engine because the proposed ownership cuts do
not require replacing it, not because browser measurement was disproven.

## Public cut and adoption inventory

The audit accounts for seven scope units. This plan keeps them one feature-sized
adoption: Plite implementation, Plate exact facades, their four exports and the
single raw example. No neighboring feature is merged into pagination work.

PagedEditable privately arranges the complete layout so overflowing fragments
expand occupied canvas dimensions while nominal page chrome stays fixed. The
public snapshot already gives headless consumers page and fragment facts.
`getPageLayoutGeometry` and `getPageLayoutFragments` have no independent
production caller and do not survive as public helpers.

The headless runtime surface is `measurePages`, `pageSettingsCodec`,
`createEstimatedPageLayoutEngine` and `createPretextPageLayoutEngine`. React
adds `PagedEditable`, `usePageLayout` and `usePageLayoutFragments`, with the
headless reexports. Keep data/authoring types only when reachable from those
contracts. The two engine factories use the same constructor naming law.

Delete `createLayout`, `useLayout`, `useLayoutSnapshot`, public `PageLayout`
controller methods, refresh reasons/delays, metrics/error sinks, page-break
snapshot/source/status/codec helpers, public authority profiles, all box/split
types, caller unit paths/keys/kinds/positions, public geometry/fragment lookup,
the inert page-renderer `children`, public decoration/projection/hit-testing plumbing and its coordinate-option
families. Inline page normalization,
`createPage`, preset-size/path-key and raw packing helpers into their algorithmic
owner. Their only surviving implementation callers do not justify exports.

`PageLayoutSnapshot`, fragments, engine input/output, typography and
fragmentation-provider types adopt the new data law. Remove duplicated full-block text,
optional-lines-plus-lineCount representations and redundant fragment IDs from
public output. Internal render keys remain stable source identities, never
path-plus-document-version keys that remount content after every commit.

Live owners to edit during execution:

| Owner | Exact adoption |
| --- | --- |
| [Headless pagination](../../packages/plitejs/src/pagination/index.ts) | One-shot derivation, controller/authority cuts, neutral provider/engine data, packing and invalidation; the superseded lifecycle helper is deleted |
| [Paged React](../../packages/plitejs/src/pagination/react.tsx), [page mount plan](../../packages/plitejs/src/pagination/page-mount-plan.ts) | Own options/lifetime/publication, selected fragments, overflow occupied extent and exact-ref read |
| [Editable surface](../../packages/plitejs/src/react/components/editable-text-blocks.tsx), [text renderer](../../packages/plitejs/src/react/components/editable-text.tsx), [text flow](../../packages/plitejs/src/react/components/editable-text-flow.tsx), [decoration context](../../packages/plitejs/src/react/decoration-context.tsx), [repair bridge](../../packages/plitejs/src/react/editable/decoration-repair-bridge.ts), [commit fence](../../packages/plitejs/src/react/components/editable-dom-commit-fence.tsx), [windowed adapter](../../packages/plitejs/src/react/components/windowed-editable.internal.tsx) | Private surface-composite store and named-root ordering, existing compiler and stable native host; changed-key wakes only and no public generic surface machinery |
| [Error contract](../../packages/plitejs/src/interfaces/editor.ts) | Pagination lifecycle error variant through the existing sink |
| [Plate headless facade](../../packages/platejs/src/pagination/index.ts), [React facade](../../packages/platejs/src/pagination/react/index.ts) | Exact identity; no wrapper implementation |
| [Raw example](../../apps/www/src/app/(app)/examples/plite/_examples/pagination.tsx) | Delete controller/publisher/per-leaf projection and refresh controls; adopt direct view props and exact-ref diagnostics; retain page chrome, typography and schema fragmentation |
| [Guide](../../content/docs/(guides)/pagination.mdx) | Real ordinary paged recipe first, custom nodes and explicit omission, separate headless estimate; current-state prose only |
| [Plite pagination reference](../plite/reference/public-docs/libraries/plite-pagination/index.mdx), [why-this-fork map](../plite/reference/public-docs/why-this-fork.mdx), [performance walkthrough](../plite/reference/public-docs/walkthroughs/09-performance.mdx), [virtualization reference](../plite/reference/public-docs/libraries/plite-react/virtualized-rendering.mdx), [active PR description](../plite/references/pr-description.md) | Remove old reader/page-break/box teaching; use the same direct view, explicit omission and headless operation. Preserve immutable review records and dated historical plans as history |
| [Generated pagination docs](../../apps/www/public/r/pagination-docs.json), [generated registry docs](../../apps/www/public/r/registry-docs.json), [generated registry](../../apps/www/public/r/registry.json) | Regenerate through `pnpm --filter www build:registry` when source changes produce them; never edit by hand |
| [Pagination tests](../../packages/plitejs/test/pagination/page-layout-contract.test.ts), [React fragments](../../packages/plitejs/test/pagination/react-fragments-contract.test.tsx), [Pretext tests](../../packages/plitejs/test/pagination/pretext-page-layout-engine.test.ts), [package config](../../packages/plitejs/test/pagination/package-config-contract.test.ts) | Replace controller/authority observations with surviving laws; preserve measured-run path remapping and prove atomic/direct-child lowering, exact current-element reads and package reachability |
| [Browser pagination](../../apps/plite/tests/plite-browser/donor/examples/pagination.test.ts) | Adopt new diagnostics and strengthen settled-layout, root, font, input and overflow assertions |
| [Entrypoint DAG](../../tooling/entrypoints/entrypoint-dag.mjs), [artifact checker](../../tooling/scripts/check-plite-release-artifacts.mjs), [artifact checker tests](../../tooling/scripts/check-plite-release-artifacts.test.mjs), [Plite type smoke](../../packages/plitejs/test/public-package-types-smoke.ts), [Plate import smoke](../../packages/platejs/test/public-package-import-smoke.slow.ts) | Update actual constructor recipes and symbol membership, runtime facade identity and consumer inference |

The feature subpaths remain the dependency boundary. No new package or engine
subpath is justified by this consumer inventory. The existing pagination import
still reaches Pretext: do not claim a custom-engine import works without that
feature dependency until packed proof demonstrates it. Public guide/reference
changes can alter generated registry docs on `next`; run
`pnpm --filter www build:registry` and include only the output it produces.
Run `pnpm brl` if execution changes exported files. Never edit generated
templates or registry outputs by hand.

## Execution packet

Execution was authorized and completed in the same task/plan. No compatibility
bridge survived S4.

| Slice | Entry and owner | Exit | Focused proof |
| --- | --- | --- | --- |
| S0 — freeze current source | Plite Plan; recheck concurrent React edits and import/type graph | One coherent source identity and rerunnable package/browser harness; preserve earlier failed results | Current partition, source type graph and saved design probes; no repair of another person's assigned work |
| S1 — pure layout and fragments | Headless pagination; typed target resolved | One-shot immutable result, zero writes/subscriptions; text/atomic/direct-child plans; caller paths impossible; no authority protocol | Geometry/conservation, keep-together/oversize/empty cases, size/count/child validation, engine caching/path remap, inferred callbacks |
| S2 — exact paged lifetime and local paint | Plite React; S1 data available | Root resolved once; component owns layout, input/retention intact; one projection and one stable private composite store; page renderer receives exact identity/size attributes and no inert children | StrictMode/reconfiguration/unmount, one changed-key wake/render, stable untouched snapshots, two paged plus ordinary surfaces, two editors, exact-ref rebinding, forwarded page attributes and source-matched cost cohorts |
| S3 — readiness and native geometry | Same owner; S2 integrated | Ref-counted per-document font epochs, monotonic matching publication, null stale reads, reachable overflow and correctly scaled navigation | Delayed font fixture, one shared invalidation per epoch, ref-only mount changes, live error recovery, native caret/selection/IME path and complete clipboard |
| S4 — full consumer hard cut | Plite/Plate facade plus app/docs | Example contains appearance/schema policy only; no public old controller/split/authority/geometry paths; Plate guide, Plite reference and generated registry docs agree | Symbol/consumer sweep, barrel and registry generation when needed, documentation links, public type and packed-runtime contracts |
| S5 — final production proof | Verify Plate and embedded Benchmark | Exact frozen owner comparisons rerun on production source; affected native rows, package and closure gates pass | Same cohort/budget commands plus trusted input through settled layout; record serving-source identity and skip/deferred rows honestly |
| S6 — doctrine and ledger closure | Task through Best API doctrine repair | Teaching, generated mirrors and versioned doctrine agree; adoption status reflects shipped proof | Smallest source-rule repair, required doctrine append/regeneration, ledger freshness/render/check and final plan checker |

S1–S3 may use a private temporary adapter to the old projection data solely while
the new union is adopted. It must be unexported, owned inside pagination and
deleted in S4 before public proof. No public overload or deprecated alias survives.
Rollback means reverting the failing unmerged slice and reopening its evidence;
it does not mean shipping both public APIs. Preserve explicit page-settings data
and codecs. There is no need to rewrite documents to remove derived break fields;
application-owned stored extra fields may remain inert data outside pagination.

### Production proof contract

| Claim | Required acceptance |
| --- | --- |
| Read-only derivation | Mount, refresh-equivalent inputs, scrolling, font load, disposal and headless measurement cause zero document/state/history/collaboration writes; explicit page-setting commands still work |
| Complete source conservation | Text offsets including trailing whitespace/newlines and every atomic/direct-child subtree occur once, in order; named-root paths agree; no rowCount clipping or duplicate editable header copies |
| Native lifetime | Preserve actual host/Text identities, selection direction, active caret and composition across pagination, window movement, option changes and remote edits; next trusted input yields exact expected text |
| Per-surface isolation | Two differently configured paged Editables and ordinary Editable under one provider, separate EditorRoots on one editor, and two independent editors; one affected keyed paint wake/render, zero sibling/unchanged wakes, stable untouched snapshots, no geometry/permission or retired-view leakage |
| React configuration | Equivalent props, changed page field, root changes, aborted renders, StrictMode, controls before view, ref replacement and surface-only unmount |
| Font/measurement truth | Cold versus loaded font changes page placement; one listener owner per document and one shared Pretext clear per document epoch; each distinct engine invalidates once; custom engine failure/recovery; zero unsupported exact-glyph or cross-machine assertions |
| Fragment rendering | Editing changes a deterministically measured row's height and page placement; selection crosses a page; table/media overflow remains visible and selectable; full content on clipboard in both complete and omitted modes; unsupported rowspans use honest atomic layout. Arbitrary DOM-measured renderer height is outside the built-in contract |
| Omission and reachability | Complete mode includes final offscreen marker and every row; omitted mode obeys DOM coverage, model clipboard and target materialization; release no-longer-required pages; native Find/print/AT claims need their actual corresponding evidence |
| Engine/computation | Same frozen text/atomic/direct-child cohorts and allowances as the prototypes; preserve one mounted projection, changed-key paint publication and bounded cache retention; atomic/direct-child content bypasses text traversal and canvas measurement |
| Native latency | Fix the current probe so it ends only when accepted input, document version, current configuration/font epoch, published layout and next painted geometry agree. Record key-to-model, key-to-paint and key-to-settled-layout separately; no delayed repair hidden behind first visible text |
| Scale breadth | Normal page document, rows=800, 990/1,000-page fixture, one long paragraph and a large single table; independent page/block/leaf/direct-child/mounted-node counts. Compare complete and omitted arms on the same source and fixture |

The cost probe's fixed relative/absolute inequalities must also hold after the
production cut. Native comparative packets use the same baseline/candidate
fixtures, source-built host, viewport/DPR, fonts and action. Freeze native
materiality before reading the candidate: no p95 regression beyond both 25% and
16ms, with exact input/convergence correctness. Retain any existing stricter
target budget. Use five retry-free native packets; do not manufacture p99 from
small samples. A failed settled-layout or correctness guard keeps the slice open
even if first-text paint is faster. This is not a repo-wide Benchmark run.

Commands from repository root, using existing owners:

```sh
pnpm --filter plitejs test:partition:pagination
pnpm --filter plitejs typecheck:partition:pagination
pnpm --filter plitejs typecheck:partition:react
pnpm --filter platejs typecheck:partition:pagination
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/pagination.test.ts
pnpm --filter www build:registry
pnpm plite:release:packages
```

Use the existing Vitest React runner for affected decoration/view/ref contracts
(`bun run test:react test/react/<file>.test.tsx` from `packages/plitejs`). Select
the exact files named above, including decoration rendering, editor-root lifetime
and range geometry, then run the owning strict handoff lane `pnpm check:plite`.
The source-based browser matrix remains the broader closure gate; all 44 current
pagination cases explicitly require Chromium, and drag autoscroll is additionally
opt-in. Adding another browser to a command does not make skipped cases proof.
Physical-device/IME, native Find UI, print preview and accessibility traversal
remain separate claims and require their actual tools. They are not certified
by these planning artifacts or an emulated composition event.

### Doctrine repair on execution

Before closing the API migration, use Maintain Workflow for the smallest source
instruction repair: `.agents/rules/best-api.mdc` and the Plite/Plate planning or
UI/docs rules that actually teach the rejected assembly. Audit references to
page-break authority, required createLayout/useLayout, boxes/splits, shared
pagination decoration registration and public timing knobs. Update
`docs/vision/plite.md` and only essential root/common wording when durable law
changed; preserve existing history. Append the required Plate Next doctrine
version for its changed source set, retain old package attestations, regenerate
with `pnpm install`, and prove source/mirror agreement. Planning does not rewrite
current implementation teaching as though the target already exists.

## Design evidence and final review

All probes are disposable planning artifacts, not additions to the product test
suite. No existing test or production source was deleted or edited.

| Probe | Observation | Claim limit |
| --- | --- | --- |
| [Derivation/projection](artifacts/2026-09-15-pagination-design/scale-probe.json) | Five cohorts pass frozen cold/warm allowances; 161 assertions; identical snapshots and decoration ranges, zero editor mutations | Estimated engine and all synthetic leaves consumed; no native paint or speed claim |
| [Reader lifetime](artifacts/2026-09-15-pagination-design/lifetime-probe.json) | External/owned location, one/four views, StrictMode and reconfiguration; 24 assertions; one connection per active view, zero after unmount | Existing view implementation in happy-dom; does not prove the new exact-ref hook |
| [Packing](artifacts/2026-09-15-pagination-design/fragmentation-probe.json) | Four matched cohorts; 22 assertions; uniform geometry matches, variable heights/keep-together/oversize consume once; atomic/direct-child paths derive and malformed sizes/counts/children reject | Premeasured packer and disposable provider lowering only; renderer agreement remains a production obligation |
| [Local paint](artifacts/2026-09-15-pagination-design/paint-probe.json) | 20/200/1,000 keys across three surfaces; 57 assertions; raw context renders every left consumer while the composite store renders one changed key, zero siblings/unchanged, stable untouched snapshots and zero retained subscriptions | Actual semantic manager plus disposable composite store in happy-dom; production EditableTextFlow and native input remain unproved |
| [Font invalidation](artifacts/2026-09-15-pagination-design/font-probe.json) | 13 assertions: mocked width change requires shared plus local cache invalidation; one/four-view and two-document owner cohorts deduplicate listeners and distinct-engine fan-out | Installed Pretext with synthetic canvas plus mock FontFaceSet owner; no browser readiness or glyph-fidelity claim |
| [Occupied geometry](artifacts/2026-09-15-pagination-design/geometry-probe.json) | 20/200/1,000 pages, single/spread; 21 assertions; ordinary geometry matches, oversized horizontal/vertical extents avoid overlap and meet frozen allowances | Pure geometry; browser reachability still requires actual rendering |
| [Type sketch](artifacts/2026-09-15-pagination-design/type-proof.json) | Final combined compiler program passes, including inferred node/renderer callbacks and negative cases, with a stable source fingerprint | Declared proposed signatures, not packed implementation; intermediate unrelated React errors were preserved and the final rerun passed |

First-packet projection p95 in milliseconds, nine interleaved samples per arm
([preserved original receipt](artifacts/2026-09-15-pagination-design/packet-1/scale-probe.json)):

| Cohort | Current assembly | Single projection | Projection calls, current → proposed |
| --- | ---: | ---: | ---: |
| 20 blocks, four leaves | 0.45 | 0.28 | 81 → 1 |
| 200 blocks, eight leaves | 12.30 | 2.58 | 1,601 → 1 |
| 1,000 blocks, eight leaves | 44.14 | 14.71 | 8,001 → 1 |
| One block, 200 leaves | 15.16 | 0.87 | 201 → 1 |
| One table, 1,000 direct children | 0.20 | 0.27 | 1 → 1 |

The table row does not improve; its small difference passes the predefined noise
allowance. The material signal is eliminating repeated text projection, not a
blanket faster-engine claim. The scale receipt records Bun 1.3.12, host identity,
raw samples and eleven selected before/after hashes. Preserve the frozen script
as the baseline and compare the production owner using an explicit adapter;
never regenerate a new baseline from changed source and call that the same run.

Three independent same-model source workers supplied bounded fragmentation,
view-integration and final adversarial challenges. The lead incorporated
direct-child conservation, variable line heights, font-cache invalidation,
exact-host binding, named-root ordering and the shared-provider paint leak. The
final challenge exposed that the first paint probe counted memo merges while
React still rendered every context consumer, and that caller-authored unit paths
made invalid partitions expressible. Workers did not implement product code. No
cross-model panel or Autoreview ran; next forbids Autoreview.

The sharpest remaining risk is native input while projection changes. A
well-typed component and faster preparation do not prove that behavior. The plan
therefore preserves the existing input owner and makes matching native/settled
geometry proof mandatory before retiring the old implementation.

Final verification and recovery:

- Six disposable source/design probes: **6 passed, 0 failed, 298 assertions**.
  Their original separate-run receipts are preserved under `packet-1`; the final
  combined rerun updates the corresponding latest receipts. The later rerun
  overlapped the package correctness runner, so use the first interleaved packet
  for the reported timing table; both pass the frozen comparison allowances.
- `pnpm --filter plitejs test:partition:pagination`: **58 passed, 0 failed,
  213 assertions, four files** on the final rerun. The earlier intermediate run
  reached 10 passes and two import errors while another change temporarily left
  `react/index.ts` referencing a missing history hook. No unrelated source was
  repaired by this task.
- `node docs/plans/artifacts/2026-09-15-pagination-design/check-types.mjs`:
  **pass**, zero proposed or source diagnostics, stable source inventory hash.
  Earlier individual checks saw transient composition/input type errors; the
  final combined program supersedes those results for its recorded identity.
- Harness-only recovery: the relocated prototype needed explicit resolution of
  its package-local Pretext dependency; the JSX probe needed its React binding;
  TypeScript 7 exposes no legacy compiler API, so the type receipt uses its real
  CLI. None required modifying product code or relaxing assertions/budgets.
- No browser, physical device, packed release, publication, root-wide test or
  implementation claim is made by this planning run.

### Execution evidence — 2026-09-16

S0-S6 replaced the planned surface in production. `PagedEditable` owns live
layout, page paint, exact-host publication, font epochs and explicit page
omission. `measurePages` is the one-shot headless operation. Fragmentation is
text, atomic or direct children, and pagination derives every source path. The
old live controller, page-break authority, geometry/path readers, boxes, split
values, scheduling controls and caller decoration publisher are absent from
current package, app, tooling and documentation consumers.

- `pnpm --filter plitejs test:partition:pagination`: **37 passed, 0 failed,
  102 assertions across four files**. This includes exact-host reads, sibling
  surfaces, named roots, direct children, font-owner fan-out, shared
  invalidation, lifecycle errors, deep immutable snapshots and custom-engine
  validation. A production cost run exposed and repaired an exact leaf-boundary
  range error; its regression remains in the package suite.
- [Production cost receipt](artifacts/2026-09-16-pagination-implementation/production-cost.json):
  **one test, 41,693 assertions** over the frozen normal, large, stress,
  wide-block and 1,000-row cohorts. Every text offset and direct child is
  conserved once, editor writes remain zero and source hashes match. The
  1,000-block result records 19.41 ms warm p95 against the frozen 19.71 ms
  ceiling and 19.86 ms cold against 21.40 ms.
- Focused Chromium: pagination **4 passed, 0 skipped, two bounded batches**;
  query controls **6 passed, 0 skipped** after deleting the last stale
  `media_split` expectation. Trusted input reflows, complete-to-omitted host
  identity, table child conservation, model clipboard and oversized atomic
  reachability pass on the source-built app.
- `pnpm plite:release:packages`: **pass** for four packages, 89 public
  subpaths, 84 runtime entrypoints, 45 React-free headless entrypoints, 42 exact
  optional-peer closures, declarations, SSR and tree shaking. `pnpm --filter
  www build:registry` and `pnpm brl` pass with generated outputs.
- `pnpm check:plite:contracts`: **256 Node contracts and 25 Bun benchmark
  contracts passed**, followed by current public-type package builds.
  `pnpm check:plite` also passed all 96 typecheck tasks, then stopped in the
  unrelated history partition because its README contract expects
  `state.history.hasUndo()` while current history docs use
  `editor.read.history.hasUndo()`.
- The first full Chromium closure run passed 46 bounded batches before finding
  the stale pagination query assertion above. Its focused repair passes. The
  next full run passed eight batches and then correctly invalidated when an
  unrelated concurrent update changed
  `apps/www/src/registry/components/editor/slash.spec.tsx`. No full-matrix claim
  is inferred from either interrupted run; pagination's own bounded source
  proof is complete.
- Best API, Plite Plan, Plate Plan and Plite Vision teach the surviving
  ownership. Plate Next doctrine version **201** records the migration checks;
  `pnpm install`, doctrine validation and required-resource parity pass without
  changing package attestations.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Scope and source authority | yes | Direct design-plan request; current pagination audit, live owners and seven ledger units |
| Scale applicability | yes | Projection, measurement, packing, geometry, keyed surface paint, font-owner fan-out and view lifetime; frozen contracts and executable disposable comparisons |
| Independence | yes | Three bounded same-model source reviewers, consumed and closed; lead alone writes plan/probes |

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Public design and hard cuts | yes | Target calls, complete concept dispositions and export/adoption inventory |
| Pre-acceptance owner proof | yes | Matched derivation, packing and geometry; lifecycle, keyed paint and per-document font-owner guards; scope limits explicit |
| Type design | yes | Final combined proposed-signature/import baseline passes with a stable source fingerprint |
| Production readiness | complete for pagination | Production cost, package, packed release and focused source-built Chromium proof pass; unrelated aggregate interruptions are recorded above |
| Doctrine repair | complete | Source rules, Plite Vision, doctrine v201 and generated mirrors agree |
| Autoreview/publication | no | Prohibited on next / not requested; no review helper, commit or external action |
| Artifact closure | yes | Ledger render/check, relative-link validation and Task completion checker recorded in the final receipt |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current audit, source, consumers and proof inventory | Settled |
| Decide | complete | Typed target, maximum-cut comparison and bounded independent challenges | Settled |
| Execute | complete | S0-S6 runtime, consumer, docs and doctrine adoption | Settled |
| Prove and hand off | complete | Focused native, cost, type, package, packed and ledger proof; aggregate interruptions recorded | No publication requested |

Final handoff:
Pagination owns one live view and one projection; headless callers measure once.
Page-break persistence, live controller assembly, caller fragmentation paths,
generic geometry/path lookup and inert split/box protocols are cut. Atomic and
direct-child plans derive identity from the document; one private composite
store localizes paint by key. The production implementation, focused browser
behavior, package surface, packed artifacts, generated docs and doctrine are
proved locally. No publication was requested.
