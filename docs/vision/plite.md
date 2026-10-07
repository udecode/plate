# Plite Vision

Plite is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, canonical changes, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plite doctrine after the lane is selected.

## Plite Source Order

1. Active plan.
2. Root `VISION.md`, then this file.
3. Plite package source/tests/benchmarks in this Plate checkout:
   `packages/plitejs`, `packages/test`, `packages/plitejs/src/yjs`,
   `apps/plite/tests/plite-browser/**`, and `benchmarks/slate-v2/**`.
4. This file's Plite Browser And Behavior Proof section and the active plan for
   accepted claim width.
5. `benchmarks/targets/slate-v2.json` for perf target authority.

Plate repo root commands are the current Plite runtime authority. Do not use a
donor checkout as proof after the transplant.

## Plite Rules

- Preserve Plite's simple document model and canonical `DocumentChange` as the
  sole mutation and commit truth. Transactions construct canonical changes
  directly; React does not define the core ontology.
- Public API should teach `editor.read`, `editor.update`, `state`, `tx`,
  plugin groups, commit listeners, and decoration sources.
- `<EditorRoot decorations>` is the sole raw Plite input for transient inline paint.
  A source returns keyed ranges with `className`, `style`, `aria-*`, or `data-*`
  attributes and may observe an external owner for targeted node-key refresh.
  `Editable` renders the result without another callback. The owning feature
  adapts resolved annotations into decorations only when it needs inline paint.
  Output endpoints without a root belong to the view that read them; output
  naming another root paints nothing. Canonical coordinates from an external
  owner, such as awareness selections, address the primary root when rootless,
  so their source emits them only through a reader of their own root.
- A decoration read depends on its entry, the nodes inside it and the state its
  source observes, in live and static views alike, so a source decorates where
  it reads. A source that paints a container's text reads the container entry
  once, returns ranges for its descendants, and returns early for other nodes
  before it touches plugin state. A source reads its state through the read
  context instead of resolving plugins or stores per node.
- React components create one annotation index under each exact mounted view
  with `useAnnotationStore` and pass its typed reader explicitly. React
  components read that index through `useAnnotation(store, id)` or
  `useAnnotations(store)`. Framework
  adapters with an independent lifetime use the owned result of
  `createAnnotationStore` from `plitejs/annotations`. Keep that constructor out
  of `plitejs/react`, reject generic annotation providers and implicit empty
  readers, and reject public `/internal` bridges. A framework owner is never
  forced through a hidden component merely to reach a React annotation hook.
- A render-owned disposable source, such as a `useAnnotationStore` index or the
  root decoration manager, survives React Strict Mode effect rehearsal and is
  destroyed only on a real replacement or unmount.
- Plite stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Legacy parity classifies each legacy behavior as copied, improved or rejected instead of copying legacy internals.
- Do not make child-count chunking foundational again.
- Plite supplies typed plugin identity, composition, publication, and
  inspection. It does not supply a behavior-profile DSL.
- `Plugin` carries one exact normalized definition. `name` is
  descriptor identity; `type` is serialized node identity. The public
  descriptor-definition grammar is `definePlugin(name, definition)` with no
  caller generics. Its private typing may
  infer a small dependency environment beside the author input when TypeScript
  needs that split for contextual callbacks; do not expose it or pretend one
  self-referential generic can infer everything. Reject excess fields and
  preserve the definition through a private invariant witness without leaking
  raw callbacks into declarations. The required positional name is lower camel
  case and human-readable; a different serialized identity belongs in `type`.
- A native constructor whose options change its exact descriptor capabilities
  carries that input-to-output relation through `plitejs/internal` so an owning
  adapter can derive the result without copying capability groups or overloads.
  The carrier is not a public factory-definition grammar or an installable
  value.
- Public roots expose author contracts, not `Any*`, `Internal*`, compiler and
  normalization graphs, accumulators, or witnesses. An unparameterized editor
  exposes only guaranteed Core capabilities; package consumers carry concrete
  editor or plugin generics. Every `plitejs` entrypoint calls its public
  runtime type `Editor`; private layered carriers do not create public branded
  editor variants. An export with no author job is a framework hook and is
  exported only from `plitejs/internal`.
- Public editor capability generics default to the core-only `readonly []`
  tuple, and a bare default `Editor` parameter names that one concrete tuple,
  not an existential runtime boundary. Package code never compiles by defaulting
  `Editor` or its `read` and `update` surfaces to `any`. Only named internal
  `AnyEditor` boundaries erase the installed tuple.
- Root `PluginDependencyReference` is a shallow, non-generic identity
  value with `name` and optional `enabled`. `PluginTypeProvider` is the sole
  public descriptor-to-installed-capability bridge. Its higher-kinded encoding,
  normalized installed-capability carrier, and transitive dependency expansion
  stay in `plitejs/internal`; they do not recursively materialize exact dependency
  ancestry.
- Heterogeneous installation inputs use the nominal `PluginReference` and keep
  exact schema and callback projections deferred at that boundary, with
  unchanged inference and negative capability checks. Normalized definition
  witnesses describe capabilities, not installable values.
- Descriptor identity and installed state are distinct. Raw `definePlugin`
  descriptors retain frozen normalized author fields, while editor creation
  snapshots them into private installed records. Plate publishes its compiled
  definition through the same internal input. Registry topology binds direct
  nominal descriptor references and eligible source ancestors to one record;
  names remain diagnostics and schema keys rather than dependency identity.
  Portal code reads that record's owner-bound capabilities without raw/Plate
  kind dispatch, global aliases, or replacement descriptors. Dependencies and
  conflicts validate by direct nominal reference.
