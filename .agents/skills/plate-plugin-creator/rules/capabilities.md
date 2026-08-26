# Capabilities And Inference

## Inference Law

Let builders and initializers own contextual typing.

- Infer plugin exports from `defineBasePlugin`, `definePlatePlugin`,
  `toPlatePlugin`, and chained `.extend()` calls.
- Start the declaration at the public export. Never assign a plugin factory or
  intermediate `.extend()` / `.configure()` result to a private constant when
  every production reference only feeds that one exported chain. Type queries
  do not count as another owner, and the constant's name is irrelevant. Keep
  inference stages as one fluent export; use a small independent domain or
  hook-stage contract when final-plugin type derivation would recurse. A
  package-private domain contract may type internal algorithms, but it keeps
  configurable schema identity broad, owns only the required structural
  properties, never becomes a public consumer type, and never replaces the
  final descriptor-derived AST alias.
- Never annotate or cast an inferred plugin export to `BasePlugin`,
  `PlatePlugin`, or a definition type.
- Do not create `PluginConfig` aliases. That parallel generic machine and its
  public `__config` anchor do not exist.
- `DefinitionOf<typeof FooPlugin>` is the sole public way to extract a
  descriptor definition. Name the alias `FooDefinition`, never `FooConfig` or
  an unsuffixed name. Keep true domain/runtime `*Config` types, but never
  restore `InferConfig` or another extraction alias.
- Keep an explicit state/API/update/domain type only for a real exported
  contract, recursive shape, reused contract, or external boundary.
- Prefer inline one-use constants, initial-state fragments, callback types,
  and test setup. Do not create ferry types to move an inferred callback into
  another file.
- Do not annotate local variables, callbacks, examples, or test fixtures whose
  initializer/context should infer them.
- Bind an initial public capability contract through the field callback's
  public return type. For a justified later stage, pass the contribution shape
  to `.extend<{ api: ApiContract }>(...)` or
  `.extend<{ update: UpdateContract }>(...)`. The `update` contract describes
  the command object returned by `update({ tx })`, not the factory function.
  Do not append `satisfies`, cast the callback, or annotate every parameter.
- Put every independent author contribution in `defineBasePlugin()` /
  `definePlatePlugin()`: `api`, `read`, `selectors`, `update`, flat native
  Plite fields, `codecs`, and ordinary Plate fields. There is no nested
  `extension` wrapper. Constructor callbacks already receive typed authoring
  context; context access alone never justifies `.extend()`. Use `.extend()`
  only to adapt an imported/prebuilt plugin descriptor, call a shared factory
  the constructor cannot access, or consume a real earlier-stage type
  dependency.
- Treat an exceptional builder chain as a typed capability dependency graph.
  When a later API, read, update, native field, event, or required dependent
  needs an earlier capability, add an earlier `.extend()` stage with the
  applicable `api`, `read`, `selectors`, `update`, native Plite field, or
  `codecs` field and consume its accumulated inferred surface. Multiple stages
  require a real type dependency and remain preferable to parameter-threaded
  helper functions.
- Author codecs through the constructor's context-bound callback:
  `codecs: ({ defineCodecs }) => defineCodecs(map)`.
  `defineCodecs(map)` handles self and product maps;
  `defineCodecs(TargetPlugin, map)` handles a foreign map and injects the
  target. The map remains MIME-keyed, and `'text/html'` accepts one
  schema-aware rule or a non-empty ordered rule tuple. Keep multiple HTML
  representations owned by one plugin in the same map; rule count is not a
  staged type dependency. Move the callback to `.extend()` only when it
  consumes an earlier capability. This is the one inline codec inference anchor. Do
  not write direct `codecs: { ... }`, manual `target` fields, a global helper,
  casts, or callback annotations.
- Stage only an honest scoped capability that consumers, required dependents,
  or durable plugin operations should discover. Do not publish a private
  implementation fragment merely to share it between stages. Keep it lexical,
  keep a pure shared domain algorithm private, coalesce stages, or name the
  missing builder capability.
