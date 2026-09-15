---
title: Plite core ownership
type: decision
status: assessed
updated: 2026-09-11
review_scope: plite-core
review_history:
  - ../review-records/2026-07-23-api-schema.json
  - ../review-records/2026-09-11-runtime-document-view-ownership.json
  - ../review-records/2026-09-11-state-remove-unused-facets.json
  - ../review-records/2026-09-11-schema-extension-ownership.json
  - ../review-records/2026-09-11-commands-remove-default-build.json
source_refs:
  - ../../plans/2026-09-11-plite-core-api-review.md
  - ../../plans/artifacts/plite-core-api-review/consumer-census.json
  - ../../plans/artifacts/plite-core-api-review/facet-probe-results.json
  - ../../plans/artifacts/plite-core-api-review/facet-work-results.json
related:
  - ../reviews.md#runtime
  - ../reviews.md#state
  - ../reviews.md#schema
  - ../reviews.md#commands
  - transactions-synchronous-boundary.md
---

# Plite core ownership

**Pursue deleting facets and the public command descriptor's default-only
`build()` method. Keep one document runtime, root-scoped views, document fields
and effects, and atomic extension replacement.** These are two cuts within the
core architecture review; they do not merge independent Plate feature reviews.
The comparison below records the pre-adoption source. The two cuts are
implemented locally under [the adoption plan](../../plans/2026-09-11-plite-core-cuts.md);
full handoff remains in progress because the shared checkout has failing
checks and concurrent source changes.

Expected questions: **4**. Reviewed: **4**. Excluded questions: **0**.
Unresolved verdicts: **0**. Browser, external compatibility and final removal
proof remain explicitly outside the evidence obtained here.

| Question | Verdict | Decisive evidence | Next owner |
| --- | --- | --- | --- |
| Runtime lifetime | Stop further ownership redesign | Named-root editing, shared blocks and independent editors require different identity/lifetime scopes; the runtime already belongs to the document. | None |
| Document state | Pursue removing facets | No current application or feature facet consumers; transactions still clone and update their cache state. Fields and effects have real consumers. | Plite Plan |
| Extension composition (`schema`) | Stop replacing the composition model | Slots own replaceable subtrees; dependencies express prerequisites; contributions serve clipboard and codec producers. Atomic candidate publication owns rollback. | None |
| Commands | Pursue removing descriptor `.build()` | No production callers; it exposes a second, default-only evaluation path. Installed command dispatch and prepared transaction continuations have real callers. | Task for the bounded cut; coordinate in the same core adoption work |

## Ideal ownership and surviving jobs

Start with independently editable content, shared persisted document metadata,
per-view interaction state, typed feature installation, and interceptable
editing. The smallest supported flow is:

```text
application UI state                 document runtime
(panels, prompts, transient input)    (roots, fields, effects, schema, registry)
                                             ↑
                                     root-scoped view
                                     (focus, composition, read-only)
                                             ↑
                             command dispatch / atomic update
                                             ↑
                         ordered installed handlers → prepared spec
```

No separate public runtime object, generic derived-state store, or command
default-evaluation method is required by the observed callers. This does not
delete prepared specifications: they let a handler compute an unpublished
prefix and pass its resulting state to downstream handlers before one commit.

The materially distinct consumers inspected were raw multi-root editing,
shared-root blocks, independent Plate editors under one toolbar, persisted
document title/spellcheck, Plate transaction-associated AI fields/effects versus
transient chat options, raw schema switching and collaboration admission,
Plate plugin lowering, DOM clipboard/host codecs, copied toolbar transforms,
native keyboard routing, and input-rule/link command continuations. Feature
consumers constrain the core decision; their whole feature APIs were not audited.

## Runtime: one document owner, multiple view identities

[The private runtime](../../../packages/plitejs/src/core/editor-runtime.ts)
distinguishes document owner from root and view identity.
[View construction](../../../packages/plitejs/src/editor-runtime-view.ts)
reuses the owner's registry and document state, projects reads and writes to a
root, and creates view-local focus, composition and read-only state. Extension
API factories receive the actual view. The primary root is implicit;
[public root validation](../../../packages/plitejs/src/core/public-root.ts)
rejects using the internal primary-root name as a named root.