- Schema is the sole first-party AST-shape truth. Plite derives exact root,
  child, text/property, default/requiredness, named-root, recursive, and
  open-world value types; Plate lowers its installed plugin graph into that
  compiler once. Normal Plate code infers `Editor` through `platejs` creation
  and uses the existing `ValueOf`/`ElementOf`/`TextOf` extractors, never a
  parallel value generic or central node map. Raw schema-less Plite may still
  own an explicit `createEditor<ExternalValue>` generic. Feature aliases may
  name an inferred owner result but never restate schema fields. Property-only plugins do not
  become element identity handles; Plate may project their compiled property
  capabilities onto broad elements or text while preserving aliases, prefixes,
  defaults, and exact value domains from Plite descriptors.
- Ordinary domain code reads properties directly from typed nodes, as in
  `node.indent`, and generic plugin code destructures the exact property handle
  from callback `schema`. `SchemaElementHandle` and `SchemaPropertyHandle` serve
  generic construction, matching, format mappings, inspection and typed property
  reads.
- Ordered required child positions and their literal property values belong to
  the compiled content grammar, including construction, admission, fitting and
  saved identity. App corrections do not maintain a second document shape.
- Required child positions use `schema.content.prefix` followed by one ordinary
  remainder. A complete schema declares `root: SchemaContent` directly and its
  named `roots` map each name directly to `SchemaContent`; an omitted `elements`
  means `{}`, an omitted `unknown` means "reject", and open vocabulary requires
  an explicit "preserve". `schema.element.textBlock()` is the standard editable
  text-plus-inline element, and every other non-void element spells its content
  grammar explicitly.
- A document's top level is `children`, `meta` and `roots`. Every load path
  reads the caller's raw object and refuses any other top-level field instead
  of dropping it; a direct snapshot adds `selection`, and a persisted envelope
  is `document`, `schema` and an optional `selection`. Application data belongs in `meta`,
  and a stored top-level field moves there through a migration step. Because
  readers refuse unknown keys, a new top-level document field breaks every
  older reader, so Plite adds one only with a doctrine change and a migration.
- An unvalidated `property.json()` value is `EditorJsonValue`, and a narrower
  value type requires a runtime type predicate and a `validationVersion` on the
  property. Property meaning belongs to placement: `role: "metadata"` goes on
  the `elementProperty` or `textProperty` placement, never on the reusable value
  descriptor.
- Pure value predicates must honor the base model type they promise.
  `ElementApi.isElement` owns editor exclusion, the `children` array, and the
  required string `type`; `deep: true` additionally checks descendant shape.
  Structural ancestor checks stay distinct. Schema assertions own complete
  vocabulary, property, and content-grammar validation.
- Schema runtime verbs are `schema.create`, `schema.assertDocument`,
  `schema.assertFragment` and `schema.isMarkableVoid`, and assertions accept
  `unknown` and narrow it only on success. Raw Plite schemas use
  `schema.handle.*` handles. Plate callers pass the descriptor directly to
  `create`, `allowsElementType` and `isElementTypeInGroup` and never add a Plate
  plugin handle wrapper.
- Static portals require a unique literal name and mutually assignable
  descriptor/installed capabilities. Runtime portals require the installed
  descriptor or a compatible source ancestor, so a same-name object is not an
  interchangeable token.
- React creation and context retrieval are separate jobs. `useEditor(options,
deps?)` owns one editor for a component lifetime. `useEditorContext()` and
  `useOptionalEditorContext()` retrieve the mounted contract without caller
  generics, and selector hooks infer only their selected result. Exact
  plugin capabilities come from `editor.plugin(Plugin)`.
- A DOM-scope hook accepts only the DOM capabilities it reads, and an
  identity-only registry uses object keys. Neither requires an erased mutable
  `Editor`, whose unrelated write variance can reject a correctly inferred
  document. Proof keeps the inferred editor instead of widening fixtures or
  casting callers.
- A public `EditorRoot` requires an editor and owns one independent mounted
  view. Its root, authored, and read-only inputs configure that view through the
  existing view owner. Replacing the editor requires a keyed remount; changing
  the root retires queued work and commands from the prior view before
  descendants observe the next one. Nested same-document roots may share the
  nearest private provider while retaining independent mounted views. An
  element-owned content root mounted by `Editable` paints its owner's decoration
  sources and follows the owner's authored mode through its own view, observers
  and selection. Any provider that owns subscriptions, caches or callbacks binds
  one runtime owner for its mounted lifetime; a justified live replacement
  retires every owner-bound resource atomically before publishing the next
  context, and resetting selected caches is not a lifecycle.
- Public generics must correlate with a typed input, installed descriptor, or
  descriptor-owned runtime validator. Update callbacks expose only installed
  transaction groups; commands infer from their descriptors; raw schema
  property names return `unknown`; collaborative metadata remains `unknown`
  until its installed plugin validates it. Never let a method-level generic
  manufacture a capability or choose a result type.
- Concrete editor `read`, `update` and transaction-builder callbacks stay
  contravariant, so an explicit annotation cannot manufacture an uninstalled
  capability. Exact plugin tuples stay invariant and erase only at named
  internal runtime boundaries. The direct `update.selection` group holds
  selection mutations only.
- Low-level React composition receives the actual DOM dependency as
  `react({ dom })`. Its implementation may erase exactly one invariant-union
  boundary when TypeScript 7 cannot reduce it; the public call stays one exact
  object with no caller generics.
- A layered editor projects each installed plugin graph once and never
  intersects an editor with a whole `ReactEditor`, `DOMEditor` or sibling
  layered surface it already carries; a genuinely missing shallow capability is
  added at its owning layer. A generic editor helper types its input from the
  smallest `read`, `update`, `api` or subscription capability it consumes, and a
  helper that returns a view of its input, such as a root-scoped view, keeps the
  complete layered caller type in its public signature. A helper never infers
  one provider to rebuild a whole raw or adapter-branded editor, and it erases
  types only inside its named runtime implementation.
