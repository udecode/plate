# Plite Vision

Plite is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, canonical changes, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

Root `VISION.md` is the mandatory first read. This file carries the fuller
Plite doctrine after the lane is selected.

## Plite Source Order

1. Active goal plan.
2. Root `VISION.md`, then this file.
3. `docs/plite/agent-start.md`.
4. Relevant `plite-*` source rule under `.agents/rules`.
5. Transplanted Plite package source/tests/benchmarks in this Plate checkout:
   `packages/plitejs`, `packages/test`, `packages/plitejs/src/yjs`,
   `apps/plite/tests/plite-browser/**`, and `benchmarks/plite/**`.
6. `docs/plite/**` for accepted claim width.
7. `benchmarks/targets/slate-v2.json` for perf target authority.

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
- React components create one annotation index under each exact mounted view
  with `useAnnotationStore` and pass its typed reader explicitly. Framework
  adapters with an independent lifetime use the owned result of
  `createAnnotationStore` from `plitejs/annotations`. Keep that constructor out
  of `plitejs/react`, reject generic annotation providers and implicit empty
  readers, and reject public `/internal` bridges.
- Plite stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Do not make child-count chunking foundational again.
- Plite supplies typed plugin identity, composition, publication, and
  inspection. It does not supply a behavior-profile DSL. Plate specs define
  product law; named kits require real reuse, while runtime control is a
  separate proven job.
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
  editor variants.
- Root `PluginDependencyReference` is a shallow, non-generic identity
  value with `name` and optional `enabled`. `PluginTypeProvider` is the sole
  public descriptor-to-installed-capability bridge. Its higher-kinded encoding,
  normalized installed-capability carrier, and transitive dependency expansion
  stay in `plitejs/internal`; they do not recursively materialize exact dependency
  ancestry.
- Descriptor identity and installed state are distinct. Raw `definePlugin`
  descriptors retain frozen normalized author fields, while editor creation
  snapshots them into private installed records. Plate publishes its compiled
  definition through the same internal input. Registry topology binds direct
  nominal descriptor references and eligible source ancestors to one record;
  names remain diagnostics and schema keys rather than dependency identity.
  Portal code reads that record's owner-bound capabilities without raw/Plate
  kind dispatch, global aliases, or replacement descriptors.
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
- Ordered required child positions and their literal property values belong to
  the compiled content grammar, including construction, admission, fitting and
  saved identity. App corrections do not maintain a second document shape.
- Pure value predicates must honor the base model type they promise.
  `ElementApi.isElement` owns editor exclusion, the `children` array, and the
  required string `type`; `deep: true` additionally checks descendant shape.
  Structural ancestor checks stay distinct. Schema assertions own complete
  vocabulary, property, and content-grammar validation.
- Static portals require a unique literal name and mutually assignable
  descriptor/installed capabilities. Runtime portals require the installed
  descriptor or a compatible source ancestor, so a same-name object is not an
  interchangeable token.
- React creation and context retrieval are separate jobs. `useEditor(options,
deps?)` owns one editor for a component lifetime. `useEditorContext()` and
  `useOptionalEditorContext()` retrieve the mounted contract without caller
  generics, and selector hooks infer only their selected result. Exact
  plugin capabilities come from `editor.plugin(Plugin)`. Keep editor
  generics only on constructors or hooks whose typed input actually correlates
  with the result.
- A public `EditorRoot` requires an editor and owns one independent mounted
  view. Its root, authored, and read-only inputs configure that view through
  the existing view owner. Replacing the editor requires a keyed remount;
  changing the root retires queued work and commands from the prior view before
  descendants observe the next one. Nested same-document roots may share the
  nearest private provider while retaining independent mounted views.
- Public generics must correlate with a typed input, installed descriptor, or
  descriptor-owned runtime validator. Update callbacks expose only installed
  transaction groups; commands infer from their descriptors; raw schema
  property names return `unknown`; collaborative metadata remains `unknown`
  until its installed plugin validates it. Never let a method-level generic
  manufacture a capability or choose a result type.
- Low-level React composition receives the actual DOM dependency as
  `react({ dom })`. Its implementation may erase exactly one invariant-union
  boundary when TypeScript 7 cannot reduce it; the public call stays one exact
  object with no caller generics.
- `DefinitionOf<typeof FooPlugin>` is the sole public definition extractor;
  name the alias `FooDefinition`, never `FooConfig`. True domain/runtime
  config types remain valid.
