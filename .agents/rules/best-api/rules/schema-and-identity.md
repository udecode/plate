# Schema And Identity

### Schema Shape Gate

Keep schema authoring explicit where structure differs and tiny where the law is
standard:

- A plugin `name` is immutable capability identity only. Persisted identity
  lives under schema. Exact consumer portals expose `schema.type` for elements
  and `schema.key` for a primary mark. Behavior and aggregate-property portals
  expose no schema member. Author callbacks use the same flat primary identity
  and may use `schema.properties.<localId>` only for additional declared
  properties. Never add universal plugin `.type` / `.key`, derive a persisted
  identity from `plugin.name`, or expose compiler property maps to consumers.
- Feature plugins own authored schema law. Only the consuming application's
  final schema may override element type, content, groups, or an existing
  property's target, and may add app-owned properties.
  `.extend()` and `.configure()` never change schema. Plugin-owned property
  keys and value laws are immutable; a persisted rename is a new field plus a
  migration.
- Keep ordinary domain access direct (`node.indent`, `cell.header`). Use
  `SchemaElementHandle` and `SchemaPropertyHandle` for generic construction,
  matching, codecs, inspection, and typed property reads.
- Inside a plugin `update`, use one object-patch law for node properties:
  `tx.nodes.set({ lineHeight: value }, options)`. Infer owned keys and values
  from the current plugin plus its required dependencies through a shallow
  capability graph; duplicate persisted keys infer the union of every declared
  value. Never pull the complete application grammar into ordinary updates.
- Use the persisted key from `schema.properties.<localId>` when an authored
  property is aliased: `tx.nodes.set({ [property.key]: value }, options)`.
  Remove properties with a typed key or exact handle through `tx.nodes.unset`.
  Dynamic string-keyed object patches are the explicit runtime-schema escape
  hatch. Put prefix-family and cross-node behavior behind semantic owner
  operations. Never add scalar `set(key, value)`, `tx.properties`, or another
  property-mutation namespace. `tx.plugin(pluginOrName)` selects an installed
  plugin's flat active-transaction capability group; it is not a property
  portal or a nested update.
- Keep raw plugin capabilities shallow. Exact recursive application `Value`,
  final schema bindings, mutation maps, and fingerprints may belong to
  committed opt-in generated artifacts, never every
  `editor.api/read/update` access.
- A current generated TypeScript contract carries only types and static schema
  handles. Its companion JSON schema contract owns the compiled fingerprint;
  do not emit a duplicate TypeScript fingerprint that churns for a behavior-only
  schema change. Migration snapshots retain historical source fingerprints for
  their separate persisted-document job.

- A Plate application schema declares `root` only when its primary structure
  differs from the standard nonempty paragraph policy. Use existing
  descriptor-aware `schema.content.*` builders with an effective positive
  minimum. A required `schema.content.prefix(slots, rest)` contributes its
  slots to that minimum; each slot constrains a persisted type and exact
  schema-valid properties. The rest rule owns subsequent children and their
  default. The first descriptor in `elements` owns its ordinary default.
  Descriptors match the installed Base or Plate family. Root grammar
  participates in generated contracts and schema identity, so named persisted
  schemas version and migrate a change. App-owned corrections do not enforce
  document positions that the canonical schema can declare.
- A complete schema declares `root: SchemaContent` directly. Named `roots`
  map names directly to `SchemaContent`; a `{ content }` wrapper earns nothing.
- Omitted complete-schema `elements` means `{}` and omitted `unknown` means
  `"reject"`. Open vocabulary requires an explicit `"preserve"` decision.
- `schema.element.textBlock()` is the standard editable text-plus-inline
  element. Do not make arbitrary non-void elements implicitly text blocks.
- Unvalidated `property.json()` is `PropertyJsonValue`. A narrower value type
  requires a runtime type predicate and `validationVersion` on the property.
- Property meaning belongs to placement. Use `role: "metadata"` on
  `elementProperty` or `textProperty`; do not put significance on the value
  descriptor.