The [multi-root example](../../../apps/www/src/app/(app)/examples/plite/_examples/multi-root-document.tsx)
edits header, body and footer under one document. The
[shared-block example](../../../apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx)
reuses content roots, while the
[multiple-editor demo](../../../apps/www/src/registry/examples/multiple-editors-demo.tsx)
uses independent documents and shared toolbar targeting. Combining every editor
under one global owner would conflate document independence. Making every view
own a document would duplicate shared roots and commit ownership.

| Design lane | Assessment |
| --- | --- |
| Keep/configure | Keep the existing private document owner with root-scoped views. |
| Change API | Exposing the private runtime separately adds another setup and identity contract without removing current caller work. |
| Add primitive | No missing lifetime job was established in these consumers. |
| Delete/merge/inline | Delete separate view identity only by losing independent interaction state or recreating it as application adapters. Root ownership cannot become ordinary node metadata without losing shared-root lifetime. |
| Move owner | DOM focus/composition belongs to the view; roots and document commits belong below React. Moving either into the other owner mixes lifetimes. |
| Replace architecture | A global editor store or one independent document per view loses required independence or sharing. Neither earns a replacement. |

Stop is a decision against further redesign, not a scale certification of
every existing projection, cache or mounted-view path. No changed runtime
target is being accepted in this row.

## State: remove the unused facet subsystem

[Fields](../../../packages/plitejs/src/core/state-field.ts) provide typed
document values, equality, persistence and optional history/collaboration
policy. [Effects](../../../packages/plitejs/src/core/transaction-values.ts)
represent semantic transitions and replay/inversion policy. A field is already
an installable extension and contributes its transition effect. That is a
useful consolidation; another field-installation wrapper is unnecessary.

The [document-state example](../../../apps/www/src/app/(app)/examples/plite/_examples/document-state.tsx)
needs metadata that survives document persistence and undo. Plate's AI batch
and preview fields need transaction-associated state, while chat's initial
options contain ordinary transient UI state. Those jobs cannot all move into
React state or serialized node properties. Conversely, a local panel does not
need document ownership merely because fields are available.

The [consumer census](../../plans/artifacts/plite-core-api-review/consumer-census.json)
examined 1,644 package/application source files. All 21 facet-token occurrences
are definitions, exports, forwarding, typing, or validation text. There are no
observed feature definitions, provider installations, or consumer reads.
Tests exercise facets, and public documentation lists them; neither supplies
an independent current product job. This lexical census excludes generated
sources, tests and external applications and is not a whole-program proof.

In the [saved baseline](../../plans/artifacts/plite-core-cuts/baseline-source/core/facet.ts), facet state clones
three maps for each draft. [Transaction state](../../../packages/plitejs/src/core/public-state.ts)
creates these drafts unconditionally and records field, document, selection
and commit revisions. Previously changed fields remain in the revision map
even with no installed facet providers.

| Design lane | Assessment |
| --- | --- |
| Keep/configure | Retain fields, codecs, effects and equality. Configuring zero facet providers does not eliminate their bookkeeping. |
| Change API | Making facets opt-in would remove idle cost but retain an unused dependency/cache protocol and its public types. |
| Add primitive | A reactive graph, selector registry or generalized store has no missing current consumer to justify it. |
| Delete/merge/inline | Delete facets, providers, revision/cache state and forwarding. Ordinary derived helpers belong with existing read owners; ordered static contributions already have extension points. No speculative replacement helper is needed. |
| Move owner | Product UI state stays in Plate/application stores; persisted/replayed state stays in the document. Moving all fields to React or all UI into the kernel loses lifetime or persistence correctness. |
| Replace architecture | Encoding metadata as hidden nodes pollutes the document grammar; one generic state graph couples transient state, document data and feature configuration. |

The strongest target removes `defineFacet`, `EditorFacet*`, `DefineFacetOptions`,
`state.facet`/`editor.read.facet`, `facetProviders`, and their registry/transaction
machinery. Keep `defineStateField`, `defineEffect`, typed contributions, ordinary
read methods and existing consumer subscription contracts.

The proposed consumer shape uses existing APIs:

```ts
const title = defineStateField({ key: 'document.title', initial: 'Untitled' });
const editor = createEditor({ extensions: [title] });
editor.update((tx) => tx.setField(title, 'Review'));
const heading = editor.read((state) => state.getField(title).toUpperCase());
```

This example shows ownership, not a persistence/history configuration. Actual
persisted/shared fields retain their codecs and policies.

## Extension composition: retain atomic ownership

