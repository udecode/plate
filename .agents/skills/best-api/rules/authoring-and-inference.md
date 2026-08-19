# Authoring And Inference

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
flat `PLUGINS` map contains capability names only. A semantic capability with
parameters keeps one identity: Heading uses `PLUGINS.heading` plus required
`level`, rather than six rank-shaped capabilities. Package runtime code reads persisted identity from callback
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
