# Review Law

## Review Mode: Best Plate V2, Main As Evidence

When the user asks for a review, suggestion, "best", "why is this here?", or a
named-file Plate Next pass, default to review mode.

Review mode is the interactive lane where the user points at one file/API at a
time and expects the best Plate v2 migration recommendation. The target is not
legacy Plate compatibility. The target is a clean Plate product layer on top of
Plite.

Use `origin/main` as evidence, not as the final API target:

- preserve user-visible behavior unless a breaking change is explicitly part of
  the accepted Plate v2 direction;
- preserve old ownership when it still describes the product concern;
- recover accidentally extracted code when the split is just migration noise;
- do not keep old API shapes, compatibility aliases, shims, wrappers, or
  `with*` glue just because `origin/main` had them.

Rules:

- For one-by-one review, give the best migration call first: `cut`, `move to
Plite`, `keep in Plate`, `private bridge with deletion gate`, or `blocker`.
- No legacy backwards compatibility by default. If the clean path requires
  breaking old Plate API, say so and recommend the break.
- No hacks. Do not route displaced product/plugin behavior into bridge files,
  helper dumps, `any` casts, duplicate Plate wrappers around Plite APIs, or
  fake aliases.
- Root editor object pollution is a Plite anti-pattern. Do not add arbitrary
  fields to the editor root such as `editor.propsChanges`, `editor.fooState`,
  `editor.somePluginCache`, or direct assignment bags that are not part of the
  explicit Plite/Plate editor contract. A clean migration puts:
  - reads/services on `editor.api.<owner>` or scoped
    `editor.plugin(FooPlugin).api`;
  - mutations/commands on `editor.update.<owner>` or scoped plugin tx groups;
  - persistent substrate state in Plite state fields;
  - product/plugin runtime values in `initialState` and the scoped store;
  - React/UI render state in the owning store/hook/provider;
  - internal operation/session state in a returned session/controller object
    when the lifecycle is local to one algorithm;
  - private ephemeral implementation detail in a module-local `WeakMap`
    keyed by editor when it must be associated with the editor across calls,
    not on the public editor object.
    Extending the root editor object is allowed only for core-owned contract
    fields that are already part of the typed `BaseEditor` / `PlateEditor`
    surface. Anything else caps the file below `100` until moved to the right
    owner or explicitly routed as a Plite/Plate API plan.
    If a concrete root-pollution field is in the active package/file scope, do
    not merely score or mention it. Fix it in the owner before closeout, or stop
    with a named Plite/Plate gap and deletion path.
- On a concrete inferred editor, `editor.api.<name>` is the canonical
  discovery path. Keep `editor.plugin(FooPlugin).api` for generic package code
  and exact Plate ownership; use `editor.extension(FooExtension).api` for exact
  raw Plite ownership. All paths expose the same descriptor-owned API
  contributed once at root `api` and projected under `name`. Reject root-merged
  methods, `getApi`, and `pluginApi`.
- The root `api` field is factory-only at Plite, Base, and Plate layers,
  including context-free APIs: write `api: () => ({ ... })`, never
  `api: { ... }`. The factory receives one context object; Base and Plate add
  their authoring fields to that same object. Reject positional
  `(editor, context)` factories and `.configure({ api })`.
- When a generic caller legitimately accepts an optional descriptor, use
  `const foo = editor.plugin(FooPlugin)` and check `foo.installed` before any
  other portal access. Disabled plugins count as absent. Do not cast or probe
  root `editor.api`, inspect node/schema/cache internals, or catch missing
  portal errors. Registry code must not import an app-specific editor type just
  to discover plugin APIs.
- Scoped plugin portals already own their noun, so redundant owner repetition
  and taxonomy-only nesting are API smells. Use `best-api review` to choose the
  concrete verbs and grouping from real call sites; this migration skill does
  not freeze one feature's spelling as universal law. Hard-cut rejected names
  instead of keeping aliases.
- Do not add local structural type guards around Plite-owned editor APIs. A
  helper like `type DOMResolver` / `hasDOMResolver` for
  `editor.api.dom.resolveDOMNode` is a failed migration: either call the typed
  Plite API directly or fix the owning Plite/Plate API type.
- Never type inferred types in tests or examples. If `origin/main` relied on
  inline callback inference, keep that shape. Do not add local helper aliases
  like `PreInsertOptions`, explicit callback parameter annotations, or
  `Parameters<typeof fn>` plumbing just to silence TypeScript. Fix the owning
  API/source typing so the call site stays inferred.
- Never annotate local variables whose initializer should infer the type. A
  line like `const selectedEntries: NodeEntry<Element>[] =
editor.plugin(...).api.blockSelection.getNodes(...)` is a regression: it
  hides whether the owner API infers correctly. Remove the annotation and fix
  the source API if inference is weak. Keep annotations only for genuinely
  uninferrable locals such as empty arrays, deliberate narrowing/widening,
  exported/public signatures, or external boundary callbacks.
- Do not declare plugin export types or cast plugin chains to hide inference
  loss. A plugin export should infer from `defineBasePlugin(...)`,
  `definePlatePlugin(...)`, `toPlatePlugin(...)`, and chained `.extend()`
  calls. Smells like
  `export const FooPlugin: BasePlugin<FooConfig> = ...`,
  `export const FooPlugin: PlatePlugin<FooConfig> = ...`, or
  `...) as BasePlugin<FooConfig>` are type regressions unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner
  instead of typing the result.
