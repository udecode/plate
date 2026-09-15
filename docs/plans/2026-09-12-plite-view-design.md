# Plite view geometry and React setup

Status: Complete
Mode: Task execution; Plite Plan with embedded Benchmark and Verify Plate proof.

Objective:

Choose the smallest truthful Plite view API and architecture for direct-domain
geometry and React mounting, with exact lifetime ownership, Plate/Yjs adoption
and executable evidence. The user's `go $task` accepts the broader design/plan
handoff discussed after the plite-view review and routing repair.

Completion threshold:

A source-grounded target, resolved alternatives and owners, implemented call
sites, complete consumer adoption and source-bound production, package and
browser proof. This execution implements the accepted migration directly.

Verification surface:

Live Plite React providers, view construction, geometry and domain adapters;
Plate facade/React consumers; authored projections and shared roots; package,
type, docs, generated-output, packed-release and managed browser tests.
Disposable probes validate only their stated owner and workload.

Constraints:

- Preserve one canonical document, exact mounted view identity, root routing,
  authored input/projection policy, selection semantics, ordered callbacks,
  read-only retirement, SSR/null behavior and announcement lifetime.
- Start from user jobs and hard laws. Current Widget and Runtime structure is
  evidence, not a required target. No public compatibility aliases or replacement
  generic target registry.
- Keep math, emoji and other independent Plate features separate. Geometry
  adoption may change their call sites only where this shared API requires it.
- One existing checkout and plan; no commits, publication or app messages.

Boundaries:

Plite owns document/view/DOM mechanics and React effects. Canonical selection,
annotation and keyed cursor sources retain semantic ownership. Plate owns its
facade, plugin policy, callbacks and copied UI composition. Native input,
selection representation, history, accessibility policy and rendering omission
are preserved obligations rather than independent redesign projects.

Blocked condition:

An unresolved decision-changing runtime result or missing executable owner
prevents declaring the affected target ready. Continue source and disposable
proof work while it can resolve the question; record the exact gate if evidence
is inconclusive.

Work Checklist:

- [x] Capture the latest user correction, scope and planning authority.
- [x] Ground every current-state and consumer claim in live source, including
  independently mounted authored projections and Plate callback scope.
- [x] Compare delete/merge/inline/reuse/replacement for the public nouns and
  their owners; choose exact imports and inferred normal/custom/advanced calls.
- [x] Assign one owner per responsibility and resolve each concept decision.
- [x] Run the scale-sensitive current-owner/target comparisons with frozen
  cohorts, budget, source identity, deterministic work and correctness guards.
- [x] Map all public breaks to package/facade, consumer, docs, doctrine and proof
  adoption; name the deletion cone and justify each surviving boundary.
- [x] Define verifiable implementation slices, realistic failures, rollback and
  production/browser proof, including final reruns of probe contracts.
- [x] Reconcile acceptance, inspect final plan, validate its structure and
  prepare the handoff with exact evidence limits.

Requirement sources:

[Task workflow](../../.agents/rules/task/references/workflow.md),
[complex-work method](../../.agents/rules/task/references/complex-work.md),
[Best API](../../.agents/skills/best-api/SKILL.md),
[Plite Plan](../../.agents/skills/plite-plan/SKILL.md),
[performance pack](templates/packs/performance-observability.md) and
[embedded Benchmark method](../../.agents/skills/benchmark/references/methodology.md).
Performance-pack obligations are tracked in the scale checklist and receipt,
not in a duplicate checklist. There is no production telemetry or private user
data in this synthetic planning probe.

Decision brief:

Remove the public Widget carrier and React Runtime handle. Their direct-owner
paths pass the scoped design probes. Keep document, exact-view and mounted React lifetimes
distinct. Public setup names an editor; root and authored props configure an
independent mount through the existing core view owner. Geometry reads canonical
domain targets and measure against an explicit Editable ref.

## React target

The ordinary path retains its current imports and two components:

```tsx
import { Editable, EditorRoot, useEditor } from 'plitejs/react';

const editor = useEditor(options);

<EditorRoot editor={editor} onValueChange={({ value }) => save(value)}>
  <Editable />
</EditorRoot>;
```

Named content remains available as `<Editable root="notes" />`. A toolbar and
editor that need the same configured root share their mounted root:

```tsx
import { Editable, EditorRoot, useEditor } from 'plitejs/react';

const editor = useEditor(options);

<EditorRoot editor={editor} root="notes">
  <Toolbar />
  <Editable />
</EditorRoot>;
```

