# Behavior And Ownership

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

## Public Concept Survival

Promotion is not the only decision. Every public noun, namespace, plugin,
abstraction, owner, layer, and package touched by a design or review must also
prove that it should survive.

Evaluate the system with that concept removed and its real jobs routed through
the nearest canonical owner. Delete it when no job remains. Merge or inline it
when only private mechanics remain. Keep it only for a hard law, an explicit
user constraint, or a source-proven independent current user job. Multiple
calls, files, tests, or consumers inside one behavior family still prove one
owner, not another public authority.

Do not promote an input gesture, view, query, policy, or payload into a parallel
authority when the editor or runtime already owns the state. Keep the adapter
private and write through the existing authority. Existing compatibility and
implementation weight affect rollout order; they never earn the public concept
another lifetime.

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

Copied registry source may directly import an optional `platejs/<feature>`
entrypoint when that behavior belongs to the importing component or kit.
Declare its peer requirements and registry dependencies honestly, and guard optional plugin portal access
when absence is valid. Do not create a cross-editor `*Integrations` file or a
bag of terminal `.configure()` calls just to invert dependencies or make the
registry graph look cleaner. Extraction must own a coherent capability or
break a real runtime cycle; otherwise colocation wins.

Do not add a second plugin-descriptor relationship for optional defaults or
encode optionality with wrappers such as `{ optional: Plugin }`. Optionality is
ordinary omission from the consumer's plugin array. Keep the descriptor graph
for invariants; keep product choice visible at the use site.

Public package exports are capabilities, not presets. Reject every package-root
export of a named plugin-array `*Kit`, including from convenience facades.
Packages export individual plugin descriptors; inseparable multi-plugin
structure uses one honest owner with `dependencies`. Keep package-local tuples
private when they help implementation or tests. Name and export reusable
plugin-array kits only from app or registry source, where consumers own the
product policy.

Copied Plate registry features use one stable app-owned `FooKit` composition
value whenever consumers install them into a plugin array, even when the tuple
currently contains one configured descriptor. The kit hides feature membership
and may grow without changing every consumer. `Kit` belongs only to the exported
value: the registry item and file use the feature name (`@plate/link`,
`components/editor/link.tsx`), never `link-kit`. Do not expose a parallel
`FooPlugins` alias. This registry/app law does not weaken the package-root kit
ban.

The copied default editor composition owns plugins only. It must not export a
fixed persisted schema ID, application migration chain, historical schema
fingerprints, or an `EditorMigrations`-style companion that ordinary consumers
must carry. Named lineage and upgrade policy belong to the real host persistence
owner or a dedicated migration example. Optional generated editor contracts may
derive the current schema from the plugin tuple without assigning persisted
application identity. Never make copied consumers accidentally share the
registry author's document lineage.

Copied Plate source installs into one flat `components/editor` product
namespace. `components/ui` is exclusively the selected shadcn primitive layer.
Do not create `components/plate`, nested `editor/plugins`, `editor/kits`,
`editor/nodes`, `editor/hooks`, or feature folders. Prefix independently useful
siblings such as `media-image`; keep family-only subcomponents inline. Use
`feature-static` only for a real server-safe renderer/composition boundary.
Standalone copied components use semantic feature names such as `blockquote`
and `media-image`, never implementation-role names such as `blockquote-node`
or `media-image-element`. Aggregate kits compose those semantic owners. Publish
live and static source as separate `foo` and `foo-static` registry items rather
than bundling both environments into one install item.

Primitive-library variants are install-time source choices. Radix, Base UI,
and React Aria implementations of one editor component write to the same
installed target and expose the same smallest editor-facing contract. Never
ship a runtime `base` switch, conditional primitive imports, or a consumer
`shared` file justified only by mutually exclusive variants. Duplicate the
complete variant source or share an independently useful editor component;
prove each variant against its actual primitive package and browser behavior.

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

Copied registry UI and genuinely reusable package components are host-agnostic,
even when one current host supplies a complete kit. They must not import the
host's editor type or use its root plugin namespaces. Host-agnostic typing does
not decide source ownership.

Trace React ownership to terminal product consumers, through package wrappers
and reexports. A package import, public export, docs page, or test does not count
as an independent consumer. When every terminal consumer is copied registry UI,
its UI-only hook, store, provider, hotkey controller, or plugin extension
belongs to that registry owner. Publish it from a package only when multiple
independent terminal owners reuse the contract or it owns a durable headless
semantic, DOM, accessibility, or integration subsystem. Multiple subcomponents
or registry files inside one component family are one owner.

Reject state-to-props hooks whose only caller immediately spreads the result
into one component family. Inline the state when one component owns it; use a
private compound-component context when siblings coordinate. Do not preserve a
second convenience component or lower-level hook beside the selected terminal
API without an independent consumer job.

When one hook mixes a durable headless DOM lifecycle with renderer composition,
split by responsibility instead of keeping the whole bag because one field is
reusable. The package may retain the subscription, observer, imperative DOM
projection, and cleanup contract with only its required lifecycle inputs; a
side-effect-only hook returns `void`. The copied renderer derives layout and
presentation state from reactive props plus plugin reads and owns transient
overrides, rounding, and event handlers directly. Purity alone does not earn a
standalone export: a trivial calculation used by one component family stays
private to that family.

A reusable package default must be semantically neutral. Application URLs,
visible copy, quotas, media limits, feature-specific labels, and visual stacking
belong to the consuming product or copied registry kit. Configurability does not
make an arbitrary product default a package concern.

Treat each independently installable registry item as a source-distribution
owner. Keep its copied UI self-contained. Repeating short presentation JSX,
labels, or menu rows across items is cheaper than adding another shared
registry file and dependency. Extract only when the new owner has an
independent install/use job or owns real behavior beyond presentation reuse.

Root `ListPlugin` is the only list-model owner. Reject any API proposal that
adds a second persisted list structure, transform family, serializer path, or
copied registry graph.

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

A universal first-party format authoring contract belongs in Plate foundation when feature
packages broadly author it and Plate foundation can express it through type-only
dependencies. Plate foundation directly owns that format's public codec types and built-in
MIME registry entry; the optional format package still owns the compiler,
intrinsic language behavior, and operation-level escape hatch. Do not create a
contract-only package whose job is to ambiently augment Plate foundation, and never require
feature authors to activate a built-in format with an empty or side-effect type
import. Truly optional or third-party format contracts stay outside Plate foundation and
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
then repair Plate foundation's inferred graph or declaration carrier until direct emit
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
Plate foundation return boundary is wrong. Package-level editor aliases, reconstructed
option/result interfaces, export annotations, and casts merely fossilize the
compiler graph as public API.

Reject promotion when it only creates a name for one implementation fragment,
turns a boolean into a plugin without a complete absence story, exposes
correctness repair as optional, or anticipates hypothetical profiling,
serialization, runtime switching, or reuse. Named profiles are ordinary reusable
plugin arrays only after real reuse earns the name; they are not a second
behavior runtime. Reject behavior DSLs, capability registries, and
one-plugin-per-event or one-plugin-per-native-field mappings.
