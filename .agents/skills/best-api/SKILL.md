---
description: Design, review, audit, or repair Plate/Plite public APIs for materially better DX, AX, simplicity, and scalability without speculative machinery. Use before layer plans when API shape is the real decision.
argument-hint: '[design|review|audit|repair] <API surface | diff | plan | correction>'
name: best-api
metadata:
  skiller:
    source: .agents/rules/best-api.mdc
---

# Best API

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

### 1. Ideal target

Ignore migration convenience and design the smallest honest public surface.
Show concrete call sites, including their real public imports, before naming
abstractions:

- the normal path;
- one realistic customization path;
- the advanced or escape path only when a real job needs it.

If the normal path needs explanation before it reads naturally, the API is not
done.

Do not review a call expression in isolation. Resolve where every public noun is
owned and imported from: runtime/core, feature package, registry, or app. A
short call site with the wrong owner is still a bad API. In particular, do not
approve `FooKit` until its import path proves whether it is framework capability
or consumer policy.

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
6. Locality: colocate one-owner behavior and inline one-use declarations;
   extract only for reuse or a durable independent owner.
7. Ecosystem fit. Prefer Slate/Plate idiom when two designs are equally good;
   depart when a different shape is materially cleaner or more scalable.

Inline means one coherent owner declaration, not a mandatory object-literal or
chain spelling. Prefer the single inference-preserving shape with the fewest
learned concepts; reject one public verb per compiler destination.

### Builder Consolidation Inference Gate

Public simplicity is measured after typing, not before it. Prefer the fewest
inference-preserving, semantically distinct authoring stages, not merely the
fewest builder method names. An internal compiler destination does not by
itself earn a public verb, but no builder may absorb another through a generic
path, merged stage, renamed overload, or deletion until the surviving path
carries the same inferred contract.

Before proposing any builder merge, overload consolidation, rename, or
deletion:

1. Read the owning generics' input and return types. For every affected
   dimension, state whether the surviving return type widens that accumulator
   or merely carries the old type through. Check initial state, the single
   descriptor API, read/update groups, selectors, dependencies, schema, native
   extension fields, events, and codecs when they apply.
2. Require compile-only parity for callback contextual inference, literals,
   overloads, repeated-stage accumulation, dependency composition, arbitrary
   named-group keys, root and typed-portal projection, plugin conversion,
   terminal configuration, and finite declaration emit without `any`.
3. Include negative proof: unknown groups and invalid access still fail, and a
   read or mutation capability does not leak onto the wrong editor surface.
4. If any affected accumulator is preserved instead of widened, do not merge
   or delete the stage. Fix the owning generic first or keep the stage.
   Explicit callback annotations, casts, `any`, and helper aliases are failed
   inference, not migration tools.

Inference is a hard constraint, not a permanent excuse for exposing compiler
taxonomy. Once the surviving authoring path proves exact parity, remove the
redundant public verb rather than keeping both paths.

### Caller Generic Honesty Gate

A public generic must be determined by a typed input, an installed descriptor,
or a runtime validator owned by that descriptor. A type parameter that appears
only in the return type or lets the caller claim capabilities is a cast wearing
API syntax.

- Root update callbacks receive exactly the transaction capabilities installed
  on the editor. Never let `editor.update<TTx>` manufacture another group.
- Command dispatch infers its command and input from the command descriptor.
  Reject incompatible commands through the descriptor contract, not an
  explicit `command<TCommand>` call.
- External data such as collaborative cursor metadata is `unknown` until one
  installed descriptor validates it. The validator and inferred value type are
  one contract; do not expose method- or hook-level result generics.
- A typed schema property handle infers its value. A raw persisted string
  returns `unknown` and must be narrowed; a caller-selected property-result
  type is an assertion, not schema inference.

Apply the same test to selectors, stores, codecs, and host adapters: if changing
only a type argument can change what the caller believes without changing a
checked value, delete that generic and repair the owner.

Prefer deep public interfaces: callers learn a small stable surface while the
owner contains the honest implementation complexity. If examples, tests, or
normal customization must punch through that surface into internals, the
boundary is wrong.

Keep structurally owned editable content in the owning node's ordinary
`children`. Conditional visibility, selection, copy, or mounting is a
projection/DOM-coverage job, not a reason to invent another persisted content
container. Distinct owner selection, child-text focus, rendering, or optional
empty UI also does not earn a one-child semantic wrapper: use selection kinds,
schema behavior, and projection. A structural child element earns identity
only when it owns distinct grammar, properties, commands, or one of several
real semantic regions. Promote content to a named root only when it has
genuinely independent addressing, lifecycle, sharing, or transaction
semantics.

An API is not scalable because it exposes every possible mechanism. It scales
when future capability can be added without making every caller learn it.

### Extension Shape Gate

Keep editor-extension descriptors flat by default. Add a namespace only when
several fields form one obvious, same-prefix family. Lifecycle and host/DOM
events share the root `on.*` family with prefixless child names such as
`commit`, `keyDown`, `paste`, `nodeChange`, and `textChange`; capture variants
stay in that family. Do not retain a second `handlers` bucket. `schema`,
`read`, `update`, `readMiddleware`, `commands`, `api`, `activate`, and
`validate` remain distinct root jobs.

- Owner-local pure document queries use `read`; owner-local document mutation
  uses `update`. Pure core-read customization uses typed, descriptor-owned
  `readMiddleware`. Do not promote one consumer policy into a special root
  hook.
- Ordered cross-extension values are `contributions` to a typed extension
  point. Do not call them outputs when the registry collects declarations.
- Clipboard ingress is one such contribution, not a root `clipboard` field.
  `clipboardHandler(handler)` is the sole authoring form. The owning extension
  or Plate stage contextually infers the handler transaction from its installed
  capabilities; never pass an editor to the helper.
- Plite extensions have no `config` channel. Immutable construction inputs,
  opaque controllers, functions, and host resources stay in the extension
  factory closure or an honest host owner. Plate runtime values alone use
  `initialState` and the scoped store.
- Low-level registration slots name the descriptors they contain:
  `stateFields`, `effectTypes`, `facetProviders`, and `selectionKinds`.
- A custom selection kind is one installed descriptor capability. Its
  `selectionKinds` entry owns the payload type, codec, validator, mapping, and
  behavior once; concrete editor reads and updates infer that payload only when
  the descriptor is installed. Never add an ambient module augmentation,
  global selection-kind map, side-effect type import, or open custom-selection
  fallback as a second source of truth.
- Keep concrete editor read/update callbacks contravariant. Bivariant callback
  parameters let explicit annotations manufacture uninstalled capabilities.
  Preserve exact tuples with a type-only invariant witness, erase them only at
  named internal runtime boundaries, and keep direct `update.selection`
  mutation-only.
- Default every public editor capability generic to the core-only
  `readonly []` tuple. A bare `Editor`, `BaseEditor`, read surface, or update
  surface must never expose arbitrary uninstalled groups through `any`; use the
  explicit internal `AnyEditor` boundary when runtime code genuinely erases
  the installed tuple.