- `DefinitionOf<typeof FooPlugin>` is the sole public definition extractor;
  name the alias `FooDefinition`, never `FooConfig`. True domain/runtime
  config types remain valid.
- Store and binding inference is proven in one compile-only fixture that passes
  inferred document data, an installed plugin and their independently inferred
  payload in the same call, and rejects arbitrary runtime objects and unknown
  payload fields.
- Layering beats feature buckets: document truth, DOM transport, React runtime,
  browser proof, projections/services, layout, lightweight surfaces, and
  productization need clear owners.
- The `plitejs` root is DOM-free and headless: `plitejs/dom` owns DOM codecs and mapping, and `plitejs/react` owns rendering, input import, native selection export, projection and DOM repair. `tooling/entrypoints/entrypoint-dag.mjs` declares that direction (`root: headless(root())`), `tooling/scripts/entrypoint-dag-plugin.test.mjs` enforces it, and `pnpm plite:release:packages` executes every headless entrypoint without React or DOM.
- Browser proof instrumentation is opt-in. `installBrowserHandle()` in a test
  or development entry attaches the page handle and keeps the kernel trace;
  production bundles carry neither.
- Proof handles, traces and debug globals never attach on every mount, and the
  library never gates them on `NODE_ENV`. A harness transport, such as how a
  paste is delivered, is validated project configuration: call sites never
  branch on the engine, and a transport that does not take effect fails instead
  of retrying another way.
- Fast paths follow material behavior, not installed-handler or renderer
  presence. The owning runtime publishes internal capability, unknown behavior
  fails closed, and ordinary applications never opt into correctness with a
  performance flag.
- Pagination is view-owned derived geometry, not core editor truth. Its mounted
  paged component owns live measurement, page surfaces, omission and scroll
  stability; active caret, selection and composition stay on the native/browser
  editing path. Independent headless measurement is a separate one-shot job.

## Plite API Direction

- Plite uses `editor.read(fn)`, direct `editor.update.group.method(...)`,
  configured `editor.update(policy).group.method(...)`, and atomic
  `editor.update(policy?, fn)` as the public lifecycle.
- A single read or write uses its direct one-shot method, such as
  `editor.read.children()`. The callback form serves several reads or writes
  that share one snapshot or transaction, intermediate state, branching, loops,
  or behavior that has no direct one-shot method.
- Plugins install through `editor.install(...)`; DOM/React views use
  `createEditorView(editor, options)`. Do not expose an editor runtime wrapper
  or `editor.extend(...)`. Keep root standalone utilities to truly
  editor-independent value operations such as `NodeApi`, `PathApi`, and
  `isEditor`.
- A captured document is read through one read-only `createEditorView(editor, {
  document })` view, never a projected facade or an editor copy, and its direct
  reads, plugin reads and plugin APIs all resolve against it. Plite refuses a
  source-editor read inside that view's reads, decorations and plugin render
  callbacks. Plugins reach the document through their context editor or `state`,
  never an editor captured in `.extend`, and component bodies read their
  `editor` prop.
- `state` is the normal read view; `tx` is the normal write view and can read
  transaction-local state.
- Plugin-owned factories are `read` and `update`; the compiler projects their
  methods under `definition.name` onto the read view, active `tx`, and direct
  update surface. Use `txOnly(...)` for controls that require an active
  transaction. Do not restore descriptor `state`/`tx` authoring. Do not overload
  `read` as middleware.
- A `read` factory constructs one callable method tree per published plugin
  configuration. Document commits reuse that topology; live values are method
  results, stable host values use `api`, and direct read facades resolve and
  invoke methods inside the read boundary.
- Native Yjs collaboration receives its exact `Y.Doc`, initial-load readiness,
  optional awareness and explicit seed authority at descriptor construction.
  The app owns provider connection, replacement, errors and destruction. The
  binding admits a compatible room once per document generation, blocks
  document and shared-effect publication before admission, retains failed
  imports for explicit retry, and remains admitted during later disconnects so
  offline edits and local history continue. Presence and compaction methods
  exist in the inferred `api.yjs` only when their inputs are supplied. Live
  admission and awareness state never become replayable `read` methods or
  transaction updates; each `(Y.Doc, rootName)` has one binding owner while
  mounted views retain exact selection projection.
- Plite owns the complete editor selection model. It supports text selection
  and one built-in directional `NodeSelection`; plugins cannot add selection
  kinds or parallel selection state. Feature owners write exact nodes and
  derive feature geometry from core selection.
- Each mounted Editable derives inactive canonical-selection paint from its own
  focus transition. When focus moves to an element or composed ancestor marked
  with `data-editor-keep-selection-visible`, that exact Editable paints its live
  expanded selection or collapsed caret. Focus returning to the Editable or
  moving to any unmarked target clears the paint. The behavior accepts no Range
  or selection payload, creates no public toggle or second selection state, and
  never changes model selection, native DOM selection, input, history,
  clipboard, or collaboration. It stays null-safe under SSR and unmounted or
  virtualized targets and exposes `data-editor-inactive-selection` and
  `data-editor-inactive-selection-caret` for product styling. Plate React
  inherits the behavior by identity.
- While an Editable shows inactive-selection paint, it skips model-to-DOM
  selection repair and selection focus, even when forced, and exposes no
  duplicate public state.
- Internal projected view selection is input-engine state. Its keyboard,
  clipboard, history, mutation, reconciliation, and navigation semantics make
  it ineligible as a public carrier for presentation-only inactive selection.
