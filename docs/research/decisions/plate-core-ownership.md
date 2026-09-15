---
title: Plate core ownership
type: decision
status: implemented
updated: 2026-09-14
review_scope: plate-core
current_review: 2026-09-14-plugin-factory-mapping-implementation
review_history:
  - ../review-records/2026-09-12-plate-api-capability-identity.json
  - ../review-records/2026-09-12-distribution-public-ownership.json
  - ../review-records/2026-09-13-plate-plugin-extension-boundary.json
  - ../review-records/2026-09-13-shared-plugin-contract.json
  - ../review-records/2026-09-13-shared-plugin-identity-feasibility.json
  - ../review-records/2026-09-13-shared-plugin-identity-prototype.json
  - ../review-records/2026-09-13-shared-plugin-identity-production.json
  - ../review-records/2026-09-14-plugin-construction-inputs.json
  - ../review-records/2026-09-14-plugin-construction-inputs-reassessment.json
  - ../review-records/2026-09-14-plugin-factory-mapping.json
  - ../review-records/2026-09-14-plugin-factory-mapping-implementation.json
source_refs:
  - ../../plans/2026-09-12-plate-core-api-review.md
  - ../../plans/2026-09-13-shared-plugin-identity-feasibility.md
related:
  - ../reviews.md#plate-api
  - ../reviews.md#distribution
  - plite-core-ownership.md
---

# Plate core ownership

## Current implementation: mapped parameterized plugin factories

**The typed factory mapping contract is implemented for Plate Yjs and copied
collaboration composition.** Required app resources remain an explicit
options-to-plugin construction boundary, while one private input-to-descriptor
relation carries native capability inference across Plite, Plate, and copied
UI without handwritten API groups or forwarding overloads.

The public Plate and copied shapes are:

```ts
const Yjs = YjsPlugin.create({
  doc,
  initialReady: true,
});

export const CollaborationPlugin = YjsPlugin.require("awareness").map(
  ({ api, editor }) => ({
    decorate: collaborationCursorDecoration({ api, editor }),
  })
);

const Collaboration = CollaborationPlugin.create({
  awareness,
  cursorData: { validate: isCollaborator },
  doc,
  initialReady: true,
});
```

`YjsPlugin` and `CollaborationPlugin` are frozen non-installable factory
objects. They have `.create()`, `.require()`, and `.map()`, but no `name`,
`.extend()`, or `.configure()`. Each `.create()` returns one fresh complete
nominal unconfigured descriptor with its own resource closure and Yjs factory
token. Created descriptors retain ordinary author `.extend()` and terminal
consumer `.configure()`.

| Lane                                                  | Assessment                                                                                                                                                                                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep handwritten `createYjsPlugin` and copied factory | Runtime-correct but no longer the best target. Plate mirrors native API groups and four overloads; copied UI repeats a generic forwarding function. The capability owner can be preserved instead.                                             |
| Put required inputs on `.configure()`                 | Reject even with breaking freedom. It gives one verb two jobs across 185 current non-test consumer overrides, and an incomplete `YjsPlugin` must become either installable or a second template state. The lasting ambiguity buys no behavior. |
| Put resources on `.extend()`                          | Reject. Author contribution and external resource construction remain different jobs under an ideal design.                                                                                                                                    |
| Make every plugin a definition plus install tuple     | Reject. It taxes static plugins and descriptor lookup to replace an ordinary JavaScript constructor, while conditional copied composition still needs an input-to-output type relation.                                                        |
| Split Yjs base, presence and compaction into plugins  | Reject. Fixed APIs become easier, but one binding, namespace, admission and cleanup lifetime gains cross-plugin coordination.                                                                                                                  |
| Move plugin options to `createEditor`                 | Reject. Descriptor-keyed configuration relocates construction and weakens local discoverability without removing it.                                                                                                                           |
| First-class mapped plugin factory                     | Selected. It removes repeated type ownership and forwarding while retaining complete descriptors, exact capabilities, ordinary calls and one runtime binding.                                                                                  |

Current source has parameterized Plite constructors for `history`,
`dom`, `authored` and `yjs`. Most need no mapping today, so this review does not
force them into a heavier call syntax. The repeated current job is the Yjs
constructor crossing Plite to Plate and then Plate to copied collaboration UI.
A private factory witness and the existing Plate author-stage result owner
address precisely that path.

A throwaway type probe established the boundary: deriving a Plate result from
the native descriptor preserves direct document-only, presence and compaction
calls, but a naive single generic signature loses presence through the copied
generic preset. The existing four overloads are therefore compensating for a
real higher-order inference loss. The implementation preserves that relation
through exact validator-derived cursor data, optional presence and compaction
APIs, descriptor portals, React hooks, required-input mapping, and repeated
mapped stages. A cast, `ReturnType` alias, or prettier factory name alone
remains insufficient.

The implementation reaffirms the rejection of construction through
`.configure()` or `.extend()`. Existing shared-descriptor and collaboration
lifetime decisions remain adopted. The implementation record owns exact proof
and limits; unrelated native constructors remain unchanged.

## September 13 implementation: shared identity; product compilation preserved