- Project each installed extension graph exactly once. A layered editor such
  as Plate must not re-intersect whole `ReactEditor` or `DOMEditor`
  `read`/`update` surfaces after those extensions are already installed; that
  duplicates capability truth and forces TypeScript through recursive callback
  comparisons. Add only a genuinely missing shallow capability at its owner.
- Generic editor helpers must preserve the caller's layered editor type or
  accept the smallest structural capability they actually consume. Never infer
  one provider and reconstruct an entire raw `Editor`, `ReactEditor`, or
  `DOMEditor`; that discards sibling capabilities and reopens recursive
  whole-editor comparisons. Erase only inside a named runtime implementation,
  after the public call signature has preserved exact inference.
- Publication-dependent activation work is `afterPublish`; cleanup remains
  activation-owned. Do not hide activation behind a vague lifecycle bucket.
- `validate` checks the assembled descriptor/editor context; it never receives
  a fictional configuration object.

Plugin capability identity is `name`. Persisted identity belongs to compiled
schema. Exact element portals expose only `schema.type`; exact primary-mark
portals expose only `schema.key`; behavior and aggregate-property portals omit
`schema`. A plugin may still declare several properties, but those handles are
author/compiler data, not consumer reflection. Name-only portals expose
non-optional `schema.type` and `schema.key` getters for package-decoupled
callers; the correct installed kind resolves and a missing or wrong-kind lookup
throws. `installed` is the availability guard. Plite, Base, and Plate
descriptors each carry one exact normalized definition through
a private invariant witness. Their sole public factory grammar is
`define*(name, definition)`, with no caller-supplied generics. Internally,
TypeScript may require a small inferred
environment parameter—Plite dependencies, or Plate dependencies plus initial
state—beside the author-input parameter to contextually type callbacks. That
verified inference split is implementation machinery, not public generic
ceremony and not evidence for the false claim that one self-referential generic
can infer the whole definition. Reject excess fields and normalize one exact
definition at the witness boundary. Never expose a parallel `PluginConfig`,
public `__config`, raw callback graph, or accumulator matrix in declarations.
The positional name is required, lower camel case, and human-readable. Plate's
flat `PLUGINS` map contains capability names only, including distinct `h1`
through `h6`. Package runtime code reads persisted identity from callback
`schema` handles or `editor.plugin(Plugin).schema`. Copied
registry values, fixtures, and serialization boundaries may use explicit
persisted literals; they never borrow `PLUGINS` as a storage catalog. Additional
document properties remain feature-owned handles or constants. Never restore
`KEYS`, `NODES`, `STYLE_KEYS`, grouped heading aliases, public reverse
name/type lookup, or a configurable storage alias. Name every
descriptor-aware input `plugin` and type it as the exact descriptor or
`string`; use `name` only after runtime normalization for capability work.
Descriptor-aware schema builders publish that normalized name in structural
output, retain the nominal descriptor only in private metadata, and validate
its family against the installed owner before applying policy. A cloned or
same-name structural object is not descriptor identity.
State that selects a capability stores the descriptor or normalized `name`,
never its persisted `type` or `key`. Resolve schema identity only when reading
or constructing the actual AST node. Factories for transient editor nodes do
that resolution when invoked so a closed-application schema override cannot
leave a stale literal captured in plugin state.
Never derive a property local id from `plugin.name`, add universal portal
`.type` / `.key`, or spread a literal array into another literal array. Read
the explicit handle and list literal array items directly.

Package roots expose author-facing descriptors, editors, operations, and
definition extractors only. `Any*`, `Internal*`, normalized/compiler types,
accumulators, witnesses, and callback graphs belong in a documented internal
entrypoint or remain private. An unparameterized editor exposes only guaranteed
Core capabilities. React context retrieval is therefore non-generic:
`useEditor()` and `useActiveEditor()` return the mounted layer contract, and
selector hooks infer only their selected result. A caller-supplied editor type
with no typed input is an assertion, not inference. Resolve exact feature
capabilities through descriptor portals such as
`editor.plugin(FooPlugin)`, `useEditorPlugin(FooPlugin)`, and
`editor.extension(FooExtension)`. Keep an editor generic only when typed
constructor/options input or an explicit editor argument correlates that
generic with the returned value. Do not pass an authored plugin tuple,
feature kit, or generated contract to `useEditor()` or `useActiveEditor()` as a
typing assertion. Optional generated `Editor` and `Value` types belong at
explicit static boundaries such as exported function parameters, stored
document contracts, and compile-time assertions; runtime editor construction
still owns capability inference and verification.
Plite calls its public runtime type `Editor`; Plate keeps `BaseEditor` and
`PlateEditor` for its two product layers.

Raw `PluginReference` is nominal: it carries only the identity needed to locate
a plugin. It does not carry a definition generic or the private witness.
Concrete Base and Plate descriptors carry that single invariant definition
witness. Plite's root `EditorExtensionDependencyReference` is a shallow,
non-generic `{ name; enabled? }` reference. It does not expose capabilities,
providers, a definition witness, or exact transitive ancestry.

`EditorExtensionTypeProvider` is the sole public value-sensitive capability
bridge. Its higher-kinded encoding, normalized installed-capability carrier,
and transitive dependency expansion are internal compiler machinery exported
only from `@platejs/plite/internal`; those internals must not appear at the root
or recurse through the complete dependency graph. A static portal is valid only
when the requested literal name resolves to one installed capability that is
mutually assignable with the descriptor capability. Runtime portal access still
proves the exact installed descriptor identity, not merely an equal name. Plite
keeps `EditorExtension<Definition>` as one public definition parameter, and
official factory return types are derived rather than reconstructed with a
public dependencies generic.

Plate may distinguish a contextually typed author source from its canonical
lowered Plite definition internally. Those normalization aliases are not
public contracts, exports, or vocabulary. Users author one object and receive
one exact descriptor.

Schema is the sole first-party AST-shape source of truth. Plite compiles exact
document values from authored root, element-content, text/property placement,
default/requiredness, named-root, recursion, and open-world declarations; Plate
lowers its installed plugin graph into that compiler once. Raw plugin tuples
infer lightweight runtime capabilities and descriptor-local element shapes,
but their editor-wide `Value` is deliberately broad. The ordinary application
module exports one human-named readonly plugin kit, usually `EditorKit`, and,
when needed, one human-named schema, usually `EditorSchema`; runtime setup maps
those values directly to the `plugins` and `schema` editor options. No public
`defineEditor(name, ...)` wrapper or generated plugin-array kit sits in that
path.