- Do not route one exported plugin builder chain through a private one-use
  descriptor such as `FooPluginDefinition`, `FooPluginBase`, or
  `FooPluginDescriptor`. Export the complete
  `defineBasePlugin(...)` / `definePlatePlugin(...)` / `toPlatePlugin(...)`
  chain directly, preserving every capability stage that has a real typed
  dependency. Type references and chain staging do not justify another
  constant. Keep a private descriptor only when it is itself installed or
  returned as a durable plugin handle, reused by multiple production
  owners, or required at a real external boundary.
- Audit this by declaration references, never by suffix. Inspect every
  production top-level descriptor created by `defineBasePlugin`,
  `definePlatePlugin`, or `toPlatePlugin`, plus every private result of
  `.extend()` or `.configure()`, regardless of whether it is named `base`,
  `schema`, `definition`, or something arbitrary. A descriptor used only by
  one exported chain and by `typeof`, `ElementOf`, or `DefinitionOf` queries is
  still one-use. Keep the chain direct and derive public types afterward. If
  a later capability needs the node shape inferred by an earlier schema stage,
  keep an honest `.extend(({ plugin }) => ...)` stage and derive its local node
  type with `ElementOf<typeof plugin>` or `TextOf<typeof plugin>`. Keep any
  generic operation-options helper private, preserve its exact node argument,
  and export the public node/options aliases only after the final descriptor.
  Never widen `NodeInsertNodesOptions<SpecificNode>` to `Element`, `Node`, or an
  omitted generic to make the chain compile. If package algorithms need only
  schema-contributed properties, derive them with `ElementWith` / `TextWith`.
  If they intentionally accept malformed or open-world input, keep `Element` /
  `Text` and narrow each consumed property at runtime. Never introduce a private
  structural AST mirror to break recursion; repair the generic or declaration
  boundary instead. Derive every public AST alias from the final descriptor.
  A reusable plugin factory constrained to
  a required element or mark schema must receive a required flat `schema.type`
  or `schema.key`; if Core makes that handle optional, repair
  `PluginAuthorSchemaView` instead of asserting, guarding, or duplicating the
  identity locally.
- Context-bound factories may use the exact installed-plugin editor only while
  authoring their callback. Their public factory and emitted value types must
  project to the smallest portable public contract. If declaration emit leaks
  `InternalBaseEditorWithInstalledPlugins`, repair the Core factory return
  boundary; do not annotate package exports with `BaseEditor<typeof Plugin>`,
  rebuild callback option types, cast the result, or export an internal editor
  carrier.
- Treat TS7056 as an owning generic or declaration-boundary defect. The only
  accepted package target is one direct inferred export. Never add another
  `@plate-plugin-declaration-stage`, private definition carrier, annotated
  staging alias, widened dependency, cast, or public subset type. Existing
  marked stages are transitional debt: report their exact count, preserve the
  direct-build deletion gate, route the owner repair, and keep the package
  stale until direct declaration emit passes without them.
- Do not create `PluginConfig` aliases or pass a parallel config generic to a
  factory. Let `defineBasePlugin` infer its exact definition from the author
  object. Keep explicit state, API, update, or domain types only for real
  exported/reused contracts; they do not wrap the whole plugin.
- `DefinitionOf<typeof FooPlugin>` is the sole public descriptor-definition
  extractor. Export it as `FooDefinition`, never `FooConfig` or an unsuffixed
  alias. Preserve real domain/runtime `*Config` types, but hard-cut
  `InferConfig` and every competing extractor.
- Plite, Base, and Plate use the sole public factory grammar
  `define*(name, definition)`, with no caller-supplied generics. Internally,
  TypeScript may require a small inferred
  environment parameter—Plite dependencies, or Plate dependencies plus
  initial state—beside the author-input parameter to preserve contextual
  callback inference. That is valid internal machinery; do not fake a
  one-self-referential-generic claim, expose the environment, or compensate
  with caller generics, annotations, casts, or `any`. Reject excess fields and
  normalize one exact definition carried by a private invariant witness.
  Reject public `__config`, raw callback/dependency graphs in declarations, or
  another accumulator machine.
- The positional name is required, lower camel case, and human-readable. Keep
  a different serialized node identity in `type`; never encode storage syntax
  in the descriptor name.
- Public package roots expose author-facing contracts only. Keep `Any*`,
  `Internal*`, normalized/compiler types, accumulators, witnesses, and raw
  callback graphs private or under an explicit internal entrypoint. An
  unparameterized editor exposes guaranteed Core capabilities only; package
  consumers carry their concrete editor or descriptor generic instead of
  manufacturing installed groups with `any`. Plite's public runtime type is
  `Editor`; Plate keeps `BaseEditor` and `PlateEditor`.
- Audit every public generic for a typed source. Installed descriptors own
  update capabilities and validated external data; command descriptors own
  command inputs; typed schema handles own property values. Hard-cut caller
  generics that can forge a transaction group or choose a read result. Raw
  property strings and unvalidated remote metadata remain `unknown` until a
  runtime owner narrows them.
- Raw `PluginReference` is nominal and carries only plugin identity; it has no
  definition generic or private witness. Concrete Base and Plate descriptors
  carry the single invariant definition witness. Plite's root
  `EditorExtensionDependencyReference` is shallow and non-generic: only
  `name` and optional `enabled`, with no capability, provider, witness, or
  recursive exact ancestry.