- If contextual inference fails, repair the owning Core builder/generic or
  source API. A new definition alias or explicit `editor`/`tx` annotation is
  not an inference fix.
- A reusable factory whose generic definition requires an element or mark
  schema receives a required flat `schema.type` or `schema.key`. Optionalizing
  that handle because the plugin `name` is generic is a Core inference bug;
  repair `PluginAuthorSchemaView` instead of adding a non-null assertion,
  runtime guard, cast, or duplicated identity.
- A context-bound factory may infer the exact installed-plugin editor inside
  its author callback, but its public factory and emitted value must use the
  smallest portable public contract. An `InternalBaseEditorWithInstalledPlugins`
  declaration leak belongs to the Core return boundary. Do not patch it with a
  package-level `BaseEditor<typeof Plugin>` alias, reconstructed option/rule
  types, an export annotation, or a cast.
- Forbid `any` in production source. A deliberate local non-type test escape is
  the only exception.

Plite, Base, and Plate use the sole public factory grammar
`define*(name, definition)`, with no caller-supplied generics. Internally,
TypeScript may require a small inferred
environment parameter—Plite dependencies, or Plate dependencies plus initial
state—beside the author-input parameter to preserve contextual callback
inference. Keep that split private. Do not claim one self-referential generic
can infer the whole definition, expose the environment, or add caller
generics, annotations, casts, or `any`. Reject excess fields and normalize one
exact definition through a private invariant witness. Raw callbacks and
dependency graphs must not leak into declarations. `DefinitionOf<>` may expose
the definition; `PluginConfig`, `__config`, accumulator tuples, and public
witness fields may not.

TS7056 is an owner-level declaration defect, not a package authoring pattern.
Keep the direct inferred export as the only target. Compact the package's
honest dependency source, then stop and route the remaining failure to the
owning Core generic or declaration boundary. Never add another
`@plate-plugin-declaration-stage`, private definition carrier, annotated
staging alias, widened dependency, cast, or public subset type. An existing
marked stage is transitional debt: record its direct-build deletion gate and
do not attest the package against current doctrine until the owner repair
removes it.

When an update or API needs the element/text shape inferred by the constructor,
put that capability in a direct `.extend(({ plugin }) => ...)` stage and derive
the local shape with `ElementOf<typeof plugin>` or `TextOf<typeof plugin>`.
Keep operation-option templates private and generic over that exact shape.
Export public AST and option aliases only after the final descriptor, derived
from `typeof FinalPlugin`. Never widen a node generic, annotate the exported
plugin, or publish a context/definition type to make TypeScript finish.
The positional name is required, lower camel case, and human-readable. Keep a
different serialized node identity in `type`; do not encode storage syntax in
the descriptor name. Package roots expose author-facing contracts only:
`Any*`, `Internal*`, normalized/compiler types, accumulators, witnesses, and
raw callback graphs stay private or under a documented internal entrypoint.
An unparameterized editor has guaranteed Core capabilities only. Carry the
concrete editor or descriptor generic when package code needs installed
capabilities; never manufacture them with `any`. Plite's public runtime type is
`Editor`; Plate owns `BaseEditor` and `PlateEditor`.

Raw `PluginReference` carries nominal identity only, with no definition generic
or private witness. Concrete Base and Plate descriptors carry the one invariant
definition witness. Plite's root `EditorExtensionDependencyReference` is a
shallow, non-generic `name` plus optional `enabled` value. Capability/provider
carriers, definition witnesses, and recursive exact dependency ancestry do not
belong on that public reference.

`EditorExtensionTypeProvider` is the sole public value-sensitive capability
bridge. Its higher-kinded encoding, normalized installed-capability carrier,
and transitive dependency expansion are internal-only exports from
`@platejs/plite/internal`. Static portals require a unique literal name and
mutually assignable descriptor/installed capabilities. Runtime portals still
require exact installed descriptor identity. Plite keeps
`EditorExtension<Definition>` as one public definition parameter, and official
factory returns are derived rather than reconstructed with another public
generic.

