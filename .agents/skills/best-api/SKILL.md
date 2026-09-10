---
description: Design, review, audit, or repair Plate/Plite public APIs for materially better DX, AX, simplicity, and scalability without speculative machinery. Use before layer plans when API shape is the real decision.
argument-hint: '[design|review|audit|repair] <API surface | diff | plan | correction>'
name: best-api
metadata:
  skiller:
    source: .agents/rules/best-api.mdc
---

# Best API

Apply [the Plate workflow](../task/references/workflow.md) for plan, authority, proof and review ownership.


Handle $ARGUMENTS.

Own the public call-site decision. Start from the cleanest truthful API that
Plate and Plite should want long term, then account for adoption cost. Current
code, compatibility, plans, and machinery are evidence, not requirements.
Breaking proposals are valid when they buy materially better lasting value.

Here, "best" means the smallest truthful surface that materially improves a
current user, author, or agent job while preserving hard runtime and type laws.
It does not mean maximum capability, abstraction, generality, symmetry,
extensibility, or rubric score. A more sophisticated API with no material
present value is worse.

This is a taste and decision skill, not an implementation engine:

If the unresolved question is whether the proposal earns any further work,
`best-api-review` owns that assessment and applies the ideal-first and hard-cut
methods here across current, changed and new APIs. It must expose the strongest
plausible breaking direction before its worth-it verdict, rather than defer
that possibility while endorsing existing-API glue. Use this skill when the
detailed public design needs to be chosen or reviewed; do not make either skill
a mandatory prelude to the other.

- `VISION.md` and `docs/vision/**` own durable doctrine.
- `best-api` applies that doctrine to concrete API shapes and repairs it when
  reusable taste changes.
- `editor-audit` owns exhaustive comparison against one or more external editor
  source trees and routes only material public-shape candidates here.
- `plate-plan` and `plite-plan` own layer architecture, adoption, execution,
  and proof after the target API is chosen.
- package, `task`, and supervisor skills implement accepted work.

## Modes

Infer the mode when omitted:

- `design`: choose the smallest materially justified API for a new or
  redesigned surface.
- `review`: judge one current/proposed API, diff, or plan and recommend the
  better target.
- `audit`: inspect a bounded surface and publish ranked P0-P3 API debt.
- `repair`: update this source rule and the smallest durable Vision owner after
  a reusable correction changes API taste or routing.

Do not invent more modes for workflow stages that another skill already owns.
Do not create a goal, plan, panel, or ledger for ordinary `design`/`review`.
Use an active plan when one already exists; write an audit artifact only when
the requested scope needs durable ranking.

## Required Inputs

Read only what can change the decision:

1. Root `VISION.md`, `docs/vision/common.md`, and the relevant Plate or Plite
   detail file.
2. The public types, exports, docs, representative call sites, and owning
   implementation for the named surface.
3. Existing plans or compatibility constraints only after the ideal target is
   independently clear.
4. For an exhaustive external editor comparison, consume `editor-audit`
   evidence. Inspect external precedent directly only when a narrow unresolved
   call-shape question still needs it. Familiarity is a useful prior, never a
   ceiling.

User-stated product requirements, correctness, security, serialized data, and
runtime laws are hard constraints. Incidental implementation structure is not.

## Two-Pass Decision

### 1. Redesign from First Principles

Apply the full [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md)
method before choosing or reviewing the target. This is the governing principle
of `next` beta. Name the current user job and hard laws, then ask what we would
build if those requirements had been present from the start. Existing substrate
primitives and proposed abstractions must both earn their place. Reuse an
accepted comparison while its requirements and evidence remain valid.

Ignore migration convenience and design the smallest honest public surface.
Show concrete call sites, including their real public imports, before naming
abstractions:

- the normal path;
- one realistic customization path;
- the advanced or escape path only when a real job needs it.

If the normal path needs explanation before it reads naturally, the API is not
done.

Do not review a call expression in isolation. Resolve where every public noun is
owned and imported from: root, feature entrypoint, registry, or app. A
short call site with the wrong owner is still a bad API.

When a reusable primitive and a complete composition collide on the same noun,
keep the primitive's established semantic name and name the composition after
its higher owner. Do not rename the primitive to `*Content`, `*Surface`, or
another implementation-role noun merely to preserve a vague aggregate name.
Delete caller aliases by fixing the colliding owner.

### Maximum-Value Hard-Cut Gate

Before proposing a local improvement, pressure-test the whole touched ontology.
Current and proposed nouns, namespaces, plugins, abstractions, owners, layers,
and packages are candidates for deletion, not protected planning boundaries.

For every touched concept:

1. Test deleting it and routing its current jobs through an existing canonical
   owner.
2. Test merging or inlining it when deletion would leave only private mechanics.
3. Look one owner above the named surface. Ask whether the capability is merely
   an input adapter, view, query, policy, or payload of an authority that already
   exists.
4. Keep it only when a hard correctness, security, serialized-data,
   native-behavior, or runtime law requires the boundary; the user explicitly
   requires it; or source proves an independent current user job.
5. Select the largest deletion cone that preserves those laws and jobs. Name the
   single surviving authority and any private adapter that still earns its keep.