Independently configured projections use the same mount grammar. The editor in
this example installs the authored capability through `options.extensions`:

```tsx
<EditorRoot editor={editor}>
  <EditorRoot
    editor={editor}
    authored={{ intent: 'propose', projection: 'proposed' }}
    readOnly={readOnly}
  >
    <ReviewToolbar />
    <Editable />
  </EditorRoot>
</EditorRoot>;
```

The outer root supplies shared React scope; separate top-level roots retain
independent React lifetimes. The mounted context view's existing
`api.authored.setView(...)` changes projection/input policy without replacing
that view when policy is managed imperatively. An explicit JSX `authored` prop
is the controlled policy and reconciles through the existing authored owner.
Replacing the document uses a keyed owner remount; switching root retires the
old root's command view. Reusing an input across mounts shares the document,
while each mount owns independent selection, read-only and retirement state.

`EditorRoot` requires `editor` and retains root/authored/readOnly, children,
decorations and callbacks. Remove its public context-only mode. Internal named
Editables and content slots use the private child-view mount directly. The core
`createEditorView` constructor remains useful for headless and static views;
React props adapt to that same owner, without duplicating policy storage.
Named-root props exclude the public `main` literal, and authored options require
the authored capability. Inference follows the supplied editor's capabilities.

Passing a configured core view supplies document and initial configuration,
not its mutable mounted command lifetime. Exact native adaptation remains a
private primitive for retained/native work. No application in the bounded
source census mounts a caller-created configured view interactively; current
application multi-view jobs use root/authored props. Source-default timing and
unrelated-rerender behavior are proved in the lifetime probe: source defaults
are captured per editor input, and a later source policy change or unrelated
parent render cannot become a second controller. Explicit props override those
initial defaults. A new input/root creates a new mounted lifetime; retired
facades and captured update methods remain unable to write after remount.

Remove `Runtime`, `useRuntime`, `RuntimeValue`, `RuntimeProps` and
`UseRuntimeOptions`. The private provider receives the editor directly, removing
both copies of its forwarded-method object. This cut does not authorize a global
React singleton or a new public document/view manager.

### Alternatives and surviving boundaries

| Candidate | Decision and hard-law/current-job reason |
| --- | --- |
| Keep Runtime but rename it | Reject: the editor already exposes every forwarded method. Renaming retains a second setup handle. |
| Make every Editable construct a document | Reject: projections and content roots must share canonical document, history and collaboration. |
| Remove EditorRoot and make callers mount contexts themselves | Reject: controls, callbacks, decoration registration and announcement scope have a shared mounted lifecycle independent of text DOM. |
| Add another public DocumentProvider or ViewManager | Reject: the existing root component can own React scope; the core view constructor already owns configured view behavior. |
| Require an editor on every public EditorRoot | Preferred syntax: one explicit dependency; internal nested root rendering stays private. Each mount uses the existing private core-view constructor. |
| Keep root/authored configuration in core and JSX entry points | Retain: JSX is an adapter into the core policy owner. Independent React lifetimes are a proven current job; two syntaxes do not require two mutable owners. |
| Mount the supplied configured native runtime directly | Reject as the public default: simultaneous mounts share read-only state and one cleanup locks another. A one-live-mount check cannot stop sequential remount from reviving captured commands. Keep exact private adaptation for its native/retained job. |
| Factor authored identity from mutable command lifetime | Reject for this scope: current interactive apps do not require preconstructed native-view identity. It would redesign authored state to retain a proposed public path, while independent core views already serve the job. |
| Pool private providers globally by document identity | Reject: separate React branches own separate announcements, effects, cleanup and control scope. Same-document nested roots may reuse their nearest provider. |
| Delete private selector queues, root registration or authored fragment lifetimes | Reject absent evidence: committed delivery, exact routing and retained fragment ownership have distinct current jobs. This plan removes public setup duplication while probing the preserved machinery. |
| Merge every selector into one subscription API | Reject in this scope: exact-view context reads, document-runtime reads and explicit-editor reads have different existing invalidation/subscription laws. Removing the Runtime handle requires removing phantom RuntimeValue generics, not rebuilding all selector machinery. |

Keep `useRuntimeState` as a document-runtime selector, `useRootState` for
root-filtered reads, `useEditorState` for nearest-view reads,
`useEditorRuntimeState(editor, ...)` for explicit-editor commit subscriptions,
and `useEditorViewState` for transient view changes. These hooks expose values,
not another editor handle. Context-only hooks infer the selector result and
cannot take a generic claiming capabilities absent from a typed input.
`RuntimeStateSelectorOptions` loses its RuntimeValue generic. Exact extension
reads use descriptor inference; explicit-editor reads preserve their correlated
editor generic. The target retains their current event sources, queues and
filter semantics, so this type repair is zero-runtime.