[Extension expansion](../../../packages/plitejs/src/core/editor-extension.ts)
distinguishes dependency edges from slot ownership, validates descriptors and
schema against a detached candidate, stages fields and resources, and publishes
one registry. Failure rolls back candidate state; finalized replacement cleans
up the displaced owners. [The registry](../../../packages/plitejs/src/core/extension-registry.ts)
validates identity, freezes publication collections and preserves ordered
registrations. [Schema contributions](../../../packages/plitejs/src/core/schema-contribution-registry.ts)
lower to one compiled schema.

[Slots](../../../packages/plitejs/src/core/extension-slot.ts) serve actual
replaceable schema owners in the schema-reconfiguration and Yjs examples.
Separate cleanup and `install()` calls cannot replace the transaction's atomic
reconfiguration contract without moving that same ownership into another API.
Dependencies express requirements, not permission to delete every dependent
when a configurable subtree changes. These are distinct laws.

[Host codecs](../../../packages/plitejs/src/dom/plugin/host-codec.ts) and
[clipboard handlers](../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts)
use ordered typed contributions. Their handlers are not persisted state and do
not need facet dependency invalidation. Plate's plugin compiler forwards these
core declarations while retaining product plugin policy above the substrate.

| Design lane | Assessment |
| --- | --- |
| Keep/configure | Keep flat inferred descriptors, dedicated schema declarations, slots and typed contributions. Remove facets under the state verdict. |
| Change API | A single overloaded configuration factory erases the distinction between schema vocabulary, resource lifetime and replaceable ownership. It does not remove the underlying laws. |
| Add primitive | Another configuration/profile/container layer would duplicate descriptor composition and slot ownership. |
| Delete/merge/inline | Merge fields into extensions: already done. Merge slots into dependencies or delete contribution points: loses owned replacement or neutral producer/consumer registration. |
| Move owner | Schema validity and atomic candidate publication belong in Plite; feature options and UI stay in Plate. A Plate-only replacement coordinator leaves raw consumers to rebuild it. |
| Replace architecture | A mutable global plugin store or independently published registries makes rollback and consistent schema/API snapshots a cross-owner protocol. |

This fresh comparison supersedes the July imported assessment. It retains the
earlier aim of small inferred declarations, but judges current flat descriptors
and atomic ownership directly. The July record has unknown source/model
provenance and supplies no current proof. Compiler/cache optimization is not
accepted or rejected on timing grounds in this row; no replacement target earned
further work.

## Commands: one dispatch path, prepared specifications remain

[Command definition](../../../packages/plitejs/src/core/command-definition.ts)
already stores the implementation in a private runtime. The public descriptor
also exposes `build(state, input)`, which invokes only that default builder.
[Installed dispatch](../../../packages/plitejs/src/core/command-registry.ts)
uses the private runtime and composes ordered handlers, preparation, input
rewrites, delegation, read-only checks and native-equivalence decisions.

The census finds no production call to the descriptor's `.build()` method.
Its two relevant implementation hits are private `runtime.build` calls; the
third textual hit is a list helper's `...build(child)` spread. The public
method is taught in [command docs](../../../content/docs/plite/concepts/06-commands.mdx)
and tested once. That establishes intended behavior, not a necessary second
evaluation contract.

Prepared transactions have separate evidence: [input rules](../../../packages/platejs/src/lib/plugins/input-rules/InputRulesPlugin.ts)
and [link exit behavior](../../../packages/platejs/src/features/link/lib/BaseLinkPlugin.ts)
use `next.after(prefix)` so downstream commands read the staged result.
Deleting all specifications would force intermediate commits or a replacement
transaction continuation protocol. The
[transaction decision](transactions-synchronous-boundary.md) retains this job.

| Design lane | Assessment |
| --- | --- |
| Keep/configure | Keep command descriptors, the definition-time builder, private evaluation, handlers and transaction specifications. |
| Change API | Remove the returned descriptor's `.build()` method. Do not rename it to `preview` or add `can` without a current consumer and full installed-policy semantics. |
| Add primitive | A universal availability/preview API is speculative; copied UI can use its actual feature reads and policy. |
| Delete/merge/inline | Delete default-only public evaluation. Delete the whole command registry or all specs: loses real middleware and continuation jobs. One-use product actions can remain ordinary helpers. |
| Move owner | Core semantic dispatch and neutral native-equivalence handling stay in Plite; toolbar presentation and feature policy stay with their product owners. |
| Replace architecture | Function-only mutable dispatch would need to reconstruct identity, ordering, headless evaluation and unpublished continuation. No lasting simplification is established. |