Call count, implementation size, tests, docs, compatibility, migration cost,
and an accepted plan do not prove independent ownership. They may change the
adoption sequence only. A review is incomplete if it recommends renaming,
moving, or wrapping a surface that can disappear. When the user asks for harsh
honest feedback, lead with this strongest materially justified cut even when it
invalidates the current plan or creates a large blast radius.

Apply the package-kit gate before approving any `*Kit` call site: a package root
must not export a named plugin-array preset. Feature and facade packages export
individual descriptors, operations, and types; a facade may reexport them but
must not own their composition array. App or registry source owns named readonly
plugin arrays and their membership/order policy. When several plugins are truly
inseparable, encode them as `dependencies` of one honest capability descriptor,
not as a package-exported array.

Keep a feature's React root integration on its existing plugin. A companion
plugin needs an independent capability; protection from deliberate slot
replacement is not one. Each structural slot accepts one component. Compose
wrappers with JSX inside that component instead of adding slot arrays or a
wrapper pipeline. Replacing a root slot owns its integration and cleanup;
changing sibling presentation slots preserves the root integration.

Apply the same ownership test to serializers and exporters. A package owns
format semantics, conversion mechanics, validation, and format-required
defaults; app or registry source owns optional visual presets. A public export
API may accept one exact caller-owned stylesheet when that customization is a
real job, but it must not inject a hidden product theme or expose an additive
"custom" override whose meaning depends on package styling. Keep CSS in the
package only when focused proof shows that exact rule is required for format
correctness or fidelity.

One-shot file conversion belongs in a standalone operation when it owns no
installed state, lifecycle, codecs, or editor commands. Needing the editor's
configured decoder does not justify a plugin that only captures an editor;
pass the editor at that boundary. Keep clipboard integration on its installed
plugin. Shared conversion dependencies stay private, and independently used
file operations get subpaths whose import graphs exclude sibling converters.

Consolidating verification helpers must preserve each caller's failure policy.
Keep strict error capture explicit on the existing recorder rather than copying
listeners or silently adopting a narrower filter. Test capture and cleanup
behavior through that owner; private function spelling is not proof.

Package entrypoints must tell the truth about dependency reachability. A root
may expose only code backed by its required dependencies. Code requiring an
optional framework or runtime peer belongs behind an explicit subpath whose
packed JavaScript and declarations are proved without unrelated peers. Do not
use package-wide optional metadata to excuse a root or sibling subpath leak.
Do not add a vague `basic` subpath to avoid deciding root ownership. A facade
root may export individual, broadly expected standard editor capabilities, but
application source owns their preset membership and order. Source size is not
ownership evidence: an independent product workflow gets its own feature
subpath even when its first implementation is small.

A public package needs an independent current user job, not merely shared
implementation. Framework-wide headless contracts belong in the framework
facade root, framework-wide React contracts belong in its React subpath, and
one-owner helpers stay with that package or copied registry item. Do not
publish generic `utils`, `react-utils`, class-name, or wrapper packages merely
to avoid colocation or give internal helpers separate versions. Optional peers
can isolate a justified package entrypoint; they cannot create a package job.
Test infrastructure may earn one public package when testing is its independent
user job. Keep that package's root headless and Node-safe, put framework and
runner integrations behind explicit subpaths, and do not publish one npm
package per environment.

Build-time tooling consumes detached, immutable facts. Share the runtime's
validated lowering, then stop before document construction, resource activation
or publication. Configuration and validation callbacks may still run; do not
describe compilation as side-effect-free. Keep caches, stores, candidate graphs
and runtime owners private. A type-only projection is justified only by an
actual tooling job whose exact property domains cannot be expressed through
the existing public descriptor types; it must reuse the same inference owner.

Neutral behavior belongs in the substrate even when the framework adopted it
first. Preserve one implementation and exact facade identity; keep framework
authoring and presentation policy in their own layer.

DOM-scope hooks accept the DOM capabilities they read. Identity-only registries
use object keys. Do not require an erased mutable Editor for either job: its
unrelated write variance can reject a correctly inferred document. Preserve
the inferred editor in proof instead of widening fixtures or casting callers.

Dynamic lowering reuses the ordinary descriptor constructor and semantic
read contracts. Keep unavoidable type erasure inside that validated private
compiler boundary; do not publish a second unchecked constructor or expose
candidate caches merely so another package can read its own contributions.

Heterogeneous installation inputs use the existing nominal descriptor reference;
normalized definition witnesses describe capabilities, not installable values.
Keep exact schema and callback projections deferred at that boundary, with
unchanged inference, negative capability checks and packed-consumer proof.

Command-only policy belongs in its command handler. Do not publish transaction
methods merely so that handler can call its own implementation. Resolve
applicability from the command's current state before constructing a transaction;
preserve uncommitted state, schema fitting, metadata and rollback semantics.

UI commands bind to the exact mounted view through an existing semantic provider.
Keep mount registration private and reuse the substrate's command facade;
application IDs and shared model identity cannot identify a mount. Preserve
model-owned schema, plugin state and history while root, DOM, current permission
and retirement belong to the view. A passive provider may bind existing controls
to an existing command editor without allocating another runtime. Capture that
editor for an interaction's lifetime; removal rejects stale writes instead of
silently targeting a replacement. Preserve an independently useful initial
selection policy before focus.