**Pursue is implemented and proven in current production source.** Raw Plite,
configured headless Plate and React Plate publish one frozen nominal descriptor
family through one installed portal without moving Plate's product authoring
compiler into Plite.

The accepted ownership is:

```text
Plite definePlugin ─────────┐
                            ├─ one nominal PluginReference
Plate definePlugin ─────────┘
              ↓ Plate-only product compilation when applicable
private compiled entry + original descriptor + source ancestors
              ↓ Plite candidate publication
separate installed record and editor.plugin(Descriptor)
```

Plate keeps terminal configuration, ordered prior-stage inference, schema,
stores, codecs, shortcuts, rendering and lifecycle compilation. Plite owns
descriptor nominality, direct dependency/conflict admission, source ancestry,
installed records, atomic publication/rollback and editor/view portal
liveness. Raw Plite descriptors may retain their immutable normalized author
fields; the runtime stops treating the descriptor object as its installed
record.

The type boundary remains a lazy owner-supplied capability provider carried by
the shared nominal reference. Plite extracts the provider's return type and
never knows Plate's product fields. Direct generic constructor overloads and
homogeneous tuple fast paths keep the full 128-descriptor production workload
within budget: TypeScript check, instantiation and memory ratios are 0.856,
1.003 and 1.005 of baseline.

Current source preserves direct dependencies and conflicts, configured
ancestor lookup with sibling rejection, editor-local state, prior-stage APIs,
schema-derived behavior, exact DOM/SSR views, live portals and failed-candidate
rollback. Across 1, 32, 128 and 512 plugins, final Plate and raw runtime p50
ratios are all at most 0.846 of baseline. Direct descriptor maps and a mutable
unpublished candidate draft keep the measured path linear.

Public authoring and lookup use `definePlugin`, `plugins` and `editor.plugin`.
Synthetic stage/runtime extensions, `registerEditorExtensionAlias`,
`extensionByName` topology translation and the portal adapter are deleted.
No public `RuntimePlugin*`, `CompiledPlugin`, compiler registry, metadata
replacement or dual vocabulary survives.

Plate reaches Plite compilation through the explicit `plitejs/internal`
package bridge. That entrypoint owns one file; Plite's own DOM, React and other
public subentries continue to depend on their actual local owners. Public root
declarations and docs do not expose the compiled carriers.

The [production result](../../plans/artifacts/shared-plugin-identity-feasibility/production-result.json)
passes the frozen runtime/type budgets. Plite and Plate package suites, builds,
packed declaration/runtime consumers, SSR, DCE, exact entrypoint sizes,
API/registry generation and one Chromium exact mounted-view replay pass. The
remaining limits are a cross-browser matrix, package publication and
third-party application migration.

That shared-identity implementation is complete. The September 14 construction
review above is a separate follow-up and does not invalidate its proof.

## Earlier September 13 review: preserve lowering; prove shared identity

**Defer the proposed shared composition engine.** The previous review found
real translation machinery, then made an unsupported jump from “Plate creates
a Plite descriptor” to “Plate and Plite have duplicate plugin engines.” The
source proves the first claim. It does not prove the second.

The current boundary does two materially different jobs:

1. Plate resolves a contextual product authoring language into an editor-local
   model. Terminal configuration runs before ordered stages, each stage sees
   the accumulated Plate context, product schema generates default reads and
   updates, and stores, codecs, rendering and lifecycle behavior bind to the
   editor and view.
2. Plate manufactures raw extension references for author stages, remaps the
   resolved dependency graph by name, labels adopted capabilities as `native`
   or `plate`, and creates a fresh `defineExtension` descriptor for the Plite
   runtime.

The first is legitimate compiler lowering. The second contains credible
identity and coordination debt. Calling all of it an adapter that should
disappear hides the hard part and would likely move Plate's compiler into
Plite under a cleaner name.

### Hard-cut result

Deleting Plate's authoring compiler fails current product jobs. The
[resolver](../../../packages/platejs/src/internal/plugin/resolvePlugin.ts)
evaluates per-editor configuration and staged callbacks against evolving API,
store, schema and product context. The
[lowerer](../../../packages/platejs/src/internal/plugin/resolvePlugins.ts)
then derives schema-aware mark/element reads and updates and binds product
lifecycle contexts. Raw Plite has no equivalent authoring job, and its current
[extension contract](../../../packages/plitejs/src/core/editor-extension.ts)
deliberately accepts one immutable normalized definition. Its Vision explicitly
rejects an extension `config` channel.

Moving the complete stage/configuration grammar into Plite therefore fails the
delete test. It would make the substrate own a framework-building language for
roughly 190 Plate authoring files while the nine raw Plite source consumers do
not demonstrate that need. Typed extension-point contributions prove ordered
runtime aggregation; they do not prove prior-stage self-inference, terminal
configuration, product schema compilation or editor-local store assembly.

The maximum-value remaining cut is narrower and stronger:

```text
Plate plugin descriptor + Plate authoring/compiler
                         ↓
normalized Plite runtime publication keyed by the same descriptor identity
                         ↓
one installed owner and one descriptor portal
```