- Layering beats feature buckets: document truth, DOM transport, React runtime,
  browser proof, projections/services, layout, lightweight surfaces, and
  productization need clear owners.
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
- Plugins install through `editor.install(...)`; DOM/React views use
  `createEditorView(editor, options)`. Do not expose an editor runtime wrapper
  or `editor.extend(...)`. Keep root standalone utilities to truly
  editor-independent value operations such as `NodeApi`, `PathApi`, and
  `isEditor`.
- `state` is the normal read view; `tx` is the normal write view and can read
  transaction-local state.
- Plugin-owned factories are `read` and `update`; the compiler projects
  their methods under `definition.name` onto the read view, active `tx`, and
  direct update surface. Use `txOnly(...)` for controls that require an active
  transaction. Do not restore descriptor `state`/`tx` authoring.
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
  with `data-plite-keep-selection-visible`, that exact Editable paints its live
  expanded selection or collapsed caret. Focus returning to the Editable or
  moving to any unmarked target clears the paint. The behavior accepts no Range
  or selection payload, creates no public toggle or second selection state, and
  never changes model selection, native DOM selection, input, history,
  clipboard, or collaboration. It stays null-safe under SSR and unmounted or
  virtualized targets and exposes `data-plite-inactive-selection` and
  `data-plite-inactive-selection-caret` for product styling. Plate React
  inherits the behavior by identity.
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
  bodies stay cold until a decision or history read needs their content.
- Structural comparison reads fixed, schema-valid revisions without installing
  editor state. It returns immutable span correspondence, grouped effects,
  diagnostics, and a canonical `DocumentChange`; three-way resolution keeps
  every branch contribution and requires explicit choices for conflicts.
  Comparison presentation stays read-only. An explicit authored import checks
  the exact live baseline and frontier before publishing one native proposal,
  so comparison does not become another review or position system.
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
- Structural transforms map anchor and focus independently and restore them in
  authored order. Lift, unwrap, and named-root operations must preserve a
  backward, forward, or collapsed selection instead of reconstructing a
  forward range from sorted endpoints.
- Schema owns block classification. `nodes.block()` reads the nearest block;
  `nodes.blocks()` reads every relevant block and defaults to the active text or
  exact node selection. `selection.nodes()` never accepts traversal filters.
  Semantic block mutations live under `tx.blocks`; generic structural changes
  such as lifting stay under `tx.nodes` and never gain block aliases.
- `tx.blocks.reset({ at? })` converts each target to its immediate parent or
  document-root schema default through the property type-change lifecycle. It
  preserves children, selection, and live `NodeKey`; feature commands keep
  their policy guards and delegate this structural mutation instead of
  replacing a node with a handcrafted default.
- Structural commands used for shorthand conversion report whether they staged
  a change. An inadmissible placement or no-op returns `false` without claiming
  a successful mutation; the canonical schema and change builder remain the
  authority for the outcome.
- `Plugin` stays flat except for the coherent `on.*` event family.
  Lifecycle and host/DOM observation use prefixless child names; Plate extends
  the same family with names such as `keyDown`, `paste`, `nodeChange`,
  `textChange`, and capture variants instead of adding `handlers`. Pure
  core-read policy composes through descriptor-owned `readMiddleware` over
  `editorReads`; app policy does not earn a special root hook.
- Typed ordered values use plugin `contributions`, not outputs.
  Plugin declarations use explicit low-level nouns: `stateFields` and
  `effectTypes`.
- Plugins have no `config` channel. Immutable construction inputs and
  opaque runtime resources stay in factory closures or honest host owners.
  `validate` checks assembled context without a configuration argument.
  `validate` and `activate` run early. Activation registers synchronous
  final-candidate validation or resource initialization with `beforePublish`;
  document writes are forbidden, and throwing vetoes publication. Resources
  remain activation-owned through `onCleanup`, including rollback cleanup.
  `afterPublish` is nonthrowing observation of published state, not a veto.
- One descriptor-owned `api` projects under `name` to
  `editor.api.<name>` and `editor.plugin(Plugin).api`. Do not root-merge
  methods or expose `getApi`. `api` is always a factory, even for
  context-free values, and receives one context object. A mounted view evaluates
  those factories with its exact editor identity. Its root API and descriptor
  portal expose the same current capability and retire together on
  reconfiguration; shared document state keeps its model owner.
- Public update policy is semantic and narrow: history behavior plus ordered
  tags. Raw provenance and normalization authority stay internal to runtime and
  adapter owners.
- Public updates are synchronous and cannot nest. Helpers inside an update use
  the active `tx`.
- Command insertion admission evaluates the complete proposed replacement
  against the command's current state before constructing or publishing it.
  Full range and exact node-selection replacement subtract all replaced text;
  `maxLength: 0` remains a real limit. Imported canonical changes retain their
  explicit admission exemption.