Provider consumers receive semantic state or an exact mounted DOM reference.
Keep provider lookup, atom tables and generic field setters private when their
only job is lifecycle implementation. Configure lifecycle policy through its
owning component, preserving scoped lookup and cleanup through the existing
provider rather than adding another public state owner.

A default implementation and a caller-supplied implementation of the same job
share one public constructor and lifecycle. Make the implementation an optional
input; do not publish a parallel advanced factory, hook or snapshot reader.
Preserve committed reconfiguration and cleanup in the surviving owner.

A framework facade over a lower distribution has one executable exception set,
not a hand-maintained copy of the lower API. Every non-exception export must be
present by runtime identity; every replacement or omission must be deliberate
and tested from packed artifacts. Only exact facade, proxy, or replacement
source leaves may import the lower distribution; a package directory is not an
import owner. All other first-party framework source, including plugins,
features, components, specs, type tests, and fixtures that model
user-authorable work, dogfoods the facade or matching framework entrypoint.
Broad test-glob exemptions are forbidden; only exact lower-distribution parity
proofs may bypass the facade. Downstream packages and applications do the same,
so no authoring path can depend on bypassed names or versions.

### 2. Reality check

Then inspect current ownership, runtime truth, adoption, inference, and breaking
cost. Keep the ideal target visible. Prefer a staged hard cut over a permanent
hybrid when compatibility would make the final API worse.

Never silently downgrade the target because the current implementation already
contains a registry, profile, lifecycle, builder, compatibility alias, or
accepted plan. Say when those should be deleted, hidden, or redesigned.

### Long-Term Target Gate

Implementation difficulty never gets a vote in the API verdict. A compiler
limit, declaration-emitter failure, compatibility burden, release deadline,
existing workaround, or accepted implementation plan may change sequencing;
it never changes which public shape wins.

When the ideal call site is blocked:

1. Keep the direct long-term call site as the recommendation.
2. Trace the blocker to its owning generic, compiler boundary, runtime layer,
   or package contract and name the durable repair there.
3. Reject new casts, annotations, aliases, wrappers, markers, internal
   carriers, generated facades, or parallel APIs whose only job is to avoid
   that owner repair.
4. If an existing containment must remain while another owner is repaired,
   label it temporary debt with a deletion proof. It is not the selected API,
   completion evidence, or a current-doctrine attestation.
5. Route adoption and implementation to the owning plan or package skill. A
   `best-api` design decision may finish once the durable target and owner are
   unambiguous; the affected API migration remains open until that target is
   real.

Do not call a workaround "pragmatic" and quietly make it architecture. If the
durable fix is large, report the real blast radius and still choose it.

### Scale-Sensitive Target Gate

Before accepting a public target that adds, retains, or changes a runtime
layer, cache, index, projection, store, subscription, scheduler, geometry
owner, repeated-unit fan-out, or other hot work, invoke Benchmark's embedded
pre-acceptance architecture probe. Freeze the scale variables, cohorts, budget,
baseline, target path or disposable prototype, deterministic cost indicators,
timing/noise rule, source identities, and correctness guard before reading the
target result.

The target remains `provisional` until that executable comparison passes. An
asymptotic argument, complexity table, review score, profiler suspicion,
benchmark plan, or promise to measure during implementation cannot justify the
runtime noun or owner. If the result is inconclusive, cut the machinery or hand
off a `defer`/`gate` decision with the next probe; do not call it the best API.

Best API may settle call syntax without this probe only when live source proves
the competing call shapes share the same runtime law and the verdict explicitly
does not retain or create runtime machinery. Type-only and zero-runtime work
may record N/A with that source evidence.

### Canonical Read And Projection Gate

Match invalidation queries to the consumer's dependency. Entity presence,
payload, position, and geometry are different questions. Reuse the canonical
change owner for a missing precise query; do not make an existence check build
all shifted paths or introduce a second change store. An immutable result is
shared across readers, and a known negative answer must not trigger a global
search. Prove both affected and unchanged follow-up reads at scale.

For a recurring editor render dependency, expose the semantic projection at
the existing React state owner instead of making copied callers repeat commit
invalidation flags. `useEditorHasSelection()` owns selection presence;
`useEditorSelection()` owns the range. Reuse the canonical subscription and
boolean equality without a parallel store or a hook for each arbitrary predicate.

When an application record refers to a document-owned entity, use that entity's
identity for its location and lifetime. Do not allocate a second location or
mirror document commands into persistent application status merely to hide a
view. Explicit application resolution remains independent; command, undo/redo,
and external document updates must yield the same derived visibility. Keep
mixed presentation in its existing composition owner instead of adding peer
data dependencies or one-consumer presentation props.

Complete transient document inputs through their current node identity. The
owning feature checks liveness and edit eligibility at action time, then removes
and replaces the input in one transaction. Keep query text and DOM navigation
with the copied control; do not persist a second path, location anchor, or
completion flag when the document already supplies identity and lifetime.