Apply that same rule to touched context-only root/editor/effect signatures:
remove caller-selected value/extension generics that are supplied only to a
context assertion. Keep result, command and root-key generics that correlate
with actual inputs. Do not replace those assertions with callback annotations
in consumers or a newly exported editor variant.

### Source facts that constrain adoption

- [EditorRoot](../../packages/plitejs/src/react/components/plite.tsx) currently
  forbids editor plus root, permits context-only mounting and allocates a second
  forwarded Runtime object for ordinary editor input.
- [Runtime provider](../../packages/plitejs/src/react/hooks/use-plite-runtime.tsx)
  owns shared root registration, version-ordered publication, selection cache,
  view effects, authored fragment leases and one announcement host per provider.
  Same-document nested Runtime providers currently collapse into their parent.
- [Core view construction](../../packages/plitejs/src/editor-runtime-view.ts)
  owns root, read-only and authored state. Calling it with empty options resets
  root/read-only defaults; a mount must preserve selected policy while creating
  its own mutable command lifetime.
- [Authored view tests](../../packages/plitejs/test/react/authored-view.test.tsx)
  cover exact proposed selection, unchanged accepted content, shared policy
  between native view and React facade, live policy change and undo/redo.
- [Plate root](../../packages/platejs/src/react/components/Plate.tsx) independently
  observes document commits. Its content adapter creates a private Plite root,
  then captures and registers that root's context view for command/render/DOM
  targeting. Preserve that exact mounted view after capture and Plate's separate
  complete-document callback owner.
  [PlateRoot.internal](../../packages/platejs/src/react/components/PlateRoot.internal.tsx)
  and the [private component bridge](../../packages/platejs/src/react/internal/plite-components.ts)
  are the exact adoption sites; they need no public Runtime replacement.
- [Selector tests](../../packages/plitejs/test/react/plite-runtime-provider-contract.test.tsx)
  cover deferred cancellation, root filtering, changed filters and commits from
  child layout effects before provider subscription. A generic direct subscription
  substitution would lose this existing proof and is outside the selected cut.

### React design evidence

The [resolution report](artifacts/plite-view-design/react-resolution-report.md)
and [frozen contract](artifacts/plite-view-design/react-resolution-contract.md)
compares exact-handle mounting, independent core views per mount, and factoring
authored identity from command lifetime. The exact-handle candidate reproduced
shared read-only state; a guard against simultaneous mounting still allows
sequential remount to revive a captured facade. Those counterexamples reject
that public mount grammar. The initial failed direction and its measurements
remain in the [original report](artifacts/plite-view-design/react-report.md).

Candidate B uses one independent core view per mount. Its final guard run
passes **18/18 tests**: existing behavior, independent shared-source mounts,
sequential retirement, root switching, live authored props/API, initial source
defaults, separate React roots and announcements, and the actual Plate
mounted-command/model-callback adapter. The Plate probe confirms text/commit/value
notifications and command identity without treating raw Plite callbacks as
complete-document Plate callbacks. A separate unchanged-candidate addendum
also exercises node and selection notifications; all five callback kinds retain
the raw model owner. Named-root/metadata payload breadth remains execution proof.

The final [matched summary](artifacts/plite-view-design/react-resolution-summary.json)
contains eight cohorts: 1/2/8/32 views in shared and independent provider layouts,
four alternating packets and 16 measured samples per side/cohort. All 32 phase
comparisons pass the frozen regression rule: failure requires added p50 to
exceed 25%, 2 ms and baseline interquartile spread. Shared 32-view mount p50 is 23.155 → 23.304 ms;
commit p50 is 9.090 → 9.623 ms. Independent 32-view mount is 24.713 → 25.479 ms.
These results support the bounded lifetime simplification, not a speed claim.
The small sample makes p95 diagnostic; no tail-latency or browser-frame budget
is claimed.

Replacing a shared outer Runtime with EditorRoot adds one mounted view, two
snapshot subscriptions and one view publication per commit, constant across N.
It retains one provider and one announcement host. Independent layouts keep N
providers/views/announcement hosts; cleanup returns React leases to baseline.
The ordinary fused mount also changes context identity from raw input to its
independent mounted view. This is an intentional lifetime rule and requires
package/public documentation proof during implementation.

