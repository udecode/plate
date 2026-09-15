# Collaboration synchronization, transport and presence lifetimes

Status: Complete. The selected ownership, lifecycle, API, adoption and proof
work is implemented. All collaboration-owned design and proof gates are closed;
repository-wide failures outside this scope are recorded below.

Objective:

implement and validate the smallest collaboration API and ownership model for
ledger item 10, `collaboration`, including native Plite ownership, the Plate
facade, React presentation, public exports, current teaching and executable
production-path proof.

Completion threshold:

a selected contract with concrete raw/Plate calls, acceptance and admission
laws, complete public-surface disposition, one executable implementation that
combines those laws, a valid balanced comparison and package/browser proof. The
implementation meets this threshold; exact receipts and broader checkout limits
are recorded under Verification evidence.

Verification surface:

actual owner-source tests, source and packed type contracts, exact entrypoint
checks, built Plite packages, generated registry consumers, raw and Plate browser
routes, a real Hocuspocus server, the composite collaboration benchmark,
doctrine validation and the canonical review ledger. Earlier disposable probes
remain historical evidence only.

Constraints:

preserve accepted canonical edits, CRDT identity/convergence, schema validation, named roots, authored shared effects, history, exact-view cursor geometry and inferred cursor metadata. Keep independent Plate features separate. Preserve descriptor-or-name plugin lookup and the user's prohibition on hard dependencies merely for cross-plugin lookup.

Boundaries:

current `next` checkout; native Plite Yjs, Plate Yjs/React composition, affected
examples and copied UI, public docs, package/export/build wiring, benchmark,
doctrine and review records. Concurrent authored, suggestion, clipboard and table
work stays outside this scope. No new package, CRDT wire-format migration,
publication or release.

Blocked condition:

none for collaboration. Manual long-duration soaks require an explicit soak
request under the repository's proof rules and were not run for this closure.

Sources: [initial review](../research/decisions/collaboration-ownership.md), [Task workflow](../../.agents/rules/task/references/workflow.md), [complex decisions](../../.agents/rules/task/references/complex-work.md), [Best API](../../.agents/skills/best-api/SKILL.md), [Plite Plan](../../.agents/skills/plite-plan/SKILL.md), [Benchmark](../../.agents/skills/benchmark/SKILL.md), and [Plite](../vision/plite.md) / [Plate](../vision/plate.md) / [common Vision](../vision/common.md). Detailed source witnesses and caller inventories live in the [provider investigation](artifacts/2026-09-14-collaboration-provider-design.md) and [Plate investigation](artifacts/2026-09-14-collaboration-plate-design.md). The decisions here take precedence over their preliminary alternatives.

## Selected ownership

**Delete the editor's transport facade, Plate's duplicated Yjs configuration
store, and the live-state `read.yjs` group.** Keep one native Yjs binding,
app-owned provider resources, and the existing Plate presentation composition.
Binding status, remote cursors, presence writes and administrative actions are
one view-bound plugin service under `api.yjs`. No `tx.yjs`,
`editor.update.yjs` or `read.yjs` group remains. Live awareness and admission
state are not replayable document reads.

```text
App provider / persistence → doc + initial readiness + awareness
                                      ↓
                        Native Yjs binding ↔ accepted document changes
                                      ↓
                  exact editor-view cursor reads → Plate decoration / copied UI

App → provider.connect()/disconnect()/destroy()
App → editor.api.yjs.setCursorData()/syncSelection()/clearSelection()
```

| Concept | Prior surface → implemented target | Owner / strongest rival / reason | Adoption and proof | Result / disposition |
| --- | --- | --- | --- | --- |
| Transport facade | Optional provider commands, event dialect normalization and swallowed rejections → direct provider calls | App. Merely staging commands after commit fixes acceptance but preserves the wrong resource lifetime. | Hocuspocus, local network, Plate demo; original error and shared-socket teardown proof. | Caller lifecycle migration; **cut**. |
| Configuration | Nullable Base store plus captured native options → one factory closure | Raw `yjs(options)`; Plate factory composes existing native binding and decoration. Keeping a singleton requires another config owner or loses inference. | Native and Plate type/caller migrations, exact export identity. | Factory identity must remain stable across React renders; **cut duplicate owner**. |
| External actions | Immediate effects masquerading as transaction operations → `api.yjs` | Existing API and after-commit mechanisms. No new command queue, session or provider service. | Discarded/aborted/accepted specs, direct publication and retired-handle probes. | Composite implementation and balanced comparison pass; **moved**. |
| Initial admission | Provider sync repeatedly gates writes → explicit loading input and successful-admission latch | Native binding. A readiness helper only observes; it owns no latch or resource lifetime. | Empty/loaded/claimed rooms, offline edits, pre-publication rejection, shared-effect failure, retry. | Pre-publication rejection, retained error work, atomic ready publication and exactly-once retry pass; **rearchitected**. |
| Native synchronization | Canonical event bridge, roots, schema and shared-effect log → same owners and wire identities | Yjs causal and relative identity are current jobs; path broadcasts or JSON snapshots cannot replace them. | Existing convergence/history/authored suites and the matched operation probe. | Matched native operation comparison passes; preserve all production contracts; **keep**. |
| Cursor mapping / geometry | Existing cache and exact-view geometry → same private owners, surfaced through `api.yjs` and React hooks | Moving to document content breaks transient expiry; moving geometry to provider breaks view ownership. | Per-client invalidation counters, named-root mapping, active-view arbitration and mounted-view browser proof. | The 500-cursor cohort, exact-view arbitration and mounted browser paths pass; **kept owner and moved public reads**. |
| Diagnostic / wire exports | Public controller internals → private diagnostics/codecs | Existing private Yjs owners serve tests and benchmarks. No demonstrated production consumer needs public binding internals. | Update export recipes and diagnostic helpers; preserve codec behavior. | Public hard cut, unchanged wire format; **cut public wrappers**. |