Do not confuse an internal canonical carrier with the best public read. A
carrier may need tags, bookkeeping, or extension payloads to preserve runtime
truth while the common caller needs one established domain value. In that
case, return the domain value directly and keep the carrier behind its owner.
Making every caller decode internal protocol machinery is API leakage, not
honesty.

Give the high-frequency read the shortest unqualified name. Do not surround it
with vague singular projections such as `primary`, `current`, `resolved`, or a
noun-specific alias that merely chooses the normal answer. A public read should
answer one caller job without exposing how the owner stores or derives it.

Choose package ownership by the contract before counting consumers. A semantic
algorithm or durable headless lifecycle can belong to the existing feature
with one current caller. Prefer its scoped API over a new helper export or
package. Plate UI's extraction test owns the split from renderer-specific
calculations, state and composition.

When public authoring compiles a semantic classification into a private group,
registry key, or tag, expose that fact through a named read on the owning
facade. Callers must not spell the private carrier or rebuild it from concrete
plugin names. Keep gesture and presentation policy in their own owners.

Keep a projection only when it has a distinct current job and meaning. Lossless
plural projection may stay explicit. Browser, input, transport, or rendering
projection belongs to that literal protocol owner. A hook that always returns
its input, the common read, or a constant has no independent public job and
should be deleted. Preserve an exact carrier publicly only when callers have a
proven independent job that requires its complete payload; implementation and
compatibility are not such jobs.

Do not persist presentation or performance partitions as document nodes. A
structural child must own grammar, properties, commands, addressing, or a real
semantic region. Keep multiline source in one newline-bearing Text when lines
have no such job, derive physical lines from offsets, and keep token wrappers
transient through Decorations. Scaling belongs to the renderer or runtime; it
does not justify public chunk controls or a second persisted schema.

An external editable-text view is one render projection for a non-void block
whose only child is one Text. Plite keeps canonical text, selection, history,
schema, and collaboration; the adapter owns its DOM, input surface, layout, and
local native features. Give it versioned exact patches and narrow edit,
selection, focus, and composition actions. Never expose the editor, node key,
path, or transaction as an adapter escape hatch. The external and native
branches are exclusive: no hidden duplicate text DOM, no second history, and
no requirement for fixed height. Adapter-internal rendering or virtualization
does not become document virtualization or a code editor inside Plite.

When callers repeatedly combine generic traversal with one canonical owner
predicate, promote that semantic job as a named read on the traversal owner.
Do not add a boolean mode flag, a parallel namespace, or filtering options to
an exact projection. Use a singular name for one nearest result and its plural
for all relevant results. Keep generic traversal as the escape path. Mutation
namespaces may name the semantic target, but must reuse generic structural
verbs instead of publishing aliases for them.

Schema-default block conversion is one semantic mutation:
`tx.blocks.reset({ at? })`. Resolve each target against its immediate parent or
document-root default and apply the new type through the schema property
lifecycle so children, selection, live identity, and allowed properties retain
their canonical owners. Feature commands keep their guards and delegate this
structural step. Reject feature-local default-node replacement, reset aliases,
and type or mode knobs on this exact operation.

### Transient View Lifetime Gate

Choose an existing lifetime owner before naming a public view abstraction.
Inline transient paint is a Decoration. A durable logical range is an
Annotation. Logical out-of-flow UI is a Widget. Delete a proposed overlay,
projection, view, layer, or manager API when it only renames one of those jobs
or combines them for one product component.

The normal Plate authoring path is the owning plugin's `decorate` descriptor:
`{ read, observe?, attributes? }`. Its reads return keyed ranges with render-safe attributes.
Plate lowers those descriptors privately into the sole raw Plite
`<Plite decorations>` input and routes plugin-store invalidation through
`observe`. Do not make ordinary Plate callers construct a Decoration source,
renderer registry, Widget store, manual refresh call, or parallel public plugin
merely to install product behavior.

Package decorations publish neutral identity attributes. Copied UI owns color,
opacity, and other visual defaults through `decorate.attributes`: a safe
attribute object, a pure inferred-context callback with `entry` and
`decoration`, or `null` to clear inherited presentation. Configure presentation
without repeating the reader or observer. Keep optional feature selectors out
of generic Editor skins. Use the existing keyed cursor read for per-peer paint;
do not add a theme API, parallel plugin, cursor cache or observation channel.
Classes concatenate, styles merge shallowly, and later presentation values win
other attribute collisions. Callbacks add no subscription; `observe` owns
external invalidation. A new decoration capability still requires `read`.
A contribution created by an earlier author stage is available to a later
`.extend()` stage, not to `.configure()` callbacks that run before author stages.

An embedded editor may own capabilities that depend on its incremental document
state, such as syntax parsing. Omit the duplicated provider when every view
uses that editor. Mixed native and external views may keep the provider; the
external renderer discards only contributions with that provider's explicit
identity attribute. Never infer ownership from CSS classes or discard neutral
annotations along with syntax. Keep parser controls inside copied UI, outside
the external-text protocol.