Keep the compiler boundary. Challenge the replacement identity and parallel
topology. In particular, attempt to delete the empty `defineExtension(...)`
references created by each author stage, `extensionByName` dependency remapping,
cross-system alias registration and late `native`/`plate` dispatch. Compilation
may still produce an internal normalized record; that record need not become a
second public nominal descriptor.

This target is not yet proven. Plite's candidate publication and exact-view
portals currently use immutable descriptors as runtime authority. Plate's
configured descriptor families are source identities whose meaning varies per
editor. Sharing identity across those lifetimes may require a clean
source/compiled-instance distinction, or it may recreate the same mapping with
different nouns. Type inference may also force a second normalized type carrier
even if runtime identity is shared.

### Naming judgment

Do not rename Plite `extension` to `plugin` yet. The rename is good only if the
identity prototype succeeds and leaves one public descriptor family and one
portal. Before that proof, `plugin` would imply an architectural unification
that does not exist.

If the prototype succeeds, `definePlugin`, `plugins` and `editor.plugin` are a
coherent cross-layer vocabulary, with Plate adding product authoring and
compilation around the same nominal descriptor. If it fails, the honest API is
the earlier semantic split: Plite extensions, Plate plugins, and layer-specific
accessors backed by one installed runtime owner.

| Material lane                                                              | Judgment                                                                                                  |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Rename `extension` to `plugin` on the current machinery                    | Stop. This is cosmetic and makes the boundary less honest.                                                |
| Move Plate's full authoring/composition engine into Plite                  | Stop. Raw consumers have not earned the added substrate grammar, state and type cost.                     |
| Delete Plate lowering entirely                                             | Stop. Product declarations still require normalization into Plite runtime capabilities.                   |
| Keep the current compiler and all identity translation                     | Viable fallback, but the empty references, alias graph and dependency remap remain suspicious debt.       |
| Keep Plate compilation but share one public nominal identity               | Best candidate. Defer until a bounded prototype proves that it deletes machinery rather than renaming it. |
| Restore separate `plugin` and `extension` portals over one installed owner | Fallback if shared identity fails; semantically clearer than one overloaded `extension`.                  |

### Decisive experiment and next owner

Build a disposable vertical slice with one raw Plite capability, one configured
headless Plate plugin and one React Plate plugin. All three must preserve exact
descriptor inference, dependencies/conflicts, configuration precedence,
prior-stage inference, schema-generated behavior, independent editor stores,
candidate rollback, mounted-view identity and static/SSR isolation.

The candidate passes only if Plate no longer creates synthetic raw descriptors
for author stages, rebuilds the dependency graph by name or needs a public
second descriptor family. Record the surviving compilation boundary and an
actual deletion inventory. Compare declaration emit/type instantiations and
construction/configuration/publication work with the current path. A new
`CompiledPlugin`, metadata bag or alias registry that replaces the old map is a
failed result.

Next: `$task design plan shared-plugin identity feasibility: prototype one
descriptor across raw Plite, configured headless Plate and React Plate before
choosing the vocabulary`.

Review acceptance: adversarially reconsider the previous Pursue verdict;
separate legitimate lowering from identity translation; run the hard-cut
counterfactual; state the naming consequence; record one decisive investigation
without product implementation or unsupported performance claims.

## Earlier September 13 review: one shared plugin contract

**Pursue redesigning the neutral descriptor/composition contract so Plate
plugins use it directly.** With that contract, one `plugin` vocabulary is a
credible target. This supersedes the accessor-only restoration recommendation
below: the user explicitly asks to change the lower abstraction, not merely
rename the current two contracts.

The earlier review established that product responsibilities are real, then
treated separate descriptor contracts as necessary to preserve them. That
inference was too strong. Product ownership can remain in Plate while both
layers share descriptor identity, composition, configuration, dependency
resolution and installed capability access.

The September 12 design compared putting all Plate semantics into raw Plite
with keeping the existing product compiler and enriching its installed lookup.
It did not adequately test the middle alternative: one neutral descriptor
protocol with typed, owner-specific contributions and one composition engine.
The distinction between that candidate and a renamed wrapper is whether the
second descriptor and capability translation actually disappear.

### Evidence and deletion target

[defineBasePlugin.internal.ts](../../../packages/platejs/src/lib/plugin/defineBasePlugin.internal.ts)
maintains ordered author stages and terminal configuration layers. Each
extension stage creates a raw reference. [resolvePlugin.ts](../../../packages/platejs/src/internal/plugin/resolvePlugin.ts)
then evaluates configurations/stages and labels API/read/update contributions
as `native` or `plate`. [resolvePlugins.ts](../../../packages/platejs/src/internal/plugin/resolvePlugins.ts)
translates dependencies and conflicts, adapts those factory contexts, and
creates another `defineExtension` descriptor for every resolved plugin.

The neutral [extension owner](../../../packages/plitejs/src/core/editor-extension.ts)
already provides nominal identity, immutable descriptors, dependencies,
candidate publication, lifecycle and typed contribution points. Its
[contribution tests](../../../packages/plitejs/test/extension-contribution-contract.test.ts)
specify ordered, descriptor-owned contributions, dynamic recomputation and
view access. The DOM clipboard handler is a real
[consumer](../../../packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts)
of this mechanism. These are useful starting primitives, not proof that the
current contribution API can replace Plate's authoring contract unchanged.