Value order is transport/configuration/read-group deletion, acceptance
correctness, admission/offline correctness, then export simplification.
Implementation order follows dependencies below. No compatibility bridge is
selected.

## Public calls

These snippets are the implemented public syntax. Source contracts, package
declarations and packed-consumer proof cover the capability-dependent API.

```ts
// Raw Plite; headless Plate gets the Yjs exports from 'platejs/yjs'.
import { createEditor } from 'plitejs';
import { yjs } from 'plitejs/yjs';

// App-local adapter beside the Hocuspocus provider construction.
const initialReady = createHocuspocusInitialReadiness(provider);
const awareness = requireAwareness(provider);

const collaboration = yjs({
  doc: provider.document,
  initialReady,
  awareness,
  cursorData: { validate: isCollaborator }, // (unknown) => value is Collaborator
});
const editor = createEditor({ plugins: [collaboration] });

editor.api.yjs.setCursorData({ name: 'Ada', color: '#7c3aed' });
editor.api.yjs.syncSelection();  // publish this exact view's current selection
editor.api.yjs.clearSelection(); // explicitly withdraw the published selection
await provider.connect();           // preserve its actual return/error behavior
provider.disconnect();
```

```ts
// Plate React: one factory for binding + existing unstyled decoration.
import { createEditor } from 'platejs/react';
import { createYjsPlugin } from 'platejs/yjs/react';

const Collaboration = createYjsPlugin({
  doc: provider.document,
  initialReady: createHocuspocusInitialReadiness(provider),
  awareness: requireAwareness(provider),
  cursorData: { validate: isCollaborator },
});

const editor = createEditor({ plugins: [Collaboration] });
editor.plugin(Collaboration).api.setCursorData({
  name: 'Ada',
  color: '#7c3aed',
});
```

The normal mounted path exposes waiting and failure instead of presenting an
editable surface whose input will be discarded:

```tsx
const status = useYjsAdmissionStatus(editor);

return (
  <Editable
    readOnly={status.state !== 'ready'}
    aria-busy={status.state === 'waiting'}
  />
);
```

The app chooses its loading and error UI. The binding independently rejects
document and shared-effect commits before publication while status is not
`ready`; the UI gate is the user experience, not the correctness boundary.

The copied overlay exports `createCollaborationPlugin(options)` that returns `createYjsPlugin(options).extend(...)` with its present styles and `afterEditable` slot. Consumers retain the returned descriptor for exact lookup. `platejs/yjs` remains a pure native facade; `platejs/yjs/react` adds only the Plate factory and existing React exports. Do not widen `toReactPlugin` to accept raw descriptors just for this feature.

`doc` and `initialReady` are required in **both** factories. There is no
no-argument overload. `seed: true` grants initialization authority; a
single-value string mode earns nothing. Binding resources belong in factory
arguments; `.configure()` stays non-widening and terminal for presentation.
Validator inference must flow through `.extend()`, copied composition, direct
API access, plugin portals and explicit-editor hooks. An erased context-only
`useEditor()` cannot manufacture the caller's metadata type.

The presence API is inferred only when `awareness` is present. A document-only
binding remains valid, but cursor reads, subscriptions, writes and selection
publication do not exist on its typed API. Likewise,
`retireSharedEffectPeer` exists only when `sharedEffectCompaction` is supplied.
Erased runtime boundaries still reject unavailable capabilities. Negative type
fixtures must prove both omissions without weakening the default metadata type.

App code may stage a presence write after an accepted document update:

```ts
update: ({ context }) => ({
  publishProfile(data: Collaborator) {
    context.afterCommit(() => setCollaboratorPresence(data));
  },
})
```

`setCollaboratorPresence` is an app-owned callback that calls the concrete
editor's Yjs API. A feature package does not import Yjs merely to discover an
optional peer and does not index `editor.api` by name. The intentionally erased
`tx.plugin(name)` path remains valid for active-transaction update groups, but
this target deletes the Yjs update group; it does not justify a string-based
editor API lookup.