`plate generate` is an optional advanced compiler. It discovers exactly one
exported nominal Plate plugin tuple and zero or one application schema by
validated runtime shape; export identifiers are never compiler API. It reads
that authored module and may emit exact recursive `Value`, `Editor`, element/text/root,
mutation, schema, and structural-fingerprint artifacts. Generated output is a
static type/schema boundary, never the runtime plugin owner, a hook argument,
or the default documentation path. Do not recursively carry the complete
application grammar through every `editor.api`, `editor.read`, or
`editor.update` access, add a size heuristic or depth cliff, or claim exact
cross-plugin schema composition on a raw tuple. When generated artifacts are
used, commit them and run `plate generate --check` in CI. Runtime construction
still consumes the authored `plugins` and optional `schema`; generated output
never validates, wraps, or replaces those values. Keep explicit
`createEditor<ExternalValue>` only for genuinely schema-less or externally
owned raw Plite data. Do not add a second Core value accumulator, central node
map, handwritten feature AST mirror, compatibility alias, or synonym
extractor. A property-only plugin contributes to installed node variants but
never becomes an `ElementOf` / `TextOf` identity handle. Derive an exact
element owner's node with `ElementOf<typeof Plugin>` or `TextOf<typeof Plugin>`.
Derive schema-contributed property capabilities with
`ElementWith<typeof Plugin, RequiredLocalIds>` or
`TextWith<typeof Plugin, RequiredLocalIds>`; those utilities resolve authored
local IDs, aliases, prefixes, defaults, and value domains from the descriptor.
Never restate the persisted property bag in a feature type.
Generated schema contracts are content-addressed data, not trusted caches.
Hash compiled semantic output rather than authoring syntax; readers recompute
the authoritative structural fingerprint, and restoration compares every
derived table with the current source contributions before publication.
Intentional generated outputs may live beside source and be committed. Tool
scratch files, locks, journals, watcher ownership, staging, and backups must
never make consumers add product-specific ignore rules. Put compiler-only
scratch work in the operating system temp directory. Put durable recovery state
in the project's deterministic `node_modules/.cache`; fail clearly when that
canonical same-filesystem root is unavailable. Never choose coordination roots
from process-local environment or transient writability.
Keep staged replacements
on the artifact filesystem so atomic rename, crash rollback, cross-process
locking, and last-good output remain real; a cleaner worktree never justifies
weakening those laws or renaming private debris to look conventional.