- Authored changes are one optional native document capability. Accepted roots
  remain the canonical document, while a versioned authored graph retains the
  operations, identities, dependencies, decisions, positions, and content
  needed for pending review and selected history. Accepted, proposed, and
  markup projections belong to exact editor views; their input intent and
  rendered children never become another saved document or global mode. An
  editing view may use any projection. Independent accepted-content edits
  publish directly. A visible replacement that fully contains its pending
  contributions resolves them and publishes the replacement in one atomic
  transaction; partial retained or dependency-spanning targets remain
  protected. Other edits that depend on pending content remain reviewable with
  their actual author. Review decisions are atomic document writes. Local undo
  remains local interaction history, and retained author history produces new
  compensating changes.
  Persistence checkpoints current authored facts and exact projections
  directly; opening a document never rebuilds them by reducing retained
  operations or replaying pending edits. Checksum-bound retained operation
  bodies stay cold until a decision or history read needs their content. A
  whole-document projection capture returns one accepted or proposed document,
  the exact review document from the same revision, and separate pending and
  conflicted counts. Full review markup and property materialization remain an
  explicit heavier read.
- Changing authored input intent creates no document or history change, and a
  composition finishes under the intent it started with.
- Structural comparison reads fixed, schema-valid revisions without installing
  editor state. It returns immutable span correspondence, grouped effects,
  diagnostics, and a canonical `DocumentChange`; three-way resolution keeps
  every branch contribution and requires explicit choices for conflicts.
  Comparison presentation stays read-only. An explicit authored import checks
  the exact live baseline and frontier before publishing one native proposal, so
  comparison does not become another review or position system. It keeps one
  comparison and one native import path, never annotated-node diff tags or a
  matcher re-run during conflict resolution.
- `NodeSelection` stores canonical exact membership as `paths`, directional
  `anchorPath` and `focusPath`, and an optional explicit root. Mapping,
  persistence, history, marks, slices, and collaboration preserve that state.
  React and UI code may control or render selection but never own another
  selected-node store.
- The callable `selection()` is the sole singular read and returns a plain
  `Range` or `null`. It never exposes selection-kind tags or feature payloads.
  `selection.ranges()` is the sole plural projection, and `selection.nodes()`
  reads exact selected-node membership. For node selections, the singular read
  is the directed representative range between anchor and focus; callers use
  plural reads for exact disjoint membership. Generic range predicates inspect
  that same representative range; they never return a kind-specific answer.
  Node selection has no native DOM range.
- When an internal canonical carrier needs tags, bookkeeping or plugin payloads
  to preserve runtime truth, the common public read returns the established
  domain value and keeps the carrier behind its owner. When public authoring
  compiles a semantic classification into a private group, registry key or tag,
  the owning facade exposes a named read, and callers never spell the private
  carrier or rebuild it from plugin names.
- Structural transforms map anchor and focus independently and restore them in
  authored order. Lift, unwrap, and named-root operations must preserve a
  backward, forward, or collapsed selection instead of reconstructing a
  forward range from sorted endpoints.
- Schema owns block classification. `nodes.block()` reads the nearest block;
  `nodes.blocks()` reads every relevant block and defaults to the active text or
  exact node selection. `selection.nodes()` never accepts traversal filters.
  Semantic block mutations live under `tx.blocks`; generic structural changes
  such as lifting stay under `tx.nodes` and never gain block aliases. When
  callers repeatedly combine generic traversal with one owner predicate, promote
  it to a named read on the traversal owner, singular for the nearest match and
  plural for all, and add no boolean mode flag.
- A boolean question uses a boolean query and never materializes entries merely
  to test existence. `editor.read.nodes.some(options)` keeps the same `at`,
  `match`, root, mode and void semantics as the entry query it replaces.
  Ancestor, current-block and relative traversals such as `above`, `block`,
  `parent`, `previous` and `next` keep their entry query.
- `tx.blocks.reset({ at? })` converts each target to its immediate parent or
  document-root schema default through the property type-change lifecycle. It
  preserves children, selection, and live `NodeKey`; feature commands keep
  their policy guards and delegate this structural mutation instead of
  replacing a node with a handcrafted default. It takes no type or mode option,
  and no feature publishes a reset alias for it.
- Structural commands used for shorthand conversion report whether they staged
  a change. An inadmissible placement or no-op returns `false` without claiming
  a successful mutation; the canonical schema and change builder remain the
  authority for the outcome.
- `Plugin` stays flat except for the coherent `on.*` event family. Lifecycle and
  host/DOM observation use prefixless child names; Plate extends the same family
  with names such as `keyDown`, `paste`, `nodeChange`, `textChange`, and capture
  variants instead of adding `handlers`. Pure core-read policy composes through
  descriptor-owned `readMiddleware` over `editorReads`; app policy does not earn
  a special root hook. Private runtime bridges may preserve Plate short-circuit
  behavior versus Plite run-all lifecycle observation without changing authoring
  shape.
- Public DOM event handlers run before built-in editor commands. Returning the
  documented handled signal prevents the runtime command, while `preventDefault`
  alone controls only the browser default unless the handler contract says
  otherwise.
- A prepared beforeinput command is authoritative for its payload, except delete commands, which re-derive their shape from the selection imported during that beforeinput.
- Typed ordered values use plugin `contributions`, not outputs.
  Plugin declarations use explicit low-level nouns: `stateFields` and
  `effectTypes`.
- A state field or effect `persist` declaration directly owns its `decode` and
  `encode` directions, its current positive `version` and its decode-only
  `legacyDecoders`, with no separate codec, identity factory or persistence
  builder. The declaration keeps exact encoded-output inference, validates
  unknown input before publication, and its legacy decoders cannot encode new
  state.
