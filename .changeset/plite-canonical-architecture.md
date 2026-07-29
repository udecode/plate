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
- Define semantic commands with `defineCommand` and register pure `false | TransactionSpec` handlers through extension `commands: ({ handle, around }) => [...]` factories
- Dispatch command-backed updates through immutable transaction specs, including extension-aware `state.transaction(...)` builders and `tx.command`
- Expose frozen snapshot identities through `snapshot.index.entries()`, `idAt()`, and `pathOf()` with bounded lazy structural mapping
- Store pending insertion marks only on collapsed text selections and preserve earlier writes across composed commands
- Delete the exact selected node when Backspace or Delete targets a serializable `NodeSelection`, then place a text selection at the nearest surviving sibling
- Let extensions register serializable selection kinds with validation, mapping, range enumeration, replacement, and DOM projection hooks
- Publish one-shot `editor.read.*` and `editor.update.*` APIs with callback forms for grouped work
- Keep state-backed read methods available inside active and speculative transactions without exposing them as one-shot editor updates
- Add document replacement, block-relative insertion, live location targets, property matchers, and explicit selection predicates
- Replace the complete serializable document solely through `tx.value.replace({ children, roots, meta, selection })`; remove omitted roots, reset omitted persisted meta, and clear omitted selection
- Add explicit document repair and mutually exclusive mark toggles
- Declare mutually exclusive property groups in schema so toggles,
  canonicalization, history, and collaboration share one invariant
- Resolve extension dependencies and conflicts by descriptor, install required
  dependencies transitively with reference-counted cleanup, and expose typed
  dependency APIs through `editor.getApi(descriptor)`
- Add descriptor-owned typed extension contributions for package-specific
  contribution channels
- Define package-owned contribution channels with `defineExtensionPoint(...)`
  and collect ordered values through `context.getContributions(...)`
- Intercept core-owned pure reads through descriptor-based extension `read`
  middleware, with transaction-draft state, single delegation, and complete
  generator cleanup
- Group change callbacks under `on`, use `config` as the immutable extension
  input, name descriptor collections as `stateFields`, `effectTypes`,
  `facetProviders`, and `selectionKinds`, and defer published-state work through
  `afterPublish`
- Resolve functional extension APIs against each editor view root and preserve
  the complete root-scoped read surface, including exported selection slices
- Keep merge, selectability, and exported-slice policy on typed `editorReads`
  descriptors instead of extension-specific root hooks
- Name the model selection projection `primaryRange`
- Initialize editors synchronously through `initialValue` or an editor-context callback and publish non-cancellable commit contexts with the resulting immutable snapshot
- Derive complete raw-schema identity when `id` and `version` are omitted, and expose a non-null derived or named identity from `editor.read.schema.identity()`
- Freeze pure descriptor namespaces and infer custom property values from inline `validate` predicates paired with a positive-integer `validationVersion`

**Migration:** Replace `@platejs/slate` with `@platejs/plite` and migrate Slate
transforms and operations to `editor.read`, `editor.update`, or active
transaction APIs.