- Command `handle` interceptors are conditional fallbacks: returning `false`
  continues to the next handler or descriptor default. Command `around`
  interceptors own the invocation unless they explicitly call `next()` or
  `next.after(prefix)`; returning `false` is a terminal rejection.
- A complete model action that must select published state owns one plugin
  `api` service, opens exactly one update, and returns an explicit outcome.
  Transaction `update` methods are reserved for mutations that honestly
  compose with other draft work. History replay therefore lives at
  `editor.api.history.undo()` and `redo()` and resolves an awaited outcome;
  transaction history controls only grouping, skipping, and restoration.
  A fallible session effect may join that one order only when its durable work
  has an independent external owner. It is local, effect-only, non-mergeable,
  excluded from persisted history, and replays before branch movement. A block
  preserves the branch head, and no editor update may publish while the effect
  awaits its owner.
- The primary document root is implicit in public API and docs. Do not expose a
  public `main` root key, config option, or example. Explicit roots are only for
  additional roots.
- `ContentSlice` is the complete transfer unit: content, open depths, and the
  reachable named-root closure move and reject atomically. Multi-target fitting
  remaps exclusive roots per placement, preserves intentionally shared roots,
  prunes unreachable roots, and never commits partial content or root state.
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
  semantic non-emptiness, while children remain normal editable content.
  Owner `NodeSelection` transfers the complete block; inner or boundary text
  selections transfer open child content. Generic split cannot duplicate the
  owner; feature commands may move child content out in one transaction.
- Physical or visual lines are not structural children. Multiline source whose
  lines own no independent semantics stays in one newline-bearing Text. Derive
  line operations from offsets and native syntax paint from Decorations; solve scale
  in the renderer or runtime without public chunk controls or a second
  persisted schema.
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
- Primitive editor methods are power/runtime tools, not the final normal
  authoring story.
- `tx.*` is the current public API authority for normal writes. Primitive
  `editor.*` writes may remain internal or advanced bridge tools, but do not
  use them to justify old docs/examples as final DX.
- Unscoped `api` methods are too vague, and `tf` is too Plate-shaped for raw
  Plite core naming. Descriptor APIs remain namespaced by `name`.
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
- Commit consumers invalidate by their actual dependency: node presence,
  payload, path, selection, or projection. `commit.changed.nodeKeys('presence')`
  reports identities entering or leaving one root without enumerating shifted
  paths. Immutable query results are shared across readers; a known deleted
  identity resolves to `null` without rebuilding the document index.
- `editor.anchor` creates a persistent Path, Point, or Range handle that its
  owner releases. One model-owned target supports multiple projected views;
  `resolve(view?)` defaults to its capture view and accepts only another view
  of the same model and root. Released or aborted captures remain unavailable.
  Annotation stores resolve and observe their exact editor view without
  duplicating the retained target. `tx.anchor` creates the same mapped value
  from draft state,
  auto-releases it at the transaction boundary, and exposes only `resolve`.
  Serialized durable positions are a separate concern; low-level tracking is
  runtime machinery.
- `NodeKey` is the sole live descendant identity. Resolve it with
  `editor.key`, coherent `state.key`, or active `tx.key`; resolve back through
  `nodes.path`. It covers elements and text, stays editor-local, and never
  enters schema or serialized data. A foreign editor's key fails closed even
  when public editor IDs or local allocation order match; ownership is private
  and the string representation is opaque. Do not publish runtime-ID aliases
  or a second identity namespace. Pure detached transaction-spec builders may
  consume existing keys but do not allocate them. Keys are unique across one
  editor's roots and may target node operations across roots, while
  `nodes.path(key)` remains scoped to the current editor or view root because a
  `Path` carries no root. Base-editor path inputs always address the main root;
  view path inputs address that view's root.
  Resolve mounted DOM through `editor.api.dom.resolveDOMNode(nodeOrKey)`.
  Foreign, removed, and unmounted keys fail closed with `null`; renderer-private
  structures stay private.
- Lightweight text problems do not automatically deserve the full editor stack.

## Plite Browser And Behavior Proof

- Browser editing claims require model, DOM, selection/caret where observable,
  focus owner, commit metadata when mutating, legal trace, replayability, and
  follow-up typing.
- Use `@platejs/test` to the maximum reasonable extent for browser-facing
  proof.
- Route-local Playwright is acceptable for first reproduction only. If the same
  action/assertion appears twice, move it into `@platejs/test` or record why
  the abstraction would be fake.