Core's contextually typed author-source and canonical-lowered aliases are
implementation details. Do not export or teach them. A plugin author supplies
one object and receives one exact descriptor.

Low-level React composition uses `react({ dom })` with one required object and
the exact DOM descriptor. One explicit erased implementation boundary is
acceptable only where TypeScript 7 cannot reduce the invariant DOM-extension
union. Do not add zero-argument construction, flattened DOM options, overload
ceremony, caller generics, or scattered casts.

## Current-Owner Context Law

Inside a plugin authoring callback, use the current plugin values already
provided by that callback:

- `store` instead of `editor.plugin(plugin).store`;
- `api`, `read`, and `update` instead of rediscovering the current descriptor
  or calling the equivalent current-name root group;
- `type`, `plugin`, and `installed` instead of resolving the current plugin
  again by name or descriptor.

Destructure only the values the callback uses. Keep `editor` for editor-wide
substrate, another plugin, or one-shot transaction metadata that the scoped
`update` facade cannot express. Inside an active transaction, use `tx` and its
current plugin group, never `update`.

This rule follows the callback contract, not lexical proximity. Shortcut,
input-rule, state-value, render-prop, and other specialized callbacks may
intentionally expose only `editor`. Keep an exact typed plugin portal there;
do not move or wrap a coherent declaration solely to manufacture a context
shortcut. Never rewrite by matching a property name alone: another descriptor
such as `editor.api.dom` is not the current plugin's `api`.

## Capability Boundary Protocol

Classify every contribution before choosing a plugin field. This is the
canonical Plate plugin capability protocol; migration skills audit it instead
of defining another model.

| Field               | Owns                                                                                                                                                | Hard boundary                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `initialState`      | default mutable state for each editor instance                                                                                                      | declaration input, not a live accessor                                          |
| `store`             | live editor-local state through `get`, `set`, and `subscribe`                                                                                       | not document state; updates do not rebuild schema                               |
| `selectors`         | pure named projections of readonly store state plus domain arguments                                                                                | no editor/document reads, mutation, I/O, or store writes                        |
| `api`               | stable plugin services not bound to a supplied document snapshot or active transaction                                                              | immutable publication does not make its methods pure; never mutate the document |
| `read`              | pure queries over the supplied document snapshot/state                                                                                              | replayable for the same state and arguments; no mutation, I/O, or store writes  |
| `update`            | document mutation and transaction-local reads through the active `tx`                                                                               | no nested one-shot update and no unrelated I/O                                  |
| native Plite fields | genuine editor-wide substrate through flat `readMiddleware`, commands, corrections, declarations, contributions, events, activation, and validation | not an escape hatch for plugin-scoped state, reads, services, or updates        |
| `codecs`            | format encode/decode declarations                                                                                                                   | not runtime service or mutation ownership                                       |
| `prepareDocument`   | deterministic installed-plugin preparation of complete current-schema input after host migration and before schema fitting                         | never release migration, source-version selection, normalization, or compatibility policy |

Choose in this order:

1. Stored per editor? Declare defaults in `initialState`, use `store` for live
   access, and use `selectors` only for pure store projections.
2. Reads the document? Use `read` when the result must bind to the supplied
   snapshot or active transaction state.
3. Mutates the document? Use `update` and the supplied `tx`.
4. Otherwise, use `api` for a plugin-owned service that is not snapshot- or
   transaction-bound.
5. Use the flat native Plite fields only when the capability genuinely belongs
   to editor-wide substrate. If none fits, stop and name the ownership gap.

Historical document versions are not plugin capabilities. Applications bind
an ascending `defineDocumentMigrations` plan and exact historical source
fingerprints to their named schema; raw input needs an explicit unversioned
floor. Runtime and CLI call the shared `migrateDocument` runner. A plugin may
prepare installed current-schema invariants only after that host chain
succeeds.

Authoring stages have one equally strict protocol:

| Stage                                        | Owns                                                                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `defineBasePlugin()` / `definePlatePlugin()` | identity, schema, dependencies, default state, and every independent declaration or context callback                               |
| `.extend()`                                  | imported/prebuilt plugin adaptation, a shared factory unavailable to the constructor, or a real earlier-capability type dependency |
| `.configure()`                               | terminal overrides of existing fields; never schema replacement or type widening                                                   |

Context access alone never justifies `.extend()`. Merge independent
contributions into the constructor. Repeat `.extend()` only when the later
stage consumes a capability type introduced earlier.

Staging does not make every repeated field additive. Inferred object
capabilities such as `api`, `read`, and `update` accumulate across honest
stages. Replacement declarations such as the `commands` array do not: author
all ordered command handlers in one factory unless a later stage deliberately
replaces the complete earlier declaration. Inspect the field's merge law
before repeating it; `.extend()` is not generic array concatenation.

Deleted builder shortcuts are forbidden. Hard-delete `extendApi`,
`extendEditorApi`, `extendSelectors`, `extendTx`, `extendTxGroup`,
`extendExtension`, `extendCodecs`, and `extendHtmlCodec`. Do not author,
restore, alias, document, or preserve them; use the constructor or an honest
staged `.extend()` contribution. Classify the receiver before editing:
same-named methods on Zustand stores or other non-plugin builders are not
plugin-authoring targets.

`name` is capability identity. Author only
`defineBasePlugin(name, definition)` and
`definePlatePlugin(name, definition)`. Name variables and parameters
`plugin` when they accept an exact descriptor or `string`; call the normalized
internal capability identity `name`. Persisted element identity is
`schema.type` on an exact element portal; persisted primary-mark identity is
`schema.key`. Behavior and aggregate-property consumer portals omit `schema`.
Author callbacks may use `schema.properties.<localId>` for additional declared
properties, but consumer portals never expose that compiler map. `.extend()` /
`.configure()` cannot change schema identity. Never derive persisted identity
from `plugin.name`. Input rules and every AST caller use resolved schema
identity or semantic capabilities, never `plugin.name`. `.extend()`
widens the exact definition, `.configure()` is terminal and non-widening, and
`toPlatePlugin()` is the exact live Base-to-React adapter. Factories replace
cloning; never add `clone()` or another copy verb.

Inside `update`, use one object-patch law:
`tx.nodes.set({ property: value }, options)`. Owned keys and values are inferred
from the current plugin plus required dependencies through a shallow graph;
duplicate persisted keys infer their value union. For an aliased property, use
its persisted key in the patch: `{ [schema.properties.localId.key]: value }`.
Remove properties with a typed key or exact handle through `tx.nodes.unset`.
Dynamic string-keyed patches are the explicit runtime-schema escape hatch.
Use a semantic owner operation for prefix families or cross-node behavior. Do
not restore scalar `set(key, value)`, invent `tx.properties`, or add another
property-mutation portal. `tx.plugin(Plugin)` selects the installed plugin's
flat transaction capability group; it is not a property portal.

State and native extension mechanics:

- Give every state-owning production plugin a named `*PluginState`. Export the
  state type when the descriptor is exported.
- Check owner defaults with `const initialState: FooPluginState = { ... }` or
  an explicit factory return type. Do not derive the public state contract from
  the v1 default object, and do not replace contextual checking with `as` or
  `satisfies`.
- Put the typed defaults in `initialState`. Override descriptor defaults with
  an inline partial `.configure({ initialState })`; consumers do not redeclare
  the complete state contract.
- Read or mutate live values with builder `store` or
  `editor.plugin(FooPlugin).store.get/set/subscribe`.
- React subscriptions use `usePluginStore` or `useEditorPluginStore`.
- Never add a second top-level `options` or `config` channel for immutable,
  compile-time, parser, codec, schema, or host-policy values.
- Schema factories receive the configured `initialState` snapshot; parser,
  codec, API, read, update, and native-field callbacks use inferred `store`.