- `EditorExtensionTypeProvider` is the sole public value-sensitive capability
  bridge. Keep its higher-kinded encoding, normalized installed-capability
  carrier, and transitive dependency expansion exclusively in
  `@platejs/plite/internal`; never root-export or teach those internals, and
  never recursively materialize the complete dependency ancestry.
  A static portal must prove literal-name uniqueness plus mutual capability
  assignability. Runtime portal access must still prove exact descriptor
  identity rather than accepting a same-name surrogate. Keep
  `EditorExtension<Definition>` to one public definition parameter, and derive
  official factory return types instead of reconstructing them with another
  public generic.
- Core may use internal aliases to translate the contextually typed author
  source into the canonical lowered Plite definition. Do not export, document,
  or make users name that compiler split: public authoring remains one object
  call returning one exact descriptor.
- The low-level React bridge is exactly `react({ dom })`: one required object
  containing the exact DOM descriptor. Permit one explicit erased
  implementation boundary only where TypeScript 7 cannot reduce the invariant
  DOM-extension union. Reject zero-argument `react()`, flattened DOM options,
  overload forests, caller generics, and additional casts.
- `name` is capability identity. Element `type` and property `key` are separate
  persisted schema identities, default to `name` only when omitted, and are
  immutable after plugin creation. Exact portals expose only the identity their
  schema owns; behavior plugins expose neither. The flat `PLUGINS` map contains
  capability names only. Runtime AST work resolves `.type`/`.key`; copied
  registry values and fixtures use explicit persisted literals. Never restore
  `KEYS`, `NODES`, `STYLE_KEYS`, configurable schema identities, or grouped
  heading aliases. Every
  descriptor-aware input is named `plugin` and accepts
  the exact descriptor or `string`; a normalized internal identity is `name`.
  `type` means the structural field on a persisted element and the resolved
  identity exposed by an element owner; `key` is the resolved property
  identity. Never use `plugin.name` as either.
- State that selects a capability stores the descriptor or normalized `name`,
  never its persisted `type` or `key`. Resolve schema identity only at the AST
  read/write boundary. Transient-node factories resolve the installed schema
  identity when invoked so application overrides cannot leave stale literals
  captured in plugin state.
- Plate exposes native Plite fields directly at the plugin root: dependencies,
  conflicts, `readMiddleware`, commands, corrections, declarations,
  contributions, `on`, activation, and config-free `validate`. Reject a nested
  `extension` wrapper.
- Clipboard ingress is a typed Plite DOM contribution, never a root
  `clipboard` plugin field. Put `clipboardHandler(...)` directly in
  `contributions`. `clipboardHandler(handler)` is the sole form; the owning
  extension or Plate stage contextually infers the handler transaction from
  its installed update capabilities. Never pass an editor to the helper.
- All lifecycle and host/DOM events use one root `on` family with prefixless
  child names such as `commit`, `keyDown`, `paste`, `nodeChange`,
  `textChange`, and capture variants. Reject a second `handlers` bucket while
  preserving any private runtime bridge required by Plate short-circuit versus
  Plite run-all semantics.
- Plite owner-local capability factories are `read` and `update`; pure
  core-read policy is `readMiddleware`. Reject descriptor `state`/`tx`
  authoring and the old middleware-overloaded `read`.
- `.extend()` widens the exact definition; `.configure()` is terminal and
  non-widening; `toPlatePlugin()` is the exact Base-to-React adapter. Factories
  replace cloning, so hard-cut `clone()` and any third copy verb.
- Install extensions with `editor.install(...)` and create DOM/React views with
  `createEditorView(editor, options)`. Reject an editor runtime wrapper and
  `editor.extend(...)`. Root standalone utilities are limited to genuinely
  editor-independent value operations such as `NodeApi`, `PathApi`, and
  `isEditor`; editor behavior belongs on `read`, `update`, or an extension.
- Descriptor-aware schema queries are identity operations only. Read document
  properties through typed property handles or semantic plugin APIs; reject
  the arbitrary one-property-descriptor shortcut.
- Audit plugin updates toward one object-patch law:
  `tx.nodes.set({ property: value }, options)`. Owned keys and values infer from
  the shallow plugin plus required-dependency graph; duplicate persisted keys
  infer their value union. Aliases use their authored persisted key in the
  object patch. `tx.nodes.unset` accepts a typed key or exact handle. Dynamic
  string-keyed patches are the runtime-schema escape hatch; prefix families and
  cross-node behavior use semantic owner operations. Reject scalar
  `set(key, value)`, `tx.properties`, and any second mutation namespace.
  `tx.plugin(Plugin)` selects an installed plugin's flat transaction group.
- Use `plate-plugin-creator`'s Capability Boundary Protocol as the sole
  plugin-authoring owner. Plate Next audits each contribution into exactly one
  row:
  - `initialState`: descriptor defaults for mutable editor-local state;
  - `store`: live editor-local state access and subscriptions;
  - `selectors`: pure store-state projections;
  - `api`: plugin services not bound to a supplied document snapshot or active
    transaction;
  - `read`: pure, replayable queries over supplied document state;
  - `update`: document mutation through the active transaction;
  - flat native Plite fields: genuine editor-wide substrate;
  - `codecs`: format declarations.
  - `prepareDocument`: deterministic installed-plugin current-schema
    preparation after the application migration chain and before schema fit.
    Reject document reads hidden in `api`, document mutations outside `update`,
    impure selectors/reads, plugin-scoped behavior smuggled into native fields,
    and any contribution with no honest row.