Sparse attributes on whole element hosts have a different shape. Author them
through `render.useViewElementAttributes`, one React hook host per enabled
plugin per mounted Plate view. The callback receives the exact `view` and
returns `{ key, attributes }[]`; Plate privately owns source identity, compiled
plugin precedence, publication, cleanup, and per-`NodeKey` subscriptions.
Allow only `className`, `placeholder`, `style`, and `aria-*` / `data-*`
primitives. Keep `render.attributes` and `inject.nodeProps.transformProps`
pure and hook-free because they run conditionally for rendered nodes. Do not
publish the provider, store, source ID, manager, or imperative publisher.

Raw Plite has one transient paint path. `PliteDecorationSource` returns
`{ key, range, attributes }`; `Editable` renders those attributes without a
second paint callback. Annotation stores use `PliteAnnotationProvider` and stay
independent until a feature deliberately adapts resolved annotations into a
Decoration source.

Annotation ownership follows lifetime, not convenience. React components use
`usePliteAnnotationStore` plus `PliteAnnotationProvider`. A framework adapter
whose store must exist before React mounts uses `createPliteAnnotationStore`
from `plitejs/annotations`. Do not re-export the constructor from
`plitejs/react`, publish an `/internal` bridge, or force a framework owner
through a hidden component merely to reach a hook.

The Comments package owns loaded thread records, comment actions, targeted
subscriptions and native range lifetime. Applications fetch and persist plain
records; copied UI owns presentation. Configure fetched records through
`initialState.initialThreads`, replace them through `api.setThreads`, and save
`api.getThreads()` with the matching document value. The initialization input
is a seed, not a second live thread store. Keep one keyed record owner inside
the semantic plugin and reuse Plite Annotation for range projection; the React
plugin adds interaction. Do not make consumers assemble a channel, provider,
factory-bound source, native handles or anchor-binding effect.

Load existing records with their IDs, authors, timestamps and status intact.
Constructor input and later replacement share one atomic preparation path;
loading does not replay user commands, impersonate authors or use a fake clock.
User records and current identity use the ordinary plugin store. Database I/O,
authentication and server authorization remain application responsibilities.

Native range handles belong to their creating editor. Each editor binds its
own handles from records associated with its document revision. UI composition
reads locations and precise changes from the canonical Annotation projection.
Activation stores an ordered ID group, not unmapped click coordinates. Keyed
body or metadata writes preserve unrelated records and membership snapshots,
with zero annotation resolution and zero editor-node refreshes. A copied
composer clears only after its action succeeds, including asynchronous action
overrides. Suggestion replies use the suggestion ID and location; accepting,
rejecting or restoring the suggestion changes visibility, not thread resolution.

React plugin-state subscriptions use `usePluginStore` with an installed typed
descriptor. Optional feature composition checks `editor.plugin(plugin).installed`
before mounting the subscribing child. Use the selector's `{ id }` option to
select a registered editor outside the nearest provider. Missing installation,
store, or state field fails loudly. Do not add nullable wrapper hooks or copy
portal, store subscription, and `useSyncExternalStore` plumbing into product or
registry hooks.

Controls calling semantic plugin commands use the typed portal without
subscribing to its store. Delete controller facades that rename commands or package
selectors with copied UI effects. Keep deferred input execution in the copied
input owner, so mounting another button cannot initiate or clear a search.
API factories bind their `editor` to the exact editor or mounted view whose
API is accessed. Capture that editor inside the API factory for view work;
outer descriptor-construction callbacks retain their model lifetime. Keep
plugin configuration and semantic document state shared. A base or retired
editor must not select another mounted view for focus, scrolling or paint.

Temporary arrival feedback belongs to the mounted view. Use canonical
root-local keys and call-time safe attributes for whole-element presentation;
do not mirror the active target into a model store, transaction effect, path
anchor, variant vocabulary or subscriber kit. Complete navigation commands
stay with the feature that owns their selection, focus and scroll policy.

Keep a copied search bar's open state, pending draft and activation in its exact
Editable composition. Reuse `slots.wrapRoot` for view-owned commands consumed
inside that Editable's slots; do not put those commands or state into the model
plugin store. Shared committed query/results keep their headless owner. An
inactive or detached view must not execute another view's focus or scroll work,
and detaching UI must not erase the model's semantic search.

Plugin initial state is a complete top-level record. Every declared field is
required and excludes `undefined`; use a concrete default or `null` for an
empty value. Enforce this in object and factory inputs to both constructors
and `.extend()`, while preserving contextual inference. Nested domain values
may have optional properties, and `.configure()` remains a partial override
of existing defaults. Do not add a validator API or a second state channel.

Plugin store writes preserve unchanged immutable branches by reference, for
both partial and draft updates. Snapshot newly supplied caller-owned data;
never clone the full state graph to publish one changed field. Reuse only
graphs whose immutability the store owns, because a frozen outer object may
still contain mutable descendants. Derive each repeated consumer's visible
result inside its selector so unrelated keys and equivalent results do not
rerender it. Keep result indexes derived from stable result references.

A sibling render slot exposes only its placement-owned lifecycle input: the
exact Editable ref or container ref. Never inherit or forward the host
Editable props, container DOM props, or another broad prop bag into a sibling.
Register a complete component directly. Keep a callback only when it performs
real composition, such as supplying alternative children.