- Live store updates do not rebuild compiled schema. Configure
  schema-affecting initial state before editor construction.
- Plite editor extensions have no `config` contract. Immutable construction
  inputs and runtime resources stay in the factory closure or their host owner.
- Plate constructors expose Plite-native fields directly at the plugin root:
  `conflicts`, `readMiddleware`, `commands`, `corrections`, `stateFields`,
  `effectTypes`, `facetProviders`, `contributions`, `on`,
  `activate`, and `validate`. Never recreate a nested `extension` object.
- Plugins cannot define selection kinds or own selected-node state. Use core
  text or directional node selection, then derive plugin geometry through one
  owner-local read. Keep DOM gesture and overlay state in presentation code.
- Public read/update callbacks stay contravariant so an explicit annotation
  cannot manufacture an uninstalled plugin capability. Do not repair
  assignability with callback bivariance; keep any erasure at a named internal
  runtime boundary. Direct `update.selection` exposes mutations only.
- Bare public editor types default to the core-only `readonly []` extension
  tuple. Never make package code compile by defaulting `Editor`, `BaseEditor`,
  or their read/update surfaces to `any`; only named internal `AnyEditor`
  boundaries may erase installed capabilities.
- Treat the installed plugin/extension graph as the single editor capability
  projection. Never repair a package type by intersecting a whole
  `ReactEditor`, `DOMEditor`, or sibling layered editor back onto Plate; fix the
  missing owner field or use an explicit erased internal boundary.
- Type reusable editor helpers from the minimal `read`, `update`, `api`, or
  subscription capabilities they consume. If a helper returns a view of its
  input editor, preserve the full caller type through a layered overload. Never
  infer one state/provider witness and rebuild a raw `Editor`, `ReactEditor`, or
  `DOMEditor` around it; keep any erasure inside the runtime implementation.
- Clipboard ingress is not a plugin field. Add `clipboardHandler(...)` directly
  to `contributions`. `clipboardHandler(handler)` is the sole form; the owning
  extension or Plate stage contextually infers the handler transaction from
  its installed update capabilities. Never pass an editor to the helper.
- Keep Plate-context capture inside the owning flat authoring callback and
  extract domain inputs. A public context identity helper is leaked compiler
  machinery; fix the owning generic rather than adding a callback annotation,
  cast, `any`, alias, or replacement helper.
- `defineExtension` imported from `@platejs/plite` authors independently
  reusable standalone Plite descriptors that compose as dependencies. Do not
  pass Plate plugin context into those factories or copy inline Plate
  contributions through the imported helper.

All lifecycle and host/DOM observation uses one root `on` family. Child names
do not repeat `on`: use `keyDown`, `paste`, `nodeChange`, `textChange`, and
their capture variants beside Plite lifecycle names such as `commit`. Never
author or document a second `handlers` bucket. The runtime may retain private
bridges where Plate event short-circuit behavior differs from Plite run-all
lifecycle observation; that difference does not leak into authoring shape.

Plite owner-local capability factories are `read` and `update`; pure core-read
policy is `readMiddleware`. Do not restore descriptor `state`/`tx` authoring or
overload `read` as middleware. `validate` checks assembled context without a
configuration argument.

Deleted plugin option helpers are forbidden. Do not use or re-add root or
scoped `getOption`, `getOptions`, `setOption`, or `setOptions`. A name-only
portal needs a concrete cycle, layer, or decoupling reason; plugin-owned
callbacks whose contract supplies owner context should use it directly.
When `FooPlugin` is a valid optional peer, keep the typed portal and check
`editor.plugin(FooPlugin).installed` before reading its API, updates, store,
or installed descriptor. Disabled plugins count as absent. Do not probe root
`editor.api`, node types, schema properties, caches, or caught access errors.
When a factory reads a required plugin portal, declare that plugin at the
lowest owning descriptor's `dependencies`. A schema default, import, or
transitive coincidence is not an installation contract.

## API And Transaction Law