Direct Yjs API mutations inside an active update or detached transaction-spec
build throw **before** external mutation. Use the existing transaction/spec
context, not another staging abstraction. Automatic selection publication
remains commit-owned. An after-commit external failure is observable but cannot
roll back an already accepted document change. Retired API handles throw after
their binding lifetime ends.

## Readiness, initialization and recovery

```ts
type YjsInitialReadiness = Readonly<{
  doc: Y.Doc;
  getSnapshot: () => boolean;
  subscribe: (listener: () => void) => () => void;
}>;

type YjsAdmissionStatus =
  | Readonly<{ state: 'waiting'; reason: 'load' | 'seed' }>
  | Readonly<{ state: 'ready' }>
  | Readonly<{ state: 'error'; cause: unknown }>;
```

The options add `initialReady: true | YjsInitialReadiness` and `seed?: true`.
`initialReady: true` asserts completed local/persistent loading for this document
generation, including offline-first use. It says nothing about permission to
create a room. Omitted `seed` grants no initialization authority. `seed: true`
is an app assertion backed by an exclusive room-creation decision outside the
binding. It cannot prove exclusivity itself. Normal Hocuspocus documentation
uses a server-preseeded canonical update and omits `seed`. The browser
Hocuspocus demo launcher creates one unique ephemeral room id, propagates it to
all peer URLs, and grants `seed: true` to exactly one designated first endpoint.
The in-memory registry demo's `DemoRoom` constructor seeds its central room
document before either endpoint attaches, so both endpoint bindings omit
`seed`. A shared static demo room where every tab believes it is peer A is
forbidden. A synced empty replica is not a leader election; independently
creating identical JSON can converge to duplicated content.

Keep Hocuspocus observation app-local. The only production caller already owns
the adapter, and this checkout resolves Hocuspocus 3.4.4 at the root while the
web app uses 2.15.2; exporting a neutral-package helper would claim support the
type fixture does not prove. `createHocuspocusInitialReadiness(provider)` beside
each app's provider construction captures `provider.document`, reads
`provider.synced`, and subscribes to that installed version's `synced` event.
Construction attaches nothing; `subscribe` returns idempotent removal. The
binding accepts only the structural `YjsInitialReadiness`, verifies document
object identity, subscribes before its first snapshot read, and suppresses
duplicate or stale callbacks.

| Event / state | Binding result and publication law |
| --- | --- |
| New binding, readiness false | `waiting/load`. Observe input; do not export placeholder edits, seed, claim schema or acknowledge shared effects. Reject document/shared-effect transactions before publication and history; allow selection and unrelated local/plugin state. |
| Loaded compatible claimed room | Admit only after validated import of document/roots and required shared effects. Shared-effect decode failure is an admission error, not an empty pending batch. Then `ready`. |
| Loaded unclaimed empty room, no seed grant | `waiting/seed`. No schema/content claim. A subsequent canonical initialization update automatically retries admission. |
| Loaded unclaimed room, exclusive seed grant | Recheck schema claim, roots and effect/checkpoint state; prepare all fallible framework work before publication, then initialize once in one Yjs transaction after accepted plugin activation. |
| Claimed room with a physically empty Yjs root | Import schema-derived canonical minima without copying the joining placeholder. For `min: 0`, this is an empty editor. For required minima, the derived children have no shared identity until edited; concurrent first edits are concurrent block insertions and need explicit behavior proof. |
| Successful admission followed by sync=false/disconnect | Remain admitted and editable in the same Y.Doc. Keep offline edits/history and merge subsequent remote updates. Never reseed. |
| Remote schema/codec/import failure | `error` with the stable original/current cause. Preserve last accepted state, retained input and unacknowledged effects. Reject later document/shared-effect transactions before publication and history; allow unrelated state and cursor metadata. Stop selection publication and hide unresolved remote selections until recovery. |
| Fresh relevant input or accepted codec/config change | Retry retained work once; no polling. Shared-effect acknowledgements follow successful acceptance only. |
| External codec dependency repaired without an input/config event | `api.yjs.retryImport()` retries only the retained failed import. No-op without failure; a failed retry preserves and throws the original/current cause. |
| Same factory lineage reconfigured for presentation | Reuse the existing controller through a private binding token. Do not construct a second compaction authority or copy observer event objects. A false replacement readiness snapshot cannot undo admission. |
| A second factory targets the same `(Y.Doc, rootName)` | Reject before publication. One document namespace has one binding/controller; multiple mounted views reuse that owner. |
| Different document, namespace or logical room generation | Create a fresh editor runtime and validate fresh admission. Never transfer old cursor identities, pending work or seed entitlement. Live room/resource retargeting is cut. |
| Final disposal | Invalidate callbacks, unsubscribe and release only binding-owned presence. Do not destroy app-owned provider, document or awareness. |

