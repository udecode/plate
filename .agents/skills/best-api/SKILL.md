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
- Publication-dependent activation work is `afterPublish`; cleanup remains
  activation-owned. Do not hide activation behind a vague lifecycle bucket.
- `validate` checks the assembled descriptor/editor context; it never receives
  a fictional configuration object.

Descriptor identity is `name`; serialized node identity is `type`. Plite,
Base, and Plate descriptors each carry one exact normalized definition through
a private invariant witness. Their public factories are one object call with no
caller-supplied generics. Internally, TypeScript may require a small inferred
environment parameter—Plite dependencies, or Plate dependencies plus initial
state—beside the author-input parameter to contextually type callbacks. That
verified inference split is implementation machinery, not public generic
ceremony and not evidence for the false claim that one self-referential generic
can infer the whole definition. Reject excess fields and normalize one exact
definition at the witness boundary. Never expose a parallel `PluginConfig`,
public `__config`, raw callback graph, or accumulator matrix in declarations.

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
TypeScript
cannot retroactively re-typecheck schema-derived callbacks, including callbacks
contributed by another plugin against that descriptor. Reject schema
replacement at the public type and runtime boundary while keeping unrelated
authoring and terminal configuration available. Runtime-resolved identity such
as a configured node type may remain configurable only when the author callback
types it truthfully rather than as the pre-configuration literal.

### Schema Shape Gate

Keep schema authoring explicit where structure differs and tiny where the law is
standard:

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
- Plate creation uses `schemaIdentity` for lineage. Plate schema elements use
  `blockContent` for normal-flow membership. Neither name pretends to own raw
  Plite grammar.
- Runtime verbs are `schema.create`, `schema.assertDocument`,
  `schema.assertFragment`, and `schema.isMarkableVoid`. Assertions accept
  `unknown` and narrow it.
- Raw Plite schema handles use `schema.handle.*`. Plate plugin callers pass the
  descriptor directly to `create`, `allowsElementType`, and
  `isElementTypeInGroup`; Plate does not add a second handle form.
- Compiler/provider witnesses stay internal. Public definitions expose authored
  schema, never normalized compiler carriers.

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

| Field                 | Public job                                                                                                                | Rejection test                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `initialState`        | defaults for mutable editor-local plugin state                                                                            | the value is not state or needs a second configuration channel                 |
| `store`               | live state reads, writes, subscriptions, and selector evaluation                                                          | the value is document state or a schema rebuild is expected                    |
| `selectors`           | pure projections of readonly store state plus domain arguments                                                            | it reads the editor/document, mutates, performs I/O, or writes the store       |
| `api`                 | stable plugin services not bound to a supplied document snapshot or active tx                                             | it mutates the document or is really a snapshot query                          |
| `read`                | pure, replayable queries over supplied document state                                                                     | it mutates, performs I/O, writes plugin state, or depends on ambient live state |
| `update`              | document reads and mutations through the active transaction                                                               | it opens a nested one-shot update or owns unrelated I/O                        |
| native Plite fields   | genuine editor-wide substrate through flat fields such as `commands`, `corrections`, `contributions`, `on`, and `activate` | it merely republishes plugin-scoped state, API, reads, or updates               |
| `codecs`              | format encode/decode declarations                                                                                          | it owns runtime service or mutation behavior                                   |

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
`editor.api.<pluginName>`, `editor.read.<pluginName>`, and
`editor.update.<pluginName>`. Generic code or exact ownership uses the same
capabilities through `editor.plugin(Plugin)`. Selectors remain store-owned and
are evaluated through the scoped store.

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

## Behavior Promotion

Do not infer public composition boundaries from callbacks, events, native
extension fields, or files. First classify the behavior:

| Class                    | Test                                                                     | Default shape                                        |
| ------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| invariant                | omission makes the owner invalid, unsafe, or semantically incomplete     | keep inline in the owning plugin or runtime          |
| parameter                | callers want the same capability with different data or thresholds       | declare a named `*PluginState`, type its defaults, and use the scoped store |
| substitutable capability | omission or replacement leaves a complete editor with a defined fallback | promote to an ordinary plugin or extension candidate |
| product policy           | the choice belongs to one app or kit rather than the framework default   | keep it app-owned and inline unless reused           |

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
`override.plugins[pluginName]` as a narrow weak-peer adaptation of an
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
definition type; a plugin using only `KEYS` intentionally gets the erased weak-peer
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
`editor.update` or add an API-name alias registry. When a serialized node type
is a bad public namespace, split the plugin's readable identity from its
`type`.

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
updates, and the installed descriptor only after the check when absence is
valid.

`editor.plugin(Plugin | pluginName)` is the only public imperative plugin
lookup. Descriptor inputs preserve exact inferred capabilities; runtime names
return erased portals. Use a name when the input is dynamic or the caller owns
a family-agnostic slot that intentionally accepts whichever installed
descriptor owns that name. Do not accept `{ name }`: that weak object shape
looks typed but cannot prove descriptor identity. Its
consumer portal exposes `api`, `read`, `update`, `store`, `type`, `installed`,
and the compiled `plugin`; callback-only authoring values such as `editor` and
`defineCodecs` stay off that portal. Do not add standalone or editor-method
alternatives such as `getBasePlugin`, `getEditorPlugin`, `getPlugin`,
`getPluginType(s)`, `getPluginName(s)`, `getPluginByType`,
`getContainerTypes`, or `getInjectProps`. Read `.type` from the concrete
descriptor portal when descriptor identity matters; use
`editor.plugin(name).type` when identity is intentionally erased. Missing
runtime names expose `installed: false`; every other portal field throws
instead of silently falling back to the supplied name. Reverse,
container, and renderer caches stay private. Public node questions use schema
predicates, compiled injection data lives at `portal.plugin.inject.nodeProps`,
and codec callbacks receive one `registry.{getType,getName,has}` namespace.

When a parent namespace already fixes the format and flow, keep its operation
hooks flat. `parsers.html` owns `query`, `transformData`, and
`transformFragment` directly. Do not repeat that direction with
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
contribution in `createBasePlugin()` / `createPlatePlugin()`: plugin-scoped
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
later active update stage
calls an earlier mutation through that same transaction's plugin group,
`tx[plugin.name].method(...)`; calling a portal one-shot update would open a
nested transaction.

Plate constructors and justified `.extend()` stages contextually type their
flat native Plite fields and callback returns. A public identity helper whose
only job is to recover a nested or erased field type is leaked compiler
machinery: repair the owning generic and hard-cut the helper instead of
preserving it, renaming it, or hiding the loss with an annotation, cast, or
`any`. Keep Plate-context capture inside the authoring callback and extract
domain inputs. Independently reusable standalone descriptors use Plite
`defineEditorExtension` and compose as dependencies; do not pass Plate plugin
context into their factories or copy them through a nested wrapper.

Author codecs through the constructor callback that supplies their inference
context:

```ts
createBasePlugin({
  codecs: ({ defineCodecs }) => defineCodecs(map),
  name: 'example',
})
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
Both `createBasePlugin()` and `createPlatePlugin()` accept it beside the rest of
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
- repeated reviews expose a missing or contradictory heuristic;
- a builder, portal, extension model, or routing change makes this skill stale.

In an explicitly read-only or review-only request, report the exact repair
instead of writing it. Otherwise repair it in the same authorized workflow.

Repair the smallest durable ownership chain:

1. update `.agents/rules/best-api.mdc`;
2. update only the relevant `VISION.md` / `docs/vision/**` doctrine when the
   correction is durable taste rather than procedure;
3. remove duplicated or contradictory wording from worker skills and link this
   owner instead;
4. run `pnpm install` to regenerate skills;
5. when the trigger, rubric, output, or routing changed, run
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
