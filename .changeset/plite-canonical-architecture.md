---
"@platejs/plite": major
---

- Add immutable `TransactionSpec` and versioned `DocumentChange` APIs for atomic, serializable updates, with explicit primary and named-root changes and no public primary-root sentinel
- Compile closed schemas from extension `schema` declarations with shared `property.*` laws, structural content fitting, stable identity, and typed element, group, root, and property queries
- Publish derived schema identities as `{ kind: 'derived', fingerprint }` and application-named lineage as `{ kind: 'named', id, version, fingerprint }`; fingerprints cover compiled semantics only
- Report schema failures through `EditorSchemaValidationError` with root, path, node, property, and contributor provenance
- Add immutable `ContentSlice` values with contextual `state.slice` fitting, closed `fragment.replace`, open `slice.replace`, and detached-parent `fitContent`
- Reconfigure extension slots and install dynamic extensions atomically, requiring an explicit document migration when the candidate schema rejects the current document
- Define semantic commands with `defineCommand` and register pure `false | TransactionSpec` handlers through extension `commands: ({ handle, around }) => [...]` factories
- Dispatch command-backed updates through immutable transaction specs, including extension-aware `state.transaction(...)` builders and `tx.command`
- Expose frozen snapshot identities through `snapshot.index.entries()`, `idAt()`, and `pathOf()` with bounded lazy structural mapping
- Store pending insertion marks only on collapsed text selections and preserve earlier writes across composed commands
- Publish one-shot `editor.read.*` and `editor.update.*` APIs with callback forms for grouped work
- Add document replacement, block-relative insertion, live location targets, property matchers, and explicit selection predicates
- Add explicit document repair and mutually exclusive mark toggles