- Plugins have no `config` channel. Immutable construction inputs and opaque
  runtime resources stay in factory closures or honest host owners. `validate`
  checks assembled context without a configuration argument. `validate` and
  `activate` run early. Activation registers synchronous final-candidate
  validation or resource initialization with `beforePublish`; document writes
  are forbidden, and throwing vetoes publication. Resources remain
  activation-owned through `onCleanup`, including rollback cleanup.
  `afterPublish` is nonthrowing observation of published state, not a veto. Any
  externally owned runtime resource stays in host factory arguments; a plugin
  observes it but never mirrors its connect, disconnect, replacement or
  destruction lifecycle. Resource-gated import uses supplied readiness plus a
  latched per-generation admission fact that blocks document work and history
  while waiting or failed, keeps rejected input for bounded retry, keeps an
  admitted offline resource editable, and never treats transport connectivity as
  admission.
- One descriptor-owned `api` projects under `name` to
  `editor.api.<name>` and `editor.plugin(Plugin).api`. Do not root-merge
  methods or expose `getApi`. `api` is always a factory, even for
  context-free values, and receives one context object. A mounted view evaluates
  those factories with its exact editor identity. Its root API and descriptor
  portal expose the same current capability and retire together on
  reconfiguration; shared document state keeps its model owner.
- Per-editor DOM plugin state is keyed by the editor's runtime owner from
  `getEditorRuntimeOwner`, so every mounted view sees its activation's state
  without caller-side owner workarounds.
- Public update policy is semantic and narrow: history behavior plus ordered
  tags. Raw provenance and normalization authority stay internal to runtime and
  adapter owners.
- Transactions correct their changed roots through the installed corrections and
  expose no normalization call. `editor.update.value.repair()` is the one
  explicit all-root repair: it runs outside any active update and only for a
  named full-document invariant, never to coalesce leaves, settle a transform or
  preserve an old fixture shape. An invariant every operation must keep is
  repaired in the smallest transform or correction owner.
- Every successful update publishes one canonical document. Primitive steps inside a transaction may leave private draft shapes, but finalization merges adjacent text with equal properties, removes redundant empty leaves while keeping required inline caret spacers, flattens invalid inline content, fills compiled schema defaults, and maps selection and node keys through the same change, so a committed snapshot has no noncanonical exception. An externally supplied `DocumentChange` must already be canonical and fails atomically otherwise. Proof: `packages/plitejs/test/accessor-transaction.test.ts`.
- Public updates are synchronous and cannot nest. Helpers inside an update use
  the active `tx`.
- One user action commits in one update: consecutive synchronous mutations that
  form it run in the existing transaction, or in one `editor.update((tx) =>
  ...)` group when no transaction exists. A transform-backed caller with no
  transaction to join is a Plite or Plate gap, not a reason for separate
  updates.
- Command insertion admission evaluates the complete proposed replacement
  against the command's current state before constructing or publishing it.
  Full range and exact node-selection replacement subtract all replaced text;
  `maxLength: 0` remains a real limit. Imported canonical changes retain their
  explicit admission exemption.
- Semantic commands expose descriptor identity and installed dispatch. The
  default builder stays in the definition, unpublished work uses
  transaction-spec authoring, and a second default-only evaluation path needs an
  independent current consumer whose job excludes installed policy. Command-only
  policy stays private to its command handler, and a transaction method whose
  only consumer is that handler is deleted rather than published for the handler
  to call. Semantic commands derive ordinary values through the existing read
  owner before adding a generic dependency or cache graph.
- Command `handle` interceptors are conditional fallbacks: returning `false`
  continues to the next handler or descriptor default. Command `around`
  interceptors own the invocation unless they explicitly call `next()` or
  `next.after(prefix)`; returning `false` is a terminal rejection.
- A model service whose effect normally completes inside the call returns its
  result synchronously, and only a variant that waits on an external owner
  returns a `pending` result whose `settled` promise never rejects, as history
  replay does. A mounted event controller returns `void`, and one private
  dispatcher delivers each final outcome once to the exact initiating view, so
  keyboard, toolbar, native-input and adapter callers own no separate `void` or
  error path. No second controller publishes a result its production callers
  discard.
- A complete model action that must select published state owns one plugin
  `api` service, opens exactly one update, and returns an explicit outcome.
  Transaction `update` methods are reserved for mutations that honestly
  compose with other draft work. History replay therefore lives at
  `editor.api.history.undo()` and `redo()` and returns its outcome in the
  call, or a `pending` result whose `settled` promise never rejects;
  transaction history controls only grouping, skipping, and restoration.
  A fallible session effect may join that one order only when its durable work
  has an independent external owner. It is local, effect-only, non-mergeable,
  and excluded from persisted history. Replay claims the branch entry in call
  order before awaiting that owner and publishes per-editor pending state.
  Document edits, selection changes, and remote imports continue while the
  owner settles; only another replay returns `busy`. Settlement places the
  claimed entry as if it had completed at claim time. A block or a failed
  settlement preserves the branch head.
- A history owner or settlement failure settles `failed` and reports through the
  editor's `lifecycleErrorSink`, or `reportError` when no sink is set, and every
  switch on a history result, `Editable` `onHistoryReplay` included, handles
  `failed`. `HistoryResult`, `HistoryOutcome`, `HistorySettlement` and
  `HistoryApi` export from the root `plitejs` entrypoint, not from
  `plitejs/history`.
- History stores each batch as the commit's inverse `DocumentChange` with its inverted effects, selections and roots, and replays it inside one history-skipped transaction. It never keeps a mutable operation log as document truth.
- The primary document root is implicit in public API and docs. Do not expose a
  public `main` root key, config option, or example. Explicit roots are only for
  additional roots.
- `ContentSlice` is the complete transfer unit: content, open depths, and the
  reachable named-root closure move and reject atomically. Multi-target fitting
  remaps exclusive roots per placement, preserves intentionally shared roots,
  prunes unreachable roots, and never commits partial content or root state.
