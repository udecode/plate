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
  property-mutation namespace. `tx.plugin(Plugin)` selects an installed
  plugin's flat transaction capability group; it is not a property portal.
- Keep raw plugin capabilities shallow. Exact recursive application `Value`,
  final schema bindings, mutation maps, and fingerprints may belong to
  committed opt-in generated artifacts, never every
  `editor.api/read/update` access.

- A Plate application schema declares `root` only when its primary structure
  differs from the standard nonempty paragraph policy. Use existing
  descriptor-aware `schema.content.*` builders with an explicit positive
  `min`; the first descriptor in `elements` owns the default. Descriptors match
  the installed Base or Plate family. Root grammar participates in generated
  contracts and schema identity, so named persisted schemas version and
  migrate a change.
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
  elements use `blockContent` for normal-flow membership.
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

- Persist `{ document, schema }`; source lineage is data, never inferred from
  node strings or an npm package version. Bind every supported historical
  envelope version to its exact generated fingerprint. An explicit
  `unversioned` floor is the only path without historical fingerprint proof.
- Configure `migrations` beside the named app `schema`. Define exact target
  steps with `defineDocumentMigrations`; a source at v53 and target at v55 runs
  steps 54 then 55. Missing steps, another lineage, future input, downgrade,
  and same-version fingerprint drift fail closed.
- `migrateDocument` is the shared document runner for runtime loads, app
  storage jobs, and CLI dry-run/check/write. It is not an editor option or a
  second migration declaration grammar.
- Installed plugins may use `prepareDocument` after host migration and before
  schema fitting to establish permanent current-schema invariants. They never
  own release migrations, source-version selection, or a compatibility kit.
- Normalizers and corrections accept only current-schema shapes. They never
  recognize historical ASTs. Offline history and Yjs room cutovers remain
  app-owned persistence work.

Reject migration plugins, per-node versions, feature-local public release
steps, AST sniffing, a generic migration registry, and CLI-only runtime policy.
One complete document crosses one application schema boundary.

Install extensions with `editor.install(...)` and construct a DOM/React view
with `createEditorView(editor, options)`. Do not reintroduce an editor runtime
wrapper or `editor.extend(...)`. Root-level standalone utilities are limited to
genuinely editor-independent value operations such as `NodeApi`, `PathApi`, and
`isEditor`; editor behavior lives on `read`, `update`, or an installed extension.

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
Pure detached transaction-spec builders may consume an existing key as a node
target but do not publish `key` or allocate transaction-live identity.

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
token, but mounted DOM lookup must publish the full owning runtime key.

Persisted element identity is a separate optional Plate capability owned by
`ElementIdPlugin`. Its canonical schema property is `id`, its default generator
is `nanoid`, and consumers may configure another string generator. Exact
schema-derived element code reads `element.id`; erased or optionally installed
package code uses `editor.plugin(ElementIdPlugin).read`. Migrations may read a
legacy `sourceKey`, but runtime schema configuration never aliases or renames a
plugin-authored property key. Persisted IDs apply to elements, not text.

At the persistence boundary, convert a live key directly with
`editor.plugin(ElementIdPlugin).read.id(key)`. Do not retrieve the node merely
to read its persisted ID. Missing or deleted keys return `undefined`; exact
element input keeps the strict non-empty ID contract. Live TOC, outline,
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
`editor.plugin(Plugin).store`. React subscriptions use `usePluginStore` or
`useEditorPluginStore`. Do not recreate deleted `options`, `getOption`,
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
| `api`               | stable plugin services not bound to a supplied document snapshot or active tx                                              | it mutates the document or is really a snapshot query                           |
| `read`              | pure, replayable queries over supplied document state                                                                      | it mutates, performs I/O, writes plugin state, or depends on ambient live state |
| `update`            | document reads and mutations through the active transaction                                                                | it opens a nested one-shot update or owns unrelated I/O                         |
| native Plite fields | genuine editor-wide substrate through flat fields such as `commands`, `corrections`, `contributions`, `on`, and `activate` | it merely republishes plugin-scoped state, API, reads, or updates               |
| `codecs`            | format encode/decode declarations                                                                                          | it owns runtime service or mutation behavior                                    |

`api` being immutable describes publication of the method object, not method
purity. A non-document service may have external or store effects; document
reads belong in `read`, pure store projections belong in `selectors`, and
document writes belong in `update`.

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
stage reuses `tx.plugin(Plugin).method()`. Generated closed editors may also
expose the direct `tx.pluginName.method()` group. Never use computed
`tx[plugin.name]`, `tx.extension(...)`, or a portal one-shot update inside the
transaction.