The prior current-source provider/authored/announcement/read-only selection ran
66 existing tests successfully. That is baseline evidence. The final in-memory
candidate and actual Plate adapter probe establish design feasibility; execution
must run actual production providers and public types after the cut, preserving
the same guards and frozen timing contract.

The [React baseline archive](artifacts/plite-view-design/react-baseline-source.tar.gz)
preserves all 1,300 fingerprinted inputs, including coherent Plite and Plate
source; its [manifest](artifacts/plite-view-design/react-baseline-archive.json)
records the archive and identity hashes. Before production comparison, adapt
the existing resolution runner so baseline imports resolve within the extracted
graph and the candidate imports actual product roots with the disposable B
transform disabled. Retain instrumentation, existing React compiler, cohorts,
guards and timing rules; preserve matching dependency identity and capture a
fresh paired baseline. The current `guards`/`packets` commands execute the
disposable design and must not be labeled production evidence. No new public
export is required for this harness adaptation.

## Direct-domain geometry target

Delete `Widget`, `WidgetTarget`, `WidgetStore` and their store/reader/geometry
hooks. Keep canonical selection, annotation and keyed Yjs cursor ownership.
The [whole-owner inventory](artifacts/plite-view-design/geometry-decision.md)
assigns all eight carrier-related files and their 64 top-level declarations;
it also identifies annotation and decoration machinery that retains real jobs.

Export `RangeGeometry` in place of `WidgetGeometry`, with the existing immutable
`boundingRect`, nullable `focusRect` and `rects` array of `ViewportRect`. Keep
`useSelectionGeometry({ editableRef })` and
`useYjsRemoteCursorGeometry(editor, clientId, { editableRef })`; each returns
`RangeGeometry | null`. Preserve inferred cursor-data/editor relationships and
direct Plate facade identity. Selection uses the canonical native-DOM projection
privately; a NodeSelection representative range is not a native text selection.

```tsx
import { useSelectionGeometry } from 'platejs/react';
import { useFloatingRect } from '@/registry/hooks/use-floating-rect';

const geometry = useSelectionGeometry({ editableRef });
const floating = useFloatingRect(geometry?.boundingRect ?? null, {
  placement: 'top',
});
```

The copied positioning helper accepts a rectangle plus existing Floating UI
options. It owns popup placement, virtual element and visibility while
positioning. The remote cursor already consumes `focusRect` directly and keeps
that presentation. Annotation panels read existing annotation records; no
annotation/node geometry hook or generic target/store replacement is added.

| Responsibility | Canonical owner and lifetime |
| --- | --- |
| Logical selection | Exact resolved view's selection and view-state events, including same-identity authored policy changes. A retained last range avoids rebuilding the full snapshot on viewport-only reads; it is invalidated by that exact view, not a context approximation. |
| Remote cursor | Existing active Yjs awareness cache with keyed cursor subscriptions and exact-view projection. Cursor removal/disconnect invalidates its geometry; unrelated IDs perform no geometry read. Geometry never owns anchors or cursor membership. |
| DOM binding | Connected exact Editable ref and existing DOM root/view registry. Foreign, absent, disconnected or unresolved targets return null. Binding change retires old subscriptions and scheduled work. |
| DOM layout | Private subscription on the existing DOMRootRuntime, using its existing integrity observer and completed host-commit path. Read after writes; do not overload host facts, add per-target observers or require application refresh calls. |
| Viewport | Existing shared model/Document coordinator with reference-counted roots, passive viewport listeners and root ResizeObserver. Retiring its scheduling view must cancel and reassign a pending read to a surviving view immediately. |
| Publication | One committed private geometry scope; immutable/equal results preserve snapshot identity. Render construction remains inert; final cleanup releases subscriptions, observation and queued work. |

The private domain adapter may share measurement mechanics. No public target
union, registry, revision counter, scheduler, retry or refresh DSL earns a place.
The existing annotation mapped-store kernel, DecorationSource and Yjs cursor
cache survive for their independent current readers.

The [root notification probe](artifacts/plite-view-design/dom-decision.md)
passes six contracts using real jsdom mutation delivery and the existing root
runtime/scheduler. It covers styles/text, noneditable external content,
owned/claimed/disconnected commits, chrome silence, integrity repair and root
replacement. Arbitrary external CSS animation without an owned mutation or
resize is not part of that result. Exact geometry integration and real browser
layout remain the execution proofs below.

### Geometry design evidence