Type sibling components from that exact slot contract, never from the plugin
descriptor that installs them. A descriptor-derived component prop type is
justified only when the descriptor changes the real props through its schema or
plugin context, as it does for node renderers. Reject a descriptor generic that
merely restates fixed placement props. Delete zero-caller option bags and
primitive component-prop intersections; keep a local customization prop only
for a proven component consumer job.

Publish DOM geometry only for a reusable positioning law. Require the exact
mounted Editable ref, return immutable viewport coordinates, and return `null`
when that view cannot resolve the target or during SSR. Reject implicit active
view selection, public schedulers or geometry stores, virtual-element adapters,
and app presentation policy. Copied UI owns Floating UI middleware, styling,
labels, focus policy, and feature composition.

When a consumer already owns a semantic target, use the canonical DOM operation
instead of querying its presentation markers. If that operation schedules work,
return its existing request cancellation handle so callers can end their own
request lifetime without exposing another scheduler or cancellation namespace.

When canonical editor state is stable but its paint varies by mounted view,
first ask whether that view can derive the choice from its own runtime or DOM
lifecycle. If it can, keep the transition state private and publish only the
smallest literal DOM protocol needed by external controls and product CSS. Add
a controlled input only when user intent cannot be derived from the mounted
view or DOM. Never accept a copied Range or state payload, and never create an
editor-global plugin, store, kit, or second selection owner for that view-local
choice. Internal view state with input, history, clipboard, or reconciliation
semantics is not reusable presentation state. The lower React owner renders
neutral mechanics; a facade inherits them by identity; copied UI owns markers,
styling, labels, and feature composition.

## Bounded Exhaustiveness Gate

When the question touches colocation, inlining, helper survival, file topology,
API fragmentation, or "the full list", the first obvious candidate is not an
answer. Audit the complete bounded owner before recommending or implementing a
cleanup.

1. Materialize the bounded source manifest: relevant files, top-level
   declarations, plugin/extension blocks, raw `tx`-accepting helpers, public
   exports, and representative production consumers.
2. Count production consumers and classify their ownership. Multiple calls
   inside one plugin/component family are still one production owner; tests,
   docs, barrels, exports, historical files, and hypothetical reuse do not
   establish another owner.
3. Give every row one decision:
   - inline/delete in the owner;
   - keep lexical to one coherent algorithm;
   - reuse through the owning scoped API/update method;
   - keep as a standalone public, cross-plugin, cross-layer,
     transaction-composition, or proof owner;
   - move to the correct layer or defer with an exact owner gap.
4. Report expected rows, reviewed rows, exclusions, every removal/localization,
   and every survivor with its concrete consumer or independent-owner proof.

Do not stop after finding one `toggle*`, `with*`, utility, transform, component,
or helper that should be inline. Do not call a scan exhaustive from a lexical
search that omitted constants, nested extension wrappers, render callbacks, or
transaction helpers. If the bounded manifest cannot be completed, state the
coverage gap instead of presenting a partial list as complete.

## Taste

Optimize the whole surface, in this order:

1. Correct ownership and truthful semantics.
2. One obvious common path with the fewest concepts and least nesting.
3. Type inference, autocomplete, JSDoc, and examples that let humans and agents
   discover the path without annotations or source archaeology.
4. Progressive disclosure: common use stays tiny; advanced composition,
   inspection, and runtime control appear only when requested.
5. Stable composition and extension points that add capability without
   multiplying verbs, flags, or parallel APIs.
6. Locality: colocate one-owner behavior and inline one-use declarations.
   Component-owned prop shapes stay inline even when same-file siblings or
   helpers repeat them. Keep a named prop contract only when a real cross-file
   or published entrypoint consumer requires its export; never export it just
   to preserve the alias. Honest domain and state types may remain inputs to an
   inline prop expression. Extract anything else only for reuse or a durable
   independent owner.
7. Ecosystem fit. Prefer Slate/Plate idiom when two designs are equally good;
   depart when a different shape is materially cleaner or more scalable.

Prefer one established domain noun for a public subpath when it completely
names the user job. Delete compound implementation phrases instead of making
users memorize them. Brevity does not justify a vague or misleading noun.

Do not confuse recomputable output with latent user intent. Delete derived
state, but retain persisted intent that is currently inactive and can become
observable after a legal edit; a migration-time snapshot is not equivalent.

A supported variant, provider, or backend is one complete public surface.
Never advertise the variant while filtering individual public nouns that still
need an implementation. Delete the unsupported variant, or repair the coupling
at the smallest direct owner and keep assemblies canonical. Compatibility age,
maintenance-only status, and implementation effort do not make a contradictory
partial surface truthful.

Identity names state ownership: `key` / `keys` hold live `NodeKey` values,
`id` identifies this persisted element occurrence, and `ref` / `refs` hold
persisted association tokens. Keep domain addresses such as `url` semantic
instead of renaming every pointer-like field to `ref`. Exact schema-derived
elements read persisted identity directly; an erased persisted-ID boundary
accepts only `NodeKey`, never an arbitrary element plus a runtime assertion.
The compiled schema property target is the sole applicability policy for ID
generation and preparation. Mounted DOM lookup accepts a node or `NodeKey`
through the existing DOM resolver and returns `null` for foreign, removed, or
unmounted keys; do not expose renderer internals or add a second lookup owner.