- Application schema lineage uses `id` and `version` inside the single
  app-owned `schema` object. Do not duplicate lineage in a top-level
  `schemaIdentity` option or a generator-only definition. Plate schema
  elements use `blockContent` for normal-flow membership. Read the compiled
  result with `editor.read.schema.isBlockContent(element)`; never export its
  private group identity or rebuild it from plugin names. Keep it independent
  from `editor.read.nodes.isSelectable(element)` and UI presentation policy.
- Runtime verbs are `schema.create`, `schema.assertDocument`,
  `schema.assertFragment`, and `schema.isMarkableVoid`. Assertions accept
  `unknown` and narrow it.
- A public predicate over `unknown` validates every required base field of its
  promised narrowed type. A weaker structural candidate check must have a
  distinct contract. Schema assertions retain complete vocabulary, property,
  and content-grammar validation.
- Raw Plite schema handles use `schema.handle.*`. Plate plugin callers pass the
  descriptor directly to `create`, `allowsElementType`, and
  `isElementTypeInGroup`; Plate does not add a second handle form.
- Descriptor-aware schema queries are identity operations only. Read document
  properties through typed property handles or a semantic plugin API; never
  interpret an arbitrary one-property descriptor as a property query.
- Node traversal separates structural selection from computed conditions. Use
  `type: FooPlugin` in Plate or a persisted string/schema handle in Plite, then
  add function-only `match: (node, path) => ...` when needed. Arrays of `type`
  selectors infer unions; a type-guard `match` may infer without `type`. Never
  expose caller-selected result generics, object matcher DSLs, descriptor-first
  overloads, or plugin-scoped copies of generic traversal. The traversal
  target (`at`) is independent from the selected node type.
- Apply that selector grammar to node reads, transforms, selection queries,
  corrections, and their static mirrors. An insert operation puts the selector
  for its split ancestor under `split: { type, match }`; it does not pretend
  that selector describes the inserted node. `NodeApi.matches` remains
  predicate-only because it already receives the concrete node.
- Compiler/provider witnesses stay internal. Public definitions expose authored
  schema, never normalized compiler carriers.
- Static value inference preserves legal primary/named roots and each
  element's legal child variants. It never widens every element to every schema
  descendant or exposes an arbitrary recursion-depth precision cliff.
- Canonical output requiredness follows runtime schema law: non-omitted
  defaults are present after canonicalization, while construction input may
  omit defaulted fields. Dynamic/open declarations widen only the undecidable
  branch instead of collapsing the known schema or producing `never`.
- Child `min`/`max` remains runtime validation law. Do not encode cardinality as
  hostile tuple lengths merely to make inferred values look stricter.

### Document Migration Gate

Versioned persisted documents use one app-owned envelope and one ascending
target-version chain:

- Persist exactly `{ document, schema, selection? }`; source lineage is data, never inferred from
  node strings or an npm package version. Bind every supported historical
  envelope version to its exact generated fingerprint. Raw input has no
  lineage proof and requires `source: number | 'current'` at that conversion.
- Bind immutable target facts once with
  `defineDocumentMigrations({ plugins, schema, sourceFingerprints, steps })`.
  A source at version 1 and target at version 3 runs steps 2 then 3. Missing
  steps, another lineage, future input, downgrade, and same-version fingerprint
  drift fail closed before any step runs.
- Only the persistence or release owner allocates a target version. Fold every
  change into the current target until that boundary ships; implementation
  order never earns another schema version. Plate's approved next target is
  v54. Do not create v55 or later without explicit release-owner approval and
  a persisted v54 source fingerprint.
- `migrateDocument` is the complete detached converter for app storage jobs and
  CLI dry-run/check/write. It returns `{ output, applied, source }`; `output` is
  the exact current persisted envelope. Ordinary editor creation and complete
  replacement accept current input only and expose no migration option.
- Plugin schema, property, state-field, and feature validators own permanent
  current-document invariants. Do not add a generic plugin document-preparation
  hook or hide migration selection/mapping behind object identity.