- Reject feature migration plugins, legacy-shape normalizers, and
  `prepareDocument` release migrations. Persisted source lineage belongs to an
  app envelope; one named app schema owns exact historical source fingerprints,
  ascending target-version steps, and the shared `migrateDocument` runtime/CLI
  runner. Raw input requires an explicit unversioned floor.
- Enforce the creator's state mechanics without restating another model:
  every state-owning production descriptor has a named `*PluginState`, exported
  with an exported descriptor; owner defaults use a typed constant or explicit
  factory return type, never inferred object shape, `as`, or `satisfies`;
  descriptor overrides stay inline and partial in
  `.configure({ initialState })`; callbacks use inferred `store`; consumers use
  `editor.plugin(Plugin).store`; and React uses `usePluginStore` or
  `useEditorPluginStore`. Reject deleted option accessors and parallel top-level
  `options` / immutable `config` channels. Plite extensions have no `config`;
  immutable construction inputs and runtime resources stay in their factory
  closure or honest host owner. Operation parameters may still be named
  `options`.
- Audit current-owner context access before accepting plugin code. In any
  callback whose supplied context includes them, use `store`, `api`, `read`,
  `update`, `schema`, `plugin`, and `installed` directly. Reject
  `editor.plugin(currentPlugin).*`, current-name root API/read/update calls,
  standalone plugin lookup helpers, and current-plugin schema lookups in that
  callback. Keep `editor` for editor-wide substrate, cross-plugin access, or
  one-shot transaction metadata unavailable on scoped `update`; active
  transactions use `tx`. Specialized shortcut, input-rule, state-value, and
  render-prop callbacks may expose only `editor`, so keep an exact typed portal
  rather than moving or wrapping a coherent declaration just to capture a
  shortcut. Never confuse another descriptor such as `editor.api.dom` with the
  current plugin's `api`.
- Colocation is the default. Plugin behavior with exactly one production owner
  belongs inline in that plugin's `define*Plugin` / `.extend()` chain. This
  includes one-use `with*`, `decorate*`, normalize, parser, command,
  correction, option, API, and tx callbacks. Tests, barrels, and old public
  exports do not count as additional owners.
- Colocation decides source and file ownership, not public composition identity.
  When behavior may be independently substitutable, route the promotion decision
  to `best-api`; an accepted capability descriptor may remain colocated in the
  same plugin owner file. Do not force another file, and do not keep a real
  capability anonymous merely because it has one source owner.
- Within one owned plugin array, terminal configurations derived from the same
  authored plugin compose in source order; later defined values win and exact
  identity deduplicates. Unrelated plugins and divergent authoring branches
  sharing a name still conflict. Across independently optional app or registry
  kits, map who owns membership and prove each kit alone and in combination.
  Import access does not establish membership ownership. A kit must not install
  an independently optional peer merely to adapt it; route that public
  composition fork to `best-api`, whose weak-peer path preserves adapting-only,
  target-only, both, and explicit-target-configuration behavior.
- Registry examples are teaching and copied-install surfaces, not optimized
  app presets. Do not delete an explicit feature plugin, kit, renderer binding,
  or dependency merely because the inherited application plugin array already
  installs the same descriptor. When registry metadata names the feature kit or
  the example intentionally demonstrates its binding, preserve that declaration
  and use `plate-ui` as the registry owner. Append a terminal configuration of
  the same authored plugin after the inherited plugins; ordered composition
  preserves earlier fields and lets the explicit later values win. Filter only
  when the entries are unrelated, represent divergent authoring branches, or
  membership itself must change.
- There is no line-count ceiling. Do not split a coherent owner because the
  file is large, crosses a readability threshold, or looks tidier as a folder.
  One large owner is cheaper for humans and agents than a graph of one-use
  files. Extract only for multiple production consumers that cannot reuse the
  owning public API, a real cross-layer or standalone public owner, a durable
  React family boundary with an independent job, or dedicated proof tooling.
- Audit every React/component decision against `plate-ui`, the sole owner of
  Plate UI doctrine. The accepted family shape is one `<Family>.tsx` plus zero
  or one semantic `use<Family>.ts[x]` controller. Direct component behavior
  stays direct; complex siblings may consume one private family context.
- Cut state-hook/prop-hook pipelines, public prop-bag hooks used by one
  renderer, one custom hook per subcomponent, hooks defined in plugin
  descriptors, speculative public providers/stores, small component factories
  or HOCs, React 18 branches, and `forwardRef`.
- Audit public package hooks by terminal product consumer, following package
  wrappers, adapters, barrels, and reexports. Intermediate package imports,
  tests, and docs do not establish reuse. When every terminal consumer is
  copied registry UI and the behavior is UI/product composition, move the
  complete hook/store/provider/hotkey/plugin-extension owner into its registry
  family or kit. Keep package publication only for independent terminal owners
  or a durable headless subsystem contract.
- Do not keep a mixed renderer hook merely because one responsibility is a
  durable headless subsystem. Split the row: retain only subscription,
  observer, imperative DOM projection, and cleanup in a minimal package hook;
  require its lifecycle input and return `void` when it is side-effect-only.
  Localize layout/presentation derivation, transient overrides, rounding,
  refs/styles returned only as props, and event handlers in the copied family.
- Inventory every returned field and each terminal consumer destructure. Unused
  renderer-state fields, exported result types, optional fallback inputs, and
  callback props are hard-cut evidence, not reasons to preserve the bag.
