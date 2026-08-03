# Plate Vision

Plate is the editor framework that ships in apps. It owns plugins, wrappers,
components, kits, app-facing docs, product ergonomics, and opinionated UX built
on top of Plite-first primitives.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plate doctrine after the lane is selected.

## Direction

Plate started as a way to make Plite-based editors practical to build and
maintain in real products.

The goal: a rich-text editor framework that is composable, production-ready,
and easy to adapt without giving up ownership of your editor, schema, or UI.

Current priorities:

- bug fixes and stability;
- docs, setup reliability, and first-run UX;
- performance on real editor workloads;
- better plugin and component ergonomics;
- better migration from Plite and a clearer Plite boundary;
- serialization, import, and export reliability;
- stronger registry, templates, and docs coverage;
- collaboration, AI, and advanced workflows where they fit cleanly;
- better testing infrastructure and confidence around edge-case editor
  behavior.

## Plate Rules

- Keep Plate core unopinionated enough for framework use. Feature capability
  belongs in its package; product policy belongs in app/registry kits and
  examples.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is
  not enough.
- For current Plate features, parity and protocol matter. For deferred
  features, record the owner instead of pretending coverage exists.
- Public docs must be source-backed, current-state only, and readable by humans
  and agents.
- Plugin and feature pages are headless first. UI components are render
  examples unless source proves they own the behavior.
- Never document plugin APIs or transforms the source does not actually ship.

## Plugin And Component Doctrine

- Core stays lean. Keep invariants in their owner, plugin runtime values in
  `initialState` and its scoped store, and product policy app- or kit-owned;
  proven substitutable capabilities use
  ordinary plugins or packages.
- Plugin authoring keeps one-owner behavior colocated and inferred. Public
  builders, configuration paths, and contribution namespaces each need a
  distinct user job; current assembly machinery is evidence, not doctrine.
- Builder consolidation targets the fewest inference-preserving, semantically
  distinct authoring stages, not the fewest method names. Before merging,
  overloading, renaming, or deleting a builder, prove the surviving path widens
  every affected type accumulator across repeated calls, named groups,
  dependencies, plugin conversion, terminal configuration, root/portal
  projection, and declaration emit. If it only carries a type through, fix the
  owning generic or keep the stage; callback annotations, casts, and `any` are
  not parity.
- Plite, Base, and Plate use the sole public factory grammar
  `define*(name, definition)`, with no caller generics. Their private types may
  infer a small environment—Plite
  dependencies, or Plate dependencies plus initial state—beside the author
  input when TypeScript needs that split for contextual callbacks. Do not
  expose that environment or pretend one self-referential generic can infer the
  whole definition. Reject excess fields, normalize once, and preserve the
  exact definition through a private invariant witness. `name` is capability
  identity; element `type` and property `key` are persisted schema identities.
  Omitted schema identities default to `name`, but they are not the same
  contract. Do not expose `PluginConfig`,
  public `__config`, raw callback graphs, or a second accumulator machine.
  The required positional name is lower camel case and human-readable; a
  different serialized identity belongs in `type`.
- Public roots expose author contracts, not `Any*`, `Internal*`, compiler and
  normalization graphs, accumulators, or witnesses. Unparameterized editors
  expose only guaranteed Core capabilities; package consumers carry concrete
  editor or descriptor generics. Plite's runtime type is `Editor`; Plate owns
  `BaseEditor` and `PlateEditor`.
- Raw `PluginReference` carries nominal identity only; it has no definition
  generic or private witness. Concrete Base and Plate descriptors own the
  single invariant definition witness. Plite's root
  `EditorExtensionDependencyReference` is shallow and non-generic, exposing
  only `name` and optional `enabled`.
- `EditorExtensionTypeProvider` is the sole public value-sensitive capability
  bridge. Its higher-kinded encoding, normalized installed-capability carrier,
  and transitive dependency expansion stay under `@platejs/plite/internal`.
  They do not recursively encode exact dependency ancestry. Static portals
  prove a unique literal name and mutual capability assignability; runtime
  portals prove exact installed descriptor identity. Plite keeps
  `EditorExtension<Definition>` as one public definition parameter and derives
  official factory returns.
- Core may internally distinguish contextually typed author source from its
  canonical lowered Plite definition. That aliasing is not a public export or
  authoring concept.