Admission identity is `(Y.Doc object, rootName, compiled schema identity)`,
using the existing schema-identity equality law rather than fresh
compiled-object reference equality. Controller ownership additionally carries
one private factory/binding token so `.extend()` and terminal presentation
configuration can retain the owner without pretending that separately created
descriptors are identical. `rootName` is the Yjs storage namespace, not a new
public primary-root selector. Latched admission does not waive validation of
later input. Current seeding activates effect metadata before initial sync;
implementation must move that bookkeeping behind successful admission, not
merely rename the existing flag.

Prepare and validate the complete initialization payload before mutating Yjs.
A Yjs transaction groups updates; it does not undo partial writes when
application code throws. Admission must follow accepted import/publication,
including schema-required empty content and shared-effect bookkeeping.
Pre-publication activation failure restores the old editor configuration.
After-publication seeding/import failure leaves the published binding in
`error`; it cannot truthfully promise restoration after external Yjs writes or
observer failures.

Keep `retryImport`: an existing authored contract repairs a closed-over decoder
dependency after failure, with no new event to trigger import. Change the
shared-effect log to return its retained decode failure and retry identity to
the controller; the current swallowed failure cannot drive status or recovery.
Cut general `reconcile` and remove debug/demo uses that imply ordinary
synchronization requires manual flushing. Cut pause/resume: no current
independent production job justifies an extra document state machine.

App-user metadata, awareness client identity, Y.Doc client generation and stable compaction authority remain distinct. Remove the configurable `clientId` alias. Disconnect does not retire a shared-effect recipient; explicit retirement is compaction-authority-only and permanent for that Y.Doc generation. A returning retired peer needs a fresh document. Compactor identity does not grant seed authority.

## Presence and connection

Keep awareness as an explicit optional input. Its `doc: Y.Doc` identity and
`on`/`off` change subscription pair are required when supplied; reject
`awareness.doc !== options.doc` before listeners or writes. Structural
implementations remain supported without weakening that identity proof.
Validate complete cursor payloads and omit invalid remote metadata. Fix the
existing `data` and `selection` wire fields as private protocol constants;
there is no source-proven production caller for configurable field names.

Selection publication requires accepted document admission and valid view
geometry, not current socket status. It may update local awareness while
offline; the provider owns buffering, expiry, transport and replay. Automatic
publication is an invariant when awareness is supplied, so delete
`autoSendSelection`. Successful admission republishes the current owning
view's selection once. The inspected Hocuspocus 2.15.2 implementation
republishes local awareness in `startSync()` and removes remote states in
`onClose()`. A preserved shared-socket room detach may have no connection
event: app controls explicitly call `clearSelection()` and later
`syncSelection()` for that room. Do not invent a generic connection-status
mirror to mask that provider behavior. Transport-specific adapters own any
equivalent replay/withdrawal needed by another provider.

A binding without awareness remains a valid document collaboration binding.
The complete presence group is absent from its inferred API; erased runtime
access throws a missing-awareness error rather than pretending an empty cursor
service exists. `setCursorData` may run before admission because metadata has
no document position. `syncSelection` requires `ready`; `clearSelection` may
always withdraw an existing field. Cleanup clears only the selection field
owned by this binding; app-owned profile fields and awareness lifetime survive.

One awareness client has one local selection. Across primary/named roots and
multiple mounted views, the last accepted selection-changing view owns that
field. An explicit `syncSelection()` makes its exact view the owner. Stale view
cleanup clears only when its private owner token still matches; final binding
disposal clears unconditionally. The target does not promise simultaneous
local selections from one awareness client.

`admissionStatus()` and cursor snapshots are referentially stable until their
value changes. Every subscription returns idempotent cleanup, emits nothing
after disposal, and rebuilds cursor projections only after successful recovery.

## Complete surface disposition

This table accounts for the exports/options/read/update surface in the inspected native types, core and React barrels, plus the Plate facade. Private implementation helpers may remain private; public deletion is not a wire-format rewrite.