- Fitted placements and prepared keys stay private to transaction specs, and
  retained root provenance survives history and rebase.
- `editor.api.transfer` is the one move and copy action for drags, custom
  drivers and keyboard moves. A move inside one document commits its whole
  landed content or nothing: a guard after corrections refuses a landing that
  differs from the payload. Independent editors, read-only views and document
  views copy, and a copy follows paste, landing what fits and reporting the
  loss.
- A block lands wherever the compiled schema places it, at any depth. Placement
  checks the target's children as they will be after the transfer, for the nodes
  that actually land. A feature narrows it with a `transferVeto`, and a landing
  read only redirects an edge. Without a compiled content program, nested edges
  refuse. Hover and drop resolve the same edge. A redirected edge maps to
  itself, and every feature veto runs on the final edge, so no feature skips
  another feature's veto.
- A block's side is a landing only when a feature describes what to build there.
  The `transfer.side` read returns a shell with empty slots and an anchor given as
  levels above the target, never a key, because a read's state keys belong to the
  runtime owner and a view resolves its own. Plite commits the shell as one insert
  plus moves in one update, judges the filled shell and each slot through the
  schema, and runs every veto with `wrap` set, once more with the target as the
  payload when the shell takes its place. A side admits only blocks that relocate
  inside one root. `editor.read.transfer.check` is the same dry run the
  indicator paints from.
- Inferred values preserve the primary/named root grammar and every element's
  legal child variants without an arbitrary depth cliff. Canonical output
  requiredness follows runtime defaults; construction input may omit defaulted
  fields. Open or dynamic rules widen only their undecidable branch. Runtime
  schema—not tuple-length types—owns child cardinality.
- Structurally owned editable content stays in normal node `children`.
  Conditional mounting and selection use DOM coverage without changing the
  persisted model. Selection kinds distinguish owner selection from child-text
  focus; that distinction alone does not justify a persisted child wrapper.
  Structural child elements require their own grammar, properties, commands,
  or multiple real semantic regions. Explicit roots require independent
  addressing, lifecycle, sharing, or transaction semantics.
- A block whose identity is meaningful apart from its editable children declares
  `object: true` in the schema. The role implies structural isolation and
  semantic non-emptiness, while children remain normal editable content. Owner
  `NodeSelection` transfers the complete block; inner or boundary text
  selections transfer open child content. Generic split cannot duplicate the
  owner; feature commands may move child content out in one transaction. An
  object-role block is never modeled instead as an editable void, an atomic
  node, a second child root or a keyboard interaction flag.
- Physical or visual lines are not structural children. Multiline source whose
  lines own no independent semantics stays in one newline-bearing Text. Derive
  line operations from offsets and native syntax paint from Decorations; solve scale
  in the renderer or runtime without public chunk controls or a second
  persisted schema.
- An empty text leaf survives an edit only as the line-break anchor of an empty block, a required inline spacer, or a mark placeholder at the caret. Corrections remove every other empty leaf before render, so a non-empty block never paints a zero-width line break.
- A non-void block with exactly one Text may replace native child DOM with one
  external editable-text view. Plite still owns canonical text, selection,
  history, schema, and collaboration. The adapter owns its DOM, input, layout,
  and local native features through versioned patches and narrow actions. The
  two render branches are exclusive: never keep hidden duplicate text DOM,
  expose editor internals, or turn adapter-local virtualization into document
  virtualization. A mounted code editor can own incremental syntax parsing;
  it retains neutral document decorations and does not duplicate native syntax
  contributions. Keep parser configuration inside the adapter.
  External text does not make Plite a code editor and does not
  require fixed height. Deliver canonical updates synchronously and
  monotonically: lifecycle callbacks cannot edit the mounted view or canonical
  editor, an older callback cannot overwrite newer delivered state, and bounded
  failure recovery reads the latest canonical state without a replay queue.
- Runtime-owned DOM, such as a void's hidden spacer or an inline void's hidden anchor, is rendered by the runtime and never passed through app renderers. A renderer API that asks authors for hidden editor structure is wrong unless it is an explicit escape hatch. Block and inline voids keep separate primitives with one ownership rule: the app renders visible content and the runtime renders the hidden editor children.
- An embedded editor that owns syntax parsing omits the duplicated syntax
  provider when every view uses it. When native and external views mix, the
  provider stays, and the external renderer discards only contributions that
  carry the provider's explicit identity attribute. It never infers ownership
  from CSS classes or discards neutral annotations with syntax.
- `tx.*` is the current public API authority for normal writes. Primitive
  `editor.*` writes may remain internal or advanced bridge tools, but do not
  use them to justify old docs/examples as final DX.
- Unscoped `api` methods are too vague, and `tf` is too Plate-shaped for raw
  Plite core naming.
- Whole-document replacement should be a transaction write, not public
  `Editor.replace`, `editor.replace`, or `editor.reset` as app-author API.
- Active transactions expose direct named plugin groups such as
  `tx.writer.method()`. Generated closed editors and code whose transaction
  type carries the plugin graph may use that direct form. The shared
  `tx.plugin(pluginOrName)` selector returns the same active group without
  opening another update: descriptor input preserves nominal validation and
  exact inference, while name input permits intentionally decoupled package
  code and uses an erased result when the name is not statically known. Missing
  descriptors, names, or transaction groups fail at runtime.
- `EditorCommit` is the local runtime fact for history, collaboration, React,
  DOM repair, proof, and subscribers.
- Publication is the update outcome boundary. A callback that can still abort
  belongs before publication; observers that run after an `EditorCommit`
  exists report failure through `lifecycleErrorSink` and cannot make the
  committed update appear rejected.