- Purity does not establish a public owner. When deleting the hook leaves a
  trivial pure calculation used only by that copied family, keep it private in
  the family instead of replacing one bad export with another.
- Keep feature-package React roots flat. A nested directory or separate
  context/store earns its keep only through independent lifecycle, cross-family
  reuse, or a durable public subsystem—not taxonomy, file size, or exports.
- Prefer inline one-use constants, initial-state fragments, and inferred
  callback types. Do not create context/definition/native-field ferry types
  merely to move an inferred callback into another file. Keep explicit types
  when they are a real exported contract, recursive shape, external boundary,
  or reused API/update contract.
- Audit authoring stages against `plate-plugin-creator` instead of maintaining
  a second builder model. The constructor owns every independent contribution;
  `.extend()` survives only for imported/prebuilt adaptation, a shared factory
  unavailable to the constructor, or a real earlier-capability type
  dependency; `.configure()` is terminal and never widens. Context access alone
  is not an `.extend()` reason.
- Every surviving `.extend()` must name the earlier type it consumes or the
  external declaration it adapts. Keep the contribution inferred; when a real
  public contract needs an explicit generic, type the contribution object, not
  callback parameters or the plugin export. If that loses inference, fix Core.
- Apply the creator's codec, flat-native-field, and active-transaction laws
  directly. In particular, keep independent codecs and native fields in the
  constructor, keep private implementation fragments lexical, read staged API
  lazily from runtime callback context, and reuse earlier mutations through
  `tx.plugin(Plugin)`. Generated closed editors may use the direct
  `tx.pluginName` group. Never use computed `tx[plugin.name]`,
  `tx.extension(...)`, or a nested portal one-shot. Raw Plite keeps direct
  named transaction groups and exposes no descriptor portal.
- For a Plate-owned custom MDX element codec, bind `schema: { type }` in the
  codec factory and use that resolved type for `from`, the decoded element
  `type`, and the encoded MDX `name`. Fixed MDAST, HTML, and MDX syntax remains
  literal because it belongs to the external format. Migrate old persisted
  tags before normal codec handling; never keep dual codec aliases. Enforce
  this law for constructor-owned and staged codec contributions.
- One-operation Markdown decode overrides are keyed by invariant plugin
  capability name; encode overrides are keyed by persisted schema identity.
  Codec dispatch resolves the decode owner before consulting the override. A
  claimed source that returns `undefined` never falls through to a persisted-tag
  override alias.
- Keep custom MDX codecs on their schema-owning plugin. A foreign
  `defineCodecs(TargetPlugin, ...)` contribution cannot author configurable MDX
  identity; move it to the target. Staged enforcement reads schema bindings
  from the owning callback, not only the returned `codecs` property.
- Enforce every identity leg a codec actually declares. Decode-only custom MDX
  codecs still bind `from` and decoded `type`; encode-only codecs still bind
  the emitted MDX `name`.
- A fixed external `from` or encoded `name` exempts only that external-format
  leg. Every decoder that constructs a Plate element still uses the resolved
  target schema type.
- Spread parsed or conditional properties before `children` and resolved
  `type`. Format attributes never override Plate structural fields.
- A codec that accepts only phrasing content decodes the external paragraph's
  phrasing children directly. Never decode a Plate wrapper and unwrap an
  arbitrary resulting element: another codec may legitimately promote that
  source paragraph to a block.
- Public Markdown rule-name unions include every supported canonical rule key,
  including `audio`, `file`, and `video`; hard cuts rename keys without dropping
  their typed parser surface.
- Any Plate element synthesized during format conversion, including structural
  wrappers and unknown-node fallbacks, uses the installed application schema
  type. Literal node types belong only to the external MDAST/HTML tree or to a
  genuinely absent Plate plugin's authored default.
- Every portal read from a plugin factory must be installed by that plugin's
  declared dependency graph. Declare a required dependency at the lowest owner
  that needs it; optional peers require an `installed` guard.
- `component` is ordinary render publication data. Declare it in
  `defineBasePlugin()` or `definePlatePlugin()` so the descriptor renders in
  static/RSC and live Plate consumers; replace it through one terminal
  `.configure({ component })`. Base `.extend()` rejects it because independent
  defaults belong in the constructor. Use `toPlatePlugin()` at the owning React
  adapter to publish a reusable Plate-layer descriptor or add real Plate-only
  authoring. A terminal consumer never inserts conversion merely to set
  `component`. Static/base owners bind a server-safe component without
  importing a Plate React entrypoint. `.configure()` never widens.
  Hard-delete `.withComponent()` and do not author, document, or preserve
  direct public `render.node` assignment.
- Hard-delete `extendApi`, `extendEditorApi`, `extendSelectors`, `extendTx`,
  `extendTxGroup`, `extendExtension`, `extendCodecs`, and `extendHtmlCodec`.
  Do not keep aliases, shims, deprecations, forwarding wrappers, or old
  documentation. Classify the receiver first; same-named methods on Zustand
  stores or other non-plugin builders are not Plate plugin-builder drift.
- When colocation makes a helper obsolete, delete its file and barrel export.
  Do not preserve a helper export, forwarding wrapper, alias, or old filename
  for compatibility. Route a genuine public API fork through `best-api`, then
  `plate-plan` for adoption/proof when needed; compatibility is not the default
  answer.
