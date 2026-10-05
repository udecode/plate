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

- Public identifiers use neutral domain names. `EditorRoot` owns the mounted
  React editor lifecycle, `EditorContent` is the package content primitive,
  copied `Editor` owns presentation, and `EditorProvider` supplies an existing
  editor without mounting a view. The entrypoint identifies the implementation;
  exported names do not repeat Plate or Plite branding.
- Public docs teach one Plate API. Only the Performance comparison and From
  Plite to Plate guide (including its translation) name the internal runtime.
  Contributor runtime references live outside the public docs collection. The
  boundary covers navigation, search, LLM output, examples and installable docs
  as well as visible prose.
- DOM output uses `data-editor` and `data-editor-*`. Exact attribute ownership
  protects application attributes sharing the prefix. New serialized output
  uses neutral markers; supported persisted formats retain explicit readers.
- `packages/platejs` is Plate's sole editor distribution owner and the only
  package that depends on `plitejs`. Direct `plitejs` imports belong only in
  exact facade, proxy, or intentional replacement leaves. Every other Plate
  plugin, feature, component, spec, type test, fixture, and user-authorable
  implementation imports the relative Plate facade or matching Plate
  entrypoint owner. `platejs/testing` mirrors Plite test helpers; test globs do
  not receive raw-import authority.
- `packages/test` is Plate's sole public test distribution. It peers on
  `platejs`, never imports `plitejs`, keeps headless fixtures in its Node-safe
  root, and isolates React, DOM, Playwright, and proof harnesses behind
  explicit subpaths. Test-runner differences do not justify more npm packages.
- `platejs` reexports the approved Plite surface by identity and replaces only
  an executable exception set. Runtime React code stays behind
  `platejs/static` or `platejs/react`; the root and its required dependency
  closure remain runnable without React.
- A package declares only the dependencies its source and runtime import, keeps
  React as a peer when it exposes React surfaces, and adds no test harness
  dependency only because its specs import it.
- Standard editor contracts live at `platejs` or `platejs/react`. The standard
  feature set is basic nodes, basic styles, code block, indent, link, and list.
  Their React adapters follow the same root ownership. Independent product
  capabilities live at explicit `platejs/<feature>` or
  `platejs/<feature>/react` entrypoints. One-owner helpers stay in their
  entrypoint or copied registry item. Do not publish editor feature, utility,
  React-utility, class-name, or wrapper packages to version Plate code
  separately.
- Do not add `platejs/basic` or a root `BasicKit`. The root exports individual
  standard capabilities; application and registry source own preset membership
  and ordering. A feature's current size does not decide ownership. Give it an
  explicit entrypoint when it owns an independent workflow that can grow.
- Keep Plate core unopinionated enough for framework use. Feature capability
  belongs in its entrypoint; product policy belongs in app/registry kits and
  examples.
- Package defaults are semantically neutral. Packages expose neutral mechanics
  and configurable contracts, including the positioning and hit testing that
  correct behavior needs, while application routes and endpoints, visible and
  placeholder copy, upload quotas, media limits, feature accessibility labels,
  colors, borders and visual stacking belong to the consuming application or
  copied registry source; configurability never makes a product default a
  package concern.
- One-shot file conversion is a standalone operation. An installed plugin must
  own editor integration, state, or lifecycle beyond capturing an editor for a
  call. Independently used converters have independent dependency entrypoints.
- Source-aware file conversion uses an explicit opt-in disposable artifact owned
  by the format entrypoint and held by the application. The artifact is
  conditionally typed, stays outside editor documents and plugin state, gives
  its retained bytes deterministic idempotent disposal, and passes explicitly to
  the consuming operation; it never becomes an editor session, persistence
  token, public archive model or hidden format state. Exact reuse requires
  schema and semantic equality; edited output preserves only safe independently
  owned source units and reports every deliberate fallback.
- Plite owns neutral Yjs collaboration and cursor reads in `plitejs/yjs` and
  `plitejs/yjs/react`. Plate's matching facades preserve exact identity and add
  plugin authoring and selection decoration policy. Plate adds no provider
  lifecycle, duplicate configuration store, replayable live-state reads or
  transaction mutation group. Copied factories preserve cursor metadata and
  capability-dependent API inference through extension and explicit-editor
  hooks.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is
  not enough.
- For current Plate features, parity and protocol matter. For deferred
  features, record the owner instead of pretending coverage exists.
- Public docs must be source-backed, current-state only, and readable by humans
  and agents.
- Installation docs install the package root, `platejs` or `plitejs`, never a
  package subpath, and a feature page lists only the optional peer libraries its
  taught entrypoints require.
- Plugin and feature pages are headless first. UI components are render
  examples unless source proves they own the behavior.
- Never document plugin APIs or transforms the source does not actually ship.

## Plugin and component doctrine

- Core stays lean. Keep invariants in their owner, plugin runtime values in
  `initialState` and its scoped store, and product policy app- or kit-owned;
  proven substitutable capabilities use ordinary plugins or entrypoints.
  Classify behavior this way before exposing composition.
- Plugin authoring keeps one-owner behavior colocated and inferred. Public
  builders, configuration paths, and contribution namespaces each need a
  distinct user job; current assembly machinery is evidence, not doctrine.
  Plugin descriptors stay flat by default; a namespace is earned only when
  several fields form one obvious same-prefix family.
- Builder consolidation targets the fewest inference-preserving, semantically
  distinct authoring stages, not the fewest method names. Before merging,
  overloading, renaming, or deleting a builder, prove the surviving path widens
  every affected type accumulator across repeated calls, named groups,
  dependencies, plugin conversion, terminal configuration, root/portal
  projection, and declaration emit. If it only carries a type through, fix the
  owning generic or keep the stage; callback annotations, casts, and `any` are
  not parity. That compile-only parity also covers callback contextual
  inference, literal preservation and overloads.
- Builder consolidation also proves the negative cases: unknown groups and
  invalid access still fail, and no read or mutation capability leaks onto the
  wrong editor surface. A hard cut of a plugin grammar proves type inference,
  ordering, rollback, transaction-local reads, generator safety and one-shot
  delegation on the surviving shape.
- Plite, Base, and Plate use the sole public descriptor-definition grammar
  `define*(name, definition)`, with no caller generics. Their private types may
  infer a small environment, meaning Plite dependencies or Plate dependencies
  plus initial state, beside the author input when TypeScript needs that split
  for contextual callbacks. Do not expose that environment or pretend one
  self-referential generic can infer the whole definition. Reject excess fields,
  normalize once, and preserve the exact definition through a private invariant
  witness. `name` is capability identity; element `type` and property `key` are
  persisted schema identities. Omitted schema identities default to `name`, but
  they are not the same contract. Do not expose `PluginConfig`, public
  `__config`, raw callback graphs, or a second accumulator machine.
- An app-resource-dependent Plate integration may expose one concrete frozen
  non-installable factory. `.create(options)` returns a fresh complete nominal
  descriptor; `.require(key).map(stage)` refines a non-nullish root input and
  lifts the exact existing Plate author-stage relation for copied composition.
  The factory has no `name`, `.extend()`, or `.configure()`. Created descriptors
  retain ordinary `.extend()` and terminal `.configure()`. Keep the
  input-to-output relation and mapper machinery private, and do not add a public
  factory-definition grammar without another independent job. The factory
  validates its required keys and its nominal, unconfigured output at runtime.
- Factory input that supplies an independent capability adds its methods to the
  inferred API, and omitting it removes them from typed editors and portals
  while erased runtime boundaries reject the missing calls. Copied factories,
  builder stages, explicit-editor hooks and declaration emit preserve that
  narrowing instead of publishing an always-present method family.
- `platejs` and `platejs/react` call the live editor type `Editor`; package and
  entrypoint establish the layer. React creation uses `useCreateEditor(options,
  deps?)`, while `useEditor()` and `useOptionalEditor()` retrieve the
  provider-selected command editor without caller generics. Mounted content
  supplies an exact view; controller selection is private, scoped, and
  independent of application IDs. A passive `EditorProvider` binds controls to
  an existing command editor without constructing another runtime. Interactions
  retain that target and read its current permissions; a detached target rejects
  writes. Schema, plugin stores and history remain model-owned across views.
  Whole-document controls use `useModelEditor()` for canonical load,
  replacement, persistence and snapshot conversion; root commands, DOM and
  selection use `useEditor()`. Selector hooks infer only their selected result.
  Exact feature capabilities come from descriptor portals. Keep an editor
  generic only when typed constructor/options input or an explicit editor
  argument correlates it with the result. Do not pass an application definition,
  plugin kit, or generated contract to a context hook as a type assertion.
  Optional generated types belong at explicit static boundaries; runtime
  construction owns capability inference and verification. Rebinding UI commands
  to a mounted view preserves an independently useful initial selection policy
  before focus, such as `autoSelect`.
- Plite owns one nominal `Plugin` descriptor family across raw, Base,
  configured, and React plugins. Authored descriptors carry one invariant
  definition witness; Plate adds product authoring and a lazy capability
  provider to that same identity. `PluginReference` is the erased nominal input
  contract.
- Descriptor-aware schema builders serialize the normalized plugin name while
  retaining the nominal descriptor in private metadata. Plate validates that
  private family against the installed owner before applying editor policy;
  equal names never make different descriptor families interchangeable.
- Export each plugin as one inferred constructor/authoring chain. A later stage
  may derive its private node shape from the prior `plugin` context, but public
  AST and operation-option aliases derive only from the final descriptor.
  Never widen exact node-operation generics or publish compiler-ferry types to
  make declaration emit succeed.
- TS7056 never changes the plugin API target: export one direct inferred
  descriptor. Do not add declaration-stage markers, private definition
  carriers, annotated staging aliases, widened dependencies, casts, or public
  subset types to contain the failure. Repair the owning generic or declaration
  boundary. Existing marked stages are transitional debt and remain only until a
  direct declaration build proves their deletion.
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
- Plite keeps `Plugin<Definition>` as one public definition parameter and
  derives official factory returns.