Descriptor-bound React and static component APIs infer the owner's exact local
schema node from the descriptor. Use `useElement(FooPlugin)`,
`PlateElementProps<typeof FooPlugin>`, and
`PliteElementProps<typeof BaseFooPlugin>` for elements; use
`PlateLeafProps<typeof FooPlugin>`, `PlateTextProps<typeof FooPlugin>`, and
their static `Plite*` equivalents for text renderers. Never import a derived
`FooElement` or `FooText` alias only to feed it back into one of those APIs.
Descriptor-local inference must exclude dependency nodes. These component prop
aliases require one descriptor generic; they expose no default, raw `Element`
or `Text` input, or second context generic. A presentation-only component
family may use a union of descriptor-owned props; code that forwards the full
plugin context keeps one exact owner. Deliberately erased or schema-agnostic
renderer code uses `RenderElementProps`, `RenderLeafProps`,
`RenderTextProps`, an inferred wrapper callback, or the named wrapper prop
contract instead. Never make one type parameter switch between plugin
ownership and raw node shape. When a consumer plugin installs the component
being typed, use the stable imported owner descriptor rather than the
self-referential configured value; access consumer-local store/API additions
through their scoped hooks inside the component.
An owning leaf descriptor also infers the optional transient fields returned
by its `decorate` callback. Keep `props.text` schema-only and expose those
fields only on `props.leaf`. Never recover a known decoration field with
`Reflect.get`, a cast, or a restated structural leaf type; fix the decorator or
descriptor carrier instead.
Wrapper and selector APIs follow the same law. Pass the descriptor directly to
`RenderNodeWrapper<typeof FooPlugin>`,
`RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and
`useElementSelector(FooPlugin, selector)`. Their element and plugin context
must come from that descriptor. Never extract `DefinitionOf`, restate an
element type, or cast inside a consumer just to recover fields already owned by
the plugin schema.

The low-level React bridge is `react({ dom })`: one required object containing
the exact DOM descriptor it depends on. Keep one explicit erased
implementation boundary only where TypeScript 7 cannot reduce the invariant
DOM-extension union; do not spread casts, overloads, optional zero-argument
construction, or caller generics across the public shape.

`DefinitionOf<typeof FooPlugin>` is the sole public descriptor-definition
extractor. Name an exported alias `FooDefinition`; never call that extracted
definition `FooConfig` or leave it unsuffixed. True domain and runtime
configuration types may still use `Config`. Do not restore `InferConfig` or
another extraction alias.

`.extend()` is the widening authoring verb, `.configure()` is terminal and
non-widening, and `toPlatePlugin()` is the exact Base-to-React adapter. Factories
replace cloning; do not expose `clone()` or another copy verb.

Reject compatibility aliases that leave two extension grammars after a hard
cut. Type inference, ordering, rollback, transaction-local reads, generator
safety, and one-shot delegation are required proof for the surviving shape.

A plugin schema is creation-owned. Declare it in the plugin constructor, using
the schema factory over typed `initialState` when authored variability is
intentional; neither `.extend()` nor terminal `.configure()` can replace it.
Within one inline constructor object, place `schema` before callbacks whose
contextual types consume that schema. TypeScript infers object members in
source order; if a callback needs a capability introduced by an earlier
builder result instead, use one honest `.extend()` stage rather than an
annotation or cast. TypeScript cannot retroactively re-typecheck schema-derived
callbacks, including callbacks
contributed by another plugin against that descriptor. Reject schema
replacement at the public type and runtime boundary while keeping unrelated
authoring and terminal configuration available. Runtime-resolved identity such
as a configured node type may remain configurable only when the author callback
types it truthfully rather than as the pre-configuration literal.

### Schema Shape Gate

Keep schema authoring explicit where structure differs and tiny where the law is
standard:

- A plugin `name` is immutable capability identity only. Persisted identity
  lives under schema. Exact consumer portals expose `schema.type` for elements
  and `schema.key` for a primary mark. Behavior and aggregate-property portals
  expose no schema member. Author callbacks use the same flat primary identity
  and may use `schema.properties.<localId>` only for additional declared
  properties. Never add universal plugin `.type` / `.key`, derive a persisted
  identity from `plugin.name`, or expose compiler property maps to consumers.
- Feature plugins own authored schema law. Only the consuming application's
  final schema may override element type, content, groups, or an existing
  property's target, and may add app-owned properties.
  `.extend()` and `.configure()` never change schema. Plugin-owned property
  keys and value laws are immutable; a persisted rename is a new field plus a
  migration.
- Keep ordinary domain access direct (`node.indent`, `cell.header`). Use
  `SchemaElementHandle` and `SchemaPropertyHandle` for generic construction,
  matching, codecs, inspection, and typed property reads.
- Inside a plugin `update`, use one object-patch law for node properties:
  `tx.nodes.set({ lineHeight: value }, options)`. Infer owned keys and values
  from the current plugin plus its required dependencies through a shallow
  capability graph; duplicate persisted keys infer the union of every declared
  value. Never pull the complete application grammar into ordinary updates.
- Use the persisted key from `schema.properties.<localId>` when an authored
  property is aliased: `tx.nodes.set({ [property.key]: value }, options)`.
  Remove properties with a typed key or exact handle through `tx.nodes.unset`.
  Dynamic string-keyed object patches are the explicit runtime-schema escape
  hatch. Put prefix-family and cross-node behavior behind semantic owner
  operations. Never add scalar `set(key, value)`, `tx.properties`, or another
  property-mutation namespace. `tx.plugin(Plugin)` selects an installed
  plugin's flat transaction capability group; it is not a property portal.
- Keep raw plugin capabilities shallow. Exact recursive application `Value`,
  final schema bindings, mutation maps, and fingerprints may belong to
  committed opt-in generated artifacts, never every
  `editor.api/read/update` access.

- A complete schema declares `root: SchemaContent` directly. Named `roots`
  map names directly to `SchemaContent`; a `{ content }` wrapper earns nothing.
- Omitted complete-schema `elements` means `{}` and omitted `unknown` means
  `"reject"`. Open vocabulary requires an explicit `"preserve"` decision.
- `schema.element.textBlock()` is the standard editable text-plus-inline
  element. Do not make arbitrary non-void elements implicitly text blocks.
- Unvalidated `property.json()` is `PropertyJsonValue`. A narrower value type
  requires a runtime type predicate and `validationVersion` on the property.
- Property meaning belongs to placement. Use `role: "metadata"` on
  `elementProperty` or `textProperty`; do not put significance on the value
  descriptor.
- Application schema lineage uses `id` and `version` inside the single
  app-owned `schema` object. Do not duplicate lineage in a top-level
  `schemaIdentity` option or a generator-only definition. Plate schema
  elements use `blockContent` for normal-flow membership.
- Runtime verbs are `schema.create`, `schema.assertDocument`,
  `schema.assertFragment`, and `schema.isMarkableVoid`. Assertions accept
  `unknown` and narrow it.
- Raw Plite schema handles use `schema.handle.*`. Plate plugin callers pass the
  descriptor directly to `create`, `allowsElementType`, and
  `isElementTypeInGroup`; Plate does not add a second handle form.
- Descriptor-aware schema queries are identity operations only. Read document
  properties through typed property handles or a semantic plugin API; never
  interpret an arbitrary one-property descriptor as a property query.
- Node traversal separates structural selection from computed conditions. Use
  `type: FooPlugin` in Plate or a persisted string/schema handle in Plite, then
  add function-only `match: (node, path) => ...` when needed. Arrays of `type`
  selectors infer unions; a type-guard `match` may infer without `type`. Never
  expose caller-selected result generics, object matcher DSLs, descriptor-first
  overloads, or plugin-scoped copies of generic traversal. The traversal
  target (`at`) is independent from the selected node type.
- Apply that selector grammar to node reads, transforms, selection queries,
  corrections, and their static mirrors. An insert operation puts the selector
  for its split ancestor under `split: { type, match }`; it does not pretend
  that selector describes the inserted node. `NodeApi.matches` remains
  predicate-only because it already receives the concrete node.
- Compiler/provider witnesses stay internal. Public definitions expose authored
  schema, never normalized compiler carriers.
- Static value inference preserves legal primary/named roots and each
  element's legal child variants. It never widens every element to every schema
  descendant or exposes an arbitrary recursion-depth precision cliff.
- Canonical output requiredness follows runtime schema law: non-omitted
  defaults are present after canonicalization, while construction input may
  omit defaulted fields. Dynamic/open declarations widen only the undecidable
  branch instead of collapsing the known schema or producing `never`.
- Child `min`/`max` remains runtime validation law. Do not encode cardinality as
  hostile tuple lengths merely to make inferred values look stricter.

Install extensions with `editor.install(...)` and construct a DOM/React view
with `createEditorView(editor, options)`. Do not reintroduce an editor runtime
wrapper or `editor.extend(...)`. Root-level standalone utilities are limited to
genuinely editor-independent value operations such as `NodeApi`, `PathApi`, and
`isEditor`; editor behavior lives on `read`, `update`, or an installed extension.

### Node Identity

Use `NodeKey` for editor-owned live descendant identity. The normal call is
`editor.key(nodeOrLocation)`. A coherent read callback uses `state.key(...)`;
an active update uses `tx.key(...)`. Reverse lookup belongs to the generic node
owner as `state.nodes.path(key)` or `editor.read.nodes.path(key)`. Do not expose
`editor.read.key`, `read.nodes.key`, `read.runtime.id`, a runtime-ID alias, or a
second reverse-lookup namespace.

Node keys are unique across one editor's document roots and may target generic
node reads and updates across those roots. A `Path` has no root, so
`nodes.path(key)` resolves only inside the current editor or view root. The base
editor maps path inputs to the main root even while another view is updating;
a view maps them to its own root. Passing a live node to `editor.key(node)` may
resolve that node from any root in the same editor.

A `NodeKey` covers elements and text, stays stable through moves and immutable
updates, and dies when the logical node is removed. It is scoped to one editor
runtime. A key from another editor must fail closed even when both editors use
the same public `editor.id` or allocate the same local ordinal. Runtime
ownership is private and must not derive from caller-configurable `editor.id`.
The key's string representation is opaque. It never enters schema, JSON,
clipboard, history serialization, collaboration payloads, Markdown, HTML, or
databases. Paths remain structural addresses; anchors remain live positions.
Pure detached transaction-spec builders may consume an existing key as a node
target but do not publish `key` or allocate transaction-live identity.

Name every feature field that stores this value `key` or `keys`: for example
`selectedKeys`, `draggingKey`, `cellKeys`, and `openKeys`. Reserve `id` for an
actual persisted or external identity. DOM bindings for live nodes use
`data-plite-node-key`; feature-owned DOM attributes carrying node keys follow
the same vocabulary. Hydration may use a deterministic editor-local render
token, but mounted DOM lookup must publish the full owning runtime key.

Persisted element identity is a separate optional Plate capability owned by
`ElementIdPlugin`. Its canonical schema property is `id`, its default generator
is `nanoid`, and consumers may configure another string generator. Exact
schema-derived element code reads `element.id`; erased or optionally installed
package code uses `editor.plugin(ElementIdPlugin).read`. Migrations may read a
legacy `sourceKey`, but runtime schema configuration never aliases or renames a
plugin-authored property key. Persisted IDs apply to elements, not text.

At the persistence boundary, convert a live key directly with
`editor.plugin(ElementIdPlugin).read.id(key)`. Do not retrieve the node merely
to read its persisted ID. Missing or deleted keys return `undefined`; exact
element input keeps the strict non-empty ID contract. Live TOC, outline,
selection, drag/drop, and navigation state use `NodeKey` and must not install
`ElementIdPlugin`. One-shot exports such as DOCX derive export-local references
from runtime keys. Serialized identity such as Markdown block-ID round trips
uses `ElementIdPlugin`. A copied registry may install it explicitly as product
policy, but no unrelated feature dependency may install it transitively.

Request-local protocols use small explicit refs such as `b1` or `c1` mapped to
`NodeKey` inside the originating editor. Do not install `ElementIdPlugin` just
to correlate one request and response. Use a persisted ID only when the
reference must survive editor destruction, reload, storage, or another client.

Plate plugin runtime values have one channel: defaults in `initialState`,
descriptor overrides through `.configure({ initialState })`, builder access
through inferred `store`, and consumer access through
`editor.plugin(Plugin).store`. React subscriptions use `usePluginStore` or
`useEditorPluginStore`. Do not recreate deleted `options`, `getOption`,
`getOptions`, `setOption`, `setOptions`, or `usePluginOption` APIs, and do not
add a parallel immutable `config` channel. Generic operation parameters may
still be named `options`; this rule owns plugin declaration/runtime state.

### Plugin Capability Boundary

Choose the capability by semantics, not by which callback is easiest to type:

| Field               | Public job                                                                                                                 | Rejection test                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `initialState`      | defaults for mutable editor-local plugin state                                                                             | the value is not state or needs a second configuration channel                  |
| `store`             | live state reads, writes, subscriptions, and selector evaluation                                                           | the value is document state or a schema rebuild is expected                     |
| `selectors`         | pure projections of readonly store state plus domain arguments                                                             | it reads the editor/document, mutates, performs I/O, or writes the store        |
| `api`               | stable plugin services not bound to a supplied document snapshot or active tx                                              | it mutates the document or is really a snapshot query                           |
| `read`              | pure, replayable queries over supplied document state                                                                      | it mutates, performs I/O, writes plugin state, or depends on ambient live state |
| `update`            | document reads and mutations through the active transaction                                                                | it opens a nested one-shot update or owns unrelated I/O                         |
| native Plite fields | genuine editor-wide substrate through flat fields such as `commands`, `corrections`, `contributions`, `on`, and `activate` | it merely republishes plugin-scoped state, API, reads, or updates               |
| `codecs`            | format encode/decode declarations                                                                                          | it owns runtime service or mutation behavior                                    |

`api` being immutable describes publication of the method object, not method
purity. A non-document service may have external or store effects; document
reads belong in `read`, pure store projections belong in `selectors`, and
document writes belong in `update`.

The `api` field is factory-only at Plite, Base, and Plate layers, even when the
returned object needs no context: write `api: () => ({ ... })`, never
`api: { ... }`. Plite passes one context object; Base and Plate extend that
same object with their authoring fields. Reject positional `(editor, context)`
factories and consumer `.configure({ api })`: API capability is
definition-owned and contributed once.

Concrete inferred editors project plugin capabilities to
`editor.api.<name>`, `editor.read.<name>`, and
`editor.update.<name>`. Generic code or exact ownership uses the same
capabilities through `editor.plugin(Plugin)`. Selectors remain store-owned and
are evaluated through the scoped store.

Every element plugin receives descriptor-bound `insert`, `set`, and `remove`
on `editor.plugin(Plugin).update`. Default-constructible, schema-compatible
text-block plugins also receive `toggle`; text blocks with required
construction properties and structural element plugins expose an authored
`toggle` only when they own real domain, wrap, conversion, or child semantics.
An opt-in generated `Editor` type may additionally project eligible methods
under each capability name on root and transaction updates. Raw editor tuples keep authored
root/transaction capabilities exact, but do not materialize a schema-wide
generic mutation map; doing so makes any ordinary editor access expand the
entire grammar. The persisted target comes from the descriptor `type`; callers
never restate it. `insert` builds through schema defaults, uses an explicit
`at` literally, inserts a block after the selected block, inserts an inline at
the selection, and does nothing without a selection or explicit `at`. `set`
and `remove` force the descriptor type and do not accept a caller-owned match.
Generic text-block `toggle` swaps the selected block discriminator; it does not
publish structural `wrap` as an option. It may accept one-shot update policy
such as `collapse`; use the transaction primitive only while composing inside
an existing transaction. An authored same-name method replaces the synthesized
default when it owns extra semantic behavior. Delete redundant
noun aliases such as `insertTable`; retain custom verbs only for distinct jobs
such as merge, insertColumn, or a structural toggle.

Application schema overrides are a compiler boundary. Ordinary runtime tuples
do not promise descriptor-generic mutations whose eligibility depends on the
final compiled grammar; opt into `plate generate` and consume its generated
types when that exact static surface materially helps.

Custom element insertion has one signature law:
`insert(input?, nodeOptions?)`. The first argument contains only the feature's
domain data; the second contains generic placement and selection options such
as `at`, `select`, and `voids`. Never merge node options into the domain input
or publish an `Insert*Options` compiler-ferry type. If schema defaults make the
operation ordinary CRUD, delete the custom method and use the synthesized
descriptor insert instead.

The scoped update portal is callable with the same transaction policy as the
root update: `editor.plugin(Plugin).update(policy).method()`. It delegates to
exactly one root transaction, preserves rollback and history tags, and returns
the same inferred scoped methods. A later method inside an active plugin update
stage reuses `tx.plugin(Plugin).method()`. Generated closed editors may also
expose the direct `tx.pluginName.method()` group. Never use computed
`tx[plugin.name]`, `tx.extension(...)`, or a portal one-shot update inside the
transaction.

## Public Complexity Budget

Every public noun, verb, nesting level, mode, option, profile, registry,
handle, lifecycle, and configuration channel must earn its cost with a current
user job.

Reject:

- machinery justified only by hypothetical future reuse, serialization,
  observability, or runtime control;
- method families that encode taxonomy instead of user intent;
- parallel ways to perform the same common operation;
- option soup and one verb per internal implementation fragment;
- explicit callback annotations or helper types that compensate for a broken
  owning generic;
- public composition models copied from current internals;
- feature-package preset arrays that merely name a list of independently useful
  plugins;
- the same convenience name exported from both a package and registry/app
  owner;
- debug/profiling concerns embedded in ordinary authoring APIs;
- abstractions whose explanation is longer than the call site they replace.

Internal complexity may be justified when it keeps the public surface smaller
and preserves real runtime, safety, or performance laws.

Apply a supported-domain gate before accepting that complexity. A reviewer
edge case does not expand the product contract. Name the current user job, the
documented input domain, the complete owner path that can accept and process
the input, and the absolute material impact. Do not make one helper stack-safe,
cycle-safe, or otherwise extremal when adjacent validation, construction,
serialization, storage, or callers cannot carry that guarantee end-to-end.
Without that evidence, keep the normal path simple and delete tests that imply
the isolated guarantee. Relative benchmark percentages do not outweigh
negligible absolute cost or permanent machinery by themselves.

## Behavior Promotion

Do not infer public composition boundaries from callbacks, events, native
extension fields, or files. First classify the behavior:

| Class                    | Test                                                                     | Default shape                                                               |
| ------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| invariant                | omission makes the owner invalid, unsafe, or semantically incomplete     | keep inline in the owning plugin or runtime                                 |
| parameter                | callers want the same capability with different data or thresholds       | declare a named `*PluginState`, type its defaults, and use the scoped store |
| substitutable capability | omission or replacement leaves a complete editor with a defined fallback | promote to an ordinary plugin or extension candidate                        |
| product policy           | the choice belongs to one app or kit rather than the framework default   | keep it app-owned and inline unless reused                                  |

Non-universal behavior is not automatically a plugin. Universal behavior may
still deserve a replaceable owner when legitimate products implement it
differently. The deciding property is independent substitution, not how common
the behavior is.

For plugin parameters, require one named `*PluginState` contract per production
owner and export it with an exported descriptor. Check owner defaults with a
typed constant or explicit factory return type; never make the first default
object the public contract through inference, `as`, or `satisfies`. Consumer
`.configure({ initialState })` overrides stay partial and inline.

For Plate plugin relationships, classify ownership before choosing a field:

- `dependencies` installs required structure or capability and may remain
  transitive;
- optional capabilities are ordinary plugins included directly by the
  consumer; when an enhancement requires a host capability, the enhancement
  depends on the host rather than the host bundling the enhancement;
- app and registry-owned readonly plugin arrays group complete defaults,
  presets, and product policy.

Copied registry source may directly import an optional feature package when
that behavior belongs to the importing component or kit. Declare the package
and registry dependencies honestly, and guard optional plugin portal access
when absence is valid. Do not create a cross-editor `*Integrations` file or a
bag of terminal `.configure()` calls just to invert dependencies or make the
registry graph look cleaner. Extraction must own a coherent capability or
break a real runtime cycle; otherwise colocation wins.

Do not add a second plugin-descriptor relationship for optional defaults or
encode optionality with wrappers such as `{ optional: Plugin }`. Optionality is
ordinary omission from the consumer's plugin array. Keep the descriptor graph
for invariants; keep product choice visible at the use site.

Public package exports are capabilities, not presets. Packages export
individual plugin descriptors; inseparable multi-plugin structure uses one
honest owner with `dependencies`. Keep package-local tuples private when they
help implementation or tests. Name and export reusable plugin-array kits only
from app or registry source, where consumers own the product policy.

Do not split one registry kit into `BaseFooKit` and `FooKit` merely because
base and live consumers both use it. Share one runtime-neutral policy kit when
its descriptors, initial state, and behavior are identical; compose static, React,
native, or other renderer-specific peer kits in the consuming preset. A split
is honest only when the kit itself owns different platform descriptors,
renderers, or behavior. If importing an independently optional renderer kit is
the only reason a neutral kit needs `'use client'` or a base twin, ownership is
wrong.

An exported array does not become a capability because every item comes from
one package, the array is convenient, or multiple examples repeat it. Ask what
breaks when one member is omitted:

- if the owner becomes invalid, encode the required structure as
  `dependencies` of one honest capability;
- if the remaining plugins are independently complete, the selection is a
  preset and belongs to the registry/app;
- if only package implementation or tests need the tuple, keep it private.

Do not replace a fake grouping plugin with a public package grouping array and
call the ownership fixed. That changes syntax while preserving the same false
owner.

Configure a target descriptor directly only when the caller owns that target's
membership in the final composition. Import access alone does not establish
membership ownership. A complete same-name descriptor customizes an installed
dependency or framework default. Within one owned plugin array, terminal
configurations derived from the same authored plugin compose in source order:
earlier non-overlapping fields survive and later defined values win. Repeating
the exact descriptor identity is idempotent. Unrelated plugins and divergent
authoring branches may not share a name. Required dependencies cannot be
disabled. Optional product membership is changed by editing the owning
app/registry array, not by installing a same-name disabled tombstone.

Bare plugin names cannot infer another package's option contract without a
central plugin-name registry; do not add that machinery. When a plugin does not
own another
capability's membership in the consumer's final composition, it may use
`override.plugins[name]` as a narrow weak-peer adaptation of an
already-installed target. This applies even when the adapting plugin can import
the target.
A missing target is a no-op. Weak peers may change runtime configuration or
enablement, but cannot install the target or mutate its identity, dependencies,
or nested overrides. Required dependencies cannot be disabled, and the target's
terminal `.configure()` layer wins.

An independently optional plugin or kit must not install another independently
optional peer merely to adapt it. Put the adaptation on a plugin descriptor in
the adapting kit as a weak peer, so either capability remains complete alone
and the integration activates only when both are installed. Prove the adapting
capability alone, the target alone, both together, and both with explicit target
configuration.

This weak path does not replace ordinary typed ownership. When the final
composition owns the target's membership, configure the target descriptor
directly. Exact weak target-state inference requires that descriptor or
definition type; a plugin using only `PLUGINS` intentionally gets the erased weak-peer
contract. Keep component replacement and `inject.parsers` for their distinct
jobs. Reject a central plugin-name registry, ancestor reach-through methods,
recursive child registries, and new add/replace verbs.

Resolve peer conflicts at the narrowest behavior surface. If one shortcut,
event, parser, or render contribution conflicts, remove or replace that
member; do not disable the whole plugin. Whole-plugin disablement is valid only
when absence is itself the intended product state, and it is invalid for a
required dependency. Do not promote one conflicting member into another public
plugin unless it independently passes the promotion gates below.

Promote a capability to a public plugin or extension only when all applicable
gates pass:

1. one stable user-facing capability name covers the behavior;
2. a real caller needs omission or replacement, or a hard host, dependency,
   security, or lifecycle boundary requires independent ownership;
3. absence and replacement have explicit, valid fallback semantics;
4. dependencies close through public contracts without sibling-private access
   or cycles;
5. the capability has independent default, omitted, and replaced proof, with
   browser proof for native input, clipboard, selection, focus, or DOM behavior;
6. the full preset remains the obvious common path;
7. the public composition model reuses ordinary plugin or extension arrays.

Behavior specs and scenario matrices provide promotion evidence; they do not map
one-to-one to plugins. Group rows by user-visible capability, not compiler
destination. Plugin identity also does not require a file split: keep
single-owner descriptors colocated until another durable file owner exists.

For a concrete inferred editor, `editor.api` is the canonical API discovery
surface. Publish every non-empty plugin API under its human-readable plugin
name, while `editor.plugin(Plugin).api` exposes the same immutable API for
generic package code and exact descriptor ownership. Raw Plite ownership uses
`editor.extension(Extension).api`. Authors contribute the implementation once
through the descriptor's root `api` field; the compiler projects it under
`definition.name`. Do not root-merge methods, add `getApi`/`pluginApi`, or
route document mutations outside
`editor.update` or add an API-name alias registry.

Generic code integrating an optional descriptor uses its typed portal as the
single source of truth:

```ts
const feature = editor.plugin(FeaturePlugin);