- Raw plugin tuples infer lightweight runtime capabilities and
  descriptor-local node shapes while keeping editor-wide `Value` broad. A
  closed application definition uses `defineEditor(name, definition)` and
  generated, committed contracts for exact recursive `Value`, concrete schema
  types, mutations, and runtime fingerprint verification. Do not make ordinary
  `editor.api`, `editor.read`, or `editor.update` access recursively evaluate
  the complete application grammar, and do not introduce size heuristics or
  depth-limited precision.
- Low-level React composition is `react({ dom })`: one required object with the
  exact DOM descriptor. Keep one explicit erased implementation boundary only
  for the TypeScript 7 invariant-union reduction limit.
- `DefinitionOf<typeof FooPlugin>` is the sole public descriptor-definition
  extractor. Name its alias `FooDefinition`, never `FooConfig`; true
  domain/runtime config types remain valid.
- `.extend()` widens the exact definition; `.configure()` is terminal and
  non-widening; `toPlatePlugin()` is the exact live Base-to-React adapter.
  Factories replace `clone()` and any third copy verb.
- Extensions install through `editor.install(...)`; DOM/React views are created
  with `createEditorView(editor, options)`. No editor runtime wrapper or
  `editor.extend(...)` survives. Root standalone utilities are reserved for
  editor-independent value operations such as `NodeApi`, `PathApi`, and
  `isEditor`.
- Descriptor-aware schema calls identify schema elements and groups. Document
  property reads use typed property handles or semantic plugin APIs, never a
  one-property descriptor shortcut.
- All lifecycle and host/DOM events use one root `on` family with prefixless
  names such as `commit`, `keyDown`, `paste`, `nodeChange`, `textChange`, and
  capture variants. Do not expose a second `handlers` bucket. Private runtime
  bridges may preserve Plate short-circuit behavior versus Plite run-all
  lifecycle observation without changing authoring shape.
- A field that already owns contextual typing does not expose a second public
  identity helper merely to reapply its nested type. Fix the owning generic and
  hard-cut that compiler machinery. Plate native-field callbacks stay directly
  on the plugin root; context-dependent behavior stays inside the authoring
  callback, while independently reusable standalone descriptors use the Plite
  builder with domain inputs and compose as dependencies.
- Plugin constructors own every independent author contribution: `api`,
  `read`, `selectors`, `update`, flat native Plite fields, `codecs`, and
  ordinary Plate fields and their context callbacks. There is no nested
  `extension` wrapper. Codec maps use the constructor callback's context-bound
  `defineCodecs`: one argument for self/product maps, or
  `defineCodecs(TargetPlugin, map)` for a foreign contribution with injected
  targets. This is the one inline codec inference anchor; do not expose direct
  maps, manual targets, or a global helper. Constructor context alone never
  justifies `.extend()`. Use `.extend()` only for an imported/prebuilt
  declaration, a shared factory the constructor cannot access, or a real
  earlier-stage type dependency. Keep `.configure()` terminal and non-widening.
  `defineBasePlugin()` and `definePlatePlugin()` accept root-level `component`
  for static/RSC and live consumers; terminal `.configure({ component })`
  replaces it. Base `.extend()` rejects it because independent defaults belong
  in the constructor. Use `toPlatePlugin()` at the owning React adapter to
  publish a reusable Plate-layer descriptor or add genuine Plate-only
  authoring. A terminal consumer never inserts conversion merely to set
  `component`.
  Do not expose `.withComponent()` or the renderer registry shape.
- Native capability authoring follows Plite exactly: owner-local document
  queries use `read`, owner-local mutations use `update`, pure core-read policy
  uses `readMiddleware`, and `validate` receives assembled context without a
  configuration argument. Do not restore descriptor `state`/`tx` authoring or
  overload `read` as middleware.
- Clipboard ingress is a direct typed `clipboardHandler(...)` contribution,
  never a root plugin field. `clipboardHandler(handler)` is the sole form; the
  owning extension or Plate stage contextually infers the handler transaction
  from its installed update capabilities. Never pass an editor to the helper.