- Apply the Capability Boundary Protocol before choosing a field. Do not put a
  query in `api` merely because it does not mutate: document queries belong in
  `read`, while pure plugin-state projections belong in `selectors`.
- `api` is immutable as a published method object, not necessarily pure. It may
  own non-document service effects or live store orchestration. Document
  mutation still belongs exclusively in `update`.
- `api` is factory-only at Plite, Base, and Plate layers, including
  context-free APIs: write `api: () => ({ ... })`, never `api: { ... }`.
  Plite supplies one context object; Base and Plate add their authoring fields
  to that same object. Never use positional `(editor, context)` arguments or
  consumer `.configure({ api })`.
- `read` methods depend only on their supplied state and domain arguments.
  `update: ({ tx }) => ({ ... })` methods use the active transaction for both
  provisional reads and document writes.
- On a concrete inferred editor, consumers discover plugin API through
  `editor.api.<name>`; generic package code and exact ownership use
  `editor.plugin(FooPlugin).api`; exact raw Plite ownership uses
  `editor.extension(FooExtension).api`.
- The same projection law applies to `editor.read.<name>` /
  `editor.update.<name>` and the portal's `.read` / `.update`. Selectors
  stay store-owned and are evaluated through
  `editor.plugin(FooPlugin).store.get(selectorKey, ...args)`.
- Generic code integrating an optional descriptor first checks
  `editor.plugin(FooPlugin).installed`; required descriptor ownership may
  access the portal directly.
- `editor.plugin(plugin)` is the only public imperative plugin lookup, where
  `plugin` is an exact descriptor or `string`. Descriptors keep exact inference;
  runtime names return erased portals.
  Use a name for dynamic input or a family-agnostic slot that intentionally
  accepts whichever installed descriptor owns that name.
  Never accept `{ name }` as a public lookup input. The consumer portal is the
  resolved descriptor view: descriptor fields such as `name`, `inject`,
  `render`, `initialState`, and `targetPlugins` sit directly beside scoped
  `api`, `read`, `update`, `store`, and `installed`. Never add `portal.plugin`;
  callback authoring contexts alone may expose the current raw descriptor as
  `plugin`. Keep callback-only `editor` and `defineCodecs` off consumer portals. Do not export standalone or
  editor-method alternatives for descriptor, name/type reverse, container, or
  injection lookup. Use portal `.name` after lookup when the normalized plugin
  name is needed. Missing runtime names expose `installed: false`; they do
  not invent persisted schema identity. Installed element and property
  identity lives only at `portal.schema.type` for exact element owners and
  `portal.schema.key` for exact primary-mark owners. Behavior and
  aggregate-property portals omit `schema`; consumer portals never expose
  `schema.properties`. Runtime-name portals keep both getters non-optional for
  package-decoupled callers, but missing and wrong-kind access throws. Guard
  optional integration with `installed`. Keep compiler caches private,
  use schema predicates for public node questions, read compiled injection at
  `portal.inject.nodeProps`, and expose codec installation membership
  without name/type translation.
- All discovery paths expose the same descriptor-owned API. Publish it once
  through the root `api` field and let the compiler namespace it by `name`.
  Never add root-merged methods, `getApi`, or `pluginApi`.
- A scoped portal already owns the plugin noun. Prefer flat, direct verbs such
  as `table.update.insertTable()` over taxonomy like
  `table.update.insert.table()`. Route disputed public spelling to `best-api`.
- Put capability producers before their consumers. Prefer the constructor for
  the producer. Later `.extend()` callbacks may destructure the accumulated
  inferred `api`, `read`, selectors, or update surface;
  required dependents consume the same capability through their inferred
  editor or scoped portal.
- Inside a later tx method, reuse an earlier staged mutation through the same
  active transaction: `tx.plugin(FooPlugin).method(...)`. Generated closed
  editors may use `tx.foo.method(...)` directly. Do not use computed
  `tx[plugin.name]`, `tx.extension(...)`,
  `editor.plugin(FooPlugin).update.method(...)`, `context.update`, or another
  one-shot update from the active tx; those either erase descriptor typing or
  reopen a transaction. This descriptor-aware portal belongs to Plate. Raw
  Plite keeps direct named transaction groups and exposes no `tx.extension(...)`.