- Plate keeps its stages, schema, stores, format mappings, rendering and
  lifecycle policy; it does not allocate replacement raw descriptors, translate
  topology by name, register aliases, or dispatch portals by descriptor kind.
- Core may internally distinguish contextually typed author source from its
  canonical lowered Plite definition. That aliasing is not a public export or
  authoring concept.
- Dynamic lowering builds descriptors through the ordinary `definePlugin`
  constructor and semantic read contracts and keeps unavoidable type erasure
  inside its validated private compiler boundary. It publishes no second
  unchecked constructor and exposes no candidate cache merely so another package
  can read its own contributions.
- Raw plugin tuples infer lightweight runtime capabilities and descriptor-local
  node shapes while keeping editor-wide `Value` broad. `plate generate`
  discovers the unique exported plugin tuple and optional application schema by
  validated runtime shape, never fixed identifiers. It may emit committed exact
  `Editor`, `Value`, schema, and mutation TypeScript contracts plus a JSON
  schema contract with the compiled fingerprint. It never duplicates that
  fingerprint in generated TypeScript, emits the runtime plugin owner, or
  becomes the ordinary docs path. Do not make ordinary `editor.api`,
  `editor.read`, or `editor.update` access recursively evaluate the complete
  application grammar, and do not introduce size heuristics or depth-limited
  precision.
- Plugin-bound React and static component APIs infer the owner's exact local
  schema node from its descriptor: `useElement(FooPlugin)`,
  `EditorElementProps<typeof FooPlugin>`, and `EditorElementProps<typeof
  BaseFooPlugin>` for elements, plus `EditorLeafProps<typeof FooPlugin>`,
  `EditorTextProps<typeof FooPlugin>`, and the same-named static props from
  `platejs/static` for text renderers. They never infer from the owner's
  dependency graph. Do not import a derived `FooElement` or `FooText` only to
  pass it back as a generic. These component prop aliases require one descriptor
  generic and expose no default, raw node input, or second context generic.
  Presentation-only families may use unions of descriptor-owned props;
  components that forward full plugin context keep one exact owner.
  Descriptor-derived component props exist only when the descriptor changes the
  real prop contract through schema or plugin context; they are not a universal
  consistency layer. Generic renderer infrastructure uses the node-level
  `Render*Props`, inferred wrapper callbacks, or named wrapper prop contracts
  instead. One type parameter never switches between plugin ownership and raw
  node shape. Rendered leaf props contain schema marks only. Decorations never
  add fields to `props.leaf` or `props.text` and never activate a leaf renderer,
  so a renderer never recovers decoration state with `Reflect.get`, a cast or a
  restated leaf type; it uses the source's attributes or reads the semantic
  owner outside the renderer. Wrapper and selector consumers pass the owning
  descriptor directly: `RenderNodeWrapper<typeof FooPlugin>`,
  `RenderStaticNodeWrapper<typeof BaseFooPlugin>`, and
  `useElementSelector(FooPlugin, selector)`. They infer the local schema node
  and plugin context without a manual `DefinitionOf` extraction or node cast.
  Element payload and position are independent subscriptions:
  `useElementSelector(FooPlugin, node => node.field)` derives node data, while
  `usePath(path => path.at(-1))` derives position. A path-only move does not
  invalidate payload reads, and an unchanged path projection does not rerender
  its consumer. A consumer plugin that installs the component uses the stable
  imported owner descriptor for component props, avoiding a self-referential
  configured descriptor; consumer-local capabilities remain available through
  scoped hooks. A `usePath` projection whose result is an object passes the
  equality option so unchanged positions do not rerender.
- Copied feature files own decoration colors and classes through
  `decorate.attributes`. Presentation configuration preserves semantic range
  readers and their observation; it does not add subscriptions. Shared Editor
  skins contain only general editor presentation, with no optional feature
  imports, selectors, class names, or data-attribute knowledge. Feature-owned
  content-root presentation enters through `render.contentAttributes` on the
  existing plugin. Plate merges safe attributes onto live/static content roots
  without extra DOM; components and slots own structure and lifecycle.
  Static feature presets stay server-safe and express their own presentation needs.
- `decorate.attributes` accepts a safe attribute object, a pure callback over
  its inferred context with `entry` and `decoration`, or `null` to clear
  inherited presentation, and `render.contentAttributes` accepts a safe object
  or `null`. Decoration attributes concatenate classes, merge styles shallowly
  and let later values win other collisions, and every decoration capability
  still declares `read`. A consumer subscription for cross-feature presentation
  is chosen only after comparison with changing the producer's presentation
  contract, a justified lower primitive, and removing or merging producers;
  moving classes into a kit through an existing hook does not settle that
  choice.