- Core owns the author-facing codec types and MIME registry entry for a
  universal first-party format when that contract needs only type dependencies.
  Feature packages must not activate built-in format typing through empty or
  side-effect type imports. Markdown is the concrete first-party case: Core
  owns its MDAST-facing authoring types and built-in `text/markdown` registry
  entry, while `@platejs/markdown` owns the optional compiler/runtime. Truly
  optional or third-party format contracts stay outside Core behind an explicit
  type path. Installed feature plugins own their shipped format codecs. Compile
  those declarations once from the installed plugin graph; do not centralize
  feature rules in the format package or mutable plugin state.
- Plugin schema is creation-owned. Declare it in the plugin constructor, using
  a schema factory over typed `initialState` for authored variability; neither
  `.extend()` nor terminal `.configure()` replaces it. Schema-derived callbacks
  may belong to that plugin or a foreign contributor, and TypeScript cannot
  retroactively re-typecheck either. Preserve unrelated authoring and
  configuration. Values resolved only after configuration, such as a
  configured node type, stay truthfully broad in the author callback and exact
  at runtime.
- Put `schema` before inline constructor callbacks that consume its inferred
  shape. Use one real `.extend()` dependency stage when a callback needs a
  capability introduced by an earlier result; annotations and casts are not
  inference repair.
- Plugin state has one public channel: `initialState` declares defaults,
  `.configure({ initialState })` overrides descriptor defaults, builder
  callbacks use inferred `store`, and consumers use
  `editor.plugin(Plugin).store`. React subscriptions use `usePluginStore` or
  `useEditorPluginStore`. Do not restore deleted option accessors or add a
  parallel immutable `config` channel.
- Plite definitions have no separate `config` channel either. Immutable
  construction inputs and runtime resources stay in the extension factory
  closure or their honest host owner.
- Every state-owning production descriptor has a named `*PluginState`, exported
  with an exported descriptor. Owner defaults are checked against that contract
  through a typed constant or explicit factory return type; they never define
  the contract by inference, `as`, or `satisfies`. Consumer configuration stays
  partial and inline.
- Capability names encode execution boundaries. `selectors` are pure
  projections of plugin store state; `read` is a pure, replayable query over a
  supplied document snapshot; `api` is a stable plugin service not bound to a
  supplied snapshot or transaction; `update` owns document mutation through
  the active transaction; flat native Plite fields own genuine editor-wide
  substrate. Immutable API publication does not imply method purity, but
  document reads and writes still belong in `read` and `update`.
- Every element plugin gets descriptor-bound `insert`, `set`, and `remove` on
  `editor.plugin(Plugin).update`. Closed generated editors additionally expose
  those methods under the capability name on root and transaction updates.
  Raw tuples keep authored root/transaction methods exact without materializing
  a schema-wide generic mutation map. These methods target the descriptor's
  persisted `type`; callers do not restate identity or `match`. An authored
  same-name method replaces the synthesized default only when it adds real
  semantics. Delete noun aliases such as `insertTable`; keep distinct verbs
  such as `insertColumn` and `merge`.
- Classify behavior before exposing composition: invariants stay in their
  owner, runtime parameters stay in `initialState` and the scoped store,
  substitutable capabilities may become ordinary plugins, and product policy
  stays app- or kit-owned.
- A public capability plugin needs a real omission/replacement job or a hard
  ownership boundary, valid fallback semantics, closed dependencies, and
  independent proof. Protocol rows, events, and native extension fields do not map
  one-to-one to plugins.
- Plugin identity does not force another file. Keep one-owner descriptors
  colocated. Public packages export individual capability descriptors;
  inseparable multi-plugin structure uses an honest owner with
  `dependencies`. App and registry source own named plugin-array kits after
  real reuse; package-local tuples stay private implementation details. A
  package grouping array is still the wrong owner even when it replaces a fake
  grouping plugin or saves repeated imports.
- Plugin relationships stay singular and truthful: required structure or
  capability uses transitive `dependencies`. Optional capabilities are
  ordinary plugins included by the consumer; an enhancement may depend on its
  host, but the host does not bundle the enhancement. Pure grouping, defaults,
  and product policy use app/registry-owned readonly arrays. Do not add an
  optional-child field or `{ optional: Plugin }` wrapper; omission from the
  consumer array already expresses optionality.
