---
"@platejs/plite": major
---

- Add immutable `TransactionSpec` and versioned `DocumentChange` APIs for atomic, serializable updates, with explicit primary and named-root changes and no public primary-root sentinel
- Compile closed schemas from extension `schema` declarations with shared `property.*` laws, structural content fitting, stable identity, and typed element, group, root, and property queries
- Define literal string domains with `property.enum(...)`
- Bind structural slice fitting to each compiled schema revision through one private, immutable fitter artifact
- Publish derived schema identities as `{ kind: 'derived', fingerprint }` and application-named lineage as `{ kind: 'named', id, version, fingerprint }`; fingerprints cover compiled semantics only
- Report schema failures through `EditorSchemaValidationError` with root, path, node, property, and contributor provenance
- Add immutable `{ content, openStart, openEnd, roots? }` `ContentSlice` values with contextual `state.slice` fitting, closed `fragment.replace`, open `slice.replace`, and detached-parent `fitContent`
- Carry element-owned named roots through content slices, enforce one owner for exclusive roots, preserve shared aliases, remap copies deterministically, and apply owner/root cleanup, cut, undo, and redo atomically
- Reconfigure extension slots and install dynamic extensions atomically, requiring an explicit document migration when the candidate schema rejects the current document
- Activate candidate extensions against isolated state, publish the complete
  extension set atomically, and restore every document, field, anchor, and
  registry fact when activation fails
- Define semantic commands with `defineCommand` and register pure `false | TransactionSpec` handlers through extension `commands: ({ handle, around }) => [...]` factories
- Dispatch command-backed updates through immutable transaction specs, including extension-aware `state.transaction(...)` builders and `tx.command`
- Expose frozen snapshot identities through `snapshot.index.entries()`, `keyAt()`, and `pathOf()` with bounded lazy structural mapping
- Give every live descendant, including text, an editor-scoped `NodeKey`.
  Read it with `editor.key(nodeOrLocation)`, resolve it with
  `editor.read.nodes.path(nodeKey)`, and pass it to generic `NodeTarget`
  reads and updates. Node keys are unique across one editor's roots, while
  path lookup stays scoped to the current editor or view root. Node keys never
  enter values, slices, history, or collaboration payloads.
- Preserve exact `property.*` descriptor inference in packed declarations and
  reject declaration artifacts whose generic `Readonly` arguments were erased.
- Store pending insertion marks only on collapsed text selections and preserve earlier writes across composed commands
- Delete the exact selected node when Backspace or Delete targets a serializable `NodeSelection`, then place a text selection at the nearest surviving sibling
- Let extensions register serializable selection kinds with validation, mapping, range enumeration, replacement, and DOM projection hooks
- Publish one-shot `editor.read.*` and `editor.update.*` APIs with callback forms for grouped work
- Type one-property node mutations as `nodes.set(key, value, options)` and
  `nodes.unset(key, options)`, and accept exact schema-property handles for
  aliased or generic ownership. Keep object-form structural and atomic writes.
  Prefix handles cannot address one property.
- Add schema property copy policy and generated construction/canonical
  presence. Plugin-authored property keys are invariant; closed applications
  may retarget a property but cannot alias its storage key.
- Name installed extension namespace projections
  `EditorInstalledReadGroups` and `EditorInstalledUpdateGroups`
- Keep state-backed read methods available inside active and speculative transactions without exposing them as one-shot editor updates
- Add document replacement, block-relative insertion, live location targets, property matchers, and explicit selection predicates
- Replace the complete serializable document solely through `tx.value.replace({ children, roots, meta, selection })`; remove omitted roots, reset omitted persisted meta, and clear omitted selection
- Add explicit document repair and mutually exclusive mark toggles
- Declare mutually exclusive property groups in schema so toggles,
  canonicalization, history, and collaboration share one invariant
- Resolve extension dependencies and conflicts by descriptor, install required
  dependencies transitively with reference-counted cleanup, and expose typed
  dependency APIs through `editor.extension(descriptor).api`
- Apply a root transaction policy to one descriptor-owned update through
  `editor.extension(descriptor).update(policy).method()`