The final [geometry runtime receipt](artifacts/plite-view-design/geometry-gate-decision.md)
accepts the disposable target: **24/24 matched scale rows, 10 runtime guard
receipts and 3/3 real-root integration contracts pass**, alongside the six
signal-source contracts. Baseline gaps are recorded separately from passing
candidate guards. The frozen v5 workload reaches 10,000 nodes, 1,000 geometry
consumers and eight views across its four cohorts; five interleaved packets give
100 observations per side per row. Budgets and correctness oracles were frozen
before measurement.

| Selection domain cohort | Current p95 | Direct owner p95 |
| --- | ---: | ---: |
| Normal: 100 nodes / 4 consumers / 1 view | 0.442 ms | 0.274 ms |
| Large: 1,000 / 64 / 1 | 0.986 ms | 0.451 ms |
| Stress: 10,000 / 256 / 2 | 2.875 ms | 0.796 ms |
| Pathological fanout: 1,000 / 1,000 / 8 | 11.812 ms | 2.739 ms |

These are complete programmatic domain-change-to-measurement fixture timings,
not native input latency. The frozen rule supports selection improvement at
large/stress/pathological sizes; it does not support a normal-case or keyed
annotation/cursor speed claim. Both paths retain bounded DOM read/wake counts.
Selection retains one domain and one view-state subscription per consumer;
there is no claim of total constant-time work or subscription consolidation.

The real-root integration uses 64 consumers across two DOMRootRuntimes. One
root's mutation batch schedules once and performs exactly 64 range resolutions
for its 32 consumers; the other root and logical-domain reads stay untouched.
One layout subscription serves each root. Destruction reassigns pending work
without another event, replacement releases the old root, and final leases
return to zero. The actual EditableDOMRuntime binding order still needs product
integration proof.

The first retained-range attempt failed pathological viewport timing; the
retained scalar plus exact-view invalidation repair passed unchanged budgets.
The initial baseline also reproduced stale authored projections and a canceled
scheduler that stranded surviving views. Preserve those receipts. The
[baseline archive and production replay contract](artifacts/plite-view-design/geometry-production-replay.md)
require loading the actual final hook owner, not replaying the disposable
candidate as production proof. Final React timing runs follow geometry serially.

## Adoption boundaries

The source census groups terminal jobs rather than counting each import as an
independent feature. Six groups cover the directly affected production owners:

| Group | Exact owners | Adoption and preserved job |
| --- | --- | --- |
| Authored React setup | [authored-changes.tsx](../../apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx) | Replace `useRuntime` with `useEditor`; mount accepted/proposed/markup views through explicit EditorRoot editor inputs and existing root/authored props. Preserve 1/2/8 views, named roots, external text, live policy changes and the separate independent document. |
| Root routing and controls | [multi-root-document.tsx](../../apps/www/src/app/(app)/examples/plite/_examples/multi-root-document.tsx), [synced-blocks.tsx](../../apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx), private content-root rendering | Keep ordinary EditorRoot setup, root selector/history/chrome jobs and exact repeated content-root occurrences. Internal child mounts bypass the removed public context-only grammar. |
| Annotation panels | [comment-mode.tsx](../../apps/www/src/app/(app)/examples/plite/_examples/comment-mode.tsx), [persistent-annotation-anchors.tsx](../../apps/www/src/app/(app)/examples/plite/_examples/persistent-annotation-anchors.tsx) | Read annotation and comment records directly. Their current panels do not measure geometry; do not replace Widget with another view descriptor list or unnecessary geometry subscription. |
| Selection positioning | [floating-toolbar.tsx](../../apps/www/src/registry/components/editor/floating-toolbar.tsx), [link.tsx](../../apps/www/src/registry/components/editor/link.tsx), [use-widget-floating.ts](../../apps/www/src/registry/hooks/use-widget-floating.ts) | Keep semantic selection geometry and exact Editable refs; copied UI owns placement, focus policy and hide-before-positioning. Remove Widget-based names and imports from the copied positioning adapter. |
| Remote cursor positioning | [useYjs.ts](../../packages/plitejs/src/yjs/react/useYjs.ts), [cursor-widget-store.ts](../../packages/plitejs/src/yjs/react/cursor-widget-store.ts), [remote-cursor-overlay.tsx](../../apps/www/src/registry/components/editor/remote-cursor-overlay.tsx) | Preserve keyed cursor cache and data inference; remove its Widget adaptation only. `getYjsCursorCache` also serves non-geometry hooks and must survive at its canonical Yjs owner. |
| Plate boundary | [core.tsx](../../packages/platejs/src/react/core.tsx), [plite-react.ts](../../packages/platejs/src/react/plite-react.ts), [Plate.tsx](../../packages/platejs/src/react/components/Plate.tsx), exact export/type fixtures | Adopt Widget surface removals/new geometry result type by facade identity. Plate's public facade already omits Runtime/useRuntime/RuntimeValue; remove those from its private bridge. Preserve the intentional Plate EditorRoot replacement and complete-document callbacks. |