- Base and live consumers do not automatically justify parallel kits. Share
  one runtime-neutral app/registry policy kit when its descriptors, initial
  state, and behavior are identical; each consuming preset composes its own
  static, React, native, or other renderer-specific peer kits. Split only the
  owner whose renderer or platform behavior genuinely differs.
- Configure a target descriptor directly only when the caller owns that
  target's membership in the final composition. Import access alone does not
  establish membership ownership. A complete same-name descriptor customizes an
  installed dependency or framework default. Within one owned plugin array,
  terminal configurations derived from the same authored plugin compose in
  source order: earlier non-overlapping fields survive and later defined values
  win. Exact descriptor identity deduplicates; unrelated plugins and divergent
  authoring branches cannot share a name. Required dependencies cannot be
  disabled. Optional product membership changes in the owning app/registry
  array, not through a disabled tombstone.
- A plugin that does not own another capability's membership in the consumer's
  final composition may use `override.plugins[name]` as a weak peer: adapt only
  an already-installed target, no-op when absent, never install or mutate
  topology, never disable a required dependency, and yield to the target's
  terminal configuration. This applies even when the adapting plugin can
  import the target. An independently optional plugin or kit must not install
  another independently optional peer merely to adapt it. Prove adapting-only,
  target-only, both, and both with explicit target configuration. Bare-name use
  is intentionally erased; exact target-option inference requires importing
  the descriptor or definition type. Keep component replacement and typed
  root-level `component` binding and typed foreign codec contributions authored
  as `defineCodecs(TargetPlugin, map)` inside the owning declaration callback
  as distinct paths. The
  codec helper injects the target. Do not add a central plugin-name registry,
  ancestor reach-through methods, recursive child registries, or add/replace
  verbs.
- Resolve peer conflicts at the smallest behavior surface. Remove or replace
  one conflicting shortcut, handler, parser, or render contribution instead of
  disabling its whole plugin. Required dependencies cannot be disabled, and
  one conflicting member does not become a public plugin without independently
  passing the capability-promotion bar.
- A concrete inferred editor exposes every non-empty plugin API through
  `editor.api.<name>` for complete autocomplete and agent discovery.
  Generic package code may use `editor.plugin(Plugin).api`; exact raw Plite
  ownership uses `editor.extension(Extension).api`. Every path exposes the same
  descriptor-owned API contributed once at root `api` and projected under
  `name`. The root `api` is always a factory, including for context-free
  values; it receives one context object, and consumer configuration cannot
  replace it. Keep names human-readable. Resolve element `type` and property
  `key` from schema-owning portals or authoring context; use `name` only for
  capability lookup and namespaces. Do not root-merge
  implementations, add `getApi`/`pluginApi`, create
  API-name aliases, or move mutations outside `editor.update`.
- Generic code that accepts an optional descriptor checks
  `editor.plugin(Plugin).installed` before using its capabilities or resolved
  descriptor fields. Disabled plugins count as absent. Schema identity is the
  exception: uninstalled `.type`/`.key` preserve an exact descriptor identity
  or use the runtime string conventionally, so read them directly and never
  add an installed fallback. Do not infer plugin
  availability from root `editor.api`, node types, schema properties, caches,
  or caught access errors.
- `editor.plugin(plugin)` is the sole public imperative lookup, where `plugin`
  accepts an exact descriptor or `string`. Descriptor inputs keep exact
  inference; runtime names return erased portals;
  names serve dynamic input and family-agnostic slots that intentionally
  accept whichever installed descriptor owns the name;
  `{ name }` is not a public lookup input. Its consumer portal is the resolved
  descriptor view: descriptor fields such as `name`, `inject`, `render`,
  `initialState`, and `targetPlugins` sit directly beside scoped `api`, `read`,
  `update`, `store`, and `installed`. Never nest the descriptor under
  `portal.plugin`; callback authoring contexts alone expose the current raw
  descriptor as `plugin`, with `editor` and `defineCodecs`. Use portal `.name` after lookup when the normalized
  runtime identity is needed. Name every
  descriptor-aware API input `plugin`; call it `name` only after normalization.
  Missing runtime names expose `installed: false`; `.type` and `.key` expose
  exact descriptor identity or the runtime string's conventional identity,
  while capability and descriptor fields throw. Reverse/container/render caches are private,
  public node questions use schema, injection is read from
  `portal.inject.nodeProps`,
  and codec mapping uses one `registry` namespace.