- Document state, authored projection, persistent anchors, plugin
  configuration, and local history prepare inside the same rejection boundary
  and publish before commit observers. Native edit grouping has one history
  owner: ordinary input uses its configured idle clock, while an exact mounted
  composition origin and epoch joins only that composition's phases.
- Transient view data keeps its semantic owner: Decoration owns inline paint,
  Annotation owns durable logical ranges, and selection or keyed cursor owners
  feed exact-mounted-view geometry. Plite exposes no generic widget target or
  target-store lane.
- Session-bound decorations such as remote cursors, search matches and authored
  changes show only in the editor's own document. In a document view, anchors
  resolve only on nodes the document shares with the editor by identity, and
  search matches only the searched document.
- Commit consumers invalidate by their actual dependency: node presence,
  payload, path, selection, or projection. `commit.changed.nodeKeys('presence')`
  reports identities entering or leaving one root without enumerating shifted
  paths. Immutable query results are shared across readers; a known deleted
  identity resolves to `null` without rebuilding the document index.
- Keyed composed reads and small range projections touch only their contributing
  sources and selected leaves.
- App-facing selector hooks observe model truth, and no option lets them skip a commit. A performance skip, such as ignoring a text commit that direct DOM sync already painted, lives only on an internal mounted-render subscription, and a contract test proves that subscription still sees non-text commits.
- `editor.anchor` creates a persistent Path, Point, or Range handle that its
  owner releases. One model-owned target supports multiple projected views;
  `resolve(view?)` defaults to its capture view and accepts only another view of
  the same model and root. Released or aborted captures remain unavailable.
  Annotation stores resolve and observe their exact editor view without
  duplicating the retained target. `tx.anchor` creates the same mapped value
  from draft state, auto-releases it at the transaction boundary, and exposes
  only `resolve`. Serialized durable positions are a separate concern; low-level
  tracking is runtime machinery. Annotation indexes release only their own
  observations, never the shared retained target, and model-owned records and
  view-owned paint never share a cached coordinate or node-key index across
  projections.
- `NodeKey` is the sole live descendant identity. Resolve it with `editor.key`,
  coherent `state.key`, or active `tx.key`; resolve back through `nodes.path`.
  It covers elements and text, stays editor-local, and never enters schema or
  serialized data. A foreign editor's key fails closed even when public editor
  IDs or local allocation order match; ownership is private and the string
  representation is opaque. Do not publish runtime-ID aliases or a second
  identity namespace. Pure detached transaction-spec builders may consume
  existing keys and may give a fresh detached node a private spec-local prepared
  key that only the draft resolves, continuation preserves, acceptance adopts as
  that exact live NodeKey, and discard leaves with no live allocation or index
  entry. Keys are unique across one editor's roots and may target node
  operations across roots, while `nodes.path(key)` remains scoped to the current
  editor or view root because a `Path` carries no root. Passing a live node to
  `editor.key(node)` resolves it from any root in the same editor. Base-editor path inputs
  always address the main root; view path inputs address that view's root. A
  view created from a view reads its requested root, or the primary root when
  none is given, and keeps the source view's document, read-only state and
  authored mode; derivation never unlocks a read-only source. Callbacks receive
  the reader of the entry's root, so a root-relative entry never needs its root
  recovered. Mounted DOM binds live nodes with `data-editor-node-key`, and
  hydration may use a deterministic editor-local render token, but mounted
  lookup publishes the full owning runtime key. Resolve mounted DOM through
  `editor.api.dom.resolveDOMNode(nodeOrKey)`. Foreign, removed, and unmounted
  keys fail closed with `null`; renderer-private structures stay private.
- Code that holds a live node passes it directly as the `NodeTarget` or `at`
  value, resolves a path only when the path is the result, and never rediscovers
  the node by scanning for its `type` and `id`. Package code treats an
  unresolved public read as an optional outcome and returns or no-ops when
  resolution fails. A non-null assertion needs a concrete internal invariant
  owner.
- Lightweight text problems do not automatically deserve the full editor stack.

## Plite Browser And Behavior Proof

- Browser editing claims require model, DOM, selection/caret where observable,
  focus owner, commit metadata when mutating, legal trace, replayability, and
  follow-up typing.
- Model-only proof does not prove browser editing behavior, and DOM-only proof does not prove Plite model correctness; a browser editing claim asserts both layers.
- Use `@platejs/test` to the maximum reasonable extent for browser-facing
  proof.
- Route-local Playwright is acceptable for first reproduction only. If the same
  action/assertion appears twice, move it into `@platejs/test` or record why
  the abstraction would be fake.
- Require screenshots/geometry checks for text movement, blank windows, overlap,
  wrong caret line, wrong margin click, wrong scroll anchoring, table or page
  fragment drift, or native selection handles that disagree with the model
  selection.
- Claim full selection/navigation coverage only when every relevant command, direction, topology and starting state is green; one route row never proves it.
- Native mobile, semantic mobile, Playwright mobile viewport, and Appium raw
  device proof are distinct claim classes. Collaboration remote-update proof is a separate class too: a claim about how remote imports invalidate and render needs a multi-client row, never a model-update smoke row.
- IME overlap is policy-owned. Route proof covers composition at or beside the edit point, never app, model or remote edits that intersect an active native composition span; runtime overlap work needs an accepted plan that sets the conflict rule, and its proof drives a real native composition span and covers stale terminal events, follow-up typing, undo/redo, model and native selection, and event-trace coherence.
- Route proof claims none of these until an accepted plan defines the behavior and browser proof covers it: `selection.direction` as import authority (Plite imports anchor and focus endpoints and keeps backward native direction), an application `selectstart.preventDefault()` veto of model-owned keyboard extension, CSS vertical `writing-mode` caret movement, and mixed-bidi `Selection.modify("extend", left/right, "lineboundary")` extension.
- Public proof APIs validate untrusted lane evidence and exact source identity.
  Caller-provided success flags, transport names, and nonempty commit labels are
  claims, not proof.