- Inline transient product paint uses the owning plugin's `decorate: { read,
  observe?, attributes? }` descriptor. Sparse attributes that custom components
  receive through React use `render.useViewElementAttributes`, one React hook
  host per enabled plugin per mounted view. It returns `{ key, attributes }[]`
  whose attributes are only `className`, `placeholder`, `style` and primitive
  `aria-*` and `data-*` values; Plate privately owns source identity,
  compiled-plugin precedence, publication, cleanup, and per-`NodeKey`
  subscriptions. A feature may bind benchmarked high-frequency interaction state
  directly to canonical mounted node hosts when the state is private,
  view-local, and outside React component props. Compose the existing host ref,
  prove host replacement, detach, cleanup, hydration and native behavior, and
  add no public hook, store, registry or generic channel. Per-node
  `render.attributes` and `inject.nodeProps.transformProps` stay pure and
  hook-free. Structural product rendering uses components and plugin render
  slots. Ordinary callers never assemble Decoration sources, attribute stores,
  providers, publishers, renderer registries, generic target stores, or manual
  refreshes to install a feature. The `decorate` descriptor returns keyed ranges
  with render-safe attributes. That projection stays in one feature-owned view
  effect.
- Comments owns semantic thread records, actions, subscriptions and private
  native range handles per editor. Applications load
  `initialState.initialComments` and persist `api.toJSON()` with the exact
  document revision. The saved envelope separates conversations from opaque
  range targets; live records retain target identity and `attachment(id)`
  supplies current coverage or neutral unavailable state. Semantic subscriptions
  never wake for document mapping. The seed is not a second live store. Database
  I/O, revision association, CAS and authorization stay with the application
  through `initialState.mutate`; copied Comment/Discussion UI owns presentation.
  BaseCommentsPlugin owns semantics and CommentsPlugin adds live interactions.
  Consumers do not assemble a channel, provider, factory or anchor-binding
  effect. Reuse Plite Annotation plus plugin Decoration for mapped locations and
  paint. Body or metadata changes perform zero annotation resolution and zero
  editor-node refreshes. Independent editors restore their own native handles
  from the same saved revision. Ordinary reload starts a fresh undo stack; live
  replacement and changed-baseline collaboration require their own proven
  transport contract. Activation stores selected IDs; keyed writes retain
  unrelated records and membership lists. Durable actions serialize per thread
  and publish only after canonical commit; rejection preserves records and
  composers. Draft operations stay local. Resolve/Reopen and explicit deletion
  are independent of document undo. Loading preserves identity, authorship,
  timestamps and status without replaying user commands. A published
  conversation remains discoverable when its target has no current-view
  coverage. Exact live coverage alone owns inline paint, block counts and
  navigation; cached coordinates and surviving neighbor endpoints never relocate
  a thread. Bounded copied UI resolves only its mounted page and labels missing
  coverage neutrally. Document undo may restore target identity, while unrelated
  later typing cannot inherit it. Document mapping notifies attachment
  subscribers without rewriting conversations or triggering semantic
  persistence. Durable comment actions return a typed awaited result, and the
  package fences late work from a retired owner so it never publishes. Copied
  Comments UI queries attachments and targets through the event or render slot's
  exact editor, because one shared conversation can have different coverage in
  two projected views. Document-level discovery adds no Comments location store,
  whole-corpus attachment subscription, mandatory Suggestion dependency or
  generic Editor surface. Replies and edits stay outside document undo too, and
  a generic checkpoint, live record-replacement API or separate comment undo
  stack needs an independent supported job.
- Successful local thread creation joins the one document-history order through
  a session-only effect after its durable commit, and user records and the
  current reply identity live in the ordinary plugin store. An authoritative
  full-document import prepares its document, comments, users and required
  plugin state in a detached candidate editor and swaps the editor owner through
  a keyed remount; candidate failure preserves the mounted editor, and document,
  comment and user replacement is never sequenced on the mounted editor. Keeping
  the editor instance instead needs one owner that publishes or discards every
  affected runtime resource as a unit, and without that owner the import is
  rejected before mutation. Replaying that history entry blocks on replies,
  canonical divergence or rejection, and settles failed when the owner throws,
  without advancing to the next document change. A successful authoritative
  import bypasses ordinary mutation and history, clears transient composer
  state, fences late work from the retired snapshot, and never exposes
  per-thread replacement.
- Application replies attached to a document-owned entity use that entity's
  identity and location. Accepting, rejecting, undoing, or restoring the entity
  changes derived visibility, not the application's explicit resolution state.
  The combined UI owns reply composition; document mutation owners do not
  acquire an application thread lifecycle or allocate duplicate reply anchors.
  The same holds for any application record that refers to a document-owned
  entity: command, undo, redo and external document updates yield the same
  derived visibility, and mixed presentation stays in its composition owner
  without peer data dependencies or one-consumer presentation props.
- Suggested-edit semantics come directly from Plite's native authored
  capability. Plate may provide copied registry presentation, mode controls,
  discussion composition, and product defaults, but it does not own another
  suggestion schema, mutation engine, review scan, decision command set, or
  global input mode. Human and explicitly tracked AI edits use the same authored
  records and decisions; temporary AI drafts remain outside that lifecycle.
  Comments keeps its independent thread lifecycle. Load existing suggestions
  through the complete `initialValue`, preserving authors and change IDs;
  initialization never replays edits under switched identities. `EditorRoot
  authored` configures the exact mounted view through the native owner. Changed
  intent or projection inputs reconfigure that view; equivalent values preserve
  subsequent view-local mode commands. Editing may keep proposed or markup
  content visible. Suggestion mode controls preserve that projection when they
  change intent; proposing from an accepted-only view selects markup so the
  proposal remains visible. Proposing intent with the accepted projection is an
  invalid view input.
- Sibling render slots expose only the lifecycle input owned by their placement:
  the exact Editable ref or the exact container ref. They never inherit the
  host Editable or container DOM props. Register a complete component directly;
  use a callback only when the caller performs real composition such as
  supplying alternative children. Type each sibling from its exact slot
  contract, never from the plugin descriptor that installs it. Delete a
  descriptor generic that only restates fixed placement props, zero-caller
  option bags, and primitive component-prop intersections.
- Copied UI types a framework-defined plugin field with the package's exported
  contract, such as `WrapRootProps` and `WrapContentProps`, or with contextual
  inference, never with a local structural mirror, `Pick` alias, callback return
  annotation or cast. Extracted root and content slot components never restate
  `children` or `editableRef` in a local object type, and a missing contract or
  failed inference is repaired in the package owner before the registry wires
  it.
- When Plite React can derive neutral presentation from one mounted Editable's
  DOM lifecycle, `EditorContent` inherits that behavior without a Plate prop,
  plugin, store, or kit. Copied `Editor` source marks owned focus targets with
  `data-editor-keep-selection-visible` and styles Plite's inactive-selection
  output hooks. Canonical editor state and rendering mechanics remain in Plite.
- Controlled read-only state goes on both `EditorRoot` and the copied `Editor`.
  `EditorRoot`, `EditorContent` and `EditorStatic` accept no raw decoration or
  paint-renderer props; copied UI configures the owning plugin's
  `decorate.attributes`.
- Plite keeps transient ownership literal: Decoration owns inline paint,
  Annotation owns durable logical ranges, and selection or keyed cursor owners
  feed reusable geometry hooks. Those hooks require the exact mounted Editable
  ref, return immutable viewport coordinates or `null`, and expose no generic
  target store, implicit active-view policy, or public scheduler. Copied
  registry UI owns Floating UI middleware, out-of-flow composition, and
  presentation. DOM geometry returns `null` during server rendering and rejects
  virtual-element adapters.
- Per-peer cursor paint uses the existing keyed cursor read, with no theme API,
  parallel plugin, cursor cache or observation channel. Related copied
  selection, caret and label paint shares one copied color resolver.
- Element component and node-wrapper props carry stable node identity but never
  a live `path`. Resolve position from the element at interaction time, or call
  `usePath()` only when rendered output must react as that element moves.
- A node renderer that forwards to `EditorElement` passes the complete incoming
  `props` object and reads fields from it without destructuring required fields
  away.
- Feature state uses Plite `NodeKey` values for live node identity and names
  those fields `key` or `keys`, never `id`. Optional durable element identity
  belongs to `ElementIdPlugin` under the canonical schema property `id`.
  Persisted associations use `ref` or `refs`; definitions and references may
  share one `ref`, while separate occurrences keep distinct element IDs.
  External names such as MDAST `identifier` stay inside format mappings, and
  semantic addresses such as `url` keep their domain name. Exact generated nodes
  read `element.id`; generic package boundaries convert a `NodeKey` through the
  installed plugin portal. The portal does not accept erased element values. The
  compiled `id` property target alone decides which elements receive persisted
  IDs; preparation strips the plugin-owned property from excluded elements.
  One-request protocols expose small refs mapped to local `NodeKey` values; they
  install persisted IDs only when references must survive reload, storage,
  editor destruction, or another client. Convert a live key at that boundary
  with `editor.plugin(ElementIdPlugin).read.id(key)`; do not retrieve the node
  first. Live navigation and TOC state use keys, while one-shot formats such as
  DOCX derive export-local references. Markdown writes no block-identity
  wrapper; compatible `<block id>` reads restore IDs only through the optional
  plugin. Registries install it explicitly as product policy, never transitively
  through an unrelated feature. Feature-owned DOM attributes that carry node
  keys use the same vocabulary, `key` and never `id`, as `data-editor-node-key`
  does.
- Autocomplete queries stay ordinary editor text, and a feature declares its
  trigger and query policy as `ComboboxState` fields in its plugin
  `initialState`, never as a transient input node, input plugin or trigger
  command. A popup opens only on a trigger typed in its Editable, tracks that
  occurrence with a range anchor, previews IME preedit without publishing it,
  and completes by replacing trigger and query in one refusable transaction.
  Copied controls own catalogs, filtering, the active option and presentation.
  Completion rechecks the offered query before it replaces the trigger and query
  in one refusable transaction.
- Find keeps its open bar, pending draft, deferred input effect and open and
  close commands in the copied `slots.wrapRoot` composition of each exact
  Editable, never in the model plugin store or a controller hook that every
  button consumes; custom opening controls consume that context without
  subscribing to results, running searches or resetting the search. Committed
  queries and matches stay in `BaseFindPlugin` and survive view detach, only the
  focused bar scrolls its view, and an inactive or detached view never runs
  another view's focus or scroll work. Copied UI scrolls to a known match or
  selection by passing its semantic range to the exact view's
  `editor.api.dom.scrollIntoView` and returning its cancellation function from
  the effect, without querying decoration markers or adding an animation frame.
- The optional `platejs/upload` feature owns asynchronous file admission through
  `UploadClient`, the single-file upload capability expressed with Files SDK
  call and outcome types, not a generic transport contract. A Files SDK client
  satisfies it structurally; session-local examples and tests may implement only
  that operation. Its authored draft retains the `upload` schema type and
  persists only the draft kind. Upload validates and inserts a whole batch
  atomically, starts transfer after commit, and keeps files, request authority,
  progress, failures, and object URLs local to each live node key. Completion
  rechecks that key and kind before atomically replacing the draft with the
  installed media plugin's completed schema type. Media plugins own those
  completed schemas and URL normalization; the application owns the gateway,
  access policy, storage, and durable URL mapping. Removal, retagging, plugin
  cleanup, and whole-document replacement revoke requests; history never
  restarts them. Internal slices preserve drafts, while external HTML and static
  rendering omit unresolved media. The same draft-intent, batch-admission,
  after-commit transport, key-local resource, recheck and revocation law applies
  to every asynchronous document-bound asset, and it never becomes a public
  asynchronous-job framework.
- `BaseUploadPlugin` from `platejs/upload`, with its React `UploadPlugin` from
  `platejs/upload/react`, owns the upload lifecycle and takes a compatible
  client and a synchronous `getUrl` resolver, never a lifecycle named after its
  SDK. `BaseFilePlugin` from `platejs/media`, with its React `FilePlugin` from
  `platejs/media/react`, stays the completed generic file node beside image,
  audio and video. Each draft completes through the editor that its after-commit
  boundary supplies, so authored and named-root node identity stays in the
  admitting runtime.
- `.extend()` widens the exact definition; `.configure()` is terminal and
  non-widening; `toReactPlugin()` is the exact live Base-to-React adapter.
  Factories replace `clone()` and any third copy verb. Repeated fields do not
  share one merge law: `api`, `read` and `update` accumulate across stages,
  while replacement declarations such as `commands` need one ordered owner
  factory unless a later stage replaces the whole declaration, so check a
  field's merge law before repeating it in a later stage.
- Descriptor-aware schema calls identify schema elements and groups. Document
  property reads use typed property handles or semantic plugin APIs, never a
  one-property descriptor shortcut.
- Plate normal-flow membership is authored with `blockContent` and read through
  `editor.read.schema.isBlockContent(element)`. Dynamic selectability and UI
  presentation remain independent policy. Examples use `blockContent: false` for
  structural internals and `plugins.blockContent()` for normal-flow container
  content.
- A Plate application schema declares `root` only when its primary structure
  differs from the standard nonempty paragraph policy, using descriptor-aware
  `schema.content.*` builders with an effective positive minimum. A required
  `schema.content.prefix(slots, rest)` counts its slots toward that minimum,
  each slot constrains a persisted type and exact schema-valid properties, and
  the rest rule owns later children and their default. The first descriptor in
  `elements` owns the ordinary default.
- Generic node traversal uses an independent structural `type` selector and a
  function-only `match` condition. Plate descriptors resolve through the final
  application schema; Plite accepts persisted strings and schema handles.
  Selectors and type guards infer results. Callers never choose a result type
  with a generic argument.
- Node reads, transforms, selection queries, corrections and their static
  mirrors share that selector grammar, with no object matcher DSL,
  descriptor-first overload or plugin-scoped traversal copy. The `at` target is
  independent of the selected node type, an insert puts its split-ancestor
  selector under `split: { type, match }`, and `NodeApi.matches` stays
  predicate-only. Plate code, copied registry source included, passes the exact
  descriptor (`type: FooPlugin`, `type: plugin` in its own author callback, or a
  descriptor array) whenever one exists and never eagerly resolves
  `schema.type`, passes a capability name or threads a resolved `type` through a
  helper to feed a selector; persisted strings stay for raw Plite, AST
  construction and comparison, format mappings, external data, deliberate
  fixtures, genuinely dynamic actions, optional plugins that are deliberately
  not dependencies, and generic schema boundaries with no descriptor.
- Plugin-local property writes stay on one `tx.nodes.set({ ...props }, options)`
  object-patch law. Owned property names and values infer from the shallow
  plugin and required-dependency graph; duplicate persisted names infer their
  value union. Aliases use their authored persisted key, and `unset` accepts a
  typed key or exact handle. Dynamic string-keyed patches defer to runtime
  schema validation. Prefix families and cross-node behavior use semantic owner
  operations. Plate adds no scalar set overload or second mutation portal.
- An Editable `onKeyDown` handler runs before the built-in editor commands and
  returns `true` to claim a key; `preventDefault()` alone does not mark the
  event handled.
- A field that already owns contextual typing does not expose a second public
  identity helper merely to reapply its nested type. Fix the owning generic and
  hard-cut that compiler machinery. Plate native-field callbacks stay directly
  on the plugin root; context-dependent behavior stays inside the authoring
  callback, while independently reusable standalone descriptors use the Plite
  builder with domain inputs and compose as dependencies.
- Persisted document lineage lives in an app-owned `{ document, schema,
  selection? }` envelope, and applications import its migration builder, runner
  and Plate release steps from `platejs/migrations`. A named app schema owns one
  ascending target-version migration chain and the expected generated
  fingerprint for every supported historical envelope version.
  `defineDocumentMigrations` binds that chain to the immutable current plugin
  tuple and schema. `migrateDocument` runs detached at the app or CLI storage
  boundary and returns an exact current envelope; missing versions and identity
  drift fail closed before callbacks. Raw documents require an explicit source
  at each conversion, and with one, `migrateDocument` reads any input as raw. A
  step sees only `children`, `meta` and `roots`; every other stored top-level
  field arrives in its `legacy` record, a step lifts it into `meta` or `roots`,
  and completion refuses a field no step lifted. Ordinary editor creation and
  replacement accept current input only. The persistence owner allocates each
  released boundary; implementation batches amend an unreleased target instead
  of inventing later schema versions.
- Current-document invariants belong to their schema, property, state-field,
  validation, or transaction owner. Plate exposes no generic plugin document-
  preparation hook and no hidden migration side channel. History and Yjs room
  cutovers remain app-owned persistence policy.
- Normalizers and corrections accept only current-schema shapes and never
  recognize historical ASTs. Plate feature code relies on the transaction's
  corrections and adds no explicit normalization call; `docs/vision/plite.md`
  holds the one explicit repair.
- Plugin constructors own every independent author contribution: `api`, `read`,
  `selectors`, `update`, flat native Plite fields, `formats`, and ordinary Plate
  fields and their context callbacks. There is no nested plugin-definition
  wrapper. Semantic format maps use the constructor callback's context-bound
  `defineFormats`: one argument for self maps, or `defineFormats(TargetPlugin,
  map)` for a foreign contribution with injected targets. The format callback
  exposes only static schema bindings and `defineFormats`; operation callbacks
  receive frozen plugin state, registry, schema, model context, and a
  format-owned diagnostic reporter. This is the one inline mapping inference
  anchor; do not expose direct maps, manual targets, a live editor, or a global
  helper. Constructor context alone never justifies `.extend()`. Use `.extend()`
  only for an imported/prebuilt declaration, a shared factory the constructor
  cannot access, or a real earlier-stage type dependency. `definePlugin()` from
  the headless and React entrypoints accepts root-level `component` for
  static/RSC and live consumers; terminal `.configure({ component })` replaces
  it. Base `.extend()` rejects it because independent defaults belong in the
  constructor. Use `toReactPlugin()` at the owning React adapter to publish a
  reusable Plate-layer descriptor or add genuine Plate-only authoring. A
  terminal consumer never inserts conversion merely to set `component`. Do not
  expose `.withComponent()` or the renderer registry shape.
- Clipboard ingress is the typed `domCommands.insertData` command. Plugins
  intercept it through `commands`, return pure transaction specs, and delegate
  with `next()` to preserve the shared exact-slice, data-transfer format, and
  plain-text fallback. It is never a root plugin field or separate contribution
  registry. The owning plugin or Plate stage contextually infers installed
  transaction capabilities without callback annotations or editor type
  arguments.
- Input rules are feature-owned declarations compiled into private middleware
  around the canonical text, break, and data commands. `enabled` and `resolve`
  are read-only and create no transaction. The first resolved rule receives one
  transaction; returning `undefined` consumes the input, its typed `next(...)`
  token composes the original command after that prefix, and `decline()`
  discards the candidate and delegates the original input. A thrown apply
  publishes nothing. Structural commands report whether they actually staged a
  change, so a matched marker is consumed only when its conversion applies.
  Package rule families are ordinary functions built with
  `defineInputRule(rule)` or descriptor-bound `defineInputRule(owner, rule)`; no
  public executor plugin, injected builder DSL, or separate rule-factory
  language is part of the contract. Input-rule admission never shadow-copies the
  document in feature rules and adds no general transaction savepoint.
- Structural break, delete, merge, and normalize policy resolves at the exact
  leaf. A leaf may be a direct value or an owner-context resolver; `undefined`
  delegates that leaf and boolean `false` is terminal. Do not restore a global
  matcher that shadows an entire rule family. Positional document policy uses
  an app-owned convergent correction that constructs complete schema-valid
  nodes, not a path/type retagging plugin.
- Core owns author-facing semantic mapping types for a universal first-party
  format when that contract needs only type dependencies. Feature packages must
  not activate built-in format typing through empty or side-effect type imports.
  Markdown is the concrete first-party case: Core owns its MDAST-facing mapping
  types, while `platejs/markdown` owns the optional compiler/runtime and its
  whole-payload `DataTransferFormat`. Truly optional or third-party format
  contracts stay outside Core behind an explicit type path. Installed feature
  plugins own their shipped syntax mappings. Compile those declarations once
  from the installed plugin graph; do not centralize feature rules in the format
  package or mutable plugin state. Whole-payload MIME declarations belong to
  root `dataTransferFormats`, not semantic `formats` maps.
- Ordinary Markdown is CommonMark with GFM and math, and extensions never
  change its meaning. Plate extension elements are registered tags recognized
  by the runtime's own selective grammar; full MDX is not a Plate dialect.
  Existing MDX-written Plate output reads through one dialect law: inside a
  registered block tag, only fenced code is code.
- The `remarkPlugins` list in `MarkdownPlugin` configuration is the generic
  extension boundary and makes no MDX promise; a conversion call takes no
  remark-plugin list of its own.
- A Plate-owned custom Markdown element tag is persisted schema identity. Its
  mapping uses the resolved schema type symmetrically for the `tag` selector,
  decoded element identity, and encoded tag name. Standard MDAST kinds and
  HTML tag names remain literal. Tag attributes cross a Markdown-owned wire
  codec selected by schema property kind; the schema validates values. Legacy
  tags migrate before mapping dispatch; mappings never accept both identities.
- A Markdown mapping selects one source: `node` for a standard MDAST kind, typed
  by the MDAST kind map, or `tag` for a registered tag name, with `nestedTags`
  for tags read only inside it and no public rule-name union. An element
  declares `markdown: { tag: type }` and a mark declares `{ node }`, `{ tag }`,
  `{ tag, value }` or `{ tag: 'span', style }`. The callback-free tag mapping is
  the default: the runtime builds the node from the schema, writes its
  non-metadata properties except list topology, traverses children by the
  content model, and `attributes` renames owned properties.
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
- Installed mappings are the only conversion owners; a conversion call takes no
  per-operation mapping override or node filter, and a missing mapping is the
  fix for unsupported content. Input a mapping cannot represent is a diagnosed
  refusal under the loss policy; programmer and configuration faults throw.
  Configurable custom tag identity stays on its schema-owning plugin, not a
  foreign mapping contributor.
- Every parse or import diagnostic judged under `lossPolicy` declares `impact`:
  `lossless` for normalization and `lossy` when source content was dropped. The
  code that removes content classifies it, and no diagnostic code is exempt
  wholesale: a lost property warns under every policy; dropped nodes, text,
  media and captions follow the loss policy; and only safety removal of
  non-rendering markup, such as metadata, scripts, event handlers and
  script-capable URLs whose label, alt text or caption survives, or of graphics
  hidden with `aria-hidden="true"`, counts as lossless, as does raw HTML kept as
  text. The HTML parser reports embedded media that no installed mapping owns
  even when fallback content survives.
- A stored URL meets one role policy at every admission, through its feature's
  schema validator. Navigation destinations keep a script-capable floor that
  configuration narrows or widens only above it; image, media, file and embed
  sources admit only what that role can load. A conversion keeps a refused URL's
  label, alt text or caption and reports the removal, and output rechecks the
  same decision. No option bypasses the floor, the empty URL is an inert
  placeholder, and no format adds its own URL check or sanitizer helper.
- State that selects a plugin capability stores its descriptor or normalized
  name. It never stores a configurable persisted type or key. Resolve schema
  identity at the AST read/write boundary, including transient-node factories.
- First-party plugins take their capability names from the flat shared `PLUGINS`
  map, which holds capability names only; no `KEYS`, `NODES`, `STYLE_KEYS` or
  grouped heading alias catalog exists. Copied registry data, deliberate
  fixtures and serialization boundaries write explicit persisted type and key
  literals and never use `PLUGINS` as a storage catalog, and raw literal plugin
  names otherwise belong only to genuinely local or internal plugins.
- Generated schema contracts are content-addressed semantic output. Readers
  recompute their authoritative fingerprint, and restoration rejects derived
  tables that differ from current source contributions.
- Decode-only and encode-only mappings still prove every identity leg they own.
  Phrasing-only wrappers decode external phrasing children directly instead of
  unwrapping an arbitrary decoded Plate element.
- Custom tag callbacks read with `readTagAttributes()`, and an encoder claims
  each property its output represents through `encodeNodeAttributes()`, the
  `encodeAttributes()` output it returns, or `preserve(...)`; single-value HTML
  mappings claim by writing output, an encoder that merely exists claims
  nothing, reading a property never claims it, and each unclaimed content
  property warns, as `html-unsupported-content` in HTML. A decoder claims the
  Plate attributes its result represents with `preserve(...names)`, and each
  attribute Plate's own mappings write that no decoder claims warns with `kind:
  'attribute'`, except on an element already reported lost. Attributes take no
  blanket JSON coercion, feature-local attribute parser or read-tracking claim.
- Fixed external source/name literals exempt only the external leg. Decoded
  Plate identity still resolves from the target schema, and parsed properties
  precede structural children/type.
- Claim mappings on one selector run by priority: `undefined` declines to the
  next mapping and `refuse` stops dispatch. A mapping whose target contributes a
  mark is a mark mapping with no flag and no priority: its `node`, `tag`,
  `value` and `style` declarations say how it reads and writes, the first
  declaration whose `value` matches writes, a custom `decode` returns the mark
  value, a custom `wrap` returns a childless wrapper as the escape path, every
  mark mapping on a selector composes, and the runtime decodes the children
  once. A selector holds claim mappings or mark mappings, never both, and decode
  contexts expose inherited persisted text properties as `marks`, never
  `decoration`.
- Plugin schema is creation-owned. Declare it in the plugin constructor, using a
  schema factory over typed `initialState` for authored variability; neither
  `.extend()` nor terminal `.configure()` replaces it. Schema-derived callbacks
  may belong to that plugin or a foreign contributor, and TypeScript cannot
  retroactively re-typecheck either. Preserve unrelated authoring and
  configuration. Values resolved only after configuration, such as a configured
  node type, stay truthfully broad in the author callback and exact at runtime.
  A schema replacement through `.extend()` or `.configure()` is rejected at the
  public type boundary and at runtime.
- Put `schema` before inline constructor callbacks that consume its inferred
  shape. Use one real `.extend()` dependency stage when a callback needs a
  capability introduced by an earlier result; annotations and casts are not
  inference repair.
- Plugin state has one public channel: `initialState` declares defaults,
  `.configure({ initialState })` overrides descriptor defaults, builder
  callbacks use inferred `store`, and consumers use
  `editor.plugin(Plugin).store`. React subscriptions use `usePluginStore` with
  an installed typed descriptor; its selector `{ id }` option targets another
  registered editor. Optional feature composition checks installation before
  mounting the subscribing child. Do not hand-roll portal and external-store
  subscription plumbing, restore deleted option accessors, or add a parallel
  immutable `config` channel. Writes retain unchanged immutable branch
  references and own newly supplied caller data. Repeated consumers subscribe to
  their visible result; indexes derive from stable result references. A missing
  installation, store or state field fails loudly in plugin-store subscriptions,
  and no nullable wrapper hook is added.
- Plugins never add plugin or product fields to the root editor object; only
  core-owned fields of the typed public `Editor` extend it. By lifecycle, that
  state lives in scoped `api` and `update`, `initialState` and the plugin store,
  Plite state fields, a React store, a session or controller object, or a
  module-local `WeakMap` keyed by editor.
- Every state-owning production descriptor has a named `*PluginState`, exported
  with an exported descriptor. Owner defaults are checked against that contract
  through a typed constant or explicit factory return type; they never define
  the contract by inference, `as`, or `satisfies`. Consumer configuration stays
  partial and inline. Top-level state fields are required and exclude
  `undefined`, using concrete defaults or `null` for empty values. Constructors
  and authoring stages enforce the same contract for objects and factories;
  nested domain values may retain optional properties. Initial-state
  completeness is enforced by types and adds no validator API.
- Capability names encode execution boundaries. `selectors` are pure projections
  of plugin store state; `read` is a pure, replayable query over a supplied
  document snapshot; `api` is a stable plugin service not bound to a supplied
  snapshot or transaction; `update` owns document mutation through the active
  transaction; flat native Plite fields own genuine editor-wide substrate.
- An API that combines a caller-supplied old snapshot with live editor reads is
  deleted. A narrower public capture helper needs a current standalone read job
  with measured material savings, and it stays on the document-state owner
  instead of becoming an export subsystem, cache or live view.
- Plate compiles `read` and `update` capability trees per plugin configuration.
  API factories bind to the exact editor or mounted view that exposes them, with
  shared plugin stores, plain-record recursion and source-order replacement. An
  API stage sees the preceding stage's immutable API. Descriptor construction
  retains its model lifetime; view work captures the editor inside the API
  factory. Descriptor merging never owns runtime values. A base or retired
  editor never selects another mounted view for focus, scrolling or paint.
- A callback whose context supplies `store`, `api`, `read`, `update`, `schema`,
  `plugin` or `installed` uses them directly and never looks its own plugin up
  again through `editor.plugin(...)` or a root API group. It keeps `editor` only
  for editor-wide substrate, another plugin, or one-shot transaction metadata
  that its scoped `update` cannot express, and a specialized shortcut,
  input-rule, state-value or render-prop callback that exposes only `editor`
  keeps an exact typed portal. A native runtime callback reads staged plugin API
  from its callback context when it runs, and that lazy publication has runtime
  proof.
- Temporary arrival feedback uses one target and timer per mounted view,
  canonical root-local element keys and call-time safe attributes. It does not
  mutate the model, selection or history. The requesting feature owns styling
  and complete navigation policy; generic element renderers receive neutral
  attributes without feature subscriptions.
- Every element plugin gets descriptor-bound `insert`, `set`, and `remove` on
  `editor.plugin(Plugin).update`. Block elements also get `upsert`: it reuses a
  matching empty editable block, replaces a different empty editable block, and
  inserts after content or structure. `insert` follows the same source policy
  but creates a sibling for a matching empty block. Explicit `at` is an exact
  insertion location, while explicit `replaceEmpty` overrides semantic
  replacement for `insert`. An authored `insert` must author `upsert` too when
  generic construction cannot preserve its structure or domain identity.
  Default-constructible, schema-compatible text blocks also get `toggle`; text
  blocks with required construction properties and structural plugins author
  `toggle` only for real domain, wrap, conversion, or child semantics. An opt-in
  generated `Editor` type may additionally expose eligible methods under the
  capability name on root and transaction updates. Raw tuples keep authored
  root/transaction methods exact without materializing a schema-wide generic
  mutation map. These methods target the descriptor's persisted `type`; callers
  do not restate identity or `match`. Generic text-block toggle never exposes
  structural `wrap`, but may accept one-shot update policy such as `collapse`.
  Use the transaction primitive only while composing inside an existing
  transaction. An authored same-name method replaces the synthesized default
  only when it adds real semantics. A scoped plugin portal already names its
  owner, so its methods neither repeat that noun nor nest under taxonomy-only
  groups: noun aliases such as `insertTable` go, and distinct verbs such as
  `insertColumn` and `merge` stay.
- Application schema overrides are a compiler boundary. Ordinary runtime
  tuples do not expose descriptor-generic mutations whose eligibility depends
  on the final grammar; opt-in generated types may own that exact surface.
- Only the consuming application's final schema overrides a feature plugin's
  element type, content, groups or existing property targets, and it may add
  app-owned properties. Reusable feature modules never author application schema
  overrides, lineage or final grammar composition. Plugin-owned property keys
  and value laws are immutable, so a persisted rename is a new field plus a
  migration.
- Custom element insertion is `insert(input?, nodeOptions?)` and block reuse is
  `upsert(input?, nodeOptions?)`: domain data first, generic placement and
  selection second. `upsert` intentionally omits exact `at` and `replaceEmpty`;
  callers use `insert` for those overrides. Do not merge `at`, `select`, or
  other node options into feature input, and do not export compiler-ferry
  `Insert*Options` types. Schema-default CRUD uses the synthesized operations.
  The synthesized element `insert` places an inline element at the selection and
  does nothing without a selection or an explicit location.
- The scoped portal accepts root transaction policy without changing its
  inferred methods: `editor.plugin(Plugin).update(policy).method()`. It opens
  exactly one root transaction and preserves rollback and history tags. Code
  inside an active transaction selects the existing group through
  `tx.plugin(Plugin).method()` when it owns the descriptor or
  `tx.plugin(pluginName).method()` when a descriptor import would create the
  wrong package dependency. An optional name-only consumer checks
  `tx.plugins.has(pluginName)` in the same transaction before dispatch. Do not
  probe `editor.api` or `editor.update` with reflection, duplicate the target
  method type, or import the descriptor solely to test installation. Generated
  closed editors may also expose `tx.pluginName.method()`. Nested portal
  one-shot updates are rejected.
- A public capability plugin needs a real omission/replacement job or a hard
  ownership boundary, valid fallback semantics, closed dependencies, one stable
  user-facing name, and independent default, omitted and replaced proof, with
  browser proof for any native input, clipboard, selection, focus or DOM
  behavior it owns; the full preset stays the obvious common path. Protocol
  rows, events, and native plugin fields do not map one-to-one to plugins.
- Plugin identity does not force another file. Keep one-owner descriptors
  colocated. Public packages export individual capability descriptors;
  inseparable multi-plugin structure uses an honest owner with `dependencies`.
  App and registry source own named plugin-array kits after real reuse;
  package-local tuples stay private implementation details. A package grouping
  array is still the wrong owner even when it replaces a fake grouping plugin or
  saves repeated imports. Plate specs define product law, and runtime control is
  a separate proven job.
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
- Registry examples are teaching and copied-install surfaces, so an example
  keeps its explicit feature plugin, kit and renderer declarations even when an
  inherited plugin array such as `EditorKit` already installs that plugin,
  without installing a duplicate same-name runtime descriptor.
- A plugin that does not own another capability's membership in the consumer's
  final composition may use `override[name]` as a weak peer: adapt only
  an already-installed target, no-op when absent, never install or mutate
  topology, never disable a required dependency, and yield to the target's
  terminal configuration. This applies even when the adapting plugin can
  import the target. An independently optional plugin or kit must not install
  another independently optional peer merely to adapt it. Prove adapting-only,
  target-only, both, and both with explicit target configuration. Bare-name use
  is intentionally erased; exact target-option inference requires importing
  the descriptor or definition type. A weak peer may replace the target's
  root-level `component`. Keep component binding and typed foreign mapping contributions authored
  as `defineFormats(TargetPlugin, map)` inside the owning declaration callback
  as distinct paths. The
  format helper injects the target. Do not add a central plugin-name registry,
  ancestor reach-through methods, recursive child registries, or add/replace
  verbs.
- Plate rendering has one grammar. Root `component` owns node identity and may
  be a component or intrinsic HTML tag. `render` owns only DOM attributes and
  mark placement. `slots` owns structural composition around the root,
  content, container, Editable, node, and node children. Do not add an editor
  component map, nested component override map, tag alias, public renderer
  callback, or second structural namespace.
- Resolve peer conflicts at the smallest behavior surface. Remove or replace
  one conflicting shortcut, handler, parser, or render contribution instead of
  disabling its whole plugin. Required dependencies cannot be disabled, and
  one conflicting member does not become a public plugin without independently
  passing the capability-promotion bar.
- A concrete inferred editor exposes every non-empty plugin API through
  `editor.api.<name>` for complete autocomplete and agent discovery. Generic
  package code and exact raw Plite ownership use `editor.plugin(Plugin).api`.
  The root `api` is always a factory, including for context-free values; it
  receives one context object, and consumer configuration cannot replace it.
  Keep names human-readable. Resolve element `type` and property `key` from
  schema-owning portals or authoring context; use `name` only for capability
  lookup and namespaces. Do not root-merge implementations, add
  `getApi`/`pluginApi`, create API-name aliases, or move mutations outside
  `editor.update`.
- Generic code that accepts an optional descriptor checks
  `editor.plugin(Plugin).installed` before using its capabilities or resolved
  descriptor fields. Disabled plugins count as absent. Exact element and
  primary-mark portals expose `schema.type` and `schema.key`; behavior and
  aggregate-property portals omit `schema`. Nominal descriptor portals keep
  applicable schema getters non-optional, but absent or wrong-kind access
  throws. Never add optional chaining, non-null assertions, or a raw identity
  fallback. Do not infer plugin
  availability from root `editor.api`, node types, schema properties, caches,
  or caught access errors.
- A reusable plugin factory constrained to a required element or mark schema
  receives a non-optional flat `schema.type` or `schema.key` from
  `PluginAuthorSchemaView`; an optional handle is repaired there, never
  asserted, guarded or duplicated locally.
- `editor.plugin(plugin)` is the sole public imperative lookup, and `plugin`
  is a nominal descriptor. Exact configured descriptors and compatible
  ancestors resolve with exact inference; divergent siblings, foreign
  same-name descriptors, strings, and weak `{ name }` objects do not. Dynamic
  application input resolves through an application-owned descriptor map
  before lookup. Its consumer portal is the resolved
  descriptor view: descriptor fields such as `name`, `inject`, `render`,
  `initialState`, and `targetPlugins` sit directly beside scoped `api`, `read`,
  `update`, `store`, and `installed`. Never nest the descriptor under
  `portal.plugin`; callback authoring contexts alone expose the current raw
  descriptor as `plugin`, with `editor`. Format authoring uses its narrower
  static context. Use portal `.name` after lookup when the normalized
  plugin name is needed. Name every
  descriptor-aware API input `plugin`; call it `name` only after normalization.
  An absent descriptor exposes `installed: false`; capability, descriptor, and
  schema access throws. Reverse/container/render caches are private,
  public node questions use schema, injection is read from
  `portal.inject.nodeProps`,
  and format mapping uses one `registry` namespace.
- HTML mappings may prepare only their operation-owned inert document before
  matching. Whole-payload admission, source cleanup, RTF access, and
  post-decode repair belong to the browser `DataTransferFormat` lifecycle.
  Generic mapping hooks do not receive host payloads or live editor state.
- One plugin keeps all of its HTML matches in a single mapping, and a mapping's
  target order is membership, not construction intent. A `createsElement`
  mapping decodes bare content into the schema's default block when that block
  is one of its targets and writes its output around the HTML of its other
  targets; on parse, a matched element holding exactly one block its properties
  apply to decodes onto that block, and a text block they cannot apply to gives
  the created block its text. On paste, a throwing or schema-invalid candidate
  is reported through the lifecycle and delegates to the next candidate, while a
  direct parse call throws.
- A whole-payload format reports what a paste leaves out. The initiating
  editable delivers one result per paste its built-in formats handle; copied UI
  decides the presentation, and harmless cleanup stays silent.
- A `DataTransferFormat` decode returns a `ContentSlice` and its encode returns
  a string, or either returns `null` to delegate to the next format. Per-editor
  DOM plugin state resolves through its runtime owner, so mounted views read the
  activation's configuration instead of resolving it again at each caller.
- Multiple callers of one plugin operation reuse its plugin-owned API; they do
  not justify a parallel raw helper. Keep the algorithm in the plugin.
  Standalone functions need a real cross-plugin, cross-layer, or
  transaction-composition job that one plugin cannot own honestly. Tests,
  barrels and old public exports are not extra owners or reuse evidence for a
  separate helper, and a surviving transaction-accepting cross-plugin helper
  takes `tx` as a required parameter.
- Express intra-plugin capability dependencies through ordered builder stages.
  The constructor publishes the smallest honest `api`, `read`, or `update`
  capability whenever possible; later stages and required dependents consume the
  accumulated inferred surface. New scoped methods take domain inputs instead of
  threading `editor`, `api`, `read`, `tx`, resolved plugin store values, or
  resolved plugin types through helper signatures; operation options remain
  valid domain input. A later update stage reuses an earlier mutation through
  `tx.plugin(Plugin)` when it owns that descriptor or `tx.plugin(pluginName)`
  across an intentionally decoupled package boundary. Never index the
  transaction object with a runtime plugin name or call a portal one-shot that
  opens another transaction. Do not publish a private implementation fragment
  merely to share it between stages: keep it lexical/private, coalesce stages,
  or name a builder gap. Keep an explicit active-state boundary only when
  uncommitted transaction semantics require it, and prove that case rather than
  falling back to stale `editor.read`.
- A contribution from an earlier author stage is available to a later
  `.extend()` stage, never to `.configure()` callbacks, which run before author
  stages. A shared stage factory never takes the current descriptor only to
  recover inference; the direct `.extend()` call binds its owner context.
- Do not export one-off structural editor, API, or capability-subset types to
  cap TypeScript expansion. Capture editor-owned context in the plugin owner or
  store the domain value the operation consumes. Recursive honest types are an
  owning generic or declaration-boundary bug, not a public API concept. A
  public capability interface needs a real independent implementation or
  substitution job and its own semantic owner.
- Plate code calls typed Plite editor APIs directly; a local structural type or
  type guard around one is a typing bug in the owning API.
- Keep dependency sources compact and exact so package declaration emit does
  not serialize installed graphs. A remaining TS7056 failure belongs to the
  owning generic or declaration boundary; it never earns a new package-local
  staging API. Existing exact stages may keep a broken build green while that
  owner repair is active, but they are tracked debt rather than accepted
  architecture and must be deleted before a package review closes.
- This file owns Plate React and component law, and `plate-ui` owns the method
  that applies it. Start with one direct `<Family>.tsx` component family
  containing subcomponents, variants, render helpers, local state, and simple
  local hook calls. Add at most one `use<Family>.ts[x]` semantic controller when
  multiple family members or surfaces share real lifecycle; a reusable
  controller lives there, and plugin descriptor files never define named custom
  hooks. Complex siblings may consume one private family context, and when
  several independent registry items need the same interactive family, the
  package publishes a semantic compound component with that private context
  instead of spreading controller state into siblings. Do not create
  state-hook/prop-hook pipelines, one custom hook per subcomponent, public
  prop-bag hooks, speculative providers/stores, small component factories/HOCs,
  or `forwardRef`; Plate React code targets React 19.2 or later and keeps no
  React 18 compatibility code. A separate state owner needs independent
  lifecycle or cross-family reuse.
- A feature's `lib` source owns the semantic core of transforms, queries,
  schemas, serialization, controllers and command and state contracts, and its
  `react` source is a thin adapter. Cross-platform reuse lives in those command
  and state contracts below JSX, never in package-owned shadcn composition or
  renderer-specific React hooks, and a package React hook that mainly returns
  renderer-specific UI props or state is debt, not precedent.
- A React entrypoint may publish a headless primitive when reusable DOM behavior
  and accessibility are the contract. The entrypoint owns interaction mechanics
  and positioning or hit-testing required for correct behavior; copied
  registry UI owns visual styles, labels and product composition. The editor
  feature owns document constraints and persistence; generic DOM primitives
  remain editor-independent. Internal providers, stores, and prop hooks stay private.
- Provider consumers receive semantic editor state or an exact mounted DOM
  reference. Provider lookup, atom and field tables, generic field setters and
  controller lookup handles stay private when their only job is lifecycle
  implementation, and the owning component configures lifecycle policy through
  the existing provider. `useEditorContainerRef` identifies the `EditorRoot`
  container, not the exact Editable view.
- A copied positioning primitive owns placement readiness across every
  supported provider. It may publish one `onPlaced` callback when a current
  composition must sequence autofocus or another write after real anchor
  geometry exists. The composition keeps readiness private; timers, polling,
  duplicate geometry state, and global selection-scroll suppression do not
  replace the lifecycle signal.
- Copied controls keep focus in their exact mounted editor context, and a
  model-scoped plugin command may clear state without owning the caller's focus
  target. A copied dropdown item owns the final focus intent of its selection,
  the menu content keeps only the fallback, and cancellation or explicit focus
  suppression wins.
- Recurring editor-state projections belong to the existing semantic React
  owner. Presence-only controls use `useEditorHasSelection`; range consumers
  use `useEditorSelection`. Keep commit invalidation private and reuse the
  existing subscription, without adding a parallel store or arbitrary predicate hooks.
- Hooks and selectors subscribe only to values that affect render; an event
  handler, command or delayed callback reads callback-only values from
  `editor.read` or `editor.api` when it runs. Controls that call semantic plugin
  commands use the typed portal without subscribing to its store, and deferred
  input execution stays in the copied input owner, so mounting another button
  cannot start or clear a search. React context whose provider value changes
  with editor state counts as a subscription in the repeated-unit budget.
  Controller facades that rename plugin commands or package selectors with
  copied UI effects are deleted.
- Copied feature kits install their required React integration. Ordinary
  editor assemblies render EditorRoot and Editor without feature-root mounts or
  feature-only ref plumbing. Plate supplies the exact Editable ref through
  its existing root slot; copied feature policy stays in the kit. One AI
  session owns one editor object across mounted views, while DOM cleanup owns
  each Editable and its ownerDocument. Readiness, read-only changes,
  replacement, and final detach define asynchronous authority. Replaceable
  sibling presentation preserves the feature plugin's root integration.
  Explicit root-slot replacement owns integration and cleanup; additional
  wrappers compose through JSX in that slot. Each slot accepts one component.
  A companion plugin needs an independent capability beyond protecting a root
  wrapper from replacement. Block drag and drop is native. A handle calls
  `editor.api.dom.drag.start`, the Editable resolves each drop and runs
  `editor.api.transfer`, and the kit paints `useDropIndicator`. It needs no
  provider, manager or backend. Copied handles follow the schema: every
  selectable block-content element gets one, at any depth, and only the
  innermost hovered one shows; copied UI never lists plugin types or depths. A gesture the browser does not drag natively,
  such as touch, gets a pointer driver over `resolveDropTarget` and
  `editor.api.transfer`. Keep optional SDKs and backends out of generic editor components,
  and keep dedicated render-attribute hooks private to their existing host.
  Do not provide a generic plugin hook runner or session framework.
- Dropped files land through the React `UploadPlugin` with `nativeDrop` and the
  `files` option of `resolveDropTarget`, so file landings pass the same landing
  rules and a refused landing inserts nothing. Move up and Move down step the
  selected blocks among their siblings through `editor.api.transfer.move`, and a
  step whose blocks span parents refuses.
- A copied feature with mutually exclusive external backends keeps one
  provider-neutral base item and exposes each supported backend as an explicit
  installable provider item. The provider item owns its adapter, route,
  environment contract, and provider dependencies; common gateway security and
  access policy stay in one shared support owner. Browser-local demo storage is
  an explicit provider choice. Do not hide a backend in the base item or select
  among providers through one route's runtime environment.
- Serialization packages own format semantics, conversion mechanics, and
  format-required defaults. Copied registry or application source owns optional
  export presentation presets. An exporter may accept one exact caller-owned
  stylesheet, but it never injects a hidden Plate theme or defines an additive
  override protocol around package styling. An asynchronous document export
  captures one complete editor revision before its first await; visible output,
  diagnostics, and any format-owned retained source or native artifact all
  derive from that capture. A semantic interchange format carries hidden native
  state only for a proven current job with one unambiguous authority; exact
  state otherwise uses canonical persistence. A format that cannot represent an
  unresolved conflict returns an explicit diagnostic or failure instead of
  inventing review markup.
  Every serializer accepts one complete document and returns format data with
  structured diagnostics. Authored projection is an option on the ordinary
  format operation. Editor methods reuse compiled editor configuration;
  detached operations compile supplied declarations without activating plugins
  or constructing an editing runtime. Like `createEditor({ plugins })`, a
  detached operation types its document as broad `Value`; exact document types
  belong to opt-in generated editor types. Semantic HTML stays separate from styled
  static React output. Feature-owned structural plain-text mappings back both
  explicit serialization and clipboard egress without changing model-offset
  text reads.
- A format export reads comment attachments from the model or proposed view,
  never through a mounted projection, and the format owner projects those
  canonical coordinates once for accepted, proposed or review output.
- Conversion verbs follow the operation law. Text syntax uses
  `parse`/`serialize`; file and package workflows with artifact lifecycle use
  `import`/`export`; `encode`/`decode` is reserved for a typed paired
  representation with explicit direction laws. A complete document is the
  default parse target, while slice and inline carriers keep explicit suffixes.
- Code-block commands construct schema-valid code nodes directly, preserving
  their distinct insert/upsert selection policy without exposing an intermediate
  default type. Optional JSON prettifying belongs to copied UI and edits the
  canonical text through Plite. Syntax readers do not mutate a caller's
  highlighter; copied native and static kits register their parser resources
  before use.
- Independently placed DOM parts are independent primitives with ordinary DOM
  props such as `className` and `style`. They compose as siblings; a public
  root or `*ClassName` control prop requires a real shared lifecycle or state
  job.
- A headless primitive takes flat props, not an `options` object bag, and
  polymorphism such as `as` or `asChild` is public only when production
  consumers use it. A headless package that portals lifecycle-owned DOM outside
  the consumer's tree owns that element's semantics, positioning, hit testing
  and accessibility, and exposes at most one truthfully named presentation
  channel for a current customization job. The consumer applies literal product
  classes through that one presentation channel; reject descendant selectors
  that cannot reach the portal, package-owned brand tokens, duplicate portals
  and directional or unused styling knobs.
- When one hook mixes durable DOM lifecycle with renderer composition, split
  it. Keep only the subscription, imperative DOM projection, and cleanup in the
  package; a side-effect-only adapter takes its required lifecycle input and
  returns `void`. The copied renderer derives layout/presentation state and
  owns transient rendering overrides, trivial visual calculations and
  presentation event wiring. Domain invariants, semantic calculations and
  neutral interaction lifecycle belong to their existing feature owner even
  with one current consumer. Package ownership requires a durable contract
  independent of the renderer, not a minimum caller count or a hypothetical
  native counterpart. Prefer the feature's scoped API over helper exports.
- Unused returned fields, exported result types, optional fallback inputs and
  callback props of a renderer hook are hard-cut evidence, not reasons to keep
  the bag.
- Measure React ownership at terminal product consumers, not at package-wrapper
  imports. A hook, store, provider, hotkey controller, or plugin stage used
  only by copied registry UI is registry-owned when its job is UI or product
  composition. Package publication requires independent terminal consumers or
  a durable headless semantic, DOM, or accessibility contract. Siblings inside
  one component family are one owner, not reuse.
- A package import, public export, docs page, test, metadata entry or prior item
  identity is not an independent terminal consumer, and after a feature moves,
  each retained copied file and registry item is recounted by its terminal
  production consumers. A public headless hook exposes one terminal consumer
  job, and adapters used only to build it stay out of the package entrypoint. A
  second convenience component or lower-level hook beside the selected terminal
  API needs its own independent consumer job.
- Keep feature React roots flat by default. A nested component/hook
  directory earns its keep only as a real public subsystem with multiple
  cross-family owners, not as taxonomy or a response to file size.
- A package component mounted only by its own plugin, including an auto-mounted
  or effect component, is implementation and stays out of the package entrypoint
  unless independent consumers render it directly; a separate source file never
  grants public API ownership.
- Inline a locally owned component prop shape at its component signature.
  Same-file reuse does not earn a named prop alias. Keep one only when a real
  cross-file or published entrypoint consumer requires its export, and never
  export it merely to avoid inlining. Honest domain and state contracts may be
  selected inside the inline shape; do not flatten them into duplicated prop
  structures.
- An exported registry component defines a small Plate-owned prop contract and
  keeps primitive-library types such as Radix, Base UI, Ariakit or React Aria
  inside its implementation.
- Treat each registry item as a source-distribution owner. Colocate integration
  behavior with the component or kit it modifies, even when that requires an
  explicit optional package or registry dependency. Never create a shared
  integration grab bag for dependency-graph aesthetics; extract only a coherent
  capability, durable behavior owner, or real runtime-cycle boundary.
- A copied feature file owns its kit and every renderer, family-only component
  and helper used only by that feature, including a large icon set, constant
  table or output helper, and file size never creates an install boundary. A
  sibling file survives only for an independently installable component, the one
  semantic controller, a component shared across features, or another durable
  boundary with its own consumers. Sibling live and static renderers duplicate
  presentation lookup data and label helpers instead of sharing a third registry
  file, which earns its place only by owning real behavior beyond labels, menu
  data or copy.
- A static registry item owns real static presentation source. Package-default
  omission, null rendering, or fallback configuration stays on the base plugin
  and aggregate static kits compose that descriptor directly.
- A static renderer reads the rendered document through its `editor` prop, never
  an editor captured when its plugin was created. Static rendering reuses a
  block while it and every earlier block keep their identity and the decorations
  inside it stay value-equal, so a plugin whose element reads later content,
  such as a table of contents, declares `render: { readsDocument: true }`
  instead of disabling reuse. Feature presentation reads take the known path, as
  in `read.list.ordinal(path)` and `read.cell({ at: path })`, instead of
  resolving a node, which indexes a document view.
- Derive required package and registry-item dependencies from each copied
  item's resolved source graph and the package DAG. Authored registry metadata
  owns only installation policy that source cannot express: intentional
  bundles, targets, styles, CSS, optional peers, and provider selection. Build,
  preview, docs, source checks, and installers consume one generated metadata
  snapshot rather than reconstructing or hand-listing those facts.
- Copied Plate registry source installs into one flat `components/editor`
  namespace; `components/ui` remains the selected shadcn primitive layer.
  Feature files and item ids use the feature name, while app-owned plugin-array
  exports use `FooKit`, including one-descriptor features. Keep presentation
  (`editor.tsx`), static presentation (`editor-static.tsx`), live composition
  (`plugins.ts`), and static composition (`plugins-static.ts`) separate because
  their client/server and dependency cycles are real. Primitive-library variants
  resolve at install time, expose one editor-facing contract, and write to one
  target; never ship runtime base switching or variant-only shared helpers. An
  independently useful sibling in that namespace takes its family prefix, such
  as `media-image`, instead of a feature folder or a bare name. Independently
  installable registry UI never imports host editor types, `editor.generated`,
  editor-definition modules or root plugin namespaces; generated bindings appear
  only in the host app.
- A copied renderer file or registry item never takes an implementation-role
  suffix such as `-node`, and aggregate kits compose the semantic feature
  owners. Live and static source publish as separate `foo` and `foo-static`
  items, never one install item that bundles both environments, and a `base-kit`
  filename or item never encodes static ownership. `editor-kit` is a registry
  item name, not a runtime API noun or an application type owner.
- The reusable presentation component in `editor.tsx` is `Editor`. A complete
  block-owned `rich-text-editor.tsx` that creates the editor and mounts
  `EditorRoot` is `RichTextEditor`. When a reusable primitive and a complete
  composition collide on one noun, the primitive keeps its established semantic
  name and the composition is named after its higher owner, so the stable
  presentation component is never aliased or renamed to `EditorSurface`,
  `EditorContent` or another implementation-role noun.
- Plate registry provider support is explicit and narrower than any upstream
  preset catalog. Base is the default; Radix remains explicit. Build docs and
  primitive-agnostic items once. A provider variant exists only for a named
  reusable UI boundary with complete installed graph proof. Every public item
  resolves through every supported provider; repair coupling at the smallest
  direct owner instead of filtering an item or cloning its assembly.
  Unsupported provider/style routes fail closed. Preserve semantic item ids and
  materialize same-style Plate self-dependencies at the request boundary.
  One environment-neutral compiler emits every public directory, canonical
  payload, sparse provider overlay, index, metadata, manifest, payload hash,
  and generation marker. Publication exposes the marker last; request-time
  readers reject mixed, missing, or corrupted generation members.
- Nova is the default registry style, and each supported style materializes from
  a pinned upstream transform as a sparse logical overlay on the one Base and
  Nova canonical graph, never as a physical graph per provider and style. A
  style stays supported only while it produces installable output for the
  complete public semantic registry, and maintenance-only items are not exempt
  from the supported-provider floor. Shadcn's install-time `asChild` and
  `render` transform is valid provider resolution, so a Plate adapter exists
  only when Plate owns behavior, focus or props that the transform does not
  normalize, and only a website-only isolated preview selects author-source
  variants at runtime, outside copied registry output.
- Root `ListPlugin` owns list schema, transforms, format mappings, React behavior, and
  copied registry UI. Do not create a parallel persisted list model or an
  alternative registry graph.
- Preferred ecosystem path is npm package distribution plus local app
  composition and registry usage for development.
- If you build a plugin or component pack, host and maintain it in your own
  repository.
- The bar for adding optional capability to core is intentionally high.
- New app-specific components should usually live in your own app or registry,
  not in core by default.
- Core UI additions should be rare and require broad demand, clear reuse, or a
  real API reason.

## Public API and plugin doctrine

- If work touches a reusable public/editor-platform API, use root `VISION.md`
  and this file first, then use `best-api` to choose or review the call shape.
- If work touches runtime/service-boundary architecture, use root `VISION.md`
  and this file first.
- If work is ambiguous between reusable API design and implementation, route
  API shape to `best-api`; route adoption and implementation to the layer
  owner after the target is clear.
- If the public pattern is settled and the task is plugin execution, hand off
  to `plate-plugins`.
- App-local convenience, one-off demos, and package-local mechanics do not need
  doctrine unless they create a reusable public pattern.
- Every lane that introduces or materially changes a reusable public API,
  runtime boundary, builder/factory pattern, or plugin contract must include
  root/detail vision updated or reaffirmed evidence.

Owner map:

| Concern                                              | Owner                                     |
| ---------------------------------------------------- | ----------------------------------------- |
| public GitHub issue/PR/security queue control plane  | `maintainer`                              |
| local Plate/Plite behavior-bug or regression repair  | pstack Bug fix playbook, via `verify` |
| internal Plate/Plite long quality loops              | pstack Autonomous run                     |
| performance measurement, diagnosis, and fix/rerun    | `benchmark`                               |
| post-merge/current-tree until-clean closure          | the Babysit playbook                      |
| reusable architecture doctrine                       | root `VISION.md` and `docs/vision/*.md`   |
| durable public API doctrine                          | root `VISION.md` and `docs/vision/*.md`   |
| concrete public API design and review, ranking debt on the architecture reference's P0 to P3 scale | `best-api` |
| Plate API adoption, rollout, and proof plan          | the Plan playbook                                 |
| runtime/service-boundary patterns                    | root `VISION.md` and `docs/vision/*.md`   |
| layering / ownership law                             | root `VISION.md` and `docs/vision/*.md`   |
| performance/scalability law                          | root `VISION.md` and `docs/vision/*.md`   |
| anti-pattern catalog                                 | root `VISION.md` and `docs/vision/*.md`   |
| plugin file placement / wrappers / typing mechanics  | `plate-plugins`                    |
| plugin authoring execution flow                      | `plate-plugins`                    |
| app-local sugar                                      | local app/kits                            |
| public docs shape                                    | Plate Docs; `pstack:technical-writing`    |
| UI/component registry shape                          | `plate-ui`                                |
| Plate Next migration/adoption audit                  | `plate-next`                              |

## Matcher extraction heuristic

When scanning a reusable API family, aggressively inspect repeated `resolve()`
and `apply()` bodies before inventing more package-level wrappers.

Pull into core when repeated logic is mostly trigger gating, collapsed-selection
gating, block-start / text-before lookup, delimiter / prefix / regex matching,
range or payload construction, or other feature-agnostic editor-state
inspection.

Keep local when repeated logic is mostly node creation, mark toggling, list
transforms, link validation or insertion, equation insertion, code-block
insertion, or any semantic transform owned by a feature entrypoint.

Core owns matcher primitives and shared input-state access. Feature entrypoints
own semantic apply behavior.

## Plite Boundary

Plate is built on top of Plite.

If the same issue happens in plain Plite without Plate-specific code, it belongs
there.

Plite owns neutral substrate laws; its current API must still earn reuse under
[Redesign from First Principles](common.md#redesign-from-first-principles).
When its primitive fits the job, cut conflicting Plate machinery and reuse it.
When it is inadequate, repair Plite and adopt that target in Plate. Keep product
policy in Plate and do not hide either problem behind aliases or caller glue.
For collisions with established runtime names such as `api`, `read`, `update`,
`state`, or `tx`, cut or rename the Plate API when the substrate contract fits
the current job.

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

Generated or inserted document content is a temporary draft until applied.
Streaming and previewing preserve the user's editing intent and leave document
history untouched. Apply uses one ordinary transaction under the current
intent; discard releases the draft and its mapped targets without undoing other
work. Copied UI owns purple draft presentation and the stream indicator.

AI selection edits stream into one request-owned native suggestion. They remain
visible in an Editing view with markup projection without changing how later
typing is authored. Accept or Discard decides that suggestion through the
native authored owner; Stop retains the received proposal for review and retry
rejects it before replacing the request. The installed Markdown mapping parses
the accumulated response; generated document nodes are never serialized back
into the input stream.

Streaming Markdown parses previews with `partial` and continues the prior result
of the growing source with `previous`, for previews and the strict final parse
alike. The Markdown runtime owns reuse and invalidation, so consumers keep no
parse cache, transport joiner or chunk heuristic. A read-only preview renders
its result as `EditorStatic`'s `document` without editing an editor, and only an
editable target publishes, replacing from the first changed block by node
identity, or the whole value when no leading block is unchanged.

Generated feedback becomes an ordinary published comment thread as soon as its
creation completes. It uses the normal thread controls rather than a second AI
approval lifecycle. An unresolved asynchronous creation stays private and
request-owned so cancellation can discard it safely; Stop, close, retry and
request replacement preserve every completed comment.

Closing the session discards unapplied document output and cancels its request.
Stopping generation retains the received document draft for review. Request
ownership covers transport callbacks, mapped targets and unresolved comment
creation; stale work cannot affect a replacement request or unrelated comment
drafts. A deleted target cannot fall back to another document location, and an
outside click that chooses another destination keeps the user's new selection
instead of restoring the invoking caret.

## Setup

Plate is code-first by design. Users should see plugin definitions, editor
schema, serialization boundaries, and component ownership up front.

The ordinary path is runtime-first: export one app-owned plugin kit and optional
schema, then map them directly to the `plugins` and `schema` editor options.
That schema owns its `id` and `version`; do not duplicate lineage in
`schemaIdentity` or a generator-only definition. The CLI/schema generator is
optional advanced tooling for exact static contracts and artifacts, and CI
checks committed generated contracts with `plate generate --check`. Improve
onboarding through templates, docs, and registry flows without hiding critical
editor decisions. Both exports carry human-readable names, and the kit is a
readonly plugin array.

`platejs/compiler` serves that optional build-time job. `compileEditor` returns
detached, recursively frozen schema and binding facts through the same lowering
used by editor construction. It evaluates configuration and validation without
activating plugins or generating an initial document. CLI discovery, source
paths and emission stay in the CLI. Type-only compiler projections preserve
exact installed property domains without publishing runtime caches or witnesses.
A type-only projection needs an actual tooling job whose exact property domains
the public descriptor types cannot express, and it reuses the same inference
owner.

A copied default editor kit owns plugin composition, not the registry author's
persisted document lineage. Do not ship a fixed schema ID, migration chain, or
historical fingerprints beside reusable `EditorKit` source. The real host
persistence owner chooses its stable identity and migrations; a dedicated
migration example may teach the complete advanced path. Generated contracts
derive current schema types without turning that derived schema into persisted
application identity.

## What we will not merge for now

- Refactor-only PRs with no concrete user, API, or docs value.
- Fixes for bugs that reproduce in plain Plite without Plate-specific code.
- Public PRs that change user-visible behavior without real behavior proof.
- Issues or PRs that are too incomplete for a local maintainer Codex run to
  reproduce, route, or review from public context.
- Core UI/components that are app-specific, one-off, or design-opinionated
  without broad reuse.
- Optional plugins/features that can live in explicit `platejs` entrypoints or
  app-local code.
- Convenience abstractions that hide editor ownership, schema design, or trust
  boundaries.
- Large framework detours that dilute the Plate-on-Plite model.
- Heavy AI-specific orchestration in core when the existing plugin/entrypoint
  surface is enough.
- Full-doc translation sets beyond English and Chinese for now.

Strong user demand and strong technical rationale can change this list.