- Keep operation hooks flat when their parent namespace already fixes format
  and flow. The `'text/html'` codec directly owns `query`, `transformData`,
  and `transformFragment`; an `ingress`/`egress` bucket needs a distinct
  independently consumed lifecycle.
- Multiple callers of one plugin operation reuse its plugin-owned API; they do
  not justify a parallel raw helper. Keep the algorithm in the plugin.
  Standalone functions need a real cross-plugin, cross-layer, or
  transaction-composition job that one plugin cannot own honestly.
- Express intra-plugin capability dependencies through ordered builder stages.
  The constructor publishes the smallest honest `api`, `read`, or `update`
  capability whenever possible; later stages and required dependents consume the
  accumulated inferred surface. New scoped methods take domain inputs instead
  of threading `editor`, `api`, `read`, `tx`, resolved plugin store values, or
  resolved plugin types through helper signatures; operation options remain
  valid domain input. A later update stage reuses an earlier mutation through
  the active `tx[plugin.name]` group, never a portal one-shot that opens another
  transaction. Do not publish a private implementation fragment merely to
  share it between stages: keep it lexical/private, coalesce stages, or name a
  builder gap. Keep an explicit active-state boundary only when uncommitted
  transaction semantics require it, and prove that case rather than falling
  back to stale `editor.read`.
- Do not export one-off structural editor, API, or capability-subset types to
  cap TypeScript expansion. Capture editor-owned context in the plugin owner or
  store the domain value the operation consumes. Recursive honest types are an
  owning generic or declaration-boundary bug, not a public API concept. A
  public capability interface needs a real independent implementation or
  substitution job and its own semantic owner.
- Keep dependency sources compact and exact so package declaration emit does
  not serialize installed graphs. A remaining TS7056 boundary may use the
  minimum private, exact, explicitly marked declaration stages through
  documented internal type carriers. The exported plugin stays inferred; no
  public subset interface, cast, widened dependency, or annotation replaces it.
- React files follow durable families rather than individual symbols or
  implementation kinds. Keep a component family in one `<Family>.tsx` file
  with its subcomponents, variants, render helpers, and component-local
  constants. When that family has hooks, keep every related public and private
  hook in one `use<Family>.ts[x]` hook-family file, including
  subcomponent-only hooks. Plugin descriptors, component files, stores, and
  providers never own hook definitions. A provider or store earns another
  file only for independently owned state or lifecycle. Public access and
  sibling composition do not justify more files.
- Keep feature-package React roots flat by default. A nested component/hook
  directory earns its keep only as a real public subsystem with multiple
  cross-family owners, not as taxonomy or a response to file size.
- Treat each independently installable registry item as a source-distribution
  owner. Keep its copied UI self-contained. Short repeated presentation JSX is
  cheaper than another shared registry file/dependency; extract only for an
  independently useful registry item or real behavior owner.
- Registry surfaces dedicated to `*-classic`, including `list-classic`, are
  maintenance-only pending deprecation. Do not add parity work, new variants,
  shared abstractions, polish, demos, adoption, or API investment. Touch them
  only for a user-facing regression, security or release blocker, or an
  explicitly authorized deprecation/removal. New work targets the modern
  registry surface; planned deprecation alone does not authorize deletion.
- Preferred extension path is npm package distribution plus local app
  composition and registry usage for development.
- If you build a plugin or component pack, host and maintain it in your own
  repository.
- The bar for adding optional capability to core is intentionally high.
- New app-specific components should usually live in your own app or registry,
  not in core by default.
- Core UI additions should be rare and require broad demand, clear reuse, or a
  real API reason.

## Public API And Plugin Doctrine

- If work touches a reusable public/editor-platform API, use root `VISION.md`
  and this file first, then use `best-api` to choose or review the call shape.
- If work touches runtime/service-boundary architecture, use root `VISION.md`
  and this file first.
- If work is ambiguous between reusable API design and implementation, route
  API shape to `best-api`; route adoption and implementation to the layer
  owner after the target is clear.
- If the public pattern is settled and the task is plugin execution, hand off
  to `plate-plugin-creator`.
- App-local convenience, one-off demos, and package-local mechanics do not need
  doctrine unless they create a reusable public pattern.