- Package publication and broad release-readiness claims are separate. Package
  proof may validate packed output alone; an explicit broad claim consumes one
  authoritative, complete manifest bound to the exact release commit and fails
  closed on missing, stale, failed, tampered, or non-canonical producer
  evidence. Repository release tooling verifies the producer run, downloads
  its one named artifact by ID, checks GitHub's archive digest, binds the live
  run attempt, rejects dirty source, and owns aggregate claim policy;
  `@platejs/test` owns reusable lane-specific validators.

## Plite Runtime Loop

```txt
status -> gap scan -> behavior proof -> missing oracle repair -> visual proof
-> Benchmark ordered diagnosis -> fix one proven owner -> exact rerun
-> resume breadth -> keep/revert -> log -> reassess
```

- Behavior before perf.
- Visual proof before green visible-UI claims.
- Keep Benchmark packets only when correctness stays green.
- After two or three local fixes around one owner, escalate to deeper owner.
- Fix unfair benchmarks before gates.
- Reject packets that improve metrics but weaken selection, typing, copy,
  paste, IME, focus, undo, follow-up input, native find, or scroll/caret
  behavior.
- Escalate to the Plan playbook when the next useful win is API/runtime boundary.
- Each mounted `Editable` owns one bounded DOM phase scheduler. Queued root
  work runs in `model -> DOM read -> DOM/React write -> selection/repair ->
post-selection navigation` order, coalesces by semantic key, and reports
  recursive loop-limit hits. Explicit navigation scrolls are final writes;
  selection-preservation restores never override them.
  Scheduled scrolling returns request cleanup from that same owner;
  consumer cleanup cancels only its request, including any deferred stages.
- A consumer that already owns a semantic target uses the exact view's canonical
  DOM operation instead of querying presentation or decoration markers or
  scheduling another frame. A feature scrolls a known range through
  `editor.api.dom.scrollIntoView` and returns the cleanup it receives, with no
  scheduler or cancellation namespace of its own.
- Browser/OS policy clocks such as composition guard lifetimes and native event
  settling may use timers, but DOM mutation, scroll restoration, focus writes,
  and selection repair re-enter the root scheduler. Standalone internal test
  adapters may create a disposable fallback scheduler.
- Each mounted `Editable` routes keydown, beforeinput, input, selectionchange, paste, cut, drop and repair through one editing kernel (`packages/plitejs/src/react/editable/editing-kernel.ts`). The kernel owns the event frame and decides whether the native action proceeds; input, selection and mutation controllers and strategies work for it and never own the selection source, target, mutation authority, repair scheduling or the kernel trace. Destructive editing is model-owned: a native structural delete never becomes document or selection truth. Proof: `packages/plitejs/test/react/editing-kernel-contract.ts` and `editing-epoch-kernel-contract.ts`.

## Plite Perf And Degraded Modes

- Benchmark target control state: `benchmarks/targets/slate-v2.json`.
- Perf packets need one target id, one primary metric, one correctness command
  or browser proof, `METRIC` output when optimizing, and a keep/discard
  decision.
- If `worst_p95_ms` or a summary hides a hot lane, fix the metric before code.
  Fix any other suspect metric before code too.
- Ordinary `Editable` mounts the complete document DOM. DOM omission is an
  explicit mounted-view choice through the dedicated virtualized React
  component; it never activates from document size, a threshold, or an
  automatic strategy. The virtualized package entrypoint owns its optional
  engine and exposes only block estimate and overscan tuning.
- A virtualized view starts with one deterministic bounded window and retains
  selected or requested targets. Its document, history and collaboration state
  stay canonical while native find, accessibility traversal, printing and DOM
  integrations can observe only mounted content. Product support requires
  explicit browser, IME and device proof for the claimed matrix. Degraded
  huge-document modes stay degraded until native behavior is proved.
- React `Activity` hidden mode is not a primitive for hidden editable content,
  because it gives no browser find, native selection, IME, clipboard,
  screen-reader or DOM point mapping. Visible typing, DOM text sync, selection
  import and export, caret repair and IME stay urgent; transitions and deferred
  values serve only non-urgent work such as overlays, search results, sidebars
  and background summaries.
- Pagination owns page omission, page surfaces and direct canvas coordinates.
  It does not route page layouts or a public vertical offset through the generic
  top-level block virtualizer. Live configuration belongs to the mounted paged
  component; public layout reads are current committed snapshots for that exact
  host, and page boundaries never become document authority.
- Fragmentation is text, one atomic owner, or all direct element children.
  Pagination derives source paths and keeps projection and decoration assembly
  private. Its complete path mounts every document node and page surface.

## Plite Skill Topology

- `research`: external discovery, OSS/GitHub source synthesis, durable
  research ledgers, and promotion into owners.
- `maintainer slate-issue`: one public Slate issue coordinated through a local
  Plite repair, Plate PR targeting `next`, verified issue update, and honest
  integration/release state.
- pstack's Bug fix playbook, driven by `verify`: sole local Plate/Plite
  behavior-bug and regression owner; the Plite lane provides reproduction,
  class-level behavior coverage, durable substrate repair, architecture
  pressure and exact proof without public GitHub mutation. Structured review
  follows the pstack block's Review rule in `AGENTS.md`.
- the Plan playbook (`.agents/playbooks/plan.md`) with its architecture reference:
  Plate and Plite architecture and adoption planning after the target API is
  clear, with separate layer sections; the Build playbook executes it.
- `plate-next`: migration closure and stale API audits.

Do not merge distinct owners into one vague mega-skill. Repair confusing
routing in source rules. Create narrow owners only when evidence shows no clear
owner exists.