- Never replace an old helper body with a wrapper like
  `editor.plugin(FooPlugin).editor.update((tx) => tx.foo.bar(...))`. If the
  helper owns a real cross-plugin or transaction-composition algorithm, keep it
  there and pass the active `tx`. Repeated callers of one plugin operation must
  call that plugin's scoped API or tx group; they do not justify a parallel raw
  helper. If it has one plugin owner, inline the algorithm and delete the
  helper.
- Deleting a package helper must not copy its transform, query, navigation
  controller, or cross-layer algorithm into app or registry JSX. Reuse the
  owning scoped capability when one exists; otherwise keep or publish a flat
  standalone package owner when the behavior crosses capability layers and
  cannot honestly fit one plugin `api`, `read`, or `update` boundary.
- Tests follow the same owner law as production and React code. Keep one
  colocated `<FooPlugin>.<family>.spec.tsx` for a plugin behavior family, even
  when that family exercises many API, update, query, transform, normalize, or
  parser methods. Do not mirror every public method, deleted helper, or old
  production filename into its own spec.
- A behavior family may have one `<FooPlugin>.<family>.slow.tsx` sibling only
  when `pnpm test:profile` / `pnpm test:slowest` proves an individual behavior
  is inherently blocking. A file's aggregate time is never a reason to split a
  coherent family. `.slow.spec.tsx` is invalid because it still matches the fast
  lane. Split by blocking behavior or a genuinely independent lifecycle/proof
  boundary, never by line count, method count, readability, fixture volume, or
  aggregate file timing.
- When production helpers are merged into their plugin owner, merge their old
  specs into the matching behavior-family spec in the same packet. A large
  coherent family spec is cheaper than method-level test confetti. Keep a
  separate spec only for an independently owned lifecycle contract, genuinely
  shared production owner, non-plugin product code, React component family or
  semantic controller, standalone utility, fixture bank, integration boundary,
  or dedicated proof tooling. React tests live beside that surviving owner; do
  not mirror private subcomponents or local hooks into separate test files.
- Prefer direct one-shot Plite methods over callback boilerplate. A single
  operation like `editor.update((tx) => { tx.normalize({ force: true }); })`
  should be `editor.update.normalize({ force: true })`. A single read like
  `editor.read((state) => state.children())` should be `editor.read.children()`.
  Use callback form only when grouping multiple reads/writes under one
  snapshot/transaction, sharing intermediate state, branching/looping, or
  calling behavior that has no direct one-shot API yet.
- Prefer Plite's live node targets and inferred structural selectors over
  migrated query boilerplate. If code already has a live descendant, pass it directly
  to an `at` option or another `NodeTarget` parameter. Resolve
  `editor.read.nodes.path(node)` only when a `Path` is the actual result. Never
  rediscover that node with `read.nodes.find` by matching its `type` and `id`.
  Plate package source must handle an unresolved path instead of asserting it.
- Do not mechanically replace `editor.read.nodes.path(node)` with `usePath()`.
  `usePath()` is a reactive element-context dependency. In a repeated node
  renderer, keep event-only path resolution inside the handler or command.
  Element component and node-wrapper props never expose `path`; keep
  `usePath()` only when a descendant must react to path changes. Every
  newly introduced `usePath()` in migrated code requires that classification.
- Use `type: FooPlugin` for Plate element selection and a persisted string or
  schema handle in raw Plite. Arrays select a union. `match` is function-only
  and adds computed schema policy, property checks, path-dependent logic, or a
  type guard. Never write `match: { type }`, `match: { id }`, or a caller result
  generic such as `nodes.find<FooElement>()`. Keep `at` independent from the
  selected result. Insert split-target selection belongs under
  `split: { type, match }`.
- Flat compatibility lookups are forbidden: migrate `editor.api.findPath(node)`
  to `editor.read.nodes.path(node)` and `editor.api.some(options)` to
  `editor.read.nodes.some(options)`. Do not re-add aliases, Plate wrappers, or
  implicit type/ID tree scans around those Plite reads.
- Boolean node-query law: do not call an entry-producing collection query such
  as `read.nodes.find`, `toArray`, or `entries` when the caller only
  needs to know whether the same query has a match. Use
  `editor.read.nodes.some(options)` and preserve `at`, `match`, root, mode, and
  void semantics. Do not apply this mechanically to `above`, `block`,
  `parent`, `previous`, or `next`: those express ancestor, current-block, or
  relative traversal that `nodes.some` does not necessarily preserve. Keep an
  entry-producing query whenever the caller consumes the node/path or its
  distinct traversal semantics.
- Treat explicit normalization as a semantic operation, not transaction
  punctuation. In Plite, bare `tx.normalize()` and
  `editor.update.normalize()` default to an explicit full-root pass
  (`force: true`). Plate feature code must not add either form merely to
  coalesce adjacent text leaves, preserve an old Slate fixture shape, or "make
  sure" a transform settled.
- Before keeping any explicit normalization call, name its owner and invariant:
  an intentional document/import repair, an initialization option that promises
  full normalization, or a package normalizer whose behavior must run over the
  complete root. Prefer normal transaction dirty-path normalization for local
  edits. Use `{ force: false }` only when the feature deliberately requests an
  explicit dirty-path pass and a focused test proves why the normal transaction
  lifecycle is insufficient.
- If an operation should always preserve a structural invariant, repair the
  smallest Plite transform/normalizer owner instead of adding feature-local
  `normalize` calls. If only the physical grouping of equivalent text leaves
  differs, remove the call and assert user-visible text, selection, node
  semantics, and the owning feature behavior rather than exact leaf
  coalescing.