- Normalizers and corrections accept only current-schema shapes. They never
  recognize historical ASTs. Offline history and Yjs room cutovers remain
  app-owned persistence work.

Reject migration plugins, per-node versions, feature-local public release
steps, AST sniffing, a generic migration registry, and CLI-only runtime policy.
One complete document crosses one application schema boundary.

Install plugins with `editor.install(...)` and construct a DOM/React view
with `createEditorView(editor, options)`. Do not reintroduce an editor runtime
wrapper or `editor.extend(...)`. Root-level standalone utilities are limited to
genuinely editor-independent value operations such as `NodeApi`, `PathApi`, and
`isEditor`; editor behavior lives on `read`, `update`, or an installed plugin.

### Node Identity

Use `NodeKey` for editor-owned live descendant identity. The normal call is
`editor.key(nodeOrLocation)`. A coherent read callback uses `state.key(...)`;
an active update uses `tx.key(...)`. Reverse lookup belongs to the generic node
owner as `state.nodes.path(key)` or `editor.read.nodes.path(key)`. Do not expose
`editor.read.key`, `read.nodes.key`, `read.runtime.id`, a runtime-ID alias, or a
second reverse-lookup namespace.

Node keys are unique across one editor's document roots and may target generic
node reads and updates across those roots. A `Path` has no root, so
`nodes.path(key)` resolves only inside the current editor or view root. The base
editor maps path inputs to the main root even while another view is updating;
a view maps them to its own root. Passing a live node to `editor.key(node)` may
resolve that node from any root in the same editor.

A `NodeKey` covers elements and text, stays stable through moves and immutable
updates, and dies when the logical node is removed. It is scoped to one editor
runtime. A key from another editor must fail closed even when both editors use
the same public `editor.id` or allocate the same local ordinal. Runtime
ownership is private and must not derive from caller-configurable `editor.id`.
The key's string representation is opaque. It never enters schema, JSON,
clipboard, history serialization, collaboration payloads, Markdown, HTML, or
databases. Paths remain structural addresses; anchors remain live positions.
Pure detached transaction-spec builders may consume an existing live key as a
node target. They may also assign a private prepared key to a fresh detached
node when later operations or accepted local callbacks need stable identity in
the same spec. A prepared key is opaque and spec-local: only the draft
transaction resolves it, continuation preserves it, acceptance adopts that
exact key as live identity, and discard consumes no live allocation or index
entry. It never appears in the frozen public spec or any serialized payload.

Name every feature field that stores this value `key` or `keys`: for example
`selectedKeys`, `draggingKey`, `cellKeys`, and `openKeys`. Reserve `id` for an
actual persisted identity of this element occurrence. Name a persisted
association token `ref` or `refs`, including a token shared by definitions and
references or one pointing to an external entity. A node may therefore carry
both its own `id` and a relation `ref`; repeated mentions of one entity share
`ref` while retaining distinct element IDs. External codec vocabulary such as
MDAST `identifier` stays at the adapter boundary. Keep semantic addresses such
as `url` instead of renaming every pointer-like domain field. DOM bindings for live nodes use
`data-plite-node-key`; feature-owned DOM attributes carrying node keys follow
the same vocabulary. Hydration may use a deterministic editor-local render
token, but mounted DOM lookup must publish the full owning runtime key. Resolve
mounted DOM with `editor.api.dom.resolveDOMNode(nodeOrKey)`. Foreign, removed,
and unmounted keys return `null`; do not add another lookup namespace or expose
`NodeView`, `ViewDesc`, or renderer-private structures.

Persisted element identity is a separate optional Plate capability owned by
`ElementIdPlugin`. Its canonical schema property is `id`, its default generator
is `nanoid`, and consumers may configure another string generator. Exact
schema-derived element code reads `element.id`; erased or optionally installed
package code uses `editor.plugin(ElementIdPlugin).read`. Migrations may read a
legacy `sourceKey`, but runtime schema configuration never aliases or renames a
plugin-authored property key. Persisted IDs apply to elements, not text. The
compiled property target is the sole applicability policy: document preparation
generates IDs only for matching elements and removes the plugin-owned `id` from
excluded elements. Narrow the application schema target instead of adding a
plugin `types`, inline filter, or second runtime matcher.