- Every lane that introduces or materially changes a reusable public API,
  runtime boundary, builder/factory pattern, or extension contract must include
  root/detail vision updated or reaffirmed evidence.

Owner map:

| Concern                                              | Owner                                   |
| ---------------------------------------------------- | --------------------------------------- |
| public GitHub issue/PR/security queue control plane  | `maintainer`                            |
| internal Plate/Plite long quality loops              | `auto`                                  |
| post-merge/current-tree until-clean closure          | `autoclosure`                           |
| reusable architecture doctrine                       | root `VISION.md` and `docs/vision/*.md` |
| durable public API doctrine                          | root `VISION.md` and `docs/vision/*.md` |
| concrete public API design, review, and debt ranking | `best-api`                              |
| Plate API adoption, rollout, and proof plan          | `plate-plan`                            |
| runtime/service-boundary patterns                    | root `VISION.md` and `docs/vision/*.md` |
| layering / ownership law                             | root `VISION.md` and `docs/vision/*.md` |
| performance/scalability law                          | root `VISION.md` and `docs/vision/*.md` |
| anti-pattern catalog                                 | root `VISION.md` and `docs/vision/*.md` |
| plugin file placement / wrappers / typing mechanics  | `plate-plugin-creator`                  |
| plugin authoring execution flow                      | `plate-plugin-creator`                  |
| app-local sugar                                      | local app/kits                          |
| public docs shape                                    | `docs-creator`                          |
| UI/component registry shape                          | `plate-ui`                              |

## Matcher Extraction Heuristic

When scanning a reusable API family, aggressively inspect repeated `resolve()`
and `apply()` bodies before inventing more package-level wrappers.

Pull into core when repeated logic is mostly trigger gating, collapsed-selection
gating, block-start / text-before lookup, delimiter / prefix / regex matching,
range or payload construction, or other feature-agnostic editor-state
inspection.

Keep local when repeated logic is mostly node creation, mark toggling, list
transforms, link validation or insertion, equation insertion, code-block
insertion, or any semantic transform owned by a feature package.

Core owns matcher primitives and shared input-state access. Feature packages
own semantic apply behavior.

## Plite Boundary

Plate is built on top of Plite.

Migration from Plite to Plate should be straightforward, and Plate can
re-export Plite surface where it improves DX. But Plate is not a dumping ground
for bugs that reproduce in plain Plite. If the same issue happens in plain
Plite without Plate-specific code, it belongs there.

When Plate API names or runtime habits conflict with Plite, Plite wins.
Break Plate instead of bending Plite or hiding the conflict behind aliases.
If a Plate public API collides with Plite runtime names such as `api`,
`read`, `update`, `state`, or `tx`, cut or rename the Plate API.

## Security

Security in Plate is about explicit trust boundaries and sane defaults. Plate
is a framework, not a hosted service.

Keep risky paths obvious and operator-controlled:

- HTML and markdown parsing;
- import/export boundaries;
- uploads and embedded content;
- server/client boundaries;
- untrusted content and app-specific integrations.

Use safe defaults where possible. Do not add convenience abstractions that hide
where trust decisions are actually made.

## AI

AI support stays optional, composable, and plugin-first. Core editor APIs
should not contort around provider churn or hype-cycle abstractions.

## Setup

Plate is code-first by design. Users should see plugin definitions, editor
schema, serialization boundaries, and component ownership up front.

Improve onboarding through templates, docs, CLI, and registry flows. Do not add
convenience wrappers that hide critical editor decisions from users.

## What We Will Not Merge For Now

- Refactor-only PRs with no concrete user, API, or docs value.
- Fixes for bugs that reproduce in plain Plite without Plate-specific code.
- Public PRs that change user-visible behavior without real behavior proof.
- Issues or PRs that are too incomplete for a local maintainer Codex run to
  reproduce, route, or review from public context.
- Core UI/components that are app-specific, one-off, or design-opinionated
  without broad reuse.
- Optional plugins/features that can live as separate packages or app-local
  code.
- Convenience abstractions that hide editor ownership, schema design, or trust
  boundaries.
- Large framework detours that dilute the Plate-on-Plite model.
- Heavy AI-specific orchestration in core when the existing plugin/package
  surface is enough.
- Full-doc translation sets beyond English and Chinese for now.

Strong user demand and strong technical rationale can change this list.
