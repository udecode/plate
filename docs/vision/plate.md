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
  expose only guaranteed Core capabilities. React context retrieval is
  non-generic: `useEditor()` and `useActiveEditor()` return the mounted Plate
  contract, while selector hooks infer only their selected result. Exact
  feature capabilities come from descriptor portals. Keep an editor generic
  only when typed constructor/options input or an explicit editor argument
  correlates it with the result. Do not pass an application definition, plugin
  kit, or generated contract to `useEditor()` or `useActiveEditor()` as a type
  assertion. Optional generated types belong at explicit static boundaries;
  runtime construction owns capability inference and verification. Plite's
  runtime type is `Editor`; Plate owns `BaseEditor` and `PlateEditor`.
- Raw `PluginReference` carries nominal identity only; it has no definition
  generic or private witness. Concrete Base and Plate descriptors own the
  single invariant definition witness. Plite's root
  `EditorExtensionDependencyReference` is shallow and non-generic, exposing
  only `name` and optional `enabled`.
- Descriptor-aware schema builders serialize the normalized plugin name while
  retaining the nominal descriptor in private metadata. Plate validates that
  private family against the installed owner before applying editor policy;
  equal names never make different descriptor families interchangeable.
- Export each plugin as one inferred constructor/extension chain. A later stage
  may derive its private node shape from the prior `plugin` context, but public
  AST and operation-option aliases derive only from the final descriptor.
  Never widen exact node-operation generics or publish compiler-ferry types to
  make declaration emit succeed.
- TS7056 never changes the plugin API target: export one direct inferred
  descriptor. Do not add declaration-stage markers, private definition
  carriers, annotated staging aliases, widened dependencies, casts, or public
  subset types to contain the failure. Repair the owning generic or declaration
  boundary. Existing marked stages are transitional debt, block current-doctrine
  attestation, and remain only until a direct declaration build proves their
  deletion.
- Property-only plugins remain separate from element identity. Derive their
  element/text capabilities with `ElementWith` / `TextWith`, including authored
  aliases, prefixes, defaults, and exact value domains. Recursive algorithms
  never duplicate those fields in a private AST mirror: known owners use
  descriptor-derived shapes, while malformed or open-world input stays broad
  and narrows consumed properties at runtime.
- Context-bound factories keep exact installed-plugin editor capabilities in
  their author callbacks and project public factories/results to portable
  contracts. Internal editor graphs never leak through package declarations;
  Core owns that return-boundary repair.
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
  descriptor-local node shapes while keeping editor-wide `Value` broad. The
  ordinary application module exports one human-named readonly plugin kit and,
  when needed, one human-named schema; `usePlateEditor` or `createPlateEditor`
  maps them to its `plugins` and `schema` options. `plate generate` discovers
  the unique exported plugin tuple and optional application schema by validated
  runtime shape, never fixed identifiers. It may emit committed exact `Editor`,
  `Value`, schema, mutation, and fingerprint artifacts. It never emits the
  runtime plugin owner or becomes the ordinary docs path. Do not make ordinary `editor.api`,
  `editor.read`, or `editor.update` access recursively evaluate the complete
  application grammar, and do not introduce size heuristics or depth-limited
  precision.