At the persistence boundary, convert a live key directly with
`editor.plugin(ElementIdPlugin).read.id(key)`. Do not retrieve the node merely
to read its persisted ID. The read accepts only `NodeKey`; exact schema-derived
elements read `element.id` directly. Missing or deleted keys return `undefined`.
Live TOC, outline,
selection, drag/drop, and navigation state use `NodeKey` and must not install
`ElementIdPlugin`. One-shot exports such as DOCX derive export-local references
from runtime keys. Serialized identity such as Markdown block-ID round trips
uses `ElementIdPlugin`. A copied registry may install it explicitly as product
policy, but no unrelated feature dependency may install it transitively.

Request-local protocols use small explicit refs such as `b1` or `c1` mapped to
`NodeKey` inside the originating editor. Do not install `ElementIdPlugin` just
to correlate one request and response. Use a persisted ID only when the
reference must survive editor destruction, reload, storage, or another client.

Plate plugin runtime values have one channel: defaults in `initialState`,
descriptor overrides through `.configure({ initialState })`, builder access
through inferred `store`, and consumer access through
`editor.plugin(Plugin).store`. React subscriptions use `usePluginStore` with
an installed typed descriptor. Do not recreate deleted `options`, `getOption`,
`getOptions`, `setOption`, `setOptions`, or `usePluginOption` APIs, and do not
add a parallel immutable `config` channel. Generic operation parameters may
still be named `options`; this rule owns plugin declaration/runtime state.

### Plugin Capability Boundary

Choose the capability by semantics, not by which callback is easiest to type:

| Field               | Public job                                                                                                                 | Rejection test                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `initialState`      | defaults for mutable editor-local plugin state                                                                             | the value is not state or needs a second configuration channel                  |
| `store`             | live state reads, writes, subscriptions, and selector evaluation                                                           | the value is document state or a schema rebuild is expected                     |
| `selectors`         | pure projections of readonly store state plus domain arguments                                                             | it reads the editor/document, mutates, performs I/O, or writes the store        |
| `api`               | stable plugin services, including a complete action that owns exactly one update and cannot compose against a supplied tx | it is really a snapshot query or a mutation that must compose in an active tx   |
| `read`              | pure, replayable queries over supplied document state                                                                      | it mutates, performs I/O, writes plugin state, or depends on ambient live state |
| `update`            | document reads and mutations through the active transaction                                                                | it opens a nested one-shot update or owns unrelated I/O                         |
| native Plite fields | genuine editor-wide substrate through flat fields such as `commands`, `corrections`, `contributions`, `on`, and `activate` | it merely republishes plugin-scoped state, API, reads, or updates               |
| `codecs`            | format encode/decode declarations                                                                                          | it owns runtime service or mutation behavior                                    |

`api` being immutable describes publication of the method object, not method
purity. A service may have external or store effects. It may also own a complete
document action when the job must select published state, open exactly one
update, and return the outcome of that update; history replay is the canonical
case. Mutations that need to compose with other draft work belong in `update`.
Document reads belong in `read`, and pure store projections belong in
`selectors`. Do not expose the same complete action again through `update` as a
public forwarding path.

The `api` field is factory-only at Plite, Base, and Plate layers, even when the
returned object needs no context: write `api: () => ({ ... })`, never
`api: { ... }`. Plite passes one context object; Base and Plate extend that
same object with their authoring fields. Reject positional `(editor, context)`
factories and consumer `.configure({ api })`: API capability is
definition-owned and contributed once.

Concrete inferred editors project plugin capabilities to
`editor.api.<name>`, `editor.read.<name>`, and
`editor.update.<name>`. Generic code or exact ownership uses the same
capabilities through `editor.plugin(Plugin)`. Selectors remain store-owned and
are evaluated through the scoped store.