The reproducible bounded search uses these patterns across Plite/Plate source,
application source, their test directories and `content/docs`, excluding generated
registry output and artifacts:

```sh
rg -n '\b(useRuntime|RuntimeValue|RuntimeProps|UseRuntimeOptions)\b|<Runtime\b|^\s+Runtime,' packages/plitejs/src packages/platejs/src apps/www/src apps/plite/src packages/plitejs/test packages/platejs/test apps/plite/tests apps/www/tests content/docs --glob '*.{ts,tsx,md,mdx}' --glob '!**/artifacts/**' --glob '!**/__registry__/**'
rg -n '\b(Widget|WidgetTarget|ResolvedWidget|WidgetSnapshot|WidgetStore|WidgetStoreOptions|WidgetStoreMetrics|UseWidgetStoreOptions|useWidgetStore|useWidget|useWidgetIds|useWidgets|WidgetGeometry|UseWidgetGeometryOptions|useWidgetGeometry)\b' packages/plitejs/src packages/platejs/src apps/www/src apps/plite/src packages/plitejs/test packages/platejs/test apps/plite/tests apps/www/tests content/docs --glob '*.{ts,tsx,md,mdx}' --glob '!**/artifacts/**' --glob '!**/__registry__/**'
```

This bounds local adoption, not external ecosystem consumers. It is not an
assertion-level coverage claim. Node-Widget has contract coverage but no direct
application construction in this census; an old contract alone does not earn a
replacement public node-target hook. Preserve the existing canonical DOM node
resolver for its actual callers.

### Teaching and doctrine adoption

Current served teaching is in `content/docs`, specifically
`api/react-hooks.mdx`, `(guides)/annotations.mdx` and `(guides)/decorations.mdx`.
Document the resulting current API, with inferred imports and examples; do not
write changelog prose into those pages. `docs/plite/reference/public-docs` has
older spellings and must be classified as reference evidence instead of assumed
to be the served documentation owner. Preserve immutable review records and
historical plans.

Best API doctrine repair replaces the mandatory Widget
lifetime rule in `.agents/rules/best-api.mdc:440`, `docs/vision/plite.md` and
`docs/vision/plate.md`, plus the public Runtime mount language in Plite Vision.
Audit affected Best API, Plite/Plate Plan, Plate UI/Docs, plugin authoring and
Plate Next sources for contradictory teaching; edit only the actual owners.
Use Maintain Workflow for those instruction edits, append the required Plate
Next doctrine version without changing attestations, run `pnpm install`, then
verify source and generated mirrors. The implementation completed those repairs
after the product migration and records Plate Next doctrine version 188.

## Implementation order and proof

Implementation checklist:

- [x] Implement direct selection/Yjs geometry, private DOM invalidation and
  coordinator retirement; remove the Widget carrier and prove production replay.
- [x] Implement required-editor React roots with independent mounted views;
  remove public Runtime vocabulary and replay the accepted lifetime contract.
- [x] Adopt Plate, examples and copied UI; close public exports, barrels and
  inferred type contracts without compatibility aliases.
- [x] Update current docs and durable doctrine, regenerate owned outputs and
  verify instruction mirrors.
- [x] Run package, Plate, registry, browser/native and final architecture gates;
  reconcile actual evidence, risks and source identity here.

The design gates pass and execution is authorized. This same plan records actual
results beside the gates below. Each slice completes its package/consumer adoption before moving
on; no public alias or dual-signature bridge is selected.