- A test may call `editor.update.normalize({ force: true })` to explicitly
  exercise an installed normalizer against an intentionally invalid fixture.
  That is a test trigger, not production precedent. Every broad normalization
  correction must inventory all `tx.normalize(...)` and
  `editor.update.normalize(...)` matches in the active scope and classify each
  as `cut`, `semantic-dirty-path`, `semantic-full-root`,
  `explicit-normalizer-test`, `lifecycle-option`, or `Plite-owner-gap`.
- Plate feature-package source must treat unresolved public Plite reads as an
  optional outcome. Do not add `{ required: true }` or a non-null assertion
  merely to avoid handling `undefined`; target the live node when available,
  then return or no-op when resolution fails. Reserve `{ required: true }` for
  Plite internals where absence proves a runtime invariant is broken. Tests may
  use it to assert fixture setup, but production package code needs a concrete
  invariant-owner reason before asserting.
- Transform-backed callbacks must receive and use the active transaction. If a
  Plate/Core callback runs inside Plite transform middleware or another active
  transaction lane, its context should expose `tx` and mutations should go
  through that `tx`. Do not call `editor.update.*` from such callbacks. Inline
  single-owner behavior in the callback so `tx` stays lexically inferred.
- Do not extract plugin-owned behavior merely to create a function that accepts
  `tx`. A new `foo(editor, tx, ...)`, `fooWithTx(...)`, or paired one-shot/tx
  wrapper is a failed owner split when one plugin owns the behavior. Put the
  body inside the owning plugin tx group, command, correction, or middleware
  callback and capture `tx`, `api`, `store`, resolved state, editor, and type
  from that builder context.
- New scoped methods and surviving functions take domain inputs by default.
  Do not thread `editor`, `api`, `read`, `tx`, `store`, resolved plugin state
  values, or resolved plugin type through a helper graph. Operation options
  remain valid domain input. Keep one-use machinery lexical; if later plugin
  stages or dependents need an honest capability, publish it in an earlier
  builder stage.
- Before keeping a state/read-view parameter, try the active tx stage or
  callback owner. An explicit active-state boundary survives only when the same
  public query must observe an uncommitted transaction snapshot. Require
  focused proof and never fall back to stale `editor.read` merely to clean the
  signature.
- A separate transaction-accepting function is allowed only for a real
  cross-plugin or transaction-composition algorithm that the owning scoped tx
  group cannot express. Multiple call sites alone are not reuse evidence: the
  scoped plugin method is the reusable interface. Record the consumer and owner
  graph. The surviving parameter is required, never optional, and the helper
  must not open a nested `editor.update`. A helper accepting both `tx` and the
  plugin's resolved `type` is a failed boundary. Tests, barrels, and historical
  public exports do not establish reuse.
- `editor.update` callbacks must never call `editor.update.*` again. If a
  callback is already inside `editor.update(...)`,
  `editor.update.withoutNormalizing(...)`, transform middleware, or another
  active transaction lane, all editor mutations in that callback must use the
  active `tx`. `withoutNormalizing` callbacks should receive `({ tx })`, and
  nested calls like `editor.update.withoutNormalizing(() => {
editor.update.selection.set(...) })` are bugs, not style issues.
- Consecutive `editor.update.*` calls in one synchronous code path are a
  transaction smell. If multiple mutations are one logical action, use the
  existing `tx` from context. If no `tx` exists, prefer a single
  `editor.update((tx) => { ... })` group as the fallback and classify the
  missing context as a Plite/Plate gap when the code is transform-backed.
- Never subscribe a component to editor values only to feed a later callback.
  Hooks like `useNodePath`, `useEditorSelector`, `useEditorValue`,
  `useElementSelector`, `useEditorReadOnly`, or Plite view selectors are for
  render-time state. If the value is used only inside `onClick`, `onMouseDown`,
  `onKeyDown`, command callbacks, toolbar actions, or delayed handlers, read it
  inside the callback from `editor.read.*` / `editor.api.*` instead. Subscribing
  for callback-only data is a perf regression with no user-facing gain and
  caps the file below `100` until fixed or justified as render state.