- A flat native runtime callback may be assembled before plugin API
  publication. When it needs a staged API, keep the typed callback context and
  read `context.api` at invocation time. Do not eagerly destructure `api`
  during descriptor construction and capture the pre-publication value.
- Repeated callers use the scoped API/tx method. They do not justify a parallel
  exported helper.
- Transform-backed callbacks receive and mutate through the active `tx`. Do not
  call `editor.update.*` from inside transform middleware, input rules,
  corrections, `editor.update(...)`, or `withoutNormalizing`.
- Do not extract one-owner behavior merely to create
  `foo(editor, tx, ...)` or paired one-shot/tx wrappers. Inline it where `tx`,
  `api`, store, editor, and type remain contextually inferred.

## Component Binding Law

- `component` is ordinary render publication data, not a Plate-only
  capability.
- `defineBasePlugin()` and `definePlatePlugin()` accept root-level `component`
  for static/RSC and live Plate consumers.
- Base `.extend()` does not accept `component`; independent defaults belong in
  the constructor and consumer replacement belongs in terminal
  `.configure({ component })`.
- Existing Plate descriptors bind or replace the ordinary node component
  through one terminal `.configure({ component })`.
- Static/base files may import a server-safe component but do not import
  `platejs/react`,
  `@platejs/core/react`, or any `@platejs/*/react` entrypoint.
- Use `toPlatePlugin()` at the owning React adapter to publish a reusable
  Plate-layer descriptor or add genuine Plate-only authoring. A terminal
  consumer never inserts conversion merely to set `component`.
- A static/base kit imports the static renderer module, never the feature
  package's live/client plugin or node component.
- Hard-delete `.withComponent()`.
- Do not author, document, or preserve direct public `render.node` assignment.
- `.configure()` is terminal and non-widening. It changes existing descriptor
  values; it never publishes new typed capabilities.
- `defineBasePlugin()` / `definePlatePlugin()` own every independent
  declaration contribution. Constructor callbacks already receive typed
  authoring context; context access alone never justifies `.extend()`. Use
  `.extend()` only for imported/prebuilt plugin descriptors, a shared factory the
  constructor cannot access, or an earlier-stage type dependency.
- New scoped methods and surviving helpers take domain arguments by default.
  Do not pass `editor`, `api`, `read`, `tx`, `store`, resolved plugin state
  values, or resolved plugin type merely to reuse plugin-owned behavior.
  Operation options remain valid domain input. Keep one-use machinery lexical;
  stage an honest reused plugin capability through another builder call.
- A shared stage factory never accepts the current descriptor solely to infer
  its name, schema, or element type. Let `.extend(factory(...))` contextually
  bind the stage and read owner capabilities from its callback context.
- Before adding a state/read-view parameter, try keeping the query in the
  active tx stage or callback owner. Allow an explicit active-state boundary
  only when the same public query must observe an uncommitted transaction
  snapshot; add focused proof and never substitute stale `editor.read` merely
  to shorten the signature.
- A surviving transaction helper must own a real cross-plugin or
  transaction-composition algorithm, require `tx`, and never open a nested
  update.
- Group consecutive synchronous mutations that form one user action in the
  existing transaction, or one `editor.update((tx) => ...)` when no `tx`
  exists.
- Never add arbitrary plugin/product fields to the editor root. Use scoped
  API/store state, Plite state fields, a React store, a local controller, or a
  module-local `WeakMap` according to lifecycle.

## Plite Primitive Law

Schema authoring follows the Plite owner exactly:

- Use `schema.element.textBlock()` for the ordinary editable text-plus-inline
  element; spell custom structural grammar explicitly.
- Complete and named roots contain `SchemaContent` directly. Omit `elements`
  for an empty element vocabulary and omit `unknown` for the safe `"reject"`
  default.