There are actual gaps. Raw schema factories receive only `{ name }`, and raw
`defineExtension` has no Plate-style ordered author/configuration grammar.
Plate's [authoring tests](../../../packages/platejs/src/lib/plugin/defineBasePlugin.spec.ts)
require inferred access to prior-stage capabilities, configuration before
stage evaluation and independent per-editor configuration. The shared target
must serve those jobs directly, or deliberately replace their call shapes with
something better. Moving the current product compiler wholesale into Plite
would merely move the complexity.

Delete candidates are the second nominal descriptor family, cross-system
source bookkeeping, plugin-to-extension dependency translation, `native`/`plate`
capability branching and the plugin-specific installed-access dispatch.
Ordinary source ancestry, authored/configured/installed lifetimes and exact
view binding remain necessary even with a common descriptor contract.

Representative product consumers support both parts of this cut. The
[static code-block kit](../../../apps/www/src/registry/components/editor/code-block-static.tsx)
configures a component and state on Base descriptors; the
[live kit](../../../apps/www/src/registry/components/editor/code-block.tsx)
adds shortcuts and input rules. The plain
[CodeBlockPlugin conversion](../../../packages/platejs/src/react/features/code-block/CodeBlockPlugin.tsx)
adds no runtime definition and is a deletion candidate under a common contract.
By contrast, [CommentsPlugin](../../../packages/platejs/src/react/features/comments/CommentsPlugin.ts)
adds real mounted-view permission and click behavior. Retain that behavior and
its entrypoint while challenging the separate conversion protocol. A bounded
read-only worker traced these product obligations; decisive references were
reconciled by the lead.

### Proposed ownership and public grammar

```text
Plite: one neutral plugin descriptor and composition/publication engine
  ├─ raw capabilities: schema, reads, updates, lifecycle and contributions
  └─ Plate-owned declarations on that same descriptor contract
       ├─ product configuration, feature policy and schema shorthand
       └─ static/React rendering, shortcuts, codecs and product state
                         ↓
             one installed owner and editor.plugin(Descriptor)
```

Proposed common vocabulary is `definePlugin(...)`, `plugins: [...]` and
`editor.plugin(Descriptor)`. Package entrypoints select raw or product authoring
support. Plate's helper may provide typed product syntax, but its result must
already satisfy the canonical descriptor protocol; installing it must not
manufacture a parallel plugin identity and translate its execution contract.

Start with existing typed contribution points; redesign them only for a
concrete missing author/consumer job. Do not add an opaque metadata bag, public
compiler graph, duplicate type accumulator or a general framework for defining
other frameworks. Exact schema and capability inference must work without
caller casts or callback annotations.

Plate still compiles product syntax into schema, rendering and behavior. That
is useful product work. The promise is to remove the second plugin engine,
not every helper or every compilation step. Product runtime stores must not
become transactional document fields merely to make all state look alike;
their persistence, history, mutation and view lifetimes require separate laws.

| Material lane                                                                | Judgment                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep the current two contracts under `extension`                             | Works, but retains descriptor reconstruction and capability translation.                                                                                                       |
| Restore separate `plugin`/`extension` accessors                              | Clearer for the current architecture; weaker than deleting duplicated descriptor machinery if the shared target preserves the jobs. Superseded as the next isolated migration. |
| Rename raw extension to plugin without redesign                              | Reject. Makes the APIs sound unified while retaining both engines.                                                                                                             |
| Put the complete Plate plugin definition in Plite                            | Reject. Rendering and product policy do not become substrate laws through a rename.                                                                                            |
| One neutral descriptor and composition engine with typed Plate contributions | Pursue. Reuse one installed owner and delete cross-system adaptation while keeping product compilation in Plate.                                                               |
| Force all authors to hand-assemble raw contributions                         | Reject as the ordinary path. It moves compilation and coordination into feature authors and consumers.                                                                         |
| Add a generic metadata/compiler framework                                    | Reject absent a specific missing capability. Existing contribution primitives must earn reuse; additional mechanisms must demonstrate net deletion.                            |

### Proof limits, acceptance and next owner

This is a bounded value review, not an accepted runtime design. Relevant source,
consumers and existing assertions were inspected. No new prototype, tests,
browser replay, type benchmark or runtime benchmark was executed. Earlier
registry and transaction measurements cannot certify this different target.

Before accepting it, demonstrate one raw capability, one configured headless
plugin and one React product plugin on the common protocol. The decisive proof
must preserve prior-stage inference, dependencies, schema identity, per-editor
state/configuration, exact-view APIs, failed-candidate rollback, static/SSR
isolation and finite declarations. Measure construction, configuration,
lookup/update work, retained state and compiler cost against the current path.
Require an actual deletion inventory; a new wrapper around both compilers fails.