if (feature.installed) {
  feature.api.run();
}
```

`installed` is the non-throwing availability check; disabled plugins count as
absent. Do not infer availability from root `editor.api`, node types, schema
properties, caches, or caught portal errors. Access plugin-owned API, store,
updates, and descriptor fields only after the check when absence is valid.

`editor.plugin(plugin)` is the only public imperative plugin lookup, where
`plugin` is an exact descriptor or `string`. Descriptor inputs preserve exact inferred capabilities; runtime names
return erased portals. Use a name when the input is dynamic or the caller owns
a family-agnostic slot that intentionally accepts whichever installed
descriptor owns that name. Do not accept `{ name }`: that weak object shape
looks typed but cannot prove descriptor identity. The consumer portal is the
resolved descriptor view: fields such as `name`, `inject`, `render`,
`initialState`, and `targetPlugins` are direct, while `api`, `read`, `update`,
`store`, and `installed` expose scoped runtime capabilities. Never nest the
descriptor under `portal.plugin`; the portal already owns the plugin noun.
Callback authoring contexts may expose `plugin` for the current raw descriptor,
while `editor` and `defineCodecs` stay off consumer portals. Do not add standalone or editor-method
alternatives for descriptor lookup, name/type reversal, container discovery,
or injection lookup. Read `.name` from the portal only after lookup when the
normalized plugin name is needed. Missing runtime names expose
`installed: false`; they never expose or invent persisted schema identity.
Exact installed element and primary-mark portals publish `schema.type` or
`schema.key`. Name-only portals keep both getters non-optional for
package-decoupled code, but accessing the wrong kind or a missing plugin throws.
Capability and descriptor fields throw for missing plugins. Reverse,
container, and renderer caches stay private. Public node questions use schema
predicates, compiled injection data lives at `portal.inject.nodeProps`,
and codec registries expose installation membership without name/type
translation.

When a parent namespace already fixes the format and flow, keep its operation
hooks flat. The `'text/html'` codec owns `query`, `transformData`, and
`transformFragment` directly. Do not add a parallel parser owner or repeat
that direction with
`ingress`/`egress` buckets unless the child has a distinct independently
consumed lifecycle.

Copied registry UI and reusable package components are generic by definition,
even when one current host supplies a complete kit. They must not import the
host's editor type or use its root plugin namespaces.

Treat each independently installable registry item as a source-distribution
owner. Keep its copied UI self-contained. Repeating short presentation JSX,
labels, or menu rows across items is cheaper than adding another shared
registry file and dependency. Extract only when the new owner has an
independent install/use job or owns real behavior beyond presentation reuse.

Registry surfaces dedicated to `*-classic`, including `list-classic`, are
maintenance-only pending deprecation. Do not propose or perform parity work,
new variants, shared abstractions, polish, demos, adoption, or API investment
for them. Touch them only for a user-facing regression, security or release
blocker, or an explicitly authorized deprecation/removal. New work targets the
modern registry surface. Planned deprecation alone does not authorize deletion.

Repeated callers of plugin behavior reuse that plugin-owned API; they do not
create a second helper owner. Keep the algorithm inside the plugin and expose
one inferred API or update method. A standalone function survives only when it
owns a real cross-plugin, cross-layer, or transaction-composition job that the
plugin surface cannot express honestly. A raw helper that accepts both `tx`
and the plugin's resolved `type` is evidence that the plugin boundary is
missing.

Plugin authoring has one widening vocabulary. Put every independent
contribution in `defineBasePlugin()` / `definePlatePlugin()`: plugin-scoped
`api`, `read`, `selectors`, or `update`, flat native Plite fields, format
`codecs`, and ordinary Plate fields. There is no nested `extension` wrapper.
Constructor callbacks already receive the typed authoring context; context
access alone never justifies `.extend()`. Use `.extend()` only to adapt an
imported/prebuilt plugin descriptor, call a shared factory the constructor
cannot access, or consume types introduced by an earlier contribution. Merge
independent contributions into the constructor even when the object is large.
Treat an exceptional staged chain as a typed capability dependency graph:
publish the smallest honest read/service in the constructor or an earlier
stage, then consume the inferred surface from the later builder context. A
later active update stage calls an earlier mutation through
`tx.plugin(Plugin).method(...)`. Generated closed editors may use the direct
`tx.pluginName.method(...)` group. Computed `tx[plugin.name]`,
`tx.extension(...)`, and a portal one-shot update are rejected.

Plate constructors and justified `.extend()` stages contextually type their
flat native Plite fields and callback returns. A public identity helper whose
only job is to recover a nested or erased field type is leaked compiler
machinery: repair the owning generic and hard-cut the helper instead of
preserving it, renaming it, or hiding the loss with an annotation, cast, or
`any`. Keep Plate-context capture inside the authoring callback and extract
domain inputs. Independently reusable standalone descriptors use Plite
`defineExtension` and compose as dependencies; do not pass Plate plugin
context into their factories or copy them through a nested wrapper.

Author codecs through the constructor callback that supplies their inference
context:

```ts
defineBasePlugin("example", {
  codecs: ({ defineCodecs }) => defineCodecs(map),
});
```

`defineCodecs(map)` owns self and product codecs.
`defineCodecs(TargetPlugin, map)` owns a foreign plugin contribution and
injects that target into every HTML rule. The map remains MIME-keyed, and
`'text/html'` accepts one schema-aware rule or a non-empty ordered rule tuple.
Keep multiple HTML representations owned by one plugin in that single map.
Move the callback to `.extend()` only when it consumes an earlier-stage
capability or adapts an imported/prebuilt descriptor. This context-bound helper
is the one inline inference anchor for
codecs: do not
teach direct `codecs: { ... }`, manual `target` fields, a global codec helper,
casts, or callback annotations.

Custom Plate-owned MDX element tags are persisted schema identity. Bind
`schema: { type }` in the codec factory and use the same resolved value for
the codec `from`, decoded element `type`, and encoded MDX `name`. Never use the
plugin capability name, an authored default literal, or a dual decode alias.
Fixed MDAST, HTML, and MDX names remain literal because they belong to the
external format rather than the Plate schema. Legacy persisted tags migrate
before normal codec handling.

One-operation Markdown decode overrides use the invariant plugin capability
name because the incoming format identity may differ from the installed schema
type. Encode overrides use the persisted schema identity because they dispatch
from Plate nodes. Resolve the compiled decode owner before the override lookup;
do not make consumers guess the configured persisted type. Once an installed
codec claims a source, `undefined` declines that codec; it never enables a
second override lookup by persisted tag.

Custom configurable MDX identity belongs on the schema-owning plugin. Do not
author it through `defineCodecs(TargetPlugin, ...)`, where the contributor does
not own the target's final application schema. Public rule-name unions must
retain every supported canonical rule key during identity renames.
Apply identity checks independently to decode-only and encode-only codecs. A
phrasing-only wrapper decodes the external paragraph's children directly; it
does not infer wrapper identity from an arbitrary decoded Plate element.
External syntax literals exempt only their format-owned source or emitted name;
decoded Plate identity still resolves from the target schema. Parsed attributes
are data, so spread them before schema-owned `children` and `type`.

The same split applies to structural wrappers and fallbacks: every synthesized
Plate element resolves its installed application schema type, while emitted or
matched MDAST/HTML nodes keep their format-owned literal type. Use the authored
default only when that Plate plugin is genuinely absent.

A universal first-party format authoring contract belongs in Core when feature
packages broadly author it and Core can express it through type-only
dependencies. Core directly owns that format's public codec types and built-in
MIME registry entry; the optional format package still owns the compiler,
intrinsic language behavior, and operation-level escape hatch. Do not create a
contract-only package whose job is to ambiently augment Core, and never require
feature authors to activate a built-in format with an empty or side-effect type
import. Truly optional or third-party format contracts stay outside Core and
must integrate through an explicit, discoverable type path.

Each installed feature plugin owns its shipped encode/decode declaration for
every format. Do not put every feature's rules in a central format registry or
mutable plugin state: that reverses ownership, makes absent plugins look
supported, and forces the format package to know the entire product graph.
Compose declarations from the installed plugin set, validate conflicts once,
cache the immutable compiled view, and keep one-call overrides on the
conversion operation rather than in shared state.

`component` is ordinary render publication data, not a Plate-only capability.
Both `defineBasePlugin()` and `definePlatePlugin()` accept it beside the rest of
the declaration, so Base descriptors render directly in static/RSC and live
Plate consumers. Replace it through one terminal `.configure({ component })`.
Base `.extend()` rejects it because an independent default belongs in the
constructor and consumer replacement belongs in `.configure()`. Use
`toPlatePlugin()` at the owning React adapter to publish a reusable Plate-layer
descriptor or add genuine Plate-only authoring. A terminal consumer never
inserts conversion merely to set `component`. Static/base owners may import a
server-safe component, but never a Plate React entrypoint just to bind it. Do
not expose `.withComponent()` or direct public
`render.node` authoring. `.configure()` is terminal and never widens.

Do not publish a private implementation fragment merely so two builder stages
can share it. Staging is for an honest scoped capability that a consumer,
required dependent, or durable plugin operation can discover. Keep one-use
machinery lexical; keep a shared pure domain algorithm private with domain-only
inputs; coalesce stages or name a builder gap when private runtime context
cannot be shared without plumbing.

Default new scoped methods and surviving functions to domain inputs only. Do
not thread `editor`, `api`, `read`, `tx`, `store`, resolved plugin state
values, or a resolved plugin type through a helper graph when the plugin builder
can capture or stage them. Operation options remain valid domain input. Before
exposing a state/view parameter, try the active tx stage or callback owner. An
explicit active-state boundary is valid only when the same honest query must
run against an uncommitted transaction snapshot and focused proof shows that
`editor.read` would be stale.

Never export a one-off structural `*Editor`, `*Api`, or capability-subset type
to cap TypeScript expansion. If an operation needs editor-owned context, capture
it in the owning plugin callback or store the domain value the operation uses.
If the honest editor type recurses, repair the owning generic or declaration
boundary; do not turn compiler pressure into public architecture. A public
capability interface is justified only when independently implemented or
substituted capabilities are a real user job and the interface has its own
semantic owner.

For TS7056 at a package declaration boundary, the only acceptable target is the
direct inferred exported descriptor. Treat the failure as an owning generic or
declaration-boundary defect: compact the package's honest dependency source,
then repair Core's inferred graph or declaration carrier until direct emit
passes. Never introduce another `@plate-plugin-declaration-stage`, private
definition carrier, annotated staging alias, widened dependency, cast, or
capability-subset type as the answer. Existing marked stages are transitional
debt only: keep their exact removal gate tied to a direct declaration build,
rank the owner repair, and do not call the package or API architecture complete
while they remain.

Schema-derived public AST types come from the final exported descriptor. When a
later stage needs that shape, derive a private local `ElementOf<typeof plugin>`
or `TextOf<typeof plugin>` from its authoring context. Keep reusable option
templates private and generic over the exact node, then derive their public
aliases from `typeof FinalPlugin`. Widening a node-operation generic or exporting
a compiler/context ferry is an API regression, not an inference solution.
Do not break a recursive plugin declaration with a package-private structural
AST mirror. Algorithms that operate on a known owner derive its final
descriptor shape or the smallest `ElementWith` / `TextWith` capability.
Algorithms that intentionally diagnose malformed or open-world input accept
`Element` / `Text` and narrow every consumed property at runtime. Repair a
remaining declaration cycle at the generic or declaration boundary; do not
duplicate schema fields to make TypeScript stop recursing.

Context-bound factory authoring and public factory output are separate type
jobs. Let the author callback see the exact installed-plugin editor, then
project the returned factory/value to the smallest portable public contract.
If inferred declarations expose `InternalBaseEditorWithInstalledPlugins`, the
Core return boundary is wrong. Package-level editor aliases, reconstructed
option/result interfaces, export annotations, and casts merely fossilize the
compiler graph as public API.

Reject promotion when it only creates a name for one implementation fragment,
turns a boolean into a plugin without a complete absence story, exposes
correctness repair as optional, or anticipates hypothetical profiling,
serialization, runtime switching, or reuse. Named profiles are ordinary reusable
plugin arrays only after real reuse earns the name; they are not a second
behavior runtime. Reject behavior DSLs, capability registries, and
one-plugin-per-event or one-plugin-per-native-field mappings.

## Review Questions

Ask:

- What is the user trying to say, and does the call site say exactly that?
- What is the real import path for every noun, and is that layer its honest
  owner?
- Can one owner noun be removed from a scoped API?
- Can nesting become a flat domain verb?
- Can inference remove a type, cast, helper, or duplicated contract?
- When merging builder stages, does the surviving return type widen every
  affected accumulator, or merely preserve it? Where are the parity and
  negative type proofs?
- Is a customization path paying for an advanced case on every basic call?
- Is composition about user-visible capability or merely internal fragments?
- For behavior composition, did invariant, parameter, substitutable capability,
  and app policy get classified before a plugin was proposed?
- Is a proposed package kit actually one inseparable capability, or just a
  consumer preset that belongs in registry/app source?
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
- Am I selecting a workaround because the durable owner repair is harder? If
  so, keep the long-term target and route the real repair instead.

Do not preserve a weaker proposal because it is more elaborate, more generic,
more observable, or already documented.

## Output Contract

Lead with one recommendation, not a menu.

For `design` and `review`, return:

1. verdict;
2. ideal call sites with exact public import paths;
3. current source and caller evidence;
4. why this is the simplest truthful model;
5. machinery or alternatives rejected;
6. ownership by layer and non-negotiable runtime/safety laws;
7. breaking/adoption impact;
8. verification performed or explicit N/A;
9. exact next owner.

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
   `plite-plan`, `plate-plugin-creator`, `plate-ui`, `docs-creator`, and
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
`plite-plan`, `major-task`, or the package owner.

Do not implement product API changes unless the user explicitly asks and the
owning execution skill is loaded.