| Current surface | Target / caller migration |
| --- | --- |
| `yjs`, `YjsPluginOptions` | Keep factory and options contract; require document/readiness and infer validator payload. |
| Native type alias `YjsPlugin` | Delete. No production type consumer exists; callers retain the inferred descriptor returned by `yjs`. |
| `doc`, `awareness`, `rootName` options | Explicit immutable resources/namespace; `awareness.doc` must equal `doc`. Remove provider/document fallbacks and implicit document allocation. |
| `cursorData`, `sharedEffectCompaction` | Retain validation and compaction jobs. Inline the one-use compaction option object unless declaration reuse is proven. |
| `autoSendSelection`, `awarenessDataField`, `awarenessSelectionField` | Delete. Accepted selection publication is invariant; wire field names remain stable private protocol constants. |
| `provider`, `destroyProviderOnUnmount`, `seedProviderOnSync`, `clientId` options | Delete. Direct provider owner; `initialReady` plus `seed?: true`; awareness supplies participant identity and Y.Doc supplies generation identity. All 12 existing option names are covered above. |
| `YjsProviderLike`, status/payload/event/handler types (eight exported provider types) | Delete the generic provider dialect. Add only `YjsInitialReadiness`; provider-specific readiness adapters stay in app code. |
| `YjsAwarenessLike`, `YjsAwarenessChange`, `YjsAwarenessState` | Retain explicit awareness capability and change shapes; require exact document identity and removable subscriptions. |
| `YjsCursorDataSchema`, `YjsRemoteCursorData`, `YjsRemoteCursor` | Retain their proven boundary/data jobs and inference. Delete the one-use `YjsSharedEffectCompactionOptions` alias and inline that option shape. |
| `YjsState`, `read.yjs` and every current state method | Delete the public read group. Live admission/awareness state is not a replayable document snapshot. Keep `admissionStatus` and `subscribeAdmissionStatus` on every binding API; add `remoteCursor`, `remoteCursors` and `subscribeRemoteCursors` only when awareness is supplied. Make transport, resource, trace and raw revision reads private or app-owned. |
| `YjsTraceMode`, `YjsTraceFallback`, `YjsTraceEntry` | Make private diagnostics and move internal-proof imports; no new public debug service. |
| `YjsUpdatePolicy` | Retain publicly. Current Plite reference docs use it independently to import canonical changes through a host-owned collaboration adapter; that is a real caller job beyond the built-in binding. |
| `YjsTx` and all 11 update methods | Delete the group. `retireSharedEffectPeer` moves to the API with a numeric Y.Doc generation ID. `sendCursorData` becomes `setCursorData`; range-taking `sendSelection` becomes `syncSelection()` plus `clearSelection()`. `clearTrace` becomes private; transport and pause/resume leave the binding; broad `reconcile` becomes `retryImport`. |
| `sendSelection(range, data)` | Delete both arguments. Metadata uses `setCursorData`; `syncSelection()` reads the current exact view and `clearSelection()` explicitly withdraws. No copied arbitrary `Range` crosses the view lifetime. |
| `createYjsAwarenessSelection`, `readYjsAwarenessSelection`, `yjsAwarenessSelectionsEqual`, `YjsAwarenessSelection` | Private wire codec/shape; current production callers are inside Yjs. Test helpers import private codecs. |
| `pointToYjsRelativePosition`, `yjsRelativePositionToPoint`, `rangeToYjsRelativeRange`, `yjsRelativeRangeToRange`, `yjsRelativeRangesEqual`, `YjsRelativeRange` | Private relative-identity implementation. Canonical authored anchors and cursor APIs retain application jobs; do not expose storage encoding as another anchor API. |
| `useYjsProviderStatus`, `useYjsProviderSynced` | Delete; add `useYjsAdmissionStatus(editor)` for binding admission/errors and use it to gate the mounted editable. App observes provider status through its own provider/store. |
| `useYjsRemoteCursor`, `useYjsRemoteCursorIds`, `useYjsRemoteCursorGeometry` | Retain exact-view and granular subscription behavior; require an explicit editor whose inferred Yjs descriptor supplies awareness. Inline the one-use `UseYjsRemoteCursorGeometryOptions` object in the geometry hook signature. |
| `BaseYjsPlugin`, `YjsPluginState`, `YjsDefinition`, Plate React `YjsPlugin` value | Delete. Headless consumers use raw `yjs`; React consumers use `createYjsPlugin`. No native `YjsPlugin` type alias remains. |
| Copied `CollaborationPlugin` singleton | Generic `createCollaborationPlugin(options)` composed from the Plate factory and existing overlay. No library default label/color UI. |

The inferred, non-exported API contract is:

```ts
{
  admissionStatus(): YjsAdmissionStatus;
  subscribeAdmissionStatus(listener: () => void): () => void;
  retryImport(): void;
  // Present only when awareness is supplied:
  remoteCursor?(clientId: number): YjsRemoteCursor<TCursorData> | null;
  remoteCursors?(): readonly YjsRemoteCursor<TCursorData>[];
  subscribeRemoteCursors?(listener: () => void): () => void;
  setCursorData?(data: TCursorData | null): void;
  syncSelection?(): void;
  clearSelection?(): void;
  // Present only when sharedEffectCompaction is supplied:
  retireSharedEffectPeer?(clientId: number): void;
}
```

The question marks above describe option-dependent inference; callers do not
receive optional methods that require checks. The generated plugin API type is
the intersection of the always-present group and only the capabilities supplied
by the factory options.

Guard every external mutation against transaction/spec execution. Keep strict
payload validation and stable snapshots; do not export a one-off `YjsApi` type
or use unchecked generic assertions, explicit callback annotations or `any` to
hide lost inference.

The public export matrix is exact:

| Entrypoint | Target public names |
| --- | --- |
| `plitejs/yjs` | `yjs`, `YjsPluginOptions`, `YjsInitialReadiness`, `YjsAdmissionStatus`, `YjsAwarenessChange`, `YjsAwarenessLike`, `YjsAwarenessState`, `YjsCursorDataSchema`, `YjsRemoteCursor`, `YjsRemoteCursorData`, `YjsUpdatePolicy` |
| `plitejs/yjs/react` | Everything from `plitejs/yjs`, plus `useYjsAdmissionStatus`, `useYjsRemoteCursor`, `useYjsRemoteCursorIds`, `useYjsRemoteCursorGeometry` |
| `platejs/yjs` | The exact `plitejs/yjs` facade above. Delete the redundant `packages/platejs/src/yjs/core.ts` forwarding file and export directly from the entrypoint. |
| `platejs/yjs/react` | Everything from `plitejs/yjs/react`, plus `createYjsPlugin`; no `BaseYjsPlugin`, `YjsPlugin`, `YjsPluginState` or `YjsDefinition` |
| copied registry overlay | `createCollaborationPlugin` and its existing cursor UI components; no configured singleton or default user profile |

## Completed adoption order and production exits

The implementation followed these dependency-ordered slices. Each exit is
closed by the evidence below.

| Slice / phase | Files and adoption | Completed exit |
| --- | --- | --- |
| 1. Native contract and owner | `packages/plitejs/src/yjs/core/{types,plugin,controller,controller-registry,shared-effect-log,awareness-adapter,editor-adapter}.ts`. Migrate native provider/authored contracts and their network helpers in this same slice. Add explicit readiness, seed/admission/error/retry and publish the capability-inferred API service. | Source types; pre-publication waiting/error rejection; stable admission snapshots; subscription/document/awareness identity; offline/empty/claimed room; private-token controller reuse; duplicate namespace rejection; document-only and compaction capability negatives; existing schema, roots and authored contracts. No provider destruction, swallowed shared-effect error or pre-admission effect acknowledgement. |
| 2. Remaining native consumers and deletion | Both raw examples; `packages/plitejs/test/yjs/provider-contract.spec.ts`, `awareness-contract.spec.ts`, `remote-import-contract.slow.ts`, `package-config-contract.spec.ts` and support callers; React hook contracts; and `benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs`. Delete private-only exports after callers migrate; retain `YjsUpdatePolicy` and migrate only its internal import paths. | No normal path depends on manual reconcile; existing local/remote/history/compaction behavior passes; canonical benchmark target remains the single performance owner. Run the repaired composite comparison below. |
| 3. Plate facade and presentation | `packages/platejs/src/yjs`, table apply/paste fixtures, registry `remote-cursor-overlay.tsx` and `collaboration-demo.tsx`, their contract tests. | One native binding and no duplicate config store. Required-options, typed, copied-factory and portal inference; current unstyled decoration, colors and exact editable refs preserved. |
| 4. Exports and current teaching | All four package entrypoints and deletion of `packages/platejs/src/yjs/core.ts`; `tooling/entrypoints/entrypoint-dag.mjs`, `tooling/scripts/check-plate-schema-adoption.mjs`, `packages/platejs/test/public-package-import-smoke.slow.ts`, `packages/plitejs/test/yjs/package-config-contract.spec.ts` and regenerated `apps/plite/src/runtime-entrypoint-proof.generated.ts`. Migrate `content/docs/(plugins)/(collaboration)/{yjs,yjs.cn}.mdx`, `content/docs/examples/{collaboration-example,collaboration-example.cn}.mdx`, `docs/plite/reference/public-docs/{libraries/plite-yjs,concepts/07-editor,walkthroughs/07-canonical-change-substrate,migration}.mdx` and `docs/plite/references/architecture-contract.md`. Generated registry JSON is rebuilt, never hand-edited. | Exact export matrix, generated barrels and registry; facade identity, isolated optional Yjs imports, required peer behavior, packed consumer types; `YjsUpdatePolicy` remains taught for custom adapters; no old commands, public Hocus helper or default implicit seeding in current teaching. Historical reviews/plans remain historical. |
| 5. Doctrine and closure | Best API doctrine-repair method through Maintain Workflow during implementation; stale Yjs authoring-audit link and affected API/lifetime rules; smallest scoped Vision addition only if the durable rule is missing. | Append required Plate Next doctrine version, regenerate applicable mirrors from source, verify affected package attestations. Finish strict package/browser gates and reconcile the original ledger evidence. |

Do not hand-edit generated skills, registry artifacts or templates. Run `pnpm brl` for export/file moves; on `next`, `pnpm --filter www build:registry` owns registry generation. Existing immutable doctrine/review history stays intact. No git publication is included.

Runtime risks and reversal: invalid room or awareness identity and duplicate
namespace ownership fail before mutation. A pre-publication activation failure
restores editor configuration; a post-publication Yjs failure enters `error`
without promising impossible CRDT rollback. Failed remote import retains the
last accepted editor state, input and unacknowledged effects, then retries
without duplicate effects. Adopt caller changes atomically before deleting
legacy names. Do not ship aliases as rollback machinery. CRDT content already
accepted by other peers is never “rolled back” by replaying a placeholder.