- Require screenshots/geometry checks for text movement, blank windows,
  overlap, wrong caret line, wrong margin click, or wrong scroll anchoring.
- Do not claim full selection/navigation coverage from one route row.
- Native mobile, semantic mobile, Playwright mobile viewport, and Appium raw
  device proof are distinct claim classes.
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
- Fix suspect metrics before code.
- Fix unfair benchmarks before gates.
- Reject packets that improve metrics but weaken selection, typing, copy,
  paste, IME, focus, undo, follow-up input, native find, or scroll/caret
  behavior.
- Escalate to `plite-plan` when the next useful win is API/runtime boundary.
- Each mounted `Editable` owns one bounded DOM phase scheduler. Queued root
  work runs in `model -> DOM read -> DOM/React write -> selection/repair ->
post-selection navigation` order, coalesces by semantic key, and reports
  recursive loop-limit hits. Explicit navigation scrolls are final writes;
  selection-preservation restores never override them.
  Scheduled scrolling returns request cleanup from that same owner;
  consumer cleanup cancels only its request, including any deferred stages.
- Browser/OS policy clocks such as composition guard lifetimes and native event
  settling may use timers, but DOM mutation, scroll restoration, focus writes,
  and selection repair re-enter the root scheduler. Standalone internal test
  adapters may create a disposable fallback scheduler.

## Plite Perf And Degraded Modes

- Benchmark target control state: `benchmarks/targets/slate-v2.json`.
- Perf packets need one target id, one primary metric, one correctness command
  or browser proof, `METRIC` output when optimizing, and a keep/discard
  decision.
- If `worst_p95_ms` or a summary hides a hot lane, fix the metric before code.
- Ordinary `Editable` mounts the complete document DOM. DOM omission is an
  explicit mounted-view choice through the dedicated virtualized React
  component; it never activates from document size, a threshold, or an
  automatic strategy. The virtualized package entrypoint owns its optional
  engine and exposes only block estimate and overscan tuning.
- A virtualized view starts with one deterministic bounded window and retains
  selected or requested targets. Its document, history and collaboration state
  stay canonical while native find, accessibility traversal, printing and DOM
  integrations can observe only mounted content. Product support requires
  explicit browser, IME and device proof for the claimed matrix.
- Pagination owns page omission, page surfaces and direct canvas coordinates.
  It does not route page layouts or a public vertical offset through the generic
  top-level block virtualizer. Live configuration belongs to the mounted paged
  component; public layout reads are current committed snapshots for that exact
  host, and page boundaries never become document authority.
- Fragmentation is text, one atomic owner, or all direct element children.
  Pagination derives source paths and keeps projection and decoration assembly
  private. Its complete path mounts every document node and page surface.

## Plite Skill Topology

- `maintainer`: public GitHub issue/PR/security queue control plane for the
  merged Plate + Plite repo; routes work to narrower owners and stops at
  authority boundaries.
- `task autonomous`: internal Plate/Plite quality supervision; `improve`
  supplies the recurring whole-project preset. Plite package/runtime/browser
  work stays with its technical owners; measured work routes to `benchmark`.
- `benchmark`: sole ordered performance diagnosis/execution owner for Plite,
  Plate, current/main, pinned Slate, mount/editing, example breadth, and stress;
  pauses at a causal owner, fixes/reruns, then resumes remaining lanes.
- `task closure`: post-merge/current-tree until-clean closure after Plite work is
  already applied.
- `plite-research`: external discovery, OSS/GitHub source synthesis, durable
  research ledgers, and promotion into owners.
- `editor-audit`: exhaustive comparison of selected local editor source trees,
  verified commit tracking, incremental sync, and material change dossiers
  routed to `best-api`, `plite-plan`, or `plate-plan`.
- `maintainer slate-issue`: one public Slate issue coordinated through a local
  Plite repair, Plate PR targeting `next`, verified issue update, and honest
  integration/release state.
- `patch`: sole local Plate/Plite behavior-bug and regression owner; the Plite
  lane provides reproduction, class-level behavior coverage, durable substrate
  repair, architecture pressure and exact proof without public GitHub
  mutation. Structured review follows Task's existing gate and budget.
- `best-api`: concrete public API design, review, and P0/P1/P2/P3 debt
  ranking.
- `plite-plan`: substrate architecture, adoption/proof planning, and accepted
  plan execution after the target API is clear.
- `slate-migration`: migration closure and stale API audits.
- `tdd`: missing oracle/test design when the proof itself does not exist.

Do not merge distinct owners into one vague mega-skill. Repair confusing
routing in source rules. Create narrow owners only when evidence shows no clear
owner exists.