The proposed descriptor is opaque identity plus `id`; authoring still uses
`defineCommand(id, { build })`, and execution still uses
`editor.update.command(command, input)`. This removes a misleadingly general
public path without changing installed dispatch. It is not a command performance
optimization: the repeated evaluation and application paths remain the same.

## Evidence and adoption limits

The [frozen facet contract](../../plans/artifacts/plite-core-api-review/facet-probe-contract.json)
compared current source with a Bun-loaded disposable replacement of `facet.ts`.
It leaves existing call sites in place, removes bookkeeping, and throws if any
public facet consumer is reached. Five alternating matched pairs cover 0/32/256/
2,048 previously changed fields and 1/100/1,000 document blocks, with prepared
and committed text edits. All eight operation/cohort comparisons passed the
predeclared noise and non-regression screen. Results do not show a consistent
speedup and do not justify one.

[Separate instrumentation](../../plans/artifacts/plite-core-api-review/facet-work-results.json)
counts three map clones and N field-revision entries per preview, and six clones
and 2N entries per command dispatch. The deletion prototype performs zero of
that work. Text, selection, field values, unpublished-spec and commit-count
guards pass. The evidence supports removing the owner; it does not prove a
complete production deletion, reduced total memory, or native editor parity.

Current-source proof: 159 headless contracts, 18 field/facet/transaction
contracts, two React field-selector tests under the package's Vitest runner,
one Plate construction test, public API type contracts and generic inference
contracts. The same 159 headless contracts pass against the deletion prototype.
The [verification receipt](../../plans/artifacts/plite-core-api-review/verification.json)
records exact commands, runner corrections, hashes and limits. Browser routes,
the view matrix, transport collaboration and external applications were not
replayed. Keep ledger adoption and proof status separate from review completion.

## Local adoption

The current source deletes the facet definition, public types, provider
forwarding, registry and transaction bookkeeping. Fields/effects, typed
contributions, ordinary reads and atomic extension replacement remain. Command
descriptors carry identity and `id`; definition-time `build`, installed dispatch
and unpublished transaction specifications remain.

Behavior fixtures exercise retained field equality, configuration rollback and
publication through the surviving owners. One bootstrap rollback fixture used
live document replacement, which emits metadata forbidden during initialization;
it uses ordinary node replacement and selection updates instead.

Focused core proof passes 160 tests; retained provider/field selector proof passes
55 React tests, and history passes 132 tests. Plate and test-package proof passes
all 144 scheduled tasks. Source-first Plite/Plate typechecks, scoped lint,
barrels, generated API docs and docs source parity pass. Doctrine version 183
and generated skill resources validate.

The production comparison repeats the frozen five-pair/four-cohort contract
against the saved pre-cut source. Both production runs pass all eight timing
and noise screens; the second run follows unrelated concurrent source edits.
Allocation instrumentation confirms zero facet map/field-revision copies.
The target includes concurrent authored/runtime edits, so timing describes the
whole current production path. It is not an isolated speedup estimate for the
facet cut, an end-to-end speed claim, or a browser measurement.
See the [adoption receipt](../../plans/artifacts/plite-core-cuts/verification.json).

Full handoff is **not green**:

- The strict React suite has three failures in primitive context and inline-void
  rendering. All three reproduce against the saved pre-cut source.
- Runner contracts report authored-subpath import coverage, generated Turbo
  configuration and DOM export expectation drift in the shared checkout.
  Independent benchmark contracts (25 tests), the 51-target inventory and
  public package type checks pass.
- Packed NodeNext/Bundler declarations, Node/SSR import consumers and DCE pass;
  the release gate fails the existing exact bundle-size snapshot comparison.
- The browser matrix started against this task's fresh local static snapshot
  on port 34112. Source mutation in Yjs invalidated the run. The task-owned
  server was stopped; the existing server on port 3102 was left running.

The native goal is blocked after three repeated shared-checkout observations.
The ledger keeps adoption in progress and proof partial. Historical records
remain byte-for-byte immutable. The ledger helper accepts missing historical
references as stale evidence while requiring new/current references to exist;
its regression and command-path suite passes 23 tests. This is a Plate-owned
adapter correction; no reusable skill source or cross-project sync is needed.

Next: after concurrent source work settles and the shared-checkout failures
are resolved, rerun strict package/runner/Chromium proof, packed artifacts and
the full browser matrix. Keep the source fingerprints attached to each receipt.
No commit, push, PR, release, or feature-level redesign was performed.