- Renderer wrappers and element selectors infer their local schema node from a
  directly passed plugin descriptor. Use `RenderNodeWrapper<typeof FooPlugin>`,
  `RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and
  `useElementSelector(FooPlugin, selector)`. A manual `DefinitionOf`, local
  node mirror, `Reflect.get`, or cast used only to recover descriptor-owned
  fields is a Core typing bug, not acceptable consumer code.
- Do not add local fixture-shape aliases in tests, such as
  `type EditorFixture = { children; selection }`, to hide weak hyperscript
  typing. If many tests need the same JSX/editor fixture shape, repair or
  export the test-utils owner type and let call sites use that source-owned
  fixture type without local casts.
- Preserve main-style inline test setup. Do not extract `const plugins`,
  `const initialState`, helper variables, or wrapper factories from a test just
  to placate migrated types when `origin/main` kept the setup inline. Inline
  editor/plugin construction is part of the reviewed API shape; if inline
  inference fails, fix the source typing or explicitly classify a Plite/Plate
  gap instead of reshaping the test.
- Deleted plugin option helpers are forbidden public API. Do not use or re-add
  root or scoped `getOption`, `getOptions`, `setOption`, or `setOptions`.
  Package code should use
  `editor.plugin(FooPlugin).store.get/set/subscribe`; React code uses
  `usePluginStore(FooPlugin, selector)` or
  `useEditorPluginStore(FooPlugin, selector)`. A fallback like
  `editor.plugin(PLUGINS.foo)` needs a concrete owner reason: plugin self-definition
  cycle, React hook/component imported by the plugin itself, non-React layer
  that must not import a React plugin, or intentionally decoupled cross-package
  code. For plugin-owned behavior whose callback supplies owner context, do not
  look the plugin up by name. Do not pass `api`, `store`, resolved state, or `tx`
  into another helper merely to preserve an extraction. Inline one-use
  machinery or stage the reusable capability in the owning plugin chain. Only
  a proven cross-owner algorithm keeps explicit plumbing.
- If the correct answer needs missing substrate, stop and name the exact
  `Plite gap` or `Plate gap` instead of inventing a local workaround.
- Implementation topology is not frozen in review mode. Rename, move, merge,
  or delete internal files, helper exports, and test filenames in the same
  packet when that restores owner truth, removes a one-use split, or makes the
  surviving owner accurately named. Do not defer those changes to
  `pre-renaming.md` merely to reduce diff noise.
- Reject cosmetic synonym churn, but accept added/deleted pairs that prove a
  real merge, hard cut, or owner move. Preserve established public plugin
  concepts and names unless an accepted API decision changes them; that
  protection does not extend to one-use helper files or helper exports.
- Compare the current owner/name/role with `origin/main` before suggesting
  renames, deletions, or new owner topology. `origin/main` is behavior and
  ownership evidence, not a veto on the best current path or filename.
- Do not rename established public Core plugins, options, names, or concepts
  unless the user explicitly asks for naming cleanup, full Plate v2 closure,
  or a public API redesign. Internal one-use helpers are governed by owner-first
  colocation, not public-name stability.
- Prefer the smallest durable owner over both blind main-path preservation and
  cosmetic naming invention.
- If code moved from old Slate/Plate APIs to Plite primitives, preserve the
  existing Plate owner when that owner still describes the product concern, but
  do not preserve a legacy API shape merely for compatibility.
- When old Plate code used a generic editor range primitive such as
  `editor.api.nodesRange(entries)` or `editor.api.range(...)`, migrate node
  entries to `editor.read.ranges.fromEntries(entries)` and normal locations to
  `editor.read.ranges.get(...)`. Do not hand-roll anchor/focus with point
  helpers inside a product package; that moves substrate range semantics into
  the wrong owner.
- Treat new plugins and public concepts as API decisions. Treat internal
  colocation, helper deletion, and owner-accurate file/test names as part of the
  current cleanup packet.
- In review-mode final answers, separate:
  - `best Plate v2 migration now`;
  - `Plite/Plate gap or blocker`;
  - `related scoped sweep result`;
  - `do not do`.

Concrete correction:

- `OverridePlugin` is the main-code owner for plugin node override behavior.
  Keep that public concept unless an accepted API redesign changes it.
- A helper like `installPlateElementSpecsExtension` sitting in a huge editor
  file is migration plumbing. Do not defend that placement as final taste.
  If `OverridePlugin` is its only production owner, inline it there. Use an
  adjacent `override/` helper only when it has real reuse or an independent
  boundary. File size is not an extraction reason.
- The drift to cut is duplicate API wrapping, `any`, stale `getPluginByType`
  runtime lookup, or a special installer in the huge editor file. The review
  target is main-parity ownership plus Plite-native implementation.
- `editor.plugin(plugin)` is the only public imperative plugin lookup, where
  `plugin` is an exact descriptor or `string`. Descriptors keep exact inference;
  runtime names return erased portals;
  use a name for dynamic input or a family-agnostic slot that intentionally
  accepts whichever installed descriptor owns that name;
  `{ name }` is not a public lookup input. The consumer portal is the resolved
  descriptor view: expose `name`, `inject`, `render`, `initialState`,
  `targetPlugins`, and other descriptor fields directly beside `api`, `read`,
  `update`, `store`, and `installed`. Never add `portal.plugin`; callback
  authoring contexts alone may expose the current raw descriptor as `plugin`.
  Keep callback-only `editor` and `defineCodecs` off consumer portals. Cut standalone/editor alternatives (`getBasePlugin`,
  `getEditorPlugin`, `getPlugin`, name/type/container reverse lookups, and
  `getInjectProps`). Use portal `.name` after lookup when the normalized runtime
  identity is needed. Missing runtime names expose `installed: false`; they do
  not invent persisted schema identity. Installed element and property
  identity lives only at `portal.schema.type` for exact element owners and
  `portal.schema.key` for exact primary-mark owners. Behavior and
  aggregate-property portals omit `schema`; consumer portals never expose
  `schema.properties`. Name-only portals keep both identity getters
  non-optional for `PLUGINS` consumers, with `installed` as the availability
  guard and a runtime error for missing or wrong-kind access. Never restore
  universal portal `.type` / `.key`, derive identity from `portal.name`, or add
  optional chaining, non-null assertions, or raw-string fallbacks. Keep
  reverse/container/render caches private,
  answer public node questions through schema, read injection from
  `portal.inject.nodeProps`, and group codec mapping under `registry`.
- Existing public plugin concepts still need an API decision before renaming.
  One-use helpers such as `withScrolling`, `withPlate`, `withPlite`,
  `withStatic`, or `withHOC`, and helper-named tests, are not frozen: inline,
  delete, or rename them when the active owner audit proves they are redundant.