| Slice | Owner and work | Entry | Exit and proof |
| --- | --- | --- | --- |
| 1. Direct semantic geometry | Plite React geometry and Yjs cursor adapter, copied positioning consumers | Accepted geometry receipt and API | Existing canonical target subscriptions feed exact-ref measurement; Widget state/store/hooks/types and the cursor adapter are deleted where subsumed. Preserve shared annotation/decoration helpers and Yjs cursor cache. Rerun the frozen geometry contract on production source, React geometry contracts, Yjs tests and copied positioning tests. |
| 2. Explicit React mount | Plite React provider/root, internal Editable/content-root mounts and authored example | Accepted React receipt; geometry already independent of Widget | Raw editor input replaces RuntimeValue; each mount owns its command view and selected policy; every public EditorRoot supplies its editor; private nested scope and separate provider lifetimes remain correct. Rerun the final React contract plus provider/authored/announcement/selector and content-root contracts. |
| 3. Plate and public boundary closure | Plate facade/bridge/provider, package exports, declaration fixtures | Both runtime slices pass locally | Exact mounted command editor and full-document callbacks remain intact; public surface has no rejected exports; facade identity and negative inference proofs pass. Run affected source type partitions, `pnpm brl` and packed/client entrypoint proofs. |
| 4. Product and teaching closure | Copied registry, docs, doctrine owners | Accepted implementation and package boundary | Real floating, annotation, cursor, authored and root browser behavior passes; regenerate registry on next, repair current docs/doctrine, then run settled architecture closure. Preserve original failed proof and final source identity. |

Do not ship an intermediate public API. If a slice fails, repair that owner or
revert only this task's bounded changes. The public cut ships atomically after
all consumers and proof pass. This is a runtime/API migration with no persisted
document format change; rollback must not modify canonical data or unrelated
checkout changes.

### Exact execution checks

Commands below are selected from existing owners and were run during execution.
Managed browser commands use the runner's source/build identity checks.

- Plite React: `pnpm --filter plitejs test:react` passes 88 files and 1,262
  tests; `pnpm --filter plitejs typecheck:tests` passes the mounted-view and
  public contract fixtures.
- Source and package closure: `pnpm plite:typecheck`, `pnpm plite:test` and
  `pnpm check:plite:contracts` pass. The contract run includes 254 Node tests,
  25 benchmark contracts, 53 benchmark target checks and public package types.
- Plate: `pnpm --filter platejs test:partition:react-core` passes. Its
  `PlateContent.spec.tsx` coverage includes sibling providers, exact refs,
  StrictMode, detach and view-local read-only.
- Copied UI: `bun test ./apps/www/src/registry/hooks/use-floating-rect.spec.tsx ./apps/www/src/registry/components/editor/floating-toolbar.spec.tsx ./apps/www/src/registry/examples/collaboration-demo.spec.tsx`
  passes. These tests mock geometry/Floating UI; real floating link geometry is
  covered by the browser test below.
- Native authored path and the `multi-root-document`, `synced-blocks`,
  `comment-mode`, `persistent-annotation-anchors` and `collaboration-demo`
  donor suites pass in the managed browser matrix.
- Floating link geometry passes against a verified current-source www instance
  through `tests/browser/link-floating-toolbar.spec.ts`.
- Exports: `pnpm plite:entrypoint-sizes:update` and
  `pnpm plite:release:packages` pass 4 packed packages, 86 public subpaths, 81
  runtime imports, 43 React-free headless entrypoints, one DOM-free SSR
  entrypoint and 42 optional-peer closures.
- Generated/current teaching: `pnpm brl`, `pnpm --filter www build:registry`,
  `pnpm install`, Plite docs checks, website typecheck, doctrine validation and
  resource mirror checks pass. Final architecture closure is `pnpm check:plite`
  and `pnpm check:plite:browser-matrix`.

### Real failure scenarios

| Failure | Blast radius and required proof |
| --- | --- |
| Mounted view loses selected root/authored policy or shares an input's command lifetime | Suggested edits write accepted content, a named root renders primary content, or retiring one mount locks another. Assert selected policy on the independent mounted context, unchanged accepted content, named-root routing, stable mounted identity during live setView, stale-command rejection, and undo/redo plus follow-up input. |
| Cleanup of one root retires a surviving sibling or delivers stale queued work | Shared views lose commands, delayed selectors observe another editor, or read-only changes leak. Exercise StrictMode, keyed document replacement, pending deferred callbacks, sibling detach/remount and stale captured commands. |
| Geometry ref resolves another mounted occurrence or cursor update fans out globally | Floating UI attaches to the wrong editor; one cursor update wakes every target; stale rectangles persist after detach. Prove exact-ref identity, foreign/unmounted null, affected/unaffected subscribers, multiple views and final-release cleanup. |
| Public Runtime removal changes callback or announcement scope | Duplicate announcement hosts under shared scope, absent independent hosts, or Plate misses named-root/document metadata changes. Assert one live region per actual private provider, separate React-root authored views, document callback order, root-local Plite value callbacks and complete-document Plate value callbacks. |