Exact production checks are selected by the existing [Verify Plate recipes](../../.agents/rules/verify-plate/references/commands.md):

- `pnpm --filter plitejs typecheck` and `pnpm --filter platejs typecheck`; relevant existing Yjs partition tests from the entrypoint DAG, including provider/awareness/schema/roots/authored/compaction contracts and Plate/table consumers.
- Native probe runner: `bun test --preload ./config/plite-source-test-setup.ts <resolved-native-contract-files>`; preserve the actual runner wrappers for slow/history suites. React contracts use the owning package Vitest runner.
- `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/yjs-collaboration.test.ts`, then `yjs-hocuspocus.test.ts`, then `collaboration-demo.test.ts`, serialized. Prove real provider initial loading, waiting/error read-only UI, offline/concurrent edit plus reconnect/undo, new-editor room switching and app-owned destruction; fake providers do not satisfy this exit.
- Preserve browser cases for named roots, active arbitration across two mounted views, disconnect/expiry, room-detach withdrawal/replay, malformed remote metadata, 500 remote cursors, unchanged-cursor subscription stability, typing while waiting, IME and follow-up typing after reconnect. Add only missing costly public-boundary cases; source-removal greps are not runtime tests.
- `pnpm check:plite:dev` during implementation; settled closure uses `pnpm check:plite`, the applicable browser matrix and packed artifact/export runners. Read their current serving/source identities; do not count stale dist or an unrelated server.
- Current benchmark target: `bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs`. Repair it to execute one composite target, balance cold order in separate processes or even pairs, aggregate paired deltas, run A/A for every cohort, vary block and cursor axes independently, and include complete local edit, peer import and subsequent cursor reads. The public-path comparison sets editor selection and calls `syncSelection()`; direct profile publication calls `setCursorData()`. Baseline and candidate perform the same complete user job. Provider connection state is harness-owned, and trace assertions use private benchmark instrumentation rather than retaining public trace APIs. No new benchmark registry.

### Performance

- applicability: applied; the target changes hot commit/import hooks,
  awareness publication and subscriptions
- Vercel rules used: none; this is a headless native runtime comparison
- extra rules used: cohort segmentation, repeated-unit budget, interaction
  percentiles, memory/subscription tagging
- repeated units: document block, remote cursor, readiness/status subscriber
- cohorts: 100/1,000/10,000 blocks and 5/50/500 cursors, with block and cursor
  axes also varied independently
- budgets: keep the frozen `baseline × 1.15 + 1 ms` operation and
  `baseline × 1.15 + 5 ms` construction ceilings; zero transaction callbacks
  for direct presence writes; one readiness and one awareness listener per
  binding; zero callbacks after cleanup; bounded cache entries per remote cursor
- React/runtime primitives: stable `useSyncExternalStore` snapshots for status
  and cursor hooks; no duplicate store or provider-status mirror
- interaction metrics: p50/p95/p99 for presence, local edit plus peer import,
  edit plus cursor remap, retry and admission transition; balanced construction
  pairs per cohort
- trace/CWV proof: N/A to the headless timing claim; browser behavior remains a
  correctness exit and no route-load claim is made
- memory tags: heap, controller count, readiness/awareness/status listeners,
  cursor cache size and cleanup counts
- degradation contract: none; the target retains complete document and cursor
  behavior rather than adding a reduced mode
- dashboard/RUM gap: N/A until a production speed or route claim is made
- plan delta: the composite implementation passes balanced A/A and A/B cohorts,
  including independent block/cursor axes, p99 metrics and resource tags

## Verification evidence

### Collaboration-owned proof