Next: `$task design plan shared plugin contract: unify Plite and Plate descriptors and remove translation`.
Task owns the combined API, substrate, product adoption and proof decisions.
The first question is the smallest neutral composition/configuration and typed
contribution contract that deletes the existing translation without widening
raw Plite to product policy. Rename as part of that accepted migration.

Review acceptance: reconsider the previous verdict; inspect neutral and product
obligations; compare the strongest common-contract alternative; record the
candidate deletion, retained responsibilities, proof limits and one next owner.
No product implementation or doctrine change is authorized by this review.

## Earlier September 13 review: plugin and extension access

**Pursue restoring `editor.plugin(Plugin)` for Plate product access while
retaining Plite's single installed registry.** The September 12 plan coupled
two different decisions: removing duplicate installed authority and removing
the public distinction between a product plugin and a substrate extension.
The first earns its place; the second does not follow from it.

The originating [plan objective](../../plans/2026-09-12-plate-core-api-review.md)
explicitly removes `editor.plugin`, `tx.plugin`, duplicate installation maps
and `useEditorPlugin`. Its
[design contract](../../plans/artifacts/plate-core-api-review/design-contract.md)
rejects separate accessors because the product projection already includes core
capabilities. That argument treats a richer product contract as redundant
merely because it reuses a lower contract. The same design keeps plugin
authoring, configuration, state, schema presentation and React policy because
they have independent jobs. Consumer naming should reflect that distinction.

The plan is marked complete and its selected API is implemented. Its old
proof remains evidence for that implementation, not for the necessity of one
public verb. The current review changes the recommendation for `plate-api`'s
consumer contract only; it does not reopen distribution or undo shared identity,
compatible ancestry, direct transaction groups or private core construction.

### Decisive current evidence