- Plugin-bound React and static component APIs infer the owner's exact local
  schema node from its descriptor: `useElement(FooPlugin)`,
  `PlateElementProps<typeof FooPlugin>`, and
  `PliteElementProps<typeof BaseFooPlugin>` for elements, plus
  `PlateLeafProps<typeof FooPlugin>`, `PlateTextProps<typeof FooPlugin>`, and
  their static `Plite*` equivalents for text renderers. They never infer from
  the owner's dependency graph. Do not import a derived `FooElement` or
  `FooText` only to pass it back as a generic. These component prop aliases
  require one descriptor generic and expose no default, raw node input, or
  second context generic. Presentation-only families may use unions of
  descriptor-owned props; components that forward full plugin context keep one
  exact owner. Generic
  renderer infrastructure uses the node-level `Render*Props`, inferred wrapper
  callbacks, or named wrapper prop contracts instead. One type parameter never
  switches between plugin ownership and raw node shape.
  The rendered leaf combines schema text with optional transient fields
  inferred from the owning plugin's `decorate` callback; the source `text`
  remains schema-only. Known decoration fields never require `Reflect.get`, a
  cast, or a duplicated leaf shape.
  Wrapper and selector consumers pass the owning descriptor directly:
  `RenderNodeWrapper<typeof FooPlugin>`,
  `RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and
  `useElementSelector(FooPlugin, selector)`. They infer the local schema node
  and plugin context without a manual `DefinitionOf` extraction or node cast.
  A consumer plugin that installs the component uses the stable imported owner
  descriptor for component props, avoiding a self-referential configured
  descriptor; consumer-local capabilities remain available through scoped
  hooks.
- Element component and node-wrapper props carry stable node identity but never
  a live `path`. Resolve position from the element at interaction time, or call
  `usePath()` only when rendered output must react as that element moves.
- Feature state uses Plite `NodeKey` values for live node identity and names
  those fields `key` or `keys`, never `id`. Optional durable element identity
  belongs to `ElementIdPlugin` under the canonical schema property `id`.
  Persisted associations use `ref` or `refs`; definitions and references may
  share one `ref`, while separate occurrences keep distinct element IDs.
  External names such as MDAST `identifier` stay inside codecs, and semantic
  addresses such as `url` keep their domain name.
  Exact generated nodes read `element.id`; generic package boundaries use the
  installed plugin portal. Runtime keys never leak into persisted content.
  One-request protocols expose small refs mapped to local `NodeKey` values;
  they install persisted IDs only when references must survive reload,
  storage, editor destruction, or another client.
  Convert a live key at that boundary with
  `editor.plugin(ElementIdPlugin).read.id(key)`; do not retrieve the node first.
  Live navigation and TOC state use keys, while one-shot formats such as DOCX
  derive export-local references. Serialized Markdown block identity uses the
  optional plugin. Registries install it explicitly as product policy, never
  transitively through an unrelated feature.
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
- Generic node traversal uses an independent structural `type` selector and a
  function-only `match` condition. Plate descriptors resolve through the final
  application schema; Plite accepts persisted strings and schema handles.
  Selectors and type guards infer results. Callers never choose a result type
  with a generic argument.
- Plugin-local property writes stay on one `tx.nodes.set({ ...props }, options)`
  object-patch law. Owned property names and values infer from the shallow
  plugin and required-dependency graph; duplicate persisted names infer their
  value union. Aliases use their authored persisted key, and `unset` accepts a
  typed key or exact handle. Dynamic string-keyed patches defer to runtime
  schema validation. Prefix families and cross-node behavior use semantic owner
  operations. Plate adds no scalar set overload or second mutation portal.
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
- Persisted document lineage lives in an app-owned `{ document, schema }`
  envelope. A named app schema owns one ascending target-version migration
  chain and the expected generated fingerprint for every supported historical
  envelope version. `migrateDocument` runs it for runtime or offline callers
  before installed-plugin preparation and schema fitting; missing versions and
  identity drift fail closed. Only an explicit unversioned floor may omit
  historical fingerprint proof.
- `prepareDocument` is an installed-plugin invariant hook for current-schema
  documents. It is not a release migration, normalizer, source-version
  selector, or replacement for an application migration chain. History and
  Yjs room cutovers remain app-owned persistence policy.
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
- A Plate-owned custom MDX element tag is persisted schema identity. Its codec
  uses the resolved schema type symmetrically for source matching, decoded
  element identity, and encoded tag name. External MDAST, HTML, and MDX syntax
  remains literal. Legacy tags migrate before codec dispatch; codecs never
  accept both identities.
- Plate documents stay editor-native: `Text` leaves use `text`, elements use
  `type` and `children`, and feature properties stay flat and schema-owned.
  Parameter values never become fake plugin identities. First-party fields use
  semantic names such as `heading.level`, `codeBlock.language`,
  `table.columnWidths`, `listType`, and persisted association `ref`. Derived display state, upload
  workflow state, and format-specific names do not enter canonical JSON.
  Inactive author intent is not derived state: when a legal later edit can make
  stored intent observable, preserve that intent instead of snapshotting only
  its current effect during migration.
  UNIST and MDAST are adapter targets, not the live Plate AST.
- Structural Plate nodes synthesized by a format runtime, including wrappers
  and unknown-node fallbacks, resolve the installed application schema type.
  Literal types remain only on the external format tree or when the Plate
  plugin is genuinely absent.
- Operation decode overrides dispatch by invariant plugin capability name after
  codec-owner resolution. Encode overrides dispatch by persisted schema
  identity because their input is already a Plate node.
- A compiled codec claim never falls through to a persisted-tag decode override
  alias. Configurable custom MDX identity stays on its schema-owning plugin,
  not a foreign codec contributor.
- State that selects a plugin capability stores its descriptor or normalized
  name. It never stores a configurable persisted type or key. Resolve schema
  identity at the AST read/write boundary, including transient-node factories.
- Generated schema contracts are content-addressed semantic output. Readers
  recompute their authoritative fingerprint, and restoration rejects derived
  tables that differ from current source contributions.
- Decode-only and encode-only codecs still prove every identity leg they own.
  Phrasing-only wrappers decode external phrasing children directly instead of
  unwrapping an arbitrary decoded Plate element.
- Fixed external source/name literals exempt only the external leg. Decoded
  Plate identity still resolves from the target schema, and parsed properties
  precede structural children/type.
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
- Plate compiles `api`, `read`, and `update` capability trees once per plugin
  configuration with plain-record recursion and source-order replacement.
  Descriptor merging never owns runtime capability values.
- Every element plugin gets descriptor-bound `insert`, `set`, and `remove` on
  `editor.plugin(Plugin).update`. Default-constructible, schema-compatible text
  blocks also get `toggle`; text blocks with required construction properties
  and structural plugins author `toggle` only for real domain, wrap,
  conversion, or child semantics. An opt-in generated `Editor` type may
  additionally expose eligible methods under the capability name on root and
  transaction updates. Raw
  tuples keep authored root/transaction methods exact without materializing a
  schema-wide generic mutation map. These methods target the descriptor's
  persisted `type`; callers do not restate identity or `match`. Generic
  text-block toggle never exposes structural `wrap`, but may accept one-shot
  update policy such as `collapse`. Use the transaction primitive only while
  composing inside an existing transaction. An authored same-name method
  replaces the synthesized default only when it adds real semantics.
  Delete noun aliases such as `insertTable`; keep distinct verbs such as
  `insertColumn` and `merge`.
- Application schema overrides are a compiler boundary. Ordinary runtime
  tuples do not expose descriptor-generic mutations whose eligibility depends
  on the final grammar; opt-in generated types may own that exact surface.
- Custom element insertion is `insert(input?, nodeOptions?)`: domain data
  first, generic placement and selection second. Do not merge `at`, `select`,
  or other node options into feature input, and do not export compiler-ferry
  `Insert*Options` types. Schema-default CRUD uses the synthesized insert.
- The scoped portal accepts root transaction policy without changing its
  inferred methods: `editor.plugin(Plugin).update(policy).method()`. It opens
  exactly one root transaction and preserves rollback and history tags. Code
  already inside a plugin transaction composes through
  `tx.plugin(Plugin).method()`. Generated closed editors may also use the direct
  `tx.pluginName.method()` group. Computed `tx[plugin.name]`,
  `tx.extension(...)`, and nested portal one-shot updates are rejected.
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
  descriptor fields. Disabled plugins count as absent. Exact element and
  primary-mark portals expose `schema.type` and `schema.key`; behavior and
  aggregate-property portals omit `schema`. Name-only portals keep both schema
  getters non-optional for package-decoupled callers, but missing or wrong-kind
  access throws. Never add optional chaining, non-null assertions, or a raw
  identity fallback. Do not infer plugin
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
  plugin name is needed. Name every
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
  `tx.plugin(Plugin)` or a generated direct `tx.pluginName` group, never
  computed `tx[plugin.name]`, `tx.extension(...)`, or a portal one-shot that
  opens another transaction. Do not publish a private implementation fragment merely to
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
  not serialize installed graphs. A remaining TS7056 failure belongs to the
  owning generic or declaration boundary; it never earns a new package-local
  staging API. Existing exact stages may keep a broken build green while that
  owner repair is active, but they are tracked debt rather than accepted
  architecture and must be deleted before current-doctrine attestation.
- `plate-ui` is the sole Plate-specific React/component doctrine owner. Start
  with one direct `<Family>.tsx` component family containing subcomponents,
  variants, render helpers, local state, and simple local hook calls. Add at
  most one `use<Family>.ts[x]` semantic controller when multiple family members
  or surfaces share real lifecycle. Complex siblings may consume one private
  family context. Do not create state-hook/prop-hook pipelines, one custom hook
  per subcomponent, public prop-bag hooks, speculative providers/stores, small
  component factories/HOCs, React 18 branches, or `forwardRef`. A separate
  state owner needs independent lifecycle or cross-family reuse.
- A package may publish a headless React primitive when reusable DOM behavior
  and accessibility are the contract. The package owns interaction mechanics;
  copied registry UI owns styles, labels, editor persistence, and product
  composition. Internal providers, stores, and prop hooks stay private.
- When one hook mixes durable DOM lifecycle with renderer composition, split
  it. Keep only the subscription, imperative DOM projection, and cleanup in the
  package; a side-effect-only adapter takes its required lifecycle input and
  returns `void`. The copied renderer derives layout/presentation state and
  owns transient overrides, trivial calculations, and event handlers. A pure
  helper with one component-family owner is still local, not public API.
- Measure React ownership at terminal product consumers, not at package-wrapper
  imports. A hook, store, provider, hotkey controller, or plugin extension used
  only by copied registry UI is registry-owned when its job is UI or product
  composition. Package publication requires independent terminal consumers or
  a durable headless semantic, DOM, or accessibility contract. Siblings inside
  one component family are one owner, not reuse.
- Keep feature-package React roots flat by default. A nested component/hook
  directory earns its keep only as a real public subsystem with multiple
  cross-family owners, not as taxonomy or a response to file size.
- Treat each registry item as a source-distribution owner. Colocate integration
  behavior with the component or kit it modifies, even when that requires an
  explicit optional package or registry dependency. Never create a shared
  integration grab bag for dependency-graph aesthetics; extract only a coherent
  capability, durable behavior owner, or real runtime-cycle boundary.
- Copied Plate registry source installs into one flat `components/editor`
  namespace; `components/ui` remains the selected shadcn primitive layer.
  Feature files and item ids use the feature name, while app-owned plugin-array
  exports use `FooKit`, including one-descriptor features. Keep presentation
  (`editor.tsx`), static presentation (`editor-static.tsx`), live composition
  (`plugins.ts`), and static composition (`plugins-static.ts`) separate because
  their client/server and dependency cycles are real. Primitive-library
  variants resolve at install time, expose one editor-facing contract, and
  write to one target; never ship runtime base switching or variant-only shared
  helpers.
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
| local Plate/Plite behavior-bug or regression repair  | `patch`                                 |
| internal Plate/Plite long quality loops              | `auto`                                  |
| performance measurement, diagnosis, and fix/rerun    | `benchmark`                             |
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
| Plate Next migration/adoption audit                  | `plate-next`                            |

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

The ordinary path is runtime-first: export one app-owned plugin kit and optional
schema, then map them directly to the `plugins` and `schema` editor options.
That schema owns its `id` and `version`; do not duplicate lineage in
`schemaIdentity` or a generator-only definition. The CLI/schema generator is
optional advanced tooling for exact static contracts and artifacts. It
discovers the unique exported plugin tuple and optional schema by validated
runtime shape rather than fixed export names; it is not required editor setup
or first-class public teaching. Improve onboarding through templates, docs,
and registry flows without hiding critical editor decisions.

A copied default editor kit owns plugin composition, not the registry author's
persisted document lineage. Do not ship a fixed schema ID, migration chain, or
historical fingerprints beside reusable `EditorKit` source. The real host
persistence owner chooses its stable identity and migrations; a dedicated
migration example may teach the complete advanced path. Generated contracts
derive current schema types without turning that derived schema into persisted
application identity.

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