A provider that owns subscriptions, caches, or callbacks binds one runtime
owner for its mounted lifetime unless a current user job requires replacement
without remounting. Use a keyed remount to replace that owner. If live
replacement is justified, retire every owner-bound resource atomically before
publishing the next context; resetting selected caches is not a lifecycle.

Derive fast-path eligibility from material behavior, never from registration
or callback presence. Keep safety capabilities with the runtime owner, fail
closed for unknown behavior, and do not make ordinary applications promise
correctness through optimization flags.

A public predicate that accepts `unknown` must validate every required base
field and every present optional field of the type it promises to narrow. Keep
weaker structural candidate checks distinct. When valid variants depend on an
installed runtime registry or current document, expose an owner-aware full
validator instead of pretending a pure predicate can prove that context.

Mapped-location APIs must name lifetime, not location subtype. A persistent
owner factory returns an explicitly released handle; a transaction factory
auto-releases at the callback boundary and exposes only operations valid within
that boundary. Do not add a parallel public `refs` namespace when the same
engine tracks every supported location kind.

A public proof or attestation API must validate untrusted evidence and exact
owner identity. Caller-provided success flags, scope labels, transport names,
or nonempty source identifiers are claims, not proof. Keep aggregate workflow
policy internal until an independent external consumer earns a public contract.

Extension `read` factories compile one callable method tree per published
configuration. Live document values are method results; stable host values use
`api`. Reject data properties, construction-time document reads, per-read side
effects, and direct facades that invoke after the read boundary.

Public DOM event handlers run before built-in editor commands. Returning the
documented handled signal prevents the runtime command; `preventDefault`
alone controls the browser default unless the handler contract says otherwise.

Publication is an outcome boundary, not merely callback order. A fallible
callback that may reject an update must run before authoritative state is
published. Post-publication observers report failures through one optional
host sink with precise owner and phase metadata; they do not reopen the
transaction, widen the normal call site, or make a committed update appear to
have failed.

Inline means one coherent owner declaration, not a mandatory object-literal or
chain spelling. Prefer the single inference-preserving shape with the fewest
learned concepts; reject one public verb per compiler destination.

When a headless package portals lifecycle-owned DOM outside the consumer's
tree, the package owns that element's semantics and exposes at most one
truthfully named presentation channel for a current customization job. The
package keeps required positioning, hit testing, and accessibility behavior;
the consumer applies literal product classes through that channel. Reject
descendant selectors that cannot reach the portal, package-owned brand tokens,
duplicate portals, and directional or unused styling knobs.

When reusable behavior produces independently placed DOM parts, export one
primitive per part and give each its ordinary DOM props such as `className` and
`style`. Do not invent a parent, provider, render prop, or `*ClassName` control
prop merely to configure siblings. A shared editor context, file, or private
helper does not justify a public root; retain one only when it owns an
independent shared lifecycle or state job.

### Authoring And Inference → [authoring-and-inference.md](./rules/authoring-and-inference.md)

Read this reference for builders, caller generics, extension shape, node-aware reads/updates, and inference ownership.

Element payload and live position have separate selector owners. Derive node
fields with `useElementSelector(FooPlugin, node => node.field)` and position
with `usePath(path => path.at(-1))`; equality must filter unrelated changes at
the owning subscription.

### Schema And Identity → [schema-and-identity.md](./rules/schema-and-identity.md)

Read this reference for schema shape, document migration, node identity, and plugin capability boundaries.

## Behavior And Ownership → [behavior-and-ownership.md](./rules/behavior-and-ownership.md)

Read this reference when deciding whether behavior earns a public primitive, which layer owns it, and what complexity the normal path may expose.

## Review Questions

Ask:

- What is the user trying to say, and does the call site say exactly that?
- What is the real import path for every noun, and is that layer its honest
  owner?
- Can one owner noun be removed from a scoped API?
- Can nesting become a flat domain verb?
- Can inference remove a type, cast, helper, or duplicated contract?
- Do store and binding factories accept an editor with inferred document data
  and installed extensions while preserving their own payload inference?
- When merging builder stages, does the surviving return type widen every
  affected accumulator, or merely preserve it? Where are the parity and
  negative type proofs?
- Is a customization path paying for an advanced case on every basic call?
- Is composition about user-visible capability or merely internal fragments?
- For behavior composition, did invariant, parameter, substitutable capability,
  and app policy get classified before a plugin was proposed?
- Does any package root export a named plugin-array `*Kit` or equivalent
  preset? Reject it; route inseparable structure to descriptor dependencies and
  consumer policy to registry/app source.
- Does every public entrypoint's packed JavaScript and declaration graph require
  only its declared dependency set, with optional peers isolated behind honest
  subpaths?
- Does a provider or style matrix describe proven downstream contracts, or
  merely copy an upstream catalog? Enumeration is not support: require one
  canonical graph, named provider boundaries, and fail-closed unsupported
  inputs before retaining the matrix.
