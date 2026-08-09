---
description: Build or refactor Plate plugins with semantic base-first architecture, owner-first colocation, inferred types, initial-state/store configuration, scoped APIs and transactions, and honest React boundaries. Use when choosing defineBasePlugin vs definePlatePlugin, shaping plugin packages, merging helpers/components/hooks/tests into durable owners, or defining plugin APIs, update groups, state, dependencies, parsers, normalizers, and Plite extensions.
name: plate-plugin-creator
metadata:
  skiller:
    source: .agents/rules/plate-plugin-creator.mdc
---

# Plate Plugin Creator

Build Plate plugins that do not need a later `plate-next` cleanup.

This skill owns plugin authoring mechanics: semantic layer, durable source
owners, file topology, contextual typing, initial state, scoped stores/APIs and
transactions, React families, and package-local proof.

Before changing reusable API shape, naming, builder/factory patterns,
composition identity, or runtime/perf law, read [vision](../vision/SKILL.md)
and route the target call shape to [best-api](../best-api/SKILL.md). Use
`plate-plan` or `plite-plan` only when adoption, runtime law, or layer ownership
needs a plan. Use [docs-creator](../docs-creator/SKILL.md) for public docs.

## Required Reads

Before authoring or refactoring a plugin, read:

1. [creation-flow.md](./rules/creation-flow.md) for semantic and file ownership;
2. [typing.md](./rules/typing.md) for inference and public contracts.

This owner contains the canonical state/store, API, transaction, dependency,
Plite-primitive, React, and component-binding laws below. Do not read a second
composition rule.

Use [plugin-authoring-audit.md](./references/plugin-authoring-audit.md) only
for current repo examples. Core builders and type tests outrank precedent.

## Routing Gate

| Owner                       | Scope                                                    |
| --------------------------- | -------------------------------------------------------- |
| `vision`                    | durable doctrine, Plate/Plite ownership, perf law        |
| `best-api`                  | reusable call shape, naming, composition identity, DX/AX |
| `plate-plan` / `plite-plan` | runtime/adoption boundary and proof plan                 |
| `patch`                     | one local behavior bug or regression repair/proof closure |
| `plate-plugin-creator`      | implementation mechanics and owner-first topology        |

Continue here when the public target is already clear. Stop for `best-api` when
the work invents or materially changes a reusable public shape. For a local
regression, keep `patch` as workflow owner and use this skill only as the Plate
plugin implementation law.

## Semantic Layer

**Semantic base first, Plate second.**

- If behavior matters without React, author it in `src/lib` with
  `defineBasePlugin`.
- Lift an existing semantic base with `toPlatePlugin` only in its live React
  adapter; do not re-author it with `definePlatePlugin`.
- Base and Plate constructors accept root-level `component`; Base `.extend()`
  does not. A static/base kit declares or terminally replaces a server-safe
  component without importing a Plate React entrypoint.
- A static/base kit binds the Base descriptor to a static renderer module,
  never a live/client node component. In the registry, prefer the owning
  `*-static` component module.
- Use `definePlatePlugin` directly only for a real React/Plate-native plugin.
- Pure grouping of complete plugins belongs in an app or registry kit array,
  never a package bundle plugin.
- Keep a plugin base-only when no React layer has an independent job.
- Use the flat shared `PLUGINS` map for shipped capability identities and
  copied registry plugin references. Element `type` and property `key` are
  separate persisted schema identities. They default to `name` when omitted,
  but runtime AST work resolves `.type`/`.key` and copied/static document data
  uses explicit persisted literals. Additional document properties stay
  feature-owned. Never add `KEYS`, `NODES`, `STYLE_KEYS`, or grouped heading
  aliases; use distinct `PLUGINS.h1` through `PLUGINS.h6` for capability work.
  List literal items directly; never spread a literal array into another
  literal array.
- Plite owns generic editor substrate: nodes, ranges, selection, reads,
  updates, transactions, schema, history, DOM/runtime primitives, and editor
  extensions.
- Live descendant identity is Plite `NodeKey`. Resolve it with `editor.key`,
  coherent `state.key`, or active `tx.key`; reverse through `nodes.path`.
  Feature state and arguments use `key` / `keys`, never `id` / `ids`.
  Persisted `element.id` is a separate optional `ElementIdPlugin` capability;
  never serialize a `NodeKey` or alias the plugin-authored `id` property.
- Plate owns product composition: plugins, React integration, UI, app/registry
  kits, product commands, defaults, and docs/examples.
- Do not wrap Plite APIs under second Plate names. If clean authoring needs
  missing substrate, name the exact Plite or Plate gap and patch the owner
  instead of inventing a local bridge.

Named direct-Plate exceptions:

1. hook- or `useHooks`-driven plugins;
2. DOM/editor-surface plugins with no useful semantic base;
3. React node-prop or component behavior that has no non-React meaning.

## Owner-First Topology

Colocation is the default.

- Put behavior with exactly one production owner inline in that plugin's
  `define*Plugin` / `.extend()` chain. This includes one-use `with*`,
  `decorate*`, normalizers, parsers, commands, corrections, matchers, state,
  APIs, and tx callbacks.