The combined separate-React-root + authored projection + announcement-lifetime
case is covered by the mounted-view lifetime suite and the production React
replay. It exercises independent simultaneous mounts, selected authored policy,
source-default capture, remount retirement and the actual provider boundary.
Announcement DOM assertions do not claim actual screen-reader output. Browser
editing assertions do not claim raw Android/iOS hardware parity; existing
native input laws and fail-closed device runners remain unchanged.

Reopen the target if a current interactive application demonstrably needs one
preconstructed native view's mutable identity across independent mounts: that
would justify revisiting authored/core lifetime factoring. A new geometry domain
requires a concrete semantic caller before adding a hook. Failed production
layout, lifetime or matched-scale evidence reopens the owning implementation;
do not relax the frozen oracle, replace exact refs with active-view lookup or
reinstate the Widget/Runtime vocabulary to conceal an owner defect.

Verification evidence:

- Read the five-question [review](../research/decisions/plite-view-ownership.md)
  and the current provider, runtime handle, mount grammar and selector owners.
- Branch is `next`; structured Autoreview is not run under branch policy.
- [Geometry v5](artifacts/plite-view-design/geometry-gate-decision.md): 24/24
  scale rows, 10 candidate guard receipts and 3/3 root integration contracts;
  all 487 frozen inputs matched at final read-back. The separate
  [DOM signal](artifacts/plite-view-design/dom-decision.md) passes 6/6 contracts
  and its two production source hashes remain unchanged.
- [Production geometry replay](artifacts/plite-view-design/geometry-production-replay.md):
  all 24 paired rows and 10 production lifecycle gates pass against the actual
  selection/range/Yjs cursor owners. The manifest fingerprints 14 production
  sources, including the final authored owners, and rejects source drift.
- [React resolution](artifacts/plite-view-design/react-resolution-summary.json):
  18/18 candidate guard tests and 32/32 timing phase comparisons pass; final
  [identity check](artifacts/plite-view-design/react-resolution-identity-check.json)
  reports no changed inputs. Rejected exact-handle remount behavior is preserved
  in [its counterexample](artifacts/plite-view-design/react-resolution-A-results.json).
- [Production React replay](artifacts/plite-view-design/react-production-summary.json):
  all 18 guards pass against the actual `EditorRoot` and Plate bridge. All eight
  shared/independent 1, 2, 8 and 32-view timing cells remain below every frozen
  regression gate; the manifest includes the final authored source identity.
- Geometry and React final measurement subprocesses ran serially. The
  [resource receipt](artifacts/plite-view-design/geometry-resource-receipt.md)
  discloses a prior v4d/DOM-probe overlap and the limits of retrospective timing
  records. Final acceptance uses v5, not that earlier overlapping run.
- The disposable [mount declaration](artifacts/plite-view-design/mount-types.tsx)
  compiles against live source with inferred callbacks and negative capability,
  missing-editor, authored-capability/policy and primary-root checks. Command:
  `node_modules/.bin/tsc --project docs/plans/artifacts/plite-view-design/mount-types.tsconfig.json --noEmit`.
  Result: exit 0; [log](artifacts/plite-view-design/mount-types.log). This proves
  the proposed call contract, not a product implementation or runtime behavior.
- The source-stable managed browser matrix passes without retries: Chromium
  785 passed and 8 skipped; Firefox 674 passed and 119 skipped; Mobile Chromium
  372 passed and 421 skipped; WebKit 695 passed and 98 skipped; Mobile WebKit 2
  passed. The aggregate is 2,528 passed, 646 expected skips and 501 bounded
  batches.
- Final `pnpm check:plite` passes Plite typecheck, 152 package tasks, 254 Node
  contracts, 25 benchmark contracts, 53 benchmark targets and the managed
  Chromium suite with 785 passed and 8 expected skips.
- Final plan inspection reconciles the rejected exact-handle proposal with the
  selected per-mount view owner, all adoption groups, proof boundaries and
  completed implementation. Local link/source checks are recorded in
  [plan checks](artifacts/plite-view-design/plan-checks.json); scoped
  `git diff --check` and the Autogoal plan-completion validator pass.

Open risks:

The actual geometry, EditableDOMRuntime, React and Plate owners pass their
source-bound production replays. Package, generated-output, packed-release,
managed browser and final strict adoption all pass. No native device or actual
screen-reader output is claimed. Synthetic samples and unmonitored machine
background load limit timing conclusions; no browser speed guarantee follows.

Next action:

None. The accepted plan and all required proof are complete.