| Surface | Final evidence |
| --- | --- |
| Native behavior | `pnpm --filter plitejs test:partition:yjs`: **271/271 pass**. The focused admission/lifecycle contract is **7/7**, including waiting/error pre-publication rejection, awareness failure without a transient ready notification, retained work and successful exactly-once retry. |
| Native quality and types | `pnpm --filter plitejs lint:partition:yjs`, `pnpm --filter plitejs typecheck` (**13/13 tasks**) and `pnpm --filter plitejs typecheck:contracts` pass. |
| Plate composition and inference | `pnpm --filter platejs typecheck` (**85/85 tasks**), `pnpm --filter platejs typecheck:contracts`, Plate Yjs tests (**4/4**), Yjs React tests (**3/3**) and both affected lint partitions pass. The contract fixtures prove document-only, awareness and compaction capability inference through raw descriptors, copied factories, explicit editor hooks and portals. |
| Public packages and exports | `pnpm brl`, `pnpm entrypoint:turbo:generate`, all **42/42** entrypoint DAG tests, `pnpm plite:packages:build`, `pnpm plite:public-types` and `pnpm plite:release:boundaries` pass. The release boundary check proves **38** exact direct optional-peer closures. Emitted `platejs/yjs/react` declarations retain all four conditional `createYjsPlugin` overloads; the old provider, lifecycle, read and update surfaces are absent. |
| App and registry | The full `apps/www` TypeScript build and `pnpm --filter www build:registry` pass. The Hocuspocus example uses an app-owned websocket provider/readiness adapter with symmetric provider and socket cleanup. |
| Browser/provider | The raw Yjs route passes **2/2**, the generated registry collaboration demo passes **1/1**, and the production app with a real local Hocuspocus server passes **1/1**. The collaboration browser batch also passes active-view arbitration, named roots, cursor behavior, reconnect, focus and mobile coverage (**13/13**). Port 4444 is released after the server test. |
| Performance | `bun --preload ./config/plite-source-aliases.ts benchmarks/slate-v2/donor/core/current/yjs-collaboration.mjs` passes all seven composite cohorts with zero correctness failures. Construction p95 is **3760.27 ms**; worst operation p95/p99 are **58.64/77.62 ms**; worst A/B paired excess is **-0.0345 ms** and worst A/A excess is **0.396 ms**. Changed/unchanged presence p95 is **0.01/0 ms**, edit/import p95 **58.64 ms**, edit/cursor-remap p95 **57.33 ms**, and retry admission p95 **4.53 ms**. |
| Doctrine and workflow | Best API and plugin-authoring source rules, Plite/Plate Vision and Plate Next doctrine version **194** describe the implemented lifetime and inference laws. Regenerated mirrors match their source. The doctrine validator and **15/15** doctrine/sync tests pass. Agent Native Reviewer found no discovery, ownership, mirror or proof defect. |

The implementation closes the eight gates from the adversarial review:
pre-publication rejection; recoverable shared-effect errors; controller,
namespace and compaction ownership; active-view arbitration; exclusive app-owned
seeding; exact capability-dependent source and package types; claimed-empty and
concurrent-first-edit behavior through native and mounted paths; and a balanced
composite benchmark. The final readiness transition is atomic: awareness
selection publication succeeds before subscribers can observe `ready`.

Earlier disposable API/admission probes, the order-confounded calibrated run and
failed A/A or A/B timing observations remain in
[`artifacts/`](artifacts/) and the immutable earlier review records. They
motivated the composite implementation and benchmark, but they are not counted
as final proof.

### Repository-wide closure limits

The focused collaboration surface is green. Broader commands expose unrelated
concurrent work and are not represented as collaboration failures:

- `pnpm check:plite:dev` stops in the package integration editor API fixture
  because concurrent authored/suggestion APIs are present but omitted from its
  expected key union.
- `pnpm check:plite` first hit a five-second core performance timeout under
  parallel load; the core suite passes alone (**1621/1621**). The rerun then
  stops in `BaseMediaPluginContracts.spec.ts` on an unrelated media-caption split
  expectation.
- `pnpm check:plite:contracts` passes **252/255** Node contract tests and then
  reports three clipboard bookkeeping mismatches around new internal slice
  exports and the `plitejs/internal` test alias. Its benchmark, public-type and
  release-boundary stages were run separately and pass.
- `pnpm test:types` has one unrelated table-plugin deep-instantiation error at
  `table-plugin-contracts.ts:79`.
- The full Chromium matrix reaches and passes the collaboration batch, then
  stops in the concurrent authored/clipboard insertion-offset assertion at
  `authored-changes.spec.ts:2205`.

Manual one-hour and production soaks were not run. The repository marks those as
manual-only and requires an explicit soak request. No release, publication or
external service mutation is claimed.

Work Checklist:

- [x] Capture scope and governing sources; preserve initial review/proof limits.
- [x] Prove pre-publication rejection for waiting/error document and shared-effect commits, with one observable commit and no history entry.
- [x] Make shared-effect decode failure explicit to status/retry and prove retained, exactly-once recovery.
- [x] Prove private-token controller reuse, duplicate namespace rejection, compaction authority and active-view selection arbitration.
- [x] Prove one exclusive seed owner in each demo and app-local Hocuspocus readiness against the installed versions; shared static rooms do not grant every tab seed authority.
- [x] Compile the raw/Plate/copied API, exact export matrix, deleted read group and capability-negative inference cases through source and packed declarations; retain the documented `YjsUpdatePolicy` custom-adapter path.
- [x] Prove claimed-empty required minima and concurrent first edits through the native implementation and a mounted browser path.
- [x] Build one composite implementation and pass balanced A/A and A/B contracts with independent scale axes, p99 and resource tags.
- [x] Challenge hard cuts against commit staging, direct provider observation and a supplied service; consume both independent investigations.
- [x] Complete implementation phases, deletion/adoption, docs/doctrine and concrete proof exits.
- [x] Reconcile final readiness, validate ledger/links and record successful implementation evidence.

Remaining risk is limited to long-duration behavior that only a separately
requested soak can establish. The collaboration-owned implementation, API,
package, browser/provider, performance and doctrine exits are complete. The
fresh superseding review record marks collaboration adopted and verified.