- A separate helper needs multiple production consumers that cannot reuse the
  owning scoped API, a real cross-plugin/cross-layer/transaction-composition
  algorithm, a standalone public owner, or dedicated proof tooling.
- Tests, barrels, exports, docs, app wrappers, historical filenames, and
  hypothetical reuse do not count as additional production owners.
- There is no line-count ceiling. A large coherent owner is cheaper than a
  graph of one-use files.
- Do not create `internal/`, `helpers/`, `utils/`, `transforms/`, `queries/`,
  `components/`, or `hooks/` merely to classify implementation kinds.
- An `internal/` subsystem is justified only when it has several files and a
  durable independent boundary. Privacy alone is not file ownership.
- Keep feature-package React roots flat by default: plugin files, component
  family files, hook-family files, and one generated public root barrel.
- One durable component family owns one `<Family>.tsx` file. Keep family-only
  subcomponents, constants, variants, and render helpers in that file.
- When the family has hooks, one `use<Family>.ts[x]` hook-family file owns all
  related public and private hooks, including subcomponent-only hooks. Never
  put hook definitions in plugin descriptors, component files, stores, or
  providers.
- A provider/store file requires independently owned state or lifecycle
  consumed beyond one component family.
- Public exports and external imports prove access, not independent source
  ownership.
- When colocation makes a helper obsolete, delete its file and generated barrel
  export. Do not preserve aliases, forwarding wrappers, or old filenames by
  default.
- Never replace a deleted raw helper with a wrapper around the scoped plugin
  API. Call the scoped API directly.

Colocation controls source ownership, not public composition identity. A real
independently substitutable capability may remain colocated; route its public
identity to `best-api`.

Within one owned plugin array, terminal configurations derived from the same
authored plugin compose in source order; later defined values win and exact
identity deduplicates. A shared name never makes unrelated plugins or divergent
authoring branches compatible. Same-name descriptors across independently
optional app or registry kits still require a membership decision: do not make
one optional kit install another merely to adapt it. Route that fork to
`best-api`; `plate-next` owns the package/kit adoption audit.

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

TS7056 is a declaration-boundary failure, not permission to widen a plugin.
Keep the public descriptor inferred. Compact dependency-source carriers at the
Core owner; only when a genuinely large plugin still cannot emit, split the
minimum private stages, derive their exact types through documented internal
declaration carriers, and mark every retained source/final stage
`@plate-plugin-declaration-stage`. The private final stage may carry the exact
annotation that TS7056 requires; the public export remains an unannotated alias.
Require a captured failing direct declaration build, keep the pair out of
barrels, count it explicitly in topology audits, and delete it when direct emit
works. Do not export the staging constants or their internal definition types.

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

| Field               | Owns                                                                                                                                            | Hard boundary                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `initialState`      | default mutable state for each editor instance                                                                                                   | declaration input, not a live accessor                                         |
| `store`             | live editor-local state through `get`, `set`, and `subscribe`                                                                                    | not document state; updates do not rebuild schema                              |
| `selectors`         | pure named projections of readonly store state plus domain arguments                                                                             | no editor/document reads, mutation, I/O, or store writes                       |
| `api`               | stable plugin services not bound to a supplied document snapshot or active transaction                                                           | immutable publication does not make its methods pure; never mutate the document |
| `read`              | pure queries over the supplied document snapshot/state                                                                                           | replayable for the same state and arguments; no mutation, I/O, or store writes |
| `update`            | document mutation and transaction-local reads through the active `tx`                                                                            | no nested one-shot update and no unrelated I/O                                 |
| native Plite fields | genuine editor-wide substrate through flat `readMiddleware`, commands, corrections, declarations, contributions, events, activation, and validation | not an escape hatch for plugin-scoped state, reads, services, or updates       |
| `codecs`            | format encode/decode declarations                                                                                                                 | not runtime service or mutation ownership                                      |

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

Authoring stages have one equally strict protocol:

| Stage                                         | Owns                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `defineBasePlugin()` / `definePlatePlugin()`  | identity, schema, dependencies, default state, and every independent declaration or context callback |
| `.extend()`                                   | imported/prebuilt plugin adaptation, a shared factory unavailable to the constructor, or a real earlier-capability type dependency |
| `.configure()`                                | terminal overrides of existing fields; never schema replacement or type widening                    |

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

Inside `update`, write one uniquely owned, unaliased property with
`tx.nodes.set('property', value, options)` and remove it with
`tx.nodes.unset('property', options)`. The literal key and value are inferred
from the current plugin plus required dependencies through a shallow graph.
Use the current owner's exact `schema.properties.<localId>` handle for an alias
or local ambiguity, and a semantic owner operation for prefix families or
cross-node behavior. Keep object mutation for structural changes, atomic
multi-property writes, true dynamic keys, and unavoidable dependency
ambiguity. Do not invent `tx.plugin`, `tx.properties`, or another mutation
portal.

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
  `effectTypes`, `facetProviders`, `selectionKinds`, `contributions`, `on`,
  `activate`, and `validate`. Never recreate a nested `extension` object.
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
  active transaction: `tx[plugin.name].method(...)`. Do not call
  `editor.plugin(FooPlugin).update.method(...)`, `context.update`, or another
  one-shot update from the active tx; that reopens a transaction.
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
- Plate editor creation uses `schemaIdentity`; Plate element declarations use
  `blockContent` for normal-flow membership.