- Unvalidated `property.json()` stays generic JSON. Narrow only with a runtime
  predicate plus `validationVersion`.
- Put `role: "metadata"` on an element/text property placement for bookkeeping
  values; do not add meaning to the reusable value descriptor.
- Plate element declarations use `blockContent` for normal-flow membership.
  Application schema lineage and final grammar composition belong to the app
  owner under Plate Vision, not to a feature package.
- A plugin may contribute several keyed properties. Domain code keeps direct
  node access; generic plugin code destructures the exact property handle from
  callback `schema`. Consumers use typed nodes or semantic plugin capabilities;
  normalized property maps are not part of the plugin portal.
- Do not author application-level schema overrides in a feature package.
  Property keys and value laws stay owned by the feature plugin; route final
  grammar composition and app-owned properties to the application owner.
- Use `schema.create`, `schema.assertDocument`, `schema.assertFragment`, and
  `schema.isMarkableVoid`. Assertion inputs are `unknown` and narrow after
  success.
- Pass Plate plugin descriptors directly to schema queries. Reserve
  `schema.handle.*` for raw Plite schemas; never add a Plate plugin handle
  wrapper.
- Descriptor-aware schema queries only answer identity questions. Read document
  properties through typed property handles or a semantic plugin API; never
  infer a property query from an arbitrary one-property descriptor.
- Never export compiler/provider witnesses or rebuild private schema inference
  with a public config/model carrier. Repair inference in Core's private
  descriptor compiler.

- Install extensions with `editor.install(...)`; create DOM/React views with
  `createEditorView(editor, options)`. Do not add an editor runtime wrapper or
  restore `editor.extend(...)`.
- Keep root standalone editor utilities to genuinely editor-independent value
  operations such as `NodeApi`, `PathApi`, and `isEditor`. Put editor behavior
  on `read`, `update`, or an installed extension.

- Prefer direct one-shot reads and writes over one-operation callback wrappers.
  Use callback form only for shared snapshot/transaction state, branching,
  loops, or multiple operations.
- Pass a live node directly to `NodeTarget`/`at` when available. Resolve a path
  only when the path is the result.
- Do not rediscover a live node by scanning for its `type` and `id`.
- Every descriptor-aware Plate structural selector uses the exact descriptor
  whenever one exists: `type: FooPlugin`, `type: plugin` inside the owning
  author callback, or an array of descriptors. Do not eagerly resolve
  `schema.type`, call `editor.plugin(...).schema.type`, pass a capability name,
  or thread a resolved `type` through a helper merely to feed a selector. This
  applies to node reads/transforms, selection queries, corrections, and nested
  insertion selectors such as `split.type`. Keep persisted strings or schema
  handles only for raw Plite, AST construction and comparisons, codecs or
  external formats, deliberate fixtures, genuinely dynamic runtime input, or
  a generic boundary with no descriptor. At a mixed
  `PluginReference | string` capability boundary, pass descriptors through but
  resolve string capability names through their installed portal before using
  them as selectors; a capability name is not a persisted node type. Keep
  `match` function-only for
  property checks, computed policy, path-dependent logic, content/structure,
  truthiness, or a type guard. Never select a node-query result with a caller
  generic.
- Use boolean queries for boolean questions; do not materialize entries merely
  to test existence.
- Treat unresolved public reads as optional in package source. Do not add
  `{ required: true }` or non-null assertions without an internal invariant
  owner.
- Use current Plite ranges, reads, and updates directly. Do not add compatibility
  aliases or Plate wrappers around them.
- Do not replace event-only path resolution with a render subscription.
  `usePath()` is for reactive render dependence; element components and node
  wrappers receive no `path` prop, so resolve from the element inside an event
  when rendered output does not depend on position.
- Explicit normalization must name a real full-root or dirty-path invariant.
  Do not normalize merely to coalesce leaves, settle a transform, or preserve
  an old fixture shape. Repair the smallest transform/normalizer owner instead.