- For two independently optional capabilities, do adapting-only, target-only,
  both, and both with explicit target configuration preserve independent
  membership and deterministic precedence?
- Does omission or replacement leave a complete owner with an explicit
  fallback, and is there a real caller or hard boundary?
- Could colocation or inlining remove navigation without hiding reuse?
- If colocation or helper survival is in scope, did every bounded declaration,
  native extension contribution, transaction helper, and production consumer
  receive a
  decision rather than only the first obvious match?
- Does the API remain coherent after three plausible future additions?
- Can an agent find the canonical path from types, JSDoc, and one example?
- What should be deleted if this target is accepted?
- What is the maximum justified deletion cone, and which survivor has hard-law
  or independent-current-job evidence?
- Am I treating the named namespace, plugin, abstraction, layer, or package as
  the scope boundary when its behavior could move into an existing authority?
- Am I selecting a workaround because the durable owner repair is harder? If
  so, keep the long-term target and route the real repair instead.
- Does the target add or retain scale-sensitive runtime machinery? If so, where
  is the passing pre-acceptance Benchmark receipt rather than a paper budget or
  future measurement promise?

Do not preserve a weaker proposal because it is more elaborate, more generic,
more observable, or already documented.

## Output Contract

Lead with one recommendation, not a menu. For harsh honest feedback, the first
sentence states the maximum materially justified cut; do not lead with the
easier local improvement or migration sequence.

For `design` and `review`, return:

1. verdict and maximum justified deletion cone;
2. ideal call sites with exact public import paths;
3. current source and caller evidence;
4. why this is the simplest truthful model;
5. machinery or alternatives rejected, plus retention evidence for every
   surviving public concept;
6. ownership by layer and non-negotiable runtime/safety laws;
7. pre-acceptance scale receipt or source-backed zero-runtime N/A;
8. breaking/adoption impact;
9. verification performed or explicit N/A;
10. exact next owner.

For `audit`, use:

| Priority | Surface | Current friction | Best direction | Delete / hide | Owner | Proof |
| -------- | ------- | ---------------- | -------------- | ------------- | ----- | ----- |

- `P0`: wrong public ontology, unsafe contract, or foundational shape that
  would spread costly damage if more code adopts it.
- `P1`: high-frequency DX/AX, inference, discoverability, or composition debt.
- `P2`: consistency and polish after the owning P0/P1 shape is settled.
- `P3`: optional naming, JSDoc, or teaching polish with no structural impact.

Rank severity by user and ecosystem cost, not by how interesting a redesign is.
Ground every row in current source and call sites. Separate implemented debt
from speculative future ideas.

When the audit includes colocation, inlining, helpers, or file topology, append:

- bounded manifest query or enumeration method;
- expected, reviewed, removed/localized, kept, and deferred row counts;
- the complete removed/localized list;
- the complete survivor list with consumer or independent-owner evidence.

An audit without those coverage facts is partial and must say so.

## Self-Maintenance

Run `best-api repair` when any of these occurs:

- the user corrects an API recommendation in a reusable way;
- an accepted design establishes or rejects a reusable public API principle;
- an implementation changes, removes, renames, or reinterprets a reusable
  public API or its canonical authoring/consumer pattern;
- repeated reviews expose a missing or contradictory heuristic;
- a builder, portal, extension model, or routing change makes this skill stale.

In an explicitly read-only or review-only request, report the exact repair
instead of writing it. Otherwise repair it in the same authorized workflow.
This is an automatic closeout subtask of the API change. Do not wait for the
user to invoke `best-api repair` separately, and do not call the API migration
complete while an owning or dependent skill still teaches the rejected shape.

Repair the smallest durable ownership chain:

1. update `.agents/rules/best-api.mdc`;
2. update only the relevant `VISION.md` / `docs/vision/**` doctrine when the
   correction is durable taste rather than procedure;
3. audit the affected execution and teaching owners, including `plate-plan`,
   `plite-plan`, `plate-plugin-creator`, `plate-ui`, Plate Docs, and
   `plate-next` when their scope intersects the changed API; update only skills
   that teach or enforce the changed contract, remove contradictions, and link
   this owner instead of copying the full doctrine;
4. bump any versioned doctrine whose source set changed; never forge package
   attestations merely because the doctrine advanced;
5. run `pnpm install` to regenerate skills and their owned resources;
6. source-audit both rule owners and generated mirrors for the rejected names,
   examples, and call shapes;
7. when the trigger, rubric, output, or routing changed, run
   `agent-native-reviewer` and forward-test the affected action on a real API
   without seeding the expected answer.

Use the active `autogoal` plan when one exists, but do not create a goal,
hook, registry, state file, template, or review panel merely to maintain this
skill.

If the miss belongs to every goal-backed workflow rather than API judgment,
route it to `autogoal repair`; do not absorb lifecycle policy here.

Do not turn product-specific decisions into universal rules. Preserve the
principle; keep package details in source, plans, or the API debt ledger.

## Stop

Stop API design when one target clearly wins and its unresolved questions are
implementation/proof questions. Route those questions to `plate-plan`,
`plite-plan`, `task`, or the package owner.

Do not implement product API changes unless the user explicitly asks and the
owning execution skill is loaded.