- [Plate's editor type](../../../packages/platejs/src/lib/editor/Editor.ts)
  defines `extension` as the intersection of `GetBasePluginPortal` and the raw
  `EditorExtensionPortal` signature. The two contracts already exist.
- [withPlite.ts](../../../packages/platejs/src/lib/editor/withPlite.ts)
  publishes nominal Plate descriptors with a private portal factory. Plite owns
  the sole imperative `editor.plugin(descriptor)` lookup, while Plate supplies
  the product projection for its descriptors.
- [createPluginContext.internal.ts](../../../packages/platejs/src/lib/plugin/createPluginContext.internal.ts)
  owns the plugin cache, product store, published schema and product-field
  access. The raw [extension contract](../../../packages/plitejs/src/interfaces/editor.ts)
  exposes `installed`, `api`, `read` and `update`.
- [LineHeightToolbarButton](../../../apps/www/src/registry/components/editor/line-height-toolbar-button.tsx)
  reads `.inject.nodeProps` from the plugin projection, then runs its inferred
  update. This is a current product-consumer job, not hypothetical layering.
- [Native adoption tests](../../../packages/platejs/src/lib/plugin/defineBasePlugin.spec.ts)
  show a plugin adopting a raw extension and both descriptors reaching the same
  API owner. [Raw portal tests](../../../packages/plitejs/test/extension-portal.test.ts)
  specify presence, source ancestry and policy-scoped updates independently of
  Plate product fields.

A Plate plugin is a product declaration compiled onto Plite's extension
runtime. It need not be the same JavaScript descriptor object or a subclass to
share that installed owner. The proposed distinction is semantic access to
existing owners, not two installation systems.

### Strongest target and alternatives

Proposed consumer calls, using the current descriptor names:

```ts
// Plate product access: proposed restoration.
editor.plugin(LineHeightPlugin).inject.nodeProps;
editor.plugin(LineHeightPlugin).update.set(1.5);

// Raw extension access: retain the substrate contract.
pliteEditor.extension(WriterExtension).update.nested.append();
```

`WriterExtension` is the descriptor used in the existing raw portal test.
On a Plate editor that also installs raw extensions, inherited `extension`
access still has a job. The target gives plugin descriptors their product
access through `plugin` and raw extension descriptors their substrate access
through `extension`; it does not retain two equivalent spellings for the same
plugin projection. Both resolve through the same Plite installed owner.

| Lane                                                             | Verdict and reason                                                                                                                                                                                                               |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep one overloaded `extension`                                  | Coherent as a generic capability lookup, but obscures which product contract the caller receives while the implementation and authoring vocabulary still distinguish plugins. Fewer verbs do not remove the underlying concepts. |
| Restore product `plugin`, retain raw `extension`, share identity | Strongest direction. Align installation and authoring vocabulary with consumer capabilities without restoring installation maps, state or transaction enumeration.                                                               |
| Add `plugin` as an unrestricted alias                            | Reject. Two spellings for identical inputs/results would add redundant API. Define descriptor domains and projections instead.                                                                                                   |
| Delete plugin authoring and move product fields into Plite       | Reject. Product configuration, stores, schema presentation and React rules have current independent jobs; moving them pollutes the substrate.                                                                                    |
| Rebuild separate Plate installation authority                    | Reject. No product job requires a second source of installed truth.                                                                                                                                                              |
| Rename every plugin to extension                                 | Reject. Changes the vocabulary while retaining a distinct product compiler and fields, with no demonstrated consumer or runtime benefit.                                                                                         |
| Add another generic capability abstraction                       | Reject. Existing raw and product owners can serve both jobs.                                                                                                                                                                     |

The old transaction benchmark measured removal of per-update plugin-map work;
the reference probe measured canonical identity and ancestry. Neither compared
layer-specific accessors on that same registry. Their wins do not establish a
benefit from the public rename. No speedup or slowdown follows from this review.

### Proof limits and next owner

This is a bounded reassessment of the public accessor decision, not a new audit
of all Plate exports. Current owners, representative consumers and existing
assertions were inspected; no tests, browser or benchmark were rerun. Historical
production receipts remain unchanged. No product code or doctrine was edited.
A bounded read-only worker independently traced the current raw/product
dispatch and consumers; its findings agree with the source evidence above.

Adoption must preserve nominal descriptor inference, configured ancestry,
foreign/sibling rejection, optional presence, raw adoption, shared API/store
identity, candidate compilation, exact-view binding and stale-access handling.
The intended change reuses current runtime laws. Any proposed new runtime
machinery must earn separate evidence. Update public examples and the affected
Best API, plugin-authoring, Vision and Plate Next teaching as part of adoption.

Next: `$task design plan plate-api: restore plugin access over the shared extension registry`.
The first question is the exact plugin/raw descriptor boundary and how to bind
the existing product projection on runtime editors, candidates and derived
views without another registry or compatibility accessor.

Acceptance: originating plan and rejection rationale located; current product
and raw contracts inspected; material alternatives compared; one revised
verdict recorded with source identity. The earlier assessments below are
retained as history and superseded.

## September 14 correction: descriptor and name access in active transactions

**Use one overloaded `tx.plugin(pluginOrName)` selector.** Pass a descriptor
when the caller owns it and needs nominal identity with exact inference. Pass
the plugin name when importing that descriptor would create the wrong package
dependency. Both inputs select the already-materialized group on the current
transaction; neither creates another registry or opens a nested update.

Known literal names retain the group inference already carried by raw Plite
transactions. Widened names expose a dynamic command tree whose results are
`unknown`, and the runtime rejects names that are not installed or do not
publish transaction methods. Generated closed editors still expose direct
`tx.pluginName` groups.

This supersedes the descriptor-only correction below. That correction found the
right active-transaction owner but overfit nominal identity to every reusable
package boundary.

## September 14 correction: descriptor access in active transactions

**Restore `tx.plugin(Plugin)` for reusable transaction code while retaining
direct named groups for closed editor graphs.** Registry adoption supplied the
counterexample missing from the September 12 transaction benchmark. A copied
component can invoke optional plugins that are absent from the default generated
editor graph, while its callback still runs inside the host editor's one atomic
transaction. Importing the app-owned generated contract would make the copied
component non-portable; reconstructing every possible plugin in a handwritten
union made the application graph a second type owner.

Plite's transaction view already has the installed descriptor registry and the
compiled named groups. `tx.plugin(Plugin)` resolves the exact descriptor through
that registry and returns the existing group. It does not build another map,
open another update or admit a runtime name string. A foreign same-name
descriptor and an installed descriptor without transaction methods fail closed.
Plate projects synthesized plugin mutations through the same accessor for
generic callbacks. Generated editor transactions retain direct
`tx[Plugin.name]` groups and their complete graph inference.

The rejected alternatives were importing `plugins.generated.ts` into reusable
registry source, publishing a handwritten app-wide transaction union, restoring
a Plate-owned transaction map, or calling `editor.plugin(Plugin).update` from
inside the callback. Each either adds a second owner, couples reusable source to
one application, or leaves the active transaction. The corrected API instead
reuses the installed owner and active transaction that already exist.

## September 12 assessment (historical)

**Pursue a public contract with one installed capability identity and lookup,
owned by Plite and enriched by Plate.** The strongest cut is the second identity
and lookup protocol, not the Plate package. Plate should retain product rules,
configuration, plugin stores, codecs and presentation. A particular replacement
runtime is **not accepted** by this review: its contract and scale comparison
remain work for the next owner.

Expected questions: **2**. Reviewed: **2**. Excluded questions: **0**.
Unresolved verdicts: **0**. This is a question-level architecture audit, not an
exhaustive audit of every exported symbol or of the features housed in these
directories. Math, emoji and other independent feature reviews remain separate.

| Ledger question                                       | Verdict                                                     | Evidence and consequence                                                                                                                                                                                                                                                | Next owner                                             |
| ----------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `plate-api`: Plate plugin API and Plite facade        | Pursue contract design                                      | One authored plugin becomes a different installed extension; Plate maps the identities and supplies parallel plugin/schema/transaction access. Design one installed capability contract that preserves configured-family access and exact foreign-descriptor rejection. | Best API                                               |
| `distribution`: Public exports and package boundaries | Pursue a bounded public export cut; stop package regrouping | `getCorePlugins` publishes automatic framework composition without an independent caller. Keep its implementation private. Headless, React, static, compiler and optional-feature entrypoints have distinct consumers.                                                  | Best API, within the same Plate-core contract decision |

## Required jobs and hard laws

Application authors install inferred capability tuples and customize product
policy. Plugin authors compose dependencies, schema, pure reads, transactional
updates, services and presentation. Static renderers bind server-safe components.
Live adapters use DOM events and React hooks. CLI tooling evaluates the same
definitions into detached schema facts.

Preserve serialized schema identities and application overrides; capability
inference without caller annotations; rejection of unrelated same-name
descriptors; configured-family access; per-editor configuration and store
isolation; atomic failed-candidate cleanup; active transaction ownership; and
headless dependency isolation. A neutral extension must remain usable without
Plate product policy. Configuration callbacks may run during compilation, but
compilation must not activate resources or construct initial document content.

The ideal ownership flow is **proposed**, not the current implementation:

```text
app-owned plugin tuple and terminal configuration
                       ↓
Plate product declarations and presentation
                       ↓
one Plite installed-capability identity, schema and execution authority
                       ↑
one inferred capability lookup, enriched with Plate-owned product data
```

For example, a proposed surviving lookup is
`editor.extension(HeadingPlugin).update.toggle({ level: 2 })`, with Plate-specific
store and presentation access projected through that same installed reference.
The current application uses `editor.plugin(HeadingPlugin).update.toggle(...)`.
The next design must settle the exact author/consumer types; this example does
not assert that the proposed enriched portal compiles today.

## Plate API evidence

[Runtime lowering](../../../packages/platejs/src/internal/plugin/resolvePlugins.ts)
creates `extensionByName`, `extensionAliases` and `pluginBindings`. Each resolved
plugin is passed to `defineExtension`, and its family is paired with that new
extension. `resolvePlateRuntimeExtension` maps a plugin or adopted raw descriptor
back to the installed extension. This is observable duplication of ownership
protocol, not evidence of an extra canonical document or a measured slowdown.

[Editor construction](../../../packages/platejs/src/lib/editor/withPlite.ts)
replaces `editor.extension`, installs `editor.plugin`, wraps schema operations,
and transforms read/transaction views to lower plugin-valued node selectors.
Its transaction adapter also builds plugin method groups and a `tx.plugin`
lookup. The option-index tables must know which substrate methods accept node
types. Adding a matching substrate method can therefore require another Plate
mapping decision.

[Plugin access](../../../packages/platejs/src/lib/plugin/createPluginContext.internal.ts)
maintains authoring and consumer caches, schema publication access and product
stores. Some of this work has a real product job. The installed API lookup and
descriptor validation overlap the
[Plite extension owner](../../../packages/plitejs/src/core/editor-extension.ts),
which already resolves installed descriptors and capability execution. Today's
Plite exact-descriptor lookup does not by itself implement Plate's configured
family semantics. Simply deleting the adapter would break valid callers.

[Executable contracts](../../../packages/platejs/src/lib/plugin/defineBasePlugin.spec.ts)
show both accessors returning the same service object, adopted raw extensions
resolving to that service, unrelated same-name descriptors being rejected,
native and Plate updates combining, and configuration resolving per editor.
These laws must survive. They do not establish that two public lookup families
are necessary.

The Base/React distinction has a stronger case than unconditional deletion.
[React authoring](../../../packages/platejs/src/react/plugin/PlatePlugin.ts)
owns mounted-view attributes, DOM handlers and root slots. The
[paragraph adapter](../../../packages/platejs/src/react/plugins/paragraph/ParagraphPlugin.tsx)
adds keyboard behavior. The
[equation adapter](../../../packages/platejs/src/math/react/EquationPlugin.tsx)
only lifts types through `toPlatePlugin`; it illustrates conversion overhead,
but does not justify deleting every adapter. Keep genuine React publication at
its entrypoint. Do not settle constructor names or erase contextual inference
merely to remove this conversion call.

| Design lane          | Judgment                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep/configure       | Correct composition exists, but callers cannot remove the duplicated descriptor translation or choose a single complete portal through configuration.                                                                                    |
| Change existing API  | Pursue a single installed capability reference and lookup with inferred Plate projections. Preserve the root service/read/update paths for their distinct execution jobs.                                                                |
| Add primitive        | Add or extend only the neutral descriptor/publication capability needed by the canonical owner. No generic adapter registry, new public compiler graph or second store.                                                                  |
| Delete/merge/inline  | Strongest direction: remove the separate installed plugin identity/lookup protocol and selector remapping where the canonical descriptor owner can perform it. Keep product-only lowering private.                                       |
| Move ownership       | Installed identity, dependency admission and schema-handle resolution belong to Plite. Product defaults, transient plugin state, editing policy and React publication belong to Plate.                                                   |
| Replace architecture | Moving all Plate semantics into raw Plite loses substrate independence; moving everything into copied kits duplicates shared framework behavior. Neither wins. A unified installation implementation remains provisional until measured. |

The material benefit is fewer places that must agree about descriptor identity,
schema selection and installed dispatch. No speedup, allocation reduction or
native parity is claimed. A design must compare initialization, plugin counts,
repeated reads/updates, per-editor configuration and failed publication against
the current owner before accepting its runtime architecture.

## Distribution evidence

[The root](../../../packages/platejs/src/root.tsx) combines core and individual
standard capabilities. [Core](../../../packages/platejs/src/core.tsx) reexports
Plite and explicitly replaces framework contracts. The
[manifests](../../../packages/platejs/package.json) and matching
[Plite manifest](../../../packages/plitejs/package.json) separate framework,
runtime and optional peers.

The clear cut is the public export of
[`getCorePlugins`](../../../packages/platejs/src/lib/plugins/getCorePlugins.ts)
and its construction-only types. Its nine-descriptor array is consumed by
editor construction. Source search found no independent app, plugin or CLI
consumer of the function. Keep automatic defaults and their private assembly;
do not expose another way for applications to reproduce framework membership.
This is an export-only cut with unchanged runtime work, so its scale gate is
not applicable.

Do not classify every internal-looking export as removable.
`isNominalPluginDescriptor` is consumed by
[CLI generation](../../../packages/cli/src/generate.ts) and
[migration entry validation](../../../packages/cli/src/run-migration.ts).
That boundary validation is a current job. Its eventual identity predicate can
follow the canonical descriptor decision; deleting validation now would weaken
the CLI contract.

| Consumer class                          | Current evidence                                                                                                                                                                  | Boundary judgment                                                                                                                           |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary live editor and product policy | [EditorKit](../../../apps/www/src/registry/components/editor/plugins.ts), [basic block kit](../../../apps/www/src/registry/components/editor/basic-blocks.tsx)                    | Keep app-owned arrays and Plate imports. No package-owned editor preset.                                                                    |
| Static/server rendering                 | [BaseEditorKit](../../../apps/www/src/registry/components/editor/plugins-static.ts), [static block kit](../../../apps/www/src/registry/components/editor/basic-blocks-static.tsx) | Keep server-safe descriptor/component binding and the static entrypoint.                                                                    |
| Headless creation                       | [creation boundary test](../../../packages/platejs/src/lib/editor/createEditor.runtime.spec.ts), root source and manifests                                                        | Keep a root that does not construct the React extension. The test was inspected, not rerun as packed Node proof.                            |
| Optional feature engines and assets     | Feature exports and [registry dependency selection](../../../apps/www/src/registry/registry-package-dependencies.ts)                                                              | Keep independently consumed subpaths, including math/emoji and explicit virtualization. Do not merge their feature semantics in this audit. |
| Detached schema tooling                 | [compileEditor](../../../packages/platejs/src/compiler/compileEditor.ts), [CLI](../../../packages/cli/src/bin.ts)                                                                 | Keep optional compiler/CLI workflows. Ordinary editor setup does not require generated contracts.                                           |
| Raw substrate and facade consumers      | [Plite extension owner](../../../packages/plitejs/src/core/editor-extension.ts), [packed proof runner](../../../tooling/scripts/check-plite-release-artifacts.mjs)                | Keep the raw distribution and exact facade exceptions. Do not replace them with duplicated package implementations.                         |

Keeping the two distributions and current category of entrypoints beats merging
all exports into a root, splitting every feature into another npm package,
adding a `/basic` taxonomy, or moving reusable framework behavior into kits.
Those alternatives lose optional dependency isolation, add another distribution
concept, or recreate a shared implementation in callers. No new package or
entrypoint is justified by this review. Every optional subpath still needs
packed runtime and declaration proof during adoption; manifest metadata alone
does not prove dependency closure.

## Earlier decisions, proof and next action

Neither question had a direct review record. Both records are initial. The
[Plite-core review](plite-core-ownership.md) retained atomic extension composition;
this assessment preserves that law and challenges the separate Plate identity
translation above it. It does not reopen the completed facet/command cuts.
The [facade decision](../../plans/2026-08-30-enforce-plate-facade-dogfooding.md)
and [package ownership decision](../../plans/2026-08-28-finalize-platejs-entrypoint-ownership.md)
are reaffirmed in direction after source inspection. Their old proof is not
reused as current verification. Earlier plugin-authoring plans preserve static
isolation and inference requirements, not an irrevocable constructor taxonomy.

Observed verification: **38** Base/plugin-access/codec-context tests, **18**
React constructor/adapter tests, and **20** package-proof runner tests passed.
The last group tests the runner with fixtures; it is not a fresh packed release
of this checkout. No full typecheck, browser, native-device, benchmark, packed
consumer or release pass was performed. The shared checkout is changing during
the review; immutable records bind inspected source, while test results describe
the observed commands rather than a release certification.

Required adoption teaching repair: one installed lookup and descriptor
projection, any removed public core-list exports, examples, inference contracts
and packed facade exceptions. Update Best API, the relevant Plate/Plite Vision,
plugin authoring/UI rules and Plate Next doctrine only when the public target is
accepted and adopted. This read-only assessment does not change those owners.

First action, ranked above the export-only cut:

`$best-api design plate-core: one installed capability identity and lookup; retain Plate product policy and truthful package boundaries`

Settle configured-family versus exact-descriptor semantics and inferred product
projections first. Name the precise adapters that disappear and the runtime
comparison required before adoption. No implementation plan or product change
is authorized by these Pursue verdicts.