When factory input supplies an independent capability, the returned descriptor
must reflect that capability in its inferred API. Omitting the input removes
the corresponding methods from typed editors and portals; erased runtime
boundaries still reject unavailable calls. Preserve this narrowing through
copied factories, builder stages, explicit-editor hooks and declaration emit
instead of publishing an always-present method family that fails for ordinary
typed callers.

Externally owned runtime resources stay in host factory arguments. A plugin may
observe them and bind editor behavior to them, but it does not mirror their
connect, disconnect, replacement or destruction lifecycle. If imported state
must be accepted before document publication, model readiness as a supplied
input and successful admission as a latched plugin fact for that resource
generation. Reject document work before publication and history while waiting
or failed, retain rejected input for a bounded retry, and keep an admitted
offline resource editable. Transport connectivity is not admission.

Every element plugin receives descriptor-bound `insert`, `set`, and `remove`
on `editor.plugin(Plugin).update`. Default-constructible, schema-compatible
text-block plugins also receive `toggle`; text blocks with required
construction properties and structural element plugins expose an authored
`toggle` only when they own real domain, wrap, conversion, or child semantics.
An opt-in generated `Editor` type may additionally project eligible methods
under each capability name on root and transaction updates. Raw editor tuples keep authored
root/transaction capabilities exact, but do not materialize a schema-wide
generic mutation map; doing so makes any ordinary editor access expand the
entire grammar. The persisted target comes from the descriptor `type`; callers
never restate it. `insert` builds through schema defaults, uses an explicit
`at` literally, inserts a block after the selected block, inserts an inline at
the selection, and does nothing without a selection or explicit `at`. `set`
and `remove` force the descriptor type and do not accept a caller-owned match.
Generic text-block `toggle` swaps the selected block discriminator; it does not
publish structural `wrap` as an option. It may accept one-shot update policy
such as `collapse`; use the transaction primitive only while composing inside
an existing transaction. An authored same-name method replaces the synthesized
default when it owns extra semantic behavior. Delete redundant
noun aliases such as `insertTable`; retain custom verbs only for distinct jobs
such as merge, insertColumn, or a structural toggle.

Application schema overrides are a compiler boundary. Ordinary runtime tuples
do not promise descriptor-generic mutations whose eligibility depends on the
final compiled grammar; opt into `plate generate` and consume its generated
types when that exact static surface materially helps.

Custom element insertion has one signature law:
`insert(input?, nodeOptions?)`. The first argument contains only the feature's
domain data; the second contains generic placement and selection options such
as `at`, `select`, and `voids`. Never merge node options into the domain input
or publish an `Insert*Options` compiler-ferry type. If schema defaults make the
operation ordinary CRUD, delete the custom method and use the synthesized
descriptor insert instead.

The scoped update portal is callable with the same transaction policy as the
root update: `editor.plugin(Plugin).update(policy).method()`. It delegates to
exactly one root transaction, preserves rollback and history tags, and returns
the same inferred scoped methods. A later method inside an active plugin update
stage reuses the same group through `tx.plugin(Plugin).method()` when it owns
the descriptor or `tx.plugin(pluginName).method()` when importing that
descriptor would create the wrong package dependency. Descriptor input keeps
nominal validation and exact inference; name input is the explicitly erased
decoupled path: its guard can prove runtime presence, but it carries no static
capability contract and must never be described as fully typed. Use it only
when the caller and capability owner are independently optional and importing
the descriptor would create the wrong package or entrypoint dependency. When
an integration already declares that dependency, import the descriptor and
keep the inferred portal. An optional name-only consumer checks
`tx.plugins.has(pluginName)` in the same transaction before dispatch. This
escape hatch exists only on the active transaction selector; do not teach
`editor.plugin(pluginName)`. Reject reflection over editor capability maps,
local casts that duplicate the target group, and descriptor imports used only
as installation probes.
Generated closed editors may also expose `tx.pluginName.method()`. Do not index
the transaction object with a runtime plugin name or open an editor portal
one-shot inside the transaction.