- Keep root Plite dependency references shallow and non-generic as
  `{ name, enabled? }`. Plate plugin references carry the same sole `name`
  identity. Keep name-keyed capability/provider inference under
  `@platejs/plite/internal`, without recursively encoding exact dependency
  ancestry. Static portals prove name and capability equivalence; runtime
  portals prove exact installed descriptor identity.
- Add descriptor-owned typed extension contributions for package-specific
  contribution channels
- Define package-owned contribution channels with `defineExtensionPoint(...)`
  and collect ordered values through `context.getContributions(...)`
- Intercept core-owned pure reads through descriptor-based extension `read`
  middleware, with transaction-draft state, single delegation, and complete
  generator cleanup
- Group prefixless change callbacks under `on`; declare owner-local methods
  through `read` and `update`, core read wrappers through `readMiddleware`,
  candidate validation through `validate`, and descriptor collections as
  `stateFields`, `effectTypes`, `facetProviders`, and `selectionKinds`
- Infer one exact definition from every `defineExtension(name, definition)`
  author object, carry that sole public definition generic through
  `EditorExtension<D>`, omit undeclared fields from the inferred descriptor,
  and expose `DefinitionOf<typeof Extension>` as the public definition
  extractor
- Use `defineExtension(name, definition)` and
  `defineEditorSchema(name, definition)` as the only extension/schema
  descriptor factories. Descriptors are nominal, immutable values; installing
  the same descriptor twice is idempotent, while divergent same-name
  descriptors reject.
- Return the public `Editor` directly from `createEditor()`. Create root-scoped
  views with `createEditorView(editor, options)` and add live capabilities with
  `editor.install(extension)`; no public runtime wrapper or live `.extend()`
  API exists.
- Expose `EditorExtensionTypeProvider` as the public value-sensitive capability
  bridge and keep higher-kinded encoding, normalized installed capabilities,
  and transitive dependency expansion under `@platejs/plite/internal`
- Infer descriptor-owned element shapes with `ElementOf<typeof Plugin>`;
  remove the two-owner `SchemaElementOf` and `SchemaElementShapeOf` extractors
- Keep immutable author inputs in the descriptor factory closure instead of an
  extension `config` channel
- Construct missing root and nested content only from authored
  `SchemaContent.default` declarations; remove the separate default-block
  option and implicit paragraph fallback
- Accept document `maxLength` only when creating the editor
- Resolve functional extension APIs against each editor view root and preserve
  the complete root-scoped read surface, including exported selection slices
- Declare every extension API through an `api` factory, including
  context-free API objects; contextual factories receive one
  `{ editor, root, getContributions }` object
- Keep merge, selectability, and exported-slice policy on typed `editorReads`
  descriptors instead of extension-specific root hooks
- Name the model selection projection `primaryRange`
- Initialize editors synchronously through `initialValue` or an editor-context callback and publish non-cancellable commit contexts with the resulting immutable snapshot
- Derive complete raw-schema identity when `id` and `version` are omitted, and expose a non-null derived or named identity from `editor.read.schema.identity()`
- Freeze pure descriptor namespaces and preserve exact custom property values
  and defaults from inline `validate` predicates paired with a positive-integer
  `validationVersion`
- Address compiled element and property identity through nominal
  `SchemaElementHandle` and `SchemaPropertyHandle` values. Property handles
  retain persisted key, placement, compiled id, and inferred value type.
- Compile deterministic closed-application overrides before relationships.
  Element type, content, groups, and property targets may change; ambiguous
  overrides reject instead of using source order.
- Serialize deterministic schema contracts, classify structural diffs, and
  restore validator-backed runtime schemas from committed contracts. Contract
  readers recompute the structural fingerprint from authoritative content, and
  restoration rejects any derived table that differs from the source
  contributions.

**Migration:** Replace `@platejs/slate` with `@platejs/plite` and migrate Slate
transforms and operations to `editor.read`, `editor.update`, or active
transaction APIs. Replace `defineExtension({ name, ...definition })` with
`defineExtension(name, definition)`, pass a name to `defineEditorSchema`, call
`createEditorView(editor, options)` with the editor itself, and replace live
`editor.extend(extension)` with `editor.install(extension)`. Register state
fields through a nominal extension's `stateFields` collection instead of
passing field handles as extensions.