- A plugin may contribute several keyed properties. Domain code keeps direct
  node access; generic plugin code destructures the exact property handle from
  callback `schema`. Consumers use typed nodes or semantic plugin capabilities;
  normalized property maps are not part of the plugin portal.
- Only a closed `defineEditor(name, definition)` may remap final element type,
  content, groups, or property targets and add app-owned properties. Property
  keys and value laws stay owned by the feature plugin.
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
- Use shallow property matchers for exact metadata. Keep predicates for
  computed policy, path-dependent logic, content/structure, truthiness, or
  narrowing consumed by the caller.
- Use boolean queries for boolean questions; do not materialize entries merely
  to test existence.
- Treat unresolved public reads as optional in package source. Do not add
  `{ required: true }` or non-null assertions without an internal invariant
  owner.
- Use current Plite ranges, reads, and updates directly. Do not add compatibility
  aliases or Plate wrappers around them.
- Do not replace event-only path resolution with a render subscription.
  `usePath()` is for reactive render dependence; use renderer `path` or resolve
  inside the event when appropriate.
- Explicit normalization must name a real full-root or dirty-path invariant.
  Do not normalize merely to coalesce leaves, settle a transform, or preserve
  an old fixture shape. Repair the smallest transform/normalizer owner instead.

## React And Test Ownership

- Hooks/selectors subscribe only to values that affect render. Read
  callback-only values inside click/key/command/delayed handlers from
  `editor.read.*` or `editor.api.*`.
- Keep one colocated `<FooPlugin>.<family>.spec.tsx` per plugin behavior
  family. Do not mirror each API method, helper, or deleted filename into a
  separate spec.
- React tests live beside the component or standalone hook family owner.
- Split one `<FooPlugin>.<family>.slow.tsx` only when profiling proves the
  repository threshold or the case has an independent blocking proof boundary.
  Never use `.slow.spec.tsx`.
- Merge old helper specs into the surviving behavior-family spec when
  production helpers are merged.
- Keep editor/plugin construction inline in tests when inference should support
  it. Do not add local fixture-shape aliases, casts, or setup constants to hide
  weak source typing; repair the test-utils or builder owner.
- Assert current behavior, not deleted compatibility paths or incidental text
  leaf grouping.

## Package And Barrel Law

- Never hand-edit generated `index.ts` / `index.tsx` barrels.
- After adding, moving, renaming, or deleting exported files, run `pnpm brl`
  and fix source placement or generator configuration if output is wrong.
- Package source imports its direct runtime owner (`@platejs/core`,
  `@platejs/plite`, `@platejs/utils`, and so on), never the `platejs` umbrella.
- Keep React as a peer when the package exposes React surfaces. Keep only
  dependencies proven by source/runtime imports or repo tooling convention.

## Workflow

1. Read the three required rule files.
2. Decide the semantic layer and durable production, React-family, and test
   owners before creating files.
3. Search current Core builders/type tests and the closest clean package
   analog. Do not copy a stale file graph.
4. Route reusable public forks to `best-api`; otherwise keep the inferred
   plugin chain inline.
5. Define initial state, scoped store/API/update methods, relationships, flat
   Plite-native fields, and React behavior in their durable owners.
6. Delete superseded helper/component/hook/spec files and regenerate barrels.
7. Prove the smallest honest surface:
   - package typecheck and behavior tests;
   - Core type tests when builder/public inference changes;
   - compile/runtime proof that a required dependent sees staged capabilities;
   - compile/runtime proof for staged tx-to-tx reuse when one tx stage consumes
     another;
   - runtime proof when a native runtime callback consumes a staged API;
   - an active-transaction test when a query crosses a state-view boundary;
   - React tests when React behavior changes;
   - `pnpm brl` when exports or public files change.
8. Audit for stale helper names, root option helpers, nested updates, explicit
   plugin annotations, empty config aliases, top-level plugin `config`,
   parameter-threaded `editor` / `api` / `read` / `tx` helpers, and one-use
   file taxonomies.

## Do Not Copy

- One-use helper files, `internal/` dumping grounds, or folders by implementation
  kind.
- Plugin export annotations, empty config aliases, callback ferry types,
  `satisfies` patches, or `any` casts.
- Root editor pollution, root option helpers, duplicate Plate wrappers, or
  local structural guards around typed Plite APIs.
- Redundant portal nouns or taxonomy-only method nesting.
- `editor.update.*` inside an active transaction.
- Broad explicit normalization without a named invariant.
- Render subscriptions used only to feed later callbacks.
- Compatibility aliases, forwarding wrappers, or old filenames kept without
  an accepted API reason.

## References

- [creation-flow.md](./rules/creation-flow.md) — semantic and file ownership
- [typing.md](./rules/typing.md) — contextual inference and contracts
- [plugin-authoring-audit.md](./references/plugin-authoring-audit.md) — current
  examples and rejected precedent
